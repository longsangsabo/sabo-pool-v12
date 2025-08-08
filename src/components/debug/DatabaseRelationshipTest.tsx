import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseTestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

export const DatabaseRelationshipTest: React.FC = () => {
  const [results, setResults] = useState<DatabaseTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const testResults: DatabaseTestResult[] = [];

    // Test 1: Basic matches table access
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('id, player1_id, player2_id, status')
        .limit(3);

      testResults.push({
        test: 'Matches Table Access',
        status: error ? 'error' : 'success',
        message: error ? error.message : `Found ${data?.length || 0} matches`,
        data: data?.slice(0, 2), // Show first 2 records
      });
    } catch (err) {
      testResults.push({
        test: 'Matches Table Access',
        status: 'error',
        message: `Exception: ${err}`,
      });
    }

    // Test 2: Profiles table access
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, display_name')
        .limit(3);

      testResults.push({
        test: 'Profiles Table Access',
        status: error ? 'error' : 'success',
        message: error ? error.message : `Found ${data?.length || 0} profiles`,
        data: data?.slice(0, 2),
      });
    } catch (err) {
      testResults.push({
        test: 'Profiles Table Access',
        status: 'error',
        message: `Exception: ${err}`,
      });
    }

    // Test 3: Manual relationship query (new approach)
    try {
      const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .limit(2);

      if (matchError) {
        testResults.push({
          test: 'Manual Relationship Query',
          status: 'error',
          message: matchError.message,
        });
      } else if (matches && matches.length > 0) {
        const playerIds = new Set<string>();
        matches.forEach(match => {
          if (match.player1_id) playerIds.add(match.player1_id);
          if (match.player2_id) playerIds.add(match.player2_id);
        });

        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, full_name, display_name')
          .in('user_id', Array.from(playerIds));

        testResults.push({
          test: 'Manual Relationship Query',
          status: profileError ? 'error' : 'success',
          message: profileError
            ? profileError.message
            : `Successfully linked ${matches.length} matches with ${profiles?.length || 0} profiles`,
          data: {
            matches: matches.length,
            profiles: profiles?.length || 0,
            playerIds: Array.from(playerIds),
          },
        });
      } else {
        testResults.push({
          test: 'Manual Relationship Query',
          status: 'success',
          message: 'No matches found to test relationships',
        });
      }
    } catch (err) {
      testResults.push({
        test: 'Manual Relationship Query',
        status: 'error',
        message: `Exception: ${err}`,
      });
    }

    // Test 4: Club profiles (the 406 error case)
    try {
      const { data, error } = await supabase
        .from('club_profiles')
        .select('id, club_name, user_id')
        .limit(3);

      testResults.push({
        test: 'Club Profiles Access',
        status: error ? 'error' : 'success',
        message: error
          ? `Error: ${error.message}`
          : `Found ${data?.length || 0} club profiles`,
        data: data?.slice(0, 2),
      });
    } catch (err) {
      testResults.push({
        test: 'Club Profiles Access',
        status: 'error',
        message: `Exception: ${err}`,
      });
    }

    // Test 5: Tournament matches
    try {
      const { data, error } = await supabase
        .from('tournament_matches')
        .select('id, player1_id, player2_id, tournament_id')
        .limit(3);

      testResults.push({
        test: 'Tournament Matches Access',
        status: error ? 'error' : 'success',
        message: error
          ? error.message
          : `Found ${data?.length || 0} tournament matches`,
        data: data?.slice(0, 2),
      });
    } catch (err) {
      testResults.push({
        test: 'Tournament Matches Access',
        status: 'error',
        message: `Exception: ${err}`,
      });
    }

    setResults(testResults);
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className='p-6 bg-white rounded-lg shadow-md'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold text-gray-800'>
          Database Relationship Test
        </h2>
        <button
          onClick={runTests}
          disabled={isRunning}
          className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50'
        >
          {isRunning ? 'Running...' : 'Re-run Tests'}
        </button>
      </div>

      <div className='space-y-4'>
        {results.map((result, index) => (
          <div key={index} className='border rounded-md p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <span
                className={`w-3 h-3 rounded-full ${
                  result.status === 'success'
                    ? 'bg-green-500'
                    : result.status === 'error'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                }`}
              />
              <h3 className='font-semibold'>{result.test}</h3>
            </div>
            <p
              className={`text-sm ${
                result.status === 'error' ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              {result.message}
            </p>
            {result.data && (
              <details className='mt-2'>
                <summary className='cursor-pointer text-blue-600 text-sm'>
                  Show Data
                </summary>
                <pre className='mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto'>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {results.length === 0 && !isRunning && (
        <div className='text-center text-gray-500 py-8'>
          No test results yet. Click "Re-run Tests" to start.
        </div>
      )}
    </div>
  );
};
