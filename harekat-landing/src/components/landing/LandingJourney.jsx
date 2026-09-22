import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import SectionTag from '../ui/SectionTag.jsx';
import { Compass, Sparkles, Target, Layers } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const CHECKPOINTS = [
    {
        id: '01',
        number: '۰۱',
        stationCode: 'CP_01 // DISCOVERY',
        title: 'کشف نگاه و زاویه دید شخصی',
        subtitle: 'نقطه عزیمت • بازتعریف درک بصری',
        description:
            'جایی که یاد می‌گیری دنیا رو از زاویه‌ای نو ببینی؛ قبل از دست‌به‌ابزار شدن، درک فرم، نور، ریتم و قصه‌ای که در جزئیات پنهان شده رو کشف می‌کنی.',
        phase: 'فاز اول: مشاهده و ایده',
        duration: 'هفته ۱ تا ۳',
        tag: 'جهان‌بینی خلاق',
        icon: Compass,
        badgeBg: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    },
    {
        id: '02',
        number: '۰۲',
        stationCode: 'CP_02 // STUDIO_LAB',
        title: 'کارگاه تولید دست‌اول و آزمایشگری',
        subtitle: 'مرز رسانه‌ها • ترکیب هنر و تکنولوژی',
        description:
            'عبور از تئوری به تولید جسورانه. در استودیو پروژه‌های واقعی رو از عکاسی و تصویرسازی تا برنامه‌نویسی خلاق و هوش مصنوعی آغاز می‌کنی؛ آزمایش می‌کنی و می‌سازی.',
        phase: 'فاز دوم: آزمایش و خلق اثر',
        duration: 'هفته ۴ تا ۸',
        tag: 'تولید چندرسانه‌ای',
        icon: Layers,
        badgeBg: 'bg-sky-500/10 text-sky-500 border-sky-500/30',
    },
    {
        id: '03',
        number: '۰۳',
        stationCode: 'CP_03 // CRITIQUE_TABLE',
        title: 'میز نقد صریح و گفت‌وگوی جمعی',
        subtitle: 'شفافیت و تحلیل • صیقل دادن خروجی‌ها',
        description:
            'کارت روی میز نقد قرار می‌گیره. با استادان و هم‌دوره‌ای‌ها به بحث می‌شینی؛ دفاع از تصمیمات طراحی، شنیدن زوایای دید متفاوت و بازنویسی نسخه به نسخه تا رسیدن به بلوغ.',
        phase: 'فاز سوم: دیالوگ و بازخورد',
        duration: 'هفته ۹ تا ۱۱',
        tag: 'تفکر نقادانه',
        icon: Target,
        badgeBg: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    },
    {
        id: '04',
        number: '۰۴',
        stationCode: 'CP_04 // INDEPENDENT_LAUNCH',
        title: 'تثبیت امضای شخصی و ارائه به صنعت',
        subtitle: 'نقطه اوج • تبدیل اثر به هویت مستقل',
        description:
            'به یک زبان تصویری و بیانی مستقل دست پیدا کردی. پروژه‌ت به یک اثر تمام‌عیار در سطح استانداردهای معاصر تبدیل شده؛ آماده برای ارائه در نمایشگاه، بازار کار یا خلق استودیو مستقل.',
        phase: 'فاز چهارم: هویت و خروجی نهایی',
        duration: 'هفته ۱۲ به بعد',
        tag: 'ورود به صنعت',
        icon: Sparkles,
        badgeBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    },
];

// Custom 2D sweeping bezier path for Desktop (viewBox 0 0 700 500)
// Designed specifically for the Harekat landing page with deliberate curves and diagonal transitions
const DESKTOP_ROUTE_D =
    'M 640,50 C 600,50 560,90 530,140 C 490,210 520,290 580,310 C 620,320 630,370 590,410 C 540,450 440,430 380,350 C 330,280 290,160 220,150 C 160,140 130,200 150,260 C 170,320 200,390 170,440 C 140,480 80,480 50,440 C 40,425 35,418 30,410';

const DESKTOP_STATIONS = [
    { x: 530, y: 140, number: '۰۱', code: 'CP_01' },
    { x: 380, y: 350, number: '۰۲', code: 'CP_02' },
    { x: 150, y: 260, number: '۰۳', code: 'CP_03' },
    { x: 50, y: 440, number: '۰۴', code: 'CP_04' },
];

// Mobile 2D serpentine vertical path (viewBox 0 0 60 700)
const MOBILE_ROUTE_D =
    'M 30,20 C 30,70 48,110 48,160 C 48,220 12,280 12,340 C 12,400 48,460 48,520 C 48,580 30,620 30,670 L 30,690';

const MOBILE_STATIONS = [
    { x: 48, y: 160, number: '۰۱' },
    { x: 12, y: 340, number: '۰۲' },
    { x: 48, y: 520, number: '۰۳' },
    { x: 30, y: 670, number: '۰۴' },
];

export default function LandingJourney() {
    const containerRef = useRef(null);
    const pinTargetRef = useRef(null);
    const mobileContainerRef = useRef(null);

    // Desktop elements
    const desktopProgressRef = useRef(null);
    const desktopMarkerRef = useRef(null);
    const cardsContainerRef = useRef(null);

    // Mobile elements
    const mobileProgressRef = useRef(null);
    const mobileMarkerRef = useRef(null);

    // Live Progress HUD
    const progressTextRef = useRef(null);
    const progressBarRef = useRef(null);
    const scrollTriggerRef = useRef(null);
    const stationFractionsRef = useRef([0.08, 0.38, 0.68, 0.94]);

    useEffect(() => {
        const container = containerRef.current;
        const pinTarget = pinTargetRef.current;
        if (!container || !pinTarget) return;

        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            /* ====================================================
             * 1. DESKTOP EXPERIENCE (min-width: 1024px)
             * Pinned cinematic stage: progressive line drawing,
             * voyager traveling along bezier curves, and seamless
             * checkpoint card transitions.
             * ==================================================== */
            mm.add('(min-width: 1024px)', () => {
                const progressPath = desktopProgressRef.current;
                const marker = desktopMarkerRef.current;
                const cardPanels = cardsContainerRef.current?.querySelectorAll('.journey-card-panel');
                const stationNodes = container.querySelectorAll('.desktop-station-node');
                const hudPills = container.querySelectorAll('.journey-hud-pill');

                if (!progressPath || !marker || !cardPanels?.length) return;

                const totalLength = progressPath.getTotalLength();

                // Setup stroke-dasharray & stroke-dashoffset for progressive reveal
                gsap.set(progressPath, {
                    strokeDasharray: totalLength,
                    strokeDashoffset: totalLength,
                });

                // Calculate exact mathematical fractions along the bezier curve
                const exactFractions = DESKTOP_STATIONS.map((st) => {
                    let bestDist = Infinity;
                    let bestFrac = 0.5;
                    const samples = 350;
                    for (let i = 0; i <= samples; i++) {
                        const frac = i / samples;
                        const pt = progressPath.getPointAtLength(frac * totalLength);
                        const dist = Math.hypot(pt.x - st.x, pt.y - st.y);
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestFrac = frac;
                        }
                    }
                    return bestFrac;
                });
                stationFractionsRef.current = exactFractions;

                // Initial card states: Card 0 is visible; Cards 1, 2, 3 are hidden
                gsap.set(cardPanels, { opacity: 0, y: 30, pointerEvents: 'none' });
                gsap.set(cardPanels[0], { opacity: 1, y: 0, pointerEvents: 'auto' });

                // Initial station node states
                gsap.set(stationNodes, { opacity: 0.35, scale: 0.95, transformOrigin: 'center center' });
                gsap.set(stationNodes[0], { opacity: 1, scale: 1.2 });

                const totalDuration = 4; // Normalized timeline duration

                const masterTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: container,
                        pin: pinTarget,
                        start: 'top top',
                        end: '+=2400',
                        scrub: 0.8,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                        onUpdate: (self) => {
                            const p = Math.round(self.progress * 100);
                            if (progressTextRef.current) progressTextRef.current.textContent = `${p}٪`;
                            if (progressBarRef.current) progressBarRef.current.style.width = `${p}%`;
                        },
                    },
                });

                scrollTriggerRef.current = masterTl.scrollTrigger;

                // 1. Draw SVG line progressively (0% to 100%)
                masterTl.fromTo(
                    progressPath,
                    { strokeDashoffset: totalLength },
                    { strokeDashoffset: 0, ease: 'none', duration: totalDuration },
                    0
                );

                // 2. Synchronized voyager marker traveling exactly along the path
                masterTl.to(
                    marker,
                    {
                        motionPath: {
                            path: progressPath,
                            align: progressPath,
                            alignOrigin: [0.5, 0.5],
                            autoRotate: true,
                        },
                        ease: 'none',
                        duration: totalDuration,
                    },
                    0
                );

                // 3. Seamless checkpoint content transitions
                for (let i = 0; i < cardPanels.length - 1; i++) {
                    const currentFrac = exactFractions[i];
                    const nextFrac = exactFractions[i + 1];
                    const transitionPoint = ((currentFrac + nextFrac) / 2) * totalDuration;

                    const curCard = cardPanels[i];
                    const nextCard = cardPanels[i + 1];
                    const curStation = stationNodes[i];
                    const nextStation = stationNodes[i + 1];
                    const curPill = hudPills[i];
                    const nextPill = hudPills[i + 1];

                    // Transition out current card
                    masterTl.to(
                        curCard,
                        {
                            opacity: 0,
                            y: -25,
                            duration: 0.35,
                            ease: 'power2.in',
                            onStart: () => { curCard.style.pointerEvents = 'none'; },
                            onReverseComplete: () => { curCard.style.pointerEvents = 'auto'; },
                        },
                        transitionPoint - 0.2
                    );

                    // Transition in next card
                    masterTl.fromTo(
                        nextCard,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.35,
                            ease: 'power2.out',
                            onStart: () => { nextCard.style.pointerEvents = 'auto'; },
                            onReverseComplete: () => { nextCard.style.pointerEvents = 'none'; },
                        },
                        transitionPoint
                    );

                    // Activate next station node
                    if (curStation && nextStation) {
                        masterTl.to(
                            curStation,
                            { opacity: 0.6, scale: 1, duration: 0.25 },
                            transitionPoint - 0.1
                        );
                        masterTl.to(
                            nextStation,
                            { opacity: 1, scale: 1.25, duration: 0.35, ease: 'back.out(1.7)' },
                            transitionPoint
                        );
                    }

                    // Update HUD pills
                    if (curPill && nextPill) {
                        masterTl.to(
                            curPill,
                            { opacity: 0.6, borderColor: 'var(--border)', duration: 0.2 },
                            transitionPoint - 0.1
                        );
                        masterTl.to(
                            nextPill,
                            { opacity: 1, borderColor: 'var(--primary)', duration: 0.2 },
                            transitionPoint
                        );
                    }
                }

                // Buffer pause at end so full final checkpoint can be explored
                masterTl.to({}, { duration: 0.4 });
            });

            /* ====================================================
             * 2. TABLET & MOBILE EXPERIENCE (< 1024px)
             * Natural vertical scroll journey with drawing track
             * and traveling marker along side of stacked cards
             * ==================================================== */
            mm.add('(max-width: 1023px)', () => {
                const mobileProgress = mobileProgressRef.current;
                const mobileMarker = mobileMarkerRef.current;
                const mobileCards = container.querySelectorAll('.mobile-journey-checkpoint');
                const mobileNodes = container.querySelectorAll('.mobile-station-node');
                const mobContainer = mobileContainerRef.current;

                if (!mobileProgress || !mobileMarker || !mobileCards.length || !mobContainer) return;

                const mobileLength = mobileProgress.getTotalLength();

                gsap.set(mobileProgress, {
                    strokeDasharray: mobileLength,
                    strokeDashoffset: mobileLength,
                });

                gsap.set(mobileCards, { opacity: 0.3, y: 20, scale: 0.98 });
                gsap.set(mobileNodes, { opacity: 0.4 });

                const mobileTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: mobContainer,
                        start: 'top 75%',
                        end: 'bottom 85%',
                        scrub: 0.8,
                        onUpdate: (self) => {
                            const p = Math.round(self.progress * 100);
                            if (progressTextRef.current) progressTextRef.current.textContent = `${p}٪`;
                            if (progressBarRef.current) progressBarRef.current.style.width = `${p}%`;
                        },
                    },
                });

                scrollTriggerRef.current = mobileTl.scrollTrigger;

                mobileTl.fromTo(
                    mobileProgress,
                    { strokeDashoffset: mobileLength },
                    { strokeDashoffset: 0, ease: 'none', duration: 4 },
                    0
                );

                mobileTl.to(
                    mobileMarker,
                    {
                        motionPath: {
                            path: mobileProgress,
                            align: mobileProgress,
                            alignOrigin: [0.5, 0.5],
                            autoRotate: true,
                        },
                        ease: 'none',
                        duration: 4,
                    },
                    0
                );

                mobileCards.forEach((card, idx) => {
                    const fraction = (idx + 0.25) / mobileCards.length;
                    const timePoint = fraction * 4;
                    const node = mobileNodes[idx];

                    mobileTl.to(
                        card,
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            borderColor: 'var(--primary)',
                            duration: 0.35,
                            ease: 'power2.out',
                        },
                        timePoint
                    );

                    if (node) {
                        mobileTl.to(
                            node,
                            {
                                opacity: 1,
                                scale: 1.25,
                                duration: 0.3,
                                transformOrigin: 'center center',
                            },
                            timePoint
                        );
                    }
                });
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Checkpoint navigation click handler
    const handleStationClick = (idx) => {
        const st = scrollTriggerRef.current;
        if (!st) return;

        const fraction = stationFractionsRef.current[idx] ?? (idx / CHECKPOINTS.length);
        const targetScroll = st.start + (st.end - st.start) * fraction;

        if (window.__lenis) {
            window.__lenis.scrollTo(targetScroll, { duration: 1.2 });
        } else {
            window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
    };

    return (
        <section
            id="journey"
            data-section-theme="journey"
            ref={containerRef}
            className="relative w-full min-h-screen py-10 lg:py-0"
        >
            <div
                ref={pinTargetRef}
                className="w-full lg:h-screen flex flex-col justify-center items-center gap-5 sm:gap-6 px-4 sm:px-6 max-w-7xl mx-auto"
            >
                {/* 1. SECTION HEADER */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <SectionTag>مسیر تجربه هنرجو</SectionTag>
                    <h2 className="text-[clamp(1.9rem,3.8vw,3.2rem)] font-extrabold text-foreground max-w-[720px] leading-tight">
                        سفر خلاقیت؛ از جرقه ایده تا امضای مستقل
                    </h2>
                    <p className="text-muted text-sm sm:text-base max-w-xl">
                        هر هنرجو در حرکت یک نقشه راه اختصاصی رو طی می‌کنه؛ مسیری پیوسته برای تبدیل شدن به یک خلق‌کننده پیشرو
                    </p>
                </div>

                {/* 2. LIVE ROUTE HUD BAR */}
                <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-5xl px-4 py-2.5 rounded-2xl bg-card/75 backdrop-blur-md border border-border/80 shadow-sm">
                    {/* Live Progress indicator */}
                    <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-medium text-muted select-none">مسیر طی‌شده:</span>
                        <span
                            ref={progressTextRef}
                            className="text-xs font-mono font-bold text-primary min-w-[3.5ch] select-none"
                        >
                            ۰٪
                        </span>
                        <div className="w-20 sm:w-28 h-1.5 rounded-full bg-border/60 overflow-hidden">
                            <div
                                ref={progressBarRef}
                                className="h-full bg-primary rounded-full transition-[width] duration-150 will-change-[width]"
                                style={{ width: '0%' }}
                            />
                        </div>
                    </div>

                    {/* Clickable Station Buttons */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {CHECKPOINTS.map((cp, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleStationClick(idx)}
                                className={`journey-hud-pill px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium border border-border/60 bg-foreground/5 hover:border-primary/50 text-foreground/80 hover:text-foreground transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                                    idx === 0 ? 'opacity-100 border-primary/50 text-primary' : 'opacity-60'
                                }`}
                            >
                                <span className="font-mono text-[10px] text-primary">{cp.number}</span>
                                <span className="hidden md:inline">{cp.tag}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. DESKTOP STAGE (min-width: 1024px) */}
                <div className="hidden lg:grid grid-cols-12 gap-8 w-full max-w-6xl items-center mt-2">
                    {/* Visual Route Canvas (7 Cols) */}
                    <div className="col-span-7 relative h-[440px] flex items-center justify-center">
                        <svg
                            viewBox="0 0 700 500"
                            className="w-full h-full overflow-visible select-none pointer-events-none"
                            preserveAspectRatio="xMidYMid meet"
                        >
                            {/* Route Shadow / Guide Track (clean 2D dashed track) */}
                            <path
                                d={DESKTOP_ROUTE_D}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray="4 6"
                                className="text-foreground/15"
                            />

                            {/* Active Route Progress Line (Progressively drawn via GSAP) */}
                            <path
                                ref={desktopProgressRef}
                                d={DESKTOP_ROUTE_D}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-primary will-change-transform"
                            />

                            {/* Checkpoint Station Nodes */}
                            {DESKTOP_STATIONS.map((st, idx) => (
                                <g
                                    key={idx}
                                    className="desktop-station-node"
                                    transform={`translate(${st.x}, ${st.y})`}
                                >
                                    {/* Outer ring */}
                                    <circle
                                        r="16"
                                        fill="var(--card)"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="text-foreground/30 transition-colors"
                                    />
                                    {/* Core dot */}
                                    <circle
                                        r="6"
                                        fill="currentColor"
                                        className="text-primary"
                                    />
                                    {/* Station code label */}
                                    <text
                                        x="0"
                                        y="-24"
                                        textAnchor="middle"
                                        className="text-[11px] font-mono font-bold fill-muted select-none"
                                    >
                                        {st.code}
                                    </text>
                                </g>
                            ))}

                            {/* 2D Voyager Traveler Marker */}
                            <g
                                ref={desktopMarkerRef}
                                id="journey-voyager-marker"
                                className="will-change-transform"
                                style={{ transformOrigin: '0px 0px' }}
                            >
                                {/* Outer Reticle Ring */}
                                <circle
                                    cx="0"
                                    cy="0"
                                    r="18"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeDasharray="3 3"
                                    className="text-primary/60"
                                />
                                {/* Voyager Disc */}
                                <circle
                                    cx="0"
                                    cy="0"
                                    r="12"
                                    fill="var(--card)"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    className="text-primary"
                                />
                                {/* 2D Directional Arrowhead */}
                                <polygon
                                    points="9,0 -5,-5 -2,0 -5,5"
                                    fill="currentColor"
                                    className="text-primary"
                                />
                                {/* Pivot Center Point */}
                                <circle
                                    cx="0"
                                    cy="0"
                                    r="2.5"
                                    fill="var(--foreground)"
                                />
                            </g>
                        </svg>
                    </div>

                    {/* Active Checkpoint Showcase (5 Cols) */}
                    <div
                        ref={cardsContainerRef}
                        className="col-span-5 relative h-[380px] flex items-center"
                    >
                        {CHECKPOINTS.map((cp, idx) => {
                            const IconComponent = cp.icon;
                            return (
                                <div
                                    key={idx}
                                    className="journey-card-panel absolute inset-0 flex flex-col justify-between p-7 rounded-3xl bg-card/85 backdrop-blur-xl border border-border/80 shadow-2xl shadow-black/5 will-change-transform"
                                >
                                    {/* Header Meta */}
                                    <div className="flex items-center justify-between border-b border-border/50 pb-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                                <IconComponent className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-mono text-[10px] font-bold tracking-wider text-muted">
                                                    {cp.stationCode}
                                                </div>
                                                <div className="text-xs font-semibold text-foreground/80">
                                                    {cp.phase}
                                                </div>
                                            </div>
                                        </div>

                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${cp.badgeBg}`}>
                                            {cp.tag}
                                        </span>
                                    </div>

                                    {/* Body Text */}
                                    <div className="flex flex-col gap-2.5 my-2">
                                        <h3 className="text-xl font-extrabold text-foreground leading-snug">
                                            {cp.title}
                                        </h3>
                                        <p className="text-muted text-xs leading-relaxed font-normal">
                                            {cp.subtitle}
                                        </p>
                                        <p className="text-foreground/80 text-sm leading-relaxed mt-1">
                                            {cp.description}
                                        </p>
                                    </div>

                                    {/* Footer Stats */}
                                    <div className="flex items-center justify-between pt-4 border-t border-border/50 text-xs">
                                        <div className="flex items-center gap-1.5 text-muted font-mono">
                                            <span>طول دوره:</span>
                                            <span className="font-bold text-foreground">{cp.duration}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-primary text-sm">
                                                {cp.number}
                                            </span>
                                            <span className="text-muted/60 font-mono text-[11px]">/ ۰۴</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 4. TABLET & MOBILE VERTICAL JOURNEY (< 1024px) */}
                <div
                    ref={mobileContainerRef}
                    className="flex lg:hidden w-full max-w-xl items-start gap-4 sm:gap-6 mt-4 relative"
                >
                    {/* Vertical Route SVG Track */}
                    <div className="relative w-10 sm:w-12 h-[700px] shrink-0 self-stretch">
                        <svg
                            viewBox="0 0 60 700"
                            className="w-full h-full overflow-visible select-none"
                            preserveAspectRatio="none"
                        >
                            {/* Guide Track */}
                            <path
                                d={MOBILE_ROUTE_D}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray="4 6"
                                className="text-foreground/15"
                            />

                            {/* Active Progress Line */}
                            <path
                                ref={mobileProgressRef}
                                d={MOBILE_ROUTE_D}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-primary will-change-transform"
                            />

                            {/* Station Nodes */}
                            {MOBILE_STATIONS.map((st, idx) => (
                                <g
                                    key={idx}
                                    className="mobile-station-node"
                                    transform={`translate(${st.x}, ${st.y})`}
                                >
                                    <circle
                                        r="12"
                                        fill="var(--card)"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="text-foreground/30"
                                    />
                                    <circle
                                        r="5"
                                        fill="currentColor"
                                        className="text-primary"
                                    />
                                </g>
                            ))}

                            {/* Mobile Voyager Marker */}
                            <g
                                ref={mobileMarkerRef}
                                className="will-change-transform"
                                style={{ transformOrigin: '0px 0px' }}
                            >
                                <circle
                                    cx="0"
                                    cy="0"
                                    r="14"
                                    fill="var(--card)"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-primary"
                                />
                                <polygon
                                    points="7,0 -4,-4 -2,0 -4,4"
                                    fill="currentColor"
                                    className="text-primary"
                                />
                                <circle
                                    cx="0"
                                    cy="0"
                                    r="2"
                                    fill="var(--foreground)"
                                />
                            </g>
                        </svg>
                    </div>

                    {/* Mobile Checkpoint Cards Stack */}
                    <div className="flex flex-col gap-6 sm:gap-8 flex-1">
                        {CHECKPOINTS.map((cp, idx) => (
                            <div
                                key={idx}
                                className="mobile-journey-checkpoint flex flex-col gap-3 bg-card/85 backdrop-blur-xl border border-border/80 rounded-2xl p-5 shadow-md shadow-black/5"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-black leading-none text-primary select-none font-mono">
                                        {cp.number}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${cp.badgeBg}`}>
                                        {cp.tag}
                                    </span>
                                </div>

                                <h3 className="text-foreground text-base font-bold">
                                    {cp.title}
                                </h3>

                                <p className="text-muted text-xs leading-relaxed font-normal">
                                    {cp.subtitle}
                                </p>

                                <p className="text-foreground/80 text-xs leading-relaxed">
                                    {cp.description}
                                </p>

                                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted font-mono">
                                    <span>{cp.phase}</span>
                                    <span className="font-bold text-foreground">{cp.duration}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
