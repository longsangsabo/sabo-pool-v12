import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClubStatsDashboard from '@/components/ClubStatsDashboard';
import MobileLeaderboard from '@/components/mobile/MobileLeaderboard';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useSystemStats } from '@/hooks/useSystemStats';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import { TrendingUp, Building2, Users } from 'lucide-react';

const LeaderboardPage = () => {
  const { leaderboard, loading, error } = useLeaderboard();
  const systemStats = useSystemStats();
  const { isMobile } = useOptimizedResponsive();

  // For mobile, use MobileLeaderboard directly - MainLayout already provides MobilePlayerLayout
  if (isMobile) {
    return <MobileLeaderboard />;
  }

  return (
    <div className='space-y-8'>
      <div className='text-center space-y-4'>
        <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
          Bảng Xếp Hạng & Thống Kê
        </h1>
        <p className='text-xl text-muted-foreground'>
          Xếp hạng và thống kê chi tiết của cộng đồng
        </p>
      </div>

      <Tabs defaultValue='leaderboard' className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='leaderboard' className='flex items-center'>
            <TrendingUp className='w-4 h-4 mr-2' />
            Bảng xếp hạng
          </TabsTrigger>
          <TabsTrigger value='club-stats' className='flex items-center'>
            <Building2 className='w-4 h-4 mr-2' />
            Thống kê CLB
          </TabsTrigger>
          <TabsTrigger value='overall' className='flex items-center'>
            <Users className='w-4 h-4 mr-2' />
            Tổng quan
          </TabsTrigger>
        </TabsList>

        <TabsContent value='leaderboard'>
          {/* Use MobileLeaderboard for desktop too, but without mobile-specific styling */}
          <MobileLeaderboard hideTitle={true} className="space-y-4" />
        </TabsContent>

        <TabsContent value='club-stats'>
          <ClubStatsDashboard />
        </TabsContent>

        <TabsContent value='overall'>
          <Card>
            <CardHeader>
              <CardTitle>Thống kê tổng quan hệ thống</CardTitle>
            </CardHeader>
            <CardContent>
              {systemStats.loading ? (
                <div className='flex justify-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                </div>
              ) : systemStats.error ? (
                <div className='text-center py-8 text-error-600'>
                  {systemStats.error}
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                  <div className='text-center p-4 bg-primary-50 rounded-lg'>
                    <div className='text-3xl font-bold text-primary-600'>
                      {systemStats.activePlayers.toLocaleString()}
                    </div>
                    <div className='text-neutral-600'>Người chơi tích cực</div>
                  </div>
                  <div className='text-center p-4 bg-success-50 rounded-lg'>
                    <div className='text-3xl font-bold text-success-600'>
                      {systemStats.totalMatches.toLocaleString()}
                    </div>
                    <div className='text-neutral-600'>Trận đấu tháng này</div>
                  </div>
                  <div className='text-center p-4 bg-info-50 rounded-lg'>
                    <div className='text-3xl font-bold text-info-600'>
                      {systemStats.totalClubs.toLocaleString()}
                    </div>
                    <div className='text-neutral-600'>Câu lạc bộ</div>
                  </div>
                  <div className='text-center p-4 bg-warning-50 rounded-lg'>
                    <div className='text-3xl font-bold text-warning-600'>
                      {systemStats.avgTrustScore.toFixed(1)}%
                    </div>
                    <div className='text-neutral-600'>
                      Điểm tin cậy trung bình
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaderboardPage;
