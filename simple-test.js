// Simple JavaScript test without imports
console.log('🧪 Testing SABO Handicap Logic\n');

// RANK_VALUES mapping (copy từ saboHandicapCalculator.ts)
const RANK_VALUES = {
  'K': 1, 'K+': 2, 'I': 3, 'I+': 4, 'H': 5, 'H+': 6,
  'G': 7, 'G+': 8, 'F': 9, 'F+': 10, 'E': 11, 'E+': 12,
};

// Test case: K+ vs I (từ ảnh)
const challengerRank = 'K+'; // = 2
const opponentRank = 'I';     // = 3
const rankDiff = RANK_VALUES[opponentRank] - RANK_VALUES[challengerRank]; // 3 - 2 = 1

console.log(`Test case: ${challengerRank} vs ${opponentRank}`);
console.log(`Challenger value: ${RANK_VALUES[challengerRank]}`);
console.log(`Opponent value: ${RANK_VALUES[opponentRank]}`);
console.log(`Rank difference: ${rankDiff}`);

// Logic cũ (sai)
const oldMainRankDiff = Math.floor(Math.abs(rankDiff) / 2); // Math.floor(1/2) = 0
const oldIsSubRankDiff = Math.abs(rankDiff) % 2 === 1;       // 1 % 2 === 1 = true
console.log(`\n❌ Old logic (WRONG):`);
console.log(`Main rank diff: ${oldMainRankDiff}`);
console.log(`Is sub rank diff: ${oldIsSubRankDiff}`);
console.log(`Result: ${oldMainRankDiff > 0 ? 'Main rank handicap' : oldIsSubRankDiff ? 'Sub rank handicap (0.5)' : 'No handicap'}`);

// Logic mới (đúng)
const absRankDiff = Math.abs(rankDiff); // = 1
console.log(`\n✅ New logic (CORRECT):`);
console.log(`Absolute rank diff: ${absRankDiff}`);

let handicapResult = '';
let handicapAmount = 0;

if (absRankDiff === 0) {
  handicapResult = 'No handicap (same rank)';
} else if (absRankDiff === 1) {
  handicapResult = 'Sub-rank handicap (0.5 for 100 points)';
  handicapAmount = 0.5;
} else if (absRankDiff === 2) {
  handicapResult = 'Main rank handicap (1.0 for 100 points)';
  handicapAmount = 1.0;
} else if (absRankDiff === 3) {
  handicapResult = 'Main + sub rank handicap (1.5 for 100 points)';
  handicapAmount = 1.5;
} else if (absRankDiff === 4) {
  handicapResult = '2 main ranks handicap (2.0 for 100 points)';
  handicapAmount = 2.0;
}

console.log(`Result: ${handicapResult}`);
console.log(`Handicap amount: ${handicapAmount}`);
console.log(`Who gets handicap: ${rankDiff > 0 ? 'Challenger (K+)' : 'Opponent (I)'}`);

console.log('\n📊 More test cases:');

const testCases = [
  ['K', 'K+'],   // 1 vs 2 = 1 diff => sub-rank
  ['K', 'I'],    // 1 vs 3 = 2 diff => 1 main rank  
  ['K', 'I+'],   // 1 vs 4 = 3 diff => 1 main + 1 sub
  ['K', 'H'],    // 1 vs 5 = 4 diff => 2 main ranks
  ['H', 'H+'],   // 5 vs 6 = 1 diff => sub-rank
  ['H', 'G'],    // 5 vs 7 = 2 diff => 1 main rank
];

testCases.forEach(([c, o]) => {
  const diff = Math.abs(RANK_VALUES[o] - RANK_VALUES[c]);
  let type = '';
  if (diff === 0) type = 'Same';
  else if (diff === 1) type = '0.5 sub-rank';
  else if (diff === 2) type = '1 main rank';
  else if (diff === 3) type = '1 main + 0.5 sub';
  else if (diff === 4) type = '2 main ranks';
  
  console.log(`${c} vs ${o}: diff=${diff} => ${type}`);
});
