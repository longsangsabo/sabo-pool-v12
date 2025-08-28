import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Users, Award, Clock, TrendingUp, Info, ExternalLink } from 'lucide-react';
import { CombinedSPALeaderboard } from './CombinedSPALeaderboard';

interface LegacyStats {
  total_players: number;
  claimed_players: number;
  unclaimed_players: number;
  total_spa_points: number;
  claimed_spa_points: number;
  unclaimed_spa_points: number;
}

export const LegacySPADashboard: React.FC = () => {
  const [stats, setStats] = useState<LegacyStats>({
    total_players: 47,
    claimed_players: 0,
    unclaimed_players: 47,
    total_spa_points: 39950,
    claimed_spa_points: 0,
    unclaimed_spa_points: 39950
  });
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Mock data for legacy stats
      setStats({
        total_players: 47,
        claimed_players: 0,
        unclaimed_players: 47,
        total_spa_points: 39950,
        claimed_spa_points: 0,
        unclaimed_spa_points: 39950
      });
    } catch (error) {
      console.error('Error loading legacy stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold text-foreground'>
            🏆 Legacy SPA Points Dashboard
          </h2>
          <p className='text-muted-foreground mt-2'>
            Hệ thống điểm SPA từ phiên bản cũ (47 players)
          </p>
        </div>
        <Button
          onClick={loadStats}
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Legacy System Notice */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Hệ thống Legacy SPA Points:</strong> Dữ liệu từ hệ thống cũ được lưu trữ
          và cho phép players claim điểm SPA bằng cách nhập mã claim code.
        </AlertDescription>
      </Alert>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Total Players */}
        <Card className='bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-blue-600 text-sm font-medium'>Total Players</p>
                <p className='text-2xl font-bold text-blue-800'>{stats.total_players}</p>
              </div>
              <Users className='w-10 h-10 text-blue-500' />
            </div>
            <div className='mt-4 flex items-center gap-2'>
              <TrendingUp className='w-4 h-4 text-green-600' />
              <span className='text-sm text-green-600 font-medium'>
                Legacy database
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Claimed vs Unclaimed */}
        <Card className='bg-gradient-to-br from-green-50 to-green-100 border-green-200'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-green-600 text-sm font-medium'>Claimed / Unclaimed</p>
                <p className='text-2xl font-bold text-green-800'>
                  {stats.claimed_players} / {stats.unclaimed_players}
                </p>
              </div>
              <Award className='w-10 h-10 text-green-500' />
            </div>
            <div className='mt-4 space-y-2'>
              <div className='flex justify-between text-xs'>
                <span>Claimed:</span>
                <Badge variant='outline' className='text-green-600 border-green-200'>
                  {((stats.claimed_players / stats.total_players) * 100).toFixed(1)}%
                </Badge>
              </div>
              <div className='flex justify-between text-xs'>
                <span>Available:</span>
                <Badge variant='outline' className='text-orange-600 border-orange-200'>
                  {((stats.unclaimed_players / stats.total_players) * 100).toFixed(1)}%
                </Badge>
              </div>
              <div className='flex justify-between text-xs'>
                <span>Status:</span>
                <Badge variant='outline' className='text-blue-600 border-blue-200'>
                  {stats.total_players} total
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total SPA Points */}
        <Card className='bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-purple-600 text-sm font-medium'>Total SPA Points</p>
                <p className='text-2xl font-bold text-purple-800'>
                  {stats.total_spa_points.toLocaleString()}
                </p>
              </div>
              <TrendingUp className='w-10 h-10 text-purple-500' />
            </div>
            <div className='mt-4 space-y-1'>
              <div className='flex justify-between text-xs'>
                <span>Claimed:</span>
                <span className='font-medium text-green-600'>
                  {stats.claimed_spa_points.toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between text-xs'>
                <span>Available:</span>
                <span className='font-medium text-orange-600'>
                  {stats.unclaimed_spa_points.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className='bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'>
        <CardContent className='p-6'>
          <div className='flex items-start gap-4'>
            <Clock className='w-6 h-6 text-yellow-600 mt-1' />
            <div className='space-y-2'>
              <h3 className='font-semibold text-yellow-800'>
                Hướng dẫn claim SPA Points từ hệ thống Legacy:
              </h3>
              <ul className='text-sm text-yellow-700 space-y-1 list-disc list-inside'>
                <li>Tìm tên của bạn trong danh sách Legacy Players bên dưới</li>
                <li>Nhấn nút <strong>"🎁 Claim"</strong> bên cạnh tên của bạn</li>
                <li>Nhập mã claim code mà SABO đã gửi cho bạn</li>
                <li>Điểm SPA sẽ được chuyển vào tài khoản hiện tại của bạn</li>
              </ul>
              <div className='mt-3 p-3 bg-yellow-100 rounded-lg'>
                <p className='text-xs text-yellow-600'>
                  <strong>Lưu ý:</strong> Mỗi mã claim code chỉ có thể sử dụng một lần. 
                  Nếu bạn chưa có mã, vui lòng liên hệ SABO qua Facebook.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <CombinedSPALeaderboard />
    </div>
  );
};
