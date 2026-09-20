import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import TopBarLayout from '../layouts/TopBarLayout.jsx';
import Box from '../components/ui/Box.jsx';
import { H1, H2, P } from '../components/ui/Headings.jsx';
import { PrimaryButton, SecondaryButton } from '../components/ui/Buttons.jsx';
import { customerApi, storeApi, token, assetUrl } from '../services/api.js';
import { getDashboardUrl } from '../utils/dashboardUrl.js';
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    CreditCard,
    ArrowRight,
    Tag,
    CheckCircle2,
    AlertCircle,
    ShoppingBag
} from 'lucide-react';

function formatPrice(val) {
    if (val === null || val === undefined || val === '') return 'رایگان';
    const num = Number(String(val).replace(/[^0-9]/g, ''));
    if (!Number.isFinite(num) || num === 0) return 'رایگان';
    return `${num.toLocaleString('fa-IR')} تومان`;
}

export default function CartPage() {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');

    const isLoggedIn = !!token();

    const loadCart = async () => {
        try {
            setLoading(true);
            const res = await customerApi.getCart();
            if (res?.ok && res.data) {
                setCart(res.data);
            }
        } catch (err) {
            console.error('Error loading cart:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    const handleUpdateQuantity = async (itemId, newQty) => {
        if (newQty < 1) return;
        try {
            setUpdatingId(itemId);
            const res = await customerApi.updateCartItem(itemId, newQty);
            if (res?.ok && res.data) {
                setCart(res.data);
            }
        } catch (err) {
            console.error('Error updating quantity:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            setUpdatingId(itemId);
            const res = await customerApi.removeFromCart(itemId);
            if (res?.ok && res.data) {
                setCart(res.data);
            }
        } catch (err) {
            console.error('Error removing item:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode.trim()) return;
        try {
            setCouponLoading(true);
            setCouponError('');
            const subtotal = (cart?.items ?? []).reduce(
                (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
                0
            );
            const res = await storeApi.validateCoupon(couponCode.trim(), subtotal);
            if (res?.ok && res.data) {
                setAppliedCoupon(res.data);
            } else {
                setCouponError(res?.message || 'کد تخفیف نامعتبر است');
            }
        } catch (err) {
            setCouponError(err.message || 'کد تخفیف نامعتبر یا منقضی شده است');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleProceedToCheckout = async () => {
        if (!isLoggedIn) {
            window.location.href = getDashboardUrl('/login?redirect=' + encodeURIComponent(window.location.href));
            return;
        }

        try {
            setCheckoutLoading(true);
            setCheckoutError('');
            const res = await customerApi.createOrder(appliedCoupon?.code || null);
            if (res?.ok && res.data?.id) {
                window.location.href = getDashboardUrl('/payments');
            } else {
                window.location.href = getDashboardUrl('/payments');
            }
        } catch (err) {
            setCheckoutError(err.message || 'خطا در ثبت سفارش');
            window.location.href = getDashboardUrl('/payments');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const items = cart?.items || [];
    const subtotal = items.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
        0
    );
    const discountAmount = appliedCoupon?.discountAmount || 0;
    const finalTotal = Math.max(0, subtotal - discountAmount);

    return (
        <MainLayout title="سبد خرید | مدرسه حرکت">
            <TopBarLayout />

            <Box className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-20 min-h-[75vh]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-6 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <ShoppingCart size={24} />
                        </div>
                        <div>
                            <H1 className="text-2xl sm:text-3xl font-extrabold text-foreground">سبد خرید شما</H1>
                            <P className="text-muted text-xs sm:text-sm mt-0.5">
                                دوره‌ها و بسته‌های آموزشی انتخاب شده جهت ثبت‌نام و فعال‌سازی
                            </P>
                        </div>
                    </div>

                    <Link
                        to="/courses"
                        className="hidden sm:flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
                    >
                        <span>ادامه مرور دوره‌ها</span>
                        <ArrowRight size={14} className="rotate-180" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary border-t-transparent" />
                        <P className="text-muted text-sm">در حال بارگذاری سبد خرید...</P>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-[var(--border)] bg-card text-center my-6">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-muted text-muted mb-4">
                            <ShoppingBag size={36} />
                        </div>
                        <H2 className="text-xl font-bold text-foreground mb-2">سبد خرید شما در حال حاضر خالی است</H2>
                        <P className="text-muted text-sm max-w-md mb-6 leading-relaxed">
                            می‌توانید از بخش دوره‌های آموزشی یا پکیج‌های مهارتی، دوره‌های دلخواه خود را به سبد خرید اضافه نمایید.
                        </P>
                        <PrimaryButton onClick={() => navigate('/courses')} className="px-6 py-3">
                            مشاهده دوره‌های آموزشی
                        </PrimaryButton>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Cart Items List (8 cols) */}
                        <div className="lg:col-span-8 flex flex-col gap-4">
                            {items.map((item) => {
                                const isUpdating = updatingId === item.id;
                                const itemTotal = (Number(item.price) || 0) * (item.quantity || 1);

                                return (
                                    <div
                                        key={item.id}
                                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-card shadow-xs transition-all hover:border-primary/30"
                                    >
                                        <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                                            {item.course?.image || item.subscription?.image ? (
                                                <img
                                                    src={assetUrl(item.course?.image || item.subscription?.image)}
                                                    alt={item.course?.name || item.subscription?.name || 'محصول'}
                                                    className="h-20 w-20 sm:h-22 sm:w-22 rounded-xl object-cover border border-[var(--border)] shrink-0"
                                                />
                                            ) : (
                                                <div className="flex h-20 w-20 sm:h-22 sm:w-22 items-center justify-center rounded-xl bg-surface-muted text-muted border border-[var(--border)] shrink-0">
                                                    <ShoppingBag size={28} />
                                                </div>
                                            )}

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                                                        {item.productType === 'subscription' ? 'پلن اشتراک' : 'دوره آموزشی'}
                                                    </span>
                                                    {item.course?.level && (
                                                        <span className="text-[11px] text-muted">
                                                            • {item.course.level}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-sm sm:text-base text-foreground truncate max-w-xs sm:max-w-md">
                                                    {item.course?.name || item.subscription?.name || item.productName || 'دوره آموزشی حرکت'}
                                                </h3>
                                                <p className="text-xs text-primary font-bold mt-1">
                                                    {formatPrice(item.price)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions & Item Total */}
                                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]/40">
                                            {/* Quantity modifier if applicable */}
                                            <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-surface-muted p-1">
                                                <button
                                                    type="button"
                                                    disabled={isUpdating}
                                                    onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                                                    className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-card text-foreground transition-colors disabled:opacity-50"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                                <span className="min-w-6 text-center text-xs font-bold text-foreground">
                                                    {item.quantity || 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    disabled={isUpdating || (item.quantity || 1) <= 1}
                                                    onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                                                    className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-card text-foreground transition-colors disabled:opacity-50"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                            </div>

                                            {/* Delete Item */}
                                            <button
                                                type="button"
                                                disabled={isUpdating}
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:text-danger-600 hover:bg-danger-500/10 transition-colors disabled:opacity-50"
                                                title="حذف از سبد"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary & Checkout (4 cols) */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            {/* Coupon Code Card */}
                            <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-xs">
                                <div className="flex items-center gap-2 mb-3">
                                    <Tag size={16} className="text-primary" />
                                    <h4 className="text-sm font-bold text-foreground">کد تخفیف</h4>
                                </div>
                                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        placeholder="مثال: HAREKAT20"
                                        dir="ltr"
                                        className="flex-1 rounded-xl border border-[var(--border)] bg-surface-muted px-3 py-2 text-xs font-bold text-foreground uppercase placeholder:text-muted focus:outline-none focus:border-primary"
                                    />
                                    <SecondaryButton
                                        type="submit"
                                        disabled={couponLoading || !couponCode.trim()}
                                        className="px-4 py-2 text-xs shrink-0"
                                    >
                                        {couponLoading ? '...' : 'اعمال'}
                                    </SecondaryButton>
                                </form>
                                {appliedCoupon && (
                                    <div className="flex items-center gap-1.5 mt-2.5 text-xs text-success-600 font-bold">
                                        <CheckCircle2 size={14} />
                                        <span>کد تخفیف «{appliedCoupon.code}» با موفقیت اعمال شد.</span>
                                    </div>
                                )}
                                {couponError && (
                                    <div className="flex items-center gap-1.5 mt-2.5 text-xs text-danger-600 font-medium">
                                        <AlertCircle size={14} />
                                        <span>{couponError}</span>
                                    </div>
                                )}
                            </div>

                            {/* Summary Details Card */}
                            <div className="rounded-2xl border border-[var(--border)] bg-card p-6 shadow-xs flex flex-col gap-4">
                                <H2 className="text-lg font-bold text-foreground border-b border-[var(--border)] pb-3">
                                    خلاصه فاکتور
                                </H2>

                                <div className="flex items-center justify-between text-xs sm:text-sm text-muted">
                                    <span>جمع کل دوره‌ها ({items.length}):</span>
                                    <span className="font-bold text-foreground">{formatPrice(subtotal)}</span>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="flex items-center justify-between text-xs sm:text-sm text-success-600 font-semibold">
                                        <span>تخفیف اعمال شده:</span>
                                        <span>- {formatPrice(discountAmount)}</span>
                                    </div>
                                )}

                                <div className="border-t border-[var(--border)] pt-4 flex items-center justify-between">
                                    <span className="text-sm font-bold text-foreground">مبلغ قابل پرداخت:</span>
                                    <span className="text-lg sm:text-xl font-extrabold text-primary">
                                        {formatPrice(finalTotal)}
                                    </span>
                                </div>

                                {checkoutError && (
                                    <div className="text-xs text-danger-600 font-medium bg-danger-500/10 p-2.5 rounded-xl">
                                        {checkoutError}
                                    </div>
                                )}

                                <PrimaryButton
                                    onClick={handleProceedToCheckout}
                                    disabled={checkoutLoading || items.length === 0}
                                    className="w-full py-3.5 mt-2 flex items-center justify-center gap-2 font-bold text-sm shadow-md"
                                >
                                    <CreditCard size={18} />
                                    {checkoutLoading
                                        ? 'در حال انتقال به پرداخت...'
                                        : isLoggedIn
                                        ? 'تکمیل خرید و پرداخت'
                                        : 'ورود به حساب و پرداخت'}
                                </PrimaryButton>

                                <P className="text-[11px] text-muted text-center leading-relaxed">
                                    با کلیک روی تکمیل خرید، به درگاه پرداخت شاپرک یا داشبورد اختصاصی هدایت خواهید شد.
                                </P>
                            </div>
                        </div>
                    </div>
                )}
            </Box>
        </MainLayout>
    );
}
