/* ============================================
   iknbite  |  Character Avatar System
   Uses real character portrait images
   ============================================ */

function generateAvatar(voice) {
  if (!voice || !voice.id) return '';
  return 'img/avatars/' + voice.id + '.jpg';
}

function getAvatarWithFallback(voice) {
  if (!voice || !voice.id) return { src: '', fallback: '' };
  return {
    src: 'img/avatars/' + voice.id + '.jpg',
    fallback: 'linear-gradient(135deg, ' + (voice.colors ? voice.colors[0] : '#5E6AD2') + ', ' + (voice.colors ? voice.colors[1] : '#7B8AFF') + ')'
  };
}
