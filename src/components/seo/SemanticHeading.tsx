import React, { ReactNode } from 'react';

interface SemanticHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  id?: string;
  className?: string;
  hideAnchor?: boolean;
}

/**
 * SemanticHeading Component
 * Ensures proper heading hierarchy (H1-H6) and includes anchor links for better navigation
 * Validates that headings follow SEO best practices
 */
const getChildrenString = (children: React.ReactNode): string | undefined => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  return undefined;
};

export const SemanticHeading: React.FC<SemanticHeadingProps> = ({
  level,
  children,
  id,
  className = '',
  hideAnchor = false,
}) => {
  const HeadingTag = `h${level}` as const;
  const childStr = getChildrenString(children);
  const headingId = id || (childStr ? childStr.toLowerCase().replace(/\s+/g, '-') : undefined);

  // Base heading styles
  const baseStyles = {
    1: 'text-4xl md:text-5xl font-bold',
    2: 'text-3xl md:text-4xl font-bold',
    3: 'text-2xl md:text-3xl font-semibold',
    4: 'text-xl md:text-2xl font-semibold',
    5: 'text-lg md:text-xl font-semibold',
    6: 'text-base md:text-lg font-semibold',
  };

  const headingClass = `${baseStyles[level]} ${className}`;

  // Log heading hierarchy for debugging
  if (level === 1) {
    console.log('[SEO] H1 tag found:', children);
  }

  return (
    <HeadingTag id={headingId} className={headingClass}>
      <span className="inline-flex items-center gap-2 group">
        {children}
        {!hideAnchor && headingId && (
          <a
            href={`#${headingId}`}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Link to ${children}`}
            title="Copy link to this heading"
          >
            <span className="text-gray-400 hover:text-gray-600">#</span>
          </a>
        )}
      </span>
    </HeadingTag>
  );
};

interface HeadingStructureValidatorProps {
  children: React.ReactNode;
}

/**
 * HeadingStructureValidator
 * Validates heading hierarchy on a page and warns about improper structure
 */
export const HeadingStructureValidator: React.FC<HeadingStructureValidatorProps> = ({ children }) => {
  React.useEffect(() => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(headings).map((h) => parseInt(h.tagName[1]));

    // Check if there's exactly one H1
    const h1Count = headingLevels.filter((level) => level === 1).length;
    if (h1Count === 0) {
      console.warn('[SEO] Warning: No H1 tag found on page. Every page should have exactly one H1.');
    } else if (h1Count > 1) {
      console.warn(`[SEO] Warning: Found ${h1Count} H1 tags. Pages should have exactly one H1.`);
    }

    // Check hierarchy
    let previousLevel = 0;
    for (const level of headingLevels) {
      if (level > previousLevel + 1) {
        console.warn(
          `[SEO] Warning: Heading hierarchy broken. Jump from H${previousLevel} to H${level}.`
        );
      }
      previousLevel = level;
    }
  }, []);

  return <>{children}</>;
};
