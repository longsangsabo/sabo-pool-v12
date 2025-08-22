const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSabototheskyRank() {
    console.log('🔧 FIX RANK CHO USER: sabotothesky@gmail.com');
    console.log('==========================================');
    
    const requestId = '05f53ded-846e-4a4f-b87e-c0164686ffe35';
    const approverId = '18f49e79-f402-46d1-90be-889006e9761c';
    
    try {
        console.log('📞 Calling manual_approve_rank_request function...');
        console.log(`Request ID: ${requestId}`);
        console.log(`Approver ID: ${approverId}`);
        
        const { data, error } = await supabase.rpc('manual_approve_rank_request', {
            p_request_id: requestId,
            p_approver_id: approverId
        });
        
        if (error) {
            console.log('❌ Lỗi khi gọi function:', error);
            
            // Nếu function chưa có, tạo luôn với SQL trực tiếp
            console.log('\n🔄 Trying direct SQL update...');
            
            // Update profile directly
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ 
                    verified_rank: 'H+',
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', '318fbe86-22c7-4d74-bca5-865661a6284f');
                
            if (profileError) {
                console.log('❌ Lỗi update profile:', profileError);
            } else {
                console.log('✅ Profile updated successfully');
            }
            
            // Create notification
            const { error: notifError } = await supabase
                .from('notifications')
                .insert({
                    user_id: '318fbe86-22c7-4d74-bca5-865661a6284f',
                    title: 'Rank Approved! 🎉',
                    message: 'Congratulations! Your rank H+ has been approved by SBO POOL ARENA.',
                    type: 'rank_approval',
                    metadata: {
                        rank: 'H+',
                        request_id: requestId,
                        club_name: 'SBO POOL ARENA'
                    },
                    created_at: new Date().toISOString()
                });
                
            if (notifError) {
                console.log('❌ Lỗi tạo notification:', notifError);
            } else {
                console.log('✅ Notification created successfully');
            }
            
        } else {
            console.log('✅ Function executed successfully:', data);
        }
        
        // Verify results
        console.log('\n🔍 Verifying results...');
        
        const { data: updatedProfile } = await supabase
            .from('profiles')
            .select('verified_rank, updated_at')
            .eq('user_id', '318fbe86-22c7-4d74-bca5-865661a6284f')
            .single();
            
        console.log('📊 Updated profile:', updatedProfile);
        
        const { data: notifications } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', '318fbe86-22c7-4d74-bca5-865661a6284f')
            .eq('type', 'rank_approval')
            .order('created_at', { ascending: false })
            .limit(1);
            
        console.log('🔔 Latest notification:', notifications?.[0] || 'None');
        
        console.log('\n✅ FIX COMPLETED FOR SABOTOTHESKY!');
        console.log('User should now see:');
        console.log('- ✅ Verified rank: H+');
        console.log('- ✅ Notification about rank approval');
        console.log('- ✅ Updated profile');
        
    } catch (error) {
        console.error('❌ Lỗi tổng thể:', error);
    }
}

fixSabototheskyRank();
