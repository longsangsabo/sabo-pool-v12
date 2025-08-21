// =============================================
// SABO-32 BRACKET VIEWER COMPONENT
// Display double elimination bracket for 32 players
// =============================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Clock, RefreshCw } from 'lucide-react';
import { SABO32MatchCard } from '../tournaments/SABO32MatchCard';

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
  
  // Scroll position preservation (like SABODoubleEliminationViewer)
  const scrollPositionRef = useRef<number>(0);

  useEffect(() => {
    fetchMatches();
  }, [tournamentId]);

  // Custom refresh function that preserves scroll position
  const refreshWithScrollPreservation = useCallback(() => {
    // Save current scroll position
    scrollPositionRef.current = window.scrollY;
    fetchMatches();

    // Restore scroll position after refresh
    setTimeout(() => {
      window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' });
    }, 100);
  }, []);

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
    <SABO32MatchCard
      key={match.id}
      match={{
        ...match,
        player1_profile: match.player1_profile ? {
          id: match.player1_id || '',
          full_name: match.player1_profile.full_name || '',
          display_name: match.player1_profile.display_name || ''
        } : undefined,
        player2_profile: match.player2_profile ? {
          id: match.player2_id || '',
          full_name: match.player2_profile.full_name || '',
          display_name: match.player2_profile.display_name || ''
        } : undefined
      }}
      tournamentId={tournamentId}
      onUpdate={refreshWithScrollPreservation}
    />
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
            <h4 className="font-semibold mb-3 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-200 dark:border-green-700">🏆 Winners Bracket</h4>
            <div className="space-y-2">
              {winnersMatches.map(renderMatchCard)}
            </div>
          </div>

          {/* Losers Bracket A */}
          <div>
            <h4 className="font-semibold mb-3 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg border border-orange-200 dark:border-orange-700">⬇️ Losers A</h4>
            <div className="space-y-2">
              {losersAMatches.map(renderMatchCard)}
            </div>
          </div>

          {/* Losers Bracket B */}
          <div>
            <h4 className="font-semibold mb-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-200 dark:border-red-700">⬇️ Losers B</h4>
            <div className="space-y-2">
              {losersBMatches.map(renderMatchCard)}
            </div>
          </div>

          {/* Group Final */}
          <div>
            <h4 className="font-semibold mb-3 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg border border-purple-200 dark:border-purple-700">👑 Group Final</h4>
            <div className="space-y-2">
              {finalMatches.map(renderMatchCard)}
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">🥊 Semifinals</h4>
            <div className="space-y-2">
              {semifinals.map(renderMatchCard)}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">🏆 Finals</h4>
            <div className="space-y-2">
              {finals.map(renderMatchCard)}
            </div>
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              SABO-32 Double Elimination Bracket
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshWithScrollPreservation}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
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
          <Card className="border-green-200 dark:border-green-700">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardTitle className="text-lg text-green-800 dark:text-green-200">Group A - Double Elimination</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {renderGroupBracket('A')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groupB" className="space-y-4">
          <Card className="border-blue-200 dark:border-blue-700">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <CardTitle className="text-lg text-blue-800 dark:text-blue-200">Group B - Double Elimination</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {renderGroupBracket('B')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crossBracket" className="space-y-4">
          <Card className="border-purple-200 dark:border-purple-700">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardTitle className="text-lg text-purple-800 dark:text-purple-200">Cross-Bracket Finals</CardTitle>
              <p className="text-sm text-muted-foreground">
                Winner A vs Runner-up B | Winner B vs Runner-up A | Finals
              </p>
            </CardHeader>
            <CardContent className="p-6">
              {renderCrossBracket()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SABO32BracketViewer;
