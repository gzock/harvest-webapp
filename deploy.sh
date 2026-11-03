#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: ./deploy.sh --bucket BUCKET --distribution-id ID --config FILE [--artifact DIRECTORY] [--execute]

Prints the deployment commands by default. --execute uploads an already built
artifact and invalidates the HTML/service-worker manifests. No files are deleted
from S3, so clients using an earlier PWA version can still load their assets.
USAGE
}

artifact="$(cd "$(dirname "$0")" && pwd)/dist/harvest-webapp/browser"
bucket=""
distribution_id=""
runtime_config=""
execute=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --bucket|--distribution-id|--artifact|--config)
      [[ $# -ge 2 && -n "$2" ]] || { usage >&2; exit 2; }
      case "$1" in
        --bucket) bucket=$2 ;;
        --distribution-id) distribution_id=$2 ;;
        --artifact) artifact=$2 ;;
        --config) runtime_config=$2 ;;
      esac
      shift 2
      ;;
    --execute) execute=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) usage >&2; exit 2 ;;
  esac
done

[[ "$bucket" =~ ^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$ ]] || { echo 'A target S3 bucket is required.' >&2; exit 2; }
[[ "$distribution_id" =~ ^[A-Z0-9]+$ ]] || { echo 'A target CloudFront distribution ID is required.' >&2; exit 2; }
[[ -f "$artifact/index.html" && -f "$artifact/ngsw.json" && -f "$artifact/ngsw-worker.js" ]] || {
  echo 'Expected a production browser artifact with index.html, ngsw.json and ngsw-worker.js. Run npm run build first.' >&2
  exit 2
}
[[ -f "$runtime_config" ]] || { echo 'A runtime configuration JSON file is required (--config FILE).' >&2; exit 2; }
node --input-type=module - "$runtime_config" "$artifact" <<'NODE'
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, sep } from 'node:path';
const config = JSON.parse(readFileSync(process.argv[2], 'utf8'));
if (!config || typeof config !== 'object' || typeof config.apiBaseUrl !== 'string' ||
    typeof config.auth?.userPoolId !== 'string' || typeof config.auth?.userPoolClientId !== 'string') {
  throw new Error('Invalid deployment runtime configuration shape.');
}
const api = new URL(config.apiBaseUrl);
if (api.protocol !== 'https:' || api.username || api.password || api.search || api.hash ||
    !/^[a-z]{2}(?:-gov)?-[a-z]+-\d_[A-Za-z0-9]+$/.test(config.auth.userPoolId) ||
    !/^[a-z0-9]{1,128}$/.test(config.auth.userPoolClientId)) {
  throw new Error('Invalid deployment runtime configuration: HTTPS API URL and Cognito pool/client IDs are required.');
}
const artifact = resolve(process.argv[3]);
const manifest = JSON.parse(readFileSync(resolve(artifact, 'ngsw.json'), 'utf8'));
if (manifest.index !== '/index.html' || !manifest.hashTable?.['/index.html'] || manifest.hashTable['/assets/runtime-config.json']) {
  throw new Error('Invalid PWA manifest: index must be hashed and runtime configuration excluded.');
}
for (const [url, expected] of Object.entries(manifest.hashTable)) {
  const path = resolve(artifact, '.' + url);
  if (!url.startsWith('/') || !path.startsWith(artifact + sep)) throw new Error('Invalid manifest asset path');
  if (createHash('sha1').update(readFileSync(path)).digest('hex') !== expected) {
    throw new Error(`Artifact does not match its PWA manifest: ${url}`);
  }
}
NODE
artifact="$(cd "$artifact" && pwd)"
if "$execute"; then command -v aws >/dev/null; fi

run() {
  printf '%q ' "$@"
  printf '\n'
  if "$execute"; then "$@"; fi
}

destination="s3://$bucket"
# Angular emits content-hashed JS/CSS/media. Publish all assets before exposing
# the new service-worker manifest or entry point. The source artifact is read-only.
run aws s3 sync "$artifact/" "$destination/" \
  --exclude '*' --include '*-????????.js' --include '*-????????.css' --include 'media/*-????????.*' \
  --cache-control 'public,max-age=31536000,immutable'
# Same-size mutable files with an older mtime must still replace the current
# object on rollback. s3 sync would silently skip those files.
run aws s3 cp "$artifact/" "$destination/" --recursive \
  --exclude '*-????????.js' --exclude '*-????????.css' --exclude 'media/*-????????.*' \
  --exclude 'index.html' --exclude 'ngsw.json' --exclude 'ngsw-worker.js' --exclude 'assets/runtime-config.json' \
  --exclude 'safety-worker.js' --exclude 'worker-basic.min.js' \
  --cache-control 'public,max-age=3600'
for worker in ngsw-worker.js safety-worker.js worker-basic.min.js; do
  if [[ -f "$artifact/$worker" ]]; then
    run aws s3 cp "$artifact/$worker" "$destination/$worker" --cache-control 'no-cache,no-store,must-revalidate' --content-type 'application/javascript'
  fi
done
run aws s3 cp "$runtime_config" "$destination/assets/runtime-config.json" --cache-control 'no-cache,no-store,must-revalidate' --content-type 'application/json'
run aws s3 cp "$artifact/ngsw.json" "$destination/ngsw.json" --cache-control 'no-cache,no-store,must-revalidate' --content-type 'application/json'
run aws s3 cp "$artifact/index.html" "$destination/index.html" --cache-control 'no-cache,no-store,must-revalidate' --content-type 'text/html'
# Include SPA deep links and cache-busting query variants. Cached HTML/error
# responses may exist under paths other than /index.html.
run aws cloudfront create-invalidation --distribution-id "$distribution_id" --paths '/*'
