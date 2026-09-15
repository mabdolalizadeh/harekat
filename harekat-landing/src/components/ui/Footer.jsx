import { cn } from "../../utils/cn.js";
import { useNavigate } from "react-router-dom";
import Logo from "../ui/Logo.jsx";
import { Camera, Send, ArrowUpLeft } from "lucide-react";

const footerLinks = [
    { text: "خانه", link: "/#hero", scrollId: "hero" },
    { text: "دوره‌ها", link: "/#courses", scrollId: "courses" },
    { text: "پکیج‌های مهارتی", key: "skill", link: "/#skill-packages" },
    { text: "دوره‌های کپسولی", key: "capsule", link: "/#capsule-courses" },
    { text: "اشتراک‌ها", key: "subscriptions", link: "/#subscriptions" },
    { text: "درباره ما", link: "/about-us" },
    { text: "تماس با ما", link: "/contact-us" },
];

const defaultSocials = [
    {
        key: "instagram",
        title: "اینستاگرام",
        icon: Camera,
        linkUrl: "#",
    },
    {
        key: "telegram",
        title: "تلگرام",
        icon: Send,
        linkUrl: "#",
    },
];

export default function Footer({
    socials = [],
    copyright,
    sectionIds = {},
    className,
}) {
    const navigate = useNavigate();

    const handleNav = (item) => {
        const scrollId = item.key
            ? sectionIds[item.key] || item.link.slice(2)
            : item.scrollId;

        if (scrollId) {
            navigate(`/#${scrollId}`);
        } else {
            navigate(item.link);
        }
    };

    const socialItems = socials.length > 0 ? socials : defaultSocials;

    return (
        <footer
            dir="rtl"
            className={cn(
                "relative w-full mt-20 border-t border-[--border] min-h-75",
                "bg-linear-to-b from-(--background)/30 to-transparent",
                className
            )}
        >
            <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
                {/* Main Footer */}
                <div className="grid grid-cols-1 gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-16 lg:py-16">

                    {/* Brand */}
                    <div className="flex flex-col items-center text-center md:items-start md:text-right">
                        <Logo className="h-16 sm:h-20 text-foreground" />

                        <p className="mt-5 max-w-sm text-sm leading-7 text-muted">
                            مسیر یادگیریت رو هوشمندانه شروع کن،
                            مهارت بساز و برای حرکت بزرگ بعدی آماده شو.
                        </p>

                        {/* Socials */}
                        <div className="mt-7 flex items-center gap-2">
                            {socialItems.map((social) => {
                                const Icon = social.icon;

                                return (
                                    <a
                                        key={social.key}
                                        href={social.linkUrl || "#"}
                                        target={
                                            social.linkUrl &&
                                                social.linkUrl !== "#"
                                                ? "_blank"
                                                : undefined
                                        }
                                        rel={
                                            social.linkUrl &&
                                                social.linkUrl !== "#"
                                                ? "noreferrer"
                                                : undefined
                                        }
                                        aria-label={social.title}
                                        className={cn(
                                            "group flex h-10 w-10 items-center justify-center",
                                            "rounded-xl border border-[--border]",
                                            "text-muted transition-all duration-300",
                                            "hover:-translate-y-0.5",
                                            "hover:border-foreground/20",
                                            "hover:text-foreground",
                                            "hover:bg-foreground/[0.04]"
                                        )}
                                    >
                                        {Icon ? (
                                            <Icon size={17} strokeWidth={1.7} />
                                        ) : (
                                            <span className="text-xs">
                                                {social.linkText || social.title}
                                            </span>
                                        )}
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="text-center md:text-right">
                        <h3 className="text-sm font-semibold text-foreground">
                            دسترسی سریع
                        </h3>

                        <nav className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4">
                            {footerLinks.map((item) => (
                                <button
                                    key={item.text}
                                    type="button"
                                    onClick={() => handleNav(item)}
                                    className={cn(
                                        "group flex items-center gap-1.5",
                                        "text-right text-sm text-muted",
                                        "transition-colors duration-200",
                                        "hover:text-foreground"
                                    )}
                                >
                                    <span>{item.text}</span>

                                    <ArrowUpLeft
                                        size={13}
                                        className={cn(
                                            "opacity-0 -translate-x-1 mb-1",
                                            "transition-all duration-200",
                                            "group-hover:opacity-60",
                                            "group-hover:translate-x-0"
                                        )}
                                    />
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Trust */}
                    <div className="flex flex-col items-center md:items-start lg:items-center">
                        <h3 className="text-sm font-semibold text-foreground">
                            با خیال راحت یاد بگیر
                        </h3>

                        <p className="mt-3 max-w-xs text-center text-xs leading-6 text-muted md:text-right lg:text-center">
                            پرداخت امن و پشتیبانی در مسیر یادگیری
                        </p>

                        <a
                            referrerPolicy="origin"
                            target="_blank"
                            rel="noreferrer"
                            href="https://trustseal.enamad.ir/?id=7739197&Code=VeYjTFI6U9DFuWlbi7lSZyCVV6SJsRyY"
                            className={cn(
                                "mt-6 flex h-28 w-28 items-center justify-center",
                                "rounded-2xl border border-[--border]",
                                "bg-foreground/[0.02]",
                                "transition-all duration-300",
                                "hover:border-foreground/20",
                                "hover:bg-foreground/[0.04]",
                                "hover:scale-[1.02]"
                            )}
                        >
                            <img
                                referrerPolicy="origin"
                                src="https://trustseal.enamad.ir/logo.aspx?id=7739197&Code=VeYjTFI6U9DFuWlbi7lSZyCVV6SJsRyY"
                                alt="نماد اعتماد الکترونیکی"
                                className="w-20 object-contain"
                            />
                        </a>
                    </div>
                </div>

                {/* Bottom */}
                <div
                    className={cn(
                        "flex flex-col py-5",
                        "border-t border-[--border]/60",
                        "sm:flex-row sm:items-center sm:justify-center"
                    )}
                >
                    <span className="text-center text-[11px] text-muted sm:text-right">
                        {copyright}
                    </span>
                </div>
            </div>
        </footer>
    );
}