import React from "react";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Play, RefreshCw, Zap } from 'lucide-react';
import { SABO32TournamentDashboard } from '@/components/tournaments/SABO32TournamentDashboard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SABO32DemoPage: React.FC = () => {
  const [tournamentId] = useState<string>('sabo-32-2024');
  const [isCreating, setIsCreating] = useState(false);
  const [tournamentExists, setTournamentExists] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  // Check if tournament exists
  const checkTournamentExists = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await (supabase as any)
        .from('sabo32_matches')
        .select('id')
        .eq('tournament_id', tournamentId)
        .limit(1);

      if (error) throw error;
      
      setTournamentExists(data && data.length > 0);
    } catch (error) {
      console.error('Error checking tournament:', error);
      setTournamentExists(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkTournamentExists();
  }, []);

  // Create demo tournament with 32 fake players
  const createDemoTournament = async () => {
    setIsCreating(true);
    
    try {
      console.log('🎯 Creating SABO-32 demo tournament...');
      
      // Generate demo player names
      const demoPlayerNames = [
        'Dragon Master', 'Pool Shark', 'Cue Champion', 'Eight Ball King', 'Break Master',
        'Pocket Pro', 'Chalk Handler', 'Rail Rider', 'Corner Wizard', 'Spin Doctor',
        'Power Breaker', 'Angle Artist', 'Shot Caller', 'Table Turner', 'Rack Attacker',
        'Bridge Builder', 'Bank Shooter', 'Safety Player', 'Run Out King', 'Pressure Player',
        'Combo Artist', 'Position Pro', 'Speed Demon', 'Steady Eddie', 'Clutch Player',
        'Mind Reader', 'Pattern Player', 'Stroke Master', 'Focus Fighter', 'Game Changer',
        'Tournament Tiger', 'Victory Seeker'
      ];

      console.log('📋 Calling create_sabo32_tournament function...', {
        tournament_id: tournamentId,
        player_names: demoPlayerNames
      });

      const { data, error } = await (supabase as any).rpc('create_sabo32_tournament', {
        tournament_id: tournamentId,
        player_names: demoPlayerNames
      });

      if (error) {
        console.error('❌ Tournament creation error:', error);
        throw error;
      }

      console.log('✅ Tournament created successfully:', data);
      toast.success('🎯 SABO-32 Tournament created with 32 players!');
      
      setTournamentExists(true);
      
    } catch (error: any) {
      console.error('❌ Error creating tournament:', error);
      toast.error(`Error: ${error.message || 'Failed to create tournament'}`);
    } finally {
      setIsCreating(false);
    }
  };

  if (isChecking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {!tournamentExists ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-500" />
                SABO-32 Tournament Demo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-4">
                <div className="text-muted-foreground">
                  Create a demo tournament with 32 players to test the SABO-32 double elimination system.
                </div>
                
                <div className="flex items-center justify-center gap-4">
                  <Badge variant="outline" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    32 Players
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    53 Matches
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Double Elimination
                  </Badge>
                </div>
                
                <Button 
                  onClick={createDemoTournament} 
                  disabled={isCreating}
                  size="lg"
                  className="w-full"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creating Tournament...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Create Demo Tournament
                    </>
                  )}
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  Tournament ID: <code className="bg-muted px-2 py-1 rounded">{tournamentId}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <SABO32TournamentDashboard />
      )}
    </div>
  );
};

export default SABO32DemoPage;
