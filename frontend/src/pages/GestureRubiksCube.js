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
  RotateCw, RotateCcw, Award, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ============================================================
// AUDIO SOUND SYNTHESIZER (NO EXTERNAL ASSETS NEEDED)
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
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    }, delay);
  } catch (e) {}
}

const playClickSound = () => {
  playTone(420, 60, 'triangle');
};

const playTurnSound = () => {
  playTone(320, 80, 'sine');
  playTone(480, 80, 'sine', 40);
};

const playSuccessSound = () => {
  playTone(523.25, 120, 'sine');
  playTone(659.25, 120, 'sine', 90);
  playTone(783.99, 150, 'sine', 180);
  playTone(1046.5, 320, 'sine', 270);
};

const playHintSound = () => {
  playTone(660, 100, 'sine');
  playTone(880, 140, 'sine', 80);
};

// ============================================================
// RUBIK'S CUBE COLOR PALETTE (OFFICIAL HD VIBRANT COLORS)
// ============================================================
const CUBE_COLORS = {
  RIGHT: 0xb71234,  // Red (+X)
  LEFT: 0xff5800,   // Orange (-X)
  UP: 0xffffff,     // White (+Y)
  DOWN: 0xffd500,   // Yellow (-Y)
  FRONT: 0x009b48,  // Green (+Z)
  BACK: 0x0046ad,   // Blue (-Z)
  INSIDE: 0x18181b, // Charcoal Matte Body
};

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

  // Orbit rotation controls
  const isDraggingCubeRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  // Game States
  const [level, setLevel] = useState(user?.level || 1);
  const [coins, setCoins] = useState(user?.coins ?? 100);
  const [totalSolved, setTotalSolved] = useState(0);
  const [stageSolved, setStageSolved] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showWebcam, setShowWebcam] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [activeFaceHover, setActiveFaceHover] = useState(null);
  const [hintMove, setHintMove] = useState(null);
  const [stageStartTime, setStageStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [scrambleDepth, setScrambleDepth] = useState(1);
  const [cognitiveFeedback, setCognitiveFeedback] = useState('Relaxed mode: Take all the time you need!');
  const [patientStats, setPatientStats] = useState({
    avgSolveTime: 0,
    performanceRating: 'Optimal',
    scrambleHistory: [],
  });

  // Hand gesture tracking state
  const detectorRef = useRef(null);
  const gestureLockRef = useRef(false);
  const lastGestureTimeRef = useRef(0);
  const prevHandPosRef = useRef(null);

  // Scramble sequence history to compute reverse solution / hints
  const scrambleHistoryRef = useRef([]);

  // ============================================================
  // 1. THREE.JS HD CUBE INITIALIZATION
  // ============================================================
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 540;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera (HD Perspective)
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

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.78);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight1.position.set(8, 12, 10);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.45);
    dirLight2.position.set(-8, -6, -8);
    scene.add(dirLight2);

    // Cube Master Group
    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    cubeGroupRef.current = cubeGroup;

    // Build 26 Rubik's Cubies
    const cubies = [];
    const cubieSize = 0.94;
    const bevelRadius = 0.04;
    const geometry = new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize);

    // Create stickers with beveled borders
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue; // Skip core center

          // 6 materials for the 6 faces (+X, -X, +Y, -Y, +Z, -Z)
          const materials = [
            new THREE.MeshStandardMaterial({
              color: x === 1 ? CUBE_COLORS.RIGHT : CUBE_COLORS.INSIDE,
              roughness: 0.15,
              metalness: 0.08,
            }), // Right (+X)
            new THREE.MeshStandardMaterial({
              color: x === -1 ? CUBE_COLORS.LEFT : CUBE_COLORS.INSIDE,
              roughness: 0.15,
              metalness: 0.08,
            }), // Left (-X)
            new THREE.MeshStandardMaterial({
              color: y === 1 ? CUBE_COLORS.UP : CUBE_COLORS.INSIDE,
              roughness: 0.15,
              metalness: 0.08,
            }), // Up (+Y)
            new THREE.MeshStandardMaterial({
              color: y === -1 ? CUBE_COLORS.DOWN : CUBE_COLORS.INSIDE,
              roughness: 0.15,
              metalness: 0.08,
            }), // Down (-Y)
            new THREE.MeshStandardMaterial({
              color: z === 1 ? CUBE_COLORS.FRONT : CUBE_COLORS.INSIDE,
              roughness: 0.15,
              metalness: 0.08,
            }), // Front (+Z)
            new THREE.MeshStandardMaterial({
              color: z === -1 ? CUBE_COLORS.BACK : CUBE_COLORS.INSIDE,
              roughness: 0.15,
              metalness: 0.08,
            }), // Back (-Z)
          ];

          const mesh = new THREE.Mesh(geometry, materials);
          mesh.position.set(x, y, z);
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Store initial coordinate metadata
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

      // Subtle float oscillation for soothing cognitive feel
      if (!isDraggingCubeRef.current) {
        cubeGroup.position.y = Math.sin(Date.now() / 1200) * 0.06;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
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
      cubies.forEach(c => {
        if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
      });
    };
  }, []);

  // ============================================================
  // 2. LAYER ROTATION ENGINE (MATHEMATICALLY EXACT ANIMATION)
  // ============================================================
  const rotateLayer = useCallback((axis, layerIndex, angle, duration = 220) => {
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

      // 1. Identify which cubies belong to this layer
      const activeCubies = cubies.filter((mesh) => {
        const pos = mesh.position;
        const val = axis === 'x' ? pos.x : axis === 'y' ? pos.y : pos.z;
        return Math.abs(val - layerIndex) < 0.2;
      });

      // 2. Create a temporary pivot group
      const pivot = new THREE.Group();
      cubeGroup.add(pivot);

      // 3. Attach cubies to pivot
      activeCubies.forEach((cubie) => {
        pivot.attach(cubie);
      });

      // Play audio chime
      if (isSoundEnabled) playTurnSound();

      // 4. Smooth Rotation Animation
      const startTime = performance.now();
      const startAngle = 0;

      const animateStep = (time) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Smooth ease-out quad curve
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentAngle = angle * ease;

        if (axis === 'x') pivot.rotation.x = currentAngle;
        else if (axis === 'y') pivot.rotation.y = currentAngle;
        else pivot.rotation.z = currentAngle;

        if (progress < 1) {
          requestAnimationFrame(animateStep);
        } else {
          // Snap exact final rotation
          if (axis === 'x') pivot.rotation.x = angle;
          else if (axis === 'y') pivot.rotation.y = angle;
          else pivot.rotation.z = angle;
          pivot.updateMatrixWorld();

          // 5. Reattach cubies back to master cube group with rounded positions
          activeCubies.forEach((cubie) => {
            cubeGroup.attach(cubie);
            cubie.position.x = Math.round(cubie.position.x);
            cubie.position.y = Math.round(cubie.position.y);
            cubie.position.z = Math.round(cubie.position.z);
          });

          cubeGroup.remove(pivot);
          isAnimatingRef.current = false;
          resolve();

          // Execute next queued move if any
          if (moveQueueRef.current.length > 0) {
            const next = moveQueueRef.current.shift();
            rotateLayer(next.axis, next.layerIndex, next.angle, next.duration).then(next.resolve);
          }
        }
      };

      requestAnimationFrame(animateStep);
    });
  }, [isSoundEnabled]);

  // Standard notation wrappers: U, D, L, R, F, B
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

    await rotateLayer(axis, layer, angle, 200);

    if (isUserMove) {
      setMoveCount((prev) => prev + 1);
      checkIsCubeSolved();
    }
  }, [rotateLayer, stageSolved]);

  // ============================================================
  // 3. CHECK IF PUZZLE IS SOLVED
  // ============================================================
  const checkIsCubeSolved = useCallback(() => {
    const cubies = cubiesRef.current;
    if (!cubies || cubies.length === 0) return false;

    // Check each of the 6 faces: all stickers pointing in that normal direction must match
    const faces = [
      { normal: new THREE.Vector3(1, 0, 0), matIndex: 0 },  // +X Right
      { normal: new THREE.Vector3(-1, 0, 0), matIndex: 1 }, // -X Left
      { normal: new THREE.Vector3(0, 1, 0), matIndex: 2 },  // +Y Up
      { normal: new THREE.Vector3(0, -1, 0), matIndex: 3 }, // -Y Down
      { normal: new THREE.Vector3(0, 0, 1), matIndex: 4 },  // +Z Front
      { normal: new THREE.Vector3(0, 0, -1), matIndex: 5 }, // -Z Back
    ];

    let allFacesUniform = true;

    for (const face of faces) {
      // Find all cubies currently on this surface
      const surfaceCubies = cubies.filter((mesh) => {
        if (face.normal.x !== 0) return Math.abs(mesh.position.x - face.normal.x) < 0.2;
        if (face.normal.y !== 0) return Math.abs(mesh.position.y - face.normal.y) < 0.2;
        if (face.normal.z !== 0) return Math.abs(mesh.position.z - face.normal.z) < 0.2;
        return false;
      });

      if (surfaceCubies.length !== 9) continue;

      // Extract current color facing in this direction
      const colors = surfaceCubies.map((mesh) => {
        // Find which local face is currently facing towards face.normal in world space
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

      // If any sticker on this face doesn't match the face's first sticker, it's not solved yet
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

  // ============================================================
  // 4. CELEBRATION & COGNITIVE ADAPTIVE PROGRESSION
  // ============================================================
  const triggerConfetti = useCallback(() => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth || window.innerWidth;
    canvas.height = canvas.clientHeight || window.innerHeight;

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];
    const particles = Array.from({ length: 65 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 80,
      y: canvas.height / 2 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 1.2) * 12,
      size: Math.random() * 6 + 4,
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
        p.vy += 0.28;
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

    // Cognitive Real-Time Performance Assessment
    let speedAssessment = 'Patient & Calm';
    let feedback = 'Wonderful spatial perception!';
    let nextDepth = scrambleDepth;

    if (timeSpent < 20) {
      speedAssessment = 'Rapid Insight';
      feedback = 'Sharp cognitive recognition! Gently advancing complexity.';
      nextDepth = Math.min(scrambleDepth + 1, 8); // Slowly increment
    } else if (timeSpent <= 60) {
      speedAssessment = 'Comfortable Pace';
      feedback = 'Great focus and motor steady state!';
      // Increment only every 2nd solve for comfortable progression
      if (newTotalSolved % 2 === 0) nextDepth = Math.min(scrambleDepth + 1, 8);
    } else {
      speedAssessment = 'Thoughtful Exploration';
      feedback = 'Excellent persistence! Keeping puzzle comfortable.';
      // Maintain comfortable depth
      nextDepth = Math.max(1, scrambleDepth);
    }

    setCognitiveFeedback(feedback);
    setPatientStats((prev) => ({
      avgSolveTime: Math.round(((prev.avgSolveTime * (newTotalSolved - 1)) + timeSpent) / newTotalSolved),
      performanceRating: speedAssessment,
      scrambleHistory: [...prev.scrambleHistory, { timeSpent, depth: scrambleDepth }],
    }));

    // Grant cognitive achievement points
    const pointsEarned = 50 + Math.max(10, 40 - Math.floor(timeSpent / 2));
    const newCoins = coins + pointsEarned;
    const newLevel = level + (nextDepth > scrambleDepth ? 1 : 0);
    setCoins(newCoins);
    setLevel(newLevel);

    // Save to Database
    if (syncProgress) {
      syncProgress({
        coins: newCoins,
        level: newLevel,
        score: (user?.score || 0) + pointsEarned,
        gameStats: {
          rubikSolved: newTotalSolved,
          lastPerformance: speedAssessment,
        },
      });
    }
  }, [coins, level, scrambleDepth, stageStartTime, totalSolved, user, isSoundEnabled, syncProgress, triggerConfetti]);

  // ============================================================
  // 5. SLOW & ADAPTIVE SCRAMBLER (COGNITIVELY DESIGNED)
  // ============================================================
  const startNewPuzzle = useCallback(async (customDepth = null) => {
    setStageSolved(false);
    setMoveCount(0);
    setHintMove(null);
    setStageStartTime(Date.now());

    const depth = customDepth !== null ? customDepth : scrambleDepth;
    setScrambleDepth(depth);

    const movesPool = ['U', "U'", 'D', "D'", 'R', "R'", 'L', "L'", 'F', "F'"];
    const history = [];

    // Perform gentle slow scramble moves with visual animation
    for (let i = 0; i < depth; i++) {
      const randomMove = movesPool[Math.floor(Math.random() * movesPool.length)];
      history.push(randomMove);
      await executeMove(randomMove, false);
      await new Promise((r) => setTimeout(r, 60));
    }

    scrambleHistoryRef.current = history;
  }, [executeMove, scrambleDepth]);

  // Scramble on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      startNewPuzzle(1); // Start at level 1: 1 single move scramble!
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Elapsed timer ticker
  useEffect(() => {
    if (stageSolved) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.round((Date.now() - stageStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [stageStartTime, stageSolved]);

  // ============================================================
  // 6. GENTLE COGNITIVE HINT SYSTEM
  // ============================================================
  const provideGentleHint = () => {
    if (stageSolved) return;
    if (isSoundEnabled) playHintSound();

    // Compute reverse of last scrambled move as immediate solution step
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
      setCognitiveFeedback(`Gentle Hint: Try rotating layer "${recommended}"`);
    } else {
      setHintMove('R');
      setCognitiveFeedback('Try rotating the Right layer (R) to align colors!');
    }
  };

  // ============================================================
  // 7. WEBCAM & HAND-GESTURE ENGINE (MEDIAPIPE POWERED)
  // ============================================================
  useEffect(() => {
    let isCancelled = false;

    const initDetector = async () => {
      try {
        const detector = await handPoseDetection.createDetector(
          handPoseDetection.SupportedModels.MediaPipeHands,
          {
            runtime: 'mediapipe',
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240',
            modelType: 'lite',
            maxHands: 1,
          }
        );
        if (!isCancelled) {
          detectorRef.current = detector;
          setIsCameraActive(true);
        }
      } catch (err) {
        console.warn('Fallback to tfjs handpose:', err);
        try {
          await tf.setBackend('webgl');
          const detector = await handPoseDetection.createDetector(
            handPoseDetection.SupportedModels.MediaPipeHands,
            { runtime: 'tfjs', modelType: 'lite', maxHands: 1 }
          );
          if (!isCancelled) {
            detectorRef.current = detector;
            setIsCameraActive(true);
          }
        } catch (e) {
          console.error('Hand detector init failed:', e);
        }
      }
    };

    initDetector();
    return () => { isCancelled = true; };
  }, []);

  // Frame-by-frame gesture detection loop
  useEffect(() => {
    let animFrame;

    const detectGestures = async () => {
      if (
        detectorRef.current &&
        webcamRef.current?.video?.readyState === 4 &&
        !isAnimatingRef.current
      ) {
        const video = webcamRef.current.video;
        try {
          const hands = await detectorRef.current.estimateHands(video, { flipHorizontal: true });
          const canvas = previewCanvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (hands && hands.length > 0) {
              const hand = hands[0];
              const keypoints = hand.keypoints;
              const indexTip = keypoints[8];
              const thumbTip = keypoints[4];
              const wrist = keypoints[0];

              // Draw lightweight hand skeleton in camera preview
              ctx.fillStyle = '#6366f1';
              keypoints.forEach((kp) => {
                const px = (kp.x / video.videoWidth) * canvas.width;
                const py = (kp.y / video.videoHeight) * canvas.height;
                ctx.beginPath();
                ctx.arc(px, py, 3, 0, 2 * Math.PI);
                ctx.fill();
              });

              // Detect Pinch (Distance between thumb & index tip)
              const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
              const isPinching = pinchDist < 38;

              // Draw pinch indicator
              const ix = (indexTip.x / video.videoWidth) * canvas.width;
              const iy = (indexTip.y / video.videoHeight) * canvas.height;
              ctx.beginPath();
              ctx.arc(ix, iy, isPinching ? 12 : 7, 0, 2 * Math.PI);
              ctx.strokeStyle = isPinching ? '#10b981' : '#6366f1';
              ctx.lineWidth = 2.5;
              ctx.stroke();

              const now = Date.now();

              // Gesture 1: Open Palm Move -> Smoothly Rotate / Orbit the Cube View
              if (!isPinching && prevHandPosRef.current && cubeGroupRef.current) {
                const dx = indexTip.x - prevHandPosRef.current.x;
                const dy = indexTip.y - prevHandPosRef.current.y;

                if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                  cubeGroupRef.current.rotation.y += dx * 0.007;
                  cubeGroupRef.current.rotation.x += dy * 0.007;
                }
              }

              // Gesture 2: Pinch Swipe -> Rotate Target Rubik Layer
              if (isPinching && !gestureLockRef.current && now - lastGestureTimeRef.current > 700) {
                if (prevHandPosRef.current) {
                  const dx = indexTip.x - prevHandPosRef.current.x;
                  const dy = indexTip.y - prevHandPosRef.current.y;

                  // Swipe Right -> Turn U Layer
                  if (dx > 35) {
                    gestureLockRef.current = true;
                    lastGestureTimeRef.current = now;
                    executeMove('U');
                  }
                  // Swipe Left -> Turn U' Layer
                  else if (dx < -35) {
                    gestureLockRef.current = true;
                    lastGestureTimeRef.current = now;
                    executeMove("U'");
                  }
                  // Swipe Down -> Turn R Layer
                  else if (dy > 35) {
                    gestureLockRef.current = true;
                    lastGestureTimeRef.current = now;
                    executeMove('R');
                  }
                  // Swipe Up -> Turn R' Layer
                  else if (dy < -35) {
                    gestureLockRef.current = true;
                    lastGestureTimeRef.current = now;
                    executeMove("R'");
                  }
                }
              }

              if (!isPinching) {
                gestureLockRef.current = false;
              }

              prevHandPosRef.current = { x: indexTip.x, y: indexTip.y };
            } else {
              prevHandPosRef.current = null;
            }
          }
        } catch (e) {}
      }

      animFrame = requestAnimationFrame(detectGestures);
    };

    animFrame = requestAnimationFrame(detectGestures);
    return () => cancelAnimationFrame(animFrame);
  }, [executeMove]);

  // ============================================================
  // 8. MOUSE / TOUCH DRAG ORBIT CONTROLS (FALLBACK)
  // ============================================================
  const handleMouseDown = (e) => {
    isDraggingCubeRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingCubeRef.current || !cubeGroupRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    cubeGroupRef.current.rotation.y += deltaX * 0.008;
    cubeGroupRef.current.rotation.x += deltaY * 0.008;

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingCubeRef.current = false;
  };

  // Reset 3D view orientation
  const resetCubeView = () => {
    if (cubeGroupRef.current) {
      cubeGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  // Format elapsed time (mm:ss)
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
      {/* TOP HEADER & COGNITIVE NAVIGATION                            */}
      {/* ============================================================ */}
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/60 px-6 py-3.5 flex items-center justify-between z-30">
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
                Cognitive Therapy
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Zero Pressure • No Life Loss • Adaptive Cognitive Scramble
            </p>
          </div>
        </div>

        {/* Stats Pill Badges */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300">
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
      {/* MAIN GAMEPLAY WORKSPACE (3D CUBE + GESTURE CONTROLS)         */}
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
          {/* Subtle 3D Depth Rings */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
            <div className="w-[480px] h-[480px] rounded-full border border-indigo-400"></div>
            <div className="w-[340px] h-[340px] rounded-full border border-indigo-400"></div>
          </div>

          {/* On-screen Orientation Helpers */}
          <div className="absolute top-4 left-4 z-20 flex gap-2">
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
              Hint
            </button>
          </div>

          {/* Victory Overlay Card */}
          {stageSolved && (
            <div className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-slate-800 border border-slate-700 rounded-3xl p-7 max-w-sm w-full text-center shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h2 className="text-2xl font-black text-white">Cube Solved!</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Completed in {formatTime(elapsedTime)} with {moveCount} moves.
                </p>

                <div className="my-4 p-3 rounded-2xl bg-slate-900/60 border border-slate-700/60 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Cognitive State:</span>
                    <span className="font-bold text-emerald-400">{patientStats.performanceRating}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Reward:</span>
                    <span className="font-bold text-yellow-400">+60 Coins</span>
                  </div>
                </div>

                <button
                  onClick={() => startNewPuzzle(null)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                  <span>Next Challenge</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Webcam Hand Tracking & Accessible Move Controls */}
        <aside className="w-full lg:w-96 bg-slate-800/90 border-t lg:border-t-0 lg:border-l border-slate-700/60 p-5 flex flex-col justify-between z-20 space-y-4">
          
          {/* 1. Camera Box & Hand Pose Tracking */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                Gesture Vision Tracker
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
                  videoConstraints={{ width: 320, height: 240, facingMode: 'user' }}
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                <canvas
                  ref={previewCanvasRef}
                  width={320}
                  height={240}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
                
                {/* Visual Legend / Instructions on Camera Box */}
                <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-sm rounded-lg px-2.5 py-1 text-[11px] text-slate-300 flex items-center justify-between border border-slate-700/60">
                  <span>🖐️ <strong>Open Palm:</strong> Orbit View</span>
                  <span>🤏 <strong>Pinch Swipe:</strong> Turn Face</span>
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
              <span>Scramble Steps: <strong>{scrambleDepth}</strong></span>
              <span>Moves: <strong>{moveCount}</strong></span>
            </div>
          </div>

          {/* 3. Accessible Move Buttons (Effortless Fallback for Elderly / Relaxed Patients) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Layer Rotation Buttons</span>
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

          {/* 4. Scramble & Restart Controls */}
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
