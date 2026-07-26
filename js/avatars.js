/* ============================================
   iknbite  |  Character Avatar System
   Uses real character portrait images
   ============================================ */

function generateAvatar(voice) {
  // Return the path to the real character portrait
  return `img/avatars/${voice.id}.jpg`;
}

function getAvatarWithFallback(voice) {
  // Return the real image path with gradient fallback for loading states
  return {
    src: `img/avatars/${voice.id}.jpg`,
    fallback: `linear-gradient(135deg, ${voice.colors[0]}, ${voice.colors[1]})`
  };
}
