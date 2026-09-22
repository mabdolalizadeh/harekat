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
                duration: 0.35,
                ease: "power2.out",
            });
        };

        // Interactive hover states
        const onMouseEnterInteractive = () => {
            gsap.to(ring, {
                scale: 2.4,
                backgroundColor: "rgba(244, 124, 32, 0.18)",
                borderColor: "rgba(244, 124, 32, 0.6)",
                duration: 0.3,
                ease: "power2.out",
            });
            gsap.to(dot, {
                scale: 0.5,
                opacity: 0.5,
                duration: 0.2,
            });
        };

        const onMouseLeaveInteractive = () => {
            gsap.to(ring, {
                scale: 1,
                backgroundColor: "transparent",
                borderColor: "rgba(244, 124, 32, 0.4)",
                duration: 0.3,
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
            {/* Trailing Outer Ring */}
            <div
                ref={cursorRingRef}
                className="fixed top-0 left-0 -ml-4 -mt-4 w-8 h-8 rounded-full border border-primary/40 pointer-events-none will-change-transform transition-colors"
            />
            {/* Inner Precision Dot */}
            <div
                ref={cursorDotRef}
                className="fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full bg-primary pointer-events-none will-change-transform shadow-[0_0_8px_rgba(244,124,32,0.8)]"
            />
        </div>
    );
}
