const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODk4NDk4MSwiZXhwIjoyMDM0NTYwOTgxfQ.pGOL3nPGAF77YZD2jD3Zfom0_Y1hTnOJVPQF6_5pvuc';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkTournamentsStructure() {
  console.log('=== KIỂM TRA CẤU TRÚC BẢNG TOURNAMENTS ===\n');
  
  try {
    // 1. Kiểm tra cấu trúc bảng từ information_schema
    console.log('1. CẤU TRÚC CỘT HIỆN TẠI:');
    const { data: columns, error: columnsError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'tournaments' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });
    
    if (columnsError) {
      console.error('❌ Lỗi kiểm tra cấu trúc:', columnsError);
      return;
    }
    
    columns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    console.log(`\n📊 Tổng số cột: ${columns.length}\n`);
    
    // 2. Lấy dữ liệu tournament mới nhất để kiểm tra
    console.log('2. DỮ LIỆU TOURNAMENT MỚI NHẤT:');
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (tournamentsError) {
      console.error('❌ Lỗi lấy dữ liệu:', tournamentsError);
      return;
    }
    
    if (tournaments && tournaments.length > 0) {
      const tournament = tournaments[0];
      console.log(`Tournament: ${tournament.name}`);
      console.log(`Prize Distribution: ${tournament.prize_distribution ? 'CÓ DỮ LIỆU' : '❌ RỖNG'}`);
      console.log(`Comprehensive Rewards: ${tournament.comprehensive_rewards ? JSON.stringify(tournament.comprehensive_rewards) : '❌ RỖNG'}`);
      console.log(`Physical Prizes: ${tournament.physical_prizes ? JSON.stringify(tournament.physical_prizes) : '❌ RỖNG'}`);
      console.log(`SPA Points Config: ${tournament.spa_points_config ? JSON.stringify(tournament.spa_points_config) : '❌ RỖNG'}`);
      console.log(`ELO Points Config: ${tournament.elo_points_config ? JSON.stringify(tournament.elo_points_config) : '❌ RỖNG'}`);
      
      // Kiểm tra các cột còn thiếu hoặc null
      console.log('\n3. KIỂM TRA CỘT THIẾU/NULL:');
      const nullFields = [];
      const emptyFields = [];
      
      Object.keys(tournament).forEach(key => {
        const value = tournament[key];
        if (value === null) {
          nullFields.push(key);
        } else if (value === '' || (typeof value === 'object' && Object.keys(value).length === 0)) {
          emptyFields.push(key);
        }
      });
      
      console.log(`❌ Cột NULL (${nullFields.length}):`, nullFields);
      console.log(`🔶 Cột EMPTY (${emptyFields.length}):`, emptyFields);
    }
    
    // 3. Danh sách cột cần có theo yêu cầu
    console.log('\n4. CỘT CẦN CÓ THEO YÊU CẦU:');
    const requiredColumns = [
      'prize_distribution', // JSONB - chứa full prize structure
      'min_rank_requirement', 
      'max_rank_requirement',
      'has_third_place_match',
      'comprehensive_rewards', // JSONB
      'physical_prizes', // JSONB array
      'spa_points_config', // JSONB 
      'elo_points_config', // JSONB
      'banner_image',
      'venue_name',
      'organizer_id',
      'management_status' // text
    ];
    
    const currentColumnNames = columns.map(col => col.column_name);
    const missingColumns = requiredColumns.filter(col => !currentColumnNames.includes(col));
    
    console.log('✅ Cột đã có:', requiredColumns.filter(col => currentColumnNames.includes(col)));
    console.log('❌ Cột còn thiếu:', missingColumns);
    
    if (missingColumns.length > 0) {
      console.log('\n⚠️ CẦN CHẠY SCRIPT complete-tournaments-table-setup.sql để bổ sung cột thiếu!');
    } else {
      console.log('\n✅ TẤT CẢ CỘT ĐÃ CÓ, CÓ THỂ UPDATE DỮ LIỆU PRIZE!');
    }
    
  } catch (error) {
    console.error('❌ Lỗi tổng quát:', error);
  }
}

// Chạy kiểm tra
checkTournamentsStructure();
