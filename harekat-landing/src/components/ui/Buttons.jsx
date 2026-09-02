import {cn} from "../../utils/cn.js";
import {ArrowLeft} from "lucide-react";

export function PrimaryButton({ children, className, ...props }) {
    return (
        <button
            className={cn(
                'bg-(--primary) px-4 py-1',
                'text-ink-800',
                'rounded-full',
                'hover:bg-brand-200 active:scale-95 transition-all duration-200 ease-standard',
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}

export function SecondaryButton({ children, className, ...props }) {
    return (
        <button
            className={cn(
                'bg-ink-700 px-4 py-1',
                'text-white',
                'rounded-full',
                'hover:bg-ink-400 hover:text-ink-800 active:scale-95 transition-all duration-200 ease-standard',
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}

export function ArrowButton({ children, className, ...props }) {
    return (
        <button
            className={cn(
                'bg-white pr-3 pl-2 py-1 flex items-center justify-center gap-3',
                'text-ink-950',
                'rounded-full',
                'hover:bg-ink-400 hover:text-ink-800 transition-all duration-200 ease-standard',
                'group',
                className
            )}
            {...props}
        >
            {children}
            <div
                className='relative flex items-center justify-center size-8 bg-black rounded-full overflow-hidden'
            >
                <ArrowLeft color={'white'} size={18}
                    className='absolute inset-0 m-auto transition-transform duration-300 group-hover:translate-x-[-160%]'/>
                <ArrowLeft color={'white'} size={18}
                    className='absolute inset-0 m-auto translate-x-[160%] transition-transform duration-300 group-hover:translate-x-0'/>
            </div>
        </button>
    )
}