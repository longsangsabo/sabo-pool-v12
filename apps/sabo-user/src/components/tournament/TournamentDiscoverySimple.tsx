/**
 * Tournament Discovery Simple Component
 * Simplified tournament discovery interface
 */
import React from 'react';

interface TournamentDiscoverySimpleProps {
  filters?: any;
  onTournamentSelect?: (tournament: any) => void;
}

export const TournamentDiscoverySimple: React.FC<TournamentDiscoverySimpleProps> = ({
  filters,
  onTournamentSelect
}) => {
  return (
    <div className="tournament-discovery-simple">
      <h3>Discover Tournaments</h3>
      {/* TODO: Implement tournament discovery */}
    </div>
  );
};

export default TournamentDiscoverySimple;
