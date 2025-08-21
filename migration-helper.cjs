#!/usr/bin/env node

/**
 * Component Migration Helper
 * Helps migrate components from old notification systems to unified system
 */

const fs = require('fs');
const path = require('path');

class ComponentMigrationHelper {
  constructor() {
    this.srcDir = '/workspaces/sabo-pool-v12/src';
    this.componentsToMigrate = [];
    this.migrationReport = [];
  }

  async scanForOldNotificationUsage() {
    console.log('🔍 Scanning for components using old notification systems...\n');
    
    const patterns = [
      'useChallengeNotifications',
      'useTournamentNotifications', 
      'useClubNotifications',
      'useSystemNotifications',
      'useMilestoneNotifications',
      'NotificationBell',
      'ChallengeNotificationBell',
      'TournamentNotificationBell'
    ];

    await this.searchInDirectory(this.srcDir, patterns);
    
    console.log(`📋 Found ${this.componentsToMigrate.length} components to migrate:`);
    this.componentsToMigrate.forEach(comp => {
      console.log(`   📄 ${comp.file}: ${comp.patterns.join(', ')}`);
    });
    console.log();
  }

  async searchInDirectory(dir, patterns) {
    try {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          // Skip node_modules and .git
          if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
            await this.searchInDirectory(filePath, patterns);
          }
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
          const content = fs.readFileSync(filePath, 'utf8');
          const foundPatterns = patterns.filter(pattern => content.includes(pattern));
          
          if (foundPatterns.length > 0) {
            this.componentsToMigrate.push({
              file: filePath.replace(this.srcDir, ''),
              fullPath: filePath,
              patterns: foundPatterns,
              content: content
            });
          }
        }
      }
    } catch (err) {
      // Ignore permission errors
    }
  }

  generateMigrationPlan() {
    console.log('📋 MIGRATION PLAN');
    console.log('=================\n');

    this.componentsToMigrate.forEach((comp, index) => {
      console.log(`${index + 1}. ${comp.file}`);
      console.log('   Old patterns found:');
      comp.patterns.forEach(pattern => {
        console.log(`   - ${pattern}`);
      });
      
      console.log('   Suggested changes:');
      
      if (comp.patterns.includes('useChallengeNotifications')) {
        console.log('   ✨ Replace useChallengeNotifications with useUnifiedNotifications');
        console.log('   ✨ Filter notifications by category: "challenge"');
      }
      
      if (comp.patterns.includes('useTournamentNotifications')) {
        console.log('   ✨ Replace useTournamentNotifications with useUnifiedNotifications');
        console.log('   ✨ Filter notifications by category: "tournament"');
      }
      
      if (comp.patterns.includes('useClubNotifications')) {
        console.log('   ✨ Replace useClubNotifications with useUnifiedNotifications');
        console.log('   ✨ Filter notifications by category: "club"');
      }
      
      if (comp.patterns.includes('useMilestoneNotifications')) {
        console.log('   ✨ Replace useMilestoneNotifications with useUnifiedNotifications');
        console.log('   ✨ Filter notifications by category: "milestone"');
      }
      
      if (comp.patterns.some(p => p.includes('NotificationBell'))) {
        console.log('   ✨ Replace with UnifiedNotificationBell');
        console.log('   ✨ Remove individual bell components');
      }
      
      console.log();
    });
  }

  generateSampleMigration() {
    console.log('💡 SAMPLE MIGRATION EXAMPLES');
    console.log('============================\n');

    console.log('📄 OLD WAY (Challenge Notifications):');
    console.log(`
import { useChallengeNotifications } from '../hooks/useChallengeNotifications';

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useChallengeNotifications();
  
  return (
    <div>
      <span>Challenges: {unreadCount}</span>
      {notifications.map(notification => (
        <div key={notification.id}>
          {notification.message}
          <button onClick={() => markAsRead(notification.id)}>Mark Read</button>
        </div>
      ))}
    </div>
  );
}
`);

    console.log('📄 NEW WAY (Unified System):');
    console.log(`
import { useUnifiedNotifications } from '../hooks/useUnifiedNotifications';

function MyComponent() {
  const { 
    notifications, 
    stats, 
    markAsRead,
    filteredNotifications 
  } = useUnifiedNotifications();
  
  // Get only challenge notifications
  const challengeNotifications = filteredNotifications('challenge');
  
  return (
    <div>
      <span>Challenges: {stats.challenge.unread}</span>
      {challengeNotifications.map(notification => (
        <div key={notification.id}>
          {notification.message}
          <button onClick={() => markAsRead(notification.id)}>Mark Read</button>
        </div>
      ))}
    </div>
  );
}
`);

    console.log('📄 OLD WAY (Multiple Notification Bells):');
    console.log(`
import { ChallengeNotificationBell } from '../components/ChallengeNotificationBell';
import { TournamentNotificationBell } from '../components/TournamentNotificationBell';

function Header() {
  return (
    <div>
      <ChallengeNotificationBell />
      <TournamentNotificationBell />
    </div>
  );
}
`);

    console.log('📄 NEW WAY (Single Unified Bell):');
    console.log(`
import { UnifiedNotificationBell } from '../components/UnifiedNotificationComponents';

function Header() {
  return (
    <div>
      <UnifiedNotificationBell />
    </div>
  );
}
`);
  }

  generateMigrationScript(componentPath) {
    const comp = this.componentsToMigrate.find(c => c.file === componentPath || c.fullPath === componentPath);
    if (!comp) {
      console.log(`❌ Component ${componentPath} not found in migration list`);
      return;
    }

    console.log(`🔧 MIGRATION SCRIPT FOR: ${comp.file}`);
    console.log('=====================================\n');

    let migratedContent = comp.content;

    // Replace imports
    if (migratedContent.includes('useChallengeNotifications')) {
      migratedContent = migratedContent.replace(
        /import.*useChallengeNotifications.*from.*['"][^'"]*['"];?/g,
        "import { useUnifiedNotifications } from '../hooks/useUnifiedNotifications';"
      );
    }

    if (migratedContent.includes('useTournamentNotifications')) {
      migratedContent = migratedContent.replace(
        /import.*useTournamentNotifications.*from.*['"][^'"]*['"];?/g,
        "import { useUnifiedNotifications } from '../hooks/useUnifiedNotifications';"
      );
    }

    // Replace hook usage
    migratedContent = migratedContent.replace(
      /const\s*{[^}]*}\s*=\s*useChallengeNotifications\(\);?/g,
      `const { notifications, stats, markAsRead, markAllAsRead, markAsArchived, deleteNotification, filteredNotifications } = useUnifiedNotifications();
  const challengeNotifications = filteredNotifications('challenge');`
    );

    migratedContent = migratedContent.replace(
      /const\s*{[^}]*}\s*=\s*useTournamentNotifications\(\);?/g,
      `const { notifications, stats, markAsRead, markAllAsRead, markAsArchived, deleteNotification, filteredNotifications } = useUnifiedNotifications();
  const tournamentNotifications = filteredNotifications('tournament');`
    );

    // Replace notification bell imports
    migratedContent = migratedContent.replace(
      /import.*NotificationBell.*from.*['"][^'"]*['"];?/g,
      "import { UnifiedNotificationBell } from '../components/UnifiedNotificationComponents';"
    );

    // Replace bell usage
    migratedContent = migratedContent.replace(
      /<(Challenge|Tournament|Club|System)NotificationBell[^>]*\/>/g,
      '<UnifiedNotificationBell />'
    );

    console.log('📝 MIGRATED CONTENT:');
    console.log('-------------------');
    console.log(migratedContent);
    console.log();

    const backupPath = comp.fullPath + '.backup';
    console.log(`💾 To apply migration:`);
    console.log(`   1. Backup: cp "${comp.fullPath}" "${backupPath}"`);
    console.log(`   2. Apply changes to: ${comp.fullPath}`);
    console.log(`   3. Test the component`);
    console.log(`   4. Remove backup if successful`);
  }

  async createMigrationBatch() {
    console.log('📦 CREATING MIGRATION BATCH SCRIPT');
    console.log('==================================\n');

    const batchScript = `#!/bin/bash

# Unified Notification System Migration Batch
# Auto-generated migration script

echo "🚀 Starting Unified Notification System Migration"
echo "================================================="

# Create backups directory
mkdir -p /workspaces/sabo-pool-v12/migration-backups/$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/workspaces/sabo-pool-v12/migration-backups/$(date +%Y%m%d_%H%M%S)"

echo "📂 Backup directory: $BACKUP_DIR"

# Backup all files to be migrated
${this.componentsToMigrate.map(comp => 
  `echo "💾 Backing up: ${comp.file}"
cp "${comp.fullPath}" "$BACKUP_DIR/$(basename ${comp.file})"`)
  .join('\n')}

echo "✅ Backups complete"
echo "🔧 Ready for manual migration"
echo ""
echo "⚠️  MANUAL STEPS REQUIRED:"
echo "1. Use the migration helper to generate updated code"
echo "2. Test each component individually"
echo "3. Update import paths if needed"
echo "4. Test unified notification system"
echo ""
echo "💡 Run: node test-unified-notification-system.cjs"
echo "   to verify system is working"
`;

    fs.writeFileSync('/workspaces/sabo-pool-v12/migrate-to-unified.sh', batchScript);
    fs.chmodSync('/workspaces/sabo-pool-v12/migrate-to-unified.sh', '755');

    console.log('✅ Created migration script: migrate-to-unified.sh');
    console.log('🔧 Run with: ./migrate-to-unified.sh');
  }

  async run() {
    console.log('🚀 UNIFIED NOTIFICATION MIGRATION HELPER');
    console.log('=========================================\n');

    await this.scanForOldNotificationUsage();
    this.generateMigrationPlan();
    this.generateSampleMigration();
    await this.createMigrationBatch();

    console.log('\n🎉 MIGRATION ANALYSIS COMPLETE');
    console.log('==============================');
    console.log(`✅ Found ${this.componentsToMigrate.length} components to migrate`);
    console.log('✅ Generated migration plan');
    console.log('✅ Created backup script');
    
    if (this.componentsToMigrate.length > 0) {
      console.log('\n🔧 NEXT STEPS:');
      console.log('1. Review the migration plan above');
      console.log('2. Run: ./migrate-to-unified.sh (creates backups)');
      console.log('3. Use generateMigrationScript() for each component');
      console.log('4. Test: node test-unified-notification-system.cjs');
      console.log('5. Deploy unified system');
      
      console.log('\n💡 For specific component migration:');
      console.log('   helper.generateMigrationScript("/path/to/component.tsx")');
    } else {
      console.log('\n🎉 NO COMPONENTS NEED MIGRATION!');
      console.log('   System is already using unified notifications');
    }
  }
}

// Run the migration helper
const helper = new ComponentMigrationHelper();
helper.run().catch(console.error);

// Export for manual use
module.exports = ComponentMigrationHelper;
