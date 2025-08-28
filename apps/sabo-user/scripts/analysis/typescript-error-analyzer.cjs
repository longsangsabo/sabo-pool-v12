/**
 * TypeScript Error Analyzer
 * Categorizes and prioritizes TypeScript compilation errors
 */
const fs = require('fs');
const { execSync } = require('child_process');

const analyzeTypeScriptErrors = () => {
  console.log('🔍 Analyzing TypeScript errors...');
  
  try {
    // Run type check and capture output
    const result = execSync('npm run type-check', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('✅ No TypeScript errors found!');
    return [];
  } catch (error) {
    const output = error.stdout || error.stderr;
    
    // Parse errors by category
    const errors = {
      environmentTypes: [],
      missingModules: [],
      tournamentTypes: [],
      saboTypes: [],
      componentTypes: [],
      other: []
    };
    
    const lines = output.split('\n');
    lines.forEach(line => {
      if (line.includes('import.meta.env')) {
        errors.environmentTypes.push(line);
      } else if (line.includes('Cannot find module')) {
        errors.missingModules.push(line);
      } else if (line.includes('tournament') && line.includes('does not exist')) {
        errors.tournamentTypes.push(line);
      } else if (line.includes('SABO') || line.includes('bracket_type')) {
        errors.saboTypes.push(line);
      } else if (line.includes('TS2322') || line.includes('TS2339')) {
        errors.componentTypes.push(line);
      } else if (line.includes('error TS')) {
        errors.other.push(line);
      }
    });
    
    // Generate report
    console.log('\n📊 TypeScript Error Analysis Report:');
    console.log('=====================================');
    console.log(`🔴 Environment Types: ${errors.environmentTypes.length}`);
    console.log(`🔴 Missing Modules: ${errors.missingModules.length}`);
    console.log(`🔴 Tournament Types: ${errors.tournamentTypes.length}`);
    console.log(`🔴 SABO Types: ${errors.saboTypes.length}`);
    console.log(`🔴 Component Types: ${errors.componentTypes.length}`);
    console.log(`🔴 Other: ${errors.other.length}`);
    
    // Save detailed report
    fs.writeFileSync('scripts/analysis/typescript-errors-report.json', 
      JSON.stringify(errors, null, 2));
    
    console.log('\n📄 Detailed report saved to: scripts/analysis/typescript-errors-report.json');
    
    return errors;
  }
};

// Priority order for fixes
const getPriorityOrder = (errors) => {
  return [
    { category: 'environmentTypes', priority: 1, effort: 'Low' },
    { category: 'missingModules', priority: 2, effort: 'Low' },
    { category: 'tournamentTypes', priority: 3, effort: 'High' },
    { category: 'saboTypes', priority: 4, effort: 'Medium' },
    { category: 'componentTypes', priority: 5, effort: 'Medium' },
    { category: 'other', priority: 6, effort: 'Variable' }
  ];
};

if (require.main === module) {
  const errors = analyzeTypeScriptErrors();
  const priorities = getPriorityOrder(errors);
  
  console.log('\n🎯 Recommended Fix Order:');
  priorities.forEach((item, index) => {
    const count = errors[item.category]?.length || 0;
    console.log(`${index + 1}. ${item.category}: ${count} errors (${item.effort} effort)`);
  });
}

module.exports = { analyzeTypeScriptErrors, getPriorityOrder };
