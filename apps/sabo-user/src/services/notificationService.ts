// Removed supabase import - migrated to services

/**
 * Notification Service - Centralized notification operations
 * MEGA BATCH MIGRATION: Handles all notification operations
 */

export const createNotification = async (notificationData: any) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Create notification failed:', error);
    return { data: null, error: error.message };
  }
};

export const getUserNotifications = async (userId: string, limit: number = 50) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Get notifications failed:', error);
    return { data: null, error: error.message };
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Mark notification read failed:', error);
    return { data: null, error: error.message };
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Mark all notifications read failed:', error);
    return { data: null, error: error.message };
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    // TODO: Replace with service call - const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Delete notification failed:', error);
    return { error: error.message };
  }
};

export const getUnreadNotificationCount = async (userId: string) => {
  try {
//     const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return { count: count || 0, error: null };
  } catch (error: any) {
    console.error('Get unread count failed:', error);
    return { count: 0, error: error.message };
  }
};
