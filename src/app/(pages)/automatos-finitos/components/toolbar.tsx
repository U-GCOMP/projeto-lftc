import { trashIcon } from "@/assets/icons/_index"
import { IconAppButton } from "@/components/buttons/icon-app-button"
import { Mode, ToolbarProps } from "../finite-automaton.types"

export function Toolbar({ setMode } : ToolbarProps) {
    return (
        <section className="flex">
            <IconAppButton
                onClick={() => setMode(Mode.SELECT)}
                icon={trashIcon}
                alt="Modo selecionar"
            />

            <IconAppButton
                onClick={() => setMode(Mode.INSERT)}
                icon={trashIcon}
                alt="Modo adicionar"
            />

            <IconAppButton
                onClick={() => setMode(Mode.LINK)}
                icon={trashIcon}
                alt="Modo link"
            />

            <IconAppButton
                onClick={() => setMode(Mode.DELETE)}
                icon={trashIcon}
                alt="Modo remover"
            />

            <IconAppButton
                onClick={() => setMode(Mode.DRAG)}
                icon={trashIcon}
                alt="Modo arrastar"
            />
        </section>
    )
}
