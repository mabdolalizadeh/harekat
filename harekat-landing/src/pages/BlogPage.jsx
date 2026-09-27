import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { storeApi } from '../services/api';
import Img from '../components/ui/Img';
import { BlogCardSkeleton } from '../components/ui/Skeleton';
import SEOHead from '../components/ui/SEOHead';
import TopBarLayout from '../layouts/TopBarLayout';
import Footer from '../components/ui/Footer';

export default function BlogPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTag = searchParams.get('tag') || '';
    const currentSearch = searchParams.get('q') || '';

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allTags, setAllTags] = useState([]);
    const [searchInput, setSearchInput] = useState(currentSearch);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        const params = {};
        if (currentTag) params.tag = currentTag;
        if (currentSearch) params.search = currentSearch;

        storeApi.getArticles(params)
            .then((res) => {
                if (!isMounted) return;
                const fetched = res.data?.articles || [];
                setArticles(fetched);

                // Collect unique tags
                const tagsSet = new Set();
                fetched.forEach((art) => {
                    const t = Array.isArray(art.tags) ? art.tags : [];
                    t.forEach((tag) => tagsSet.add(tag));
                });
                setAllTags(Array.from(tagsSet));
            })
            .catch((err) => {
                if (!isMounted) return;
                setError(err.message || 'خطا در بارگذاری مقالات');
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [currentTag, currentSearch]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const next = new URLSearchParams(searchParams);
        if (searchInput.trim()) {
            next.set('q', searchInput.trim());
        } else {
            next.delete('q');
        }
        setSearchParams(next);
    };

    const handleTagClick = (tag) => {
        const next = new URLSearchParams(searchParams);
        if (currentTag === tag) {
            next.delete('tag');
        } else {
            next.set('tag', tag);
        }
        setSearchParams(next);
    };

    const clearFilters = () => {
        setSearchInput('');
        setSearchParams({});
    };

    const featuredArticle = articles.length > 0 && !currentTag && !currentSearch ? articles[0] : null;
    const remainingArticles = featuredArticle ? articles.slice(1) : articles;

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': 'خانه',
                'item': 'https://schoolharekat.ir/'
            },
            {
                '@type': 'ListItem',
                'position': 2,
                'name': 'وبلاگ و مقالات',
                'item': 'https://schoolharekat.ir/blog'
            }
        ]
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-between transition-colors duration-300">
            <SEOHead
                title="وبلاگ و مقالات آموزشی"
                description="مجموعه مقالات تخصصی مدرسه حرکت در زمینه آموزش مهارت‌های فردی، هنر، رسانه و تکنولوژی."
                canonical="/blog"
                schemaJson={breadcrumbSchema}
            />

            <TopBarLayout />

            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-28 sm:pt-36 pb-20 flex-1">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-4 border border-primary/20">
                        دانش و مهارت
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight text-foreground">
                        وبلاگ و مقالات مدرسه حرکت
                    </h1>
                    <p className="text-muted text-base md:text-lg leading-relaxed">
                        تازه‌ترین مقالات، راهنماهای کاربردی و تجربیات آموزشی برای توسعه فردی و مهارت‌آموزی در مرز هنر، رسانه و فناوری
                    </p>
                </div>

                {/* Search & Tag Filter Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-border/70">
                    <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="جستجو در مقالات..."
                            className="w-full bg-surface-muted border border-border/80 rounded-xl px-4 py-2.5 pr-10 text-sm text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors"
                        />
                        <button
                            type="submit"
                            aria-label="جستجو"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </form>

                    {/* Tag Filter Pills */}
                    {allTags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 max-w-2xl justify-end">
                            <span className="text-xs text-muted ml-2">دسته‌بندی‌ها:</span>
                            {allTags.map((tag) => {
                                const active = currentTag === tag;
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => handleTagClick(tag)}
                                        className={`text-xs px-3 py-1.5 rounded-full transition-all duration-200 border ${
                                            active
                                                ? 'bg-primary text-primary-foreground border-primary font-bold shadow-md shadow-primary/20'
                                                : 'bg-surface-muted text-muted border-border/60 hover:border-primary/50 hover:text-foreground'
                                        }`}
                                    >
                                        #{tag}
                                    </button>
                                );
                            })}
                            {(currentTag || currentSearch) && (
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-muted hover:text-danger-500 mr-2 transition-colors underline"
                                >
                                    حذف فیلترها
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <BlogCardSkeleton key={idx} />
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-16 bg-card rounded-2xl border border-border/70 my-8">
                        <p className="text-danger-500 font-semibold mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                            تلاش مجدد
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && articles.length === 0 && (
                    <div className="text-center py-20 bg-card rounded-2xl border border-border/70 my-8">
                        <svg className="w-16 h-16 mx-auto mb-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <h3 className="text-xl font-bold text-foreground mb-2">مقاله‌ای یافت نشد</h3>
                        <p className="text-muted text-sm max-w-md mx-auto mb-6">
                            با فیلترها یا عبارت جستجوی انتخاب‌شده مقاله‌ای موجود نیست.
                        </p>
                        {(currentTag || currentSearch) && (
                            <button
                                onClick={clearFilters}
                                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                            >
                                مشاهده همه مقالات
                            </button>
                        )}
                    </div>
                )}

                {/* Featured Article Section */}
                {!loading && !error && featuredArticle && (
                    <div className="mb-14">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                            <h2 className="text-lg font-bold text-foreground">مقاله ویژه</h2>
                        </div>
                        <Link
                            to={`/blog/${featuredArticle.slug}`}
                            className="group block bg-card rounded-3xl border border-border/70 hover:border-primary/50 overflow-hidden shadow-xl hover:shadow-primary/5 transition-all duration-300"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                                <div className="lg:col-span-7 overflow-hidden relative min-h-[260px] sm:min-h-[380px]">
                                    <Img
                                        src={featuredArticle.featuredImage || '/favicon.svg'}
                                        alt={featuredArticle.title}
                                        aspectRatio="16/9"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {featuredArticle.category && (
                                        <span className="absolute top-4 right-4 bg-background/90 backdrop-blur-md text-foreground text-xs font-semibold px-3 py-1.5 rounded-full border border-border/40">
                                            {featuredArticle.category}
                                        </span>
                                    )}
                                </div>
                                <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between">
                                    <div>
                                        {featuredArticle.tags && featuredArticle.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {featuredArticle.tags.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="text-[11px] text-primary bg-primary/10 px-2.5 py-0.5 rounded-full font-medium">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground group-hover:text-primary transition-colors leading-tight mb-4">
                                            {featuredArticle.title}
                                        </h3>
                                        <p className="text-muted text-sm sm:text-base leading-relaxed line-clamp-3 mb-6">
                                            {featuredArticle.excerpt}
                                        </p>
                                    </div>

                                    <div className="pt-6 border-t border-border/60 flex items-center justify-between text-xs text-muted">
                                        <span>نویسنده: {featuredArticle.authorName || 'مدرسه حرکت'}</span>
                                        <span className="text-primary font-bold inline-flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
                                            مطالعه کامل
                                            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}

                {/* Article Grid */}
                {!loading && !error && remainingArticles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {remainingArticles.map((article) => (
                            <Link
                                key={article.id || article.slug}
                                to={`/blog/${article.slug}`}
                                className="group flex flex-col bg-card rounded-2xl border border-border/70 hover:border-primary/50 overflow-hidden shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1.5"
                            >
                                <div className="aspect-[16/10] overflow-hidden relative bg-surface-muted">
                                    <Img
                                        src={article.featuredImage || '/favicon.svg'}
                                        alt={article.title}
                                        aspectRatio="16/10"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {article.category && (
                                        <span className="absolute top-3 right-3 bg-background/85 backdrop-blur-md text-foreground text-xs font-semibold px-2.5 py-1 rounded-full border border-border/40">
                                            {article.category}
                                        </span>
                                    )}
                                </div>
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 leading-snug">
                                            {article.title}
                                        </h3>
                                        <p className="text-muted text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
                                            {article.excerpt}
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted">
                                        <span>
                                            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fa-IR') : 'مدرسه حرکت'}
                                        </span>
                                        <span className="text-primary font-semibold group-hover:translate-x-[-3px] transition-transform inline-flex items-center gap-1">
                                            ادامه مطلب
                                            <svg className="w-3 h-3 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
