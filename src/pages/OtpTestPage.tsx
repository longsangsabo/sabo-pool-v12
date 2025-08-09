import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PhoneOtpDialog } from '@/components/auth/PhoneOtpDialog';
import { toast } from 'sonner';

const OtpTestPage = () => {
  const [otpOpen, setOtpOpen] = useState(false);
  const [testPhone] = useState('0961167717');

  const handleShowOtp = () => {
    setOtpOpen(true);
  };

  const handleOtpVerify = async (code: string) => {
    console.log('OTP code entered:', code);
    toast.success(`Mã OTP đã nhập: ${code}`);
    setOtpOpen(false);
  };

  const handleResendOtp = async () => {
    console.log('Resending OTP...');
    toast.success('Mã OTP mới đã được gửi!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Test OTP Dialog</h1>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Test tính năng OTP dialog với countdown timer và resend functionality
            </p>
            
            <Button onClick={handleShowOtp} className="w-full">
              Hiển thị OTP Dialog
            </Button>
          </div>
          
          <div className="text-sm text-gray-500 text-center">
            <p>Số điện thoại test: {testPhone}</p>
            <p>Nhập bất kỳ mã 6 số nào để test</p>
          </div>
        </div>

        <PhoneOtpDialog
          isOpen={otpOpen}
          phone={testPhone}
          onClose={() => setOtpOpen(false)}
          onVerify={handleOtpVerify}
          onResend={handleResendOtp}
        />
      </div>
    </div>
  );
};

export default OtpTestPage;
