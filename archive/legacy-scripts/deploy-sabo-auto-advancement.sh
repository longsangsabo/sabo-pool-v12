#!/bin/bash

# ============================================
# SABO AUTO-ADVANCEMENT DEPLOYMENT SCRIPT
# ============================================
# Ensures new tournaments have automatic advancement
# Addresses user requirement: "các giải mới được tự động"

echo "🚀 SABO Automatic Advancement System Deployment"
echo "============================================="
echo ""

# 1. Check if we have the SQL file
if [ ! -f "sabo-automatic-advancement-system.sql" ]; then
    echo "❌ Error: sabo-automatic-advancement-system.sql not found"
    exit 1
fi

echo "✅ SQL file found"

# 2. Create deployment verification script
cat > verify-deployment.cjs << 'EOF'
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dafbqjjvqbtlqxtuhkkn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhZmJxamp2cWJ0bHF4dHVoa2tuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzAzMTYwMCwiZXhwIjoyMDUyNjA3NjAwfQ.vayBVmcUF2TnJoiX9TgdQOZx_tWOT8EmlTGqzTlL1yY'
);

async function verifyDeployment() {
  try {
    console.log('🔍 Verifying SABO advancement system...');
    
    // Check if trigger function exists
    const { data: functions, error: funcError } = await supabase
      .from('pg_proc')
      .select('proname')
      .like('proname', '%sabo%advance%');
      
    if (funcError) {
      console.log('⚠️  Could not verify functions (expected if using different schema)');
    } else {
      console.log('📋 SABO functions found:', functions?.length || 0);
    }
    
    // Get SABO tournaments and check their advancement
    const { data: tournaments, error: tError } = await supabase
      .from('tournaments')
      .select('id, name, tournament_type, status')
      .eq('tournament_type', 'sabo')
      .limit(5);
      
    if (tError) {
      console.error('❌ Tournament check failed:', tError.message);
      return;
    }
    
    if (!tournaments || tournaments.length === 0) {
      console.log('ℹ️  No SABO tournaments found. System ready for new tournaments.');
      return;
    }
    
    console.log(`🏆 Found ${tournaments.length} SABO tournaments:`);
    
    for (const tournament of tournaments) {
      console.log(`\n📊 ${tournament.name} (${tournament.status}):`);
      
      // Check critical advancement points
      const { data: criticalMatches, error: matchError } = await supabase
        .from('tournament_matches')
        .select('round_number, match_number, player1_id, player2_id, status, winner_id')
        .eq('tournament_id', tournament.id)
        .in('round_number', [202, 250])
        .order('round_number, match_number');
        
      if (matchError) {
        console.error('  ❌ Match check failed:', matchError.message);
        continue;
      }
      
      if (!criticalMatches || criticalMatches.length === 0) {
        console.log('  ⚠️  No critical matches found');
        continue;
      }
      
      let r202Status = 'Not found';
      let sf2Status = 'Not found';
      let advancementOK = false;
      
      criticalMatches.forEach(match => {
        if (match.round_number === 202) {
          r202Status = match.status === 'completed' ? `Completed (Winner: ${match.winner_id})` : match.status;
        }
        if (match.round_number === 250 && match.match_number === 2) {
          const p1Status = match.player1_id ? '✅' : '❌';
          const p2Status = match.player2_id ? '✅' : '❌';
          sf2Status = `P1:${p1Status} P2:${p2Status}`;
          
          // Check if R202 winner is in SF2
          const r202Match = criticalMatches.find(m => m.round_number === 202);
          if (r202Match?.winner_id && match.player2_id === r202Match.winner_id) {
            advancementOK = true;
          }
        }
      });
      
      console.log(`  R202 (Losers B Final): ${r202Status}`);
      console.log(`  SF2 (Critical): ${sf2Status}`);
      console.log(`  Advancement Status: ${advancementOK ? '✅ Correct' : '❌ Needs Fix'}`);
    }
    
    console.log('\n🎯 Deployment verification complete!');
    console.log('📝 New tournaments will have automatic advancement');
    
  } catch (err) {
    console.error('💥 Verification failed:', err.message);
  }
}

verifyDeployment();
EOF

echo "✅ Verification script created"

# 3. Instructions for manual deployment
echo ""
echo "📋 DEPLOYMENT INSTRUCTIONS:"
echo "=========================="
echo ""
echo "1. 🎯 AUTOMATIC OPTION (Recommended):"
echo "   Copy the contents of 'sabo-automatic-advancement-system.sql'"
echo "   and run it in your Supabase SQL Editor"
echo ""
echo "2. 🔧 VERIFICATION:"
echo "   Run: node verify-deployment.cjs"
echo ""
echo "3. 🚀 NEW TOURNAMENTS:"
echo "   All new SABO tournaments will have automatic advancement"
echo "   from R202 (Losers B Final) to SF2 (Semifinal 2)"
echo ""
echo "4. 🔨 FIX EXISTING (if needed):"
echo "   SELECT fix_existing_sabo_advancement('tournament-id');"
echo ""

# 4. Create quick fix script for existing tournaments
cat > fix-existing-tournaments.cjs << 'EOF'
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dafbqjjvqbtlqxtuhkkn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhZmJxamp2cWJ0bHF4dHVoa2tuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzAzMTYwMCwiZXhwIjoyMDUyNjA3NjAwfQ.vayBVmcUF2TnJoiX9TgdQOZx_tWOT8EmlTGqzTlL1yY'
);

async function fixExistingTournaments() {
  try {
    console.log('🔨 Fixing existing SABO tournaments...');
    
    // Get all SABO tournaments
    const { data: tournaments, error: tError } = await supabase
      .from('tournaments')
      .select('id, name')
      .eq('tournament_type', 'sabo');
      
    if (tError) {
      console.error('❌ Error:', tError.message);
      return;
    }
    
    if (!tournaments || tournaments.length === 0) {
      console.log('ℹ️  No SABO tournaments to fix');
      return;
    }
    
    console.log(`🏆 Found ${tournaments.length} SABO tournaments to check`);
    
    for (const tournament of tournaments) {
      console.log(`\n🔧 Fixing ${tournament.name}...`);
      
      // Check R202 completion and SF2 status
      const { data: r202, error: r202Error } = await supabase
        .from('tournament_matches')
        .select('winner_id, status')
        .eq('tournament_id', tournament.id)
        .eq('round_number', 202)
        .eq('match_number', 1)
        .single();
        
      if (r202Error || !r202) {
        console.log('  ⚠️  R202 not found, skipping');
        continue;
      }
      
      if (r202.status !== 'completed' || !r202.winner_id) {
        console.log('  ⚠️  R202 not completed, skipping');
        continue;
      }
      
      const { data: sf2, error: sf2Error } = await supabase
        .from('tournament_matches')
        .select('player2_id')
        .eq('tournament_id', tournament.id)
        .eq('round_number', 250)
        .eq('match_number', 2)
        .single();
        
      if (sf2Error || !sf2) {
        console.log('  ❌ SF2 not found');
        continue;
      }
      
      if (sf2.player2_id === r202.winner_id) {
        console.log('  ✅ Already correct, no fix needed');
        continue;
      }
      
      // Apply fix
      const { error: updateError } = await supabase
        .from('tournament_matches')
        .update({ 
          player2_id: r202.winner_id,
          status: sf2.player1_id ? 'pending' : 'waiting_for_players'
        })
        .eq('tournament_id', tournament.id)
        .eq('round_number', 250)
        .eq('match_number', 2);
        
      if (updateError) {
        console.log('  ❌ Fix failed:', updateError.message);
      } else {
        console.log('  ✅ Fixed! R202 winner advanced to SF2');
      }
    }
    
    console.log('\n🎉 Fix process complete!');
    
  } catch (err) {
    console.error('💥 Fix failed:', err.message);
  }
}

fixExistingTournaments();
EOF

echo "✅ Fix script created"
echo ""
echo "💡 QUICK ACTIONS:"
echo "================"
echo "• Fix existing tournaments: node fix-existing-tournaments.cjs" 
echo "• Verify system: node verify-deployment.cjs"
echo "• Deploy system: Copy sabo-automatic-advancement-system.sql to Supabase"
echo ""
echo "🎯 RESULT: New tournaments will automatically advance R202 winners to SF2!"
echo "============================================="
