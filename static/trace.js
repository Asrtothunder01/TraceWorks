// DOM Element
const canvas = document.getElementById('whiteboard');
const context = canvas.getContext('2d');
const toolbar = document.querySelector('.toolbar');
const modal = document.getElementById('more-modal');
const openModalBtn = document.getElementById('more-tool');
const closeModalBtn = document.getElementById('close-modal');
const colorPicker = document.getElementById('color-picker');
const startAnimationBtn = document.getElementById('animation');
const stopAnimationBtn = document.getElementById('stop-animation');
const magicWandBtn = document.getElementById('magic-wand-tool');

// State
let isDrawing = false;
let currentTool = 'pen';
let currentColor = '#000000';
let currentLineWidth = 2;
let animationFrameId = null;

// Setup Canvas Dimensions
function setCanvasSize() {
  canvas.width = window.innerWidth * 0.9;
  canvas.height = window.innerHeight * 0.8;
}
setCanvasSize();
window.addEventListener('resize', setCanvasSize);

// Helper to Get Event Coordinates for Mouse and Touch
function getEventCoordinates(event) {
  if (event.touches) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.touches[0].clientX - rect.left,
      y: event.touches[0].clientY - rect.top,
    };
  }
  return { x: event.offsetX, y: event.offsetY };
}

// Drawing Functions
function startDrawing(event) {
  isDrawing = true;
  const { x, y } = getEventCoordinates(event);
  context.beginPath();
  context.moveTo(x, y);
  event.preventDefault(); // Prevent touch scrolling
}

function draw(event) {
  if (!isDrawing) return;

  const { x, y } = getEventCoordinates(event);
  if (currentTool === 'pen') {
    context.strokeStyle = currentColor;
    context.lineWidth = currentLineWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineTo(x, y);
    context.stroke();
  } else if (currentTool === 'eraser') {
    context.strokeStyle = '#ffffff';
    context.lineWidth = 20; // Eraser size
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineTo(x, y);
    context.stroke();
  }
  event.preventDefault(); // Prevent touch scrolling
}

function stopDrawing(event) {
  if (isDrawing) {
    context.closePath();
    isDrawing = false;
  }
  event.preventDefault(); // Prevent touch scrolling
}

// Tool Selection
toolbar.addEventListener('click', (event) => {
  const toolBtn = event.target.closest('.tool-btn');
  if (!toolBtn) return;

  // Remove active state from all buttons
  document.querySelectorAll('.tool-btn').forEach((btn) => btn.classList.remove('active'));

  // Set the active tool
  toolBtn.classList.add('active');
  currentTool = toolBtn.id === 'pen-tool' ? 'pen' :
                toolBtn.id === 'eraser-tool' ? 'eraser' : currentTool;

  if (currentTool === 'save-tool') saveCanvas();
  if (currentTool === 'share-tool') shareCanvas();
});

// Save the Canvas as an Image
function saveCanvas() {
  html2canvas(canvas).then((canvasImage) => {
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvasImage.toDataURL();
    link.click();
  });
}

// Share Canvas (Dummy Example)
function shareCanvas() {
  alert('Sharing feature coming soon!');
}

// Modal Management
openModalBtn.addEventListener('click', () => {
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  closeModalBtn.focus();
});

closeModalBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  openModalBtn.focus();
});

// Change Color
colorPicker.addEventListener('input', (event) => {
  currentColor = event.target.value;
});

// Animation Effect
function animate() {
  context.save();
  context.globalAlpha = 0.05;
  context.fillStyle = currentColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.restore();

  animationFrameId = requestAnimationFrame(animate);
}

startAnimationBtn.addEventListener('click', () => {
  if (!animationFrameId) animate();
});

stopAnimationBtn.addEventListener('click', () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    alert("Animation stopped.");
  }
});

// Magic Wand Effect
function magicWandEffect() {
  const gradient = context.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 50,
    canvas.width / 2, canvas.height / 2, 300
  );
  gradient.addColorStop(0, 'rgba(255, 0, 255, 0.8)');
  gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 255, 0, 0.3)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  alert("Magic Wand effect applied!");
}

magicWandBtn.addEventListener('click', magicWandEffect);

// Event Listeners for Canvas
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch Event Listeners for Canvas
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchcancel', stopDrawing);

// Utility to clear the whiteboard
function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

// Dark Theme Toggle
document.addEventListener('keydown', (event) => {
  if (event.key === 'd') {
    document.body.classList.toggle('dark-theme');
  }
});
