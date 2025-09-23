'use client'

import { useAutomaton } from "./finite-automaton.hooks";
import { FiniteAutomatonLayout } from "./finite-automaton.layout";

export default function FiniteAutomaton() {
    const props = useAutomaton();

    return <FiniteAutomatonLayout 
        {...props}
    />
}
