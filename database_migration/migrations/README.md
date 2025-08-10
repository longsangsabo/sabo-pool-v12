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
