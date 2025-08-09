/**
 * Authentication Test Script
 * Test Supabase authentication directly
 */

import { supabase } from '../integrations/supabase/client';

export const testAuth = async () => {
  console.log('🧪 ===== AUTHENTICATION TEST =====');

  try {
    // 1. Test Supabase connection
    console.log('1️⃣ Testing Supabase connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
      .limit(1);

    if (healthError) {
      console.error('❌ Supabase connection failed:', healthError);
      return { success: false, error: healthError };
    }

    console.log('✅ Supabase connection successful');

    // 2. Test current session
    console.log('2️⃣ Checking current session...');
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ Session check failed:', sessionError);
      return { success: false, error: sessionError };
    }

    if (session.session) {
      console.log('✅ User is authenticated:', session.session.user.email);

      // 3. Test profile access
      console.log('3️⃣ Testing profile access...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.session.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile access failed:', profileError);
        return { success: false, error: profileError };
      }

      console.log('✅ Profile access successful:', profile);
      return { success: true, user: session.session.user, profile };
    } else {
      console.log('⚠️ No active session found');
      return { success: true, authenticated: false };
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error };
  }
};

// Auto-run test in development
if (import.meta.env.DEV) {
  setTimeout(() => {
    testAuth().then(result => {
      console.log('🧪 Test completed:', result);
    });
  }, 2000);
}
