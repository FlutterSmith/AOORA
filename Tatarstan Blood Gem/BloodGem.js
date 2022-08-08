class WidgetBase {
    constructor(color, border_width) {
        this.selectorWidget = null;
        this.dragSelect = false;
        this.color = color;
        this.border_width = border_width;
        this.mouseSensor = new MouseSensor();
    }

    draw(traverseObj) {
        traverseObj["traverse" + this.constructor.name](this);
        if (this.selectorWidget) {
            this.selectorWidget.draw(traverseObj);
        }
    }

    move(deltaX, deltaY) {
        throw new Error("Widgetbase move cannot be accessed");
    }

    toRect() {
        throw new Error("Widgetbase toRect cannot be accessed");
    }

    sensor(handlerName, x, y, evt) {
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
}

class SolidShapeBase extends WidgetBase{
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

    toRect() {
        return [this.x, this.y, this.x + this.width, this.y + this.height];
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

    toRect() {
        return [this.x - this.radius, this.y - this.radius, this.x + this.radius, this.y + this.radius];
    }

    isInside(x, y) {
        return (x - this.x) ** 2 + (y - this.y) ** 2 <= this.radius ** 2;
    }
}

class Ellipse extends Rect {
    toRect() {
        return [this.x - this.width, this.y - this.height, this.x + this.width, this.y + this.height];
    }

    isInside(x, y) {
        return (x - this.x) ** 2 / this.width ** 2 + (y - this.y) ** 2 / this.height ** 2 <= 1;
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

    toRect() {
        return [this.x1, this.y1, this.x2, this.y2];
    }

    move(deltaX, deltaY) {
        this.x1 = this.x1 + deltaX;
        this.y1 = this.y1 + deltaY;
        this.x2 = this.x2 + deltaX;
        this.y2 = this.y2 + deltaY;
    }

    isInside(x, y) {
        let margin = this.border_width + 5;
        let y1Top = this.y1 - margin;
        let y2Top = this.y2 - margin;
        let y1Bottom = this.y1 + margin;
        let y2Bottom = this.y2 + margin;
        let top = Line.cross(this.x1, y1Top, this.x2, y2Top, x, y);
        let bottom = Line.cross(this.x1, y1Bottom, this.x2, y2Bottom, x, y);
        return top <= 0 && bottom >= 0;
        
        // return this.x1 <= x && x <= this.x2 && this.y1 <= y && y <= this.y2;
    }
}

class LayoutBase extends Rect {
    constructor(x, y, width, height, color, lowerWidgets) {
        super(x, y, width, height, color);
        this.lowerWidgets = [];
        this.pushMultiple(lowerWidgets);
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
    
    remove(index){
        this.lowerWidgets.splice(index, 1);
    }
    
    removeWidget(widget){
        this.remove(this.lowerWidgets.indexOf(widget));
    }

    get(index) {
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
        for (let lowerWidget of this.lowerWidgets) {
            lowerWidget.sensor(handlerName, x, y, evt);
        }
    }
}

class Group extends CoordinatorLayoutBase {
    constructor(x, y, width, height, lowerWidgets) {
        super(x, y, width, height, "transparent", lowerWidgets);
    }
}

class SelectorWidget extends CoordinatorLayout {
    constructor(x, y, width, height){
        super(x, y, width, height, "#3D81E9", []);
        this.border_width = 1;
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
    constructor(widget) {
        this.widget = widget;
        this.refresh = true;
        this.canvas = document.getElementById("myCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.ctx.textBaseline = "top";
        this.canvas.cargo = this;
        this.start();
    }

    start() {
        this.widget.draw(this);
        this.canvas.addEventListener("mousedown", this.createMouseEventListener("MouseDown"));
        this.canvas.addEventListener("mouseup", this.createMouseEventListener("MouseUp"));
        this.canvas.addEventListener("mousemove", this.createMouseEventListener("MouseMove"));
        setInterval(function (traverseObj) {
            if (traverseObj.refresh) {
                //console.log("canvas refreshing");
                traverseObj.clearScreen();
                traverseObj.widget.draw(traverseObj);
                traverseObj.refresh = false;
            }
        }, 1, this);
    }

    createMouseEventListener(type) {
        return function (evt) {
            this.cargo.widget.sensor(type, evt.offsetX, evt.offsetY, evt)
        }
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

    traverseGroup(widget) { }

    traverseCoordinatorLayout(widget) {
        this.traverseRect(widget);
    }
    
    traverseSelectorWidget(widget) {
        this.traverseRect(widget);
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
    }
}

class ImageWidgetMouseSensor{
    onMouseDown(x, y, evt, widget){
        if (!widget.selectorWidget) {
            let [x1, y1, x2, y2] = widget.toRect();
            widget.selectorWidget = new SelectorWidget(x1, y1, x2 - x1, y2 - y1);
            d.refresh = true;
        }
        if (!widget.dragSelect) {
            widget.dragSelect = true;
            oldX = x;
            oldY = y;
        }
    }
    
    onMouseDownOut(x, y, evt, widget){
        if (widget.selectorWidget) {
            widget.selectorWidget = null;
            widget.dragSelect = false;
            d.refresh = true;
        }
    }
    
    onMouseUp(x, y, evt, widget){
        this.mouseUp(widget);
    }
    
    onMouseUpOut(x, y, evt, widget){
        this.mouseUp(widget);
    }
    
    mouseUp(widget){
        if (widget.dragSelect) {
            widget.dragSelect = false;
            let [x1New, y1New, , ] = widget.selectorWidget.toRect();
            let [x1Old, y1Old, , ] = widget.toRect();
            widget.move(x1New - x1Old, y1New - y1Old);
            d.refresh = true;
        }
    }
    
    onMouseMove(x, y, evt, widget){
        this.mouseMove(x, y, evt, widget);
    }
    
    onMouseMoveOut(x, y, evt, widget){
        this.mouseMove(x, y, evt, widget);
    }
    
    mouseMove(x, y, evt, widget){
        if (widget.dragSelect) {
            let deltaX = x - oldX;
            let deltaY = y - oldY;
            widget.selectorWidget.move(deltaX, deltaY);
            oldX = x;
            oldY = y;
            d.refresh = true;
        }
    }
}

var oldX = 0;
var oldY = 0;

let w = new CoordinatorLayout(20, 30, 300, 250, "purple", [
    new Txt(100, 200, 210, 9, "Welcome to Tatarstan!", "red"),
    new Rect(50, 100, 25, 50, "green"),
]);

let d = new CanvasDraw(w);

w.get(0).mouseSensor = new ImageWidgetMouseSensor();
w.get(1).mouseSensor = new ImageWidgetMouseSensor();
