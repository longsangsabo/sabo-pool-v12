import React from 'react';
import { LegacyClaimAdminPanel } from '../components/legacy/LegacyClaimAdminPanel';

const LegacyClaimAdminPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🛡️ SABO Admin - Legacy Claim Management
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Xử lý yêu cầu claim SPA Points từ hệ thống legacy
          </p>
        </div>
        
        <LegacyClaimAdminPanel />
      </div>
    </div>
  );
};

export default LegacyClaimAdminPage;
