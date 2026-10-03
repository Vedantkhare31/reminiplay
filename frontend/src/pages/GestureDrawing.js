import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { 
  ArrowLeft, Camera, Eye, EyeOff, RefreshCw, 
  Trophy, Sparkles, Play, Volume2, VolumeX,
  Pause, AlertCircle, Settings, Sliders, X,
  Zap, Heart, PlusCircle, Compass, Hash, Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SHAPE_LIBRARY, getShapeForLevel, getVariationWaypoints } from './shapeLibrary';

// ============================================================
// GEOMETRIC HELPER MATH
// ============================================================

function closestPointOnSegment(p, a, b) {
  const abx = b.x - a.x, aby = b.y - a.y;
  const apx = p.x - a.x, apy = p.y - a.y;
  const lenSq = abx * abx + aby * aby || 1e-9;
  let t = (apx * abx + apy * aby) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return { x: a.x + t * abx, y: a.y + t * aby, t };
}

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
  return { point: best, distance: bestDist, segment: bestSegment, t: best ? best.t : 0 };
}

// ============================================================
// AUDIO SOUND SYNTHESIS
// ============================================================

function playTone(freq, duration, type = 'sine', delay = 0) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    setTimeout(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.16, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    }, delay);
  } catch (e) {}
}

const playWaypointSound = (idx) => {
  const baseFreq = 520 + (idx * 90);
  playTone(baseFreq, 80, 'triangle');
};

const playStartSound = () => {
  playTone(440, 70, 'sine');
  playTone(554.37, 100, 'sine', 60);
};

const playSuccessSound = () => {
  playTone(523.25, 120);
  playTone(659.25, 120, 'sine', 90);
  playTone(783.99, 150, 'sine', 180);
  playTone(1046.5, 300, 'sine', 270);
};

const playHighScoreSound = () => {
  playTone(659.25, 100);
  playTone(880, 100, 'sine', 90);
  playTone(1046.5, 350, 'sine', 180);
};

const playFailSound = () => {
  playTone(240, 160, 'sawtooth');
  playTone(180, 240, 'sawtooth', 120);
};

const HIGH_SCORE_KEY = 'gestureDrawing_highScore';
const BEST_STREAK_KEY = 'gestureDrawing_bestStreak';

const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17]
];

// ============================================================
// 1-EURO ADAPTIVE FILTER (Zero-latency + Jitter-free smoothing)
// ============================================================
class OneEuroFilter {
  constructor(minCutoff = 1.0, beta = 0.06, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.x = null;
    this.dx = 0;
    this.lastTime = null;
  }

  alpha(rate, cutoff) {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    const te = 1.0 / rate;
    return 1.0 / (1.0 + tau / te);
  }

  filter(val, timestamp) {
    if (this.lastTime === null) {
      this.x = val;
      this.lastTime = timestamp;
      return val;
    }
    const dt = Math.max((timestamp - this.lastTime) / 1000, 1e-4);
    this.lastTime = timestamp;
    const rate = 1.0 / dt;

    const dVal = (val - this.x) / dt;
    const alphaD = this.alpha(rate, this.dCutoff);
    this.dx = this.dx * (1 - alphaD) + dVal * alphaD;

    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx);
    const alphaVal = this.alpha(rate, cutoff);
    this.x = this.x * (1 - alphaVal) + val * alphaVal;
    return this.x;
  }

  reset() {
    this.x = null;
    this.dx = 0;
    this.lastTime = null;
  }
}

// ============================================================
// MAIN COMPONENT
// ============================================================

const GestureDrawing = () => {
  const navigate = useNavigate();
  const { user, syncProgress } = useAuth();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const demoCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const confettiCanvasRef = useRef(null);
  const confettiAnimRef = useRef(null);

  // Game Progression State
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(user?.score || 0);
  const [level, setLevel] = useState(user?.level || 1);
  const [checkpointLevel, setCheckpointLevel] = useState(user?.gameStats?.checkpointLevel || 1);
  const [lives, setLives] = useState(user?.gameStats?.lives || 3);
  const [coins, setCoins] = useState(user?.coins ?? 100);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Sync state from logged-in user profile
  useEffect(() => {
    if (user) {
      if (user.coins !== undefined) setCoins(user.coins);
      if (user.score !== undefined) setScore(user.score);
      if (user.level !== undefined) setLevel(user.level);
      if (user.gameStats?.checkpointLevel) setCheckpointLevel(user.gameStats.checkpointLevel);
    }
  }, [user]);

  // Persist game stats to database across devices
  const persistStats = useCallback((newCoins, newScore, newLevel, newCheckpoint, newLives) => {
    if (syncProgress) {
      syncProgress({
        coins: newCoins !== undefined ? newCoins : coins,
        score: newScore !== undefined ? newScore : score,
        level: newLevel !== undefined ? newLevel : level,
        gameStats: {
          checkpointLevel: newCheckpoint !== undefined ? newCheckpoint : checkpointLevel,
          lives: newLives !== undefined ? newLives : lives,
          highScore,
          bestStreak,
        },
      });
    }
  }, [syncProgress, coins, score, level, checkpointLevel, lives, highScore, bestStreak]);

  // Shape and Waypoint State
  const [currentShape, setCurrentShape] = useState(null);
  const [activeWaypoints, setActiveWaypoints] = useState([]);
  const [targetWaypointIdx, setTargetWaypointIdx] = useState(0);
  const [passedWaypoints, setPassedWaypoints] = useState([]);
  const [stepGuidance, setStepGuidance] = useState('');

  // Hint Toggle Options (User-requested granular controls)
  const [showOutline, setShowOutline] = useState(true);
  const [showNumbers, setShowNumbers] = useState(true);
  const [showArrows, setShowArrows] = useState(true);

  // Drawing Mode: 'pinch' (precision touch, default) vs 'point' (direct index finger air-draw)
  const [drawMode, setDrawMode] = useState('pinch');
  const drawModeRef = useRef('pinch');
  useEffect(() => { drawModeRef.current = drawMode; }, [drawMode]);

  // Drawing & Tracking State
  const [userDrawing, setUserDrawing] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPinchingFingers, setIsPinchingFingers] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [message, setMessage] = useState('');
  const [detectorModel, setDetectorModel] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [handConfidence, setHandConfidence] = useState(0);

  // Controls & Settings
  const [showTutorial, setShowTutorial] = useState(true);
  const [showVideo, setShowVideo] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [sensitivitySettings, setSensitivitySettings] = useState({
    smoothing: 0.5,
    pinchThreshold: 0.075,      // Calibrated natural pinch: 0.075 frame width (~48px)
    pinchRatioThreshold: 0.42,  // Scale-invariant palm-to-pinch ratio
    snapStrength: 0.0,          // 0 by default to prevent zigzag/stair-stepping oscillation
    snapRadius: 0.055,
  });

  // Refs for tracking loop to prevent stale closures and lag
  const isProcessingRef = useRef(false);
  const tickRef = useRef(() => {});
  const demoAnimRef = useRef(null);
  const smoothPosRef = useRef(null);
  const isDrawingRef = useRef(false);
  const targetWaypointIdxRef = useRef(0);
  const passedWaypointsRef = useRef([]);
  const activeWaypointsRef = useRef([]);
  const unpinchDebounceRef = useRef(0);
  const loadStartedRef = useRef(false);
  const soundEnabledRef = useRef(true);
  const sensitivitySettingsRef = useRef(sensitivitySettings);
  const hadHandRef = useRef(false);

  // Ultra-smooth 60fps tracking & zero-lag decoupled drawing refs
  const userDrawingRef = useRef([]);
  const filterXRef = useRef(new OneEuroFilter(0.8, 0.010, 0.6));
  const filterYRef = useRef(new OneEuroFilter(0.8, 0.010, 0.6));
  const isPinchingRef = useRef(false);
  const lastConfidenceUpdateRef = useRef(0);
  const fingerCursorRef = useRef(null);

  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { sensitivitySettingsRef.current = sensitivitySettings; }, [sensitivitySettings]);
  useEffect(() => { isDrawingRef.current = isDrawing; }, [isDrawing]);
  useEffect(() => { targetWaypointIdxRef.current = targetWaypointIdx; }, [targetWaypointIdx]);
  useEffect(() => { passedWaypointsRef.current = passedWaypoints; }, [passedWaypoints]);
  useEffect(() => { activeWaypointsRef.current = activeWaypoints; }, [activeWaypoints]);

  // Load High Score on Mount
  useEffect(() => {
    try {
      const storedHigh = parseInt(localStorage.getItem(HIGH_SCORE_KEY), 10);
      if (!isNaN(storedHigh)) setHighScore(storedHigh);
      const storedStreak = parseInt(localStorage.getItem(BEST_STREAK_KEY), 10);
      if (!isNaN(storedStreak)) setBestStreak(storedStreak);
    } catch (e) {}
  }, []);

  // Confetti Burst Animation
  const triggerConfetti = useCallback(() => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const colors = ['#10b981', '#4f6df5', '#f59e0b', '#ec4899', '#8b5cf6'];
    const particles = Array.from({ length: 65 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 11,
      vy: (Math.random() - 1.25) * 11,
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
        p.vy += 0.28;
        p.life -= 0.018;
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

  // ============================================================
  // CAMERA PREVIEW RENDERER (NO Outline Guide — ONLY START POINT)
  // ============================================================
  const drawCameraPreview = useCallback((keypoints, videoWidth, videoHeight, isPinching, targetIdx, waypoints) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / (videoWidth || 640);
    const scaleY = canvas.height / (videoHeight || 480);
    const mx = (x) => x * scaleX;
    const my = (y) => y * scaleY;

    // 1. ONLY Draw START POINT in the Camera Box (NO outline guide, as requested!)
    if (waypoints && waypoints.length > 0) {
      const startWp = waypoints[0];
      const wx = startWp.x * canvas.width;
      const wy = startWp.y * canvas.height;

      ctx.save();
      // Glowing Start Beacon in Camera Preview
      const pulse = (Math.sin(Date.now() / 140) + 1) / 2;

      // Outer animated pulsating halo
      ctx.beginPath();
      ctx.arc(wx, wy, 20 + pulse * 12, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.9)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Precision crosshairs
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.75)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(wx - 18, wy); ctx.lineTo(wx + 18, wy);
      ctx.moveTo(wx, wy - 18); ctx.lineTo(wx, wy + 18);
      ctx.stroke();

      // Center Start Core
      ctx.beginPath();
      ctx.arc(wx, wy, 13, 0, 2 * Math.PI);
      ctx.fillStyle = targetIdx === 0 ? '#10b981' : '#64748b';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(targetIdx === 0 ? 'START' : '✓', wx, wy);

      if (targetIdx === 0) {
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 12px sans-serif';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText('🟢 START HERE', wx, wy - 24);
      }
      ctx.restore();
    }

    // 2. Draw Hand Skeleton (if hand is detected)
    if (keypoints && keypoints.length === 21) {
      ctx.strokeStyle = isPinching ? 'rgba(16, 185, 129, 0.95)' : 'rgba(245, 158, 11, 0.75)';
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
        ctx.arc(mx(kp.x), my(kp.y), i === 8 || i === 4 ? 5 : 2, 0, 2 * Math.PI);
        ctx.fillStyle = i === 8 ? (isPinching ? '#10b981' : '#f59e0b') : i === 4 ? '#3b82f6' : '#94a3b8';
        ctx.fill();
        if (i === 8 || i === 4) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      // Line between thumb tip and index tip showing pinch gap
      const pIndex = keypoints[8];
      const pThumb = keypoints[4];
      if (pIndex && pThumb) {
        ctx.beginPath();
        ctx.moveTo(mx(pIndex.x), my(pIndex.y));
        ctx.lineTo(mx(pThumb.x), my(pThumb.y));
        ctx.strokeStyle = isPinching ? '#10b981' : 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = isPinching ? 3 : 1.5;
        if (!isPinching) ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Check proximity to Start Point
      if (targetIdx === 0 && waypoints && waypoints.length > 0) {
        const startWp = waypoints[0];
        const sx = startWp.x * canvas.width;
        const sy = startWp.y * canvas.height;
        const fx = mx(pIndex.x);
        const fy = my(pIndex.y);
        const dist = Math.hypot(fx - sx, fy - sy);

        if (dist < 42) {
          ctx.save();
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 4;
          ctx.fillText('🎯 AT START! PINCH TO DRAW', sx, sy + 32);
          ctx.restore();
        }
      }
    }
  }, []);

  // Generate a new random shape based on current player level (Progressive Difficulty)
  const generateNewShape = useCallback((targetLevel = level) => {
    const shape = getShapeForLevel(targetLevel, currentShape?.key);
    const waypoints = getVariationWaypoints(shape);

    setCurrentShape(shape);
    setActiveWaypoints(waypoints);
    setTargetWaypointIdx(0);
    setPassedWaypoints([]);
    setStepGuidance(`Step 1 of ${waypoints.length - 1}: Start at ${waypoints[0].label} and draw to ${waypoints[1]?.label || 'end'}`);
    userDrawingRef.current = [];
    setUserDrawing([]);
    setIsDrawing(false);
    setIsPinchingFingers(false);
    setAccuracy(0);
    setShowVideo(true);
    setMessage('');
    smoothPosRef.current = null;
    targetWaypointIdxRef.current = 0;
    passedWaypointsRef.current = [];
    activeWaypointsRef.current = waypoints;
    filterXRef.current.reset();
    filterYRef.current.reset();
    if (fingerCursorRef.current) {
      fingerCursorRef.current.style.display = 'none';
    }

    if (demoAnimRef.current) cancelAnimationFrame(demoAnimRef.current);
    const canvas = demoCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [level, currentShape]);

  // Load Model with CDN + fallback (Using modelType: 'lite' for ultra-smooth 60 FPS)
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
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240',
            modelType: 'lite',
            maxHands: 1,
          }
        );
      } catch (err) {
        console.warn('MediaPipe CDN load failed, trying tfjs backend:', err);
      }

      if (!detector) {
        try {
          await tf.setBackend('cpu');
          await tf.ready();
          detector = await handPoseDetection.createDetector(
            handPoseDetection.SupportedModels.MediaPipeHands,
            { runtime: 'tfjs', modelType: 'lite', maxHands: 1 }
          );
        } catch (tfErr) {
          console.error('All handpose runtimes failed:', tfErr);
          setMessage('⚠️ Could not load hand tracking. Please check your internet connection.');
          setIsLoading(false);
          return;
        }
      }

      setDetectorModel(detector);
      setIsLoading(false);
      generateNewShape(1);
    };
    loadModel();
  }, [generateNewShape]);

  // Demo Pattern Animation (Clear sequential order tracing with step labels)
  const animateDemoPattern = useCallback((shape) => {
    const canvas = demoCanvasRef.current;
    if (!canvas || !shape) return;
    if (demoAnimRef.current) cancelAnimationFrame(demoAnimRef.current);

    const ctx = canvas.getContext('2d');
    const waypoints = getVariationWaypoints(shape);
    const pts = [...shape.points, shape.points[0]];
    const totalSegments = pts.length - 1;
    const duration = 2400; // ms
    const startTime = performance.now();
    const px = (p) => p.x * canvas.width;
    const py = (p) => p.y * canvas.height;

    const drawFrame = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Faint outline of full shape
      ctx.save();
      ctx.strokeStyle = 'rgba(79, 109, 245, 0.2)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      pts.forEach((p, i) => {
        if (i === 0) ctx.moveTo(px(p), py(p));
        else ctx.lineTo(px(p), py(p));
      });
      ctx.stroke();
      ctx.restore();

      // Current trace progress
      const segProgress = progress * totalSegments;
      const fullSegs = Math.floor(segProgress);
      const partial = segProgress - fullSegs;

      ctx.beginPath();
      ctx.strokeStyle = '#4f6df5';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(79, 109, 245, 0.5)';
      ctx.shadowBlur = 8;
      ctx.moveTo(px(pts[0]), py(pts[0]));

      let cursor = { x: px(pts[0]), y: py(pts[0]) };
      for (let i = 1; i <= fullSegs && i < pts.length; i++) {
        ctx.lineTo(px(pts[i]), py(pts[i]));
        cursor = { x: px(pts[i]), y: py(pts[i]) };
      }
      if (fullSegs < totalSegments && partial > 0 && pts[fullSegs + 1]) {
        const a = pts[fullSegs];
        const b = pts[fullSegs + 1];
        cursor = {
          x: px(a) + (px(b) - px(a)) * partial,
          y: py(a) + (py(b) - py(a)) * partial
        };
        ctx.lineTo(cursor.x, cursor.y);
      }
      ctx.stroke();

      // Draw all waypoints with numbers and order
      waypoints.forEach((wp, i) => {
        const isCompleted = (i / (waypoints.length - 1)) <= progress;
        const isStart = i === 0;

        ctx.beginPath();
        ctx.arc(px(wp), py(wp), isStart ? 8 : 6, 0, 2 * Math.PI);
        ctx.fillStyle = isCompleted ? '#10b981' : '#64748b';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isStart ? '1' : String(i + 1), px(wp), py(wp));
      });

      // Animated glowing tracing pen cursor
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      if (progress < 1) {
        demoAnimRef.current = requestAnimationFrame(drawFrame);
      } else {
        demoAnimRef.current = null;
      }
    };

    demoAnimRef.current = requestAnimationFrame(drawFrame);
  }, []);

  useEffect(() => {
    if (!showVideo && currentShape) {
      animateDemoPattern(currentShape);
    }
    return () => {
      if (demoAnimRef.current) cancelAnimationFrame(demoAnimRef.current);
    };
  }, [showVideo, currentShape, animateDemoPattern]);

  // ============================================================
  // USER DRAWING CANVAS RENDERER (Clean & Unobstructed)
  // ============================================================

  const drawUserDrawing = useCallback((customPoints = null, cursor = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.02)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const waypoints = activeWaypointsRef.current || [];
    const targetIdx = targetWaypointIdxRef.current || 0;
    const px = (p) => p.x * canvas.width;
    const py = (p) => p.y * canvas.height;

    // Optional faint guide outline (User toggled)
    if (showOutline && currentShape) {
      const closed = [...currentShape.points, currentShape.points[0]];
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.strokeStyle = '#4f6df5';
      ctx.lineWidth = 2;
      closed.forEach((p, i) => {
        if (i === 0) ctx.moveTo(px(p), py(p));
        else ctx.lineTo(px(p), py(p));
      });
      ctx.stroke();
      ctx.restore();
    }

    // Optional Checkpoint Numbers & Waypoint Badges (User toggled)
    if (showNumbers && waypoints.length > 0) {
      const passed = passedWaypointsRef.current || [];
      waypoints.forEach((wp, i) => {
        const isPassed = passed.includes(i);
        const isCurrentTarget = i === targetIdx;
        const isStart = i === 0;

        ctx.save();

        if (isCurrentTarget) {
          const pulse = (Math.sin(Date.now() / 150) + 1) / 2;
          ctx.beginPath();
          ctx.arc(px(wp), py(wp), 14 + pulse * 6, 0, 2 * Math.PI);
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(px(wp), py(wp), 11, 0, 2 * Math.PI);
          ctx.fillStyle = '#f59e0b';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(i + 1), px(wp), py(wp));

          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 11px sans-serif';
          const label = isStart ? '1: START HERE' : `${i + 1}: ${wp.label}`;
          ctx.fillText(label, px(wp), py(wp) - 18);
        } else if (isPassed) {
          ctx.beginPath();
          ctx.arc(px(wp), py(wp), 8, 0, 2 * Math.PI);
          ctx.fillStyle = '#10b981';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✓', px(wp), py(wp));
        } else {
          ctx.beginPath();
          ctx.arc(px(wp), py(wp), 7, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(100, 116, 139, 0.6)';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = '9px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(i + 1), px(wp), py(wp));
        }
        ctx.restore();
      });
    }

    // Optional Directional Guide Arrow (User toggled)
    if (showArrows && targetIdx > 0 && targetIdx < waypoints.length) {
      const prev = waypoints[targetIdx - 1];
      const next = waypoints[targetIdx];
      ctx.save();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(px(prev), py(prev));
      ctx.lineTo(px(next), py(next));
      ctx.stroke();
      ctx.restore();
    }

    // User's smooth vector stroke
    const pts = customPoints !== null ? customPoints : userDrawingRef.current;
    if (pts && pts.length > 0) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = '#10b981';
      ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      if (pts.length === 1) {
        ctx.arc(px(pts[0]), py(pts[0]), 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#10b981';
        ctx.fill();
      } else {
        ctx.moveTo(px(pts[0]), py(pts[0]));
        for (let i = 1; i < pts.length - 1; i++) {
          const xc = (pts[i].x + pts[i + 1].x) / 2 * canvas.width;
          const yc = (pts[i].y + pts[i + 1].y) / 2 * canvas.height;
          ctx.quadraticCurveTo(px(pts[i]), py(pts[i]), xc, yc);
        }
        const last = pts[pts.length - 1];
        ctx.lineTo(px(last), py(last));
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(px(pts[0]), py(pts[0]), 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      const lastPoint = pts[pts.length - 1];
      ctx.beginPath();
      ctx.arc(px(lastPoint), py(lastPoint), 5.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    }

    // Real-time Pen / Reticle indicator on Drawing Canvas
    if (cursor && cursor.x > 0 && cursor.x < 1 && cursor.y > 0 && cursor.y < 1) {
      const cx = cursor.x * canvas.width;
      const cy = cursor.y * canvas.height;
      ctx.save();
      if (cursor.isPinching) {
        // Glowing drawing pen tip
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, 2 * Math.PI);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10;
      } else {
        // Hover reticle when open hand (accurate alignment)
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
      }
      ctx.restore();
    }
  }, [showOutline, showNumbers, showArrows, currentShape]);

  // ============================================================
  // EVALUATE FULL SHAPE COMPLETION & RANDOM REWARDS
  // ============================================================

  const evaluateShapeCompletion = useCallback(() => {
    const pts = userDrawingRef.current.length > 0 ? userDrawingRef.current : userDrawing;
    if (!currentShape || pts.length < 10) {
      setMessage('✋ Trace the complete shape through all waypoints!');
      return;
    }

    const closed = [...currentShape.points, currentShape.points[0]];

    let totalDist = 0;
    pts.forEach(p => {
      const { distance } = closestPointOnShape(p, closed);
      totalDist += distance;
    });
    const avgDist = totalDist / pts.length;

    const shapeAccuracy = Math.max(0, Math.min(100, 100 - avgDist * 280));
    const finalScore = Math.round(shapeAccuracy);
    setAccuracy(finalScore);

    if (finalScore >= 65) {
      if (soundEnabledRef.current) playSuccessSound();
      triggerConfetti();

      // Enhanced Random Points & Coins System!
      const speedBonus = pts.length < 50 ? 20 : 5;
      const basePoints = 30 * level + speedBonus;
      // 50% chance of random mystery points bonus (+15 to +40 points)
      const randomBonusPoints = Math.random() < 0.5 ? Math.floor(15 + Math.random() * 26) : 0;
      const totalPointsEarned = basePoints + randomBonusPoints;

      // Random coins bonus: Base coins + random chance of mystery drop
      let coinsEarned = Math.floor(finalScore / 18) + 2;
      if (Math.random() < 0.5) {
        coinsEarned += Math.floor(2 + Math.random() * 4); // +2 to +5 extra coins
      }
      let mysteryChest = false;
      if (Math.random() < 0.15) {
        coinsEarned += 15; // Lucky Chest
        mysteryChest = true;
      }

      setScore(prev => {
        const next = prev + totalPointsEarned;
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

      setCoins(prev => prev + coinsEarned);
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

      const nextLevel = level + 1;
      setLevel(nextLevel);

      // Checkpoint every 3 levels!
      const earnedBonusCoins = nextLevel % 3 === 0 ? 25 : coinsEarned;
      const nextCp = nextLevel % 3 === 0 ? nextLevel : checkpointLevel;
      const newCoinsTotal = coins + earnedBonusCoins;

      if (nextLevel % 3 === 0) {
        setCheckpointLevel(nextLevel);
        setLives(l => Math.min(l + 1, 5));
        setCoins(newCoinsTotal);
        setMessage(`🚩 Checkpoint Level ${nextLevel} Saved! +1 Life & +25 Coins Awarded!`);
      } else {
        setCoins(newCoinsTotal);
        setMessage(
          `✅ Perfect! ${currentShape.name} cleared (${finalScore}%)! +${totalPointsEarned} pts, +${coinsEarned} 🪙${mysteryChest ? ' 🎁 LUCKY CHEST!' : ''}`
        );
      }
      persistStats(newCoinsTotal, score + totalPointsEarned, nextLevel, nextCp);

      setIsComplete(true);
      setTimeout(() => {
        setIsComplete(false);
        setIsNewHighScore(false);
        generateNewShape(nextLevel);
      }, 2600);
    } else {
      setMessage(`❌ Inaccurate! Accuracy: ${finalScore}%. Need 65%+ to clear.`);
      if (soundEnabledRef.current) playFailSound();
      setStreak(0);
      setLives(prev => {
        const next = prev - 1;
        if (next <= 0) setIsGameOver(true);
        return next;
      });
      userDrawingRef.current = [];
      setUserDrawing([]);
      filterXRef.current.reset();
      filterYRef.current.reset();
      setTargetWaypointIdx(0);
      setPassedWaypoints([]);
      targetWaypointIdxRef.current = 0;
      passedWaypointsRef.current = [];
      drawUserDrawing([], null);
    }
  }, [currentShape, userDrawing, level, generateNewShape, triggerConfetti, drawUserDrawing]);

  // ============================================================
  // FRAME PROCESSING LOOP (Smooth 1mm tracking, zero lag)
  // ============================================================

  const handleFrame = async () => {
    if (!detectorModel || !isPlaying || !webcamRef.current) return;
    if (isProcessingRef.current) return;
    if (isComplete) return;

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4 || !video.videoWidth) return;

    isProcessingRef.current = true;
    try {
      const hands = await detectorModel.estimateHands(video, { flipHorizontal: true });
      const rawHand = hands.length > 0 ? hands[0] : null;

      const isFiniteHand = !!rawHand &&
        Number.isFinite(rawHand.score) &&
        Array.isArray(rawHand.keypoints) &&
        rawHand.keypoints.length === 21 &&
        rawHand.keypoints.every(kp => Number.isFinite(kp.x) && Number.isFinite(kp.y));

      const minConfidence = hadHandRef.current ? 0.35 : 0.45;
      const hand = isFiniteHand && rawHand.score >= minConfidence ? rawHand : null;

      // Throttle confidence update to eliminate unnecessary React re-renders
      const now = performance.now();
      if (now - lastConfidenceUpdateRef.current > 250) {
        lastConfidenceUpdateRef.current = now;
        setHandConfidence(isFiniteHand ? Math.round(rawHand.score * 100) : 0);
      }

      if (hand) {
        hadHandRef.current = true;
        const keypoints = hand.keypoints;
        const indexFinger = keypoints[8];
        const thumbTip = keypoints[4];
        const pWrist = keypoints[0];
        const pMiddleKnuckle = keypoints[9];

        // Calibrated Pinch Detection (Scale-invariant palm ratio + frame distance)
        const dx = indexFinger.x - thumbTip.x;
        const dy = indexFinger.y - thumbTip.y;
        const pinchPixelDist = Math.hypot(dx, dy);
        const pinchFrameDist = pinchPixelDist / video.videoWidth;

        const palmScale = Math.hypot(pMiddleKnuckle.x - pWrist.x, pMiddleKnuckle.y - pWrist.y) || 120;
        const pinchRatio = pinchPixelDist / palmScale;

        const currentPinchThreshold = sensitivitySettingsRef.current.pinchThreshold || 0.075;
        const currentRatioThreshold = sensitivitySettingsRef.current.pinchRatioThreshold || 0.42;

        const frameReleaseThreshold = currentPinchThreshold + 0.020;
        const ratioReleaseThreshold = currentRatioThreshold + 0.10;

        let isPinchNow = false;
        if (isDrawingRef.current && drawModeRef.current === 'pinch') {
          isPinchNow = (pinchFrameDist < frameReleaseThreshold) || (pinchRatio < ratioReleaseThreshold);
        } else {
          isPinchNow = (pinchFrameDist < currentPinchThreshold) || (pinchRatio < currentRatioThreshold);
        }

        if (!isPinchNow && isDrawingRef.current && drawModeRef.current === 'pinch') {
          unpinchDebounceRef.current += 1;
          if (unpinchDebounceRef.current < 3) {
            isPinchNow = true;
          }
        } else if (isPinchNow) {
          unpinchDebounceRef.current = 0;
        }

        // Active drawing check:
        // In 'point' mode: direct index finger air-drawing (no pinch required!)
        // In 'pinch' mode: touch thumb and index finger together to draw
        const isActivelyDrawing = drawModeRef.current === 'point' ? true : isPinchNow;

        // When pinching, tracking the midpoint between thumb and index tip eliminates contact flex tremor!
        const rawTargetX = (isPinchNow && drawModeRef.current === 'pinch')
          ? (indexFinger.x + thumbTip.x) / 2
          : indexFinger.x;
        const rawTargetY = (isPinchNow && drawModeRef.current === 'pinch')
          ? (indexFinger.y + thumbTip.y) / 2
          : indexFinger.y;

        // 1-Euro Adaptive Filter: smooth pixel-space filtering (Eradicates shiver & lag)
        const smoothPixelX = filterXRef.current.filter(rawTargetX, now);
        const smoothPixelY = filterYRef.current.filter(rawTargetY, now);
        const x = smoothPixelX / video.videoWidth;
        const y = smoothPixelY / video.videoHeight;
        smoothPosRef.current = { x, y };

        // Zero-overhead direct DOM update for camera guide cursor
        if (fingerCursorRef.current) {
          fingerCursorRef.current.style.display = 'block';
          fingerCursorRef.current.style.left = `${x * 100}%`;
          fingerCursorRef.current.style.top = `${y * 100}%`;
        }

        // Only trigger React state change when drawing state actually flips
        if (isActivelyDrawing !== isPinchingRef.current) {
          isPinchingRef.current = isActivelyDrawing;
          setIsPinchingFingers(isActivelyDrawing);
          if (fingerCursorRef.current) {
            fingerCursorRef.current.className = `absolute w-3.5 h-3.5 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none ${
              isActivelyDrawing ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
            }`;
          }
        }

        // Render dedicated Camera preview (ONLY START POINT, no outline)
        drawCameraPreview(
          keypoints,
          video.videoWidth,
          video.videoHeight,
          isActivelyDrawing,
          targetWaypointIdxRef.current,
          activeWaypointsRef.current
        );

        if (x > 0 && x < 1 && y > 0 && y < 1) {
          if (isActivelyDrawing) {
            if (!isDrawingRef.current) {
              setIsDrawing(true);
              isDrawingRef.current = true;
            }

            let plotted = { x, y };
            if (currentShape && sensitivitySettingsRef.current.snapStrength > 0) {
              const closed = [...currentShape.points, currentShape.points[0]];
              const { point: nearest, distance } = closestPointOnShape({ x, y }, closed);
              const snapRadius = sensitivitySettingsRef.current.snapRadius;
              const snapStrength = sensitivitySettingsRef.current.snapStrength;
              if (distance < snapRadius) {
                // Smooth continuous quadratic falloff: 0 at boundary, completely eliminates jumping and zigzag!
                const t = 1 - (distance / snapRadius);
                const smoothFactor = snapStrength * t * t;
                plotted = {
                  x: x + (nearest.x - x) * smoothFactor,
                  y: y + (nearest.y - y) * smoothFactor
                };
              }
            }

            // High-precision distance sampling:
            // 0.009 (~4.5px) spaces control points cleanly, eliminating micro-tremor zigzag loops!
            const pts = userDrawingRef.current;
            let shouldAdd = false;
            if (pts.length === 0) {
              shouldAdd = true;
            } else {
              const lastPt = pts[pts.length - 1];
              const dist = Math.hypot(plotted.x - lastPt.x, plotted.y - lastPt.y);
              if (dist >= 0.009) {
                shouldAdd = true;
              }
            }

            if (shouldAdd) {
              pts.push(plotted);
            }

            // Check waypoint progression
            const waypoints = activeWaypointsRef.current;
            const currentIdx = targetWaypointIdxRef.current;

            if (waypoints.length > 0 && currentIdx < waypoints.length) {
              const targetWp = waypoints[currentIdx];
              const distToWp = Math.hypot(x - targetWp.x, y - targetWp.y);

              const hitTolerance = currentIdx === 0 ? 0.14 : 0.11;
              if (distToWp < hitTolerance) {
                const newPassed = [...passedWaypointsRef.current, currentIdx];
                passedWaypointsRef.current = newPassed;
                setPassedWaypoints(newPassed);

                if (currentIdx === 0) {
                  if (soundEnabledRef.current) playStartSound();
                } else {
                  if (soundEnabledRef.current) playWaypointSound(currentIdx);
                }

                const nextIdx = currentIdx + 1;
                targetWaypointIdxRef.current = nextIdx;
                setTargetWaypointIdx(nextIdx);

                if (nextIdx < waypoints.length) {
                  const nextTarget = waypoints[nextIdx];
                  setStepGuidance(`Step ${nextIdx} of ${waypoints.length - 1}: Draw to ${nextTarget.label}`);
                } else {
                  setStepGuidance('🎉 All waypoints traced! Evaluating drawing...');
                  setIsDrawing(false);
                  isDrawingRef.current = false;
                  setTimeout(() => {
                    evaluateShapeCompletion();
                  }, 200);
                }
              }
            }
          } else if (isDrawingRef.current) {
            setIsDrawing(false);
            isDrawingRef.current = false;
            unpinchDebounceRef.current = 0;
            setUserDrawing([...userDrawingRef.current]);

            const waypoints = activeWaypointsRef.current;
            const currentIdx = targetWaypointIdxRef.current;

            if (currentIdx < waypoints.length && userDrawingRef.current.length > 15) {
              setMessage(`⚠️ Keep going! Reached step ${currentIdx} of ${waypoints.length - 1}. Keep drawing!`);
            }
          }

          // Direct 60 FPS drawing canvas render with zero React re-render overhead
          drawUserDrawing(userDrawingRef.current, { x, y, isPinching: isActivelyDrawing });
        }
      } else {
        hadHandRef.current = false;
        filterXRef.current.reset();
        filterYRef.current.reset();
        if (fingerCursorRef.current) {
          fingerCursorRef.current.style.display = 'none';
        }
        if (isPinchingRef.current) {
          isPinchingRef.current = false;
          setIsPinchingFingers(false);
        }
        if (isDrawingRef.current) {
          isDrawingRef.current = false;
          setIsDrawing(false);
          setUserDrawing([...userDrawingRef.current]);
        }
        smoothPosRef.current = null;
        drawCameraPreview(
          null,
          640,
          480,
          false,
          targetWaypointIdxRef.current,
          activeWaypointsRef.current
        );
        drawUserDrawing(userDrawingRef.current, null);
      }
    } catch (err) {
      console.error('Hand tracking loop error:', err);
    } finally {
      isProcessingRef.current = false;
    }
  };

  useEffect(() => {
    tickRef.current = handleFrame;
  });

  useEffect(() => {
    let rafId;
    const loop = () => {
      tickRef.current();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    drawUserDrawing(userDrawingRef.current, null);
  }, [drawUserDrawing, userDrawing]);

  // Buy Extra Life with Coins anytime
  const buyExtraLife = () => {
    if (lives >= 5) {
      setMessage('❤️ Full lives already! (Maximum 5)');
      return;
    }
    if (coins < 10) {
      setMessage('🪙 Need 10 coins to buy an extra life! Keep drawing to earn coins.');
      return;
    }
    const newCoins = coins - 10;
    const newLives = Math.min(lives + 1, 5);
    setCoins(newCoins);
    setLives(newLives);
    persistStats(newCoins, score, level, checkpointLevel, newLives);
    playTone(600, 150, 'sine');
    setMessage('💚 Extra life purchased (+1 ❤️)!');
  };

  // Restart / Reset
  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setCheckpointLevel(1);
    setLives(3);
    setCoins(15);
    setStreak(0);
    userDrawingRef.current = [];
    setUserDrawing([]);
    setIsGameOver(false);
    setIsComplete(false);
    setAccuracy(0);
    setMessage('');
    smoothPosRef.current = null;
    filterXRef.current.reset();
    filterYRef.current.reset();
    if (fingerCursorRef.current) {
      fingerCursorRef.current.style.display = 'none';
    }
    generateNewShape(1);
  };

  const continueFromCheckpoint = () => {
    if (coins < 15) return;
    const newCoins = coins - 15;
    setCoins(newCoins);
    setLives(3); // Restore 3 lives!
    setLevel(checkpointLevel);
    setIsGameOver(false);
    userDrawingRef.current = [];
    setUserDrawing([]);
    persistStats(newCoins, score, checkpointLevel, checkpointLevel, 3);
    setMessage(`🚩 Resumed from Checkpoint Level ${checkpointLevel} with 3 lives!`);
    smoothPosRef.current = null;
    filterXRef.current.reset();
    filterYRef.current.reset();
    if (fingerCursorRef.current) {
      fingerCursorRef.current.style.display = 'none';
    }
    generateNewShape(checkpointLevel);
  };

  // Sensitivity Settings Modal
  const SensitivitySettingsModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Sliders className="w-6 h-6 mr-2 text-primary-500" />
            Tracking & Sensitivity
          </h2>
          <button
            onClick={() => setShowSettings(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Pinch Sensitivity
              </label>
              <span className="text-sm text-primary-600 dark:text-primary-400 font-bold">
                {Math.round(sensitivitySettings.pinchThreshold * 1000) / 10}%
              </span>
            </div>
            <input
              type="range"
              min="0.040"
              max="0.120"
              step="0.005"
              value={sensitivitySettings.pinchThreshold}
              onChange={(e) => setSensitivitySettings(prev => ({ 
                ...prev, 
                pinchThreshold: parseFloat(e.target.value) 
              }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Lower = strict physical finger touch; Higher = easier pinch to draw</p>
          </div>

          <div>
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto-Assist Snapping
              </label>
              <span className="text-sm text-primary-600 dark:text-primary-400 font-bold">
                {Math.round(sensitivitySettings.snapStrength * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.6"
              step="0.05"
              value={sensitivitySettings.snapStrength}
              onChange={(e) => setSensitivitySettings(prev => ({ 
                ...prev, 
                snapStrength: parseFloat(e.target.value) 
              }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Subtle outline guidance assist while drawing</p>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setSensitivitySettings({
                  smoothing: 0.5,
                  pinchThreshold: 0.075,
                  pinchRatioThreshold: 0.42,
                  snapStrength: 0.0,
                  snapRadius: 0.055,
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

  // Tutorial Screen
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
              Precision Gesture Drawing
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Over 120+ unique shapes! Shapes get progressively more challenging as you level up.
            </p>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <span className="text-2xl">📹</span>
              <div>
                <h3 className="font-bold">Step 1: Check Camera for the START Beacon</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Look at the camera box on the right. Move your hand until your finger aligns with the green 🟢 START circle.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl">
              <span className="text-2xl">🤏</span>
              <div>
                <h3 className="font-bold">Step 2: Pinch to Draw</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Pinch thumb and index fingertip together. Your full drawing canvas is 100% unobstructed!
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-bold">Step 3: Follow Numbered Checkpoints in Sequence</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Follow the exact sequence shown in the demo. You can toggle outlines and numbers on/off anytime!
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <span className="text-2xl">🚩</span>
              <div>
                <h3 className="font-bold">Step 4: Checkpoints & Extra Lives</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Checkpoints save every 3 levels with bonus coins & lives. Use earned coins to buy extra lives anytime!
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
              Start Game
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
            <Trophy className="w-4 h-4 inline mr-1 text-amber-500" /> Best Score: {highScore} &nbsp;•&nbsp; 🔥 Best Streak: {bestStreak} &nbsp;•&nbsp; 🚩 Checkpoint: Lvl {checkpointLevel}
          </p>
          
          <div className="flex flex-col gap-3">
            {checkpointLevel > 1 && coins >= 15 && (
              <button
                onClick={continueFromCheckpoint}
                className="px-8 py-3.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-md"
              >
                🚩 Continue from Checkpoint (Level {checkpointLevel}) with 3 ❤️ (15 🪙)
              </button>
            )}
            <button
              onClick={resetGame}
              className="px-8 py-3.5 bg-gradient-to-r from-primary-500 to-indigo-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              🔁 Start from Level 1
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header with Score, Level, Lives, Coins, and Buy Life Button */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button 
          onClick={() => navigate('/games')}
          className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Games
        </button>
        
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <span className="text-lg font-bold text-primary-600">⭐ {score}</span>
          <span className="text-lg font-bold text-purple-600">📊 Lvl {level}</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
            🚩 CP: Lvl {checkpointLevel}
          </span>
          <span className="text-lg font-bold text-red-500 flex items-center gap-0.5">
            ❤️ {lives}
          </span>
          {/* Enhanced Buy Extra Life Button */}
          <button
            onClick={buyExtraLife}
            disabled={lives >= 5 || coins < 10}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
              lives >= 5 
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-default'
                : coins >= 10
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow hover:scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
            title="Buy extra life for 10 coins"
          >
            <PlusCircle className="w-3.5 h-3.5" /> +1 ❤️ (10 🪙)
          </button>
          <span className="text-lg font-bold text-yellow-500">🪙 {coins}</span>
          {streak > 1 && <span className="text-lg font-bold text-orange-500">🔥 {streak}</span>}
          <span className="text-sm font-semibold text-gray-400" title="Best score">
            <Trophy className="w-4 h-4 inline mr-1 text-amber-500" />{highScore}
          </span>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title="Adjust Sensitivity"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Shape Banner & Progressive Tier Details */}
      <div className="glass-card rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <h2 className="text-2xl font-bold">
            Draw: <span className="text-primary-600">{currentShape?.name || 'Loading Shape...'}</span>
          </h2>
          <span className="text-3xl">{currentShape?.icon}</span>
          <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
            currentShape?.tier === 1 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
            currentShape?.tier === 2 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
            currentShape?.tier === 3 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
            'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
          }`}>
            Tier {currentShape?.tier || 1}: {currentShape?.difficulty || 'Easy'}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">
          {currentShape?.description}
        </p>

        {/* Dynamic Step Instruction Banner */}
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full font-bold text-sm border border-amber-200 dark:border-amber-800">
          <Zap className="w-4 h-4 text-amber-500" />
          {stepGuidance}
        </div>

        {/* Waypoint Progress Bar */}
        {activeWaypoints.length > 0 && (
          <div className="mt-3 max-w-sm mx-auto">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-primary-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (passedWaypoints.length / (activeWaypoints.length - 1)) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Checkpoints: {passedWaypoints.length} of {activeWaypoints.length - 1} completed
            </p>
          </div>
        )}
      </div>

      {/* User-Requested Granular Hint Controls Toolbar */}
      <div className="glass-card rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className={isLoading ? 'text-indigo-500 font-semibold' : isPlaying ? 'text-green-500 font-semibold' : 'text-gray-400 font-semibold'}>
            {isLoading ? '🧠 Loading AI model…' : isPlaying ? '🟢 Tracking Active' : '⚪ Paused'}
          </span>
          {isPlaying && !isLoading && (
            handConfidence >= 35 ? (
              <span className="text-gray-500 font-medium text-xs">Signal: {handConfidence}%</span>
            ) : (
              <span className="text-amber-500 flex items-center gap-1 font-medium text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                {handConfidence > 0 ? `Weak (${handConfidence}%)` : 'Hand needed'}
              </span>
            )
          )}
        </div>

        {/* Options to remove outline, numbers, and direction arrows from drawing box */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mr-1">Drawing Hints:</span>
          
          <button
            onClick={() => setShowOutline(o => !o)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              showOutline ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
            }`}
            title="Toggle outline guide"
          >
            {showOutline ? <Eye className="w-3.5 h-3.5 text-primary-500" /> : <EyeOff className="w-3.5 h-3.5" />}
            Outline: {showOutline ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setShowNumbers(n => !n)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              showNumbers ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
            }`}
            title="Toggle checkpoint number labels"
          >
            <Hash className="w-3.5 h-3.5" />
            Numbers: {showNumbers ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setShowArrows(a => !a)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              showArrows ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
            }`}
            title="Toggle directional arrow"
          >
            <Navigation className="w-3.5 h-3.5" />
            Arrows: {showArrows ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => {
              const allOn = showOutline && showNumbers && showArrows;
              setShowOutline(!allOn);
              setShowNumbers(!allOn);
              setShowArrows(!allOn);
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
          >
            {showOutline && showNumbers && showArrows ? '🧹 Clean Canvas' : '✨ Show All'}
          </button>

          <button
            onClick={() => setSoundEnabled(s => !s)}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ml-1"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-green-500" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      </div>

      {/* 3-PANEL WORKSPACE (Camera completely OUTSIDE drawing canvas!) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Panel 1: Step-by-Step Demo (md: 4 cols, lg: 3.5 cols) */}
        <div className="md:col-span-4 lg:col-span-4 glass-card rounded-xl p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-center font-bold mb-2 flex items-center justify-center gap-2">
              <span>📐 Step-by-Step Demo</span>
            </h3>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700" style={{ height: '300px' }}>
              <canvas
                ref={demoCanvasRef}
                width="360"
                height="300"
                className="w-full h-full"
              />
              {showVideo && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white p-4">
                  <p className="text-xs mb-3 text-center">Watch how to draw this shape step-by-step in exact sequence!</p>
                  <button
                    onClick={() => setShowVideo(false)}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2 text-sm"
                  >
                    <Play className="w-4 h-4" />
                    Watch Demo
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center mt-3 space-x-2">
            <button
              onClick={() => generateNewShape(level)}
              className="px-3.5 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              New Shape
            </button>
            <button
              onClick={() => setShowVideo(true)}
              className="px-3.5 py-2 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition-colors flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5" />
              Replay Demo
            </button>
          </div>
        </div>

        {/* Panel 2: User Drawing Canvas (COMPLETELY UNOBSTRUCTED — 100% DRAWING AREA!) */}
        <div className="md:col-span-8 lg:col-span-5 glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <h3 className="font-bold flex items-center gap-1.5 text-sm sm:text-base">
              <span>✋ Your Drawing Canvas</span>
              <span className="text-xs font-normal text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                100% Unobstructed
              </span>
            </h3>

            {/* Mode Switcher: Pinch to Draw (Default) vs Point & Draw */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setDrawMode('pinch')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  drawMode === 'pinch'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Pinch thumb and index together to draw (Default)"
              >
                🤏 Pinch to Draw
              </button>
              <button
                onClick={() => setDrawMode('point')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  drawMode === 'point'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Direct finger drawing: move index finger to draw"
              >
                👆 Point & Draw
              </button>
            </div>

            {isDrawing && (
              <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full animate-pulse shadow">
                ✏️ Drawing ({drawMode === 'pinch' ? 'Pinch mode' : 'Point mode'})
              </span>
            )}
          </div>
          
          <div className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner" style={{ height: '340px' }}>
            <canvas
              ref={canvasRef}
              width="480"
              height="340"
              className="w-full h-full"
            />

            {userDrawing.length === 0 && !isDrawing && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
                <div className="text-center p-4">
                  <Camera className="w-10 h-10 mx-auto mb-2 opacity-50 text-primary-500" />
                  <p className="font-semibold text-gray-600 dark:text-gray-300">
                    {drawMode === 'pinch' ? '🤏 Pinch fingers together to draw' : '👆 Move index finger to draw'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Start at checkpoint 1 and trace in order</p>
                </div>
              </div>
            )}

            {/* Confetti canvas */}
            <canvas
              ref={confettiCanvasRef}
              width="480"
              height="340"
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {isNewHighScore && isComplete && (
              <div className="absolute top-2 left-2 px-3 py-1 bg-amber-500 text-white text-xs rounded-full font-bold flex items-center gap-1 shadow-lg animate-bounce">
                <Trophy className="w-4 h-4" /> New High Score!
              </div>
            )}
          </div>
        </div>

        {/* Panel 3: Dedicated Camera & Hand Tracking (OUTSIDE Drawing Canvas, ONLY Start Point!) */}
        <div className="md:col-span-12 lg:col-span-3 glass-card rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold flex items-center gap-1.5 text-sm">
                <Camera className="w-4 h-4 text-primary-500" />
                <span>Hand Camera</span>
              </h3>
              {isPinchingFingers ? (
                <span className="bg-emerald-500 text-white font-bold px-2 py-0.5 rounded text-[10px] shadow animate-pulse">
                  {drawMode === 'point' ? '👆 DRAWING' : '✏️ PINCHING'}
                </span>
              ) : (
                <span className="bg-gray-100 dark:bg-gray-700 text-amber-500 font-semibold px-2 py-0.5 rounded text-[10px]">
                  ✋ HOVERING
                </span>
              )}
            </div>

            <div className="relative bg-black rounded-lg overflow-hidden border-2 border-primary-500/30 shadow-lg" style={{ height: '260px' }}>
              <Webcam
                ref={webcamRef}
                mirrored={true}
                audio={false}
                videoConstraints={{ facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }}
                className="w-full h-full object-cover"
                onUserMedia={() => setIsCameraReady(true)}
                onUserMediaError={() => setMessage('⚠️ Camera permission needed. Please allow camera access in browser.')}
              />
              <canvas
                ref={previewCanvasRef}
                width="640"
                height="480"
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              <div
                ref={fingerCursorRef}
                style={{ display: 'none' }}
                className="absolute w-3.5 h-3.5 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none bg-amber-400 shadow-[0_0_8px_#f59e0b]"
              />

              {/* Bottom prompt inside Camera Box */}
              {targetWaypointIdx === 0 && (
                <div className="absolute bottom-1.5 inset-x-2 bg-black/85 text-emerald-300 text-[10px] text-center font-bold py-1 px-1 rounded border border-emerald-500/50 backdrop-blur-xs shadow-md z-10 pointer-events-none">
                  📍 Align hand with green START circle
                </div>
              )}

              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-xs text-center px-2">
                  Connecting Camera...
                </div>
              )}
            </div>
          </div>

          <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center mt-2">
            Green circle shows starting point. Move hand into it, then pinch!
          </p>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-xl text-center text-lg font-semibold shadow-sm transition-all ${
          message.includes('✅') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' :
          message.includes('❌') ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' :
          message.includes('🚩') ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200' :
          message.includes('⚠️') ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' :
          'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
        }`}>
          {message}
        </div>
      )}

      {/* Action Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={isLoading}
          className={`px-8 py-3.5 rounded-xl font-bold shadow-md transition-all ${
            isLoading
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
              : isPlaying 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gradient-to-r from-primary-500 to-indigo-600 text-white hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            'Loading AI tracking…'
          ) : (
            <>
              {isPlaying ? <Pause className="w-5 h-5 inline mr-2" /> : <Play className="w-5 h-5 inline mr-2" />}
              {isPlaying ? 'Pause Game' : 'Start Hand Tracking'}
            </>
          )}
        </button>
        
        <button
          onClick={() => { 
            userDrawingRef.current = [];
            setUserDrawing([]); 
            setTargetWaypointIdx(0); 
            setPassedWaypoints([]);
            targetWaypointIdxRef.current = 0;
            passedWaypointsRef.current = [];
            smoothPosRef.current = null;
            filterXRef.current.reset();
            filterYRef.current.reset();
            drawUserDrawing([], null);
            if (fingerCursorRef.current) fingerCursorRef.current.style.display = 'none';
            if (activeWaypoints.length > 0) {
              setStepGuidance(`Step 1 of ${activeWaypoints.length - 1}: Start at ${activeWaypoints[0].label} and draw towards ${activeWaypoints[1]?.label || 'end'}`);
            }
            setMessage('🔄 Reset! Start from checkpoint 1.'); 
          }}
          className="px-6 py-3.5 bg-gray-200 dark:bg-gray-700 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <RefreshCw className="w-5 h-5 inline mr-2" />
          Clear Drawing
        </button>
      </div>

      {/* Rules & Help */}
      <div className="glass-card rounded-xl p-4 text-center text-sm text-gray-500">
        <p>🤏 Pinch thumb & index to draw • 1mm smooth tracking • Checkpoints every 3 levels • Over 120+ shapes</p>
        <p className="text-xs mt-1 text-primary-500 font-medium">⚙️ Use hint controls above canvas to practice memory drawing!</p>
      </div>

      {/* Sensitivity Settings Modal */}
      {showSettings && <SensitivitySettingsModal />}
    </div>
  );
};

export default GestureDrawing;
