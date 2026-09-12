import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../utils/cn.js';

export default function Slideshow({ slides = [], autoPlay = true, interval = 5000, className = '' }) {
    const [[current, direction], setCurrent] = useState([0, 0]);
    const isSingle = slides.length <= 1;
    const paginate = useCallback((step) => {
        if (isSingle) return;
        setCurrent(([previous]) => [(previous + step + slides.length) % slides.length, step]);
    }, [isSingle, slides.length]);

    useEffect(() => {
        if (!autoPlay || isSingle) return undefined;
        const timer = setTimeout(() => paginate(1), (Number(slides[current]?.duration) || interval / 1000) * 1000);
        return () => clearTimeout(timer);
    }, [autoPlay, current, interval, isSingle, paginate, slides]);

    if (!slides.length) return null;
    const slide = slides[current];
    const image = <picture className="block h-full w-full"><source media="(max-width: 639px)" srcSet={slide.mobileImage || slide.image} /><source media="(max-width: 1023px)" srcSet={slide.tabletImage || slide.image} /><img src={slide.image} alt={slide.alt || ''} className="h-full w-full object-contain bg-black/5" draggable={false} /></picture>;
    return <div className={cn('relative w-full overflow-hidden', className)}>
        <div className="relative h-full w-full">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div key={current} custom={direction} initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: direction > 0 ? '-100%' : '100%', opacity: 0 }} transition={{ x: { type: 'spring', stiffness: 200, damping: 30 }, opacity: { duration: 0.3 } }} className="absolute inset-0 h-full w-full">
                    {slide.link ? <a href={slide.link} className="block h-full w-full" aria-label="مشاهده بنر">{image}</a> : image}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/25" />
                </motion.div>
            </AnimatePresence>
        </div>
        {!isSingle && <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">{slides.map((_, index) => <button key={index} type="button" onClick={() => setCurrent(([previous]) => [index, index > previous ? 1 : -1])} aria-label={`اسلاید ${index + 1}`} className={cn('rounded-full transition-all duration-300', index === current ? 'h-2.5 w-7 bg-primary' : 'h-2.5 w-2.5 bg-white/50')} />)}</div>}
    </div>;
}
