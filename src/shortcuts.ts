export function setupShortcutsDialog(): void {
  const overlay = document.createElement("div");
  overlay.id = "shortcuts-overlay";
  overlay.setAttribute("aria-hidden", "true");

  overlay.innerHTML = `
    <div id="shortcuts-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
      <div class="advanced-head">
        <h3 id="shortcuts-title">Keyboard Shortcuts</h3>
        <button id="shortcuts-close" class="advanced-close" aria-label="Close">✕</button>
      </div>
      <div class="shortcuts-content">
        <div class="shortcut-row"><span class="key">Space / Enter</span><span>Start / Pause / Resume</span></div>
        <div class="shortcut-row"><span class="key">s</span><span>Stop timer / Toggle Settings</span></div>
        <div class="shortcut-row"><span class="key">i</span><span>Edit time</span></div>
        <div class="shortcut-row"><span class="key">r</span><span>Toggle ring visibility</span></div>
        <div class="shortcut-row"><span class="key">p</span><span>Toggle Pomodoro mode</span></div>
        <div class="shortcut-row"><span class="key">d</span><span>Cycle theme / Delete item</span></div>
        <div class="shortcut-row"><span class="key">H</span><span>Toggle history</span></div>
        <div class="shortcut-row"><span class="key">e</span><span>Advanced settings</span></div>
        <div class="shortcut-row"><span class="key">?</span><span>Show this help</span></div>
        <div class="shortcut-row"><span class="key">q / Esc</span><span>Close menu</span></div>
        <div class="shortcut-row"><span class="key">h, j, k, l</span><span>Vim navigation in menus</span></div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  function isOpen() {
    return overlay.classList.contains("open");
  }

  function open() {
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
  }

  function close() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
  }

  overlay.querySelector("#shortcuts-close")?.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    const isTyping = document.activeElement?.matches('input[type="text"], input[type="number"]');
    
    if (e.key === "?" && !e.repeat && !isTyping) {
      e.preventDefault();
      if (isOpen()) close();
      else open();
    } else if ((e.key === "Escape" || e.key.toLowerCase() === "q") && isOpen() && !e.repeat) {
      // Don't prevent default, let keyboard.ts also catch it to close other things if needed,
      // or we can prevent default so only one thing closes.
      close();
    }
  });
}
