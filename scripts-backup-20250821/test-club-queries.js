// Test ClubChallengesTab query to fix foreign key relationship issue
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testQueries() {
  console.log('🔍 TESTING CLUBCHALLENGESTAB QUERIES')
  console.log('=' .repeat(60))
  
  // 1. Test basic challenges query
  console.log('\n1️⃣ Basic Challenges Query:')
  const { data: basicChallenges, error: basicError } = await supabase
    .from('challenges')
    .select('*')
    .limit(5)
    
  console.log(`Basic challenges: ${basicChallenges?.length || 0}`)
  if (basicError) console.log('Basic Error:', basicError)
  else {
    basicChallenges?.forEach(c => {
      console.log(`  - ${c.id.slice(0,8)}: Status: ${c.status}, Club: ${c.club_id}`)
    })
  }
  
  // 2. Test query with profiles only
  console.log('\n2️⃣ Query with Profiles Only:')
  const { data: profilesChallenges, error: profilesError } = await supabase
    .from('challenges')
    .select(`
      *,
      challenger_profile:profiles!challenges_challenger_id_fkey(
        user_id,
        full_name,
        avatar_url
      ),
      opponent_profile:profiles!challenges_opponent_id_fkey(
        user_id,
        full_name,
        avatar_url
      )
    `)
    .limit(3)
    
  console.log(`Profiles challenges: ${profilesChallenges?.length || 0}`)
  if (profilesError) console.log('Profiles Error:', profilesError)
  else {
    profilesChallenges?.forEach(c => {
      console.log(`  - ${c.challenger_profile?.full_name || 'No name'} vs ${c.opponent_profile?.full_name || 'No name'}`)
    })
  }
  
  // 3. Test different club relationship syntaxes
  console.log('\n3️⃣ Testing Club Relationship Syntaxes:')
  
  const syntaxTests = [
    'club_profiles!challenges_club_id_fkey',
    'club_profiles!fk_challenges_club_id', 
    'club_profiles(id, name)',
    'club_profile:club_profiles!challenges_club_id_fkey(id, name)'
  ]
  
  for (const syntax of syntaxTests) {
    console.log(`\nTesting: ${syntax}`)
    
    try {
      const { data, error } = await supabase
        .from('challenges')  
        .select(`id, status, ${syntax}`)
        .limit(1)
        
      if (error) {
        console.log(`  ❌ Error: ${error.message}`)
      } else {
        console.log(`  ✅ Success: ${data?.length || 0} results`)
      }
    } catch (err) {
      console.log(`  ❌ Exception: ${err.message}`)
    }
  }
  
  // 4. Test working query without club for now
  console.log('\n4️⃣ Working Query (No Club):')
  const { data: workingChallenges, error: workingError } = await supabase
    .from('challenges')
    .select(`
      *,
      challenger_profile:profiles!challenges_challenger_id_fkey(
        user_id,
        full_name,
        avatar_url
      ),
      opponent_profile:profiles!challenges_opponent_id_fkey(
        user_id,
        full_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    
  console.log(`Working challenges: ${workingChallenges?.length || 0}`)
  if (workingError) console.log('Working Error:', workingError)
  else {
    workingChallenges?.slice(0, 3).forEach(c => {
      console.log(`  - ${c.challenger_profile?.full_name || 'No name'} vs ${c.opponent_profile?.full_name || 'No name'} (${c.status})`)
    })
  }
  
  // 5. Check challenges by status for tabs
  console.log('\n5️⃣ Challenges by Status (for Tabs):')
  const statuses = ['pending', 'accepted', 'pending_approval', 'completed']
  
  for (const status of statuses) {
    const { data: statusChallenges } = await supabase
      .from('challenges')
      .select('id, status')
      .eq('status', status)
      
    console.log(`  - ${status}: ${statusChallenges?.length || 0} challenges`)
  }
  
  console.log('\n✅ Query testing complete!')
}

testQueries().catch(console.error)
