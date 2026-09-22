import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { cn } from "../../utils/cn.js";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const VARIANTS = {
    // 1. Starts on the right under previous section, curves across and stops above title in center
    "right-to-center": {
        start: { x: 820, y: 15 },
        dest: { x: 500, y: 145 },
        pathD: "M 820,15 C 840,65 680,45 590,85 C 530,110 515,130 500,145",
    },
    // 2. Starts on the left under previous section, curves across and stops above title in center
    "left-to-center": {
        start: { x: 180, y: 15 },
        dest: { x: 500, y: 145 },
        pathD: "M 180,15 C 160,65 320,45 410,85 C 470,110 485,130 500,145",
    },
    // 3. Starts on the right under previous section, curves across to left above left-aligned title
    "right-to-left": {
        start: { x: 820, y: 15 },
        dest: { x: 260, y: 145 },
        pathD: "M 820,15 C 850,70 650,55 490,95 C 370,125 300,115 260,145",
    },
    // 4. Starts on the left under previous section, curves across to right above right-aligned title
    "left-to-right": {
        start: { x: 180, y: 15 },
        dest: { x: 740, y: 145 },
        pathD: "M 180,15 C 150,70 350,55 510,95 C 630,125 700,115 740,145",
    },
};

export default function SectionMotionPath({
    variant = "right-to-center",
    className = "",
}) {
    const containerRef = useRef(null);
    const progressPathRef = useRef(null);
    const markerRef = useRef(null);
    const startDotRef = useRef(null);
    const destNodeRef = useRef(null);

    const config = VARIANTS[variant] || VARIANTS["right-to-center"];

    useEffect(() => {
        const container = containerRef.current;
        const progressPath = progressPathRef.current;
        const marker = markerRef.current;
        const startDot = startDotRef.current;
        const destNode = destNodeRef.current;

        if (!container || !progressPath || !marker) return;

        const ctx = gsap.context(() => {
            const length = progressPath.getTotalLength();

            // Set up line drawing stroke-dasharray and stroke-dashoffset
            gsap.set(progressPath, {
                strokeDasharray: length,
                strokeDashoffset: length,
            });

            // Initial states
            if (startDot) gsap.set(startDot, { opacity: 0.2, scale: 0.8 });
            if (destNode) gsap.set(destNode, { opacity: 0.35, scale: 0.9, transformOrigin: "center center" });
            gsap.set(marker, { opacity: 0, scale: 0.8 });

            // Master scrubbed scroll timeline connecting end of previous section to title of next
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    start: "top 88%",
                    end: "bottom 30%",
                    scrub: 0.8,
                    invalidateOnRefresh: true,
                },
            });

            // 1. Reveal start node under previous section
            if (startDot) {
                tl.to(startDot, { opacity: 1, scale: 1.1, duration: 0.08 });
            }

            // Reveal marker as line starts drawing
            tl.to(marker, { opacity: 1, scale: 1, duration: 0.08 }, 0);

            // 2. Draw line progressively from 0% to 100%
            tl.fromTo(
                progressPath,
                { strokeDashoffset: length },
                { strokeDashoffset: 0, ease: "none", duration: 1 },
                0
            );

            // 3. Move 2D voyager marker along the path synchronized with the stroke tip
            tl.to(
                marker,
                {
                    motionPath: {
                        path: progressPath,
                        align: progressPath,
                        alignOrigin: [0.5, 0.5],
                        autoRotate: true,
                    },
                    ease: "none",
                    duration: 1,
                },
                0
            );

            // 4. Activate checkpoint destination node above the next title as traveler arrives
            if (destNode) {
                tl.to(
                    destNode,
                    {
                        opacity: 1,
                        scale: 1.3,
                        duration: 0.15,
                        ease: "back.out(2)",
                    },
                    0.85
                );
            }
        }, container);

        return () => ctx.revert();
    }, [variant]);

    return (
        <div
            ref={containerRef}
            aria-hidden="true"
            className={cn(
                "w-full max-w-5xl h-24 sm:h-32 my-1 sm:my-2 pointer-events-none overflow-visible flex items-center justify-center select-none",
                className
            )}
        >
            <svg
                viewBox="0 0 1000 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full overflow-visible"
                style={{ color: "var(--current-section-color, var(--primary))" }}
            >
                {/* 1. Subtle 2D Ghost Guide Track (stroke-dasharray) */}
                <path
                    d={config.pathD}
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeDasharray="4 6"
                    strokeLinecap="round"
                    className="opacity-20"
                />

                {/* 2. Active 2D Drawn Path (Progressive reveal with scroll) */}
                <path
                    ref={progressPathRef}
                    d={config.pathD}
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-85 will-change-[stroke-dashoffset]"
                />

                {/* 3. Starting Node under previous section */}
                <g
                    ref={startDotRef}
                    transform={`translate(${config.start.x}, ${config.start.y})`}
                    className="will-change-transform"
                >
                    <circle r="6" fill="var(--card, #111)" stroke="currentColor" strokeWidth="1.8" />
                    <circle r="2.5" fill="currentColor" />
                </g>

                {/* 4. Destination Checkpoint Station Node above upcoming title */}
                <g
                    ref={destNodeRef}
                    transform={`translate(${config.dest.x}, ${config.dest.y})`}
                    className="will-change-transform"
                >
                    <circle r="9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3" className="opacity-60" />
                    <circle r="6" fill="var(--card, #111)" stroke="currentColor" strokeWidth="2" />
                    <circle r="2.5" fill="currentColor" />
                </g>

                {/* 5. 2D Traveling Voyager Marker (Synchronized via MotionPathPlugin) */}
                <g
                    ref={markerRef}
                    className="will-change-transform"
                    style={{ transformOrigin: "0px 0px" }}
                >
                    {/* Reticle Ring */}
                    <circle
                        cx="0"
                        cy="0"
                        r="11"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeDasharray="2.5 2.5"
                        className="opacity-50"
                    />
                    {/* Inner Disc */}
                    <circle
                        cx="0"
                        cy="0"
                        r="7"
                        fill="var(--card, #111)"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                    {/* 2D Directional Arrowhead pointing forward along tangent (positive X) */}
                    <polygon
                        points="6,0 -3,-3 -1,0 -3,3"
                        fill="currentColor"
                    />
                    {/* Center Pivot Point */}
                    <circle
                        cx="0"
                        cy="0"
                        r="1.5"
                        fill="var(--foreground, #fff)"
                    />
                </g>
            </svg>
        </div>
    );
}
