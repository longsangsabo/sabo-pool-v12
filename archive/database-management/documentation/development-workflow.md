# Development Workflow

## Migration Strategy

### Current State
- **Legacy migrations**: Moved to `database-management/legacy/`
- **Clean start**: New migrations begin from `00000000000001_initial_setup.sql`
- **Database**: Unchanged (production safe)

### New Migration Process
1. **Create migration**: `supabase migration new <descriptive_name>`
2. **Write SQL**: Add your schema changes
3. **Test locally**: `supabase db reset` (local only)
4. **Review**: Check migration before pushing
5. **Deploy**: Apply to staging first

### File Naming Convention
```
YYYYMMDDHHMMSS_descriptive_name.sql
```

### Migration Best Practices
- One logical change per migration
- Always include rollback strategy
- Test on staging environment
- Document complex changes
- Never modify existing migrations

## Database Schema Management

### Schema Documentation
- Keep schema docs updated
- Document all table relationships
- Maintain API documentation
- Track breaking changes

### Safety Rules
- Never drop tables without backup
- Always test migrations locally first
- Use transactions for complex changes
- Keep migration files small and focused
