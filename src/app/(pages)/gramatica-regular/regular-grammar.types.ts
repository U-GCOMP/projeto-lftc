export interface RegularGrammarRule {
    nonTerminalInputRef: React.RefObject<HTMLInputElement | null>;
    nonTerminal: string;
    value: string;
}

export interface RegularGrammarRowProps {
    className?: string;
    rule: RegularGrammarRule;
    setRule: (newRule: RegularGrammarRule) => void;
    shouldShowDeleteButton?: boolean;
    onDeleteRow: () => void;
    onPressEnter: () => void;
}

export interface RegularGrammarProps {
    rulesArray: RegularGrammarRule[];
    setRuleAt: (index: number, value: RegularGrammarRule) => void;
    addRuleRow: () => void;
    removeRuleRowAt: (index: number) => void;
    testStringArray: string[];
    setTestStringAt: (index: number, value: string) => void;
    addTestString: () => void;
    removeTestStringAt: (index: number) => void;
    testGrammar: (input: string) => boolean;
    handleRuleValuePressEnter: (index: number) => void;
}