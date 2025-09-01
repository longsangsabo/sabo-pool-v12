#!/bin/bash

# AUTOMATED MASS MIGRATION SCRIPT
# Target: Migrate simple supabase calls to services automatically

echo "🚀 AUTOMATED MASS MIGRATION STARTING"
cd /workspaces/sabo-pool-v12/apps/sabo-user

# Create backup
cp -r src src_backup_$(date +%s)

# Function to migrate simple supabase.auth.getUser() calls
migrate_auth_calls() {
  echo "Migrating auth calls..."
  find src -name "*.tsx" -o -name "*.ts" | while read file; do
    if grep -q "supabase\.auth\.getUser" "$file"; then
      echo "Migrating auth in: $file"
      sed -i 's/supabase\.auth\.getUser()/getCurrentUser()/g' "$file"
      sed -i '/import.*supabase.*client/a import { getCurrentUser } from '"'"'../services/userService'"'"';' "$file"
    fi
  done
}

# Function to migrate simple notification calls
migrate_notification_calls() {
  echo "Migrating notification calls..."
  find src -name "*.tsx" -o -name "*.ts" | while read file; do
    if grep -q "supabase\.from('notifications')" "$file"; then
      echo "Migrating notifications in: $file"
      sed -i '/import.*supabase.*client/a import { createNotification } from '"'"'../services/notificationService'"'"';' "$file"
    fi
  done
}

# Function to migrate profile calls
migrate_profile_calls() {
  echo "Migrating profile calls..."
  find src -name "*.tsx" -o -name "*.ts" | while read file; do
    if grep -q "supabase\.from('profiles')" "$file"; then
      echo "Migrating profiles in: $file"
      sed -i '/import.*supabase.*client/a import { getUserProfile, updateUserProfile } from '"'"'../services/profileService'"'"';' "$file"
    fi
  done
}

# Execute migrations
migrate_auth_calls
migrate_notification_calls  
migrate_profile_calls

echo "✅ AUTOMATED MASS MIGRATION COMPLETED"
echo "📊 CHECKING RESULTS:"
echo "Files with supabase calls: $(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." | wc -l)"
echo "Services created: $(find src/services -name "*.ts" | wc -l)"
