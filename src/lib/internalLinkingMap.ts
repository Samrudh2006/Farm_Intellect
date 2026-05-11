/**
 * Internal Linking Strategy Management
 * Optimizes internal links for SEO and user experience
 */

export interface LinkTarget {
  url: string;
  title: string;
  description?: string;
  keywords?: string[];
  priority?: number;
  category?: string;
}

export interface InternalLinkMap {
  [sourceRoute: string]: LinkTarget[];
}

export interface RelatedContent {
  url: string;
  title: string;
  relevanceScore: number;
  commonKeywords: string[];
}

/**
 * Central internal linking map for farm-intellect
 * Defines pillar pages and cluster relationships
 */
export const internalLinkingMap: InternalLinkMap = {
  '/': [
    { url: '/farmer', title: 'Farmer Dashboard', keywords: ['farming', 'dashboard'], priority: 1 },
    { url: '/merchant', title: 'Merchant Platform', keywords: ['merchant', 'business'], priority: 1 },
    { url: '/expert', title: 'Expert Console', keywords: ['expert', 'analysis'], priority: 1 },
    { url: '/about', title: 'About Farm-Intellect', keywords: ['about', 'company'], priority: 0.8 },
  ],

  '/farmer': [
    { url: '/', title: 'Home', keywords: ['home'], priority: 0.8 },
    { url: '/farmer/dashboard', title: 'Dashboard', keywords: ['dashboard'], priority: 0.9 },
    { url: '/farmer/weather', title: 'Weather Insights', keywords: ['weather'], priority: 0.9 },
    { url: '/farmer/crops', title: 'Crop Management', keywords: ['crops', 'management'], priority: 0.9 },
    { url: '/farmer/market-prices', title: 'Market Prices', keywords: ['market', 'prices'], priority: 0.8 },
  ],

  '/merchant': [
    { url: '/', title: 'Home', keywords: ['home'], priority: 0.8 },
    { url: '/merchant/market-prices', title: 'Market Prices', keywords: ['market', 'prices'], priority: 0.9 },
    { url: '/merchant/analytics', title: 'Analytics', keywords: ['analytics'], priority: 0.8 },
    { url: '/merchant/network', title: 'Network', keywords: ['network'], priority: 0.7 },
  ],

  '/expert': [
    { url: '/', title: 'Home', keywords: ['home'], priority: 0.8 },
    { url: '/expert/dashboard', title: 'Expert Dashboard', keywords: ['dashboard'], priority: 0.9 },
    { url: '/expert/analyze', title: 'Analyze', keywords: ['analyze'], priority: 0.8 },
    { url: '/expert/reports', title: 'Reports', keywords: ['reports'], priority: 0.8 },
  ],
};

/**
 * Get related content based on keyword similarity
 */
export const getRelatedContent = (
  sourceUrl: string,
  keywords: string[]
): RelatedContent[] => {
  const relatedLinks: RelatedContent[] = [];

  // Get linked pages from the map
  const linkedPages = internalLinkingMap[sourceUrl] || [];

  for (const link of linkedPages) {
    const commonKeywords = keywords.filter(
      (kw) => link.keywords?.some((lkw) => lkw.toLowerCase().includes(kw.toLowerCase()))
    );

    if (commonKeywords.length > 0 || !keywords.length) {
      relatedLinks.push({
        url: link.url,
        title: link.title,
        relevanceScore: (commonKeywords.length / keywords.length) * (link.priority || 0.5),
        commonKeywords,
      });
    }
  }

  // Sort by relevance score
  return relatedLinks.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 5);
};

/**
 * Generate contextual internal link suggestions
 */
export const generateInternalLinkSuggestions = (
  pageContent: string,
  sourceUrl: string
): LinkTarget[] => {
  const suggestions: LinkTarget[] = [];
  const pageKeywords = extractKeywords(pageContent);

  // Find linking opportunities
  for (const [route, links] of Object.entries(internalLinkingMap)) {
    for (const link of links) {
      if (link.keywords) {
        const matchingKeywords = link.keywords.filter((kw) =>
          pageKeywords.some((pk) => pk.toLowerCase().includes(kw.toLowerCase()))
        );

        if (matchingKeywords.length > 0 && link.url !== sourceUrl) {
          suggestions.push({
            ...link,
            priority: matchingKeywords.length / link.keywords.length,
          });
        }
      }
    }
  }

  return suggestions.sort((a, b) => (b.priority || 0) - (a.priority || 0));
};

/**
 * Extract keywords from page content
 */
function extractKeywords(content: string): string[] {
  // Simple keyword extraction - in production, use NLP library
  const words = content
    .toLowerCase()
    .match(/\b\w{4,}\b/g) || [];

  // Filter common words
  const commonWords = new Set([
    'the', 'and', 'that', 'this', 'with', 'from', 'for', 'are', 'but', 'not', 'have', 'been',
    'their', 'which', 'would', 'could', 'should', 'about', 'through', 'after', 'before',
  ]);

  return Array.from(new Set(words)).filter((w) => !commonWords.has(w)).slice(0, 20);
}

/**
 * Calculate internal link density
 */
export const calculateLinkDensity = (element: HTMLElement): number => {
  const links = element.querySelectorAll('a');
  const words = element.innerText.split(/\s+/).length;

  return links.length > 0 ? (links.length / words) * 100 : 0;
};

/**
 * Check for orphaned pages (pages with no internal links)
 */
export const findOrphanedPages = (allRoutes: string[]): string[] => {
  const linkedPages = new Set<string>();

  for (const links of Object.values(internalLinkingMap)) {
    links.forEach((link) => linkedPages.add(link.url));
  }

  return allRoutes.filter((route) => !linkedPages.has(route));
};

/**
 * Generate breadcrumb navigation for SEO
 */
export const generateBreadcrumbs = (
  currentPath: string
): Array<{ label: string; url: string }> => {
  const segments = currentPath.split('/').filter(Boolean);
  const breadcrumbs: Array<{ label: string; url: string }> = [
    { label: 'Home', url: '/' },
  ];

  let currentUrl = '';
  for (const segment of segments) {
    currentUrl += `/${segment}`;
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    breadcrumbs.push({ label, url: currentUrl });
  }

  return breadcrumbs;
};

/**
 * Get internal link anchor text suggestions
 */
export const getAnchorTextSuggestions = (targetUrl: string): string[] => {
  const targetLinks = internalLinkingMap[targetUrl] || [];
  const targetTitle = internalLinkingMap[targetUrl]?.[0]?.title || '';

  const suggestions = [
    targetTitle,
    targetTitle.split(' ')[0],
    targetLinks[0]?.description || '',
  ].filter(Boolean);

  return suggestions;
};
