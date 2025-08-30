// =============================================
// SABO-32 QUICK ACTIONS PANEL
// Fast tournament management actions
// =============================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SABO32QuickActionsProps {
  tournamentId: string;
  onRefresh: () => void;
  totalMatches: number;
  completedMatches: number;
  pendingMatches: number;
}

export function SABO32QuickActions({ 
  tournamentId, 
  onRefresh,
  totalMatches,
  completedMatches,
  pendingMatches
}: SABO32QuickActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAutoAdvancement = async () => {
    setIsProcessing(true);
    
    try {
      // Find matches that can be auto-advanced (bye matches, etc.)
      const { data: matches, error } = await (supabase as any)
        .from('sabo32_matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('status', 'pending')
        .or('player2_id.is.null,player1_id.is.null');

      if (error) throw error;

      let advancedCount = 0;
      
      for (const match of matches || []) {
        if (!match.player2_id && match.player1_id) {
          // Player 1 gets bye
          await (supabase as any)
            .from('sabo32_matches')
            .update({
              status: 'completed',
              winner_id: match.player1_id,
              score_player1: 1,
              score_player2: 0,
              completed_at: new Date().toISOString()
            })
            .eq('id', match.id);
          advancedCount++;
        } else if (!match.player1_id && match.player2_id) {
          // Player 2 gets bye
          await (supabase as any)
            .from('sabo32_matches')
            .update({
              status: 'completed',
              winner_id: match.player2_id,
              score_player1: 0,
              score_player2: 1,
              completed_at: new Date().toISOString()
            })
            .eq('id', match.id);
          advancedCount++;
        }
      }

      if (advancedCount > 0) {
        toast.success(`🚀 Auto-advanced ${advancedCount} bye matches!`);
        onRefresh();
      } else {
        toast.info('No bye matches to advance');
      }

    } catch (error) {
      console.error('Auto advancement error:', error);
      toast.error('Error during auto advancement');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRandomFillMatches = async () => {
    setIsProcessing(true);
    
    try {
      // Fill pending matches with random scores for testing
      const { data: pendingMatches, error } = await (supabase as any)
        .from('sabo32_matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('status', 'pending')
        .not('player1_id', 'is', null)
        .not('player2_id', 'is', null)
        .limit(5); // Only fill first 5 for testing

      if (error) throw error;

      let filledCount = 0;

      for (const match of pendingMatches || []) {
        const score1 = Math.floor(Math.random() * 15) + 5; // 5-19
        const score2 = Math.floor(Math.random() * 15) + 5;
        const finalScore1 = score1 === score2 ? score1 + 1 : score1;
        const winner_id = finalScore1 > score2 ? match.player1_id : match.player2_id;

        await (supabase as any)
          .from('sabo32_matches')
          .update({
            score_player1: finalScore1,
            score_player2: score2,
            winner_id: winner_id,
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', match.id);

        filledCount++;
      }

      if (filledCount > 0) {
        toast.success(`🎯 Filled ${filledCount} matches with random scores!`);
        onRefresh();
      } else {
        toast.info('No matches available to fill');
      }

    } catch (error) {
      console.error('Random fill error:', error);
      toast.error('Error filling matches');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetTournament = async () => {
    if (!confirm('⚠️ Are you sure? This will reset ALL match results!')) return;
    
    setIsProcessing(true);
    
    try {
      await (supabase as any)
        .from('sabo32_matches')
        .update({
          score_player1: 0,
          score_player2: 0,
          winner_id: null,
          status: 'pending',
          completed_at: null
        })
        .eq('tournament_id', tournamentId);

      toast.success('🔄 Tournament reset successfully!');
      onRefresh();

    } catch (error) {
      console.error('Reset error:', error);
      toast.error('Error resetting tournament');
    } finally {
      setIsProcessing(false);
    }
  };

  const progressPercentage = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tournament Status */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-lg font-bold text-green-600">{completedMatches}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{pendingMatches}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{Math.round(progressPercentage)}%</div>
            <div className="text-xs text-muted-foreground">Progress</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isProcessing}
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoAdvancement}
            disabled={isProcessing}
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            Auto-Advance Byes
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRandomFillMatches}
            disabled={isProcessing}
            className="w-full text-purple-600 border-purple-300 hover:bg-purple-50"
          >
            <Target className="w-4 h-4 mr-2" />
            Fill 5 Random (Test)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetTournament}
            disabled={isProcessing}
            className="w-full text-red-600 border-red-300 hover:bg-red-50"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Reset Tournament
          </Button>
        </div>

        {/* Status Indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Tournament Health</span>
            <Badge variant={progressPercentage > 75 ? 'default' : progressPercentage > 25 ? 'secondary' : 'outline'}>
              {progressPercentage > 75 ? 'Excellent' : progressPercentage > 25 ? 'Good' : 'Starting'}
            </Badge>
          </div>
          
          {pendingMatches > 0 && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <AlertTriangle className="w-4 h-4" />
              {pendingMatches} matches ready to play
            </div>
          )}
          
          {progressPercentage === 100 && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              Tournament completed!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
