const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageUploader = document.getElementById('image-uploader');

let isDrawing = false;
let tool = 'draw'; 
let startX, startY;


canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch for Mobile
canvas.addEventListener('touchstart', startTouchDrawing);
canvas.addEventListener('touchmove', drawTouch);
canvas.addEventListener('touchend', stopDrawing);

document.getElementById('draw').addEventListener('click', () => (tool = 'draw'));
document.getElementById('erase').addEventListener('click', () => (tool = 'erase'));
document.getElementById('rectangle').addEventListener('click', () => (tool = 'rectangle'));
document.getElementById('clear').addEventListener('click', clearCanvas);
document.getElementById('save').addEventListener('click', saveCanvas);

// Image Upload Event
imageUploader.addEventListener('change', uploadImage);


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
    ctx.strokeStyle = '#000'; // Black color
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (tool === 'erase') {
    ctx.clearRect(x - 5, y - 5, 10, 10); // Small square for erasing
  } else if (tool === 'rectangle') {
    // Prevent drawing rectangles during drag
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(startX, startY, x - startX, y - startY);
  }
}

function stopDrawing(e) {
  if (isDrawing && tool === 'rectangle') {
    const x = e.offsetX;
    const y = e.offsetY;

    // Draw final rectangle
    ctx.strokeStyle = '#000'; // Black color
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, x - startX, y - startY);
  }
  isDrawing = false;
}

function startTouchDrawing(e) {
  e.preventDefault(); // Prevent scrolling
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
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (tool === 'erase') {
    ctx.clearRect(x - 5, y - 5, 10, 10);
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function saveCanvas() {
  const link = document.createElement('a');
  link.download = 'canvas-image.png'; // Set default file name
  link.href = canvas.toDataURL('image/png'); // Convert canvas to image
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
