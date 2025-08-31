import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// ================================================================================
// UNIFIED NOTIFICATION TYPES & INTERFACES
// ================================================================================

interface NotificationRequest {
  action: 'create' | 'bulk_create' | 'mark_read' | 'mark_all_read' | 'delete' | 'archive';
  notifications?: NotificationData[];
  notification?: NotificationData;
  user_id?: string;
  notification_ids?: string[];
  filters?: NotificationFilters;
}

interface NotificationData {
  user_id: string;
  type: string;
  title: string;
  message: string;
  category?: 'general' | 'challenge' | 'tournament' | 'club' | 'match' | 'system' | 'milestone';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  icon?: string;
  action_text?: string;
  action_url?: string;
  challenge_id?: string;
  tournament_id?: string;
  club_id?: string;
  match_id?: string;
  metadata?: Record<string, any>;
  scheduled_for?: string;
  expires_at?: string;
  auto_popup?: boolean;
}

interface NotificationFilters {
  category?: string;
  type?: string;
  is_read?: boolean;
  priority?: string;
}

// ================================================================================
// NOTIFICATION HANDLER
// ================================================================================

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestData: NotificationRequest = await req.json();
    console.log('🔔 Unified Notification System - Action:', requestData.action);

    let result;
    
    switch (requestData.action) {
      case 'create':
        result = await createNotification(supabase, requestData.notification!);
        break;
        
      case 'bulk_create':
        result = await bulkCreateNotifications(supabase, requestData.notifications!);
        break;
        
      case 'mark_read':
        result = await markNotificationsAsRead(supabase, requestData.notification_ids!, requestData.user_id);
        break;
        
      case 'mark_all_read':
        result = await markAllNotificationsAsRead(supabase, requestData.user_id!);
        break;
        
      case 'delete':
        result = await deleteNotifications(supabase, requestData.notification_ids!, requestData.user_id);
        break;
        
      case 'archive':
        result = await archiveNotifications(supabase, requestData.notification_ids!, requestData.user_id);
        break;
        
      default:
        throw new Error(`Unknown action: ${requestData.action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Unified notification system error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

// ================================================================================
// CORE NOTIFICATION FUNCTIONS
// ================================================================================

async function createNotification(supabase: any, notification: NotificationData) {
  console.log('📤 Creating single notification:', notification.type);

  // Set defaults
  const notificationRecord = {
    ...notification,
    category: notification.category || 'general',
    priority: notification.priority || 'medium',
    icon: notification.icon || 'bell',
    auto_popup: notification.auto_popup || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert([notificationRecord])
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }

  console.log('✅ Notification created with ID:', data.id);
  return {
    success: true,
    notification: data,
    message: 'Notification created successfully'
  };
}

async function bulkCreateNotifications(supabase: any, notifications: NotificationData[]) {
  console.log('📤 Creating bulk notifications:', notifications.length);

  // Set defaults for all notifications
  const notificationRecords = notifications.map(notification => ({
    ...notification,
    category: notification.category || 'general',
    priority: notification.priority || 'medium',
    icon: notification.icon || 'bell',
    auto_popup: notification.auto_popup || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from('notifications')
    .insert(notificationRecords)
    .select();

  if (error) {
    console.error('❌ Error creating bulk notifications:', error);
    throw error;
  }

  console.log('✅ Bulk notifications created:', data.length);
  return {
    success: true,
    notifications: data,
    count: data.length,
    message: `${data.length} notifications created successfully`
  };
}

async function markNotificationsAsRead(supabase: any, notificationIds: string[], userId?: string) {
  console.log('📖 Marking notifications as read:', notificationIds.length);

  let query = supabase
    .from('notifications')
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .in('id', notificationIds);

  // Add user filter if provided for security
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.select();

  if (error) {
    console.error('❌ Error marking notifications as read:', error);
    throw error;
  }

  console.log('✅ Notifications marked as read:', data?.length || 0);
  return {
    success: true,
    updated_count: data?.length || 0,
    message: `${data?.length || 0} notifications marked as read`
  };
}

async function markAllNotificationsAsRead(supabase: any, userId: string) {
  console.log('📖 Marking all notifications as read for user:', userId);

  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false)
    .select();

  if (error) {
    console.error('❌ Error marking all notifications as read:', error);
    throw error;
  }

  console.log('✅ All notifications marked as read:', data?.length || 0);
  return {
    success: true,
    updated_count: data?.length || 0,
    message: `${data?.length || 0} notifications marked as read`
  };
}

async function deleteNotifications(supabase: any, notificationIds: string[], userId?: string) {
  console.log('🗑️ Soft deleting notifications:', notificationIds.length);

  let query = supabase
    .from('notifications')
    .update({ deleted_at: new Date().toISOString() })
    .in('id', notificationIds);

  // Add user filter if provided for security
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.select();

  if (error) {
    console.error('❌ Error deleting notifications:', error);
    throw error;
  }

  console.log('✅ Notifications deleted:', data?.length || 0);
  return {
    success: true,
    deleted_count: data?.length || 0,
    message: `${data?.length || 0} notifications deleted`
  };
}

async function archiveNotifications(supabase: any, notificationIds: string[], userId?: string) {
  console.log('📦 Archiving notifications:', notificationIds.length);

  let query = supabase
    .from('notifications')
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .in('id', notificationIds);

  // Add user filter if provided for security
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.select();

  if (error) {
    console.error('❌ Error archiving notifications:', error);
    throw error;
  }

  console.log('✅ Notifications archived:', data?.length || 0);
  return {
    success: true,
    archived_count: data?.length || 0,
    message: `${data?.length || 0} notifications archived`
  };
}

// ================================================================================
// CHALLENGE NOTIFICATION CREATORS (LEGACY COMPATIBILITY)
// ================================================================================

export async function createChallengeNotification(
  supabase: any,
  type: string,
  userId: string,
  title: string,
  message: string,
  options: {
    priority?: string;
    icon?: string;
    action_text?: string;
    action_url?: string;
    challenge_id?: string;
    metadata?: Record<string, any>;
  } = {}
) {
  const notification: NotificationData = {
    user_id: userId,
    type,
    title,
    message,
    category: 'challenge',
    priority: (options.priority as any) || 'medium',
    icon: options.icon || '⚔️',
    action_text: options.action_text,
    action_url: options.action_url,
    challenge_id: options.challenge_id,
    metadata: options.metadata,
  };

  return createNotification(supabase, notification);
}

export async function createTournamentNotification(
  supabase: any,
  type: string,
  userId: string,
  title: string,
  message: string,
  options: {
    priority?: string;
    icon?: string;
    action_text?: string;
    action_url?: string;
    tournament_id?: string;
    metadata?: Record<string, any>;
  } = {}
) {
  const notification: NotificationData = {
    user_id: userId,
    type,
    title,
    message,
    category: 'tournament',
    priority: (options.priority as any) || 'medium',
    icon: options.icon || '🏆',
    action_text: options.action_text,
    action_url: options.action_url,
    tournament_id: options.tournament_id,
    metadata: options.metadata,
  };

  return createNotification(supabase, notification);
}

export async function createClubNotification(
  supabase: any,
  type: string,
  userId: string,
  title: string,
  message: string,
  options: {
    priority?: string;
    icon?: string;
    action_text?: string;
    action_url?: string;
    club_id?: string;
    metadata?: Record<string, any>;
  } = {}
) {
  const notification: NotificationData = {
    user_id: userId,
    type,
    title,
    message,
    category: 'club',
    priority: (options.priority as any) || 'medium',
    icon: options.icon || '🏢',
    action_text: options.action_text,
    action_url: options.action_url,
    club_id: options.club_id,
    metadata: options.metadata,
  };

  return createNotification(supabase, notification);
}

export async function createSystemNotification(
  supabase: any,
  type: string,
  userId: string,
  title: string,
  message: string,
  options: {
    priority?: string;
    icon?: string;
    action_text?: string;
    action_url?: string;
    metadata?: Record<string, any>;
  } = {}
) {
  const notification: NotificationData = {
    user_id: userId,
    type,
    title,
    message,
    category: 'system',
    priority: (options.priority as any) || 'medium',
    icon: options.icon || '📢',
    action_text: options.action_text,
    action_url: options.action_url,
    metadata: options.metadata,
  };

  return createNotification(supabase, notification);
}

export async function createMilestoneNotification(
  supabase: any,
  type: string,
  userId: string,
  title: string,
  message: string,
  options: {
    priority?: string;
    icon?: string;
    action_text?: string;
    action_url?: string;
    metadata?: Record<string, any>;
  } = {}
) {
  const notification: NotificationData = {
    user_id: userId,
    type,
    title,
    message,
    category: 'milestone',
    priority: (options.priority as any) || 'medium',
    icon: options.icon || '🎯',
    action_text: options.action_text,
    action_url: options.action_url,
    metadata: options.metadata,
  };

  return createNotification(supabase, notification);
}

// ================================================================================
// BULK NOTIFICATION HELPERS
// ================================================================================

export async function notifyClubMembers(
  supabase: any,
  clubId: string,
  notification: Omit<NotificationData, 'user_id' | 'club_id'>
) {
  console.log('📢 Notifying club members for club:', clubId);

  // Get all club members
  const { data: members, error: membersError } = await supabase
    .from('tournament_registrations')
    .select('user_id')
    .eq('club_id', clubId)
    .group('user_id');

  if (membersError) {
    console.error('❌ Error fetching club members:', membersError);
    throw membersError;
  }

  if (!members || members.length === 0) {
    console.log('⚠️ No club members found for club:', clubId);
    return { success: true, count: 0, message: 'No members to notify' };
  }

  // Create notifications for all members
  const notifications: NotificationData[] = members.map(member => ({
    ...notification,
    user_id: member.user_id,
    club_id: clubId,
    category: 'club'
  }));

  return bulkCreateNotifications(supabase, notifications);
}

export async function notifyTournamentParticipants(
  supabase: any,
  tournamentId: string,
  notification: Omit<NotificationData, 'user_id' | 'tournament_id'>
) {
  console.log('🏆 Notifying tournament participants for tournament:', tournamentId);

  // Get all tournament participants
  const { data: participants, error: participantsError } = await supabase
    .from('tournament_registrations')
    .select('user_id')
    .eq('tournament_id', tournamentId);

  if (participantsError) {
    console.error('❌ Error fetching tournament participants:', participantsError);
    throw participantsError;
  }

  if (!participants || participants.length === 0) {
    console.log('⚠️ No tournament participants found for tournament:', tournamentId);
    return { success: true, count: 0, message: 'No participants to notify' };
  }

  // Create notifications for all participants
  const notifications: NotificationData[] = participants.map(participant => ({
    ...notification,
    user_id: participant.user_id,
    tournament_id: tournamentId,
    category: 'tournament'
  }));

  return bulkCreateNotifications(supabase, notifications);
}

// Start the server
serve(handler);
