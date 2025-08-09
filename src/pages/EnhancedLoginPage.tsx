import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { OAuthSetupGuide } from '@/components/auth/OAuthSetupGuide';
import { handleAuthError } from '@/utils/authHelpers';
import { supabase } from '@/integrations/supabase/client';
import { Moon, Sun, ArrowLeft } from 'lucide-react';

const EnhancedLoginPage = () => {
  // Phone login state
  const [phone, setPhone] = useState('');
  const [phonePassword, setPhonePassword] = useState('');

  // Email login state
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const {
    signInWithPhone,
    signInWithEmail,
    user,
    loading: authLoading,
  } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const [effectiveRedirect, setEffectiveRedirect] = useState<string | null>(null);

  useEffect(() => {
    if (!effectiveRedirect) {
      if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//') && !redirectParam.startsWith('/auth')) {
        setEffectiveRedirect(redirectParam);
      }
    }
  }, [redirectParam, effectiveRedirect]);

  useEffect(() => {
    const performRoleRedirect = async () => {
      if (!user || authLoading) return;
      try {
        if (effectiveRedirect) {
          navigate(effectiveRedirect, { replace: true });
          return;
        }
        const sb: any = supabase;
        const ownerResult = await sb
          .from('club_members')
          .select('club_id')
          .eq('user_id', user.id)
            .eq('role', 'owner')
          .eq('status', 'active')
          .limit(1);
        const ownerMembership = ownerResult?.data as any[] | null;
        if (ownerMembership && ownerMembership.length > 0) {
          navigate('/club-management', { replace: true });
          return;
        }
        const clubResult = await sb
          .from('club_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        const clubProfile = clubResult?.data as any | null;
        navigate(clubProfile ? '/club-management' : '/dashboard', { replace: true });
      } catch (e) {
        console.warn('Post-login redirect logic failed, fallback to dashboard:', e);
        navigate('/dashboard', { replace: true });
      }
    };
    performRoleRedirect();
  }, [user, authLoading, navigate, effectiveRedirect]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !phonePassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    // Validate phone format
    if (!/^0\d{9}$/.test(phone)) {
      toast.error('Số điện thoại phải có định dạng 0xxxxxxxxx');
      return;
    }

    setLoading(true);

    try {
      const { error, data } = await signInWithPhone(phone, phonePassword);

      if (error) {
        handleAuthError(error);
      } else {
        toast.success('Đăng nhập thành công!');
        // Immediate redirect based on freshly returned user if available
        const uid = data?.user?.id;
        if (uid) {
          try {
            // Use any to avoid deep generic instantiation issues
            const sb: any = supabase;
            const ownerResult = await sb
              .from('club_members')
              .select('club_id')
              .eq('user_id', uid)
              .eq('role', 'owner')
              .eq('status', 'active')
              .limit(1);
            const ownerMembership = ownerResult?.data as any[] | null;
            if (effectiveRedirect) {
              navigate(effectiveRedirect, { replace: true });
            } else if (ownerMembership && ownerMembership.length > 0) {
              navigate('/club-management', { replace: true });
            } else {
              const clubResult = await sb
                .from('club_profiles')
                .select('id')
                .eq('user_id', uid)
                .maybeSingle();
              const clubProfile = clubResult?.data as any | null;
              navigate(clubProfile ? '/club-management' : '/dashboard', { replace: true });
            }
          } catch {
            navigate('/dashboard', { replace: true });
          }
        } else {
          // Fallback – effect will handle once context updates
        }
      }
    } catch (error) {
      console.error('Phone login error:', error);
      toast.error('Có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !emailPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Email không hợp lệ');
      return;
    }

    setLoading(true);

    try {
      const { error, data } = await signInWithEmail(email, emailPassword);

      if (error) {
        handleAuthError(error);
      } else {
        toast.success('Đăng nhập thành công!');
        const uid = data?.user?.id;
        if (uid) {
          try {
            const sb: any = supabase;
            const ownerResult = await sb
              .from('club_members')
              .select('club_id')
              .eq('user_id', uid)
              .eq('role', 'owner')
              .eq('status', 'active')
              .limit(1);
            const ownerMembership = ownerResult?.data as any[] | null;
            if (effectiveRedirect) {
              navigate(effectiveRedirect, { replace: true });
            } else if (ownerMembership && ownerMembership.length > 0) {
              navigate('/club-management', { replace: true });
            } else {
              const clubResult = await sb
                .from('club_profiles')
                .select('id')
                .eq('user_id', uid)
                .maybeSingle();
              const clubProfile = clubResult?.data as any | null;
              navigate(clubProfile ? '/club-management' : '/dashboard', { replace: true });
            }
          } catch {
            navigate('/dashboard', { replace: true });
          }
        }
      }
    } catch (error) {
      console.error('Email login error:', error);
      toast.error('Có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  // Show loading if auth is still initializing
  if (authLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center transition-colors duration-300'>
        <div className='text-center text-slate-800 dark:text-slate-50'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4'></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Đăng nhập - SABO ARENA</title>
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
              ĐĂNG NHẬP
            </h1>
            <p className='text-slate-600 dark:text-slate-400'>Chào mừng bạn trở lại!</p>
          </div>

          {/* Social Login Buttons */}
          {/* <div className='space-y-3'>
            <FacebookLoginButton />
            <GoogleLoginButton />
          </div> */}

          {/* <OAuthSetupGuide /> */}

          {/* <AuthDivider /> */}

          {/* Phone/Email Tabs */}
          <EnhancedAuthTabs defaultTab='phone'>
            <PhoneTabContent>
              <form onSubmit={handlePhoneSubmit} className='space-y-4'>
                <div>
                  <label className='block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2'>
                    Số điện thoại
                  </label>
                  <Input
                    type='tel'
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder='0987654321'
                    className='w-full h-12 text-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl transition-colors'
                    required
                    disabled={loading}
                    maxLength={10}
                    inputMode='numeric'
                  />
                </div>

                <div>
                  <label className='block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2'>
                    Mật khẩu
                  </label>
                  <Input
                    type='password'
                    value={phonePassword}
                    onChange={e => setPhonePassword(e.target.value)}
                    placeholder='Nhập mật khẩu'
                    className='w-full h-12 text-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl transition-colors'
                    required
                    disabled={loading}
                  />
                </div>

                <div className='group relative inline-flex rounded-xl p-[1px] bg-gradient-to-r from-indigo-500 via-sky-500 to-fuchsia-500 shadow-lg shadow-indigo-900/40 hover:shadow-indigo-800/60 transition-shadow w-full'>
                  <Button
                    type='submit'
                    disabled={loading}
                    className='w-full h-12 text-lg rounded-[11px] border-transparent bg-white/60 backdrop-blur hover:bg-white/70 text-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-900/70 dark:text-slate-200 font-semibold relative overflow-hidden transition-colors disabled:opacity-50'
                  >
                    <span className='absolute inset-0 opacity-0 group-hover:opacity-10 bg-[radial-gradient(circle_at_30%_30%,white,transparent_60%)] transition-opacity'></span>
                    <span className='relative'>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
                  </Button>
                </div>
              </form>
            </PhoneTabContent>

            <EmailTabContent>
              <form onSubmit={handleEmailSubmit} className='space-y-4'>
                <div>
                  <label className='block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2'>
                    Email
                  </label>
                  <Input
                    type='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder='example@email.com'
                    className='w-full h-12 text-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl transition-colors'
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className='block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2'>
                    Mật khẩu
                  </label>
                  <Input
                    type='password'
                    value={emailPassword}
                    onChange={e => setEmailPassword(e.target.value)}
                    placeholder='Nhập mật khẩu'
                    className='w-full h-12 text-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl transition-colors'
                    required
                    disabled={loading}
                  />
                </div>

                <div className='group relative inline-flex rounded-xl p-[1px] bg-gradient-to-r from-indigo-500 via-sky-500 to-fuchsia-500 shadow-lg shadow-indigo-900/40 hover:shadow-indigo-800/60 transition-shadow w-full'>
                  <Button
                    type='submit'
                    disabled={loading}
                    className='w-full h-12 text-lg rounded-[11px] border-transparent bg-white/60 backdrop-blur hover:bg-white/70 text-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-900/70 dark:text-slate-200 font-semibold relative overflow-hidden transition-colors disabled:opacity-50'
                  >
                    <span className='absolute inset-0 opacity-0 group-hover:opacity-10 bg-[radial-gradient(circle_at_30%_30%,white,transparent_60%)] transition-opacity'></span>
                    <span className='relative'>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
                  </Button>
                </div>
              </form>
            </EmailTabContent>
          </EnhancedAuthTabs>

          <div className='text-center mt-6 space-y-4'>
            <Link
              to='/auth/forgot-password'
              className='text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium transition-colors'
            >
              Quên mật khẩu?
            </Link>

            <div className='text-slate-600 dark:text-slate-400 text-sm'>
              Chưa có tài khoản?{' '}
              <Link
                to='/auth/register'
                className='text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors'
              >
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnhancedLoginPage;
