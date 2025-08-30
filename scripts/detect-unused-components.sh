#!/bin/bash

# 🔍 UNUSED COMPONENTS DETECTOR SCRIPT
# Tự động phát hiện các components không được sử dụng trong codebase

echo "🔍 SCANNING FOR UNUSED COMPONENTS..."
echo "=================================="

# Directory to scan
COMPONENTS_DIR="/workspaces/sabo-pool-v12/apps/sabo-user/src/components"
SRC_DIR="/workspaces/sabo-pool-v12/apps/sabo-user/src"

# Array to store unused components
declare -a UNUSED_COMPONENTS=()
declare -a POTENTIALLY_UNUSED=()

# Find all .tsx files in components directory
while IFS= read -r -d '' file; do
    # Get filename without extension
    filename=$(basename "$file" .tsx)
    
    # Skip index files and ui components
    if [[ "$filename" == "index" ]] || [[ "$file" == *"/ui/"* ]]; then
        continue
    fi
    
    echo "🔎 Checking: $filename"
    
    # Search for imports/usage of this component
    usage_count=$(grep -r "import.*$filename\|from.*$filename\|<$filename" "$SRC_DIR" --include="*.tsx" --include="*.ts" | wc -l)
    
    if [ "$usage_count" -eq 0 ]; then
        UNUSED_COMPONENTS+=("$file")
        echo "❌ UNUSED: $filename"
    elif [ "$usage_count" -eq 1 ]; then
        POTENTIALLY_UNUSED+=("$file")
        echo "⚠️  POTENTIALLY UNUSED: $filename (only 1 usage)"
    else
        echo "✅ USED: $filename ($usage_count usages)"
    fi
    
done < <(find "$COMPONENTS_DIR" -name "*.tsx" -type f -print0)

echo ""
echo "📊 SCAN RESULTS"
echo "==============="
echo "🔴 Completely unused components: ${#UNUSED_COMPONENTS[@]}"
echo "🟡 Potentially unused components: ${#POTENTIALLY_UNUSED[@]}"

if [ ${#UNUSED_COMPONENTS[@]} -gt 0 ]; then
    echo ""
    echo "🗑️  UNUSED COMPONENTS TO REMOVE:"
    printf '%s\n' "${UNUSED_COMPONENTS[@]}" | sed 's|.*/||' | sort
fi

if [ ${#POTENTIALLY_UNUSED[@]} -gt 0 ]; then
    echo ""
    echo "⚠️  COMPONENTS TO REVIEW:"
    printf '%s\n' "${POTENTIALLY_UNUSED[@]}" | sed 's|.*/||' | sort
fi

echo ""
echo "✅ Scan completed!"
