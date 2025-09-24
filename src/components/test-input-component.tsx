import { trashIcon } from "@/assets/icons/_index";
import { IconAppButton } from "./buttons/icon-app-button";
import { TextInput } from "./text-input/text-input";

interface TestInputComponentProps {
    label: string;
    testString: string;
    onChangeTestString: (value: string) => void;
    testStringFunction: (value: string) => boolean;
    id?: string;
    removeTestString?: () => void;
}

export function TestInputComponent({
    label,
    testString,
    onChangeTestString,
    removeTestString,
    id,
    testStringFunction,
}: TestInputComponentProps) {
    const shouldShowDeleteButton = removeTestString !== undefined;

    return (
        <div
            className={`
                relative flex items-center group duration-200
                ${shouldShowDeleteButton ? "hover:pr-[2.5rem] focus-within:pr-[2.5rem]" : ""}
            `}
            aria-live="polite"
        >

            <TextInput
                className={testStringFunction(testString) ? "bg-regex-success" : "bg-regex-error"}
                id={id}
                label={label}
                value={testString}
                onChange={(value) => onChangeTestString(value)}
                inputProps={{
                    onFocus: (e) => {
                        e.currentTarget.parentElement?.classList.add("focus-within");
                    },
                    onBlur: (e) => {
                        e.currentTarget.parentElement?.classList.remove("focus-within");
                    },
                }}
            />
            {shouldShowDeleteButton && (
                <IconAppButton
                    className="absolute mt-5 right-1 h-[2rem] opacity-0 transition-all duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
                    onClick={() => removeTestString?.()}
                    icon={trashIcon}
                    alt="Remover String de Teste"
                />
            )}
        </div>
    )
}