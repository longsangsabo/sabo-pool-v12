#!/bin/bash

# 🧹 SABO POOL V12 - CODEBASE CLEANUP (SAFE MODE)
# Dọn dẹp migration files và code, KHÔNG đụng tới database

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🧹 SABO POOL V12 - SAFE CODEBASE CLEANUP${NC}"
echo -e "${CYAN}=======================================${NC}"

# Safety check
echo -e "${RED}⚠️  SAFETY MODE: ONLY CODEBASE CLEANUP${NC}"
echo -e "${RED}   - NO database modifications${NC}"
echo -e "${RED}   - NO migration executions${NC}"
echo -e "${RED}   - NO Supabase changes${NC}"
echo -e "${GREEN}   - ONLY file organization${NC}"
echo ""

# Get confirmation
read -p "🔍 Proceed with SAFE codebase cleanup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Cleanup cancelled by user${NC}"
    exit 0
fi

# ============================================================================
# 📊 PHASE 1: CODEBASE ANALYSIS
# ============================================================================

echo -e "\n${YELLOW}📊 PHASE 1: ANALYZING CODEBASE${NC}"

# Create directories for organization
CLEANUP_DIR="./codebase-cleanup"
ARCHIVE_DIR="$CLEANUP_DIR/archive"
CURRENT_DIR="$CLEANUP_DIR/current"
DOCS_DIR="$CLEANUP_DIR/documentation"
LOGS_DIR="$CLEANUP_DIR/logs"

mkdir -p "$ARCHIVE_DIR" "$CURRENT_DIR" "$DOCS_DIR" "$LOGS_DIR"

# Count current files
MIGRATION_COUNT=$(find ./supabase/migrations -name "*.sql" 2>/dev/null | wc -l)
FUNCTION_COUNT=$(find ./supabase/functions -type d -mindepth 1 2>/dev/null | wc -l)
TOTAL_FILES=$(find . -type f \( -name "*.sql" -o -name "*.ts" -o -name "*.js" -o -name "*.json" \) | wc -l)

echo -e "${BLUE}📋 Current Codebase:${NC}"
echo -e "${CYAN}   - Migration files: $MIGRATION_COUNT${NC}"
echo -e "${CYAN}   - Edge functions: $FUNCTION_COUNT${NC}"
echo -e "${CYAN}   - Total source files: $TOTAL_FILES${NC}"

# ============================================================================
# 📦 PHASE 2: SAFE ARCHIVING
# ============================================================================

echo -e "\n${YELLOW}📦 PHASE 2: ARCHIVING OLD MIGRATIONS${NC}"

# Create timestamped archive
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MIGRATION_ARCHIVE="$ARCHIVE_DIR/migrations_$TIMESTAMP"
mkdir -p "$MIGRATION_ARCHIVE"

# Copy (not move) migration files to archive
if [ -d "./supabase/migrations" ] && [ "$(ls -A ./supabase/migrations)" ]; then
    echo -e "${BLUE}📦 Copying migration files to archive...${NC}"
    cp -r ./supabase/migrations/* "$MIGRATION_ARCHIVE/" 2>/dev/null || true
    ARCHIVED_COUNT=$(find "$MIGRATION_ARCHIVE" -name "*.sql" | wc -l)
    echo -e "${GREEN}✅ Archived $ARCHIVED_COUNT migration files${NC}"
else
    echo -e "${YELLOW}ℹ️  No migration files found to archive${NC}"
fi

# Archive edge functions for reference
if [ -d "./supabase/functions" ] && [ "$(ls -A ./supabase/functions)" ]; then
    echo -e "${BLUE}📦 Copying edge functions to archive...${NC}"
    cp -r ./supabase/functions "$ARCHIVE_DIR/functions_$TIMESTAMP" 2>/dev/null || true
    echo -e "${GREEN}✅ Archived edge functions${NC}"
fi

# ============================================================================
# 📋 PHASE 3: MIGRATION ANALYSIS
# ============================================================================

echo -e "\n${YELLOW}📋 PHASE 3: ANALYZING MIGRATIONS${NC}"

# Analyze migration patterns
echo -e "${BLUE}🔍 Analyzing migration patterns...${NC}"

if [ -d "$MIGRATION_ARCHIVE" ]; then
    # Find table creation patterns
    grep -r "CREATE TABLE.*tournaments" "$MIGRATION_ARCHIVE" | wc -l > "$LOGS_DIR/tournament_creates.log" 2>/dev/null || echo "0" > "$LOGS_DIR/tournament_creates.log"
    grep -r "CREATE TABLE.*challenges" "$MIGRATION_ARCHIVE" | wc -l > "$LOGS_DIR/challenge_creates.log" 2>/dev/null || echo "0" > "$LOGS_DIR/challenge_creates.log"
    grep -r "CREATE TABLE.*profiles" "$MIGRATION_ARCHIVE" | wc -l > "$LOGS_DIR/profile_creates.log" 2>/dev/null || echo "0" > "$LOGS_DIR/profile_creates.log"
    
    TOURNAMENT_CREATES=$(cat "$LOGS_DIR/tournament_creates.log")
    CHALLENGE_CREATES=$(cat "$LOGS_DIR/challenge_creates.log")
    PROFILE_CREATES=$(cat "$LOGS_DIR/profile_creates.log")
    
    echo -e "${CYAN}   - Tournament table creates: $TOURNAMENT_CREATES${NC}"
    echo -e "${CYAN}   - Challenge table creates: $CHALLENGE_CREATES${NC}"
    echo -e "${CYAN}   - Profile table creates: $PROFILE_CREATES${NC}"
    
    # Find function duplicates
    grep -r "CREATE OR REPLACE FUNCTION" "$MIGRATION_ARCHIVE" | cut -d':' -f2 | sort | uniq -c | sort -nr > "$LOGS_DIR/function_duplicates.log" 2>/dev/null || true
    
    echo -e "${BLUE}📊 Analysis complete. Check $LOGS_DIR/ for details${NC}"
fi

# ============================================================================
# 📂 PHASE 4: ORGANIZE STRUCTURE
# ============================================================================

echo -e "\n${YELLOW}📂 PHASE 4: ORGANIZING CODEBASE STRUCTURE${NC}"

# Create organized structure
echo -e "${BLUE}🏗️ Creating organized directory structure...${NC}"

# Database management structure
mkdir -p ./database-management/{archive,current,documentation,tools}

# Move archive to permanent location
if [ -d "$MIGRATION_ARCHIVE" ]; then
    mv "$MIGRATION_ARCHIVE" ./database-management/archive/
    echo -e "${GREEN}✅ Moved migration archive to database-management/archive/${NC}"
fi

if [ -d "$ARCHIVE_DIR/functions_$TIMESTAMP" ]; then
    mv "$ARCHIVE_DIR/functions_$TIMESTAMP" ./database-management/archive/
    echo -e "${GREEN}✅ Moved function archive to database-management/archive/${NC}"
fi

# Clean up temporary directory
rm -rf "$CLEANUP_DIR"

# ============================================================================
# 📝 PHASE 5: DOCUMENTATION GENERATION
# ============================================================================

echo -e "\n${YELLOW}📝 PHASE 5: GENERATING DOCUMENTATION${NC}"

# Create migration inventory
cat > "./database-management/documentation/migration-inventory.md" << EOF
# Migration Inventory
**Generated**: $(date)
**Total Migration Files Archived**: $MIGRATION_COUNT

## Analysis Summary
- Tournament table creations: $TOURNAMENT_CREATES
- Challenge table creations: $CHALLENGE_CREATES  
- Profile table creations: $PROFILE_CREATES
- Edge functions: $FUNCTION_COUNT

## Archive Location
- Migrations: \`database-management/archive/migrations_$TIMESTAMP/\`
- Functions: \`database-management/archive/functions_$TIMESTAMP/\`

## Current Status
- **Database**: UNTOUCHED (safe)
- **Migrations**: ARCHIVED (not deleted)
- **Functions**: BACKED UP (not modified)
- **Codebase**: ORGANIZED

## Next Steps
1. Review archived migrations for patterns
2. Document current database schema
3. Plan future migration strategy
4. Establish coding standards
EOF

# Create development guidelines
cat > "./database-management/documentation/development-guidelines.md" << EOF
# Development Guidelines
**Updated**: $(date)

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
- Migrations: \`database-management/current/\`
- Archives: \`database-management/archive/\`
- Docs: \`database-management/documentation/\`
- Tools: \`database-management/tools/\`

## Code Standards
- Use TypeScript for all new code
- Follow ESLint configuration
- Include unit tests
- Document API changes
EOF

# Create cleanup tools
cat > "./database-management/tools/analyze-schema.sh" << 'EOF'
#!/bin/bash
# Schema analysis tool (safe - no database changes)

echo "🔍 Analyzing codebase for schema references..."

# Find all SQL files
find . -name "*.sql" -type f | head -20

# Find TypeScript files with database queries
grep -r "from.*(" --include="*.ts" --include="*.js" . | head -10

echo "✅ Analysis complete - check output above"
EOF

chmod +x "./database-management/tools/analyze-schema.sh"

# ============================================================================
# 🎯 PHASE 6: VALIDATION & SUMMARY
# ============================================================================

echo -e "\n${YELLOW}🎯 PHASE 6: VALIDATION & SUMMARY${NC}"

# Validate structure
echo -e "${BLUE}✅ Validating new structure...${NC}"

# Check if directories were created
DIRS_CREATED=0
for dir in "database-management/archive" "database-management/current" "database-management/documentation" "database-management/tools"; do
    if [ -d "./$dir" ]; then
        ((DIRS_CREATED++))
        echo -e "${GREEN}   ✅ $dir${NC}"
    else
        echo -e "${RED}   ❌ $dir${NC}"
    fi
done

# Check if files were created
FILES_CREATED=0
for file in "database-management/documentation/migration-inventory.md" "database-management/documentation/development-guidelines.md" "database-management/tools/analyze-schema.sh"; do
    if [ -f "./$file" ]; then
        ((FILES_CREATED++))
        echo -e "${GREEN}   ✅ $file${NC}"
    else
        echo -e "${RED}   ❌ $file${NC}"
    fi
done

# ============================================================================
# 🎉 COMPLETION SUMMARY
# ============================================================================

echo -e "\n${GREEN}🎉 CODEBASE CLEANUP COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}=========================================${NC}"

echo -e "\n${BLUE}📊 Summary:${NC}"
echo -e "${CYAN}   - Migration files archived: $MIGRATION_COUNT${NC}"
echo -e "${CYAN}   - Edge functions backed up: $FUNCTION_COUNT${NC}"
echo -e "${CYAN}   - Directories created: $DIRS_CREATED/4${NC}"
echo -e "${CYAN}   - Documentation files: $FILES_CREATED/3${NC}"

echo -e "\n${BLUE}📁 New Structure:${NC}"
echo -e "${CYAN}   - database-management/archive/ (archived files)${NC}"
echo -e "${CYAN}   - database-management/current/ (for future use)${NC}"
echo -e "${CYAN}   - database-management/documentation/ (guides)${NC}"
echo -e "${CYAN}   - database-management/tools/ (utilities)${NC}"

echo -e "\n${YELLOW}📋 Next Steps:${NC}"
echo -e "${BLUE}1. Review: database-management/documentation/migration-inventory.md${NC}"
echo -e "${BLUE}2. Plan: Future migration strategy${NC}"
echo -e "${BLUE}3. Document: Current database schema${NC}"
echo -e "${BLUE}4. Establish: Development workflow${NC}"

echo -e "\n${GREEN}✅ Safe cleanup complete - no database changes made!${NC}"
echo -e "${GREEN}✅ All files preserved and organized${NC}"
echo -e "${GREEN}✅ Ready for future development work${NC}"
