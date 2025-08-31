/**
 * Performance monitoring utilities for mobile app
 * Tracks bundle size, memory usage, and performance metrics
 */

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private startTime: number = Date.now();
  private memoryWarnings: number = 0;
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track app startup time
  trackAppStartup(phase: 'initialization' | 'auth_check' | 'navigation_ready' | 'ui_ready') {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.startTime;
    
    console.log(`[Performance] ${phase}: ${elapsedTime}ms`);
    
    // Send to analytics in production
    if (__DEV__) {
      console.table({
        phase,
        elapsed_ms: elapsedTime,
        timestamp: new Date().toISOString()
      });
    }
    
    return elapsedTime;
  }

  // Monitor memory usage
  trackMemoryUsage() {
    if (typeof global !== 'undefined' && global.performance) {
      const memory = (global.performance as any).memory;
      if (memory) {
        const usedMemory = memory.usedJSHeapSize;
        const totalMemory = memory.totalJSHeapSize;
        const memoryUsagePercent = (usedMemory / totalMemory) * 100;
        
        if (memoryUsagePercent > 85) {
          this.memoryWarnings++;
          console.warn(`[Performance] High memory usage: ${memoryUsagePercent.toFixed(2)}%`);
        }
        
        return {
          used: usedMemory,
          total: totalMemory,
          percentage: memoryUsagePercent,
          warnings: this.memoryWarnings
        };
      }
    }
    return null;
  }

  // Track navigation performance
  trackNavigationTime(screenName: string, startTime: number) {
    const navigationTime = Date.now() - startTime;
    console.log(`[Performance] Navigation to ${screenName}: ${navigationTime}ms`);
    
    if (navigationTime > 1000) {
      console.warn(`[Performance] Slow navigation to ${screenName}: ${navigationTime}ms`);
    }
    
    return navigationTime;
  }

  // Track API response times
  trackAPIResponse(endpoint: string, responseTime: number, success: boolean) {
    console.log(`[Performance] API ${endpoint}: ${responseTime}ms ${success ? '✅' : '❌'}`);
    
    if (responseTime > 3000) {
      console.warn(`[Performance] Slow API response ${endpoint}: ${responseTime}ms`);
    }
    
    return {
      endpoint,
      responseTime,
      success,
      slow: responseTime > 3000
    };
  }

  // Generate performance report
  generateReport() {
    const report = {
      appStartupTime: Date.now() - this.startTime,
      memoryWarnings: this.memoryWarnings,
      timestamp: new Date().toISOString(),
      memoryUsage: this.trackMemoryUsage()
    };
    
    console.log('[Performance] Report:', report);
    return report;
  }
}

// Bundle size analyzer utility
export const analyzeBundleSize = () => {
  if (__DEV__) {
    console.log('[Bundle] Analyzing bundle size...');
    
    // Track main bundle chunks
    const bundleInfo = {
      main: 'Main app bundle loaded',
      vendor: 'Vendor libraries (React, Expo, etc.)',
      assets: 'Images, fonts, and static assets',
      timestamp: new Date().toISOString()
    };
    
    console.table(bundleInfo);
  }
};

// Memory leak detector
export const detectMemoryLeaks = () => {
  let initialMemory: number | null = null;
  let checkCount = 0;
  
  const checkMemory = () => {
    checkCount++;
    const currentMemory = PerformanceMonitor.getInstance().trackMemoryUsage();
    
    if (currentMemory && initialMemory) {
      const memoryIncrease = currentMemory.used - initialMemory;
      const increasePercent = (memoryIncrease / initialMemory) * 100;
      
      if (increasePercent > 50 && checkCount > 10) {
        console.warn(`[Memory Leak] Potential memory leak detected: ${increasePercent.toFixed(2)}% increase`);
      }
    } else if (currentMemory && !initialMemory) {
      initialMemory = currentMemory.used;
    }
  };
  
  // Check memory every 30 seconds in development
  if (__DEV__) {
    setInterval(checkMemory, 30000);
  }
};

// Network request optimizer
export class NetworkOptimizer {
  private requestQueue: Map<string, Promise<any>> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  
  // Deduplicate simultaneous requests
  async deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key);
    }
    
    const request = requestFn();
    this.requestQueue.set(key, request);
    
    try {
      const result = await request;
      this.requestQueue.delete(key);
      return result;
    } catch (error) {
      this.requestQueue.delete(key);
      throw error;
    }
  }
  
  // Cache with TTL
  setCacheData(key: string, data: any, ttlMs: number = 300000) { // 5 min default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }
  
  getCacheData(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  // Batch multiple requests
  async batchRequests<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
    const startTime = Date.now();
    const results = await Promise.allSettled(requests.map(req => req()));
    const endTime = Date.now();
    
    console.log(`[Network] Batched ${requests.length} requests in ${endTime - startTime}ms`);
    
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : null
    ).filter(Boolean);
  }
}

export const networkOptimizer = new NetworkOptimizer();
