// Simple Node.js script to test getDisplayName function
const { getDisplayName } = require('./src/types/unified-profile.ts');

console.log('🧪 Testing Display Name Function');
console.log('================================');

// Test cases
const testCases = [
  {
    name: 'Full profile with all fields',
    profile: {
      user_id: 'test-1',
      display_name: 'Preferred Name', 
      full_name: 'Full Name',
      nickname: 'Nick',
      email: 'test@example.com'
    },
    expected: 'Preferred Name'
  },
  {
    name: 'No display_name, has full_name',
    profile: {
      user_id: 'test-2',
      display_name: '',
      full_name: 'John Doe',
      email: 'john@example.com'
    },
    expected: 'John Doe'
  },
  {
    name: 'Only email available',
    profile: {
      user_id: 'test-3',
      email: 'player@example.com'
    },
    expected: 'player@example.com'
  },
  {
    name: 'Only user_id available',
    profile: {
      user_id: 'test-user-12345'
    },
    expected: 'User test-use'
  }
];

// Run tests
testCases.forEach((testCase, index) => {
  try {
    const result = getDisplayName(testCase.profile);
    const passed = result === testCase.expected;
    
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log(`   Expected: "${testCase.expected}"`);
    console.log(`   Got:      "${result}"`);
    console.log(`   Status:   ${passed ? '✅ PASS' : '❌ FAIL'}`);
  } catch (error) {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log(`   Status:   ❌ ERROR - ${error.message}`);
  }
});

console.log('\n🏁 Display Name Function Test Complete');
