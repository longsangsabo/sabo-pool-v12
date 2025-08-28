#!/bin/bash

echo "Cleaning up unused imports and variables..."

cd "/workspaces/sabo-pool-v12/apps/sabo-user/src"

# Function to remove unused import from a specific import line
remove_unused_imports() {
    local file="$1"
    local import_to_remove="$2"
    
    # Remove from middle of import list (with commas)
    sed -i "s/, ${import_to_remove}//" "$file"
    sed -i "s/${import_to_remove}, //" "$file"
    
    # Remove if it's the only import in curly braces
    sed -i "s/{ ${import_to_remove} }//" "$file"
    
    # Remove entire import line if it becomes empty
    sed -i "/^import.*{}.*$/d" "$file"
    sed -i "/^import.*{  }.*$/d" "$file"
}

# Create list of files to process
find . -name "*.tsx" -o -name "*.ts" > /tmp/files_to_process.txt

# Remove unused React imports where React is never used
echo "Fixing React imports..."
while read -r file; do
    if grep -q "import React" "$file" && ! grep -q "React\." "$file" && ! grep -q "<React\." "$file"; then
        # Only remove React import if it's not used
        if ! grep -q "React\.createElement\|React\.Component\|React\.Fragment" "$file"; then
            sed -i "s/import React, /import /" "$file"
            sed -i "s/import React from 'react';//" "$file"
        fi
    fi
done < /tmp/files_to_process.txt

# Fix specific known unused imports
echo "Removing specific unused imports..."

# Remove unused Button imports
find . -name "*.tsx" -o -name "*.ts" | xargs grep -l "Button.*never read" | while read -r file; do
    remove_unused_imports "$file" "Button"
done

# Remove unused X imports  
find . -name "*.tsx" -o -name "*.ts" | xargs grep -l "X.*never read" | while read -r file; do
    remove_unused_imports "$file" "X"
done

# Remove unused User imports
find . -name "*.tsx" -o -name "*.ts" | xargs grep -l "User.*never read" | while read -r file; do
    remove_unused_imports "$file" "User"
done

# Remove unused icon imports (common ones)
for icon in MapPin Clock MessageSquare CheckCircle AlertTriangle; do
    find . -name "*.tsx" -o -name "*.ts" | while read -r file; do
        if grep -q "$icon.*never read" "$file" 2>/dev/null; then
            remove_unused_imports "$file" "$icon"
        fi
    done
done

echo "Cleanup completed!"
