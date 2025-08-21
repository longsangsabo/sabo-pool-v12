const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserAfterMigration() {
  try {
    console.log('🔍 Checking user after migration...\n');
    
    // Get user by email
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', 'sabomedia27@gmail.com');
    
    if (!profiles || profiles.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = profiles[0];
    console.log(`📋 User: ${user.full_name} (${user.email})`);
    
    // Check current SPA balance
    const { data: ranking } = await supabase
      .from('player_rankings')
      .select('spa_balance')
      .eq('user_id', user.id)
      .single();
    
    console.log(`💰 Current SPA Balance: ${ranking?.spa_balance || 0}`);
    
    // Check completed milestones
    const { data: milestones } = await supabase
      .from('player_milestones')
      .select(`
        id,
        milestone_id,
        completed_at,
        milestones!inner(name, spa_reward)
      `)
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('completed_at', { ascending: false });
    
    console.log(`\n🎯 Completed Milestones (${milestones?.length || 0}):`);
    milestones?.forEach(m => {
      console.log(`   ✅ ${m.milestones.name} (+${m.milestones.spa_reward} SPA) - ${new Date(m.completed_at).toLocaleString()}`);
    });
    
    // Check SPA transactions
    const { data: transactions } = await supabase
      .from('spa_transactions')
      .select('amount, description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    console.log(`\n💳 SPA Transactions (${transactions?.length || 0}):`);
    transactions?.forEach(t => {
      console.log(`   ${t.amount > 0 ? '+' : ''}${t.amount} SPA - ${t.description} (${new Date(t.created_at).toLocaleString()})`);
    });
    
    // Check notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('title, message, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    console.log(`\n🔔 Recent Notifications (${notifications?.length || 0}):`);
    notifications?.forEach(n => {
      console.log(`   📢 ${n.title} - ${new Date(n.created_at).toLocaleString()}`);
      console.log(`      ${n.message}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUserAfterMigration();
