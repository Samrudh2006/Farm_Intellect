/**
 * SeoHead Component
 * Manages dynamic meta tags, canonical URLs, and schema markup in the document head
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  PageMetadata,
  setPageMetadata,
  injectJsonLdSchema,
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateBreadcrumbSchema,
  updateCanonicalUrl,
} from "@/lib/seoHelper";
import { getRouteMetadata, generateBreadcrumbs } from "@/lib/siteRoutes";

interface SeoHeadProps {
  metadata?: PageMetadata;
  schema?: "organization" | "website" | "breadcrumb" | "custom";
  customSchema?: Record<string, any>;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export function SeoHead({ metadata, schema, customSchema, breadcrumbs }: SeoHeadProps) {
  const location = useLocation();

  useEffect(() => {
    // Use provided metadata or get from route config
    const pageMetadata = metadata || getRouteMetadata(location.pathname);

    if (pageMetadata) {
      // Update page title and meta tags
      setPageMetadata(pageMetadata);

      // Update canonical URL
      const canonicalUrl = `${window.location.origin}${location.pathname}`;
      updateCanonicalUrl(canonicalUrl);
    }

    // Inject schema markup based on route
    let schemaToInject: Record<string, any> | null = null;

    if (customSchema) {
      schemaToInject = customSchema;
    } else if (schema) {
      const generatedBreadcrumbs = breadcrumbs || generateBreadcrumbs(location.pathname);

      switch (schema) {
        case "organization":
          schemaToInject = generateOrganizationSchema();
          break;
        case "website":
          schemaToInject = generateWebsiteSchema();
          break;
        case "breadcrumb":
          if (generatedBreadcrumbs.length > 1) {
            schemaToInject = generateBreadcrumbSchema(generatedBreadcrumbs);
          }
          break;
      }
    } else if (location.pathname === "/") {
      // Homepage: emit Organization schema to establish the brand entity
      schemaToInject = generateOrganizationSchema();
    } else {
      // Default: add breadcrumb schema on subpages
      const generatedBreadcrumbs = breadcrumbs || generateBreadcrumbs(location.pathname);
      if (generatedBreadcrumbs.length > 1) {
        schemaToInject = generateBreadcrumbSchema(generatedBreadcrumbs);
      }
    }

    // Inject the schema if available
    let cleanup: (() => void) | null = null;
    if (schemaToInject) {
      cleanup = injectJsonLdSchema(schemaToInject);
    }

    // Cleanup function
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [location.pathname, metadata, schema, customSchema, breadcrumbs]);

  // This component doesn't render anything
  return null;
}

/**
 * Hook to set SEO metadata for a page
 */
export function useSeoHead(metadata: PageMetadata, schema?: "organization" | "website" | "breadcrumb") {
  return <SeoHead metadata={metadata} schema={schema} />;
}

/**
 * Preset SeoHead configurations for common page types
 */

export function SeoHeadHomepage() {
  return <SeoHead schema="organization" />;
}

export function SeoHeadWebsite() {
  return <SeoHead schema="website" />;
}

export function SeoHeadDefault() {
  return <SeoHead schema="breadcrumb" />;
}
