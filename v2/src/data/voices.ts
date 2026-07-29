export interface Voice {
  id: string;
  name: string;
  description: string;
  language: string;
  langCode: string;
  gender: "male" | "female";
  style: string;
  accent: string;
  age: string;
  quality: string;
  tags: string[];
  sampleText: string;
  provider: "cloud" | "system";
  avatarColor: [string, string];
}

export const LANGUAGES: Record<string, string> = {
  en: "English", es: "Spanish", fr: "French", de: "German",
  ja: "Japanese", zh: "Chinese", ko: "Korean", hi: "Hindi",
  pt: "Portuguese", it: "Italian", ru: "Russian", ar: "Arabic",
  tr: "Turkish", pl: "Polish", nl: "Dutch", sv: "Swedish",
  da: "Danish", fi: "Finnish", nb: "Norwegian", cs: "Czech",
  el: "Greek", hu: "Hungarian", ro: "Romanian", th: "Thai",
  vi: "Vietnamese", id: "Indonesian", ms: "Malay", uk: "Ukrainian",
  tl: "Filipino",
};

export const VOICES: Voice[] = [
  // English
  { id:"ava", name:"Ava", description:"Warm American female", language:"English", langCode:"en", gender:"female", style: "Audiobook", accent: "American", age: "Young", quality: "Studio", tags:["warm","american"], sampleText:"Hello! I'm Ava, your new voice. Let me read something for you.", provider:"cloud", avatarColor:["#f472b6","#ec4899"] },
  { id:"andrew", name:"Andrew", description:"Deep American male", language:"English", langCode:"en", gender:"male", style: "Education", accent: "American", age: "Middle-aged", quality: "Studio", tags:["deep","american"], sampleText:"Hey there, I'm Andrew. Ready to bring your words to life.", provider:"cloud", avatarColor:["#3b82f6","#2563eb"] },
  { id:"brian", name:"Brian", description:"Natural friendly male", language:"English", langCode:"en", gender:"male", style: "Podcast", accent: "American", age: "Young", quality: "HD", tags:["friendly","natural"], sampleText:"Hi, I'm Brian. Friendly, natural, and ready to speak for you.", provider:"cloud", avatarColor:["#10b981","#059669"] },
  { id:"emma", name:"Emma", description:"Bright cheerful female", language:"English", langCode:"en", gender:"female", style: "Audiobook", accent: "American", age: "Mature", quality: "Expressive", tags:["bright","cheerful"], sampleText:"Hello! Emma here — bright, cheerful, and always ready to chat.", provider:"cloud", avatarColor:["#fbbf24","#f59e0b"] },
  { id:"jenny", name:"Jenny", description:"Friendly female", language:"English", langCode:"en", gender:"female", style: "Narration", accent: "American", age: "Young", quality: "Studio", tags:["friendly","professional"], sampleText:"Hi! I'm Jenny. Friendly and professional — perfect for any project.", provider:"cloud", avatarColor:["#a78bfa","#8b5cf6"] },
  { id:"guy", name:"Guy", description:"Casual laid-back male", language:"English", langCode:"en", gender:"male", style: "Podcast", accent: "American", age: "Young", quality: "HD", tags:["casual","laid-back"], sampleText:"Hey, I'm Guy. Casual, laid-back, and ready to go.", provider:"cloud", avatarColor:["#6b7280","#4b5563"] },
  { id:"aria", name:"Aria", description:"Expressive dramatic female", language:"English", langCode:"en", gender:"female", style: "Customer Support", accent: "American", age: "Young", quality: "Studio", tags:["expressive","dramatic"], sampleText:"Hello, I'm Aria. Expressive, dramatic — let's make your script shine.", provider:"cloud", avatarColor:["#ef4444","#dc2626"] },
  { id:"davis", name:"Davis", description:"Strong authoritative male", language:"English", langCode:"en", gender:"male", style: "News", accent: "American", age: "Young", quality: "Studio", tags:["strong","authoritative"], sampleText:"I'm Davis. Strong, authoritative — your words carry weight with me.", provider:"cloud", avatarColor:["#1e293b","#0f172a"] },
  { id:"sonia", name:"Sonia", description:"Elegant British female", language:"English", langCode:"en", gender:"female", style: "Customer Support", accent: "British", age: "Middle-aged", quality: "Studio", tags:["elegant","british"], sampleText:"Good day, I'm Sonia. Elegant British English at your service.", provider:"cloud", avatarColor:["#be185d","#9d174d"] },
  { id:"ryan", name:"Ryan", description:"Confident British male", language:"English", langCode:"en", gender:"male", style: "Documentary", accent: "British", age: "Young", quality: "Studio", tags:["confident","british"], sampleText:"Hello, Ryan here. Confident British English for your project.", provider:"cloud", avatarColor:["#0891b2","#0e7490"] },
  // Japanese
  { id:"nanami", name:"Nanami", description:"Soft Japanese female", language:"Japanese", langCode:"ja", gender:"female", style: "Customer Support", accent: "", age: "Middle-aged", quality: "Studio", tags:["soft","gentle"], sampleText:"こんにちは！私は七海です。あなたの声になりましょう。", provider:"cloud", avatarColor:["#fb923c","#ea580c"] },
  { id:"keita", name:"Keita", description:"Cool Japanese male", language:"Japanese", langCode:"ja", gender:"male", style: "Podcast", accent: "", age: "Mature", quality: "Studio", tags:["cool","calm"], sampleText:"やあ、ケイタです。カッコよく読み上げますよ。", provider:"cloud", avatarColor:["#f87171","#dc2626"] },
  // Chinese
  { id:"xiaoxiao", name:"Xiaoxiao", description:"Sweet Chinese female", language:"Chinese", langCode:"zh", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["sweet","bright"], sampleText:"你好！我是晓晓，让我来为你朗读。", provider:"cloud", avatarColor:["#c084fc","#9333ea"] },
  { id:"yunxi", name:"Yunxi", description:"Gentle Chinese male", language:"Chinese", langCode:"zh", gender:"male", style: "News", accent: "", age: "Adult", quality: "HD", tags:["gentle","warm"], sampleText:"你好，我是云希。温柔的声音为你服务。", provider:"cloud", avatarColor:["#60a5fa","#2563eb"] },
  // Korean
  { id:"sunhi", name:"SunHi", description:"Clear Korean female", language:"Korean", langCode:"ko", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["clear","bright"], sampleText:"안녕하세요! 저는 순희예요. 또렷한 목소리로 읽어드릴게요.", provider:"cloud", avatarColor:["#f472b6","#db2777"] },
  { id:"injoon", name:"InJoon", description:"Calm Korean male", language:"Korean", langCode:"ko", gender:"male", style: "Documentary", accent: "", age: "Adult", quality: "HD", tags:["calm","gentle"], sampleText:"안녕하세요, 인준입니다. 차분한 목소리로 읽어드리겠습니다.", provider:"cloud", avatarColor:["#6366f1","#4f46e5"] },
  // French
  { id:"denise", name:"Denise", description:"Charming French female", language:"French", langCode:"fr", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["charming","elegant"], sampleText:"Bonjour! Je suis Denise. Laissez-moi vous lire quelque chose.", provider:"cloud", avatarColor:["#60a5fa","#2563eb"] },
  { id:"henri", name:"Henri", description:"Sophisticated French male", language:"French", langCode:"fr", gender:"male", style: "Documentary", accent: "", age: "Adult", quality: "HD", tags:["sophisticated","refined"], sampleText:"Bonjour, je suis Henri. Une voix sophistiquée pour vos textes.", provider:"cloud", avatarColor:["#a855f7","#7e22ce"] },
  // Spanish
  { id:"elvira", name:"Elvira", description:"Warm Spanish female", language:"Spanish", langCode:"es", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["warm","friendly"], sampleText:"¡Hola! Soy Elvira. Déjame leerte algo con mi voz cálida.", provider:"cloud", avatarColor:["#fde047","#eab308"] },
  { id:"alvaro", name:"Alvaro", description:"Friendly Spanish male", language:"Spanish", langCode:"es", gender:"male", style: "Education", accent: "", age: "Adult", quality: "HD", tags:["friendly","clear"], sampleText:"¡Hola! Soy Álvaro. Voz amigable y clara para tus textos.", provider:"cloud", avatarColor:["#22c55e","#16a34a"] },
  // German
  { id:"katja", name:"Katja", description:"Clear German female", language:"German", langCode:"de", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["clear","precise"], sampleText:"Hallo! Ich bin Katja. Klares Deutsch für Ihre Texte.", provider:"cloud", avatarColor:["#60a5fa","#2563eb"] },
  { id:"conrad", name:"Conrad", description:"Deep German male", language:"German", langCode:"de", gender:"male", style: "News", accent: "", age: "Adult", quality: "HD", tags:["deep","strong"], sampleText:"Hallo, ich bin Conrad. Tiefe, starke Stimme für Sie.", provider:"cloud", avatarColor:["#a855f7","#7e22ce"] },
  // Portuguese
  { id:"francisca", name:"Francisca", description:"Warm Brazilian female", language:"Portuguese", langCode:"pt", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["warm","brazilian"], sampleText:"Olá! Eu sou Francisca. Voz quente do Brasil para você.", provider:"cloud", avatarColor:["#fb923c","#ea580c"] },
  { id:"antonio", name:"Antonio", description:"Friendly Brazilian male", language:"Portuguese", langCode:"pt", gender:"male", style: "Documentary", accent: "", age: "Adult", quality: "HD", tags:["friendly","brazilian"], sampleText:"Olá! Sou António. Voz amigável brasileira para seus textos.", provider:"cloud", avatarColor:["#22c55e","#16a34a"] },
  // Italian
  { id:"elsa", name:"Elsa", description:"Elegant Italian female", language:"Italian", langCode:"it", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["elegant","expressive"], sampleText:"Ciao! Sono Elsa. Voce elegante e italiana per voi.", provider:"cloud", avatarColor:["#f472b6","#ec4899"] },
  { id:"diego", name:"Diego", description:"Warm Italian male", language:"Italian", langCode:"it", gender:"male", style: "Narration", accent: "", age: "Adult", quality: "HD", tags:["warm","friendly"], sampleText:"Ciao, sono Diego. Voce calda italiana a vostra disposizione.", provider:"cloud", avatarColor:["#3b82f6","#2563eb"] },
  // Russian
  { id:"svetlana", name:"Svetlana", description:"Elegant Russian female", language:"Russian", langCode:"ru", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["elegant","refined"], sampleText:"Привет! Я Светлана. Элегантный русский голос для вас.", provider:"cloud", avatarColor:["#60a5fa","#3b82f6"] },
  { id:"dmitry", name:"Dmitry", description:"Strong Russian male", language:"Russian", langCode:"ru", gender:"male", style: "News", accent: "", age: "Adult", quality: "HD", tags:["strong","deep"], sampleText:"Привет! Я Дмитрий. Сильный голос для ваших текстов.", provider:"cloud", avatarColor:["#64748b","#475569"] },
  // Arabic
  { id:"zariyah", name:"Zariyah", description:"Arabic female", language:"Arabic", langCode:"ar", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["clear","warm"], sampleText:"مرحبا! أنا زاريه. صوتك الجديد بالعربية.", provider:"cloud", avatarColor:["#10b981","#059669"] },
  { id:"hamed", name:"Hamed", description:"Arabic male", language:"Arabic", langCode:"ar", gender:"male", style: "News", accent: "", age: "Adult", quality: "HD", tags:["strong","clear"], sampleText:"مرحبا! أنا حامد. صوت قوي وواضح لنصوصك.", provider:"cloud", avatarColor:["#d97706","#b45309"] },
  // Turkish
  { id:"emel", name:"Emel", description:"Turkish female", language:"Turkish", langCode:"tr", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["warm","friendly"], sampleText:"Merhaba! Ben Emel. Sıcak bir sesle Türkçe okuyayım.", provider:"cloud", avatarColor:["#ef4444","#dc2626"] },
  { id:"ahmet", name:"Ahmet", description:"Turkish male", language:"Turkish", langCode:"tr", gender:"male", style: "Education", accent: "", age: "Adult", quality: "HD", tags:["calm","steady"], sampleText:"Merhaba! Ben Ahmet. Sakin ve güçlü bir ses.", provider:"cloud", avatarColor:["#78716c","#57534e"] },
  // Thai
  { id:"premw", name:"Prem", description:"Thai female", language:"Thai", langCode:"th", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["gentle","sweet"], sampleText:"สวัสดี! ฉันเป็นเสียงใหม่ของคุณ", provider:"cloud", avatarColor:["#a78bfa","#7c3aed"] },
  { id:"somsak", name:"Somsak", description:"Thai male", language:"Thai", langCode:"th", gender:"male", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["warm","friendly"], sampleText:"สวัสดี! ผมสมศักดิ์ เสียงไทยที่อบอุ่น", provider:"cloud", avatarColor:["#f97316","#ea580c"] },
  // Vietnamese
  { id:"hoai", name:"Hoa", description:"Vietnamese female", language:"Vietnamese", langCode:"vi", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["gentle","sweet"], sampleText:"Xin chào! Tôi là giọng nói mới của bạn.", provider:"cloud", avatarColor:["#f472b6","#ec4899"] },
  { id:"tuan", name:"Tuan", description:"Vietnamese male", language:"Vietnamese", langCode:"vi", gender:"male", style: "Documentary", accent: "", age: "Adult", quality: "HD", tags:["gentle","warm"], sampleText:"Xin chào! Tôi là Tuấn, giọng nói nam ấm áp.", provider:"cloud", avatarColor:["#3b82f6","#2563eb"] },
  // Polish
  { id:"agnieszka", name:"Agnieszka", description:"Polish female", language:"Polish", langCode:"pl", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["clear","bright"], sampleText:"Cześć! Jestem Agnieszka. Czysty głos polski.", provider:"cloud", avatarColor:["#ef4444","#dc2626"] },
  { id:"marek", name:"Marek", description:"Polish male", language:"Polish", langCode:"pl", gender:"male", style: "Documentary", accent: "", age: "Adult", quality: "HD", tags:["strong","clear"], sampleText:"Cześć! Jestem Marek. Mocny głos dla twoich tekstów.", provider:"cloud", avatarColor:["#3b82f6","#2563eb"] },
  // Dutch
  { id:"colette", name:"Colette", description:"Dutch female", language:"Dutch", langCode:"nl", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["clear","warm"], sampleText:"Hallo! Ik ben Colette. Heldere Nederlandse stem.", provider:"cloud", avatarColor:["#f97316","#ea580c"] },
  { id:"daan", name:"Daan", description:"Dutch male", language:"Dutch", langCode:"nl", gender:"male", style: "Documentary", accent: "", age: "Adult", quality: "HD", tags:["friendly","clear"], sampleText:"Hallo! Ik ben Daan. Vriendelijke Nederlandse stem.", provider:"cloud", avatarColor:["#f97316","#ea580c"] },
  // Swedish
  { id:"sofie", name:"Sofie", description:"Swedish female", language:"Swedish", langCode:"sv", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["clear","bright"], sampleText:"Hej! Jag är Sofie. Klar svensk röst.", provider:"cloud", avatarColor:["#fbbf24","#f59e0b"] },
  { id:"erik_sv", name:"Erik", description:"Swedish male", language:"Swedish", langCode:"sv", gender:"male", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["calm","steady"], sampleText:"Hej! Jag är Erik. Lugn svensk röst.", provider:"cloud", avatarColor:["#3b82f6","#2563eb"] },
  // Finnish
  { id:"mikko", name:"Mikko", description:"Finnish male", language:"Finnish", langCode:"fi", gender:"male", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["warm","deep"], sampleText:"Hei! Olen Mikko. Lämmin suomalainen ääni.", provider:"cloud", avatarColor:["#3b82f6","#2563eb"] },
  { id:"aino", name:"Aino", description:"Finnish female", language:"Finnish", langCode:"fi", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["soft","gentle"], sampleText:"Hei! Olen Aino. Pehmeä suomalainen ääni.", provider:"cloud", avatarColor:["#f472b6","#ec4899"] },
  // Norwegian
  { id:"erling", name:"Erling", description:"Norwegian male", language:"Norwegian", langCode:"nb", gender:"male", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["deep","calm"], sampleText:"Hei! Jeg er Erling. Dyp norsk stemme.", provider:"cloud", avatarColor:["#6366f1","#4f46e5"] },
  { id:"inger", name:"Inger", description:"Norwegian female", language:"Norwegian", langCode:"nb", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["gentle","clear"], sampleText:"Hei! Jeg er Inger. Myk norsk stemme.", provider:"cloud", avatarColor:["#f472b6","#ec4899"] },
  // Danish
  { id:"lars", name:"Lars", description:"Danish male", language:"Danish", langCode:"da", gender:"male", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["friendly","warm"], sampleText:"Hej! Jeg er Lars. Venlig dansk stemme.", provider:"cloud", avatarColor:["#3b82f6","#2563eb"] },
  { id:"freja", name:"Freja", description:"Danish female", language:"Danish", langCode:"da", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["bright","clear"], sampleText:"Hej! Jeg er Freja. Klar dansk stemme.", provider:"cloud", avatarColor:["#f472b6","#ec4899"] },
  // Hungarian
  { id:"zoltan", name:"Zoltan", description:"Hungarian male", language:"Hungarian", langCode:"hu", gender:"male", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["strong","deep"], sampleText:"Szia! Zoltán vagyok. Erős magyar hang.", provider:"cloud", avatarColor:["#6366f1","#4f46e5"] },
  { id:"eva", name:"Eva", description:"Hungarian female", language:"Hungarian", langCode:"hu", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["warm","gentle"], sampleText:"Szia! Éva vagyok. Meleg magyar hang.", provider:"cloud", avatarColor:["#f472b6","#ec4899"] },
  // Romanian
  { id:"radu", name:"Radu", description:"Romanian male", language:"Romanian", langCode:"ro", gender:"male", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["friendly","clear"], sampleText:"Bună! Sunt Radu. Voce românească prietenoasă.", provider:"cloud", avatarColor:["#3b82f6","#2563eb"] },
  { id:"alina", name:"Alina", description:"Romanian female", language:"Romanian", langCode:"ro", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["elegant","clear"], sampleText:"Bună! Sunt Alina. Voce românească elegantă.", provider:"cloud", avatarColor:["#f472b6","#ec4899"] },
  // Ukrainian
  { id:"taras", name:"Taras", description:"Ukrainian male", language:"Ukrainian", langCode:"uk", gender:"male", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["deep","strong"], sampleText:"Привіт! Я Тарас. Глибокий український голос.", provider:"cloud", avatarColor:["#3b82f6","#2563eb"] },
  { id:"polina", name:"Polina", description:"Ukrainian female", language:"Ukrainian", langCode:"uk", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["sweet","gentle"], sampleText:"Привіт! Я Поліна. Солодкий український голос.", provider:"cloud", avatarColor:["#f472b6","#ec4899"] },
  // Malay
  { id:"yusof", name:"Yusof", description:"Malay male", language:"Malay", langCode:"ms", gender:"male", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["calm","clear"], sampleText:"Halo! Saya Yusof. Suara Melayu yang jelas.", provider:"cloud", avatarColor:["#10b981","#059669"] },
  { id:"nurul", name:"Nurul", description:"Malay female", language:"Malay", langCode:"ms", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["gentle","sweet"], sampleText:"Halo! Saya Nurul. Suara Melayu yang lembut.", provider:"cloud", avatarColor:["#f472b6","#ec4899"] },
  // Filipino
  { id:"rafael", name:"Rafael", description:"Filipino male", language:"Filipino", langCode:"tl", gender:"male", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["warm","friendly"], sampleText:"Kamusta! Ako si Rafael. Mainit na boses Pilipino.", provider:"cloud", avatarColor:["#f97316","#ea580c"] },
  { id:"maria", name:"Maria", description:"Filipino female", language:"Filipino", langCode:"tl", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["bright","clear"], sampleText:"Kamusta! Ako si Maria. Maliwanag na boses Pilipino.", provider:"cloud", avatarColor:["#f472b6","#ec4899"] },
  // Greek
  { id:"athina", name:"Athina", description:"Greek female", language:"Greek", langCode:"el", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["elegant","clear"], sampleText:"Γεια σας! Είμαι η Αθηνά. Ξεκάθαρη ελληνική φωνή.", provider:"cloud", avatarColor:["#60a5fa","#3b82f6"] },
  { id:"nikos", name:"Nikos", description:"Greek male", language:"Greek", langCode:"el", gender:"male", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["deep","strong"], sampleText:"Γεια σας! Είμαι ο Νίκος. Δυνατή ελληνική φωνή.", provider:"cloud", avatarColor:["#6366f1","#4f46e5"] },
  // Indonesian
  { id:"gadis", name:"Gadis", description:"Indonesian female", language:"Indonesian", langCode:"id", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["sweet","gentle"], sampleText:"Halo! Aku Gadis. Suara Indonesia yang manis.", provider:"cloud", avatarColor:["#ec4899","#db2777"] },
  { id:"budi", name:"Budi", description:"Indonesian male", language:"Indonesian", langCode:"id", gender:"male", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["friendly","clear"], sampleText:"Halo! Aku Budi. Suara Indonesia yang jelas.", provider:"cloud", avatarColor:["#10b981","#059669"] },
  // Czech
  { id:"eliska", name:"Eliska", description:"Czech female", language:"Czech", langCode:"cs", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["clear","bright"], sampleText:"Ahoj! Jsem Eliška. Český hlas.", provider:"cloud", avatarColor:["#a78bfa","#7c3aed"] },
  { id:"ondrej", name:"Ondrej", description:"Czech male", language:"Czech", langCode:"cs", gender:"male", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["strong","clear"], sampleText:"Ahoj! Jsem Ondřej. Silný český hlas.", provider:"cloud", avatarColor:["#8b5cf6","#7c3aed"] },
  // Hindi
  { id:"swara", name:"Swara", description:"Indian Hindi female", language:"Hindi", langCode:"hi", gender:"female", style: "Conversational", accent: "", age: "Adult", quality: "HD", tags:["sweet","clear"], sampleText:"नमस्ते! मैं स्वरा हूँ। मीठी हिंदी आवाज़।", provider:"cloud", avatarColor:["#f43f5e","#e11d48"] },
  { id:"madhur", name:"Madhur", description:"Indian Hindi male", language:"Hindi", langCode:"hi", gender:"male", style: "Documentary", accent: "", age: "Adult", quality: "HD", tags:["warm","clear"], sampleText:"नमस्ते! मैं मधुर हूँ। गर्म हिंदी आवाज़।", provider:"cloud", avatarColor:["#d97706","#b45309"] },
];
