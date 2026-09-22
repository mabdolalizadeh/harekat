import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionTag from '../ui/SectionTag.jsx';
import { SubscriptionCard } from '../contents/Cards.jsx';
import { SubscriptionCardSkeleton } from '../ui/Skeleton.jsx';

export default function LandingSubscriptions({
    id = 'subscriptions',
    apiSubscriptions = [],
    isLoading = false,
}) {
    const sectionRef = useRef(null);
    const gridRef = useRef(null);

    useEffect(() => {
        const grid = gridRef.current;
        if (!grid || isLoading || !apiSubscriptions || apiSubscriptions.length === 0) return;

        const cards = grid.querySelectorAll('.subscription-card-item');
        if (!cards.length) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                cards,
                { opacity: 0, y: 40, scale: 0.95 },
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
    }, [isLoading, apiSubscriptions]);

    if (!isLoading && (!apiSubscriptions || apiSubscriptions.length === 0)) return null;

    return (
        <section
            id={id}
            data-section-theme="subscriptions"
            ref={sectionRef}
            className="relative w-full py-14 sm:py-20 flex flex-col items-center gap-6 px-4"
        >
            <div className="flex flex-col items-center gap-3 text-center">
                <SectionTag>اشتراک‌ها</SectionTag>
                <h2 className="text-[clamp(1.9rem,3.8vw,3rem)] font-bold text-foreground">
                    عضویت در مسیر یادگیری
                </h2>
            </div>

            <div
                ref={gridRef}
                className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4"
            >
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <SubscriptionCardSkeleton key={i} />
                    ))
                ) : (
                    apiSubscriptions.map((item, idx) => (
                        <div key={item.id || idx} className="subscription-card-item will-change-transform">
                            <SubscriptionCard {...item} />
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
