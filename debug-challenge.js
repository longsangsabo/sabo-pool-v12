// Test challenge creation with detailed logging
// Run this in browser console to debug production issues

async function debugChallengeCreation() {
  console.log('🔍 Starting Challenge Creation Debug...');
  
  // Check authentication status
  const { data: authData, error: authError } = await window.supabase.auth.getSession();
  console.log('👤 Auth Status:', {
    isAuthenticated: !!authData.session,
    userId: authData.session?.user?.id,
    email: authData.session?.user?.email,
    error: authError
  });
  
  if (!authData.session) {
    console.error('❌ User not authenticated');
    return;
  }
  
  // Check current user profile
  const { data: profile, error: profileError } = await window.supabase
    .from('profiles')
    .select('*')
    .eq('user_id', authData.session.user.id)
    .single();
    
  console.log('👤 User Profile:', {
    profile,
    error: profileError
  });
  
  // Check SPA points
  const { data: ranking, error: rankingError } = await window.supabase
    .from('player_rankings')
    .select('spa_points, elo_points')
    .eq('user_id', authData.session.user.id)
    .single();
    
  console.log('📊 User Ranking:', {
    ranking,
    error: rankingError
  });
  
  // Test challenge creation
  const testChallenge = {
    challenger_id: authData.session.user.id,
    opponent_id: null, // Open challenge
    bet_points: 100,
    race_to: 5,
    message: 'Test challenge from debug script',
    status: 'pending',
    expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48h from now
    is_open_challenge: true
  };
  
  console.log('📝 Creating test challenge:', testChallenge);
  
  const { data: challengeData, error: challengeError } = await window.supabase
    .from('challenges')
    .insert([testChallenge])
    .select('*')
    .single();
    
  console.log('🎯 Challenge Creation Result:', {
    success: !!challengeData,
    data: challengeData,
    error: challengeError,
    errorDetails: challengeError ? {
      message: challengeError.message,
      code: challengeError.code,
      details: challengeError.details,
      hint: challengeError.hint
    } : null
  });
  
  if (challengeError) {
    console.error('🚨 Challenge Creation Failed:');
    console.error('Error Code:', challengeError.code);
    console.error('Error Message:', challengeError.message);
    console.error('Error Details:', challengeError.details);
    console.error('Error Hint:', challengeError.hint);
    
    // Check RLS policies
    console.log('🔒 Checking RLS policies...');
    const { data: policies, error: policyError } = await window.supabase
      .rpc('get_table_policies', { table_name: 'challenges' })
      .catch(() => ({ data: null, error: 'Function not available' }));
      
    console.log('🔒 RLS Policies:', { policies, error: policyError });
  }
  
  return {
    auth: authData,
    profile,
    ranking,
    challenge: challengeData,
    error: challengeError
  };
}

// Make function available globally
window.debugChallengeCreation = debugChallengeCreation;

console.log('✅ Debug function loaded. Run debugChallengeCreation() in console.');
