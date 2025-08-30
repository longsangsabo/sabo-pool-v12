#!/bin/bash

# Phase 4: Inline Styles Cleanup
# Systematic cleanup and conversion to design system

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🧹 PHASE 4: INLINE STYLES CLEANUP"
echo "=================================="

# Create backup
BACKUP_DIR="$ROOT_DIR/inline_styles_backup_$(date +%Y%m%d_%H%M%S)"
echo "📦 Creating backup at $BACKUP_DIR..."
cp -r "$ROOT_DIR/apps/sabo-user/src" "$BACKUP_DIR"

# Priority 1: Convert animation styles to CSS classes
echo "🎨 Step 1: Converting animation styles..."

# Create animation utilities CSS file
mkdir -p "$ROOT_DIR/apps/sabo-user/src/styles/utilities"
cat > "$ROOT_DIR/apps/sabo-user/src/styles/utilities/animations.css" << 'EOF'
/* Animation Utilities - Design System Compliant */

/* Pull to refresh animations */
.pull-refresh-container {
  transition: height 0.2s ease-out;
}

.pull-refresh-progress {
  transition: width 0.3s ease-out;
}

/* Swipeable card animations */
.swipeable-card {
  transition: transform 0.2s ease-out, opacity 0.2s ease-out;
}

/* Staggered list animations */
.stagger-animation {
  animation: slideInUp 0.6s ease-out forwards;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Tournament participant animations */
.participant-enter {
  animation: participantEnter 0.6s ease-out forwards;
}

@keyframes participantEnter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
EOF

# Priority 2: Create ProgressBar component
echo "📊 Step 2: Creating ProgressBar component..."
mkdir -p "$ROOT_DIR/packages/shared-ui/src/Progress"
cat > "$ROOT_DIR/packages/shared-ui/src/Progress/ProgressBar.tsx" << 'EOF'
import React from 'react';
import { cn } from '@/lib/utils';
import { SPACING_TOKENS } from '@shared/design-tokens';

interface ProgressBarProps {
  progress: number; // 0-100
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const progressVariants = {
  default: 'bg-blue-500',
  success: 'bg-green-500', 
  warning: 'bg-yellow-500',
  error: 'bg-red-500'
};

const progressSizes = {
  sm: 'h-1',
  md: 'h-2', 
  lg: 'h-3'
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'default',
  size = 'md',
  showLabel = false,
  className
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className={cn(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        progressSizes[size]
      )}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out rounded-full',
            progressVariants[variant]
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
EOF

# Priority 3: Create DynamicSizer component for width/height
echo "📏 Step 3: Creating DynamicSizer component..."
cat > "$ROOT_DIR/packages/shared-ui/src/Layout/DynamicSizer.tsx" << 'EOF'
import React from 'react';
import { cn } from '@/lib/utils';

interface DynamicSizerProps {
  width?: number | string;
  height?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  aspectRatio?: string;
  className?: string;
  children: React.ReactNode;
}

export const DynamicSizer: React.FC<DynamicSizerProps> = ({
  width,
  height,
  maxWidth,
  maxHeight,
  aspectRatio,
  className,
  children
}) => {
  const dynamicStyles: React.CSSProperties = {};
  
  if (width) dynamicStyles.width = width;
  if (height) dynamicStyles.height = height;
  if (maxWidth) dynamicStyles.maxWidth = maxWidth;
  if (maxHeight) dynamicStyles.maxHeight = maxHeight;
  if (aspectRatio) dynamicStyles.aspectRatio = aspectRatio;
  
  return (
    <div 
      className={cn('inline-block', className)}
      style={dynamicStyles}
    >
      {children}
    </div>
  );
};
EOF

# Update shared-ui exports
echo "📤 Step 4: Updating shared-ui exports..."
cat >> "$ROOT_DIR/packages/shared-ui/src/index.ts" << 'EOF'

// Progress Components
export { ProgressBar } from './Progress/ProgressBar';

// Layout Components
export { DynamicSizer } from './Layout/DynamicSizer';
EOF

# Priority 4: Fix specific high-impact files
echo "🔧 Step 5: Fixing high-impact files..."

# Fix PullToRefresh component
if [ -f "$ROOT_DIR/apps/sabo-user/src/components/challenges/Enhanced/PullToRefresh.tsx" ]; then
    echo "Fixing PullToRefresh component..."
    sed -i 's/style={{ height: Math.max(pullDistance, 60) }}/className="pull-refresh-container" style={{ height: Math.max(pullDistance, 60) }}/g' \
        "$ROOT_DIR/apps/sabo-user/src/components/challenges/Enhanced/PullToRefresh.tsx"
    
    sed -i 's/style={{ width: `${refreshProgress \* 100}%` }}/className="pull-refresh-progress" style={{ width: `${refreshProgress * 100}%` }}/g' \
        "$ROOT_DIR/apps/sabo-user/src/components/challenges/Enhanced/PullToRefresh.tsx"
fi

# Fix SwipeableCard component
if [ -f "$ROOT_DIR/apps/sabo-user/src/components/challenges/Enhanced/SwipeableCard.tsx" ]; then
    echo "Fixing SwipeableCard component..."
    sed -i 's/style={{ x, opacity, scale, rotate }}/className="swipeable-card" style={{ x, opacity, scale, rotate }}/g' \
        "$ROOT_DIR/apps/sabo-user/src/components/challenges/Enhanced/SwipeableCard.tsx"
fi

# Priority 5: Import animation styles
echo "🎨 Step 6: Adding animation imports..."
MAIN_CSS="$ROOT_DIR/apps/sabo-user/src/index.css"
if ! grep -q "utilities/animations.css" "$MAIN_CSS"; then
    echo '@import "./styles/utilities/animations.css";' >> "$MAIN_CSS"
fi

echo ""
echo "✅ Inline Styles Cleanup Complete!"
echo "=================================="
echo "📊 Progress Summary:"
echo "  - Created ProgressBar component for dynamic widths"
echo "  - Created DynamicSizer component for dimensions"
echo "  - Added animation CSS utilities"
echo "  - Fixed high-impact component files"
echo "  - Added design system imports"
echo ""
echo "🔍 Verification Steps:"
echo "1. cd apps/sabo-user && npm run build"
echo "2. Check remaining inline styles: grep -r 'style=' src/ --include='*.tsx' | wc -l"
echo "3. Test components in browser"
echo ""
echo "📁 Backup created at: $BACKUP_DIR"
