import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminCheck } from '@/hooks/useRoles';
import { Loader2, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();
  const location = useLocation();
  const navigate = useNavigate();

  const loading = authLoading || adminLoading;

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-primary' />
          <p className='text-muted-foreground'>Đang kiểm tra quyền admin...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // ✅ REMOVED HARDCODED EMAIL BYPASS - SECURITY FIX
  // Now using only the proper role-based system

  if (!isAdmin) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10'>
              <Shield className='h-6 w-6 text-destructive' />
            </div>
            <CardTitle className='text-xl'>Không Có Quyền Truy Cập</CardTitle>
          </CardHeader>
          <CardContent className='text-center space-y-4'>
            <p className='text-muted-foreground'>
              Bạn cần quyền admin để truy cập trang này.
            </p>
            <p className='text-xs text-muted-foreground'>
              Email: {user?.email}
            </p>
            <div className='flex gap-2 justify-center'>
              <button
                onClick={() => navigate('/dashboard')}
                className='text-sm underline'
              >
                Về Dashboard
              </button>
              <button
                onClick={() => navigate('/')}
                className='text-sm underline'
              >
                Trang chủ
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
