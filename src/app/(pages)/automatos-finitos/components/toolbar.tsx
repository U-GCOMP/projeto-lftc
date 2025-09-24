import { eraserIcon, cursorIcon, arrowIcon, moveIcon, circleIcon } from "@/assets/icons/_index"
import { IconAppButton } from "@/components/buttons/icon-app-button"
import { Mode, ToolbarProps } from "../finite-automaton.types"

export function Toolbar({ mode, setMode } : ToolbarProps) {
    return (
        <section className="flex gap-1">
            <IconAppButton
                onClick={() => setMode(Mode.SELECT)}
                icon={cursorIcon}
                alt="Modo selecionar"
                isHighlighted={mode === Mode.SELECT}
            />

            <IconAppButton
                onClick={() => setMode(Mode.INSERT)}
                icon={circleIcon}
                alt="Modo adicionar"
                isHighlighted={mode === Mode.INSERT}
            />

            <IconAppButton
                onClick={() => setMode(Mode.LINK)}
                icon={arrowIcon}
                alt="Modo link"
                isHighlighted={mode === Mode.LINK}
            />

            <IconAppButton
                onClick={() => setMode(Mode.DELETE)}
                icon={eraserIcon}
                alt="Modo remover"
                isHighlighted={mode === Mode.DELETE}
            />

            <IconAppButton
                onClick={() => setMode(Mode.DRAG)}
                icon={moveIcon}
                alt="Modo arrastar"
                isHighlighted={mode === Mode.DRAG}
            />
        </section>
    )
}
