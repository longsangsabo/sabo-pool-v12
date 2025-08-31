// Removed supabase import - migrated to services

export const dashboardService = {
  async getUserDashboardData(userId: string) {
    const [profile, stats, tournaments, matches] = await Promise.all([
      profileService.select('*').getById(userId),
      statisticsService.select('*').getByUserId(userId).single(),
      tournamentService.select('*, tournaments(*)').getByUserId(userId).limit(5),
      matchService.select('*').or(`player1_id.eq.${userId},player2_id.eq.${userId}`).limit(10)
    ]);
    
    return {
      profile: profile.data,
      stats: stats.data,
      tournaments: tournaments.data,
      matches: matches.data
    };
  },

  async getClubDashboardData(clubId: string) {
    const [club, members, tournaments, stats] = await Promise.all([
      clubService.select('*').getById(clubId),
      clubService.select('*, profiles(*)').getByClubId(clubId),
      tournamentService.select('*').getByClubId(clubId).limit(5),
// // //       // TODO: Replace with service call - supabase.from('club_stats').select('*').getByClubId(clubId).single()
    ]);
    
    return {
      club: club.data,
      members: members.data,
      tournaments: tournaments.data,
      stats: stats.data
    };
  }
};
