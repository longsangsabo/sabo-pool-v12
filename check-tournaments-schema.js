// Script để kiểm tra schema của bảng tournaments
const fetch = require('node-fetch');

// Supabase credentials
const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseKey = 'sb_secret_nNmO6wZEx0bv9YD323kErg__VmmUYEc';

async function checkTableSchema() {
  // SQL query to get table structure
  const query = `
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'tournaments'
    ORDER BY ordinal_position;
  `;
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        name: 'select',
        arguments: {
          query: query
        }
      })
    });
    
    const data = await response.json();
    console.log('Table schema:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error checking table schema:', error);
  }
}

checkTableSchema();
