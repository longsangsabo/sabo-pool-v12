#!/usr/bin/env node

/**
 * SABO Arena Performance Benchmarking Script
 * Analyzes bundle sizes, performance metrics, and generates reports
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PerformanceBenchmark {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      bundleAnalysis: {},
      performanceMetrics: {},
      recommendations: [],
    };
  }

  // Analyze bundle sizes for both apps
  async analyzeBundles() {
    console.log('📊 Analyzing bundle sizes...');
    
    const apps = ['sabo-user', 'sabo-admin'];
    
    for (const app of apps) {
      const appPath = path.join(process.cwd(), 'apps', app);
      const distPath = path.join(appPath, 'dist');
      
      if (!fs.existsSync(distPath)) {
        console.log(`⚠️  Building ${app} for analysis...`);
        try {
          execSync(`cd ${appPath} && npm run build`, { stdio: 'inherit' });
        } catch (error) {
          console.error(`❌ Failed to build ${app}:`, error.message);
          continue;
        }
      }
      
      const analysis = this.analyzeBundleDirectory(distPath);
      this.results.bundleAnalysis[app] = analysis;
      
      console.log(`📦 ${app} Bundle Analysis:`);
      console.log(`   Total Size: ${this.formatBytes(analysis.totalSize)}`);
      console.log(`   JS Files: ${analysis.jsFiles.length}`);
      console.log(`   CSS Files: ${analysis.cssFiles.length}`);
      console.log(`   Largest File: ${this.formatBytes(analysis.largestFile.size)} (${analysis.largestFile.name})`);
    }
  }

  analyzeBundleDirectory(dirPath) {
    const analysis = {
      totalSize: 0,
      jsFiles: [],
      cssFiles: [],
      otherFiles: [],
      largestFile: { name: '', size: 0 },
    };

    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else {
          const fileInfo = {
            name: file,
            path: filePath,
            size: stat.size,
            relativePath: path.relative(dirPath, filePath),
          };
          
          analysis.totalSize += stat.size;
          
          if (stat.size > analysis.largestFile.size) {
            analysis.largestFile = {
              name: fileInfo.relativePath,
              size: stat.size,
            };
          }
          
          const ext = path.extname(file).toLowerCase();
          if (ext === '.js' || ext === '.mjs') {
            analysis.jsFiles.push(fileInfo);
          } else if (ext === '.css') {
            analysis.cssFiles.push(fileInfo);
          } else {
            analysis.otherFiles.push(fileInfo);
          }
        }
      });
    };

    walkDir(dirPath);
    
    // Sort files by size (descending)
    analysis.jsFiles.sort((a, b) => b.size - a.size);
    analysis.cssFiles.sort((a, b) => b.size - a.size);
    
    return analysis;
  }

  // Performance metrics analysis
  analyzePerformanceMetrics() {
    console.log('⚡ Analyzing performance metrics...');
    
    const metrics = {
      bundleOptimization: this.calculateBundleOptimization(),
      loadingPerformance: this.estimateLoadingPerformance(),
      codeEfficiency: this.analyzeCodeEfficiency(),
    };
    
    this.results.performanceMetrics = metrics;
    
    console.log('📈 Performance Metrics:');
    console.log(`   Bundle Optimization Score: ${metrics.bundleOptimization.score}/100`);
    console.log(`   Estimated Load Time (3G): ${metrics.loadingPerformance.estimated3G}s`);
    console.log(`   Code Efficiency: ${metrics.codeEfficiency.score}/100`);
  }

  calculateBundleOptimization() {
    let score = 100;
    const issues = [];
    
    Object.entries(this.results.bundleAnalysis).forEach(([app, analysis]) => {
      // Check for oversized bundles
      if (analysis.totalSize > 15 * 1024 * 1024) { // 15MB threshold
        score -= 20;
        issues.push(`${app}: Bundle size (${this.formatBytes(analysis.totalSize)}) exceeds 15MB`);
      }
      
      // Check for too many JS files (suggests poor chunking)
      if (analysis.jsFiles.length > 50) {
        score -= 10;
        issues.push(`${app}: Too many JS files (${analysis.jsFiles.length}) - consider better chunking`);
      }
      
      // Check for very large individual files
      if (analysis.largestFile.size > 1024 * 1024) { // 1MB threshold
        score -= 15;
        issues.push(`${app}: Large file detected (${analysis.largestFile.name}: ${this.formatBytes(analysis.largestFile.size)})`);
      }
    });
    
    return { score: Math.max(0, score), issues };
  }

  estimateLoadingPerformance() {
    const estimates = {};
    
    Object.entries(this.results.bundleAnalysis).forEach(([app, analysis]) => {
      // Network speed estimates (bytes per second)
      const speeds = {
        '3G': 1.5 * 1024 * 1024, // 1.5 Mbps
        '4G': 25 * 1024 * 1024,  // 25 Mbps
        'Wifi': 100 * 1024 * 1024, // 100 Mbps
      };
      
      estimates[app] = {};
      Object.entries(speeds).forEach(([network, speed]) => {
        estimates[app][network] = (analysis.totalSize / speed).toFixed(2);
      });
    });
    
    // Return worst case (user app on 3G)
    return {
      estimates,
      estimated3G: estimates['sabo-user']?.['3G'] || 'N/A',
      estimated4G: estimates['sabo-user']?.['4G'] || 'N/A',
    };
  }

  analyzeCodeEfficiency() {
    let score = 100;
    const suggestions = [];
    
    // Check shared package utilization
    const sharedPackages = ['shared-auth', 'shared-hooks', 'shared-types', 'shared-ui', 'shared-utils'];
    const packagePath = path.join(process.cwd(), 'packages');
    
    sharedPackages.forEach(pkg => {
      const pkgPath = path.join(packagePath, pkg, 'src');
      if (fs.existsSync(pkgPath)) {
        const files = this.countFiles(pkgPath);
        if (files.total === 0) {
          score -= 5;
          suggestions.push(`Empty shared package: ${pkg}`);
        }
      }
    });
    
    // Check for potential duplications
    const userBundleSize = this.results.bundleAnalysis['sabo-user']?.totalSize || 0;
    const adminBundleSize = this.results.bundleAnalysis['sabo-admin']?.totalSize || 0;
    
    if (userBundleSize > adminBundleSize * 10) {
      score -= 15;
      suggestions.push('Large size difference between apps suggests possible code duplication');
    }
    
    return { score: Math.max(0, score), suggestions };
  }

  countFiles(dir) {
    let count = { total: 0, ts: 0, tsx: 0, js: 0, jsx: 0 };
    
    if (!fs.existsSync(dir)) return count;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        const subCount = this.countFiles(filePath);
        count.total += subCount.total;
        count.ts += subCount.ts;
        count.tsx += subCount.tsx;
        count.js += subCount.js;
        count.jsx += subCount.jsx;
      } else {
        count.total++;
        const ext = path.extname(file);
        if (ext === '.ts') count.ts++;
        else if (ext === '.tsx') count.tsx++;
        else if (ext === '.js') count.js++;
        else if (ext === '.jsx') count.jsx++;
      }
    });
    
    return count;
  }

  // Generate optimization recommendations
  generateRecommendations() {
    console.log('💡 Generating optimization recommendations...');
    
    const recommendations = [];
    
    // Bundle size recommendations
    Object.entries(this.results.bundleAnalysis).forEach(([app, analysis]) => {
      if (analysis.totalSize > 10 * 1024 * 1024) {
        recommendations.push({
          category: 'Bundle Size',
          severity: 'high',
          app,
          issue: `Large bundle size (${this.formatBytes(analysis.totalSize)})`,
          suggestion: 'Implement code splitting and lazy loading for non-critical routes',
        });
      }
      
      if (analysis.jsFiles.length > 20) {
        recommendations.push({
          category: 'Bundle Organization',
          severity: 'medium',
          app,
          issue: `Many JS files (${analysis.jsFiles.length})`,
          suggestion: 'Optimize chunk splitting strategy in Vite configuration',
        });
      }
    });
    
    // Performance recommendations
    const perfMetrics = this.results.performanceMetrics;
    
    if (perfMetrics.bundleOptimization.score < 80) {
      recommendations.push({
        category: 'Bundle Optimization',
        severity: 'high',
        issue: `Low optimization score (${perfMetrics.bundleOptimization.score}/100)`,
        suggestion: 'Address bundle size and chunking issues',
      });
    }
    
    if (parseFloat(perfMetrics.loadingPerformance.estimated3G) > 5) {
      recommendations.push({
        category: 'Loading Performance',
        severity: 'high',
        issue: `Slow 3G loading (${perfMetrics.loadingPerformance.estimated3G}s)`,
        suggestion: 'Implement aggressive code splitting and consider service worker caching',
      });
    }
    
    this.results.recommendations = recommendations;
    
    console.log(`📝 Generated ${recommendations.length} recommendations`);
  }

  // Generate comprehensive report
  generateReport() {
    const reportPath = path.join(process.cwd(), 'PERFORMANCE_BENCHMARK_REPORT.md');
    
    const report = `# 📊 SABO Arena Performance Benchmark Report

Generated: ${this.results.timestamp}

## 📦 Bundle Analysis

${Object.entries(this.results.bundleAnalysis).map(([app, analysis]) => `
### ${app}

- **Total Size**: ${this.formatBytes(analysis.totalSize)}
- **JavaScript Files**: ${analysis.jsFiles.length}
- **CSS Files**: ${analysis.cssFiles.length}
- **Largest File**: ${analysis.largestFile.name} (${this.formatBytes(analysis.largestFile.size)})

#### Top 5 Largest JS Files:
${analysis.jsFiles.slice(0, 5).map(file => 
  `- ${file.relativePath}: ${this.formatBytes(file.size)}`
).join('\n')}
`).join('\n')}

## ⚡ Performance Metrics

### Bundle Optimization Score: ${this.results.performanceMetrics.bundleOptimization.score}/100

${this.results.performanceMetrics.bundleOptimization.issues.length > 0 ? `
**Issues:**
${this.results.performanceMetrics.bundleOptimization.issues.map(issue => `- ${issue}`).join('\n')}
` : '✅ No bundle optimization issues detected'}

### Loading Performance Estimates

| Network | User App | Admin App |
|---------|----------|-----------|
| 3G | ${this.results.performanceMetrics.loadingPerformance.estimates['sabo-user']?.['3G'] || 'N/A'}s | ${this.results.performanceMetrics.loadingPerformance.estimates['sabo-admin']?.['3G'] || 'N/A'}s |
| 4G | ${this.results.performanceMetrics.loadingPerformance.estimates['sabo-user']?.['4G'] || 'N/A'}s | ${this.results.performanceMetrics.loadingPerformance.estimates['sabo-admin']?.['4G'] || 'N/A'}s |
| WiFi | ${this.results.performanceMetrics.loadingPerformance.estimates['sabo-user']?.['Wifi'] || 'N/A'}s | ${this.results.performanceMetrics.loadingPerformance.estimates['sabo-admin']?.['Wifi'] || 'N/A'}s |

### Code Efficiency Score: ${this.results.performanceMetrics.codeEfficiency.score}/100

${this.results.performanceMetrics.codeEfficiency.suggestions.length > 0 ? `
**Suggestions:**
${this.results.performanceMetrics.codeEfficiency.suggestions.map(suggestion => `- ${suggestion}`).join('\n')}
` : '✅ No code efficiency issues detected'}

## 💡 Recommendations

${this.results.recommendations.length > 0 ? 
  this.results.recommendations.map(rec => `
### ${rec.category} ${rec.severity === 'high' ? '🔴' : rec.severity === 'medium' ? '🟡' : '🟢'}

**Issue**: ${rec.issue}  
**Suggestion**: ${rec.suggestion}  
${rec.app ? `**App**: ${rec.app}` : ''}
`).join('\n') : '✅ No optimization recommendations at this time'}

## 🎯 Performance Targets

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| User App Bundle Size | ${this.formatBytes(this.results.bundleAnalysis['sabo-user']?.totalSize || 0)} | < 10MB | ${(this.results.bundleAnalysis['sabo-user']?.totalSize || 0) < 10 * 1024 * 1024 ? '✅' : '❌'} |
| Admin App Bundle Size | ${this.formatBytes(this.results.bundleAnalysis['sabo-admin']?.totalSize || 0)} | < 5MB | ${(this.results.bundleAnalysis['sabo-admin']?.totalSize || 0) < 5 * 1024 * 1024 ? '✅' : '❌'} |
| 3G Load Time | ${this.results.performanceMetrics.loadingPerformance.estimated3G}s | < 3s | ${parseFloat(this.results.performanceMetrics.loadingPerformance.estimated3G || '999') < 3 ? '✅' : '❌'} |
| Bundle Optimization | ${this.results.performanceMetrics.bundleOptimization.score}/100 | > 90 | ${this.results.performanceMetrics.bundleOptimization.score > 90 ? '✅' : '❌'} |

## 📅 Next Steps

1. **High Priority**: Address all high-severity recommendations
2. **Medium Priority**: Implement medium-severity optimizations
3. **Monitoring**: Set up continuous performance monitoring
4. **Automation**: Integrate this benchmark into CI/CD pipeline

---

*Report generated by SABO Arena Performance Benchmark Tool*
*Last updated: ${this.results.timestamp}*
`;

    fs.writeFileSync(reportPath, report);
    console.log(`📄 Performance report generated: ${reportPath}`);
    
    return reportPath;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Run complete benchmark
  async run() {
    console.log('🚀 Starting SABO Arena Performance Benchmark...\n');
    
    await this.analyzeBundles();
    console.log('');
    
    this.analyzePerformanceMetrics();
    console.log('');
    
    this.generateRecommendations();
    console.log('');
    
    const reportPath = this.generateReport();
    
    console.log('\n✅ Performance benchmark completed!');
    console.log(`📊 View detailed report: ${reportPath}`);
    
    // Summary output
    console.log('\n📋 Quick Summary:');
    console.log(`   User App: ${this.formatBytes(this.results.bundleAnalysis['sabo-user']?.totalSize || 0)}`);
    console.log(`   Admin App: ${this.formatBytes(this.results.bundleAnalysis['sabo-admin']?.totalSize || 0)}`);
    console.log(`   Optimization Score: ${this.results.performanceMetrics.bundleOptimization.score}/100`);
    console.log(`   Recommendations: ${this.results.recommendations.length}`);
    
    return this.results;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new PerformanceBenchmark();
  benchmark.run().catch(error => {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  });
}

export default PerformanceBenchmark;
