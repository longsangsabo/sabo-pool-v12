const fs = require('fs');
const path = require('path');

// Files to update and their replacements
const updates = [
  // Update table names from challenge_notifications to notifications
  {
    file: '/workspaces/sabo-pool-v12/src/services/challengeNotificationService.ts',
    replacements: [
      {
        from: "from('challenge_notifications')",
        to: "from('notifications')"
      }
    ]
  },
  {
    file: '/workspaces/sabo-pool-v12/src/components/notifications/ChallengeNotificationBell.tsx',
    replacements: [
      {
        from: "from('challenge_notifications')",
        to: "from('notifications')"
      },
      {
        from: "table: 'challenge_notifications'",
        to: "table: 'notifications'"
      },
      {
        from: "channel('challenge_notifications_realtime')",
        to: "channel('notifications_realtime')"
      }
    ]
  }
];

// Main function to apply updates
function applyUpdates() {
  console.log('🔄 UPDATING CHALLENGE_NOTIFICATIONS TO NOTIFICATIONS');
  console.log('===================================================');

  updates.forEach(({ file, replacements }) => {
    try {
      console.log(`\\n📝 Updating ${path.basename(file)}...`);
      
      let content = fs.readFileSync(file, 'utf8');
      let changes = 0;

      replacements.forEach(({ from, to }) => {
        const regex = new RegExp(from.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'g');
        const matches = content.match(regex);
        if (matches) {
          content = content.replace(regex, to);
          changes += matches.length;
          console.log(`   ✅ Replaced "${from}" → "${to}" (${matches.length} times)`);
        }
      });

      if (changes > 0) {
        fs.writeFileSync(file, content);
        console.log(`   💾 Saved ${changes} changes to ${path.basename(file)}`);
      } else {
        console.log(`   ℹ️  No changes needed in ${path.basename(file)}`);
      }

    } catch (error) {
      console.error(`   ❌ Error updating ${file}:`, error.message);
    }
  });

  console.log('\\n🎯 SUMMARY');
  console.log('===========');
  console.log('✅ Updated table references from challenge_notifications to notifications');
  console.log('✅ Updated real-time subscriptions');
  console.log('✅ Updated channel names');
  console.log('');
  console.log('📋 REMAINING MANUAL TASKS:');
  console.log('==========================');
  console.log('1. Fix TypeScript types/interfaces that reference challenge_notifications schema');
  console.log('2. Update any remaining field mappings (challenge_id, action_text, etc.)');
  console.log('3. Test all notification functionality');
  console.log('4. Update or deprecate challengeNotificationService if not needed');
}

applyUpdates();
