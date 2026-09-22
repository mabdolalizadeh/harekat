import MainLayout from "../layouts/MainLayout.jsx";
import TopBarLayout from "../layouts/TopBarLayout.jsx";
import Box from "../components/ui/Box.jsx";
import { H1, H2, P } from "../components/ui/Headings.jsx";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { storeApi } from "../services/api.js";
import { User, Mail, FileText, BookOpen, ArrowRight } from "lucide-react";
import { PrimaryButton } from "../components/ui/Buttons.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CourseCard } from "../components/contents/Cards.jsx";
import { TeacherDetailSkeleton } from "../components/ui/Skeleton.jsx";

function MarkdownContent({ content }) {
    if (!content?.trim()) return null;
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                h1: ({ children }) => <h1 className="text-[1.5rem] font-extrabold text-foreground mt-8 mb-3 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-[1.25rem] font-bold text-foreground mt-6 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-[1.05rem] font-bold text-foreground mt-4 mb-2">{children}</h3>,
                p: ({ children }) => <p className="leading-8 text-foreground/90 my-3">{children}</p>,
                a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="text-link underline underline-offset-4">{children}</a>,
                ul: ({ children }) => <ul className="my-3 list-disc pr-6 flex flex-col gap-1.5 marker:text-muted">{children}</ul>,
                ol: ({ children }) => <ol className="my-3 list-decimal pr-6 flex flex-col gap-1.5 marker:text-muted">{children}</ol>,
                li: ({ children }) => <li className="leading-7">{children}</li>,
                blockquote: ({ children }) => <blockquote className="my-4 border-r-2 border-primary/30 bg-surface-muted/60 px-4 py-3 italic rounded-l-sm">{children}</blockquote>,
                code: ({ children, className }) => {
                    const isBlock = className?.includes("language-");
                    if (isBlock) return <code className={className}>{children}</code>;
                    return <code className="rounded-md bg-surface-muted px-1.5 py-0.5 font-mono text-[0.85em] border border-border">{children}</code>;
                },
                pre: ({ children }) => <pre className="my-4 overflow-x-auto rounded-xl border border-border bg-surface-muted p-4 text-sm leading-6 [&_code]:bg-transparent [&_code]:border-0">{children}</pre>,
                img: ({ src, alt }) => <img src={src} alt={alt || ""} className="my-4 w-full rounded-xl border border-border" />,
                hr: () => <hr className="my-6 border-border" />,
            }}
        >
            {content}
        </ReactMarkdown>
    );
}

export default function TeacherDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        storeApi.getTeacher(id)
            .then((res) => { if (!cancelled) setTeacher(res.data); })
            .catch((e) => { if (!cancelled) setError(e.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id]);

    if (loading) return <MainLayout title="مدرس" sectionIds={null} contentMap={null}><TopBarLayout /><TeacherDetailSkeleton /></MainLayout>;
    if (error || !teacher) return <MainLayout title="مدرس یافت نشد" sectionIds={null} contentMap={null}><TopBarLayout /><Box className="min-h-[50vh] pt-32 gap-4 text-center"><H1>مدرس یافت نشد</H1><PrimaryButton onClick={() => navigate('/')}>بازگشت</PrimaryButton></Box></MainLayout>;

    const fullName = `${teacher.firstName ?? ''} ${teacher.lastName ?? ''}`.trim() || '—';
    const courses = teacher.courses ?? [];

    return (
        <MainLayout title={fullName} sectionIds={null} contentMap={null}>
            <TopBarLayout />
            <Box className="w-full gap-8 pb-24 pt-28 sm:pt-36 max-w-6xl mx-auto px-4 sm:px-6">
                <button
                    onClick={() => navigate(-1)}
                    className="self-start flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
                >
                    <ArrowRight size={16} /> بازگشت
                </button>

                {/* Two-column layout: Right sticky profile, Left scrolling resume and courses */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 w-full items-start">
                    {/* Right Column: Sticky Teacher Profile Card */}
                    <div className="md:col-span-4 md:sticky md:top-32 self-start flex flex-col gap-4 z-10">
                        <div className="w-full rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl p-6 sm:p-7 flex flex-col items-center text-center gap-5 shadow-xl shadow-black/15">
                            <div className="w-36 h-36 rounded-3xl overflow-hidden bg-surface-muted border border-border/70 shrink-0 flex items-center justify-center shadow-inner">
                                {teacher.avatar ? (
                                    <img src={teacher.avatar} alt={fullName} className="h-full w-full object-cover" />
                                ) : (
                                    <User size={64} className="opacity-30 text-muted" />
                                )}
                            </div>

                            <div className="flex flex-col gap-2 items-center">
                                <H1 className="text-2xl font-extrabold">{fullName}</H1>
                                {(teacher.categories ?? []).length > 0 && (
                                    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
                                        {(teacher.categories ?? []).map((cat) => (
                                            <span
                                                key={cat.id}
                                                className="inline-flex rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-xs font-semibold"
                                            >
                                                {cat.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="w-full border-t border-border/60 pt-4 flex flex-col gap-2.5 text-sm">
                                {teacher.email && (
                                    <a
                                        href={`mailto:${teacher.email}`}
                                        className="inline-flex items-center justify-center gap-2 text-muted hover:text-foreground transition-colors"
                                    >
                                        <Mail size={15} className="text-primary" />
                                        <span>{teacher.email}</span>
                                    </a>
                                )}
                                {teacher.resumeFile && (
                                    <a
                                        href={teacher.resumeFile}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center gap-2 text-primary hover:underline font-medium mt-1"
                                    >
                                        <FileText size={15} />
                                        <span>دانلود رزومه (PDF)</span>
                                    </a>
                                )}
                                <div className="inline-flex items-center justify-center gap-2 text-xs text-muted/80 mt-1">
                                    <BookOpen size={14} className="text-primary" />
                                    <span>{courses.length} دوره فعال</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Left Column: Scrolling Resume & Courses */}
                    <div className="md:col-span-8 flex flex-col gap-8 w-full">
                        {/* Resume markdown */}
                        <div className="w-full rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
                            <div className="mb-5 flex items-center gap-2.5 border-b border-border/60 pb-4">
                                <div className="h-6 w-1.5 rounded-full bg-primary" />
                                <H2 className="text-xl font-bold">رزومه و سوابق حرفه‌ای</H2>
                            </div>
                            {teacher.resume ? (
                                <div className="prose prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base">
                                    <MarkdownContent content={teacher.resume} />
                                </div>
                            ) : (
                                <P className="text-muted text-sm">رزومه‌ای ثبت نشده است.</P>
                            )}
                        </div>

                        {/* Courses List */}
                        {courses.length > 0 && (
                            <div className="w-full flex flex-col gap-5">
                                <div className="flex items-center justify-between">
                                    <H2 className="text-2xl font-bold">دوره‌های این مدرس</H2>
                                    <span className="text-xs text-muted">می‌توانید با درگ کردن به سبد خرید اضافه کنید</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                                    {courses.filter(c => c.isActive !== false).map((c) => (
                                        <CourseCard
                                            key={c.id}
                                            title={c.name}
                                            imgSrc={c.image}
                                            category={(c.categories ?? [])[0]?.name ?? ''}
                                            level={c.level ?? ''}
                                            duration={c.duration ?? ''}
                                            courseType={c.typeOfAttendence ?? ''}
                                            teacher={fullName}
                                            price={c.price}
                                            salePrice={c.salePrice ?? null}
                                            registrationStatus={c.statusOfRegistration ?? ''}
                                            id={c.id}
                                            productType="course"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Box>
        </MainLayout>
    );
}
