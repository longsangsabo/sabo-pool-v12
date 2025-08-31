// =============================================
// SABO-32 TOURNAMENT RESULTS DASHBOARD
// Display final standings and tournament winner
// =============================================

import { useEffect, useState } from 'react';
// Removed supabase import - migrated to services
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification } from "../services/notificationService";
import { uploadFile, getPublicUrl } from "../services/storageService";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Star, Award, Users, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TournamentStanding {
 player_id: string;
 player_name: string;
 position: number;
 wins: number;
 losses: number;
 total_score: number;
 final_bracket: string;
 eliminated_by?: string;
}

interface SABO32ResultsProps {
 tournamentId: string;
 tournament?: {
  name: string;
  start_date: string;
  end_date?: string;
  status: string;
 };
}

export function SABO32TournamentResults({ tournamentId, tournament }: SABO32ResultsProps) {
 const [standings, setStandings] = useState<TournamentStanding[]>([]);
 const [champion, setChampion] = useState<any>(null);
 const [runnerUp, setRunnerUp] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [totalMatches, setTotalMatches] = useState(0);
 const [completedMatches, setCompletedMatches] = useState(0);

 useEffect(() => {
  fetchTournamentResults();
 }, [tournamentId]);

 const fetchTournamentResults = async () => {
  try {
   setLoading(true);

   // Fetch all matches with player profiles
//    const { data: matches, error: matchesError } = await (supabase as any)
    .from('sabo32_matches')
    .select(`
     *,
     player1_profile:profiles!sabo32_matches_player1_id_fkey(
      user_id, full_name, display_name, avatar_url
     ),
     player2_profile:profiles!sabo32_matches_player2_id_fkey(
      user_id, full_name, display_name, avatar_url
     )
    `)
    .eq('tournament_id', tournamentId);

   if (matchesError) throw matchesError;

   setTotalMatches(matches?.length || 0);
   setCompletedMatches(matches?.filter(m => m.status === 'completed').length || 0);

   // Find champion from final match
   const finalMatch = matches?.find(m => 
    m.bracket_type === 'cross_final' && m.status === 'completed'
   );

   if (finalMatch && finalMatch.winner_id) {
    const championProfile = finalMatch.winner_id === finalMatch.player1_id 
     ? finalMatch.player1_profile 
     : finalMatch.player2_profile;
    
    const runnerUpProfile = finalMatch.winner_id === finalMatch.player1_id 
     ? finalMatch.player2_profile 
     : finalMatch.player1_profile;

    setChampion({
     id: finalMatch.winner_id,
     name: championProfile?.full_name || championProfile?.display_name || 'Unknown',
     avatar: championProfile?.avatar_url
    });

    setRunnerUp({
     id: finalMatch.winner_id === finalMatch.player1_id ? finalMatch.player2_id : finalMatch.player1_id,
     name: runnerUpProfile?.full_name || runnerUpProfile?.display_name || 'Unknown',
     avatar: runnerUpProfile?.avatar_url
    });
   }

   // Calculate standings
   const playerStats: { [key: string]: any } = {};

   // Get all unique players
   matches?.forEach(match => {
    if (match.player1_id) {
     if (!playerStats[match.player1_id]) {
      playerStats[match.player1_id] = {
       player_id: match.player1_id,
       player_name: match.player1_profile?.full_name || 
             match.player1_profile?.display_name || 
             'Unknown Player',
       wins: 0,
       losses: 0,
       total_score: 0,
       matches_played: 0,
       final_bracket: 'Unknown'
      };
     }
    }
    
    if (match.player2_id) {
     if (!playerStats[match.player2_id]) {
      playerStats[match.player2_id] = {
       player_id: match.player2_id,
       player_name: match.player2_profile?.full_name || 
             match.player2_profile?.display_name || 
             'Unknown Player',
       wins: 0,
       losses: 0,
       total_score: 0,
       matches_played: 0,
       final_bracket: 'Unknown'
      };
     }
    }
   });

   // Calculate stats from completed matches
   matches?.filter(m => m.status === 'completed').forEach(match => {
    if (match.player1_id && playerStats[match.player1_id]) {
     playerStats[match.player1_id].total_score += match.score_player1 || 0;
     playerStats[match.player1_id].matches_played++;
     
     if (match.winner_id === match.player1_id) {
      playerStats[match.player1_id].wins++;
     } else {
      playerStats[match.player1_id].losses++;
     }
    }
    
    if (match.player2_id && playerStats[match.player2_id]) {
     playerStats[match.player2_id].total_score += match.score_player2 || 0;
     playerStats[match.player2_id].matches_played++;
     
     if (match.winner_id === match.player2_id) {
      playerStats[match.player2_id].wins++;
     } else {
      playerStats[match.player2_id].losses++;
     }
    }
   });

   // Determine final bracket positions
   Object.values(playerStats).forEach((player: any) => {
    if (champion && player.player_id === champion.id) {
     player.position = 1;
     player.final_bracket = 'Champion';
    } else if (runnerUp && player.player_id === runnerUp.id) {
     player.position = 2;
     player.final_bracket = 'Runner-up';
    } else {
     // Determine position based on performance
     if (player.wins >= 4) {
      player.position = 3;
      player.final_bracket = 'Semifinalist';
     } else if (player.wins >= 2) {
      player.position = 4;
      player.final_bracket = 'Quarterfinalist';
     } else {
      player.position = 5;
      player.final_bracket = 'Eliminated';
     }
    }
   });

   // Sort by position, then by wins, then by total score
   const sortedStandings = Object.values(playerStats)
    .sort((a: any, b: any) => {
     if (a.position !== b.position) return a.position - b.position;
     if (a.wins !== b.wins) return b.wins - a.wins;
     return b.total_score - a.total_score;
    });

   setStandings(sortedStandings as TournamentStanding[]);

  } catch (error) {
   console.error('Error fetching tournament results:', error);
  } finally {
   setLoading(false);
  }
 };

 const getPositionIcon = (position: number) => {
  switch (position) {
   case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
   case 2: return <Medal className="w-5 h-5 text-gray-400" />;
   case 3: return <Award className="w-5 h-5 text-amber-600" />;
   default: return <Star className="w-5 h-5 text-gray-400" />;
  }
 };

 const getPositionColor = (position: number) => {
  switch (position) {
   case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
   case 2: return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
   case 3: return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
   default: return 'bg-neutral-100 text-neutral-700';
  }
 };

 if (loading) {
  return (
   <Card>
    <CardContent className="card-spacing">
     <div className="flex items-center justify-center">
      <Trophy className="w-6 h-6 mr-2 animate-pulse" />
      Loading tournament results...
     </div>
    </CardContent>
   </Card>
  );
 }

 const tournamentProgress = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;
 const isCompleted = tournamentProgress === 100;

 return (
  <div className="space-y-6">
   {/* Tournament Header */}
   <Card>
    <CardHeader>
     <CardTitle className="flex items-center gap-2">
      <Trophy className="w-6 h-6" />
      {tournament?.name || 'SABO-32 Tournament'} - Results
     </CardTitle>
     <div className="flex items-center gap-4 text-body-small text-muted-foreground">
      <div className="flex items-center gap-1">
       <Calendar className="w-4 h-4" />
       {tournament?.start_date && new Date(tournament.start_date).toLocaleDateString('vi-VN')}
      </div>
      <div className="flex items-center gap-1">
       <Users className="w-4 h-4" />
       {standings.length} players
      </div>
      <div>
       Progress: {completedMatches}/{totalMatches} matches ({tournamentProgress.toFixed(1)}%)
      </div>
     </div>
     <div className="w-full bg-neutral-200 rounded-full h-2">
      <div 
       className="bg-primary-600 h-2 rounded-full transition-all duration-300"
       style={{ width: `${tournamentProgress}%` }}
      />
     </div>
    </CardHeader>
   </Card>

   {/* Champion Section */}
   {champion && isCompleted && (
    <Card className="border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50">
     <CardContent className="card-spacing">
      <div className="text-center">
       <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
       <h2 className="text-3xl font-bold text-warning-700 mb-2">
        🏆 CHAMPION
       </h2>
       <div className="text-heading-semibold text-neutral-800">
        {champion.name}
       </div>
       <Badge className="mt-2 bg-warning-500 text-white">
        SABO-32 Winner
       </Badge>
      </div>
     </CardContent>
    </Card>
   )}

   {/* Final Standings */}
   <Card>
    <CardHeader>
     <CardTitle>Final Standings</CardTitle>
    </CardHeader>
    <CardContent>
     <div className="space-y-2">
      {standings.map((player, index) => (
       <div
        key={player.player_id}
        className={cn(
         "flex items-center justify-between p-3 rounded-lg border",
         player.position <= 3 && getPositionColor(player.position)
        )}
       >
        <div className="flex items-center gap-3">
         <div className="flex items-center gap-2">
          {getPositionIcon(player.position)}
          <span className="font-semibold text-body-large">
           #{player.position}
          </span>
         </div>
         <div>
          <div className="font-medium">{player.player_name}</div>
          <div className="text-body-small opacity-75">
           {player.final_bracket}
          </div>
         </div>
        </div>
        <div className="text-right">
         <div className="font-semibold">
          {player.wins}W - {player.losses}L
         </div>
         <div className="text-body-small opacity-75">
          {player.total_score} points
         </div>
        </div>
       </div>
      ))}
     </div>
    </CardContent>
   </Card>

   {/* Tournament Stats */}
   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <Card>
     <CardContent className="p-4 text-center">
      <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
      <div className="text-heading-bold">{champion ? 1 : 0}</div>
      <div className="text-body-small text-muted-foreground">Champion</div>
     </CardContent>
    </Card>
    <Card>
     <CardContent className="p-4 text-center">
      <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
      <div className="text-heading-bold">{standings.length}</div>
      <div className="text-body-small text-muted-foreground">Players</div>
     </CardContent>
    </Card>
    <Card>
     <CardContent className="p-4 text-center">
      <Star className="w-8 h-8 mx-auto mb-2 text-green-500" />
      <div className="text-heading-bold">{completedMatches}</div>
      <div className="text-body-small text-muted-foreground">Completed</div>
     </CardContent>
    </Card>
    <Card>
     <CardContent className="p-4 text-center">
      <Award className="w-8 h-8 mx-auto mb-2 text-purple-500" />
      <div className="text-heading-bold">{totalMatches}</div>
      <div className="text-body-small text-muted-foreground">Total Matches</div>
     </CardContent>
    </Card>
   </div>
  </div>
 );
}
