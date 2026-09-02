import MainLayout from "../layouts/MainLayout.jsx";
import {motion} from "motion/react";
import Box from "../components/ui/Box.jsx";
import {H1, H2, H3, P} from "../components/ui/Headings.jsx";
import {PrimaryButton, SecondaryButton} from "../components/ui/Buttons.jsx";
import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {LogOut, BookOpen, User, CreditCard, Clock} from "lucide-react";

const fallbackCourses = [
    {title: 'طراحی با هوش مصنوعی', imgSrc: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400', category: 'هوش مصنوعی', level: 'مبتدی', duration: '۱۵ ساعت', courseType: 'حضوری', teacher: 'نیما جهان تیغ', price: '۵۰۰ هزار تومان', registrationStatus: 'درحال ثبت نام'},
    {title: 'برنامه‌نویسی پایتون', imgSrc: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400', category: 'برنامه‌نویسی', level: 'مبتدی', duration: '۲۰ ساعت', courseType: 'آنلاین', teacher: 'علی رضایی', price: '۷۵۰ هزار تومان', registrationStatus: 'درحال ثبت نام'},
    {title: 'طراحی رابط کاربری با Figma', imgSrc: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400', category: 'طراحی UI/UX', level: 'متوسط', duration: '۱۲ ساعت', courseType: 'حضوری', teacher: 'سارا محمدی', price: '۶۰۰ هزار تومان', registrationStatus: 'درحال ثبت نام'},
    {title: 'توسعه وب با React', imgSrc: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', category: 'برنامه‌نویسی', level: 'متوسط', duration: '۲۵ ساعت', courseType: 'آنلاین', teacher: 'محمد کریمی', price: '۹۵۰ هزار تومان', registrationStatus: 'به‌زودی'},
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [user] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [courses] = useState(fallbackCourses.slice(0, 2));
    const [loading] = useState(false);

    useEffect(() => {
        if (!user) navigate('/auth');
    }, [user, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    if (loading) {
        return (
            <MainLayout>
                <Box className={'pt-40 pb-24 min-h-[60vh] justify-center'}>
                    <div className={'w-6 h-6 border-2 border-ink-50/20 border-t-ink-50 rounded-full animate-spin'}/>
                </Box>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Box className={'pt-36 pb-24 gap-10'}>
                {/*header*/ }
                <div className={'flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4'}>
                    <div className={'flex items-center gap-4'}>
                        <div className={'w-14 h-14 rounded-full bg-ink-800 border border-ink-50/10 flex items-center justify-center overflow-hidden'}>
                            {user?.avatar ? (
                                <img src={user.avatar} alt="" className={'w-full h-full object-cover'}/>
                            ) : (
                                <User size={24} className={'text-ink-400'}/>
                            )}
                        </div>
                        <div>
                            <H1 className={'text-2xl text-ink-50'}>
                                {user?.firstName && user?.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user?.phoneNumber || 'کاربر'
                                }
                            </H1>
                            <P className={'text-ink-500 text-sm'}>{user?.phoneNumber}</P>
                        </div>
                    </div>
                    <SecondaryButton onClick={handleLogout} className={'flex items-center gap-2 text-xs'}>
                        <LogOut size={14}/>
                        خروج
                    </SecondaryButton>
                </div>

                {/*stats*/ }
                <div className={'grid grid-cols-2 sm:grid-cols-3 gap-4 w-full'}>
                    {[
                        {icon: BookOpen, label: 'دوره‌های ثبت‌نام‌شده', value: courses.length},
                        {icon: CreditCard, label: 'پرداخت‌ها', value: user?.paymentIds?.length || 0},
                        {icon: Clock, label: 'عضویت از', value: '۱۴۰۵'},
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{opacity: 0, y: 16}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.4, delay: i * 0.08}}
                            className={
                                'bg-ink-900 border border-ink-50/10 rounded-[var(--radius-xl)] p-5 flex items-center gap-4'
                            }
                        >
                            <div className={'w-10 h-10 rounded-full bg-ink-800 flex items-center justify-center shrink-0'}>
                                <item.icon size={18} className={'text-ink-400'}/>
                            </div>
                            <div className={'flex flex-col'}>
                                <span className={'text-ink-50 text-lg font-bold'}>{item.value}</span>
                                <span className={'text-ink-500 text-xs'}>{item.label}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/*enrolled courses*/ }
                <div className={'flex flex-col gap-5 w-full'}>
                    <div className={'flex items-center justify-between'}>
                        <H2 className={'text-xl text-ink-50'}>دوره‌های من</H2>
                        <span
                            onClick={() => navigate('/#courses')}
                            className={'text-ink-500 text-sm cursor-pointer hover:text-ink-300 transition-colors'}
                        >
                            مشاهده همه دوره‌ها
                        </span>
                    </div>

                    {courses.length === 0 ? (
                        <div className={'bg-ink-900 border border-ink-50/10 rounded-[var(--radius-xl)] p-8 text-center'}>
                            <P className={'text-ink-400'}>هنوز در هیچ دوره‌ای ثبت‌نام نکردی.</P>
                            <PrimaryButton onClick={() => navigate('/#courses')} className={'mt-4 text-sm'}>
                                مشاهده دوره‌ها
                            </PrimaryButton>
                        </div>
                    ) : (
                        <div className={'grid grid-cols-1 sm:grid-cols-2 gap-4 w-full'}>
                            {courses.map((course, i) => (
                                <motion.div
                                    key={i}
                                    initial={{opacity: 0, y: 16}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.4, delay: i * 0.06}}
                                    className={
                                        'bg-ink-900 border border-ink-50/10 rounded-[var(--radius-xl)] overflow-hidden flex flex-col sm:flex-row'
                                    }
                                >
                                    <div className={'w-full sm:w-40 h-32 sm:h-auto shrink-0 overflow-hidden'}>
                                        <img
                                            src={course.image || course.imgSrc}
                                            alt={course.name || course.title}
                                            className={'w-full h-full object-cover'}
                                        />
                                    </div>
                                    <div className={'flex flex-col gap-2 p-4 flex-1'}>
                                        <H3 className={'text-ink-50 text-base font-bold'}>
                                            {course.name || course.title}
                                        </H3>
                                        <div className={'flex flex-wrap gap-2'}>
                                            <span className={'text-xs bg-ink-800 text-ink-400 px-2 py-0.5 rounded-md'}>
                                                {course.level}
                                            </span>
                                            <span className={'text-xs bg-ink-800 text-ink-400 px-2 py-0.5 rounded-md'}>
                                                {course.duration}
                                            </span>
                                            <span className={'text-xs bg-ink-800 text-ink-400 px-2 py-0.5 rounded-md'}>
                                                {course.typeOfAttendence || course.courseType}
                                            </span>
                                        </div>
                                        <span className={'text-xs text-ink-500 mt-auto'}>
                                            {course.teacher?.firstName
                                                ? `${course.teacher.firstName} ${course.teacher.lastName}`
                                                : course.teacher
                                            }
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </Box>
        </MainLayout>
    )
}
