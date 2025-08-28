import React from "react";
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LegacyGiftCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  onSuccess: () => void;
}

export function LegacyGiftCodeModal({ 
  isOpen, 
  onClose, 
  playerName, 
  onSuccess 
}: LegacyGiftCodeModalProps) {
  const [claimCode, setClaimCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    points?: number;
  } | null>(null);

  const handleClaimCode = async () => {
    if (!claimCode.trim()) {
      toast.error('Vui lòng nhập mã claim');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setResult({
          success: false,
          message: 'Bạn cần đăng nhập để claim điểm SPA'
        });
        toast.error('Bạn cần đăng nhập để claim điểm SPA');
        return;
      }

      // Call the claim function
      const { data, error } = await supabase.rpc('claim_legacy_spa_points', {
        p_claim_code: claimCode.trim(),
        p_user_id: user.id,
        p_user_email: user.email
      });

      if (error) {
        console.error('Error claiming legacy SPA:', error);
        setResult({
          success: false,
          message: error.message || 'Có lỗi xảy ra khi claim mã'
        });
        toast.error('Có lỗi xảy ra khi claim mã');
        return;
      }

      if (data && data.success) {
        setResult({
          success: true,
          message: `Thành công! Bạn đã nhận được ${data.spa_points} điểm SPA`,
          points: data.spa_points
        });
        toast.success(`Claim thành công! +${data.spa_points} điểm SPA`);
        setClaimCode('');
        
        // Call onSuccess to refresh the leaderboard
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setResult({
          success: false,
          message: data?.message || 'Mã claim không hợp lệ hoặc đã được sử dụng'
        });
        toast.error('Mã claim không hợp lệ hoặc đã được sử dụng');
      }

    } catch (error) {
      console.error('Unexpected error:', error);
      setResult({
        success: false,
        message: 'Có lỗi không mong muốn xảy ra'
      });
      toast.error('Có lỗi không mong muốn xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleClaimCode();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setClaimCode('');
      setResult(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-orange-500" />
            Claim Legacy SPA Points
          </DialogTitle>
          <DialogDescription>
            Nhập mã claim để nhận điểm SPA cho <strong>{playerName}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="claimCode">Mã Claim</Label>
            <div className="flex gap-2">
              <Input
                id="claimCode"
                placeholder="Nhập mã claim của bạn..."
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleClaimCode}
                disabled={isLoading || !claimCode.trim()}
                className="min-w-[80px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Claim'
                )}
              </Button>
            </div>
          </div>

          {result && (
            <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                )}
                <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                  {result.message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <strong>Lưu ý:</strong>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>SABO sẽ gửi CODE cho các Player có tên trong BXH qua Facebook hoặc player có thể chủ động liên hệ với SABO qua thông tin liên hệ để nhận CODE</li>
              <li>Mỗi mã chỉ có thể sử dụng một lần</li>
              <li>Điểm SPA sẽ được cộng ngay vào tài khoản</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
