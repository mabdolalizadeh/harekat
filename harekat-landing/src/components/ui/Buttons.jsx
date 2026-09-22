import { cn } from "../../utils/cn.js";
import { ArrowLeft } from "lucide-react";

export function PrimaryButton({ children, className, ...props }) {
    return (
        <button
            className={cn(
                'relative overflow-hidden bg-primary px-4 py-1.5 sm:py-1',
                'text-primary-foreground font-medium',
                'rounded-full cursor-pointer',
                'active:scale-95 transition-transform duration-200',
                className
            )}
            {...props}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
        </button>
    );
}

export function SecondaryButton({ children, className, ...props }) {
    return (
        <button
            className={cn(
                'relative overflow-hidden bg-surface-muted px-4 py-1.5 sm:py-1',
                'text-foreground font-medium',
                'rounded-full cursor-pointer border border-border/40',
                'active:scale-95 transition-transform duration-200',
                className
            )}
            {...props}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
        </button>
    );
}

export function ArrowButton({ children, className, ...props }) {
    return (
        <button
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
