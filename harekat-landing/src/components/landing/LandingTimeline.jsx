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
    const sectionRef = useRef(null);
    const lineRef = useRef(null);
    const cardsRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        const line = lineRef.current;
        const cards = cardsRef.current?.querySelectorAll('.timeline-step-card');
        if (!section || !cards?.length) return;

        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            // Animate progress line on desktop
            mm.add('(min-width: 1024px)', () => {
                if (line) {
                    gsap.fromTo(
                        line,
                        { scaleX: 0 },
                        {
                            scaleX: 1,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: cardsRef.current,
                                start: 'top 75%',
                                end: 'bottom 60%',
                                scrub: 0.5,
                            }
                        }
                    );
                }

                // Staggered reveals
                gsap.fromTo(
                    cards,
                    { opacity: 0, y: 50, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.8,
                        stagger: 0.15,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: cardsRef.current,
                            start: 'top 80%',
                        }
                    }
                );
            });

            // Tablet & Mobile
            mm.add('(max-width: 1023px)', () => {
                gsap.fromTo(
                    cards,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        stagger: 0.1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: cardsRef.current,
                            start: 'top 85%',
                        }
                    }
                );
            });
        }, sectionRef);

        return () => ctx.revert();
    }, [steps]);

    return (
        <section
            id="how-it-works"
            ref={sectionRef}
            className="w-full py-16 sm:py-28 flex flex-col items-center gap-10 px-4"
        >
            <div className="flex flex-col items-center gap-4 text-center">
                <SectionTag>نحوه عملکرد</SectionTag>
                <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] font-extrabold text-foreground max-w-[700px] leading-tight">
                    یادگیری چطور اتفاق می‌افته
                </h2>
            </div>

            <div className="relative w-full max-w-6xl mt-6">
                {/* Connecting glowing progress line for desktop */}
                <div
                    aria-hidden="true"
                    className="hidden lg:block absolute top-[52px] left-8 right-8 h-[2px] bg-border/60 z-0 overflow-hidden"
                >
                    <div
                        ref={lineRef}
                        className="h-full w-full bg-gradient-to-r from-primary via-amber-400 to-primary origin-right transform scale-x-0 will-change-transform"
                    />
                </div>

                <div
                    ref={cardsRef}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full relative z-10"
                >
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="timeline-step-card flex flex-col gap-4 bg-card/70 backdrop-blur-md border border-border/80 hover:border-primary/40 rounded-3xl p-6 sm:p-7 shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 will-change-transform"
                        >
                            <span className="text-[clamp(3rem,5vw,4.5rem)] font-black leading-none tracking-tight text-primary/85 select-none">
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
        </section>
    );
}
