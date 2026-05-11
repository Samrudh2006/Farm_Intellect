/**
 * Performance Headers Optimization
 * Implements HTTP/2, caching, compression, and resource hints
 */

export interface PerformanceHeaderConfig {
  cacheControl: string;
  compressionLevel: number;
  enableHTTP2Push: boolean;
  enableBrotli: boolean;
  enableGzip: boolean;
}

const DEFAULT_CONFIG: PerformanceHeaderConfig = {
  cacheControl: "public, max-age=31536000, immutable",
  compressionLevel: 9,
  enableHTTP2Push: true,
  enableBrotli: true,
  enableGzip: true,
};

/**
 * Generate optimal cache headers for different content types
 */
export function getCacheHeaders(contentType: "image" | "font" | "script" | "style" | "html" | "document"): Record<string, string> {
  const headers: Record<string, Record<string, string>> = {
    image: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/*",
    },
    font: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "font/*",
    },
    script: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "application/javascript",
    },
    style: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "text/css",
    },
    html: {
      "Cache-Control": "public, max-age=3600, must-revalidate",
      "Content-Type": "text/html; charset=utf-8",
    },
    document: {
      "Cache-Control": "public, max-age=300, must-revalidate",
      "Content-Type": "text/html; charset=utf-8",
    },
  };

  return headers[contentType] || headers.document;
}

/**
 * Security headers for optimal HTTPS/CSP configuration
 */
export const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "geolocation=(self), microphone=(), camera=(), payment=(self), usb=()",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https:",
};

/**
 * Compression headers configuration
 */
export const COMPRESSION_HEADERS = {
  "Content-Encoding": "gzip, br",
  "Vary": "Accept-Encoding",
};

/**
 * HTTP/2 Server Push resources
 */
export const HTTP2_PUSH_RESOURCES = [
  { path: "/styles/main.css", as: "style" },
  { path: "/fonts/poppins.woff2", as: "font", type: "font/woff2", crossorigin: true },
  { path: "/vendor/critical.js", as: "script" },
];

/**
 * Generate all optimal headers
 */
export function generateOptimalHeaders(): Record<string, string> {
  return {
    ...SECURITY_HEADERS,
    ...COMPRESSION_HEADERS,
    "Link": generateLinkHeaders(),
    "X-Content-Type-Options": "nosniff",
  };
}

/**
 * Generate Link headers for resource hints
 */
export function generateLinkHeaders(): string {
  const links: string[] = [
    '<https://fonts.googleapis.com>; rel=preconnect',
    '<https://fonts.gstatic.com>; rel=preconnect; crossorigin',
    '<https://cdn.jsdelivr.net>; rel=dns-prefetch',
  ];

  // Add HTTP/2 push links
  HTTP2_PUSH_RESOURCES.forEach((resource) => {
    const corsAttr = resource.crossorigin ? "; crossorigin" : "";
    const typeAttr = resource.type ? `; type="${resource.type}"` : "";
    links.push(`<${resource.path}>; rel=preload; as=${resource.as}${typeAttr}${corsAttr}`);
  });

  return links.join(", ");
}

/**
 * Generate preload/prefetch directives for critical resources
 */
export function getResourceHints(): Array<{ rel: string; href: string; as?: string; type?: string; crossorigin?: boolean }> {
  return [
    // Preconnect to critical domains
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: true },
    { rel: "preconnect", href: "https://cdn.jsdelivr.net", crossorigin: true },

    // DNS Prefetch
    { rel: "dns-prefetch", href: "https://analytics.google.com" },
    { rel: "dns-prefetch", href: "https://www.googletagmanager.com" },

    // Preload critical fonts
    { rel: "preload", href: "/fonts/poppins-400.woff2", as: "font", type: "font/woff2", crossorigin: true },
    { rel: "preload", href: "/fonts/poppins-700.woff2", as: "font", type: "font/woff2", crossorigin: true },

    // Prefetch important resources
    { rel: "prefetch", href: "/sitemap.xml" },
    { rel: "prefetch", href: "/api/crops" },
  ];
}

/**
 * Get compression recommendations
 */
export function getCompressionRecommendations(): string[] {
  return [
    "Enable Brotli compression (better than gzip)",
    "Use WOFF2 for fonts (better compression)",
    "Implement critical CSS extraction",
    "Code split JavaScript bundles",
    "Use modern image formats (AVIF, WebP)",
    "Enable static asset minification",
  ];
}

/**
 * Calculate optimal cache time to live
 */
export function calculateOptimalCacheTTL(contentType: string): number {
  const ttlMap: Record<string, number> = {
    "image": 31536000, // 1 year for images
    "font": 31536000, // 1 year for fonts
    "script": 31536000, // 1 year for versioned scripts
    "style": 31536000, // 1 year for versioned styles
    "html": 3600, // 1 hour for HTML
    "json": 86400, // 1 day for API responses
    "document": 300, // 5 minutes for dynamic documents
  };

  return ttlMap[contentType] || 300;
}

/**
 * Validate performance headers implementation
 */
export function validatePerformanceHeaders(headers: Record<string, string>): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!headers["Strict-Transport-Security"]) {
    issues.push("Missing HSTS header");
  }

  if (!headers["Content-Security-Policy"]) {
    issues.push("Missing CSP header");
  }

  if (!headers["X-Content-Type-Options"]) {
    issues.push("Missing X-Content-Type-Options header");
  }

  if (!headers["X-Frame-Options"]) {
    issues.push("Missing X-Frame-Options header");
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
