import { supabase } from '@/integrations/supabase/client';

// Simple test query for tournaments
export const testTournamentQuery = async (userId: string) => {
  console.log('🧪 Testing tournament query for user:', userId);
  
  try {
    // Basic query first
    const { data, error } = await supabase
      .from('tournaments')
      .select('id, name, created_at')
      .eq('created_by', userId)
      .limit(5);

    if (error) {
      console.error('❌ Basic query failed:', error);
      return { success: false, error };
    }

    console.log('✅ Basic query success:', data?.length, 'tournaments found');
    
    // Enhanced query
    const { data: fullData, error: fullError } = await supabase
      .from('tournaments')
      .select(`
        id,
        name,
        tournament_type,
        game_format,
        created_at,
        max_participants,
        tier_level
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (fullError) {
      console.error('❌ Enhanced query failed:', fullError);
      return { success: false, error: fullError };
    }

    console.log('✅ Enhanced query success:', fullData);
    return { success: true, data: fullData };

  } catch (err) {
    console.error('❌ Test query exception:', err);
    return { success: false, error: err };
  }
};

// Test function to be called from console
(window as any).testTournamentQuery = testTournamentQuery;
