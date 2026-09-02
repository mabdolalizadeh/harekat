import {cn} from "../../utils/cn.js";
import {H3, P} from "../ui/Headings.jsx";

export default function TestimonialCard({quote, name, role, className, ...props}) {
    return (
        <div
            className={cn(
                'flex flex-col gap-4 p-6 rounded-[var(--radius-xl)] border border-ink-50/10',
                className
            )}
            {...props}
        >
            <P className={'text-ink-300 text-[clamp(0.9rem,1.5vw,1.05rem)] leading-relaxed'}>
                "{quote}"
            </P>
            <div className={'flex flex-col gap-0.5'}>
                <H3 className={'text-ink-50 text-sm font-semibold'}>{name}</H3>
                <span className={'text-ink-500 text-xs'}>{role}</span>
            </div>
        </div>
    )
}
