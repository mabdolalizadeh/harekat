import {cn} from "../../utils/cn.js";
import {ArrowUpRight} from "lucide-react";
import {useState} from "react";

export default function Img({ src, alt="", className, imageClassName, groupHover=false, ...rest }) {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div
            className={cn(
            'overflow-hidden rounded-lg relative group-hover:rotate-1 hover:rotate-1 transition-all duration-200 ease-standard',
                className
            )}>
            <img
                src={src}
                alt={alt}
                className={cn(
                    'object-cover',
                    imageClassName
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                {...rest}
            />
            {isHovered && !groupHover &&
                <div
                className={cn(
                    'absolute bg-black text-brand-400 rounded-full',
                    'top-[1%] right-[1%] w-[5%] aspect-square',
                    'flex items-center justify-center'
                )}
            >
                <ArrowUpRight className="size-[60%]" />
            </div>}
        </div>
    )
}