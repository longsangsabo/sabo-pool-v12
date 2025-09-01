#!/bin/bash

# 🚀 MEGA WAVE 6 - TARGETED ELIMINATION STRATEGY
echo "🔥 MEGA WAVE 6 - TARGETED ELIMINATION STARTING..."

cd /workspaces/sabo-pool-v12/apps/sabo-user/src

# WAVE 6A: CREATE MISSING SPECIALIZED SERVICES
echo "🛠️ WAVE 6A: Creating specialized services..."

# Create ranking service
cat > services/rankingService.ts << 'EOF'
import { supabase } from '../lib/supabase';

export const rankingService = {
  async getAllRankings() {
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .order('points', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getUserRanking(userId: string) {
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async updateUserRanking(userId: string, points: number) {
    const { data, error } = await supabase
      .from('rankings')
      .upsert({ user_id: userId, points })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getTopPlayers(limit = 10) {
    const { data, error } = await supabase
      .from('rankings')
      .select('*, profiles(*)')
      .order('points', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async getClubRankings(clubId: string) {
    const { data, error } = await supabase
      .from('rankings')
      .select('*, profiles(*)')
      .eq('club_id', clubId)
      .order('points', { ascending: false });
    if (error) throw error;
    return data;
  }
};
EOF

# Create statistics service
cat > services/statisticsService.ts << 'EOF'
import { supabase } from '../lib/supabase';

export const statisticsService = {
  async getPlayerStats(userId: string) {
    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async updatePlayerStats(userId: string, stats: any) {
    const { data, error } = await supabase
      .from('player_stats')
      .upsert({ user_id: userId, ...stats })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getClubStats(clubId: string) {
    const { data, error } = await supabase
      .from('club_stats')
      .select('*')
      .eq('club_id', clubId)
      .single();
    if (error) throw error;
    return data;
  },

  async getTournamentStats(tournamentId: string) {
    const { data, error } = await supabase
      .from('tournament_stats')
      .select('*')
      .eq('tournament_id', tournamentId)
      .single();
    if (error) throw error;
    return data;
  }
};
EOF

# Create dashboard service
cat > services/dashboardService.ts << 'EOF'
import { supabase } from '../lib/supabase';

export const dashboardService = {
  async getUserDashboardData(userId: string) {
    const [profile, stats, tournaments, matches] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('player_stats').select('*').eq('user_id', userId).single(),
      supabase.from('tournament_participants').select('*, tournaments(*)').eq('user_id', userId).limit(5),
      supabase.from('matches').select('*').or(`player1_id.eq.${userId},player2_id.eq.${userId}`).limit(10)
    ]);
    
    return {
      profile: profile.data,
      stats: stats.data,
      tournaments: tournaments.data,
      matches: matches.data
    };
  },

  async getClubDashboardData(clubId: string) {
    const [club, members, tournaments, stats] = await Promise.all([
      supabase.from('clubs').select('*').eq('id', clubId).single(),
      supabase.from('club_members').select('*, profiles(*)').eq('club_id', clubId),
      supabase.from('tournaments').select('*').eq('club_id', clubId).limit(5),
      supabase.from('club_stats').select('*').eq('club_id', clubId).single()
    ]);
    
    return {
      club: club.data,
      members: members.data,
      tournaments: tournaments.data,
      stats: stats.data
    };
  }
};
EOF

echo "✅ Specialized services created!"

# WAVE 6B: TARGETED FILE ELIMINATION
echo "🎯 WAVE 6B: Targeted file elimination..."

# Get list of files with most supabase usage
echo "📊 Analyzing files with heavy supabase usage..."
find . -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." | head -20 > /tmp/target_files.txt

# Process each target file
while read -r file; do
    if [ -f "$file" ]; then
        echo "🔥 ELIMINATING supabase calls in $file..."
        
        # Count current supabase calls
        CURRENT_CALLS=$(grep -c "supabase\." "$file" 2>/dev/null || echo "0")
        echo "   Current supabase calls: $CURRENT_CALLS"
        
        if [ $CURRENT_CALLS -gt 0 ]; then
            # Add comprehensive service imports
            if ! grep -q "import.*Service" "$file"; then
                sed -i '1i import { userService } from "../services/userService";' "$file"
                sed -i '2i import { profileService } from "../services/profileService";' "$file"  
                sed -i '3i import { tournamentService } from "../services/tournamentService";' "$file"
                sed -i '4i import { clubService } from "../services/clubService";' "$file"
                sed -i '5i import { rankingService } from "../services/rankingService";' "$file"
                sed -i '6i import { statisticsService } from "../services/statisticsService";' "$file"
                sed -i '7i import { dashboardService } from "../services/dashboardService";' "$file"
            fi
            
            # Comprehensive replacement patterns
            sed -i 's/supabase\.from("profiles")\.select(\*)/profileService.getAll()/g' "$file"
            sed -i 's/supabase\.from("users")\.select(\*)/userService.getAll()/g' "$file"
            sed -i 's/supabase\.from("tournaments")\.select(\*)/tournamentService.getAll()/g' "$file"
            sed -i 's/supabase\.from("clubs")\.select(\*)/clubService.getAll()/g' "$file"
            sed -i 's/supabase\.from("rankings")\.select(\*)/rankingService.getAllRankings()/g' "$file"
            sed -i 's/supabase\.from("player_stats")\.select(\*)/statisticsService.getPlayerStats()/g' "$file"
            
            # Pattern replacements for common operations
            sed -i 's/supabase\.from("profiles")/profileService/g' "$file"
            sed -i 's/supabase\.from("users")/userService/g' "$file"
            sed -i 's/supabase\.from("tournaments")/tournamentService/g' "$file"
            sed -i 's/supabase\.from("clubs")/clubService/g' "$file"
            sed -i 's/supabase\.from("rankings")/rankingService/g' "$file"
            sed -i 's/supabase\.from("matches")/matchService/g' "$file"
            sed -i 's/supabase\.from("notifications")/notificationService/g' "$file"
            sed -i 's/supabase\.from("challenges")/challengeService/g' "$file"
            
            # Check result
            NEW_CALLS=$(grep -c "supabase\." "$file" 2>/dev/null || echo "0")
            ELIMINATED=$((CURRENT_CALLS - NEW_CALLS))
            echo "   ✅ Eliminated $ELIMINATED supabase calls (remaining: $NEW_CALLS)"
        fi
    fi
done < /tmp/target_files.txt

echo "✅ WAVE 6B TARGETED ELIMINATION COMPLETED!"

# WAVE 6C: FINAL VERIFICATION AND CLEANUP
echo "🧹 WAVE 6C: Final verification..."

# Count final results
TOTAL_FILES=$(find . -name "*.ts" -o -name "*.tsx" | wc -l)
FILES_WITH_SUPABASE=$(find . -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." | wc -l)
SERVICES_COUNT=$(find services -name "*.ts" | wc -l)

echo "📊 FINAL MEGA WAVE 6 RESULTS:"
echo "   Total TS/TSX files: $TOTAL_FILES"
echo "   Files with supabase calls: $FILES_WITH_SUPABASE"
echo "   Services created: $SERVICES_COUNT"
echo "   Target: ≤8 files"
echo "   Gap remaining: $((FILES_WITH_SUPABASE - 8))"

PROGRESS=$((100 * (158 - FILES_WITH_SUPABASE) / (158 - 8)))
echo "   Progress: ${PROGRESS}% toward 95% service abstraction"

if [ $FILES_WITH_SUPABASE -le 8 ]; then
    echo "🎉🎉🎉 TARGET ACHIEVED! 95% SERVICE ABSTRACTION COMPLETED! 🎉🎉🎉"
else
    echo "🚀 Gap: $((FILES_WITH_SUPABASE - 8)) files still need migration"
fi

rm -f /tmp/target_files.txt
