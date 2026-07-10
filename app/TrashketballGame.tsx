"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

type GamePhase = "intro" | "playing" | "levelComplete" | "finished";

const LEVELS = [
  {
    number: "01",
    kicker: "The Severed Floor",
    title: "Refine your aim.",
    subtitle: "Cold lights. Quiet corridors. One very important wastebasket.",
    location: "Lumon · MDR Annex",
    bin: "Steel mesh",
  },
  {
    number: "02",
    kicker: "The Coastal House",
    title: "Take it outside.",
    subtitle: "Salt air, soft linen, and absolutely no reason to miss.",
    location: "Tides House · Pacific Coast",
    bin: "Woven rattan",
  },
];

function mat(color: number, roughness = 0.72, metalness = 0.04) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function box(
  parent: THREE.Object3D,
  size: [number, number, number],
  position: [number, number, number],
  material: THREE.Material,
  rotation: [number, number, number] = [0, 0, 0]
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function cylinder(
  parent: THREE.Object3D,
  radiusTop: number,
  radiusBottom: number,
  height: number,
  position: [number, number, number],
  material: THREE.Material,
  segments = 32
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
    material
  );
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addOffice(group: THREE.Group) {
  const cream = mat(0xdce0ce, 0.95);
  const green = mat(0x637b6b, 1);
  const darkGreen = mat(0x243f3c, 0.8);
  const walnut = mat(0x6e4b32, 0.78);
  const orange = mat(0xcf6d37, 0.9);
  const black = mat(0x151b1b, 0.45, 0.3);

  box(group, [16, 0.2, 18], [0, -0.12, -1], green);
  box(group, [16, 7, 0.2], [0, 3.4, -7], cream);
  box(group, [0.2, 7, 18], [-8, 3.4, -1], cream);
  box(group, [0.2, 7, 18], [8, 3.4, -1], cream);
  box(group, [16, 0.18, 18], [0, 6.8, -1], cream);

  // Modular wall seams and the ominous corridor opening.
  for (let x = -7; x <= 7; x += 2) box(group, [0.025, 6.2, 0.025], [x, 3.2, -6.87], darkGreen);
  box(group, [3.1, 5.1, 0.25], [4.7, 2.45, -6.75], darkGreen);
  box(group, [2.5, 4.55, 0.25], [4.7, 2.25, -6.58], black);
  box(group, [1.3, 0.34, 0.12], [4.7, 5.15, -6.38], orange);

  // Suspended fluorescent ceiling grid.
  for (const x of [-5, -1.65, 1.65, 5]) {
    for (const z of [-5, -1.5, 2, 5]) {
      box(group, [1.5, 0.08, 0.56], [x, 6.62, z], mat(0xf4fff1, 0.25));
    }
  }

  // Retro work islands and chunky terminals.
  for (const x of [-4.1, 0, 4.1]) {
    box(group, [3.2, 0.18, 1.45], [x, 0.92, -1.8], walnut);
    box(group, [0.14, 0.9, 1.25], [x - 1.25, 0.43, -1.8], black);
    box(group, [0.14, 0.9, 1.25], [x + 1.25, 0.43, -1.8], black);
    box(group, [1.05, 0.74, 0.38], [x, 1.35, -2.08], cream, [-0.08, 0, 0]);
    const screen = box(group, [0.78, 0.45, 0.035], [x, 1.4, -1.87], darkGreen, [-0.08, 0, 0]);
    screen.material = new THREE.MeshStandardMaterial({ color: 0x123e35, emissive: 0x0c3027, emissiveIntensity: 1.2 });
    box(group, [0.86, 0.05, 0.35], [x, 1.02, -1.42], cream);
  }

  // A burnt-orange conversation pit on the left.
  box(group, [2.7, 0.52, 1.2], [-5.9, 0.38, -4.75], orange);
  box(group, [2.7, 0.75, 0.28], [-5.9, 0.78, -5.22], orange, [-0.1, 0, 0]);
  cylinder(group, 0.65, 0.72, 0.32, [-3.9, 0.17, -4.9], walnut);

  // Office mesh bin.
  const bin = new THREE.Group();
  bin.name = "bin";
  bin.position.set(0, 0, -4.5);
  const meshMaterial = new THREE.MeshStandardMaterial({ color: 0x1d2928, wireframe: true, roughness: 0.6 });
  cylinder(bin, 0.64, 0.5, 0.92, [0, 0.46, 0], meshMaterial, 22);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.045, 10, 40), black);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.92;
  rim.castShadow = true;
  bin.add(rim);
  group.add(bin);

  const area = new THREE.RectAreaLight(0xe8ffe8, 7, 12, 10);
  area.position.set(0, 6.35, -0.5);
  area.rotation.x = -Math.PI / 2;
  group.add(area);
}

function addBeachHouse(group: THREE.Group) {
  const stone = mat(0xd6c8b2, 0.95);
  const plaster = mat(0xf3eee4, 0.98);
  const oak = mat(0x987252, 0.75);
  const linen = mat(0xe7ded0, 1);
  const charcoal = mat(0x242b2b, 0.7);
  const blue = mat(0x2f91ad, 0.38);
  const sand = mat(0xdabf89, 1);
  const green = mat(0x315e47, 0.9);

  box(group, [18, 0.2, 18], [0, -0.12, -1], stone);
  box(group, [0.25, 9, 18], [-9, 4.4, -1], plaster);
  box(group, [0.25, 9, 18], [9, 4.4, -1], plaster);
  box(group, [18, 0.22, 18], [0, 8.8, -1], oak, [0, 0, 0.02]);

  // Floor-to-ceiling glazing and Pacific view.
  box(group, [18, 0.12, 0.15], [0, 0.05, -7], charcoal);
  box(group, [18, 0.14, 0.15], [0, 7.85, -7], charcoal);
  for (const x of [-8.8, -5.85, -2.92, 0, 2.92, 5.85, 8.8]) {
    box(group, [0.08, 7.9, 0.15], [x, 3.95, -7], charcoal);
  }
  box(group, [40, 0.25, 18], [0, -0.2, -15], sand);
  box(group, [40, 0.18, 26], [0, 0.05, -30], blue);

  // Sculptural cloud sofas.
  box(group, [4.4, 0.64, 1.5], [-4.9, 0.47, -2.7], linen, [0, 0.12, 0]);
  for (let i = 0; i < 3; i++) cylinder(group, 0.72, 0.78, 0.9, [-6.15 + i * 1.22, 0.9, -3.22], linen, 32);
  box(group, [3.8, 0.6, 1.35], [4.8, 0.45, -2.5], linen, [0, -0.16, 0]);
  for (let i = 0; i < 3; i++) cylinder(group, 0.65, 0.72, 0.82, [3.65 + i * 1.1, 0.86, -3.0], linen, 32);
  cylinder(group, 1.15, 1.28, 0.28, [-4.8, 0.18, -0.4], oak, 48);
  cylinder(group, 0.7, 0.78, 0.18, [4.5, 0.13, -0.2], stone, 48);

  // Kitchen monolith and warm pendant lights.
  box(group, [4.8, 1.05, 1.25], [-5.1, 0.55, 3.5], plaster);
  box(group, [4.4, 0.09, 1.1], [-5.1, 1.12, 3.5], charcoal);
  for (const x of [-6.2, -4.2]) {
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.62, 32, 1, true), oak);
    shade.position.set(x, 5.6, 2.8);
    shade.rotation.x = Math.PI;
    shade.castShadow = true;
    group.add(shade);
    box(group, [0.02, 2.5, 0.02], [x, 7.05, 2.8], charcoal);
    const light = new THREE.PointLight(0xffca86, 12, 5);
    light.position.set(x, 5.25, 2.8);
    group.add(light);
  }

  // Indoor olive tree.
  cylinder(group, 0.35, 0.46, 0.72, [7.1, 0.36, -4.7], stone);
  cylinder(group, 0.11, 0.16, 3.8, [7.1, 2.35, -4.7], oak, 16);
  for (const p of [[6.6, 4.25, -4.6], [7.5, 4.6, -4.8], [7.05, 5.0, -4.7], [7.8, 3.9, -4.65]] as const) {
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 1), green);
    crown.position.set(...p);
    crown.castShadow = true;
    group.add(crown);
  }

  // Woven rattan bin, distinct from level one.
  const bin = new THREE.Group();
  bin.name = "bin";
  bin.position.set(0, 0, -4.5);
  const weave = new THREE.MeshStandardMaterial({ color: 0x9c6a3e, wireframe: true, roughness: 0.9 });
  cylinder(bin, 0.7, 0.48, 0.82, [0, 0.41, 0], weave, 14);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.07, 10, 42), oak);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.83;
  rim.castShadow = true;
  bin.add(rim);
  group.add(bin);

  const sun = new THREE.DirectionalLight(0xffe6bf, 4.4);
  sun.position.set(-6, 9, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  group.add(sun);
}

function createPaperBall() {
  const geometry = new THREE.IcosahedronGeometry(0.16, 2);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const scale = 0.9 + Math.sin(i * 17.31) * 0.12;
    positions.setXYZ(i, x * scale, y * scale, z * scale);
  }
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ color: 0xeee9df, roughness: 0.96, flatShading: true });
  const ball = new THREE.Mesh(geometry, material);
  ball.castShadow = true;
  return ball;
}

export default function TrashketballGame() {
  const mountRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef({
    aimX: 0,
    aimY: 0,
    power: 1,
    charging: false,
    chargeStarted: 0,
    canThrow: true,
    level: 0,
    balls: [] as { mesh: THREE.Mesh; velocity: THREE.Vector3; scored: boolean; age: number }[],
    launch: new THREE.Vector3(0, 1.42, 5.1),
  });
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [level, setLevel] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const [power, setPower] = useState(100);
  const [feedback, setFeedback] = useState("Center your aim");
  const [soundOn, setSoundOn] = useState(true);
  const audioRef = useRef<AudioContext | null>(null);

  const tone = useCallback((success: boolean) => {
    if (!soundOn) return;
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = audioRef.current || new AudioCtx();
    audioRef.current = ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = success ? "sine" : "triangle";
    osc.frequency.setValueAtTime(success ? 520 : 130, ctx.currentTime);
    if (success) osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.045, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }, [soundOn]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(level === 0 ? 0xbec9b9 : 0x9dd7e2);
    scene.fog = new THREE.Fog(level === 0 ? 0xbec9b9 : 0xc9e3df, 16, 40);
    const camera = new THREE.PerspectiveCamera(52, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 1.72, 7.2);
    camera.lookAt(0, 1.15, -2.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = level === 0 ? 1.05 : 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(level === 0 ? 0xe8ffe8 : 0xe8f7ff, level === 0 ? 0x32483f : 0x8b684e, level === 0 ? 2.4 : 2.8);
    scene.add(hemi);
    const world = new THREE.Group();
    if (level === 0) addOffice(world); else addBeachHouse(world);
    scene.add(world);

    const startBall = createPaperBall();
    startBall.position.copy(gameRef.current.launch);
    scene.add(startBall);

    const trajectoryMaterial = new THREE.MeshBasicMaterial({ color: level === 0 ? 0xf1ffba : 0xff6b4a, transparent: true, opacity: 0.82 });
    const dots: THREE.Mesh[] = [];
    for (let i = 0; i < 24; i++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(i % 4 === 0 ? 0.045 : 0.028, 8, 8), trajectoryMaterial);
      scene.add(dot);
      dots.push(dot);
    }

    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
    const scoreRing = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.035, 8, 48), ringMaterial);
    scoreRing.rotation.x = Math.PI / 2;
    scoreRing.position.set(0, 1.0, -4.5);
    scene.add(scoreRing);

    gameRef.current.level = level;
    gameRef.current.balls = [];
    gameRef.current.canThrow = true;
    const clock = new THREE.Clock();
    let frame = 0;
    let hitPulse = 0;

    const velocityForAim = (powerValue: number) => {
      const g = gameRef.current;
      return new THREE.Vector3(g.aimX * 1.3, 5.88 + g.aimY * 0.92, -7.5).multiplyScalar(powerValue);
    };

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.032);
      const g = gameRef.current;

      if (g.charging) {
        const elapsed = (performance.now() - g.chargeStarted) / 1000;
        g.power = 0.985 + (Math.sin(Math.min(elapsed / 1.25, 1) * Math.PI - Math.PI / 2) + 1) * 0.0525;
        setPower(Math.round(g.power * 100));
      }

      const previewVelocity = velocityForAim(g.power);
      for (let i = 0; i < dots.length; i++) {
        const t = (i + 1) * 0.055;
        dots[i].position.copy(g.launch).addScaledVector(previewVelocity, t);
        dots[i].position.y -= 4.9 * t * t;
        dots[i].visible = phase === "playing" && g.canThrow;
      }

      startBall.visible = phase === "playing" && g.canThrow;
      if (startBall.visible) {
        startBall.position.copy(g.launch);
        startBall.rotation.x += dt * 0.8;
        startBall.rotation.z += dt * 0.45;
      }

      for (let i = g.balls.length - 1; i >= 0; i--) {
        const ball = g.balls[i];
        ball.age += dt;
        const previousY = ball.mesh.position.y;
        ball.velocity.y -= 9.8 * dt;
        ball.mesh.position.addScaledVector(ball.velocity, dt);
        ball.mesh.rotation.x += ball.velocity.z * dt * 0.9;
        ball.mesh.rotation.z += ball.velocity.x * dt * 1.1 + dt;

        const bx = ball.mesh.position.x;
        const bz = ball.mesh.position.z + 4.5;
        const rimHeight = level === 0 ? 0.92 : 0.83;
        const radius = level === 0 ? 0.55 : 0.6;
        const radial = Math.sqrt(bx * bx + bz * bz);
        if (!ball.scored && previousY > rimHeight && ball.mesh.position.y <= rimHeight && radial < radius && ball.velocity.y < 0) {
          ball.scored = true;
          ball.velocity.multiplyScalar(0.18);
          hitPulse = 1;
          setFeedback("Clean shot  +10");
          tone(true);
          setScores((current) => {
            const next = [...current];
            next[level] = Math.min(100, next[level] + 10);
            if (next[level] >= 100) {
              window.setTimeout(() => setPhase(level === 0 ? "levelComplete" : "finished"), 800);
            }
            return next;
          });
        }

        if (ball.mesh.position.y < 0.16) {
          ball.mesh.position.y = 0.16;
          if (Math.abs(ball.velocity.y) > 0.8) {
            ball.velocity.y *= -0.34;
            ball.velocity.x *= 0.72;
            ball.velocity.z *= 0.72;
          } else {
            ball.velocity.set(0, 0, 0);
          }
          if (!ball.scored && ball.age > 0.7) setFeedback("Close. Recalibrate.");
        }
        if (ball.age > 4.5) {
          scene.remove(ball.mesh);
          ball.mesh.geometry.dispose();
          (ball.mesh.material as THREE.Material).dispose();
          g.balls.splice(i, 1);
        }
      }

      if (hitPulse > 0) {
        hitPulse = Math.max(0, hitPulse - dt * 1.8);
        ringMaterial.opacity = hitPulse * 0.9;
        scoreRing.scale.setScalar(1 + (1 - hitPulse) * 0.9);
      }

      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    const updateAim = (event: PointerEvent) => {
      if (gameRef.current.charging || phase !== "playing") return;
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      gameRef.current.aimX = THREE.MathUtils.clamp(x * 0.9, -0.9, 0.9);
      gameRef.current.aimY = THREE.MathUtils.clamp(y * 0.9, -0.75, 0.75);
      setFeedback(Math.abs(x) < 0.15 && Math.abs(y) < 0.18 ? "Trajectory locked" : "Fine-tune your aim");
    };

    const beginCharge = (event?: PointerEvent) => {
      if (event && event.button !== 0) return;
      const g = gameRef.current;
      if (phase !== "playing" || !g.canThrow) return;
      g.charging = true;
      g.chargeStarted = performance.now();
      setFeedback("Charging throw…");
    };

    const releaseThrow = () => {
      const g = gameRef.current;
      if (!g.charging || !g.canThrow || phase !== "playing") return;
      g.charging = false;
      g.canThrow = false;
      const ball = createPaperBall();
      ball.position.copy(g.launch);
      scene.add(ball);
      g.balls.push({ mesh: ball, velocity: velocityForAim(g.power), scored: false, age: 0 });
      setFeedback("Paper in flight");
      window.setTimeout(() => {
        g.canThrow = true;
        g.power = 1;
        setPower(100);
      }, 900);
    };

    const keyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && !event.repeat) {
        event.preventDefault();
        beginCharge();
      }
      const step = event.shiftKey ? 0.08 : 0.035;
      if (event.key === "ArrowLeft") g.aimX = Math.max(-0.9, g.aimX - step);
      if (event.key === "ArrowRight") g.aimX = Math.min(0.9, g.aimX + step);
      if (event.key === "ArrowUp") g.aimY = Math.min(0.75, g.aimY + step);
      if (event.key === "ArrowDown") g.aimY = Math.max(-0.75, g.aimY - step);
    };
    const keyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") releaseThrow();
    };

    renderer.domElement.addEventListener("pointermove", updateAim);
    renderer.domElement.addEventListener("pointerdown", beginCharge);
    window.addEventListener("pointerup", releaseThrow);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointermove", updateAim);
      renderer.domElement.removeEventListener("pointerdown", beginCharge);
      window.removeEventListener("pointerup", releaseThrow);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((m) => m.dispose());
        }
      });
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [level, phase, tone]);

  const startGame = () => {
    setScores([0, 0]);
    setLevel(0);
    gameRef.current.level = 0;
    setPhase("playing");
    setFeedback("Center your aim");
  };

  const continueLevel = () => {
    setLevel(1);
    gameRef.current.level = 1;
    setPhase("playing");
    setFeedback("New room. New bin.");
  };

  const retry = () => {
    setScores([0, 0]);
    setLevel(0);
    gameRef.current.level = 0;
    setPhase("playing");
    setFeedback("Center your aim");
  };

  const current = LEVELS[level];

  return (
    <main className={`game-shell level-${level + 1}`}>
      <div className="scene" ref={mountRef} aria-label={`3D trashketball court: ${current.kicker}`} />
      <div className="grain" />

      <header className="topbar">
        <div className="brand" aria-label="Trashketball">
          <span className="brand-mark">T/B</span>
          <span className="brand-name">Trashketball</span>
        </div>
        <div className="level-pill">
          <span>Level {current.number}</span>
          <i />
          <strong>{current.kicker}</strong>
        </div>
        <button className="sound-button" onClick={() => setSoundOn((s) => !s)} aria-label={soundOn ? "Mute sound" : "Enable sound"}>
          <span className={soundOn ? "sound-waves on" : "sound-waves"}>)))</span>
        </button>
      </header>

      {phase === "playing" && (
        <>
          <section className="score-card" aria-live="polite">
            <div className="score-eyebrow">Score</div>
            <div className="score-value"><strong>{scores[level]}</strong><span>/ 100</span></div>
            <div className="score-track"><i style={{ width: `${scores[level]}%` }} /></div>
            <div className="score-meta"><span>10 pts / shot</span><span>{10 - scores[level] / 10} to go</span></div>
          </section>

          <div className="crosshair" aria-hidden="true"><i /><b /><span /></div>

          <section className="throw-panel">
            <div className="status-line"><i />{feedback}</div>
            <div className="power-row">
              <span>Power</span>
              <div className="power-track"><i style={{ width: `${Math.min(100, power)}%` }} /></div>
              <strong>{power}%</strong>
            </div>
            <div className="instruction"><span className="mouse-icon" />Hold to charge <i>·</i> release to throw</div>
            <div className="keyboard-hint">Keyboard: arrows to aim · space to shoot</div>
          </section>

          <aside className="room-note">
            <span>{current.location}</span>
            <strong>{current.bin} target</strong>
          </aside>
        </>
      )}

      {phase === "intro" && (
        <section className="modal intro-modal">
          <div className="modal-index">01—02</div>
          <p className="modal-kicker">Two worlds. One bin.</p>
          <h1>Make the<br /><em>paperwork</em> count.</h1>
          <p className="modal-copy">Read the arc. Hold your nerve. Land ten clean shots to leave the severed floor—then trade fluorescent lights for an ocean view.</p>
          <button onClick={startGame} className="primary-button">Clock in <span>↗</span></button>
          <div className="modal-foot"><span>Physics-based throws</span><span>2 cinematic levels</span><span>Built in Three.js</span></div>
        </section>
      )}

      {phase === "levelComplete" && (
        <section className="modal completion-modal">
          <div className="completion-orbit"><span>100</span></div>
          <p className="modal-kicker">Quarterly target met</p>
          <h2>Your work here<br />is <em>complete.</em></h2>
          <p className="modal-copy">The elevator is waiting. Next stop: sea air, good furniture, and a less forgiving basket.</p>
          <button onClick={continueLevel} className="primary-button">Take the elevator <span>↓</span></button>
        </section>
      )}

      {phase === "finished" && (
        <section className="modal completion-modal final-modal">
          <div className="completion-orbit"><span>200</span></div>
          <p className="modal-kicker">Perfect checkout</p>
          <h2>Nothing but<br /><em>net.</em></h2>
          <p className="modal-copy">Twenty paper balls. Two bins. One impeccably tidy pair of rooms.</p>
          <button onClick={retry} className="primary-button">Play again <span>↻</span></button>
        </section>
      )}
    </main>
  );
}
