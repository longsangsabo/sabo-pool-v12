#!/usr/bin/env node

// ============================================================================
// DIRECT DATABASE QUERY - NO BULLSHIT
// ============================================================================

const SUPABASE_URL = 'https://exlqvlbawytbglioqfbc.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

async function queryDatabase(query) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: query })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  return await response.json();
}

async function checkTableStructure(tableName) {
  console.log(`\n🔍 TABLE: ${tableName}`);
  console.log('=' .repeat(50));
  
  try {
    const query = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = '${tableName}' 
        AND table_schema = 'public' 
      ORDER BY ordinal_position;
    `;
    
    const result = await queryDatabase(query);
    
    if (result && result.length > 0) {
      console.log(`Found ${result.length} columns:`);
      result.forEach((col, i) => {
        const num = (i+1).toString().padStart(2, ' ');
        console.log(`${num}. ${col.column_name.padEnd(25)} ${col.data_type.padEnd(15)} ${col.is_nullable}`);
      });
    } else {
      console.log(`Table '${tableName}' not found or empty`);
    }
  } catch (error) {
    console.error(`Error checking ${tableName}:`, error.message);
  }
}

async function checkTableData(tableName, limit = 2) {
  console.log(`\n📊 SAMPLE DATA: ${tableName}`);
  console.log('-' .repeat(30));
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=${limit}`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (data.length === 0) {
      console.log('Table is empty');
    } else {
      console.log(`${data.length} records found`);
      if (data[0]) {
        console.log('Sample record keys:', Object.keys(data[0]).join(', '));
      }
    }
  } catch (error) {
    console.error(`Error getting data from ${tableName}:`, error.message);
  }
}

async function main() {
  console.log('🚀 DIRECT DATABASE CHECK');
  console.log('Using real service key to check actual schema...\n');

  // Check all relevant tables
  await checkTableStructure('tournaments');
  await checkTableData('tournaments');

  await checkTableStructure('tournament_registrations'); 
  await checkTableData('tournament_registrations');

  await checkTableStructure('tournament_participants');
  await checkTableData('tournament_participants');

  await checkTableStructure('tournament_results');
  await checkTableData('tournament_results');

  await checkTableStructure('tournament_matches');
  await checkTableData('tournament_matches');

  console.log('\n🎯 CHECKING FINAL MATCHES');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tournament_matches?round_number=eq.300&limit=5`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });

    const finalMatches = await response.json();
    console.log(`Final matches found: ${finalMatches.length}`);
    if (finalMatches.length > 0) {
      console.log('Sample final match:', finalMatches[0]);
    }
  } catch (error) {
    console.error('Error checking final matches:', error.message);
  }

  console.log('\nDONE - Real database schema checked!');
}

main().catch(console.error);
