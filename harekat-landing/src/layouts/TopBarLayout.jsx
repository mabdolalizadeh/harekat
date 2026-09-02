import logo from '../assets/logo.png';
import {H3} from "../components/ui/Headings.jsx";
import {useNavigate} from "react-router-dom";
import {motion, AnimatePresence} from "motion/react";
import {SecondaryButton} from "../components/ui/Buttons.jsx";
import {Menu, X} from "lucide-react";
import {useState} from "react";

export default function TopBarLayout() {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const topBarLinks = [
        {text: 'خانه', link: '/#hero'},
        {text: 'دوره‌ها', link: '/#courses'},
        {text: 'تولیدات', link: '/#products'},
        {text: 'درباره ما', link: '/about-us'},
        {text: 'تماس با ما', link: '/contact-us'},
    ];

    const handleNav = (link) => {
        navigate(link);
        setMobileOpen(false);
    };

    return (
        <div className={'fixed top-0 pt-4 z-50 w-full'}>
            <div
                className={
                    'flex items-center justify-between px-[clamp(1.5rem,5vw,7.5rem)] py-3 mx-auto max-w-[var(--container-8xl)]'
                }
            >
                {/*logo*/}
                <motion.div
                    initial={{opacity: 0, scale: 0}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{duration: 0.3, ease: 'easeInOut', delay: 0.1}}
                >
                    <img
                        src={logo}
                        alt={'logo'}
                        className={
                            'h-9 invert cursor-pointer hover:scale-105 transition-all duration-200 ease-standard'
                        }
                        onClick={() => navigate('/')}
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
                                onClick={() => handleNav(item.link)}
                                className={
                                    'cursor-pointer text-ink-400 hover:text-ink-50 transition-all duration-200 ease-in-out text-sm'
                                }
                            >{item.text}</H3>
                        </motion.div>
                    ))}
                </div>

                {/*signIn - desktop*/}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.2, ease: 'easeInOut', delay: 0.08}}
                    className={'hidden md:block'}
                >
                    <SecondaryButton onClick={() => handleNav('/auth')}>
                        ثبت نام یا ورود
                    </SecondaryButton>
                </motion.div>

                {/*mobile menu button*/}
                <button
                    className={'md:hidden text-ink-50 p-2'}
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X size={24}/> : <Menu size={24}/>}
                </button>
            </div>

            {/*bottom border line*/}
            <div className={'w-full h-px bg-ink-50/10'}/>

            {/*mobile menu overlay*/}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{opacity: 0, y: -10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -10}}
                        transition={{duration: 0.2}}
                        className={
                            'md:hidden absolute top-full left-0 w-full bg-ink-950 border-b border-ink-50/10 px-6 py-6 flex flex-col gap-4 z-40'
                        }
                    >
                        {topBarLinks.map((item, index) => (
                            <H3
                                key={index}
                                onClick={() => handleNav(item.link)}
                                className={
                                    'cursor-pointer text-ink-400 hover:text-ink-50 transition-all duration-200 text-base py-1'
                                }
                            >{item.text}</H3>
                        ))}
                        <div className={'pt-2 border-t border-ink-50/10'}>
                            <SecondaryButton onClick={() => handleNav('/auth')}>
                                ثبت نام یا ورود
                            </SecondaryButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
