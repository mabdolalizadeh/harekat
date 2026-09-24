import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import TwinOrbit from './TwinOrbit';

export default function LandingLoader({ isReady, onComplete }) {
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const [shouldRender, setShouldRender] = useState(true);
    const mountTimeRef = useRef(Date.now());

    useEffect(() => {
        if (!isReady) return;

        const container = containerRef.current;
        if (!container) return;

        // Ensure minimum smooth display duration to prevent flickering on fast connections
        const elapsed = Date.now() - mountTimeRef.current;
        const remainingDelay = Math.max(0, 350 - elapsed);

        const timer = setTimeout(() => {
            gsap.to(container, {
                opacity: 0,
                duration: 0.5,
                ease: 'power2.inOut',
                onComplete: () => {
                    setShouldRender(false);
                    onComplete?.();
                },
            });
        }, remainingDelay);

        return () => clearTimeout(timer);
    }, [isReady, onComplete]);

    if (!shouldRender) return null;

    return (
        <div
            ref={containerRef}
            aria-hidden="true"
            className="fixed inset-0 z-[99998] flex flex-col items-center justify-center bg-background pointer-events-auto select-none transition-colors duration-300"
        >
            <div
                ref={contentRef}
                className="flex flex-col items-center justify-center gap-7 px-4"
            >
                {/* Center Twin Orbit container with subtle ambient glow */}
                <div className="relative flex items-center justify-center p-8">
                    <div className="absolute w-28 h-28 rounded-full bg-primary/15 blur-2xl pointer-events-none animate-pulse" />
                    <TwinOrbit
                        className="text-primary size-5 sm:size-6"
                        style={{ '--duration': '1.2s' }}
                    />
                </div>

                {/* Minimal brand typography */}
                <div className="flex flex-col items-center gap-1.5 text-center">
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground/90">
                        مدرسه حرکت
                    </h2>
                    <p className="text-xs font-medium text-muted/70 tracking-widest">
                        در حال بارگذاری...
                    </p>
                </div>
            </div>
        </div>
    );
}
