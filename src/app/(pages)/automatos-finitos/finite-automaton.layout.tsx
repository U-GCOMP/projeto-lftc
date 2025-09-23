import BaseScreen from "@/components/base-screen/base-screen";
import DefaultHeader from "@/components/default-header/default-header";
import { FiniteAutomatonProps, State } from "./finite-automaton.types";
import { Toolbar } from "./components/toolbar";
import { useState, useEffect } from "react";

export function FiniteAutomatonLayout({
    states,
    transitions,
    mode,
    setMode,
    addState,
    addTransition,
    removeState,
    removeTransition,
    editState,
    editTransition,
    validateWord,
    draw,
}: FiniteAutomatonProps) {
    const [input, setInput] = useState("");
    const [result, setResult] = useState<null | boolean>(null);

    const [stepIndex, setStepIndex] = useState(0);
    const [stepStates, setStepStates] = useState<State[]>([]);

    useEffect(() => {
        if (input === "") {
            setResult(null);
            setStepStates([]);
            setStepIndex(0);
        } else {
            setResult(validateWord(input));
            setStepStates(getStepSequence(input));
            setStepIndex(0);
        }
    }, [input, validateWord, states, transitions]);

    function getStepSequence(word: string): State[] {
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
    }

    function drawCanvas(highlightState?: State) {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        draw(ctx, highlightState);
    }

    useEffect(() => {
        drawCanvas(stepStates[stepIndex]);
    }, [stepIndex, stepStates, states, transitions, draw]);

    return (
        <BaseScreen>
            <main className="flex flex-1 flex-col items-center">
                <DefaultHeader
                    title="Autômato Finito"
                    description="Crie autômatos finitos"
                />

                <Toolbar setMode={setMode} />

                <div className="flex gap-2 my-4 items-center">
                    <input
                        className={`border px-2 py-1 rounded text-black ${
                            result === null
                                ? ""
                                : result
                                ? "bg-green-200 border-green-500"
                                : "bg-red-200 border-red-500"
                        }`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Digite a palavra"
                    />

                    <button
                        onClick={() => setStepIndex((prev) => Math.max(prev - 1, 0))}
                        className="bg-gray-300 px-2 py-1 rounded"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => setStepIndex((prev) => Math.min(prev + 1, stepStates.length - 1))}
                        className="bg-gray-300 px-2 py-1 rounded"
                    >
                        Next
                    </button>
                </div>

                <canvas id="canvas" width={800} height={600}></canvas>
            </main>
        </BaseScreen>
    );
}
