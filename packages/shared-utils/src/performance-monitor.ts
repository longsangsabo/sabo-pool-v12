/**
 * Core Web Vitals Performance Monitoring
 * Tracks essential metrics for user experience
 */

import React from 'react';

// Mock web-vitals for now - in real implementation, install web-vitals package
interface Metric {
  name: string;
  value: number;
  delta: number;
  id: string;
  entries: any[];
}

type MetricHandler = (metric: Metric) => void;

// Mock implementations
const getCLS = (handler: MetricHandler) => {
  // Implementation would use real web-vitals
  setTimeout(() => handler({ name: 'CLS', value: 0.05, delta: 0.05, id: 'cls', entries: [] }), 100);
};

const getFID = (handler: MetricHandler) => {
  setTimeout(() => handler({ name: 'FID', value: 80, delta: 80, id: 'fid', entries: [] }), 100);
};

const getFCP = (handler: MetricHandler) => {
  setTimeout(() => handler({ name: 'FCP', value: 1500, delta: 1500, id: 'fcp', entries: [] }), 100);
};

const getLCP = (handler: MetricHandler) => {
  setTimeout(() => handler({ name: 'LCP', value: 2200, delta: 2200, id: 'lcp', entries: [] }), 100);
};

const getTTFB = (handler: MetricHandler) => {
  setTimeout(() => handler({ name: 'TTFB', value: 600, delta: 600, id: 'ttfb', entries: [] }), 100);
};

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private isTracking = false;

  constructor(private reportEndpoint?: string) {
    this.initializeTracking();
  }

  private initializeTracking() {
    if (typeof window === 'undefined') return;

    this.isTracking = true;

    // Largest Contentful Paint (LCP)
    getLCP((metric) => {
      this.recordMetric({
        name: 'LCP',
        value: metric.value,
        rating: this.getRating('LCP', metric.value),
        timestamp: Date.now(),
        url: window.location.href,
      });
    });

    // First Input Delay (FID)
    getFID((metric) => {
      this.recordMetric({
        name: 'FID',
        value: metric.value,
        rating: this.getRating('FID', metric.value),
        timestamp: Date.now(),
        url: window.location.href,
      });
    });

    // Cumulative Layout Shift (CLS)
    getCLS((metric) => {
      this.recordMetric({
        name: 'CLS',
        value: metric.value,
        rating: this.getRating('CLS', metric.value),
        timestamp: Date.now(),
        url: window.location.href,
      });
    });

    // First Contentful Paint (FCP)
    getFCP((metric) => {
      this.recordMetric({
        name: 'FCP',
        value: metric.value,
        rating: this.getRating('FCP', metric.value),
        timestamp: Date.now(),
        url: window.location.href,
      });
    });

    // Time to First Byte (TTFB)
    getTTFB((metric) => {
      this.recordMetric({
        name: 'TTFB',
        value: metric.value,
        rating: this.getRating('TTFB', metric.value),
        timestamp: Date.now(),
        url: window.location.href,
      });
    });
  }

  private getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Send to analytics service
    this.sendMetric(metric);
    
    // Store locally for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance Metric [${metric.name}]:`, {
        value: `${metric.value}ms`,
        rating: metric.rating,
        url: metric.url,
      });
    }
  }

  private async sendMetric(metric: PerformanceMetric) {
    if (!this.reportEndpoint) return;

    try {
      await fetch(this.reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'performance_metric',
          data: metric,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to send performance metric:', error);
    }
  }

  // Custom performance tracking
  trackCustomMetric(name: string, value: number, unit: string = 'ms') {
    const metric: PerformanceMetric = {
      name: `custom_${name}`,
      value,
      rating: 'good', // Custom metrics don't have predefined thresholds
      timestamp: Date.now(),
      url: window.location.href,
    };

    this.recordMetric(metric);
  }

  // Page load timing
  trackPageLoad(pageName: string) {
    if (typeof window === 'undefined') return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const metrics = {
        dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp_connection: navigation.connectEnd - navigation.connectStart,
        request_response: navigation.responseEnd - navigation.requestStart,
        dom_processing: navigation.domContentLoadedEventStart - navigation.responseEnd,
        load_complete: navigation.loadEventEnd - navigation.loadEventStart,
        total_time: navigation.loadEventEnd - navigation.navigationStart,
      };

      Object.entries(metrics).forEach(([key, value]) => {
        this.trackCustomMetric(`${pageName}_${key}`, value);
      });
    }
  }

  // Resource timing
  trackResourceLoading() {
    if (typeof window === 'undefined') return;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const resourceMetrics = resources.reduce((acc, resource) => {
      const type = this.getResourceType(resource.name);
      if (!acc[type]) acc[type] = { count: 0, totalSize: 0, totalTime: 0 };
      
      acc[type].count++;
      acc[type].totalTime += resource.responseEnd - resource.requestStart;
      
      return acc;
    }, {} as Record<string, { count: number; totalSize: number; totalTime: number }>);

    Object.entries(resourceMetrics).forEach(([type, metrics]) => {
      this.trackCustomMetric(`resource_${type}_count`, metrics.count, 'count');
      this.trackCustomMetric(`resource_${type}_avg_time`, metrics.totalTime / metrics.count);
    });
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  // Memory usage tracking
  trackMemoryUsage() {
    if (typeof window === 'undefined' || !('memory' in performance)) return;

    const memory = (performance as any).memory;
    
    this.trackCustomMetric('memory_used', memory.usedJSHeapSize, 'bytes');
    this.trackCustomMetric('memory_total', memory.totalJSHeapSize, 'bytes');
    this.trackCustomMetric('memory_limit', memory.jsHeapSizeLimit, 'bytes');
  }

  // Bundle size tracking
  async trackBundleSize() {
    if (typeof window === 'undefined') return;

    try {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      
      let totalJSSize = 0;
      let totalCSSSize = 0;

      // Note: In a real implementation, you'd need to fetch these resources
      // or track sizes during build time and embed in the app
      
      this.trackCustomMetric('bundle_js_files', scripts.length, 'count');
      this.trackCustomMetric('bundle_css_files', stylesheets.length, 'count');
    } catch (error) {
      console.error('Bundle size tracking failed:', error);
    }
  }

  // Generate performance report
  generateReport(): {
    summary: Record<string, any>;
    metrics: PerformanceMetric[];
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    const summary = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = {
          average: 0,
          count: 0,
          ratings: { good: 0, 'needs-improvement': 0, poor: 0 },
        };
      }
      
      acc[metric.name].average = (acc[metric.name].average * acc[metric.name].count + metric.value) / (acc[metric.name].count + 1);
      acc[metric.name].count++;
      acc[metric.name].ratings[metric.rating]++;
      
      return acc;
    }, {} as Record<string, any>);

    // Generate recommendations based on metrics
    Object.entries(summary).forEach(([metric, data]) => {
      const poorPercentage = (data.ratings.poor / data.count) * 100;
      
      if (poorPercentage > 20) {
        recommendations.push(`⚠️ ${metric}: ${poorPercentage.toFixed(1)}% of measurements are poor`);
      }
    });

    return {
      summary,
      metrics: this.metrics,
      recommendations,
    };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  React.useEffect(() => {
    // Track page load on mount
    performanceMonitor.trackPageLoad(window.location.pathname);
    
    // Track resource loading
    setTimeout(() => {
      performanceMonitor.trackResourceLoading();
      performanceMonitor.trackMemoryUsage();
    }, 1000);
    
    // Set up periodic memory monitoring
    const memoryInterval = setInterval(() => {
      performanceMonitor.trackMemoryUsage();
    }, 30000); // Every 30 seconds
    
    return () => {
      clearInterval(memoryInterval);
    };
  }, []);
  
  return {
    trackCustomMetric: performanceMonitor.trackCustomMetric.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor),
  };
};

export default PerformanceMonitor;
