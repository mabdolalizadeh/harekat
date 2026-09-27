import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import TwinOrbit from './TwinOrbit.jsx';

function toPersianDigits(num) {
    const pDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(Math.round(num)).replace(/[0-9]/g, (w) => pDigits[+w]);
}

export default function LandingLoader({ isReady, onComplete }) {
    const containerRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('در حال آماده‌سازی محتوا...');
    const [shouldRender, setShouldRender] = useState(true);
    const isExitingRef = useRef(false);

    useEffect(() => {
        const startTime = Date.now();
        // Target minimum duration of 1800ms for smooth, intentional loading feel
        const MIN_DURATION = 1800;

        let frameId;
        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const timeProgress = Math.min(1, elapsed / MIN_DURATION);

            // If not yet ready from API, cap progress at 88%
            const maxAllowed = isReady ? 1 : 0.88;
            const target = timeProgress * maxAllowed;

            setProgress((prev) => {
                const next = prev + (target * 100 - prev) * 0.12;
                return Math.min(100, next);
            });

            if (timeProgress < 0.35) {
                setStatusText('در حال اتصال به سامانه حرکت...');
            } else if (timeProgress < 0.7) {
                setStatusText('در حال بارگذاری دوره‌ها و کپسول‌های آموزشی...');
            } else if (timeProgress < 0.95 || !isReady) {
                setStatusText('آماده‌سازی تجربه تعاملی...');
            } else {
                setStatusText('خوش آمدید...');
            }

            // Check if both time and API conditions are fully met
            if (isReady && elapsed >= MIN_DURATION && !isExitingRef.current) {
                setProgress(100);
                setStatusText('خوش آمدید...');
                isExitingRef.current = true;

                setTimeout(() => {
                    const container = containerRef.current;
                    if (!container) {
                        setShouldRender(false);
                        onComplete?.();
                        return;
                    }

                    gsap.to(container, {
                        opacity: 0,
                        scale: 1.02,
                        filter: 'blur(8px)',
                        duration: 0.65,
                        ease: 'power2.inOut',
                        onComplete: () => {
                            setShouldRender(false);
                            onComplete?.();
                        },
                    });
                }, 250);
                return;
            }

            if (!isExitingRef.current) {
                frameId = requestAnimationFrame(updateProgress);
            }
        };

        frameId = requestAnimationFrame(updateProgress);

        return () => {
            if (frameId) cancelAnimationFrame(frameId);
        };
    }, [isReady, onComplete]);

    if (!shouldRender) return null;

    const roundedProgress = Math.min(100, Math.max(0, Math.round(progress)));

    return (
        <div
            ref={containerRef}
            aria-hidden="true"
            className="fixed inset-0 z-[99998] flex flex-col items-center justify-center bg-background pointer-events-auto select-none transition-colors duration-300"
        >
            <div className="flex flex-col items-center justify-center gap-8 px-6 max-w-sm w-full text-center">
                {/* Center Twin Orbit container with subtle ambient glow */}
                <div className="relative flex items-center justify-center p-8">
                    <div className="absolute w-36 h-36 rounded-full bg-primary/20 blur-3xl pointer-events-none animate-pulse" />
                    <TwinOrbit
                        className="text-primary size-7 sm:size-8"
                        style={{ '--duration': '1.1s' }}
                    />
                </div>

                {/* Brand typography */}
                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        مدرسه حرکت
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-muted transition-all duration-300 h-5">
                        {statusText}
                    </p>
                </div>

                {/* Luxury Progress Bar & Percentage */}
                <div className="flex flex-col items-center gap-2.5 w-full max-w-[240px]">
                    <div className="relative w-full h-1.5 rounded-full bg-surface-muted overflow-hidden border border-border/40">
                        <div
                            className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-primary via-brand-400 to-amber-300 transition-[width] duration-150 ease-out shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]"
                            style={{ width: `${roundedProgress}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between w-full text-[11px] font-mono text-muted/80 px-0.5">
                        <span>آماده‌سازی</span>
                        <span className="font-bold text-foreground/90">
                            {toPersianDigits(roundedProgress)}٪
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
