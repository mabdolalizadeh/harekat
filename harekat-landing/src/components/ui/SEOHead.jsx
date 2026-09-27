import { useEffect } from 'react';

const BASE_URL = 'https://schoolharekat.ir';
const DEFAULT_TITLE = 'آکادمی حرکت | آموزش مهارت‌های فردی و کاربردی نوجوانان';
const DEFAULT_DESCRIPTION = 'مدرسه و آکادمی مهارت‌آموزی حرکت؛ دوره‌های تخصصی پرورش خلاقیت، مهارت‌های فردی، تفکر نقادانه و حل مسئله برای دانش‌آموزان و نوجوانان.';
const DEFAULT_OG_IMAGE = `${BASE_URL}/logo-light.svg`;

export default function SEOHead({
    title,
    description,
    canonical,
    ogImage,
    ogType = 'website',
    publishedTime,
    author = 'آکادمی حرکت',
    schemaJson,
    noIndex = false
}) {
    useEffect(() => {
        const fullTitle = title ? `${title} | آکادمی حرکت` : DEFAULT_TITLE;
        const metaDesc = description || DEFAULT_DESCRIPTION;
        const currentUrl = canonical
            ? (canonical.startsWith('http') ? canonical : `${BASE_URL}${canonical.startsWith('/') ? '' : '/'}${canonical}`)
            : (typeof window !== 'undefined' ? window.location.href : BASE_URL);
        const image = ogImage || DEFAULT_OG_IMAGE;

        // Set document title
        document.title = fullTitle;

        // Helper to upsert meta tags
        const setMeta = (attr, key, content) => {
            if (!content) return;
            let el = document.querySelector(`meta[${attr}="${key}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attr, key);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        // Standard meta
        setMeta('name', 'description', metaDesc);
        setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

        // Open Graph
        setMeta('property', 'og:title', fullTitle);
        setMeta('property', 'og:description', metaDesc);
        setMeta('property', 'og:url', currentUrl);
        setMeta('property', 'og:image', image);
        setMeta('property', 'og:type', ogType);
        setMeta('property', 'og:site_name', 'آکادمی حرکت');
        setMeta('property', 'og:locale', 'fa_IR');

        if (publishedTime) {
            setMeta('property', 'article:published_time', new Date(publishedTime).toISOString());
            setMeta('property', 'article:author', author);
        }

        // Twitter Card
        setMeta('name', 'twitter:card', 'summary_large_image');
        setMeta('name', 'twitter:title', fullTitle);
        setMeta('name', 'twitter:description', metaDesc);
        setMeta('name', 'twitter:image', image);

        // Canonical link
        let linkCanonical = document.querySelector('link[rel="canonical"]');
        if (!linkCanonical) {
            linkCanonical = document.createElement('link');
            linkCanonical.setAttribute('rel', 'canonical');
            document.head.appendChild(linkCanonical);
        }
        linkCanonical.setAttribute('href', currentUrl);

        // JSON-LD structured data
        let scriptSchema = document.getElementById('jsonld-structured-data');
        if (schemaJson) {
            if (!scriptSchema) {
                scriptSchema = document.createElement('script');
                scriptSchema.id = 'jsonld-structured-data';
                scriptSchema.type = 'application/ld+json';
                document.head.appendChild(scriptSchema);
            }
            scriptSchema.textContent = JSON.stringify(schemaJson);
        } else if (scriptSchema) {
            scriptSchema.remove();
        }

        return () => {
            // Optional cleanup if needed
        };
    }, [title, description, canonical, ogImage, ogType, publishedTime, author, schemaJson, noIndex]);

    return null;
}
