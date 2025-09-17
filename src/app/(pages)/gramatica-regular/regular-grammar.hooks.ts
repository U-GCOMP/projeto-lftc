import { createRef, useCallback, useRef, useState } from "react";
import { RegularGrammarProps, RegularGrammarRule } from "./regular-grammar.types";
import { GLUD_NON_TERMINAL_REGEX, GLUD_VALUE_REGEX, TERMINAL_REGEX } from "./regular-grammar.constants";
import { nextTick } from "process";

export function useGrammar(): RegularGrammarProps {
    const [rulesArray, setRulesArray] = useState<RegularGrammarRule[]>([{ nonTerminalInputRef: useRef(null), nonTerminal: "S", value: "" }]);
    const [testStringArray, setTestStringArray] = useState<string[]>([""]);

    function setRuleAt(index: number, newRule: RegularGrammarRule) {
        const formattedValue = newRule.value.replaceAll(" ", "");
        const formattedNonTerminal = newRule.nonTerminal.replaceAll(" ", "").toUpperCase();

        const isValid =
            (formattedValue === "" || GLUD_VALUE_REGEX.test(formattedValue)) &&
            (formattedNonTerminal === "" || GLUD_NON_TERMINAL_REGEX.test(formattedNonTerminal));

        if (!isValid) return;

        const updated = [...rulesArray];
        updated[index] = { ...newRule, nonTerminal: formattedNonTerminal, value: formattedValue };
        setRulesArray(updated);
    }


    function addRuleRow() {
        const newRule: RegularGrammarRule = { nonTerminalInputRef: createRef<HTMLInputElement>(), nonTerminal: "", value: "" };
        setRulesArray([...rulesArray, newRule]);

        nextTick(() => {
            newRule.nonTerminalInputRef.current?.focus();
        })
    }

    function removeRuleRowAt(index: number) {
        const updated = [...rulesArray];
        updated.splice(index, 1);
        setRulesArray(updated);

        if (index == 0) {
            nextTick(() => {
                updated[0]?.nonTerminalInputRef.current?.focus();
            });
        } else {
            nextTick(() => {
                updated[index - 1]?.nonTerminalInputRef.current?.focus();
            });
        }
    }

    function setTestStringAt(index: number, value: string) {
        const updated = [...testStringArray];
        updated[index] = value;
        setTestStringArray(updated);
    }

    function addTestString() {
        setTestStringArray([...testStringArray, ""]);
    }

    function removeTestStringAt(index: number) {
        const updated = [...testStringArray];
        updated.splice(index, 1);
        setTestStringArray(updated);
    }


    const testGrammar = useCallback((input: string): boolean => {
        const rules = new Map<string, string[]>();
        for (const rule of rulesArray) {
            if (rule.nonTerminal.length > 0 && rule.value !== undefined) {
                if (!rules.has(rule.nonTerminal)) {
                    rules.set(rule.nonTerminal, []);
                }
                rules.get(rule.nonTerminal)!.push(rule.value);
            }
        }

        function canGenerate(current: string, remaining: string): boolean {

            if (remaining === '') {
                return current === '' || (rules.has(current) && rules.get(current)!.includes(''));
            }

            if (current === '' && remaining.length > 0) return false;

            const productions = rules.get(current)!;
            for (const production of productions) {
                if (production === '') {
                    if (canGenerate('', remaining)) return true;
                } else if (production.length === 'a'.length) {
                    const isTerminal = production[0].match(TERMINAL_REGEX);

                    if (isTerminal && remaining[0] === production && canGenerate('', remaining.slice(1))) {
                        return true;
                    }

                    if (!isTerminal && canGenerate(production, remaining)) {
                        return true;
                    }
                    
                } else if (production.length === 'aB'.length) {
                    const terminal = production[0];
                    const nonTerminal = production[1];
                    if (remaining[0] === terminal && canGenerate(nonTerminal, remaining.slice(1))) {
                        return true;
                    }
                }
            }

            return false;
        }

        const startSymbol = rulesArray[0]?.nonTerminal || 'S';
        return canGenerate(startSymbol, input);
    }, [rulesArray]);

    function handleRuleValuePressEnter(index: number) {
        if (index === rulesArray.length - 1) {
            addRuleRow();
            return;
        }

        rulesArray[index + 1].nonTerminalInputRef.current?.focus();
    }

    return {
        addRuleRow,
        removeRuleRowAt,
        rulesArray,
        handleRuleValuePressEnter,
        setRuleAt,
        addTestString,
        removeTestStringAt,
        setTestStringAt,
        testStringArray,
        testGrammar
    };
}