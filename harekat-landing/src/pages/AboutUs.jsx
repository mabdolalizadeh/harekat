import MainLayout from "../layouts/MainLayout.jsx";
import TopBarLayout from "../layouts/TopBarLayout.jsx";
import { motion } from "motion/react";
import Box from "../components/ui/Box.jsx";
import { H1, H2, H3, P } from "../components/ui/Headings.jsx";
import SectionTag from "../components/ui/SectionTag.jsx";
import { ArrowButton } from "../components/ui/Buttons.jsx";
import { useNavigate } from "react-router-dom";
import { storeApi } from "../services/api.js";
import { useState, useEffect } from "react";

const values = [
    { number: '۰۱', title: 'عملگرایی', desc: 'یادگیری از طریق انجام دادن، نه فقط شنیدن. هر دوره حول پروژه‌های واقعی ساخته شده.' },
    { number: '۰۲', title: 'نقدپذیری', desc: 'ما باور داریم رشد از بازخورد صادقانه شروع می‌شه. جلسات نقد بخش جدایی‌ناپذیر یادگیریه.' },
    { number: '۰۳', title: 'چندرسانه‌ای', desc: 'هنرمند امروز نباید در یک ابزار زندانی بشه. ما بین رسانه‌ها حرکت می‌کنیم.' },
    { number: '۰۴', title: 'فردیت', desc: 'هر هنرمند مسیر منحصربه‌فرد خودش رو داره. ما مسیر رو هموار می‌کنیم، مقصد رو تعیین نمی‌کنیم.' },
];

export default function AboutUs() {
    const navigate = useNavigate();
    const [sectionIds, setSectionIds] = useState({ capsule: 'capsule-courses', skill: 'skill-packages', subscriptions: 'subscriptions' });
    const [contentMap, setContentMap] = useState({});

    useEffect(() => {
        let cancelled = false;
        Promise.allSettled([storeApi.getCategories(), storeApi.getSiteContent()]).then((results) => {
            if (cancelled) return;
            const [categoriesResult, contentResult] = results;
            if (categoriesResult.status === 'fulfilled') {
                const categories = categoriesResult.value.data ?? [];
                const findSection = (pattern, fallback) => categories.find((category) => pattern.test(`${category.slug ?? ''} ${category.name ?? ''}`))?.slug || fallback;
                setSectionIds({ capsule: findSection(/capsule|کپسول/i, 'capsule-courses'), skill: findSection(/skill|مهارت|پکیج/i, 'skill-packages'), subscriptions: findSection(/subscription|اشتراک/i, 'subscriptions') });
            }
            if (contentResult.status === 'fulfilled') setContentMap(Object.fromEntries((contentResult.value.data ?? []).map((block) => [block.key, block])));
        });
        return () => { cancelled = true; };
    }, []);

    return (
        <MainLayout title={'درباره ما'} sectionIds={sectionIds} contentMap={contentMap}>
            <TopBarLayout />

            {/*hero*/}
            <Box className={'pt-40 pb-20 gap-6'}>
                <SectionTag>درباره ما</SectionTag>
                <H1 className={'text-[clamp(2.5rem,5vw,4.5rem)] text-center text-foreground max-w-[800px] leading-[1.1]'}>
                    مدرسه حرکت کجاست و<br />چرا وجود داره؟
                </H1>
                <P className={'text-center text-muted max-w-[580px] text-[clamp(0.95rem,1.8vw,1.15rem)]'}>
                    ما یک مدرسه هنر و مهارت هستیم که مرز بین هنر، رسانه و فناوری رو جابه‌جا می‌کنیم.
                </P>
            </Box>

            {/*story*/}
            <Box className={'py-20 gap-10 w-full max-w-[800px] mx-auto'}>
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className={'flex flex-col gap-6'}
                >
                    <P className={'text-foreground/70 text-[clamp(1rem,1.8vw,1.15rem)] leading-relaxed'}>
                        مدرسه حرکت از یک سوال ساده شروع شد: چرا هنرمندها باید مجبور باشن خودشون رو فقط در یک دسته جا بدن؟
                        عکاس، طراح، برنامه‌نویس — انگار هر کسی باید یکی رو انتخاب کنه.
                    </P>
                    <P className={'text-foreground/70 text-[clamp(1rem,1.8vw,1.15rem)] leading-relaxed'}>
                        ما فکر می‌کنیم هنرمند واقعی کسیه که بتونه بین فرمت‌ها حرکت کنه. از عکاسی تا کدنویسی، از تدوین
                        ویدیو تا طراحی رابط کاربری — ابزار عوض می‌شه، ولی تفکر خلاق پشت همه اونها مشترکه.
                    </P>
                    <P className={'text-foreground/70 text-[clamp(1rem,1.8vw,1.15rem)] leading-relaxed'}>
                        به همین دلیل دوره‌های ما طوری طراحی شدن که هم مهارت فنی یاد بدی، هم تفکر انتقادی و خلاقیت رو
                        پرورش بدیم. ما متخصص یک ابزار تربیت نمی‌کنیم — ما هنرمند تربیت می‌کنیم.
                    </P>
                </motion.div>
            </Box>

            {/*values*/}
            <Box className={'py-20 gap-8 w-full max-w-[1000px] mx-auto'}>
                <div className={'flex flex-col items-center gap-4 mb-4'}>
                    <SectionTag>ارزش‌ها</SectionTag>
                    <H2 className={'text-[clamp(2rem,4vw,3rem)] text-center text-foreground max-w-[600px]'}>
                        چه چیزی ما رو متفاوت می‌کنه
                    </H2>
                </div>

                <div className={'grid grid-cols-1 sm:grid-cols-2 gap-6 w-full'}>
                    {values.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                            className={'bg-card border border-[var(--border)] rounded-[var(--radius-xl)] p-6'}
                        >
                            <span className={'text-4xl font-extrabold leading-none'}>{item.number}</span>
                            <H3 className={'text-foreground text-lg mt-3 mb-2'}>{item.title}</H3>
                            <P className={'text-muted text-sm leading-relaxed'}>{item.desc}</P>
                        </motion.div>
                    ))}
                </div>
            </Box>

            {/*team*/}
            {/* {apiTeachers &&
                <Box className={'py-20 gap-8 w-full max-w-[1000px] mx-auto'}>
                    <div className={'flex flex-col items-center gap-4 mb-4'}>
                        <SectionTag>تیم ما</SectionTag>
                        <H2 className={'text-[clamp(2rem,4vw,3rem)] text-center text-foreground max-w-[600px]'}>
                            اساتید و همکاران
                        </H2>
                        <P className={'text-center text-muted max-w-[500px] text-sm'}>
                            تیمی از هنرمندان و متخصصان با تجربه‌های متفاوت که با روش مشترک کار می‌کنن.
                        </P>
                    </div>

                    <div className={'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 w-full mt-4'}>
                        {apiTeachers.map((teacher, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.06 }}
                            >
                                <TeacherCard
                                    name={teacher.firstName + ' ' + teacher.lastName}
                                    role={teacher.role}
                                    avatar={teacher.avatar}
                                    onClick={() => teacher.id && (window.location.href = `/teachers/${teacher.id}`)}
                                    className={teacher.id ? 'cursor-pointer' : ''}
                                />
                            </motion.div>
                        ))}
                    </div>
                </Box>
            } */}

            {/*stats*/}
            <Box className={'py-20 gap-8 w-full'}>
                <div className={'grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-[800px] mx-auto'}>
                    {[
                        { number: '+۲۰۰', label: 'دانش‌آموز' },
                        { number: '+۳۰', label: 'دوره فعال' },
                        { number: '+۱۵', label: 'استاد' },
                        { number: '%۹۵', label: 'رضایتمندی' },
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                            className={'text-center flex flex-col gap-1'}
                        >
                            <span className={'text-3xl font-extrabold text-foreground'}>{item.number}</span>
                            <span className={'text-muted text-sm'}>{item.label}</span>
                        </motion.div>
                    ))}
                </div>
            </Box>

            {/*cta*/}
            <Box className={'py-24 gap-6'}>
                <H2 className={'text-[clamp(2rem,4vw,3rem)] text-center text-foreground max-w-[600px]'}>
                    آماده‌ای شروع کنی؟
                </H2>
                <ArrowButton onClick={() => navigate('/#courses')}>
                    دوره‌ها رو ببین
                </ArrowButton>
            </Box>
        </MainLayout>
    )
}
