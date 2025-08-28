const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

// Use anon key like frontend would
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testAvatarUploadAuth() {
  console.log('🔍 Testing avatar upload with authentication...\n');
  
  try {
    // 1. Test with service role key (should work)
    console.log('1. 🔑 Testing with service role (admin access):');
    const serviceSupabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Create test image blob
    const testImageData = Buffer.from('test image data');
    const testFileName = `test-user/test-avatar-${Date.now()}.jpg`;
    
    const { error: serviceError } = await serviceSupabase.storage
      .from('avatars')
      .upload(testFileName, testImageData, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    
    if (serviceError) {
      console.log('❌ Service role upload failed:', serviceError.message);
    } else {
      console.log('✅ Service role upload success');
      
      // Clean up
      await serviceSupabase.storage
        .from('avatars')
        .remove([testFileName]);
      console.log('🧹 Cleaned up test file');
    }
    
    // 2. Test without authentication (should fail with RLS)
    console.log('\n2. 🚫 Testing without authentication (should fail):');
    const { error: anonError } = await supabase.storage
      .from('avatars')
      .upload(`anon-test/test-${Date.now()}.jpg`, testImageData, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    
    if (anonError) {
      console.log('❌ Anonymous upload failed (expected):', anonError.message);
      if (anonError.message.includes('RLS')) {
        console.log('   ✅ RLS is working - this is correct behavior');
      }
    } else {
      console.log('⚠️  Anonymous upload succeeded (security issue!)');
    }
    
    // 3. Check if we have any user to simulate authenticated upload
    console.log('\n3. 👤 Checking available users for auth simulation:');
    const { data: users, error: usersError } = await serviceSupabase
      .from('profiles')
      .select('user_id, full_name, email')
      .limit(3);
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    } else if (users && users.length > 0) {
      const testUser = users[0];
      console.log(`Found test user: ${testUser.full_name || 'No name'} (${testUser.user_id})`);
      
      // 4. Test with simulated user authentication
      console.log('\n4. 🔐 Testing simulated authenticated upload:');
      
      // Try to sign in with email if available (this might not work in Node.js)
      if (testUser.email) {
        console.log(`Attempting to test user authentication flow...`);
        console.log('⚠️  Note: Full auth test requires browser environment');
      }
      
      // Check if user folder structure works with service role
      const userTestFileName = `${testUser.user_id}/test-avatar-${Date.now()}.jpg`;
      const { error: userFolderError } = await serviceSupabase.storage
        .from('avatars')
        .upload(userTestFileName, testImageData, {
          contentType: 'image/jpeg',
          upsert: true,
        });
      
      if (userFolderError) {
        console.log('❌ User folder structure failed:', userFolderError.message);
      } else {
        console.log('✅ User folder structure works');
        
        // Test getting public URL
        const { data: urlData } = serviceSupabase.storage
          .from('avatars')
          .getPublicUrl(userTestFileName);
        
        console.log(`   Public URL: ${urlData.publicUrl}`);
        
        // Clean up
        await serviceSupabase.storage
          .from('avatars')
          .remove([userTestFileName]);
        console.log('   🧹 Cleaned up user test file');
      }
    } else {
      console.log('No users found for testing');
    }
    
    // 5. Test different file types
    console.log('\n5. 📎 Testing different file types:');
    const fileTypes = [
      { type: 'image/jpeg', ext: 'jpg', name: 'JPEG' },
      { type: 'image/png', ext: 'png', name: 'PNG' },
      { type: 'image/webp', ext: 'webp', name: 'WebP' },
      { type: 'image/gif', ext: 'gif', name: 'GIF' },
      { type: 'text/plain', ext: 'txt', name: 'Text (should fail)' }
    ];
    
    for (const fileType of fileTypes) {
      const testFile = `file-type-test/test.${fileType.ext}`;
      const { error: typeError } = await serviceSupabase.storage
        .from('avatars')
        .upload(testFile, testImageData, {
          contentType: fileType.type,
          upsert: true,
        });
      
      if (typeError) {
        console.log(`❌ ${fileType.name}: ${typeError.message}`);
      } else {
        console.log(`✅ ${fileType.name}: OK`);
        // Clean up
        await serviceSupabase.storage
          .from('avatars')
          .remove([testFile]);
      }
    }
    
    console.log('\n💡 ANALYSIS:');
    console.log('- Check the error messages above to identify the specific issue');
    console.log('- Most common causes:');
    console.log('  1. RLS policies blocking uploads for authenticated users');
    console.log('  2. File type restrictions in bucket settings');
    console.log('  3. Authentication token issues in frontend');
    console.log('  4. Bucket permission/policy configuration');
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

testAvatarUploadAuth();
