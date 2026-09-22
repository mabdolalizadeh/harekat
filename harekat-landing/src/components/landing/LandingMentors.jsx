import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionTag from '../ui/SectionTag.jsx';
import TeacherCard from '../contents/TeacherCard.jsx';
import { PrimaryButton } from '../ui/Buttons.jsx';

export default function LandingMentors({
    displayTeachers = [],
    isLoading = false,
    onJoinClick,
}) {
    const sectionRef = useRef(null);
    const headerRef = useRef(null);
    const gridRef = useRef(null);

    useEffect(() => {
        const grid = gridRef.current;
        if (!grid || isLoading || displayTeachers.length === 0) return;

        const cards = grid.querySelectorAll('.mentor-card-item');
        if (!cards.length) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                cards,
                { opacity: 0, y: 35, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.07,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: grid,
                        start: 'top 85%',
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, [isLoading, displayTeachers]);

    if (!isLoading && displayTeachers.length === 0) return null;

    return (
        <section
            id="mentors"
            data-section-theme="mentors"
            ref={sectionRef}
            className="relative w-full py-16 sm:py-28 flex flex-col items-center gap-6 px-4"
        >
            {/* Subtle section ambient glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-primary/10 rounded-full blur-[110px] -z-10"
            />

            <div ref={headerRef} className="flex flex-col items-center gap-4 text-center">
                <SectionTag>اساتید</SectionTag>
                <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] font-extrabold text-foreground max-w-[700px] leading-tight">
                    از هنرمندان فعال یاد بگیر
                </h2>
                <p className="text-muted max-w-[600px] text-[clamp(0.95rem,1.8vw,1.15rem)] leading-relaxed">
                    اساتیدی با تجربه‌های متفاوت، با روش، توجه و بلندمدت‌اندیشی مشترک
                </p>
                <div className="mt-2">
                    <PrimaryButton onClick={onJoinClick}>
                        به عنوان استاد بپیوندید
                    </PrimaryButton>
                </div>
            </div>

            <div
                ref={gridRef}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 w-full mt-6"
            >
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-4 animate-pulse">
                            <div className="w-full aspect-square rounded-2xl bg-surface-muted/60 border border-border" />
                            <div className="h-4 w-24 rounded bg-surface-muted/80" />
                            <div className="h-3 w-16 rounded bg-surface-muted/60" />
                        </div>
                    ))
                ) : (
                    displayTeachers.map((teacher, index) => (
                        <div
                            key={teacher.id || index}
                            className="mentor-card-item will-change-transform"
                        >
                            <TeacherCard
                                name={teacher.name}
                                role={teacher.role}
                                avatar={teacher.avatar}
                                onClick={() => teacher.id && (window.location.href = `/teachers/${teacher.id}`)}
                                className={teacher.id ? 'cursor-pointer hover:-translate-y-1 transition-transform duration-300' : ''}
                            />
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
