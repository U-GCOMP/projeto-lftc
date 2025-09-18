import { useState, useEffect, useRef } from "react";
import { MouseButton, MouseButtons, FiniteAutomatonProps } from "./finite-automaton.types";
import { Camera, CanvasSize, State, Transition, Mode, Point } from "./finite-automaton.types";
import { radius, arrowHeadSize, foregroundColor, backgroundColor, zoomFactor } from "./finite-automaton.constants";

export function useAutomaton(): FiniteAutomatonProps {
    const [states, setStates] = useState<State[]>([]);
    const [transitions, setTransitions] = useState<Transition[]>([]);
    const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 800, height: 600 });
    const [camera] = useState<Camera>(new Camera(0, 0, 5));
    const [mode, setMode] = useState<Mode>(Mode.INSERT);
    const selected = useRef<State | null>(null);
    const moveStates = useRef<State[] | undefined>(undefined);

    const stateCount = useRef(0);
    const transitionCount = useRef(0);

    const lastPosRef = useRef({ x: 0, y: 0 });
    const cameraRef = useRef(camera);


    function drawBackground(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(-1000, -1000, 2000, 2000);
    }

    function drawArrowHead(ctx: CanvasRenderingContext2D, from: Point, to: Point) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx);

        // shift endpoint backward along the line by radius
        const endX = to.x - radius * Math.cos(angle);
        const endY = to.y - radius * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowHeadSize * Math.cos(angle - Math.PI / 6),
            endY - arrowHeadSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowHeadSize * Math.cos(angle + Math.PI / 6),
            endY - arrowHeadSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
    }

    function drawState(
        ctx: CanvasRenderingContext2D,
        state: State,
        bgColor: string,
        fgColor: string,
    ) {
        // circle in world coords (uses current transformed ctx)
        ctx.fillStyle = bgColor;
        ctx.strokeStyle = fgColor;

        // Main circle
        ctx.beginPath();
        ctx.arc(state.x, state.y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Final state inner ring
        if (state.final) {
            ctx.beginPath();
            ctx.arc(state.x, state.y, radius - 1, 0, 2 * Math.PI);
            ctx.stroke();
        }

        // Initial state triangle
        if (state.initial) {
            ctx.beginPath();
            ctx.moveTo(state.x - radius, state.y); // left border of the circle
            ctx.lineTo(state.x - 2 * radius, state.y + radius); // upper corner of the triangle
            ctx.lineTo(state.x - 2 * radius, state.y - radius); // bottom corner of the triangle
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        // draw name upright in screen coordinates
        ctx.save();
        // reset transform to identity (draw in pixel space)
        ctx.scale(1, -1);

        ctx.fillStyle = fgColor; // text color
        ctx.font = '3px Arial';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(state.name, state.x, -state.y);

        ctx.restore();
    }

    function drawTransition(
        ctx: CanvasRenderingContext2D,
        origin: State,
        destination: State,
        fgColor: string,
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

            ctx.scale(1, -1); // reset to screen space

            ctx.font = "3px Arial";
            ctx.fillStyle = fgColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            let i = 1;
            for (const v of values) {
                const pos = {
                    x: midPoint.x + perpVector.x * spacing * i,
                    y: midPoint.y + perpVector.y * spacing * i
                };
                ctx.fillText(v, pos.x, -pos.y);
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
            ctx.scale(1, -1);

            ctx.font = "3px Arial";
            ctx.fillStyle = fgColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            let i = 0;
            for (const v of values) {
                const pos = {
                    x: cp1.x + perpVector.x * spacing * i,
                    y: cp1.y + perpVector.y * spacing * i,
                };
                ctx.fillText(v, pos.x, -pos.y);
                i++;
            }

            i = 0;
            for (const v of reverseValues) {
                const pos = {
                    x: cp2.x + perpVector.x * spacing * i,
                    y: cp2.y + perpVector.y * spacing * i,
                };
                ctx.fillText(v, pos.x, -pos.y);
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
            drawState(ctx, state, backgroundColor, foregroundColor);
        }

        ctx.restore();
    }

    function addState(name: string, x: number, y: number, initial = false, final = false) {
        const state: State = {
            id: stateCount.current++,
            name,
            x,
            y,
            initial,
            final,
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

    function clickedOnState(x: number, y: number) : State | undefined{
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
    ) {
        const canvas = e.currentTarget as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const clickedState = clickedOnState(e.offsetX, e.offsetY);

        if (clickedState) {
            removeState(clickedState); // remove from states and associated transitions
            draw(ctx); // redraw canvas
        }
    }

    function selectStateAtClick(
        e: MouseEvent,
    ) {
        const canvas = e.currentTarget as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const clickedState = clickedOnState(e.offsetX, e.offsetY);

        if (clickedState) {
            selected.current = clickedState;
        }
    }

    function linkStateAtUp(e: MouseEvent) {
        if (!selected.current) return;

        const canvas = e.currentTarget as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // detect if user released over a state
        const clickedState = clickedOnState(e.offsetX, e.offsetY);

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
        if (mode === Mode.INSERT && e.button === MouseButton.LEFT) {
            const pos = screenToWorld({x: e.offsetX, y: e.offsetY});
            addState(`q${stateCount.current}`, pos.x, pos.y);
            draw(ctx);
        }

        if (mode === Mode.LINK && e.button === MouseButton.LEFT) {
            selectStateAtClick(e);
        }

        // Delete states
        if (mode === Mode.DELETE && e.button === MouseButton.LEFT) {
            deleteStateAtClick(e);
        }

        // Select states
        if (mode === Mode.SELECT && e.button === MouseButton.LEFT) {
            const clickedState = clickedOnState(e.offsetX, e.offsetY);
            if (clickedState) {
                moveStates.current = [clickedState];
            }
        }

        if (mode === Mode.SELECT && e.button === MouseButton.RIGHT) {
            const clickedState = clickedOnState(e.offsetX, e.offsetY);
            if (clickedState) {
                const choice = window.prompt(
                    "Set state type:\n1 = Initial\n2 = Final\n3 = Both\n0 = Normal",
                    "0"
                );

                switch (choice) {
                    case "1":
                        clickedState.initial = true;
                        clickedState.final = false;
                        break;
                    case "2":
                        clickedState.initial = false;
                        clickedState.final = true;
                        break;
                    case "3":
                        clickedState.initial = true;
                        clickedState.final = true;
                        break;
                    default:
                        clickedState.initial = false;
                        clickedState.final = false;
                        break;
                }

                draw(ctx); // re-render canvas}
            }
        }
    }

    function onMouseMove(e: MouseEvent) {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
        if (!canvas) return;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        if (!ctx) return;

        const prevPos = lastPosRef.current;
        const currPos = { x: e.clientX, y: e.clientY };

        if (mode === Mode.SELECT && e.buttons === MouseButtons.LEFT && moveStates.current) {
            // compute screen delta
            const dxScreen = currPos.x - prevPos.x;
            const dyScreen = currPos.y - prevPos.y;

            // convert to world-space
            const dxWorld = dxScreen / camera.z;
            const dyWorld = -dyScreen / camera.z; // invert Y if needed

            for (const state of moveStates.current) {
                state.x += dxWorld;
                state.y += dyWorld;
            }

            draw(ctx);
        }

        if (e.buttons === MouseButtons.MIDDLE || (mode === Mode.DRAG && e.buttons === MouseButtons.LEFT)) {
            const prev = lastPosRef.current;
            const curr = { x: e.clientX, y: e.clientY };

            // screen–space delta
            const dx = curr.x - prev.x;
            const dy = curr.y - prev.y;

            // adjust camera position in world space
            camera.x -= dx / camera.z;
            camera.y += dy / camera.z; // note Y is inverted (canvas has flipped Y)

            draw(ctx);

            lastPosRef.current = curr;
        }

        // update last position
        lastPosRef.current = currPos;
    }

    function onMouseUp(e: MouseEvent) {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
        if (!canvas) return;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        if (!ctx) return;

        lastPosRef.current = { x: e.clientX, y: e.clientY };
        
        if (mode === Mode.LINK) {
            linkStateAtUp(e);
        }

        selected.current = null;
        moveStates.current = undefined;
    }

    function onWheel(e: WheelEvent) {
        e.preventDefault(); // prevent page scrolling

        const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
        if (!canvas) return;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        if (!ctx) return;

        // determine zoom direction: negative deltaY means zoom in
        const zoomAmount = e.deltaY * -0.001; // scale factor, adjust as needed
        const zoomFactor = 1 + zoomAmount;

        // compute mouse position in world coordinates
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
        const mouseWorldX = camera.x + (e.clientX - rect.left - canvasSize.width / 2) / camera.z;
        const mouseWorldY = camera.y - (e.clientY - rect.top - canvasSize.height / 2) / camera.z;

        // apply zoom towards mouse position
        camera.z *= zoomFactor;
        camera.x = mouseWorldX - (e.clientX - rect.left - canvasSize.width / 2) / camera.z;
        camera.y = mouseWorldY + (e.clientY - rect.top - canvasSize.height / 2) / camera.z;

        draw(ctx); // redraw after zoom
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
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("contextmenu", (e) => e.preventDefault());
        canvas.addEventListener("wheel", onWheel);
        return () => {
            canvas.removeEventListener("mousedown", onMouseDown);
            canvas.removeEventListener("mouseup", onMouseUp);
            canvas.removeEventListener("mousemove", onMouseMove);
            canvas.removeEventListener("wheel", onWheel);
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
