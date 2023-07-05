"use strict";
import { Matrix } from "./matrix.js";

export class Shape{
    constructor(color){
        if (this.constructor === Shape){
            throw new Error("Abstract class 'Shape' cannot be instantiated");
        }
        this.color = color;
        this.border = [1, "solid", "silver"];
    }

    draw(context){
        throw new Error("Method '.draw' must be implemented");
    }
}

export class BoxShape extends Shape{
    constructor(x, y, width, height, color){
        super(color);
        if (this.constructor === Shape){
            throw new Error("Abstract class 'BoxShape' cannot be instantiated");
        }
        //this.matrix = new Matrix()
    }
}

export let somevar = "aabbcc";