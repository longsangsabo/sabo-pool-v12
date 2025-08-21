#!/usr/bin/env node

// ============================================================================
// DATABASE SCHEMA INSPECTOR
// Kiểm tra cấu trúc bảng thực tế trong Supabase
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function inspectTableSchema(tableName) {
  console.log(`\n🔍 Inspecting table: ${tableName}`);
  console.log('=' .repeat(60));
  
  try {
    // Check if table exists and get its columns
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', tableName)
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (error) {
      console.error(`❌ Error inspecting ${tableName}:`, error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.log(`⚠️  Table '${tableName}' not found or has no columns`);
      return null;
    }

    console.log(`✅ Found ${data.length} columns in '${tableName}':`);
    console.log('');
    console.log('Column Name'.padEnd(25) + 'Data Type'.padEnd(20) + 'Nullable'.padEnd(12) + 'Default');
    console.log('-'.repeat(80));
    
    data.forEach(col => {
      const name = col.column_name.padEnd(25);
      const type = col.data_type.padEnd(20);
      const nullable = col.is_nullable.padEnd(12);
      const defaultValue = (col.column_default || '').substring(0, 30);
      console.log(`${name}${type}${nullable}${defaultValue}`);
    });

    return data;
  } catch (err) {
    console.error(`❌ Exception inspecting ${tableName}:`, err.message);
    return null;
  }
}

async function testBasicQueries() {
  console.log('\n🧪 Testing basic queries');
  console.log('=' .repeat(60));

  try {
    // Test tournaments query
    console.log('\n📊 Testing tournaments query...');
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('id, name, tournament_type, status, created_at')
      .limit(3);

    if (tournamentsError) {
      console.error('❌ Tournaments query error:', tournamentsError.message);
    } else {
      console.log(`✅ Found ${tournaments?.length || 0} tournaments`);
      if (tournaments && tournaments.length > 0) {
        console.log('Sample:', tournaments[0]);
      }
    }

    // Test tournament_matches query
    console.log('\n📊 Testing tournament_matches query...');
    const { data: matches, error: matchesError } = await supabase
      .from('tournament_matches')
      .select('id, tournament_id, round_number, status')
      .limit(3);

    if (matchesError) {
      console.error('❌ Tournament matches query error:', matchesError.message);
    } else {
      console.log(`✅ Found ${matches?.length || 0} tournament matches`);
      if (matches && matches.length > 0) {
        console.log('Sample:', matches[0]);
      }
    }

    // Test tournament_results query
    console.log('\n📊 Testing tournament_results query...');
    const { data: results, error: resultsError } = await supabase
      .from('tournament_results')
      .select('id, tournament_id, user_id, final_position')
      .limit(3);

    if (resultsError) {
      console.error('❌ Tournament results query error:', resultsError.message);
    } else {
      console.log(`✅ Found ${results?.length || 0} tournament results`);
      if (results && results.length > 0) {
        console.log('Sample:', results[0]);
      }
    }

  } catch (err) {
    console.error('❌ Exception during testing:', err.message);
  }
}

async function checkSpecificColumns() {
  console.log('\n🎯 Checking specific columns we need');
  console.log('=' .repeat(60));

  const columnsToCheck = [
    { table: 'tournaments', columns: ['winner_id', 'completed_at', 'status'] },
    { table: 'tournament_matches', columns: ['winner_id', 'round_number', 'status'] },
    { table: 'tournament_results', columns: ['final_position', 'spa_points_awarded'] }
  ];

  for (const check of columnsToCheck) {
    console.log(`\n📋 Checking ${check.table} for required columns:`);
    
    try {
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', check.table)
        .eq('table_schema', 'public')
        .in('column_name', check.columns);

      if (error) {
        console.error(`❌ Error checking ${check.table}:`, error.message);
        continue;
      }

      const foundColumns = data?.map(d => d.column_name) || [];
      
      check.columns.forEach(col => {
        const exists = foundColumns.includes(col);
        console.log(`  ${exists ? '✅' : '❌'} ${col}`);
      });

    } catch (err) {
      console.error(`❌ Exception checking ${check.table}:`, err.message);
    }
  }
}

async function main() {
  console.log('🚀 Database Schema Inspector');
  console.log('Connecting to Supabase...');

  // Inspect each table
  await inspectTableSchema('tournaments');
  await inspectTableSchema('tournament_matches');
  await inspectTableSchema('tournament_results');
  await inspectTableSchema('tournament_participants');

  // Test basic queries
  await testBasicQueries();

  // Check specific columns
  await checkSpecificColumns();

  console.log('\n🏁 Inspection complete!');
}

main().catch(console.error);
