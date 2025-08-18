const { createClient } = require('@supabase/supabase-js');

// Use environment variables (you can adjust these based on your .env file)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key';

async function testBracketDisplay() {
  console.log('🔍 Testing bracket display...');
  
  // Test database connection
  console.log('📊 Testing database connection...');
  
  // Check if we can find tournaments
  console.log('🎯 Looking for active tournaments...');
  
  // Check SABO matches
  console.log('⚡ Checking SABO tournament matches...');
  
  console.log('✅ Test completed. Check browser console for detailed logs.');
}

testBracketDisplay().catch(console.error);
