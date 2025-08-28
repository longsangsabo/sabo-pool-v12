#!/bin/bash

# SABO Arena Optimized Build Script
# Builds shared packages first, then apps in parallel

set -e

echo "🚀 Starting SABO Arena optimized build process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[BUILD]${NC} $1"
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

# Step 1: Clean previous builds
print_status "Cleaning previous builds..."
pnpm --filter "./packages/*" run clean || echo "Clean script not found, skipping..."
pnpm --filter "./apps/*" run clean || echo "Clean script not found, skipping..."

# Step 2: Build shared packages in dependency order
print_status "Building shared packages..."

# Build shared-types first (no dependencies)
print_status "Building @sabo/shared-types..."
pnpm --filter "@sabo/shared-types" run build
print_success "shared-types built successfully"

# Build shared-utils (depends on shared-types)
print_status "Building @sabo/shared-utils..."
pnpm --filter "@sabo/shared-utils" run build
print_success "shared-utils built successfully"

# Build shared-hooks (depends on shared-utils)
print_status "Building @sabo/shared-hooks..."
pnpm --filter "@sabo/shared-hooks" run build
print_success "shared-hooks built successfully"

# Build shared-auth (depends on shared-types, shared-utils)
print_status "Building @sabo/shared-auth..."
pnpm --filter "@sabo/shared-auth" run build
print_success "shared-auth built successfully"

# Build shared-ui (depends on all others)
print_status "Building @sabo/shared-ui..."
pnpm --filter "@sabo/shared-ui" run build
print_success "shared-ui built successfully"

print_success "All shared packages built successfully!"

# Step 3: Build apps in parallel for faster builds
print_status "Building applications in parallel..."

# Build both apps simultaneously
pnpm --filter "@sabo/user-app" run build &
USER_PID=$!

pnpm --filter "@sabo/admin-app" run build &
ADMIN_PID=$!

# Wait for both builds to complete
wait $USER_PID
USER_EXIT_CODE=$?

wait $ADMIN_PID
ADMIN_EXIT_CODE=$?

# Check if both builds succeeded
if [ $USER_EXIT_CODE -eq 0 ] && [ $ADMIN_EXIT_CODE -eq 0 ]; then
    print_success "All applications built successfully!"
else
    if [ $USER_EXIT_CODE -ne 0 ]; then
        print_error "User app build failed with exit code $USER_EXIT_CODE"
    fi
    if [ $ADMIN_EXIT_CODE -ne 0 ]; then
        print_error "Admin app build failed with exit code $ADMIN_EXIT_CODE"
    fi
    exit 1
fi

# Step 4: Generate build report
print_status "Generating build report..."

# Create build report directory
mkdir -p build-reports

# Generate size analysis for each app
if command -v du &> /dev/null; then
    echo "📊 Build Size Report - $(date)" > build-reports/size-report.txt
    echo "===========================================" >> build-reports/size-report.txt
    echo "" >> build-reports/size-report.txt
    
    echo "User App Build Size:" >> build-reports/size-report.txt
    du -sh apps/sabo-user/dist/* >> build-reports/size-report.txt || echo "User app dist not found" >> build-reports/size-report.txt
    echo "" >> build-reports/size-report.txt
    
    echo "Admin App Build Size:" >> build-reports/size-report.txt
    du -sh apps/sabo-admin/dist/* >> build-reports/size-report.txt || echo "Admin app dist not found" >> build-reports/size-report.txt
    echo "" >> build-reports/size-report.txt
    
    echo "Shared Packages Size:" >> build-reports/size-report.txt
    du -sh packages/*/dist >> build-reports/size-report.txt || echo "Shared packages dist not found" >> build-reports/size-report.txt
    
    print_success "Build size report generated: build-reports/size-report.txt"
fi

# Step 5: Verify build integrity
print_status "Verifying build integrity..."

# Check if essential files exist
essential_files=(
    "apps/sabo-user/dist/index.html"
    "apps/sabo-admin/dist/index.html"
    "packages/shared-types/dist/index.js"
    "packages/shared-utils/dist/index.js"
    "packages/shared-ui/dist/index.js"
    "packages/shared-auth/dist/index.js"
    "packages/shared-hooks/dist/index.js"
)

for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file exists"
    else
        print_error "✗ $file missing"
        exit 1
    fi
done

print_success "Build integrity verified!"

echo ""
echo "🎉 SABO Arena build completed successfully!"
echo "📊 Check build-reports/size-report.txt for detailed size analysis"
echo "🚀 Ready for deployment!"
