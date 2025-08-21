import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trophy, Users, Play, RefreshCw } from 'lucide-react';
import { SABO32DoubleEliminationViewer } from '@/tournaments/sabo/SABO32DoubleEliminationViewer';
import { useSABO32Tournament } from '@/tournaments/sabo/hooks/useSABO32Tournament';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SABO32DemoPage: React.FC = () => {
  const [tournamentId, setTournamentId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Use SABO-32 hook
  const {
    matches,
    isLoading,
    error,
    refetch,
    submitScore,
    isSubmitting,
  } = useSABO32Tournament(tournamentId);

  // Create demo tournament with 32 fake players
  const createDemoTournament = async () => {
    setIsCreating(true);
    
    try {
      console.log('🎯 Creating SABO-32 demo tournament...');
      
      // Generate 32 fake player IDs (in real app, these would be real user IDs)
      const fakePlayerIds = Array.from({ length: 32 }, (_, i) => 
        `player-${String(i + 1).padStart(2, '0')}-${Math.random().toString(36).substr(2, 9)}`
      );
      
      // Create tournament record first
      const newTournamentId = crypto.randomUUID();
      const clubId = '18f49e79-f402-46d1-90be-889006e9761c'; // Default club ID
      
      console.log('📋 Calling create_sabo32_tournament function...', {
        tournamentId: newTournamentId,
        clubId,
        playersCount: fakePlayerIds.length
      });
      
      // Call the database function to create tournament structure
      const { data, error } = await supabase.rpc('create_sabo32_tournament', {
        p_tournament_id: newTournamentId,
        p_club_id: clubId,
        p_players: fakePlayerIds
      });
      
      if (error) {
        console.error('❌ Error creating SABO-32 tournament:', error);
        throw error;
      }
      
      console.log('✅ SABO-32 tournament created successfully:', data);
      
      // Update Round 1 matches with actual players for Group A
      await populateRound1Players(newTournamentId, 'A', fakePlayerIds.slice(0, 16));
      
      // Update Round 1 matches with actual players for Group B  
      await populateRound1Players(newTournamentId, 'B', fakePlayerIds.slice(16, 32));
      
      setTournamentId(newTournamentId);
      toast.success('🎉 SABO-32 demo tournament created successfully!');
      
    } catch (error: any) {
      console.error('❌ Failed to create tournament:', error);
      toast.error(`Failed to create tournament: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };
  
  // Populate Round 1 matches with actual players
  const populateRound1Players = async (tournamentId: string, groupId: 'A' | 'B', players: string[]) => {
    console.log(`🔄 Populating Group ${groupId} Round 1 with players...`);
    
    // Get Round 1 matches for this group
    const { data: round1Matches, error } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('group_id', groupId)
      .eq('round_number', 1)
      .order('match_number');
      
    if (error || !round1Matches) {
      console.error(`❌ Error fetching Round 1 matches for Group ${groupId}:`, error);
      return;
    }
    
    // Update each Round 1 match with player pairs
    for (let i = 0; i < round1Matches.length && i < 8; i++) {
      const match = round1Matches[i];
      const player1 = players[i * 2];
      const player2 = players[i * 2 + 1];
      
      await supabase
        .from('tournament_matches')
        .update({
          player1_id: player1,
          player2_id: player2,
          player1_name: `Player ${groupId}${(i * 2) + 1}`,
          player2_name: `Player ${groupId}${(i * 2) + 2}`,
          status: 'ready'
        })
        .eq('id', match.id);
    }
    
    console.log(`✅ Group ${groupId} Round 1 populated successfully`);
  };

  // Handle score submission
  const handleScoreSubmit = async (
    matchId: string, 
    scores: { player1: number; player2: number }
  ) => {
    try {
      await submitScore(matchId, scores);
    } catch (error) {
      console.error('❌ Score submission failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-600" />
            SABO-32 Tournament Demo
            <Badge variant="outline" className="ml-auto">
              <Users className="h-3 w-3 mr-1" />
              32 Players × 2 Groups
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            
            {/* Tournament ID Input */}
            <div className="flex-1">
              <Input
                placeholder="Tournament ID (or create new demo)"
                value={tournamentId}
                onChange={(e) => setTournamentId(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={createDemoTournament}
                disabled={isCreating}
                className="flex items-center gap-2"
              >
                {isCreating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isCreating ? 'Creating...' : 'Create Demo'}
              </Button>
              
              {tournamentId && (
                <Button 
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
            </div>
          </div>
          
          {/* Tournament Info */}
          {tournamentId && (
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Tournament ID:</strong> <code className="bg-blue-200 px-1 rounded">{tournamentId}</code>
              </div>
              <div className="text-sm text-blue-600 mt-1">
                Total Matches: <strong>{matches.length}</strong> | 
                Completed: <strong>{matches.filter(m => m.status === 'completed').length}</strong> | 
                Progress: <strong>{Math.round((matches.filter(m => m.status === 'completed').length / matches.length) * 100)}%</strong>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="text-red-800">
              <strong>Error:</strong> {error.message}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && tournamentId && (
        <Card>
          <CardContent className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading SABO-32 tournament data...</p>
          </CardContent>
        </Card>
      )}

      {/* Tournament Viewer */}
      {tournamentId && !isLoading && matches.length > 0 && (
        <SABO32DoubleEliminationViewer
          tournamentId={tournamentId}
          matches={matches}
          onScoreSubmit={handleScoreSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {/* No Data State */}
      {tournamentId && !isLoading && matches.length === 0 && !error && (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Tournament Data Found
            </h3>
            <p className="text-gray-500 mb-4">
              Tournament ID "{tournamentId}" does not exist or has no matches.
            </p>
            <Button onClick={createDemoTournament} disabled={isCreating}>
              Create New Demo Tournament
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!tournamentId && (
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-700">🎯 How to Use SABO-32 Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600">
              <strong>1. Create Demo Tournament:</strong> Click "Create Demo" to generate a new 32-player tournament with fake players
            </div>
            <div className="text-sm text-gray-600">
              <strong>2. View Groups:</strong> Use tabs to switch between Group A, Group B, and Cross-Bracket Finals
            </div>
            <div className="text-sm text-gray-600">
              <strong>3. Submit Scores:</strong> Click on matches to enter scores and see automatic advancement
            </div>
            <div className="text-sm text-gray-600">
              <strong>4. Track Progress:</strong> Watch the progress bars as each group completes
            </div>
            <div className="text-sm text-gray-600">
              <strong>5. Cross-Bracket:</strong> Once both groups finish, cross-bracket finals will unlock automatically
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SABO32DemoPage;
