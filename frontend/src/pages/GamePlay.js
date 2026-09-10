import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Brain, Clock, Puzzle, BookOpen, Users, Heart,
  Trophy, Coins, Volume2, VolumeX, Flag, HelpCircle, Sparkles, Layers
} from 'lucide-react';
import Confetti from 'react-confetti';
import AIGameService from '../utils/aiGameService';
import GameHistoryService from '../services/GameHistoryService';
// =============================================================================
// SOUND ENGINE — synthesized with the Web Audio API so it never depends on
// an external file/URL (which is why sounds used to silently fail before).
// =============================================================================

function useSoundEngine(isMuted) {
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctxRef.current = new AudioCtx();
    }
    if (ctxRef.current && ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((freq, duration = 0.15, type = 'sine', delay = 0, gainVal = 0.16) => {
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = gainVal;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t = ctx.currentTime + delay;
    osc.start(t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.stop(t + duration + 0.03);
  }, [getCtx]);

  const playSound = useCallback((type) => {
    if (isMuted) return;
    try {
      switch (type) {
        case 'correct':
          playTone(880, 0.12, 'sine');
          playTone(1174, 0.16, 'sine', 0.08);
          break;
        case 'wrong':
          playTone(220, 0.25, 'sawtooth');
          break;
        case 'levelup':
          [523, 659, 784, 1047].forEach((f, i) => playTone(f, 0.18, 'triangle', i * 0.09));
          break;
        case 'coin':
          playTone(1568, 0.08, 'square');
          playTone(2093, 0.1, 'square', 0.06);
          break;
        case 'checkpoint':
          [659, 880, 1175].forEach((f, i) => playTone(f, 0.15, 'sine', i * 0.07));
          break;
        case 'gameover':
          [392, 349, 294, 220].forEach((f, i) => playTone(f, 0.28, 'sawtooth', i * 0.16));
          break;
        default:
          break;
      }
    } catch (e) {
      // Audio can fail silently (e.g. autoplay policies) — never break the game.
    }
  }, [isMuted, playTone]);

  return playSound;
}

// =============================================================================
// PLAYER ENGINE — single source of truth for score / lives / level / coins.
// All six games share this so scoring, checkpoints and the life/coin economy
// behave identically everywhere.
// =============================================================================

const MAX_LIVES = 5;
const CHECKPOINT_EVERY = 5;
const LIFE_COST_IN_COINS = 5;

function usePlayerEngine() {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [checkpointLevel, setCheckpointLevel] = useState(1);
  const [showTutorial, setShowTutorial] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [sessionId, setSessionId] = useState(0);

  const scoreRef = useRef(0);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const playSound = useSoundEngine(isMuted);

  const pushToast = useCallback((message, tone = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  const startPlaying = useCallback(() => {
    setShowTutorial(false);
    setSessionId((s) => s + 1);
  }, []);

  const triggerGameOver = useCallback(() => {
    setGameOver(true);
    setBestScore((b) => Math.max(b, scoreRef.current));
    playSound('gameover');
  }, [playSound]);

  const recordCorrect = useCallback((basePoints) => {
    let awardedPoints = 0;
    setCombo((c) => {
      const newCombo = c + 1;
      const comboBonus = Math.floor(newCombo / 3) * Math.ceil(basePoints / 2);
      awardedPoints = basePoints * level + comboBonus;
      setScore((s) => s + awardedPoints);
      if (newCombo > 0 && newCombo % 4 === 0 && Math.random() < 0.35) {
        const bonus = 1 + Math.floor(Math.random() * 2);
        setCoins((c2) => c2 + bonus);
        pushToast(`🪙 Combo bonus! +${bonus} coin${bonus > 1 ? 's' : ''}`, 'coin');
      }
      return newCombo;
    });
    playSound('correct');
    return awardedPoints;
  }, [level, playSound, pushToast]);

  const levelUp = useCallback(() => {
    playSound('levelup');
    setShowCelebration(true);
    setLevel((l) => {
      const newLevel = l + 1;
      if (newLevel % CHECKPOINT_EVERY === 0) {
        setCheckpointLevel(newLevel);
        setLives((li) => Math.min(li + 1, MAX_LIVES));
        setTimeout(() => {
          pushToast(`🚩 Checkpoint! Level ${newLevel} saved — +1 life`, 'checkpoint');
          playSound('checkpoint');
        }, 250);
      }
      return newLevel;
    });
    
    // Save game history on level up
    try {
      const gameId = window.location.pathname.split('/game/')[1] || 'unknown';
      const gameNames = {
        '1': 'Memory Lane',
        '2': 'Routine Builder',
        '3': 'Pattern Quest',
        '4': 'Story Weaver',
        '5': 'Face & Place',
        '6': 'Mindful Moments',
        'gesture-drawing': 'Gesture Drawing'
      };
      GameHistoryService.saveSession({
        gameId: gameId,
        gameName: gameNames[gameId] || 'Unknown Game',
        score: scoreRef.current,
        level: level,
        lives: lives,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.log('History save error:', e);
    }

    if (Math.random() < 0.18) {
      const bonus = 1 + Math.floor(Math.random() * 3);
      setTimeout(() => {
        setCoins((c) => c + bonus);
        pushToast(`🎉 Lucky find! +${bonus} coins`, 'coin');
        playSound('coin');
      }, 400);
    }
    setTimeout(() => setShowCelebration(false), 1800);
    setSessionId((s) => s + 1);
  }, [playSound, pushToast, level, lives]);

  const recordWrong = useCallback(() => {
    setCombo(0);
    playSound('wrong');
    setLives((l) => {
      const newLives = l - 1;
      if (newLives <= 0) {
        triggerGameOver();
        return 0;
      }
      pushToast(`❌ Not quite — ${newLives} ${newLives === 1 ? 'life' : 'lives'} left`, 'wrong');
      return newLives;
    });
    setSessionId((s) => s + 1);
  }, [playSound, pushToast, triggerGameOver]);

  const useCoinToSaveLife = useCallback(() => {
    if (lives >= MAX_LIVES) {
      pushToast('❤️ You already have full lives!', 'info');
      return;
    }
    if (coins < LIFE_COST_IN_COINS) {
      pushToast(`🪙 Need ${LIFE_COST_IN_COINS} coins to restore a life`, 'info');
      return;
    }
    setCoins((c) => c - LIFE_COST_IN_COINS);
    setLives((l) => Math.min(l + 1, MAX_LIVES));
    playSound('coin');
    pushToast('💚 Life restored!', 'coin');
  }, [coins, lives, playSound, pushToast]);

  const restart = useCallback((fromCheckpoint) => {
    setScore(0);
    setCombo(0);
    setLives(3);
    setGameOver(false);
    setLevel(fromCheckpoint ? checkpointLevel : 1);
    if (!fromCheckpoint) setCheckpointLevel(1);
    setSessionId((s) => s + 1);
  }, [checkpointLevel]);

  const toggleMute = useCallback(() => setIsMuted((m) => !m), []);

  return {
    score, bestScore, coins, level, lives, maxLives: MAX_LIVES, combo,
    checkpointLevel, showTutorial, gameOver, showCelebration, isMuted, toasts,
    sessionId, startPlaying, recordCorrect, recordWrong, levelUp,
    useCoinToSaveLife, restart, toggleMute, pushToast, playSound,
  };
}

// =============================================================================
// SHARED UI PIECES
// =============================================================================

const THEMES = {
  1: { name: 'Memory Lane', from: '#3b82f6', to: '#06b6d4', accent: '#2563eb' },
  2: { name: 'Routine Builder', from: '#a855f7', to: '#ec4899', accent: '#9333ea' },
  3: { name: 'Pattern Quest', from: '#22c55e', to: '#10b981', accent: '#16a34a' },
  4: { name: 'Story Weaver', from: '#f97316', to: '#ef4444', accent: '#ea580c' },
  5: { name: 'Face & Place', from: '#6366f1', to: '#8b5cf6', accent: '#4f46e5' },
  6: { name: 'Card Flip', from: '#8b5cf6', to: '#a855f7', accent: '#7c3aed' },
  7: { name: 'Mindful Moments', from: '#f43f5e', to: '#ec4899', accent: '#e11d48' },
};

// Slowly-drifting soft gradient blobs behind every game. Pure CSS, no
// external assets, respects prefers-reduced-motion.
const DynamicBackground = ({ theme }) => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
    <div
      className="absolute -top-24 -left-16 w-72 h-72 rounded-full opacity-30 blur-3xl gp-blob-a"
      style={{ background: theme.from }}
    />
    <div
      className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full opacity-25 blur-3xl gp-blob-b"
      style={{ background: theme.to }}
    />
  </div>
);

const GlobalGameStyles = () => (
  <style>{`
    @keyframes gpBlobA { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,20px) scale(1.15); } }
    @keyframes gpBlobB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-25px,-15px) scale(1.1); } }
    .gp-blob-a { animation: gpBlobA 14s ease-in-out infinite; }
    .gp-blob-b { animation: gpBlobB 17s ease-in-out infinite; }
    @keyframes gpDemoPulse { 0%,72%,100% { transform: scale(1); filter: brightness(1); } 12%,24% { transform: scale(1.28); filter: brightness(1.25); } }
    .gp-demo-pulse { animation: gpDemoPulse 3.2s ease-in-out infinite; }
    @keyframes gpToastIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    .gp-toast { animation: gpToastIn 0.2s ease-out; }
    @media (prefers-reduced-motion: reduce) {
      .gp-blob-a, .gp-blob-b, .gp-demo-pulse { animation: none; }
    }
  `}</style>
);

const ToastStack = ({ toasts }) => {
  if (!toasts.length) return null;
  const toneColor = {
    info: 'bg-gray-800',
    wrong: 'bg-red-600',
    coin: 'bg-yellow-500',
    checkpoint: 'bg-indigo-600',
  };
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-2 w-[90%] max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`gp-toast text-white text-center font-semibold px-4 py-3 rounded-xl shadow-lg ${toneColor[t.tone] || toneColor.info}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
};

const GameHeader = ({ engine }) => (
  <div className="flex flex-wrap justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow gap-4">
    <div className="flex items-center space-x-4 flex-wrap">
      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">⭐ Score: {engine.score}</span>
      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">📊 Level: {engine.level}</span>
      {engine.combo > 0 && <span className="text-lg font-bold text-orange-500">🔥 {engine.combo}x Combo</span>}
      <span className="flex items-center text-sm font-semibold text-indigo-500 dark:text-indigo-300">
        <Flag className="w-4 h-4 mr-1" /> Checkpoint: Lvl {engine.checkpointLevel}
      </span>
    </div>
    <div className="flex items-center space-x-3 flex-wrap">
      <span className="text-lg font-bold text-red-500">
        {'❤️'.repeat(engine.lives)}{'🤍'.repeat(engine.maxLives - engine.lives)}
      </span>
      <span className="text-lg font-bold text-yellow-500 flex items-center">
        <Coins className="w-5 h-5 mr-1" /> {engine.coins}
      </span>
      <button
        onClick={engine.useCoinToSaveLife}
        className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm font-bold hover:bg-yellow-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={engine.coins < LIFE_COST_IN_COINS || engine.lives >= engine.maxLives}
        title={`Use ${LIFE_COST_IN_COINS} coins to restore a life`}
      >
        💚 Save Life ({LIFE_COST_IN_COINS}🪙)
      </button>
      <button
        onClick={engine.toggleMute}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        title={engine.isMuted ? 'Unmute sounds' : 'Mute sounds'}
      >
        {engine.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    </div>
  </div>
);

// A tiny looping animation used inside each tutorial to actually *show* an
// example instead of only describing one in words.
const HowToPlayDemo = ({ items, caption }) => (
  <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4">
    <div className="flex justify-center items-center gap-3 flex-wrap mb-2">
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {it === '→' ? (
            <span className="text-2xl text-gray-400">→</span>
          ) : (
            <div className="gp-demo-pulse text-4xl" style={{ animationDelay: `${i * 0.35}s` }}>{it}</div>
          )}
        </React.Fragment>
      ))}
    </div>
    <p className="text-center text-sm text-gray-500 dark:text-gray-400">{caption}</p>
  </div>
);

const TutorialScreen = ({ gameName, instructions, demo, onStart }) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">
        🎯 {t('tutorials.howToPlay')} {gameName}
      </h2>
      {demo && <div className="mb-6">{demo}</div>}
      <div className="space-y-3 mb-8">
        {instructions.map((instruction, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-2xl">{instruction.split(' ')[0]}</span>
            <p className="text-lg">{instruction.substring(instruction.indexOf(' ') + 1)}</p>
          </div>
        ))}
      </div>
      <button
        onClick={onStart}
        className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xl font-bold transition-colors"
      >
        🚀 {t('tutorials.startPlaying')}
      </button>
    </div>
  );
};

const GameOverScreen = ({ engine }) => (
  <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
    <div className="text-6xl mb-4">😅</div>
    <h2 className="text-3xl font-bold text-red-500 mb-4">Game Over!</h2>
    <p className="text-xl mb-2">Final Score: {engine.score}</p>
    <p className="text-xl mb-2">Level Reached: {engine.level}</p>
    {engine.bestScore > 0 && <p className="text-lg mb-2 text-gray-500">Best Score: {engine.bestScore}</p>}
    <p className="text-xl mb-6">Coins Saved: {engine.coins} 🪙</p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      {engine.checkpointLevel > 1 && (
        <button
          onClick={() => engine.restart(true)}
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
        >
          🚩 Continue from Checkpoint (Level {engine.checkpointLevel})
        </button>
      )}
      <button
        onClick={() => engine.restart(false)}
        className="px-8 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-colors"
      >
        🔁 Start Over (Level 1)
      </button>
    </div>
  </div>
);

// =============================================================================
// GAME 1: MEMORY LANE
// =============================================================================

const CLICKABLE_MEMORY_TILES = ['🐘', '🦏', '🦁', '🐯', '🐒', '🦋', '🐝', '🐞', '🌸', '🌺',
   '🌻', '🌾', '🌳', '🌈', '☀️', '🌙', '⭐', '🍎', '🍌', '🍇', '🥭', '🥥', '🪕', '🥁'];

const MemoryLane = ({ engine }) => {
  const { t } = useTranslation();
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [isShowing, setIsShowing] = useState(true);
  const [availableTiles, setAvailableTiles] = useState([]);

  useEffect(() => {
    if (engine.showTutorial) return;
    const newSequence = AIGameService.generateMemorySequence(engine.level);
    setSequence(newSequence);
    setUserSequence([]);
    setIsShowing(true);

    // Build the clickable tiles from the sequence itself plus some distractors
    // This guarantees every item in the sequence IS clickable.
    const uniqueSequenceItems = [...new Set(newSequence)];
    const pool = CLICKABLE_MEMORY_TILES.filter(e => !uniqueSequenceItems.includes(e));
    // Add enough distractors so the grid has at least 12 tiles for variety
    const minTiles = 12;
    const neededDistractors = Math.max(0, minTiles - uniqueSequenceItems.length);
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    const distractors = shuffledPool.slice(0, neededDistractors);

    // Combine sequence items + distractors, then shuffle so position varies
    const combined = [...uniqueSequenceItems, ...distractors]
      .sort(() => Math.random() - 0.5);

    setAvailableTiles(combined);

    const t = setTimeout(() => setIsShowing(false), 1800 + newSequence.length * 400);
    return () => clearTimeout(t);
  }, [engine.sessionId, engine.showTutorial, engine.level]);

  const handleEmojiClick = (emoji) => {
    if (isShowing || engine.gameOver) return;
    const position = userSequence.length;
    const newUserSeq = [...userSequence, emoji];
    setUserSequence(newUserSeq);

    if (emoji !== sequence[position]) {
      engine.recordWrong();
      return;
    }

    if (newUserSeq.length === sequence.length) {
      engine.recordCorrect(10);
      engine.levelUp();
    }
  };

  if (engine.gameOver) return <GameOverScreen engine={engine} />;

if (engine.showTutorial) {
    return (
      <TutorialScreen
        gameName={t('games.memoryLane')}
        demo={<HowToPlayDemo items={['🐘', '🌸', '⭐']} caption={t('tutorials.memoryLane.demo')} />}
        instructions={[
          t('tutorials.memoryLane.step1'),
          t('tutorials.memoryLane.step2'),
          t('tutorials.memoryLane.step3'),
          t('tutorials.memoryLane.step4'),
          t('tutorials.memoryLane.step5'),
        ]}
        onStart={engine.startPlaying}
      />
    );
  }

  return (
    <div className="space-y-6">
      <GameHeader engine={engine} />
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
        <p className="text-xl">{isShowing ? '👀 Watch the sequence!' : '🔄 Repeat the sequence!'}</p>
        <p className="text-sm text-gray-500">Items: {sequence.length} | Combo: {engine.combo}x</p>
      </div>
      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        {isShowing
          ? sequence.map((emoji, index) => (
            <div key={index} className="text-6xl p-4 bg-white dark:bg-gray-700 rounded-lg shadow text-center animate-pulse">
              {emoji}
            </div>
          ))
          : availableTiles.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleEmojiClick(emoji)}
              className="text-6xl p-4 bg-white dark:bg-gray-700 rounded-lg shadow hover:scale-110 transition-transform hover:shadow-xl"
              disabled={userSequence.length >= sequence.length}
            >
              {emoji}
            </button>
          ))}
      </div>
      <div className="text-center">Progress: {userSequence.length}/{sequence.length}</div>
    </div>
  );
};

// =============================================================================
// GAME 2: ROUTINE BUILDER
// =============================================================================

const RoutineBuilder = ({ engine }) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState('learn');
  const [themeName, setThemeName] = useState('');
  const [tasks, setTasks] = useState([]);
  const [correctOrder, setCorrectOrder] = useState([]);
  const [hints, setHints] = useState([]);
  const [message, setMessage] = useState('');
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (engine.showTutorial) return;
    const round = AIGameService.generateRoutine(engine.level);
    setThemeName(round.themeName);
    setCorrectOrder(round.steps);
    setHints(round.hints);
    setTasks(shuffleArray(round.steps));
    setPhase('learn');
    setMessage('');
    setShowHint(false);
  }, [engine.sessionId, engine.showTutorial, engine.level]);

  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    if (a.every((x, i) => x === arr[i]) && a.length > 1) {
      [a[0], a[1]] = [a[1], a[0]];
    }
    return a;
  }

  const beginArranging = () => {
    setTasks(shuffleArray(correctOrder));
    setPhase('arrange');
  };

  const handleDragStart = (e, index) => e.dataTransfer.setData('index', index);
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('index'), 10);
    const newTasks = [...tasks];
    const [removed] = newTasks.splice(sourceIndex, 1);
    newTasks.splice(targetIndex, 0, removed);
    setTasks(newTasks);
  };

  const checkOrder = () => {
    const isCorrect = tasks.every((task, i) => task === correctOrder[i]);
    if (isCorrect) {
      const points = engine.recordCorrect(20);
      setMessage(`✅ Perfect order! +${points} points`);
      engine.levelUp();
    } else {
      const correctCount = tasks.filter((task, i) => task === correctOrder[i]).length;
      setMessage(`❌ Only ${correctCount}/${correctOrder.length} in the right place. Let's try a new one.`);
      engine.recordWrong();
    }
  };

  if (engine.gameOver) return <GameOverScreen engine={engine} />;

  if (engine.showTutorial) {
    return (
      <TutorialScreen
        gameName={t('games.routineBuilder')}
        demo={<HowToPlayDemo items={['⏰', '🪥', '🍳']} caption={t('tutorials.routineBuilder.demo')} />}
        instructions={[
          t('tutorials.routineBuilder.step1'),
          t('tutorials.routineBuilder.step2'),
          t('tutorials.routineBuilder.step3'),
          t('tutorials.routineBuilder.step4'),
          t('tutorials.routineBuilder.step5'),
        ]}
        onStart={engine.startPlaying}
      />
    );
  }

  if (phase === 'learn') {
    return (
      <div className="space-y-6">
        <GameHeader engine={engine} />
        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
          <h3 className="text-2xl font-bold text-center mb-1">📖 Learn: {themeName}</h3>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-4">Here is the correct order — and why each step comes when it does.</p>
          <div className="space-y-2 max-w-lg mx-auto">
            {correctOrder.map((task, index) => (
              <div key={index} className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow">
                <div className="flex items-center">
                  <span className="w-8 text-center font-bold text-purple-500">{index + 1}</span>
                  <span className="text-lg">{task}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-8 mt-1">{hints[index]}</p>
              </div>
            ))}
          </div>
          <button
            onClick={beginArranging}
            className="mt-6 w-full py-3 bg-primary-600 text-white rounded-lg text-lg font-bold hover:bg-primary-700 transition-colors"
          >
            🔀 I've Got It — Shuffle & Start!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GameHeader engine={engine} />
      {message && (
        <div className={`text-center text-xl font-bold ${message.includes('✅') ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </div>
      )}
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
        <p className="text-center text-lg">🎯 Drag to arrange "{themeName}" in the correct order, then check your answer</p>
      </div>
      <div className="space-y-2 max-w-md mx-auto">
        {tasks.map((task, index) => (
          <div
            key={task}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, index)}
            className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow cursor-move hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-lg"
          >
            <span className="inline-block w-8 text-center font-bold text-gray-400">{index + 1}</span>
            {task}
          </div>
        ))}
      </div>
      {showHint && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center text-yellow-700 dark:text-yellow-300 max-w-md mx-auto">
          💡 {hints[correctOrder.findIndex((t, i) => tasks[i] !== t) === -1 ? 0 : correctOrder.findIndex((t, i) => tasks[i] !== t)]}
        </div>
      )}
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={checkOrder}
          className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
        >
          ✅ Check My Order
        </button>
        <button
          onClick={() => setShowHint(true)}
          className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 transition-colors flex items-center"
        >
          <HelpCircle className="w-5 h-5 mr-2" /> Need a Hint
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// GAME 3: PATTERN QUEST
// =============================================================================

const PatternQuest = ({ engine }) => {
  const { t } = useTranslation();
  const [pattern, setPattern] = useState([]);
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (engine.showTutorial) return;
    const result = AIGameService.generatePattern(engine.level);
    setPattern(result.pattern);
    setOptions(result.options);
    setCorrectAnswer(result.correctAnswer);
    setSelected(null);
    setMessage('');
  }, [engine.sessionId, engine.showTutorial, engine.level]);

  const handleOptionClick = (option) => {
    if (selected) return;
    setSelected(option);
    if (option === correctAnswer) {
      const points = engine.recordCorrect(15);
      setMessage(`✅ Correct! +${points} points!`);
      setTimeout(() => engine.levelUp(), 700);
    } else {
      setMessage('❌ Not quite — here comes a new pattern!');
      engine.recordWrong();
    }
  };

  if (engine.gameOver) return <GameOverScreen engine={engine} />;

  if (engine.showTutorial) {
    return (
      <TutorialScreen
        gameName={t('games.patternQuest')}
        demo={<HowToPlayDemo items={['🔴', '🔵', '🔴', '🔵', '❓']} caption={t('tutorials.patternQuest.demo')} />}
        instructions={[
          t('tutorials.patternQuest.step1'),
          t('tutorials.patternQuest.step2'),
          t('tutorials.patternQuest.step3'),
          t('tutorials.patternQuest.step4'),
          t('tutorials.patternQuest.step5'),
        ]}
        onStart={engine.startPlaying}
      />
    );
  }

  return (
    <div className="space-y-6">
      <GameHeader engine={engine} />
      {message && (
        <div className={`text-center text-2xl font-bold ${message.includes('✅') ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </div>
      )}
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <p className="text-center text-lg">🧩 What comes next in the pattern?</p>
      </div>
      <div className="flex justify-center gap-4 text-6xl p-8 bg-white dark:bg-gray-700 rounded-lg shadow max-w-lg mx-auto flex-wrap">
        {pattern.map((item, index) => (
          <div key={index} className={item === '?' ? 'opacity-50 animate-pulse' : ''}>{item}</div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            disabled={selected !== null}
            className={`text-5xl p-4 bg-white dark:bg-gray-700 rounded-lg shadow hover:scale-110 transition-transform ${selected === option ? 'ring-4 ring-blue-500' : ''}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// GAME 4: STORY WEAVER
// =============================================================================

const StoryWeaver = ({ engine }) => {
  const { t } = useTranslation();
  const [storyData, setStoryData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showStory, setShowStory] = useState(true);

  useEffect(() => {
    if (engine.showTutorial) return;
    setStoryData(AIGameService.generateStory(engine.level));
    setCurrentQuestion(0);
    setShowStory(true);
  }, [engine.sessionId, engine.showTutorial, engine.level]);

  const handleAnswer = (option) => {
    const question = storyData.questions[currentQuestion];
    if (option === question.correctAnswer) {
      engine.recordCorrect(10);
      if (currentQuestion < storyData.questions.length - 1) {
        setCurrentQuestion((q) => q + 1);
      } else {
        engine.levelUp();
      }
    } else {
      engine.recordWrong();
    }
  };

  if (engine.gameOver) return <GameOverScreen engine={engine} />;

  if (engine.showTutorial) {
    return (
      <TutorialScreen
        gameName={t('games.storyWeaver')}
        demo={<HowToPlayDemo items={['📖', '→', '❓']} caption={t('tutorials.storyWeaver.demo')} />}
        instructions={[
          t('tutorials.storyWeaver.step1'),
          t('tutorials.storyWeaver.step2'),
          t('tutorials.storyWeaver.step3'),
          t('tutorials.storyWeaver.step4'),
          t('tutorials.storyWeaver.step5'),
        ]}
        onStart={engine.startPlaying}
      />
    );
  }

  if (!storyData) return <div className="text-center p-8">Loading...</div>;

  const question = storyData.questions[currentQuestion];

  return (
    <div className="space-y-6">
      <GameHeader engine={engine} />
      <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">📖 {storyData.title}</h3>
          <span className="text-sm text-gray-500">Question {currentQuestion + 1} of {storyData.questions.length}</span>
        </div>
        {showStory ? (
          <>
            <p className="text-lg leading-relaxed">{storyData.story}</p>
            <button
              onClick={() => setShowStory(false)}
              className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Start Questions
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-lg font-semibold">{question.q}</p>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className="w-full p-4 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-left transition-colors text-lg"
                >
                  {String.fromCharCode(65 + index)}. {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// GAME 5: FACE & PLACE - Infinite AI-Generated Stages (FIXED)
// =============================================================================

const FacePlace = ({ engine }) => {
  const { t } = useTranslation();
  const [pairs, setPairs] = useState([]);
  const [selectedFace, setSelectedFace] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]); // Store matched pairs
  const [message, setMessage] = useState('');
  const [levelDisplay, setLevelDisplay] = useState(1);
  const [localGameOver, setLocalGameOver] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hint, setHint] = useState('');
  const [showHint, setShowHint] = useState(false);

  // Generate new pairs whenever level changes
  useEffect(() => {
    if (engine.showTutorial) return;
    generateNewPairs();
  }, [engine.sessionId, engine.showTutorial]);

  const generateNewPairs = () => {
    const newPairs = AIGameService.generateFacePlacePairs(engine.level);
    setPairs(newPairs);
    setMatchedPairs([]);
    setSelectedFace(null);
    setSelectedPlace(null);
    setMessage('');
    setHint('');
    setWrongAttempts(0);
    setShowHint(false);
    setLevelDisplay(engine.level);
  };

  const handleFaceClick = (face) => {
    // Don't allow clicking already matched faces
    if (matchedPairs.some(p => p.face === face)) return;
    setSelectedFace(selectedFace === face ? null : face);
    setMessage('');
    setHint('');
  };

  const handlePlaceClick = (place) => {
    // Don't allow clicking already matched places
    if (matchedPairs.some(p => p.place === place)) return;
    setSelectedPlace(selectedPlace === place ? null : place);
    setMessage('');
    setHint('');
  };

  // Auto-check when both are selected
  useEffect(() => {
    if (!selectedFace || !selectedPlace) return;

    const timer = setTimeout(() => {
      // Find the pair where face matches selectedFace AND place matches selectedPlace
      const matchedPair = pairs.find(p => p.face === selectedFace && p.place === selectedPlace);

      if (matchedPair) {
        // ✅ CORRECT MATCH!
        setWrongAttempts(0);
        const points = engine.recordCorrect(10 + Math.floor(engine.level / 2));
        setMessage(`✅ ${matchedPair.name} belongs at the ${matchedPair.location}! +${points} points!`);

        setMatchedPairs(prev => {
          const next = [...prev, matchedPair];
          // Check if all pairs are matched
          if (next.length === pairs.length) {
            // Level complete!
            setTimeout(() => {
              engine.levelUp();
              generateNewPairs();
            }, 1500);
          }
          return next;
        });

        setSelectedFace(null);
        setSelectedPlace(null);
        setTimeout(() => setMessage(''), 2000);
      } else {
        // ❌ WRONG MATCH!
        setWrongAttempts(prev => prev + 1);
        setMessage('❌ Not a match! Try again.');

        // Provide hint after 1 wrong attempt
        if (wrongAttempts >= 1) {
          // Find which place belongs to the selected face
          const correctPair = pairs.find(p => p.face === selectedFace);
          if (correctPair && !matchedPairs.includes(correctPair)) {
            setHint(`💡 Hint: ${selectedFace} belongs with "${correctPair.place}" (${correctPair.location})`);
            setShowHint(true);
          }
        }

        // Lose a life
        engine.recordWrong();

        setSelectedFace(null);
        setSelectedPlace(null);
        setTimeout(() => {
          setMessage('');
          setHint('');
          setShowHint(false);
        }, 2000);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [selectedFace, selectedPlace, pairs, matchedPairs, wrongAttempts]);

  if (localGameOver || engine.gameOver) {
    return <GameOverScreen engine={engine} />;
  }

 if (engine.showTutorial) {
    return (
      <TutorialScreen
        gameName={t('games.facePlace')}
        demo={<HowToPlayDemo items={['👨‍🍳', '→', '🍳']} caption={t('tutorials.facePlace.demo')} />}
        instructions={[
          t('tutorials.facePlace.step1'),
          t('tutorials.facePlace.step2'),
          t('tutorials.facePlace.step3'),
          t('tutorials.facePlace.step4'),
          t('tutorials.facePlace.step5'),
          t('tutorials.facePlace.step6'),
        ]}
        onStart={engine.startPlaying}
      />
    );
  }

  // Get available faces and places (not yet matched)
  const availableFaces = pairs.filter(p => !matchedPairs.includes(p));
  const availablePlaces = pairs.filter(p => !matchedPairs.includes(p));

  return (
    <div className="space-y-6">
      <GameHeader engine={engine} />

      {/* Level Display */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold text-primary-600">Level {levelDisplay}</span>
        {' • '}
        <span>Matched: {matchedPairs.length}/{pairs.length}</span>
        {' • '}
        <span>Remaining: {availableFaces.length}</span>
        {engine.combo >= 3 && <span className="ml-2 text-yellow-500">🔥 {engine.combo}x Combo!</span>}
      </div>

      {message && (
        <div className={`text-center text-xl font-bold ${
          message.includes('✅') ? 'text-green-500' : 'text-red-500'
        }`}>
          {message}
        </div>
      )}

      {showHint && hint && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center text-yellow-700 dark:text-yellow-300 text-sm">
          {hint}
        </div>
      )}

      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
        <p className="text-center text-lg">👤 Tap a face, then tap the place where they work</p>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {availableFaces.length} pairs remaining
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Faces Column */}
        <div>
          <h3 className="text-center font-bold mb-3 text-gray-700 dark:text-gray-300">👤 People</h3>
          <div className="grid grid-cols-2 gap-3">
            {availableFaces.map((pair, index) => (
              <button
                key={`face-${index}`}
                onClick={() => handleFaceClick(pair.face)}
                className={`flex flex-col items-center p-3 bg-white dark:bg-gray-700 rounded-xl shadow hover:scale-105 transition-all ${
                  selectedFace === pair.face ? 'ring-4 ring-blue-500 scale-105 shadow-lg' : ''
                }`}
              >
                <span className="text-5xl">{pair.face}</span>
                <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">{pair.name}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">{pair.faceDescription}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Places Column */}
        <div>
          <h3 className="text-center font-bold mb-3 text-gray-700 dark:text-gray-300">📍 Places</h3>
          <div className="grid grid-cols-2 gap-3">
            {availablePlaces.map((pair, index) => (
              <button
                key={`place-${index}`}
                onClick={() => handlePlaceClick(pair.place)}
                className={`flex flex-col items-center p-3 bg-white dark:bg-gray-700 rounded-xl shadow hover:scale-105 transition-all ${
                  selectedPlace === pair.place ? 'ring-4 ring-blue-500 scale-105 shadow-lg' : ''
                }`}
              >
                <span className="text-5xl">{pair.place}</span>
                <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">{pair.location}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">{pair.placeDescription}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-md mx-auto">
        <div
          className="bg-gradient-to-r from-indigo-500 to-primary-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${pairs.length > 0 ? (matchedPairs.length / pairs.length) * 100 : 0}%` }}
        />
      </div>

      {/* Stats */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-500">
        {wrongAttempts > 0 && <span>⚠️ Wrong attempts: {wrongAttempts} </span>}
        {showHint && <span className="ml-2">💡 Use hints to find the right match!</span>}
      </div>
    </div>
  );
};

// =============================================================================
// GAME 6: CARD FLIP - Infinite Stages with Time Limit
// =============================================================================

const CardFlip = ({ engine }) => {
  const { t } = useTranslation();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]); // indices of currently flipped cards
  const [matched, setMatched] = useState([]); // pairIds that have been matched
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeLimit, setTimeLimit] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [message, setMessage] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // prevent clicking while checking
  const [levelDisplay, setLevelDisplay] = useState(1);
  const timerRef = useRef(null);
  const totalPairsRef = useRef(0);

  // Initialize new stage
  useEffect(() => {
    if (engine.showTutorial) return;
    startNewStage();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [engine.sessionId, engine.showTutorial]);

  const startNewStage = () => {
    const stage = AIGameService.generateCardFlipGrid(engine.level);
    setCards(stage.cards);
    setFlipped([]);
    setMatched([]);
    setWrongAttempts(0);
    setMessage('');
    setIsComplete(false);
    setIsLocked(false);
    setTimeLimit(stage.timeLimit);
    setTimeLeft(stage.timeLimit);
    setLevelDisplay(engine.level);
    totalPairsRef.current = stage.pairs;

    // Clear any existing timer
    if (timerRef.current) clearInterval(timerRef.current);

    // Start countdown
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Time's up!
          setMessage('⏰ Time\'s up!');
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle time up = lose a life, restart stage
  const handleTimeUp = () => {
    engine.recordWrong();
    setMessage('⏰ Time\'s up! A life was lost.');
    // Give a moment to see the message, then restart stage
    setTimeout(() => {
      if (!engine.gameOver) {
        startNewStage();
      }
    }, 1500);
  };

  // Card click handler
  const handleCardClick = (index) => {
    // Prevent clicking if locked, already flipped, or matched
    if (isLocked) return;
    if (flipped.includes(index)) return;
    if (matched.includes(cards[index].pairId)) return;
    if (isComplete) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    // If two cards are flipped, check match
    if (newFlipped.length === 2) {
      setIsLocked(true);
      const [first, second] = newFlipped;
      const card1 = cards[first];
      const card2 = cards[second];

      if (card1.pairId === card2.pairId) {
        // ✅ MATCH!
        setTimeout(() => {
          const newMatched = [...matched, card1.pairId];
          setMatched(newMatched);
          setFlipped([]);
          setIsLocked(false);

          // Reward: +10 seconds
          setTimeLeft((prev) => prev + 10);
          setMessage('✅ Match! +10 seconds');
          engine.recordCorrect(15);

          // Check if all pairs are matched
          if (newMatched.length === totalPairsRef.current) {
            // Stage complete!
            clearInterval(timerRef.current);
            setMessage('🎉 Stage Complete!');
            setIsComplete(true);
            setTimeout(() => {
              engine.levelUp();
              // startNewStage will be called by sessionId change in useEffect
            }, 1500);
          } else {
            setTimeout(() => setMessage(''), 1200);
          }
        }, 400);
      } else {
        // ❌ NO MATCH
        setWrongAttempts((prev) => prev + 1);
        setTimeout(() => {
          setFlipped([]);
          setIsLocked(false);
          setMessage('❌ Not a match');
          setTimeout(() => setMessage(''), 800);
        }, 800);
      }
    }
  };

  if (engine.gameOver) return <GameOverScreen engine={engine} />;

  // Tutorial
 if (engine.showTutorial) {
    return (
      <TutorialScreen
        gameName={t('games.cardFlip')}
        demo={<HowToPlayDemo items={['🎴', '🔍', '🎴', '✅']} caption={t('tutorials.cardFlip.demo')} />}
        instructions={[
          t('tutorials.cardFlip.step1'),
          t('tutorials.cardFlip.step2'),
          t('tutorials.cardFlip.step3'),
          t('tutorials.cardFlip.step4'),
          t('tutorials.cardFlip.step5'),
          t('tutorials.cardFlip.step6'),
        ]}
        onStart={engine.startPlaying}
      />
    );
  }

  // Time color based on remaining time
  const timeColor = timeLeft <= 10
    ? 'text-red-500 animate-pulse'
    : timeLeft <= 30
      ? 'text-amber-500'
      : 'text-emerald-500';

  const timePercent = timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 0;
  const matchedCount = matched.length;
  const totalPairs = totalPairsRef.current;

  // Determine grid columns based on number of cards
  const cardCount = cards.length;
  let gridCols = 'grid-cols-3';
  if (cardCount > 12) gridCols = 'grid-cols-6';
  else if (cardCount > 8) gridCols = 'grid-cols-5';
  else if (cardCount > 6) gridCols = 'grid-cols-4';

  return (
    <div className="space-y-6">
      <GameHeader engine={engine} />

      {/* Stage Info Bar */}
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 p-4 rounded-2xl border border-violet-100 dark:border-violet-800/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-sm font-bold text-violet-600 dark:text-violet-400 shadow-sm">
              🎴 Level {levelDisplay}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-sm font-bold text-indigo-600 dark:text-indigo-400 shadow-sm">
              🎯 {matchedCount}/{totalPairs} pairs
            </span>
            {wrongAttempts > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-sm font-bold text-rose-600 dark:text-rose-400 shadow-sm">
                ❌ {wrongAttempts} misses
              </span>
            )}
          </div>

          {/* Timer */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`text-3xl font-bold ${timeColor} tabular-nums`}>
                ⏰ {timeLeft}s
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar for time */}
        <div className="mt-3 w-full bg-white dark:bg-gray-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ease-linear ${
              timePercent <= 20 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
              timePercent <= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
              'bg-gradient-to-r from-emerald-500 to-teal-500'
            }`}
            style={{ width: `${timePercent}%` }}
          />
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`text-center text-xl font-bold py-2 rounded-xl ${
          message.includes('✅') || message.includes('🎉') ? 'text-green-600 bg-green-50 dark:bg-green-900/20' :
          message.includes('❌') ? 'text-red-500 bg-red-50 dark:bg-red-900/20' :
          message.includes('⏰') ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' :
          'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
        }`}>
          {message}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl text-center">
        <p className="text-sm text-indigo-700 dark:text-indigo-300">
          👆 Flip two cards to find a matching pair • ⏰ Match gives +10s • ❤️ Time out = lose a life
        </p>
      </div>

      {/* Card Grid */}
      <div className={`grid ${gridCols} gap-3 max-w-3xl mx-auto`}>
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index);
          const isMatched = matched.includes(card.pairId);
          const isRevealed = isFlipped || isMatched;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              disabled={isMatched || isFlipped || isLocked}
              className={`relative aspect-square rounded-2xl transition-all duration-500 transform-gpu ${
                isMatched
                  ? 'opacity-30 scale-95 pointer-events-none'
                  : isLocked && !isFlipped
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer hover:scale-105'
              }`}
              style={{ perspective: '1000px' }}
            >
              <div
                className={`relative w-full h-full transition-transform duration-500`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Back of card (shown first) */}
                <div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-600 shadow-lg flex items-center justify-center overflow-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {/* Decorative pattern on back */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-2 left-2 w-8 h-8 border-2 border-white rounded-full"></div>
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-2 border-white rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="relative text-white text-3xl font-bold">?</div>
                </div>

                {/* Front of card (emoji) */}
                <div
                  className={`absolute inset-0 rounded-2xl shadow-lg flex items-center justify-center border-2 ${
                    isMatched
                      ? 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 border-emerald-400'
                      : 'bg-white dark:bg-gray-800 border-indigo-200 dark:border-indigo-700'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <span className="text-4xl md:text-5xl">{card.emoji}</span>
                  {isMatched && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Complete overlay */}
      {isComplete && (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-xl font-bold text-emerald-600">Stage Complete!</p>
          <p className="text-sm text-gray-500">Loading next level...</p>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// GAME 7 : MINDFUL MOMENTS
// =============================================================================

const MindfulMoments = ({ engine }) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState('start');
  const [breathCount, setBreathCount] = useState(0);
  const [message, setMessage] = useState('');
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const totalBreaths = Math.min(6 + engine.level * 2, 20);

  const startBreathing = () => {
    setPhase('breathing');
    setBreathCount(0);
    setMessage('🌬️ Breathe in...');
    let count = 0;
    timerRef.current = setInterval(() => {
      count += 1;
      setBreathCount(count);
      setMessage(count % 2 === 1 ? '🌬️ Breathe in...' : '😮\u200d💨 Breathe out...');
      if (count >= totalBreaths * 2) {
        clearInterval(timerRef.current);
        setPhase('complete');
        const points = engine.recordCorrect(50);
        setMessage(`🧘 Excellent! +${points} points!`);
        engine.levelUp();
      }
    }, 2000);
  };

  if (engine.gameOver) return <GameOverScreen engine={engine} />;

 if (engine.showTutorial) {
    return (
      <TutorialScreen
        gameName={t('games.mindfulMoments')}
        demo={<HowToPlayDemo items={['🌬️', '😮‍💨']} caption={t('tutorials.mindfulMoments.demo')} />}
        instructions={[
          t('tutorials.mindfulMoments.step1'),
          t('tutorials.mindfulMoments.step2'),
          t('tutorials.mindfulMoments.step3'),
          t('tutorials.mindfulMoments.step4'),
          t('tutorials.mindfulMoments.step5'),
        ]}
        onStart={engine.startPlaying}
      />
    );
  }

  return (
    <div className="space-y-6">
      <GameHeader engine={engine} />
      <div className="bg-rose-50 dark:bg-rose-900/20 p-8 rounded-lg text-center">
        {phase === 'start' && (
          <div>
            <h2 className="text-3xl font-bold mb-4">🧘 Mindful Moments</h2>
            <p className="text-lg mb-6">Level {engine.level} · {totalBreaths} breaths</p>
            <button
              onClick={startBreathing}
              className="px-8 py-4 bg-primary-600 text-white rounded-lg text-xl font-bold hover:bg-primary-700 transition-colors"
            >
              Start Session
            </button>
          </div>
        )}
        {phase === 'breathing' && (
          <div>
            <div className="text-8xl mb-4 animate-pulse">{breathCount % 2 === 1 ? '🌬️' : '😮\u200d💨'}</div>
            <p className="text-3xl font-bold mb-4">{message}</p>
            <p className="text-xl">Breath {Math.ceil(breathCount / 2)} of {totalBreaths}</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-4 max-w-md mx-auto">
              <div
                className="bg-primary-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${(breathCount / (totalBreaths * 2)) * 100}%` }}
              />
            </div>
          </div>
        )}
        {phase === 'complete' && (
          <div>
            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">🧘 Session Complete!</h2>
            <p className="text-xl mb-2">{message}</p>
            <p className="text-lg mb-4">Level {engine.level} reached!</p>
            <button
              onClick={() => setPhase('start')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Next Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// GAME REGISTRY
// =============================================================================

const GAME_COMPONENTS = {
  1: MemoryLane,
  2: RoutineBuilder,
  3: PatternQuest,
  4: StoryWeaver,
  5: FacePlace,
  6: CardFlip,
  7: MindfulMoments,
};

const GAME_ICONS = {
  1: Brain, 2: Clock, 3: Puzzle, 4: BookOpen, 5: Users, 
  6: Layers,   // for CardFlip - add Layers import
  7: Heart,    // MindfulMoments
};

const GAME_TAGLINES = {
  1: 'Remember and recall sequences',
  2: 'Learn, then rebuild daily routines',
  3: 'Complete the pattern',
  4: 'Read fresh stories and answer questions',
  5: 'Match faces with places',
  6: 'Flip cards to find matching pairs',
  7: 'Relax and focus',
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const GamePlay = () => {
  const { id } = useParams();
  const gameId = parseInt(id, 10);
  const engine = usePlayerEngine();

  const GameComponent = GAME_COMPONENTS[gameId];
  const theme = THEMES[gameId] || THEMES[1];
  const Icon = GAME_ICONS[gameId] || Sparkles;

  return (
    <div className="space-y-6">
      <GlobalGameStyles />
      {engine.showCelebration && <Confetti recycle={false} numberOfPieces={250} />}
      <ToastStack toasts={engine.toasts} />

      <Link
        to="/games"
        className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Games
      </Link>

      <div
        className="relative rounded-2xl p-8 text-white overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
      >
        <DynamicBackground theme={theme} />
        <div className="relative flex items-center space-x-4">
          <Icon className="w-16 h-16" />
          <div>
            <h1 className="text-4xl font-bold">{theme.name}</h1>
            <p className="text-xl opacity-90">{GAME_TAGLINES[gameId] || ''}</p>
          </div>
        </div>
      </div>

      {GameComponent ? <GameComponent engine={engine} /> : <div>Game not found</div>}
    </div>
  );
};

export default GamePlay;