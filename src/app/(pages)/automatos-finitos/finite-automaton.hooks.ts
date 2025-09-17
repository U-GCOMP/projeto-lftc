import { useState, useEffect, useRef } from "react";
import { FiniteAutomatonProps } from "./finite-automaton.types";
import { Camera, CanvasSize, State, Transition, Mode } from "./finite-automaton.types";

export function useAutomaton(): FiniteAutomatonProps {
    const [states, setStates] = useState<State[]>([]);
    const [transitions, setTransitions] = useState<Transition[]>([]);
    const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 800, height: 600 });
    const [camera] = useState<Camera>(new Camera(0, 0, 5));
    const [mode, setMode] = useState<Mode>(Mode.INSERT);

    const stateCount = useRef(0);
    const transitionCount = useRef(0);

    const lastPosRef = useRef({ x: 0, y: 0 });
    const cameraRef = useRef(camera);

    const backgroundColor = "#222";
    const foregroundColor = "#fff";

    function drawBackground(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(-1000, -1000, 2000, 2000);
    }

    function drawState(
        ctx: CanvasRenderingContext2D,
        state: State,
        radius: number,
        bgColor: string,
        fgColor: string,
    ) {
        // circle in world coords (uses current transformed ctx)
        ctx.beginPath();
        ctx.arc(state.x, state.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = bgColor;
        ctx.strokeStyle = fgColor;
        ctx.fill();
        ctx.stroke();

        // draw name upright in screen coordinates
        ctx.save();
        // reset transform to identity (draw in pixel space)
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // compute screen position of the state's world coordinates
        const sx = canvasSize.width / 2 + (state.x - camera.x) * camera.z;
        const sy = canvasSize.height / 2 - (state.y - camera.y) * camera.z;

        ctx.fillStyle = fgColor; // text color
        ctx.font = `${Math.max(12, radius * 2)}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(state.name, sx, sy);

        ctx.restore();
    }

    function drawTransition(ctx: CanvasRenderingContext2D, transition: Transition) {
        const a = transition.origin;
        const b = transition.destination;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
    }

    function draw(ctx: CanvasRenderingContext2D) {
        const { width, height } = canvasSize;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.restore();

        ctx.save();

        // Transformação da câmera
        ctx.translate(width / 2, height / 2);
        ctx.scale(1, -1);
        ctx.scale(cameraRef.current.z, cameraRef.current.z);
        ctx.translate(-cameraRef.current.x, -cameraRef.current.y);
        ctx.lineWidth = 0.2;

        // Desenho
        drawBackground(ctx);

        for (const transition of transitions) {
            drawTransition(ctx, transition);
        }

        for (const state of states) {
            drawState(ctx, state, 5, backgroundColor, foregroundColor);
        }

        ctx.restore();
    }

    function addState(name: string, x: number, y: number) {
        const state: State = {
            id: stateCount.current++,
            name,
            x,
            y,
        };
        setStates((prev) => [...prev, state]);
    }

    function addTransition(origin: State, destination: State, value: string) {
        const transition: Transition = {
            id: transitionCount.current++,
            origin,
            destination,
            value,
        };
        setTransitions((prev) => [...prev, transition]);
    }

    function removeState(state: State) {
        setStates((prev) => prev.filter((s) => s !== state));
        setTransitions((prev) => prev.filter((t) => t.origin !== state && t.destination !== state));
    }

    function removeTransition(transition: Transition) {
        setTransitions((prev) => prev.filter((t) => t !== transition));
    }

    function editState(updated: State) {
        setStates((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    }

    function editTransition(updated: Transition) {
        setTransitions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }

    // Converte coordenadas de clique (pixel) para coordenadas do mundo (com câmera)
    function screenToWorld(x: number, y: number): { x: number; y: number } {
        const { width, height } = canvasSize;
        const cam = cameraRef.current;

        // normaliza para centro do canvas
        let nx = x - width / 2;
        let ny = height / 2 - y; // inverte Y porque o canvas é "top-down"

        // aplica zoom
        nx /= cam.z;
        ny /= cam.z;

        // aplica offset da câmera
        nx += cam.x;
        ny += cam.y;

        return { x: nx, y: ny };
    }

    function deleteStateAtClick(
        e: MouseEvent,
        radius = 5
    ) {
        const canvas = e.currentTarget as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // convert screen coords to world coords
        const pos = screenToWorld(e.offsetX, e.offsetY);

        // check if click is inside any state
        const clickedState = states.find(
            (s) => Math.hypot(s.x - pos.x, s.y - pos.y) <= radius
        );

        if (clickedState) {
            removeState(clickedState); // remove from states and associated transitions
            draw(ctx); // redraw canvas
        }
    }


    function onMouseDown(e: MouseEvent) {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
        if (!canvas) return;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        if (!ctx) return;

        lastPosRef.current = { x: e.clientX, y: e.clientY };

        // Insert states
        if (mode === Mode.INSERT && e.button === 0) {
            const pos = screenToWorld(e.offsetX, e.offsetY);
            addState(`q${stateCount.current}`, pos.x, pos.y);
            draw(ctx);
        }

        // Delete states
        if (mode === Mode.DELETE && e.button === 0) {
            deleteStateAtClick(e, 5);
        }

        // Select states
        if (mode === Mode.MOVE && e.button === 0) {
            e.preventDefault();
        }
    }

    // Efeito para atualizar o canvas
    useEffect(() => {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        setCanvasSize({ width: canvas.width, height: canvas.height });
        draw(ctx);

        // registrar mouse down
        canvas.addEventListener("mousedown", onMouseDown);
        return () => {
            canvas.removeEventListener("mousedown", onMouseDown);
        };
    }, [states, transitions, mode]);

    return {
        states,
        transitions,
        camera,
        mode,
        setMode,
        addState,
        addTransition,
        removeState,
        removeTransition,
        editState,
        editTransition,
    };
}
