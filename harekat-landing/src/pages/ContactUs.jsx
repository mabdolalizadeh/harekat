import MainLayout from "../layouts/MainLayout.jsx";
import TopBarLayout from "../layouts/TopBarLayout.jsx";
import {motion} from "motion/react";
import Box from "../components/ui/Box.jsx";
import {H1, H2, P} from "../components/ui/Headings.jsx";
import SectionTag from "../components/ui/SectionTag.jsx";
import {PrimaryButton} from "../components/ui/Buttons.jsx";
import {Mail, MapPin, Phone, Clock, Send} from "lucide-react";
import {useState} from "react";

export default function ContactUs() {
    const [formState, setFormState] = useState({name: '', email: '', subject: '', message: ''});

    const handleChange = (e) => {
        setFormState(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    return (
        <MainLayout title={'تماس با ما'} sectionIds={null} contentMap={null}>
            <TopBarLayout/>

            <Box className={'pt-40 pb-24 gap-6'}>
                <SectionTag>تماس با ما</SectionTag>
                <H1 className={'text-[clamp(2.5rem,5vw,4rem)] text-center text-foreground max-w-[700px]'}>
                    با ما در ارتباط باش
                </H1>
                <P className={'text-center text-muted max-w-[540px] text-[clamp(0.95rem,1.8vw,1.15rem)]'}>
                    خوشحالیم به سوالاتت جواب بدیم و درباره دوره‌ها، ثبت‌نام و شرایط همکاری صحبت کنیم.
                </P>
            </Box>

            <Box className={'pb-24 gap-16 w-full max-w-[1000px] mx-auto'}>
                {/*info cards*/ }
                <div className={'grid grid-cols-1 sm:grid-cols-3 gap-5 w-full'}>
                    {[
                        {icon: Mail, title: 'ایمیل', value: 'info@schoolharekat.ir', href: 'mailto:info@schoolharekat.ir'},
                        {icon: Phone, title: 'تلفن', value: '۰۲۱-۱۲۳۴۵۶۷۸', href: 'tel:+982112345678'},
                        {icon: MapPin, title: 'آدرس', value: 'تهران، خیابان ولیعصر', href: null},
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{opacity: 0, y: 24}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true}}
                            transition={{duration: 0.5, delay: index * 0.08}}
                            className={
                                'bg-card border border-[var(--border)] rounded-[var(--radius-xl)] p-6 flex flex-col gap-3'
                            }
                        >
                            <div className={'flex items-center gap-3'}>
                                <div className={'w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center'}>
                                    <item.icon size={18} className={'text-muted'}/>
                                </div>
                                <H2 className={'text-foreground text-sm font-semibold'}>{item.title}</H2>
                            </div>
                            {item.href ? (
                                <a href={item.href} className={'text-foreground/70 text-sm hover:text-foreground transition-colors'}>
                                    {item.value}
                                </a>
                            ) : (
                                <span className={'text-foreground/70 text-sm'}>{item.value}</span>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/*form*/ }
                <motion.div
                    initial={{opacity: 0, y: 24}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true}}
                    transition={{duration: 0.6}}
                    className={'w-full'}
                >
                    <form
                        className={'flex flex-col gap-5 w-full'}
                        onSubmit={(e) => e.preventDefault()}
                    >
                        <div className={'grid grid-cols-1 sm:grid-cols-2 gap-5'}>
                            <div className={'flex flex-col gap-2'}>
                                <label className={'text-muted text-sm'}>نام</label>
                                <input
                                    name={'name'}
                                    value={formState.name}
                                    onChange={handleChange}
                                    placeholder={'نام خودت رو وارد کن'}
                                    className={
                                        'bg-card border border-[var(--border)] rounded-[var(--radius-md)] px-4 py-3 text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-[var(--border)]/30 transition-colors'
                                    }
                                />
                            </div>
                            <div className={'flex flex-col gap-2'}>
                                <label className={'text-muted text-sm'}>ایمیل</label>
                                <input
                                    name={'email'}
                                    type={'email'}
                                    value={formState.email}
                                    onChange={handleChange}
                                    placeholder={'example@email.com'}
                                    className={
                                        'bg-card border border-[var(--border)] rounded-[var(--radius-md)] px-4 py-3 text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-[var(--border)]/30 transition-colors'
                                    }
                                />
                            </div>
                        </div>
                        <div className={'flex flex-col gap-2'}>
                            <label className={'text-muted text-sm'}>موضوع</label>
                            <input
                                name={'subject'}
                                value={formState.subject}
                                onChange={handleChange}
                                placeholder={'چطور می‌تونیم کمکت کنیم؟'}
                                className={
                                    'bg-card border border-[var(--border)] rounded-[var(--radius-md)] px-4 py-3 text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-[var(--border)]/30 transition-colors'
                                }
                            />
                        </div>
                        <div className={'flex flex-col gap-2'}>
                            <label className={'text-muted text-sm'}>پیام</label>
                            <textarea
                                name={'message'}
                                rows={5}
                                value={formState.message}
                                onChange={handleChange}
                                placeholder={'پیامت رو بنویس...'}
                                className={
                                    'bg-card border border-[var(--border)] rounded-[var(--radius-md)] px-4 py-3 text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-[var(--border)]/30 transition-colors resize-none'
                                }
                            />
                        </div>
                        <div>
                            <PrimaryButton className={'flex items-center gap-2 px-6 py-2.5'}>
                                <Send size={16}/>
                                ارسال پیام
                            </PrimaryButton>
                        </div>
                    </form>
                </motion.div>

                {/*working hours*/ }
                <motion.div
                    initial={{opacity: 0, y: 24}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true}}
                    transition={{duration: 0.6}}
                    className={'bg-card border border-[var(--border)] rounded-[var(--radius-xl)] p-6 w-full'}
                >
                    <div className={'flex items-center gap-3 mb-4'}>
                        <Clock size={18} className={'text-muted'}/>
                        <H2 className={'text-foreground text-sm font-semibold'}>ساعات کاری</H2>
                    </div>
                    <div className={'flex flex-col gap-2'}>
                        {[
                            {day: 'شنبه تا چهارشنبه', time: '۹ صبح - ۶ عصر'},
                            {day: 'پنجشنبه', time: '۹ صبح - ۱ ظهر'},
                            {day: 'جمعه', time: 'تعطیل'},
                        ].map((item, i) => (
                            <div key={i} className={'flex justify-between items-center text-sm'}>
                                <span className={'text-muted'}>{item.day}</span>
                                <span className={'text-foreground/70'}>{item.time}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </Box>
        </MainLayout>
    )
}
