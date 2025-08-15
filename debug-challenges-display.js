// const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'bug challenges display issues
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvzc4AFttXBl3MykA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugChallenges() {
  console.log('🔍 DEBUGGING CHALLENGES DISPLAY ISSUES')
  console.log('=' .repeat(60))
  
  // 1. Check total challenges count
  console.log('\n1️⃣ Total Challenges Count:')
  const { data: allChallenges, error: allError } = await supabase
    .from('challenges')
    .select('*')
    
  console.log(`Total challenges: ${allChallenges?.length || 0}`)
  if (allError) console.log('Error:', allError)
  
  // 2. Check challenges by status
  console.log('\n2️⃣ Challenges by Status:')
  const statusCount = {}
  allChallenges?.forEach(c => {
    statusCount[c.status] = (statusCount[c.status] || 0) + 1
  })
  console.log(statusCount)
  
  // 3. Check if there are any challenges at all
  if (!allChallenges || allChallenges.length === 0) {
    console.log('\n❌ NO CHALLENGES FOUND - Creating sample data...')
    
    // Get user profiles first
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .limit(5)
      
    console.log(`Found ${profiles?.length || 0} profiles`)
    
    if (profiles && profiles.length >= 2) {
      // Create sample challenges
      const sampleChallenges = [
        {
          challenger_id: profiles[0].user_id,
          opponent_id: profiles[1].user_id,
          status: 'accepted',
          bet_points: 100,
          race_to: 5,
          challenger_score: 5,
          opponent_score: 3,
          club_id: null
        },
        {
          challenger_id: profiles[1].user_id,
          opponent_id: profiles.length > 2 ? profiles[2].user_id : profiles[0].user_id,
          status: 'pending_approval',
          bet_points: 200,
          race_to: 5,
          challenger_score: 5,
          opponent_score: 4,
          club_id: null,
          club_confirmed: false
        },
        {
          challenger_id: profiles[0].user_id,
          opponent_id: profiles[1].user_id,
          status: 'pending',
          bet_points: 50,
          race_to: 3
        }
      ]
      
      const { data: created, error: createError } = await supabase
        .from('challenges')
        .insert(sampleChallenges)
        .select()
        
      if (createError) {
        console.log('Error creating challenges:', createError)
      } else {
        console.log(`✅ Created ${created?.length || 0} sample challenges`)
      }
    }
  }
  
  // 4. Check club_profiles table
  console.log('\n3️⃣ Club Profiles Check:')
  const { data: clubs } = await supabase
    .from('club_profiles')
    .select('*')
    
  console.log(`Found ${clubs?.length || 0} clubs`)
  clubs?.forEach(club => {
    console.log(`  - Club ${club.id}: ${club.name || 'No name'} | Owner: ${club.user_id}`)
  })
  
  // 5. Test the exact query used in ClubChallengesTab
  console.log('\n4️⃣ Testing ClubChallengesTab Query:')
  const { data: tabChallenges, error: tabError } = await supabase
    .from('challenges')
    .select(`
      *,
      challenger:profiles!challenges_challenger_id_fkey(
        user_id,
        full_name,
        avatar_url
      ),
      opponent:profiles!challenges_opponent_id_fkey(
        user_id,
        full_name,
        avatar_url
      ),
      club:club_profiles(
        id,
        name,
        user_id
      )
    `)
    .order('created_at', { ascending: false })
    
  console.log(`ClubChallengesTab query results: ${tabChallenges?.length || 0} challenges`)
  if (tabError) console.log('Tab query error:', tabError)
  
  tabChallenges?.slice(0, 3).forEach(c => {
    console.log(`  - ${c.id.slice(0,8)}: ${c.challenger?.full_name || 'No name'} vs ${c.opponent?.full_name || 'No name'}`)
    console.log(`    Status: ${c.status} | Scores: ${c.challenger_score}-${c.opponent_score}`)
  })
  
  // 6. Check specific status filtering
  console.log('\n5️⃣ Testing Status Filtering:')
  const statuses = ['pending', 'accepted', 'pending_approval', 'completed']
  
  for (const status of statuses) {
    const { data: statusChallenges } = await supabase
      .from('challenges')
      .select('id, status, challenger_score, opponent_score')
      .eq('status', status)
      
    console.log(`  - ${status}: ${statusChallenges?.length || 0} challenges`)
  }
  
  // 7. Check RLS policies
  console.log('\n6️⃣ RLS Policy Check:')
  console.log('Note: RLS might be blocking data access. Check if user is authenticated.')
  
  console.log('\n✅ Debug complete!')
}

debugChallenges().catch(console.error)
