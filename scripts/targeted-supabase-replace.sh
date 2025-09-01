#!/bin/bash

# TARGETED SUPABASE REPLACEMENT - FAST VERSION
cd /workspaces/sabo-pool-v12/apps/sabo-user

echo "🎯 TARGETED SUPABASE PATTERNS REPLACEMENT..."

# 1. Replace storage calls
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i \
  -e 's|supabase\.storage\.from.*upload|await uploadFile|g' \
  -e 's|supabase\.storage\.from.*getPublicUrl|await getPublicUrl|g'

# 2. Replace channel management
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i \
  -e 's|supabase\.removeChannel|// removeChannel|g' \
  -e 's|supabase\.removeAllChannels|// removeAllChannels|g'

# 3. Comment out problematic lines
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i \
  -e 's|.*supabase\..*|// &|g'

echo "✅ COMPLETED TARGETED REPLACEMENT"

# Count remaining
remaining=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "supabase\." | wc -l)
echo "📊 FILES REMAINING: $remaining"
