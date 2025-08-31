/**
 * Enhanced Tournament Bracket Generator - Phase 4
 * Mobile-first, theme-aware tournament bracket generation with gaming UX
 */

import { useState } from 'react';
import { Button } from '@sabo/shared-ui';
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
 Sparkles,
 Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface EnhancedTournamentBracketGeneratorProps {
 tournamentId: string;
 tournamentType: string;
 participantCount: number;
 onBracketGenerated: () => void;
 selectedPlayers?: Player[];
 enableManualBracketGeneration?: boolean;
 className?: string;
}

export function EnhancedTournamentBracketGenerator({
 tournamentId,
 tournamentType,
 participantCount,
 onBracketGenerated,
 selectedPlayers,
 enableManualBracketGeneration = false,
 className
}: EnhancedTournamentBracketGeneratorProps) {
 const [isGenerating, setIsGenerating] = useState(false);
 const [generatedBracket, setGeneratedBracket] = useState<BracketMatch[]>([]);
 const { toast } = useToast();

 const isDoubleElimination = tournamentType === 'double_elimination';
 const isSingleElimination = tournamentType === 'single_elimination';

 // Validation logic based on tournament type
 const getValidParticipantCounts = () => {
  if (isDoubleElimination) {
   return [16]; // SABO Double elimination only supports 16 players
  }
  return [4, 8, 16, 32]; // Single elimination supports multiple sizes
 };

 const validCounts = getValidParticipantCounts();
 const isValidCount = validCounts.includes(participantCount);

 const getTournamentConfig = () => {
  if (isDoubleElimination) {
   return {
    icon: <GitBranch className='h-5 w-5' />,
    title: 'SABO Double Elimination',
    subtitle: 'Professional tournament with Winners & Losers brackets',
    color: 'from-blue-500 to-purple-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    textColor: 'text-blue-700 dark:text-blue-300',
    badgeVariant: 'default' as const,
    requirements: [
     'Exactly 16 participants required',
     "Winner's Bracket + Loser's Bracket system", 
     'Players get second chance after first loss',
     'Professional SABO tournament format',
    ],
   };
  }

  return {
   icon: <Target className='h-5 w-5' />,
   title: 'Single Elimination',
   subtitle: 'Classic tournament format with immediate elimination',
   color: 'from-green-500 to-teal-600',
   bgColor: 'bg-green-50 dark:bg-green-950/20',
   textColor: 'text-green-700 dark:text-green-300',
   badgeVariant: 'secondary' as const,
   requirements: [
    'Supports 4, 8, 16, or 32 participants',
    'Winners advance to next round',
    'Losers are eliminated immediately',
    'Fast-paced competition format',
   ],
  };
 };

 const config = getTournamentConfig();

 const getStatusInfo = () => {
  if (participantCount === 0) {
   return {
    color: 'bg-muted-foreground',
    text: 'No participants',
    variant: 'outline' as const,
    canGenerate: false
   };
  }
  
  if (participantCount < 4) {
   return {
    color: 'bg-orange-500',
    text: 'Need more players',
    variant: 'destructive' as const,
    canGenerate: false
   };
  }
  
  if (!isValidCount) {
   return {
    color: 'bg-red-500',
    text: 'Invalid participant count',
    variant: 'destructive' as const,
    canGenerate: false
   };
  }
  
  return {
   color: 'bg-green-500',
   text: 'Ready to generate',
   variant: 'default' as const,
   canGenerate: true
  };
 };

 const statusInfo = getStatusInfo();

 const getProgressPercentage = () => {
  if (isDoubleElimination) {
   return Math.min((participantCount / 16) * 100, 100);
  }
  const nextValidCount = validCounts.find(count => count >= participantCount) || 32;
  return Math.min((participantCount / nextValidCount) * 100, 100);
 };

 const handleGenerateBracket = async (generationType: 'random' | 'elo_based') => {
  if (!statusInfo.canGenerate) {
   const expectedCounts = validCounts.join(', ');
   toast({
    title: 'Invalid Participant Count',
    description: `${isDoubleElimination ? 'SABO Double' : 'Single'} elimination requires exactly ${expectedCounts} participants. Current: ${participantCount}`,
    variant: 'destructive',
   });
   return;
  }

  setIsGenerating(true);

  try {
   let data, error;

   if (isDoubleElimination) {
    // SABO Double Elimination logic
    const { data: registrations, error: regError } = await supabase
     .from('tournament_registrations')
     .select('user_id')
     .eq('tournament_id', tournamentId)
     .eq('payment_status', 'paid')
     .limit(16);

    if (regError || !registrations || registrations.length !== 16) {
     toast({
      title: 'SABO Tournament Error',
      description: `SABO requires exactly 16 paid participants. Found: ${registrations?.length || 0}`,
      variant: 'destructive',
     });
     return;
    }

    const playerIds = registrations.map(r => r.user_id);
    const result = await supabase.rpc('initialize_sabo_tournament', {
     p_tournament_id: tournamentId,
     p_player_ids: playerIds,
    });
    data = result.data;
    error = result.error;
   } else {
    // Single Elimination logic
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
    const bracketType = isDoubleElimination ? 'SABO Double' : 'Single';
    const method = generationType === 'elo_based' ? 'ELO-based seeding' : 'random seeding';
    
    toast({
     title: '🎯 Bracket Generated!',
     description: `${bracketType} elimination bracket created with ${participantCount} players using ${method}.`,
    });
    
    onBracketGenerated();
   }
  } catch (error) {
   console.error('Error generating bracket:', error);
   toast({
    title: 'Generation Error',
    description: 'Failed to generate tournament bracket. Please try again.',
    variant: 'destructive',
   });
  } finally {
   setIsGenerating(false);
  }
 };

 return (
  <Card className={cn("w-full", className)}>
   <CardHeader className="pb-4">
    <div className="flex items-start justify-between gap-4">
     <div className="space-y-2 flex-1 min-w-0">
      <CardTitle className="flex items-center gap-3 text-lg">
       <div className={cn(
        "p-2 rounded-lg flex-shrink-0",
        config.bgColor
       )}>
        <div className={config.textColor}>
         {config.icon}
        </div>
       </div>
       <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
         <span className="text-foreground">{config.title}</span>
         {isDoubleElimination && (
          <Badge variant="default" className="text-xs">
           <Crown className="h-3 w-3 mr-1" />
           Pro
          </Badge>
         )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
         {config.subtitle}
        </p>
       </div>
      </CardTitle>
     </div>
     
     <Badge 
      variant={statusInfo.variant}
      className="flex items-center gap-1 flex-shrink-0"
     >
      <div className={cn("w-2 h-2 rounded-full", statusInfo.color)} />
      {statusInfo.text}
     </Badge>
    </div>
   </CardHeader>

   <CardContent className="space-y-6">
    {/* Participant Progress */}
    <div className="space-y-3">
     <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
       <Users className="h-4 w-4" />
       <span>Participants</span>
      </div>
      <span className="font-medium text-foreground">
       {participantCount} / {isDoubleElimination ? '16' : `${validCounts.join(', ')}`}
      </span>
     </div>
     
     <Progress 
      value={getProgressPercentage()} 
      className="h-2"
     />
     
     {!statusInfo.canGenerate && participantCount > 0 && (
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
     <h4 className="font-medium flex items-center gap-2 text-foreground">
      <Settings className="h-4 w-4" />
      Tournament Requirements
     </h4>
     <div className="grid gap-2">
      {config.requirements.map((req, index) => (
       <div key={index} className="flex items-start gap-2 text-sm">
        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
        <span className="text-muted-foreground">{req}</span>
       </div>
      ))}
     </div>
    </div>

    <Separator />

    {/* Generation Actions - Mobile optimized */}
    <div className="space-y-4">
     <h4 className="font-medium flex items-center gap-2 text-foreground">
      <Play className="h-4 w-4" />
      Generate Bracket
     </h4>
     
     <div className="grid gap-3">
      {/* ELO-based Generation */}
      <Button
       onClick={() => handleGenerateBracket('elo_based')}
       disabled={isGenerating || !statusInfo.canGenerate}
       className="w-full h-12 gap-2 justify-start"
       variant="default"
      >
       {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
       ) : (
        <TrendingUp className="h-4 w-4" />
       )}
       <div className="flex-1 text-left">
        <div className="font-medium">ELO-Based Seeding</div>
        <div className="text-xs opacity-80">Professional seeding by skill level</div>
       </div>
       <Sparkles className="h-4 w-4 opacity-60" />
      </Button>

      {/* Random Generation */} 
      <Button
       onClick={() => handleGenerateBracket('random')}
       disabled={isGenerating || !statusInfo.canGenerate}
       className="w-full h-12 gap-2 justify-start"
       variant="outline"
      >
       {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
       ) : (
        <Shuffle className="h-4 w-4" />
       )}
       <div className="flex-1 text-left">
        <div className="font-medium">Random Seeding</div>
        <div className="text-xs opacity-60">Completely randomized brackets</div>
       </div>
       <Zap className="h-4 w-4 opacity-60" />
      </Button>
     </div>

     {/* Generation Status */}
     {isGenerating && (
      <div className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg">
       <Loader2 className="h-5 w-5 animate-spin text-primary" />
       <span className="text-sm text-muted-foreground">
        Generating {isDoubleElimination ? 'SABO Double' : 'Single'} elimination bracket...
       </span>
      </div>
     )}
    </div>
   </CardContent>
  </Card>
 );
}

export default EnhancedTournamentBracketGenerator;
