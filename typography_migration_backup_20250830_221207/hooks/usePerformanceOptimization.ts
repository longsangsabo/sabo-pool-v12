import { useEffect } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay?: number;
}

export const usePerformanceOptimization = () => {
  useEffect(() => {
    // Monitor Web Vitals
    const measurePerformance = () => {
      if ('performance' in window) {
        const metrics: Partial<PerformanceMetrics> = {};
        
        // Load time
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        }

        // Core Web Vitals
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
              metrics.firstContentfulPaint = entry.startTime;
            }
          });
        }).observe({ entryTypes: ['paint'] });

        // LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.largestContentfulPaint = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // CLS
        new PerformanceObserver((list) => {
          let clsValue = 0;
          list.getEntries().forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });
          metrics.cumulativeLayoutShift = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });

        // Log metrics in development
        if (process.env.NODE_ENV === 'development') {
          setTimeout(() => {
            console.log('🚀 Performance Metrics:', metrics);
          }, 3000);
        }
      }
    };

    // Run after initial load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    return () => {
      window.removeEventListener('load', measurePerformance);
    };
  }, []);

  return {
    // Utility functions for manual performance tracking
    trackUserInteraction: (action: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`👆 User interaction: ${action} at ${performance.now()}ms`);
      }
    },
    
    trackComponentRender: (componentName: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🎨 Component rendered: ${componentName} at ${performance.now()}ms`);
      }
    }
  };
};
