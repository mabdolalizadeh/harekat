import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storeApi } from '../services/api';
import Img from '../components/ui/Img';
import { BlogDetailSkeleton } from '../components/ui/Skeleton';
import SEOHead from '../components/ui/SEOHead';
import TopBarLayout from '../layouts/TopBarLayout';
import Footer from '../components/ui/Footer';

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
            <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-between">
                <TopBarLayout />
                <div className="pt-28 sm:pt-36 pb-24 px-4 md:px-8 max-w-4xl mx-auto w-full flex-1">
                    <BlogDetailSkeleton />
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-between">
                <TopBarLayout />
                <div className="pt-28 sm:pt-36 pb-24 px-4 md:px-8 max-w-4xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center">
                    <div className="p-8 bg-card border border-border/70 rounded-3xl max-w-md w-full shadow-xl">
                        <svg className="w-14 h-14 mx-auto mb-4 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h2 className="text-xl font-bold text-foreground mb-2">مقاله یافت نشد</h2>
                        <p className="text-muted text-sm mb-6">
                            {error || 'متأسفانه این مقاله حذف شده یا آدرس وارد شده صحیح نمی‌باشد.'}
                        </p>
                        <Link
                            to="/blog"
                            className="inline-block px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                        >
                            بازگشت به وبلاگ
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': article.seoTitle || article.title,
        'description': article.seoDescription || article.excerpt,
        'image': article.featuredImage ? [article.featuredImage] : undefined,
        'author': {
            '@type': 'Person',
            'name': article.authorName || 'مدرسه حرکت'
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'مدرسه حرکت',
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
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-between transition-colors duration-300">
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

            <TopBarLayout />

            <div className="w-full max-w-4xl mx-auto pt-28 sm:pt-36 pb-24 px-4 md:px-8 flex-1">
                <article>
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-xs md:text-sm text-muted mb-8 overflow-x-auto whitespace-nowrap">
                        <Link to="/" className="hover:text-foreground transition-colors">خانه</Link>
                        <span>/</span>
                        <Link to="/blog" className="hover:text-foreground transition-colors">وبلاگ</Link>
                        <span>/</span>
                        {article.category && (
                            <>
                                <span className="text-muted/70">{article.category}</span>
                                <span>/</span>
                            </>
                        )}
                        <span className="text-primary font-medium truncate max-w-xs">{article.title}</span>
                    </nav>

                    {/* Article Header */}
                    <header className="mb-8">
                        {article.category && (
                            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-4">
                                {article.category}
                            </span>
                        )}
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground leading-tight md:leading-tight mb-6">
                            {article.title}
                        </h1>

                        {/* Author & Meta Row */}
                        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border/70 text-xs sm:text-sm text-muted">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="font-medium text-foreground">{article.authorName || 'مدرسه حرکت'}</span>
                                </span>
                                {article.publishedAt && (
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>{new Date(article.publishedAt).toLocaleDateString('fa-IR')}</span>
                                    </span>
                                )}
                            </div>

                            {/* Share / Copy link button */}
                            <button
                                onClick={handleCopyLink}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-muted hover:bg-border text-foreground transition-colors text-xs cursor-pointer"
                                title="کپی لینک مقاله"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                <span>{copied ? 'لینک کپی شد!' : 'اشتراک‌گذاری'}</span>
                            </button>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {article.featuredImage && (
                        <div className="mb-10 rounded-3xl overflow-hidden border border-border/70 shadow-2xl bg-surface-muted">
                            <Img
                                src={article.featuredImage}
                                alt={article.title}
                                priority={true}
                                aspectRatio="16/9"
                                className="w-full h-auto object-cover max-h-[500px]"
                            />
                        </div>
                    )}

                    {/* Article Excerpt */}
                    {article.excerpt && (
                        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 text-foreground/90 font-medium text-base sm:text-lg leading-relaxed mb-8">
                            {article.excerpt}
                        </div>
                    )}

                    {/* Article Body Content */}
                    <div
                        className="prose prose-invert max-w-none text-foreground leading-loose text-base sm:text-lg mb-12
                                   prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight
                                   prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border/60 prose-h2:pb-3
                                   prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                                   prose-p:text-muted prose-p:mb-6 prose-p:leading-relaxed
                                   prose-a:text-primary prose-a:underline hover:prose-a:opacity-80
                                   prose-strong:text-foreground prose-strong:font-bold
                                   prose-ul:list-disc prose-ul:pr-6 prose-ul:mb-6 prose-li:text-muted prose-li:mb-2
                                   prose-ol:list-decimal prose-ol:pr-6 prose-ol:mb-6 prose-li:text-muted prose-li:mb-2
                                   prose-blockquote:border-r-4 prose-blockquote:border-primary prose-blockquote:pr-4 prose-blockquote:italic prose-blockquote:text-foreground/90
                                   prose-code:text-primary prose-code:bg-surface-muted prose-code:px-2 prose-code:py-0.5 prose-code:rounded-md
                                   prose-img:rounded-2xl prose-img:border prose-img:border-border/70 prose-img:my-8"
                        dangerouslySetInnerHTML={{ __html: article.content || '<p>محتوایی ثبت نشده است.</p>' }}
                    />

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                        <div className="pt-8 border-t border-border/70 mb-12">
                            <h4 className="text-xs text-muted mb-3 font-medium">برچسب‌ها:</h4>
                            <div className="flex flex-wrap gap-2">
                                {article.tags.map((tag) => (
                                    <Link
                                        key={tag}
                                        to={`/blog?tag=${encodeURIComponent(tag)}`}
                                        className="text-xs px-3.5 py-1.5 rounded-full bg-surface-muted border border-border/80 text-muted hover:text-foreground hover:border-primary/50 transition-colors"
                                    >
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </article>

                {/* Related Articles Section */}
                {related.length > 0 && (
                    <section className="pt-12 border-t border-border/70">
                        <h2 className="text-xl sm:text-2xl font-black text-foreground mb-6">
                            مقالات مرتبط
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {related.map((rel) => (
                                <Link
                                    key={rel.id || rel.slug}
                                    to={`/blog/${rel.slug}`}
                                    className="group flex flex-col bg-card rounded-2xl border border-border/70 hover:border-primary/50 overflow-hidden shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="aspect-[16/10] overflow-hidden bg-surface-muted">
                                        <Img
                                            src={rel.featuredImage || '/favicon.svg'}
                                            alt={rel.title}
                                            aspectRatio="16/10"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary line-clamp-2 mb-2 leading-snug">
                                            {rel.title}
                                        </h3>
                                        <div className="pt-2 text-[11px] text-muted flex items-center justify-between">
                                            <span>{rel.category || 'مدرسه حرکت'}</span>
                                            <span className="text-primary font-medium">مشاهده</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <Footer />
        </div>
    );
}
