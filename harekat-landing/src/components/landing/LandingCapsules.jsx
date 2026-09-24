import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionTag from '../ui/SectionTag.jsx';
import { CourseCard } from '../contents/Cards.jsx';
import { CourseCardSkeleton } from '../ui/Skeleton.jsx';

export default function LandingCapsules({
    id = 'capsule-courses',
    capsuleCourses = [],
    isLoading = false,
}) {
    const sectionRef = useRef(null);
    const gridRef = useRef(null);

    useEffect(() => {
        const grid = gridRef.current;
        if (!grid || isLoading || capsuleCourses.length === 0) return;

        const cards = grid.querySelectorAll('.capsule-card-item');
        if (!cards.length) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                cards,
                { opacity: 0, y: 35, scale: 0.95 },
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
        }, sectionRef);

        return () => ctx.revert();
    }, [isLoading, capsuleCourses]);

    if (!isLoading && capsuleCourses.length === 0) return null;

    return (
        <section
            id={id}
            data-section-theme="capsules"
            ref={sectionRef}
            className="relative w-full py-14 sm:py-20 flex flex-col items-center gap-6 px-4"
        >
            <div className="flex flex-col items-center gap-3 text-center">
                <SectionTag>دوره‌های کپسولی</SectionTag>
                <h2 className="text-[clamp(1.9rem,3.8vw,3rem)] font-bold text-foreground">
                    یادگیری کوتاه و کاربردی
                </h2>
            </div>

            <div
                ref={gridRef}
                className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-4"
            >
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <CourseCardSkeleton key={i} />
                    ))
                ) : (
                    capsuleCourses.map((course, idx) => (
                        <div key={course.id || course.title || idx} className="capsule-card-item">
                            <CourseCard {...course} kind="capsule" />
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
