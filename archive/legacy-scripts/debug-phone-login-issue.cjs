#!/usr/bin/env node

/**
 * 🔍 Debug Phone Login Issue
 * 
 * Investigating the "Invalid login credentials" error when trying to login
 * with phone number 0878360388 after successful OTP registration.
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Debugging Phone Login Issue...\n');

// Check if the user exists and how they were created
console.log('📋 Analysis of the problem:');
console.log('1. User registered with phone 0878360388 via OTP');
console.log('2. Registration successful and verified');
console.log('3. When trying to login with phone + password → "Invalid credentials"');
console.log('4. Error occurs at signInWithPassword() call\n');

console.log('🤔 Possible causes:');
console.log('A. Supabase may not support signInWithPassword() with phone');
console.log('B. User created via OTP may not have a password set');
console.log('C. Phone format conversion issue (Vietnam → E.164)');
console.log('D. Account exists but password was never set during OTP flow\n');

console.log('🔧 Investigation steps:');

// Step 1: Check Supabase Auth documentation
console.log('1. Supabase Auth Methods:');
console.log('   ✅ signInWithPassword({ email, password }) - Supported');
console.log('   ❓ signInWithPassword({ phone, password }) - Need to verify');
console.log('   ✅ signInWithOtp({ phone }) - Supported');
console.log('   ✅ verifyOtp({ phone, token }) - Supported\n');

// Step 2: Analyze the registration flow
console.log('2. Registration Flow Analysis:');
console.log('   📱 User enters phone + password + name');
console.log('   🔧 signUpWithPhone(phone) called - only sends OTP');
console.log('   📝 Password stored in pendingPhoneData');
console.log('   ✅ OTP verified → User account created');
console.log('   ❓ Password from pendingPhoneData never set in Supabase!\n');

// Step 3: The root cause
console.log('🎯 ROOT CAUSE IDENTIFIED:');
console.log('❌ When user registers via OTP:');
console.log('   1. Supabase creates account with PHONE only');
console.log('   2. Password from form is NOT set in Supabase');
console.log('   3. Account exists but has NO PASSWORD');
console.log('   4. signInWithPassword() fails because no password exists\n');

// Step 4: Solutions
console.log('🛠️ SOLUTIONS:');
console.log('\n💡 Solution 1: Set password after OTP verification');
console.log('   - During OTP verification, call updateUser({ password })');
console.log('   - This sets password for the phone-created account');
console.log('   - Then signInWithPassword() will work\n');

console.log('💡 Solution 2: Use email as identifier');
console.log('   - Store email during registration');
console.log('   - Use signInWithPassword({ email, password })');
console.log('   - More reliable than phone authentication\n');

console.log('💡 Solution 3: Hybrid approach');
console.log('   - Try signInWithPassword() first');
console.log('   - If fails, fall back to OTP flow');
console.log('   - Best user experience\n');

console.log('🎯 RECOMMENDED FIX:');
console.log('Update the OTP verification process to set password:');
console.log('```typescript');
console.log('const handleOtpVerify = async (code: string) => {');
console.log('  // 1. Verify OTP first');
console.log('  const { error } = await verifyPhoneOtp(phone, code);');
console.log('  ');
console.log('  if (!error && pendingPhoneData?.password) {');
console.log('    // 2. Set password for the account');
console.log('    await supabase.auth.updateUser({');
console.log('      password: pendingPhoneData.password');
console.log('    });');
console.log('  }');
console.log('  ');
console.log('  // 3. Continue with success flow');
console.log('};');
console.log('```\n');

console.log('🧪 Testing approach:');
console.log('1. Check if user 0878360388 has password in Supabase');
console.log('2. If no password → implement Solution 1');
console.log('3. Test login flow again');
console.log('4. Verify both registration and login work\n');

console.log('📱 Phone format debugging:');
const testPhone = '0878360388';
const e164 = testPhone.startsWith('0') ? '+84' + testPhone.slice(1) : testPhone;
console.log(`Original: ${testPhone}`);
console.log(`E.164: ${e164}`);
console.log('✅ Phone format conversion looks correct\n');

console.log('🔍 Next steps:');
console.log('1. Implement password setting in OTP verification');
console.log('2. Test with existing user 0878360388');
console.log('3. Create fallback mechanism for users without password');
console.log('4. Update error handling to be more informative\n');

console.log('✨ This should resolve the login issue!');
