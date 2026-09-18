import { useEffect, useState, useMemo } from 'react';
import MainLayout from '../layouts/MainLayout.jsx';
import TopBarLayout from '../layouts/TopBarLayout.jsx';
import Box from '../components/ui/Box.jsx';
import { H1, P } from '../components/ui/Headings.jsx';
import SectionTag from '../components/ui/SectionTag.jsx';
import { CourseCard } from '../components/contents/Cards.jsx';
import { CourseCardSkeleton } from '../components/ui/Skeleton.jsx';
import { storeApi } from '../services/api.js';
import { Search, BookOpen } from 'lucide-react';

function mapApiCourse(course) {
    const teacher = course.teacher ? `${course.teacher.firstName ?? ''} ${course.teacher.lastName ?? ''}`.trim() : '';
    return {
        id: course.id,
        title: course.name,
        imgSrc: course.image,
        category: course.categories?.[0]?.name ?? '',
        level: course.level ?? '',
        duration: course.duration ?? '',
        courseType: course.typeOfAttendence ?? '',
        teacher: teacher || '—',
        price: course.price,
        salePrice: course.salePrice,
        registrationStatus: course.statusOfRegistration ?? '',
        kind: course.kind || 'regular'
    };
}

export default function CoursesCatalog({
    kind = 'regular',
    title = 'دوره‌های آموزشی',
    tag = 'دوره‌ها',
    description = 'مسیرهای تخصصی و جامع برای یادگیری عمیق در مرز هنر، رسانه و فناوری.'
}) {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        let cancelled = false;
        Promise.allSettled([storeApi.getCourses(), storeApi.getCategories()])
            .then(([coursesRes, categoriesRes]) => {
                if (cancelled) return;
                if (coursesRes.status === 'fulfilled') {
                    const allCourses = coursesRes.value.data ?? [];
                    const filtered = allCourses
                        .filter((c) => c.isActive !== false)
                        .filter((c) => {
                            if (kind === 'all') return true;
                            if (kind === 'regular') return !c.kind || c.kind === 'regular';
                            return c.kind === kind;
                        })
                        .map(mapApiCourse);
                    setCourses(filtered);
                }
                if (categoriesRes.status === 'fulfilled') {
                    setCategories(categoriesRes.value.data ?? []);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [kind]);

    const filteredCourses = useMemo(() => {
        return courses.filter((c) => {
            const matchesSearch = !search.trim() ||
                c.title?.toLowerCase().includes(search.toLowerCase()) ||
                c.teacher?.toLowerCase().includes(search.toLowerCase());
            const matchesLevel = selectedLevel === 'all' || c.level === selectedLevel;
            const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
            return matchesSearch && matchesLevel && matchesCat;
        });
    }, [courses, search, selectedLevel, selectedCategory]);

    const levels = [
        { id: 'all', label: 'همه سطوح' },
        { id: 'پایه', label: 'پایه' },
        { id: 'مقدماتی', label: 'مقدماتی' },
        { id: 'پیشرفته', label: 'پیشرفته' },
    ];

    return (
        <MainLayout title={title} sectionIds={null} contentMap={null}>
            <TopBarLayout />

            {/* Hero Header */}
            <Box className="pt-32 sm:pt-40 pb-10 sm:pb-14 gap-4 text-center">
                <SectionTag>{tag}</SectionTag>
                <H1 className="text-[clamp(2.25rem,5vw,3.5rem)] text-foreground max-w-[700px] leading-tight">
                    {title}
                </H1>
                <P className="text-muted max-w-[540px] text-sm sm:text-base">
                    {description}
                </P>

                {/* Search and Filters Bar */}
                <div className="w-full max-w-3xl mt-6 flex flex-col gap-3 items-center">
                    <div className="relative w-full">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="جستجو بر اساس عنوان، مدرس..."
                            className="w-full h-11 pr-10 pl-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted/60 text-sm focus:outline-none focus:border-primary transition"
                        />
                        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                        {kind !== 'skill' && (
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                                {levels.map((lvl) => (
                                    <button
                                        key={lvl.id}
                                        type="button"
                                        onClick={() => setSelectedLevel(lvl.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                            selectedLevel === lvl.id
                                                ? 'bg-primary text-primary-foreground font-semibold'
                                                : 'bg-surface-muted text-muted hover:text-foreground'
                                        }`}
                                    >
                                        {lvl.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {categories.length > 0 && (
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                        selectedCategory === 'all'
                                            ? 'bg-primary text-primary-foreground font-semibold'
                                            : 'bg-surface-muted text-muted hover:text-foreground'
                                    }`}
                                >
                                    همه دسته‌ها
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat.name)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                            selectedCategory === cat.name
                                                ? 'bg-primary text-primary-foreground font-semibold'
                                                : 'bg-surface-muted text-muted hover:text-foreground'
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Box>

            {/* Courses Grid */}
            <Box className="pb-24 w-full max-w-[1280px] mx-auto px-4 sm:px-6">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <CourseCardSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-3 w-full bg-card border border-border rounded-2xl p-8">
                        <BookOpen className="text-muted" size={40} />
                        <h3 className="text-lg font-bold text-foreground">موردی یافت نشد</h3>
                        <p className="text-muted text-sm max-w-sm">
                            با تغییر فیلترها یا عبارت جستجو می‌توانید موارد دیگری را پیدا کنید.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full">
                        {filteredCourses.map((course) => (
                            <CourseCard key={course.id} {...course} kind={course.kind || kind} />
                        ))}
                    </div>
                )}
            </Box>
        </MainLayout>
    );
}
