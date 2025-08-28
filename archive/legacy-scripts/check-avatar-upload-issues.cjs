const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkAvatarUploadIssues() {
  console.log('🔍 Checking avatar upload issues...\n');
  
  try {
    // 1. Check storage buckets
    console.log('1. 📦 Checking available storage buckets:');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
    } else {
      console.log(`Found ${buckets?.length || 0} buckets:`);
      buckets?.forEach(bucket => {
        console.log(`  - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
      });
    }
    
    // 2. Check if 'avatars' bucket exists and its settings
    console.log('\n2. 🎯 Checking "avatars" bucket specifically:');
    const avatarsBucket = buckets?.find(b => b.name === 'avatars');
    if (avatarsBucket) {
      console.log('✅ Avatars bucket exists');
      console.log(`   Public: ${avatarsBucket.public ? 'Yes' : 'No'}`);
      console.log(`   Created: ${avatarsBucket.created_at}`);
      console.log(`   Updated: ${avatarsBucket.updated_at}`);
      
      // Try to list files in avatars bucket
      const { data: files, error: listError } = await supabase.storage
        .from('avatars')
        .list('', { limit: 5 });
        
      if (listError) {
        console.error('❌ Error listing files in avatars bucket:', listError);
      } else {
        console.log(`   Files in bucket: ${files?.length || 0}`);
        files?.forEach(file => {
          console.log(`     - ${file.name} (${file.metadata?.size} bytes)`);
        });
      }
    } else {
      console.log('❌ Avatars bucket does not exist!');
      
      // Check alternative buckets that might be used for avatars
      const alternativeBuckets = ['logo', 'evidence', 'public', 'user-content'];
      console.log('\n   Checking alternative buckets:');
      
      for (const bucketName of alternativeBuckets) {
        const altBucket = buckets?.find(b => b.name === bucketName);
        if (altBucket) {
          console.log(`   ✅ ${bucketName} bucket exists (could be used as fallback)`);
        }
      }
    }
    
    // 3. Check user profile with avatar URLs to see patterns
    console.log('\n3. 👤 Checking current avatar URLs in profiles:');
    const { data: profilesWithAvatars, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, display_name, avatar_url')
      .not('avatar_url', 'is', null)
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Error fetching profiles with avatars:', profilesError);
    } else {
      console.log(`Found ${profilesWithAvatars?.length || 0} profiles with avatars:`);
      profilesWithAvatars?.forEach(profile => {
        const name = profile.full_name || profile.display_name || `User ${profile.user_id.slice(0, 8)}`;
        console.log(`  - ${name}`);
        console.log(`    Avatar URL: ${profile.avatar_url}`);
        
        // Analyze URL pattern
        if (profile.avatar_url.includes('supabase')) {
          if (profile.avatar_url.includes('/avatars/')) {
            console.log(`    ✅ Uses 'avatars' bucket`);
          } else if (profile.avatar_url.includes('/logo/')) {
            console.log(`    📝 Uses 'logo' bucket (alternative)`);
          } else {
            console.log(`    ⚠️  Uses different bucket pattern`);
          }
        } else {
          console.log(`    ⚠️  External URL (not Supabase storage)`);
        }
      });
    }
    
    // 4. Check bucket policies for 'avatars'
    console.log('\n4. 🔒 Checking bucket policies (if accessible):');
    try {
      // Note: We can't directly check policies with client, but we can try an upload test
      const testUserId = 'test-user-id';
      const testFileName = `${testUserId}/test-avatar-${Date.now()}.txt`;
      const testContent = new Blob(['test content'], { type: 'text/plain' });
      
      const { error: testUploadError } = await supabase.storage
        .from('avatars')
        .upload(testFileName, testContent);
      
      if (testUploadError) {
        console.log('❌ Test upload failed:', testUploadError.message);
        if (testUploadError.message.includes('RLS')) {
          console.log('   🔒 Issue: RLS (Row Level Security) policy problem');
          console.log('   💡 Solution: Check if RLS policies allow uploads for authenticated users');
        }
        if (testUploadError.message.includes('Bucket not found')) {
          console.log('   📦 Issue: Bucket does not exist');
          console.log('   💡 Solution: Create "avatars" bucket in Supabase dashboard');
        }
        if (testUploadError.message.includes('permission')) {
          console.log('   🔑 Issue: Permission denied');
          console.log('   💡 Solution: Check bucket public/private settings and policies');
        }
      } else {
        console.log('✅ Test upload successful - bucket is accessible');
        
        // Clean up test file
        await supabase.storage
          .from('avatars')
          .remove([testFileName]);
      }
    } catch (error) {
      console.error('❌ Error during test upload:', error);
    }
    
    // 5. Provide solutions based on findings
    console.log('\n5. 💡 RECOMMENDED SOLUTIONS:');
    
    if (!avatarsBucket) {
      console.log('🔧 CRITICAL: Create "avatars" bucket in Supabase Dashboard');
      console.log('   - Go to Storage in Supabase Dashboard');
      console.log('   - Create new bucket named "avatars"');
      console.log('   - Set as Public bucket');
      console.log('   - Add RLS policies for authenticated users');
    }
    
    console.log('🔧 Check RLS Policies:');
    console.log('   - Ensure authenticated users can INSERT/UPDATE in avatars bucket');
    console.log('   - Policy should allow access to user_id folder structure');
    
    console.log('🔧 Frontend Error Handling:');
    console.log('   - Add better error messages in upload components');
    console.log('   - Implement fallback bucket logic');
    console.log('   - Add retry mechanism for failed uploads');
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

checkAvatarUploadIssues();
