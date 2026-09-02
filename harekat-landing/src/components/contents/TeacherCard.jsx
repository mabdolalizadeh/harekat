import {cn} from "../../utils/cn.js";
import Img from "../ui/Img.jsx";
import {H3, P} from "../ui/Headings.jsx";

export default function TeacherCard({name, role, avatar, className, ...props}) {
    return (
        <div
            className={cn(
                'flex flex-col items-center gap-4',
                className
            )}
            {...props}
        >
            <div className={'w-full aspect-square overflow-hidden rounded-[var(--radius-2xl)]'}>
                <Img
                    src={avatar}
                    alt={name}
                    className={'w-full h-full object-cover'}
                    groupHover={true}
                />
            </div>
            <div className={'flex flex-col items-center gap-1'}>
                <H3 className={'text-ink-50 text-base'}>{name}</H3>
                <P className={'text-ink-500 text-sm'}>{role}</P>
            </div>
        </div>
    )
}
