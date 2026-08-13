import TopBarLayout from "../layouts/TopBarLayout.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import Chip from "../components/ui/Chip.jsx";
import Box from "../components/ui/Box.jsx";
import {H1, H2} from "../components/ui/Headings.jsx";
import {ArrowButton} from "../components/ui/Buttons.jsx";
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

export default function Landing() {
    const navigate = useNavigate();

    return (
        <MainLayout>
            <TopBarLayout />
            {/*hero*/}
            <Box id={'hero'} className={'pt-16'}>
                <div className={'flex flex-col items-center justify-center my-40 w-[50%] gap-8'}>
                    <div><Chip>مدرسه هنر و مهارت</Chip></div>
                    <div>
                        <H1 className={'text-7xl text-center leading-tight'}>
                            اینجا فقط یاد<br />نمی‌گیری؛
                        </H1>
                    </div>
                    <div>
                        <H2 className={'text-xl text-center leading-tight'}>
                            حرکت مدیا جایی برای یادگیری و تجربه در مرز هنر، رسانه و فناوری است؛ از عکاسی و تدوین و طراحی تا برنامه‌نویسی، طراحی سایت و هوش مصنوعی.
                        </H2>
                    </div>
                    <div>
                        <div>
                            <ArrowButton onClick={() => navigate('/#courses')}>
                                بریم شروع کنیم!
                            </ArrowButton>
                        </div>
                    </div>
                    <div className={'overflow-hidden'}>
                        <MarqueeLayout className={'mt-10'}>
                            {images.map((image, index) => (
                                <div className={'overflow-hidden'} key={index}>
                                    <Img src={image} className={'w-40 h-50'} groupHover={true}/>
                                </div>
                            ))}
                        </MarqueeLayout>
                    </div>
                </div>
            </Box>

            {/*courses*/}
            <Box id={'courses'} className={'gap-5 mb-40'}>
                <Chip>
                    الان چی یاد بگیریم؟
                </Chip>
                <H2>
                    دوره‌های جدید حرکت مدیا را ببین و مسیر مورد علاقه‌ات را شروع کن.
                </H2>

                {/*fix here*/}
                <div className="grid grid-cols-4 gap-5 w-full">
                    {courses.map((course) => (
                        <div key={course.title}>
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
                        </div>
                    ))}
                </div>
            </Box>
        </MainLayout>
    )
}
