import React from 'react';

export const OrganizationStructuredData = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "oops!Pleasured",
    "url": "https://oopsipleasured.in",
    "logo": "https://oopsipleasured.in/default-og-image.jpg",
    "description": "Premium adult wellness products with 100% discreet packaging, private billing, and free shipping above ₹999.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "sameAs": [
      "https://oopsipleasured.in"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["English", "Hindi"]
    }
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
};

export const WebSiteStructuredData = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "oops!Pleasured",
    "url": typeof window !== 'undefined' ? window.location.origin : 'https://oopsipleasured.in',
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${typeof window !== 'undefined' ? window.location.origin : 'https://oopsipleasured.in'}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
};

export const ProductStructuredData = ({ product }: { product: { name: string, description: string, image: string, price: number, availability: 'InStock' | 'OutOfStock', url?: string } }) => {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    ...(product.url ? { "url": product.url } : {}),
    "brand": {
      "@type": "Brand",
      "name": "oops!Pleasured"
    },
    "offers": {
      "@type": "Offer",
      "url": product.url || (typeof window !== 'undefined' ? window.location.href : ''),
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": `https://schema.org/${product.availability}`
    }
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
};

export const ArticleStructuredData = ({ article }: { article: { headline: string, datePublished: string, dateModified: string, image: string, author: string, url: string, description?: string } }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.headline,
    "datePublished": article.datePublished,
    "dateModified": article.dateModified,
    "image": article.image ? [article.image] : [],
    "author": {
      "@type": "Person",
      "name": article.author,
    },
    "mainEntityOfPage": article.url,
    ...(article.description ? { "description": article.description } : {}),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
};

export const BreadcrumbStructuredData = ({ items }: { items: { name: string, url: string }[] }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
};
