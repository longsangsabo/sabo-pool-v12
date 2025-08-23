import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Users, Target, Crown } from 'lucide-react';
import { SABO32Match } from './SABO32Structure';
import { SABOMatchCard } from './components/SABOMatchCard';

interface SABO32ViewerProps {
  tournamentId: string;
  matches: SABO32Match[];
  onScoreSubmit: (matchId: string, scores: { player1: number; player2: number }) => Promise<void>;
  isSubmitting?: boolean;
}

export const SABO32DoubleEliminationViewer: React.FC<SABO32ViewerProps> = ({
  tournamentId,
  matches,
  onScoreSubmit,
  isSubmitting = false
}) => {
  
  // Organize matches by groups and brackets
  const organizeMatches = () => {
    const groupA = matches.filter(m => m.group_id === 'A');
    const groupB = matches.filter(m => m.group_id === 'B');
    const crossBracket = matches.filter(m => m.group_id === null);
    
    return {
      groupA: {
        winners: groupA.filter(m => m.bracket_type === 'GROUP_A_WINNERS'),
        losersA: groupA.filter(m => m.bracket_type === 'GROUP_A_LOSERS_A'),
        losersB: groupA.filter(m => m.bracket_type === 'GROUP_A_LOSERS_B'),
        final: groupA.filter(m => m.bracket_type === 'GROUP_A_FINAL')
      },
      groupB: {
        winners: groupB.filter(m => m.bracket_type === 'GROUP_B_WINNERS'),
        losersA: groupB.filter(m => m.bracket_type === 'GROUP_B_LOSERS_A'),
        losersB: groupB.filter(m => m.bracket_type === 'GROUP_B_LOSERS_B'),
        final: groupB.filter(m => m.bracket_type === 'GROUP_B_FINAL')
      },
      crossBracket: {
        semifinals: crossBracket.filter(m => m.bracket_type === 'CROSS_SEMIFINALS'),
        final: crossBracket.filter(m => m.bracket_type === 'CROSS_FINAL')
      }
    };
  };

  const organized = organizeMatches();
  
  // Calculate progress for each group
  const getGroupProgress = (groupMatches: any) => {
    const allMatches = [
      ...groupMatches.winners,
      ...groupMatches.losersA, 
      ...groupMatches.losersB,
      ...groupMatches.final
    ];
    const completed = allMatches.filter(m => m.status === 'completed').length;
    return Math.round((completed / allMatches.length) * 100);
  };

  const groupAProgress = getGroupProgress(organized.groupA);
  const groupBProgress = getGroupProgress(organized.groupB);
  
  // Check if groups are completed (both finals completed)
  const isGroupACompleted = organized.groupA.final.every(match => match.status === 'completed');
  const isGroupBCompleted = organized.groupB.final.every(match => match.status === 'completed');
  const canStartCrossBracket = isGroupACompleted && isGroupBCompleted;

  return (
    <div className="sabo32-tournament-container space-y-6">
      
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-600" />
            SABO Double Elimination Tournament (32 Players)
            <Badge variant="outline" className="ml-auto">
              <Users className="h-3 w-3 mr-1" />
              2 Groups × 16 Players
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Group A Status */}
            <div className="flex items-center gap-3 p-3 bg-blue-100 rounded-lg">
              <div className="flex-shrink-0">
                <Crown className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-blue-800">Group A</div>
                <div className="text-sm text-blue-600">{groupAProgress}% Complete</div>
                {isGroupACompleted && (
                  <Badge className="mt-1 bg-green-100 text-green-800">✅ Qualified</Badge>
                )}
              </div>
            </div>
            
            {/* Group B Status */}
            <div className="flex items-center gap-3 p-3 bg-purple-100 rounded-lg">
              <div className="flex-shrink-0">
                <Crown className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-purple-800">Group B</div>
                <div className="text-sm text-purple-600">{groupBProgress}% Complete</div>
                {isGroupBCompleted && (
                  <Badge className="mt-1 bg-green-100 text-green-800">✅ Qualified</Badge>
                )}
              </div>
            </div>
            
            {/* Cross-Bracket Status */}
            <div className="flex items-center gap-3 p-3 bg-yellow-100 rounded-lg">
              <div className="flex-shrink-0">
                <Target className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="font-semibold text-yellow-800">Cross-Bracket</div>
                <div className="text-sm text-yellow-600">
                  {canStartCrossBracket ? 'Ready' : 'Waiting for groups'}
                </div>
                {canStartCrossBracket && (
                  <Badge className="mt-1 bg-yellow-200 text-yellow-800">🎯 Active</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tournament Tabs */}
      <Tabs defaultValue="groupA" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="groupA" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Group A ({groupAProgress}%)
          </TabsTrigger>
          <TabsTrigger value="groupB" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Group B ({groupBProgress}%)
          </TabsTrigger>
          <TabsTrigger 
            value="crossBracket" 
            disabled={!canStartCrossBracket}
            className="flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            Cross-Bracket Finals
          </TabsTrigger>
        </TabsList>

        {/* Group A Tab */}
        <TabsContent value="groupA">
          <GroupBracketViewer
            groupId="A"
            groupData={organized.groupA}
            onScoreSubmit={onScoreSubmit}
            isSubmitting={isSubmitting}
            progress={groupAProgress}
          />
        </TabsContent>

        {/* Group B Tab */}
        <TabsContent value="groupB">
          <GroupBracketViewer
            groupId="B"
            groupData={organized.groupB}
            onScoreSubmit={onScoreSubmit}
            isSubmitting={isSubmitting}
            progress={groupBProgress}
          />
        </TabsContent>

        {/* Cross-Bracket Tab */}
        <TabsContent value="crossBracket">
          <CrossBracketViewer
            crossBracketData={organized.crossBracket}
            onScoreSubmit={onScoreSubmit}
            isSubmitting={isSubmitting}
            canStart={canStartCrossBracket}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Component for individual group bracket
interface GroupBracketViewerProps {
  groupId: 'A' | 'B';
  groupData: {
    winners: SABO32Match[];
    losersA: SABO32Match[];
    losersB: SABO32Match[];
    final: SABO32Match[];
  };
  onScoreSubmit: (matchId: string, scores: { player1: number; player2: number }) => Promise<void>;
  isSubmitting: boolean;
  progress: number;
}

const GroupBracketViewer: React.FC<GroupBracketViewerProps> = ({
  groupId,
  groupData,
  onScoreSubmit,
  isSubmitting,
  progress
}) => {
  
  const organizeByRounds = (matches: SABO32Match[]) => {
    const rounds: { [key: number]: SABO32Match[] } = {};
    matches.forEach(match => {
      if (!rounds[match.round_number]) {
        rounds[match.round_number] = [];
      }
      rounds[match.round_number].push(match);
    });
    return rounds;
  };

  const winnersRounds = organizeByRounds(groupData.winners);
  const losersARounds = organizeByRounds(groupData.losersA);
  const losersBRounds = organizeByRounds(groupData.losersB);

  return (
    <div className="space-y-6">
      
      {/* Group Header */}
      <Card className={`${groupId === 'A' ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Crown className={`h-5 w-5 ${groupId === 'A' ? 'text-blue-600' : 'text-purple-600'}`} />
              Group {groupId} - Double Elimination (16 Players)
            </span>
            <Badge variant="outline">{progress}% Complete</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Winners Bracket */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-700">🏆 Winners Bracket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(winnersRounds).map(([round, matches]) => (
              <div key={round}>
                <h4 className="font-semibold mb-2 text-green-700">
                  Round {round} ({matches.length} matches)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {matches.map(match => (
                    <SABOMatchCard
                      key={match.id}
                      match={match}
                      onScoreSubmit={onScoreSubmit}
                      isSubmitting={isSubmitting}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Losers Brackets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Losers Branch A */}
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-700">💔 Losers Branch A</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(losersARounds).map(([round, matches]) => (
                <div key={round}>
                  <h4 className="font-semibold mb-2 text-orange-700">
                    Round {round} ({matches.length} matches)
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {matches.map(match => (
                      <SABOMatchCard
                        key={match.id}
                        match={match}
                        onScoreSubmit={onScoreSubmit}
                        isSubmitting={isSubmitting}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Losers Branch B */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">💔 Losers Branch B</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(losersBRounds).map(([round, matches]) => (
                <div key={round}>
                  <h4 className="font-semibold mb-2 text-red-700">
                    Round {round} ({matches.length} matches)
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {matches.map(match => (
                      <SABOMatchCard
                        key={match.id}
                        match={match}
                        onScoreSubmit={onScoreSubmit}
                        isSubmitting={isSubmitting}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Group Finals */}
      {groupData.final.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-700">🥇 Group {groupId} Finals</CardTitle>
            <p className="text-sm text-yellow-600">
              Both winners qualify for Cross-Bracket Finals (4 qualifiers total)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupData.final.map((match, index) => (
                <div key={match.id} className="max-w-md mx-auto">
                  <h4 className="text-sm font-medium text-yellow-700 mb-2 text-center">
                    Final {index + 1}
                  </h4>
                  <SABOMatchCard
                    match={match}
                    onScoreSubmit={onScoreSubmit}
                    isSubmitting={isSubmitting}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Component for cross-bracket finals
interface CrossBracketViewerProps {
  crossBracketData: {
    semifinals: SABO32Match[];
    final: SABO32Match[];
  };
  onScoreSubmit: (matchId: string, scores: { player1: number; player2: number }) => Promise<void>;
  isSubmitting: boolean;
  canStart: boolean;
}

const CrossBracketViewer: React.FC<CrossBracketViewerProps> = ({
  crossBracketData,
  onScoreSubmit,
  isSubmitting,
  canStart
}) => {
  
  if (!canStart) {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Cross-Bracket Finals Not Available
          </h3>
          <p className="text-gray-500">
            Complete both Group A and Group B Finals (4 matches total) to unlock cross-bracket finals
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Cross-Bracket Header */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-yellow-600" />
            Cross-Bracket Finals
          </CardTitle>
          <p className="text-sm text-yellow-700">
            Winners and runners-up from both groups compete for the championship
          </p>
        </CardHeader>
      </Card>

      {/* Semifinals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-700">🎯 Semifinals</CardTitle>
          <p className="text-sm text-blue-600">
            Cross-bracket elimination: Winner A vs Runner-up B, Winner B vs Runner-up A
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {crossBracketData.semifinals.map(match => (
              <SABOMatchCard
                key={match.id}
                match={match}
                onScoreSubmit={onScoreSubmit}
                isSubmitting={isSubmitting}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Final */}
      {crossBracketData.final.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300">
          <CardHeader>
            <CardTitle className="text-center text-yellow-800">
              🏆 CHAMPIONSHIP FINAL
            </CardTitle>
            <p className="text-center text-yellow-700">
              The ultimate showdown for the SABO-32 championship
            </p>
          </CardHeader>
          <CardContent>
            <div className="max-w-lg mx-auto">
              <SABOMatchCard
                match={crossBracketData.final[0]}
                onScoreSubmit={onScoreSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SABO32DoubleEliminationViewer;
