import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gift, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LegacyGiftCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  playerNickName: string;
}

export function LegacyGiftCodeModal({ 
  isOpen, 
  onClose, 
  playerName, 
  playerNickName 
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

      // Find legacy entry by claim code
      const { data: legacyEntry, error: findError } = await supabase
        .from('legacy_spa_points')
        .select('*')
        .eq('claim_code', claimCode.trim().toUpperCase())
        .single();

      if (findError || !legacyEntry) {
        setResult({
          success: false,
          message: 'Mã claim không tồn tại hoặc không hợp lệ'
        });
        toast.error('Mã claim không tồn tại hoặc không hợp lệ');
        return;
      }

      // Check if already claimed
      if (legacyEntry.claimed) {
        setResult({
          success: false,
          message: `Mã này đã được claim bởi user khác`
        });
        toast.error('Mã này đã được sử dụng');
        return;
      }

      // Start transaction: claim the legacy entry and award SPA points
      const { error: claimError } = await supabase.rpc('claim_legacy_spa_points', {
        p_user_id: user.id,
        p_claim_code: claimCode.trim().toUpperCase(),
        p_user_email: user.email
      });

      if (claimError) {
        console.error('Error claiming legacy SPA:', claimError);
        setResult({
          success: false,
          message: 'Có lỗi xảy ra khi claim mã. Vui lòng thử lại.'
        });
        toast.error('Có lỗi xảy ra khi claim mã');
        return;
      }

      // Success
      setResult({
        success: true,
        message: `Thành công! Bạn đã nhận được ${legacyEntry.spa_points} điểm SPA từ legacy player "${legacyEntry.full_name}"`,
        points: legacyEntry.spa_points
      });
      toast.success(`Claim thành công! +${legacyEntry.spa_points} điểm SPA`);
      setClaimCode('');

      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
        setResult(null);
      }, 3000);

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
    setClaimCode('');
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-yellow-600" />
            Claim Legacy SPA Points
          </DialogTitle>
          <DialogDescription>
            Nhập mã claim để nhận điểm SPA từ legacy player <strong>{playerName}</strong>
            {playerNickName && ` (${playerNickName})`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="claimCode">Mã Claim Legacy</Label>
            <div className="flex gap-2">
              <Input
                id="claimCode"
                placeholder="VD: LEGACY-01-VIN"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 font-mono"
              />
              <Button 
                onClick={handleClaimCode}
                disabled={isLoading || !claimCode.trim()}
                className="min-w-[80px]"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
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
            <strong>Hướng dẫn:</strong>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Nhập chính xác mã claim mà bạn nhận được</li>
              <li>Mã có định dạng: LEGACY-XX-ABC (VD: LEGACY-01-VIN)</li>
              <li>Mỗi mã chỉ có thể sử dụng một lần</li>
              <li>Điểm SPA sẽ được cộng ngay vào tài khoản</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
