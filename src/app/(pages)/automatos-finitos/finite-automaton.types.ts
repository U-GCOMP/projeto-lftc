export interface FiniteAutomatonProps {
    states: State[];
    transitions: Transition[];
    camera: Camera;
    mode: Mode;
    setMode: (mode: Mode) => void;
    addState: (name: string, x: number, y: number) => void;
    addTransition: (origin: State, destination: State, value: string) => void;
    removeState: (state: State) => void;
    removeTransition: (transition: Transition) => void;
    editState: (updated: State) => void;
    editTransition: (updated: Transition) => void;
}

export interface ToolbarProps {
    setMode: (mode: Mode) => void;
}

export class Camera {
    x : number;
    y : number;
    z : number;

    constructor(x : number, y : number, z : number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    moveLeft(offset : number) { this.x += offset; }
    moveRight(offset : number) { this.x -= offset; }
    moveUp(offset : number) { this.y -= offset; }
    moveDown(offset : number) { this.y += offset; }

    zoomIn(factor : number) { this.z *= factor; }
    zoomOut(factor : number) { this.z /= factor; }
}

export interface CanvasSize {
    width : number;
    height : number;
}

export interface State {
    id : number;
    name : string;
    x : number;
    y : number;
}

export interface Transition {
    id : number;
    origin : State;
    destination : State;
    value : string;
}

export enum Mode {
    SELECT = 'select',
    DRAG = 'drag',
    INSERT = 'insert',
    DELETE = 'delete',
    LINK = 'link',
}
