import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const deploy = resolve(dirname(fileURLToPath(import.meta.url)), '../deploy.sh');
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'harvest-web-deploy-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const artifact = join(root, 'browser');
  const bin = join(root, 'bin');
  mkdirSync(artifact);
  mkdirSync(bin);
  const config = join(root, 'config.json');
  const log = join(root, 'aws.jsonl');
  writeFileSync(join(artifact, 'index.html'), '<html>tested artifact</html>');
  writeFileSync(join(artifact, 'ngsw-worker.js'), '// worker');
  const hash = createHash('sha1').update(readFileSync(join(artifact, 'index.html'))).digest('hex');
  writeFileSync(join(artifact, 'ngsw.json'), JSON.stringify({ index: '/index.html', hashTable: { '/index.html': hash } }));
  const validConfig = { apiBaseUrl: 'https://api.example.invalid/v1', auth: { userPoolId: 'ap-northeast-1_Test', userPoolClientId: 'test123' } };
  writeFileSync(config, JSON.stringify(validConfig));
  writeFileSync(join(bin, 'aws'), `#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const args = process.argv.slice(2);
fs.appendFileSync(process.env.DEPLOY_TEST_LOG, JSON.stringify(args) + '\\n');
// Model the documented s3 sync same-size/mtime decision for a mutable asset.
// The first hashed-assets sync has --include and does not select this file.
if (process.env.DEPLOY_TEST_REMOTE && args[0] === 's3' && !args.includes('--include') &&
    (args[1] === 'sync' || (args[1] === 'cp' && args.includes('--recursive')))) {
  const source = path.join(args[2], 'assets/logo.svg');
  const target = process.env.DEPLOY_TEST_REMOTE;
  const local = fs.statSync(source);
  const remote = fs.statSync(target);
  if (args[1] === 'cp' || local.size !== remote.size || local.mtimeMs > remote.mtimeMs) fs.copyFileSync(source, target);
}
process.exit(Number(process.env.DEPLOY_TEST_EXIT || 0));
`, { mode: 0o755 });
  const run = (extra = [], env = {}) => spawnSync('bash', [deploy, '--bucket', 'example-artifacts', '--distribution-id', 'EXAMPLE123', '--artifact', artifact, '--config', config, ...extra], { encoding: 'utf8', env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, DEPLOY_TEST_LOG: log, ...env } });
  const calls = () => existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n').map(line => JSON.parse(line)) : [];
  return { root, artifact, config, validConfig, run, calls };
}

test('dry run does not invoke AWS', t => {
  const f = fixture(t);
  const result = f.run();
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(f.calls(), []);
  assert.match(result.stdout, /cloudfront create-invalidation/);
});

test('explicit execution uploads assets before entrypoints and invalidates deep links/query variants', t => {
  const f = fixture(t);
  assert.equal(f.run(['--execute']).status, 0);
  const calls = f.calls();
  const upload = name => calls.findIndex(args => args[1] === 'cp' && args[3] === `s3://example-artifacts/${name}`);
  assert.equal(calls[0][1], 'sync');
  assert.ok(upload('assets/runtime-config.json') < upload('ngsw.json'));
  assert.ok(upload('ngsw.json') < upload('index.html'));
  assert.ok(calls[upload('assets/runtime-config.json')].includes('no-cache,no-store,must-revalidate'));
  assert.deepEqual(calls.at(-1), ['cloudfront', 'create-invalidation', '--distribution-id', 'EXAMPLE123', '--paths', '/*']);
  assert.ok(calls.every(args => !args.includes('--delete')));
});

test('rejects runtime configurations rejected by the production application', t => {
  const f = fixture(t);
  for (const bad of [
    { ...f.validConfig, apiBaseUrl: 'http://localhost:3000' },
    { ...f.validConfig, apiBaseUrl: 'https://user:password@api.example.invalid' },
    { ...f.validConfig, auth: { ...f.validConfig.auth, userPoolClientId: 123 } },
    { ...f.validConfig, auth: { ...f.validConfig.auth, userPoolClientId: 'UPPERCASE' } },
    { ...f.validConfig, auth: { ...f.validConfig.auth, userPoolClientId: 'a'.repeat(129) } },
    { ...f.validConfig, auth: { ...f.validConfig.auth, userPoolId: 'invalid' } },
  ]) {
    writeFileSync(f.config, JSON.stringify(bad));
    assert.notEqual(f.run(['--execute']).status, 0);
  }
  assert.deepEqual(f.calls(), []);
});

test('rejects changed PWA artifacts before invoking AWS', t => {
  const f = fixture(t);
  writeFileSync(join(f.artifact, 'index.html'), 'different build');
  const result = f.run(['--execute']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Artifact does not match/);
  assert.deepEqual(f.calls(), []);
});

test('failed AWS command stops deployment and returns its exit status', t => {
  const f = fixture(t);
  assert.equal(f.run(['--execute'], { DEPLOY_TEST_EXIT: '17' }).status, 17);
  assert.equal(f.calls().length, 1);
});

test('rollback replaces same-size mutable assets even when the artifact mtime is older', t => {
  const f = fixture(t);
  mkdirSync(join(f.artifact, 'assets'));
  const asset = join(f.artifact, 'assets/logo.svg');
  const remote = join(f.root, 'remote-logo.svg');
  writeFileSync(asset, '<svg>old</svg>');
  writeFileSync(remote, '<svg>new</svg>');
  utimesSync(asset, new Date('2020-01-01'), new Date('2020-01-01'));
  const manifestFile = join(f.artifact, 'ngsw.json');
  const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
  manifest.hashTable['/assets/logo.svg'] = createHash('sha1').update(readFileSync(asset)).digest('hex');
  writeFileSync(manifestFile, JSON.stringify(manifest));
  const result = f.run(['--execute'], { DEPLOY_TEST_REMOTE: remote });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(remote, 'utf8'), '<svg>old</svg>');
});
