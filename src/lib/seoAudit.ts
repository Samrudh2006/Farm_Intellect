/**
 * SEO Audit Generator
 * Automated SEO audit and reporting
 */

export interface SEOAuditResult {
  timestamp: number;
  url: string;
  score: number;
  issues: SEOIssue[];
  warnings: string[];
  passed: string[];
}

export interface SEOIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  message: string;
  details?: string;
  recommendation?: string;
}

/**
 * Run comprehensive SEO audit on current page
 */
export const runSEOAudit = (): SEOAuditResult => {
  const issues: SEOIssue[] = [];
  const warnings: string[] = [];
  const passed: string[] = [];

  // 1. Check meta tags
  if (!document.querySelector('meta[name="description"]')) {
    issues.push({
      severity: 'critical',
      category: 'Meta Tags',
      message: 'Missing meta description',
      recommendation: 'Add a meta description tag with 150-160 characters',
    });
  } else {
    passed.push('Meta description present');
  }

  // 2. Check title tag
  if (!document.title || document.title.length === 0) {
    issues.push({
      severity: 'critical',
      category: 'Meta Tags',
      message: 'Missing page title',
      recommendation: 'Add a descriptive page title (50-60 characters)',
    });
  } else if (document.title.length > 60) {
    warnings.push('Page title is longer than 60 characters');
  } else {
    passed.push('Page title present and appropriate length');
  }

  // 3. Check headings
  const h1s = document.querySelectorAll('h1');
  if (h1s.length === 0) {
    issues.push({
      severity: 'critical',
      category: 'Heading Structure',
      message: 'No H1 tag found',
      recommendation: 'Add exactly one H1 tag to describe page content',
    });
  } else if (h1s.length > 1) {
    issues.push({
      severity: 'high',
      category: 'Heading Structure',
      message: `Multiple H1 tags found (${h1s.length})`,
      recommendation: 'Use only one H1 tag per page',
    });
  } else {
    passed.push('Proper H1 tag structure');
  }

  // 4. Check images
  const images = document.querySelectorAll('img');
  const imagesWithoutAlt = Array.from(images).filter((img) => !img.hasAttribute('alt'));
  if (imagesWithoutAlt.length > 0) {
    issues.push({
      severity: 'high',
      category: 'Images',
      message: `${imagesWithoutAlt.length} images without alt text`,
      recommendation: 'Add descriptive alt text to all images for SEO and accessibility',
    });
  } else if (images.length > 0) {
    passed.push(`All ${images.length} images have alt text`);
  }

  // 5. Check canonical tag
  if (!document.querySelector('link[rel="canonical"]')) {
    warnings.push('No canonical tag found');
  } else {
    passed.push('Canonical tag present');
  }

  // 6. Check Open Graph tags
  const ogTags = ['og:title', 'og:description', 'og:image'];
  const missingOG = ogTags.filter((tag) => !document.querySelector(`meta[property="${tag}"]`));
  if (missingOG.length > 0) {
    warnings.push(`Missing Open Graph tags: ${missingOG.join(', ')}`);
  } else {
    passed.push('Open Graph tags complete');
  }

  // 7. Check structured data
  const schemaScripts = document.querySelectorAll('script[type="application/ld+json"]');
  if (schemaScripts.length === 0) {
    warnings.push('No structured data (JSON-LD) found');
  } else {
    passed.push(`${schemaScripts.length} structured data block(s) found`);
  }

  // 8. Check mobile responsiveness
  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    issues.push({
      severity: 'high',
      category: 'Mobile',
      message: 'Missing viewport meta tag',
      recommendation: 'Add viewport meta tag for mobile responsiveness',
    });
  } else {
    passed.push('Mobile viewport configured');
  }

  // 9. Check SSL/HTTPS
  if (window.location.protocol !== 'https:') {
    issues.push({
      severity: 'critical',
      category: 'Security',
      message: 'Site not using HTTPS',
      recommendation: 'Enable HTTPS for all pages',
    });
  } else {
    passed.push('HTTPS enabled');
  }

  // 10. Check internal links
  const internalLinks = Array.from(document.querySelectorAll('a')).filter(
    (a) => a.href.startsWith('/') || a.href.includes(window.location.origin)
  ).length;

  if (internalLinks === 0) {
    warnings.push('No internal links found');
  } else {
    passed.push(`${internalLinks} internal links found`);
  }

  // Calculate score
  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const highCount = issues.filter((i) => i.severity === 'high').length;
  const score = Math.max(0, 100 - criticalCount * 20 - highCount * 10 - warnings.length * 3);

  return {
    timestamp: Date.now(),
    url: window.location.href,
    score,
    issues,
    warnings,
    passed,
  };
};

/**
 * Generate SEO audit report HTML
 */
export const generateAuditReport = (result: SEOAuditResult): string => {
  const reportDate = new Date(result.timestamp).toLocaleString();

  return `
    <div class="seo-audit-report" style="font-family: system-ui; max-width: 900px; margin: 20px; padding: 20px; background: #f5f5f5; border-radius: 8px;">
      <h2>SEO Audit Report</h2>
      <p>Generated: ${reportDate}</p>
      <p>URL: ${result.url}</p>
      
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Score: <span style="font-size: 32px; color: ${result.score >= 80 ? 'green' : result.score >= 60 ? 'orange' : 'red'};">${result.score}/100</span></h3>
      </div>

      ${result.issues.length > 0 ? `
        <div style="background: #fee; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Issues Found: ${result.issues.length}</h3>
          ${result.issues.map((issue) => `
            <div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid ${issue.severity === 'critical' ? 'red' : issue.severity === 'high' ? 'orange' : 'yellow'};">
              <strong>[${issue.severity.toUpperCase()}] ${issue.category}</strong>: ${issue.message}
              ${issue.recommendation ? `<p>Recommendation: ${issue.recommendation}</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${result.warnings.length > 0 ? `
        <div style="background: #ffe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Warnings: ${result.warnings.length}</h3>
          ${result.warnings.map((w) => `<p>• ${w}</p>`).join('')}
        </div>
      ` : ''}

      ${result.passed.length > 0 ? `
        <div style="background: #efe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Passed Checks: ${result.passed.length}</h3>
          ${result.passed.map((p) => `<p>✓ ${p}</p>`).join('')}
        </div>
      ` : ''}
    </div>
  `;
};

/**
 * Export audit result as JSON
 */
export const exportAuditResult = (result: SEOAuditResult): void => {
  const dataStr = JSON.stringify(result, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `seo-audit-${Date.now()}.json`;
  link.click();
};
