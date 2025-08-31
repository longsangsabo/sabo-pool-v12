#!/bin/bash

echo "🔧 FIX TYPOGRAPHY COMPONENT APIs"
echo "================================="

cd /workspaces/sabo-pool-v12

# Fix Typography size props - remove size prop as it's not supported
echo "🔸 Fixing Typography size props..."

# Remove size prop from Typography components
find apps/sabo-user/src -name "*.tsx" -exec sed -i 's/size="[^"]*"//g' {} \;
find apps/sabo-user/src -name "*.tsx" -exec sed -i "s/size='[^']*'//g" {} \;

# Clean up any double spaces that might result
find apps/sabo-user/src -name "*.tsx" -exec sed -i 's/  / /g' {} \;

echo "✅ Fixed Typography props"

# Also fix any remaining import issues
echo "🔸 Fixing remaining import paths..."
find apps/sabo-user/src -name "*.tsx" -exec sed -i 's|@/packages/shared-ui|@sabo/shared-ui|g' {} \;

echo "✅ All Typography issues fixed"
