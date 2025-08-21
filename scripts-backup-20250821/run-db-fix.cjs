const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runDatabaseFix() {
  console.log('🔥 STARTING DATABASE FIX WITH SERVICE ROLE...');
  
  try {
    // First, check current table structure
    console.log('📊 Checking current tournaments table structure...');
    const { data: columns, error: columnsError } = await supabase.rpc('run_sql', {
      query: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });

    if (columnsError) {
      console.error('❌ Error checking table structure:', columnsError);
      return;
    }

    console.log('📋 Current columns:', columns?.map(c => c.column_name) || 'No columns found');
    
    // Check if venue_name exists
    const hasVenueName = columns?.some(col => col.column_name === 'venue_name');
    const hasPrizeDistribution = columns?.some(col => col.column_name === 'prize_distribution');
    
    console.log('🏢 venue_name exists:', hasVenueName);
    console.log('🏆 prize_distribution exists:', hasPrizeDistribution);
    
    if (!hasVenueName) {
      console.log('🚀 Adding missing columns to tournaments table...');
      
      // Add missing columns
      const { data: addResult, error: addError } = await supabase.rpc('run_sql', {
        query: `
          -- Add venue_name if not exists
          ALTER TABLE public.tournaments 
          ADD COLUMN IF NOT EXISTS venue_name TEXT,
          ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
          ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false,
          ADD COLUMN IF NOT EXISTS tier_level TEXT DEFAULT 'standard',
          ADD COLUMN IF NOT EXISTS allow_all_ranks BOOLEAN DEFAULT true,
          ADD COLUMN IF NOT EXISTS eligible_ranks JSONB DEFAULT '[]'::jsonb,
          ADD COLUMN IF NOT EXISTS organizer_id UUID REFERENCES auth.users(id),
          ADD COLUMN IF NOT EXISTS banner_image TEXT,
          ADD COLUMN IF NOT EXISTS registration_fee NUMERIC(10,2) DEFAULT 0,
          ADD COLUMN IF NOT EXISTS tournament_format_details JSONB DEFAULT '{}'::jsonb,
          ADD COLUMN IF NOT EXISTS special_rules TEXT,
          ADD COLUMN IF NOT EXISTS contact_person TEXT,
          ADD COLUMN IF NOT EXISTS contact_phone TEXT,
          ADD COLUMN IF NOT EXISTS live_stream_url TEXT,
          ADD COLUMN IF NOT EXISTS sponsor_info JSONB DEFAULT '{}'::jsonb;
        `
      });

      if (addError) {
        console.error('❌ Error adding columns:', addError);
      } else {
        console.log('✅ Successfully added missing columns!');
      }
    }
    
    if (!hasPrizeDistribution) {
      console.log('🏆 Adding prize_distribution column...');
      
      const { data: prizeResult, error: prizeError } = await supabase.rpc('run_sql', {
        query: `
          -- Add prize_distribution if not exists
          ALTER TABLE public.tournaments 
          ADD COLUMN IF NOT EXISTS prize_distribution JSONB DEFAULT '{}'::jsonb;
          
          -- Create index for better performance
          CREATE INDEX IF NOT EXISTS idx_tournaments_prize_distribution 
          ON public.tournaments USING GIN (prize_distribution);
        `
      });

      if (prizeError) {
        console.error('❌ Error adding prize_distribution:', prizeError);
      } else {
        console.log('✅ Successfully added prize_distribution column!');
      }
    }
    
    // Verify the fix
    console.log('🔍 Verifying database fix...');
    const { data: newColumns, error: verifyError } = await supabase.rpc('run_sql', {
      query: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND table_schema = 'public'
        AND column_name IN ('venue_name', 'is_public', 'requires_approval', 'prize_distribution')
        ORDER BY column_name;
      `
    });

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
    } else {
      console.log('✅ VERIFICATION RESULTS:');
      newColumns?.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    console.log('🎯 DATABASE FIX COMPLETED!');
    
  } catch (error) {
    console.error('💥 FATAL ERROR:', error);
  }
}

// Execute the fix if it's for run_sql RPC
async function runSQLFix() {
  console.log('🔥 RUNNING SQL FIX WITH DIRECT RPC...');
  
  try {
    // Try to add columns using raw SQL
    const sqlCommands = [
      `ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS venue_name TEXT;`,
      `ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;`,
      `ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false;`,
      `ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS tier_level TEXT DEFAULT 'standard';`,
      `ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS allow_all_ranks BOOLEAN DEFAULT true;`,
      `ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS eligible_ranks JSONB DEFAULT '[]'::jsonb;`,
      `ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS organizer_id UUID;`,
      `ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS banner_image TEXT;`,
      `ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS registration_fee NUMERIC(10,2) DEFAULT 0;`,
      `ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS tournament_format_details JSONB DEFAULT '{}'::jsonb;`,
      `ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS special_rules TEXT;`,
      `ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS contact_person TEXT;`,
      `ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS contact_phone TEXT;`,
      `ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS live_stream_url TEXT;`,
      `ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS sponsor_info JSONB DEFAULT '{}'::jsonb;`,
      `ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS prize_distribution JSONB DEFAULT '{}'::jsonb;`
    ];
    
    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i];
      console.log(`🔧 Running SQL ${i+1}/${sqlCommands.length}:`, sql.substring(0, 50) + '...');
      
      const { data, error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.log(`❌ Error in SQL ${i+1}:`, error.message);
        // Continue with next command
      } else {
        console.log(`✅ SQL ${i+1} completed successfully`);
      }
    }
    
    console.log('🎯 SQL FIX COMPLETED!');
    
  } catch (error) {
    console.error('💥 SQL FIX ERROR:', error);
  }
}

// Run the fix
runSQLFix().then(() => {
  console.log('✅ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
