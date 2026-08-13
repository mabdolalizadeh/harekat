import {cn} from "../../utils/cn.js";

export function H1({ children, className, ...props }) {
    return (
        <h1
            className={cn(
                'text-2xl font-extrabold leading-[1.05] tracking-[-0.04em] text-balance',
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
                'text-xl font-extrabold leading-[1.05] tracking-[-0.04em] text-balance',
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
                'text-[clamp(1.375rem,calc(3vw+1rem),2rem)] font-bold leading-[1.1] tracking-[-0.04em] text-balance',
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
                'text-[clamp(1.0625rem,2.5vw,1.125rem)] font-normal leading-normal tracking-[-0.02em] text-balance',
                className
            )}
            {...props}
        >
            {children}
        </p>
    )
}
