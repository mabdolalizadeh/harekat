import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { storeApi } from "../services/api.js";
import Background from "../components/ui/Background.jsx";
import Footer from "../components/ui/Footer.jsx";
import TopBarLayout from "../layouts/TopBarLayout.jsx";

// GSAP + Lenis Landing Components
import SmoothScrollProvider from "../components/landing/SmoothScrollProvider.jsx";
import ScrollProgressBar from "../components/landing/ScrollProgressBar.jsx";
import LandingHero from "../components/landing/LandingHero.jsx";
import LandingManifesto from "../components/landing/LandingManifesto.jsx";
import LandingFounderCard from "../components/landing/LandingFounderCard.jsx";
import LandingCourses from "../components/landing/LandingCourses.jsx";
import LandingCapsules from "../components/landing/LandingCapsules.jsx";
import LandingPackages from "../components/landing/LandingPackages.jsx";
import LandingSubscriptions from "../components/landing/LandingSubscriptions.jsx";
import LandingMentors from "../components/landing/LandingMentors.jsx";
import LandingAudience from "../components/landing/LandingAudience.jsx";
import LandingTimeline from "../components/landing/LandingTimeline.jsx";
import LandingTestimonials from "../components/landing/LandingTestimonials.jsx";
import LandingFAQ from "../components/landing/LandingFAQ.jsx";
import LandingCTA from "../components/landing/LandingCTA.jsx";
import FollowCursor from "../components/ui/FollowCursor.jsx";
import DragToCartDropZone from "../components/ui/DragToCartDropZone.jsx";

const fallbackHeroSlides = [
    { image: '', alt: '' },
];

const images = [];

const fallbackCourses = [
    {
        title: '',
        imgSrc: '',
        category: '',
        level: '',
        duration: '',
        courseType: '',
        teacher: '',
        price: '',
        registrationStatus: ''
    }
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
    { quote: 'این برنامه نحوه نگاه من به تصاویر رو کاملاً تغییر داد. دیگه فقط عکس نمی‌گیرم، کار تولید می‌کنم.', name: 'علی محمدی', role: 'عکاس', avatar: 'https://i.pravatar.cc/150?u=1' },
    { quote: 'قبل از مدرسه حرکت با حس کار می‌کردم. الان هر تصمیمم پشتوانه فکری داره.', name: 'مریم رضایی', role: 'طراح گرافیک', avatar: 'https://i.pravatar.cc/150?u=2' },
    { quote: 'اولین جایی بود که اجازه دادم آزمایش کنم. این آزادی خیلی ارزشمند بود.', name: 'سارا احمدی', role: 'نقاش', avatar: 'https://i.pravatar.cc/150?u=3' },
    { quote: 'جلسات نقد خیلی سخت ولی عالی بود. یاد گرفتم چطور تصمیماتم رو توضیح بدم.', name: 'رضا کریمی', role: 'هنرمند چندرسانه‌ای', avatar: 'https://i.pravatar.cc/150?u=4' },
    { quote: 'از طراحی گرافیک اومدم اینجا. فهمیدم طراحی فقط ویژوال نیست، فکر و روش هم هست.', name: 'محمد حسینی', role: 'طراح', avatar: 'https://i.pravatar.cc/150?u=5' },
    { quote: 'مدرسه حرکت فقط کار من رو بهتر نکرد، کل نگاهم به خلاقیت رو عوض کرد.', name: 'امیرحسین احمدی', role: 'عکاس', avatar: 'https://i.pravatar.cc/150?u=6' },
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

function mapApiTeacher(teacher) {
    const name = `${teacher.firstName ?? ''} ${teacher.lastName ?? ''}`.trim() || 'استاد';
    const role = teacher.categories?.[0]?.name || (teacher.resume ? teacher.resume.split('\n')[0].replace(/^#+\s*/, '') : '') || 'مدرس';
    return {
        id: teacher.id,
        name,
        role,
        avatar: teacher.avatar
    };
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
        Promise.allSettled([
            storeApi.getBanners(),
            storeApi.getCourses(),
            storeApi.getTeachers(),
            storeApi.getSubscriptions(),
            storeApi.getCategories(),
            storeApi.getSiteContent()
        ]).then((results) => {
            if (cancelled) return;
            const [bannerResult, courseResult, teacherResult, subscriptionResult, categoriesResult, contentResult] = results;
            if (bannerResult.status === 'fulfilled') {
                setBanners(
                    (bannerResult.value.data ?? [])
                        .filter((banner) => banner.isActive !== false)
                        .map((banner) => ({
                            image: banner.imageUrl,
                            tabletImage: banner.tabletImageUrl || banner.imageUrl,
                            mobileImage: banner.mobileImageUrl || banner.tabletImageUrl || banner.imageUrl,
                            link: banner.linkUrl || undefined,
                            duration: banner.duration,
                            alt: 'بنر صفحه اصلی'
                        }))
                );
            }
            if (courseResult.status === 'fulfilled') {
                setApiCourses((courseResult.value.data ?? []).filter((course) => course.isActive !== false));
            }
            if (teacherResult.status === 'fulfilled') {
                setApiTeachers((teacherResult.value.data ?? []).filter((teacher) => teacher.showOnLanding !== false));
            }
            if (subscriptionResult.status === 'fulfilled') {
                setApiSubscriptions((subscriptionResult.value.data ?? []).filter((item) => item.isActive !== false));
            }
            if (categoriesResult.status === 'fulfilled') {
                const categories = categoriesResult.value.data ?? [];
                const findSection = (pattern, fallback) => categories.find((category) => pattern.test(`${category.slug ?? ''} ${category.name ?? ''}`))?.slug || fallback;
                setSectionIds({
                    capsule: findSection(/capsule|کپسول/i, 'capsule-courses'),
                    skill: findSection(/skill|مهارت|پکیج/i, 'skill-packages'),
                    subscriptions: findSection(/subscription|اشتراک/i, 'subscriptions')
                });
            }
            if (contentResult.status === 'fulfilled') {
                setContentMap(Object.fromEntries((contentResult.value.data ?? []).map((block) => [block.key, block])));
            }

            // Refresh ScrollTrigger calculations after dynamic content renders
            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 100);
        });

        return () => { cancelled = true; };
    }, []);

    const isLoading = apiCourses === null;
    const heroSlides = banners.length > 0 ? banners : fallbackHeroSlides;
    const displayCourses = apiCourses?.length ? apiCourses.map(mapApiCourse) : (isLoading ? [] : fallbackCourses);
    const displayTeachers = apiTeachers?.length ? apiTeachers.map(mapApiTeacher) : [];
    const apiCourseRows = apiCourses ?? [];
    const regularCourses = apiCourses?.length ? apiCourseRows.filter((course) => !course.kind || course.kind === 'regular').map(mapApiCourse) : displayCourses;
    const capsuleCourses = apiCourses?.length ? apiCourseRows.filter((course) => course.kind === 'capsule').map(mapApiCourse) : [];
    const skillPackages = apiCourses?.length ? apiCourseRows.filter((course) => course.kind === 'skill').map(mapApiCourse) : [];
    const baseCourses = regularCourses.filter((course) => course.level === 'پایه');
    const beginnerCourses = regularCourses.filter((course) => course.level === 'مقدماتی' || course.level === 'مبتدی' || !course.level);
    const advancedCourses = regularCourses.filter((course) => course.level === 'پیشرفته' || course.level === 'متوسط');
    const heroTitle = contentMap['hero-title']?.title || 'اینجا فقط یاد';
    const heroSubtitle = contentMap['hero-title']?.body || 'مدرسه حرکت جایی برای یادگیری و تجربه در مرز هنر، رسانه و فناوری است؛ از عکاسی و تدوین و طراحی تا برنامه‌نویسی، طراحی سایت و هوش مصنوعی.';

    const handleCtaClick = () => {
        if (window.__lenis) {
            window.__lenis.scrollTo('#courses', { offset: -70, duration: 1.2 });
        } else {
            const el = document.getElementById('courses');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <SmoothScrollProvider>
            {/* Top luxury scroll indicator, custom cursor & drag drop zone */}
            <ScrollProgressBar />
            <FollowCursor />
            <DragToCartDropZone />

            <Background>
                <TopBarLayout />

                <main className="flex flex-col items-center w-full max-w-8xl px-[clamp(1rem,4vw,6rem)] overflow-x-clip">
                    {/* ============ HERO ============ */}
                    <LandingHero
                        heroSlides={heroSlides}
                        isLoading={isLoading}
                        heroTitle={heroTitle}
                        heroSubtitle={heroSubtitle}
                        images={images}
                        onCtaClick={handleCtaClick}
                    />

                    {/* ============ MANIFESTO ============ */}
                    <LandingManifesto />

                    {/* ============ FOUNDER CARD ============ */}
                    <LandingFounderCard />

                    {/* ============ COURSES / PROGRAMS ============ */}
                    <LandingCourses
                        baseCourses={baseCourses}
                        beginnerCourses={beginnerCourses}
                        advancedCourses={advancedCourses}
                        isLoading={isLoading}
                    />

                    {/* ============ CAPSULE COURSES ============ */}
                    <LandingCapsules
                        id={sectionIds.capsule}
                        capsuleCourses={capsuleCourses}
                        isLoading={isLoading}
                    />

                    {/* ============ SKILL PACKAGES ============ */}
                    <LandingPackages
                        id={sectionIds.skill}
                        skillPackages={skillPackages}
                        isLoading={isLoading}
                    />

                    {/* ============ SUBSCRIPTIONS ============ */}
                    <LandingSubscriptions
                        id={sectionIds.subscriptions}
                        apiSubscriptions={apiSubscriptions}
                        isLoading={isLoading}
                    />

                    {/* ============ MENTORS ============ */}
                    <LandingMentors
                        displayTeachers={displayTeachers}
                        isLoading={isLoading}
                        onJoinClick={() => navigate('/contact-us')}
                    />

                    {/* ============ WHO IT'S FOR ============ */}
                    <LandingAudience />

                    {/* ============ HOW IT WORKS ============ */}
                    <LandingTimeline steps={steps} />

                    {/* ============ TESTIMONIALS ============ */}
                    <LandingTestimonials testimonials={testimonials} />

                    {/* ============ FAQ ============ */}
                    <LandingFAQ faqItems={faqItems} />

                    {/* ============ CTA & CONTACT ============ */}
                    <LandingCTA onContactClick={() => navigate('/contact-us')} />
                </main>

                {/* Footer with dynamic CMS section links & socials */}
                <Footer
                    sectionIds={sectionIds}
                    copyright={contentMap['footer-copyright']?.body || '© ۱۴۰۵ مدرسه حرکت'}
                    socials={Object.values(contentMap).filter(
                        (item) => item.key?.startsWith('social-')
                    )}
                />
            </Background>
        </SmoothScrollProvider>
    );
}
