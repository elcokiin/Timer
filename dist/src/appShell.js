const APP_SHELL = `
  <div id="bg">
    <div id="bg-art">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="bg-art-svg">
        <defs>
          <radialGradient id="g1" cx="30%" cy="70%">
            <stop offset="0%" style="stop-color: var(--art-g1-start)" />
            <stop offset="100%" style="stop-color: transparent" />
          </radialGradient>
          <radialGradient id="g2" cx="75%" cy="30%">
            <stop offset="0%" style="stop-color: var(--art-g2-start)" />
            <stop offset="100%" style="stop-color: transparent" />
          </radialGradient>
        </defs>
        <ellipse cx="25%" cy="75%" rx="35%" ry="40%" fill="url(#g1)" />
        <ellipse cx="78%" cy="28%" rx="30%" ry="35%" fill="url(#g2)" />
        <g style="stroke: var(--art-line-strong)" stroke-width="1.2" fill="none" opacity=".6">
          <path d="M-20,400 Q100,200 300,100 Q500,0 700,150" />
          <path d="M0,600 Q200,400 400,350 Q600,300 900,200" />
          <path d="M100,700 Q250,500 450,430 Q650,360 1000,280" />
          <path d="M-50,300 Q150,250 350,200 Q550,150 800,100" />
          <path d="M200,800 Q350,650 500,580 Q700,500 1100,400" />
          <path d="M300,100 Q280,80 260,95 M300,100 Q310,75 295,60 M300,100 Q325,85 320,65" />
          <path d="M500,0 Q480,20 465,15 M500,0 Q515,25 510,40 M500,0 Q525,15 530,-10" />
        </g>
        <g style="stroke: var(--art-line-soft)" stroke-width="0.8" fill="none" opacity=".4">
          <path d="M800,700 Q700,500 600,450 Q500,400 300,500" />
          <path d="M1000,600 Q850,450 750,380 Q650,310 400,350" />
          <path d="M900,800 Q780,600 680,520 Q580,440 350,480" />
        </g>
      </svg>
    </div>
  </div>

  <button id="settings-btn" title="Settings">
    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  </button>

  <div id="settings-panel">
    <div class="settings-section">
      <label>Background image</label>
      <button class="file-btn" id="bg-btn">Upload image...</button>
      <input type="file" id="bg-input" accept="image/*" />
      <button class="file-btn file-btn--mt6" id="bg-reset">Reset to default</button>
    </div>
    <div class="settings-sep"></div>
    <div class="settings-section">
      <label>Alarm sound</label>
      <div class="alarm-grid" id="alarm-grid">
        <span class="alarm-chip active" data-alarm="bell">Bell</span>
        <span class="alarm-chip" data-alarm="chime">Chime</span>
        <span class="alarm-chip" data-alarm="digital">Digital</span>
      </div>
      <button class="file-btn file-btn--mt8" id="alarm-btn">Upload audio...</button>
      <input type="file" id="alarm-input" accept="audio/*" />
    </div>
    <div class="settings-sep"></div>
    <div class="settings-section">
      <label>Default duration</label>
      <div class="settings-row">
        <span class="settings-unit">Focus</span>
        <input id="def-focus" class="settings-num" type="number" min="1" max="120" value="25" />
        <span class="settings-unit">min</span>
      </div>
      <div class="settings-row settings-row--mt6">
        <span class="settings-unit">Break</span>
        <input id="def-break" class="settings-num" type="number" min="1" max="60" value="5" />
        <span class="settings-unit">min</span>
      </div>
      <button class="file-btn file-btn--mt8" id="apply-defaults">Apply</button>
    </div>
    <div class="settings-sep"></div>
    <div class="settings-section">
      <button class="file-btn" id="advanced-btn">Advanced settings</button>
    </div>
  </div>

  <div id="advanced-overlay" aria-hidden="true">
    <div id="advanced-dialog" role="dialog" aria-modal="true" aria-labelledby="advanced-title" aria-describedby="advanced-desc">
      <div class="advanced-head">
        <h3 id="advanced-title">Advanced settings</h3>
        <button id="advanced-close" class="advanced-close" aria-label="Close">✕</button>
      </div>
      <p id="advanced-desc" class="advanced-desc">Choose a theme for colors and background mood.</p>
      <div class="advanced-section">
        <label>Theme</label>
        <div id="advanced-theme-cards" class="theme-cards" role="listbox" aria-label="Theme presets">
          <button class="theme-card" data-theme-card="forest" type="button">
            <span class="theme-card-name">Forest</span>
            <span class="theme-card-preview forest"></span>
          </button>
          <button class="theme-card" data-theme-card="ocean" type="button">
            <span class="theme-card-name">Ocean</span>
            <span class="theme-card-preview ocean"></span>
          </button>
          <button class="theme-card" data-theme-card="sunset" type="button">
            <span class="theme-card-name">Sunset</span>
            <span class="theme-card-preview sunset"></span>
          </button>
          <button class="theme-card" data-theme-card="amber" type="button">
            <span class="theme-card-name">Amber</span>
            <span class="theme-card-preview amber"></span>
          </button>
          <button class="theme-card" data-theme-card="mono" type="button">
            <span class="theme-card-name">Mono</span>
            <span class="theme-card-preview mono"></span>
          </button>
          <button class="theme-card" data-theme-card="graphite" type="button">
            <span class="theme-card-name">Graphite</span>
            <span class="theme-card-preview graphite"></span>
          </button>
        </div>
      </div>
      <div class="advanced-section">
        <label class="advanced-switch" for="advanced-show-ring">
          <span class="advanced-switch-copy">
            <span class="advanced-switch-title">Show animated ring</span>
          </span>
          <span class="advanced-switch-track">
            <input id="advanced-show-ring" type="checkbox" checked />
            <span class="advanced-switch-thumb"></span>
          </span>
        </label>
      </div>
    </div>
  </div>

  <div id="history-wrap">
    <div id="history-panel">
      <div class="hist-head">
        <h3>Time history</h3>
        <button id="hist-clear" class="hist-clear" title="Clear history">Clear</button>
      </div>
      <div id="hist-days" class="hist-days" role="tablist" aria-label="History by day"></div>
      <div id="hist-detail" class="hist-detail"></div>
    </div>
    <button id="history-toggle" title="History">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  </div>

  <div id="app">
    <div id="timer-wrap">
      <svg id="ticks-svg"></svg>
      <svg id="ring-svg">
        <circle id="ring-bg" fill="none" stroke="rgba(255,255,255,0.08)" />
        <circle id="ring-progress" fill="none" stroke="currentColor" stroke-linecap="round" />
      </svg>
      <div id="timer-center">
        <span id="phase-label">FOCUS</span>
        <div id="time-display">25:00</div>
        <input id="time-edit" type="text" maxlength="5" placeholder="MM:SS" />
        <div class="btn-row" id="btn-row"></div>
      </div>
    </div>
  </div>
`;
export function renderAppShell() {
    document.body.innerHTML = APP_SHELL;
}
