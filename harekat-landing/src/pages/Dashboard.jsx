import MainLayout from "../layouts/MainLayout.jsx";
import {motion} from "motion/react";
import Box from "../components/ui/Box.jsx";
import {H1, H2, H3, P} from "../components/ui/Headings.jsx";
import {PrimaryButton, SecondaryButton} from "../components/ui/Buttons.jsx";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {
    LogOut, BookOpen, User, Clock, Trophy, Play,
    Calendar, Bell, Star,
    CheckCircle, ArrowUpRight, Flame, Target
} from "lucide-react";

const enrolledCourses = [
    {
        id: 1,
        title: 'طراحی با هوش مصنوعی',
        imgSrc: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
        teacher: 'نیما جهان تیغ',
        progress: 72,
        totalLessons: 24,
        completedLessons: 17,
        nextSession: 'شنبه ۱۴:۰۰',
        level: 'مبتدی',
    },
    {
        id: 2,
        title: 'برنامه‌نویسی پایتون',
        imgSrc: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
        teacher: 'علی رضایی',
        progress: 35,
        totalLessons: 32,
        completedLessons: 11,
        nextSession: 'یکشنبه ۱۰:۰۰',
        level: 'مبتدی',
    },
    {
        id: 3,
        title: 'طراحی رابط کاربری با Figma',
        imgSrc: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
        teacher: 'سارا محمدی',
        progress: 100,
        totalLessons: 18,
        completedLessons: 18,
        nextSession: null,
        level: 'متوسط',
    },
];

const upcomingSessions = [
    {course: 'طراحی با هوش مصنوعی', time: 'شنبه ۱۴:۰۰ - ۱۶:۰۰', type: 'حضوری', teacher: 'نیما جهان تیغ'},
    {course: 'برنامه‌نویسی پایتون', time: 'یکشنبه ۱۰:۰۰ - ۱۲:۰۰', type: 'آنلاین', teacher: 'علی رضایی'},
    {course: 'طراحی با هوش مصنوعی', time: 'دوشنبه ۱۴:۰۰ - ۱۶:۰۰', type: 'حضوری', teacher: 'نیما جهان تیغ'},
];

const recentActivity = [
    {text: 'جلسه ۱۷ «طراحی با هوش مصنوعی» را تکمیل کردید', time: '۲ ساعت پیش', icon: CheckCircle},
    {text: 'تکلیف پروژه پایتون را ارسال کردید', time: 'دیروز', icon: ArrowUpRight},
    {text: 'گواهینامه «طراحی UI/UX» دریافت شد', time: '۳ روز پیش', icon: Trophy},
    {text: 'دوره جدید «توسعه وب با React» فعال شد', time: '۵ روز پیش', icon: Bell},
];

const certificates = [
    {name: 'طراحی رابط کاربری با Figma', date: 'مرداد ۱۴۰۵'},
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [user] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [activeTab, setActiveTab] = useState('courses');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const totalHours = enrolledCourses.reduce((acc, c) => {
        const done = (c.completedLessons / c.totalLessons) * 12;
        return acc + done;
    }, 0);

    return (
        <MainLayout title={'داشبورد'}>
            <Box className={'pt-32 pb-24 gap-8 min-h-screen'}>

                {/*top bar: profile + actions*/ }
                <motion.div
                    initial={{opacity: 0, y: -10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.4}}
                    className={'flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 pb-6 border-b border-[var(--border)]'}
                >
                    <div className={'flex items-center gap-4'}>
                        <div className={
                            'w-16 h-16 rounded-full border-2 border-[var(--primary)] flex items-center justify-center overflow-hidden bg-[var(--surface-muted)]'
                        }>
                            {user?.avatar ? (
                                <img src={user.avatar} alt="" className={'w-full h-full object-cover'}/>
                            ) : (
                                <User size={28} className={'text-[var(--muted-foreground)]'}/>
                            )}
                        </div>
                        <div>
                            <P className={'text-[var(--muted-foreground)] text-xs mb-0.5'}>خوش آمدید 👋</P>
                            <H1 className={'text-xl sm:text-2xl text-[var(--foreground)]'}>
                                {user?.firstName && user?.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user?.phoneNumber || 'علی محمدی'
                                }
                            </H1>
                            <P className={'text-[var(--muted-foreground)] text-xs'}>{user?.phoneNumber || '۰۹۱۲۳۴۵۶۷۸۹'}</P>
                        </div>
                    </div>
                    <div className={'flex items-center gap-3'}>
                        <SecondaryButton
                            onClick={() => navigate('/')}
                            className={'flex items-center gap-2 text-xs'}
                        >
                            <BookOpen size={14}/>
                            دوره‌ها
                        </SecondaryButton>
                        <button
                            onClick={handleLogout}
                            className={
                                'flex items-center gap-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--danger-500, #e5484d)] transition-colors px-3 py-2 rounded-[var(--radius-md)] hover:bg-[var(--surface-muted)]'
                            }
                        >
                            <LogOut size={14}/>
                            خروج
                        </button>
                    </div>
                </motion.div>

                {/*stat cards*/ }
                <div className={'grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full'}>
                    {[
                        {icon: BookOpen, label: 'دوره فعال', value: '۳', color: 'var(--primary)'},
                        {icon: Clock, label: 'ساعت یادگیری', value: `${Math.round(totalHours)}`, color: 'var(--accent-foreground, #0b5d86)'},
                        {icon: Trophy, label: 'گواهینامه', value: `${certificates.length}`, color: 'var(--color-success-500, #16a36a)'},
                        {icon: Flame, label: 'روزهای متوالی', value: '۱۲', color: 'var(--color-warning-500, #d99400)'},
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{opacity: 0, y: 16}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.35, delay: i * 0.06}}
                            className={
                                'bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-4 sm:p-5 flex flex-col gap-3'
                            }
                        >
                            <div
                                className={'w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center'}
                                style={{background: `color-mix(in srgb, ${item.color} 15%, transparent)`}}
                            >
                                <item.icon size={18} style={{color: item.color}}/>
                            </div>
                            <div className={'flex flex-col'}>
                                <span className={'text-[var(--foreground)] text-xl font-bold leading-tight'}>{item.value}</span>
                                <span className={'text-[var(--muted-foreground)] text-xs'}>{item.label}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/*tabs*/ }
                <div className={'flex items-center gap-1 w-full border-b border-[var(--border)]'}>
                    {[
                        {id: 'courses', label: 'دوره‌های من'},
                        {id: 'schedule', label: 'برنامه هفتگی'},
                        {id: 'activity', label: 'فعالیت‌ها'},
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={
                                'relative px-4 py-3 text-sm font-medium transition-colors ' +
                                (activeTab === tab.id
                                    ? 'text-[var(--foreground)]'
                                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                                )
                            }
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId={'tab-indicator'}
                                    className={'absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)] rounded-full'}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/*tab content: courses*/ }
                {activeTab === 'courses' && (
                    <motion.div
                        key={'courses'}
                        initial={{opacity: 0, y: 8}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.3}}
                        className={'flex flex-col gap-6 w-full'}
                    >
                        {/*continue learning*/ }
                        <div className={'flex flex-col gap-4 w-full'}>
                            <H2 className={'text-lg text-[var(--foreground)]'}>ادامه یادگیری</H2>
                            <div className={'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full'}>
                                {enrolledCourses.filter(c => c.progress < 100).map((course, i) => (
                                    <motion.div
                                        key={course.id}
                                        initial={{opacity: 0, y: 12}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{duration: 0.35, delay: i * 0.05}}
                                        className={
                                            'bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden group cursor-pointer hover:border-[var(--primary)]/40 transition-colors'
                                        }
                                    >
                                        <div className={'relative h-36 overflow-hidden'}>
                                            <img
                                                src={course.imgSrc}
                                                alt={course.title}
                                                className={'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'}
                                            />
                                            <div className={'absolute inset-0 bg-black/40'}/>
                                            <div className={'absolute bottom-3 right-3 left-3 flex items-center justify-between'}>
                                                <span className={
                                                    'text-xs text-white/90 bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-md'
                                                }>
                                                    {course.level}
                                                </span>
                                                <button className={
                                                    'w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center hover:scale-110 transition-transform'
                                                }>
                                                    <Play size={14} className={'text-[var(--primary-foreground)] mr-[-2px]'}/>
                                                </button>
                                            </div>
                                        </div>
                                        <div className={'p-4 flex flex-col gap-3'}>
                                            <div>
                                                <H3 className={'text-sm font-bold text-[var(--foreground)]'}>{course.title}</H3>
                                                <P className={'text-xs text-[var(--muted-foreground)] mt-0.5'}>{course.teacher}</P>
                                            </div>
                                            <div className={'flex flex-col gap-1.5'}>
                                                <div className={'flex items-center justify-between'}>
                                                    <span className={'text-xs text-[var(--muted-foreground)]'}>
                                                        {course.completedLessons}/{course.totalLessons} جلسه
                                                    </span>
                                                    <span className={'text-xs font-medium text-[var(--primary)]'}>{course.progress}%</span>
                                                </div>
                                                <div className={'w-full h-1.5 bg-[var(--surface-muted)] rounded-full overflow-hidden'}>
                                                    <motion.div
                                                        initial={{width: 0}}
                                                        animate={{width: `${course.progress}%`}}
                                                        transition={{duration: 0.8, delay: i * 0.1, ease: 'easeOut'}}
                                                        className={'h-full rounded-full bg-[var(--primary)]'}
                                                    />
                                                </div>
                                            </div>
                                            {course.nextSession && (
                                                <div className={'flex items-center gap-2 text-xs text-[var(--muted-foreground)]'}>
                                                    <Calendar size={12}/>
                                                    {course.nextSession}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/*completed*/ }
                        {enrolledCourses.some(c => c.progress === 100) && (
                            <div className={'flex flex-col gap-4 w-full'}>
                                <H2 className={'text-lg text-[var(--foreground)]'}>تکمیل شده</H2>
                                <div className={'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full'}>
                                    {enrolledCourses.filter(c => c.progress === 100).map((course, i) => (
                                        <motion.div
                                            key={course.id}
                                            initial={{opacity: 0, y: 12}}
                                            animate={{opacity: 1, y: 0}}
                                            transition={{duration: 0.35, delay: i * 0.05}}
                                            className={
                                                'bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden opacity-80'
                                            }
                                        >
                                            <div className={'relative h-36 overflow-hidden'}>
                                                <img src={course.imgSrc} alt={course.title} className={'w-full h-full object-cover grayscale'}/>
                                                <div className={'absolute inset-0 bg-black/40'}/>
                                                <div className={'absolute inset-0 bg-gradient-to-t from-black/60 to-transparent'}/>
                                                <div className={'absolute top-3 right-3'}>
                                                    <span className={'text-xs text-white bg-[var(--color-success-500)] px-2 py-0.5 rounded-md flex items-center gap-1'}>
                                                        <CheckCircle size={12}/>
                                                        تکمیل شده
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={'p-4'}>
                                                <H3 className={'text-sm font-bold text-[var(--foreground)]'}>{course.title}</H3>
                                                <P className={'text-xs text-[var(--muted-foreground)] mt-1'}>{course.teacher}</P>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/*tab content: schedule*/ }
                {activeTab === 'schedule' && (
                    <motion.div
                        key={'schedule'}
                        initial={{opacity: 0, y: 8}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.3}}
                        className={'flex flex-col gap-4 w-full'}
                    >
                        <H2 className={'text-lg text-[var(--foreground)]'}>جلسات آینده</H2>
                        <div className={'flex flex-col gap-2 w-full'}>
                            {upcomingSessions.map((session, i) => (
                                <motion.div
                                    key={i}
                                    initial={{opacity: 0, x: -8}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{duration: 0.3, delay: i * 0.05}}
                                    className={
                                        'bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 flex items-center gap-4'
                                    }
                                >
                                    <div className={
                                        'w-10 h-10 rounded-[var(--radius-md)] bg-[var(--primary)]/10 flex items-center justify-center shrink-0'
                                    }>
                                        <Calendar size={18} className={'text-[var(--primary)]'}/>
                                    </div>
                                    <div className={'flex-1 min-w-0'}>
                                        <H3 className={'text-sm font-bold text-[var(--foreground)] truncate'}>{session.course}</H3>
                                        <P className={'text-xs text-[var(--muted-foreground)]'}>{session.teacher}</P>
                                    </div>
                                    <div className={'flex flex-col items-end gap-1 shrink-0'}>
                                        <span className={'text-xs font-medium text-[var(--foreground)]'}>{session.time}</span>
                                        <span className={
                                            'text-xs px-2 py-0.5 rounded-md ' +
                                            (session.type === 'حضوری'
                                                ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                                                : 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                                            )
                                        }>
                                            {session.type}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/*tab content: activity*/ }
                {activeTab === 'activity' && (
                    <motion.div
                        key={'activity'}
                        initial={{opacity: 0, y: 8}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.3}}
                        className={'flex flex-col gap-4 w-full'}
                    >
                        <H2 className={'text-lg text-[var(--foreground)]'}>آخرین فعالیت‌ها</H2>
                        <div className={'flex flex-col gap-0 w-full'}>
                            {recentActivity.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{opacity: 0, x: -8}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{duration: 0.3, delay: i * 0.05}}
                                    className={
                                        'flex items-center gap-4 py-4 border-b border-[var(--border)] last:border-0'
                                    }
                                >
                                    <div className={
                                        'w-8 h-8 rounded-full bg-[var(--surface-muted)] flex items-center justify-center shrink-0'
                                    }>
                                        <item.icon size={16} className={'text-[var(--muted-foreground)]'}/>
                                    </div>
                                    <div className={'flex-1 min-w-0'}>
                                        <P className={'text-sm text-[var(--foreground)] truncate'}>{item.text}</P>
                                    </div>
                                    <span className={'text-xs text-[var(--muted-foreground)] shrink-0'}>{item.time}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/*certificates*/ }
                        {certificates.length > 0 && (
                            <div className={'flex flex-col gap-4 w-full mt-4'}>
                                <H2 className={'text-lg text-[var(--foreground)]'}>گواهینامه‌ها</H2>
                                <div className={'flex flex-col gap-2 w-full'}>
                                    {certificates.map((cert, i) => (
                                        <div
                                            key={i}
                                            className={
                                                'bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 flex items-center gap-4'
                                            }
                                        >
                                            <div className={
                                                'w-10 h-10 rounded-full bg-[var(--color-success-500)]/10 flex items-center justify-center shrink-0'
                                            }>
                                                <Trophy size={18} className={'text-[var(--color-success-500)]'}/>
                                            </div>
                                            <div className={'flex-1'}>
                                                <H3 className={'text-sm font-bold text-[var(--foreground)]'}>{cert.name}</H3>
                                                <P className={'text-xs text-[var(--muted-foreground)]'}>{cert.date}</P>
                                            </div>
                                            <Star size={16} className={'text-[var(--color-warning-500)] shrink-0'}/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/*bottom: quick actions*/ }
                <motion.div
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.4, delay: 0.2}}
                    className={
                        'w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4'
                    }
                >
                    <div className={'w-10 h-10 rounded-[var(--radius-md)] bg-[var(--primary)]/10 flex items-center justify-center shrink-0'}>
                        <Target size={18} className={'text-[var(--primary)]'}/>
                    </div>
                    <div className={'flex-1'}>
                        <H3 className={'text-sm font-bold text-[var(--foreground)]'}>پیشرفتت عالیه!</H3>
                        <P className={'text-xs text-[var(--muted-foreground)] mt-0.5'}>
                            تا الان {Math.round(totalHours)} ساعت یادگیری داشتی. ادامه بده!
                        </P>
                    </div>
                    <PrimaryButton
                        onClick={() => navigate('/#courses')}
                        className={'text-xs flex items-center gap-2'}
                    >
                        <BookOpen size={14}/>
                        دوره جدید
                    </PrimaryButton>
                </motion.div>

            </Box>
        </MainLayout>
    )
}
