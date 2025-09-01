#!/bin/bash

# Find all remaining files with supabase calls
FILES=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." 2>/dev/null)

for file in $FILES; do
  if [[ "$file" == *"service"* ]]; then
    continue  # Skip service files
  fi
  
  echo "Migrating: $file"
  
  # Add comprehensive service imports
  if ! grep -q "getCurrentUser" "$file" 2>/dev/null; then
    sed -i '/import.*react/a\
import { getCurrentUser, getUserStatus } from "../services/userService";\
import { getTournament, createTournament, joinTournament } from "../services/tournamentService";\
import { getUserProfile, updateUserProfile } from "../services/profileService";\
import { getWalletBalance, updateWalletBalance } from "../services/walletService";\
import { createNotification, getUserNotifications } from "../services/notificationService";\
import { getClubProfile, updateClubProfile } from "../services/clubService";' "$file" 2>/dev/null
  fi
  
  # Replace auth calls
  sed -i 's/await supabase\.auth\.getUser()/await getCurrentUser()/g' "$file" 2>/dev/null
  sed -i 's/supabase\.auth\.getUser()/getCurrentUser()/g' "$file" 2>/dev/null
  
  # Replace common table operations  
  sed -i 's/supabase\.from("profiles")\.select[^}]*\.single()/getUserProfile(userId)/g' "$file" 2>/dev/null
  sed -i 's/supabase\.from("tournaments")\.select[^}]*\.single()/getTournament(tournamentId)/g' "$file" 2>/dev/null
  sed -i 's/supabase\.from("clubs")\.select[^}]*\.single()/getClubProfile(clubId)/g' "$file" 2>/dev/null
  sed -i 's/supabase\.from("wallets")\.select[^}]*\.single()/getWalletBalance(userId)/g' "$file" 2>/dev/null
  
  # Replace insert operations
  sed -i 's/supabase\.from("notifications")\.insert/createNotification/g' "$file" 2>/dev/null
  sed -i 's/supabase\.from("tournaments")\.insert/createTournament/g' "$file" 2>/dev/null
  
  # Replace update operations
  sed -i 's/supabase\.from("profiles")\.update/updateUserProfile/g' "$file" 2>/dev/null
  sed -i 's/supabase\.from("clubs")\.update/updateClubProfile/g' "$file" 2>/dev/null
  
done

echo "Mass migration completed"
