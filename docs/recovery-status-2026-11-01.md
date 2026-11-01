# Recovery status (2026-11-01)

This candidate was reconstructed from retained Codex command and diff records after the previous uncommitted workspace was reset. Whole-source byte identity with the previous final workspace is not asserted. The source recovery includes documented import repairs and re-execution of formatting tools. The npm lock was regenerated, not recovered byte-for-byte.

Fresh validation: 71 Vitest tests, strict app/spec/template checks, production build, and lint passed. Browser validation passed 10 scenarios and deployment checks passed 5 tests; see [browser recovery validation](validation/browser-recovery-2026-11-01.md). A newly added browser-test wait fixes a Material overlay animation race; historical failure and the new change are documented separately.

Current npm audit reports 20 moderate affected packages (zero high/critical), involving the minimatch advisory GHSA-g3hv-75wg-m249 through development tooling. The previous audit-zero report is historical and does not describe this recovered candidate. Dependency remediation and the requested renewed compatibility review remain follow-up work; this branch is a recovery baseline, not a deployment approval.

No AWS deployment, live user authentication, production data migration, or production PWA upgrade test was performed. Backend recovery validated 562 tests and exact historical SHA-256 matches for uv.lock, template.yaml and OpenAPI.
