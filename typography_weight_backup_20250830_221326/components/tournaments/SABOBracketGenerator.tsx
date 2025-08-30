import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useBracketGeneration } from '@/hooks/useBracketGeneration';
import {
  Loader2,
  GitBranch,
  Users,
  CheckCircle,
  AlertCircle,
  Settings,
  Play,
  Crown,
  Zap,
  RefreshCw,
} from 'lucide-react';

interface SABOBracketGeneratorProps {
  tournamentId: string;
  participantCount: number;
  onBracketGenerated: () => void;
  className?: string;
}

export function SABOBracketGenerator({
  tournamentId,
  participantCount,
  onBracketGenerated,
  className = '',
}: SABOBracketGeneratorProps) {
  const { toast } = useToast();
  const { generateBracket, isGenerating, validateTournament } = useBracketGeneration();
  const [validationResult, setValidationResult] = useState<any>(null);

  const isValidParticipantCount = participantCount === 16;
  const progressPercentage = Math.min((participantCount / 16) * 100, 100);

  useEffect(() => {
    const checkValidation = async () => {
      try {
        const result = await validateTournament(tournamentId);
        setValidationResult(result);
      } catch (error) {
        console.error('Validation error:', error);
      }
    };

    if (tournamentId) {
      checkValidation();
    }
  }, [tournamentId, validateTournament]);

  const handleGenerateBracket = async (seedingMethod: 'elo_ranking' | 'registration_order' | 'random') => {
    if (!isValidParticipantCount) {
      toast({
        title: 'Invalid Participant Count',
        description: `SABO Double Elimination requires exactly 16 participants. Current: ${participantCount}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await generateBracket(tournamentId, {
        method: seedingMethod,
        forceRegenerate: false,
      });

      if (result?.success) {
        toast({
          title: 'SABO Bracket Generated!',
          description: `Double elimination bracket created with ${participantCount} players using ${seedingMethod} seeding.`,
        });
        onBracketGenerated();
      } else {
        toast({
          title: 'Generation Failed',
          description: result?.error || 'Failed to generate SABO bracket',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error generating SABO bracket:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate SABO tournament bracket',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = () => {
    if (participantCount === 0) return 'bg-neutral-500';
    if (participantCount < 16) return 'bg-warning-500';
    if (participantCount > 16) return 'bg-error-500';
    return 'bg-success-500';
  };

  const getStatusText = () => {
    if (participantCount === 0) return 'No participants';
    if (participantCount < 16) return `Need ${16 - participantCount} more`;
    if (participantCount > 16) return 'Too many players';
    return 'Ready for SABO';
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-3 text-title">
              <div className="p-2 rounded-lg bg-info-100 text-info-600">
                <GitBranch className="h-5 w-5" />
              </div>
              SABO Double Elimination Bracket
            </CardTitle>
            <p className="text-body-small-muted">
              Professional 16-player tournament with Winners & Losers brackets + 3-tier fallback system
            </p>
          </div>
          <Badge 
            variant={isValidParticipantCount ? "default" : "destructive"}
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
              <span>SABO Participants</span>
            </div>
            <span className="font-medium">
              {participantCount} / 16
            </span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-2"
          />
          
          {!isValidParticipantCount && (
            <Alert variant={participantCount < 16 ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {participantCount < 16 
                  ? `SABO requires exactly 16 participants. You need ${16 - participantCount} more players.`
                  : `SABO requires exactly 16 participants. You have ${participantCount - 16} too many.`
                }
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        {/* SABO Features */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Crown className="h-4 w-4" />
            SABO Tournament Features
          </h4>
          <div className="grid gap-2">
            <div className="flex items-start gap-2 text-body-small">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Winners Bracket (14 matches) + Losers Bracket (10 matches)</span>
            </div>
            <div className="flex items-start gap-2 text-body-small">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Grand Finals (3 matches) with bracket reset capability</span>
            </div>
            <div className="flex items-start gap-2 text-body-small">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">3-Tier Fallback System (Database → Backup → Client-side)</span>
            </div>
            <div className="flex items-start gap-2 text-body-small">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Professional tournament structure with complex advancement</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Generation Controls */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Play className="h-4 w-4" />
            Generate SABO Bracket
          </h4>

          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => handleGenerateBracket('elo_ranking')}
              disabled={isGenerating || !isValidParticipantCount}
              className="h-12 flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Crown className="h-4 w-4" />
                )}
                <span className="font-medium">ELO-Based SABO Seeding</span>
              </div>
              <span className="text-caption-muted">Recommended: Seed by skill ranking</span>
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleGenerateBracket('registration_order')}
                disabled={isGenerating || !isValidParticipantCount}
                variant="outline"
                className="h-12 flex-col gap-1"
              >
                <div className="flex items-center gap-2">
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                  <span className="font-medium">Registration Order</span>
                </div>
                <span className="text-caption-muted">First-come basis</span>
              </Button>

              <Button
                onClick={() => handleGenerateBracket('random')}
                disabled={isGenerating || !isValidParticipantCount}
                variant="outline"
                className="h-12 flex-col gap-1"
              >
                <div className="flex items-center gap-2">
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="font-medium">Random</span>
                </div>
                <span className="text-caption-muted">Shuffle players</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Fallback System Info */}
        {isValidParticipantCount && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Robust Generation System
              </h4>
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  This SABO system includes a 3-tier fallback mechanism ensuring bracket generation always succeeds, 
                  even if database functions fail.
                </AlertDescription>
              </Alert>
            </div>
          </>
        )}

        {/* Debug Panel - removed TournamentDebugPanel as it's been deleted */}
        {(!isValidParticipantCount || validationResult?.error) && (
          <div className="p-4 bg-error-50 rounded-lg">
            <p className="text-body-small text-error-600">Debug information temporarily unavailable</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
