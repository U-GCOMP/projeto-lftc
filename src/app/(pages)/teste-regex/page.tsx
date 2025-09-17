'use client'
import BaseScreen from "@/components/base-screen/base-screen";
import DefaultHeader from "@/components/default-header/default-header";
import { useState } from "react";
import { TestStringSection } from "@/components/test-strings-section";
import { TextInput } from "@/components/text-input/text-input";

export default function TesteRegexPage() {
  const [regex, setRegex] = useState("^$");
  const [testStringArray, setTestStringArray] = useState<string[]>([""]);

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
  };

  const testRegex = (input: string) => {
    try {
      const regexObj = new RegExp(regex);
      return regexObj.test(input);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return false;
    }
  };

  return (
    <BaseScreen>
      <main className="flex flex-1 flex-col items-center">
        <DefaultHeader
          title="Teste de Expressão Regular"
          description="Digite uma expressão regular e teste se os inputs atendem a ela, ou não."
        />

        <TextInput label="Regex" value={regex} onChange={setRegex} />

        <TestStringSection
          testStringArray={testStringArray}
          addTestString={addTestString}
          removeTestString={removeTestString}
          onChangeTestString={onChangeTestString}
          testStringFunction={testRegex}
        />
      </main>
    </BaseScreen>
  )
}