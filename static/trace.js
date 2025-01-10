// Whiteboard State
const state = {
  ctx: null,
  isDrawing: false,
  lastX: 0,
  lastY: 0,
  history: [],
  maxHistory: 10,
  lineWidth: 5,
  strokeStyle: "#000000",
  animationInterval: null,
  eraserMode: false,
  defaultLineWidth: 5,
  eraserLineWidth: 20,
  magicWandSelection: null, // Store selection mask
};

// Initialize the whiteboard
const initializeWhiteboard = () => {
  const whiteboard = document.getElementById("whiteboard");
  if (!whiteboard) {
    console.error("Whiteboard canvas not found.");
    return;
  }

  // Set canvas size
  whiteboard.width = whiteboard.offsetWidth;
  whiteboard.height = whiteboard.offsetHeight;

  // Initialize context
  state.ctx = whiteboard.getContext("2d");
  if (!state.ctx) {
    console.error("Failed to initialize canvas context.");
    return;
  }

  // Set initial styles
  updateContextStyle();

  // Attach listeners
  attachDrawingListeners();
  addResizeListener();
  attachModalControls();
  attachMoreToolsListeners();
  attachMainToolsListeners();
};

// Update drawing context styles
const updateContextStyle = () => {
  const { ctx, lineWidth, strokeStyle } = state;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.strokeStyle = strokeStyle;
};

// Attach main tools listeners
const attachMainToolsListeners = () => {
  // Pen Tool
  document.getElementById("pen-tool").addEventListener("click", () => {
    toggleEraser(false);
    document.getElementById("pen-tool").classList.add("active");
    document.getElementById("eraser-tool").classList.remove("active");
  });

  // Eraser Tool
  document.getElementById("eraser-tool").addEventListener("click", () => {
    toggleEraser(true);
    document.getElementById("eraser-tool").classList.add("active");
    document.getElementById("pen-tool").classList.remove("active");
  });

  // Save Tool
  document.getElementById("save-tool").addEventListener("click", () => {
    const whiteboard = document.getElementById("whiteboard");
    const dataUrl = whiteboard.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "whiteboard-drawing.png";
    link.href = dataUrl;
    link.click();
  });

  // Share Tool
  document.getElementById("share-tool").addEventListener("click", () => {
    const whiteboard = document.getElementById("whiteboard");
    whiteboard.toBlob((blob) => {
      const file = new File([blob], "whiteboard-drawing.png", { type: "image/png" });
      if (navigator.share) {
        navigator
          .share({
            files: [file],
            title: "Whiteboard Drawing",
            text: "Check out my whiteboard drawing!",
          })
          .catch(console.error);
      } else {
        alert("Sharing is not supported on this browser. You can save the drawing instead!");
      }
    });
  });
};

// Toggle between pen and eraser
const toggleEraser = (isEraser) => {
  state.eraserMode = isEraser;
  state.ctx.lineWidth = isEraser ? state.eraserLineWidth : state.defaultLineWidth;
  state.ctx.strokeStyle = isEraser ? "#FFFFFF" : state.strokeStyle;
};

// Save the current canvas state to history
const saveToHistory = () => {
  const whiteboard = document.getElementById("whiteboard");
  if (state.history.length >= state.maxHistory) state.history.shift();
  state.history.push(whiteboard.toDataURL());
};

// Attach drawing listeners
const attachDrawingListeners = () => {
  const whiteboard = document.getElementById("whiteboard");

  const startDrawing = (e) => {
    e.preventDefault();
    const { offsetX, offsetY } = getEventOffset(e);
    state.isDrawing = true;
    state.lastX = offsetX;
    state.lastY = offsetY;
  };

  const draw = (e) => {
    e.preventDefault();
    if (!state.isDrawing) return;

    const { offsetX, offsetY } = getEventOffset(e);
    const { ctx } = state;

    if (!ctx) {
      console.error("Drawing context is not initialized.");
      return;
    }

    ctx.beginPath();
    ctx.moveTo(state.lastX, state.lastY);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();

    state.lastX = offsetX;
    state.lastY = offsetY;
  };

  const stopDrawing = (e) => {
    e.preventDefault();
    if (!state.isDrawing) return;

    state.isDrawing = false;
    saveToHistory(); // Save canvas state to history
  };

  const getEventOffset = (e) => {
    const rect = whiteboard.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      return {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top,
      };
    }
    return {
      offsetX: e.offsetX,
      offsetY: e.offsetY,
    };
  };

  whiteboard.addEventListener("mousedown", startDrawing);
  whiteboard.addEventListener("mousemove", draw);
  whiteboard.addEventListener("mouseup", stopDrawing);
  whiteboard.addEventListener("mouseleave", stopDrawing);

  // For touch devices
  whiteboard.addEventListener("touchstart", startDrawing);
  whiteboard.addEventListener("touchmove", draw);
  whiteboard.addEventListener("touchend", stopDrawing);
};

// Resize canvas dynamically
const addResizeListener = () => {
  const whiteboard = document.getElementById("whiteboard");
  window.addEventListener("resize", () => {
    const oldData = whiteboard.toDataURL();
    whiteboard.width = whiteboard.offsetWidth;
    whiteboard.height = whiteboard.offsetHeight;
    updateContextStyle();

    // Restore previous drawing
    const img = new Image();
    img.onload = () => state.ctx.drawImage(img, 0, 0);
    img.src = oldData;
  });
};

// Modal controls for additional tools
const attachModalControls = () => {
  const moreToolButton = document.getElementById("more-tool");
  const closeModalButton = document.getElementById("close-modal");
  const modal = document.getElementById("more-modal");

  // Show the modal when the "More" button is clicked
  moreToolButton.addEventListener("click", () => {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  });

  // Close the modal when the close button is clicked
  closeModalButton.addEventListener("click", () => {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  });

  // Optional: Close the modal if the user clicks outside of it
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
    }
  });
};

// Attach listeners for additional tools (e.g., Magic Wand, Color Picker, etc.)
const attachMoreToolsListeners = () => {
  // Magic Wand Tool
  document.getElementById("magic-wand-tool").addEventListener("click", () => {
    alert("Magic Wand Tool activated!");
  });

  // Color Picker Tool
  document.getElementById("color-picker").addEventListener("input", (e) => {
    state.strokeStyle = e.target.value;
    if (!state.eraserMode) {
      updateContextStyle();
    }
  });

  // Animation Start Button
  document.getElementById("animation").addEventListener("click", () => {
    alert("Animation started!");
  });

  // Animation Stop Button
  document.getElementById("stop-animation").addEventListener("click", () => {
    alert("Animation stopped!");
  });
};

// Initialize the application
window.onload = () => {
  initializeWhiteboard();
};
