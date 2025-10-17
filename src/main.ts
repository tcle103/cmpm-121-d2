import "./style.css";

const canvas: HTMLCanvasElement = document.createElement("canvas");
const ctx = canvas.getContext("2d");
let drawFlag = false;
const cursor = { x: 0, y: 0 };

document.body.innerHTML += `<h1>draw</h1>`;
canvas.height = 256;
canvas.width = 256;
document.body.append(canvas);

canvas.addEventListener("pointerdown", (e) => {
  drawFlag = true;
  console.log("down!");
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
});
canvas.addEventListener("pointerup", () => {
  drawFlag = false;
});
canvas.addEventListener("mousemove", (e) => {
  if (drawFlag) {
    ctx?.beginPath();
    ctx?.moveTo(cursor.x, cursor.y);
    ctx?.lineTo(e.offsetX, e.offsetY);
    ctx?.stroke();
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
  }
});
