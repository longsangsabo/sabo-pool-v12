#!/bin/bash

# MASS SUPABASE MIGRATION SCRIPT - FAST EXECUTION
cd /workspaces/sabo-pool-v12/apps/sabo-user

echo "🚀 STARTING MASS SUPABASE CALLS REPLACEMENT..."

# Replace common supabase calls with service calls
find src -name "*.tsx" -o -name "*.ts" | grep -v ".d.ts" | xargs sed -i \
  -e 's|supabase\.from('\''tournaments'\'')\.select|await getTournaments()|g' \
  -e 's|supabase\.from('\''tournament_registrations'\'')\.select|await getTournamentRegistrations()|g' \
  -e 's|supabase\.from('\''profiles'\'')\.select|await getUserProfile()|g' \
  -e 's|supabase\.from('\''club_profiles'\'')\.select|await getUserClubProfile()|g' \
  -e 's|supabase\.auth\.getUser|await getCurrentUser|g' \
  -e 's|supabase\.auth\.getSession|await getSession|g' \
  -e 's|supabase\.rpc|await callRPC|g'

echo "✅ COMPLETED MASS REPLACEMENT"

# Count remaining files with supabase calls
remaining=$(find src -name "*.tsx" -o -name "*.ts" | grep -v ".d.ts" | xargs grep -l "supabase\." | wc -l)
echo "📊 FILES REMAINING WITH SUPABASE CALLS: $remaining"
