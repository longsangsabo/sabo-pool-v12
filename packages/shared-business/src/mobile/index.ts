/**
 * MOBILE SERVICES INDEX
 * 
 * Exports all mobile-specific services for React Native and mobile web apps
 */

// Offline Data Management
export { default as OfflineDataService } from './OfflineDataService';
export type {
  OfflineDataEntry,
  SyncResult,
  DataCollection,
  OfflineConfig
} from './OfflineDataService';

// Push Notifications
export { default as NotificationService } from './NotificationService';
export type {
  NotificationChannel,
  Notification,
  NotificationAction,
  PushToken,
  NotificationPreferences,
  NotificationStats
} from './NotificationService';

// Real-time Communication
export { default as WebSocketService } from './WebSocketService';
export type {
  WebSocketMessage,
  WebSocketSubscription,
  ConnectionConfig,
  ConnectionState
} from './WebSocketService';

// Re-export services with their classes
import OfflineDataServiceClass from './OfflineDataService';
import NotificationServiceClass from './NotificationService';
import WebSocketServiceClass from './WebSocketService';

// Mobile-Optimized Service Exports
export const MobileServices = {
  OfflineDataService: OfflineDataServiceClass,
  NotificationService: NotificationServiceClass,
  WebSocketService: WebSocketServiceClass
} as const;
