import {cn} from "../../utils/cn.js";

export function H1({ children, className, ...props }) {
    return (
        <h1
            className={cn(
                'text-2xl sm:text-3xl font-extrabold leading-[1.25] tracking-[-0.03em] text-balance',
                className
            )}
            {...props}
        >
            {children}
        </h1>
    )
}

export function H2({ children, className, ...props }) {
    return (
        <h2
            className={cn(
                'text-lg sm:text-xl font-extrabold leading-[1.4] tracking-[-0.02em] text-balance',
                className
            )}
            {...props}
        >
            {children}
        </h2>
    )
}

export function H3({ children, className, ...props }) {
    return (
        <h3
            className={cn(
                'text-[clamp(1.125rem,calc(1.5vw+0.8rem),1.4rem)] font-bold leading-[1.35] tracking-[-0.02em] text-balance',
                className
            )}
            {...props}
        >
            {children}
        </h3>
    )
}

export function P({ children, className, ...props }) {
    return (
        <p
            className={cn(
                'text-[clamp(0.9rem,1.5vw,1rem)] font-normal leading-relaxed tracking-[-0.01em] text-balance',
                className
            )}
            {...props}
        >
            {children}
        </p>
    )
}
