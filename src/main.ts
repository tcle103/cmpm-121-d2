import "./style.css";

const thinStyle: number = 1;
const thickStyle: number = 3;
let currStyle: number = thinStyle;
const canvas: HTMLCanvasElement = document.createElement("canvas");
const clearButton: HTMLButtonElement = document.createElement("button");
const undoButton: HTMLButtonElement = document.createElement("button");
const redoButton: HTMLButtonElement = document.createElement("button");
const canvasDiv: HTMLDivElement = document.createElement("div");
const toolsDiv: HTMLDivElement = document.createElement("div");
const tools: HTMLButtonElement[] = [];
const toolsList = { "pen": thinStyle, "marker": thickStyle };
const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
const cursor = { x: 0, y: 0 };
const linearr: Line[] = [];
const redoarr: Line[] = [];
const drawChange: Event = new Event("drawing-changed");
const redraw: Event = new Event("redraw");
let drawFlag: boolean = false;
interface Line {
  points: number[][];
  display(
    ctx: CanvasRenderingContext2D | null,
    obj: Line,
    strokeWidth: number,
  ): void;
  drag(
    ctx: CanvasRenderingContext2D | null,
    obj: Line,
    strokeWidth: number,
  ): void;
}

document.body.append(canvasDiv);
canvasDiv.innerHTML += `<h1>draw</h1>`;
canvasDiv.id = "canvasDiv";
canvas.height = 256;
canvas.width = 256;
canvasDiv.append(canvas);
canvasDiv.append(clearButton);
canvasDiv.append(undoButton);
canvasDiv.append(redoButton);
document.body.append(toolsDiv);
toolsDiv.id = "toolsDiv";

for (const [key, value] of Object.entries(toolsList)) {
  const tempButt = document.createElement("button");
  tools.push(tempButt);
  tempButt.innerHTML = key;
  tempButt.className = "tool";
  tempButt.id = key;
  tempButt.addEventListener("click", function () {
    currStyle = value;
    setSelection(this);
  });
  toolsDiv.append(tempButt);
}
tools[0].className += " selectedTool";

function draw(
  ctx: CanvasRenderingContext2D | null,
  obj: Line,
  strokeWidth: number,
): void {
  if (ctx) {
    console.log("drawing");
    ctx.lineWidth = strokeWidth;
    ctx?.beginPath();
    for (let i: number = 0; i < obj.points.length; ++i) {
      const pt = obj.points[i];
      ctx.moveTo(pt[0], pt[1]);
      ctx.lineTo(pt[2], pt[3]);
      ctx.stroke();
      cursor.x = pt[2];
      cursor.y = pt[3];
    }
  }
}

function iterDraw(
  ctx: CanvasRenderingContext2D | null,
  obj: Line,
  strokeWidth: number,
): void {
  if (ctx) {
    const pt = obj.points[obj.points.length - 1];
    ctx.lineWidth = strokeWidth;
    ctx.moveTo(pt[0], pt[1]);
    ctx.lineTo(pt[2], pt[3]);
    ctx.stroke();
    cursor.x = pt[2];
    cursor.y = pt[3];
  }
}

function setSelection(butt: HTMLButtonElement | undefined): void {
  if (butt) {
    butt.className += " selectedTool";
    for (let i: number = 0; i < tools.length; ++i) {
      if (tools[i].id != butt.id) {
        tools[i].className = "tool";
      }
    }
  }
}

canvas.addEventListener("pointerdown", (e) => {
  drawFlag = true;
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
  linearr[linearr.length - 1].drag(ctx, linearr[linearr.length - 1], currStyle);
});

canvas.addEventListener("redraw", () => {
  ctx?.clearRect(0, 0, 256, 256);
  console.log(linearr);
  for (let i: number = 0; i < linearr.length; ++i) {
    linearr[i].display(ctx, linearr[i], currStyle);
  }
});

clearButton.innerHTML = "clear";
clearButton.addEventListener("click", () => {
  linearr.splice(0);
  ctx?.clearRect(0, 0, 256, 256);
});

undoButton.innerHTML = "undo";
undoButton.addEventListener("click", () => {
  if (linearr.length > 0) {
    const temp: Line | undefined = linearr.pop();
    if (temp) {
      redoarr.push(temp);
    }
    canvas.dispatchEvent(redraw);
  }
});

redoButton.innerHTML = "redo";
redoButton.addEventListener("click", () => {
  if (redoarr.length > 0) {
    const temp: Line | undefined = redoarr.pop();
    if (temp) {
      linearr.push(temp);
    }
    canvas.dispatchEvent(redraw);
  }
});
