import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    ShoppingCart,
    X,
    Trash2,
    Plus,
    Minus,
    ArrowLeft,
    CreditCard,
    ShoppingBag,
    Tag,
    CheckCircle2,
    AlertCircle,
    ExternalLink
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext.jsx';
import { storeApi, customerApi, token, assetUrl } from '../../services/api.js';
import { getDashboardUrl } from '../../utils/dashboardUrl.js';
import { PrimaryButton, SecondaryButton } from '../ui/Buttons.jsx';
import { cn } from '../../utils/cn.js';

function formatPrice(val) {
    if (val === null || val === undefined || val === '') return 'رایگان';
    const num = Number(String(val).replace(/[^0-9]/g, ''));
    if (!Number.isFinite(num) || num === 0) return 'رایگان';
    return `${num.toLocaleString('fa-IR')} تومان`;
}

function getItemTypeLabel(item) {
    if (item.productType === 'subscription') return 'پلن اشتراک';
    if (item.course?.kind === 'capsule') return 'آموزش کپسولی';
    if (item.course?.kind === 'skill') return 'پکیج مهارتی';
    return 'دوره آموزشی';
}

export default function CartDrawer() {
    const navigate = useNavigate();
    const {
        items,
        itemCount,
        subtotal,
        isOpen,
        closeCart,
        updateQuantity,
        removeItem,
        clearCart,
        loading
    } = useCart();

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const isLoggedIn = !!token();

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode.trim()) return;
        try {
            setCouponLoading(true);
            setCouponError('');
            const res = await storeApi.validateCoupon(couponCode.trim(), subtotal);
            if (res?.ok && res.data) {
                setAppliedCoupon(res.data);
            } else {
                setCouponError(res?.message || 'کد تخفیف نامعتبر است');
            }
        } catch (err) {
            setCouponError(err.message || 'کد تخفیف نامعتبر یا منقضی است');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (!isLoggedIn) {
            closeCart();
            window.location.href = getDashboardUrl('/login?redirect=' + encodeURIComponent(window.location.href));
            return;
        }

        try {
            setCheckoutLoading(true);
            const res = await customerApi.createOrder(appliedCoupon?.code || null);
            closeCart();
            window.location.href = getDashboardUrl('/payments');
        } catch (err) {
            closeCart();
            window.location.href = getDashboardUrl('/payments');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const discountAmount = appliedCoupon?.discountAmount || 0;
    const finalTotal = Math.max(0, subtotal - discountAmount);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={closeCart}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
                    />

                    {/* Drawer Content */}
                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                        className="fixed top-0 bottom-0 left-0 z-50 flex flex-col w-full max-w-md bg-background border-r border-[var(--border)] shadow-2xl overflow-hidden"
                    >
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]/70 bg-card/60 backdrop-blur-md">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                                    <ShoppingCart size={18} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-foreground">سبد خرید</h2>
                                    <p className="text-[11px] text-muted font-medium">
                                        {itemCount > 0 ? `${itemCount.toLocaleString('fa-IR')} مورد انتخاب شده` : 'سبد خرید خالی'}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeCart}
                                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-muted text-muted hover:text-foreground transition-colors"
                                title="بستن"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-4">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-muted text-muted/60 mb-4">
                                        <ShoppingBag size={36} />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground mb-1">
                                        سبد خرید شما در حال حاضر خالی است
                                    </h3>
                                    <p className="text-xs text-muted max-w-xs mb-6 leading-relaxed">
                                        دوره‌ها و پکیج‌های دلخواه خود را به سبد خرید اضافه کنید تا در این بخش نمایش داده شوند.
                                    </p>
                                    <PrimaryButton
                                        onClick={() => {
                                            closeCart();
                                            navigate('/courses');
                                        }}
                                        className="px-5 py-2.5 text-xs font-bold"
                                    >
                                        مشاهده دوره‌های آموزشی
                                    </PrimaryButton>
                                </div>
                            ) : (
                                <>
                                    {/* Items List */}
                                    <div className="space-y-3">
                                        {items.map((item) => {
                                            const itemImage = item.course?.image || item.subscription?.image || item.productImage;
                                            const itemName = item.course?.name || item.subscription?.name || item.productName || 'دوره آموزشی حرکت';
                                            const itemPrice = Number(item.price) || 0;
                                            const typeLabel = getItemTypeLabel(item);

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="group relative flex gap-3 p-3 rounded-2xl border border-[var(--border)]/70 bg-card hover:border-primary/40 transition-all shadow-2xs"
                                                >
                                                    {/* Thumbnail */}
                                                    {itemImage ? (
                                                        <img
                                                            src={assetUrl(itemImage)}
                                                            alt={itemName}
                                                            className="h-18 w-18 rounded-xl object-cover border border-[var(--border)]/60 shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="flex h-18 w-18 items-center justify-center rounded-xl bg-surface-muted text-muted border border-[var(--border)]/60 shrink-0">
                                                            <ShoppingBag size={22} />
                                                        </div>
                                                    )}

                                                    {/* Details */}
                                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                                <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 rounded-md bg-primary/10">
                                                                    {typeLabel}
                                                                </span>
                                                            </div>
                                                            <h4 className="text-xs font-bold text-foreground truncate" title={itemName}>
                                                                {itemName}
                                                            </h4>
                                                        </div>

                                                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-[var(--border)]/40">
                                                            <span className="text-xs font-extrabold text-primary">
                                                                {formatPrice(itemPrice)}
                                                            </span>

                                                            {/* Actions (Qty + Remove) */}
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-surface-muted px-1 py-0.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                                                                        className="p-0.5 hover:text-foreground text-muted transition-colors"
                                                                    >
                                                                        <Plus size={12} />
                                                                    </button>
                                                                    <span className="text-[11px] font-bold px-1 text-foreground">
                                                                        {(item.quantity || 1).toLocaleString('fa-IR')}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if ((item.quantity || 1) > 1) {
                                                                                updateQuantity(item.id, item.quantity - 1);
                                                                            } else {
                                                                                removeItem(item.id);
                                                                            }
                                                                        }}
                                                                        className="p-0.5 hover:text-foreground text-muted transition-colors"
                                                                    >
                                                                        <Minus size={12} />
                                                                    </button>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeItem(item.id)}
                                                                    className="p-1 rounded-lg text-muted hover:text-danger-600 hover:bg-danger-500/10 transition-colors"
                                                                    title="حذف"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Coupon Code Accordion / Box */}
                                    <div className="p-3.5 rounded-2xl border border-[var(--border)]/70 bg-card/60">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Tag size={14} className="text-primary" />
                                            <span className="text-xs font-bold text-foreground">کد تخفیف</span>
                                        </div>
                                        <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                placeholder="مثال: HAREKAT10"
                                                dir="ltr"
                                                className="flex-1 rounded-xl border border-[var(--border)] bg-surface-muted px-3 py-1.5 text-xs font-bold uppercase text-foreground focus:outline-none focus:border-primary placeholder:text-muted"
                                            />
                                            <button
                                                type="submit"
                                                disabled={couponLoading || !couponCode.trim()}
                                                className="px-3.5 py-1.5 rounded-xl bg-surface-muted hover:bg-border text-xs font-bold text-foreground transition-colors disabled:opacity-50"
                                            >
                                                {couponLoading ? '...' : 'اعمال'}
                                            </button>
                                        </form>

                                        {appliedCoupon && (
                                            <div className="flex items-center gap-1 mt-2 text-[11px] text-success-600 font-bold">
                                                <CheckCircle2 size={13} />
                                                <span>تخفیف «{appliedCoupon.code}» اعمال شد.</span>
                                            </div>
                                        )}
                                        {couponError && (
                                            <div className="flex items-center gap-1 mt-2 text-[11px] text-danger-600 font-medium">
                                                <AlertCircle size={13} />
                                                <span>{couponError}</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Drawer Footer */}
                        {items.length > 0 && (
                            <div className="p-4 border-t border-[var(--border)]/80 bg-card/90 backdrop-blur-md space-y-3">
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between text-muted">
                                        <span>جمع اقلام:</span>
                                        <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex items-center justify-between text-success-600 font-semibold">
                                            <span>تخفیف:</span>
                                            <span>- {formatPrice(discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-[var(--border)]/60 flex items-center justify-between">
                                        <span className="font-bold text-foreground text-sm">مبلغ قابل پرداخت:</span>
                                        <span className="text-base font-black text-primary">
                                            {formatPrice(finalTotal)}
                                        </span>
                                    </div>
                                </div>

                                <PrimaryButton
                                    onClick={handleCheckout}
                                    disabled={checkoutLoading}
                                    className="w-full py-3 flex items-center justify-center gap-2 font-bold text-xs shadow-md"
                                >
                                    <CreditCard size={15} />
                                    {checkoutLoading
                                        ? 'در حال پردازش...'
                                        : isLoggedIn
                                        ? 'تکمیل خرید و پرداخت'
                                        : 'ورود به حساب و پرداخت'}
                                </PrimaryButton>

                                <div className="flex items-center justify-between pt-1 text-[11px] text-muted">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            closeCart();
                                            navigate('/cart');
                                        }}
                                        className="hover:text-primary transition-colors flex items-center gap-1 font-semibold"
                                    >
                                        <span>مشاهده جزئیات کامل سبد</span>
                                        <ArrowLeft size={12} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={clearCart}
                                        className="hover:text-danger-600 transition-colors"
                                    >
                                        پاک کردن سبد
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
