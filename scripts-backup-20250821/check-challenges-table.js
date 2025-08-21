/**
 * Check and fix challenges table structure
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawyitbgliogfbc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkChallengesTable() {
  console.log('🔍 Checking challenges table structure...');

  try {
    // Check current table structure
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error fetching challenges:', error);
      return;
    }

    if (data && data[0]) {
      const columns = Object.keys(data[0]).sort();
      console.log('📊 Current columns:', columns);
      
      // Check for club confirmation fields
      const hasClubConfirmed = columns.includes('club_confirmed');
      const hasClubConfirmedAt = columns.includes('club_confirmed_at');
      const hasClubConfirmedBy = columns.includes('club_confirmed_by');
      const hasClubNote = columns.includes('club_note');

      console.log('\n🏆 Club confirmation fields:');
      console.log('  - club_confirmed:', hasClubConfirmed ? '✅' : '❌ Missing');
      console.log('  - club_confirmed_at:', hasClubConfirmedAt ? '✅' : '❌ Missing');
      console.log('  - club_confirmed_by:', hasClubConfirmedBy ? '✅' : '❌ Missing');
      console.log('  - club_note:', hasClubNote ? '✅' : '❌ Missing');

      // Show sample data with scores
      console.log('\n📋 Sample record:', {
        id: data[0].id,
        status: data[0].status,
        challenger_score: data[0].challenger_score,
        opponent_score: data[0].opponent_score,
        club_confirmed: data[0].club_confirmed,
        created_at: data[0].created_at
      });
    }

    // Check for challenges with scores but status = accepted
    const { data: acceptedWithScores, error: acceptedError } = await supabase
      .from('challenges')
      .select('id, status, challenger_score, opponent_score, created_at')
      .eq('status', 'accepted')
      .not('challenger_score', 'is', null)
      .not('opponent_score', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (acceptedError) {
      console.error('❌ Error checking accepted challenges:', acceptedError);
    } else {
      console.log(`\n⏳ Found ${acceptedWithScores?.length || 0} challenges with status 'accepted' + scores:`);
      acceptedWithScores?.forEach(challenge => {
        console.log(`  - ID: ${challenge.id}`);
        console.log(`    Status: ${challenge.status}`);
        console.log(`    Scores: ${challenge.challenger_score} - ${challenge.opponent_score}`);
        console.log(`    Created: ${challenge.created_at}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function addClubConfirmationColumns() {
  console.log('\n🔧 Adding club confirmation columns...');

  const queries = [
    `ALTER TABLE challenges ADD COLUMN IF NOT EXISTS club_confirmed BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE challenges ADD COLUMN IF NOT EXISTS club_confirmed_at TIMESTAMPTZ;`,
    `ALTER TABLE challenges ADD COLUMN IF NOT EXISTS club_confirmed_by UUID REFERENCES auth.users(id);`,
    `ALTER TABLE challenges ADD COLUMN IF NOT EXISTS club_note TEXT;`
  ];

  for (const query of queries) {
    try {
      const { error } = await supabase.rpc('execute_sql', { query });
      if (error) {
        console.error(`❌ Error executing query: ${query}`, error);
      } else {
        console.log(`✅ Executed: ${query.split(' ').slice(0, 6).join(' ')}...`);
      }
    } catch (error) {
      console.error(`❌ Query failed: ${query}`, error);
    }
  }
}

// Run checks
checkChallengesTable();
