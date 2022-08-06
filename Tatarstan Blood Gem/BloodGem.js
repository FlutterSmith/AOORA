class WidgetBase {
    constructor(color) {
        this.color = color;
        this.mouseSensor = new MouseSensor(this);
    }

    draw(traverseObj) {
        traverseObj["traverse" + this.constructor.name](this);
    }

    sensor(handlerName, x, y, evt) {
        let handler = this.mouseSensor["on" + handlerName];
        if (handler && this.isInside(x, y)) {
            handler(x, y, evt);
        }
    }
}

class SolidShapeBase extends WidgetBase{
    constructor(x, y, color) {
        super(color);
        this.x = x;
        this.y = y;
    }

    move(deltaX, deltaY) {
        this.x = this.x + deltaX;
        this.y = this.y + deltaY;
    }
}

class Rect extends SolidShapeBase {
    constructor(x, y, width, height, color = "black") {
        super(x, y, color);
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
    constructor(x, y, radius, color = "black") {
        super(x, y, color);
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
    constructor(x1, y1, x2, y2, width = 1, color = "black") {
        super(color);
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.width = width;
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
        let margin = this.width + 5;
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

    move(deltaX, deltaY) {
        super.move(deltaX, deltaY);
        for (let lowerWidget of this.lowerWidgets) {
            lowerWidget.move(deltaX, deltaY);
        }
    }
}

class Group extends LayoutBase {
    draw(traverseObj) {
        super.draw(traverseObj);
        for (let lowerWidget of this.lowerWidgets) {
            lowerWidget.draw(traverseObj);
        }
    }
}

class MouseSensor {
    constructor(widget) {
        this.widget = widget;
        this.onMouseDown = null;
        this.onMouseUp = null;
        this.onMouseMove = null;
    }
}

class ConsoleDraw {
    traverseRect(widget) {
        console.log("Rect", widget.x, widget.y, widget.width, widget.height, widget.color);
    }

    traverseCircle(widget) {
        console.log("Circle", widget.x, widget.y, widget.radius, widget.color);
    }

    traverseEllipse(widget) {
        console.log("Ellipse", widget.x, widget.y, widget.width, widget.height, widget.color);
    }

    traverseImg(widget) {
        console.log("Img", widget.x, widget.y, widget.width, widget.height, widget.imageSource);
    }

    traverseTxt(widget) {
        console.log("Txt", widget.x, widget.y, widget.width, widget.height, widget.textString, widget.color)
    }

    traverseLine(widget) {
        console.log("Line", widget.x1, widget.y1, widget.x2, widget.y2, widget.color);
    }

    traverseGroup(widget) {
        console.log("Group(Rect)", widget.x, widget.y, widget.width, widget.height, widget.color);
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
                traverseObj.widget.draw(traverseObj);
                traverseObj.refresh = false;
            }
        }, 500, this);
    }

    createMouseEventListener(type) {
        return function (evt) {
            this.cargo.widget.sensor(type, evt.offsetX, evt.offsetY, evt)
        }
    }

    traverseRect(widget) {
        this.ctx.fillStyle = widget.color;
        this.ctx.fillRect(widget.x, widget.y, widget.width, widget.height);
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
        this.ctx.lineWidth = widget.width;
        this.ctx.beginPath();
        this.ctx.moveTo(widget.x1, widget.y1);
        this.ctx.lineTo(widget.x2, widget.y2);
        this.ctx.stroke();
    }
}

/*
let w = new Ellipse(100, 100, 30, 50, "red");
w.mouseSensor.onMouseMove = function (x, y, evt) {
    console.log("touch ellipse", x, y, evt)
}
let d = new CanvasDraw(w);
*/

let d = new ConsoleDraw();
let w = new Group(2, 3, 100, 100, "transparent", [
    new Rect(7, 8, 3, 2),
    new Circle(2, 3, 7, "purple")
]);

w.move(8, 12)

w.draw(d);