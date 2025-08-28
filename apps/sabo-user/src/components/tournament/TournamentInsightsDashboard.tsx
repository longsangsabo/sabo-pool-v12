import React from "react";
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Trophy,
  DollarSign,
  Clock,
  Target,
} from 'lucide-react';
import { Tournament } from '@/types/tournament-management';
import { useTournamentAnalytics } from '@/hooks/useTournamentAnalytics';

interface TournamentInsightsDashboardProps {
  tournaments: Tournament[];
}

export const TournamentInsightsDashboard: React.FC<
  TournamentInsightsDashboardProps
> = ({ tournaments }) => {
  const analytics = useTournamentAnalytics(tournaments);

  const insights = useMemo(() => {
    const thisMonth = new Date().getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;

    const thisMonthTournaments = tournaments.filter(
      t => new Date(t.tournament_start).getMonth() === thisMonth
    );
    const lastMonthTournaments = tournaments.filter(
      t => new Date(t.tournament_start).getMonth() === lastMonth
    );

    const monthlyGrowth =
      lastMonthTournaments.length > 0
        ? ((thisMonthTournaments.length - lastMonthTournaments.length) /
            lastMonthTournaments.length) *
          100
        : 0;

    return {
      monthlyGrowth,
      participationTrend: calculateParticipationTrend(tournaments),
      revenueGrowth: calculateRevenueGrowth(tournaments),
      popularTimeSlots: getPopularTimeSlots(tournaments),
      averageCompletionTime: calculateAverageCompletionTime(tournaments),
    };
  }, [tournaments]);

  const metricCards = [
    {
      title: 'Monthly Growth',
      value: `${insights.monthlyGrowth.toFixed(1)}%`,
      icon: insights.monthlyGrowth >= 0 ? TrendingUp : TrendingDown,
      color: insights.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: insights.monthlyGrowth >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      title: 'Avg Participants',
      value: Math.round(analytics.averageParticipants),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Revenue Growth',
      value: `${insights.revenueGrowth.toFixed(1)}%`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Completion Rate',
      value: `${analytics.completionRate.toFixed(1)}%`,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>
                      {metric.title}
                    </p>
                    <p className='text-2xl font-bold'>{metric.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${metric.bgColor}`}>
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tournament Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Activity className='h-5 w-5' />
            Tournament Health Score
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-3'>
            {[
              { label: 'Participation Rate', value: 85, color: 'bg-green-500' },
              {
                label: 'Completion Rate',
                value: analytics.completionRate,
                color: 'bg-blue-500',
              },
              {
                label: 'Player Satisfaction',
                value: 92,
                color: 'bg-purple-500',
              },
              {
                label: 'Revenue Performance',
                value: 78,
                color: 'bg-orange-500',
              },
            ].map((metric, index) => (
              <div key={index} className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>{metric.label}</span>
                  <span className='font-medium'>
                    {metric.value.toFixed(0)}%
                  </span>
                </div>
                <Progress value={metric.value} className='h-2' />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Tournament Types */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Trophy className='h-5 w-5' />
            Tournament Type Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {analytics.popularTypes.slice(0, 4).map((type, index) => {
              const percentage =
                tournaments.length > 0
                  ? (type.count / tournaments.length) * 100
                  : 0;

              return (
                <div
                  key={type.type}
                  className='flex items-center justify-between'
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm'>
                      {index + 1}
                    </div>
                    <div>
                      <p className='font-medium'>
                        {type.type === 'single_elimination'
                          ? 'Single Elimination'
                          : type.type === 'double_elimination'
                            ? 'Double Elimination'
                            : type.type === 'round_robin'
                              ? 'Round Robin'
                              : type.type}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {type.count} tournaments • {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Badge variant='secondary'>
                    {percentage >= 50
                      ? 'Popular'
                      : percentage >= 25
                        ? 'Average'
                        : 'Emerging'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            Timing Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <h4 className='font-medium mb-3'>Popular Time Slots</h4>
              <div className='space-y-2'>
                {insights.popularTimeSlots.map((slot, index) => (
                  <div key={index} className='flex justify-between text-sm'>
                    <span>{slot.time}</span>
                    <Badge variant='outline'>{slot.count} tournaments</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className='font-medium mb-3'>Performance Metrics</h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span>Avg Tournament Duration</span>
                  <span className='font-medium'>
                    {insights.averageCompletionTime}h
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Peak Registration Day</span>
                  <span className='font-medium'>Tuesday</span>
                </div>
                <div className='flex justify-between'>
                  <span>Optimal Start Time</span>
                  <span className='font-medium'>19:00</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
const calculateParticipationTrend = (tournaments: Tournament[]) => {
  // Implementation for participation trend calculation
  return 15.2; // Mock value
};

const calculateRevenueGrowth = (tournaments: Tournament[]) => {
  // Implementation for revenue growth calculation
  return 23.5; // Mock value
};

const getPopularTimeSlots = (tournaments: Tournament[]) => {
  const timeSlots = tournaments.reduce(
    (acc, tournament) => {
      const hour = new Date(tournament.tournament_start).getHours();
      const timeSlot = `${hour}:00`;
      acc[timeSlot] = (acc[timeSlot] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(timeSlots)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

const calculateAverageCompletionTime = (tournaments: Tournament[]) => {
  const completedTournaments = tournaments.filter(
    t => t.status === 'completed'
  );
  if (completedTournaments.length === 0) return 0;

  const totalDuration = completedTournaments.reduce((sum, tournament) => {
    const start = new Date(tournament.tournament_start);
    const end = new Date(tournament.tournament_end);
    return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
  }, 0);

  return Math.round((totalDuration / completedTournaments.length) * 10) / 10;
};
