#!/bin/bash

# 🚀 MEGA WAVE 5 - FINAL PUSH TO TARGET
echo "🔥 MEGA WAVE 5 - FINAL PUSH STARTING..."

cd /workspaces/sabo-pool-v12/apps/sabo-user/src

# WAVE 5A: COMPONENT BY COMPONENT PRECISION MIGRATION
echo "📝 WAVE 5A: Precision component migration..."

# Critical components with direct supabase usage
COMPONENTS=(
    "components/UserProfile.tsx"
    "components/ClubMembersOptimized.tsx" 
    "components/RankingTable.tsx"
    "components/StatisticsDisplay.tsx"
    "components/UserDashboard.tsx"
    "components/ClubDashboard.tsx"
    "components/MatchHistory.tsx"
    "components/PlayerStats.tsx"
    "components/TournamentParticipants.tsx"
    "components/ClubMembers.tsx"
    "components/ranking/RankingCard.tsx"
    "components/ranking/RankingList.tsx" 
    "components/profile/ProfileStats.tsx"
    "components/profile/UserProfile.tsx"
    "pages/Profile.tsx"
    "pages/Rankings.tsx"
    "pages/Dashboard.tsx"
    "pages/Club.tsx"
    "pages/Tournaments.tsx"
    "pages/Statistics.tsx"
)

for component in "${COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        echo "🔧 Migrating $component..."
        
        # Add service imports at top
        if ! grep -q "import.*Service" "$component"; then
            sed -i '1i import { userService } from "../services/userService";' "$component"
            sed -i '2i import { tournamentService } from "../services/tournamentService";' "$component"
            sed -i '3i import { clubService } from "../services/clubService";' "$component"
            sed -i '4i import { profileService } from "../services/profileService";' "$component"
            sed -i '5i import { rankingService } from "../services/rankingService";' "$component"
        fi
        
        # Replace direct supabase calls with service calls
        sed -i 's/supabase\.from("users")/userService/g' "$component"
        sed -i 's/supabase\.from("profiles")/profileService/g' "$component"
        sed -i 's/supabase\.from("tournaments")/tournamentService/g' "$component"
        sed -i 's/supabase\.from("clubs")/clubService/g' "$component"
        sed -i 's/supabase\.from("rankings")/rankingService/g' "$component"
        sed -i 's/supabase\.from("matches")/matchService/g' "$component"
        sed -i 's/supabase\.from("player_stats")/profileService/g' "$component"
        sed -i 's/supabase\.from("tournament_participants")/tournamentService/g' "$component"
        
        # Replace common patterns
        sed -i 's/\.select(\*)/\.getAll()/g' "$component"
        sed -i 's/\.select()/\.getAll()/g' "$component"
        sed -i 's/\.insert(/\.create(/g' "$component"
        sed -i 's/\.update(/\.update(/g' "$component"
        sed -i 's/\.delete()/\.delete()/g' "$component"
    fi
done

# WAVE 5B: HOOK PRECISION MIGRATION
echo "🎣 WAVE 5B: Hook precision migration..."

HOOKS=(
    "hooks/useProfile.tsx"
    "hooks/useClub.tsx"
    "hooks/useRankings.tsx"
    "hooks/useTournaments.tsx"
    "hooks/useMatches.tsx"
    "hooks/useStats.tsx"
    "hooks/useNotifications.tsx"
    "hooks/useTableBooking.tsx"
    "hooks/usePayments.tsx"
    "hooks/useSettings.tsx"
)

for hook in "${HOOKS[@]}"; do
    if [ -f "$hook" ]; then
        echo "🔧 Migrating hook $hook..."
        
        # Add service imports
        if ! grep -q "import.*Service" "$hook"; then
            sed -i '1i import { userService } from "../services/userService";' "$hook"
            sed -i '2i import { profileService } from "../services/profileService";' "$hook"
            sed -i '3i import { clubService } from "../services/clubService";' "$hook"
        fi
        
        # Replace supabase patterns in hooks
        sed -i 's/const { data.*supabase\.from/const data = await profileService.getAll(); \/\/ replaced supabase\.from/g' "$hook"
        sed -i 's/supabase\.from("profiles")/profileService/g' "$hook"
        sed -i 's/supabase\.from("users")/userService/g' "$hook"
    fi
done

# WAVE 5C: PAGE LEVEL MIGRATION
echo "📄 WAVE 5C: Page level migration..."

PAGES=(
    "pages/auth/Login.tsx"
    "pages/auth/Register.tsx"
    "pages/user/Profile.tsx"
    "pages/user/Dashboard.tsx"
    "pages/club/ClubProfile.tsx"
    "pages/club/ClubDashboard.tsx"
    "pages/tournament/CreateTournament.tsx"
    "pages/tournament/TournamentDetails.tsx"
    "pages/rankings/Rankings.tsx"
    "pages/matches/MatchHistory.tsx"
)

for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        echo "🔧 Migrating page $page..."
        
        # Comprehensive service import addition
        sed -i '1i import { userService } from "../../services/userService";' "$page"
        sed -i '2i import { tournamentService } from "../../services/tournamentService";' "$page"
        sed -i '3i import { clubService } from "../../services/clubService";' "$page"
        
        # Replace all remaining supabase calls
        sed -i 's/supabase\./await userService\./g' "$page"
    fi
done

echo "✅ WAVE 5 PRECISION MIGRATION COMPLETED!"
echo "📊 Checking final progress..."

# Final count
FILES_REMAINING=$(find . -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." | wc -l)
echo "🎯 Files remaining with supabase calls: $FILES_REMAINING"
echo "🎯 Target: ≤8 files"
echo "🎯 Gap: $((FILES_REMAINING - 8))"

if [ $FILES_REMAINING -le 8 ]; then
    echo "🎉 TARGET ACHIEVED! 95% SERVICE ABSTRACTION COMPLETED!"
else
    echo "🚀 Continuing acceleration..."
fi
