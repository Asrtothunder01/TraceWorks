// Global Variables
let ctx; // Canvas context
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentTool = 'pen';
let animationInterval;

// Check if the user is visiting for the first time
const isFirstVisit = !localStorage.getItem('visited');

// Initialize canvas
const initializeCanvas = () => {
  const whiteboard = document.getElementById('whiteboard');
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

// Drawing functionality
const startDrawing = (x, y) => {
  isDrawing = true;
  [lastX, lastY] = [x, y];
};

const drawOrErase = (x, y) => {
  if (!isDrawing) return;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
  [lastX, lastY] = [x, y];
};

const stopDrawing = () => {
  isDrawing = false;
  ctx.beginPath();
};

// Tool switching
const switchTool = (tool) => {
  const penTool = document.getElementById('pen-tool');
  const eraserTool = document.getElementById('eraser-tool');
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

// Canvas resizing
const resizeCanvas = () => {
  const whiteboard = document.getElementById('whiteboard');
  const savedImage = ctx.getImageData(0, 0, whiteboard.width, whiteboard.height);
  initializeCanvas();
  ctx.putImageData(savedImage, 0, 0);
};

// Clear canvas
const clearCanvas = () => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

// Change pen color
const changeColor = (event) => {
  ctx.strokeStyle = event.target.value;
};

// Animation functionality
const startAnimation = () => {
  const whiteboard = document.getElementById('whiteboard');
  stopAnimation();
  animationInterval = setInterval(() => {
    const x1 = Math.random() * whiteboard.width;
    const y1 = Math.random() * whiteboard.height;
    const x2 = Math.random() * whiteboard.width;
    const y2 = Math.random() * whiteboard.height;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }, 100);
};

const stopAnimation = () => {
  clearInterval(animationInterval);
};

// Modal toggle functionality
const toggleMoreModal = () => {
  const moreModal = document.getElementById('more-modal');
  const closeModalButton = document.getElementById('close-modal');

  if (moreModal) {
    moreModal.classList.toggle('hidden');
    closeModalButton?.addEventListener('click', () => moreModal.classList.add('hidden'));

    const modalButtons = moreModal.querySelectorAll('button');
    modalButtons.forEach((button) =>
      button.addEventListener('click', () => moreModal.classList.add('hidden'))
    );
  }
};

// Onboarding functionality
const showOnboarding = () => {
  const magicWandButton = document.getElementById('magic-wand-tool');
  if (!magicWandButton) return;

  const overlay = document.createElement('div');
  overlay.id = 'onboarding-overlay';

  const arrow = document.createElement('div');
  arrow.id = 'onboarding-arrow';
  arrow.innerText = 'Tap here to clear the canvas with the Magic Wand!';

  document.body.appendChild(overlay);
  document.body.appendChild(arrow);

  const rect = magicWandButton.getBoundingClientRect();
  arrow.style.top = `${rect.top - 50}px`;
  arrow.style.left = `${rect.left + rect.width / 2 - arrow.offsetWidth / 2}px`;

  magicWandButton.style.boxShadow = '0px 0px 15px 3px rgba(0, 255, 0, 0.7)';
  magicWandButton.style.transition = 'box-shadow 0.3s ease-in-out';

  overlay.addEventListener('click', hideOnboarding);
  magicWandButton.addEventListener('click', hideOnboarding);

  setTimeout(hideOnboarding, 5000);
};

const hideOnboarding = () => {
  document.getElementById('onboarding-overlay')?.remove();
  document.getElementById('onboarding-arrow')?.remove();
  const magicWandButton = document.getElementById('magic-wand-tool');
  magicWandButton.style.boxShadow = '';
  localStorage.setItem('visited', true);
};

// Magical sparkle effect
const createSparkles = () => {
  const whiteboard = document.getElementById('whiteboard');
  const particles = [];

  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * whiteboard.width,
      y: Math.random() * whiteboard.height,
      size: Math.random() * 5 + 2,
      speedX: Math.random() * 2 - 1,
      speedY: Math.random() * 2 - 1,
      opacity: 1,
    });
  }

  const animateSparkles = () => {
    ctx.clearRect(0, 0, whiteboard.width, whiteboard.height);
    particles.forEach((particle, index) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${particle.opacity})`;
      ctx.fill();

      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.opacity -= 0.02;

      if (particle.opacity <= 0) particles.splice(index, 1);
    });

    if (particles.length > 0) requestAnimationFrame(animateSparkles);
  };

  animateSparkles();
};

const magicWandAction = () => {
  clearCanvas();
  createSparkles();
};

// Event listeners
const addEventListeners = () => {
  const whiteboard = document.getElementById('whiteboard');
  const penTool = document.getElementById('pen-tool');
  const eraserTool = document.getElementById('eraser-tool');
  const magicWandTool = document.getElementById('magic-wand-tool');
  const colorPicker = document.getElementById('color-picker');
  const startAnimationButton = document.getElementById('animation');
  const stopAnimationButton = document.getElementById('stop-animation');
  const moreTool = document.getElementById('more-tool');

  whiteboard?.addEventListener('mousedown', (e) => startDrawing(e.offsetX, e.offsetY));
  whiteboard?.addEventListener('mousemove', (e) => drawOrErase(e.offsetX, e.offsetY));
  whiteboard?.addEventListener('mouseup', stopDrawing);
  whiteboard?.addEventListener('mouseout', stopDrawing);

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

  penTool?.addEventListener('click', () => switchTool('pen'));
  eraserTool?.addEventListener('click', () => switchTool('eraser'));

  magicWandTool?.addEventListener('click', magicWandAction);

  colorPicker?.addEventListener('input', changeColor);

  startAnimationButton?.addEventListener('click', startAnimation);
  stopAnimationButton?.addEventListener('click', stopAnimation);

  moreTool?.addEventListener('click', toggleMoreModal);

  window.addEventListener('resize', resizeCanvas);
};

// Initialize application
const initialize = () => {
  initializeCanvas();
  addEventListeners();
  switchTool('pen');
  if (isFirstVisit) showOnboarding();
};

// Initialize on load
initialize();
