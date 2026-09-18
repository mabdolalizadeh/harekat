import { cn } from "../../utils/cn.js";

export function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-[var(--surface-muted)]/80 relative overflow-hidden",
                "after:absolute after:inset-0 after:-translate-x-full",
                "after:animate-[shimmer_1.6s_infinite] after:bg-gradient-to-r",
                "after:from-transparent after:via-foreground/5 after:to-transparent",
                className
            )}
            {...props}
        />
    );
}

export function CourseCardSkeleton({ className }) {
    return (
        <div className={cn(
            "bg-card border border-border/10 flex flex-col rounded-xl overflow-hidden shadow-xs",
            className
        )}>
            {/* Image placeholder */}
            <div className="relative aspect-square w-full bg-surface-muted/60">
                <Skeleton className="h-full w-full rounded-none" />
                <Skeleton className="absolute bottom-3 right-3 h-5 w-16 rounded-full" />
                <Skeleton className="absolute bottom-3 left-3 h-5 w-20 rounded-full" />
            </div>
            {/* Content placeholder */}
            <div className="flex flex-col gap-3 p-3 sm:p-4 flex-1">
                <Skeleton className="h-5 w-4/5 rounded-md" />
                <Skeleton className="h-4 w-3/5 rounded-md" />

                <div className="flex flex-wrap gap-2 mt-1">
                    <Skeleton className="h-5 w-14 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-12 rounded-md" />
                </div>

                <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/10">
                    <Skeleton className="h-4 w-20 rounded-md" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-16 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SubscriptionCardSkeleton({ className }) {
    return (
        <div className={cn(
            "bg-card border border-border/10 flex flex-col rounded-xl overflow-hidden shadow-xs",
            className
        )}>
            <div className="relative aspect-square w-full bg-surface-muted/60">
                <Skeleton className="h-full w-full rounded-none" />
                <Skeleton className="absolute bottom-3 right-3 h-5 w-20 rounded-full" />
            </div>
            <div className="flex flex-col gap-3 p-4 flex-1">
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/10">
                    <Skeleton className="h-5 w-24 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export function HeroSlideshowSkeleton({ className }) {
    return (
        <div className={cn(
            "mx-auto aspect-[4/5] max-w-[calc(100%-2rem)] rounded-[var(--radius-2xl)] sm:aspect-[4/3] md:aspect-[16/9] overflow-hidden bg-surface-muted/60 border border-border/10",
            className
        )}>
            <Skeleton className="h-full w-full rounded-none" />
        </div>
    );
}

export function ProductDetailSkeleton() {
    return (
        <div className="w-full max-w-5xl gap-8 pb-20 pt-28 sm:pt-36 flex flex-col mx-auto px-4">
            <Skeleton className="h-4 w-20 rounded-md" />
            <div className="grid w-full gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
                <div className="overflow-hidden rounded-2xl border border-border bg-card aspect-square">
                    <Skeleton className="h-full w-full rounded-none" />
                </div>
                <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
                    <Skeleton className="h-8 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-5/6 rounded-md" />
                    <Skeleton className="h-4 w-2/3 rounded-md" />
                    <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-border/10">
                        <Skeleton className="h-7 w-32 rounded-md" />
                        <Skeleton className="h-11 w-full rounded-xl" />
                    </div>
                </div>
            </div>
            <div className="w-full aspect-video rounded-2xl border border-border bg-card overflow-hidden">
                <Skeleton className="h-full w-full rounded-none" />
            </div>
            <div className="w-full rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-3">
                <Skeleton className="h-6 w-32 rounded-md mb-2" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-11/12 rounded-md" />
                <Skeleton className="h-4 w-4/5 rounded-md" />
            </div>
        </div>
    );
}

export function TeacherDetailSkeleton() {
    return (
        <div className="w-full max-w-5xl gap-8 pb-20 pt-28 sm:pt-36 flex flex-col mx-auto px-4">
            <Skeleton className="h-4 w-20 rounded-md" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
                <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex-shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-8 w-48 rounded-lg" />
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-4 w-64 rounded-md mt-1" />
                </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-3">
                <Skeleton className="h-6 w-36 rounded-md mb-2" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-11/12 rounded-md" />
                <Skeleton className="h-4 w-4/5 rounded-md" />
            </div>
            <div className="flex flex-col gap-4">
                <Skeleton className="h-6 w-40 rounded-md" />
                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <CourseCardSkeleton />
                    <CourseCardSkeleton />
                    <CourseCardSkeleton />
                </div>
            </div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="w-full max-w-6xl mx-auto px-4 pt-32 pb-24 flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 pb-6 border-b border-border">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-3 w-20 rounded-md" />
                        <Skeleton className="h-6 w-40 rounded-md" />
                        <Skeleton className="h-3 w-28 rounded-md" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-24 rounded-lg" />
                    <Skeleton className="h-9 w-20 rounded-lg" />
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-4 sm:p-5 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="w-9 h-9 rounded-lg" />
                            <Skeleton className="h-4 w-12 rounded-md" />
                        </div>
                        <Skeleton className="h-7 w-20 rounded-md mt-2" />
                        <Skeleton className="h-3 w-24 rounded-md" />
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-36 rounded-md" />
                    <Skeleton className="h-4 w-20 rounded-md" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <CourseCardSkeleton />
                    <CourseCardSkeleton />
                    <CourseCardSkeleton />
                </div>
            </div>
        </div>
    );
}
