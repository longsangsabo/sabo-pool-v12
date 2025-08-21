// Debug prize template generation - SIMPLE TEST
console.log('🎯 Testing prize template generation...');

const generatePrizeTemplate = (prizePool, firstPrize, secondPrize, thirdPrize) => {
  console.log('📋 Input parameters:', { prizePool, firstPrize, secondPrize, thirdPrize });
  
  const positions = [];
  
  for (let i = 1; i <= 16; i++) {
    let cashAmount = 0;
    let positionName = '';
    
    if (i === 1) {
      cashAmount = firstPrize || Math.floor(prizePool * 0.4);
      positionName = 'Vô địch';
    } else if (i === 2) {
      cashAmount = secondPrize || Math.floor(prizePool * 0.24);
      positionName = 'Á quân';
    } else if (i === 3) {
      cashAmount = thirdPrize || Math.floor(prizePool * 0.16);
      positionName = 'Hạng 3';
    } else if (i === 4) {
      cashAmount = Math.floor(prizePool * 0.08);
      positionName = 'Hạng 4';
    } else if (i <= 6) {
      cashAmount = Math.floor(prizePool * 0.04);
      positionName = `Hạng 5-6`;
    } else if (i <= 8) {
      cashAmount = Math.floor(prizePool * 0.02);
      positionName = `Hạng 7-8`;
    } else if (i <= 12) {
      cashAmount = Math.floor(prizePool * 0.01125);
      positionName = `Hạng 9-12`;
    } else {
      cashAmount = Math.floor(prizePool * 0.005625);
      positionName = `Hạng 13-16`;
    }
    
    positions.push({
      prize_position: i,
      position_name: positionName,
      cash_amount: cashAmount,
      elo_points: i === 1 ? 100 : i === 2 ? 50 : i === 3 ? 25 : i === 4 ? 12 : 5,
      spa_points: i === 1 ? 1500 : i === 2 ? 1100 : i === 3 ? 900 : i === 4 ? 650 : 320,
      physical_items: [],
      color_theme: i <= 3 ? 'gold' : i <= 8 ? 'silver' : 'bronze',
      is_visible: true,
      is_guaranteed: true
    });
  }
  
  return positions;
};

// Test với data từ INSERT statement (prize_pool: 2000000)
console.log('\n🎯 TEST 1: With actual form data (prize_pool: 2000000)');
const test1 = generatePrizeTemplate(2000000, 0, 0, 0);
console.log('Generated positions:', test1.length);
console.log('First 3 positions:', JSON.stringify(test1.slice(0, 3), null, 2));

console.log('\n🎯 TEST 2: With zero prize pool');
const test2 = generatePrizeTemplate(0, 0, 0, 0);
console.log('Generated positions:', test2.length);
console.log('First 3 positions:', JSON.stringify(test2.slice(0, 3), null, 2));

console.log('\n🎯 TEST 3: With undefined/null values');
const test3 = generatePrizeTemplate(undefined, null, null, null);
console.log('Generated positions:', test3.length);
console.log('First 3 positions:', JSON.stringify(test3.slice(0, 3), null, 2));
