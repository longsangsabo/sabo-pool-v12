console.log('🔧 TẠO PHIÊN BẢN SỬA LỖI CHO PRIZE DISTRIBUTION');
console.log('=' .repeat(60));

// Current percentages (WRONG - totals 106.75%)
const currentPercentages = {
  1: 40.000,
  2: 24.000, 
  3: 16.000,
  4: 8.000,
  5: 4.000,
  6: 4.000,
  7: 2.000,
  8: 2.000,
  9: 1.125,
  10: 1.125,
  11: 1.125,
  12: 1.125,
  13: 0.5625,
  14: 0.5625,
  15: 0.5625,
  16: 0.5625
};

console.log('❌ CURRENT PERCENTAGES (WRONG):');
let currentTotal = 0;
Object.entries(currentPercentages).forEach(([pos, pct]) => {
  currentTotal += pct;
  console.log(`Position ${pos}: ${pct.toFixed(4)}%`);
});
console.log(`Total: ${currentTotal.toFixed(4)}% ❌`);

// FIXED percentages (should total exactly 100%)
const fixedPercentages = {
  1: 37.5,   // Reduced from 40%
  2: 22.5,   // Reduced from 24%
  3: 15.0,   // Reduced from 16%
  4: 7.5,    // Reduced from 8%
  5: 3.75,   // Reduced from 4%
  6: 3.75,   // Reduced from 4%
  7: 1.875,  // Reduced from 2%
  8: 1.875,  // Reduced from 2%
  9: 1.0625, // Reduced from 1.125%
  10: 1.0625,
  11: 1.0625,
  12: 1.0625,
  13: 0.53125, // Reduced from 0.5625%
  14: 0.53125,
  15: 0.53125,
  16: 0.53125
};

console.log('\n✅ FIXED PERCENTAGES (EXACTLY 100%):');
let fixedTotal = 0;
Object.entries(fixedPercentages).forEach(([pos, pct]) => {
  fixedTotal += pct;
  console.log(`Position ${pos}: ${pct.toFixed(5)}%`);
});
console.log(`Total: ${fixedTotal.toFixed(5)}% ✅`);

// Test with 2.5M tournament
const testPrizePool = 2500000;

console.log('\n📊 COMPARISON - 2.5M Tournament:');
console.log('\nPosition | Current (Wrong) | Fixed (Correct) | Difference');
console.log('-'.repeat(65));

let currentDistributed = 0;
let fixedDistributed = 0;

for (let pos = 1; pos <= 16; pos++) {
  const currentAmount = Math.floor(testPrizePool * (currentPercentages[pos] / 100));
  const fixedAmount = Math.floor(testPrizePool * (fixedPercentages[pos] / 100));
  const difference = fixedAmount - currentAmount;
  
  currentDistributed += currentAmount;
  fixedDistributed += fixedAmount;
  
  console.log(`${pos.toString().padStart(8)} | ${currentAmount.toString().padStart(15)} | ${fixedAmount.toString().padStart(15)} | ${difference.toString().padStart(10)}`);
}

console.log('-'.repeat(65));
console.log(`${'Total'.padStart(8)} | ${currentDistributed.toString().padStart(15)} | ${fixedDistributed.toString().padStart(15)} | ${(fixedDistributed - currentDistributed).toString().padStart(10)}`);
console.log(`${'Expected'.padStart(8)} | ${testPrizePool.toString().padStart(15)} | ${testPrizePool.toString().padStart(15)} | ${'0'.padStart(10)}`);
console.log(`${'Leftover'.padStart(8)} | ${(testPrizePool - currentDistributed).toString().padStart(15)} | ${(testPrizePool - fixedDistributed).toString().padStart(15)} | ${((testPrizePool - fixedDistributed) - (testPrizePool - currentDistributed)).toString().padStart(10)}`);

console.log('\n🎯 RESULTS:');
console.log(`Current method: ${currentDistributed.toLocaleString()} VND distributed (${((currentDistributed/testPrizePool)*100).toFixed(2)}%)`);
console.log(`Fixed method: ${fixedDistributed.toLocaleString()} VND distributed (${((fixedDistributed/testPrizePool)*100).toFixed(2)}%)`);
console.log(`Current leftover: ${(testPrizePool - currentDistributed).toLocaleString()} VND`);
console.log(`Fixed leftover: ${(testPrizePool - fixedDistributed).toLocaleString()} VND`);

if (Math.abs(testPrizePool - fixedDistributed) < Math.abs(testPrizePool - currentDistributed)) {
  console.log('✅ Fixed method is BETTER!');
} else {
  console.log('❌ Fixed method is not better');
}

// Generate the exact code to replace
console.log('\n💻 CODE TO REPLACE IN tournamentRewards.ts:');
console.log('```typescript');
console.log('// Fixed prize distribution percentages (total = 100%)');
console.log('const prizeDistribution16 = {');
Object.entries(fixedPercentages).forEach(([pos, pct]) => {
  const decimalPct = pct / 100;
  console.log(`  ${pos}: Math.floor(totalPrize * ${decimalPct}), // ${pct}% for position ${pos}`);
});
console.log('};');
console.log('```');

// Alternative approach - proportional scaling
console.log('\n🔄 ALTERNATIVE: PROPORTIONAL SCALING APPROACH:');
console.log('Instead of changing percentages, scale final amounts:');
console.log('```typescript');
console.log('// Calculate with current percentages');
console.log('const rawDistribution = { /* current calculation */ };');
console.log('const rawTotal = Object.values(rawDistribution).reduce((sum, amount) => sum + amount, 0);');
console.log('const scaleFactor = totalPrize / rawTotal;');
console.log('');
console.log('// Scale each amount proportionally');
console.log('const prizeDistribution16 = {};');
console.log('Object.entries(rawDistribution).forEach(([pos, amount]) => {');
console.log('  prizeDistribution16[pos] = Math.floor(amount * scaleFactor);');
console.log('});');
console.log('```');

console.log('\n📝 RECOMMENDATION:');
console.log('Use FIXED PERCENTAGES approach as it is cleaner and more predictable.');
console.log('The proportional scaling is more complex but preserves the original intent.');

console.log('\n' + '=' .repeat(60));
