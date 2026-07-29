/* ============================================
   iknbite  |  AI Script Chatbot
   Architecture: Fable 5-Inspired System Prompts
   ============================================
   Each template uses structured sections:
     ## identity        — Role definition
     ## behavior        — How to act
     ## output_rules    — Do/Don't formatting rules
     ## thinking_pattern— Step-by-step reasoning approach
     ## voice_optimization — TTS-specific delivery rules
   Uses Hugging Face Inference API (free, no key).
   Fallback: structured local generation with hash-based variety.
*/

function hashCode(str) {
  var hash = 0, i, chr;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash);
}

const ChatBot = {
  messages: JSON.parse(localStorage.getItem('iknbite_chat') || '[]'),
  isGenerating: false,
  selectedTemplate: 'narration',

  TEMPLATES: {
    narration: {
      label: '🎙️ Narration',
      icon: '🎙️',
      desc: 'Documentary / audiobook style',
      system: '## identity\nYou are a professional documentary narration script writer. You write scripts that sound natural when read aloud. Your specialty is clear, rhythmic prose that guides listeners through a topic with authority and warmth.\n\n## behavior\n- Write with calm authority — you are informing, not selling.\n- Vary sentence length: short for impact, longer for flow.\n- Use rhetorical questions sparingly but effectively.\n- Avoid jargon unless you define it naturally in context.\n\n## output_rules\n- DO use "..." for natural pauses (150-300ms).\n- DO use ALL CAPS for words that need vocal emphasis.\n- DO use [SOUND] or [MUSIC] cues only when contextually needed.\n- DO NOT write meta-commentary like "I hope you enjoyed."\n- DO NOT use lists, tables, or markdown formatting.\n- DO NOT write stage directions for the narrator.\n- KEEP paragraphs short — 2-4 sentences max for breathability.\n\n## thinking_pattern\n1. First, identify the core topic and the emotional tone (curious, reverent, urgent, calm).\n2. Open with a hook — a question, a surprising fact, or a sensory detail.\n3. Build the body chronologically or thematically — one idea per paragraph.\n4. Close with resonance: a thought that lingers.\n5. Read aloud mentally. If any sentence feels clunky, rephrase.\n\n## voice_optimization\n- Target speech rate: 140-160 words per minute.\n- Avoid stacked sibilants ("six sleek seals").\n- Prefer short, common words over academic alternatives.\n- Script should run 30-90 seconds when spoken (75-225 words).',
      rules: { minWords: 30, maxWords: 500 },
      fallback: {
        thinking: function(msg) { var topic = msg.replace(/^(write|generate|create|make)\s+(a\s+)?(narration|script)\s+(about|for|on)\s*/i, '') || msg.trim(); if (!topic) topic = 'this fascinating subject'; return topic; },
        generate: function(topic) { var hooks = ['What if everything you thought you knew about ' + topic + ' was about to change?','Let me take you on a journey through ' + topic + '... a story that spans generations.','Close your eyes for a moment. Imagine ' + topic + ' as it really is.','There are things about ' + topic + ' that few people ever get to hear.']; var bodies = ['The origins of ' + topic + ' are as surprising as they are revealing. What began as a simple idea has grown into something far greater than its creators could have imagined. To understand it fully, we must first step back and look at the bigger picture.','At its heart, ' + topic + ' represents a convergence of vision, persistence, and innovation. Each chapter of its story builds on the last, creating a tapestry that continues to evolve. Those who have followed its journey know that the best is yet to come.','Consider this: every aspect of ' + topic + ' has been shaped by the people who believed in its potential. From the earliest pioneers to the modern innovators, each has left their mark. And today, we stand at a pivotal moment.']; var closings = ['And that is the story of ' + topic + '. A reminder that the most important journeys often begin with a single step.','So what comes next for ' + topic + '? Only time will tell. But one thing is certain: the journey is far from over.','As we look to the future, ' + topic + ' continues to inspire and challenge us. And perhaps that is its greatest gift.']; var h = hooks[Math.abs(hashCode(topic)) % hooks.length]; var b = bodies[Math.abs(hashCode(topic) + 1) % bodies.length]; var c = closings[Math.abs(hashCode(topic) + 2) % closings.length]; return h + '\n\n' + b + '\n\n' + c; }
      },
    },
    story: {
      label: '📖 Story',
      icon: '📖',
      desc: 'Creative fiction / storytelling',
      system: '## identity\nYou are a creative fiction writer who specializes in short-form storytelling optimized for voice performance. Your stories are vivid, emotional, and feel alive when spoken.\n\n## behavior\n- Open in medias res (in the middle of action) whenever possible.\n- Use sensory details: sounds, sights, textures, smells.\n- Dialogue should feel real — use contractions, fragments, interruptions.\n- One strong emotion per scene.\n\n## output_rules\n- DO use "..." for dramatic pauses and suspense.\n- DO use ALL CAPS for shouted words or intense moments.\n- DO use character names sparingly — "he", "she" flows better aloud.\n- DO NOT write meta-commentary.\n- DO NOT use parenthetical narration directions.\n- KEEP sentences varied — mix short punchy lines with flowing description.\n- OPTIMAL length: 150-300 words (60-90 seconds spoken).\n\n## thinking_pattern\n1. Choose a POV (first person for intimacy, third limited for versatility).\n2. Identify the emotional arc: wonder → discovery → transformation.\n3. Hook with action or mystery in the first sentence.\n4. Build tension through short, accelerating sentences.\n5. Resolve with emotional resonance, not just plot completion.\n6. Read aloud. If the rhythm feels off, rewrite.\n\n## voice_optimization\n- Avoid tongue twisters and sibilant-heavy phrases.\n- Use onomatopoeia sparingly — let the narrator\'s voice carry sound.\n- Dialogue tags should be simple: "said" works. Skip adverbs.',
      rules: { minWords: 30, maxWords: 500 },
      fallback: {
        thinking: function(msg) { var topic = msg.replace(/^(write|generate|create|make)\s+(a\s+)?(story|tale|fiction)\s+(about|for|on)\s*/i, '') || msg.trim(); if (!topic) topic = 'adventure'; return topic; },
        generate: function(topic) { var chars = ['Sarah','Marcus','Elena','James','Aisha','Leo']; var settings = ['a small coastal town','a bustling city at dusk','an abandoned lighthouse','a hidden garden','a rainy street corner','an old bookstore']; var conflicts = ['a mysterious letter','an unexpected visitor','a long-buried secret','a chance encounter','a difficult choice']; var c = chars[Math.abs(hashCode(topic)) % chars.length]; var s = settings[Math.abs(hashCode(topic) + 1) % settings.length]; var cf = conflicts[Math.abs(hashCode(topic) + 2) % conflicts.length]; return 'The ' + cf + ' arrived without warning. ' + c + ' almost missed it.\n\nBut deep down, she knew something had changed. She was standing in ' + s + ', watching the world move around her.\n\n\"This changes everything,\" she whispered.\n\nWhat she found would lead her down a path she never expected. A path that would test everything she believed about herself.\n\nAnd it all started with ' + cf + '.\n\nTo be continued...'; }
      },
    },
    podcast: {
      label: '🎧 Podcast',
      icon: '🎧',
      desc: 'Conversational podcast script',
      system: '## identity\nYou are a podcast script writer. You write conversation scripts that sound natural, engaging, and spontaneous.\n\n## behavior\n- Write as if speaking to one curious friend, not a lecture hall.\n- Use verbal fillers like "you know", "here\'s the thing" sparingly.\n- Each segment should feel like a mini-story with a clear point.\n\n## output_rules\n- DO use "[HOST]" and "[GUEST]" as speaker labels.\n- DO use "[INTRO MUSIC]", "[TRANSITION]", "[OUTRO MUSIC]" cues.\n- DO keep each speaker turn to 3-5 sentences max.\n- DO NOT write narrator descriptions or scene directions.\n- AVOID inside jokes or references the listener won\'t get.\n\n## thinking_pattern\n1. Define the core topic and why a listener should care.\n2. Structure: cold open (hook) → intro → discussion → key insight → outro.\n3. Write dialogue that has back-and-forth energy, not Q&A.\n4. End each segment with a "curiosity gap".\n5. Outro should include a takeaway and a call to action.\n\n## voice_optimization\n- Target 150-180 words per minute (conversational pace).\n- Use contractions heavily.\n- Include reaction words: \"Right?\", \"Exactly!\", \"Wait — really?\"',
      rules: { minWords: 30, maxWords: 500 },
      fallback: {
        thinking: function(msg) { var topic = msg.replace(/^(write|generate|create|make)\s+(a\s+)?(podcast|episode|show)\s+(about|for|on)\s*/i, '') || msg.trim(); if (!topic) topic = 'something fascinating'; return topic; },
        generate: function(topic) { return '[INTRO MUSIC]\n\n[HOST] Hey everyone, welcome back to the show! Today we are diving into ' + topic + ' \u2014 and honestly? It is going to blow your mind.\n\n[HOST] Quick reminder: hit that subscribe button. You won\'t want to miss what is coming next.\n\n[HOST] It started as a simple question: \"What if we could do this differently?\" And that question changed everything.\n\n[TRANSITION]\n\n[HOST] Here is the thing most people do not realize about ' + topic + '... it is not about the technology. It is about the people.\n\n[HOST] So what does this mean for you? Three things. First, stay curious. Second, question everything. Third, share what you learn.\n\n[OUTRO MUSIC]\n\n[HOST] That is all for today! Share this with a friend. I will catch you next time.'; }
      },
    },
    ad: {
      label: '📢 Advertisement',
      icon: '📢',
      desc: 'Marketing / promo script',
      system: '## identity\nYou are a high-conversion advertising copywriter. You write scripts that sell without feeling like a sales pitch.\n\n## behavior\n- Hook in the first 3 seconds. The listener decides then.\n- Feature → Benefit → Emotion: always lead with what the user gains.\n- Use social proof ("Thousands already use...").\n- Create urgency without desperation.\n\n## output_rules\n- DO keep under 30 seconds for short ads (60-80 words).\n- DO use ALL CAPS for the key benefit or call-to-action.\n- DO use "..." for dramatic pauses before the reveal.\n- DO NOT make claims you could not prove.\n- DO NOT sell features — sell outcomes.\n\n## thinking_pattern\n1. Identify the core pain point the product solves.\n2. Open with the pain (relatable, immediate).\n3. Present the product as the natural solution.\n4. Show a glimpse of the transformed life.\n5. Clear, single CTA. One thing you want them to do.\n\n## voice_optimization\n- Target 160-180 WPM for energetic ads; 130-150 for luxury/premium.\n- Use rhythmic repetition for memorable hooks.\n- End with the brand name + CTA.',
      rules: { minWords: 30, maxWords: 500 },
      fallback: {
        thinking: function(msg) { var product = msg.replace(/^(write|generate|create|make)\s+(a\s+)?(ad|advertisement|promo|commercial)\s+(for|about)\s*/i, '') || msg.trim(); if (!product) product = 'your next big opportunity'; return product; },
        generate: function(product) { var hooks = ['Are you still settling for ordinary?', 'Everyone deserves ' + product + '. Here is why.', 'Stop doing things the hard way.']; var h = hooks[Math.abs(hashCode(product)) % hooks.length]; return h + '\n\nIntroducing ' + product + '.\n\nIt is the solution you have been waiting for. The one that actually DELIVERS.\n\nNo complicated setups. No hidden fees. Just results, from day one.\n\nJoin the thousands who have already made the switch.\n\nGet started today. ' + product + ' \u2014 the moment is now.'; }
      },
    },
    news: {
      label: '📰 News',
      icon: '📰',
      desc: 'News broadcast script',
      system: '## identity\nYou are a professional broadcast news writer. You write scripts for TV and radio news anchors. Your tone is authoritative, clear, and trustworthy.\n\n## behavior\n- Lead with the most important fact.\n- Keep sentences short and declarative.\n- Attribute claims to sources: "Officials say...", "According to...".\n- Remain neutral. Present facts. Let the listener decide.\n\n## output_rules\n- DO start with "Good [morning/afternoon/evening]." + headline.\n- DO use "[ANCHOR]" or "[REPORTER]" labels.\n- DO use "[TRANSITION]" between stories.\n- DO write for the ear — numbers should be rounded.\n- DO NOT express opinion or editorialize.\n- KEEP each story to 45-90 seconds.\n\n## thinking_pattern\n1. Identify the top story and its newsworthiness.\n2. Write the lead: one sentence that summarizes the entire story.\n3. Expand with critical context.\n4. End with forward-looking statement.\n5. Move to next story with smooth transition.\n\n## voice_optimization\n- Target 165-175 WPM (standard broadcast pace).\n- Write out abbreviations: "F-B-I" not "FBI" for radio delivery.\n- Avoid possessive names before titles.',
      rules: { minWords: 30, maxWords: 500 },
      fallback: {
        thinking: function(msg) { var topic = msg.replace(/^(write|generate|create|make)\s+(a\s+)?(news|report|broadcast)\s+(about|on)\s*/i, '') || msg.trim(); if (!topic) topic = 'today\'s top stories'; return topic; },
        generate: function(topic) { return 'Good evening. I am your anchor, and this is your nightly briefing.\n\nOur top story tonight: ' + topic + '.\n\nOfficials confirmed today that significant developments have emerged. Sources describe this as a pivotal moment.\n\n"We are monitoring closely and will provide updates as they become available," a spokesperson said.\n\nThe full impact remains unclear, but experts say the implications could be far-reaching.\n\n[TRANSITION]\n\nIn other news tonight, authorities are urging caution as conditions are expected to change over the next 48 hours.\n\n[TRANSITION]\n\nAnd in a story capturing attention worldwide... an unexpected development that has experts rethinking long-held assumptions.\n\nThat is our report. Stay informed, and we will see you tomorrow.'; }
      },
    },
    educational: {
      label: '🎓 Educational',
      icon: '🎓',
      desc: 'Tutorial / explainer script',
      system: '## identity\nYou are an expert educational content creator. You make complex topics simple, memorable, and engaging.\n\n## behavior\n- Start from what the learner already knows.\n- One concept per paragraph.\n- Use analogies and metaphors abundantly.\n- Active voice always.\n\n## output_rules\n- DO structure: Problem → Concept → Example → Practice → Review.\n- DO use step markers: "First...", "Next...", "Finally...".\n- DO NOT assume prior knowledge.\n- KEEP each step under 60 seconds when read aloud.\n\n## thinking_pattern\n1. Identify the ONE thing the learner will be able to do after this lesson.\n2. Choose an anchor analogy.\n3. Sequence: core principle → how it works → why it matters → example.\n4. Anticipate confusion points and address them preemptively.\n5. End with a single-sentence summary.\n\n## voice_optimization\n- Target 140-160 WPM (teaching pace).\n- Pause after key definitions (use "...").\n- Repeat the core concept at least 3 times in different ways.',
      rules: { minWords: 30, maxWords: 500 },
      fallback: {
        thinking: function(msg) { var topic = msg.replace(/^(write|generate|create|make)\s+(a\s+)?(tutorial|lesson|guide|explainer)\s+(about|on|for)\s*/i, '') || msg.trim(); if (!topic) topic = 'this concept'; return topic; },
        generate: function(topic) { return 'Let us take a closer look at ' + topic + '.\n\nFirst, the big picture. What is ' + topic + ', really? At its simplest, it is a way of understanding something that most people get wrong.\n\nHere is an analogy. Imagine learning to cook. You can follow a recipe, but true skill comes from understanding why ingredients work together. Same with ' + topic + '.\n\nLet me break it down.\n\nStep one: Understand the foundation.\nStep two: Practice with simple examples.\nStep three: Add complexity gradually.\nStep four: Teach someone else. This is where real learning happens.\n\nSo here is your takeaway: ' + topic + ' is not as hard as it seems. Start small. Be consistent. And do not be afraid to get it wrong at first.\n\nNow, can you explain it to someone else? That is the real test.'; }
      },
    },
    social: {
      label: '📱 Social Media',
      icon: '📱',
      desc: 'Short-form video script',
      system: '## identity\nYou are a viral social media scriptwriter. You write scripts for TikTok, Instagram Reels, and YouTube Shorts.\n\n## behavior\n- The hook is everything. First 3 seconds must stop the scroll.\n- 15-60 seconds total. No fluff.\n- Use pattern interrupts.\n- End with a loop point or save incentive.\n\n## output_rules\n- DO start with a scroll-stopping hook in ALL CAPS.\n- DO use [VISUAL] cues for text overlay or scene changes.\n- DO use line breaks for pacing (one idea per line).\n- KEEP under 60 words for 15-second videos.\n- DO NOT introduce more than one idea per video.\n- DO include a clear CTA in the last 3 seconds.\n\n## thinking_pattern\n1. Identify the ONE takeaway.\n2. Write the hook first.\n3. Structure: Hook → Tension → Value → CTA.\n4. Read it at double speed. If it feels slow, cut words.\n\n## voice_optimization\n- Target 180-220 WPM (fast, energetic).\n- Staccato delivery: short words, sharp stops.\n- Repeat key phrases twice for memorability.',
      rules: { minWords: 30, maxWords: 500 },
      fallback: {
        thinking: function(msg) { var topic = msg.replace(/^(write|generate|create|make)\s+(a\s+)?(video|reel|tiktok|short)\s+(about|for)\s*/i, '') || msg.trim(); if (!topic) topic = 'this one trick'; return topic; },
        generate: function(topic) { var hooks = ['STOP scrolling. You need to hear this.','This one thing about ' + topic + ' changes EVERYTHING.','I bet you didn\'t know this about ' + topic + '.']; var h = hooks[Math.abs(hashCode(topic)) % hooks.length]; return h + '\n\nHere is the truth nobody tells you.\n\nMost people get ' + topic + ' completely wrong. They overthink it.\n\nThe secret? It is simpler than you think.\n\n[VISUAL: demonstration]\n\nStep one: Start.\nStep two: Stay consistent.\nStep three: Repeat.\n\nThat is it. No magic. Just work.\n\nDrop a \u2665 if this helped. Save for later. Follow for more.'; }
      },
    },
    meditation: {
      label: '🧘 Meditation',
      icon: '🧘',
      desc: 'Guided meditation / relaxation',
      system: '## identity\nYou are a compassionate meditation and mindfulness guide. Your voice creates a safe, calm space.\n\n## behavior\n- Every sentence is an invitation, never a command.\n- Allow silence. The pauses ARE the content.\n- Use present tense throughout.\n- Never rush. If it feels fast, slow down.\n\n## output_rules\n- DO use "..." generously — 1-2 seconds of silence between sentences.\n- DO use longer "......" for transitions (3-4 seconds).\n- DO start with breath awareness.\n- DO NOT introduce sudden sounds or startling imagery.\n- KEEP the entire session under 5 minutes (500-700 words).\n\n## thinking_pattern\n1. Begin with arrival: help the listener arrive in their body.\n2. Guide the breath: 3-4 rounds of gentle breathing instruction.\n3. Body scan or visualization: one area at a time.\n4. Rest in stillness: allow 30-60 seconds of guided silence.\n5. Gently return: bring awareness back to the room.\n6. Close with gratitude.\n\n## voice_optimization\n- Target 80-100 WPM (half the normal speaking rate).\n- Use soft consonants and open vowels.\n- Repetition is calming.\n- End with a soft closing word.',
      rules: { minWords: 30, maxWords: 500 },
      fallback: {
        thinking: function(msg) { return 'meditation'; },
        generate: function(topic) { return 'Find a comfortable position. Either sitting upright with a straight spine, or lying down if that feels better.\n\nAllow your hands to rest gently.\n\nClose your eyes when you are ready...\n\n......\n\nBring your attention to your breath. Do not change it. Just notice it.\n\nThe air flowing in... and out...\n\nIn... and out...\n\nWith each exhale, feel your body soften a little more.\n\n......\n\nNow bring awareness to the top of your head.\n\nSlowly let that awareness travel down... your forehead... your jaw... letting go of tension...\n\nYour shoulders... your arms... your hands.\n\nYour chest rising and falling...\n\nYour belly... soft and at ease...\n\nDown through your legs... your feet.\n\nYou are fully here. There is nowhere else to be.\n\n......\n\nSlowly bring your awareness back. Feel the surface beneath you.\n\nWhen you are ready, gently open your eyes.\n\nCarry this peace with you. It is always just a breath away.\n\nNamaste.'; }
      },
    },
  },

  API_PROVIDERS: [
    {
      name: 'HuggingFace-Mistral',
      url: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3',
      buildBody: (messages) => ({
        inputs: messages.map(m =>
          m.role === 'system' ? `<s>[INST] ${m.content} [/INST]` :
          m.role === 'user' ? `[INST] ${m.content} [/INST]` :
          `${m.content}</s>`
        ).join(''),
        parameters: { max_new_tokens: 800, temperature: 0.7, top_p: 0.9, return_full_text: false },
      }),
      extract: (data) => {
        if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text;
        if (data.generated_text) return data.generated_text;
        if (typeof data === 'string') return data;
        return null;
      },
    },
    {
      name: 'HuggingFace-Zephyr',
      url: 'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
      buildBody: (messages) => ({
        inputs: messages.map(m =>
          m.role === 'system' ? `<|system|>\n${m.content}</s>\n` :
          m.role === 'user' ? `<|user|>\n${m.content}</s>\n` :
          `<|assistant|>\n${m.content}</s>\n`
        ).join('') + '<|assistant|>\n',
        parameters: { max_new_tokens: 800, temperature: 0.7, return_full_text: false },
      }),
      extract: (data) => {
        if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text;
        if (data.generated_text) return data.generated_text;
        return null;
      },
    },
  ],

  async generateWithAPI(userMessage) {
    const template = this.TEMPLATES[this.selectedTemplate];
    const messages = [
      { role: 'system', content: template.system + '\n\n## output_constraint\nWrite ONLY the script content. No meta-commentary.' },
      { role: 'user', content: userMessage },
    ];
    for (const provider of this.API_PROVIDERS) {
      try {
        const response = await fetch(provider.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(provider.buildBody(messages)),
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) continue;
        const data = await response.json();
        const text = provider.extract(data);
        if (text && text.trim().length > 20) return text.trim();
      } catch (err) {
        console.warn('[ChatBot] provider failed:', err.message);
      }
    }
    return null;
  },

  generateLocally(userMessage) {
    const template = this.TEMPLATES[this.selectedTemplate];
    const topic = template.fallback.thinking(userMessage);
    return template.fallback.generate(topic);
  },

  _refineScript(script, template) {
    if (!script) return script;
    var refined = script;
    var metaPatterns = [
      /^(Here is|I hope|Let me|This is|Below is).*/gim,
      /(If you have any questions|Let me know if).*/gim,
      /^\s*(Sure|Okay|Alright|Certainly)[,!.]*/gim,
    ];
    for (var i = 0; i < metaPatterns.length; i++) {
      refined = refined.replace(metaPatterns[i], '');
    }
    return refined.trim();
  },

  async generate(userMessage) {
    this.isGenerating = true;
    this.messages.push({ role: 'user', content: userMessage, time: Date.now() });
    this._saveMessages();
    let script = await this.generateWithAPI(userMessage);
    let source = 'AI';
    if (!script) {
      script = this.generateLocally(userMessage);
      source = 'Local';
    }
    const template = this.TEMPLATES[this.selectedTemplate];
    script = this._refineScript(script, template);
    this.messages.push({
      role: 'assistant',
      content: script,
      source: source,
      template: this.selectedTemplate,
      time: Date.now(),
    });
    this._saveMessages();
    this.isGenerating = false;
    return { script, source };
  },

  sendToStudio(text) {
    UI.text = text;
    UI.nav('studio');
    UI.toast('\uD83D\uDCDD Script loaded in Studio \u2014 pick a voice and generate!', 'success');
  },

  clearChat() {
    this.messages = [];
    localStorage.removeItem('iknbite_chat');
  },

  _saveMessages() {
    const toSave = this.messages.slice(-50);
    localStorage.setItem('iknbite_chat', JSON.stringify(toSave));
  },
};
