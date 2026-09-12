import { cn } from "../../utils/cn.js";
import { useNavigate } from "react-router-dom";
import Logo from "../ui/Logo.jsx";
import { Camera, Send, Briefcase } from "lucide-react";

const footerLinks = [
    { text: "خانه", link: "/#hero", scrollId: "hero" },
    { text: "دوره‌ها", link: "/#courses", scrollId: "courses" },
    { text: "پکیج‌های مهارتی", key: "skill", link: "/#skill-packages" },
    { text: "دوره‌های کپسولی", key: "capsule", link: "/#capsule-courses" },
    { text: "اشتراک‌ها", key: "subscriptions", link: "/#subscriptions" },
    { text: "درباره ما", link: "/about-us", scrollId: null },
    { text: "تماس با ما", link: "/contact-us", scrollId: null },
];

export default function Footer({ socials = [], copyright, sectionIds = {}, className }) {
    const navigate = useNavigate();

    const handleNav = (item) => {
        const scrollId = item.key ? (sectionIds[item.key] || item.link.slice(2)) : item.scrollId;
        if (scrollId) {
            navigate(`/#${scrollId}`);
        } else {
            navigate(item.link);
        }
    };

    return (
        <footer className={cn("w-full py-12 border-t border-[--border] mt-12", className)}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 w-full">
                <div className="flex flex-col gap-1">
                    <Logo className="h-20 text-foreground" />
                    <div className="flex gap-4 flex-wrap">
                        {footerLinks.map((item, index) => (
                            <span
                                key={index}
                                onClick={() => handleNav(item)}
                                className="text-muted text-sm cursor-pointer hover:text-foreground/70 transition-colors"
                            >
                                {item.text}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2 items-start sm:items-end">
                    
                    <div className="flex gap-4">
                        {socials.length > 0 ? socials.map((s) => (
                            <a key={s.key} href={s.linkUrl || "#"} className="text-muted text-xs hover:text-foreground/70 transition-colors">{s.linkText || s.title}</a>
                        )) : (
                            <>
                                <a href="#" className="text-muted text-xs hover:text-foreground/70 transition-colors flex items-center gap-1">
                                    <Camera size={14} /> اینستاگرام
                                </a>
                                <a href="#" className="text-muted text-xs hover:text-foreground/70 transition-colors flex items-center gap-1">
                                    <Send size={14} /> تلگرام
                                </a>
                                <a href="#" className="text-muted text-xs hover:text-foreground/70 transition-colors flex items-center gap-1">
                                    <Briefcase size={14} /> لینکدین
                                </a>
                            </>
                        )}
                    </div>
                    <span className="text-muted text-xs">{copyright}</span>
                </div>
            </div>
        </footer>
    );
}
