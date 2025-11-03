import "./style.css";

const thinStyle: number = 1;
const thickStyle: number = 3;
let currStyle = "pen";
let currColor = "#000000";
const emoteSize = 30;
type ObjectKey = keyof typeof toolsList;
type PreviewKey = keyof typeof previewList;
const canvas: HTMLCanvasElement = document.createElement("canvas");
const inputDiv: HTMLDivElement = document.createElement("div");
const colorInput: HTMLInputElement = document.createElement("input");
const clearButton: HTMLButtonElement = document.createElement("button");
const undoButton: HTMLButtonElement = document.createElement("button");
const redoButton: HTMLButtonElement = document.createElement("button");
const exportButton: HTMLButtonElement = document.createElement("button");
const addButton: HTMLButtonElement = document.createElement("button");
const canvasDiv: HTMLDivElement = document.createElement("div");
const toolsDiv: HTMLDivElement = document.createElement("div");
const tools: HTMLButtonElement[] = [];
const toolsList = {
  pen: thinStyle,
  marker: thickStyle,
  "🥞": 0,
  "🥛": 0,
  "🥓": 0,
};
const styleDrawList = {
  pen: [draw, iterDraw],
  marker: [draw, iterDraw],
  "🥞": [emoteDraw, emoteIterDraw],
  "🥛": [emoteDraw, emoteIterDraw],
  "🥓": [emoteDraw, emoteIterDraw],
};
const toolDrawList = {
  pen: toolDraw,
  marker: toolDraw,
  "🥞": emoteToolDraw,
  "🥛": emoteToolDraw,
  "🥓": emoteToolDraw,
};
const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
const cursor = { x: 0, y: 0 };
const linearr: Line[] = [];
const redoarr: Line[] = [];
const drawChange: Event = new Event("drawing-changed");
const redraw: Event = new Event("redraw");
const toolMove: Event = new Event("tool-moved");
let drawFlag: boolean = false;
const height: number = 256;
const width: number = 256;
interface Line {
  points: number[][];
  style: string;
  color: string;
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
canvas.height = height;
canvas.width = width;
ctx?.clearRect(0, 0, height, width);
canvasDiv.append(canvas);
canvasDiv.append(clearButton);
canvasDiv.append(undoButton);
canvasDiv.append(redoButton);
canvasDiv.append(exportButton);
canvasDiv.append(inputDiv);
document.body.append(toolsDiv);
toolsDiv.id = "toolsDiv";
inputDiv.id = "inputDiv";
colorInput.type = "color";
colorInput.id = "colorInput";
colorInput.value = "#000000";
colorInput.addEventListener("change", () => {
  currColor = colorInput.value;
});
inputDiv.append(colorInput);

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
addButton.id = "addButton";
addButton.innerHTML = "+ !";
toolsDiv.append(addButton);
addButton.addEventListener("click", () => {
  const emote: string | null = prompt("enter emote to add as sticker!!", "💚");
  if (emote) {
    if (!(emote in toolsList)) {
      toolsList[emote as ObjectKey] = 0;
      styleDrawList[emote as ObjectKey] = [emoteDraw, emoteIterDraw];
      toolDrawList[emote as ObjectKey] = emoteToolDraw;
      addButton.remove();
      const tempButt = document.createElement("button");
      tools.push(tempButt);
      tempButt.innerHTML = emote;
      tempButt.className = "tool";
      tempButt.id = emote;
      const preview: ToolPreview = {
        tool: emote,
        draw: emoteToolDraw,
      };
      previewList[emote as PreviewKey] = preview;
      tempButt.addEventListener("click", function () {
        currStyle = this.id as ObjectKey;
        setSelection(this);
      });
      toolsDiv.append(tempButt);
      toolsDiv.append(addButton);
    }
  }
});

if (globalThis.screen.width < 768 || globalThis.screen.width < 768) {
  console.log("tiny!");
  document.body.style.flexDirection = "column";
  toolsDiv.style.textAlign = "center";
  for (let i: number = 0; i < tools.length; ++i) {
    tools[i].className = "toolInline spaced";
  }
  tools[0].className += " selectedTool";
  for (const child of canvasDiv.children) {
    if (child instanceof HTMLButtonElement) {
      child.className += " spaced";
    }
  }
}

tools[0].className += " selectedTool";

function draw(
  ctx: CanvasRenderingContext2D | null,
  obj: Line,
  strokeWidth: number,
): void {
  if (ctx) {
    ctx.strokeStyle = obj.color;
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
    ctx.strokeStyle = obj.color;
    ctx.lineWidth = strokeWidth;
    ctx.moveTo(pt[0], pt[1]);
    ctx.lineTo(pt[2], pt[3]);
    ctx.stroke();
  }
}

function toolDraw(ctx: CanvasRenderingContext2D | null, tool: string): void {
  if (ctx) {
    ctx.fillStyle = currColor;
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
    ctx.font = `${emoteSize / 2}px serif`;
    ctx?.fillText(
      tool,
      cursor.x - emoteSize / 4,
      cursor.y + emoteSize / 8,
    );
  }
}

function emoteDraw(
  ctx: CanvasRenderingContext2D | null,
  obj: Line,
  strokeWidth: number,
): void {
  if (ctx) {
    ctx.lineWidth = strokeWidth;
    ctx.font = `${emoteSize}px serif`;
    ctx.fillText(
      obj.style,
      obj.points[obj.points.length - 1][2] - emoteSize / 2,
      obj.points[obj.points.length - 1][3] + emoteSize / 4,
    );
  }
}

function emoteIterDraw(
  ctx: CanvasRenderingContext2D | null,
  obj: Line,
  strokeWidth: number,
): void {
  canvas.dispatchEvent(redraw);
  if (ctx) {
    const pt = obj.points[obj.points.length - 1];
    ctx.lineWidth = strokeWidth;
    ctx.fillText(
      obj.style,
      pt[2] - emoteSize / 2,
      pt[3] + emoteSize / 4,
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
    color: currColor,
    display: styleDrawList[currStyle as ObjectKey][0],
    drag: styleDrawList[currStyle as ObjectKey][1],
  };
  linearr.push(line);
  linearr[linearr.length - 1].points.push([
    cursor.x,
    cursor.y,
    e.offsetX + 1,
    e.offsetY + 1,
  ]);
  redoarr.splice(0, redoarr.length);
  dispatchEvent(drawChange);
});
document.addEventListener("pointerup", () => {
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
  ctx?.clearRect(0, 0, height, width);
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
  ctx?.clearRect(0, 0, height, width);
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

exportButton.innerHTML = "export";
exportButton.addEventListener("click", () => {
  document.body.className += " disabled";
  const tempCanvas: HTMLCanvasElement = document.createElement("canvas");
  tempCanvas.width = height * 4;
  tempCanvas.height = width * 4;
  canvas.replaceWith(tempCanvas);
  const tempCTX: CanvasRenderingContext2D | null = tempCanvas.getContext("2d");
  if (tempCTX) {
    tempCTX.scale(4, 4);
    tempCTX.fillStyle = "white";
    tempCTX.fillRect(0, 0, height, width);
    tempCTX.lineCap = "round";
    for (let i: number = 0; i < linearr.length; ++i) {
      linearr[i].display(
        tempCTX,
        linearr[i],
        toolsList[linearr[i].style as ObjectKey],
      );
    }
    const anchor = document.createElement("a");
    anchor.href = tempCanvas.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();
  }
  tempCanvas.replaceWith(canvas);
  document.body.className = "";
});
