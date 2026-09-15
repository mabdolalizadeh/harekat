import {cn} from "../../utils/cn.js";
import Img from "../ui/Img.jsx";
import {H3, P} from "../ui/Headings.jsx";
import { User } from "lucide-react";

export default function TeacherCard({name, role, avatar, className, ...props}) {
    return (
        <div
            className={cn(
                'flex flex-col items-center gap-4',
                className
            )}
            {...props}
        >
            
            <div className={'w-full aspect-square rounded-2xl overflow-hidden bg-surface-muted border border-border shrink-0 flex items-center justify-center'}>
                {avatar
                ? <Img
                    src={avatar}
                    alt={name}
                    className={'w-full h-full object-cover'}
                    groupHover={true}
                />
                : <User size={56} className="opacity-30 text-muted" />
                }
                
                
            </div>
            <div className={'flex flex-col items-center gap-1'}>
                <H3 className={'text-foreground text-base'}>{name}</H3>
                <P className={'text-muted text-sm'}>{role}</P>
            </div>
        </div>
    )
}
