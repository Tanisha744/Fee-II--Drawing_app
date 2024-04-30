const canvas = document.querySelector("canvas"),
    toolBtns = document.querySelectorAll(".tool"),
    fillColor = document.querySelector("#fill-color"),
    sizeSlider = document.querySelector("#size-slider"),
    colorBtns = document.querySelectorAll(".colors .option"),
    colorPicker = document.querySelector("#color-picker"),
    clearCanvas = document.querySelector(".clear-canvas"),
    saveImg = document.querySelector(".save-img"),
    undoBtn = document.querySelector(".undo-btn"), // Undo button
    redoBtn = document.querySelector(".redo-btn"), // Redo button
    ctx = canvas.getContext("2d");
// const colorPicker = document.querySelector("#color-picker");
const eyeDropperIcon = document.querySelector(".fa-eye-dropper");

// Global variables with default value
let prevMouseX, prevMouseY, snapshot, isDrawing = false, selectedTool = "brush", brushWidth = 5, selectedColor = "#000";

// Undo and redo stacks to store canvas state snapshots
const undoStack = [], redoStack = [];

const setCanvasBackground = () => {
    // Set canvas background to white
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor; // Set fill style to selected color
};

window.addEventListener("load", () => {
    // Set canvas width/height
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
});

const drawRect = (e) => {
    if (!fillColor.checked) {
        return ctx.strokeRect(
            e.offsetX,
            e.offsetY,
            prevMouseX - e.offsetX,
            prevMouseY - e.offsetY
        );
    }
    ctx.fillRect(
        e.offsetX,
        e.offsetY,
        prevMouseX - e.offsetX,
        prevMouseY - e.offsetY
    );
};

const drawCircle = (e) => {
    ctx.beginPath();
    let radius = Math.sqrt(
        Math.pow(prevMouseX - e.offsetX, 2) + Math.pow(prevMouseY - e.offsetY, 2)
    );
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.push(snapshot); // Push snapshot to undo stack when starting a new drawing action
    redoStack.length = 0; // Clear redo stack when a new drawing action starts
};

const drawing = (e) => {
    if (!isDrawing) return;
    ctx.putImageData(snapshot, 0, 0);

    if (selectedTool === "brush" || selectedTool === "eraser") {
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    } else if (selectedTool === "rectangle") {
        drawRect(e);
    } else if (selectedTool === "circle") {
        drawCircle(e);
    } else {
        drawTriangle(e);
    }
};

toolBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
    });
});

sizeSlider.addEventListener("change", () => (brushWidth = sizeSlider.value));

colorBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        selectedColor = window
            .getComputedStyle(btn)
            .getPropertyValue("--color");
    });
});

colorPicker.addEventListener("change", () => {
    // colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.style.setProperty("--color",colorPicker.value)
    colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
});

saveImg.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
});

undoBtn.addEventListener("click", () => {
    if (undoStack.length > 0) {
        redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height)); // Push current state to redo stack
        ctx.putImageData(undoStack.pop(), 0, 0); // Restore the last snapshot from the undo stack
    }
});

redoBtn.addEventListener("click", () => {
    if (redoStack.length > 0) {
        undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height)); // Push current state to undo stack
        ctx.putImageData(redoStack.pop(), 0, 0); // Restore the last snapshot from the redo stack
    }
});


const updateIconColor = () => {
    const selectedColor = colorPicker.value;
    eyeDropperIcon.style.color = selectedColor;
};

colorPicker.addEventListener("change", updateIconColor);
colorPicker.value = "#000";
updateIconColor();

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => (isDrawing = false));


