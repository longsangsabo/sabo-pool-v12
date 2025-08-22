#!/bin/bash

# Script helper cho console cleanup
set -e

echo "🧹 Console.log Cleanup Helper Script"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the project root?"
    exit 1
fi

print_status "Project found: $(cat package.json | grep '"name"' | cut -d'"' -f4)"

# Step 1: Dry run first
echo ""
print_status "Step 1: Running dry run to preview changes..."
node cleanup-console-logs.cjs --dry-run

echo ""
read -p "$(echo -e ${YELLOW}Do you want to proceed with the actual cleanup? [y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Cleanup cancelled by user"
    exit 0
fi

# Step 2: Check if dev server is running
echo ""
print_status "Step 2: Checking if dev server is running..."
if pgrep -f "vite" > /dev/null; then
    print_warning "Dev server is running. Stopping it first..."
    pkill -f "vite" || true
    sleep 2
fi

# Step 3: Run actual cleanup
echo ""
print_status "Step 3: Running actual cleanup..."
node cleanup-console-logs.cjs

# Step 4: Test build
echo ""
print_status "Step 4: Testing build to ensure no syntax errors..."
if npm run build; then
    print_success "Build successful! No syntax errors detected."
else
    print_error "Build failed! There might be syntax errors."
    echo ""
    read -p "$(echo -e ${YELLOW}Do you want to restore from backup? [y/N]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restoring from backup..."
        LATEST_BACKUP=$(ls -t console-cleanup-backup/ | head -n1)
        if [ -n "$LATEST_BACKUP" ]; then
            cp -r "console-cleanup-backup/$LATEST_BACKUP/"* src/
            print_success "Restored from backup: $LATEST_BACKUP"
        else
            print_error "No backup found!"
        fi
    fi
    exit 1
fi

# Step 5: Quick dev server test
echo ""
print_status "Step 5: Quick development server test..."
print_status "Starting dev server for 10 seconds to test..."

# Start dev server in background
npm run dev &
DEV_PID=$!

# Wait a bit for server to start
sleep 5

# Check if server is running
if ps -p $DEV_PID > /dev/null; then
    print_success "Dev server started successfully!"
    
    # Wait a bit more then kill
    sleep 5
    kill $DEV_PID 2>/dev/null || true
    wait $DEV_PID 2>/dev/null || true
    
    print_success "Dev server test completed successfully!"
else
    print_error "Dev server failed to start!"
    exit 1
fi

# Final summary
echo ""
echo "🎉 Console.log cleanup completed successfully!"
echo "============================================="
print_success "✅ Syntax validation passed"
print_success "✅ Build test passed" 
print_success "✅ Dev server test passed"
print_success "✅ Backup created in console-cleanup-backup/"

echo ""
print_status "Next steps:"
echo "  1. Test your app thoroughly"
echo "  2. Run 'npm run dev' to start development"
echo "  3. If issues occur, restore from backup"

echo ""
print_warning "Backup location: console-cleanup-backup/"
print_warning "Keep backup until you're sure everything works!"
