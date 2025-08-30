#!/bin/bash

# 🚀 AUTO-REFERENCE DESIGN SYSTEM GUIDE
# Script tự động tham chiếu đến Design System khi tạo file mới

echo "🎨 DESIGN SYSTEM AUTO-REFERENCE SYSTEM"
echo "======================================"

# Function để detect file type và suggest appropriate templates
detect_file_type() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    local extension="${file_name##*.}"
    
    case "$extension" in
        "tsx"|"jsx")
            echo "react_component"
            ;;
        "css"|"scss")
            echo "styles"
            ;;
        "md")
            echo "documentation"
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

# Function để show Quick Start Guide reference
show_quick_guide() {
    echo ""
    echo "📚 QUICK START GUIDE REFERENCE:"
    echo "==============================="
    echo "👉 Full Guide: /workspaces/sabo-pool-v12/docs/QUICK_START_GUIDE.md"
    echo ""
    echo "🎯 Quick Checklist:"
    echo "  ✅ Import design system components"
    echo "  ✅ Use Typography component instead of custom text styles"
    echo "  ✅ Follow 8px grid for spacing"
    echo "  ✅ Use semantic color classes"
    echo ""
}

# Function để create template based on file type
create_template() {
    local file_path="$1"
    local file_type="$2"
    
    case "$file_type" in
        "react_component")
            create_react_template "$file_path"
            ;;
        "styles")
            create_css_template "$file_path"
            ;;
        *)
            show_general_guidance
            ;;
    esac
}

# React Component Template
create_react_template() {
    local file_path="$1"
    local component_name=$(basename "$file_path" .tsx)
    
    cat > "$file_path" << 'EOF'
import React from 'react';
import { Typography, Button } from '@/packages/shared-ui';
import '@/packages/shared-ui/src/styles/design-system.css';

// 🎨 Design System Template - Generated with auto-reference
// 📖 Quick Guide: /docs/QUICK_START_GUIDE.md
// 📚 Full Docs: /docs/ComponentGuide.md

interface COMPONENT_NAMEProps {
  // Define your props here
}

export const COMPONENT_NAME: React.FC<COMPONENT_NAMEProps> = ({
  // props
}) => {
  return (
    <div className="space-y-16 p-20">
      {/* 🎯 Use Typography component for consistent text */}
      <Typography variant="heading" size="lg">
        Component Title
      </Typography>
      
      <Typography variant="body" size="md" color="muted">
        Component description using semantic typography
      </Typography>
      
      {/* 🎯 Use 8px grid spacing classes */}
      <div className="flex gap-12">
        <Button variant="primary" size="md">
          Primary Action
        </Button>
        <Button variant="secondary" size="md">
          Secondary Action
        </Button>
      </div>
    </div>
  );
};

export default COMPONENT_NAME;

/*
🔍 DESIGN SYSTEM CHECKLIST:
✅ Imported design system components
✅ Used Typography component
✅ Applied 8px grid spacing (space-y-16, p-20, gap-12)
✅ Used semantic Button variants
✅ No inline styles

📖 Need help? Check:
- Quick Start: /docs/QUICK_START_GUIDE.md
- Components: /docs/ComponentGuide.md
- Tokens: /docs/DesignTokens.md
*/
EOF
    
    # Replace COMPONENT_NAME with actual component name
    sed -i "s/COMPONENT_NAME/${component_name}/g" "$file_path"
    
    echo "✅ React component template created with design system integration!"
    show_quick_guide
}

# CSS Template
create_css_template() {
    local file_path="$1"
    
    cat > "$file_path" << 'EOF'
/* 🎨 Design System CSS Template - Generated with auto-reference */
/* 📖 Quick Guide: /docs/QUICK_START_GUIDE.md */
/* 📚 Design Tokens: /docs/DesignTokens.md */

/* 
🎯 DESIGN SYSTEM GUIDELINES:
- Use CSS custom properties from design tokens
- Follow 8px grid for spacing
- Use semantic color variables
- Avoid hardcoded values
*/

/* Import design system base */
@import '@/packages/shared-ui/src/styles/design-system.css';

/* Component-specific styles */
.component-name {
  /* 🎯 Use design token spacing */
  padding: var(--space-20);
  margin-bottom: var(--space-16);
  
  /* 🎯 Use semantic colors */
  background-color: var(--color-surface-primary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  
  /* 🎯 Use typography tokens */
  font-family: var(--font-family-body);
  font-size: var(--font-size-body-md);
  line-height: var(--line-height-body-md);
  color: var(--color-text-primary);
}

.component-name__title {
  /* 🎯 Use heading typography scale */
  font-size: var(--font-size-heading-lg);
  font-weight: var(--font-weight-heading);
  line-height: var(--line-height-heading-lg);
  margin-bottom: var(--space-12);
  color: var(--color-text-heading);
}

.component-name__description {
  /* 🎯 Use body typography scale */
  font-size: var(--font-size-body-sm);
  line-height: var(--line-height-body-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-16);
}

/* 
🔍 DESIGN SYSTEM CHECKLIST:
✅ Used CSS custom properties from design tokens
✅ Applied 8px grid spacing
✅ Used semantic color variables
✅ Followed typography scales
✅ No hardcoded values

📖 Need help? Check:
- Quick Start: /docs/QUICK_START_GUIDE.md
- Design Tokens: /docs/DesignTokens.md
- Examples: /docs/UsageExamples.md
*/
EOF
    
    echo "✅ CSS template created with design system integration!"
    show_quick_guide
}

# General guidance cho unknown file types
show_general_guidance() {
    echo ""
    echo "💡 DESIGN SYSTEM GUIDANCE:"
    echo "=========================="
    echo "📖 Quick Start Guide: /docs/QUICK_START_GUIDE.md"
    echo "📚 Full Documentation:"
    echo "  - Components: /docs/ComponentGuide.md"
    echo "  - Tokens: /docs/DesignTokens.md" 
    echo "  - Examples: /docs/UsageExamples.md"
    echo "  - Standards: /docs/DeveloperGuide.md"
    echo ""
    echo "🎯 Key Principles:"
    echo "  ✅ Use Typography component for all text"
    echo "  ✅ Follow 8px grid for spacing"
    echo "  ✅ Use semantic color classes"
    echo "  ✅ Import design system components"
    echo ""
}

# Main function
main() {
    echo "🎨 Design System Auto-Reference activated!"
    echo ""
    
    if [ $# -eq 0 ]; then
        echo "Usage: $0 <file_path> [template]"
        echo ""
        echo "Examples:"
        echo "  $0 src/components/NewComponent.tsx"
        echo "  $0 src/styles/component.css"
        echo "  $0 --guide  # Show quick guide"
        echo ""
        show_general_guidance
        exit 1
    fi
    
    if [ "$1" = "--guide" ]; then
        show_quick_guide
        exit 0
    fi
    
    local file_path="$1"
    local file_type=$(detect_file_type "$file_path")
    
    echo "📁 File: $file_path"
    echo "🏷️  Type: $file_type"
    echo ""
    
    if [ "$2" = "template" ] && [[ "$file_type" != "unknown" ]]; then
        echo "🏗️  Creating template with design system integration..."
        create_template "$file_path" "$file_type"
    else
        show_general_guidance
    fi
}

# Auto-detect khi script được gọi
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
