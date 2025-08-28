import React from 'react';
import { clsx } from 'clsx';
import { 
  Trophy, 
  Medal, 
  Star, 
  Crown, 
  Award, 
  Target, 
  Zap, 
  Shield,
  Lock,
  CheckCircle
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'wins' | 'tournaments' | 'skills' | 'social' | 'special';
  points: number;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  unlockCondition: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  backgroundColor: string;
  borderColor: string;
  unlocked: boolean;
  displayOrder: number;
}

interface AchievementSystemProps {
  achievements: Achievement[];
  badges: Badge[];
  totalPoints: number;
  playerLevel: number;
  showProgress?: boolean;
  showLockedAchievements?: boolean;
  onAchievementClick?: (achievement: Achievement) => void;
  className?: string;
}

export const AchievementSystem: React.FC<AchievementSystemProps> = ({
  achievements,
  badges,
  totalPoints,
  playerLevel,
  showProgress = true,
  showLockedAchievements = true,
  onAchievementClick,
  className
}) => {
  const categories = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'wins', name: 'Victories', icon: Trophy },
    { id: 'tournaments', name: 'Tournaments', icon: Crown },
    { id: 'skills', name: 'Skills', icon: Target },
    { id: 'social', name: 'Social', icon: Star },
    { id: 'special', name: 'Special', icon: Medal }
  ];

  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return {
          bg: 'bg-gradient-to-br from-yellow-100 to-orange-100',
          border: 'border-yellow-400',
          glow: 'shadow-yellow-200',
          text: 'text-yellow-700'
        };
      case 'epic':
        return {
          bg: 'bg-gradient-to-br from-purple-100 to-pink-100',
          border: 'border-purple-400',
          glow: 'shadow-purple-200',
          text: 'text-purple-700'
        };
      case 'rare':
        return {
          bg: 'bg-gradient-to-br from-blue-100 to-cyan-100',
          border: 'border-blue-400',
          glow: 'shadow-blue-200',
          text: 'text-blue-700'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-100 to-gray-200',
          border: 'border-gray-300',
          glow: 'shadow-gray-200',
          text: 'text-gray-700'
        };
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory === 'all') return true;
    return achievement.category === selectedCategory;
  }).filter(achievement => {
    if (!showLockedAchievements) return achievement.unlocked;
    return true;
  });

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const unlockedBadges = badges.filter(b => b.unlocked).sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {unlockedAchievements.length}
            </div>
            <div className="text-sm text-gray-600">Achievements</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {totalPoints.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {unlockedBadges.length}
            </div>
            <div className="text-sm text-gray-600">Badges</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {playerLevel}
            </div>
            <div className="text-sm text-gray-600">Level</div>
          </div>
        </div>
      </div>

      {/* Badges Showcase */}
      {unlockedBadges.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Badges</h3>
          <div className="flex flex-wrap gap-3">
            {unlockedBadges.map((badge) => {
              const BadgeIcon = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={clsx(
                    'flex items-center space-x-2 px-3 py-2 rounded-full border-2',
                    badge.backgroundColor,
                    badge.borderColor
                  )}
                  title={badge.description}
                >
                  <BadgeIcon className={clsx('w-4 h-4', badge.color)} />
                  <span className={clsx('text-sm font-semibold', badge.color)}>
                    {badge.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievement Categories */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Achievements</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Trophy className="w-4 h-4" />
            <span>{unlockedAchievements.length} / {achievements.length} Unlocked</span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => {
            const CategoryIcon = category.icon;
            const count = category.id === 'all' 
              ? achievements.length 
              : achievements.filter(a => a.category === category.id).length;
              
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={clsx(
                  'flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors',
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                )}
              >
                <CategoryIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{category.name}</span>
                <span className="text-xs opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => {
            const AchievementIcon = achievement.icon;
            const rarityConfig = getRarityConfig(achievement.rarity);
            const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

            return (
              <div
                key={achievement.id}
                onClick={() => onAchievementClick?.(achievement)}
                className={clsx(
                  'relative p-4 rounded-lg border-2 transition-all cursor-pointer',
                  achievement.unlocked 
                    ? `${rarityConfig.bg} ${rarityConfig.border} shadow-lg ${rarityConfig.glow}`
                    : 'bg-gray-50 border-gray-200 opacity-75',
                  'hover:scale-105'
                )}
              >
                {/* Rarity Indicator */}
                {achievement.unlocked && achievement.rarity !== 'common' && (
                  <div className="absolute top-2 right-2">
                    {achievement.rarity === 'legendary' && <Crown className="w-5 h-5 text-yellow-500" />}
                    {achievement.rarity === 'epic' && <Star className="w-5 h-5 text-purple-500" />}
                    {achievement.rarity === 'rare' && <Medal className="w-5 h-5 text-blue-500" />}
                  </div>
                )}

                {/* Achievement Icon */}
                <div className={clsx(
                  'w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto',
                  achievement.unlocked 
                    ? rarityConfig.bg 
                    : 'bg-gray-200'
                )}>
                  {achievement.unlocked ? (
                    <AchievementIcon className={clsx('w-6 h-6', rarityConfig.text)} />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-500" />
                  )}
                </div>

                {/* Achievement Info */}
                <div className="text-center space-y-2">
                  <h4 className={clsx(
                    'font-semibold',
                    achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                  )}>
                    {achievement.name}
                  </h4>
                  
                  <p className={clsx(
                    'text-sm',
                    achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                  )}>
                    {achievement.description}
                  </p>

                  {/* Progress Bar */}
                  {showProgress && !achievement.unlocked && (
                    <div className="space-y-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        {achievement.progress} / {achievement.maxProgress}
                      </div>
                    </div>
                  )}

                  {/* Points */}
                  <div className={clsx(
                    'text-sm font-semibold',
                    achievement.unlocked ? 'text-blue-600' : 'text-gray-400'
                  )}>
                    {achievement.points} points
                  </div>

                  {/* Unlock Date */}
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                      <CheckCircle className="w-3 h-3" />
                      <span>
                        {achievement.unlockedAt.toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Unlock Condition */}
                  {!achievement.unlocked && (
                    <div className="text-xs text-gray-500 italic">
                      {achievement.unlockCondition}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No achievements found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};
