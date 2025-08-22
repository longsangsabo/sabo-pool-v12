const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserSabotothesky() {
    console.log('🔍 KIỂM TRA USER: sabotothesky@gmail.com');
    console.log('=======================================');
    
    try {
        // 1. Tìm user profile
        console.log('\n1. 👤 Tìm user profile...');
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', 'sabotothesky@gmail.com')
            .single();
            
        if (profileError) {
            console.log('❌ Lỗi tìm profile:', profileError.message);
            return;
        }
        
        if (!profile) {
            console.log('❌ Không tìm thấy user với email sabotothesky@gmail.com');
            return;
        }
        
        console.log('✅ Tìm thấy user:', {
            id: profile.id,
            user_id: profile.user_id,
            email: profile.email,
            display_name: profile.display_name,
            verified_rank: profile.verified_rank,
            updated_at: profile.updated_at
        });
        
        const userId = profile.user_id;
        
        // 2. Kiểm tra rank requests
        console.log('\n2. 📋 Kiểm tra rank requests...');
        const { data: rankRequests, error: rankError } = await supabase
            .from('rank_requests')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5);
            
        if (rankError) {
            console.log('❌ Lỗi tìm rank requests:', rankError.message);
        } else {
            console.log(`✅ Tìm thấy ${rankRequests.length} rank requests:`);
            rankRequests.forEach((req, i) => {
                console.log(`   ${i + 1}. Status: ${req.status}, Rank: ${req.requested_rank}, Created: ${req.created_at}`);
                if (req.status === 'approved') {
                    console.log(`      Approved by: ${req.approved_by}, At: ${req.approved_at}`);
                }
            });
        }
        
        // 3. Kiểm tra SPA transactions
        console.log('\n3. 💰 Kiểm tra SPA transactions...');
        const { data: spaTransactions, error: spaError } = await supabase
            .from('spa_transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);
            
        if (spaError) {
            console.log('❌ Lỗi tìm SPA transactions:', spaError.message);
        } else {
            console.log(`✅ Tìm thấy ${spaTransactions.length} SPA transactions:`);
            let totalSPA = 0;
            spaTransactions.forEach((txn, i) => {
                console.log(`   ${i + 1}. ${txn.points > 0 ? '+' : ''}${txn.points} SPA - ${txn.transaction_type} - ${txn.description} (${txn.created_at})`);
                totalSPA += txn.points;
            });
            console.log(`   📊 Tổng SPA: ${totalSPA}`);
        }
        
        // 4. Kiểm tra wallet
        console.log('\n4. 💳 Kiểm tra wallet...');
        const { data: wallet, error: walletError } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', userId)
            .single();
            
        if (walletError) {
            console.log('❌ Lỗi tìm wallet:', walletError.message);
        } else if (wallet) {
            console.log('✅ Wallet:', {
                points_balance: wallet.points_balance,
                updated_at: wallet.updated_at
            });
        } else {
            console.log('⚠️ Chưa có wallet');
        }
        
        // 5. Kiểm tra notifications
        console.log('\n5. 🔔 Kiểm tra notifications...');
        const { data: notifications, error: notifError } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5);
            
        if (notifError) {
            console.log('❌ Lỗi tìm notifications:', notifError.message);
        } else {
            console.log(`✅ Tìm thấy ${notifications.length} notifications:`);
            notifications.forEach((notif, i) => {
                console.log(`   ${i + 1}. [${notif.type}] ${notif.title} - ${notif.message} (${notif.created_at})`);
            });
        }
        
        // 6. Kiểm tra club membership
        console.log('\n6. 🏆 Kiểm tra club membership...');
        const { data: clubMembers, error: clubError } = await supabase
            .from('club_members')
            .select(`
                *,
                club_profiles (
                    club_name
                )
            `)
            .eq('user_id', userId);
            
        if (clubError) {
            console.log('❌ Lỗi tìm club membership:', clubError.message);
        } else if (clubMembers && clubMembers.length > 0) {
            console.log('✅ Club memberships:');
            clubMembers.forEach((member, i) => {
                console.log(`   ${i + 1}. Club: ${member.club_profiles?.club_name}, Status: ${member.status}, Role: ${member.role}`);
            });
        } else {
            console.log('⚠️ Chưa có club membership');
        }
        
        // 7. Tóm tắt và đề xuất
        console.log('\n📊 TÓM TẮT & ĐỀ XUẤT:');
        console.log('========================');
        
        const latestRankRequest = rankRequests?.[0];
        if (latestRankRequest) {
            console.log(`🎯 Rank request gần nhất: ${latestRankRequest.status} (${latestRankRequest.requested_rank})`);
            
            if (latestRankRequest.status === 'approved') {
                console.log('✅ Rank đã được duyệt');
                console.log(`🏅 Verified rank trong profile: ${profile.verified_rank || 'CHƯA CẬP NHẬT'}`);
                
                // Kiểm tra xem profile có được cập nhật chưa
                if (!profile.verified_rank) {
                    console.log('\n⚠️ VẤN ĐỀ PHÁT HIỆN:');
                    console.log('- Rank request đã approved nhưng verified_rank trong profile chưa được cập nhật');
                    console.log('- Cần chạy function manual_approve_rank_request để cập nhật');
                }
                
                // Kiểm tra SPA
                if (spaTransactions && spaTransactions.length > 0) {
                    const totalSPA = spaTransactions.reduce((sum, txn) => sum + txn.points, 0);
                    console.log(`💰 Tổng SPA từ transactions: ${totalSPA}`);
                } else {
                    console.log('⚠️ Chưa có SPA transaction nào từ rank approval');
                }
                
                // Kiểm tra wallet
                if (wallet) {
                    console.log(`💳 Số dư wallet hiện tại: ${wallet.points_balance} SPA`);
                } else {
                    console.log('⚠️ Chưa có wallet (cần tạo)');
                }
                
                // Kiểm tra notifications
                const rankApprovalNotifs = notifications?.filter(n => n.type === 'rank_approval') || [];
                if (rankApprovalNotifs.length === 0) {
                    console.log('⚠️ Chưa có notification về rank approval');
                }
                
            } else if (latestRankRequest.status === 'pending') {
                console.log('⏳ Rank request đang chờ duyệt - cần admin approve');
            }
        } else {
            console.log('⚠️ Chưa có rank request nào');
        }
        
        console.log('\n🔧 HÀNH ĐỘNG CẦN THIẾT:');
        if (latestRankRequest?.status === 'approved' && !profile.verified_rank) {
            console.log('1. Chạy ultra-safe-approval-function.sql trong Supabase Dashboard');
            console.log('2. Gọi manual_approve_rank_request() với request ID:', latestRankRequest.id);
        }
        
    } catch (error) {
        console.error('❌ Lỗi tổng thể:', error);
    }
}

checkUserSabotothesky();
