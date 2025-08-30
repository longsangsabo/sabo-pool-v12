#!/bin/bash

# 🎨 STYLE VALIDATION SCRIPT
# Script để validate styles theo design system standards

echo "🎨 DESIGN SYSTEM STYLE VALIDATION"
echo "================================="

# Function để check inline styles
check_inline_styles() {
    echo "🔍 Checking for inline styles..."
    
    local inline_count=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.tsx" -o -name "*.jsx" | xargs grep -n "style=" | wc -l)
    
    if [ $inline_count -gt 0 ]; then
        echo "❌ Found $inline_count inline styles:"
        find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.tsx" -o -name "*.jsx" | xargs grep -n "style=" | head -5
        echo "   ... (showing first 5 occurrences)"
        echo ""
        echo "💡 Fix: Use design system classes instead of inline styles"
        echo "📖 Guide: /docs/STYLE_EDITING_GUIDE.md"
    else
        echo "✅ No inline styles found - Good!"
    fi
    echo ""
}

# Function để check hardcoded colors
check_hardcoded_colors() {
    echo "🌈 Checking for hardcoded colors..."
    
    # Pattern for hex colors like #ffffff, #000, etc.
    local color_count=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.css" -o -name "*.scss" -o -name "*.tsx" -o -name "*.jsx" | xargs grep -E "#[0-9a-fA-F]{3,6}" | grep -v "var(--" | wc -l)
    
    if [ $color_count -gt 0 ]; then
        echo "❌ Found $color_count hardcoded colors:"
        find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.css" -o -name "*.scss" -o -name "*.tsx" -o -name "*.jsx" | xargs grep -E "#[0-9a-fA-F]{3,6}" | grep -v "var(--" | head -3
        echo "   ... (showing first 3 occurrences)"
        echo ""
        echo "💡 Fix: Use color variables like var(--color-primary-600)"
        echo "📖 Colors Guide: /docs/STYLE_EDITING_GUIDE.md#color-system-editing"
    else
        echo "✅ No hardcoded colors found - Good!"
    fi
    echo ""
}

# Function để check non-grid spacing
check_spacing_compliance() {
    echo "📏 Checking spacing compliance with 8px grid..."
    
    # Check for non-8px-grid values in padding/margin
    local spacing_issues=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.css" -o -name "*.scss" | xargs grep -E "(padding|margin).*[0-9]+(px|rem)" | grep -vE "(4|8|12|16|20|24|32|40|48)px" | wc -l)
    
    if [ $spacing_issues -gt 0 ]; then
        echo "❌ Found $spacing_issues potential spacing violations:"
        find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.css" -o -name "*.scss" | xargs grep -E "(padding|margin).*[0-9]+(px|rem)" | grep -vE "(4|8|12|16|20|24|32|40|48)px" | head -3
        echo "   ... (showing first 3 occurrences)"
        echo ""
        echo "💡 Fix: Use 8px grid values (4, 8, 12, 16, 20, 24, 32, 40, 48px)"
        echo "📖 Spacing Guide: /docs/STYLE_EDITING_GUIDE.md#spacing--layout-editing"
    else
        echo "✅ Spacing follows 8px grid - Good!"
    fi
    echo ""
}

# Function để check Typography component usage
check_typography_usage() {
    echo "📝 Checking Typography component usage..."
    
    # Check for raw h1, h2, h3, p tags without Typography wrapper
    local raw_tags=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.tsx" -o -name "*.jsx" | xargs grep -E "<(h[1-6]|p)[ >]" | grep -v "Typography" | wc -l)
    
    if [ $raw_tags -gt 0 ]; then
        echo "⚠️  Found $raw_tags raw HTML text tags:"
        find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.tsx" -o -name "*.jsx" | xargs grep -E "<(h[1-6]|p)[ >]" | grep -v "Typography" | head -3
        echo "   ... (showing first 3 occurrences)"
        echo ""
        echo "💡 Consider: Use Typography component for consistent styling"
        echo "📖 Typography Guide: /docs/STYLE_EDITING_GUIDE.md#font--typography-editing"
    else
        echo "✅ Typography component usage looks good!"
    fi
    echo ""
}

# Function để check design token imports
check_design_token_imports() {
    echo "🔧 Checking design token imports..."
    
    local files_with_imports=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.tsx" -o -name "*.jsx" | xargs grep -l "from.*shared-ui" | wc -l)
    local total_component_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.tsx" -o -name "*.jsx" | wc -l)
    
    echo "📊 Design system usage stats:"
    echo "   Files with design system imports: $files_with_imports"
    echo "   Total component files: $total_component_files"
    
    if [ $files_with_imports -gt 0 ]; then
        local adoption_percentage=$((files_with_imports * 100 / total_component_files))
        echo "   Adoption rate: $adoption_percentage%"
        
        if [ $adoption_percentage -gt 80 ]; then
            echo "✅ High design system adoption - Excellent!"
        elif [ $adoption_percentage -gt 50 ]; then
            echo "⚠️  Moderate design system adoption - Could be improved"
        else
            echo "❌ Low design system adoption - Needs improvement"
        fi
    else
        echo "❌ No design system imports found"
    fi
    echo ""
}

# Function để show style improvement suggestions
show_improvement_suggestions() {
    echo "💡 STYLE IMPROVEMENT SUGGESTIONS"
    echo "================================"
    echo ""
    echo "🎯 Quick Wins:"
    echo "  1. Replace inline styles với design system classes"
    echo "  2. Use Typography component cho all text elements"
    echo "  3. Replace hardcoded colors với semantic variables"
    echo "  4. Follow 8px grid cho spacing values"
    echo ""
    echo "🔧 Tools để help:"
    echo "  • VS Code snippets: type 'dsreact', 'dscss' trong files"
    echo "  • Auto-reference script: ./scripts/auto-reference-design-system.sh"
    echo "  • Quick guide: ./docs/QUICK_START_GUIDE.md"
    echo "  • Style guide: ./docs/STYLE_EDITING_GUIDE.md"
    echo ""
    echo "📚 Documentation:"
    echo "  • Complete guide: /docs/STYLE_EDITING_GUIDE.md"
    echo "  • Design tokens: /docs/DesignTokens.md"
    echo "  • Component usage: /docs/ComponentGuide.md"
    echo ""
}

# Function để create style report
create_style_report() {
    local report_file="/workspaces/sabo-pool-v12/STYLE_VALIDATION_REPORT.md"
    
    echo "📄 Creating style validation report..."
    
    cat > "$report_file" << EOF
# 🎨 Style Validation Report
Generated on: $(date)

## 📊 Validation Results

### Inline Styles Check
$(check_inline_styles 2>&1)

### Hardcoded Colors Check  
$(check_hardcoded_colors 2>&1)

### Spacing Compliance Check
$(check_spacing_compliance 2>&1)

### Typography Usage Check
$(check_typography_usage 2>&1)

### Design Token Adoption
$(check_design_token_imports 2>&1)

## 📚 Resources

- [Style Editing Guide](/docs/STYLE_EDITING_GUIDE.md)
- [Quick Start Guide](/docs/QUICK_START_GUIDE.md)
- [Design Tokens](/docs/DesignTokens.md)
- [Component Guide](/docs/ComponentGuide.md)

## 🔧 Quick Fixes

1. **Inline Styles**: Use design system classes
2. **Colors**: Replace với var(--color-*) variables
3. **Spacing**: Use 8px grid values
4. **Typography**: Use Typography component
5. **Import**: Add design system component imports

EOF
    
    echo "✅ Report created: $report_file"
}

# Main execution
main() {
    echo "🎨 Starting Design System Style Validation..."
    echo ""
    
    if [ "$1" = "--report" ]; then
        create_style_report
        return
    fi
    
    check_inline_styles
    check_hardcoded_colors
    check_spacing_compliance
    check_typography_usage
    check_design_token_imports
    show_improvement_suggestions
    
    echo "🎯 VALIDATION COMPLETE!"
    echo "======================"
    echo ""
    echo "Run with --report flag để create detailed report:"
    echo "  ./scripts/style-validation.sh --report"
    echo ""
}

# Execute main function
main "$@"
