import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function FollowCursor() {
    const cursorDotRef = useRef(null);
    const cursorRingRef = useRef(null);

    useEffect(() => {
        // Only run on devices with a fine pointer (mouse), not touch screens
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const dot = cursorDotRef.current;
        const ring = cursorRingRef.current;
        if (!dot || !ring) return;

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;

        const onMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Instant crisp tracking for inner dot
            gsap.to(dot, {
                x: mouseX,
                y: mouseY,
                duration: 0.08,
                ease: "none",
            });

            // Smooth trailing lag for outer ring
            gsap.to(ring, {
                x: mouseX,
                y: mouseY,
                duration: 0.28,
                ease: "power2.out",
            });
        };

        // Interactive hover states - refined, sharp, and compact
        const onMouseEnterInteractive = () => {
            gsap.to(ring, {
                scale: 1.45,
                backgroundColor: "rgba(244, 124, 32, 0.12)",
                borderColor: "rgba(244, 124, 32, 0.75)",
                duration: 0.25,
                ease: "power2.out",
            });
            gsap.to(dot, {
                scale: 0.7,
                opacity: 0.6,
                duration: 0.2,
            });
        };

        const onMouseLeaveInteractive = () => {
            gsap.to(ring, {
                scale: 1,
                backgroundColor: "transparent",
                borderColor: "rgba(244, 124, 32, 0.45)",
                duration: 0.25,
                ease: "power2.out",
            });
            gsap.to(dot, {
                scale: 1,
                opacity: 1,
                duration: 0.2,
            });
        };

        window.addEventListener("mousemove", onMouseMove);

        // Attach listeners to interactive elements
        const attachListeners = () => {
            const targets = document.querySelectorAll(
                'button, a, input, select, textarea, [role="button"], .cursor-pointer'
            );
            targets.forEach((target) => {
                target.addEventListener("mouseenter", onMouseEnterInteractive);
                target.addEventListener("mouseleave", onMouseLeaveInteractive);
            });
        };

        attachListeners();

        // Refresh targets periodically or on DOM mutations
        const observer = new MutationObserver(attachListeners);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            observer.disconnect();
        };
    }, []);

    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden hidden md:block">
            {/* Trailing Outer Ring - crisp 24px base, scales to only ~34px, with subpixel rendering */}
            <div
                ref={cursorRingRef}
                className="fixed top-0 left-0 -ml-3 -mt-3 w-6 h-6 rounded-full border border-primary/45 pointer-events-none will-change-transform transform-gpu"
            />
            {/* Inner Precision Dot */}
            <div
                ref={cursorDotRef}
                className="fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full bg-primary pointer-events-none will-change-transform transform-gpu shadow-[0_0_6px_rgba(244,124,32,0.7)]"
            />
        </div>
    );
}
