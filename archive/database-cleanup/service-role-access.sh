#!/bin/bash

# 🔑 SABO POOL V12 - SERVICE ROLE DATABASE ACCESS
# Direct database management with service role authentication

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🔑 SABO POOL V12 - SERVICE ROLE ACCESS SETUP${NC}"
echo -e "${CYAN}=============================================${NC}"

# ============================================================================
# 📋 CONFIGURATION SECTION
# ============================================================================

# Supabase Configuration
export SUPABASE_PROJECT_ID="exlqvlbawytbglioqfbc"
export SUPABASE_URL="https://${SUPABASE_PROJECT_ID}.supabase.co"

# Database Connection (Update these)
export PGHOST="db.${SUPABASE_PROJECT_ID}.supabase.co"
export PGPORT="5432"
export PGDATABASE="postgres"
export PGUSER="postgres"

# IMPORTANT: You need to set these values
echo -e "${YELLOW}⚠️  CONFIGURATION REQUIRED:${NC}"
echo -e "${BLUE}1. Set SUPABASE_SERVICE_ROLE_KEY environment variable${NC}"
echo -e "${BLUE}2. Set PGPASSWORD environment variable${NC}"
echo ""

# Check if required environment variables are set
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ SUPABASE_SERVICE_ROLE_KEY not set${NC}"
    echo -e "${YELLOW}   Export your service role key:${NC}"
    echo -e "${CYAN}   export SUPABASE_SERVICE_ROLE_KEY=\"your_service_role_key_here\"${NC}"
    echo ""
fi

if [ -z "$PGPASSWORD" ]; then
    echo -e "${RED}❌ PGPASSWORD not set${NC}"
    echo -e "${YELLOW}   Export your database password:${NC}"
    echo -e "${CYAN}   export PGPASSWORD=\"your_db_password_here\"${NC}"
    echo ""
fi

# Exit if required variables are not set
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [ -z "$PGPASSWORD" ]; then
    echo -e "${RED}🚫 Cannot proceed without required credentials${NC}"
    exit 1
fi

# ============================================================================
# 🧪 CONNECTION TESTING
# ============================================================================

echo -e "${YELLOW}🧪 Testing database connection...${NC}"

# Test basic connection
if psql -c "SELECT current_database(), current_user, version();" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
    
    # Show connection details
    echo -e "${BLUE}📊 Connection Details:${NC}"
    psql -c "SELECT 
        current_database() as database,
        current_user as user,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port,
        pg_postmaster_start_time() as server_started;"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo -e "${YELLOW}   Check your credentials and network connection${NC}"
    exit 1
fi

# ============================================================================
# 📊 DATABASE ANALYSIS
# ============================================================================

echo -e "\n${YELLOW}📊 Analyzing current database state...${NC}"

# Create analysis directory
ANALYSIS_DIR="./database-cleanup/analysis/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$ANALYSIS_DIR"

# Export current schema
echo -e "${BLUE}📤 Exporting current schema...${NC}"
pg_dump --schema-only --no-privileges --no-owner > "$ANALYSIS_DIR/current_schema.sql"
echo -e "${GREEN}✅ Schema exported to $ANALYSIS_DIR/current_schema.sql${NC}"

# List all tables
echo -e "${BLUE}📋 Analyzing tables...${NC}"
psql -c "\dt" > "$ANALYSIS_DIR/tables_list.txt"
TABLE_COUNT=$(psql -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo -e "${CYAN}   Tables found: $TABLE_COUNT${NC}"

# List all functions
echo -e "${BLUE}⚙️ Analyzing functions...${NC}"
psql -c "\df" > "$ANALYSIS_DIR/functions_list.txt"
FUNCTION_COUNT=$(psql -t -c "SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public';")
echo -e "${CYAN}   Functions found: $FUNCTION_COUNT${NC}"

# List all indexes
echo -e "${BLUE}🔍 Analyzing indexes...${NC}"
psql -c "SELECT schemaname, tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public';" > "$ANALYSIS_DIR/indexes_list.txt"
INDEX_COUNT=$(psql -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';")
echo -e "${CYAN}   Indexes found: $INDEX_COUNT${NC}"

# Analyze table sizes
echo -e "${BLUE}📏 Analyzing table sizes...${NC}"
psql -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
" > "$ANALYSIS_DIR/table_sizes.txt"

# Check for common SABO tables
echo -e "${BLUE}🎯 Checking for SABO-specific tables...${NC}"
SABO_TABLES=("profiles" "challenges" "tournaments" "player_rankings" "wallets" "clubs")
EXISTING_SABO_TABLES=0

for table in "${SABO_TABLES[@]}"; do
    if psql -t -c "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '$table');" | grep -q "t"; then
        echo -e "${GREEN}   ✅ $table${NC}"
        ((EXISTING_SABO_TABLES++))
    else
        echo -e "${RED}   ❌ $table${NC}"
    fi
done

echo -e "${CYAN}   SABO tables found: $EXISTING_SABO_TABLES/${#SABO_TABLES[@]}${NC}"

# ============================================================================
# 🛠️ MANAGEMENT FUNCTIONS
# ============================================================================

# Create management script
cat > "$ANALYSIS_DIR/database_management.sh" << 'EOF'
#!/bin/bash
# Database management helper functions

# Quick table inspection
inspect_table() {
    local table_name=$1
    echo "🔍 Inspecting table: $table_name"
    echo "=================="
    
    # Table structure
    echo "📋 Structure:"
    psql -c "\d $table_name"
    
    # Row count
    echo -e "\n📊 Row count:"
    psql -c "SELECT COUNT(*) as total_rows FROM $table_name;"
    
    # Sample data
    echo -e "\n📄 Sample data (first 5 rows):"
    psql -c "SELECT * FROM $table_name LIMIT 5;"
}

# Export table data
export_table() {
    local table_name=$1
    local output_file="${table_name}_$(date +%Y%m%d_%H%M%S).csv"
    
    echo "📤 Exporting $table_name to $output_file"
    psql -c "\COPY $table_name TO '$output_file' WITH CSV HEADER;"
    echo "✅ Export completed: $output_file"
}

# Backup table
backup_table() {
    local table_name=$1
    local backup_name="${table_name}_backup_$(date +%Y%m%d_%H%M%S)"
    
    echo "💾 Creating backup: $backup_name"
    psql -c "CREATE TABLE $backup_name AS SELECT * FROM $table_name;"
    echo "✅ Backup completed: $backup_name"
}

# Usage examples:
# inspect_table "profiles"
# export_table "challenges"
# backup_table "tournaments"
EOF

chmod +x "$ANALYSIS_DIR/database_management.sh"

# ============================================================================
# 📋 CLEANUP PREPARATION
# ============================================================================

echo -e "\n${YELLOW}📋 Preparing cleanup operations...${NC}"

# Create backup script for critical data
cat > "$ANALYSIS_DIR/backup_critical_data.sql" << 'EOF'
-- Critical data backup before cleanup
-- Run this BEFORE making any schema changes

-- Create backup schema
CREATE SCHEMA IF NOT EXISTS backup_$(date +%Y%m%d_%H%M%S);

-- Backup profiles (most critical)
CREATE TABLE backup_profiles AS SELECT * FROM profiles;

-- Backup rankings
CREATE TABLE backup_player_rankings AS SELECT * FROM player_rankings;

-- Backup wallets
CREATE TABLE backup_wallets AS SELECT * FROM wallets;

-- Backup challenges
CREATE TABLE backup_challenges AS SELECT * FROM challenges;

-- Backup tournaments
CREATE TABLE backup_tournaments AS SELECT * FROM tournaments;

-- Show backup results
SELECT 
    'profiles' as table_name, 
    COUNT(*) as backed_up_rows 
FROM backup_profiles
UNION ALL
SELECT 
    'player_rankings', 
    COUNT(*) 
FROM backup_player_rankings
UNION ALL
SELECT 
    'wallets', 
    COUNT(*) 
FROM backup_wallets
UNION ALL
SELECT 
    'challenges', 
    COUNT(*) 
FROM backup_challenges
UNION ALL
SELECT 
    'tournaments', 
    COUNT(*) 
FROM backup_tournaments;
EOF

# Create rollback script
cat > "$ANALYSIS_DIR/rollback_schema.sql" << 'EOF'
-- Emergency rollback script
-- Use this if cleanup goes wrong

-- This script will restore from backup tables
-- Modify table names to match your backup naming convention

-- Example rollback (update table names as needed):
-- DROP TABLE profiles CASCADE;
-- CREATE TABLE profiles AS SELECT * FROM backup_profiles;
-- 
-- DROP TABLE player_rankings CASCADE;
-- CREATE TABLE player_rankings AS SELECT * FROM backup_player_rankings;

-- Always test rollback procedures before production cleanup!
EOF

# ============================================================================
# 📊 SUMMARY REPORT
# ============================================================================

# Generate summary report
cat > "$ANALYSIS_DIR/analysis_summary.md" << EOF
# Database Analysis Summary
**Generated**: $(date)
**Project**: SABO Pool V12
**Database**: $PGDATABASE @ $PGHOST

## Current State
- **Tables**: $TABLE_COUNT
- **Functions**: $FUNCTION_COUNT  
- **Indexes**: $INDEX_COUNT
- **SABO Tables**: $EXISTING_SABO_TABLES/${#SABO_TABLES[@]}

## Files Generated
- \`current_schema.sql\` - Complete schema export
- \`tables_list.txt\` - All tables with details
- \`functions_list.txt\` - All functions
- \`indexes_list.txt\` - All indexes
- \`table_sizes.txt\` - Storage analysis
- \`database_management.sh\` - Helper functions
- \`backup_critical_data.sql\` - Backup script
- \`rollback_schema.sql\` - Emergency rollback

## Next Steps
1. Review current schema structure
2. Execute backup script before changes
3. Apply consolidated schema migration
4. Validate data integrity
5. Test application functionality

## Safety Checklist
- [ ] Critical data backed up
- [ ] Rollback plan tested
- [ ] Staging environment validated
- [ ] Team notified of maintenance window
- [ ] Monitoring systems ready

**Status**: Ready for cleanup execution
EOF

# ============================================================================
# 🎯 FINAL OUTPUT
# ============================================================================

echo -e "\n${GREEN}🎉 SERVICE ROLE ACCESS & ANALYSIS COMPLETE!${NC}"
echo -e "${GREEN}===========================================${NC}"

echo -e "\n${BLUE}📁 Analysis Directory: $ANALYSIS_DIR${NC}"
echo -e "${BLUE}📊 Database Info:${NC}"
echo -e "${CYAN}   - Tables: $TABLE_COUNT${NC}"
echo -e "${CYAN}   - Functions: $FUNCTION_COUNT${NC}"
echo -e "${CYAN}   - Indexes: $INDEX_COUNT${NC}"
echo -e "${CYAN}   - SABO Tables: $EXISTING_SABO_TABLES/${#SABO_TABLES[@]}${NC}"

echo -e "\n${YELLOW}📋 NEXT ACTIONS:${NC}"
echo -e "${BLUE}1. Review analysis: $ANALYSIS_DIR/analysis_summary.md${NC}"
echo -e "${BLUE}2. Backup data: psql -f $ANALYSIS_DIR/backup_critical_data.sql${NC}"
echo -e "${BLUE}3. Apply target schema: psql -f ./database-cleanup/target-schema.sql${NC}"
echo -e "${BLUE}4. Use helpers: source $ANALYSIS_DIR/database_management.sh${NC}"

echo -e "\n${GREEN}✅ Ready for database cleanup execution!${NC}"
