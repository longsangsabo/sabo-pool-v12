# Development Guidelines
**Updated**: Sun Aug 31 04:12:34 UTC 2025

## Migration Management
### DO
- Document all schema changes
- Use descriptive migration names
- Test migrations on staging first
- Follow naming conventions

### DON'T
- Create duplicate table definitions
- Skip migration documentation
- Modify production directly
- Delete migration files

## File Organization
- Migrations: `database-management/current/`
- Archives: `database-management/archive/`
- Docs: `database-management/documentation/`
- Tools: `database-management/tools/`

## Code Standards
- Use TypeScript for all new code
- Follow ESLint configuration
- Include unit tests
- Document API changes
