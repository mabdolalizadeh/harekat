import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import SectionTag from '../ui/SectionTag.jsx';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const defaultSteps = [
    {
        number: '۰۱',
        title: 'یادگیری عملی',
        tag: 'پروژه‌محور',
        description: 'از طریق پروژه‌های هفتگی و تکالیف عملی یاد می‌گیری، نه فقط با شنیدن درس.',
        highlight: 'تمرین بر اساس چالش‌های دنیای واقعی',
    },
    {
        number: '۰۲',
        title: 'نقد و بازخورد',
        tag: 'گفت‌وگوی نقادانه',
        description: 'جلسات نقد گروهی بهت کمک می‌کنه تصمیماتت رو توضیح بدی و کارت رو اصلاح کنی.',
        highlight: 'جلسات نقد هفتگی با استادان و هم‌دوره‌ای‌ها',
    },
    {
        number: '۰۳',
        title: 'چندرسانه‌ای',
        tag: 'تلفیق ابزار و رسانه',
        description: 'پروژه‌ها از عکاسی تا برنامه‌نویسی حرکت می‌کنن؛ ابزار عوض می‌شه، روش می‌مونه.',
        highlight: 'تلفیق هنر، فناوری و طراحی در پروژه‌های مشترک',
    },
    {
        number: '۰۴',
        title: 'راهبری فردی',
        tag: 'رشد هدفمند',
        description: 'گروه‌های کوچک و بازخورد مستقیم استادان، مسیر رشد شخصیت رو مشخص می‌کنه.',
        highlight: 'هدایت فردی تا ورود به بازار کار یا خلق اثر مستقل',
    },
];

// Desktop 2D Serpentine Path passing through stations at X = 1050, 750, 450, 150
const DESKTOP_PATH_D =
    'M 1160,60 C 1120,60 1090,75 1050,75 C 970,75 920,20 850,20 C 790,20 770,60 750,75 C 730,90 710,130 630,130 C 530,130 490,90 450,75 C 390,60 350,20 270,20 C 190,20 170,60 150,75 C 110,90 70,60 40,60';

// Station coordinates in Desktop viewBox (0 0 1200 150)
const DESKTOP_STATIONS = [
    { x: 1050, y: 75, number: '۰۱' },
    { x: 750, y: 75, number: '۰۲' },
    { x: 450, y: 75, number: '۰۳' },
    { x: 150, y: 75, number: '۰۴' },
];

// Mobile 2D Serpentine Path in viewBox (0 0 50 800)
const MOBILE_PATH_D =
    'M 25,20 C 25,60 38,90 38,130 C 38,210 12,260 12,330 C 12,410 38,470 38,530 C 38,610 25,670 25,730 L 25,780';

const MOBILE_STATIONS = [
    { x: 38, y: 130, number: '۰۱' },
    { x: 12, y: 330, number: '۰۲' },
    { x: 38, y: 530, number: '۰۳' },
    { x: 25, y: 730, number: '۰۴' },
];

export default function LandingTimeline({ steps = defaultSteps }) {
    const containerRef = useRef(null);
    const pinTargetRef = useRef(null);
    const mobileContainerRef = useRef(null);

    // Desktop refs
    const desktopProgressRef = useRef(null);
    const desktopMarkerRef = useRef(null);

    // Mobile refs
    const mobileProgressRef = useRef(null);
    const mobileMarkerRef = useRef(null);

    // UI refs
    const progressTextRef = useRef(null);
    const progressBarRef = useRef(null);
    const scrollTriggerRef = useRef(null);
    const stationFractionsRef = useRef([0.10, 0.38, 0.66, 0.92]);

    useEffect(() => {
        const container = containerRef.current;
        const pinTarget = pinTargetRef.current;
        if (!container || !pinTarget) return;

        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            /* ====================================================
             * 1. DESKTOP EXPERIENCE (min-width: 1024px)
             * Pinned panoramic journey with animated line draw,
             * traveling voyager marker, and checkpoint illumination
             * ==================================================== */
            mm.add('(min-width: 1024px)', () => {
                const progressPath = desktopProgressRef.current;
                const marker = desktopMarkerRef.current;
                const cards = container.querySelectorAll('.desktop-journey-card');
                const nodes = container.querySelectorAll('.desktop-station-node');
                const hudPills = container.querySelectorAll('.journey-hud-pill');

                if (!progressPath || !marker || !cards.length) return;

                const totalLength = progressPath.getTotalLength();

                // Setup stroke-dasharray & stroke-dashoffset
                gsap.set(progressPath, {
                    strokeDasharray: totalLength,
                    strokeDashoffset: totalLength,
                });

                // Set initial card & station states
                gsap.set(cards, { opacity: 0.3, y: 18, scale: 0.97 });
                gsap.set(nodes, { opacity: 0.45, scale: 0.95, transformOrigin: 'center center' });

                // Calculate exact fractions along the bezier curve
                const stationXCoords = [1050, 750, 450, 150];
                const calculatedFractions = stationXCoords.map((targetX) => {
                    let bestDist = Infinity;
                    let bestFrac = 0.5;
                    const samples = 250;
                    for (let i = 0; i <= samples; i++) {
                        const frac = i / samples;
                        const pt = progressPath.getPointAtLength(frac * totalLength);
                        const dist = Math.abs(pt.x - targetX);
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestFrac = frac;
                        }
                    }
                    return bestFrac;
                });
                stationFractionsRef.current = calculatedFractions;

                const pinTl = gsap.timeline({
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

                scrollTriggerRef.current = pinTl.scrollTrigger;

                // 1. Draw line progressively and move traveler marker simultaneously (synchronized 1:1)
                pinTl.fromTo(
                    progressPath,
                    { strokeDashoffset: totalLength },
                    { strokeDashoffset: 0, ease: 'none', duration: 4 },
                    0
                );

                pinTl.to(
                    marker,
                    {
                        motionPath: {
                            path: progressPath,
                            align: progressPath,
                            alignOrigin: [0.5, 0.5],
                            autoRotate: true,
                        },
                        ease: 'none',
                        duration: 4,
                    },
                    0
                );

                // 2. Sequentially activate checkpoints as voyager reaches them
                calculatedFractions.forEach((frac, idx) => {
                    const timePoint = frac * 4;
                    const card = cards[idx];
                    const node = nodes[idx];
                    const hudPill = hudPills[idx];

                    if (card) {
                        pinTl.to(
                            card,
                            {
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                duration: 0.35,
                                ease: 'power2.out',
                            },
                            Math.max(0, timePoint - 0.15)
                        );
                    }

                    if (node) {
                        pinTl.to(
                            node,
                            {
                                opacity: 1,
                                scale: 1.15,
                                duration: 0.35,
                                ease: 'back.out(1.7)',
                            },
                            Math.max(0, timePoint - 0.15)
                        );
                    }

                    if (hudPill) {
                        pinTl.to(
                            hudPill,
                            {
                                opacity: 1,
                                borderColor: 'var(--primary)',
                                duration: 0.2,
                            },
                            Math.max(0, timePoint - 0.15)
                        );
                    }
                });

                // Buffer pause at end so full journey remains viewable before unpinning
                pinTl.to({}, { duration: 0.5 });
            });

            /* ====================================================
             * 2. TABLET & MOBILE EXPERIENCE (< 1024px)
             * Smooth vertical scroll-driven journey along cards
             * ==================================================== */
            mm.add('(max-width: 1023px)', () => {
                const mobileProgress = mobileProgressRef.current;
                const mobileMarker = mobileMarkerRef.current;
                const mobileCards = container.querySelectorAll('.mobile-journey-card');
                const mobileNodes = container.querySelectorAll('.mobile-station-node');
                const hudPills = container.querySelectorAll('.journey-hud-pill');
                const mobContainer = mobileContainerRef.current;

                if (!mobileProgress || !mobileMarker || !mobileCards.length || !mobContainer) return;

                const mobileLength = mobileProgress.getTotalLength();

                gsap.set(mobileProgress, {
                    strokeDasharray: mobileLength,
                    strokeDashoffset: mobileLength,
                });

                gsap.set(mobileCards, { opacity: 0.25, y: 15, scale: 0.98 });
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

                // Draw vertical line and glide traveler down
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
                    const fraction = (idx + 0.3) / mobileCards.length;
                    const timePoint = fraction * 4;
                    const node = mobileNodes[idx];
                    const hudPill = hudPills[idx];

                    mobileTl.to(
                        card,
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
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
                                scale: 1.2,
                                duration: 0.35,
                                transformOrigin: 'center center',
                            },
                            timePoint
                        );
                    }

                    if (hudPill) {
                        mobileTl.to(
                            hudPill,
                            {
                                opacity: 1,
                                borderColor: 'var(--primary)',
                                duration: 0.2,
                            },
                            timePoint
                        );
                    }
                });
            });
        }, containerRef);

        return () => ctx.revert();
    }, [steps]);

    // Checkpoint navigation click handler
    const handleStationClick = (idx) => {
        const st = scrollTriggerRef.current;
        if (!st) return;

        const fraction = stationFractionsRef.current[idx] ?? (idx / steps.length);
        const targetScroll = st.start + (st.end - st.start) * fraction;

        if (window.__lenis) {
            window.__lenis.scrollTo(targetScroll, { duration: 1.2 });
        } else {
            window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
    };

    return (
        <section
            id="how-it-works"
            data-section-theme="how-it-works"
            ref={containerRef}
            className="relative w-full min-h-screen py-12 lg:py-0"
        >
            <div
                ref={pinTargetRef}
                className="w-full lg:h-screen flex flex-col justify-center items-center gap-5 sm:gap-6 lg:gap-7 px-4 max-w-7xl mx-auto"
            >
                {/* 1. SECTION HEADER */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <SectionTag>نحوه عملکرد</SectionTag>
                    <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-extrabold text-foreground max-w-[700px] leading-tight">
                        یادگیری چطور اتفاق می‌افته
                    </h2>
                    <p className="text-muted text-sm sm:text-base max-w-xl">
                        مسیر چهار مرحله‌ای حرکت؛ از تمرین عملی تا راهبری تخصصی فردی
                    </p>
                </div>

                {/* 2. INTERACTIVE ROUTE HUD */}
                <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-5xl px-4 py-2.5 rounded-2xl bg-card/70 backdrop-blur-md border border-border/80 shadow-sm">
                    {/* Live Progress Percentage & Bar */}
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

                    {/* Clickable Checkpoint Buttons */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {steps.map((step, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleStationClick(idx)}
                                className="journey-hud-pill px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium border border-border/60 bg-foreground/5 hover:border-primary/50 text-foreground/80 hover:text-foreground transition-all duration-200 flex items-center gap-1 cursor-pointer opacity-70"
                            >
                                <span className="font-mono text-[11px] text-primary">{step.number}</span>
                                <span className="hidden sm:inline">{step.title}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. DESKTOP PANORAMIC JOURNEY (min-width: 1024px) */}
                <div className="hidden lg:flex flex-col w-full max-w-6xl mt-1">
                    {/* SVG Map Canvas */}
                    <div className="relative w-full h-[150px]">
                        <svg
                            viewBox="0 0 1200 150"
                            className="w-full h-full overflow-visible select-none"
                            preserveAspectRatio="xMidYMid meet"
                        >
                            {/* Route Shadow / Guide Track (clean 2D dashed track) */}
                            <path
                                d={DESKTOP_PATH_D}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray="4 6"
                                className="text-foreground/15"
                            />

                            {/* Active Progress Line (drawn dynamically via GSAP) */}
                            <path
                                ref={desktopProgressRef}
                                d={DESKTOP_PATH_D}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
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
                                    {/* Leader connector dropping down to the card */}
                                    <line
                                        x1="0"
                                        y1="16"
                                        x2="0"
                                        y2="65"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeDasharray="3 4"
                                        className="text-foreground/20"
                                    />
                                    {/* Outer station ring */}
                                    <circle
                                        r="16"
                                        fill="var(--card)"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="text-foreground/30"
                                    />
                                    {/* Core station indicator dot */}
                                    <circle
                                        r="6"
                                        fill="currentColor"
                                        className="text-primary"
                                    />
                                    {/* Station number label */}
                                    <text
                                        x="0"
                                        y="-22"
                                        textAnchor="middle"
                                        className="text-[11px] font-mono font-bold fill-muted select-none"
                                    >
                                        گام {st.number}
                                    </text>
                                </g>
                            ))}

                            {/* 2D Voyager Traveler Marker */}
                            <g
                                ref={desktopMarkerRef}
                                id="desktop-voyager-marker"
                                className="will-change-transform"
                                style={{ transformOrigin: '0px 0px' }}
                            >
                                {/* Outer tracking reticle */}
                                <circle
                                    cx="0"
                                    cy="0"
                                    r="18"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeDasharray="3 3"
                                    className="text-primary/50"
                                />
                                {/* Voyager circular disc */}
                                <circle
                                    cx="0"
                                    cy="0"
                                    r="12"
                                    fill="var(--card)"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-primary"
                                />
                                {/* Directional 2D Arrowhead aligned with path tangent */}
                                <polygon
                                    points="9,0 -5,-5 -2,0 -5,5"
                                    fill="currentColor"
                                    className="text-primary"
                                />
                                {/* Center pivot dot */}
                                <circle
                                    cx="0"
                                    cy="0"
                                    r="2"
                                    fill="var(--foreground)"
                                />
                            </g>
                        </svg>
                    </div>

                    {/* 4 Cards Aligned with the 4 Stations */}
                    <div className="grid grid-cols-4 gap-6 w-full -mt-2">
                        {steps.map((step, idx) => (
                            <div
                                key={idx}
                                className="desktop-journey-card flex flex-col gap-3.5 bg-card/80 backdrop-blur-xl border border-border/80 hover:border-primary/50 rounded-2xl p-5 shadow-lg shadow-black/5 transition-colors duration-300 will-change-transform relative group cursor-pointer"
                                onClick={() => handleStationClick(idx)}
                            >
                                {/* Top Alignment Indicator Pin */}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/70 ring-2 ring-card" />

                                <div className="flex items-center justify-between">
                                    <span className="text-3xl font-black leading-none tracking-tight text-primary select-none">
                                        {step.number}
                                    </span>
                                    {step.tag && (
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-foreground/5 text-muted border border-border/50">
                                            {step.tag}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-foreground text-base font-bold group-hover:text-primary transition-colors">
                                    {step.title}
                                </h3>

                                <p className="text-muted text-xs leading-relaxed font-normal">
                                    {step.description}
                                </p>

                                {step.highlight && (
                                    <div className="mt-auto pt-2 border-t border-border/50 text-[11px] text-muted/80">
                                        {step.highlight}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. TABLET & MOBILE VERTICAL JOURNEY (< 1024px) */}
                <div
                    ref={mobileContainerRef}
                    className="flex lg:hidden w-full max-w-xl items-start gap-4 sm:gap-6 mt-4 relative"
                >
                    {/* Vertical Route SVG Track */}
                    <div className="relative w-10 sm:w-12 h-[800px] shrink-0 self-stretch">
                        <svg
                            viewBox="0 0 50 800"
                            className="w-full h-full overflow-visible select-none"
                            preserveAspectRatio="none"
                        >
                            {/* Guide Track */}
                            <path
                                d={MOBILE_PATH_D}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray="4 6"
                                className="text-foreground/15"
                            />

                            {/* Active Progress Line */}
                            <path
                                ref={mobileProgressRef}
                                d={MOBILE_PATH_D}
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

                    {/* Mobile Cards Stack */}
                    <div className="flex flex-col gap-6 sm:gap-8 flex-1">
                        {steps.map((step, idx) => (
                            <div
                                key={idx}
                                className="mobile-journey-card flex flex-col gap-3 bg-card/80 backdrop-blur-xl border border-border/80 rounded-2xl p-5 shadow-md shadow-black/5"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-black leading-none text-primary select-none">
                                        {step.number}
                                    </span>
                                    {step.tag && (
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-foreground/5 text-muted border border-border/50">
                                            {step.tag}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-foreground text-base font-bold">
                                    {step.title}
                                </h3>

                                <p className="text-muted text-xs leading-relaxed font-normal">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
