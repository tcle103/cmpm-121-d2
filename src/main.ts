import "./style.css";

const canvas: HTMLCanvasElement = document.createElement("canvas");

document.body.innerHTML += `<h1>draw</h1>`;
canvas.height = 256;
canvas.width = 256;
document.body.append(canvas);
