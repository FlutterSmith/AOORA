"use strict";

import { Matrix } from "./matrix.js";

// Function to rotate a point around an arbitrary center
function rotatePoint(x, y, centerX, centerY, angleRad) {
  // Translate the point and center
  var tx = x - centerX;
  var ty = y - centerY;

  // Apply the rotation transformation using a rotation matrix
  var cosTheta = Math.cos(angleRad);
  var sinTheta = Math.sin(angleRad);
  var rx = tx * cosTheta - ty * sinTheta;
  var ry = tx * sinTheta + ty * cosTheta;

  // Translate the point back to its original position
  var new_x = rx + centerX;
  var new_y = ry + centerY;

  // Return the rotated point as an array
  return [new_x, new_y];
}

class Shape {
    constructor(x, y, color) {
        if (new.target === Shape) {
            throw new Error("Cannot instantiate abstract class Shape.");
        }
        this.x = x;
        this.y = y;
        this.color = color;
        this.borderColor = "transparent";
        this.rotation = 0;
        this.eventHandlers = {};
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    expand(dx, dy) {
        throw new Error("Method `expand` is not implemented");
    }

    rotate(angle) {
        this.rotation = angle;
    }

    draw(ctx) {
        let [pivotX, pivotY] = [this.getPivotX(), this.getPivotY()];
        ctx.save();
        ctx.translate(pivotX, pivotY);
        ctx.rotate(this.rotation);
        ctx.translate(-pivotX, -pivotY)
        this._draw(ctx);
        ctx.restore();
    }

    bind(eventType, callback) {
        if (typeof callback != 'function') {
            throw new Error("Callback is not a function");
        }
        this.eventHandlers[eventType] = callback.bind(this);
    }

    unbind(eventType){
        delete this.eventHandlers[eventType];
    }

    fire(eventType, x, y, event) {
        if (this.isInside(x, y)) {
            if (eventType in this.eventHandlers) {
                this.eventHandlers[eventType](x, y, event);
            }
            return true;
        }
        else {
            if ((eventType + "out") in this.eventHandlers) {
                this.eventHandlers[eventType + "out"](x, y, event);
                return false;
            }
        }


    }

    getBounds() {
        // Default implementation returns a rectangle with the same dimensions as the shape
        return new Rect(this.getX(), this.getY(), this.getWidth(), this.getHeight(), 'transparent');
    }

    isInside(x, y) {
        let [pivotX, pivotY] = [this.getPivotX(), this.getPivotY()];
        [x, y] = rotatePoint(x, y, pivotX, pivotY, -this.rotation);
        return this._isInside(x, y);
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getWidth() {
        // Default implementation returns 0, override in subclasses as needed
        return 0;
    }

    getHeight() {
        // Default implementation returns 0, override in subclasses as needed
        return 0;
    }

    getPivotX() {
        return this.getX() + this.getWidth() / 2;
    }

    getPivotY() {
        return this.getY() + this.getHeight() / 2
    }

    getRotation() {
        return this.rotation;
    }

    rotatePoint(x, y, angle) {
        let [pivotX, pivotY] = [this.getPivotX(), this.getPivotY()];
        let cosAngle = Math.cos(angle);
        let sinAngle = Math.sin(angle);

        // Translate the point so that the pivot is at the origin
        let xTranslated = x - pivotX;
        let yTranslated = y - pivotY;

        // Rotate the point around the origin
        let xRotated = xTranslated * cosAngle - yTranslated * sinAngle;
        let yRotated = xTranslated * sinAngle + yTranslated * cosAngle;

        return [xRotated + pivotX, yRotated + pivotY]

        
    }

    surrondRect() {

        let x1t = this.getX();
        let y1t = this.getY();
        let x2t = this.getX() + this.getWidth();
        let y2t = this.getY() + this.getHeight();
        let [x1, y1] = this.rotatePoint(x1t, y1t, this.rotation);
        let [x2, y2] = this.rotatePoint(x2t, y1t, this.rotation);
        let [x3, y3] = this.rotatePoint(x1t, y2t, this.rotation);
        let [x4, y4] = this.rotatePoint(x2t, y2t, this.rotation);
        return [Math.min(x1, x2, x3, x4), Math.min(y1, y2, y3, y4), Math.max(x1, x2, x3, x4), Math.max(y1, y2, y3, y4)]
    }
}

export class Rect extends Shape {
    constructor(x, y, width, height, color) {
        super(x, y, color);
        this.width = width;
        this.height = height;
    }

    _draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.borderColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    expand(dx, dy) {
        this.width = this.width + dx;
        this.height = this.height + dy;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    _isInside(x, y) {
        let xMin = Math.min(this.x, this.x + this.width);
        let yMin = Math.min(this.y, this.y + this.height);
        let xMax = Math.max(this.x, this.x + this.width);
        let yMax = Math.max(this.y, this.y + this.height);
        return (xMin <= x && x <= xMax) && (yMin <= y && y <= yMax);
    }
}

export class Line extends Shape {
    constructor(x, y, x1, y1, color) {
        super(x, y, color);
        this.x1 = x1;
        this.y1 = y1;
    }

    move(dx, dy) {
        super.move(dx, dy);
        this.x1 += dx;
        this.y1 += dy;
    }

    expand(dx, dy){
        this.x1 = this.x1 + dx;
        this.y1 = this.y1 + dy;
    }

    _draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x1, this.y1);
        ctx.strokeStyle = this.color;
        ctx.stroke();
    }

    getWidth() {
        return this.x1 - this.x;
    }

    getHeight() {
        return this.y1 - this.y;
    }

    _isInside(x, y) {
        let d = Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);
        let d1 = Math.sqrt((this.x1 - x) ** 2 + (this.y1 - y) ** 2);
        let dl = Math.sqrt((this.x1 - this.x) ** 2 + (this.y1 - this.y) ** 2);
        return (d + d1 >= dl - 0.2 && d + d1 <= dl + 0.2);
    }
}

export class Ellipse extends Shape {
    constructor(x, y, radiusX, radiusY, color) {
        super(x, y, color);
        this.radiusX = radiusX;
        this.radiusY = radiusY;
    }

    _draw(ctx) {
        ctx.beginPath();
        let rx = Math.abs(this.radiusX);
        let ry = Math.abs(this.radiusY);
        ctx.ellipse(this.x, this.y, rx, ry, 0, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    getX() {
        return this.x - this.radiusX;
    }

    getY() {
        return this.y - this.radiusY;
    }

    getWidth() {
        return this.radiusX * 2;
    }

    getHeight() {
        return this.radiusY * 2;
    }

    expand(dx, dy){
        this.x = this.x + dx/2;
        this.y = this.y + dy/2;
        this.radiusX = this.radiusX + dx/2;
        this.radiusY = this.radiusY + dy/2;
    }

    _isInside(x, y) {
        let distance_x = (x - this.x) / this.radiusX;
        let distance_y = (y - this.y) / this.radiusY;
        return (distance_x ** 2 + distance_y ** 2) <= 1;
    }
}

export class Text extends Rect {
    constructor(x, y, width, height, text, color, font) {
        super(x, y, width, height, color);
        this.text = text;
        this.font = font;
    }

    _draw(ctx) {
        ctx.textBaseline = "top";
        ctx.fillStyle = this.color;
        ctx.font = this.height + "px " + this.font;
        ctx.fillText(this.text, this.x, this.y);
    }
}

export class Picture extends Rect {
    constructor(x, y, width, height, imageSrc) {
        super(x, y, width, height);
        this.image = new Image();
        this.image.src = imageSrc;
    }

    _draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Container extends Rect {
    constructor(x, y, width, height, color, shapes) {
        super(x, y, width, height, color);
        this.shapes = shapes;
        this.captureSetting = "all";
        this.scaleX = 1;
        this.scaleY = 1;
    }

    setCaptureSetting(captureSetting) {
        this.captureSetting = captureSetting;
    }

    setScale(scaleX, scaleY) {
        this.scaleX = scaleX != 0 ? scaleX : 1;
        this.scaleY = scaleY != 0 ? scaleY : 1;
    }

    addShape(shape) {
        this.shapes.push(shape);
    }

    hasShape(shape) {
        return this.shapes.includes(shape);
    }

    removeShape(shape) {
        const index = this.shapes.indexOf(shape);
        if (index === -1) {
            throw new Error("Cannot remove non-existing shape");
        }
        this.shapes.splice(index, 1);
    }

    get(index) {
        return this.shapes[index];
    }
    
}

export class CoordinatorLayout extends Container {
    _draw(ctx) {

        super._draw(ctx);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scaleX, this.scaleY);

        for (const shape of this.shapes) {
            shape.draw(ctx);
        }

        ctx.restore();
    }

    fire(eventType, x, y, event) {
        let inside = super.fire(eventType, x, y, event);


        let [pivotX, pivotY] = [this.getPivotX(), this.getPivotY()];
        [x, y] = rotatePoint(x, y, pivotX, pivotY, -this.rotation);
        x = x - this.x;
        y = y - this.y;
        x = x / this.scaleX;
        y = y / this.scaleY;

        if (this.captureSetting == "all") {
            for (let shape of this.shapes) {
                shape.fire(eventType, x, y, event)
            }
        }
        else if (this.captureSetting == "top") {
            let nonCollide = true;
            for (let i = this.shapes.length - 1; i >= 0; i--) {
                if (this.shapes[i].fire(eventType, x, y, event)) {
                    nonCollide = false;
                    break;
                }
            }
            if (nonCollide) {
                if ((eventType + "none") in this.eventHandlers) {
                    this.eventHandlers[eventType + "none"](x, y, event);
                }

            }
        }
        return inside;
    }
}

export class Group extends CoordinatorLayout{
    expand(dx, dy){
        let oldWidth = this.getWidth();
        let oldHeight = this.getHeight();
        super.expand(dx, dy);
        let scaleX = dx/oldWidth;
        let scaleY = dy/oldHeight;
        for (let shape of this.shapes){
            
            let shapeDX = shape.getX()*scaleX;
            let shapeDY = shape.getY()*scaleY;
            let shapeDW = shape.getWidth()*scaleX;
            let shapeDH = shape.getHeight()*scaleY;        
            
            shape.move(shapeDX, shapeDY);
            shape.expand(shapeDW, shapeDH);
        }
        
    }
}

export class ActiveSelectorGroup extends CoordinatorLayout {
    constructor(graphwin) {
        super(0, 0, 100, 100, "transparent", [
            new Ellipse(0, 0, 5, 5, "#3D81E9"),
            new Ellipse(0, 100, 5, 5, "#3D81E9"),
            new Ellipse(100, 0, 5, 5, "#3D81E9"),
            new Ellipse(100, 100, 5, 5, "#3D81E9"),
            new Ellipse(0, 50, 5, 5, "#3D81E9"),
            new Ellipse(50, 0, 5, 5, "#3D81E9"),
            new Ellipse(100, 50, 5, 5, "#3D81E9"),
            new Ellipse(50, 100, 5, 5, "#3D81E9"),
            new Ellipse(50, -20, 5, 5, "#3D81E9"),
        ]);
        this.borderColor = "#3D81E9";
        this.selectedElements = [];
        this.previousDragX = 0;
        this.previousDragY = 0;
        this.graphwin = graphwin;
        this.bindShapes();
    }

    bindShapes(){
        this.bind("dragstart", this.dragstart);
        this.bind("drag", this.drag);
        this.bind("dragout", this.drag);
        this.bind("mousemove", this.mousemove);
        this.bind("mousemoveout", this.mouseout);
        this.shapes[3].selector = this;
        this.shapes[3].bind("dragstart", this.beginScale);
    }

    unbindShapes(){
        this.unbind("dragstart");
        this.unbind("drag");
        this.unbind("dragout");
        this.unbind("mousemove");
        this.unbind("mousemoveout");
        this.shapes[3].unbind("dragstart");
    }

    hasSelected(shape) {
        return this.selectedElements.includes(shape);
    }

    selectShape(shape) {
        if (this.selectedElements.length === 0) {
            this.move(shape.getX() - this.getX(), shape.getY() - this.getY());
            this.expand(shape.getWidth() - this.getWidth(), shape.getHeight() - this.getHeight());
            this.rotate(shape.getRotation());
        }
        else {
            let [xMin1, yMin1, xMax1, yMax1] = this.surrondRect();
            let [xMin2, yMin2, xMax2, yMax2] = shape.surrondRect();
            let xMin = Math.min(xMin1, xMin2);
            let yMin = Math.min(yMin1, yMin2);
            let xMax = Math.max(xMax1, xMax2);
            let yMax = Math.max(yMax1, yMax2);
            this.move(xMin - this.getX(), yMin - this.getY());
            this.expand(xMax - xMin - this.getWidth(), yMax - yMin - this.getHeight())
            this.rotate(0);

        }
        this.selectedElements.push(shape);
    }

    clearSelect() {
        this.selectedElements = [];
    }

    expand(dx, dy) {
        super.expand(dx, dy);
        
        this.shapes[1].move(0, dy);
        this.shapes[2].move(dx, 0);
        this.shapes[3].move(dx, dy);
        this.shapes[4].move(0, dy / 2);
        this.shapes[5].move(dx / 2, 0);
        this.shapes[6].move(dx, dy / 2);
        this.shapes[7].move(dx / 2, dy);
        this.shapes[8].move(dx / 2, 0);
        
    }

    _isInside(x, y) {
        let inside = super._isInside(x, y);
        let [x1, y1] = [x - this.getX(), y - this.getY()];
        for (let shape of this.shapes) {
            inside = inside || shape._isInside(x1, y1);
        }
        return inside;
    }

    mousemove(x, y, event){
        this.graphwin.setCursor("all-scroll");
    }

    mouseout(x, y, event){
        this.graphwin.setCursor("default");
    }

    dragstart(x, y, event) {
        this.previousDragX = x;
        this.previousDragY = y;
    }

    drag(x, y, event) {
        //console.log(x, y)
        let dx = x - this.previousDragX;
        let dy = y - this.previousDragY;
        this.previousDragX = x;
        this.previousDragY = y;
        
        this.move(dx, dy);
        
        for (let shape of this.selectedElements) {
            shape.move(dx, dy);
        }
        
        this.graphwin.setDirty();
        
    }
    
    beginScale(x, y, event){
        this.selector.unbindShapes();
        this.bind("drag", this.selector.scale);
        this.bind("dragout", this.selector.scale);
        this.bind("dragend", this.selector.endScale);
        this.bind("dragendout", this.selector.endScale);
        this.selector.previousDragX = x;
        this.selector.previousDragY = y;
    }

    scale(x, y, event){
        let dx = x - this.selector.previousDragX;
        let dy = y - this.selector.previousDragY;
        this.selector.previousDragX = x;
        this.selector.previousDragY = y;

        let selectorX = this.selector.getX();
        let selectorY = this.selector.getY();
        let oldWidth = this.selector.getWidth();
        let oldHeight = this.selector.getHeight();
        let scaleX = dx/oldWidth;
        let scaleY = dy/oldHeight;
        
        this.selector.expand(dx, dy);

        let alpha = this.selector.rotation;
        let sx = (dx/2)*Math.cos(alpha) - (dy/2)*Math.sin(alpha) - dx/2;
        let sy = (dx/2)*Math.sin(alpha) + (dy/2)*Math.cos(alpha) - dy/2;
        
        this.selector.move(sx, sy);
        
        for (let shape of this.selector.selectedElements){
            
            let shapeDX = (shape.getX() - selectorX)*scaleX;
            let shapeDY = (shape.getY() - selectorY)*scaleY;
            let shapeDW = shape.getWidth()*scaleX;
            let shapeDH = shape.getHeight()*scaleY;
            

            shape.move(shapeDX, shapeDY);
            shape.expand(shapeDW, shapeDH);

            let ddx = shapeDX + shapeDW;
            let ddy = shapeDY + shapeDH;

            let alpha = shape.rotation;
            let sx = (ddx/2)*Math.cos(alpha) - (ddy/2)*Math.sin(alpha) - ddx/2;
            let sy = (ddx/2)*Math.sin(alpha) + (ddy/2)*Math.cos(alpha) - ddy/2;
            shape.move(sx, sy);
        }
        
        
        this.selector.graphwin.setDirty();
    }

    endScale(){
        this.unbind("drag");
        this.unbind("dragout");
        this.unbind("dragend");
        this.unbind("dragendout");
        this.selector.bindShapes();
    }
}