-- ================================================================================
-- PHÂN TÍCH NGUYÊN NHÂN VÀ GIẢI PHÁP RANK APPROVAL
-- ================================================================================

-- Kiểm tra xem có function manual_approve_rank_request không
SELECT 
    routine_name,
    routine_type,
    specific_name
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'manual_approve_rank_request';

-- Kiểm tra trigger tự động
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public' 
AND event_object_table = 'rank_requests';

-- Kiểm tra các rank request đã approved nhưng chưa xử lý
SELECT 
    rr.id,
    rr.user_id,
    rr.requested_rank,
    rr.status,
    rr.approved_at,
    p.verified_rank,
    p.email,
    p.display_name,
    CASE 
        WHEN rr.status = 'approved' AND p.verified_rank IS NULL THEN 'CHƯA XỬ LÝ'
        WHEN rr.status = 'approved' AND p.verified_rank IS NOT NULL THEN 'ĐÃ XỬ LÝ'
        ELSE 'CHƯA DUYỆT'
    END as processing_status
FROM rank_requests rr
JOIN profiles p ON rr.user_id = p.user_id
WHERE rr.status = 'approved'
ORDER BY rr.approved_at DESC
LIMIT 10;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 PHÂN TÍCH NGUYÊN NHÂN';
    RAISE NOTICE '======================';
    RAISE NOTICE '';
    RAISE NOTICE '❌ NGUYÊN NHÂN CHÍNH:';
    RAISE NOTICE '1. Frontend chỉ UPDATE status = "approved" trong rank_requests';
    RAISE NOTICE '2. KHÔNG có trigger tự động xử lý khi status thay đổi';
    RAISE NOTICE '3. KHÔNG có function được gọi sau khi approve';
    RAISE NOTICE '4. Workflow bị đứt gãy giữa approve và update profile';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 WORKFLOW HIỆN TẠI (SAI):';
    RAISE NOTICE 'Admin click Approve → Update rank_requests.status → HẾT!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ WORKFLOW ĐÚNG CẦN CÓ:';
    RAISE NOTICE 'Admin click Approve → Update rank_requests.status → TRIGGER/FUNCTION tự động:';
    RAISE NOTICE '  - Update profiles.verified_rank';
    RAISE NOTICE '  - Create notification';
    RAISE NOTICE '  - Update club_members';
    RAISE NOTICE '  - Log activity';
    RAISE NOTICE '';
    RAISE NOTICE '🛠️ GIẢI PHÁP:';
    RAISE NOTICE '1. Tạo trigger tự động khi rank_requests.status = "approved"';
    RAISE NOTICE '2. Hoặc sửa frontend gọi function thay vì UPDATE trực tiếp';
    RAISE NOTICE '3. Test với user mới để đảm bảo workflow hoạt động';
    RAISE NOTICE '';
END $$;
