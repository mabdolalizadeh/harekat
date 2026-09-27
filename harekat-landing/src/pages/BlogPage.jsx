import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { storeApi } from '../services/api';
import Img from '../components/ui/Img';
import { BlogCardSkeleton } from '../components/ui/Skeleton';
import SEOHead from '../components/ui/SEOHead';

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

    const featuredArticle = !currentTag && !currentSearch && articles.length > 0 ? articles[0] : null;
    const listArticles = featuredArticle ? articles.slice(1) : articles;

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': 'صفحه اصلی',
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
        <div className="min-h-screen bg-slate-900 text-white font-sans pt-28 pb-20 px-4 md:px-8">
            <SEOHead
                title="وبلاگ و مقالات آموزشی"
                description="مجموعه مقالات تخصصی آکادمی حرکت در زمینه آموزش مهارت‌های فردی، تفکر نقادانه، انضباط شخصی و رشد تحصیلی نوجوانان."
                canonical="/blog"
                schemaJson={breadcrumbSchema}
            />

            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-4 border border-orange-500/20">
                        دانش و مهارت
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight text-white">
                        وبلاگ و مقالات آکادمی حرکت
                    </h1>
                    <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                        تازه‌ترین مقالات، راهنماهای کاربردی و تجربیات آموزشی برای توسعه فردی و تحصیلی نوجوانان و دانش‌آموزان
                    </p>
                </div>

                {/* Search & Tag Filter Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-800">
                    <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="جستجو در مقالات..."
                            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                        />
                        <button
                            type="submit"
                            aria-label="جستجو"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </form>

                    {/* Tag Filters */}
                    {allTags.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                            <span className="text-xs text-slate-400 whitespace-nowrap ml-2">برچسب‌ها:</span>
                            {allTags.map((tag) => {
                                const isActive = currentTag === tag;
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => handleTagClick(tag)}
                                        className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                                            isActive
                                                ? 'bg-orange-500 text-white font-medium shadow-md shadow-orange-500/20'
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                                        }`}
                                    >
                                        #{tag}
                                    </button>
                                );
                            })}
                            {currentTag && (
                                <button
                                    onClick={() => handleTagClick(currentTag)}
                                    className="text-xs text-red-400 hover:text-red-300 underline mr-2 whitespace-nowrap"
                                >
                                    حذف فیلتر
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <BlogCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center text-red-400 max-w-lg mx-auto">
                        <p className="text-base font-medium">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && articles.length === 0 && (
                    <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-12 text-center max-w-md mx-auto">
                        <svg className="w-12 h-12 text-slate-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <p className="text-slate-300 font-medium text-lg mb-2">مقاله‌ای یافت نشد</p>
                        <p className="text-slate-500 text-sm">لطفاً عبارت دیگری را جستجو کنید یا فیلترها را بردارید.</p>
                    </div>
                )}

                {/* Featured Article Card */}
                {!loading && !error && featuredArticle && (
                    <div className="mb-12">
                        <Link
                            to={`/blog/${featuredArticle.slug}`}
                            className="group block relative bg-gradient-to-br from-slate-800/90 to-slate-800/40 border border-slate-700/60 rounded-3xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 shadow-xl"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                                <div className="lg:col-span-7 h-64 sm:h-80 lg:h-96 w-full overflow-hidden relative">
                                    <Img
                                        src={featuredArticle.featuredImage || '/logo-light.svg'}
                                        alt={featuredArticle.title}
                                        priority={true}
                                        aspectRatio="16/9"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:hidden" />
                                </div>
                                <div className="p-6 lg:p-8 lg:col-span-5 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold border border-orange-500/30">
                                            {featuredArticle.category || 'مقاله برگزیده'}
                                        </span>
                                        {featuredArticle.publishedAt && (
                                            <span className="text-xs text-slate-400">
                                                {new Date(featuredArticle.publishedAt).toLocaleDateString('fa-IR')}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white group-hover:text-orange-400 transition-colors leading-snug mb-4">
                                        {featuredArticle.title}
                                    </h2>
                                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3 mb-6">
                                        {featuredArticle.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/60 text-xs text-slate-400">
                                        <span>نویسنده: {featuredArticle.authorName || 'آکادمی حرکت'}</span>
                                        <span className="text-orange-400 font-semibold group-hover:translate-x-[-4px] transition-transform inline-flex items-center gap-1">
                                            مطالعه مقاله
                                            <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}

                {/* Articles Grid */}
                {!loading && !error && listArticles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listArticles.map((article) => (
                            <Link
                                key={article.id}
                                to={`/blog/${article.slug}`}
                                className="group flex flex-col bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden hover:border-orange-500/50 hover:bg-slate-800/90 transition-all duration-300 shadow-lg"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                                    <Img
                                        src={article.featuredImage || '/logo-light.svg'}
                                        alt={article.title}
                                        aspectRatio="16/10"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {article.category && (
                                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-sm text-orange-400 text-xs font-medium border border-white/10">
                                            {article.category}
                                        </span>
                                    )}
                                </div>
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-2 mb-2 leading-snug">
                                            {article.title}
                                        </h3>
                                        <p className="text-slate-400 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
                                            {article.excerpt}
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                                        <span>
                                            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fa-IR') : 'آکادمی حرکت'}
                                        </span>
                                        <span className="text-orange-400 font-semibold group-hover:translate-x-[-3px] transition-transform inline-flex items-center gap-1">
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
        </div>
    );
}
