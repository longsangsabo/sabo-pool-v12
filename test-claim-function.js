// Test script to deploy function and update claim code via Supabase client
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nvqyvgtumafaemkzewim.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cXl2Z3R1bWFmYWVta3pld2ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDQ0NjI2OSwiZXhwIjoyMDQ2MDIyMjY5fQ.cYHBFhkkGqKhOAZXaW39w8bw8vdh4LKgSEZpEPTgME0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAndUpdateClaim() {
  console.log('🔍 Checking ANH LONG MAGIC record...')
  
  // Check current record
  const { data: currentData, error: checkError } = await supabase
    .from('legacy_spa_points')
    .select('*')
    .eq('full_name', 'ANH LONG MAGIC')
    .single()
  
  if (checkError) {
    console.error('❌ Error checking record:', checkError)
    return
  }
  
  console.log('📄 Current record:', currentData)
  
  // Update with claim code if needed
  if (!currentData.claim_code) {
    console.log('🔧 Adding claim code...')
    const { data: updateData, error: updateError } = await supabase
      .from('legacy_spa_points')
      .update({ claim_code: 'LEGACY-46-ANH' })
      .eq('full_name', 'ANH LONG MAGIC')
      .select()
    
    if (updateError) {
      console.error('❌ Error updating:', updateError)
    } else {
      console.log('✅ Updated successfully:', updateData)
    }
  }
  
  // Test the function
  console.log('🧪 Testing claim function...')
  const { data: claimResult, error: claimError } = await supabase.rpc('claim_legacy_spa_points', {
    p_claim_code: 'LEGACY-46-ANH',
    p_user_id: '550e8400-e29b-41d4-a716-446655440000', // Test UUID
    p_user_email: 'test@example.com'
  })
  
  if (claimError) {
    console.error('❌ Function error:', claimError)
  } else {
    console.log('✅ Function result:', claimResult)
  }
}

testAndUpdateClaim().catch(console.error)
