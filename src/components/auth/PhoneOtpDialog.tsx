import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { maskPhone } from '@/utils/phone';

interface PhoneOtpDialogProps {
  isOpen: boolean;
  phone: string;
  onClose: () => void;
  onVerify: (code: string) => Promise<void> | void;
}

export const PhoneOtpDialog: React.FC<PhoneOtpDialogProps> = ({
  isOpen,
  phone,
  onClose,
  onVerify,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length < 6) return;
    setLoading(true);
    try {
      await onVerify(code);
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xác thực OTP</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Mã xác thực đã được gửi tới số {maskPhone(phone)}.
          </p>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button onClick={handleVerify} disabled={loading || code.length < 6}>
              {loading ? 'Đang xác minh...' : 'Xác minh'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
