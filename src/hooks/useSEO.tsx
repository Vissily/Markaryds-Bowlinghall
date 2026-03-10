import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
  noIndex?: boolean;
}

const getOrCreateMeta = (attribute: string, value: string): HTMLMetaElement => {
  let el = document.querySelector(`meta[${attribute}="${value}"]`) as HTMLMetaElement;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute.split('=')[0], value.replace(/"/g, ''));
    // Determine correct attribute
    if (attribute.startsWith('property')) {
      el.setAttribute('property', value);
    } else {
      el.setAttribute('name', value);
    }
    document.head.appendChild(el);
  }
  return el;
};

const setMetaContent = (selector: string, attr: string, key: string, content: string) => {
  let el = document.querySelector(selector) as HTMLMetaElement;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

export const useSEO = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  jsonLd,
  noIndex = false,
}: SEOProps) => {
  useEffect(() => {
    // Title
    if (title) {
      document.title = title;
      setMetaContent('meta[property="og:title"]', 'property', 'og:title', title);
      setMetaContent('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    }

    // Description
    if (description) {
      setMetaContent('meta[name="description"]', 'name', 'description', description);
      setMetaContent('meta[property="og:description"]', 'property', 'og:description', description);
      setMetaContent('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    }

    // Keywords
    if (keywords) {
      setMetaContent('meta[name="keywords"]', 'name', 'keywords', keywords);
    }

    // OG Type
    setMetaContent('meta[property="og:type"]', 'property', 'og:type', ogType);

    // Canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
      setMetaContent('meta[property="og:url"]', 'property', 'og:url', canonical);
    }

    // OG Image
    if (ogImage) {
      setMetaContent('meta[property="og:image"]', 'property', 'og:image', ogImage);
      setMetaContent('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);
    }

    // Robots
    if (noIndex) {
      setMetaContent('meta[name="robots"]', 'name', 'robots', 'noindex, nofollow');
    }

    // JSON-LD structured data
    if (jsonLd) {
      const scriptId = 'seo-json-ld';
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }

      const ldArray = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      // Merge with existing main LD if needed
      script.textContent = JSON.stringify(
        ldArray.length === 1 ? ldArray[0] : ldArray
      );

      return () => {
        script.remove();
      };
    }
  }, [title, description, keywords, canonical, ogImage, ogType, jsonLd, noIndex]);
};

// Helper to generate BreadcrumbList JSON-LD
export const createBreadcrumbJsonLd = (
  items: { name: string; url: string }[]
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url,
  })),
});

// Helper to generate WebPage JSON-LD
export const createWebPageJsonLd = (opts: {
  name: string;
  description: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: opts.name,
  description: opts.description,
  url: opts.url,
  isPartOf: {
    '@type': 'WebSite',
    name: 'Markaryds Bowlinghall',
    url: 'https://markarydsbowling.se',
  },
});
