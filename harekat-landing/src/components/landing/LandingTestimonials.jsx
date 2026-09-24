import { useEffect, useRef, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import gsap from 'gsap';
import SectionTag from '../ui/SectionTag.jsx';
import StudentReviewCard from '../contents/StudentReviewCard.jsx';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const defaultTestimonials = [
    { quote: 'این برنامه نحوه نگاه من به تصاویر رو کاملاً تغییر داد. دیگه فقط عکس نمی‌گیرم، کار تولید می‌کنم.', name: 'علی محمدی', role: 'عکاس' },
    { quote: 'قبل از مدرسه حرکت با حس کار می‌کردم. الان هر تصمیمم پشتوانه فکری داره.', name: 'مریم رضایی', role: 'طراح گرافیک' },
    { quote: 'اولین جایی بود که اجازه دادم آزمایش کنم. این آزادی خیلی ارزشمند بود.', name: 'سارا احمدی', role: 'نقاش' },
    { quote: 'جلسات نقد خیلی سخت ولی عالی بود. یاد گرفتم چطور تصمیماتم رو توضیح بدم.', name: 'رضا کریمی', role: 'هنرمند چندرسانه‌ای' },
    { quote: 'از طراحی گرافیک اومدم اینجا. فهمیدم طراحی فقط ویژوال نیست، فکر و روش هم هست.', name: 'محمد حسینی', role: 'طراح' },
    { quote: 'مدرسه حرکت فقط کار من رو بهتر نکرد، کل نگاهم به خلاقیت رو عوض کرد.', name: 'امیرحسین احمدی', role: 'عکاس' },
];

export default function LandingTestimonials({ testimonials = defaultTestimonials }) {
    const sectionRef = useRef(null);
    const autoplay = useRef(
        Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })
    );

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            direction: 'rtl',
            align: 'start',
            skipSnaps: false,
        },
        [autoplay.current]
    );

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState([]);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const scrollTo = useCallback(
        (index) => {
            if (emblaApi) emblaApi.scrollTo(index);
        },
        [emblaApi]
    );

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
            emblaApi.off('reInit', onSelect);
        };
    }, [emblaApi, onSelect]);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                section.querySelectorAll('.embla-slide-item'),
                { opacity: 0, y: 35, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%',
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="reviews"
            data-section-theme="reviews"
            ref={sectionRef}
            dir="rtl"
            className="relative w-full py-16 sm:py-28 flex flex-col items-center gap-8 px-4 overflow-x-clip"
        >
            <div className="flex flex-col items-center gap-4 text-center">
                <SectionTag>نظرات دانش‌آموزان</SectionTag>
                <h2 className="text-[clamp(1.9rem,4vw,3.4rem)] font-extrabold text-foreground max-w-[700px] leading-tight">
                    دانش‌آموزان ما چه می‌گن
                </h2>
            </div>

            {/* Embla Carousel Viewport with shadow bleed headroom */}
            <div className="w-full max-w-[1300px] relative px-2 sm:px-6">
                <div
                    className="overflow-hidden py-8 -my-8 px-3 -mx-3 cursor-grab active:cursor-grabbing select-none"
                    ref={emblaRef}
                >
                    <div className="flex -mr-6 touch-pan-y py-3">
                        {testimonials.map((item, index) => (
                            <div
                                key={index}
                                className="embla-slide-item flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pr-6 min-w-0 transition-transform duration-300"
                            >
                                <StudentReviewCard review={item.quote} name={item.name} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Arrows */}
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                        type="button"
                        onClick={scrollPrev}
                        aria-label="Previous review"
                        className="w-10 h-10 rounded-full border border-border/60 bg-card/60 backdrop-blur-md flex items-center justify-center text-foreground/80 hover:text-primary hover:border-primary/50 hover:bg-card transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>

                    {/* Pagination Dots */}
                    <div className="flex items-center gap-2">
                        {scrollSnaps.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => scrollTo(index)}
                                aria-label={`Go to slide ${index + 1}`}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    index === selectedIndex
                                        ? 'w-6 bg-primary'
                                        : 'w-2 bg-foreground/20 hover:bg-foreground/40'
                                }`}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={scrollNext}
                        aria-label="Next review"
                        className="w-10 h-10 rounded-full border border-border/60 bg-card/60 backdrop-blur-md flex items-center justify-center text-foreground/80 hover:text-primary hover:border-primary/50 hover:bg-card transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>
            </div>
        </section>
    );
}
