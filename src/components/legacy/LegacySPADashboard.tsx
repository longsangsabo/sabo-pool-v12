import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Users, Award, Clock, TrendingUp, Info, ExternalLink, Shield } from 'lucide-react';
import { CombinedSPALeaderboard } from './CombinedSPALeaderboard';
import { LegacyClaimAdminPanel } from './LegacyClaimAdminPanel';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../../hooks/useAuth';

interface LegacyStats {
  total_players: number;
  claimed_players: number;
  unclaimed_players: number;
  total_spa_points: number;
  claimed_spa_points: number;
  unclaimed_spa_points: number;
}

export const LegacySPADashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<LegacyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Fetch raw data from legacy_spa_points table
      const { data, error } = await supabase
        .from('legacy_spa_points')
        .select('spa_points, claimed');

      if (error) throw error;

      // Calculate stats manually
      const totalPlayers = data?.length || 0;
      const claimedPlayers = data?.filter(p => p.claimed).length || 0;
      const unclaimedPlayers = totalPlayers - claimedPlayers;
      
      const totalSpaPoints = data?.reduce((sum, p) => sum + p.spa_points, 0) || 0;
      const claimedSpaPoints = data?.filter(p => p.claimed).reduce((sum, p) => sum + p.spa_points, 0) || 0;
      const unclaimedSpaPoints = totalSpaPoints - claimedSpaPoints;

      setStats({
        total_players: totalPlayers,
        claimed_players: claimedPlayers,
        unclaimed_players: unclaimedPlayers,
        total_spa_points: totalSpaPoints,
        claimed_spa_points: claimedSpaPoints,
        unclaimed_spa_points: unclaimedSpaPoints,
      });
    } catch (error) {
      console.error('Error loading legacy stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    checkAuthorization();
  }, [user]);

  const checkAuthorization = async () => {
    if (!user) {
      setIsAuthorized(false);
      return;
    }

    try {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

      if (profile?.is_admin) {
        setIsAuthorized(true);
        return;
      }

      // Check if user is owner of SABO/SBO clubs
      const { data: clubData } = await supabase
        .from('club_profiles')
        .select('club_name, verification_status')
        .eq('user_id', user.id)
        .eq('verification_status', 'approved');

      const isSaboClubOwner = clubData?.some(club => 
        club.club_name.includes('SABO') || 
        club.club_name.includes('SBO') || 
        club.club_name.includes('POOL ARENA')
      );

      setIsAuthorized(isSaboClubOwner || false);
    } catch (error) {
      console.error('Authorization check error:', error);
      setIsAuthorized(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const calculatePercentage = (part: number, total: number) => {
    return total > 0 ? Math.round((part / total) * 100) : 0;
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold text-foreground'>
            🏆 Legacy SPA System
          </h2>
          <p className='text-muted-foreground'>
            Hệ thống quản lý và chuyển đổi điểm SPA từ người chơi cũ
          </p>
        </div>
        <Button
          variant='outline'
          onClick={loadStats}
          disabled={loading}
          className='flex items-center gap-2'
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Total Players */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Tổng người chơi Legacy
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatNumber(stats.total_players)}
              </div>
              <p className='text-xs text-muted-foreground'>
                Tổng số player trong hệ thống cũ
              </p>
            </CardContent>
          </Card>

          {/* Claimed Players */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Đã chuyển đổi
              </CardTitle>
              <Award className='h-4 w-4 text-green-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {formatNumber(stats.claimed_players)}
              </div>
              <p className='text-xs text-muted-foreground'>
                {calculatePercentage(stats.claimed_players, stats.total_players)}% đã claim
              </p>
            </CardContent>
          </Card>

          {/* Unclaimed Players */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Chờ chuyển đổi
              </CardTitle>
              <Clock className='h-4 w-4 text-orange-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-orange-600'>
                {formatNumber(stats.unclaimed_players)}
              </div>
              <p className='text-xs text-muted-foreground'>
                {calculatePercentage(stats.unclaimed_players, stats.total_players)}% chưa claim
              </p>
            </CardContent>
          </Card>

          {/* Total SPA Points */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Tổng điểm SPA
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-blue-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {formatNumber(stats.total_spa_points)}
              </div>
              <p className='text-xs text-muted-foreground'>
                Điểm trong hệ thống legacy
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Badges */}
      <div className='flex flex-wrap gap-4'>
        <Badge variant='outline' className='text-green-600 border-green-200'>
          <div className='w-2 h-2 bg-green-500 rounded-full mr-2'></div>
          Đã đăng ký (Claimed)
        </Badge>
        <Badge variant='outline' className='text-orange-600 border-orange-200'>
          <div className='w-2 h-2 bg-orange-500 rounded-full mr-2'></div>
          Chờ đăng ký (Unclaimed)
        </Badge>
        <Badge variant='outline' className='text-blue-600 border-blue-200'>
          <div className='w-2 h-2 bg-blue-500 rounded-full mr-2'></div>
          User mới (Registered)
        </Badge>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className='h-4 w-4' />
        <AlertDescription>
          <div className='space-y-2'>
            <p className='font-medium'>💡 Thông tin về hệ thống Legacy SPA:</p>
            <ul className='text-sm space-y-1 ml-4'>
              <li>• Hiển thị {stats?.total_players || 0} người chơi từ hệ thống cũ với tổng {stats?.total_spa_points ? formatNumber(stats.total_spa_points) : 0} điểm SPA</li>
              <li>• Người chơi cũ có thể claim điểm SPA để chuyển vào tài khoản mới</li>
              <li>• Sau khi claim thành công, điểm SPA sẽ được chuyển vào hệ thống mới</li>
              <li>• Để claim điểm, vào trang Profile {">"} Thông tin cá nhân {">"} Claim Legacy Points</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* SPA Distribution */}
      {stats && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Phân bổ điểm SPA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-muted-foreground'>Đã chuyển đổi:</span>
                  <span className='font-semibold text-green-600'>
                    {formatNumber(stats.claimed_spa_points)} SPA
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-muted-foreground'>Chờ chuyển đổi:</span>
                  <span className='font-semibold text-orange-600'>
                    {formatNumber(stats.unclaimed_spa_points)} SPA
                  </span>
                </div>
                <div className='border-t pt-2'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm font-medium'>Tổng cộng:</span>
                    <span className='font-bold text-lg'>
                      {formatNumber(stats.total_spa_points)} SPA
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Tỷ lệ chuyển đổi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Đã claim</span>
                    <span>{calculatePercentage(stats.claimed_players, stats.total_players)}%</span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div 
                      className='bg-green-500 h-2 rounded-full' 
                      style={{ width: `${calculatePercentage(stats.claimed_players, stats.total_players)}%` }}
                    ></div>
                  </div>
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Chưa claim</span>
                    <span>{calculatePercentage(stats.unclaimed_players, stats.total_players)}%</span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div 
                      className='bg-orange-500 h-2 rounded-full' 
                      style={{ width: `${calculatePercentage(stats.unclaimed_players, stats.total_players)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content with Tabs */}
      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leaderboard">
            🏆 Leaderboard
          </TabsTrigger>
          {isAuthorized && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Admin Panel
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className='text-xl'>Bảng xếp hạng Legacy + Active</CardTitle>
              <p className='text-muted-foreground'>
                Hiển thị kết hợp người chơi cũ (legacy) và người chơi đã đăng ký
              </p>
            </CardHeader>
            <CardContent>
              <CombinedSPALeaderboard />
            </CardContent>
          </Card>
        </TabsContent>

        {isAuthorized && (
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle className='text-xl flex items-center gap-2'>
                  <Shield className="w-5 h-5" />
                  SABO Admin Panel
                </CardTitle>
                <p className='text-muted-foreground'>
                  Xử lý yêu cầu claim SPA Points từ users
                </p>
              </CardHeader>
              <CardContent>
                <LegacyClaimAdminPanel />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
