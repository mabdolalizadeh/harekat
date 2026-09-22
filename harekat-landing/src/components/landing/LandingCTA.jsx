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
            ref={sectionRef}
            className="w-full py-16 sm:py-28 flex flex-col items-center gap-20 px-4"
        >
            {/* Primary Action CTA Card */}
            <div
                ref={ctaCardRef}
                className="relative w-full max-w-4xl bg-card/50 backdrop-blur-xl border border-border/80 dark:border-white/10 hover:border-primary/40 rounded-3xl p-8 sm:p-14 flex flex-col items-center gap-6 text-center shadow-2xl shadow-black/20 overflow-hidden"
            >
                {/* Ambient glow in background */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/15 rounded-full blur-3xl -z-10"
                />

                <SectionTag>تماس با ما</SectionTag>
                <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] font-extrabold text-foreground max-w-[700px] leading-tight">
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
                className="flex flex-col items-center gap-6 text-center max-w-2xl"
            >
                <SectionTag>ارتباط</SectionTag>
                <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-bold text-foreground leading-tight">
                    سوالی داری یا می‌خوای ثبت‌نام کنی؟
                </h2>
                <p className="text-text-muted text-[clamp(0.95rem,1.8vw,1.15rem)] leading-relaxed font-normal">
                    خوشحالیم درباره دوره‌ها، زمان‌بندی و تناسب با شرایطت صحبت کنیم
                </p>

                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mt-2 items-center justify-center">
                    <a
                        href="mailto:info@schoolharekat.ir"
                        className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card/50 backdrop-blur-md border border-border/80 text-foreground/80 hover:text-foreground transition-all duration-200 shadow-sm"
                    >
                        <Mail size={18} className="text-primary" />
                        <span className="text-sm font-medium">info@schoolharekat.ir</span>
                    </a>
                    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card/50 backdrop-blur-md border border-border/80 text-text-muted shadow-sm">
                        <MapPin size={18} className="text-primary" />
                        <span className="text-sm font-medium">تهران، ایران</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
