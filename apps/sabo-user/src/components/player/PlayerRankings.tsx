import React from 'react';
import { clsx } from 'clsx';

interface PlayerRankingsProps {
  limit?: number;
  showStats?: boolean;
  className?: string;
}

const PlayerRankings: React.FC<PlayerRankingsProps> = ({
  limit = 10,
  showStats = true,
  className
}) => {
  return (
    <div className={clsx('player-rankings bg-white rounded-lg p-6', className)}>
      <h3 className="text-xl font-bold mb-4">Player Rankings</h3>
      <div className="text-gray-500">
        Player rankings component will be implemented here.
        <br />
        Showing top {limit} players
        <br />
        Stats: {showStats ? 'Enabled' : 'Disabled'}
      </div>
    </div>
  );
};

export default PlayerRankings;
