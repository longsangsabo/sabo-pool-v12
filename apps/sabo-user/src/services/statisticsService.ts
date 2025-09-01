// Removed supabase import - migrated to services

export const statisticsService = {
  async getPlayerStats(userId: string) {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async updatePlayerStats(userId: string, stats: any) {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('player_stats')
      .upsert({ user_id: userId, ...stats })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getClubStats(clubId: string) {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('club_stats')
      .select('*')
      .eq('club_id', clubId)
      .single();
    if (error) throw error;
    return data;
  },

  async getTournamentStats(tournamentId: string) {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('tournament_stats')
      .select('*')
      .eq('tournament_id', tournamentId)
      .single();
    if (error) throw error;
    return data;
  }
};
