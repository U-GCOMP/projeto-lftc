import TextAppButton from "./buttons/text-app-button";
import { TestInputComponent } from "./test-input-component";

interface TestStringSectionProps {
    testStringArray: string[];
    addTestString: () => void;
    removeTestString: (index: number) => void;
    onChangeTestString: (index: number, value: string) => void;
    testStringFunction: (value: string) => boolean;
}

export function TestStringSection({
    testStringArray,
    addTestString,
    removeTestString,
    onChangeTestString,
    testStringFunction
}: TestStringSectionProps) {
    return (
        <section
                  className="
                    relative
                    w-full
                    flex
                    flex-1
                    flex-col
                    flex-wrap
                    items-start
                    px-4
                    mt-6
                    before:content-['']
                    before:absolute
                    before:w-full
                    before:h-0.5
                    before:bg-accent-300
                    before:rounded
                    before:top-5.5
                    before:left-0
                    before:-z-1
                  "
                >
                  <span className="flex max-h-fit justify-between w-full">
                    <h2 className="text-2xl bg-brand-default px-2 text-accent-default">
                      Strings de Teste
                    </h2>
        
                    <TextAppButton
                      text="Adicionar +"
                      onClick={addTestString}
                      buttonProps={{ "aria-label": "Adicionar String de Teste" }}
                    />
                  </span>
        
                  <section className="flex flex-wrap items-start gap-4 mt-4 w-full mx-auto justify-center-safe">
                    {testStringArray.map((testString, index) => (
                      <TestInputComponent
                        key={index}
                        index={index}
                        testString={testString}
                        testStringArray={testStringArray}
                        onChangeTestString={onChangeTestString}
                        removeTestString={removeTestString}
                        testStringFunction={testStringFunction}
                        shouldShowDeleteButton={testStringArray.length > 1}
                      />
                    ))}
                  </section>
        
                </section>
    )
}