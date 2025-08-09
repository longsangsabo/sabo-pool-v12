import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { maskPhone } from '@/utils/phone';

interface PhoneOtpDialogProps {
  isOpen: boolean;
  phone: string;
  onClose: () => void;
  onVerify: (code: string) => Promise<void> | void;
  onResend?: () => Promise<void> | void;
}

export const PhoneOtpDialog: React.FC<PhoneOtpDialogProps> = ({
  isOpen,
  phone,
  onClose,
  onVerify,
  onResend,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (!isOpen) {
      setCountdown(60);
      setCanResend(false);
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
  }, [isOpen]);

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

  const handleResend = async () => {
    if (!onResend || !canResend) return;
    
    setResendLoading(true);
    try {
      await onResend();
      setCountdown(60);
      setCanResend(false);
      setCode('');
    } finally {
      setResendLoading(false);
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

          {/* Resend section */}
          <div className="text-center text-sm text-muted-foreground">
            {canResend ? (
              onResend ? (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm"
                  onClick={handleResend}
                  disabled={resendLoading}
                >
                  {resendLoading ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                </Button>
              ) : (
                <span>Không thể gửi lại mã</span>
              )
            ) : (
              <span>Gửi lại mã sau {countdown}s</span>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={loading || resendLoading}>
              Hủy
            </Button>
            <Button onClick={handleVerify} disabled={loading || resendLoading || code.length < 6}>
              {loading ? 'Đang xác minh...' : 'Xác minh'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
