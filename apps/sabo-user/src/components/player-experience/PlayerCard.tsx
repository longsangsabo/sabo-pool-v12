import React from 'react';
import { clsx } from 'clsx';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Award, 
  Star, 
  Users, 
  Calendar,
  Zap,
  Medal,
  Crown
} from 'lucide-react';

interface PlayerStats {
  wins: number;
  losses: number;
  totalMatches: number;
  winRate: number;
  ranking: number;
  points: number;
  tournamentsWon: number;
  currentStreak: number;
  bestStreak: number;
  level: number;
  experience: number;
  nextLevelExperience: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    avatar?: string;
    title?: string;
    level: number;
    verified?: boolean;
  };
  stats: PlayerStats;
  achievements: Achievement[];
  variant?: 'compact' | 'full' | 'detailed';
  showStats?: boolean;
  showAchievements?: boolean;
  onViewProfile?: () => void;
  onChallenge?: () => void;
  className?: string;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  stats,
  achievements,
  variant = 'full',
  showStats = true,
  showAchievements = true,
  onViewProfile,
  onChallenge,
  className
}) => {
  const variantClasses = {
    compact: 'p-4',
    full: 'p-6',
    detailed: 'p-8'
  };

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'text-purple-600 bg-purple-100';
    if (level >= 30) return 'text-blue-600 bg-blue-100';
    if (level >= 15) return 'text-green-600 bg-green-100';
    if (level >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getRankingBadge = (ranking: number) => {
    if (ranking <= 3) return { icon: Crown, color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (ranking <= 10) return { icon: Medal, color: 'text-blue-600', bg: 'bg-blue-100' };
    if (ranking <= 50) return { icon: Award, color: 'text-green-600', bg: 'bg-green-100' };
    return { icon: Star, color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const getExperienceProgress = () => {
    return ((stats.experience - (stats.level - 1) * 1000) / 1000) * 100;
  };

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const rankingBadge = getRankingBadge(stats.ranking);
  const RankingIcon = rankingBadge.icon;

  return (
    <div className={clsx(
      'bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden',
      variantClasses[variant],
      className
    )}>
      {/* Header */}
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="relative">
          {player.avatar ? (
            <img 
              src={player.avatar} 
              alt={player.name}
              className={clsx(
                'rounded-full object-cover border-4 border-white shadow-lg',
                variant === 'compact' ? 'w-12 h-12' : 
                variant === 'full' ? 'w-16 h-16' : 'w-20 h-20'
              )}
            />
          ) : (
            <div className={clsx(
              'bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg',
              variant === 'compact' ? 'w-12 h-12 text-lg' : 
              variant === 'full' ? 'w-16 h-16 text-xl' : 'w-20 h-20 text-2xl'
            )}>
              {player.name.charAt(0).toUpperCase()}
            </div>
          )}
          
          {/* Level Badge */}
          <div className={clsx(
            'absolute -bottom-1 -right-1 rounded-full px-2 py-1 text-xs font-bold border-2 border-white shadow-sm',
            getLevelColor(player.level)
          )}>
            {player.level}
          </div>
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className={clsx(
              'font-bold text-gray-900 truncate',
              variant === 'compact' ? 'text-base' : 
              variant === 'full' ? 'text-lg' : 'text-xl'
            )}>
              {player.name}
            </h3>
            {player.verified && (
              <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          {player.title && (
            <p className="text-sm text-gray-600 font-medium">
              {player.title}
            </p>
          )}
          
          {/* Ranking */}
          <div className="flex items-center space-x-2 mt-1">
            <div className={clsx(
              'flex items-center space-x-1 px-2 py-1 rounded-full',
              rankingBadge.bg
            )}>
              <RankingIcon className={clsx('w-3 h-3', rankingBadge.color)} />
              <span className={clsx('text-xs font-semibold', rankingBadge.color)}>
                #{stats.ranking}
              </span>
            </div>
            
            {variant !== 'compact' && (
              <div className="text-sm text-gray-600">
                {stats.points.toLocaleString()} pts
              </div>
            )}
          </div>

          {/* Experience Bar */}
          {variant === 'detailed' && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Level {player.level}</span>
                <span>{stats.experience}/{stats.nextLevelExperience} XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getExperienceProgress()}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {showStats && variant !== 'compact' && (
        <div className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.wins}
              </div>
              <div className="text-xs text-gray-600">Wins</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.losses}
              </div>
              <div className="text-xs text-gray-600">Losses</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(stats.winRate)}%
              </div>
              <div className="text-xs text-gray-600">Win Rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.tournamentsWon}
              </div>
              <div className="text-xs text-gray-600">Tournaments</div>
            </div>
          </div>

          {variant === 'detailed' && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <Zap className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="font-semibold text-gray-900">
                    {stats.currentStreak} games
                  </div>
                  <div className="text-xs text-gray-600">Current Streak</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-semibold text-gray-900">
                    {stats.bestStreak} games
                  </div>
                  <div className="text-xs text-gray-600">Best Streak</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Achievements */}
      {showAchievements && variant !== 'compact' && unlockedAchievements.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Recent Achievements
          </h4>
          <div className="flex space-x-2 overflow-x-auto">
            {unlockedAchievements.slice(0, variant === 'detailed' ? 6 : 4).map((achievement) => {
              const rarityColors = {
                common: 'border-gray-300 bg-gray-100',
                rare: 'border-blue-300 bg-blue-100',
                epic: 'border-purple-300 bg-purple-100',
                legendary: 'border-yellow-300 bg-yellow-100'
              };
              
              return (
                <div
                  key={achievement.id}
                  className={clsx(
                    'flex-shrink-0 w-12 h-12 rounded-lg border-2 flex items-center justify-center',
                    rarityColors[achievement.rarity]
                  )}
                  title={`${achievement.name}: ${achievement.description}`}
                >
                  <achievement.icon className="w-6 h-6 text-gray-700" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {(onViewProfile || onChallenge) && variant !== 'compact' && (
        <div className="mt-6 flex space-x-3">
          {onViewProfile && (
            <button
              onClick={onViewProfile}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              View Profile
            </button>
          )}
          {onChallenge && (
            <button
              onClick={onChallenge}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Challenge
            </button>
          )}
        </div>
      )}
    </div>
  );
};
