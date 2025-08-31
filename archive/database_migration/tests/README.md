Tests Folder
============

Purpose
-------
Automates validation that migrations apply cleanly, maintain integrity, and (optionally) improve or preserve performance.

Test Categories
---------------
1. Syntax / Lint – Static validation of SQL formatting & forbidden patterns.
2. Apply / Reapply – Ensure forward migration applies to baseline and does not reapply unexpectedly (idempotency checks where intended).
3. Integrity – Foreign keys, constraints, row counts, enum values, data shape.
4. Performance – Before/after EXPLAIN (ANALYZE) for targeted queries.
5. Rollback – Apply migration + rollback (if available) and confirm schema hash restored.

Suggested Script Pattern
------------------------
```bash
#!/usr/bin/env bash
set -euo pipefail

DB_URL="$1"  # ephemeral test DB

echo "Applying migrations..."
for f in ../migrations/*.sql; do
  psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$f"
done

echo "Running integrity checks..."
psql "$DB_URL" -v ON_ERROR_STOP=1 -f integrity_checks.sql
```

Integrity Check Ideas
---------------------
- Orphan detection queries
- Constraint existence queries
- Expected enum value sets
- Index existence & usage (pg_stat_user_indexes)

CI Integration
--------------
Add a job that provisions a temporary PostgreSQL instance, runs tests, and stores artifacts (plans, timings) for review.
