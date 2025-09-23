import BaseScreen from "@/components/base-screen/base-screen";
import DefaultHeader from "@/components/default-header/default-header";
import { FiniteAutomatonProps } from "./finite-automaton.types";
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
    validateWord
}: FiniteAutomatonProps) {
    const [input, setInput] = useState("");
    const [result, setResult] = useState<null | boolean>(null);

    useEffect(() => {
        if (input === "") {
            setResult(null);
        } else {
            setResult(validateWord(input));
        }
    }, [input, validateWord]);
    
    return (
        <BaseScreen>
            <main className="flex flex-1 flex-col items-center">
                <DefaultHeader
                    title="Autômato Finito"
                    description="Crie automâtos finitos"
                />

                <Toolbar setMode={setMode}/>

                <div className="flex gap-2 my-4">
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
                </div>

                <canvas id="canvas" width={800} height={600}></canvas>
            </main>
        </BaseScreen>
    )
}
