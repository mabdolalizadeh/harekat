import TopBarLayout from "../layouts/TopBarLayout.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import {motion} from "motion/react";
import Chip from "../components/ui/Chip.jsx";
import Box from "../components/ui/Box.jsx";
import {H1, H2, H3, P} from "../components/ui/Headings.jsx";
import {ArrowButton, PrimaryButton} from "../components/ui/Buttons.jsx";
import MarqueeLayout from "../layouts/MarqueeLayout.jsx";
import {useNavigate} from "react-router-dom";
import cameraImg from '../assets/marquee/black-camera-lens-brown-wooden-table.jpg';
import lightImg from '../assets/marquee/bright-flashlight-beam-cutting-through-dark-background-with-dramatic-lighting-effect.jpg';
import micImg from '../assets/marquee/closeup-shot-condenser-microphone-with-pop-filter-blurred.jpg'
import codeImg from '../assets/marquee/side-shot-code-editor-using-react-js.jpg';
import Img from "../components/ui/Img.jsx";
import {CourseCard} from "../components/contents/Cards.jsx";
import aiImg from '../assets/courses/bwink_med_10_single_03.jpg';
import pythonImg from '../assets/courses/c2322d1b-a818-4a77-8048-016248b8f014.jpg';
import figmaImg from '../assets/courses/5765393.jpg';
import cyberImg from '../assets/courses/cyber-security-concept-digital-art.jpg';
import videoImg from '../assets/courses/1910.i309.028.F.m004.c7.cinema film production realistic transparent-03.jpg';
import marketingImg from '../assets/courses/32718.jpg';
import wordpressImg from '../assets/courses/4827607.jpg';
import reactImg from '../assets/courses/side-shot-code-editor-using-react-js.jpg';
import SectionTag from "../components/ui/SectionTag.jsx";
import TeacherCard from "../components/contents/TeacherCard.jsx";
import StepCard from "../components/contents/StepCard.jsx";
import TestimonialCard from "../components/contents/TestimonialCard.jsx";
import {AccordionCard} from "../components/contents/Cards.jsx";
import {Mail, MapPin} from "lucide-react";
import footerLogo from '../assets/logo.png';

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

const fadeUp = {
    hidden: {opacity: 0, y: 24},
    visible: {
        opacity: 1,
        y: 0,
        transition: {duration: 0.6, ease: [0.2, 0, 0, 1]},
    },
};

const images = [cameraImg, lightImg, micImg, codeImg];

const courses = [
    {
        title: 'طراحی با هوش مصنوعی',
        imgSrc: aiImg,
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
        imgSrc: pythonImg,
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
        imgSrc: figmaImg,
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
        imgSrc: reactImg,
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
        imgSrc: cyberImg,
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
        imgSrc: videoImg,
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
        imgSrc: marketingImg,
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
        imgSrc: wordpressImg,
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
    {quote: 'این برنامه نحوه نگاه من به تصاویر رو کاملاً تغییر داد. دیگه فقط عکس نمی‌گیرم، کار تولید می‌کنم.', name: 'علی محمدی', role: 'عکاس'},
    {quote: 'قبل از حرکت مدیا با حس کار می‌کردم. الان هر تصمیمم پشتوانه فکری داره.', name: 'مریم رضایی', role: 'طراح گرافیک'},
    {quote: 'اولین جایی بود که اجازه دادم آزمایش کنم. این آزادی خیلی ارزشمند بود.', name: 'سارا احمدی', role: 'نقاش'},
    {quote: 'جلسات نقد خیلی سخت ولی عالی بود. یاد گرفتم چطور تصمیماتم رو توضیح بدم.', name: 'رضا کریمی', role: 'هنرمند چندرسانه‌ای'},
    {quote: 'از طراحی گرافیک اومدم اینجا. فهمیدم طراحی فقط ویژوال نیست، فکر و روش هم هست.', name: 'محمد حسینی', role: 'طراح'},
    {quote: 'حرکت مدیا فقط کار من رو بهتر نکرد، کل نگاهم به خلاقیت رو عوض کرد.', name: 'امیرحسین احمدی', role: 'عکاس'},
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

const footerLinks = [
    {text: 'خانه', link: '/#hero'},
    {text: 'دوره‌ها', link: '/#courses'},
    {text: 'تولیدات', link: '/#products'},
    {text: 'درباره ما', link: '/about-us'},
    {text: 'تماس با ما', link: '/contact-us'},
];

export default function Landing() {
    const navigate = useNavigate();

    return (
        <MainLayout>
            <TopBarLayout />

            {/* ============ HERO ============ */}
            <Box id={'hero'} className={'relative pt-44 pb-20'}>
                <div className={'absolute inset-0 bg-ink-950 -z-10'}/>

                <motion.div
                    className={'flex flex-col items-center justify-center w-full md:w-[60%] gap-6 md:gap-8'}
                    variants={heroVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={heroItem}>
                        <Chip>مدرسه هنر و مهارت</Chip>
                    </motion.div>

                    <motion.div variants={heroItem}>
                        <H1 className={'text-[clamp(3rem,7vw,6rem)] text-center leading-[1.05] text-ink-50'}>
                            اینجا فقط یاد<br/>نمی‌گیری؛
                        </H1>
                    </motion.div>

                    <motion.div variants={heroItem}>
                        <P className={'text-center text-ink-400 max-w-[540px] text-[clamp(1rem,2vw,1.25rem)]'}>
                            حرکت مدیا جایی برای یادگیری و تجربه در مرز هنر، رسانه و فناوری است؛ از عکاسی و تدوین و طراحی تا برنامه‌نویسی، طراحی سایت و هوش مصنوعی.
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
                                    <Img src={image} className={'w-40 h-50'} groupHover={true}/>
                                </div>
                            ))}
                        </MarqueeLayout>
                    </motion.div>
                </motion.div>
            </Box>

            {/* ============ MANIFESTO ============ */}
            <Box className={'py-24 gap-6'}>
                <SectionTag>درباره ما</SectionTag>
                <H2 className={'text-[clamp(2rem,4vw,3.5rem)] text-center text-ink-50 max-w-[700px]'}>
                    رسانه عوض می‌شه؛ هنرمند می‌مونه.
                </H2>
                <P className={'text-center text-ink-400 max-w-[600px] text-[clamp(0.95rem,1.8vw,1.15rem)]'}>
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
                    className={'bg-ink-900 border border-ink-50/10 rounded-[var(--radius-2xl)] p-8 max-w-[600px] w-full'}
                >
                    <div className={'flex flex-col gap-4'}>
                        <div className={'flex flex-col gap-0.5'}>
                            <H3 className={'text-ink-50 text-lg font-semibold'}>نیما جهان تیغ</H3>
                            <span className={'text-ink-500 text-sm'}>بنیان‌گذار حرکت مدیا</span>
                        </div>
                        <P className={'text-ink-300 text-[clamp(0.9rem,1.5vw,1.05rem)] leading-relaxed'}>
                            ما هنرمندها رو آماده می‌کنیم که آزادانه بین فرمت‌ها حرکت کنن. اونچه این حوزه‌ها رو به هم وصل می‌کنه نه تکنیک، بلکه آگاهیه — توانایی دیدن، تفسیر کردن و انتخاب آگاهانه.
                        </P>
                    </div>
                </motion.div>
            </Box>

            {/* ============ COURSES / PROGRAMS ============ */}
            <Box id={'courses'} className={'py-24 gap-6'}>
                <SectionTag>دوره‌ها</SectionTag>
                <H2 className={'text-[clamp(2rem,4vw,3.5rem)] text-center text-ink-50 max-w-[700px]'}>
                    مسیر هنری خودت رو کشف کن
                </H2>
                <span className={'text-ink-500 text-sm mb-2 cursor-pointer hover:text-ink-300 transition-colors'}>
                    همه دوره‌ها
                </span>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{once: true, amount: 0.1}}
                >
                    {courses.slice(0, 4).map((course, index) => (
                        <motion.div
                            key={index}
                            initial={{opacity: 0, y: 24}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true}}
                            transition={{duration: 0.5, delay: index * 0.08}}
                        >
                            <CourseCard
                                title={course.title}
                                imgSrc={course.imgSrc}
                                category={course.category}
                                level={course.level}
                                duration={course.duration}
                                courseType={course.courseType}
                                teacher={course.teacher}
                                price={course.price}
                                registrationStatus={course.registrationStatus}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </Box>

            {/* ============ MENTORS ============ */}
            <Box id={'mentors'} className={'py-24 gap-6'}>
                <SectionTag>اساتید</SectionTag>
                <H2 className={'text-[clamp(2rem,4vw,3.5rem)] text-center text-ink-50 max-w-[700px]'}>
                    از هنرمندان فعال یاد بگیر
                </H2>
                <P className={'text-center text-ink-400 max-w-[600px] text-[clamp(0.95rem,1.8vw,1.15rem)]'}>
                    اساتیدی با تجربه‌های متفاوت، با روش، توجه و بلندمدت‌اندیشی مشترک
                </P>
                <PrimaryButton onClick={() => navigate('/contact-us')}>
                    به عنوان استاد بپیوندید
                </PrimaryButton>

                <div className={'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 w-full mt-4'}>
                    {teachers.map((teacher, index) => (
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
                            />
                        </motion.div>
                    ))}
                </div>
            </Box>

            {/* ============ WHO IT'S FOR ============ */}
            <Box id={'who'} className={'py-24 gap-6'}>
                <SectionTag>برای کیه؟</SectionTag>
                <H2 className={'text-[clamp(2rem,4vw,3.5rem)] text-center text-ink-50 max-w-[700px]'}>
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
                            className={'bg-ink-900 border border-ink-50/10 rounded-[var(--radius-xl)] p-6'}
                        >
                            <H3 className={'text-ink-50 text-lg mb-2'}>{item.title}</H3>
                            <P className={'text-ink-400 text-sm leading-relaxed'}>{item.desc}</P>
                        </motion.div>
                    ))}
                </div>
            </Box>

            {/* ============ CTA ============ */}
            <Box className={'py-24 gap-6'}>
                <SectionTag>تماس با ما</SectionTag>
                <H2 className={'text-[clamp(2rem,4vw,3.5rem)] text-center text-ink-50 max-w-[700px]'}>
                    درباره دوره‌ها با ما صحبت کن
                </H2>
                <ArrowButton onClick={() => navigate('/contact-us')}>
                    تماس با ما
                </ArrowButton>
            </Box>

            {/* ============ HOW IT WORKS ============ */}
            <Box id={'how-it-works'} className={'py-24 gap-6'}>
                <SectionTag>نحوه عملکرد</SectionTag>
                <H2 className={'text-[clamp(2rem,4vw,3.5rem)] text-center text-ink-50 max-w-[700px]'}>
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
            <Box id={'reviews'} className={'py-24 gap-6'}>
                <SectionTag>نظرات دانش‌آموزان</SectionTag>
                <H2 className={'text-[clamp(2rem,4vw,3.5rem)] text-center text-ink-50 max-w-[700px]'}>
                    دانش‌آموزان ما چه می‌گن
                </H2>

                <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full mt-4'}>
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
                            />
                        </motion.div>
                    ))}
                </div>
            </Box>

            {/* ============ FAQ ============ */}
            <Box className={'py-24 gap-6'}>
                <SectionTag>سوالات متداول</SectionTag>
                <H2 className={'text-[clamp(2rem,4vw,3.5rem)] text-center text-ink-50 max-w-[700px]'}>
                    سوالات درباره ثبت‌نام
                </H2>
                <P className={'text-center text-ink-400 max-w-[600px] text-[clamp(0.95rem,1.8vw,1.15rem)]'}>
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
                                className={'bg-ink-900'}
                            />
                        </motion.div>
                    ))}
                </div>
            </Box>

            {/* ============ CONTACT ============ */}
            <Box className={'py-24 gap-6'}>
                <SectionTag>ارتباط</SectionTag>
                <H2 className={'text-[clamp(2rem,4vw,3.5rem)] text-center text-ink-50 max-w-[700px]'}>
                    سوالی داری یا می‌خوای ثبت‌نام کنی؟
                </H2>
                <P className={'text-center text-ink-400 max-w-[600px] text-[clamp(0.95rem,1.8vw,1.15rem)]'}>
                    خوشحالیم درباره دوره‌ها، زمان‌بندی و تناسب با شرایطت صحبت کنیم
                </P>

                <div className={'flex flex-col sm:flex-row gap-8 mt-4 items-center'}>
                    <a
                        href="mailto:info@harekatmedia.com"
                        className={'flex items-center gap-3 text-ink-300 hover:text-ink-50 transition-colors'}
                    >
                        <Mail size={20}/>
                        <span className={'text-sm'}>info@harekatmedia.com</span>
                    </a>
                    <div className={'flex items-center gap-3 text-ink-400'}>
                        <MapPin size={20}/>
                        <span className={'text-sm'}>تهران، ایران</span>
                    </div>
                </div>
            </Box>

            {/* ============ FOOTER ============ */}
            <footer className={'w-full py-12 border-t border-ink-50/10 mt-12'}>
                <div className={'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 w-full'}>
                    {/*logo + links*/}
                    <div className={'flex flex-col gap-4'}>
                        <img src={footerLogo} alt={'logo'} className={'h-8 invert'}/>
                        <div className={'flex gap-4 flex-wrap'}>
                            {footerLinks.map((item, index) => (
                                <span
                                    key={index}
                                    onClick={() => navigate(item.link)}
                                    className={'text-ink-500 text-sm cursor-pointer hover:text-ink-300 transition-colors'}
                                >
                                    {item.text}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/*social + legal*/}
                    <div className={'flex flex-col gap-2 items-start sm:items-end'}>
                        <div className={'flex gap-4'}>
                            <a href="#" className={'text-ink-500 text-xs hover:text-ink-300 transition-colors'}>اینستاگرام</a>
                            <a href="#" className={'text-ink-500 text-xs hover:text-ink-300 transition-colors'}>تلگرام</a>
                            <a href="#" className={'text-ink-500 text-xs hover:text-ink-300 transition-colors'}>لینکدین</a>
                        </div>
                        <span className={'text-ink-600 text-xs'}>© ۱۴۰۵ حرکت مدیا</span>
                    </div>
                </div>
            </footer>
        </MainLayout>
    )
}
