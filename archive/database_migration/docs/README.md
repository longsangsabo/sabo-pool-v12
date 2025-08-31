Docs Folder
===========

Purpose
-------
Holds human-readable design documents, proposals, decision records (ADRs), and post-migration reports.

Recommended Documents
---------------------
- proposal_<migration_id>.md – Rationale, risk, alternatives.
- adr_<sequence>_<topic>.md – Architectural decisions with context & consequences.
- postmortem_<migration_id>.md – Outcome metrics & lessons.

ADR Template
------------
```markdown
# ADR <sequence>: <Title>
Date: 2025-08-10
Status: Proposed | Accepted | Superseded by ADR X | Deprecated

Context
-------
<background & forces>

Decision
--------
<what was decided>

Consequences
------------
<positive, negative, neutral outcomes>

Alternatives Considered
-----------------------
- Option A – pros/cons
- Option B – pros/cons
```

Linkage
-------
Each proposal should reference the analysis artifacts and target migration ID.
