#!/bin/bash

# ================================================================================
# MILESTONE SYSTEM COMPLETE SETUP SCRIPT
# ================================================================================
# This script sets up the entire milestone system step by step
# ================================================================================

set -e  # Exit on any error

# Colors for beautiful output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${CYAN}=================================================================================${NC}"
    echo -e "${CYAN} $1${NC}"
    echo -e "${CYAN}=================================================================================${NC}"
}

print_step() {
    echo -e "${BLUE}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

# Main setup
print_header "MILESTONE SYSTEM COMPLETE SETUP"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    echo "Please create .env file with database connection details"
    exit 1
fi

print_step "Step 1: Initial system test"
echo "Testing current milestone system status..."
echo ""

# Run initial test
if node test-milestone-system.cjs > /dev/null 2>&1; then
    print_success "Initial test completed"
else
    print_warning "Issues detected - will proceed with fixes"
fi

echo ""
print_step "Step 2: Database setup"
echo "Choose your setup method:"
echo "1. Automatic (if DATABASE_URL is configured)"
echo "2. Manual (copy-paste scripts to Supabase dashboard)"
echo ""

# Load environment variables
source .env

if [ -z "$DATABASE_URL" ]; then
    print_warning "DATABASE_URL not found in .env"
    echo ""
    print_info "MANUAL SETUP REQUIRED:"
    echo ""
    echo "📋 Step 2a: Copy and run milestone-system-fix.sql in Supabase SQL Editor"
    echo "📋 Step 2b: Copy and run milestone-data-seed.sql in Supabase SQL Editor"
    echo ""
    read -p "Press Enter when you've completed both SQL scripts..."
else
    print_info "DATABASE_URL found - attempting automatic setup..."
    
    print_step "Running milestone-system-fix.sql..."
    if psql "$DATABASE_URL" -f milestone-system-fix.sql; then
        print_success "Milestone functions created"
    else
        print_error "Failed to create milestone functions"
        echo "Please run milestone-system-fix.sql manually in Supabase dashboard"
        exit 1
    fi
    
    print_step "Running milestone-data-seed.sql..."
    if psql "$DATABASE_URL" -f milestone-data-seed.sql; then
        print_success "Milestone data seeded"
    else
        print_error "Failed to seed milestone data"
        echo "Please run milestone-data-seed.sql manually in Supabase dashboard"
        exit 1
    fi
fi

echo ""
print_step "Step 3: Verification test"
echo "Testing milestone system after setup..."
echo ""

# Run final test
if node test-milestone-system.cjs; then
    print_success "All milestone functions working correctly!"
else
    print_error "Some issues remain - check test output above"
    exit 1
fi

echo ""
print_header "SETUP COMPLETED SUCCESSFULLY"
echo ""
print_success "Milestone system is now fully operational!"
echo ""
print_info "What was set up:"
echo "• 4 database functions for milestone operations"
echo "• 26 default milestones across 4 categories"
echo "• Complete error handling and validation"
echo "• PostgREST schema cache properly refreshed"
echo ""
print_info "Available milestone categories:"
echo "• Progress Milestones: Match wins, tournament participation, SPA points"
echo "• Achievement Milestones: Tournament wins, milestone unlocks"
echo "• Social Milestones: Challenge sending and completion"
echo "• Repeatable Milestones: Login streaks and daily activities"
echo ""
print_info "Next steps for integration:"
echo "1. Connect milestone updates to game events (match completion, etc.)"
echo "2. Add milestone progress to user interface"
echo "3. Implement milestone notifications"
echo "4. Test milestone rewards distribution"
echo ""
print_info "Available commands:"
echo "• node test-milestone-system.cjs - Test milestone system"
echo "• npm run dev - Start development server"
echo ""
print_success "🎉 Milestone system setup complete!"
