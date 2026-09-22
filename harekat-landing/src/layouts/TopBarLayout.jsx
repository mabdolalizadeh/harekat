import Logo from "../components/ui/Logo.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { SecondaryButton } from "../components/ui/Buttons.jsx";
import {
    Menu,
    X,
    Sun,
    Moon,
    ShoppingCart,
    UserRound,
    ChevronDown,
    LayoutDashboard,
    BookOpen,
    CreditCard,
    LogOut
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "../utils/cn.js";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useCart } from "../contexts/CartContext.jsx";
import { storeApi, authApi, token, assetUrl } from "../services/api.js";
import { getDashboardUrl } from "../utils/dashboardUrl.js";

function scrollToId(id) {
    if (window.__lenis) {
        window.__lenis.scrollTo('#' + id, { offset: -70, duration: 1.2 });
        return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function TopBarLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, setTheme } = useTheme();
    const { itemCount, openCart } = useCart();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!token());
    const [apiLinks, setApiLinks] = useState(null);
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
    });
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Scroll listener for sticky navbar styling
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch CMS Header Menu
    useEffect(() => {
        let cancelled = false;
        storeApi.getHeaderMenu().then((response) => {
            if (!cancelled && Array.isArray(response?.data) && response.data.length) {
                setApiLinks(response.data.map((item) => ({
                    text: item.label,
                    link: item.link,
                    scrollId: item.scrollId || null
                })));
            }
        }).catch(() => {});
        return () => { cancelled = true; };
    }, []);

    // Sync Auth and User state
    const syncAuth = () => {
        const hasToken = !!token();
        setIsLoggedIn(hasToken);
        if (hasToken) {
            authApi.getMe()
                .then((res) => {
                    if (res?.ok && res.data?.user) {
                        setUser(res.data.user);
                        localStorage.setItem('user', JSON.stringify(res.data.user));
                    }
                })
                .catch(() => {
                    try { setUser(JSON.parse(localStorage.getItem('user') || 'null')); } catch { setUser(null); }
                });
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        syncAuth();
        const onStorage = () => syncAuth();
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const handleLogout = () => {
        authApi.logout();
        setIsLoggedIn(false);
        setUser(null);
        setProfileOpen(false);
        setMobileOpen(false);
        navigate('/');
    };

    const fallbackLinks = [
        { text: 'خانه', link: '/#hero', scrollId: 'hero' },
        { text: 'دوره‌ها', link: '/#courses', scrollId: 'courses' },
        { text: 'پکیج‌های مهارت', link: '/packages', scrollId: null },
        { text: 'درباره ما', link: '/about-us', scrollId: null },
        { text: 'تماس با ما', link: '/contact-us', scrollId: null },
    ];
    const topBarLinks = apiLinks || fallbackLinks;

    const handleNav = (item) => {
        setMobileOpen(false);
        if (item.scrollId) {
            navigate(`/#${item.scrollId}`);
            return;
        }
        navigate(item.link);
    };

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            setTimeout(() => scrollToId(id), 100);
        }
    }, [location]);

    const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || user?.name || user?.full_name || '';
    const userPhone = user?.phoneNumber || user?.phone_number || user?.phone || '';
    const displayName = userName || userPhone || 'حساب کاربری';

    return (
        <div className={cn('fixed top-0 z-50 w-full transition-all duration-300', scrolled ? 'pt-3' : 'pt-5')}>
            <div
                className={cn(
                    'mx-auto max-w-[var(--container-8xl)] px-6 sm:px-8 py-1.5',
                    'transition-all duration-300 rounded-full',
                    'backdrop-blur-xl',
                    scrolled
                        ? 'shadow-lg shadow-black/10 border-border/50 bg-background/15'
                        : ''
                )}
            >
                <div className="flex items-center justify-between">
                    {/* Brand Logo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, ease: 'easeInOut', delay: 0.1 }}
                    >
                        <Logo
                            className="h-10 md:h-14 text-foreground cursor-pointer hover:opacity-85 transition-opacity duration-200"
                            onClick={() => {
                                navigate('/');
                                setTimeout(() => scrollToId('hero'), 100);
                            }}
                        />
                    </motion.div>

                    {/* Navigation Links - Desktop */}
                    <div className="hidden md:flex gap-6 items-center justify-center">
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
                                <span
                                    onClick={() => handleNav(item)}
                                    className="cursor-pointer text-muted hover:text-foreground transition-all duration-200 ease-in-out text-[18px] font-medium select-none"
                                >
                                    {item.text}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Right Actions (Theme + Cart + Auth/Avatar) - Desktop */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut', delay: 0.08 }}
                        className="hidden md:flex items-center gap-3"
                    >
                        {/* Theme Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 bg-surface-muted hover:bg-border text-muted hover:text-foreground hover:rotate-45"
                            title={theme === 'dark' ? 'حالت روشن' : 'حالت تاریک'}
                        >
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </button>

                        {/* If Logged In: Show Cart Button + User Avatar Dropdown */}
                        {isLoggedIn ? (
                            <>
                                {/* Cart Button */}
                                <button
                                    type="button"
                                    onClick={openCart}
                                    className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-surface-muted hover:bg-border text-foreground transition-colors cursor-pointer"
                                    title="سبد خرید"
                                >
                                    <ShoppingCart size={16} />
                                    {itemCount > 0 && (
                                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground">
                                            {itemCount}
                                        </span>
                                    )}
                                </button>

                                {/* User Avatar with Dropdown Menu */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setProfileOpen((prev) => !prev)}
                                        className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-surface-muted hover:bg-border p-1 pr-2.5 text-xs text-foreground transition-colors cursor-pointer"
                                    >
                                        <span className="font-semibold max-w-28 truncate">{displayName}</span>
                                        {/* Default profile icon avatar */}
                                        <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-primary">
                                            {user?.avatar ? (
                                                <img src={assetUrl(user.avatar)} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <UserRound size={15} />
                                            )}
                                        </span>
                                        <ChevronDown size={13} className={cn('text-muted transition-transform', profileOpen && 'rotate-180')} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {profileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute left-0 top-full z-50 mt-2 flex min-w-48 flex-col rounded-2xl border border-zinc-800 bg-[#141416] p-1.5 shadow-2xl shadow-black/60"
                                            >
                                                <div className="px-3 py-2 border-b border-zinc-800/80 mb-1">
                                                    <p className="text-xs font-bold text-zinc-100 truncate">{displayName}</p>
                                                    {user?.phoneNumber && (
                                                        <p className="text-[11px] text-zinc-400 dir-ltr text-right mt-0.5">{user.phoneNumber}</p>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-right text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800/70 transition-colors cursor-pointer"
                                                    onClick={() => {
                                                        setProfileOpen(false);
                                                        window.location.href = getDashboardUrl('/overview');
                                                    }}
                                                >
                                                    <LayoutDashboard size={15} className="text-primary" />
                                                    <span>داشبورد کاربری</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-right text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800/70 transition-colors cursor-pointer"
                                                    onClick={() => {
                                                        setProfileOpen(false);
                                                        window.location.href = getDashboardUrl('/courses');
                                                    }}
                                                >
                                                    <BookOpen size={15} className="text-primary" />
                                                    <span>دوره‌های من</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-right text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800/70 transition-colors cursor-pointer"
                                                    onClick={() => {
                                                        setProfileOpen(false);
                                                        window.location.href = getDashboardUrl('/payments');
                                                    }}
                                                >
                                                    <CreditCard size={15} className="text-primary" />
                                                    <span>سفارشات و پرداخت‌ها</span>
                                                </button>

                                                <div className="border-t border-zinc-800/80 my-1" />

                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-right text-xs font-bold text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
                                                    onClick={handleLogout}
                                                >
                                                    <LogOut size={15} />
                                                    <span>خروج از حساب</span>
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <SecondaryButton
                                className="text-[16px] px-4 py-1.5 font-medium"
                                onClick={() => {
                                    window.location.href = getDashboardUrl('/login?redirect=' + encodeURIComponent(window.location.href));
                                }}
                            >
                                ورود
                            </SecondaryButton>
                        )}
                    </motion.div>

                    {/* Mobile Menu & Theme Button */}
                    <div className="flex md:hidden items-center gap-2">
                        {/* Theme Toggle Button - always visible in mobile topbar */}
                        <button
                            type="button"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 bg-surface-muted hover:bg-border text-muted hover:text-foreground cursor-pointer"
                            title={theme === 'dark' ? 'حالت روشن' : 'حالت تاریک'}
                        >
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </button>

                        {isLoggedIn && (
                            <button
                                type="button"
                                onClick={openCart}
                                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-surface-muted text-foreground cursor-pointer"
                                title="سبد خرید"
                            >
                                <ShoppingCart size={16} />
                                {itemCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground">
                                        {itemCount}
                                    </span>
                                )}
                            </button>
                        )}

                        <button
                            className="text-foreground p-2 cursor-pointer"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-[var(--border)] px-6 py-6 flex flex-col gap-4 z-40"
                    >
                        {/* If logged in on mobile, show user summary */}
                        {isLoggedIn && (
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-muted border border-[var(--border)]">
                                <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-primary shrink-0">
                                    {user?.avatar ? (
                                        <img src={assetUrl(user.avatar)} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <UserRound size={18} />
                                    )}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
                                    <p className="text-xs text-muted dir-ltr text-right">{user?.phoneNumber || ''}</p>
                                </div>
                            </div>
                        )}

                        {topBarLinks.map((item, index) => (
                            <span
                                key={index}
                                onClick={() => handleNav(item)}
                                className="cursor-pointer text-muted hover:text-foreground transition-all duration-200 text-[18px] font-medium py-2 select-none"
                            >
                                {item.text}
                            </span>
                        ))}

                        <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-3">

                            {isLoggedIn ? (
                                <div className="flex flex-col gap-2">
                                    <SecondaryButton onClick={() => {
                                        setMobileOpen(false);
                                        window.location.href = getDashboardUrl('/overview');
                                    }}>
                                        ورود به داشبورد
                                    </SecondaryButton>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="py-2.5 text-center text-xs font-bold text-danger-600 rounded-xl hover:bg-danger-500/10"
                                    >
                                        خروج از حساب
                                    </button>
                                </div>
                            ) : (
                                <SecondaryButton onClick={() => {
                                    setMobileOpen(false);
                                    window.location.href = getDashboardUrl('/login?redirect=' + encodeURIComponent(window.location.href));
                                }}>
                                    ورود
                                </SecondaryButton>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
