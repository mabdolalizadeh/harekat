import {cn} from "../../utils/cn.js";
import {H3, P} from "../ui/Headings.jsx";

export default function StepCard({number, title, description, className, ...props}) {
    return (
        <div
            className={cn(
                'flex flex-col gap-4',
                className
            )}
            {...props}
        >
            <span className={'text-[clamp(3rem,5vw,5rem)] font-extrabold leading-none tracking-[-0.04em] text-ink-700'}>
                {number}
            </span>
            <H3 className={'text-ink-50 text-lg'}>{title}</H3>
            <P className={'text-ink-400 text-sm leading-relaxed'}>{description}</P>
        </div>
    )
}
