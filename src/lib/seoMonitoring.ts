/**
 * SEO Monitoring and Metrics Tracking
 * Tracks key SEO metrics for ongoing optimization
 */

export interface SEOMetrics {
  timestamp: number;
  url: string;
  pageViews?: number;
  clicks?: number;
  impressions?: number;
  ctr?: number; // Click-through rate
  avgPosition?: number;
  avgClickPosition?: number;
  rankings?: Record<string, number>; // keyword -> position
}

export interface SEOHealthScore {
  timestamp: number;
  score: number;
  components: {
    technicalSEO: number;
    contentQuality: number;
    performance: number;
    accessibility: number;
    mobileOptimization: number;
  };
  issues: string[];
}

/**
 * SEO Monitoring Manager
 * Tracks and aggregates SEO metrics
 */
export class SEOMonitor {
  private metrics: SEOMetrics[] = [];
  private healthHistory: SEOHealthScore[] = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Record SEO metrics
   */
  recordMetrics(metrics: Omit<SEOMetrics, 'timestamp'>): void {
    const fullMetrics: SEOMetrics = {
      ...metrics,
      timestamp: Date.now(),
    };

    this.metrics.push(fullMetrics);
    this.saveToStorage();
  }

  /**
   * Get metrics for specific URL
   */
  getMetricsForUrl(url: string, days: number = 30): SEOMetrics[] {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.metrics.filter((m) => m.url === url && m.timestamp > cutoffTime);
  }

  /**
   * Calculate average CTR
   */
  getAverageMetrics(url: string): Partial<SEOMetrics> {
    const urlMetrics = this.metrics.filter((m) => m.url === url);

    if (urlMetrics.length === 0) return {};

    const avg = {
      ctr: urlMetrics.reduce((sum, m) => sum + (m.ctr || 0), 0) / urlMetrics.length,
      avgPosition: urlMetrics.reduce((sum, m) => sum + (m.avgPosition || 0), 0) / urlMetrics.length,
      clicks: urlMetrics.reduce((sum, m) => sum + (m.clicks || 0), 0),
      impressions: urlMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0),
    };

    return avg;
  }

  /**
   * Track keyword ranking changes
   */
  trackKeywordRanking(keyword: string, position: number, url: string): void {
    this.recordMetrics({
      url,
      rankings: { [keyword]: position },
    });
  }

  /**
   * Calculate health score
   */
  calculateHealthScore(): SEOHealthScore {
    const components = {
      technicalSEO: this.calculateTechnicalSEO(),
      contentQuality: this.calculateContentQuality(),
      performance: this.calculatePerformance(),
      accessibility: this.calculateAccessibility(),
      mobileOptimization: this.calculateMobileOptimization(),
    };

    const score = Math.round(
      (components.technicalSEO +
        components.contentQuality +
        components.performance +
        components.accessibility +
        components.mobileOptimization) /
        5
    );

    const healthScore: SEOHealthScore = {
      timestamp: Date.now(),
      score,
      components,
      issues: this.identifyIssues(),
    };

    this.healthHistory.push(healthScore);
    this.saveToStorage();

    return healthScore;
  }

  private calculateTechnicalSEO(): number {
    // Check for essential technical SEO elements
    let score = 100;

    if (!document.querySelector('meta[name="description"]')) score -= 20;
    if (!document.querySelector('link[rel="canonical"]')) score -= 15;
    if (!document.querySelector('meta[property="og:title"]')) score -= 10;
    if (document.querySelectorAll('h1').length !== 1) score -= 15;

    return Math.max(0, score);
  }

  private calculateContentQuality(): number {
    // Estimate content quality based on page content
    const content = document.body.innerText;
    const wordCount = content.split(/\s+/).length;

    let score = 100;
    if (wordCount < 300) score -= 30;
    if (wordCount > 5000) score -= 10;

    // Check for headings
    if (document.querySelectorAll('h2, h3, h4').length === 0) score -= 20;

    return Math.max(0, score);
  }

  private calculatePerformance(): number {
    if (!('performance' in window)) return 50;

    // Estimated score based on available navigation timing
    const navigation = window.performance.timing;
    const loadTime = navigation.loadEventEnd - navigation.navigationStart;

    let score = 100;
    if (loadTime > 3000) score -= 30;
    if (loadTime > 5000) score -= 40;

    return Math.max(0, score);
  }

  private calculateAccessibility(): number {
    let score = 100;

    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter((img) => !img.hasAttribute('alt'));
    if (imagesWithoutAlt.length > 0) {
      score -= (imagesWithoutAlt.length / images.length) * 30;
    }

    if (!document.querySelector('meta[name="viewport"]')) score -= 20;

    return Math.max(0, score);
  }

  private calculateMobileOptimization(): number {
    let score = 100;

    if (!document.querySelector('meta[name="viewport"]')) score -= 40;
    if (window.innerWidth < 600) score += 10; // Bonus for mobile viewing

    // Check for mobile-friendly font sizes
    const p = document.querySelector('p');
    if (p) {
      const fontSize = window.getComputedStyle(p).fontSize;
      const size = parseFloat(fontSize);
      if (size < 12) score -= 20;
    }

    return Math.max(0, score);
  }

  private identifyIssues(): string[] {
    const issues: string[] = [];

    if (!document.querySelector('meta[name="description"]')) {
      issues.push('Missing meta description');
    }

    if (document.querySelectorAll('h1').length === 0) {
      issues.push('No H1 tag found');
    }

    const imagesWithoutAlt = Array.from(document.querySelectorAll('img')).filter(
      (img) => !img.hasAttribute('alt')
    );
    if (imagesWithoutAlt.length > 0) {
      issues.push(`${imagesWithoutAlt.length} images missing alt text`);
    }

    return issues;
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('seo-metrics', JSON.stringify(this.metrics.slice(-100))); // Keep last 100
      localStorage.setItem('seo-health-history', JSON.stringify(this.healthHistory.slice(-50))); // Keep last 50
    } catch (e) {
      console.warn('[SEO] Failed to save metrics to storage:', e);
    }
  }

  private loadFromStorage(): void {
    try {
      const metrics = localStorage.getItem('seo-metrics');
      const health = localStorage.getItem('seo-health-history');

      if (metrics) this.metrics = JSON.parse(metrics);
      if (health) this.healthHistory = JSON.parse(health);
    } catch (e) {
      console.warn('[SEO] Failed to load metrics from storage:', e);
    }
  }

  /**
   * Get health score history
   */
  getHealthHistory(days: number = 30): SEOHealthScore[] {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.healthHistory.filter((h) => h.timestamp > cutoffTime);
  }

  /**
   * Export all metrics as CSV
   */
  exportMetricsAsCSV(): string {
    const headers = ['Timestamp', 'URL', 'Page Views', 'Clicks', 'Impressions', 'CTR', 'Avg Position'];
    const rows = this.metrics.map((m) => [
      new Date(m.timestamp).toISOString(),
      m.url,
      m.pageViews || '',
      m.clicks || '',
      m.impressions || '',
      m.ctr || '',
      m.avgPosition || '',
    ]);

    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  }
}

// Singleton instance
export const seoMonitor = new SEOMonitor();
