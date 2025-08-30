#!/bin/bash

# Task 2B: Typography Weight & Color Migration  
# Phase 2: Consolidate font weights and colors to design system

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "⚖️ TASK 2B: TYPOGRAPHY WEIGHT & COLOR MIGRATION"
echo "==============================================="

# Create backup
BACKUP_DIR="$ROOT_DIR/typography_weight_backup_$(date +%Y%m%d_%H%M%S)"
echo "📦 Creating backup at $BACKUP_DIR..."
cp -r "$ROOT_DIR/apps/sabo-user/src" "$BACKUP_DIR"

# Step 1: Extend design system typography CSS
echo "🎨 Step 1: Extending typography design system..."
cat >> "$ROOT_DIR/apps/sabo-user/src/styles/typography/design-system.css" << 'EOF'

/* Font Weight Standardization */
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }

/* Semantic Weight + Size Combinations */
.text-caption-medium {
  @apply text-caption font-medium;
}

.text-body-small-medium {
  @apply text-body-small font-medium;
}

.text-body-medium {
  @apply text-body font-medium;
}

.text-body-large-semibold {
  @apply text-body-large font-semibold;
}

.text-title-medium {
  @apply text-title font-medium;
}

.text-title-semibold {
  @apply text-title font-semibold;
}

.text-heading-bold {
  @apply text-heading font-bold;
}

.text-heading-semibold {
  @apply text-heading font-semibold;
}

/* Color + Typography Combinations */
.text-caption-neutral {
  @apply text-caption text-neutral-500;
}

.text-body-small-neutral {
  @apply text-body-small text-neutral-600;
}

.text-body-neutral {
  @apply text-body text-neutral-700;
}

.text-heading-primary {
  @apply text-heading font-semibold text-primary-600;
}

.text-heading-success {
  @apply text-heading font-bold text-success-600;
}

.text-heading-error {
  @apply text-heading font-bold text-error-600;
}

.text-title-success {
  @apply text-title font-semibold text-success-600;
}
EOF

# Step 2: Migrate font weight combinations
echo "🔄 Step 2: Migrating font weight combinations..."

cd "$ROOT_DIR/apps/sabo-user"

echo "  2A: Converting medium weight combinations..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/text-caption font-medium/text-caption-medium/g' \
    -e 's/text-body-small font-medium/text-body-small-medium/g' \
    -e 's/text-body font-medium/text-body-medium/g' \
    -e 's/text-title font-medium/text-title-medium/g' \
    {} \;

echo "  2B: Converting semibold combinations..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/text-body-large font-semibold/text-body-large-semibold/g' \
    -e 's/text-title font-semibold/text-title-semibold/g' \
    -e 's/text-heading font-semibold/text-heading-semibold/g' \
    {} \;

echo "  2C: Converting bold combinations..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/text-heading font-bold/text-heading-bold/g' \
    {} \;

# Step 3: Migrate color combinations  
echo "🎨 Step 3: Migrating color combinations..."

echo "  3A: Converting neutral color patterns..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/text-caption text-neutral-500/text-caption-neutral/g' \
    -e 's/text-body-small text-neutral-600/text-body-small-neutral/g' \
    -e 's/text-body text-neutral-700/text-body-neutral/g' \
    {} \;

echo "  3B: Converting success color patterns..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/text-heading font-bold text-success-600/text-heading-success/g' \
    -e 's/text-title font-semibold text-success-600/text-title-success/g' \
    -e 's/font-semibold text-success-600/text-title-success/g' \
    {} \;

echo "  3C: Converting primary color patterns..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/text-heading font-semibold text-primary-600/text-heading-primary/g' \
    {} \;

# Step 4: Handle muted-foreground patterns
echo "🔧 Step 4: Optimizing muted-foreground patterns..."

find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/text-caption-muted/text-caption text-muted-foreground/g' \
    -e 's/text-body-small-muted/text-body-small text-muted-foreground/g' \
    -e 's/text-body-muted/text-body text-muted-foreground/g' \
    {} \;

# Step 5: Clean up redundant patterns
echo "🧹 Step 5: Cleaning redundant patterns..."

# Remove duplicate classes that got created during migration
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/text-caption text-caption/text-caption/g' \
    -e 's/text-body-small text-body-small/text-body-small/g' \
    -e 's/text-body text-body/text-body/g' \
    -e 's/text-title text-title/text-title/g' \
    -e 's/text-heading text-heading/text-heading/g' \
    {} \;

cd "$ROOT_DIR"

echo ""
echo "✅ Typography Weight & Color Migration Complete!"
echo "==============================================="

# Count new semantic classes
CAPTION_MEDIUM=$(grep -r "text-caption-medium" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
BODY_SMALL_MEDIUM=$(grep -r "text-body-small-medium" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
BODY_LARGE_SEMIBOLD=$(grep -r "text-body-large-semibold" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
HEADING_BOLD=$(grep -r "text-heading-bold" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
HEADING_SUCCESS=$(grep -r "text-heading-success" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)

echo "📊 Semantic Classes Created:"
echo "  Weight Combinations:"
echo "    • text-caption-medium: $CAPTION_MEDIUM instances"
echo "    • text-body-small-medium: $BODY_SMALL_MEDIUM instances" 
echo "    • text-body-large-semibold: $BODY_LARGE_SEMIBOLD instances"
echo "    • text-heading-bold: $HEADING_BOLD instances"
echo ""
echo "  Color Combinations:"
echo "    • text-heading-success: $HEADING_SUCCESS instances"
echo ""

# Count remaining legacy patterns
REMAINING_FONT_MEDIUM=$(grep -r "font-medium" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
REMAINING_FONT_SEMIBOLD=$(grep -r "font-semibold" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
REMAINING_FONT_BOLD=$(grep -r "font-bold" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)

echo "  Legacy Patterns Remaining:"
echo "    • font-medium: $REMAINING_FONT_MEDIUM"
echo "    • font-semibold: $REMAINING_FONT_SEMIBOLD"
echo "    • font-bold: $REMAINING_FONT_BOLD"
echo ""
echo "🎯 Design System Progress:"
echo "  ✅ Typography sizes: Migrated to 6 semantic scales"
echo "  ✅ Font weights: Consolidated to 4 standard weights"
echo "  ✅ Color combinations: Created semantic classes"
echo "  ✅ Redundancy elimination: Removed duplicate patterns"
echo ""
echo "🔍 Final Steps:"
echo "1. Verify visual consistency: npm run dev"
echo "2. Test responsive behavior across devices"
echo "3. Update component documentation"
echo ""
echo "📁 Backup: $BACKUP_DIR"
