import Logo from "../components/ui/Logo.jsx";
import {H3} from "../components/ui/Headings.jsx";
import {useNavigate, useLocation} from "react-router-dom";
import {motion, AnimatePresence} from "motion/react";
import {SecondaryButton} from "../components/ui/Buttons.jsx";
import {Menu, X, Sun, Moon} from "lucide-react";
import {useState, useEffect} from "react";
import {cn} from "../utils/cn.js";
import {useTheme} from "../contexts/ThemeContext.jsx";

function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({behavior: 'smooth', block: 'start'});
}

export default function TopBarLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const {theme, setTheme} = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, {passive: true});
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const onStorage = () => setIsLoggedIn(!!localStorage.getItem('token'));
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const topBarLinks = [
        {text: 'خانه', link: '/#hero', scrollId: 'hero'},
        {text: 'دوره‌ها', link: '/#courses', scrollId: 'courses'},
        {text: 'تولیدات', link: '/products', scrollId: null},
        {text: 'درباره ما', link: '/about-us', scrollId: null},
        {text: 'تماس با ما', link: '/contact-us', scrollId: null},
    ];

    const handleNav = (item) => {
        setMobileOpen(false);
        if (item.scrollId && location.pathname === '/') {
            scrollToId(item.scrollId);
        } else if (item.scrollId) {
            navigate(item.link);
        } else {
            navigate(item.link);
        }
    };

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            setTimeout(() => scrollToId(id), 100);
        }
    }, [location]);

    return (
        <div className={cn('fixed top-0 z-50 w-full transition-all duration-300', scrolled ? 'pt-3' : 'pt-5')}>
            <div
                className={cn(
                    'mx-auto max-w-[var(--container-8xl)] px-8 py-1',
                    'transition-all duration-300',
                    scrolled
                        ? 'bg-background/80 backdrop-blur-xl shadow-sm shadow-black/10 border-b border-[var(--border)]/50 rounded-full'
                        : 'bg-transparent'
                )}
            >
                <div className={'flex items-center justify-between'}>
                    {/*logo*/}
                    <motion.div
                        initial={{opacity: 0, scale: 0}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{duration: 0.3, ease: 'easeInOut', delay: 0.1}}
                    >
                        <Logo
                            className={'h-10 md:h-15 text-foreground cursor-pointer hover:opacity-80 transition-opacity duration-200'}
                            onClick={() => {
                                navigate('/');
                                setTimeout(() => scrollToId('hero'), 100);
                            }}
                        />
                    </motion.div>

                    {/*links - desktop*/}
                    <div className={'hidden md:flex gap-6 items-center justify-center'}>
                        {topBarLinks.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{
                                    duration: 0.2,
                                    ease: 'easeInOut',
                                    delay: 0.02 * index,
                                }}
                            >
                                <H3
                                    onClick={() => handleNav(item)}
                                    className={
                                        'cursor-pointer text-muted hover:text-foreground transition-all duration-200 ease-in-out text-sm'
                                    }
                                >{item.text}</H3>
                            </motion.div>
                        ))}
                    </div>

                    {/*theme toggle + signIn - desktop*/}
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.2, ease: 'easeInOut', delay: 0.08}}
                        className={'hidden md:flex items-center gap-3'}
                    >
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className={
                                'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ' +
                                'bg-surface-muted hover:bg-border text-muted hover:text-foreground hover:rotate-45'
                            }
                            title={theme === 'dark' ? 'حالت روشن' : 'حالت تاریک'}
                        >
                            {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
                        </button>
                        {isLoggedIn ? (
                            <SecondaryButton onClick={() => navigate('/dashboard')}>
                                داشبورد
                            </SecondaryButton>
                        ) : (
                            <SecondaryButton onClick={() => navigate('/auth')}>
                                ثبت نام یا ورود
                            </SecondaryButton>
                        )}
                    </motion.div>

                    {/*mobile menu button*/}
                    <button
                        className={'md:hidden text-foreground p-2'}
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X size={24}/> : <Menu size={24}/>}
                    </button>
                </div>
            </div>

            {/*mobile menu overlay*/}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{opacity: 0, y: -10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -10}}
                        transition={{duration: 0.2}}
                        className={
                            'md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-[var(--border)] px-6 py-6 flex flex-col gap-4 z-40'
                        }
                    >
                        {topBarLinks.map((item, index) => (
                            <H3
                                key={index}
                                onClick={() => handleNav(item)}
                                className={
                                    'cursor-pointer text-muted hover:text-foreground transition-all duration-200 text-base py-2'
                                }
                            >{item.text}</H3>
                        ))}
                        <div className={'pt-4 border-t border-[var(--border)] flex flex-col gap-4'}>
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className={
                                    'flex items-center gap-3 text-muted hover:text-foreground transition-colors text-sm py-2'
                                }
                            >
                                {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
                                {theme === 'dark' ? 'حالت روشن' : 'حالت تاریک'}
                            </button>
                            <SecondaryButton onClick={() => {
                                setMobileOpen(false);
                                navigate(isLoggedIn ? '/dashboard' : '/auth');
                            }}>
                                {isLoggedIn ? 'داشبورد' : 'ثبت نام یا ورود'}
                            </SecondaryButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
