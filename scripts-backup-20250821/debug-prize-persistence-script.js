// =======================
// PRIZE PERSISTENCE DEBUG SCRIPT
// =======================
// Paste this into browser console to test prize system

console.log('🎯 Starting Prize Persistence Debug...');

// Test 1: Check if TournamentPrizesService is available
async function testServiceAvailability() {
  try {
    // This should be available globally through the import system
    const module = await import('/src/services/tournament-prizes.service.ts');
    console.log('✅ TournamentPrizesService module loaded:', module);
    
    const { TournamentPrizesService } = module;
    console.log('✅ TournamentPrizesService class:', TournamentPrizesService);
    
    return TournamentPrizesService;
  } catch (error) {
    console.error('❌ Failed to load TournamentPrizesService:', error);
    return null;
  }
}

// Test 2: Check template creation
async function testTemplateCreation(service) {
  if (!service) return null;
  
  try {
    console.log('🔍 Testing template creation...');
    const template = service.createDefaultPrizeTemplate(
      'debug-test-123',
      'standard',
      1000000
    );
    
    console.log('✅ Template created successfully:', {
      count: template.length,
      first: template[0],
      last: template[template.length - 1],
      totalCash: template.reduce((sum, p) => sum + (p.cash_amount || 0), 0)
    });
    
    return template;
  } catch (error) {
    console.error('❌ Template creation failed:', error);
    return null;
  }
}

// Test 3: Check database connection (read-only)
async function testDatabaseRead() {
  try {
    console.log('🔍 Testing database read access...');
    
    // Import supabase client
    const supabaseModule = await import('/src/integrations/supabase/client.ts');
    const { supabase } = supabaseModule;
    
    // Test table access
    const { data, error } = await supabase
      .from('tournament_prizes')
      .select('id, tournament_id, prize_position, position_name')
      .limit(5);
    
    if (error) {
      console.error('❌ Database read error:', error);
      return false;
    }
    
    console.log('✅ Database read successful:', {
      recordCount: data?.length || 0,
      records: data
    });
    
    return true;
  } catch (error) {
    console.error('❌ Database read test failed:', error);
    return false;
  }
}

// Test 4: Check if form component is rendered
function testFormComponentPresence() {
  console.log('🔍 Testing form component presence...');
  
  const prizeManager = document.querySelector('[class*="TournamentPrizesManager"]');
  const enhancedForm = document.querySelector('[class*="EnhancedTournamentForm"]');
  
  console.log('Form components found:', {
    prizeManager: !!prizeManager,
    enhancedForm: !!enhancedForm
  });
  
  return {
    prizeManager: !!prizeManager,
    enhancedForm: !!enhancedForm
  };
}

// Run all tests
async function runFullDebugTest() {
  console.log('🎯 Starting comprehensive debug test...');
  
  const results = {
    serviceLoad: false,
    templateCreation: false,
    databaseRead: false,
    componentPresence: false
  };
  
  // Test service loading
  const service = await testServiceAvailability();
  results.serviceLoad = !!service;
  
  // Test template creation
  if (service) {
    const template = await testTemplateCreation(service);
    results.templateCreation = !!template;
  }
  
  // Test database
  results.databaseRead = await testDatabaseRead();
  
  // Test components
  const components = testFormComponentPresence();
  results.componentPresence = components.prizeManager && components.enhancedForm;
  
  console.log('🎯 Debug Test Results:', results);
  
  return results;
}

// Export for manual execution
window.debugPrizePersistence = runFullDebugTest;
window.testServiceAvailability = testServiceAvailability;
window.testTemplateCreation = testTemplateCreation;
window.testDatabaseRead = testDatabaseRead;

console.log('🎯 Debug script loaded! Run: debugPrizePersistence()');
