import BaseScreen from "@/components/base-screen/base-screen";

export default function Home() {
  return (
    <BaseScreen>
      <main className="flex-1 flex flex-col items-center justify-around text-center px-6">
        <span>
          <h1 className="text-3xl font-bold mb-2 text-accent-default">
            Projetos de Linguagens Formais e Teoria da Computação
          </h1>
          <h2 className="text-xl font-semibold text-accent-300 mb-4">
            FCT - Unesp
          </h2>
        </span>
        <p className="max-w-2xl text-white mb-6 text-lg">
          Este é um site desenvolvido por alunos da FCT - Unesp para centralizar
          os projetos realizados na disciplina de Linguagens Formais e Teoria da
          Computação.
        </p>
        <span>
          <h3 className="text-lg font-medium mb-2 text-accent-default">Desenvolvido por:</h3>
          <ul className="space-y-1 text-gray-300">
            <li className="text-white">José Henrique Ioki Yamaoki</li>
            <li className="text-white">Raphael Gonçalves Leiva</li>
            <li className="text-white">Vítor Moreira Rodrigues</li>
          </ul>
        </span>
      </main>
    </BaseScreen>
  );
}
