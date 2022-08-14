class WidgetBase {
    constructor(color, border_width) {
        this.selectorWidget = null;
        this.dragSelect = false;
        this.multiSelect = false;
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

    select() {
        let [x1, y1, x2, y2] = this.toPoints();
        this.selectorWidget = new SelectorWidget(x1, y1, x2 - x1, y2 - y1);
    }

    unselect() {
        this.selectorWidget = null;
    }

    setTopLeft(newX, newY) {
        throw new Error("Widgetbase setTopLeft cannot be accessed");
    }

    getTopLeft() {
        throw new Error("Widgetbase getTopLeft cannot be accessed");
    }

    move(deltaX, deltaY) {
        let [oldX, oldY] = this.getTopLeft();
        this.setTopLeft(deltaX + oldX, deltaY + oldY);
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
}

class SolidShapeBase extends WidgetBase {
    constructor(x, y, color, border_width) {
        super(color, border_width);
        this.x = x;
        this.y = y;
    }

    setTopLeft(newX, newY) {
        this.x = newX;
        this.y = newY;
    }

    getTopLeft() {
        return [this.x, this.y];
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

    getTopLeft() {
        return [this.x, this.y];
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

    setTopLeft(newX, newY) {
        this.x1 = newX;
        this.y1 = newY;
        this.x2 = this.x2 + newX - this.x1;
        this.y2 = this.y2 + newY - this.y1;
    }

    getTopLeft() {
        return [this.x1, this.y1];
    }

    addSize(deltaX, deltaY) {
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
        this.dragging = false;
        this.start();
    }

    start() {
        this.widget.draw(this);
        this.canvas.addEventListener("mousedown", function (evt) {
            this.cargo.widget.sensor("MouseDown", evt.offsetX, evt.offsetY, evt);
            this.cargo.dragging = true;
        });
        this.canvas.addEventListener("mouseup", function (evt) {
            this.cargo.widget.sensor("MouseUp", evt.offsetX, evt.offsetY, evt);
            if (this.cargo.dragging) {
                this.cargo.widget.sensor("DragEnd", evt.offsetX, evt.offsetY, evt);
                this.cargo.dragging = false;
            }
        });
        this.canvas.addEventListener("mousemove", function (evt) {
            this.cargo.widget.sensor("MouseMove", evt.offsetX, evt.offsetY, evt);
            if (this.cargo.dragging) {
                this.cargo.widget.sensor("DragStart", evt.offsetX, evt.offsetY, evt);
            }
        });
        this.canvas.addEventListener("touchstart", function (evt) {
            console.log("touchstart", evt.touches[0].clientX, evt.touches[0].clientY);
            this.cargo.widget.sensor("MouseDown", evt.touches[0].clientX, evt.touches[0].clientY, evt);
            this.cargo.dragging = true;
        });
        this.canvas.addEventListener("touchcancel", function (evt) {
            if (evt.touches.length != 0) {
                this.cargo.widget.sensor("MouseUp", evt.touches[0].clientX, evt.touches[0].clientY, evt);
                if (this.cargo.dragging) {
                    this.cargo.widget.sensor("DragEnd", evt.touches[0].clientX, evt.touches[0].clientY, evt);
                    this.cargo.dragging = false;
                }
            }
        });
        this.canvas.addEventListener("touchmove", function (evt) {
            this.cargo.widget.sensor("MouseMove", evt.touches[0].clientX, evt.touches[0].clientY, evt);
            if (this.cargo.dragging) {
                this.cargo.widget.sensor("DragStart", evt.touches[0].clientX, evt.touches[0].clientY, evt);
            }
        });
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
        this.onClick = null;
        this.onClickOut = null;
        this.onDragStart = null;
        this.onDragStartOut = null;
        this.onDragEnd = null;
        this.onDragEndOut = null;
    }
}

class ImageMouseSensor {
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
        for (let lowerWidget of widget.lowerWidgets) {
            if (lowerWidget.isInside(x, y)) {
                if (!lowerWidget.selectorWidget) {
                    lowerWidget.select();
                    d.refresh = true;
                }
                else {
                    insideSelectedWidget = true;
                }
            }
            else if (lowerWidget.selectorWidget) {
                if (lowerWidget.selectorWidget.lowerWidgets[0].isInside(x, y)) {
                    this.stateController.change(new DimentionState(this.stateController, -1, -1));
                    insideSelectedWidget = true;
                }
                else if (lowerWidget.selectorWidget.lowerWidgets[1].isInside(x, y)) {
                    this.stateController.change(new DimentionState(this.stateController, 1, -1));
                    insideSelectedWidget = true;
                }
                else if (lowerWidget.selectorWidget.lowerWidgets[2].isInside(x, y)) {
                    this.stateController.change(new DimentionState(this.stateController, -1, 1));
                    insideSelectedWidget = true;
                }
                else if (lowerWidget.selectorWidget.lowerWidgets[3].isInside(x, y)) {
                    this.stateController.change(new DimentionState(this.stateController, 1, 1));
                    insideSelectedWidget = true;
                }
            }
        }

        if (!insideSelectedWidget) {
            for (let lowerWidget of widget.lowerWidgets) {
                if ((!lowerWidget.isInside(x, y)) && lowerWidget.selectorWidget) {
                    if (lowerWidget.selectorWidget.lowerWidgets[0].isInside(x, y)) {
                        console.log("detected inside dimentionball")
                    }
                    if ((!evt.ctrlKey) && (!lowerWidget.selectorWidget.lowerWidgets[0].isInside(x, y))) {
                        //console.log(lowerWidget, insideSelectedWidget)
                        lowerWidget.unselect();
                        d.refresh = true;
                    }
                }
            }
        }
        this.stateController.oldX = x;
        this.stateController.oldY = y;
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
        d.refresh = true;
    }

    dragend(x, y, evt, widget) {
        for (let item of widget.lowerWidgets.filter(item => item.selectorWidget)) {
            console.log("dragend", item, item.toRect(), item.selectorWidget.toRect());
            let [xNew, yNew, widthNew, heightNew] = item.selectorWidget.toRect();
            let [xOld, yOld, widthOld, heightOld] = item.toRect();
            //console.log(xNew, xOld, yNew, yOld);
            item.move(xNew - xOld, yNew - yOld);
            item.selectorWidget.showDimentionBalls();
            d.refresh = true;
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
        d.refresh = true;
    }

    /*
    dragend(x, y, evt, widget) {
        for (let item of widget.lowerWidgets.filter(item => item.selectorWidget)) {
            let [xNew, yNew, widthNew, heightNew] = item.selectorWidget.toRect();
            let [xOld, yOld, widthOld, heightOld] = item.toRect();
            console.log("before", [xNew, yNew, widthNew, heightNew], [xOld, yOld, widthOld, heightOld]);
            //console.log(item.toPoints());
            if (widthNew < 0) {
                item.move(widthNew, 0);
                xNew = xNew + widthNew;
                widthNew = -widthNew;
            }
            if (heightNew < 0) {
                item.move(0, heightNew);
                yNew = yNew + widthNew;
                heightNew = -heightNew;
            }
            console.log("after", [xNew, yNew, widthNew, heightNew], [xOld, yOld, widthOld, heightOld]);
            item.setTopLeft(xNew, yNew);
            item.selectorWidget.setTopLeft(xNew, yNew);
            //item.move(xNew - xOld, yNew - yOld);
            item.addSize(widthNew - widthOld, heightNew - heightOld);
            //item.addSize(10, 10);
            //item.selectorWidget.addSize(widthNew - widthOld, heightNew - heightOld);
            item.selectorWidget.showDimentionBalls();
            console.log("effect", item.toRect());
            console.log("effectSelectowidget", item.selectorWidget.toRect());
            //console.log(item.toPoints());
        }
        d.refresh = true;
        this.stateController.change(new ReadyState(this.stateController));
    }
    */

    
    dragend(x, y, evt, widget) {
        for (let item of widget.lowerWidgets.filter(item => item.selectorWidget)) {
            let [xNew, yNew, widthNew, heightNew] = item.selectorWidget.toRect();
            let [xOld, yOld, widthOld, heightOld] = item.toRect();
            
            console.log("width", widthNew, widthOld, heightNew, heightOld)
            //console.log("x", xNew, xOld, yNew, yOld);
            item.move(xNew - xOld, yNew - yOld);
            item.selectorWidget.setTopLeft(xNew, yNew);
            item.addSize(widthNew - widthOld, heightNew - heightOld);
            item.selectorWidget.showDimentionBalls();
        }
        d.refresh = true;
        this.stateController.change(new ReadyState(this.stateController));
    }
    
}

let w = new CoordinatorLayout(20, 30, 300, 250, "silver", [
    new Txt(100, 200, 210, 9, "Welcome to Tatarstan!", "red"),
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

let d = new CanvasDraw(w);

/*
d.canvas.addEventListener("contextmenu", function(evt){
    evt.preventDefault();
})
*/


w.mouseSensor = new ImageMouseSensor();
