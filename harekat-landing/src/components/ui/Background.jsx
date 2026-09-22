import { useEffect, useRef } from "react";
import { cn } from "../../utils/cn.js";

/* ---- Palette (project tokens: brand-400, electric-400, violet-400) ---- */
const ORANGE   = [255, 163,  63];
const ELECTRIC = [ 76, 201, 255];
const VIOLET   = [164, 124, 255];

/* Keyframes narrative:
 *   0%   Orange   + Electric
 *   25%  Orange   + Electric
 *   50%  Electric + Violet
 *   75%  Violet   + Electric
 *   100% Violet   + Orange
 */
const STOPS_A = [
    [0.00, ORANGE],
    [0.25, ORANGE],
    [0.50, ELECTRIC],
    [0.75, VIOLET],
    [1.00, VIOLET],
];

const STOPS_B = [
    [0.00, ELECTRIC],
    [0.25, ELECTRIC],
    [0.50, VIOLET],
    [0.75, ELECTRIC],
    [1.00, ORANGE],
];

const lerp = (a, b, t) => a + (b - a) * t;

function sampleColor(stops, t) {
    if (t <= stops[0][0]) return stops[0][1];
    const last = stops[stops.length - 1];
    if (t >= last[0]) return last[1];
    for (let i = 0; i < stops.length - 1; i++) {
        const [t0, c0] = stops[i];
        const [t1, c1] = stops[i + 1];
        if (t >= t0 && t <= t1) {
            const k = (t - t0) / (t1 - t0);
            return [
                Math.round(lerp(c0[0], c1[0], k)),
                Math.round(lerp(c0[1], c1[1], k)),
                Math.round(lerp(c0[2], c1[2], k)),
            ];
        }
    }
    return last[1];
}

/* Multi-stop radial falloff instead of filter:blur — much cheaper on GPU. */
function gradient(c, peak) {
    const [r, g, b] = c;
    return (
        `radial-gradient(circle at center,` +
        `rgba(${r},${g},${b},${peak}) 0%,` +
        `rgba(${r},${g},${b},${(peak * 0.6).toFixed(3)}) 25%,` +
        `rgba(${r},${g},${b},${(peak * 0.25).toFixed(3)}) 50%,` +
        `rgba(${r},${g},${b},${(peak * 0.07).toFixed(3)}) 70%,` +
        `rgba(${r},${g},${b},0) 85%)`
    );
}

function isDarkTheme() {
    const el = document.documentElement;
    if (el.classList.contains("dark")) return true;
    if (el.classList.contains("light")) return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

import WindingPathBackground from "./WindingPathBackground.jsx";

export default function Background({ children, className }) {
    const glowARef = useRef(null);
    const glowBRef = useRef(null);

    useEffect(() => {
        const a = glowARef.current;
        const b = glowBRef.current;
        if (!a || !b) return;

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let ticking = false;
        let rafId = 0;
        let lastProgress = -1;

        const paint = (p) => {
            const dark = isDarkTheme();
            const cA = sampleColor(STOPS_A, p);
            const cB = sampleColor(STOPS_B, p);

            const opA = dark ? 0.26 : 0.22;
            const opB = dark ? 0.22 : 0.18;

            a.style.backgroundImage = gradient(cA, opA);
            b.style.backgroundImage = gradient(cB, opB);

            // Base: centered on the element (translate -50%). Drift on scroll.
            a.style.transform =
                `translate3d(calc(-50% + ${(p * 10).toFixed(2)}vw), calc(-50% + ${(p * 22).toFixed(2)}vh), 0)`;
            b.style.transform =
                `translate3d(calc(-50% - ${(p * 8).toFixed(2)}vw), calc(-50% + ${(p * 18).toFixed(2)}vh), 0)`;
        };

        const read = () => {
            ticking = false;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const raw = max > 0 ? window.scrollY / max : 0;
            const p = Math.min(1, Math.max(0, raw));
            if (Math.abs(p - lastProgress) < 0.0015) return;
            lastProgress = p;
            paint(p);
        };

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            rafId = requestAnimationFrame(read);
        };

        const onThemeChange = () => {
            lastProgress = -1;
            if (reducedMotion) paint(0.2);
            else read();
        };

        if (reducedMotion) {
            paint(0.2);
        } else {
            read();
            window.addEventListener("scroll", onScroll, { passive: true });
            window.addEventListener("resize", onScroll, { passive: true });
        }

        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        mq.addEventListener?.("change", onThemeChange);

        const mo = new MutationObserver(onThemeChange);
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            mq.removeEventListener?.("change", onThemeChange);
            mo.disconnect();
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <div className={cn("relative w-full min-h-screen", className)}>
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
            >
                <div ref={glowARef} className="ambient-glow ambient-glow-a" />
                <div ref={glowBRef} className="ambient-glow ambient-glow-b" />
                <WindingPathBackground />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen">
                {children}
            </div>
        </div>
    );
}