import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionTag from '../ui/SectionTag.jsx';

export default function LandingManifesto() {
    const sectionRef = useRef(null);
    const tagRef = useRef(null);
    const titleRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            // Section tag & Title reveal
            gsap.fromTo(
                tagRef.current,
                { opacity: 0, y: 15 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 80%',
                    }
                }
            );

            gsap.fromTo(
                titleRef.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 75%',
                    }
                }
            );

            // Desktop Word-by-word scroll scrub reveal
            mm.add('(min-width: 768px)', () => {
                const words = textRef.current?.querySelectorAll('.manifesto-word');
                if (words && words.length > 0) {
                    gsap.fromTo(
                        words,
                        { opacity: 0.25, y: 4 },
                        {
                            opacity: 1,
                            y: 0,
                            stagger: 0.03,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: textRef.current,
                                start: 'top 75%',
                                end: 'bottom 50%',
                                scrub: 0.6,
                            }
                        }
                    );
                }
            });

            // Mobile simpler reveal
            mm.add('(max-width: 767px)', () => {
                gsap.fromTo(
                    textRef.current,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.7,
                        scrollTrigger: {
                            trigger: textRef.current,
                            start: 'top 85%',
                        }
                    }
                );
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const manifestoBody =
        'در مدرسه حرکت، ما متخصص یک ابزار خاص تربیت نمی‌کنیم. ما هنرمندانی رو آماده می‌کنیم که آزادانه بین فرمت‌ها حرکت کنن. اونچه این حوزه‌ها رو به هم وصل می‌کنه تکنیک نیست، آگاهیه — توانایی دیدن، تفسیر کردن و انتخاب آگاهانه.';

    const words = manifestoBody.split(' ');

    return (
        <section
            id="manifesto"
            data-section-theme="manifesto"
            ref={sectionRef}
            className="relative w-full py-20 sm:py-32 flex flex-col items-center text-center px-4"
        >
            <div ref={tagRef} className="mb-6">
                <SectionTag>درباره ما</SectionTag>
            </div>

            <h2
                ref={titleRef}
                className="text-[clamp(2.2rem,4.8vw,4rem)] font-black text-foreground max-w-[760px] leading-[1.2] tracking-tight"
            >
                رسانه عوض می‌شه؛ هنرمند می‌مونه.
            </h2>

            <p
                ref={textRef}
                className="mt-8 text-muted max-w-[680px] text-[clamp(1.05rem,2vw,1.3rem)] leading-[2] font-normal"
            >
                {words.map((word, index) => (
                    <span
                        key={index}
                        className="manifesto-word inline-block transition-opacity duration-150 ml-1.5"
                    >
                        {word}
                    </span>
                ))}
            </p>
        </section>
    );
}
