/**
 * JSON-LD Schema Markup Generators
 * Advanced schema definitions for SEO rich snippets and structured data
 */

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ArticleMetadata {
  headline: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  keywords?: string[];
}

const SITE_NAME = "Farm-Intellect";
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://farm-intellect-65.lovable.app";

/**
 * Generate LocalBusiness schema for farm-related businesses
 */
export function generateLocalBusinessSchema(businessData: {
  name: string;
  description: string;
  address: string;
  phone?: string;
  email?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: businessData.name,
    description: businessData.description,
    image: businessData.image,
    address: {
      "@type": "PostalAddress",
      streetAddress: businessData.address,
      addressCountry: "IN",
    },
    telephone: businessData.phone,
    email: businessData.email,
    url: SITE_URL,
  };
}

/**
 * Generate Product schema for agricultural products
 */
export function generateProductSchema(productData: {
  name: string;
  description: string;
  image: string;
  price?: number;
  currency?: string;
  availability?: string;
  ratingValue?: number;
  reviewCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productData.name,
    description: productData.description,
    image: productData.image,
    offers: {
      "@type": "Offer",
      price: productData.price || "0",
      priceCurrency: productData.currency || "INR",
      availability: productData.availability || "InStock",
    },
    ...(productData.ratingValue && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: productData.ratingValue,
        reviewCount: productData.reviewCount || 0,
      },
    }),
  };
}

/**
 * Generate Event schema for agricultural events/webinars
 */
export function generateEventSchema(eventData: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  image?: string;
  organizer?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: eventData.name,
    description: eventData.description,
    startDate: eventData.startDate,
    ...(eventData.endDate && { endDate: eventData.endDate }),
    location: {
      "@type": "Place",
      name: eventData.location,
    },
    image: eventData.image,
    organizer: {
      "@type": "Organization",
      name: eventData.organizer || SITE_NAME,
    },
    url: SITE_URL,
  };
}

/**
 * Generate HowTo schema for farming tutorials/guides
 */
export function generateHowToSchema(howToData: {
  name: string;
  description: string;
  steps: Array<{ name: string; description: string; image?: string }>;
  totalTime?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: howToData.name,
    description: howToData.description,
    image: howToData.image,
    ...(howToData.totalTime && { totalTime: howToData.totalTime }),
    step: howToData.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.description,
      ...(step.image && {
        image: {
          "@type": "ImageObject",
          url: step.image,
        },
      }),
    })),
  };
}

/**
 * Generate AggregateRating schema for reviews/ratings
 */
export function generateAggregateRatingSchema(ratingData: {
  bestRating?: number;
  worstRating?: number;
  ratingValue: number;
  reviewCount: number;
  name: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    bestRating: ratingData.bestRating || 5,
    worstRating: ratingData.worstRating || 1,
    ratingValue: ratingData.ratingValue,
    reviewCount: ratingData.reviewCount,
    name: ratingData.name,
  };
}

/**
 * Generate Review schema for individual reviews
 */
export function generateReviewSchema(reviewData: {
  headline: string;
  reviewBody: string;
  ratingValue: number;
  reviewerName: string;
  datePublished?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    headline: reviewData.headline,
    reviewBody: reviewData.reviewBody,
    reviewRating: {
      "@type": "Rating",
      ratingValue: reviewData.ratingValue,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      "@type": "Person",
      name: reviewData.reviewerName,
    },
    datePublished: reviewData.datePublished || new Date().toISOString(),
  };
}

/**
 * Generate DataFeedItem schema for market data/prices
 */
export function generateDataFeedItemSchema(dataFeedData: {
  itemName: string;
  description: string;
  price: number;
  priceCurrency?: string;
  availability?: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "DataFeedItem",
    item: {
      "@type": "Product",
      name: dataFeedData.itemName,
      description: dataFeedData.description,
      offers: {
        "@type": "Offer",
        price: dataFeedData.price,
        priceCurrency: dataFeedData.priceCurrency || "INR",
        availability: dataFeedData.availability || "InStock",
      },
    },
    dateModified: dataFeedData.dateModified || new Date().toISOString(),
  };
}

/**
 * Generate VideoObject schema for instructional videos
 */
export function generateVideoObjectSchema(videoData: {
  name: string;
  description: string;
  uploadDate: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration?: string;
  ratingValue?: number;
  reviewCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: videoData.name,
    description: videoData.description,
    uploadDate: videoData.uploadDate,
    thumbnailUrl: videoData.thumbnailUrl,
    contentUrl: videoData.videoUrl,
    ...(videoData.duration && { duration: videoData.duration }),
    ...(videoData.ratingValue && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: videoData.ratingValue,
        reviewCount: videoData.reviewCount || 0,
      },
    }),
  };
}

/**
 * Generate Speakable schema for voice search optimization
 */
export function generateSpeakableSchema(content: {
  text: string;
  cssSelector?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Speakable",
    cssSelector: content.cssSelector || ["h1", "p"],
    text: content.text,
  };
}

/**
 * Generate AgriculturalActivity schema (custom for agriculture domain)
 */
export function generateAgriculturalActivitySchema(activityData: {
  name: string;
  description: string;
  cropType: string;
  season: string;
  recommendation: string;
  startDate?: string;
  endDate?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Action",
    name: activityData.name,
    description: activityData.description,
    object: {
      "@type": "Thing",
      name: activityData.cropType,
      additionalProperty: {
        "@type": "PropertyValue",
        name: "Season",
        value: activityData.season,
      },
    },
    result: {
      "@type": "Thing",
      text: activityData.recommendation,
    },
    startDate: activityData.startDate,
    endDate: activityData.endDate,
  };
}

/**
 * Generate Person schema for expert profiles
 */
export function generatePersonSchema(personData: {
  name: string;
  jobTitle: string;
  image?: string;
  email?: string;
  phone?: string;
  url?: string;
  expertise?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: personData.name,
    jobTitle: personData.jobTitle,
    ...(personData.image && { image: personData.image }),
    ...(personData.email && { email: personData.email }),
    ...(personData.phone && { telephone: personData.phone }),
    ...(personData.url && { url: personData.url }),
    ...(personData.expertise && {
      knowsAbout: personData.expertise,
    }),
  };
}

/**
 * Combine multiple schemas into a composite JSON-LD
 */
export function generateCompositeSchema(...schemas: Record<string, any>[]) {
  if (schemas.length === 1) {
    return schemas[0];
  }

  return {
    "@context": "https://schema.org",
    "@graph": schemas,
  };
}
