// =============================================
// SABO-32 MATCH CARD WITH SCORE SUBMISSION
// Complete match card with score input and submission
// =============================================

import React, { useState } from 'react';
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
  
  const { submitScore, isSubmitting } = useSABO32ScoreSubmission(tournamentId);

  const player1Name = match.player1_profile?.full_name || 
                     match.player1_profile?.display_name || 
                     'TBD';
  
  const player2Name = match.player2_profile?.full_name || 
                     match.player2_profile?.display_name || 
                     'TBD';

  const isCompleted = match.status === 'completed';
  const hasBothPlayers = match.player1_id && match.player2_id;
  const canSubmitScore = hasBothPlayers && !isCompleted;

  const handleScoreSubmit = async () => {
    if (!hasBothPlayers) return;

    const scoreNum1 = parseInt(score1) || 0;
    const scoreNum2 = parseInt(score2) || 0;
    
    if (scoreNum1 === scoreNum2) {
      alert('Tỷ số không thể hòa! Vui lòng nhập tỷ số khác nhau.');
      return;
    }

    const winner_id = scoreNum1 > scoreNum2 ? match.player1_id! : match.player2_id!;

    const result = await submitScore({
      matchId: match.id,
      score_player1: scoreNum1,
      score_player2: scoreNum2,
      winner_id
    });

    if (result.success) {
      setIsEditing(false);
      onUpdate?.();
    }
  };

  const getStatusBadge = () => {
    switch (match.status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Hoàn thành</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-500"><Play className="w-3 h-3 mr-1" />Đang đấu</Badge>;
      case 'scheduled':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Đã lên lịch</Badge>;
      case 'bye':
        return <Badge variant="outline">Bye</Badge>;
      default:
        return <Badge variant="outline"><Users className="w-3 h-3 mr-1" />Chờ</Badge>;
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
    if (!match.winner_id) return null;
    if (match.winner_id === match.player1_id) return player1Name;
    if (match.winner_id === match.player2_id) return player2Name;
    return 'Unknown';
  };

  return (
    <Card className={cn(
      "w-full transition-all duration-200",
      isCompleted && "border-green-200 bg-green-50",
      match.status === 'in_progress' && "border-blue-200 bg-blue-50",
      !hasBothPlayers && "border-gray-200 bg-gray-50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            {match.sabo_match_id}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {getBracketTypeDisplay(match.bracket_type)}
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
              "text-center p-2 rounded-lg transition-colors",
              match.winner_id === match.player1_id && "bg-yellow-100 border border-yellow-300"
            )}>
              <div className="font-medium text-sm">{player1Name}</div>
              {isCompleted && (
                <div className="text-lg font-bold mt-1">{match.score_player1 || 0}</div>
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
                    className="w-12 h-8 text-center p-1"
                  />
                  <span className="text-xs font-semibold">vs</span>
                  <Input
                    type="number"
                    min="0"
                    max="99"
                    value={score2}
                    onChange={(e) => setScore2(e.target.value)}
                    className="w-12 h-8 text-center p-1"
                  />
                </div>
              ) : (
                <div className="text-xs font-semibold text-gray-500">VS</div>
              )}
            </div>

            {/* Player 2 */}
            <div className={cn(
              "text-center p-2 rounded-lg transition-colors",
              match.winner_id === match.player2_id && "bg-yellow-100 border border-yellow-300"
            )}>
              <div className="font-medium text-sm">{player2Name}</div>
              {isCompleted && (
                <div className="text-lg font-bold mt-1">{match.score_player2 || 0}</div>
              )}
            </div>
          </div>

          {/* Winner Display */}
          {isCompleted && getWinnerName() && (
            <>
              <Separator />
              <div className="flex items-center justify-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold text-yellow-700">
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
                  className="w-full"
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
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleScoreSubmit}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Đang lưu...' : 'Lưu kết quả'}
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Match Info */}
          <div className="text-xs text-gray-500 text-center">
            {match.completed_at && (
              <div>Hoàn thành: {new Date(match.completed_at).toLocaleString('vi-VN')}</div>
            )}
            {match.scheduled_at && !match.completed_at && (
              <div>Lên lịch: {new Date(match.scheduled_at).toLocaleString('vi-VN')}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
