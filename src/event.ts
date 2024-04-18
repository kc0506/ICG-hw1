import { Object3D } from "./object3d";
import { getObjectIdAt } from "./objectID";

export function setupEventListeners(canvas: HTMLCanvasElement) {
    window.addEventListener("mousemove", (e) => {
        const { left, top } = document.querySelector("canvas")!.getBoundingClientRect();
        mouseX = e.clientX - left;
        mouseY = canvas.height - (e.clientY - top);
    });

    window.addEventListener("mousedown", (e) => {
        const { left, top } = document.querySelector("canvas")!.getBoundingClientRect();
        clickedX = e.clientX - left;
        clickedY = canvas.height - (e.clientY - top);
        clicked = true;
    });
}

let mouseX = 0,
    mouseY = 0;
let clickedX = 0,
    clickedY = 0;
let clicked = false;

// type EventHandler = "onhover" | "onmouseenter" | "onmouseleave" | "onmousedown" | "onmousemove" | "onmouseup";
const EVENTS = ["onmouseenter", "onmouseleave", "onmousedown", "onmousemove", "onmouseup", "ontick"] as const;
type Event = (typeof EVENTS)[number];

const eventTargets: Record<Event, Set<number>> = Object.fromEntries(EVENTS.map((e) => [e, new Set()])) as any;

let prevHoverObjectId: number | null = null;

export function getHoverID(){
    return prevHoverObjectId    ;
}

export function dispatchEvents(fbo: WebGLFramebuffer, scene: Object3D) {
    for (const ids of Object.values(eventTargets)) {
        ids.clear();
    }

    const hoverObjectId = getObjectIdAt(fbo, mouseX, mouseY);
    if (hoverObjectId !== prevHoverObjectId) {
        if (hoverObjectId) {
            eventTargets.onmouseenter.add(hoverObjectId);
        }
        eventTargets.onmouseleave.add(prevHoverObjectId!);
        prevHoverObjectId = hoverObjectId;
    }
    if (hoverObjectId) eventTargets.onmousemove.add(hoverObjectId);

    if (clicked) {
        const clickedObjectId = getObjectIdAt(fbo, clickedX, clickedY);
        if (clickedObjectId) eventTargets.onmousedown.add(clickedObjectId);
        clicked = false;
    }

    dispatchEvent(scene);
}

function dispatchEvent(obj: Object3D) {
    eventTargets.ontick.add(obj._id);

    for (const eventName of EVENTS) {
        if (eventTargets[eventName].has(obj._id)) {
            obj[eventName]();

            if (eventName === "onmouseenter") obj.isHover = true;
            if (eventName === "onmouseleave") obj.isHover = false;
        }
    }
    for (const child of obj.children) {
        dispatchEvent(child);
    }
}
