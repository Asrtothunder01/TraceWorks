// Constants
const CONSTANTS = {
  DEFAULT_LINE_WIDTH: 2,
  ERASER_WIDTH: 20,
  ANIMATION_INTERVAL: 100,
  SPARKLE_COUNT: 50,
  ONBOARDING_TIMEOUT: 5000,
  MAX_HISTORY: 50,
  DEBOUNCE_DELAY: 250,
  MIN_LINE_WIDTH: 1,
  MAX_LINE_WIDTH: 50
};

// Utility Functions
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
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
  currentLineWidth: CONSTANTS.DEFAULT_LINE_WIDTH,
  history: [],
  currentStep: -1,
  maxHistory: CONSTANTS.MAX_HISTORY,
  isAnimating: false
};

// Canvas Operations
const initializeCanvas = () => {
  try {
    const whiteboard = document.getElementById('whiteboard');
    if (!whiteboard) {
      throw new Error('Canvas element not found');
    }

    // Check for canvas support
    if (!whiteboard.getContext) {
      throw new Error('Canvas not supported in this browser');
    }

    whiteboard.width = whiteboard.offsetWidth;
    whiteboard.height = whiteboard.offsetHeight;

    state.ctx = whiteboard.getContext('2d', { willReadFrequently: true });
    updateContextStyle();
    
    return true;
  } catch (error) {
    console.error('Failed to initialize canvas:', error);
    showError('Failed to initialize drawing board. Please refresh the page.');
    return false;
  }
};

const updateContextStyle = () => {
  if (!state.ctx) return;
  state.ctx.strokeStyle = state.currentColor;
  state.ctx.lineWidth = state.currentLineWidth;
  state.ctx.lineCap = 'round';
  state.ctx.lineJoin = 'round';
};

// State Management
const saveState = debounce(() => {
  try {
    if (!state.ctx) return;
    
    const imageData = state.ctx.getImageData(0, 0, state.ctx.canvas.width, state.ctx.canvas.height);
    
    // Manage history size
    if (state.history.length >= state.maxHistory) {
      state.history.shift();
      state.currentStep--;
    }
    
    // Remove any states after current step if we're in middle of history
    state.history = state.history.slice(0, state.currentStep + 1);
    state.history.push(imageData);
    state.currentStep = state.history.length - 1;
  } catch (error) {
    console.error('Failed to save state:', error);
    showError('Failed to save your latest changes');
  }
}, CONSTANTS.DEBOUNCE_DELAY);

const loadState = () => {
  try {
    if (!state.ctx || state.currentStep < 0) return;
    state.ctx.putImageData(state.history[state.currentStep], 0, 0);
  } catch (error) {
    console.error('Failed to load state:', error);
    showError('Failed to restore previous state');
  }
};

// Drawing Operations
const startDrawing = (x, y) => {
  state.isDrawing = true;
  [state.lastX, state.lastY] = [x, y];
};

const draw = (x, y) => {
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
    saveState();
  }
};

// Tool Operations
const switchTool = (tool) => {
  state.currentTool = tool;
  state.ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
  state.currentLineWidth = tool === 'eraser' ? CONSTANTS.ERASER_WIDTH : CONSTANTS.DEFAULT_LINE_WIDTH;
  updateContextStyle();
};

const setColor = (color) => {
  state.currentColor = color;
  if (state.currentTool !== 'eraser') {
    updateContextStyle();
  }
};

const setLineWidth = (width) => {
  state.currentLineWidth = Math.min(Math.max(width, CONSTANTS.MIN_LINE_WIDTH), CONSTANTS.MAX_LINE_WIDTH);
  updateContextStyle();
};

// Undo/Redo Operations
const undo = () => {
  if (state.currentStep > 0) {
    state.currentStep--;
    loadState();
  }
};

const redo = () => {
  if (state.currentStep < state.history.length - 1) {
    state.currentStep++;
    loadState();
  }
};

// Save and Share Operations
const saveDrawing = () => {
  try {
    const whiteboard = document.getElementById('whiteboard');
    const drawingData = whiteboard.toDataURL();
    localStorage.setItem('drawing', drawingData);
    showSuccess('Drawing saved successfully!');
  } catch (error) {
    console.error('Failed to save drawing:', error);
    showError('Failed to save drawing');
  }
};

const shareDrawing = async () => {
  try {
    const whiteboard = document.getElementById('whiteboard');
    const drawingData = whiteboard.toDataURL();

    const response = await fetch('/api/share/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
      },
      body: JSON.stringify({ drawing: drawingData })
    });

    const data = await response.json();
    if (data.share_url) {
      showSuccess(`Drawing shared! URL: ${data.share_url}`);
    } else {
      throw new Error('No share URL received');
    }
  } catch (error) {
    console.error('Failed to share drawing:', error);
    showError('Failed to share drawing');
  }
};

// Window Resize Handling
const handleResize = debounce(() => {
  const whiteboard = document.getElementById('whiteboard');
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  
  // Save current drawing
  tempCanvas.width = whiteboard.width;
  tempCanvas.height = whiteboard.height;
  tempCtx.drawImage(whiteboard, 0, 0);
  
  // Resize canvas
  whiteboard.width = whiteboard.offsetWidth;
  whiteboard.height = whiteboard.offsetHeight;
  
  // Restore drawing
  state.ctx.drawImage(tempCanvas, 0, 0);
}, CONSTANTS.DEBOUNCE_DELAY);

// Animation Effects
const startAnimation = () => {
  if (state.isAnimating) return;
  
  state.isAnimating = true;
  let hue = 0;
  
  state.animationInterval = setInterval(() => {
    hue = (hue + 1) % 360;
    state.currentColor = `hsl(${hue}, 100%, 50%)`;
    updateContextStyle();
  }, CONSTANTS.ANIMATION_INTERVAL);
};

const stopAnimation = () => {
  if (state.animationInterval) {
    clearInterval(state.animationInterval);
    state.animationInterval = null;
  }
  state.isAnimating = false;
  state.currentColor = document.getElementById('color-picker').value;
  updateContextStyle();
};

// UI Feedback
const showError = (message) => {
  // Implement your preferred error notification system
  alert(message);
};

const showSuccess = (message) => {
  // Implement your preferred success notification system
  alert(message);
};

// Event Handlers
const setupEventListeners = () => {
  const whiteboard = document.getElementById('whiteboard');
  
  // Mouse events
  whiteboard.addEventListener('mousedown', (e) => {
    startDrawing(e.offsetX, e.offsetY);
  });
  
  whiteboard.addEventListener('mousemove', (e) => {
    draw(e.offsetX, e.offsetY);
  });
  
  whiteboard.addEventListener('mouseup', stopDrawing);
  whiteboard.addEventListener('mouseleave', stopDrawing);
  
  // Touch events
  whiteboard.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = whiteboard.getBoundingClientRect();
    startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
  });
  
  whiteboard.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = whiteboard.getBoundingClientRect();
    draw(touch.clientX - rect.left, touch.clientY - rect.top);
  });
  
  whiteboard.addEventListener('touchend', stopDrawing);
  
  // Tool buttons
  document.getElementById('pen-tool').addEventListener('click', () => switchTool('pen'));
  document.getElementById('eraser-tool').addEventListener('click', () => switchTool('eraser'));
  document.getElementById('save-tool').addEventListener('click', saveDrawing);
  document.getElementById('share-tool').addEventListener('click', shareDrawing);
  
  // Color picker
  const colorPicker = document.getElementById('color-picker');
  colorPicker.addEventListener('change', (e) => setColor(e.target.value));
  colorPicker.addEventListener('input', (e) => setColor(e.target.value));
  
  // Animation controls
  document.getElementById('animation').addEventListener('click', startAnimation);
  document.getElementById('stop-animation').addEventListener('click', stopAnimation);
  
  // Modal controls
  const moreBtn = document.getElementById('more-tool');
  const moreModal = document.getElementById('more-modal');
  const closeModal = document.getElementById('close-modal');
  
  moreBtn.addEventListener('click', () => {
    moreModal.classList.remove('hidden');
  });
  
  closeModal.addEventListener('click', () => {
    moreModal.classList.add('hidden');
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
        case 's':
          e.preventDefault();
          saveDrawing();
          break;
      }
    }
  });
  
  // Window resize
  window.addEventListener('resize', handleResize);
};

// Initialization
const initialize = () => {
  if (!initializeCanvas()) return;
  setupEventListeners();
  saveState(); // Save initial blank state
  
  // Load saved drawing if exists
  const savedDrawing = localStorage.getItem('drawing');
  if (savedDrawing) {
    const img = new Image();
    img.onload = () => {
      state.ctx.drawImage(img, 0, 0);
      saveState();
    };
    img.src = savedDrawing;
  }
};

// Start the application when the window loads
window.onload = initialize;