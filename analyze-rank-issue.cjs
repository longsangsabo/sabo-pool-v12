const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeRankApprovalIssue() {
    console.log('🔍 PHÂN TÍCH NGUYÊN NHÂN RANK APPROVAL ISSUE');
    console.log('==========================================');
    
    try {
        // 1. Kiểm tra xem function có tồn tại không
        console.log('\n1. 🔧 Kiểm tra function manual_approve_rank_request...');
        const { data: functions, error: funcError } = await supabase.rpc('exec_sql', {
            sql_query: `
                SELECT 
                    routine_name,
                    routine_type,
                    specific_name,
                    routine_definition
                FROM information_schema.routines 
                WHERE routine_schema = 'public' 
                AND routine_name = 'manual_approve_rank_request';
            `
        });
        
        if (funcError) {
            console.log('❌ Lỗi kiểm tra function:', funcError.message);
        } else {
            console.log('📊 Functions found:', functions?.length || 0);
        }
        
        // 2. Kiểm tra trigger tự động
        console.log('\n2. ⚡ Kiểm tra triggers...');
        const { data: triggers, error: triggerError } = await supabase.rpc('exec_sql', {
            sql_query: `
                SELECT 
                    trigger_name,
                    event_manipulation,
                    event_object_table,
                    action_statement
                FROM information_schema.triggers 
                WHERE event_object_schema = 'public' 
                AND event_object_table = 'rank_requests';
            `
        });
        
        if (triggerError) {
            console.log('❌ Lỗi kiểm tra trigger:', triggerError.message);
        } else {
            console.log('📊 Triggers found:', triggers?.length || 0);
        }
        
        // 3. Kiểm tra các rank request đã approved nhưng chưa xử lý
        console.log('\n3. 📋 Kiểm tra rank requests chưa xử lý...');
        const { data: unprocessedRequests, error: reqError } = await supabase
            .from('rank_requests')
            .select(`
                id,
                user_id,
                requested_rank,
                status,
                approved_at,
                profiles!inner (
                    verified_rank,
                    email,
                    display_name
                )
            `)
            .eq('status', 'approved')
            .order('approved_at', { ascending: false })
            .limit(10);
            
        if (reqError) {
            console.log('❌ Lỗi kiểm tra requests:', reqError.message);
        } else {
            console.log(`📊 Tìm thấy ${unprocessedRequests?.length || 0} approved requests:`);
            
            let unprocessedCount = 0;
            unprocessedRequests?.forEach((req, i) => {
                const isProcessed = req.profiles?.verified_rank !== null;
                const status = isProcessed ? '✅ ĐÃ XỬ LÝ' : '❌ CHƯA XỬ LÝ';
                
                console.log(`   ${i + 1}. ${req.profiles?.email} - Rank: ${req.requested_rank} - ${status}`);
                
                if (!isProcessed) unprocessedCount++;
            });
            
            console.log(`\n📊 Tổng kết: ${unprocessedCount}/${unprocessedRequests?.length || 0} requests chưa được xử lý`);
        }
        
        // 4. Đưa ra kết luận
        console.log('\n📊 KẾT LUẬN VÀ GIẢI PHÁP:');
        console.log('========================');
        
        console.log('\n❌ NGUYÊN NHÂN CHÍNH:');
        console.log('1. Frontend GỌI function manual_approve_rank_request');
        console.log('2. Nhưng function KHÔNG TỒN TẠI hoặc BỊ LỖI');
        console.log('3. Frontend không có fallback mechanism');
        console.log('4. Admin nghĩ là đã approve nhưng thực tế chưa xử lý');
        
        console.log('\n🔧 WORKFLOW HIỆN TẠI:');
        console.log('Admin click → Frontend gọi manual_approve_rank_request() → FAIL SILENT → User không nhận được gì');
        
        console.log('\n✅ GIẢI PHÁP NGAY LẬP TỨC:');
        console.log('1. Deploy ultra-safe-approval-function.sql vào Supabase');
        console.log('2. Test function với 1 request mới');
        console.log('3. Fix các request đã bị miss (như sabotothesky)');
        
        console.log('\n🛠️ GIẢI PHÁP LÂUUNG:');
        console.log('1. Tạo trigger tự động thay vì rely on function call');
        console.log('2. Thêm error handling trong frontend');
        console.log('3. Log approval actions để track');
        console.log('4. Notification cho admin khi có lỗi');
        
    } catch (error) {
        console.error('❌ Lỗi tổng thể:', error);
    }
}

analyzeRankApprovalIssue();
