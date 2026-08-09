export default function MarqueeLayout({ children, repeat = 2 }) {
    const items = Array.isArray(children) ? children : [children];
    const list = Array.from({ length: repeat }, () => items).flat();
    return (
        <div className={'w-full overflow-hidden py-3'}>
            <div className={'flex items-center gap-4 w-max marquee-scroll'}>
                {list.map((child, i) => (
                    <div
                        key={i}
                        className={'marquee-item shrink-0'}
                        style={{ animationDelay: `${i * 0.06}s` }}
                    >
                        {child}
                    </div>
                ))}
            </div>
        </div>
    )
}
