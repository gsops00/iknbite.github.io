/* ============================================
   iknbite  |  UI Components & Rendering
   ============================================ */

const UI = {
  // Arabic text detection
  _isArabic(text) {
    var arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicPattern.test(text);
  },

  _rtlClass(text) {
    return this._isArabic(text) ? ' arabic" dir="rtl"' : '"';
  },

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
  // Feature state
  selectedEmotion: "",
  selectedPreset: "",
  selectedFormat: "mp3",
  ssmlMode: false,
  multiSpeakerMode: false,
  translationFrom: "en",
  translationTo: "ar",
  // Voice Library state
  voiceSearch: '',
  voiceSort: 'popular',
  categoryFilter: 'all',

  // ---- Avatar HTML helper ----
  avatarHTML(v, size, active) {
    const px = size || 56;
    const cls = active ? 'voice-avatar active' : 'voice-avatar';
    const shadow = active ? 'box-shadow:0 0 0 3px var(--brand-600),var(--shadow-lg);' : '';
    const borderRadius = Math.round(px * 0.32);
    const fallbackBg = `linear-gradient(135deg,${v.colors[0]},${v.colors[1]})`;
    const avatarSrc = v.avatar || `img/avatars/${v.id}.jpg`;
    return `<img class="${cls}" src="${avatarSrc}" alt="${v.name}" width="${px}" height="${px}" style="width:${px}px;height:${px}px;border-radius:${borderRadius}px;background:${fallbackBg};${shadow}" onerror="this.style.background='${fallbackBg}';this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>${v.emoji}</text></svg>'" />`;
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
    this.history.unshift({ voice: voice.name, avatar: `img/avatars/${voice.id}.jpg`, text: text.substring(0, 100), time: Date.now() });
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

      <!-- Hero — AI-Driven Dynamic Pattern -->
      <div class="anim-fade-in-up" style="text-align:center;padding:80px 0 56px;">
        <div style="position:relative;display:inline-block;margin-bottom:20px;">
          <div style="font-size:64px;filter:drop-shadow(0 0 30px var(--accent-glow));animation:pulse 3s ease-in-out infinite;">🎙️</div>
          <div style="position:absolute;top:-8px;right:-16px;font-size:20px;animation:fadeInUp 1s ease-out 0.3s both;">✨</div>
          <div style="position:absolute;bottom:-4px;left:-20px;font-size:18px;animation:fadeInUp 1s ease-out 0.5s both;">🔊</div>
        </div>
        <h1 style="font-size:clamp(36px,7vw,64px);font-weight:900;letter-spacing:-0.04em;line-height:1.05;margin-bottom:16px;font-family:var(--font-display);">
          <span style="background:linear-gradient(135deg,var(--brand-500),#a78bfa,var(--brand-400));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">iknbite</span>
        </h1>
        <p style="font-size:clamp(16px,2.5vw,20px);color:var(--surface-400);max-width:560px;margin:0 auto 12px;font-weight:400;font-family:var(--font-body);line-height:1.7;">
          AI Voice Studio — generate <strong style="color:var(--surface-700);">natural speech</strong> in
          <strong style="color:var(--brand-500);">70+ voices</strong> across
          <strong style="color:var(--brand-500);">${Object.keys(LANGUAGES).length} languages</strong>.
          Now with <strong style="color:var(--brand-500);">40+ voices</strong>.
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:24px;">
          <button class="btn btn-primary glow-border" onclick="UI.nav('studio')" style="padding:16px 40px;font-size:16px;border-radius:14px;font-family:var(--font-display);font-weight:700;">
            ✨ Voice Studio
          </button>
          <button class="btn btn-success" onclick="UI.nav('images')" style="padding:16px 32px;font-size:16px;border-radius:14px;font-family:var(--font-display);font-weight:600;">
            🖼️ Image Studio
          </button>
          <button class="btn btn-secondary" onclick="UI.nav('voices')" style="padding:16px 32px;font-size:16px;border-radius:14px;font-family:var(--font-display);font-weight:600;">
            🎭 Browse Voices
          </button>
        </div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;font-size:12px;color:var(--surface-400);">
          <span>🧠 Smart AI</span>
          <span>•</span>
          <span>🌐 28 Languages</span>
          <span>•</span>
          <span>🎭 76 Voices</span>
          <span>•</span>
          <span>⚡ ElevenLabs + Edge TTS</span>
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
          <div style="font-size:28px;font-weight:800;color:var(--brand-600);">28</div>
          <div style="font-size:12px;color:var(--surface-400);margin-top:4px;">Emotions</div>
        </div>
        <div class="card" style="padding:20px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:var(--brand-600);">🖼️</div>
          <div style="font-size:12px;color:var(--surface-400);margin-top:4px;">Image Studio</div>
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

    const emotionOptions = Object.entries(EMOTIONS).map(([k,e]) =>
      `<option value="${k}" ${this.selectedEmotion===k?'selected':''}>${e.emoji} ${e.label}</option>`
    ).join('');
    const presetOptions = Object.entries(PRESETS).map(([k,p]) =>
      `<option value="${k}" ${this.selectedPreset===k?'selected':''}>${p.emoji} ${p.label}</option>`
    ).join('');
    const formatOptions = Object.entries(FormatHelper.formats).map(([k,f]) =>
      `<option value="${k}" ${this.selectedFormat===k?'selected':''}>${f.label}</option>`
    ).join('');

    const transLangs = Object.entries(LANGUAGES).map(([k,v2]) =>
      `<option value="${k}">${v2}</option>`
    ).join('');

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

          <!-- Feature Controls Row -->
          <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center;">
            <div style="display:flex;align-items:center;gap:4px;">
              <span style="font-size:12px;color:var(--surface-400);">Preset:</span>
              <select onchange="UI._applyPreset(this.value)" style="padding:4px 8px;border-radius:6px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:12px;font-family:var(--font);">
                <option value="">None</option>
                ${presetOptions}
              </select>
            </div>
            <div style="display:flex;align-items:center;gap:4px;">
              <span style="font-size:12px;color:var(--surface-400);">Emotion:</span>
              <select onchange="UI.selectedEmotion=this.value" style="padding:4px 8px;border-radius:6px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:12px;font-family:var(--font);">
                <option value="">None</option>
                ${emotionOptions}
              </select>
            </div>
            <div style="display:flex;align-items:center;gap:4px;">
              <span style="font-size:12px;color:var(--surface-400);">Format:</span>
              <select onchange="UI.selectedFormat=this.value" style="padding:4px 8px;border-radius:6px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:12px;font-family:var(--font);">
                ${formatOptions}
              </select>
            </div>
            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:12px;color:var(--surface-400);">
              <input type="checkbox" onchange="UI.ssmlMode=this.checked" ${this.ssmlMode?'checked':''} /> SSML
            </label>
            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:12px;color:var(--surface-400);">
              <input type="checkbox" onchange="UI.multiSpeakerMode=this.checked;UI.render()" ${this.multiSpeakerMode?'checked':''} /> Multi-Speaker
            </label>
          </div>

          <!-- AI Quick Actions Row -->
          <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;">
            <button class="btn btn-ghost" onclick="UI._smartRecommend()" title="AI analyzes text and auto-fills voice/emotion/speed" style="font-size:12px;padding:6px 10px;border-radius:8px;">🧠 Smart AI</button>
            <button class="btn btn-ghost" onclick="UI._improveWriting()" title="Fix grammar, improve punctuation and flow" style="font-size:12px;padding:6px 10px;border-radius:8px;">✨ AI Writing</button>
            <button class="btn btn-ghost" onclick="UI._translateText()" title="Translate text before generation" style="font-size:12px;padding:6px 10px;border-radius:8px;">🌐 Translate</button>
            <div style="display:flex;align-items:center;gap:4px;margin-left:auto;">
              <select id="trans-from" style="padding:4px 6px;border-radius:6px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:11px;font-family:var(--font);">
                ${Object.entries(LANGUAGES).map(([k,l2]) => `<option value="${k}" ${this.translationFrom===k?'selected':''}>${l2}</option>`).join('')}
              </select>
              <span style="font-size:11px;color:var(--surface-400);">→</span>
              <select id="trans-to" style="padding:4px 6px;border-radius:6px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:11px;font-family:var(--font);">
                ${Object.entries(LANGUAGES).map(([k,l2]) => `<option value="${k}" ${this.translationTo===k?'selected':''}>${l2}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Multi-Speaker Input or Normal Input -->
          ${this.multiSpeakerMode ? `
          <textarea class="editor-textarea" placeholder="Multi-speaker format:\n\nJohn: Hello there!\nSarah: Hi John, how are you?" oninput="UI.text=this.value;UI._updateCharCount()" id="editor-textarea" style="min-height:180px;">${this.text}</textarea>
          ` : `
          <textarea class="editor-textarea" placeholder="Type or paste your text here..." oninput="UI.text=this.value;UI._updateCharCount()" id="editor-textarea">${this.text}</textarea>
          `}

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

  _getFilteredVoices() {
    let filtered = [...VOICES];

    // Search filter
    if (this.voiceSearch) {
      const q = this.voiceSearch.toLowerCase();
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.desc.toLowerCase().includes(q) ||
        (LANGUAGES[v.lang] || '').toLowerCase().includes(q) ||
        (v.style || '').toLowerCase().includes(q)
      );
    }

    // Language filter
    if (this.langFilter !== 'all') filtered = filtered.filter(v => v.lang === this.langFilter);

    // Gender filter
    if (this.genderFilter !== 'all') filtered = filtered.filter(v => v.gender === this.genderFilter);

    // Category filter
    if (this.categoryFilter !== 'all') filtered = filtered.filter(v => (v.style || '') === this.categoryFilter);

    // Favorites filter
    if (this.voiceSort === 'favorites') filtered = filtered.filter(v => this.isFav(v.id));

    // Sort
    switch (this.voiceSort) {
      case 'popular': filtered.sort((a,b) => (b.popular?1:0) - (a.popular?1:0) || b.uses.localeCompare(a.uses)); break;
      case 'newest': filtered.sort((a,b) => (b.isNew?1:0) - (a.isNew?1:0)); break;
      case 'az': filtered.sort((a,b) => a.name.localeCompare(b.name)); break;
      case 'quality': filtered.sort((a,b) => ({Studio:3,HD:2,Expressive:1}[b.quality]||0) - ({Studio:3,HD:2,Expressive:1}[a.quality]||0)); break;
      case 'recent': {
        const recent = JSON.parse(localStorage.getItem('iknbite_recent_voices') || '[]');
        filtered.sort((a,b) => (recent.indexOf(b.id) === -1 ? 999 : recent.indexOf(b.id)) - (recent.indexOf(a.id) === -1 ? 999 : recent.indexOf(a.id)));
        break;
      }
      case 'favorites': filtered.sort((a,b) => (b.popular?1:0) - (a.popular?1:0)); break;
    }

    return filtered;
  },

  _renderVoiceCard(v) {
    const isActive = this.selectedVoice && this.selectedVoice.id === v.id;
    const isFav = this.isFav(v.id);
    const genderIcon = v.gender === 'f' ? '♀' : '♂';
    const langLabel = LANGUAGES[v.lang] || v.lang;
    const badges = [];
    if (v.premium) badges.push('<span class="vbadge premium">⭐ Premium</span>');
    if (v.isNew) badges.push('<span class="vbadge new">🆕 New</span>');
    if (v.popular) badges.push('<span class="vbadge popular">🔥 Popular</span>');
    if (!v.premium) badges.push('<span class="vbadge free">🆓 Free</span>');

    return `
      <div class="vcard ${isActive ? 'active' : ''} ${isFav ? 'fav' : ''}" onclick="UI.selectVoice('${v.id}')" tabindex="0" role="button" aria-label="Select ${v.name} voice">
        <div class="vcard-header">
          ${this.avatarHTML(v, 52, isActive)}
          <button class="vcard-fav ${isFav ? 'active' : ''}" onclick="event.stopPropagation();UI.toggleFav('${v.id}')" aria-label="Toggle favorite" title="Favorite">
            ${isFav ? '♥' : '♡'}
          </button>
          ${isActive ? '<div class="vcard-check">✓</div>' : ''}
        </div>
        <div class="vcard-body">
          <div class="vcard-name">${v.name}</div>
          <div class="vcard-meta">${genderIcon} ${langLabel} ${v.accent ? '• ' + v.accent : ''}</div>
          <div class="vcard-style">${v.style || ''} ${v.age ? '• ' + v.age : ''}</div>
          <div class="vcard-badges">${badges.join('')}</div>
        </div>
        <div class="vcard-footer">
          <span class="vcard-uses">${v.uses || ''} uses</span>
          <button class="vcard-preview" onclick="event.stopPropagation();tts.preview(UI.findVoice('${v.id}')).catch(()=>UI.toast('Preview not available','error'))" title="Preview 10s" aria-label="Preview ${v.name}">
            ▶ 10s
          </button>
        </div>
      </div>`;
  },

  _renderVoiceGrid() {
    const filtered = this._getFilteredVoices();
    const langs = [...new Set(VOICES.map(v => v.lang))].sort();
    const cats = [...new Set(VOICES.map(v => v.style).filter(Boolean))].sort();
    const sortOptions = [
      ['popular','🔥 Most Popular'],['newest','🆕 Newest'],['az','🔤 A-Z'],
      ['quality','✨ Highest Quality'],['recent','🕐 Recently Used'],['favorites','♥ Favorites']
    ];

    // Recently used voices
    const recentIds = JSON.parse(localStorage.getItem('iknbite_recent_voices') || '[]').slice(0,6);
    const recentVoices = recentIds.map(id => VOICES.find(v => v.id === id)).filter(Boolean);

    return `
    <div class="card" style="padding:20px;">
      <!-- Search Bar -->
      <div class="vl-search-wrap">
        <span class="vl-search-icon">🔍</span>
        <input class="vl-search" type="text" placeholder="Search voices by name, language, or style..." value="${this.voiceSearch}" oninput="UI.voiceSearch=this.value;UI._rerenderGrid()" aria-label="Search voices" />
        ${this.voiceSearch ? '<button class="vl-search-clear" onclick="UI.voiceSearch=\'\';UI._rerenderGrid()">✕</button>' : ''}
      </div>

      <!-- Sort + Stats Row -->
      <div class="vl-controls-row">
        <div class="vl-stats">${filtered.length} voice${filtered.length!==1?'s':''}</div>
        <div class="vl-sort">
          <span class="vl-sort-label">Sort:</span>
          <select class="vl-sort-select" onchange="UI.voiceSort=this.value;UI._rerenderGrid()" aria-label="Sort voices">
            ${sortOptions.map(([k,l]) => `<option value="${k}" ${this.voiceSort===k?'selected':''}>${l}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Filter Chips: Gender -->
      <div class="vl-chip-row">
        <button class="vl-chip ${this.genderFilter==='all'?'active':''}" onclick="UI.genderFilter='all';UI._rerenderGrid()">All</button>
        <button class="vl-chip ${this.genderFilter==='f'?'active':''}" onclick="UI.genderFilter='f';UI._rerenderGrid()">♀ Female</button>
        <button class="vl-chip ${this.genderFilter==='m'?'active':''}" onclick="UI.genderFilter='m';UI._rerenderGrid()">♂ Male</button>
      </div>

      <!-- Filter Chips: Languages -->
      <div class="vl-chip-row scrollable">
        <button class="vl-chip lang ${this.langFilter==='all'?'active':''}" onclick="UI.langFilter='all';UI._rerenderGrid()">All Languages</button>
        ${langs.map(l => `<button class="vl-chip lang ${this.langFilter===l?'active':''}" onclick="UI.langFilter='${l}';UI._rerenderGrid()">${LANGUAGES[l]} <span class="vl-chip-count">${VOICES.filter(v=>v.lang===l).length}</span></button>`).join('')}
      </div>

      <!-- Filter Chips: Categories -->
      <div class="vl-chip-row scrollable">
        <button class="vl-chip cat ${this.categoryFilter==='all'?'active':''}" onclick="UI.categoryFilter='all';UI._rerenderGrid()">All Styles</button>
        ${cats.map(c => `<button class="vl-chip cat ${this.categoryFilter===c?'active':''}" onclick="UI.categoryFilter='${c}';UI._rerenderGrid()">${c}</button>`).join('')}
      </div>

      <!-- Recently Used -->
      ${recentVoices.length > 0 && this.voiceSort !== 'favorites' && this.langFilter === 'all' && this.genderFilter === 'all' && this.categoryFilter === 'all' && !this.voiceSearch ? `
      <div class="vl-section">
        <h3 class="vl-section-title">🕐 Recently Used</h3>
        <div class="vl-recent-row">
          ${recentVoices.map(v => `
            <div class="vl-recent-chip" onclick="UI.selectVoice('${v.id}');UI.nav('studio')">
              ${this.avatarHTML(v, 32, false)}
              <span>${v.name}</span>
            </div>
          `).join('')}
        </div>
      </div>` : ''}

      <!-- Voice Grid -->
      <div class="vl-grid">
        ${filtered.map(v => this._renderVoiceCard(v)).join('')}
      </div>

      ${filtered.length === 0 ? '<div class="vl-empty"><div style="font-size:48px;margin-bottom:12px;">🔇</div><p>No voices match your filters.</p><button class="btn btn-secondary" onclick="UI.voiceSearch=&apos;&apos;;UI.langFilter=&apos;all&apos;;UI.genderFilter=&apos;all&apos;;UI.categoryFilter=&apos;all&apos;;UI.voiceSort=&apos;popular&apos;;UI._rerenderGrid()">Clear All Filters</button></div>' : ''}
    </div>`;
  },

  _rerenderGrid() {
    const gridContainer = document.querySelector('.vl-grid');
    const searchWrap = document.querySelector('.vl-search-wrap');
    if (gridContainer) {
      // Re-render just the grid section
      const temp = document.createElement('div');
      temp.innerHTML = this._renderVoiceGrid();
      const newCard = temp.querySelector('.card');
      if (newCard) {
        const oldCard = document.querySelector('.card');
        if (oldCard) oldCard.outerHTML = newCard.outerHTML;
      }
    } else {
      this.render();
    }
  },

  // ---- Voices Page ----
  renderVoices() {
    return `
    <div class="hero-bg"></div>
    <div style="max-width:1200px;margin:0 auto;padding:24px 20px 80px;">
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
            For real AI voices (male + female, 300+ voices), connect an Edge TTS backend.
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;"><span>Status</span><span style="color:${(tts.elevenLabsKey||tts.easyVoiceKey||tts.edgeTTSApiUrl)?'#10b981':'#f59e0b'}">${tts.elevenLabsKey ? '✅ ElevenLabs Connected' : tts.easyVoiceKey ? '✅ EasyVoice Connected' : tts.edgeTTSApiUrl ? '✅ Edge TTS Connected' : '⚠️ Using Web Speech API (limited)'}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:13px;"><span>Voices available</span><span>${tts.edgeTTSApiUrl ? '300+ (Edge TTS)' : tts.getVoices().length + ' (browser)'}</span></div>
            <div style="margin-top:8px;">
              <label style="font-size:12px;color:var(--surface-400);display:block;margin-bottom:4px;">Edge TTS API URL</label>
              <div style="display:flex;gap:6px;">
                <input id="tts-api-input" type="url" placeholder="https://your-worker.workers.dev"
                  value="${localStorage.getItem('iknbite_tts_api') || ''}"
                  style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:13px;font-family:var(--font);"
                />
                <button class="btn btn-primary" onclick="UI._saveTTSApi()" style="padding:8px 16px;font-size:13px;border-radius:8px;">Save</button>
              </div>
              <div style="font-size:11px;color:var(--surface-400);margin-top:6px;line-height:1.5;">
                <strong>Free deploy options:</strong><br>
                1. Cloudflare Worker: deploy <code style="background:var(--surface-100);padding:1px 4px;border-radius:4px;">edge-tts-worker.js</code> — free tier, no server needed<br>
                2. Docker: <code style="background:var(--surface-100);padding:1px 4px;border-radius:4px;">docker run -d -p 5050:5050 travisvn/openai-edge-tts:latest</code>
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
      case 'images': html = this.renderImages(); break;
      case 'history': html = this.renderHistory(); break;
      case 'settings': html = this.renderSettings(); break;
      case 'training': html = this.renderTraining(); break;
      case 'features': html = this.renderFeatures(); break;
      case 'chat': html = this.renderChat(); break;
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

  _applyPreset(key) {
    this.selectedPreset = key;
    if (!key || !PRESETS[key]) return;
    const p = PRESETS[key];
    this.rate = p.speed;
    this.pitch = p.pitch;
    if (p.emotion && EMOTIONS[p.emotion]) {
      this.selectedEmotion = p.emotion;
    }
    this.toast(`✅ Preset "${p.label}" applied`, 'success');
    this.render();
  },

  _smartRecommend() {
    if (!this.text.trim()) { this.toast('Enter some text first to get recommendations', 'error'); return; }
    const rec = SmartRecommender.analyze(this.text);
    if (rec.bestVoice) {
      const v = VOICES.find(voice => voice.id === rec.bestVoice);
      if (v) { this.selectedVoice = v; localStorage.setItem('iknbite_selected', v.id); }
    }
    if (rec.emotion) this.selectedEmotion = rec.emotion;
    if (rec.speed) this.rate = rec.speed;
    this.toast(`🧠 Smart: emotion=${rec.emotion}, speed=${rec.speed}x, confidence=${Math.round(rec.confidence*100)}%`, 'success');
    this.render();
  },

  _improveWriting() {
    if (!this.text.trim()) { this.toast('Enter some text first', 'error'); return; }
    const improved = WritingAssistant.improve(this.text);
    this.text = improved;
    const ta = document.getElementById('editor-textarea');
    if (ta) ta.value = improved;
    this._updateCharCount();
    this.toast('✨ Text improved — grammar and punctuation fixed', 'success');
  },

  async _translateText() {
    if (!this.text.trim()) { this.toast('Enter some text first', 'error'); return; }
    const fromEl = document.getElementById('trans-from');
    const toEl = document.getElementById('trans-to');
    const from = fromEl ? fromEl.value : this.translationFrom;
    const to = toEl ? toEl.value : this.translationTo;
    if (from === to) { this.toast('Source and target languages must differ', 'error'); return; }
    this.toast('🌐 Translating...', '');
    try {
      const translated = await Translator.translate(this.text, from, to);
      if (translated && translated !== this.text) {
        this.text = translated;
        const ta = document.getElementById('editor-textarea');
        if (ta) ta.value = translated;
        this._updateCharCount();
        this.toast(`✅ Translated: ${LANGUAGES[from]} → ${LANGUAGES[to]}`, 'success');
      } else {
        this.toast('⚠️ Translation returned same text', 'error');
      }
    } catch (e) {
      this.toast('❌ Translation failed: ' + (e.message || 'Unknown error'), 'error');
    }
  },

  _parseMultiSpeaker(text) {
    const speakers = [];
    const lines = text.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const match = line.match(/^([A-Za-z\u0600-\u06FF\u4e00-\u9fff]+):\s*(.+)/);
      if (match) {
        speakers.push({ name: match[1].trim(), text: match[2].trim() });
      } else if (speakers.length > 0) {
        speakers[speakers.length - 1].text += ' ' + line.trim();
      }
    }
    return speakers;
  },

  async _generate() {
    if (!this.text.trim()) { this.toast('Please enter some text first', 'error'); return; }
    if (!this.selectedVoice) { this.toast('Please select a voice first', 'error'); return; }
    if (!tts.isSupported()) { this.toast('Speech synthesis not supported in this browser', 'error'); return; }

    this.isGenerating = true;
    this.isPlaying = true;
    this.render();

    try {
      let textToSpeak = this.text;
      let speakOpts = { rate: this.rate, pitch: this.pitch, volume: 1.0 };

      // Apply emotion modifiers
      if (this.selectedEmotion && typeof EMOTIONS !== 'undefined' && EMOTIONS[this.selectedEmotion]) {
        const em = EMOTIONS[this.selectedEmotion];
        speakOpts.rate = Math.max(0.5, Math.min(2.0, this.rate + (em.rateMod || 0)));
        speakOpts.pitch = Math.max(0.5, Math.min(2.0, this.pitch + (em.pitchMod || 0)));
      }

      // SSML mode
      if (this.ssmlMode && typeof SSMLBuilder !== 'undefined') {
        textToSpeak = SSMLBuilder.wrap(textToSpeak, {
          rate: speakOpts.rate.toFixed(1),
          pitch: speakOpts.pitch.toFixed(1),
          volume: '100',
        });
      }

      // Multi-speaker mode
      if (this.multiSpeakerMode && typeof MultiSpeakerParser !== 'undefined') {
        const segments = this._parseMultiSpeaker(textToSpeak);
        if (segments.length > 0) {
          for (const seg of segments) {
            this.addHistory(this.selectedVoice, seg.text);
            await tts.speak(seg.text, this.selectedVoice, speakOpts);
          }
          this.toast(`✅ Generated ${segments.length} segments!`, 'success');
        } else {
          this.toast('⚠️ No speaker segments found. Use format: Name: text', 'error');
        }
      } else {
        this.addHistory(this.selectedVoice, textToSpeak);
        await tts.speak(textToSpeak, this.selectedVoice, speakOpts);
        this.toast('✅ Speech generated!', 'success');
      }
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

  _saveElevenLabs() {
    const input = document.getElementById('el-key-input');
    if (!input) return;
    const key = input.value.trim();
    if (key) {
      localStorage.setItem('iknbite_el_key', key);
      tts.configure({ elevenLabsKey: key });
      this.toast('✅ ElevenLabs saved — highest quality AI voices active!', 'success');
    } else {
      localStorage.removeItem('iknbite_el_key');
      tts.configure({ elevenLabsKey: '' });
      this.toast('🔄 ElevenLabs cleared', 'success');
    }
  },

  _downloadAudio() {
    if (!tts.canDownload()) {
      this.toast('⚠️ Generate speech first, then download.', 'error');
      return;
    }
    this.toast('⏳ Starting download...', 'info');
    try {
      if (tts.isMobile()) {
        // On mobile, try Web Share API first (best UX)
        if (navigator.share && navigator.canShare) {
          tts.shareAudio().then(result => {
            if (result === 'shared') {
              this.toast('✅ Audio shared!', 'success');
            } else {
              this.toast('🔊 Audio opened — tap the menu to save/share.', 'success');
            }
          }).catch(() => {
            // Fallback: direct download
            try {
              const filename = tts.downloadAudio();
              this.toast('✅ Downloaded: ' + filename, 'success');
            } catch(e2) {
              this.toast('❌ Download failed. Try the Share button instead.', 'error');
            }
          });
          return;
        }
      }
      // Desktop or mobile without Web Share API
      const filename = tts.downloadAudio();
      this.toast('✅ Downloaded: ' + filename, 'success');
    } catch (e) {
      console.error('Download error:', e);
      // Last resort: open in new tab
      try {
        if (tts.lastAudioBlob) {
          const url = URL.createObjectURL(tts.lastAudioBlob);
          window.open(url, '_blank');
          this.toast('🔊 Audio opened — long-press to save.', 'success');
          setTimeout(() => URL.revokeObjectURL(url), 60000);
          return;
        }
      } catch(e2) {}
      this.toast('❌ Download failed: ' + (e.message || 'Unknown error'), 'error');
    }
  },

  // ---- Training Page ----

  // ---- Chat Page (AI Script Generator) ----
  renderChat() {
    const templates = Object.entries(ChatBot.TEMPLATES).map(([k, t]) =>
      `<button class="chat-template ${k === ChatBot.selectedTemplate ? 'active' : ''}" onclick="ChatBot.selectedTemplate='${k}';UI.render()" title="${t.desc}">
        <span class="chat-template-icon">${t.icon}</span>
        <span class="chat-template-label">${t.label.replace(/^[^\s]+\s/, '')}</span>
      </button>`
    ).join('');

    const messages = ChatBot.messages.map((m, mi) => {
      if (m.role === 'user') {
        var rtl = this._rtlClass(m.content); return `<div class="chat-msg chat-user"><div class="chat-msg-content${rtl}>${this._escHtml(m.content)}</div></div>`;
      } else {
        const badge = m.source === 'AI' ? '<span class="chat-badge chat-badge-ai">AI</span>' : '<span class="chat-badge chat-badge-local">Local</span>';
        const typeLabel = m.template ? ChatBot.TEMPLATES[m.template]?.icon || '' : '';
        return `<div class="chat-msg chat-assistant">
          <div class="chat-msg-header">${typeLabel} ${badge}</div>
          <div class="chat-msg-content${UI._rtlClass(m.content)}>${this._formatScript(m.content)}</div>
          <div class="chat-msg-actions">
            <button class="btn btn-ghost btn-sm" onclick="ChatBot.sendToStudio(ChatBot.messages[mi]?.content||'')" title="Use in Studio">📝 Send to Studio</button>
            <button class="btn btn-ghost btn-sm" onclick="navigator.clipboard.writeText(ChatBot.messages[mi]?.content||'').then(function(){UI.toast('Copied!','success')})" title="Copy">📋 Copy</button>
          </div>
        </div>`;
      }
    }).join('');

    return `
    <div class="hero-bg"></div>
    <div class="chat-container">
      <div class="chat-header">
        <div>
          <h1 style="font-size:22px;font-weight:800;margin:0;">🤖 Script Assistant</h1>
          <p style="font-size:12px;color:var(--surface-400);margin:4px 0 0;">Generate narration scripts, stories, podcasts & more — powered by free open-source AI</p>
        </div>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-ghost btn-sm" onclick="ChatBot.clearChat();UI.render()" title="Clear chat">🗑️ Clear</button>
        </div>
      </div>

      <!-- Template Selector -->
      <div class="chat-templates">${templates}</div>

      <!-- Chat Messages -->
      <div class="chat-messages" id="chat-messages">
        ${ChatBot.messages.length === 0 ? `
          <div class="chat-empty">
            <div style="font-size:48px;margin-bottom:12px;">🤖</div>
            <h3 style="font-size:16px;font-weight:700;margin:0 0 8px;">What should I write?</h3>
            <p style="font-size:13px;color:var(--surface-400);margin:0 0 16px;">Choose a template above, then describe what you need.</p>
            <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;">
              <button class="btn btn-ghost btn-sm" onclick="document.getElementById('chat-input').value='Write a narration about the history of artificial intelligence';UI.render()">AI History</button>
              <button class="btn btn-ghost btn-sm" onclick="document.getElementById('chat-input').value='Write a podcast script about the future of space exploration';UI.render()">Space Podcast</button>
              <button class="btn btn-ghost btn-sm" onclick="document.getElementById('chat-input').value='Write an ad script for a new meditation app';UI.render()">Meditation App Ad</button>
              <button class="btn btn-ghost btn-sm" onclick="document.getElementById('chat-input').value='Write a short story about a robot learning to paint';UI.render()">Robot Story</button>
              <button class="btn btn-ghost btn-sm" onclick="document.getElementById('chat-input').value='Write a 60-second TikTok script about productivity tips';UI.render()">TikTok Tips</button>
              <button class="btn btn-ghost btn-sm" onclick="document.getElementById('chat-input').value='Write a guided meditation for better sleep';UI.render()">Sleep Meditation</button>
            </div>
          </div>
        ` : messages}
      </div>

      <!-- Thinking Indicator -->
      <div id="chat-thinking" class="chat-thinking" style="display:none;">
        <div class="chat-thinking-dots">
          <span class="chat-thinking-dot"></span>
          <span class="chat-thinking-dot"></span>
          <span class="chat-thinking-dot"></span>
        </div>
        <span class="chat-thinking-label">Thinking...</span>
      </div>

      <!-- Input -->
      <div class="chat-input-wrap">
        <textarea id="chat-input" class="chat-input" rows="2" placeholder="Describe what you want to write..."
          onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();UI._chatSend()}"
        ></textarea>
        <button class="chat-send" onclick="UI._chatSend()" id="chat-send-btn">
          <span id="chat-send-icon">➤</span>
        </button>
      </div>
    </div>`;
  },

  _escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },

  _formatScript(text) {
    return this._escHtml(text)
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  },

  async _chatSend() {
    const input = document.getElementById('chat-input');
    const btn = document.getElementById('chat-send-btn');
    const icon = document.getElementById('chat-send-icon');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg || ChatBot.isGenerating) return;

    input.value = '';
    btn.disabled = true;
    icon.textContent = '⏳';
    ChatBot.isGenerating = true;

    // Re-render to show user message
    this.render();
    const container = document.getElementById('chat-messages');
    if (container) container.scrollTop = container.scrollHeight;

    try {
      const result = await ChatBot.generate(msg);
      const src = result.source === 'AI' ? 'AI-powered' : 'local templates';
      this.toast(`✅ Script generated (${src})`, 'success');
    } catch (e) {
      this.toast('❌ Generation failed: ' + e.message, 'error');
    }

    ChatBot.isGenerating = false;
    btn.disabled = false;
    icon.textContent = '➤';
    this.render();

    // Scroll to bottom
    setTimeout(() => {
      const c = document.getElementById('chat-messages');
      if (c) c.scrollTop = c.scrollHeight;
    }, 100);
  },


  renderTraining() {
    return `
    <div class="hero-bg"></div>
    <div style="max-width:800px;margin:0 auto;padding:24px 20px 80px;">
      <div class="anim-fade-in-up" style="margin-bottom:24px;">
        <h1 style="font-size:28px;font-weight:800;">🎓 Voice Training</h1>
        <p style="font-size:14px;color:var(--surface-400);margin-top:4px;">Train custom TTS voices using open-source models</p>
      </div>

      <div class="anim-stagger" style="display:flex;flex-direction:column;gap:12px;">

        <!-- Pipeline Steps -->
        <div class="card" style="padding:20px;">
          <div style="font-weight:600;font-size:14px;margin-bottom:12px;">Training Pipeline</div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:10px;background:var(--surface-50);">
              <span style="width:28px;height:28px;border-radius:8px;background:var(--brand-600);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;">1</span>
              <div>
                <div style="font-size:13px;font-weight:600;">Data Preparation</div>
                <div style="font-size:11px;color:var(--surface-400);">Scan datasets, validate audio, normalize, split</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:10px;background:var(--surface-50);">
              <span style="width:28px;height:28px;border-radius:8px;background:var(--brand-600);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;">2</span>
              <div>
                <div style="font-size:13px;font-weight:600;">Model Selection</div>
                <div style="font-size:11px;color:var(--surface-400);">AI picks the best model for your hardware and data</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:10px;background:var(--surface-50);">
              <span style="width:28px;height:28px;border-radius:8px;background:var(--brand-600);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;">3</span>
              <div>
                <div style="font-size:13px;font-weight:600;">Training</div>
                <div style="font-size:11px;color:var(--surface-400);">Mixed precision, checkpointing, early stopping</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:10px;background:var(--surface-50);">
              <span style="width:28px;height:28px;border-radius:8px;background:var(--brand-600);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;">4</span>
              <div>
                <div style="font-size:13px;font-weight:600;">Evaluation</div>
                <div style="font-size:11px;color:var(--surface-400);">Naturalness, pronunciation, stability, speed</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:10px;background:var(--surface-50);">
              <span style="width:28px;height:28px;border-radius:8px;background:var(--brand-600);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;">5</span>
              <div>
                <div style="font-size:13px;font-weight:600;">Export & Deploy</div>
                <div style="font-size:11px;color:var(--surface-400);">ONNX, Piper, Kokoro — ready for production</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Supported Models -->
        <div class="card" style="padding:20px;">
          <div style="font-weight:600;font-size:14px;margin-bottom:12px;">Supported Models</div>
          <div style="overflow-x:auto;">
            <table style="width:100%;font-size:12px;border-collapse:collapse;">
              <thead>
                <tr style="border-bottom:1px solid var(--surface-200);">
                  <th style="text-align:left;padding:6px 8px;font-weight:600;">Model</th>
                  <th style="text-align:left;padding:6px 8px;font-weight:600;">Quality</th>
                  <th style="text-align:left;padding:6px 8px;font-weight:600;">Languages</th>
                  <th style="text-align:left;padding:6px 8px;font-weight:600;">Clone</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid var(--surface-100);"><td style="padding:6px 8px;">Kokoro</td><td style="padding:6px 8px;">⭐⭐⭐⭐⭐</td><td style="padding:6px 8px;">English</td><td style="padding:6px 8px;">—</td></tr>
                <tr style="border-bottom:1px solid var(--surface-100);"><td style="padding:6px 8px;">Piper</td><td style="padding:6px 8px;">⭐⭐⭐⭐</td><td style="padding:6px 8px;">30+</td><td style="padding:6px 8px;">—</td></tr>
                <tr style="border-bottom:1px solid var(--surface-100);"><td style="padding:6px 8px;">MeloTTS</td><td style="padding:6px 8px;">⭐⭐⭐⭐</td><td style="padding:6px 8px;">14+</td><td style="padding:6px 8px;">—</td></tr>
                <tr style="border-bottom:1px solid var(--surface-100);"><td style="padding:6px 8px;">Chatterbox</td><td style="padding:6px 8px;">⭐⭐⭐⭐½</td><td style="padding:6px 8px;">English</td><td style="padding:6px 8px;">✅</td></tr>
                <tr style="border-bottom:1px solid var(--surface-100);"><td style="padding:6px 8px;">Coqui XTTS</td><td style="padding:6px 8px;">⭐⭐⭐⭐</td><td style="padding:6px 8px;">16+</td><td style="padding:6px 8px;">✅</td></tr>
                <tr><td style="padding:6px 8px;">StyleTTS 2</td><td style="padding:6px 8px;">⭐⭐⭐⭐⭐</td><td style="padding:6px 8px;">English</td><td style="padding:6px 8px;">—</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Datasets — AnyClaw Full Catalog -->
        <div class="card" style="padding:20px;">
          <div style="font-weight:600;font-size:14px;margin-bottom:4px;">&#128218; Training Datasets</div>
          <div style="font-size:11px;color:var(--surface-400);margin-bottom:12px;">12 datasets — 5,800+ hours across 28 languages. All open-source, ready for training.</div>
          <div style="overflow-x:auto;">
            <table style="width:100%;font-size:12px;border-collapse:collapse;">
              <thead>
                <tr style="border-bottom:2px solid var(--surface-200);">
                  <th style="text-align:left;padding:6px 8px;font-weight:700;">Dataset</th>
                  <th style="text-align:left;padding:6px 8px;font-weight:700;">Language</th>
                  <th style="text-align:left;padding:6px 8px;font-weight:700;">Hours</th>
                  <th style="text-align:left;padding:6px 8px;font-weight:700;">License</th>
                  <th style="text-align:left;padding:6px 8px;font-weight:700;">Use Case</th>
                </tr>
              </thead>
              <tbody id="anyclaw-datasets"></tbody>
            </table>
          </div>
          <div style="margin-top:12px;padding:10px;border-radius:8px;background:var(--surface-50);border:1px solid var(--surface-200);font-size:11px;color:var(--surface-400);">
            <strong>Total:</strong> 5,800+ hours | <strong>Languages:</strong> English, Arabic, Japanese, Chinese, Korean, German, Spanish, French, + 20 more | <strong>Speakers:</strong> 2,800+ unique speakers
          </div>
        </div>

        <!-- Quick Start -->
        <div class="card" style="padding:20px;">
          <div style="font-weight:600;font-size:14px;margin-bottom:12px;">Quick Start</div>
          <div style="font-size:12px;font-family:monospace;background:var(--surface-900);color:var(--surface-100);padding:12px;border-radius:8px;overflow-x:auto;white-space:pre;line-height:1.6;"># 1. Prepare data
curl -X POST http://localhost:5050/v1/training/prepare \
  -H "Content-Type: application/json" \
  -d '{"datasets":[["en","train-clean-100"]]}'

# 2. Start training
curl -X POST http://localhost:5050/v1/training/start \
  -H "Content-Type: application/json" \
  -d '{"model_name":"kokoro","voice_id":"my_voice","epochs":50}'

# 3. Evaluate
curl http://localhost:5050/v1/training/evaluate/my_voice

# 4. Export
curl -X POST http://localhost:5050/v1/training/export \
  -H "Content-Type: application/json" \
  -d '{"voice_id":"my_voice","format":"onnx"}'</div>
        </div>

        <!-- Link -->
        <div style="text-align:center;padding:8px;">
          <a href="https://github.com/gsops00/iknbite.github.io/tree/main/tts-engine/training" target="_blank" style="font-size:13px;color:var(--brand-600);text-decoration:none;font-weight:500;">
            View training source on GitHub →
          </a>
        </div>

      </div>
    </div>`;
  },

  // ---- Features Page ----
  renderFeatures() {
    const emotionCards = Object.entries(EMOTIONS).map(([k,e]) =>
      `<div class="card" style="padding:12px;cursor:pointer;" onclick="UI._testEmotion('${k}')">
        <div style="font-size:28px;text-align:center;">${e.emoji}</div>
        <div style="font-weight:600;font-size:13px;text-align:center;margin-top:4px;">${e.label}</div>
        <div style="font-size:10px;color:var(--surface-400);text-align:center;">pitch ${e.pitchMod > 0 ? '+' : ''}${e.pitchMod.toFixed(2)} | rate ${e.rateMod > 0 ? '+' : ''}${e.rateMod.toFixed(2)}</div>
      </div>`
    ).join('');

    const presetCards = Object.entries(PRESETS).map(([k,p]) =>
      `<div class="card" style="padding:12px;cursor:pointer;" onclick="UI._testPreset('${k}')">
        <div style="font-size:22px;text-align:center;">${p.emoji}</div>
        <div style="font-weight:600;font-size:13px;text-align:center;margin-top:4px;">${p.label}</div>
        <div style="font-size:10px;color:var(--surface-400);text-align:center;">${p.speed}x speed | ${p.emotion}</div>
        <div style="font-size:10px;color:var(--surface-500);text-align:center;margin-top:2px;">${p.desc}</div>
      </div>`
    ).join('');

    const categoryCards = Object.entries(VOICE_CATEGORIES).map(([k,c]) =>
      `<div class="card" style="padding:12px;cursor:pointer;" onclick="UI._testCategory('${k}')">
        <div style="font-size:22px;text-align:center;">${c.emoji}</div>
        <div style="font-weight:600;font-size:13px;text-align:center;margin-top:4px;">${c.label}</div>
        <div style="font-size:10px;color:var(--surface-400);text-align:center;">${c.desc}</div>
      </div>`
    ).join('');

    const langOptions = Object.entries(LANGUAGES).map(([k,v]) =>
      `<option value="${k}">${v}</option>`
    ).join('');

    return `
    <div class="hero-bg"></div>
    <div style="max-width:1080px;margin:0 auto;padding:24px 20px 80px;">
      <div class="anim-fade-in-up" style="text-align:center;margin-bottom:32px;">
        <h1 style="font-size:clamp(24px,4vw,36px);font-weight:900;">⚡ Feature Lab</h1>
        <p style="font-size:14px;color:var(--surface-400);margin-top:4px;">Interactive tools — try every feature live</p>
      </div>

      <!-- ============ EMOTION TESTER ============ -->
      <div class="anim-fade-in-up card" style="padding:24px;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <span style="font-size:22px;">🎭</span>
          <h2 style="font-size:18px;font-weight:800;">Emotion Tester</h2>
        </div>
        <p style="font-size:13px;color:var(--surface-400);margin-bottom:12px;">Click an emotion, then hear how it changes the voice. Modifiers apply pitch & speed adjustments.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;margin-bottom:16px;">
          ${emotionCards}
        </div>
        <div id="emotion-result" style="display:none;" class="card" style="padding:12px;margin-top:8px;">
          <div style="font-size:12px;color:var(--surface-400);margin-bottom:6px;">Selected: <strong id="emotion-name">—</strong></div>
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="text" id="emotion-text" placeholder="Type text to test this emotion..." value="Hello! This is a test of emotional speech synthesis."
              style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:13px;font-family:var(--font);" />
            <button class="btn btn-primary" onclick="UI._speakEmotionTest()" style="font-size:13px;padding:8px 16px;">▶ Test</button>
          </div>
        </div>
      </div>

      <!-- ============ SSML BUILDER ============ -->
      <div class="anim-fade-in-up card" style="padding:24px;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <span style="font-size:22px;">📝</span>
          <h2 style="font-size:18px;font-weight:800;">SSML Builder</h2>
        </div>
        <p style="font-size:13px;color:var(--surface-400);margin-bottom:12px;">Build Speech Synthesis Markup Language. Adjust rate, pitch, volume, add pauses, emphasis, whisper.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:12px;">
          <div>
            <label style="font-size:11px;color:var(--surface-400);display:block;margin-bottom:4px;">Rate</label>
            <input type="range" id="ssml-rate" min="0.5" max="2.0" step="0.1" value="1.0" oninput="document.getElementById('ssml-rate-val').textContent=this.value" style="width:100%;" />
            <span id="ssml-rate-val" style="font-size:11px;color:var(--surface-400);">1.0</span>
          </div>
          <div>
            <label style="font-size:11px;color:var(--surface-400);display:block;margin-bottom:4px;">Pitch</label>
            <input type="range" id="ssml-pitch" min="-1.0" max="1.0" step="0.1" value="0" oninput="document.getElementById('ssml-pitch-val').textContent=this.value" style="width:100%;" />
            <span id="ssml-pitch-val" style="font-size:11px;color:var(--surface-400);">0</span>
          </div>
          <div>
            <label style="font-size:11px;color:var(--surface-400);display:block;margin-bottom:4px;">Volume</label>
            <input type="range" id="ssml-vol" min="0" max="100" step="5" value="100" oninput="document.getElementById('ssml-vol-val').textContent=this.value" style="width:100%;" />
            <span id="ssml-vol-val" style="font-size:11px;color:var(--surface-400);">100</span>
          </div>
          <div>
            <label style="font-size:11px;color:var(--surface-400);display:block;margin-bottom:4px;">Pause (ms)</label>
            <input type="number" id="ssml-pause" min="0" max="5000" step="100" value="500" style="width:100%;padding:6px 8px;border-radius:6px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:12px;font-family:var(--font);" />
          </div>
          <div>
            <label style="font-size:11px;color:var(--surface-400);display:block;margin-bottom:4px;">Emphasis</label>
            <select id="ssml-emphasis" style="width:100%;padding:6px 8px;border-radius:6px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:12px;font-family:var(--font);">
              <option value="">None</option>
              <option value="reduced">Reduced</option>
              <option value="moderate">Moderate</option>
              <option value="strong">Strong</option>
            </select>
          </div>
          <div>
            <label style="font-size:11px;color:var(--surface-400);display:block;margin-bottom:4px;">Effect</label>
            <select id="ssml-effect" style="width:100%;padding:6px 8px;border-radius:6px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:12px;font-family:var(--font);">
              <option value="">None</option>
              <option value="whisper">Whisper</option>
            </select>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;">
          <textarea id="ssml-input" rows="3" placeholder="Type text for SSML..."
            style="flex:1;padding:10px;border-radius:8px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:13px;font-family:var(--font);resize:vertical;">Hello! This is SSML speech synthesis.</textarea>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="UI._buildSSML()" style="font-size:13px;">📝 Build SSML</button>
          <button class="btn btn-secondary" onclick="UI._testSSML()" style="font-size:13px;">▶ Test SSML</button>
        </div>
        <div id="ssml-output" style="margin-top:12px;display:none;">
          <label style="font-size:11px;color:var(--surface-400);display:block;margin-bottom:4px;">Generated SSML:</label>
          <pre id="ssml-code" style="padding:12px;border-radius:8px;background:var(--surface-50);border:1px solid var(--surface-200);font-size:11px;overflow-x:auto;white-space:pre-wrap;max-height:200px;"></pre>
        </div>
      </div>

      <!-- ============ TRANSLATION TOOL ============ -->
      <div class="anim-fade-in-up card" style="padding:24px;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <span style="font-size:22px;">🌐</span>
          <h2 style="font-size:18px;font-weight:800;">Translation → Speech</h2>
        </div>
        <p style="font-size:13px;color:var(--surface-400);margin-bottom:12px;">Translate text between 30+ languages, then generate speech in the target language.</p>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;">
          <select id="feat-trans-from" style="padding:6px 10px;border-radius:8px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:12px;font-family:var(--font);">
            ${langOptions}
          </select>
          <span style="font-size:16px;color:var(--surface-400);">→</span>
          <select id="feat-trans-to" style="padding:6px 10px;border-radius:8px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:12px;font-family:var(--font);">
            ${langOptions.replace('value="en"', 'value="en" selected')}
          </select>
        </div>
        <textarea id="feat-trans-input" rows="3" placeholder="Type text to translate..."
          style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:13px;font-family:var(--font);resize:vertical;margin-bottom:12px;">Hello, how are you today?</textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
          <button class="btn btn-primary" onclick="UI._featureTranslate()" style="font-size:13px;">🌐 Translate</button>
          <button class="btn btn-success" onclick="UI._featureTranslateAndSpeak()" style="font-size:13px;">▶ Translate & Speak</button>
        </div>
        <div id="feat-trans-result" style="display:none;margin-top:8px;padding:12px;border-radius:8px;background:var(--brand-50);border:1px solid var(--brand-200);font-size:13px;"></div>
      </div>

      <!-- ============ AI WRITING ASSISTANT ============ -->
      <div class="anim-fade-in-up card" style="padding:24px;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <span style="font-size:22px;">✍️</span>
          <h2 style="font-size:18px;font-weight:800;">AI Writing Assistant</h2>
        </div>
        <p style="font-size:13px;color:var(--surface-400);margin-bottom:12px;">Fix grammar, improve punctuation, optimize for podcast or storytelling.</p>
        <textarea id="feat-writing-input" rows="4" placeholder="Paste or type text to improve..."
          style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:13px;font-family:var(--font);resize:vertical;margin-bottom:12px;">hello this is a test. the grammar is wrong.  i need   help with  punctuation!</textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
          <button class="btn btn-primary" onclick="UI._featureImproveWriting()" style="font-size:13px;">✨ Fix & Improve</button>
          <button class="btn btn-secondary" onclick="UI._featureOptimizePodcast()" style="font-size:13px;">🎧 Podcast Style</button>
          <button class="btn btn-secondary" onclick="UI._featureOptimizeStory()" style="font-size:13px;">📖 Story Style</button>
          <button class="btn btn-secondary" onclick="UI._featureAddPauses()" style="font-size:13px;">⏸ Add Pauses</button>
        </div>
        <div id="feat-writing-result" style="display:none;padding:12px;border-radius:8px;background:var(--brand-50);border:1px solid var(--brand-200);font-size:13px;white-space:pre-wrap;"></div>
      </div>

      <!-- ============ SMART RECOMMENDER ============ -->
      <div class="anim-fade-in-up card" style="padding:24px;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <span style="font-size:22px;">🧠</span>
          <h2 style="font-size:18px;font-weight:800;">Smart Voice Recommender</h2>
        </div>
        <p style="font-size:13px;color:var(--surface-400);margin-bottom:12px;">Paste any text — AI analyzes it and recommends the best voice, emotion, and speed.</p>
        <textarea id="feat-recommend-input" rows="3" placeholder="Paste text to analyze..."
          style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:13px;font-family:var(--font);resize:vertical;margin-bottom:12px;">Welcome to our new product launch! This is an amazing opportunity for everyone!</textarea>
        <button class="btn btn-primary" onclick="UI._featureSmartRecommend()" style="font-size:13px;">🧠 Analyze Text</button>
        <div id="feat-recommend-result" style="display:none;margin-top:12px;padding:16px;border-radius:8px;background:var(--brand-50);border:1px solid var(--brand-200);">
          <div id="feat-recommend-content" style="font-size:13px;"></div>
        </div>
      </div>

      <!-- ============ PRONUNCIATION DICTIONARY ============ -->
      <div class="anim-fade-in-up card" style="padding:24px;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <span style="font-size:22px;">🗣️</span>
          <h2 style="font-size:18px;font-weight:800;">Pronunciation Dictionary</h2>
        </div>
        <p style="font-size:13px;color:var(--surface-400);margin-bottom:12px;">Define custom pronunciation rules. Add phoneme overrides for specific words.</p>
        <div style="display:flex;gap:8px;align-items:flex-end;margin-bottom:12px;flex-wrap:wrap;">
          <div>
            <label style="font-size:11px;color:var(--surface-400);display:block;margin-bottom:4px;">Word</label>
            <input type="text" id="pron-word" placeholder="OpenAI" style="padding:6px 10px;border-radius:6px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:12px;font-family:var(--font);width:140px;" />
          </div>
          <div>
            <label style="font-size:11px;color:var(--surface-400);display:block;margin-bottom:4px;">Phoneme</label>
            <input type="text" id="pron-phoneme" placeholder="open-EYE" style="padding:6px 10px;border-radius:6px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:12px;font-family:var(--font);width:140px;" />
          </div>
          <div>
            <label style="font-size:11px;color:var(--surface-400);display:block;margin-bottom:4px;">Language</label>
            <select id="pron-lang" style="padding:6px 10px;border-radius:6px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:12px;font-family:var(--font);">
              <option value="en">English</option>
              <option value="ar">Arabic</option>
              <option value="ja">Japanese</option>
              <option value="fr">French</option>
            </select>
          </div>
          <button class="btn btn-primary" onclick="UI._addPronEntry()" style="font-size:12px;padding:6px 12px;">+ Add</button>
        </div>
        <div id="pron-list" style="margin-bottom:12px;">
          ${this._renderPronList()}
        </div>
        <div>
          <label style="font-size:11px;color:var(--surface-400);display:block;margin-bottom:4px;">Test text (pronunciation will be applied):</label>
          <div style="display:flex;gap:8px;">
            <input type="text" id="pron-test" value="Hello from OpenAI and GitHub!" style="flex:1;padding:6px 10px;border-radius:6px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:12px;font-family:var(--font);" />
            <button class="btn btn-secondary" onclick="UI._testPron()" style="font-size:12px;padding:6px 12px;">▶ Test</button>
          </div>
        </div>
      </div>

      <!-- ============ MULTI-SPEAKER DEMO ============ -->
      <div class="anim-fade-in-up card" style="padding:24px;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <span style="font-size:22px;">👥</span>
          <h2 style="font-size:18px;font-weight:800;">Multi-Speaker Demo</h2>
        </div>
        <p style="font-size:13px;color:var(--surface-400);margin-bottom:12px;">Generate conversations with different speakers. Use "Name: text" format.</p>
        <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
          <button class="btn btn-ghost" onclick="UI._loadMultiSpeakerDemo('friendly')" style="font-size:12px;">👋 Friendly Chat</button>
          <button class="btn btn-ghost" onclick="UI._loadMultiSpeakerDemo('interview')" style="font-size:12px;">🎙️ Interview</button>
          <button class="btn btn-ghost" onclick="UI._loadMultiSpeakerDemo('story')" style="font-size:12px;">📖 Story Narration</button>
          <button class="btn btn-ghost" onclick="UI._loadMultiSpeakerDemo('news')" style="font-size:12px;">📰 News Broadcast</button>
        </div>
        <textarea id="feat-multi-input" rows="6" placeholder="John: Hello there!&#10;Sarah: Hi John, how are you?&#10;John: I'm great, thanks!&#10;Sarah: Want to grab coffee?"
          style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--surface-200);background:var(--surface-50);font-size:13px;font-family:monospace;resize:vertical;margin-bottom:12px;"></textarea>
        <button class="btn btn-primary" onclick="UI._featureMultiSpeaker()" style="font-size:13px;">▶ Generate Conversation</button>
        <div id="feat-multi-result" style="display:none;margin-top:12px;padding:12px;border-radius:8px;background:var(--brand-50);border:1px solid var(--brand-200);font-size:13px;"></div>
      </div>

      <!-- ============ VOICE CATEGORIES ============ -->
      <div class="anim-fade-in-up" style="margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <span style="font-size:22px;">🏷️</span>
          <h2 style="font-size:18px;font-weight:800;">Voice Categories</h2>
        </div>
        <p style="font-size:13px;color:var(--surface-400);margin-bottom:12px;">Browse voices by use case. Click a category to see matching voices.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;">
          ${categoryCards}
        </div>
        <div id="feat-category-voices" style="margin-top:12px;"></div>
      </div>


      <!-- ============ ANYCLAW VOICE ENGINE ============ -->
      <div class="anim-fade-in-up card" style="padding:24px;margin-bottom:20px;border:1px solid var(--brand-200);background:linear-gradient(135deg,var(--brand-50),var(--surface-50));">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <span style="font-size:22px;">&#129516;</span>
          <h2 style="font-size:18px;font-weight:800;">AnyClaw Voice Engine</h2>
          <span style="padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;background:var(--brand-600);color:#fff;">POWERED BY</span>
        </div>
        <p style="font-size:13px;color:var(--surface-400);margin-bottom:16px;">Professional-grade offline TTS engine with 12 emotion profiles, 7 voice archetypes, and full DSP pipeline. All processing runs locally.</p>
        <div style="margin-bottom:16px;">
          <div style="font-weight:600;font-size:13px;margin-bottom:8px;">&#127917; Emotion Profiles</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:6px;" id="anyclaw-emotions"></div>
        </div>
        <div style="margin-bottom:16px;">
          <div style="font-weight:600;font-size:13px;margin-bottom:8px;">&#127908; Voice Archetypes</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px;" id="anyclaw-voices"></div>
        </div>
        <div style="margin-bottom:16px;">
          <div style="font-weight:600;font-size:13px;margin-bottom:8px;">&#128295; DSP Pipeline</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;" id="anyclaw-dsp"></div>
        </div>
        <div style="padding:10px;border-radius:8px;background:var(--surface-50);border:1px solid var(--surface-200);font-size:11px;color:var(--surface-400);">
          <strong>Hardware:</strong> RTX 4090/3090 (24GB) training &rarr; CPU (i5-12400) inference | <strong>VRAM:</strong> 4GB/voice | <strong>Models:</strong> Kokoro &rarr; Piper &rarr; Coqui XTTS &rarr; VITS &rarr; StyleTTS2 &rarr; MeloTTS (auto-detected)
        </div>
        <div style="text-align:center;margin-top:12px;">
          <a href="https://github.com/gsops00/voice-training" target="_blank" style="font-size:13px;color:var(--brand-600);text-decoration:none;font-weight:600;">&#128230; View AnyClaw on GitHub &rarr;</a>
        </div>
      </div>

      <!-- ============ AUDIO FORMATS ============ -->
      <div class="anim-fade-in-up card" style="padding:24px;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <span style="font-size:22px;">🎵</span>
          <h2 style="font-size:18px;font-weight:800;">Export Formats</h2>
        </div>
        <p style="font-size:13px;color:var(--surface-400);margin-bottom:12px;">Choose your preferred audio format for download.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;">
          ${Object.entries(FormatHelper.formats).map(([k,f]) =>
            `<div class="card" style="padding:14px;text-align:center;cursor:pointer;border-color:${UI.selectedFormat===k?'var(--brand-600)':'var(--surface-200)'};" onclick="UI.selectedFormat='${k}';UI.render()">
              <div style="font-size:24px;">${k === 'mp3' ? '🎶' : k === 'wav' ? '🔊' : k === 'ogg' ? '🎧' : '🎵'}</div>
              <div style="font-weight:700;font-size:14px;margin-top:4px;">${f.label}</div>
              <div style="font-size:11px;color:var(--surface-400);">.${f.ext}</div>
              <div style="font-size:10px;color:var(--surface-500);margin-top:4px;">${f.mime}</div>
              ${UI.selectedFormat===k ? '<div style="margin-top:6px;font-size:10px;color:var(--brand-600);font-weight:600;">✓ Selected</div>' : ''}
            </div>`
          ).join('')}
        </div>
      </div>

      <!-- ============ VOICE CONTROLS DEMO ============ -->
      <div class="anim-fade-in-up card" style="padding:24px;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <span style="font-size:22px;">🎚️</span>
          <h2 style="font-size:18px;font-weight:800;">Voice Controls</h2>
        </div>
        <p style="font-size:13px;color:var(--surface-400);margin-bottom:12px;">Fine-tune speed, pitch, and more before generating.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:12px;">
          <div>
            <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Speed: <span id="vc-speed">${UI.rate.toFixed(1)}x</span></label>
            <input type="range" min="0.5" max="2.0" step="0.05" value="${UI.rate}" oninput="UI.rate=parseFloat(this.value);document.getElementById('vc-speed').textContent=this.value+'x'" style="width:100%;" />
          </div>
          <div>
            <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Pitch: <span id="vc-pitch">${UI.pitch.toFixed(1)}</span></label>
            <input type="range" min="0.5" max="2.0" step="0.05" value="${UI.pitch}" oninput="UI.pitch=parseFloat(this.value);document.getElementById('vc-pitch').textContent=parseFloat(this.value).toFixed(1)" style="width:100%;" />
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="UI.nav('studio')" style="font-size:13px;">✨ Go to Studio</button>
        </div>
      </div>

    </div>`;
  },

  // ---- Feature tool helpers ----

  _renderPronList() {
    const dict = (typeof PronunciationDict !== 'undefined') ? PronunciationDict : null;
    if (!dict || !dict._entries || Object.keys(dict._entries).length === 0) {
      return '<div style="font-size:12px;color:var(--surface-400);">No custom pronunciations yet. Add one above.</div>';
    }
    return '<div style="display:flex;flex-direction:column;gap:6px;">' +
      Object.entries(dict._entries).map(([key, phoneme]) => {
        const [lang, word] = key.split(':');
        return `<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:6px;background:var(--surface-50);border:1px solid var(--surface-200);">
          <span style="font-size:12px;font-weight:600;">${word}</span>
          <span style="font-size:11px;color:var(--surface-400);">→</span>
          <span style="font-size:12px;font-family:monospace;color:var(--brand-600);">[${phoneme}]</span>
          <span style="font-size:10px;color:var(--surface-400);margin-left:auto;">${lang}</span>
          <button class="btn btn-ghost" onclick="PronunciationDict.remove('${word}','${lang}');UI.render()" style="font-size:11px;padding:2px 6px;">✕</button>
        </div>`;
      }).join('') + '</div>';
  },

  _testEmotion(key) {
    const em = EMOTIONS[key];
    if (!em) return;
    UI.selectedEmotion = key;
    const resultEl = document.getElementById('emotion-result');
    const nameEl = document.getElementById('emotion-name');
    if (resultEl) resultEl.style.display = 'block';
    if (nameEl) nameEl.textContent = `${em.emoji} ${em.label} (pitch ${em.pitchMod > 0 ? '+' : ''}${em.pitchMod}, rate ${em.rateMod > 0 ? '+' : ''}${em.rateMod})`;
  },

  _speakEmotionTest() {
    const key = this.selectedEmotion;
    const em = EMOTIONS[key];
    if (!em) { this.toast('Select an emotion first', 'error'); return; }
    const text = document.getElementById('emotion-text')?.value || 'Hello! This is a test.';
    const rate = 1.0 + (em.rateMod || 0);
    const pitch = 1.0 + (em.pitchMod || 0);
    const voice = this.selectedVoice || VOICES[0];
    this.toast(`🎭 Testing ${em.label}...`, '');
    tts.speak(text, voice, { rate, pitch, volume: 1.0 }).then(() => {
      this.toast(`✅ ${em.label} test complete`, 'success');
    }).catch(e => this.toast('❌ Error: ' + e.message, 'error'));
  },

  _testAnyClawEmotion(emotionId) {
    var em = ANYCLAW_EMOTIONS.find(function(e) { return e.id === emotionId; });
    if (!em) return;
    this.toast(em.icon + ' ' + em.name + ' — ' + em.desc + ' | Rate: ' + em.speechRate + 'x', '');
    var rate = em.speechRate || 1.0;
    this.rate = rate;
    if (emotionId === 'happy' || emotionId === 'excited') this.pitch = 1.1;
    else if (emotionId === 'sad' || emotionId === 'calm') this.pitch = 0.9;
    else if (emotionId === 'angry') this.pitch = 1.15;
    else if (emotionId === 'whisper') { this.pitch = 0.85; this.rate = 0.8; }
    else this.pitch = 1.0;
    this.nav('studio');
  },

  _testPreset(key) {
    const p = PRESETS[key];
    if (!p) return;
    this.rate = p.speed;
    this.pitch = p.pitch;
    if (p.emotion) this.selectedEmotion = p.emotion;
    this.toast(`✅ Preset "${p.label}" applied — speed ${p.speed}x, emotion ${p.emotion}`, 'success');
  },

  _testCategory(cat) {
    const catInfo = VOICE_CATEGORIES[cat];
    if (!catInfo) return;
    const matchVoices = VOICES.filter(v => {
      if (cat === 'narrator') return v.gender === 'f' || v.gender === 'm';
      if (cat === 'podcast') return ['en', 'fr', 'de', 'es'].includes(v.lang);
      if (cat === 'gaming') return v.lang === 'en';
      if (cat === 'news') return v.lang === 'en';
      return true;
    }).slice(0, 8);
    const container = document.getElementById('feat-category-voices');
    if (!container) return;
    container.innerHTML = `<div style="font-size:13px;font-weight:600;margin-bottom:8px;">${catInfo.emoji} ${catInfo.label} voices:</div>` +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:6px;">' +
      matchVoices.map(v => `<div class="card" style="padding:8px;text-align:center;cursor:pointer;font-size:11px;" onclick="UI.selectVoice('${v.id}');UI.nav('studio')">${v.emoji} ${v.name}<br><span style="color:var(--surface-400);font-size:10px;">${LANGUAGES[v.lang] || v.lang}</span></div>`).join('') +
      '</div>';
  },

  async _featureTranslate() {
    const from = document.getElementById('feat-trans-from')?.value || 'en';
    const to = document.getElementById('feat-trans-to')?.value || 'ar';
    const text = document.getElementById('feat-trans-input')?.value || '';
    if (!text.trim()) { this.toast('Enter text to translate', 'error'); return; }
    if (from === to) { this.toast('Source and target must differ', 'error'); return; }
    this.toast('🌐 Translating...', '');
    try {
      const result = await Translator.translate(text, from, to);
      const resultEl = document.getElementById('feat-trans-result');
      if (resultEl) {
        resultEl.style.display = 'block';
        resultEl.innerHTML = `<strong>${LANGUAGES[from]} → ${LANGUAGES[to]}:</strong> ${result}`;
      }
      this.toast('✅ Translation complete', 'success');
    } catch (e) {
      this.toast('❌ Translation failed', 'error');
    }
  },

  async _featureTranslateAndSpeak() {
    const from = document.getElementById('feat-trans-from')?.value || 'en';
    const to = document.getElementById('feat-trans-to')?.value || 'ar';
    const text = document.getElementById('feat-trans-input')?.value || '';
    if (!text.trim()) { this.toast('Enter text to translate', 'error'); return; }
    if (from === to) { this.toast('Source and target must differ', 'error'); return; }
    this.toast('🌐 Translating + generating speech...', '');
    try {
      const result = await Translator.translate(text, from, to);
      const resultEl = document.getElementById('feat-trans-result');
      if (resultEl) {
        resultEl.style.display = 'block';
        resultEl.innerHTML = `<strong>${LANGUAGES[from]} → ${LANGUAGES[to]}:</strong> ${result}`;
      }
      const voice = this.selectedVoice || VOICES.find(v => v.lang === to) || VOICES[0];
      await tts.speak(result, voice, { rate: 1.0, pitch: 1.0, volume: 1.0 });
      this.toast('✅ Translated and spoken!', 'success');
    } catch (e) {
      this.toast('❌ Error: ' + e.message, 'error');
    }
  },

  _featureImproveWriting() {
    const text = document.getElementById('feat-writing-input')?.value || '';
    if (!text.trim()) { this.toast('Enter text first', 'error'); return; }
    const improved = WritingAssistant.improve(text);
    const resultEl = document.getElementById('feat-writing-result');
    if (resultEl) { resultEl.style.display = 'block'; resultEl.textContent = improved; }
    this.toast('✨ Text improved', 'success');
  },

  _featureOptimizePodcast() {
    const text = document.getElementById('feat-writing-input')?.value || '';
    if (!text.trim()) { this.toast('Enter text first', 'error'); return; }
    const result = WritingAssistant.optimizeForPodcast(text);
    const resultEl = document.getElementById('feat-writing-result');
    if (resultEl) { resultEl.style.display = 'block'; resultEl.textContent = result; }
    this.toast('🎧 Optimized for podcast', 'success');
  },

  _featureOptimizeStory() {
    const text = document.getElementById('feat-writing-input')?.value || '';
    if (!text.trim()) { this.toast('Enter text first', 'error'); return; }
    const result = WritingAssistant.optimizeForStory(text);
    const resultEl = document.getElementById('feat-writing-result');
    if (resultEl) { resultEl.style.display = 'block'; resultEl.textContent = result; }
    this.toast('📖 Optimized for storytelling', 'success');
  },

  _featureAddPauses() {
    const text = document.getElementById('feat-writing-input')?.value || '';
    if (!text.trim()) { this.toast('Enter text first', 'error'); return; }
    const result = WritingAssistant.addPauses(text);
    const resultEl = document.getElementById('feat-writing-result');
    if (resultEl) { resultEl.style.display = 'block'; resultEl.textContent = result; }
    this.toast('⏸ Natural pauses added', 'success');
  },

  _buildSSML() {
    const text = document.getElementById('ssml-input')?.value || '';
    const rate = document.getElementById('ssml-rate')?.value || '1.0';
    const pitch = document.getElementById('ssml-pitch')?.value || '0';
    const vol = document.getElementById('ssml-vol')?.value || '100';
    const pause = document.getElementById('ssml-pause')?.value || '0';
    const emphasis = document.getElementById('ssml-emphasis')?.value || '';
    const effect = document.getElementById('ssml-effect')?.value || '';

    if (!text.trim()) { this.toast('Enter text first', 'error'); return; }

    const opts = {};
    if (rate !== '1.0') opts.rate = rate;
    if (pitch !== '0') opts.pitch = pitch + 'st';
    if (vol !== '100') opts.volume = vol;
    if (pause !== '0') opts.pause = pause;
    if (emphasis) opts.emphasis = emphasis;
    if (effect === 'whisper') opts.whisper = true;

    const ssml = SSMLBuilder.wrap(text, opts);
    const codeEl = document.getElementById('ssml-code');
    const outEl = document.getElementById('ssml-output');
    if (codeEl) codeEl.textContent = ssml;
    if (outEl) outEl.style.display = 'block';
    this.toast('📝 SSML built', 'success');
  },

  _testSSML() {
    this._buildSSML();
    this.toast('SSML ready — go to Studio to generate', 'success');
    setTimeout(() => this.nav('studio'), 800);
  },

  _addPronEntry() {
    const word = document.getElementById('pron-word')?.value || '';
    const phoneme = document.getElementById('pron-phoneme')?.value || '';
    const lang = document.getElementById('pron-lang')?.value || 'en';
    if (!word.trim() || !phoneme.trim()) { this.toast('Enter both word and phoneme', 'error'); return; }
    PronunciationDict.add(word.trim(), phoneme.trim(), lang);
    document.getElementById('pron-word').value = '';
    document.getElementById('pron-phoneme').value = '';
    this.toast(`🗣️ Added: ${word} → [${phoneme}]`, 'success');
    const listEl = document.getElementById('pron-list');
    if (listEl) listEl.innerHTML = this._renderPronList();
  },

  _testPron() {
    const text = document.getElementById('pron-test')?.value || '';
    if (!text.trim()) { this.toast('Enter text to test', 'error'); return; }
    const processed = PronunciationDict.apply(text, 'en');
    this.toast(`🗣️ Processed: "${processed}"`, 'success');
    const input = document.getElementById('pron-test');
    if (input) input.value = processed;
  },

  _loadMultiSpeakerDemo(type) {
    const demos = {
      friendly: "Alex: Hey Sarah, how's it going?\nSarah: I'm doing great! Just finished a big project.\nAlex: That's awesome! What was it about?\nSarah: It was an AI voice platform. Pretty cool stuff!",
      interview: "Host: Welcome to our show, Dr. Chen!\nDr. Chen: Thank you for having me. It's a pleasure to be here.\nHost: Tell us about your latest research.\nDr. Chen: We've been working on neural speech synthesis that sounds completely natural.",
      story: "Narrator: Once upon a time, in a land far away...\nDragon: Who dares enter my cave?\nHero: I am the brave knight, here to save the kingdom!\nNarrator: The hero raised her sword as the dragon breathed fire.",
      news: "Anchor: Good evening, this is breaking news.\nReporter: That's right. Scientists have discovered a new species of deep-sea fish.\nAnchor: Incredible. Any details on the discovery?\nReporter: The team found it at a depth of 4,000 meters in the Pacific Ocean.",
    };
    const input = document.getElementById('feat-multi-input');
    if (input) input.value = demos[type] || '';
    this.toast(`👥 Loaded ${type} demo`, 'success');
  },

  async _featureMultiSpeaker() {
    const text = document.getElementById('feat-multi-input')?.value || '';
    if (!text.trim()) { this.toast('Enter a multi-speaker conversation', 'error'); return; }
    const segments = this._parseMultiSpeaker(text);
    if (segments.length === 0) {
      this.toast('No speaker segments found. Use format: Name: text', 'error');
      return;
    }
    const resultEl = document.getElementById('feat-multi-result');
    if (resultEl) {
      resultEl.style.display = 'block';
      resultEl.innerHTML = `<div style="font-weight:600;margin-bottom:8px;">Found ${segments.length} segments:</div>` +
        segments.map((s, i) => `<div style="padding:4px 0;"><strong>${s.name}:</strong> ${s.text}</div>`).join('');
    }
    this.toast(`👥 Generating ${segments.length} segments...`, '');
    try {
      for (const seg of segments) {
        await tts.speak(seg.text, this.selectedVoice || VOICES[0], { rate: this.rate, pitch: this.pitch, volume: 1.0 });
      }
      this.toast('✅ Multi-speaker generation complete!', 'success');
    } catch (e) {
      this.toast('❌ Error: ' + e.message, 'error');
    }
  },

  _featureSmartRecommend() {
    const text = document.getElementById('feat-recommend-input')?.value || '';
    if (!text.trim()) { this.toast('Enter text to analyze', 'error'); return; }
    const rec = SmartRecommender.analyze(text);
    const container = document.getElementById('feat-recommend-content');
    const resultEl = document.getElementById('feat-recommend-result');
    if (!container || !resultEl) return;
    resultEl.style.display = 'block';
    const voiceName = rec.bestVoice ? (VOICES.find(v => v.id === rec.bestVoice)?.name || rec.bestVoice) : 'Any voice';
    container.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;">
        <div><div style="font-size:11px;color:var(--surface-400);">Category</div><div style="font-weight:700;font-size:14px;">${VOICE_CATEGORIES[rec.category]?.emoji || '🎙️'} ${rec.category || 'general'}</div></div>
        <div><div style="font-size:11px;color:var(--surface-400);">Emotion</div><div style="font-weight:700;font-size:14px;">${EMOTIONS[rec.emotion]?.emoji || '🎙️'} ${rec.emotion || 'neutral'}</div></div>
        <div><div style="font-size:11px;color:var(--surface-400);">Speed</div><div style="font-weight:700;font-size:14px;">${rec.speed}x</div></div>
        <div><div style="font-size:11px;color:var(--surface-400);">Voice</div><div style="font-weight:700;font-size:14px;">${voiceName}</div></div>
        <div><div style="font-size:11px;color:var(--surface-400);">Confidence</div><div style="font-weight:700;font-size:14px;">${Math.round(rec.confidence * 100)}%</div></div>
      </div>
      <button class="btn btn-primary" onclick="UI._applyRecommend()" style="margin-top:12px;font-size:12px;">✨ Apply to Studio</button>
    `;
    this._lastRecommendation = rec;
    this.toast('🧠 Analysis complete', 'success');
  },

  _applyRecommend() {
    const rec = this._lastRecommendation;
    if (!rec) return;
    if (rec.category) this.nav('studio');
    setTimeout(() => {
      if (rec.emotion) UI.selectedEmotion = rec.emotion;
      if (rec.speed) UI.rate = rec.speed;
      if (rec.bestVoice) {
        const v = VOICES.find(voice => voice.id === rec.bestVoice);
        if (v) { UI.selectedVoice = v; localStorage.setItem('iknbite_selected', v.id); }
      }
      UI.render();
      UI.toast('✅ Recommendation applied to Studio', 'success');
    }, 200);
  },







  renderImages() {
    const images = this.generatedImages || [];
    return `
    <div style="max-width:960px;margin:0 auto;padding:24px 16px 100px;">
      <!-- Header -->
      <div class="anim-fade-in-up">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">
          <span style="font-size:28px;">🖼️</span>
          <div>
            <h1 style="margin:0;">AI Image Studio</h1>
            <p style="color:var(--surface-500);font-size:14px;margin-top:2px;">Turn your ideas into images — powered by Pollinations.ai</p>
          </div>
        </div>
      </div>

      <!-- Prompt Input -->
      <div class="card anim-fade-in-up" style="padding:20px;margin-top:16px;">
        <label style="font-size:14px;font-weight:600;color:var(--surface-700);margin-bottom:8px;display:block;">Describe your image</label>
        <textarea id="image-prompt" rows="2" style="width:100%;padding:12px 16px;border-radius:12px;border:1.5px solid var(--surface-200);background:var(--surface-50);font-family:var(--font);font-size:15px;line-height:1.5;resize:vertical;outline:none;transition:border-color 0.15s;color:inherit;" placeholder="A magical forest at sunset with glowing mushrooms...">${this.lastPrompt || ''}</textarea>
        
        <!-- Style Presets -->
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;">
          ${['Realistic','Anime','3D Render','Cinematic','Fantasy Art','Pixel Art','Oil Painting','Sketch'].map(s => `
            <button class="tag ${this.imageStyle === s ? 'active' : ''}" onclick="UI.imageStyle='${s}';UI.render()" style="font-size:12px;">${s}</button>
          `).join('')}
        </div>

        <!-- Size + Generate Row -->
        <div style="display:flex;gap:8px;margin-top:12px;align-items:center;flex-wrap:wrap;">
          <select id="image-size" style="padding:10px 14px;border-radius:10px;border:1.5px solid var(--surface-200);background:var(--surface-50);font-family:var(--font);font-size:13px;color:inherit;outline:none;">
            <option value="512x512">Square 512×512</option>
            <option value="1024x1024" selected>Square 1024×1024</option>
            <option value="1024x768">Landscape 1024×768</option>
            <option value="768x1024">Portrait 768×1024</option>
          </select>
          <button class="btn btn-primary" onclick="UI._generateImage()" ${this.isGeneratingImage ? 'disabled' : ''} style="padding:10px 28px;font-size:14px;">
            ${this.isGeneratingImage ? '⏳ Generating...' : '🎨 Generate'}
          </button>
        </div>
      </div>

      <!-- Gallery -->
      ${images.length > 0 ? `
      <div style="margin-top:20px;">
        <h3 style="font-size:16px;font-weight:700;margin-bottom:12px;">Generated Images (${images.length})</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
          ${images.map((img, i) => `
            <div class="card" style="padding:8px;overflow:hidden;">
              <img src="${img.url}" alt="${img.prompt}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;display:block;" loading="lazy" />
              <div style="padding:6px 4px 2px;font-size:11px;color:var(--surface-400);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${img.prompt}">${img.prompt}</div>
              <div style="display:flex;gap:4px;padding:2px 4px 4px;">
                <button class="btn btn-ghost btn-sm" onclick="window.open('${img.url}','_blank')" style="font-size:10px;padding:4px 8px;">🔗 Open</button>
                <button class="btn btn-ghost btn-sm" onclick="UI._downloadImage('${img.url}', '${img.prompt.substring(0,30)}')" style="font-size:10px;padding:4px 8px;">📥 Download</button>
                <button class="btn btn-ghost btn-sm" onclick="UI._removeImage(${i})" style="font-size:10px;padding:4px 8px;color:var(--error);">🗑️</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : `
      <div class="anim-fade-in-up" style="text-align:center;padding:60px 20px;color:var(--surface-400);">
        <div style="font-size:64px;margin-bottom:16px;">🎨</div>
        <p style="font-size:16px;font-weight:600;">No images yet</p>
        <p style="font-size:13px;">Type a prompt above and click Generate</p>
      </div>
      `}
    </div>`;
  },

  async _generateImage() {
    const prompt = document.getElementById('image-prompt')?.value?.trim();
    if (!prompt) { this.toast('Please enter a prompt first', 'error'); return; }
    
    this.lastPrompt = prompt;
    this.isGeneratingImage = true;
    this.render();
    
    try {
      const sizeSelect = document.getElementById('image-size');
      const size = sizeSelect?.value || '1024x1024';
      const style = this.imageStyle || 'Realistic';
      const stylePrompt = `${prompt}, ${style} style, high quality, detailed`;
      const encoded = encodeURIComponent(stylePrompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${size.split('x')[0]}&height=${size.split('x')[1]}&seed=${Date.now()}&nologo=true`;
      
      // Add to gallery
      if (!this.generatedImages) this.generatedImages = [];
      this.generatedImages.unshift({
        url: imageUrl,
        prompt: prompt,
        style: style,
        time: Date.now()
      });
      
      this.toast('✅ Image generated!', 'success');
    } catch (e) {
      console.error('Image generation error:', e);
      this.toast('❌ Failed to generate: ' + (e.message || 'Unknown error'), 'error');
    } finally {
      this.isGeneratingImage = false;
      this.render();
    }
  },

  _downloadImage(url, name) {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = (name || 'image').replace(/[^a-zA-Z0-9_-]/g, '_') + '.jpg';
      a.target = '_blank';
      a.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 200);
      this.toast('✅ Image opened — long-press to save', 'success');
    } catch (e) {
      window.open(url, '_blank');
    }
  },

  _removeImage(index) {
    if (this.generatedImages) {
      this.generatedImages.splice(index, 1);
      this.render();
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
