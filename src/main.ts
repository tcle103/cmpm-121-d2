import "./style.css";

const canvas: HTMLCanvasElement = document.createElement("canvas");
const clearButton: HTMLButtonElement = document.createElement("button");
const undoButton: HTMLButtonElement = document.createElement("button");
const redoButton: HTMLButtonElement = document.createElement("button");
const ctx = canvas.getContext("2d");
const cursor = { x: 0, y: 0 };
const linearr: Line[] = [];
const pointarr: number[][][] = [];
const redoarr: number[][][] = [];
const drawChange: Event = new Event("drawing-changed");
let drawFlag: boolean = false;
interface Line {
  points: number[][];
  display(obj: Line): void;
  drag(obj: Line): void;
}

document.body.innerHTML += `<h1>draw</h1>`;
canvas.height = 256;
canvas.width = 256;
document.body.append(canvas);
document.body.append(clearButton);
document.body.append(undoButton);
document.body.append(redoButton);

function draw(obj: Line): void {
  console.log("drawing");
  for (let i: number = 0; i < obj.points.length; ++i) {
    const pt = obj.points[i];
    ctx?.moveTo(pt[0], pt[1]);
    ctx?.lineTo(pt[2], pt[3]);
    ctx?.stroke();
    cursor.x = pt[2];
    cursor.y = pt[3];
  }
}

function iterDraw(obj: Line): void {
  // console.log("iterDrawing" + obj);
  const pt = obj.points[obj.points.length - 1];
  ctx?.moveTo(pt[0], pt[1]);
  ctx?.lineTo(pt[2], pt[3]);
  ctx?.stroke();
  cursor.x = pt[2];
  cursor.y = pt[3];
}

canvas.addEventListener("pointerdown", (e) => {
  drawFlag = true;
  // console.log("down!");
  ctx?.beginPath();
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  const line: Line = {
    points: [],
    display: draw,
    drag: iterDraw,
  };
  linearr.push(line);
  redoarr.splice(0, redoarr.length);
});
canvas.addEventListener("pointerup", () => {
  drawFlag = false;
});
canvas.addEventListener("mousemove", (e) => {
  if (drawFlag) {
    linearr[linearr.length - 1].points.push([
      cursor.x,
      cursor.y,
      e.offsetX,
      e.offsetY,
    ]);
    canvas.dispatchEvent(drawChange);
  }
});

canvas.addEventListener("drawing-changed", () => {
  // ctx?.clearRect(0, 0, 256, 256);
  linearr[linearr.length - 1].drag(linearr[linearr.length - 1]);
});

clearButton.innerHTML = "clear";
clearButton.addEventListener("click", () => {
  linearr.splice(0);
  console.log(linearr);
  ctx?.clearRect(0, 0, 256, 256);
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
