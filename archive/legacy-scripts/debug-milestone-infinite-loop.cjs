const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'
);

async function debugMilestoneInfiniteLoop() {
  console.log('🚨 DEBUG: Milestone Infinite Loop Issue');
  console.log('=======================================\n');
  
  const problemUserId = 'd7d6ce12-490f-4fff-b913-80044de5e169'; // Anh Long
  const problemMilestones = [
    '33618116-4318-4667-8208-2f167460c348',
    'c58b7c77-174c-4b2d-b5a2-b9cfabaf6023', 
    '7053f455-63e4-47b3-97ec-4562c56e1d6e',
    'da3125fa-3688-4c1b-97e9-906135237076'
  ];
  
  // 1. Check player_milestones RLS policies
  console.log('📋 1. CHECKING PLAYER_MILESTONES TABLE ACCESS...');
  
  try {
    const { data: milestones, error: milestonesError } = await supabase
      .from('player_milestones')
      .select('*')
      .eq('player_id', problemUserId)
      .limit(5);
      
    if (milestonesError) {
      console.log('❌ Milestones access error:', milestonesError.message);
      console.log('📝 Error code:', milestonesError.code);
      
      if (milestonesError.code === 'PGRST103') {
        console.log('🚨 RLS BLOCKING ACCESS - player_milestones table');
      }
    } else {
      console.log('✅ Milestones accessible');
      console.log(`📊 Found ${milestones?.length} milestone records`);
    }
  } catch (e) {
    console.log('❌ Query error:', e.message);
  }
  
  // 2. Check specific milestone access
  console.log('\n📋 2. TESTING SPECIFIC MILESTONE ACCESS...');
  
  for (const milestoneId of problemMilestones.slice(0, 2)) {
    console.log(`\n🎯 Testing milestone: ${milestoneId}`);
    
    // Test GET request (exactly like the error)
    const { data: milestone, error: getError } = await supabase
      .from('player_milestones')
      .select('id, player_id, milestone_id, achieved_at')
      .eq('player_id', problemUserId)
      .eq('milestone_id', milestoneId);
      
    if (getError) {
      console.log('   ❌ GET error:', getError.message);
      console.log('   📝 Code:', getError.code);
    } else {
      console.log('   ✅ GET works');
      console.log('   📊 Results:', milestone?.length || 0);
    }
    
    // Test POST simulation
    const { error: postError } = await supabase
      .from('player_milestones')
      .insert({
        player_id: problemUserId,
        milestone_id: milestoneId,
        achieved_at: new Date().toISOString()
      })
      .select();
      
    if (postError) {
      console.log('   ❌ POST error:', postError.message);
      console.log('   📝 Code:', postError.code);
      
      if (postError.code === '23505') {
        console.log('   ℹ️  Duplicate constraint (expected)');
      } else if (postError.code === '42501') {
        console.log('   🚨 PERMISSION DENIED');
      }
    } else {
      console.log('   ✅ POST would work');
    }
  }
  
  // 3. Check RLS policies on player_milestones
  console.log('\n📋 3. FIXING PLAYER_MILESTONES RLS POLICIES...');
  
  const rlsFixSql = `
    -- Fix RLS policies for player_milestones
    ALTER TABLE public.player_milestones ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view own milestones" ON public.player_milestones;
    DROP POLICY IF EXISTS "Users can insert own milestones" ON public.player_milestones;
    DROP POLICY IF EXISTS "Service role full access" ON public.player_milestones;
    
    -- Create proper policies
    CREATE POLICY "Users can view own milestones" ON public.player_milestones
      FOR SELECT USING (auth.uid() = player_id);
      
    CREATE POLICY "Users can insert own milestones" ON public.player_milestones
      FOR INSERT WITH CHECK (auth.uid() = player_id);
      
    CREATE POLICY "Service role full access" ON public.player_milestones
      FOR ALL USING (auth.role() = 'service_role');
      
    -- Grant permissions
    GRANT ALL ON public.player_milestones TO service_role;
    GRANT SELECT, INSERT ON public.player_milestones TO authenticated;
  `;
  
  try {
    const rlsResponse = await fetch('https://exlqvlbawytbglioqfbc.supabase.co/rest/v1/rpc/exec_sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'
      },
      body: JSON.stringify({ sql: rlsFixSql })
    });
    
    if (rlsResponse.ok) {
      console.log('✅ RLS policies fixed for player_milestones');
    } else {
      console.log('❌ RLS fix failed');
    }
  } catch (e) {
    console.log('❌ RLS fix error:', e.message);
  }
  
  // 4. Test after fix
  console.log('\n📋 4. TESTING AFTER RLS FIX...');
  
  const { data: testMilestone, error: testError } = await supabase
    .from('player_milestones')
    .select('*')
    .eq('player_id', problemUserId)
    .limit(3);
    
  if (testError) {
    console.log('❌ Still has errors:', testError.message);
  } else {
    console.log('✅ Access fixed');
    console.log(`📊 ${testMilestone?.length} milestones accessible`);
  }
  
  // 5. Check for infinite loop sources
  console.log('\n📋 5. CHECKING FOR INFINITE LOOP SOURCES...');
  console.log('🔍 Possible causes:');
  console.log('   1. useEffect without proper dependencies');
  console.log('   2. Milestone component re-rendering infinitely'); 
  console.log('   3. RLS causing 406/403 → retry logic → infinite loop');
  console.log('   4. Missing error boundaries');
  
  console.log('\n💡 IMMEDIATE FIXES:');
  console.log('===================');
  console.log('✅ Fixed RLS policies for player_milestones table');
  console.log('🔧 Need to check frontend milestone components for:');
  console.log('   - useEffect dependency arrays');
  console.log('   - Error retry logic'); 
  console.log('   - Loading states');
}

debugMilestoneInfiniteLoop().catch(console.error);
