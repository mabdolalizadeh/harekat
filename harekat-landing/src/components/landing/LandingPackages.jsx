import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionTag from '../ui/SectionTag.jsx';
import { CourseCard } from '../contents/Cards.jsx';
import { CourseCardSkeleton } from '../ui/Skeleton.jsx';

export default function LandingPackages({
    id = 'skill-packages',
    skillPackages = [],
    isLoading = false,
}) {
    const sectionRef = useRef(null);
    const gridRef = useRef(null);

    useEffect(() => {
        const grid = gridRef.current;
        if (!grid || isLoading || skillPackages.length === 0) return;

        const cards = grid.querySelectorAll('.package-card-item');
        if (!cards.length) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                cards,
                { opacity: 0, y: 40, scale: 0.96 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.7,
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
    }, [isLoading, skillPackages]);

    if (!isLoading && skillPackages.length === 0) return null;

    return (
        <section
            id={id}
            data-section-theme="packages"
            ref={sectionRef}
            className="relative w-full py-14 sm:py-20 flex flex-col items-center gap-6 px-4"
        >
            {/* Subtle section ambient glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-primary/10 rounded-full blur-[100px] -z-10"
            />

            <div className="flex flex-col items-center gap-3 text-center">
                <SectionTag>پکیج‌های مهارتی</SectionTag>
                <h2 className="text-[clamp(1.9rem,3.8vw,3rem)] font-bold text-foreground">
                    مسیرهای کامل برای رشد
                </h2>
            </div>

            <div
                ref={gridRef}
                className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4"
            >
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <CourseCardSkeleton key={i} />
                    ))
                ) : (
                    skillPackages.map((course, idx) => (
                        <div key={course.id || course.title || idx} className="package-card-item will-change-transform">
                            <CourseCard {...course} kind="skill" productType="course" />
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
