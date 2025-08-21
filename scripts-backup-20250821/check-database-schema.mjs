#!/usr/bin/env node

// ============================================================================
// CHECK DATABASE SCHEMA WITH SERVICE ROLE KEY
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkTableStructure(tableName) {
  console.log(`\n📋 CHECKING TABLE: ${tableName.toUpperCase()}`);
  console.log('=' .repeat(50));
  
  try {
    const { data, error } = await supabase.rpc('sql', {
      query: `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          ordinal_position
        FROM information_schema.columns
        WHERE table_name = '${tableName}'
          AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });

    if (error) {
      console.error(`❌ Error checking ${tableName}:`, error.message);
      return false;
    }

    if (!data || data.length === 0) {
      console.log(`❌ Table '${tableName}' does not exist or has no columns`);
      return false;
    }

    console.log(`✅ Table '${tableName}' exists with ${data.length} columns:`);
    console.log('\nColumns:');
    data.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
    });

    return data;
  } catch (err) {
    console.error(`❌ Exception checking ${tableName}:`, err.message);
    return false;
  }
}

async function checkSampleData(tableName, limit = 3) {
  console.log(`\n📊 SAMPLE DATA FROM: ${tableName.toUpperCase()}`);
  console.log('=' .repeat(50));
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(limit);

    if (error) {
      console.error(`❌ Error getting sample data from ${tableName}:`, error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log(`ℹ️  Table '${tableName}' is empty`);
      return;
    }

    console.log(`✅ Found ${data.length} records in '${tableName}':`);
    data.forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      Object.entries(record).forEach(([key, value]) => {
        const displayValue = typeof value === 'string' && value.length > 50 
          ? value.substring(0, 50) + '...' 
          : value;
        console.log(`  ${key}: ${displayValue}`);
      });
    });
  } catch (err) {
    console.error(`❌ Exception getting sample data from ${tableName}:`, err.message);
  }
}

async function main() {
  console.log('🔍 DATABASE SCHEMA ANALYSIS');
  console.log('Using Supabase URL:', supabaseUrl);
  console.log('Using Service Role Key: [HIDDEN]');
  
  // Check table structures
  const tournamentsSchema = await checkTableStructure('tournaments');
  const tournamentResultsSchema = await checkTableStructure('tournament_results');
  const tournamentMatchesSchema = await checkTableStructure('tournament_matches');
  const tournamentParticipantsSchema = await checkTableStructure('tournament_participants');
  
  // Check sample data
  if (tournamentsSchema) {
    await checkSampleData('tournaments', 2);
  }
  
  if (tournamentResultsSchema) {
    await checkSampleData('tournament_results', 2);
  }
  
  // Check for SABO tournaments specifically
  console.log(`\n🎯 SABO TOURNAMENTS CHECK`);
  console.log('=' .repeat(50));
  
  try {
    const { data: saboTournaments, error } = await supabase
      .from('tournaments')
      .select('id, name, tournament_type, status, created_at')
      .in('tournament_type', ['sabo', 'double_elimination'])
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error checking SABO tournaments:', error.message);
    } else if (!saboTournaments || saboTournaments.length === 0) {
      console.log('ℹ️  No SABO/double_elimination tournaments found');
    } else {
      console.log(`✅ Found ${saboTournaments.length} SABO tournaments:`);
      saboTournaments.forEach((t, index) => {
        console.log(`${index + 1}. ${t.name} (${t.tournament_type}) - ${t.status}`);
      });
    }
  } catch (err) {
    console.error('❌ Exception checking SABO tournaments:', err.message);
  }
  
  console.log('\n🎉 SCHEMA ANALYSIS COMPLETE!');
}

main().catch(console.error);
