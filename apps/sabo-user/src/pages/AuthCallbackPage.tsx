import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
 getAuthSuccessMessage,
 getAuthErrorMessage,
 getSecureRedirectUrl,
} from '@/services/userService';

const AuthCallbackPage = () => {
 const navigate = useNavigate();
 const { user, loading } = useAuth();
 const [searchParams] = useSearchParams();
 const [isProcessing, setIsProcessing] = useState(true);

 useEffect(() => {
  const handleAuthCallback = async () => {
   // Wait for auth to load
   if (loading) return;

   try {
    const type = searchParams.get('type');
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    const secureRedirectUrl = getSecureRedirectUrl(redirectTo);

    console.log('Auth Callback Processing:', {
     type,
     requestedRedirect: redirectTo,
     secureRedirect: secureRedirectUrl,
     hasUser: !!user,
     userId: user?.id,
    });

    if (user) {
     // Success case
     const successMessage = getAuthSuccessMessage(type);
     toast.success(successMessage);

     // Add small delay for better UX
     setTimeout(() => {
      navigate(secureRedirectUrl, { replace: true });
     }, 500);
    } else {
     // Auth failed case
     const errorMessage = getAuthErrorMessage(type);
     toast.error(errorMessage);

     setTimeout(() => {
      navigate('/auth/login', { replace: true });
     }, 1000);
    }
   } catch (error) {
    console.error('Auth callback error:', error);
    toast.error('Có lỗi xảy ra trong quá trình xác thực');
    navigate('/auth/login', { replace: true });
   } finally {
    setIsProcessing(false);
   }
  };

  handleAuthCallback();
 }, [user, loading, navigate, searchParams]);

 const type = searchParams.get('type');
 const getLoadingMessage = (type: string | undefined) => {
  switch (type) {
   case 'email_signup':
    return 'Đang hoàn tất đăng ký...';
   case 'email_confirm':
    return 'Đang xác thực email...';
   case 'oauth':
    return 'Đang xử lý đăng nhập mạng xã hội...';
   case 'password_reset':
    return 'Đang xử lý đặt lại mật khẩu...';
   default:
    return 'Đang xử lý xác thực...';
  }
 };

 return (
  <div className='min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center'>
   <div className='text-center text-var(--color-background) max-w-md mx-auto p-6'>
    <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-6'></div>

    <h1 className='text-title-semibold mb-2'>
     {getLoadingMessage(type)}
    </h1>

    <p className='text-body-small text-gray-300 mb-4'>
     Vui lòng đợi trong giây lát
    </p>

    {type && (
     <div className='text-caption text-gray-400 bg-blue-800/30 rounded-lg p-3'>
      <span>Loại xác thực: </span>
      <span className='font-mono'>{type}</span>
     </div>
    )}

    {/* Progress bar */}
    <div className='w-full bg-blue-800/50 rounded-full h-1 mt-4'>
     <div
      className={`bg-yellow-400 h-1 rounded-full transition-all duration-[3000ms] ease-out ${isProcessing ? 'w-full' : 'w-0'}`}
     />
    </div>
   </div>
  </div>
 );
};

export default AuthCallbackPage;
