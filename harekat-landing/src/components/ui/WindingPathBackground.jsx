import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function WindingPathBackground() {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const arrowRef = useRef(null);
    const pathRef = useRef(null);

    useEffect(() => {
        const svg = svgRef.current;
        const arrow = arrowRef.current;
        const path = pathRef.current;
        if (!svg || !arrow || !path) return;

        const ctx = gsap.context(() => {
            const length = path.getTotalLength();
            gsap.set(path, {
                strokeDasharray: length,
                strokeDashoffset: length,
            });

            // Target key landing sections
            const sectionSelectors = [
                '#hero',
                '#courses',
                '#who',
                '#how-it-works',
                '#reviews',
            ];

            const sections = sectionSelectors
                .map((sel) => document.querySelector(sel))
                .filter(Boolean);

            if (!sections.length) return;

            // Master timeline for hand-drawn scroll drawing with section pauses and pointing arrow
            const masterTl = gsap.timeline({
                scrollTrigger: {
                    trigger: document.body,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1.2,
                },
            });

            const stepCount = sections.length;

            sections.forEach((sec, idx) => {
                const targetProgress = (idx + 1) / stepCount;
                const prevProgress = idx / stepCount;

                // 1. Draw segment toward section
                masterTl.to(path, {
                    strokeDashoffset: length * (1 - targetProgress),
                    ease: 'power2.inOut',
                    duration: 1.5,
                    onUpdate: function () {
                        // Position arrow at current head of drawn path
                        const currentDrawnLength = length * (1 - (this.targets()[0].style.strokeDashoffset ? parseFloat(this.targets()[0].style.strokeDashoffset) / length : 1));
                        const safeDist = Math.max(1, Math.min(length - 1, currentDrawnLength));
                        const pt = path.getPointAtLength(safeDist);
                        const ptBefore = path.getPointAtLength(Math.max(0, safeDist - 4));
                        const angle = Math.atan2(pt.y - ptBefore.y, pt.x - ptBefore.x) * (180 / Math.PI);

                        gsap.set(arrow, {
                            x: pt.x,
                            y: pt.y,
                            rotation: angle,
                            transformOrigin: 'center center',
                            opacity: safeDist > 20 ? 1 : 0,
                        });
                    },
                });

                // 2. Pause/linger at section with a gentle bounce & pointing emphasis
                masterTl.to(arrow, {
                    scale: 1.28,
                    duration: 0.5,
                    ease: 'sine.inOut',
                });
                masterTl.to(arrow, {
                    scale: 1,
                    duration: 0.5,
                    ease: 'sine.inOut',
                });
            });

            // Subtle organic stroke breathing
            gsap.to(path, {
                strokeWidth: 4.8,
                duration: 2.6,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-45 dark:opacity-60"
        >
            <svg
                ref={svgRef}
                viewBox="0 0 1440 3200"
                preserveAspectRatio="none"
                className="w-full h-full will-change-transform"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="handDrawnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f47c20" stopOpacity="0.95" />
                        <stop offset="25%" stopColor="#ffa33f" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#4cc9ff" stopOpacity="0.85" />
                        <stop offset="75%" stopColor="#8757f5" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#f47c20" stopOpacity="0.95" />
                    </linearGradient>

                    <filter id="handDrawnGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Hand-drawn organic meandering path navigating between left and right sections */}
                <path
                    ref={pathRef}
                    d="M 1240 20
                       C 1380 180, 1150 320, 820 380
                       C 510 440, 240 540, 310 760
                       C 370 940, 720 1010, 1080 1080
                       C 1340 1140, 1260 1420, 960 1520
                       C 620 1620, 220 1720, 290 1980
                       C 360 2210, 840 2260, 1140 2380
                       C 1380 2480, 1260 2780, 920 2900
                       C 640 3000, 380 3100, 480 3240"
                    stroke="url(#handDrawnGrad)"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#handDrawnGlow)"
                />

                {/* Animated hand-drawn pointing arrow at the leading tip of the path */}
                <g ref={arrowRef} className="will-change-transform opacity-0 pointer-events-none">
                    {/* Glowing background aura */}
                    <circle r="12" fill="#f47c20" opacity="0.3" filter="url(#handDrawnGlow)" />
                    {/* Hand-drawn arrowhead polygon pointing forward in travel direction */}
                    <path
                        d="M -9 -7 L 7 0 L -9 7 L -4 0 Z"
                        fill="#ffa33f"
                        stroke="#f47c20"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />
                </g>
            </svg>
        </div>
    );
}
