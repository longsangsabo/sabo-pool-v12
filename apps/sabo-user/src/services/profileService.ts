// Removed supabase import - migrated to services

/**
 * Profile Service - User profile management
 * MEGA BATCH MIGRATION: Centralized profile operations
 */

export const getUserProfile = async (userId: string) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Get user profile failed:', error);
    return { data: null, error: error.message };
  }
};

export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Update user profile failed:', error);
    return { data: null, error: error.message };
  }
};

export const getUserStats = async (userId: string) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Get user stats failed:', error);
    return { data: null, error: error.message };
  }
};

export const updateUserStats = async (userId: string, updates: any) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('user_stats')
      .upsert([{
        user_id: userId,
        ...updates
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Update user stats failed:', error);
    return { data: null, error: error.message };
  }
};

export const searchUsers = async (searchTerm: string, limit: number = 20) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, current_rank')
      .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Search users failed:', error);
    return { data: null, error: error.message };
  }
};

export const getUsersByRank = async (rank: string) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('current_rank', rank)
      .order('elo', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Get users by rank failed:', error);
    return { data: null, error: error.message };
  }
};
