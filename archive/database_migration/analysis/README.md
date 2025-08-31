Analysis Folder
===============

Purpose
-------
Holds raw & processed inputs that inform migration design: schema snapshots, index usage, slow query samples, row counts, cardinality stats, and before/after performance baselines.

Typical Artifacts
-----------------
- *_schema_dump.sql – pg_dump schema snapshots
- *_index_usage.json – pg_stat_user_indexes export
- *_table_stats.csv – row counts & size
- *_slow_queries.log – extracted slow query samples
- *_plan_explain.txt – EXPLAIN (ANALYZE, BUFFERS) outputs

Naming Convention
-----------------
YYYYMMDDHHMMSS__category_description.ext

Guidelines
----------
- Keep raw exports immutable; derive summaries in separate files.
- Sanitize any sensitive data (no customer PII in committed artifacts).
- Link each analysis file to an open migration proposal in docs/ when applicable.

Suggested Commands (Reference Only)
-----------------------------------
```bash
pg_dump --schema-only $DB_URL > $(date +%Y%m%d%H%M%S)__schema_dump.sql
psql $DB_URL -c "SELECT * FROM pg_stat_user_indexes" -A -F',' > $(date +%Y%m%d%H%M%S)__index_usage.csv
```
