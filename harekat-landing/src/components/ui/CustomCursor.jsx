import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
    const cursorRef = useRef(null);
    const ringRef = useRef(null);

    const [isTouch, setIsTouch] = useState(true);
    // Only three custom faces: 'shop' (course/product) | 'scroll' | 'slider-left' | 'slider-right' | 'arrow'
    const [cursorType, setCursorType] = useState(null);
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

        // Snappy tracking: cursor container follows mouse instantaneously
        const xTo = gsap.quickTo(cursor, 'x', { duration: 0.05, ease: 'power3.out' });
        const yTo = gsap.quickTo(cursor, 'y', { duration: 0.05, ease: 'power3.out' });

        let currentType = null;
        let lastTarget = null;
        let sliderContainer = null;
        let sliderRect = null;

        const updateSliderRect = () => {
            if (sliderContainer) {
                sliderRect = sliderContainer.getBoundingClientRect();
            }
        };

        window.addEventListener('resize', updateSliderRect, { passive: true });
        window.addEventListener('scroll', updateSliderRect, { passive: true });

        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;

            if (!isVisible) setIsVisible(true);

            // Move the unified cursor container
            xTo(clientX);
            yTo(clientY);

            const target = e.target;
            if (!target) return;

            // 1. Check if hovering slider container (arrow mode)
            let isInsideSlider = false;
            let foundSlider = null;

            if (sliderContainer && sliderContainer.contains(target)) {
                isInsideSlider = true;
                foundSlider = sliderContainer;
            } else {
                foundSlider = target.closest('[data-cursor="slider"], [data-cursor="arrow"], .slideshow-drag-area, #hero .slideshow-container');
                if (foundSlider) {
                    sliderContainer = foundSlider;
                    sliderRect = foundSlider.getBoundingClientRect();
                    isInsideSlider = true;
                } else {
                    sliderContainer = null;
                    sliderRect = null;
                }
            }

            if (isInsideSlider && foundSlider) {
                // If hovering clickable controls inside the slider (like buttons or links), let native pointer take precedence
                if (target.closest('button, a, input, select, textarea, [role="button"]')) {
                    if (currentType !== null) {
                        currentType = null;
                        setCursorType(null);
                        document.documentElement.classList.remove('custom-cursor-active');
                    }
                    return;
                }

                if (!sliderRect) {
                    sliderRect = foundSlider.getBoundingClientRect();
                }

                const isLeft = (clientX - sliderRect.left) < (sliderRect.width / 2);
                const nextType = isLeft ? 'slider-left' : 'slider-right';
                if (nextType !== currentType) {
                    currentType = nextType;
                    setCursorType(nextType);
                    document.documentElement.classList.add('custom-cursor-active');
                }
                return;
            }

            // Outside slider: use target caching to avoid unnecessary DOM queries on identical target
            if (target === lastTarget) return;
            lastTarget = target;

            let nextType = null;

            // 2. Check if hovering course / shop card (shop mode)
            if (target.closest('[data-cursor="course"], [data-cursor="shop"], .landing-course-card, .capsule-card-item, .package-card-item, .subscription-card-item')) {
                nextType = 'shop';
            }
            // 3. Check if hovering "Who it is for" or "How it works" sections (scroll mode)
            else if (target.closest('[data-cursor="scroll"], #who, #how-it-works')) {
                // If hovering interactive elements inside scroll section, keep normal cursor
                if (target.closest('button, a, input, select, textarea, [role="button"]')) {
                    nextType = null;
                } else {
                    nextType = 'scroll';
                }
            }
            // 4. Check explicit arrow cursor
            else if (target.closest('[data-cursor="arrow"], [data-cursor="arrow-left"], [data-cursor="arrow-right"]')) {
                const arrowEl = target.closest('[data-cursor="arrow"], [data-cursor="arrow-left"], [data-cursor="arrow-right"]');
                const attr = arrowEl?.getAttribute('data-cursor');
                if (attr === 'arrow-left') nextType = 'slider-left';
                else if (attr === 'arrow-right') nextType = 'slider-right';
                else nextType = 'arrow';
            }

            if (nextType !== currentType) {
                currentType = nextType;
                setCursorType(nextType);
                if (nextType) {
                    document.documentElement.classList.add('custom-cursor-active');
                } else {
                    document.documentElement.classList.remove('custom-cursor-active');
                }
            }
        };

        const handleMouseDown = () => {
            setIsDragging(true);

            // Subtle snappy recoil on click
            gsap.to(ring, {
                scale: 0.9,
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
            currentType = null;
            setCursorType(null);
            document.documentElement.classList.remove('custom-cursor-active');
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
            window.removeEventListener('resize', updateSliderRect);
            window.removeEventListener('scroll', updateSliderRect);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [isTouch, isVisible]);

    if (isTouch) return null;

    const isShop = cursorType === 'shop' || cursorType === 'course';
    const isScroll = cursorType === 'scroll';
    const isSliderLeft = cursorType === 'slider-left';
    const isSliderRight = cursorType === 'slider-right';
    const isGenericArrow = cursorType === 'arrow';
    const isArrow = isSliderLeft || isSliderRight || isGenericArrow || cursorType === 'slider';
    const isSpecialFace = isShop || isScroll || isArrow;

    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none transition-opacity duration-200 ${
                isVisible && isSpecialFace ? 'opacity-100' : 'opacity-0'
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
                        borderColor: 'var(--current-section-color, var(--primary))',
                        backgroundColor: 'color-mix(in srgb, var(--current-section-color, var(--primary)) 20%, var(--background))',
                        boxShadow: '0 0 20px color-mix(in srgb, var(--current-section-color, var(--primary)) 25%, transparent), 0 4px 16px rgba(0,0,0,0.12)',
                        color: 'var(--current-section-color, var(--primary))',
                    }}
                    className={`absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border transition-[width,height,background-color,border-color,box-shadow,transform,opacity] duration-200 ease-out pointer-events-none ${
                        !isSpecialFace
                            ? 'w-0 h-0 opacity-0 scale-50'
                            : isScroll
                            ? 'w-13 h-13 opacity-100 scale-100'
                            : isShop
                            ? 'w-13 h-13 opacity-100 scale-105'
                            : isArrow
                            ? `w-14 h-14 opacity-100 ${isDragging ? 'scale-90 shadow-2xl' : 'scale-100'}`
                            : 'w-0 h-0 opacity-0 scale-50'
                    }`}
                >
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

                    {/* Shop / Course Mode SVG: Bespoke luxury shopping bag / action vector */}
                    {isShop && (
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

                    {/* Slider Left Mode SVG: Razor-sharp left arrow with directional drag hint animation */}
                    {isSliderLeft && (
                        <div className="flex items-center justify-center animate-fade-in">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={`animate-drag-hint-left transition-transform duration-200 ${isDragging ? 'scale-90' : ''}`}
                            >
                                <path
                                    d="M19 12H5"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M11 6L5 12L11 18"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    )}

                    {/* Slider Right Mode SVG: Razor-sharp right arrow with directional drag hint animation */}
                    {isSliderRight && !isSliderLeft && (
                        <div className="flex items-center justify-center animate-fade-in">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={`animate-drag-hint-right transition-transform duration-200 ${isDragging ? 'scale-90' : ''}`}
                            >
                                <path
                                    d="M5 12H19"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M13 6L19 12L13 18"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    )}

                    {/* Generic / Bidirectional Arrow Mode SVG */}
                    {isGenericArrow && !isSliderLeft && !isSliderRight && (
                        <div className="flex items-center justify-center animate-fade-in">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={`transition-transform duration-200 ${isDragging ? 'scale-90' : ''}`}
                            >
                                <path
                                    d="M8 7L3 12L8 17"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M16 7L21 12L16 17"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M3 12H21"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
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
