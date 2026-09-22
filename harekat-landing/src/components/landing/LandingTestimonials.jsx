import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionTag from '../ui/SectionTag.jsx';
import StudentReviewCard from '../contents/StudentReviewCard.jsx';

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
    const gridRef = useRef(null);
    const colMiddleRef = useRef(null);

    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;

        const cards = grid.querySelectorAll('.review-card-item');

        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            // Entrance reveal
            gsap.fromTo(
                cards,
                { opacity: 0, y: 40, scale: 0.96 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.65,
                    stagger: 0.08,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: grid,
                        start: 'top 85%',
                    }
                }
            );

            // Desktop parallax depth on the middle column
            mm.add('(min-width: 1024px)', () => {
                if (colMiddleRef.current) {
                    gsap.to(colMiddleRef.current, {
                        y: -30,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: grid,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 0.6,
                        }
                    });
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, [testimonials]);

    // Split 6 items into 3 columns for desktop
    const col1 = [testimonials[0], testimonials[3]].filter(Boolean);
    const col2 = [testimonials[1], testimonials[4]].filter(Boolean);
    const col3 = [testimonials[2], testimonials[5]].filter(Boolean);

    return (
        <section
            id="reviews"
            ref={sectionRef}
            className="w-full py-16 sm:py-28 flex flex-col items-center gap-10 px-4"
        >
            <div className="flex flex-col items-center gap-4 text-center">
                <SectionTag>نظرات دانش‌آموزان</SectionTag>
                <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] font-extrabold text-foreground max-w-[700px] leading-tight">
                    دانش‌آموزان ما چه می‌گن
                </h2>
            </div>

            {/* Desktop 3-column parallax layout */}
            <div
                ref={gridRef}
                className="hidden lg:grid grid-cols-3 gap-6 w-full max-w-6xl mt-4"
            >
                <div className="flex flex-col gap-6">
                    {col1.map((item, i) => (
                        <div key={i} className="review-card-item">
                            <StudentReviewCard review={item.quote} name={item.name} />
                        </div>
                    ))}
                </div>

                <div ref={colMiddleRef} className="flex flex-col gap-6 will-change-transform">
                    {col2.map((item, i) => (
                        <div key={i} className="review-card-item">
                            <StudentReviewCard review={item.quote} name={item.name} />
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-6">
                    {col3.map((item, i) => (
                        <div key={i} className="review-card-item">
                            <StudentReviewCard review={item.quote} name={item.name} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile / Tablet grid */}
            <div className="grid lg:hidden grid-cols-1 sm:grid-cols-2 gap-5 w-full mt-4">
                {testimonials.map((item, index) => (
                    <div key={index} className="review-card-item">
                        <StudentReviewCard review={item.quote} name={item.name} />
                    </div>
                ))}
            </div>
        </section>
    );
}
