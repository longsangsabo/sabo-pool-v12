#!/usr/bin/env node

// Deploy corrected tournament results trigger via HTTP API

import fs from 'fs';
const SUPABASE_URL = 'https://exlqvlbawytbglioqfbc.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

async function executeSQLFile(filePath) {
  console.log('📂 Reading SQL file:', filePath);
  
  const sqlContent = fs.readFileSync(filePath, 'utf8');
  
  console.log('📊 SQL file size:', sqlContent.length, 'characters');
  
  // Split by semicolons and execute each statement
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log('🔧 Found', statements.length, 'SQL statements to execute');
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (statement.length < 10) continue; // Skip very short statements
    
    console.log(`\n${i + 1}/${statements.length} Executing:`, statement.substring(0, 80) + '...');
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: statement })
      });

      const result = await response.text();
      
      if (response.ok) {
        console.log('✅ Success');
      } else {
        console.log('❌ Error:', response.status, result);
        
        // Try alternative endpoint
        console.log('🔄 Trying alternative method...');
        
        const altResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sql: statement })
        });

        const altResult = await altResponse.text();
        if (altResponse.ok) {
          console.log('✅ Success with alternative method');
        } else {
          console.log('❌ Alternative also failed:', altResponse.status, altResult);
        }
      }
    } catch (error) {
      console.log('❌ Exception:', error.message);
    }
  }
  
  console.log('\n🎯 All statements processed!');
}

// Execute the corrected trigger file
executeSQLFile('./corrected-tournament-results-trigger.sql');
