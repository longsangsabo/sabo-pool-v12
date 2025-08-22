const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkAvatarDisplay() {
  console.log('🔍 Checking avatar display and loading issues...\n');
  
  try {
    // 1. Check users with avatar_url in database
    console.log('1. 👤 Users with avatar_url in database:');
    const { data: usersWithAvatars, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, full_name, display_name, avatar_url')
      .not('avatar_url', 'is', null);
    
    if (usersError) {
      console.error('❌ Error:', usersError);
    } else {
      console.log(`Found ${usersWithAvatars?.length || 0} users with avatar_url:`);
      usersWithAvatars?.forEach((user, index) => {
        const name = user.full_name || user.display_name || `User ${user.user_id.slice(0, 8)}`;
        console.log(`  ${index + 1}. ${name}`);
        console.log(`     Avatar URL: ${user.avatar_url}`);
        console.log(`     Length: ${user.avatar_url?.length || 0} chars`);
      });
    }
    
    // 2. Check actual files in avatars bucket
    console.log('\n2. 📁 Files in avatars bucket:');
    const { data: files, error: filesError } = await supabase
      .storage
      .from('avatars')
      .list('', { limit: 20 });
    
    if (filesError) {
      console.error('❌ Error listing files:', filesError);
    } else {
      console.log(`Found ${files?.length || 0} folders/files:`);
      
      // Get detailed info for each user folder
      for (const file of files || []) {
        if (file.name && !file.name.includes('.')) { // It's a folder (user_id)
          console.log(`\n   📂 User folder: ${file.name}`);
          
          const { data: userFiles, error: userFilesError } = await supabase
            .storage
            .from('avatars')
            .list(file.name);
          
          if (userFilesError) {
            console.error(`     ❌ Error: ${userFilesError.message}`);
          } else {
            userFiles?.forEach(userFile => {
              console.log(`     📸 ${userFile.name} (${Math.round(userFile.metadata?.size / 1024) || 0} KB)`);
              console.log(`         Last modified: ${userFile.updated_at}`);
              
              // Check if file is too large (> 1MB)
              const sizeKB = Math.round(userFile.metadata?.size / 1024) || 0;
              if (sizeKB > 1024) {
                console.log(`         ⚠️  LARGE FILE: ${sizeKB} KB (may cause loading issues)`);
              }
            });
          }
        }
      }
    }
    
    // 3. Test URL accessibility
    console.log('\n3. 🌐 Testing avatar URL accessibility:');
    if (usersWithAvatars && usersWithAvatars.length > 0) {
      for (const user of usersWithAvatars.slice(0, 3)) { // Test first 3
        const name = user.full_name || user.display_name || 'Unknown';
        console.log(`\n   Testing ${name}:`);
        console.log(`   URL: ${user.avatar_url}`);
        
        try {
          // Try to get public URL
          const publicUrl = supabase.storage
            .from('avatars')
            .getPublicUrl(user.avatar_url.split('/avatars/')[1])
            .data.publicUrl;
          
          console.log(`   Public URL: ${publicUrl}`);
          
          // Test if file exists in storage
          const fileName = user.avatar_url.split('/avatars/')[1];
          const { data, error } = await supabase.storage
            .from('avatars')
            .download(fileName);
          
          if (error) {
            console.log(`   ❌ Download test failed: ${error.message}`);
          } else {
            const sizeKB = Math.round(data.size / 1024);
            console.log(`   ✅ File accessible, Size: ${sizeKB} KB`);
            
            if (sizeKB > 500) {
              console.log(`   ⚠️  File is large (${sizeKB} KB) - may cause slow loading`);
            }
          }
        } catch (error) {
          console.log(`   ❌ Test failed: ${error.message}`);
        }
      }
    }
    
    // 4. Check for common avatar display issues
    console.log('\n4. 🔍 Common display issues check:');
    
    // Check for CORS issues (if any)
    console.log('   - CORS: Should be handled by Supabase automatically');
    
    // Check URL patterns
    usersWithAvatars?.forEach(user => {
      const url = user.avatar_url;
      const name = user.full_name || user.display_name || 'Unknown';
      
      if (!url.includes(user.user_id)) {
        console.log(`   ⚠️  ${name}: Avatar URL doesn't contain user_id`);
      }
      
      if (!url.includes('supabase')) {
        console.log(`   ⚠️  ${name}: Avatar URL might not be from Supabase storage`);
      }
      
      if (url.length > 200) {
        console.log(`   ⚠️  ${name}: Very long URL (${url.length} chars) - might be base64 data`);
      }
    });
    
    console.log('\n📊 SUMMARY:');
    console.log(`👤 Users with avatars in DB: ${usersWithAvatars?.length || 0}`);
    console.log(`📁 Files in storage: ${files?.length || 0} folders`);
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. Check if images are loading slow due to size');
    console.log('2. Verify avatar URLs are correct format');
    console.log('3. Check browser Network tab for failed requests');
    console.log('4. Consider image optimization/compression');
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

checkAvatarDisplay();
