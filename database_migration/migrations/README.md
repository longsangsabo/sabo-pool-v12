Migrations Folder
=================

Purpose
-------
Authoritative forward-only migration scripts applied in chronological order.

Rules
-----
- Once merged, a migration script is immutable (create a new one to change behavior).
- Each file must include a MIGRATION_METADATA header block.
- Avoid combining unrelated changes; prefer one concern per migration.
- Use transactions unless performing operations that forbid them (note in metadata).

File Naming
-----------
YYYYMMDDHHMMSS__short_snake_summary.sql

Metadata Header Template
------------------------
```sql
-- MIGRATION_METADATA
-- id: 20250810123045__add_new_table_example
-- author: <your_name>
-- created: 2025-08-10
-- description: <concise change summary>
-- safe_retries: true|false
-- requires: <id>|none
-- rollback: <rollback_file_or_doc>
-- notes: <special considerations>
-- /MIGRATION_METADATA
```

Transactional Pattern
---------------------
```sql
BEGIN;
-- statements
COMMIT;
```

Non-Transactional / Concurrent Example
--------------------------------------
```sql
-- CREATE INDEX CONCURRENTLY idx_sample ON sample_table (col);
```

Pre-Deployment Checklist
------------------------
- [ ] No direct hard deletes without archive.
- [ ] Indexes sized and justified.
- [ ] Large table rewrites batched or scheduled off-peak.
- [ ] Rollback plan recorded.
- [ ] Tested in shadow DB (see tests/).

Migration Execution Guide
=========================

Files
-----
001_migration_functions.sql  Core migration & rollback functions
002_validation_scripts.sql   Validation & reporting
003_backward_compatibility.sql  Legacy views for gradual cutover
004_master_migration.sql     Orchestrator function (execute_safe_migration)
005_cleanup_procedures.sql   Final archival & (later) table drops

Recommended Order
-----------------
1. Apply optimized schema (already done Phase 1)
2. psql -f 001_migration_functions.sql
3. psql -f 002_validation_scripts.sql
4. psql -f 003_backward_compatibility.sql
5. psql -f 004_master_migration.sql
6. SELECT execute_safe_migration(TRUE); -- dry run review logs
7. SELECT execute_safe_migration(FALSE); -- live run
8. SELECT generate_migration_report(); -- confirm
9. After stable period & app switched → psql -f 005_cleanup_procedures.sql (edit first)

Logging
-------
Table: migration_operation_log records each step.
Query: SELECT * FROM migration_operation_log ORDER BY id DESC LIMIT 50;

Resumability
------------
migration_batch_progress tracks last_cursor for incremental reruns (profiles, tournaments). Clear a row to force full rescan.

Rollback
--------
Function: rollback_migration() (limited to profiles example; extend as needed before production).

Safety Checklist Before Cleanup
-------------------------------
- [ ] All validation functions return OK / acceptable WARN only
- [ ] Application reads switched to new tables or views
- [ ] Full logical backup created & verified
- [ ] Stakeholders sign-off

Performance Notes
-----------------
Batch sizes configurable (profiles/tournaments). Adjust based on lock monitoring & I/O.

Next Improvements
-----------------
- Extend rollback coverage to all domains
- Add per-batch timing metrics
- Integrate with CI for automated dry-runs
