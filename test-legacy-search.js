// Test script để kiểm tra Legacy SPA search
// Chạy script này trong browser console (F12)

console.log('🔍 Testing Legacy SPA Search...');

async function testLegacySearch() {
	try {
		const { createClient } = window.supabase || {};
    
		if (!createClient) {
			console.log('❌ Supabase client not found. Trying direct fetch...');
      
			// Test with direct fetch
			const response = await fetch('https://exlqvlbawtbglioqfbc.supabase.co/rest/v1/legacy_spa_points?select=*&full_name=ilike.*ANH%20LONG*', {
				headers: {
					'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA',
					'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'
				}
			});
      
			const data = await response.json();
			console.log('📊 Direct fetch result:', data);
      
			if (data.length > 0) {
				console.log('✅ ANH LONG MAGIC found!', data[0]);
			} else {
				console.log('❌ ANH LONG MAGIC not found in results');
			}
      
			return data;
		}
    
		// Test with Supabase client
		const supabase = createClient(
			'https://exlqvlbawtbglioqfbc.supabase.co',
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'
		);
    
		console.log('🔗 Testing with Supabase client...');
    
		const { data, error } = await supabase
			.from('legacy_spa_points')
			.select('*')
			.ilike('full_name', '%ANH LONG%');
    
		if (error) {
			console.log('❌ Supabase error:', error);
		} else {
			console.log('✅ Supabase result:', data);
      
			if (data && data.length > 0) {
				console.log('🎉 Found ANH LONG MAGIC:', data[0]);
			} else {
				console.log('😞 ANH LONG MAGIC not found');
			}
		}
    
		return { data, error };
    
	} catch (err) {
		console.log('💥 Test failed:', err);
		return null;
	}
}

// Run test
testLegacySearch();

// Export for manual testing
window.testLegacySearch = testLegacySearch;
