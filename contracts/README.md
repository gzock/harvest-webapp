# API contract snapshot

`openapi.json` is copied from `harvest-serverless-api/contracts/openapi.json`. The
adjacent `openapi.source.json` records the source repository HEAD and schema
SHA-256. `sourceWorkingTreeDirty: true` means the snapshot includes uncommitted
backend changes; the schema hash identifies the exact input, not the HEAD alone.

After changing the backend API:

1. Run `python scripts/export_contract.py` in the backend repository.
2. Run `npm run api:sync` here (or pass a source file path after `--`).
3. Review and commit the snapshot, provenance, and generated TypeScript together.
4. Run `npm run api:check` and `npm run typecheck`.

`api:generate` regenerates from the checked-in snapshot and needs no backend
checkout. `api:check` checks both the snapshot hash and generated output, also
without backend access or network requests.

The pinned generator currently supports TypeScript 5. It lives in the local
`tools/api-codegen` development package with its own TypeScript 5.9.3 dependency.
Angular continues to compile with TypeScript 6.0.3; no peer requirements are
bypassed. Remove this separation when the generator officially supports TS6.

Generated request and job/upload response schemas are used at service boundaries.
Legacy response shapes whose OpenAPI schemas remain open are still represented
by the existing feature models; generation does not invent their fields.
