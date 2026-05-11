/**
 * Content Analysis and Optimization
 * Analyzes page content for SEO best practices
 */

export interface ContentAnalysis {
  wordCount: number;
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  headingStructure: { level: number; text: string }[];
  imageCount: number;
  internalLinks: number;
  externalLinks: number;
  recommendations: string[];
}

/**
 * Analyze page content for SEO optimization
 */
export const analyzePageContent = (element: HTMLElement): ContentAnalysis => {
  const text = element.innerText;
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Extract headings
  const headingStructure = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(
    (h) => ({
      level: parseInt(h.tagName[1]),
      text: h.textContent || '',
    })
  );

  // Count images
  const imageCount = element.querySelectorAll('img').length;

  // Count links
  const internalLinks = Array.from(element.querySelectorAll('a')).filter(
    (a) => a.href.startsWith('/') || a.href.includes(window.location.origin)
  ).length;

  const externalLinks = Array.from(element.querySelectorAll('a')).filter(
    (a) => !a.href.startsWith('/') && !a.href.includes(window.location.origin) && a.href.startsWith('http')
  ).length;

  // Calculate readability score (Flesch Reading Ease)
  const readabilityScore = calculateFleschKincaidScore(text);

  // Analyze keyword density
  const keywordDensity = analyzeKeywordDensity(text);

  // Generate recommendations
  const recommendations = generateContentRecommendations({
    wordCount,
    readabilityScore,
    headingStructure,
    imageCount,
    internalLinks,
    keywordDensity,
  });

  return {
    wordCount,
    readabilityScore,
    keywordDensity,
    headingStructure,
    imageCount,
    internalLinks,
    externalLinks,
    recommendations,
  };
};

/**
 * Calculate Flesch-Kincaid Readability Score
 * Range: 0-100, where higher is easier to read
 */
export const calculateFleschKincaidScore = (text: string): number => {
  const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
  const words = text.split(/\s+/).filter(Boolean).length || 1;
  const syllables = countSyllables(text);

  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);

  return Math.max(0, Math.min(100, Math.round(score)));
};

/**
 * Count syllables in text (simplified)
 */
function countSyllables(text: string): number {
  const words = text.split(/\s+/);
  let total = 0;

  for (const word of words) {
    total += Math.max(1, (word.match(/[aeiouy]/gi) || []).length);
  }

  return total;
}

/**
 * Analyze keyword density
 */
export const analyzeKeywordDensity = (text: string): Record<string, number> => {
  const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const wordCount = words.length;
  const frequency: Record<string, number> = {};

  // Common words to exclude
  const stopwords = new Set([
    'the', 'and', 'that', 'this', 'with', 'from', 'for', 'are', 'but', 'not',
    'have', 'been', 'their', 'which', 'would', 'could', 'should', 'about',
  ]);

  for (const word of words) {
    if (!stopwords.has(word)) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  }

  // Convert to percentages
  const density: Record<string, number> = {};
  for (const [word, count] of Object.entries(frequency)) {
    density[word] = (count / wordCount) * 100;
  }

  // Return top 10 keywords
  return Object.fromEntries(
    Object.entries(density)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  );
};

/**
 * Generate content recommendations
 */
export const generateContentRecommendations = (metrics: {
  wordCount: number;
  readabilityScore: number;
  headingStructure: { level: number; text: string }[];
  imageCount: number;
  internalLinks: number;
  keywordDensity: Record<string, number>;
}): string[] => {
  const recommendations: string[] = [];

  // Word count recommendation
  if (metrics.wordCount < 300) {
    recommendations.push('Content is too short. Aim for at least 300 words for better SEO.');
  } else if (metrics.wordCount > 5000) {
    recommendations.push('Consider breaking long content into multiple pages or using subheadings.');
  }

  // Readability recommendations
  if (metrics.readabilityScore < 50) {
    recommendations.push('Readability score is low. Use shorter sentences and simpler words.');
  } else if (metrics.readabilityScore > 80) {
    recommendations.push('Content is very easy to read. Consider adding more depth to technical topics.');
  }

  // Heading structure
  const h1Count = metrics.headingStructure.filter((h) => h.level === 1).length;
  if (h1Count === 0) {
    recommendations.push('Add an H1 heading to describe page topic.');
  } else if (h1Count > 1) {
    recommendations.push('Remove multiple H1 tags. Each page should have exactly one H1.');
  }

  // Image recommendations
  if (metrics.imageCount === 0) {
    recommendations.push('Add images to improve engagement and SEO.');
  } else if (metrics.imageCount > 10 && metrics.wordCount < 2000) {
    recommendations.push('Consider reducing number of images for better content balance.');
  }

  // Internal linking
  if (metrics.internalLinks === 0) {
    recommendations.push('Add internal links to related content.');
  } else if (metrics.internalLinks > 50) {
    recommendations.push('Too many internal links. Aim for 5-10 relevant internal links.');
  }

  // Keyword density
  const topKeywordDensity = Math.max(...Object.values(metrics.keywordDensity), 0);
  if (topKeywordDensity > 5) {
    recommendations.push('Keyword density too high. Avoid keyword stuffing.');
  } else if (topKeywordDensity < 1) {
    recommendations.push('Consider naturally incorporating target keywords into content.');
  }

  return recommendations;
};

/**
 * Get content quality score (0-100)
 */
export const getContentQualityScore = (analysis: ContentAnalysis): number => {
  let score = 100;

  // Deduct for issues
  if (analysis.wordCount < 300) score -= 10;
  if (analysis.wordCount > 5000) score -= 5;
  if (analysis.readabilityScore < 50) score -= 15;
  if (analysis.headingStructure.length === 0) score -= 10;
  if (analysis.imageCount === 0) score -= 5;
  if (analysis.internalLinks === 0) score -= 10;
  if (analysis.recommendations.length > 3) score -= 5;

  return Math.max(0, Math.min(100, score));
};

/**
 * Generate SEO content brief from analysis
 */
export const generateContentBrief = (analysis: ContentAnalysis): string => {
  return `
Content Analysis Report
=======================

Word Count: ${analysis.wordCount} words
Readability Score: ${analysis.readabilityScore}/100
Quality Score: ${getContentQualityScore(analysis)}/100

Recommendations:
${analysis.recommendations.map((r) => `- ${r}`).join('\n')}

Top Keywords:
${Object.entries(analysis.keywordDensity)
  .slice(0, 5)
  .map(([kw, density]) => `- ${kw}: ${density.toFixed(2)}%`)
  .join('\n')}
  `.trim();
};
