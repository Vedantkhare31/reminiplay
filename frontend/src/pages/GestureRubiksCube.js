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
  ChevronRight, Hand, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ============================================================
// AUDIO
// ============================================================
function playTone(freq, dur, type = 'sine', delay = 0) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    setTimeout(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur / 1000);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + dur / 1000);
    }, delay);
  } catch (e) {}
}
const playTurnSound    = () => { playTone(340,70); playTone(460,80,  'sine',35); };
const playSuccessSound = () => { playTone(523,120); playTone(659,120,'sine',90); playTone(784,150,'sine',180); playTone(1046,300,'sine',270); };
const playHintSound    = () => { playTone(660,100); playTone(880,140,'sine',80); };

// ============================================================
// CUBE COLORS
// ============================================================
const CUBE_COLORS = {
  RIGHT: 0xb71234, LEFT: 0xff5800, UP: 0xffffff,
  DOWN: 0xffd500, FRONT: 0x009b48, BACK: 0x0046ad,
  INSIDE: 0x18181b,
};

// Hand skeleton connections
const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17],
];

// ============================================================
// EMA SMOOTHING (velocity-adaptive)
// ============================================================
class Smoother {
  constructor(alpha = 0.5) { this.a = alpha; this.x = null; this.y = null; }
  filter(x, y) {
    if (this.x === null) { this.x = x; this.y = y; return { x, y }; }
    const speed = Math.abs(x - this.x) + Math.abs(y - this.y);
    const a = speed > 20 ? Math.min(this.a + 0.3, 0.92) : this.a;
    this.x += (x - this.x) * a;
    this.y += (y - this.y) * a;
    return { x: this.x, y: this.y };
  }
  reset() { this.x = null; this.y = null; }
}

// ============================================================
// HOW TO PLAY MODAL
// ============================================================
function HowToPlayModal({ onClose }) {
  const steps = [
    { icon: '✋', color: 'text-cyan-400', title: 'Left Hand — Spin the Cube', desc: 'Hold your LEFT hand in view and move it left/right or up/down to rotate the entire cube so you can see all sides.' },
    { icon: '👋', color: 'text-emerald-400', title: 'Right Hand — Choose a Layer', desc: 'Move your RIGHT hand into one of the 6 colored zones shown on the camera preview. Each zone targets a cube layer (Top, Bottom, Left, Right, Front, Back).' },
    { icon: '⬅️➡️', color: 'text-amber-400', title: 'Swipe to Rotate a Layer', desc: 'Once a layer is highlighted (it glows blue), quickly SWIPE your right hand LEFT or RIGHT to rotate that layer clockwise or counter-clockwise.' },
    { icon: '⬆️⬇️', color: 'text-rose-400', title: 'Swipe Up/Down too!', desc: 'You can also swipe UP or DOWN to rotate side layers (Left/Right faces) in the vertical direction.' },
    { icon: '🧩', color: 'text-indigo-400', title: 'Goal: Make all sides one colour!', desc: 'Match all 9 squares on every face to the same colour. Take your time — there is no time limit and you can always ask for a Hint!' },
  ];
  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-xl">🎮</div>
          <div>
            <h2 className="text-lg font-black text-white">How to Play</h2>
            <p className="text-xs text-slate-400">Gesture Rubik's Cube</p>
          </div>
        </div>
        <div className="space-y-4 mb-6">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="text-2xl mt-0.5 w-8 flex-shrink-0 text-center">{s.icon}</div>
              <div>
                <p className={`text-sm font-bold ${s.color}`}>{s.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2"
        >
          <span>Let's Play!</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// GESTURE ZONE OVERLAY (6 zones mapped to 6 faces)
// ============================================================
//  Camera preview is 320×240 (or scaled). 
//  We divide the right-hand's position into 6 zones:
//   Top-Left=U, Top-Right=U, Middle-Left=L, Middle-Right=R, Bottom-Left=D, Bottom-Right=D
//  Actually we use 3 rows × 2 cols:
//   Top row (y<0.33): U (Top)
//   Mid row (y 0.33-0.67): Left side → L, Right side → R
//   Bot row (y>0.67): D (Bottom)
//  Plus: x<0.2 → B (Back), x>0.8 → F (Front)  [far edges]
function getLayerFromZone(nx, ny) {
  // nx, ny are 0..1 normalised (0,0)=top-left
  if (ny < 0.28) return { axis: 'y', layerIndex: 1,  name: 'U – Top',    move: { cw: 'U',  ccw: "U'" } };
  if (ny > 0.72) return { axis: 'y', layerIndex: -1, name: 'D – Bottom', move: { cw: 'D',  ccw: "D'" } };
  if (nx < 0.38) return { axis: 'x', layerIndex: -1, name: 'L – Left',   move: { cw: 'L',  ccw: "L'" } };
  if (nx > 0.62) return { axis: 'x', layerIndex: 1,  name: 'R – Right',  move: { cw: 'R',  ccw: "R'" } };
  // Centre → front face
  return { axis: 'z', layerIndex: 1, name: 'F – Front', move: { cw: 'F', ccw: "F'" } };
}

// ============================================================
// MAIN COMPONENT
// ============================================================
const GestureRubiksCube = () => {
  const navigate = useNavigate();
  const { user, syncProgress } = useAuth();

  // ── DOM refs ──────────────────────────────────────────────
  const mountRef        = useRef(null);
  const webcamRef       = useRef(null);
  const canvasRef       = useRef(null);
  const confettiCanvasRef = useRef(null);
  const confettiAnimRef = useRef(null);

  // ── Three.js refs ─────────────────────────────────────────
  const sceneRef       = useRef(null);
  const cameraRef      = useRef(null);
  const rendererRef    = useRef(null);
  const cubeGroupRef   = useRef(null);
  const cubiesRef      = useRef([]);
  const isAnimRef      = useRef(false);
  const moveQueueRef   = useRef([]);

  // ── Target rotation for 60 FPS lerp ──────────────────────
  const targetRotRef   = useRef({ x: 0.4, y: 0.6 });

  // ── Mouse fallback ────────────────────────────────────────
  const isDraggingRef  = useRef(false);
  const prevMouseRef   = useRef({ x: 0, y: 0 });

  // ── Gesture state refs (no React re-renders in loop) ──────
  const detectorRef    = useRef(null);
  const ctxRef         = useRef(null);
  const leftSmoother   = useRef(new Smoother(0.45));
  const rightSmoother  = useRef(new Smoother(0.55));
  const prevLeftRef    = useRef(null);
  const swipeStartRef  = useRef(null);
  const swipeLockRef   = useRef(false);
  const lastMoveRef    = useRef(0);
  const lastCountRef   = useRef(0);
  const currentZoneRef = useRef(null);
  const executeMoveRef = useRef(null);
  const highlightRef   = useRef(null);
  const stageSolvedRef = useRef(false);

  // ── UI state ──────────────────────────────────────────────
  const [level, setLevel]           = useState(user?.gameStats?.rubiksCubeLevel || 1);
  const [coins, setCoins]           = useState(user?.coins ?? 100);
  const [totalSolved, setTotalSolved] = useState(0);
  const [stageSolved, setStageSolved] = useState(false);
  const [moveCount, setMoveCount]   = useState(0);
  const [isSoundOn, setIsSoundOn]   = useState(true);
  const [detectorReady, setDetectorReady] = useState(false);
  const [handCount, setHandCount]   = useState(0);
  const [showCam, setShowCam]       = useState(true);
  const [activeZone, setActiveZone] = useState(null);
  const [hintMove, setHintMove]     = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [scrambleDepth, setScrambleDepth] = useState(1);
  const [stageStartTime, setStageStartTime] = useState(Date.now());
  const [feedback, setFeedback]     = useState('Welcome! Use your hands to solve the cube. Take your time!');
  const [patientStats, setPatientStats] = useState({ avgSolveTime: 0, rating: 'Great' });
  const [showHowTo, setShowHowTo]   = useState(true);
  const [swipeDir, setSwipeDir]     = useState(null); // visual swipe indicator

  const scrambleHistRef = useRef([]);

  // ─────────────────────────────────────────────────────────
  // 1. THREE.JS CUBE
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const w = container.clientWidth || 600;
    const h = container.clientHeight || 500;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(5.5, 4.5, 6.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dl1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dl1.position.set(8, 14, 10); dl1.castShadow = true;
    scene.add(dl1);
    const dl2 = new THREE.DirectionalLight(0x93c5fd, 0.4);
    dl2.position.set(-8, -6, -8);
    scene.add(dl2);

    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    cubeGroupRef.current = cubeGroup;

    const cubies = [];
    const geo = new THREE.BoxGeometry(0.93, 0.93, 0.93);

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;
          const mats = [
            new THREE.MeshStandardMaterial({ color: x ===  1 ? CUBE_COLORS.RIGHT  : CUBE_COLORS.INSIDE, roughness: 0.1, metalness: 0.05, emissive: new THREE.Color(0) }),
            new THREE.MeshStandardMaterial({ color: x === -1 ? CUBE_COLORS.LEFT   : CUBE_COLORS.INSIDE, roughness: 0.1, metalness: 0.05, emissive: new THREE.Color(0) }),
            new THREE.MeshStandardMaterial({ color: y ===  1 ? CUBE_COLORS.UP     : CUBE_COLORS.INSIDE, roughness: 0.1, metalness: 0.05, emissive: new THREE.Color(0) }),
            new THREE.MeshStandardMaterial({ color: y === -1 ? CUBE_COLORS.DOWN   : CUBE_COLORS.INSIDE, roughness: 0.1, metalness: 0.05, emissive: new THREE.Color(0) }),
            new THREE.MeshStandardMaterial({ color: z ===  1 ? CUBE_COLORS.FRONT  : CUBE_COLORS.INSIDE, roughness: 0.1, metalness: 0.05, emissive: new THREE.Color(0) }),
            new THREE.MeshStandardMaterial({ color: z === -1 ? CUBE_COLORS.BACK   : CUBE_COLORS.INSIDE, roughness: 0.1, metalness: 0.05, emissive: new THREE.Color(0) }),
          ];
          const mesh = new THREE.Mesh(geo, mats);
          mesh.position.set(x, y, z);
          mesh.castShadow = true;
          cubeGroup.add(mesh);
          cubies.push(mesh);
        }
      }
    }
    cubiesRef.current = cubies;

    // 60 FPS render + lerp
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const tr = targetRotRef.current;
      cubeGroup.rotation.y += (tr.y - cubeGroup.rotation.y) * 0.2;
      cubeGroup.rotation.x += (tr.x - cubeGroup.rotation.x) * 0.2;
      cubeGroup.position.y = Math.sin(Date.now() / 1500) * 0.04;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container || !renderer) return;
      const nw = container.clientWidth; const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      renderer.dispose(); geo.dispose();
      cubies.forEach(c => { if (Array.isArray(c.material)) c.material.forEach(m => m.dispose()); });
    };
  }, []);

  // ─────────────────────────────────────────────────────────
  // 2. LAYER ROTATION ENGINE
  // ─────────────────────────────────────────────────────────
  const rotateLayer = useCallback((axis, layerIndex, angle, dur = 200) => {
    return new Promise(resolve => {
      if (isAnimRef.current) {
        moveQueueRef.current.push({ axis, layerIndex, angle, dur, resolve });
        return;
      }
      isAnimRef.current = true;
      const cg = cubeGroupRef.current;
      const cubies = cubiesRef.current;
      if (!cg || !cubies) { isAnimRef.current = false; resolve(); return; }

      const active = cubies.filter(m => {
        const v = axis === 'x' ? m.position.x : axis === 'y' ? m.position.y : m.position.z;
        return Math.abs(v - layerIndex) < 0.3;
      });

      const pivot = new THREE.Group();
      cg.add(pivot);
      active.forEach(c => pivot.attach(c));
      if (isSoundOn) playTurnSound();

      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        if (axis === 'x') pivot.rotation.x = angle * e;
        else if (axis === 'y') pivot.rotation.y = angle * e;
        else pivot.rotation.z = angle * e;

        if (p < 1) { requestAnimationFrame(step); return; }

        if (axis === 'x') pivot.rotation.x = angle;
        else if (axis === 'y') pivot.rotation.y = angle;
        else pivot.rotation.z = angle;
        pivot.updateMatrixWorld();

        active.forEach(c => {
          cg.attach(c);
          c.position.x = Math.round(c.position.x);
          c.position.y = Math.round(c.position.y);
          c.position.z = Math.round(c.position.z);
        });
        cg.remove(pivot);
        isAnimRef.current = false;
        resolve();

        const nxt = moveQueueRef.current.shift();
        if (nxt) rotateLayer(nxt.axis, nxt.layerIndex, nxt.angle, nxt.dur).then(nxt.resolve);
      };
      requestAnimationFrame(step);
    });
  }, [isSoundOn]);

  const executeMove = useCallback(async (notation, isUser = true) => {
    if (stageSolvedRef.current && isUser) return;
    const MAP = {
      'U':  { axis:'y', layer:1,  angle:-Math.PI/2 },
      "U'": { axis:'y', layer:1,  angle: Math.PI/2 },
      'D':  { axis:'y', layer:-1, angle: Math.PI/2 },
      "D'": { axis:'y', layer:-1, angle:-Math.PI/2 },
      'R':  { axis:'x', layer:1,  angle:-Math.PI/2 },
      "R'": { axis:'x', layer:1,  angle: Math.PI/2 },
      'L':  { axis:'x', layer:-1, angle: Math.PI/2 },
      "L'": { axis:'x', layer:-1, angle:-Math.PI/2 },
      'F':  { axis:'z', layer:1,  angle:-Math.PI/2 },
      "F'": { axis:'z', layer:1,  angle: Math.PI/2 },
      'B':  { axis:'z', layer:-1, angle: Math.PI/2 },
      "B'": { axis:'z', layer:-1, angle:-Math.PI/2 },
    };
    const m = MAP[notation]; if (!m) return;
    await rotateLayer(m.axis, m.layer, m.angle, 190);
    if (isUser) { setMoveCount(p => p + 1); checkSolved(); }
  }, [rotateLayer]);

  // ─────────────────────────────────────────────────────────
  // 3. HIGHLIGHT LAYER
  // ─────────────────────────────────────────────────────────
  const highlightLayer = useCallback((layerInfo) => {
    const cubies = cubiesRef.current;
    if (!cubies) return;
    cubies.forEach(m => {
      let match = false;
      if (layerInfo) {
        const v = layerInfo.axis === 'x' ? m.position.x : layerInfo.axis === 'y' ? m.position.y : m.position.z;
        match = Math.abs(v - layerInfo.layerIndex) < 0.3;
      }
      m.material.forEach(mat => {
        if (mat.color.getHex() !== CUBE_COLORS.INSIDE) {
          mat.emissive.setHex(match ? 0x38bdf8 : 0x000000);
          mat.emissiveIntensity = match ? 0.4 : 0;
        }
      });
    });
  }, []);

  // ─────────────────────────────────────────────────────────
  // 4. CHECK SOLVE
  // ─────────────────────────────────────────────────────────
  const checkSolved = useCallback(() => {
    const cubies = cubiesRef.current;
    if (!cubies?.length) return false;
    const faceNormals = [
      new THREE.Vector3(1,0,0), new THREE.Vector3(-1,0,0),
      new THREE.Vector3(0,1,0), new THREE.Vector3(0,-1,0),
      new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-1),
    ];
    const localNormals = [
      new THREE.Vector3(1,0,0), new THREE.Vector3(-1,0,0),
      new THREE.Vector3(0,1,0), new THREE.Vector3(0,-1,0),
      new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-1),
    ];
    for (const fn of faceNormals) {
      const side = cubies.filter(m => {
        if (fn.x) return Math.abs(m.position.x - fn.x) < 0.3;
        if (fn.y) return Math.abs(m.position.y - fn.y) < 0.3;
        return Math.abs(m.position.z - fn.z) < 0.3;
      });
      if (side.length !== 9) continue;
      const colors = side.map(m => {
        let best = -Infinity, col = null;
        localNormals.forEach((ln, i) => {
          const wn = ln.clone().applyQuaternion(m.quaternion);
          const d = wn.dot(fn);
          if (d > best) { best = d; col = m.material[i].color.getHex(); }
        });
        return col;
      });
      if (!colors.every(c => c === colors[0])) return false;
    }
    handleVictory();
    return true;
  }, []);

  // ─────────────────────────────────────────────────────────
  // 5. CONFETTI
  // ─────────────────────────────────────────────────────────
  const triggerConfetti = useCallback(() => {
    const canvas = confettiCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth || window.innerWidth;
    canvas.height = canvas.clientHeight || window.innerHeight;
    const cols = ['#6366f1','#10b981','#f59e0b','#ec4899','#3b82f6'];
    const pts = Array.from({length:60}, () => ({
      x: canvas.width/2+(Math.random()-.5)*80, y: canvas.height/2+(Math.random()-.5)*80,
      vx:(Math.random()-.5)*11, vy:(Math.random()-1.2)*11,
      sz:Math.random()*5+4, col:cols[Math.floor(Math.random()*cols.length)], life:1,
    }));
    if (confettiAnimRef.current) cancelAnimationFrame(confettiAnimRef.current);
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      let alive=false;
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy; p.vy+=0.26; p.life-=0.016;
        if (p.life>0) { alive=true; ctx.globalAlpha=p.life; ctx.fillStyle=p.col; ctx.fillRect(p.x,p.y,p.sz,p.sz); }
      });
      ctx.globalAlpha=1;
      if (alive) confettiAnimRef.current=requestAnimationFrame(draw);
    };
    draw();
  }, []);

  // ─────────────────────────────────────────────────────────
  // 6. VICTORY
  // ─────────────────────────────────────────────────────────
  const handleVictory = useCallback(() => {
    setStageSolved(true); stageSolvedRef.current = true;
    if (isSoundOn) playSuccessSound();
    triggerConfetti();
    highlightLayer(null);

    const timeSpent = Math.round((Date.now() - stageStartTime) / 1000);
    const newTotal = totalSolved + 1;
    setTotalSolved(newTotal);

    let rating='Steady'; let msg='Brilliant!'; let nextD = scrambleDepth;
    if (timeSpent < 20)      { rating='Quick Reflexes'; msg='Fantastic speed!'; nextD=Math.min(scrambleDepth+1,8); }
    else if (timeSpent <= 60){ rating='Good Pace'; msg='Great patience and focus!'; if(newTotal%2===0)nextD=Math.min(scrambleDepth+1,8); }
    else                      { rating='Thoughtful'; msg='Wonderful effort — keeping it comfortable.'; }

    setFeedback(msg);
    setPatientStats({ avgSolveTime: Math.round(((patientStats.avgSolveTime*(newTotal-1))+timeSpent)/newTotal), rating });

    const pts = 50 + Math.max(10, 40 - Math.floor(timeSpent/2));
    const newCoins = coins + pts;
    const newLevel = level + (nextD > scrambleDepth ? 1 : 0);
    setCoins(newCoins); setLevel(newLevel);

    if (syncProgress) syncProgress({
      coins: newCoins, score: (user?.score||0)+pts,
      gameStats: { rubiksCubeLevel: newLevel, rubikSolved: newTotal, lastPerformance: rating },
    });
  }, [coins, level, scrambleDepth, stageStartTime, totalSolved, user, isSoundOn, syncProgress, triggerConfetti, patientStats.avgSolveTime, highlightLayer]);

  // ─────────────────────────────────────────────────────────
  // 7. SCRAMBLE
  // ─────────────────────────────────────────────────────────
  const startPuzzle = useCallback(async (depth = null) => {
    setStageSolved(false); stageSolvedRef.current = false;
    setMoveCount(0); setHintMove(null); setActiveZone(null);
    setStageStartTime(Date.now()); highlightLayer(null);
    const d = depth !== null ? depth : scrambleDepth;
    setScrambleDepth(d);
    const pool = ['U',"U'",'D',"D'",'R',"R'",'L',"L'",'F',"F'"];
    const hist = [];
    for (let i = 0; i < d; i++) {
      const mv = pool[Math.floor(Math.random()*pool.length)];
      hist.push(mv);
      await executeMove(mv, false);
      await new Promise(r => setTimeout(r, 80));
    }
    scrambleHistRef.current = hist;
    setFeedback(d===1 ? 'Stage 1: Just 1 move to solve — you can do it!' : `Scrambled with ${d} moves. Take your time!`);
  }, [executeMove, scrambleDepth, highlightLayer]);

  useEffect(() => {
    const t = setTimeout(() => startPuzzle(1), 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stageSolved) return;
    const iv = setInterval(() => setElapsedTime(Math.round((Date.now()-stageStartTime)/1000)), 1000);
    return () => clearInterval(iv);
  }, [stageStartTime, stageSolved]);

  const giveHint = () => {
    if (stageSolved) return;
    if (isSoundOn) playHintSound();
    const inv = {'U':"U'","U'":'U','D':"D'","D'":'D','R':"R'","R'":'R','L':"L'","L'":'L','F':"F'","F'":'F','B':"B'","B'":'B'};
    if (scrambleHistRef.current.length > 0) {
      const last = scrambleHistRef.current[scrambleHistRef.current.length-1];
      const r = inv[last]||'U';
      setHintMove(r); setFeedback(`Gentle hint: Try move "${r}"`);
    }
  };

  // ─────────────────────────────────────────────────────────
  // 8. UPDATE CALLBACK REFS (no loop restarts)
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    executeMoveRef.current = executeMove;
    highlightRef.current   = highlightLayer;
    stageSolvedRef.current = stageSolved;
  });

  // ─────────────────────────────────────────────────────────
  // 9. DETECTOR INIT
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let det = null;
      try {
        det = await handPoseDetection.createDetector(
          handPoseDetection.SupportedModels.MediaPipeHands,
          { runtime:'mediapipe', solutionPath:'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240', modelType:'lite', maxHands:2 }
        );
      } catch {
        try { await tf.ready(); det = await handPoseDetection.createDetector(handPoseDetection.SupportedModels.MediaPipeHands,{runtime:'tfjs',modelType:'lite',maxHands:2}); }
        catch { try { await tf.setBackend('cpu'); await tf.ready(); det = await handPoseDetection.createDetector(handPoseDetection.SupportedModels.MediaPipeHands,{runtime:'tfjs',modelType:'lite',maxHands:2}); } catch {} }
      }
      if (!cancelled && det) { detectorRef.current = det; setDetectorReady(true); }
    })();
    return () => { cancelled = true; };
  }, []);

  // ─────────────────────────────────────────────────────────
  // 10. GESTURE ENGINE — 320×240 paced at ~20 FPS
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    let tid   = null;

    // Normalise keypoint from MediaPipe (0..1) or pixel coords to 0..1
    const norm = (kp, vw, vh) => {
      if (!kp) return { x:0.5, y:0.5 };
      const isN = Math.abs(kp.x) <= 1.1 && Math.abs(kp.y) <= 1.1;
      return { x: isN ? kp.x : kp.x/vw, y: isN ? kp.y : kp.y/vh };
    };

    // Draw minimal skeleton on canvas (batched)
    const drawSkeleton = (ctx, pts, color, W, H) => {
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      HAND_CONNECTIONS.forEach(([a,b]) => {
        const p1=pts[a], p2=pts[b];
        if(p1&&p2){ ctx.moveTo(p1.x*W,p1.y*H); ctx.lineTo(p2.x*W,p2.y*H); }
      });
      ctx.stroke();
      // key joints
      ctx.beginPath(); ctx.fillStyle = color;
      [0,4,8].forEach(i => { const p=pts[i]; if(p){ ctx.moveTo(p.x*W+5,p.y*H); ctx.arc(p.x*W,p.y*H,5,0,Math.PI*2); } });
      ctx.fill();
      ctx.beginPath(); ctx.fillStyle='#fff';
      [4,8].forEach(i => { const p=pts[i]; if(p){ ctx.moveTo(p.x*W+3,p.y*H); ctx.arc(p.x*W,p.y*H,3,0,Math.PI*2); } });
      ctx.fill();
    };

    // Draw zone guide on the canvas
    const drawZoneGuide = (ctx, W, H, activeZoneName) => {
      const zones = [
        { label:'U – Top',    x:0,    y:0,    w:1,    h:0.28, color:'rgba(99,102,241,0.18)' },
        { label:'L – Left',   x:0,    y:0.28, w:0.38, h:0.44, color:'rgba(16,185,129,0.18)' },
        { label:'F – Front',  x:0.38, y:0.28, w:0.24, h:0.44, color:'rgba(245,158,11,0.18)' },
        { label:'R – Right',  x:0.62, y:0.28, w:0.38, h:0.44, color:'rgba(239,68,68,0.18)' },
        { label:'D – Bottom', x:0,    y:0.72, w:1,    h:0.28, color:'rgba(139,92,246,0.18)' },
      ];
      zones.forEach(z => {
        const isActive = activeZoneName && z.label === activeZoneName;
        ctx.fillStyle = isActive ? z.color.replace('0.18','0.45') : z.color;
        ctx.fillRect(z.x*W, z.y*H, z.w*W, z.h*H);
        ctx.strokeStyle = isActive ? '#38bdf8' : 'rgba(255,255,255,0.12)';
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.strokeRect(z.x*W, z.y*H, z.w*W, z.h*H);
        ctx.fillStyle = isActive ? '#38bdf8' : 'rgba(255,255,255,0.5)';
        ctx.font = `bold ${Math.round(H*0.045)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(z.label, (z.x+z.w/2)*W, (z.y+z.h/2)*H+5);
      });
      ctx.textAlign = 'left';
    };

    const detect = async () => {
      if (!alive) return;
      const t0 = performance.now();

      const video    = webcamRef.current?.video;
      const detector = detectorRef.current;
      const canvas   = canvasRef.current;

      if (!detector || !video || video.readyState < 2 || !video.videoWidth || !canvas) {
        tid = setTimeout(detect, 100);
        return;
      }

      // Canvas size = 320×240 for speed
      const W = 320, H = 240;
      if (canvas.width !== W) canvas.width = W;
      if (canvas.height !== H) canvas.height = H;

      let ctx2 = ctxRef.current;
      if (!ctx2) { ctx2 = canvas.getContext('2d', {alpha:true}); ctxRef.current = ctx2; }

      try {
        const hands = await detector.estimateHands(video, { flipHorizontal: true });
        if (!alive) return;

        ctx2.clearRect(0, 0, W, H);
        const now = performance.now();
        const vw = video.videoWidth || 640;
        const vh = video.videoHeight || 480;
        const count = hands?.length || 0;

        // Throttle React state for hand count
        if (now - lastCountRef.current > 400) { lastCountRef.current = now; setHandCount(count); }

        // Identify LEFT vs RIGHT hand
        let leftHand  = null;
        let rightHand = null;
        if (count === 1) {
          // Use handedness label if available, else use x position
          const h = hands[0];
          const hl = h.handedness?.toLowerCase?.();
          // In mirrored video left→right hand
          if (hl === 'left' || hl === 'right') {
            // MediaPipe: 'Left' in original = patient's right after mirror flip
            if (hl === 'right') leftHand = h; else rightHand = h;
          } else {
            // Fallback: wrist x < 0.5 → left side of mirrored image → patient's right
            const wx = norm(h.keypoints[0], vw, vh).x;
            if (wx < 0.5) rightHand = h; else leftHand = h;
          }
        } else if (count >= 2) {
          hands.forEach(h => {
            const hl = h.handedness?.toLowerCase?.();
            if (hl === 'right') leftHand  = h;
            else if (hl === 'left') rightHand = h;
          });
          // Fallback if handedness missing
          if (!leftHand && !rightHand) {
            const sorted = [...hands].sort((a,b)=> norm(a.keypoints[0],vw,vh).x - norm(b.keypoints[0],vw,vh).x);
            rightHand = sorted[0]; leftHand = sorted[1];
          }
        }

        // ── LEFT HAND = Orbit Cube ────────────────────────
        if (leftHand) {
          const kps = leftHand.keypoints.map(k => norm(k, vw, vh));
          drawSkeleton(ctx2, kps, '#06b6d4', W, H);
          const palm = kps[9];
          const sm = leftSmoother.current.filter(palm.x, palm.y);
          if (prevLeftRef.current && !isAnimRef.current) {
            const dx = (sm.x - prevLeftRef.current.x) * W;
            const dy = (sm.y - prevLeftRef.current.y) * H;
            const DEAD = 1.5; // px dead-zone to ignore tiny jitter
            if (Math.abs(dx) > DEAD) targetRotRef.current.y += dx * 0.018;
            if (Math.abs(dy) > DEAD) targetRotRef.current.x += dy * 0.018;
          }
          prevLeftRef.current = { x: sm.x, y: sm.y };
          // Label
          ctx2.fillStyle='rgba(6,182,212,0.85)'; ctx2.font=`bold ${Math.round(H*0.048)}px sans-serif`;
          ctx2.fillText('◀ ORBIT', Math.round(kps[0].x*W)+8, Math.round(kps[0].y*H)-8);
        } else {
          leftSmoother.current.reset();
          prevLeftRef.current = null;
        }

        // ── RIGHT HAND = Zone + Swipe ─────────────────────
        if (rightHand) {
          const kps = rightHand.keypoints.map(k => norm(k, vw, vh));
          const indexTip = kps[8];
          const sm = rightSmoother.current.filter(indexTip.x, indexTip.y);

          // Determine zone from smoothed index tip
          const zone = getLayerFromZone(sm.x, sm.y);

          // Update zone display + highlight
          if (!currentZoneRef.current || currentZoneRef.current.name !== zone.name) {
            currentZoneRef.current = zone;
            setActiveZone(zone.name);
            if (highlightRef.current) highlightRef.current(zone);
          }

          // Draw zone guide
          drawZoneGuide(ctx2, W, H, zone.name);
          drawSkeleton(ctx2, kps, '#10b981', W, H);

          // Swipe detection
          const ct = Date.now();
          if (!swipeStartRef.current) {
            swipeStartRef.current = { x: sm.x, y: sm.y, t: ct };
            swipeLockRef.current = false;
          } else if (!swipeLockRef.current && ct - lastMoveRef.current > 500 && !isAnimRef.current && !stageSolvedRef.current) {
            const dragX = (sm.x - swipeStartRef.current.x) * W;
            const dragY = (sm.y - swipeStartRef.current.y) * H;
            const SWIPE = 28; // px minimum swipe
            const move = zone.move;

            if (Math.abs(dragX) > SWIPE && Math.abs(dragX) > Math.abs(dragY)) {
              swipeLockRef.current = true;
              lastMoveRef.current = ct;
              swipeStartRef.current = null;
              const notation = dragX < 0 ? move.cw : move.ccw;
              setSwipeDir(dragX < 0 ? '← CW' : '→ CCW');
              setTimeout(() => setSwipeDir(null), 800);
              if (executeMoveRef.current) executeMoveRef.current(notation);
            } else if (Math.abs(dragY) > SWIPE && Math.abs(dragY) > Math.abs(dragX)) {
              swipeLockRef.current = true;
              lastMoveRef.current = ct;
              swipeStartRef.current = null;
              const notation = dragY < 0 ? move.cw : move.ccw;
              setSwipeDir(dragY < 0 ? '↑ CW' : '↓ CCW');
              setTimeout(() => setSwipeDir(null), 800);
              if (executeMoveRef.current) executeMoveRef.current(notation);
            }
          }

          // Reset swipe start if hand stayed still for > 600ms
          if (swipeStartRef.current && ct - swipeStartRef.current.t > 600) {
            swipeStartRef.current = { x: sm.x, y: sm.y, t: ct };
          }

          ctx2.fillStyle='rgba(16,185,129,0.85)'; ctx2.font=`bold ${Math.round(H*0.048)}px sans-serif`;
          ctx2.textAlign='right';
          ctx2.fillText('TURN ▶', Math.round(kps[0].x*W)-8, Math.round(kps[0].y*H)-8);
          ctx2.textAlign='left';
        } else {
          rightSmoother.current.reset();
          swipeStartRef.current = null;
          swipeLockRef.current  = false;
          currentZoneRef.current = null;
          setActiveZone(null);
          if (highlightRef.current) highlightRef.current(null);
          // Draw zone guide even without hand (greyed out)
          drawZoneGuide(ctx2, W, H, null);
        }

        if (!leftHand && !rightHand) {
          drawZoneGuide(ctx2, W, H, null);
        }
      } catch {
        /* continue */
      }

      const elapsed = performance.now() - t0;
      // Target ~20 FPS (50ms) — leaves plenty of CPU for Three.js 60 FPS
      const delay = Math.max(10, 50 - elapsed);
      if (alive) tid = setTimeout(detect, delay);
    };

    detect();
    return () => { alive = false; if (tid) clearTimeout(tid); };
  }, []); // stable deps — uses refs throughout

  // ─────────────────────────────────────────────────────────
  // MOUSE ORBIT FALLBACK
  // ─────────────────────────────────────────────────────────
  const onMouseDown = e => { isDraggingRef.current=true; prevMouseRef.current={x:e.clientX,y:e.clientY}; };
  const onMouseMove = e => {
    if (!isDraggingRef.current) return;
    const dx=e.clientX-prevMouseRef.current.x; const dy=e.clientY-prevMouseRef.current.y;
    targetRotRef.current.y += dx*0.008; targetRotRef.current.x += dy*0.008;
    prevMouseRef.current={x:e.clientX,y:e.clientY};
  };
  const onMouseUp = () => { isDraggingRef.current=false; };
  const resetView = () => { targetRotRef.current={x:0.4,y:0.6}; };

  const fmt = s => { const m=Math.floor(s/60); return `${m}:${s%60<10?'0':''}${s%60}`; };

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col select-none relative overflow-hidden">
      {/* Confetti */}
      <canvas ref={confettiCanvasRef} className="absolute inset-0 pointer-events-none z-50 w-full h-full" />

      {/* How To Play Modal */}
      {showHowTo && <HowToPlayModal onClose={() => setShowHowTo(false)} />}

      {/* ── HEADER ── */}
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/60 px-4 py-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/games')} className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Games
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">Gesture Rubik's Cube</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Stage {level}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Left hand ← Orbit &nbsp;|&nbsp; Right hand → Select zone &amp; Swipe to turn
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Lv {level}
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> {coins}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300">
            ⏱ {fmt(elapsedTime)}
          </div>
          <button onClick={() => setShowHowTo(true)} className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300" title="How to play">
            <Hand className="w-4 h-4 text-indigo-400" />
          </button>
          <button onClick={() => setIsSoundOn(!isSoundOn)} className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300">
            {isSoundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">

        {/* 3D Cube Area */}
        <div
          ref={mountRef}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
          className="flex-1 w-full h-[55vh] lg:h-auto cursor-grab active:cursor-grabbing relative bg-gradient-to-b from-slate-900 to-slate-950"
        >
          {/* Overlay controls */}
          <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-2">
            <button onClick={resetView} className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400" /> Reset View
            </button>
            <button onClick={giveHint} className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Hint
            </button>
          </div>

          {/* Active zone + swipe indicator */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
            {activeZone && (
              <div className="px-3 py-1.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-xs font-bold text-sky-300 animate-pulse">
                🎯 {activeZone}
              </div>
            )}
            {swipeDir && (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/30 border border-emerald-500/60 text-sm font-black text-emerald-300">
                {swipeDir}
              </div>
            )}
            {hintMove && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/30 border border-amber-500/60 text-xs font-bold text-amber-300 animate-bounce">
                Hint: {hintMove}
              </div>
            )}
          </div>

          {/* Victory Overlay */}
          {stageSolved && (
            <div className="absolute inset-0 z-40 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-800 border border-slate-700 rounded-3xl p-7 max-w-sm w-full text-center shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h2 className="text-2xl font-black text-white">Stage {level} Solved!</h2>
                <p className="text-xs text-slate-400 mt-1">Completed in {fmt(elapsedTime)} with {moveCount} moves.</p>
                <div className="my-4 p-3 rounded-2xl bg-slate-900/60 border border-slate-700/60 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Performance:</span>
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

        {/* Sidebar */}
        <aside className="w-full lg:w-[22rem] bg-slate-800/90 border-t lg:border-t-0 lg:border-l border-slate-700/60 p-4 flex flex-col gap-4 z-20">

          {/* Camera + overlay canvas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-400" /> Hand Tracking
              </span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${!detectorReady ? 'bg-amber-400 animate-ping' : handCount > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span className="text-[11px] text-slate-400">{!detectorReady ? 'Loading AI…' : handCount > 0 ? `${handCount} Hand${handCount>1?'s':''} ✓` : 'No hands'}</span>
                <button onClick={() => setShowCam(!showCam)} className="text-[10px] text-slate-500 hover:text-slate-300">
                  {showCam ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {showCam && (
              <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-inner" style={{aspectRatio:'4/3'}}>
                <Webcam
                  ref={webcamRef} audio={false} mirrored={true}
                  width={320} height={240}
                  videoConstraints={{ facingMode:'user', width:320, height:240 }}
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                  onUserMedia={() => {}}
                  onUserMediaError={e => console.error('Cam error:', e)}
                />
                <canvas
                  ref={canvasRef} width={320} height={240}
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                />
                {/* Legend */}
                <div className="absolute bottom-2 left-2 right-2 z-20 bg-slate-900/80 backdrop-blur-sm rounded-lg px-2.5 py-1 text-[10px] text-slate-300 flex justify-between border border-slate-700/40">
                  <span className="text-cyan-300 font-semibold">◀ Left: Orbit</span>
                  <span className="text-emerald-300 font-semibold">Right: Turn ▶</span>
                </div>
              </div>
            )}
          </div>

          {/* Cognitive feedback */}
          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-900/60 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Cognitive Feedback
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">{feedback}</p>
            <div className="mt-2 flex justify-between text-[11px] text-slate-400 pt-1.5 border-t border-indigo-900/40">
              <span>Scramble: <strong>{scrambleDepth} move{scrambleDepth>1?'s':''}</strong></span>
              <span>Turns: <strong>{moveCount}</strong></span>
            </div>
          </div>

          {/* Quick zone guide */}
          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-700/60 text-xs space-y-2">
            <p className="font-bold text-slate-300 text-[11px]">Right Hand Zones:</p>
            <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
              {[
                {label:'U – Top',    color:'bg-indigo-500/30 text-indigo-300', span:'col-span-3'},
                {label:'L – Left',   color:'bg-emerald-500/30 text-emerald-300'},
                {label:'F – Front',  color:'bg-amber-500/30 text-amber-300'},
                {label:'R – Right',  color:'bg-red-500/30 text-red-300'},
                {label:'D – Bottom', color:'bg-purple-500/30 text-purple-300', span:'col-span-3'},
              ].map(z => (
                <div key={z.label} className={`py-1 px-1 rounded-lg font-bold ${z.color} ${z.span||''} ${activeZone===z.label?'ring-1 ring-sky-400':''}`}>
                  {z.label}
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-[10px] text-center">Move right hand into a zone, then swipe ← → ↑ ↓</p>
          </div>

          {/* Accessible move buttons */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
              <span>Button Controls (backup)</span>
              {hintMove && <span className="text-amber-400 font-bold animate-pulse">Try: {hintMove}</span>}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                {l:'U', n:'Top↻'},{l:"U'",n:'Top↺'},
                {l:'D', n:'Bot↻'},{l:"D'",n:'Bot↺'},
                {l:'R', n:'Rt↻'}, {l:"R'",n:'Rt↺'},
                {l:'L', n:'Lt↻'}, {l:"L'",n:'Lt↺'},
                {l:'F', n:'Fr↻'}, {l:"F'",n:'Fr↺'},
                {l:'B', n:'Bk↻'}, {l:"B'",n:'Bk↺'},
              ].map(btn => (
                <button
                  key={btn.l}
                  onClick={() => executeMove(btn.l)}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all border ${
                    hintMove===btn.l
                      ? 'bg-amber-500 text-slate-900 border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-lg'
                      : 'bg-slate-700/60 hover:bg-slate-700 text-slate-200 border-slate-600/60'
                  }`}
                >
                  {btn.n}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button onClick={() => startPuzzle(null)} className="flex-1 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-600/60">
              <RefreshCw className="w-3.5 h-3.5" /> Reshuffle
            </button>
            <button onClick={giveHint} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md">
              <Lightbulb className="w-3.5 h-3.5" /> Hint
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default GestureRubiksCube;
