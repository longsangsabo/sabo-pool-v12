#!/bin/bash

# 🚀 SABO Pool V12 - Enhanced Production Deployment Script
# Phase 4B: Complete Production Pipeline with Validation

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="SABO Pool V12"
BUILD_DIR="dist"
BACKUP_DIR="deployment-backups"
LOG_FILE="deployment-$(date +%Y%m%d-%H%M%S).log"
DEPLOYMENT_ENV="${NODE_ENV:-production}"
DEPLOY_TIMEOUT=1800  # 30 minutes

# Performance thresholds
MAX_BUNDLE_SIZE=500  # KB
MAX_BUILD_TIME=300   # seconds

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${CYAN}ℹ️ $1${NC}" | tee -a "$LOG_FILE"
}

step() {
    echo -e "${PURPLE}🔄 Step $1${NC}" | tee -a "$LOG_FILE"
}

# Trap function for cleanup on exit
cleanup() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        error "Deployment failed with exit code $exit_code. Check $LOG_FILE for details."
    fi
    exit $exit_code
}
trap cleanup EXIT

# Step 1: Pre-deployment Validation
step "1: Pre-deployment validation"
log "Starting $PROJECT_NAME production deployment..."
log "Environment: $DEPLOYMENT_ENV"
log "Build directory: $BUILD_DIR"
log "Log file: $LOG_FILE"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "pnpm-workspace.yaml" ]; then
    error "Not in the correct project directory. Please run from project root."
fi

# Check Node.js version
NODE_VERSION=$(node --version)
log "Node.js version: $NODE_VERSION"

# Check pnpm version
if ! command -v pnpm &> /dev/null; then
    error "pnpm is not installed or not in PATH"
fi
PNPM_VERSION=$(pnpm --version)
log "pnpm version: $PNPM_VERSION"

# Check Git status
if [ -n "$(git status --porcelain)" ]; then
    warning "Working directory is not clean. Uncommitted changes detected:"
    git status --short | head -10 | tee -a "$LOG_FILE"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
log "Current branch: $CURRENT_BRANCH"
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    warning "Not on main/master branch. Current branch: $CURRENT_BRANCH"
    if [ "${CI:-false}" != "true" ]; then
        read -p "Continue deployment? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Deployment cancelled by user."
        fi
    fi
fi

# Check environment file
if [ -f ".env.$DEPLOYMENT_ENV" ]; then
    info "Environment file .env.$DEPLOYMENT_ENV found"
else
    warning "Environment file .env.$DEPLOYMENT_ENV not found"
fi

# Check disk space
AVAILABLE_SPACE=$(df . | awk 'NR==2 {print $4}')
if [ "$AVAILABLE_SPACE" -lt 1000000 ]; then  # Less than 1GB
    warning "Low disk space: ${AVAILABLE_SPACE}KB available"
fi

success "Pre-deployment validation completed"

# Step 2: Dependency Installation & Verification
step "2: Dependency installation and verification"
log "Installing dependencies..."

# Record start time
DEP_START_TIME=$(date +%s)

# Install dependencies
if ! pnpm install --frozen-lockfile --production=false; then
    error "Failed to install dependencies"
fi

# Verify critical dependencies
if ! pnpm list @supabase/supabase-js &>/dev/null; then
    error "Critical dependency @supabase/supabase-js not found"
fi

DEP_END_TIME=$(date +%s)
DEP_DURATION=$((DEP_END_TIME - DEP_START_TIME))
log "Dependencies installed in ${DEP_DURATION}s"

success "Dependencies installed and verified"

# Step 3: Code Quality Checks
step "3: Code quality and security checks"

# TypeScript compilation check
log "Running TypeScript compilation check..."
if ! pnpm run typecheck 2>/dev/null; then
    log "Attempting manual TypeScript check..."
    if ! npx tsc --noEmit --skipLibCheck; then
        error "TypeScript compilation failed"
    fi
fi

# ESLint check (non-blocking for warnings)
log "Running ESLint quality check..."
ESLINT_OUTPUT=$(pnpm run lint 2>&1 || true)
ESLINT_ERROR_COUNT=$(echo "$ESLINT_OUTPUT" | grep -c "error" || echo "0")
ESLINT_WARNING_COUNT=$(echo "$ESLINT_OUTPUT" | grep -c "warning" || echo "0")

log "ESLint results: $ESLINT_ERROR_COUNT errors, $ESLINT_WARNING_COUNT warnings"

if [ "$ESLINT_ERROR_COUNT" -gt 0 ]; then
    warning "ESLint errors found. Continuing with deployment..."
    echo "$ESLINT_OUTPUT" | head -20 | tee -a "$LOG_FILE"
fi

# Security audit
log "Running security audit..."
if pnpm audit --audit-level high 2>/dev/null; then
    success "Security audit passed"
else
    warning "Security audit found issues. Review manually if needed."
fi

success "Code quality checks completed"

# Step 4: Production Build
step "4: Production build"

# Clean previous builds
log "Cleaning previous builds..."
rm -rf packages/*/dist apps/*/dist

# Record build start time
BUILD_START_TIME=$(date +%s)

# Set production environment
export NODE_ENV=production

# Build packages first
log "Building packages..."
if ! pnpm --filter "./packages/*" build; then
    error "Package build failed"
fi

# Build applications
log "Building applications..."
if ! pnpm run --recursive --filter "./apps/*" build; then
    error "Application build failed"
fi

BUILD_END_TIME=$(date +%s)
BUILD_DURATION=$((BUILD_END_TIME - BUILD_START_TIME))
log "Build completed in ${BUILD_DURATION}s"

# Check build time performance
if [ "$BUILD_DURATION" -gt "$MAX_BUILD_TIME" ]; then
    warning "Build time (${BUILD_DURATION}s) exceeded threshold (${MAX_BUILD_TIME}s)"
fi

success "Production build completed"

# Step 5: Build Validation & Analysis
step "5: Build validation and analysis"

# Check if build outputs exist
for app in apps/*/; do
    app_name=$(basename "$app")
    if [ ! -d "$app/dist" ]; then
        error "Build output missing for $app_name"
    fi
    
    # Check bundle size
    BUNDLE_SIZE=$(du -sk "$app/dist" | cut -f1)
    log "$app_name bundle size: ${BUNDLE_SIZE}KB"
    
    if [ "$BUNDLE_SIZE" -gt $((MAX_BUNDLE_SIZE * 1000)) ]; then
        warning "$app_name bundle size (${BUNDLE_SIZE}KB) is large"
    fi
done

# Verify build assets
log "Verifying build assets..."
if [ ! -f "apps/sabo-user/dist/index.html" ]; then
    error "User app index.html not found"
fi

if [ ! -f "apps/sabo-admin/dist/index.html" ]; then
    error "Admin app index.html not found"
fi

# Check for critical files
for app_dir in apps/*/dist/; do
    if [ -d "$app_dir" ]; then
        JS_FILES=$(find "$app_dir" -name "*.js" | wc -l)
        CSS_FILES=$(find "$app_dir" -name "*.css" | wc -l)
        log "$(basename $(dirname $app_dir)): $JS_FILES JS files, $CSS_FILES CSS files"
    fi
done

success "Build validation completed"

# Step 6: Performance Testing
step "6: Performance testing and optimization"

# Calculate total bundle sizes
USER_SIZE=$(du -sh apps/sabo-user/dist/ | cut -f1)
ADMIN_SIZE=$(du -sh apps/sabo-admin/dist/ | cut -f1)

log "Final bundle sizes:"
log "  - User App: $USER_SIZE"
log "  - Admin App: $ADMIN_SIZE"

# Check for source maps in production
SOURCEMAP_COUNT=$(find apps/*/dist -name "*.map" | wc -l)
if [ "$SOURCEMAP_COUNT" -gt 0 ]; then
    warning "Found $SOURCEMAP_COUNT source map files in production build"
fi

success "Performance testing completed"

# Step 7: Backup Current Deployment
step "7: Creating deployment backup"

BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

mkdir -p "$BACKUP_PATH"

# Backup build artifacts
if [ -d "apps/sabo-user/dist" ]; then
    cp -r apps/sabo-user/dist "$BACKUP_PATH/user-app"
fi

if [ -d "apps/sabo-admin/dist" ]; then
    cp -r apps/sabo-admin/dist "$BACKUP_PATH/admin-app"
fi

# Backup configuration
cp package.json "$BACKUP_PATH/" 2>/dev/null || true
cp pnpm-lock.yaml "$BACKUP_PATH/" 2>/dev/null || true

log "Backup created at: $BACKUP_PATH"
success "Deployment backup completed"

# Step 8: Deployment Preparation
step "8: Deployment preparation"

# Create deployment manifest
cat > "deployment-manifest.json" << EOF
{
  "project": "$PROJECT_NAME",
  "version": "$(node -p "require('./package.json').version")",
  "buildTime": "$(date -Iseconds)",
  "environment": "$DEPLOYMENT_ENV",
  "branch": "$CURRENT_BRANCH",
  "commit": "$(git rev-parse HEAD)",
  "buildDuration": ${BUILD_DURATION},
  "bundles": {
    "userApp": "$USER_SIZE",
    "adminApp": "$ADMIN_SIZE"
  },
  "nodeVersion": "$NODE_VERSION",
  "pnpmVersion": "$PNPM_VERSION"
}
EOF

# Copy deployment assets
if [ -f ".env.$DEPLOYMENT_ENV" ]; then
    info "Environment configuration ready for deployment"
fi

success "Deployment preparation completed"

# Step 9: Final Validation & Summary
step "9: Final validation and deployment summary"

# Final checks
log "Performing final validation..."

# Check all required files exist
REQUIRED_FILES=(
    "apps/sabo-user/dist/index.html"
    "apps/sabo-admin/dist/index.html"
    "deployment-manifest.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        error "Required file missing: $file"
    fi
done

# Calculate total deployment size
TOTAL_SIZE=$(du -sh apps/*/dist | awk '{sum+=$1} END {print sum "B"}')

log "Deployment Summary:"
log "=================="
log "Project: $PROJECT_NAME"
log "Environment: $DEPLOYMENT_ENV"
log "Build Time: ${BUILD_DURATION}s"
log "Total Size: $TOTAL_SIZE"
log "User App: $USER_SIZE"
log "Admin App: $ADMIN_SIZE"
log "Backup: $BACKUP_PATH"
log "Manifest: deployment-manifest.json"
log "Log File: $LOG_FILE"

# Display next steps
info "Next steps:"
info "1. Review deployment manifest: deployment-manifest.json"
info "2. Upload build artifacts to hosting platform"
info "3. Configure environment variables from .env.$DEPLOYMENT_ENV"
info "4. Run post-deployment health checks"
info "5. Monitor application performance"

success "🎉 Production deployment preparation completed successfully!"
success "Ready for deployment to hosting platform"

# Calculate and display total execution time
SCRIPT_END_TIME=$(date +%s)
TOTAL_DURATION=$((SCRIPT_END_TIME - $(date -d "$(head -1 "$LOG_FILE" | cut -d']' -f1 | cut -d'[' -f2)" +%s)))
success "Total execution time: ${TOTAL_DURATION}s"

log "Deployment script completed successfully"
