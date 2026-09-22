import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionTag from '../ui/SectionTag.jsx';

const persianDigits = ['۰۱', '۰۲', '۰۳', '۰۴'];

const audienceList = [
    {
        title: 'طراحان',
        desc: 'طراحانی که می‌خوان فراتر از ابزار فکر کنن، روش‌شناسی عمیق یاد بگیرن و خروجی‌هایی خلق کنن که هویت مستقل دارن.',
    },
    {
        title: 'عکاسان و تصویربرداران',
        desc: 'عکاسانی که می‌خوان هنرشون فقط تکنیک لنز و نور نباشه؛ بلکه روایت‌گر داستان‌های مفهومی، هنری و تاثیرگذار باشه.',
    },
    {
        title: 'هنرمندان چندرسانه‌ای',
        desc: 'هنرمندانی که می‌خوان آزادانه بین فرمت‌ها و رسانه‌ها حرکت کنن و پیوند میان هنر کلاسیک و تکنولوژی نو را تجربه کنند.',
    },
    {
        title: 'خلاقان و ایده‌پردازان',
        desc: 'هر کسی که ایده‌های بزرگی در ذهن داره و احساس می‌کنه خلاقیتش نیاز به سازماندهی، نقد سازنده و جهت‌گیری حرفه‌ای داره.',
    },
];

export default function LandingAudience() {
    const sectionRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const cards = section.querySelectorAll('.audience-vertical-card');
        if (!cards.length) return;

        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            mm.add('(min-width: 768px)', () => {
                cards.forEach((card, i) => {
                    // Update active indicator on scroll
                    ScrollTrigger.create({
                        trigger: card,
                        start: 'top 55%',
                        end: 'bottom 55%',
                        onEnter: () => setActiveIndex(i),
                        onEnterBack: () => setActiveIndex(i),
                    });

                    // Stack depth effect: scale and fade previous cards as next arrives
                    if (i < cards.length - 1) {
                        gsap.to(card, {
                            scale: 0.94,
                            opacity: 0.5,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: cards[i + 1],
                                start: 'top 70%',
                                end: 'top 30%',
                                scrub: true,
                            },
                        });
                    }
                });
            });

            mm.add('(max-width: 767px)', () => {
                cards.forEach((card) => {
                    gsap.fromTo(
                        card,
                        { opacity: 0, y: 30 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.6,
                            scrollTrigger: {
                                trigger: card,
                                start: 'top 85%',
                            },
                        }
                    );
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="who"
            data-section-theme="who"
            ref={sectionRef}
            dir="rtl"
            className="relative w-full py-20 sm:py-32 px-4 max-w-7xl mx-auto text-right"
        >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start relative">
                {/* Left Sticky Column */}
                <div className="md:col-span-5 md:sticky md:top-36 flex flex-col items-start text-right gap-6">
                    <SectionTag>برای کیه؟</SectionTag>
                    <h2 className="text-[clamp(2.4rem,4.5vw,3.8rem)] font-extrabold text-foreground leading-tight">
                        این مدرسه برای چه کسی مناسبه؟
                    </h2>
                    <p className="text-muted text-base sm:text-lg leading-relaxed font-normal max-w-md">
                        مدرسه حرکت چارچوبی است برای کسانی که نمی‌خواهند در مرزهای یک تخصص محدود شوند.
                    </p>

                    {/* Step list indicator */}
                    <div className="hidden md:flex flex-col gap-3 mt-4 w-full max-w-xs">
                        {audienceList.map((item, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center justify-between px-5 py-3 rounded-2xl border transition-all duration-300 ${
                                    activeIndex === idx
                                        ? 'bg-primary/10 border-primary/40 text-primary font-bold shadow-sm'
                                        : 'bg-card/40 border-border/50 text-muted/70 font-medium'
                                }`}
                            >
                                <span className="text-sm font-semibold">{item.title}</span>
                                <span className="text-sm font-bold text-primary">{persianDigits[idx]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Scrolling Stacking Cards Column */}
                <div className="md:col-span-7 flex flex-col gap-8 sm:gap-12 relative pb-20">
                    {audienceList.map((item, index) => (
                        <div
                            key={index}
                            style={{ top: `${130 + index * 24}px` }}
                            className="audience-vertical-card md:sticky group relative bg-card/90 backdrop-blur-2xl border border-border/90 hover:border-primary/50 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/15 transition-colors duration-300 will-change-transform text-right"
                        >
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
                                <span className="text-3xl font-black text-primary select-none">
                                    {persianDigits[index]}
                                </span>
                            </div>

                            <h3 className="text-foreground text-2xl sm:text-3xl font-extrabold mb-4 group-hover:text-primary transition-colors">
                                {item.title}
                            </h3>

                            <p className="text-muted text-base sm:text-lg leading-relaxed font-normal">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
