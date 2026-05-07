// src/components/SEO.tsx
// ===== SEO COMPONENT - ADDED FOR SITE-WIDE SEO MANAGEMENT =====
// This component injects meta tags into the document <head> using react-helmet-async

import { Helmet } from 'react-helmet-async';

// ===== CHANGE 1/3: Define site defaults (Update with actual brand info) =====
// These fallback values are used when a page doesn't provide its own meta data
const SITE_NAME = 'oops!Pleasured';                      // ← Your brand name
const SITE_TITLE = 'oops!Pleasured - Premium Intimate Wellness';  // ← Default homepage title
const SITE_DESCRIPTION = 'Discreet delivery, premium quality intimate wellness products. Explore our curated collection for better self-care and confidence.';  // ← Default description
const ABSOLUTE_SITE_URL = 'https://oopsipleasured.in';
const DEFAULT_OG_IMAGE = 'https://oopsipleasured.in/default-og-image.jpg';

// ===== CHANGE 2/3: Define the props the component accepts =====
interface SEOProps {
  title?: string;               // Page‑specific title (appends " | oops!Pleasured")
  fullTitle?: string;           // Full title override when a page needs complete control
  description?: string;         // Page‑specific meta description
  canonicalUrl?: string;        // Full canonical URL for the page
  noindex?: boolean;            // If true, adds "noindex" robots meta (use on cart, checkout)
  ogImage?: string;             // Custom Open Graph image for social sharing
  ogType?: 'website' | 'product' | 'article';  // Open Graph type
}

// ===== CHANGE 3/3: The SEO component implementation =====
export const SEO = ({
  title,
  fullTitle,
  description,
  canonicalUrl,
  noindex = false,
  ogImage,
  ogType = 'website',
}: SEOProps) => {
  // Build the final title: "Page Title | oops!Pleasured" (or just "oops!Pleasured" for homepage)
  const resolvedTitle = fullTitle || (title ? `${title} | ${SITE_NAME}` : SITE_TITLE);
  const metaDescription = description || SITE_DESCRIPTION;
  const rawImage = ogImage || DEFAULT_OG_IMAGE;
  const image = rawImage.startsWith('http')
    ? rawImage
    : `${ABSOLUTE_SITE_URL}${rawImage.startsWith('/') ? rawImage : `/${rawImage}`}`;
  const url = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{resolvedTitle}</title>
      <meta name="description" content={metaDescription} />
      {canonicalUrl && <link rel="canonical" href={url} />}

      {/* Robots Meta (controls search engine indexing) */}
      {noindex ? (
        <meta name="robots" content="noindex, follow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph / Social Sharing Meta Tags */}
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};
