const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixAvatarsRLSPolicies() {
  console.log('🔧 Fixing RLS policies for avatars bucket...\n');
  
  try {
    console.log('⚠️  Note: RLS policies for storage buckets need to be set through Supabase Dashboard or SQL queries.');
    console.log('This script will provide the SQL commands you need to run.\n');
    
    console.log('🔍 Required RLS Policies for "avatars" bucket:\n');
    
    console.log('1. 📝 Allow authenticated users to INSERT (upload) files in their own folder:');
    console.log(`
-- Allow users to upload files in their own user_id folder
CREATE POLICY "Users can upload avatars in their own folder" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
);`);
    
    console.log('\n2. 📖 Allow authenticated users to SELECT (view) files in their own folder:');
    console.log(`
-- Allow users to view files in their own user_id folder
CREATE POLICY "Users can view avatars in their own folder" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'avatars' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
);`);
    
    console.log('\n3. ✏️ Allow authenticated users to UPDATE their own files:');
    console.log(`
-- Allow users to update files in their own user_id folder
CREATE POLICY "Users can update avatars in their own folder" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
);`);
    
    console.log('\n4. 🗑️ Allow authenticated users to DELETE their own files:');
    console.log(`
-- Allow users to delete files in their own user_id folder
CREATE POLICY "Users can delete avatars in their own folder" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
);`);
    
    console.log('\n5. 🌍 Allow public access to view all avatars (for displaying in app):');
    console.log(`
-- Allow anyone to view avatar files (for public display)
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');`);
    
    console.log('\n📋 HOW TO APPLY THESE POLICIES:');
    console.log('1. Go to Supabase Dashboard');
    console.log('2. Navigate to Storage > Policies'); 
    console.log('3. Create new policies or run the SQL commands in SQL Editor');
    console.log('4. Make sure RLS is enabled on the avatars bucket');
    
    console.log('\n🔧 ALTERNATIVE: Try enabling bucket-level policies first:');
    console.log('1. Go to Storage > Settings > avatars bucket');
    console.log('2. Enable "Allow public read access" if you want avatars to be publicly viewable');
    console.log('3. Set appropriate policies for upload/update/delete');
    
    // Try to check current policies (may not work with client)
    console.log('\n🔍 Current policies check (limited info):');
    try {
      // This is mostly for debugging - actual policy management needs dashboard
      const { data: bucketInfo, error } = await supabase.storage.getBucket('avatars');
      if (error) {
        console.log('❌ Cannot retrieve bucket info:', error.message);
      } else {
        console.log('📦 Bucket info:', JSON.stringify(bucketInfo, null, 2));
      }
    } catch (e) {
      console.log('⚠️  Bucket info not accessible via client');
    }
    
    console.log('\n🎯 QUICK FIX for testing:');
    console.log('If you need immediate testing capability, temporarily:');
    console.log('1. Set avatars bucket to "Public" in dashboard');
    console.log('2. Add permissive RLS policies');
    console.log('3. Tighten security later after confirming upload works');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAvatarsRLSPolicies();
