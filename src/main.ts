import "./style.css";

const thinStyle: number = 1;
const thickStyle: number = 3;
let currStyle = "pen";
const emoteSize = 30;
type ObjectKey = keyof typeof toolsList;
type PreviewKey = keyof typeof previewList;
const canvas: HTMLCanvasElement = document.createElement("canvas");
const clearButton: HTMLButtonElement = document.createElement("button");
const undoButton: HTMLButtonElement = document.createElement("button");
const redoButton: HTMLButtonElement = document.createElement("button");
const canvasDiv: HTMLDivElement = document.createElement("div");
const toolsDiv: HTMLDivElement = document.createElement("div");
const tools: HTMLButtonElement[] = [];
const toolsList = {
  pen: thinStyle,
  marker: thickStyle,
  "🥞": thinStyle,
};
const styleDrawList = {
  pen: [draw, iterDraw],
  marker: [draw, iterDraw],
  "🥞": [emoteDraw, iterDraw],
};
const toolDrawList = {
  pen: toolDraw,
  marker: toolDraw,
  "🥞": emoteToolDraw,
};
const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
const cursor = { x: 0, y: 0 };
const linearr: Line[] = [];
const redoarr: Line[] = [];
const drawChange: Event = new Event("drawing-changed");
const redraw: Event = new Event("redraw");
const toolMove: Event = new Event("tool-moved");
let drawFlag: boolean = false;
interface Line {
  points: number[][];
  style: string;
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
interface ToolPreview {
  tool: string;
  draw(
    ctx: CanvasRenderingContext2D | null,
    tool: string,
  ): void;
}
const previewList = { none: { tool: "b", draw: toolDraw } };

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

for (const key of Object.keys(toolsList)) {
  const tempButt = document.createElement("button");
  tools.push(tempButt);
  tempButt.innerHTML = key;
  tempButt.className = "tool";
  tempButt.id = key;
  const preview: ToolPreview = {
    tool: key,
    draw: toolDrawList[key as ObjectKey],
  };
  previewList[key as PreviewKey] = preview;
  tempButt.addEventListener("click", function () {
    currStyle = this.id as ObjectKey;
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
  }
}

function toolDraw(ctx: CanvasRenderingContext2D | null, tool: string): void {
  if (ctx) {
    ctx?.fillRect(
      cursor.x,
      cursor.y,
      toolsList[tool as ObjectKey] * 2,
      toolsList[tool as ObjectKey] * 2,
    );
  }
}

function emoteToolDraw(
  ctx: CanvasRenderingContext2D | null,
  tool: string,
): void {
  if (ctx) {
    ctx.font = `${emoteSize}px serif`;
    ctx?.fillText(
      tool,
      cursor.x - emoteSize / 2,
      cursor.y + emoteSize / 4,
    );
  }
}

function emoteDraw(
  ctx: CanvasRenderingContext2D | null,
  obj: Line,
  strokeWidth: number,
): void {
  if (ctx) {
    console.log("emoteDrawing");
    ctx.lineWidth = strokeWidth;
    ctx.font = `${emoteSize}px serif`;
    ctx.fillText(
      obj.style,
      obj.points[obj.points.length - 1][2] - emoteSize / 2,
      obj.points[obj.points.length - 1][3] + emoteSize / 4,
    );
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
  canvas.dispatchEvent(redraw);
  drawFlag = true;
  ctx?.beginPath();
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  const line: Line = {
    points: [],
    style: currStyle,
    display: styleDrawList[currStyle as ObjectKey][0],
    drag: styleDrawList[currStyle as ObjectKey][1],
  };
  linearr.push(line);
  redoarr.splice(0, redoarr.length);
});
canvas.addEventListener("pointerup", () => {
  drawFlag = false;
});
canvas.addEventListener("pointermove", (e) => {
  if (drawFlag) {
    linearr[linearr.length - 1].points.push([
      cursor.x,
      cursor.y,
      e.offsetX,
      e.offsetY,
    ]);
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    canvas.dispatchEvent(drawChange);
  } else {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    canvas.dispatchEvent(toolMove);
  }
});
canvas.addEventListener("pointerleave", () => {
  canvas.dispatchEvent(redraw);
});

canvas.addEventListener("drawing-changed", () => {
  linearr[linearr.length - 1].drag(
    ctx,
    linearr[linearr.length - 1],
    toolsList[linearr[linearr.length - 1].style as ObjectKey],
  );
});

canvas.addEventListener("redraw", () => {
  ctx?.clearRect(0, 0, 256, 256);
  for (let i: number = 0; i < linearr.length; ++i) {
    linearr[i].display(
      ctx,
      linearr[i],
      toolsList[linearr[i].style as ObjectKey],
    );
  }
});

canvas.addEventListener("tool-moved", () => {
  canvas.dispatchEvent(redraw);
  previewList[currStyle as PreviewKey].draw(ctx, currStyle);
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
