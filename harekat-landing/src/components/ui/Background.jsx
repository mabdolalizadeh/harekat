import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "../../utils/cn.js";
import WindingPathBackground from "./WindingPathBackground.jsx";

/* Section-specific color themes (Light mode & Dark mode palettes) */
const SECTION_PALETTES = {
    hero: {
        glowA: [255, 140, 40],   // Warm creative orange
        glowB: [76, 201, 255],   // Electric blue
        bgTintLight: "rgba(255, 245, 235, 0.45)",
        bgTintDark: "rgba(25, 16, 8, 0.35)",
        accentLight: "#f47c20",
        accentDark: "#ffa33f",
    },
    manifesto: {
        glowA: [168, 85, 247],  // Purple / Violet
        glowB: [244, 114, 182],  // Soft magenta rose
        bgTintLight: "rgba(250, 243, 255, 0.4)",
        bgTintDark: "rgba(22, 10, 32, 0.35)",
        accentLight: "#7c3aed",
        accentDark: "#a855f7",
    },
    founder: {
        glowA: [245, 158, 11],   // Amber
        glowB: [249, 115, 22],   // Tangerine
        bgTintLight: "rgba(255, 248, 238, 0.4)",
        bgTintDark: "rgba(26, 17, 7, 0.35)",
        accentLight: "#d97706",
        accentDark: "#fbbf24",
    },
    courses: {
        glowA: [14, 165, 233],   // Sky cyan
        glowB: [99, 102, 241],   // Indigo
        bgTintLight: "rgba(240, 249, 255, 0.45)",
        bgTintDark: "rgba(8, 20, 34, 0.35)",
        accentLight: "#0284c7",
        accentDark: "#38bdf8",
    },
    capsules: {
        glowA: [20, 184, 166],   // Teal / Emerald
        glowB: [56, 189, 248],   // Cyan
        bgTintLight: "rgba(240, 253, 250, 0.4)",
        bgTintDark: "rgba(6, 24, 22, 0.35)",
        accentLight: "#0d9488",
        accentDark: "#2dd4bf",
    },
    packages: {
        glowA: [139, 92, 246],   // Violet
        glowB: [236, 72, 153],   // Pink
        bgTintLight: "rgba(253, 242, 248, 0.4)",
        bgTintDark: "rgba(28, 8, 24, 0.35)",
        accentLight: "#c026d3",
        accentDark: "#f472b6",
    },
    subscriptions: {
        glowA: [234, 179, 8],    // Gold / Sunflower
        glowB: [249, 115, 22],   // Warm orange
        bgTintLight: "rgba(254, 252, 232, 0.4)",
        bgTintDark: "rgba(28, 22, 6, 0.35)",
        accentLight: "#ca8a04",
        accentDark: "#facc15",
    },
    mentors: {
        glowA: [99, 102, 241],   // Indigo
        glowB: [168, 85, 247],   // Purple
        bgTintLight: "rgba(238, 242, 255, 0.4)",
        bgTintDark: "rgba(12, 14, 34, 0.35)",
        accentLight: "#4f46e5",
        accentDark: "#818cf8",
    },
    who: {
        glowA: [244, 63, 94],    // Rose / Coral
        glowB: [249, 115, 22],   // Orange
        bgTintLight: "rgba(255, 241, 242, 0.4)",
        bgTintDark: "rgba(28, 8, 12, 0.35)",
        accentLight: "#e11d48",
        accentDark: "#fb7185",
    },
    "how-it-works": {
        glowA: [16, 185, 129],   // Emerald green
        glowB: [6, 182, 212],    // Cyan
        bgTintLight: "rgba(236, 253, 245, 0.4)",
        bgTintDark: "rgba(4, 26, 18, 0.35)",
        accentLight: "#059669",
        accentDark: "#34d399",
    },
    reviews: {
        glowA: [249, 115, 22],   // Harekat brand orange
        glowB: [236, 72, 153],   // Fuchsia
        bgTintLight: "rgba(255, 247, 237, 0.45)",
        bgTintDark: "rgba(28, 14, 6, 0.35)",
        accentLight: "#ea580c",
        accentDark: "#fb923c",
    },
    faq: {
        glowA: [100, 116, 139],  // Slate blue
        glowB: [148, 163, 184],  // Muted steel
        bgTintLight: "rgba(248, 250, 252, 0.4)",
        bgTintDark: "rgba(15, 23, 42, 0.35)",
        accentLight: "#0284c7",
        accentDark: "#38bdf8",
    },
    cta: {
        glowA: [255, 124, 32],   // Primary brand fire
        glowB: [251, 191, 36],   // Amber spark
        bgTintLight: "rgba(255, 247, 237, 0.5)",
        bgTintDark: "rgba(30, 14, 5, 0.4)",
        accentLight: "#dc2626",
        accentDark: "#f87171",
    },
};

function isDarkTheme() {
    const el = document.documentElement;
    if (el.classList.contains("dark")) return true;
    if (el.classList.contains("light")) return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function radialGradient(c, peak) {
    const [r, g, b] = c;
    return (
        `radial-gradient(circle at center, ` +
        `rgba(${r},${g},${b},${peak}) 0%, ` +
        `rgba(${r},${g},${b},${(peak * 0.6).toFixed(3)}) 25%, ` +
        `rgba(${r},${g},${b},${(peak * 0.25).toFixed(3)}) 50%, ` +
        `rgba(${r},${g},${b},${(peak * 0.07).toFixed(3)}) 70%, ` +
        `rgba(${r},${g},${b},0) 85%)`
    );
}

const SECTION_SELECTORS = {
    hero: ['#hero', '[data-section-theme="hero"]'],
    manifesto: ['#manifesto', '[data-section-theme="manifesto"]', 'section:has(.manifesto-word)'],
    founder: ['#founder', '[data-section-theme="founder"]', 'section:has(.quote)'],
    courses: ['#courses', '[data-section-theme="courses"]'],
    capsules: ['#capsule-courses', '#capsules', '[data-section-theme="capsules"]'],
    packages: ['#skill-packages', '#packages', '[data-section-theme="packages"]'],
    subscriptions: ['#subscriptions', '[data-section-theme="subscriptions"]'],
    mentors: ['#mentors', '[data-section-theme="mentors"]'],
    who: ['#who', '[data-section-theme="who"]'],
    "how-it-works": ['#how-it-works', '[data-section-theme="how-it-works"]'],
    reviews: ['#reviews', '[data-section-theme="reviews"]'],
    faq: ['#faq', '[data-section-theme="faq"]'],
    cta: ['#cta', '[data-section-theme="cta"]', 'section:has(.arrow-button)'],
};

export default function Background({ children, className }) {
    const glowARef = useRef(null);
    const glowBRef = useRef(null);
    const tintOverlayRef = useRef(null);
    const containerRef = useRef(null);
    const activePaletteRef = useRef(SECTION_PALETTES.hero);

    useEffect(() => {
        const glowA = glowARef.current;
        const glowB = glowBRef.current;
        const tintOverlay = tintOverlayRef.current;
        if (!glowA || !glowB || !tintOverlay) return;

        // Current interpolated color state
        const currentColor = {
            aR: SECTION_PALETTES.hero.glowA[0],
            aG: SECTION_PALETTES.hero.glowA[1],
            aB: SECTION_PALETTES.hero.glowA[2],
            bR: SECTION_PALETTES.hero.glowB[0],
            bG: SECTION_PALETTES.hero.glowB[1],
            bB: SECTION_PALETTES.hero.glowB[2],
        };

        const updateGlows = () => {
            const dark = isDarkTheme();
            const opA = dark ? 0.32 : 0.24;
            const opB = dark ? 0.28 : 0.20;

            glowA.style.backgroundImage = radialGradient(
                [Math.round(currentColor.aR), Math.round(currentColor.aG), Math.round(currentColor.aB)],
                opA
            );
            glowB.style.backgroundImage = radialGradient(
                [Math.round(currentColor.bR), Math.round(currentColor.bG), Math.round(currentColor.bB)],
                opB
            );
        };

        // Initialize root section color
        document.documentElement.style.setProperty(
            '--current-section-color',
            isDarkTheme() ? SECTION_PALETTES.hero.accentDark : SECTION_PALETTES.hero.accentLight
        );
        updateGlows();

        const ctx = gsap.context(() => {
            const sectionKeys = Object.keys(SECTION_SELECTORS);

            sectionKeys.forEach((key) => {
                const selectors = SECTION_SELECTORS[key];
                let target = null;
                for (const sel of selectors) {
                    target = document.querySelector(sel);
                    if (target) break;
                }

                if (!target) return;

                const palette = SECTION_PALETTES[key];
                if (!palette) return;

                ScrollTrigger.create({
                    trigger: target,
                    start: "top 65%",
                    end: "bottom 35%",
                    onEnter: () => transitionToPalette(palette, key),
                    onEnterBack: () => transitionToPalette(palette, key),
                });
            });

            function transitionToPalette(palette, key) {
                activePaletteRef.current = palette;
                const dark = isDarkTheme();
                const tintColor = dark ? palette.bgTintDark : palette.bgTintLight;
                const accentColor = dark ? palette.accentDark : palette.accentLight;

                if (accentColor) {
                    document.documentElement.style.setProperty('--current-section-color', accentColor);
                }
                if (key) {
                    document.documentElement.setAttribute('data-active-section', key);
                }

                // Smooth morph of radial glow colors
                gsap.to(currentColor, {
                    aR: palette.glowA[0],
                    aG: palette.glowA[1],
                    aB: palette.glowA[2],
                    bR: palette.glowB[0],
                    bG: palette.glowB[1],
                    bB: palette.glowB[2],
                    duration: 1.2,
                    ease: "power2.out",
                    onUpdate: updateGlows,
                    overwrite: "auto",
                });

                // Smooth tint overlay transition
                gsap.to(tintOverlay, {
                    backgroundColor: tintColor,
                    duration: 1.2,
                    ease: "power2.out",
                    overwrite: "auto",
                });
            }

            // Parallax drift of ambient glow spots on scroll
            gsap.to(glowA, {
                yPercent: 40,
                xPercent: 12,
                ease: "none",
                scrollTrigger: {
                    trigger: document.body,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1.5,
                },
            });

            gsap.to(glowB, {
                yPercent: 35,
                xPercent: -10,
                ease: "none",
                scrollTrigger: {
                    trigger: document.body,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1.8,
                },
            });
        }, containerRef);

        const onThemeChange = () => {
            const dark = isDarkTheme();
            const palette = activePaletteRef.current;
            if (palette) {
                const tintColor = dark ? palette.bgTintDark : palette.bgTintLight;
                const accentColor = dark ? palette.accentDark : palette.accentLight;
                document.documentElement.style.setProperty('--current-section-color', accentColor);
                tintOverlay.style.backgroundColor = tintColor;
            }
            updateGlows();
        };

        const mo = new MutationObserver(onThemeChange);
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

        return () => {
            ctx.revert();
            mo.disconnect();
        };
    }, []);

    return (
        <div ref={containerRef} className={cn("relative w-full min-h-screen", className)}>
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
            >
                {/* Smooth section tint transition layer */}
                <div
                    ref={tintOverlayRef}
                    className="absolute inset-0 transition-colors duration-1000 will-change-[background-color]"
                    style={{ backgroundColor: "rgba(255, 245, 235, 0.45)" }}
                />

                {/* Morphing ambient glows */}
                <div ref={glowARef} className="ambient-glow ambient-glow-a will-change-[background-image,transform]" />
                <div ref={glowBRef} className="ambient-glow ambient-glow-b will-change-[background-image,transform]" />

                {/* Hand-drawn route winding path */}
                <WindingPathBackground />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen">
                {children}
            </div>
        </div>
    );
}