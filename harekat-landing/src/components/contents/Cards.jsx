import {cn} from "../../utils/cn.js";
import Img from "../ui/Img.jsx";
import {H1, H2, H3, P} from "../ui/Headings.jsx";
import {Plus} from "lucide-react";
import {useState} from "react";
import Box from "../ui/Box.jsx";
import Chip from "../ui/Chip.jsx";

export function ContentCard({title, subtitle, className}) {
    return (
        <div className={cn(
            'w-100',
            className
        )}>
            <H1
                className={'border-b border-ink-500 pb-2'}
            >
                {title}
            </H1>
            <P>
                {subtitle}
            </P>
        </div>
    )
}

export function ImageCard({src, alt='', title, subtitle, className, photoHoverText='', ...props }) {
    return (
        <div
            className={cn(
                'bg-ink-800 flex flex-col justify-center gap-5 p-2 rounded-lg w-81.5 hover:bg-brand-300/10',
                'group',
                'transition-all duration-200 ease-standard',
                className
            )}
            {...props}
        >
            <div className={'relative'}>
                <Img src={src} alt={alt} groupHover={true} />
                {photoHoverText &&
                    <div
                        className={cn(
                            'absolute bg-ink-900 py-1 px-2 text-white rounded-full',
                            'top-[45%] right-[38%]',
                            'flex items-center justify-center'
                        )}
                    >
                        {photoHoverText}
                    </div>
                }
            </div>
            <div className={'w-[90%] leading-6 text-md'}>
                {title}
            </div>
            <div
                className="uppercase text-sm text-ink-600 font-semibold group-hover:text-ink-400 transition-all duration-200 ease-in-out"
            >
                {subtitle}
            </div>
        </div>
    )
}

export function AccordionCard({title, content, className, ...props }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className={cn(
                'w-full bg-ink-900 flex flex-col rounded-lg p-5',
                'cursor-pointer select-none',
                className
            )}
            onClick={() => setIsOpen(!isOpen)}
            {...props}
        >
            <div className="flex items-center justify-between w-full">
                <H1 className="font-semibold">{title}</H1>

                <div
                    className={cn(
                        'p-px rounded-full bg-black transition-all duration-200 ease-in-out',
                        isOpen && 'rotate-45 bg-ink-600'
                    )}
                >
                    <Plus />
                </div>
            </div>

            <div
                className={cn(
                    'grid w-full transition-[grid-template-rows] duration-200 ease-in-out',
                    isOpen
                        ? 'grid-rows-[1fr] mt-5'
                        : 'grid-rows-[0fr] mt-0'
                )}
            >
                <div className="overflow-hidden text-ink-400">
                    {content}
                </div>
            </div>
        </div>
    )
}

export function CourseCard({
    title,
    imgSrc,
    category,
    level,
    duration,
    courseType,
    teacher,
    price,
    registrationStatus,
    className,
    ...props
                           }) {

    return (
        <div
            className={cn(
                'bg-ink-800 flex flex-col justify-center gap-4 p-2 rounded-lg w-100 hover:bg-brand-300/10',
                'group',
                'transition-all duration-200 ease-standard',
                className
            )}
            {...props}
        >
            <div className={'relative'}>
                <Img src={imgSrc} groupHover={true} className={'h-52 w-full'} />
                {category &&
                    <div
                        className={cn(
                            'absolute bg-ink-900 py-1 px-2 text-white rounded-full',
                            'top-[45%] right-[38%]',
                            'flex items-center justify-center'
                        )}
                    >
                        {category}
                    </div>
                }
            </div>
            <H2 className={'w-[90%] font-bold'}>
                {title}
            </H2>
            <Box className={'flex-row flex-wrap justify-start items-start gap-2'}>
                {[level, duration, price, courseType, registrationStatus].map((item, i) => (
                    <Chip key={i}>{item}</Chip>
                ))}
            </Box>
            <H3
                className="text-ink-600 font-semibold group-hover:text-ink-400 transition-all duration-200 ease-in-out"
            >
                {teacher}
            </H3>
        </div>
    )
}
