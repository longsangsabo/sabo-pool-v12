// Removed supabase import - migrated to services

export const rankingService = {
  async getAllRankings() {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .order('points', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getUserRanking(userId: string) {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async updateUserRanking(userId: string, points: number) {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('rankings')
      .upsert({ user_id: userId, points })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getTopPlayers(limit = 10) {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('rankings')
      .select('*, profiles(*)')
      .order('points', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async getClubRankings(clubId: string) {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('rankings')
      .select('*, profiles(*)')
      .eq('club_id', clubId)
      .order('points', { ascending: false });
    if (error) throw error;
    return data;
  }
};
