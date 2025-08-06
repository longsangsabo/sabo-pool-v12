#!/usr/bin/env node

/**
 * SYSTEM TEST RUNNER
 * Tests all components of the doc cleanup system
 */

const fs = require('fs').promises;
const path = require('path');
const { analyzeFiles, classifyFiles, cosineSimilarity, extractTopics } = require('../file-analyzer');
const { Logger } = require('../utils/logger');
const { BackupManager } = require('../utils/backup');

class TestRunner {
  constructor() {
    this.logger = new Logger({ logLevel: 'debug' });
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async runTest(testName, testFunction) {
    try {
      console.log(`🧪 Running test: ${testName}`);
      await testFunction();
      this.testResults.push({ name: testName, status: 'PASSED' });
      this.passedTests++;
      console.log(`✅ ${testName} - PASSED`);
    } catch (error) {
      this.testResults.push({ 
        name: testName, 
        status: 'FAILED', 
        error: error.message 
      });
      this.failedTests++;
      console.log(`❌ ${testName} - FAILED: ${error.message}`);
    }
  }

  async testCosineSimilarity() {
    const text1 = "This is a test document about machine learning and AI";
    const text2 = "This document discusses machine learning and artificial intelligence";
    const text3 = "Completely different content about cooking recipes";

    const similarity12 = cosineSimilarity(text1, text2);
    const similarity13 = cosineSimilarity(text1, text3);

    if (similarity12 < 0.5) {
      throw new Error(`Expected high similarity between similar texts, got ${similarity12}`);
    }

    if (similarity13 > 0.3) {
      throw new Error(`Expected low similarity between different texts, got ${similarity13}`);
    }
  }

  async testTopicExtraction() {
    const content = `
    This document covers machine learning algorithms, neural networks, 
    and deep learning techniques. We discuss various machine learning 
    approaches including supervised learning, unsupervised learning,
    and reinforcement learning paradigms.
    `;

    const topics = extractTopics(content);
    
    if (!topics.includes('machine') || !topics.includes('learning')) {
      throw new Error(`Expected 'machine' and 'learning' in topics, got: ${topics.join(', ')}`);
    }

    if (topics.length === 0) {
      throw new Error('No topics extracted');
    }
  }

  async testFileAnalysis() {
    // Create test files
    await this.createTestFiles();

    try {
      const analysis = await analyzeFiles();
      
      if (!analysis || typeof analysis !== 'object') {
        throw new Error('Analysis should return an object');
      }

      if (!Array.isArray(analysis.files)) {
        throw new Error('Analysis should include files array');
      }

      if (analysis.totalFiles === 0) {
        throw new Error('Should find at least some files in the project');
      }

    } finally {
      await this.cleanupTestFiles();
    }
  }

  async testFileClassification() {
    const mockAnalysis = {
      totalFiles: 4,
      files: [
        {
          path: '/test/old-file.md',
          modified: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days old
          isWhitelisted: false,
          isTempFile: false,
          hasVersionSuffix: false,
          content: 'old content'
        },
        {
          path: '/test/README.md',
          modified: new Date(),
          isWhitelisted: true,
          isTempFile: false,
          hasVersionSuffix: false,
          content: 'readme content'
        },
        {
          path: '/test/temp.tmp',
          modified: new Date(),
          isWhitelisted: false,
          isTempFile: true,
          hasVersionSuffix: false,
          content: 'temp content'
        },
        {
          path: '/test/document_v2.md',
          modified: new Date(),
          isWhitelisted: false,
          isTempFile: false,
          hasVersionSuffix: true,
          content: 'versioned content'
        }
      ],
      duplicateGroups: []
    };

    const classified = await classifyFiles(mockAnalysis, {
      archiveAfterDays: 90,
      whitelist: ['README.md']
    });

    if (classified.protected.length !== 1) {
      throw new Error(`Expected 1 protected file, got ${classified.protected.length}`);
    }

    if (classified.archive.length !== 1) {
      throw new Error(`Expected 1 archived file, got ${classified.archive.length}`);
    }

    if (classified.tempFiles.length !== 1) {
      throw new Error(`Expected 1 temp file, got ${classified.tempFiles.length}`);
    }

    if (classified.outdated.length !== 1) {
      throw new Error(`Expected 1 outdated file, got ${classified.outdated.length}`);
    }
  }

  async testLogger() {
    const testLogger = new Logger({ 
      logLevel: 'debug',
      logDir: '/tmp/test-logs'
    });

    await testLogger.info('Test info message');
    await testLogger.error('Test error message');
    await testLogger.debug('Test debug message');

    // Check if log file was created
    const logFile = '/tmp/test-logs/cleanup.log';
    try {
      const logContent = await fs.readFile(logFile, 'utf8');
      if (!logContent.includes('Test info message')) {
        throw new Error('Log message not found in file');
      }
    } catch (error) {
      throw new Error(`Log file not created or readable: ${error.message}`);
    }

    // Cleanup
    try {
      await fs.unlink(logFile);
      await fs.rmdir('/tmp/test-logs');
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  async testBackupManager() {
    const testBackup = new BackupManager({
      backupDir: '/tmp/test-backups',
      retentionDays: 1
    });

    const testFiles = [
      {
        path: '/tmp/test-file.txt',
        contentHash: 'abc123'
      }
    ];

    // Create test file
    await fs.writeFile('/tmp/test-file.txt', 'test content');

    try {
      const backup = await testBackup.createBackup(testFiles, 'test-backup');
      
      if (!backup.id) {
        throw new Error('Backup should have an ID');
      }

      const backups = await testBackup.listBackups();
      if (backups.length === 0) {
        throw new Error('Should find created backup');
      }

    } finally {
      // Cleanup
      try {
        await fs.unlink('/tmp/test-file.txt');
        await fs.rmdir('/tmp/test-backups', { recursive: true });
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }

  async createTestFiles() {
    const testDir = '/tmp/doc-cleanup-test';
    await fs.mkdir(testDir, { recursive: true });

    await fs.writeFile(
      path.join(testDir, 'test1.md'),
      'This is a test document for the cleanup system'
    );

    await fs.writeFile(
      path.join(testDir, 'test2.md'),
      'This is a test document for the cleanup system' // Duplicate content
    );

    await fs.writeFile(
      path.join(testDir, 'temp.tmp'),
      'Temporary file content'
    );
  }

  async cleanupTestFiles() {
    try {
      await fs.rmdir('/tmp/doc-cleanup-test', { recursive: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Doc Cleanup System Tests');
    console.log('=====================================\n');

    await this.runTest('Cosine Similarity Algorithm', () => this.testCosineSimilarity());
    await this.runTest('Topic Extraction', () => this.testTopicExtraction());
    await this.runTest('File Analysis Engine', () => this.testFileAnalysis());
    await this.runTest('File Classification', () => this.testFileClassification());
    await this.runTest('Logging System', () => this.testLogger());
    await this.runTest('Backup Manager', () => this.testBackupManager());

    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`📈 Success Rate: ${Math.round((this.passedTests / (this.passedTests + this.failedTests)) * 100)}%`);

    if (this.failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`  • ${test.name}: ${test.error}`);
        });
    }

    console.log('\n🏁 Testing Complete!');
    
    return this.failedTests === 0;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test runner crashed:', error);
      process.exit(1);
    });
}

module.exports = { TestRunner };
