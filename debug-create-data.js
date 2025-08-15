// Debug challenges display issues with service role key
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugChallenges() {
  console.log('🔍 DEBUGGING CHALLENGES DISPLAY WITH SERVICE ROLE')
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
  
  // 3. Check profiles count
  console.log('\n3️⃣ Profiles Check:')
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    
  console.log(`Total profiles: ${profiles?.length || 0}`)
  if (profilesError) console.log('Profiles Error:', profilesError)
  
  // 4. Check club_profiles count  
  console.log('\n4️⃣ Club Profiles Check:')
  const { data: clubs, error: clubsError } = await supabase
    .from('club_profiles')
    .select('*')
    
  console.log(`Total clubs: ${clubs?.length || 0}`)
  if (clubsError) console.log('Clubs Error:', clubsError)
  
  // 5. If no data, create sample data
  if (!allChallenges || allChallenges.length === 0) {
    console.log('\n❌ NO CHALLENGES FOUND - Creating sample data...')
    
    // Create sample profiles if none exist
    if (!profiles || profiles.length === 0) {
      console.log('Creating sample profiles...')
      
      const sampleProfiles = [
        { user_id: crypto.randomUUID(), full_name: 'Nguyễn Văn Anh' },
        { user_id: crypto.randomUUID(), full_name: 'Trần Thị Bảo' },
        { user_id: crypto.randomUUID(), full_name: 'Lê Minh Cường' },
        { user_id: crypto.randomUUID(), full_name: 'Phạm Thu Dung' }
      ]
      
      const { data: createdProfiles, error: createProfilesError } = await supabase
        .from('profiles')
        .insert(sampleProfiles)
        .select()
        
      if (createProfilesError) {
        console.log('Error creating profiles:', createProfilesError)
      } else {
        console.log(`✅ Created ${createdProfiles?.length || 0} profiles`)
      }
    }
    
    // Get updated profiles for challenges
    const { data: updatedProfiles } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .limit(4)
      
    if (updatedProfiles && updatedProfiles.length >= 2) {
      console.log('Creating sample challenges...')
      
      const sampleChallenges = [
        {
          id: crypto.randomUUID(),
          challenger_id: updatedProfiles[0].user_id,
          opponent_id: updatedProfiles[1].user_id,
          status: 'pending',
          bet_points: 100,
          race_to: 5
        },
        {
          id: crypto.randomUUID(),
          challenger_id: updatedProfiles[1].user_id,
          opponent_id: updatedProfiles.length > 2 ? updatedProfiles[2].user_id : updatedProfiles[0].user_id,
          status: 'accepted',
          bet_points: 150,
          race_to: 5,
          challenger_score: 5,
          opponent_score: 3
        },
        {
          id: crypto.randomUUID(),
          challenger_id: updatedProfiles[0].user_id,
          opponent_id: updatedProfiles[1].user_id,
          status: 'pending_approval',
          bet_points: 200,
          race_to: 5,
          challenger_score: 5,
          opponent_score: 4,
          club_confirmed: false
        },
        {
          id: crypto.randomUUID(),
          challenger_id: updatedProfiles[1].user_id,
          opponent_id: updatedProfiles.length > 2 ? updatedProfiles[2].user_id : updatedProfiles[0].user_id,
          status: 'completed',
          bet_points: 300,
          race_to: 5,
          challenger_score: 5,
          opponent_score: 2,
          club_confirmed: true
        }
      ]
      
      const { data: createdChallenges, error: createChallengesError } = await supabase
        .from('challenges')
        .insert(sampleChallenges)
        .select()
        
      if (createChallengesError) {
        console.log('Error creating challenges:', createChallengesError)
      } else {
        console.log(`✅ Created ${createdChallenges?.length || 0} challenges`)
      }
    }
  }
  
  // 6. Test ClubChallengesTab query
  console.log('\n5️⃣ Testing ClubChallengesTab Query:')
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
  
  // Show sample challenges
  tabChallenges?.slice(0, 5).forEach(c => {
    console.log(`  - ${c.id.slice(0,8)}: ${c.challenger?.full_name || 'No name'} vs ${c.opponent?.full_name || 'No name'}`)
    console.log(`    Status: ${c.status} | Scores: ${c.challenger_score}-${c.opponent_score}`)
  })
  
  console.log('\n✅ Debug complete! Now refresh the app and check all tabs.')
}

debugChallenges().catch(console.error)
