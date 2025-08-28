#!/bin/bash

# Bulk update import paths in user app
cd /workspaces/sabo-pool-v12/apps/sabo-user/src

echo "🔄 Updating import paths in user app..."

# Update all @ imports to relative paths
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/@\//.\//g'

# Update specific common patterns
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/from "\.\//from "/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/from "\.\/components/from "..\/components/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/from "\.\/pages/from "..\/pages/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/from "\.\/hooks/from "..\/hooks/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/from "\.\/utils/from "..\/utils/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/from "\.\/lib/from "..\/lib/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/from "\.\/types/from "..\/types/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/from "\.\/contexts/from "..\/contexts/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/from "\.\/services/from "..\/services/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/from "\.\/constants/from "..\/constants/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/from "\.\/config/from "..\/config/g'

# Fix relative paths for files in subdirectories
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/from "\.\.\/components/from ".\/components/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/from "\.\.\/pages/from ".\/pages/g'

echo "✅ Import path updates complete"
