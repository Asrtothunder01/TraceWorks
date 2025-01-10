// Constants
const CONSTANTS = {
  DEFAULT_LINE_WIDTH: 2,
  ERASER_WIDTH: 20,
  ANIMATION_INTERVAL: 100,
  MAX_HISTORY: 50,
  DEBOUNCE_DELAY: 250,
  MIN_LINE_WIDTH: 1,
  MAX_LINE_WIDTH: 50,
};

// Utility Functions
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// State management
const state = {
  ctx: null,
  isDrawing: false,
  lastX: 0,
  lastY: 0,
  currentTool: "pen",
  currentColor: "#000000",
  currentLineWidth: CONSTANTS.DEFAULT_LINE_WIDTH,
  history: [],
  currentStep: -1,
  maxHistory: CONSTANTS.MAX_HISTORY,
  modalOpen: false,
  animationActive: false,
  animationInterval: null,
  magicWandActive: false,
};

// Canvas Operations
const initializeCanvas = () => {
  const whiteboard = document.getElementById("whiteboard");
  if (!whiteboard || !whiteboard.getContext) {
    alert("Canvas not supported in this browser.");
    return false;
  }

  whiteboard.width = whiteboard.offsetWidth;
  whiteboard.height = whiteboard.offsetHeight;

  state.ctx = whiteboard.getContext("2d");
  updateContextStyle();
  return true;
};

const updateContextStyle = () => {
  const { ctx, currentTool, currentColor, currentLineWidth } = state;
  if (!ctx) return;

  ctx.strokeStyle = currentTool === "pen" ? currentColor : "#FFFFFF";
  ctx.lineWidth = currentLineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalCompositeOperation =
    currentTool === "eraser" ? "destination-out" : "source-over";
};

// Magic Wand Tool - Clears the Board
const toggleMagicWand = () => {
  state.magicWandActive = !state.magicWandActive;

  if (state.magicWandActive) {
    alert("Magic Wand Tool Activated! The board will be cleared.");

    const whiteboard = document.getElementById("whiteboard");
    const ctx = whiteboard.getContext("2d");

    whiteboard.addEventListener("click", () => {
      if (!state.magicWandActive) return;

      // Clear the entire canvas
      ctx.clearRect(0, 0, whiteboard.width, whiteboard.height);
    });
  } else {
    alert("Magic Wand Tool Deactivated!");
  }
};

// Animation Functions
const startCustomAnimation = () => {
  if (state.animationActive) return;
  state.animationActive = true;

  const whiteboard = document.getElementById("whiteboard");
  const ctx = whiteboard.getContext("2d");

  state.animationInterval = setInterval(() => {
    // Example: Draw a bouncing circle as an animation
    const time = Date.now() / 1000;
    const x = Math.sin(time) * 100 + whiteboard.width / 2;
    const y = Math.cos(time) * 100 + whiteboard.height / 2;

    ctx.clearRect(0, 0, whiteboard.width, whiteboard.height); // Clear the canvas
    ctx.beginPath();
    ctx.arc(x, y, 50, 0, Math.PI * 2);
    ctx.fillStyle = "#FF0000"; // Red color
    ctx.fill();
    ctx.closePath();
  }, CONSTANTS.ANIMATION_INTERVAL);
};

const stopAnimation = () => {
  if (state.animationInterval) {
    clearInterval(state.animationInterval);
    state.animationInterval = null;
  }
  state.animationActive = false;
};

// Initialization
const initialize = () => {
  if (!initializeCanvas()) return;

  attachDrawingListeners();

  document.getElementById("pen-tool").addEventListener("click", () => switchTool("pen"));
  document.getElementById("eraser-tool").addEventListener("click", () => switchTool("eraser"));
  document.getElementById("color-picker").addEventListener("input", (e) => setColor(e.target.value));
  document.getElementById("line-width").addEventListener("change", (e) => setLineWidth(Number(e.target.value)));

  document.getElementById("magic-wand-tool").addEventListener("click", toggleMagicWand);
  document.getElementById("animation").addEventListener("click", startCustomAnimation);
  document.getElementById("stop-animation").addEventListener("click", stopAnimation);
};

window.onload = initialize;
