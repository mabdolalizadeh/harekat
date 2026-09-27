import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
    const cursorRef = useRef(null);
    const ringRef = useRef(null);
    const dotRef = useRef(null);

    const [isTouch, setIsTouch] = useState(true);
    const [cursorType, setCursorType] = useState('default'); // 'default' | 'interactive' | 'scroll' | 'course' | 'slider'
    const [isDragging, setIsDragging] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Strict detection: ONLY enable if device supports hover and fine pointer (mouse)
        const checkPointer = () => {
            const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
            setIsTouch(!hasFinePointer);
        };

        checkPointer();

        const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
        const onMediaChange = (e) => {
            setIsTouch(!e.matches);
        };

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', onMediaChange);
        } else {
            mediaQuery.addListener(onMediaChange);
        }

        // Disable immediately if any touch occurs
        const onTouchStart = () => setIsTouch(true);
        window.addEventListener('touchstart', onTouchStart, { passive: true, once: true });

        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', onMediaChange);
            } else {
                mediaQuery.removeListener(onMediaChange);
            }
            window.removeEventListener('touchstart', onTouchStart);
        };
    }, []);

    useEffect(() => {
        if (isTouch) return;

        const cursor = cursorRef.current;
        const ring = ringRef.current;
        if (!cursor || !ring) return;

        // Hide default system cursor when inside page on fine-pointer devices
        document.documentElement.classList.add('custom-cursor-active');

        // Unified snappy tracking: Dot and Ring share the SAME container, guaranteeing identical instantaneous speed
        const xTo = gsap.quickTo(cursor, 'x', { duration: 0.05, ease: 'power3.out' });
        const yTo = gsap.quickTo(cursor, 'y', { duration: 0.05, ease: 'power3.out' });

        let currentType = 'default';
        let lastTarget = null;

        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;

            if (!isVisible) setIsVisible(true);

            // Move the unified cursor container (moves both dot & ring at the exact same instant speed)
            xTo(clientX);
            yTo(clientY);

            const target = e.target;
            if (!target) return;

            // Target caching to avoid unnecessary DOM queries on identical target
            if (target === lastTarget) return;
            lastTarget = target;

            let nextType = 'default';

            // 1. Check if hovering standard clickable / interactive elements first
            if (target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer, [data-cursor="pointer"]')) {
                nextType = 'interactive';
            }
            // 2. Check if hovering slideshow / carousel
            else if (target.closest('[data-cursor="slider"], .slideshow-drag-area, #hero .slideshow-container')) {
                nextType = 'slider';
            }
            // 3. Check if hovering course / capsule / package / subscription card
            else if (target.closest('[data-cursor="course"], .landing-course-card, .capsule-card-item, .package-card-item, .subscription-card-item')) {
                nextType = 'course';
            }
            // 4. Check if hovering "Who it is for" or "How it works" sections
            else if (target.closest('[data-cursor="scroll"], #who, #how-it-works')) {
                nextType = 'scroll';
            }

            if (nextType !== currentType) {
                currentType = nextType;
                setCursorType(nextType);
            }
        };

        const handleMouseDown = () => {
            setIsDragging(true);

            // Subtle snappy recoil on click
            gsap.to(ring, {
                scale: 0.88,
                duration: 0.12,
                ease: 'power2.out',
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);

            gsap.to(ring, {
                scale: 1,
                duration: 0.22,
                ease: 'back.out(2)',
            });
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        const handleMouseEnter = () => {
            setIsVisible(true);
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            document.documentElement.classList.remove('custom-cursor-active');
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [isTouch, isVisible]);

    if (isTouch) return null;

    const isDefault = cursorType === 'default';
    const isInteractive = cursorType === 'interactive';
    const isScroll = cursorType === 'scroll';
    const isCourse = cursorType === 'course';
    const isSlider = cursorType === 'slider';

    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none transition-opacity duration-200 ${
                isVisible ? 'opacity-100' : 'opacity-0'
            }`}
        >
            {/* Unified Cursor Container: Follows mouse at instant 120fps speed */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 pointer-events-none will-change-transform transform-gpu"
            >
                {/* Morphing Adaptive Outer Ring / Badge */}
                <div
                    ref={ringRef}
                    style={{
                        borderColor: isDefault
                            ? 'color-mix(in srgb, var(--current-section-color, var(--primary)) 45%, transparent)'
                            : 'var(--current-section-color, var(--primary))',
                        backgroundColor: isDefault
                            ? 'transparent'
                            : isInteractive
                            ? 'color-mix(in srgb, var(--current-section-color, var(--primary)) 16%, transparent)'
                            : 'color-mix(in srgb, var(--current-section-color, var(--primary)) 20%, var(--background))',
                        boxShadow: isDefault
                            ? 'none'
                            : isInteractive
                            ? '0 0 14px color-mix(in srgb, var(--current-section-color, var(--primary)) 25%, transparent)'
                            : '0 0 20px color-mix(in srgb, var(--current-section-color, var(--primary)) 25%, transparent), 0 4px 16px rgba(0,0,0,0.12)',
                        color: 'var(--current-section-color, var(--primary))',
                    }}
                    className={`absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border transition-[width,height,background-color,border-color,box-shadow] duration-200 ease-out pointer-events-none ${
                        isDefault
                            ? 'w-7 h-7'
                            : isInteractive
                            ? 'w-9 h-9'
                            : isScroll
                            ? 'w-13 h-13'
                            : isCourse
                            ? 'w-13 h-13 scale-105'
                            : isSlider
                            ? `w-11 h-11 ${isDragging ? 'scale-85' : 'scale-100'}`
                            : 'w-7 h-7'
                    }`}
                >
                    {/* Mode-specific High-Quality SVG Icons (No text, pure crisp vector geometry) */}

                    {/* Scroll Mode SVG: Minimal, luxury mouse scroll pill with animated indicator */}
                    {isScroll && (
                        <div className="flex items-center justify-center animate-fade-in">
                            <svg
                                width="20"
                                height="28"
                                viewBox="0 0 20 28"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="transition-transform duration-300"
                            >
                                <rect
                                    x="1.25"
                                    y="1.25"
                                    width="17.5"
                                    height="25.5"
                                    rx="8.75"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                />
                                <circle
                                    cx="10"
                                    cy="10.5"
                                    r="1.75"
                                    fill="currentColor"
                                    className="animate-mouse-wheel"
                                />
                            </svg>
                        </div>
                    )}

                    {/* Course Mode SVG: Bespoke luxury shopping bag / action vector */}
                    {isCourse && (
                        <div className="flex items-center justify-center animate-scale-in">
                            <svg
                                width="22"
                                height="24"
                                viewBox="0 0 22 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="transition-transform duration-300 scale-105"
                            >
                                <path
                                    d="M6 7.5V5.5C6 3.01472 8.01472 1 10.5 1H11.5C13.9853 1 16 3.01472 16 5.5V7.5"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <rect
                                    x="2"
                                    y="7.5"
                                    width="18"
                                    height="15"
                                    rx="3.5"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M8.5 11.5C8.5 12.8807 9.61929 14 11 14C12.3807 14 13.5 12.8807 13.5 11.5"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
