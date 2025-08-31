Rollback Folder
===============

Purpose
-------
Holds rollback SQL or procedural instructions enabling safe reversal of a migration where feasible.

Philosophy
----------
Not every migration can be perfectly reversible (e.g., irreversible data transformations). In such cases, document mitigation steps instead of a direct rollback script.

File Naming
-----------
YYYYMMDDHHMMSS__short_snake_summary.rollback.sql

Template
--------
```sql
-- ROLLBACK_METADATA
-- target_migration: 20250810123045__add_new_table_example
-- author: <your_name>
-- created: 2025-08-10
-- strategy: drop table
-- data_loss: acceptable|none|high (explain below)
-- notes: <additional context>
-- /ROLLBACK_METADATA
BEGIN;
-- reversal statements
COMMIT;
```

Guidelines
----------
- Validate rollback in a disposable environment before documenting as supported.
- If data loss risk is high, add explicit warnings.
- For complex transformations, provide forward-compatible reapplication path instead of naive reversal.
