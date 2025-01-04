// Get elements
const whiteboard = document.getElementById('whiteboard');
const penTool = document.getElementById('pen-tool');
const eraserTool = document.getElementById('eraser-tool');
const moreToolButton = document.getElementById('more-tool');
const moreModal = document.getElementById('more-modal');
const closeModalButton = document.getElementById('close-modal');
const magicWandTool = document.getElementById('magic-wand-tool');
const colorPicker = document.getElementById('color-picker');
const startAnimationButton = document.getElementById('animation');
const stopAnimationButton = document.getElementById('stop-animation');

let ctx; // Canvas context
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentTool = 'pen';
let animationInterval;

// Initialize canvas
const initializeCanvas = () => {
  if (!whiteboard) {
    console.error('Whiteboard element is not available.');
    return;
  }

  whiteboard.width = whiteboard.offsetWidth;
  whiteboard.height = whiteboard.offsetHeight;
  ctx = whiteboard.getContext('2d');

  // Default drawing settings
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
};

// Handle drawing start
const startDrawing = (x, y) => {
  isDrawing = true;
  [lastX, lastY] = [x, y];
};

// Handle drawing or erasing
const drawOrErase = (x, y) => {
  if (!isDrawing) return;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
  [lastX, lastY] = [x, y];
};

// Handle drawing stop
const stopDrawing = () => {
  isDrawing = false;
  ctx.beginPath();
};

// Switch tools
const switchTool = (tool) => {
  currentTool = tool;
  if (tool === 'pen') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    penTool?.classList.add('active');
    eraserTool?.classList.remove('active');
  } else if (tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 20;
    eraserTool?.classList.add('active');
    penTool?.classList.remove('active');
  }
};

// Resize canvas dynamically
const resizeCanvas = () => {
  const savedImage = ctx.getImageData(0, 0, whiteboard.width, whiteboard.height);
  initializeCanvas();
  ctx.putImageData(savedImage, 0, 0);
};

// Clear canvas
const clearCanvas = () => {
  ctx.clearRect(0, 0, whiteboard.width, whiteboard.height);
};

// Change pen color
const changeColor = (event) => {
  ctx.strokeStyle = event.target.value;
};

// Start animation on the canvas
const startAnimation = () => {
  stopAnimation(); // Stop any previous animation
  animationInterval = setInterval(() => {
    const x1 = Math.random() * whiteboard.width;
    const y1 = Math.random() * whiteboard.height;
    const x2 = Math.random() * whiteboard.width;
    const y2 = Math.random() * whiteboard.height;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }, 100); // Draw a line every 100ms
};

// Stop animation
const stopAnimation = () => {
  clearInterval(animationInterval);
};

// Show the modal
const showModal = () => {
  moreModal?.classList.remove('hidden');
};

// Hide the modal
const hideModal = () => {
  moreModal?.classList.add('hidden');
};

// Toggle animation effect
const toggleAnimationEffect = (isAnimating) => {
  if (isAnimating) {
    whiteboard?.classList.add('canvas-animating');
  } else {
    whiteboard?.classList.remove('canvas-animating');
  }
};

// Event listeners
const addEventListeners = () => {
  // Canvas events
  whiteboard?.addEventListener('mousedown', (e) => startDrawing(e.offsetX, e.offsetY));
  whiteboard?.addEventListener('mousemove', (e) => drawOrErase(e.offsetX, e.offsetY));
  whiteboard?.addEventListener('mouseup', stopDrawing);
  whiteboard?.addEventListener('mouseout', stopDrawing);

  // Touch events
  whiteboard?.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const rect = whiteboard.getBoundingClientRect();
    startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
  });

  whiteboard?.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const rect = whiteboard.getBoundingClientRect();
    drawOrErase(touch.clientX - rect.left, touch.clientY - rect.top);
    e.preventDefault();
  });

  whiteboard?.addEventListener('touchend', stopDrawing);
  whiteboard?.addEventListener('touchcancel', stopDrawing);

  // Tool events
  penTool?.addEventListener('click', () => switchTool('pen'));
  eraserTool?.addEventListener('click', () => switchTool('eraser'));

  // Modal events
  moreToolButton?.addEventListener('click', showModal);
  closeModalButton?.addEventListener('click', hideModal);
  window.addEventListener('click', (e) => {
    if (e.target === moreModal) hideModal();
  });

  // More tools
  magicWandTool?.addEventListener('click', clearCanvas);
  colorPicker?.addEventListener('input', changeColor);
  startAnimationButton?.addEventListener('click', () => {
    startAnimation();
    toggleAnimationEffect(true);
  });
  stopAnimationButton?.addEventListener('click', () => {
    stopAnimation();
    toggleAnimationEffect(false);
  });

  // Resize canvas
  window.addEventListener('resize', resizeCanvas);
};

// Initialize everything
const initialize = () => {
  initializeCanvas();
  addEventListeners();
  switchTool('pen');
};

// Initialize on load
initialize();

const createSparkle = (x, y) => {
  const sparkle = document.createElement('div');
  sparkle.className = 'sparkle';
  sparkle.style.left = `${x}px`;
  sparkle.style.top = `${y}px`;
  document.body.appendChild(sparkle);

  // Remove sparkle after animation
  setTimeout(() => sparkle.remove(), 1000);
};

const createMultipleSparkles = () => {
  const sparkleCount = 30;
  for (let i = 0; i < sparkleCount; i++) {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    createSparkle(x, y);
  }
};

// Attach event listener
magicWandTool.addEventListener('click', () => {
  createMultipleSparkles();
});

document.getElementById('save-tool').addEventListener('click', () => {
  html2canvas(whiteboard).then((canvas) => {
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  });
});

// Check if the user is visiting for the first time
const isFirstVisit = !localStorage.getItem('visited');

// Add onboarding arrow or tooltip
const showOnboarding = () => {
  // Create overlay and arrow container
  const overlay = document.createElement('div');
  overlay.id = 'onboarding-overlay';

  const arrow = document.createElement('div');
  arrow.id = 'onboarding-arrow';
  arrow.innerText = 'Tap here to use the Magic Wand!';

  // Append to body
  document.body.appendChild(overlay);
  document.body.appendChild(arrow);

  // Position the arrow near the Magic Wand button
  const magicWandButton = document.getElementById('magic-wand-tool');
  const rect = magicWandButton.getBoundingClientRect();
  arrow.style.top = `${rect.top - 50}px`;
  arrow.style.left = `${rect.left + rect.width / 2 - arrow.offsetWidth / 2}px`;

  // Remove onboarding on click or timeout
  overlay.addEventListener('click', hideOnboarding);
  setTimeout(hideOnboarding, 5000); // Hide after 5 seconds
};

const hideOnboarding = () => {
  document.getElementById('onboarding-overlay')?.remove();
  document.getElementById('onboarding-arrow')?.remove();
  localStorage.setItem('visited', true); // Mark user as visited
};

// Show onboarding if first visit
if (isFirstVisit) {
  showOnboarding();
}



