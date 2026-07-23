/**
 * Maps a genre/collection name to a small emoji glyph so the genres
 * grid has some visual identity per card instead of a flat pill.
 * Matching is keyword-based (checked in order) so it also covers
 * curated combo names like "Sci-Fi Thriller" or "Romantic Comedy".
 * No icon library needed - keeps the bundle light.
 */

interface IconRule {
  test: RegExp;
  icon: string;
}

const RULES: IconRule[] = [
  { test: /superhero/i, icon: '🦸' },
  { test: /heist/i, icon: '💰' },
  { test: /slasher/i, icon: '🔪' },
  { test: /body horror|monster/i, icon: '🧟' },
  { test: /true crime/i, icon: '🚔' },
  { test: /courtroom|legal/i, icon: '⚖️' },
  { test: /biopic/i, icon: '📜' },
  { test: /space opera/i, icon: '🛸' },
  { test: /fairy tale/i, icon: '🧚' },
  { test: /supernatural/i, icon: '🔮' },
  { test: /political/i, icon: '🏛️' },
  { test: /epic/i, icon: '🏰' },
  { test: /survival/i, icon: '🏕️' },
  { test: /dark fantasy|fantasy quest/i, icon: '🐉' },
  { test: /musical/i, icon: '🎼' },
  { test: /action/i, icon: '💥' },
  { test: /adventure/i, icon: '🧭' },
  { test: /animat/i, icon: '🎨' },
  { test: /comedy|dramedy/i, icon: '😂' },
  { test: /crime/i, icon: '🕵️' },
  { test: /documentary/i, icon: '🎥' },
  { test: /drama/i, icon: '🎭' },
  { test: /family|kids/i, icon: '👨‍👩‍👧‍👦' },
  { test: /fantasy/i, icon: '🧙' },
  { test: /history/i, icon: '📜' },
  { test: /horror/i, icon: '👻' },
  { test: /music/i, icon: '🎵' },
  { test: /mystery/i, icon: '🔍' },
  { test: /romance|romantic/i, icon: '💕' },
  { test: /science fiction|sci-fi/i, icon: '🚀' },
  { test: /thriller/i, icon: '😱' },
  { test: /war/i, icon: '🎖️' },
  { test: /western/i, icon: '🤠' },
  { test: /news/i, icon: '📰' },
  { test: /reality/i, icon: '📺' },
  { test: /soap/i, icon: '🫧' },
  { test: /talk/i, icon: '🎙️' },
];

export function getGenreIcon(name: string): string {
  for (const rule of RULES) {
    if (rule.test.test(name)) return rule.icon;
  }
  return '🎬';
}
