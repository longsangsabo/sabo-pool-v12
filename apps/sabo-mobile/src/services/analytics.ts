/**
 * Analytics service for tracking user behavior and app usage
 * Provides insights into user engagement and feature usage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../store/authStore';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

interface UserSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  eventCount: number;
  screens: string[];
  actions: string[];
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private currentSession: UserSession | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private currentUser: User | null = null;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  constructor() {
    this.initializeSession();
    this.setupAutoFlush();
  }

  // Initialize analytics session
  private async initializeSession() {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      sessionId,
      startTime: Date.now(),
      eventCount: 0,
      screens: [],
      actions: [],
    };

    // Restore previous session data if available
    try {
      const savedSession = await AsyncStorage.getItem('analytics_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        console.log('[Analytics] Previous session found:', parsed.sessionId);
      }
    } catch (error) {
      console.warn('[Analytics] Error loading previous session:', error);
    }

    this.trackEvent('session_start', {
      platform: 'mobile',
      app_version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
    });
  }

  // Set current user for analytics
  setUser(user: User | null) {
    this.currentUser = user;
    
    if (user) {
      this.trackEvent('user_identified', {
        user_id: user.id,
        user_role: user.role,
        verified_rank: user.verified_rank,
      });
    } else {
      this.trackEvent('user_logged_out');
    }
  }

  // Track custom events
  trackEvent(event: string, properties?: Record<string, any>) {
    if (!this.currentSession) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: Date.now(),
        platform: 'mobile',
      },
      timestamp: Date.now(),
      userId: this.currentUser?.id,
      sessionId: this.currentSession.sessionId,
    };

    this.eventQueue.push(analyticsEvent);
    this.currentSession.eventCount++;
    this.currentSession.actions.push(event);

    // Log in development
    if (__DEV__) {
      console.log('[Analytics] Event tracked:', event, properties);
    }

    // Auto-flush if queue gets large
    if (this.eventQueue.length >= 50) {
      this.flush();
    }
  }

  // Track screen views
  trackScreen(screenName: string, properties?: Record<string, any>) {
    if (this.currentSession && !this.currentSession.screens.includes(screenName)) {
      this.currentSession.screens.push(screenName);
    }

    this.trackEvent('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  // Track user actions
  trackUserAction(action: string, target?: string, properties?: Record<string, any>) {
    this.trackEvent('user_action', {
      action,
      target,
      ...properties,
    });
  }

  // Track tournament events
  trackTournamentEvent(action: 'view' | 'join' | 'leave' | 'create', tournamentId: string, properties?: Record<string, any>) {
    this.trackEvent('tournament_interaction', {
      action,
      tournament_id: tournamentId,
      ...properties,
    });
  }

  // Track payment events
  trackPaymentEvent(action: 'initiated' | 'completed' | 'failed', amount: number, method: string, properties?: Record<string, any>) {
    this.trackEvent('payment_event', {
      action,
      amount,
      payment_method: method,
      ...properties,
    });
  }

  // Track app performance
  trackPerformance(metric: string, value: number, unit: string = 'ms') {
    this.trackEvent('performance_metric', {
      metric,
      value,
      unit,
    });
  }

  // Track errors and crashes
  trackError(error: Error, context?: Record<string, any>) {
    this.trackEvent('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context,
    });
  }

  // Track feature usage
  trackFeatureUsage(feature: string, action: string, properties?: Record<string, any>) {
    this.trackEvent('feature_usage', {
      feature,
      action,
      ...properties,
    });
  }

  // Track user engagement
  trackEngagement(type: 'app_opened' | 'app_backgrounded' | 'app_closed' | 'session_timeout') {
    this.trackEvent('user_engagement', {
      engagement_type: type,
      session_duration: this.currentSession ? Date.now() - this.currentSession.startTime : 0,
    });
  }

  // Flush events to storage/server
  private async flush() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Save to local storage
      await AsyncStorage.setItem('analytics_events', JSON.stringify(events));
      
      // In production, send to analytics server
      if (!__DEV__) {
        await this.sendToServer(events);
      }

      console.log(`[Analytics] Flushed ${events.length} events`);
    } catch (error) {
      console.warn('[Analytics] Error flushing events:', error);
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
    }
  }

  // Send events to analytics server
  private async sendToServer(events: AnalyticsEvent[]) {
    try {
      // TODO: Replace with actual analytics endpoint
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({ events }),
      });

      if (!response.ok) {
        throw new Error(`Analytics server error: ${response.status}`);
      }
    } catch (error) {
      console.warn('[Analytics] Failed to send events to server:', error);
      throw error;
    }
  }

  // Get auth token for API calls
  private async getAuthToken(): Promise<string | null> {
    try {
      const authData = await AsyncStorage.getItem('auth-storage');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.token || null;
      }
    } catch (error) {
      console.warn('[Analytics] Error getting auth token:', error);
    }
    return null;
  }

  // Setup auto-flush timer
  private setupAutoFlush() {
    // Flush events every 30 seconds
    this.flushTimer = setInterval(() => {
      this.flush();
    }, 30000) as any;
  }

  // End current session
  async endSession() {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      
      this.trackEvent('session_end', {
        session_duration: this.currentSession.endTime - this.currentSession.startTime,
        event_count: this.currentSession.eventCount,
        screens_visited: this.currentSession.screens.length,
      });

      // Save session data
      await AsyncStorage.setItem('analytics_session', JSON.stringify(this.currentSession));
    }

    // Final flush
    await this.flush();
  }

  // Cleanup
  cleanup() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    this.endSession();
  }

  // Get analytics summary
  async getAnalyticsSummary() {
    try {
      const events = await AsyncStorage.getItem('analytics_events');
      const session = await AsyncStorage.getItem('analytics_session');
      
      return {
        events: events ? JSON.parse(events).length : 0,
        currentSession: this.currentSession,
        lastSession: session ? JSON.parse(session) : null,
      };
    } catch (error) {
      console.warn('[Analytics] Error getting summary:', error);
      return null;
    }
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance();

// React hook for analytics
export const useAnalytics = () => {
  const analyticsService = AnalyticsService.getInstance();

  return {
    trackEvent: analyticsService.trackEvent.bind(analyticsService),
    trackScreen: analyticsService.trackScreen.bind(analyticsService),
    trackUserAction: analyticsService.trackUserAction.bind(analyticsService),
    trackTournamentEvent: analyticsService.trackTournamentEvent.bind(analyticsService),
    trackPaymentEvent: analyticsService.trackPaymentEvent.bind(analyticsService),
    trackPerformance: analyticsService.trackPerformance.bind(analyticsService),
    trackFeatureUsage: analyticsService.trackFeatureUsage.bind(analyticsService),
    trackEngagement: analyticsService.trackEngagement.bind(analyticsService),
  };
};
