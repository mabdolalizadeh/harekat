import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export default function Slideshow({
    slides = [],
    autoPlay = true,
    interval = 5000,
    className = '',
}) {
    const [[current, direction], setCurrent] = useState([0, 0]);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const isSingle = slides.length <= 1;

    const dragStartX = useRef(0);
    const dragCurrentX = useRef(0);
    const hasDraggedRef = useRef(false);
    const containerRef = useRef(null);

    const paginate = useCallback(
        (step) => {
            if (isSingle) return;
            setCurrent(([previous]) => [
                (previous + step + slides.length) % slides.length,
                step,
            ]);
        },
        [isSingle, slides.length]
    );

    // Autoplay management: pause while user is actively dragging
    useEffect(() => {
        if (!autoPlay || isSingle || isDragging) return undefined;
        const currentDuration =
            (Number(slides[current]?.duration) || interval / 1000) * 1000;
        const timer = setTimeout(() => paginate(1), currentDuration);
        return () => clearTimeout(timer);
    }, [autoPlay, current, interval, isSingle, isDragging, paginate, slides]);

    // Pointer / Touch Drag handlers for smooth dragging & swiping
    const handlePointerDown = (e) => {
        if (isSingle) return;
        dragStartX.current = e.clientX;
        dragCurrentX.current = e.clientX;
        hasDraggedRef.current = false;
        setIsDragging(true);
    };

    const handlePointerMove = (e) => {
        if (!isDragging || isSingle) return;
        dragCurrentX.current = e.clientX;
        const diff = e.clientX - dragStartX.current;
        if (Math.abs(diff) > 8) {
            hasDraggedRef.current = true;
        }
        // Elastic drag dampening
        setDragOffset(diff * 0.75);
    };

    const handlePointerUp = () => {
        if (!isDragging) return;
        setIsDragging(false);

        const diff = dragCurrentX.current - dragStartX.current;
        const threshold = 40;

        // In RTL layout:
        // Dragging left (negative diff) -> advances to next slide (paginate(1))
        // Dragging right (positive diff) -> returns to previous slide (paginate(-1))
        if (diff < -threshold) {
            paginate(1);
        } else if (diff > threshold) {
            paginate(-1);
        }

        setDragOffset(0);
    };

    const handlePointerCancel = () => {
        setIsDragging(false);
        setDragOffset(0);
    };

    if (!slides.length) return null;
    const slide = slides[current];

    const hasImage = Boolean(slide.image || slide.mobileImage || slide.tabletImage);

    const imageElement = hasImage ? (
        <picture className="block h-full w-full pointer-events-none select-none">
            {slide.mobileImage && (
                <source
                    media="(max-width: 639px)"
                    srcSet={slide.mobileImage}
                />
            )}
            {slide.tabletImage && (
                <source
                    media="(max-width: 1023px)"
                    srcSet={slide.tabletImage}
                />
            )}
            <img
                src={slide.image || slide.mobileImage || slide.tabletImage || null}
                alt={slide.alt || 'اسلاید بنر'}
                className="h-full w-full object-cover sm:object-contain bg-black/5"
                draggable={false}
            />
        </picture>
    ) : (
        <div className="h-full w-full bg-surface-muted/40 flex items-center justify-center text-muted" />
    );

    return (
        <div
            ref={containerRef}
            data-cursor="slider"
            data-slider-track="true"
            data-dragging={isDragging ? 'true' : 'false'}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            className={cn(
                'slideshow-drag-area group relative w-full overflow-hidden select-none touch-pan-y',
                isDragging ? 'cursor-grabbing' : 'cursor-grab',
                className
            )}
        >
            <div className="relative h-full w-full">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                        key={current}
                        custom={direction}
                        initial={{
                            x: direction > 0 ? '100%' : '-100%',
                            opacity: 0,
                        }}
                        animate={{
                            x: dragOffset,
                            opacity: 1,
                        }}
                        exit={{
                            x: direction > 0 ? '-100%' : '100%',
                            opacity: 0,
                        }}
                        transition={{
                            x: isDragging
                                ? { type: 'tween', duration: 0 }
                                : { type: 'spring', stiffness: 220, damping: 28 },
                            opacity: { duration: 0.28 },
                        }}
                        className="absolute inset-0 h-full w-full"
                    >
                        {slide.link ? (
                            <a
                                href={slide.link}
                                onClick={(e) => {
                                    if (hasDraggedRef.current) {
                                        e.preventDefault();
                                    }
                                }}
                                className="block h-full w-full cursor-pointer"
                                aria-label="مشاهده بنر"
                            >
                                {imageElement}
                            </a>
                        ) : (
                            imageElement
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/30" />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Desktop Navigation Arrows (shown on hover) */}
            {!isSingle && (
                <div className="hidden sm:flex pointer-events-none absolute inset-0 items-center justify-between px-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            paginate(-1);
                        }}
                        aria-label="اسلاید قبلی"
                        className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-background/70 backdrop-blur-md border border-border/60 text-foreground hover:bg-background hover:scale-105 active:scale-95 transition-all shadow-md"
                    >
                        <ChevronRight size={20} />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            paginate(1);
                        }}
                        aria-label="اسلاید بعدی"
                        className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-background/70 backdrop-blur-md border border-border/60 text-foreground hover:bg-background hover:scale-105 active:scale-95 transition-all shadow-md"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>
            )}

            {/* Pagination Dots */}
            {!isSingle && (
                <div className="absolute bottom-5 sm:bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrent(([previous]) => [
                                    index,
                                    index > previous ? 1 : -1,
                                ]);
                            }}
                            aria-label={`اسلاید ${index + 1}`}
                            className={cn(
                                'rounded-full transition-all duration-300 cursor-pointer',
                                index === current
                                    ? 'h-2 w-7 sm:h-2.5 sm:w-8 bg-primary shadow-sm shadow-primary/50'
                                    : 'h-2 w-2 sm:h-2.5 sm:w-2.5 bg-white/50 hover:bg-white/80'
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
