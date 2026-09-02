import {cn} from "../../utils/cn.js";
import {MessageCircle, Repeat2, Heart, Share} from "lucide-react";

export default function TestimonialCard({quote, name, role, avatar, className, ...props}) {
    return (
        <div
            className={cn(
                'border border-[var(--border)] bg-card/80 rounded-[var(--radius-xl)] p-3 sm:p-4 flex gap-3',
                className
            )}
            {...props}
        >
            {/*avatar*/}
            <div className={'shrink-0'}>
                <div
                    className={'w-10 h-10 rounded-full bg-surface-muted overflow-hidden flex items-center justify-center'}
                >
                    {avatar ? (
                        <img src={avatar} alt={name} className={'w-full h-full object-cover'}/>
                    ) : (
                        <span className={'text-muted text-sm font-bold'}>{name?.charAt(0)}</span>
                    )}
                </div>
            </div>

            {/*content*/}
            <div className={'flex flex-col gap-1 min-w-0 flex-1'}>
                {/*header*/}
                <div className={'flex items-center gap-1.5'}>
                    <span className={'text-foreground text-sm font-bold truncate'}>{name}</span>
                    <svg viewBox="0 0 22 22" className={'w-4 h-4 text-blue-400 shrink-0 fill-current'}>
                        <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.855-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.143.271.586.702 1.084 1.24 1.438.54.354 1.167.551 1.813.568.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.225 1.261.272 1.893.143.634-.131 1.22-.437 1.69-.882.445-.47.75-1.055.88-1.69.131-.634.084-1.29-.139-1.896.586-.273 1.084-.705 1.438-1.245.355-.54.553-1.171.57-1.817zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
                    </svg>
                    <span className={'text-muted text-sm'}>@{name?.replace(/\s/g, '')}</span>
                    <span className={'text-muted text-sm'}>·</span>
                    <span className={'text-muted text-sm'}>۱۴۰۵</span>
                </div>

                {/*text*/}
                <p className={'text-foreground text-sm leading-relaxed'}>{quote}</p>

                {/*role badge*/}
                {role && (
                    <div className={'mt-1'}>
                        <span className={'text-xs bg-surface-muted text-muted px-2 py-0.5 rounded-full border border-[var(--border)]'}>
                            {role}
                        </span>
                    </div>
                )}

                {/*actions*/}
                <div className={'flex items-center justify-between mt-2 max-w-[280px] flex-wrap gap-1'}>
                    <button className={'flex items-center gap-1.5 text-muted hover:text-blue-400 transition-colors group'}>
                        <MessageCircle size={16} className={'group-hover:fill-blue-400/20'}/>
                        <span className={'text-xs'}>۱۲</span>
                    </button>
                    <button className={'flex items-center gap-1.5 text-muted hover:text-green-400 transition-colors group'}>
                        <Repeat2 size={16} className={'group-hover:fill-green-400/20'}/>
                        <span className={'text-xs'}>۵</span>
                    </button>
                    <button className={'flex items-center gap-1.5 text-muted hover:text-pink-500 transition-colors group'}>
                        <Heart size={16} className={'group-hover:fill-pink-500/20'}/>
                        <span className={'text-xs'}>۲۴</span>
                    </button>
                    <button className={'flex items-center gap-1.5 text-muted hover:text-blue-400 transition-colors group'}>
                        <Share size={16}/>
                    </button>
                </div>
            </div>
        </div>
    )
}
