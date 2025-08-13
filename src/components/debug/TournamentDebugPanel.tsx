import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { TournamentPlayersDebugger } from '@/services/TournamentPlayersDebugger';
import { ClientSideDoubleElimination } from '@/services/ClientSideDoubleElimination';
import { AlertCircle, CheckCircle, Users, Bug } from 'lucide-react';

interface TournamentDebugPanelProps {
  tournamentId: string;
}

export function TournamentDebugPanel({ tournamentId }: TournamentDebugPanelProps) {
  const [debugResult, setDebugResult] = useState<any>(null);
  const [isDebugging, setIsDebugging] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);

  const runDebug = async () => {
    setIsDebugging(true);
    try {
      console.log('🔍 Starting tournament debug...');
      
      // Run debug
      const result = await TournamentPlayersDebugger.debugTournamentPlayers(tournamentId);
      setDebugResult(result);
      
      // Try to load players
      const playerList = await TournamentPlayersDebugger.fixLoadPlayers(tournamentId);
      setPlayers(playerList);
      
      console.log('✅ Debug completed');
    } catch (error) {
      console.error('💥 Debug failed:', error);
      setDebugResult({ error: error.message });
    } finally {
      setIsDebugging(false);
    }
  };

  const testClientSideGeneration = async () => {
    try {
      console.log('🧪 Testing client-side generation...');
      const generator = new ClientSideDoubleElimination(tournamentId);
      const result = await generator.generateBracket();
      console.log('🧪 Client-side result:', result);
      alert(`Client-side generation: ${result.success ? 'Success' : 'Failed: ' + result.error}`);
    } catch (error) {
      console.error('💥 Client-side test failed:', error);
      alert('Client-side test failed: ' + error.message);
    }
  };

  return (
    <Card className="mt-4 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Bug className="w-5 h-5" />
          Tournament Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Use this panel to debug "Failed to load players" issues. Check browser console for detailed logs.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button 
            onClick={runDebug} 
            disabled={isDebugging}
            variant="outline"
            size="sm"
          >
            {isDebugging ? 'Debugging...' : '🔍 Debug Players Loading'}
          </Button>
          
          <Button 
            onClick={testClientSideGeneration}
            variant="outline"
            size="sm"
          >
            🧪 Test Client-Side Generation
          </Button>
        </div>

        {debugResult && (
          <div className="space-y-2">
            <h4 className="font-semibold text-orange-800">Debug Results:</h4>
            
            {debugResult.tournament && (
              <div className="p-2 bg-white rounded border">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Tournament: {debugResult.tournament.name}</span>
                  <Badge variant="secondary">{debugResult.tournament.tournament_type}</Badge>
                </div>
              </div>
            )}

            <div className="p-2 bg-white rounded border">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Registrations: {debugResult.registrationsCount || 0}</span>
                <span>Confirmed: {debugResult.confirmedCount || 0}</span>
              </div>
            </div>

            {debugResult.originalError && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Original Query Error: {debugResult.originalError.message}
                </AlertDescription>
              </Alert>
            )}

            {debugResult.altError && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Alternative Query Error: {debugResult.altError.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {players.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-orange-800">Loaded Players ({players.length}):</h4>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {players.map((player, index) => (
                <div key={player.user_id} className="p-2 bg-white rounded border text-sm">
                  <div className="font-medium">{player.full_name}</div>
                  <div className="text-gray-500">ELO: {player.elo}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-orange-600">
          Tournament ID: {tournamentId}
        </div>
      </CardContent>
    </Card>
  );
}
