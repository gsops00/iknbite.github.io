/* ============================================
   iknbite  |  Feature Modules
   AI Writing, Translation, Emotions, Presets,
   Multi-Speaker, Pronunciation, Audio Enhancement
   ============================================ */

// ---- Emotions ----
const EMOTIONS = {
  happy:      { label: 'Happy',      emoji: '😊', pitchMod: 0.15, rateMod: 0.10 },
  sad:        { label: 'Sad',        emoji: '😢', pitchMod: -0.10, rateMod: -0.10 },
  angry:      { label: 'Angry',      emoji: '😠', pitchMod: 0.05, rateMod: 0.20 },
  calm:       { label: 'Calm',       emoji: '😌', pitchMod: -0.05, rateMod: -0.15 },
  excited:    { label: 'Excited',    emoji: '🤩', pitchMod: 0.20, rateMod: 0.15 },
  serious:    { label: 'Serious',    emoji: '😐', pitchMod: -0.08, rateMod: -0.05 },
  fear:       { label: 'Fear',       emoji: '😨', pitchMod: 0.10, rateMod: 0.05 },
  romantic:   { label: 'Romantic',   emoji: '🥰', pitchMod: 0.05, rateMod: -0.10 },
  friendly:   { label: 'Friendly',   emoji: '🤗', pitchMod: 0.10, rateMod: 0.05 },
  professional:{ label:'Professional',emoji: '💼', pitchMod: 0.00, rateMod: -0.05 },
  whisper:    { label: 'Whisper',    emoji: '🤫', pitchMod: -0.15, rateMod: -0.20 },
  dramatic:   { label: 'Dramatic',   emoji: '🎭', pitchMod: 0.10, rateMod: -0.10 },
};

// ---- Voice Categories ----
const VOICE_CATEGORIES = {
  narrator:   { label: 'Narrator',   emoji: '📖', desc: 'Storytelling & audiobooks' },
  podcast:    { label: 'Podcast',    emoji: '🎧', desc: 'Podcasts & interviews' },
  commercial: { label: 'Commercial', emoji: '📢', desc: 'Ads & marketing' },
  news:       { label: 'News',       emoji: '📰', desc: 'News & broadcasts' },
  gaming:     { label: 'Gaming',     emoji: '🎮', desc: 'Game characters' },
  cinematic:  { label: 'Cinematic',  emoji: '🎬', desc: 'Film & trailers' },
  education:  { label: 'Education',  emoji: '📚', desc: 'Tutorials & courses' },
  assistant:  { label: 'Assistant',  emoji: '🤖', desc: 'Virtual assistants' },
};

// ---- Presets ----
const PRESETS = {
  youtube:    { label: 'YouTube',      emoji: '▶️',  speed: 1.0, pitch: 1.0, emotion: 'friendly',  desc: 'Optimized for YouTube videos' },
  tiktok:     { label: 'TikTok',       emoji: '🎵', speed: 1.15, pitch: 1.05, emotion: 'excited',  desc: 'Fast, energetic for short clips' },
  instagram:  { label: 'Instagram',    emoji: '📸', speed: 1.05, pitch: 1.0, emotion: 'friendly',  desc: 'Engaging for Reels & Stories' },
  podcast:    { label: 'Podcast',      emoji: '🎧', speed: 0.95, pitch: 1.0, emotion: 'calm',      desc: 'Relaxed, natural conversation' },
  audiobook:  { label: 'Audiobook',    emoji: '📖', speed: 0.90, pitch: 1.0, emotion: 'narrator',  desc: 'Clear, paced narration' },
  education:  { label: 'Education',    emoji: '📚', speed: 0.90, pitch: 1.0, emotion: 'professional', desc: 'Clear and instructive' },
  presentation:{label: 'Presentation', emoji: '🎤', speed: 0.95, pitch: 1.0, emotion: 'professional', desc: 'Confident, authoritative' },
  commercial: { label: 'Commercial',   emoji: '📢', speed: 1.0, pitch: 1.05, emotion: 'excited',   desc: 'Persuasive, energetic' },
  news:       { label: 'News',         emoji: '📰', speed: 1.0, pitch: 1.0, emotion: 'serious',   desc: 'Clear, formal broadcast' },
  storytelling:{label: 'Storytelling', emoji: '✨', speed: 0.85, pitch: 1.0, emotion: 'dramatic',  desc: 'Engaging, dramatic reading' },
};

// ---- SSML Builder ----
const SSMLBuilder = {
  wrap(text, opts = {}) {
    let prosody = '';
    if (opts.rate) prosody += ` rate="${opts.rate}"`;
    if (opts.pitch) prosody += ` pitch="${opts.pitch}"`;
    if (opts.volume) prosody += ` volume="${opts.volume}"`;

    let inner = text;
    if (prosody) inner = `<prosody${prosody}>${text}</prosody>`;
    if (opts.emphasis) inner = `<emphasis level="${opts.emphasis}">${inner}</emphasis>`;
    if (opts.pause) inner = `<break time="${opts.pause}ms"/>` + inner;
    if (opts.whisper) inner = `<amazon:effect name="whispered">${inner}</amazon:effect>`;

    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">${inner}</speak>`;
  },

  addPause(text, ms) {
    return text + `<break time="${ms}ms"/>`;
  },

  emphasize(text, level = 'strong') {
    return `<emphasis level="${level}">${text}</emphasis>`;
  },

  sayAs(text, interpretAs) {
    return `<say-as interpret-as="${interpretAs}">${text}</say-as>`;
  },

  spellOut(text) {
    return `<say-as interpret-as="characters">${text}</say-as>`;
  },
};

// ---- Pronunciation Dictionary ----
const PronunciationDict = {
  _entries: JSON.parse(localStorage.getItem('iknbite_pron_dict') || '{}'),

  add(word, phoneme, lang = 'en') {
    const key = `${lang}:${word.toLowerCase()}`;
    this._entries[key] = phoneme;
    this._save();
  },

  remove(word, lang = 'en') {
    const key = `${lang}:${word.toLowerCase()}`;
    delete this._entries[key];
    this._save();
  },

  apply(text, lang = 'en') {
    let result = text;
    for (const [key, phoneme] of Object.entries(this._entries)) {
      if (key.startsWith(`${lang}:`)) {
        const word = key.split(':')[1];
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        result = result.replace(regex, `<phoneme alphabet="ipa" ph="${phoneme}">${word}</phoneme>`);
      }
    }
    return result;
  },

  getAll(lang = 'en') {
    return Object.entries(this._entries)
      .filter(([k]) => k.startsWith(`${lang}:`))
      .map(([k, v]) => ({ word: k.split(':')[1], phoneme: v }));
  },

  _save() {
    localStorage.setItem('iknbite_pron_dict', JSON.stringify(this._entries));
  },
};

// ---- Multi-Speaker Parser ----
const MultiSpeakerParser = {
  parse(text) {
    const lines = text.split('\n').filter(l => l.trim());
    const segments = [];
    const speakerPattern = /^(.+?):\s*(.*)/;

    for (const line of lines) {
      const match = line.match(speakerPattern);
      if (match) {
        segments.push({ speaker: match[1].trim(), text: match[2].trim() });
      } else if (segments.length > 0) {
        segments[segments.length - 1].text += ' ' + line.trim();
      } else {
        segments.push({ speaker: 'Narrator', text: line.trim() });
      }
    }
    return segments;
  },

  detectSpeakers(text) {
    const segments = this.parse(text);
    const speakers = [...new Set(segments.map(s => s.speaker))];
    return speakers;
  },

  formatPreview(segments) {
    return segments.map(s =>
      `<span style="color:var(--brand-600);font-weight:600;">${s.speaker}:</span> ${s.text}`
    ).join('<br>');
  },
};

// ---- Smart Voice Recommender ----
const SmartRecommender = {
  analyze(text) {
    const lower = text.toLowerCase();
    const words = text.split(/\s+/);
    const wordCount = words.length;
    const avgWordLen = words.reduce((s, w) => s + w.length, 0) / Math.max(wordCount, 1);

    let category = 'assistant';
    let emotion = 'friendly';
    let speed = 1.0;
    let confidence = 0.5;

    // Detect content type
    if (/\b(chapter|once upon|story|tale|fairy|adventure)\b/.test(lower)) {
      category = 'narrator'; emotion = 'calm'; speed = 0.9; confidence = 0.8;
    } else if (/\b(podcast|interview|conversation|discuss|welcome to)\b/.test(lower)) {
      category = 'podcast'; emotion = 'friendly'; speed = 0.95; confidence = 0.7;
    } else if (/\b(buy|sale|discount|offer|limited|free|best|new|launch)\b/.test(lower)) {
      category = 'commercial'; emotion = 'excited'; speed = 1.05; confidence = 0.75;
    } else if (/\b(breaking|today|report|according to|official|announced)\b/.test(lower)) {
      category = 'news'; emotion = 'serious'; speed = 1.0; confidence = 0.7;
    } else if (/\b(quest|battle|dragon|hero|mission|level|game)\b/.test(lower)) {
      category = 'gaming'; emotion = 'dramatic'; speed = 1.0; confidence = 0.65;
    } else if (/\b(episode|scene|character|movie|film|trailer)\b/.test(lower)) {
      category = 'cinematic'; emotion = 'dramatic'; speed = 0.95; confidence = 0.7;
    } else if (/\b(lesson|learn|understand|explain|tutorial|step)\b/.test(lower)) {
      category = 'education'; emotion = 'professional'; speed = 0.9; confidence = 0.7;
    } else if (/\b(love|dear|darling|miss you|heart|sweet)\b/.test(lower)) {
      emotion = 'romantic'; confidence = 0.6;
    } else if (/\b(!!!|wow|amazing|awesome|incredible|yay)\b/.test(lower)) {
      emotion = 'excited'; confidence = 0.65;
    } else if (/\b(sorry|sadly|unfortunately|miss|lost|cry)\b/.test(lower)) {
      emotion = 'sad'; confidence = 0.6;
    } else if (/\b(warning|danger|stop|no|never|wrong)\b/.test(lower)) {
      emotion = 'angry'; confidence = 0.55;
    } else if (/\b(secret|whisper|quiet|soft|gentle|hush)\b/.test(lower)) {
      emotion = 'whisper'; speed = 0.85; confidence = 0.6;
    }

    // Detect urgency from punctuation
    const exclCount = (text.match(/!/g) || []).length;
    if (exclCount > 3) emotion = 'excited';
    if (exclCount > 5) speed = Math.min(speed + 0.1, 1.3);

    // Detect length-based adjustments
    if (wordCount > 500) speed = Math.max(speed - 0.05, 0.8);

    // Find matching voice
    const bestVoice = this._findVoice(category);

    return { category, emotion, speed, confidence, bestVoice };
  },

  _findVoice(category) {
    const defaults = {
      narrator: 'sonia',
      podcast: 'brian',
      commercial: 'aria',
      news: 'davis',
      gaming: 'guy',
      cinematic: 'aria',
      education: 'jenny',
      assistant: 'ava',
    };
    return defaults.category || 'ava';
  },
};

// ---- AI Writing Assistant ----
const WritingAssistant = {
  improve(text) {
    let improved = text;
    // Fix common punctuation
    improved = improved.replace(/\s+([.,!?;:])/g, '$1');
    improved = improved.replace(/([.,!?;:])([A-Z])/g, '$1 $2');
    improved = improved.replace(/\s+/g, ' ');
    // Capitalize first letter of sentences
    improved = improved.replace(/(^|[.!?]\s+)([a-z])/g, (m, sep, c) => sep + c.toUpperCase());
    // Fix ellipsis
    improved = improved.replace(/\.\.\.\.+/g, '...');
    // Remove double spaces
    improved = improved.replace(/  +/g, ' ');
    return improved.trim();
  },

  addPauses(text) {
    // Add natural pauses after periods, commas
    return text
      .replace(/\. /g, '. <break time="300ms"/> ')
      .replace(/, /g, ', <break time="150ms"/> ')
      .replace(/; /g, '; <break time="200ms"/> ')
      .replace(/: /g, ': <break time="200ms"/> ');
  },

  optimizeForPodcast(text) {
    return this.improve(text)
      .replace(/\. /g, '.\n\n')
      .replace(/! /g, '!\n\n');
  },

  optimizeForStory(text) {
    let result = this.improve(text);
    result = result.replace(/"/g, '\u201C').replace(/"/g, '\u201D');
    return result;
  },
};

// ---- Translation (via free API) ----
const Translator = {
  async translate(text, from, to) {
    // Use MyMemory free translation API
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    try {
      const resp = await fetch(url);
      const data = await resp.json();
      if (data.responseStatus === 200 && data.responseData) {
        return data.responseData.translatedText;
      }
    } catch (e) {
      console.warn('Translation failed:', e);
    }
    return text;
  },

  async translateAndSpeak(text, from, to, voiceDef) {
    const translated = await this.translate(text, from, to);
    return tts.speak(translated, voiceDef);
  },
};

// ---- Audio Enhancement (client-side) ----
const AudioEnhancer = {
  normalize(audioBuffer) {
    const data = audioBuffer.getChannelData(0);
    let max = 0;
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i]);
      if (abs > max) max = abs;
    }
    if (max > 0) {
      const gain = 0.9 / max;
      for (let i = 0; i < data.length; i++) {
        data[i] *= gain;
      }
    }
    return audioBuffer;
  },

  removeSilence(audioBuffer, threshold = 0.01) {
    const data = audioBuffer.getChannelData(0);
    let start = 0, end = data.length;
    for (let i = 0; i < data.length; i++) {
      if (Math.abs(data[i]) > threshold) { start = i; break; }
    }
    for (let i = data.length - 1; i >= 0; i--) {
      if (Math.abs(data[i]) > threshold) { end = i + 1; break; }
    }
    const ctx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, end - start, audioBuffer.sampleRate);
    const newBuffer = ctx.createBuffer(1, end - start, audioBuffer.sampleRate);
    newBuffer.getChannelData(0).set(data.slice(start, end));
    return newBuffer;
  },
};

// ---- Format Helpers ----
const FormatHelper = {
  formats: {
    mp3:  { mime: 'audio/mpeg',  ext: 'mp3',  label: 'MP3' },
    wav:  { mime: 'audio/wav',   ext: 'wav',  label: 'WAV' },
    ogg:  { mime: 'audio/ogg',   ext: 'ogg',  label: 'OGG' },
    flac: { mime: 'audio/flac',  ext: 'flac', label: 'FLAC' },
  },

  getExtension(format) {
    return this.formats[format]?.ext || 'mp3';
  },

  getMime(format) {
    return this.formats[format]?.mime || 'audio/mpeg';
  },
};
