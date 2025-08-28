console.log('🚨 CRITICAL FRONTEND-BACKEND MISMATCH DISCOVERED');
console.log('=' .repeat(60));

console.log('\n❌ ISSUE 1: USER ROLES SYSTEM');
console.log('Frontend expects: user_roles table with data');
console.log('Backend reality: user_roles table is EMPTY []');
console.log('Current workaround: roles stored in profiles.role field');
console.log('Impact: Role management inconsistency');

console.log('\n❌ ISSUE 2: TOURNAMENT SCHEMA MISMATCH');
console.log('Frontend expects:');
console.log('- tournaments.organizer_id (❌ MISSING)');
console.log('- tournament_registrations.status (❌ MISSING)');
console.log('');
console.log('Backend reality:');
console.log('- tournaments.created_by (✅ EXISTS)');
console.log('- tournament_registrations.registration_status (✅ EXISTS)');

console.log('\n❌ ISSUE 3: FIELD NAME INCONSISTENCIES');
console.log('Frontend code probably uses:');
console.log('- organizer_id → should be created_by');
console.log('- status → should be registration_status');

console.log('\n🔍 NEXT AUDIT STEPS:');
console.log('1. Search frontend code for these missing fields');
console.log('2. Check if there are try-catch blocks hiding these errors');
console.log('3. Verify if components are failing silently');
console.log('4. Test user registration/tournament creation flows');

console.log('\n🎯 HYPOTHESIS:');
console.log('Frontend-backend disconnect is causing:');
console.log('- Silent failures in data loading');
console.log('- Incomplete tournament creation');
console.log('- User role management issues');
console.log('- Possible authentication flow problems');

console.log('\n🚀 PROCEEDING TO CODE AUDIT...');
