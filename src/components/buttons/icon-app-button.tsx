import Image from "next/image"
import { ButtonHTMLAttributes } from "react"

interface IconAppButtonProps {
    onClick: () => void,
    icon: string,
    alt: string,
    width?: number,
    height?: number,
    className?: string,
    buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>,
    isHighlighted?: boolean
}


export function IconAppButton({ onClick, icon, alt, width = 24, height = 24, className, buttonProps, isHighlighted = false }: IconAppButtonProps) {
    const highlightClasses = isHighlighted 
        ? "bg-accent-300 shadow-lg" 
        : "hover:scale-110";

    return (
        <button
            className={`flex items-center justify-center m-0 p-2 rounded-lg transition-all duration-200 ${highlightClasses} ${className}`}
            onClick={onClick}
            aria-label={alt}
            {...buttonProps}
        >
            <Image src={icon} alt={alt} width={width} height={height} />
        </button>
    )
}