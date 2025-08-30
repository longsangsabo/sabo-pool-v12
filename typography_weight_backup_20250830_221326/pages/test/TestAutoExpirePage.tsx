import React from 'react';
import AutoExpireTestComponent from '@/components/test/AutoExpireTestComponent';

const TestAutoExpirePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-gray-100 mb-2">
            🧪 Auto-Expire Challenge System Test
          </h1>
          <p className="text-neutral-600 dark:text-gray-400">
            Kiểm tra hệ thống tự động ẩn thách đấu hết hạn trên mobile UI
          </p>
        </div>
        
        <AutoExpireTestComponent />
        
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-gray-700">
            <h2 className="text-title font-semibold mb-4">📋 Test Instructions</h2>
            <div className="space-y-3 text-body-small text-neutral-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <span className="font-medium text-primary-600">1.</span>
                <span>Kiểm tra số lượng challenges trên dashboard</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-primary-600">2.</span>
                <span>Click "Test Auto-Expire Ngay" để chạy manual test</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-primary-600">3.</span>
                <span>Quan sát số challenges "Active" vs "Expired"</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-primary-600">4.</span>
                <span>Kiểm tra UI filtered results - chỉ hiển thị challenges hợp lệ</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-primary-600">5.</span>
                <span>Mở tab "Thách đấu" trên mobile để xem UI đã sạch sẽ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAutoExpirePage;
