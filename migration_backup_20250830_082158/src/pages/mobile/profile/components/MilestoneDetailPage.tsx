import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  Trophy,
  Star,
  Gamepad2,
  Award,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Clock,
  Gift,
  TrendingUp,
} from 'lucide-react';
import { milestoneService, type PlayerMilestone, type Milestone } from '@/services/milestoneService';
import { useAuth } from '@/hooks/useAuth';

interface MilestoneDetailPageProps {
  theme: 'light' | 'dark';
  onBack: () => void;
}

export const MilestoneDetailPage: React.FC<MilestoneDetailPageProps> = ({ theme, onBack }) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'progress' | 'achievement' | 'social'>('progress');
  const [playerMilestones, setPlayerMilestones] = useState<PlayerMilestone[]>([]);
  const [milestonesByCategory, setMilestonesByCategory] = useState<{
    progress: Milestone[];
    achievement: Milestone[];
    social: Milestone[];
  }>({
    progress: [],
    achievement: [],
    social: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMilestoneData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Initialize player milestones
        // TEMPORARY DISABLE: Skip initialization to prevent infinite loop
        // await milestoneService.initializePlayerMilestones(user.id);
        
        // Load player progress
        const playerProgress = await milestoneService.getPlayerMilestoneProgress(user.id);
        setPlayerMilestones(playerProgress);

        // Load milestones by category
        const [progressMilestones, achievementMilestones, socialMilestones] = await Promise.all([
          milestoneService.getMilestonesByCategory('progress'),
          milestoneService.getMilestonesByCategory('achievement'),
          milestoneService.getMilestonesByCategory('social')
        ]);

        setMilestonesByCategory({
          progress: progressMilestones,
          achievement: achievementMilestones,
          social: socialMilestones
        });
      } catch (error) {
        console.error('Error loading milestone data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMilestoneData();
  }, [user?.id]);

  const getProgressPercentage = (current: number, required: number) => {
    return Math.min((current / required) * 100, 100);
  };

  const getProgressText = (milestone: Milestone, playerMilestone?: PlayerMilestone) => {
    const current = playerMilestone?.current_progress || 0;
    const required = milestone.requirement_value;
    
    switch (milestone.milestone_type) {
      case 'match_count':
        return `${current}/${required} trận`;
      case 'challenge_win':
        return `${current}/${required} thắng`;
      case 'rank_registration':
        return playerMilestone?.is_completed ? 'Hoàn thành' : 'Chưa hoàn thành';
      case 'daily_checkin':
        return `${current}/${required} ngày`;
      case 'login_streak':
        return `${current}/${required} ngày liên tiếp`;
      default:
        return `${current}/${required}`;
    }
  };

  const getMilestoneIcon = (milestoneType: string) => {
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

  const MilestoneCard: React.FC<{ milestone: Milestone }> = ({ milestone }) => {
    const playerMilestone = playerMilestones.find(pm => pm.milestone_id === milestone.id);
    const Icon = getMilestoneIcon(milestone.milestone_type);
    const current = playerMilestone?.current_progress || 0;
    const isCompleted = playerMilestone?.is_completed || false;
    const progressPercentage = getProgressPercentage(current, milestone.requirement_value);

    return (
      <Card className={`overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
        theme === 'dark'
          ? 'bg-slate-900/40 border-slate-700/50 backdrop-blur-sm'
          : 'bg-white border-slate-200'
      }`}>
        <CardContent className='p-5'>
          {/* Header */}
          <div className='flex items-start justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center relative ${
                theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'
              }`}>
                <Icon className={`w-6 h-6 ${
                  isCompleted 
                    ? (theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600')
                    : (theme === 'dark' ? 'text-blue-300' : 'text-blue-600')
                }`} />
                {isCompleted && (
                  <div className='absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center'>
                    <CheckCircle className='w-3 h-3 text-white' />
                  </div>
                )}
              </div>
              <div className='flex-1'>
                <h3 className={`font-semibold text-base mb-1 ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
                }`}>
                  {milestone.name}
                </h3>
                <Badge className={`text-xs border-0 ${
                  milestone.category === 'progress' 
                    ? (theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')
                    : milestone.category === 'achievement'
                      ? (theme === 'dark' ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-700')
                      : (theme === 'dark' ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-700')
                }`}>
                  {milestone.category === 'progress' ? 'Tiến độ' : 
                   milestone.category === 'achievement' ? 'Thành tựu' : 'Xã hội'}
                </Badge>
              </div>
            </div>
            
            <div className={`text-right ${
              isCompleted 
                ? (theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600')
                : (theme === 'dark' ? 'text-amber-300' : 'text-amber-600')
            }`}>
              <div className='flex items-center gap-1 text-lg font-bold'>
                <Gift className='w-4 h-4' />
                {isCompleted ? '+' : ''}{milestone.spa_reward}
              </div>
              <div className='text-xs opacity-80'>SPA</div>
            </div>
          </div>

          {/* Description */}
          <p className={`text-sm mb-4 ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {milestone.description}
          </p>

          {/* Progress Section */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <TrendingUp className={`w-4 h-4 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`} />
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {getProgressText(milestone, playerMilestone)}
                </span>
              </div>
              <span className={`text-sm font-bold ${
                isCompleted 
                  ? (theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600')
                  : (theme === 'dark' ? 'text-slate-400' : 'text-slate-500')
              }`}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className={`w-full h-3 rounded-full overflow-hidden ${
              theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-200/70'
            }`}>
              <div 
                className={`h-full transition-all duration-500 ease-out ${
                  isCompleted 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                    : progressPercentage >= 80
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : progressPercentage >= 50
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        : 'bg-gradient-to-r from-slate-500 to-slate-400'
                } rounded-full shadow-sm`}
                style={{ width: `${Math.max(progressPercentage, 2)}%` }}
              />
            </div>
            
            {/* Status */}
            <div className='flex items-center gap-2 text-xs'>
              <Clock className={`w-3 h-3 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`} />
              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
                {isCompleted 
                  ? `Hoàn thành ${playerMilestone?.completed_at ? new Date(playerMilestone.completed_at).toLocaleDateString('vi-VN') : ''}`
                  : progressPercentage > 0 
                    ? 'Đang tiến hành' 
                    : 'Chưa bắt đầu'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const categories = [
    { key: 'progress' as const, label: 'Tiến độ', icon: TrendingUp },
    { key: 'achievement' as const, label: 'Thành tựu', icon: Trophy },
    { key: 'social' as const, label: 'Xã hội', icon: Star },
  ];

  const currentMilestones = milestonesByCategory[selectedCategory];
  
  // Calculate stats for current category
  const stats = {
    total: currentMilestones.length,
    completed: currentMilestones.filter(m => {
      const playerMilestone = playerMilestones.find(pm => pm.milestone_id === m.id);
      return playerMilestone?.is_completed || false;
    }).length,
    inProgress: currentMilestones.filter(m => {
      const playerMilestone = playerMilestones.find(pm => pm.milestone_id === m.id);
      return (playerMilestone?.current_progress || 0) > 0 && !playerMilestone?.is_completed;
    }).length,
    totalSPA: currentMilestones.filter(m => {
      const playerMilestone = playerMilestones.find(pm => pm.milestone_id === m.id);
      return playerMilestone?.is_completed || false;
    }).reduce((sum, m) => sum + m.spa_reward, 0)
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-4 ${
        theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'
      }`}>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-slate-300 rounded w-1/3'></div>
          <div className='grid gap-4'>
            {[...Array(6)].map((_, i) => (
              <div key={i} className='h-32 bg-slate-300 rounded-lg'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 ${
      theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'
    }`}>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-center gap-4 mb-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={onBack}
            className={`${
              theme === 'dark'
                ? 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Quay lại
          </Button>
        </div>
        
        <h1 className={`text-2xl font-bold mb-2 ${
          theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
        }`}>
          Milestone & Thành tựu
        </h1>
        
        {/* Stats for current category */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-6'>
          <Card className={theme === 'dark' ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white border-slate-200'}>
            <CardContent className='p-3 text-center'>
              <div className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
                {stats.total}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Tổng số
              </div>
            </CardContent>
          </Card>
          
          <Card className={theme === 'dark' ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white border-slate-200'}>
            <CardContent className='p-3 text-center'>
              <div className={`text-xl font-bold ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'}`}>
                {stats.completed}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Hoàn thành
              </div>
            </CardContent>
          </Card>
          
          <Card className={theme === 'dark' ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white border-slate-200'}>
            <CardContent className='p-3 text-center'>
              <div className={`text-xl font-bold ${theme === 'dark' ? 'text-amber-300' : 'text-amber-600'}`}>
                {stats.inProgress}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Đang làm
              </div>
            </CardContent>
          </Card>
          
          <Card className={theme === 'dark' ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white border-slate-200'}>
            <CardContent className='p-3 text-center'>
              <div className={`text-xl font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
                {stats.totalSPA}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                SPA kiếm được
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Category Tabs */}
      <div className='flex gap-2 mb-6 overflow-x-auto'>
        {categories.map(category => {
          const isActive = selectedCategory === category.key;
          return (
            <Button
              key={category.key}
              variant={isActive ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setSelectedCategory(category.key)}
              className={`flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? theme === 'dark' 
                    ? 'bg-slate-700 text-slate-100' 
                    : 'bg-slate-900 text-white'
                  : theme === 'dark'
                    ? 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <category.icon className='w-4 h-4' />
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* Milestone Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {currentMilestones.map(milestone => (
          <MilestoneCard key={milestone.id} milestone={milestone} />
        ))}
      </div>

      {currentMilestones.length === 0 && (
        <div className={`text-center py-12 ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <Target className='w-12 h-12 mx-auto mb-4 opacity-50' />
          <p className='text-lg font-medium mb-2'>Đang tải milestone...</p>
          <p className='text-sm'>Hệ thống đang chuẩn bị dữ liệu cho bạn</p>
        </div>
      )}
    </div>
  );
};
