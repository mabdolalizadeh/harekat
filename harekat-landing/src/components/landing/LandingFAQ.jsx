import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionTag from '../ui/SectionTag.jsx';
import { AccordionCard } from '../contents/Cards.jsx';

const defaultFaqItems = [
    {
        title: 'آیا برای شرکت در دوره‌ها نیاز به تجربه قبلی هست؟',
        content: 'خیر. بعضی از دانش‌آموزان از رشته طراحی یا عکاسی اومدن، بعضی‌ها از کاملاً زمینه‌های دیگه. مهم کنجکاوی و انگیزه یادگیریه.',
    },
    {
        title: 'آیا مدرک دریافت می‌کنم؟',
        content: 'بله، پس از اتمام موفقیت‌آمیز دوره و ارائه پروژه پایانی، گواهینامه پایان دوره دریافت می‌کنید.',
    },
    {
        title: 'آیا دوره‌ها تمام‌وقت هستند؟',
        content: 'خیر، دوره‌ها به صورت پاره‌وقت و با انعطاف‌پذیری بالا برگزار می‌شن تا بتونید در کنار کار یا تحصیل شرکت کنید.',
    },
    {
        title: 'آیا دوره‌ها آنلاین هستند یا حضوری؟',
        content: 'هر دو نوع دوره داریم. بعضی دوره‌ها کاملاً آنلاین، بعضی حضوری و بعضی ترکیبی هستند.',
    },
    {
        title: 'آیا می‌تونم بیشتر از یک دوره رو همزمان ثبت‌نام کنم؟',
        content: 'بله، در صورت تطابق برنامه زمانی، امکان ثبت‌نام همزمان در چند دوره وجود داره.',
    },
];

export default function LandingFAQ({ faqItems = defaultFaqItems }) {
    const sectionRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        const list = listRef.current;
        if (!list) return;

        const items = list.querySelectorAll('.faq-accordion-item');

        const ctx = gsap.context(() => {
            gsap.fromTo(
                items,
                { opacity: 0, y: 25 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.08,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: list,
                        start: 'top 85%',
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, [faqItems]);

    return (
        <section
            id="faq"
            ref={sectionRef}
            className="w-full py-16 sm:py-28 flex flex-col items-center gap-8 px-4"
        >
            <div className="flex flex-col items-center gap-4 text-center">
                <SectionTag>سوالات متداول</SectionTag>
                <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] font-extrabold text-foreground max-w-[700px] leading-tight">
                    سوالات درباره ثبت‌نام
                </h2>
                <p className="text-muted max-w-[600px] text-[clamp(0.95rem,1.8vw,1.15rem)] leading-relaxed">
                    جزئیات عملی درباره ثبت‌نام، برنامه زمانی و نحوه برگزاری دوره‌ها
                </p>
            </div>

            <div
                ref={listRef}
                className="flex flex-col gap-3.5 w-full max-w-[820px] mt-4"
            >
                {faqItems.map((item, index) => (
                    <div key={index} className="faq-accordion-item">
                        <AccordionCard
                            title={item.title}
                            content={item.content}
                            className="bg-card/85 backdrop-blur-sm border border-border/80 hover:border-primary/40 rounded-2xl transition-colors shadow-sm"
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
