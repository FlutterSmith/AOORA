"use strict";

export class Canvas{
    constructor(){
        this.canvas = document.getElementById("canvas");
        this.context = canvas.getContext("2d");
        this.ratio = window.devicePixelRatio || 1;
        this.dirty = true;
        this.adjustRatio();
    }

    adjustRatio(){
        this.width = canvas.width;
        this.height = canvas.height;
        this.canvas.width = this.width * this.ratio;
        this.canvas.height = this.height * this.ratio;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.context.scale(this.ratio, this.ratio);
    }

    clear(){
        this.context.clearRect(0, 0, this.width, this.height);
    }

    setCursor(cursorType = "default"){
        this.canvas.style.cursor = cursorType;
    }

    getCanvas(){
        return this.canvas;
    }

    getContext(){
        return this.context;
    }
}