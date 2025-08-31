/**
 * SABO Pool V12 - Database Schema Analyzer
 * Công cụ phân tích đồng bộ hoá database và codebase
 * Sử dụng Supabase Service Role Key để truy cập toàn diện
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    console.error('❌ Missing required environment variables:');
    console.error('VITE_SUPABASE_URL:', SUPABASE_URL ? '✅ SET' : '❌ MISSING');
    console.error('VITE_SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✅ SET' : '❌ MISSING');
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

// Main analysis functions
class DatabaseAnalyzer {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            database_url: SUPABASE_URL,
            tables: [],
            columns: [],
            indexes: [],
            foreign_keys: [],
            rls_policies: [],
            functions: [],
            views: [],
            row_counts: {},
            codebase_references: {},
            synchronization_status: {}
        };
    }

    async analyzeDatabase() {
        log('🚀 Bắt đầu phân tích database toàn diện...', 'info');

        try {
            // 1. Get all tables
            await this.getTables();
            
            // 2. Get all columns
            await this.getColumns();
            
            // 3. Get indexes
            await this.getIndexes();
            
            // 4. Get foreign keys
            await this.getForeignKeys();
            
            // 5. Get RLS policies
            await this.getRLSPolicies();
            
            // 6. Get functions
            await this.getFunctions();
            
            // 7. Get views
            await this.getViews();
            
            // 8. Get row counts
            await this.getRowCounts();
            
            // 9. Analyze codebase
            await this.analyzeCodebase();
            
            // 10. Generate comparison report
            await this.generateReport();
            
            log('✅ Phân tích hoàn tất!', 'success');
            
        } catch (error) {
            log(`Lỗi trong quá trình phân tích: ${error.message}`, 'error');
            throw error;
        }
    }

    async getTables() {
        log('📊 Lấy danh sách tất cả bảng...');
        
        const { data, error } = await supabase.rpc('exec_sql', {
            query: `
                SELECT 
                    schemaname,
                    tablename,
                    tableowner,
                    hasindexes,
                    hasrules,
                    hastriggers,
                    rowsecurity
                FROM pg_tables 
                WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'auth', 'storage', 'realtime', 'supabase_functions')
                ORDER BY schemaname, tablename;
            `
        });

        if (error) {
            log(`Lỗi khi lấy danh sách bảng: ${error.message}`, 'error');
        } else {
            this.results.tables = data || [];
            saveToFile(`tables_${TIMESTAMP}.json`, this.results.tables);
            log(`Tìm thấy ${this.results.tables.length} bảng`);
        }
    }

    async getColumns() {
        log('📋 Lấy chi tiết cấu trúc cột...');
        
        const { data, error } = await supabase.rpc('exec_sql', {
            query: `
                SELECT 
                    t.table_schema,
                    t.table_name,
                    c.column_name,
                    c.data_type,
                    c.character_maximum_length,
                    c.numeric_precision,
                    c.numeric_scale,
                    c.is_nullable,
                    c.column_default,
                    c.ordinal_position,
                    c.udt_name
                FROM information_schema.tables t
                LEFT JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
                WHERE t.table_schema = 'public'
                AND t.table_type = 'BASE TABLE'
                ORDER BY t.table_name, c.ordinal_position;
            `
        });

        if (error) {
            log(`Lỗi khi lấy cấu trúc cột: ${error.message}`, 'error');
        } else {
            this.results.columns = data || [];
            saveToFile(`columns_${TIMESTAMP}.json`, this.results.columns);
            log(`Tìm thấy ${this.results.columns.length} cột`);
        }
    }

    async getIndexes() {
        log('🔗 Lấy thông tin indexes...');
        
        const { data, error } = await supabase.rpc('exec_sql', {
            query: `
                SELECT 
                    schemaname,
                    tablename,
                    indexname,
                    indexdef
                FROM pg_indexes 
                WHERE schemaname = 'public'
                ORDER BY tablename, indexname;
            `
        });

        if (error) {
            log(`Lỗi khi lấy indexes: ${error.message}`, 'error');
        } else {
            this.results.indexes = data || [];
            saveToFile(`indexes_${TIMESTAMP}.json`, this.results.indexes);
            log(`Tìm thấy ${this.results.indexes.length} indexes`);
        }
    }

    async getForeignKeys() {
        log('🔑 Lấy thông tin foreign keys...');
        
        const { data, error } = await supabase.rpc('exec_sql', {
            query: `
                SELECT
                    tc.table_schema, 
                    tc.constraint_name, 
                    tc.table_name, 
                    kcu.column_name,
                    ccu.table_schema AS foreign_table_schema,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name,
                    rc.update_rule,
                    rc.delete_rule
                FROM 
                    information_schema.table_constraints AS tc 
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                      AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage AS ccu
                      ON ccu.constraint_name = tc.constraint_name
                      AND ccu.table_schema = tc.table_schema
                    LEFT JOIN information_schema.referential_constraints AS rc
                      ON tc.constraint_name = rc.constraint_name
                      AND tc.table_schema = rc.constraint_schema
                WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_schema = 'public'
                ORDER BY tc.table_name;
            `
        });

        if (error) {
            log(`Lỗi khi lấy foreign keys: ${error.message}`, 'error');
        } else {
            this.results.foreign_keys = data || [];
            saveToFile(`foreign_keys_${TIMESTAMP}.json`, this.results.foreign_keys);
            log(`Tìm thấy ${this.results.foreign_keys.length} foreign keys`);
        }
    }

    async getRLSPolicies() {
        log('🛡️ Lấy thông tin RLS policies...');
        
        const { data, error } = await supabase.rpc('exec_sql', {
            query: `
                SELECT 
                    schemaname,
                    tablename,
                    policyname,
                    permissive,
                    roles,
                    cmd,
                    qual,
                    with_check
                FROM pg_policies
                WHERE schemaname = 'public'
                ORDER BY tablename, policyname;
            `
        });

        if (error) {
            log(`Lỗi khi lấy RLS policies: ${error.message}`, 'error');
        } else {
            this.results.rls_policies = data || [];
            saveToFile(`rls_policies_${TIMESTAMP}.json`, this.results.rls_policies);
            log(`Tìm thấy ${this.results.rls_policies.length} RLS policies`);
        }
    }

    async getFunctions() {
        log('⚙️ Lấy thông tin functions...');
        
        const { data, error } = await supabase.rpc('exec_sql', {
            query: `
                SELECT 
                    n.nspname as schema_name,
                    p.proname as function_name,
                    pg_get_function_result(p.oid) as result_type,
                    pg_get_function_arguments(p.oid) as arguments,
                    CASE 
                        WHEN p.proisagg THEN 'aggregate'
                        WHEN p.proiswindow THEN 'window'
                        WHEN p.prorettype = 'pg_catalog.trigger'::pg_catalog.regtype THEN 'trigger'
                        ELSE 'normal'
                    END as function_type
                FROM pg_proc p
                LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
                WHERE n.nspname = 'public'
                ORDER BY p.proname;
            `
        });

        if (error) {
            log(`Lỗi khi lấy functions: ${error.message}`, 'error');
        } else {
            this.results.functions = data || [];
            saveToFile(`functions_${TIMESTAMP}.json`, this.results.functions);
            log(`Tìm thấy ${this.results.functions.length} functions`);
        }
    }

    async getViews() {
        log('👁️ Lấy thông tin views...');
        
        const { data, error } = await supabase.rpc('exec_sql', {
            query: `
                SELECT 
                    schemaname,
                    viewname,
                    viewowner,
                    definition
                FROM pg_views
                WHERE schemaname = 'public'
                ORDER BY viewname;
            `
        });

        if (error) {
            log(`Lỗi khi lấy views: ${error.message}`, 'error');
        } else {
            this.results.views = data || [];
            saveToFile(`views_${TIMESTAMP}.json`, this.results.views);
            log(`Tìm thấy ${this.results.views.length} views`);
        }
    }

    async getRowCounts() {
        log('📈 Lấy số lượng records trong từng bảng...');
        
        const tableCounts = {};
        
        for (const table of this.results.tables) {
            if (table.schemaname === 'public') {
                try {
                    const { count, error } = await supabase
                        .from(table.tablename)
                        .select('*', { count: 'exact', head: true });
                    
                    if (error) {
                        log(`Lỗi khi đếm records cho bảng ${table.tablename}: ${error.message}`, 'warning');
                        tableCounts[table.tablename] = { count: null, error: error.message };
                    } else {
                        tableCounts[table.tablename] = { count, error: null };
                    }
                } catch (err) {
                    log(`Lỗi không mong đợi khi đếm records cho bảng ${table.tablename}: ${err.message}`, 'warning');
                    tableCounts[table.tablename] = { count: null, error: err.message };
                }
            }
        }
        
        this.results.row_counts = tableCounts;
        saveToFile(`row_counts_${TIMESTAMP}.json`, this.results.row_counts);
        
        const totalTables = Object.keys(tableCounts).length;
        const successfulCounts = Object.values(tableCounts).filter(c => c.count !== null).length;
        log(`Đã đếm thành công ${successfulCounts}/${totalTables} bảng`);
    }

    async analyzeCodebase() {
        log('🔍 Phân tích references trong codebase...');
        
        const codebaseRefs = {
            type_files: [],
            table_references: {},
            migration_files: [],
            schema_files: []
        };

        // Find TypeScript type files
        const findFilesWithPattern = (pattern, description) => {
            try {
                const { execSync } = require('child_process');
                const command = `find ${WORKSPACE_ROOT} -name "${pattern}" -type f | grep -v node_modules | grep -v .git`;
                const output = execSync(command, { encoding: 'utf8' }).trim();
                return output ? output.split('\n') : [];
            } catch (error) {
                log(`Lỗi khi tìm ${description}: ${error.message}`, 'warning');
                return [];
            }
        };

        codebaseRefs.type_files = findFilesWithPattern('*types*.ts', 'type files');
        codebaseRefs.schema_files = findFilesWithPattern('*schema*.ts', 'schema files');
        codebaseRefs.migration_files = findFilesWithPattern('*.sql', 'SQL files');

        // Find table references in code
        for (const table of this.results.tables) {
            if (table.schemaname === 'public') {
                try {
                    const { execSync } = require('child_process');
                    const command = `grep -r "from.*${table.tablename}" ${WORKSPACE_ROOT} --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | grep -v node_modules | head -10`;
                    const output = execSync(command, { encoding: 'utf8' }).trim();
                    codebaseRefs.table_references[table.tablename] = output ? output.split('\n') : [];
                } catch (error) {
                    codebaseRefs.table_references[table.tablename] = [];
                }
            }
        }

        this.results.codebase_references = codebaseRefs;
        saveToFile(`codebase_references_${TIMESTAMP}.json`, this.results.codebase_references);
        
        log(`Tìm thấy ${codebaseRefs.type_files.length} type files, ${codebaseRefs.schema_files.length} schema files`);
    }

    async generateReport() {
        log('📋 Tạo báo cáo tổng hợp...');
        
        const report = {
            ...this.results,
            summary: {
                total_tables: this.results.tables.length,
                total_columns: this.results.columns.length,
                total_indexes: this.results.indexes.length,
                total_foreign_keys: this.results.foreign_keys.length,
                total_rls_policies: this.results.rls_policies.length,
                total_functions: this.results.functions.length,
                total_views: this.results.views.length,
                tables_with_data: Object.values(this.results.row_counts).filter(c => c.count > 0).length,
                tables_without_rls: this.results.tables.filter(table => 
                    !this.results.rls_policies.some(policy => policy.tablename === table.tablename)
                ).length
            },
            recommendations: [
                "Kiểm tra các bảng không có RLS policies",
                "Xác minh foreign key relationships",
                "Đồng bộ TypeScript types với database schema",
                "Kiểm tra performance của các indexes",
                "Review các bảng có data count = 0"
            ]
        };

        const reportPath = saveToFile(`comprehensive_database_analysis_${TIMESTAMP}.json`, report);
        
        // Generate Markdown report
        await this.generateMarkdownReport(report);
        
        log(`Báo cáo JSON: ${reportPath}`);
        return reportPath;
    }

    async generateMarkdownReport(report) {
        const mdContent = `# 🔍 SABO Pool V12 - Database Synchronization Analysis

**Generated:** ${new Date().toLocaleString()}  
**Database:** ${SUPABASE_URL}  
**Analysis Timestamp:** ${TIMESTAMP}

## 📊 Executive Summary

- **Total Tables:** ${report.summary.total_tables}
- **Total Columns:** ${report.summary.total_columns}
- **Total Indexes:** ${report.summary.total_indexes}
- **Total Foreign Keys:** ${report.summary.total_foreign_keys}
- **Total RLS Policies:** ${report.summary.total_rls_policies}
- **Total Functions:** ${report.summary.total_functions}
- **Total Views:** ${report.summary.total_views}
- **Tables with Data:** ${report.summary.tables_with_data}
- **Tables without RLS:** ${report.summary.tables_without_rls}

## 📋 Database Tables

${report.tables.map(table => `- **${table.tablename}** (${table.schemaname})`).join('\n')}

## 🔑 Tables by Category

### Core User Management
- profiles, user_roles, user_preferences

### Game Engine
- challenges, challenge_participants, game_sessions, shots

### Tournament System  
- tournaments, tournament_brackets, tournament_registrations

### Club Management
- clubs, club_members, club_settings

### Wallet & Payments
- wallets, wallet_transactions, payment_transactions

### Ranking System
- ranks, rank_requirements, ranking_history

## ⚠️ Issues Found

### Tables without RLS Policies
${report.tables.filter(table => 
    !report.rls_policies.some(policy => policy.tablename === table.tablename)
).map(table => `- ${table.tablename}`).join('\n')}

### Tables without Data
${Object.entries(report.row_counts)
    .filter(([table, data]) => data.count === 0)
    .map(([table]) => `- ${table}`)
    .join('\n')}

## 🔧 Recommendations

${report.recommendations.map(rec => `- [ ] ${rec}`).join('\n')}

## 📁 Generated Files

- \`tables_${TIMESTAMP}.json\` - Complete table information
- \`columns_${TIMESTAMP}.json\` - Column definitions and types
- \`indexes_${TIMESTAMP}.json\` - Index information
- \`foreign_keys_${TIMESTAMP}.json\` - Foreign key relationships
- \`rls_policies_${TIMESTAMP}.json\` - RLS security policies
- \`functions_${TIMESTAMP}.json\` - Database functions
- \`views_${TIMESTAMP}.json\` - Database views
- \`row_counts_${TIMESTAMP}.json\` - Record counts per table
- \`codebase_references_${TIMESTAMP}.json\` - Code references analysis

---

**Analysis completed at:** ${new Date().toLocaleString()}
`;

        const mdPath = path.join(REPORT_DIR, `database_sync_report_${TIMESTAMP}.md`);
        fs.writeFileSync(mdPath, mdContent);
        log(`Báo cáo Markdown: ${mdPath}`);
    }
}

// Run the analysis
async function main() {
    console.log('🎱 SABO Pool V12 - Database Synchronization Analyzer');
    console.log('==================================================');
    
    const analyzer = new DatabaseAnalyzer();
    
    try {
        await analyzer.analyzeDatabase();
        
        console.log('\n✅ Phân tích hoàn tất thành công!');
        console.log(`📁 Tất cả file báo cáo được lưu tại: ${REPORT_DIR}`);
        console.log('\n🔍 Bạn có thể xem chi tiết trong các file JSON và Markdown được tạo.');
        
    } catch (error) {
        console.error('\n❌ Lỗi trong quá trình phân tích:', error.message);
        process.exit(1);
    }
}

main().catch(console.error);
