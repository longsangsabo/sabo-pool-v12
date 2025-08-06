/**
 * Bracket Management Hook
 * Extracted bracket-related state management from TournamentManagementHub.tsx
 * Phase 1 - Step 1.4 of refactoring process
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { TournamentManagementService } from '@/services/tournament-management.service';
import type {
  Player,
  BracketMatch,
  BracketType,
  UseBracketManagementReturn,
} from '@/types/tournament-management';

export const useBracketManagement = (): UseBracketManagementReturn => {
  // Bracket Generation State
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [tournamentSize, setTournamentSize] = useState<number>(8);
  const [bracketType, setBracketType] = useState<BracketType>('single_elimination');
  const [generatedBracket, setGeneratedBracket] = useState<BracketMatch[]>([]);
  const [loading, setLoading] = useState(false);

  // Load tournament participants for bracket generation
  const loadTournamentParticipants = useCallback(async (tournamentId: string) => {
    try {
      setLoading(true);
      const participants = await TournamentManagementService.fetchTournamentParticipants(tournamentId);
      setAvailablePlayers(participants);
      setSelectedPlayers(participants); // Auto-select all participants
    } catch (error) {
      console.error('Error loading tournament participants:', error);
      toast.error('Failed to load tournament participants');
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate random bracket
  const generateRandomBracket = useCallback(async () => {
    if (selectedPlayers.length < 2) {
      toast.error('Cần ít nhất 2 người chơi để tạo bảng đấu');
      return;
    }

    try {
      setLoading(true);
      const matches = TournamentManagementService.generateRandomBracket(selectedPlayers);
      setGeneratedBracket(matches);
      toast.success('Đã tạo bảng đấu ngẫu nhiên thành công!');
    } catch (error) {
      console.error('Error generating random bracket:', error);
      toast.error('Lỗi khi tạo bảng đấu ngẫu nhiên');
    } finally {
      setLoading(false);
    }
  }, [selectedPlayers]);

  // Generate seeded bracket based on ELO
  const generateSeededBracket = useCallback(async () => {
    if (selectedPlayers.length < 2) {
      toast.error('Cần ít nhất 2 người chơi để tạo bảng đấu');
      return;
    }

    try {
      setLoading(true);
      const matches = TournamentManagementService.generateSeededBracket(selectedPlayers);
      setGeneratedBracket(matches);
      toast.success('Đã tạo bảng đấu theo seeding thành công!');
    } catch (error) {
      console.error('Error generating seeded bracket:', error);
      toast.error('Lỗi khi tạo bảng đấu theo seeding');
    } finally {
      setLoading(false);
    }
  }, [selectedPlayers]);

  // Save bracket to tournament
  const saveBracketToTournament = useCallback(async (tournamentId: string): Promise<boolean> => {
    if (generatedBracket.length === 0) {
      toast.error('Vui lòng tạo bảng đấu trước khi lưu');
      return false;
    }

    try {
      setLoading(true);
      const result = await TournamentManagementService.saveBracketToTournament(
        tournamentId,
        generatedBracket
      );

      if (result.success) {
        toast.success('Đã lưu bảng đấu thành công!');
        setGeneratedBracket([]); // Clear generated bracket after saving
        return true;
      } else {
        toast.error(result.error || 'Lỗi khi lưu bảng đấu');
        return false;
      }
    } catch (error) {
      console.error('Error saving bracket:', error);
      toast.error('Lỗi khi lưu bảng đấu');
      return false;
    } finally {
      setLoading(false);
    }
  }, [generatedBracket]);

  // Load all available players
  const loadAvailablePlayers = useCallback(async () => {
    try {
      setLoading(true);
      const players = await TournamentManagementService.fetchAvailablePlayers();
      setAvailablePlayers(players);
    } catch (error) {
      console.error('Error loading available players:', error);
      toast.error('Failed to load available players');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    availablePlayers,
    selectedPlayers,
    tournamentSize,
    bracketType,
    generatedBracket,
    loading,
    setSelectedPlayers,
    setTournamentSize,
    setBracketType,
    generateRandomBracket,
    generateSeededBracket,
    saveBracketToTournament,
    loadTournamentParticipants,
    loadAvailablePlayers,
  };
};
