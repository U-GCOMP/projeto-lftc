'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [regexText, setRegexText] = useState('');
  const [teste, setTeste] = useState('');
  const [regex, setRegex] = useState<RegExp | null>(null);

  const regexInput = useRef<HTMLInputElement>(null);
  const testeInput = useRef<HTMLInputElement>(null);

  const validarRegex = (value: string, testeAtual: string) => {
    try {
      const novaRegex = new RegExp(value);
      setRegex(novaRegex);
      if (regexInput.current) regexInput.current.style.background = 'lightgreen';
      validarTeste(testeAtual, novaRegex);
    } catch {
      setRegex(null);
      if (regexInput.current) regexInput.current.style.background = 'lightcoral';
      if (testeInput.current) testeInput.current.style.background = 'lightcoral';
    }
  };

  const validarTeste = (value: string, regexParaUsar?: RegExp | null) => {
    const r = regexParaUsar ?? regex;
    try {
      if (r && r.test(value)) {
        if (testeInput.current) testeInput.current.style.background = 'lightgreen';
      } else {
        if (testeInput.current) testeInput.current.style.background = 'lightcoral';
      }
    } catch {
      if (testeInput.current) testeInput.current.style.background = 'lightcoral';
    }
  };

  return (
    <>
      <label htmlFor="regex">REGEX: </label>
      <input
        type="text"
        id="regex"
        ref={regexInput}
        value={regexText}
        style={{border: '1px solid white'}}
        onChange={(e) => {
          const valor = e.target.value;
          setRegexText(valor);
          validarRegex(valor, teste);
        }}
      />

      <br />

      <label htmlFor="teste">TESTAR: </label>
      <input
        id="teste"
        type="text"
        ref={testeInput}
        value={teste}
        style={{border: '1px solid white'}}
        onChange={(e) => {
          const valor = e.target.value;
          setTeste(valor);
          validarTeste(valor);
        }}
      />
    </>
  );
}
