/**
 * Console.log Analyzer
 * Categorizes console.log statements for intelligent cleanup
 */
const fs = require('fs');
const path = require('path');

const analyzeConsoleLogs = () => {
  console.log('🔍 Analyzing console.log statements...');
  
  const categories = {
    debug: [],           // Development debugging
    errors: [],          // Error logging (keep but convert)
    userFeedback: [],    // User notifications (convert to toast)
    performance: [],     // Performance monitoring (keep but use logger)
    testing: [],         // Test-related logs
    other: []
  };
  
  const scanDirectory = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        scanDirectory(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        scanFile(filePath);
      }
    });
  };
  
  const scanFile = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (line.includes('console.log') || line.includes('console.error') || 
          line.includes('console.warn') || line.includes('console.info')) {
        
        const logEntry = {
          file: filePath,
          line: index + 1,
          content: line.trim(),
          context: getContext(lines, index)
        };
        
        // Categorize based on content
        if (line.includes('🧹') || line.includes('debug') || line.includes('Debug')) {
          categories.debug.push(logEntry);
        } else if (line.includes('error') || line.includes('Error') || line.includes('console.error')) {
          categories.errors.push(logEntry);
        } else if (line.includes('✅') || line.includes('success') || line.includes('completed')) {
          categories.userFeedback.push(logEntry);
        } else if (line.includes('performance') || line.includes('time') || line.includes('ms')) {
          categories.performance.push(logEntry);
        } else if (filePath.includes('test') || filePath.includes('__tests__')) {
          categories.testing.push(logEntry);
        } else {
          categories.other.push(logEntry);
        }
      }
    });
  };
  
  const getContext = (lines, index) => {
    const start = Math.max(0, index - 2);
    const end = Math.min(lines.length, index + 3);
    return lines.slice(start, end).map((line, i) => 
      `${start + i + 1}: ${line}`
    ).join('\n');
  };
  
  scanDirectory('./src');
  
  // Generate report
  console.log('\n📊 Console.log Analysis Report:');
  console.log('===============================');
  console.log(`🟡 Debug statements: ${categories.debug.length} (REMOVE)`);
  console.log(`🔴 Error statements: ${categories.errors.length} (CONVERT to Logger)`);
  console.log(`🟢 User feedback: ${categories.userFeedback.length} (CONVERT to Toast)`);
  console.log(`🔵 Performance: ${categories.performance.length} (CONVERT to Logger)`);
  console.log(`🟣 Testing: ${categories.testing.length} (KEEP)`);
  console.log(`⚪ Other: ${categories.other.length} (REVIEW)`);
  
  // Save detailed report
  fs.writeFileSync('scripts/analysis/console-log-report.json', 
    JSON.stringify(categories, null, 2));
  
  console.log('\n📄 Detailed report saved to: scripts/analysis/console-log-report.json');
  
  return categories;
};

if (require.main === module) {
  analyzeConsoleLogs();
}

module.exports = { analyzeConsoleLogs };
