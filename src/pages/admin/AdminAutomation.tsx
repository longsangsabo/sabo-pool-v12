import React from 'react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import AutomationConsole from '@/components/admin/AutomationConsole';
import { Helmet } from 'react-helmet-async';

const AdminAutomation = () => {
  const { isAdmin, isLoading } = useAdminCheck();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold mb-2'>Access Denied</h2>
          <p className='text-muted-foreground'>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Automation Console</title>
        <meta name='description' content='Manage and monitor tournament automation tasks and health.' />
        <link rel='canonical' href='/admin/automation' />
      </Helmet>
      <AutomationConsole />
    </>
  );
};

export default AdminAutomation;

