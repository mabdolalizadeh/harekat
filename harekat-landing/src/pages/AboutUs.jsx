import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import TopBarLayout from "../layouts/TopBarLayout.jsx";
import SmoothScrollProvider from "../components/landing/SmoothScrollProvider.jsx";
import SectionTag from "../components/ui/SectionTag.jsx";
import { ArrowButton } from "../components/ui/Buttons.jsx";
import { Sparkles, Compass, Lightbulb, Users, Award, Layers } from "lucide-react";
import { storeApi } from "../services/api.js";

const values = [
    {
        icon: Compass,
        number: '۰۱',
        title: 'عملگرایی و تجربه واقعی',
        desc: 'یادگیری از طریق انجام دادن و ساختن پروژه‌های واقعی؛ نه صرفاً حفظ کردن مفاهیم تئوری و دستورالعمل‌های خشک ابزارها.',
    },
    {
        icon: Lightbulb,
        number: '۰۲',
        title: 'تفکر انتقادی و نقدپذیری',
        desc: 'ما باور داریم رشد واقعی از بازخورد صریح و صادقانه شروع می‌شود. جلسات نقد گروهی، بخش جدایی‌ناپذیر یادگیری در حرکت است.',
    },
    {
        icon: Layers,
        number: '۰۳',
        title: 'نگاه چندرسانه‌ای',
        desc: 'هنرمند امروز نباید در چارچوب یک نرم‌افزار خاص محدود بماند. ما پل ارتباطی میان رسانه‌ها، فرمت‌ها و هنر دیجیتال هستیم.',
    },
    {
        icon: Users,
        number: '۰۴',
        title: 'رشد فردی و هویت مستقل',
        desc: 'هر دانش‌آموخته مسیر خلاقانه منحصربه‌فرد خود را دارد. هدف ما هموار کردن مسیر و کشف صدا و زبان بصری اختصاصی شماست.',
    },
];

export default function AboutUs() {
    const navigate = useNavigate();
    const pageRef = useRef(null);
    const storyRef = useRef(null);
    const [sectionIds, setSectionIds] = useState({ capsule: 'capsule-courses', skill: 'skill-packages', subscriptions: 'subscriptions' });
    const [contentMap, setContentMap] = useState({});

    useEffect(() => {
        let cancelled = false;
        Promise.allSettled([storeApi.getCategories(), storeApi.getSiteContent()]).then((results) => {
            if (cancelled) return;
            const [categoriesResult, contentResult] = results;
            if (categoriesResult.status === 'fulfilled') {
                const categories = categoriesResult.value.data ?? [];
                const findSection = (pattern, fallback) =>
                    categories.find((category) => pattern.test(`${category.slug ?? ''} ${category.name ?? ''}`))?.slug || fallback;
                setSectionIds({
                    capsule: findSection(/capsule|کپسول/i, 'capsule-courses'),
                    skill: findSection(/skill|مهارت|پکیج/i, 'skill-packages'),
                    subscriptions: findSection(/subscription|اشتراک/i, 'subscriptions'),
                });
            }
            if (contentResult.status === 'fulfilled') {
                setContentMap(Object.fromEntries((contentResult.value.data ?? []).map((block) => [block.key, block])));
            }
        });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        const el = pageRef.current;
        if (!el) return;

        const ctx = gsap.context(() => {
            // Hero typography entrance
            gsap.fromTo(
                el.querySelectorAll('.about-hero-anim'),
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.12,
                    ease: 'power3.out',
                }
            );

            // Story paragraph scroll scrub
            if (storyRef.current) {
                const paragraphs = storyRef.current.querySelectorAll('p');
                gsap.fromTo(
                    paragraphs,
                    { opacity: 0.25, y: 15 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        stagger: 0.15,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: storyRef.current,
                            start: 'top 80%',
                            end: 'bottom 50%',
                            scrub: 0.5,
                        },
                    }
                );
            }

            // Values cards reveal
            gsap.fromTo(
                el.querySelectorAll('.about-value-card'),
                { opacity: 0, y: 45, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: el.querySelector('.about-values-grid'),
                        start: 'top 85%',
                    },
                }
            );

            // Stats counter animation
            const statNumbers = el.querySelectorAll('.about-stat-num');
            gsap.fromTo(
                statNumbers,
                { opacity: 0, scale: 0.8, y: 20 },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.08,
                    ease: 'back.out(1.5)',
                    scrollTrigger: {
                        trigger: el.querySelector('.about-stats-grid'),
                        start: 'top 85%',
                    },
                }
            );
        }, pageRef);

        return () => ctx.revert();
    }, []);

    return (
        <SmoothScrollProvider>
            <MainLayout title={'درباره ما'} sectionIds={sectionIds} contentMap={contentMap}>
                <TopBarLayout />

                <div ref={pageRef} className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-28 flex flex-col items-center gap-20">
                    {/* Hero */}
                    <div className="flex flex-col items-center gap-5 text-center max-w-3xl">
                        <div className="about-hero-anim">
                            <SectionTag>مانیفست ما</SectionTag>
                        </div>
                        <h1 className="about-hero-anim text-[clamp(2.5rem,6vw,4.8rem)] font-extrabold text-foreground leading-[1.1]">
                            مدرسه حرکت کجاست و<br />
                            <span className="bg-gradient-to-l from-primary via-brand-400 to-amber-300 bg-clip-text text-transparent">
                                چرا وجود داره؟
                            </span>
                        </h1>
                        <p className="about-hero-anim text-muted text-base sm:text-xl leading-relaxed max-w-xl font-normal">
                            ما یک مدرسه هنر و مهارت هستیم که مرز سنتی میان هنر، رسانه و فناوری رو جابه‌جا می‌کنیم.
                        </p>
                    </div>

                    {/* Story / Philosophy */}
                    <div
                        ref={storyRef}
                        className="w-full max-w-4xl bg-card/70 backdrop-blur-2xl border border-border/80 rounded-3xl p-8 sm:p-12 shadow-xl shadow-black/10 flex flex-col gap-6"
                    >
                        <div className="flex items-center gap-3 pb-3 border-b border-border/60">
                            <Sparkles size={20} className="text-primary" />
                            <h2 className="text-xl font-bold text-foreground">داستان شکل‌گیری حرکت</h2>
                        </div>
                        <p className="text-foreground/80 text-base sm:text-lg leading-relaxed">
                            مدرسه حرکت از یک سوال ساده شروع شد: چرا هنرمندها و متخصصان باید خودشون رو فقط در یک چارچوب و عنوان محدود کنن؟ عکاس، طراح رابط کاربری، برنامه‌نویس، فیلمساز — چرا باید مرزهای غیرضروری خلاقیت رو متوقف کنن؟
                        </p>
                        <p className="text-foreground/80 text-base sm:text-lg leading-relaxed">
                            ما معتقدیم هنرمند معاصر کسی است که بتواند آزادانه میان فرمت‌ها حرکت کند. از عکاسی تا کدنویسی، از تدوین ویدیو تا هوش مصنوعی مولد؛ ابزارها پیوسته در حال تغییرند، اما تفکر نقادانه و زبان زیبایی‌شناختی ماندگار است.
                        </p>
                        <p className="text-foreground/80 text-base sm:text-lg leading-relaxed">
                            دوره‌های حرکت بر اساس متد پروژه-محور، جلسات نقد گروهی و هدایت انفرادی طراحی شده‌اند تا به جای آموزش صرف نرم‌افزار، به شما روش‌شناسی حل مسئله و خلاقیت ساختاریافته بیاموزند.
                        </p>
                    </div>

                    {/* Values Grid */}
                    <div className="w-full flex flex-col items-center gap-8">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <SectionTag>ستون‌های اصلی</SectionTag>
                            <h2 className="text-[clamp(2.2rem,4.5vw,3.5rem)] font-extrabold text-foreground leading-tight">
                                چه چیزی ما رو متفاوت می‌کنه
                            </h2>
                        </div>

                        <div className="about-values-grid grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                            {values.map((item, index) => (
                                <div
                                    key={index}
                                    className="about-value-card group bg-card/80 backdrop-blur-xl border border-border/80 hover:border-primary/50 rounded-3xl p-8 shadow-xl shadow-black/10 transition-all duration-300 hover:-translate-y-1 will-change-transform flex flex-col gap-4"
                                >
                                    <div className="flex items-center justify-between pb-3 border-b border-border/50">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                            <item.icon size={20} />
                                        </div>
                                        <span className="text-3xl font-black font-mono text-primary/75 select-none">
                                            {item.number}
                                        </span>
                                    </div>
                                    <h3 className="text-foreground text-xl font-bold group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-muted text-sm sm:text-base leading-relaxed font-normal">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="about-stats-grid grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-4xl py-6">
                        {[
                            { number: '+۲۰۰', label: 'دانش‌آموخته خلاق' },
                            { number: '+۳۰', label: 'دوره و کارگاه فعال' },
                            { number: '+۱۵', label: 'استاد و منتور تخصصی' },
                            { number: '%۹۸', label: 'رضایت هنرجویان' },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="about-stat-num bg-card/60 backdrop-blur-xl border border-border/70 rounded-3xl p-6 text-center flex flex-col gap-2 shadow-sm"
                            >
                                <span className="text-3xl sm:text-4xl font-black text-foreground">
                                    {stat.number}
                                </span>
                                <span className="text-xs sm:text-sm text-muted font-medium">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* CTA Card */}
                    <div className="w-full max-w-4xl rounded-3xl bg-card/70 backdrop-blur-2xl border-2 border-primary/30 p-10 sm:p-14 flex flex-col items-center text-center gap-6 shadow-2xl shadow-primary/10">
                        <SectionTag>آغاز مسیر</SectionTag>
                        <h2 className="text-[clamp(2.2rem,4vw,3.2rem)] font-extrabold text-foreground leading-tight">
                            آماده‌ای وارد جریان حرکت بشی؟
                        </h2>
                        <p className="text-muted text-base max-w-md">
                            کاتالوگ دوره‌های ما را مرور کن و مهارت بعدی خودت را انتخاب کن.
                        </p>
                        <div className="mt-2">
                            <ArrowButton onClick={() => navigate('/#courses')} className="shadow-lg shadow-primary/25">
                                مشاهده دوره‌ها
                            </ArrowButton>
                        </div>
                    </div>
                </div>
            </MainLayout>
        </SmoothScrollProvider>
    );
}
