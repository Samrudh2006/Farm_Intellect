/**
 * Accessibility Utilities for SEO
 * Helpers for improving accessibility which also benefits SEO
 */

import { ReactNode } from 'react';

/**
 * Check contrast ratio between two colors
 * Ensures WCAG AA compliance (4.5:1 for normal text)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    const rgb = parseInt(color.replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const luminance =
      (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance <= 0.03928
      ? luminance / 12.92
      : Math.pow((luminance + 0.055) / 1.055, 2.4);
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Validate contrast ratio compliance
 */
export const validateContrast = (color1: string, color2: string): {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
} => {
  const ratio = getContrastRatio(color1, color2);

  return {
    ratio: Math.round(ratio * 100) / 100,
    wcagAA: ratio >= 4.5, // Normal text
    wcagAAA: ratio >= 7, // Enhanced contrast
  };
};

/**
 * Accessibility hook for managing focus and keyboard navigation
 */
export const useAccessibility = () => {
  const addSkipToContentLink = () => {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'sr-only focus:not-sr-only';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.position = 'absolute';
    skipLink.style.top = '-40px';
    skipLink.style.left = '0';
    skipLink.style.background = '#000';
    skipLink.style.color = 'white';
    skipLink.style.padding = '8px';
    skipLink.style.zIndex = '9999';

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    document.body.prepend(skipLink);

    return () => document.body.removeChild(skipLink);
  };

  const enableKeyboardNavigation = (elementSelector: string) => {
    const elements = document.querySelectorAll(elementSelector);

    elements.forEach((element) => {
      if (!(element as HTMLElement).hasAttribute('tabindex')) {
        (element as HTMLElement).setAttribute('tabindex', '0');
      }

      element.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          (element as HTMLElement).click();
        }
      });
    });
  };

  const addAriaLabels = (element: HTMLElement, label: string) => {
    element.setAttribute('aria-label', label);
  };

  const announceToScreenReaders = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return {
    addSkipToContentLink,
    enableKeyboardNavigation,
    addAriaLabels,
    announceToScreenReaders,
  };
};

/**
 * Validate image accessibility
 */
export const validateImageAccessibility = (): {
  missing: HTMLImageElement[];
  empty: HTMLImageElement[];
  good: HTMLImageElement[];
} => {
  const images = Array.from(document.querySelectorAll('img'));

  return {
    missing: images.filter((img) => !img.hasAttribute('alt')),
    empty: images.filter((img) => img.getAttribute('alt') === ''),
    good: images.filter((img) => img.hasAttribute('alt') && (img.getAttribute('alt')?.length ?? 0) > 0),
  };
};

/**
 * Check page for accessibility issues
 */
export const auditPageAccessibility = (): {
  issues: string[];
  score: number;
} => {
  const issues: string[] = [];

  // Check for images without alt text
  const { missing: missingAlt } = validateImageAccessibility();
  if (missingAlt.length > 0) {
    issues.push(`${missingAlt.length} images without alt text`);
  }

  // Check for proper heading structure
  const h1s = document.querySelectorAll('h1');
  if (h1s.length !== 1) {
    issues.push(`Expected 1 H1 tag, found ${h1s.length}`);
  }

  // Check for form labels
  const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
  const unlabeledInputs = inputs.filter(
    (input) => !document.querySelector(`label[for="${(input as any).id}"]`)
  );
  if (unlabeledInputs.length > 0) {
    issues.push(`${unlabeledInputs.length} form inputs without labels`);
  }

  // Check for keyboard navigation
  const interactiveElements = Array.from(
    document.querySelectorAll('button, a, input, [role="button"]')
  );
  const notKeyboardAccessible = interactiveElements.filter(
    (el) => !((el as any).hasAttribute('tabindex') || ['BUTTON', 'A', 'INPUT'].includes((el as any).tagName))
  );
  if (notKeyboardAccessible.length > 0) {
    issues.push(`${notKeyboardAccessible.length} interactive elements not keyboard accessible`);
  }

  const score = Math.max(0, 100 - issues.length * 10);

  return { issues, score };
};
