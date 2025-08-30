// Manual SABO32 Advancement Fix Component
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wrench, AlertTriangle, CheckCircle, Users, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SABO32ManualFixProps {
  tournamentId: string;
  onComplete?: () => void;
}

export const SABO32ManualFix: React.FC<SABO32ManualFixProps> = ({ 
  tournamentId, 
  onComplete 
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeAndFix = async () => {
    setLoading(true);
    try {
      console.log('🔧 Starting manual SABO32 advancement fix...');

      // 1. Get all matches for this tournament
      const { data: allMatches, error: matchesError } = await supabase
        .from('sabo32_matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('sabo_match_id');

      if (matchesError) throw matchesError;

      if (!allMatches || allMatches.length === 0) {
        toast.error('No SABO32 matches found for this tournament');
        return;
      }

      // 2. Analyze current state
      const groupAFinals = allMatches.filter(m => m.bracket_type === 'GROUP_A_FINAL');
      const groupBFinals = allMatches.filter(m => m.bracket_type === 'GROUP_B_FINAL');
      const crossSemis = allMatches.filter(m => m.bracket_type === 'CROSS_SEMIFINALS');
      const crossFinal = allMatches.filter(m => m.bracket_type === 'CROSS_FINAL');

      const analysisResult = {
        groupAFinals: groupAFinals.map(m => ({
          id: m.id,
          sabo_match_id: m.sabo_match_id,
          completed: m.status === 'completed',
          winner_id: m.winner_id,
          winner_advanced: false
        })),
        groupBFinals: groupBFinals.map(m => ({
          id: m.id,
          sabo_match_id: m.sabo_match_id,
          completed: m.status === 'completed',
          winner_id: m.winner_id,
          winner_advanced: false
        })),
        crossSemis: crossSemis.map(m => ({
          id: m.id,
          sabo_match_id: m.sabo_match_id,
          player1_id: m.player1_id,
          player2_id: m.player2_id,
          completed: m.status === 'completed',
          winner_id: m.winner_id
        })),
        crossFinal: crossFinal.map(m => ({
          id: m.id,
          sabo_match_id: m.sabo_match_id,
          player1_id: m.player1_id,
          player2_id: m.player2_id,
          completed: m.status === 'completed',
          winner_id: m.winner_id
        })),
        fixesApplied: []
      };

      // 3. Apply fixes
      const fixes = [];

      // Fix Group A Finals -> Cross SF1
      for (const groupAFinal of analysisResult.groupAFinals) {
        if (groupAFinal.completed && groupAFinal.winner_id) {
          const targetSF = crossSemis.find(m => 
            m.sabo_match_id.includes('SF1') && !m.player1_id
          );
          
          if (targetSF) {
            const { error } = await supabase
              .from('sabo32_matches')
              .update({ 
                player1_id: groupAFinal.winner_id,
                updated_at: new Date().toISOString()
              })
              .eq('id', targetSF.id);

            if (!error) {
              fixes.push(`✅ Advanced Group A winner from ${groupAFinal.sabo_match_id} to ${targetSF.sabo_match_id}`);
              groupAFinal.winner_advanced = true;
            } else {
              fixes.push(`❌ Failed to advance Group A winner: ${error.message}`);
            }
          }
        }
      }

      // Fix Group B Finals -> Cross SF2
      for (const groupBFinal of analysisResult.groupBFinals) {
        if (groupBFinal.completed && groupBFinal.winner_id) {
          const targetSF = crossSemis.find(m => 
            m.sabo_match_id.includes('SF2') && !m.player1_id
          );
          
          if (targetSF) {
            const { error } = await supabase
              .from('sabo32_matches')
              .update({ 
                player1_id: groupBFinal.winner_id,
                updated_at: new Date().toISOString()
              })
              .eq('id', targetSF.id);

            if (!error) {
              fixes.push(`✅ Advanced Group B winner from ${groupBFinal.sabo_match_id} to ${targetSF.sabo_match_id}`);
              groupBFinal.winner_advanced = true;
            } else {
              fixes.push(`❌ Failed to advance Group B winner: ${error.message}`);
            }
          }
        }
      }

      // Fix Cross Semifinals -> Cross Final
      for (const semi of analysisResult.crossSemis) {
        if (semi.completed && semi.winner_id) {
          const targetFinal = crossFinal.find(f => !f.player1_id || !f.player2_id);
          
          if (targetFinal) {
            const updateData = targetFinal.player1_id 
              ? { player2_id: semi.winner_id } 
              : { player1_id: semi.winner_id };

            const { error } = await supabase
              .from('sabo32_matches')
              .update({ 
                ...updateData,
                updated_at: new Date().toISOString()
              })
              .eq('id', targetFinal.id);

            if (!error) {
              fixes.push(`✅ Advanced Cross SF winner from ${semi.sabo_match_id} to ${targetFinal.sabo_match_id}`);
            } else {
              fixes.push(`❌ Failed to advance Cross SF winner: ${error.message}`);
            }
          }
        }
      }

      analysisResult.fixesApplied = fixes;
      setAnalysis(analysisResult);

      if (fixes.length > 0) {
        toast.success(`Applied ${fixes.filter(f => f.startsWith('✅')).length} advancement fixes!`);
        onComplete?.();
      } else {
        toast.info('No advancement fixes needed - all players are properly positioned');
      }

    } catch (error) {
      console.error('Error in manual fix:', error);
      toast.error('Failed to apply manual fixes: ' + (error as any)?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-warning-50/50 dark:bg-orange-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-warning-700 dark:text-orange-300">
          <Wrench className="w-5 h-5" />
          Manual Advancement Fix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Use this tool if Group Final winners haven't automatically advanced to Cross-Bracket.
            This will manually check and fix any missing advancement connections.
          </AlertDescription>
        </Alert>

        <Button
          onClick={analyzeAndFix}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {loading ? (
            <>
              <Wrench className="w-4 h-4 mr-2 animate-spin" />
              Analyzing & Fixing...
            </>
          ) : (
            <>
              <Wrench className="w-4 h-4 mr-2" />
              Run Manual Advancement Fix
            </>
          )}
        </Button>

        {analysis && (
          <div className="space-y-3 mt-4">
            <div className="text-sm font-semibold text-warning-700 dark:text-orange-300">
              Analysis Results:
            </div>

            {/* Group Finals Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-medium mb-2">Group A Finals:</div>
                {analysis.groupAFinals.map((final: any) => (
                  <div key={final.id} className="text-xs p-2 bg-white dark:bg-neutral-800 rounded border">
                    <Badge variant={final.completed ? "default" : "secondary"} className="mr-2">
                      {final.sabo_match_id}
                    </Badge>
                    {final.completed ? (
                      <span className={final.winner_advanced ? "text-success-600" : "text-warning-600"}>
                        {final.winner_advanced ? "✅ Advanced" : "⚠️ Needs Fix"}
                      </span>
                    ) : (
                      <span className="text-neutral-500">Pending</span>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <div className="text-xs font-medium mb-2">Group B Finals:</div>
                {analysis.groupBFinals.map((final: any) => (
                  <div key={final.id} className="text-xs p-2 bg-white dark:bg-neutral-800 rounded border">
                    <Badge variant={final.completed ? "default" : "secondary"} className="mr-2">
                      {final.sabo_match_id}
                    </Badge>
                    {final.completed ? (
                      <span className={final.winner_advanced ? "text-success-600" : "text-warning-600"}>
                        {final.winner_advanced ? "✅ Advanced" : "⚠️ Needs Fix"}
                      </span>
                    ) : (
                      <span className="text-neutral-500">Pending</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cross-Bracket Status */}
            <div>
              <div className="text-xs font-medium mb-2">Cross-Bracket Status:</div>
              <div className="space-y-1">
                {analysis.crossSemis.map((semi: any) => (
                  <div key={semi.id} className="text-xs p-2 bg-white dark:bg-neutral-800 rounded border">
                    <Badge variant="outline" className="mr-2">{semi.sabo_match_id}</Badge>
                    <span className={semi.player1_id ? "text-success-600" : "text-neutral-500"}>
                      Player 1: {semi.player1_id ? "Set" : "TBD"}
                    </span>
                    <span className="mx-2">|</span>
                    <span className={semi.player2_id ? "text-success-600" : "text-neutral-500"}>
                      Player 2: {semi.player2_id ? "Set" : "TBD"}
                    </span>
                  </div>
                ))}
                {analysis.crossFinal.map((final: any) => (
                  <div key={final.id} className="text-xs p-2 bg-white dark:bg-neutral-800 rounded border">
                    <Badge variant="outline" className="mr-2">{final.sabo_match_id}</Badge>
                    <span className={final.player1_id ? "text-success-600" : "text-neutral-500"}>
                      Player 1: {final.player1_id ? "Set" : "TBD"}
                    </span>
                    <span className="mx-2">|</span>
                    <span className={final.player2_id ? "text-success-600" : "text-neutral-500"}>
                      Player 2: {final.player2_id ? "Set" : "TBD"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fixes Applied */}
            {analysis.fixesApplied.length > 0 && (
              <div>
                <div className="text-xs font-medium mb-2">Fixes Applied:</div>
                <div className="space-y-1">
                  {analysis.fixesApplied.map((fix: string, index: number) => (
                    <div key={index} className={`text-xs p-2 rounded border ${
                      fix.startsWith('✅') 
                        ? 'bg-success-50 border-success-200 text-success-700' 
                        : 'bg-error-50 border-error-200 text-error-700'
                    }`}>
                      {fix}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
