import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, X, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const EmailVerificationBanner = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    if (user && !user.email_confirmed_at) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [user]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleResendVerification = async () => {
    if (!user?.email || !canResend) return;

    setIsResending(true);
    setCanResend(false);
    try {
      const { AUTH_REDIRECTS } = await import('@/utils/authConfig');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: AUTH_REDIRECTS.emailResend,
        },
      });

      if (error) {
        toast.error(`Lỗi gửi email: ${error.message}`);
        setCanResend(true);
      } else {
        setEmailSent(true);
        setCountdown(60); // Start 60 second countdown
        toast.success('Email xác thực đã được gửi lại!');
        setTimeout(() => setEmailSent(false), 5000);
      }
    } catch (error: any) {
      toast.error('Có lỗi xảy ra khi gửi email');
      setCanResend(true);
    } finally {
      setIsResending(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center'>
          <div className='flex-shrink-0'>
            {emailSent ? (
              <Check className='h-5 w-5 text-green-500' />
            ) : (
              <Mail className='h-5 w-5 text-blue-400' />
            )}
          </div>
          <div className='ml-3'>
            <div className='text-sm'>
              <p className='text-primary-800 font-medium'>
                <strong>📧 Xác thực email:</strong> Vui lòng kiểm tra hộp thư và
                nhấp vào link xác thực để kích hoạt tài khoản.
              </p>
              {emailSent && (
                <p className='text-success-700 text-caption mt-1'>
                  ✅ Email đã được gửi! Vui lòng kiểm tra cả thư mục spam.
                </p>
              )}
            </div>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleResendVerification}
            disabled={isResending || !canResend}
            className='text-primary-800 border-primary-300 hover:bg-primary-100'
          >
            {isResending ? (
              <>
                <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2'></div>
                Đang gửi...
              </>
            ) : !canResend ? (
              `Gửi lại sau ${countdown}s`
            ) : emailSent ? (
              <>
                <Check className='h-3 w-3 mr-2' />
                Đã gửi
              </>
            ) : (
              'Gửi lại'
            )}
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsVisible(false)}
            className='text-primary-800 hover:bg-primary-100'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
