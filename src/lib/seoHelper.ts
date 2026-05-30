/**
 * SEO Helper Utilities
 * Provides reusable functions for managing page metadata, schema markup, and canonical URLs
 */

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
}

export interface SocialMetaTags {
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterCreator?: string;
}

const SITE_NAME = "Farm Intellect";
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://farm-intellect-65.lovable.app";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * Generate a standardized page title with site name
 */
export function generatePageTitle(pageTitle: string, includePrefix = true): string {
  if (!includePrefix) return pageTitle;
  return `${pageTitle} | ${SITE_NAME}`;
}

/**
 * Create meta tag objects for HTML head
 */
export function createMetaTags(metadata: PageMetadata) {
  return {
    title: generatePageTitle(metadata.title),
    description: metadata.description || "",
    keywords: metadata.keywords?.join(", ") || "",
    image: metadata.image || DEFAULT_IMAGE,
  };
}

/**
 * Generate Open Graph and Twitter card meta tags with full support
 */
export function generateSocialMetaTags(metadata: PageMetadata): SocialMetaTags {
  return {
    ogTitle: metadata.title,
    ogDescription: metadata.description,
    ogImage: metadata.image || DEFAULT_IMAGE,
    ogType: metadata.type || "website",
    twitterCard: "summary_large_image",
    twitterCreator: "@FarmIntellect",
  };
}

/**
 * Set Open Graph meta tags in document head
 */
export function setOpenGraphTags(metadata: PageMetadata): void {
  const socialTags = generateSocialMetaTags(metadata);
  
  // og:title
  setMetaTag("og:title", socialTags.ogTitle);
  
  // og:description
  setMetaTag("og:description", socialTags.ogDescription);
  
  // og:image
  setMetaTag("og:image", socialTags.ogImage);
  
  // og:image:alt
  setMetaTag("og:image:alt", socialTags.ogDescription);
  
  // og:type
  setMetaTag("og:type", socialTags.ogType);
  
  // og:url
  const canonicalUrl = typeof window !== "undefined" ? window.location.href : SITE_URL;
  setMetaTag("og:url", canonicalUrl);
  
  // og:site_name
  setMetaTag("og:site_name", SITE_NAME);
  
  // og:locale
  setMetaTag("og:locale", "en_IN");
}

/**
 * Set Twitter Card meta tags in document head
 */
export function setTwitterCardTags(metadata: PageMetadata): void {
  const socialTags = generateSocialMetaTags(metadata);
  
  // twitter:card
  setMetaTag("twitter:card", socialTags.twitterCard);
  
  // twitter:title
  setMetaTag("twitter:title", socialTags.ogTitle);
  
  // twitter:description
  setMetaTag("twitter:description", socialTags.ogDescription);
  
  // twitter:image
  setMetaTag("twitter:image", socialTags.ogImage);
  
  // twitter:creator
  setMetaTag("twitter:creator", socialTags.twitterCreator);
  
  // twitter:site
  setMetaTag("twitter:site", "@FarmIntellect");
}

/**
 * Helper function to set or update a meta tag
 */
function setMetaTag(property: string, content: string): void {
  if (typeof document === "undefined") return;
  
  let tag = document.querySelector(`meta[property="${property}"]`) ||
            document.querySelector(`meta[name="${property}"]`);
  
  if (!tag) {
    tag = document.createElement("meta");
    if (property.startsWith("og:") || property.startsWith("twitter:")) {
      tag.setAttribute("property", property);
    } else {
      tag.setAttribute("name", property);
    }
    document.head.appendChild(tag);
  }
  
  tag.setAttribute("content", content);
}

/**
 * Generate Facebook App ID meta tag
 */
export function setFacebookAppId(appId: string): void {
  setMetaTag("fb:app_id", appId);
}

/**
 * Set all social meta tags at once
 */
export function setSocialMetaTags(metadata: PageMetadata): void {
  setOpenGraphTags(metadata);
  setTwitterCardTags(metadata);
  setPinterestTags(metadata);
  setLinkedInTags(metadata);
  setDiscordTags(metadata);
}

/**
 * Set Pinterest meta tags for rich pins
 */
export function setPinterestTags(metadata: PageMetadata): void {
  setMetaTag("pinterest:description", metadata.description);
  setMetaTag("pinterest:media", metadata.image || DEFAULT_IMAGE);
  setMetaTag("pinterest-rich-pin", "true");
}

/**
 * Set LinkedIn meta tags
 */
export function setLinkedInTags(metadata: PageMetadata): void {
  setMetaTag("linkedin:title", metadata.title);
  setMetaTag("linkedin:description", metadata.description);
  setMetaTag("linkedin:url", typeof window !== "undefined" ? window.location.href : SITE_URL);
}

/**
 * Set Discord embed tags for bot previews
 */
export function setDiscordTags(metadata: PageMetadata): void {
  // Discord uses Open Graph tags but also supports theme color
  setMetaTag("theme-color", "#1a7d3a");
  
  // Optional: Discord bot specific tags
  setMetaTag("discord:title", metadata.title);
  setMetaTag("discord:description", metadata.description);
}

/**
 * Set WhatsApp preview tags
 */
export function setWhatsAppTags(metadata: PageMetadata): void {
  setMetaTag("og:title", metadata.title);
  setMetaTag("og:description", metadata.description);
  setMetaTag("og:image", metadata.image || DEFAULT_IMAGE);
  setMetaTag("og:url", typeof window !== "undefined" ? window.location.href : SITE_URL);
}

/**
 * Set Slack unfurl optimization tags
 */
export function setSlackTags(metadata: PageMetadata): void {
  setMetaTag("slack-app-id", "farm-intellect");
  setOpenGraphTags(metadata);
  setMetaTag("twitter:card", "summary_large_image");
}

/**
 * Create a canonical URL for a page
 */
export function createCanonicalUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

/**
 * Generate JSON-LD schema for Organization (for homepage)
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "AI-powered agricultural insights and technology platform for farmers, merchants, and experts",
    sameAs: [
      "https://www.facebook.com/farmintelect",
      "https://www.twitter.com/farmintelect",
      "https://www.linkedin.com/company/farmintelect",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@farm-intellect.com",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
      addressLocality: "Punjab",
    },
  };
}

/**
 * Generate JSON-LD schema for WebSite (for search action)
 */
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      query_input: "required name=search_term_string",
    },
  };
}

/**
 * Generate JSON-LD schema for BreadcrumbList
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate JSON-LD schema for FAQPage
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate JSON-LD schema for Article/NewsArticle
 */
export function generateArticleSchema(metadata: PageMetadata & { datePublished?: string; dateModified?: string; author?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: metadata.title,
    description: metadata.description,
    image: metadata.image || DEFAULT_IMAGE,
    datePublished: metadata.datePublished || new Date().toISOString(),
    dateModified: metadata.dateModified || new Date().toISOString(),
    author: metadata.author || SITE_NAME,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}

/**
 * Inject a JSON-LD script into the document head
 */
export function injectJsonLdSchema(schema: Record<string, any>) {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
  
  return () => {
    document.head.removeChild(script);
  };
}

/**
 * Update document title
 */
export function updateDocumentTitle(title: string) {
  document.title = title;
  
  // Also update og:title
  let ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
  if (!ogTitle) {
    ogTitle = document.createElement("meta");
    ogTitle.setAttribute("property", "og:title");
    document.head.appendChild(ogTitle);
  }
  ogTitle.content = title;
}

/**
 * Update meta description
 */
export function updateMetaDescription(description: string) {
  let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
  if (!metaDescription) {
    metaDescription = document.createElement("meta");
    metaDescription.setAttribute("name", "description");
    document.head.appendChild(metaDescription);
  }
  metaDescription.content = description;
  
  // Also update og:description
  let ogDescription = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
  if (!ogDescription) {
    ogDescription = document.createElement("meta");
    ogDescription.setAttribute("property", "og:description");
    document.head.appendChild(ogDescription);
  }
  ogDescription.content = description;
}

/**
 * Update canonical URL
 */
export function updateCanonicalUrl(url: string) {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.href = url;
  
  // Also update og:url
  let ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
  if (!ogUrl) {
    ogUrl = document.createElement("meta");
    ogUrl.setAttribute("property", "og:url");
    document.head.appendChild(ogUrl);
  }
  ogUrl.content = url;
}

/**
 * Update Open Graph image
 */
export function updateOpenGraphImage(imageUrl: string) {
  let ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
  if (!ogImage) {
    ogImage = document.createElement("meta");
    ogImage.setAttribute("property", "og:image");
    document.head.appendChild(ogImage);
  }
  ogImage.content = imageUrl;
}

/**
 * Set all page metadata at once
 */
export function setPageMetadata(metadata: PageMetadata) {
  updateDocumentTitle(generatePageTitle(metadata.title));
  updateMetaDescription(metadata.description);
  updateCanonicalUrl(metadata.url || SITE_URL);
  if (metadata.image) {
    updateOpenGraphImage(metadata.image);
  }
}
