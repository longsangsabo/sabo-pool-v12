import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

const PaymentResultPage = () => {
 const [searchParams] = useSearchParams();
 const navigate = useNavigate();
 const [countdown, setCountdown] = useState(10);

 const status = searchParams.get('status');
 const transactionRef = searchParams.get('ref');

 useEffect(() => {
  const timer = setInterval(() => {
   setCountdown(prev => {
    if (prev <= 1) {
     clearInterval(timer);
     navigate('/dashboard/membership');
     return 0;
    }
    return prev - 1;
   });
  }, 1000);

  return () => clearInterval(timer);
 }, []);

 const getStatusConfig = () => {
  switch (status) {
   case 'success':
    return {
     icon: <CheckCircle className='h-16 w-16 text-green-500' />,
     title: 'Thanh toán thành công!',
     message:
      'Tài khoản của bạn đã được nâng cấp lên Premium. Bạn có thể sử dụng tất cả tính năng cao cấp ngay bây giờ.',
     color: 'text-success-600',
    };
   case 'failed':
    return {
     icon: <XCircle className='h-16 w-16 text-red-500' />,
     title: 'Thanh toán thất bại',
     message:
      'Giao dịch không thể hoàn tất. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề tiếp tục xảy ra.',
     color: 'text-error-600',
    };
   default:
    return {
     icon: <AlertTriangle className='h-16 w-16 text-yellow-500' />,
     title: 'Có lỗi xảy ra',
     message:
      'Không thể xác định trạng thái thanh toán. Vui lòng kiểm tra lại trong tài khoản của bạn.',
     color: 'text-warning-600',
    };
  }
 };

 const statusConfig = getStatusConfig();

 return (
  <div className='min-h-screen bg-neutral-50 flex items-center justify-center p-4'>
   <SEOHead
    title='Kết quả thanh toán'
    description='Kết quả thanh toán nâng cấp Premium'
   />

   <Card className='w-full max-w-md'>
    <CardHeader className='text-center'>
     <div className='flex justify-center mb-4'>{statusConfig.icon}</div>
     <CardTitle className={`text-heading ${statusConfig.color}`}>
      {statusConfig.title}
     </CardTitle>
    </CardHeader>
    <CardContent className='space-y-4 text-center'>
     <p className='text-neutral-600'>{statusConfig.message}</p>

     {transactionRef && (
      <div className='bg-neutral-100 p-3 rounded-lg'>
       <p className='text-body-small text-neutral-500'>Mã giao dịch:</p>
       <p className='font-mono text-sm'>{transactionRef}</p>
      </div>
     )}

     <div className='space-y-2'>
      <p className='text-body-small text-neutral-500'>
       Tự động chuyển hướng sau {countdown} giây
      </p>
      <div className='flex gap-2 justify-center'>
       <Button asChild>
        <Link to='/dashboard/membership'>Quản lý gói hội viên</Link>
       </Button>
       <Button variant='outline' asChild>
        <Link to='/dashboard'>Về trang chủ</Link>
       </Button>
      </div>
     </div>
    </CardContent>
   </Card>
  </div>
 );
};

export default PaymentResultPage;
