import { useEffect } from "react";
import Background from "../components/ui/Background.jsx";
import { cn } from "../utils/cn.js";
import Footer from "../components/ui/Footer.jsx";

export default function MainLayout({ children, className, title, sectionIds, contentMap }) {

    useEffect(() => {
        document.title = (title ? title + ' | ' : '') + 'حرکت مدیا';
    }, [title])

    const safeContentMap = contentMap ?? {};

    return (
        <Background>
            <div className={cn(
                'flex flex-col items-center w-full',
                'max-w-8xl px-[clamp(1.5rem,5vw,7.5rem)]',
                'overflow-hidden',
                className
            )}>
                {children}
            </div>

            <Footer
                sectionIds={sectionIds}
                copyright={safeContentMap['footer-copyright']?.body || '© ۱۴۰۵ حرکت مدیا'}
                socials={Object.values(safeContentMap).filter(
                    (item) => item.key?.startsWith('social-')
                )}
            />
        </Background>
    )
}
