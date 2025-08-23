import React, { Suspense, lazy } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useThemedStyles } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { 
  User,
  Trophy,
  Target,
  Users,
  TrendingUp,
  Calendar,
  Bell,
  Activity,
} from 'lucide-react';
import { DashboardSkeleton } from '@/components/skeleton/DashboardSkeleton';
import { EnhancedWalletBalance } from '@/components/enhanced/EnhancedWalletBalance';
import { MilestoneSummaryWidget } from '@/components/milestones/MilestoneSummaryWidget';
import { RecentMilestoneAwards } from '@/components/milestones/RecentMilestoneAwards';
import { Link } from 'react-router-dom';

// Import standardized design system
import { 
  StandardCard, 
  StandardStatsGrid, 
  StandardSkeleton 
} from '@/config/StandardComponents';
import { StandardPageWrapper, StandardPageHeader } from '@/config/PageLayoutConfig';

const DashboardPage = () => {
  const { user, signOut, loading } = useAuth();
  const { getThemedValue, theme } = useThemedStyles();

  const handleLogout = async () => {
    await signOut();
  };

  // Standardized player stats using design system
  const playerStats = [
    {
      id: 'elo',
      label: 'ELO Rating',
      value: '1,250',
      icon: Trophy,
      color: 'yellow' as const,
      trend: { value: 5.2, direction: 'up' as const }
    },
    {
      id: 'wins',
      label: 'Trận thắng',
      value: 45,
      icon: TrendingUp,
      color: 'green' as const,
      trend: { value: 12.5, direction: 'up' as const }
    },
    {
      id: 'losses',
      label: 'Trận thua',
      value: 12,
      icon: Target,
      color: 'red' as const,
      trend: { value: 2.1, direction: 'down' as const }
    },
    {
      id: 'winrate',
      label: 'Tỷ lệ thắng',
      value: '78.9%',
      icon: Activity,
      color: 'blue' as const,
      trend: { value: 3.8, direction: 'up' as const }
    }
  ];

  // Quick actions using standardized design
  const quickActions = [
    {
      label: 'Tạo thách đấu',
      icon: Target,
      route: '/challenges',
      color: 'bg-blue-500 hover:bg-blue-600 text-white'
    },
    {
      label: 'Xem giải đấu',
      icon: Trophy,
      route: '/tournaments',
      color: 'bg-green-500 hover:bg-green-600 text-white'
    },
    {
      label: 'Cập nhật hồ sơ',
      icon: User,
      route: '/profile',
      color: 'bg-purple-500 hover:bg-purple-600 text-white'
    },
    {
      label: 'Xem lịch',
      icon: Calendar,
      route: '/schedule',
      color: 'bg-orange-500 hover:bg-orange-600 text-white'
    }
  ];

  if (loading) {
    return <StandardSkeleton variant="stats" count={4} />;
  }

  const pageActions = (
    <div className="flex items-center space-x-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="hidden sm:flex"
      >
        Đăng xuất
      </Button>
      <Button size="sm" asChild>
        <Link to="/profile">
          <User className="w-4 h-4 mr-2" />
          Hồ sơ
        </Link>
      </Button>
    </div>
  );

  return (
    <StandardPageWrapper variant="dashboard">
      <StandardPageHeader
        title={`Chào mừng, ${user?.user_metadata?.full_name || 'Bạn'}! 👋`}
        description="Chúc bạn có một ngày thi đấu thành công"
        actions={pageActions}
        variant="dashboard"
      />
      
      <div className="space-y-8">
        {/* Wallet Balance Section */}
        <StandardCard 
          title="Số dư ví" 
          variant="feature"
          className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
        >
          <Suspense fallback={<StandardSkeleton variant="custom" className="h-24" />}>
            <EnhancedWalletBalance />
          </Suspense>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <MilestoneSummaryWidget />
            <RecentMilestoneAwards compact />
          </div>
        </StandardCard>

        {/* Player Statistics */}
        <StandardCard 
          title="Thông số người chơi" 
          description="Tổng quan về thành tích thi đấu của bạn"
          variant="default"
        >
          <StandardStatsGrid 
            stats={playerStats} 
            variant="default"
          />
        </StandardCard>

        {/* Quick Actions */}
        <StandardCard 
          title="Hành động nhanh" 
          description="Các thao tác phổ biến để bắt đầu"
          variant="default"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  to={action.route}
                  className="block group"
                >
                  <div className="text-center p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
                    <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${action.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="font-medium text-gray-900 group-hover:text-gray-700">
                      {action.label}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </StandardCard>

        {/* Recent Activity */}
        <StandardCard 
          title="Hoạt động gần đây" 
          variant="default"
          headerActions={
            <Button variant="outline" size="sm" asChild>
              <Link to="/activity">
                <Bell className="w-4 h-4 mr-2" />
                Xem tất cả
              </Link>
            </Button>
          }
        >
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="font-medium">Chưa có hoạt động gần đây</p>
            <p className="text-sm mt-2">
              Tham gia thách đấu hoặc giải đấu để có hoạt động hiển thị tại đây
            </p>
            <div className="flex justify-center space-x-3 mt-6">
              <Button size="sm" asChild>
                <Link to="/challenges">Xem thách đấu</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link to="/tournaments">Xem giải đấu</Link>
              </Button>
            </div>
          </div>
        </StandardCard>

        {/* Upcoming Schedule */}
        <StandardCard 
          title="Lịch thi đấu" 
          description="Các trận đấu sắp tới của bạn"
          variant="default"
          headerActions={
            <Button variant="outline" size="sm" asChild>
              <Link to="/schedule">
                <Calendar className="w-4 h-4 mr-2" />
                Xem lịch đầy đủ
              </Link>
            </Button>
          }
        >
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              Chưa có lịch thi đấu
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Đăng ký tham gia giải đấu để có lịch thi đấu
            </p>
            <Button className="mt-4" variant="outline" asChild>
              <Link to="/tournaments">Xem giải đấu</Link>
            </Button>
          </div>
        </StandardCard>
      </div>
    </StandardPageWrapper>
  );
};

export default DashboardPage;
