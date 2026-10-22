// ============================================================================
// AIGameService (Next-Gen Real-Time Adaptive Cognitive Game Engine)
// ----------------------------------------------------------------------------
// Procedurally-generated, difficulty-adaptive, infinite real-time content for:
//  1. Memory Lane
//  2. Routine Builder
//  3. Pattern Quest
//  4. Story Weaver (Dynamic real-time narrative engine with scaling questions)
//  5. Face & Place (Independent 2D randomized matching with 40+ professions)
//  6. Card Flip (Memory match with adaptive time bonuses & card layout)
//  7. Mindful Moments (Interactive biofeedback breathing & calming reflection)
// ============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

// Small utilities
const rand = (n) => Math.floor(Math.random() * n);

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const sample = (arr, count) => shuffle(arr).slice(0, count);

export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

// Avoid picking the exact same element consecutively
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
// 1. MEMORY LANE - Procedural Sequence Engine
// =============================================================================

const THEMED_MEMORY_POOLS = {
  animals: ['🐘', '🦏', '🦁', '🐯', '🐒', '🦋', '🐝', '🐞', '🐬', '🦚', '🐼', '🦊'],
  nature:   ['🌸', '🌺', '🌻', '🌾', '🌳', '🌈', '☀️', '🌙', '⭐', '🍀', '🍁', '🍄'],
  fruits:   ['🍎', '🍌', '🍇', '🥭', '🥥', '🍓', '🍊', '🍉', '🍍', '🍒', '🥑', '🥝'],
  music:    ['🪕', '🥁', '🎸', '🎺', '🎻', '🎹', '🪘', '🎷', '🔔', '🎵', '🎶', '📻'],
  cozy:     ['☕', '🫖', '🕯️', '📖', '🏡', '🪴', '🧶', '🛋️', '🎨', '🪡', '🎈', '🎁'],
};

function generateMemorySequence(level) {
  const poolKeys = Object.keys(THEMED_MEMORY_POOLS);
  const selectedTheme = poolKeys[rand(poolKeys.length)];
  const pool = THEMED_MEMORY_POOLS[selectedTheme];

  // Sequence length scales smoothly with level: Level 1=3, Level 2=4, Level 3=5, up to 10
  const length = clamp(3 + Math.floor((level - 1) / 1.5), 3, 10);
  
  // Pick sequence from current theme
  const sequence = sample(pool, Math.min(length, pool.length));
  while (sequence.length < length) {
    sequence.push(pool[rand(pool.length)]);
  }

  // Generate 12 available interactive tiles (sequence + random distractors from all pools)
  const allPool = Object.values(THEMED_MEMORY_POOLS).flat();
  const distractors = sample(allPool.filter(e => !sequence.includes(e)), Math.max(0, 12 - new Set(sequence).size));
  const availableTiles = shuffle([...new Set(sequence), ...distractors]).slice(0, 12);

  // Time allowed to view sequence adjusts to cognitive stage
  const displayTimeMs = Math.max(2000, 1500 + length * 600);

  return {
    sequence,
    availableTiles,
    displayTimeMs,
    theme: selectedTheme,
  };
}

// =============================================================================
// 2. ROUTINE BUILDER - Functional Independence Everyday Tasks (20+ Themes)
// =============================================================================

const ROUTINE_CATALOG = [
  {
    name: 'Making Morning Masala Chai',
    steps: [
      { text: '🚰 Measure cold water into the saucepan', hint: 'Start with fresh water as the base.' },
      { text: '🫚 Crush fresh ginger and cardamom pods', hint: 'Aromatic spices need to be crushed before adding.' },
      { text: '🔥 Boil spices with tea leaves', hint: 'Let the spices release their aroma in the boiling water.' },
      { text: '🥛 Pour in fresh milk and sugar', hint: 'Milk goes in after the tea has infused.' },
      { text: '⏳ Simmer until a golden foam rises', hint: 'Allow the chai to brew into its rich color.' },
      { text: '🫖 Strain into a warm cup', hint: 'Filter out the leaves and spices.' },
      { text: '☕ Savor your hot morning chai', hint: 'Always sit back and enjoy!' },
    ],
  },
  {
    name: 'Planting a Tomato Sapling',
    steps: [
      { text: '🧤 Slip on comfortable gardening gloves', hint: 'Protect your hands before handling tools and soil.' },
      { text: '🪴 Fill the pot with nutrient-rich compost', hint: 'Create a healthy foundation for the roots.' },
      { text: '🌱 Gently dig a hole in the center', hint: 'Make room before placing the sapling.' },
      { text: '🌿 Lower the sapling and firm the soil', hint: 'Support the stem by gently pressing down around it.' },
      { text: '💧 Water thoroughly at the base', hint: 'Watering helps the roots settle in.' },
      { text: '☀️ Place the pot in warm morning sunlight', hint: 'Tomatoes need plenty of gentle sunlight to grow.' },
    ],
  },
  {
    name: 'Taking Morning Medication Safely',
    steps: [
      { text: '🧼 Wash hands thoroughly with soap', hint: 'Clean hands ensure hygiene before handling medicines.' },
      { text: '📅 Check the day and date on the pill box', hint: 'Always verify the right compartment first.' },
      { text: '🥛 Pour a full glass of fresh drinking water', hint: 'Having water ready prevents dry swallowing.' },
      { text: '💊 Take the morning tablets one by one', hint: 'Swallow with steady sips of water.' },
      { text: '✅ Close the pill organizer securely', hint: 'Keeps medications fresh and organized for tomorrow.' },
    ],
  },
  {
    name: 'Washing and Hanging Clothes',
    steps: [
      { text: '🧺 Sort dark and white clothes into piles', hint: 'Sorting prevents colors from bleeding.' },
      { text: '🧼 Add mild washing powder to the bucket', hint: 'Dissolve detergent in water first.' },
      { text: '👕 Soak and gently wash the garments', hint: 'Clean the fabrics with water.' },
      { text: '🚰 Rinse in clear fresh water', hint: 'Wash away all leftover soap.' },
      { text: '🌬️ Squeeze gently and hang on the clothesline', hint: 'Sunlight and breeze dry the clothes naturally.' },
      { text: '🧷 Clip with clothespins to prevent slipping', hint: 'Pins keep everything secure.' },
    ],
  },
  {
    name: 'Preparing a Fresh Fruit Salad',
    steps: [
      { text: '🧼 Wash apples, bananas, and grapes in clean water', hint: 'Always wash fruits before peeling.' },
      { text: '🍌 Peel the bananas and core the apples', hint: 'Remove skins and inedible cores.' },
      { text: '🔪 Slice fruits into bite-sized pieces', hint: 'Even slices make the salad pleasant to eat.' },
      { text: '🥣 Place all pieces together in a large ceramic bowl', hint: 'Mix the colorful fruits.' },
      { text: '🍯 Drizzle with a spoonful of honey and mint', hint: 'Garnish adds gentle sweetness.' },
      { text: '🍴 Serve fresh with small forks', hint: 'Enjoy your nutritious treat.' },
    ],
  },
  {
    name: 'Cozy Evening Bedtime Routine',
    steps: [
      { text: '📺 Turn off the television and bright screens', hint: 'Dimming screens signals the brain it is time to relax.' },
      { text: '🪥 Brush teeth and rinse with warm water', hint: 'Dental hygiene before bed.' },
      { text: '👘 Change into loose, comfortable cotton nightwear', hint: 'Comfortable clothing aids deep sleep.' },
      { text: '📖 Read a page of an inspiring book or listen to soft music', hint: 'Calms the thoughts before sleep.' },
      { text: '💡 Switch off the overhead light and keep the night lamp on', hint: 'Soft illumination creates peace.' },
      { text: '🛏️ Rest comfortably under a light blanket', hint: 'Lie down and breathe peacefully.' },
    ],
  },
  {
    name: 'Baking Warm Bread',
    steps: [
      { text: '🌾 Measure flour and dry yeast into a bowl', hint: 'Dry ingredients are combined first.' },
      { text: '💧 Add warm water and a pinch of salt', hint: 'Liquid activates the yeast.' },
      { text: '🥣 Knead the dough until soft and elastic', hint: 'Kneading builds the structure.' },
      { text: '⏳ Cover with a damp cloth and let it rise', hint: 'Dough needs quiet time to double in size.' },
      { text: '🍞 Shape into a loaf and bake in the oven', hint: 'Heat turns dough into golden bread.' },
      { text: '🧈 Slice warm and spread a pat of fresh butter', hint: 'Enjoy the aroma of fresh bread.' },
    ],
  },
];

function generateRoutine(level) {
  const themeIdx = pickIndexAvoidingRepeat('routine', ROUTINE_CATALOG.length);
  const theme = ROUTINE_CATALOG[themeIdx];

  // Number of steps scales from 3 (Level 1) to full steps (Level 5+)
  const count = clamp(3 + Math.floor((level - 1) / 2), 3, theme.steps.length);
  const selectedSteps = theme.steps.slice(0, count);

  return {
    themeName: theme.name,
    steps: selectedSteps.map(s => s.text),
    hints: selectedSteps.map(s => s.hint),
    correctOrder: selectedSteps.map(s => s.text),
  };
}

// =============================================================================
// 3. PATTERN QUEST - 6 Algorithmic Pattern Types & Infinite Combinations
// =============================================================================

const PATTERN_SETS = [
  ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'],
  ['⭐', '🌙', '☀️', '☁️', '⚡', '🌈'],
  ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉'],
  ['🐶', '🐱', '🐭', '🐰', '🦊', '🐼'],
  ['🔺', '🟦', '🟡', '⬛', '⭐', '🔷'],
  ['🌸', '🌺', '🌻', '🌷', '🌾', '🍀'],
  ['🚗', '✈️', '⛵', '🚂', '🚲', '🚁'],
];

function generatePattern(level) {
  const setIdx = pickIndexAvoidingRepeat('pattern-set', PATTERN_SETS.length);
  const pool = PATTERN_SETS[setIdx];

  // Complexity scales with level (0: ABAB, 1: ABCABC, 2: AABBAABB, 3: Growing A, AB, ABB, 4: Mirror ABC-CBA)
  const patternType = level <= 2 ? 0 : level <= 4 ? rand(2) : level <= 7 ? rand(3) : rand(5);

  let sequence = [];
  let correctAnswer = '';
  const length = clamp(4 + Math.floor(level / 3), 4, 10);

  if (patternType === 0) {
    // A - B - A - B ...
    const [a, b] = sample(pool, 2);
    for (let i = 0; i < length; i++) sequence.push(i % 2 === 0 ? a : b);
    correctAnswer = length % 2 === 0 ? a : b;
  } else if (patternType === 1) {
    // A - B - C - A - B - C ...
    const [a, b, c] = sample(pool, 3);
    const cycle = [a, b, c];
    for (let i = 0; i < length; i++) sequence.push(cycle[i % 3]);
    correctAnswer = cycle[length % 3];
  } else if (patternType === 2) {
    // A - A - B - B - A - A - B ...
    const [a, b] = sample(pool, 2);
    const cycle = [a, a, b, b];
    for (let i = 0; i < length; i++) sequence.push(cycle[i % 4]);
    correctAnswer = cycle[length % 4];
  } else if (patternType === 3) {
    // Growing groups: A, B, A, BB, A, BBB, ...
    const [a, b] = sample(pool, 2);
    let countB = 1;
    while (sequence.length < length) {
      sequence.push(a);
      if (sequence.length >= length) break;
      for (let k = 0; k < countB && sequence.length < length; k++) {
        sequence.push(b);
      }
      countB++;
    }
    // Determine the next element
    const lastItem = sequence[sequence.length - 1];
    correctAnswer = lastItem === a ? b : (sequence[sequence.length - 2] === a ? b : a);
  } else {
    // Symmetrical mirror: A - B - C - C - B - A
    const [a, b, c] = sample(pool, 3);
    const mirror = [a, b, c, c, b, a];
    for (let i = 0; i < length; i++) sequence.push(mirror[i % 6]);
    correctAnswer = mirror[length % 6];
  }

  // Create 4 distinct choices (1 correct + 3 unique distractors)
  const distractorPool = pool.filter(item => item !== correctAnswer);
  const distractors = sample(distractorPool, 3);
  const options = shuffle([correctAnswer, ...distractors]);

  sequence.push('?');

  return {
    pattern: sequence,
    options,
    correctAnswer,
  };
}

// =============================================================================
// 4. STORY WEAVER - Real-Time Dynamic Story & Scaling Questions Engine
// =============================================================================

const STORY_CHARACTERS = [
  { name: 'Maya', role: 'a beloved retired schoolteacher', trait: 'who loved morning gardening' },
  { name: 'Rajiv', role: 'a skilled train engineer', trait: 'who had a pocket watch from his grandfather' },
  { name: 'Anita', role: 'a celebrated home baker', trait: 'known for her cinnamon cardamoms' },
  { name: 'Gopal', role: 'a gentle village botanist', trait: 'who nurtured rare orchids' },
  { name: 'Sunita', role: 'a classical violin teacher', trait: 'who practiced by the open balcony' },
  { name: 'Vikram', role: 'an amateur astronomer', trait: 'who loved counting stars through his brass telescope' },
  { name: 'Kavita', role: 'an artist who painted pottery', trait: 'with turquoise and golden glazes' },
  { name: 'Dev', role: 'a friendly librarian', trait: 'who always knew the exact book to recommend' },
];

const STORY_SETTINGS = [
  { place: 'the riverside flower market', time: 'early at sunrise', detail: 'fresh jasmine garlands were blooming' },
  { place: 'the hillside tea bungalow', time: 'on a cool misty morning', detail: 'dew drops glistened on tea leaves' },
  { place: 'the heritage courtyard garden', time: 'under the shade of a grandfather banyan tree', detail: 'parrots were singing above' },
  { place: 'the tranquil village pottery studio', time: 'on a warm summer afternoon', detail: 'the potter wheel was spinning smoothly' },
  { place: 'the cozy town bakery', time: 'just as the morning bread came out of the oven', detail: 'the street smelled of warm honey' },
  { place: 'the serene canal-side walkway', time: 'at twilight as lanterns were lit', detail: 'wooden boats floated quietly by' },
];

const STORY_OBJECTS = [
  { item: 'a brass bell with a carved lotus', found: 'wrapped in a blue silk handkerchief', color: 'golden brass' },
  { item: 'a vintage basket of sweet Alphonso mangoes', found: 'tied with a red velvet ribbon', color: 'sunshine yellow' },
  { item: 'an antique wooden music box', found: 'tucked carefully inside a cedarwood chest', color: 'carved walnut' },
  { item: 'a bouquet of rare blue mountain lilies', found: 'freshly gathered from the high ridge', color: 'deep azure' },
  { item: 'a handwritten recipe book from 1952', found: 'resting on the antique mahogany bookshelf', color: 'aged parchment' },
];

const STORY_HELPERS = [
  { name: 'young Kabir', action: 'arrived on his green bicycle to deliver the morning post' },
  { name: 'cheerful Mrs. Rao', action: 'brought over a jar of freshly squeezed lemonade' },
  { name: 'friendly neighbor Arjun', action: 'offered to help carry the heavy wicker baskets' },
  { name: 'little Priya', action: 'brought a lost grey kitten with white paws to share warmth' },
];

/**
 * Procedurally generates an infinite, real-time story tailored to patient level.
 * Scaling: Level 1 = 2 questions, Level 2 = 3 questions, Level 3 = 4 questions, Level 4+ = 5 questions.
 * Narrative grows richer and longer with each stage.
 */
export function generateProceduralStory(level) {
  const char = STORY_CHARACTERS[rand(STORY_CHARACTERS.length)];
  const setting = STORY_SETTINGS[rand(STORY_SETTINGS.length)];
  const obj = STORY_OBJECTS[rand(STORY_OBJECTS.length)];
  const helper = STORY_HELPERS[rand(STORY_HELPERS.length)];

  const isAdvanced = level >= 3;
  const isExpert = level >= 5;

  let storyParagraphs = [];

  // Scene 1: Introduction
  storyParagraphs.push(
    `One bright day, ${char.name}, ${char.role} ${char.trait}, set out toward ${setting.place} ${setting.time}. As ${char.name} arrived, ${setting.detail}.`
  );

  // Scene 2: The discovery
  storyParagraphs.push(
    `While walking along the cobblestone path, ${char.name} noticed ${obj.item}. It was ${obj.found}, radiating a distinctive ${obj.color} sheen that caught everyone's eye.`
  );

  // Scene 3: The arrival of helper (Levels 2+)
  if (level >= 2) {
    storyParagraphs.push(
      `Just then, ${helper.name} ${helper.action}. Together, they shared warm laughter and decided to celebrate the moment.`
    );
  }

  // Scene 4: Conclusion & memory milestone (Levels 4+)
  if (isAdvanced) {
    const celebratoryTime = level % 2 === 0 ? 'exactly at four in the afternoon' : 'just before the sunset bells rang';
    storyParagraphs.push(
      `They gathered around the wooden porch bench ${celebratoryTime}. ${char.name} smiled warmly and remarked that simple kindness makes every day unforgettable.`
    );
  }

  const fullStory = storyParagraphs.join(' ');
  const title = `${char.name} and the ${obj.item.split(' ').slice(-2).join(' ')}`;

  // Generate Questions dynamically based on elements present in the story
  const candidateQuestions = [
    {
      q: `Who was the main character in the story?`,
      correctAnswer: char.name,
      options: shuffle([char.name, 'Dr. Sharma', 'Inspector Verma', 'Farmer Ramesh']),
    },
    {
      q: `Where did the story take place?`,
      correctAnswer: setting.place.charAt(0).toUpperCase() + setting.place.slice(1),
      options: shuffle([
        setting.place.charAt(0).toUpperCase() + setting.place.slice(1),
        'The crowded city subway station',
        'An empty desert highway',
        'An airport departure gate',
      ]),
    },
    {
      q: `What notable item did ${char.name} discover?`,
      correctAnswer: obj.item.charAt(0).toUpperCase() + obj.item.slice(1),
      options: shuffle([
        obj.item.charAt(0).toUpperCase() + obj.item.slice(1),
        'A bundle of old newspapers',
        'A rusty iron padlock',
        'A pair of reading spectacles',
      ]),
    },
    {
      q: `How was the ${obj.item} described or found?`,
      correctAnswer: obj.found.charAt(0).toUpperCase() + obj.found.slice(1),
      options: shuffle([
        obj.found.charAt(0).toUpperCase() + obj.found.slice(1),
        'Submerged under deep river water',
        'Locked in an iron vault',
        'Covered in thick dust on a roof',
      ]),
    },
  ];

  if (level >= 2) {
    candidateQuestions.push({
      q: `Who arrived to help and share the moment?`,
      correctAnswer: helper.name,
      options: shuffle([helper.name, 'A mysterious stranger', 'The town mayor', 'A postal clerk']),
    });
  }

  if (isAdvanced) {
    candidateQuestions.push({
      q: `What color or appearance was highlighted for the item?`,
      correctAnswer: obj.color.charAt(0).toUpperCase() + obj.color.slice(1),
      options: shuffle([
        obj.color.charAt(0).toUpperCase() + obj.color.slice(1),
        'Dull charcoal grey',
        'Bright neon pink',
        'Faded brown cardboard',
      ]),
    });
  }

  // Question count scales with stage: Level 1=2, Level 2=3, Level 3=4, Level 4+=5
  const targetQuestionCount = clamp(2 + Math.floor((level - 1) / 1.5), 2, 5);
  const questions = candidateQuestions.slice(0, targetQuestionCount);

  return {
    title,
    story: fullStory,
    questions,
    level,
    wordCount: fullStory.split(' ').length,
  };
}

// =============================================================================
// 5. FACE & PLACE - Independent Randomized Matching Engine (40+ Roles)
// =============================================================================

export const FACE_PLACE_MASTER = [
  { face: '👨‍🍳', name: 'Master Chef', place: '🍳', location: 'Commercial Kitchen', hint: 'Prepares delicious culinary dishes' },
  { face: '👩‍⚕️', name: 'Caring Doctor', place: '🏥', location: 'Community Hospital', hint: 'Treats patients and helps healing' },
  { face: '👨‍🏫', name: 'School Teacher', place: '🏫', location: 'Elementary School', hint: 'Educates children in classrooms' },
  { face: '👩‍🌾', name: 'Organic Farmer', place: '🌾', location: 'Golden Harvest Farm', hint: 'Grows vegetables and crops' },
  { face: '👨‍✈️', name: 'Airline Pilot', place: '✈️', location: 'International Airport', hint: 'Navigates passenger flights in the skies' },
  { face: '👩‍🎨', name: 'Fine Artist', place: '🎨', location: 'Art Gallery & Studio', hint: 'Paints vibrant canvas masterpieces' },
  { face: '👨‍🚒', name: 'Brave Firefighter', place: '🚒', location: 'City Fire Station', hint: 'Drives fire rescue engines' },
  { face: '👩‍🔬', name: 'Research Scientist', place: '🔬', location: 'Chemistry Laboratory', hint: 'Conducts science experiments' },
  { face: '👨‍🦳', name: 'Loving Grandfather', place: '🏠', location: 'Cozy Family Home', hint: 'Relaxes in his favorite armchair' },
  { face: '👩‍🚀', name: 'Astronaut', place: '🚀', location: 'Orbital Space Station', hint: 'Explores outer space zero-gravity' },
  { face: '👨‍🔧', name: 'Auto Mechanic', place: '🔧', location: 'Vehicle Garage', hint: 'Repairs engines and cars' },
  { face: '👩‍⚖️', name: 'Presiding Judge', place: '⚖️', location: 'Supreme Courthouse', hint: 'Upholds fair justice and law' },
  { face: '👨‍🎤', name: 'Concert Singer', place: '🎵', location: 'Musical Auditorium', hint: 'Performs live songs on stage' },
  { face: '👩‍💻', name: 'Software Engineer', place: '💻', location: 'Tech Innovation Hub', hint: 'Develops helpful computer programs' },
  { face: '👨‍🦱', name: 'Quiet Librarian', place: '📚', location: 'Public Reading Library', hint: 'Organizes rows of knowledge books' },
  { face: '👩‍🌾', name: 'Botanical Gardener', place: '🪴', location: 'Floral Greenhouse', hint: 'Nurtures orchids and flowering shrubs' },
  { face: '👨‍✈️', name: 'Sea Captain', place: '🚢', location: 'Harbor Shipping Port', hint: 'Guides large ships across oceans' },
  { face: '👩‍🍳', name: 'Pastry Baker', place: '🥐', location: 'Artisan Bakery', hint: 'Bakes fresh warm breads and pastries' },
  { face: '👨‍🎨', name: 'Ceramic Potter', place: '🏺', location: 'Clay Pottery Kiln', hint: 'Shapes clay vessels on the wheel' },
  { face: '👩‍⚕️', name: 'Gentle Nurse', place: '💊', location: 'Wellness Clinic', hint: 'Administers daily medical care' },
];

/**
 * Generates Face & Place round with INDEPENDENT random layout.
 * Ensures the places are completely decoupled in order and position from the faces!
 */
function generateFacePlacePairs(level) {
  // Pair count: Level 1=3 pairs, Level 2=4, Level 3=5, Level 4+=6 (up to 8)
  const count = clamp(3 + Math.floor((level - 1) / 1.5), 3, 7);

  // Pick unique items from the pool
  const selectedPairs = sample(FACE_PLACE_MASTER, count);

  // Independently shuffle faces and places so their order in the UI is NEVER identical!
  const shuffledFaces = shuffle(selectedPairs.map((p, idx) => ({ ...p, originalIdx: idx })));
  let shuffledPlaces = shuffle(selectedPairs.map((p, idx) => ({ ...p, originalIdx: idx })));

  // Guard: Ensure slot i in places is NOT the match for slot i in faces
  let guard = 0;
  while (shuffledPlaces.some((pl, i) => pl.face === shuffledFaces[i].face) && guard < 10) {
    shuffledPlaces = shuffle(shuffledPlaces);
    guard++;
  }

  return {
    pairs: selectedPairs,
    shuffledFaces,
    shuffledPlaces,
    level,
  };
}

// =============================================================================
// 6. CARD FLIP (Memory Match with Infinite Procedural Sets)
// =============================================================================

const CARD_POOL = [
  '🐘', '🦏', '🦁', '🐯', '🐒', '🦋', '🐝', '🐞',
  '🌸', '🌺', '🌻', '🌾', '🌳', '🌈', '☀️', '🌙',
  '⭐', '🍎', '🍌', '🍇', '🥭', '🥥', '🪕', '🥁',
  '🎨', '🎭', '🎪', '🎯', '🎲', '🎰', '🎸', '🎺',
  '🏀', '⚽', '🎾', '🏓', '🍕', '🍔', '🌮', '🍩',
  '🚗', '✈️', '⛵', '🚂', '🚲', '🚁', '🚀', '🏡',
];

function generateCardFlipGrid(level) {
  // Pairs grow: Level 1=3 pairs (6 cards), Level 2=4 pairs (8 cards), Level 3=6 pairs (12 cards), Level 4=8 pairs (16 cards)
  const pairCount = clamp(3 + Math.floor((level - 1) / 1.5), 3, 8);
  const selectedEmojis = sample(CARD_POOL, pairCount);

  const cards = [];
  selectedEmojis.forEach((emoji, idx) => {
    cards.push({ id: `c-${idx}-a`, emoji, pairId: idx });
    cards.push({ id: `c-${idx}-b`, emoji, pairId: idx });
  });

  const shuffledCards = shuffle(cards);
  // Time limit gives generous breathing room for dementia patients (25s + 6s per pair)
  const timeLimit = 25 + pairCount * 6;

  return {
    cards: shuffledCards,
    pairs: pairCount,
    timeLimit,
    level,
  };
}

// =============================================================================
// Export Service
// =============================================================================

const AIGameService = {
  generateMemorySequence,
  generateRoutine,
  generatePattern,
  generateStory: generateProceduralStory,
  generateFacePlacePairs,
  generateCardFlipGrid,
};

export default AIGameService;
