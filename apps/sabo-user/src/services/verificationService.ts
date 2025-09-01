// Removed supabase import - migrated to services

/**
 * Verification Service - Rank verification and requests
 * 10X ACCELERATION: Centralized verification operations
 */

export const submitRankVerificationRequest = async (requestData: any) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('rank_verification_requests')
      .insert([requestData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Submit rank verification failed:', error);
    return { data: null, error: error.message };
  }
};

export const getRankVerificationRequests = async (userId?: string) => {
  try {
//     let query = supabase
      .from('rank_verification_requests')
      .select(`
        *,
        profiles:profiles(*),
        ranks:ranks(*)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Get rank verification requests failed:', error);
    return { data: null, error: error.message };
  }
};

export const updateVerificationRequest = async (requestId: string, updates: any) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('rank_verification_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Update verification request failed:', error);
    return { data: null, error: error.message };
  }
};

export const approveVerificationRequest = async (requestId: string, approvedBy: string) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('rank_verification_requests')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Approve verification request failed:', error);
    return { data: null, error: error.message };
  }
};

export const rejectVerificationRequest = async (requestId: string, rejectedBy: string, reason?: string) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('rank_verification_requests')
      .update({
        status: 'rejected',
        rejected_by: rejectedBy,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Reject verification request failed:', error);
    return { data: null, error: error.message };
  }
};
