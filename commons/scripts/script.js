"use strict";
import { GraphWin } from "./graphwin.js";
import { Rect, Circle, Line, Ellipse, Text, Picture, CoordinatorLayout, ActiveSelectorGroup } from "./shapes.js";

class GraphicsEditor {
    constructor() {
        this.layout = __TEMP_GENERATE__();
        this.win = new GraphWin(this.layout);
        this.selectorGroup = new ActiveSelectorGroup(this.win);
        this.selectorGroup.graphics = this;
    }

    bindShapes() {
        this.layout.graphics = this;
        this.layout.bind("mousedownnone", this.shapemousedownout);
        for (let shape of this.layout.shapes) {
            shape.graphics = this;
            shape.bind("mousedown", this.shapemousedown);
            //shape.bind("mousedownout", this.shapemousedownout);
        }
    }

    shapemousedown(x, y, event) {
        if (!event.ctrlKey) {
            this.graphics.selectorGroup.clearSelect();
            if (this.graphics.layout.hasShape(this.graphics.selectorGroup)) {
                this.graphics.layout.removeShape(this.graphics.selectorGroup);
            }
            this.graphics.win.setDirty();
        }
        this.graphics.selectorGroup.selectShape(this);
        this.graphics.win.setDirty();
        if (!this.graphics.layout.hasShape(this.graphics.selectorGroup)) {
            this.graphics.layout.addShape(this.graphics.selectorGroup);
        }

    }

    shapemousedownout(x, y, event) {
        if (event.ctrlkey) {
            return;
        }
        this.graphics.selectorGroup.clearSelect();
        if (this.graphics.layout.hasShape(this.graphics.selectorGroup)) {
            this.graphics.layout.removeShape(this.graphics.selectorGroup);
        }
        this.graphics.win.setDirty();
    }

    run() {
        this.bindShapes();
    }
}

function __TEMP_GENERATE__() {
    let layout = new CoordinatorLayout(50, 60, 500, 500, "grey", [
        new CoordinatorLayout(0, 0, 300, 300, "cyan", [
            new Rect(100, 100, 50, 50, "#f00"),
            new Rect(130, 120, 50, 60, "lavender"),
            new Circle(200, 200, 30, "#0f0"),
        ]),
        new Rect(300, 300, 80, 40, "#00f"),
        new Line(50, 100, 80, 200, "blue"),
        new Text(10, 20, 30, 10, "Hello", "yellow", "Arial"),
        new Picture(100, 300, 150, 100, "https://th.bing.com/th/id/OIP.4XB8NF1awQyApnQDDmBmQwHaEo?pid=ImgDet&rs=1"),
        new Ellipse(500, 0, 75, 30, "green"),
        new Rect(500, 200, 30, 50, "purple")
    ]);

    layout.setCaptureSetting("top");
    //layout.get(0).setCaptureSetting("top");


    // Rotate the layout and its child shapes
    layout.rotate(Math.PI / 8);
    layout.get(0).rotate(Math.PI / 5);
    layout.get(1).rotate(Math.PI / 5);
    layout.get(3).rotate(Math.PI / 4);
    layout.get(4).rotate(Math.PI / 3);

    layout.get(5).rotate(Math.PI / 4);

    layout.get(0).get(0).rotate(Math.PI / 3);

    layout.setScale(1.2, 1.2);

    return layout;
}


window.onload = function() {
    console.log("onload")

    new GraphicsEditor().run();
}