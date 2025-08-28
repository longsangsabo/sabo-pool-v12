console.log('🔧 KIỂM TRA VÀ SỬA LỖI TÍNH TOÁN PHẦN THƯỞNG');
console.log('=' .repeat(60));

// Simulate the actual calculation from tournamentRewards.ts
function calculatePrizeDistribution(totalPrize) {
  const prizeDistribution16 = {
    1: Math.floor(totalPrize * 0.4), // 40%
    2: Math.floor(totalPrize * 0.24), // 24%
    3: Math.floor(totalPrize * 0.16), // 16%
    4: Math.floor(totalPrize * 0.08), // 8%
    5: Math.floor(totalPrize * 0.04), // 4%
    6: Math.floor(totalPrize * 0.04), // 4%
    7: Math.floor(totalPrize * 0.02), // 2%
    8: Math.floor(totalPrize * 0.02), // 2%
    9: Math.floor(totalPrize * 0.01125), // 1.125%
    10: Math.floor(totalPrize * 0.01125), // 1.125%
    11: Math.floor(totalPrize * 0.01125), // 1.125%
    12: Math.floor(totalPrize * 0.01125), // 1.125%
    13: Math.floor(totalPrize * 0.005625), // 0.5625%
    14: Math.floor(totalPrize * 0.005625), // 0.5625%
    15: Math.floor(totalPrize * 0.005625), // 0.5625%
    16: Math.floor(totalPrize * 0.005625), // 0.5625%
  };
  
  return prizeDistribution16;
}

// Test với các prize pools khác nhau
const testCases = [
  { name: 'Small Tournament', prizePool: 1000000 }, // 1M
  { name: 'Medium Tournament', prizePool: 2500000 }, // 2.5M  
  { name: 'Large Tournament', prizePool: 5000000 }, // 5M
  { name: 'Mega Tournament', prizePool: 10000000 }, // 10M
];

testCases.forEach(testCase => {
  console.log(`\n🏆 ${testCase.name} (${(testCase.prizePool / 1000000).toFixed(1)}M VND):`);
  
  const distribution = calculatePrizeDistribution(testCase.prizePool);
  let totalDistributed = 0;
  
  // Show top positions
  for (let i = 1; i <= 16; i++) {
    const amount = distribution[i];
    totalDistributed += amount;
    
    if (i <= 4 || i === 16) { // Show top 4 and last position
      const percentage = ((amount / testCase.prizePool) * 100).toFixed(3);
      console.log(`  Position ${i}: ${amount.toLocaleString()} VND (${percentage}%)`);
    } else if (i === 5) {
      console.log(`  Positions 5-15: ... (see details if needed)`);
    }
  }
  
  const distributionRate = ((totalDistributed / testCase.prizePool) * 100).toFixed(2);
  const leftover = testCase.prizePool - totalDistributed;
  
  console.log(`  📊 Total Distributed: ${totalDistributed.toLocaleString()} VND`);
  console.log(`  📈 Distribution Rate: ${distributionRate}%`);
  console.log(`  💰 Leftover: ${leftover.toLocaleString()} VND`);
  
  // Check if there's significant leftover
  if (leftover > testCase.prizePool * 0.01) { // More than 1%
    console.log(`  ⚠️  WARNING: Significant leftover money!`);
  } else {
    console.log(`  ✅ Distribution is good`);
  }
});

// Test phân tích chi tiết cho tournament 2.5M
console.log('\n🔍 DETAILED ANALYSIS - 2.5M Tournament:');
const detailedPrize = 2500000;
const detailed = calculatePrizeDistribution(detailedPrize);

console.log('\nPosition | Percentage | Amount (VND) | Amount (K)');
console.log('-'.repeat(50));

const percentages = {
  1: 0.4, 2: 0.24, 3: 0.16, 4: 0.08,
  5: 0.04, 6: 0.04, 7: 0.02, 8: 0.02,
  9: 0.01125, 10: 0.01125, 11: 0.01125, 12: 0.01125,
  13: 0.005625, 14: 0.005625, 15: 0.005625, 16: 0.005625
};

let runningTotal = 0;
for (let i = 1; i <= 16; i++) {
  const amount = detailed[i];
  const percentage = percentages[i];
  const amountK = (amount / 1000).toFixed(0);
  runningTotal += amount;
  
  console.log(`${i.toString().padStart(8)} | ${(percentage * 100).toFixed(3).padStart(10)}% | ${amount.toString().padStart(12)} | ${amountK.padStart(8)}K`);
}

console.log('-'.repeat(50));
console.log(`Total    |            | ${runningTotal.toString().padStart(12)} | ${(runningTotal/1000).toFixed(0).padStart(8)}K`);
console.log(`Expected |            | ${detailedPrize.toString().padStart(12)} | ${(detailedPrize/1000).toFixed(0).padStart(8)}K`);
console.log(`Leftover |            | ${(detailedPrize - runningTotal).toString().padStart(12)} | ${((detailedPrize - runningTotal)/1000).toFixed(0).padStart(8)}K`);

// Percentage analysis
console.log('\n📊 PERCENTAGE VERIFICATION:');
const theoreticalTotal = Object.values(percentages).reduce((sum, p) => sum + p, 0);
console.log(`Theoretical total percentage: ${(theoreticalTotal * 100).toFixed(3)}%`);
console.log(`Actual distribution rate: ${((runningTotal / detailedPrize) * 100).toFixed(3)}%`);

if (theoreticalTotal > 1.0) {
  console.log('❌ ERROR: Percentages add up to more than 100%!');
  console.log('🔧 SOLUTION: Reduce percentages or use different rounding method');
} else {
  console.log('✅ Percentages are within acceptable range');
}

// Solution proposal
console.log('\n💡 PROPOSED SOLUTIONS:');
console.log('1. ADJUST PERCENTAGES: Reduce some percentages to ensure total ≤ 100%');
console.log('2. DIFFERENT ROUNDING: Use Math.round() instead of Math.floor()');
console.log('3. PROPORTIONAL ADJUSTMENT: Scale all amounts to exactly match prize pool');

// Test solution 2: Different rounding
console.log('\n🧪 TESTING SOLUTION 2 - Math.round():');
function calculateWithRounding(totalPrize) {
  const distribution = {
    1: Math.round(totalPrize * 0.4),
    2: Math.round(totalPrize * 0.24), 
    3: Math.round(totalPrize * 0.16),
    4: Math.round(totalPrize * 0.08),
    5: Math.round(totalPrize * 0.04),
    6: Math.round(totalPrize * 0.04),
    7: Math.round(totalPrize * 0.02),
    8: Math.round(totalPrize * 0.02),
    9: Math.round(totalPrize * 0.01125),
    10: Math.round(totalPrize * 0.01125),
    11: Math.round(totalPrize * 0.01125),
    12: Math.round(totalPrize * 0.01125),
    13: Math.round(totalPrize * 0.005625),
    14: Math.round(totalPrize * 0.005625),
    15: Math.round(totalPrize * 0.005625),
    16: Math.round(totalPrize * 0.005625),
  };
  
  return distribution;
}

const roundedDistribution = calculateWithRounding(detailedPrize);
const roundedTotal = Object.values(roundedDistribution).reduce((sum, amount) => sum + amount, 0);
const roundedLeftover = detailedPrize - roundedTotal;

console.log(`With Math.round():`);
console.log(`  Total distributed: ${roundedTotal.toLocaleString()} VND`);
console.log(`  Leftover: ${roundedLeftover.toLocaleString()} VND`);
console.log(`  Distribution rate: ${((roundedTotal / detailedPrize) * 100).toFixed(3)}%`);

if (Math.abs(roundedLeftover) < Math.abs(detailedPrize - runningTotal)) {
  console.log('✅ Math.round() is BETTER!');
} else {
  console.log('❌ Math.round() is not better');
}

console.log('\n🎯 RECOMMENDATION:');
console.log('Use Math.round() instead of Math.floor() for better distribution accuracy');

console.log('\n' + '=' .repeat(60));
