/**
 * Error tracking and monitoring service using Sentry
 * Provides comprehensive error reporting and performance monitoring
 */

import * as Sentry from '@sentry/react-native';
import { User } from '../store/authStore';

export class ErrorTrackingService {
  private static initialized = false;

  static initialize() {
    if (this.initialized) return;

    Sentry.init({
      dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
      environment: __DEV__ ? 'development' : 'production',
      debug: __DEV__,
      
      // Performance monitoring
      tracesSampleRate: __DEV__ ? 1.0 : 0.2,
      
      // Release tracking
      release: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
      
      // Additional configuration
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
      
      beforeSend(event) {
        // Filter out development errors in production
        if (!__DEV__ && event.environment === 'development') {
          return null;
        }
        
        // Add custom context
        event.contexts = {
          ...event.contexts,
          app: {
            platform: 'mobile',
            framework: 'react-native-expo',
          }
        };
        
        return event;
      },
    });

    this.initialized = true;
    console.log('[ErrorTracking] Sentry initialized');
  }

  // Set user context for error tracking
  static setUser(user: User | null) {
    Sentry.setUser(user ? {
      id: user.id,
      email: user.email,
      username: user.username,
    } : null);
  }

  // Log custom events
  static logEvent(event: string, data?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message: event,
      data,
      level: 'info',
    });
  }

  // Track navigation events
  static trackNavigation(screenName: string, previousScreen?: string) {
    Sentry.addBreadcrumb({
      message: 'Navigation',
      data: {
        to: screenName,
        from: previousScreen,
      },
      category: 'navigation',
      level: 'info',
    });
  }

  // Track API calls
  static trackAPICall(endpoint: string, method: string, statusCode: number, responseTime: number) {
    Sentry.addBreadcrumb({
      message: 'API Call',
      data: {
        endpoint,
        method,
        statusCode,
        responseTime,
      },
      category: 'http',
      level: statusCode >= 400 ? 'error' : 'info',
    });
  }

  // Capture exceptions with context
  static captureException(error: Error, context?: Record<string, any>) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.keys(context).forEach(key => {
          scope.setContext(key, context[key]);
        });
      }
      
      Sentry.captureException(error);
    });
  }

  // Capture messages
  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    Sentry.captureMessage(message, level);
  }

  // Performance monitoring
  static startTransaction(name: string, operation: string) {
    return Sentry.startSpan({
      name,
      op: operation,
    }, () => {});
  }

  // Custom performance tracking
  static trackPerformance(name: string, operation: () => Promise<any>) {
    return Sentry.startSpan({
      name,
      op: 'custom',
    }, async () => {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        Sentry.captureException(error);
        throw error;
      }
    });
  }

  // Memory usage tracking
  static trackMemoryUsage() {
    if (typeof global !== 'undefined' && (global as any).performance?.memory) {
      const memory = (global as any).performance.memory;
      
      Sentry.addBreadcrumb({
        message: 'Memory Usage',
        data: {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usagePercentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        },
        category: 'performance',
        level: 'info',
      });
    }
  }

  // Bundle size tracking
  static trackBundleMetrics() {
    Sentry.addBreadcrumb({
      message: 'Bundle Metrics',
      data: {
        platform: 'mobile',
        timestamp: new Date().toISOString(),
      },
      category: 'bundle',
      level: 'info',
    });
  }
}

// React hook for error boundary
export const useErrorTracking = () => {
  const trackError = (error: Error, context?: Record<string, any>) => {
    ErrorTrackingService.captureException(error, context);
  };

  const trackEvent = (event: string, data?: Record<string, any>) => {
    ErrorTrackingService.logEvent(event, data);
  };

  const trackPerformance = (name: string, operation: () => Promise<any>) => {
    return ErrorTrackingService.trackPerformance(name, operation);
  };

  return {
    trackError,
    trackEvent,
    trackPerformance,
  };
};

// Initialize error tracking
if (!__DEV__ || process.env.EXPO_PUBLIC_ENABLE_SENTRY === 'true') {
  ErrorTrackingService.initialize();
}
