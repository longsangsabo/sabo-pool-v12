// =============================================
// SABO-32 BRACKET VIEWER COMPONENT
// Display double elimination bracket for 32 players
// =============================================

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Clock } from 'lucide-react';

interface SABO32Match {
  id: string;
  tournament_id: string;
  group_id: 'A' | 'B' | null;
  bracket_type: string;
  round_number: number;
  match_number: number;
  sabo_match_id: string;
  player1_id?: string;
  player2_id?: string;
  winner_id?: string;
  score_player1: number;
  score_player2: number;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'bye';
  created_at: string;
  updated_at: string;
  // Player profile data
  player1_profile?: {
    full_name?: string;
    display_name?: string;
    avatar_url?: string;
  };
  player2_profile?: {
    full_name?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface SABO32BracketViewerProps {
  tournamentId: string;
}

export const SABO32BracketViewer: React.FC<SABO32BracketViewerProps> = ({ tournamentId }) => {
  const [matches, setMatches] = useState<SABO32Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, [tournamentId]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const { data: matchesData, error } = await (supabase as any)
        .from('sabo32_matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round_number', { ascending: true })
        .order('match_number', { ascending: true });

      if (error) throw error;

      const matches = matchesData || [];

      // Fetch player profiles for all unique player IDs
      const playerIds = new Set<string>();
      matches.forEach((match: SABO32Match) => {
        if (match.player1_id) playerIds.add(match.player1_id);
        if (match.player2_id) playerIds.add(match.player2_id);
      });

      let playerProfiles: any = {};
      if (playerIds.size > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, display_name, avatar_url')
          .in('user_id', Array.from(playerIds));

        if (!profilesError && profilesData) {
          profilesData.forEach((profile: any) => {
            playerProfiles[profile.user_id] = profile;
          });
        }
      }

      // Merge player profiles with matches
      const matchesWithProfiles = matches.map((match: SABO32Match) => ({
        ...match,
        player1_profile: match.player1_id ? playerProfiles[match.player1_id] : null,
        player2_profile: match.player2_id ? playerProfiles[match.player2_id] : null,
      }));

      setMatches(matchesWithProfiles);
    } catch (err) {
      console.error('Error fetching SABO-32 matches:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getMatchesByGroup = (groupId: 'A' | 'B' | null) => {
    return matches.filter(match => match.group_id === groupId);
  };

  const getMatchesByBracketType = (matches: SABO32Match[], bracketType: string) => {
    return matches.filter(match => match.bracket_type === bracketType);
  };

  const renderMatchCard = (match: SABO32Match) => (
    <Card key={match.id} className="mb-2 border-l-4 border-l-blue-500">
      <CardContent className="p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {match.sabo_match_id}
            </Badge>
            <Badge variant={match.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
              {match.status}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            R{match.round_number} M{match.match_number}
          </div>
        </div>
        
        <div className="mt-2 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm">
              {match.player1_profile 
                ? (match.player1_profile.display_name || match.player1_profile.full_name || 'Unknown Player')
                : match.player1_id 
                  ? `Player ${match.player1_id.slice(-4)}`
                  : 'TBD'
              }
            </span>
            <span className="font-mono text-sm">{match.score_player1}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">
              {match.player2_profile 
                ? (match.player2_profile.display_name || match.player2_profile.full_name || 'Unknown Player')
                : match.player2_id 
                  ? `Player ${match.player2_id.slice(-4)}`
                  : 'TBD'
              }
            </span>
            <span className="font-mono text-sm">{match.score_player2}</span>
          </div>
        </div>

        {match.winner_id && (
          <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
            <Trophy className="w-3 h-3" />
            Winner: {
              match.winner_id === match.player1_id 
                ? (match.player1_profile?.display_name || match.player1_profile?.full_name || `Player ${match.winner_id.slice(-4)}`)
                : match.winner_id === match.player2_id
                  ? (match.player2_profile?.display_name || match.player2_profile?.full_name || `Player ${match.winner_id.slice(-4)}`)
                  : `Player ${match.winner_id.slice(-4)}`
            }
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderGroupBracket = (groupId: 'A' | 'B') => {
    const groupMatches = getMatchesByGroup(groupId);
    const winnersMatches = getMatchesByBracketType(groupMatches, `group_${groupId.toLowerCase()}_winners`);
    const losersAMatches = getMatchesByBracketType(groupMatches, `group_${groupId.toLowerCase()}_losers_a`);
    const losersBMatches = getMatchesByBracketType(groupMatches, `group_${groupId.toLowerCase()}_losers_b`);
    const finalMatches = getMatchesByBracketType(groupMatches, `group_${groupId.toLowerCase()}_final`);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Winners Bracket */}
          <div>
            <h4 className="font-semibold mb-2 text-green-600">🏆 Winners Bracket</h4>
            {winnersMatches.map(renderMatchCard)}
          </div>

          {/* Losers Bracket A */}
          <div>
            <h4 className="font-semibold mb-2 text-orange-600">⬇️ Losers A</h4>
            {losersAMatches.map(renderMatchCard)}
          </div>

          {/* Losers Bracket B */}
          <div>
            <h4 className="font-semibold mb-2 text-red-600">⬇️ Losers B</h4>
            {losersBMatches.map(renderMatchCard)}
          </div>

          {/* Group Final */}
          <div>
            <h4 className="font-semibold mb-2 text-purple-600">👑 Group Final</h4>
            {finalMatches.map(renderMatchCard)}
          </div>
        </div>
      </div>
    );
  };

  const renderCrossBracket = () => {
    const crossMatches = getMatchesByGroup(null);
    const semifinals = getMatchesByBracketType(crossMatches, 'cross_semifinals');
    const finals = getMatchesByBracketType(crossMatches, 'cross_final');

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2 text-blue-600">🥊 Semifinals</h4>
            {semifinals.map(renderMatchCard)}
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-yellow-600">🏆 Finals</h4>
            {finals.map(renderMatchCard)}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            Loading SABO-32 bracket...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600">Error loading bracket: {error}</div>
        </CardContent>
      </Card>
    );
  }

  const groupAMatches = getMatchesByGroup('A');
  const groupBMatches = getMatchesByGroup('B');
  const crossMatches = getMatchesByGroup(null);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            SABO-32 Double Elimination Bracket
          </CardTitle>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Total matches: {matches.length}
            </div>
            <div>Group A: {groupAMatches.length}</div>
            <div>Group B: {groupBMatches.length}</div>
            <div>Cross-bracket: {crossMatches.length}</div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="groupA" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="groupA">Group A ({groupAMatches.length})</TabsTrigger>
          <TabsTrigger value="groupB">Group B ({groupBMatches.length})</TabsTrigger>
          <TabsTrigger value="crossBracket">Cross-Bracket ({crossMatches.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="groupA" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Group A - Double Elimination</CardTitle>
            </CardHeader>
            <CardContent>
              {renderGroupBracket('A')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groupB" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Group B - Double Elimination</CardTitle>
            </CardHeader>
            <CardContent>
              {renderGroupBracket('B')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crossBracket" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cross-Bracket Finals</CardTitle>
              <p className="text-sm text-muted-foreground">
                Winner A vs Runner-up B | Winner B vs Runner-up A | Finals
              </p>
            </CardHeader>
            <CardContent>
              {renderCrossBracket()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SABO32BracketViewer;
