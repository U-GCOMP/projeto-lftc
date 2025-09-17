import Image from "next/image"
import { ButtonHTMLAttributes } from "react"

interface IconAppButtonProps {
    onClick: () => void,
    icon: string,
    alt: string,
    width?: number,
    height?: number,
    className?: string,
    buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>
}


export function IconAppButton({ onClick, icon, alt, width = 24, height = 24, className, buttonProps }: IconAppButtonProps) {
    return (
        <button
            className={`flex items-center justify-center m-0 hover:scale-110 ${className}`}
            onClick={onClick}
            aria-label={alt}
            {...buttonProps}
        >
            <Image src={icon} alt={alt} width={width} height={height} />
        </button>
    )
}