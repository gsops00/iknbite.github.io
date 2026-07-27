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
  { id:'ava', name:'Ava', desc:'Warm American female', emoji:'👩', colors:['#f472b6','#ec4899'], lang:'en', gender:'f', style:'Audiobook', age:'Young', quality:'Studio', uses:'155K', premium:true, popular:true, isNew:false }
  { id:'andrew', name:'Andrew', desc:'Deep American male', emoji:'👨', colors:['#3b82f6','#2563eb'], lang:'en', gender:'m', style:'Education', age:'Middle-aged', quality:'Studio', uses:'1.1M', premium:true, popular:true, isNew:false }
  { id:'brian', name:'Brian', desc:'Natural friendly male', emoji:'🧑', colors:['#10b981','#059669'], lang:'en', gender:'m', style:'Podcast', age:'Young', quality:'HD', uses:'715K', premium:false, popular:false, isNew:false }
  { id:'emma', name:'Emma', desc:'Bright cheerful female', emoji:'👧', colors:['#fbbf24','#f59e0b'], lang:'en', gender:'f', style:'Audiobook', age:'Mature', quality:'Expressive', uses:'1.8M', premium:false, popular:true, isNew:false }
  { id:'jenny', name:'Jenny', desc:'Friendly female', emoji:'👩‍💼', colors:['#a78bfa','#8b5cf6'], lang:'en', gender:'f', style:'Narration', age:'Young', quality:'Studio', uses:'443K', premium:true, popular:true, isNew:false }
  { id:'guy', name:'Guy', desc:'Casual laid-back male', emoji:'🧔', colors:['#6b7280','#4b5563'], lang:'en', gender:'m', style:'Podcast', age:'Young', quality:'HD', uses:'161K', premium:false, popular:true, isNew:false }
  { id:'aria', name:'Aria', desc:'Expressive dramatic female', emoji:'🎭', colors:['#ef4444','#dc2626'], lang:'en', gender:'f', style:'Customer Support', age:'Young', quality:'Studio', uses:'2.3M', premium:true, popular:true, isNew:false }
  { id:'davis', name:'Davis', desc:'Strong authoritative male', emoji:'💪', colors:['#1e293b','#0f172a'], lang:'en', gender:'m', style:'News', age:'Young', quality:'Studio', uses:'1.9M', premium:true, popular:true, isNew:false }
  { id:'sonia', name:'Sonia', desc:'Elegant British female', emoji:'👩‍🦰', colors:['#be185d','#9d174d'], lang:'en', gender:'f', style:'Customer Support', age:'Middle-aged', quality:'Studio', uses:'77K', premium:true, popular:true, isNew:false }
  { id:'ryan', name:'Ryan', desc:'Confident British male', emoji:'🎩', colors:['#0891b2','#0e7490'], lang:'en', gender:'m', style:'Documentary', age:'Young', quality:'Studio', uses:'1.8M', premium:true, popular:true, isNew:false }
  { id:'natasha', name:'Natasha', desc:'Australian female', emoji:'🦘', colors:['#16a34a','#15803d'], lang:'en', gender:'f', style:'Conversational', age:'Middle-aged', quality:'Expressive', uses:'358K', premium:false, popular:false, isNew:true }
  { id:'neerja', name:'Neerja', desc:'Indian female', emoji:'🇮🇳', colors:['#f59e0b','#d97706'], lang:'en', gender:'f', style:'Narration', age:'Young', quality:'HD', uses:'381K', premium:false, popular:false, isNew:true }
  { id:'tony', name:'Tony', desc:'Warm American male', emoji:'🎙️', colors:['#6366f1','#4f46e5'], lang:'en', gender:'m', style:'Documentary', age:'Middle-aged', quality:'Studio', uses:'1.2M', premium:true, popular:true, isNew:true }
  { id:'michelle', name:'Michelle', desc:'Clear American female', emoji:'🌸', colors:['#f97316','#ea580c'], lang:'en', gender:'f', style:'Education', age:'Young', quality:'Studio', uses:'770K', premium:true, popular:false, isNew:true }
  { id:'jason', name:'Jason', desc:'Professional American male', emoji:'💼', colors:['#8b5cf6','#7c3aed'], lang:'en', gender:'m', style:'News', age:'Mature', quality:'Studio', uses:'136K', premium:true, popular:false, isNew:true }
  { id:'sara', name:'Sara', desc:'Casual young female', emoji:'🌻', colors:['#14b8a6','#0d9488'], lang:'en', gender:'f', style:'News', age:'Young', quality:'HD', uses:'664K', premium:false, popular:false, isNew:true }
  { id:'nanami', name:'Nanami', desc:'Soft Japanese female', emoji:'🌸', colors:['#fb923c','#ea580c'], lang:'ja', gender:'f', style:'Customer Support', age:'Middle-aged', quality:'Studio', uses:'2.5M', premium:true, popular:true, isNew:false }
  { id:'keita', name:'Keita', desc:'Cool Japanese male', emoji:'⚔️', colors:['#f87171','#dc2626'], lang:'ja', gender:'m', style:'Podcast', age:'Mature', quality:'Studio', uses:'78K', premium:true, popular:false, isNew:false }
  { id:'mayu', name:'Mayu', desc:'Gentle Japanese female', emoji:'🍵', colors:['#f43f5e','#e11d48'], lang:'ja', gender:'f', style:'Narration', age:'Mature', quality:'Expressive', uses:'308K', premium:false, popular:false, isNew:false }
  { id:'xiaoxiao', name:'Xiaoxiao', desc:'Sweet Chinese female', emoji:'🦋', colors:['#c084fc','#9333ea'], lang:'zh', gender:'f', style:'Narration', age:'Young', quality:'Studio', uses:'474K', premium:true, popular:true, isNew:false }
  { id:'yunxi', name:'Yunxi', desc:'Gentle Chinese male', emoji:'🐉', colors:['#60a5fa','#2563eb'], lang:'zh', gender:'m', style:'News', age:'Middle-aged', quality:'HD', uses:'388K', premium:false, popular:false, isNew:false }
  { id:'xiaohan', name:'Xiaohan', desc:'Bright Chinese female', emoji:'🏮', colors:['#f472b6','#db2777'], lang:'zh', gender:'f', style:'Storytelling', age:'Middle-aged', quality:'HD', uses:'708K', premium:false, popular:false, isNew:false }
  { id:'sunhi', name:'SunHi', desc:'Clear Korean female', emoji:'🇰🇷', colors:['#f472b6','#db2777'], lang:'ko', gender:'f', style:'Conversational', age:'Mature', quality:'HD', uses:'685K', premium:false, popular:false, isNew:false }
  { id:'injoon', name:'InJoon', desc:'Calm Korean male', emoji:'🎮', colors:['#6366f1','#4f46e5'], lang:'ko', gender:'m', style:'Narration', age:'Mature', quality:'HD', uses:'565K', premium:false, popular:false, isNew:false }
  { id:'hyejin', name:'HyeJin', desc:'Warm Korean female', emoji:'🌙', colors:['#a78bfa','#7c3aed'], lang:'ko', gender:'f', style:'Audiobook', age:'Young', quality:'Expressive', uses:'403K', premium:false, popular:false, isNew:false }
  { id:'denise', name:'Denise', desc:'Charming French female', emoji:'🗼', colors:['#60a5fa','#2563eb'], lang:'fr', gender:'f', style:'Conversational', age:'Mature', quality:'Studio', uses:'2.4M', premium:true, popular:true, isNew:false }
  { id:'henri', name:'Henri', desc:'Sophisticated French male', emoji:'🥐', colors:['#a855f7','#7e22ce'], lang:'fr', gender:'m', style:'Podcast', age:'Mature', quality:'Studio', uses:'345K', premium:true, popular:false, isNew:false }
  { id:'elvira', name:'Elvira', desc:'Warm Spanish female', emoji:'💃', colors:['#fde047','#eab308'], lang:'es', gender:'f', style:'Education', age:'Young', quality:'Studio', uses:'1.0M', premium:true, popular:true, isNew:false }
  { id:'alvaro', name:'Alvaro', desc:'Friendly Spanish male', emoji:'🎸', colors:['#22c55e','#16a34a'], lang:'es', gender:'m', style:'Documentary', age:'Young', quality:'Studio', uses:'1.4M', premium:true, popular:true, isNew:false }
  { id:'dalia', name:'Dalia', desc:'Cheerful Spanish female', emoji:'🌞', colors:['#f97316','#ea580c'], lang:'es', gender:'f', style:'News', age:'Middle-aged', quality:'Expressive', uses:'600K', premium:false, popular:false, isNew:false }
  { id:'katja', name:'Katja', desc:'Clear German female', emoji:'🏔️', colors:['#06b6d4','#0891b2'], lang:'de', gender:'f', style:'Audiobook', age:'Middle-aged', quality:'Expressive', uses:'528K', premium:false, popular:false, isNew:false }
  { id:'conrad', name:'Conrad', desc:'Warm German male', emoji:'🌲', colors:['#059669','#047857'], lang:'de', gender:'m', style:'News', age:'Mature', quality:'HD', uses:'283K', premium:false, popular:false, isNew:true }
  { id:'francisca', name:'Francisca', desc:'Brazilian Portuguese female', emoji:'🎉', colors:['#10b981','#059669'], lang:'pt', gender:'f', style:'Storytelling', age:'Young', quality:'HD', uses:'570K', premium:false, popular:false, isNew:false }
  { id:'antonio', name:'Antonio', desc:'Brazilian Portuguese male', emoji:'🎶', colors:['#8b5cf6','#7c3aed'], lang:'pt', gender:'m', style:'Gaming', age:'Mature', quality:'HD', uses:'617K', premium:false, popular:false, isNew:true }
  { id:'elsa', name:'Elsa', desc:'Expressive Italian female', emoji:'🇮🇹', colors:['#ec4899','#db2777'], lang:'it', gender:'f', style:'News', age:'Middle-aged', quality:'Expressive', uses:'150K', premium:false, popular:false, isNew:false }
  { id:'diego', name:'Diego', desc:'Warm Italian male', emoji:'🍝', colors:['#f97316','#ea580c'], lang:'it', gender:'m', style:'Audiobook', age:'Middle-aged', quality:'Expressive', uses:'54K', premium:false, popular:false, isNew:true }
  { id:'swara', name:'Swara', desc:'Indian Hindi female', emoji:'🪷', colors:['#f43f5e','#e11d48'], lang:'hi', gender:'f', style:'Education', age:'Young', quality:'Expressive', uses:'173K', premium:false, popular:false, isNew:false }
  { id:'madhur', name:'Madhur', desc:'Indian Hindi male', emoji:'🙏', colors:['#d97706','#b45309'], lang:'hi', gender:'m', style:'Documentary', age:'Mature', quality:'HD', uses:'72K', premium:false, popular:false, isNew:false }
  { id:'svetlana', name:'Svetlana', desc:'Elegant Russian female', emoji:'❄️', colors:['#60a5fa','#3b82f6'], lang:'ru', gender:'f', style:'News', age:'Middle-aged', quality:'HD', uses:'496K', premium:false, popular:false, isNew:false }
  { id:'dmitry', name:'Dmitry', desc:'Strong Russian male', emoji:'🐻', colors:['#64748b','#475569'], lang:'ru', gender:'m', style:'Audiobook', age:'Middle-aged', quality:'HD', uses:'17K', premium:false, popular:false, isNew:true }
  { id:'zariyah', name:'Zariyah', desc:'Arabic female', emoji:'🕌', colors:['#10b981','#059669'], lang:'ar', gender:'f', style:'Audiobook', age:'Mature', quality:'Expressive', uses:'568K', premium:false, popular:false, isNew:false }
  { id:'hamed', name:'Hamed', desc:'Arabic male', emoji:'🌙', colors:['#d97706','#b45309'], lang:'ar', gender:'m', style:'Documentary', age:'Middle-aged', quality:'HD', uses:'362K', premium:false, popular:false, isNew:false }
  { id:'emel', name:'Emel', desc:'Turkish female', emoji:'🌷', colors:['#ef4444','#dc2626'], lang:'tr', gender:'f', style:'Narration', age:'Middle-aged', quality:'HD', uses:'481K', premium:false, popular:false, isNew:false }
  { id:'ahmet', name:'Ahmet', desc:'Turkish male', emoji:'☕', colors:['#78716c','#57534e'], lang:'tr', gender:'m', style:'Narration', age:'Mature', quality:'HD', uses:'281K', premium:false, popular:false, isNew:true }
  { id:'premw', name:'Prem', desc:'Thai female', emoji:'🇹🇭', colors:['#a78bfa','#7c3aed'], lang:'th', gender:'f', style:'Customer Support', age:'Young', quality:'HD', uses:'117K', premium:false, popular:false, isNew:false }
  { id:'hoai', name:'Hoa', desc:'Vietnamese female', emoji:'🌷', colors:['#f472b6','#ec4899'], lang:'vi', gender:'f', style:'Education', age:'Mature', quality:'Expressive', uses:'675K', premium:false, popular:false, isNew:false }
  { id:'agnieszka', name:'Agnieszka', desc:'Polish female', emoji:'🇵🇱', colors:['#ef4444','#dc2626'], lang:'pl', gender:'f', style:'Customer Support', age:'Mature', quality:'Expressive', uses:'397K', premium:false, popular:false, isNew:true }
  { id:'marek', name:'Marek', desc:'Polish male', emoji:'🇵🇱', colors:['#3b82f6','#2563eb'], lang:'pl', gender:'m', style:'Documentary', age:'Young', quality:'HD', uses:'561K', premium:false, popular:false, isNew:false }
  { id:'colette', name:'Colette', desc:'Dutch female', emoji:'🌷', colors:['#f97316','#ea580c'], lang:'nl', gender:'f', style:'Narration', age:'Mature', quality:'HD', uses:'25K', premium:false, popular:false, isNew:false }
  { id:'sofie', name:'Sofie', desc:'Swedish female', emoji:'🇸🇪', colors:['#fbbf24','#f59e0b'], lang:'sv', gender:'f', style:'Narration', age:'Middle-aged', quality:'HD', uses:'327K', premium:false, popular:false, isNew:false }
  { id:'athina', name:'Athina', desc:'Greek female', emoji:'🏛️', colors:['#60a5fa','#3b82f6'], lang:'el', gender:'f', style:'Storytelling', age:'Young', quality:'Expressive', uses:'600K', premium:false, popular:false, isNew:true }
  { id:'gadis', name:'Gadis', desc:'Indonesian female', emoji:'🌺', colors:['#ec4899','#db2777'], lang:'id', gender:'f', style:'Narration', age:'Young', quality:'HD', uses:'78K', premium:false, popular:false, isNew:false }
  { id:'eliska', name:'Eliska', desc:'Czech female', emoji:'🇨🇿', colors:['#a78bfa','#7c3aed'], lang:'cs', gender:'f', style:'Education', age:'Mature', quality:'HD', uses:'140K', premium:false, popular:false, isNew:false }
  { id:'somsak', name:'Somsak', desc:'Warm Thai male', emoji:'🇹🇭', colors:['#f97316','#ea580c'], lang:'th', gender:'m', style:'Education', age:'Middle-aged', quality:'HD', uses:'178K', premium:false, popular:false, isNew:false }
  { id:'tuan', name:'Tuan', desc:'Gentle Vietnamese male', emoji:'🇻🇳', colors:['#3b82f6','#2563eb'], lang:'vi', gender:'m', style:'Gaming', age:'Mature', quality:'HD', uses:'449K', premium:false, popular:false, isNew:false }
  { id:'daan', name:'Daan', desc:'Friendly Dutch male', emoji:'🇳🇱', colors:['#f97316','#ea580c'], lang:'nl', gender:'m', style:'Podcast', age:'Mature', quality:'HD', uses:'728K', premium:false, popular:false, isNew:false }
  { id:'erik_sv', name:'Erik', desc:'Calm Swedish male', emoji:'🇸🇪', colors:['#3b82f6','#2563eb'], lang:'sv', gender:'m', style:'Podcast', age:'Mature', quality:'HD', uses:'709K', premium:false, popular:false, isNew:false }
  { id:'nikos', name:'Nikos', desc:'Deep Greek male', emoji:'🇬🇷', colors:['#6366f1','#4f46e5'], lang:'el', gender:'m', style:'Education', age:'Middle-aged', quality:'HD', uses:'548K', premium:false, popular:false, isNew:false }
  { id:'budi', name:'Budi', desc:'Friendly Indonesian male', emoji:'🇮🇩', colors:['#10b981','#059669'], lang:'id', gender:'m', style:'News', age:'Young', quality:'Expressive', uses:'72K', premium:false, popular:false, isNew:true }
  { id:'ondrej', name:'Ondrej', desc:'Strong Czech male', emoji:'🇨🇿', colors:['#8b5cf6','#7c3aed'], lang:'cs', gender:'m', style:'Gaming', age:'Young', quality:'HD', uses:'246K', premium:false, popular:false, isNew:false }
  { id:'mikko', name:'Mikko', desc:'Warm Finnish male', emoji:'🇫🇮', colors:['#3b82f6','#2563eb'], lang:'fi', gender:'m', style:'Audiobook', age:'Young', quality:'Expressive', uses:'747K', premium:false, popular:false, isNew:true }
  { id:'aino', name:'Aino', desc:'Soft Finnish female', emoji:'🇫🇮', colors:['#f472b6','#ec4899'], lang:'fi', gender:'f', style:'Audiobook', age:'Young', quality:'Expressive', uses:'38K', premium:false, popular:false, isNew:true }
  { id:'erling', name:'Erling', desc:'Deep Norwegian male', emoji:'🇳🇴', colors:['#6366f1','#4f46e5'], lang:'nb', gender:'m', style:'Documentary', age:'Middle-aged', quality:'Expressive', uses:'255K', premium:false, popular:false, isNew:true }
  { id:'inger', name:'Inger', desc:'Gentle Norwegian female', emoji:'🇳🇴', colors:['#f472b6','#ec4899'], lang:'nb', gender:'f', style:'Conversational', age:'Mature', quality:'HD', uses:'570K', premium:false, popular:false, isNew:true }
  { id:'lars', name:'Lars', desc:'Friendly Danish male', emoji:'🇩🇰', colors:['#3b82f6','#2563eb'], lang:'da', gender:'m', style:'Podcast', age:'Mature', quality:'HD', uses:'604K', premium:false, popular:false, isNew:true }
  { id:'freja', name:'Freja', desc:'Bright Danish female', emoji:'🇩🇰', colors:['#f472b6','#ec4899'], lang:'da', gender:'f', style:'Customer Support', age:'Middle-aged', quality:'Expressive', uses:'501K', premium:false, popular:false, isNew:true }
  { id:'zoltan', name:'Zoltan', desc:'Strong Hungarian male', emoji:'🇭🇺', colors:['#6366f1','#4f46e5'], lang:'hu', gender:'m', style:'Documentary', age:'Middle-aged', quality:'Expressive', uses:'107K', premium:false, popular:false, isNew:true }
  { id:'eva', name:'Eva', desc:'Warm Hungarian female', emoji:'🇭🇺', colors:['#f472b6','#ec4899'], lang:'hu', gender:'f', style:'Audiobook', age:'Middle-aged', quality:'HD', uses:'436K', premium:false, popular:false, isNew:true }
  { id:'radu', name:'Radu', desc:'Friendly Romanian male', emoji:'🇷🇴', colors:['#3b82f6','#2563eb'], lang:'ro', gender:'m', style:'News', age:'Mature', quality:'Expressive', uses:'690K', premium:false, popular:false, isNew:true }
  { id:'alina', name:'Alina', desc:'Elegant Romanian female', emoji:'🇷🇴', colors:['#f472b6','#ec4899'], lang:'ro', gender:'f', style:'Audiobook', age:'Young', quality:'Expressive', uses:'769K', premium:false, popular:false, isNew:true }
  { id:'taras', name:'Taras', desc:'Deep Ukrainian male', emoji:'🇺🇦', colors:['#3b82f6','#2563eb'], lang:'uk', gender:'m', style:'Gaming', age:'Young', quality:'Expressive', uses:'204K', premium:false, popular:false, isNew:true }
  { id:'polina', name:'Polina', desc:'Sweet Ukrainian female', emoji:'🇺🇦', colors:['#f472b6','#ec4899'], lang:'uk', gender:'f', style:'Customer Support', age:'Middle-aged', quality:'Expressive', uses:'197K', premium:false, popular:false, isNew:true }
  { id:'yusof', name:'Yusof', desc:'Calm Malay male', emoji:'🇲🇾', colors:['#10b981','#059669'], lang:'ms', gender:'m', style:'Gaming', age:'Middle-aged', quality:'Expressive', uses:'84K', premium:false, popular:false, isNew:true }
  { id:'nurul', name:'Nurul', desc:'Gentle Malay female', emoji:'🇲🇾', colors:['#f472b6','#ec4899'], lang:'ms', gender:'f', style:'News', age:'Mature', quality:'Expressive', uses:'689K', premium:false, popular:false, isNew:true }
  { id:'rafael', name:'Rafael', desc:'Warm Filipino male', emoji:'🇵🇭', colors:['#f97316','#ea580c'], lang:'tl', gender:'m', style:'Audiobook', age:'Young', quality:'HD', uses:'795K', premium:false, popular:false, isNew:true }
  { id:'maria', name:'Maria', desc:'Bright Filipino female', emoji:'🇵🇭', colors:['#f472b6','#ec4899'], lang:'tl', gender:'f', style:'Education', age:'Young', quality:'Expressive', uses:'514K', premium:false, popular:false, isNew:true }
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
