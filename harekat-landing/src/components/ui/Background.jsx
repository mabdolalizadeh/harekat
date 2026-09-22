import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "../../utils/cn.js";

/* Section-specific solid color themes (Light mode & Dark mode) */
const SECTIONS_CONFIG = [
    {
        key: 'hero',
        selector: '#hero',
        fallbackSelectors: ['[data-section-theme="hero"]'],
        bgLight: '#fff5ea',   // Warm Creative Peach Cream
        bgDark: '#180e06',    // Deep Warm Copper
        accentLight: '#f47c20',
        accentDark: '#ffa33f',
    },
    {
        key: 'manifesto',
        selector: '#manifesto',
        fallbackSelectors: ['[data-section-theme="manifesto"]'],
        bgLight: '#f6f0ff',   // Soft Visionary Lavender
        bgDark: '#140924',    // Deep Night Plum
        accentLight: '#7c3aed',
        accentDark: '#a855f7',
    },
    {
        key: 'founder',
        selector: '#founder',
        fallbackSelectors: ['[data-section-theme="founder"]'],
        bgLight: '#fef7ea',   // Warm Honey Amber Cream
        bgDark: '#191006',    // Deep Toasted Bronze
        accentLight: '#d97706',
        accentDark: '#fbbf24',
    },
    {
        key: 'courses',
        selector: '#courses',
        fallbackSelectors: ['[data-section-theme="courses"]'],
        bgLight: '#ecf7fd',   // Crisp Morning Sky Azure
        bgDark: '#071526',    // Deep Oceanic Midnight Navy
        accentLight: '#0284c7',
        accentDark: '#38bdf8',
    },
    {
        key: 'capsules',
        selector: '#capsule-courses',
        fallbackSelectors: ['#capsules', '[data-section-theme="capsules"]'],
        bgLight: '#edf9f6',   // Fresh Mint Dew / Mineral Aqua
        bgDark: '#051816',    // Deep Dark Emerald Teal
        accentLight: '#0d9488',
        accentDark: '#2dd4bf',
    },
    {
        key: 'packages',
        selector: '#skill-packages',
        fallbackSelectors: ['#packages', '[data-section-theme="packages"]'],
        bgLight: '#fdf2f9',   // Blossom Orchid Pink
        bgDark: '#1c081a',    // Deep Velvet Wine
        accentLight: '#c026d3',
        accentDark: '#f472b6',
    },
    {
        key: 'subscriptions',
        selector: '#subscriptions',
        fallbackSelectors: ['[data-section-theme="subscriptions"]'],
        bgLight: '#fefce8',   // Warm Sunny Buttercream
        bgDark: '#191504',    // Deep Dark Amber Olive
        accentLight: '#ca8a04',
        accentDark: '#facc15',
    },
    {
        key: 'mentors',
        selector: '#mentors',
        fallbackSelectors: ['[data-section-theme="mentors"]'],
        bgLight: '#f0f2fe',   // Academic Royal Periwinkle
        bgDark: '#0c0d28',    // Deep Royal Midnight Indigo
        accentLight: '#4f46e5',
        accentDark: '#818cf8',
    },
    {
        key: 'who',
        selector: '#who',
        fallbackSelectors: ['[data-section-theme="who"]'],
        bgLight: '#fff1f2',   // Coral Rose Petal
        bgDark: '#1b070f',    // Deep Crimson Merlot
        accentLight: '#e11d48',
        accentDark: '#fb7185',
    },
    {
        key: 'how-it-works',
        selector: '#how-it-works',
        fallbackSelectors: ['[data-section-theme="how-it-works"]'],
        bgLight: '#ecfdf5',   // Vibrant Spring Mint Green
        bgDark: '#051810',    // Deep Forest Jade
        accentLight: '#059669',
        accentDark: '#34d399',
    },
    {
        key: 'reviews',
        selector: '#reviews',
        fallbackSelectors: ['[data-section-theme="reviews"]'],
        bgLight: '#fff7ed',   // Sunset Tangerine Tint
        bgDark: '#1a0c06',    // Deep Terracotta Flame
        accentLight: '#ea580c',
        accentDark: '#fb923c',
    },
    {
        key: 'faq',
        selector: '#faq',
        fallbackSelectors: ['[data-section-theme="faq"]'],
        bgLight: '#f0f6fb',   // Intellectual Slate Breeze
        bgDark: '#071524',    // Deep Celestial Steel
        accentLight: '#0284c7',
        accentDark: '#38bdf8',
    },
    {
        key: 'cta',
        selector: '#cta',
        fallbackSelectors: ['[data-section-theme="cta"]'],
        bgLight: '#fef2f2',   // Warm Radiant Sunset Blush
        bgDark: '#1a0505',    // Deep Flame Glow
        accentLight: '#dc2626',
        accentDark: '#f87171',
    },
];

function isDarkTheme() {
    const el = document.documentElement;
    if (el.classList.contains("dark")) return true;
    if (el.classList.contains("light")) return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function Background({ children, className }) {
    const bgRef = useRef(null);
    const containerRef = useRef(null);
    const activeSectionKeyRef = useRef('hero');

    useEffect(() => {
        const bgEl = bgRef.current;
        if (!bgEl) return;

        let ctx = null;

        const buildScrollTransitions = () => {
            if (ctx) ctx.revert();

            ctx = gsap.context(() => {
                const dark = isDarkTheme();

                // Find valid DOM elements for each defined section
                const activeSections = [];
                SECTIONS_CONFIG.forEach((sec) => {
                    let el = document.querySelector(sec.selector);
                    if (!el && sec.fallbackSelectors) {
                        for (const fb of sec.fallbackSelectors) {
                            el = document.querySelector(fb);
                            if (el) break;
                        }
                    }
                    if (el) {
                        activeSections.push({ ...sec, el });
                    }
                });

                if (!activeSections.length) {
                    // No sections found (non-landing pages): use CSS variable
                    const fallbackBg = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
                    const bg = fallbackBg ? fallbackBg : (dark ? '#10100f' : '#f7f5f0');
                    gsap.set(bgEl, { backgroundColor: bg });
                    document.documentElement.style.backgroundColor = bg;
                    document.body.style.backgroundColor = bg;
                    return;
                }

                // Sync initial background and accent
                const currentActiveSec = activeSections.find((s) => s.key === activeSectionKeyRef.current) || activeSections[0];
                const currentBg = dark ? currentActiveSec.bgDark : currentActiveSec.bgLight;
                const currentAccent = dark ? currentActiveSec.accentDark : currentActiveSec.accentLight;

                gsap.set(bgEl, { backgroundColor: currentBg });
                document.documentElement.style.backgroundColor = currentBg;
                document.body.style.backgroundColor = currentBg;
                document.documentElement.style.setProperty('--current-section-color', currentAccent);
                document.documentElement.setAttribute('data-active-section', currentActiveSec.key);

                // Build smooth scrubbed pairwise color transitions between adjacent sections
                for (let i = 0; i < activeSections.length - 1; i++) {
                    const curSec = activeSections[i];
                    const nextSec = activeSections[i + 1];

                    const curBg = dark ? curSec.bgDark : curSec.bgLight;
                    const nextBg = dark ? nextSec.bgDark : nextSec.bgLight;
                    const nextAccent = dark ? nextSec.accentDark : nextSec.accentLight;
                    const curAccent = dark ? curSec.accentDark : curSec.accentLight;

                    gsap.fromTo(
                        bgEl,
                        { backgroundColor: curBg },
                        {
                            backgroundColor: nextBg,
                            ease: "none",
                            immediateRender: false,
                            scrollTrigger: {
                                trigger: nextSec.el,
                                start: "top 85%",
                                end: "top 25%",
                                scrub: 0.5,
                                onUpdate: (self) => {
                                    // When progress is mostly into next section, update theme variables
                                    if (self.progress > 0.5) {
                                        activeSectionKeyRef.current = nextSec.key;
                                        document.documentElement.style.setProperty('--current-section-color', nextAccent);
                                        document.documentElement.setAttribute('data-active-section', nextSec.key);
                                    } else {
                                        activeSectionKeyRef.current = curSec.key;
                                        document.documentElement.style.setProperty('--current-section-color', curAccent);
                                        document.documentElement.setAttribute('data-active-section', curSec.key);
                                    }

                                    // Keep html & body in sync for seamless mobile overscroll
                                    if (bgEl.style.backgroundColor) {
                                        document.documentElement.style.backgroundColor = bgEl.style.backgroundColor;
                                        document.body.style.backgroundColor = bgEl.style.backgroundColor;
                                    }
                                },
                            }
                        }
                    );
                }
            }, containerRef);
        };

        buildScrollTransitions();

        const onThemeChange = () => {
            buildScrollTransitions();
        };

        const mo = new MutationObserver(onThemeChange);
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

        return () => {
            if (ctx) ctx.revert();
            mo.disconnect();
        };
    }, []);

    return (
        <div ref={containerRef} className={cn("relative w-full min-h-screen", className)}>
            {/* Full-screen solid background layer that smoothly morphs across sections */}
            <div
                ref={bgRef}
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-0 will-change-[background-color]"
                style={{
                    backgroundColor: isDarkTheme() ? SECTIONS_CONFIG[0].bgDark : SECTIONS_CONFIG[0].bgLight
                }}
            />

            <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen">
                {children}
            </div>
        </div>
    );
}