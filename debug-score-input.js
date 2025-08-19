// Test Score Input Debug
// Copy và paste vào browser console khi mở tournament page

console.log('🔍 SABO Score Input Debug Test');

// Tìm các input elements cho score
const scoreInputs = document.querySelectorAll('input[type="number"]');
console.log('📊 Found score inputs:', scoreInputs.length);

// Tìm button "Update Score"
const updateButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
  btn.textContent?.includes('Update Score') || 
  btn.textContent?.includes('Cập nhật tỷ số')
);
console.log('🔲 Found update buttons:', updateButtons.length);

// Tìm các match cards
const matchCards = document.querySelectorAll('[data-testid*="match"], .match-card, .sabo-match');
console.log('🃏 Found match cards:', matchCards.length);

// Test nếu có score inputs
if (scoreInputs.length > 0) {
  console.log('✅ Score inputs found - testing input capability...');
  const firstInput = scoreInputs[0];
  
  // Test focus
  firstInput.focus();
  console.log('👆 Focused on first input');
  
  // Test typing
  firstInput.value = '5';
  firstInput.dispatchEvent(new Event('input', { bubbles: true }));
  console.log('⌨️ Typed "5" into first input');
  
  // Check if value stuck
  setTimeout(() => {
    console.log('📝 Input value after 1 second:', firstInput.value);
  }, 1000);
} else {
  console.log('❌ No score inputs found');
}

// Log any errors in console
console.log('🚨 Check browser console for any JavaScript errors');
