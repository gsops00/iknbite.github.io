/* ============================================
   iknbite  |  AI Script Chatbot (Free/Open-Source)
   ============================================
   Uses Hugging Face Inference API (free, no key).
   Fallback: local template-based generator.
*/

const ChatBot = {
  // State
  messages: JSON.parse(localStorage.getItem('iknbite_chat') || '[]'),
  isGenerating: false,
  selectedTemplate: 'narration',

  // Script templates for local fallback
  TEMPLATES: {
    narration: {
      label: '🎙️ Narration',
      icon: '🎙️',
      desc: 'Documentary / audiobook style',
      system: 'You are a professional narration script writer. Write clear, engaging narration scripts optimized for text-to-speech. Use natural pauses with "..." and emphasis with CAPS for key words. Keep sentences short and rhythmic.',
    },
    story: {
      label: '📖 Story',
      icon: '📖',
      desc: 'Creative fiction / storytelling',
      system: 'You are a creative story writer. Write engaging short stories with vivid descriptions, dialogue, and emotional depth. Use "..." for pauses and CAPS for emphasis. Make it suitable for voice narration.',
    },
    podcast: {
      label: '🎧 Podcast',
      icon: '🎧',
      desc: 'Conversational podcast script',
      system: 'You are a podcast script writer. Write conversational, engaging podcast scripts with host intros, segues, and natural speech patterns. Use "..." for pauses. Make it sound like a real conversation.',
    },
    ad: {
      label: '📢 Advertisement',
      icon: '📢',
      desc: 'Marketing / promo script',
      system: 'You are an advertising copywriter. Write punchy, persuasive ad scripts optimized for voice. Keep it under 30 seconds when read aloud. Use CAPS for emphasis and "..." for dramatic pauses.',
    },
    news: {
      label: '📰 News',
      icon: '📰',
      desc: 'News broadcast style',
      system: 'You are a news anchor script writer. Write clear, factual news scripts in broadcast style. Use formal language, short sentences, and "..." for natural pauses between segments.',
    },
    educational: {
      label: '🎓 Educational',
      icon: '🎓',
      desc: 'Tutorial / explainer script',
      system: 'You are an educational content writer. Write clear, step-by-step explainer scripts. Use simple language, examples, and "..." for pauses. Make complex topics easy to understand when spoken.',
    },
    social: {
      label: '📱 Social Media',
      icon: '📱',
      desc: 'Short-form video script',
      system: 'You are a social media script writer. Write short, punchy scripts for TikTok/Reels/Shorts. Hook in the first 3 seconds, keep it under 60 words, use casual language and "..." for pacing.',
    },
    meditation: {
      label: '🧘 Meditation',
      icon: '🧘',
      desc: 'Guided meditation / relaxation',
      system: 'You are a meditation guide script writer. Write calming, soothing guided meditation scripts. Use slow pacing with "..." for long pauses. Keep sentences gentle and present-tense.',
    },
  },

  // Free API providers (no key needed)
  API_PROVIDERS: [
    {
      name: 'HuggingFace',
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

  // Generate with free LLM API
  async generateWithAPI(userMessage) {
    const template = this.TEMPLATES[this.selectedTemplate];
    const messages = [
      { role: 'system', content: template.system + ' Write the script directly. Do not add any meta-commentary or explanations. Just the script itself.' },
      { role: 'user', content: userMessage },
    ];

    for (const provider of this.API_PROVIDERS) {
      try {
        console.log(`[ChatBot] Trying ${provider.name}...`);
        const response = await fetch(provider.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(provider.buildBody(messages)),
          signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
          console.warn(`[ChatBot] ${provider.name} returned ${response.status}`);
          continue;
        }

        const data = await response.json();
        const text = provider.extract(data);
        if (text && text.trim().length > 20) {
          console.log(`[ChatBot] Success with ${provider.name}`);
          return text.trim();
        }
      } catch (err) {
        console.warn(`[ChatBot] ${provider.name} failed:`, err.message);
      }
    }
    return null;
  },

  // Local template-based fallback (always works, no API needed)
  generateLocally(userMessage) {
    const t = this.selectedTemplate;
    const msg = userMessage.toLowerCase();

    // Smart local generation based on template type
    const generators = {
      narration: () => {
        const topics = msg.replace(/^(write|generate|create|make)\s+(a\s+)?(narration|script|story)\s+(about|for|on)\s*/i, '') || 'this topic';
        return `Welcome to this narration about ${topics}.\n\n` +
          `Let me take you on a journey through this fascinating subject...\n\n` +
          `First, let's understand what makes ${topics} so important. The key aspects are deeply rooted in history and innovation.\n\n` +
          `As we explore further, you'll discover that ${topics} has transformed the way we think about the world around us.\n\n` +
          `The story of ${topics} begins many years ago, when pioneers first dared to imagine something different...\n\n` +
          `And today, we continue to build on that legacy, pushing boundaries and creating new possibilities.\n\n` +
          `Thank you for joining me on this narration. I hope you found it insightful and engaging.`;
      },
      story: () => {
        const topic = msg.replace(/^(write|generate|create|make)\s+(a\s+)?(story|tale|fiction)\s+(about|for|on)\s*/i, '') || 'adventure';
        return `Chapter One: The Beginning\n\n` +
          `The morning light filtered through the curtains as Sarah opened her eyes. Today was the day everything would change.\n\n` +
          `"I can't believe it's finally here," she whispered to herself, reaching for her phone.\n\n` +
          `The message was simple but powerful: "It's time."\n\n` +
          `She had spent months preparing for this moment. The ${topic} had been her obsession, her dream, her purpose.\n\n` +
          `As she stepped outside, the world seemed different. Colors were brighter. Sounds were clearer. Every breath felt like a new beginning.\n\n` +
          `"Let's do this," she said, and walked toward her destiny.\n\n` +
          `To be continued...`;
      },
      podcast: () => {
        const topic = msg.replace(/^(write|generate|create|make)\s+(a\s+)?(podcast|episode|show)\s+(about|for|on)\s*/i, '') || 'technology';
        return `[INTRO MUSIC]\n\n` +
          `Host: Hey everyone, welcome back to another episode! I'm your host, and today we're diving deep into ${topic}.\n\n` +
          `Now, before we start, make sure to hit that subscribe button and leave us a review. It really helps the show!\n\n` +
          `So, ${topic}... where do we even begin? Well, let me start with a story.\n\n` +
          `Last week, I was having coffee with a friend, and they asked me: "What's the big deal about ${topic}?"\n\n` +
          `And honestly, I had to pause. Because the answer is... it's everything.\n\n` +
          `Let me break it down for you. First, the basics...\n\n` +
          `[TRANSITION SOUND]\n\n` +
          `Host: And that wraps up our deep dive into ${topic}. Thanks for listening, and I'll catch you in the next one!\n\n` +
          `[OUTRO MUSIC]`;
      },
      ad: () => {
        const product = msg.replace(/^(write|generate|create|make)\s+(a\s+)?(ad|advertisement|promo|commercial)\s+(for|about)\s*/i, '') || 'our product';
        return `[UPBEAT MUSIC]\n\n` +
          `Tired of settling for less? Introducing ${product}.\n\n` +
          `This changes EVERYTHING.\n\n` +
          `Imagine having the power to transform your daily routine... with just one click.\n\n` +
          `Our users are already seeing RESULTS. And you could be next.\n\n` +
          `Don't wait. Don't hesitate. This is YOUR moment.\n\n` +
          `Visit us today and get started. Because you deserve the BEST.\n\n` +
          `${product}. Game. Changed.\n\n` +
          `[MUSIC FADES]`;
      },
      news: () => {
        const topic = msg.replace(/^(write|generate|create|make)\s+(a\s+)?(news|report|broadcast)\s+(about|on)\s*/i, '') || 'today\'s events';
        return `[NEWS INTRO MUSIC]\n\n` +
          `Good evening. I'm your news anchor, and this is tonight's top story.\n\n` +
          `Breaking news tonight as developments emerge regarding ${topic}.\n\n` +
          `Sources confirm that significant progress has been made in recent hours. Officials are calling this a major milestone.\n\n` +
          `"This is a turning point," said one spokesperson earlier today.\n\n` +
          `The implications are far-reaching, affecting communities across the region.\n\n` +
          `We'll continue to follow this story as it develops. Stay tuned for updates.\n\n` +
          `[TRANSITION]\n\n` +
          `In other news tonight...`;
      },
      educational: () => {
        const topic = msg.replace(/^(write|generate|create|make)\s+(a\s+)?(tutorial|lesson|guide|explainer)\s+(about|on|for)\s*/i, '') || 'this concept';
        return `Welcome to today's lesson on ${topic}.\n\n` +
          `By the end of this tutorial, you'll have a clear understanding of the fundamentals.\n\n` +
          `Let's start with the basics. What exactly is ${topic}?\n\n` +
          `Simply put, ${topic} is a concept that has evolved over time. It started as a simple idea, and has grown into something much bigger.\n\n` +
          `Here's the key thing to remember...\n\n` +
          `Step one: Understand the foundation. Without this, nothing else makes sense.\n\n` +
          `Step two: Practice. Knowledge without application is just information.\n\n` +
          `Step three: Teach others. The best way to learn is to explain.\n\n` +
          `That's it for today's lesson on ${topic}. Practice what you've learned, and I'll see you in the next one.`;
      },
      social: () => {
        const topic = msg.replace(/^(write|generate|create|make)\s+(a\s+)?(video|reel|tiktok|short)\s+(about|for)\s*/i, '') || 'this';
        return `[HOOK - First 3 seconds]\n\n` +
          `Stop scrolling. You NEED to hear this.\n\n` +
          `[CONTENT]\n\n` +
          `Here's the thing about ${topic} that nobody tells you...\n\n` +
          `It's simpler than you think. And I'm going to prove it in the next 30 seconds.\n\n` +
          `Watch this.\n\n` +
          `[VALUE]\n\n` +
          `The secret is... consistency. Show up every day. Do the work. And the results WILL come.\n\n` +
          `[CTA]\n\n` +
          `Follow for more. Drop a 🔥 if this resonated.\n\n` +
          `Save this for later. You'll thank me.`;
      },
      meditation: () => {
        return `Welcome. Find a comfortable position and close your eyes.\n\n` +
          `Take a deep breath in... and slowly let it out.\n\n` +
          `Feel the weight of your body melting into the surface beneath you.\n\n` +
          `With each breath, you become more relaxed... more at peace.\n\n` +
          `Let go of any thoughts about the day. They can wait. This moment is yours.\n\n` +
          `Breathe in... peace.\n\n` +
          `Breathe out... tension.\n\n` +
          `Breathe in... calm.\n\n` +
          `Breathe out... worry.\n\n` +
          `You are safe. You are present. You are enough.\n\n` +
          `Stay here for as long as you need. There is no rush.\n\n` +
          `When you're ready, slowly open your eyes and carry this peace with you.\n\n` +
          `Namaste.`;
      },
    };

    const gen = generators[t] || generators.narration;
    return gen();
  },

  // Main generate function
  async generate(userMessage) {
    this.isGenerating = true;

    // Add user message
    this.messages.push({ role: 'user', content: userMessage, time: Date.now() });
    this._saveMessages();

    // Try API first, fallback to local
    let script = await this.generateWithAPI(userMessage);
    let source = 'AI';

    if (!script) {
      script = this.generateLocally(userMessage);
      source = 'Local';
      console.log('[ChatBot] Using local template generator');
    }

    // Add assistant message
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

  // Send script to Studio
  sendToStudio(text) {
    UI.text = text;
    UI.nav('studio');
    UI.toast('📝 Script loaded in Studio — pick a voice and generate!', 'success');
  },

  // Clear chat
  clearChat() {
    this.messages = [];
    localStorage.removeItem('iknbite_chat');
  },

  _saveMessages() {
    // Keep last 50 messages
    const toSave = this.messages.slice(-50);
    localStorage.setItem('iknbite_chat', JSON.stringify(toSave));
  },
};
