import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Target,
  ChevronRight,
  Trophy,
  Star,
  Gamepad2,
  Award,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { milestoneService, type PlayerMilestone } from '@/services/milestoneService';
import { useAuth } from '@/hooks/useAuth';

interface MilestoneProgressProps {
  theme: 'light' | 'dark';
  onViewAll?: () => void;
}

export const MilestoneProgress: React.FC<MilestoneProgressProps> = ({ theme, onViewAll }) => {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<PlayerMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMilestones = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        // Initialize player milestones first
        await milestoneService.initializePlayerMilestones(user.id);
        
        // Then get progress
        const progress = await milestoneService.getPlayerMilestoneProgress(user.id);
        console.log('Loaded milestone progress:', progress);
        
        // Sort to show most important milestones first (prioritize in-progress and completed)
        const sorted = progress.sort((a, b) => {
          const aProgress = a.milestone ? (a.current_progress / a.milestone.requirement_value) : 0;
          const bProgress = b.milestone ? (b.current_progress / b.milestone.requirement_value) : 0;
          
          // Show completed first
          if (a.is_completed && !b.is_completed) return -1;
          if (b.is_completed && !a.is_completed) return 1;
          
          // Then show in-progress
          if (aProgress > 0 && aProgress < 1 && !(bProgress > 0 && bProgress < 1)) return -1;
          if (bProgress > 0 && bProgress < 1 && !(aProgress > 0 && aProgress < 1)) return 1;
          
          // Then by progress percentage
          return bProgress - aProgress;
        });
        
        // Show only top 3 most important milestones
        setMilestones(sorted.slice(0, 3));
      } catch (error) {
        console.error('Error loading milestone progress:', error);
        // Fallback to empty array
        setMilestones([]);
      } finally {
        setLoading(false);
      }
    };

    loadMilestones();
  }, [user?.id]);

  const getProgressPercentage = (current: number, required: number) => {
    return Math.min((current / required) * 100, 100);
  };

  const getProgressText = (playerMilestone: PlayerMilestone) => {
    if (!playerMilestone.milestone) return '0/0';
    
    const current = playerMilestone.current_progress;
    const required = playerMilestone.milestone.requirement_value;
    
    switch (playerMilestone.milestone.milestone_type) {
      case 'match_count':
        return `${current}/${required} trận`;
      case 'challenge_win':
        return `${current}/${required} thắng`;
      case 'rank_registration':
        return playerMilestone.is_completed ? 'Hoàn thành' : 'Chưa hoàn thành';
      case 'daily_checkin':
        return `${current}/${required} ngày`;
      case 'login_streak':
        return `${current}/${required} ngày liên tiếp`;
      default:
        return `${current}/${required}`;
    }
  };

  const getMilestoneIcon = (milestoneType?: string) => {
    switch (milestoneType) {
      case 'rank_registration':
        return Award;
      case 'match_count':
        return Gamepad2;
      case 'challenge_win':
        return Trophy;
      case 'daily_checkin':
        return Calendar;
      case 'login_streak':
        return Star;
      default:
        return Target;
    }
  };

  if (loading) {
    return (
      <Card className={`overflow-hidden ${
        theme === 'dark'
          ? 'bg-slate-900/40 border-slate-700/50 backdrop-blur-sm'
          : 'bg-white border-slate-200'
      }`}>
        <CardContent className='p-5'>
          <div className='animate-pulse space-y-4'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='flex items-center gap-4'>
                <div className='w-10 h-10 bg-slate-300 rounded-lg'></div>
                <div className='flex-1'>
                  <div className='h-4 bg-slate-300 rounded mb-2'></div>
                  <div className='h-2 bg-slate-200 rounded'></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${
      theme === 'dark'
        ? 'bg-slate-900/40 border-slate-700/50 backdrop-blur-sm'
        : 'bg-white border-slate-200'
    }`}>
      <CardHeader className='pb-4 border-b border-slate-200/10'>
        <CardTitle className={`text-base font-semibold flex items-center justify-between ${
          theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
        }`}>
          <div className='flex items-center gap-2'>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              theme === 'dark'
                ? 'bg-slate-700/50 border border-slate-600/30'
                : 'bg-slate-100 border border-slate-200'
            }`}>
              <Target className='w-3.5 h-3.5 text-slate-400' />
            </div>
            Tiến độ Milestone
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={onViewAll}
            className={`text-xs h-7 px-2 ${
              theme === 'dark'
                ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                : 'text-slate-500 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            Xem tất cả <ChevronRight className='w-3 h-3 ml-1' />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className='p-5 space-y-4'>
        {milestones.length === 0 ? (
          <div className={`text-center py-8 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
              theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'
            }`}>
              <Target className='w-6 h-6 opacity-50' />
            </div>
            <h3 className='text-sm font-medium mb-1'>Đang khởi tạo milestone...</h3>
            <p className='text-xs'>Hệ thống đang chuẩn bị milestone cho bạn</p>
          </div>
        ) : (
          milestones.map((playerMilestone) => {
            if (!playerMilestone.milestone) return null;
            
            const Icon = getMilestoneIcon(playerMilestone.milestone.milestone_type);
            const progressPercentage = getProgressPercentage(
              playerMilestone.current_progress, 
              playerMilestone.milestone.requirement_value
            );
            
            return (
              <div key={playerMilestone.id} className={`rounded-xl p-4 border transition-all duration-200 hover:scale-[1.02] ${
                theme === 'dark' 
                  ? 'bg-slate-800/30 border-slate-700/50' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                {/* Header */}
                <div className='flex items-center gap-3 mb-3'>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center relative ${
                    theme === 'dark' ? 'bg-slate-700/50' : 'bg-white'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      playerMilestone.is_completed 
                        ? (theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600')
                        : (theme === 'dark' ? 'text-blue-300' : 'text-blue-600')
                    }`} />
                    {playerMilestone.is_completed && (
                      <div className='absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center'>
                        <CheckCircle className='w-3 h-3 text-white' />
                      </div>
                    )}
                  </div>
                  
                  <div className='flex-1'>
                    <h3 className={`text-sm font-semibold ${
                      theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
                    }`}>
                      {playerMilestone.milestone.name}
                    </h3>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {playerMilestone.milestone.description}
                    </p>
                  </div>
                  
                  <div className={`text-right ${
                    playerMilestone.is_completed 
                      ? (theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600')
                      : (theme === 'dark' ? 'text-amber-300' : 'text-amber-600')
                  }`}>
                    <div className='text-sm font-bold'>
                      {playerMilestone.is_completed ? '+' : ''}{playerMilestone.milestone.spa_reward}
                    </div>
                    <div className='text-xs opacity-80'>SPA</div>
                  </div>
                </div>
                
                {/* Progress */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className={`text-xs font-medium ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {getProgressText(playerMilestone)}
                    </span>
                    <span className={`text-xs font-bold ${
                      playerMilestone.is_completed 
                        ? (theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600')
                        : (theme === 'dark' ? 'text-slate-400' : 'text-slate-500')
                    }`}>
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className={`w-full h-2 rounded-full overflow-hidden ${
                    theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-200'
                  }`}>
                    <div 
                      className={`h-full transition-all duration-500 ${
                        playerMilestone.is_completed 
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      } rounded-full`}
                      style={{ width: `${Math.max(progressPercentage, 4)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {milestones.length > 0 && (
          <div className={`text-center py-2 ${
            theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <p className='text-xs'>Hiển thị {milestones.length} milestone quan trọng nhất</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
