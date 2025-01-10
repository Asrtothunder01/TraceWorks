// Get Canvas and Controls
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageUploader = document.getElementById('image-uploader');
const colorPicker = document.getElementById('color-picker');

// State Variables
let isDrawing = false;
let tool = 'draw';
let startX, startY;
let currentColor = '#000000'; // Default color

// Temporary Canvas for Rectangle Tool
const tempCanvas = document.createElement('canvas');
tempCanvas.width = canvas.width;
tempCanvas.height = canvas.height;
const tempCtx = tempCanvas.getContext('2d');

// Tool Management
const tools = {
  draw: () => (tool = 'draw'),
  erase: () => (tool = 'erase'),
  rectangle: () => (tool = 'rectangle'),
};

// Tool Event Listeners
Object.keys(tools).forEach(toolName => {
  document.getElementById(toolName).addEventListener('click', tools[toolName]);
});

document.getElementById('clear').addEventListener('click', clearCanvas);
document.getElementById('save').addEventListener('click', saveCanvas);
imageUploader.addEventListener('change', uploadImage);
colorPicker.addEventListener('input', (e) => {
  currentColor = e.target.value;
});

// Canvas Events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', throttle(draw, 50));
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch Events for Mobile
canvas.addEventListener('touchstart', startTouchDrawing);
canvas.addEventListener('touchmove', throttle(drawTouch, 50));
canvas.addEventListener('touchend', stopDrawing);

// Functions
function startDrawing(e) {
  isDrawing = true;
  startX = e.offsetX;
  startY = e.offsetY;

  if (tool === 'draw') {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
  }
}

function draw(e) {
  if (!isDrawing) return;

  const x = e.offsetX;
  const y = e.offsetY;

  if (tool === 'draw') {
    ctx.lineTo(x, y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (tool === 'erase') {
    ctx.clearRect(x - 5, y - 5, 10, 10);
  } else if (tool === 'rectangle') {
    tempCtx.drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, x - startX, y - startY);
  }
}

function stopDrawing(e) {
  if (isDrawing && tool === 'rectangle') {
    const x = e.offsetX;
    const y = e.offsetY;
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, x - startX, y - startY);
  }
  isDrawing = false;
}

function startTouchDrawing(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  startX = touch.clientX - rect.left;
  startY = touch.clientY - rect.top;

  isDrawing = true;

  if (tool === 'draw') {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
  }
}

function drawTouch(e) {
  if (!isDrawing) return;
  e.preventDefault();

  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  if (tool === 'draw') {
    ctx.lineTo(x, y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (tool === 'erase') {
    ctx.clearRect(x - 5, y - 5, 10, 10);
  }
}

function clearCanvas() {
  console.log("Clear button clicked");
  if (!ctx) {
    console.error("Canvas context not initialized");
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
  console.log("Canvas cleared");
}

function saveCanvas() {
  const link = document.createElement('a');
  link.download = 'canvas-image.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function uploadImage(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = event.target.result;
  };

  if (file) {
    reader.readAsDataURL(file);
  }
}

function throttle(func, limit) {
  let lastFunc, lastRan;
  return function (...args) {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

// API Calls
fetch('/api/project/')
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch project data');
    }
    return response.json();
  })
  .then(data => console.log('Project:', data))
  .catch(error => console.error('Error:', error));

fetch('/api/image/1/')
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch image data');
    }
    return response.json();
  })
  .then(data => console.log('Images:', data))
  .catch(error => console.error('Error:', error));

const annotationData = { image_id: 1, annotation_data: { shapes: 'Example data' } };

fetch('/api/annotation/', {  
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(annotationData),
})
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to save annotation');
    }
    return response.json();
  })
  .then(data => console.log('Annotation Response:', data.message))
  .catch(error => console.error('Error:', error));
