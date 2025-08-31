import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
 Card,
 CardContent,
 CardDescription,
 CardFooter,
 CardHeader,
 CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
 Eye,
 EyeOff,
 Mail,
 Phone,
 AlertTriangle,
 CheckCircle,
 User,
 Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { FacebookLoginButton } from '@/components/auth/FacebookLoginButton';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { handleAuthError } from '@sabo/shared-utils';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';

const AuthPage = () => {
 const [searchParams] = useSearchParams();
 const navigate = useNavigate();
 const {
  user,
  loading: authLoading,
  signInWithPhone,
  signInWithEmail,
  signUpWithPhone,
  signUpWithEmail,
 } = useAuth();

 // Get auth mode from URL params or default to login
 const [mode, setMode] = useState<AuthMode>(() => {
  const modeParam = searchParams.get('mode');
  return (modeParam as AuthMode) || 'login';
 });

 // Common form state
 const [phone, setPhone] = useState('');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [fullName, setFullName] = useState('');
 const [loading, setLoading] = useState(false);
 const [showPassword, setShowPassword] = useState(false);
 const [activeTab, setActiveTab] = useState('phone');

 // Reset password specific state
 const [emailSent, setEmailSent] = useState(false);

 // Redirect if already logged in
 useEffect(() => {
  if (user && !authLoading && mode !== 'reset-password') {
   navigate('/dashboard');
  }
 }, [user, authLoading, navigate, mode]);

 // Update mode when URL changes
 useEffect(() => {
  const modeParam = searchParams.get('mode');
  if (
   modeParam &&
   ['login', 'register', 'forgot-password', 'reset-password'].includes(
    modeParam
   )
  ) {
   setMode(modeParam as AuthMode);
  }
 }, [searchParams]);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (mode === 'forgot-password') {
   await handleForgotPassword();
   return;
  }

  if (mode === 'reset-password') {
   await handleResetPassword();
   return;
  }

  const isPhone = activeTab === 'phone';
  const identifier = isPhone ? phone : email;

  if (!identifier || !password) {
   toast.error('Vui lòng nhập đầy đủ thông tin');
   return;
  }

  if (mode === 'register') {
   if (!fullName) {
    toast.error('Vui lòng nhập họ tên');
    return;
   }
   if (password !== confirmPassword) {
    toast.error('Mật khẩu xác nhận không khớp');
    return;
   }
   if (password.length < 6) {
    toast.error('Mật khẩu phải có ít nhất 6 ký tự');
    return;
   }
  }

  // Validate format
  if (isPhone && !/^0\d{9}$/.test(phone)) {
   toast.error('Số điện thoại phải có 10 số và bắt đầu bằng 0');
   return;
  }

  if (!isPhone && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
   toast.error('Email không hợp lệ');
   return;
  }

  setLoading(true);

  try {
   let result;

   if (mode === 'login') {
    result = isPhone
     ? await signInWithPhone(phone, password)
     : await signInWithEmail(email, password);
   } else {
    result = isPhone
     ? await signUpWithPhone(phone, password, fullName)
     : await signUpWithEmail(email, password, fullName);
   }

   if (result.error) {
    handleAuthError(result.error);
   } else {
    const successMessage =
     mode === 'login' ? 'Đăng nhập thành công!' : 'Đăng ký thành công!';
    toast.success(successMessage);
    navigate('/dashboard');
   }
  } catch (error) {
   console.error('Auth error:', error);
   toast.error('Có lỗi xảy ra');
  } finally {
   setLoading(false);
  }
 };

 const handleForgotPassword = async () => {
  if (!email) {
   toast.error('Vui lòng nhập email');
   return;
  }

  setLoading(true);
  // TODO: Implement actual forgot password logic
  setTimeout(() => {
   toast.success('Email khôi phục mật khẩu đã được gửi!');
   setEmailSent(true);
   setLoading(false);
  }, 1500);
 };

 const handleResetPassword = async () => {
  if (!password || !confirmPassword) {
   toast.error('Vui lòng nhập đầy đủ thông tin');
   return;
  }

  if (password !== confirmPassword) {
   toast.error('Mật khẩu xác nhận không khớp');
   return;
  }

  if (password.length < 6) {
   toast.error('Mật khẩu phải có ít nhất 6 ký tự');
   return;
  }

  setLoading(true);
  // TODO: Implement actual reset password logic
  setTimeout(() => {
   toast.success('Mật khẩu đã được cập nhật thành công!');
   navigate('/auth/login');
   setLoading(false);
  }, 1500);
 };

 const getPageTitle = () => {
  switch (mode) {
   case 'register':
    return 'Đăng ký';
   case 'forgot-password':
    return 'Quên mật khẩu';
   case 'reset-password':
    return 'Đặt lại mật khẩu';
   default:
    return 'Đăng nhập';
  }
 };

 const getPageIcon = () => {
  switch (mode) {
   case 'register':
    return <User className='h-6 w-6' />;
   case 'forgot-password':
    return <Mail className='h-6 w-6' />;
   case 'reset-password':
    return <Shield className='h-6 w-6' />;
   default:
    return '🎱';
  }
 };

 // Show loading if auth is still initializing
 if (authLoading) {
  return (
   <div className='min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center'>
    <div className='text-center'>
     <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
     <p className='text-muted-foreground'>Đang tải...</p>
    </div>
   </div>
  );
 }

 // Special UI for forgot password success
 if (mode === 'forgot-password' && emailSent) {
  return (
   <>
    <div className='min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4'>
     <Card className='w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur-sm text-center'>
      <CardHeader className='space-y-4'>
       <div className='mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-2xl'>
        📧
       </div>
       <CardTitle className='text-heading-bold text-success-600'>
        Email đã được gửi!
       </CardTitle>
       <CardDescription>
        Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email của bạn.
       </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
       <Button
        onClick={() => navigate('/auth/login')}
        className='w-full'
       >
        Về trang đăng nhập
       </Button>
       <button
        onClick={() => setEmailSent(false)}
        className='text-body-small text-muted-foreground hover:text-foreground'
       >
        Gửi lại email
       </button>
      </CardContent>
     </Card>
    </div>
   </>
  );
 }

 return (
  <>
   <div className='min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4'>
    <Card className='w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur-sm'>
     <CardHeader className='text-center space-y-4'>
      <div className='mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-2xl'>
       {getPageIcon()}
      </div>
      <div>
       <CardTitle className='text-heading-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
        {getPageTitle()}
       </CardTitle>
       <CardDescription className='text-muted-foreground'>
        SABO ARENA - Cộng đồng Billiards #1 Việt Nam
       </CardDescription>
      </div>
     </CardHeader>

     <CardContent className='space-y-6'>
      {/* Social Login - only for login/register */}
      {(mode === 'login' || mode === 'register') && (
       <>
        <div className='space-y-3'>
         <GoogleLoginButton />
         <FacebookLoginButton />
        </div>

        <div className='relative'>
         <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t border-border' />
         </div>
         <div className='relative flex justify-center text-caption uppercase'>
          <span className='bg-card px-2 text-muted-foreground'>
           Hoặc
          </span>
         </div>
        </div>
       </>
      )}

      {/* Forgot Password Form */}
      {mode === 'forgot-password' && (
       <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
         <Label htmlFor='email'>Email</Label>
         <Input
          id='email'
          type='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder='Nhập email đã đăng ký'
          className='h-11'
          required
          disabled={loading}
         />
        </div>
        <Button
         type='submit'
         disabled={loading}
         className='w-full h-11'
        >
         {loading ? 'Đang gửi...' : 'Gửi email khôi phục'}
        </button>
       </form>
      )}

      {/* Reset Password Form */}
      {mode === 'reset-password' && (
       <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
         <Label htmlFor='newPassword'>Mật khẩu mới</Label>
         <div className='relative'>
          <Input
           id='newPassword'
           type={showPassword ? 'text' : 'password'}
           value={password}
           onChange={e => setPassword(e.target.value)}
           placeholder='Nhập mật khẩu mới'
           className='h-11 pr-12'
           required
           disabled={loading}
          />
          <button
           type='button'
           onClick={() => setShowPassword(!showPassword)}
           className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
          >
           {showPassword ? (
            <EyeOff className='h-4 w-4' />
           ) : (
            <Eye className='h-4 w-4' />
           )}
          </button>
         </div>
        </div>
        <div className='space-y-2'>
         <Label htmlFor='confirmNewPassword'>Xác nhận mật khẩu</Label>
         <Input
          id='confirmNewPassword'
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder='Nhập lại mật khẩu mới'
          className='h-11'
          required
          disabled={loading}
         />
        </div>
        <Button
         type='submit'
         disabled={loading}
         className='w-full h-11'
        >
         {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
        </button>
       </form>
      )}

      {/* Login/Register Forms */}
      {(mode === 'login' || mode === 'register') && (
       <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='w-full'
       >
        <TabsList className='grid w-full grid-cols-2'>
         <TabsTrigger
          value='phone'
          className='flex items-center gap-2'
         >
          <Phone className='h-4 w-4' />
          SĐT
         </TabsTrigger>
         <TabsTrigger
          value='email'
          className='flex items-center gap-2'
         >
          <Mail className='h-4 w-4' />
          Email
         </TabsTrigger>
        </TabsList>

        <TabsContent value='phone' className='space-y-4'>
         <Alert className='border-success-200 bg-success-50 text-success-800'>
          <CheckCircle className='h-4 w-4' />
          <AlertDescription>
           {mode === 'register'
            ? 'Đăng ký bằng số điện thoại Việt Nam (10 chữ số, VD: 0961167717)'
            : 'Sử dụng số điện thoại Việt Nam (10 chữ số, VD: 0961167717) để đăng nhập nhanh chóng'}
          </AlertDescription>
         </Alert>

         <form onSubmit={handleSubmit} className='space-y-4'>
          {mode === 'register' && (
           <div className='space-y-2'>
            <Label htmlFor='fullName'>Họ và tên</Label>
            <Input
             id='fullName'
             type='text'
             value={fullName}
             onChange={e => setFullName(e.target.value)}
             placeholder='Nguyễn Văn A'
             className='h-11'
             required
             disabled={loading}
            />
           </div>
          )}

          <div className='space-y-2'>
           <Label htmlFor='phone'>Số điện thoại</Label>
           <Input
            id='phone'
            type='tel'
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder='0961167717'
            className='h-11'
            required
            disabled={loading}
            maxLength={10}
            inputMode='numeric'
           />
          </div>

          <div className='space-y-2'>
           <Label htmlFor='phonePassword'>Mật khẩu</Label>
           <div className='relative'>
            <Input
             id='phonePassword'
             type={showPassword ? 'text' : 'password'}
             value={password}
             onChange={e => setPassword(e.target.value)}
             placeholder={
              mode === 'register'
               ? 'Tạo mật khẩu (tối thiểu 6 ký tự)'
               : 'Nhập mật khẩu'
             }
             className='h-11 pr-12'
             required
             disabled={loading}
            />
            <button
             type='button'
             onClick={() => setShowPassword(!showPassword)}
             className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
            >
             {showPassword ? (
              <EyeOff className='h-4 w-4' />
             ) : (
              <Eye className='h-4 w-4' />
             )}
            </button>
           </div>
          </div>

          {mode === 'register' && (
           <div className='space-y-2'>
            <Label htmlFor='confirmPhonePassword'>
             Xác nhận mật khẩu
            </Label>
            <Input
             id='confirmPhonePassword'
             type={showPassword ? 'text' : 'password'}
             value={confirmPassword}
             onChange={e => setConfirmPassword(e.target.value)}
             placeholder='Nhập lại mật khẩu'
             className='h-11'
             required
             disabled={loading}
            />
           </div>
          )}

          <Button
           type='submit'
           disabled={loading}
           className='w-full h-11 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
          >
           {loading ? (
            <div className='flex items-center gap-2'>
             <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
             {mode === 'register'
              ? 'Đang đăng ký...'
              : 'Đang đăng nhập...'}
            </div>
           ) : mode === 'register' ? (
            'Đăng ký với SĐT'
           ) : (
            'Đăng nhập với SĐT'
           )}
          </button>
         </form>
        </TabsContent>

        <TabsContent value='email' className='space-y-4'>
         <Alert className='border-primary-200 bg-primary-50 text-primary-800'>
          <CheckCircle className='h-4 w-4' />
          <AlertDescription>
           {mode === 'register'
            ? 'Đăng ký bằng email. Kiểm tra email để xác thực sau khi đăng ký.'
            : 'Email đăng ký đã hoạt động! Kiểm tra email để xác thực sau khi đăng ký.'}
          </AlertDescription>
         </Alert>

         <form onSubmit={handleSubmit} className='space-y-4'>
          {mode === 'register' && (
           <div className='space-y-2'>
            <Label htmlFor='fullNameEmail'>Họ và tên</Label>
            <Input
             id='fullNameEmail'
             type='text'
             value={fullName}
             onChange={e => setFullName(e.target.value)}
             placeholder='Nguyễn Văn A'
             className='h-11'
             required
             disabled={loading}
            />
           </div>
          )}

          <div className='space-y-2'>
           <Label htmlFor='email'>Email</Label>
           <Input
            id='email'
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder='example@email.com'
            className='h-11'
            required
            disabled={loading}
           />
          </div>

          <div className='space-y-2'>
           <Label htmlFor='emailPassword'>Mật khẩu</Label>
           <div className='relative'>
            <Input
             id='emailPassword'
             type={showPassword ? 'text' : 'password'}
             value={password}
             onChange={e => setPassword(e.target.value)}
             placeholder={
              mode === 'register'
               ? 'Tạo mật khẩu (tối thiểu 6 ký tự)'
               : 'Nhập mật khẩu'
             }
             className='h-11 pr-12'
             required
             disabled={loading}
            />
            <button
             type='button'
             onClick={() => setShowPassword(!showPassword)}
             className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
            >
             {showPassword ? (
              <EyeOff className='h-4 w-4' />
             ) : (
              <Eye className='h-4 w-4' />
             )}
            </button>
           </div>
          </div>

          {mode === 'register' && (
           <div className='space-y-2'>
            <Label htmlFor='confirmEmailPassword'>
             Xác nhận mật khẩu
            </Label>
            <Input
             id='confirmEmailPassword'
             type={showPassword ? 'text' : 'password'}
             value={confirmPassword}
             onChange={e => setConfirmPassword(e.target.value)}
             placeholder='Nhập lại mật khẩu'
             className='h-11'
             required
             disabled={loading}
            />
           </div>
          )}

          <Button
           type='submit'
           disabled={loading}
           className='w-full h-11 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
          >
           {loading ? (
            <div className='flex items-center gap-2'>
             <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
             {mode === 'register'
              ? 'Đang đăng ký...'
              : 'Đang đăng nhập...'}
            </div>
           ) : mode === 'register' ? (
            'Đăng ký với Email'
           ) : (
            'Đăng nhập với Email'
           )}
          </button>
         </form>
        </TabsContent>
       </Tabs>
      )}
     </CardContent>

     <CardFooter className='flex flex-col space-y-4 text-center'>
      {/* Mode-specific footer links */}
      {mode === 'login' && (
       <>
        <button
         onClick={() => navigate('/auth/forgot-password')}
         className='text-body-small text-primary hover:text-primary/80 transition-colors'
        >
         Quên mật khẩu?
        </button>

        <div className='text-body-small text-muted-foreground'>
         Chưa có tài khoản?{' '}
         <button
          onClick={() => navigate('/auth/register')}
          className='text-primary hover:text-primary/80 font-medium transition-colors'
         >
          Đăng ký ngay
         </button>
        </div>
       </>
      )}

      {mode === 'register' && (
       <div className='text-body-small text-muted-foreground'>
        Đã có tài khoản?{' '}
        <button
         onClick={() => navigate('/auth/login')}
         className='text-primary hover:text-primary/80 font-medium transition-colors'
        >
         Đăng nhập
        </button>
       </div>
      )}

      {(mode === 'forgot-password' || mode === 'reset-password') && (
       <button
        onClick={() => navigate('/auth/login')}
        className='text-body-small text-primary hover:text-primary/80 transition-colors'
       >
        ← Về trang đăng nhập
       </button>
      )}

      <Link
       to='/'
       className='text-body-small text-muted-foreground hover:text-foreground transition-colors'
      >
       ← Về trang chủ
      </Link>
     </CardFooter>
    </Card>
   </div>
  </>
 );
};

export default AuthPage;
