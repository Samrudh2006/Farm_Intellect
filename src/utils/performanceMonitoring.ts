/**
 * Performance Monitoring Utilities
 * Track Core Web Vitals and other performance metrics for SEO optimization
 */

export interface CoreWebVitals {
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
  FCP?: number; // First Contentful Paint
}

export interface PerformanceMetrics {
  timestamp: number;
  url: string;
  vitals: CoreWebVitals;
}

/**
 * Initialize Core Web Vitals monitoring
 * Reports metrics to provided callback
 */
export const initCoreWebVitalsMonitoring = (callback: (metrics: PerformanceMetrics) => void) => {
  if (typeof window === 'undefined') return;

  const vitals: CoreWebVitals = {};

  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.LCP = Math.round((lastEntry as any).renderTime || (lastEntry as any).loadTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('[Performance] LCP monitoring not available');
    }

    // Cumulative Layout Shift (CLS)
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            vitals.CLS = ((vitals.CLS || 0) + (entry as any).value);
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('[Performance] CLS monitoring not available');
    }

    // First Input Delay (FID) / Interaction to Next Paint (INP)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0];
        vitals.FID = Math.round((firstEntry as any).processingDuration);
      });
      fidObserver.observe({ entryTypes: ['first-input', 'next-paint'] });
    } catch (e) {
      console.warn('[Performance] FID monitoring not available');
    }
  }

  // First Contentful Paint (FCP) - from Navigation Timing API
  if ('performance' in window && 'getEntriesByType' in window.performance) {
    const fcpEntries = window.performance.getEntriesByType('paint');
    for (const entry of fcpEntries) {
      if (entry.name === 'first-contentful-paint') {
        vitals.FCP = Math.round(entry.startTime);
      }
    }
  }

  // Report metrics when page becomes hidden or unloads
  const reportMetrics = () => {
    callback({
      timestamp: Date.now(),
      url: window.location.href,
      vitals,
    });
  };

  // Report on visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      reportMetrics();
    }
  });

  // Report on page unload
  window.addEventListener('beforeunload', reportMetrics);

  return () => {
    document.removeEventListener('visibilitychange', reportMetrics);
    window.removeEventListener('beforeunload', reportMetrics);
  };
};

/**
 * Get Core Web Vitals assessment
 * Returns pass/fail status for each vital
 */
export const assessCoreWebVitals = (vitals: CoreWebVitals): {
  LCP: 'pass' | 'fail' | 'unknown';
  FID: 'pass' | 'fail' | 'unknown';
  CLS: 'pass' | 'fail' | 'unknown';
  overall: 'pass' | 'fail' | 'unknown';
} => {
  const assessments = {
    LCP: vitals.LCP ? (vitals.LCP <= 2500 ? 'pass' : 'fail') : 'unknown',
    FID: vitals.FID ? (vitals.FID <= 100 ? 'pass' : 'fail') : 'unknown',
    CLS: vitals.CLS ? (vitals.CLS <= 0.1 ? 'pass' : 'fail') : 'unknown',
  } as const;

  const overall =
    assessments.LCP === 'fail' || assessments.FID === 'fail' || assessments.CLS === 'fail'
      ? 'fail'
      : assessments.LCP === 'pass' && assessments.FID === 'pass' && assessments.CLS === 'pass'
        ? 'pass'
        : 'unknown';

  return { ...assessments, overall };
};

/**
 * Log performance metrics to console (for development)
 */
export const logPerformanceMetrics = (metrics: PerformanceMetrics) => {
  const assessment = assessCoreWebVitals(metrics.vitals);
  console.log('[Performance Metrics]', {
    url: metrics.url,
    vitals: metrics.vitals,
    assessment,
  });
};

/**
 * Send performance metrics to analytics service
 */
export const sendPerformanceMetrics = async (
  metrics: PerformanceMetrics,
  endpoint: string
): Promise<void> => {
  if (!endpoint) return;

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics),
      keepalive: true,
    });
  } catch (error) {
    console.error('[Performance] Failed to send metrics:', error);
  }
};

/**
 * Get resource timing information for optimization
 */
export const getResourceTimings = (): PerformanceResourceTiming[] => {
  if (!('performance' in window) || !('getEntriesByType' in window.performance)) {
    return [];
  }

  const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  return resources
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10); // Top 10 slowest resources
};

/**
 * Analyze and log slowest resources
 */
export const analyzeResourcePerformance = () => {
  const resources = getResourceTimings();

  if (resources.length > 0) {
    console.log('[Performance] Top 10 slowest resources:');
    resources.forEach((resource, index) => {
      console.log(
        `${index + 1}. ${resource.name}: ${Math.round(resource.duration)}ms`
      );
    });
  }
};
