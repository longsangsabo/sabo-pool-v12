// Quick check of the current tournament and its SABO matches
const fs = require('fs');
const path = require('path');

async function getCurrentTournament() {
  console.log('🔍 Looking for tournament information...');
  
  // Read the database state file if it exists
  try {
    const dbState = fs.readFileSync(path.join(process.cwd(), 'tournament-state.json'), 'utf8');
    const state = JSON.parse(dbState);
    console.log('📊 Tournament state:', state);
    return state.tournamentId;
  } catch (error) {
    console.log('⚠️ No tournament state file found');
  }
  
  // Check for any existing tournament files
  const files = fs.readdirSync(process.cwd());
  const tournamentFiles = files.filter(file => file.includes('tournament') && file.includes('.json'));
  console.log('📁 Tournament files found:', tournamentFiles);
  
  return null;
}

getCurrentTournament().catch(console.error);
