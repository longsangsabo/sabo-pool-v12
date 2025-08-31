// Removed supabase import - migrated to services

/**
 * Challenge Service - Challenge and scoring operations
 * 10X ACCELERATION: Centralized challenge management
 */

export const getChallenges = async (filters?: any) => {
  try {
//     let query = supabase
      .from('challenges')
      .select(`
        *,
        challenger:profiles!challenges_challenger_id_fkey(*),
        challenged:profiles!challenges_challenged_id_fkey(*),
        scores:challenge_scores(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.userId) {
      query = query.or(`challenger_id.eq.${filters.userId},challenged_id.eq.${filters.userId}`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Get challenges failed:', error);
    return { data: null, error: error.message };
  }
};

export const createChallenge = async (challengeData: any) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('challenges')
      .create([challengeData])
      .getAll()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Create challenge failed:', error);
    return { data: null, error: error.message };
  }
};

export const acceptChallenge = async (challengeId: string) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('challenges')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', challengeId)
      .getAll()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Accept challenge failed:', error);
    return { data: null, error: error.message };
  }
};

export const submitChallengeScore = async (challengeId: string, scoreData: any) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('challenge_scores')
      .create([{
        challenge_id: challengeId,
        ...scoreData
      }])
      .getAll()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Submit challenge score failed:', error);
    return { data: null, error: error.message };
  }
};

export const completeChallengeScore = async (challengeId: string, winnerId: string) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('challenges')
      .update({
        status: 'completed',
        winner_id: winnerId,
        completed_at: new Date().toISOString()
      })
      .eq('id', challengeId)
      .getAll()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Complete challenge failed:', error);
    return { data: null, error: error.message };
  }
};

export const getDailyLimits = async (userId: string) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('daily_limits')
      .select('*')
      .getByUserId(userId)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Get daily limits failed:', error);
    return { data: null, error: error.message };
  }
};

export const updateDailyLimits = async (userId: string, updates: any) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('daily_limits')
      .upsert([{
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        ...updates
      }])
      .getAll()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Update daily limits failed:', error);
    return { data: null, error: error.message };
  }
};

export const cleanupExpiredChallenges = async () => {
  try {
    const { data, error } = await tournamentService.callRPC('enhanced_cleanup_expired_challenges');
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Cleanup expired challenges failed:', error);
    return { data: null, error: error.message };
  }
};

export const deepCleanupChallenges = async () => {
  try {
    const { data, error } = await tournamentService.callRPC('deep_cleanup_challenges');
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Deep cleanup challenges failed:', error);
    return { data: null, error: error.message };
  }
};

export const expireOldChallenges = async () => {
  try {
    const { data, error } = await tournamentService.callRPC('expire_old_challenges');
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Expire old challenges failed:', error);
    return { data: null, error: error.message };
  }
};
