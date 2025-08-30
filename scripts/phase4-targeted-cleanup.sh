#!/bin/bash

# Phase 4: Targeted Inline Styles Elimination
# Focus on high-impact files for immediate reduction

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🎯 PHASE 4B: TARGETED INLINE STYLES ELIMINATION"
echo "==============================================="

# Create backup
BACKUP_DIR="$ROOT_DIR/targeted_cleanup_backup_$(date +%Y%m%d_%H%M%S)"
echo "📦 Creating backup at $BACKUP_DIR..."
cp -r "$ROOT_DIR/apps/sabo-user/src" "$BACKUP_DIR"

# Priority 1: Remove test page inline styles (highest count)
echo "🧪 Step 1: Cleaning test pages (low priority files)..."

# SABOStyleTestPage.tsx (19 inline styles) - Convert to CSS classes
if [ -f "$ROOT_DIR/apps/sabo-user/src/pages/SABOStyleTestPage.tsx" ]; then
    echo "Converting SABOStyleTestPage.tsx..."
    
    # Create accompanying CSS file for test styles
    cat > "$ROOT_DIR/apps/sabo-user/src/styles/sabo-test-page.css" << 'EOF'
.test-page-container {
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.test-page-title {
  text-align: center;
  margin-bottom: 30px;
  font-family: 'Oswald', 'Bebas Neue', sans-serif;
  font-size: 36px;
  font-weight: 700;
  font-stretch: condensed;
  background: linear-gradient(to right, #1d4ed8, #7c3aed, #1e40af, #ffffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.1em;
  line-height: 0.9;
  filter: brightness(1.1);
  font-variant: small-caps;
}

.test-section {
  margin-bottom: 40px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.test-section-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #1f2937;
}
EOF

    # Replace inline styles with CSS classes in the component
    sed -i 's/style={{[^}]*padding: '\''20px'\''[^}]*}}/className="test-page-container"/g' \
        "$ROOT_DIR/apps/sabo-user/src/pages/SABOStyleTestPage.tsx"
    
    sed -i 's/style={{[^}]*textAlign: '\''center'\''[^}]*}}/className="test-page-title"/g' \
        "$ROOT_DIR/apps/sabo-user/src/pages/SABOStyleTestPage.tsx"
fi

# RankTestPage.tsx (11 inline styles)
if [ -f "$ROOT_DIR/apps/sabo-user/src/pages/RankTestPage.tsx" ]; then
    echo "Converting RankTestPage.tsx..."
    
    cat > "$ROOT_DIR/apps/sabo-user/src/styles/rank-test-page.css" << 'EOF'
.rank-test-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.rank-test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.rank-card {
  padding: 16px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
EOF

    # Replace simple inline styles
    sed -i 's/style={{ padding: '\''24px'\'' }}/className="rank-test-container"/g' \
        "$ROOT_DIR/apps/sabo-user/src/pages/RankTestPage.tsx"
fi

# Priority 2: Convert component inline styles to CSS custom properties
echo "🔧 Step 2: Converting component dynamic styles..."

# Create CSS custom properties for dynamic values
cat > "$ROOT_DIR/apps/sabo-user/src/styles/dynamic-utilities.css" << 'EOF'
/* Dynamic CSS utilities for inline style replacement */

.avatar-size-dynamic {
  width: var(--avatar-size, 48px);
  height: var(--avatar-size, 48px);
}

.progress-dynamic {
  width: var(--progress-width, 0%);
}

.animation-delay-dynamic {
  animation-delay: var(--delay, 0s);
}

.transform-dynamic {
  transform: var(--transform-value, none);
}

/* Size variants */
.size-sm { --avatar-size: 32px; }
.size-md { --avatar-size: 48px; }
.size-lg { --avatar-size: 64px; }
.size-xl { --avatar-size: 80px; }
.size-2xl { --avatar-size: 96px; }
.size-3xl { --avatar-size: 128px; }
EOF

# Priority 3: Update main CSS with new utilities
echo "📝 Step 3: Adding utility imports..."
MAIN_CSS="$ROOT_DIR/apps/sabo-user/src/index.css"

# Add test page styles
if ! grep -q "sabo-test-page.css" "$MAIN_CSS"; then
    echo '@import "./styles/sabo-test-page.css";' >> "$MAIN_CSS"
fi

if ! grep -q "rank-test-page.css" "$MAIN_CSS"; then
    echo '@import "./styles/rank-test-page.css";' >> "$MAIN_CSS"
fi

if ! grep -q "dynamic-utilities.css" "$MAIN_CSS"; then
    echo '@import "./styles/dynamic-utilities.css";' >> "$MAIN_CSS"
fi

# Priority 4: Create simple replacements for common patterns
echo "🔄 Step 4: Simple pattern replacements..."

# Replace common patterns across all files
find "$ROOT_DIR/apps/sabo-user/src" -name "*.tsx" -type f -exec sed -i \
    -e 's/style={{ display: '\''flex'\'' }}/className="flex"/g' \
    -e 's/style={{ display: '\''block'\'' }}/className="block"/g' \
    -e 's/style={{ display: '\''none'\'' }}/className="hidden"/g' \
    -e 's/style={{ textAlign: '\''center'\'' }}/className="text-center"/g' \
    -e 's/style={{ textAlign: '\''left'\'' }}/className="text-left"/g' \
    -e 's/style={{ textAlign: '\''right'\'' }}/className="text-right"/g' \
    -e 's/style={{ fontWeight: '\''bold'\'' }}/className="font-bold"/g' \
    -e 's/style={{ fontWeight: 600 }}/className="font-semibold"/g' \
    -e 's/style={{ fontSize: '\''14px'\'' }}/className="text-sm"/g' \
    -e 's/style={{ fontSize: '\''16px'\'' }}/className="text-base"/g' \
    -e 's/style={{ fontSize: '\''18px'\'' }}/className="text-lg"/g' \
    -e 's/style={{ margin: '\''0 auto'\'' }}/className="mx-auto"/g' \
    -e 's/style={{ marginTop: '\''16px'\'' }}/className="mt-4"/g' \
    -e 's/style={{ marginBottom: '\''16px'\'' }}/className="mb-4"/g' \
    -e 's/style={{ padding: '\''8px'\'' }}/className="p-2"/g' \
    -e 's/style={{ padding: '\''16px'\'' }}/className="p-4"/g' \
    -e 's/style={{ padding: '\''24px'\'' }}/className="p-6"/g' \
    {} \;

echo ""
echo "✅ Targeted Inline Styles Cleanup Complete!"
echo "==========================================="

# Count remaining styles
REMAINING=$(grep -r "style=" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
echo "📊 Remaining inline styles: $REMAINING (reduced from 156)"

# Calculate reduction
ELIMINATED=$((156 - REMAINING))
PERCENTAGE=$((ELIMINATED * 100 / 156))
echo "🎯 Eliminated: $ELIMINATED inline styles ($PERCENTAGE% reduction)"

echo ""
echo "🔍 Verification:"
echo "cd apps/sabo-user && npm run build"
echo "📁 Backup: $BACKUP_DIR"
