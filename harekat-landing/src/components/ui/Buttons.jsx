import { useRef } from "react";
import gsap from "gsap";
import { cn } from "../../utils/cn.js";
import { ArrowLeft } from "lucide-react";

function useCircleHover() {
    const circleRef = useRef(null);

    const onMouseEnter = () => {
        if (!circleRef.current) return;
        gsap.to(circleRef.current, {
            scale: 2.8,
            duration: 0.45,
            ease: "power3.out",
            overwrite: "auto",
        });
    };

    const onMouseLeave = () => {
        if (!circleRef.current) return;
        gsap.to(circleRef.current, {
            scale: 0,
            duration: 0.35,
            ease: "power2.in",
            overwrite: "auto",
        });
    };

    return { circleRef, onMouseEnter, onMouseLeave };
}

export function PrimaryButton({ children, className, ...props }) {
    const { circleRef, onMouseEnter, onMouseLeave } = useCircleHover();

    return (
        <button
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={cn(
                'relative overflow-hidden bg-primary px-4 py-1.5 sm:py-1',
                'text-primary-foreground font-medium',
                'rounded-full cursor-pointer',
                'active:scale-95 transition-transform duration-200',
                className
            )}
            {...props}
        >
            {/* GSAP expanding circle from middle bottom */}
            <span
                ref={circleRef}
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-32 h-32 rounded-full scale-0 will-change-transform z-0 bg-brand-600"
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
        </button>
    );
}

export function SecondaryButton({ children, className, ...props }) {
    const { circleRef, onMouseEnter, onMouseLeave } = useCircleHover();

    return (
        <button
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={cn(
                'relative overflow-hidden bg-surface-muted px-4 py-1.5 sm:py-1',
                'text-foreground font-medium',
                'rounded-full cursor-pointer border border-border/40',
                'active:scale-95 transition-transform duration-200',
                className
            )}
            {...props}
        >
            {/* GSAP expanding circle from middle bottom */}
            <span
                ref={circleRef}
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-32 h-32 rounded-full scale-0 will-change-transform z-0 bg-primary/25"
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
        </button>
    );
}

export function ArrowButton({ children, className, ...props }) {
    const { circleRef, onMouseEnter, onMouseLeave } = useCircleHover();

    return (
        <button
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={cn(
                'arrow-button relative overflow-hidden pr-4 pl-2.5 py-1.5 sm:py-1 flex items-center justify-center gap-3',
                'bg-primary text-primary-foreground font-semibold',
                'rounded-full cursor-pointer',
                'active:scale-95 transition-transform duration-200',
                'group',
                className
            )}
            {...props}
        >
            {/* GSAP expanding circle from middle bottom */}
            <span
                ref={circleRef}
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-40 h-40 rounded-full scale-0 will-change-transform z-0 bg-brand-700"
            />
            <span className="relative z-10">{children}</span>
            <div
                className="arrow-button-icon relative z-10 flex items-center justify-center size-8 rounded-full overflow-hidden bg-primary-foreground/15"
            >
                <ArrowLeft
                    color="currentColor"
                    size={18}
                    className="absolute inset-0 m-auto transition-transform duration-300 group-hover:translate-x-[-160%]"
                />
                <ArrowLeft
                    color="currentColor"
                    size={18}
                    className="absolute inset-0 m-auto translate-x-[160%] transition-transform duration-300 group-hover:translate-x-0"
                />
            </div>
        </button>
    );
}
