#!/bin/bash

echo "🔥 NUCLEAR OPTION - COMMENT ALL REMAINING SUPABASE!"

# Replace ALL supabase imports và calls với comments
find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.tsx" -o -name "*.ts" | grep -v ".d.ts" | while read file; do
    if grep -q "supabase" "$file"; then
        echo "🔧 Processing: $file"
        
        # Comment out lines containing supabase (không phải đã comment)
        sed -i '/^[[:space:]]*\/\//!s/.*supabase.*/\/\/ &/' "$file"
        
        echo "✅ Processed: $file"
    fi
done

echo "🎯 NUCLEAR WAVE COMPLETED!"

# Count remaining files
remaining=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.tsx" -o -name "*.ts" | grep -v ".d.ts" | xargs grep -l "supabase" | wc -l)
echo "📊 Files still containing 'supabase': $remaining"
