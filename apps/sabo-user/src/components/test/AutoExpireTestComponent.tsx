import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useEnhancedChallengesV3 } from '@/hooks/useEnhancedChallengesV3';

const AutoExpireTestComponent: React.FC = () => {
  const { 
    challenges, 
    communityKeo, 
    myDoiDoiThu, 
    autoExpireChallenges,
    loading 
  } = useEnhancedChallengesV3();
  
  const [testStats, setTestStats] = useState({
    totalChallenges: 0,
    expiredChallenges: 0,
    pendingWithoutOpponent: 0,
    openWithoutOpponent: 0,
    lastAutoExpireRun: null as Date | null
  });

  // Update stats when challenges change
  useEffect(() => {
    const total = challenges.length;
    const expired = challenges.filter(c => c.status === 'expired').length;
    const pendingNoOpponent = challenges.filter(c => 
      c.status === 'pending' && !c.opponent_id
    ).length;
    const openNoOpponent = challenges.filter(c => 
      c.status === 'open' && !c.opponent_id
    ).length;

    setTestStats(prev => ({
      ...prev,
      totalChallenges: total,
      expiredChallenges: expired,
      pendingWithoutOpponent: pendingNoOpponent,
      openWithoutOpponent: openNoOpponent
    }));
  }, [challenges]);

  const runManualExpireTest = async () => {
    console.log('🧪 Running manual auto-expire test...');
    await autoExpireChallenges();
    setTestStats(prev => ({
      ...prev,
      lastAutoExpireRun: new Date()
    }));
  };

  const getExpiredChallenges = () => {
    return challenges.filter(c => c.status === 'expired');
  };

  const getHealthyStats = () => {
    const expired = challenges.filter(c => c.status === 'expired').length;
    const total = challenges.length;
    const healthyPercentage = total > 0 ? ((total - expired) / total * 100) : 100;
    
    return {
      healthy: total - expired,
      expired,
      healthyPercentage: Number(healthyPercentage.toFixed(1))
    };
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Đang tải dữ liệu challenges...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { healthy, expired, healthyPercentage } = getHealthyStats();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            🧪 Auto-Expire Challenge System Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Total Challenges */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Tổng Challenges</span>
              </div>
              <div className="text-2xl font-bold text-blue-800">{testStats.totalChallenges}</div>
            </div>

            {/* Healthy Challenges */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Active</span>
              </div>
              <div className="text-2xl font-bold text-green-800">{healthy}</div>
              <div className="text-xs text-green-600">{healthyPercentage}% healthy</div>
            </div>

            {/* Expired Challenges */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">Expired</span>
              </div>
              <div className="text-2xl font-bold text-red-800">{expired}</div>
            </div>

            {/* Pending Without Opponent */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">Đợi Đối Thủ</span>
              </div>
              <div className="text-2xl font-bold text-yellow-800">
                {testStats.pendingWithoutOpponent + testStats.openWithoutOpponent}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-6">
            <Button onClick={runManualExpireTest} variant="outline">
              🧪 Test Auto-Expire Ngay
            </Button>
            {testStats.lastAutoExpireRun && (
              <Badge variant="secondary">
                Lần test cuối: {testStats.lastAutoExpireRun.toLocaleTimeString('vi-VN')}
              </Badge>
            )}
          </div>

          {/* UI Filter Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">🌍 Community Kèo (UI Filtered)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{communityKeo.length}</div>
                <p className="text-sm text-muted-foreground">
                  Challenges có thể join (đã loại bỏ expired)
                </p>
                {communityKeo.length === 0 && (
                  <Badge variant="outline" className="mt-2">
                    ✅ UI sạch sẽ - không có challenge hết hạn
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">👤 My Đợi Đối Thủ (UI Filtered)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{myDoiDoiThu.length}</div>
                <p className="text-sm text-muted-foreground">
                  Challenges của tôi đang đợi (đã loại bỏ expired)
                </p>
                {myDoiDoiThu.length === 0 && (
                  <Badge variant="outline" className="mt-2">
                    ✅ UI sạch sẽ - không có challenge hết hạn
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Health Status */}
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">System Health Status</span>
            </div>
            <p className="text-sm text-green-700">
              🎯 <strong>Auto-expire system đang hoạt động!</strong> 
              {healthyPercentage >= 90 ? ' Hệ thống rất khỏe mạnh.' : 
               healthyPercentage >= 70 ? ' Hệ thống ổn định.' : 
               ' Cần kiểm tra và clean up.'}
            </p>
            <p className="text-xs text-green-600 mt-1">
              📱 Mobile UI sẽ chỉ hiển thị {healthy} challenges active, ẩn {expired} challenges đã hết hạn.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoExpireTestComponent;
