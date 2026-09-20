import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import TopBarLayout from '../layouts/TopBarLayout.jsx';
import Box from '../components/ui/Box.jsx';
import { H1, H2, P } from '../components/ui/Headings.jsx';
import { PrimaryButton } from '../components/ui/Buttons.jsx';
import { ProductDetailSkeleton } from '../components/ui/Skeleton.jsx';
import { customerApi, storeApi } from '../services/api.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, Clock, User, Video, ShoppingCart } from 'lucide-react';

function price(value) {
    if (value === null || value === undefined || value === '') return 'رایگان';
    const normalized = String(value)
        .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
        .replace(/[,٬\s]/g, '');
    const number = Number(normalized);
    if (!Number.isFinite(number) || number === 0) return 'رایگان';
    return `${number.toLocaleString('fa-IR')} تومان`;
}

function videoSource(value) {
    if (!value) return null;
    try {
        const url = new URL(value, window.location.origin);
        if (/youtube\.com|youtu\.be/.test(url.hostname)) {
            const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.split('/').pop();
            return id ? { type: 'embed', src: `https://www.youtube.com/embed/${id}` } : null;
        }
        if (/aparat\.com/.test(url.hostname)) {
            const id = url.pathname.split('/').filter(Boolean).pop();
            return id ? { type: 'embed', src: `https://www.aparat.com/video/video/embed/videohash/${id}/vt/frame` } : null;
        }
        return { type: 'file', src: url.href };
    } catch { return null; }
}

export default function ProductDetail({ type }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [course, setCourse] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        storeApi.getCourse(id)
            .then((response) => {
                if (!cancelled) setCourse(response.data);
            })
            .catch((e) => {
                if (!cancelled) setError(e.message);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [id]);

    if (error) {
        return (
            <MainLayout title="خطا">
                <TopBarLayout />
                <Box className="min-h-[50vh] gap-4 pt-36 text-center">
                    <H1 className="text-xl sm:text-2xl text-foreground">موردی با این شناسه پیدا نشد</H1>
                    <PrimaryButton onClick={() => navigate(-1)}>بازگشت</PrimaryButton>
                </Box>
            </MainLayout>
        );
    }

    if (loading || !course) {
        return (
            <MainLayout title="در حال بارگذاری...">
                <TopBarLayout />
                <ProductDetailSkeleton />
            </MainLayout>
        );
    }

    const kind = course.kind || (type === 'package' ? 'skill' : type || 'regular');
    const kindInfo = kind === 'capsule'
        ? { label: 'آموزش کپسولی', path: '/capsules', listLabel: 'دوره‌های کپسولی' }
        : kind === 'skill'
        ? { label: 'پکیج مهارتی', path: '/packages', listLabel: 'پکیج‌های مهارتی' }
        : { label: 'دوره آموزشی', path: '/courses', listLabel: 'دوره‌ها' };

    const discounted = course.salePrice && String(course.salePrice) !== String(course.price);
    const video = videoSource(course.videoUrl);
    const teacherName = course.teacher
        ? `${course.teacher.firstName ?? ''} ${course.teacher.lastName ?? ''}`.trim()
        : null;

    const add = async () => {
        if (!localStorage.getItem('token')) {
            navigate('/auth', {
                state: {
                    from: `${location.pathname}${location.search}${location.hash}`,
                    autoAddCourseId: course.id,
                    autoAddType: 'course',
                    autoAddPrice: discounted ? course.salePrice : course.price
                }
            });
            return;
        }
        await customerApi.addToCart(course.id, 'course', 1, discounted ? course.salePrice : course.price);
        setAdded(true);
    };


    return (
        <MainLayout title={course.name} sectionIds={null} contentMap={null}>
            <TopBarLayout />
            <Box className="w-full max-w-5xl gap-8 pb-20 pt-28 sm:pt-36 mx-auto px-4 sm:px-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted self-start">
                    <Link to="/" className="hover:text-foreground transition-colors">خانه</Link>
                    <span>/</span>
                    <Link to={kindInfo.path} className="hover:text-foreground transition-colors">{kindInfo.listLabel}</Link>
                    <span>/</span>
                    <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{course.name}</span>
                </div>

                {/* Main Product Card */}
                <div className="grid w-full gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
                    <div className="overflow-hidden rounded-2xl border border-border bg-card relative">
                        <img src={course.image} alt={course.name} className="aspect-square w-full object-cover" />
                        <span className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm text-foreground text-xs px-3 py-1 rounded-full border border-border/20 font-medium">
                            {kindInfo.label}
                        </span>
                    </div>

                    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:p-7">
                        <H1 className="text-2xl sm:text-3xl text-foreground font-bold">{course.name}</H1>
                        <P className="text-muted leading-relaxed">{course.description}</P>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 pt-2">
                            {course.level && (
                                <span className="flex items-center gap-1.5 text-xs text-foreground bg-surface-muted px-3 py-1 rounded-lg">
                                    <BookOpen size={13} className="text-primary" />
                                    {course.level}
                                </span>
                            )}
                            {course.duration && (
                                <span className="flex items-center gap-1.5 text-xs text-foreground bg-surface-muted px-3 py-1 rounded-lg">
                                    <Clock size={13} className="text-primary" />
                                    {course.duration}
                                </span>
                            )}
                            {course.typeOfAttendence && (
                                <span className="flex items-center gap-1.5 text-xs text-foreground bg-surface-muted px-3 py-1 rounded-lg">
                                    {course.typeOfAttendence}
                                </span>
                            )}
                            {teacherName && (
                                <span className="flex items-center gap-1.5 text-xs text-foreground bg-surface-muted px-3 py-1 rounded-lg">
                                    <User size={13} className="text-primary" />
                                    {teacherName}
                                </span>
                            )}
                        </div>

                        {/* Pricing & CTA */}
                        <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-border/10">
                            <div className="flex items-baseline gap-2">
                                {discounted && (
                                    <span className="text-sm text-muted line-through">
                                        {price(course.price)}
                                    </span>
                                )}
                                <span className="text-xl sm:text-2xl font-black text-foreground">
                                    {price(discounted ? course.salePrice : course.price)}
                                </span>
                            </div>
                            <PrimaryButton onClick={add} className="w-full flex items-center justify-center gap-2 py-3">
                                <ShoppingCart size={18} />
                                {added ? 'به سبد اضافه شد ✓' : 'افزودن به سبد خرید'}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>

                {/* Video Intro / Preview */}
                {video && (
                    <div className="w-full flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-foreground font-bold text-lg">
                            <Video size={20} className="text-primary" />
                            <span>پیش‌نمایش ویدیو</span>
                        </div>
                        <div className="w-full overflow-hidden rounded-2xl border border-border bg-black shadow-md">
                            {video.type === 'embed' ? (
                                <div className="aspect-video">
                                    <iframe
                                        src={video.src}
                                        title={`ویدیوی ${course.name}`}
                                        className="h-full w-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                <video src={video.src} controls preload="metadata" className="aspect-video w-full" />
                            )}
                        </div>
                    </div>
                )}

                {/* Long Description Markdown */}
                {course.longDescription && (
                    <div className="w-full rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-4">
                        <H2 className="text-xl font-bold text-foreground">توضیحات و سرفصل‌ها</H2>
                        <div className="prose prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{course.longDescription}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </Box>
        </MainLayout>
    );
}
