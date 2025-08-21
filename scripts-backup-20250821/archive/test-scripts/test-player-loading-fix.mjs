import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

console.log('🚀 Testing Player Loading Fix...\n');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';

async function testPlayerLoading() {
  try {
    console.log('🔍 Loading players for tournament:', tournamentId);

    // Get tournament registrations
    const { data: registrations, error: regError } = await supabase
      .from('tournament_registrations')
      .select('user_id')
      .eq('tournament_id', tournamentId)
      .eq('registration_status', 'confirmed')
      .limit(16);

    if (regError) {
      console.error('❌ Registration query error:', regError);
      return false;
    }

    if (!registrations || registrations.length === 0) {
      console.log('⚠️ No confirmed registrations found');
      return false;
    }

    console.log(`📋 Found ${registrations.length} registrations`);

    // Get player profiles
    const userIds = registrations.map(r => r.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url, full_name, elo')
      .in('user_id', userIds);

    if (profileError) {
      console.error('❌ Profile query error:', profileError);
      return false;
    }

    // Create player objects with proper mapping
    const players = registrations.map(reg => {
      const profile = profiles?.find(p => p.user_id === reg.user_id);
      return {
        user_id: reg.user_id,
        full_name: profile?.display_name || profile?.full_name || 'Player',
        elo: profile?.elo || 1000,
        seed: 0
      };
    });

    console.log(`✅ Successfully loaded ${players.length} players`);
    console.log('🎯 Sample players:');
    players.slice(0, 5).forEach((p, i) => {
      console.log(`  ${i+1}. ${p.full_name} (ELO: ${p.elo})`);
    });

    return players.length === 16;

  } catch (error) {
    console.error('🚨 Error loading players:', error);
    return false;
  }
}

testPlayerLoading().then(success => {
  console.log(success ? '\n🎉 Player loading test PASSED!' : '\n❌ Player loading test FAILED!');
});
