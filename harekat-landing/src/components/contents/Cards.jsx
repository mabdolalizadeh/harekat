import {cn} from "../../utils/cn.js";
import Img from "../ui/Img.jsx";
import {H2, H3} from "../ui/Headings.jsx";
import {motion} from "motion/react";
import {Clock, User, BookOpen, Plus} from "lucide-react";
import {useState, useRef} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../contexts/CartContext.jsx";

function formatPrice(value) {
    if (value === null || value === undefined || value === '') return 'رایگان';
    const normalized = String(value)
        .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
        .replace(/[,٬\s]/g, '');
    const numeric = Number(normalized);
    if (!Number.isFinite(numeric) || numeric === 0) return 'رایگان';
    return `${numeric.toLocaleString('fa-IR')} تومان`;
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
                        'accordion-toggle p-px rounded-full transition-all duration-200 ease-in-out',
                        isOpen && 'rotate-45'
                    )}
                >
                    <Plus />
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
    id, title, imgSrc, category, level, duration, courseType, teacher, price, salePrice, registrationStatus, productType = 'course', kind = 'regular', onAddToCart, className, ...props
}) {
    const [adding, setAdding] = useState(false);
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const isSubscription = productType === 'subscription';
    const hasSale = salePrice !== null && salePrice !== undefined && salePrice !== '' && String(salePrice) !== String(price);

    const getDetailPath = () => {
        if (kind === 'capsule') return `/capsules/${id}`;
        if (kind === 'skill') return `/packages/${id}`;
        return `/courses/${id}`;
    };

    const add = async (event) => {
        event.stopPropagation();
        if (!id || adding) return;

        setAdding(true);
        try {
            await addToCart(id, productType, 1, hasSale ? salePrice : price);
            onAddToCart?.();
        } catch (err) {
            console.error('Failed to add to cart:', err);
        } finally {
            setAdding(false);
        }
    };

    const handleDragStart = (e) => {
        if (!id || isSubscription) return;
        const dragData = JSON.stringify({
            id,
            title,
            type: productType,
            price: hasSale ? salePrice : price,
        });
        e.dataTransfer.setData('application/harekat-item', dragData);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current || window.matchMedia("(pointer: coarse)").matches) return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        // Smooth magnetic pull strength
        const pullFactor = 0.14;
        const tiltFactor = 0.035;

        setMagneticOffset({
            x: deltaX * pullFactor,
            y: deltaY * pullFactor,
            rotateX: -deltaY * tiltFactor,
            rotateY: deltaX * tiltFactor,
        });
    };

    const handleMouseLeave = () => {
        setMagneticOffset({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
    };

    return (
        <motion.div
            ref={cardRef}
            draggable={!isSubscription}
            onDragStart={handleDragStart}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{
                x: magneticOffset.x,
                y: magneticOffset.y,
                rotateX: magneticOffset.rotateX,
                rotateY: magneticOffset.rotateY,
            }}
            transition={{
                type: "spring",
                stiffness: 220,
                damping: 18,
                mass: 0.6,
            }}
            style={{
                transformStyle: "preserve-3d",
                perspective: 800,
            }}
            onClick={() => id && !isSubscription && navigate(getDetailPath())}
            className={cn(
                'bg-card border border-border/10 flex flex-col rounded-xl overflow-hidden will-change-transform',
                'group transition-[border-color,box-shadow] duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10',
                !isSubscription && 'cursor-pointer active:cursor-grabbing',
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
                <div className={'absolute bottom-3 right-3'}>
                    <span className={
                        'bg-background backdrop-blur-sm text-foreground text-xs px-2.5 py-1 rounded-full border border-border/10'
                    }>
                        {category}
                    </span>
                </div>
                {/*registration badge*/ }
                {registrationStatus && (
                    <div className={'absolute bottom-3 left-3'}>
                        <span className={cn(
                            'text-xs px-2.5 py-1 rounded-full font-medium',
                            registrationStatus === 'در حال ثبت نام' && 'bg-green-950/80 text-green-400 border border-green-500/30',
                            registrationStatus === 'بزودی' && 'bg-yellow-950/80 text-yellow-400 border border-yellow-500/30',
                            registrationStatus === 'تکمیل ظرفیت' && 'bg-red-950/80 text-red-400 border border-red-500/30',
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

                <div className={'mt-auto flex items-center justify-between pt-2 border-t border-border/5'}>
                    <span className={'flex items-center gap-1.5 text-xs text-muted'}>
                        <User size={12}/>{teacher}
                    </span>
                    <div className="flex flex-col items-end">
                        {hasSale && <span className="text-xs text-muted line-through">{formatPrice(price)}</span>}
                        <span className={'text-xs sm:text-sm font-bold text-foreground'}>{formatPrice(hasSale ? salePrice : price)}</span>
                    </div>
                    <button type="button" onClick={add} disabled={!id || adding} className="flex items-center gap-1 rounded-full bg-primary p-2 text-xs text-primary-foreground transition hover:opacity-90 disabled:opacity-50">
                        <ShoppingCart size={20} />
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
        teacher="مدرسه حرکت"
        price={price}
        salePrice={salePrice}
        registrationStatus={buttonText}
        productType="subscription"
        onAddToCart={onAddToCart}
    />;
}
