import MainLayout from "../layouts/MainLayout.jsx";
import TopBarLayout from "../layouts/TopBarLayout.jsx";
import {motion} from "motion/react";
import Box from "../components/ui/Box.jsx";
import {H1, P} from "../components/ui/Headings.jsx";
import SectionTag from "../components/ui/SectionTag.jsx";
import {PrimaryButton} from "../components/ui/Buttons.jsx";
import {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {ArrowLeft, Phone, KeyRound} from "lucide-react";
import {cn} from "../utils/cn.js";
import {authApi} from "../services/api.js";
import {getDashboardUrl} from "../utils/dashboardUrl.js";


const errorTranslations = {
    'Too many attempts. Please try again later.': 'تعداد تلاش‌های شما بیش از حد مجاز است. لطفاً بعداً دوباره تلاش کنید.',
    'Invalid OTP': 'کد تایید نادرست است',
    'User not found': 'کاربر یافت نشد',
    'OTP expired': 'کد تایید منقضی شده است',
    'Invalid phone number': 'شماره تلفن نادرست است',
};

function translateError(msg) {
    return errorTranslations[msg] || msg;
}

export default function Auth() {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!phone || phone.length < 10) {
            setError('شماره تلفن معتبر وارد کنید');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await authApi.requestOtp(phone);
            setStep('otp');
        } catch (err) {
            setError(translateError(err.message) || 'خطا در ارسال کد');
        } finally {
            setLoading(false);
        }
    };

    const handleValidateOtp = async (phoneNumber, otpCode) => {
        setLoading(true);
        setError('');
        try {
            const json = await authApi.validateOtp(phoneNumber, otpCode);
            localStorage.setItem('token', json.data.token);
            localStorage.setItem('user', JSON.stringify(json.data.user));
            const from = location.state?.from;
            if (from && typeof from === 'string' && from !== '/dashboard') {
                navigate(from, {replace: true});
            } else {
                window.location.href = getDashboardUrl();
            }
        } catch (err) {

            setError(translateError(err.message) || 'کد تایید نادرست است');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitOtp = (e) => {
        e.preventDefault();
        if (!otp || otp.length < 4) {
            setError('کد تایید را وارد کنید');
            return;
        }
        handleValidateOtp(phone, otp);
    };

    return (
        <MainLayout title={'ورود'} sectionIds={null} contentMap={null}>
            <TopBarLayout/>

            <Box className={'pt-40 pb-24 gap-8 min-h-[70vh]'}>
                <SectionTag>ورود / ثبت نام</SectionTag>
                <H1 className={'text-[clamp(2rem,4vw,3.5rem)] text-center text-foreground max-w-[500px]'}>
                    {step === 'phone' ? 'شماره تلفنت رو وارد کن' : 'کد تایید رو وارد کن'}
                </H1>
                <P className={'text-center text-muted max-w-[400px] text-sm'}>
                    {step === 'phone'
                        ? 'یک کد تایید به شماره‌ات ارسال می‌شه'
                        : `کد ۶ رقمی به ${phone} ارسال شد`
                    }
                </P>

                <motion.div
                    key={step}
                    initial={{opacity: 0, x: step === 'otp' ? 20 : -20}}
                    animate={{opacity: 1, x: 0}}
                    transition={{duration: 0.3}}
                    className={'w-full max-w-[400px]'}
                >
                    {step === 'phone' ? (
                        <form onSubmit={handleRequestOtp} className={'flex flex-col gap-4'}>
                            <div className={'relative'}>
                                <Phone size={18} className={'absolute right-4 top-1/2 -translate-y-1/2 text-muted'}/>
                                <input
                                    type={'tel'}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder={'09123456789'}
                                    dir={'ltr'}
                                    className={
                                        'w-full bg-card border border-[var(--border)] rounded-[var(--radius-md)] pr-12 pl-4 py-3.5 text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-[var(--border)]/30 transition-colors'
                                    }
                                />
                            </div>
                            {error && <span className={'text-danger-500 text-xs'}>{error}</span>}
                            <PrimaryButton
                                type={'submit'}
                                disabled={loading}
                                className={cn('w-full py-3 text-sm', loading && 'opacity-50 cursor-not-allowed')}
                            >
                                {loading ? 'در حال ارسال...' : 'ارسال کد تایید'}
                            </PrimaryButton>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmitOtp} className={'flex flex-col gap-4'}>
                            <div className={'relative'}>
                                <KeyRound size={18} className={'absolute right-4 top-1/2 -translate-y-1/2 text-muted'}/>
                                <input
                                    type={'text'}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder={'123456'}
                                    dir={'ltr'}
                                    maxLength={6}
                                    className={
                                        'w-full bg-card border border-[var(--border)] rounded-[var(--radius-md)] pr-12 pl-4 py-3.5 text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-[var(--border)]/30 transition-colors tracking-widest text-center text-lg'
                                    }
                                />
                            </div>
                            {error && <span className={'text-danger-500 text-xs'}>{error}</span>}
                            <PrimaryButton
                                type={'submit'}
                                disabled={loading}
                                className={cn('w-full py-3 text-sm', loading && 'opacity-50 cursor-not-allowed')}
                            >
                                {loading ? 'در حال بررسی...' : 'تایید و ورود'}
                            </PrimaryButton>
                            <button
                                type={'button'}
                                onClick={() => { setStep('phone'); setError(''); setOtp(''); }}
                                className={'flex items-center justify-center gap-2 text-muted text-xs hover:text-foreground/70 transition-colors'}
                            >
                                <ArrowLeft size={14}/>
                                تغییر شماره تلفن
                            </button>
                        </form>
                    )}
                </motion.div>

            </Box>
        </MainLayout>
    )
}
