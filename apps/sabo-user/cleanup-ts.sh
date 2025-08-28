#!/bin/bash

echo "Cleaning up TypeScript issues in user app..."

cd "/workspaces/sabo-pool-v12/apps/sabo-user/src"

# Remove App.original.tsx if it exists (duplicate of App.tsx)
if [ -f "App.original.tsx" ]; then
    echo "Removing duplicate App.original.tsx"
    rm "App.original.tsx"
fi

# Fix common unused React imports
echo "Fixing unused React imports..."
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i \
  -e "/^import React/s/import React/import React/" \
  -e "/^import React,/s/import React,/import/" \
  -e "/^import { React }/d"

# Fix string | null to string | undefined issues
echo "Fixing type issues..."
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i \
  -e "s/: string | null/: string | undefined/g"

echo "Basic cleanup completed!"
