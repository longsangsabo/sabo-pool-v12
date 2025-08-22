// =============================================
// SABO-32 TOURNAMENT DASHBOARD
// Comprehensive tournament management interface
// =============================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  BarChart3, 
  Settings, 
  Users, 
  Target,
  Clock,
  Zap,
  TrendingUp
} from 'lucide-react';

import { SABO32BracketViewer } from './SABO32BracketViewer';
import { SABO32ProgressTracker } from './SABO32ProgressTracker';
import { SABO32QuickActions } from './SABO32QuickActions';
import { SABO32MatchNavigator } from './SABO32MatchNavigator';
import { useSABO32Realtime } from '@/hooks/useSABO32Realtime';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Match {
  id: string;
  match_number: number;
  round: string;
  group_stage: string;
  status: 'pending' | 'in_progress' | 'completed';
  player1?: {
    display_name: string;
  };
  player2?: {
    display_name: string;
  };
  score_player1?: number;
  score_player2?: number;
  winner_id?: string;
  completed_at?: string;
}

interface TournamentStats {
  totalMatches: number;
  completedMatches: number;
  pendingMatches: number;
  averageMatchDuration: number;
  estimatedTimeRemaining: number;
  topPlayers: string[];
}

export function SABO32TournamentDashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournamentStats, setTournamentStats] = useState<TournamentStats>({
    totalMatches: 0,
    completedMatches: 0,
    pendingMatches: 0,
    averageMatchDuration: 0,
    estimatedTimeRemaining: 0,
    topPlayers: []
  });
  const [selectedMatchId, setSelectedMatchId] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const tournamentId = 'sabo-32-2024';

  // Setup realtime updates
  useSABO32Realtime(tournamentId, () => {
    fetchTournamentData();
  });

  const fetchTournamentData = async () => {
    try {
      const { data: matchesData, error } = await (supabase as any)
        .from('sabo32_matches')
        .select(`
          *,
          player1:player1_id(display_name),
          player2:player2_id(display_name)
        `)
        .eq('tournament_id', tournamentId)
        .order('match_number');

      if (error) throw error;

      setMatches(matchesData || []);
      calculateTournamentStats(matchesData || []);

    } catch (error) {
      console.error('Error fetching tournament data:', error);
      toast.error('Error loading tournament data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTournamentStats = (matchesData: Match[]) => {
    const total = matchesData.length;
    const completed = matchesData.filter(m => m.status === 'completed').length;
    const pending = matchesData.filter(m => m.status === 'pending').length;

    // Calculate average match duration
    const completedWithTimes = matchesData.filter(m => 
      m.status === 'completed' && m.completed_at
    );
    
    let avgDuration = 0;
    if (completedWithTimes.length > 0) {
      const totalDuration = completedWithTimes.reduce((acc, match) => {
        // Assuming matches take ~10 minutes on average
        return acc + 10;
      }, 0);
      avgDuration = totalDuration / completedWithTimes.length;
    }

    // Estimate remaining time
    const estimatedTime = pending * (avgDuration || 10);

    // Get top players (simplified - based on wins)
    const playerWins: Record<string, number> = {};
    matchesData.forEach(match => {
      if (match.winner_id && match.status === 'completed') {
        playerWins[match.winner_id] = (playerWins[match.winner_id] || 0) + 1;
      }
    });

    const topPlayers = Object.entries(playerWins)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([playerId]) => playerId);

    setTournamentStats({
      totalMatches: total,
      completedMatches: completed,
      pendingMatches: pending,
      averageMatchDuration: avgDuration,
      estimatedTimeRemaining: estimatedTime,
      topPlayers
    });
  };

  useEffect(() => {
    fetchTournamentData();
  }, []);

  const handleMatchSelect = (matchId: string) => {
    setSelectedMatchId(matchId);
    setActiveTab('bracket');
  };

  const progressPercentage = tournamentStats.totalMatches > 0 
    ? (tournamentStats.completedMatches / tournamentStats.totalMatches) * 100 
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            SABO-32 Tournament
          </h1>
          <p className="text-muted-foreground mt-1">
            Double elimination tournament with {tournamentStats.totalMatches} matches
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-3 py-1">
            {Math.round(progressPercentage)}% Complete
          </Badge>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {tournamentStats.completedMatches}
            </div>
            <div className="text-sm text-muted-foreground">
              of {tournamentStats.totalMatches}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{tournamentStats.pendingMatches}</div>
            <div className="text-sm text-muted-foreground">Pending Matches</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(tournamentStats.averageMatchDuration)}m
            </div>
            <div className="text-sm text-muted-foreground">Avg Duration</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(tournamentStats.estimatedTimeRemaining)}m
            </div>
            <div className="text-sm text-muted-foreground">Est. Remaining</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {matches.filter(m => m.status === 'in_progress').length}
            </div>
            <div className="text-sm text-muted-foreground">Live Matches</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="bracket" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Bracket
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Matches
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Manage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SABO32ProgressTracker tournamentId={tournamentId} />
            </div>
            
            <div className="space-y-4">
              <SABO32QuickActions
                tournamentId={tournamentId}
                onRefresh={fetchTournamentData}
                totalMatches={tournamentStats.totalMatches}
                completedMatches={tournamentStats.completedMatches}
                pendingMatches={tournamentStats.pendingMatches}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    Tournament Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium">Tournament Health</div>
                    <div className="text-muted-foreground">
                      {progressPercentage > 75 ? 'Excellent progress!' : 
                       progressPercentage > 50 ? 'Good momentum' :
                       progressPercentage > 25 ? 'Getting started' : 'Just beginning'}
                    </div>
                  </div>
                  
                  {tournamentStats.pendingMatches > 0 && (
                    <div className="text-sm">
                      <div className="font-medium text-orange-600">Ready to Play</div>
                      <div className="text-muted-foreground">
                        {tournamentStats.pendingMatches} matches available now
                      </div>
                    </div>
                  )}
                  
                  {progressPercentage === 100 && (
                    <div className="text-sm">
                      <div className="font-medium text-green-600">🎉 Tournament Complete!</div>
                      <div className="text-muted-foreground">
                        All matches have been played
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bracket">
          <SABO32BracketViewer selectedMatchId={selectedMatchId} />
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <SABO32MatchNavigator
            matches={matches}
            currentMatchId={selectedMatchId}
            onMatchSelect={handleMatchSelect}
          />
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SABO32QuickActions
              tournamentId={tournamentId}
              onRefresh={fetchTournamentData}
              totalMatches={tournamentStats.totalMatches}
              completedMatches={tournamentStats.completedMatches}
              pendingMatches={tournamentStats.pendingMatches}
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Advanced Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" disabled>
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule Matches (Coming Soon)
                </Button>
                
                <Button variant="outline" className="w-full" disabled>
                  <Users className="w-4 h-4 mr-2" />
                  Player Management (Coming Soon)
                </Button>
                
                <Button variant="outline" className="w-full" disabled>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Export Results (Coming Soon)
                </Button>
                
                <Button variant="outline" className="w-full" disabled>
                  <Zap className="w-4 h-4 mr-2" />
                  Live Stream Mode (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
