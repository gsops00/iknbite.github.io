import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = localStorage.getItem('iknbite_api_url') || 'http://localhost:17493';

type Tab = 'generate' | 'voices' | 'transcribe' | 'history' | 'settings';

interface HealthResponse {
  status: string;
  model_loaded: boolean;
  gpu_available: boolean;
  backend?: string;
}

interface VoiceProfile {
  id: string;
  name: string;
  description?: string;
  engine: string;
  created_at: string;
  samples?: any[];
}

interface Generation {
  id: string;
  text: string;
  profile_id?: string;
  engine: string;
  model?: string;
  audio_url?: string;
  duration?: number;
  created_at: string;
}

interface ModelStatus {
  name: string;
  loaded: boolean;
  downloading?: boolean;
  progress?: number;
}

function useApi() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [connecting, setConnecting] = useState(false);

  const checkHealth = useCallback(async () => {
    setConnecting(true);
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setConnecting(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return { health, connecting, checkHealth };
}

function StatusDot({ status }: { status: 'connected' | 'disconnected' | 'loading' }) {
  return <span className={`status-dot status-${status} inline-block`} />;
}

function Navbar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'generate', label: 'Generate', icon: '⚡' },
    { id: 'voices', label: 'Voices', icon: '🎭' },
    { id: 'transcribe', label: 'Transcribe', icon: '📝' },
    { id: 'history', label: 'History', icon: '📚' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-blue to-ink-500 flex items-center justify-center text-lg">🎙️</div>
          <span className="text-xl font-bold tracking-tight">iknbite</span>
          <span className="text-xs text-ink-300 font-mono bg-ink-900/50 px-2 py-0.5 rounded">v1.0</span>
        </div>
        <div className="flex items-center gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === t.id
                  ? 'tab-active text-white'
                  : 'text-ink-300 hover:text-white hover:bg-ink-800/50'
              }`}
            >
              <span className="mr-1.5">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function GenerateTab() {
  const [text, setText] = useState('');
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [engine, setEngine] = useState('qwen3-tts');
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch(`${API_BASE}/profiles`).then(r => r.json()).then(setProfiles).catch(() => {});
  }, []);

  const generate = async () => {
    if (!text.trim()) return;
    setGenerating(true);
    setError('');
    setAudioUrl(null);
    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          engine,
          profile_id: selectedProfile || undefined,
        }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      if (data.id) {
        const audioRes = await fetch(`${API_BASE}/audio/${data.id}`);
        const blob = await audioRes.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="slide-up space-y-6">
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-neon-blue">⚡</span> Text to Speech
          </h2>
          <div className="flex items-center gap-3">
            <select
              value={engine}
              onChange={e => setEngine(e.target.value)}
              className="bg-ink-900 border border-ink-700 rounded-lg px-3 py-1.5 text-sm font-mono"
            >
              <option value="qwen3-tts">Qwen3-TTS</option>
              <option value="kokoro">Kokoro</option>
              <option value="chatterbox">Chatterbox</option>
              <option value="luxtts">LuxTTS</option>
              <option value="hume">Hume</option>
            </select>
            <select
              value={selectedProfile}
              onChange={e => setSelectedProfile(e.target.value)}
              className="bg-ink-900 border border-ink-700 rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="">Default Voice</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type or paste text to convert to speech..."
          className="w-full h-40 bg-ink-900/50 border border-ink-700 rounded-xl p-4 text-sm font-mono resize-none placeholder:text-ink-500"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-400 font-mono">{text.length} characters</span>
          <button
            onClick={generate}
            disabled={generating || !text.trim()}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              generating
                ? 'bg-ink-700 text-ink-400 cursor-wait'
                : 'bg-gradient-to-r from-neon-blue to-ink-500 text-white hover:opacity-90 glow-blue'
            }`}
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Generating...
              </span>
            ) : (
              '⚡ Generate Speech'
            )}
          </button>
        </div>
        {error && <p className="text-neon-pink text-sm">{error}</p>}
      </div>

      {audioUrl && (
        <div className="glass rounded-2xl p-6 slide-up">
          <h3 className="text-sm font-semibold text-ink-300 mb-3">Generated Audio</h3>
          <audio ref={audioRef} controls src={audioUrl} className="w-full" />
          <div className="mt-3 flex gap-2">
            <a href={audioUrl} download className="px-4 py-1.5 bg-ink-800 rounded-lg text-xs font-medium hover:bg-ink-700 transition">📥 Download</a>
          </div>
        </div>
      )}
    </div>
  );
}

function VoicesTab() {
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEngine, setNewEngine] = useState('qwen3-tts');

  const loadProfiles = () => {
    fetch(`${API_BASE}/profiles`).then(r => r.json()).then(setProfiles).catch(() => {});
  };

  useEffect(() => { loadProfiles(); }, []);

  const createProfile = async () => {
    if (!newName.trim()) return;
    try {
      await fetch(`${API_BASE}/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc, engine: newEngine }),
      });
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
      loadProfiles();
    } catch {}
  };

  const deleteProfile = async (id: string) => {
    if (!confirm('Delete this voice profile?')) return;
    try {
      await fetch(`${API_BASE}/profiles/${id}`, { method: 'DELETE' });
      loadProfiles();
    } catch {}
  };

  return (
    <div className="slide-up space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-neon-pink">🎭</span> Voice Profiles
        </h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-gradient-to-r from-neon-pink to-ink-500 rounded-xl text-sm font-semibold hover:opacity-90 transition"
        >
          + New Voice
        </button>
      </div>

      {showCreate && (
        <div className="glass rounded-2xl p-6 space-y-4 slide-up">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Voice name"
            className="w-full bg-ink-900/50 border border-ink-700 rounded-xl px-4 py-2.5 text-sm"
          />
          <input
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="w-full bg-ink-900/50 border border-ink-700 rounded-xl px-4 py-2.5 text-sm"
          />
          <select value={newEngine} onChange={e => setNewEngine(e.target.value)} className="bg-ink-900 border border-ink-700 rounded-xl px-4 py-2.5 text-sm">
            <option value="qwen3-tts">Qwen3-TTS</option>
            <option value="kokoro">Kokoro</option>
            <option value="chatterbox">Chatterbox</option>
          </select>
          <div className="flex gap-2">
            <button onClick={createProfile} className="px-4 py-2 bg-neon-green/20 text-neon-green rounded-xl text-sm font-semibold hover:bg-neon-green/30 transition">Create</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-ink-800 rounded-xl text-sm font-medium hover:bg-ink-700 transition">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {profiles.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-ink-400 text-lg mb-2">No voice profiles yet</p>
            <p className="text-ink-500 text-sm">Create a voice to get started with voice cloning</p>
          </div>
        ) : (
          profiles.map(p => (
            <div key={p.id} className="glass rounded-2xl p-5 flex items-center justify-between hover-glow transition-all duration-200">
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-ink-400 text-sm">{p.description || 'No description'}</p>
                <span className="text-xs text-ink-500 font-mono mt-1 inline-block">{p.engine} • {new Date(p.created_at).toLocaleDateString()}</span>
              </div>
              <button onClick={() => deleteProfile(p.id)} className="px-3 py-1.5 bg-neon-pink/10 text-neon-pink rounded-lg text-xs hover:bg-neon-pink/20 transition">Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TranscribeTab() {
  const [file, setFile] = useState<File | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const transcribe = async () => {
    if (!file) return;
    setTranscribing(true);
    setError('');
    setResult('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/transcribe`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Transcription failed');
      const data = await res.json();
      setResult(data.text || data.transcription || JSON.stringify(data));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setTranscribing(false);
    }
  };

  return (
    <div className="slide-up space-y-6">
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-neon-green">📝</span> Speech to Text
        </h2>
        <div className="border-2 border-dashed border-ink-600 rounded-xl p-8 text-center hover:border-ink-400 transition">
          <input
            type="file"
            accept="audio/*"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="audio-upload"
          />
          <label htmlFor="audio-upload" className="cursor-pointer">
            <div className="text-4xl mb-3">🎤</div>
            <p className="text-ink-300 font-medium">{file ? file.name : 'Drop audio file or click to upload'}</p>
            <p className="text-ink-500 text-sm mt-1">Supports MP3, WAV, OGG, M4A</p>
          </label>
        </div>
        <button
          onClick={transcribe}
          disabled={transcribing || !file}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
            transcribing ? 'bg-ink-700 text-ink-400' : 'bg-gradient-to-r from-neon-green to-neon-blue text-ink-950 hover:opacity-90'
          }`}
        >
          {transcribing ? '🔄 Transcribing...' : '📝 Transcribe Audio'}
        </button>
        {error && <p className="text-neon-pink text-sm">{error}</p>}
      </div>

      {result && (
        <div className="glass rounded-2xl p-6 slide-up">
          <h3 className="text-sm font-semibold text-ink-300 mb-3">Transcription Result</h3>
          <div className="bg-ink-900/50 rounded-xl p-4 font-mono text-sm whitespace-pre-wrap">{result}</div>
          <button onClick={() => navigator.clipboard.writeText(result)} className="mt-3 px-4 py-1.5 bg-ink-800 rounded-lg text-xs font-medium hover:bg-ink-700 transition">📋 Copy</button>
        </div>
      )}
    </div>
  );
}

function HistoryTab() {
  const [history, setHistory] = useState<Generation[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/history`).then(r => r.json()).then(data => setHistory(data.items || data || [])).catch(() => {});
  }, []);

  return (
    <div className="slide-up space-y-6">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <span className="text-neon-orange">📚</span> Generation History
      </h2>
      {history.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-ink-400 text-lg mb-2">No generations yet</p>
          <p className="text-ink-500 text-sm">Your generated audio will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map(g => (
            <div key={g.id} className="glass rounded-2xl p-5 hover-glow transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{g.text}</p>
                  <p className="text-ink-500 text-xs font-mono mt-1">{g.engine} • {new Date(g.created_at).toLocaleString()}</p>
                </div>
                {g.id && (
                  <audio controls src={`${API_BASE}/audio/${g.id}`} className="ml-4 h-8 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab({ health }: { health: HealthResponse | null }) {
  const [apiUrl, setApiUrl] = useState(API_BASE);

  const save = () => {
    localStorage.setItem('iknbite_api_url', apiUrl);
    window.location.reload();
  };

  return (
    <div className="slide-up space-y-6">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <span className="text-ink-300">⚙️</span> Settings
      </h2>
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-sm text-ink-300">Backend Connection</h3>
        <div className="flex items-center gap-3 mb-4">
          <StatusDot status={health ? 'connected' : 'disconnected'} />
          <span className="text-sm">{health ? `Connected — ${health.backend || 'Voicebox'}` : 'Disconnected'}</span>
        </div>
        <label className="block">
          <span className="text-xs text-ink-400 font-mono">API URL</span>
          <input
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
            className="w-full mt-1 bg-ink-900/50 border border-ink-700 rounded-xl px-4 py-2.5 text-sm font-mono"
          />
        </label>
        <button onClick={save} className="px-4 py-2 bg-ink-700 rounded-xl text-sm font-medium hover:bg-ink-600 transition">Save & Reconnect</button>
      </div>

      <div className="glass rounded-2xl p-6 space-y-3">
        <h3 className="font-semibold text-sm text-ink-300">About</h3>
        <p className="text-ink-400 text-sm">iknbite — AI Voice Studio</p>
        <p className="text-ink-500 text-xs">Powered by Voicebox • Open Source • Runs Locally</p>
        <div className="flex gap-2 mt-2">
          <a href="https://github.com/jamiepine/voicebox" target="_blank" className="px-3 py-1.5 bg-ink-800 rounded-lg text-xs font-medium hover:bg-ink-700 transition">GitHub</a>
          <a href="https://voicebox.sh" target="_blank" className="px-3 py-1.5 bg-ink-800 rounded-lg text-xs font-medium hover:bg-ink-700 transition">Docs</a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('generate');
  const { health, connecting } = useApi();

  const tabContent: Record<Tab, React.ReactNode> = {
    generate: <GenerateTab />,
    voices: <VoicesTab />,
    transcribe: <TranscribeTab />,
    history: <HistoryTab />,
    settings: <SettingsTab health={health} />,
  };

  return (
    <div className="min-h-screen">
      <Navbar tab={tab} setTab={setTab} />

      {/* Hero gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-ink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-neon-pink/5 rounded-full blur-3xl"></div>
      </div>

      {/* Connection banner */}
      {!health && !connecting && (
        <div className="fixed top-16 left-0 right-0 z-40 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 border border-neon-pink/30">
              <StatusDot status="disconnected" />
              <span className="text-sm text-ink-300">
                Not connected to backend. Go to <button onClick={() => setTab('settings')} className="text-neon-blue underline">Settings</button> to configure.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className={`max-w-4xl mx-auto px-6 pt-24 pb-12 ${!health ? 'mt-12' : ''}`}>
        {tabContent[tab]}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 glass border-t border-ink-800/50 px-6 py-3 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-ink-500">
          <span>iknbite.com — AI Voice Studio</span>
          <div className="flex items-center gap-3">
            <StatusDot status={health ? 'connected' : connecting ? 'loading' : 'disconnected'} />
            <span>{health ? 'Connected' : connecting ? 'Connecting...' : 'Disconnected'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
