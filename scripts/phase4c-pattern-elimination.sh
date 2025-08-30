#!/bin/bash

# Phase 4C: Specific Pattern Elimination
# Target exact inline style patterns for replacement

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🔧 PHASE 4C: SPECIFIC PATTERN ELIMINATION"
echo "=========================================="

# Create backup
BACKUP_DIR="$ROOT_DIR/specific_patterns_backup_$(date +%Y%m%d_%H%M%S)"
echo "📦 Creating backup at $BACKUP_DIR..."
cp -r "$ROOT_DIR/apps/sabo-user/src" "$BACKUP_DIR"

# Step 1: Replace z-index patterns (very common)
echo "🔢 Step 1: Converting z-index patterns..."
find "$ROOT_DIR/apps/sabo-user/src" -name "*.tsx" -type f -exec sed -i \
    -e 's/style={{ zIndex: 1 }}/className="z-10"/g' \
    -e 's/style={{ zIndex: 10 }}/className="z-20"/g' \
    -e 's/style={{ zIndex: 2 }}/className="z-20"/g' \
    -e 's/style={{ zIndex: 5 }}/className="z-10"/g' \
    {} \;

# Step 2: Replace minWidth/minHeight patterns
echo "📐 Step 2: Converting size constraints..."
find "$ROOT_DIR/apps/sabo-user/src" -name "*.tsx" -type f -exec sed -i \
    -e "s/style={{ minWidth: '100px', minHeight: '100px' }}/className=\"min-w-[100px] min-h-[100px]\"/g" \
    -e "s/style={{ minWidth: '50px', minHeight: '50px' }}/className=\"min-w-[50px] min-h-[50px]\"/g" \
    -e "s/style={{ width: '100%' }}/className=\"w-full\"/g" \
    -e "s/style={{ height: '100%' }}/className=\"h-full\"/g" \
    {} \;

# Step 3: Replace common flex patterns
echo "📦 Step 3: Converting flex patterns..."
find "$ROOT_DIR/apps/sabo-user/src" -name "*.tsx" -type f -exec sed -i \
    -e "s/style={{ display: 'flex', alignItems: 'center' }}/className=\"flex items-center\"/g" \
    -e "s/style={{ display: 'flex', justifyContent: 'center' }}/className=\"flex justify-center\"/g" \
    -e "s/style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}/className=\"flex items-center justify-center\"/g" \
    -e "s/style={{ display: 'flex', flexDirection: 'column' }}/className=\"flex flex-col\"/g" \
    {} \;

# Step 4: Replace position patterns
echo "🎯 Step 4: Converting position patterns..."
find "$ROOT_DIR/apps/sabo-user/src" -name "*.tsx" -type f -exec sed -i \
    -e "s/style={{ position: 'relative' }}/className=\"relative\"/g" \
    -e "s/style={{ position: 'absolute' }}/className=\"absolute\"/g" \
    -e "s/style={{ position: 'fixed' }}/className=\"fixed\"/g" \
    {} \;

# Step 5: Replace color patterns
echo "🎨 Step 5: Converting color patterns..."
find "$ROOT_DIR/apps/sabo-user/src" -name "*.tsx" -type f -exec sed -i \
    -e "s/style={{ color: 'white' }}/className=\"text-white\"/g" \
    -e "s/style={{ color: 'black' }}/className=\"text-black\"/g" \
    -e "s/style={{ backgroundColor: 'white' }}/className=\"bg-white\"/g" \
    -e "s/style={{ backgroundColor: 'transparent' }}/className=\"bg-transparent\"/g" \
    {} \;

# Step 6: Replace margin/padding patterns
echo "📏 Step 6: Converting spacing patterns..."
find "$ROOT_DIR/apps/sabo-user/src" -name "*.tsx" -type f -exec sed -i \
    -e "s/style={{ margin: '0' }}/className=\"m-0\"/g" \
    -e "s/style={{ marginTop: '0' }}/className=\"mt-0\"/g" \
    -e "s/style={{ marginBottom: '0' }}/className=\"mb-0\"/g" \
    -e "s/style={{ padding: '0' }}/className=\"p-0\"/g" \
    -e "s/style={{ paddingTop: '0' }}/className=\"pt-0\"/g" \
    -e "s/style={{ paddingBottom: '0' }}/className=\"pb-0\"/g" \
    {} \;

# Step 7: Replace cursor patterns
echo "👆 Step 7: Converting cursor patterns..."
find "$ROOT_DIR/apps/sabo-user/src" -name "*.tsx" -type f -exec sed -i \
    -e "s/style={{ cursor: 'pointer' }}/className=\"cursor-pointer\"/g" \
    -e "s/style={{ cursor: 'default' }}/className=\"cursor-default\"/g" \
    -e "s/style={{ cursor: 'not-allowed' }}/className=\"cursor-not-allowed\"/g" \
    {} \;

# Step 8: Replace overflow patterns
echo "📦 Step 8: Converting overflow patterns..."
find "$ROOT_DIR/apps/sabo-user/src" -name "*.tsx" -type f -exec sed -i \
    -e "s/style={{ overflow: 'hidden' }}/className=\"overflow-hidden\"/g" \
    -e "s/style={{ overflowX: 'hidden' }}/className=\"overflow-x-hidden\"/g" \
    -e "s/style={{ overflowY: 'hidden' }}/className=\"overflow-y-hidden\"/g" \
    -e "s/style={{ overflow: 'auto' }}/className=\"overflow-auto\"/g" \
    {} \;

echo ""
echo "✅ Specific Pattern Elimination Complete!"
echo "========================================"

# Count remaining styles
REMAINING=$(grep -r "style=" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
echo "📊 Remaining inline styles: $REMAINING"

# Calculate reduction from original 156
ORIGINAL=156
ELIMINATED=$((ORIGINAL - REMAINING))
PERCENTAGE=$((ELIMINATED * 100 / ORIGINAL))
echo "🎯 Total eliminated: $ELIMINATED inline styles ($PERCENTAGE% reduction)"

echo ""
echo "🔍 Next Steps:"
echo "1. cd apps/sabo-user && npm run build"
echo "2. Review remaining patterns: grep -r 'style=' src/ --include='*.tsx' | head -10"
echo "📁 Backup: $BACKUP_DIR"
