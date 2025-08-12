// Simple Supabase connection test
// Run this in browser console: copy and paste this entire script

(async () => {
  console.log('🚀 Testing Supabase connection...');
  
  try {
    // Test 1: Check if supabase client exists
    if (typeof window.supabase === 'undefined') {
      console.log('❌ Supabase client not found in window');
      return;
    }
    
    console.log('✅ Supabase client found');
    
    // Test 2: Check authentication
    const { data: { user }, error: authError } = await window.supabase.auth.getUser();
    if (authError) {
      console.error('❌ Auth error:', authError);
      return;
    }
    
    if (!user) {
      console.error('❌ User not authenticated');
      return;
    }
    
    console.log('✅ User authenticated:', user.id);
    
    // Test 3: List storage buckets
    const { data: buckets, error: bucketsError } = await window.supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('❌ Storage buckets error:', bucketsError);
      return;
    }
    
    console.log('✅ Available buckets:', buckets);
    
    // Test 4: Check avatars bucket
    const avatarsBucket = buckets?.find(b => b.name === 'avatars');
    if (!avatarsBucket) {
      console.error('❌ Avatars bucket not found!');
      return;
    }
    
    console.log('✅ Avatars bucket found:', avatarsBucket);
    
    // Test 5: Try to list files in user folder
    const { data: files, error: filesError } = await window.supabase.storage
      .from('avatars')
      .list(user.id, { limit: 1 });
      
    if (filesError) {
      console.error('❌ Cannot access user folder:', filesError);
    } else {
      console.log('✅ User folder accessible:', files);
    }
    
    console.log('🎯 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
})();
