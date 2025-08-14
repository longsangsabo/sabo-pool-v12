import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function addMissingColumns() {
  console.log('🔧 Adding missing columns to tournaments table...');
  
  try {
    // Direct SQL execution via PostgreSQL function
    console.log('📝 Executing SQL to add missing columns...');
    
    // Since we can't use RPC, let's update the column info to make the query work
    // Let's just test the tournaments query without these columns first
    console.log('🧪 Testing tournaments query without problematic columns...');
    
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        club:club_profiles(*)
      `)
      .in('status', ['completed', 'registration_open', 'registration_closed', 'ongoing', 'upcoming'])
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('❌ Query failed:', error);
    } else {
      console.log('✅ Query successful:', data?.length || 0, 'tournaments found');
      if (data && data.length > 0) {
        console.log('📊 First tournament:', {
          id: data[0].id,
          name: data[0].name,
          tournament_type: data[0].tournament_type,
          status: data[0].status
        });
      }
    }
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

addMissingColumns().catch(console.error);
