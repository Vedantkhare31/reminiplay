import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
// Swapped the old @tensorflow-models/handpose (2020-era, single-scale, no
// confidence gating) for @tensorflow-models/hand-pose-detection running the
// MediaPipe Hands topology. It's meaningfully more accurate and stable, and
// — critically for this component — every prediction comes with a `score`
// we can use to reject low-confidence noise instead of trusting every frame.
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { 
  ArrowLeft, Camera, Eye, EyeOff, RefreshCw, 
  Trophy, Sparkles, Play, Volume2, VolumeX,
  Pause, AlertCircle, Settings, Sliders, X
} from 'lucide-react';

// ============================================================
// SHAPE DATABASE - Different ways to draw each shape
// ============================================================

const SHAPE_LIBRARY = {
  rectangle: {
    name: 'Rectangle',
    icon: '▭',
    variations: [
      // Variation 1: Standard rectangle (top-left → top-right → bottom-right → bottom-left)
      { points: [{x: 0.2, y: 0.2}, {x: 0.8, y: 0.2}, {x: 0.8, y: 0.8}, {x: 0.2, y: 0.8}], description: 'Standard rectangle' },
      // Variation 2: Wide rectangle
      { points: [{x: 0.1, y: 0.3}, {x: 0.9, y: 0.3}, {x: 0.9, y: 0.7}, {x: 0.1, y: 0.7}], description: 'Wide rectangle' },
      // Variation 3: Tall rectangle
      { points: [{x: 0.3, y: 0.1}, {x: 0.7, y: 0.1}, {x: 0.7, y: 0.9}, {x: 0.3, y: 0.9}], description: 'Tall rectangle' },
      // Variation 4: Diamond rectangle (rotated)
      { points: [{x: 0.5, y: 0.15}, {x: 0.85, y: 0.5}, {x: 0.5, y: 0.85}, {x: 0.15, y: 0.5}], description: 'Diamond shape' },
    ]
  },
  circle: {
    name: 'Circle',
    icon: '○',
    variations: [
      { points: getCirclePoints(0.5, 0.5, 0.3, 12), description: 'Standard circle' },
      { points: getCirclePoints(0.5, 0.5, 0.35, 14), description: 'Large circle' },
      { points: getCirclePoints(0.5, 0.5, 0.25, 10), description: 'Small circle' },
      { points: getCirclePoints(0.5, 0.5, 0.3, 16), description: 'Detailed circle' },
    ]
  },
  triangle: {
    name: 'Triangle',
    icon: '△',
    variations: [
      { points: [{x: 0.5, y: 0.1}, {x: 0.9, y: 0.9}, {x: 0.1, y: 0.9}], description: 'Standard triangle' },
      { points: [{x: 0.5, y: 0.1}, {x: 0.8, y: 0.9}, {x: 0.2, y: 0.9}], description: 'Narrow triangle' },
      { points: [{x: 0.5, y: 0.1}, {x: 0.9, y: 0.8}, {x: 0.1, y: 0.8}], description: 'Wide triangle' },
      { points: [{x: 0.3, y: 0.2}, {x: 0.8, y: 0.8}, {x: 0.2, y: 0.8}], description: 'Leaning triangle' },
    ]
  },
  star: {
    name: 'Star',
    icon: '★',
    variations: [
      { points: getStarPoints(0.5, 0.5, 0.35, 0.15, 5), description: '5-point star' },
      { points: getStarPoints(0.5, 0.5, 0.3, 0.12, 5), description: 'Small star' },
      { points: getStarPoints(0.5, 0.5, 0.4, 0.18, 5), description: 'Large star' },
    ]
  },
  heart: {
    name: 'Heart',
    icon: '♥',
    variations: [
      { points: getHeartPoints(0.5, 0.5, 0.3), description: 'Standard heart' },
      { points: getHeartPoints(0.5, 0.5, 0.35), description: 'Large heart' },
      { points: getHeartPoints(0.5, 0.5, 0.25), description: 'Small heart' },
    ]
  },
  pentagon: {
    name: 'Pentagon',
    icon: '⬠',
    variations: [
      { points: getPolygonPoints(0.5, 0.5, 0.32, 5), description: 'Standard pentagon' },
      { points: getPolygonPoints(0.5, 0.5, 0.37, 5), description: 'Large pentagon' },
    ]
  },
  arrow: {
    name: 'Arrow',
    icon: '➤',
    variations: [
      { points: getArrowPoints(0.5, 0.5, 0.28), description: 'Right-pointing arrow' },
    ]
  }
};

// Helper functions to generate shape points
function getCirclePoints(cx, cy, r, segments) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    points.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    });
  }
  return points;
}

function getStarPoints(cx, cy, outerR, innerR, points) {
  const result = [];
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerR : innerR;
    const angle = (i / (points * 2)) * 2 * Math.PI - Math.PI / 2;
    result.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    });
  }
  return result;
}

function getHeartPoints(cx, cy, size) {
  const points = [];
  const segments = 20;
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * 2 * Math.PI;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
    points.push({
      x: cx + (x / 16) * size,
      y: cy - (y / 16) * size
    });
  }
  return points;
}

function getPolygonPoints(cx, cy, r, sides, rotation = -Math.PI / 2) {
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = rotation + (i / sides) * 2 * Math.PI;
    points.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return points;
}

function getArrowPoints(cx, cy, size) {
  const w = size, h = size * 0.6;
  return [
    { x: cx - w, y: cy - h * 0.3 },
    { x: cx + w * 0.2, y: cy - h * 0.3 },
    { x: cx + w * 0.2, y: cy - h * 0.7 },
    { x: cx + w, y: cy },
    { x: cx + w * 0.2, y: cy + h * 0.7 },
    { x: cx + w * 0.2, y: cy + h * 0.3 },
    { x: cx - w, y: cy + h * 0.3 },
  ];
}

// Closest point to p on the line segment a→b (t is how far along the segment, 0..1)
function closestPointOnSegment(p, a, b) {
  const abx = b.x - a.x, aby = b.y - a.y;
  const apx = p.x - a.x, apy = p.y - a.y;
  const lenSq = abx * abx + aby * aby || 1e-9;
  let t = (apx * abx + apy * aby) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return { x: a.x + t * abx, y: a.y + t * aby, t };
}

// Closest point to p anywhere on the closed shape outline (closedPoints must
// already include the closing point back to the start). Also returns which
// segment it landed on and how far along it — used to track how much of the
// outline the patient has actually traced (for live progress / auto-complete).
function closestPointOnShape(p, closedPoints) {
  let best = null, bestDist = Infinity, bestSegment = 0;
  for (let i = 0; i < closedPoints.length - 1; i++) {
    const c = closestPointOnSegment(p, closedPoints[i], closedPoints[i + 1]);
    const d = Math.hypot(c.x - p.x, c.y - p.y);
    if (d < bestDist) {
      bestDist = d;
      best = c;
      bestSegment = i;
    }
  }
  return { point: best, distance: bestDist, segment: bestSegment, t: best.t };
}

// ============================================================
// TUNABLE HAND-TRACKING CONSTANTS
// Adjust these if tracking feels wrong for your camera/lighting/setup.
// ============================================================
const DEFAULT_PINCH_THRESHOLD = 0.055; // fraction of frame width; smaller = stricter pinch to start drawing (user-adjustable in-game). Was 0.08 — fingers count as "pinched" any time they're within 8% of frame width, which for most webcam distances is close to a relaxed open hand, causing drawing to fire unintentionally.
const SMOOTHING = 0.4;         // 0 = raw/jumpy, 1 = frozen/laggy — how much each point blends with the last
const SNAP_RADIUS = 0.045;     // how close to the target path before auto-correct pulls the point onto it. Was 0.09 — wide enough that almost any stroke drawn somewhere in the shape's general area got glued onto the outline before scoring, which is why a rough line could score as a clean circle.
const SNAP_STRENGTH = 0.35;    // 0 = no correction, 1 = snaps fully onto the path. Lowered from 0.5 alongside the radius so even in-range points get a gentler nudge, not a near-total rewrite of where they were actually drawn.
const MIRROR_X = true;         // flip this if the tracked dot moves opposite to your real hand
const MIN_HAND_CONFIDENCE = 0.65; // reject low-confidence detections instead of trusting every frame

// ============================================================
// SOUND + STORAGE HELPERS
// ============================================================

// Tiny synthesized chimes — no audio files to ship, works offline.
function playTone(freq, duration, type = 'sine', delay = 0) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    setTimeout(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    }, delay);
  } catch (e) {
    // Web Audio not available — fail silently, sound is a nice-to-have.
  }
}
const playSuccessSound = () => { playTone(523.25, 120); playTone(659.25, 120, 'sine', 90); playTone(783.99, 220, 'sine', 180); };
const playHighScoreSound = () => { playTone(659.25, 100); playTone(880, 100, 'sine', 90); playTone(1046.5, 300, 'sine', 180); };
const playFailSound = () => playTone(200, 220, 'sawtooth');

const HIGH_SCORE_KEY = 'gestureDrawing_highScore';
const BEST_STREAK_KEY = 'gestureDrawing_bestStreak';

// 21-point MediaPipe hand skeleton connections, used to draw the little
// tracking overlay on the webcam preview so the player can see the AI is
// actually locking onto their hand (and how well).
const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17]
];

// ============================================================
// MAIN GAME COMPONENT
// ============================================================

const GestureDrawing = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const demoCanvasRef = useRef(null);
  
  // Game state
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [coins, setCoins] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showVideo, setShowVideo] = useState(true);
  const [shapeName, setShapeName] = useState('');
  const [shapeVariation, setShapeVariation] = useState(null);
  const [userDrawing, setUserDrawing] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [message, setMessage] = useState('');
  const [detectorModel, setDetectorModel] = useState(null); // MediaPipe Hands detector instance, once loaded
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [matchedVariation, setMatchedVariation] = useState(null);
  const [fingerPos, setFingerPos] = useState(null); // live fingertip position for the mini preview dot
  const [handConfidence, setHandConfidence] = useState(0); // 0-100, live AI detection confidence

  // --- Extra features ---
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHint, setShowHint] = useState(true); // faint target overlay on the drawing canvas
  const [pinchSensitivity, setPinchSensitivity] = useState(DEFAULT_PINCH_THRESHOLD);

  // --- Sensitivity Controls ---
  const [showSettings, setShowSettings] = useState(false);
  const [sensitivitySettings, setSensitivitySettings] = useState({
    smoothing: SMOOTHING,
    minMovement: 0.008,
    pinchThreshold: DEFAULT_PINCH_THRESHOLD,
    snapStrength: SNAP_STRENGTH,
    snapRadius: SNAP_RADIUS,
  });

  // Get available shapes
  const shapeKeys = Object.keys(SHAPE_LIBRARY);
  const [currentShapeKey, setCurrentShapeKey] = useState(shapeKeys[0]);

  // Ref used to cancel/replace the demo trace animation
  const demoAnimRef = useRef(null);
  // Ref that always points at the freshest "do one tracking frame" function,
  // so a single, never-restarted requestAnimationFrame loop can call it
  // without stale-closure bugs and without tearing itself down on every render.
  const tickRef = useRef(() => {});
  // How far along the shape's outline the patient has traced so far (0..1),
  // used for the live auto-correct accuracy meter and to auto-detect a
  // finished drawing without requiring an exact pinch release.
  const maxProgressRef = useRef(0);
  // Smooths raw, jittery landmark positions frame-to-frame.
  const smoothPosRef = useRef(null);
  // Prevents a slow inference call from piling up behind another one.
  const isProcessingRef = useRef(false);
  // Tracks last position for minimum movement filter
  const lastPosRef = useRef(null);
  // Counts consecutive frames where the model returned a "hand" whose
  // score/keypoints were NaN instead of returning no hand at all — a known
  // compatibility issue on some GPU/browser combos with this runtime. Used
  // to tell "no hand in view" apart from "the model is returning garbage".
  const nanStreakRef = useRef(0);
  // Tracks whether the on-screen message is currently showing a tracking
  // error, so handleFrame doesn't call setMessage every single frame.
  const trackingErrorShownRef = useRef(false);
  // Mirrors state that handleFrame (called from the raf loop via tickRef)
  // needs read-fresh every frame without re-subscribing anything.
  const pinchSensitivityRef = useRef(DEFAULT_PINCH_THRESHOLD);
  const soundEnabledRef = useRef(true);
  // Canvas overlaid on the little webcam preview, used to draw the live
  // hand skeleton so the player can *see* the AI locking onto their hand.
  const previewCanvasRef = useRef(null);
  // Canvas overlaid on the user's drawing panel for the success confetti burst.
  const confettiCanvasRef = useRef(null);
  const confettiAnimRef = useRef(null);

  useEffect(() => { pinchSensitivityRef.current = pinchSensitivity; }, [pinchSensitivity]);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

  // Load persisted high score / best streak once on mount.
  useEffect(() => {
    try {
      const storedHigh = parseInt(localStorage.getItem(HIGH_SCORE_KEY), 10);
      if (!isNaN(storedHigh)) setHighScore(storedHigh);
      const storedStreak = parseInt(localStorage.getItem(BEST_STREAK_KEY), 10);
      if (!isNaN(storedStreak)) setBestStreak(storedStreak);
    } catch (e) {
      // localStorage unavailable (private browsing, etc.) — not critical.
    }
  }, []);

  // Little canvas confetti burst, fired on a successful shape match.
  const triggerConfetti = useCallback(() => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const colors = ['#4f6df5', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];
    const particles = Array.from({ length: 50 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 9,
      vy: (Math.random() - 1.3) * 9,
      size: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    }));
    if (confettiAnimRef.current) cancelAnimationFrame(confettiAnimRef.current);
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.life -= 0.02;
        if (p.life > 0) {
          alive = true;
          ctx.globalAlpha = Math.max(p.life, 0);
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      });
      ctx.globalAlpha = 1;
      if (alive) confettiAnimRef.current = requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    animate();
  }, []);

  // Draw the live hand skeleton onto the mini webcam preview, in the
  // preview's own pixel space (scaled from the raw video frame).
  const drawHandSkeleton = useCallback((keypoints, videoWidth, videoHeight) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scaleX = canvas.width / videoWidth;
    const scaleY = canvas.height / videoHeight;
    // keypoints are already in mirrored space (estimateHands was called
    // with flipHorizontal: true, same as the fingertip dot below), and this
    // canvas has no CSS mirror of its own — unlike the <Webcam> it sits on
    // top of. Flipping a second time here drew the skeleton on the wrong
    // side of the preview, opposite the fingertip dot and the real hand.
    const mx = (x) => x * scaleX;
    const my = (y) => y * scaleY;

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.9)';
    ctx.lineWidth = 2;
    HAND_CONNECTIONS.forEach(([a, b]) => {
      const pa = keypoints[a], pb = keypoints[b];
      if (!pa || !pb) return;
      ctx.beginPath();
      ctx.moveTo(mx(pa.x), my(pa.y));
      ctx.lineTo(mx(pb.x), my(pb.y));
      ctx.stroke();
    });
    keypoints.forEach((kp, i) => {
      ctx.beginPath();
      ctx.arc(mx(kp.x), my(kp.y), i === 8 || i === 4 ? 3.5 : 2, 0, 2 * Math.PI);
      ctx.fillStyle = i === 8 ? '#f59e0b' : i === 4 ? '#4f6df5' : '#10b981';
      ctx.fill();
    });
  }, []);

  // Load hand-tracking model.
  //
  // Ground truth from testing: the 'tfjs' runtime (both WebGL AND CPU
  // backend) reliably returns NaN score/keypoints on this setup — so this
  // is NOT the WebGL-specific issue tensorflow/tfjs#7204 describes, it's
  // the whole 'tfjs' runtime path being unusable here. The 'mediapipe'
  // runtime (MediaPipe's own WASM pipeline, bypassing tfjs kernels
  // entirely) is the one Google's own demo relies on and is the only path
  // that actually returns real data — so it's the target, not a fallback.
  //
  // Two things were breaking mediapipe runtime loading itself:
  //  1. An unpinned solutionPath ('.../@mediapipe/hands' with no version)
  //     can resolve the JS loader glue and the .wasm binary to DIFFERENT
  //     published versions (independently cached by the CDN) — a known
  //     cause of the "Module.arguments has been replaced with plain
  //     arguments_" abort. Pinning an exact version fixes this by
  //     guaranteeing the glue and binary always match.
  //  2. React 18 Strict Mode runs effects twice in development, so this
  //     effect can fire twice back-to-back. The legacy MediaPipe WASM
  //     loader keeps global state on `window.Module` and does not
  //     tolerate two concurrent loads stepping on each other — also a
  //     documented cause of the same abort. loadStartedRef below ensures
  //     we only ever kick off one load.
  const loadStartedRef = useRef(false);
  useEffect(() => {
    if (loadStartedRef.current) return;
    loadStartedRef.current = true;

    const loadModel = async () => {
      let detector = null;

      try {
        detector = await handPoseDetection.createDetector(
          handPoseDetection.SupportedModels.MediaPipeHands,
          {
            runtime: 'mediapipe',
            // Pinned to an exact release so the JS loader and the .wasm
            // binary can never mismatch. Bump this deliberately (not to
            // a bare/unpinned tag) if you ever want a newer version.
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240',
            modelType: 'full',
            maxHands: 1,
          }
        );
      } catch (mediapipeError) {
        console.warn('MediaPipe runtime failed to load, falling back to tfjs/cpu:', mediapipeError);
      }

      // Last-resort fallback: the tfjs runtime on CPU. Note this is known
      // to be unreliable for this model (see comment above) — it's only
      // here so the app doesn't stay stuck on "Loading AI model…" forever
      // if the jsdelivr CDN is completely unreachable (e.g. blocked
      // network) and mediapipe can't load at all.
      if (!detector) {
        try {
          await tf.setBackend('cpu');
          await tf.ready();
          detector = await handPoseDetection.createDetector(
            handPoseDetection.SupportedModels.MediaPipeHands,
            { runtime: 'tfjs', modelType: 'full', maxHands: 1 }
          );
        } catch (cpuError) {
          console.error('Failed to load handpose model on any runtime:', cpuError);
          setMessage('⚠️ Could not load hand-tracking model. Please check your connection to cdn.jsdelivr.net and refresh.');
          setIsLoading(false);
          return;
        }
      }

      setDetectorModel(detector);
      setIsLoading(false);
      generateNewShape();
    };
    loadModel();
  }, []);

  // Generate random shape variation
  const generateNewShape = useCallback(() => {
    const keys = Object.keys(SHAPE_LIBRARY);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const shape = SHAPE_LIBRARY[randomKey];
    const variationIndex = Math.floor(Math.random() * shape.variations.length);
    const variation = shape.variations[variationIndex];
    
    setCurrentShapeKey(randomKey);
    setShapeName(shape.name);
    setShapeVariation(variation);
    setMatchedVariation(null);
    setUserDrawing([]);
    setIsDrawing(false);
    setAccuracy(0);
    setShowVideo(true);
    setMessage('');

    // Cancel any in-flight trace animation and blank the canvas — the actual
    // demo plays when the user hits "Watch Demo" / "Replay Demo" (see the
    // showVideo effect below), so it reads as a video instead of a static image.
    if (demoAnimRef.current) cancelAnimationFrame(demoAnimRef.current);
    maxProgressRef.current = 0;
    smoothPosRef.current = null;
    lastPosRef.current = null;
    const canvas = demoCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0,0,0,0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Draw demo pattern on demo canvas
  const drawDemoPattern = (points) => {
    const canvas = demoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid background
    ctx.fillStyle = 'rgba(0,0,0,0.03)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the shape
    ctx.beginPath();
    ctx.strokeStyle = '#4f6df5';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(79, 109, 245, 0.3)';
    ctx.shadowBlur = 10;
    
    points.forEach((p, i) => {
      const x = p.x * canvas.width;
      const y = p.y * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
    
    // Draw animated dots
    points.forEach((p, i) => {
      const x = p.x * canvas.width;
      const y = p.y * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = i === 0 ? '#10b981' : '#4f6df5';
      ctx.fill();
    });
  };

  // Animate the target shape being traced, point by point — this is the
  // actual "demo video". Called when the "Watch Demo" / "Replay Demo"
  // overlay is dismissed (see the showVideo effect further down).
  const animateDemoPattern = useCallback((points) => {
    const canvas = demoCanvasRef.current;
    if (!canvas || !points || points.length === 0) return;
    if (demoAnimRef.current) cancelAnimationFrame(demoAnimRef.current);

    const ctx = canvas.getContext('2d');
    const closed = [...points, points[0]];
    const lastIdx = closed.length - 1;
    const totalSegments = lastIdx; // n vertices + closing edge = n segments
    const duration = 1800; // ms to trace the full shape
    const startTime = performance.now();
    const px = (p) => p.x * canvas.width;
    const py = (p) => p.y * canvas.height;
    // Clamped accessor — guarantees drawFrame can never read past the array,
    // regardless of any floating-point edge case in the progress math below
    // (this is what the "Cannot read properties of undefined" crash was).
    const at = (i) => closed[Math.max(0, Math.min(lastIdx, i))];

    const drawFrame = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0,0,0,0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const segmentProgress = progress * totalSegments;
      const fullSegments = Math.max(0, Math.min(totalSegments, Math.floor(segmentProgress)));
      const partial = Math.max(0, segmentProgress - fullSegments);

      ctx.beginPath();
      ctx.strokeStyle = '#4f6df5';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(79, 109, 245, 0.3)';
      ctx.shadowBlur = 10;
      ctx.moveTo(px(at(0)), py(at(0)));

      let cursor = { x: px(at(0)), y: py(at(0)) };
      for (let i = 1; i <= fullSegments; i++) {
        ctx.lineTo(px(at(i)), py(at(i)));
        cursor = { x: px(at(i)), y: py(at(i)) };
      }
      if (fullSegments < totalSegments && partial > 0) {
        const a = at(fullSegments);
        const b = at(fullSegments + 1);
        cursor = {
          x: px(a) + (px(b) - px(a)) * partial,
          y: py(a) + (py(b) - py(a)) * partial
        };
        ctx.lineTo(cursor.x, cursor.y);
      }
      ctx.stroke();

      // Start-point marker
      ctx.beginPath();
      ctx.arc(px(at(0)), py(at(0)), 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#10b981';
      ctx.fill();

      // Moving "pen" marker showing where the trace currently is
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, 7, 0, 2 * Math.PI);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (progress < 1) {
        demoAnimRef.current = requestAnimationFrame(drawFrame);
      } else {
        drawDemoPattern(points); // freeze on the finished pattern with all vertex dots
        demoAnimRef.current = null;
      }
    };

    demoAnimRef.current = requestAnimationFrame(drawFrame);
  }, []);

  // Play (or replay) the demo animation whenever the "Watch Demo" overlay
  // is dismissed, and clean up if the component unmounts mid-animation.
  useEffect(() => {
    if (!showVideo && shapeVariation) {
      animateDemoPattern(shapeVariation.points);
    }
    return () => {
      if (demoAnimRef.current) cancelAnimationFrame(demoAnimRef.current);
    };
  }, [showVideo, shapeVariation, animateDemoPattern]);

  // Draw user's hand tracking on canvas
  const drawUserDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.fillStyle = 'rgba(0,0,0,0.02)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Optional faint guide of the target outline, drawn right on the
    // drawing canvas (as opposed to the separate demo panel) so it's easy
    // to trace against without cross-referencing the other canvas.
    if (showHint && shapeVariation) {
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.strokeStyle = '#4f6df5';
      ctx.lineWidth = 2;
      shapeVariation.points.forEach((p, i) => {
        const x = p.x * canvas.width;
        const y = p.y * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
    
    // Draw user's drawing
    if (userDrawing.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(16, 185, 129, 0.3)';
      ctx.shadowBlur = 8;
      
      userDrawing.forEach((p, i) => {
        const x = p.x * canvas.width;
        const y = p.y * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      
      // Draw dots
      userDrawing.forEach((p, i) => {
        const x = p.x * canvas.width;
        const y = p.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = i === 0 ? '#f59e0b' : '#10b981';
        ctx.fill();
      });
    }
    
    // Draw accuracy overlay
    if (accuracy > 0) {
      ctx.fillStyle = `rgba(79, 109, 245, ${accuracy / 200})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [userDrawing, accuracy, showHint, shapeVariation]);

  // Handle one webcam frame. This is a plain function (not memoized) so it
  // always closes over the current render's state — it's invoked via
  // tickRef, never called directly by an interval, so staleness isn't an issue.
  const handleFrame = async () => {
    if (!detectorModel || !isPlaying || !webcamRef.current) return;
    // If the previous frame's inference hasn't resolved yet, skip this tick
    // instead of stacking another call behind it — this was the main cause
    // of the lag, since estimateHands can take longer than the tick interval.
    if (isProcessingRef.current) return;
    if (isComplete) return; // pause input during the brief success celebration

    const video = webcamRef.current.video;
    // videoWidth/videoHeight are 0 until the stream has real frames, and
    // readyState 4 means "enough data to play" — both must hold.
    if (!video || video.readyState !== 4 || !video.videoWidth) return;

    isProcessingRef.current = true;
    try {
      // flipHorizontal matches the coordinates to the mirrored preview the
      // user sees, so MIRROR_X below is now just a manual override switch.
      const hands = await detectorModel.estimateHands(video, { flipHorizontal: MIRROR_X });
      // A successful call means the model itself is responding — clear any
      // previously-shown tracking-error message rather than leaving it stuck.
      if (trackingErrorShownRef.current) {
        trackingErrorShownRef.current = false;
        setMessage('');
      }

      const rawHand = hands.length > 0 ? hands[0] : null;
      // Some GPU/browser combinations have a documented issue where this
      // model (MediaPipeHands via the 'tfjs' runtime on the WebGL backend)
      // returns a "hand" whose score and/or keypoints are NaN instead of
      // simply returning no hand — see tensorflow/tfjs#7204. NaN comparisons
      // are always false, so a hand like this would otherwise fail every
      // check below (confidence gate, bounds check, pinch distance) and
      // look pixel-for-pixel identical to "no hand in frame", with nothing
      // in the UI to tell the two apart.
      const isFiniteHand = !!rawHand
        && Number.isFinite(rawHand.score)
        && Array.isArray(rawHand.keypoints)
        && rawHand.keypoints.length === 21
        && rawHand.keypoints.every(kp => Number.isFinite(kp.x) && Number.isFinite(kp.y));

      if (rawHand && !isFiniteHand) {
        nanStreakRef.current += 1;
        console.warn(
          'Hand detected but score/keypoints were non-finite; treating as no hand for this frame.',
          rawHand
        );
        // One or two stray NaN frames is normal noise; a long unbroken
        // streak means every frame is unusable, which points at the known
        // GPU/WebGL compatibility issue rather than "no hand in view".
        if (nanStreakRef.current === 20) {
          setMessage('⚠️ Your browser/GPU appears to be returning invalid hand-tracking data. Try Chrome, or a different device — this is a known WebGL compatibility issue with this model.');
        }
      } else {
        nanStreakRef.current = 0;
      }

      // Reject low-confidence detections outright — this is the single
      // biggest lever for "poor tracking": a handful of noisy, half-guessed
      // frames per second was what made the fingertip feel like it was
      // teleporting around. Anything below MIN_HAND_CONFIDENCE is treated
      // as "no hand" rather than plotted.
      const hand = isFiniteHand && rawHand.score >= MIN_HAND_CONFIDENCE ? rawHand : null;
      setHandConfidence(isFiniteHand ? Math.round(rawHand.score * 100) : 0);

      if (hand) {
        const keypoints = hand.keypoints; // [{x, y, name}, ...] in video pixel space, already mirror-flipped
        const indexFinger = keypoints[8]; // Index finger tip
        const thumbTip = keypoints[4]; // Thumb tip

        drawHandSkeleton(keypoints, video.videoWidth, video.videoHeight);

        // Normalize against the video's own pixel size (not the on-screen
        // canvas's bounding box — those are unrelated coordinate systems).
        let x = indexFinger.x / video.videoWidth;
        let y = indexFinger.y / video.videoHeight;

        // Smooth out frame-to-frame jitter with user-adjustable smoothing
        const smoothing = sensitivitySettings.smoothing;
        if (smoothPosRef.current) {
          x = smoothPosRef.current.x * smoothing + x * (1 - smoothing);
          y = smoothPosRef.current.y * smoothing + y * (1 - smoothing);
        }
        smoothPosRef.current = { x, y };
        setFingerPos({ x, y });

        // ===== MINIMUM MOVEMENT FILTER =====
        // Skip tiny movements to ignore hand jitter
        const minMove = sensitivitySettings.minMovement;
        if (lastPosRef.current) {
          const dx = x - lastPosRef.current.x;
          const dy = y - lastPosRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minMove) {
            // Skip tiny movements - just update position without drawing
            isProcessingRef.current = false;
            return;
          }
        }
        lastPosRef.current = { x, y };

        // Pinch distance as a fraction of frame width
        const dx = indexFinger.x - thumbTip.x;
        const dy = indexFinger.y - thumbTip.y;
        const pinchDistance = Math.sqrt(dx * dx + dy * dy) / video.videoWidth;
        // Use user-adjusted pinch threshold
        const currentPinchThreshold = sensitivitySettings.pinchThreshold;

        if (x > 0 && x < 1 && y > 0 && y < 1) {
          if (pinchDistance < currentPinchThreshold) {
            setIsDrawing(true);

            // AUTO-CORRECT: if the fingertip is reasonably close to the
            // target outline, gently pull the plotted point onto the
            // nearest spot on that outline instead of plotting it exactly
            // where the (possibly shaky) hand was.
            let plotted = { x, y };
            if (shapeVariation) {
              const closed = [...shapeVariation.points, shapeVariation.points[0]];
              const { point: nearest, distance, segment, t } = closestPointOnShape({ x, y }, closed);
              // Use user-adjusted snap radius and strength
              const snapRadius = sensitivitySettings.snapRadius;
              const snapStrength = sensitivitySettings.snapStrength;
              if (distance < snapRadius) {
                plotted = {
                  x: x + (nearest.x - x) * snapStrength,
                  y: y + (nearest.y - y) * snapStrength
                };
                // Track furthest point reached along the outline so far —
                // this is the live "% traced correctly" the patient sees,
                // and also what triggers auto-completion below.
                const totalSegments = closed.length - 1;
                const progress = (segment + t) / totalSegments;
                if (progress > maxProgressRef.current) {
                  maxProgressRef.current = progress;
                  setAccuracy(Math.round(maxProgressRef.current * 100));
                }
              }
            }

            setUserDrawing(prev => {
              const newPoints = [...prev, plotted];
              return newPoints.length > 200 ? newPoints.slice(-200) : newPoints;
            });

            // AUTO-ANALYZE: once most of the outline has been traced well
            // and the fingertip is back near the starting point, score the
            // drawing automatically — the patient doesn't have to release
            // the pinch at exactly the right instant.
            if (shapeVariation && maxProgressRef.current >= 0.92 && userDrawing.length > 15) {
              const distToStart = Math.hypot(x - shapeVariation.points[0].x, y - shapeVariation.points[0].y);
              if (distToStart < 0.14) {
                setIsDrawing(false);
                checkDrawingMatch();
              }
            }
          } else if (isDrawing) {
            setIsDrawing(false);
            // Check if drawing is complete
            if (userDrawing.length > 10) {
              checkDrawingMatch();
            }
          }
        }
      } else {
        setFingerPos(null);
        smoothPosRef.current = null;
        lastPosRef.current = null;
        const previewCanvas = previewCanvasRef.current;
        if (previewCanvas) previewCanvas.getContext('2d').clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      }
    } catch (error) {
      console.error('Hand tracking error:', error);
      setHandConfidence(0);
      // Without this, a persistently-throwing estimateHands() call is
      // indistinguishable from "no hand in view" — nothing in the UI would
      // ever tell you tracking is actually broken vs. your hand being
      // out of frame.
      if (!trackingErrorShownRef.current) {
        trackingErrorShownRef.current = true;
        setMessage(`⚠️ Hand-tracking error: ${error?.message || 'unknown error'} (see browser console for details)`);
      }
    } finally {
      isProcessingRef.current = false;
    }
  };

  // Keep tickRef pointed at the freshest handleFrame every render.
  useEffect(() => {
    tickRef.current = handleFrame;
  });

  // A single, never-restarted requestAnimationFrame loop drives tracking.
  // (The old version used setInterval with handleFrame/drawUserDrawing in
  // its dependency array, which tore the interval down and rebuilt it on
  // almost every frame while drawing — via tickRef we get fresh state
  // without that churn.)
  useEffect(() => {
    let rafId;
    let lastRun = 0;
    const loop = (time) => {
      if (time - lastRun >= 70) { // try more often; isProcessingRef still prevents pile-up if inference is slower than this
        tickRef.current();
        lastRun = time;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Redraw the canvas whenever the user's stroke or accuracy overlay changes.
  useEffect(() => {
    drawUserDrawing();
  }, [userDrawing, accuracy, drawUserDrawing]);

  // Check if drawing matches the target shape
  const checkDrawingMatch = useCallback(() => {
    if (!shapeVariation || userDrawing.length < 10) {
      setMessage('✋ Draw more! Keep going...');
      return;
    }

    const target = shapeVariation.points;
    const closed = [...target, target[0]];

    // Robust, path-based accuracy: average distance from each drawn point
    // to the nearest point anywhere on the target outline. Unlike pairing
    // drawn points to target points by index, this doesn't punish the
    // patient for drawing at a different speed or with a different number
    // of points than the reference shape happens to have.
    let totalDistance = 0;
    userDrawing.forEach(p => {
      const { distance } = closestPointOnShape(p, closed);
      totalDistance += distance;
    });
    const avgDistance = totalDistance / userDrawing.length;
    const shapeAccuracy = Math.max(0, Math.min(100, 100 - avgDistance * 300));

    // Blend in how much of the outline was actually covered, so tracing
    // only a small correct-looking arc doesn't score as a finished shape.
    const coverage = Math.min(1, maxProgressRef.current);
    const accuracyScore = shapeAccuracy * (0.5 + 0.5 * coverage);
    setAccuracy(accuracyScore);
    
    // Check if accuracy is high enough. Was >50 — combined with the old,
    // wider SNAP_RADIUS that pulled loose points onto the outline before
    // this check ever ran, that threshold made almost any rough stroke
    // pass. Now that snapping is tighter (so avgDistance actually
    // reflects how close the real drawing was), 65% is the real bar.
    if (accuracyScore > 65) {
      // Success!
      setMatchedVariation(shapeVariation);
      setMessage(`✅ Perfect! ${shapeName} drawn correctly! (${Math.round(accuracyScore)}%)`);
      if (soundEnabledRef.current) playSuccessSound();
      triggerConfetti();

      // Speed bonus rewards a clean, efficient trace (fewer plotted points
      // for the same accuracy generally means a more confident gesture).
      const speedBonus = userDrawing.length < 45 ? 10 : 0;
      const pointsEarned = 20 * level + speedBonus;
      setScore(prev => {
        const next = prev + pointsEarned;
        setHighScore(hs => {
          if (next > hs) {
            setIsNewHighScore(true);
            if (soundEnabledRef.current) playHighScoreSound();
            try { localStorage.setItem(HIGH_SCORE_KEY, String(next)); } catch (e) {}
            return next;
          }
          return hs;
        });
        return next;
      });
      setCoins(prev => prev + Math.floor(accuracyScore / 20));

      // Streak of consecutive successful shapes
      setStreak(prev => {
        const next = prev + 1;
        setBestStreak(b => {
          if (next > b) {
            try { localStorage.setItem(BEST_STREAK_KEY, String(next)); } catch (e) {}
            return next;
          }
          return b;
        });
        return next;
      });
      
      // Level up
      const newLevel = level + 1;
      setLevel(newLevel);
      
      // Checkpoint every 5 levels
      if (newLevel % 5 === 0) {
        setLives(prev => Math.min(prev + 1, 5));
        setMessage(`🚩 Checkpoint! +1 Life!`);
      }
      
      setIsComplete(true);
      setTimeout(() => {
        setIsComplete(false);
        setIsNewHighScore(false);
        generateNewShape();
      }, 3000);
    } else {
      setMessage(`❌ Try again! Accuracy: ${Math.round(accuracyScore)}%. Need 65%+`);
      if (soundEnabledRef.current) playFailSound();
      setStreak(0);
      // Lose a life for poor attempt
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives === 0) {
          setIsGameOver(true);
        }
        return newLives;
      });
      // Clean slate for the retry, rather than continuing to append to the
      // same (already scored) trace.
      setUserDrawing([]);
      maxProgressRef.current = 0;
      lastPosRef.current = null;
    }
  }, [shapeVariation, userDrawing, level, shapeName, generateNewShape, triggerConfetti]);

  // Reset game
  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setLives(3);
    setCoins(0);
    setStreak(0);
    setUserDrawing([]);
    setIsGameOver(false);
    setIsComplete(false);
    setAccuracy(0);
    setMessage('');
    lastPosRef.current = null;
    smoothPosRef.current = null;
    generateNewShape();
  };

  const CONTINUE_COST = 15; // coins

  // Spend coins to continue instead of starting over from level 1.
  const continueFromCheckpoint = () => {
    if (coins < CONTINUE_COST) return;
    setCoins(prev => prev - CONTINUE_COST);
    setLives(1);
    setIsGameOver(false);
    setUserDrawing([]);
    setMessage('');
    lastPosRef.current = null;
    smoothPosRef.current = null;
    generateNewShape();
  };

  // Sensitivity Settings Modal
  const SensitivitySettingsModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Sliders className="w-6 h-6 mr-2 text-primary-500" />
            Sensitivity Settings
          </h2>
          <button
            onClick={() => setShowSettings(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Smoothing */}
          <div>
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Smoothing
              </label>
              <span className="text-sm text-primary-600 dark:text-primary-400">
                {Math.round(sensitivitySettings.smoothing * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.3"
              max="0.95"
              step="0.05"
              value={sensitivitySettings.smoothing}
              onChange={(e) => setSensitivitySettings(prev => ({ 
                ...prev, 
                smoothing: parseFloat(e.target.value) 
              }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Higher = smoother lines, Lower = more responsive</p>
          </div>

          {/* Minimum Movement */}
          <div>
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ignore Small Movements
              </label>
              <span className="text-sm text-primary-600 dark:text-primary-400">
                {Math.round(sensitivitySettings.minMovement * 1000)}%
              </span>
            </div>
            <input
              type="range"
              min="0.002"
              max="0.025"
              step="0.001"
              value={sensitivitySettings.minMovement}
              onChange={(e) => setSensitivitySettings(prev => ({ 
                ...prev, 
                minMovement: parseFloat(e.target.value) 
              }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Higher = ignores hand tremors, Lower = more sensitive</p>
          </div>

          {/* Pinch Threshold */}
          <div>
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Pinch Sensitivity
              </label>
              <span className="text-sm text-primary-600 dark:text-primary-400">
                {Math.round(sensitivitySettings.pinchThreshold * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.03"
              max="0.15"
              step="0.005"
              value={sensitivitySettings.pinchThreshold}
              onChange={(e) => setSensitivitySettings(prev => ({ 
                ...prev, 
                pinchThreshold: parseFloat(e.target.value) 
              }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Higher = easier to draw, Lower = harder to trigger</p>
          </div>

          {/* Snap Strength */}
          <div>
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto-Correction
              </label>
              <span className="text-sm text-primary-600 dark:text-primary-400">
                {Math.round(sensitivitySettings.snapStrength * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.9"
              step="0.05"
              value={sensitivitySettings.snapStrength}
              onChange={(e) => setSensitivitySettings(prev => ({ 
                ...prev, 
                snapStrength: parseFloat(e.target.value) 
              }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Higher = snaps to shape, Lower = follows your hand</p>
          </div>

          {/* Snap Radius */}
          <div>
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Snap Distance
              </label>
              <span className="text-sm text-primary-600 dark:text-primary-400">
                {Math.round(sensitivitySettings.snapRadius * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.15"
              step="0.005"
              value={sensitivitySettings.snapRadius}
              onChange={(e) => setSensitivitySettings(prev => ({ 
                ...prev, 
                snapRadius: parseFloat(e.target.value) 
              }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">How close your hand needs to be to the shape for correction</p>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setSensitivitySettings({
                  smoothing: SMOOTHING,
                  minMovement: 0.008,
                  pinchThreshold: DEFAULT_PINCH_THRESHOLD,
                  snapStrength: SNAP_STRENGTH,
                  snapRadius: SNAP_RADIUS,
                });
              }}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Reset Defaults
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render tutorial
  if (showTutorial) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => navigate('/games')}
          className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Games
        </button>
        
        <div className="glass-card rounded-2xl p-8 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">✋</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">
              Gesture Drawing
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Draw shapes with your finger using hand gestures!</p>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <span className="text-2xl">👆</span>
              <div>
                <h3 className="font-bold">Step 1: Watch the Demo</h3>
                <p className="text-gray-600 dark:text-gray-300">A video will show you how to draw the shape</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl">
              <span className="text-2xl">🤏</span>
              <div>
                <h3 className="font-bold">Step 2: Pinch to Draw</h3>
                <p className="text-gray-600 dark:text-gray-300">Touch your thumb and index finger together to start drawing</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-bold">Step 3: Release to Check</h3>
                <p className="text-gray-600 dark:text-gray-300">Release your fingers to check if your drawing matches</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-bold">Shapes & Variations</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Each shape has multiple variations - watch carefully and draw the exact pattern shown!
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold">Smarter, More Accurate Tracking</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Upgraded to a more accurate AI hand-tracking model with confidence checking, live skeleton
                  feedback, streaks, a high score, sound, and an optional hint outline you can toggle in-game.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setShowTutorial(false)}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-primary-500 to-indigo-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              <Play className="w-5 h-5 inline mr-2" />
              Start Playing
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game Over Screen
  if (isGameOver) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => navigate('/games')}
          className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Games
        </button>
        
        <div className="glass-card rounded-2xl p-8 max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">😅</div>
          <h2 className="text-3xl font-bold text-red-500 mb-4">Game Over!</h2>
          <p className="text-xl mb-2">Final Score: {score}{score >= highScore && score > 0 && <span className="text-amber-500"> 🏆 New Best!</span>}</p>
          <p className="text-xl mb-2">Level Reached: {level}</p>
          <p className="text-xl mb-2">Coins Earned: {coins} 🪙</p>
          <p className="text-lg mb-6 text-gray-500">
            <Trophy className="w-4 h-4 inline mr-1 text-amber-500" /> Best Score: {highScore} &nbsp;•&nbsp; 🔥 Best Streak: {bestStreak}
          </p>
          
          <div className="flex flex-col gap-3">
            {coins >= CONTINUE_COST && (
              <button
                onClick={continueFromCheckpoint}
                className="px-8 py-3 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-all"
              >
                ⚡ Continue for {CONTINUE_COST} 🪙 (1 life)
              </button>
            )}
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-gradient-to-r from-primary-500 to-indigo-500 text-white rounded-lg font-bold hover:shadow-lg transition-all"
            >
              🔁 Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Game
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/games')}
          className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Games
        </button>
        
        <div className="flex items-center space-x-4 flex-wrap gap-y-1">
          <span className="text-lg font-bold text-primary-600">⭐ Score: {score}</span>
          <span className="text-lg font-bold text-purple-600">📊 Level: {level}</span>
          <span className="text-lg font-bold text-red-500">❤️ {lives}</span>
          <span className="text-lg font-bold text-yellow-500">🪙 {coins}</span>
          {streak > 1 && <span className="text-lg font-bold text-orange-500">🔥 {streak}</span>}
          <span className="text-sm font-semibold text-gray-400" title="Best score">
            <Trophy className="w-4 h-4 inline mr-1 text-amber-500" />{highScore}
          </span>
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title="Adjust Sensitivity"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* AI Status + Settings */}
      <div className="glass-card rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className={isLoading ? 'text-indigo-500 font-semibold' : isPlaying ? 'text-green-500 font-semibold' : 'text-gray-400 font-semibold'}>
            {isLoading ? '🧠 Loading AI model…' : isPlaying ? '🟢 Tracking' : '⚪ Paused'}
          </span>
          {isPlaying && !isLoading && (
            handConfidence >= MIN_HAND_CONFIDENCE * 100 ? (
              <span className="text-gray-500">AI confidence: {handConfidence}%</span>
            ) : (
              <span className="text-amber-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {handConfidence > 0 ? `Low confidence (${handConfidence}%)` : 'No hand detected'}
              </span>
            )
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setSoundEnabled(s => !s)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowHint(h => !h)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title={showHint ? 'Hide hint outline' : 'Show hint outline'}
          >
            {showHint ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />} Hint
          </button>
          <label className="flex items-center gap-2 text-gray-500">
            Pinch sensitivity
            <input
              type="range"
              min="0.04"
              max="0.14"
              step="0.01"
              value={pinchSensitivity}
              onChange={(e) => setPinchSensitivity(parseFloat(e.target.value))}
              className="w-24 accent-primary-500"
            />
          </label>
        </div>
      </div>

      {/* Shape Info */}
      <div className="glass-card rounded-xl p-4 text-center">
        <h2 className="text-2xl font-bold">
          Draw: <span className="text-primary-600">{shapeName}</span>
          <span className="ml-2 text-3xl">{SHAPE_LIBRARY[currentShapeKey]?.icon}</span>
        </h2>
        <p className="text-sm text-gray-500">
          {shapeVariation?.description || 'Follow the pattern shown'}
        </p>
        {accuracy > 0 && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
              <div 
                className="bg-gradient-to-r from-primary-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${accuracy}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Accuracy: {Math.round(accuracy)}%</p>
          </div>
        )}
      </div>

      {/* Demo Video / Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Demo Pattern */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-center font-bold mb-2">📐 Pattern to Draw</h3>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden" style={{ height: '300px' }}>
            <canvas
              ref={demoCanvasRef}
              width="400"
              height="300"
              className="w-full h-full"
            />
            {showVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <button
                  onClick={() => setShowVideo(false)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700"
                >
                  <Play className="w-5 h-5 inline mr-2" />
                  Watch Demo
                </button>
              </div>
            )}
          </div>
          <div className="flex justify-center mt-2 space-x-2">
            <button
              onClick={generateNewShape}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              <RefreshCw className="w-4 h-4 inline mr-1" />
              New Shape
            </button>
            <button
              onClick={() => setShowVideo(true)}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600"
            >
              <Play className="w-4 h-4 inline mr-1" />
              Replay Demo
            </button>
          </div>
        </div>

        {/* User Drawing Canvas */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-center font-bold mb-2">✋ Your Drawing</h3>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden" style={{ height: '300px' }}>
            <canvas
              ref={canvasRef}
              width="400"
              height="300"
              className="w-full h-full"
            />
            {userDrawing.length === 0 && !isDrawing && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Pinch fingers to start drawing</p>
                </div>
              </div>
            )}
            {isDrawing && (
              <div className="absolute top-2 right-2 px-3 py-1 bg-green-500 text-white text-sm rounded-full animate-pulse">
                Drawing...
              </div>
            )}

            {/* Confetti burst on a successful match */}
            <canvas
              ref={confettiCanvasRef}
              width="400"
              height="300"
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {isNewHighScore && isComplete && (
              <div className="absolute top-2 left-2 px-3 py-1 bg-amber-500 text-white text-sm rounded-full font-bold flex items-center gap-1 animate-bounce">
                <Trophy className="w-4 h-4" /> New High Score!
              </div>
            )}

            {/* Live camera preview + pinch indicator — kept small but VISIBLE.
                Hiding this with display:none (the old approach) causes some
                browsers, especially mobile Safari, to pause video decoding
                entirely, which is a major reason tracking silently failed. */}
            <div className="absolute bottom-2 right-2 w-24 h-20 rounded-lg overflow-hidden border-2 border-white/80 shadow-lg bg-black">
              <Webcam
                ref={webcamRef}
                mirrored={true}
                audio={false}
                videoConstraints={{ facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } }}
                className="w-full h-full object-cover"
                onUserMedia={() => setIsCameraReady(true)}
                onUserMediaError={() => setMessage('⚠️ Camera access denied. Please allow camera access in your browser settings.')}
              />
              {/* Live AI hand-skeleton overlay — visible proof the model is
                  actually locking onto the hand, and how confidently. */}
              <canvas
                ref={previewCanvasRef}
                width="320"
                height="240"
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
              {fingerPos && (
                <div
                  className={`absolute w-3 h-3 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 ${
                    isDrawing ? 'bg-green-400' : 'bg-amber-400'
                  }`}
                  style={{ left: `${fingerPos.x * 100}%`, top: `${fingerPos.y * 100}%` }}
                />
              )}
              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-[10px] text-center px-1">
                  Enable camera
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl text-center text-lg font-semibold ${
          message.includes('✅') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
          message.includes('❌') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
        }`}>
          {message}
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={isLoading}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            isLoading
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
              : isPlaying 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gradient-to-r from-primary-500 to-indigo-500 text-white hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            'Loading AI model…'
          ) : (
            <>
              {isPlaying ? <Pause className="w-5 h-5 inline mr-2" /> : <Play className="w-5 h-5 inline mr-2" />}
              {isPlaying ? 'Pause' : 'Start Tracking'}
            </>
          )}
        </button>
        
        <button
          onClick={() => { setUserDrawing([]); setAccuracy(0); maxProgressRef.current = 0; lastPosRef.current = null; setMessage('🔄 Cleared! Try again.'); }}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <RefreshCw className="w-5 h-5 inline mr-2" />
          Clear Drawing
        </button>
      </div>

      {/* Instructions */}
      <div className="glass-card rounded-xl p-4 text-center text-sm text-gray-500">
        <p>🤏 Pinch thumb and index finger together to draw • ✋ Release to check shape • 🎯 Match the pattern shown</p>
        <p className="text-xs mt-1 text-amber-500">⚙️ Click the gear icon (⚙️) to adjust tracking sensitivity!</p>
      </div>

      {/* Sensitivity Settings Modal */}
      {showSettings && <SensitivitySettingsModal />}
    </div>
  );
};

export default GestureDrawing;