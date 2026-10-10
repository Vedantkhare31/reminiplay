import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import * as THREE from 'three';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import {
  ArrowLeft, Camera, RefreshCw, Trophy, Sparkles,
  Volume2, VolumeX, Compass, Lightbulb, CheckCircle2,
  ChevronRight, Hand, X, Lock, Unlock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ============================================================
// REUSABLE AUDIO SYNTHESIZER (SINGLETON CONTEXT - ZERO LAG)
// ============================================================
let sharedAudioCtx = null;
function getAudioCtx() {
  if (!sharedAudioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) sharedAudioCtx = new AC();
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

function playTone(freq, dur, type = 'sine', delay = 0, vol = 0.1) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    setTimeout(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur / 1000);
    }, delay);
  } catch (e) {}
}

const playLockSound    = () => playTone(580, 45, 'sine', 0, 0.07);
const playTurnSound    = () => { playTone(340, 65, 'sine'); playTone(480, 75, 'sine', 30); };
const playSuccessSound = () => {
  playTone(523.25, 110);
  playTone(659.25, 110, 'sine', 85);
  playTone(783.99, 140, 'sine', 170);
  playTone(1046.5, 280, 'sine', 260);
};
const playHintSound    = () => { playTone(660, 90); playTone(880, 130, 'sine', 75); };

// ============================================================
// OFFICIAL RUBIK'S CUBE COLOR PALETTE
// ============================================================
const CUBE_COLORS = {
  RIGHT:  0xb71234, // Red (+X)
  LEFT:   0xff5800, // Orange (-X)
  UP:     0xffffff, // White (+Y)
  DOWN:   0xffd500, // Yellow (-Y)
  FRONT:  0x009b48, // Green (+Z)
  BACK:   0x0046ad, // Blue (-Z)
  INSIDE: 0x18181b, // Core
};

// Minimal skeleton connections for fast 2D drawing
const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17],
];

// ============================================================
// VELOCITY-ADAPTIVE SMOOTHER
// ============================================================
class Smoother {
  constructor(alpha = 0.5) {
    this.a = alpha;
    this.x = null;
    this.y = null;
  }
  filter(x, y) {
    if (this.x === null) {
      this.x = x;
      this.y = y;
      return { x, y };
    }
    const speed = Math.abs(x - this.x) + Math.abs(y - this.y);
    const a = speed > 0.06 ? Math.min(this.a + 0.3, 0.92) : this.a;
    this.x += (x - this.x) * a;
    this.y += (y - this.y) * a;
    return { x: this.x, y: this.y };
  }
  reset() {
    this.x = null;
    this.y = null;
  }
}

// ============================================================
// HOW TO PLAY INSTRUCTION MODAL (SHOWN AT BEGINNING)
// ============================================================
function HowToPlayModal({ onClose }) {
  const steps = [
    {
      icon: '✋',
      badge: 'LEFT HAND',
      color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
      title: 'Revolve the Entire Cube',
      desc: 'Raise your LEFT hand on the left side of the camera and move it smoothly to spin and inspect all sides of the 3D cube.',
    },
    {
      icon: '👆',
      badge: 'RIGHT HAND (OPEN)',
      color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      title: 'Hover to Select a Cube Side',
      desc: 'Keep your RIGHT hand OPEN on the right side of the camera. Move it into a zone (Top, Bottom, Left, Right, or Front) to highlight that side on the cube. Moving while open will NEVER accidentally turn a side.',
    },
    {
      icon: '🤏',
      badge: 'RIGHT HAND (PINCH & SWIPE)',
      color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      title: 'Pinch to Lock Side, Swipe to Rotate!',
      desc: 'Pinch your thumb and index finger together to LOCK the selected side (it turns Gold). While holding the pinch, swipe Left ←, Right →, Up ↑, or Down ↓ to rotate that side! Unpinch to release.',
    },
    {
      icon: '💡',
      badge: 'PATIENT-FRIENDLY',
      color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
      title: 'Zero Rush, Gentle Stages',
      desc: 'There is no timer pressure or lives to lose. Stage 1 starts with just 1 simple turn, and you can press "Hint" anytime for guidance!',
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-slate-300"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-500 flex items-center justify-center text-2xl shadow-lg">
            🧊
          </div>
          <div>
            <h2 className="text-xl font-black text-white">How to Play Gesture Rubik's Cube</h2>
            <p className="text-xs text-slate-400">Simple Two-Hand Therapy Controls</p>
          </div>
        </div>

        <div className="space-y-3.5 mb-6">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-3.5 items-start p-3 rounded-2xl bg-slate-900/60 border border-slate-700/60">
              <div className="text-2xl mt-0.5 w-9 flex-shrink-0 text-center">{s.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${s.color}`}>
                    {s.badge}
                  </span>
                  <span className="text-sm font-bold text-white">{s.title}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-black text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <span>Start Playing Stage 1</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// ZONE MAPPING FOR RIGHT HAND (SELECTING CUBE SIDE)
// ============================================================
// rx is normalized within the Right-Hand region (0..1), ry is normalized height (0..1)
function getZoneFromRightHand(rx, ry) {
  if (ry < 0.28) {
    return { key: 'U', label: 'Top Side (U)', short: 'TOP (U)', orient: 'horizontal' };
  }
  if (ry > 0.72) {
    return { key: 'D', label: 'Bottom Side (D)', short: 'BOTTOM (D)', orient: 'horizontal' };
  }
  if (rx < 0.34) {
    return { key: 'L', label: 'Left Side (L)', short: 'LEFT (L)', orient: 'vertical' };
  }
  if (rx > 0.66) {
    return { key: 'R', label: 'Right Side (R)', short: 'RIGHT (R)', orient: 'vertical' };
  }
  return { key: 'F', label: 'Front Side (F)', short: 'FRONT (F)', orient: 'face' };
}

// ============================================================
// MAIN COMPONENT
// ============================================================
const GestureRubiksCube = () => {
  const navigate = useNavigate();
  const { user, syncProgress } = useAuth();

  // DOM & Canvas Refs
  const mountRef          = useRef(null);
  const webcamRef         = useRef(null);
  const hudCanvasRef      = useRef(null);
  const confettiCanvasRef = useRef(null);
  const confettiAnimRef   = useRef(null);
  const offscreenCanvasRef = useRef(null);

  // Three.js Refs
  const sceneRef      = useRef(null);
  const cameraRef     = useRef(null);
  const rendererRef   = useRef(null);
  const cubeGroupRef  = useRef(null);
  const cubiesRef     = useRef([]);
  const isAnimRef     = useRef(false);
  const moveQueueRef  = useRef([]);

  // Smooth 60 FPS Orbit Target
  const targetRotRef  = useRef({ x: 0.38, y: -0.55 });

  // Mouse Orbit Fallback
  const isDraggingRef = useRef(false);
  const prevMouseRef  = useRef({ x: 0, y: 0 });

  // Gesture Tracking Refs (Zero React re-render overhead inside loop)
  const detectorRef       = useRef(null);
  const hudCtxRef         = useRef(null);
  const leftSmoothRef     = useRef(new Smoother(0.48));
  const rightSmoothRef    = useRef(new Smoother(0.55));
  const prevLeftPosRef    = useRef(null);
  const hoveredZoneRef    = useRef(null);
  const lockedZoneRef     = useRef(null);
  const isPinchedRef      = useRef(false);
  const pinchAnchorRef    = useRef(null);
  const swipeDoneInPinchRef = useRef(false);
  const lastMoveTimeRef   = useRef(0);
  const swapHandsRef      = useRef(false);
  const lastHighlightKeyRef = useRef('');

  // Track persistent hand assignments so hands don't swap mid-gesture
  const handMemoryRef = useRef({
    left:  { x: 0.25, y: 0.5, lastSeen: 0 },
    right: { x: 0.75, y: 0.5, lastSeen: 0 },
  });

  // Callback Refs
  const executeVisualMoveRef = useRef(null);
  const executeNotationRef   = useRef(null);
  const highlightLayerRef    = useRef(null);
  const stageSolvedRef       = useRef(false);

  // UI States
  const [level, setLevel]               = useState(user?.gameStats?.rubiksCubeLevel || 1);
  const [coins, setCoins]               = useState(user?.coins ?? 100);
  const [totalSolved, setTotalSolved]   = useState(0);
  const [stageSolved, setStageSolved]   = useState(false);
  const [moveCount, setMoveCount]       = useState(0);
  const [isSoundOn, setIsSoundOn]       = useState(true);
  const [detectorReady, setDetectorReady] = useState(false);
  const [handCount, setHandCount]       = useState(0);
  const [showCam, setShowCam]           = useState(true);
  const [swapHands, setSwapHands]       = useState(false);
  const [activeZone, setActiveZone]     = useState(null);
  const [isPinchedUI, setIsPinchedUI]   = useState(false);
  const [swipeToast, setSwipeToast]     = useState(null);
  const [hintMove, setHintMove]         = useState(null);
  const [elapsedTime, setElapsedTime]   = useState(0);
  const [scrambleDepth, setScrambleDepth] = useState(1);
  const [stageStartTime, setStageStartTime] = useState(Date.now());
  const [feedback, setFeedback]         = useState('Stage 1: Hover with Right Hand to select a side, Pinch to lock, and Swipe to turn!');
  const [patientStats, setPatientStats] = useState({ avgSolveTime: 0, rating: 'Optimal' });
  const [showHowTo, setShowHowTo]       = useState(true);

  // History of applied moves for accurate hints
  const moveHistoryRef = useRef([]);

  useEffect(() => {
    swapHandsRef.current = swapHands;
  }, [swapHands]);

  // ============================================================
  // 1. THREE.JS CUBE INITIALIZATION (OPTIMIZED FOR 60 FPS, NO SHADOW LAG)
  // ============================================================
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const w = container.clientWidth || 600;
    const h = container.clientHeight || 500;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(0, 0, 8.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Fast WebGL Renderer — shadowMap disabled for 2x GPU performance
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Clean Studio Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.05));
    const dl1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dl1.position.set(6, 10, 10);
    scene.add(dl1);
    const dl2 = new THREE.DirectionalLight(0x93c5fd, 0.35);
    dl2.position.set(-6, -8, -6);
    scene.add(dl2);

    const cubeGroup = new THREE.Group();
    cubeGroup.rotation.set(targetRotRef.current.x, targetRotRef.current.y, 0);
    scene.add(cubeGroup);
    cubeGroupRef.current = cubeGroup;

    const cubies = [];
    const geo = new THREE.BoxGeometry(0.93, 0.93, 0.93);

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;
          const mats = [
            new THREE.MeshLambertMaterial({ color: x ===  1 ? CUBE_COLORS.RIGHT  : CUBE_COLORS.INSIDE, emissive: 0x000000 }),
            new THREE.MeshLambertMaterial({ color: x === -1 ? CUBE_COLORS.LEFT   : CUBE_COLORS.INSIDE, emissive: 0x000000 }),
            new THREE.MeshLambertMaterial({ color: y ===  1 ? CUBE_COLORS.UP     : CUBE_COLORS.INSIDE, emissive: 0x000000 }),
            new THREE.MeshLambertMaterial({ color: y === -1 ? CUBE_COLORS.DOWN   : CUBE_COLORS.INSIDE, emissive: 0x000000 }),
            new THREE.MeshLambertMaterial({ color: z ===  1 ? CUBE_COLORS.FRONT  : CUBE_COLORS.INSIDE, emissive: 0x000000 }),
            new THREE.MeshLambertMaterial({ color: z === -1 ? CUBE_COLORS.BACK   : CUBE_COLORS.INSIDE, emissive: 0x000000 }),
          ];
          const mesh = new THREE.Mesh(geo, mats);
          mesh.position.set(x, y, z);
          cubeGroup.add(mesh);
          cubies.push(mesh);
        }
      }
    }
    cubiesRef.current = cubies;

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const tr = targetRotRef.current;
      cubeGroup.rotation.y += (tr.y - cubeGroup.rotation.y) * 0.22;
      cubeGroup.rotation.x += (tr.x - cubeGroup.rotation.x) * 0.22;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container || !renderer) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      geo.dispose();
      cubies.forEach((c) => {
        if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
      });
    };
  }, []);

  // ============================================================
  // 2. RESOLVE VIEW-ALIGNED CUBE LAYER FROM ZONE KEY ('U','D','L','R','F','B')
  // ============================================================
  // Maps 'U','D','L','R','F','B' to the actual Three.js cube axis & layer that is
  // currently at the Top, Bottom, Left, Right, Front, or Back of the user's screen!
  const resolveViewAlignedLayer = useCallback((zoneKey) => {
    const cg = cubeGroupRef.current;
    if (!cg) return { axis: 'y', layerIndex: 1 };

    const localAxes = [
      { axis: 'x', layerIndex:  1, vec: new THREE.Vector3( 1,  0,  0) },
      { axis: 'x', layerIndex: -1, vec: new THREE.Vector3(-1,  0,  0) },
      { axis: 'y', layerIndex:  1, vec: new THREE.Vector3( 0,  1,  0) },
      { axis: 'y', layerIndex: -1, vec: new THREE.Vector3( 0, -1,  0) },
      { axis: 'z', layerIndex:  1, vec: new THREE.Vector3( 0,  0,  1) },
      { axis: 'z', layerIndex: -1, vec: new THREE.Vector3( 0,  0, -1) },
    ];

    const targetDir = new THREE.Vector3();
    if (zoneKey === 'U') targetDir.set(0, 1, 0);
    else if (zoneKey === 'D') targetDir.set(0, -1, 0);
    else if (zoneKey === 'L') targetDir.set(-1, 0, 0);
    else if (zoneKey === 'R') targetDir.set(1, 0, 0);
    else if (zoneKey === 'B') targetDir.set(0, 0, -1);
    else targetDir.set(0, 0, 1); // 'F'

    let best = localAxes[0];
    let bestDot = -Infinity;
    for (const candidate of localAxes) {
      const worldVec = candidate.vec.clone().applyQuaternion(cg.quaternion);
      const d = worldVec.dot(targetDir);
      if (d > bestDot) {
        bestDot = d;
        best = candidate;
      }
    }
    return { axis: best.axis, layerIndex: best.layerIndex, worldNormal: best.vec.clone().applyQuaternion(cg.quaternion) };
  }, []);

  // ============================================================
  // 3. HIGHLIGHT SELECTED OR LOCKED LAYER ON 3D CUBE
  // ============================================================
  const highlightLayer = useCallback((zoneKey, isLocked = false) => {
    const cacheKey = `${zoneKey || 'none'}_${isLocked ? 'L' : 'H'}`;
    if (lastHighlightKeyRef.current === cacheKey) return;
    lastHighlightKeyRef.current = cacheKey;

    const cubies = cubiesRef.current;
    if (!cubies) return;

    const resolved = zoneKey ? resolveViewAlignedLayer(zoneKey) : null;
    // Gold glow when pinched/locked, Sky Blue glow when hovering
    const glowHex = isLocked ? 0xf59e0b : 0x38bdf8;

    cubies.forEach((m) => {
      let match = false;
      if (resolved) {
        const v = resolved.axis === 'x' ? m.position.x : resolved.axis === 'y' ? m.position.y : m.position.z;
        match = Math.abs(v - resolved.layerIndex) < 0.3;
      }
      m.material.forEach((mat) => {
        if (mat.color.getHex() !== CUBE_COLORS.INSIDE) {
          mat.emissive.setHex(match ? glowHex : 0x000000);
        }
      });
    });
  }, [resolveViewAlignedLayer]);

  // ============================================================
  // 4. LAYER ROTATION ANIMATION ENGINE
  // ============================================================
  const rotateLayer = useCallback((axis, layerIndex, angle, dur = 180) => {
    return new Promise((resolve) => {
      if (isAnimRef.current) {
        moveQueueRef.current.push({ axis, layerIndex, angle, dur, resolve });
        return;
      }
      isAnimRef.current = true;
      const cg = cubeGroupRef.current;
      const cubies = cubiesRef.current;
      if (!cg || !cubies) {
        isAnimRef.current = false;
        resolve();
        return;
      }

      const active = cubies.filter((m) => {
        const v = axis === 'x' ? m.position.x : axis === 'y' ? m.position.y : m.position.z;
        return Math.abs(v - layerIndex) < 0.3;
      });

      const pivot = new THREE.Group();
      cg.add(pivot);
      active.forEach((c) => pivot.attach(c));
      if (isSoundOn) playTurnSound();

      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        if (axis === 'x') pivot.rotation.x = angle * e;
        else if (axis === 'y') pivot.rotation.y = angle * e;
        else pivot.rotation.z = angle * e;

        if (p < 1) {
          requestAnimationFrame(step);
          return;
        }

        if (axis === 'x') pivot.rotation.x = angle;
        else if (axis === 'y') pivot.rotation.y = angle;
        else pivot.rotation.z = angle;
        pivot.updateMatrixWorld();

        active.forEach((c) => {
          cg.attach(c);
          c.position.x = Math.round(c.position.x);
          c.position.y = Math.round(c.position.y);
          c.position.z = Math.round(c.position.z);
        });
        cg.remove(pivot);
        isAnimRef.current = false;
        lastHighlightKeyRef.current = ''; // refresh highlight
        resolve();

        const nxt = moveQueueRef.current.shift();
        if (nxt) rotateLayer(nxt.axis, nxt.layerIndex, nxt.angle, nxt.dur).then(nxt.resolve);
      };
      requestAnimationFrame(step);
    });
  }, [isSoundOn]);

  // ============================================================
  // 5. CHECK IF CUBE IS SOLVED
  // ============================================================
  const checkSolved = useCallback(() => {
    const cubies = cubiesRef.current;
    if (!cubies?.length) return false;
    const dirs = [
      new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1),
    ];
    for (const fn of dirs) {
      const side = cubies.filter((m) => {
        if (fn.x) return Math.abs(m.position.x - fn.x) < 0.3;
        if (fn.y) return Math.abs(m.position.y - fn.y) < 0.3;
        return Math.abs(m.position.z - fn.z) < 0.3;
      });
      if (side.length !== 9) continue;
      const colors = side.map((m) => {
        let best = -Infinity;
        let col = null;
        dirs.forEach((ln, i) => {
          const wn = ln.clone().applyQuaternion(m.quaternion);
          const d = wn.dot(fn);
          if (d > best) {
            best = d;
            col = m.material[i].color.getHex();
          }
        });
        return col;
      });
      if (!colors.every((c) => c === colors[0])) return false;
    }
    handleVictory();
    return true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Standard notation move (for buttons, scrambler, and hint solver)
  const executeNotationMove = useCallback(async (notation, isUser = true) => {
    if (stageSolvedRef.current && isUser) return;
    const MAP = {
      'U':  { axis: 'y', layer:  1, angle: -Math.PI / 2 },
      "U'": { axis: 'y', layer:  1, angle:  Math.PI / 2 },
      'D':  { axis: 'y', layer: -1, angle:  Math.PI / 2 },
      "D'": { axis: 'y', layer: -1, angle: -Math.PI / 2 },
      'R':  { axis: 'x', layer:  1, angle: -Math.PI / 2 },
      "R'": { axis: 'x', layer:  1, angle:  Math.PI / 2 },
      'L':  { axis: 'x', layer: -1, angle:  Math.PI / 2 },
      "L'": { axis: 'x', layer: -1, angle: -Math.PI / 2 },
      'F':  { axis: 'z', layer:  1, angle: -Math.PI / 2 },
      "F'": { axis: 'z', layer:  1, angle:  Math.PI / 2 },
      'B':  { axis: 'z', layer: -1, angle:  Math.PI / 2 },
      "B'": { axis: 'z', layer: -1, angle: -Math.PI / 2 },
    };
    const m = MAP[notation];
    if (!m) return;
    await rotateLayer(m.axis, m.layer, m.angle, 180);
    if (isUser) {
      moveHistoryRef.current.push({ axis: m.axis, layer: m.layer, angle: m.angle });
      setMoveCount((p) => p + 1);
      setHintMove(null);
      checkSolved();
    }
  }, [rotateLayer, checkSolved]);

  // ============================================================
  // 6. VIEW-ALIGNED SWIPE ROTATION (100% MATCHES HAND SWIPE DIRECTION!)
  // ============================================================
  // Given a locked zoneKey ('U','D','L','R','F','B') and hand swipe vector (dx, dy) on screen,
  // computes the exact 3D rotation angle so the stickers move in the EXACT direction of the hand!
  const executeVisualSwipeMove = useCallback(async (zoneKey, dx, dy) => {
    if (stageSolvedRef.current || isAnimRef.current) return;
    const cg = cubeGroupRef.current;
    if (!cg) return;

    const { axis, layerIndex } = resolveViewAlignedLayer(zoneKey);

    // Local rotation axis vector in world space
    const localAxisVec = new THREE.Vector3(
      axis === 'x' ? 1 : 0,
      axis === 'y' ? 1 : 0,
      axis === 'z' ? 1 : 0
    );
    const worldAxis = localAxisVec.clone().applyQuaternion(cg.quaternion);

    // Pick a point on the front of this layer (closest to camera +Z)
    // Velocity of a point P under positive rotation (+angle) around worldAxis is: V = worldAxis x P
    const samplePoint = new THREE.Vector3(0, 0, 1);
    if (zoneKey === 'F' || zoneKey === 'B') {
      // For Front/Back face, sample the top edge (0, 1, 0) so swiping Right turns clockwise
      samplePoint.set(0, 1, 0);
    }

    const tangent = new THREE.Vector3().crossVectors(worldAxis, samplePoint);
    // Screen swipe vector (screen +X is right, screen -Y is up -> Three.js +Y is up)
    const swipeVec3D = new THREE.Vector3(dx, -dy, 0);

    const dot = tangent.dot(swipeVec3D);
    const angle = dot >= 0 ? Math.PI / 2 : -Math.PI / 2;

    await rotateLayer(axis, layerIndex, angle, 180);
    moveHistoryRef.current.push({ axis, layer: layerIndex, angle });
    setMoveCount((p) => p + 1);
    setHintMove(null);
    checkSolved();
  }, [resolveViewAlignedLayer, rotateLayer, checkSolved]);

  // ============================================================
  // 7. CONFETTI & STAGE VICTORY
  // ============================================================
  const triggerConfetti = useCallback(() => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth || window.innerWidth;
    canvas.height = canvas.clientHeight || window.innerHeight;
    const cols = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];
    const pts = Array.from({ length: 55 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 80,
      y: canvas.height / 2 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 11,
      vy: (Math.random() - 1.2) * 11,
      sz: Math.random() * 5 + 4,
      col: cols[Math.floor(Math.random() * cols.length)],
      life: 1,
    }));
    if (confettiAnimRef.current) cancelAnimationFrame(confettiAnimRef.current);
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.26;
        p.life -= 0.018;
        if (p.life > 0) {
          alive = true;
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.col;
          ctx.fillRect(p.x, p.y, p.sz, p.sz);
        }
      });
      ctx.globalAlpha = 1;
      if (alive) confettiAnimRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, []);

  const handleVictory = useCallback(() => {
    setStageSolved(true);
    stageSolvedRef.current = true;
    if (isSoundOn) playSuccessSound();
    triggerConfetti();
    highlightLayer(null, false);

    const timeSpent = Math.round((Date.now() - stageStartTime) / 1000);
    const newTotal = totalSolved + 1;
    setTotalSolved(newTotal);

    let rating = 'Steady & Mindful';
    let msg = 'Wonderful pattern completion!';
    let nextD = scrambleDepth;

    if (timeSpent < 20) {
      rating = 'Quick Reflexes';
      msg = 'Fantastic spatial control! Gently increasing stage challenge.';
      nextD = Math.min(scrambleDepth + 1, 7);
    } else if (timeSpent <= 60) {
      rating = 'Comfortable Pace';
      msg = 'Great focus and steady hand coordination!';
      if (newTotal % 2 === 0) nextD = Math.min(scrambleDepth + 1, 7);
    } else {
      rating = 'Thoughtful Exploration';
      msg = 'Great patience! Keeping the next puzzle comfortable.';
    }

    setFeedback(msg);
    setPatientStats({
      avgSolveTime: Math.round(((patientStats.avgSolveTime * (newTotal - 1)) + timeSpent) / newTotal),
      rating,
    });

    const pts = 50 + Math.max(10, 40 - Math.floor(timeSpent / 2));
    const newCoins = coins + pts;
    const newLevel = level + (nextD > scrambleDepth ? 1 : 0);
    setCoins(newCoins);
    setLevel(newLevel);
    setScrambleDepth(nextD);

    if (syncProgress) {
      syncProgress({
        coins: newCoins,
        score: (user?.score || 0) + pts,
        gameStats: { rubiksCubeLevel: newLevel, rubikSolved: newTotal, lastPerformance: rating },
      });
    }
  }, [coins, level, scrambleDepth, stageStartTime, totalSolved, user, isSoundOn, syncProgress, triggerConfetti, patientStats.avgSolveTime, highlightLayer]);

  // ============================================================
  // 8. GENTLE SCRAMBLER & SMART UNDO HINT
  // ============================================================
  const startPuzzle = useCallback(async (depth = null) => {
    setStageSolved(false);
    stageSolvedRef.current = false;
    setMoveCount(0);
    setHintMove(null);
    setStageStartTime(Date.now());
    highlightLayer(null, false);
    targetRotRef.current = { x: 0.38, y: -0.55 };

    const d = depth !== null ? depth : scrambleDepth;
    setScrambleDepth(d);
    const pool = ['U', "U'", 'D', "D'", 'R', "R'", 'L', "L'", 'F', "F'"];
    const recorded = [];

    const MAP = {
      'U':  { axis: 'y', layer:  1, angle: -Math.PI / 2 },
      "U'": { axis: 'y', layer:  1, angle:  Math.PI / 2 },
      'D':  { axis: 'y', layer: -1, angle:  Math.PI / 2 },
      "D'": { axis: 'y', layer: -1, angle: -Math.PI / 2 },
      'R':  { axis: 'x', layer:  1, angle: -Math.PI / 2 },
      "R'": { axis: 'x', layer:  1, angle:  Math.PI / 2 },
      'L':  { axis: 'x', layer: -1, angle:  Math.PI / 2 },
      "L'": { axis: 'x', layer: -1, angle: -Math.PI / 2 },
      'F':  { axis: 'z', layer:  1, angle: -Math.PI / 2 },
      "F'": { axis: 'z', layer:  1, angle:  Math.PI / 2 },
    };

    for (let i = 0; i < d; i++) {
      const mv = pool[Math.floor(Math.random() * pool.length)];
      const info = MAP[mv];
      recorded.push({ axis: info.axis, layer: info.layer, angle: info.angle, notation: mv });
      await rotateLayer(info.axis, info.layer, info.angle, 160);
      await new Promise((r) => setTimeout(r, 70));
    }
    moveHistoryRef.current = recorded;
    setFeedback(
      d === 1
        ? 'Stage 1: Only 1 turn needed! Hover Right Hand to select a side, Pinch to lock, and Swipe!'
        : `Stage ${level}: ${d} gentle turns to solve. Take all the time you need!`
    );
  }, [rotateLayer, scrambleDepth, highlightLayer, level]);

  useEffect(() => {
    const t = setTimeout(() => startPuzzle(1), 500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stageSolved) return;
    const iv = setInterval(() => setElapsedTime(Math.round((Date.now() - stageStartTime) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [stageStartTime, stageSolved]);

  // Smart Hint: Can even perform or highlight the exact inverse of the last move!
  const giveHint = async () => {
    if (stageSolved || isAnimRef.current) return;
    if (isSoundOn) playHintSound();

    if (moveHistoryRef.current.length > 0) {
      const last = moveHistoryRef.current[moveHistoryRef.current.length - 1];
      const axisName =
        last.axis === 'y'
          ? last.layer === 1 ? 'Top (U)' : 'Bottom (D)'
          : last.axis === 'x'
          ? last.layer === 1 ? 'Right (R)' : 'Left (L)'
          : last.layer === 1 ? 'Front (F)' : 'Back (B)';
      setHintMove(axisName);
      setFeedback(`💡 Hint: Select "${axisName}", pinch your right fingers, and swipe to align the colors!`);
    } else {
      setFeedback('💡 Hint: Hover your Right Hand on the highlighted face, pinch, and swipe!');
    }
  };

  // Keep refs updated
  useEffect(() => {
    executeVisualMoveRef.current = executeVisualSwipeMove;
    executeNotationRef.current   = executeNotationMove;
    highlightLayerRef.current    = highlightLayer;
    stageSolvedRef.current       = stageSolved;
  });

  // ============================================================
  // 9. INITIALIZE AI HAND DETECTOR
  // ============================================================
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let det = null;
      try {
        det = await handPoseDetection.createDetector(
          handPoseDetection.SupportedModels.MediaPipeHands,
          {
            runtime: 'mediapipe',
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240',
            modelType: 'lite',
            maxHands: 2,
          }
        );
      } catch {
        try {
          await tf.ready();
          det = await handPoseDetection.createDetector(
            handPoseDetection.SupportedModels.MediaPipeHands,
            { runtime: 'tfjs', modelType: 'lite', maxHands: 2 }
          );
        } catch {}
      }
      if (!cancelled && det) {
        detectorRef.current = det;
        setDetectorReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // 10. ULTRA-FAST DUAL-HAND TRACKING ENGINE (PRE-MIRRORED 256×192)
  // ============================================================
  useEffect(() => {
    let alive = true;
    let tid = null;

    // Create tiny 256×192 offscreen canvas for ultra-fast, pre-mirrored AI inference
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 256;
    offCanvas.height = 192;
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: false });
    offscreenCanvasRef.current = offCanvas;

    const W = 320;
    const H = 240;

    const norm = (kp) => {
      if (!kp) return { x: 0.5, y: 0.5 };
      const isFrac = kp.x <= 1.05 && kp.y <= 1.05;
      return {
        x: isFrac ? kp.x : kp.x / 256,
        y: isFrac ? kp.y : kp.y / 192,
      };
    };

    const drawSkeleton = (ctx, pts, color) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      HAND_CONNECTIONS.forEach(([a, b]) => {
        const p1 = pts[a];
        const p2 = pts[b];
        if (p1 && p2) {
          ctx.moveTo(p1.x * W, p1.y * H);
          ctx.lineTo(p2.x * W, p2.y * H);
        }
      });
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = '#ffffff';
      [4, 8].forEach((i) => {
        const p = pts[i];
        if (p) {
          ctx.moveTo(p.x * W + 4, p.y * H);
          ctx.arc(p.x * W, p.y * H, 4, 0, Math.PI * 2);
        }
      });
      ctx.fill();
    };

    const drawHudZones = (ctx, activeKey, isLocked) => {
      // Right half of camera (x: 0.45..1.0) shows the 5 interactive zones clearly
      const x0 = swapHandsRef.current ? 0 : W * 0.42;
      const zw = W * 0.58;

      // Divider line between Left Hand (Orbit) and Right Hand (Side Select & Turn)
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(swapHandsRef.current ? W * 0.58 : W * 0.42, 0);
      ctx.lineTo(swapHandsRef.current ? W * 0.58 : W * 0.42, H);
      ctx.stroke();
      ctx.restore();

      const zones = [
        { key: 'U', label: 'TOP (U)',   x: x0,            y: 0,        w: zw,        h: H * 0.28 },
        { key: 'L', label: 'LEFT (L)',  x: x0,            y: H * 0.28, w: zw * 0.34, h: H * 0.44 },
        { key: 'F', label: 'FRONT (F)', x: x0 + zw * 0.34, y: H * 0.28, w: zw * 0.32, h: H * 0.44 },
        { key: 'R', label: 'RIGHT (R)', x: x0 + zw * 0.66, y: H * 0.28, w: zw * 0.34, h: H * 0.44 },
        { key: 'D', label: 'BOT (D)',   x: x0,            y: H * 0.72, w: zw,        h: H * 0.28 },
      ];

      zones.forEach((z) => {
        const isSel = activeKey === z.key;
        if (isSel) {
          ctx.fillStyle = isLocked ? 'rgba(245, 158, 11, 0.42)' : 'rgba(56, 189, 248, 0.32)';
          ctx.strokeStyle = isLocked ? '#f59e0b' : '#38bdf8';
          ctx.lineWidth = 2.5;
        } else {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;
        }
        ctx.fillRect(z.x, z.y, z.w, z.h);
        ctx.strokeRect(z.x, z.y, z.w, z.h);

        ctx.fillStyle = isSel ? (isLocked ? '#fde68a' : '#e0f2fe') : 'rgba(255,255,255,0.55)';
        ctx.font = `bold 10px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(
          isSel && isLocked ? `🔒 ${z.label}` : z.label,
          z.x + z.w / 2,
          z.y + z.h / 2 + 4
        );
      });
      ctx.textAlign = 'left';
    };

    let prevCount = -1;
    let prevZoneStr = '';
    let prevPinchBool = false;

    const detect = async () => {
      if (!alive) return;

      const video = webcamRef.current?.video;
      const detector = detectorRef.current;
      const canvas = hudCanvasRef.current;

      if (!detector || !video || video.readyState < 2 || !video.videoWidth || !canvas) {
        tid = setTimeout(detect, 80);
        return;
      }

      if (canvas.width !== W) canvas.width = W;
      if (canvas.height !== H) canvas.height = H;

      let ctx = hudCtxRef.current;
      if (!ctx) {
        ctx = canvas.getContext('2d', { alpha: true });
        hudCtxRef.current = ctx;
      }

      try {
        // 1. Draw mirrored video frame onto tiny 256×192 canvas (eliminates WebGL flip overhead!)
        offCtx.save();
        offCtx.scale(-1, 1);
        offCtx.drawImage(video, -256, 0, 256, 192);
        offCtx.restore();

        // 2. Run detector on already-mirrored tiny canvas
        const hands = await detector.estimateHands(offCanvas, { flipHorizontal: false });
        if (!alive) return;

        ctx.clearRect(0, 0, W, H);
        const now = performance.now();
        const count = hands ? hands.length : 0;

        if (count !== prevCount) {
          prevCount = count;
          setHandCount(count);
        }

        // Convert all detected hands to normalized screen coordinates (0 = Left of screen, 1 = Right of screen)
        const parsedHands = (hands || []).map((h) => {
          const pts = h.keypoints.map(norm);
          const palm = pts[9] || pts[0];
          return { pts, palmX: palm.x, palmY: palm.y };
        });

        let leftHand = null;  // Revolves/Orbits the 3D cube
        let rightHand = null; // Selects side (when open) & Pinches+Swipes to rotate side

        const isSwapped = swapHandsRef.current;

        if (parsedHands.length >= 2) {
          // Sort left-to-right on screen: smaller X is on the LEFT of screen, larger X is on the RIGHT
          parsedHands.sort((a, b) => a.palmX - b.palmX);
          leftHand  = isSwapped ? parsedHands[1] : parsedHands[0];
          rightHand = isSwapped ? parsedHands[0] : parsedHands[1];

          handMemoryRef.current.left  = { x: leftHand.palmX,  y: leftHand.palmY,  lastSeen: now };
          handMemoryRef.current.right = { x: rightHand.palmX, y: rightHand.palmY, lastSeen: now };
        } else if (parsedHands.length === 1) {
          const single = parsedHands[0];
          // If currently pinched & locked on right hand, keep it as rightHand even if swiping across center!
          if (isPinchedRef.current && now - handMemoryRef.current.right.lastSeen < 500) {
            rightHand = single;
            handMemoryRef.current.right = { x: single.palmX, y: single.palmY, lastSeen: now };
          } else {
            // Screen split: Left side of screen (< 0.45) = Left Hand, Right side (>= 0.45) = Right Hand
            const onRightSide = isSwapped ? single.palmX < 0.55 : single.palmX >= 0.42;
            if (onRightSide) {
              rightHand = single;
              handMemoryRef.current.right = { x: single.palmX, y: single.palmY, lastSeen: now };
            } else {
              leftHand = single;
              handMemoryRef.current.left = { x: single.palmX, y: single.palmY, lastSeen: now };
            }
          }
        }

        const activeZoneObj = lockedZoneRef.current || hoveredZoneRef.current;
        drawHudZones(ctx, activeZoneObj?.key || null, isPinchedRef.current);

        // ── PROCESS LEFT HAND: SMOOTH CUBE ORBIT ──────────────────────
        if (leftHand) {
          const kps = leftHand.pts;
          drawSkeleton(ctx, kps, '#06b6d4');

          const sm = leftSmoothRef.current.filter(leftHand.palmX, leftHand.palmY);
          if (prevLeftPosRef.current) {
            const dx = (sm.x - prevLeftPosRef.current.x) * W;
            const dy = (sm.y - prevLeftPosRef.current.y) * H;
            // Smooth deadzone to ignore involuntary hand tremor
            if (Math.abs(dx) > 1.1) targetRotRef.current.y += dx * 0.017;
            if (Math.abs(dy) > 1.1) {
              // Clamp vertical tilt so cube never flips upside-down
              targetRotRef.current.x = Math.max(-0.8, Math.min(0.8, targetRotRef.current.x + dy * 0.015));
            }
          }
          prevLeftPosRef.current = { x: sm.x, y: sm.y };

          // Wrist badge
          ctx.fillStyle = '#06b6d4';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText('✋ LEFT: ORBIT', Math.max(6, kps[0].x * W - 30), Math.max(14, kps[0].y * H - 10));
        } else if (now - handMemoryRef.current.left.lastSeen > 300) {
          leftSmoothRef.current.reset();
          prevLeftPosRef.current = null;
        }

        // ── PROCESS RIGHT HAND: HOVER TO SELECT -> PINCH TO LOCK -> SWIPE TO TURN ──
        if (rightHand) {
          const kps = rightHand.pts;
          const thumbTip = kps[4];
          const indexTip = kps[8];
          const wrist    = kps[0];
          const midMcp   = kps[9];

          // Midpoint between thumb & index finger is the most stable control point
          const ctrlX = (thumbTip.x + indexTip.x) * 0.5;
          const ctrlY = (thumbTip.y + indexTip.y) * 0.5;
          const sm = rightSmoothRef.current.filter(ctrlX, ctrlY);

          // Scale-invariant pinch detection (normalized by palm size so distance to camera doesn't matter)
          const palmSize = Math.max(0.08, Math.hypot(midMcp.x - wrist.x, midMcp.y - wrist.y));
          const rawPinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
          const pinchRatio = rawPinchDist / palmSize;

          // Hysteresis: engage pinch at < 0.48, release pinch at > 0.62
          const wasPinched = isPinchedRef.current;
          const nowPinched = wasPinched ? pinchRatio < 0.62 : pinchRatio < 0.48;

          if (!nowPinched) {
            // ── STATE 1: RIGHT HAND OPEN (SELECTING SIDE ONLY) ──
            if (wasPinched) {
              isPinchedRef.current = false;
              lockedZoneRef.current = null;
              pinchAnchorRef.current = null;
              swipeDoneInPinchRef.current = false;
            }

            // Compute relative X inside the Right-Hand zone area (0..1)
            const regionStart = isSwapped ? 0 : 0.42;
            const regionWidth = 0.58;
            const relX = Math.max(0, Math.min(1, (sm.x - regionStart) / regionWidth));
            const zone = getZoneFromRightHand(relX, sm.y);
            hoveredZoneRef.current = zone;

            if (highlightLayerRef.current) highlightLayerRef.current(zone.key, false);

            // Draw open-hand selection cursor
            drawSkeleton(ctx, kps, '#10b981');
            ctx.beginPath();
            ctx.arc(sm.x * W, sm.y * H, 10, 0, Math.PI * 2);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.stroke();

          } else {
            // ── STATE 2: RIGHT HAND PINCHED (SIDE LOCKED + SWIPE TO ROTATE) ──
            if (!wasPinched) {
              // Just pinched! Lock the currently hovered zone
              isPinchedRef.current = true;
              const regionStart = isSwapped ? 0 : 0.42;
              const relX = Math.max(0, Math.min(1, (sm.x - regionStart) / 0.58));
              lockedZoneRef.current = hoveredZoneRef.current || getZoneFromRightHand(relX, sm.y);
              pinchAnchorRef.current = { x: sm.x, y: sm.y };
              swipeDoneInPinchRef.current = false;
              if (isSoundOn) playLockSound();
            }

            const locked = lockedZoneRef.current;
            if (locked && highlightLayerRef.current) {
              highlightLayerRef.current(locked.key, true);
            }

            drawSkeleton(ctx, kps, '#f59e0b');

            // Draw Pinch Anchor & Live Swipe Vector Line
            if (pinchAnchorRef.current) {
              const ax = pinchAnchorRef.current.x * W;
              const ay = pinchAnchorRef.current.y * H;
              const cx = sm.x * W;
              const cy = sm.y * H;

              // Anchor ring
              ctx.beginPath();
              ctx.arc(ax, ay, 7, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(245, 158, 11, 0.5)';
              ctx.fill();

              // Swipe line
              ctx.beginPath();
              ctx.moveTo(ax, ay);
              ctx.lineTo(cx, cy);
              ctx.strokeStyle = '#fbbf24';
              ctx.lineWidth = 3.5;
              ctx.stroke();

              // Current pinched cursor
              ctx.beginPath();
              ctx.arc(cx, cy, 13, 0, Math.PI * 2);
              ctx.strokeStyle = '#f59e0b';
              ctx.lineWidth = 3;
              ctx.stroke();

              // Check swipe distance while pinched
              if (!swipeDoneInPinchRef.current && !isAnimRef.current && Date.now() - lastMoveTimeRef.current > 380) {
                const dx = cx - ax;
                const dy = cy - ay;
                const SWIPE_PX = 24; // Smooth 24px swipe threshold

                if (Math.hypot(dx, dy) >= SWIPE_PX) {
                  swipeDoneInPinchRef.current = true;
                  lastMoveTimeRef.current = Date.now();
                  // Re-anchor so user can either unpinch OR swipe again after cooldown
                  pinchAnchorRef.current = { x: sm.x, y: sm.y };

                  const isHoriz = Math.abs(dx) >= Math.abs(dy);
                  const dirArrow = isHoriz ? (dx > 0 ? '→' : '←') : (dy > 0 ? '↓' : '↑');
                  setSwipeToast(`${locked.short} ${dirArrow}`);
                  setTimeout(() => setSwipeToast(null), 750);

                  if (executeVisualMoveRef.current) {
                    executeVisualMoveRef.current(locked.key, isHoriz ? dx : 0, isHoriz ? 0 : dy);
                  }
                }
              }
            }
          }

          // Update React UI badges only when zone or pinch state actually changes
          const curZone = (lockedZoneRef.current || hoveredZoneRef.current)?.label || '';
          if (curZone !== prevZoneStr) {
            prevZoneStr = curZone;
            setActiveZone(curZone);
          }
          if (nowPinched !== prevPinchBool) {
            prevPinchBool = nowPinched;
            setIsPinchedUI(nowPinched);
          }
        } else if (now - handMemoryRef.current.right.lastSeen > 350) {
          // Grace period expired for Right Hand
          rightSmoothRef.current.reset();
          isPinchedRef.current = false;
          lockedZoneRef.current = null;
          hoveredZoneRef.current = null;
          pinchAnchorRef.current = null;
          swipeDoneInPinchRef.current = false;
          if (prevZoneStr !== '') {
            prevZoneStr = '';
            setActiveZone(null);
          }
          if (prevPinchBool !== false) {
            prevPinchBool = false;
            setIsPinchedUI(false);
          }
          if (highlightLayerRef.current) highlightLayerRef.current(null, false);
        }
      } catch (e) {
        // Ignore transient frame error
      }

      // Guaranteed 32ms breathing room after inference so Three.js always renders at a locked 60 FPS!
      if (alive) {
        tid = setTimeout(() => {
          if (alive) requestAnimationFrame(detect);
        }, 32);
      }
    };

    detect();
    return () => {
      alive = false;
      if (tid) clearTimeout(tid);
    };
  }, [isSoundOn]);

  // ============================================================
  // 11. MOUSE ORBIT FALLBACK
  // ============================================================
  const onMouseDown = (e) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    targetRotRef.current.y += dx * 0.008;
    targetRotRef.current.x = Math.max(-0.8, Math.min(0.8, targetRotRef.current.x + dy * 0.008));
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = () => {
    isDraggingRef.current = false;
  };
  const resetView = () => {
    targetRotRef.current = { x: 0.38, y: -0.55 };
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    return `${m}:${s % 60 < 10 ? '0' : ''}${s % 60}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col select-none relative overflow-hidden">
      {/* Celebration Confetti */}
      <canvas ref={confettiCanvasRef} className="absolute inset-0 pointer-events-none z-50 w-full h-full" />

      {/* How To Play Modal (Shown at start of game) */}
      {showHowTo && <HowToPlayModal onClose={() => setShowHowTo(false)} />}

      {/* ── HEADER ── */}
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/60 px-4 py-2.5 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/games')}
            className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Games
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
                Gesture Rubik's Cube
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Stage {level}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              ✋ Left Hand: Orbit Cube &nbsp;•&nbsp; 👆 Right Hand Open: Select Side &nbsp;•&nbsp; 🤏 Pinch &amp; Swipe: Rotate Side
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHowTo(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-xs font-bold text-indigo-300 flex items-center gap-1.5"
          >
            <Hand className="w-3.5 h-3.5" /> How to Play
          </button>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Lv {level}
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> {coins}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300">
            ⏱ {fmt(elapsedTime)}
          </div>
          <button
            onClick={() => setIsSoundOn(!isSoundOn)}
            className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300"
          >
            {isSoundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* 3D Cube Viewport */}
        <div
          ref={mountRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          className="flex-1 w-full h-[54vh] lg:h-auto cursor-grab active:cursor-grabbing relative bg-gradient-to-b from-slate-900 to-slate-950"
        >
          {/* Top-Left Quick Actions */}
          <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-2">
            <button
              onClick={resetView}
              className="px-3 py-1.5 rounded-xl bg-slate-800/85 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-400" /> Reset View
            </button>
            <button
              onClick={giveHint}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Hint
            </button>
          </div>

          {/* Live Selection & Pinch-Lock Status Banner */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
            {activeZone ? (
              <div
                className={`px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
                  isPinchedUI
                    ? 'bg-amber-500/25 border-amber-400 text-amber-200 ring-2 ring-amber-400/40'
                    : 'bg-sky-500/20 border-sky-500/40 text-sky-200'
                }`}
              >
                {isPinchedUI ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4 text-sky-400" />}
                <span>
                  {isPinchedUI
                    ? `LOCKED: ${activeZone} — Swipe ← → ↑ ↓ to Turn!`
                    : `Selecting: ${activeZone} (Pinch to Lock)`}
                </span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-400">
                Raise Right Hand to select a side
              </div>
            )}

            {swipeToast && (
              <div className="px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm shadow-lg">
                Rotated {swipeToast}
              </div>
            )}

            {hintMove && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/30 border border-amber-400 text-xs font-bold text-amber-200">
                💡 Try turning: {hintMove}
              </div>
            )}
          </div>

          {/* Stage Solved Celebration Modal */}
          {stageSolved && (
            <div className="absolute inset-0 z-40 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-800 border border-slate-700 rounded-3xl p-7 max-w-sm w-full text-center shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h2 className="text-2xl font-black text-white">Stage {level} Complete!</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Solved in {fmt(elapsedTime)} with {moveCount} moves.
                </p>
                <div className="my-4 p-3 rounded-2xl bg-slate-900/60 border border-slate-700/60 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Cognitive Pace:</span>
                    <span className="font-bold text-emerald-400">{patientStats.rating}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Reward:</span>
                    <span className="font-bold text-yellow-400">+50 Coins 🎉</span>
                  </div>
                </div>
                <button
                  onClick={() => startPuzzle(null)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2"
                >
                  Next Stage <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Camera HUD & Controls */}
        <aside className="w-full lg:w-[23rem] bg-slate-800/90 border-t lg:border-t-0 lg:border-l border-slate-700/60 p-4 flex flex-col gap-3.5 z-20">
          {/* Camera Feed + Interactive Zone Overlay */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-400" /> Vision Tracking
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    !detectorReady ? 'bg-amber-400 animate-ping' : handCount > 0 ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                <span className="text-[11px] text-slate-300 font-semibold">
                  {!detectorReady ? 'Loading AI…' : handCount > 0 ? `${handCount} Hand${handCount > 1 ? 's' : ''} Active` : 'Show Hands'}
                </span>
                <button
                  onClick={() => setSwapHands(!swapHands)}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold"
                  title="Flip Left/Right hand sides if your camera is inverted"
                >
                  Swap L/R
                </button>
                <button onClick={() => setShowCam(!showCam)} className="text-[10px] text-slate-400 hover:text-slate-200">
                  {showCam ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {showCam && (
              <div
                className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-inner"
                style={{ aspectRatio: '4/3' }}
              >
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  mirrored={true}
                  width={320}
                  height={240}
                  videoConstraints={{ facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } }}
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                <canvas
                  ref={hudCanvasRef}
                  width={320}
                  height={240}
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                />
                <div className="absolute bottom-1.5 left-2 right-2 z-20 bg-slate-900/85 rounded-lg px-2.5 py-1 text-[10px] flex justify-between border border-slate-700/50">
                  <span className="text-cyan-300 font-bold">
                    {swapHands ? '👈 Left Side: Pinch & Turn' : '👈 Left Side: Orbit Cube'}
                  </span>
                  <span className="text-amber-300 font-bold">
                    {swapHands ? 'Right Side: Orbit Cube 👉' : 'Right Side: Pinch & Turn 👉'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Step-by-Step Mini Guide */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/60 text-[11px] space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold">
              <span>1.</span>
              <span><strong>Left Hand:</strong> Move smoothly to revolve the whole cube.</span>
            </div>
            <div className="flex items-center gap-2 text-sky-300 font-semibold">
              <span>2.</span>
              <span><strong>Right Hand (Open):</strong> Hover over a zone to choose which side to turn.</span>
            </div>
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <span>3.</span>
              <span><strong>Pinch &amp; Swipe:</strong> Pinch thumb + index to LOCK side, then swipe ← → ↑ ↓!</span>
            </div>
          </div>

          {/* Cognitive Feedback */}
          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-900/60 text-xs">
            <div className="flex items-center justify-between font-bold text-indigo-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Therapy Guide
              </span>
              <span className="text-[10px] text-slate-400">
                Scramble: {scrambleDepth} | Moves: {moveCount}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">{feedback}</p>
          </div>

          {/* Backup Click Buttons */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] text-slate-400 font-semibold">
              <span>Manual Layer Buttons (Optional)</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { l: "U'", n: 'Top →' },  { l: 'U',  n: 'Top ←' },
                { l: 'D',  n: 'Bot →' },  { l: "D'", n: 'Bot ←' },
                { l: 'R',  n: 'Right ↑' },{ l: "R'", n: 'Right ↓' },
                { l: "L'", n: 'Left ↑' }, { l: 'L',  n: 'Left ↓' },
                { l: 'F',  n: 'Front ↻' },{ l: "F'", n: 'Front ↺' },
                { l: "B'", n: 'Back ↻' }, { l: 'B',  n: 'Back ↺' },
              ].map((btn) => (
                <button
                  key={btn.l}
                  onClick={() => executeNotationMove(btn.l)}
                  className="py-1.5 px-1 rounded-xl text-[11px] font-bold bg-slate-700/60 hover:bg-slate-700 text-slate-200 border border-slate-600/60 transition-all"
                >
                  {btn.n}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={() => startPuzzle(null)}
              className="flex-1 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-600/60"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reshuffle
            </button>
            <button
              onClick={giveHint}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <Lightbulb className="w-3.5 h-3.5" /> Hint
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default GestureRubiksCube;
