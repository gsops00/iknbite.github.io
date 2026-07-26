/* ============================================
   iknbite  |  Voice Definitions
   ============================================ */

const LANGUAGES = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  ja: 'Japanese', zh: 'Chinese', ko: 'Korean', hi: 'Hindi',
  pt: 'Portuguese', it: 'Italian', ru: 'Russian', ar: 'Arabic',
  tr: 'Turkish', pl: 'Polish', nl: 'Dutch', sv: 'Swedish',
  da: 'Danish', fi: 'Finnish', nb: 'Norwegian', cs: 'Czech',
  el: 'Greek', hu: 'Hungarian', ro: 'Romanian', th: 'Thai',
  vi: 'Vietnamese', id: 'Indonesian', ms: 'Malay', uk: 'Ukrainian',
};

const VOICES = [
  // English
  { id:'ava',      name:'Ava',      desc:'Warm American female',     emoji:'👩',   colors:['#f472b6','#ec4899'], lang:'en', gender:'f' },
  { id:'andrew',   name:'Andrew',   desc:'Deep American male',       emoji:'👨',   colors:['#3b82f6','#2563eb'], lang:'en', gender:'m' },
  { id:'brian',    name:'Brian',    desc:'Natural friendly male',    emoji:'🧑',   colors:['#10b981','#059669'], lang:'en', gender:'m' },
  { id:'emma',     name:'Emma',     desc:'Bright cheerful female',   emoji:'👧',   colors:['#fbbf24','#f59e0b'], lang:'en', gender:'f' },
  { id:'jenny',    name:'Jenny',    desc:'Friendly female',          emoji:'👩‍💼', colors:['#a78bfa','#8b5cf6'], lang:'en', gender:'f' },
  { id:'guy',      name:'Guy',      desc:'Casual laid-back male',    emoji:'🧔',   colors:['#6b7280','#4b5563'], lang:'en', gender:'m' },
  { id:'aria',     name:'Aria',     desc:'Expressive dramatic female',emoji:'🎭',   colors:['#ef4444','#dc2626'], lang:'en', gender:'f' },
  { id:'davis',    name:'Davis',    desc:'Strong authoritative male', emoji:'💪',   colors:['#1e293b','#0f172a'], lang:'en', gender:'m' },
  { id:'sonia',    name:'Sonia',    desc:'Elegant British female',   emoji:'👩‍🦰', colors:['#be185d','#9d174d'], lang:'en', gender:'f' },
  { id:'ryan',     name:'Ryan',     desc:'Confident British male',   emoji:'🎩',   colors:['#0891b2','#0e7490'], lang:'en', gender:'m' },
  { id:'natasha',  name:'Natasha',  desc:'Australian female',        emoji:'🦘',   colors:['#16a34a','#15803d'], lang:'en', gender:'f' },
  { id:'neerja',   name:'Neerja',   desc:'Indian female',            emoji:'🇮🇳',  colors:['#f59e0b','#d97706'], lang:'en', gender:'f' },
  { id:'tony',     name:'Tony',     desc:'Warm American male',       emoji:'🎙️',  colors:['#6366f1','#4f46e5'], lang:'en', gender:'m' },
  { id:'michelle', name:'Michelle', desc:'Clear American female',    emoji:'🌸',   colors:['#f97316','#ea580c'], lang:'en', gender:'f' },
  { id:'jason',    name:'Jason',    desc:'Professional American male',emoji:'💼',  colors:['#8b5cf6','#7c3aed'], lang:'en', gender:'m' },
  { id:'sara',     name:'Sara',     desc:'Casual young female',      emoji:'🌻',   colors:['#14b8a6','#0d9488'], lang:'en', gender:'f' },

  // Japanese
  { id:'nanami',   name:'Nanami',   desc:'Soft Japanese female',     emoji:'🌸',   colors:['#fb923c','#ea580c'], lang:'ja', gender:'f' },
  { id:'keita',    name:'Keita',    desc:'Cool Japanese male',       emoji:'⚔️',   colors:['#f87171','#dc2626'], lang:'ja', gender:'m' },
  { id:'mayu',     name:'Mayu',     desc:'Gentle Japanese female',   emoji:'🍵',   colors:['#f43f5e','#e11d48'], lang:'ja', gender:'f' },

  // Chinese
  { id:'xiaoxiao', name:'Xiaoxiao', desc:'Sweet Chinese female',     emoji:'🦋',   colors:['#c084fc','#9333ea'], lang:'zh', gender:'f' },
  { id:'yunxi',    name:'Yunxi',    desc:'Gentle Chinese male',      emoji:'🐉',   colors:['#60a5fa','#2563eb'], lang:'zh', gender:'m' },
  { id:'xiaohan',  name:'Xiaohan',  desc:'Bright Chinese female',    emoji:'🏮',   colors:['#f472b6','#db2777'], lang:'zh', gender:'f' },

  // Korean
  { id:'sunhi',    name:'SunHi',    desc:'Clear Korean female',      emoji:'🇰🇷',  colors:['#f472b6','#db2777'], lang:'ko', gender:'f' },
  { id:'injoon',   name:'InJoon',   desc:'Calm Korean male',         emoji:'🎮',   colors:['#6366f1','#4f46e5'], lang:'ko', gender:'m' },
  { id:'hyejin',   name:'HyeJin',   desc:'Warm Korean female',       emoji:'🌙',   colors:['#a78bfa','#7c3aed'], lang:'ko', gender:'f' },

  // French
  { id:'denise',   name:'Denise',   desc:'Charming French female',   emoji:'🗼',   colors:['#60a5fa','#2563eb'], lang:'fr', gender:'f' },
  { id:'henri',    name:'Henri',    desc:'Sophisticated French male',emoji:'🥐',   colors:['#a855f7','#7e22ce'], lang:'fr', gender:'m' },

  // Spanish
  { id:'elvira',   name:'Elvira',   desc:'Warm Spanish female',      emoji:'💃',   colors:['#fde047','#eab308'], lang:'es', gender:'f' },
  { id:'alvaro',   name:'Alvaro',   desc:'Friendly Spanish male',    emoji:'🎸',   colors:['#22c55e','#16a34a'], lang:'es', gender:'m' },
  { id:'dalia',    name:'Dalia',    desc:'Cheerful Spanish female',  emoji:'🌞',   colors:['#f97316','#ea580c'], lang:'es', gender:'f' },

  // German
  { id:'katja',    name:'Katja',    desc:'Clear German female',      emoji:'🏔️',  colors:['#06b6d4','#0891b2'], lang:'de', gender:'f' },
  { id:'conrad',   name:'Conrad',   desc:'Warm German male',         emoji:'🌲',   colors:['#059669','#047857'], lang:'de', gender:'m' },

  // Portuguese
  { id:'francisca',name:'Francisca',desc:'Brazilian Portuguese female',emoji:'🎉',colors:['#10b981','#059669'], lang:'pt', gender:'f' },
  { id:'antonio',  name:'Antonio',  desc:'Brazilian Portuguese male', emoji:'🎶',  colors:['#8b5cf6','#7c3aed'], lang:'pt', gender:'m' },

  // Italian
  { id:'elsa',     name:'Elsa',     desc:'Expressive Italian female',emoji:'🇮🇹',  colors:['#ec4899','#db2777'], lang:'it', gender:'f' },
  { id:'diego',    name:'Diego',    desc:'Warm Italian male',        emoji:'🍝',   colors:['#f97316','#ea580c'], lang:'it', gender:'m' },

  // Hindi
  { id:'swara',    name:'Swara',    desc:'Indian Hindi female',      emoji:'🪷',   colors:['#f43f5e','#e11d48'], lang:'hi', gender:'f' },
  { id:'madhur',   name:'Madhur',   desc:'Indian Hindi male',        emoji:'🙏',   colors:['#d97706','#b45309'], lang:'hi', gender:'m' },

  // Russian
  { id:'svetlana', name:'Svetlana', desc:'Elegant Russian female',   emoji:'❄️',   colors:['#60a5fa','#3b82f6'], lang:'ru', gender:'f' },
  { id:'dmitry',   name:'Dmitry',   desc:'Strong Russian male',      emoji:'🐻',   colors:['#64748b','#475569'], lang:'ru', gender:'m' },

  // Arabic
  { id:'zariyah',  name:'Zariyah',  desc:'Arabic female',            emoji:'🕌',   colors:['#10b981','#059669'], lang:'ar', gender:'f' },
  { id:'hamed',    name:'Hamed',    desc:'Arabic male',              emoji:'🌙',   colors:['#d97706','#b45309'], lang:'ar', gender:'m' },

  // Turkish
  { id:'emel',     name:'Emel',     desc:'Turkish female',           emoji:'🌷',   colors:['#ef4444','#dc2626'], lang:'tr', gender:'f' },
  { id:'ahmet',    name:'Ahmet',    desc:'Turkish male',             emoji:'☕',   colors:['#78716c','#57534e'], lang:'tr', gender:'m' },

  // Thai
  { id:'premw',    name:'Prem',     desc:'Thai female',              emoji:'🇹🇭',  colors:['#a78bfa','#7c3aed'], lang:'th', gender:'f' },

  // Vietnamese
  { id:'hoai',     name:'Hoa',      desc:'Vietnamese female',        emoji:'🌷',   colors:['#f472b6','#ec4899'], lang:'vi', gender:'f' },

  // Polish
  { id:'agnieszka',name:'Agnieszka',desc:'Polish female',           emoji:'🇵🇱',  colors:['#ef4444','#dc2626'], lang:'pl', gender:'f' },
  { id:'marek',    name:'Marek',    desc:'Polish male',             emoji:'🇵🇱',  colors:['#3b82f6','#2563eb'], lang:'pl', gender:'m' },

  // Dutch
  { id:'colette',  name:'Colette',  desc:'Dutch female',            emoji:'🌷',   colors:['#f97316','#ea580c'], lang:'nl', gender:'f' },

  // Swedish
  { id:'sofie',    name:'Sofie',    desc:'Swedish female',          emoji:'🇸🇪',  colors:['#fbbf24','#f59e0b'], lang:'sv', gender:'f' },

  // Greek
  { id:'athina',   name:'Athina',   desc:'Greek female',            emoji:'🏛️',  colors:['#60a5fa','#3b82f6'], lang:'el', gender:'f' },

  // Indonesian
  { id:'gadis',    name:'Gadis',    desc:'Indonesian female',       emoji:'🌺',   colors:['#ec4899','#db2777'], lang:'id', gender:'f' },

  // Czech
  { id:'eliska',   name:'Eliska',   desc:'Czech female',            emoji:'🇨🇿',  colors:['#a78bfa','#7c3aed'], lang:'cs', gender:'f' },
];

// Pre-generate avatars for all voices
VOICES.forEach(v => { v.avatar = generateAvatar(v); });

// Map voice IDs to Web Speech API voice names for matching
const WEB_SPEECH_MAP = {
  en:  { f: ['Google UK English Female','Google US English','Microsoft Zira','Samantha','Karen'], m: ['Google UK English Male','Google US English','Microsoft David','Daniel','Alex'] },
  es:  { f: ['Google español','Microsoft Helena'], m: ['Google español','Microsoft Pablo'] },
  fr:  { f: ['Google français','Microsoft Hortense'], m: ['Google français','Microsoft Paul'] },
  de:  { f: ['Google Deutsch','Microsoft Hedda'], m: ['Google Deutsch','Microsoft Stefan'] },
  ja:  { f: ['Google 日本語','Microsoft Haruka'], m: ['Google 日本語','Microsoft Ichiro'] },
  zh:  { f: ['Google 普通话','Microsoft Lili','Ting-Ting'], m: ['Google 普通话','Kangkang'] },
  ko:  { f: ['Google 한국의','Microsoft Heami'], m: ['Google 한국의','Microsoft SunHi'] },
  hi:  { f: ['Google हिन्दी','Microsoft Heera'], m: ['Google हिन्दी','Microsoft Ravi'] },
  pt:  { f: ['Google português','Microsoft Maria'], m: ['Google português','Microsoft Antonio'] },
  it:  { f: ['Google italiano','Microsoft Cosimo'], m: ['Google italiano','Microsoft Cosimo'] },
  ru:  { f: ['Google русский','Microsoft Irina'], m: ['Google русский','Microsoft Dmitri'] },
  ar:  { f: ['Google العربية','Microsoft Hoda'], m: ['Google العربية','Microsoft Naief'] },
  tr:  { f: ['Google Türkçe'], m: ['Google Türkçe'] },
  pl:  { f: ['Google Polski','Microsoft Paulina'], m: ['Google Polski'] },
  nl:  { f: ['Google Nederlands'], m: ['Google Nederlands'] },
  sv:  { f: ['Google Svenska'], m: ['Google Svenska'] },
  da:  { f: ['Google Dansk'], m: ['Google Dansk'] },
  fi:  { f: ['Google Suomi'], m: ['Google Suomi'] },
  nb:  { f: ['Google Norsk'], m: ['Google Norsk'] },
  cs:  { f: ['Google Čeština','Microsoft Iveta'], m: ['Google Čeština'] },
  el:  { f: ['Google Ελληνικά'], m: ['Google Ελληνικά'] },
  hu:  { f: ['Google Magyar'], m: ['Google Magyar'] },
  ro:  { f: ['Google Română'], m: ['Google Română'] },
  th:  { f: ['Google ไทย','Microsoft Pattara'], m: ['Google ไทย'] },
  vi:  { f: ['Google Việt','Microsoft Lan'], m: ['Google Việt'] },
  id:  { f: ['Google Indonesia'], m: ['Google Indonesia'] },
  ms:  { f: ['Google Melayu'], m: ['Google Melayu'] },
  uk:  { f: ['Google Українська'], m: ['Google Українська'] },
};
