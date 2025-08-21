#!/bin/bash

# Script to automatically replace display name patterns with getDisplayName function

echo "🔧 AUTOMATED DISPLAY NAME STANDARDIZATION"
echo "==========================================="

# First, add import statement to files that don't have it yet
echo "📦 Adding getDisplayName import to files..."

# Find all tsx/ts files that use display_name patterns but don't import getDisplayName
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "display_name.*||" | while read file; do
    if ! grep -q "getDisplayName" "$file"; then
        echo "Adding import to: $file"
        # Add import after other imports from @/types/
        sed -i '/import.*@\/types\//a import { getDisplayName } from '\''@/types/unified-profile'\'';' "$file"
    fi
done

echo "✅ Import statements added!"

echo "🔄 Replacing display name patterns..."

# Replace common patterns
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/display_name.*||.*full_name.*||.*'"'"'[^'"'"']*'"'"'/getDisplayName(profile)/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/full_name.*||.*display_name.*||.*'"'"'[^'"'"']*'"'"'/getDisplayName(profile)/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/display_name.*||.*'"'"'[^'"'"']*'"'"'/getDisplayName(profile)/g'

echo "✅ Basic patterns replaced!"

echo "📊 Checking remaining patterns..."
REMAINING_DISPLAY=$(grep -r "display_name.*||" src/ | wc -l)
REMAINING_FULL=$(grep -r "full_name.*||" src/ | wc -l)

echo "📈 RESULTS:"
echo "- display_name|| patterns remaining: $REMAINING_DISPLAY"
echo "- full_name|| patterns remaining: $REMAINING_FULL"

if [ $REMAINING_DISPLAY -lt 50 ] && [ $REMAINING_FULL -lt 100 ]; then
    echo "🎉 SUCCESS: Significantly reduced hardcoded patterns!"
else
    echo "⚠️  WARNING: Still many patterns remaining - manual review needed"
fi

echo "✅ Automated standardization complete!"
echo ""
echo "🔍 Manual review needed for complex patterns:"
echo "Please check these files manually:"
grep -r "display_name.*||" src/ | cut -d: -f1 | sort | uniq -c | sort -nr | head -5
