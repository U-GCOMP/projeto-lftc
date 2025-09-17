'use client'

import { useGrammar } from "./regular-grammar.hooks";
import { RegularGrammarLayout } from "./regular-grammar.layout";

export default function RegularGrammar() {
    const props = useGrammar();

    return <RegularGrammarLayout 
        {...props}
    />
}