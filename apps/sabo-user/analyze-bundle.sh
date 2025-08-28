#!/bin/bash

# SABO User App Bundle Analysis Script
# This script analyzes the build output and provides optimization insights

echo "🔍 SABO User App - Bundle Analysis Starting..."
echo "================================================"

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ No dist folder found. Please run 'npm run build' first."
    exit 1
fi

echo "📊 Bundle Size Analysis:"
echo "------------------------"

# Analyze JavaScript bundles
if [ -d "dist/js" ]; then
    echo "🔗 JavaScript Chunks:"
    ls -lah dist/js/*.js | awk '{print $5 "\t" $9}' | sort -k1 -hr
else
    echo "🔗 JavaScript Files:"
    find dist -name "*.js" -exec ls -lah {} \; | awk '{print $5 "\t" $9}' | sort -k1 -hr
fi

echo ""
echo "🎨 CSS Files:"
echo "-------------"
find dist -name "*.css" -exec ls -lah {} \; | awk '{print $5 "\t" $9}' | sort -k1 -hr

echo ""
echo "📦 Total Bundle Size:"
echo "--------------------"
du -sh dist

echo ""
echo "🏆 Optimization Score:"
echo "---------------------"

# Calculate total JS size
js_size=$(find dist -name "*.js" -exec stat -c%s {} \; | awk '{sum+=$1} END {print sum}')
css_size=$(find dist -name "*.css" -exec stat -c%s {} \; | awk '{sum+=$1} END {print sum}')

# Convert to KB
js_kb=$((js_size / 1024))
css_kb=$((css_size / 1024))
total_kb=$((js_kb + css_kb))

echo "JavaScript: ${js_kb}KB"
echo "CSS: ${css_kb}KB"
echo "Total: ${total_kb}KB"

# Performance recommendations
echo ""
echo "💡 Performance Recommendations:"
echo "-------------------------------"

if [ $js_kb -gt 1000 ]; then
    echo "⚠️  JavaScript bundle is large (${js_kb}KB). Consider:"
    echo "   - More aggressive code splitting"
    echo "   - Lazy loading more components"
    echo "   - Tree shaking optimization"
else
    echo "✅ JavaScript bundle size is optimal (${js_kb}KB)"
fi

if [ $css_kb -gt 200 ]; then
    echo "⚠️  CSS bundle is large (${css_kb}KB). Consider:"
    echo "   - Purging unused CSS"
    echo "   - CSS-in-JS optimization"
else
    echo "✅ CSS bundle size is optimal (${css_kb}KB)"
fi

# Count number of chunks
chunk_count=$(find dist -name "*.js" | wc -l)
echo ""
echo "📈 Bundle Statistics:"
echo "    - Total chunks: $chunk_count"
echo "    - Average chunk size: $((js_kb / chunk_count))KB"

if [ $chunk_count -gt 20 ]; then
    echo "⚠️  Many chunks detected. Consider consolidating smaller chunks."
elif [ $chunk_count -lt 5 ]; then
    echo "⚠️  Few chunks detected. Consider more aggressive splitting."
else
    echo "✅ Optimal chunk distribution"
fi

echo ""
echo "🚀 Analysis Complete!"
echo "================================================"
