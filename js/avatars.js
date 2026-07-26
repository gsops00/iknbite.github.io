/* ============================================
   iknbite  |  Character Avatar Generator
   Creates unique CSS character faces per voice
   ============================================ */

const AVATAR_STYLES = {
  // Skin tones
  skin: {
    light:  '#FDBCB4', warmLight: '#F5C5A3', medium: '#D2956A',
    tan:    '#C68642', brown: '#8D5524', dark: '#6B3E26', deep: '#4A2C17',
  },
  // Hair colors
  hair: {
    blonde: '#E8C170', lightBrown: '#A0785A', brown: '#6B4226',
    darkBrown: '#3B2314', black: '#1A1110', red: '#B5451B',
    auburn: '#8B3A2F', ginger: '#C4613A', pink: '#E8789A',
    purple: '#7B4FA0', blue: '#4A7AB5', white: '#D8D8E0',
    silver: '#A8A8B8', gray: '#808090',
  },
  // Eye colors
  eyes: {
    brown: '#5C3A1E', hazel: '#8B7340', green: '#4A8B5C',
    blue: '#4A7AB5', gray: '#7A8A9A', dark: '#2C1810',
    amber: '#C48B30', violet: '#7B5EA7',
  },
};

function generateAvatar(voice) {
  const s = AVATAR_STYLES;
  const v = voice;

  // Deterministic pseudo-random from voice id
  let seed = 0;
  for (let i = 0; i < v.id.length; i++) seed = ((seed << 5) - seed + v.id.charCodeAt(i)) | 0;
  const rand = (min, max) => {
    seed = (seed * 16807 + 12345) & 0x7fffffff;
    return min + (seed % (max - min + 1));
  };

  const pick = arr => arr[rand(0, arr.length)];

  // ---- Determine appearance based on language/gender ----
  let skinTone, hairColor, eyeColor, hairStyle, hasAccessories;

  if (['zh','ja','ko'].includes(v.lang)) {
    skinTone = pick([s.skin.light, s.skin.warmLight]);
    hairColor = pick([s.hair.black, s.hair.darkBrown]);
    eyeColor = pick([s.eyes.dark, s.eyes.brown]);
    hairStyle = v.gender === 'f' ? 'long-straight' : 'short-messy';
  } else if (v.lang === 'hi') {
    skinTone = pick([s.skin.tan, s.skin.medium]);
    hairColor = pick([s.hair.darkBrown, s.hair.black]);
    eyeColor = pick([s.eyes.brown, s.eyes.dark, s.eyes.hazel]);
    hairStyle = v.gender === 'f' ? 'long-wavy' : 'short-neat';
  } else if (v.lang === 'ar') {
    skinTone = pick([s.skin.tan, s.skin.medium, s.skin.brown]);
    hairColor = pick([s.hair.darkBrown, s.hair.black]);
    eyeColor = pick([s.eyes.brown, s.eyes.dark, s.eyes.hazel]);
    hairStyle = v.gender === 'f' ? 'long-wavy' : 'short-neat';
  } else if (v.lang === 'ru') {
    skinTone = pick([s.skin.light, s.skin.warmLight]);
    hairColor = pick([s.hair.blonde, s.hair.lightBrown, s.hair.platinum]);
    eyeColor = pick([s.eyes.blue, s.eyes.green, s.eyes.gray]);
    hairStyle = v.gender === 'f' ? 'long-straight' : 'short-neat';
  } else if (v.lang === 'pt') {
    skinTone = pick([s.skin.medium, s.skin.tan, s.skin.brown]);
    hairColor = pick([s.hair.darkBrown, s.hair.black, s.hair.brown]);
    eyeColor = pick([s.eyes.brown, s.eyes.hazel, s.eyes.green]);
    hairStyle = v.gender === 'f' ? 'long-curly' : 'short-messy';
  } else {
    // Default: European/Latin/American mix
    skinTone = pick([s.skin.light, s.skin.warmLight, s.skin.medium]);
    hairColor = pick([s.hair.blonde, s.hair.lightBrown, s.hair.brown, s.hair.red]);
    eyeColor = pick([s.eyes.brown, s.hair.blue, s.eyes.green, s.eyes.hazel]);
    hairStyle = v.gender === 'f' ? pick(['long-straight','long-wavy','long-curly']) : pick(['short-messy','short-neat','short-pompadour']);
  }

  // Override with voice-specific hints
  if (v.name === 'Sonia' || v.name === 'Ryan') {
    hairColor = pick([s.hair.lightBrown, s.hair.brown]);
    skinTone = s.skin.light;
  }
  if (v.name === 'Nanami' || v.name === 'Mayu') {
    hairColor = pick([s.hair.black, s.hair.darkBrown]);
    skinTone = s.skin.light;
  }
  if (v.name === 'Natasha') {
    hairColor = s.hair.blonde;
  }
  if (v.name === 'Davis' || v.name === 'Andrew') {
    hairColor = pick([s.hair.darkBrown, s.hair.black]);
    skinTone = pick([s.skin.light, s.skin.warmLight]);
  }
  if (v.name === 'Elvira') {
    hairColor = s.hair.black;
    skinTone = pick([s.skin.warmLight, s.skin.medium]);
  }
  if (v.name === 'Alvaro') {
    hairColor = s.hair.darkBrown;
    skinTone = pick([s.skin.medium, s.skin.tan]);
  }
  if (v.name === 'Henri') {
    hairColor = pick([s.hair.lightBrown, s.hair.gray]);
  }

  // ---- Build SVG ----
  const w = 120, h = 120;
  const cx = w / 2, cy = h / 2 + 4;
  const headR = 36;

  // Hair colors darken/lighten helpers
  const darken = (hex, amt) => {
    const r = Math.max(0, parseInt(hex.slice(1,3),16) - amt);
    const g = Math.max(0, parseInt(hex.slice(3,5),16) - amt);
    const b = Math.max(0, parseInt(hex.slice(5,7),16) - amt);
    return `rgb(${r},${g},${b})`;
  };

  const skinShadow = darken(skinTone, 20);
  const hairDark = darken(hairColor, 30);

  // ---- Face Features ----
  // Eyes
  const eyeY = cy - 2;
  const eyeSpacing = 10;
  const eyeW = v.gender === 'f' ? 5.5 : 5;
  const eyeH = v.gender === 'f' ? 5 : 4.5;
  const irisR = eyeH * 0.65;

  // Eyebrows
  const browW = eyeW + 4;
  const browH = v.gender === 'f' ? 1.2 : 1.8;
  const browY = eyeY - eyeH - 2;

  // Nose
  const noseY = cy + 4;
  const noseW = v.gender === 'f' ? 2 : 3;

  // Mouth
  const mouthY = cy + 12;
  const mouthW = v.gender === 'f' ? 10 : 9;
  const lipColor = darken(skinTone, 15);

  // Cheek blush
  const blushColor = `rgba(230, 120, 120, ${v.gender === 'f' ? 0.25 : 0.15})`;

  // ---- Hair ----
  let hairSVG = '';
  if (v.gender === 'f') {
    if (hairStyle === 'long-straight') {
      hairSVG = `
        <path d="M${cx-headR-4} ${cy-10} Q${cx-headR-6} ${cy+20} ${cx-headR-2} ${cy+38} Q${cx} ${cy+42} ${cx+headR+2} ${cy+38} Q${cx+headR+6} ${cy+20} ${cx+headR+4} ${cy-10} Z" fill="${hairColor}" />
        <path d="M${cx-headR+2} ${cy-headR-2} Q${cx} ${cy-headR-12} ${cx+headR-2} ${cy-headR-2} Q${cx+headR+8} ${cy-10} ${cx+headR+4} ${cy+10} L${cx+headR-2} ${cy-8} Q${cx} ${cy-headR+2} ${cx-headR+2} ${cy-8} Z" fill="${hairColor}" />
      `;
    } else if (hairStyle === 'long-wavy') {
      hairSVG = `
        <path d="M${cx-headR-6} ${cy-8} Q${cx-headR-10} ${cy+12} ${cx-headR+2} ${cy+32} Q${cx-headR+8} ${cy+36} ${cx-headR+4} ${cy+40} Q${cx} ${cy+44} ${cx-headR-2} ${cy+36}" fill="${hairColor}" />
        <path d="M${cx+headR+6} ${cy-8} Q${cx+headR+10} ${cy+12} ${cx+headR-2} ${cy+32} Q${cx+headR-8} ${cy+36} ${cx+headR-4} ${cy+40} Q${cx} ${cy+44} ${cx+headR+2} ${cy+36}" fill="${hairColor}" />
        <path d="M${cx-headR+2} ${cy-headR-2} Q${cx} ${cy-headR-14} ${cx+headR-2} ${cy-headR-2} Q${cx+headR+10} ${cy-6} ${cx+headR+6} ${cy+8} Q${cx+headR+2} ${cy-4} ${cx} ${cy-headR+4} Q${cx-headR-2} ${cy-4} ${cx-headR-6} ${cy+8} Q${cx-headR-10} ${cy-6} ${cx-headR-2} ${cy-headR-2} Z" fill="${hairColor}" />
      `;
    } else { // long-curly
      hairSVG = `
        <ellipse cx="${cx-headR-2}" cy="${cy+10}" rx="10" ry="14" fill="${hairColor}" />
        <ellipse cx="${cx+headR+2}" cy="${cy+10}" rx="10" ry="14" fill="${hairColor}" />
        <ellipse cx="${cx-headR+4}" cy="${cy+24}" rx="8" ry="12" fill="${hairColor}" />
        <ellipse cx="${cx+headR-4}" cy="${cy+24}" rx="8" ry="12" fill="${hairColor}" />
        <ellipse cx="${cx}" cy="${cy-headR-4}" rx="${headR+6}" ry="18" fill="${hairColor}" />
        <path d="M${cx-headR+4} ${cy-headR+4} Q${cx} ${cy-headR-6} ${cx+headR-4} ${cy-headR+4}" fill="${hairColor}" />
      `;
    }
    // Bangs
    hairSVG += `
      <path d="M${cx-20} ${cy-headR+6} Q${cx-12} ${cy-headR-8} ${cx} ${cy-headR+2} Q${cx+8} ${cy-headR-6} ${cx+18} ${cy-headR+8}" fill="${hairColor}" stroke="${hairDark}" stroke-width="0.5" fill-opacity="0.9"/>
    `;
  } else {
    // Male hair styles
    if (hairStyle === 'short-messy') {
      hairSVG = `
        <path d="M${cx-headR-3} ${cy-10} Q${cx-headR-5} ${cy-headR-8} ${cx} ${cy-headR-12} Q${cx+headR+5} ${cy-headR-8} ${cx+headR+3} ${cy-10} Q${cx+headR+2} ${cy-headR-2} ${cx} ${cy-headR+4} Q${cx-headR-2} ${cy-headR-2} ${cx-headR-3} ${cy-10}Z" fill="${hairColor}" />
        <circle cx="${cx-8}" cy="${cy-headR-8}" r="5" fill="${hairColor}" />
        <circle cx="${cx+6}" cy="${cy-headR-10}" r="6" fill="${hairColor}" />
        <circle cx="${cx}" cy="${cy-headR-6}" r="7" fill="${hairColor}" />
      `;
    } else if (hairStyle === 'short-neat') {
      hairSVG = `
        <path d="M${cx-headR-2} ${cy-8} Q${cx-headR} ${cy-headR-4} ${cx} ${cy-headR-8} Q${cx+headR} ${cy-headR-4} ${cx+headR+2} ${cy-8} Q${cx+headR} ${cy-headR+6} ${cx} ${cy-headR+6} Q${cx-headR} ${cy-headR+6} ${cx-headR-2} ${cy-8}Z" fill="${hairColor}" />
      `;
    } else { // short-pompadour
      hairSVG = `
        <path d="M${cx-headR} ${cy-12} Q${cx-headR+4} ${cy-headR-16} ${cx+4} ${cy-headR-14} Q${cx+headR+2} ${cy-headR-10} ${cx+headR+2} ${cy-8} Q${cx+headR} ${cy-headR+4} ${cx} ${cy-headR+6} Q${cx-headR} ${cy-headR+4} ${cx-headR} ${cy-12}Z" fill="${hairColor}" />
        <path d="M${cx-headR-2} ${cy-10} Q${cx} ${cy-headR-18} ${cx+headR+2} ${cy-10}" fill="none" stroke="${hairDark}" stroke-width="1"/>
      `;
    }
  }

  // ---- Glasses (some characters) ----
  const hasGlasses = ['guy','davis','conrad','dmitry'].includes(v.id);
  let glassesSVG = '';
  if (hasGlasses) {
    glassesSVG = `
      <circle cx="${cx-eyeSpacing}" cy="${eyeY}" r="8" fill="none" stroke="#555" stroke-width="1.5"/>
      <circle cx="${cx+eyeSpacing}" cy="${eyeY}" r="8" fill="none" stroke="#555" stroke-width="1.5"/>
      <line x1="${cx-eyeSpacing+8}" y1="${eyeY}" x2="${cx+eyeSpacing-8}" y2="${eyeY}" stroke="#555" stroke-width="1.2"/>
      <line x1="${cx-eyeSpacing-8}" y1="${eyeY}" x2="${cx-eyeSpacing-10}" y2="${eyeY-2}" stroke="#555" stroke-width="1.2"/>
      <line x1="${cx+eyeSpacing+8}" y1="${eyeY}" x2="${cx+eyeSpacing+10}" y2="${eyeY-2}" stroke="#555" stroke-width="1.2"/>
    `;
  }

  // ---- Facial hair (some male characters) ----
  let facialHairSVG = '';
  if (v.gender === 'm' && ['guy','andrew','davis','conrad','dmitry','hamed'].includes(v.id)) {
    facialHairSVG = `
      <path d="M${cx-8} ${cy+14} Q${cx} ${cy+20} ${cx+8} ${cy+14}" fill="none" stroke="${hairColor}" stroke-width="1" opacity="0.4"/>
    `;
  }

  // ---- Assemble ----
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      <defs>
        <radialGradient id="skin-${v.id}" cx="45%" cy="40%">
          <stop offset="0%" stop-color="${skinTone}"/>
          <stop offset="100%" stop-color="${skinShadow}"/>
        </radialGradient>
        <radialGradient id="iris-${v.id}" cx="40%" cy="35%">
          <stop offset="0%" stop-color="${eyeColor}"/>
          <stop offset="100%" stop-color="${darken(eyeColor, 40)}"/>
        </radialGradient>
        <clipPath id="head-clip-${v.id}">
          <ellipse cx="${cx}" cy="${cy}" rx="${headR}" ry="${headR+2}"/>
        </clipPath>
      </defs>

      <!-- Background circle -->
      <circle cx="${cx}" cy="${cy}" r="${headR+10}" fill="${v.colors[0]}" opacity="0.15"/>

      <!-- Hair back -->
      ${hairSVG}

      <!-- Head -->
      <ellipse cx="${cx}" cy="${cy}" rx="${headR}" ry="${headR+2}" fill="url(#skin-${v.id})"/>

      <!-- Ears -->
      <ellipse cx="${cx-headR+2}" cy="${cy+2}" rx="5" ry="6" fill="${skinTone}" stroke="${skinShadow}" stroke-width="0.5"/>
      <ellipse cx="${cx+headR-2}" cy="${cy+2}" rx="5" ry="6" fill="${skinTone}" stroke="${skinShadow}" stroke-width="0.5"/>

      <!-- Eyes -->
      <ellipse cx="${cx-eyeSpacing}" cy="${eyeY}" rx="${eyeW}" ry="${eyeH}" fill="white"/>
      <circle cx="${cx-eyeSpacing+0.5}" cy="${eyeY+0.5}" r="${irisR}" fill="url(#iris-${v.id})"/>
      <circle cx="${cx-eyeSpacing+1}" cy="${eyeY-0.5}" r="${irisR*0.45}" fill="white" opacity="0.9"/>
      <ellipse cx="${cx+eyeSpacing}" cy="${eyeY}" rx="${eyeW}" ry="${eyeH}" fill="white"/>
      <circle cx="${cx+eyeSpacing+0.5}" cy="${eyeY+0.5}" r="${irisR}" fill="url(#iris-${v.id})"/>
      <circle cx="${cx+eyeSpacing+1}" cy="${eyeY-0.5}" r="${irisR*0.45}" fill="white" opacity="0.9"/>

      <!-- Eyebrows -->
      <rect x="${cx-eyeSpacing-browW/2}" y="${browY}" width="${browW}" height="${browH}" rx="${browH/2}" fill="${hairDark}" />
      <rect x="${cx+eyeSpacing-browW/2}" y="${browY}" width="${browW}" height="${browH}" rx="${browH/2}" fill="${hairDark}" />

      <!-- Nose -->
      <path d="M${cx} ${eyeY+eyeH+1} L${cx-noseW} ${noseY} Q${cx} ${noseY+2} ${cx+noseW} ${noseY}" fill="none" stroke="${skinShadow}" stroke-width="1.2" stroke-linecap="round"/>

      <!-- Mouth -->
      <path d="M${cx-mouthW/2} ${mouthY} Q${cx} ${mouthY+(v.gender==='f'?3:2)} ${cx+mouthW/2} ${mouthY}" fill="none" stroke="${lipColor}" stroke-width="1.5" stroke-linecap="round"/>

      <!-- Cheek blush -->
      <ellipse cx="${cx-eyeSpacing-4}" cy="${cy+6}" rx="6" ry="4" fill="${blushColor}"/>
      <ellipse cx="${cx+eyeSpacing+4}" cy="${cy+6}" rx="6" ry="4" fill="${blushColor}"/>

      ${glassesSVG}
      ${facialHairSVG}
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
}
