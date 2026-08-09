import Background from "../components/ui/Background.jsx";
import {cn} from "../utils/cn.js";

export default function MainLayout({ children, className }) {
    return (
        <Background>
            <div className={cn('flex flex-col items-center justify-center w-[95%] overflow-hidden', className)}>
                {children}
            </div>
        </Background>
    )
}