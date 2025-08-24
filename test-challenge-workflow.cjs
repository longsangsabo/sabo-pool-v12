const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('🔧 FIXING CHALLENGE WORKFLOW - MANUAL TEST');
  console.log('='.repeat(60));

  // Lấy challenge pending gần nhất
  const { data: pendingChallenges } = await supabase
    .from('challenges')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1);

  if (!pendingChallenges || pendingChallenges.length === 0) {
    console.log('❌ Không có challenge pending để test');
    return;
  }

  const testChallenge = pendingChallenges[0];
  console.log('📝 Testing challenge:', testChallenge.id);
  console.log('   Challenger:', testChallenge.challenger_id);
  console.log('   Opponent:', testChallenge.opponent_id);
  console.log('   Current status:', testChallenge.status);

  // STEP 1: Accept challenge (simulate opponent accepting)
  console.log('\n🎯 STEP 1: ACCEPTING CHALLENGE...');
  const { data: acceptResult, error: acceptError } = await supabase
    .from('challenges')
    .update({ 
      status: 'accepted',
      updated_at: new Date().toISOString()
    })
    .eq('id', testChallenge.id)
    .select();

  if (acceptError) {
    console.log('❌ Accept error:', acceptError.message);
    return;
  } else {
    console.log('✅ Challenge accepted successfully');
  }

  // Wait a bit for triggers
  await new Promise(resolve => setTimeout(resolve, 1000));

  // STEP 2: Club approval (simulate admin approving)
  console.log('\n🏛️ STEP 2: CLUB APPROVAL...');
  const { data: approvalResult, error: approvalError } = await supabase.rpc('process_club_approval', {
    p_challenge_id: testChallenge.id,
    p_club_admin_id: testChallenge.challenger_id, // Using challenger as admin for test
    p_approved: true,
    p_admin_notes: 'Test approval - automated system test'
  });

  if (approvalError) {
    console.log('❌ Approval error:', approvalError.message);
  } else {
    console.log('✅ Club approval result:', JSON.stringify(approvalResult, null, 2));
  }

  // Wait for triggers to process
  await new Promise(resolve => setTimeout(resolve, 2000));

  // STEP 3: Check if match was created
  console.log('\n⚔️ STEP 3: CHECKING IF MATCH WAS CREATED...');
  const { data: newMatch, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .eq('challenge_id', testChallenge.id);

  if (matchError) {
    console.log('❌ Match check error:', matchError.message);
  } else if (newMatch && newMatch.length > 0) {
    console.log('✅ Match created successfully!');
    console.log('   Match ID:', newMatch[0].id);
    console.log('   Players:', newMatch[0].player1_id, 'vs', newMatch[0].player2_id);
    console.log('   Status:', newMatch[0].status);
  } else {
    console.log('⚠️ No match found - trying manual creation...');
    
    // Manual match creation
    const { data: createResult, error: createError } = await supabase.rpc('create_match_from_challenge', {
      p_challenge_id: testChallenge.id
    });
    
    if (createError) {
      console.log('❌ Manual create error:', createError.message);
    } else {
      console.log('✅ Manual match creation result:', JSON.stringify(createResult, null, 2));
    }
  }

  // STEP 4: Final verification
  console.log('\n🔍 STEP 4: FINAL VERIFICATION...');
  const { data: finalChallenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', testChallenge.id)
    .single();

  const { data: finalMatch } = await supabase
    .from('matches')
    .select('*')
    .eq('challenge_id', testChallenge.id);

  console.log('📊 FINAL STATUS:');
  console.log('   Challenge status:', finalChallenge?.status);
  console.log('   Club confirmed:', finalChallenge?.club_confirmed);
  console.log('   Match created:', finalMatch?.length > 0 ? 'YES' : 'NO');
  
  if (finalMatch && finalMatch.length > 0) {
    console.log('   Match ID:', finalMatch[0].id);
    console.log('   Match status:', finalMatch[0].status);
    
    console.log('\n🎉 SUCCESS! Challenge workflow is now complete:');
    console.log('   Challenge Created → Accepted → Club Approved → Match Created');
    console.log('\n💡 Your match should now appear in the matches section!');
  } else {
    console.log('\n❌ Workflow incomplete - match not created');
  }
})();
