import React from 'react';
import DocCleanupDashboard from '@/components/admin/DocCleanupDashboard';

/**
 * 📊 Admin Doc Cleanup Page
 * Wrapper for the Doc Cleanup Dashboard component
 */

const AdminDocCleanup: React.FC = () => {
  return (
    <div className="p-6">
      <DocCleanupDashboard />
    </div>
  );
};

export default AdminDocCleanup;
