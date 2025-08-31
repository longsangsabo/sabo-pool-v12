import { useState } from 'react';
// Removed supabase import - migrated to services
import { getUserProfile } from "../services/profileService";
import { getMatches } from "../services/matchService";
import { getTournament } from "../services/tournamentService";
import { Match } from '../types/common';

export const useMatches = () => {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 const createMatch = async (
  matchData: Partial<Match>
 ): Promise<Match | null> => {
  setLoading(true);
  setError('');

  try {
   // Mock match creation since the database doesn't have all required fields
   console.log('Mock creating match:', matchData);

   const mockMatch: Match = {
    id: Date.now().toString(),
    player1_id: matchData.player1_id || '',
    player2_id: matchData.player2_id || '',
    winner_id: matchData.winner_id,
    status: 'pending',
    frames: matchData.frames || 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
   };

   return mockMatch;
  } catch (err) {
   console.error('Error creating match:', err);
   setError(err instanceof Error ? err.message : 'Failed to create match');
   return null;
  } finally {
   setLoading(false);
  }
 };

 return {
  loading,
  error,
  createMatch,
 };
};
