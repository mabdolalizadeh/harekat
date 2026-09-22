import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionTag from '../ui/SectionTag.jsx';
import { CourseCard } from '../contents/Cards.jsx';
import { CourseCardSkeleton } from '../ui/Skeleton.jsx';

function LevelBlock({ id, eyebrow, title, courses = [], loading }) {
    const blockRef = useRef(null);
    const gridRef = useRef(null);

    useEffect(() => {
        const grid = gridRef.current;
        if (!grid || loading || courses.length === 0) return;

        const cards = grid.querySelectorAll('.landing-course-card');
        if (!cards.length) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                cards,
                {
                    opacity: 0,
                    y: 35,
                    scale: 0.96,
                },
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
                        toggleActions: 'play none none none',
                    }
                }
            );
        }, blockRef);

        return () => ctx.revert();
    }, [loading, courses]);

    if (!loading && !courses.length) return null;

    return (
        <div id={id} ref={blockRef} className="w-full flex flex-col gap-5 pt-8 first:pt-0">
            {/* Header with level badge and title */}
            <div className="flex flex-col gap-1.5 border-r-2 border-primary/80 pr-4">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                    {eyebrow}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                    {title}
                </h3>
            </div>

            {/* Courses Grid */}
            <div
                ref={gridRef}
                className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            >
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <CourseCardSkeleton key={i} />
                    ))
                ) : (
                    courses.map((course, index) => (
                        <div
                            key={course.id || course.title || index}
                            className="landing-course-card will-change-transform"
                        >
                            <CourseCard {...course} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default function LandingCourses({
    baseCourses = [],
    beginnerCourses = [],
    advancedCourses = [],
    isLoading = false,
}) {
    const sectionRef = useRef(null);
    const headerRef = useRef(null);

    useEffect(() => {
        const header = headerRef.current;
        if (!header) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                header,
                { opacity: 0, y: 25 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: header,
                        start: 'top 80%',
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="courses"
            ref={sectionRef}
            className="w-full py-16 sm:py-28 flex flex-col gap-10 items-center px-4"
        >
            <div ref={headerRef} className="flex flex-col items-center gap-4 text-center">
                <SectionTag>دوره‌ها</SectionTag>
                <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] font-extrabold text-foreground max-w-[720px] leading-tight">
                    مسیر هنری خودت رو کشف کن
                </h2>
            </div>

            <div className="flex w-full flex-col gap-14 sm:gap-16">
                <LevelBlock
                    id="base-courses"
                    eyebrow="سطح پایه"
                    title="شروع از پایه"
                    courses={baseCourses}
                    loading={isLoading}
                />
                <LevelBlock
                    id="beginner-courses"
                    eyebrow="سطح مقدماتی"
                    title="ساختن مهارت‌های اصلی"
                    courses={beginnerCourses}
                    loading={isLoading}
                />
                <LevelBlock
                    id="advanced-courses"
                    eyebrow="سطح پیشرفته"
                    title="برای قدم‌های جدی‌تر"
                    courses={advancedCourses}
                    loading={isLoading}
                />
            </div>
        </section>
    );
}
