import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Brain, Clock, Puzzle, BookOpen, Users, Heart,
  Trophy, Coins, Volume2, VolumeX, Flag, HelpCircle, Sparkles, Layers
} from 'lucide-react';
import Confetti from 'react-confetti';
import { useAuth } from '../context/AuthContext';
import AIGameService from '../utils/aiGameService';
import GameHistoryService from '../services/GameHistoryService';
import { logGameSession } from '../utils/analytics';
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
const CHECKPOINT_EVERY = 3;
const LIFE_COST_IN_COINS = 5;

function usePlayerEngine() {
  const { user, syncProgress } = useAuth();
  const [score, setScore] = useState(user?.score || 0);
  const [bestScore, setBestScore] = useState(0);
  const [coins, setCoins] = useState(user?.coins ?? 100);
  const [level, setLevel] = useState(user?.level || 1);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [checkpointLevel, setCheckpointLevel] = useState(user?.gameStats?.checkpointLevel || 1);

  useEffect(() => {
    if (user) {
      if (user.coins !== undefined) setCoins(user.coins);
      if (user.score !== undefined) setScore(user.score);
      if (user.level !== undefined) setLevel(user.level);
      if (user.gameStats?.checkpointLevel) setCheckpointLevel(user.gameStats.checkpointLevel);
    }
  }, [user]);
  const [showTutorial, setShowTutorial] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [sessionId, setSessionId] = useState(0);

  const sessionStartTimeRef = useRef(Date.now());
  const lastActionTimeRef = useRef(Date.now());
  const correctCountRef = useRef(0);
  const wrongCountRef = useRef(0);
  const responseTimesRef = useRef([]);

  const logCurrentGameSession = useCallback((completed = 1) => {
    const attempts = correctCountRef.current + wrongCountRef.current;
    if (attempts === 0) return;
    const dur = Math.max(1, Math.round((Date.now() - sessionStartTimeRef.current) / 1000));
    const gameId = window.location.pathname.split('/game/')[1] || 'unknown';
    const gameKeyMap = {
      '1': 'memoryLane',
      '2': 'routineBuilder',
      '3': 'patternQuest',
      '4': 'storyWeaver',
      '5': 'facePlace',
      '6': 'cardFlip',
      '7': 'mindfulMoments',
    };
    const gameType = gameKeyMap[gameId] || ('game-' + gameId);

    logGameSession({
      gameType,
      correctAttempts: correctCountRef.current,
      incorrectAttempts: wrongCountRef.current,
      missedAttempts: 0,
      totalAttempts: attempts,
      startedTasks: 1,
      completedTasks: completed,
      responseTimes: responseTimesRef.current.length > 0 ? responseTimesRef.current : [dur],
      sessionDuration: dur,
      stage: level,
      score: scoreRef.current,
    });

    correctCountRef.current = 0;
    wrongCountRef.current = 0;
    responseTimesRef.current = [];
    sessionStartTimeRef.current = Date.now();
    lastActionTimeRef.current = Date.now();
  }, [level]);

  useEffect(() => {
    return () => {
      logCurrentGameSession(0);
    };
  }, [logCurrentGameSession]);

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
    logCurrentGameSession(0);
    setGameOver(true);
    const newBest = Math.max(bestScore, scoreRef.current);
    setBestScore(newBest);
    if (syncProgress) {
      syncProgress({ coins, score: scoreRef.current, level, gameStats: { checkpointLevel } });
    }
    playSound('gameover');
  }, [coins, level, checkpointLevel, syncProgress, bestScore, playSound]);

  const recordCorrect = useCallback((basePoints) => {
    const dt = Math.max(0.1, (Date.now() - lastActionTimeRef.current) / 1000);
    responseTimesRef.current.push(Number(dt.toFixed(2)));
    correctCountRef.current += 1;
    lastActionTimeRef.current = Date.now();
    let awardedPoints = 0;
    setCombo((c) => {
      const newCombo = c + 1;
      const comboBonus = Math.floor(newCombo / 2) * Math.ceil(basePoints / 2);
      // Random mystery points (50% chance of +15 to +40 random bonus points)
      const randomPointsBonus = Math.random() < 0.50 ? (15 + Math.floor(Math.random() * 25)) : 0;
      awardedPoints = basePoints * level + comboBonus + randomPointsBonus;
      setScore((s) => s + awardedPoints);

      // Random coin reward on correct answer:
      let coinsEarned = 0;
      if (newCombo % 2 === 0) {
        coinsEarned += 1;
      }
      if (Math.random() < 0.45) {
        coinsEarned += 1 + Math.floor(Math.random() * 3);
      }
      if (Math.random() < 0.12) {
        coinsEarned += 10;
        pushToast('🎁 Lucky Mystery Chest! +10 Coins!', 'coin');
      }

      if (coinsEarned > 0) {
        setCoins((c2) => c2 + coinsEarned);
        pushToast(`🪙 +${coinsEarned} Coin${coinsEarned > 1 ? 's' : ''}!`, 'coin');
      }
      return newCombo;
    });
    playSound('correct');
    return awardedPoints;
  }, [level, playSound, pushToast]);

  const levelUp = useCallback(() => {
    logCurrentGameSession(1);
    playSound('levelup');
    setShowCelebration(true);
    setLevel((l) => {
      const newLevel = l + 1;
      if (newLevel % CHECKPOINT_EVERY === 0) {
        setCheckpointLevel(newLevel);
        setLives((li) => Math.min(li + 1, MAX_LIVES));
        setCoins((c) => c + 20);
        setTimeout(() => {
          pushToast(`🚩 Checkpoint Level ${newLevel} Saved! +1 Life & +20 Coins!`, 'checkpoint');
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
  '6': 'Card Flip',         
  '7': 'Mindful Moments',   
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
    const dt = Math.max(0.1, (Date.now() - lastActionTimeRef.current) / 1000);
    responseTimesRef.current.push(Number(dt.toFixed(2)));
    wrongCountRef.current += 1;
    lastActionTimeRef.current = Date.now();
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
    const newCoins = coins - LIFE_COST_IN_COINS;
    const newLives = Math.min(lives + 1, MAX_LIVES);
    setCoins(newCoins);
    setLives(newLives);
    if (syncProgress) {
      syncProgress({ coins: newCoins, score, level, gameStats: { checkpointLevel, lives: newLives } });
    }
    playSound('coin');
    pushToast('💚 Life restored!', 'coin');
  }, [coins, lives, score, level, checkpointLevel, syncProgress, playSound, pushToast]);

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

// =============================================================================
// GAME 1: MEMORY LANE (Sequential Progressive Recall Engine)
// =============================================================================

const MemoryLane = ({ engine }) => {
  const { t } = useTranslation();
  const [roundData, setRoundData] = useState(null);
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [isShowing, setIsShowing] = useState(true);
  const [userSequence, setUserSequence] = useState([]);
  const [feedbackTile, setFeedbackTile] = useState(null);

  useEffect(() => {
    if (engine.showTutorial) return;
    const data = AIGameService.generateMemorySequence(engine.level);
    setRoundData(data);
    setUserSequence([]);
    setIsShowing(true);
    setRevealedIndex(-1);

    // Progressive item-by-item reveal for comfortable dementia cognitive pacing
    let step = 0;
    const interval = setInterval(() => {
      setRevealedIndex(step);
      engine.playSound('checkpoint');
      step++;
      if (step >= data.sequence.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsShowing(false);
          setRevealedIndex(-1);
        }, 1200);
      }
    }, 850);

    return () => clearInterval(interval);
  }, [engine.sessionId, engine.showTutorial, engine.level]);

  const handleTileClick = (emoji) => {
    if (isShowing || engine.gameOver || !roundData) return;
    const currentStep = userSequence.length;
    const expected = roundData.sequence[currentStep];

    setFeedbackTile(emoji);
    setTimeout(() => setFeedbackTile(null), 300);

    if (emoji === expected) {
      engine.playSound('correct');
      const nextSeq = [...userSequence, emoji];
      setUserSequence(nextSeq);

      if (nextSeq.length === roundData.sequence.length) {
        // Sequence completely matched!
        const pts = engine.recordCorrect(15 + engine.level * 2);
        engine.pushToast(`🎉 Memory Master! +${pts} pts`, 'coin');
        setTimeout(() => {
          engine.levelUp();
        }, 1200);
      }
    } else {
      engine.recordWrong();
      setUserSequence([]); // Restart trial for current round
      engine.pushToast('❌ Not quite! Watch closely and try again', 'wrong');
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

  if (!roundData) return <div className="text-center p-8">Loading Memory Lane...</div>;

  return (
    <div className="space-y-6">
      <GameHeader engine={engine} />
      <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl text-center shadow-sm">
        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
          {isShowing ? '👀 Watch the sequence appear one by one!' : '🔄 Repeat the exact sequence in order!'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Stage Length: <span className="font-bold text-blue-600">{roundData.sequence.length} items</span> | Theme: <span className="capitalize font-semibold">{roundData.theme}</span>
        </p>
      </div>

      {/* Target Sequence Display */}
      <div className="flex justify-center items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md min-h-[110px] flex-wrap max-w-xl mx-auto">
        {isShowing ? (
          roundData.sequence.map((emoji, idx) => (
            <div
              key={idx}
              className={`text-5xl md:text-6xl p-3 rounded-2xl transition-all duration-300 ${
                idx <= revealedIndex
                  ? 'scale-110 shadow-lg bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-400 animate-bounce'
                  : 'opacity-20 scale-90 bg-gray-100 dark:bg-gray-700'
              }`}
            >
              {idx <= revealedIndex ? emoji : '❓'}
            </div>
          ))
        ) : (
          roundData.sequence.map((_, idx) => (
            <div
              key={idx}
              className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl font-bold border-2 transition-all ${
                idx < userSequence.length
                  ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-500 text-emerald-600'
                  : idx === userSequence.length
                  ? 'border-dashed border-blue-500 animate-pulse bg-blue-50/50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 text-gray-300'
              }`}
            >
              {idx < userSequence.length ? userSequence[idx] : idx + 1}
            </div>
          ))
        )}
      </div>

      {/* Interactive Choice Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-w-lg mx-auto">
        {roundData.availableTiles.map((emoji, idx) => (
          <button
            key={idx}
            onClick={() => handleTileClick(emoji)}
            disabled={isShowing || userSequence.length >= roundData.sequence.length}
            className={`text-4xl md:text-5xl p-3 rounded-2xl bg-white dark:bg-gray-700 shadow hover:shadow-lg transition-all active:scale-95 flex items-center justify-center border border-gray-100 dark:border-gray-600 ${
              feedbackTile === emoji ? 'ring-4 ring-blue-500 scale-110' : 'hover:scale-105'
            } ${isShowing ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="text-center font-semibold text-gray-500 dark:text-gray-400">
        Progress: {userSequence.length} of {roundData.sequence.length} steps matched
      </div>
    </div>
  );
};

// =============================================================================
// GAME 2: ROUTINE BUILDER (Touch-Accessible Functional Independence)
// =============================================================================

const RoutineBuilder = ({ engine }) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState('learn');
  const [themeName, setThemeName] = useState('');
  const [tasks, setTasks] = useState([]);
  const [correctOrder, setCorrectOrder] = useState([]);
  const [hints, setHints] = useState([]);
  const [message, setMessage] = useState('');
  const [revealedHintIdx, setRevealedHintIdx] = useState(null);

  useEffect(() => {
    if (engine.showTutorial) return;
    const round = AIGameService.generateRoutine(engine.level);
    setThemeName(round.themeName);
    setCorrectOrder(round.correctOrder);
    setHints(round.hints);
    setTasks(shuffle([...round.steps]));
    setPhase('learn');
    setMessage('');
    setRevealedHintIdx(null);
  }, [engine.sessionId, engine.showTutorial, engine.level]);

  const beginArranging = () => {
    setTasks(shuffle([...correctOrder]));
    setPhase('arrange');
  };

  // Move item up
  const moveTaskUp = (index) => {
    if (index === 0) return;
    const next = [...tasks];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setTasks(next);
    engine.playSound('coin');
  };

  // Move item down
  const moveTaskDown = (index) => {
    if (index === tasks.length - 1) return;
    const next = [...tasks];
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    setTasks(next);
    engine.playSound('coin');
  };

  const useSmartHint = () => {
    if (engine.coins < 2) {
      engine.pushToast('🪙 Need 2 coins for a step hint', 'info');
      return;
    }
    // Find first misplaced task
    const misplaced = correctOrder.findIndex((t, i) => tasks[i] !== t);
    if (misplaced !== -1) {
      setRevealedHintIdx(misplaced);
      engine.pushToast(`💡 Hint: Step ${misplaced + 1} is "${correctOrder[misplaced]}"`, 'checkpoint');
    } else {
      engine.pushToast('✨ All items are already in correct order!', 'info');
    }
  };

  const checkOrder = () => {
    const isCorrect = tasks.every((task, i) => task === correctOrder[i]);
    if (isCorrect) {
      const points = engine.recordCorrect(25 + engine.level * 3);
      setMessage(`✅ Perfect routine! +${points} points awarded!`);
      setTimeout(() => {
        engine.levelUp();
      }, 1500);
    } else {
      const correctCount = tasks.filter((task, i) => task === correctOrder[i]).length;
      setMessage(`❌ ${correctCount} of ${correctOrder.length} steps in position. Check carefully!`);
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
        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl shadow-sm">
          <h3 className="text-2xl font-bold text-center mb-1 text-purple-700 dark:text-purple-300">📖 Learn: {themeName}</h3>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">Review the logical order first. When you are ready, tap below to arrange them from memory!</p>
          <div className="space-y-3 max-w-lg mx-auto">
            {correctOrder.map((task, index) => (
              <div key={index} className="p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-purple-100 dark:border-purple-800">
                <div className="flex items-center">
                  <span className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold mr-3">
                    {index + 1}
                  </span>
                  <span className="text-lg font-medium">{task}</span>
                </div>
                {hints[index] && <p className="text-xs text-gray-500 dark:text-gray-400 ml-11 mt-1">{hints[index]}</p>}
              </div>
            ))}
          </div>
          <button
            onClick={beginArranging}
            className="mt-6 w-full max-w-lg mx-auto block py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-lg font-bold shadow-md transition-all active:scale-98"
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
        <div className={`text-center text-xl font-bold p-3 rounded-xl ${message.includes('✅') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {message}
        </div>
      )}

      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center">
        <p className="text-lg font-bold text-purple-800 dark:text-purple-200">🎯 Reorder "{themeName}" into correct sequence</p>
        <p className="text-xs text-gray-500 mt-1">Use the ▲ and ▼ buttons or drag cards to put steps in order</p>
      </div>

      <div className="space-y-2.5 max-w-lg mx-auto">
        {tasks.map((task, index) => {
          const isRight = task === correctOrder[index];
          const isHinted = revealedHintIdx === index;
          return (
            <div
              key={task}
              className={`flex items-center justify-between p-3.5 bg-white dark:bg-gray-700 rounded-2xl shadow-sm border transition-all ${
                isHinted ? 'border-amber-400 ring-2 ring-amber-300' : isRight ? 'border-emerald-200' : 'border-gray-100 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center flex-1 mr-2">
                <span className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold mr-3 text-sm">
                  {index + 1}
                </span>
                <span className="text-base font-medium">{task}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveTaskUp(index)}
                  disabled={index === 0}
                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-600 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  title="Move Up"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveTaskDown(index)}
                  disabled={index === tasks.length - 1}
                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-600 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  title="Move Down"
                >
                  ▼
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 justify-center max-w-lg mx-auto flex-wrap">
        <button
          onClick={checkOrder}
          className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-98"
        >
          ✅ Check My Order
        </button>
        <button
          onClick={useSmartHint}
          className="py-3.5 px-5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-98"
        >
          💡 Step Hint (2🪙)
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// GAME 3: PATTERN QUEST (Algorithmic Logic with Hint Engine)
// =============================================================================

const PatternQuest = ({ engine }) => {
  const { t } = useTranslation();
  const [round, setRound] = useState(null);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const [hintShown, setHintShown] = useState(false);

  useEffect(() => {
    if (engine.showTutorial) return;
    const result = AIGameService.generatePattern(engine.level);
    setRound(result);
    setSelected(null);
    setMessage('');
    setHintShown(false);
  }, [engine.sessionId, engine.showTutorial, engine.level]);

  const handleOptionClick = (option) => {
    if (selected !== null || !round) return;
    setSelected(option);

    if (option === round.correctAnswer) {
      engine.playSound('correct');
      const pts = engine.recordCorrect(15 + engine.level * 2);
      setMessage(`✅ Brilliant match! +${pts} points`);
      setTimeout(() => {
        engine.levelUp();
      }, 1300);
    } else {
      engine.playSound('wrong');
      engine.recordWrong();
      setMessage('❌ Not quite! Notice the repeating sequence.');
      setTimeout(() => {
        setSelected(null);
      }, 1200);
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

  if (!round) return <div className="text-center p-8">Loading Pattern Quest...</div>;

  return (
    <div className="space-y-6">
      <GameHeader engine={engine} />
      {message && (
        <div className={`text-center text-xl font-bold p-3 rounded-xl ${message.includes('✅') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {message}
        </div>
      )}

      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl text-center">
        <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200">🧩 What element completes the sequence?</p>
        <p className="text-xs text-gray-500 mt-1">Study the rhythm and tap the missing piece below</p>
      </div>

      {/* Pattern Display */}
      <div className="flex justify-center items-center gap-3 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md max-w-xl mx-auto flex-wrap min-h-[120px]">
        {round.pattern.map((item, index) => (
          <div
            key={index}
            className={`text-5xl md:text-6xl p-3 rounded-2xl transition-transform ${
              item === '?'
                ? 'bg-amber-100 dark:bg-amber-900/40 border-2 border-dashed border-amber-500 text-amber-600 animate-pulse scale-110'
                : 'bg-gray-50 dark:bg-gray-700/60 shadow-sm'
            }`}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Option Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-md mx-auto">
        {round.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            disabled={selected !== null}
            className={`text-5xl p-5 bg-white dark:bg-gray-700 rounded-2xl shadow hover:shadow-xl transition-all hover:scale-105 active:scale-95 border border-gray-100 dark:border-gray-600 flex items-center justify-center ${
              selected === option ? 'ring-4 ring-emerald-500 scale-105' : ''
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="text-center">
        {!hintShown ? (
          <button
            onClick={() => setHintShown(true)}
            className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            💡 Need a clue? Look for groups that repeat
          </button>
        ) : (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm rounded-xl max-w-sm mx-auto">
            Observe the very first elements: does the sequence start over or count up?
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// GAME 4: STORY WEAVER (Infinite Dynamic Real-Time Stories + Scaling Questions)
// =============================================================================

const StoryWeaver = ({ engine }) => {
  const { t } = useTranslation();
  const [storyData, setStoryData] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [showStory, setShowStory] = useState(true);
  const [peekStory, setPeekStory] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerFeedback, setAnswerFeedback] = useState(null);

  useEffect(() => {
    if (engine.showTutorial) return;
    const generated = AIGameService.generateStory(engine.level);
    setStoryData(generated);
    setCurrentQuestionIdx(0);
    setShowStory(true);
    setPeekStory(false);
    setSelectedOption(null);
    setAnswerFeedback(null);
  }, [engine.sessionId, engine.showTutorial, engine.level]);

  const handleAnswer = (option) => {
    if (selectedOption !== null || !storyData) return;
    setSelectedOption(option);
    const q = storyData.questions[currentQuestionIdx];

    if (option === q.correctAnswer) {
      engine.playSound('correct');
      setAnswerFeedback('correct');
      const pts = engine.recordCorrect(15);

      setTimeout(() => {
        setSelectedOption(null);
        setAnswerFeedback(null);

        if (currentQuestionIdx < storyData.questions.length - 1) {
          setCurrentQuestionIdx(idx => idx + 1);
        } else {
          // All questions for this stage answered!
          engine.pushToast(`🎉 Story Stage ${engine.level} Cleared! +${pts} pts`, 'checkpoint');
          engine.levelUp();
        }
      }, 1000);
    } else {
      engine.playSound('wrong');
      setAnswerFeedback('wrong');
      engine.recordWrong();

      setTimeout(() => {
        setSelectedOption(null);
        setAnswerFeedback(null);
      }, 1200);
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

  if (!storyData) return <div className="text-center p-8">Generating live story...</div>;

  const currentQ = storyData.questions[currentQuestionIdx];

  return (
    <div className="space-y-6">
      <GameHeader engine={engine} />

      <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-2xl shadow-sm border border-orange-100 dark:border-orange-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div>
            <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-200">📖 {storyData.title}</h3>
            <p className="text-xs text-gray-500">
              Stage {engine.level} • {storyData.questions.length} Questions to Complete • ~{storyData.wordCount} words
            </p>
          </div>
          {!showStory && (
            <button
              onClick={() => setPeekStory(!peekStory)}
              className="px-3.5 py-1.5 rounded-xl bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-100 text-xs font-semibold hover:bg-orange-300 transition-colors flex items-center gap-1"
            >
              👁️ {peekStory ? 'Hide Story' : 'Peek at Story'}
            </button>
          )}
        </div>

        {/* Story Reading Phase */}
        {showStory ? (
          <div className="space-y-4">
            <div className="p-5 bg-white dark:bg-gray-800 rounded-xl leading-relaxed text-lg text-gray-800 dark:text-gray-200 shadow-sm border border-orange-100 dark:border-gray-700">
              {storyData.story}
            </div>
            <button
              onClick={() => setShowStory(false)}
              className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-lg font-bold shadow-md transition-all active:scale-98"
            >
              ✍️ Ready! Start {storyData.questions.length} Recall Questions
            </button>
          </div>
        ) : (
          /* Question Answering Phase */
          <div className="space-y-5">
            {peekStory && (
              <div className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl text-sm leading-relaxed border border-orange-200 dark:border-orange-700 mb-3 text-gray-700 dark:text-gray-300">
                <span className="font-bold block mb-1 text-orange-700">Story Reference:</span>
                {storyData.story}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
              <span>Question {currentQuestionIdx + 1} of {storyData.questions.length}</span>
              <div className="flex gap-1">
                {storyData.questions.map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-1.5 rounded-full ${
                      i < currentQuestionIdx ? 'bg-emerald-500' : i === currentQuestionIdx ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-orange-100 dark:border-gray-700">
              <p className="text-xl font-bold text-gray-900 dark:text-white mb-4">{currentQ.q}</p>
              <div className="grid grid-cols-1 gap-3">
                {currentQ.options.map((option, index) => {
                  const isSelected = selectedOption === option;
                  const isFeedbackCorrect = answerFeedback === 'correct' && isSelected;
                  const isFeedbackWrong = answerFeedback === 'wrong' && isSelected;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedOption !== null}
                      className={`w-full p-4 rounded-xl text-left text-base font-medium transition-all flex items-center justify-between border ${
                        isFeedbackCorrect
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                          : isFeedbackWrong
                          ? 'bg-rose-100 border-rose-500 text-rose-900'
                          : 'bg-gray-50 dark:bg-gray-700/60 hover:bg-orange-50 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 flex items-center justify-center font-bold text-xs">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {isFeedbackCorrect && <span>✅</span>}
                      {isFeedbackWrong && <span>❌</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// GAME 5: FACE & PLACE (Fully Decoupled 2D Randomized Matching Engine)
// =============================================================================

const FacePlace = ({ engine }) => {
  const { t } = useTranslation();
  const [faces, setFaces] = useState([]);
  const [places, setPlaces] = useState([]);
  const [masterPairs, setMasterPairs] = useState([]);
  const [selectedFace, setSelectedFace] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [message, setMessage] = useState('');
  const [hintMsg, setHintMsg] = useState('');

  useEffect(() => {
    if (engine.showTutorial) return;
    const round = AIGameService.generateFacePlacePairs(engine.level);
    setMasterPairs(round.pairs);
    setFaces(round.shuffledFaces);
    setPlaces(round.shuffledPlaces);
    setMatchedPairs([]);
    setSelectedFace(null);
    setSelectedPlace(null);
    setMessage('');
    setHintMsg('');
  }, [engine.sessionId, engine.showTutorial, engine.level]);

  // Handle Match Evaluation
  useEffect(() => {
    if (!selectedFace || !selectedPlace) return;

    const timer = setTimeout(() => {
      // Find if selectedFace & selectedPlace belong together in masterPairs
      const match = masterPairs.find(p => p.face === selectedFace && p.place === selectedPlace);

      if (match) {
        engine.playSound('correct');
        const points = engine.recordCorrect(15 + Math.floor(engine.level / 2));
        setMessage(`✅ Perfect! ${match.name} works at the ${match.location}! (+${points} pts)`);

        setMatchedPairs(prev => {
          const updated = [...prev, match];
          if (updated.length === masterPairs.length) {
            setTimeout(() => {
              engine.pushToast(`🎉 Face & Place Stage ${engine.level} Cleared!`, 'checkpoint');
              engine.levelUp();
            }, 1400);
          }
          return updated;
        });

        setSelectedFace(null);
        setSelectedPlace(null);
        setTimeout(() => setMessage(''), 2200);
      } else {
        engine.playSound('wrong');
        engine.recordWrong();
        setMessage('❌ Not a match! Try another combination.');
        setSelectedFace(null);
        setSelectedPlace(null);
        setTimeout(() => setMessage(''), 1800);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [selectedFace, selectedPlace, masterPairs]);

  const useClueHint = () => {
    if (engine.coins < 3) {
      engine.pushToast('🪙 Need 3 coins for a role clue', 'info');
      return;
    }
    // Find first unmatched pair
    const remaining = masterPairs.filter(p => !matchedPairs.some(m => m.face === p.face));
    if (remaining.length > 0) {
      const clue = remaining[0];
      setHintMsg(`💡 Clue: ${clue.face} (${clue.name}) belongs with ${clue.place} (${clue.location})`);
      engine.pushToast('💡 Role clue unlocked!', 'coin');
    }
  };

  if (engine.gameOver) return <GameOverScreen engine={engine} />;

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

  const remainingFaces = faces.filter(f => !matchedPairs.some(m => m.face === f.face));
  const remainingPlaces = places.filter(p => !matchedPairs.some(m => m.place === p.place));

  return (
    <div className="space-y-6">
      <GameHeader engine={engine} />

      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-center">
        <p className="text-xl font-bold text-indigo-800 dark:text-indigo-200">👤 Tap a Person, then tap their matching Place</p>
        <p className="text-xs text-gray-500 mt-1">
          Stage {engine.level} • Matched {matchedPairs.length} of {masterPairs.length} pairs • Positions are independently shuffled
        </p>
      </div>

      {message && (
        <div className={`text-center text-lg font-bold p-3 rounded-xl ${message.includes('✅') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {message}
        </div>
      )}

      {hintMsg && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 text-amber-900 dark:text-amber-200 text-center rounded-xl text-sm max-w-md mx-auto">
          {hintMsg}
        </div>
      )}

      {/* 2-Column Fully Decoupled Layout */}
      <div className="grid grid-cols-2 gap-4 sm:gap-8 max-w-2xl mx-auto">
        {/* Left Column: People */}
        <div>
          <h4 className="text-center font-bold mb-3 text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1">
            <span>👤</span> People ({remainingFaces.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {remainingFaces.map((f, i) => (
              <button
                key={i}
                onClick={() => setSelectedFace(selectedFace === f.face ? null : f.face)}
                className={`flex flex-col items-center p-3 rounded-2xl bg-white dark:bg-gray-800 shadow hover:shadow-lg transition-all border ${
                  selectedFace === f.face
                    ? 'ring-4 ring-indigo-500 scale-105 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/40'
                    : 'border-gray-100 dark:border-gray-700 hover:scale-102'
                }`}
              >
                <span className="text-5xl my-1">{f.face}</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white mt-1">{f.name}</span>
                <span className="text-[10px] text-gray-400 text-center line-clamp-1">{f.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Places */}
        <div>
          <h4 className="text-center font-bold mb-3 text-purple-700 dark:text-purple-300 flex items-center justify-center gap-1">
            <span>📍</span> Places ({remainingPlaces.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {remainingPlaces.map((p, i) => (
              <button
                key={i}
                onClick={() => setSelectedPlace(selectedPlace === p.place ? null : p.place)}
                className={`flex flex-col items-center p-3 rounded-2xl bg-white dark:bg-gray-800 shadow hover:shadow-lg transition-all border ${
                  selectedPlace === p.place
                    ? 'ring-4 ring-purple-500 scale-105 border-purple-500 bg-purple-50/50 dark:bg-purple-900/40'
                    : 'border-gray-100 dark:border-gray-700 hover:scale-102'
                }`}
              >
                <span className="text-5xl my-1">{p.place}</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white mt-1">{p.location}</span>
                <span className="text-[10px] text-gray-400 text-center line-clamp-1">{p.hint}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={useClueHint}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
        >
          💡 Clue Hint (3🪙)
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// GAME 6: CARD FLIP (Interactive 3D Grid with "Quick Peek" Coin Utility)
// =============================================================================

const CardFlip = ({ engine }) => {
  const { t } = useTranslation();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [peekActive, setPeekActive] = useState(false);
  const [message, setMessage] = useState('');
  const timerRef = useRef(null);
  const totalPairsRef = useRef(0);

  useEffect(() => {
    if (engine.showTutorial) return;
    const stage = AIGameService.generateCardFlipGrid(engine.level);
    setCards(stage.cards);
    setFlipped([]);
    setMatched([]);
    setMessage('');
    setPeekActive(false);
    setTimeLeft(stage.timeLimit);
    totalPairsRef.current = stage.pairs;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          engine.recordWrong();
          engine.pushToast('⏰ Time expired for this round!', 'wrong');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [engine.sessionId, engine.showTutorial, engine.level]);

  // Quick Peek Powerup (Real Coin Utility)
  const useQuickPeek = () => {
    if (engine.coins < 5) {
      engine.pushToast('🪙 Need 5 coins for Quick Peek', 'info');
      return;
    }
    if (peekActive) return;
    setPeekActive(true);
    engine.pushToast('👁️ Quick Peek activated! (2s)', 'coin');
    setTimeout(() => {
      setPeekActive(false);
    }, 2000);
  };

  const handleCardClick = (index) => {
    if (peekActive || flipped.length >= 2 || flipped.includes(index) || matched.includes(cards[index].pairId)) return;

    engine.playSound('coin');
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [idx1, idx2] = newFlipped;
      const c1 = cards[idx1];
      const c2 = cards[idx2];

      if (c1.pairId === c2.pairId) {
        // Matched!
        engine.playSound('correct');
        const nextMatched = [...matched, c1.pairId];
        setMatched(nextMatched);
        setFlipped([]);
        setTimeLeft(t => t + 10);
        engine.recordCorrect(15);
        setMessage('✅ Match! +10s added');

        if (nextMatched.length === totalPairsRef.current) {
          clearInterval(timerRef.current);
          engine.pushToast(`🎉 Card Flip Stage ${engine.level} Cleared!`, 'checkpoint');
          setTimeout(() => {
            engine.levelUp();
          }, 1400);
        } else {
          setTimeout(() => setMessage(''), 1200);
        }
      } else {
        // Mismatch
        engine.playSound('wrong');
        engine.recordWrong();
        setTimeout(() => {
          setFlipped([]);
        }, 900);
      }
    }
  };

  if (engine.gameOver) return <GameOverScreen engine={engine} />;

  if (engine.showTutorial) {
    return (
      <TutorialScreen
        gameName={t('games.cardFlip')}
        demo={<HowToPlayDemo items={['🃏', '→', '✨']} caption={t('tutorials.cardFlip.demo')} />}
        instructions={[
          t('tutorials.cardFlip.step1'),
          t('tutorials.cardFlip.step2'),
          t('tutorials.cardFlip.step3'),
          t('tutorials.cardFlip.step4'),
          t('tutorials.cardFlip.step5'),
        ]}
        onStart={engine.startPlaying}
      />
    );
  }

  return (
    <div className="space-y-6">
      <GameHeader engine={engine} />

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-violet-50 dark:bg-violet-900/20 p-4 rounded-xl">
        <div>
          <span className="font-bold text-violet-800 dark:text-violet-200">
            🃏 Matched: {matched.length} / {totalPairsRef.current} pairs
          </span>
          <span className="ml-3 text-sm text-gray-500 font-semibold">
            ⏱️ Time: <span className={timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-gray-700 dark:text-gray-300'}>{timeLeft}s</span>
          </span>
        </div>
        <button
          onClick={useQuickPeek}
          disabled={peekActive}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow transition-all active:scale-95 flex items-center gap-1.5"
        >
          👁️ Quick Peek (5🪙)
        </button>
      </div>

      {message && (
        <div className="text-center font-bold text-emerald-600 text-base">{message}</div>
      )}

      {/* Dynamic Responsive Card Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-w-xl mx-auto">
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || peekActive;
          const isMatched = matched.includes(card.pairId);

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              disabled={isMatched}
              className={`h-24 sm:h-28 rounded-2xl shadow-sm transition-all duration-300 transform flex items-center justify-center text-4xl ${
                isMatched
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 opacity-80 cursor-default'
                  : isFlipped
                  ? 'bg-white dark:bg-gray-800 border-2 border-violet-400 rotate-y-180 scale-102'
                  : 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white hover:scale-105 active:scale-95'
              }`}
            >
              {isFlipped || isMatched ? card.emoji : '❓'}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// =============================================================================
// GAME 7: MINDFUL MOMENTS (Interactive Biofeedback Touch Breathing Orb)
// =============================================================================

const MindfulMoments = ({ engine }) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState('breathe');
  const [cycleStep, setCycleStep] = useState('Inhale'); // 'Inhale' | 'Hold' | 'Exhale'
  const [completedCycles, setCompletedCycles] = useState(0);
  const targetCycles = Math.min(4 + engine.level, 10);
  const [orbScale, setOrbScale] = useState(1);

  useEffect(() => {
    if (phase !== 'breathe') return;

    let stepTimer;
    let breathIndex = 0;

    const runBreathCycle = () => {
      // 1. Inhale (4s)
      setCycleStep('Inhale');
      setOrbScale(1.4);
      engine.playSound('checkpoint');

      stepTimer = setTimeout(() => {
        // 2. Hold (2s)
        setCycleStep('Hold Gently');
        setOrbScale(1.45);

        stepTimer = setTimeout(() => {
          // 3. Exhale (4s)
          setCycleStep('Exhale Slowly');
          setOrbScale(1.0);
          engine.playSound('coin');

          stepTimer = setTimeout(() => {
            breathIndex++;
            setCompletedCycles(breathIndex);

            if (breathIndex >= targetCycles) {
              setPhase('complete');
              const pts = engine.recordCorrect(40 + engine.level * 5);
              engine.pushToast(`🌸 Mindfulness session completed! +${pts} pts`, 'checkpoint');
            } else {
              runBreathCycle();
            }
          }, 3500);
        }, 2000);
      }, 3500);
    };

    runBreathCycle();

    return () => clearTimeout(stepTimer);
  }, [phase, targetCycles]);

  if (engine.showTutorial) {
    return (
      <TutorialScreen
        gameName={t('games.mindfulMoments')}
        demo={<HowToPlayDemo items={['🌬️', '→', '🧘']} caption={t('tutorials.mindfulMoments.demo')} />}
        instructions={[
          'Follow the expanding and contracting glowing orb with your breath.',
          'Breathe in deeply as the orb expands.',
          'Hold gently at the peak.',
          'Breathe out slowly as the orb returns to rest.',
        ]}
        onStart={engine.startPlaying}
      />
    );
  }

  return (
    <div className="space-y-6">
      <GameHeader engine={engine} />

      <div className="bg-rose-50 dark:bg-rose-900/20 p-8 rounded-3xl text-center shadow-sm max-w-lg mx-auto">
        {phase === 'breathe' ? (
          <div className="space-y-8 py-4">
            <div>
              <h3 className="text-2xl font-bold text-rose-800 dark:text-rose-200">🧘 Gentle Mindful Breathing</h3>
              <p className="text-xs text-gray-500 mt-1">Cycle {completedCycles + 1} of {targetCycles} • Synchronize your breath</p>
            </div>

            {/* Glowing Biofeedback Orb */}
            <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-400 via-pink-300 to-indigo-300 opacity-30 blur-2xl transition-transform duration-1000"
                style={{ transform: `scale(${orbScale * 1.3})` }}
              />
              <div
                className="w-40 h-40 rounded-full bg-gradient-to-tr from-rose-500 via-pink-400 to-purple-500 shadow-2xl flex flex-col items-center justify-center text-white transition-all duration-[3000ms] ease-in-out cursor-pointer"
                style={{ transform: `scale(${orbScale})` }}
              >
                <span className="text-3xl mb-1">{orbScale > 1.2 ? '🌬️' : '🌸'}</span>
                <span className="text-base font-bold tracking-wider">{cycleStep}</span>
              </div>
            </div>

            <p className="text-base font-medium text-gray-600 dark:text-gray-300">
              {cycleStep === 'Inhale' && 'Breathe in peace and clarity through your nose...'}
              {cycleStep === 'Hold Gently' && 'Hold gently and rest in this quiet moment...'}
              {cycleStep === 'Exhale Slowly' && 'Breathe out all tension and stress through your mouth...'}
            </p>
          </div>
        ) : (
          <div className="space-y-6 py-6 animate-fade-in">
            <div className="text-6xl">🌸</div>
            <h3 className="text-3xl font-bold text-rose-900 dark:text-rose-100">Peaceful Session Completed</h3>
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              "Your mind is calm, clear, and centered. Every conscious breath revitalizes and restores your inner vitality."
            </p>
            <button
              onClick={() => {
                setPhase('breathe');
                setCompletedCycles(0);
                engine.levelUp();
              }}
              className="px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-98"
            >
              🌱 Next Calming Stage (Lvl {engine.level + 1})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

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