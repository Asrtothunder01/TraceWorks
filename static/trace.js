// Constants
const CONSTANTS = {
  DEFAULT_LINE_WIDTH: 2,
  ERASER_WIDTH: 20,
  ANIMATION_INTERVAL: 100,
  SPARKLE_COUNT: 50,
  ONBOARDING_TIMEOUT: 5000
};

// State management
const state = {
  ctx: null,
  isDrawing: false,
  lastX: 0,
  lastY: 0,
  currentTool: 'pen',
  animationInterval: null,
  currentColor: '#000000',
  history: [],
  currentStep: -1,
  maxHistory: 50
};

// Canvas initialization
const initializeCanvas = () => {
  const whiteboard = document.getElementById('whiteboard');
  if (!whiteboard) {
    console.error('Whiteboard element is not available.');
    return;
  }

  whiteboard.width = whiteboard.offsetWidth;
  whiteboard.height = whiteboard.offsetHeight;
  state.ctx = whiteboard.getContext('2d');

  // Default settings
  state.ctx.strokeStyle = state.currentColor;
  state.ctx.lineWidth = CONSTANTS.DEFAULT_LINE_WIDTH;
  state.ctx.lineCap = 'round';
};

// Drawing functions
const startDrawing = (x, y) => {
  state.isDrawing = true;
  [state.lastX, state.lastY] = [x, y];
};

const drawOrErase = (x, y) => {
  if (!state.isDrawing) return;

  state.ctx.beginPath();
  state.ctx.moveTo(state.lastX, state.lastY);
  state.ctx.lineTo(x, y);
  state.ctx.stroke();
  [state.lastX, state.lastY] = [x, y];
};

const stopDrawing = () => {
  if (state.isDrawing) {
    state.isDrawing = false;
    state.ctx.beginPath();
    saveState();
  }
};

// History management
const saveState = () => {
  const imageData = state.ctx.getImageData(0, 0, state.ctx.canvas.width, state.ctx.canvas.height);
  state.currentStep++;
  state.history.splice(state.currentStep);
  state.history.push(imageData);
  
  if (state.history.length > state.maxHistory) {
    state.history.shift();
    state.currentStep--;
  }
};

const undo = () => {
  if (state.currentStep > 0) {
    state.currentStep--;
    state.ctx.putImageData(state.history[state.currentStep], 0, 0);
  }
};

const redo = () => {
  if (state.currentStep < state.history.length - 1) {
    state.currentStep++;
    state.ctx.putImageData(state.history[state.currentStep], 0, 0);
  }
};

// Tool management
const switchTool = (tool) => {
  const penTool = document.getElementById('pen-tool');
  const eraserTool = document.getElementById('eraser-tool');
  state.currentTool = tool;

  if (tool === 'pen') {
    state.ctx.globalCompositeOperation = 'source-over';
    state.ctx.strokeStyle = state.currentColor;
    state.ctx.lineWidth = CONSTANTS.DEFAULT_LINE_WIDTH;
    penTool?.classList.add('active');
    eraserTool?.classList.remove('active');
  } else if (tool === 'eraser') {
    state.ctx.globalCompositeOperation = 'destination-out';
    state.ctx.lineWidth = CONSTANTS.ERASER_WIDTH;
    eraserTool?.classList.add('active');
    penTool?.classList.remove('active');
  }
};

// Canvas utilities
const resizeCanvas = () => {
  const whiteboard = document.getElementById('whiteboard');
  const savedImage = state.ctx.getImageData(0, 0, whiteboard.width, whiteboard.height);
  initializeCanvas();
  state.ctx.putImageData(savedImage, 0, 0);
};

const clearCanvas = () => {
  state.ctx.clearRect(0, 0, state.ctx.canvas.width, state.ctx.canvas.height);
  saveState();
};

// Color management
const changeColor = (event) => {
  state.currentColor = event.target.value;
  if (state.currentTool === 'pen') {
    state.ctx.strokeStyle = state.currentColor;
  }
};

// Animation features
const startAnimation = () => {
  const whiteboard = document.getElementById('whiteboard');
  stopAnimation();
  
  state.animationInterval = setInterval(() => {
    const x1 = Math.random() * whiteboard.width;
    const y1 = Math.random() * whiteboard.height;
    const x2 = Math.random() * whiteboard.width;
    const y2 = Math.random() * whiteboard.height;

    state.ctx.beginPath();
    state.ctx.moveTo(x1, y1);
    state.ctx.lineTo(x2, y2);
    state.ctx.stroke();
  }, CONSTANTS.ANIMATION_INTERVAL);
};

const stopAnimation = () => {
  if (state.animationInterval) {
    clearInterval(state.animationInterval);
    state.animationInterval = null;
    saveState();
  }
};

// Modal management
const toggleMoreModal = () => {
  const moreModal = document.getElementById('more-modal');
  const closeModalButton = document.getElementById('close-modal');

  if (moreModal) {
    moreModal.classList.toggle('hidden');

    const closeModal = () => {
      moreModal.classList.add('hidden');
      removeEventListeners();
    };

    const handleOutsideClick = (e) => {
      if (e.target === moreModal) {
        closeModal();
      }
    };

    const removeEventListeners = () => {
      moreModal.removeEventListener('click', handleOutsideClick);
      closeModalButton?.removeEventListener('click', closeModal);
    };

    moreModal.addEventListener('click', handleOutsideClick);
    closeModalButton?.addEventListener('click', closeModal);
  }
};

// Special effects
const createSparkles = () => {
  const whiteboard = document.getElementById('whiteboard');
  const particles = Array.from({ length: CONSTANTS.SPARKLE_COUNT }, () => ({
    x: Math.random() * whiteboard.width,
    y: Math.random() * whiteboard.height,
    size: Math.random() * 5 + 2,
    speedX: Math.random() * 2 - 1,
    speedY: Math.random() * 2 - 1,
    opacity: 1
  }));

  const animateSparkles = () => {
    state.ctx.clearRect(0, 0, whiteboard.width, whiteboard.height);
    
    particles.forEach((particle, index) => {
      state.ctx.beginPath();
      state.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      state.ctx.fillStyle = `rgba(255, 215, 0, ${particle.opacity})`;
      state.ctx.fill();

      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.opacity -= 0.02;

      if (particle.opacity <= 0) particles.splice(index, 1);
    });

    if (particles.length > 0) {
      requestAnimationFrame(animateSparkles);
    } else {
      saveState();
    }
  };

  animateSparkles();
};

// Onboarding
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

  const hideOnboarding = () => {
    document.getElementById('onboarding-overlay')?.remove();
    document.getElementById('onboarding-arrow')?.remove();
    magicWandButton.style.boxShadow = '';
    localStorage.setItem('visited', true);
  };

  overlay.addEventListener('click', hideOnboarding);
  magicWandButton.addEventListener('click', hideOnboarding);
  setTimeout(hideOnboarding, CONSTANTS.ONBOARDING_TIMEOUT);
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

  // Drawing events
  const handleDrawStart = (e) => {
    const { offsetX, offsetY } = e.type.includes('mouse') 
      ? e 
      : { 
          offsetX: e.touches[0].clientX - whiteboard.getBoundingClientRect().left,
          offsetY: e.touches[0].clientY - whiteboard.getBoundingClientRect().top
        };
    startDrawing(offsetX, offsetY);
  };

  const handleDraw = (e) => {
    const { offsetX, offsetY } = e.type.includes('mouse')
      ? e
      : {
          offsetX: e.touches[0].clientX - whiteboard.getBoundingClientRect().left,
          offsetY: e.touches[0].clientY - whiteboard.getBoundingClientRect().top
        };
    drawOrErase(offsetX, offsetY);
    if (e.type === 'touchmove') e.preventDefault();
  };

  // Mouse events
  whiteboard?.addEventListener('mousedown', handleDrawStart);
  whiteboard?.addEventListener('mousemove', handleDraw);
  whiteboard?.addEventListener('mouseup', stopDrawing);
  whiteboard?.addEventListener('mouseout', stopDrawing);

  // Touch events
  whiteboard?.addEventListener('touchstart', handleDrawStart);
  whiteboard?.addEventListener('touchmove', handleDraw);
  whiteboard?.addEventListener('touchend', stopDrawing);
  whiteboard?.addEventListener('touchcancel', stopDrawing);

  // Tool events
  penTool?.addEventListener('click', () => switchTool('pen'));
  eraserTool?.addEventListener('click', () => switchTool('eraser'));
  magicWandTool?.addEventListener('click', () => {
    clearCanvas();
    createSparkles();
  });
  colorPicker?.addEventListener('input', changeColor);
  startAnimationButton?.addEventListener('click', startAnimation);
  stopAnimationButton?.addEventListener('click', stopAnimation);
  moreTool?.addEventListener('click', toggleMoreModal);

  // Window events
  window.addEventListener('resize', resizeCanvas);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    }
  });
};

// Initialize application
const initialize = () => {
  initializeCanvas();
  addEventListeners();
  switchTool('pen');
  saveState(); // Save initial blank state
  if (!localStorage.getItem('visited')) {
    showOnboarding();
  }
};

// Start the application
initialize();
