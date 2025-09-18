import { eraserIcon, cursorIcon, arrowIcon, moveIcon, circleIcon } from "@/assets/icons/_index"
import { IconAppButton } from "@/components/buttons/icon-app-button"
import { Mode, ToolbarProps } from "../finite-automaton.types"

export function Toolbar({ setMode } : ToolbarProps) {
    return (
        <section className="flex">
            <IconAppButton
                onClick={() => setMode(Mode.SELECT)}
                icon={cursorIcon}
                alt="Modo selecionar"
            />

            <IconAppButton
                onClick={() => setMode(Mode.INSERT)}
                icon={circleIcon}
                alt="Modo adicionar"
            />

            <IconAppButton
                onClick={() => setMode(Mode.LINK)}
                icon={arrowIcon}
                alt="Modo link"
            />

            <IconAppButton
                onClick={() => setMode(Mode.DELETE)}
                icon={eraserIcon}
                alt="Modo remover"
            />

            <IconAppButton
                onClick={() => setMode(Mode.DRAG)}
                icon={moveIcon}
                alt="Modo arrastar"
            />
        </section>
    )
}
