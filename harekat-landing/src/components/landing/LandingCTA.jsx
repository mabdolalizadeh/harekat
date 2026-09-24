import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, MapPin } from 'lucide-react';
import SectionTag from '../ui/SectionTag.jsx';
import { ArrowButton } from '../ui/Buttons.jsx';

export default function LandingCTA({ onContactClick }) {
    const sectionRef = useRef(null);
    const ctaCardRef = useRef(null);
    const contactBlockRef = useRef(null);

    useEffect(() => {
        const ctaCard = ctaCardRef.current;
        const contactBlock = contactBlockRef.current;
        if (!ctaCard || !contactBlock) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                ctaCard,
                { opacity: 0, y: 40, scale: 0.96 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: ctaCard,
                        start: 'top 85%',
                    }
                }
            );

            gsap.fromTo(
                contactBlock,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: contactBlock,
                        start: 'top 85%',
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="cta"
            data-section-theme="cta"
            ref={sectionRef}
            className="w-full py-16 sm:py-28 flex flex-col items-center gap-20 px-4"
        >
            {/* Primary Action CTA Card */}
            <div
                ref={ctaCardRef}
                className="relative w-full max-w-4xl bg-card border border-border/80 dark:border-white/10 hover:border-primary/40 rounded-3xl p-6 sm:p-14 flex flex-col items-center gap-6 text-center shadow-2xl shadow-black/20 overflow-hidden"
            >
                <SectionTag>تماس با ما</SectionTag>
                <h2 className="text-[clamp(1.85rem,4.2vw,3.4rem)] font-extrabold text-foreground max-w-[700px] leading-tight">
                    درباره دوره‌ها با ما صحبت کن
                </h2>
                <div className="mt-2">
                    <ArrowButton onClick={onContactClick} className="shadow-lg shadow-primary/25">
                        تماس با ما
                    </ArrowButton>
                </div>
            </div>

            {/* Contact Details & Info */}
            <div
                ref={contactBlockRef}
                className="flex flex-col items-center gap-6 text-center max-w-2xl px-2"
            >
                <SectionTag>ارتباط</SectionTag>
                <h2 className="text-[clamp(1.75rem,3.8vw,3rem)] font-bold text-foreground leading-tight">
                    سوالی داری یا می‌خوای ثبت‌نام کنی؟
                </h2>
                <p className="text-text-muted text-[clamp(0.95rem,1.8vw,1.15rem)] leading-relaxed font-normal">
                    خوشحالیم درباره دوره‌ها، زمان‌بندی و تناسب با شرایطت صحبت کنیم
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-2 items-center justify-center w-full max-w-md mx-auto">
                    <a
                        href="mailto:info@schoolharekat.ir"
                        className="flex items-center justify-center gap-3 px-4 sm:px-5 py-3 rounded-2xl bg-card/60 backdrop-blur-md border border-border/80 text-foreground/80 hover:text-foreground transition-all duration-200 shadow-sm w-full sm:w-auto"
                    >
                        <Mail size={18} className="text-primary shrink-0" />
                        <span className="text-xs sm:text-sm font-medium truncate">info@schoolharekat.ir</span>
                    </a>
                    <div className="flex items-center justify-center gap-3 px-4 sm:px-5 py-3 rounded-2xl bg-card/60 backdrop-blur-md border border-border/80 text-text-muted shadow-sm w-full sm:w-auto">
                        <MapPin size={18} className="text-primary shrink-0" />
                        <span className="text-xs sm:text-sm font-medium truncate">تهران، ایران</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
