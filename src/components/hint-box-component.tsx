import React from "react";

interface HintBoxComponentProps {
    isOpen: boolean;
    children: React.ReactNode;
    className?: string;
}

export const HintBoxComponent = React.forwardRef<HTMLDivElement, HintBoxComponentProps>(
    ({ isOpen, children, className }, ref) => {
        const desktopVersion = () => {
            return (
                <div
                    ref={ref}
                    className={`
                        absolute top-1 left-[calc(100%+8px)] rounded
                        before:content-[''] before:absolute before:top-1 before:left-0 before:transition-all before:duration-300
                        before:border-r-accent-300 before:border-t-[8px] before:border-b-[8px] before:border-r-[8px] before:border-t-transparent before:border-b-transparent
                        grid z-10 
                        bg-accent-300 border-r-4 border-r-accent-300
                        text-brand-1000
                        transition-all duration-300 ease-in-out
                        ${isOpen ?
                            "grid-rows-[1fr] w-64 p-4 before:opacity-100 before:translate-x-[-8px]" :
                            "grid-rows-[0fr] w-0 p-0 before:opacity-0"
                        }
                        max-[700px]:hidden
                        ${className}
                    `}
                >
                    <div className={`overflow-hidden`}>
                        {children}
                    </div>
                </div>
            )
        }

        const mobileVersion = () => {
            return (
                <div
                    className={`
                    fixed inset-x-0  rounded-t-lg
                        grid z-50 
                        bg-accent-300 border-t-4 border-t-accent-300
                        text-brand-1000
                        transition-all duration-300 ease-in-out
                        ${isOpen ?
                            "grid-rows-[1fr] max-h-[50vh] p-4 bottom-0" :
                            "grid-rows-[0fr] max-h-0 p-0 bottom-[-1rem]" 
                        }
                    min-[701px]:hidden
                    ${className}
                    `}
                >
                    <div className={`overflow-hidden`}>
                        {children}
                    </div>
                </div>
            )
        }

        return (
            <>
                {desktopVersion()}
                {mobileVersion()}
            </>
        )
    }
);

HintBoxComponent.displayName = "HintBoxComponent";