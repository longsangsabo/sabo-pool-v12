import { useState, useEffect } from 'react';
import { getRanks, createRank, updateRank, deleteRank } from '../services/rankService';
import { toast } from '@/hooks/use-toast';

export const useRankDefinitions = () => {
  const [ranks, setRanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRanks = async () => {
    try {
      setLoading(true);
      const { data, error } = await getRanks();

      if (error) throw new Error(error);
      setRanks(data || []);
    } catch (error) {
      console.error('Error fetching ranks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch ranks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createRankDefinition = async (rankData: any) => {
    try {
      const { data, error } = await createRank(rankData);

      if (error) throw new Error(error);

      setRanks(prev => [...prev, data]);
      toast({
        title: 'Success',
        description: 'Rank created successfully',
      });
    } catch (error) {
      console.error('Error creating rank:', error);
      toast({
        title: 'Error',
        description: 'Failed to create rank',
        variant: 'destructive',
      });
    }
  };

  const updateRankDefinition = async (id: string, rankData: any) => {
    try {
      const { data, error } = await updateRank(id, rankData);

      if (error) throw new Error(error);

      setRanks(prev =>
        prev.map(rank => (rank.id === id ? data?.[0] || rank : rank))
      );

      toast({
        title: 'Success',
        description: 'Rank updated successfully',
      });
    } catch (error) {
      console.error('Error updating rank:', error);
      toast({
        title: 'Error',
        description: 'Failed to update rank',
        variant: 'destructive',
      });
    }
  };

  const deleteRankDefinition = async (id: string) => {
    try {
      const { error } = await deleteRank(id);

      if (error) throw new Error(error);

      setRanks(prev => prev.filter(rank => rank.id !== id));
      toast({
        title: 'Success',
        description: 'Rank deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting rank:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete rank',
        variant: 'destructive',
      });
    }
  };

  const reorderRanks = async (id: string, newOrder: number) => {
    try {
      // First, update the target rank's order
      const { error } = await updateRank(id, { rank_order: newOrder });

      if (error) throw new Error(error);

      // Refresh the list to get updated order
      await fetchRanks();

      toast({
        title: 'Success',
        description: 'Rank order updated successfully',
      });
    } catch (error) {
      console.error('Error reordering ranks:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder ranks',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchRanks();
  }, []);

  return {
    ranks,
    loading,
    createRank: createRankDefinition,
    updateRank: updateRankDefinition,
    deleteRank: deleteRankDefinition,
    reorderRanks,
    refetch: fetchRanks,
  };
};
