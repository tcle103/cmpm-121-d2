import "./style.css";

const canvas: HTMLCanvasElement = document.createElement("canvas");
const clearButton: HTMLButtonElement = document.createElement("button");
const undoButton: HTMLButtonElement = document.createElement("button");
const redoButton: HTMLButtonElement = document.createElement("button");
const ctx = canvas.getContext("2d");
const cursor = { x: 0, y: 0 };
const pointarr: number[][][] = [];
const redoarr: number[][][] = [];
const drawChange: Event = new Event("drawing-changed");
let drawFlag: boolean = false;
interface Line {
  points: number[][];
  display(pts: number[][]): void;
}

document.body.innerHTML += `<h1>draw</h1>`;
canvas.height = 256;
canvas.width = 256;
document.body.append(canvas);
document.body.append(clearButton);
document.body.append(undoButton);
document.body.append(redoButton);

function draw(pts: number[][]): void {
  ctx?.moveTo(pts[0][0], pts[0][1]);
  ctx?.lineTo(pts[1][0], pts[1][1]);
  ctx?.stroke();
  cursor.x = pts[1][0];
  cursor.y = pts[1][1];
}

canvas.addEventListener("pointerdown", (e) => {
  drawFlag = true;
  console.log("down!");
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  pointarr.push([]);
  redoarr.splice(0, redoarr.length);
});
canvas.addEventListener("pointerup", () => {
  drawFlag = false;
});
canvas.addEventListener("mousemove", (e) => {
  if (drawFlag) {
    pointarr[pointarr.length - 1].push([
      cursor.x,
      cursor.y,
      e.offsetX,
      e.offsetY,
    ]);
    canvas.dispatchEvent(drawChange);
  }
});

canvas.addEventListener("drawing-changed", () => {
  console.log("wah!");
  ctx?.clearRect(0, 0, 256, 256);
  ctx?.beginPath();
  for (let j: number = 0; j < pointarr.length; ++j) {
    const line: number[][] = pointarr[j];
    for (let i: number = 0; i < line.length; ++i) {
      const pt1: number[] = [
        line[i][0],
        line[i][1],
      ];
      const pt2: number[] = [
        line[i][2],
        line[i][3],
      ];
      // ctx?.moveTo(pt1[0], pt1[1]);
      // ctx?.lineTo(pt2[0], pt2[1]);
      // ctx?.stroke();
      // cursor.x = pt2[0];
      // cursor.y = pt2[1];
      draw([pt1, pt2]);
    }
  }
});

clearButton.innerHTML = "clear";
clearButton.addEventListener("click", () => {
  ctx?.clearRect(0, 0, 256, 256);
  pointarr.splice(0, pointarr.length);
});

undoButton.innerHTML = "undo";
undoButton.addEventListener("click", () => {
  if (pointarr.length > 0) {
    const temp: number[][] | undefined = pointarr.pop();
    if (temp) {
      redoarr.push(temp);
    }
    canvas.dispatchEvent(drawChange);
  }
});

redoButton.innerHTML = "redo";
redoButton.addEventListener("click", () => {
  if (redoarr.length > 0) {
    const temp: number[][] | undefined = redoarr.pop();
    if (temp) {
      pointarr.push(temp);
    }
    canvas.dispatchEvent(drawChange);
  }
});
