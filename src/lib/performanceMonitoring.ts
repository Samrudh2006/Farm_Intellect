/**
 * Performance Monitoring for 2G Networks
 * Tracks Core Web Vitals and provides optimization recommendations
 */

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  tti: number; // Time to Interactive
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  ttfb: number; // Time to First Byte
  networkType: string; // 2g, 3g, 4g, 5g
  downlink: number; // Mbps
  rtt: number; // Round trip time (ms)
  effectiveType: string; // Connection type
}

export interface PerformanceRecommendation {
  metric: string;
  status: "good" | "needs-improvement" | "poor";
  threshold: number;
  current: number;
  recommendation: string;
  priority: "high" | "medium" | "low";
}

// Thresholds for good performance (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  fcp: 1800, // First Contentful Paint
  lcp: 2500, // Largest Contentful Paint
  tti: 3800, // Time to Interactive (for slow networks)
  cls: 0.1, // Cumulative Layout Shift
  fid: 100, // First Input Delay
  ttfb: 600, // Time to First Byte
};

const NETWORK_2G_THRESHOLDS = {
  fcp: 3000,
  lcp: 5000,
  tti: 7000,
  cls: 0.15,
  fid: 200,
  ttfb: 1500,
};

/**
 * Get current network information
 */
export function getNetworkInfo(): Partial<PerformanceMetrics> {
  const nav = navigator as any;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

  if (!connection) {
    return {
      networkType: "unknown",
      downlink: 0,
      rtt: 0,
      effectiveType: "unknown",
    };
  }

  return {
    networkType: connection.type,
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
    effectiveType: connection.effectiveType,
  };
}

/**
 * Detect if device is on 2G network
 */
export function is2GNetwork(): boolean {
  const network = getNetworkInfo();
  return (
    network.networkType === "2g" ||
    network.effectiveType === "slow-2g" ||
    network.effectiveType === "2g" ||
    (network.downlink !== undefined && network.downlink < 0.5)
  );
}

/**
 * Measure Core Web Vitals using Web Vitals API
 */
export async function measureCoreWebVitals(): Promise<PerformanceMetrics> {
  const metrics: Partial<PerformanceMetrics> = { ...getNetworkInfo() };

  // FCP & LCP via PerformanceObserver
  try {
    const paintEntries = performance.getEntriesByType("paint");
    const fcpEntry = paintEntries.find((entry) => entry.name === "first-contentful-paint");
    if (fcpEntry) {
      metrics.fcp = Math.round(fcpEntry.startTime);
    }

    // LCP via observer
    const lcpPromise = new Promise<number>((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(Math.round(lastEntry.renderTime || lastEntry.loadTime));
      });

      observer.observe({ entryTypes: ["largest-contentful-paint"] });

      // Stop observing after 5 seconds
      setTimeout(() => {
        observer.disconnect();
        resolve(0);
      }, 5000);
    });

    metrics.lcp = await lcpPromise;
  } catch (error) {
    console.warn("[performance] Error measuring FCP/LCP:", error);
  }

  // TTI estimation (approximate)
  metrics.tti = Math.round(performance.timing?.loadEventEnd || Date.now() - performance.timing.navigationStart || 0);

  // CLS (Cumulative Layout Shift)
  try {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if ((entry as any).hadRecentInput) continue;
        clsValue += (entry as any).value;
      }
    });

    observer.observe({ type: "layout-shift", buffered: true });

    setTimeout(() => {
      observer.disconnect();
    }, 5000);

    metrics.cls = Math.round(clsValue * 1000) / 1000;
  } catch (error) {
    console.warn("[performance] Error measuring CLS:", error);
  }

  // TTFB (Time to First Byte)
  try {
    const navTiming = performance.timing;
    if (navTiming) {
      metrics.ttfb = Math.round(navTiming.responseStart - navTiming.navigationStart);
    }
  } catch (error) {
    console.warn("[performance] Error measuring TTFB:", error);
  }

  // FID (First Input Delay) - approximate
  metrics.fid = 0; // Set to 0 initially, will be measured on first interaction

  return {
    fcp: metrics.fcp || 0,
    lcp: metrics.lcp || 0,
    tti: metrics.tti || 0,
    cls: metrics.cls || 0,
    fid: metrics.fid || 0,
    ttfb: metrics.ttfb || 0,
    networkType: metrics.networkType || "unknown",
    downlink: metrics.downlink || 0,
    rtt: metrics.rtt || 0,
    effectiveType: metrics.effectiveType || "unknown",
  };
}

/**
 * Analyze performance and provide recommendations
 */
export function analyzePerformance(metrics: PerformanceMetrics): PerformanceRecommendation[] {
  const is2G = is2GNetwork();
  const thresholds = is2G ? NETWORK_2G_THRESHOLDS : PERFORMANCE_THRESHOLDS;

  const recommendations: PerformanceRecommendation[] = [];

  // Check FCP
  if (metrics.fcp > thresholds.fcp) {
    recommendations.push({
      metric: "FCP",
      status: metrics.fcp > thresholds.fcp * 1.5 ? "poor" : "needs-improvement",
      threshold: thresholds.fcp,
      current: metrics.fcp,
      recommendation: "Improve First Contentful Paint by reducing render-blocking resources. Inline critical CSS and defer non-critical JavaScript.",
      priority: "high",
    });
  } else {
    recommendations.push({
      metric: "FCP",
      status: "good",
      threshold: thresholds.fcp,
      current: metrics.fcp,
      recommendation: "Good FCP performance.",
      priority: "low",
    });
  }

  // Check LCP
  if (metrics.lcp > thresholds.lcp) {
    recommendations.push({
      metric: "LCP",
      status: metrics.lcp > thresholds.lcp * 1.5 ? "poor" : "needs-improvement",
      threshold: thresholds.lcp,
      current: metrics.lcp,
      recommendation: "Improve Largest Contentful Paint by optimizing images, lazy loading, and reducing server response time.",
      priority: "high",
    });
  } else {
    recommendations.push({
      metric: "LCP",
      status: "good",
      threshold: thresholds.lcp,
      current: metrics.lcp,
      recommendation: "Good LCP performance.",
      priority: "low",
    });
  }

  // Check CLS
  if (metrics.cls > thresholds.cls) {
    recommendations.push({
      metric: "CLS",
      status: "needs-improvement",
      threshold: thresholds.cls,
      current: metrics.cls,
      recommendation: "Minimize Cumulative Layout Shift by setting dimensions for images/videos and avoiding dynamic content injections.",
      priority: "medium",
    });
  } else {
    recommendations.push({
      metric: "CLS",
      status: "good",
      threshold: thresholds.cls,
      current: metrics.cls,
      recommendation: "Good CLS performance.",
      priority: "low",
    });
  }

  // Check TTFB
  if (metrics.ttfb > thresholds.ttfb) {
    recommendations.push({
      metric: "TTFB",
      status: "needs-improvement",
      threshold: thresholds.ttfb,
      current: metrics.ttfb,
      recommendation: "Reduce Time to First Byte with server-side caching, CDN optimization, and faster backend processing.",
      priority: "medium",
    });
  }

  // Network-specific recommendations
  if (is2G) {
    recommendations.push({
      metric: "Network",
      status: "needs-improvement",
      threshold: 0.5,
      current: metrics.downlink,
      recommendation: `2G network detected (${metrics.downlink} Mbps). Enable aggressive caching, reduce assets, and use service workers.`,
      priority: "high",
    });
  }

  return recommendations;
}

/**
 * Report metrics to analytics (non-blocking)
 */
export function reportMetrics(metrics: PerformanceMetrics): void {
  // Send to analytics endpoint (example)
  const endpoint = process.env.VITE_ANALYTICS_ENDPOINT;
  if (!endpoint) return;

  navigator.sendBeacon(endpoint, JSON.stringify({
    timestamp: new Date().toISOString(),
    ...metrics,
  }));
}

/**
 * Create cache invalidation hash for resources
 */
export function getCacheHash(resourceName: string): string {
  // In production, this would be generated during build
  const hash = new Date().getHours().toString(); // Simple hour-based hash
  return `${resourceName}?v=${hash}`;
}

/**
 * Optimize script loading strategy for 2G networks
 */
export function getScriptLoadingStrategy(): "defer" | "async" | "module" {
  if (is2GNetwork()) {
    return "defer"; // Load sequentially for 2G
  }
  return "module"; // Module scripts with async for faster networks
}

/**
 * Get image optimization settings
 */
export function getImageOptimizationSettings() {
  if (is2GNetwork()) {
    return {
      format: "webp", // Better compression
      quality: 60, // Lower quality for 2G
      lazyLoad: true,
      responsive: true,
      sizes: "(max-width: 600px) 100vw, 50vw",
    };
  }

  return {
    format: "webp",
    quality: 80,
    lazyLoad: true,
    responsive: true,
    sizes: "(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw",
  };
}

/**
 * Monitor long tasks (> 50ms)
 */
export function monitorLongTasks(callback: (duration: number) => void): () => void {
  if (!("PerformanceObserver" in window)) {
    return () => {};
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const duration = Math.round((entry as any).duration);
        if (duration > 50) {
          callback(duration);
          console.warn(
            `[performance] Long task detected: ${duration}ms at ${new Date((entry as any).startTime).toLocaleTimeString()}`
          );
        }
      }
    });

    observer.observe({ entryTypes: ["longtask"] });
    return () => observer.disconnect();
  } catch (error) {
    console.warn("[performance] Long task monitoring not available:", error);
    return () => {};
  }
}

/**
 * Detect and report 3rd party script impact
 */
export function analyze3rdPartyScripts(): { name: string; impact: number }[] {
  const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];

  const thirdPartyScripts = entries
    .filter((e) => e.initiatorType === "script" && !e.name.includes(window.location.hostname))
    .map((e) => ({
      name: new URL(e.name).hostname,
      impact: Math.round(e.duration),
    }))
    .reduce((acc, item) => {
      const existing = acc.find((x) => x.name === item.name);
      if (existing) {
        existing.impact += item.impact;
      } else {
        acc.push(item);
      }
      return acc;
    }, [] as { name: string; impact: number }[]);

  return thirdPartyScripts.sort((a, b) => b.impact - a.impact);
}
