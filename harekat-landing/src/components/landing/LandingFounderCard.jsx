import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote } from 'lucide-react';

export default function LandingFounderCard() {
    const cardWrapperRef = useRef(null);
    const cardInnerRef = useRef(null);

    useEffect(() => {
        const wrapper = cardWrapperRef.current;
        const inner = cardInnerRef.current;
        if (!wrapper || !inner) return;

        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            mm.add('(min-width: 768px)', () => {
                // Scroll-triggered entry without sudden slant or rotation
                gsap.fromTo(
                    inner,
                    {
                        opacity: 0,
                        y: 50,
                        scale: 0.96,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.9,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: wrapper,
                            start: 'top 80%',
                            end: 'bottom 40%',
                            toggleActions: 'play none none reverse',
                        }
                    }
                );

                // Gentle scroll scrub for smooth parallax
                gsap.to(inner, {
                    y: -20,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: wrapper,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 0.8,
                    }
                });
            });

            mm.add('(max-width: 767px)', () => {
                gsap.fromTo(
                    inner,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: wrapper,
                            start: 'top 85%',
                        }
                    }
                );
            });
        }, cardWrapperRef);

        return () => ctx.revert();
    }, []);

    // 3D Hover tilt interaction using gsap.quickTo and cached rect (zero layout thrashing)
    const xTo = useRef(null);
    const yTo = useRef(null);
    const rectRef = useRef(null);

    const handleMouseEnter = () => {
        const card = cardInnerRef.current;
        if (!card || window.innerWidth < 768) return;
        rectRef.current = card.getBoundingClientRect();
        if (!xTo.current) {
            xTo.current = gsap.quickTo(card, 'rotationY', { duration: 0.3, ease: 'power2.out' });
            yTo.current = gsap.quickTo(card, 'rotationX', { duration: 0.3, ease: 'power2.out' });
        }
    };

    const handleMouseMove = (e) => {
        if (!rectRef.current || !xTo.current || !yTo.current) return;
        const rect = rectRef.current;
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        xTo.current(x * 0.03);
        yTo.current(-y * 0.03);
    };

    const handleMouseLeave = () => {
        rectRef.current = null;
        if (xTo.current && yTo.current) {
            xTo.current(0);
            yTo.current(0);
        }
    };

    return (
        <section
            id="founder"
            data-section-theme="founder"
            ref={cardWrapperRef}
            className="w-full py-12 sm:py-16 flex justify-center px-4 perspective-[1200px]"
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div
                ref={cardInnerRef}
                className="relative bg-card/90 backdrop-blur-xl border border-border/80 hover:border-primary/40 rounded-3xl p-5 sm:p-10 max-w-[640px] w-full shadow-2xl shadow-black/10 transition-colors duration-300 will-change-transform"
            >
                <div className="relative flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                            <h3 className="text-foreground text-xl font-bold tracking-tight">
                                مدرسه حرکت
                            </h3>
                        </div>
                        <Quote className="text-primary/30 w-7 h-7" />
                    </div>

                    <p className="text-foreground/80 text-[clamp(1rem,1.8vw,1.15rem)] leading-[2] font-normal">
                        ما هنرمندها رو آماده می‌کنیم که آزادانه بین فرمت‌ها حرکت کنن. اونچه این حوزه‌ها رو به هم وصل می‌کنه نه تکنیک، بلکه آگاهیه — توانایی دیدن، تفسیر کردن و انتخاب آگاهانه.
                    </p>
                </div>
            </div>
        </section>
    );
}
