import logo from '../assets/logo.png';
import {H3} from "../components/ui/Headings.jsx";
import {useNavigate} from "react-router-dom";
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
            <div className={'fixed top-0 pt-15 z-20 w-[95%] bg-ink-950/80 backdrop-blur-sm'}>
                <div className="relative flex w-full items-center justify-between px-5 pb-2 border-b border-b-ink-600 ">
                {/*links*/}
                <div className={'flex gap-3 items-center justify-center'}>
                    {topBarLinks.map((item, index) => (
                        <div key={index}>
                            <H3
                                onClick={() => navigate(item.link)}
                                className={'cursor-pointer hover:text-ink-500 transition-all duration-200 ease-in-out'}
                            >{item.text}</H3>
                        </div>
                    ))}
                </div>
                {/*logo*/}
                <div className="absolute left-1/2 -translate-x-1/2">
                    <img src={logo}  alt={'logo'} className={'h-10 invert cursor-pointer hover:scale-105 ' +
                        'transition-all duration-200 ease-standard'} />
                </div>

                {/*signIn*/}
                <div>
                    <SecondaryButton onClick={() => navigate('/auth')}>
                        ثبت نام یا ورود
                    </SecondaryButton>
                </div>
            </div>
        </div>
    )
}
