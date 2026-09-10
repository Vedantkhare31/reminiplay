// ============================================================
// SINGLE SOURCE OF TRUTH FOR APP INTENTS
// ============================================================
// Previously these lists were duplicated (and drifted out of sync)
// across AIAgentService.js and aiResponseService.js. Now there's
// exactly one place to add a new game or page.

export const NAVIGATION = [
  'dashboard', 'doctor', 'patients', 'reminders',
  'analytics', 'home', 'profile', 'settings', 'back'
];

export const GAMES = [
  'memory',   // Memory Lane
  'routine',  // Routine Builder
  'pattern',  // Pattern Quest
  'story',    // Story Weaver
  'face',     // Face & Place
  'mindful',  // Mindful Moments
  'gesture'   // Gesture Drawing
];

export const GAME_ACTIONS = ['play', 'pause', 'resume', 'restart', 'save'];

export const REMINDER_ACTIONS = ['add', 'check', 'complete'];

// Every valid "intent" string the take_action tool is allowed to return,
// namespaced by category so the app-side handler can switch on it safely.
export const ALL_INTENTS = [
  ...NAVIGATION.map(n => `navigation.${n}`),
  ...GAMES.map(g => `game.${g}`),
  ...GAME_ACTIONS.map(a => `action.${a}`),
  ...REMINDER_ACTIONS.map(r => `reminder.${r}`)
];

// Languages the app has native, hand-checked copy for. The model can
// still *reply* in other languages the user writes in (real language
// understanding isn't limited to a hardcoded list) — this list is only
// used for the tiny set of strings we show without calling the API
// (e.g. the offline fallback message).
export const LANGUAGES = {
  en: 'English',
  hi: 'Hindi',
  as: 'Assamese',
  bn: 'Bengali',
  mr: 'Marathi'
};
