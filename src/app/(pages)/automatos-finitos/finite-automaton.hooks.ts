import { useState, useEffect, useRef, useCallback } from "react";
import { MouseButton, MouseButtons, FiniteAutomatonProps } from "./finite-automaton.types";
import { Camera, CanvasSize, State, Transition, Mode, Point } from "./finite-automaton.types";
import { radius, arrowHeadSize, foregroundColor, backgroundColor, fontSize} from "./finite-automaton.constants";

export function useAutomaton(): FiniteAutomatonProps {
    const [states, setStates] = useState<State[]>([]);
    const [transitions, setTransitions] = useState<Transition[]>([]);
    const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 800, height: 600 });
    const [mode, setMode] = useState<Mode>(Mode.INSERT);
    const selected = useRef<State | null>(null);
    const moveStates = useRef<State[] | undefined>(undefined);

    const stateCount = useRef(0);
    const transitionCount = useRef(0);

    const lastPosRef = useRef({ x: 0, y: 0 });
    const currPosRef = useRef({ x: 0, y: 0 });

    const cameraRef = useRef<Camera>(new Camera(0, 0, 5));

    const validateWord = useCallback((word: string): boolean => {
        const initial = states.find((s) => s.initial);
        if (!initial) return false;

        let currentStates = [initial];

        for (const symbol of word) {
            const nextStates: State[] = [];

            for (const cs of currentStates) {
                const outgoing = transitions.filter((t) => t.origin.id === cs.id && t.value === symbol);
                for (const t of outgoing) {
                    nextStates.push(t.destination);
                }
            }

            if (nextStates.length === 0) return false;
            currentStates = nextStates;
        }

        return currentStates.some((s) => s.final);
    }, [states, transitions]);

    const drawBackground = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(-1000, -1000, 2000, 2000);
    }, []);

    const shiftedPoint = useCallback((from: Point, to: Point, shift: number): Point => {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const norm = Math.hypot(dx, dy);
        return {
            x: to.x - (dx / norm) * shift,
            y: to.y - (dy / norm) * shift
        };
    }, []);

    const drawArrowHead = useCallback((ctx: CanvasRenderingContext2D, from: Point, to: Point) => {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx);

        // use endpoint directly (ignore radius)
        const endX = to.x;
        const endY = to.y;

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
    }, []);

    const drawState = useCallback((
        ctx: CanvasRenderingContext2D,
        state: State,
        bgColor: string,
        fgColor: string,
    ) => {
        ctx.save();

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
        // reset transform to identity (draw in pixel space)
        ctx.scale(1, -1);

        ctx.fillStyle = fgColor; // text color
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(state.name, state.x, -state.y);

        ctx.restore();
    }, []);
    

    const drawAutoTransition = useCallback((
        ctx: CanvasRenderingContext2D,
        state: State,
        fgColor: string
    ) => {
        const spacing = fontSize * 1.1;

        const autoTransitions = transitions
        .filter(t => t.origin === state && t.destination === state)
        .sort((a, b) => a.value.localeCompare(b.value));

        if (autoTransitions.length === 0) return;
        ctx.save();

        ctx.strokeStyle = fgColor;

        const sin30 = 1/2;
        const cos30 = Math.sqrt(3) / 2;

        const loopOffset = radius * 5; // adjust factor as needed
        const cp = {
            x: state.x,
            y: state.y + loopOffset,
        };

        const start = {
            x: state.x + radius * cos30,
            y: state.y + radius * sin30
        };

        const end = {
            x: state.x - radius * cos30,
            y: state.y + radius * sin30
        };

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.quadraticCurveTo(cp.x, cp.y, end.x, end.y);
        ctx.stroke();
        drawArrowHead(ctx, cp, end);

        ctx.save();
        ctx.scale(1, -1);

        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = fgColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        let i = 0;
        for (const v of autoTransitions) {
            // Position slightly above the control point, with stacking
            const pos = {
                x: cp.x,
                y: cp.y + spacing * i
            };

            // Bookkeeping
            v.x = pos.x;
            v.y = pos.y;

            ctx.fillText(v.value, pos.x, -pos.y);
            i++;
        }

        ctx.restore();

        ctx.restore();

    }, [transitions, drawArrowHead]);

    const drawTransition = useCallback((
        ctx: CanvasRenderingContext2D,
        origin: State,
        destination: State,
        fgColor: string,
    ) => {
        const transitionsOriginDest = transitions
        .filter(t => t.origin === origin && t.destination === destination && t.origin !== t.destination)
        .sort((a, b) => a.value.localeCompare(b.value));

        if (transitionsOriginDest.length === 0) return;

        const transitionsDestOrigin = transitions
        .filter(t => t.origin === destination && t.destination === origin && t.origin !== t.destination)
        .sort((a, b) => a.value.localeCompare(b.value));

        const midPoint = {
            x: (origin.x + destination.x) / 2,
            y: (origin.y + destination.y) / 2,
        };

        const dx = destination.x - origin.x;
        const dy = destination.y - origin.y;
        const norm = Math.hypot(dx, dy);

        const lineVector = { x: dx / norm, y: dy / norm };
        const perpVector = { x: -lineVector.y, y: lineVector.x };

        const spacing = fontSize * 1.1;

        // Single arrow case
        if (transitionsDestOrigin.length === 0) {
            ctx.save();
            ctx.strokeStyle = fgColor;

            // Draw main line
            ctx.beginPath();
            ctx.moveTo(origin.x, origin.y);
            ctx.lineTo(destination.x, destination.y);
            ctx.stroke();

            const end = shiftedPoint(origin, destination, radius);

            drawArrowHead(ctx, origin, end);

            ctx.scale(1, -1); // reset to screen space

            ctx.font = `${fontSize}px Arial`;
            ctx.fillStyle = fgColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            let i = 1;
            for (const v of transitionsOriginDest) {
                const pos = {
                    x: midPoint.x + perpVector.x * spacing * i,
                    y: midPoint.y + perpVector.y * spacing * i
                };
                // Bookkeeping x, y of value
                v.x = pos.x;
                v.y = pos.y;

                ctx.fillText(v.value, pos.x, -pos.y);
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

            const end1 = shiftedPoint(cp1, destination, radius);
            drawArrowHead(ctx, cp1, end1);

            // Second curve (reverse)
            ctx.beginPath();
            ctx.moveTo(destination.x, destination.y);
            ctx.quadraticCurveTo(cp2.x, cp2.y, origin.x, origin.y);
            ctx.stroke();

            const end2 = shiftedPoint(cp2, origin, radius);
            drawArrowHead(ctx, cp2, end2);

            // Draw stacked labels
            ctx.save();
            ctx.scale(1, -1);

            ctx.font = `${fontSize}px Arial`;
            ctx.fillStyle = fgColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            let i = 0;
            for (const v of transitionsOriginDest) {
                const pos = {
                    x: cp1.x + perpVector.x * spacing * i,
                    y: cp1.y + perpVector.y * spacing * i,
                };
                // Bookkeeping x, y of value
                v.x = pos.x;
                v.y = pos.y;

                ctx.fillText(v.value, pos.x, -pos.y);
                i++;
            }

            i = 0;
            for (const v of transitionsDestOrigin) {
                const pos = {
                    x: cp2.x + perpVector.x * spacing * i,
                    y: cp2.y + perpVector.y * spacing * i,
                };
                // Bookkeeping x, y of value
                v.x = pos.x;
                v.y = pos.y;

                ctx.fillText(v.value, pos.x, -pos.y);
                i--;
            }

            ctx.restore();
            ctx.restore();
        }
    }, [transitions, shiftedPoint, drawArrowHead]);

    const addState = useCallback((name: string, x: number, y: number, initial = false, final = false) => {
        const state: State = {
            id: stateCount.current++,
            name,
            x,
            y,
            initial,
            final,
        };
        setStates((prev) => [...prev, state]);
    }, []);

    const addTransition = useCallback((origin: State, destination: State, value: string) => {
        const transition: Transition = {
            id: transitionCount.current++,
            origin,
            destination,
            value,
            x: 0,
            y: 0
        };
        setTransitions((prev) => [...prev, transition]);
    }, []);

    const removeState = useCallback((state: State) => {
        setStates((prev) => prev.filter((s) => s !== state));
        setTransitions((prev) => prev.filter((t) => t.origin !== state && t.destination !== state));
    }, []);

    const removeTransition = useCallback((transition: Transition) => {
        setTransitions((prev) => prev.filter((t) => t !== transition));
    }, []);

    const editState = useCallback((updated: State) => {
        setStates((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    }, []);

    const editTransition = useCallback((updated: Transition) => {
        setTransitions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }, []);

    // Converte coordenadas de clique (pixel) para coordenadas do mundo (com câmera)
    const screenToWorld = useCallback((p: Point): Point => {
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
    }, [canvasSize]);
    
    const drawTempTransition = useCallback((ctx: CanvasRenderingContext2D, color: string) => {
        if(!selected.current) return;

        const start = {
            x: selected.current?.x,
            y: selected.current?.y
        };

        const end = screenToWorld(currPosRef.current);

        ctx.save();
        
        ctx.strokeStyle = color;

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        drawArrowHead(ctx, start, end);

        ctx.restore();
    }, [drawArrowHead, screenToWorld]);

    
    const draw = useCallback((ctx: CanvasRenderingContext2D, highlightState?: State) => {
        const { width, height } = canvasSize;

        // Limpa o canvas
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

        // Fundo
        drawBackground(ctx);

        // Desenhar transição temporária (durante link)
        drawTempTransition(ctx, "#FF0000");

        // Auto-transições (loops) ficam atrás
        for (const state of states) {
            drawAutoTransition(ctx, state, foregroundColor);
        }

        // Transições normais
        const seen = new Set<string>();
        for (const t of transitions) {
            if (t.origin === t.destination) continue;
            const key = `${t.origin.id}-${t.destination.id}`;
            if (!seen.has(key)) {
                seen.add(key);
                drawTransition(ctx, t.origin, t.destination, foregroundColor);
            }
        }

        // Desenhar estados (destacando o highlightState)
        for (const state of states) {
            const bg = state === highlightState ? "#ffd700" : backgroundColor;
            drawState(ctx, state, bg, foregroundColor);
        }

        ctx.restore();
    }, [canvasSize, states, transitions, drawBackground, drawTempTransition, drawAutoTransition, drawTransition, drawState]);


    const clickedOnState = useCallback((x: number, y: number): State | undefined => {
        // convert screen coords to world coords
        const pos = screenToWorld({x, y});

        // check if click is inside any state
        const clickedState = states.find(
            (s) => Math.hypot(s.x - pos.x, s.y - pos.y) <= radius
        );

        return clickedState;
    }, [states, screenToWorld]);

    const clickedOnTransition = useCallback((x: number, y: number): Transition | undefined => {
        // convert screen coords to world coords
        const pos = screenToWorld({x, y});

        const side = fontSize;
        const halfSide = side / 2;

        for (const t of transitions) {
            if (
                pos.x >= t.x - halfSide &&
                    pos.x <= t.x + halfSide &&
                    pos.y >= t.y - halfSide &&
                    pos.y <= t.y + halfSide
            ) {
                return t;
            }
        }

        return undefined;
    }, [transitions, screenToWorld]);

    const deleteStateAtClick = useCallback((
        e: MouseEvent,
    ) => {
        const canvas = e.currentTarget as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const clickedState = clickedOnState(e.offsetX, e.offsetY);

        if (clickedState) {
            removeState(clickedState); // remove from states and associated transitions
            draw(ctx); // redraw canvas
        }
    }, [clickedOnState, removeState, draw]);

    const deleteTransitionAtClick = useCallback((
        e: MouseEvent,
    ) => {
        const canvas = e.currentTarget as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const clickedTransition = clickedOnTransition(e.offsetX, e.offsetY);

        if (clickedTransition) {
            removeTransition(clickedTransition); // remove from states and associated transitions
            draw(ctx); // redraw canvas
        }
    }, [clickedOnTransition, removeTransition, draw]);

    const selectStateAtClick = useCallback((
        e: MouseEvent,
    ) => {
        const canvas = e.currentTarget as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const clickedState = clickedOnState(e.offsetX, e.offsetY);

        if (clickedState) {
            selected.current = clickedState;
        }
    }, [clickedOnState]);

    const linkStateAtUp = useCallback((e: MouseEvent) => {
        if (!selected.current) return;

        const canvas = e.currentTarget as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // detect if user released over a state
        const clickedState = clickedOnState(e.offsetX, e.offsetY);

        if (clickedState) {
            const value = prompt("Insira o valor da transição:");

            if (value === null) {
                return;
            }

            if (value.length > 1) {
                alert("Cadeia da transicao deve ser 1");
                return;
            }

            if (value.length === 0) {
                addTransition(selected.current, clickedState, 'λ');
            } else {
                addTransition(selected.current, clickedState, value);
            }

            draw(ctx);
        }
    }, [clickedOnState, addTransition, draw]);

    const onMouseDown = useCallback((e: MouseEvent) => {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
        if (!canvas) return;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        if (!ctx) return;

        lastPosRef.current = { x: e.offsetX, y: e.offsetY };

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
            deleteTransitionAtClick(e);
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
                    "Escolha o tipo do estado:\n1 = Inicial\n2 = Final\n3 = Ambos\n0 = Normal",
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
    }, [mode, screenToWorld, addState, draw, selectStateAtClick, deleteStateAtClick, deleteTransitionAtClick, clickedOnState]);

    const onMouseMove = useCallback((e: MouseEvent) => {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
        if (!canvas) return;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        if (!ctx) return;

        const prevPos = lastPosRef.current;
        const currPos = { x: e.offsetX, y: e.offsetY };

        if (mode === Mode.LINK && e.buttons === MouseButtons.LEFT && selected.current) {
            currPosRef.current = currPos;
            draw(ctx);
        }

        if (mode === Mode.SELECT && e.buttons === MouseButtons.LEFT && moveStates.current) {
            // compute screen delta
            const dxScreen = currPos.x - prevPos.x;
            const dyScreen = currPos.y - prevPos.y;

            // convert to world-space
            const dxWorld = dxScreen / cameraRef.current.z;
            const dyWorld = -dyScreen / cameraRef.current.z; // invert Y if needed

            for (const state of moveStates.current) {
                state.x += dxWorld;
                state.y += dyWorld;
            }

            draw(ctx);
        }

        if (e.buttons === MouseButtons.MIDDLE || (mode === Mode.DRAG && e.buttons === MouseButtons.LEFT)) {
            // screen–space delta
            const dx = currPos.x - prevPos.x;
            const dy = currPos.y - prevPos.y;

            // adjust camera position in world space
            cameraRef.current.x -= dx / cameraRef.current.z;
            cameraRef.current.y += dy / cameraRef.current.z; // note Y is inverted (canvas has flipped Y)

            draw(ctx);
        }

        // update last position
        lastPosRef.current = currPos;
    }, [mode, draw]);

    const onMouseUp = useCallback((e: MouseEvent) => {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
        if (!canvas) return;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        if (!ctx) return;

        lastPosRef.current = { x: e.offsetX, y: e.offsetY };
        
        if (mode === Mode.LINK) {
            linkStateAtUp(e);
        }

        selected.current = null;
        moveStates.current = undefined;
        currPosRef.current = { x: 0, y: 0};

        draw(ctx);
    }, [mode, linkStateAtUp, draw]);

    const onWheel = useCallback((e: WheelEvent) => {
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
        const mouseWorldX = cameraRef.current.x + (e.clientX - rect.left - canvasSize.width / 2) / cameraRef.current.z;
        const mouseWorldY = cameraRef.current.y - (e.clientY - rect.top - canvasSize.height / 2) / cameraRef.current.z;

        // apply zoom towards mouse position
        cameraRef.current.z *= zoomFactor;
        cameraRef.current.x = mouseWorldX - (e.clientX - rect.left - canvasSize.width / 2) / cameraRef.current.z;
        cameraRef.current.y = mouseWorldY + (e.clientY - rect.top - canvasSize.height / 2) / cameraRef.current.z;

        draw(ctx); // redraw after zoom
    }, [canvasSize, draw]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [states, transitions, mode]);

    return {
        states,
        transitions,
        mode,
        setMode,
        addState,
        addTransition,
        removeState,
        removeTransition,
        editState,
        editTransition,
        validateWord,
        draw,
    };
}
