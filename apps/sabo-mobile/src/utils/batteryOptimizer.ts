/**
 * Battery optimization utilities for mobile app
 * Reduces battery drain through smart resource management
 */

import { AppState, AppStateStatus } from 'react-native';

export class BatteryOptimizer {
  private static instance: BatteryOptimizer;
  private backgroundTimers: Set<NodeJS.Timeout> = new Set();
  private currentAppState: AppStateStatus = AppState.currentState;
  
  static getInstance(): BatteryOptimizer {
    if (!BatteryOptimizer.instance) {
      BatteryOptimizer.instance = new BatteryOptimizer();
    }
    return BatteryOptimizer.instance;
  }

  private appStateSubscription: any = null;

  constructor() {
    this.initializeAppStateListener();
  }

  private initializeAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (this.currentAppState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('[Battery] App has come to the foreground - resuming full operations');
      this.resumeFullOperations();
    } else if (nextAppState.match(/inactive|background/)) {
      console.log('[Battery] App has gone to the background - enabling power saving mode');
      this.enablePowerSavingMode();
    }
    
    this.currentAppState = nextAppState;
  };

  // Reduce background activity when app is not visible
  private enablePowerSavingMode() {
    // Clear all background timers
    this.backgroundTimers.forEach(timer => clearTimeout(timer));
    this.backgroundTimers.clear();
    
    // Reduce polling frequency
    console.log('[Battery] Power saving mode enabled');
  }

  private resumeFullOperations() {
    // Resume normal polling and background tasks
    console.log('[Battery] Full operations resumed');
  }

  // Smart polling with adaptive intervals
  createAdaptivePolling(
    pollFn: () => Promise<void>,
    baseInterval: number = 30000, // 30 seconds
    maxInterval: number = 300000  // 5 minutes
  ) {
    let currentInterval = baseInterval;
    let consecutiveErrors = 0;
    
    const poll = async () => {
      try {
        await pollFn();
        consecutiveErrors = 0;
        
        // Reduce interval on success (back to normal)
        currentInterval = Math.max(baseInterval, currentInterval * 0.8);
      } catch (error) {
        consecutiveErrors++;
        console.warn(`[Battery] Polling error (${consecutiveErrors} consecutive):`, error);
        
        // Increase interval on errors to save battery
        currentInterval = Math.min(maxInterval, currentInterval * 1.5);
      }
      
      // Only continue polling if app is active
      if (this.currentAppState === 'active') {
        const timer = setTimeout(poll, currentInterval);
        this.backgroundTimers.add(timer as any);
      }
    };
    
    // Start polling
    poll();
  }

  // Optimize image loading to reduce memory and battery usage
  optimizeImageLoading() {
    return {
      // Lazy loading config
      lazy: true,
      
      // Progressive loading
      progressive: true,
      
      // Optimize image quality based on device
      quality: __DEV__ ? 100 : 80,
      
      // Cache policy
      cache: 'memory-disk',
      
      // Resize for device screen
      resize: 'contain',
      
      // Background loading priority
      priority: 'low'
    };
  }

  // Network request batching to reduce radio usage
  createRequestBatcher(flushInterval: number = 5000) {
    const pendingRequests: Array<() => Promise<any>> = [];
    let flushTimer: NodeJS.Timeout | null = null;
    
    const flush = async () => {
      if (pendingRequests.length === 0) return;
      
      console.log(`[Battery] Flushing ${pendingRequests.length} batched requests`);
      const requests = pendingRequests.splice(0);
      
      try {
        await Promise.allSettled(requests.map(req => req()));
      } catch (error) {
        console.warn('[Battery] Batch request error:', error);
      }
      
      flushTimer = null;
    };
    
    return {
      addRequest: (requestFn: () => Promise<any>) => {
        pendingRequests.push(requestFn);
        
        // Schedule flush if not already scheduled
        if (!flushTimer) {
          flushTimer = setTimeout(flush, flushInterval) as any;
        }
        
        // Auto-flush if batch gets too large
        if (pendingRequests.length >= 10) {
          if (flushTimer) {
            clearTimeout(flushTimer);
          }
          flush();
        }
      },
      
      flush,
      
      destroy: () => {
        if (flushTimer) {
          clearTimeout(flushTimer);
          flushTimer = null;
        }
        pendingRequests.length = 0;
      }
    };
  }

  // CPU usage optimization
  optimizeCPUUsage() {
    // Debounce heavy operations
    const debounce = <T extends (...args: any[]) => any>(
      func: T,
      delay: number
    ): T => {
      let timeoutId: NodeJS.Timeout;
      
      return ((...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay) as any;
      }) as T;
    };
    
    // Throttle rapid-fire events
    const throttle = <T extends (...args: any[]) => any>(
      func: T,
      delay: number
    ): T => {
      let lastCall = 0;
      
      return ((...args: Parameters<T>) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          return func.apply(this, args);
        }
      }) as T;
    };
    
    return { debounce, throttle };
  }

  // Memory optimization for large lists
  createVirtualizedListConfig() {
    return {
      // Render only visible items plus buffer
      windowSize: 10,
      
      // Remove off-screen items to save memory
      removeClippedSubviews: true,
      
      // Initial items to render
      initialNumToRender: 5,
      
      // Update interval for better performance
      updateCellsBatchingPeriod: 100,
      
      // Optimize memory usage
      maxToRenderPerBatch: 5,
      
      // Get item layout for better performance
      getItemLayout: (data: any, index: number) => ({
        length: 80, // Estimated item height
        offset: 80 * index,
        index,
      }),
    };
  }

  // Cleanup resources when component unmounts
  cleanup() {
    this.backgroundTimers.forEach(timer => clearTimeout(timer));
    this.backgroundTimers.clear();
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }
}

export const batteryOptimizer = BatteryOptimizer.getInstance();

// React hook for battery optimization
export const useBatteryOptimization = () => {
  const optimizer = BatteryOptimizer.getInstance();
  
  return {
    createAdaptivePolling: optimizer.createAdaptivePolling.bind(optimizer),
    optimizeImageLoading: optimizer.optimizeImageLoading.bind(optimizer),
    createRequestBatcher: optimizer.createRequestBatcher.bind(optimizer),
    optimizeCPUUsage: optimizer.optimizeCPUUsage.bind(optimizer),
    createVirtualizedListConfig: optimizer.createVirtualizedListConfig.bind(optimizer),
  };
};
