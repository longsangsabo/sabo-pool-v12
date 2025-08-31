// SABO Pool V12 - Database Relationship Types
// Auto-generated relationship mappings for 74 tables

export interface RelationshipMap {
  // User relationships
  profiles_user_id: 'users';
  user_roles_user_id: 'profiles';
  user_sessions_user_id: 'profiles';
  user_preferences_user_id: 'profiles';
  
  // Challenge relationships
  challenges_challenger_id: 'profiles';
  challenges_opponent_id: 'profiles';
  challenge_participants_challenge_id: 'challenges';
  challenge_participants_user_id: 'profiles';
  
  // Tournament relationships
  tournaments_creator_id: 'profiles';
  tournament_registrations_tournament_id: 'tournaments';
  tournament_registrations_user_id: 'profiles';
  tournament_brackets_tournament_id: 'tournaments';
  tournament_matches_tournament_id: 'tournaments';
  tournament_rounds_tournament_id: 'tournaments';
  
  // Club relationships
  clubs_owner_id: 'profiles';
  club_members_club_id: 'clubs';
  club_members_user_id: 'profiles';
  club_invitations_club_id: 'clubs';
  club_invitations_user_id: 'profiles';
  
  // Wallet & Payment relationships
  wallets_user_id: 'profiles';
  wallet_transactions_wallet_id: 'wallets';
  payment_transactions_user_id: 'profiles';
  payment_methods_user_id: 'profiles';
  
  // Ranking relationships
  ranking_history_user_id: 'profiles';
  elo_history_user_id: 'profiles';
  rank_calculations_user_id: 'profiles';
  
  // Communication relationships
  notifications_user_id: 'profiles';
  messages_sender_id: 'profiles';
  messages_recipient_id: 'profiles';
  conversations_user_id: 'profiles';
  
  // Analytics relationships
  user_activities_user_id: 'profiles';
  analytics_events_user_id: 'profiles';
  
  // Gamification relationships
  achievement_progress_user_id: 'profiles';
  achievement_progress_achievement_id: 'achievements';
  leaderboards_user_id: 'profiles';
  points_history_user_id: 'profiles';
  
  // Game relationships
  game_sessions_user_id: 'profiles';
  game_results_user_id: 'profiles';
  shots_game_session_id: 'game_sessions';
  
  // Venue relationships
  table_bookings_venue_id: 'venues';
  table_bookings_user_id: 'profiles';
  table_bookings_table_id: 'tables';
  
  // Support relationships
  support_tickets_user_id: 'profiles';
}

export type TableName = keyof RelationshipMap | string;
export type RelatedTable<T extends keyof RelationshipMap> = RelationshipMap[T];

// Table categorization
export const TableCategories = {
  USER_MANAGEMENT: ['profiles', 'users', 'user_roles', 'user_preferences', 'user_sessions', 'auth_users', 'auth_sessions', 'auth_refresh_tokens'],
  GAME_ENGINE: ['challenges', 'challenge_participants', 'challenge_types', 'game_sessions', 'game_results', 'shots', 'shot_analysis', 'game_mechanics', 'game_settings'],
  TOURNAMENT_SYSTEM: ['tournaments', 'tournament_types', 'tournament_brackets', 'tournament_registrations', 'tournament_matches', 'tournament_rounds', 'tournament_settings'],
  CLUB_MANAGEMENT: ['clubs', 'club_members', 'club_roles', 'club_settings', 'club_invitations', 'club_activities'],
  PAYMENT_WALLET: ['wallets', 'wallet_transactions', 'payment_transactions', 'payment_methods', 'billing_history', 'invoices'],
  RANKING_ELO: ['ranks', 'rank_requirements', 'ranking_history', 'rank_calculations', 'elo_history'],
  COMMUNICATION: ['notifications', 'notification_templates', 'notification_settings', 'messages', 'conversations', 'communication_channels'],
  ANALYTICS: ['system_events', 'analytics_events', 'user_activities', 'performance_metrics', 'usage_statistics'],
  GAMIFICATION: ['achievements', 'achievement_progress', 'leaderboards', 'rewards', 'badges', 'points_history'],
  SYSTEM_CONFIG: ['settings', 'system_config', 'feature_flags', 'maintenance_logs', 'audit_logs'],
  CONTENT_MANAGEMENT: ['news', 'announcements', 'tutorials', 'media_files', 'file_uploads'],
  VENUE_MANAGEMENT: ['venues', 'tables', 'table_bookings'],
  SUPPORT_SYSTEM: ['support_tickets', 'faq', 'help_articles']
} as const;

export type TableCategory = keyof typeof TableCategories;
