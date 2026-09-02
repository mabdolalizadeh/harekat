import { useEffect } from "react";
import Background from "../components/ui/Background.jsx";
import {cn} from "../utils/cn.js";

export default function MainLayout({ children, className, title }) {

    useEffect(() => {
        document.title = (title ? title + ' | ' : '') + 'Harekat';
    },[title])

    return (
        <Background>
            <div className={cn(
                'flex flex-col items-center w-full',
                'max-w-[var(--container-8xl)] px-[clamp(1.5rem,5vw,7.5rem)]',
                'overflow-hidden',
                className
            )}>
                {children}
            </div>
        </Background>
    )
}
