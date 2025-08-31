import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
 Loader2,
 Trophy,
 Users,
 GitBranch,
 Target,
 Shuffle,
 TrendingUp,
 CheckCircle,
 AlertCircle,
 Zap,
 Settings,
 Play,
 Save,
} from 'lucide-react';

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

interface BracketMatch {
 round: number;
 match_number: number;
 player1: Player | null;
 player2: Player | null;
 winner?: Player | null;
}

interface TournamentBracketGeneratorProps {
 tournamentId: string;
 tournamentType: string;
 participantCount: number;
 onBracketGenerated: () => void;
 selectedPlayers?: Player[];
 enableManualBracketGeneration?: boolean;
}

export function TournamentBracketGenerator({
 tournamentId,
 tournamentType,
 participantCount,
 onBracketGenerated,
 selectedPlayers,
 enableManualBracketGeneration = false,
}: TournamentBracketGeneratorProps) {
 const [isGenerating, setIsGenerating] = useState(false);
 const [generatedBracket, setGeneratedBracket] = useState<BracketMatch[]>([]);
 const { toast } = useToast();

 const isDoubleElimination = tournamentType === 'double_elimination';
 const isSingleElimination = tournamentType === 'single_elimination';

 // Utility function to shuffle array (for random bracket generation)
 const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
   const j = Math.floor(Math.random() * (i + 1));
   [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
 };

 // Manual bracket generation for random seeding (from TournamentManagementHub)
 const generateRandomBracket = () => {
  if (!selectedPlayers || selectedPlayers.length < 2) {
   toast({
    title: 'Error',
    description: 'Cần ít nhất 2 người chơi để tạo bảng đấu',
    variant: 'destructive',
   });
   return;
  }

  try {
   const shuffledPlayers = shuffleArray(selectedPlayers);
   const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(shuffledPlayers.length)));
   
   while (shuffledPlayers.length < nextPowerOf2) {
    shuffledPlayers.push(null);
   }

   const matches: BracketMatch[] = [];
   for (let i = 0; i < shuffledPlayers.length; i += 2) {
    matches.push({
     round: 1,
     match_number: Math.floor(i / 2) + 1,
     player1: shuffledPlayers[i],
     player2: shuffledPlayers[i + 1]
    });
   }

   setGeneratedBracket(matches);
   toast({
    title: 'Success',
    description: 'Đã tạo bảng đấu ngẫu nhiên thành công!',
   });
  } catch (error) {
   console.error('Error generating bracket:', error);
   toast({
    title: 'Error',
    description: 'Lỗi khi tạo bảng đấu',
    variant: 'destructive',
   });
  }
 };

 // Manual bracket generation for seeded bracket (from TournamentManagementHub)
 const generateSeededBracket = () => {
  if (!selectedPlayers || selectedPlayers.length < 2) {
   toast({
    title: 'Error',
    description: 'Cần ít nhất 2 người chơi để tạo bảng đấu',
    variant: 'destructive',
   });
   return;
  }

  try {
   const sortedPlayers = [...selectedPlayers].sort((a, b) => b.elo - a.elo);
   const seededPlayers = [];
   const totalPlayers = Math.pow(2, Math.ceil(Math.log2(sortedPlayers.length)));
   
   for (let i = 0; i < totalPlayers / 2; i++) {
    seededPlayers.push(sortedPlayers[i] || null);
    seededPlayers.push(sortedPlayers[totalPlayers - 1 - i] || null);
   }

   const matches: BracketMatch[] = [];
   for (let i = 0; i < seededPlayers.length; i += 2) {
    matches.push({
     round: 1,
     match_number: Math.floor(i / 2) + 1,
     player1: seededPlayers[i],
     player2: seededPlayers[i + 1]
    });
   }

   setGeneratedBracket(matches);
   toast({
    title: 'Success',
    description: 'Đã tạo bảng đấu theo seeding thành công!',
   });
  } catch (error) {
   console.error('Error generating seeded bracket:', error);
   toast({
    title: 'Error',
    description: 'Lỗi khi tạo bảng đấu theo seeding',
    variant: 'destructive',
   });
  }
 };

 // Save manual bracket to tournament database
 const saveBracketToTournament = async () => {
  if (generatedBracket.length === 0) {
   toast({
    title: 'Error',
    description: 'Vui lòng tạo bảng đấu trước',
    variant: 'destructive',
   });
   return;
  }

  setIsGenerating(true);
  try {
   const matchesToInsert = generatedBracket.map((match) => ({
    tournament_id: tournamentId,
    round_number: match.round,
    match_number: match.match_number,
    player1_id: match.player1?.id || null,
    player2_id: match.player2?.id || null,
    status: 'pending',
   }));

   const { error } = await supabase
    .from('tournament_matches')
    .insert(matchesToInsert);

   if (error) throw error;

   toast({
    title: 'Success',
    description: 'Đã lưu bảng đấu thành công!',
   });
   
   onBracketGenerated();
   setGeneratedBracket([]);
  } catch (error) {
   console.error('Error saving bracket:', error);
   toast({
    title: 'Error',
    description: 'Lỗi khi lưu bảng đấu',
    variant: 'destructive',
   });
  } finally {
   setIsGenerating(false);
  }
 };

 // Validation logic based on tournament type
 const getValidParticipantCounts = () => {
  if (isDoubleElimination) {
   return [16]; // Double elimination only supports 16 players
  }
  return [4, 8, 16, 32]; // Single elimination supports multiple sizes
 };

 const validCounts = getValidParticipantCounts();
 const isValidCount = validCounts.includes(participantCount);

 const handleGenerateBracket = async (
  generationType: 'random' | 'elo_based'
 ) => {
  if (participantCount < 4 || !isValidCount) {
   const expectedCounts = validCounts.join(', ');
   toast({
    title: 'Invalid Participant Count',
    description: `${isDoubleElimination ? 'Double' : 'Single'} elimination requires exactly ${expectedCounts} participants. Current: ${participantCount}`,
    variant: 'destructive',
   });
   return;
  }

  setIsGenerating(true);

  try {
   let data, error;

   if (isDoubleElimination) {
    // Get confirmed participants for SABO initialization
    const { data: registrations, error: regError } = await supabase
     .from('tournament_registrations')
     .select('user_id')
     .eq('tournament_id', tournamentId)
     .eq('payment_status', 'paid')
     .limit(16);

    if (regError || !registrations || registrations.length !== 16) {
     toast({
      title: 'Error',
      description: `SABO Double Elimination requires exactly 16 paid participants. Found: ${registrations?.length || 0}`,
      variant: 'destructive',
     });
     return;
    }

    const playerIds = registrations.map(r => r.user_id);

    // Use SABO tournament initialization
    const result = await supabase.rpc('initialize_sabo_tournament', {
     p_tournament_id: tournamentId,
     p_player_ids: playerIds,
    });
    data = result.data;
    error = result.error;
   } else {
    // Call single elimination bracket creation function
    const result = await supabase.rpc(
     'generate_single_elimination_bracket' as any,
     {
      p_tournament_id: tournamentId,
      p_generation_type: generationType,
     }
    );
    data = result.data;
    error = result.error;
   }

   if (error) throw error;

   if (data?.error || (data && !data.success)) {
    toast({
     title: 'Bracket Generation Failed',
     description: data?.error || 'Failed to generate bracket',
     variant: 'destructive',
    });
   } else {
    const bracketType = isDoubleElimination
     ? 'Double Elimination'
     : 'Single Elimination';
    const generationMethod =
     generationType === 'elo_based' ? 'theo ELO' : 'ngẫu nhiên';
    toast({
     title: 'Bracket Generated!',
     description: `${bracketType} bracket created successfully with ${participantCount} players (${generationMethod}).`,
    });
    onBracketGenerated();
   }
  } catch (error) {
   console.error('Error generating bracket:', error);
   toast({
    title: 'Error',
    description: 'Failed to generate tournament bracket',
    variant: 'destructive',
   });
  } finally {
   setIsGenerating(false);
  }
 };

 const getTournamentIcon = () => {
  if (isDoubleElimination) {
   return <GitBranch className='h-5 w-5' />;
  }
  return <Target className='h-5 w-5' />;
 };

 const getTournamentDescription = () => {
  if (isDoubleElimination) {
   return {
    title: 'Generate Double Elimination Bracket',
    requirements: [
     'Exactly 16 participants required',
     "Winner's Bracket + Loser's Bracket system",
     'Players get second chance after first loss',
     'Complex bracket with multiple advancement paths',
    ],
   };
  }

  return {
   title: 'Generate Single Elimination Bracket',
   requirements: [
    'Exactly 4, 8, 16, or 32 participants',
    'Winners advance to next round',
    'Losers are eliminated immediately',
    'Real matches with real scores',
   ],
  };
 };

 const description = getTournamentDescription();

 const getStatusColor = () => {
  if (participantCount === 0) return 'bg-neutral-500';
  if (participantCount < 4) return 'bg-warning-500';
  if (!isValidCount) return 'bg-error-500';
  return 'bg-success-500';
 };

 const getStatusText = () => {
  if (participantCount === 0) return 'No participants';
  if (participantCount < 4) return 'Need more players';
  if (!isValidCount) return 'Invalid count';
  return 'Ready to generate';
 };

 const getProgressPercentage = () => {
  if (isDoubleElimination) {
   return Math.min((participantCount / 16) * 100, 100);
  }
  const nextValidCount = validCounts.find(count => count >= participantCount) || 32;
  return Math.min((participantCount / nextValidCount) * 100, 100);
 };

 return (
  <Card className="w-full">
   <CardHeader className="pb-4">
    <div className="flex items-start justify-between">
     <div className="space-y-1">
      <CardTitle className="flex items-center gap-3 text-title">
       <div className={`p-2 rounded-lg ${isDoubleElimination ? 'bg-info-100 text-info-600' : 'bg-primary-100 text-primary-600'}`}>
        {getTournamentIcon()}
       </div>
       {description.title}
      </CardTitle>
      <p className="text-body-small text-muted-foreground">
       {isDoubleElimination 
        ? 'Professional SABO tournament with complex bracket structure' 
        : 'Standard elimination tournament with immediate elimination'
       }
      </p>
     </div>
     <Badge 
      variant={isValidCount ? "default" : "destructive"}
      className="flex items-center gap-1"
     >
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      {getStatusText()}
     </Badge>
    </div>
   </CardHeader>

   <CardContent className="space-y-6">
    {/* Tournament Status & Progress */}
    <div className="space-y-3">
     <div className="flex items-center justify-between text-body-small">
      <div className="flex items-center gap-2 text-muted-foreground">
       <Users className="h-4 w-4" />
       <span>Participants</span>
      </div>
      <span className="font-medium">
       {participantCount} / {isDoubleElimination ? '16' : `${validCounts.join(', ')}`}
      </span>
     </div>
     
     <Progress 
      value={getProgressPercentage()} 
      className="h-2"
     />
     
     {!isValidCount && participantCount > 0 && (
      <Alert variant="destructive">
       <AlertCircle className="h-4 w-4" />
       <AlertDescription>
        {isDoubleElimination 
         ? `SABO requires exactly 16 participants. Current: ${participantCount}`
         : `Single elimination requires ${validCounts.join(', ')} participants. Current: ${participantCount}`
        }
       </AlertDescription>
      </Alert>
     )}
    </div>

    <Separator />

    {/* Tournament Requirements */}
    <div className="space-y-3">
     <h4 className="font-medium flex items-center gap-2">
      <Settings className="h-4 w-4" />
      Tournament Requirements
     </h4>
     <div className="grid gap-2">
      {description.requirements.map((req, index) => (
       <div key={index} className="flex items-start gap-2 text-body-small">
        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
        <span className="text-muted-foreground">{req}</span>
       </div>
      ))}
     </div>
    </div>

    <Separator />

    {/* Generation Controls */}
    <div className="form-spacing">
     <h4 className="font-medium flex items-center gap-2">
      <Play className="h-4 w-4" />
      Generate Tournament Bracket
     </h4>

     <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Button
       onClick={() => handleGenerateBracket('random')}
       disabled={isGenerating || participantCount < 4 || !isValidCount}
       variant="outline"
       className="h-12 flex-col gap-1"
      >
       <div className="flex items-center gap-2">
        {isGenerating ? (
         <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
         <Shuffle className="h-4 w-4" />
        )}
        <span className="font-medium">Random Seeding</span>
       </div>
       <span className="text-caption text-muted-foreground">Shuffle players randomly</span>
      </Button>

      <Button
       onClick={() => handleGenerateBracket('elo_based')}
       disabled={isGenerating || participantCount < 4 || !isValidCount}
       className="h-12 flex-col gap-1"
      >
       <div className="flex items-center gap-2">
        {isGenerating ? (
         <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
         <TrendingUp className="h-4 w-4" />
        )}
        <span className="font-medium">ELO-Based Seeding</span>
       </div>
       <span className="text-caption text-muted-foreground">Rank by skill level</span>
      </Button>
     </div>
    </div>

    {/* Manual Bracket Generation Section */}
    {enableManualBracketGeneration && selectedPlayers && (
     <>
      <Separator />
      <div className='space-y-4'>
       <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
         <Zap className="h-4 w-4" />
         Manual Bracket Generation
        </h4>
        <Badge variant="secondary" className="text-caption">
         {selectedPlayers.length} players selected
        </Badge>
       </div>
       
       <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
         Create custom brackets from your selected players. Perfect for quick tournaments or testing.
        </AlertDescription>
       </Alert>
      
       <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <Button
         onClick={generateRandomBracket}
         disabled={isGenerating || !selectedPlayers || selectedPlayers.length < 2}
         variant='outline'
         className='h-12 flex-col gap-1'
        >
         <div className="flex items-center gap-2">
          {isGenerating ? (
           <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
           <Shuffle className='h-4 w-4' />
          )}
          <span className="font-medium">Random Manual</span>
         </div>
         <span className="text-caption text-muted-foreground">Shuffle selected players</span>
        </Button>

        <Button
         onClick={generateSeededBracket}
         disabled={isGenerating || !selectedPlayers || selectedPlayers.length < 2}
         variant='outline'
         className='h-12 flex-col gap-1'
        >
         <div className="flex items-center gap-2">
          {isGenerating ? (
           <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
           <TrendingUp className='h-4 w-4' />
          )}
          <span className="font-medium">Seeded Manual</span>
         </div>
         <span className="text-caption text-muted-foreground">Order by ELO rating</span>
        </Button>
       </div>

       {generatedBracket.length > 0 && (
        <div className='space-y-4'>
         <div className="flex items-center justify-between">
          <h5 className="font-medium text-body-small">Generated Bracket Preview</h5>
          <Badge className="text-caption">
           {generatedBracket.length} matches
          </Badge>
         </div>
         
         <div className='max-h-40 overflow-y-auto space-y-2 p-3 bg-muted/30 rounded-lg border'>
          {generatedBracket.map((match, index) => (
           <div key={index} className='flex items-center justify-between p-2 bg-background rounded border text-sm'>
            <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-caption-medium">
              {match.match_number}
             </div>
             <span className="font-medium">Match {match.match_number}</span>
            </div>
            <div className="text-right text-caption text-muted-foreground">
             <div>{match.player1?.display_name || match.player1?.full_name || 'BYE'}</div>
             <div className="text-center my-1">vs</div>
             <div>{match.player2?.display_name || match.player2?.full_name || 'BYE'}</div>
            </div>
           </div>
          ))}
         </div>
         
         <Button
          onClick={saveBracketToTournament}
          disabled={isGenerating}
          className='w-full h-12 gap-2'
         >
          {isGenerating ? (
           <>
            <Loader2 className='h-4 w-4 animate-spin' />
            Saving to Tournament...
           </>
          ) : (
           <>
            <Save className='h-4 w-4' />
            Save Bracket to Tournament
           </>
          )}
         </Button>
        </div>
       )}
      </div>
     </>
    )}
   </CardContent>
  </Card>
 );
}
