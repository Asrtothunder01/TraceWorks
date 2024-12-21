const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let isDrawing = false;
let tool = 'draw'; // Default tool
let startX, startY;

// Event Listeners for Mouse
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Event Listeners for Touch
canvas.addEventListener('touchstart', startTouchDrawing);
canvas.addEventListener('touchmove', drawTouch);
canvas.addEventListener('touchend', stopDrawing);

document.getElementById('draw').addEventListener('click', () => (tool = 'draw'));
document.getElementById('erase').addEventListener('click', () => (tool = 'erase'));
document.getElementById('rectangle').addEventListener('click', () => (tool = 'rectangle'));
document.getElementById('clear').addEventListener('click', clearCanvas);

// Functions for Mouse Drawing
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
    ctx.strokeStyle = '#000'; 
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (tool === 'erase') {
    ctx.clearRect(x - 5, y - 5, 10, 10); // Erase with a small square
  }
}

// Functions for Touch Drawing
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
  e.preventDefault(); // Prevent scrolling while drawing

  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  if (tool === 'draw') {
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000'; // Black color for drawing
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (tool === 'erase') {
    ctx.clearRect(x - 5, y - 5, 10, 10); // Erase with a small square
  }
}

// Stop Drawing (Shared for Mouse and Touch)
function stopDrawing() {
  isDrawing = false;
}

// Clear Canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
                        }￼Enter
