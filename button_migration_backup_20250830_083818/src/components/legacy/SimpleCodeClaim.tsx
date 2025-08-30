import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SimpleCodeClaimProps {
  className?: string;
}

export function SimpleCodeClaim({ className }: SimpleCodeClaimProps) {
  const [claimCode, setClaimCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastClaimResult, setLastClaimResult] = useState<{
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
    setLastClaimResult(null);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setLastClaimResult({
          success: false,
          message: 'Bạn cần đăng nhập để claim điểm SPA'
        });
        toast.error('Bạn cần đăng nhập để claim điểm SPA');
        return;
      }

      // Check if code exists and is available
      const { data: claimData, error: claimError } = await supabase
        .from('simple_legacy_claims')
        .select('*')
        .eq('claim_code', claimCode.trim())
        .single();

      if (claimError || !claimData) {
        setLastClaimResult({
          success: false,
          message: 'Mã claim không tồn tại hoặc không hợp lệ'
        });
        toast.error('Mã claim không tồn tại hoặc không hợp lệ');
        return;
      }

      // Check if already claimed
      if (claimData.claimed_at) {
        setLastClaimResult({
          success: false,
          message: `Mã này đã được claim lúc ${new Date(claimData.claimed_at).toLocaleString('vi-VN')}`
        });
        toast.error('Mã này đã được sử dụng');
        return;
      }

      // Check if user already has claimed this code
      if (claimData.claimed_by_user_id === user.id) {
        setLastClaimResult({
          success: false,
          message: 'Bạn đã claim mã này rồi'
        });
        toast.error('Bạn đã claim mã này rồi');
        return;
      }

      // Claim the code
      const { error: updateError } = await supabase
        .from('simple_legacy_claims')
        .update({
          claimed_at: new Date().toISOString(),
          claimed_by_user_id: user.id,
          claimed_by_email: user.email
        })
        .eq('claim_code', claimCode.trim())
        .eq('claimed_at', null); // Additional safety check

      if (updateError) {
        console.error('Error claiming code:', updateError);
        setLastClaimResult({
          success: false,
          message: 'Có lỗi xảy ra khi claim mã'
        });
        toast.error('Có lỗi xảy ra khi claim mã');
        return;
      }

      // Success
      setLastClaimResult({
        success: true,
        message: `Thành công! Bạn đã nhận được ${claimData.spa_points} điểm SPA`,
        points: claimData.spa_points
      });
      toast.success(`Claim thành công! +${claimData.spa_points} điểm SPA`);
      setClaimCode('');

    } catch (error) {
      console.error('Unexpected error:', error);
      setLastClaimResult({
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success-600" />
          Claim Điểm SPA
        </CardTitle>
        <CardDescription>
          Nhập mã code để nhận điểm SPA về tài khoản của bạn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
              className="min-w-[100px]"
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

        {lastClaimResult && (
          <Alert className={lastClaimResult.success ? 'border-success-200 bg-success-50' : 'border-error-200 bg-error-50'}>
            <div className="flex items-start gap-2">
              {lastClaimResult.success ? (
                <CheckCircle className="h-4 w-4 text-success-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-error-600 mt-0.5" />
              )}
              <AlertDescription className={lastClaimResult.success ? 'text-success-800' : 'text-error-800'}>
                {lastClaimResult.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <strong>Hướng dẫn:</strong>
          <ul className="mt-1 list-disc list-inside space-y-1">
            <li>Nhập chính xác mã code mà bạn nhận được</li>
            <li>Mỗi mã chỉ có thể sử dụng một lần</li>
            <li>Điểm SPA sẽ được cộng ngay vào tài khoản sau khi claim thành công</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
