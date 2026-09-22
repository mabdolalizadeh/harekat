import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "../../utils/cn.js";

const VARIANTS = {
    // 1. Starts on the right under previous section, curves across and stops above title on center/left
    "right-to-left": {
        startDot: { cx: 640, cy: 10 },
        // Organic hand-drawn bezier with gentle sketch inflection
        pathD: "M 640 10 C 665 42, 530 28, 410 58 C 290 85, 235 68, 210 110",
        arrowTip: { x: 210, y: 114 },
        arrowD: "M 202 102 L 210 114 L 220 104",
    },
    // 2. Starts on the left under previous section, curves across and stops above title on center/right
    "left-to-right": {
        startDot: { cx: 160, cy: 10 },
        pathD: "M 160 10 C 135 42, 270 28, 390 58 C 510 85, 565 68, 590 110",
        arrowTip: { x: 590, y: 114 },
        arrowD: "M 580 104 L 590 114 L 598 102",
    },
    // 3. Starts on the right under previous section, loops down to center directly above centered title
    "right-to-center": {
        startDot: { cx: 620, cy: 10 },
        pathD: "M 620 10 C 655 45, 545 32, 470 65 C 425 85, 412 96, 400 112",
        arrowTip: { x: 400, y: 114 },
        arrowD: "M 391 103 L 400 114 L 409 103",
    },
    // 4. Starts on the left under previous section, loops down to center directly above centered title
    "left-to-center": {
        startDot: { cx: 180, cy: 10 },
        pathD: "M 180 10 C 145 45, 255 32, 330 65 C 375 85, 388 96, 400 112",
        arrowTip: { x: 400, y: 114 },
        arrowD: "M 391 103 L 400 114 L 409 103",
    },
};

export default function HandDrawnSectionPath({
    variant = "right-to-center",
    className = "",
}) {
    const containerRef = useRef(null);
    const pathRef = useRef(null);
    const arrowRef = useRef(null);
    const dotRef = useRef(null);

    const config = VARIANTS[variant] || VARIANTS["right-to-center"];

    useEffect(() => {
        const path = pathRef.current;
        const arrow = arrowRef.current;
        const dot = dotRef.current;
        const container = containerRef.current;
        if (!path || !arrow || !container) return;

        const ctx = gsap.context(() => {
            const length = path.getTotalLength();
            gsap.set(path, {
                strokeDasharray: length,
                strokeDashoffset: length,
            });
            gsap.set(arrow, { opacity: 0, scale: 0.5 });
            if (dot) gsap.set(dot, { opacity: 0, scale: 0 });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    start: "top 88%",
                    end: "bottom 40%",
                    scrub: 0.7,
                },
            });

            // 1. Reveal starting dot under previous section
            if (dot) {
                tl.to(dot, { opacity: 0.85, scale: 1, duration: 0.1 });
            }

            // 2. Draw 2D hand-drawn line downwards toward next section
            tl.to(path, {
                strokeDashoffset: 0,
                ease: "none",
                duration: 1,
            });

            // 3. Reveal and pop the hand-drawn arrowhead pointing directly at the title
            tl.to(arrow, {
                opacity: 1,
                scale: 1,
                duration: 0.15,
                ease: "back.out(2)",
            }, "-=0.15");
        }, container);

        return () => ctx.revert();
    }, [variant]);

    return (
        <div
            ref={containerRef}
            aria-hidden="true"
            className={cn(
                "w-full max-w-4xl h-20 sm:h-28 my-1 sm:my-2 pointer-events-none overflow-visible flex items-center justify-center select-none",
                className
            )}
        >
            <svg
                viewBox="0 0 800 124"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full overflow-visible"
                style={{ color: "var(--current-section-color, var(--primary))" }}
            >
                {/* Hand-drawn start dot under the last element */}
                <circle
                    ref={dotRef}
                    cx={config.startDot.cx}
                    cy={config.startDot.cy}
                    r="3.5"
                    fill="currentColor"
                    className="will-change-transform"
                />

                {/* Hand-drawn 2D organic bezier line (No glow, pure 2D ink) */}
                <path
                    ref={pathRef}
                    d={config.pathD}
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.75"
                    className="will-change-[stroke-dashoffset]"
                />

                {/* Hand-drawn 2D arrowhead pointing at the upcoming section title */}
                <g ref={arrowRef} className="will-change-transform">
                    <path
                        d={config.arrowD}
                        stroke="currentColor"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        opacity="0.9"
                    />
                </g>
            </svg>
        </div>
    );
}
