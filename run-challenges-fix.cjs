const { spawn } = require('child_process');

function runScript(scriptName, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 ${description}`);
    console.log(`📝 Running: node ${scriptName}`);
    console.log('═'.repeat(60));

    const child = spawn('node', [scriptName], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      console.log('═'.repeat(60));
      if (code === 0) {
        console.log(`✅ ${scriptName} completed successfully\n`);
        resolve();
      } else {
        console.log(`❌ ${scriptName} failed with code ${code}\n`);
        reject(new Error(`Script failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      console.error(`❌ Error running ${scriptName}:`, error);
      reject(error);
    });
  });
}

async function runAllFixes() {
  console.log('🔧 CHALLENGES DATABASE FIX - COMPLETE SOLUTION');
  console.log('🎯 This will fix the schema and update existing data');
  console.log('=' .repeat(70));

  try {
    // Step 1: Fix database schema and RLS policies
    await runScript('fix-challenges-schema.cjs', 'STEP 1: Fix Database Schema & RLS Policies');
    
    // Step 2: Check current data
    await runScript('check-challenges-data.cjs', 'STEP 2: Check Current Challenges Data');
    
    // Step 3: Update old challenges with missing data
    await runScript('update-old-challenges.cjs', 'STEP 3: Update Old Challenges with Missing Data');
    
    // Step 4: Final verification
    await runScript('check-challenges-data.cjs', 'STEP 4: Final Data Verification');

    console.log('🎉 ALL FIXES COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(70));
    console.log('✅ Database schema updated');
    console.log('✅ RLS policies fixed');
    console.log('✅ Old challenges updated');
    console.log('✅ Data verified');
    console.log('\n💡 Next steps:');
    console.log('   1. Refresh your dev server if running');
    console.log('   2. Test creating a new challenge');
    console.log('   3. Verify challenge cards show location and rank info');
    console.log('   4. Check that cancel buttons work for your challenges');

  } catch (error) {
    console.error('\n❌ Fix process failed:', error.message);
    console.log('\n🔧 You can run individual scripts:');
    console.log('   - node fix-challenges-schema.cjs');
    console.log('   - node check-challenges-data.cjs');
    console.log('   - node update-old-challenges.cjs');
    process.exit(1);
  }
}

// Run all fixes
runAllFixes();
