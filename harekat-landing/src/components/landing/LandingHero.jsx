import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, Sparkles } from 'lucide-react';
import Slideshow from '../ui/Slideshow.jsx';
import { HeroSlideshowSkeleton } from '../ui/Skeleton.jsx';
import MarqueeLayout from '../../layouts/MarqueeLayout.jsx';
import Img from '../ui/Img.jsx';
import { ArrowButton } from '../ui/Buttons.jsx';

export default function LandingHero({
    heroSlides = [],
    isLoading = false,
    heroTitle = 'اینجا فقط یاد',
    heroSubtitle = 'مدرسه حرکت جایی برای یادگیری و تجربه در مرز هنر، رسانه و فناوری است؛ از عکاسی و تدوین و طراحی تا برنامه‌نویسی، طراحی سایت و هوش مصنوعی.',
    images = [],
    onCtaClick,
}) {
    const heroRef = useRef(null);
    const bannerWrapperRef = useRef(null);
    const contentRef = useRef(null);
    const titleLine1Ref = useRef(null);
    const titleLine2Ref = useRef(null);
    const badgeRef = useRef(null);
    const subtitleRef = useRef(null);
    const ctaRef = useRef(null);
    const scrollIndicatorRef = useRef(null);
    const marqueeWrapperRef = useRef(null);

    useEffect(() => {
        const heroEl = heroRef.current;
        if (!heroEl) return;

        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            // Entrance Timeline
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            if (badgeRef.current) {
                tl.fromTo(
                    badgeRef.current,
                    { opacity: 0, y: 20, scale: 0.9 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.7 }
                );
            }

            if (titleLine1Ref.current && titleLine2Ref.current) {
                tl.fromTo(
                    [titleLine1Ref.current, titleLine2Ref.current],
                    { opacity: 0, y: 40, skewY: 2 },
                    { opacity: 1, y: 0, skewY: 0, duration: 0.8, stagger: 0.12 },
                    '-=0.4'
                );
            }

            if (subtitleRef.current) {
                tl.fromTo(
                    subtitleRef.current,
                    { opacity: 0, y: 24 },
                    { opacity: 1, y: 0, duration: 0.7 },
                    '-=0.4'
                );
            }

            if (ctaRef.current) {
                tl.fromTo(
                    ctaRef.current,
                    { opacity: 0, y: 20, scale: 0.95 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.6 },
                    '-=0.3'
                );
            }

            if (marqueeWrapperRef.current) {
                tl.fromTo(
                    marqueeWrapperRef.current,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.8 },
                    '-=0.4'
                );
            }

            // Desktop Scroll Parallax & Scrub Effects
            mm.add('(min-width: 768px)', () => {
                // Banner parallax on scroll
                if (bannerWrapperRef.current) {
                    gsap.to(bannerWrapperRef.current, {
                        y: 80,
                        scale: 0.96,
                        opacity: 0.85,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: heroEl,
                            start: 'top top',
                            end: 'bottom top',
                            scrub: true,
                        }
                    });
                }

                // Content parallax drift
                if (contentRef.current) {
                    gsap.to(contentRef.current, {
                        y: 40,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: heroEl,
                            start: 'top top',
                            end: 'bottom top',
                            scrub: 0.5,
                        }
                    });
                }

                // Scroll indicator fade out
                if (scrollIndicatorRef.current) {
                    gsap.to(scrollIndicatorRef.current, {
                        opacity: 0,
                        y: 20,
                        scrollTrigger: {
                            trigger: heroEl,
                            start: 'top+=50 top',
                            end: 'top+=250 top',
                            scrub: true,
                        }
                    });
                }
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="hero"
            ref={heroRef}
            className="relative w-full pt-20 sm:pt-24 pb-14 sm:pb-24 flex flex-col items-center"
        >
            {/* Top Banner Slideshow with Parallax frame */}
            <div
                ref={bannerWrapperRef}
                className="w-full will-change-transform transition-all"
            >
                {isLoading && heroSlides.length === 0 ? (
                    <HeroSlideshowSkeleton />
                ) : (
                    <div className="relative mx-auto max-w-[calc(100%-1.5rem)] sm:max-w-[calc(100%-2.5rem)] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/10 border border-border/50">
                        <Slideshow
                            slides={heroSlides}
                            autoPlay
                            interval={3200}
                            className="w-full aspect-[4/5] sm:aspect-[4/3] md:aspect-[16/9]"
                        />
                        {/* Subtle bottom edge gradient to blend */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/40 to-transparent" />
                    </div>
                )}
            </div>

            {/* Central Typography & CTA */}
            <div
                ref={contentRef}
                className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl text-center px-4 mt-16 sm:mt-24 md:mt-28"
            >
                {/* Floating Category Badge */}
                <div
                    ref={badgeRef}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-primary backdrop-blur-md shadow-sm mb-6"
                >
                    <Sparkles size={14} className="text-primary animate-pulse" />
                    <span>مدرسه هنر و مهارت</span>
                </div>

                {/* Primary Artistic Persian Headline */}
                <h1 className="text-[clamp(2.5rem,7.5vw,6rem)] font-extrabold leading-[1.08] tracking-tight text-foreground select-none">
                    <span ref={titleLine1Ref} className="inline-block">
                        {heroTitle}
                    </span>
                    <br />
                    <span
                        ref={titleLine2Ref}
                        className="inline-block bg-gradient-to-l from-primary via-brand-400 to-amber-300 bg-clip-text text-transparent"
                    >
                        نمی‌گیری؛
                    </span>
                </h1>

                {/* Subtitle with refined editorial typography */}
                <p
                    ref={subtitleRef}
                    className="mt-6 max-w-2xl text-muted text-[clamp(1rem,2vw,1.25rem)] leading-relaxed font-normal"
                >
                    {heroSubtitle}
                </p>

                {/* Action CTA Button */}
                <div ref={ctaRef} className="mt-8 sm:mt-10">
                    <ArrowButton
                        onClick={onCtaClick}
                        className="shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        بریم شروع کنیم!
                    </ArrowButton>
                </div>

                {/* Scroll Down Prompt Indicator */}
                <div
                    ref={scrollIndicatorRef}
                    className="mt-14 sm:mt-16 flex flex-col items-center gap-2 text-muted/80 cursor-pointer hover:text-foreground transition-colors"
                    onClick={onCtaClick}
                >
                    <span className="text-xs font-semibold tracking-wider">برای مشاهده اسکرول کنید</span>
                    <div className="w-5 h-9 rounded-full border border-border/80 flex items-start justify-center p-1">
                        <div className="w-1.5 h-2 rounded-full bg-primary animate-bounce mt-0.5" />
                    </div>
                </div>

                {/* Image Showcase Marquee (if images provided) */}
                {images && images.length > 0 && (
                    <div ref={marqueeWrapperRef} className="w-full overflow-hidden mt-12">
                        <MarqueeLayout>
                            {images.map((image, index) => (
                                <div className="overflow-hidden rounded-2xl mx-2 shadow-md border border-border/50" key={index}>
                                    <Img src={image} className="w-28 h-36 sm:w-40 sm:h-50 object-cover" groupHover={true} />
                                </div>
                            ))}
                        </MarqueeLayout>
                    </div>
                )}
            </div>
        </section>
    );
}
