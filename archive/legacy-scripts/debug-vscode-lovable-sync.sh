#!/bin/bash

echo "🔍 DEBUGGING VSCODE ↔ LOVABLE SYNC ISSUES"
echo "========================================"
echo ""

echo "📊 STATISTICS:"
echo "- Total files tracked by git: $(git ls-files | wc -l)"
echo "- TypeScript/React files: $(find src -name '*.tsx' -o -name '*.ts' | wc -l)"
echo "- Source code size: $(du -sh src/)"
echo "- Total project size: $(du -sh . --exclude=node_modules --exclude=.git)"
echo ""

echo "🔧 BUILD CONFIGURATION:"
echo "- Vite config exists: $([ -f vite.config.ts ] && echo 'YES ✅' || echo 'NO ❌')"
echo "- Lovable config exists: $([ -f lovable.config.js ] && echo 'YES ✅' || echo 'NO ❌')"
echo "- Package.json exists: $([ -f package.json ] && echo 'YES ✅' || echo 'NO ❌')"
echo ""

echo "🌍 ENVIRONMENT:"
echo "- .env file exists: $([ -f .env ] && echo 'YES ✅ (LOCAL ONLY)' || echo 'NO ❌')"
echo "- .env.example exists: $([ -f .env.example ] && echo 'YES ✅' || echo 'NO ❌')"
echo ""

echo "📁 KEY DIRECTORIES:"
echo "- src/components: $(find src/components -type f -name '*.tsx' | wc -l) files"
echo "- src/pages: $(find src/pages -type f -name '*.tsx' 2>/dev/null | wc -l) files"
echo "- src/hooks: $(find src/hooks -type f -name '*.ts' 2>/dev/null | wc -l) files"
echo ""

echo "🚨 POTENTIAL ISSUES:"
echo ""

# Check for files that might be too large
echo "🔍 Large files (>1MB):"
find . -type f -size +1M -not -path './node_modules/*' -not -path './.git/*' | head -10

echo ""
echo "🔍 Files ignored by git but might be needed:"
git status --ignored | grep -E '\.(tsx?|jsx?|css|json)$' | head -10

echo ""
echo "💡 RECOMMENDATIONS:"
echo ""
echo "1. CHECK LOVABLE DASHBOARD:"
echo "   - Verify all environment variables are set"
echo "   - Check deployment logs for errors"
echo "   - Look for file upload limits exceeded"
echo ""
echo "2. COMMON SYNC ISSUES:"
echo "   - Environment variables not configured in Lovable"
echo "   - Build optimization removing features"
echo "   - Files exceeding upload size limits"
echo "   - Missing dependencies in production"
echo ""
echo "3. DEBUGGING STEPS:"
echo "   - Compare build output between VSCode and Lovable"
echo "   - Check browser console for missing assets"
echo "   - Verify all features work in Lovable preview"
echo ""
echo "Done! 🎉"
