import { cn } from "../../utils/cn.js";

export default function StudentReviewCard({ review, quote, name, className, ...props }) {
    const text = review || quote;

    return (
        <div
            className={cn(
                'group relative flex flex-col justify-between h-full bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-xl shadow-black/[0.04] dark:shadow-black/30 transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1.5',
                className
            )}
            {...props}
        >
            {/* Top quote decorative element */}
            <div className="flex items-center justify-between mb-4">
                <svg
                    width="26"
                    height="22"
                    viewBox="0 0 28 24"
                    fill="none"
                    className="text-primary/30 group-hover:text-primary/70 transition-colors shrink-0"
                    aria-hidden="true"
                >
                    <path
                        d="M7.8 0C3.5 3.6 0.8 8.4 0.8 14.2C0.8 19.3 4 23.2 8.5 23.2C12.4 23.2 15.2 20.3 15.2 16.5C15.2 12.8 12.3 9.9 8.8 9.9C8 9.9 7.2 10.1 6.6 10.4C7.5 5.8 11.2 2.4 14.5 0.5L7.8 0ZM20.6 0C16.3 3.6 13.6 8.4 13.6 14.2C13.6 19.3 16.8 23.2 21.3 23.2C25.2 23.2 28 20.3 28 16.5C28 12.8 25.1 9.9 21.6 9.9C20.8 9.9 20 10.1 19.4 10.4C20.3 5.8 24 2.4 27.3 0.5L20.6 0Z"
                        fill="currentColor"
                    />
                </svg>
                <span className="w-2 h-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
            </div>

            {/* Review text */}
            <p className="text-foreground/90 text-[0.95rem] sm:text-base leading-relaxed font-normal flex-1 mb-6">
                «{text}»
            </p>

            {/* Student Name footer without avatar */}
            <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 rounded-full bg-primary shrink-0" />
                    <h3 className="font-bold text-foreground text-sm sm:text-base">
                        {name}
                    </h3>
                </div>
                <span className="text-xs text-muted font-medium">
                    دانش‌آموخته مدرسه حرکت
                </span>
            </div>
        </div>
    );
}
