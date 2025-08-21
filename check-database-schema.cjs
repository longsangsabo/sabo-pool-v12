/**
 * CHECK DATABASE SCHEMA DIRECTLY
 * Kiểm tra cấu trúc thực tế của tables spa_transactions và notifications
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseSchema() {
  console.log('🔍 CHECKING DATABASE SCHEMA DIRECTLY');
  console.log('====================================\n');

  try {
    // Check spa_transactions table structure
    console.log('1. 📊 SPA_TRANSACTIONS TABLE COLUMNS:');
    console.log('-'.repeat(40));
    
    const { data: spaTableInfo, error: spaError } = await supabase
      .from('spa_transactions')
      .select('*')
      .limit(1);

    if (spaError) {
      console.log('❌ spa_transactions error:', spaError.message);
    } else if (spaTableInfo && spaTableInfo.length > 0) {
      const columns = Object.keys(spaTableInfo[0]);
      console.log('✅ Available columns:');
      columns.forEach((col, i) => {
        console.log(`   ${i+1}. ${col}`);
      });
      console.log('\n📋 Sample record:');
      console.log(JSON.stringify(spaTableInfo[0], null, 2));
    } else {
      console.log('📋 Table is empty, checking via schema...');
    }

    console.log('\n');

    // Check notifications table structure
    console.log('2. 🔔 NOTIFICATIONS TABLE COLUMNS:');
    console.log('-'.repeat(40));
    
    const { data: notifTableInfo, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);

    if (notifError) {
      console.log('❌ notifications error:', notifError.message);
    } else if (notifTableInfo && notifTableInfo.length > 0) {
      const columns = Object.keys(notifTableInfo[0]);
      console.log('✅ Available columns:');
      columns.forEach((col, i) => {
        console.log(`   ${i+1}. ${col}`);
      });
      console.log('\n📋 Sample record:');
      console.log(JSON.stringify(notifTableInfo[0], null, 2));
    } else {
      console.log('📋 Table is empty, checking via schema...');
    }

    console.log('\n');

    // Check player_rankings table structure  
    console.log('3. 🏆 PLAYER_RANKINGS TABLE COLUMNS:');
    console.log('-'.repeat(40));
    
    const { data: rankingTableInfo, error: rankingError } = await supabase
      .from('player_rankings')
      .select('*')
      .limit(1);

    if (rankingError) {
      console.log('❌ player_rankings error:', rankingError.message);
    } else if (rankingTableInfo && rankingTableInfo.length > 0) {
      const columns = Object.keys(rankingTableInfo[0]);
      console.log('✅ Available columns:');
      columns.forEach((col, i) => {
        console.log(`   ${i+1}. ${col}`);
      });
    } else {
      console.log('📋 Table is empty');
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

checkDatabaseSchema().catch(console.error);
