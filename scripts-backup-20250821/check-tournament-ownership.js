// Find SABO Test Tournament and check if current user is club owner
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://obgpmbmrjkllkqcrpcdp.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZ3BtYm1yamtsbGtxY3JwY2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3MDY1NDYsImV4cCI6MjA0ODI4MjU0Nn0.0VL7J5dMW10pYV8ICKB3TjRZKMPqg5Gug2a0lF3VfIM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findTournamentAndCheckOwnership() {
  try {
    // 1. Find the SABO test tournament
    const { data: tournaments, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .ilike('name', '%SABO Score Test Tournament - REAL DATA%');

    if (tournamentError) {
      console.error('❌ Error finding tournament:', tournamentError);
      return;
    }

    if (!tournaments || tournaments.length === 0) {
      console.error('❌ No SABO test tournament found');
      return;
    }

    const tournament = tournaments[0];
    console.log('🎯 Found tournament:', {
      id: tournament.id,
      name: tournament.name,
      clubId: tournament.club_id,
      createdBy: tournament.created_by
    });

    // 2. Get club information
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', tournament.club_id)
      .single();

    if (clubError) {
      console.error('❌ Error finding club:', clubError);
      return;
    }

    console.log('🏆 Club information:', {
      id: club.id,
      name: club.name,
      ownerId: club.owner_id
    });

    // 3. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Error getting current user:', userError);
      return;
    }

    console.log('👤 Current user:', {
      id: user.id,
      email: user.email
    });

    // 4. Check if current user is club owner
    const isClubOwner = club.owner_id === user.id;
    
    console.log('\n🔐 PERMISSIONS CHECK:');
    console.log('Is current user club owner?', isClubOwner ? '✅ YES' : '❌ NO');
    
    if (!isClubOwner) {
      console.log('⚠️  Current user is NOT the club owner.');
      console.log('   Tournament belongs to club owner:', club.owner_id);
      console.log('   Current user ID:', user.id);
      console.log('   You need to be the club owner to manage scores!');
    } else {
      console.log('✅ Current user IS the club owner - can manage scores!');
    }

    // 5. Get tournament URL
    console.log('\n🌐 Tournament URL:', `http://localhost:8000/tournaments/${tournament.id}`);

    return {
      tournament,
      club,
      user,
      isClubOwner
    };

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Export for use in browser console or node
if (typeof window !== 'undefined') {
  // Browser environment
  window.checkTournamentOwnership = findTournamentAndCheckOwnership;
  console.log('✅ Added checkTournamentOwnership() to window. Run it to check permissions.');
} else {
  // Node environment  
  findTournamentAndCheckOwnership();
}

export default findTournamentAndCheckOwnership;
