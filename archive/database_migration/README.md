Database Migration Project
==========================

Purpose
-------
Centralized workspace for designing, generating, testing, documenting, executing, and (if needed) rolling back database schema and data migrations for the Sabo Pool Arena system.

Scope
-----
Supports PostgreSQL (Supabase) migrations impacting schema, seed data, performance indexes, and data correction scripts.

Directory Structure
-------------------
analysis/   Raw inputs & derived analysis (query plans, index usage, row counts, diff reports)
+migrations/ Approved forward migration scripts (immutable once merged)
rollback/   Companion rollback scripts or procedures (when feasible)
tests/      Validation scripts & automation harness
docs/       Design notes, decision logs, architectural rationale

Workflow
--------
1. Capture & Analyze (analysis/) – Gather current state metrics & diffs.
2. Design & Spec (docs/) – Document intent, risk, rollback strategy.
3. Draft Migration (migrations/) – Create timestamped migration script using template.
4. Draft Rollback (rollback/) – Provide safe revert where realistic.
5. Test (tests/) – Apply to shadow DB / local ephemeral DB; run integrity checks & performance baselines.
6. Review – Peer review for correctness, performance impact, and rollback clarity.
7. Apply – Deploy via CI/CD or manual controlled execution.
8. Verify – Post-run checks & metrics comparison; document results.
9. Monitor – Track after-effects, errors, slow queries.

Naming Conventions
------------------
Migration file: YYYYMMDDHHMMSS__short_snake_summary.sql
Rollback file:  YYYYMMDDHHMMSS__short_snake_summary.rollback.sql (or procedural doc)
Analysis artifact: YYYYMMDDHHMMSS__context.ext (e.g., 20250810_index_usage.json)

General Guidelines
------------------
- Migrations must be idempotent OR clearly non-idempotent with guards.
- Never drop data blindly; archive or snapshot if destructive.
- Prefer transactional DDL when possible; annotate when not (e.g., concurrent index creation).
- Include a -- MIGRATION_METADATA block header (see template below).
- Ensure lock impact is minimized (use CONCURRENT where supported; break large operations into batches).

Template Snippet (Forward Migration)
-----------------------------------
```sql
-- MIGRATION_METADATA
-- id: 20250810123045__add_new_table_example
-- author: <your_name>
-- created: 2025-08-10
-- description: Adds example_table to store XYZ.
-- safe_retries: true
-- requires: 20250809120000__previous_dep
-- rollback: 20250810123045__add_new_table_example.rollback.sql
-- notes: Ensure app deploy includes model update.
-- /MIGRATION_METADATA

BEGIN;

CREATE TABLE IF NOT EXISTS example_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
```

Template Snippet (Rollback)
---------------------------
```sql
-- ROLLBACK for 20250810123045__add_new_table_example
BEGIN;
DROP TABLE IF EXISTS example_table;
COMMIT;
```

Quality Checklist Before Merge
------------------------------
- [ ] Script passes lint/static checks.
- [ ] Applies cleanly to latest main baseline.
- [ ] Tests include forward + rollback (if feasible).
- [ ] Performance impact reviewed (indexes, row rewrites, locks).
- [ ] Rollback documented even if not automated.
- [ ] Idempotency or guard clauses present where needed.

Future Enhancements
-------------------
- Automated diff generator feeding migrations.
- Shadow database CI pipeline.
- Drift detection job (compare prod vs expected schema hash).
