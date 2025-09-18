import BaseScreen from "@/components/base-screen/base-screen";
import DefaultHeader from "@/components/default-header/default-header";
import { FiniteAutomatonProps } from "./finite-automaton.types";
import { Toolbar } from "./components/toolbar";

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
    editTransition
}: FiniteAutomatonProps) {
    return (
        <BaseScreen>
            <main className="flex flex-1 flex-col items-center">
                <DefaultHeader
                    title="Autômato Finito"
                    description="Crie automâtos finitos"
                />

                <Toolbar setMode={setMode}/>

                <canvas id="canvas" width={800} height={600}></canvas>
            </main>
        </BaseScreen>
    )
}
