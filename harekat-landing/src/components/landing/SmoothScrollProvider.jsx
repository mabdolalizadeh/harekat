import { createContext, useContext, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext({ current: null });

export function useLenis() {
    const ref = useContext(LenisContext);
    return ref?.current || window.__lenis || null;
}

export default function SmoothScrollProvider({ children }) {
    const lenisRef = useRef(null);

    useEffect(() => {
        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            ScrollTrigger.refresh();
            return undefined;
        }

        const instance = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.95,
            touchMultiplier: 1.5,
            infinite: false
        });

        lenisRef.current = instance;
        window.__lenis = instance;

        // Synchronize Lenis scroll with GSAP ScrollTrigger
        const onLenisScroll = () => {
            ScrollTrigger.update();
        };
        instance.on('scroll', onLenisScroll);

        // Update Lenis in GSAP's RAF loop
        const tickerCallback = (time) => {
            instance.raf(time * 1000);
        };
        gsap.ticker.add(tickerCallback);
        gsap.ticker.lagSmoothing(500, 33);

        // Initial refresh
        ScrollTrigger.refresh();

        return () => {
            gsap.ticker.remove(tickerCallback);
            instance.off('scroll', onLenisScroll);
            instance.destroy();
            lenisRef.current = null;
            window.__lenis = null;
        };
    }, []);

    return (
        <LenisContext.Provider value={lenisRef}>
            {children}
        </LenisContext.Provider>
    );
}
