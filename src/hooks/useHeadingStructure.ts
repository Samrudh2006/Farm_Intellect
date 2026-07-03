import { useEffect, useCallback } from 'react';

interface HeadingStructureIssue {
  level: number;
  text: string;
  message: string;
}

/**
 * Hook to validate and monitor heading structure on a page
 * Returns issues found and validation status
 */
export const useHeadingStructure = () => {
  const validateHeadings = useCallback((): HeadingStructureIssue[] => {
    const issues: HeadingStructureIssue[] = [];
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

    if (headings.length === 0) {
      issues.push({
        level: 0,
        text: 'No headings',
        message: 'No headings found on page',
      });
      return issues;
    }

    const headingLevels = Array.from(headings).map((h) => {
      const level = parseInt(h.tagName[1]);
      return { level, text: h.textContent || '', element: h };
    });

    // Check for single H1
    const h1Count = headingLevels.filter((h) => h.level === 1).length;
    if (h1Count === 0) {
      issues.push({
        level: 1,
        text: 'Missing H1',
        message: 'Page must have exactly one H1 tag',
      });
    } else if (h1Count > 1) {
      issues.push({
        level: 1,
        text: `Multiple H1s (${h1Count})`,
        message: `Found ${h1Count} H1 tags. Should have exactly one.`,
      });
    }

    // Check hierarchy
    let previousLevel = 0;
    for (const heading of headingLevels) {
      if (heading.level > previousLevel + 1) {
        issues.push({
          level: heading.level,
          text: heading.text,
          message: `Hierarchy broken: Jump from H${previousLevel} to H${heading.level}`,
        });
      }
      previousLevel = heading.level;
    }

    return issues;
  }, []);

  const issues = useEffect(() => {
    const headingIssues = validateHeadings();
    if (headingIssues.length > 0) {
      console.warn('[SEO] Heading structure issues:', headingIssues);
    }
  }, [validateHeadings]);

  return { validateHeadings };
};

/**
 * Get all headings on a page with hierarchy information
 */
export const getPageHeadings = (): Array<{
  level: number;
  text: string;
  id?: string;
}> => {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  return Array.from(headings).map((h) => ({
    level: parseInt(h.tagName[1]),
    text: h.textContent || '',
    id: h.id,
  }));
};

/**
 * Generate table of contents from page headings
 */
export const generateTableOfContents = (): Array<{
  level: number;
  text: string;
  id: string;
  indent: number;
}> => {
  const headings = getPageHeadings();
  const minLevel = Math.min(...headings.map((h) => h.level));

  return headings
    .filter((h): h is { level: number; text: string; id: string } => Boolean(h.id))
    .map((h) => ({
      ...h,
      indent: h.level - minLevel,
    }));
};
