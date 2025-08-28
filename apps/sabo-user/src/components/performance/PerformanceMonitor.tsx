import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  bundleSize?: number;
  networkRequests?: number;
}

interface PerformanceMonitorProps {
  className?: string;
  showDetails?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  className,
  showDetails = false
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Measure initial load time
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigationEntry) {
      const loadTime = navigationEntry.loadEventEnd - navigationEntry.fetchStart;
      const renderTime = navigationEntry.domContentLoadedEventEnd - navigationEntry.fetchStart;
      
      setMetrics(prev => ({
        ...prev,
        loadTime: Math.round(loadTime),
        renderTime: Math.round(renderTime)
      }));
    }

    // Monitor memory usage if available
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) // Convert to MB
      }));
    }

    // Count network requests
    const resourceEntries = performance.getEntriesByType('resource');
    setMetrics(prev => ({
      ...prev,
      networkRequests: resourceEntries.length
    }));
  }, []);

  const getPerformanceStatus = (loadTime: number) => {
    if (loadTime < 1000) return { status: 'excellent', color: 'text-green-600' };
    if (loadTime < 2000) return { status: 'good', color: 'text-yellow-600' };
    if (loadTime < 3000) return { status: 'fair', color: 'text-orange-600' };
    return { status: 'poor', color: 'text-red-600' };
  };

  const performanceStatus = getPerformanceStatus(metrics.loadTime);

  if (!showDetails && !isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors z-50"
      >
        📊 Performance
      </button>
    );
  }

  return (
    <div className={clsx(
      'fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm z-50 max-w-xs',
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Performance</h4>
        {!showDetails && (
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Load Time:</span>
          <span className={performanceStatus.color}>
            {metrics.loadTime}ms ({performanceStatus.status})
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Render Time:</span>
          <span className="text-gray-900">{metrics.renderTime}ms</span>
        </div>
        
        {metrics.memoryUsage && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Memory:</span>
            <span className="text-gray-900">{metrics.memoryUsage}MB</span>
          </div>
        )}
        
        {metrics.networkRequests && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Requests:</span>
            <span className="text-gray-900">{metrics.networkRequests}</span>
          </div>
        )}
      </div>
      
      {/* Performance Tips */}
      {metrics.loadTime > 2000 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          💡 Consider enabling lazy loading or optimizing images
        </div>
      )}
    </div>
  );
};

// Hook for performance monitoring
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0
  });

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          setMetrics(prev => ({
            ...prev,
            loadTime: Math.round(navEntry.loadEventEnd - navEntry.fetchStart),
            renderTime: Math.round(navEntry.domContentLoadedEventEnd - navEntry.fetchStart)
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'resource'] });

    return () => observer.disconnect();
  }, []);

  const logPerformance = (componentName: string, startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`🚀 Performance: ${componentName} rendered in ${duration.toFixed(2)}ms`);
    
    if (duration > 100) {
      console.warn(`⚠️ Performance Warning: ${componentName} took ${duration.toFixed(2)}ms to render`);
    }
  };

  return { metrics, logPerformance };
};

export default PerformanceMonitor;
