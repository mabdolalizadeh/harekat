import logo from '../assets/logo.png';
import {H3} from "../components/ui/Headings.jsx";
import {useNavigate} from "react-router-dom";
import {motion} from "motion/react";
import {SecondaryButton} from "../components/ui/Buttons.jsx";

export default function TopBarLayout() {
    const navigate = useNavigate();

    const topBarLinks = [
        {
            text: 'خانه',
            link: '/#hero',
        }, {
            text: 'دوره‌ها',
            link: '/#courses',
        }, {
            text: 'تولیدات',
            link: '/#products',
        }, {
            text: 'درباره ما',
            link: '/about-us',
        }, {
            text: 'تماس با ما',
            link: '/contact-us',
        },
    ]
    return (
            <div className={'fixed top-10 z-20 w-[95%]'}>
                <div className="relative flex h-16 w-full items-center justify-between px-5 pb-2 border-b border-b-ink-600 backdrop-blur-2xl">
                {/*links*/}
                <div className={'flex gap-3 items-center justify-center'}>
                    {topBarLinks.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.2,
                                ease: 'easeInOut',
                                delay: 0.02 * index,
                            }}
                        >
                            <H3
                                onClick={() => navigate(item.link)}
                                className={'cursor-pointer hover:text-ink-500 transition-all duration-200 ease-in-out'}
                            >{item.text}</H3>
                        </motion.div>
                    ))}
                </div>
                {/*logo*/}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 0.2,
                        ease: 'easeInOut',
                        delay: 0.1,
                    }}
                    className="absolute left-1/2 -translate-x-1/2"
                >
                    <img src={logo}  alt={'logo'} className={'h-10 invert cursor-pointer hover:scale-105 ' +
                        'transition-all duration-200 ease-standard'} />
                </motion.div>

                {/*signIn*/}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.2,
                        ease: 'easeInOut',
                        delay: 0.08,
                    }}
                >
                    <SecondaryButton onClick={() => navigate('/auth')}>
                        ثبت نام یا ورود
                    </SecondaryButton>
                </motion.div>
            </div>
        </div>
    )
}