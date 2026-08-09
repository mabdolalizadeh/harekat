import {cn} from "../../utils/cn.js";

export default function Box({ children, className, ...rest }) {
    return (
        <div className={cn('w-full flex flex-col justify-center items-center', className)} {...rest} >{children}</div>
    )
}