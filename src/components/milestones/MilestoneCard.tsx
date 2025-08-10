import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Trophy, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MilestoneCardProps {
  milestone: {
    milestone_id: string;
    milestone_name: string;
    milestone_type: string;
    description: string;
    icon: string;
    requirement_value: number;
    current_progress: number;
    spa_reward: number;
    is_completed: boolean;
    is_repeatable: boolean;
    completed_at?: string;
  };
  className?: string;
}

export function MilestoneCard({ milestone, className }: MilestoneCardProps) {
  const progressPercentage = Math.min(
    (milestone.current_progress / milestone.requirement_value) * 100,
    100
  );

  const getStatusIcon = () => {
    if (milestone.is_completed) {
      return <CheckCircle className='h-4 w-4 text-green-600' />;
    }
    return <Clock className='h-4 w-4 text-yellow-600' />;
  };

  const getMilestoneTypeColor = (type: string) => {
    const colors = {
      registration:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      rank_verification:
        'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
      referral_success:
        'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      daily_login:
        'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
      tournament_champion:
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      challenge_wins:
        'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
      win_streak:
        'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
      rank_promotion:
        'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
      join_club:
        'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400',
    };
    return (
      colors[type as keyof typeof colors] ||
      'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
    );
  };

  const getMilestoneTypeName = (type: string) => {
    const names = {
      registration: 'Đăng ký',
      rank_verification: 'Xác thực hạng',
      referral_success: 'Giới thiệu',
      referred_user: 'Được giới thiệu',
      daily_login: 'Đăng nhập',
      login_streak_7: 'Chuỗi đăng nhập',
      login_streak_30: 'Chuỗi đăng nhập',
      first_tournament: 'Tournament',
      tournament_champion: 'Vô địch',
      tournament_top3: 'Top 3',
      first_challenge: 'Thách đấu',
      challenge_wins_10: 'Thắng thách đấu',
      challenge_wins_50: 'Thắng thách đấu',
      challenge_wins_100: 'Thắng thách đấu',
      win_streak_5: 'Chuỗi thắng',
      win_streak_10: 'Chuỗi thắng',
      rank_promotion: 'Thăng hạng',
      join_club: 'Tham gia CLB',
      create_club: 'Tạo CLB',
      profile_completion: 'Hoàn thành profile',
      share_achievement: 'Chia sẻ',
      app_review: 'Đánh giá ứng dụng',
    };
    return names[type as keyof typeof names] || type;
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        milestone.is_completed
          ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20'
          : 'hover:border-primary/50',
        className
      )}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-2'>
            <span className='text-2xl'>{milestone.icon}</span>
            <div>
              <CardTitle className='text-base leading-tight'>
                {milestone.milestone_name}
              </CardTitle>
              <div className='flex items-center gap-2 mt-1'>
                <Badge
                  variant='secondary'
                  className={cn(
                    'text-xs',
                    getMilestoneTypeColor(milestone.milestone_type)
                  )}
                >
                  {getMilestoneTypeName(milestone.milestone_type)}
                </Badge>
                {milestone.is_repeatable && (
                  <Badge variant='outline' className='text-xs'>
                    <Repeat className='h-3 w-3 mr-1' />
                    Lặp lại
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {getStatusIcon()}
            <Badge
              variant={milestone.is_completed ? 'default' : 'secondary'}
              className='font-semibold'
            >
              <Trophy className='h-3 w-3 mr-1' />
              +{milestone.spa_reward} SPA
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        <p className='text-sm text-muted-foreground mb-3'>
          {milestone.description}
        </p>

        {!milestone.is_completed && (
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Tiến độ</span>
              <span className='font-medium'>
                {milestone.current_progress}/{milestone.requirement_value}
              </span>
            </div>
            <Progress value={progressPercentage} className='h-2' />
          </div>
        )}

        {milestone.is_completed && milestone.completed_at && (
          <div className='flex items-center gap-2 text-sm text-green-600 dark:text-green-400'>
            <CheckCircle className='h-4 w-4' />
            <span>
              Hoàn thành{' '}
              {new Date(milestone.completed_at).toLocaleDateString('vi-VN')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
