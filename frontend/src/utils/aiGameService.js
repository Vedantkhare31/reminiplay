// ============================================================================
// AIGameService
// ----------------------------------------------------------------------------
// Procedurally-generated, difficulty-adaptive content for the mini games.
// Every call returns a fresh, randomized puzzle so patients never see the
// same content twice in a row. Difficulty (length / complexity / option
// count) scales smoothly and *infinitely* with `level` - there is no cap,
// the games only end when the patient runs out of lives.
//
// "Adaptive" here means: each generator looks at `level` to decide how hard
// the puzzle should be, and uses weighted random selection that avoids
// repeating the same content twice in a row (a lightweight stand-in for a
// real ML recommender, easy to swap for an actual model/API later without
// changing the game components, since they only depend on this file's
// public shape).
// ============================================================================

// --------------------------- small utilities --------------------------------

const rand = (n) => Math.floor(Math.random() * n);

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const sample = (arr, count) => shuffle(arr).slice(0, count);

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

// Avoids picking the same index twice in a row for a given pool key.
const lastPicks = {};
function pickIndexAvoidingRepeat(key, length) {
  if (length <= 1) return 0;
  let idx = rand(length);
  let guard = 0;
  while (idx === lastPicks[key] && guard < 10) {
    idx = rand(length);
    guard++;
  }
  lastPicks[key] = idx;
  return idx;
}

// =============================================================================
// 1. MEMORY LANE
// =============================================================================

const MEMORY_EMOJI_POOL = [
  '🐘', '🦏', '🦁', '🐯', '🐒', '🦋', '🐝', '🐞',
  '🌸', '🌺', '🌻', '🌾', '🌳', '🌈', '☀️', '🌙',
  '⭐', '🍎', '🍌', '🍇', '🥭', '🥥', '🪕', '🥁',
];

function generateMemorySequence(level) {
  // grows from 3 items up to 15+, and starts allowing repeated items
  // (harder to track) once the pool would otherwise run out.
  const length = clamp(3 + Math.floor((level - 1) / 1.5), 3, 24);
  const allowRepeats = length > MEMORY_EMOJI_POOL.length;
  if (allowRepeats) {
    return Array.from({ length }, () => MEMORY_EMOJI_POOL[rand(MEMORY_EMOJI_POOL.length)]);
  }
  return sample(MEMORY_EMOJI_POOL, length);
}

// =============================================================================
// 2. ROUTINE BUILDER
// =============================================================================
// Each theme is already in the *correct* order. `hint` explains WHY that
// step happens where it does, so the tutorial / "Learn it first" screen can
// actually teach the logic instead of just testing recall.

const ROUTINE_THEMES = [
  {
    name: 'Morning Routine',
    steps: [
      { text: '⏰ Wake up and stretch', hint: 'Start the day by waking your body up gently.' },
      { text: '🪥 Brush your teeth', hint: 'Clean teeth first thing, before eating.' },
      { text: '🚿 Take a shower', hint: 'Wash up after brushing, before getting dressed.' },
      { text: '👕 Get dressed', hint: 'Put on clean clothes once you are washed.' },
      { text: '🍳 Eat breakfast', hint: 'Eat after you are dressed and ready.' },
      { text: '☕ Have a warm drink', hint: 'A warm drink usually comes with or after breakfast.' },
      { text: '🚪 Leave the house', hint: 'Head out only once everything else is done.' },
    ],
  },
  {
    name: 'Making Tea',
    steps: [
      { text: '🚰 Fill the kettle with water', hint: 'You need water in the kettle before it can boil.' },
      { text: '🔥 Boil the water', hint: 'Turn the kettle on after filling it.' },
      { text: '🫖 Put a tea bag in the cup', hint: 'The tea bag goes in before the hot water.' },
      { text: '💧 Pour hot water into the cup', hint: 'Pour once the water has boiled.' },
      { text: '⏳ Let it steep for a few minutes', hint: 'Give the tea time to brew before drinking.' },
      { text: '🥛 Add milk or sugar if you like', hint: 'Add extras after the tea has steeped.' },
      { text: '☕ Enjoy your tea', hint: 'The last step is always to sit back and enjoy it.' },
    ],
  },
  {
    name: 'Gardening',
    steps: [
      { text: '🧤 Put on gardening gloves', hint: 'Protect your hands before touching soil or tools.' },
      { text: '🌱 Dig a small hole', hint: 'Make space in the soil before planting anything.' },
      { text: '🌰 Place the seed in the hole', hint: 'The seed goes in after the hole is ready.' },
      { text: '🪴 Cover the seed with soil', hint: 'Cover it gently once it is placed.' },
      { text: '💧 Water the soil', hint: 'Give it water after covering, so the seed can grow.' },
      { text: '☀️ Leave it in the sunlight', hint: 'Sunlight comes after watering.' },
      { text: '🌷 Watch it grow', hint: 'Growing happens last, over time.' },
    ],
  },
  {
    name: 'Getting Ready for Bed',
    steps: [
      { text: '📺 Turn off the television', hint: 'Wind down by turning off screens first.' },
      { text: '🪥 Brush your teeth', hint: 'Brush before changing into pyjamas.' },
      { text: '👘 Put on pyjamas', hint: 'Change into sleepwear after brushing your teeth.' },
      { text: '📖 Read a little or relax quietly', hint: 'A quiet activity helps you settle down.' },
      { text: '💡 Turn off the lights', hint: 'Lights go off right before getting into bed.' },
      { text: '🛏️ Get into bed', hint: 'The very last step is lying down to sleep.' },
    ],
  },
  {
    name: 'Cooking a Simple Meal',
    steps: [
      { text: '🧼 Wash your hands', hint: 'Always start by washing your hands.' },
      { text: '🥕 Wash and prepare the vegetables', hint: 'Prepare ingredients before cooking them.' },
      { text: '🍳 Heat the pan', hint: 'Heat the pan once ingredients are ready.' },
      { text: '🥘 Cook the food', hint: 'Cooking happens after the pan is hot.' },
      { text: '🍽️ Put the food on a plate', hint: 'Plate the food once it is cooked.' },
      { text: '🍴 Sit down and eat', hint: 'Eating is always the last step.' },
    ],
  },
  {
    name: 'Doing the Laundry',
    steps: [
      { text: '👚 Sort clothes into piles', hint: 'Sort clothes before washing them.' },
      { text: '🧺 Put clothes in the washing machine', hint: 'Load the machine after sorting.' },
      { text: '🧴 Add detergent', hint: 'Add soap once the clothes are in.' },
      { text: '▶️ Start the machine', hint: 'Start the wash after adding detergent.' },
      { text: '🌬️ Dry the clothes', hint: 'Drying comes after washing.' },
      { text: '📐 Fold the clothes', hint: 'Fold once everything is dry.' },
    ],
  },
];

let lastRoutineTheme = -1;
function generateRoutine(level) {
  const themeIdx = pickIndexAvoidingRepeat('routine', ROUTINE_THEMES.length);
  lastRoutineTheme = themeIdx;
  const theme = ROUTINE_THEMES[themeIdx];
  const count = clamp(3 + Math.floor((level - 1) / 2), 3, theme.steps.length);
  const steps = theme.steps.slice(0, count);
  return {
    themeName: theme.name,
    steps: steps.map((s) => s.text),
    hints: steps.map((s) => s.hint),
  };
}

// =============================================================================
// 3. PATTERN QUEST
// =============================================================================

const PATTERN_EMOJI_SETS = [
  ['🔴', '🔵', '🟢', '🟡', '🟣'],
  ['🐶', '🐱', '🐭', '🐹', '🐰'],
  ['⭐', '🌙', '☀️', '☁️', '⚡'],
  ['🍎', '🍌', '🍇', '🍊', '🍓'],
  ['🔺', '🔵', '🟦', '⬛', '⬜'],
];

function buildOptions(correctAnswer, pool) {
  const distractorPool = pool.filter((p) => p !== correctAnswer);
  const distractors = sample(distractorPool, Math.min(3, distractorPool.length));
  return shuffle([correctAnswer, ...distractors]);
}

function generatePattern(level) {
  const setIdx = pickIndexAvoidingRepeat('pattern-set', PATTERN_EMOJI_SETS.length);
  const pool = PATTERN_EMOJI_SETS[setIdx];

  // Pick a rule style; more complex rules unlock as level rises.
  const complexity = level < 3 ? 0 : level < 6 ? rand(2) : level < 10 ? rand(3) : rand(4);

  let sequence = [];
  let correctAnswer;
  const visibleLength = clamp(4 + Math.floor((level - 1) / 3), 4, 12);

  if (complexity === 0) {
    // Simple A-B-A-B repeat
    const [a, b] = sample(pool, 2);
    for (let i = 0; i < visibleLength; i++) sequence.push(i % 2 === 0 ? a : b);
    correctAnswer = visibleLength % 2 === 0 ? a : b;
  } else if (complexity === 1) {
    // Three-item repeating cycle
    const [a, b, c] = sample(pool, 3);
    const cycle = [a, b, c];
    for (let i = 0; i < visibleLength; i++) sequence.push(cycle[i % 3]);
    correctAnswer = cycle[visibleLength % 3];
  } else if (complexity === 2) {
    // Growing groups: A, AB, AB B, ... (increasing repeats of one symbol)
    const [a, b] = sample(pool, 2);
    let n = 1;
    while (sequence.length < visibleLength) {
      for (let i = 0; i < n && sequence.length < visibleLength; i++) sequence.push(a);
      if (sequence.length < visibleLength) sequence.push(b);
      n++;
    }
    correctAnswer = sequence[sequence.length - 1] === a ? b : a;
    sequence = sequence.slice(0, visibleLength);
  } else {
    // Mirror / palindrome pattern: ABC CBA ABC ...
    const [a, b, c] = sample(pool, 3);
    const block = [a, b, c, c, b, a];
    for (let i = 0; i < visibleLength; i++) sequence.push(block[i % block.length]);
    correctAnswer = block[visibleLength % block.length];
  }

  sequence.push('?');
  const optionCount = clamp(3 + Math.floor(level / 6), 3, 6);
  const options = buildOptions(correctAnswer, pool).slice(0, optionCount);
  // Make sure the correct answer survived the slice
  if (!options.includes(correctAnswer)) options[rand(options.length)] = correctAnswer;

  return { pattern: sequence, options: shuffle(options), correctAnswer };
}

// =============================================================================
// 4. STORY WEAVER
// =============================================================================

const STORY_POOL = [
  {
    title: 'The Market Morning',
    story:
      'Maya walked to the market early in the morning to buy fresh vegetables. She bought tomatoes, onions, and a bunch of bananas. On her way home, she stopped to say hello to her neighbor, Mr. Rao, who was watering his plants.',
    questions: [
      { q: 'What did Maya buy at the market?', options: ['Tomatoes, onions, and bananas', 'Rice and milk', 'Flowers', 'Shoes'], correctAnswer: 'Tomatoes, onions, and bananas' },
      { q: 'Who was Maya\'s neighbor?', options: ['Mr. Rao', 'Mrs. Singh', 'Dr. Verma', 'Her sister'], correctAnswer: 'Mr. Rao' },
      { q: 'What was Mr. Rao doing?', options: ['Watering his plants', 'Reading a book', 'Cooking', 'Sleeping'], correctAnswer: 'Watering his plants' },
    ],
  },
  {
    title: 'The Rainy Afternoon',
    story:
      'It started raining heavily in the afternoon. Priya closed all the windows and made a cup of hot ginger tea. She sat by the window and watched the rain fall on the garden while listening to old songs on the radio.',
    questions: [
      { q: 'What did Priya make?', options: ['Ginger tea', 'Coffee', 'Lemonade', 'Soup'], correctAnswer: 'Ginger tea' },
      { q: 'What did Priya do first when it started raining?', options: ['Closed the windows', 'Went outside', 'Called a friend', 'Turned off the lights'], correctAnswer: 'Closed the windows' },
      { q: 'What was Priya listening to?', options: ['Old songs on the radio', 'The news', 'A cricket match', 'Nothing'], correctAnswer: 'Old songs on the radio' },
    ],
  },
  {
    title: 'The Birthday Surprise',
    story:
      'It was Grandma\'s 70th birthday. Her grandchildren baked a chocolate cake and decorated the living room with balloons and colorful lights. When Grandma walked in, everyone shouted "Surprise!" and she smiled with joyful tears.',
    questions: [
      { q: 'How old was Grandma turning?', options: ['70', '60', '80', '50'], correctAnswer: '70' },
      { q: 'What flavor cake did they bake?', options: ['Chocolate', 'Vanilla', 'Strawberry', 'Lemon'], correctAnswer: 'Chocolate' },
      { q: 'How did they decorate the room?', options: ['Balloons and colorful lights', 'Flowers only', 'Candles only', 'Photographs'], correctAnswer: 'Balloons and colorful lights' },
    ],
  },
  {
    title: 'The Morning Walk',
    story:
      'Every morning, Arjun and his dog Bruno walk around the park before sunrise. They pass the old banyan tree, cross the small wooden bridge, and stop at the bench near the pond to rest for a few minutes before heading home.',
    questions: [
      { q: "What is Arjun's dog called?", options: ['Bruno', 'Rocky', 'Tommy', 'Max'], correctAnswer: 'Bruno' },
      { q: 'What do they cross during their walk?', options: ['A small wooden bridge', 'A busy road', 'A river', 'A hill'], correctAnswer: 'A small wooden bridge' },
      { q: 'Where do they rest?', options: ['A bench near the pond', 'Under the banyan tree', 'At home', 'At a cafe'], correctAnswer: 'A bench near the pond' },
    ],
  },
  {
    title: 'The Lost Kitten',
    story:
      'A small grey kitten wandered into Meera\'s courtyard one evening, meowing softly. Meera gave it a bowl of warm milk and made a cozy bed from an old blanket. The next day, she found the kitten\'s owner, a young boy from two houses down the street.',
    questions: [
      { q: 'What color was the kitten?', options: ['Grey', 'Black', 'White', 'Orange'], correctAnswer: 'Grey' },
      { q: 'What did Meera give the kitten?', options: ['A bowl of warm milk', 'Fish', 'Bread', 'Nothing'], correctAnswer: 'A bowl of warm milk' },
      { q: "Who was the kitten's owner?", options: ['A young boy from two houses down', 'Meera herself', 'A shopkeeper', 'No one'], correctAnswer: 'A young boy from two houses down' },
    ],
  },
  {
    title: 'The Family Picnic',
    story:
      'On Sunday, the whole family packed sandwiches, fruit, and a big flask of lemonade for a picnic by the river. The children played with a kite while the elders sat on a mat, chatting and enjoying the cool breeze under a large tree.',
    questions: [
      { q: 'Where did the family have their picnic?', options: ['By the river', 'At the beach', 'In the mountains', 'In their backyard'], correctAnswer: 'By the river' },
      { q: 'What did the children play with?', options: ['A kite', 'A football', 'Cards', 'A ball'], correctAnswer: 'A kite' },
      { q: 'What did they pack to drink?', options: ['Lemonade', 'Tea', 'Juice boxes', 'Milk'], correctAnswer: 'Lemonade' },
    ],
  },
  {
    title: 'The New Bookshop',
    story:
      'A new bookshop opened at the corner of the street, painted bright blue with a small bell above the door. Inside, the owner, Mrs. Iyer, arranged the books by color instead of by subject, which made the shop look like a rainbow.',
    questions: [
      { q: 'What color was the bookshop painted?', options: ['Blue', 'Red', 'Green', 'Yellow'], correctAnswer: 'Blue' },
      { q: "What was the shop owner's name?", options: ['Mrs. Iyer', 'Mr. Rao', 'Ms. Das', 'Mrs. Kapoor'], correctAnswer: 'Mrs. Iyer' },
      { q: 'How were the books arranged?', options: ['By color', 'By subject', 'By author', 'By size'], correctAnswer: 'By color' },
    ],
  },
  {
    title: 'The Village Fair',
    story:
      'The annual village fair brought stalls of sweets, handmade toys, and puppet shows to the town square. Ravi won a small wooden elephant by throwing rings onto bottles, and he gave it to his little sister as a gift.',
    questions: [
      { q: 'What did Ravi win?', options: ['A small wooden elephant', 'A balloon', 'A candy box', 'A puppet'], correctAnswer: 'A small wooden elephant' },
      { q: 'How did Ravi win the prize?', options: ['Throwing rings onto bottles', 'A running race', 'A singing contest', 'Guessing a number'], correctAnswer: 'Throwing rings onto bottles' },
      { q: 'Who did Ravi give the gift to?', options: ['His little sister', 'His mother', 'A friend', 'He kept it'], correctAnswer: 'His little sister' },
    ],
  },
];

let usedStoryIds = [];
function generateStory(level) {
  if (usedStoryIds.length >= STORY_POOL.length) usedStoryIds = [];
  let idx = rand(STORY_POOL.length);
  let guard = 0;
  while (usedStoryIds.includes(idx) && guard < 10) {
    idx = rand(STORY_POOL.length);
    guard++;
  }
  usedStoryIds.push(idx);

  const base = STORY_POOL[idx];
  const questionCount = clamp(1 + Math.floor((level - 1) / 3), 1, base.questions.length);
  const questions = sample(base.questions, questionCount).map((q) => ({
    q: q.q,
    correctAnswer: q.correctAnswer,
    options: shuffle(q.options),
  }));

  return { title: base.title, story: base.story, questions };
}

// =============================================================================
// 5. FACE & PLACE - AI GENERATOR (Infinite Stages)
// =============================================================================

// Each face is bound directly to its real-world matching place, as one
// unit. This is the source of truth for "correct" answers — it removes
// any dependency on two separate arrays lining up by coincidence.
const FACE_PLACE_PAIRS = [
  { face: '👨‍🦳', name: 'Grandpa', faceDescription: 'Elderly man with white hair', place: '🏠', location: 'Home', placeDescription: 'A cozy house' },
  { face: '👩‍🦰', name: 'Grandma', faceDescription: 'Elderly woman with red hair', place: '🏠', location: 'Home', placeDescription: 'A cozy house' },
  { face: '👨‍🏫', name: 'Teacher', faceDescription: 'Man with glasses and a book', place: '🏫', location: 'School', placeDescription: 'A building with classrooms' },
  { face: '👩‍⚕️', name: 'Doctor', faceDescription: 'Woman wearing a white coat', place: '🏥', location: 'Hospital', placeDescription: 'A place with a red cross' },
  { face: '👨‍🍳', name: 'Chef', faceDescription: 'Man wearing a chef hat', place: '🍳', location: 'Kitchen', placeDescription: 'A room with cooking utensils' },
  { face: '👩‍🎨', name: 'Artist', faceDescription: 'Woman with a paint palette', place: '🎨', location: 'Studio', placeDescription: 'A room with art supplies' },
  { face: '👨‍🔧', name: 'Mechanic', faceDescription: 'Man wearing a cap and holding tools', place: '🔧', location: 'Garage', placeDescription: 'A place with tools and cars' },
  { face: '👩‍🌾', name: 'Farmer', faceDescription: 'Woman wearing a straw hat', place: '🌾', location: 'Farm', placeDescription: 'A field with crops' },
  { face: '👨‍✈️', name: 'Pilot', faceDescription: 'Man in a pilot uniform', place: '✈️', location: 'Airport', placeDescription: 'A place with airplanes' },
  { face: '👩‍🚀', name: 'Astronaut', faceDescription: 'Woman in a space suit', place: '🚀', location: 'Space Station', placeDescription: 'A place in outer space' },
  { face: '👨‍🎤', name: 'Singer', faceDescription: 'Man holding a microphone', place: '🎵', location: 'Stage', placeDescription: 'A place with a microphone' },
  { face: '👩‍💻', name: 'Programmer', faceDescription: 'Woman working on a computer', place: '💻', location: 'Office', placeDescription: 'A room with computers' },
  { face: '👨‍🔬', name: 'Scientist', faceDescription: 'Man wearing a lab coat', place: '🔬', location: 'Lab', placeDescription: 'A place with scientific equipment' },
  { face: '👩‍🏫', name: 'Professor', faceDescription: 'Woman with a graduation cap', place: '🏛️', location: 'College', placeDescription: 'A building with graduation caps' },
  { face: '👨‍⚖️', name: 'Judge', faceDescription: 'Man in a court robe', place: '⚖️', location: 'Court', placeDescription: 'A room with a judge\'s bench' },
  { face: '👩‍🎓', name: 'Graduate', faceDescription: 'Woman with a graduation cap', place: '📚', location: 'Library', placeDescription: 'A room filled with books' },
  { face: '👨‍🚒', name: 'Firefighter', faceDescription: 'Man in a firefighter suit', place: '🚒', location: 'Fire Station', placeDescription: 'A place with fire trucks' },
  { face: '👩‍🦱', name: 'Student', faceDescription: 'Young woman with curly hair', place: '🏫', location: 'School', placeDescription: 'A building with classrooms' },
];

// Generate unique pairs for each level
function generateFacePlacePairs(level) {
  // Calculate number of pairs based on level (3 to 8 pairs)
  const pairCount = Math.min(3 + Math.floor((level - 1) / 2), 8);

  // Shuffle the fixed face-place pairs, then pick pairCount of them,
  // skipping any entry whose place is already taken this round (a
  // couple of faces legitimately share a place, e.g. Grandpa/Grandma
  // both belong at Home — only one of them can appear per round so
  // every place shown stays uniquely tied to one visible face).
  const shuffled = shuffleArray(FACE_PLACE_PAIRS);
  const usedPlaces = new Set();
  const selected = [];

  for (const entry of shuffled) {
    if (selected.length >= pairCount) break;
    if (usedPlaces.has(entry.place)) continue;
    usedPlaces.add(entry.place);
    selected.push(entry);
  }

  const pairs = selected.map(({ face, place, name, location, faceDescription, placeDescription }) => ({
    face, place, name, location, faceDescription, placeDescription
  }));

  // Shuffle the pairs to mix them up
  return shuffleArray(pairs);
}

// Helper function to shuffle array
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// =============================================================================

const AIGameService = {
  generateMemorySequence,
  generateRoutine,
  generatePattern,
  generateStory,
  generateFacePlacePairs,
  generateCardFlipGrid,
};

// =============================================================================
// 6. CARD FLIP (MEMORY MATCH) - Infinite AI-Generated Stages
// =============================================================================

// Large pool of emojis for card matching
const CARD_EMOJI_POOL = [
  '🐘', '🦏', '🦁', '🐯', '🐒', '🦋', '🐝', '🐞',
  '🌸', '🌺', '🌻', '🌾', '🌳', '🌈', '☀️', '🌙',
  '⭐', '🍎', '🍌', '🍇', '🥭', '🥥', '🪕', '🥁',
  '🎨', '🎭', '🎪', '🎯', '🎲', '🎰', '🎸', '🎺',
  '🏀', '⚽', '🏈', '🎾', '🏐', '🏓', '🏸', '🥊',
  '🍕', '🍔', '🍟', '🌮', '🍩', '🍪', '🍰', '🍫',
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑',
];

function generateCardFlipGrid(level) {
  // Number of pairs grows: Level 1 = 3 pairs (6 cards), +1 pair every 2 levels, cap at 12 pairs (24 cards)
  const pairs = clamp(3 + Math.floor((level - 1) / 2), 3, 12);
  
  // Pick random emojis from the pool
  const selectedEmojis = sample(CARD_EMOJI_POOL, pairs);
  
  // Create pairs (each emoji appears twice)
  const cards = [];
  selectedEmojis.forEach((emoji, idx) => {
    cards.push({ id: `${idx}-a`, emoji, pairId: idx });
    cards.push({ id: `${idx}-b`, emoji, pairId: idx });
  });
  
  // Shuffle the deck
  const shuffled = shuffle(cards);
  
  // Calculate time limit
  // Base time: 20s + (pairs * 5s) + (level * 1s)
  const timeLimit = 20 + (pairs * 5) + level;
  
  return {
    cards: shuffled,
    pairs,
    timeLimit,
    level,
  };
}

export default AIGameService;