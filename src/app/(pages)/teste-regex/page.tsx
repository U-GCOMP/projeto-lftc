'use client'
import trashIcon from "@/assets/icons/trash-icon.svg";
import BaseScreen from "@/components/base-screen/base-screen";
import TextInput from "@/components/text-input/text-input";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function TesteRegexPage() {
  const [regex, setRegex] = useState("^$");
  const [testStringArray, setTestStringArray] = useState<string[]>([""]);

  useEffect(() => {
    testStringArray.forEach((testString, index) => {
      testStringMatches(testString, index);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regex, testStringArray.length]);

  const addTestString = () => {
    setTestStringArray([...testStringArray, ""]);
  }

  const removeTestString = (index: number) => {
    const newArray = [...testStringArray];
    newArray.splice(index, 1);
    setTestStringArray(newArray);
  }

  const onChangeTestString = (index: number, value: string) => {
    const newArray = [...testStringArray];
    newArray[index] = value;
    setTestStringArray(newArray);

    testStringMatches(value, index);
  };

  const testStringMatches = (value: string, index: number) => {
    if (!RegExp(regex).test(value)) {
      document.getElementById(`test-string-${index}`)?.style.setProperty("background-color", "var(--color-regex-error)");
      return;
    }

    document.getElementById(`test-string-${index}`)?.style.setProperty("background-color", "var(--color-regex-success)");
  };

  return (
    <BaseScreen>
      <main className="flex flex-1 flex-col items-center">
        <h1 className="text-3xl font-bold mb-2 text-accent-default">
          Teste de Expressão Regular
        </h1>
        <p className="max-w-2xl text-white mb-6 text-lg">
          Digite uma expressão regular e teste se os inputs atendem a ela, ou não.
        </p>

        <TextInput label="Regex" value={regex} onChange={setRegex} />

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
            mr-2
          "
        >
          <span className="flex flex-1 justify-between w-full">
            <h2 className="text-2xl bg-brand-default px-2 text-accent-default">
              Strings de Teste
            </h2>

            <button
              className="bg-brand-default text-success-300 px-2 border-success-300 border-2 rounded hover:bg-success-300 hover:text-white transition-all duration-200"
              onClick={addTestString}
              aria-label="Adicionar String de Teste"
            >
              Adicionar +
            </button>
          </span>

          <section className="flex flex-wrap gap-4 mt-4 w-full mx-auto justify-center-safe">
            {testStringArray.map((testString, index) => (
              <div
                key={index}
                className="flex items-center gap-3 min-w-[250px]"
                aria-live="polite"
              >
                {testStringArray.length > 1 && (
                  <button
                    className="flex items-center mt-3 hover:scale-110"
                    onClick={() => removeTestString(index)}
                    aria-label="Remover String de Teste"
                  >
                    <Image src={trashIcon} alt="Remover String de Teste" width={24} height={24} />
                  </button>
                )}
                <TextInput
                  id={`test-string-${index}`}
                  label={`String de Teste ${index + 1}`}
                  value={testString}
                  onChange={(value) => onChangeTestString(index, value)}
                />
                
              </div>
            ))}
          </section>

        </section>
      </main>
    </BaseScreen>
  )
}