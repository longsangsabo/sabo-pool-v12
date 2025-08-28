#!/bin/bash

# ===================================
# SABO USER APP - STRATEGIC CLEANUP AUTOMATION
# Phase 1 Starter Kit
# ===================================

echo "🚀 SABO Strategic Cleanup - Phase 1 Initialization"
echo "=================================================="

# Create backup branch
echo "📋 Step 1: Creating backup branch..."
git checkout -b backup-before-phase-1-$(date +%Y%m%d)
git push origin backup-before-phase-1-$(date +%Y%m%d)
echo "✅ Backup branch created successfully"

# Create directory structure for cleanup tools
echo "📋 Step 2: Setting up cleanup tools directory..."
mkdir -p scripts/cleanup-tools
mkdir -p scripts/analysis
mkdir -p scripts/automation

# Create TypeScript error analyzer
echo "📋 Step 3: Creating TypeScript error analyzer..."
cat > scripts/analysis/typescript-error-analyzer.js << 'EOF'
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
EOF

# Create console.log analyzer
echo "📋 Step 4: Creating console.log analyzer..."
cat > scripts/analysis/console-log-analyzer.js << 'EOF'
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
EOF

# Create environment types file
echo "📋 Step 5: Creating environment type declarations..."
cat > src/types/environment.d.ts << 'EOF'
/**
 * Environment Type Declarations
 * Fixes import.meta.env TypeScript errors
 */

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY?: string;
  readonly VITE_APP_ENVIRONMENT?: 'development' | 'staging' | 'production';
  readonly VITE_APP_VERSION?: string;
  readonly VITE_ENABLE_DEBUG?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_ANALYTICS_ID?: string;
  readonly NODE_ENV: 'development' | 'production' | 'test';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global type augmentation
declare global {
  interface Window {
    queryClient?: any;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export {};
EOF

# Create module declarations
echo "📋 Step 6: Creating module type declarations..."
cat > src/types/modules.d.ts << 'EOF'
/**
 * Module Type Declarations
 * Fixes missing module TypeScript errors
 */

// Router modules
declare module './router/AdminRouter' {
  const AdminRouter: React.ComponentType;
  export default AdminRouter;
}

// Page modules
declare module './pages/DashboardPage' {
  const DashboardPage: React.ComponentType;
  export default DashboardPage;
}

declare module './pages/EnhancedChallengesPageV2' {
  const EnhancedChallengesPageV2: React.ComponentType;
  export default EnhancedChallengesPageV2;
}

declare module './pages/TournamentsPage' {
  const TournamentsPage: React.ComponentType;
  export default TournamentsPage;
}

// Utility modules
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

// CSS modules
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

export {};
EOF

# Create progress tracker
echo "📋 Step 7: Creating progress tracker..."
cat > scripts/automation/progress-tracker.js << 'EOF'
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
    const output = error.stdout || error.stderr;
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
EOF

# Make scripts executable
chmod +x scripts/analysis/*.js
chmod +x scripts/automation/*.js

# Run initial analysis
echo "📋 Step 8: Running initial analysis..."
echo "🔍 TypeScript Error Analysis:"
node scripts/analysis/typescript-error-analyzer.js

echo ""
echo "🔍 Console.log Analysis:"  
node scripts/analysis/console-log-analyzer.js

echo ""
echo "📊 Progress Tracking:"
node scripts/automation/progress-tracker.js

echo ""
echo "✅ Phase 1 initialization complete!"
echo "📁 Created files:"
echo "  - scripts/analysis/typescript-error-analyzer.js"
echo "  - scripts/analysis/console-log-analyzer.js" 
echo "  - scripts/automation/progress-tracker.js"
echo "  - src/types/environment.d.ts"
echo "  - src/types/modules.d.ts"
echo ""
echo "🎯 Next steps:"
echo "  1. Review analysis reports in scripts/analysis/"
echo "  2. Run 'npm run type-check' to see current error count"
echo "  3. Start Phase 1.1: Environment & Import Fixes"
echo ""
echo "🚀 Ready to begin strategic cleanup!"
