/* ============================================
   Edge TTS Worker for Cloudflare Workers
   Free — no API key, no billing
   Supports 300+ neural voices, 80+ languages
   ============================================ */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

// Voice list endpoint
function handleVoices() {
  const voices = [
    // English
    { id:'en-US-AvaNeural', name:'Ava', lang:'en', gender:'female', locale:'en-US' },
    { id:'en-US-AndrewNeural', name:'Andrew', lang:'en', gender:'male', locale:'en-US' },
    { id:'en-US-BrianNeural', name:'Brian', lang:'en', gender:'male', locale:'en-US' },
    { id:'en-US-EmmaNeural', name:'Emma', lang:'en', gender:'female', locale:'en-US' },
    { id:'en-US-JennyNeural', name:'Jenny', lang:'en', gender:'female', locale:'en-US' },
    { id:'en-US-GuyNeural', name:'Guy', lang:'en', gender:'male', locale:'en-US' },
    { id:'en-US-AriaNeural', name:'Aria', lang:'en', gender:'female', locale:'en-US' },
    { id:'en-US-DavisNeural', name:'Davis', lang:'en', gender:'male', locale:'en-US' },
    { id:'en-GB-SoniaNeural', name:'Sonia', lang:'en', gender:'female', locale:'en-GB' },
    { id:'en-GB-RyanNeural', name:'Ryan', lang:'en', gender:'male', locale:'en-GB' },
    { id:'en-AU-NatashaNeural', name:'Natasha', lang:'en', gender:'female', locale:'en-AU' },
    { id:'en-IN-NeerjaNeural', name:'Neerja', lang:'en', gender:'female', locale:'en-IN' },
    { id:'en-US-TonyNeural', name:'Tony', lang:'en', gender:'male', locale:'en-US' },
    { id:'en-US-MichelleNeural', name:'Michelle', lang:'en', gender:'female', locale:'en-US' },
    { id:'en-US-JasonNeural', name:'Jason', lang:'en', gender:'male', locale:'en-US' },
    { id:'en-US-SaraNeural', name:'Sara', lang:'en', gender:'female', locale:'en-US' },
    // Japanese
    { id:'ja-JP-NanamiNeural', name:'Nanami', lang:'ja', gender:'female', locale:'ja-JP' },
    { id:'ja-JP-KeitaNeural', name:'Keita', lang:'ja', gender:'male', locale:'ja-JP' },
    { id:'ja-JP-MayuNeural', name:'Mayu', lang:'ja', gender:'female', locale:'ja-JP' },
    // Chinese
    { id:'zh-CN-XiaoxiaoNeural', name:'Xiaoxiao', lang:'zh', gender:'female', locale:'zh-CN' },
    { id:'zh-CN-YunxiNeural', name:'Yunxi', lang:'zh', gender:'male', locale:'zh-CN' },
    { id:'zh-CN-XiaohanNeural', name:'Xiaohan', lang:'zh', gender:'female', locale:'zh-CN' },
    // Korean
    { id:'ko-KR-SunHiNeural', name:'SunHi', lang:'ko', gender:'female', locale:'ko-KR' },
    { id:'ko-KR-InJoonNeural', name:'InJoon', lang:'ko', gender:'male', locale:'ko-KR' },
    { id:'ko-KR-HyeJinNeural', name:'HyeJin', lang:'ko', gender:'female', locale:'ko-KR' },
    // French
    { id:'fr-FR-DeniseNeural', name:'Denise', lang:'fr', gender:'female', locale:'fr-FR' },
    { id:'fr-FR-HenriNeural', name:'Henri', lang:'fr', gender:'male', locale:'fr-FR' },
    // Spanish
    { id:'es-ES-ElviraNeural', name:'Elvira', lang:'es', gender:'female', locale:'es-ES' },
    { id:'es-ES-AlvaroNeural', name:'Alvaro', lang:'es', gender:'male', locale:'es-ES' },
    { id:'es-ES-DaliaNeural', name:'Dalia', lang:'es', gender:'female', locale:'es-ES' },
    // German
    { id:'de-DE-KatjaNeural', name:'Katja', lang:'de', gender:'female', locale:'de-DE' },
    { id:'de-DE-ConradNeural', name:'Conrad', lang:'de', gender:'male', locale:'de-DE' },
    // Portuguese
    { id:'pt-BR-FranciscaNeural', name:'Francisca', lang:'pt', gender:'female', locale:'pt-BR' },
    { id:'pt-BR-AntonioNeural', name:'Antonio', lang:'pt', gender:'male', locale:'pt-BR' },
    // Italian
    { id:'it-IT-ElsaNeural', name:'Elsa', lang:'it', gender:'female', locale:'it-IT' },
    { id:'it-IT-DiegoNeural', name:'Diego', lang:'it', gender:'male', locale:'it-IT' },
    // Russian
    { id:'ru-RU-SvetlanaNeural', name:'Svetlana', lang:'ru', gender:'female', locale:'ru-RU' },
    { id:'ru-RU-DmitryNeural', name:'Dmitry', lang:'ru', gender:'male', locale:'ru-RU' },
    // Arabic
    { id:'ar-SA-ZariyahNeural', name:'Zariyah', lang:'ar', gender:'female', locale:'ar-SA' },
    { id:'ar-SA-HamedNeural', name:'Hamed', lang:'ar', gender:'male', locale:'ar-SA' },
    // Turkish
    { id:'tr-TR-EmelNeural', name:'Emel', lang:'tr', gender:'female', locale:'tr-TR' },
    { id:'tr-TR-AhmetNeural', name:'Ahmet', lang:'tr', gender:'male', locale:'tr-TR' },
    // Polish
    { id:'pl-PL-AgnieszkaNeural', name:'Agnieszka', lang:'pl', gender:'female', locale:'pl-PL' },
    { id:'pl-PL-MarekNeural', name:'Marek', lang:'pl', gender:'male', locale:'pl-PL' },
    // Dutch
    { id:'nl-NL-ColetteNeural', name:'Colette', lang:'nl', gender:'female', locale:'nl-NL' },
    // Swedish
    { id:'sv-SE-SofieNeural', name:'Sofie', lang:'sv', gender:'female', locale:'sv-SE' },
    // Greek
    { id:'el-GR-AthinaNeural', name:'Athina', lang:'el', gender:'female', locale:'el-GR' },
    // Indonesian
    { id:'id-ID-GadisNeural', name:'Gadis', lang:'id', gender:'female', locale:'id-ID' },
    // Czech
    { id:'cs-CZ-VlastaNeural', name:'Eliska', lang:'cs', gender:'female', locale:'cs-CZ' },
    // Thai
    { id:'th-TH-PremwadeeNeural', name:'Prem', lang:'th', gender:'female', locale:'th-TH' },
    // Vietnamese
    { id:'vi-VN-HoaiMyNeural', name:'Hoa', lang:'vi', gender:'female', locale:'vi-VN' },
    // Hindi
    { id:'hi-IN-SwaraNeural', name:'Swara', lang:'hi', gender:'female', locale:'hi-IN' },
    { id:'hi-IN-MadhurNeural', name:'Madhur', lang:'hi', gender:'male', locale:'hi-IN' },
    // Finnish
    { id:'fi-FI-SelmaNeural', name:'Fenna', lang:'fi', gender:'female', locale:'fi-FI' },
    // Norwegian
    { id:'nb-NO-PernilleNeural', name:'Noemi', lang:'nb', gender:'female', locale:'nb-NO' },
    { id:'nb-NO-FinnNeural', name:'Finn', lang:'nb', gender:'male', locale:'nb-NO' },
    // Danish
    { id:'da-DK-ChristelNeural', name:'Helena', lang:'da', gender:'female', locale:'da-DK' },
    { id:'da-DK-JeppeNeural', name:'Jeppe', lang:'da', gender:'male', locale:'da-DK' },
    // Hungarian
    { id:'hu-HU-NoemiNeural', name:'Noemi', lang:'hu', gender:'female', locale:'hu-HU' },
    // Romanian
    { id:'ro-RO-AlinaNeural', name:'Alina', lang:'ro', gender:'female', locale:'ro-RO' },
  ];
  return jsonResponse({ voices });
}

// Health check
function handleHealth() {
  return jsonResponse({ engine: 'edge-tts', status: 'ok', version: '1.0' });
}

// TTS generation via Edge TTS WebSocket
async function handleTTS(request) {
  const { text, voice, rate, volume, pitch } = await request.json();
  if (!text || !voice) {
    return jsonResponse({ error: 'text and voice are required' }, 400);
  }

  try {
    const audioBuffer = await edgeTTSGenerate(text, voice, rate || '+0%', volume || '+0%', pitch || '+0Hz');
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="speech.mp3"',
        ...CORS_HEADERS,
      },
    });
  } catch (e) {
    return jsonResponse({ error: e.message }, 500);
  }
}

// Edge TTS protocol implementation via WebSocket
async function edgeTTSGenerate(text, voice, rate, volume, pitch) {
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '');

  // Connect to Edge TTS WebSocket
  const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=${requestId}`;
  const ws = new WebSocket(wsUrl);

  return new Promise((resolve, reject) => {
    const chunks = [];
    let resolved = false;

    ws.onopen = () => {
      // Send config
      const configMessage = `Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-96kbitrate-mono-mp3"}}}}`;
      ws.send(configMessage);

      // Send SSML
      const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='${voice}'><prosody pitch='${pitch}' rate='${rate}' volume='${volume}'>${escapeXml(text)}</prosody></voice></speak>`;
      const speechMessage = `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${timestamp}Z\r\nPath:ssml\r\n\r\n${ssml}`;
      ws.send(speechMessage);
    };

    ws.onmessage = (event) => {
      if (event.data instanceof Blob) {
        event.data.arrayBuffer().then(buf => {
          // Extract audio data after the header
          const view = new Uint8Array(buf);
          // Find the end of the text header (two newlines)
          let headerEnd = 0;
          for (let i = 0; i < view.length - 1; i++) {
            if (view[i] === 0x0D && view[i + 1] === 0x0A) {
              // Check for double CRLF
              if (i + 3 < view.length && view[i + 2] === 0x0D && view[i + 3] === 0x0A) {
                headerEnd = i + 4;
                break;
              }
              // Or single CRLF followed by binary
              if (i + 2 < view.length && view[i + 2] === 0x0D) {
                headerEnd = i + 3;
                break;
              }
            }
          }
          if (headerEnd > 0 && headerEnd < view.length) {
            chunks.push(view.slice(headerEnd));
          } else {
            chunks.push(view);
          }
        });
      } else if (typeof event.data === 'string') {
        if (event.data.includes('Path:turn.end')) {
          ws.close();
          if (!resolved) {
            resolved = true;
            // Combine all chunks into a single buffer
            const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
            const result = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunks) {
              result.set(chunk, offset);
              offset += chunk.length;
            }
            resolve(result.buffer);
          }
        }
      }
    };

    ws.onerror = (e) => {
      if (!resolved) {
        resolved = true;
        reject(new Error('WebSocket error: ' + e.message));
      }
    };

    ws.onclose = () => {
      if (!resolved) {
        resolved = true;
        if (chunks.length > 0) {
          const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
          const result = new Uint8Array(totalLength);
          let offset = 0;
          for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
          }
          resolve(result.buffer);
        } else {
          reject(new Error('WebSocket closed with no audio data'));
        }
      }
    };

    // Timeout
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        ws.close();
        reject(new Error('TTS generation timed out'));
      }
    }, 30000);
  });
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Main handler
export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname === '/health') {
      return handleHealth();
    }

    if (url.pathname === '/voices') {
      return handleVoices();
    }

    if (url.pathname === '/tts' && request.method === 'POST') {
      return handleTTS(request);
    }

    return jsonResponse({ error: 'Not found' }, 404);
  },
};
