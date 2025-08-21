#!/bin/bash

# Milestone System Complete Setup Script
# This script sets up the entire milestone system from scratch

set -e  # Exit on any error

echo "🚀 MILESTONE SYSTEM COMPLETE SETUP"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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
    echo "Please create .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
    exit 1
fi

print_info "Step 1: Testing current milestone system status..."
echo "------------------------------------------------"

# Run the test first to see what's missing
if node test-milestone-system.cjs; then
    print_status "Initial test completed"
else
    print_warning "Some issues detected - will proceed with fixes"
fi

echo ""
print_info "Step 2: Setting up database functions..."
echo "---------------------------------------"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    print_warning "psql not found. You'll need to run SQL scripts manually in Supabase dashboard"
    echo ""
    echo "Please run these SQL files in order:"
    echo "1. fix-milestone-missing-functions.sql"
    echo "2. seed-milestone-data.sql"
    echo ""
    read -p "Press Enter when you've completed running the SQL scripts..."
else
    print_info "Found psql - attempting to run SQL scripts..."
    
    # Load environment variables
    source .env
    
    if [ -z "$DATABASE_URL" ]; then
        print_warning "DATABASE_URL not found in .env"
        print_info "Please run SQL scripts manually in Supabase dashboard:"
        echo "1. fix-milestone-missing-functions.sql"
        echo "2. seed-milestone-data.sql"
        read -p "Press Enter when completed..."
    else
        print_info "Running fix-milestone-missing-functions.sql..."
        if psql "$DATABASE_URL" -f fix-milestone-missing-functions.sql; then
            print_status "Database functions created"
        else
            print_error "Failed to create database functions"
        fi
        
        print_info "Running seed-milestone-data.sql..."
        if psql "$DATABASE_URL" -f seed-milestone-data.sql; then
            print_status "Milestone data seeded"
        else
            print_error "Failed to seed milestone data"
        fi
    fi
fi

echo ""
print_info "Step 3: Testing milestone system after setup..."
echo "----------------------------------------------"

# Run the test again to verify everything works
if node test-milestone-system.cjs; then
    print_status "Milestone system test passed!"
else
    print_error "Milestone system test failed"
    echo ""
    print_info "Manual verification steps:"
    echo "1. Check Supabase dashboard for milestone tables"
    echo "2. Verify RPC functions exist"
    echo "3. Check that milestone data was inserted"
    exit 1
fi

echo ""
print_info "Step 4: Checking frontend integration..."
echo "---------------------------------------"

# Check if milestone service files exist
if [ -f "src/services/milestoneService.ts" ]; then
    print_status "Milestone service found"
else
    print_warning "Milestone service not found - you may need to create it"
fi

# Check if milestone hooks exist
if [ -f "src/hooks/useMilestones.ts" ]; then
    print_status "Milestone hooks found"
else
    print_warning "Milestone hooks not found - you may need to create them"
fi

echo ""
print_status "MILESTONE SYSTEM SETUP COMPLETE!"
echo "================================"
echo ""
print_info "What was completed:"
echo "• Database functions created/updated"
echo "• Milestone data seeded"
echo "• System tested and validated"
echo ""
print_info "Next steps for full integration:"
echo "1. Ensure frontend milestone service is properly connected"
echo "2. Test milestone triggers on match completion"
echo "3. Verify milestone notifications work"
echo "4. Test SPA point rewards"
echo ""
print_info "To run individual tests:"
echo "• node test-milestone-system.cjs - Test milestone system"
echo "• npm run dev - Start development server"
echo ""
print_status "Milestone system is ready! 🎉"
