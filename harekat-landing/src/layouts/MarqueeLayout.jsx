
export default function MarqueeLayout({
                                  children,
                                  repeat = 2,
                                  speed = 28,
                                  direction = "left",
                                  pauseOnHover = true,
                                  fadeEdges = true,
                                  className = "",
                              }) {
    const items = Array.isArray(children) ? children : [children];
    const group = Array.from({ length: repeat }, () => items).flat();
    // duplicate the whole group once more so translateX(-50%) loops seamlessly
    const track = [...group, ...group];

    return (
        <div
            className={`relative w-full overflow-hidden ${className}`}
            style={
                fadeEdges
                    ? {
                        maskImage:
                            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                        WebkitMaskImage:
                            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                    }
                    : undefined
            }
        >
            <div
                className="marquee-track flex w-max items-center gap-4 py-3"
                style={{
                    "--marquee-duration": `${speed}s`,
                    animationDirection: direction === "right" ? "reverse" : "normal",
                }}
            >
                {track.map((child, i) => (
                    <div key={i} className="marquee-item shrink-0">
                        {child}
                    </div>
                ))}
            </div>

            <style>{`
                .marquee-track {
                    animation: marquee-scroll var(--marquee-duration) linear infinite;
                }
                ${pauseOnHover ? ".marquee-track:hover { animation-play-state: paused; }" : ""}
                @keyframes marquee-scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .marquee-item {
                    opacity: 0.5;
                    filter: saturate(0.65);
                    transition: opacity .4s ease, filter .4s ease, transform .4s cubic-bezier(.22,1,.36,1);
                }
                .marquee-track:hover .marquee-item {
                    opacity: 0.28;
                    filter: saturate(0.35) blur(0.3px);
                }
                .marquee-item:hover {
                    opacity: 1 !important;
                    filter: saturate(1) !important;
                    transform: translateY(-3px) scale(1.06);
                }
                @media (prefers-reduced-motion: reduce) {
                    .marquee-track { animation: none; }
                }
            `}</style>
        </div>
    );
}