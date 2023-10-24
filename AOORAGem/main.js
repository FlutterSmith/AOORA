class GraphWin{
	constructor(width, height){
		this.canvas = document.getElementById("myCanvas");
        this.context = this.canvas.getContext("2d");
		this.setSize(width, height);
	}
	
	setSize(width, height){
        const scale = window.devicePixelRatio;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.canvas.width = Math.floor(width * scale);
        this.canvas.height = Math.floor(height * scale);
        this.context.scale(scale, scale);
    }
}

/*
class ShapeBase{
	constructor(color){
	    if (this.constructor === Shape){
            throw new Error('Cannot create instance of abstract class Shape');
        }
        this.color = color;
        this.borderColor = 'transparent';
        this.borderWidth = 0;
        this.rotation = 0;
	}
	
}

class Rect extends ShapeBase{
	constructor(x, y, width, height, color){
		super(color);
		this.dimensions = math.matrix([
		    [width,      0, x],
			[    0, height, y],
			[    0,      0, 1]
		]);
	}
	
	
}
*/

class AOORAGem{
	constructor(){
		this.graph = new GraphWin(800, 500);
		//this.myShape = new ShapeBase("red");
	}
	
	run(){
		let ctx = this.graph.context;
		ctx.fillStyle = "red";
		ctx.fillRect(120, 100, 50, 60);
	}
}

document.addEventListener("DOMContentLoaded", () => {
    new AOORAGem().run();
});