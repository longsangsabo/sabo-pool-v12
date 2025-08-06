import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

export const usePerformanceMetrics = (componentName: string) => {
  const startTime = useRef<number>(0);
  const metricsRef = useRef<PerformanceMetrics[]>([]);

  useEffect(() => {
    startTime.current = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime.current;
      
      const metric: PerformanceMetrics = {
        renderTime,
        componentName,
        timestamp: Date.now(),
      };
      
      metricsRef.current.push(metric);
      
      // Keep only last 10 metrics
      if (metricsRef.current.length > 10) {
        metricsRef.current = metricsRef.current.slice(-10);
      }
      
      // Log performance in development
      if (process.env.NODE_ENV === 'development' && renderTime > 50) {
        console.warn(`🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  });

  const getAverageRenderTime = () => {
    if (metricsRef.current.length === 0) return 0;
    const total = metricsRef.current.reduce((sum, metric) => sum + metric.renderTime, 0);
    return total / metricsRef.current.length;
  };

  const getMetrics = () => metricsRef.current;

  return {
    getAverageRenderTime,
    getMetrics,
  };
};
