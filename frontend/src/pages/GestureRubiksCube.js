import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import * as THREE from 'three';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import {
  ArrowLeft, Camera, Eye, EyeOff, RefreshCw,
  Trophy, Sparkles, Volume2, VolumeX,
  Play, Pause, Compass, Lightbulb, Zap, HelpCircle,
  RotateCw, RotateCcw, Award, CheckCircle2, ChevronRight,
  Hand, Move
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ============================================================
// AUDIO SOUND SYNTHESIZER
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
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    }, delay);
  } catch (e) {}
}

const playTurnSound = () => {
  playTone(340, 70, 'sine');
  playTone(460, 80, 'sine', 35);
};

const playSuccessSound = () => {
  playTone(523.25, 120, 'sine');
  playTone(659.25, 120, 'sine', 90);
  playTone(783.99, 150, 'sine', 180);
  playTone(1046.5, 300, 'sine', 270);
};

const playHintSound = () => {
  playTone(660, 100, 'sine');
  playTone(880, 140, 'sine', 80);
};

// ============================================================
// HD COLOR PALETTE (OFFICIAL VIBRANT STICKERS)
// ============================================================
const CUBE_COLORS = {
  RIGHT: 0xb71234,  // Red (+X)
  LEFT: 0xff5800,   // Orange (-X)
  UP: 0xffffff,     // White (+Y)
  DOWN: 0xffd500,   // Yellow (-Y)
  FRONT: 0x009b48,  // Green (+Z)
  BACK: 0x0046ad,   // Blue (-Z)
  INSIDE: 0x18181b, // Charcoal Matte Core
};

// Hand skeleton landmarks topology
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [5, 9], [9, 10], [10, 11], [11, 12],   // Middle
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring
  [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
  [0, 17]                               // Palm base
];

// ============================================================
// EXPONENTIAL SMOOTHING FILTER FOR JITTER-FREE TRACKING
// ============================================================
class SmoothPoint {
  constructor(smoothing = 0.6) {
    this.alpha = smoothing;
    this.x = null;
    this.y = null;
  }
  filter(x, y) {
    if (this.x === null || this.y === null) {
      this.x = x;
      this.y = y;
      return { x, y };
    }
    // Velocity-adaptive: fast moves get less smoothing (more responsive),
    // slow/still moves get more smoothing (less jitter)
    const dx = Math.abs(x - this.x);
    const dy = Math.abs(y - this.y);
    const speed = dx + dy;
    const a = speed > 15 ? Math.min(this.alpha + 0.25, 0.9) : this.alpha;
    this.x = this.x * (1 - a) + x * a;
    this.y = this.y * (1 - a) + y * a;
    return { x: this.x, y: this.y };
  }
  reset() {
    this.x = null;
    this.y = null;
  }
}


// ============================================================
// MAIN COMPONENT: GESTURE RUBIK'S CUBE
// ============================================================
const GestureRubiksCube = () => {
  const navigate = useNavigate();
  const { user, syncProgress } = useAuth();

  // DOM Canvas & Container Refs
  const mountRef = useRef(null);
  const webcamRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const confettiCanvasRef = useRef(null);
  const confettiAnimRef = useRef(null);

  // Three.js References
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const cubeGroupRef = useRef(null);
  const cubiesRef = useRef([]);
  const isAnimatingRef = useRef(false);
  const moveQueueRef = useRef([]);

  // Mouse / Touch orbit refs
  const isDraggingCubeRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  // Game States — ALWAYS START AT LEVEL 1 FOR RUBIK'S CUBE (No 4th level glitch!)
  const [level, setLevel] = useState(user?.gameStats?.rubiksCubeLevel || 1);
  const [coins, setCoins] = useState(user?.coins ?? 100);
  const [totalSolved, setTotalSolved] = useState(0);
  const [stageSolved, setStageSolved] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isDetectorReady, setIsDetectorReady] = useState(false);
  const [detectedHandCount, setDetectedHandCount] = useState(0);
  const [showWebcam, setShowWebcam] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [targetedLayer, setTargetedLayer] = useState(null);
  const [isPinching, setIsPinching] = useState(false);
  const [hintMove, setHintMove] = useState(null);
  const [stageStartTime, setStageStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [scrambleDepth, setScrambleDepth] = useState(1);
  const [cognitiveFeedback, setCognitiveFeedback] = useState('Welcome to Stage 1! Just 1 gentle turn to solve.');
  const [patientStats, setPatientStats] = useState({
    avgSolveTime: 0,
    performanceRating: 'Optimal',
  });

  // Hand gesture tracking state
  const detectorRef = useRef(null);
  const isDetectingRef = useRef(false);
  const lastDetectTimeRef = useRef(0);
  const gestureLockRef = useRef(false);
  const lastGestureTimeRef = useRef(0);
  const pinchStartPosRef = useRef(null);
  const targetedLayerRef = useRef(null);
  const isPinchingRef = useRef(false);
  const tickRef = useRef(null);
  const lastCountUpdateRef = useRef(0);

  // Smoothing filters for jitter reduction (velocity-adaptive EMA)
  const orbitHandSmoothRef = useRef(new SmoothPoint(0.55));
  const pointerHandSmoothRef = useRef(new SmoothPoint(0.65));
  const prevOrbitPosRef = useRef(null);
  const previewCtxRef = useRef(null);
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const executeMoveRef = useRef(null);
  const highlightTargetLayerRef = useRef(null);
  const stageSolvedRef = useRef(false);
  const persistentHandsRef = useRef({
    orbit: { x: 200, y: 240, lastSeen: 0 },
    pointer: { x: 440, y: 240, lastSeen: 0 },
  });

  // Scramble sequence history to compute reverse solution / hints
  const scrambleHistoryRef = useRef([]);

  // Raycaster for pointing hand
  const raycasterRef = useRef(new THREE.Raycaster());

  // ============================================================
  // 1. THREE.JS HD CUBE INITIALIZATION
  // ============================================================
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 540;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(5.5, 4.5, 6.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // High-DPI WebGL Renderer (HD Crisp, Not Blurry!)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight1.position.set(8, 14, 10);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.5);
    dirLight2.position.set(-8, -6, -8);
    scene.add(dirLight2);

    // Cube Master Group
    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    cubeGroupRef.current = cubeGroup;

    // Build 26 Rubik's Cubies
    const cubies = [];
    const cubieSize = 0.94;
    const geometry = new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize);

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;

          const materials = [
            new THREE.MeshStandardMaterial({
              color: x === 1 ? CUBE_COLORS.RIGHT : CUBE_COLORS.INSIDE,
              roughness: 0.12,
              metalness: 0.05,
              emissive: new THREE.Color(0x000000),
            }),
            new THREE.MeshStandardMaterial({
              color: x === -1 ? CUBE_COLORS.LEFT : CUBE_COLORS.INSIDE,
              roughness: 0.12,
              metalness: 0.05,
              emissive: new THREE.Color(0x000000),
            }),
            new THREE.MeshStandardMaterial({
              color: y === 1 ? CUBE_COLORS.UP : CUBE_COLORS.INSIDE,
              roughness: 0.12,
              metalness: 0.05,
              emissive: new THREE.Color(0x000000),
            }),
            new THREE.MeshStandardMaterial({
              color: y === -1 ? CUBE_COLORS.DOWN : CUBE_COLORS.INSIDE,
              roughness: 0.12,
              metalness: 0.05,
              emissive: new THREE.Color(0x000000),
            }),
            new THREE.MeshStandardMaterial({
              color: z === 1 ? CUBE_COLORS.FRONT : CUBE_COLORS.INSIDE,
              roughness: 0.12,
              metalness: 0.05,
              emissive: new THREE.Color(0x000000),
            }),
            new THREE.MeshStandardMaterial({
              color: z === -1 ? CUBE_COLORS.BACK : CUBE_COLORS.INSIDE,
              roughness: 0.12,
              metalness: 0.05,
              emissive: new THREE.Color(0x000000),
            }),
          ];

          const mesh = new THREE.Mesh(geometry, materials);
          mesh.position.set(x, y, z);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.userData = { initialX: x, initialY: y, initialZ: z };

          cubeGroup.add(mesh);
          cubies.push(mesh);
        }
      }
    }
    cubiesRef.current = cubies;

    // Render Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isDraggingCubeRef.current) {
        cubeGroup.position.y = Math.sin(Date.now() / 1400) * 0.05;
      }

      // Smooth 60 FPS damped rotation interpolation (silky smooth, zero stutter)
      if (targetRotationRef.current) {
        cubeGroup.rotation.y += (targetRotationRef.current.y - cubeGroup.rotation.y) * 0.28;
        cubeGroup.rotation.x += (targetRotationRef.current.x - cubeGroup.rotation.x) * 0.28;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      geometry.dispose();
      cubies.forEach((c) => {
        if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
      });
    };
  }, []);

  // ============================================================
  // 2. LAYER ROTATION ENGINE (SMOOTH 60 FPS)
  // ============================================================
  const rotateLayer = useCallback((axis, layerIndex, angle, duration = 200) => {
    return new Promise((resolve) => {
      if (isAnimatingRef.current) {
        moveQueueRef.current.push({ axis, layerIndex, angle, duration, resolve });
        return;
      }

      isAnimatingRef.current = true;
      const cubeGroup = cubeGroupRef.current;
      const cubies = cubiesRef.current;
      if (!cubeGroup || !cubies) {
        isAnimatingRef.current = false;
        resolve();
        return;
      }

      const activeCubies = cubies.filter((mesh) => {
        const pos = mesh.position;
        const val = axis === 'x' ? pos.x : axis === 'y' ? pos.y : pos.z;
        return Math.abs(val - layerIndex) < 0.2;
      });

      const pivot = new THREE.Group();
      cubeGroup.add(pivot);

      activeCubies.forEach((cubie) => {
        pivot.attach(cubie);
      });

      if (isSoundEnabled) playTurnSound();

      const startTime = performance.now();

      const animateStep = (time) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentAngle = angle * ease;

        if (axis === 'x') pivot.rotation.x = currentAngle;
        else if (axis === 'y') pivot.rotation.y = currentAngle;
        else pivot.rotation.z = currentAngle;

        if (progress < 1) {
          requestAnimationFrame(animateStep);
        } else {
          if (axis === 'x') pivot.rotation.x = angle;
          else if (axis === 'y') pivot.rotation.y = angle;
          else pivot.rotation.z = angle;
          pivot.updateMatrixWorld();

          activeCubies.forEach((cubie) => {
            cubeGroup.attach(cubie);
            cubie.position.x = Math.round(cubie.position.x);
            cubie.position.y = Math.round(cubie.position.y);
            cubie.position.z = Math.round(cubie.position.z);
          });

          cubeGroup.remove(pivot);
          isAnimatingRef.current = false;
          resolve();

          if (moveQueueRef.current.length > 0) {
            const next = moveQueueRef.current.shift();
            rotateLayer(next.axis, next.layerIndex, next.angle, next.duration).then(next.resolve);
          }
        }
      };

      requestAnimationFrame(animateStep);
    });
  }, [isSoundEnabled]);

  const executeMove = useCallback(async (moveNotation, isUserMove = true) => {
    if (stageSolved && isUserMove) return;

    let axis = 'y';
    let layer = 1;
    let angle = -Math.PI / 2;

    switch (moveNotation) {
      case 'U':  axis = 'y'; layer = 1;  angle = -Math.PI / 2; break;
      case "U'": axis = 'y'; layer = 1;  angle = Math.PI / 2;  break;
      case 'D':  axis = 'y'; layer = -1; angle = Math.PI / 2;   break;
      case "D'": axis = 'y'; layer = -1; angle = -Math.PI / 2;  break;
      case 'R':  axis = 'x'; layer = 1;  angle = -Math.PI / 2; break;
      case "R'": axis = 'x'; layer = 1;  angle = Math.PI / 2;  break;
      case 'L':  axis = 'x'; layer = -1; angle = Math.PI / 2;  break;
      case "L'": axis = 'x'; layer = -1; angle = -Math.PI / 2; break;
      case 'F':  axis = 'z'; layer = 1;  angle = -Math.PI / 2; break;
      case "F'": axis = 'z'; layer = 1;  angle = Math.PI / 2;  break;
      case 'B':  axis = 'z'; layer = -1; angle = Math.PI / 2;   break;
      case "B'": axis = 'z'; layer = -1; angle = -Math.PI / 2;  break;
      default: return;
    }

    await rotateLayer(axis, layer, angle, 180);

    if (isUserMove) {
      setMoveCount((prev) => prev + 1);
      checkIsCubeSolved();
    }
  }, [rotateLayer, stageSolved]);

  // ============================================================
  // 3. LAYER HOVER HIGHLIGHTING (TARGETING FEEDBACK)
  // ============================================================
  const highlightTargetLayer = useCallback((layerInfo) => {
    const cubies = cubiesRef.current;
    if (!cubies) return;

    cubies.forEach((mesh) => {
      let isMatch = false;
      if (layerInfo) {
        const val = layerInfo.axis === 'x' ? mesh.position.x : layerInfo.axis === 'y' ? mesh.position.y : mesh.position.z;
        isMatch = Math.abs(val - layerInfo.layerIndex) < 0.2;
      }

      mesh.material.forEach((mat) => {
        if (mat.color.getHex() !== CUBE_COLORS.INSIDE) {
          mat.emissive.setHex(isMatch ? 0x38bdf8 : 0x000000);
          mat.emissiveIntensity = isMatch ? 0.35 : 0;
        }
      });
    });
  }, []);

  // ============================================================
  // 4. CHECK SOLVE STATUS
  // ============================================================
  const checkIsCubeSolved = useCallback(() => {
    const cubies = cubiesRef.current;
    if (!cubies || cubies.length === 0) return false;

    const faces = [
      { normal: new THREE.Vector3(1, 0, 0) },  // +X Right
      { normal: new THREE.Vector3(-1, 0, 0) }, // -X Left
      { normal: new THREE.Vector3(0, 1, 0) },  // +Y Up
      { normal: new THREE.Vector3(0, -1, 0) }, // -Y Down
      { normal: new THREE.Vector3(0, 0, 1) },  // +Z Front
      { normal: new THREE.Vector3(0, 0, -1) }, // -Z Back
    ];

    let allFacesUniform = true;

    for (const face of faces) {
      const surfaceCubies = cubies.filter((mesh) => {
        if (face.normal.x !== 0) return Math.abs(mesh.position.x - face.normal.x) < 0.2;
        if (face.normal.y !== 0) return Math.abs(mesh.position.y - face.normal.y) < 0.2;
        if (face.normal.z !== 0) return Math.abs(mesh.position.z - face.normal.z) < 0.2;
        return false;
      });

      if (surfaceCubies.length !== 9) continue;

      const colors = surfaceCubies.map((mesh) => {
        let bestDot = -Infinity;
        let bestMatColor = null;

        const normals = [
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(-1, 0, 0),
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(0, -1, 0),
          new THREE.Vector3(0, 0, 1),
          new THREE.Vector3(0, 0, -1),
        ];

        normals.forEach((n, idx) => {
          const worldNormal = n.clone().applyQuaternion(mesh.quaternion);
          const dot = worldNormal.dot(face.normal);
          if (dot > bestDot) {
            bestDot = dot;
            bestMatColor = mesh.material[idx].color.getHex();
          }
        });

        return bestMatColor;
      });

      const firstColor = colors[0];
      const isFaceSolved = colors.every((c) => c === firstColor);
      if (!isFaceSolved) {
        allFacesUniform = false;
        break;
      }
    }

    if (allFacesUniform) {
      handleStageVictory();
      return true;
    }
    return false;
  }, []);

  const triggerConfetti = useCallback(() => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth || window.innerWidth;
    canvas.height = canvas.clientHeight || window.innerHeight;

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];
    const particles = Array.from({ length: 60 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 80,
      y: canvas.height / 2 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 11,
      vy: (Math.random() - 1.2) * 11,
      size: Math.random() * 5 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    }));

    if (confettiAnimRef.current) cancelAnimationFrame(confettiAnimRef.current);
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.26;
        p.life -= 0.016;
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

  const handleStageVictory = useCallback(() => {
    setStageSolved(true);
    if (isSoundEnabled) playSuccessSound();
    triggerConfetti();

    const timeSpent = Math.round((Date.now() - stageStartTime) / 1000);
    const newTotalSolved = totalSolved + 1;
    setTotalSolved(newTotalSolved);

    // Adaptive Cognitive Performance Analysis (Slow & Gentle Scaling)
    let speedAssessment = 'Steady & Mindful';
    let feedback = 'Brilliant pattern completion!';
    let nextDepth = scrambleDepth;

    if (timeSpent < 15) {
      speedAssessment = 'Quick Reflexes';
      feedback = 'Sharp spatial awareness! Gently adding challenge.';
      nextDepth = Math.min(scrambleDepth + 1, 7);
    } else if (timeSpent <= 45) {
      speedAssessment = 'Comfortable Pace';
      feedback = 'Terrific focus and problem-solving!';
      if (newTotalSolved % 2 === 0) nextDepth = Math.min(scrambleDepth + 1, 7);
    } else {
      speedAssessment = 'Thoughtful Exploration';
      feedback = 'Great patience! Keeping difficulty in your comfort zone.';
      nextDepth = Math.max(1, scrambleDepth);
    }

    setCognitiveFeedback(feedback);
    setPatientStats({
      avgSolveTime: Math.round(((patientStats.avgSolveTime * (newTotalSolved - 1)) + timeSpent) / newTotalSolved),
      performanceRating: speedAssessment,
    });

    const pointsEarned = 50 + Math.max(10, 40 - Math.floor(timeSpent / 2));
    const newCoins = coins + pointsEarned;
    const newLevel = level + (nextDepth > scrambleDepth ? 1 : 0);
    setCoins(newCoins);
    setLevel(newLevel);

    if (syncProgress) {
      syncProgress({
        coins: newCoins,
        score: (user?.score || 0) + pointsEarned,
        gameStats: {
          rubiksCubeLevel: newLevel,
          rubikSolved: newTotalSolved,
          lastPerformance: speedAssessment,
        },
      });
    }
  }, [coins, level, scrambleDepth, stageStartTime, totalSolved, user, isSoundEnabled, syncProgress, triggerConfetti, patientStats.avgSolveTime]);

  // ============================================================
  // 5. GENTLE SCRAMBLER (STARTS AT 1 MOVE FOR STAGE 1)
  // ============================================================
  const startNewPuzzle = useCallback(async (customDepth = null) => {
    setStageSolved(false);
    setMoveCount(0);
    setHintMove(null);
    setTargetedLayer(null);
    highlightTargetLayer(null);
    setStageStartTime(Date.now());

    const depth = customDepth !== null ? customDepth : scrambleDepth;
    setScrambleDepth(depth);

    const movesPool = ['U', "U'", 'D', "D'", 'R', "R'", 'L', "L'", 'F', "F'"];
    const history = [];

    for (let i = 0; i < depth; i++) {
      const randomMove = movesPool[Math.floor(Math.random() * movesPool.length)];
      history.push(randomMove);
      await executeMove(randomMove, false);
      await new Promise((r) => setTimeout(r, 70));
    }

    scrambleHistoryRef.current = history;
  }, [executeMove, scrambleDepth, highlightTargetLayer]);

  useEffect(() => {
    const timer = setTimeout(() => {
      startNewPuzzle(1); // Level 1 starts with 1 gentle rotation move!
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (stageSolved) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.round((Date.now() - stageStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [stageStartTime, stageSolved]);

  const provideGentleHint = () => {
    if (stageSolved) return;
    if (isSoundEnabled) playHintSound();

    const inverseMap = {
      'U': "U'", "U'": 'U',
      'D': "D'", "D'": 'D',
      'R': "R'", "R'": 'R',
      'L': "L'", "L'": 'L',
      'F': "F'", "F'": 'F',
      'B': "B'", "B'": 'B',
    };

    if (scrambleHistoryRef.current.length > 0) {
      const last = scrambleHistoryRef.current[scrambleHistoryRef.current.length - 1];
      const recommended = inverseMap[last] || 'U';
      setHintMove(recommended);
      setCognitiveFeedback(`Gentle Hint: Rotate layer "${recommended}"`);
    } else {
      setHintMove('R');
      setCognitiveFeedback('Try rotating Right (R) to align matching colors!');
    }
  };

  // ============================================================
  // 6. DUAL-HAND GESTURE RECOGNITION (TWO HANDS + SKELETON + RAYCASTING)
  // ============================================================
  useEffect(() => {
    let isCancelled = false;

    const initDetector = async () => {
      let detector = null;
      try {
        detector = await handPoseDetection.createDetector(
          handPoseDetection.SupportedModels.MediaPipeHands,
          {
            runtime: 'mediapipe',
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240',
            modelType: 'lite',
            maxHands: 2,
          }
        );
      } catch (err) {
        console.warn('MediaPipe CDN load failed, trying tfjs backend:', err);
      }

      if (!detector) {
        try {
          await tf.ready();
          detector = await handPoseDetection.createDetector(
            handPoseDetection.SupportedModels.MediaPipeHands,
            { runtime: 'tfjs', modelType: 'lite', maxHands: 2 }
          );
        } catch (tfErr) {
          console.warn('TFJS default backend failed, trying CPU:', tfErr);
          try {
            await tf.setBackend('cpu');
            await tf.ready();
            detector = await handPoseDetection.createDetector(
              handPoseDetection.SupportedModels.MediaPipeHands,
              { runtime: 'tfjs', modelType: 'lite', maxHands: 2 }
            );
          } catch (cpuErr) {
            console.error('All detector runtimes failed:', cpuErr);
          }
        }
      }

      if (detector && !isCancelled) {
        detectorRef.current = detector;
        setIsDetectorReady(true);
        setIsCameraActive(true);
      }
    };

    initDetector();
    return () => { isCancelled = true; };
  }, []);

  // Keep active callback references fresh without restarting the detection loop
  useEffect(() => {
    executeMoveRef.current = executeMove;
    highlightTargetLayerRef.current = highlightTargetLayer;
    stageSolvedRef.current = stageSolved;
  });

  // Universal Keypoint Normalizer — cached per-hand
  const normalizeHand = useCallback((keypoints, vw, vh) => {
    return keypoints.map((kp) => {
      if (!kp) return { x: 0, y: 0 };
      const isNorm = Math.abs(kp.x) <= 1.05 && Math.abs(kp.y) <= 1.05;
      return {
        x: isNorm ? kp.x * 640 : (kp.x / (vw || 640)) * 640,
        y: isNorm ? kp.y * 480 : (kp.y / (vh || 480)) * 480,
      };
    });
  }, []);

  // Batched skeleton renderer — single path per operation type
  const drawHandSkeleton = useCallback((ctx, normPts, color) => {
    // Draw all bones in one stroke call
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    HAND_CONNECTIONS.forEach(([i, j]) => {
      const p1 = normPts[i];
      const p2 = normPts[j];
      if (p1 && p2) {
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
    });
    ctx.stroke();

    // Draw all joints in one fill call
    ctx.beginPath();
    ctx.fillStyle = color;
    normPts.forEach((p, idx) => {
      const r = idx === 8 || idx === 4 ? 5 : 3;
      ctx.moveTo(p.x + r, p.y);
      ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
    });
    ctx.fill();

    // Highlight fingertips (index=8, thumb=4) with white
    ctx.beginPath();
    ctx.fillStyle = '#ffffff';
    [4, 8].forEach((idx) => {
      const p = normPts[idx];
      if (p) {
        ctx.moveTo(p.x + 4, p.y);
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
      }
    });
    ctx.fill();
  }, []);

  // ============================================================
  // PERSISTENT DUAL-HAND DETECTION ENGINE (Paced at ~30 FPS, Zero Jitter)
  // ============================================================
  useEffect(() => {
    let alive = true;
    let timeoutId = null;

    const detect = async () => {
      if (!alive) return;
      const startTime = performance.now();

      const video = webcamRef.current?.video;
      const detector = detectorRef.current;

      if (!detector || !video || video.readyState < 2 || !video.videoWidth) {
        if (alive) timeoutId = setTimeout(detect, 80);
        return;
      }

      try {
        const hands = await detector.estimateHands(video, { flipHorizontal: true });
        if (!alive) return;

        const canvas = previewCanvasRef.current;
        if (!canvas) {
          if (alive) timeoutId = setTimeout(detect, 16);
          return;
        }

        if (canvas.width !== 640) canvas.width = 640;
        if (canvas.height !== 480) canvas.height = 480;

        let ctx = previewCtxRef.current;
        if (!ctx) {
          ctx = canvas.getContext('2d', { alpha: true });
          previewCtxRef.current = ctx;
        }
        ctx.clearRect(0, 0, 640, 480);

        const vw = video.videoWidth || 640;
        const vh = video.videoHeight || 480;
        const now = performance.now();
        const handCount = hands ? hands.length : 0;

        // Throttle React state update for hand count
        if (now - lastCountUpdateRef.current > 300) {
          lastCountUpdateRef.current = now;
          setDetectedHandCount(handCount);
        }

        if (handCount > 0) {
          // Normalize all keypoints once per hand
          const normalizedHands = hands.map((h) => ({
            pts: normalizeHand(h.keypoints, vw, vh),
            raw: h,
          }));

          let orbitData = null;
          let pointerData = null;

          if (normalizedHands.length >= 2) {
            // Sort by wrist X: leftmost hand is Orbit, rightmost is Pointer
            normalizedHands.sort((a, b) => a.pts[0].x - b.pts[0].x);
            orbitData = normalizedHands[0];
            pointerData = normalizedHands[1];

            persistentHandsRef.current.orbit = { x: orbitData.pts[9].x, y: orbitData.pts[9].y, lastSeen: now };
            persistentHandsRef.current.pointer = { x: pointerData.pts[9].x, y: pointerData.pts[9].y, lastSeen: now };
          } else {
            // Single hand detected: identify role using spatial proximity
            const single = normalizedHands[0];
            const palmX = single.pts[9].x;
            const palmY = single.pts[9].y;

            const distToOrbit = Math.hypot(palmX - persistentHandsRef.current.orbit.x, palmY - persistentHandsRef.current.orbit.y);
            const distToPointer = Math.hypot(palmX - persistentHandsRef.current.pointer.x, palmY - persistentHandsRef.current.pointer.y);

            // Left side (< 320) or closer to orbit -> Orbit Hand; Right side (>= 320) or closer to pointer -> Pointer Hand
            const isPointer = distToPointer < distToOrbit || palmX >= 320;

            if (isPointer) {
              pointerData = single;
              persistentHandsRef.current.pointer = { x: palmX, y: palmY, lastSeen: now };
            } else {
              orbitData = single;
              persistentHandsRef.current.orbit = { x: palmX, y: palmY, lastSeen: now };
            }
          }

          // ── 1. ORBIT HAND (Cyan Skeleton) ─────────────────
          if (orbitData) {
            const pts = orbitData.pts;
            const rawPt = pts[9];
            const smoothed = orbitHandSmoothRef.current.filter(rawPt.x, rawPt.y);

            drawHandSkeleton(ctx, pts, '#06b6d4');

            // Glowing Orbit Beacon on wrist
            const wrist = pts[0];
            if (wrist) {
              ctx.beginPath();
              ctx.arc(wrist.x, wrist.y, 8, 0, 2 * Math.PI);
              ctx.fillStyle = '#06b6d4';
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2;
              ctx.stroke();
            }

            if (prevOrbitPosRef.current && targetRotationRef.current) {
              const dx = smoothed.x - prevOrbitPosRef.current.x;
              const dy = smoothed.y - prevOrbitPosRef.current.y;
              if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
                targetRotationRef.current.y += dx * 0.012;
                targetRotationRef.current.x += dy * 0.012;
              }
            }
            prevOrbitPosRef.current = { x: smoothed.x, y: smoothed.y };
          } else {
            // Keep last orbit state during 400ms grace period so single-frame drops don't jump
            if (now - persistentHandsRef.current.orbit.lastSeen > 400) {
              prevOrbitPosRef.current = null;
              orbitHandSmoothRef.current.reset();
            }
          }

          // ── 2. POINTER & TURNER HAND (Emerald / Amber) ───
          if (pointerData) {
            const pts = pointerData.pts;
            const indexPt = pts[8];
            const thumbPt = pts[4];
            const smoothed = pointerHandSmoothRef.current.filter(indexPt.x, indexPt.y);

            const pinchDist = Math.hypot(thumbPt.x - indexPt.x, thumbPt.y - indexPt.y);
            const pinchingNow = pinchDist < 46;

            if (isPinchingRef.current !== pinchingNow) {
              isPinchingRef.current = pinchingNow;
              setIsPinching(pinchingNow);
            }

            drawHandSkeleton(ctx, pts, pinchingNow ? '#f59e0b' : '#10b981');

            // Crosshair on index fingertip
            ctx.beginPath();
            ctx.arc(smoothed.x, smoothed.y, pinchingNow ? 16 : 10, 0, 2 * Math.PI);
            ctx.strokeStyle = pinchingNow ? '#f59e0b' : '#10b981';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Raycast into Three.js 3D space
            const normX = (smoothed.x / 640) * 2 - 1;
            const normY = -((smoothed.y / 480) * 2 - 1);

            if (cameraRef.current && cubiesRef.current) {
              raycasterRef.current.setFromCamera(new THREE.Vector2(normX, normY), cameraRef.current);
              const hits = raycasterRef.current.intersectObjects(cubiesRef.current);

              if (hits && hits.length > 0) {
                const hit = hits[0];
                const cubiePos = hit.object.position;
                const normal = hit.face.normal.clone().applyQuaternion(hit.object.quaternion);

                let targetedAxis = 'y', layerIdx = 1, layerName = 'U (Top)';

                if (Math.abs(normal.x) > 0.6) {
                  targetedAxis = 'x';
                  layerIdx = Math.round(cubiePos.x);
                  layerName = layerIdx === 1 ? 'R (Right)' : layerIdx === -1 ? 'L (Left)' : 'Middle X';
                } else if (Math.abs(normal.y) > 0.6) {
                  targetedAxis = 'y';
                  layerIdx = Math.round(cubiePos.y);
                  layerName = layerIdx === 1 ? 'U (Top)' : layerIdx === -1 ? 'D (Bottom)' : 'Middle Y';
                } else {
                  targetedAxis = 'z';
                  layerIdx = Math.round(cubiePos.z);
                  layerName = layerIdx === 1 ? 'F (Front)' : layerIdx === -1 ? 'B (Back)' : 'Middle Z';
                }

                const layerInfo = { axis: targetedAxis, layerIndex: layerIdx, name: layerName };
                if (targetedLayerRef.current?.name !== layerName) {
                  targetedLayerRef.current = layerInfo;
                  setTargetedLayer(layerInfo);
                  if (highlightTargetLayerRef.current) {
                    highlightTargetLayerRef.current(layerInfo);
                  }
                }

                // Pinch & swipe layer rotation
                const ct = Date.now();
                if (pinchingNow) {
                  if (!pinchStartPosRef.current) {
                    pinchStartPosRef.current = { x: smoothed.x, y: smoothed.y };
                  } else if (!gestureLockRef.current && ct - lastGestureTimeRef.current > 420 && !isAnimatingRef.current) {
                    const dragX = smoothed.x - pinchStartPosRef.current.x;
                    const dragY = smoothed.y - pinchStartPosRef.current.y;

                    if (Math.abs(dragX) > 24 && Math.abs(dragX) > Math.abs(dragY)) {
                      gestureLockRef.current = true;
                      lastGestureTimeRef.current = ct;
                      pinchStartPosRef.current = null;
                      if (executeMoveRef.current) {
                        executeMoveRef.current(dragX > 0
                          ? (layerInfo.axis === 'y' && layerInfo.layerIndex === -1 ? 'D' : 'U')
                          : (layerInfo.axis === 'y' && layerInfo.layerIndex === -1 ? "D'" : "U'"));
                      }
                    } else if (Math.abs(dragY) > 24) {
                      gestureLockRef.current = true;
                      lastGestureTimeRef.current = ct;
                      pinchStartPosRef.current = null;
                      if (executeMoveRef.current) {
                        executeMoveRef.current(dragY > 0
                          ? (layerInfo.axis === 'x' && layerInfo.layerIndex === -1 ? 'L' : 'R')
                          : (layerInfo.axis === 'x' && layerInfo.layerIndex === -1 ? "L'" : "R'"));
                      }
                    }
                  }
                } else {
                  pinchStartPosRef.current = null;
                  gestureLockRef.current = false;
                }
              } else {
                if (targetedLayerRef.current !== null) {
                  targetedLayerRef.current = null;
                  setTargetedLayer(null);
                  if (highlightTargetLayerRef.current) highlightTargetLayerRef.current(null);
                }
              }
            }
          } else {
            // Keep pointer target during 400ms grace period so targeting does not flicker off
            if (now - persistentHandsRef.current.pointer.lastSeen > 400) {
              if (targetedLayerRef.current !== null) {
                targetedLayerRef.current = null;
                setTargetedLayer(null);
                if (highlightTargetLayerRef.current) highlightTargetLayerRef.current(null);
              }
              pointerHandSmoothRef.current.reset();
              pinchStartPosRef.current = null;
            }
          }
        } else {
          // No hands in view: apply 400ms grace period before clearing
          if (now - persistentHandsRef.current.orbit.lastSeen > 400) {
            prevOrbitPosRef.current = null;
            orbitHandSmoothRef.current.reset();
          }
          if (now - persistentHandsRef.current.pointer.lastSeen > 400) {
            if (targetedLayerRef.current !== null) {
              targetedLayerRef.current = null;
              setTargetedLayer(null);
              if (highlightTargetLayerRef.current) highlightTargetLayerRef.current(null);
            }
            pointerHandSmoothRef.current.reset();
            pinchStartPosRef.current = null;
          }
        }
      } catch (e) {
        // Continue detection loop gracefully
      }

      // Smooth pacing: throttle detection to ~30 FPS, giving CPU & GPU ample time for 60 FPS Three.js rendering
      const elapsed = performance.now() - startTime;
      const delay = Math.max(16, 33 - elapsed);
      if (alive) timeoutId = setTimeout(detect, delay);
    };

    detect();
    return () => {
      alive = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [normalizeHand, drawHandSkeleton]);

  // ============================================================
  // 7. MOUSE DRAG FALLBACK FOR ORBITING CUBE
  // ============================================================
  const handleMouseDown = (e) => {
    isDraggingCubeRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingCubeRef.current || !cubeGroupRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    if (targetRotationRef.current) {
      targetRotationRef.current.y += deltaX * 0.008;
      targetRotationRef.current.x += deltaY * 0.008;
    }

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingCubeRef.current = false;
  };

  const resetCubeView = () => {
    if (cubeGroupRef.current) {
      cubeGroupRef.current.rotation.set(0, 0, 0);
      if (targetRotationRef.current) {
        targetRotationRef.current = { x: 0, y: 0 };
      }
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col select-none relative overflow-hidden">
      {/* Fullscreen Celebration Confetti Canvas */}
      <canvas
        ref={confettiCanvasRef}
        className="absolute inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* ============================================================ */}
      {/* TOP HEADER & STATS                                           */}
      {/* ============================================================ */}
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/60 px-6 py-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/games')}
            className="p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Games</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
                Gesture Rubik's Cube
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Cognitive Stage {level}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Dual-Hand Vision: Hand 1 Orbits • Hand 2 Points & Pinches to Turn
            </p>
          </div>
        </div>

        {/* Stats & Accessibility Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Level {level}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>{coins} Coins</span>
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300">
            <span>⏱️ {formatTime(elapsedTime)}</span>
          </div>

          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Toggle Sound"
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 3D CUBE WORKSPACE & CONTROLS                                 */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        
        {/* Left / Center: HD 3D Three.js Interactive Cube Canvas */}
        <div
          ref={mountRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="flex-1 w-full h-[58vh] lg:h-auto cursor-grab active:cursor-grabbing relative flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950"
        >
          {/* Active Target Banner Over 3D Cube */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 items-center">
            <button
              onClick={resetCubeView}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-xs font-bold text-slate-300 flex items-center gap-1.5 shadow-md"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              Reset View
            </button>
            <button
              onClick={provideGentleHint}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5 shadow-md"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Cognitive Hint
            </button>

            {targetedLayer && (
              <div className="px-3 py-1.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-xs font-bold text-sky-300 flex items-center gap-1.5 animate-pulse">
                <span>🎯 Pointing at: <strong>{targetedLayer.name}</strong></span>
                {isPinching && <span className="text-amber-400 font-black">• PINCHED (Swipe to turn)</span>}
              </div>
            )}
          </div>

          {/* Victory Overlay Card */}
          {stageSolved && (
            <div className="absolute inset-0 z-40 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-slate-800 border border-slate-700 rounded-3xl p-7 max-w-sm w-full text-center shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h2 className="text-2xl font-black text-white">Stage {level} Solved!</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Completed in {formatTime(elapsedTime)} with {moveCount} moves.
                </p>

                <div className="my-4 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/60 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Cognitive State:</span>
                    <span className="font-bold text-emerald-400">{patientStats.performanceRating}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Reward Earned:</span>
                    <span className="font-bold text-yellow-400">+50 Coins</span>
                  </div>
                </div>

                <button
                  onClick={() => startNewPuzzle(null)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                  <span>Advance to Next Stage</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Dual Hand Tracker & Rotation Pad */}
        <aside className="w-full lg:w-96 bg-slate-800/90 border-t lg:border-t-0 lg:border-l border-slate-700/60 p-5 flex flex-col justify-between z-20 space-y-4">
          
          {/* 1. Camera Box & Dual Hand Tracking Visualization */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                Dual-Hand Vision Tracking
              </span>
              <button
                onClick={() => setShowWebcam(!showWebcam)}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-200"
              >
                {showWebcam ? 'Hide Camera' : 'Show Camera'}
              </button>
            </div>

            {showWebcam && (
              <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-inner">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  mirrored={true}
                  width={640}
                  height={480}
                  videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
                  className="absolute inset-0 w-full h-full object-cover opacity-85"
                  onUserMedia={() => setIsCameraActive(true)}
                  onUserMediaError={(err) => console.error('Webcam stream error:', err)}
                />
                <canvas
                  ref={previewCanvasRef}
                  width={640}
                  height={480}
                  className="absolute inset-0 w-full h-full pointer-events-none z-20"
                />

                {/* Real-Time Hand Status Indicator */}
                <div className="absolute top-2 left-2 z-30 px-2 py-0.5 rounded-md bg-slate-900/85 backdrop-blur-sm text-[10px] font-bold flex items-center gap-1.5 border border-slate-700/60 text-slate-200">
                  <div className={`w-2 h-2 rounded-full ${!isDetectorReady ? 'bg-amber-400 animate-ping' : detectedHandCount > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <span>
                    {!isDetectorReady
                      ? 'Loading AI...'
                      : detectedHandCount >= 2
                      ? '🟢 2 Hands Detected'
                      : detectedHandCount === 1
                      ? '🟢 1 Hand Detected'
                      : 'Show Hands to Camera'}
                  </span>
                </div>
                
                {/* Visual Legend */}
                <div className="absolute bottom-2 left-2 right-2 z-30 bg-slate-900/85 backdrop-blur-sm rounded-lg px-2.5 py-1 text-[11px] text-slate-300 flex items-center justify-between border border-slate-700/60">
                  <span className="text-cyan-300 font-semibold">🔵 Hand 1: Orbit</span>
                  <span className="text-emerald-300 font-semibold">🟢 Hand 2: Point & Turn</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Cognitive Feedback & Pace Advisor */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-900/60 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Real-Time Cognitive Pace</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {cognitiveFeedback}
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-indigo-900/40">
              <span>Scramble Complexity: <strong>{scrambleDepth} Move{scrambleDepth > 1 ? 's' : ''}</strong></span>
              <span>Turns Taken: <strong>{moveCount}</strong></span>
            </div>
          </div>

          {/* 3. Accessible Move Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Accessible Layer Controls</span>
              {hintMove && (
                <span className="text-amber-400 font-bold animate-pulse">
                  Next Step: {hintMove}
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'U', name: 'Top ↻' },
                { label: "U'", name: 'Top ↺' },
                { label: 'D', name: 'Bottom ↻' },
                { label: "D'", name: 'Bottom ↺' },
                { label: 'R', name: 'Right ↻' },
                { label: "R'", name: 'Right ↺' },
                { label: 'L', name: 'Left ↻' },
                { label: "L'", name: 'Left ↺' },
                { label: 'F', name: 'Front ↻' },
                { label: "F'", name: 'Front ↺' },
                { label: 'B', name: 'Back ↻' },
                { label: "B'", name: 'Back ↺' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => executeMove(btn.label)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                    hintMove === btn.label
                      ? 'bg-amber-500 text-slate-900 border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-lg'
                      : 'bg-slate-700/60 hover:bg-slate-700 text-slate-200 border-slate-600/60 hover:border-slate-500'
                  }`}
                >
                  {btn.name}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Controls */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => startNewPuzzle(null)}
              className="flex-1 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-600/60"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reshuffle</span>
            </button>
            <button
              onClick={provideGentleHint}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Cognitive Hint</span>
            </button>
          </div>

        </aside>
      </div>
    </div>
  );
};

export default GestureRubiksCube;
