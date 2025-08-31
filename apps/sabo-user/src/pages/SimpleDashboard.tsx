
import CheckInWidget from '@/components/CheckInWidget';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const SimpleDashboard = () => {
 const { user } = useAuth();
 console.log('SimpleDashboard: Component is rendering');

 return (
  <>
   <Helmet>
    <title>SABO Pool Arena - Trang chủ</title>
    <meta
     name='description'
     content='Hệ thống quản lý và đặt bàn billiards chuyên nghiệp'
    />
   </Helmet>

   <div className='min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900'>
    {/* Header đơn giản */}
    <header className='bg-green-800 border-b border-green-700'>
     <div className='container mx-auto px-4 py-4'>
      <div className='flex items-center justify-between'>
       <div className='flex items-center space-x-3'>
        <div className='w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center'>
         <span className='text-2xl'>🎱</span>
        </div>
        <div>
         <h1 className='text-title font-bold text-yellow-400'>
          SABO Pool Arena
         </h1>
         <p className='text-success-200 text-sm'>
          Chào mừng bạn đến với trang chủ
         </p>
        </div>
       </div>
       <nav className='flex space-x-4'>
        <Link to='/login'>
         <Button
          variant='outline'
          className='text-var(--color-background) border-var(--color-background) hover:bg-var(--color-background) hover:text-green-900'
         >
          Đăng nhập
         </Button>
        </Link>
        <Link to='/register'>
         <Button className='bg-yellow-400 text-green-900 hover:bg-warning-500'>
          Đăng ký
         </Button>
        </Link>
       </nav>
      </div>
     </div>
    </header>

    {/* Nội dung chính */}
    <main className='container mx-auto px-4 py-16'>
     <div className='text-center mb-12'>
      <h2 className='text-4xl md:text-6xl font-bold text-var(--color-background) mb-6'>
       Chào Mừng Đến SABO Pool Arena
      </h2>
      <p className='text-title text-success-200 mb-8 max-w-2xl mx-auto'>
       Hệ thống quản lý và đặt bàn bi-a hiện đại, chuyên nghiệp
      </p>

      <div className='flex flex-col sm:flex-row gap-4 justify-center mb-12'>
       <Link to='/simple-club'>
        <Button
         
         className='bg-yellow-400 text-green-900 hover:bg-warning-500 font-bold px-8 py-4 text-lg'
        >
         🎯 Xem Website CLB
        </Button>
       </Link>
       <Link to='/simple-booking'>
        <Button
         
         variant='outline'
         className='border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-green-900 font-bold px-8 py-4 text-lg'
        >
         📅 Đặt Bàn Ngay
        </Button>
       </Link>
       {user && (
        <Link to='/practice'>
         <Button
          variant='default'
          
         >
          👥 Tìm Bạn Tập
         </Button>
        </Link>
       )}
      </div>

      {/* Check-in Widget for logged in users */}
      {user && (
       <div className='max-w-md mx-auto mb-12'>
        <CheckInWidget />
       </div>
      )}
     </div>

     {/* Các tính năng chính */}
     <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto'>
      <Card className='bg-green-800 border-green-700'>
       <CardHeader className='text-center'>
        <div className='w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4'>
         <span className='text-2xl'>🎱</span>
        </div>
        <CardTitle className='text-var(--color-background)'>Website CLB</CardTitle>
       </CardHeader>
       <CardContent className='text-center'>
        <p className='text-success-200 mb-4'>
         Website đơn giản cho khách hàng xem thông tin và đặt bàn
        </p>
        <Link to='/simple-club'>
         <Button variant='secondary' className='w-full'>
          Truy cập
         </Button>
        </Link>
       </CardContent>
      </Card>

      <Card className='bg-green-800 border-green-700'>
       <CardHeader className='text-center'>
        <div className='w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-4'>
         <span className='text-2xl'>📅</span>
        </div>
        <CardTitle className='text-var(--color-background)'>Đặt Bàn Online</CardTitle>
       </CardHeader>
       <CardContent className='text-center'>
        <p className='text-success-200 mb-4'>
         Đặt bàn bi-a nhanh chóng và tiện lợi
        </p>
        <Link to='/simple-booking'>
         <Button variant='default' className='w-full'>
          Đặt bàn
         </Button>
        </Link>
       </CardContent>
      </Card>

      <Card className='bg-green-800 border-green-700'>
       <CardHeader className='text-center'>
        <div className='w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center mx-auto mb-4'>
         <span className='text-2xl'>👥</span>
        </div>
        <CardTitle className='text-var(--color-background)'>Quản Lý</CardTitle>
       </CardHeader>
       <CardContent className='text-center'>
        <p className='text-success-200 mb-4'>
         Hệ thống quản lý dành cho quản trị viên
        </p>
        <Link to='/login'>
         <Button className='bg-purple-400 text-var(--color-background) hover:bg-info-500 w-full'>
          Đăng nhập
         </Button>
        </Link>
       </CardContent>
      </Card>
     </div>

     {/* Thông tin liên hệ */}
     <div className='mt-16 text-center'>
      <Card className='bg-green-800 border-green-700 max-w-2xl mx-auto'>
       <CardHeader>
        <CardTitle className='text-yellow-400 text-2xl'>
         Thông Tin Liên Hệ
        </CardTitle>
       </CardHeader>
       <CardContent className='space-y-3'>
        <p className='text-var(--color-background)'>📞 Hotline: 0901 234 567</p>
        <p className='text-var(--color-background)'>
         ⏰ Giờ mở cửa: 8:00 - 24:00 hàng ngày
        </p>
        <p className='text-var(--color-background)'>
         📍 Địa chỉ: 123 Đường Nguyễn Huệ, Q.1, TP.HCM
        </p>
        <p className='text-success-200 text-body-small mt-4'>
         Liên hệ với chúng tôi để được hỗ trợ tốt nhất!
        </p>
       </CardContent>
      </Card>
     </div>
    </main>

    {/* Footer đơn giản */}
    <footer className='bg-green-900 border-t border-green-700 py-8 px-4 mt-16'>
     <div className='container mx-auto text-center'>
      <p className='text-green-300 text-sm'>
       © 2024 SABO Pool Arena. Website hoạt động bình thường.
      </p>
      <p className='text-green-400 text-caption mt-2'>
       Trang chủ cơ bản - Đơn giản và dễ sử dụng
      </p>
     </div>
    </footer>
   </div>
  </>
 );
};

export default SimpleDashboard;
