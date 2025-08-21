// Kiểm tra cấu trúc table tournaments
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTournamentStructure() {
  console.log('🔍 Kiểm tra cấu trúc table tournaments...');
  
  // Lấy một tournament mẫu để xem structure
  const { data: tournaments, error } = await supabase
    .from('tournaments')
    .select('*')
    .limit(1);
    
  if (error) {
    console.log('❌ Lỗi:', error.message);
    return;
  }
  
  if (tournaments && tournaments.length > 0) {
    console.log('✅ Columns có sẵn trong tournaments table:');
    console.log(Object.keys(tournaments[0]));
    console.log('\nSample tournament:', tournaments[0]);
  } else {
    console.log('⚠️ Không có tournaments nào');
  }
  
  // Kiểm tra có SABO tournaments không
  const { data: saboTournaments, error: saboError } = await supabase
    .from('tournaments')
    .select('*')
    .ilike('tournament_type', '%sabo%')
    .limit(3);
    
  if (saboError) {
    console.log('❌ Lỗi tìm SABO tournaments:', saboError.message);
  } else {
    console.log(`\n🏆 SABO tournaments hiện có: ${saboTournaments?.length || 0}`);
    if (saboTournaments?.length > 0) {
      saboTournaments.forEach(t => {
        console.log(`  - ${t.name} (${t.status}) - ID: ${t.id}`);
      });
    }
  }
}

checkTournamentStructure().catch(console.error);
