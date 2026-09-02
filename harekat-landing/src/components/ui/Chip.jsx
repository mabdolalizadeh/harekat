import {cn} from "../../utils/cn.js";

export default function Chip({children, className}) {
    return (
        <div
            className={cn(
                'py-1 px-2 border border-[var(--border)] rounded-full text-sm font-semibold',
                className
            )}
        >
            {children}
        </div>
    )
}