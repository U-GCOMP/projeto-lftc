import { trashIcon } from "@/assets/icons/_index";
import { IconAppButton } from "./buttons/icon-app-button";
import { TextInput } from "./text-input/text-input";

interface TestInputComponentProps {
    index: number;
    testString: string;
    testStringArray: string[];
    onChangeTestString: (index: number, value: string) => void;
    removeTestString: (index: number) => void;
    testStringFunction: (value: string) => boolean;
    shouldShowDeleteButton?: boolean;
}

export function TestInputComponent({
    index,
    testString,
    testStringArray,
    onChangeTestString,
    removeTestString,
    testStringFunction,
    shouldShowDeleteButton = false
}: TestInputComponentProps) {
    return (
        <div
            className={`
                relative flex items-center group duration-200
                ${shouldShowDeleteButton ? "hover:pr-[2rem] focus-within:pr-[2rem]" : ""}
            `}
            aria-live="polite"
        >

            <TextInput
                className={testStringFunction(testString) ? "bg-regex-success" : "bg-regex-error"}
                id={`test-string-${index}`}
                label={`String de Teste ${index + 1}`}
                value={testString}
                onChange={(value) => onChangeTestString(index, value)}
                inputProps={{
                    onFocus: (e) => {
                        e.currentTarget.parentElement?.classList.add("focus-within");
                    },
                    onBlur: (e) => {
                        e.currentTarget.parentElement?.classList.remove("focus-within");
                    },
                }}
            />
            {testStringArray.length > 1 && (
                <IconAppButton
                    className="absolute mt-5 right-1 h-[32px] opacity-0 transition-all duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
                    onClick={() => removeTestString(index)}
                    icon={trashIcon}
                    alt="Remover String de Teste"
                />
            )}
        </div>
    )
}