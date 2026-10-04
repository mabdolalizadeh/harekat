import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '../../contexts/ThemeContext.jsx';

export default function LandingSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#1e293b' : '#e2e8f0';
    const highlightColor = isDark ? '#334155' : '#f8fafc';

    return (
        <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor} duration={1.5}>
            <div
                className="w-full min-h-screen flex flex-col items-center overflow-x-hidden bg-background text-foreground transition-colors duration-300"
                aria-busy="true"
                aria-live="polite"
            >
                {/* 1. Header / TopBar Skeleton */}
                <header className="fixed top-0 z-50 w-full pt-4 sm:pt-5 px-3.5 sm:px-8">
                    <div className="mx-auto max-w-7xl px-4 py-2 rounded-full border border-border/40 bg-background/60 backdrop-blur-xl flex items-center justify-between shadow-sm">
                        {/* Logo Placeholder */}
                        <div className="flex items-center gap-2">
                            <Skeleton width={110} height={36} borderRadius={12} />
                        </div>

                        {/* Navigation Links Placeholder (Desktop) */}
                        <div className="hidden md:flex items-center gap-6">
                            <Skeleton width={50} height={18} borderRadius={6} />
                            <Skeleton width={60} height={18} borderRadius={6} />
                            <Skeleton width={80} height={18} borderRadius={6} />
                            <Skeleton width={65} height={18} borderRadius={6} />
                            <Skeleton width={75} height={18} borderRadius={6} />
                        </div>

                        {/* Actions (Login / Cart / Theme) */}
                        <div className="flex items-center gap-2.5">
                            <Skeleton width={38} height={38} borderRadius="50%" />
                            <Skeleton width={38} height={38} borderRadius="50%" />
                            <Skeleton width={90} height={38} borderRadius={20} />
                        </div>
                    </div>
                </header>

                <main className="flex flex-col items-center w-full max-w-8xl px-[clamp(1rem,4vw,6rem)] pt-24 sm:pt-28 pb-16">
                    {/* 2. Hero Section Skeleton */}
                    <section className="relative w-full pb-14 sm:pb-24 flex flex-col items-center">
                        {/* Hero Banner Carousel Placeholder */}
                        <div className="w-full max-w-[calc(100%-1.5rem)] sm:max-w-[calc(100%-2.5rem)] mx-auto">
                            <div className="relative w-full aspect-[4/5] sm:aspect-[4/3] md:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden border border-border/50 shadow-xl bg-surface-muted/30">
                                <Skeleton height="100%" borderRadius={24} />
                            </div>
                        </div>

                        {/* Central Typography & CTA */}
                        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl text-center px-4 mt-12 sm:mt-20">
                            {/* Category Badge */}
                            <div className="mb-6">
                                <Skeleton width={150} height={32} borderRadius={999} />
                            </div>

                            {/* Main Headline */}
                            <div className="w-full flex flex-col items-center gap-2.5 mb-4">
                                <Skeleton className="w-[85%] max-w-xl h-10 sm:h-14" borderRadius={14} />
                                <Skeleton className="w-[60%] max-w-md h-10 sm:h-14" borderRadius={14} />
                            </div>

                            {/* Subtitle */}
                            <div className="w-full max-w-2xl flex flex-col items-center gap-2 mt-4 px-2">
                                <Skeleton className="w-full h-4 sm:h-5" borderRadius={6} />
                                <Skeleton className="w-[80%] h-4 sm:h-5" borderRadius={6} />
                            </div>

                            {/* CTA Button */}
                            <div className="mt-8 sm:mt-10">
                                <Skeleton width={180} height={48} borderRadius={999} />
                            </div>
                        </div>
                    </section>

                    {/* 3. Manifesto Skeleton */}
                    <section className="w-full py-10 sm:py-16 flex flex-col items-center gap-4 text-center max-w-3xl">
                        <Skeleton width={100} height={26} borderRadius={999} />
                        <Skeleton className="w-[90%] h-8 sm:h-10" borderRadius={10} />
                        <Skeleton className="w-full h-4 sm:h-5" borderRadius={6} />
                        <Skeleton className="w-[85%] h-4 sm:h-5" borderRadius={6} />
                    </section>

                    {/* 4. Founder Card Skeleton */}
                    <section className="w-full py-10 sm:py-14 flex justify-center px-4">
                        <div className="w-full max-w-[640px] rounded-3xl p-6 sm:p-10 border border-border/60 bg-card/60 shadow-lg flex flex-col gap-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <Skeleton width={12} height={12} borderRadius="50%" />
                                    <Skeleton width={100} height={22} borderRadius={6} />
                                </div>
                                <Skeleton width={28} height={28} borderRadius={6} />
                            </div>
                            <div className="flex flex-col gap-2 mt-1">
                                <Skeleton className="w-full h-4" borderRadius={6} />
                                <Skeleton className="w-[95%] h-4" borderRadius={6} />
                                <Skeleton className="w-[88%] h-4" borderRadius={6} />
                            </div>
                        </div>
                    </section>

                    {/* 5. Courses Section Skeleton */}
                    <section className="w-full py-12 sm:py-20 flex flex-col gap-8">
                        {/* Header & Tabs */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex flex-col gap-2 border-r-2 border-primary/80 pr-4">
                                <Skeleton width={90} height={16} borderRadius={4} />
                                <Skeleton width={180} height={28} borderRadius={8} />
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Skeleton width={80} height={36} borderRadius={999} />
                                <Skeleton width={80} height={36} borderRadius={999} />
                                <Skeleton width={80} height={36} borderRadius={999} />
                            </div>
                        </div>

                        {/* Course Cards Grid */}
                        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-card border border-border/20 rounded-2xl overflow-hidden shadow-xs flex flex-col"
                                >
                                    {/* Aspect Square Image Placeholder */}
                                    <div className="w-full aspect-square relative bg-surface-muted/30">
                                        <Skeleton height="100%" borderRadius={0} />
                                        <div className="absolute bottom-3 right-3">
                                            <Skeleton width={60} height={20} borderRadius={999} />
                                        </div>
                                    </div>
                                    {/* Body */}
                                    <div className="p-4 flex flex-col gap-3 flex-1">
                                        <Skeleton width="85%" height={22} borderRadius={6} />
                                        <div className="flex gap-2">
                                            <Skeleton width={55} height={18} borderRadius={6} />
                                            <Skeleton width={65} height={18} borderRadius={6} />
                                        </div>
                                        <div className="mt-auto pt-3 border-t border-border/10 flex items-center justify-between">
                                            <Skeleton width={80} height={18} borderRadius={6} />
                                            <Skeleton width={36} height={36} borderRadius="50%" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 6. Capsule Courses Skeleton */}
                    <section className="w-full py-12 sm:py-20 flex flex-col gap-8">
                        <div className="flex flex-col gap-2 border-r-2 border-primary/80 pr-4">
                            <Skeleton width={100} height={16} borderRadius={4} />
                            <Skeleton width={200} height={28} borderRadius={8} />
                        </div>
                        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-card border border-border/20 rounded-2xl overflow-hidden shadow-xs flex flex-col">
                                    <div className="w-full aspect-video bg-surface-muted/30">
                                        <Skeleton height="100%" borderRadius={0} />
                                    </div>
                                    <div className="p-5 flex flex-col gap-3">
                                        <Skeleton width="75%" height={22} borderRadius={6} />
                                        <Skeleton width="95%" height={16} borderRadius={6} />
                                        <div className="mt-auto pt-3 border-t border-border/10 flex items-center justify-between">
                                            <Skeleton width={90} height={20} borderRadius={6} />
                                            <Skeleton width={80} height={34} borderRadius={10} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 7. Skill Packages Skeleton */}
                    <section className="w-full py-12 sm:py-20 flex flex-col gap-8">
                        <div className="flex flex-col gap-2 border-r-2 border-primary/80 pr-4">
                            <Skeleton width={110} height={16} borderRadius={4} />
                            <Skeleton width={210} height={28} borderRadius={8} />
                        </div>
                        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-card border border-border/20 rounded-2xl overflow-hidden shadow-xs flex flex-col">
                                    <div className="w-full aspect-video bg-surface-muted/30">
                                        <Skeleton height="100%" borderRadius={0} />
                                    </div>
                                    <div className="p-5 flex flex-col gap-3">
                                        <Skeleton width="80%" height={22} borderRadius={6} />
                                        <Skeleton width="100%" height={16} borderRadius={6} />
                                        <div className="mt-auto pt-3 border-t border-border/10 flex items-center justify-between">
                                            <Skeleton width={95} height={20} borderRadius={6} />
                                            <Skeleton width={90} height={36} borderRadius={12} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 8. Subscriptions Skeleton */}
                    <section className="w-full py-12 sm:py-20 flex flex-col items-center gap-8">
                        <div className="flex flex-col items-center gap-2 text-center">
                            <Skeleton width={100} height={26} borderRadius={999} />
                            <Skeleton width={260} height={32} borderRadius={10} />
                        </div>
                        <div className="grid w-full grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-card border border-border/30 rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-sm">
                                    <Skeleton width={90} height={24} borderRadius={8} />
                                    <Skeleton width={130} height={36} borderRadius={10} />
                                    <div className="flex flex-col gap-2.5 my-3">
                                        <Skeleton width="90%" height={16} borderRadius={4} />
                                        <Skeleton width="80%" height={16} borderRadius={4} />
                                        <Skeleton width="85%" height={16} borderRadius={4} />
                                    </div>
                                    <Skeleton className="w-full h-11 mt-auto" borderRadius={14} />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 9. Mentors Section Skeleton */}
                    <section className="w-full py-12 sm:py-20 flex flex-col items-center gap-8">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <Skeleton width={90} height={24} borderRadius={999} />
                            <Skeleton width={240} height={32} borderRadius={10} />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 w-full">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex flex-col items-center gap-3">
                                    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-surface-muted/40 border border-border/40">
                                        <Skeleton height="100%" borderRadius={16} />
                                    </div>
                                    <Skeleton width={90} height={18} borderRadius={6} />
                                    <Skeleton width={65} height={14} borderRadius={4} />
                                </div>
                            ))}
                        </div>
                    </section>
                </main>

                {/* 10. Footer Skeleton */}
                <footer className="w-full border-t border-border/40 bg-surface/30 pt-16 pb-12 px-[clamp(1rem,4vw,6rem)]">
                    <div className="max-w-7xl mx-auto flex flex-col gap-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex flex-col gap-3">
                                    <Skeleton width={110} height={20} borderRadius={6} />
                                    <Skeleton width={80} height={14} borderRadius={4} />
                                    <Skeleton width={95} height={14} borderRadius={4} />
                                    <Skeleton width={70} height={14} borderRadius={4} />
                                </div>
                            ))}
                        </div>
                        <div className="pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <Skeleton width={160} height={16} borderRadius={4} />
                            <div className="flex items-center gap-3">
                                <Skeleton width={32} height={32} borderRadius="50%" />
                                <Skeleton width={32} height={32} borderRadius="50%" />
                                <Skeleton width={32} height={32} borderRadius="50%" />
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </SkeletonTheme>
    );
}
