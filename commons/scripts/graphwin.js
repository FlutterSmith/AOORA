import { Canvas } from "./canvas.js";

export class GraphWin {
    constructor(layout) {
        this.canvas = new Canvas();
        this.layout = layout;
        this.isDragging = false;
        this.start();
    }

    start() {
        window.setInterval(this.loop, 10, this.layout, this.canvas);
        this.canvas.getCanvas().addEventListener("mousedown", this.mousedown.bind(this));
        this.canvas.getCanvas().addEventListener("mousemove", this.mousemove.bind(this));
        this.canvas.getCanvas().addEventListener("mouseup", this.mouseup.bind(this));
        this.canvas.getCanvas().addEventListener("touchstart", this.touchstart.bind(this));
        this.canvas.getCanvas().addEventListener("touchmove", this.touchmove.bind(this));
        this.canvas.getCanvas().addEventListener("touchend", this.touchend.bind(this));
    }

    setCursor(cursorType = "default"){
        this.canvas.setCursor(cursorType);
    }

    setDirty() {
        this.canvas.dirty = true;
    }

    loop(layout, canvas) {
        if (canvas.dirty) {
            console.log("<LOG>: DISPLAY REFRESH");
            canvas.clear();
            layout.draw(canvas.getContext());
            canvas.dirty = false;
        }
    }

    mousedown(event) {
        this.layout.fire("mousedown", event.offsetX, event.offsetY, event);
        if (!this.isDragging) {
            this.layout.fire("dragstart", event.offsetX, event.offsetY, event);
            this.isDragging = true;
        }
    }

    mousemove(event) {
        if (this.isDragging) {
            this.layout.fire("drag", event.offsetX, event.offsetY, event);
        }
        else {
            this.layout.fire("mousemove", event.offsetX, event.offsetY, event);
        }
    }

    mouseup(event) {
        if (this.isDragging) {
            this.layout.fire("dragend", event.offsetX, event.offsetY, event);
            this.isDragging = false;
        }
        this.layout.fire("mouseup", event.offsetX, event.offsetY, event);
    }

    touchstart(event) {
        event.preventDefault();
    }

    touchmove(event) {
        event.preventDefault();
    }

    touchend(event) {
        event.preventDefault();
    }
}