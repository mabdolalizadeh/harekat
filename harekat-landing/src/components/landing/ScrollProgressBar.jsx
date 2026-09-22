import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ScrollProgressBar() {
    const barRef = useRef(null);

    useEffect(() => {
        const el = barRef.current;
        if (!el) return;

        const ctx = gsap.context(() => {
            gsap.to(el, {
                scaleX: 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: document.body,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 0.15,
                }
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <div
            aria-hidden="true"
            className="fixed top-0 left-0 right-0 z-[60] h-[3px] pointer-events-none overflow-hidden"
        >
            <div
                ref={barRef}
                className="h-full w-full bg-gradient-to-r from-brand-600 via-primary to-amber-400 origin-right transform scale-x-0 will-change-transform shadow-[0_0_8px_rgba(244,124,32,0.6)]"
            />
        </div>
    );
}
