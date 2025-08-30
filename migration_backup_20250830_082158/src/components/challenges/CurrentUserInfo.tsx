import React from 'react';
import { Coins, Trophy } from 'lucide-react';

interface CurrentUserInfoProps {
  currentUserId?: string;
  challengerId?: string;
  opponentId?: string;
  userProfile?: {
    spa_points?: number;
    verified_rank?: string;
    display_name?: string;
  };
}

const CurrentUserInfo: React.FC<CurrentUserInfoProps> = ({
  currentUserId,
  challengerId,
  opponentId,
  userProfile
}) => {
  // Only show if current user is involved in the challenge
  if (!currentUserId || !userProfile || (currentUserId !== challengerId && currentUserId !== opponentId)) {
    return null;
  }

  return (
    <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded-lg p-3 mt-3">
      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
        Thông tin của bạn
      </h4>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {userProfile.verified_rank && (
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-gray-700 dark:text-gray-300">
              Hạng: <span className="font-medium">{userProfile.verified_rank}</span>
            </span>
          </div>
        )}
        {userProfile.spa_points !== undefined && (
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-blue-500" />
            <span className="text-gray-700 dark:text-gray-300">
              SPA: <span className="font-medium">{userProfile.spa_points.toLocaleString()}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentUserInfo;
