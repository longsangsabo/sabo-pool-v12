import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export const LegacySPADebugger: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testSearch = async (query: string) => {
    setLoading(true);
    try {
      console.log('🔍 Testing search for:', query);
      
      const { data, error } = await supabase
        .from('legacy_spa_points')
        .select('*')
        .ilike('full_name', `%${query}%`)
        .limit(10);

      if (error) {
        console.error('❌ Error:', error);
        setResults([{ error: error.message }]);
      } else {
        console.log('✅ Results:', data);
        setResults(data || []);
      }
    } catch (err) {
      console.error('💥 Exception:', err);
      setResults([{ error: 'Exception: ' + String(err) }]);
    } finally {
      setLoading(false);
    }
  };

  const testAll = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('legacy_spa_points')
        .select('full_name, spa_points')
        .limit(5);

      if (error) {
        setResults([{ error: error.message }]);
      } else {
        setResults(data || []);
      }
    } catch (err) {
      setResults([{ error: 'Exception: ' + String(err) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-6 bg-gray-100 rounded-lg'>
      <h3 className='text-lg font-bold mb-4'>🔧 Legacy SPA Debugger</h3>
      
      <div className='space-x-2 mb-4'>
        <Button onClick={() => testSearch('ANH LONG')}>
          Test: ANH LONG
        </Button>
        <Button onClick={() => testSearch('anh long')}>
          Test: anh long
        </Button>
        <Button onClick={() => testSearch('MAGIC')}>
          Test: MAGIC
        </Button>
        <Button onClick={testAll}>
          Test: Load All
        </Button>
      </div>

      {loading && <p>Loading...</p>}

      <div className='bg-white p-4 rounded max-h-64 overflow-y-auto'>
        <strong>Results ({results.length}):</strong>
        <pre className='text-xs mt-2'>
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>

      <div className='mt-4 text-sm text-gray-600'>
        <p><strong>Debug Info:</strong></p>
        <p>• Database: {supabase.supabaseUrl}</p>
        <p>• Current time: {new Date().toISOString()}</p>
        <p>• Expected: ANH LONG MAGIC with 1000 SPA</p>
      </div>
    </div>
  );
};
