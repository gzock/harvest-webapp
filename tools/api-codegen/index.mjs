import openapiTS, { astToString } from 'openapi-typescript';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
export const generatorVersions = {
  generator: `openapi-typescript@${require('openapi-typescript/package.json').version}`,
  generatorTypeScript: require('typescript/package.json').version,
};

// The generator's supported TS5 peer stays isolated from Angular's TS6 compiler.
export async function generateTypes(schema) {
  return astToString(await openapiTS(schema, { alphabetize: true, defaultNonNullable: false }));
}
