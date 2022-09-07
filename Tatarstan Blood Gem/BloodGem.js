"use strict";

class WidgetBase {
    constructor(color, border_width) {
        this.selectorWidget = null;
        this.dragSelect = false;
        this.color = color;
        this.border_width = border_width;
        this.mouseSensor = new MouseSensor();
        this.keySensor = new KeyboardSensor();
    }

    draw(traverseObj) {
        traverseObj["traverse" + this.constructor.name](this);
        if (this.selectorWidget) {
            this.selectorWidget.draw(traverseObj);
        }

    }

    select() {
        let [x1, y1, x2, y2] = this.toPoints();
        this.selectorWidget = new SelectorWidget(x1, y1, x2 - x1, y2 - y1);
    }

    unselect() {
        this.selectorWidget = null;
    }

    move(deltaX, deltaY) {
        throw new Error("Widgetbase move cannot be accessed");
    }

    addSize(deltaX, deltaY) {
        throw new Error("Widgetbase addSize cannot be accessed");
    }

    toPoints() {
        throw new Error("Widgetbase toPoints cannot be accessed");
    }

    toRect() {
        throw new Error("Widgetbase toRect cannot be accessed");
    }

    sensor(handlerName, x, y, evt) {
        if (this.selectorWidget) {
            this.selectorWidget.sensor(handlerName, x, y, evt);
        }
        if (this.isInside(x, y)) {
            if (this.mouseSensor["on" + handlerName]) {
                this.mouseSensor["on" + handlerName](x, y, evt, this);
            }
        }
        else {
            if (this.mouseSensor["on" + handlerName + "Out"]) {
                this.mouseSensor["on" + handlerName + "Out"](x, y, evt, this);
            }
        }
    }

    keySensorEvent(handlerName, evt) {
        if (this.keySensor["on" + handlerName]) {
            this.keySensor["on" + handlerName](evt, this);
        }
    }
}

class SolidShapeBase extends WidgetBase {
    constructor(x, y, color, border_width) {
        super(color, border_width);
        this.x = x;
        this.y = y;
    }

    move(deltaX, deltaY) {
        this.x = this.x + deltaX;
        this.y = this.y + deltaY;
    }
}

class Rect extends SolidShapeBase {
    constructor(x, y, width, height, color = "black", border_width = 0) {
        super(x, y, color, border_width);
        this.width = width;
        this.height = height;
    }

    toPoints() {
        return [this.x, this.y, this.x + this.width, this.y + this.height];
    }

    toRect() {
        return [this.x, this.y, this.width, this.height];
    }

    addSize(deltaX, deltaY) {
        this.width = this.width + deltaX;
        this.height = this.height + deltaY;
    }

    isInside(x, y) {
        return this.x <= x && x <= (this.width + this.x) && this.y <= y && y <= (this.height + this.y);
    }
}

class Circle extends SolidShapeBase {
    constructor(x, y, radius, color = "black", border_width = 0) {
        super(x, y, color, border_width);
        this.radius = radius;
    }

    toPoints() {
        return [this.x - this.radius, this.y - this.radius, this.x + this.radius, this.y + this.radius];
    }

    toRect() {
        return [this.x - this.radius, this.y - this.radius, 2 * this.radius, 2 * this.radius];
    }

    addSize(deltaX, deltaY) {
        let deltaValue = Math.min(deltaX, deltaY) / 2;
        this.move(deltaValue, deltaValue);
        this.radius = this.radius + deltaValue;
    }

    isInside(x, y) {
        return (x - this.x) ** 2 + (y - this.y) ** 2 <= this.radius ** 2;
    }
}

class Ellipse extends Rect {
    toPoints() {
        return [this.x - this.width, this.y - this.height, this.x + this.width, this.y + this.height];
    }

    toRect() {
        return [this.x - this.width, this.y - this.height, 2 * this.width, 2 * this.height];
    }

    isInside(x, y) {
        return (x - this.x) ** 2 / this.width ** 2 + (y - this.y) ** 2 / this.height ** 2 <= 1;
    }

    addSize(deltaX, deltaY) {
        super.move(deltaX / 2, deltaY / 2);
        super.addSize(deltaX / 2, deltaY / 2);
    }
}

class Img extends Rect {
    constructor(x, y, width, height, imageSource) {
        super(x, y, width, height, "transparent");
        this.imageSource = imageSource;
        this.image = null;
    }
}

class Txt extends Rect {
    constructor(x, y, width, height, textString, color = "black") {
        super(x, y, width, height, color);
        this.textString = textString;
    }
}

class EditTxt extends Txt {
    constructor(x, y, width, height, textString, color = "black") {
        super(x, y, width, height, textString, color);
        this.insertingLine = null;
        this.mouseSensor = new EditTxtMouseSensor();
        this.keySensor = new ImageKeySensor();
    }
}

class Line extends WidgetBase {
    constructor(x1, y1, x2, y2, color = "black", border_width = 1) {
        super(color, border_width);
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    static cross(x1, y1, x2, y2, x, y) {
        return (x - x1) * Math.abs(y2 - y1) - (y - y1) * Math.abs(x2 - x1);
    }

    toPoints() {
        return [this.x1, this.y1, this.x2, this.y2];
    }

    toRect() {
        return [this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1];
    }

    move(deltaX, deltaY) {
        this.x1 = this.x1 + deltaX;
        this.y1 = this.y1 + deltaY;
        this.x2 = this.x2 + deltaX;
        this.y2 = this.y2 + deltaY;
    }

    addSize(deltaX, deltaY) {
        this.x2 = this.x2 + deltaX;
        this.y2 = this.y2 + deltaY;
    }

    /*
    isInside(x, y) {
        let margin = this.border_width + 5;
        let y1Top = this.y1 - margin;
        let y2Top = this.y2 - margin;
        let y1Bottom = this.y1 + margin;
        let y2Bottom = this.y2 + margin;
        let top = Line.cross(this.x1, y1Top, this.x2, y2Top, x, y);
        let bottom = Line.cross(this.x1, y1Bottom, this.x2, y2Bottom, x, y);
        return top <= 0 && bottom >= 0;
    }
    */

    isInside(x, y) {
        let result = Line.cross(this.x1, this.y1, this.x2, this.y2, x, y);
        //console.log(result);
        return -600 < result && result < 600;
    }
}

class LayoutBase extends Rect {
    constructor(x, y, width, height, color, lowerWidgets) {
        super(x, y, width, height, color);
        this.lowerWidgets = [];
        this.pushMultiple(lowerWidgets);
    }
	
	unselectAll(){
		for (let lowerWidget of this.lowerWidgets){
			lowerWidget.unselect();
		}
	}

    push(widget) {
        widget.move(this.x, this.y);
        this.lowerWidgets.push(widget);
    }

    pushMultiple(widgets) {
        for (let widget of widgets) {
            this.push(widget);
        }
    }

    remove(index) {
        this.lowerWidgets.splice(index, 1);
    }

    removeWidget(widget) {
        this.remove(this.lowerWidgets.indexOf(widget));
    }

    set(index, widget) {
        widget.move(this.x, this.y);
        this.lowerWidgets[index] = widget;
    }

    get(index) {
		if (index < 0){
			return this.lowerWidgets[this.lowerWidgets.length + index];
		}
        return this.lowerWidgets[index];
    }

    move(deltaX, deltaY) {
        super.move(deltaX, deltaY);
        for (let lowerWidget of this.lowerWidgets) {
            lowerWidget.move(deltaX, deltaY);
        }
    }
}

class CoordinatorLayoutBase extends LayoutBase {
    draw(traverseObj) {
        super.draw(traverseObj);
        for (let lowerWidget of this.lowerWidgets) {
            lowerWidget.draw(traverseObj);
        }
    }
}

class CoordinatorLayout extends CoordinatorLayoutBase {
    sensor(handlerName, x, y, evt) {
        super.sensor(handlerName, x, y, evt);
        for (let lowerWidget of this.lowerWidgets) {
            lowerWidget.sensor(handlerName, x, y, evt);
        }
    }

    keySensorEvent(handlerName, evt) {
        super.keySensorEvent(handlerName, evt);
        for (let lowerWidget of this.lowerWidgets) {
            lowerWidget.keySensorEvent(handlerName, evt);
        }
    }
}

class Group extends CoordinatorLayoutBase {
    constructor(x, y, width, height, lowerWidgets) {
        super(x, y, width, height, "transparent", lowerWidgets);
    }
}

class SelectorWidget extends CoordinatorLayout {
    constructor(x, y, width, height) {
        super(x, y, width, height, "#3D81E9", [
            new Circle(0, 0, 5, "#3D81E9"),
            new Circle(width, 0, 5, "#3D81E9"),
            new Circle(0, height, 5, "#3D81E9"),
            new Circle(width, height, 5, "#3D81E9")
        ]);
        this.border_width = 1.25;
    }

    hideDimentionBalls() {
        this.get(0).color = "transparent";
        this.get(1).color = "transparent";
        this.get(2).color = "transparent";
        this.get(3).color = "transparent";
    }

    showDimentionBalls() {
        this.set(0, new Circle(0, 0, 5, "#3D81E9"));
        this.set(1, new Circle(this.width, 0, 5, "#3D81E9"));
        this.set(2, new Circle(0, this.height, 5, "#3D81E9"));
        this.set(3, new Circle(this.width, this.height, 5, "#3D81E9"));
    }
}

class ConsoleDraw {
    traverseRect(widget) {
        console.log("Rect", widget.x, widget.y, widget.width, widget.height, widget.color, widget.border_width);
    }

    traverseCircle(widget) {
        console.log("Circle", widget.x, widget.y, widget.radius, widget.color, widget.border_width);
    }

    traverseEllipse(widget) {
        console.log("Ellipse", widget.x, widget.y, widget.width, widget.height, widget.color, widget.border_width);
    }

    traverseImg(widget) {
        console.log("Img", widget.x, widget.y, widget.width, widget.height, widget.imageSource);
    }

    traverseTxt(widget) {
        console.log("Txt", widget.x, widget.y, widget.width, widget.height, widget.textString, widget.color)
    }

    traverseEditTxt(widget) {
        console.log("EditTxt(Txt)", widget.x, widget.y, widget.width, widget.height, widget.textString, widget.color)
    }

    traverseLine(widget) {
        console.log("Line", widget.x1, widget.y1, widget.x2, widget.y2, widget.color, widget.border_width);
    }

    traverseGroup(widget) {
        console.log("Group(Rect)", widget.x, widget.y, widget.width, widget.height);
    }

    traverseCoordinatorLayout(widget) {
        console.log("CoordinatorLayout(Rect)", widget.x, widget.y, widget.width, widget.height, widget.color, widget.border_width);
    }
}

class CanvasDraw {
    constructor(canvas, widget) {
        this.widget = widget;
        this.canvas = canvas;
        this.refresh = true;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.textBaseline = "top";
        this.start();
    }

    start() {
        this.widget.draw(this);
        setInterval(function (traverseObj) {
            if (traverseObj.refresh) {
                //console.log("canvas refreshing");
                traverseObj.clearScreen();
                traverseObj.widget.draw(traverseObj);
                traverseObj.refresh = false;
            }
        }, 1, this);
    }

    clearScreen() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    traverseRect(widget) {
        if (widget.border_width == 0) {
            this.ctx.fillStyle = widget.color;
            this.ctx.fillRect(widget.x, widget.y, widget.width, widget.height);
        }
        else {
            this.ctx.strokeStyle = widget.color;
            this.ctx.lineWidth = widget.border_width;
            this.ctx.strokeRect(widget.x, widget.y, widget.width, widget.height);
        }
    }

    traverseCircle(widget) {
        this.ctx.fillStyle = widget.color;
        this.ctx.beginPath();
        this.ctx.arc(widget.x, widget.y, widget.radius, 0, 2 * Math.PI);
        this.ctx.closePath();
        this.ctx.fill();
    }

    traverseEllipse(widget) {
        this.ctx.fillStyle = widget.color;
        this.ctx.beginPath();
        this.ctx.ellipse(widget.x, widget.y, widget.width, widget.height, 0, 0, 2 * Math.PI);
        this.ctx.closePath();
        this.ctx.fill();
    }

    traverseImg(widget) {
        if (!widget.image) {
            widget.image = document.createElement("img");
            widget.image.src = widget.imageSource;
        }
        if (widget.width == 0) {
            widget.width = widget.image.width;
        }
        if (widget.height == 0) {
            widget.height = widget.image.height;
        }
        this.ctx.drawImage(widget.image, widget.x, widget.y, widget.width, widget.height);
    }

    traverseTxt(widget) {
        this.ctx.fillStyle = widget.color;
        this.ctx.font = widget.height.toString() + "px Arial";
        this.ctx.fillText(widget.textString, widget.x, widget.y);
    }

    traverseLine(widget) {
        this.ctx.strokeStyle = widget.color;
        this.ctx.lineWidth = widget.border_width;
        this.ctx.beginPath();
        this.ctx.moveTo(widget.x1, widget.y1);
        this.ctx.lineTo(widget.x2, widget.y2);
        this.ctx.stroke();
    }

    traverseEditTxt(widget) {
        this.traverseTxt(widget);
    }

    traverseGroup(widget) { }

    traverseCoordinatorLayout(widget) {
        this.traverseRect(widget);
    }

    traverseSelectorWidget(widget) {
        this.traverseRect(widget);
    }
}

class MouseSensorSystem {
    constructor(canvas, widget) {
        this.canvas = canvas;
        this.widget = widget;
        this.dragging = false;
        //this.start();
    }

    start() {
        this.canvas.mouseSensorObject = this;
        this.canvas.addEventListener("mousedown", this.onmousedown);
        this.canvas.addEventListener("mouseup", this.onmouseup);
        this.canvas.addEventListener("mousemove", this.onmousemove);
        this.canvas.addEventListener("dblclick", this.ondblclick);
    }

    onmousedown(evt) {
        this.mouseSensorObject.widget.sensor("MouseDown", evt.offsetX, evt.offsetY, evt);
        this.mouseSensorObject.dragging = true;
    }

    onmouseup(evt) {
        this.mouseSensorObject.widget.sensor("MouseUp", evt.offsetX, evt.offsetY, evt);
        if (this.mouseSensorObject.dragging) {
            this.mouseSensorObject.widget.sensor("DragEnd", evt.offsetX, evt.offsetY, evt);
            this.mouseSensorObject.dragging = false;
        }
    }

    onmousemove(evt) {
        this.mouseSensorObject.widget.sensor("MouseMove", evt.offsetX, evt.offsetY, evt);
        if (this.mouseSensorObject.dragging) {
            this.mouseSensorObject.widget.sensor("DragStart", evt.offsetX, evt.offsetY, evt);
        }
    }

    ondblclick(evt) {
        this.mouseSensorObject.widget.sensor("DblClick", evt.offsetX, evt.offsetY, evt);
    }
}

class TouchSensorSystem {
    constructor(canvas, widget) {
        this.canvas = canvas;
        this.widget = widget;
        this.dragging = false;
        //this.start();
    }

    start() {
        this.canvas.touchSensorObject = this;
        this.canvas.addEventListener("touchstart", this.ontouchstart);
        this.canvas.addEventListener("touchend", this.ontouchend);
        this.canvas.addEventListener("touchmove", this.ontouchmove);
    }

    getPositions(evt) {
        if (evt.touches.length != 0) {
            return [evt.touches[0].clientX, evt.touches[0].clientY];
        }
        else {
            return [0, 0];
        }
    }

    ontouchstart(evt) {
        let [x, y] = this.touchSensorObject.getPositions(evt);
        this.touchSensorObject.widget.sensor("MouseDown", x, y, evt);
        this.touchSensorObject.dragging = true;
    }

    ontouchmove(evt) {
        let [x, y] = this.touchSensorObject.getPositions(evt);
        if (this.touchSensorObject.dragging) {
            this.touchSensorObject.widget.sensor("DragStart", x, y, evt);
        }
    }

    ontouchend(evt) {
        let [x, y] = this.touchSensorObject.getPositions(evt);
        console.log("ontouchend", x, y)
        if (evt.touches.length != 0) {
            this.touchSensorObject.widget.sensor("MouseUp", x, y, evt);
            if (this.touchSensorObject.dragging) {
                this.touchSensorObject.widget.sensor("DragEnd", x, y, evt);
                this.touchSensorObject.dragging = false;
            }
        }
    }


}

class KeyboardSensorSystem {
    constructor(widget) {
        this.widget = widget;
    }

    start() {
        window.keyboardSensorObject = this;
        window.addEventListener("keydown", this.onkeydown);
        window.addEventListener("keyup", this.onkeyup);
    }

    onkeydown(evt) {
        this.keyboardSensorObject.widget.keySensorEvent("KeyDown", evt);
    }

    onkeyup(evt) {
        this.keyboardSensorObject.widget.keySensorEvent("KeyUp", evt);
    }
}

class BloodGemGUI {
    constructor(widget) {
        this.widget = widget;
        this.canvas = document.getElementById("myCanvas");
        this.drawObject = new CanvasDraw(this.canvas, this.widget);
        this.keySensor = new KeyboardSensor();
        this.start();
        /*
        this.mouseSensorObject = new MouseSensorSystem(this.canvas, this.widget);
        this.touchSensorObject = new TouchSensorSystem(this.canvas, this.widget);
        this.keyboardSensorObject = new KeyboardSensorSystem();
        */
    }

    start() {
        new MouseSensorSystem(this.canvas, this.widget).start();
        new TouchSensorSystem(this.canvas, this.widget).start();
        new KeyboardSensorSystem(this.widget).start()
    }
}

class MouseSensor {
    constructor() {
        this.onMouseDown = null;
        this.onMouseDownOut = null;
        this.onMouseUp = null;
        this.onMouseUpOut = null;
        this.onMouseMove = null
        this.onMouseMoveOut = null;
        this.onClick = null;
        this.onClickOut = null;
        this.onDragStart = null;
        this.onDragStartOut = null;
        this.onDragEnd = null;
        this.onDragEndOut = null;
        this.onDblClick = null;
        this.onDblClickOut = null;
    }
}

class EditTxtMouseSensor {
    onDblClick(x, y, evt, widget) {
        widget.insertingLine = "a";
        keyboardFocusWhole = false;
    }

    onMouseDownOut(x, y, evt, widget) {
        widget.insertingLine = null;
        keyboardFocusWhole = true;
    }
}

class TestLine {
    onMouseMove(x, y, evt, widget) {
        console.log("onmousemove")
    }
}

class PrimaryMouseSensor {
    constructor() {
        this.state = new ReadyState(this);
        this.oldX = 0;
        this.oldY = 0;
    }

    change(newState) {
        this.state = newState;
    }

    onMouseDown(x, y, evt, widget) {
        this.state.mousedown(x, y, evt, widget);
    }

    onMouseDownOut(x, y, evt, widget) {
        this.state.mousedown(x, y, evt, widget);
    }

    onDragStart(x, y, evt, widget) {
        this.state.dragstart(x, y, evt, widget);
    }

    onDragStartOut(x, y, evt, widget) {
        this.state.dragstart(x, y, evt, widget);
    }

    onDragEnd(x, y, evt, widget) {
        this.state.dragend(x, y, evt, widget);
    }

    onDragEndOut(x, y, evt, widget) {
        this.state.dragend(x, y, evt, widget);
    }
}

class State {
    constructor(stateController) {
        this.stateController = stateController;
    }
}

class ReadyState extends State {
    mousedown(x, y, evt, widget) {
        let insideSelectedWidget = false;
		this.stateController.oldX = x;
        this.stateController.oldY = y;
        for (let lowerWidget of widget.lowerWidgets) {
            if (lowerWidget.selectorWidget) {
                if (lowerWidget.selectorWidget.lowerWidgets[0].isInside(x, y)) {
                    this.stateController.change(new DimentionState(this.stateController, -1, -1));
                    insideSelectedWidget = true;
					return;
                }
                else if (lowerWidget.selectorWidget.lowerWidgets[1].isInside(x, y)) {
                    this.stateController.change(new DimentionState(this.stateController, 1, -1));
                    insideSelectedWidget = true;
					return;
                }
                else if (lowerWidget.selectorWidget.lowerWidgets[2].isInside(x, y)) {
                    this.stateController.change(new DimentionState(this.stateController, -1, 1));
                    insideSelectedWidget = true;
					return;
                }
                else if (lowerWidget.selectorWidget.lowerWidgets[3].isInside(x, y)) {
                    this.stateController.change(new DimentionState(this.stateController, 1, 1));
                    insideSelectedWidget = true;
					return;
                }
            }
        }
		
        for (let i = widget.lowerWidgets.length - 1; i >= 0; i--) {
            let lowerWidget = widget.lowerWidgets[i];
            if (lowerWidget.isInside(x, y)) {
                if (!lowerWidget.selectorWidget) {
                    lowerWidget.select();
                    s.drawObject.refresh = true;
                }
                else {
                    insideSelectedWidget = true;
                }
				console.log("breaking");
                break;
            }
        }
		
        if ((!insideSelectedWidget) && (!evt.ctrlKey)) {
            for (let lowerWidget of widget.lowerWidgets) {
                if (!lowerWidget.isInside(x, y)) {
                    lowerWidget.unselect();
                }
            }
            s.drawObject.refresh = true;
        }
    }

    dragstart(x, y, evt, widget) {
        //console.log("dragStart", widget.lowerWidgets.filter(item => item.selectorWidget));
        let deltaX = x - this.stateController.oldX;
        let deltaY = y - this.stateController.oldY;
        this.stateController.oldX = x;
        this.stateController.oldY = y;
        for (let item of widget.lowerWidgets.filter(item => item.selectorWidget)) {
            item.selectorWidget.move(deltaX, deltaY);
            item.selectorWidget.hideDimentionBalls();
        }
        s.drawObject.refresh = true;
    }

    dragend(x, y, evt, widget) {
        for (let item of widget.lowerWidgets.filter(item => item.selectorWidget)) {
            //console.log("dragend", item, item.toRect(), item.selectorWidget.toRect());
            let [xNew, yNew, widthNew, heightNew] = item.selectorWidget.toRect();
            let [xOld, yOld, widthOld, heightOld] = item.toRect();
            //console.log(xNew, xOld, yNew, yOld);
            item.move(xNew - xOld, yNew - yOld);
            item.selectorWidget.showDimentionBalls();
            s.drawObject.refresh = true;
        }
    }
}

class DimentionState extends State {
    constructor(stateController, factorX, factorY) {
        super(stateController);
        this.factorX = factorX;
        this.factorY = factorY;
    }

    mousedown(x, y, evt, widget) {
        this.stateController.change(new ReadyState(this.stateController));
        this.stateController.state.mousedown(x, y, evt, widget);
    }

    dragstart(x, y, evt, widget) {
        //console.log("dragstart");
        let deltaX = x - this.stateController.oldX;
        let deltaY = y - this.stateController.oldY;
        this.stateController.oldX = x;
        this.stateController.oldY = y;
        for (let item of widget.lowerWidgets.filter(item => item.selectorWidget)) {
            if (this.factorX != 1) {
                item.selectorWidget.move(deltaX, 0);
            }
            if (this.factorY != 1) {
                item.selectorWidget.move(0, deltaY);
            }
            item.selectorWidget.addSize(this.factorX * deltaX, this.factorY * deltaY);
            item.selectorWidget.hideDimentionBalls();
        }
        s.drawObject.refresh = true;
    }

    dragend(x, y, evt, widget) {
        for (let item of widget.lowerWidgets.filter(item => item.selectorWidget)) {
            let [xNew, yNew, widthNew, heightNew] = item.selectorWidget.toRect();
			console.log("new", xNew, yNew, widthNew, heightNew)
            let [xOld, yOld, widthOld, heightOld] = item.toRect();
			
            if (widthNew < 0) {
                item.move(widthNew, 0);
                item.selectorWidget.move(widthNew, 0);
                widthNew = -widthNew;
				item.selectorWidget.addSize(2*widthNew, 0)
            }
            if (heightNew < 0) {
                item.move(0, heightNew);
                item.selectorWidget.move(0, heightNew);
                heightNew = -heightNew;
				item.selectorWidget.addSize(0, 2*heightNew)
            }
			console.log("newafter", item.selectorWidget.toRect())
            item.move(xNew - xOld, yNew - yOld);
            item.addSize(widthNew - widthOld, heightNew - heightOld);
            item.selectorWidget.showDimentionBalls();
        }
        s.drawObject.refresh = true;
        this.stateController.change(new ReadyState(this.stateController));
    }
}

class AddWidgetState extends State{
	constructor(stateController) {
        super(stateController);
		this.canAddToLowerNodes = false;
        this.newWidget = null;
		this.tool = null;
    }
	
	mousedown(x, y, evt, widget) {
        this.newWidget.move(x - widget.x, y - widget.y);
		widget.push(this.newWidget);
        this.stateController.oldX = x;
        this.stateController.oldY = y;
		this.newWidget.select();
		this.newWidget.selectorWidget.hideDimentionBalls();
        console.log("mousedown", widget, this.newWidget, this.stateController.oldX, this.stateController.oldY);
		s.drawObject.refresh = true;
    }

    dragstart(x, y, evt, widget) {
        if (!this.canAddToLowerNodes) {
            this.canAddToLowerNodes = true;
        }
		
		if (!this.newWidget.selectorWidget){
			this.newWidget.select();
		}
		
		this.newWidget.selectorWidget.addSize(x - this.stateController.oldX, y - this.stateController.oldY)
		this.stateController.oldX = x;
        this.stateController.oldY = y;
		s.drawObject.refresh = true;
        console.log("dragstart");
    }

    dragend(x, y, evt, widget) {
        console.log("dragend", this.canAddToLowerNodes);
        if (this.canAddToLowerNodes) {
			let [newX, newY, , ] = this.newWidget.toPoints();
            let width = x - newX;
            let height = y - newY;
			console.log(width, height)
            if (width < 0) {
                this.newWidget.move(width, 0);
                this.newWidget.selectorWidget.move(width, 0);
                width = -width;
				this.newWidget.selectorWidget.addSize(2*width, 0)
            }
            if (height < 0) {
                this.newWidget.move(0, height);
                this.newWidget.selectorWidget.move(0, height);
                height = -height;
				this.newWidget.selectorWidget.addSize(0, 2*height);
            }
            this.newWidget.addSize(width, height);
			this.newWidget.selectorWidget.showDimentionBalls();
        }
		else{
			widget.remove(-1);
		}
        this.tool.deactivateState();
    }
}

class AddRectState extends AddWidgetState{
	constructor(stateController){
		super(stateController);
		this.newWidget = new Rect(0, 0, 0, 0, "black", 0);
		this.tool = a;
	}
}

class AddCircleState extends AddWidgetState{
	constructor(stateController){
		super(stateController);
		this.newWidget = new Circle(0, 0, 0, "black", 0);
		this.tool = b;
	}
}

class AddLineState extends AddWidgetState{
	constructor(stateController){
		super(stateController);
		this.newWidget = new Line(0, 0, 0, 0, "black", 1);
		this.tool = c;
	}
}

class KeyboardSensor {
    constructor() {
        this.onKeyDown = null;
        this.onKeyUp = null;
    }
}

class ImageKeySensor {
    constructor() {
        this.offset = 0;
    }

    onKeyDown(evt, widget) {
        if (widget.insertingLine) {
            //widget.textString = widget.textString
            //console.log("down", evt, widget);
            console.log(evt.key)
            if (evt.key == "Backspace") {
                widget.textString = widget.textString.slice(0, -1);
            }
            else if (evt.key == "Tab") {
                widget.textString = widget.textString + "    ";
            }
            else if (evt.key == "Enter") {
                widget.insertingLine = null;
            }
            else if (evt.key != "Shift") {
                widget.textString = widget.textString + evt.key
            }
            s.drawObject.refresh = true;
        }
    }

    /*
    onKeyUp(evt, widget){
        if (widget.insertingLine){
            console.log("up", evt, widget);
        }
    }*/
}

class PrimaryKeyboardSensor {
    constructor() { }

    onKeyDown(evt, widget) {
        if (keyboardFocusWhole) {
            if (evt.key == "Delete") {
                for (let item of widget.lowerWidgets.filter(item => item.selectorWidget)) {
                    widget.removeWidget(item);
                }
            }
            s.drawObject.refresh = true;
        }
    }
}

let w = new CoordinatorLayout(20, 30, 300, 250, "silver", [
    new EditTxt(100, 200, 210, 9, "Welcome to Tatarstan!", "red"),
    new Rect(50, 100, 25, 50, "navy"),
    new Circle(95, 100, 15, "olive"),
    new Ellipse(335, 97, 32, 19, "coral"),
    new Rect(215, 100, 25, 50, "teal"),
    new Group(300, 140, 100, 100, [
        new Rect(10, 10, 90, 70, "aquamarine"),
        new Ellipse(40, 30, 30, 20)
    ]),
    new Line(50, 350, 250, 350, "yellow"),
    new Img(0, 0, 20, 20, "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png"),

]);

/*
let d = new CanvasDraw(w);
d.keySensor = new ImageKeySensor();
*/

let s = new BloodGemGUI(w);
//s.keySensor = new ImageKeySensor();

/*
d.canvas.addEventListener("contextmenu", function(evt){
    evt.preventDefault();
})
*/

let keyboardFocusWhole = true;


w.mouseSensor = new PrimaryMouseSensor();
w.keySensor = new PrimaryKeyboardSensor();
//w.get(6).mouseSensor = new TestLine();
console.log(w);

class AddWidget {
    constructor(HTMLId, widget, mouseSensorState) {
        this.HTMLElement = document.getElementById(HTMLId);
        this.widget = widget;
        this.mouseSensorState = mouseSensorState;
    }

    activateState() {
        this.HTMLElement.className = "active";
        this.widget.mouseSensor.change(new this.mouseSensorState(this.widget.mouseSensor));
        this.widget.unselectAll();
        s.drawObject.refresh = true;
        console.log(this.HTMLElement.className);
    }

    deactivateState() {
        this.HTMLElement.className = "";
        this.widget.mouseSensor.change(new ReadyState(this.widget.mouseSensor));
        s.drawObject.refresh = true;
    }

    isActiveState() {
        return this.widget.mouseSensor.state.constructor.name == this.mouseSensorState.prototype.constructor.name;
    }

    start() {
        this.HTMLElement.AddWidgetObj = this;
        this.HTMLElement.addEventListener("click", function () {
            console.log("clicked", w.mouseSensor.state, this);
            if (this.AddWidgetObj.isActiveState()) {
                this.AddWidgetObj.deactivateState();
            }
            else {
                this.AddWidgetObj.activateState();
            }
        });
    }
}

let a = new AddWidget("drawRect", w, AddRectState);
a.start();

let b = new AddWidget("drawCircle", w, AddCircleState);
b.start();

let c = new AddWidget("drawLine", w, AddLineState);
c.start();

class WidgetProperty{
	constructor(HTMLId, widget){
		this.HTMLElement = document.getElementById(HTMLId);
		this.widget = widget;
		this.handler = null;
	}
	
	start(){
		this.HTMLElement.WidgetPropertyObj = this;
		this.HTMLElement.addEventListener("change", function(){
			if (this.WidgetPropertyObj.handler){
				this.WidgetPropertyObj.handler();
			}
			else{
				console.log(this.WidgetPropertyObj.getValue());
			}
		});
	}
	
	setValue(value){
		this.HTMLElement.value = value.toString();
	}
	
	getValue(){
		let value = this.HTMLElement.value;
		if (value){
			return parseFloat(value);
		};
		return 0;
	}
}

let a1 = new WidgetProperty("widgetX", w.get(1));
a1.start();
