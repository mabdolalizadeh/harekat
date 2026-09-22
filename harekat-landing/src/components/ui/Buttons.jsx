import { cn } from "../../utils/cn.js";
import { ArrowLeft } from "lucide-react";

export function PrimaryButton({ children, className, ...props }) {
    return (
        <button
            className={cn(
                'bg-primary px-4 py-1.5 sm:py-1',
                'text-primary-foreground font-medium',
                'rounded-full cursor-pointer',
                'hover:opacity-90 active:scale-95 transition-all duration-200',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

export function SecondaryButton({ children, className, ...props }) {
    return (
        <button
            className={cn(
                'bg-surface-muted px-4 py-1.5 sm:py-1',
                'text-foreground font-medium',
                'rounded-full cursor-pointer border border-border/40',
                'hover:bg-border active:scale-95 transition-all duration-200',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

export function ArrowButton({ children, className, ...props }) {
    return (
        <button
            className={cn(
                'arrow-button bg-primary text-primary-foreground pr-3 pl-2 py-1.5 sm:py-1 flex items-center justify-center gap-3',
                'rounded-full cursor-pointer font-semibold',
                'hover:opacity-90 active:scale-95 transition-all duration-200',
                'group',
                className
            )}
            {...props}
        >
            {children}
            <div
                className="arrow-button-icon relative flex items-center justify-center size-8 rounded-full overflow-hidden bg-primary-foreground/15"
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
