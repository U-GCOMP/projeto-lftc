import BaseScreen from "@/components/base-screen/base-screen";
import DefaultHeader from "@/components/default-header/default-header";
import { FiniteAutomatonProps, State } from "./finite-automaton.types";
import { Toolbar } from "./components/toolbar";
import { useState, useEffect, useCallback } from "react";
import TextAppButton from "@/components/buttons/text-app-button";
import { TestInputComponent } from "@/components/test-input-component";

export function FiniteAutomatonLayout({
    states,
    transitions,
    mode,
    setMode,
    validateWord,
    draw,
}: FiniteAutomatonProps) {
    const [input, setInput] = useState("");

    const [stepIndex, setStepIndex] = useState(0);
    const [stepStates, setStepStates] = useState<State[]>([]);

    const getStepSequence = useCallback((word: string): State[] => {
        const initial = states.find((s) => s.initial);
        if (!initial) return [];

        const sequence = [initial];
        let currentStates = [initial];

        for (const symbol of word) {
            const nextStates: State[] = [];
            for (const cs of currentStates) {
                const outgoing = transitions.filter(
                    (t) => t.origin.id === cs.id && t.value === symbol
                );
                for (const t of outgoing) nextStates.push(t.destination);
            }
            if (nextStates.length === 0) break;

            currentStates = [nextStates[0]]; // assume DFA
            sequence.push(nextStates[0]);
        }

        return sequence;
    }, [states, transitions]);

    useEffect(() => {
        if (input === "") {
            setStepStates([]);
            setStepIndex(0);
        } else {
            setStepStates(getStepSequence(input));
            setStepIndex(0);
        }
    }, [input, validateWord, states, transitions, getStepSequence]);

    const drawCanvas = useCallback((highlightState?: State) => {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        draw(ctx, highlightState);
    }, [draw]);

    useEffect(() => {
        drawCanvas(stepStates[stepIndex]);
    }, [stepIndex, stepStates, states, transitions, draw, drawCanvas]);

    return (
        <BaseScreen>
            <main className="flex flex-1 flex-col items-center">
                <DefaultHeader
                    title="Autômato Finito"
                    description="Crie autômatos finitos"
                />

                <Toolbar mode={mode} setMode={setMode} />

                <div className="flex gap-2 my-4 items-center">
                    <TestInputComponent
                        label="Teste interativo"
                        testString={input}
                        onChangeTestString={setInput}
                        testStringFunction={() => validateWord(input)}
                    />

                    <TextAppButton
                        text="←"
                        onClick={() => setStepIndex((prev) => Math.max(prev - 1, 0))}
                        className="mt-auto"
                    />
                    <TextAppButton
                        text="→"
                        onClick={() => setStepIndex((prev) => Math.min(prev + 1, stepStates.length - 1))}
                        className="mt-auto"
                    />
                </div>

                <canvas id="canvas" width={800} height={600}></canvas>
            </main>
        </BaseScreen>
    );
}
