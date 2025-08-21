#!/bin/bash
# Admin Cleanup Strategy - Phase 1: Analysis & Backup
# SAFE CLEANUP FOR ADMIN PAGES

echo "🧹 ADMIN CLEANUP COPILOT - PHASE 1: ANALYSIS"
echo "============================================="

# Create backup directory
mkdir -p .admin-cleanup-backup/$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=".admin-cleanup-backup/$(date +%Y%m%d_%H%M%S)"

echo "📦 Creating backup in: $BACKUP_DIR"

# Backup all admin pages before cleanup
cp -r src/pages/admin $BACKUP_DIR/
cp -r src/components/admin $BACKUP_DIR/
cp src/router/OptimizedAdminRouter.tsx $BACKUP_DIR/
cp src/router/AdminRouter.tsx $BACKUP_DIR/

echo "✅ Backup completed!"

# Analyze admin pages usage
echo ""
echo "📊 ADMIN PAGES ANALYSIS:"
echo "========================"

echo "🔍 Checking router usage..."
grep -r "import.*admin" src/router/ || echo "No admin imports found in router"

echo ""
echo "🔍 Checking actual route definitions..."
grep -r "AdminUsers\|AdminClubs\|AdminAnalytics" src/router/ || echo "No admin routes found"

echo ""
echo "🔍 Current admin files count:"
find src/pages/admin -name "*.tsx" | wc -l
echo "Admin page files found"

echo ""
echo "✅ Phase 1 completed - Backup created safely!"
echo "   Next: Run Phase 2 to identify duplicates"
