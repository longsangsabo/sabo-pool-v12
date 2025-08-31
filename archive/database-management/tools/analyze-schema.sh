#!/bin/bash
# Schema analysis tool (safe - no database changes)

echo "🔍 Analyzing codebase for schema references..."

# Find all SQL files
find . -name "*.sql" -type f | head -20

# Find TypeScript files with database queries
grep -r "from.*(" --include="*.ts" --include="*.js" . | head -10

echo "✅ Analysis complete - check output above"
