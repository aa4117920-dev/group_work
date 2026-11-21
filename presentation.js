document.addEventListener("DOMContentLoaded", () => {
  const navButtons = document.querySelectorAll("#presenation-nav .pr-btn");
  const textBlock = document.getElementById("presenation-block");
  const controlButtons = document.querySelectorAll("#present-button-section .function-btn");

  const backBtn = controlButtons[0];
  const nextBtn = controlButtons[1];

  let currentKey = "p1"; // Default P1
  let currentLineIndex = 0;

  // Fade-in animation ke sath text update karne ka function
  function renderLine() {
    const currentPara = presentationDB[currentKey];
    if (!currentPara || !currentPara.lines.length) return;

    textBlock.textContent = currentPara.lines[currentLineIndex];

    // Smooth fade-in + slight upward slide effect
    textBlock.animate(
      [
        { opacity: 0, transform: "translateY(8px)" },
        { opacity: 1, transform: "translateY(0)" }
      ],
      {
        duration: 400,
        easing: "ease-out",
        fill: "forwards"
      }
    );

    // Back / Next buttons ki state update karein
    backBtn.disabled = currentLineIndex === 0;
    nextBtn.disabled = currentLineIndex === currentPara.lines.length - 1;
  }

  // P1, P2, P3 buttons par click event
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedKey = btn.textContent.trim().toLowerCase(); // "p1", "p2", "p3"
      if (presentationDB[selectedKey]) {
        currentKey += selectedKey;
        currentLineIndex = 0; // Naya paragraph select hote hi pehli line se shuru ho
        renderLine();
      }
    });
  });

  // Next button: agle subline par jayein
  nextBtn.addEventListener("click", () => {
    const lines = presentationDB[currentKey].lines;
    if (currentLineIndex < lines.length - 1) {
      currentLineIndex++;
      renderLine();
    }
  });

  // Back button: pichli subline par jayein
  backBtn.addEventListener("click", () => {
    if (currentLineIndex > 0) {
      currentLineIndex--;
      renderLine();
    }
  });

  // Page load hote hi P1 ki pehli line show karein
  renderLine();
});
function initPresentation() {
  const navButtons = document.querySelectorAll("#presenation-nav .pr-btn");
  const textBlock = document.getElementById("presenation-block");
  const controlButtons = document.querySelectorAll("#present-button-section .function-btn");

  if (!textBlock || controlButtons.length < 2 || typeof presentationDB === "undefined") {
    return;
  }

  const backBtn = controlButtons[0];
  const nextBtn = controlButtons[1];

  // Paragraph keys ki list (p1, p2, p3...)
  const paraKeys = Object.keys(presentationDB);
  let currentParaIdx = 0;
  let currentLineIndex = 0;

  function updateActiveNavButton() {
    const activeKey = paraKeys[currentParaIdx];
    navButtons.forEach((btn) => {
      const isMatch = btn.textContent.trim().toLowerCase() === activeKey;
      btn.style.opacity = isMatch ? "1" : "0.65";
      btn.style.fontWeight = isMatch ? "700" : "400";
    });
  }

  function renderLine() {
    const currentKey = paraKeys[currentParaIdx];
    const currentPara = presentationDB[currentKey];
    if (!currentPara || !currentPara.lines || !currentPara.lines.length) return;

    // Pehle line show hogi, phir Next par agli line
    textBlock.textContent = currentPara.lines[currentLineIndex];

    // Fade-in animation
    textBlock.animate(
      [
        { opacity: 0, transform: "translateY(8px)" },
        { opacity: 1, transform: "translateY(0)" }
      ],
      {
        duration: 380,
        easing: "ease-out",
        fill: "forwards"
      }
    );

    updateActiveNavButton();

    // Pehle paragraph ki pehli line par Back disable, aakhri para ki aakhri line par Next disable
    backBtn.disabled = currentParaIdx === 0 && currentLineIndex === 0;
    nextBtn.disabled =
      currentParaIdx === paraKeys.length - 1 &&
      currentLineIndex === currentPara.lines.length - 1;
  }

  // P1, P2, P3 buttons click
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const clickedKey = btn.textContent.trim().toLowerCase();
      const idx = paraKeys.indexOf(clickedKey);
      if (idx !== -1) {
        currentParaIdx = idx;
        currentLineIndex = 0; // Us paragraph ki pehli line se start
        renderLine();
      }
    });
  });

  // Next button: agli line; agar paragraph ki lines khatam ho jayein to agle paragraph ki pehli line
  nextBtn.addEventListener("click", () => {
    const currentLines = presentationDB[paraKeys[currentParaIdx]].lines;

    if (currentLineIndex < currentLines.length - 1) {
      currentLineIndex++;
      renderLine();
    } else if (currentParaIdx < paraKeys.length - 1) {
      currentParaIdx++;
      currentLineIndex = 0;
      renderLine();
    }
  });

  // Back button: pichli line; agar pehli line par hon to pichle paragraph ki aakhri line
  backBtn.addEventListener("click", () => {
    if (currentLineIndex > 0) {
      currentLineIndex--;
      renderLine();
    } else if (currentParaIdx > 0) {
      currentParaIdx--;
      const prevLines = presentationDB[paraKeys[currentParaIdx]].lines;
      currentLineIndex = prevLines.length - 1;
      renderLine();
    }
  });

  renderLine();
}

// Dynamic injection aur normal load dono ke liye safe run
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPresentation);
} else {
  initPresentation();
}