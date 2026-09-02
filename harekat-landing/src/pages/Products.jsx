import MainLayout from "../layouts/MainLayout.jsx";
import TopBarLayout from "../layouts/TopBarLayout.jsx";
import {motion} from "motion/react";
import Box from "../components/ui/Box.jsx";
import {H1, H2, H3, P} from "../components/ui/Headings.jsx";
import SectionTag from "../components/ui/SectionTag.jsx";
import {PrimaryButton} from "../components/ui/Buttons.jsx";
import {useNavigate} from "react-router-dom";
import {Star, ShoppingCart} from "lucide-react";

const products = [
    {
        id: 1,
        title: 'پکیج آموزشی طراحی UI/UX',
        description: 'مجموعه کامل آموزش طراحی رابط کاربری با Figma از مبتدی تا پیشرفته. شامل ۴۰ ویدیوی آموزشی، پروژه عملی و فایل‌های منبع.',
        price: '۲۹۹,۰۰۰ تومان',
        originalPrice: '۴۵۰,۰۰۰ تومان',
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600',
        category: 'طراحی',
        rating: 4.8,
        reviews: 124,
        students: 890,
        badge: 'پرفروش‌ترین',
    },
    {
        id: 2,
        title: 'کتاب راهنمای برنامه‌نویسی پایتون',
        description: 'کتاب جامع برنامه‌نویسی پایتون برای فارسی‌زبانان. از مبانی تا پروژه‌های پیشرفته با تمرینات عملی.',
        price: '۱۸۹,۰۰۰ تومان',
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600',
        category: 'برنامه‌نویسی',
        rating: 4.6,
        reviews: 87,
        students: 560,
        badge: 'جدید',
    },
    {
        id: 3,
        title: 'تمپلیت‌های حرفه‌ای طراحی سایت',
        description: 'مجموعه ۲۰ تمپلیت آماده برای طراحی سایت با HTML, CSS و React. واکنش‌گرا و بهینه‌شده.',
        price: '۱۴۹,۰۰۰ تومان',
        originalPrice: '۲۵۰,۰۰۰ تومان',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600',
        category: 'توسعه وب',
        rating: 4.9,
        reviews: 203,
        students: 1200,
        badge: 'پیشنهاد ویژه',
    },
    {
        id: 4,
        title: 'دوره جامع هوش مصنوعی برای هنرمندان',
        description: 'یادگیری استفاده از ابزارهای هوش مصنوعی در خلاقیت بصری. شامل Midjourney, DALL-E و Stable Diffusion.',
        price: '۳۹۹,۰۰۰ تومان',
        originalPrice: '۵۵۰,۰۰۰ تومان',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600',
        category: 'هوش مصنوعی',
        rating: 4.7,
        reviews: 156,
        students: 720,
        badge: null,
    },
    {
        id: 5,
        title: 'اشتراک ماهانه اتاق فکر خلاق',
        description: 'دسترسی ماهانه به جلسات آنلاین اتاق فکر با اساتید برجسته. شامل بازخورد پروژه و شبکه‌سازی حرفه‌ای.',
        price: '۹۹,۰۰۰ تومان / ماه',
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
        category: 'عضویت',
        rating: 4.5,
        reviews: 64,
        students: 310,
        badge: '每月',
    },
    {
        id: 6,
        title: 'پکیج آیکون‌های فلت فارسی',
        description: 'مجموعه ۵۰۰ آیکون فلت طراحی‌شده برای رابط‌های کاربری فارسی. فرمت‌های SVG, PNG و Figma.',
        price: '۷۹,۰۰۰ تومان',
        originalPrice: '۱۲۰,۰۰۰ تومان',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        category: 'طراحی',
        rating: 4.4,
        reviews: 92,
        students: 450,
        badge: null,
    },
];

export default function Products() {
    const navigate = useNavigate();

    return (
        <MainLayout title={'تولیدات'}>
            <TopBarLayout/>

            {/*hero*/ }
            <Box className={'pt-36 sm:pt-40 pb-14 sm:pb-20 gap-4 sm:gap-6'}>
                <SectionTag>تولیدات</SectionTag>
                <H1 className={'text-[clamp(2.5rem,5vw,4rem)] text-center text-foreground max-w-[700px]'}>
                    محصولات و منابع آموزشی
                </H1>
                <P className={'text-center text-muted max-w-[540px] text-[clamp(0.95rem,1.8vw,1.15rem)]'}>
                    کتاب‌ها، پکیج‌ها و ابزارهایی که برای یادگیری و رشد حرفه‌ای نیاز داری.
                </P>
            </Box>

            {/*products grid*/ }
            <Box className={'pb-16 sm:pb-24 gap-6 sm:gap-8 w-full max-w-[1200px] mx-auto'}>
                <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full'}>
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{opacity: 0, y: 24}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true}}
                            transition={{duration: 0.5, delay: index * 0.06}}
                            whileHover={{y: -4}}
                            className={
                                'bg-card border border-[var(--border)] flex flex-col rounded-[var(--radius-xl)] overflow-hidden ' +
                                'group cursor-pointer transition-all duration-300 hover:shadow-lg'
                            }
                        >
                            {/*image*/ }
                            <div className={'relative overflow-hidden aspect-[16/10]'}>
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className={'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'}
                                />
                                <div className={'absolute inset-0 bg-black/20'}/>
                                {product.badge && (
                                    <div className={'absolute top-3 right-3'}>
                                        <span className={
                                            'bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-full font-medium'
                                        }>
                                            {product.badge}
                                        </span>
                                    </div>
                                )}
                                <div className={'absolute top-3 left-3'}>
                                    <span className={
                                        'bg-background/80 backdrop-blur-sm text-foreground text-xs px-2.5 py-1 rounded-full border border-[var(--border)]'
                                    }>
                                        {product.category}
                                    </span>
                                </div>
                            </div>

                            {/*content*/ }
                            <div className={'flex flex-col gap-3 p-4 sm:p-5 flex-1'}>
                                <H3 className={'text-foreground font-bold text-base leading-snug line-clamp-2'}>{product.title}</H3>
                                <P className={'text-muted text-sm leading-relaxed line-clamp-2'}>{product.description}</P>

                                {/*rating*/ }
                                <div className={'flex items-center gap-2'}>
                                    <div className={'flex items-center gap-0.5'}>
                                        <Star size={14} className={'text-yellow-500 fill-yellow-500'}/>
                                        <span className={'text-foreground text-sm font-medium'}>{product.rating}</span>
                                    </div>
                                    <span className={'text-muted text-xs'}>({product.reviews} نظر)</span>
                                    <span className={'text-muted text-xs'}>·</span>
                                    <span className={'text-muted text-xs'}>{product.students} دانشجو</span>
                                </div>

                                {/*price + action*/ }
                                <div className={'mt-auto flex items-center justify-between pt-3 border-t border-[var(--border)]'}>
                                    <div className={'flex flex-col'}>
                                        <span className={'text-foreground font-bold text-sm'}>{product.price}</span>
                                        {product.originalPrice && (
                                            <span className={'text-muted text-xs line-through'}>{product.originalPrice}</span>
                                        )}
                                    </div>
                                    <PrimaryButton className={'text-xs flex items-center gap-1.5 px-3 py-1.5'}>
                                        <ShoppingCart size={14}/>
                                        خرید
                                    </PrimaryButton>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Box>

            {/*cta*/ }
            <Box className={'pb-16 sm:pb-24 gap-4 sm:gap-6'}>
                <H2 className={'text-[clamp(1.5rem,3vw,2.5rem)] text-center text-foreground max-w-[600px]'}>
                    سوالی درباره محصولات داری؟
                </H2>
                <P className={'text-center text-muted max-w-[400px] text-sm'}>
                    با ما تماس بگیر تا بهترین گزینه رو بهت معرفی کنیم.
                </P>
                <PrimaryButton onClick={() => navigate('/contact-us')} className={'text-sm'}>
                    تماس با ما
                </PrimaryButton>
            </Box>
        </MainLayout>
    )
}
