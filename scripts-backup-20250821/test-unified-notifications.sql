-- Insert test notifications để test hệ thống thống nhất
INSERT INTO notifications (
    user_id, 
    type, 
    title, 
    message, 
    priority, 
    is_read,
    action_url
) VALUES
    (
        (SELECT auth.uid()), 
        'challenge',
        'Thách đấu mới!',
        'Bạn nhận được thách đấu từ người chơi khác. Hãy xem chi tiết và quyết định chấp nhận hay từ chối.',
        'high',
        false,
        '/player/challenges'
    ),
    (
        (SELECT auth.uid()), 
        'spa_transfer',
        'Chuyển SPA thành công!',
        'Bạn đã nhận được 50 điểm SPA từ việc thắng thách đấu. Tổng SPA hiện tại: 1250 điểm.',
        'normal',
        false,
        '/player/spa'
    ),
    (
        (SELECT auth.uid()), 
        'system',
        'Cập nhật hệ thống',
        'Hệ thống notification tích hợp đã được cập nhật. Bây giờ bạn có thể xem tất cả thông báo ở một nơi.',
        'normal',
        false,
        null
    ),
    (
        (SELECT auth.uid()), 
        'tournament',
        'Giải đấu sắp bắt đầu!',
        'Giải đấu "SABO Championship 2025" sẽ bắt đầu trong 30 phút. Vui lòng chuẩn bị sẵn sàng.',
        'urgent',
        false,
        '/player/tournaments'
    );
