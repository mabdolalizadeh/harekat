import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function WindingPathBackground() {
    const svgRef = useRef(null);
    const pathRef = useRef(null);
    const glowDotRef = useRef(null);

    useEffect(() => {
        const path = pathRef.current;
        const glowDot = glowDotRef.current;
        if (!path) return;

        const ctx = gsap.context(() => {
            const length = path.getTotalLength();
            gsap.set(path, {
                strokeDasharray: length,
                strokeDashoffset: length,
            });

            // Scrub the path drawing across the entire page scroll
            gsap.to(path, {
                strokeDashoffset: 0,
                ease: "none",
                scrollTrigger: {
                    trigger: document.body,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.8,
                    onUpdate: (self) => {
                        if (glowDot) {
                            const point = path.getPointAtLength(length * (1 - self.progress));
                            gsap.set(glowDot, {
                                attr: { cx: point.x, cy: point.y },
                                opacity: self.progress > 0.01 && self.progress < 0.99 ? 0.9 : 0,
                            });
                        }
                    },
                },
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30 dark:opacity-40"
        >
            <svg
                ref={svgRef}
                viewBox="0 0 1440 3200"
                preserveAspectRatio="none"
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="windingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f47c20" stopOpacity="0.8" />
                        <stop offset="30%" stopColor="#ffa33f" stopOpacity="0.7" />
                        <stop offset="65%" stopColor="#4cc9ff" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#a47cff" stopOpacity="0.8" />
                    </linearGradient>
                    <filter id="pathGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Smooth winding Bezier curve down the page */}
                <path
                    ref={pathRef}
                    d="M 1200 0 C 1350 400, 200 700, 300 1100 C 400 1500, 1300 1800, 1100 2300 C 900 2700, 250 2900, 600 3200"
                    stroke="url(#windingGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    filter="url(#pathGlow)"
                />

                {/* Leading glowing pulse dot */}
                <circle
                    ref={glowDotRef}
                    r="7"
                    fill="#ffa33f"
                    filter="url(#pathGlow)"
                    className="opacity-0 transition-opacity duration-300"
                />
            </svg>
        </div>
    );
}
