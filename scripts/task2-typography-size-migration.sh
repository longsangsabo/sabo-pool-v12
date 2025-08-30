#!/bin/bash

# Task 2: Typography Size Migration
# Phase 1: Convert size classes to design system scales

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "📝 TASK 2: TYPOGRAPHY SIZE MIGRATION"
echo "===================================="

# Create backup
BACKUP_DIR="$ROOT_DIR/typography_migration_backup_$(date +%Y%m%d_%H%M%S)"
echo "📦 Creating backup at $BACKUP_DIR..."
cp -r "$ROOT_DIR/apps/sabo-user/src" "$BACKUP_DIR"

# Step 1: Check if Typography components exist in shared-ui
echo "🔍 Step 1: Verifying Typography components..."
TYPOGRAPHY_EXPORTS="$ROOT_DIR/packages/shared-ui/src/Typography"
if [ ! -d "$TYPOGRAPHY_EXPORTS" ]; then
    echo "❌ Typography components not found. Creating them..."
    mkdir -p "$TYPOGRAPHY_EXPORTS"
    
    # Create Typography components based on design tokens
    cat > "$TYPOGRAPHY_EXPORTS/Typography.tsx" << 'EOF'
import React from 'react';
import { cn } from '../../../shared-utils/src/helpers';

interface TypographyProps {
  variant?: 'caption' | 'body-small' | 'body' | 'body-large' | 'title' | 'heading' | 'display';
  className?: string;
  children: React.ReactNode;
  component?: keyof JSX.IntrinsicElements;
}

const typographyVariants = {
  caption: 'text-xs leading-4',      // 12px/16px
  'body-small': 'text-sm leading-5',  // 14px/20px  
  body: 'text-base leading-6',        // 16px/24px
  'body-large': 'text-lg leading-7',  // 18px/28px
  title: 'text-xl leading-7',         // 20px/28px
  heading: 'text-2xl leading-8',      // 24px/32px
  display: 'text-3xl leading-9'       // 30px/36px
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  className = '',
  children,
  component: Component = 'p'
}) => {
  return (
    <Component 
      className={cn(typographyVariants[variant], className)}
    >
      {children}
    </Component>
  );
};
EOF

    # Create individual variant components
    cat > "$TYPOGRAPHY_EXPORTS/Caption.tsx" << 'EOF'
import React from 'react';
import { Typography } from './Typography';

interface CaptionProps {
  className?: string;
  children: React.ReactNode;
}

export const Caption: React.FC<CaptionProps> = ({ className, children }) => (
  <Typography variant="caption" component="span" className={className}>
    {children}
  </Typography>
);
EOF

    cat > "$TYPOGRAPHY_EXPORTS/BodyText.tsx" << 'EOF'
import React from 'react';
import { Typography } from './Typography';

interface BodyTextProps {
  size?: 'small' | 'base' | 'large';
  className?: string;
  children: React.ReactNode;
}

export const BodyText: React.FC<BodyTextProps> = ({ size = 'base', className, children }) => {
  const variant = size === 'small' ? 'body-small' : size === 'large' ? 'body-large' : 'body';
  
  return (
    <Typography variant={variant} className={className}>
      {children}
    </Typography>
  );
};
EOF

    cat > "$TYPOGRAPHY_EXPORTS/Heading.tsx" << 'EOF'
import React from 'react';
import { Typography } from './Typography';

interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  children: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({ level = 2, className, children }) => {
  const variant = level <= 2 ? 'heading' : level <= 4 ? 'title' : 'body-large';
  const component = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Typography variant={variant} component={component} className={className}>
      {children}
    </Typography>
  );
};
EOF

    # Update shared-ui exports
    echo "" >> "$ROOT_DIR/packages/shared-ui/src/index.ts"
    echo "// Typography Components" >> "$ROOT_DIR/packages/shared-ui/src/index.ts"
    echo "export { Typography } from './Typography/Typography';" >> "$ROOT_DIR/packages/shared-ui/src/index.ts"
    echo "export { Caption } from './Typography/Caption';" >> "$ROOT_DIR/packages/shared-ui/src/index.ts"
    echo "export { BodyText } from './Typography/BodyText';" >> "$ROOT_DIR/packages/shared-ui/src/index.ts"
    echo "export { Heading } from './Typography/Heading';" >> "$ROOT_DIR/packages/shared-ui/src/index.ts"
fi

# Step 2: Create CSS classes for design system typography
echo "🎨 Step 2: Creating design system typography classes..."
mkdir -p "$ROOT_DIR/apps/sabo-user/src/styles/typography"
cat > "$ROOT_DIR/apps/sabo-user/src/styles/typography/design-system.css" << 'EOF'
/* Design System Typography Classes */

.text-caption {
  font-size: 12px;
  line-height: 16px;
}

.text-body-small {
  font-size: 14px; 
  line-height: 20px;
}

.text-body {
  font-size: 16px;
  line-height: 24px;
}

.text-body-large {
  font-size: 18px;
  line-height: 28px;
}

.text-title {
  font-size: 20px;
  line-height: 28px;
}

.text-heading {
  font-size: 24px;
  line-height: 32px;
}

.text-display {
  font-size: 30px;
  line-height: 36px;
}

/* Semantic combinations with colors */
.text-caption-muted {
  @apply text-caption text-muted-foreground;
}

.text-body-small-muted {
  @apply text-body-small text-muted-foreground;
}

.text-body-muted {
  @apply text-body text-muted-foreground;
}

.text-heading-primary {
  @apply text-heading font-semibold text-foreground;
}

.text-title-medium {
  @apply text-title font-medium text-foreground;
}
EOF

# Step 3: Systematic size migration
echo "🔄 Step 3: Migrating typography sizes..."

cd "$ROOT_DIR/apps/sabo-user"

# Phase 3A: Simple size replacements (highest impact)
echo "  3A: Converting text-xs patterns..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/text-xs text-muted-foreground/text-caption-muted/g' \
    -e 's/text-xs text-neutral-500/text-caption text-neutral-500/g' \
    -e 's/text-xs"/text-caption"/g' \
    -e 's/text-xs /text-caption /g' \
    {} \;

echo "  3B: Converting text-sm patterns..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/text-sm text-muted-foreground/text-body-small-muted/g' \
    -e 's/text-sm font-medium/text-body-small font-medium/g' \
    -e 's/text-sm"/text-body-small"/g' \
    -e 's/text-sm /text-body-small /g' \
    {} \;

echo "  3C: Converting text-base patterns..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/text-base"/text-body"/g' \
    -e 's/text-base /text-body /g' \
    {} \;

echo "  3D: Converting text-lg patterns..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/text-lg font-semibold/text-body-large font-semibold/g' \
    -e 's/text-lg"/text-body-large"/g' \
    -e 's/text-lg /text-body-large /g' \
    {} \;

echo "  3E: Converting text-xl/2xl patterns..."
find src/ -name "*.tsx" -type f -exec sed -i \
    -e 's/text-2xl font-bold text-foreground/text-heading-primary/g' \
    -e 's/text-2xl font-bold/text-heading font-bold/g' \
    -e 's/text-xl"/text-title"/g' \
    -e 's/text-xl /text-title /g' \
    -e 's/text-2xl"/text-heading"/g' \
    -e 's/text-2xl /text-heading /g' \
    {} \;

# Step 4: Add CSS imports
echo "📝 Step 4: Adding typography CSS imports..."
MAIN_CSS="$ROOT_DIR/apps/sabo-user/src/index.css"
if ! grep -q "typography/design-system.css" "$MAIN_CSS"; then
    echo '@import "./styles/typography/design-system.css";' >> "$MAIN_CSS"
fi

cd "$ROOT_DIR"

echo ""
echo "✅ Typography Size Migration Complete!"
echo "====================================="

# Count improvements
REMAINING_XS=$(grep -r "text-xs" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
REMAINING_SM=$(grep -r "text-sm" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
REMAINING_BASE=$(grep -r "text-base" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
REMAINING_LG=$(grep -r "text-lg" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
REMAINING_XL=$(grep -r "text-xl\|text-2xl" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)

NEW_CAPTION=$(grep -r "text-caption" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
NEW_BODY_SMALL=$(grep -r "text-body-small" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
NEW_BODY=$(grep -r "text-body" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
NEW_TITLE=$(grep -r "text-title" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
NEW_HEADING=$(grep -r "text-heading" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)

echo "📊 Migration Results:"
echo "  Design System Classes Created:"
echo "    • text-caption: $NEW_CAPTION instances"
echo "    • text-body-small: $NEW_BODY_SMALL instances"  
echo "    • text-body: $NEW_BODY instances"
echo "    • text-title: $NEW_TITLE instances"
echo "    • text-heading: $NEW_HEADING instances"
echo ""
echo "  Legacy Classes Remaining:"
echo "    • text-xs: $REMAINING_XS"
echo "    • text-sm: $REMAINING_SM"
echo "    • text-base: $REMAINING_BASE"
echo "    • text-lg: $REMAINING_LG"
echo "    • text-xl/2xl: $REMAINING_XL"
echo ""
echo "🔍 Next Steps:"
echo "1. Test visual consistency: npm run dev"
echo "2. Run typography-weight-migration.sh"
echo "3. Validate design system compliance"
echo ""
echo "📁 Backup: $BACKUP_DIR"
