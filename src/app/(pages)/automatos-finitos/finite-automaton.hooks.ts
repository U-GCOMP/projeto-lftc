import { useState, useEffect, useRef } from "react";
import { FiniteAutomatonProps } from "./finite-automaton.types";
import { Camera, CanvasSize, State, Transition, Mode, Point } from "./finite-automaton.types";

export function useAutomaton(): FiniteAutomatonProps {
    const [states, setStates] = useState<State[]>([]);
    const [transitions, setTransitions] = useState<Transition[]>([]);
    const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 800, height: 600 });
    const [camera] = useState<Camera>(new Camera(0, 0, 5));
    const [mode, setMode] = useState<Mode>(Mode.INSERT);
    const selected = useRef<State | null>(null);

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

    function drawArrowHead(ctx: CanvasRenderingContext2D, from: Point, to: Point, radius = 5, size = 3) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx);

        // shift endpoint backward along the line by radius
        const endX = to.x - radius * Math.cos(angle);
        const endY = to.y - radius * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - size * Math.cos(angle - Math.PI / 6),
            endY - size * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - size * Math.cos(angle + Math.PI / 6),
            endY - size * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
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

    function drawTransition(
        ctx: CanvasRenderingContext2D,
        origin: State,
        destination: State,
        fgColor: string,
        radius = 5
    ) {
        const values = transitions
        .filter(t => t.origin === origin && t.destination === destination)
        .map(t => t.value)
        .sort();

        if (values.length === 0) return;

        const reverseValues = transitions
        .filter(t => t.origin === destination && t.destination === origin)
        .map(t => t.value)
        .sort();

        const midPoint = {
            x: (origin.x + destination.x) / 2,
            y: (origin.y + destination.y) / 2,
        };

        const dx = destination.x - origin.x;
        const dy = destination.y - origin.y;
        const norm = Math.hypot(dx, dy);

        const lineVector = { x: dx / norm, y: dy / norm };
        const perpVector = { x: -lineVector.y, y: lineVector.x };

        const spacing = 14 / camera.z; // pixels between stacked labels

        // Single arrow case
        if (reverseValues.length === 0) {
            ctx.save();
            ctx.strokeStyle = fgColor;

            // Draw main line
            ctx.beginPath();
            ctx.moveTo(origin.x, origin.y);
            ctx.lineTo(destination.x, destination.y);
            ctx.stroke();

            drawArrowHead(ctx, origin, destination);

            ctx.setTransform(1, 0, 0, 1, 0, 0); // reset to screen space

            ctx.font = "12px serif";
            ctx.fillStyle = fgColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            let i = 1;
            for (const v of values) {
                const worldPos = {
                    x: midPoint.x + perpVector.x * spacing * i,
                    y: midPoint.y + perpVector.y * spacing * i
                };
                const pos = worldToScreen(worldPos);
                ctx.fillText(v, pos.x, pos.y);
                i++;
            }

            ctx.restore();
        } 
        // Rounded arrows
        else {
            ctx.save();
            ctx.strokeStyle = fgColor;

            const cp1 = {
                x: midPoint.x + 10 * perpVector.x,
                y: midPoint.y + 10 * perpVector.y,
            };
            const cp2 = {
                x: midPoint.x - 10 * perpVector.x,
                y: midPoint.y - 10 * perpVector.y,
            };

            // First curve
            ctx.beginPath();
            ctx.moveTo(origin.x, origin.y);
            ctx.quadraticCurveTo(cp1.x, cp1.y, destination.x, destination.y);
            ctx.stroke();
            drawArrowHead(ctx, cp1, destination);

            // Second curve (reverse)
            ctx.beginPath();
            ctx.moveTo(destination.x, destination.y);
            ctx.quadraticCurveTo(cp2.x, cp2.y, origin.x, origin.y);
            ctx.stroke();
            drawArrowHead(ctx, cp2, origin);

            // Draw stacked labels
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            ctx.font = "12px serif";
            ctx.fillStyle = fgColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            let i = 1;
            for (const v of values) {
                const worldPos = {
                    x: cp1.x + perpVector.x * spacing * i,
                    y: cp1.y + perpVector.y * spacing * i,
                };
                const screenPos = worldToScreen(worldPos);
                ctx.fillText(v, screenPos.x, screenPos.y);
                i++;
            }

            i = -1;
            for (const v of reverseValues) {
                const worldPos = {
                    x: cp2.x + perpVector.x * spacing * i,
                    y: cp2.y + perpVector.y * spacing * i,
                };
                const screenPos = worldToScreen(worldPos);
                ctx.fillText(v, screenPos.x, screenPos.y);
                i--;
            }

            ctx.restore();
            ctx.restore();
        }
    }

    function draw(ctx: CanvasRenderingContext2D) {
        const { width, height } = canvasSize;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.restore();

        ctx.save();

        // Camera transform
        ctx.translate(width / 2, height / 2);
        ctx.scale(1, -1);
        ctx.scale(cameraRef.current.z, cameraRef.current.z);
        ctx.translate(-cameraRef.current.x, -cameraRef.current.y);
        ctx.lineWidth = 0.2;

        // Background
        drawBackground(ctx);

        const seen = new Set<string>();
        for (const t of transitions) {
            const key = `${t.origin.id}-${t.destination.id}`;
            if (!seen.has(key)) {
                seen.add(key);
                drawTransition(ctx, t.origin, t.destination, foregroundColor);
            }
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

    function worldToScreen(p: Point): Point {
        return {
            x: canvasSize.width / 2 + (p.x - camera.x) * camera.z,
            y: canvasSize.height / 2 - (p.y - camera.y) * camera.z, // flip Y
        };
    }


    // Converte coordenadas de clique (pixel) para coordenadas do mundo (com câmera)
    function screenToWorld(p: Point): Point {
        const { width, height } = canvasSize;
        const cam = cameraRef.current;

        // normaliza para centro do canvas
        let nx = p.x - width / 2;
        let ny = height / 2 - p.y; // inverte Y porque o canvas é "top-down"

        // aplica zoom
        nx /= cam.z;
        ny /= cam.z;

        // aplica offset da câmera
        nx += cam.x;
        ny += cam.y;

        return { x: nx, y: ny };
    }

    function clickedOnState(x: number, y: number, radius = 5) : State | undefined{
        // convert screen coords to world coords
        const pos = screenToWorld({x, y});

        // check if click is inside any state
        const clickedState = states.find(
            (s) => Math.hypot(s.x - pos.x, s.y - pos.y) <= radius
        );

        return clickedState;
    }

    function deleteStateAtClick(
        e: MouseEvent,
        radius = 5
    ) {
        const canvas = e.currentTarget as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const clickedState = clickedOnState(e.offsetX, e.offsetY, radius);

        if (clickedState) {
            removeState(clickedState); // remove from states and associated transitions
            draw(ctx); // redraw canvas
        }
    }

    function selectStateAtClick(
        e: MouseEvent,
        radius = 5
    ) {
        const canvas = e.currentTarget as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const clickedState = clickedOnState(e.offsetX, e.offsetY, radius);

        if (clickedState) {
            selected.current = clickedState;
        }
    }

    function linkStateAtUp(e: MouseEvent, radius = 5) {
        console.log(`Selected: ${selected.current}`)
        if (!selected.current) return;

        const canvas = e.currentTarget as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // detect if user released over a state
        const clickedState = clickedOnState(e.offsetX, e.offsetY, radius);

        if (clickedState) {
            const value = prompt("Insira o valor da transição:");
            if (value && value.trim() !== "") {
                addTransition(selected.current, clickedState, value.trim());
                draw(ctx);
            }
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
            const pos = screenToWorld({x: e.offsetX, y: e.offsetY});
            addState(`q${stateCount.current}`, pos.x, pos.y);
            draw(ctx);
        }

        if (mode === Mode.LINK && e.button === 0) {
            selectStateAtClick(e, 5);
        }

        // Delete states
        if (mode === Mode.DELETE && e.button === 0) {
            deleteStateAtClick(e, 5);
        }

        // Select states
        if (mode === Mode.SELECT && e.button === 0) {
            e.preventDefault();
        }
    }

    function onMouseUp(e: MouseEvent) {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
        if (!canvas) return;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        if (!ctx) return;

        lastPosRef.current = { x: e.clientX, y: e.clientY };
        
        if (mode === Mode.LINK) {
            linkStateAtUp(e, 5);
        }

        selected.current = null;
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
        canvas.addEventListener("mouseup", onMouseUp);
        return () => {
            canvas.removeEventListener("mousedown", onMouseDown);
            canvas.removeEventListener("mouseup", onMouseUp);
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
