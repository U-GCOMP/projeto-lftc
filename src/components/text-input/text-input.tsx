import React from "react";

export interface TextInputProps {
    ref?: React.Ref<HTMLInputElement>;
    id?: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    showLabel?: boolean;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(({id, label, value, onChange, placeholder, className, showLabel = true, inputProps}: TextInputProps, ref) => {

    return (
        <label className="focus-within:text-accent-300">
            {showLabel && label}
            <input
                ref={ref}
                id={id}
                type="text"
                className={`flex flex-1 w-full px-4 py-2 border border-gray-300 focus:border-accent-300 rounded focus:outline-none focus:ring-1 focus:ring-accent-300 ${className ?? ''}`}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={label}
                {...inputProps}
            />
        </label>
    )
});

TextInput.displayName = "TextInput";