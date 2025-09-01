// =============================================
// SABO-32 TOURNAMENT PROGRESS TRACKER
// Real-time progress tracking and statistics
// =============================================

import { useEffect, useState } from 'react';
// Removed supabase import - migrated to services
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification } from "../services/notificationService";
import { uploadFile, getPublicUrl } from "../services/storageService";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Users, Target, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface SABO32ProgressProps {
 tournamentId: string;
}

interface ProgressStats {
 totalMatches: number;
 completedMatches: number;
 pendingMatches: number;
 groupAProgress: number;
 groupBProgress: number;
 crossBracketProgress: number;
 averageMatchDuration: number;
 estimatedCompletion: string;
 nextMatches: any[];
}

export function SABO32ProgressTracker({ tournamentId }: SABO32ProgressProps) {
 const [stats, setStats] = useState<ProgressStats | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  fetchProgressStats();
  
  // Set up real-time subscription
//   const subscription = supabase
   .channel(`tournament_${tournamentId}_progress`)
   .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'sabo32_matches', filter: `tournament_id=eq.${tournamentId}` },
    () => {
     fetchProgressStats();
    }
   )
   .subscribe();

  return () => {
   subscription.unsubscribe();
  };
 }, [tournamentId]);

 const fetchProgressStats = async () => {
  try {
   setLoading(true);
   
//    const { data: matches, error } = await (supabase as any)
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', tournamentId);

   if (error) throw error;

   if (!matches || matches.length === 0) {
    setStats(null);
    return;
   }

   // Calculate statistics
   const totalMatches = matches.length;
   const completedMatches = matches.filter(m => m.status === 'completed').length;
   const pendingMatches = matches.filter(m => m.status === 'pending' && m.player1_id && m.player2_id).length;

   // Group progress
   const groupAMatches = matches.filter(m => m.group_id === 'A');
   const groupBMatches = matches.filter(m => m.group_id === 'B');
   const crossMatches = matches.filter(m => m.group_id === null);

   const groupAProgress = groupAMatches.length > 0 ? 
    (groupAMatches.filter(m => m.status === 'completed').length / groupAMatches.length) * 100 : 0;
   
   const groupBProgress = groupBMatches.length > 0 ? 
    (groupBMatches.filter(m => m.status === 'completed').length / groupBMatches.length) * 100 : 0;
   
   const crossBracketProgress = crossMatches.length > 0 ? 
    (crossMatches.filter(m => m.status === 'completed').length / crossMatches.length) * 100 : 0;

   // Average match duration
   const completedWithTimes = matches.filter(m => m.completed_at && m.created_at);
   let averageMatchDuration = 0;
   
   if (completedWithTimes.length > 0) {
    const totalDuration = completedWithTimes.reduce((sum, match) => {
     const start = new Date(match.created_at).getTime();
     const end = new Date(match.completed_at).getTime();
     return sum + (end - start);
    }, 0);
    averageMatchDuration = totalDuration / completedWithTimes.length / (1000 * 60); // minutes
   }

   // Estimated completion
   const remainingMatches = totalMatches - completedMatches;
   const estimatedMinutes = remainingMatches * (averageMatchDuration || 15); // default 15 min per match
   const estimatedCompletion = new Date(Date.now() + estimatedMinutes * 60000).toLocaleString('vi-VN');

   // Next ready matches
   const nextMatches = matches
    .filter(m => m.status === 'pending' && m.player1_id && m.player2_id)
    .slice(0, 5)
    .map(m => ({
     id: m.id,
     sabo_match_id: m.sabo_match_id,
     bracket_type: m.bracket_type,
     group_id: m.group_id
    }));

   setStats({
    totalMatches,
    completedMatches,
    pendingMatches,
    groupAProgress,
    groupBProgress,
    crossBracketProgress,
    averageMatchDuration,
    estimatedCompletion,
    nextMatches
   });

  } catch (error) {
   console.error('Error fetching progress stats:', error);
  } finally {
   setLoading(false);
  }
 };

 if (loading) {
  return (
   <Card>
    <CardContent className="card-spacing">
     <div className="flex items-center justify-center">
      <Clock className="w-4 h-4 mr-2 animate-spin" />
      Loading progress...
     </div>
    </CardContent>
   </Card>
  );
 }

 if (!stats) {
  return (
   <Card>
    <CardContent className="card-spacing">
     <div className="text-center text-muted-foreground">
      No tournament data available
     </div>
    </CardContent>
   </Card>
  );
 }

 const overallProgress = (stats.completedMatches / stats.totalMatches) * 100;

 return (
  <div className="form-spacing">
   {/* Overall Progress */}
   <Card>
    <CardHeader>
     <CardTitle className="flex items-center gap-2">
      <Target className="w-5 h-5" />
      Tournament Progress
     </CardTitle>
    </CardHeader>
    <CardContent>
     <div className="form-spacing">
      {/* Main Progress Bar */}
      <div className="space-y-2">
       <div className="flex justify-between text-body-small">
        <span>Overall Progress</span>
        <span className="font-medium">{Math.round(overallProgress)}%</span>
       </div>
       <Progress value={overallProgress} className="h-3" />
       <div className="flex justify-between text-caption text-muted-foreground">
        <span>{stats.completedMatches}/{stats.totalMatches} matches completed</span>
        <span>{stats.pendingMatches} ready to play</span>
       </div>
      </div>

      {/* Group Progress */}
      <div className="grid grid-cols-3 gap-4">
       <div className="text-center">
        <div className="text-heading-bold text-success-600">
         {Math.round(stats.groupAProgress)}%
        </div>
        <div className="text-body-small text-muted-foreground">Group A</div>
       </div>
       <div className="text-center">
        <div className="text-heading-bold text-primary-600">
         {Math.round(stats.groupBProgress)}%
        </div>
        <div className="text-body-small text-muted-foreground">Group B</div>
       </div>
       <div className="text-center">
        <div className="text-heading-bold text-info-600">
         {Math.round(stats.crossBracketProgress)}%
        </div>
        <div className="text-body-small text-muted-foreground">Cross-Bracket</div>
       </div>
      </div>
     </div>
    </CardContent>
   </Card>

   {/* Statistics */}
   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <Card>
     <CardContent className="p-4 text-center">
      <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
      <div className="text-heading-bold">{stats.completedMatches}</div>
      <div className="text-body-small text-muted-foreground">Completed</div>
     </CardContent>
    </Card>
    
    <Card>
     <CardContent className="p-4 text-center">
      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
      <div className="text-heading-bold">{stats.pendingMatches}</div>
      <div className="text-body-small text-muted-foreground">Ready</div>
     </CardContent>
    </Card>
    
    <Card>
     <CardContent className="p-4 text-center">
      <Clock className="w-8 h-8 mx-auto mb-2 text-primary-500" />
      <div className="text-heading-bold">{Math.round(stats.averageMatchDuration)}</div>
      <div className="text-body-small text-muted-foreground">Avg Min/Match</div>
     </CardContent>
    </Card>
    
    <Card>
     <CardContent className="p-4 text-center">
      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success-500" />
      <div className="text-title font-bold">
       {stats.estimatedCompletion.split(' ')[1]}
      </div>
      <div className="text-body-small text-muted-foreground">Est. Complete</div>
     </CardContent>
    </Card>
   </div>

   {/* Next Matches */}
   {stats.nextMatches.length > 0 && (
    <Card>
     <CardHeader>
      <CardTitle className="flex items-center gap-2">
       <Users className="w-5 h-5" />
       Next Matches Ready
      </CardTitle>
     </CardHeader>
     <CardContent>
      <div className="space-y-2">
       {stats.nextMatches.map((match) => (
        <div key={match.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
         <div className="flex items-center gap-2">
          <Badge variant="outline">{match.sabo_match_id}</Badge>
          <span className="text-body-small">{match.bracket_type}</span>
         </div>
         <Badge variant="secondary">
          {match.group_id ? `Group ${match.group_id}` : 'Cross-Bracket'}
         </Badge>
        </div>
       ))}
      </div>
     </CardContent>
    </Card>
   )}
  </div>
 );
}
