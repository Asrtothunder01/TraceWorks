// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", () => {
  // Initialize features
  initTypewriterEffect();
  initButtonHoverEffects();
  initSmoothScroll();
  updateFooterYear();
  addThemeToggle();
  enableFuturisticBackground();
});

// Typewriter effect for the header
function initTypewriterEffect() {
  const headerText = "Welcome to TraceWork";
  const headerElement = document.querySelector("header h1");
  if (!headerElement) return; // Ensure the element exists

  let index = 0;

  function typeWriter() {
    if (index < headerText.length) {
      headerElement.textContent += headerText.charAt(index);
      index++;
      setTimeout(typeWriter, 100); // Adjust typing speed here
    }
  }

  headerElement.textContent = ""; // Clear initial content
  typeWriter();
}

// Button hover animations
function initButtonHoverEffects() {
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((button) => {
    button.style.transition = "transform 0.3s ease, box-shadow 0.3s ease"; // Add smooth transitions

    button.addEventListener("mouseenter", () => {
      button.style.transform = "scale(1.1)";
      button.style.boxShadow = "0px 4px 20px rgba(0, 123, 255, 0.5)";
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "scale(1)";
      button.style.boxShadow = "none";
    });
  });
}

// Smooth scroll to the drawing page
function initSmoothScroll() {
  const button = document.querySelector(".btn");
  if (!button) return; // Ensure the element exists

  button.addEventListener("click", (e) => {
    e.preventDefault();
    const targetUrl = button.getAttribute("href");
    if (targetUrl) {
      window.location.href = targetUrl;
    }
  });
}

// Dynamic footer year update
function updateFooterYear() {
  const footer = document.querySelector("footer p");
  if (footer) {
    const currentYear = new Date().getFullYear();
    footer.textContent = `© ${currentYear} TraceWork | Designed by Olorunfemi. All rights reserved.`;
  }
}

// Add futuristic background animation
function enableFuturisticBackground() {
  document.addEventListener("mousemove", (e) => {
    const body = document.body;
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    body.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, #1e1e1e, #000000)`;
  });
}

// Add light-dark theme toggle
function addThemeToggle() {
  const themeToggle = document.createElement("button");
  themeToggle.textContent = "Toggle Theme";
  themeToggle.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    background: #007bff;
    color: #fff;
    cursor: pointer;
    transition: background 0.3s ease;
  `;

  document.body.appendChild(themeToggle);

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    themeToggle.textContent = document.body.classList.contains("dark-theme")
      ? "Light Theme"
      : "Dark Theme";
  });
}
