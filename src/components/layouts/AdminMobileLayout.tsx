import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminHybridLayout } from '@/components/mobile/AdminHybridLayout';
import { AdminMobileDrawer } from '@/components/admin/AdminMobileDrawer';

interface AdminMobileLayoutProps {
  children?: React.ReactNode;
}

export const AdminMobileLayout: React.FC<AdminMobileLayoutProps> = ({
  children,
}) => {
  const { user, isAdmin, loading } = useAdminAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <AdminHybridLayout onMenuClick={() => setIsDrawerOpen(true)}>
      {children || <Outlet />}
      
      <AdminMobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </AdminHybridLayout>
  );
};
