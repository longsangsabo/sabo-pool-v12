// Deprecated integration hook – all milestone triggers removed
export const useSPAIntegration = () => ({
  onGameComplete: async () => {},
  onTournamentJoin: async () => {},
  onRankRegistration: async () => {},
  onReferralSuccess: async () => {},
  awardBonus: async () => false,
});
