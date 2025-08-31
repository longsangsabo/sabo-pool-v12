#!/bin/bash

# SABO Pool V12 - Database Synchronization Analysis Script
# Phân tích đồng bộ hoá toàn diện giữa database và codebase
# Created: $(date)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="/workspaces/sabo-pool-v12"
REPORT_DIR="$WORKSPACE_ROOT/database-sync-analysis"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
REPORT_FILE="$REPORT_DIR/database_sync_report_$TIMESTAMP.md"

# Load environment variables
if [ -f "$WORKSPACE_ROOT/.env" ]; then
    source "$WORKSPACE_ROOT/.env"
fi

# Validate required environment variables
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    echo "VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:-NOT SET}"
    echo "VITE_SUPABASE_SERVICE_ROLE_KEY: ${VITE_SUPABASE_SERVICE_ROLE_KEY:-NOT SET}"
    exit 1
fi

# Create report directory
mkdir -p "$REPORT_DIR"

# Function to log with timestamp
log() {
    echo -e "[$(date '+%H:%M:%S')] $1" | tee -a "$REPORT_FILE"
}

# Function to query Supabase
query_supabase() {
    local query="$1"
    local output_file="$2"
    
    curl -s \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $VITE_SUPABASE_SERVICE_ROLE_KEY" \
        -H "apikey: $VITE_SUPABASE_SERVICE_ROLE_KEY" \
        -X POST \
        "$VITE_SUPABASE_URL/rest/v1/rpc/exec_sql" \
        -d "{\"query\": \"$query\"}" \
        > "$output_file"
}

# Initialize report
cat > "$REPORT_FILE" << EOF
# 🔍 SABO Pool V12 - Database Synchronization Analysis Report
**Generated:** $(date)
**Project:** SABO Pool Arena Hub
**Database:** Supabase (${VITE_SUPABASE_URL})

## 📋 Executive Summary
This report analyzes the synchronization between the database schema and codebase to ensure consistency.

---

EOF

log "${BLUE}🚀 Bắt đầu phân tích đồng bộ hoá database...${NC}"

# 1. Get all tables from database
log "${YELLOW}📊 1. Lấy danh sách tất cả bảng từ database...${NC}"

TABLES_QUERY="
SELECT 
    schemaname,
    tablename,
    tableowner,
    tablespace,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schemaname, tablename;
"

query_supabase "$TABLES_QUERY" "$REPORT_DIR/database_tables.json"

# 2. Get table details (columns, types, constraints)
log "${YELLOW}📋 2. Lấy chi tiết cấu trúc bảng...${NC}"

COLUMNS_QUERY="
SELECT 
    t.table_schema,
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default,
    c.ordinal_position
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
WHERE t.table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY t.table_schema, t.table_name, c.ordinal_position;
"

query_supabase "$COLUMNS_QUERY" "$REPORT_DIR/database_columns.json"

# 3. Get indexes
log "${YELLOW}🔗 3. Lấy thông tin indexes...${NC}"

INDEXES_QUERY="
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schemaname, tablename, indexname;
"

query_supabase "$INDEXES_QUERY" "$REPORT_DIR/database_indexes.json"

# 4. Get foreign key constraints
log "${YELLOW}🔑 4. Lấy thông tin foreign keys...${NC}"

FK_QUERY="
SELECT
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_schema, tc.table_name;
"

query_supabase "$FK_QUERY" "$REPORT_DIR/database_foreign_keys.json"

# 5. Get RLS policies
log "${YELLOW}🛡️ 5. Lấy thông tin RLS policies...${NC}"

RLS_QUERY="
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
ORDER BY schemaname, tablename, policyname;
"

query_supabase "$RLS_QUERY" "$REPORT_DIR/database_rls_policies.json"

# 6. Get table row counts
log "${YELLOW}📈 6. Lấy số lượng records trong từng bảng...${NC}"

# Create a dynamic query to get row counts for all tables
echo "Generating row count queries..."

# Get all table names first and create individual count queries
TABLES_LIST_QUERY="
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
"

query_supabase "$TABLES_LIST_QUERY" "$REPORT_DIR/table_names.json"

# 7. Analyze codebase for table references
log "${YELLOW}🔍 7. Phân tích references trong codebase...${NC}"

echo "## 🔍 Codebase Analysis" >> "$REPORT_FILE"

# Find all table references in TypeScript files
log "Tìm kiếm table references trong codebase..."
find "$WORKSPACE_ROOT" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
    grep -v node_modules | \
    grep -v .git | \
    xargs grep -l "\.from\|\.table\|supabase" 2>/dev/null > "$REPORT_DIR/files_with_db_references.txt" || true

# Find schema definitions
log "Tìm kiếm schema definitions..."
find "$WORKSPACE_ROOT" -name "*types*.ts" -o -name "*schema*.ts" -o -name "*database*.ts" | \
    grep -v node_modules > "$REPORT_DIR/schema_files.txt" || true

# Find migration files
log "Tìm kiếm migration files..."
find "$WORKSPACE_ROOT" -name "*migration*" -o -name "*sql" | \
    grep -v node_modules > "$REPORT_DIR/migration_files.txt" || true

# 8. Generate comprehensive comparison report
log "${YELLOW}📋 8. Tạo báo cáo so sánh toàn diện...${NC}"

cat >> "$REPORT_FILE" << 'EOF'

## 📊 Database Schema Analysis

### Tables Found in Database
EOF

# Process the JSON responses to create readable reports
if [ -f "$REPORT_DIR/database_tables.json" ]; then
    echo "Processing database tables..."
    cat "$REPORT_DIR/database_tables.json" >> "$REPORT_FILE"
fi

cat >> "$REPORT_FILE" << 'EOF'

### Table Columns and Types
EOF

if [ -f "$REPORT_DIR/database_columns.json" ]; then
    echo "Processing database columns..."
    cat "$REPORT_DIR/database_columns.json" >> "$REPORT_FILE"
fi

# 9. Create summary statistics
log "${YELLOW}📈 9. Tạo thống kê tổng hợp...${NC}"

cat >> "$REPORT_FILE" << EOF

## 📈 Summary Statistics

- **Analysis Date:** $(date)
- **Database URL:** $VITE_SUPABASE_URL
- **Report Files Generated:** 
  - Database Tables: \`$REPORT_DIR/database_tables.json\`
  - Database Columns: \`$REPORT_DIR/database_columns.json\`
  - Database Indexes: \`$REPORT_DIR/database_indexes.json\`
  - Foreign Keys: \`$REPORT_DIR/database_foreign_keys.json\`
  - RLS Policies: \`$REPORT_DIR/database_rls_policies.json\`
  - Codebase References: \`$REPORT_DIR/files_with_db_references.txt\`

## 🔧 Next Steps

1. **Review Database Schema:** Check all tables, columns, and relationships
2. **Validate Codebase Sync:** Ensure TypeScript types match database schema
3. **Check Migration Status:** Verify all migrations are applied
4. **RLS Policy Review:** Ensure security policies are properly configured
5. **Performance Analysis:** Review indexes and query optimization

## 📝 Recommendations

Based on this analysis, the following actions are recommended:

- [ ] Verify all tables have proper RLS policies
- [ ] Check for unused tables or columns
- [ ] Validate foreign key relationships
- [ ] Review index performance
- [ ] Update TypeScript types if needed

---

**End of Report**
EOF

log "${GREEN}✅ Phân tích hoàn tất!${NC}"
log "${BLUE}📄 Báo cáo được lưu tại: $REPORT_FILE${NC}"

# 10. Display summary
echo ""
echo -e "${GREEN}🎉 Database Synchronization Analysis Complete!${NC}"
echo ""
echo -e "${BLUE}📍 Report Location:${NC} $REPORT_FILE"
echo -e "${BLUE}📁 Analysis Files:${NC} $REPORT_DIR/"
echo ""
echo -e "${YELLOW}📋 Files Generated:${NC}"
ls -la "$REPORT_DIR/"
echo ""
echo -e "${GREEN}✨ Bạn có thể xem báo cáo chi tiết trong file Markdown được tạo!${NC}"
