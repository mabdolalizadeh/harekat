import TopBarLayout from "../layouts/TopBarLayout.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import {motion} from "motion/react";
import Chip from "../components/ui/Chip.jsx";
import Box from "../components/ui/Box.jsx";
import {H1, H2, H3, P} from "../components/ui/Headings.jsx";
import {ArrowButton, PrimaryButton} from "../components/ui/Buttons.jsx";
import MarqueeLayout from "../layouts/MarqueeLayout.jsx";
import {useNavigate} from "react-router-dom";
import Img from "../components/ui/Img.jsx";
import {CourseCard, SubscriptionCard} from "../components/contents/Cards.jsx";
import SectionTag from "../components/ui/SectionTag.jsx";
import TeacherCard from "../components/contents/TeacherCard.jsx";
import StepCard from "../components/contents/StepCard.jsx";
import TestimonialCard from "../components/contents/TestimonialCard.jsx";
import {AccordionCard} from "../components/contents/Cards.jsx";
import {Mail, MapPin} from "lucide-react";
import Footer from "../components/ui/Footer.jsx";
import Slideshow from "../components/ui/Slideshow.jsx";
import { useEffect, useState } from "react";
import { storeApi } from "../services/api.js";

const fallbackHeroSlides = [
    { image: '', alt: '' },
];

const heroVariants = {
    hidden: {opacity: 0},
    visible: {
        opacity: 1,
        transition: {staggerChildren: 0.12, delayChildren: 0.15},
    },
};

const heroItem = {
    hidden: {opacity: 0, y: 24},
    visible: {
        opacity: 1,
        y: 0,
        transition: {duration: 0.6, ease: [0.2, 0, 0, 1]},
    },
};


const images = [];

const courses = [
    {
        title: 'طراحی با هوش مصنوعی',
        imgSrc: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
        category: 'هوش مصنوعی',
        level: 'مبتدی',
        duration: '۱۵ ساعت',
        courseType: 'حضوری',
        teacher: 'نیما جهان تیغ',
        price: '۵۰۰ هزار تومان',
        registrationStatus: 'درحال ثبت نام',
    },
    {
        title: 'برنامه‌نویسی پایتون',
        imgSrc: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
        category: 'برنامه‌نویسی',
        level: 'مبتدی',
        duration: '۲۰ ساعت',
        courseType: 'آنلاین',
        teacher: 'علی رضایی',
        price: '۷۵۰ هزار تومان',
        registrationStatus: 'درحال ثبت نام',
    },
    {
        title: 'طراحی رابط کاربری با Figma',
        imgSrc: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
        category: 'طراحی UI/UX',
        level: 'متوسط',
        duration: '۱۲ ساعت',
        courseType: 'حضوری',
        teacher: 'سارا محمدی',
        price: '۶۰۰ هزار تومان',
        registrationStatus: 'درحال ثبت نام',
    },
    {
        title: 'توسعه وب با React',
        imgSrc: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        category: 'برنامه‌نویسی',
        level: 'متوسط',
        duration: '۲۵ ساعت',
        courseType: 'آنلاین',
        teacher: 'محمد کریمی',
        price: '۹۵۰ هزار تومان',
        registrationStatus: 'به‌زودی',
    },
    {
        title: 'مبانی امنیت سایبری',
        imgSrc: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400',
        category: 'امنیت',
        level: 'مبتدی',
        duration: '۱۸ ساعت',
        courseType: 'حضوری',
        teacher: 'امیرحسین احمدی',
        price: '۸۰۰ هزار تومان',
        registrationStatus: 'درحال ثبت نام',
    },
    {
        title: 'ادیت و تدوین ویدیو',
        imgSrc: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400',
        category: 'تولید محتوا',
        level: 'مبتدی',
        duration: '۱۰ ساعت',
        courseType: 'آنلاین',
        teacher: 'مهدی نادری',
        price: '۴۵۰ هزار تومان',
        registrationStatus: 'تکمیل ظرفیت',
    },
    {
        title: 'دیجیتال مارکتینگ',
        imgSrc: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
        category: 'کسب‌وکار',
        level: 'متوسط',
        duration: '۱۶ ساعت',
        courseType: 'آنلاین',
        teacher: 'نگار اکبری',
        price: '۶۵۰ هزار تومان',
        registrationStatus: 'درحال ثبت نام',
    },
    {
        title: 'آموزش طراحی سایت با WordPress',
        imgSrc: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400',
        category: 'طراحی سایت',
        level: 'مبتدی',
        duration: '۱۴ ساعت',
        courseType: 'حضوری',
        teacher: 'رضا مرادی',
        price: '۵۵۰ هزار تومان',
        registrationStatus: 'درحال ثبت نام',
    },
];

const teachers = [
    {name: 'دکتر احمدی', role: 'برنامه‌نویسی و هوش مصنوعی', avatar: 'https://i.pravatar.cc/400?u=11'},
    {name: 'استاد محمدی', role: 'طراحی UI/UX', avatar: 'https://i.pravatar.cc/400?u=12'},
    {name: 'مهندس رضایی', role: 'توسعه وب', avatar: 'https://i.pravatar.cc/400?u=13'},
    {name: 'دکتر کریمی', role: 'امنیت سایبری', avatar: 'https://i.pravatar.cc/400?u=14'},
    {name: 'نیما جهان تیغ', role: 'هوش مصنوعی', avatar: 'https://i.pravatar.cc/400?u=15'},
    {name: 'سارا محمدی', role: 'طراحی رابط کاربری', avatar: 'https://i.pravatar.cc/400?u=16'},
    {name: 'مهدی نادری', role: 'تدوین و تولید محتوا', avatar: 'https://i.pravatar.cc/400?u=17'},
    {name: 'نگار اکبری', role: 'دیجیتال مارکتینگ', avatar: 'https://i.pravatar.cc/400?u=18'},
];

const steps = [
    {
        number: '۰۱',
        title: 'یادگیری عملی',
        description: 'از طریق پروژه‌های هفتگی و تکالیف عملی یاد می‌گیری، نه فقط با شنیدن درس.',
    },
    {
        number: '۰۲',
        title: 'نقد و بازخورد',
        description: 'جلسات نقد گروهی بهت کمک می‌کنه تصمیماتت رو توضیح بدی و کارت رو اصلاح کنی.',
    },
    {
        number: '۰۳',
        title: 'چندرسانه‌ای',
        description: 'پروژه‌ها از عکاسی تا برنامه‌نویسی حرکت می‌کنن؛ ابزار عوض می‌شه، روش می‌مونه.',
    },
    {
        number: '۰۴',
        title: 'راهبری فردی',
        description: 'گروه‌های کوچک و بازخورد مستقیم استادان، مسیر رشد شخصیت رو مشخص می‌کنه.',
    },
];

const testimonials = [
    {quote: 'این برنامه نحوه نگاه من به تصاویر رو کاملاً تغییر داد. دیگه فقط عکس نمی‌گیرم، کار تولید می‌کنم.', name: 'علی محمدی', role: 'عکاس', avatar: 'https://i.pravatar.cc/150?u=1'},
    {quote: 'قبل از حرکت مدیا با حس کار می‌کردم. الان هر تصمیمم پشتوانه فکری داره.', name: 'مریم رضایی', role: 'طراح گرافیک', avatar: 'https://i.pravatar.cc/150?u=2'},
    {quote: 'اولین جایی بود که اجازه دادم آزمایش کنم. این آزادی خیلی ارزشمند بود.', name: 'سارا احمدی', role: 'نقاش', avatar: 'https://i.pravatar.cc/150?u=3'},
    {quote: 'جلسات نقد خیلی سخت ولی عالی بود. یاد گرفتم چطور تصمیماتم رو توضیح بدم.', name: 'رضا کریمی', role: 'هنرمند چندرسانه‌ای', avatar: 'https://i.pravatar.cc/150?u=4'},
    {quote: 'از طراحی گرافیک اومدم اینجا. فهمیدم طراحی فقط ویژوال نیست، فکر و روش هم هست.', name: 'محمد حسینی', role: 'طراح', avatar: 'https://i.pravatar.cc/150?u=5'},
    {quote: 'حرکت مدیا فقط کار من رو بهتر نکرد، کل نگاهم به خلاقیت رو عوض کرد.', name: 'امیرحسین احمدی', role: 'عکاس', avatar: 'https://i.pravatar.cc/150?u=6'},
];

const faqItems = [
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

function mapApiCourse(course) {
    const teacher = course.teacher ? `${course.teacher.firstName ?? ''} ${course.teacher.lastName ?? ''}`.trim() : '';
    return { id: course.id, title: course.name, imgSrc: course.image, category: course.categories?.[0]?.name ?? '', level: course.level ?? '', duration: course.duration ?? '', courseType: course.typeOfAttendence ?? '', teacher: teacher || '—', price: course.price, salePrice: course.salePrice, registrationStatus: course.statusOfRegistration ?? '' };
}

function mapApiTeacher(teacher) {
    return { id: teacher.id, name: `${teacher.firstName ?? ''} ${teacher.lastName ?? ''}`.trim(), role: teacher.categories?.[0]?.name ?? 'مدرس', avatar: teacher.avatar };
}

function LevelSection({ id, eyebrow, title, courses: items }) {
    if (!items.length) return null;
    return <section id={id} className="w-full">
        <div className="mb-5 flex flex-col gap-1"><span className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{eyebrow}</span><H2 className="text-foreground">{title}</H2></div>
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map((course, index) => <motion.div key={course.id || course.title || index} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: index * 0.04 }}><CourseCard {...course} /></motion.div>)}</div>
    </section>;
}

export default function Landing() {
    const navigate = useNavigate();
    const [banners, setBanners] = useState([]);
    const [apiCourses, setApiCourses] = useState(null);
    const [apiTeachers, setApiTeachers] = useState(null);
    const [apiSubscriptions, setApiSubscriptions] = useState(null);
    const [sectionIds, setSectionIds] = useState({ capsule: 'capsule-courses', skill: 'skill-packages', subscriptions: 'subscriptions' });
    const [contentMap, setContentMap] = useState({});

    useEffect(() => {
        let cancelled = false;
        Promise.allSettled([storeApi.getBanners(), storeApi.getCourses(), storeApi.getTeachers(), storeApi.getSubscriptions(), storeApi.getCategories(), storeApi.getSiteContent()]).then((results) => {
            if (cancelled) return;
            const [bannerResult, courseResult, teacherResult, subscriptionResult, categoriesResult, contentResult] = results;
            if (bannerResult.status === 'fulfilled') setBanners((bannerResult.value.data ?? []).filter((banner) => banner.isActive !== false).map((banner) => ({ image: banner.imageUrl, tabletImage: banner.tabletImageUrl || banner.imageUrl, mobileImage: banner.mobileImageUrl || banner.tabletImageUrl || banner.imageUrl, link: banner.linkUrl || undefined, duration: banner.duration, alt: 'بنر صفحه اصلی' })));
            if (courseResult.status === 'fulfilled') setApiCourses((courseResult.value.data ?? []).filter((course) => course.isActive !== false));
            if (teacherResult.status === 'fulfilled') setApiTeachers((teacherResult.value.data ?? []).filter((teacher) => teacher.showOnLanding));
            if (subscriptionResult.status === 'fulfilled') setApiSubscriptions((subscriptionResult.value.data ?? []).filter((item) => item.isActive !== false));
            if (categoriesResult.status === 'fulfilled') {
                const categories = categoriesResult.value.data ?? [];
                const findSection = (pattern, fallback) => categories.find((category) => pattern.test(`${category.slug ?? ''} ${category.name ?? ''}`))?.slug || fallback;
                setSectionIds({ capsule: findSection(/capsule|کپسول/i, 'capsule-courses'), skill: findSection(/skill|مهارت|پکیج/i, 'skill-packages'), subscriptions: findSection(/subscription|اشتراک/i, 'subscriptions') });
            }
            if (contentResult.status === 'fulfilled') setContentMap(Object.fromEntries((contentResult.value.data ?? []).map((block) => [block.key, block])));
        });
        return () => { cancelled = true; };
    }, []);

    const heroSlides = banners.length > 0 ? banners : fallbackHeroSlides;
    const displayCourses = apiCourses?.length ? apiCourses.map(mapApiCourse) : courses;
    const displayTeachers = apiTeachers?.length ? apiTeachers.map(mapApiTeacher) : teachers;
    const apiCourseRows = apiCourses ?? [];
    const regularCourses = apiCourses?.length ? apiCourseRows.filter((course) => !course.kind || course.kind === 'regular').map(mapApiCourse) : displayCourses;
    const capsuleCourses = apiCourses?.length ? apiCourseRows.filter((course) => course.kind === 'capsule').map(mapApiCourse) : [];
    const skillPackages = apiCourses?.length ? apiCourseRows.filter((course) => course.kind === 'skill').map(mapApiCourse) : [];
    const baseCourses = regularCourses.filter((course) => course.level === 'پایه');
    const beginnerCourses = regularCourses.filter((course) => course.level === 'مقدماتی' || course.level === 'مبتدی' || !course.level);
    const advancedCourses = regularCourses.filter((course) => course.level === 'پیشرفته' || course.level === 'متوسط');
    const heroTitle = contentMap['hero-title']?.title || 'اینجا فقط یاد';
    const heroSubtitle = contentMap['hero-title']?.body || 'حرکت مدیا جایی برای یادگیری و تجربه در مرز هنر، رسانه و فناوری است؛ از عکاسی و تدوین و طراحی تا برنامه‌نویسی، طراحی سایت و هوش مصنوعی.';

    return (
        <MainLayout>
            <TopBarLayout />

            <div className="w-full pt-20 sm:pt-24">
                <Slideshow slides={heroSlides} autoPlay interval={3000} className="mx-auto aspect-[4/5] max-w-[calc(100%-2rem)] rounded-[var(--radius-2xl)] sm:aspect-[4/3] md:aspect-[16/9]" />
            </div>

            {/* ============ HERO ============ */}
            <Box id={'hero'} className={'relative pt-36 sm:pt-44 pb-14 sm:pb-20'}>
                <div className={'absolute inset-0 bg-background -z-10'}/>

                <motion.div
                    className={'flex flex-col items-center justify-center w-full md:w-[60%] gap-5 sm:gap-6 md:gap-8'}
                    variants={heroVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={heroItem}>
                        <Chip>مدرسه هنر و مهارت</Chip>
                    </motion.div>

                    <motion.div variants={heroItem}>
                        <H1 className={'text-[clamp(2.25rem,7vw,6rem)] text-center leading-[1.05] text-foreground'}>
                            {heroTitle}<br/>نمی‌گیری؛
                        </H1>
                    </motion.div>

                    <motion.div variants={heroItem}>
                        <P className={'text-center text-muted max-w-135 text-[clamp(1rem,2vw,1.25rem)]'}>
                            {heroSubtitle}
                        </P>
                    </motion.div>

                    <motion.div variants={heroItem}>
                        <ArrowButton onClick={() => navigate('/#courses')}>
                            بریم شروع کنیم!
                        </ArrowButton>
                    </motion.div>

                    <motion.div variants={heroItem} className={'overflow-hidden mt-10'}>
                        <MarqueeLayout>
                            {images.map((image, index) => (
                                <div className={'overflow-hidden'} key={index}>
                                    <Img src={image} className={'w-28 h-36 sm:w-40 sm:h-50'} groupHover={true}/>
                                </div>
                            ))}
                        </MarqueeLayout>
                    </motion.div>
                </motion.div>
            </Box>

            {/* ============ MANIFESTO ============ */}
            <Box className={'py-16 sm:py-24 gap-4 sm:gap-6'}>
                <SectionTag>درباره ما</SectionTag>
                <H2 className={'text-[clamp(2rem,4vw,3.5rem)] text-center text-foreground max-w-[700px]'}>
                    رسانه عوض می‌شه؛ هنرمند می‌مونه.
                </H2>
                <P className={'text-center text-muted max-w-[600px] text-[clamp(0.95rem,1.8vw,1.15rem)]'}>
                    در حرکت مدیا، ما متخصص یک ابزار خاص تربیت نمی‌کنیم. ما هنرمندانی رو آماده می‌کنیم که آزادانه بین فرمت‌ها حرکت کنن. اونچه این حوزه‌ها رو به هم وصل می‌کنه تکنیک نیست، آگاهیه — توانایی دیدن، تفسیر کردن و انتخاب آگاهانه.
                </P>
            </Box>

            {/* ============ FOUNDER CARD ============ */}
            <Box className={'py-10'}>
                <motion.div
                    initial={{opacity: 0, rotate: 0}}
                    whileInView={{opacity: 1, rotate: 2}}
                    viewport={{once: true}}
                    transition={{duration: 0.7, ease: [0.2, 0, 0, 1]}}
                    className={'bg-card border border-[var(--border)] rounded-[var(--radius-2xl)] p-8 max-w-full sm:max-w-[600px] w-full'}
                >
                    <div className={'flex flex-col gap-4'}>
                        <div className={'flex flex-col gap-0.5'}>
                            <H3 className={'text-foreground text-lg font-semibold'}>حرکت مدیا</H3>
                        </div>
                        <P className={'text-foreground/70 text-[clamp(0.9rem,1.5vw,1.05rem)] leading-relaxed'}>
                            ما هنرمندها رو آماده می‌کنیم که آزادانه بین فرمت‌ها حرکت کنن. اونچه این حوزه‌ها رو به هم وصل می‌کنه نه تکنیک، بلکه آگاهیه — توانایی دیدن، تفسیر کردن و انتخاب آگاهانه.
                        </P>
                    </div>
                </motion.div>
            </Box>

            {/* ============ COURSES / PROGRAMS ============ */}
            <Box id={'courses'} className={'py-16 sm:py-24 gap-4 sm:gap-6'}>
                <SectionTag>دوره‌ها</SectionTag>
                <H2 className={'text-[clamp(2rem,4vw,3.5rem)] text-center text-foreground max-w-[700px]'}>
                    مسیر هنری خودت رو کشف کن
                </H2>
                <div className="flex w-full flex-col gap-5">
                    <LevelSection id="base-courses" eyebrow="سطح پایه" title="شروع از پایه" courses={baseCourses} />
                    <LevelSection id="beginner-courses" eyebrow="سطح مقدماتی" title="ساختن مهارت‌های اصلی" courses={beginnerCourses} />
                    <LevelSection id="advanced-courses" eyebrow="سطح پیشرفته" title="برای قدم‌های جدی‌تر" courses={advancedCourses} />
                </div>
            </Box>

            {capsuleCourses.length > 0 && <Box id={'capsule-courses'} className="gap-4 py-12 sm:py-16">
                <SectionTag>دوره‌های کپسولی</SectionTag>
                <H2 className="text-center text-foreground">یادگیری کوتاه و کاربردی</H2>
                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{capsuleCourses.map((course) => <CourseCard key={course.id || course.title} {...course} />)}</div>
            </Box>}

            {skillPackages.length > 0 && <Box id={'skill-packages'} className="gap-4 py-12 sm:py-16">
                <SectionTag>پکیج‌های مهارتی</SectionTag>
                <H2 className="text-center text-foreground">مسیرهای کامل برای رشد</H2>
                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{skillPackages.map((course) => <CourseCard key={course.id || course.title} {...course} productType="course" />)}</div>
            </Box>}

            {apiSubscriptions?.length > 0 && <Box id={'subscriptions'} className="gap-4 py-12 sm:py-16">
                <SectionTag>اشتراک‌ها</SectionTag>
                <H2 className="text-center text-foreground">عضویت در مسیر یادگیری</H2>
                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{apiSubscriptions.map((item) => <SubscriptionCard key={item.id} {...item} />)}</div>
            </Box>}

            {/* ============ MENTORS ============ */}
            {/* <Box id={'mentors'} className={'py-16 sm:py-24 gap-4 sm:gap-6'}>
                <SectionTag>اساتید</SectionTag>
                <H2 className={'text-[clamp(2rem,4vw,3.5rem)] text-center text-foreground max-w-[700px]'}>
                    از هنرمندان فعال یاد بگیر
                </H2>
                <P className={'text-center text-muted max-w-[600px] text-[clamp(0.95rem,1.8vw,1.15rem)]'}>
                    اساتیدی با تجربه‌های متفاوت، با روش، توجه و بلندمدت‌اندیشی مشترک
                </P>
                <PrimaryButton onClick={() => navigate('/contact-us')}>
                    به عنوان استاد بپیوندید
                </PrimaryButton>

                <div className={'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 w-full mt-4'}>
                    {displayTeachers.map((teacher, index) => (
                        <motion.div
                            key={index}
                            initial={{opacity: 0, y: 24}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true}}
                            transition={{duration: 0.5, delay: index * 0.06}}
                        >
                            <TeacherCard
                                name={teacher.name}
                                role={teacher.role}
                                avatar={teacher.avatar}
                                onClick={() => teacher.id && (window.location.href = `/teachers/${teacher.id}`)}
                                className={teacher.id ? 'cursor-pointer' : ''}
                            />
                        </motion.div>
                    ))}
                </div>
            </Box> */}

            {/* ============ WHO IT'S FOR ============ */}
            <Box id={'who'} className={'py-16 sm:py-24 gap-4 sm:gap-6'}>
                <SectionTag>برای کیه؟</SectionTag>
                <H2 className={'text-[clamp(2rem,4vw,3.5rem)] text-center text-foreground max-w-[700px]'}>
                    این مدرسه برای چه کسی مناسبه؟
                </H2>

                <div className={'grid grid-cols-1 sm:grid-cols-2 gap-5 w-full mt-4'}>
                    {[
                        {title: 'طراحان', desc: 'طراحانی که می‌خوان فراتر از ابزار فکر کنن و روش‌شناسی یاد بگیرن.'},
                        {title: 'عکاسان', desc: 'عکاسانی که می‌خوان عکاسیشون فقط فنی نباشه، بلکه مفهومی و هنری باشه.'},
                        {title: 'هنرمندان', desc: 'هنرمندانی که می‌خوان بین رسانه‌ها حرکت کنن و زبان بصری خودشون رو پیدا کنن.'},
                        {title: 'خلاقان', desc: 'هر کسی که احساس می‌کنه خلاقیتش نیاز به ساختار و هدایت داره.'},
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{opacity: 0, y: 24}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true}}
                            transition={{duration: 0.5, delay: index * 0.08}}
                            className={'bg-card border border-[var(--border)] rounded-[var(--radius-xl)] p-6'}
                        >
                            <H3 className={'text-foreground text-lg mb-2'}>{item.title}</H3>
                            <P className={'text-muted text-sm leading-relaxed'}>{item.desc}</P>
                        </motion.div>
                    ))}
                </div>
            </Box>

            {/* ============ CTA ============ */}
            <Box className={'py-16 sm:py-24 gap-4 sm:gap-6'}>
                <SectionTag>تماس با ما</SectionTag>
                <H2 className={'text-[clamp(2rem,4vw,3.5rem)] text-center text-foreground max-w-[700px]'}>
                    درباره دوره‌ها با ما صحبت کن
                </H2>
                <ArrowButton onClick={() => navigate('/contact-us')}>
                    تماس با ما
                </ArrowButton>
            </Box>

            {/* ============ HOW IT WORKS ============ */}
            <Box id={'how-it-works'} className={'py-16 sm:py-24 gap-4 sm:gap-6'}>
                <SectionTag>نحوه عملکرد</SectionTag>
                <H2 className={'text-[clamp(2rem,4vw,3.5rem)] text-center text-foreground max-w-[700px]'}>
                    یادگیری چطور اتفاق می‌افته
                </H2>

                <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full mt-4'}>
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{opacity: 0, y: 24}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true}}
                            transition={{duration: 0.5, delay: index * 0.08}}
                        >
                            <StepCard
                                number={step.number}
                                title={step.title}
                                description={step.description}
                            />
                        </motion.div>
                    ))}
                </div>
            </Box>

            {/* ============ TESTIMONIALS ============ */}
            <Box id={'reviews'} className={'py-16 sm:py-24 gap-4 sm:gap-6'}>
                <SectionTag>نظرات دانش‌آموزان</SectionTag>
                <H2 className={'text-[clamp(2rem,4vw,3.5rem)] text-center text-foreground max-w-[700px]'}>
                    دانش‌آموزان ما چه می‌گن
                </H2>

                <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full mt-4'}>
                    {testimonials.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{opacity: 0, y: 24}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true}}
                            transition={{duration: 0.5, delay: index * 0.06}}
                        >
                            <TestimonialCard
                                quote={item.quote}
                                name={item.name}
                                role={item.role}
                                avatar={item.avatar}
                            />
                        </motion.div>
                    ))}
                </div>
            </Box>

            {/* ============ FAQ ============ */}
            <Box className={'py-16 sm:py-24 gap-4 sm:gap-6'}>
                <SectionTag>سوالات متداول</SectionTag>
                <H2 className={'text-[clamp(2rem,4vw,3.5rem)] text-center text-foreground max-w-[700px]'}>
                    سوالات درباره ثبت‌نام
                </H2>
                <P className={'text-center text-muted max-w-[600px] text-[clamp(0.95rem,1.8vw,1.15rem)]'}>
                    جزئیات عملی درباره ثبت‌نام، برنامه زمانی و نحوه برگزاری دوره‌ها
                </P>

                <div className={'flex flex-col gap-3 w-full max-w-[800px] mt-4'}>
                    {faqItems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{opacity: 0, y: 24}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true}}
                            transition={{duration: 0.5, delay: index * 0.06}}
                        >
                            <AccordionCard
                                title={item.title}
                                content={item.content}
                                className={'bg-card'}
                            />
                        </motion.div>
                    ))}
                </div>
            </Box>

            {/* ============ CONTACT ============ */}
            <Box className={'py-16 sm:py-24 gap-4 sm:gap-6'}>
                <SectionTag>ارتباط</SectionTag>
                <H2 className={'text-[clamp(2rem,4vw,3.5rem)] text-center text-foreground max-w-[700px]'}>
                    سوالی داری یا می‌خوای ثبت‌نام کنی؟
                </H2>
                <P className={'text-center text-muted max-w-[600px] text-[clamp(0.95rem,1.8vw,1.15rem)]'}>
                    خوشحالیم درباره دوره‌ها، زمان‌بندی و تناسب با شرایطت صحبت کنیم
                </P>

                <div className={'flex flex-col sm:flex-row gap-8 mt-4 items-center'}>
                    <a
                        href="mailto:info@harekatmedia.com"
                        className={'flex items-center gap-3 text-foreground/70 hover:text-foreground transition-colors'}
                    >
                        <Mail size={20}/>
                        <span className={'text-sm'}>info@harekatmedia.com</span>
                    </a>
                    <div className={'flex items-center gap-3 text-muted'}>
                        <MapPin size={20}/>
                        <span className={'text-sm'}>تهران، ایران</span>
                    </div>
                </div>
            </Box>

            <Footer sectionIds={sectionIds} copyright={contentMap['footer-copyright']?.body || '© ۱۴۰۵ حرکت مدیا'} socials={Object.values(contentMap).filter((item) => item.key?.startsWith('social-'))} />
        </MainLayout>
    )
}
