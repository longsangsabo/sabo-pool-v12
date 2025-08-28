/**
 * Progress Tracker
 * Tracks cleanup progress across all phases
 */
const fs = require('fs');
const { execSync } = require('child_process');

const trackProgress = () => {
  console.log('📊 SABO Cleanup Progress Tracker');
  console.log('================================');
  
  const progress = {
    timestamp: new Date().toISOString(),
    phase1: {
      typescriptErrors: getTypeScriptErrorCount(),
      buildSuccess: checkBuildSuccess(),
      devServerStart: checkDevServerStart()
    },
    phase2: {
      consoleLogCount: getConsoleLogCount(),
      cleanConsole: checkCleanConsole()
    },
    phase3: {
      typeConsistency: checkTypeConsistency(),
      documentationComplete: checkDocumentation()
    },
    overall: {
      codebaseHealth: 0,
      productionReadiness: 0
    }
  };
  
  // Calculate overall health
  progress.overall.codebaseHealth = calculateCodebaseHealth(progress);
  progress.overall.productionReadiness = calculateProductionReadiness(progress);
  
  // Display progress
  console.log(`🎯 Phase 1 - TypeScript: ${progress.phase1.typescriptErrors} errors`);
  console.log(`🎯 Phase 2 - Console.log: ${progress.phase2.consoleLogCount} statements`);
  console.log(`🎯 Overall Health: ${progress.overall.codebaseHealth}%`);
  console.log(`🎯 Production Ready: ${progress.overall.productionReadiness}%`);
  
  // Save progress
  fs.writeFileSync('scripts/progress-tracking.json', JSON.stringify(progress, null, 2));
  
  return progress;
};

const getTypeScriptErrorCount = () => {
  try {
    execSync('npm run type-check', { stdio: 'pipe' });
    return 0;
  } catch (error) {
    const output = (error.stdout || error.stderr || '').toString();
    const matches = output.match(/Found (\d+) error/);
    return matches ? parseInt(matches[1]) : 999;
  }
};

const getConsoleLogCount = () => {
  try {
    const result = execSync('grep -r "console\\.log" src/ --include="*.ts" --include="*.tsx" | wc -l', 
      { encoding: 'utf8' });
    return parseInt(result.trim());
  } catch (error) {
    return 0;
  }
};

const checkBuildSuccess = () => {
  try {
    execSync('npm run build', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
};

const checkDevServerStart = () => {
  // This would need a more sophisticated check in real implementation
  return true; // Placeholder
};

const checkCleanConsole = () => {
  return getConsoleLogCount() < 10;
};

const checkTypeConsistency = () => {
  // Check for consistent type usage - placeholder
  return false;
};

const checkDocumentation = () => {
  return fs.existsSync('src/types/README.md');
};

const calculateCodebaseHealth = (progress) => {
  let score = 0;
  
  // TypeScript health (40% weight)
  if (progress.phase1.typescriptErrors === 0) score += 40;
  else if (progress.phase1.typescriptErrors < 50) score += 20;
  else if (progress.phase1.typescriptErrors < 200) score += 10;
  
  // Console.log health (30% weight)
  if (progress.phase2.consoleLogCount < 10) score += 30;
  else if (progress.phase2.consoleLogCount < 100) score += 20;
  else if (progress.phase2.consoleLogCount < 500) score += 10;
  
  // Build health (20% weight)
  if (progress.phase1.buildSuccess) score += 20;
  
  // Type consistency (10% weight)
  if (progress.phase3.typeConsistency) score += 10;
  
  return Math.round(score);
};

const calculateProductionReadiness = (progress) => {
  if (progress.phase1.typescriptErrors === 0 && 
      progress.phase2.consoleLogCount < 10 && 
      progress.phase1.buildSuccess) {
    return 100;
  }
  
  if (progress.phase1.typescriptErrors < 10 && 
      progress.phase2.consoleLogCount < 50) {
    return 75;
  }
  
  if (progress.phase1.typescriptErrors < 100) {
    return 40;
  }
  
  return 10;
};

if (require.main === module) {
  trackProgress();
}

module.exports = { trackProgress };
