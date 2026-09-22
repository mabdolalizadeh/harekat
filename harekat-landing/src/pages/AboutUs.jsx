import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import TopBarLayout from "../layouts/TopBarLayout.jsx";
import SmoothScrollProvider from "../components/landing/SmoothScrollProvider.jsx";
import SectionTag from "../components/ui/SectionTag.jsx";
import { ArrowButton } from "../components/ui/Buttons.jsx";
import { Sparkles, Compass, Lightbulb, Users, Award, Layers, ArrowLeft } from "lucide-react";
import { storeApi } from "../services/api.js";

gsap.registerPlugin(ScrollTrigger, Draggable);

const values = [
    {
        icon: Compass,
        number: '۱',
        tag: 'روش‌شناسی عملی',
        title: 'عملگرایی و تجربه واقعی',
        quote: '«یادگیری در میدان عمل و با دست‌های درگیر در کار شکل می‌گیرد، نه روی کاغذ.»',
        desc: 'ما در حرکت فرآیند یادگیری را از دل پروژه‌های حقیقی آغاز می‌کنیم؛ مواجهه با چالش‌های بازار، آزمون و خطا، و دستیابی به استانداردهای ملموس حرفه‌ای.',
        theme: {
            cardBorder: 'hover:border-brand-500/40 dark:hover:border-brand-500/40',
            badgeBg: 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20',
            dot: 'bg-brand-500',
            iconBox: 'bg-brand-500/10 text-brand-500 group-hover:bg-brand-500 group-hover:text-brand-950',
            glow: 'from-brand-500/15 via-brand-600/5 to-transparent',
            quoteBorder: 'border-r-brand-500/60',
            watermark: 'text-brand-500/10 group-hover:text-brand-500/20',
            btnHover: 'group-hover:text-brand-500',
        },
    },
    {
        icon: Lightbulb,
        number: '۲',
        tag: 'فرهنگ گفت‌وگو',
        title: 'تفکر انتقادی و نقدپذیری',
        quote: '«نقد شفاف و سازنده، میانبر طلایی ارتقای استانداردهای هنری است.»',
        desc: 'رشد واقعی در فضایی امن برای آزمودن ایده‌ها رخ می‌دهد. در کارگاه‌های نقد، یاد می‌گیریم فراتر از سلیقه شخصی، چرایی تصمیمات بصری‌مان را تحلیل و دفاع کنیم.',
        theme: {
            cardBorder: 'hover:border-electric-500/40 dark:hover:border-electric-500/40',
            badgeBg: 'bg-electric-500/10 text-electric-600 dark:text-electric-400 border-electric-500/20',
            dot: 'bg-electric-500',
            iconBox: 'bg-electric-500/10 text-electric-500 group-hover:bg-electric-500 group-hover:text-white',
            glow: 'from-electric-500/15 via-electric-600/5 to-transparent',
            quoteBorder: 'border-r-electric-500/60',
            watermark: 'text-electric-500/10 group-hover:text-electric-500/20',
            btnHover: 'group-hover:text-electric-500',
        },
    },
    {
        icon: Layers,
        number: '۳',
        tag: 'تلفیق رسانه‌ای',
        title: 'نگاه میان‌رشته‌ای و چندبعدی',
        quote: '«مرزهای سنتی نرم‌افزارها را بشکنید؛ یک ایده خلاق در هر قالبی نفس می‌کشد.»',
        desc: 'هنرمند معاصر نباید محدود به یک ابزار خاص بماند. ما پیوند میان موشن گرافیک، گرافیک دیزاین، تایپوگرافی و تکنولوژی را برای خلق روایت‌های غنی آموزش می‌دهیم.',
        theme: {
            cardBorder: 'hover:border-violet-500/40 dark:hover:border-violet-500/40',
            badgeBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
            dot: 'bg-violet-500',
            iconBox: 'bg-violet-500/10 text-violet-500 group-hover:bg-violet-500 group-hover:text-white',
            glow: 'from-violet-500/15 via-violet-600/5 to-transparent',
            quoteBorder: 'border-r-violet-500/60',
            watermark: 'text-violet-500/10 group-hover:text-violet-500/20',
            btnHover: 'group-hover:text-violet-500',
        },
    },
    {
        icon: Users,
        number: '۴',
        tag: 'هویت و امضا',
        title: 'رشد فردی و هویت مستقل',
        quote: '«آموزش کارآمد کپی‌کار تولید نمی‌کند، بلکه هویت و صدای اختصاصی شما را نمایان می‌سازد.»',
        desc: 'هر دانش‌آموخته مسیر خلاقانه خودش را دارد. در حرکت تلاش می‌کنیم با راهنمایی اساتید و منتورها، امضای بصری ویژه شما کشف و برای بازار کار تثبیت شود.',
        theme: {
            cardBorder: 'hover:border-emerald-500/40 dark:hover:border-emerald-500/40',
            badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
            dot: 'bg-emerald-500',
            iconBox: 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black dark:group-hover:text-black',
            glow: 'from-emerald-500/15 via-emerald-600/5 to-transparent',
            quoteBorder: 'border-r-emerald-500/60',
            watermark: 'text-emerald-500/10 group-hover:text-emerald-500/20',
            btnHover: 'group-hover:text-emerald-500',
        },
    },
];

const statsData = [
    { target: 200, prefix: '+', label: 'دانش‌آموخته خلاق' },
    { target: 30, prefix: '+', label: 'دوره و کارگاه فعال' },
    { target: 15, prefix: '+', label: 'استاد و منتور تخصصی' },
    { target: 98, prefix: '٪', label: 'رضایت هنرجویان' },
];

export default function AboutUs() {
    const navigate = useNavigate();
    const pageRef = useRef(null);
    const storyRef = useRef(null);
    const valuesSectionRef = useRef(null);
    const valuesTrackRef = useRef(null);
    const horizontalProgressRef = useRef(null);
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

            // Horizontal scroll for values section on desktop & tablet
            const valuesSection = valuesSectionRef.current;
            const valuesTrack = valuesTrackRef.current;
            const progressLine = horizontalProgressRef.current;

            if (valuesSection && valuesTrack) {
                const mm = gsap.matchMedia();

                mm.add('(min-width: 768px)', () => {
                    const getDistance = () => {
                        return Math.max(0, valuesTrack.scrollWidth - valuesSection.clientWidth + 96);
                    };

                    // Stagger card entrance within the horizontal scroll
                    const cards = valuesTrack.querySelectorAll('.about-value-card');
                    cards.forEach((card, i) => {
                        gsap.fromTo(card,
                            { opacity: 0, y: 60, scale: 0.92 },
                            {
                                opacity: 1, y: 0, scale: 1,
                                duration: 0.6,
                                ease: 'power3.out',
                                scrollTrigger: {
                                    trigger: valuesSection,
                                    start: `top ${80 - i * 5}%`,
                                    toggleActions: 'play none none none',
                                },
                            }
                        );
                    });

                    gsap.to(valuesTrack, {
                        x: () => getDistance(),
                        ease: 'none',
                        scrollTrigger: {
                            trigger: valuesSection,
                            pin: true,
                            pinSpacing: true,
                            start: 'top top',
                            end: () => `+=${getDistance() * 1.5}`,
                            scrub: 1,
                            anticipatePin: 1,
                            invalidateOnRefresh: true,
                            onUpdate: (self) => {
                                if (progressLine) {
                                    progressLine.style.width = `${Math.round(self.progress * 100)}%`;
                                }
                            },
                        },
                    });
                });

                mm.add('(max-width: 767px)', () => {
                    gsap.fromTo(
                        valuesTrack.querySelectorAll('.about-value-card'),
                        { opacity: 0.3, y: 30 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.6,
                            stagger: 0.15,
                            scrollTrigger: {
                                trigger: valuesSection,
                                start: 'top 80%',
                            },
                        }
                    );
                });
            }

            // Stats counter animation with Persian numbers + GSAP entrance
            const toPersianDigits = (num) => String(Math.round(num)).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

            const statBoxes = el.querySelectorAll('.about-stat-box');

            // Staggered scale-up entrance for stat boxes
            gsap.fromTo(statBoxes,
                { opacity: 0, y: 40, scale: 0.85 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: 'back.out(1.4)',
                    scrollTrigger: {
                        trigger: el.querySelector('.about-stats-grid'),
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    },
                }
            );

            statBoxes.forEach((box, i) => {
                const data = statsData[i];
                if (!data) return;
                const valueEl = box.querySelector('.stat-count-value');
                if (!valueEl) return;

                const counter = { val: 0 };
                gsap.to(counter, {
                    val: data.target,
                    duration: 2.2,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: box,
                        start: 'top 88%',
                        once: true,
                    },
                    onUpdate: () => {
                        valueEl.textContent = data.prefix + toPersianDigits(counter.val);
                    },
                });
            });
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

                    {/* Horizontal Scroll Section: What makes us different */}
                    <div
                        ref={valuesSectionRef}
                        className="w-full relative py-6 flex flex-col items-center gap-8 overflow-hidden"
                    >
                        <div className="flex flex-col items-center gap-3 text-center px-4">
                            <SectionTag>ستون‌های اصلی</SectionTag>
                            <h2 className="text-[clamp(2.2rem,4.5vw,3.5rem)] font-extrabold text-foreground leading-tight">
                                چه چیزی ما رو متفاوت می‌کنه
                            </h2>
                            {/* Minimal progress bar */}
                            <div className="hidden md:flex justify-center mt-3">
                                <div className="w-32 h-1 rounded-full bg-border/60 overflow-hidden">
                                    <div
                                        ref={horizontalProgressRef}
                                        className="h-full bg-primary rounded-full transition-[width] duration-100 will-change-[width]"
                                        style={{ width: '0%' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* The Horizontal Track Wrapper */}
                        <div className="w-full overflow-hidden relative">
                            <div
                                ref={valuesTrackRef}
                                className="flex flex-row gap-6 sm:gap-8 items-stretch will-change-transform py-6 px-4 sm:px-8 w-max"
                            >
                                {values.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`about-value-card group relative bg-card/85 dark:bg-card/90 backdrop-blur-2xl border border-border/80 ${item.theme.cardBorder} rounded-3xl sm:rounded-[2rem] p-7 sm:p-9 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/15 transition-all duration-500 hover:-translate-y-2 w-[340px] sm:w-[440px] lg:w-[470px] min-h-[480px] sm:min-h-[500px] shrink-0 flex flex-col justify-between overflow-clip select-none`}
                                    >
                                        {/* Ambient gradient corner glow */}
                                        <div
                                            className={`pointer-events-none absolute top-0 left-0 w-56 h-56 rounded-full bg-gradient-to-br ${item.theme.glow} blur-3xl opacity-40 group-hover:opacity-80 transition-opacity duration-700`}
                                        />

                                        {/* Giant watermark number in corner */}
                                        <span
                                            className={`pointer-events-none absolute top-3 left-25 text-7xl sm:text-8xl font-black font-title select-none tracking-tighter ${item.theme.watermark} transition-all duration-500 group-hover:scale-105`}
                                        >
                                            {item.number}
                                        </span>

                                        {/* Card Header: Tag badge + Icon */}
                                        <div className="relative z-10 flex items-center justify-between pb-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md ${item.theme.badgeBg}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.theme.dot} animate-pulse`} />
                                                {item.tag}
                                            </span>

                                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 shadow-inner transition-all duration-300 ${item.theme.iconBox}`}>
                                                <item.icon size={22} className="transition-transform duration-300 group-hover:scale-110" />
                                            </div>
                                        </div>

                                        {/* Body Content */}
                                        <div className="relative z-10 flex flex-col gap-4 my-auto py-2">
                                            <h3 className="text-foreground text-xl sm:text-2xl font-black leading-snug group-hover:text-primary transition-colors duration-300">
                                                {item.title}
                                            </h3>

                                            {/* Editorial Takeaway Quote Box */}
                                            <div className={`relative rounded-2xl bg-secondary/40 dark:bg-secondary/20 border border-border/50 border-r-4 ${item.theme.quoteBorder} p-3.5 sm:p-4 text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed backdrop-blur-sm`}>
                                                <p className="italic">{item.quote}</p>
                                            </div>

                                            <p className="text-muted text-sm sm:text-[0.95rem] leading-relaxed font-normal">
                                                {item.desc}
                                            </p>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - Premium Animated Counter Boxes */}
                    <div className="about-stats-grid grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-7 w-full max-w-5xl py-8">
                        {statsData.map((stat, i) => (
                            <div
                                key={i}
                                className="about-stat-box group relative bg-card/80 backdrop-blur-2xl border border-border/70 hover:border-primary/50 rounded-[1.75rem] p-7 sm:p-8 text-center flex flex-col items-center gap-3 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1.5 transition-all duration-500"
                            >
                                {/* Decorative top accent line */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-b-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 group-hover:w-20 transition-all duration-500" />

                                {/* Number with title font */}
                                <span className="stat-count-value text-4xl sm:text-5xl font-black font-title text-foreground tracking-tight select-none min-h-[1.3em] leading-none mt-2">
                                    ۰
                                </span>

                                {/* Subtle divider */}
                                <div className="w-8 h-px bg-border/80 group-hover:bg-primary/50 group-hover:w-12 transition-all duration-300" />

                                {/* Label */}
                                <span className="text-xs sm:text-sm text-muted font-medium leading-snug">
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
