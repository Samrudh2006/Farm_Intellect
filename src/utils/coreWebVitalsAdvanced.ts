/**
 * Core Web Vitals Monitoring - Advanced Version
 * LCP, FID, CLS, TTFB, FCP with thresholds and alerts
 */

export interface WebVitalMetrics {
  LCP: number | null; // Largest Contentful Paint
  FID: number | null; // First Input Delay
  CLS: number | null; // Cumulative Layout Shift
  TTFB: number | null; // Time to First Byte
  FCP: number | null; // First Contentful Paint
  INP: number | null; // Interaction to Next Paint
}

export const PERFECT_WEB_VITALS_THRESHOLDS = {
  LCP: 2500, // Good: ≤2.5s
  FID: 100, // Good: ≤100ms
  CLS: 0.1, // Good: ≤0.1
  TTFB: 600, // Good: ≤600ms
  FCP: 1800, // Good: ≤1.8s
  INP: 200, // Good: ≤200ms
};

export class CoreWebVitalsMonitor {
  private metrics: WebVitalMetrics = {
    LCP: null,
    FID: null,
    CLS: null,
    TTFB: null,
    FCP: null,
    INP: null,
  };

  private callbacks: Array<(metrics: WebVitalMetrics) => void> = [];

  constructor() {
    if (typeof window === "undefined") return;
    this.initializeMonitoring();
  }

  private initializeMonitoring(): void {
    // LCP - Largest Contentful Paint
    if ("PerformanceObserver" in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.LCP = Math.round(lastEntry.renderTime || lastEntry.loadTime);
          this.notifyCallbacks();
        });
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
      } catch (e) {
        console.warn("[Web Vitals] LCP observer failed", e);
      }

      // FID - First Input Delay
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            if (this.metrics.FID === null) {
              this.metrics.FID = Math.round(entry.processingDuration);
            }
          });
          this.notifyCallbacks();
        });
        fidObserver.observe({ entryTypes: ["first-input"] });
      } catch (e) {
        console.warn("[Web Vitals] FID observer failed", e);
      }

      // CLS - Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              this.metrics.CLS = (this.metrics.CLS || 0) + entry.value;
            }
          });
          this.notifyCallbacks();
        });
        clsObserver.observe({ entryTypes: ["layout-shift"] });
      } catch (e) {
        console.warn("[Web Vitals] CLS observer failed", e);
      }

      // FCP - First Contentful Paint
      try {
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.FCP = Math.round(lastEntry.startTime);
          this.notifyCallbacks();
        });
        fcpObserver.observe({ entryTypes: ["paint"] });
      } catch (e) {
        console.warn("[Web Vitals] FCP observer failed", e);
      }

      // TTFB - Time to First Byte
      try {
        if (performance.timing) {
          this.metrics.TTFB = Math.round(
            performance.timing.responseStart - performance.timing.navigationStart
          );
        }
      } catch (e) {
        console.warn("[Web Vitals] TTFB calculation failed", e);
      }

      // INP - Interaction to Next Paint
      try {
        const inpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            this.metrics.INP = Math.round(lastEntry.duration);
          }
          this.notifyCallbacks();
        });
        inpObserver.observe({ entryTypes: ["interaction"] });
      } catch (e) {
        console.warn("[Web Vitals] INP observer failed", e);
      }
    }
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach((callback) => callback(this.metrics));
  }

  onMetricsUpdate(callback: (metrics: WebVitalMetrics) => void): void {
    this.callbacks.push(callback);
  }

  getMetrics(): WebVitalMetrics {
    return { ...this.metrics };
  }

  getScore(): number {
    const metrics = this.metrics;
    let score = 0;
    let count = 0;

    // LCP scoring
    if (metrics.LCP !== null) {
      score += Math.max(0, 100 - (metrics.LCP / PERFECT_WEB_VITALS_THRESHOLDS.LCP) * 100);
      count++;
    }

    // FID scoring
    if (metrics.FID !== null) {
      score += Math.max(0, 100 - (metrics.FID / PERFECT_WEB_VITALS_THRESHOLDS.FID) * 100);
      count++;
    }

    // CLS scoring
    if (metrics.CLS !== null) {
      score += Math.max(0, 100 - (metrics.CLS / PERFECT_WEB_VITALS_THRESHOLDS.CLS) * 100);
      count++;
    }

    return count > 0 ? Math.round(score / count) : 0;
  }

  isPassingAllMetrics(): boolean {
    return (
      (this.metrics.LCP === null || this.metrics.LCP <= PERFECT_WEB_VITALS_THRESHOLDS.LCP) &&
      (this.metrics.FID === null || this.metrics.FID <= PERFECT_WEB_VITALS_THRESHOLDS.FID) &&
      (this.metrics.CLS === null || this.metrics.CLS <= PERFECT_WEB_VITALS_THRESHOLDS.CLS) &&
      (this.metrics.TTFB === null || this.metrics.TTFB <= PERFECT_WEB_VITALS_THRESHOLDS.TTFB) &&
      (this.metrics.FCP === null || this.metrics.FCP <= PERFECT_WEB_VITALS_THRESHOLDS.FCP) &&
      (this.metrics.INP === null || this.metrics.INP <= PERFECT_WEB_VITALS_THRESHOLDS.INP)
    );
  }

  getHealthStatus(): "excellent" | "good" | "needs-improvement" | "poor" {
    const score = this.getScore();
    if (score >= 90) return "excellent";
    if (score >= 75) return "good";
    if (score >= 50) return "needs-improvement";
    return "poor";
  }
}

// Singleton instance
let monitorInstance: CoreWebVitalsMonitor | null = null;

export function initCoreWebVitalsMonitor(): CoreWebVitalsMonitor {
  if (!monitorInstance) {
    monitorInstance = new CoreWebVitalsMonitor();
  }
  return monitorInstance;
}

export function getCoreWebVitalsMonitor(): CoreWebVitalsMonitor | null {
  return monitorInstance;
}
