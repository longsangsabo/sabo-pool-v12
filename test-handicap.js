/**
 * Test SABO Handicap Calculator
 */

import { calculateSaboHandicapPrecise, SABO_HANDICAP_CONFIGURATIONS } from './saboHandicapCalculator';

// Test cases based on the real issue
console.log('🧪 Testing SABO Handicap Calculator\n');

// Test case 1: K+ vs I (từ ảnh - này là case bị lỗi)
console.log('Test 1: K+ vs I với 100 điểm cược');
const test1 = calculateSaboHandicapPrecise('K+', 'I', 100);
console.log('Result:', test1);
console.log('Expected: K+ should get +0.5 handicap\n');

// Test case 2: K vs K+ (sub-rank trong cùng main rank)
console.log('Test 2: K vs K+ với 100 điểm cược');
const test2 = calculateSaboHandicapPrecise('K', 'K+', 100);
console.log('Result:', test2);
console.log('Expected: K should get +0.5 handicap\n');

// Test case 3: K vs I (1 main rank difference)
console.log('Test 3: K vs I với 100 điểm cược');
const test3 = calculateSaboHandicapPrecise('K', 'I', 100);
console.log('Result:', test3);
console.log('Expected: K should get +1.0 handicap\n');

// Test case 4: K vs I+ (1 main rank + 1 sub-rank)
console.log('Test 4: K vs I+ với 100 điểm cược');
const test4 = calculateSaboHandicapPrecise('K', 'I+', 100);
console.log('Result:', test4);
console.log('Expected: K should get +1.5 handicap (1.0 + 0.5)\n');

// Test case 5: K vs H (2 main ranks)
console.log('Test 5: K vs H với 100 điểm cược');
const test5 = calculateSaboHandicapPrecise('K', 'H', 100);
console.log('Result:', test5);
console.log('Expected: K should get +2.0 handicap\n');

// Test case 6: Same rank
console.log('Test 6: H vs H (cùng rank)');
const test6 = calculateSaboHandicapPrecise('H', 'H', 100);
console.log('Result:', test6);
console.log('Expected: No handicap\n');

// Test case 7: Reverse (stronger challenger)
console.log('Test 7: I vs K+ (reverse case from test 1)');
const test7 = calculateSaboHandicapPrecise('I', 'K+', 100);
console.log('Result:', test7);
console.log('Expected: K+ should get +0.5 handicap\n');

// Test với bet points cao hơn
console.log('Test 8: K+ vs I với 300 điểm cược (higher stakes)');
const test8 = calculateSaboHandicapPrecise('K+', 'I', 300);
console.log('Result:', test8);
console.log('Expected: K+ should get +1.5 handicap (300 points config)\n');

console.log('🎯 Configuration Matrix:');
SABO_HANDICAP_CONFIGURATIONS.forEach(config => {
  console.log(`${config.bet_points} điểm: Race to ${config.race_to}, 1-rank: ${config.handicap_1_rank}, 0.5-rank: ${config.handicap_05_rank}`);
});
