const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeClubProfiles() {
  try {
    console.log('🔍 Analyzing club_profiles table...');
    
    // Get existing records to see actual structure
    const { data: existing, error: selectError } = await supabase
      .from('club_profiles')
      .select('*')
      .limit(1);
      
    if (selectError) {
      console.log('❌ Error selecting:', selectError);
    } else {
      console.log('✅ Existing records structure:');
      if (existing.length > 0) {
        const fields = Object.keys(existing[0]);
        console.log('Fields:', fields);
        console.log('Sample record:', existing[0]);
      } else {
        console.log('No existing records found');
      }
    }
    
    // Try to get error details by attempting insert with minimal data
    console.log('\n🧪 Testing minimal insert...');
    
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.log('❌ No authenticated user');
      return;
    }
    
    const minimalData = {
      user_id: user.user.id,
      club_name: 'Test Club Name'
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('club_profiles')
      .insert(minimalData)
      .select();
      
    if (insertError) {
      console.log('❌ Minimal insert failed:');
      console.log('Error code:', insertError.code);
      console.log('Error message:', insertError.message);
      console.log('Error details:', insertError.details);
      
      // Parse the error details to see what fields are missing
      if (insertError.details) {
        const failingRow = insertError.details;
        console.log('\n📋 Failing row details:', failingRow);
        
        // Extract field positions from error
        const matches = failingRow.match(/\((.*?)\)/);
        if (matches) {
          const values = matches[1].split(', ');
          console.log('Values in failing row:', values);
        }
      }
    } else {
      console.log('✅ Minimal insert succeeded!');
      // Clean up
      await supabase
        .from('club_profiles')
        .delete()
        .eq('user_id', user.user.id)
        .eq('club_name', 'Test Club Name');
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

analyzeClubProfiles();
