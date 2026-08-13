 
export default function MarqueeLayout({
                                  children,
    repeat = 1,
    fadeEdges = false,
                                  className = "",
                              }) {
    const items = Array.isArray(children) ? children : [children];
    const track = Array.from({ length: repeat }, () => items).flat();

    return (
        <div
            className={`relative w-full overflow-hidden ${className}`}
            style={
                fadeEdges
                    ? { maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }
                    : undefined
            }
        >
            <div
                className="marquee-track flex w-max items-center gap-4 py-3"
                style={{
                    overflowX: "auto",
                }}
            >
                {track.map((child, i) => (
                        <div key={i} className="marquee-item shrink-0">
                        {child}
                    </div>
                ))}
            </div>

        </div>
    );
}
