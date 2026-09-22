import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import MainLayout from "../layouts/MainLayout.jsx";
import TopBarLayout from "../layouts/TopBarLayout.jsx";
import SmoothScrollProvider from "../components/landing/SmoothScrollProvider.jsx";
import SectionTag from "../components/ui/SectionTag.jsx";
import { PrimaryButton } from "../components/ui/Buttons.jsx";
import { Mail, MapPin, Phone, Clock, Send, Sparkles, CheckCircle2, MessageSquare } from "lucide-react";
import { TextField } from "@mui/material";

const muiInputSx = {
    width: '100%',
    direction: 'rtl',
    '& .MuiOutlinedInput-root': {
        borderRadius: '1.25rem',
        backgroundColor: 'var(--color-surface-muted, rgba(255, 255, 255, 0.04))',
        color: 'var(--foreground)',
        fontFamily: 'inherit',
        fontSize: '0.9rem',
        transition: 'all 0.2s ease',
        '& fieldset': {
            borderColor: 'var(--border)',
            borderWidth: '1.5px',
        },
        '&:hover fieldset': {
            borderColor: 'var(--primary)',
        },
        '&.Mui-focused fieldset': {
            borderColor: 'var(--primary)',
            borderWidth: '2px',
        },
        '& input': {
            color: 'var(--foreground)',
            fontFamily: 'inherit',
            padding: '14px 16px',
            textAlign: 'right',
            '&::placeholder': {
                color: 'var(--muted)',
                opacity: 0.9,
            },
        },
        '& textarea': {
            color: 'var(--foreground)',
            fontFamily: 'inherit',
            padding: '6px 4px',
            lineHeight: 1.7,
            textAlign: 'right',
            '&::placeholder': {
                color: 'var(--muted)',
                opacity: 0.9,
            },
        },
    },
    '& .MuiInputLabel-root': {
        color: 'var(--muted)',
        fontFamily: 'inherit',
        fontSize: '0.875rem',
        right: '1.75rem',
        left: 'auto',
        transformOrigin: 'top right',
        '&.Mui-focused': {
            color: 'var(--primary)',
        },
    },
};

export default function ContactUs() {
    const pageRef = useRef(null);
    const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);

    useEffect(() => {
        const el = pageRef.current;
        if (!el) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                el.querySelectorAll('.contact-fade-up'),
                { opacity: 0, y: 35 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.12,
                    ease: 'power3.out',
                }
            );
        }, pageRef);

        return () => ctx.revert();
    }, []);

    const handleChange = (e) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formState.name || !formState.email || !formState.message) return;
        setSent(true);
        setTimeout(() => {
            setSent(false);
            setFormState({ name: '', email: '', subject: '', message: '' });
        }, 4000);
    };

    return (
        <SmoothScrollProvider>
            <MainLayout title={'تماس با ما'} sectionIds={null} contentMap={null}>
                <TopBarLayout />

                <div ref={pageRef} className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-28 flex flex-col items-center gap-14">
                    {/* Header */}
                    <div className="contact-fade-up flex flex-col items-center gap-4 text-center max-w-2xl">
                        <SectionTag>ارتباط مستقیم</SectionTag>
                        <h1 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-extrabold text-foreground leading-[1.1]">
                            با ما در ارتباط باش
                        </h1>
                        <p className="text-muted text-base sm:text-lg leading-relaxed font-normal">
                            خوشحالیم درباره دوره‌ها، شرایط ثبت‌نام، همکاری یا هر سوالی که داری گپ بزنیم.
                        </p>
                    </div>

                    {/* Main Grid: Info Cards on one side, Interactive Form on the other */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
                        {/* Right: Contact channels & Working hours */}
                        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
                            <div className="contact-fade-up bg-card/75 backdrop-blur-xl border border-border/80 rounded-3xl p-7 flex flex-col gap-6 shadow-xl shadow-black/10">
                                <div className="flex items-center gap-3 pb-4 border-b border-border/60">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                        <MessageSquare size={20} />
                                    </span>
                                    <div>
                                        <h2 className="text-base font-bold text-foreground">راه‌های ارتباطی</h2>
                                        <p className="text-xs text-muted">همیشه پاسخگوی پیام‌های شما هستیم</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <a
                                        href="mailto:info@schoolharekat.ir"
                                        className="group flex items-center gap-4 p-4 rounded-2xl bg-surface-muted/60 hover:bg-surface-muted border border-border/50 transition-all duration-200"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                            <Mail size={18} />
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-xs text-muted">ایمیل رسمی</span>
                                            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                                info@schoolharekat.ir
                                            </span>
                                        </div>
                                    </a>

                                    <a
                                        href="tel:+982112345678"
                                        className="group flex items-center gap-4 p-4 rounded-2xl bg-surface-muted/60 hover:bg-surface-muted border border-border/50 transition-all duration-200"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                            <Phone size={18} />
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-xs text-muted">شماره تماس</span>
                                            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors dir-ltr">
                                                ۰۲۱ - ۱۲۳۴ ۵۶۷۸
                                            </span>
                                        </div>
                                    </a>

                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-muted/60 border border-border/50">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <MapPin size={18} />
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-xs text-muted">آدرس حضوری</span>
                                            <span className="text-sm font-semibold text-foreground">
                                                تهران، خیابان ولیعصر
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Working Hours Card */}
                            <div className="contact-fade-up bg-card/75 backdrop-blur-xl border border-border/80 rounded-3xl p-7 flex flex-col gap-5 shadow-xl shadow-black/10">
                                <div className="flex items-center gap-3 pb-3 border-b border-border/60">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                        <Clock size={18} />
                                    </span>
                                    <h3 className="text-sm font-bold text-foreground">ساعات کاری و پشتیبانی</h3>
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    {[
                                        { day: 'شنبه تا چهارشنبه', time: '۹ صبح تا ۶ عصر' },
                                        { day: 'پنجشنبه‌ها', time: '۹ صبح تا ۱ ظهر' },
                                        { day: 'جمعه و تعطیلات رسمی', time: 'تعطیل (پاسخگویی از طریق ایمیل)' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-xs sm:text-sm py-1 border-b border-border/30 last:border-0">
                                            <span className="text-muted font-medium">{item.day}</span>
                                            <span className="text-foreground font-semibold">{item.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Left: Interactive Form */}
                        <div className="contact-fade-up lg:col-span-7 bg-card/85 backdrop-blur-2xl border-2 border-border/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/15 w-full">
                            {sent ? (
                                <div className="flex flex-col items-center justify-center text-center gap-4 py-16">
                                    <CheckCircle2 size={56} className="text-success-500 animate-bounce" />
                                    <h3 className="text-2xl font-extrabold text-foreground">پیامت با موفقیت ارسال شد!</h3>
                                    <p className="text-muted text-sm max-w-sm">
                                        تیم پشتیبانی مدرسه حرکت به زودی از طریق ایمیل با شما تماس خواهد گرفت.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-2xl font-bold text-foreground">ارسال پیام مستقیم</h2>
                                        <p className="text-xs sm:text-sm text-muted">فرم زیر را تکمیل کنید تا کارشناسان ما پاسخ دهند</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-foreground/90">نام و نام‌خانوادگی</label>
                                            <TextField
                                                required
                                                fullWidth
                                                name="name"
                                                value={formState.name}
                                                onChange={handleChange}
                                                placeholder="نام و نام‌خانوادگی خود را وارد کنید"
                                                variant="outlined"
                                                sx={muiInputSx}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-foreground/90">آدرس ایمیل</label>
                                            <TextField
                                                required
                                                fullWidth
                                                type="email"
                                                name="email"
                                                value={formState.email}
                                                onChange={handleChange}
                                                placeholder="youremail@example.com"
                                                variant="outlined"
                                                sx={muiInputSx}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-foreground/90">موضوع پیام</label>
                                        <TextField
                                            required
                                            fullWidth
                                            name="subject"
                                            value={formState.subject}
                                            onChange={handleChange}
                                            placeholder="موضوع مشاوره یا پرسش شما..."
                                            variant="outlined"
                                            sx={muiInputSx}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-foreground/90">متن پیام</label>
                                        <TextField
                                            required
                                            fullWidth
                                            multiline
                                            rows={5}
                                            name="message"
                                            value={formState.message}
                                            onChange={handleChange}
                                            placeholder="پیام یا سوال خود درباره دوره‌ها را با جزییات بنویسید..."
                                            variant="outlined"
                                            sx={muiInputSx}
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <PrimaryButton
                                            type="submit"
                                            className="w-full sm:w-auto px-8 py-3.5 text-base font-bold shadow-lg shadow-primary/25 flex flex-row items-center justify-center gap-3 cursor-pointer"
                                        >
                                            <span className="leading-none">ارسال پیام به حرکت</span>
                                            <Send size={18} className="shrink-0" />
                                        </PrimaryButton>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </MainLayout>
        </SmoothScrollProvider>
    );
}
