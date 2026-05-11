/**
 * International SEO (i18n) Support
 * Manages hreflang tags and multi-language SEO optimization
 */

export type LanguageCode = 'en' | 'hi' | 'pa' | 'ta' | 'te' | 'kn' | 'ml' | 'mr' | 'gu';

export interface LanguageVariant {
  lang: LanguageCode;
  url: string;
  locale?: string; // e.g., 'en_IN', 'hi_IN'
}

export interface HrefLangConfig {
  currentLang: LanguageCode;
  variants: LanguageVariant[];
  xDefault?: string; // Default version URL
}

const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'Hindi',
  pa: 'Punjabi',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam',
  mr: 'Marathi',
  gu: 'Gujarati',
};

/**
 * Generate hreflang tags for multi-language pages
 */
export const generateHrefLangTags = (config: HrefLangConfig): string => {
  let html = '';

  // Add hreflang for each language variant
  for (const variant of config.variants) {
    html += `<link rel="alternate" hreflang="${variant.lang}" href="${variant.url}" />\n`;
  }

  // Add x-default for fallback language
  if (config.xDefault) {
    html += `<link rel="alternate" hreflang="x-default" href="${config.xDefault}" />\n`;
  }

  return html;
};

/**
 * Inject hreflang tags into document head
 */
export const injectHrefLangTags = (config: HrefLangConfig): (() => void) => {
  if (typeof document === 'undefined') return () => {};

  // Remove existing hreflang tags
  document.querySelectorAll('link[hreflang]').forEach((el) => el.remove());

  const head = document.head;

  // Add hreflang for each variant
  for (const variant of config.variants) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = variant.lang;
    link.href = variant.url;
    head.appendChild(link);
  }

  // Add x-default
  if (config.xDefault) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = 'x-default';
    link.href = config.xDefault;
    head.appendChild(link);
  }

  // Return cleanup function
  return () => {
    document.querySelectorAll('link[hreflang]').forEach((el) => el.remove());
  };
};

/**
 * Set og:locale meta tags for Open Graph
 */
export const setOpenGraphLocale = (locale: string, alternateLocales?: string[]): void => {
  if (typeof document === 'undefined') return;

  // Set primary locale
  let localeTag = document.querySelector('meta[property="og:locale"]');
  if (!localeTag) {
    localeTag = document.createElement('meta');
    localeTag.setAttribute('property', 'og:locale');
    document.head.appendChild(localeTag);
  }
  localeTag.setAttribute('content', locale);

  // Remove existing alternate locales
  document.querySelectorAll('meta[property="og:locale:alternate"]').forEach((el) => el.remove());

  // Add alternate locales
  if (alternateLocales) {
    for (const altLocale of alternateLocales) {
      const altTag = document.createElement('meta');
      altTag.setAttribute('property', 'og:locale:alternate');
      altTag.setAttribute('content', altLocale);
      document.head.appendChild(altTag);
    }
  }
};

/**
 * Detect user's language preference
 */
export const detectUserLanguage = (): LanguageCode => {
  if (typeof navigator === 'undefined') return 'en';

  const browserLang = navigator.language.split('-')[0] as LanguageCode;
  const supportedLangs: LanguageCode[] = ['en', 'hi', 'pa', 'ta', 'te', 'kn', 'ml', 'mr', 'gu'];

  return supportedLangs.includes(browserLang) ? browserLang : 'en';
};

/**
 * Generate language switcher configuration
 */
export const generateLanguageSwitcherConfig = (
  currentPath: string,
  supportedLanguages: LanguageCode[]
): Array<{
  lang: LanguageCode;
  name: string;
  url: string;
  isCurrent: boolean;
}> => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return supportedLanguages.map((lang) => ({
    lang,
    name: LANGUAGE_NAMES[lang],
    url: `${baseUrl}/${lang}${currentPath}`,
    isCurrent: false, // Set by component
  }));
};

/**
 * Format locale code (e.g., 'en' -> 'en_IN')
 */
export const formatLocaleCode = (lang: LanguageCode, country: string = 'IN'): string => {
  return `${lang}_${country}`;
};

/**
 * Get language-specific metadata
 */
export const getLanguageSpecificMetadata = (
  lang: LanguageCode,
  baseMetadata: Record<string, string>
): Record<string, string> => {
  const translations: Record<LanguageCode, Record<string, string>> = {
    en: baseMetadata,
    hi: { /* Hindi translations */ },
    pa: { /* Punjabi translations */ },
    ta: { /* Tamil translations */ },
    te: { /* Telugu translations */ },
    kn: { /* Kannada translations */ },
    ml: { /* Malayalam translations */ },
    mr: { /* Marathi translations */ },
    gu: { /* Gujarati translations */ },
  };

  return translations[lang] || baseMetadata;
};

/**
 * Create language-specific sitemap URL
 */
export const generateLanguageSitemapUrl = (lang: LanguageCode): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://farm-intellect-65.lovable.app';
  return `${baseUrl}/sitemap-${lang}.xml`;
};
