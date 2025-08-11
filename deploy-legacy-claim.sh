#!/bin/bash

# Script to deploy Legacy SPA Claim system
echo "🚀 Deploying Legacy SPA Claim System..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env with your Supabase credentials:"
    echo "SUPABASE_URL=your_supabase_url"
    echo "SUPABASE_ANON_KEY=your_anon_key"
    echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    exit 1
fi

# Load environment variables
source .env

# Check if migration file exists
if [ ! -f "supabase/migrations/20250810105444_create_legacy_claim_system.sql" ]; then
    echo "❌ Error: Migration file not found!"
    echo "Expected: supabase/migrations/20250810105444_create_legacy_claim_system.sql"
    exit 1
fi

echo "📋 Migration file found: supabase/migrations/20250810105444_create_legacy_claim_system.sql"

# Apply migration using SQL if supabase CLI is not available
if command -v supabase &> /dev/null; then
    echo "🔧 Using Supabase CLI to apply migration..."
    supabase migration up
else
    echo "⚠️  Supabase CLI not found. Manual deployment required."
    echo ""
    echo "Please apply the migration manually:"
    echo "1. Go to your Supabase Dashboard"
    echo "2. Go to SQL Editor"
    echo "3. Copy and paste the content of: supabase/migrations/20250810105444_create_legacy_claim_system.sql"
    echo "4. Run the SQL script"
    echo ""
    echo "Or install Supabase CLI and run this script again:"
    echo "npm install -g supabase"
    echo ""
fi

# Test basic database connection
echo "🧪 Testing database connection..."

# Check environment variables (with or without VITE_ prefix)
SUPABASE_URL=${SUPABASE_URL:-$VITE_SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY:-$VITE_SUPABASE_ANON_KEY}

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Missing Supabase credentials in .env"
    echo "Found SUPABASE_URL: ${SUPABASE_URL:0:20}..."
    echo "Found SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY:0:20}..."
    exit 1
fi

echo "✅ Supabase credentials found"

# Create a simple test script
cat > test_connection.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
);

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('legacy_spa_points')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    console.log(`📊 Legacy SPA entries found: ${data.count || 0}`);
    
    // Test if legacy_spa_claim_requests table exists
    const { data: tableData, error: tableError } = await supabase
      .from('legacy_spa_claim_requests')
      .select('count(*)', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('❌ legacy_spa_claim_requests table not found:', tableError.message);
      console.log('📝 Please apply the migration first');
      return false;
    }
    
    console.log('✅ legacy_spa_claim_requests table exists');
    console.log(`📊 Claim requests: ${tableData.count || 0}`);
    
    // Test function existence (will fail if functions not deployed)
    try {
      const { error: funcError } = await supabase.rpc('submit_legacy_spa_claim_request', {
        p_legacy_entry_id: '00000000-0000-0000-0000-000000000000',
        p_verification_phone: 'test'
      });
      
      // If we get here without throwing, function exists (even if it fails with invalid data)
      if (funcError && funcError.message.includes('function') && funcError.message.includes('does not exist')) {
        console.log('❌ Functions not deployed yet - migration needed');
        return false;
      } else {
        console.log('✅ Functions appear to be available');
      }
    } catch (e) {
      if (e.message.includes('does not exist')) {
        console.log('❌ Functions not deployed yet - migration needed');
        return false;
      } else {
        console.log('✅ Functions appear to be available (expected error with test data)');
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Legacy SPA Claim system is ready!');
    console.log('✅ Database connection: OK');
    console.log('✅ Tables: OK');
    console.log('✅ Functions: OK');
    console.log('\n📋 Next steps:');
    console.log('1. Start dev server: npm run dev');
    console.log('2. Test claim functionality in app');
    console.log('3. Test admin panel with authorized account');
  } else {
    console.log('\n⚠️  System needs setup:');
    console.log('1. Apply migration in Supabase Dashboard');
    console.log('2. Run this test again');
  }
  process.exit(success ? 0 : 1);
});
EOF

# Run the test if node is available
if command -v node &> /dev/null; then
    echo "🧪 Running connection test..."
    node test_connection.js
    
    # Clean up test file
    rm test_connection.js
else
    echo "⚠️  Node.js not found. Please install Node.js to run the test."
fi

echo ""
echo "📚 Documentation created:"
echo "- LEGACY_SPA_CLAIM_DEPLOYMENT.md"
echo ""
echo "✅ Deployment script completed!"
