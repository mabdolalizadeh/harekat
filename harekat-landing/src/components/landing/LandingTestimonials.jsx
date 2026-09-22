import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionTag from '../ui/SectionTag.jsx';
import StudentReviewCard from '../contents/StudentReviewCard.jsx';
import { MoveHorizontal } from 'lucide-react';

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
    const trackRef = useRef(null);
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);
    const [isGrabbing, setIsGrabbing] = useState(false);

    useEffect(() => {
        const section = sectionRef.current;
        const track = trackRef.current;
        if (!section || !track) return;

        const cards = track.querySelectorAll('.review-drag-card');

        const ctx = gsap.context(() => {
            // Entrance stagger
            gsap.fromTo(
                cards,
                { opacity: 0, y: 50, scale: 0.94 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.08,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%',
                    },
                }
            );

            // Proximity tilt effect on mouse move across cards
            const handleMouseMove = (e) => {
                if (isDraggingRef.current) return;
                const mouseX = e.clientX;
                const mouseY = e.clientY;

                cards.forEach((card) => {
                    const rect = card.getBoundingClientRect();
                    const cardCenterX = rect.left + rect.width / 2;
                    const cardCenterY = rect.top + rect.height / 2;

                    const distX = mouseX - cardCenterX;
                    const distY = mouseY - cardCenterY;
                    const distance = Math.hypot(distX, distY);

                    // Radius of influence: 350px
                    if (distance < 350) {
                        const intensity = 1 - distance / 350;
                        const tiltX = (distY / 350) * -12 * intensity;
                        const tiltY = (distX / 350) * 14 * intensity;

                        gsap.to(card, {
                            rotateX: tiltX,
                            rotateY: tiltY,
                            scale: 1 + 0.04 * intensity,
                            zIndex: 10,
                            duration: 0.35,
                            ease: 'power2.out',
                            overwrite: 'auto',
                        });
                    } else {
                        gsap.to(card, {
                            rotateX: 0,
                            rotateY: 0,
                            scale: 1,
                            zIndex: 1,
                            duration: 0.45,
                            ease: 'power2.out',
                            overwrite: 'auto',
                        });
                    }
                });
            };

            const handleMouseLeave = () => {
                cards.forEach((card) => {
                    gsap.to(card, {
                        rotateX: 0,
                        rotateY: 0,
                        scale: 1,
                        zIndex: 1,
                        duration: 0.5,
                        ease: 'power2.out',
                        overwrite: 'auto',
                    });
                });
            };

            track.addEventListener('mousemove', handleMouseMove);
            track.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                track.removeEventListener('mousemove', handleMouseMove);
                track.removeEventListener('mouseleave', handleMouseLeave);
            };
        }, sectionRef);

        return () => ctx.revert();
    }, [testimonials]);

    // Drag-to-scroll handlers
    const onMouseDown = (e) => {
        isDraggingRef.current = true;
        setIsGrabbing(true);
        startXRef.current = e.pageX - trackRef.current.offsetLeft;
        scrollLeftRef.current = trackRef.current.scrollLeft;
    };

    const onMouseUp = () => {
        isDraggingRef.current = false;
        setIsGrabbing(false);
    };

    const onMouseMove = (e) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();
        const x = e.pageX - trackRef.current.offsetLeft;
        const walk = (x - startXRef.current) * 1.5;
        trackRef.current.scrollLeft = scrollLeftRef.current - walk;
    };

    return (
        <section
            id="reviews"
            ref={sectionRef}
            className="w-full py-20 sm:py-32 flex flex-col items-center gap-8 px-4 overflow-hidden"
        >
            <div className="flex flex-col items-center gap-4 text-center">
                <SectionTag>نظرات دانش‌آموزان</SectionTag>
                <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] font-extrabold text-foreground max-w-[700px] leading-tight">
                    دانش‌آموزان ما چه می‌گن
                </h2>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-primary/80 font-medium">
                    <MoveHorizontal size={16} className="animate-pulse" />
                    <span>می‌تونی با درگ کردن نظرات رو مرور کنی</span>
                </div>
            </div>

            {/* Draggable interactive track with perspective */}
            <div
                ref={trackRef}
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseUp}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                className={`w-full max-w-[1400px] flex gap-6 overflow-x-auto py-8 px-4 no-scrollbar select-none cursor-grab ${
                    isGrabbing ? 'cursor-grabbing' : ''
                }`}
                style={{ perspective: '1200px' }}
            >
                {testimonials.map((item, index) => (
                    <div
                        key={index}
                        className="review-drag-card shrink-0 w-[300px] sm:w-[380px] will-change-transform transform-gpu"
                    >
                        <StudentReviewCard review={item.quote} name={item.name} />
                    </div>
                ))}
            </div>
        </section>
    );
}
