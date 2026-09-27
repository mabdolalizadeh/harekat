import { cn } from "../../utils/cn.js";
import { ArrowUpRight, ImageOff } from "lucide-react";
import { useState } from "react";

export default function Img({
    src,
    alt = "",
    className,
    imageClassName,
    groupHover = false,
    priority = false,
    aspectRatio,
    ...rest
}) {
    const [isHovered, setIsHovered] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
        <div
            className={cn(
                'overflow-hidden rounded-lg relative group-hover:rotate-1 hover:rotate-1 transition-all duration-200 ease-standard bg-surface-muted/30',
                className
            )}
            style={aspectRatio ? { aspectRatio } : undefined}
        >
            {!hasError ? (
                <img
                    src={src}
                    alt={alt}
                    loading={priority ? 'eager' : 'lazy'}
                    fetchPriority={priority ? 'high' : 'auto'}
                    decoding="async"
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasError(true)}
                    className={cn(
                        'w-full h-full object-cover transition-opacity duration-300',
                        isLoaded ? 'opacity-100' : 'opacity-0',
                        imageClassName
                    )}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    {...rest}
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted/50 p-4 min-h-[140px]">
                    <ImageOff className="size-8 mb-1 stroke-1" />
                    <span className="text-xs text-muted/60">تصویر در دسترس نیست</span>
                </div>
            )}

            {isHovered && !groupHover && (
                <div
                    className={cn(
                        'absolute bg-black text-brand-400 rounded-full',
                        'top-[1%] right-[1%] w-[5%] aspect-square min-w-[24px]',
                        'flex items-center justify-center'
                    )}
                >
                    <ArrowUpRight className="size-[60%]" />
                </div>
            )}
        </div>
    );
}