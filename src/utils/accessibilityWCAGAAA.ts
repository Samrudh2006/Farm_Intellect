/**
 * WCAG AAA Accessibility Compliance Checker
 * Advanced accessibility audit suite
 */

export interface AccessibilityAuditResult {
  category: string;
  issues: Array<{
    level: "critical" | "error" | "warning" | "info";
    message: string;
    selector?: string;
    fix?: string;
  }>;
  score: number;
}

export class AccessibilityAuditWCAGAAA {
  private results: AccessibilityAuditResult[] = [];

  /**
   * Audit color contrast (WCAG AAA: 7:1 minimum)
   */
  auditColorContrast(): AccessibilityAuditResult {
    const issues: AccessibilityAuditResult["issues"] = [];

    const textElements = document.querySelectorAll("p, span, a, button, label, h1, h2, h3, h4, h5, h6");

    textElements.forEach((element) => {
      const computed = window.getComputedStyle(element);
      const fgColor = computed.color;
      const bgColor = computed.backgroundColor;

      const contrast = this.calculateContrast(fgColor, bgColor);

      if (contrast < 7) {
        issues.push({
          level: contrast < 4.5 ? "critical" : "warning",
          message: `Insufficient color contrast: ${contrast.toFixed(2)}:1 (required: 7:1)`,
          selector: element.className || element.tagName,
          fix: "Increase color contrast between foreground and background",
        });
      }
    });

    return {
      category: "Color Contrast (WCAG AAA)",
      issues,
      score: Math.max(0, 100 - issues.filter((i) => i.level === "critical").length * 10),
    };
  }

  /**
   * Calculate WCAG contrast ratio
   */
  private calculateContrast(color1: string, color2: string): number {
    const rgb1 = this.parseRGB(color1);
    const rgb2 = this.parseRGB(color2);

    if (!rgb1 || !rgb2) return 1;

    const lum1 = this.calculateLuminance(rgb1);
    const lum2 = this.calculateLuminance(rgb2);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  private parseRGB(color: string): { r: number; g: number; b: number } | null {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
    }
    return null;
  }

  private calculateLuminance(rgb: { r: number; g: number; b: number }): number {
    const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((val) =>
      val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Audit ARIA labels and roles
   */
  auditARIA(): AccessibilityAuditResult {
    const issues: AccessibilityAuditResult["issues"] = [];

    // Check for ARIA labels on interactive elements
    const interactiveElements = document.querySelectorAll(
      "button, a[href], input, select, textarea, [role]"
    );

    interactiveElements.forEach((element) => {
      const hasLabel = element.getAttribute("aria-label") || element.textContent?.trim();
      const hasRole = element.getAttribute("role");

      if (!hasLabel && !hasRole) {
        issues.push({
          level: "error",
          message: "Interactive element missing accessible label",
          selector: element.className || element.tagName,
          fix: 'Add aria-label or ensure element has visible text',
        });
      }
    });

    return {
      category: "ARIA Labels and Roles",
      issues,
      score: Math.max(0, 100 - issues.filter((i) => i.level === "error").length * 5),
    };
  }

  /**
   * Audit keyboard navigation
   */
  auditKeyboardNavigation(): AccessibilityAuditResult {
    const issues: AccessibilityAuditResult["issues"] = [];

    const focusableElements = document.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex], [role="button"]'
    );

    const focusableArray = Array.from(focusableElements) as HTMLElement[];

    // Check for visible focus indicators
    focusableArray.forEach((element) => {
      const computed = window.getComputedStyle(element, ":focus");
      const hasFocusStyle = computed.outline !== "none" || computed.boxShadow !== "none";

      if (!hasFocusStyle) {
        issues.push({
          level: "warning",
          message: "Focusable element missing visible focus indicator",
          selector: element.className || element.tagName,
          fix: "Add CSS :focus styles with outline or box-shadow",
        });
      }
    });

    return {
      category: "Keyboard Navigation",
      issues,
      score: Math.max(0, 100 - issues.length * 3),
    };
  }

  /**
   * Audit heading structure
   */
  auditHeadingStructure(): AccessibilityAuditResult {
    const issues: AccessibilityAuditResult["issues"] = [];

    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    const headingLevels = headings.map((h) => parseInt(h.tagName[1]));

    // Check for single H1
    const h1Count = headingLevels.filter((level) => level === 1).length;
    if (h1Count !== 1) {
      issues.push({
        level: h1Count === 0 ? "critical" : "error",
        message: `Page has ${h1Count} H1 tags (should be exactly 1)`,
        fix: "Ensure page has exactly one H1 tag",
      });
    }

    // Check for proper hierarchy
    for (let i = 1; i < headingLevels.length; i++) {
      const levelDiff = headingLevels[i] - headingLevels[i - 1];
      if (levelDiff > 1) {
        issues.push({
          level: "warning",
          message: `Heading hierarchy skipped from H${headingLevels[i - 1]} to H${headingLevels[i]}`,
          fix: "Use proper heading hierarchy without skipping levels",
        });
      }
    }

    return {
      category: "Heading Structure",
      issues,
      score: Math.max(0, 100 - issues.filter((i) => i.level === "critical").length * 20),
    };
  }

  /**
   * Audit form accessibility
   */
  auditFormAccessibility(): AccessibilityAuditResult {
    const issues: AccessibilityAuditResult["issues"] = [];

    const forms = document.querySelectorAll("form, [role='form']");

    forms.forEach((form) => {
      const inputs = form.querySelectorAll("input, select, textarea");

      inputs.forEach((input) => {
        const hasLabel = form.querySelector(`label[for="${input.id}"]`) || input.getAttribute("aria-label");

        if (!hasLabel) {
          issues.push({
            level: "error",
            message: "Form input missing associated label",
            selector: input.className || input.tagName,
            fix: "Add <label> element or aria-label for form input",
          });
        }
      });
    });

    return {
      category: "Form Accessibility",
      issues,
      score: Math.max(0, 100 - issues.length * 5),
    };
  }

  /**
   * Run complete WCAG AAA audit
   */
  runCompleteAudit(): AccessibilityAuditResult[] {
    this.results = [
      this.auditColorContrast(),
      this.auditARIA(),
      this.auditKeyboardNavigation(),
      this.auditHeadingStructure(),
      this.auditFormAccessibility(),
    ];

    return this.results;
  }

  /**
   * Get overall accessibility score
   */
  getOverallScore(): number {
    if (this.results.length === 0) return 0;
    const avgScore = this.results.reduce((sum, result) => sum + result.score, 0) / this.results.length;
    return Math.round(avgScore);
  }

  /**
   * Get accessibility report
   */
  getReport(): {
    score: number;
    status: "excellent" | "good" | "fair" | "poor";
    results: AccessibilityAuditResult[];
    totalIssues: number;
  } {
    const totalIssues = this.results.reduce((sum, result) => sum + result.issues.length, 0);
    const score = this.getOverallScore();

    return {
      score,
      status: score >= 90 ? "excellent" : score >= 75 ? "good" : score >= 50 ? "fair" : "poor",
      results: this.results,
      totalIssues,
    };
  }
}

// Singleton instance
let auditInstance: AccessibilityAuditWCAGAAA | null = null;

export function initAccessibilityAudit(): AccessibilityAuditWCAGAAA {
  if (!auditInstance && typeof window !== "undefined") {
    auditInstance = new AccessibilityAuditWCAGAAA();
  }
  return auditInstance!;
}
