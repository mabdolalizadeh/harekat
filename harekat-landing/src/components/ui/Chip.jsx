import {cn} from "../../utils/cn.js";

export default function Chip({children, className}) {
    return (
        <div
            className={cn(
                'py-1 px-2 border border-ink-50/10 rounded-full text-sm font-semibold',
                className
            )}
        >
            {children}
        </div>
    )
}
