console.log('🔍 DEEP DIVE FIELD MISMATCH AUDIT');
console.log('Systematic search for frontend-backend field inconsistencies');
console.log('=' .repeat(70));

console.log('\n🎯 SEARCH STRATEGY:');
console.log('1. Search for common field mismatches');
console.log('2. Check tournament-related fields');
console.log('3. Examine user/profile fields');
console.log('4. Audit registration/status fields');
console.log('5. Verify relationship fields (foreign keys)');

console.log('\n📊 TARGET FIELDS TO VERIFY:');
console.log('- organizer_id (we fixed this)');
console.log('- user_id vs created_by');
console.log('- status vs registration_status');
console.log('- tournament_id relationships');
console.log('- profile/user field consistency');
console.log('- prize-related field mappings');

console.log('\n🚀 Starting systematic component search...');
