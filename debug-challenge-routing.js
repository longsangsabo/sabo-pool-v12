const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.ORMM0nSs8QfKYI8H04m-IfNM7NTShKWq21LqP_MpjRM'
);

async function debugChallengeRouting() {
  try {
    console.log('🔍 DEBUGGING CHALLENGE ROUTING...\n');

    // Fetch all challenges
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching challenges:', error);
      return;
    }

    console.log(`📊 Total challenges: ${challenges.length}\n`);

    // Group by status
    const byStatus = {};
    const byUser = {};

    challenges.forEach(challenge => {
      // Group by status
      if (!byStatus[challenge.status]) {
        byStatus[challenge.status] = [];
      }
      byStatus[challenge.status].push(challenge);

      // Group by challenger
      if (!byUser[challenge.challenger_id]) {
        byUser[challenge.challenger_id] = {
          challenges: [],
          name: challenge.challenger_name || 'Unknown'
        };
      }
      byUser[challenge.challenger_id].challenges.push(challenge);
    });

    console.log('📈 BREAKDOWN BY STATUS:');
    Object.keys(byStatus).forEach(status => {
      console.log(`  ${status}: ${byStatus[status].length} challenges`);
      byStatus[status].slice(0, 3).forEach(c => {
        console.log(`    - ${c.challenger_name || 'Unknown'} vs ${c.opponent_name || 'No opponent'} (${c.bet_points} SPA)`);
      });
      if (byStatus[status].length > 3) {
        console.log(`    ... and ${byStatus[status].length - 3} more`);
      }
      console.log('');
    });

    console.log('👤 TOP CHALLENGERS:');
    Object.entries(byUser)
      .sort((a, b) => b[1].challenges.length - a[1].challenges.length)
      .slice(0, 5)
      .forEach(([userId, data]) => {
        console.log(`  ${data.name}: ${data.challenges.length} challenges`);
        console.log(`    - Pending: ${data.challenges.filter(c => c.status === 'pending').length}`);
        console.log(`    - Accepted: ${data.challenges.filter(c => c.status === 'accepted').length}`);
        console.log(`    - Completed: ${data.challenges.filter(c => c.status === 'completed').length}`);
        console.log('');
      });

    // Specific routing logic check
    console.log('🎯 ROUTING LOGIC SIMULATION:');
    
    // Community Keo (pending challenges without opponent, not from self)
    const testUserId = challenges.find(c => c.challenger_name === 'Võ Long Sang')?.challenger_id;
    
    if (testUserId) {
      console.log(`\nFor user "Võ Long Sang" (${testUserId}):`);
      
      const communityKeo = challenges.filter(c => 
        !c.opponent_id && 
        c.status === 'pending' && 
        c.challenger_id !== testUserId
      );
      console.log(`  Community Keo: ${communityKeo.length} challenges`);
      
      const myDoiDoiThu = challenges.filter(c => 
        c.challenger_id === testUserId && 
        !c.opponent_id && 
        c.status === 'pending'
      );
      console.log(`  My Đợi Đối Thủ: ${myDoiDoiThu.length} challenges`);
      
      const mySapToi = challenges.filter(c => 
        (c.challenger_id === testUserId || c.opponent_id === testUserId) && 
        c.status === 'accepted' && 
        c.opponent_id
      );
      console.log(`  My Sắp Tới: ${mySapToi.length} challenges`);
      
      const myHoanThanh = challenges.filter(c => 
        (c.challenger_id === testUserId || c.opponent_id === testUserId) && 
        c.status === 'completed'
      );
      console.log(`  My Hoàn Thành: ${myHoanThanh.length} challenges`);
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugChallengeRouting();
