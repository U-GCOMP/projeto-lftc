import { RegularGrammarRowProps } from "../regular-grammar.types";
import { IconAppButton } from "@/components/buttons/icon-app-button";
import { trashIcon } from "@/assets/icons/_index";
import { TextInput } from "@/components/text-input/text-input";

export function RegularGrammarRow({ className, rule, setRule, onDeleteRow, shouldShowDeleteButton, onPressEnter }: RegularGrammarRowProps) {
    return (
        <div
            className={`
                relative flex gap-2 justify-center items-center group 
                ${shouldShowDeleteButton ? "transition-all duration-200 hover:pr-[2.5rem] focus-within:pr-[2.5rem]" : ""}
                ${className}
            `}
        >
            <div className="w-12">
                <TextInput
                    ref={rule.nonTerminalInputRef}
                    label="Não-terminal"
                    showLabel={false}
                    value={rule.nonTerminal}
                    onChange={(value) => setRule({ ...rule, nonTerminal: value })}
                />
            </div>
            <p className="leading-0 content-center">
                →
            </p>
            <div className="flex-1 min-w-10">
                <TextInput
                    label="Valor do não-terminal"
                    placeholder="λ"
                    showLabel={false}
                    value={rule.value}
                    onChange={(value) => setRule({ ...rule, value })}
                    inputProps={{
                        onFocus: (e) => {
                            e.currentTarget.parentElement?.classList.add("focus-within");
                        },
                        onBlur: (e) => {
                            e.currentTarget.parentElement?.classList.remove("focus-within");
                        },
                        onKeyDown: (e) => {
                            if (onPressEnter && e.key === "Enter") {
                                e.preventDefault();
                                onPressEnter();
                            }
                        }
                    }}
                />
            </div>
            { shouldShowDeleteButton && (
                <IconAppButton
                    className="absolute right-1 h-[2rem] opacity-0 transition-all duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
                    onClick={onDeleteRow}
                    icon={trashIcon}
                    alt="Remover Regra"
                    buttonProps={{
                        disabled: !shouldShowDeleteButton,
                    }}
                />)
            }
        </div>
    )
}