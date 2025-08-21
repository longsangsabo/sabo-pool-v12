#!/bin/bash

# Apply Milestone Schema Cache Fix
# This script applies the corrected milestone functions

set -e

echo "🔧 APPLYING MILESTONE SCHEMA CACHE FIX"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    echo "Please create .env file with database connection details"
    exit 1
fi

print_info "Applying schema cache fix..."
echo "This will fix column name issues (user_id → player_id) and function conflicts"
echo ""

# Load environment variables
source .env

# Apply the fix
if [ -z "$DATABASE_URL" ]; then
    print_warning "DATABASE_URL not found in .env"
    print_info "Please run the SQL script manually in Supabase dashboard:"
    echo ""
    echo "📋 Execute this file in SQL Editor:"
    echo "   fix-milestone-schema-cache.sql"
    echo ""
    read -p "Press Enter when you've applied the fix..."
else
    print_info "Applying fix via psql..."
    if psql "$DATABASE_URL" -f fix-milestone-schema-cache.sql; then
        print_status "Schema cache fix applied successfully"
    else
        print_error "Failed to apply schema cache fix"
        exit 1
    fi
fi

echo ""
print_info "Testing milestone system after fix..."
echo ""

# Test the system
if node test-milestone-system.cjs; then
    print_status "All milestone functions working correctly!"
    echo ""
    print_info "What was fixed:"
    echo "• Column references: user_id → player_id"
    echo "• Function conflicts resolved"
    echo "• Schema cache refreshed"
    echo "• Graceful error handling added"
    echo ""
    print_status "Milestone system is now fully operational! 🎉"
else
    print_error "Some issues remain - check test output above"
    exit 1
fi

echo ""
print_info "Next steps:"
echo "1. Integrate milestone updates into game events"
echo "2. Connect milestone progress to user interface"
echo "3. Test milestone rewards and notifications"
echo ""
print_status "Fix completed successfully!"
