import { ButtonHTMLAttributes } from "react"

interface AppButtonProps {
    text?: string,
    onClick: () => void,
    buttonProps: ButtonHTMLAttributes<HTMLButtonElement>
    className?: string
}

export default function TextAppButton({ text, onClick, buttonProps, className }: AppButtonProps) {
    return (
        <button
            className={"h-fit bg-brand-default text-success-300 px-2 border-success-300 border-2 rounded hover:bg-success-300 hover:text-white transition-all duration-200 " + className}
            onClick={onClick}
            {...buttonProps}
        >
            {text}
        </button>
    )
}
