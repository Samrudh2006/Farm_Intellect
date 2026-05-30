/**
 * Advanced Schema Markup Generators for Farm Intellect
 * Includes FAQ, HowTo, Article, Video, Offer, AggregateRating schemas
 */

import { PageMetadata } from "./seoHelper";

/**
 * FAQ Schema - For common agricultural questions
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
 * HowTo Schema - For agricultural guides
 */
export function generateHowToSchema(
  name: string,
  description: string,
  steps: Array<{
    name: string;
    description: string;
    image?: string;
  }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.description,
      image: step.image,
    })),
  };
}

/**
 * Article Schema - For blog posts and guides
 */
export function generateArticleSchema(metadata: PageMetadata & { content?: string; author?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: metadata.title,
    description: metadata.description,
    image: metadata.image,
    datePublished: metadata.publishedDate,
    dateModified: metadata.modifiedDate || metadata.publishedDate,
    author: {
      "@type": "Person",
      name: metadata.author || "Farm Intellect Team",
    },
    publisher: {
      "@type": "Organization",
      name: "Farm Intellect",
      logo: {
        "@type": "ImageObject",
        url: "https://farm-intellect-65.lovable.app/logo.png",
        width: 250,
        height: 60,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": typeof window !== "undefined" ? window.location.href : "https://farm-intellect-65.lovable.app",
    },
  };
}

/**
 * VideoObject Schema - For embedded videos
 */
export function generateVideoSchema(
  name: string,
  description: string,
  thumbnailUrl: string,
  uploadDate: string,
  duration: string = "PT5M"
) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    thumbnailUrl,
    uploadDate,
    duration,
  };
}

/**
 * ItemList Schema - For collections
 */
export function generateItemListSchema(
  name: string,
  items: Array<{ name: string; url: string; position: number }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  };
}

/**
 * Offer Schema - For products/services with pricing
 */
export function generateOfferSchema(
  productName: string,
  price: number,
  priceCurrency: string = "INR",
  availability: string = "InStock",
  description?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: productName,
    description: description || productName,
    price: price.toString(),
    priceCurrency,
    availability: `https://schema.org/${availability}`,
    url: typeof window !== "undefined" ? window.location.href : "https://farm-intellect-65.lovable.app",
  };
}

/**
 * AggregateRating Schema - For products with ratings
 */
export function generateAggregateRatingSchema(
  itemName: string,
  ratingValue: number,
  ratingCount: number,
  bestRating: number = 5,
  worstRating: number = 1
) {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    itemReviewed: {
      "@type": "Product",
      name: itemName,
    },
    ratingValue: ratingValue.toString(),
    ratingCount,
    bestRating,
    worstRating,
  };
}

/**
 * Review Schema - For user reviews
 */
export function generateReviewSchema(
  itemName: string,
  reviewRating: number,
  reviewText: string,
  reviewerName: string,
  publishDate: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Product",
      name: itemName,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: reviewRating.toString(),
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: reviewText,
    author: {
      "@type": "Person",
      name: reviewerName,
    },
    datePublished: publishDate,
  };
}

/**
 * Composite Schema - Combine multiple schemas
 */
export function generateCompositeSchema(...schemas: any[]) {
  return {
    "@context": "https://schema.org",
    "@graph": schemas,
  };
}

/**
 * Inject schema markup into document head
 */
export function injectSchema(schema: any): void {
  if (typeof document === "undefined") return;

  let scriptTag = document.querySelector("script[type='application/ld+json'][data-type='schema']");
  if (!scriptTag) {
    scriptTag = document.createElement("script");
    scriptTag.type = "application/ld+json";
    scriptTag.setAttribute("data-type", "schema");
    document.head.appendChild(scriptTag);
  }

  scriptTag.textContent = JSON.stringify(schema);
}

/**
 * Validate schema structure
 */
export function validateSchema(schema: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!schema["@context"]) {
    errors.push("Missing @context property");
  }

  if (!schema["@type"]) {
    errors.push("Missing @type property");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate structured data for local business
 */
export function generateLocalBusinessSchema(
  name: string,
  address: string,
  phone: string,
  website: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    image: "https://farm-intellect-65.lovable.app/logo.png",
    address: {
      "@type": "PostalAddress",
      streetAddress: address.split(",")[0],
      addressLocality: address.split(",")[1],
      addressCountry: "IN",
    },
    telephone: phone,
    url: website,
    priceRange: "₹",
  };
}
