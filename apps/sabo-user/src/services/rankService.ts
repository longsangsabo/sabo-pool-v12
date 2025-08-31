// Removed supabase import - migrated to services

export interface DatabaseRankDefinition {
  rank_code: string;
  rank_name: string;
  rank_description: string;
  promotion_requirements: any;
  elo_requirement: number;
  spa_requirement: number;
}

/**
 * Rank Service
 * Centralized service for rank operations
 */

export const getRanks = async () => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('ranks')
      .select('*')
      .order('rank_order');

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Get ranks failed:', error);
    return { data: null, error: error.message };
  }
};

export const createRank = async (rankData: any) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('ranks')
      .insert([rankData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Create rank failed:', error);
    return { data: null, error: error.message };
  }
};

export const updateRank = async (id: string, updates: any) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('ranks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Update rank failed:', error);
    return { data: null, error: error.message };
  }
};

export const deleteRank = async (id: string) => {
  try {
    // TODO: Replace with service call - const { error } = await supabase
      .from('ranks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Delete rank failed:', error);
    return { error: error.message };
  }
};

export const syncRanks = async () => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('ranks')
      .select('*')
      .order('rank_order');

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Sync ranks failed:', error);
    return { data: null, error: error.message };
  }
};
