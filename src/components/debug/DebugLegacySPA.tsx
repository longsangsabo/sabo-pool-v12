import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Debug component để test Legacy SPA data
export const DebugLegacySPA = () => {
  useEffect(() => {
    const testLegacyData = async () => {
      console.log('🔍 Testing Legacy SPA Data...');
      
      // Test 1: Check legacy_spa_points table
      try {
        const { data: legacyData, error: legacyError } = await supabase
          .from('legacy_spa_points')
          .select('*')
          .limit(5);
        
        console.log('✅ Legacy table data:', legacyData);
        console.log('❌ Legacy table error:', legacyError);
      } catch (error) {
        console.log('🚨 Legacy table access failed:', error);
      }

      // Test 2: Check public_spa_leaderboard view
      try {
        const { data: viewData, error: viewError } = await supabase
          .from('public_spa_leaderboard')
          .select('*')
          .limit(5);
        
        console.log('✅ View data:', viewData);
        console.log('❌ View error:', viewError);
      } catch (error) {
        console.log('🚨 View access failed:', error);
      }

      // Test 3: Try direct SQL
      try {
        const { data: sqlData, error: sqlError } = await supabase
          .rpc('sql', { 
            query: 'SELECT COUNT(*) as count FROM legacy_spa_points' 
          });
        
        console.log('✅ SQL count:', sqlData);
        console.log('❌ SQL error:', sqlError);
      } catch (error) {
        console.log('🚨 SQL failed:', error);
      }
    };

    testLegacyData();
  }, []);

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
      <h3 className="font-bold">Debug Legacy SPA</h3>
      <p>Check console for debug info...</p>
    </div>
  );
};
