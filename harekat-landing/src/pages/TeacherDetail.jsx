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

    if (loading) return <MainLayout title="مدرس"><TopBarLayout /><Box className="min-h-[50vh] pt-32"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></Box></MainLayout>;
    if (error || !teacher) return <MainLayout title="مدرس یافت نشد"><TopBarLayout /><Box className="min-h-[50vh] pt-32 gap-4 text-center"><H1>مدرس یافت نشد</H1><PrimaryButton onClick={() => navigate('/')}>بازگشت</PrimaryButton></Box></MainLayout>;

    const fullName = `${teacher.firstName ?? ''} ${teacher.lastName ?? ''}`.trim() || '—';
    const courses = teacher.courses ?? [];

    return (
        <MainLayout title={fullName}>
            <TopBarLayout />
            <Box className="w-full gap-8 pb-20 pt-28 sm:pt-36 max-w-225 mx-auto">
                <button onClick={() => navigate(-1)} className="self-start flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"><ArrowRight size={16} /> بازگشت</button>

                {/* header */}
                <div className="w-full rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col items-center sm:items-start sm:flex-row gap-6">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-surface-muted border border-border shrink-0 flex items-center justify-center">
                        {teacher.avatar ? <img src={teacher.avatar} alt={fullName} className="h-full w-full object-cover" /> : <User size={56} className="opacity-30 text-muted" />}
                    </div>
                    <div className="flex flex-col gap-3 text-center sm:text-right flex-1 min-w-0">
                        <H1 className="text-2xl sm:text-3xl">{fullName}</H1>
                        {(teacher.categories ?? []).length > 0 && (
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                                {(teacher.categories ?? []).map((cat) => (
                                    <span key={cat.id} className="inline-flex rounded-full bg-primary/10 text-primary border border-primary/15 px-2.5 py-1 text-xs font-medium">{cat.name}</span>
                                ))}
                            </div>
                        )}
                        {teacher.email && <a href={`mailto:${teacher.email}`} className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-sm text-muted hover:text-link"><Mail size={14} />{teacher.email}</a>}
                        {teacher.resumeFile && <a href={teacher.resumeFile} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-sm text-primary hover:underline"><FileText size={14} /> دانلود رزومه (PDF)</a>}
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-muted"><BookOpen size={14} />{courses.length} دوره</div>
                    </div>
                </div>

                {/* resume markdown */}
                <div className="w-full rounded-2xl border border-border bg-card p-6 sm:p-8">
                    <div className="mb-4 flex items-center gap-2 border-b border-border pb-3"><div className="h-6 w-1 rounded-full bg-primary" /><H2 className="text-base">رزومه و سوابق</H2></div>
                    {teacher.resume ? <MarkdownContent content={teacher.resume} /> : <P className="text-muted text-sm">رزومه‌ای ثبت نشده است.</P>}
                </div>

                {/* courses */}
                {courses.length > 0 && (
                    <div className="w-full flex flex-col gap-4">
                        <H2 className="text-xl">دوره‌های مدرس</H2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
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
            </Box>
        </MainLayout>
    );
}
