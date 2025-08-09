import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import {
  EnhancedAuthTabs,
  PhoneTabContent,
  EmailTabContent,
} from '@/components/auth/EnhancedAuthTabs';
import { FacebookLoginButton } from '@/components/auth/FacebookLoginButton';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { TermsCheckbox } from '@/components/auth/TermsCheckbox';
import { OAuthSetupGuide } from '@/components/auth/OAuthSetupGuide';
import { handleAuthError } from '@/utils/authHelpers';
import { Gift, Moon, Sun, ArrowLeft } from 'lucide-react';

const EnhancedRegisterPage = () => {
  const [phone, setPhone] = useState('');
  const [phonePassword, setPhonePassword] = useState('');
  const [phoneConfirmPassword, setPhoneConfirmPassword] = useState('');
  const [phoneFullName, setPhoneFullName] = useState('');

  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailConfirmPassword, setEmailConfirmPassword] = useState('');
  const [emailFullName, setEmailFullName] = useState('');

  const [phoneTermsAccepted, setPhoneTermsAccepted] = useState(false);
  const [emailTermsAccepted, setEmailTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { signUpWithPhone, signUpWithEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !phonePassword || !phoneConfirmPassword || !phoneFullName) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (!phoneTermsAccepted) {
      toast.error('Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }

    if (!/^0\d{9}$/.test(phone)) {
      toast.error(
        'Số điện thoại phải có 10 số và bắt đầu bằng 0 (VD: 0961167717)'
      );
      return;
    }

    if (phonePassword !== phoneConfirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (phonePassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUpWithPhone(
        phone,
        phonePassword,
        phoneFullName,
        referralCode
      );

      if (error) {
        handleAuthError(error);
      } else {
        toast.success(
          referralCode
            ? 'Đăng ký thành công! Bạn và người giới thiệu đều nhận được 100 SPA!'
            : 'Đăng ký thành công! Chào mừng bạn đến với SABO ARENA!'
        );
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Phone registration error:', error);
      toast.error('Có lỗi xảy ra khi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !emailPassword || !emailConfirmPassword || !emailFullName) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (!emailTermsAccepted) {
      toast.error('Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Email không hợp lệ');
      return;
    }

    if (emailPassword !== emailConfirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (emailPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUpWithEmail(
        email,
        emailPassword,
        emailFullName,
        referralCode
      );

      if (error) {
        handleAuthError(error);
      } else {
        toast.success(
          referralCode
            ? 'Đăng ký thành công! Bạn và người giới thiệu đều nhận được 100 SPA! Vui lòng kiểm tra email để xác thực tài khoản.'
            : 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.'
        );
        navigate('/auth/login');
      }
    } catch (error) {
      console.error('Email registration error:', error);
      toast.error('Có lỗi xảy ra khi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>ĐĂNG KÝ - SABO ARENA</title>
      </Helmet>

      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors duration-300'>
        {/* Theme Toggle Button */}
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className='fixed top-4 right-4 z-50 h-10 w-10 rounded-full border border-slate-300/60 bg-white/40 hover:bg-slate-100 hover:border-slate-400 dark:border-slate-700/50 dark:bg-slate-800/40 dark:hover:border-slate-500 dark:hover:bg-slate-800/60 transition-colors'
          aria-label='Chuyển giao diện'
        >
          {theme === 'light' ? <Moon className='w-4 h-4 text-slate-700' /> : <Sun className='w-4 h-4 text-amber-300' />}
        </Button>

        {/* Back to Home Button */}
        <Link
          to='/'
          className='fixed top-4 left-4 z-50 flex items-center gap-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors'
        >
          <ArrowLeft className='w-4 h-4' />
          <span className='text-sm font-medium'>Về trang chủ</span>
        </Link>

        <div className='bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-200/70 dark:border-slate-700/60 p-8 w-full max-w-md transition-colors duration-300'>
          {/* Logo and Brand */}
          <div className='text-center mb-8'>
            <Link to='/' className='flex flex-col items-center justify-center group mb-4'>
              <div className='relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-indigo-500/40 shadow-md shadow-indigo-900/30'>
                <img
                  src='https://exlqvlbawytbglioqfbc.supabase.co/storage/v1/object/public/logo//logo-sabo-arena.png'
                  alt='SABO ARENA'
                  className='w-full h-full object-cover transition-transform group-hover:scale-105'
                />
              </div>
            </Link>
            <h1 className='text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2'>
              TẠO TÀI KHOẢN
            </h1>
            <p className='text-slate-600 dark:text-slate-400'>Tạo tài khoản miễn phí</p>
          </div>

          {referralCode && (
            <Alert className='mb-6 border-emerald-200 bg-emerald-50 dark:border-emerald-700/50 dark:bg-emerald-900/20'>
              <Gift className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
              <AlertDescription className='text-emerald-800 dark:text-emerald-300'>
                <strong>Chúc mừng!</strong> Bạn được giới thiệu bởi mã:{' '}
                <strong>{referralCode}</strong>
                <br />
                Bạn sẽ nhận được 100 SPA khi đăng ký thành công!
              </AlertDescription>
            </Alert>
          )}

          {/* <div className='space-y-3'>
            <FacebookLoginButton />
            <GoogleLoginButton />
          </div> */}
          {/* <OAuthSetupGuide /> */}
          {/* <AuthDivider /> */}

          <EnhancedAuthTabs defaultTab='phone'>
            <PhoneTabContent>
              <form onSubmit={handlePhoneSubmit} className='space-y-4'>
                <Input
                  type='text'
                  value={phoneFullName}
                  onChange={e => setPhoneFullName(e.target.value)}
                  placeholder='Họ và tên'
                  className='w-full h-12 text-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl transition-colors'
                  required
                  disabled={loading}
                />
                <Input
                  type='tel'
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder='0961167717'
                  className='w-full h-12 text-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl transition-colors'
                  required
                  disabled={loading}
                  maxLength={10}
                  inputMode='numeric'
                />
                <Input
                  type='password'
                  value={phonePassword}
                  onChange={e => setPhonePassword(e.target.value)}
                  placeholder='Mật khẩu (ít nhất 6 ký tự)'
                  className='w-full h-12 text-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl transition-colors'
                  required
                  disabled={loading}
                />
                <Input
                  type='password'
                  value={phoneConfirmPassword}
                  onChange={e => setPhoneConfirmPassword(e.target.value)}
                  placeholder='Xác nhận mật khẩu'
                  className='w-full h-12 text-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl transition-colors'
                  required
                  disabled={loading}
                />
                <TermsCheckbox
                  checked={phoneTermsAccepted}
                  onCheckedChange={setPhoneTermsAccepted}
                  disabled={loading}
                />
                <div className='group relative inline-flex rounded-xl p-[1px] bg-gradient-to-r from-indigo-500 via-sky-500 to-fuchsia-500 shadow-lg shadow-indigo-900/40 hover:shadow-indigo-800/60 transition-shadow w-full'>
                  <Button
                    type='submit'
                    disabled={loading || !phoneTermsAccepted}
                    className='w-full h-12 text-lg rounded-[11px] border-transparent bg-white/60 backdrop-blur hover:bg-white/70 text-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-900/70 dark:text-slate-200 font-semibold relative overflow-hidden transition-colors disabled:opacity-50'
                  >
                    <span className='absolute inset-0 opacity-0 group-hover:opacity-10 bg-[radial-gradient(circle_at_30%_30%,white,transparent_60%)] transition-opacity'></span>
                    <span className='relative'>{loading ? 'Đang đăng ký...' : 'Đăng ký'}</span>
                  </Button>
                </div>
              </form>
            </PhoneTabContent>

            <EmailTabContent>
              <form onSubmit={handleEmailSubmit} className='space-y-4'>
                <Input
                  type='text'
                  value={emailFullName}
                  onChange={e => setEmailFullName(e.target.value)}
                  placeholder='Họ và tên'
                  className='w-full h-12 text-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl transition-colors'
                  required
                  disabled={loading}
                />
                <Input
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder='Email'
                  className='w-full h-12 text-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl transition-colors'
                  required
                  disabled={loading}
                />
                <Input
                  type='password'
                  value={emailPassword}
                  onChange={e => setEmailPassword(e.target.value)}
                  placeholder='Mật khẩu (ít nhất 6 ký tự)'
                  className='w-full h-12 text-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl transition-colors'
                  required
                  disabled={loading}
                />
                <Input
                  type='password'
                  value={emailConfirmPassword}
                  onChange={e => setEmailConfirmPassword(e.target.value)}
                  placeholder='Xác nhận mật khẩu'
                  className='w-full h-12 text-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl transition-colors'
                  required
                  disabled={loading}
                />
                <TermsCheckbox
                  checked={emailTermsAccepted}
                  onCheckedChange={setEmailTermsAccepted}
                  disabled={loading}
                />
                <div className='group relative inline-flex rounded-xl p-[1px] bg-gradient-to-r from-indigo-500 via-sky-500 to-fuchsia-500 shadow-lg shadow-indigo-900/40 hover:shadow-indigo-800/60 transition-shadow w-full'>
                  <Button
                    type='submit'
                    disabled={loading || !emailTermsAccepted}
                    className='w-full h-12 text-lg rounded-[11px] border-transparent bg-white/60 backdrop-blur hover:bg-white/70 text-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-900/70 dark:text-slate-200 font-semibold relative overflow-hidden transition-colors disabled:opacity-50'
                  >
                    <span className='absolute inset-0 opacity-0 group-hover:opacity-10 bg-[radial-gradient(circle_at_30%_30%,white,transparent_60%)] transition-opacity'></span>
                    <span className='relative'>{loading ? 'Đang đăng ký...' : 'Đăng ký'}</span>
                  </Button>
                </div>
              </form>
            </EmailTabContent>
          </EnhancedAuthTabs>

          <div className='text-center mt-6 space-y-4'>
            <div className='text-slate-600 dark:text-slate-400 text-sm'>
              Đã có tài khoản?{' '}
              <Link
                to='/auth/login'
                className='text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors'
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnhancedRegisterPage;
