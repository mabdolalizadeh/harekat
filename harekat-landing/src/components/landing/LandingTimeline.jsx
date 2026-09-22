import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionTag from '../ui/SectionTag.jsx';

const defaultSteps = [
    {
        number: '۰۱',
        title: 'یادگیری عملی',
        description: 'از طریق پروژه‌های هفتگی و تکالیف عملی یاد می‌گیری، نه فقط با شنیدن درس.',
    },
    {
        number: '۰۲',
        title: 'نقد و بازخورد',
        description: 'جلسات نقد گروهی بهت کمک می‌کنه تصمیماتت رو توضیح بدی و کارت رو اصلاح کنی.',
    },
    {
        number: '۰۳',
        title: 'چندرسانه‌ای',
        description: 'پروژه‌ها از عکاسی تا برنامه‌نویسی حرکت می‌کنن؛ ابزار عوض می‌شه، روش می‌مونه.',
    },
    {
        number: '۰۴',
        title: 'راهبری فردی',
        description: 'گروه‌های کوچک و بازخورد مستقیم استادان، مسیر رشد شخصیت رو مشخص می‌کنه.',
    },
];

export default function LandingTimeline({ steps = defaultSteps }) {
    const containerRef = useRef(null);
    const pinTargetRef = useRef(null);
    const lineFillRef = useRef(null);
    const cardsContainerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        const pinTarget = pinTargetRef.current;
        const cards = cardsContainerRef.current?.querySelectorAll('.timeline-step-card');
        const lineFill = lineFillRef.current;
        if (!container || !pinTarget || !cards?.length) return;

        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            // Desktop & Tablet pinned experience
            mm.add('(min-width: 768px)', () => {
                // Initial states: start hidden and translated
                gsap.set(cards, { opacity: 0.15, y: 30, scale: 0.94 });
                if (lineFill) gsap.set(lineFill, { scaleX: 0 });

                // Pinned master scroll timeline
                const pinTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: container,
                        pin: pinTarget,
                        start: 'top top',
                        end: '+=1600',
                        scrub: 1,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                    },
                });

                // Sequential activation of each step card
                cards.forEach((card, idx) => {
                    const progressFraction = (idx + 1) / cards.length;

                    pinTl.to(
                        card,
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            duration: 0.6,
                            ease: 'power2.out',
                        },
                        idx * 0.7
                    );

                    if (lineFill) {
                        pinTl.to(
                            lineFill,
                            {
                                scaleX: progressFraction,
                                ease: 'none',
                                duration: 0.7,
                            },
                            idx * 0.7
                        );
                    }
                });

                // Subtle pause at the end so user can absorb the completed state before unpinning
                pinTl.to({}, { duration: 0.5 });
            });

            // Mobile step reveal
            mm.add('(max-width: 767px)', () => {
                gsap.set(cards, { opacity: 0.2, y: 20 });
                cards.forEach((card) => {
                    gsap.to(card, {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 80%',
                            toggleActions: 'play none none reverse',
                        },
                    });
                });
            });
        }, containerRef);

        return () => ctx.revert();
    }, [steps]);

    return (
        <section
            id="how-it-works"
            ref={containerRef}
            className="relative w-full min-h-screen py-10"
        >
            <div
                ref={pinTargetRef}
                className="w-full h-screen flex flex-col justify-center items-center gap-10 px-4 max-w-7xl mx-auto"
            >
                <div className="flex flex-col items-center gap-4 text-center">
                    <SectionTag>نحوه عملکرد</SectionTag>
                    <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] font-extrabold text-foreground max-w-[700px] leading-tight">
                        یادگیری چطور اتفاق می‌افته
                    </h2>
                </div>

                <div className="relative w-full max-w-6xl mt-4">
                    {/* Connecting glowing progress line for desktop */}
                    <div
                        aria-hidden="true"
                        className="hidden lg:block absolute top-[52px] left-8 right-8 h-[3px] bg-border/60 z-0 overflow-hidden rounded-full"
                    >
                        <div
                            ref={lineFillRef}
                            className="h-full w-full bg-gradient-to-r from-primary via-amber-400 to-primary origin-right transform will-change-transform"
                        />
                    </div>

                    <div
                        ref={cardsContainerRef}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 w-full relative z-10"
                    >
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="timeline-step-card flex flex-col gap-4 bg-card/75 backdrop-blur-xl border border-border/80 hover:border-primary/50 rounded-3xl p-6 sm:p-7 shadow-xl shadow-black/10 transition-colors duration-300 will-change-transform"
                            >
                                <span className="text-[clamp(3rem,5vw,4.5rem)] font-black leading-none tracking-tight text-primary select-none">
                                    {step.number}
                                </span>
                                <h3 className="text-foreground text-lg sm:text-xl font-bold">
                                    {step.title}
                                </h3>
                                <p className="text-muted text-sm sm:text-base leading-relaxed font-normal">
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
