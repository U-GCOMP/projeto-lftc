'use client'

import BaseScreen from "@/components/base-screen/base-screen";
import DefaultHeader from "@/components/default-header/default-header";
import TextAppButton from "@/components/buttons/text-app-button";
import { RegularGrammarProps } from "./regular-grammar.types";
import { RegularGrammarRow } from "./components/regular-grammar-row";
import { TestStringSection } from "@/components/test-strings-section";
import { HintBoxComponent } from "@/components/hint-box-component";

export function RegularGrammarLayout({
    rulesArray,
    setRuleAt,
    addRuleRow,
    removeRuleRowAt,
    testStringArray,
    setTestStringAt,
    addTestString,
    removeTestStringAt,
    testGrammar,
    handleRuleValuePressEnter,
    hintButtonRef,
    hintBoxRef,
    isHintModalOpen,
    setIsHintModalOpen,
}: RegularGrammarProps) {
    return (
        <BaseScreen>
            <main className="flex flex-1 flex-col items-center">
                <DefaultHeader
                    title="Gramática Regular (GLUD)"
                    description="À esquerda da seta, digite os não-terminais. À direita, o valor correspondente."
                />

                <div className="relative mb-4">
                    <button
                        ref={hintButtonRef}
                        onClick={() => setIsHintModalOpen(!isHintModalOpen)}
                        className="cursor-pointer text-sm underline underline-offset-4 text-accent-300"
                        >
                        Como escrevo uma GLUD?
                    </button>
                    <HintBoxComponent
                        ref={hintBoxRef}
                        isOpen={isHintModalOpen}
                        >
                        <p className="text-sm">
                            Uma Gramática Linear à Direita (GLUD) é composta por regras de produção que seguem um formato específico. Cada regra deve ser escrita da seguinte maneira:
                            <br />
                            S → aA
                            <br />
                            A → b
                            <br />
                            A → λ (representa a cadeia vazia)
                        </p>
                    </HintBoxComponent>
                </div>
                

                <section className="flex flex-col flex-wrap justify-start items-center gap-y-1 gap-x-5 max-h-80 overflow-x-auto">
                    {rulesArray.map((rule, index) => (
                        <RegularGrammarRow
                            className="w-[300px]"
                            key={index}
                            rule={rule}
                            setRule={(newRule) => setRuleAt(index, newRule)}
                            shouldShowDeleteButton={rulesArray.length > 1}
                            onDeleteRow={() => removeRuleRowAt(index)}
                            onPressEnter={() => handleRuleValuePressEnter(index)}
                        />
                    ))}
                    <TextAppButton
                        className="w-[300px]"
                        text="Adicionar +"
                        onClick={addRuleRow}
                        buttonProps={{
                            "aria-label": "Adicionar linha da gramática regular"
                        }}
                    />
                </section>

                <TestStringSection
                    testStringArray={testStringArray}
                    addTestString={addTestString}
                    onChangeTestString={setTestStringAt}
                    removeTestString={removeTestStringAt}
                    testStringFunction={testGrammar}
                />
            </main>
        </BaseScreen>
    )
}