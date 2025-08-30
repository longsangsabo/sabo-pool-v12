// =============================================
// SABO-32 ADVANCEMENT FIX COMPONENT
// Fix players advancement in completed matches
// =============================================

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, CheckCircle, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SABO32AdvancementFixProps {
  tournamentId: string;
  onComplete?: () => void;
}

export const SABO32AdvancementFix: React.FC<SABO32AdvancementFixProps> = ({ 
  tournamentId, 
  onComplete 
}) => {
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Analyze advancement issues
  const analyzeAdvancement = async () => {
    try {
      setIsFixing(true);
      
      const { data: matches, error } = await (supabase as any)
        .from('sabo32_matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round_number', { ascending: true });

      if (error) throw error;

      const completed = matches.filter(m => m.status === 'completed' && m.winner_id);
      const missingPlayers = matches.filter(m => 
        m.status === 'pending' && (!m.player1_id || !m.player2_id)
      );
      
      const issues = [];
      
      // Check for completed matches with winners but no advancement
      for (const match of completed) {
        const { group_id, bracket_type, round_number, match_number, winner_id } = match;
        
        if (group_id && bracket_type.includes('winners')) {
          // Check if winner advanced to next winners round
          const nextMatch = matches.find(m =>
            m.group_id === group_id &&
            m.bracket_type === bracket_type &&
            m.round_number === round_number + 1 &&
            Math.floor((match_number - 1) / 2) + 1 === m.match_number
          );
          
          if (nextMatch && !nextMatch.player1_id && !nextMatch.player2_id) {
            issues.push(`${match.sabo_match_id}: Winner ${winner_id} not advanced to next round`);
          }
        }
      }

      setAnalysisResult({
        totalMatches: matches.length,
        completedMatches: completed.length,
        missingPlayerMatches: missingPlayers.length,
        issues: issues.slice(0, 10), // Show first 10 issues
        hasIssues: issues.length > 0
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error(`Lỗi phân tích: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  // Run the advancement fix
  const runAdvancementFix = async () => {
    try {
      setIsFixing(true);
      setFixResult(null);

      // Call the SQL function
      const { data, error } = await (supabase as any).rpc('fix_sabo32_advancement', {
        p_tournament_id: tournamentId
      });

      if (error) throw error;

      setFixResult(data || 'Fix completed successfully');
      toast.success('Đã sửa logic advancement thành công!');
      
      // Refresh the tournament data
      if (onComplete) {
        setTimeout(onComplete, 1000);
      }

    } catch (error) {
      console.error('Fix failed:', error);
      toast.error(`Lỗi sửa advancement: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  // Manual fix for specific patterns
  const manualFix = async () => {
    try {
      setIsFixing(true);
      
      // Get all completed matches
      const { data: matches, error } = await (supabase as any)
        .from('sabo32_matches')
        .select('*')
        .eq('tournament_id', tournamentId);

      if (error) throw error;

      const updates = [];
      const completed = matches.filter(m => m.status === 'completed' && m.winner_id);

      for (const match of completed) {
        const { group_id, bracket_type, round_number, match_number, winner_id } = match;
        const loser_id = match.player1_id === winner_id ? match.player2_id : match.player1_id;

        if (group_id && bracket_type.includes('winners')) {
          // Winners bracket advancement
          const nextRound = round_number + 1;
          const nextMatchNumber = Math.floor((match_number - 1) / 2) + 1;
          
          const nextMatch = matches.find(m =>
            m.group_id === group_id &&
            m.bracket_type === bracket_type &&
            m.round_number === nextRound &&
            m.match_number === nextMatchNumber
          );

          if (nextMatch && (!nextMatch.player1_id || !nextMatch.player2_id)) {
            const playerField = (match_number % 2 === 1) ? 'player1_id' : 'player2_id';
            updates.push({
              id: nextMatch.id,
              [playerField]: winner_id
            });
          }

          // Send loser to losers bracket
          const losersMatch = matches.find(m =>
            m.group_id === group_id &&
            m.bracket_type === `group_${group_id.toLowerCase()}_losers_a` &&
            m.round_number >= 101 &&
            (!m.player1_id || !m.player2_id)
          );

          if (losersMatch && loser_id) {
            const playerField = !losersMatch.player1_id ? 'player1_id' : 'player2_id';
            updates.push({
              id: losersMatch.id,
              [playerField]: loser_id
            });
          }
        }
      }

      // Apply updates
      for (const update of updates) {
        await (supabase as any)
          .from('sabo32_matches')
          .update(update)
          .eq('id', update.id);
      }

      setFixResult(`Manual fix completed: ${updates.length} updates applied`);
      toast.success(`Đã áp dụng ${updates.length} cập nhật thủ công!`);
      
      if (onComplete) {
        setTimeout(onComplete, 1000);
      }

    } catch (error) {
      console.error('Manual fix failed:', error);
      toast.error(`Lỗi sửa thủ công: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5" />
          SABO-32 Advancement Fix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Analysis Results */}
        {analysisResult && (
          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
            <h4 className="font-semibold mb-2">Phân tích hiện tại:</h4>
            <div className="grid grid-cols-2 gap-4 text-body-small">
              <div>Tổng số trận: <Badge variant="outline">{analysisResult.totalMatches}</Badge></div>
              <div>Trận đã hoàn thành: <Badge variant="default">{analysisResult.completedMatches}</Badge></div>
              <div>Trận thiếu người chơi: <Badge variant="destructive">{analysisResult.missingPlayerMatches}</Badge></div>
              <div>Có vấn đề: <Badge variant={analysisResult.hasIssues ? "destructive" : "default"}>
                {analysisResult.hasIssues ? "Có" : "Không"}
              </Badge></div>
            </div>
            {analysisResult.issues.length > 0 && (
              <div className="mt-3">
                <p className="font-medium text-body-small">Vấn đề tìm thấy:</p>
                <ul className="text-caption space-y-1 mt-1">
                  {analysisResult.issues.map((issue, idx) => (
                    <li key={idx} className="text-error-600 dark:text-red-400">• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Fix Result */}
        {fixResult && (
          <div className="p-4 rounded-lg bg-success-50 dark:bg-green-900/20 border border-success-200 dark:border-green-700">
            <div className="flex items-center gap-2 text-success-800 dark:text-green-200">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Kết quả sửa:</span>
            </div>
            <pre className="text-caption mt-2 whitespace-pre-wrap text-success-700 dark:text-green-300">
              {fixResult}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeAdvancement}
            disabled={isFixing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFixing ? 'animate-spin' : ''}`} />
            Phân tích vấn đề
          </Button>

          <Button
            size="sm"
            onClick={runAdvancementFix}
            disabled={isFixing}
            className="bg-primary-600 hover:bg-blue-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            Auto Fix (SQL)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={manualFix}
            disabled={isFixing}
            className="border-amber-500 text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-900/20"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFixing ? 'animate-spin' : ''}`} />
            Manual Fix
          </Button>
        </div>

        <div className="text-caption-muted">
          <p>• <strong>Phân tích vấn đề</strong>: Kiểm tra trận nào thiếu người chơi</p>
          <p>• <strong>Auto Fix</strong>: Chạy SQL function để tự động sửa</p>
          <p>• <strong>Manual Fix</strong>: Sửa thủ công cho winners bracket</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SABO32AdvancementFix;
