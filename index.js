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


canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);

document.getElementById('draw').addEventListener('click', () => (tool = 'draw'));
document.getElementById('erase').addEventListener('click', () => (tool = 'erase'));
document.getElementById('rectangle').addEventListener('click', () => (tool = 'rectangle'));
document.getElementById('clear').addEventListener('click', clearCanvas);
document.getElementById('save').addEventListener('click', saveCanvas);
imageUploader.addEventListener('change', uploadImage);


function getEventPosition(e) {
  if (e.touches) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    };
  } else {
    return { x: e.offsetX, y: e.offsetY };
  }
}

function startDrawing(e) {
  isDrawing = true;
  const pos = getEventPosition(e);
  startX = pos.x;
  startY = pos.y;
  if (tool === 'draw') ctx.beginPath();
}

function draw(e) {
  if (!isDrawing) return;

  const pos = getEventPosition(e);

  if (tool === 'draw') {
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (tool === 'erase') {
    ctx.clearRect(pos.x - 5, pos.y - 5, 10, 10);
  } else if (tool === 'rectangle') {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Dynamic rectangle
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, pos.x - startX, pos.y - startY);
  }
}

function stopDrawing(e) {
  if (tool === 'rectangle' && isDrawing) {
    const pos = getEventPosition(e);
    ctx.strokeRect(startX, startY, pos.x - startX, pos.y - startY);
  }
  isDrawing = false;
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function saveCanvas() {
  const link = document.createElement('a');
  link.download = 'NeoCanvas.png';
  link.href = canvas.toDataURL();
  link.click();
}

function uploadImage(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}￼Enter
