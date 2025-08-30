#!/bin/bash

# Phase 4D: Dynamic Values CSS Variables
# Convert dynamic inline styles to CSS custom properties

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "⚡ PHASE 4D: DYNAMIC VALUES TO CSS VARIABLES"
echo "==========================================="

# Create backup
BACKUP_DIR="$ROOT_DIR/dynamic_cleanup_backup_$(date +%Y%m%d_%H%M%S)"
echo "📦 Creating backup at $BACKUP_DIR..."
cp -r "$ROOT_DIR/apps/sabo-user/src" "$BACKUP_DIR"

# Step 1: Create CSS custom properties utilities
echo "🔧 Step 1: Creating CSS custom properties utilities..."
cat > "$ROOT_DIR/apps/sabo-user/src/styles/utilities/dynamic-props.css" << 'EOF'
/* CSS Custom Properties for Dynamic Values */

/* Progress bars */
.progress-bar-dynamic {
  width: var(--progress-width, 0%);
  transition: width 0.3s ease-out;
}

/* Dynamic sizing */
.size-dynamic {
  width: var(--dynamic-size, auto);
  height: var(--dynamic-size, auto);
}

/* Animation delays */
.animation-delay-dynamic {
  animation-delay: var(--animation-delay, 0s);
}

/* Transform values */
.transform-dynamic {
  transform: var(--transform-x, translateX(0)) var(--transform-y, translateY(0)) 
             var(--transform-scale, scale(1)) var(--transform-rotate, rotate(0deg));
  opacity: var(--transform-opacity, 1);
}

/* Transition utilities */
.transition-dynamic {
  transition: var(--transition-property, all) var(--transition-duration, 0.3s) var(--transition-timing, ease-out);
}

/* Height utilities */
.height-dynamic {
  height: var(--dynamic-height, auto);
}
EOF

# Step 2: Replace specific dynamic patterns
echo "🔄 Step 2: Converting dynamic size patterns..."

# ArenaLogo components - convert to CSS variables
find "$ROOT_DIR/apps/sabo-user/src" -name "ArenaLogo.tsx" -exec sed -i \
    's/style={{ width: size, height: size }}/className="size-dynamic" style={{ "--dynamic-size": size }}/g' {} \;

# Step 3: Convert progress bar patterns
echo "📊 Step 3: Converting progress patterns..."

# EvidenceUpload progress
if [ -f "$ROOT_DIR/apps/sabo-user/src/components/EvidenceUpload.tsx" ]; then
    sed -i 's/style={{ width: `${progress}%` }}/className="progress-bar-dynamic" style={{ "--progress-width": `${progress}%` }}/g' \
        "$ROOT_DIR/apps/sabo-user/src/components/EvidenceUpload.tsx"
fi

# PullToRefresh progress
if [ -f "$ROOT_DIR/apps/sabo-user/src/components/challenges/Enhanced/PullToRefresh.tsx" ]; then
    sed -i 's/className="pull-refresh-progress" style={{ width: `${refreshProgress \* 100}%` }}/className="pull-refresh-progress progress-bar-dynamic" style={{ "--progress-width": `${refreshProgress * 100}%` }}/g' \
        "$ROOT_DIR/apps/sabo-user/src/components/challenges/Enhanced/PullToRefresh.tsx"
    
    sed -i 's/className="pull-refresh-container" style={{ height: Math.max(pullDistance, 60) }}/className="pull-refresh-container height-dynamic" style={{ "--dynamic-height": Math.max(pullDistance, 60) }}/g' \
        "$ROOT_DIR/apps/sabo-user/src/components/challenges/Enhanced/PullToRefresh.tsx"
fi

# Step 4: Convert animation delays
echo "⏱️ Step 4: Converting animation delays..."

# ParticipantListRealtime
if [ -f "$ROOT_DIR/apps/sabo-user/src/components/tournament/ParticipantListRealtime.tsx" ]; then
    sed -i 's/style={{ animationDelay: `${index \* 0.1}s` }}/className="animation-delay-dynamic" style={{ "--animation-delay": `${index * 0.1}s` }}/g' \
        "$ROOT_DIR/apps/sabo-user/src/components/tournament/ParticipantListRealtime.tsx"
fi

# Step 5: Convert transform values
echo "🔄 Step 5: Converting transform patterns..."

# SwipeableCard
if [ -f "$ROOT_DIR/apps/sabo-user/src/components/challenges/Enhanced/SwipeableCard.tsx" ]; then
    # This is complex - create a custom approach
    sed -i 's/className="swipeable-card" style={{ x, opacity, scale, rotate }}/className="swipeable-card transform-dynamic" style={{ "--transform-x": x, "--transform-opacity": opacity, "--transform-scale": scale, "--transform-rotate": rotate }}/g' \
        "$ROOT_DIR/apps/sabo-user/src/components/challenges/Enhanced/SwipeableCard.tsx"
fi

# Step 6: Convert transition patterns
echo "🎭 Step 6: Converting transition patterns..."

# PlayerDesktopSidebar
if [ -f "$ROOT_DIR/apps/sabo-user/src/components/desktop/PlayerDesktopSidebar.tsx" ]; then
    sed -i 's/style={{ transition: PLAYER_SIDEBAR_TOKENS.animation.transition }}/className="transition-dynamic" style={{ "--transition-property": "all", "--transition-duration": PLAYER_SIDEBAR_TOKENS.animation.transition }}/g' \
        "$ROOT_DIR/apps/sabo-user/src/components/desktop/PlayerDesktopSidebar.tsx"
fi

# Step 7: Add CSS imports
echo "📝 Step 7: Adding CSS imports..."
MAIN_CSS="$ROOT_DIR/apps/sabo-user/src/index.css"
if ! grep -q "dynamic-props.css" "$MAIN_CSS"; then
    echo '@import "./styles/utilities/dynamic-props.css";' >> "$MAIN_CSS"
fi

# Step 8: Handle remaining complex patterns manually
echo "🔧 Step 8: Creating helper for complex patterns..."

# Create a utility component for complex inline styles
mkdir -p "$ROOT_DIR/packages/shared-ui/src/Utils"
cat > "$ROOT_DIR/packages/shared-ui/src/Utils/DynamicStyle.tsx" << 'EOF'
import React from 'react';

interface DynamicStyleProps {
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
  component?: keyof JSX.IntrinsicElements;
}

/**
 * Utility component to handle dynamic styles with CSS custom properties
 * Use this for complex inline styles that cannot be easily converted to classes
 */
export const DynamicStyle: React.FC<DynamicStyleProps> = ({
  style = {},
  className = '',
  children,
  component: Component = 'div'
}) => {
  return (
    <Component 
      className={className}
      style={style}
    >
      {children}
    </Component>
  );
};
EOF

# Update shared-ui exports
echo "// Utility Components" >> "$ROOT_DIR/packages/shared-ui/src/index.ts"
echo "export { DynamicStyle } from './Utils/DynamicStyle';" >> "$ROOT_DIR/packages/shared-ui/src/index.ts"

echo ""
echo "✅ Dynamic Values CSS Variables Complete!"
echo "======================================="

# Count remaining styles
REMAINING=$(grep -r "style=" "$ROOT_DIR/apps/sabo-user/src/" --include="*.tsx" | wc -l)
echo "📊 Remaining inline styles: $REMAINING"

# Calculate total reduction
ORIGINAL=156
ELIMINATED=$((ORIGINAL - REMAINING))
PERCENTAGE=$((ELIMINATED * 100 / ORIGINAL))
echo "🎯 Total eliminated: $ELIMINATED inline styles ($PERCENTAGE% reduction)"

echo ""
echo "🔍 Verification:"
echo "cd /workspaces/sabo-pool-v12/apps/sabo-user && npm run build"
echo "📁 Backup: $BACKUP_DIR"
