import {cn} from "../../utils/cn.js";

export default function SectionTag({children, className}) {
    return (
        <span
            className={cn(
                'eyebrow',
                className
            )}
        >
            {children}
        </span>
    )
}
