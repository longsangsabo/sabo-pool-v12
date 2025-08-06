import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, TrendingUp, Calendar, DollarSign, Target } from 'lucide-react';
import { useTournamentAnalytics } from '@/hooks/useTournamentAnalytics';
import { Tournament } from '@/types/tournament-management';

interface TournamentSummaryDashboardProps {
  tournaments: Tournament[];
}

export const TournamentSummaryDashboard: React.FC<TournamentSummaryDashboardProps> = ({
  tournaments,
}) => {
  const { totalRevenue, averageParticipants, completionRate, popularTypes } = useTournamentAnalytics(tournaments);

  const stats = [
    {
      title: 'Tổng số giải đấu',
      value: tournaments.length,
      icon: Trophy,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Doanh thu',
      value: `${totalRevenue.toLocaleString('vi-VN')} VND`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'TB người tham gia',
      value: Math.round(averageParticipants),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Tỷ lệ hoàn thành',
      value: `${completionRate.toFixed(1)}%`,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Popular Tournament Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Loại giải phổ biến
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {popularTypes.slice(0, 5).map((type, index) => (
              <div key={type.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium">
                    {type.type === 'single_elimination' ? 'Loại trực tiếp' :
                     type.type === 'double_elimination' ? 'Loại kép' :
                     type.type === 'round_robin' ? 'Vòng tròn' :
                     type.type}
                  </span>
                </div>
                <Badge variant="secondary">{type.count} giải</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tình trạng giải đấu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { status: 'upcoming', label: 'Sắp tới', color: 'blue' },
              { status: 'ongoing', label: 'Đang diễn ra', color: 'green' },
              { status: 'registration_open', label: 'Mở ĐK', color: 'yellow' },
              { status: 'completed', label: 'Hoàn thành', color: 'gray' },
            ].map(({ status, label, color }) => {
              const count = tournaments.filter(t => t.status === status).length;
              return (
                <div key={status} className="text-center">
                  <div className={`text-2xl font-bold text-${color}-600`}>
                    {count}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
