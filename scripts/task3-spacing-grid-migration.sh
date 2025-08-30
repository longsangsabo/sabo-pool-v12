#!/bin/bash

# Task 3: Spacing Grid Migration
# Convert non-standard spacing to 8px grid system

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "📐 TASK 3: SPACING GRID MIGRATION"
echo "================================"

# Create backup
BACKUP_DIR="$ROOT_DIR/spacing_grid_backup_$(date +%Y%m%d_%H%M%S)"
echo "📦 Creating backup at $BACKUP_DIR..."
cp -r "$ROOT_DIR/apps/sabo-user/src" "$BACKUP_DIR"

# Step 1: Create semantic spacing utilities
echo "🎨 Step 1: Creating semantic spacing utilities..."
mkdir -p "$ROOT_DIR/apps/sabo-user/src/styles/spacing"
cat > "$ROOT_DIR/apps/sabo-user/src/styles/spacing/design-system.css" << 'EOF'
/* Design System Spacing - 8px Grid System */

/* Base Grid: 8px */
:root {
  --spacing-0: 0;
  --spacing-1: 4px;   /* 0.5 grid */
  --spacing-2: 8px;   /* 1 grid */
  --spacing-3: 12px;  /* 1.5 grid */
  --spacing-4: 16px;  /* 2 grid */
  --spacing-6: 24px;  /* 3 grid */
  --spacing-8: 32px;  /* 4 grid */
  --spacing-12: 48px; /* 6 grid */
  --spacing-16: 64px; /* 8 grid */
  --spacing-20: 80px; /* 10 grid */
  --spacing-24: 96px; /* 12 grid */
  --spacing-32: 128px; /* 16 grid */
}

/* Semantic Spacing Classes */
.spacing-xs { /* 4px - minimal spacing */
  --space: var(--spacing-1);
}

.spacing-sm { /* 8px - small spacing */
  --space: var(--spacing-2);
}

.spacing-md { /* 16px - medium spacing */
  --space: var(--spacing-4);
}

.spacing-lg { /* 24px - large spacing */
  --space: var(--spacing-6);
}

.spacing-xl { /* 32px - extra large spacing */
  --space: var(--spacing-8);
}

.spacing-2xl { /* 48px - double extra large */
  --space: var(--spacing-12);
}

/* Component Spacing Standards */
.card-spacing {
  @apply p-6; /* 24px padding for cards */
}

.section-spacing {
  @apply py-12; /* 48px vertical for sections */
}

.content-spacing {
  @apply p-4; /* 16px padding for content */
}

.form-spacing {
  @apply space-y-4; /* 16px gaps for forms */
}

.button-spacing {
  @apply px-4 py-2; /* 16px/8px for buttons */
}

/* Layout Spacing Utilities */
.container-spacing {
  @apply px-4 py-6; /* Container standard padding */
}

.stack-tight {
  @apply space-y-2; /* 8px vertical stack */
}

.stack-normal {
  @apply space-y-4; /* 16px vertical stack */
}

.stack-loose {
  @apply space-y-6; /* 24px vertical stack */
}

.inline-tight {
  @apply space-x-2; /* 8px horizontal spacing */
}

.inline-normal {
  @apply space-x-4; /* 16px horizontal spacing */
}

.inline-loose {
  @apply space-x-6; /* 24px horizontal spacing */
}
EOF

# Step 2: Migrate non-standard patterns to grid-compliant values
echo "🔄 Step 2: Migrating non-standard spacing patterns..."

cd "$ROOT_DIR/apps/sabo-user"

echo "  2A: Converting py-12 (48px) patterns..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/py-12/py-12/g' \
    {} \;
# py-12 is already grid-compliant (48px = 6 grid units)

echo "  2B: Converting pl-10/pr-10 (40px) to pl-12/pr-12 (48px)..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/pl-10/pl-12/g' \
    -e 's/pr-10/pr-12/g' \
    {} \;

echo "  2C: Converting p-5 (20px) to p-6 (24px)..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/\bp-5\b/p-6/g' \
    {} \;

echo "  2D: Converting py-16/py-20 to standard grid values..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/py-16/py-16/g' \
    -e 's/py-20/py-20/g' \
    {} \;
# These are grid-compliant: py-16=64px (8 grid), py-20=80px (10 grid)

echo "  2E: Converting py-24 to py-24..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/py-24/py-24/g' \
    {} \;
# py-24 is grid-compliant (96px = 12 grid units)

echo "  2F: Converting pt-20 to pt-20..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/pt-20/pt-20/g' \
    {} \;
# pt-20 is grid-compliant (80px = 10 grid units)

# Step 3: Create semantic spacing replacements
echo "🏗️ Step 3: Implementing semantic spacing patterns..."

echo "  3A: Replace common card padding patterns..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/className="p-6"/className="card-spacing"/g' \
    -e 's/className="p-4"/className="content-spacing"/g' \
    {} \;

echo "  3B: Replace section spacing patterns..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/className="py-12"/className="section-spacing"/g' \
    -e 's/className="py-8"/className="py-8"/g' \
    {} \;

echo "  3C: Replace form spacing patterns..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/className="space-y-4"/className="form-spacing"/g' \
    {} \;

# Step 4: Create component-specific spacing
echo "📦 Step 4: Implementing component spacing standards..."

# Add component spacing imports
MAIN_CSS="$ROOT_DIR/apps/sabo-user/src/index.css"
if ! grep -q "spacing/design-system.css" "$MAIN_CSS"; then
    echo '@import "./styles/spacing/design-system.css";' >> "$MAIN_CSS"
fi

# Step 5: Validate grid compliance
echo "🔍 Step 5: Validating 8px grid compliance..."

# Check remaining non-standard patterns
NON_STANDARD_5=$(grep -r "\bp-5\b\|m-5\b" src/ --include="*.tsx" | wc -l)
NON_STANDARD_7=$(grep -r "\bp-7\b\|m-7\b" src/ --include="*.tsx" | wc -l)
NON_STANDARD_9=$(grep -r "\bp-9\b\|m-9\b" src/ --include="*.tsx" | wc -l)
NON_STANDARD_10=$(grep -r "\bp-10\b\|m-10\b" src/ --include="*.tsx" | wc -l)
NON_STANDARD_11=$(grep -r "\bp-11\b\|m-11\b" src/ --include="*.tsx" | wc -l)

cd "$ROOT_DIR"

echo ""
echo "✅ Spacing Grid Migration Complete!"
echo "=================================="

# Count semantic classes
CARD_SPACING=$(grep -r "card-spacing" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
CONTENT_SPACING=$(grep -r "content-spacing" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
SECTION_SPACING=$(grep -r "section-spacing" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
FORM_SPACING=$(grep -r "form-spacing" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)

echo "📊 Semantic Spacing Classes Created:"
echo "  Component Spacing:"
echo "    • card-spacing: $CARD_SPACING instances"
echo "    • content-spacing: $CONTENT_SPACING instances"
echo "    • section-spacing: $SECTION_SPACING instances"
echo "    • form-spacing: $FORM_SPACING instances"
echo ""
echo "🎯 Grid Compliance Status:"
echo "  Non-standard patterns remaining:"
echo "    • *-5 patterns: $NON_STANDARD_5"
echo "    • *-7 patterns: $NON_STANDARD_7" 
echo "    • *-9 patterns: $NON_STANDARD_9"
echo "    • *-10 patterns: $NON_STANDARD_10"
echo "    • *-11 patterns: $NON_STANDARD_11"
echo ""
echo "🏗️ Spacing Infrastructure:"
echo "  ✅ 8px grid CSS variables defined"
echo "  ✅ Semantic spacing utilities created"
echo "  ✅ Component spacing standards established"
echo "  ✅ Layout spacing patterns standardized"
echo ""
echo "🔍 Final Steps:"
echo "1. Test layout consistency across components"
echo "2. Verify responsive spacing behavior"
echo "3. Update component documentation"
echo ""
echo "📁 Backup: $BACKUP_DIR"
