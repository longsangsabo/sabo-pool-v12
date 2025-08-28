/**
 * Optimized Rewards Section Component
 * Displays tournament rewards and prizes
 */
import React from 'react';

interface OptimizedRewardsSectionProps {
  tournament?: any;
  rewards?: any[];
  showDetails?: boolean;
}

export const OptimizedRewardsSection: React.FC<OptimizedRewardsSectionProps> = ({
  tournament,
  rewards = [],
  showDetails = true
}) => {
  return (
    <div className="optimized-rewards-section">
      <h3>Tournament Rewards</h3>
      <div className="rewards-grid">
        {rewards.map((reward, index) => (
          <div key={index} className="reward-item">
            <span className="position">#{reward.position}</span>
            <span className="prize">${reward.prize}</span>
          </div>
        ))}
      </div>
      {showDetails && (
        <div className="reward-details">
          <p>Total Prize Pool: ${tournament?.prize_pool || 0}</p>
        </div>
      )}
    </div>
  );
};

export default OptimizedRewardsSection;
