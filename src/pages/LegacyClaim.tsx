import React from 'react';
import { LegacyClaimForm } from '@/components/legacy/LegacyClaimForm';

const LegacyClaim: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎯 SABO Pool Arena
          </h1>
          <p className="text-gray-600">
            Yêu cầu chuyển SPA Points từ Legacy Account
          </p>
        </div>
        
        <LegacyClaimForm />
        
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            Sau khi gửi yêu cầu, admin sẽ xem xét và phê duyệt trong thời gian sớm nhất.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegacyClaim;
