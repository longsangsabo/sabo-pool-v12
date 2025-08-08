/**
 * CONTENT ANALYSIS ENGINE
 * Advanced file analysis with NLP, duplicate detection, and intelligent classification
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// Text similarity calculation using cosine similarity
function cosineSimilarity(str1, str2) {
  const words1 = str1.toLowerCase().match(/\w+/g) || [];
  const words2 = str2.toLowerCase().match(/\w+/g) || [];

  const wordSet = new Set([...words1, ...words2]);
  const vector1 = Array.from(wordSet).map(
    word => words1.filter(w => w === word).length
  );
  const vector2 = Array.from(wordSet).map(
    word => words2.filter(w => w === word).length
  );

  const dotProduct = vector1.reduce((sum, a, i) => sum + a * vector2[i], 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum, a) => sum + a * a, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, a) => sum + a * a, 0));

  return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
}

// Extract key topics using simple keyword extraction
function extractTopics(content) {
  const commonWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
  ]);
  const words = content.toLowerCase().match(/\w+/g) || [];
  const wordCount = {};

  words.forEach(word => {
    if (word.length > 3 && !commonWords.has(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });

  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

// Initialize configuration
async function initializeConfig() {
  const configPath = path.join(__dirname, 'config.json');

  const defaultConfig = {
    scanPaths: ['/workspaces/sabo-pool-v11', '/workspaces/sabo-pool-v11/docs'],
    watchPaths: ['/workspaces/sabo-pool-v11/docs'],
    fileExtensions: ['.md', '.txt', '.rst', '.doc'],
    duplicateThreshold: 0.85,
    archiveAfterDays: 90,
    quarantineDays: 7,
    backupRetentionDays: 30,
    whitelist: [
      'README.md',
      'LICENSE',
      'CHANGELOG.md',
      'package.json',
      'tsconfig.json',
    ],
    tempFilePatterns: [
      /\.tmp$/,
      /\.backup$/,
      /untitled-.*$/,
      /copy of /i,
      /\(copy\)/i,
      /~$/,
    ],
    versionPatterns: [/_v\d+/, /_final/, /_old/, /_backup/, /_archive/],
    email: {
      enabled: false,
      recipients: [],
      smtpConfig: {},
    },
  };

  try {
    const existingConfig = await fs.readFile(configPath, 'utf8');
    const config = { ...defaultConfig, ...JSON.parse(existingConfig) };

    // Convert string patterns to RegExp objects
    config.tempFilePatterns = config.tempFilePatterns.map(pattern =>
      typeof pattern === 'string' ? new RegExp(pattern) : pattern
    );
    config.versionPatterns = config.versionPatterns.map(pattern =>
      typeof pattern === 'string' ? new RegExp(pattern) : pattern
    );

    return config;
  } catch {
    await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
}

// Analyze all files in the project
async function analyzeFiles(config = null) {
  if (!config) config = await initializeConfig();

  const analysis = {
    totalFiles: 0,
    files: [],
    contentHashes: {},
    duplicateGroups: [],
    topics: {},
    errors: [],
  };

  try {
    for (const scanPath of config.scanPaths) {
      await scanDirectory(scanPath, analysis, config);
    }

    // Find duplicates
    analysis.duplicateGroups = findDuplicates(
      analysis.files,
      config.duplicateThreshold
    );

    return analysis;
  } catch (error) {
    analysis.errors.push(`Analysis failed: ${error.message}`);
    return analysis;
  }
}

// Recursively scan directory for documents
async function scanDirectory(dirPath, analysis, config) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip certain directories
        if (
          !['node_modules', '.git', '.vscode', 'dist', 'build'].includes(
            entry.name
          )
        ) {
          await scanDirectory(fullPath, analysis, config);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (config.fileExtensions.includes(ext)) {
          await analyzeFile(fullPath, analysis, config);
        }
      }
    }
  } catch (error) {
    analysis.errors.push(`Failed to scan ${dirPath}: ${error.message}`);
  }
}

// Analyze individual file
async function analyzeFile(filePath, analysis, config) {
  try {
    const stats = await fs.stat(filePath);
    const content = await fs.readFile(filePath, 'utf8');
    const contentHash = crypto.createHash('md5').update(content).digest('hex');

    // Get git information if available
    let gitInfo = {};
    try {
      const lastCommit = execSync(
        `git log -1 --format="%h %ad" --date=short "${filePath}"`,
        { cwd: path.dirname(filePath), encoding: 'utf8' }
      ).trim();
      const [hash, date] = lastCommit.split(' ');
      gitInfo = { lastCommitHash: hash, lastCommitDate: date };
    } catch {
      // Git info not available
    }

    const fileInfo = {
      path: filePath,
      relativePath: path.relative('/workspaces/sabo-pool-v11', filePath),
      name: path.basename(filePath),
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime,
      contentHash,
      content: content.substring(0, 10000), // Limit content for analysis
      topics: extractTopics(content),
      wordCount: content.split(/\s+/).length,
      lineCount: content.split('\n').length,
      gitInfo,
      isWhitelisted: config.whitelist.some(
        pattern =>
          filePath.includes(pattern) || path.basename(filePath) === pattern
      ),
      isTempFile: config.tempFilePatterns.some(pattern =>
        pattern.test(filePath)
      ),
      hasVersionSuffix: config.versionPatterns.some(pattern =>
        pattern.test(filePath)
      ),
    };

    analysis.files.push(fileInfo);
    analysis.totalFiles++;

    // Group by content hash for duplicate detection
    if (!analysis.contentHashes[contentHash]) {
      analysis.contentHashes[contentHash] = [];
    }
    analysis.contentHashes[contentHash].push(fileInfo);

    // Aggregate topics
    fileInfo.topics.forEach(topic => {
      analysis.topics[topic] = (analysis.topics[topic] || 0) + 1;
    });
  } catch (error) {
    analysis.errors.push(`Failed to analyze ${filePath}: ${error.message}`);
  }
}

// Find duplicate files using content similarity
function findDuplicates(files, threshold) {
  const duplicateGroups = [];
  const processed = new Set();

  for (let i = 0; i < files.length; i++) {
    if (processed.has(i)) continue;

    const group = [files[i]];
    processed.add(i);

    for (let j = i + 1; j < files.length; j++) {
      if (processed.has(j)) continue;

      // Check content hash first (exact duplicates)
      if (files[i].contentHash === files[j].contentHash) {
        group.push(files[j]);
        processed.add(j);
      }
      // Check content similarity
      else {
        const similarity = cosineSimilarity(files[i].content, files[j].content);
        if (similarity >= threshold) {
          group.push(files[j]);
          processed.add(j);
        }
      }
    }

    if (group.length > 1) {
      duplicateGroups.push({
        files: group,
        type: group.every(f => f.contentHash === group[0].contentHash)
          ? 'exact'
          : 'similar',
      });
    }
  }

  return duplicateGroups;
}

// Classify files based on analysis
async function classifyFiles(analysis, config) {
  const now = new Date();
  const archiveDate = new Date(
    now.getTime() - config.archiveAfterDays * 24 * 60 * 60 * 1000
  );

  const classified = {
    active: [],
    archive: [],
    duplicates: [],
    outdated: [],
    orphaned: [],
    tempFiles: [],
    protected: [],
    allFiles: analysis.files,
  };

  for (const file of analysis.files) {
    // Protected files (whitelisted)
    if (file.isWhitelisted) {
      classified.protected.push(file);
      continue;
    }

    // Temporary files
    if (file.isTempFile) {
      classified.tempFiles.push(file);
      continue;
    }

    // Archive old files
    if (file.modified < archiveDate) {
      classified.archive.push(file);
      continue;
    }

    // Files with version suffixes are likely outdated
    if (file.hasVersionSuffix) {
      classified.outdated.push(file);
      continue;
    }

    // Check if file is referenced elsewhere
    const isReferenced = await checkFileReferences(
      file.relativePath,
      analysis.files
    );
    if (!isReferenced && file.accessed < archiveDate) {
      classified.orphaned.push(file);
      continue;
    }

    // Default to active
    classified.active.push(file);
  }

  // Add duplicates from analysis
  analysis.duplicateGroups.forEach(group => {
    classified.duplicates.push(...group.files.slice(1)); // Keep first, mark rest as duplicates
  });

  return classified;
}

// Check if file is referenced in other files
async function checkFileReferences(relativePath, allFiles) {
  const fileName = path.basename(relativePath);
  const pathWithoutExt = relativePath.replace(path.extname(relativePath), '');

  for (const file of allFiles) {
    if (file.relativePath === relativePath) continue;

    const content = file.content.toLowerCase();
    if (
      content.includes(fileName.toLowerCase()) ||
      content.includes(pathWithoutExt.toLowerCase()) ||
      content.includes(relativePath.toLowerCase())
    ) {
      return true;
    }
  }

  return false;
}

// Perform cleanup actions
async function performCleanup(classified, config) {
  const result = {
    archived: [],
    quarantined: [],
    deleted: [],
    merged: [],
    errors: [],
  };

  try {
    // Create necessary directories
    await ensureDirectories();

    // Archive old files
    for (const file of classified.archive) {
      try {
        await archiveFile(file, result);
      } catch (error) {
        result.errors.push(`Failed to archive ${file.path}: ${error.message}`);
      }
    }

    // Quarantine duplicates and temp files
    for (const file of [
      ...classified.duplicates,
      ...classified.tempFiles,
      ...classified.orphaned,
    ]) {
      try {
        await quarantineFile(file, result);
      } catch (error) {
        result.errors.push(
          `Failed to quarantine ${file.path}: ${error.message}`
        );
      }
    }

    // Handle outdated files
    for (const file of classified.outdated) {
      try {
        await quarantineFile(file, result);
      } catch (error) {
        result.errors.push(
          `Failed to handle outdated ${file.path}: ${error.message}`
        );
      }
    }

    return result;
  } catch (error) {
    result.errors.push(`Cleanup failed: ${error.message}`);
    return result;
  }
}

// Ensure necessary directories exist
async function ensureDirectories() {
  const dirs = [
    '/workspaces/sabo-pool-v11/docs/archive',
    '/workspaces/sabo-pool-v11/docs/quarantine',
    '/workspaces/sabo-pool-v11/docs/active',
    '/workspaces/sabo-pool-v11/logs',
  ];

  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }
}

// Archive file with date-based organization
async function archiveFile(file, result) {
  const date = new Date(file.modified);
  const archiveDir = path.join(
    '/workspaces/sabo-pool-v11/docs/archive',
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  );

  await fs.mkdir(archiveDir, { recursive: true });

  const targetPath = path.join(archiveDir, path.basename(file.path));
  await fs.copyFile(file.path, targetPath);
  await fs.unlink(file.path);

  result.archived.push({ original: file.path, archived: targetPath });
}

// Quarantine file for review
async function quarantineFile(file, result) {
  const quarantineDir = '/workspaces/sabo-pool-v11/docs/quarantine';
  const targetPath = path.join(
    quarantineDir,
    `${Date.now()}_${path.basename(file.path)}`
  );

  await fs.copyFile(file.path, targetPath);
  await fs.unlink(file.path);

  result.quarantined.push({ original: file.path, quarantined: targetPath });
}

module.exports = {
  analyzeFiles,
  classifyFiles,
  performCleanup,
  initializeConfig,
  cosineSimilarity,
  extractTopics,
};
