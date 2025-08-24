const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function applyRegistrationFix() {
  console.log('🔧 APPLYING REGISTRATION ERROR FIXES...');
  console.log('=' .repeat(60));
  
  try {
    // Read the SQL fix file
    const sqlContent = fs.readFileSync('./FIX_REGISTRATION_ERRORS.sql', 'utf8');
    
    // Split SQL statements (simple approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== '');
    
    console.log(`📋 Found ${statements.length} SQL statements to execute...\n`);
    
    // Apply fixes step by step
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip DO blocks and complex statements that might cause issues with rpc
      if (statement.toUpperCase().includes('DO $$') || 
          statement.toUpperCase().includes('CREATE OR REPLACE FUNCTION') ||
          statement.toUpperCase().includes('CREATE TRIGGER') ||
          statement.toUpperCase().includes('DROP TRIGGER')) {
        console.log(`⏭️  Skipping complex statement ${i + 1} (needs manual execution)`);
        continue;
      }
      
      try {
        console.log(`⚡ Executing statement ${i + 1}...`);
        
        if (statement.toUpperCase().startsWith('UPDATE')) {
          // Handle UPDATE statements
          const result = await supabase.rpc('exec_sql', { sql_query: statement });
          if (result.error) {
            throw result.error;
          }
          console.log(`   ✅ Update executed`);
        } else if (statement.toUpperCase().startsWith('SELECT')) {
          // Handle SELECT statements
          const result = await supabase.rpc('exec_sql', { sql_query: statement });
          if (result.error) {
            throw result.error;
          }
          console.log(`   ✅ Query executed`);
        } else {
          console.log(`   ⏭️  Skipped (complex statement)`);
        }
        
        successCount++;
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 EXECUTION SUMMARY:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   ⏭️  Skipped: ${statements.length - successCount - errorCount}`);
    
    // Apply manual fixes for phone numbers
    console.log(`\n🔧 APPLYING PHONE FORMAT FIXES MANUALLY...`);
    
    const phoneFixData = [
      { user_id: '3757397f-4fcf-44f1-9b64-6f00209fa427', phone: '+84362252625' },
      { user_id: 'a91de299-89d8-43b0-a3c6-0a8db9393f6c', phone: '+84705413592' },
      { user_id: '363512b8-d1ef-43e9-87b1-09fe46096d15', phone: '+84764682075' },
      { user_id: 'e9d48914-2c9b-46a3-9ce7-911df0c4819b', phone: '+84902842609' },
      { user_id: 'fcf095fe-a968-4bf9-b97f-6716b7bb8c79', phone: '+84327175839' },
      { user_id: '86361992-737a-4385-8885-168bf68abbbf', phone: '+84364823089' },
      { user_id: 'bc5545c5-0bb9-488f-b2ba-16fa373e1f5e', phone: '+84333404305' },
      { user_id: '21c71eb2-3a42-4589-9089-24a9340a0e6a', phone: '+84325607964' },
      { user_id: '28977c56-7f3a-41e2-aef8-ab6a0e8dd6ce', phone: '+84374566345' },
      { user_id: '7ac919f8-3957-4e5c-a5b8-f78d1f767b72', phone: '+84878360388' }
    ];
    
    let phoneFixCount = 0;
    for (const fix of phoneFixData) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ phone: fix.phone })
          .eq('user_id', fix.user_id);
        
        if (error) throw error;
        
        console.log(`   ✅ Fixed phone for user ${fix.user_id.substring(0, 8)}: ${fix.phone}`);
        phoneFixCount++;
      } catch (error) {
        console.log(`   ❌ Failed to fix phone for user ${fix.user_id.substring(0, 8)}: ${error.message}`);
      }
    }
    
    console.log(`\n📱 PHONE FIX RESULTS: ${phoneFixCount}/${phoneFixData.length} successful`);
    
    // Verify fixes
    console.log(`\n🔍 VERIFYING FIXES...`);
    
    const { data: verifyPhones, error: verifyError } = await supabase
      .from('profiles')
      .select('user_id, phone')
      .in('user_id', phoneFixData.map(f => f.user_id));
    
    if (verifyError) {
      console.log(`❌ Verification error: ${verifyError.message}`);
    } else {
      console.log(`✅ Verified ${verifyPhones?.length || 0} phone number fixes`);
      
      const stillBroken = verifyPhones?.filter(p => !p.phone?.startsWith('+')) || [];
      if (stillBroken.length > 0) {
        console.log(`⚠️  Still need fixing: ${stillBroken.length} phones`);
      } else {
        console.log(`🎉 All phone numbers now properly formatted!`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Critical error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 NEXT STEPS:');
  console.log('1. Manual execution needed for complex SQL in Supabase Dashboard:');
  console.log('   - Open Supabase Dashboard > SQL Editor');
  console.log('   - Run FIX_REGISTRATION_ERRORS.sql');
  console.log('   - Focus on CREATE OR REPLACE FUNCTION statements');
  console.log('');
  console.log('2. Test user registration:');
  console.log('   - Try registering with phone number');
  console.log('   - Check if profile is created correctly');
  console.log('   - Verify no more "database error saving new user"');
  console.log('');
  console.log('3. Monitor Supabase logs for any remaining errors');
}

applyRegistrationFix().catch(console.error);
