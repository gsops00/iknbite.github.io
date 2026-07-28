/* ============================================
   iknbite  |  App Entry
   ============================================ */

(function() {
  'use strict';

  // ---- Configure TTS Engine ----
  const TTS_API_URL = localStorage.getItem('iknbite_tts_api') || '';
  const EV_KEY = localStorage.getItem('iknbite_ev_key') || '';
  const EV_URL = localStorage.getItem('iknbite_ev_url') || 'https://easyvoice.ae';
  const EL_KEY = localStorage.getItem('iknbite_el_key') || '';
  const config = {};
  if (TTS_API_URL && TTS_API_URL.trim()) config.apiUrl = TTS_API_URL.trim();
  if (EV_KEY && EV_KEY.trim()) { config.easyVoiceKey = EV_KEY.trim(); config.easyVoiceUrl = (EV_URL || 'https://easyvoice.ae').trim(); }
  if (EL_KEY && EL_KEY.trim()) config.elevenLabsKey = EL_KEY.trim();
  if (Object.keys(config).length) tts.configure(config);

  // ---- Build Nav ----
  function buildNav() {
    const items = [
      { id:'landing', icon:'🏠', label:'Home' },
      { id:'studio',  icon:'✨', label:'Studio' },
      { id:'voices',  icon:'🎭', label:'Voices' },
      { id:'history', icon:'📜', label:'History' },
      { id:'settings',icon:'⚙️', label:'Settings' },
      { id:'training',icon:'🎓', label:'Training' },
      { id:'features',icon:'⚡', label:'Features' },
      { id:'chat',    icon:'🤖', label:'Chat' },
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


  // ---- AnyClaw Voice Engine Section ----
  function populateAnyClaw() {
    // Emotions
    var emoEl = document.getElementById('anyclaw-emotions');
    if (emoEl && typeof ANYCLAW_EMOTIONS !== 'undefined') {
      emoEl.innerHTML = ANYCLAW_EMOTIONS.map(function(e) {
        return '<div style="padding:8px;border-radius:8px;background:var(--surface-50);text-align:center;cursor:pointer;border:1px solid var(--surface-200);transition:all 0.2s;" onmouseenter="this.style.borderColor=\'var(--brand-500)\'" onmouseleave="this.style.borderColor=\'var(--surface-200)\'" onclick="UI._testAnyClawEmotion(\'' + e.id + '\')" title="' + e.desc + '"><div style="font-size:20px;">' + e.icon + '</div><div style="font-size:10px;font-weight:600;margin-top:2px;">' + e.name + '</div><div style="font-size:9px;color:var(--surface-400);">' + e.speechRate + 'x</div></div>';
      }).join('');
    }
    // Voice Archetypes
    var vocEl = document.getElementById('anyclaw-voices');
    if (vocEl && typeof ANYCLAW_VOICE_TYPES !== 'undefined') {
      vocEl.innerHTML = Object.entries(ANYCLAW_VOICE_TYPES).map(function(pair) {
        var k = pair[0], v = pair[1];
        return '<div style="padding:10px;border-radius:8px;background:var(--surface-50);border:1px solid var(--surface-200);"><div style="font-size:12px;font-weight:600;">' + v.label + '</div><div style="font-size:10px;color:var(--surface-400);">' + v.desc + '</div><div style="font-size:9px;color:var(--brand-600);margin-top:4px;">F0: ' + v.f0[0] + '-' + v.f0[1] + ' Hz | ' + v.texture + '</div></div>';
      }).join('');
    }
    // DSP Pipeline
    var dspEl = document.getElementById('anyclaw-dsp');
    if (dspEl) {
      var steps = ['Loudness Normalization', 'Equalization', 'Compression', 'Limiting', 'De-essing', 'Noise Reduction', 'Silence Trimming', 'Breath Enhancement', 'Sample Rate Conversion', 'WAV Encoding'];
      dspEl.innerHTML = steps.map(function(p) {
        return '<span style="padding:4px 10px;border-radius:6px;font-size:10px;font-weight:600;background:var(--surface-100);color:var(--surface-600);border:1px solid var(--surface-200);">' + p + '</span>';
      }).join('');
    }
    // Datasets table
    var dsEl = document.getElementById('anyclaw-datasets');
    if (dsEl && typeof ANYCLAW_DATASETS !== 'undefined') {
      dsEl.innerHTML = ANYCLAW_DATASETS.map(function(d, i) {
        var bg = i % 2 === 0 ? 'background:var(--surface-50);' : '';
        var licBg = d.license.indexOf('CC0') >= 0 ? 'background:var(--brand-100);color:var(--brand-700)' : d.license.indexOf('CC') >= 0 ? 'background:var(--success-100);color:var(--success-700)' : 'background:var(--surface-200);color:var(--surface-600)';
        return '<tr style="border-bottom:1px solid var(--surface-100);' + bg + '"><td style="padding:6px 8px;font-weight:600;">' + d.name + '</td><td style="padding:6px 8px;">' + d.lang + '</td><td style="padding:6px 8px;font-weight:600;">' + d.hours + '</td><td style="padding:6px 8px;"><span style="padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600;' + licBg + ';">' + d.license + '</span></td><td style="padding:6px 8px;color:var(--surface-500);">' + d.use + '</td></tr>';
      }).join('');
    }
  }

  // Run on every render
  var origRender = UI.render.bind(UI);
  UI.render = function() {
    origRender();
    setTimeout(populateAnyClaw, 50);
  };

})();
