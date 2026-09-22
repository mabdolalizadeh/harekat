import { cn } from "../../utils/cn.js";

export default function SectionTag({ children, className }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-light tracking-wider uppercase',
                'bg-primary/10 text-primary border border-primary/25 shadow-sm transition-all duration-300 backdrop-blur-sm',
                className
            )}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
            {children}
        </span>
    );
}
