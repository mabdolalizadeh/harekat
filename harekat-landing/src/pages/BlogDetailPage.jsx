import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storeApi } from '../services/api';
import Img from '../components/ui/Img';
import { BlogDetailSkeleton } from '../components/ui/Skeleton';
import SEOHead from '../components/ui/SEOHead';

export default function BlogDetailPage() {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        storeApi.getArticle(slug)
            .then((res) => {
                if (!isMounted) return;
                setArticle(res.data?.article || null);
                setRelated(res.data?.related || []);
            })
            .catch((err) => {
                if (!isMounted) return;
                setError(err.message || 'خطا در بارگذاری مقاله');
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [slug]);

    const handleCopyLink = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 text-white pt-28 pb-20 px-4 md:px-8">
                <BlogDetailSkeleton />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-slate-900 text-white pt-36 pb-20 px-4 text-center">
                <div className="max-w-md mx-auto bg-slate-800/60 border border-slate-700/60 rounded-3xl p-8">
                    <h1 className="text-xl font-bold mb-4 text-red-400">مقاله مورد نظر یافت نشد</h1>
                    <p className="text-slate-400 text-sm mb-6">احتمال دارد آدرس مقاله تغییر کرده یا موقتاً در دسترس نباشد.</p>
                    <Link
                        to="/blog"
                        className="inline-block px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm transition-colors"
                    >
                        بازگشت به مقالات وبلاگ
                    </Link>
                </div>
            </div>
        );
    }

    const tags = Array.isArray(article.tags) ? article.tags : [];
    const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://schoolharekat.ir/blog/${article.slug}`;

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': article.seoTitle || article.title,
        'description': article.seoDescription || article.excerpt,
        'image': article.ogImage || article.featuredImage || 'https://schoolharekat.ir/logo-light.svg',
        'author': {
            '@type': 'Person',
            'name': article.authorName || 'آکادمی حرکت'
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'آکادمی حرکت',
            'logo': {
                '@type': 'ImageObject',
                'url': 'https://schoolharekat.ir/logo-light.svg'
            }
        },
        'datePublished': article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString(),
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `https://schoolharekat.ir/blog/${article.slug}`
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans pt-28 pb-24 px-4 md:px-8">
            <SEOHead
                title={article.seoTitle || article.title}
                description={article.seoDescription || article.excerpt}
                canonical={`/blog/${article.slug}`}
                ogImage={article.ogImage || article.featuredImage}
                ogType="article"
                publishedTime={article.publishedAt}
                author={article.authorName}
                schemaJson={articleSchema}
            />

            <article className="max-w-4xl mx-auto">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs md:text-sm text-slate-400 mb-8 overflow-x-auto whitespace-nowrap">
                    <Link to="/" className="hover:text-white transition-colors">خانه</Link>
                    <span>/</span>
                    <Link to="/blog" className="hover:text-white transition-colors">وبلاگ</Link>
                    <span>/</span>
                    {article.category && (
                        <>
                            <span className="text-slate-500">{article.category}</span>
                            <span>/</span>
                        </>
                    )}
                    <span className="text-orange-400 font-medium truncate max-w-xs">{article.title}</span>
                </nav>

                {/* Article Header */}
                <header className="mb-8">
                    {article.category && (
                        <span className="inline-block px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-semibold border border-orange-500/20 mb-4">
                            {article.category}
                        </span>
                    )}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight md:leading-tight mb-6">
                        {article.title}
                    </h1>

                    {/* Metadata & Author Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-800 text-xs sm:text-sm text-slate-400">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs border border-orange-500/30">
                                    {(article.authorName || 'ح')[0]}
                                </div>
                                <span className="font-medium text-slate-200">{article.authorName || 'آکادمی حرکت'}</span>
                            </div>
                            {article.publishedAt && (
                                <time dateTime={article.publishedAt} className="text-slate-400">
                                    {new Date(article.publishedAt).toLocaleDateString('fa-IR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </time>
                            )}
                        </div>

                        {/* Social Share & Copy */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 ml-1">اشتراک‌گذاری:</span>
                            <a
                                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                title="اشتراک‌گذاری در تلگرام"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.37.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                                </svg>
                            </a>
                            <a
                                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + shareUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                title="اشتراک‌گذاری در واتساپ"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.15c-1.49 0-2.95-.4-4.23-1.16l-.3-.18-3.12.82.83-3.04-.2-.31c-.83-1.33-1.28-2.88-1.28-4.47 0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.83c.01 4.54-3.68 8.23-8.22 8.23z" />
                                </svg>
                            </a>
                            <button
                                onClick={handleCopyLink}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors relative"
                                title="کپی لینک مقاله"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                {copied && (
                                    <span className="absolute -top-8 right-1/2 translate-x-1/2 px-2 py-0.5 rounded bg-orange-500 text-white text-[10px] whitespace-nowrap">
                                        کپی شد!
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                {article.featuredImage && (
                    <div className="mb-10 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl aspect-[16/9] bg-slate-950">
                        <Img
                            src={article.featuredImage}
                            alt={article.title}
                            priority={true}
                            aspectRatio="16/9"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Lead Excerpt */}
                {article.excerpt && (
                    <div className="bg-slate-800/40 border-r-4 border-orange-500 rounded-2xl p-6 mb-10 text-slate-200 text-base md:text-lg leading-relaxed font-medium">
                        {article.excerpt}
                    </div>
                )}

                {/* Article Body Content */}
                <div
                    className="prose prose-invert prose-orange max-w-none text-slate-300 leading-loose text-base md:text-lg font-normal space-y-6"
                    dangerouslySetInnerHTML={{
                        __html: article.content
                            ? article.content
                                .replace(/### (.*)/g, '<h3 class="text-xl md:text-2xl font-bold text-white mt-8 mb-4">$1</h3>')
                                .replace(/## (.*)/g, '<h2 class="text-2xl md:text-3xl font-bold text-orange-400 mt-10 mb-5 pb-2 border-b border-slate-800">$1</h2>')
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                                .replace(/^- (.*)/gm, '<li class="mr-4 list-disc text-slate-300">$1</li>')
                                .replace(/\n\n/g, '<p class="mb-4 leading-relaxed"></p>')
                            : ''
                    }}
                />

                {/* Tags Footer */}
                {tags.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-slate-800">
                        <h4 className="text-sm font-semibold text-slate-400 mb-3">برچسب‌های این مطلب:</h4>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <Link
                                    key={tag}
                                    to={`/blog?tag=${encodeURIComponent(tag)}`}
                                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-orange-500 text-slate-300 hover:text-white text-xs transition-colors border border-slate-700/60"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related Articles */}
                {related.length > 0 && (
                    <section className="mt-20 pt-12 border-t border-slate-800">
                        <h2 className="text-2xl font-bold text-white mb-8">مطالب مرتبط پیشنهادی</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {related.map((rel) => (
                                <Link
                                    key={rel.id}
                                    to={`/blog/${rel.slug}`}
                                    className="group bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all flex flex-col justify-between"
                                >
                                    <div className="aspect-[16/10] overflow-hidden bg-slate-900">
                                        <Img
                                            src={rel.featuredImage || '/logo-light.svg'}
                                            alt={rel.title}
                                            aspectRatio="16/10"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <h3 className="text-sm font-bold text-white group-hover:text-orange-400 line-clamp-2 mb-2 leading-snug">
                                            {rel.title}
                                        </h3>
                                        <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                                            <span>{rel.category || 'آکادمی حرکت'}</span>
                                            <span className="text-orange-400 font-medium">مشاهده</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </article>
        </div>
    );
}
