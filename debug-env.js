#!/usr/bin/env node

/**
 * Debug Environment Configuration Script
 * Kiểm tra và so sánh các environment variables giữa dev và production
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DEBUGGING ENVIRONMENT CONFIGURATION');
console.log('=' * 50);

// 1. Kiểm tra .env file
console.log('\n📁 Checking .env file:');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ .env file exists');
  
  // Extract Supabase config
  const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/);
  const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
  
  console.log('🔧 Supabase URL:', supabaseUrl ? supabaseUrl[1] : 'NOT FOUND');
  console.log('🗝️  Supabase Key (first 20 chars):', supabaseKey ? supabaseKey[1].substring(0, 20) + '...' : 'NOT FOUND');
} else {
  console.log('❌ .env file not found');
}

// 2. Kiểm tra client.ts hardcoded values
console.log('\n📄 Checking client.ts hardcoded values:');
const clientPath = path.join(__dirname, 'src/integrations/supabase/client.ts');
if (fs.existsSync(clientPath)) {
  const clientContent = fs.readFileSync(clientPath, 'utf8');
  
  // Extract hardcoded values
  const hardcodedUrl = clientContent.match(/https:\/\/[^']+\.supabase\.co/);
  const hardcodedKey = clientContent.match(/'eyJ[^']+'/);
  
  console.log('🔧 Hardcoded URL:', hardcodedUrl ? hardcodedUrl[0] : 'NOT FOUND');
  console.log('🗝️  Hardcoded Key (first 20 chars):', hardcodedKey ? hardcodedKey[0].substring(0, 20) + '...' : 'NOT FOUND');
} else {
  console.log('❌ client.ts file not found');
}

// 3. Kiểm tra environment variables trong runtime
console.log('\n🌍 Runtime Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL || 'undefined');
console.log('VITE_SUPABASE_ANON_KEY first 20 chars:', 
  process.env.VITE_SUPABASE_ANON_KEY ? 
  process.env.VITE_SUPABASE_ANON_KEY.substring(0, 20) + '...' : 
  'undefined'
);

// 4. Recommendations
console.log('\n💡 RECOMMENDATIONS:');
console.log('1. Ensure .env file VITE_SUPABASE_* values match your production');
console.log('2. Remove hardcoded values from client.ts if environment is set');
console.log('3. Check if keys are valid and not expired');
console.log('4. Verify Supabase project URL is correct');

console.log('\n🔧 NEXT STEPS:');
console.log('1. Run: npm run dev and check browser console');
console.log('2. Check Network tab for failed API calls');
console.log('3. Verify authentication in Supabase dashboard');
