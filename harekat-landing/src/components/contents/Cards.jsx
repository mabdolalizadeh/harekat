import {cn} from "../../utils/cn.js";
import Img from "../ui/Img.jsx";
import {H2, H3} from "../ui/Headings.jsx";
import {motion} from "motion/react";
import {Clock, User, BookOpen} from "lucide-react";
import {useState} from "react";
import { ShoppingCart } from "lucide-react";
import { customerApi } from "../../services/api.js";

function formatPrice(value) {
    if (value === null || value === undefined || value === '') return 'رایگان';
    const normalized = String(value).replace(/[,٬\s]/g, '');
    const numeric = Number(normalized);
    return `${Number.isFinite(numeric) ? numeric.toLocaleString('fa-IR') : value} تومان`;
}

export function ContentCard({title, subtitle, className}) {
    return (
        <div className={cn('w-100', className)}>
            <H2 className={'border-b border-themed pb-2'}>{title}</H2>
            <p className={'text-muted text-sm'}>{subtitle}</p>
        </div>
    )
}

export function AccordionCard({title, content, className, ...props}) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div
            className={cn(
                'w-full bg-card flex flex-col rounded-lg p-3 sm:p-5',
                'cursor-pointer select-none',
                className
            )}
            onClick={() => setIsOpen(!isOpen)}
            {...props}
        >
            <div className="flex items-center justify-between w-full">
                <H2 className="font-semibold">{title}</H2>
                <div
                    className={cn(
                        'p-px rounded-full bg-black transition-all duration-200 ease-in-out',
                        isOpen && 'rotate-45 bg-muted'
                    )}
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                </div>
            </div>
            <div
                className={cn(
                    'grid w-full transition-[grid-template-rows] duration-200 ease-in-out',
                    isOpen ? 'grid-rows-[1fr] mt-5' : 'grid-rows-[0fr] mt-0'
                )}
            >
                <div className="overflow-hidden text-muted">{content}</div>
            </div>
        </div>
    )
}

export function CourseCard({
    id, title, imgSrc, category, level, duration, courseType, teacher, price, salePrice, registrationStatus, productType = 'course', onAddToCart, className, ...props
}) {
    const [adding, setAdding] = useState(false);
    const hasSale = salePrice !== null && salePrice !== undefined && salePrice !== '' && String(salePrice) !== String(price);
    const add = async (event) => {
        event.stopPropagation();
        if (!id || adding) return;
        setAdding(true);
        try { await customerApi.addToCart(id, productType, 1, hasSale ? salePrice : price); onAddToCart?.(); }
        finally { setAdding(false); }
    };
    return (
        <motion.div
            whileHover={{y: -4}}
            onClick={() => id && (window.location.href = `/products/${id}`)}
            className={cn(
                'bg-card border border-[var(--border)]/10 flex flex-col rounded-[var(--radius-xl)] overflow-hidden',
                'group cursor-pointer transition-all duration-300 hover:border-[var(--border)]/20 hover:shadow-lg hover:shadow-black/20',
                className
            )}
            {...props}
        >
            {/*image*/ }
            <div className={'relative overflow-hidden aspect-square'}>
                <Img
                    src={imgSrc}
                    groupHover={true}
                    className={'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'}
                />
                {/*category badge*/ }
                <div className={'absolute top-3 right-3'}>
                    <span className={
                        'bg-background/80 backdrop-blur-sm text-foreground text-xs px-2.5 py-1 rounded-full border border-[var(--border)]/10'
                    }>
                        {category}
                    </span>
                </div>
                {/*registration badge*/ }
                {registrationStatus && (
                    <div className={'absolute top-3 left-3'}>
                        <span className={cn(
                            'text-xs px-2.5 py-1 rounded-full font-medium',
                            registrationStatus === 'درحال ثبت نام' && 'bg-green-500/20 text-green-400 border border-green-500/30',
                            registrationStatus === 'به‌زودی' && 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
                            registrationStatus === 'تکمیل ظرفیت' && 'bg-red-500/20 text-red-400 border border-red-500/30',
                        )}>
                            {registrationStatus}
                        </span>
                    </div>
                )}
            </div>

            {/*content*/ }
            <div className={'flex flex-col gap-3 p-3 sm:p-4 flex-1'}>
                <H3 className={'text-foreground font-bold text-base leading-snug line-clamp-2'}>{title}</H3>

                <div className={'flex flex-wrap gap-2'}>
                    <span className={'flex items-center gap-1 text-xs text-muted bg-surface-muted px-2 py-0.5 rounded-md'}>
                        <BookOpen size={12}/>{level}
                    </span>
                    <span className={'flex items-center gap-1 text-xs text-muted bg-surface-muted px-2 py-0.5 rounded-md'}>
                        <Clock size={12}/>{duration}
                    </span>
                    <span className={'flex items-center gap-1 text-xs text-muted bg-surface-muted px-2 py-0.5 rounded-md'}>
                        {courseType}
                    </span>
                </div>

                <div className={'mt-auto flex items-center justify-between pt-2 border-t border-[var(--border)]/5'}>
                    <span className={'flex items-center gap-1.5 text-xs text-muted'}>
                        <User size={12}/>{teacher}
                    </span>
                    <div className="flex flex-col items-end">
                        {hasSale && <span className="text-xs text-muted line-through">{formatPrice(price)}</span>}
                        <span className={'text-xs sm:text-sm font-bold text-foreground'}>{formatPrice(hasSale ? salePrice : price)}</span>
                    </div>
                    <button type="button" onClick={add} disabled={!id || adding} className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs text-primary-foreground transition hover:opacity-90 disabled:opacity-50">
                        <ShoppingCart size={13} />{adding ? '...' : 'افزودن'}
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

export function SubscriptionCard({ id, name, image, price, salePrice, buttonText = 'افزودن به سبد', onAddToCart }) {
    return <CourseCard
        id={id}
        title={name}
        imgSrc={image}
        category="اشتراک"
        level=""
        duration="ماهانه"
        courseType="عضویت"
        teacher="حرکت مدیا"
        price={price}
        salePrice={salePrice}
        registrationStatus={buttonText}
        productType="subscription"
        onAddToCart={onAddToCart}
    />;
}
