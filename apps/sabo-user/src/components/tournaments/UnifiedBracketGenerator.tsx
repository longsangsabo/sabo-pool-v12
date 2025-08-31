
import { TournamentBracketGenerator } from './TournamentBracketGenerator';
import { SABOBracketGenerator } from './SABOBracketGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, GitBranch, Target, Crown } from 'lucide-react';

interface Player {
 id: string;
 full_name: string;
 display_name?: string;
 avatar_url?: string;
 elo: number;
 rank?: string;
 verified_rank?: string;
 current_rank?: string;
}

interface UnifiedBracketGeneratorProps {
 tournamentId: string;
 defaultTournamentType?: 'single_elimination' | 'double_elimination';
 participantCount: number;
 onBracketGenerated: () => void;
 selectedPlayers?: Player[];
 enableManualBracketGeneration?: boolean;
 enableTournamentTypeSwitch?: boolean;
 className?: string;
}

export function UnifiedBracketGenerator({
 tournamentId,
 defaultTournamentType = 'single_elimination',
 participantCount,
 onBracketGenerated,
 selectedPlayers,
 enableManualBracketGeneration = false,
 enableTournamentTypeSwitch = true,
 className = '',
}: UnifiedBracketGeneratorProps) {
 
 const getTournamentTypeInfo = (type: string) => {
  if (type === 'double_elimination') {
   return {
    icon: <GitBranch className="h-4 w-4" />,
    name: 'SABO Double Elimination',
    description: 'Professional 16-player tournament',
    color: 'bg-info-100 text-info-600',
    validCounts: [16],
   };
  }
  return {
   icon: <Target className="h-4 w-4" />,
   name: 'Single Elimination',
   description: 'Standard elimination tournament',
   color: 'bg-primary-100 text-primary-600',
   validCounts: [4, 8, 16, 32],
  };
 };

 if (!enableTournamentTypeSwitch) {
  // Direct component rendering without tabs
  if (defaultTournamentType === 'double_elimination') {
   return (
    <SABOBracketGenerator
     tournamentId={tournamentId}
     participantCount={participantCount}
     onBracketGenerated={onBracketGenerated}
     className={className}
    />
   );
  }

  return (
   <TournamentBracketGenerator
    tournamentId={tournamentId}
    tournamentType={defaultTournamentType}
    participantCount={participantCount}
    onBracketGenerated={onBracketGenerated}
    selectedPlayers={selectedPlayers}
    enableManualBracketGeneration={enableManualBracketGeneration}
   />
  );
 }

 return (
  <Card className={`w-full ${className}`}>
   <CardHeader className="pb-4">
    <div className="flex items-start justify-between">
     <div className="space-y-1">
      <CardTitle className="flex items-center gap-3 text-title">
       <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 text-primary-600">
        <Trophy className="h-5 w-5" />
       </div>
       Tournament Bracket Generator
      </CardTitle>
      <p className="text-body-small text-muted-foreground">
       Choose your tournament format and generate professional brackets
      </p>
     </div>
     <Badge variant="outline" className="flex items-center gap-1">
      <Crown className="h-3 w-3" />
      Pro System
     </Badge>
    </div>
   </CardHeader>

   <CardContent>
    <Tabs defaultValue={defaultTournamentType} className="w-full">
     <TabsList className="grid w-full grid-cols-2 mb-6">
      <TabsTrigger value="single_elimination" className="flex items-center gap-2">
       <Target className="h-4 w-4" />
       Single Elimination
       <Badge variant="secondary" className="ml-1 text-caption">
        Standard
       </Badge>
      </TabsTrigger>
      <TabsTrigger value="double_elimination" className="flex items-center gap-2">
       <GitBranch className="h-4 w-4" />
       SABO Double
       <Badge variant="secondary" className="ml-1 text-caption">
        Pro
       </Badge>
      </TabsTrigger>
     </TabsList>

     <TabsContent value="single_elimination" className="mt-0">
      <TournamentBracketGenerator
       tournamentId={tournamentId}
       tournamentType="single_elimination"
       participantCount={participantCount}
       onBracketGenerated={onBracketGenerated}
       selectedPlayers={selectedPlayers}
       enableManualBracketGeneration={enableManualBracketGeneration}
      />
     </TabsContent>

     <TabsContent value="double_elimination" className="mt-0">
      <SABOBracketGenerator
       tournamentId={tournamentId}
       participantCount={participantCount}
       onBracketGenerated={onBracketGenerated}
      />
     </TabsContent>
    </Tabs>
   </CardContent>
  </Card>
 );
}
