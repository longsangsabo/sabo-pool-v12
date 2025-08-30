// =============================================
// SABO-32 MATCH CARD WITH SCORE SUBMISSION
// Complete match card with score input and submission
// =============================================

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trophy, Users, Clock, CheckCircle, Play } from 'lucide-react';
import { useSABO32ScoreSubmission } from '@/hooks/useSABO32ScoreSubmission';
import { cn } from '@/lib/utils';

interface SABO32MatchCardProps {
  match: {
    id: string;
    sabo_match_id: string;
    bracket_type: string;
    round_number: number;
    player1_id?: string;
    player2_id?: string;
    player1_profile?: {
      id: string;
      full_name: string;
      display_name: string;
    };
    player2_profile?: {
      id: string;
      full_name: string;
      display_name: string;
    };
    winner_id?: string;
    score_player1?: number;
    score_player2?: number;
    status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'bye';
    scheduled_at?: string;
    completed_at?: string;
  };
  tournamentId: string;
  onUpdate?: () => void;
}

export function SABO32MatchCard({ match, tournamentId, onUpdate }: SABO32MatchCardProps) {
  const [score1, setScore1] = useState(match.score_player1?.toString() || '0');
  const [score2, setScore2] = useState(match.score_player2?.toString() || '0');
  const [isEditing, setIsEditing] = useState(false);
  
  // Optimistic update states
  const [optimisticMatch, setOptimisticMatch] = useState(match);
  const [isOptimistic, setIsOptimistic] = useState(false);
  
  const { submitScore, isSubmitting } = useSABO32ScoreSubmission(tournamentId, onUpdate);

  // Update local state when match prop changes (real data from server)
  useEffect(() => {
    // Only update if we're not in optimistic state or if real data is different
    if (!isOptimistic || 
        match.score_player1 !== optimisticMatch.score_player1 || 
        match.score_player2 !== optimisticMatch.score_player2 ||
        match.status !== optimisticMatch.status) {
      setOptimisticMatch(match);
      setScore1(match.score_player1?.toString() || '0');
      setScore2(match.score_player2?.toString() || '0');
      if (match.status === 'completed' && isOptimistic) {
        setIsOptimistic(false);
      }
    }
  }, [match, isOptimistic, optimisticMatch]);

  const player1Name = optimisticMatch.player1_profile?.full_name || 
                     optimisticMatch.player1_profile?.display_name || 
                     'TBD';
  
  const player2Name = optimisticMatch.player2_profile?.full_name || 
                     optimisticMatch.player2_profile?.display_name || 
                     'TBD';

  const isCompleted = optimisticMatch.status === 'completed';
  const hasBothPlayers = optimisticMatch.player1_id && optimisticMatch.player2_id;
  const canSubmitScore = hasBothPlayers && !isCompleted;

  const handleScoreSubmit = async () => {
    if (!hasBothPlayers) return;

    const scoreNum1 = parseInt(score1) || 0;
    const scoreNum2 = parseInt(score2) || 0;
    
    if (scoreNum1 === scoreNum2) {
      alert('Tỷ số không thể hòa! Vui lòng nhập tỷ số khác nhau.');
      return;
    }

    const winner_id = scoreNum1 > scoreNum2 ? optimisticMatch.player1_id! : optimisticMatch.player2_id!;

    try {
      // ✅ IMMEDIATE OPTIMISTIC UPDATE
      setIsOptimistic(true);
      setIsEditing(false);
      
      // Update optimistic state immediately for instant UI feedback
      setOptimisticMatch({
        ...optimisticMatch,
        score_player1: scoreNum1,
        score_player2: scoreNum2,
        winner_id: winner_id,
        status: 'completed' as const,
        completed_at: new Date().toISOString()
      });
      
      // Submit score in background WITHOUT triggering page refresh
      const result = await submitScore({
        matchId: optimisticMatch.id,
        score_player1: scoreNum1,
        score_player2: scoreNum2,
        winner_id
      });

      if (!result.success) {
        // Revert optimistic update on failure
        setOptimisticMatch(match);
        setIsOptimistic(false);
        setIsEditing(true);
      } else {
        // Clear form on success
        setScore1('0');
        setScore2('0');
        // Optimistic state will be cleared when real data arrives via useEffect
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
      // Revert optimistic update
      setOptimisticMatch(match);
      setIsOptimistic(false);
      setIsEditing(true);
    }
  };

  const getStatusBadge = () => {
    switch (optimisticMatch.status) {
      case 'completed':
        return <Badge variant="default" className="bg-success-600 hover:bg-success-700 text-white dark:bg-success-700 dark:hover:bg-green-800"><CheckCircle className="w-3 h-3 mr-1" />Hoàn thành</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-primary-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800"><Play className="w-3 h-3 mr-1" />Đang đấu</Badge>;
      case 'scheduled':
        return <Badge variant="secondary" className="bg-neutral-200 text-neutral-800 dark:bg-gray-700 dark:text-gray-200"><Clock className="w-3 h-3 mr-1" />Đã lên lịch</Badge>;
      case 'bye':
        return <Badge variant="outline" className="border-border text-muted-foreground">Bye</Badge>;
      default:
        return <Badge variant="outline" className="border-border text-muted-foreground"><Users className="w-3 h-3 mr-1" />Chờ</Badge>;
    }
  };

  const getBracketTypeDisplay = (type: string) => {
    if (type.includes('winners')) return 'Winners';
    if (type.includes('losers')) return 'Losers';
    if (type.includes('final')) return 'Final';
    if (type.includes('cross')) return 'Cross-bracket';
    return type;
  };

  const getWinnerName = () => {
    if (!optimisticMatch.winner_id) return null;
    if (optimisticMatch.winner_id === optimisticMatch.player1_id) return player1Name;
    if (optimisticMatch.winner_id === optimisticMatch.player2_id) return player2Name;
    return 'Unknown';
  };

  return (
    <Card className={cn(
      "w-full transition-all duration-200 border-2 relative",
      // Light mode
      isCompleted && "border-success-300 bg-success-50 dark:border-green-600 dark:bg-green-900/20",
      optimisticMatch.status === 'in_progress' && "border-primary-300 bg-primary-50 dark:border-blue-500 dark:bg-blue-900/20", 
      !hasBothPlayers && "border-neutral-300 bg-neutral-50 dark:border-gray-600 dark:bg-neutral-800/50",
      // Default state
      hasBothPlayers && !isCompleted && optimisticMatch.status === 'pending' && "border-amber-300 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/20",
      // Optimistic update indicator
      isOptimistic && "ring-2 ring-blue-400 dark:ring-blue-600"
    )}>
      {/* Loading overlay for optimistic updates */}
      {isOptimistic && (
        <div className="absolute inset-0 bg-primary-500/10 rounded-lg flex items-center justify-center z-10">
          <div className="bg-primary-600 dark:bg-primary-500 text-white px-2 py-1 rounded text-xs font-medium">
            Đang cập nhật...
          </div>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">
            {optimisticMatch.sabo_match_id}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-border">
              {getBracketTypeDisplay(optimisticMatch.bracket_type)}
            </Badge>
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Players */}
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Player 1 */}
            <div className={cn(
              "text-center p-3 rounded-lg transition-colors border",
              optimisticMatch.winner_id === optimisticMatch.player1_id 
                ? "bg-warning-100 border-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-600" 
                : "bg-card border-border hover:bg-muted/50"
            )}>
              <div className="font-medium text-sm text-foreground">{player1Name}</div>
              {isCompleted && (
                <div className="text-lg font-bold mt-1 text-foreground">{optimisticMatch.score_player1 || 0}</div>
              )}
            </div>

            {/* VS or Score Input */}
            <div className="text-center">
              {canSubmitScore && isEditing ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="0"
                    max="99"
                    value={score1}
                    onChange={(e) => setScore1(e.target.value)}
                    className="w-12 h-8 text-center p-1 bg-background border-border text-foreground"
                  />
                  <span className="text-xs font-semibold text-muted-foreground">vs</span>
                  <Input
                    type="number"
                    min="0"
                    max="99"
                    value={score2}
                    onChange={(e) => setScore2(e.target.value)}
                    className="w-12 h-8 text-center p-1 bg-background border-border text-foreground"
                  />
                </div>
              ) : (
                <div className="text-xs font-semibold text-muted-foreground">VS</div>
              )}
            </div>

            {/* Player 2 */}
            <div className={cn(
              "text-center p-3 rounded-lg transition-colors border",
              optimisticMatch.winner_id === optimisticMatch.player2_id 
                ? "bg-warning-100 border-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-600" 
                : "bg-card border-border hover:bg-muted/50"
            )}>
              <div className="font-medium text-sm text-foreground">{player2Name}</div>
              {isCompleted && (
                <div className="text-lg font-bold mt-1 text-foreground">{optimisticMatch.score_player2 || 0}</div>
              )}
            </div>
          </div>

          {/* Winner Display */}
          {isCompleted && getWinnerName() && (
            <>
              <Separator className="bg-border" />
              <div className="flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-2 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <Trophy className="w-4 h-4 text-warning-600 dark:text-yellow-400" />
                <span className="font-semibold text-warning-800 dark:text-yellow-200">
                  Người thắng: {getWinnerName()}
                </span>
              </div>
            </>
          )}

          {/* Action Buttons */}
          {canSubmitScore && (
            <div className="flex gap-2 mt-3">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="w-full border-border hover:bg-muted text-foreground"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Nhập tỷ số
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 border-border hover:bg-muted text-foreground"
                  >
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleScoreSubmit}
                    disabled={isSubmitting}
                    data-submitting={isSubmitting}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isSubmitting ? 'Đang lưu...' : 'Lưu kết quả'}
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Match Info */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
            {optimisticMatch.completed_at && (
              <div>Hoàn thành: {new Date(optimisticMatch.completed_at).toLocaleString('vi-VN')}</div>
            )}
            {optimisticMatch.scheduled_at && !optimisticMatch.completed_at && (
              <div>Lên lịch: {new Date(optimisticMatch.scheduled_at).toLocaleString('vi-VN')}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
