import "./style.css";

const canvas: HTMLCanvasElement = document.createElement("canvas");
const clearButton: HTMLButtonElement = document.createElement("button");
const ctx = canvas.getContext("2d");
const cursor = { x: 0, y: 0 };
const pointarr: number[][] = [];
const drawChange: Event = new Event("drawing-changed");
let drawFlag: boolean = false;

document.body.innerHTML += `<h1>draw</h1>`;
canvas.height = 256;
canvas.width = 256;
document.body.append(canvas);
document.body.append(clearButton);

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
    pointarr.push([cursor.x, cursor.y, e.offsetX, e.offsetY]);
    canvas.dispatchEvent(drawChange);
  }
});

canvas.addEventListener("drawing-changed", () => {
  console.log("wah!");
  ctx?.beginPath();
  const pt1: number[] = [
    pointarr[pointarr.length - 1][0],
    pointarr[pointarr.length - 1][1],
  ];
  const pt2: number[] = [
    pointarr[pointarr.length - 1][2],
    pointarr[pointarr.length - 1][3],
  ];
  ctx?.moveTo(pt1[0], pt1[1]);
  ctx?.lineTo(pt2[0], pt2[1]);
  ctx?.stroke();
  cursor.x = pt2[0];
  cursor.y = pt2[1];
});

clearButton.innerHTML = "clear";
clearButton.addEventListener("click", () => {
  ctx?.clearRect(0, 0, 256, 256);
});
