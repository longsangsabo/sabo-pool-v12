// Debug prize template generation - SIMPLIFIED VERSION
console.log('🎯 Testing prize template generation...');

function debugPrizeTemplate() {
  try {
    console.log('1. Creating template with standard format...');
    const template = TournamentPrizesService.createDefaultPrizeTemplate(
      'debug-tournament-123',
      'standard',
      1000000
    );
    
    console.log('✅ Template created successfully');
    console.log('📊 Template stats:', {
      totalPositions: template.length,
      firstPosition: template[0],
      lastPosition: template[template.length - 1],
      totalCash: template.reduce((sum, p) => sum + (p.cash_amount || 0), 0)
    });
    
    // Verify data structure
    console.log('2. Verifying data structure...');
    let errors = [];
    
    template.forEach((prize, index) => {
      if (!prize.tournament_id) errors.push(`Position ${index + 1}: missing tournament_id`);
      if (!prize.position_name) errors.push(`Position ${index + 1}: missing position_name`);
      if (typeof prize.cash_amount !== 'number') errors.push(`Position ${index + 1}: invalid cash_amount`);
      if (typeof prize.prize_position !== 'number') errors.push(`Position ${index + 1}: invalid prize_position`);
    });
    
    if (errors.length > 0) {
      console.error('❌ Data structure errors:', errors);
    } else {
      console.log('✅ Data structure validation passed');
    }
    
    // Test different formats
    console.log('3. Testing different formats...');
    const formats = ['standard', 'winner-takes-all', 'top-heavy', 'distributed'];
    
    formats.forEach(format => {
      const formatTemplate = TournamentPrizesService.createDefaultPrizeTemplate(
        'debug-tournament-456',
        format,
        1000000
      );
      
      console.log(`Format: ${format}, positions: ${formatTemplate.length}`);
    });
    
    return template;
    
  } catch (error) {
    console.error('❌ Template creation failed:', error);
    return null;
  }
}

// Export for browser console use
if (typeof window !== 'undefined') {
  window.debugPrizeTemplate = debugPrizeTemplate;
}

export { debugPrizeTemplate };
