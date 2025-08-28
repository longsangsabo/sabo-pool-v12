/**
 * Tournament Rewards Sync Component
 * Admin tool for syncing tournament rewards
 */
import React from 'react';

interface TournamentRewardsSyncProps {
  tournamentId?: string;
  autoSync?: boolean;
}

export const TournamentRewardsSync: React.FC<TournamentRewardsSyncProps> = ({
  tournamentId,
  autoSync = false
}) => {
  return (
    <div className="tournament-rewards-sync">
      <h3>Tournament Rewards Sync</h3>
      <p>Tournament ID: {tournamentId}</p>
      <p>Auto Sync: {autoSync ? 'Enabled' : 'Disabled'}</p>
      {/* TODO: Implement tournament rewards sync */}
    </div>
  );
};

export default TournamentRewardsSync;
