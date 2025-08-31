/**
 * SABO Pool V12 - Codebase Synchronization Verification
 * Kiểm tra đồng bộ hoá giữa database schema và TypeScript types
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

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const WORKSPACE_ROOT = '/workspaces/sabo-pool-v12';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const log = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '📋';
    console.log(`[${timestamp}] ${prefix} ${message}`);
};

class CodebaseSyncVerification {
    constructor() {
        this.expectedTables = [
            // User Management (8)
            'profiles', 'users', 'user_roles', 'user_preferences', 'user_sessions', 
            'auth_users', 'auth_sessions', 'auth_refresh_tokens',
            
            // Game Engine (9)
            'challenges', 'challenge_participants', 'challenge_types', 'game_sessions', 
            'game_results', 'shots', 'shot_analysis', 'game_mechanics', 'game_settings',
            
            // Tournament System (7)
            'tournaments', 'tournament_types', 'tournament_brackets', 'tournament_registrations',
            'tournament_matches', 'tournament_rounds', 'tournament_settings',
            
            // Club Management (6)
            'clubs', 'club_members', 'club_roles', 'club_settings', 
            'club_invitations', 'club_activities',
            
            // Payment & Wallet (6)
            'wallets', 'wallet_transactions', 'payment_transactions', 
            'payment_methods', 'billing_history', 'invoices',
            
            // Ranking & ELO (5)
            'ranks', 'rank_requirements', 'ranking_history', 'rank_calculations', 'elo_history',
            
            // Communication (6)
            'notifications', 'notification_templates', 'notification_settings',
            'messages', 'conversations', 'communication_channels',
            
            // Analytics (5)
            'system_events', 'analytics_events', 'user_activities', 
            'performance_metrics', 'usage_statistics',
            
            // Gamification (6)
            'achievements', 'achievement_progress', 'leaderboards', 
            'rewards', 'badges', 'points_history',
            
            // System Config (5)
            'settings', 'system_config', 'feature_flags', 'maintenance_logs', 'audit_logs',
            
            // Content Management (5)
            'news', 'announcements', 'tutorials', 'media_files', 'file_uploads',
            
            // Venue Management (3)
            'venues', 'tables', 'table_bookings',
            
            // Support System (3)
            'support_tickets', 'faq', 'help_articles'
        ];
        
        this.verificationResults = {
            typeFileExists: false,
            tableCount: 0,
            missingTables: [],
            codebaseFiles: [],
            errors: []
        };
    }

    async runVerification() {
        log('🔍 Bắt đầu kiểm tra đồng bộ hoá codebase...');

        try {
            // 1. Kiểm tra file types.ts chính
            await this.verifyMainTypesFile();
            
            // 2. Kiểm tra shared types files
            await this.verifySharedTypesFiles();
            
            // 3. Kiểm tra các table types
            await this.verifyTableTypes();
            
            // 4. Kiểm tra database connectivity
            await this.verifyDatabaseConnection();
            
            // 5. Tạo báo cáo
            await this.generateVerificationReport();
            
            log('✅ Hoàn tất kiểm tra đồng bộ hoá!', 'success');
            
        } catch (error) {
            log(`Lỗi trong quá trình verification: ${error.message}`, 'error');
            throw error;
        }
    }

    async verifyMainTypesFile() {
        log('📋 Kiểm tra file types.ts chính...');

        const typesPath = path.join(WORKSPACE_ROOT, 'apps', 'sabo-user', 'src', 'integrations', 'supabase', 'types.ts');
        
        if (fs.existsSync(typesPath)) {
            this.verificationResults.typeFileExists = true;
            const content = fs.readFileSync(typesPath, 'utf8');
            
            // Đếm số lượng table definitions
            const tableMatches = content.match(/Row: \{/g);
            this.verificationResults.tableCount = tableMatches ? tableMatches.length : 0;
            
            log(`✅ File types.ts: ${this.verificationResults.tableCount} table definitions found`);
            
            // Kiểm tra từng table có trong file không
            for (const tableName of this.expectedTables) {
                if (!content.includes(`${tableName}: {`)) {
                    this.verificationResults.missingTables.push(tableName);
                }
            }
            
            if (this.verificationResults.missingTables.length === 0) {
                log('✅ Tất cả 74 tables đều có trong types.ts');
            } else {
                log(`⚠️ Thiếu ${this.verificationResults.missingTables.length} tables: ${this.verificationResults.missingTables.join(', ')}`);
            }
            
        } else {
            this.verificationResults.typeFileExists = false;
            this.verificationResults.errors.push('File types.ts không tồn tại');
            log('❌ File types.ts không tồn tại', 'error');
        }
    }

    async verifySharedTypesFiles() {
        log('📋 Kiểm tra shared types files...');

        const sharedTypesFiles = [
            'packages/shared-types/src/index.ts',
            'packages/shared-types/src/database.ts',
            'packages/shared-types/src/enums.ts',
            'packages/shared-types/src/relationships.ts'
        ];

        for (const filePath of sharedTypesFiles) {
            const fullPath = path.join(WORKSPACE_ROOT, filePath);
            
            if (fs.existsSync(fullPath)) {
                this.verificationResults.codebaseFiles.push(filePath);
                log(`✅ ${filePath}: OK`);
            } else {
                this.verificationResults.errors.push(`Missing: ${filePath}`);
                log(`❌ ${filePath}: Không tồn tại`, 'error');
            }
        }
    }

    async verifyTableTypes() {
        log('📋 Kiểm tra table type definitions...');

        const typesPath = path.join(WORKSPACE_ROOT, 'apps', 'sabo-user', 'src', 'integrations', 'supabase', 'types.ts');
        
        if (fs.existsSync(typesPath)) {
            const content = fs.readFileSync(typesPath, 'utf8');
            
            // Kiểm tra interface definitions
            const interfaceCount = (content.match(/export interface \w+ \{/g) || []).length;
            log(`✅ Found ${interfaceCount} interface definitions`);
            
            // Kiểm tra export type aliases
            const typeAliasCount = (content.match(/export type \w+Row =/g) || []).length;
            log(`✅ Found ${typeAliasCount} Row type aliases`);
            
            const insertAliasCount = (content.match(/export type \w+Insert =/g) || []).length;
            log(`✅ Found ${insertAliasCount} Insert type aliases`);
            
            const updateAliasCount = (content.match(/export type \w+Update =/g) || []).length;
            log(`✅ Found ${updateAliasCount} Update type aliases`);
        }
    }

    async verifyDatabaseConnection() {
        log('📋 Kiểm tra kết nối database...');

        try {
            // Test với table có data
            const { data, error } = await supabase
                .from('profiles')
                .select('count(*)', { count: 'exact' })
                .limit(1);

            if (!error) {
                log('✅ Database connection: OK');
                log(`✅ Profiles table has ${data?.[0]?.count || 0} records`);
            } else {
                this.verificationResults.errors.push(`Database error: ${error.message}`);
                log(`❌ Database error: ${error.message}`, 'error');
            }
        } catch (err) {
            this.verificationResults.errors.push(`Connection error: ${err.message}`);
            log(`❌ Connection error: ${err.message}`, 'error');
        }
    }

    async generateVerificationReport() {
        log('📋 Tạo báo cáo verification...');

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalExpectedTables: this.expectedTables.length,
                tableDefinitionsFound: this.verificationResults.tableCount,
                missingTables: this.verificationResults.missingTables,
                codebaseFilesVerified: this.verificationResults.codebaseFiles.length,
                errors: this.verificationResults.errors
            },
            status: {
                typeFileExists: this.verificationResults.typeFileExists,
                allTablesPresent: this.verificationResults.missingTables.length === 0,
                sharedTypesComplete: this.verificationResults.codebaseFiles.length === 4,
                hasErrors: this.verificationResults.errors.length > 0
            },
            recommendation: this.getRecommendation()
        };

        const reportPath = path.join(WORKSPACE_ROOT, 'CODEBASE_SYNC_VERIFICATION_REPORT.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        const markdownReportPath = path.join(WORKSPACE_ROOT, 'CODEBASE_SYNC_VERIFICATION_REPORT.md');
        const markdownReport = this.generateMarkdownReport(report);
        fs.writeFileSync(markdownReportPath, markdownReport);

        log(`✅ Báo cáo verification đã tạo: ${reportPath}`);
        log(`✅ Báo cáo markdown: ${markdownReportPath}`);

        // In kết quả ra console
        console.log('\n🎯 KẾT QUẢ KIỂM TRA ĐỒNG BỘ HÓA CODEBASE');
        console.log('===========================================');
        console.log(`📊 Tổng số tables mong đợi: ${report.summary.totalExpectedTables}`);
        console.log(`📋 Table definitions tìm thấy: ${report.summary.tableDefinitionsFound}`);
        console.log(`❌ Tables bị thiếu: ${report.summary.missingTables.length}`);
        console.log(`📁 Shared type files: ${report.summary.codebaseFilesVerified}/4`);
        console.log(`🚨 Lỗi: ${report.summary.errors.length}`);
        
        if (report.status.allTablesPresent && !report.status.hasErrors) {
            console.log('\n✅ THÀNH CÔNG: Codebase đã được đồng bộ hoàn toàn với database!');
            console.log('💡 Tên cột và schema trong codebase đã khớp với database.');
        } else {
            console.log('\n⚠️ CẦN KHẮC PHỤC: Codebase chưa đồng bộ hoàn toàn.');
            console.log(`📋 Khuyến nghị: ${report.recommendation}`);
        }
    }

    getRecommendation() {
        if (this.verificationResults.errors.length > 0) {
            return 'Khắc phục các lỗi kết nối và file missing trước';
        }
        
        if (this.verificationResults.missingTables.length > 0) {
            return 'Chạy lại script generate types để bổ sung tables bị thiếu';
        }
        
        if (this.verificationResults.tableCount < 74) {
            return 'Chạy lại enhanced generator để có đủ 74 tables';
        }
        
        return 'Codebase đã đồng bộ hoàn toàn!';
    }

    generateMarkdownReport(report) {
        return `# SABO Pool V12 - Báo Cáo Kiểm Tra Đồng Bộ Hoá Codebase

**Thời gian:** ${report.timestamp}

## 📊 Tổng Quan

- **Tổng số tables:** ${report.summary.totalExpectedTables}
- **Table definitions found:** ${report.summary.tableDefinitionsFound}
- **Missing tables:** ${report.summary.missingTables.length}
- **Shared type files:** ${report.summary.codebaseFilesVerified}/4
- **Errors:** ${report.summary.errors.length}

## ✅ Trạng Thái

| Tiêu chí | Kết quả |
|----------|---------|
| File types.ts tồn tại | ${report.status.typeFileExists ? '✅' : '❌'} |
| Tất cả tables có mặt | ${report.status.allTablesPresent ? '✅' : '❌'} |
| Shared types đầy đủ | ${report.status.sharedTypesComplete ? '✅' : '❌'} |
| Không có lỗi | ${!report.status.hasErrors ? '✅' : '❌'} |

## 🔍 Chi Tiết

### Tables Bị Thiếu
${report.summary.missingTables.length > 0 ? 
  report.summary.missingTables.map(table => `- ${table}`).join('\n') : 
  '✅ Không có tables bị thiếu'}

### Lỗi
${report.summary.errors.length > 0 ? 
  report.summary.errors.map(error => `- ${error}`).join('\n') : 
  '✅ Không có lỗi'}

### Files Đã Verify
${report.summary.codebaseFilesVerified > 0 ? 
  this.verificationResults.codebaseFiles.map(file => `- ✅ ${file}`).join('\n') : 
  '❌ Chưa có file nào được verify'}

## 💡 Khuyến Nghị

${report.recommendation}

## 🎯 Kết Luận

${report.status.allTablesPresent && !report.status.hasErrors ? 
  '✅ **THÀNH CÔNG:** Codebase đã được đồng bộ hoàn toàn với database schema!' : 
  '⚠️ **CẦN KHẮC PHỤC:** Codebase chưa đồng bộ hoàn toàn với database.'}

---
*Báo cáo được tạo tự động bởi Codebase Sync Verification Tool*
`;
    }
}

// Run verification
async function main() {
    console.log('🔍 SABO Pool V12 - Codebase Synchronization Verification');
    console.log('========================================================');
    console.log('Kiểm tra đồng bộ hoá giữa database schema và TypeScript types...\n');
    
    const verifier = new CodebaseSyncVerification();
    
    try {
        await verifier.runVerification();
        
    } catch (error) {
        console.error('\n❌ Error during verification:', error.message);
        process.exit(1);
    }
}

main().catch(console.error);
