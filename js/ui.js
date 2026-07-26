/* ============================================
   iknbite  |  UI Components & Rendering
   ============================================ */

const UI = {
  // State
  dark: localStorage.getItem('iknbite_dark') === 'true',
  view: 'landing',
  selectedVoice: null,
  text: '',
  favorites: JSON.parse(localStorage.getItem('iknbite_favs') || '[]'),
  history: JSON.parse(localStorage.getItem('iknbite_history') || '[]'),
  langFilter: 'all',
  genderFilter: 'all',
  isPlaying: false,
  isGenerating: false,
  rate: 1.0,
  pitch: 1.0,

  // ---- Avatar HTML helper ----
  avatarHTML(v, size, active) {
    const px = size || 56;
    const cls = active ? 'voice-avatar active' : 'voice-avatar';
    const shadow = active ? 'box-shadow:0 0 0 3px var(--brand-600),var(--shadow-lg);' : '';
    const borderRadius = Math.round(px * 0.32);
    const fallbackBg = `linear-gradient(135deg,${v.colors[0]},${v.colors[1]})`;
    return `<img class="${cls}" src="${v.avatar}" alt="${v.name}" width="${px}" height="${px}" style="width:${px}px;height:${px}px;border-radius:${borderRadius}px;background:${fallbackBg};${shadow}" onerror="this.style.background='${fallbackBg}';this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>${v.emoji}</text></svg>'" />`;
  },

  // ---- Theme ----
  toggleTheme() {
    this.dark = !this.dark;
    localStorage.setItem('iknbite_dark', this.dark);
    this.applyTheme();
    this.render();
  },

  applyTheme() {
    document.body.className = this.dark ? 'dark' : 'light';
  },

  // ---- Helpers ----
  isFav(id) { return this.favorites.includes(id); },

  toggleFav(id) {
    if (this.isFav(id)) {
      this.favorites = this.favorites.filter(f => f !== id);
    } else {
      this.favorites.push(id);
    }
    localStorage.setItem('iknbite_favs', JSON.stringify(this.favorites));
    this.render();
  },

  addHistory(voice, text) {
    this.history.unshift({ voice: voice.name, avatar: voice.avatar, text: text.substring(0, 100), time: Date.now() });
    if (this.history.length > 50) this.history = this.history.slice(0, 50);
    localStorage.setItem('iknbite_history', JSON.stringify(this.history));
  },

  timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
  },

  // ---- Toast ----
  toast(msg, type = '') {
    let c = document.getElementById('toast-container');
    if (!c) { c = document.createElement('div'); c.id = 'toast-container'; c.className = 'toast-container'; document.body.appendChild(c); }
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => { t.style.animation = 'toastOut 0.3s ease-in forwards'; setTimeout(() => t.remove(), 300); }, 2500);
  },

  // ---- Navigation ----
  nav(view) {
    this.view = view;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ---- Waveform Bars ----
  waveformHTML(active, id) {
    const bars = 20;
    let h = `<div class="waveform ${active ? 'playing' : ''}" id="wf-${id}">`;
    for (let i = 0; i < bars; i++) {
      const height = active ? 4 : (4 + Math.random() * 14);
      h += `<span class="bar" style="height:${height}px"></span>`;
    }
    h += '</div>';
    return h;
  },

  // ---- Landing Page ----
  renderLanding() {
    const featured = ['ava','andrew','nanami','xiaoxiao','denise','elvira','sunhi','swara'];
    const featuredVoices = featured.map(id => VOICES.find(v => v.id === id)).filter(Boolean);

    return `
    <div class="hero-bg"></div>
    <div style="max-width:1080px;margin:0 auto;padding:40px 20px 80px;">

      <!-- Hero -->
      <div class="anim-fade-in-up" style="text-align:center;padding:60px 0 48px;">
        <div style="font-size:56px;margin-bottom:16px;filter:drop-shadow(0 4px 12px rgba(0,0,0,.1));">🎙️</div>
        <h1 style="font-size:clamp(32px,6vw,56px);font-weight:900;letter-spacing:-0.03em;line-height:1.1;margin-bottom:12px;">
          iknbite
        </h1>
        <p style="font-size:clamp(16px,2.5vw,22px);color:${this.dark ? '#a3a3a3' : '#737373'};max-width:520px;margin:0 auto 32px;font-weight:400;">
          AI Voice Studio. Generate natural speech in <strong style="color:var(--brand-600)">28+ voices</strong> across <strong style="color:var(--brand-600)">${Object.keys(LANGUAGES).length} languages</strong>. Free forever.
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="UI.nav('studio')" style="padding:14px 32px;font-size:16px;border-radius:14px;">
            ✨ Start Creating
          </button>
          <button class="btn btn-secondary" onclick="UI.nav('voices')" style="padding:14px 32px;font-size:16px;border-radius:14px;">
            🎭 Browse Voices
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="anim-stagger" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:48px;">
        <div class="card" style="padding:20px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:var(--brand-600);">${VOICES.length}</div>
          <div style="font-size:12px;color:var(--surface-400);margin-top:4px;">Voices</div>
        </div>
        <div class="card" style="padding:20px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:var(--brand-600);">${Object.keys(LANGUAGES).length}</div>
          <div style="font-size:12px;color:var(--surface-400);margin-top:4px;">Languages</div>
        </div>
        <div class="card" style="padding:20px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:var(--brand-600);">0</div>
          <div style="font-size:12px;color:var(--surface-400);margin-top:4px;">API Keys</div>
        </div>
        <div class="card" style="padding:20px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:var(--brand-600);">100%</div>
          <div style="font-size:12px;color:var(--surface-400);margin-top:4px;">Free</div>
        </div>
      </div>

      <!-- Featured Voices -->
      <div style="margin-bottom:48px;">
        <h2 style="font-size:20px;font-weight:700;margin-bottom:16px;">✨ Featured Voices</h2>
        <div class="anim-stagger" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;">
          ${featuredVoices.map(v => `
            <div class="voice-card" onclick="UI.selectVoice('${v.id}');UI.nav('studio')">
              ${this.avatarHTML(v, 56)}
              <div class="name">${v.name}</div>
              <div class="desc">${v.desc.split(' ').slice(0,2).join(' ')}</div>
              <button class="preview-btn" onclick="event.stopPropagation();tts.preview(UI.findVoice('${v.id}')).catch(()=>UI.toast('Voice preview not available','error'))" title="Preview voice">▶</button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- How it Works -->
      <div class="card anim-fade-in-up" style="padding:32px;">
        <h2 style="font-size:20px;font-weight:700;margin-bottom:20px;">How It Works</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:20px;">
          ${[
            { icon:'🎭', title:'Pick a Voice', desc:'Choose from 28+ characters across 12 languages' },
            { icon:'✍️', title:'Write Text', desc:'Type or paste anything — stories, scripts, messages' },
            { icon:'🔊', title:'Generate Speech', desc:'Click play and hear natural speech instantly' },
            { icon:'📥', title:'Download', desc:'Save your audio as MP3 or continue editing' },
          ].map((s, i) => `
            <div style="text-align:center;">
              <div style="width:48px;height:48px;border-radius:14px;background:${this.dark?'var(--surface-800)':'var(--surface-50)'};display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 10px;">${s.icon}</div>
              <div style="font-weight:600;font-size:14px;margin-bottom:4px;">${s.title}</div>
              <div style="font-size:12px;color:var(--surface-400);">${s.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>`;
  },

  // ---- Studio Page ----
  renderStudio() {
    const v = this.selectedVoice;
    const voiceGrid = this._renderVoiceGrid();
    const charCount = this.text.length;
    const wordCount = this.text.trim() ? this.text.trim().split(/\s+/).length : 0;

    return `
    <div class="hero-bg"></div>
    <div style="max-width:1080px;margin:0 auto;padding:24px 20px 80px;">

      <!-- Editor Panel -->
      <div class="anim-fade-in-up" style="margin-bottom:24px;">
        <div class="card" style="padding:24px;">
          <!-- Voice Selector Bar -->
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
            <div style="font-size:14px;font-weight:600;">Voice:</div>
            ${v ? `
              <div style="display:flex;align-items:center;gap:10px;">
                ${this.avatarHTML(v, 36, false)}
                <div>
                  <span style="font-weight:600;font-size:14px;">${v.name}</span>
                  <span style="font-size:12px;color:var(--surface-400);margin-left:6px;">${LANGUAGES[v.lang] || v.lang}</span>
                </div>
              </div>
            ` : '<span style="font-size:13px;color:var(--surface-400);">No voice selected — <a href="#" onclick="UI.nav(\'voices\');return false" style="color:var(--brand-600)">browse voices</a></span>'}
            <button class="btn btn-ghost btn-icon" onclick="UI.nav('voices')" title="Change voice" style="width:32px;height:32px;font-size:16px;margin-left:auto;">🎭</button>
          </div>

          <!-- Text Input -->
          <textarea class="editor-textarea" placeholder="Type or paste your text here..." oninput="UI.text=this.value;UI._updateCharCount()" id="editor-textarea">${this.text}</textarea>

          <!-- Stats & Controls -->
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;flex-wrap:wrap;gap:8px;">
            <div style="display:flex;gap:12px;align-items:center;">
              <span class="char-count" id="char-count">${charCount} chars</span>
              <span style="font-size:11px;color:var(--surface-400);">${wordCount} words</span>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <button class="btn btn-ghost" onclick="UI.text='';document.getElementById('editor-textarea').value='';UI._updateCharCount()" title="Clear text" style="font-size:13px;">✕ Clear</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Playback Controls -->
      <div class="anim-fade-in-up card" style="padding:20px;margin-bottom:24px;animation-delay:0.1s;">
        ${this.waveformHTML(this.isPlaying, 'main')}
        <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-top:16px;flex-wrap:wrap;">
          <button class="btn btn-ghost btn-icon" onclick="UI._changeRate(-0.1)" title="Slower">🐢</button>
          <span style="font-size:12px;color:var(--surface-400);min-width:40px;text-align:center;">${this.rate.toFixed(1)}x</span>
          <button class="btn btn-ghost btn-icon" onclick="UI._changeRate(0.1)" title="Faster">🐇</button>
          <div style="width:1px;height:24px;background:var(--surface-200);margin:0 4px;"></div>
          <button class="btn btn-ghost btn-icon" onclick="UI._changePitch(-0.1)" title="Lower pitch">🔉</button>
          <span style="font-size:12px;color:var(--surface-400);min-width:40px;text-align:center;">${this.pitch.toFixed(1)}</span>
          <button class="btn btn-ghost btn-icon" onclick="UI._changePitch(0.1)" title="Higher pitch">🔊</button>
        </div>
        <div style="display:flex;justify-content:center;gap:10px;margin-top:16px;flex-wrap:wrap;">
          <button class="btn btn-primary" id="generate-btn" onclick="UI._generate()" ${this.isGenerating ? 'disabled' : ''} style="padding:14px 36px;font-size:15px;border-radius:14px;">
            ${this.isGenerating ? '⏳ Generating...' : '▶ Generate Speech'}
          </button>
          <button class="btn btn-success" id="download-btn" onclick="UI._downloadAudio()" style="padding:14px 24px;font-size:15px;border-radius:14px;display:inline-flex;align-items:center;gap:8px;">
            📥 Download
          </button>
          ${tts.isMobile() ? '<button class="btn btn-secondary" onclick="UI._shareAudio()" style="padding:14px 24px;font-size:15px;border-radius:14px;display:inline-flex;align-items:center;gap:8px;">📤 Share</button>' : ''}
        </div>
      </div>

      <!-- Voice Grid -->
      <div class="anim-fade-in-up" style="animation-delay:0.2s;">
        ${voiceGrid}
      </div>

    </div>`;
  },

  _renderVoiceGrid() {
    let filtered = VOICES;
    if (this.langFilter !== 'all') filtered = filtered.filter(v => v.lang === this.langFilter);
    if (this.genderFilter !== 'all') filtered = filtered.filter(v => v.gender === this.genderFilter);

    const langs = [...new Set(VOICES.map(v => v.lang))].sort();

    return `
    <div class="card" style="padding:20px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
        <h3 style="font-size:16px;font-weight:700;">🎭 Voice Library</h3>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="tag ${this.genderFilter === 'all' ? 'active' : ''}" onclick="UI.genderFilter='all';UI.render()">All</button>
          <button class="tag ${this.genderFilter === 'f' ? 'active' : ''}" onclick="UI.genderFilter='f';UI.render()">♀ Female</button>
          <button class="tag ${this.genderFilter === 'm' ? 'active' : ''}" onclick="UI.genderFilter='m';UI.render()">♂ Male</button>
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;">
        <button class="tag ${this.langFilter === 'all' ? 'active' : ''}" onclick="UI.langFilter='all';UI.render()">All</button>
        ${langs.map(l => `<button class="tag ${this.langFilter === l ? 'active' : ''}" onclick="UI.langFilter='${l}';UI.render()">${l.toUpperCase()} <span style="opacity:.5">${VOICES.filter(v=>v.lang===l).length}</span></button>`).join('')}
      </div>
      <div class="anim-stagger" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;">
        ${filtered.map(v => `
          <div class="voice-card ${this.selectedVoice && this.selectedVoice.id === v.id ? 'active' : ''}" onclick="UI.selectVoice('${v.id}')">
            <button class="preview-btn" onclick="event.stopPropagation();tts.preview(UI.findVoice('${v.id}')).catch(()=>UI.toast('Preview not available','error'))" title="Preview">▶</button>
            <button class="fav-star ${this.isFav(v.id) ? 'active' : ''}" onclick="event.stopPropagation();UI.toggleFav('${v.id}')" title="Toggle favorite" style="position:absolute;top:8px;left:8px;background:none;border:none;font-size:14px;">${this.isFav(v.id) ? '★' : '☆'}</button>
            ${this.avatarHTML(v, 48, this.selectedVoice && this.selectedVoice.id === v.id)}
            <div class="name">${v.name}</div>
            <div class="desc">${v.desc}</div>
          </div>
        `).join('')}
      </div>
      ${filtered.length === 0 ? '<p style="text-align:center;color:var(--surface-400);padding:32px;">No voices match the current filter.</p>' : ''}
    </div>`;
  },

  // ---- Voices Page ----
  renderVoices() {
    return `
    <div class="hero-bg"></div>
    <div style="max-width:1080px;margin:0 auto;padding:24px 20px 80px;">
      <div class="anim-fade-in-up" style="margin-bottom:24px;">
        <h1 style="font-size:28px;font-weight:800;margin-bottom:4px;">🎭 Voice Library</h1>
        <p style="font-size:14px;color:var(--surface-400);">${VOICES.length} voices across ${Object.keys(LANGUAGES).length} languages — click any voice to start creating</p>
      </div>
      <div class="anim-fade-in-up" style="animation-delay:0.1s;">
        ${this._renderVoiceGrid()}
      </div>
    </div>`;
  },

  // ---- History Page ----
  renderHistory() {
    return `
    <div class="hero-bg"></div>
    <div style="max-width:680px;margin:0 auto;padding:24px 20px 80px;">
      <div class="anim-fade-in-up" style="margin-bottom:24px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <h1 style="font-size:28px;font-weight:800;">📜 History</h1>
          ${this.history.length > 0 ? `<button class="btn btn-ghost" onclick="UI.history=[];localStorage.removeItem('iknbite_history');UI.render()" style="font-size:13px;">Clear All</button>` : ''}
        </div>
      </div>
      ${this.history.length === 0 ? `
        <div class="card anim-fade-in-up" style="padding:48px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">📭</div>
          <p style="font-size:14px;color:var(--surface-400);">No history yet. Start creating!</p>
          <button class="btn btn-primary" onclick="UI.nav('studio')" style="margin-top:16px;">✨ Open Studio</button>
        </div>
      ` : `
        <div class="anim-stagger" style="display:flex;flex-direction:column;gap:8px;">
          ${this.history.map((h, i) => `
            <div class="card" style="padding:14px 16px;display:flex;align-items:center;gap:12px;">
              <img src="${h.avatar}" alt="${h.voice}" style="width:36px;height:36px;border-radius:10px;" />
              <div style="flex:1;min-width:0;">
                <div style="font-size:13px;font-weight:600;">${h.voice}</div>
                <div class="truncate" style="font-size:12px;color:var(--surface-400);">${h.text}</div>
              </div>
              <span style="font-size:11px;color:var(--surface-400);white-space:nowrap;">${this.timeAgo(h.time)}</span>
            </div>
          `).join('')}
        </div>
      `}
    </div>`;
  },

  // ---- Settings Page ----
  renderSettings() {
    return `
    <div class="hero-bg"></div>
    <div style="max-width:560px;margin:0 auto;padding:24px 20px 80px;">
      <div class="anim-fade-in-up" style="margin-bottom:24px;">
        <h1 style="font-size:28px;font-weight:800;">⚙️ Settings</h1>
      </div>

      <div class="anim-stagger" style="display:flex;flex-direction:column;gap:12px;">
        <!-- Theme -->
        <div class="card" style="padding:20px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-weight:600;font-size:14px;">Dark Mode</div>
              <div style="font-size:12px;color:var(--surface-400);">Toggle light/dark appearance</div>
            </div>
            <button class="btn ${this.dark ? 'btn-primary' : 'btn-secondary'}" onclick="UI.toggleTheme()" style="padding:8px 16px;font-size:13px;">
              ${this.dark ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>

        <!-- TTS Engine -->
        <div class="card" style="padding:20px;">
          <div style="font-weight:600;font-size:14px;margin-bottom:8px;">TTS Engine</div>
          <div style="font-size:12px;color:var(--surface-400);margin-bottom:12px;">
            For best quality, connect an Edge TTS backend. Free, no API key needed.
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;"><span>Status</span><span style="color:${(tts.easyVoiceKey||tts.edgeTTSApiUrl)?'#10b981':'#f59e0b'}">${tts.easyVoiceKey ? '✅ EasyVoice Connected' : tts.edgeTTSApiUrl ? '✅ Edge TTS Connected' : '⚠️ Using Web Speech API'}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:13px;"><span>Voices loaded</span><span>${tts.getVoices().length}</span></div>
            <div style="margin-top:8px;">
              <label style="font-size:12px;color:var(--surface-400);display:block;margin-bottom:4px;">Edge TTS API URL</label>
              <div style="display:flex;gap:6px;">
                <input id="tts-api-input" type="url" placeholder="https://your-server:5050"
                  value="${localStorage.getItem('iknbite_tts_api') || ''}"
                  style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:13px;font-family:var(--font);"
                />
                <button class="btn btn-primary" onclick="UI._saveTTSApi()" style="padding:8px 16px;font-size:13px;border-radius:8px;">Save</button>
              </div>
              <div style="font-size:11px;color:var(--surface-400);margin-top:4px;">
                Deploy free: <code style="background:var(--surface-100);padding:1px 4px;border-radius:4px;">docker run -d -p 5050:5050 travisvn/openai-edge-tts:latest</code>
              </div>
            </div>
          </div>
        </div>

        <!-- About -->
        <div class="card" style="padding:20px;">
          <div style="font-weight:600;font-size:14px;margin-bottom:8px;">About iknbite</div>
          <p style="font-size:13px;color:var(--surface-400);margin-bottom:12px;">
            Free, open-source AI Voice Studio. Speech generation uses the Web Speech API built into modern browsers.
          </p>
          <a href="https://github.com/gsops00/iknbite.github.io" target="_blank" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--brand-600);text-decoration:none;font-weight:500;">
            View on GitHub →
          </a>
        </div>
      </div>
    </div>`;
  },

  // ---- Main Render ----
  render() {
    this.applyTheme();
    const nav = document.getElementById('main-nav');
    const content = document.getElementById('main-content');
    if (!content) return;

    if (nav) {
      nav.querySelectorAll('[data-nav]').forEach(el => {
        el.classList.toggle('active', el.dataset.nav === this.view);
      });
    }

    let html = '';
    switch (this.view) {
      case 'landing': html = this.renderLanding(); break;
      case 'studio': html = this.renderStudio(); break;
      case 'voices': html = this.renderVoices(); break;
      case 'history': html = this.renderHistory(); break;
      case 'settings': html = this.renderSettings(); break;
      default: html = this.renderLanding();
    }
    content.innerHTML = html;
  },

  // ---- Actions ----
  findVoice(id) { return VOICES.find(v => v.id === id); },

  selectVoice(id) {
    const v = this.findVoice(id);
    if (v) {
      this.selectedVoice = v;
      localStorage.setItem('iknbite_selected', v.id);
      this.view = 'studio';
      this.render();
    }
  },

  _updateCharCount() {
    const el = document.getElementById('char-count');
    if (el) el.textContent = this.text.length + ' chars';
  },

  _changeRate(d) {
    this.rate = Math.round(Math.max(0.5, Math.min(2.0, this.rate + d)) * 10) / 10;
    this.render();
  },

  _changePitch(d) {
    this.pitch = Math.round(Math.max(0.5, Math.min(2.0, this.pitch + d)) * 10) / 10;
    this.render();
  },

  async _generate() {
    if (!this.text.trim()) { this.toast('Please enter some text first', 'error'); return; }
    if (!this.selectedVoice) { this.toast('Please select a voice first', 'error'); return; }
    if (!tts.isSupported()) { this.toast('Speech synthesis not supported in this browser', 'error'); return; }

    this.isGenerating = true;
    this.isPlaying = true;
    this.render();

    try {
      this.addHistory(this.selectedVoice, this.text);
      await tts.speak(this.text, this.selectedVoice, {
        rate: this.rate,
        pitch: this.pitch,
        volume: 1.0,
      });
      this.toast('✅ Speech generated!', 'success');
    } catch (e) {
      console.error('TTS error:', e);
      this.toast('Failed to generate speech: ' + (e.message || 'Unknown error'), 'error');
    } finally {
      this.isGenerating = false;
      this.isPlaying = false;
      this.render();
    }
  },

  _saveEasyVoice() {
    const keyInput = document.getElementById('ev-key-input');
    const urlInput = document.getElementById('ev-url-input');
    if (!keyInput) return;
    const key = keyInput.value.trim();
    const url = (urlInput.value.trim() || 'https://easyvoice.ae').replace(/\/$/, '');
    if (key) {
      localStorage.setItem('iknbite_ev_key', key);
      localStorage.setItem('iknbite_ev_url', url);
      tts.configure({ easyVoiceKey: key, easyVoiceUrl: url });
      this.toast('✅ EasyVoice saved — real AI voices active!', 'success');
    } else {
      localStorage.removeItem('iknbite_ev_key');
      localStorage.removeItem('iknbite_ev_url');
      tts.configure({ easyVoiceKey: null, easyVoiceUrl: null });
      this.toast('🔄 EasyVoice cleared', 'success');
    }
  },

  _saveTTSApi() {
    const input = document.getElementById('tts-api-input');
    if (!input) return;
    const url = input.value.trim().replace(/\/$/, '');
    if (url) {
      localStorage.setItem('iknbite_tts_api', url);
      tts.configure({ apiUrl: url });
      this.toast('✅ TTS API saved — restart to apply', 'success');
    } else {
      localStorage.removeItem('iknbite_tts_api');
      tts.configure({ apiUrl: '' });
      this.toast('🔄 TTS API cleared — using Web Speech API', 'success');
    }
  },

  _downloadAudio() {
    if (!tts.canDownload()) {
      this.toast('⚠️ Generate speech first, then download.', 'error');
      return;
    }
    try {
      if (tts.isMobile() && navigator.share && navigator.canShare) {
        // Try Web Share API on mobile
        tts.shareAudio().then(result => {
          if (result === 'shared') {
            this.toast('✅ Audio shared!', 'success');
          } else {
            this.toast('🔊 Audio opened in new tab — tap the menu to save.', 'success');
          }
        }).catch(e => {
          // Fallback to direct download
          const filename = tts.downloadAudio();
          this.toast('✅ Downloaded: ' + filename, 'success');
        });
      } else {
        const filename = tts.downloadAudio();
        this.toast('✅ Downloaded: ' + filename, 'success');
      }
    } catch (e) {
      console.error('Download error:', e);
      this.toast('❌ Download failed: ' + (e.message || 'Unknown error'), 'error');
    }
  },

  _shareAudio() {
    if (!tts.canShareAudio()) {
      this.toast('⚠️ Generate speech first, then share.', 'error');
      return;
    }
    tts.shareAudio().then(result => {
      if (result === 'shared') {
        this.toast('✅ Audio shared!', 'success');
      } else {
        this.toast('🔊 Audio opened — tap the menu to save/share.', 'success');
      }
    }).catch(e => {
      console.error('Share error:', e);
      this.toast('❌ Share failed: ' + (e.message || 'Unknown error'), 'error');
    });
  },
};

// Restore selected voice
const savedVoice = localStorage.getItem('iknbite_selected');
if (savedVoice) {
  UI.selectedVoice = VOICES.find(v => v.id === savedVoice) || null;
}
