/* ============================================
   iknbite  |  App Entry
   ============================================ */

(function() {
  'use strict';

  // ---- Configure TTS Engine ----
  const TTS_API_URL = localStorage.getItem('iknbite_tts_api') || '';
  const EV_KEY = localStorage.getItem('iknbite_ev_key') || '';
  const EV_URL = localStorage.getItem('iknbite_ev_url') || 'https://easyvoice.ae';
  const config = {};
  if (TTS_API_URL && TTS_API_URL.trim()) config.apiUrl = TTS_API_URL.trim();
  if (EV_KEY && EV_KEY.trim()) { config.easyVoiceKey = EV_KEY.trim(); config.easyVoiceUrl = (EV_URL || 'https://easyvoice.ae').trim(); }
  if (Object.keys(config).length) tts.configure(config);

  // ---- Build Nav ----
  function buildNav() {
    const items = [
      { id:'landing', icon:'🏠', label:'Home' },
      { id:'studio',  icon:'✨', label:'Studio' },
      { id:'voices',  icon:'🎭', label:'Voices' },
      { id:'history', icon:'📜', label:'History' },
      { id:'settings',icon:'⚙️', label:'Settings' },
    ];
    return items.map(it => `
      <button data-nav="${it.id}" class="nav-item ${UI.view === it.id ? 'active' : ''}" onclick="UI.nav('${it.id}')">
        <span class="nav-icon">${it.icon}</span>
        <span class="nav-label">${it.label}</span>
      </button>
    `).join('');
  }

  // ---- Build Shell ----
  function buildShell() {
    const isMobile = window.innerWidth < 768;

    document.body.innerHTML = `
      <style>
        .top-bar {
          position: sticky; top: 0; z-index: 100;
          background: ${UI.dark ? 'rgba(10,10,10,.85)' : 'rgba(255,255,255,.85)'};
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid ${UI.dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)'};
        }
        .top-bar-inner {
          max-width: 1080px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px; height: 56px;
        }
        .logo {
          display: flex; align-items: center; gap: 8px;
          font-weight: 800; font-size: 18px; cursor: pointer;
          text-decoration: none; color: inherit;
        }
        .logo-emoji { font-size: 22px; }
        .logo-brand { letter-spacing: -0.02em; }
        .logo-dot { display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--brand-600);margin-left:2px;animation:pulse 2s infinite; }
        .nav-item {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          padding: 6px 12px; border: none; background: none;
          font-family: var(--font); font-size: 11px; font-weight: 500;
          color: var(--surface-400); cursor: pointer;
          border-radius: 10px; transition: all var(--transition-fast);
          position: relative;
        }
        .nav-item:hover { color: var(--surface-600); background: var(--surface-50); }
        .nav-item.active { color: var(--brand-600); }
        .nav-item.active::after {
          content: ''; position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
          width: 16px; height: 3px; border-radius: 2px; background: var(--brand-600);
        }
        .nav-icon { font-size: 18px; }
        .nav-label { font-size: 10px; }
        body.dark .nav-item:hover { background: var(--surface-800); }
        .bottom-nav {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
          background: ${UI.dark ? 'rgba(10,10,10,.92)' : 'rgba(255,255,255,.92)'};
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border-top: 1px solid ${UI.dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)'};
          display: none;
        }
        @media (max-width: 767px) {
          .bottom-nav { display: flex; justify-content: space-around; padding: 6px 0; padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px)); }
          .top-bar .nav-desktop { display: none !important; }
          #main-content { padding-bottom: 80px !important; }
        }
        @media (min-width: 768px) {
          .bottom-nav { display: none !important; }
        }
        .theme-toggle {
          width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid ${UI.dark ? 'var(--surface-700)' : 'var(--surface-200)'};
          background: ${UI.dark ? 'var(--surface-800)' : 'var(--surface-50)'};
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 16px; transition: all var(--transition-fast);
        }
        .theme-toggle:hover { border-color: var(--brand-500); }
      </style>

      <!-- Top Bar -->
      <header class="top-bar">
        <div class="top-bar-inner">
          <a class="logo" onclick="UI.nav('landing');return false" href="#">
            <span class="logo-emoji">🎙️</span>
            <span class="logo-brand">iknbite</span><span class="logo-dot"></span>
          </a>
          <nav class="nav-desktop" style="display:flex;gap:4px;">
            ${buildNav()}
          </nav>
          <div style="display:flex;gap:8px;align-items:center;">
            <div class="theme-toggle" onclick="UI.toggleTheme()" title="Toggle theme">
              ${UI.dark ? '☀️' : '🌙'}
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main id="main-content"></main>

      <!-- Bottom Nav (Mobile) -->
      <nav class="bottom-nav">
        ${buildNav()}
      </nav>
    `;

    UI.render();
  }

  // ---- Keyboard Shortcuts ----
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter = generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (UI.view === 'studio') UI._generate();
    }
    // Escape = go home
    if (e.key === 'Escape') {
      if (UI.view !== 'landing') UI.nav('landing');
    }
  });

  // ---- Init ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildShell);
  } else {
    buildShell();
  }
})();
