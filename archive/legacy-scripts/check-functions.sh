#!/bin/bash

# ================================================================================
# RANK SYSTEM FUNCTION CHECKER SCRIPT
# ================================================================================

echo "🔍 RANK SYSTEM FUNCTION STATUS CHECKER"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we have Supabase CLI or psql
if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✅ Supabase CLI found${NC}"
    SQL_EXECUTOR="supabase db"
elif command -v psql &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL psql found${NC}"
    SQL_EXECUTOR="psql"
else
    echo -e "${RED}❌ No SQL executor found (supabase CLI or psql)${NC}"
    echo "Please install Supabase CLI or PostgreSQL client"
    exit 1
fi

echo ""

# Function to run SQL and capture output
run_sql_check() {
    local sql_file=$1
    local description=$2
    
    echo -e "${BLUE}🔍 $description${NC}"
    echo "----------------------------------------"
    
    if [ "$SQL_EXECUTOR" = "supabase db" ]; then
        if [ -f ".env" ]; then
            source .env
        fi
        
        # Try to run with Supabase CLI
        if [ -n "$SUPABASE_DB_URL" ]; then
            psql "$SUPABASE_DB_URL" -f "$sql_file"
        else
            echo -e "${YELLOW}⚠️ No database URL found, please run manually${NC}"
            echo "File: $sql_file"
        fi
    else
        echo -e "${YELLOW}⚠️ Please run this SQL file manually:${NC}"
        echo "File: $sql_file"
        echo ""
        echo "Or copy-paste this into Supabase SQL Editor:"
        echo "$(head -20 "$sql_file")"
        echo "... (truncated)"
    fi
    
    echo ""
}

# Main checks
echo -e "${BLUE}🚀 Starting comprehensive function checks...${NC}"
echo ""

# 1. Quick check first
if [ -f "quick-check-functions.sql" ]; then
    run_sql_check "quick-check-functions.sql" "Quick Function Status Check"
else
    echo -e "${RED}❌ quick-check-functions.sql not found${NC}"
fi

# 2. Detailed check
if [ -f "check-rank-system-status.sql" ]; then
    run_sql_check "check-rank-system-status.sql" "Detailed System Status Check"
else
    echo -e "${RED}❌ check-rank-system-status.sql not found${NC}"
fi

# 3. Alternative: Manual instructions
echo -e "${YELLOW}📋 MANUAL CHECK INSTRUCTIONS:${NC}"
echo "----------------------------------------"
echo "1. Open Supabase Dashboard → SQL Editor"
echo "2. Copy & paste the content of these files:"
echo "   • quick-check-functions.sql (for quick check)"
echo "   • check-rank-system-status.sql (for detailed analysis)"
echo "3. Run each query to see the status"
echo ""

# 4. Show files that should exist
echo -e "${BLUE}📁 Required SQL files in this directory:${NC}"
echo "----------------------------------------"

files=("quick-check-functions.sql" "check-rank-system-status.sql" "comprehensive-rank-system-restoration.sql")

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file (missing)${NC}"
    fi
done

echo ""

# 5. Next steps
echo -e "${BLUE}💡 NEXT STEPS:${NC}"
echo "----------------------------------------"
echo "1. Run the quick check first to see which functions are missing"
echo "2. If functions are missing, run: comprehensive-rank-system-restoration.sql"
echo "3. Run the detailed check to verify everything is working"
echo "4. Test the rank approval in your frontend application"
echo ""

echo -e "${GREEN}🏁 Function check script completed!${NC}"
