const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

console.log('🔧 Running comprehensive database optimization...');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

// Initialize Supabase client with service role
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runDatabaseOptimizations() {
  try {
    console.log('🎯 Step 1: Adding venue_name column...');
    
    // Add venue_name column
    const { data: venueResult, error: venueError } = await supabase.rpc('exec', {
      sql: `
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'venue_name') THEN
                ALTER TABLE tournaments ADD COLUMN venue_name VARCHAR(200);
                RAISE NOTICE 'Added venue_name column';
            ELSE
                RAISE NOTICE 'venue_name column already exists';
            END IF;
        END $$;
      `
    });

    if (venueError) {
      console.log('Using alternative approach - direct SQL execution...');
      
      // Try individual column additions
      const columnsToAdd = [
        { name: 'venue_name', type: 'VARCHAR(200)' },
        { name: 'is_public', type: 'BOOLEAN DEFAULT true' },
        { name: 'requires_approval', type: 'BOOLEAN DEFAULT false' },
        { name: 'tier_level', type: 'VARCHAR(20)' },
        { name: 'allow_all_ranks', type: 'BOOLEAN DEFAULT true' },
        { name: 'eligible_ranks', type: 'JSONB DEFAULT \'[]\''},
        { name: 'organizer_id', type: 'UUID' },
        { name: 'banner_image', type: 'TEXT' },
        { name: 'registration_fee', type: 'DECIMAL(10,2) DEFAULT 0' },
        { name: 'tournament_format_details', type: 'JSONB DEFAULT \'{}\''},
        { name: 'special_rules', type: 'JSONB DEFAULT \'{}\''},
        { name: 'contact_person', type: 'VARCHAR(100)' },
        { name: 'contact_phone', type: 'VARCHAR(20)' },
        { name: 'live_stream_url', type: 'TEXT' },
        { name: 'sponsor_info', type: 'JSONB DEFAULT \'{}\''},
        { name: 'venue_address', type: 'TEXT' },
        { name: 'spa_points_config', type: 'JSONB DEFAULT \'{}\''},
        { name: 'elo_points_config', type: 'JSONB DEFAULT \'{}\''},
        { name: 'min_rank_requirement', type: 'VARCHAR(5)' },
        { name: 'max_rank_requirement', type: 'VARCHAR(5)' },
        { name: 'prize_distribution', type: 'JSONB DEFAULT \'{}\''}
      ];

      for (const column of columnsToAdd) {
        console.log(`🔧 Adding ${column.name} column...`);
        
        const { error: colError } = await supabase.rpc('exec_sql', {
          query: `ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`
        });

        if (colError && !colError.message.includes('already exists')) {
          console.log(`⚠️  Could not add ${column.name}:`, colError.message);
        } else {
          console.log(`✅ ${column.name} column added/verified`);
        }
      }
    }

    console.log('🎯 Step 2: Verifying column additions...');
    
    // Verify columns exist
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'tournaments')
      .eq('table_schema', 'public');
    
    if (columnsError) {
      console.log('⚠️  Could not verify columns:', columnsError.message);
    } else {
      const columnNames = columns.map(c => c.column_name);
      console.log('📊 Current tournament table columns:', columnNames.length, 'total');
      
      const requiredColumns = ['venue_name', 'is_public', 'requires_approval', 'allow_all_ranks', 'eligible_ranks', 'prize_distribution'];
      const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
      
      if (missingColumns.length === 0) {
        console.log('✅ All required columns are present!');
      } else {
        console.log('❌ Missing columns:', missingColumns);
      }
    }

    console.log('🎯 Step 3: Testing tournament insertion...');
    
    // Test a simple tournament insertion
    const testData = {
      name: 'Database Optimization Test',
      tournament_type: 'double_elimination',
      tournament_start: new Date('2025-01-15').toISOString(),
      max_participants: 16,
      venue_name: 'Test Venue',
      is_public: true,
      requires_approval: false,
      allow_all_ranks: false,
      eligible_ranks: ['H', 'H+'],
      prize_distribution: {
        total_positions: 16,
        positions: [
          { position: 1, name: 'Champion', cash_amount: 1000000 }
        ]
      }
    };

    const { data: testResult, error: testError } = await supabase
      .from('tournaments')
      .insert(testData)
      .select('id, name, venue_name, is_public, requires_approval, prize_distribution')
      .single();

    if (testError) {
      console.log('❌ Test insertion failed:', testError.message);
      
      // Check which specific column is causing issues
      if (testError.message.includes('venue_name')) {
        console.log('🚨 venue_name column is missing - database optimization incomplete');
      } else if (testError.message.includes('prize_distribution')) {
        console.log('🚨 prize_distribution column is missing - database optimization incomplete');
      } else {
        console.log('🔍 Full error details:', testError);
      }
    } else {
      console.log('✅ Test insertion succeeded!');
      console.log('📊 Test result:', testResult);
      
      // Clean up test data
      await supabase.from('tournaments').delete().eq('id', testResult.id);
      console.log('🧹 Test data cleaned up');
    }

  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

// Run the optimizations
runDatabaseOptimizations()
  .then(() => {
    console.log('🎉 Database optimization process completed!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
  });
