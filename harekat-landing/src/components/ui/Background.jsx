import {cn} from "../../utils/cn.js";

export default function Background({children, className}) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center',
                'w-full min-h-screen',
                'bg-ink-950',
                className
            )}
        >
            {children}
        </div>
    )
}
