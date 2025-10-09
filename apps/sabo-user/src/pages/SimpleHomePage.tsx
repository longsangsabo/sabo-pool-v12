import React from 'react';

const SimpleHomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          SABO ARENA
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Nền tảng kết nối cộng đồng người chơi bida tại Việt Nam
        </p>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              🎱 Tính năng chính
            </h2>
            <ul className="text-gray-600 space-y-1">
              <li>• Kết nối người chơi bida</li>
              <li>• Tổ chức giải đấu</li>
              <li>• Quản lý câu lạc bộ</li>
              <li>• Thách đấu trực tuyến</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              📱 Liên hệ
            </h2>
            <p className="text-gray-600">
              Email: longsangsabo@gmail.com<br/>
              Phone: 0961167717
            </p>
          </div>
          
          <div className="mt-8 space-x-4">
            <a 
              href="/privacy-policy" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Chính sách bảo mật
            </a>
            <a 
              href="/delete-account" 
              className="inline-block bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
            >
              Xóa tài khoản
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleHomePage;