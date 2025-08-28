// Simple debug script for tournament data
import { useSABO32Tournament } from '@/tournaments/sabo/hooks/useSABO32Tournament';
import { useEffect } from 'react';

export const DebugTournamentComponent = ({ tournamentId }: { tournamentId: string }) => {
  const { matches, isLoading, error } = useSABO32Tournament(tournamentId);

  useEffect(() => {
    console.log('=== SABO32 Tournament Debug ===');
    console.log('Tournament ID:', tournamentId);
    console.log('Loading:', isLoading);
    console.log('Error:', error?.message || null);
    console.log('Matches count:', matches?.length || 0);
    
    if (matches && matches.length > 0) {
      console.log('Sample matches:', matches.slice(0, 3));
      
      // Log all unique bracket types
      const bracketTypes = [...new Set(matches.map(m => m.bracket_type))];
      console.log('All bracket types found:', bracketTypes);
      
      // Group by bracket type
      bracketTypes.forEach(type => {
        const typeMatches = matches.filter(m => m.bracket_type === type);
        console.log(`- ${type}: ${typeMatches.length} matches`);
      });
    } else {
      console.log('No matches found - checking reason...');
    }
  }, [tournamentId, matches, isLoading, error]);

  return (
    <div className="p-4 border border-red-300 bg-red-50 rounded">
      <h3 className="font-bold text-red-700">Debug Tournament Data</h3>
      <p>Tournament ID: {tournamentId}</p>
      <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
      <p>Error: {error?.message || 'None'}</p>
      <p>Matches: {matches?.length || 0}</p>
      
      {matches && matches.length > 0 && (
        <div>
          <h4 className="font-semibold mt-2">Sample matches:</h4>
          <pre className="text-xs bg-white p-2 rounded mt-1">
            {JSON.stringify(matches.slice(0, 2), null, 2)}
          </pre>
          
          <h4 className="font-semibold mt-2">Bracket Types:</h4>
          <div className="text-xs bg-white p-2 rounded mt-1">
            {[...new Set(matches.map(m => m.bracket_type))].map(type => {
              const count = matches.filter(m => m.bracket_type === type).length;
              return (
                <div key={type} className="mb-1">
                  <span className="font-mono">{type}</span>: {count} matches
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {matches && matches.length === 0 && !isLoading && (
        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
          <p className="text-yellow-800">No matches found for this tournament ID</p>
        </div>
      )}
    </div>
  );
};
