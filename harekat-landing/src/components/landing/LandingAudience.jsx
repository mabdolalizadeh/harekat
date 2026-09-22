import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionTag from '../ui/SectionTag.jsx';

const audienceList = [
    { title: 'طراحان', desc: 'طراحانی که می‌خوان فراتر از ابزار فکر کنن و روش‌شناسی یاد بگیرن.' },
    { title: 'عکاسان', desc: 'عکاسانی که می‌خوان عکاسیشون فقط فنی نباشه، بلکه مفهومی و هنری باشه.' },
    { title: 'هنرمندان', desc: 'هنرمندانی که می‌خوان بین رسانه‌ها حرکت کنن و زبان بصری خودشون رو پیدا کنن.' },
    { title: 'خلاقان', desc: 'هر کسی که احساس می‌کنه خلاقیتش نیاز به ساختار و هدایت داره.' },
];

export default function LandingAudience() {
    const sectionRef = useRef(null);
    const gridRef = useRef(null);

    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;

        const cards = grid.querySelectorAll('.audience-card-item');

        const ctx = gsap.context(() => {
            gsap.fromTo(
                cards,
                { opacity: 0, y: 35, scale: 0.96 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.65,
                    stagger: 0.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: grid,
                        start: 'top 85%',
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="who"
            ref={sectionRef}
            className="w-full py-16 sm:py-28 flex flex-col items-center gap-6 px-4"
        >
            <div className="flex flex-col items-center gap-4 text-center">
                <SectionTag>برای کیه؟</SectionTag>
                <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] font-extrabold text-foreground max-w-[700px] leading-tight">
                    این مدرسه برای چه کسی مناسبه؟
                </h2>
            </div>

            <div
                ref={gridRef}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-5xl mt-6"
            >
                {audienceList.map((item, index) => (
                    <div
                        key={index}
                        className="audience-card-item group relative bg-card/80 backdrop-blur-md border border-border/80 hover:border-primary/50 rounded-3xl p-7 transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 will-change-transform"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-foreground text-xl font-bold group-hover:text-primary transition-colors">
                                {item.title}
                            </h3>
                            <span className="text-xs font-mono font-bold text-muted/60 px-2 py-0.5 rounded-full border border-border/60">
                                ۰{index + 1}
                            </span>
                        </div>
                        <p className="text-muted text-sm sm:text-base leading-relaxed font-normal">
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
