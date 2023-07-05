import { Shape, somevar } from "../commons/scripts/graphshapes.js";

let win = document.getElementById("Server Status Graph");
let ctxwin = win.getContext("2d");
ctxwin.fillRect(0, 0, 100, 100);
ctxwin.fillText(somevar, 100, 100);

let s = new Shape("green");