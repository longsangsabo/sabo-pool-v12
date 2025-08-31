/**
 * SABO Pool V12 - Detailed Table Structure Analyzer
 * Phân tích chi tiết cấu trúc cột và sample data của các bảng quan trọng
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
const REPORT_DIR = path.join('/workspaces/sabo-pool-v12', 'database-sync-analysis');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

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

// Key tables to analyze in detail
const KEY_TABLES = [
    'profiles',
    'challenges', 
    'tournaments',
    'wallets',
    'user_roles',
    'notifications',
    'tournament_registrations',
    'club_members',
    'ranks'
];

class DetailedTableAnalyzer {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            tables_analyzed: [],
            detailed_structures: {},
            data_samples: {},
            relationships_found: {},
            recommendations: []
        };
    }

    async analyzeKeyTables() {
        log('🔍 Bắt đầu phân tích chi tiết cấu trúc bảng quan trọng...');

        for (const tableName of KEY_TABLES) {
            try {
                await this.analyzeTable(tableName);
            } catch (error) {
                log(`Lỗi khi phân tích bảng ${tableName}: ${error.message}`, 'error');
            }
        }

        await this.findRelationships();
        await this.generateDetailedReport();
        
        log('✅ Phân tích chi tiết hoàn tất!', 'success');
    }

    async analyzeTable(tableName) {
        log(`📊 Phân tích bảng: ${tableName}`);

        const tableAnalysis = {
            table_name: tableName,
            row_count: 0,
            columns: [],
            sample_data: [],
            unique_values: {},
            data_types: {},
            null_patterns: {},
            insights: []
        };

        try {
            // Get row count
            const { count } = await supabase
                .from(tableName)
                .select('*', { count: 'exact', head: true });
            
            tableAnalysis.row_count = count || 0;

            // Get sample data (up to 5 records)
            const { data: sampleData, error: sampleError } = await supabase
                .from(tableName)
                .select('*')
                .limit(5);

            if (sampleError) {
                log(`Lỗi lấy sample data cho ${tableName}: ${sampleError.message}`, 'warning');
            } else if (sampleData && sampleData.length > 0) {
                tableAnalysis.sample_data = sampleData;
                tableAnalysis.columns = Object.keys(sampleData[0]);

                // Analyze each column
                for (const column of tableAnalysis.columns) {
                    await this.analyzeColumn(tableName, column, sampleData, tableAnalysis);
                }
            }

            // Generate insights for this table
            this.generateTableInsights(tableAnalysis);

            this.results.detailed_structures[tableName] = tableAnalysis;
            this.results.tables_analyzed.push(tableName);

            log(`✅ Hoàn tất phân tích ${tableName}: ${tableAnalysis.row_count} records, ${tableAnalysis.columns.length} columns`);

        } catch (error) {
            log(`Lỗi phân tích bảng ${tableName}: ${error.message}`, 'error');
        }
    }

    async analyzeColumn(tableName, columnName, sampleData, tableAnalysis) {
        const columnAnalysis = {
            name: columnName,
            data_type: 'unknown',
            sample_values: [],
            unique_count: 0,
            null_count: 0,
            patterns: []
        };

        // Analyze sample values
        const values = sampleData.map(row => row[columnName]);
        columnAnalysis.sample_values = values.slice(0, 3); // First 3 values
        columnAnalysis.null_count = values.filter(v => v === null || v === undefined).length;
        
        // Determine data type from sample
        const nonNullValues = values.filter(v => v !== null && v !== undefined);
        if (nonNullValues.length > 0) {
            const firstValue = nonNullValues[0];
            columnAnalysis.data_type = typeof firstValue;
            
            if (columnName.includes('id') || columnName.includes('Id')) {
                columnAnalysis.patterns.push('identifier');
            }
            if (columnName.includes('created_at') || columnName.includes('updated_at')) {
                columnAnalysis.patterns.push('timestamp');
            }
            if (columnName.includes('email')) {
                columnAnalysis.patterns.push('email');
            }
            if (columnName.includes('url') || columnName.includes('URL')) {
                columnAnalysis.patterns.push('url');
            }
        }

        tableAnalysis.data_types[columnName] = columnAnalysis;
    }

    generateTableInsights(tableAnalysis) {
        const insights = [];
        
        if (tableAnalysis.row_count === 0) {
            insights.push('⚠️ Bảng trống - cần populate dữ liệu demo');
        } else if (tableAnalysis.row_count < 10) {
            insights.push('🟡 Ít dữ liệu - có thể cần thêm demo data');
        } else {
            insights.push('✅ Có dữ liệu đầy đủ để test');
        }

        // Check for common ID patterns
        const hasId = tableAnalysis.columns.includes('id');
        const hasUserId = tableAnalysis.columns.includes('user_id');
        const hasCreatedAt = tableAnalysis.columns.includes('created_at');
        
        if (hasId && hasCreatedAt) {
            insights.push('✅ Có cấu trúc chuẩn (id + created_at)');
        }
        
        if (hasUserId) {
            insights.push('🔗 Có liên kết với user system');
        }

        // Check for specific business logic columns
        if (tableAnalysis.table_name === 'profiles') {
            const hasRank = tableAnalysis.columns.includes('current_rank');
            const hasElo = tableAnalysis.columns.includes('elo');
            if (hasRank && hasElo) {
                insights.push('🎯 Ranking system columns present');
            }
        }

        if (tableAnalysis.table_name === 'wallets') {
            const hasBalance = tableAnalysis.columns.some(col => 
                col.includes('balance') || col.includes('amount')
            );
            if (hasBalance) {
                insights.push('💰 Wallet balance tracking enabled');
            }
        }

        tableAnalysis.insights = insights;
    }

    async findRelationships() {
        log('🔗 Tìm kiếm relationships giữa các bảng...');

        const relationships = {};

        for (const tableName of this.results.tables_analyzed) {
            const table = this.results.detailed_structures[tableName];
            relationships[tableName] = [];

            // Look for foreign key patterns
            for (const column of table.columns) {
                if (column.endsWith('_id') && column !== 'id') {
                    const referencedTable = column.replace('_id', 's'); // user_id -> users
                    const altReferencedTable = column.replace('_id', ''); // tournament_id -> tournament
                    
                    if (this.results.tables_analyzed.includes(referencedTable)) {
                        relationships[tableName].push({
                            column: column,
                            references: referencedTable,
                            type: 'foreign_key'
                        });
                    } else if (this.results.tables_analyzed.includes(altReferencedTable)) {
                        relationships[tableName].push({
                            column: column,
                            references: altReferencedTable,
                            type: 'foreign_key'
                        });
                    }
                }
            }
        }

        this.results.relationships_found = relationships;
        saveToFile(`table_relationships_${TIMESTAMP}.json`, relationships);
    }

    async generateDetailedReport() {
        log('📋 Tạo báo cáo chi tiết...');

        // Generate summary
        const summary = {
            total_tables_analyzed: this.results.tables_analyzed.length,
            tables_with_data: Object.values(this.results.detailed_structures)
                .filter(t => t.row_count > 0).length,
            total_columns: Object.values(this.results.detailed_structures)
                .reduce((sum, t) => sum + t.columns.length, 0),
            avg_columns_per_table: Math.round(
                Object.values(this.results.detailed_structures)
                    .reduce((sum, t) => sum + t.columns.length, 0) / 
                this.results.tables_analyzed.length
            )
        };

        const fullReport = {
            ...this.results,
            summary,
            generated_at: new Date().toISOString()
        };

        saveToFile(`detailed_table_analysis_${TIMESTAMP}.json`, fullReport);
        await this.generateMarkdownReport(fullReport);
    }

    async generateMarkdownReport(report) {
        let markdown = `# 🔍 SABO Pool V12 - Detailed Table Structure Analysis

**Generated:** ${new Date().toLocaleString()}  
**Tables Analyzed:** ${report.summary.total_tables_analyzed}  
**Total Columns:** ${report.summary.total_columns}

## 📊 Summary Statistics

- **Tables with Data:** ${report.summary.tables_with_data}/${report.summary.total_tables_analyzed}
- **Average Columns per Table:** ${report.summary.avg_columns_per_table}
- **Total Relationships Found:** ${Object.values(report.relationships_found).flat().length}

## 📋 Detailed Table Analysis

`;

        for (const tableName of report.tables_analyzed) {
            const table = report.detailed_structures[tableName];
            
            markdown += `### 📊 Table: \`${tableName}\`

**Records:** ${table.row_count}  
**Columns:** ${table.columns.length}  
**Status:** ${table.row_count > 0 ? '🟢 Has Data' : '🔴 Empty'}

#### Column Structure
${table.columns.map(col => {
    const colType = table.data_types[col];
    return `- **${col}**: ${colType?.data_type || 'unknown'} ${colType?.patterns?.length ? `(${colType.patterns.join(', ')})` : ''}`;
}).join('\n')}

#### Sample Data
\`\`\`json
${JSON.stringify(table.sample_data.slice(0, 2), null, 2)}
\`\`\`

#### Insights
${table.insights.map(insight => `- ${insight}`).join('\n')}

#### Relationships
${report.relationships_found[tableName]?.map(rel => 
    `- \`${rel.column}\` → \`${rel.references}\` (${rel.type})`
).join('\n') || '- No relationships found'}

---

`;
        }

        markdown += `## 🔗 Relationship Map

\`\`\`
${Object.entries(report.relationships_found)
    .map(([table, rels]) => rels.length > 0 ? 
        `${table}:\n${rels.map(rel => `  └─ ${rel.column} → ${rel.references}`).join('\n')}` 
        : `${table}: (no relationships)`
    ).join('\n\n')}
\`\`\`

## 🎯 Key Findings

### ✅ Well-Structured Tables
${Object.entries(report.detailed_structures)
    .filter(([name, data]) => data.row_count > 0 && data.columns.length > 5)
    .map(([name]) => `- ${name}`)
    .join('\n')}

### ⚠️ Tables Needing Attention
${Object.entries(report.detailed_structures)
    .filter(([name, data]) => data.row_count === 0)
    .map(([name]) => `- ${name} (empty)`)
    .join('\n')}

## 🔧 Next Actions

1. **Populate Empty Tables**: Add demo data to empty tables
2. **Validate Relationships**: Ensure foreign keys are properly linked
3. **Data Consistency**: Check for orphaned records
4. **Index Optimization**: Review indexes for performance

---

**Analysis completed at:** ${new Date().toLocaleString()}
`;

        const mdPath = path.join(REPORT_DIR, `detailed_table_analysis_${TIMESTAMP}.md`);
        fs.writeFileSync(mdPath, markdown);
        log(`Detailed report: ${mdPath}`);
    }
}

// Run the detailed analysis
async function main() {
    console.log('🎱 SABO Pool V12 - Detailed Table Structure Analyzer');
    console.log('===================================================');
    
    const analyzer = new DetailedTableAnalyzer();
    
    try {
        await analyzer.analyzeKeyTables();
        
        console.log('\n✅ Detailed table analysis completed!');
        console.log(`📁 Reports saved in: ${REPORT_DIR}`);
        
    } catch (error) {
        console.error('\n❌ Error in detailed analysis:', error.message);
        process.exit(1);
    }
}

main().catch(console.error);
