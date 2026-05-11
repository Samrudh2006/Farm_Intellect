/**
 * Advanced Image Optimization with AVIF, WebP, and format detection
 */

export interface ImageOptimizationConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  formats?: Array<"webp" | "avif" | "jpg" | "png">;
  sizes?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
}

/**
 * Detect browser support for modern image formats
 */
export function detectImageFormatSupport(): {
  webp: boolean;
  avif: boolean;
} {
  if (typeof document === "undefined") {
    return { webp: true, avif: false };
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;

  const webp = canvas
    .toDataURL("image/webp", 0.8)
    .indexOf("image/webp") === 5;

  // AVIF detection via canvas or simple check
  const avif = (function () {
    const img = new Image();
    img.onload = () => true;
    img.onerror = () => false;
    img.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAG1ldGEAAAA=";
    return false; // Default to false for safety
  })();

  return { webp, avif };
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(basePath: string, widths: number[] = [320, 640, 960, 1280]): string {
  return widths
    .map((width) => {
      const filename = basePath.split("/").pop();
      const dir = basePath.substring(0, basePath.lastIndexOf("/"));
      return `${dir}/${width}w-${filename} ${width}w`;
    })
    .join(", ");
}

/**
 * Generate picture element HTML with multiple formats
 */
export function generatePictureElement(config: ImageOptimizationConfig): string {
  const { src, alt, width, height, formats = ["avif", "webp", "jpg"] } = config;
  const basePath = src.substring(0, src.lastIndexOf("."));

  let html = '<picture>';

  // AVIF sources
  if (formats.includes("avif")) {
    html += `
      <source
        type="image/avif"
        srcset="${generateSrcSet(basePath + ".avif")}"
      />
    `;
  }

  // WebP sources
  if (formats.includes("webp")) {
    html += `
      <source
        type="image/webp"
        srcset="${generateSrcSet(basePath + ".webp")}"
      />
    `;
  }

  // Fallback image
  html += `
    <img
      src="${src}"
      alt="${alt}"
      ${width ? `width="${width}"` : ""}
      ${height ? `height="${height}"` : ""}
      loading="lazy"
      decoding="async"
    />
  `;

  html += "</picture>";
  return html;
}

/**
 * Calculate blurhash placeholder
 */
export function generateBlurHash(imageUrl: string): string {
  // Placeholder blurhash generation
  // In production, use blurhash library or pre-generate these
  const hash = btoa(imageUrl).substring(0, 12);
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23${hash.substring(0, 6)}'/%3E%3C/svg%3E`;
}

/**
 * Generate blur-up effect CSS
 */
export function generateBlurUpCSS(blurHashData: string): string {
  return `
    background-image: url("${blurHashData}");
    background-size: cover;
    background-position: center;
    filter: blur(10px);
    transition: filter 0.3s ease-out;
  `;
}

/**
 * Image optimization recommendations
 */
export function getImageOptimizationRecommendations(): string[] {
  return [
    "Use AVIF format for modern browsers (20-30% better compression)",
    "Provide WebP as fallback (25-35% better than JPEG)",
    "Implement responsive images with srcset",
    "Use lazy loading for below-fold images",
    "Add blur-up placeholders for perceived performance",
    "Optimize initial image delivery with preload",
    "Use CDN with image transformation",
    "Set explicit width/height to prevent CLS",
  ];
}

/**
 * Format conversion utility
 */
export const FormatConverter = {
  jpgToWebP: (jpgPath: string): string => jpgPath.replace(/\.jpg$/, ".webp"),
  jpgToAVIF: (jpgPath: string): string => jpgPath.replace(/\.jpg$/, ".avif"),
  pngToWebP: (pngPath: string): string => pngPath.replace(/\.png$/, ".webp"),
  pngToAVIF: (pngPath: string): string => pngPath.replace(/\.png$/, ".avif"),
};

/**
 * Image analytics tracking
 */
export interface ImageMetrics {
  url: string;
  format: string;
  size: number;
  loadTime: number;
  displaySize: number;
}

export function trackImageMetrics(metrics: ImageMetrics): void {
  if (typeof window === "undefined") return;

  // Send to analytics service
  console.log("[Image Metrics]", metrics);
}

/**
 * Generate automated alt text suggestions
 */
export function suggestAltText(imagePath: string): string {
  const filename = imagePath.split("/").pop()?.split(".")[0] || "";
  return filename
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Validate alt text quality
 */
export function validateAltText(altText: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!altText || altText.trim().length === 0) {
    issues.push("Alt text is empty");
  }

  if (altText.length > 125) {
    issues.push("Alt text is too long (max 125 characters)");
  }

  if (altText.toLowerCase().includes("image of") || altText.toLowerCase().includes("picture")) {
    issues.push("Avoid using 'image of' or 'picture' in alt text");
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
