/**
 * SABO Pool V12 - Direct Database Schema Analyzer
 * Sử dụng trực tiếp Supabase REST API để lấy thông tin schema
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const WORKSPACE_ROOT = '/workspaces/sabo-pool-v12';
const REPORT_DIR = path.join(WORKSPACE_ROOT, 'database-sync-analysis');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

// Validate environment
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Ensure report directory exists
if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// Utility functions
const log = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '📝';
    console.log(`[${timestamp}] ${prefix} ${message}`);
};

const saveToFile = (filename, data) => {
    const filepath = path.join(REPORT_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    log(`Saved: ${filename}`);
    return filepath;
};

// Direct REST API queries
const queryDatabase = async (table, select = '*', options = {}) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}`, {
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'apikey': SUPABASE_SERVICE_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
};

class DatabaseAnalyzer {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            database_url: SUPABASE_URL,
            available_tables: [],
            table_counts: {},
            codebase_analysis: {},
            schema_inference: {},
            recommendations: []
        };
    }

    async analyzeDatabase() {
        log('🚀 Bắt đầu phân tích database với service role key...', 'info');

        try {
            // 1. Discover available tables by trying common patterns
            await this.discoverTables();
            
            // 2. Get table row counts
            await this.getTableCounts();
            
            // 3. Analyze codebase references
            await this.analyzeCodebase();
            
            // 4. Generate inference from migration files
            await this.analyzeMigrations();
            
            // 5. Generate comprehensive report
            await this.generateReport();
            
            log('✅ Phân tích hoàn tất!', 'success');
            
        } catch (error) {
            log(`Lỗi trong quá trình phân tích: ${error.message}`, 'error');
            throw error;
        }
    }

    async discoverTables() {
        log('🔍 Khám phá các bảng có sẵn trong database...');
        
        // Common table names based on our codebase analysis
        const expectedTables = [
            'profiles', 'users', 'user_roles', 'user_preferences',
            'challenges', 'challenge_participants', 'game_sessions', 'shots',
            'tournaments', 'tournament_brackets', 'tournament_registrations',
            'clubs', 'club_members', 'club_settings',
            'wallets', 'wallet_transactions', 'payment_transactions',
            'ranks', 'rank_requirements', 'ranking_history',
            'notifications', 'system_events', 'analytics_events',
            'achievements', 'leaderboards', 'settings'
        ];

        const availableTables = [];
        
        for (const tableName of expectedTables) {
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*', { count: 'exact', head: true });
                
                if (!error) {
                    availableTables.push({
                        table_name: tableName,
                        accessible: true,
                        row_count: data?.length || 0
                    });
                    log(`✅ Tìm thấy bảng: ${tableName}`);
                } else {
                    log(`❌ Không thể truy cập bảng ${tableName}: ${error.message}`, 'warning');
                }
            } catch (err) {
                log(`❌ Lỗi khi kiểm tra bảng ${tableName}: ${err.message}`, 'warning');
            }
        }

        this.results.available_tables = availableTables;
        saveToFile(`available_tables_${TIMESTAMP}.json`, availableTables);
        log(`Khám phá thành công ${availableTables.length} bảng`);
    }

    async getTableCounts() {
        log('📊 Lấy số lượng records trong từng bảng...');
        
        const tableCounts = {};
        
        for (const table of this.results.available_tables) {
            try {
                const { count, error } = await supabase
                    .from(table.table_name)
                    .select('*', { count: 'exact', head: true });
                
                if (!error) {
                    tableCounts[table.table_name] = {
                        count: count || 0,
                        last_checked: new Date().toISOString(),
                        status: 'accessible'
                    };
                    
                    // Try to get a sample record to understand structure
                    const { data: sample } = await supabase
                        .from(table.table_name)
                        .select('*')
                        .limit(1);
                    
                    if (sample && sample.length > 0) {
                        tableCounts[table.table_name].sample_columns = Object.keys(sample[0]);
                        tableCounts[table.table_name].sample_record = sample[0];
                    }
                } else {
                    tableCounts[table.table_name] = {
                        count: null,
                        error: error.message,
                        status: 'error'
                    };
                }
            } catch (err) {
                tableCounts[table.table_name] = {
                    count: null,
                    error: err.message,
                    status: 'exception'
                };
            }
        }
        
        this.results.table_counts = tableCounts;
        saveToFile(`table_counts_detailed_${TIMESTAMP}.json`, tableCounts);
        
        const successfulCounts = Object.values(tableCounts).filter(c => c.status === 'accessible').length;
        log(`Thành công lấy thông tin ${successfulCounts}/${Object.keys(tableCounts).length} bảng`);
    }

    async analyzeCodebase() {
        log('🔍 Phân tích codebase để tìm table references...');
        
        const analysis = {
            typescript_files: [],
            table_references: {},
            schema_files: [],
            migration_files: [],
            supabase_types: null
        };

        try {
            // Find TypeScript files with database references
            const findCommand = `find ${WORKSPACE_ROOT} -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | head -50`;
            const tsFiles = execSync(findCommand, { encoding: 'utf8' }).trim().split('\n').filter(f => f);
            analysis.typescript_files = tsFiles;

            // Look for Supabase types file
            try {
                const typesPath = path.join(WORKSPACE_ROOT, 'apps', 'sabo-user', 'src', 'integrations', 'supabase', 'types.ts');
                if (fs.existsSync(typesPath)) {
                    const typesContent = fs.readFileSync(typesPath, 'utf8');
                    // Extract table names from types file
                    const tableMatches = typesContent.match(/^\s*(\w+):\s*\{/gm);
                    if (tableMatches) {
                        analysis.supabase_types = tableMatches.map(match => 
                            match.replace(/^\s*(\w+):\s*\{/, '$1')
                        );
                    }
                }
            } catch (err) {
                log(`Không thể đọc types file: ${err.message}`, 'warning');
            }

            // Find table references in code
            for (const table of this.results.available_tables) {
                try {
                    const grepCommand = `grep -r "from.*${table.table_name}" ${WORKSPACE_ROOT} --include="*.ts" --include="*.tsx" | grep -v node_modules | head -10`;
                    const references = execSync(grepCommand, { encoding: 'utf8' }).trim();
                    analysis.table_references[table.table_name] = references ? references.split('\n') : [];
                } catch (err) {
                    analysis.table_references[table.table_name] = [];
                }
            }

            // Find migration files
            const migrationCommand = `find ${WORKSPACE_ROOT} -name "*.sql" | grep -v node_modules | head -20`;
            analysis.migration_files = execSync(migrationCommand, { encoding: 'utf8' }).trim().split('\n').filter(f => f);

        } catch (error) {
            log(`Lỗi trong phân tích codebase: ${error.message}`, 'warning');
        }

        this.results.codebase_analysis = analysis;
        saveToFile(`codebase_analysis_${TIMESTAMP}.json`, analysis);
        log(`Phân tích codebase hoàn tất: ${analysis.typescript_files.length} TS files, ${analysis.migration_files.length} SQL files`);
    }

    async analyzeMigrations() {
        log('📜 Phân tích migration files để hiểu schema...');
        
        const migrationAnalysis = {
            total_migrations: 0,
            table_creations: [],
            column_definitions: {},
            relationships: []
        };

        try {
            const migrationFiles = this.results.codebase_analysis.migration_files;
            migrationAnalysis.total_migrations = migrationFiles.length;

            for (const filePath of migrationFiles.slice(0, 10)) { // Analyze first 10 files
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    
                    // Look for CREATE TABLE statements
                    const createTableRegex = /CREATE TABLE\s+(\w+)\s*\(/gi;
                    const matches = content.match(createTableRegex);
                    if (matches) {
                        matches.forEach(match => {
                            const tableName = match.replace(/CREATE TABLE\s+(\w+)\s*\(/i, '$1');
                            migrationAnalysis.table_creations.push({
                                table: tableName,
                                file: path.basename(filePath)
                            });
                        });
                    }
                } catch (err) {
                    log(`Không thể đọc migration file ${filePath}: ${err.message}`, 'warning');
                }
            }
        } catch (error) {
            log(`Lỗi trong phân tích migrations: ${error.message}`, 'warning');
        }

        this.results.schema_inference = migrationAnalysis;
        saveToFile(`migration_analysis_${TIMESTAMP}.json`, migrationAnalysis);
        log(`Phân tích migrations: ${migrationAnalysis.total_migrations} files, ${migrationAnalysis.table_creations.length} table creations found`);
    }

    async generateReport() {
        log('📋 Tạo báo cáo tổng hợp...');
        
        // Generate insights and recommendations
        const insights = this.generateInsights();
        
        const report = {
            ...this.results,
            insights,
            summary: {
                analysis_timestamp: new Date().toISOString(),
                database_status: 'Connected with Service Role',
                total_accessible_tables: this.results.available_tables.length,
                tables_with_data: Object.values(this.results.table_counts).filter(t => t.count > 0).length,
                total_typescript_files: this.results.codebase_analysis.typescript_files?.length || 0,
                total_migration_files: this.results.codebase_analysis.migration_files?.length || 0,
                database_health: this.calculateDatabaseHealth()
            }
        };

        const reportPath = saveToFile(`comprehensive_database_sync_report_${TIMESTAMP}.json`, report);
        
        // Generate Markdown report
        await this.generateMarkdownReport(report);
        
        log(`Báo cáo hoàn tất: ${reportPath}`);
        return reportPath;
    }

    generateInsights() {
        const insights = {
            recommendations: [],
            warnings: [],
            successes: []
        };

        // Check for tables with no data
        const emptyTables = Object.entries(this.results.table_counts)
            .filter(([table, info]) => info.count === 0)
            .map(([table]) => table);

        if (emptyTables.length > 0) {
            insights.warnings.push(`${emptyTables.length} bảng không có dữ liệu: ${emptyTables.join(', ')}`);
            insights.recommendations.push('Kiểm tra và populate dữ liệu demo cho các bảng trống');
        }

        // Check for tables with data
        const tablesWithData = Object.entries(this.results.table_counts)
            .filter(([table, info]) => info.count > 0)
            .map(([table, info]) => `${table} (${info.count} records)`);

        if (tablesWithData.length > 0) {
            insights.successes.push(`${tablesWithData.length} bảng đã có dữ liệu: ${tablesWithData.join(', ')}`);
        }

        // Check codebase sync
        if (this.results.codebase_analysis.supabase_types) {
            insights.successes.push(`Tìm thấy TypeScript types cho ${this.results.codebase_analysis.supabase_types.length} entities`);
        }

        return insights;
    }

    calculateDatabaseHealth() {
        const accessibleTables = this.results.available_tables.length;
        const tablesWithData = Object.values(this.results.table_counts).filter(t => t.count > 0).length;
        
        if (accessibleTables === 0) return 'Critical';
        if (tablesWithData === 0) return 'Warning';
        if (tablesWithData / accessibleTables >= 0.7) return 'Healthy';
        if (tablesWithData / accessibleTables >= 0.3) return 'Moderate';
        return 'Needs Attention';
    }

    async generateMarkdownReport(report) {
        const mdContent = `# 🔍 SABO Pool V12 - Database Synchronization Report

**Generated:** ${new Date().toLocaleString()}  
**Database:** ${SUPABASE_URL}  
**Analysis Method:** Service Role Direct Access  
**Health Status:** ${report.summary.database_health}

## 📊 Executive Summary

- **Database Status:** ${report.summary.database_status}
- **Total Accessible Tables:** ${report.summary.total_accessible_tables}
- **Tables with Data:** ${report.summary.tables_with_data}
- **TypeScript Files:** ${report.summary.total_typescript_files}
- **Migration Files:** ${report.summary.total_migration_files}
- **Overall Health:** ${report.summary.database_health}

## 📋 Accessible Tables

${report.available_tables.map(table => 
    `- **${table.table_name}** ${table.accessible ? '✅' : '❌'}`
).join('\n')}

## 📊 Table Data Status

${Object.entries(report.table_counts).map(([table, info]) => {
    if (info.status === 'accessible') {
        const sampleCols = info.sample_columns ? ` (${info.sample_columns.length} columns)` : '';
        return `- **${table}**: ${info.count} records${sampleCols}`;
    } else {
        return `- **${table}**: ❌ ${info.error}`;
    }
}).join('\n')}

## 🔍 Codebase Analysis

### TypeScript Files Found
${report.codebase_analysis.typescript_files ? report.codebase_analysis.typescript_files.length : 0} files analyzed

### Migration Files Found
${report.codebase_analysis.migration_files ? report.codebase_analysis.migration_files.length : 0} SQL files found

### Supabase Types
${report.codebase_analysis.supabase_types ? 
    `✅ Found types for: ${report.codebase_analysis.supabase_types.join(', ')}` : 
    '❌ No Supabase types file found'
}

## 🎯 Insights & Recommendations

### ✅ Successes
${report.insights.successes.map(s => `- ${s}`).join('\n')}

### ⚠️ Warnings
${report.insights.warnings.map(w => `- ${w}`).join('\n')}

### 🔧 Recommendations
${report.insights.recommendations.map(r => `- [ ] ${r}`).join('\n')}

## 📁 Generated Files

- \`available_tables_${TIMESTAMP}.json\` - Accessible tables list
- \`table_counts_detailed_${TIMESTAMP}.json\` - Detailed table information
- \`codebase_analysis_${TIMESTAMP}.json\` - Code references analysis
- \`migration_analysis_${TIMESTAMP}.json\` - Migration files analysis
- \`comprehensive_database_sync_report_${TIMESTAMP}.json\` - Complete report

## 🔧 Next Steps for Database Synchronization

1. **Validate Schema:** Ensure all expected tables exist
2. **Populate Demo Data:** Add demo data to empty tables
3. **Update TypeScript Types:** Sync types with actual schema
4. **Setup RLS Policies:** Implement proper security
5. **Test All Operations:** Verify CRUD operations work

---

**Analysis completed:** ${new Date().toLocaleString()}  
**Ready for database fixes and optimizations!**
`;

        const mdPath = path.join(REPORT_DIR, `database_sync_report_${TIMESTAMP}.md`);
        fs.writeFileSync(mdPath, mdContent);
        log(`Báo cáo Markdown: ${mdPath}`);
    }
}

// Run the analysis
async function main() {
    console.log('🎱 SABO Pool V12 - Direct Database Synchronization Analyzer');
    console.log('=========================================================');
    
    const analyzer = new DatabaseAnalyzer();
    
    try {
        await analyzer.analyzeDatabase();
        
        console.log('\n✅ Phân tích database synchronization hoàn tất!');
        console.log(`📁 Tất cả báo cáo được lưu tại: ${REPORT_DIR}`);
        console.log('\n🔍 Database đã sẵn sàng cho việc fix và đồng bộ hóa!');
        
    } catch (error) {
        console.error('\n❌ Lỗi trong quá trình phân tích:', error.message);
        process.exit(1);
    }
}

main().catch(console.error);
