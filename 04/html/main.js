import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ─── Slide Navigation ───
const slides = document.querySelectorAll('.slide');
let current = 0;

function goTo(index) {
  if (index < 0 || index >= slides.length) return;
  slides[current].classList.remove('active');
  current = index;
  slides[current].classList.add('active');
  document.getElementById('currentSlide').textContent = current + 1;
  if (current === 2) resizeCanvas();
  if (current === 3) resizeSlide4();
  if (current === 4) resizeSlide5();
  if (current === 7) resizeSlide8();
  if (current === 8) resizeSlide9();
  if (current === 10) resizeSlide11();
  if (current === 12) resizeSlide13();
  if (current === 13) resizeSlide14();
  if (current === 15) resizeSlide16();
  if (current === 16) resizeSlide17();
  if (current === 19) resizeSlide20();
  if (current === 22) { resizeSlide23(); preloadPianoSamples(); }
  if (current === 24) resizeSlide25();
  if (current === 26) { resizeSlide28(); fsStopAll(); fsActiveHarmonics = 0; updateFsTable(); }
  if (current === 27) resizeSlide27();
  if (current === 28) resizeSlide29();
  if (current === 30) resizeSlide31();
  if (current === 31) resizeSlide32();
  if (current === 32) resizeSlide33();
  if (current === 33) { resizeSlide34(); drawSlide34(); }
  if (current === 34) resizeSlide35();
  if (current === 35) resizeSlide36();
  if (current === 36) resizeSlide37();
  if (current === 37) resizeSlide38();
  if (current === 38) { resizeSlide39(); phInitPhases(); }
  if (current === 39) resizeSlide40();
  if (current === 41) resizeSlide42();
  if (current === 42) resizeSlide43();
  if (current === 43) resizeSlide44();
  if (current === 44) resizeSlide45();
  if (current === 45) resizeSlide46();
  if (current === 46) resizeSlide47();
  if (current === 47) resizeSlide48();
  if (current === 48) resizeSlide49();
  if (current === 53) resizeSlide54();
  if (current === 54) resizeSlide55();
  if (current === 55) resizeSlide56();
  if (current === 56) resizeSlide57();
  if (current === 57) resizeSlide58();
  if (current === 58) resizeSlide59();
  if (current === 59) resizeSlide60();
  if (current === 60) resizeSlide61();
  if (current === 61) resizeSlide62();
  if (current === 62) resizeSlide63();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(current + 1);
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goTo(current - 1);
});

// ─── Three.js 100x100x100 Point Cloud ───
const canvas = document.getElementById('pointCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setClearColor(0xffffff, 1);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 10000);
camera.position.set(350, 250, 350);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 30x30x30 point grid
const COUNT = 30;
const TOTAL = COUNT * COUNT * COUNT;
const SPACING = 10;
const halfSize = (COUNT - 1) * SPACING / 2;

// Store rest positions and current positions
const restPositions = new Float32Array(TOTAL * 3);
const currentPositions = new Float32Array(TOTAL * 3);
const distances = new Float32Array(TOTAL); // distance from center

let idx = 0;
for (let x = 0; x < COUNT; x++) {
  for (let y = 0; y < COUNT; y++) {
    for (let z = 0; z < COUNT; z++) {
      const px = x * SPACING - halfSize;
      const py = y * SPACING - halfSize;
      const pz = z * SPACING - halfSize;
      restPositions[idx * 3]     = px;
      restPositions[idx * 3 + 1] = py;
      restPositions[idx * 3 + 2] = pz;
      currentPositions[idx * 3]     = px;
      currentPositions[idx * 3 + 1] = py;
      currentPositions[idx * 3 + 2] = pz;
      distances[idx] = Math.sqrt(px * px + py * py + pz * pz);
      idx++;
    }
  }
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));

const material = new THREE.PointsMaterial({
  size: 2.0,
  sizeAttenuation: true,
  color: 0x000000,
});

const points = new THREE.Points(geometry, material);
scene.add(points);

// Wave state
let waveActive = false;
let waveTime = 0;
const WAVE_SPEED = 150;   // how fast the wavefront expands
const WAVE_WIDTH = 40;    // thickness of the wave pulse
const WAVE_STRENGTH = 15; // displacement amount
const MAX_RADIUS = halfSize * 2.5;

const waveBtn = document.getElementById('waveBtn');
waveBtn.addEventListener('click', () => {
  waveActive = true;
  waveTime = 0;
});

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  renderer.setSize(rect.width, rect.height);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resizeCanvas);

let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  if (waveActive) {
    waveTime += dt;
    const waveRadius = waveTime * WAVE_SPEED;

    const posAttr = geometry.getAttribute('position');
    for (let i = 0; i < TOTAL; i++) {
      const rx = restPositions[i * 3];
      const ry = restPositions[i * 3 + 1];
      const rz = restPositions[i * 3 + 2];
      const dist = distances[i];

      // How far this point is from the current wavefront
      const diff = dist - waveRadius;
      // Gaussian-like pulse
      const pulse = Math.exp(-(diff * diff) / (2 * WAVE_WIDTH * WAVE_WIDTH));

      if (dist > 0.01) {
        // Push outward along radial direction
        const nx = rx / dist;
        const ny = ry / dist;
        const nz = rz / dist;
        posAttr.setXYZ(i,
          rx + nx * pulse * WAVE_STRENGTH,
          ry + ny * pulse * WAVE_STRENGTH,
          rz + nz * pulse * WAVE_STRENGTH
        );
      }
    }
    posAttr.needsUpdate = true;

    // Reset after wave passes all points
    if (waveRadius > MAX_RADIUS) {
      waveActive = false;
      // Snap back to rest
      for (let i = 0; i < TOTAL; i++) {
        const posAttr2 = geometry.getAttribute('position');
        posAttr2.setXYZ(i, restPositions[i*3], restPositions[i*3+1], restPositions[i*3+2]);
      }
      geometry.getAttribute('position').needsUpdate = true;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

// ─── Slide 4: Longitudinal & Transverse Wave ───
const s4Freq = document.getElementById('s4Freq');
const s4Amp = document.getElementById('s4Amp');
const s4FreqVal = document.getElementById('s4FreqVal');
const s4AmpVal = document.getElementById('s4AmpVal');

s4Freq.addEventListener('input', () => { s4FreqVal.textContent = s4Freq.value; });
s4Amp.addEventListener('input', () => { s4AmpVal.textContent = parseFloat(s4Amp.value).toFixed(1); });

// --- Longitudinal wave ---
const longCanvas = document.getElementById('longCanvas');
const longRenderer = new THREE.WebGLRenderer({ canvas: longCanvas, antialias: true });
longRenderer.setClearColor(0xffffff, 1);
longRenderer.setPixelRatio(window.devicePixelRatio);

const longScene = new THREE.Scene();
const longCamera = new THREE.OrthographicCamera(-1, 1, 0.5, -0.5, 0.1, 10);
longCamera.position.z = 1;

const LONG_ROWS = 7;
const LONG_COLS = 60;
const LONG_TOTAL = LONG_ROWS * LONG_COLS;
const longRest = new Float32Array(LONG_TOTAL * 3);
const longPos = new Float32Array(LONG_TOTAL * 3);

for (let r = 0; r < LONG_ROWS; r++) {
  for (let c = 0; c < LONG_COLS; c++) {
    const i = r * LONG_COLS + c;
    const x = (c / (LONG_COLS - 1)) * 2 - 1;
    const y = (r / (LONG_ROWS - 1)) * 0.6 - 0.3;
    longRest[i * 3] = x;
    longRest[i * 3 + 1] = y;
    longRest[i * 3 + 2] = 0;
    longPos[i * 3] = x;
    longPos[i * 3 + 1] = y;
    longPos[i * 3 + 2] = 0;
  }
}

const longGeo = new THREE.BufferGeometry();
longGeo.setAttribute('position', new THREE.BufferAttribute(longPos, 3));
const longMat = new THREE.PointsMaterial({ size: 6, sizeAttenuation: false, color: 0x000000 });
longScene.add(new THREE.Points(longGeo, longMat));

// --- Transverse wave ---
const transCanvas = document.getElementById('transCanvas');
const transRenderer = new THREE.WebGLRenderer({ canvas: transCanvas, antialias: true });
transRenderer.setClearColor(0xffffff, 1);
transRenderer.setPixelRatio(window.devicePixelRatio);

const transScene = new THREE.Scene();
const transCamera = new THREE.OrthographicCamera(-1, 1, 0.5, -0.5, 0.1, 10);
transCamera.position.z = 1;

const TRANS_ROWS = 7;
const TRANS_COLS = 60;
const TRANS_TOTAL = TRANS_ROWS * TRANS_COLS;
const transRest = new Float32Array(TRANS_TOTAL * 3);
const transPos = new Float32Array(TRANS_TOTAL * 3);

for (let r = 0; r < TRANS_ROWS; r++) {
  for (let c = 0; c < TRANS_COLS; c++) {
    const i = r * TRANS_COLS + c;
    const x = (c / (TRANS_COLS - 1)) * 2 - 1;
    const y = (r / (TRANS_ROWS - 1)) * 0.6 - 0.3;
    transRest[i * 3] = x;
    transRest[i * 3 + 1] = y;
    transRest[i * 3 + 2] = 0;
    transPos[i * 3] = x;
    transPos[i * 3 + 1] = y;
    transPos[i * 3 + 2] = 0;
  }
}

const transGeo = new THREE.BufferGeometry();
transGeo.setAttribute('position', new THREE.BufferAttribute(transPos, 3));
const transMat = new THREE.PointsMaterial({ size: 6, sizeAttenuation: false, color: 0x000000 });
transScene.add(new THREE.Points(transGeo, transMat));

function resizeSlide4() {
  const lr = longCanvas.parentElement.getBoundingClientRect();
  if (lr.width > 0) {
    longRenderer.setSize(lr.width, lr.height);
  }
  const tr = transCanvas.parentElement.getBoundingClientRect();
  if (tr.width > 0) {
    transRenderer.setSize(tr.width, tr.height);
  }
}
window.addEventListener('resize', () => { if (current === 3) resizeSlide4(); });

function animateSlide4() {
  requestAnimationFrame(animateSlide4);
  if (current !== 3) return;

  const t = performance.now() / 1000;
  const freq = parseFloat(s4Freq.value);
  const amp = parseFloat(s4Amp.value);

  // Longitudinal: dots displaced along X (compression/rarefaction)
  const lPos = longGeo.getAttribute('position');
  for (let r = 0; r < LONG_ROWS; r++) {
    for (let c = 0; c < LONG_COLS; c++) {
      const i = r * LONG_COLS + c;
      const rx = longRest[i * 3];
      const ry = longRest[i * 3 + 1];
      const displacement = Math.sin(rx * Math.PI * freq * 2 - t * 4) * 0.06 * amp;
      lPos.setXYZ(i, rx + displacement, ry, 0);
    }
  }
  lPos.needsUpdate = true;
  longRenderer.render(longScene, longCamera);

  // Transverse: dots displaced along Y
  const tPos = transGeo.getAttribute('position');
  for (let r = 0; r < TRANS_ROWS; r++) {
    for (let c = 0; c < TRANS_COLS; c++) {
      const i = r * TRANS_COLS + c;
      const rx = transRest[i * 3];
      const ry = transRest[i * 3 + 1];
      const displacement = Math.sin(rx * Math.PI * freq * 2 - t * 4) * 0.06 * amp;
      tPos.setXYZ(i, rx, ry + displacement, 0);
    }
  }
  tPos.needsUpdate = true;
  transRenderer.render(transScene, transCamera);
}
animateSlide4();

// ─── Slide 5: Sine Wave 3D Point Cloud ───
const s5Freq = document.getElementById('s5Freq');
const s5Amp = document.getElementById('s5Amp');
const s5FreqVal = document.getElementById('s5FreqVal');
const s5AmpVal = document.getElementById('s5AmpVal');

s5Freq.addEventListener('input', () => { s5FreqVal.textContent = s5Freq.value; });
s5Amp.addEventListener('input', () => { s5AmpVal.textContent = parseFloat(s5Amp.value).toFixed(1); });

let s5WaveType = 'sine';
document.querySelectorAll('.s5-wave-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.s5-wave-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    s5WaveType = btn.dataset.type;
  });
});

function s5WaveFunc(phase) {
  const p = ((phase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  switch (s5WaveType) {
    case 'sine': return Math.sin(phase);
    case 'sawtooth': return (p / Math.PI) - 1;
    case 'square': return Math.sin(phase) >= 0 ? 1 : -1;
    case 'triangle': return 2 * Math.abs((p / Math.PI) - 1) - 1;
    default: return Math.sin(phase);
  }
}

const sineCanvas = document.getElementById('sineCanvas');
const sineRenderer = new THREE.WebGLRenderer({ canvas: sineCanvas, antialias: true });
sineRenderer.setClearColor(0xffffff, 1);
sineRenderer.setPixelRatio(window.devicePixelRatio);

const sineScene = new THREE.Scene();
const sineCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 10000);
sineCamera.position.set(350, 250, 350);
sineCamera.lookAt(0, 0, 0);

const sineControls = new OrbitControls(sineCamera, sineCanvas);
sineControls.enableDamping = true;
sineControls.dampingFactor = 0.05;

// 30x30x30 grid
const S5_COUNT = 30;
const S5_TOTAL = S5_COUNT * S5_COUNT * S5_COUNT;
const S5_SPACING = 10;
const s5Half = (S5_COUNT - 1) * S5_SPACING / 2;

const s5Rest = new Float32Array(S5_TOTAL * 3);
const s5Pos = new Float32Array(S5_TOTAL * 3);
const s5Dist = new Float32Array(S5_TOTAL);

let s5i = 0;
for (let x = 0; x < S5_COUNT; x++) {
  for (let y = 0; y < S5_COUNT; y++) {
    for (let z = 0; z < S5_COUNT; z++) {
      const px = x * S5_SPACING - s5Half;
      const py = y * S5_SPACING - s5Half;
      const pz = z * S5_SPACING - s5Half;
      s5Rest[s5i * 3]     = px;
      s5Rest[s5i * 3 + 1] = py;
      s5Rest[s5i * 3 + 2] = pz;
      s5Pos[s5i * 3]     = px;
      s5Pos[s5i * 3 + 1] = py;
      s5Pos[s5i * 3 + 2] = pz;
      s5Dist[s5i] = Math.sqrt(px * px + py * py + pz * pz);
      s5i++;
    }
  }
}

const s5Geo = new THREE.BufferGeometry();
s5Geo.setAttribute('position', new THREE.BufferAttribute(s5Pos, 3));

const s5Mat = new THREE.PointsMaterial({
  size: 2.0,
  sizeAttenuation: true,
  color: 0x000000,
});

sineScene.add(new THREE.Points(s5Geo, s5Mat));

function resizeSlide5() {
  const rect = sineCanvas.parentElement.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  sineRenderer.setSize(rect.width, rect.height);
  sineCamera.aspect = rect.width / rect.height;
  sineCamera.updateProjectionMatrix();
}
window.addEventListener('resize', () => { if (current === 4) resizeSlide5(); });

function animateSlide5() {
  requestAnimationFrame(animateSlide5);
  if (current !== 4) return;

  const t = performance.now() / 1000;
  const freq = parseFloat(s5Freq.value);
  const amp = parseFloat(s5Amp.value);

  const posAttr = s5Geo.getAttribute('position');
  for (let i = 0; i < S5_TOTAL; i++) {
    const rx = s5Rest[i * 3];
    const ry = s5Rest[i * 3 + 1];
    const rz = s5Rest[i * 3 + 2];
    const dist = s5Dist[i];

    if (dist > 0.01) {
      // Continuous sine wave radiating outward from center
      const attenuation = 30 / Math.max(dist, 1);
      const wave = Math.sin(dist * 0.05 * freq - t * 3) * amp * 2 * 8 * attenuation;
      const nx = rx / dist;
      const ny = ry / dist;
      const nz = rz / dist;
      posAttr.setXYZ(i,
        rx + nx * wave,
        ry + ny * wave,
        rz + nz * wave
      );
    }
  }
  posAttr.needsUpdate = true;

  sineControls.update();
  sineRenderer.render(sineScene, sineCamera);
}
animateSlide5();

// ─── Slides 8 & 9: Shared Molecular Simulation ───
function initMolPanel(canvasId, speedFactor, waveRelSpeed) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const NUM = 150;
  const RADIUS = 4;

  const molecules = [];
  for (let i = 0; i < NUM; i++) {
    molecules.push({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * speedFactor,
      vy: (Math.random() - 0.5) * speedFactor,
      pushX: 0,
    });
  }
  return { canvas, ctx, molecules, RADIUS, waveRelSpeed };
}

const molCold = initMolPanel('s9Cold', 0.008, 0.85);
const molHot  = initMolPanel('s9Hot',  0.06,  1.0);
const molPanels = [molCold, molHot];

// Pulse state
let s9PulseActive = false;
let s9PulseTime = 0;
const S9_PULSE_DUR = 6.0;

document.getElementById('s9PulseBtn').addEventListener('click', () => {
  s9PulseActive = true;
  s9PulseTime = 0;
  molPanels.forEach(p => p.molecules.forEach(m => { m.pushX = 0; }));
});

function resizeSlide8() {
  molPanels.forEach(p => {
    const rect = p.canvas.parentElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      p.canvas.width = rect.width * devicePixelRatio;
      p.canvas.height = rect.height * devicePixelRatio;
      p.canvas.style.width = rect.width + 'px';
      p.canvas.style.height = rect.height + 'px';
    }
  });
}

window.addEventListener('resize', () => {
  if (current === 7) resizeSlide8();
});

let molLastTime = performance.now();

function drawMolPanels(panels, withPulse) {
  const now = performance.now();
  const dt = (now - molLastTime) / 1000;

  if (withPulse && s9PulseActive) {
    s9PulseTime += dt;
    if (s9PulseTime > S9_PULSE_DUR) s9PulseActive = false;
  }

  panels.forEach(panel => {
    const { ctx, canvas, molecules, RADIUS, waveRelSpeed } = panel;
    const w = canvas.width;
    const h = canvas.height;
    if (w === 0 || h === 0) return;
    const dpr = devicePixelRatio;
    const r = RADIUS * dpr;

    ctx.clearRect(0, 0, w, h);

    // Wavefront (slide 9 pulse only)
    const frontNorm = (withPulse && s9PulseActive)
      ? (s9PulseTime / S9_PULSE_DUR) * waveRelSpeed * 1.1
      : -1;

    // Update
    for (let i = 0; i < molecules.length; i++) {
      const m = molecules[i];

      m.x += m.vx;
      m.y += m.vy;

      // Pulse push (stronger for hot panel to overcome fast molecules)
      if (frontNorm > 0) {
        const dist = m.x - frontNorm;
        const pulseW = 0.05 + waveRelSpeed * 0.01;
        const pulse = Math.exp(-(dist * dist) / (2 * pulseW * pulseW));
        if (pulse > 0.01) {
          const push = pulse * (waveRelSpeed > 0.9 ? 0.04 : 0.012);
          m.x += push;
          m.pushX += push;
        }
      }

      // Restore from push
      if (m.pushX > 0.0001) {
        const restore = m.pushX * (waveRelSpeed > 0.9 ? 0.015 : 0.02);
        m.x -= restore;
        m.pushX -= restore;
      }

      // Bounce
      if (m.x < 0) { m.x = 0; m.vx *= -1; }
      if (m.x > 1) { m.x = 1; m.vx *= -1; }
      if (m.y < 0) { m.y = 0; m.vy *= -1; }
      if (m.y > 1) { m.y = 1; m.vy *= -1; }

      // Collisions
      for (let j = i + 1; j < molecules.length; j++) {
        const o = molecules[j];
        const dx = (m.x - o.x) * w;
        const dy = (m.y - o.y) * h;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < r * 2 && d > 0) {
          const tmpVx = m.vx; const tmpVy = m.vy;
          m.vx = o.vx; m.vy = o.vy;
          o.vx = tmpVx; o.vy = tmpVy;
          const overlap = (r * 2 - d) / 2;
          const nx = dx / d; const ny = dy / d;
          m.x += (nx * overlap) / w;
          m.y += (ny * overlap) / h;
          o.x -= (nx * overlap) / w;
          o.y -= (ny * overlap) / h;
        }
      }
    }

    // Draw
    for (let i = 0; i < molecules.length; i++) {
      const m = molecules[i];
      const px = m.x * w;
      const py = m.y * h;

      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
    }

    // Wavefront line (slide 9 only)
    if (frontNorm > 0.01 && frontNorm < 1.1) {
      const fx = frontNorm * w;
      ctx.beginPath();
      ctx.moveTo(fx, 0);
      ctx.lineTo(fx, h);
      ctx.strokeStyle = 'rgba(200, 0, 0, 0.35)';
      ctx.lineWidth = 3 * dpr;
      ctx.setLineDash([8 * dpr, 6 * dpr]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });
}

function animateMol() {
  requestAnimationFrame(animateMol);
  if (current === 7) {
    drawMolPanels(molPanels, true);
  }
  molLastTime = performance.now();
}

setTimeout(() => { resizeSlide8(); }, 100);
animateMol();

// ─── Slide 9: It's Not Wind (Speaker + compression wave) ───
const spkCanvas = document.getElementById('speakerCanvas');
const spkCtx = spkCanvas.getContext('2d');

// Color zones: divide horizontal space into bands, each band gets a distinct color
const ZONE_COLORS = [
  '#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#d35400',
  '#16a085', '#e74c3c', '#2c3e50', '#f39c12', '#1abc9c',
  '#9b59b6', '#e67e22',
];
const ZONE_COUNT = ZONE_COLORS.length;

// Particles between speaker and hand
const SPK_NUM = 400;
const spkParticles = [];
const spkXStart = 0.12;
const spkXEnd = 0.88;
const spkXRange = spkXEnd - spkXStart;

for (let i = 0; i < SPK_NUM; i++) {
  const rx = spkXStart + Math.random() * spkXRange;
  const ry = 0.15 + Math.random() * 0.7;
  // Assign zone based on restX position
  const zoneIdx = Math.floor(((rx - spkXStart) / spkXRange) * ZONE_COUNT);
  spkParticles.push({
    x: rx,
    y: ry,
    restX: rx,
    zone: Math.min(zoneIdx, ZONE_COUNT - 1),
  });
}

function resizeSlide9() {
  const rect = spkCanvas.parentElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    spkCanvas.width = rect.width * devicePixelRatio;
    spkCanvas.height = rect.height * devicePixelRatio;
    spkCanvas.style.width = rect.width + 'px';
    spkCanvas.style.height = rect.height + 'px';
  }
}
window.addEventListener('resize', () => { if (current === 8) resizeSlide9(); });

function animateSlide9() {
  requestAnimationFrame(animateSlide9);
  if (current !== 8) return;

  const w = spkCanvas.width;
  const h = spkCanvas.height;
  if (w === 0 || h === 0) return;
  const dpr = devicePixelRatio;
  const t = performance.now() / 1000;

  spkCtx.clearRect(0, 0, w, h);

  const freq = 1.0;
  const spkX = 0.07;

  // Draw speaker emoji (left side)
  const spkCenterX = spkX * w;
  const spkCenterY = h * 0.5;
  const emojiSize = Math.round(Math.min(w, h) * 0.12);

  spkCtx.font = `${emojiSize}px serif`;
  spkCtx.textAlign = 'center';
  spkCtx.textBaseline = 'middle';
  spkCtx.fillText('\uD83D\uDD08', spkCenterX, spkCenterY);

  // Draw hand emoji (right side)
  const handX = 0.92 * w;
  const handY = h * 0.5;

  spkCtx.font = `${emojiSize}px serif`;
  spkCtx.fillText('\u270B', handX, handY);

  // Update and draw particles
  const r = 3.5 * dpr;
  const waveLen = 0.2;

  for (let i = 0; i < SPK_NUM; i++) {
    const p = spkParticles[i];

    // Compression wave: displacement is longitudinal only
    const phase = (p.restX - spkX) / waveLen * Math.PI * 2 - t * Math.PI * 2 * freq;
    const displacement = Math.sin(phase) * 0.025;

    p.x = p.restX + displacement;

    const px = p.x * w;
    const py = p.y * h;

    spkCtx.beginPath();
    spkCtx.arc(px, py, r, 0, Math.PI * 2);
    spkCtx.fillStyle = ZONE_COLORS[p.zone];
    spkCtx.fill();
  }
}

setTimeout(() => { resizeSlide9(); }, 100);
animateSlide9();

// ─── Slide 11: Air is a Linear System ───
const airLinCanvas = document.getElementById('airLinear');
const airLinCtx = airLinCanvas.getContext('2d');
const airNlCanvas = document.getElementById('airNonlinear');
const airNlCtx = airNlCanvas.getContext('2d');

function resizeSlide11() {
  [airLinCanvas, airNlCanvas].forEach(c => {
    const rect = c.parentElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      c.width = rect.width * devicePixelRatio;
      c.height = rect.height * devicePixelRatio;
      c.style.width = rect.width + 'px';
      c.style.height = rect.height + 'px';
    }
  });
}
window.addEventListener('resize', () => { if (current === 10) resizeSlide11(); });

function drawAirPanel(ctx, w, h, t, isNonlinear) {
  const dpr = devicePixelRatio;
  ctx.clearRect(0, 0, w, h);

  const topY = h * 0.18;    // start of waveform area
  const rowH = h * 0.22;    // height per waveform row
  const gap = h * 0.04;
  const marginX = w * 0.06;
  const waveW = w - marginX * 2;

  const freq = 0.8;
  const guitarFreq = 2;  // lower freq
  const pianoFreq = 5;   // higher freq

  const labels = ['&#x1F3B8; Guitar', '&#x1F3B9; Piano', 'Combined'];
  const textLabels = ['\uD83C\uDFB8 Guitar', '\uD83C\uDFB9 Piano', 'Combined'];

  for (let row = 0; row < 3; row++) {
    const baseY = topY + row * (rowH + gap);
    const midY = baseY + rowH * 0.5;
    const amp = rowH * 0.38;

    // Center line
    ctx.beginPath();
    ctx.moveTo(marginX, midY);
    ctx.lineTo(marginX + waveW, midY);
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();

    // Label
    ctx.font = `bold ${Math.round(13 * dpr)}px 'Playfair Display', serif`;
    ctx.fillStyle = row === 2 ? '#000' : '#888';
    ctx.textAlign = 'left';
    ctx.fillText(textLabels[row], marginX, baseY - 4 * dpr);

    // Draw waveform
    ctx.beginPath();
    for (let px = 0; px < waveW; px++) {
      const x = px / waveW;
      let val;
      if (row === 0) {
        // Guitar: lower frequency
        val = Math.sin(x * Math.PI * 2 * guitarFreq - t * Math.PI * 2 * freq) * 0.8;
      } else if (row === 1) {
        // Piano: higher frequency
        val = Math.sin(x * Math.PI * 2 * pianoFreq - t * Math.PI * 2 * freq * 1.2) * 0.6;
      } else {
        // Combined
        let guitar = Math.sin(x * Math.PI * 2 * guitarFreq - t * Math.PI * 2 * freq) * 0.8;
        let piano = Math.sin(x * Math.PI * 2 * pianoFreq - t * Math.PI * 2 * freq * 1.2) * 0.6;
        val = guitar + piano;

        if (isNonlinear) {
          // Intermodulation distortion: adds product terms
          val = guitar + piano
            + 0.3 * guitar * piano  // intermod
            + 0.15 * Math.sin(x * Math.PI * 2 * (pianoFreq - guitarFreq) - t * 2)  // difference freq
            + 0.15 * Math.sin(x * Math.PI * 2 * (pianoFreq + guitarFreq) - t * 3); // sum freq
          // Also clip
          val = Math.max(-1.2, Math.min(1.2, val));
        }

        // Scale combined to fit
        val *= 0.65;
      }

      const py = midY - val * amp;
      if (px === 0) ctx.moveTo(marginX + px, py);
      else ctx.lineTo(marginX + px, py);
    }
    ctx.strokeStyle = row === 2 ? '#000' : '#555';
    ctx.lineWidth = (row === 2 ? 3 : 2) * dpr;
    ctx.stroke();
  }

  // Bottom annotation
  ctx.font = `bold ${Math.round(12 * dpr)}px 'Playfair Display', serif`;
  ctx.textAlign = 'center';
  if (isNonlinear) {
    ctx.fillStyle = 'rgba(200, 0, 0, 0.6)';
    ctx.fillText('New frequencies appear \u2192 Cannot separate', w * 0.5, topY + 3 * (rowH + gap) + 10 * dpr);
  } else {
    ctx.fillStyle = 'rgba(0, 120, 0, 0.6)';
    ctx.fillText('Patterns simply add \u2192 Ear can separate', w * 0.5, topY + 3 * (rowH + gap) + 10 * dpr);
  }
}

function animateSlide11() {
  requestAnimationFrame(animateSlide11);
  if (current !== 10) return;

  const t = performance.now() / 1000;
  if (airLinCanvas.width > 0) drawAirPanel(airLinCtx, airLinCanvas.width, airLinCanvas.height, t, false);
  if (airNlCanvas.width > 0) drawAirPanel(airNlCtx, airNlCanvas.width, airNlCanvas.height, t, true);
}

setTimeout(() => { resizeSlide11(); }, 100);
animateSlide11();

// ─── Slide 13: Linear vs Nonlinear Amp ───
const lnInCanvas = document.getElementById('lnInput');
const lnInCtx = lnInCanvas.getContext('2d');
const lnLinCanvas = document.getElementById('lnLinear');
const lnLinCtx = lnLinCanvas.getContext('2d');
const lnNlCanvas = document.getElementById('lnNonlinear');
const lnNlCtx = lnNlCanvas.getContext('2d');

function resizeSlide13() {
  [lnInCanvas, lnLinCanvas, lnNlCanvas].forEach(c => {
    const rect = c.parentElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      c.width = rect.width * devicePixelRatio;
      c.height = rect.height * devicePixelRatio;
      c.style.width = rect.width + 'px';
      c.style.height = rect.height + 'px';
    }
  });
}
window.addEventListener('resize', () => { if (current === 11) resizeSlide13(); });

function drawAmpWave(ctx, w, h, t, gain, clipMax, showClipLines) {
  const dpr = devicePixelRatio;
  const midY = h * 0.5;
  const baseAmp = h * 0.18; // small input amplitude
  const freq = 1.5;
  const cycles = 3;

  ctx.clearRect(0, 0, w, h);

  // Center line
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(w, midY);
  ctx.strokeStyle = '#e8e8e8';
  ctx.lineWidth = 1 * dpr;
  ctx.stroke();

  // Clipping threshold lines
  if (showClipLines && clipMax < 1.0) {
    const clipY = clipMax * baseAmp * gain;
    ctx.beginPath();
    ctx.moveTo(0, midY - clipY);
    ctx.lineTo(w, midY - clipY);
    ctx.moveTo(0, midY + clipY);
    ctx.lineTo(w, midY + clipY);
    ctx.strokeStyle = 'rgba(200, 0, 0, 0.3)';
    ctx.lineWidth = 2 * dpr;
    ctx.setLineDash([6 * dpr, 4 * dpr]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Ghost: original input sine (before gain) for reference
  if (gain > 1) {
    ctx.beginPath();
    for (let px = 0; px < w; px++) {
      const x = px / w;
      const val = Math.sin(x * Math.PI * 2 * cycles - t * Math.PI * 2 * freq);
      const py = midY - val * baseAmp;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 2 * dpr;
    ctx.stroke();
  }

  // Output wave (gained, optionally clipped)
  ctx.beginPath();
  for (let px = 0; px < w; px++) {
    const x = px / w;
    let val = Math.sin(x * Math.PI * 2 * cycles - t * Math.PI * 2 * freq);
    val *= gain;
    if (clipMax < 1.0) val = Math.max(-clipMax * gain, Math.min(clipMax * gain, val));
    const py = midY - val * baseAmp;
    if (px === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3 * dpr;
  ctx.stroke();
}

function animateSlide13() {
  requestAnimationFrame(animateSlide13);
  if (current !== 12) return;

  const t = performance.now() / 1000;

  // Input: small sine, gain=1, no clip
  if (lnInCanvas.width > 0) {
    drawAmpWave(lnInCtx, lnInCanvas.width, lnInCanvas.height, t, 1, 1.0, false);
  }

  // Linear amp: gain=2, no clip (clean amplification)
  if (lnLinCanvas.width > 0) {
    drawAmpWave(lnLinCtx, lnLinCanvas.width, lnLinCanvas.height, t, 2, 1.0, false);
  }

  // Nonlinear amp: gain=2, clip at 0.7 of max (headroom exceeded)
  if (lnNlCanvas.width > 0) {
    drawAmpWave(lnNlCtx, lnNlCanvas.width, lnNlCanvas.height, t, 2, 0.7, true);
  }
}

setTimeout(() => { resizeSlide13(); }, 100);
animateSlide13();

// ─── Slide 14: Percussion Nonlinearity (Web Audio + FFT) ───
const tamCanvas = document.getElementById('tamCanvas');
const tamCtx = tamCanvas.getContext('2d');
const tamIntSlider = document.getElementById('tamIntensity');
const tamIntVal = document.getElementById('tamIntVal');

tamIntSlider.addEventListener('input', () => {
  tamIntVal.textContent = parseFloat(tamIntSlider.value).toFixed(2);
});

let audioCtx = null;
let tamAnalyser = null;
let tamFreqData = null;

function ensureAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    tamAnalyser = audioCtx.createAnalyser();
    tamAnalyser.fftSize = 2048;
    tamAnalyser.smoothingTimeConstant = 0.8;
    tamAnalyser.connect(audioCtx.destination);
    tamFreqData = new Uint8Array(tamAnalyser.frequencyBinCount);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function createNoise(duration) {
  const sr = audioCtx.sampleRate;
  const len = sr * duration;
  const buf = audioCtx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buf;
}

function playTamTam() {
  ensureAudioCtx();
  const intensity = parseFloat(tamIntSlider.value);
  const now = audioCtx.currentTime;
  const dur = 2.5;

  // Noise source
  const noise = audioCtx.createBufferSource();
  noise.buffer = createNoise(dur + 1);

  // Low-pass filter: soft = very low cutoff, hard = cutoff opens up
  const lp = audioCtx.createBiquadFilter();
  lp.type = 'lowpass';
  const baseCutoff = 150 + intensity * 80;
  lp.frequency.setValueAtTime(baseCutoff, now);

  // Nonlinear behavior: at high intensity, high freqs burst in
  if (intensity > 0.4) {
    const burstCutoff = baseCutoff + (intensity - 0.4) * 8000;
    lp.frequency.setValueAtTime(burstCutoff, now);
    lp.frequency.exponentialRampToValueAtTime(baseCutoff, now + 0.8);
  }

  lp.Q.value = 1.5;

  // Resonant body frequencies (tam-tam partials)
  const bodyOsc1 = audioCtx.createOscillator();
  bodyOsc1.frequency.value = 80 + intensity * 20;
  bodyOsc1.type = 'sine';
  const bodyGain1 = audioCtx.createGain();
  bodyGain1.gain.setValueAtTime(0.3 * intensity, now);
  bodyGain1.gain.exponentialRampToValueAtTime(0.001, now + dur);

  const bodyOsc2 = audioCtx.createOscillator();
  bodyOsc2.frequency.value = 135 + intensity * 30;
  bodyOsc2.type = 'sine';
  const bodyGain2 = audioCtx.createGain();
  bodyGain2.gain.setValueAtTime(0.2 * intensity, now);
  bodyGain2.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.7);

  // Noise envelope
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.4 * intensity, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

  // High freq burst at hard hits
  const hiGain = audioCtx.createGain();
  const hiBurst = intensity > 0.4 ? (intensity - 0.4) * 1.5 : 0;
  hiGain.gain.setValueAtTime(hiBurst, now);
  hiGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  const hp = audioCtx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 2000;

  const hiNoise = audioCtx.createBufferSource();
  hiNoise.buffer = createNoise(dur + 1);

  // Connect
  noise.connect(lp).connect(noiseGain).connect(tamAnalyser);
  bodyOsc1.connect(bodyGain1).connect(tamAnalyser);
  bodyOsc2.connect(bodyGain2).connect(tamAnalyser);
  hiNoise.connect(hp).connect(hiGain).connect(tamAnalyser);

  noise.start(now);
  noise.stop(now + dur);
  bodyOsc1.start(now);
  bodyOsc1.stop(now + dur);
  bodyOsc2.start(now);
  bodyOsc2.stop(now + dur);
  hiNoise.start(now);
  hiNoise.stop(now + dur);
}

document.getElementById('tamBtnTam').addEventListener('click', playTamTam);

function resizeSlide14() {
  const rect = tamCanvas.parentElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    tamCanvas.width = rect.width * devicePixelRatio;
    tamCanvas.height = rect.height * devicePixelRatio;
    tamCanvas.style.width = rect.width + 'px';
    tamCanvas.style.height = rect.height + 'px';
  }
}
window.addEventListener('resize', () => { if (current === 13) resizeSlide14(); });

function animateSlide14() {
  requestAnimationFrame(animateSlide14);
  if (current !== 13) return;

  const w = tamCanvas.width;
  const h = tamCanvas.height;
  if (w === 0 || h === 0) return;
  const dpr = devicePixelRatio;

  tamCtx.clearRect(0, 0, w, h);

  if (!tamAnalyser || !tamFreqData) {
    // Draw empty state
    tamCtx.font = `${Math.round(14 * dpr)}px 'Playfair Display', serif`;
    tamCtx.fillStyle = '#ccc';
    tamCtx.textAlign = 'center';
    tamCtx.fillText('Press a button to hear and see the spectrum', w * 0.5, h * 0.5);
    return;
  }

  tamAnalyser.getByteFrequencyData(tamFreqData);

  const barCount = 128;
  const barW = w / barCount;
  const maxFreq = audioCtx.sampleRate / 2;

  for (let i = 0; i < barCount; i++) {
    // Map bar index to FFT bin (logarithmic scale for better visualization)
    const logMin = Math.log10(20);
    const logMax = Math.log10(maxFreq);
    const logFreq = logMin + (i / barCount) * (logMax - logMin);
    const freq = Math.pow(10, logFreq);
    const bin = Math.round(freq / maxFreq * tamFreqData.length);
    const val = bin < tamFreqData.length ? tamFreqData[bin] : 0;

    const barH = (val / 255) * h * 0.85;

    tamCtx.fillStyle = `rgba(0, 0, 0, ${0.3 + (val / 255) * 0.7})`;
    tamCtx.fillRect(i * barW, h - barH, barW - 1 * dpr, barH);
  }

  // Frequency axis labels
  tamCtx.font = `${Math.round(10 * dpr)}px 'Playfair Display', serif`;
  tamCtx.fillStyle = '#aaa';
  tamCtx.textAlign = 'center';
  const freqLabels = [100, 500, 1000, 2000, 5000, 10000];
  freqLabels.forEach(f => {
    const logPos = (Math.log10(f) - Math.log10(20)) / (Math.log10(maxFreq) - Math.log10(20));
    const x = logPos * w;
    tamCtx.fillText(f >= 1000 ? (f / 1000) + 'k' : f + '', x, h - 4 * dpr);
  });

  // Label
  tamCtx.font = `${Math.round(11 * dpr)}px 'Playfair Display', serif`;
  tamCtx.fillStyle = '#aaa';
  tamCtx.textAlign = 'left';
  tamCtx.fillText('Frequency (Hz)', 8 * dpr, 14 * dpr);
}

setTimeout(() => { resizeSlide14(); }, 100);
animateSlide14();

// ─── Slide 16: Pendulum traces Sine Wave (3D, Fig 4.2) ───
const pendCanvasEl = document.getElementById('pendCanvas');
const pendRenderer = new THREE.WebGLRenderer({ canvas: pendCanvasEl, antialias: true });
pendRenderer.setClearColor(0xffffff, 1);
pendRenderer.setPixelRatio(window.devicePixelRatio);

const pendScene = new THREE.Scene();
const pendCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
pendCamera.position.set(12, 12, 8);
pendCamera.lookAt(0, 3, -8);

const pendControls = new OrbitControls(pendCamera, pendCanvasEl);
pendControls.enableDamping = true;
pendControls.dampingFactor = 0.05;
pendControls.target.set(0, 3, -8);

// Ambient + directional light
pendScene.add(new THREE.AmbientLight(0xffffff, 0.6));
const pendDirLight = new THREE.DirectionalLight(0xffffff, 0.8);
pendDirLight.position.set(5, 15, 10);
pendScene.add(pendDirLight);

// Pivot bar
const pivotGeo = new THREE.BoxGeometry(2, 0.2, 0.2);
const pivotMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const pivotMesh = new THREE.Mesh(pivotGeo, pivotMat);
pivotMesh.position.set(0, 10, 0);
pendScene.add(pivotMesh);

// Rope (line)
const ropeMat = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 2 });
const ropeGeo = new THREE.BufferGeometry();
const ropePositions = new Float32Array(6);
ropeGeo.setAttribute('position', new THREE.BufferAttribute(ropePositions, 3));
const ropeLine = new THREE.Line(ropeGeo, ropeMat);
pendScene.add(ropeLine);

// Bob
const bobGeo = new THREE.SphereGeometry(0.5, 32, 32);
const bobMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
const bobMesh = new THREE.Mesh(bobGeo, bobMat);
pendScene.add(bobMesh);

// Pen tip (small red sphere below bob)
const penGeo = new THREE.SphereGeometry(0.12, 16, 16);
const penMat = new THREE.MeshStandardMaterial({ color: 0xcc0000 });
const penMesh = new THREE.Mesh(penGeo, penMat);
pendScene.add(penMesh);

// Moving paper (plane) — extends in Z direction
const paperW = 10;  // width (X axis, covers pendulum swing)
const paperL = 30;  // length (Z axis, trace direction)
const paperGeo = new THREE.PlaneGeometry(paperW, paperL);
const paperMat = new THREE.MeshStandardMaterial({
  color: 0xfafafa,
  side: THREE.DoubleSide,
});
const paperMesh = new THREE.Mesh(paperGeo, paperMat);
paperMesh.rotation.x = -Math.PI / 2;
paperMesh.position.set(0, 0, -paperL * 0.4);
pendScene.add(paperMesh);

// Grid lines on paper (along Z)
const gridMat = new THREE.LineBasicMaterial({ color: 0xe0e0e0 });
for (let i = -Math.floor(paperL / 2); i <= 0; i += 2) {
  const g = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-paperW / 2, 0.01, i),
    new THREE.Vector3(paperW / 2, 0.01, i),
  ]);
  pendScene.add(new THREE.Line(g, gridMat));
}

// Sine trace line (drawn on the paper)
const TRACE_POINTS = 2000;
const tracePositions = new Float32Array(TRACE_POINTS * 3);
const traceGeo = new THREE.BufferGeometry();
traceGeo.setAttribute('position', new THREE.BufferAttribute(tracePositions, 3));
const traceMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
const traceLine = new THREE.Line(traceGeo, traceMat);
pendScene.add(traceLine);

// Pendulum parameters
const PEND_FREQ = 0.417; // Hz (~5 cycles over paper length)
const PEND_AMP = 0.45; // radians
const ROPE_LEN = 8;
const PAPER_SPEED = 2.5; // units per second
const PEN_Y = 0.05; // just above paper

function resizeSlide16() {
  const rect = pendCanvasEl.parentElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    pendRenderer.setSize(rect.width, rect.height);
    pendCamera.aspect = rect.width / rect.height;
    pendCamera.updateProjectionMatrix();
  }
}
window.addEventListener('resize', () => { if (current === 15) resizeSlide16(); });

function animateSlide16() {
  requestAnimationFrame(animateSlide16);
  if (current !== 15) return;

  const t = performance.now() / 1000;
  const angle = Math.sin(t * Math.PI * 2 * PEND_FREQ) * PEND_AMP;

  // Pendulum position
  const pivotPos = new THREE.Vector3(0, 10, 0);
  const bobX = Math.sin(angle) * ROPE_LEN;
  const bobY = 10 - Math.cos(angle) * ROPE_LEN;
  bobMesh.position.set(bobX, bobY, 0);

  // Pen tip: directly below bob, on paper surface
  penMesh.position.set(bobX, PEN_Y, 0);

  // Rope
  const rp = ropeGeo.getAttribute('position');
  rp.setXYZ(0, 0, 10, 0);
  rp.setXYZ(1, bobX, bobY, 0);
  rp.needsUpdate = true;

  // Trace: paper moves in -Z direction, pendulum swing (X) recorded on paper
  // Each trace point is fixed once written — no bobX dependency
  const tp = traceGeo.getAttribute('position');
  const traceLen = paperL;
  for (let i = 0; i < TRACE_POINTS; i++) {
    const timePast = (TRACE_POINTS - i) / TRACE_POINTS * (traceLen / PAPER_SPEED);
    const pastT = t - timePast;
    const pastAngle = Math.sin(pastT * Math.PI * 2 * PEND_FREQ) * PEND_AMP;
    const pastBobX = Math.sin(pastAngle) * ROPE_LEN;

    // Z = paper scroll direction (fixed once written)
    const traceZ = -timePast * PAPER_SPEED;
    // X = pendulum swing value at that moment
    const traceX = pastBobX;

    tp.setXYZ(i, traceX, PEN_Y, traceZ);
  }
  tp.needsUpdate = true;
  traceGeo.setDrawRange(0, TRACE_POINTS);


  pendControls.update();
  pendRenderer.render(pendScene, pendCamera);
}

setTimeout(() => { resizeSlide16(); }, 100);
animateSlide16();

// ─── Slide 17: Sine Wave Properties (Fig 4.3) ───
const swCanvas = document.getElementById('swCanvas');
const swCtx = swCanvas.getContext('2d');
const swAmpSlider = document.getElementById('swAmp');
const swFreqSlider = document.getElementById('swFreq');
const swPhaseSlider = document.getElementById('swPhase');
const swAmpVal = document.getElementById('swAmpVal');
const swFreqVal = document.getElementById('swFreqVal');
const swPhaseVal = document.getElementById('swPhaseVal');

swAmpSlider.addEventListener('input', () => { swAmpVal.textContent = parseFloat(swAmpSlider.value).toFixed(1); });
swFreqSlider.addEventListener('input', () => { swFreqVal.textContent = swFreqSlider.value; });
swPhaseSlider.addEventListener('input', () => { swPhaseVal.textContent = swPhaseSlider.value; });

function resizeSlide17() {
  const rect = swCanvas.parentElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    swCanvas.width = rect.width * devicePixelRatio;
    swCanvas.height = rect.height * devicePixelRatio;
    swCanvas.style.width = rect.width + 'px';
    swCanvas.style.height = rect.height + 'px';
  }
}
window.addEventListener('resize', () => { if (current === 16) resizeSlide17(); });

function animateSlide17() {
  requestAnimationFrame(animateSlide17);
  if (current !== 16) return;

  const w = swCanvas.width;
  const h = swCanvas.height;
  if (w === 0 || h === 0) return;
  const dpr = devicePixelRatio;

  const amp = parseFloat(swAmpSlider.value);
  const freq = parseFloat(swFreqSlider.value);
  const phaseDeg = parseFloat(swPhaseSlider.value);
  const phaseRad = phaseDeg * Math.PI / 180;

  swCtx.clearRect(0, 0, w, h);

  const marginL = w * 0.08;
  const marginR = w * 0.04;
  const marginT = h * 0.1;
  const marginB = h * 0.15;
  const plotW = w - marginL - marginR;
  const plotH = h - marginT - marginB;
  const midY = marginT + plotH * 0.5;
  const maxAmp = plotH * 0.4;

  // Axes
  swCtx.strokeStyle = '#ccc';
  swCtx.lineWidth = 1 * dpr;

  // X axis (time)
  swCtx.beginPath();
  swCtx.moveTo(marginL, midY);
  swCtx.lineTo(marginL + plotW, midY);
  swCtx.stroke();

  // Y axis
  swCtx.beginPath();
  swCtx.moveTo(marginL, marginT);
  swCtx.lineTo(marginL, marginT + plotH);
  swCtx.stroke();

  // Amplitude guides
  const ampPx = amp * maxAmp;
  swCtx.setLineDash([4 * dpr, 4 * dpr]);
  swCtx.strokeStyle = 'rgba(200, 0, 0, 0.25)';
  swCtx.beginPath();
  swCtx.moveTo(marginL, midY - ampPx);
  swCtx.lineTo(marginL + plotW, midY - ampPx);
  swCtx.moveTo(marginL, midY + ampPx);
  swCtx.lineTo(marginL + plotW, midY + ampPx);
  swCtx.stroke();
  swCtx.setLineDash([]);

  // Amplitude label + arrow
  swCtx.fillStyle = 'rgba(200, 0, 0, 0.6)';
  swCtx.font = `bold ${Math.round(13 * dpr)}px 'Playfair Display', serif`;
  swCtx.textAlign = 'left';
  swCtx.fillText('Amplitude', marginL + 8 * dpr, midY - ampPx - 6 * dpr);

  // Amplitude double arrow
  const arrowX = marginL - 20 * dpr;
  swCtx.strokeStyle = 'rgba(200, 0, 0, 0.5)';
  swCtx.lineWidth = 2 * dpr;
  swCtx.beginPath();
  swCtx.moveTo(arrowX, midY - ampPx);
  swCtx.lineTo(arrowX, midY + ampPx);
  swCtx.stroke();
  // Arrow heads
  swCtx.beginPath();
  swCtx.moveTo(arrowX - 4 * dpr, midY - ampPx + 8 * dpr);
  swCtx.lineTo(arrowX, midY - ampPx);
  swCtx.lineTo(arrowX + 4 * dpr, midY - ampPx + 8 * dpr);
  swCtx.moveTo(arrowX - 4 * dpr, midY + ampPx - 8 * dpr);
  swCtx.lineTo(arrowX, midY + ampPx);
  swCtx.lineTo(arrowX + 4 * dpr, midY + ampPx - 8 * dpr);
  swCtx.stroke();

  // Period bracket
  const periodPx = plotW / freq / 2; // one period in pixels (2 cycles shown at freq=2 across full width... let's calc properly)
  const cyclesShown = freq * 1; // show 1 second worth
  const periodW = plotW / cyclesShown;
  const bracketY = midY + ampPx + 30 * dpr;

  swCtx.strokeStyle = 'rgba(0, 0, 200, 0.5)';
  swCtx.lineWidth = 2 * dpr;
  // Find first period start (after phase shift)
  const phaseOffsetPx = (phaseRad / (Math.PI * 2)) * periodW;
  let periodStartX = marginL + phaseOffsetPx;
  if (periodStartX < marginL) periodStartX += periodW;

  if (periodStartX + periodW < marginL + plotW) {
    swCtx.beginPath();
    swCtx.moveTo(periodStartX, bracketY - 8 * dpr);
    swCtx.lineTo(periodStartX, bracketY);
    swCtx.lineTo(periodStartX + periodW, bracketY);
    swCtx.lineTo(periodStartX + periodW, bracketY - 8 * dpr);
    swCtx.stroke();

    swCtx.fillStyle = 'rgba(0, 0, 200, 0.6)';
    swCtx.font = `bold ${Math.round(13 * dpr)}px 'Playfair Display', serif`;
    swCtx.textAlign = 'center';
    swCtx.fillText('Period = 1/Frequency', periodStartX + periodW * 0.5, bracketY + 18 * dpr);
  }

  // Phase marker
  if (phaseDeg > 0) {
    const phaseX = marginL + phaseOffsetPx;
    if (phaseX > marginL && phaseX < marginL + plotW) {
      swCtx.strokeStyle = 'rgba(0, 150, 0, 0.5)';
      swCtx.lineWidth = 2 * dpr;
      swCtx.setLineDash([3 * dpr, 3 * dpr]);
      swCtx.beginPath();
      swCtx.moveTo(phaseX, marginT);
      swCtx.lineTo(phaseX, marginT + plotH);
      swCtx.stroke();
      swCtx.setLineDash([]);

      // Phase horizontal arrow (origin to phase offset)
      const arrowY2 = midY - ampPx - 18 * dpr;
      swCtx.strokeStyle = 'rgba(0, 150, 0, 0.6)';
      swCtx.lineWidth = 2 * dpr;
      swCtx.beginPath();
      swCtx.moveTo(marginL, arrowY2);
      swCtx.lineTo(phaseX, arrowY2);
      swCtx.stroke();
      // Arrow head
      swCtx.beginPath();
      swCtx.moveTo(phaseX - 6 * dpr, arrowY2 - 4 * dpr);
      swCtx.lineTo(phaseX, arrowY2);
      swCtx.lineTo(phaseX - 6 * dpr, arrowY2 + 4 * dpr);
      swCtx.stroke();

      swCtx.fillStyle = 'rgba(0, 150, 0, 0.6)';
      swCtx.font = `bold ${Math.round(12 * dpr)}px 'Playfair Display', serif`;
      swCtx.textAlign = 'center';
      swCtx.fillText('Phase ' + phaseDeg + '°', (marginL + phaseX) * 0.5, arrowY2 - 8 * dpr);
    }
  }

  // Draw sine wave
  swCtx.beginPath();
  for (let px = 0; px <= plotW; px++) {
    const x = px / plotW; // 0..1
    const timeVal = x * 1; // 1 second
    const val = Math.sin(timeVal * Math.PI * 2 * freq - phaseRad) * amp;
    const py = midY - val * maxAmp;
    if (px === 0) swCtx.moveTo(marginL + px, py);
    else swCtx.lineTo(marginL + px, py);
  }
  swCtx.strokeStyle = '#000';
  swCtx.lineWidth = 3 * dpr;
  swCtx.stroke();

  // Axis labels
  swCtx.fillStyle = '#999';
  swCtx.font = `bold ${Math.round(12 * dpr)}px 'Playfair Display', serif`;
  swCtx.textAlign = 'right';
  swCtx.fillText('Time', marginL + plotW, midY - 8 * dpr);

  // Degree markers on x-axis
  swCtx.fillStyle = '#bbb';
  swCtx.font = `${Math.round(10 * dpr)}px 'Playfair Display', serif`;
  swCtx.textAlign = 'center';
  const degsPerCycle = [0, 180, 360];
  for (let c = 0; c < Math.ceil(cyclesShown); c++) {
    degsPerCycle.forEach(d => {
      const totalDeg = c * 360 + d;
      const xPos = marginL + (totalDeg / (cyclesShown * 360)) * plotW;
      if (xPos <= marginL + plotW + 1) {
        swCtx.fillText(totalDeg + '°', xPos, midY + 16 * dpr);
      }
    });
  }
}

setTimeout(() => { resizeSlide17(); }, 100);
animateSlide17();

// ─── Slide 20: dB Log Scale Graph ───
const dbCanvas = document.getElementById('dbCanvas');
const dbCtx = dbCanvas.getContext('2d');
let dbMode = 'linear'; // 'log' or 'linear'

document.querySelectorAll('.db-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.db-toggle').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    dbMode = btn.dataset.mode;
    drawDbGraph();
  });
});

function resizeSlide20() {
  const rect = dbCanvas.parentElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    dbCanvas.width = rect.width * devicePixelRatio;
    dbCanvas.height = rect.height * devicePixelRatio;
    dbCanvas.style.width = rect.width + 'px';
    dbCanvas.style.height = rect.height + 'px';
  }
  drawDbGraph();
}
window.addEventListener('resize', () => { if (current === 19) resizeSlide20(); });

const dbPoints = [
  { pa: 0.00002, db: 0,   label: 'Threshold' },
  { pa: 0.002,   db: 40,  label: '' },
  { pa: 0.02,    db: 60,  label: 'Conversation' },
  { pa: 2,       db: 100, label: 'Concert' },
  { pa: 200,     db: 140, label: 'Jet engine' },
];

function drawDbGraph() {
  const w = dbCanvas.width;
  const h = dbCanvas.height;
  if (w === 0 || h === 0) return;
  const dpr = devicePixelRatio;
  const isLog = dbMode === 'log';

  dbCtx.clearRect(0, 0, w, h);

  const marginL = w * 0.12;
  const marginR = w * 0.06;
  const marginT = h * 0.1;
  const marginB = h * 0.14;
  const plotW = w - marginL - marginR;
  const plotH = h - marginT - marginB;

  const dbMax = 140;
  const paMaxLin = 220;   // linear mode
  const paMinLog = 0.00001;
  const paMaxLog = 400;
  const logMin = Math.log10(paMinLog);
  const logMax = Math.log10(paMaxLog);

  function paToY(pa) {
    if (isLog) {
      const lp = Math.log10(Math.max(pa, paMinLog));
      return marginT + plotH - ((lp - logMin) / (logMax - logMin)) * plotH;
    } else {
      return marginT + plotH - (pa / paMaxLin) * plotH;
    }
  }

  // Axes
  dbCtx.strokeStyle = '#aaa';
  dbCtx.lineWidth = 1 * dpr;

  dbCtx.beginPath();
  dbCtx.moveTo(marginL, marginT + plotH);
  dbCtx.lineTo(marginL + plotW, marginT + plotH);
  dbCtx.stroke();

  dbCtx.beginPath();
  dbCtx.moveTo(marginL, marginT);
  dbCtx.lineTo(marginL, marginT + plotH);
  dbCtx.stroke();

  // X axis ticks (dB)
  dbCtx.font = `${Math.round(10 * dpr)}px 'Playfair Display', serif`;
  dbCtx.fillStyle = '#999';
  dbCtx.textAlign = 'center';
  for (let db = 0; db <= 140; db += 20) {
    const x = marginL + (db / dbMax) * plotW;
    dbCtx.beginPath();
    dbCtx.moveTo(x, marginT + plotH);
    dbCtx.lineTo(x, marginT + plotH + 5 * dpr);
    dbCtx.strokeStyle = '#aaa';
    dbCtx.stroke();
    dbCtx.fillText(db + ' dB', x, marginT + plotH + 18 * dpr);
  }

  dbCtx.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display', serif`;
  dbCtx.fillStyle = '#888';
  dbCtx.fillText('dB SPL', marginL + plotW * 0.5, marginT + plotH + 34 * dpr);

  // Y axis ticks
  dbCtx.textAlign = 'right';
  dbCtx.font = `${Math.round(10 * dpr)}px monospace`;
  dbCtx.fillStyle = '#999';

  if (isLog) {
    const logTicks = [0.00002, 0.0002, 0.002, 0.02, 0.2, 2, 20, 200];
    logTicks.forEach(pa => {
      const y = paToY(pa);
      dbCtx.beginPath();
      dbCtx.moveTo(marginL - 5 * dpr, y);
      dbCtx.lineTo(marginL, y);
      dbCtx.strokeStyle = '#ccc';
      dbCtx.stroke();
      dbCtx.beginPath();
      dbCtx.moveTo(marginL, y);
      dbCtx.lineTo(marginL + plotW, y);
      dbCtx.strokeStyle = '#f0f0f0';
      dbCtx.stroke();
      dbCtx.fillText(pa, marginL - 8 * dpr, y + 4 * dpr);
    });
  } else {
    const linTicks = [0, 50, 100, 150, 200];
    linTicks.forEach(pa => {
      const y = paToY(pa);
      dbCtx.beginPath();
      dbCtx.moveTo(marginL - 5 * dpr, y);
      dbCtx.lineTo(marginL, y);
      dbCtx.strokeStyle = '#ccc';
      dbCtx.stroke();
      if (pa > 0) {
        dbCtx.beginPath();
        dbCtx.moveTo(marginL, y);
        dbCtx.lineTo(marginL + plotW, y);
        dbCtx.strokeStyle = '#f0f0f0';
        dbCtx.stroke();
      }
      dbCtx.fillText(pa + ' Pa', marginL - 8 * dpr, y + 4 * dpr);
    });
  }

  // Y axis label
  dbCtx.save();
  dbCtx.translate(14 * dpr, marginT + plotH * 0.5);
  dbCtx.rotate(-Math.PI / 2);
  dbCtx.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display', serif`;
  dbCtx.fillStyle = '#888';
  dbCtx.textAlign = 'center';
  dbCtx.fillText(isLog ? 'Sound Pressure (Pa, log)' : 'Sound Pressure (Pa, linear)', 0, 0);
  dbCtx.restore();

  // Plot curve
  dbCtx.beginPath();
  for (let px = 0; px <= plotW; px++) {
    const db = (px / plotW) * dbMax;
    const pa = 0.00002 * Math.pow(10, db / 20);
    const y = paToY(pa);
    const x = marginL + px;
    if (px === 0) dbCtx.moveTo(x, y);
    else dbCtx.lineTo(x, y);
  }
  dbCtx.strokeStyle = '#000';
  dbCtx.lineWidth = 3 * dpr;
  dbCtx.stroke();

  // Data points
  dbPoints.forEach(pt => {
    const x = marginL + (pt.db / dbMax) * plotW;
    const y = paToY(pt.pa);

    dbCtx.beginPath();
    dbCtx.arc(x, y, 5 * dpr, 0, Math.PI * 2);
    dbCtx.fillStyle = '#000';
    dbCtx.fill();

    if (pt.label) {
      dbCtx.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display', serif`;
      dbCtx.fillStyle = '#555';
      dbCtx.textAlign = 'left';
      dbCtx.fillText(pt.label, x + 8 * dpr, y - 10 * dpr);
    }
  });

  // Annotation
  if (!isLog) {
    dbCtx.font = `italic ${Math.round(11 * dpr)}px 'Playfair Display', serif`;
    dbCtx.fillStyle = 'rgba(200, 0, 0, 0.5)';
    dbCtx.textAlign = 'center';
    dbCtx.fillText('Everything below 100 dB is invisible here', marginL + (60 / dbMax) * plotW, marginT + plotH - 15 * dpr);
  }
}

setTimeout(() => { resizeSlide20(); }, 100);

// ─── Slide 22: Loudness Question ───
function playLqTone(freq, btnId) {
  ensureAudioCtx();
  const now = audioCtx.currentTime;
  const dur = 2.0;
  const btn = document.getElementById(btnId);

  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = freq;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.3, now);
  g.gain.setValueAtTime(0.3, now + dur - 0.05);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + dur);

  btn.classList.add('playing');
  setTimeout(() => { btn.classList.remove('playing'); }, dur * 1000);
}

document.getElementById('lqBtn100').addEventListener('click', () => playLqTone(100, 'lqBtn100'));
document.getElementById('lqBtn1000').addEventListener('click', () => playLqTone(1000, 'lqBtn1000'));

// ─── Slide 23: Equal Loudness Curves ───
const elCanvas = document.getElementById('elCanvas');
const elCtx = elCanvas.getContext('2d');

function resizeSlide23() {
  const rect = elCanvas.parentElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    elCanvas.width = rect.width * devicePixelRatio;
    elCanvas.height = rect.height * devicePixelRatio;
    elCanvas.style.width = rect.width + 'px';
    elCanvas.style.height = rect.height + 'px';
  }
  drawEqualLoudness();
}
window.addEventListener('resize', () => { if (current === 22) resizeSlide23(); });

// ISO 226 approximate equal loudness contour data
// Each entry: phon -> array of [freq, dBSPL]
const elData = {
  0:   [[20,74],[30,65],[50,52],[100,40],[200,28],[500,15],[1000,4],[2000,1],[3000,-1],[4000,-1],[5000,4],[6000,7],[8000,14],[10000,13]],
  10:  [[20,83],[30,74],[50,62],[100,50],[200,38],[500,25],[1000,14],[2000,8],[3000,6],[4000,7],[5000,11],[6000,15],[8000,22],[10000,22]],
  20:  [[20,92],[30,83],[50,72],[100,60],[200,48],[500,35],[1000,24],[2000,17],[3000,14],[4000,15],[5000,19],[6000,24],[8000,31],[10000,31]],
  30:  [[20,100],[30,92],[50,80],[100,69],[200,57],[500,44],[1000,34],[2000,27],[3000,23],[4000,24],[5000,28],[6000,33],[8000,40],[10000,40]],
  40:  [[20,107],[30,99],[50,88],[100,77],[200,65],[500,53],[1000,44],[2000,37],[3000,33],[4000,33],[5000,37],[6000,42],[8000,49],[10000,49]],
  50:  [[20,113],[30,106],[50,95],[100,85],[200,73],[500,62],[1000,54],[2000,47],[3000,43],[4000,42],[5000,46],[6000,51],[8000,58],[10000,58]],
  60:  [[20,118],[30,112],[50,102],[100,92],[200,81],[500,70],[1000,64],[2000,57],[3000,53],[4000,52],[5000,55],[6000,60],[8000,66],[10000,67]],
  70:  [[20,123],[30,117],[50,108],[100,99],[200,89],[500,78],[1000,74],[2000,67],[3000,63],[4000,62],[5000,65],[6000,69],[8000,75],[10000,76]],
  80:  [[20,127],[30,122],[50,114],[100,106],[200,96],[500,86],[1000,84],[2000,78],[3000,74],[4000,73],[5000,75],[6000,78],[8000,83],[10000,85]],
  90:  [[20,131],[30,127],[50,120],[100,112],[200,103],[500,94],[1000,94],[2000,89],[3000,85],[4000,84],[5000,86],[6000,88],[8000,92],[10000,94]],
  100: [[20,135],[30,131],[50,125],[100,118],[200,110],[500,102],[1000,104],[2000,100],[3000,96],[4000,95],[5000,96],[6000,97],[8000,100],[10000,103]],
  110: [[20,138],[30,135],[50,130],[100,124],[200,117],[500,110],[1000,114],[2000,110],[3000,107],[4000,106],[5000,107],[6000,107],[8000,108],[10000,112]],
  120: [[20,140],[30,138],[50,135],[100,130],[200,124],[500,118],[1000,124],[2000,120],[3000,118],[4000,117],[5000,117],[6000,117],[8000,116],[10000,120]],
};

function drawEqualLoudness() {
  const w = elCanvas.width;
  const h = elCanvas.height;
  if (w === 0 || h === 0) return;
  const dpr = devicePixelRatio;

  elCtx.clearRect(0, 0, w, h);

  const marginL = w * 0.08;
  const marginR = w * 0.1;
  const marginT = h * 0.06;
  const marginB = h * 0.12;
  const plotW = w - marginL - marginR;
  const plotH = h - marginT - marginB;

  const fMin = 20, fMax = 10000;
  const logFMin = Math.log10(fMin), logFMax = Math.log10(fMax);
  const splMin = 0, splMax = 140;

  function fToX(f) {
    return marginL + ((Math.log10(f) - logFMin) / (logFMax - logFMin)) * plotW;
  }
  function splToY(spl) {
    return marginT + plotH - ((spl - splMin) / (splMax - splMin)) * plotH;
  }

  // Horizontal grid + Y labels
  elCtx.font = `${Math.round(10 * dpr)}px 'Playfair Display', serif`;
  elCtx.fillStyle = '#bbb';
  elCtx.textAlign = 'right';
  for (let spl = 0; spl <= 140; spl += 20) {
    const y = splToY(spl);
    elCtx.beginPath();
    elCtx.moveTo(marginL, y);
    elCtx.lineTo(marginL + plotW, y);
    elCtx.strokeStyle = '#f0f0f0';
    elCtx.lineWidth = 1 * dpr;
    elCtx.stroke();
    elCtx.fillText(spl, marginL - 6 * dpr, y + 4 * dpr);
  }

  // Vertical grid + X labels
  elCtx.textAlign = 'center';
  const fTicks = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
  fTicks.forEach(f => {
    const x = fToX(f);
    elCtx.beginPath();
    elCtx.moveTo(x, marginT);
    elCtx.lineTo(x, marginT + plotH);
    elCtx.strokeStyle = '#f0f0f0';
    elCtx.lineWidth = 1 * dpr;
    elCtx.stroke();
    const label = f >= 1000 ? (f / 1000) + 'k' : f;
    elCtx.fillText(label, x, marginT + plotH + 16 * dpr);
  });

  // Axes
  elCtx.strokeStyle = '#999';
  elCtx.lineWidth = 1.5 * dpr;
  elCtx.beginPath();
  elCtx.moveTo(marginL, marginT);
  elCtx.lineTo(marginL, marginT + plotH);
  elCtx.lineTo(marginL + plotW, marginT + plotH);
  elCtx.stroke();

  // Axis labels
  elCtx.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display', serif`;
  elCtx.fillStyle = '#888';
  elCtx.textAlign = 'center';
  elCtx.fillText('Frequency (Hz)', marginL + plotW * 0.5, marginT + plotH + 34 * dpr);

  elCtx.save();
  elCtx.translate(16 * dpr, marginT + plotH * 0.5);
  elCtx.rotate(-Math.PI / 2);
  elCtx.fillText('Sound Pressure Level (dB)', 0, 0);
  elCtx.restore();

  // Piano note vertical lines
  const pianoNotes = [
    { name: 'A0', freq: 27.5 },
    { name: 'A1', freq: 55 },
    { name: 'A2', freq: 110 },
    { name: 'A3', freq: 220 },
    { name: 'A4', freq: 440 },
    { name: 'A5', freq: 880 },
    { name: 'A6', freq: 1760 },
    { name: 'A7', freq: 3520 },
    { name: 'A8', freq: 7040 },
  ];
  elCtx.textAlign = 'center';
  pianoNotes.forEach(n => {
    if (n.freq >= fMin && n.freq <= fMax) {
      const x = fToX(n.freq);
      // Dashed vertical line
      elCtx.beginPath();
      elCtx.moveTo(x, marginT);
      elCtx.lineTo(x, marginT + plotH);
      elCtx.strokeStyle = 'rgba(0,0,0,0.08)';
      elCtx.lineWidth = 1 * dpr;
      elCtx.setLineDash([3 * dpr, 3 * dpr]);
      elCtx.stroke();
      elCtx.setLineDash([]);
      // Clickable label with background
      const labelW = 28 * dpr;
      const labelH = 16 * dpr;
      const lx = x;
      const ly = marginT - 12 * dpr;
      elCtx.fillStyle = '#f5f5f5';
      elCtx.fillRect(lx - labelW / 2, ly - labelH / 2, labelW, labelH);
      elCtx.strokeStyle = '#ccc';
      elCtx.lineWidth = 1 * dpr;
      elCtx.strokeRect(lx - labelW / 2, ly - labelH / 2, labelW, labelH);
      elCtx.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display', serif`;
      elCtx.fillStyle = '#555';
      elCtx.fillText(n.name, lx, ly + 4 * dpr);
    }
  });

  // Draw equal loudness curves with smooth interpolation
  const phonLevels = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];

  phonLevels.forEach((phon) => {
    const pts = elData[phon];
    if (!pts) return;

    elCtx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const x = fToX(pts[i][0]);
      const y = splToY(pts[i][1]);
      if (i === 0) {
        elCtx.moveTo(x, y);
      } else {
        // Smooth curve using bezier
        const prev = pts[i - 1];
        const px = fToX(prev[0]);
        const py = splToY(prev[1]);
        const cpx = (px + x) / 2;
        elCtx.bezierCurveTo(cpx, py, cpx, y, x, y);
      }
    }
    elCtx.strokeStyle = '#000';
    elCtx.lineWidth = 1.5 * dpr;
    elCtx.stroke();

    // Phon label on right side of last point
    const lastPt = pts[pts.length - 1];
    const lx = fToX(lastPt[0]) + 8 * dpr;
    const ly = splToY(lastPt[1]);
    elCtx.font = `${Math.round(10 * dpr)}px 'Playfair Display', serif`;
    elCtx.fillStyle = '#000';
    elCtx.textAlign = 'left';
    elCtx.fillText(phon, lx, ly + 4 * dpr);
  });

  // "Loudness level (phons)" label at top right
  elCtx.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display', serif`;
  elCtx.fillStyle = '#888';
  elCtx.textAlign = 'left';
  elCtx.fillText('Loudness', marginL + plotW + 4 * dpr, marginT + 10 * dpr);
  elCtx.fillText('level (phons)', marginL + plotW + 4 * dpr, marginT + 22 * dpr);

  // Active note highlight line
  if (elActiveFreq && elActiveFreq >= fMin && elActiveFreq <= fMax) {
    const hx = fToX(elActiveFreq);
    // Glowing vertical line
    elCtx.beginPath();
    elCtx.moveTo(hx, marginT);
    elCtx.lineTo(hx, marginT + plotH);
    elCtx.strokeStyle = 'rgba(0, 100, 255, 0.6)';
    elCtx.lineWidth = 3 * dpr;
    elCtx.stroke();
    // Wider glow
    elCtx.beginPath();
    elCtx.moveTo(hx, marginT);
    elCtx.lineTo(hx, marginT + plotH);
    elCtx.strokeStyle = 'rgba(0, 100, 255, 0.15)';
    elCtx.lineWidth = 12 * dpr;
    elCtx.stroke();
  }
}

// Active note highlight
let elActiveFreq = null;
let elActiveTimeout = null;

// Sound mode toggle
let elSoundMode = 'sine';
document.querySelectorAll('#slide23 .el-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#slide23 .el-toggle').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    elSoundMode = btn.dataset.sound;
  });
});

// Store note label positions for click detection
const elNoteHitAreas = [];

// Override drawEqualLoudness to store hit areas
const origDrawEL = drawEqualLoudness;
drawEqualLoudness = function() {
  elNoteHitAreas.length = 0;
  origDrawEL();
};

// After drawing, patch to record hit areas
const origPianoNotes = [
  { name: 'A0', freq: 27.5 },
  { name: 'A1', freq: 55 },
  { name: 'A2', freq: 110 },
  { name: 'A3', freq: 220 },
  { name: 'A4', freq: 440 },
  { name: 'A5', freq: 880 },
  { name: 'A6', freq: 1760 },
  { name: 'A7', freq: 3520 },
  { name: 'A8', freq: 7040 },
];

// Click handler on canvas
elCanvas.addEventListener('click', (e) => {
  const rect = elCanvas.getBoundingClientRect();
  const dpr = devicePixelRatio;
  const clickX = (e.clientX - rect.left) * dpr;
  const clickY = (e.clientY - rect.top) * dpr;

  const w = elCanvas.width;
  const h = elCanvas.height;
  const marginL = w * 0.08;
  const marginR = w * 0.1;
  const marginT = h * 0.06;
  const plotW = w - marginL - marginR;
  const fMin = 20, fMax = 10000;
  const logFMin = Math.log10(fMin), logFMax = Math.log10(fMax);

  // Check if click is near a piano note label area (top of graph)
  origPianoNotes.forEach(n => {
    if (n.freq < fMin || n.freq > fMax) return;
    const nx = marginL + ((Math.log10(n.freq) - logFMin) / (logFMax - logFMin)) * plotW;
    const dist = Math.abs(clickX - nx);
    if (dist < 25 * dpr && clickY < marginT + h * 0.15) {
      playElNote(n.freq, n.name);
    }
  });
});

// Piano sample cache
const pianoSamples = {};
const pianoSampleNames = ['A0','A1','A2','A3','A4','A5','A6','A7'];

async function loadPianoSample(name) {
  if (pianoSamples[name]) return pianoSamples[name];
  ensureAudioCtx();
  const resp = await fetch('samples/' + name + '.mp3');
  const arrayBuf = await resp.arrayBuffer();
  const audioBuf = await audioCtx.decodeAudioData(arrayBuf);
  pianoSamples[name] = audioBuf;
  return audioBuf;
}

// Preload all samples when slide 22 is first visited
let pianoPreloaded = false;
function preloadPianoSamples() {
  if (pianoPreloaded) return;
  pianoPreloaded = true;
  ensureAudioCtx();
  pianoSampleNames.forEach(n => loadPianoSample(n));
}

function playPianoSample(name, time) {
  // Find closest available sample
  const noteName = name.length <= 2 ? name : name.substring(0, 2);
  const available = pianoSampleNames.includes(noteName) ? noteName : 'A4';
  loadPianoSample(available).then(buf => {
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const g = audioCtx.createGain();
    g.gain.value = 0.8;
    src.connect(g).connect(audioCtx.destination);
    src.start(0);
  });
}

function playElNote(freq, name) {
  ensureAudioCtx();
  const now = audioCtx.currentTime;
  const dur = 1.5;
  const label = document.getElementById('elNowPlaying');
  label.textContent = name + ' (' + freq + ' Hz)';

  // Highlight
  elActiveFreq = freq;
  if (elActiveTimeout) clearTimeout(elActiveTimeout);
  elActiveTimeout = setTimeout(() => { elActiveFreq = null; }, dur * 1000 + 200);
  setTimeout(() => { if (label.textContent.includes(name)) label.textContent = ''; }, dur * 1000 + 200);

  if (elSoundMode === 'sine') {
    // Pure sine wave
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.3, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + dur);
  } else {
    // Piano sample playback
    playPianoSample(name, now);
  }
}

function animateSlide23() {
  requestAnimationFrame(animateSlide23);
  if (current !== 22) return;
  drawEqualLoudness();
}

setTimeout(() => { resizeSlide23(); }, 100);
animateSlide23();

// ─── Slide 25: String Vibration Modes ───
const s25Canvas = document.getElementById('s25Canvas');
const s25Ctx = s25Canvas.getContext('2d');
const s25F0 = 220; // A3
let s25ActiveModes = [true, true, true]; // modes 1, 2, 3

function resizeSlide25() {
  const rect = s25Canvas.parentElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    s25Canvas.width = rect.width * devicePixelRatio;
    s25Canvas.height = rect.height * devicePixelRatio;
    s25Canvas.style.width = rect.width + 'px';
    s25Canvas.style.height = rect.height + 'px';
  }
}

window.addEventListener('resize', () => { if (current === 24) resizeSlide25(); });

function drawSlide25() {
  const W = s25Canvas.width;
  const H = s25Canvas.height;
  if (W === 0 || H === 0) return;

  const ctx = s25Ctx;
  ctx.clearRect(0, 0, W, H);

  const dpr = devicePixelRatio;
  const t = performance.now() / 1000;
  const rowH = H / 4;
  const margin = 40 * dpr;
  const labels = ['Mode 1 (f₀)', 'Mode 2 (2f₀)', 'Mode 3 (3f₀)', 'Combined'];

  for (let row = 0; row < 4; row++) {
    const y0 = row * rowH;
    const midY = y0 + rowH / 2;

    // Row separator
    if (row > 0) {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1 * dpr;
      ctx.beginPath();
      ctx.moveTo(margin, y0);
      ctx.lineTo(W - margin, y0);
      ctx.stroke();
    }

    // Label
    ctx.fillStyle = '#888';
    ctx.font = `${Math.round(13 * dpr)}px 'Playfair Display', serif`;
    ctx.textAlign = 'left';
    ctx.fillText(labels[row], margin, y0 + 20 * dpr);

    // Draw center line
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    ctx.moveTo(margin, midY);
    ctx.lineTo(W - margin, midY);
    ctx.stroke();

    // Fixed end dots
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(margin, midY, 4 * dpr, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W - margin, midY, 4 * dpr, 0, Math.PI * 2);
    ctx.fill();

    // Draw waveform
    const amplitude = (rowH / 2 - 25 * dpr);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2.5 * dpr;
    ctx.beginPath();

    const drawW = W - 2 * margin;
    for (let px = 0; px <= drawW; px++) {
      const x = px / drawW; // 0 to 1
      let y = 0;

      if (row < 3) {
        // Individual mode: n = row + 1
        const n = row + 1;
        const freq = n * 3; // visual frequency for animation
        y = Math.sin(n * Math.PI * x) * Math.cos(2 * Math.PI * freq * t);
      } else {
        // Combined
        for (let n = 1; n <= 3; n++) {
          const freq = n * 3;
          y += (1 / n) * Math.sin(n * Math.PI * x) * Math.cos(2 * Math.PI * freq * t);
        }
      }

      const canvasX = margin + px;
      const canvasY = midY - y * amplitude;

      if (px === 0) ctx.moveTo(canvasX, canvasY);
      else ctx.lineTo(canvasX, canvasY);
    }
    ctx.stroke();
  }
}

function animateSlide25() {
  requestAnimationFrame(animateSlide25);
  if (current !== 24) return;
  drawSlide25();
}

function playS25Harmonic(harmonics, btnId) {
  ensureAudioCtx();
  const now = audioCtx.currentTime;
  const dur = 2.0;
  const btn = document.getElementById(btnId);

  harmonics.forEach((n) => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = s25F0 * n;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.25 / n, now);
    g.gain.setValueAtTime(0.25 / n, now + dur - 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + dur);
  });

  btn.classList.add('playing');
  setTimeout(() => { btn.classList.remove('playing'); }, dur * 1000);
}

document.getElementById('s25BtnF0').addEventListener('click', () => playS25Harmonic([1], 's25BtnF0'));
document.getElementById('s25Btn2F0').addEventListener('click', () => playS25Harmonic([2], 's25Btn2F0'));
document.getElementById('s25Btn3F0').addEventListener('click', () => playS25Harmonic([3], 's25Btn3F0'));
document.getElementById('s25BtnAll').addEventListener('click', () => playS25Harmonic([1, 2, 3], 's25BtnAll'));

setTimeout(() => { resizeSlide25(); }, 100);
animateSlide25();

// ─── Slide 27: Odd vs All Harmonics ───
const s27CanvasAll = document.getElementById('s27CanvasAll');
const s27CtxAll = s27CanvasAll.getContext('2d');
const s27CanvasOdd = document.getElementById('s27CanvasOdd');
const s27CtxOdd = s27CanvasOdd.getContext('2d');
const s27Freq = 220; // A3

function resizeSlide27() {
  [s27CanvasAll, s27CanvasOdd].forEach(cvs => {
    const rect = cvs.parentElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      cvs.width = rect.width * devicePixelRatio;
      cvs.height = rect.height * devicePixelRatio;
      cvs.style.width = rect.width + 'px';
      cvs.style.height = rect.height + 'px';
    }
  });
}

window.addEventListener('resize', () => { if (current === 27) resizeSlide27(); });

function drawS27Waveform(cvs, ctx, harmonicList, color) {
  const W = cvs.width;
  const H = cvs.height;
  if (W === 0 || H === 0) return;

  const dpr = devicePixelRatio;
  const t = performance.now() / 1000;
  const midY = H / 2;
  const amplitude = H * 0.35;
  const margin = 30 * dpr;

  ctx.clearRect(0, 0, W, H);

  // Center line
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1 * dpr;
  ctx.beginPath();
  ctx.moveTo(margin, midY);
  ctx.lineTo(W - margin, midY);
  ctx.stroke();

  // Waveform - scrolling
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5 * dpr;
  ctx.beginPath();

  const drawW = W - 2 * margin;
  const cycles = 3; // show 3 cycles
  for (let px = 0; px <= drawW; px++) {
    const phase = (px / drawW) * cycles * 2 * Math.PI - t * 4;
    let y = 0;
    harmonicList.forEach(n => {
      y += (1 / n) * Math.sin(n * phase);
    });
    // Normalize
    const maxAmp = harmonicList.reduce((s, n) => s + 1 / n, 0);
    const canvasX = margin + px;
    const canvasY = midY - (y / maxAmp) * amplitude;

    if (px === 0) ctx.moveTo(canvasX, canvasY);
    else ctx.lineTo(canvasX, canvasY);
  }
  ctx.stroke();

  // Harmonic labels
  ctx.fillStyle = '#aaa';
  ctx.font = `${Math.round(12 * dpr)}px 'Playfair Display', serif`;
  ctx.textAlign = 'left';
  const labelText = harmonicList.map(n => n + 'f₀').join(' + ');
  ctx.fillText(labelText, margin, 20 * dpr);
}

function animateSlide27() {
  requestAnimationFrame(animateSlide27);
  if (current !== 27) return;
  drawS27Waveform(s27CanvasAll, s27CtxAll, [1, 2, 3, 4, 5, 6], '#000');
  drawS27Waveform(s27CanvasOdd, s27CtxOdd, [1, 3, 5, 7, 9, 11], '#000');
}

function playS27Sound(harmonicList, btnId) {
  ensureAudioCtx();
  const now = audioCtx.currentTime;
  const dur = 2.0;
  const btn = document.getElementById(btnId);

  harmonicList.forEach((n) => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = s27Freq * n;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.2 / n, now);
    g.gain.setValueAtTime(0.2 / n, now + dur - 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + dur);
  });

  btn.classList.add('playing');
  setTimeout(() => { btn.classList.remove('playing'); }, dur * 1000);
}

document.getElementById('s27PlayAll').addEventListener('click', () => playS27Sound([1, 2, 3, 4, 5, 6], 's27PlayAll'));
document.getElementById('s27PlayOdd').addEventListener('click', () => playS27Sound([1, 3, 5, 7, 9, 11], 's27PlayOdd'));

setTimeout(() => { resizeSlide27(); }, 100);
animateSlide27();

// ─── Slide 28: Fourier Synthesis ───
const fsCanvas = document.getElementById('fsCanvas');
const fsCtx = fsCanvas.getContext('2d');
const fsTable = document.getElementById('fsTable');

let fsWaveType = 'sawtooth';
let fsActiveHarmonics = 0; // how many harmonics currently active (0 = none)
let fsBuildRunning = false;
let fsBuildTimer = null;
const FS_MAX = 20;
const FS_FUND = 220; // Hz (A3)

// Wave type toggle
document.querySelectorAll('#slide27 .fs-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#slide27 .fs-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    fsWaveType = btn.dataset.wave;
    fsActiveHarmonics = 0;
    fsBuildRunning = false;
    if (fsBuildTimer) { clearInterval(fsBuildTimer); fsBuildTimer = null; }
    updateFsTable();
  });
});

// Harmonic amplitude formulas
function fsGetAmp(n, type) {
  // n is 1-based harmonic number
  switch (type) {
    case 'sawtooth':
      // All harmonics: amp = 1/n, alternating sign
      return 1 / n;
    case 'square':
      // Odd harmonics only: amp = 1/n
      return (n % 2 === 1) ? (1 / n) : 0;
    case 'triangle':
      // Odd harmonics only: amp = 1/n², alternating sign
      return (n % 2 === 1) ? (1 / (n * n)) : 0;
    default:
      return 1 / n;
  }
}

function updateFsTable() {
  // Rebuild table rows
  while (fsTable.rows.length > 1) fsTable.deleteRow(1);
  for (let n = 1; n <= FS_MAX; n++) {
    const row = fsTable.insertRow();
    const amp = fsGetAmp(n, fsWaveType);
    const isActive = n <= fsActiveHarmonics && amp > 0;
    const isZero = amp === 0;
    row.className = isActive ? 'active' : (n <= fsActiveHarmonics ? 'active' : 'inactive');
    if (isZero && n <= fsActiveHarmonics) row.className = 'active';

    const c1 = row.insertCell(); c1.textContent = n;
    const c2 = row.insertCell(); c2.textContent = (FS_FUND * n) + ' Hz';
    const c3 = row.insertCell();
    if (isZero) {
      c3.textContent = '—';
      c3.style.color = '#ccc';
    } else {
      c3.textContent = (n <= fsActiveHarmonics) ? amp.toFixed(3) : '';
    }
  }
}
updateFsTable();

// Build button: adds one harmonic every 800ms, plays sound
let fsOscillators = [];

function fsStopAll() {
  fsOscillators.forEach(o => { try { o.osc.stop(); } catch(e){} });
  fsOscillators = [];
}

document.getElementById('fsBuildBtn').addEventListener('click', () => {
  if (fsBuildRunning) {
    // Stop
    fsBuildRunning = false;
    if (fsBuildTimer) { clearInterval(fsBuildTimer); fsBuildTimer = null; }
    fsStopAll();
    return;
  }

  ensureAudioCtx();
  fsStopAll();
  fsActiveHarmonics = 0;
  fsBuildRunning = true;
  updateFsTable();

  fsBuildTimer = setInterval(() => {
    if (!fsBuildRunning) { clearInterval(fsBuildTimer); fsBuildTimer = null; return; }

    fsActiveHarmonics++;
    if (fsActiveHarmonics > FS_MAX) {
      fsBuildRunning = false;
      clearInterval(fsBuildTimer);
      fsBuildTimer = null;
      return;
    }

    const n = fsActiveHarmonics;
    const amp = fsGetAmp(n, fsWaveType);
    updateFsTable();

    if (amp > 0) {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = FS_FUND * n;
      const g = audioCtx.createGain();
      g.gain.value = amp * 0.25; // scale down for comfort
      osc.connect(g).connect(audioCtx.destination);
      osc.start();
      fsOscillators.push({ osc, gain: g, n });
    }
  }, 800);
});

function resizeSlide28() {
  const rect = fsCanvas.parentElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    fsCanvas.width = rect.width * devicePixelRatio;
    fsCanvas.height = rect.height * devicePixelRatio;
    fsCanvas.style.width = rect.width + 'px';
    fsCanvas.style.height = rect.height + 'px';
  }
}
window.addEventListener('resize', () => { if (current === 26) resizeSlide28(); });

function animateSlide28() {
  requestAnimationFrame(animateSlide28);
  if (current !== 26) return;

  const w = fsCanvas.width;
  const h = fsCanvas.height;
  if (w === 0 || h === 0) return;
  const dpr = devicePixelRatio;
  const t = performance.now() / 1000;

  fsCtx.clearRect(0, 0, w, h);

  const marginL = w * 0.04;
  const marginR = w * 0.04;
  const marginT = h * 0.06;
  const marginB = h * 0.06;
  const plotW = w - marginL - marginR;
  const plotH = h - marginT - marginB;

  // How many harmonics to draw
  const numH = fsActiveHarmonics;

  if (numH === 0) {
    // Empty state
    fsCtx.font = `${Math.round(14 * dpr)}px 'Playfair Display', serif`;
    fsCtx.fillStyle = '#ccc';
    fsCtx.textAlign = 'center';
    fsCtx.fillText('Press Build to add harmonics one by one', w * 0.5, h * 0.5);
    return;
  }

  // Draw individual harmonics (thin, colored) + combined (thick, black)
  const colors = ['#e74c3c','#3498db','#2ecc71','#9b59b6','#e67e22','#1abc9c','#e84393','#00b894','#fdcb6e','#6c5ce7'];

  // Combined waveform area: top portion
  const combH = plotH * 0.45;
  const combMidY = marginT + combH * 0.5;

  // Individual harmonics area: bottom portion
  const indH = plotH * 0.45;
  const indTop = marginT + combH + plotH * 0.1;

  // Center lines
  fsCtx.strokeStyle = '#eee';
  fsCtx.lineWidth = 1 * dpr;
  fsCtx.beginPath();
  fsCtx.moveTo(marginL, combMidY);
  fsCtx.lineTo(marginL + plotW, combMidY);
  fsCtx.stroke();

  // Label
  fsCtx.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display', serif`;
  fsCtx.fillStyle = '#aaa';
  fsCtx.textAlign = 'left';
  fsCtx.fillText('Combined (' + numH + ' harmonics)', marginL, marginT - 4 * dpr);
  fsCtx.fillText('Individual harmonics', marginL, indTop - 8 * dpr);

  // Draw combined waveform
  const combAmp = combH * 0.4;
  fsCtx.beginPath();
  for (let px = 0; px <= plotW; px++) {
    const x = px / plotW;
    let val = 0;
    for (let n = 1; n <= numH; n++) {
      const amp = fsGetAmp(n, fsWaveType);
      if (amp === 0) continue;
      val += amp * Math.sin(x * Math.PI * 2 * n * 2 - t * Math.PI * 2 * 0.5 * n);
    }
    // Normalize
    val *= 0.7;
    const py = combMidY - val * combAmp;
    if (px === 0) fsCtx.moveTo(marginL + px, py);
    else fsCtx.lineTo(marginL + px, py);
  }
  fsCtx.strokeStyle = '#000';
  fsCtx.lineWidth = 3 * dpr;
  fsCtx.stroke();

  // Draw individual harmonics (stacked, each gets a thin row)
  const rowH = indH / Math.max(numH, 1);
  for (let n = 1; n <= numH; n++) {
    const amp = fsGetAmp(n, fsWaveType);
    const rowMidY = indTop + (n - 0.5) * rowH;
    const rowAmp = rowH * 0.35;

    // Center line
    fsCtx.strokeStyle = '#f5f5f5';
    fsCtx.lineWidth = 1 * dpr;
    fsCtx.beginPath();
    fsCtx.moveTo(marginL, rowMidY);
    fsCtx.lineTo(marginL + plotW, rowMidY);
    fsCtx.stroke();

    if (amp === 0) {
      fsCtx.font = `${Math.round(9 * dpr)}px 'Playfair Display', serif`;
      fsCtx.fillStyle = '#ddd';
      fsCtx.textAlign = 'left';
      fsCtx.fillText(n + '× (0)', marginL + 4 * dpr, rowMidY + 4 * dpr);
      continue;
    }

    // Draw sine
    fsCtx.beginPath();
    for (let px = 0; px <= plotW; px++) {
      const x = px / plotW;
      const val = amp * Math.sin(x * Math.PI * 2 * n * 2 - t * Math.PI * 2 * 0.5 * n);
      const py = rowMidY - val * rowAmp * (1 / Math.max(amp, 0.1));
      if (px === 0) fsCtx.moveTo(marginL + px, py);
      else fsCtx.lineTo(marginL + px, py);
    }
    fsCtx.strokeStyle = colors[(n - 1) % colors.length];
    fsCtx.lineWidth = 2 * dpr;
    fsCtx.stroke();

    // Label
    fsCtx.font = `bold ${Math.round(9 * dpr)}px 'Playfair Display', serif`;
    fsCtx.fillStyle = colors[(n - 1) % colors.length];
    fsCtx.textAlign = 'left';
    fsCtx.fillText(n + '×', marginL + 4 * dpr, rowMidY - rowH * 0.3);
  }
}

setTimeout(() => { resizeSlide28(); }, 100);
animateSlide28();

// ─── Slide 29: FFT Pendulum (3D, random waveform) ───
const fftPendEl = document.getElementById('fftPendCanvas');
const fftRenderer = new THREE.WebGLRenderer({ canvas: fftPendEl, antialias: true });
fftRenderer.setClearColor(0xffffff, 1);
fftRenderer.setPixelRatio(window.devicePixelRatio);

const fftScene = new THREE.Scene();
const fftCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
fftCamera.position.set(12, 12, 8);
fftCamera.lookAt(0, 3, -8);

const fftControls = new OrbitControls(fftCamera, fftPendEl);
fftControls.enableDamping = true;
fftControls.dampingFactor = 0.05;
fftControls.target.set(0, 3, -8);

fftScene.add(new THREE.AmbientLight(0xffffff, 0.6));
const fftDirLight = new THREE.DirectionalLight(0xffffff, 0.8);
fftDirLight.position.set(5, 15, 10);
fftScene.add(fftDirLight);

// Pivot
const fftPivotMesh = new THREE.Mesh(
  new THREE.BoxGeometry(2, 0.2, 0.2),
  new THREE.MeshStandardMaterial({ color: 0x333333 })
);
fftPivotMesh.position.set(0, 10, 0);
fftScene.add(fftPivotMesh);

// Rope
const fftRopeGeo = new THREE.BufferGeometry();
const fftRopePos = new Float32Array(6);
fftRopeGeo.setAttribute('position', new THREE.BufferAttribute(fftRopePos, 3));
const fftRopeLine = new THREE.Line(fftRopeGeo, new THREE.LineBasicMaterial({ color: 0x333333 }));
fftScene.add(fftRopeLine);

// Bob
const fftBob = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x111111 })
);
fftScene.add(fftBob);

// Pen
const fftPen = new THREE.Mesh(
  new THREE.SphereGeometry(0.12, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xcc0000 })
);
fftScene.add(fftPen);

// Paper
const FFT_PAPER_W = 10;
const FFT_PAPER_L = 30;
const fftPaperMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(FFT_PAPER_W, FFT_PAPER_L),
  new THREE.MeshStandardMaterial({ color: 0xfafafa, side: THREE.DoubleSide })
);
fftPaperMesh.rotation.x = -Math.PI / 2;
fftPaperMesh.position.set(0, 0, -FFT_PAPER_L * 0.4);
fftScene.add(fftPaperMesh);

// Grid
const fftGridMat = new THREE.LineBasicMaterial({ color: 0xe0e0e0 });
for (let i = -Math.floor(FFT_PAPER_L / 2); i <= 0; i += 2) {
  const g = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-FFT_PAPER_W / 2, 0.01, i),
    new THREE.Vector3(FFT_PAPER_W / 2, 0.01, i),
  ]);
  fftScene.add(new THREE.Line(g, fftGridMat));
}

// Trace
const FFT_TRACE_PTS = 2000;
const fftTracePos = new Float32Array(FFT_TRACE_PTS * 3);
const fftTraceGeo = new THREE.BufferGeometry();
fftTraceGeo.setAttribute('position', new THREE.BufferAttribute(fftTracePos, 3));
const fftTraceLine = new THREE.Line(fftTraceGeo, new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 }));
fftScene.add(fftTraceLine);

// Parameters
const FFT_ROPE = 8;
const FFT_SPEED = 2.5;
const FFT_PEN_Y = 0.05;
const FFT_BASE_FREQ = 0.417;

// Random harmonics state
const fftDefaultH = [{ n: 1, amp: 0.03, phase: 0 }];
let fftRandomHistory = [];
const FFT_RANDOM_DUR = 1.0;
const FFT_FADE_IN = 0.15;
const FFT_FADE_OUT = 0.3;

function fftAngleAt(t) {
  // Default sine (always running)
  let val = 0;
  fftDefaultH.forEach(hh => {
    val += hh.amp * Math.sin(t * Math.PI * 2 * FFT_BASE_FREQ * hh.n + hh.phase);
  });

  // Apply all random bursts from history
  for (let ri = 0; ri < fftRandomHistory.length; ri++) {
    const rec = fftRandomHistory[ri];
    const elapsed = t - rec.start;
    if (elapsed >= 0 && elapsed < FFT_RANDOM_DUR) {
      let env = 1;
      if (elapsed < FFT_FADE_IN) {
        env = elapsed / FFT_FADE_IN;
        env = env * env;
      } else if (elapsed > FFT_RANDOM_DUR - FFT_FADE_OUT) {
        env = (FFT_RANDOM_DUR - elapsed) / FFT_FADE_OUT;
        env = env * env;
      }
      let rVal = 0;
      rec.harmonics.forEach(hh => {
        rVal += hh.amp * Math.sin(t * Math.PI * 2 * FFT_BASE_FREQ * hh.n + hh.phase);
      });
      val = val * (1 - env) + rVal * env;
    }
  }

  return val;
}

// Randomize button: random wave for 1 second, then back to sine
document.getElementById('fftRandomBtn').addEventListener('click', () => {
  const numH = 3 + Math.floor(Math.random() * 5);
  const harmonics = [];
  for (let i = 0; i < numH; i++) {
    harmonics.push({
      n: i + 1,
      amp: (0.15 + Math.random() * 0.35) / (i + 1),
      phase: Math.random() * Math.PI * 2,
    });
  }
  fftRandomHistory.push({ start: performance.now() / 1000, harmonics });
  // Keep only recent entries to avoid memory buildup
  const now = performance.now() / 1000;
  fftRandomHistory = fftRandomHistory.filter(r => now - r.start < 30);
});

function resizeSlide29() {
  const rect = fftPendEl.parentElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    fftRenderer.setSize(rect.width, rect.height);
    fftCamera.aspect = rect.width / rect.height;
    fftCamera.updateProjectionMatrix();
  }
}
window.addEventListener('resize', () => { if (current === 28) resizeSlide29(); });

function animateSlide29() {
  requestAnimationFrame(animateSlide29);
  if (current !== 28) return;

  const t = performance.now() / 1000;
  const angle = fftAngleAt(t);

  const bobX = Math.sin(angle) * FFT_ROPE;
  const bobY = 10 - Math.cos(angle) * FFT_ROPE;
  fftBob.position.set(bobX, bobY, 0);
  fftPen.position.set(bobX, FFT_PEN_Y, 0);

  const rp = fftRopeGeo.getAttribute('position');
  rp.setXYZ(0, 0, 10, 0);
  rp.setXYZ(1, bobX, bobY, 0);
  rp.needsUpdate = true;

  // Trace: continuous scroll, uses fftAngleAt which switches harmonics at fftChangeTime
  const tp = fftTraceGeo.getAttribute('position');
  const traceLen = FFT_PAPER_L;
  for (let i = 0; i < FFT_TRACE_PTS; i++) {
    const timePast = (FFT_TRACE_PTS - i) / FFT_TRACE_PTS * (traceLen / FFT_SPEED);
    const pastT = t - timePast;
    const pastAngle = fftAngleAt(pastT);
    const pastBobX = Math.sin(pastAngle) * FFT_ROPE;
    tp.setXYZ(i, pastBobX, FFT_PEN_Y, -timePast * FFT_SPEED);
  }
  tp.needsUpdate = true;
  fftTraceGeo.setDrawRange(0, FFT_TRACE_PTS);

  fftControls.update();
  fftRenderer.render(fftScene, fftCamera);
}

setTimeout(() => { resizeSlide29(); }, 100);
animateSlide29();

// ─── Slide 31: Fourier Winding Machine ───
const fwTimeCanvas = document.getElementById('fwTimeCanvas');
const fwTimeCtx = fwTimeCanvas.getContext('2d');
const fwWindCanvas = document.getElementById('fwWindCanvas');
const fwWindCtx = fwWindCanvas.getContext('2d');
const fwGraphCanvas = document.getElementById('fwGraphCanvas');
const fwGraphCtx = fwGraphCanvas.getContext('2d');
const fwWindFreqLabel = document.getElementById('fwWindFreqLabel');

let fwActiveFreqs = new Set();

// Build frequency buttons
const fwFreqGrid = document.getElementById('fwFreqGrid');
for (let f = 1; f <= 10; f++) {
  const btn = document.createElement('button');
  btn.className = 'fw-freq-btn';
  btn.textContent = f + ' Hz';
  btn.addEventListener('click', () => {
    if (fwActiveFreqs.has(f)) { fwActiveFreqs.delete(f); btn.classList.remove('active'); }
    else { fwActiveFreqs.add(f); btn.classList.add('active'); }
    // Reset winding results
    fwWindState = 'idle';
    fwComResults = [];
  });
  fwFreqGrid.appendChild(btn);
}

function fwSignal(t) {
  let val = 0;
  fwActiveFreqs.forEach(f => { val += Math.sin(t * Math.PI * 2 * f); });
  return val;
}

// Winding state
let fwWindState = 'idle'; // 'idle' | 'winding' | 'done'
let fwWindStartTime = 0;
const FW_WIND_DUR = 12; // seconds to sweep from 0.5 to 10.5
const FW_FREQ_MIN = 0.5;
const FW_FREQ_MAX = 10.5;
let fwCurrentWindFreq = 0;
let fwComResults = []; // array of { freq, magnitude }

const FW_SAMPLES = 400;
const FW_DURATION = 3;

// Compute COM magnitude for a given winding frequency
function fwComputeCom(windFreq) {
  const maxAmp = Math.max(fwActiveFreqs.size, 1);
  let comX = 0, comY = 0;
  for (let i = 0; i <= FW_SAMPLES; i++) {
    const t = (i / FW_SAMPLES) * FW_DURATION;
    const val = fwSignal(t) / maxAmp;
    const angle = -t * windFreq * Math.PI * 2;
    const r = 0.5 + val * 0.4;
    comX += r * Math.cos(angle);
    comY += r * Math.sin(angle);
  }
  comX /= (FW_SAMPLES + 1);
  comY /= (FW_SAMPLES + 1);
  return Math.sqrt(comX * comX + comY * comY);
}

document.getElementById('fwWindBtn').addEventListener('click', () => {
  if (fwActiveFreqs.size === 0) return;
  fwWindState = 'winding';
  fwWindStartTime = performance.now() / 1000;
  fwComResults = [];
});

function resizeSlide31() {
  [fwTimeCanvas, fwWindCanvas, fwGraphCanvas].forEach(c => {
    const rect = c.parentElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      c.width = rect.width * devicePixelRatio;
      c.height = rect.height * devicePixelRatio;
      c.style.width = rect.width + 'px';
      c.style.height = rect.height + 'px';
    }
  });
}
window.addEventListener('resize', () => { if (current === 30) resizeSlide31(); });

function animateSlide31() {
  requestAnimationFrame(animateSlide31);
  if (current !== 30) return;

  const t = performance.now() / 1000;

  // Update winding state
  if (fwWindState === 'winding') {
    const elapsed = t - fwWindStartTime;
    const progress = Math.min(elapsed / FW_WIND_DUR, 1);
    fwCurrentWindFreq = FW_FREQ_MIN + progress * (FW_FREQ_MAX - FW_FREQ_MIN);
    fwWindFreqLabel.textContent = fwCurrentWindFreq.toFixed(1);

    // Compute COM for current freq
    const mag = fwComputeCom(fwCurrentWindFreq);
    fwComResults.push({ freq: fwCurrentWindFreq, magnitude: mag });

    if (progress >= 1) fwWindState = 'done';
  }

  const dpr = devicePixelRatio;

  // ── Time domain ──
  const tw = fwTimeCanvas.width, th = fwTimeCanvas.height;
  if (tw > 0 && th > 0) {
    fwTimeCtx.clearRect(0, 0, tw, th);
    const midY = th * 0.5;
    const amp = th * 0.38;
    const mx = tw * 0.03;
    const pw = tw - mx * 2;

    fwTimeCtx.beginPath();
    fwTimeCtx.moveTo(mx, midY);
    fwTimeCtx.lineTo(mx + pw, midY);
    fwTimeCtx.strokeStyle = '#eee';
    fwTimeCtx.lineWidth = 1 * dpr;
    fwTimeCtx.stroke();

    if (fwActiveFreqs.size === 0) {
      fwTimeCtx.font = `${Math.round(12 * dpr)}px 'Playfair Display', serif`;
      fwTimeCtx.fillStyle = '#ccc';
      fwTimeCtx.textAlign = 'center';
      fwTimeCtx.fillText('Add frequencies with the buttons', tw * 0.5, midY);
    } else {
      const maxA = fwActiveFreqs.size;
      fwTimeCtx.beginPath();
      for (let i = 0; i <= FW_SAMPLES; i++) {
        const st = (i / FW_SAMPLES) * FW_DURATION;
        const val = fwSignal(st) / maxA;
        const x = mx + (i / FW_SAMPLES) * pw;
        const y = midY - val * amp;
        if (i === 0) fwTimeCtx.moveTo(x, y); else fwTimeCtx.lineTo(x, y);
      }
      fwTimeCtx.strokeStyle = '#000';
      fwTimeCtx.lineWidth = 2 * dpr;
      fwTimeCtx.stroke();
    }
  }

  // ── Winding circle ──
  const ww = fwWindCanvas.width, wh = fwWindCanvas.height;
  if (ww > 0 && wh > 0) {
    fwWindCtx.clearRect(0, 0, ww, wh);
    const cx = ww * 0.5, cy = wh * 0.5;
    const radius = Math.min(ww, wh) * 0.4;

    // Circle
    fwWindCtx.beginPath();
    fwWindCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    fwWindCtx.strokeStyle = '#eee';
    fwWindCtx.lineWidth = 1 * dpr;
    fwWindCtx.stroke();

    // Crosshair
    fwWindCtx.beginPath();
    fwWindCtx.moveTo(cx - radius, cy);
    fwWindCtx.lineTo(cx + radius, cy);
    fwWindCtx.moveTo(cx, cy - radius);
    fwWindCtx.lineTo(cx, cy + radius);
    fwWindCtx.strokeStyle = '#f0f0f0';
    fwWindCtx.stroke();

    if (fwActiveFreqs.size > 0 && (fwWindState === 'winding' || fwWindState === 'done')) {
      const windF = fwWindState === 'done' ? fwCurrentWindFreq : fwCurrentWindFreq;
      const maxA = fwActiveFreqs.size;
      let comPx = 0, comPy = 0;

      fwWindCtx.beginPath();
      for (let i = 0; i <= FW_SAMPLES; i++) {
        const st = (i / FW_SAMPLES) * FW_DURATION;
        const val = fwSignal(st) / maxA;
        const angle = -st * windF * Math.PI * 2;
        const r = radius * (0.5 + val * 0.4);
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        comPx += px; comPy += py;
        if (i === 0) fwWindCtx.moveTo(px, py); else fwWindCtx.lineTo(px, py);
      }
      fwWindCtx.strokeStyle = 'rgba(0,0,0,0.4)';
      fwWindCtx.lineWidth = 1.5 * dpr;
      fwWindCtx.stroke();

      comPx /= (FW_SAMPLES + 1);
      comPy /= (FW_SAMPLES + 1);

      // COM line + dot
      fwWindCtx.beginPath();
      fwWindCtx.moveTo(cx, cy);
      fwWindCtx.lineTo(comPx, comPy);
      fwWindCtx.strokeStyle = 'rgba(200,0,0,0.6)';
      fwWindCtx.lineWidth = 2.5 * dpr;
      fwWindCtx.stroke();

      fwWindCtx.beginPath();
      fwWindCtx.arc(comPx, comPy, 5 * dpr, 0, Math.PI * 2);
      fwWindCtx.fillStyle = '#c0392b';
      fwWindCtx.fill();
    }

    // Center dot
    fwWindCtx.beginPath();
    fwWindCtx.arc(cx, cy, 3 * dpr, 0, Math.PI * 2);
    fwWindCtx.fillStyle = '#aaa';
    fwWindCtx.fill();
  }

  // ── COM magnitude graph ──
  const gw = fwGraphCanvas.width, gh = fwGraphCanvas.height;
  if (gw > 0 && gh > 0) {
    fwGraphCtx.clearRect(0, 0, gw, gh);
    const gml = gw * 0.1, gmr = gw * 0.04, gmt = gh * 0.08, gmb = gh * 0.14;
    const gpw = gw - gml - gmr, gph = gh - gmt - gmb;

    // Axes
    fwGraphCtx.strokeStyle = '#ccc';
    fwGraphCtx.lineWidth = 1 * dpr;
    fwGraphCtx.beginPath();
    fwGraphCtx.moveTo(gml, gmt);
    fwGraphCtx.lineTo(gml, gmt + gph);
    fwGraphCtx.lineTo(gml + gpw, gmt + gph);
    fwGraphCtx.stroke();

    // X ticks
    fwGraphCtx.font = `${Math.round(10 * dpr)}px 'Playfair Display', serif`;
    fwGraphCtx.fillStyle = '#bbb';
    fwGraphCtx.textAlign = 'center';
    for (let f = 1; f <= 10; f++) {
      const x = gml + ((f - FW_FREQ_MIN) / (FW_FREQ_MAX - FW_FREQ_MIN)) * gpw;
      fwGraphCtx.fillText(f, x, gmt + gph + 14 * dpr);
      // Tick
      fwGraphCtx.beginPath();
      fwGraphCtx.moveTo(x, gmt + gph);
      fwGraphCtx.lineTo(x, gmt + gph + 4 * dpr);
      fwGraphCtx.strokeStyle = '#ccc';
      fwGraphCtx.stroke();
    }
    fwGraphCtx.fillText('Hz', gml + gpw + 14 * dpr, gmt + gph + 14 * dpr);

    // Y label
    fwGraphCtx.save();
    fwGraphCtx.translate(12 * dpr, gmt + gph * 0.5);
    fwGraphCtx.rotate(-Math.PI / 2);
    fwGraphCtx.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display', serif`;
    fwGraphCtx.fillStyle = '#bbb';
    fwGraphCtx.textAlign = 'center';
    fwGraphCtx.fillText('Magnitude', 0, 0);
    fwGraphCtx.restore();

    // Draw active frequency markers (vertical lines)
    fwActiveFreqs.forEach(f => {
      const x = gml + ((f - FW_FREQ_MIN) / (FW_FREQ_MAX - FW_FREQ_MIN)) * gpw;
      fwGraphCtx.beginPath();
      fwGraphCtx.moveTo(x, gmt);
      fwGraphCtx.lineTo(x, gmt + gph);
      fwGraphCtx.strokeStyle = 'rgba(0,100,255,0.1)';
      fwGraphCtx.lineWidth = 2 * dpr;
      fwGraphCtx.stroke();
    });

    // Plot COM results
    if (fwComResults.length > 1) {
      const maxMag = Math.max(...fwComResults.map(r => r.magnitude), 0.01);

      // Filled area
      fwGraphCtx.beginPath();
      fwGraphCtx.moveTo(gml, gmt + gph);
      fwComResults.forEach(r => {
        const x = gml + ((r.freq - FW_FREQ_MIN) / (FW_FREQ_MAX - FW_FREQ_MIN)) * gpw;
        const y = gmt + gph - (r.magnitude / maxMag) * gph * 0.9;
        fwGraphCtx.lineTo(x, y);
      });
      fwGraphCtx.lineTo(gml + ((fwComResults[fwComResults.length - 1].freq - FW_FREQ_MIN) / (FW_FREQ_MAX - FW_FREQ_MIN)) * gpw, gmt + gph);
      fwGraphCtx.closePath();
      fwGraphCtx.fillStyle = 'rgba(200,0,0,0.08)';
      fwGraphCtx.fill();

      // Line
      fwGraphCtx.beginPath();
      fwComResults.forEach((r, i) => {
        const x = gml + ((r.freq - FW_FREQ_MIN) / (FW_FREQ_MAX - FW_FREQ_MIN)) * gpw;
        const y = gmt + gph - (r.magnitude / maxMag) * gph * 0.9;
        if (i === 0) fwGraphCtx.moveTo(x, y); else fwGraphCtx.lineTo(x, y);
      });
      fwGraphCtx.strokeStyle = '#c0392b';
      fwGraphCtx.lineWidth = 2.5 * dpr;
      fwGraphCtx.stroke();
    }
  }
}

setTimeout(() => { resizeSlide31(); }, 100);
animateSlide31();

// ─── Slide 32: DFT Visualization ───
const dftTimeCanvas = document.getElementById('dftTimeCanvas');
const dftTimeCtx = dftTimeCanvas.getContext('2d');
const dftFreqCanvas = document.getElementById('dftFreqCanvas');
const dftFreqCtx = dftFreqCanvas.getContext('2d');

let dftActiveFreqs = new Set();
const dftFreqGrid = document.getElementById('dftFreqGrid');
for (let f = 1; f <= 10; f++) {
  const btn = document.createElement('button');
  btn.className = 'dft-freq-btn';
  btn.textContent = f + ' Hz';
  btn.addEventListener('click', () => {
    if (dftActiveFreqs.has(f)) { dftActiveFreqs.delete(f); btn.classList.remove('active'); }
    else { dftActiveFreqs.add(f); btn.classList.add('active'); }
  });
  dftFreqGrid.appendChild(btn);
}

const DFT_N = 64; // number of samples
const DFT_DURATION = 2; // seconds of signal

function resizeSlide32() {
  [dftTimeCanvas, dftFreqCanvas].forEach(c => {
    const rect = c.parentElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      c.width = rect.width * devicePixelRatio;
      c.height = rect.height * devicePixelRatio;
      c.style.width = rect.width + 'px';
      c.style.height = rect.height + 'px';
    }
  });
}
window.addEventListener('resize', () => { if (current === 31) resizeSlide32(); });

function animateSlide32() {
  requestAnimationFrame(animateSlide32);
  if (current !== 31) return;

  const dpr = devicePixelRatio;

  // Generate samples
  const samples = new Float64Array(DFT_N);
  const maxA = Math.max(dftActiveFreqs.size, 1);
  for (let n = 0; n < DFT_N; n++) {
    const t = (n / DFT_N) * DFT_DURATION;
    let val = 0;
    dftActiveFreqs.forEach(f => { val += Math.sin(t * Math.PI * 2 * f); });
    samples[n] = val / maxA;
  }

  // Compute DFT magnitudes
  const mags = new Float64Array(DFT_N / 2);
  for (let k = 0; k < DFT_N / 2; k++) {
    let re = 0, im = 0;
    for (let n = 0; n < DFT_N; n++) {
      const angle = -2 * Math.PI * k * n / DFT_N;
      re += samples[n] * Math.cos(angle);
      im += samples[n] * Math.sin(angle);
    }
    mags[k] = Math.sqrt(re * re + im * im) / DFT_N * 2;
  }

  // ── Time domain ──
  const tw = dftTimeCanvas.width, th = dftTimeCanvas.height;
  if (tw > 0 && th > 0) {
    dftTimeCtx.clearRect(0, 0, tw, th);
    const ml = tw * 0.06, mr = tw * 0.04, mt = th * 0.08, mb = th * 0.1;
    const pw = tw - ml - mr, ph = th - mt - mb;
    const midY = mt + ph * 0.5;

    // Center line
    dftTimeCtx.beginPath();
    dftTimeCtx.moveTo(ml, midY);
    dftTimeCtx.lineTo(ml + pw, midY);
    dftTimeCtx.strokeStyle = '#eee';
    dftTimeCtx.lineWidth = 1 * dpr;
    dftTimeCtx.stroke();

    if (dftActiveFreqs.size === 0) {
      dftTimeCtx.font = `${Math.round(12 * dpr)}px 'Playfair Display', serif`;
      dftTimeCtx.fillStyle = '#ccc';
      dftTimeCtx.textAlign = 'center';
      dftTimeCtx.fillText('Add frequencies', tw * 0.5, midY);
      return;
    }

    // Continuous wave (ghost)
    dftTimeCtx.beginPath();
    const contPts = 300;
    for (let i = 0; i <= contPts; i++) {
      const t = (i / contPts) * DFT_DURATION;
      let val = 0;
      dftActiveFreqs.forEach(f => { val += Math.sin(t * Math.PI * 2 * f); });
      val /= maxA;
      const x = ml + (i / contPts) * pw;
      const y = midY - val * ph * 0.42;
      if (i === 0) dftTimeCtx.moveTo(x, y); else dftTimeCtx.lineTo(x, y);
    }
    dftTimeCtx.strokeStyle = 'rgba(0,0,0,0.12)';
    dftTimeCtx.lineWidth = 1.5 * dpr;
    dftTimeCtx.stroke();

    // Sample points + stems
    for (let n = 0; n < DFT_N; n++) {
      const x = ml + (n / DFT_N) * pw;
      const y = midY - samples[n] * ph * 0.42;

      // Stem
      dftTimeCtx.beginPath();
      dftTimeCtx.moveTo(x, midY);
      dftTimeCtx.lineTo(x, y);
      dftTimeCtx.strokeStyle = 'rgba(0,0,0,0.3)';
      dftTimeCtx.lineWidth = 1 * dpr;
      dftTimeCtx.stroke();

      // Dot
      dftTimeCtx.beginPath();
      dftTimeCtx.arc(x, y, 3 * dpr, 0, Math.PI * 2);
      dftTimeCtx.fillStyle = '#000';
      dftTimeCtx.fill();
    }

    // Label
    dftTimeCtx.font = `${Math.round(10 * dpr)}px 'Playfair Display', serif`;
    dftTimeCtx.fillStyle = '#aaa';
    dftTimeCtx.textAlign = 'right';
    dftTimeCtx.fillText('N = ' + DFT_N + ' samples', ml + pw, mt - 4 * dpr);
  }

  // ── Frequency domain ──
  const fw = dftFreqCanvas.width, fh = dftFreqCanvas.height;
  if (fw > 0 && fh > 0) {
    dftFreqCtx.clearRect(0, 0, fw, fh);
    const ml = fw * 0.06, mr = fw * 0.04, mt = fh * 0.08, mb = fh * 0.12;
    const pw = fw - ml - mr, ph = fh - mt - mb;

    // Find max for normalization
    const maxMag = Math.max(...mags, 0.01);

    // Frequency resolution
    const freqRes = 1 / DFT_DURATION; // Hz per bin

    // X axis
    dftFreqCtx.beginPath();
    dftFreqCtx.moveTo(ml, mt + ph);
    dftFreqCtx.lineTo(ml + pw, mt + ph);
    dftFreqCtx.strokeStyle = '#ccc';
    dftFreqCtx.lineWidth = 1 * dpr;
    dftFreqCtx.stroke();

    // Draw bars
    const barW = pw / (DFT_N / 2) * 0.7;
    const barGap = pw / (DFT_N / 2);

    for (let k = 0; k < DFT_N / 2; k++) {
      const freq = k * freqRes;
      if (freq > 12) break; // only show up to 12 Hz
      const barH = (mags[k] / maxMag) * ph * 0.9;
      const x = ml + (freq / 12) * pw;
      const y = mt + ph - barH;

      // Check if this is near an active frequency
      let isActive = false;
      dftActiveFreqs.forEach(f => {
        if (Math.abs(freq - f) < freqRes * 0.6) isActive = true;
      });

      dftFreqCtx.fillStyle = isActive ? 'rgba(200,0,0,0.7)' : 'rgba(0,0,0,0.3)';
      dftFreqCtx.fillRect(x - barW * 0.5, y, barW, barH);
    }

    // X tick labels
    dftFreqCtx.font = `${Math.round(10 * dpr)}px 'Playfair Display', serif`;
    dftFreqCtx.fillStyle = '#aaa';
    dftFreqCtx.textAlign = 'center';
    for (let f = 0; f <= 12; f += 2) {
      const x = ml + (f / 12) * pw;
      dftFreqCtx.fillText(f + ' Hz', x, mt + ph + 14 * dpr);
    }
  }
}

setTimeout(() => { resizeSlide32(); }, 100);
animateSlide32();

// ─── Slide 33: DFT Complexity ───
const cxGridCanvas = document.getElementById('cxGridCanvas');
const cxGridCtx = cxGridCanvas.getContext('2d');
const cxChartCanvas = document.getElementById('cxChartCanvas');
const cxChartCtx = cxChartCanvas.getContext('2d');
const cxNSlider = document.getElementById('cxNSlider');
const cxNVal = document.getElementById('cxNVal');
const cxOpsLabel = document.getElementById('cxOpsLabel');

// Slider gives exponent: N = 2^val
cxNSlider.addEventListener('input', () => { drawSlide33(); });

function resizeSlide33() {
  [cxGridCanvas, cxChartCanvas].forEach(c => {
    const rect = c.parentElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      c.width = rect.width * devicePixelRatio;
      c.height = rect.height * devicePixelRatio;
      c.style.width = rect.width + 'px';
      c.style.height = rect.height + 'px';
    }
  });
  drawSlide33();
}
window.addEventListener('resize', () => { if (current === 32) resizeSlide33(); });

function formatNum(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toString();
}

function drawSlide33() {
  const exp = parseInt(cxNSlider.value);
  const N = Math.pow(2, exp);
  const dftOps = N * N;
  const fftOps = N * exp; // N * log2(N)

  cxNVal.textContent = N.toLocaleString();
  cxOpsLabel.textContent = `DFT: ${formatNum(dftOps)} ops / FFT: ${formatNum(fftOps)} ops (${Math.round(dftOps / fftOps)}× faster)`;

  const dpr = devicePixelRatio;

  // ── Grid ──
  const gw = cxGridCanvas.width, gh = cxGridCanvas.height;
  if (gw > 0 && gh > 0) {
    cxGridCtx.clearRect(0, 0, gw, gh);

    const margin = Math.min(gw, gh) * 0.08;
    const gridSize = Math.min(gw - margin * 2, gh - margin * 2);
    const ox = (gw - gridSize) / 2;
    const oy = (gh - gridSize) / 2;

    // Limit visual grid to max 64x64 cells
    const visualN = Math.min(N, 64);
    const cellSize = gridSize / visualN;

    // Draw cells
    for (let r = 0; r < visualN; r++) {
      for (let c = 0; c < visualN; c++) {
        const x = ox + c * cellSize;
        const y = oy + r * cellSize;
        cxGridCtx.fillStyle = `rgba(0, 0, 0, ${0.15 + Math.random() * 0.15})`;
        cxGridCtx.fillRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
      }
    }

    // Border
    cxGridCtx.strokeStyle = '#000';
    cxGridCtx.lineWidth = 2 * dpr;
    cxGridCtx.strokeRect(ox, oy, gridSize, gridSize);

    // Labels
    cxGridCtx.font = `bold ${Math.round(12 * dpr)}px 'Playfair Display', serif`;
    cxGridCtx.fillStyle = '#000';
    cxGridCtx.textAlign = 'center';
    cxGridCtx.fillText('N = ' + N, ox + gridSize / 2, oy - 8 * dpr);

    // Row/col labels
    cxGridCtx.font = `${Math.round(10 * dpr)}px 'Playfair Display', serif`;
    cxGridCtx.fillStyle = '#888';
    cxGridCtx.save();
    cxGridCtx.translate(ox - 8 * dpr, oy + gridSize / 2);
    cxGridCtx.rotate(-Math.PI / 2);
    cxGridCtx.fillText('frequency bins (k)', 0, 0);
    cxGridCtx.restore();
    cxGridCtx.fillText('samples (n)', ox + gridSize / 2, oy + gridSize + 16 * dpr);

    // Total ops
    cxGridCtx.font = `bold ${Math.round(13 * dpr)}px 'Playfair Display', serif`;
    cxGridCtx.fillStyle = '#c0392b';
    cxGridCtx.fillText(N + ' × ' + N + ' = ' + formatNum(dftOps) + ' operations', ox + gridSize / 2, oy + gridSize + 34 * dpr);

    if (N > 64) {
      cxGridCtx.font = `${Math.round(10 * dpr)}px 'Playfair Display', serif`;
      cxGridCtx.fillStyle = '#aaa';
      cxGridCtx.fillText('(showing 64×64 of ' + N + '×' + N + ')', ox + gridSize / 2, oy + gridSize + 50 * dpr);
    }
  }

  // ── Comparison chart ──
  const cw = cxChartCanvas.width, ch = cxChartCanvas.height;
  if (cw > 0 && ch > 0) {
    cxChartCtx.clearRect(0, 0, cw, ch);

    const ml = cw * 0.12, mr = cw * 0.06, mt = ch * 0.06, mb = ch * 0.14;
    const pw = cw - ml - mr, ph = ch - mt - mb;

    // Plot N² and N log N for exponents 3..16
    const points = [];
    let maxVal = 0;
    for (let e = 3; e <= 16; e++) {
      const n = Math.pow(2, e);
      const d = n * n;
      const f = n * e;
      points.push({ e, n, dft: d, fft: f });
      if (d > maxVal) maxVal = d;
    }

    // Use log scale for Y
    const logMax = Math.log10(maxVal);
    const logMin = Math.log10(points[0].fft);

    // Axes
    cxChartCtx.strokeStyle = '#ccc';
    cxChartCtx.lineWidth = 1 * dpr;
    cxChartCtx.beginPath();
    cxChartCtx.moveTo(ml, mt);
    cxChartCtx.lineTo(ml, mt + ph);
    cxChartCtx.lineTo(ml + pw, mt + ph);
    cxChartCtx.stroke();

    // Y ticks (log)
    cxChartCtx.font = `${Math.round(9 * dpr)}px monospace`;
    cxChartCtx.fillStyle = '#bbb';
    cxChartCtx.textAlign = 'right';
    for (let p = 2; p <= Math.ceil(logMax); p += 2) {
      const y = mt + ph - ((p - logMin) / (logMax - logMin)) * ph;
      if (y < mt || y > mt + ph) continue;
      cxChartCtx.beginPath();
      cxChartCtx.moveTo(ml, y);
      cxChartCtx.lineTo(ml + pw, y);
      cxChartCtx.strokeStyle = '#f0f0f0';
      cxChartCtx.stroke();
      cxChartCtx.fillText('10^' + p, ml - 6 * dpr, y + 4 * dpr);
    }

    // X ticks
    cxChartCtx.textAlign = 'center';
    cxChartCtx.fillStyle = '#bbb';
    points.forEach((pt, i) => {
      if (i % 2 === 0 || pt.e === parseInt(cxNSlider.value)) {
        const x = ml + ((pt.e - 3) / 13) * pw;
        cxChartCtx.fillText(formatNum(pt.n), x, mt + ph + 14 * dpr);
      }
    });
    cxChartCtx.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display', serif`;
    cxChartCtx.fillText('N', ml + pw + 12 * dpr, mt + ph + 14 * dpr);

    // DFT curve (N²)
    cxChartCtx.beginPath();
    points.forEach((pt, i) => {
      const x = ml + ((pt.e - 3) / 13) * pw;
      const y = mt + ph - ((Math.log10(pt.dft) - logMin) / (logMax - logMin)) * ph;
      if (i === 0) cxChartCtx.moveTo(x, y); else cxChartCtx.lineTo(x, y);
    });
    cxChartCtx.strokeStyle = '#c0392b';
    cxChartCtx.lineWidth = 2.5 * dpr;
    cxChartCtx.stroke();

    // FFT curve (N log N)
    cxChartCtx.beginPath();
    points.forEach((pt, i) => {
      const x = ml + ((pt.e - 3) / 13) * pw;
      const y = mt + ph - ((Math.log10(pt.fft) - logMin) / (logMax - logMin)) * ph;
      if (i === 0) cxChartCtx.moveTo(x, y); else cxChartCtx.lineTo(x, y);
    });
    cxChartCtx.strokeStyle = '#27ae60';
    cxChartCtx.lineWidth = 2.5 * dpr;
    cxChartCtx.stroke();

    // Legend
    cxChartCtx.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display', serif`;
    cxChartCtx.textAlign = 'left';
    // DFT
    cxChartCtx.fillStyle = '#c0392b';
    cxChartCtx.fillRect(ml + 10 * dpr, mt + 6 * dpr, 16 * dpr, 3 * dpr);
    cxChartCtx.fillText('DFT  O(N²)', ml + 30 * dpr, mt + 12 * dpr);
    // FFT
    cxChartCtx.fillStyle = '#27ae60';
    cxChartCtx.fillRect(ml + 10 * dpr, mt + 24 * dpr, 16 * dpr, 3 * dpr);
    cxChartCtx.fillText('FFT  O(N log N)', ml + 30 * dpr, mt + 30 * dpr);

    // Current N marker
    const curE = parseInt(cxNSlider.value);
    const curX = ml + ((curE - 3) / 13) * pw;
    cxChartCtx.beginPath();
    cxChartCtx.moveTo(curX, mt);
    cxChartCtx.lineTo(curX, mt + ph);
    cxChartCtx.strokeStyle = 'rgba(0,0,0,0.2)';
    cxChartCtx.lineWidth = 2 * dpr;
    cxChartCtx.setLineDash([4 * dpr, 4 * dpr]);
    cxChartCtx.stroke();
    cxChartCtx.setLineDash([]);

    // Current N dots
    const curPt = points.find(p => p.e === curE);
    if (curPt) {
      const dftY = mt + ph - ((Math.log10(curPt.dft) - logMin) / (logMax - logMin)) * ph;
      const fftY = mt + ph - ((Math.log10(curPt.fft) - logMin) / (logMax - logMin)) * ph;

      cxChartCtx.beginPath();
      cxChartCtx.arc(curX, dftY, 5 * dpr, 0, Math.PI * 2);
      cxChartCtx.fillStyle = '#c0392b';
      cxChartCtx.fill();

      cxChartCtx.beginPath();
      cxChartCtx.arc(curX, fftY, 5 * dpr, 0, Math.PI * 2);
      cxChartCtx.fillStyle = '#27ae60';
      cxChartCtx.fill();
    }
  }
}

setTimeout(() => { resizeSlide33(); }, 100);

// ─── Slide 34: DFT vs FFT Animation ───
const daDftCanvas = document.getElementById('daDftCanvas');
const daDftCtx = daDftCanvas.getContext('2d');
const daFftCanvas = document.getElementById('daFftCanvas');
const daFftCtx = daFftCanvas.getContext('2d');
const daDftCounter = document.getElementById('daDftCounter');
const daFftCounter = document.getElementById('daFftCounter');

const DA_N = 8; // 8-point for clarity
const DA_SPEED = 80; // ms per step

let daRunning = false;
let daDftOps = 0;
let daFftOps = 0;
let daDftVisited = []; // array of [row, col] pairs in order
let daFftStages = [];  // array of { stage, pairs: [[from, to], ...] }
let daDftStep = 0;
let daFftStep = 0;
let daTimer = null;

// Precompute DFT visit order: row by row, all columns
function buildDftOrder() {
  daDftVisited = [];
  for (let k = 0; k < DA_N; k++) {
    for (let n = 0; n < DA_N; n++) {
      daDftVisited.push([k, n]);
    }
  }
}

// Precompute FFT butterfly stages for N=8 (3 stages)
function buildFftStages() {
  daFftStages = [];
  const logN = Math.log2(DA_N);
  for (let s = 0; s < logN; s++) {
    const halfSize = Math.pow(2, s);
    const fullSize = halfSize * 2;
    const pairs = [];
    for (let i = 0; i < DA_N; i += fullSize) {
      for (let j = 0; j < halfSize; j++) {
        pairs.push([i + j, i + j + halfSize]);
      }
    }
    daFftStages.push({ stage: s, pairs });
  }
}

buildDftOrder();
buildFftStages();

document.getElementById('daPlayBtn').addEventListener('click', () => {
  if (daRunning) return;
  daRunning = true;
  daDftOps = 0;
  daFftOps = 0;
  daDftStep = 0;
  daFftStep = 0;
  daDftCounter.textContent = 'DFT: 0 ops';
  daFftCounter.textContent = 'FFT: 0 ops';

  // Flatten FFT pairs for stepping
  daFftFlatPairs = [];
  daFftStages.forEach(s => {
    s.pairs.forEach(p => {
      daFftFlatPairs.push({ stage: s.stage, pair: p });
    });
  });

  daTimer = setInterval(() => {
    // Advance DFT
    if (daDftStep < daDftVisited.length) {
      daDftStep++;
      daDftOps = daDftStep;
      daDftCounter.textContent = `DFT: ${daDftOps} ops`;
      daDftCounter.style.color = '#c0392b';
    }

    // Advance FFT (faster — multiple steps per tick to show it finishes earlier)
    // FFT total = N*logN = 24, DFT total = 64, ratio ~2.7x
    // But we want FFT to finish proportionally earlier
    if (daFftStep < daFftFlatPairs.length) {
      daFftStep++;
      daFftOps = daFftStep;
      daFftCounter.textContent = `FFT: ${daFftOps} ops`;
      daFftCounter.style.color = '#27ae60';
    }

    drawSlide34();

    if (daDftStep >= daDftVisited.length && daFftStep >= daFftFlatPairs.length) {
      clearInterval(daTimer);
      daRunning = false;
    }
  }, DA_SPEED);
});

let daFftFlatPairs = [];

function resizeSlide34() {
  [daDftCanvas, daFftCanvas].forEach(c => {
    const rect = c.parentElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      c.width = rect.width * devicePixelRatio;
      c.height = rect.height * devicePixelRatio;
      c.style.width = rect.width + 'px';
      c.style.height = rect.height + 'px';
    }
  });
  drawSlide34();
}
window.addEventListener('resize', () => { if (current === 33) resizeSlide34(); });

function drawSlide34() {
  const dpr = devicePixelRatio;

  // ── DFT Grid ──
  const dw = daDftCanvas.width, dh = daDftCanvas.height;
  if (dw > 0 && dh > 0) {
    daDftCtx.clearRect(0, 0, dw, dh);
    const margin = Math.min(dw, dh) * 0.1;
    const gridSize = Math.min(dw - margin * 2, dh - margin * 2);
    const ox = (dw - gridSize) / 2;
    const oy = (dh - gridSize) / 2;
    const cellSize = gridSize / DA_N;

    // Draw all cells
    for (let r = 0; r < DA_N; r++) {
      for (let c = 0; c < DA_N; c++) {
        const x = ox + c * cellSize;
        const y = oy + r * cellSize;

        // Check if visited
        const idx = r * DA_N + c;
        if (idx < daDftStep) {
          daDftCtx.fillStyle = 'rgba(192, 57, 43, 0.3)';
        } else {
          daDftCtx.fillStyle = '#f5f5f5';
        }
        daDftCtx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

        // Grid line
        daDftCtx.strokeStyle = '#ddd';
        daDftCtx.lineWidth = 1;
        daDftCtx.strokeRect(x, y, cellSize, cellSize);
      }
    }

    // Current cell highlight
    if (daDftStep > 0 && daDftStep <= daDftVisited.length) {
      const cur = daDftVisited[daDftStep - 1];
      const x = ox + cur[1] * cellSize;
      const y = oy + cur[0] * cellSize;
      daDftCtx.fillStyle = 'rgba(192, 57, 43, 0.8)';
      daDftCtx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
    }

    // Scanning line (current row)
    if (daDftStep > 0 && daDftStep <= daDftVisited.length) {
      const cur = daDftVisited[daDftStep - 1];
      const rowY = oy + cur[0] * cellSize + cellSize / 2;
      daDftCtx.beginPath();
      daDftCtx.moveTo(ox, rowY);
      daDftCtx.lineTo(ox + gridSize, rowY);
      daDftCtx.strokeStyle = 'rgba(192, 57, 43, 0.4)';
      daDftCtx.lineWidth = 2 * dpr;
      daDftCtx.stroke();
    }

    // Labels
    daDftCtx.font = `${Math.round(10 * dpr)}px 'Playfair Display', serif`;
    daDftCtx.fillStyle = '#888';
    daDftCtx.textAlign = 'center';
    for (let i = 0; i < DA_N; i++) {
      daDftCtx.fillText('x[' + i + ']', ox + i * cellSize + cellSize / 2, oy - 6 * dpr);
      daDftCtx.fillText('X[' + i + ']', ox - 20 * dpr, oy + i * cellSize + cellSize / 2 + 4 * dpr);
    }
  }

  // ── FFT Butterfly ──
  const fw = daFftCanvas.width, fh = daFftCanvas.height;
  if (fw > 0 && fh > 0) {
    daFftCtx.clearRect(0, 0, fw, fh);
    const margin = Math.min(fw, fh) * 0.08;
    const stageCount = Math.log2(DA_N); // 3
    const colW = (fw - margin * 2) / (stageCount + 1);
    const rowH = (fh - margin * 2) / DA_N;

    // Draw input nodes (left column)
    daFftCtx.font = `${Math.round(10 * dpr)}px 'Playfair Display', serif`;
    daFftCtx.fillStyle = '#888';
    daFftCtx.textAlign = 'center';

    // Bit-reversed order for FFT input
    const bitRev = [];
    for (let i = 0; i < DA_N; i++) {
      let rev = 0, val = i;
      for (let b = 0; b < stageCount; b++) { rev = (rev << 1) | (val & 1); val >>= 1; }
      bitRev.push(rev);
    }

    for (let i = 0; i < DA_N; i++) {
      const x = margin;
      const y = margin + i * rowH + rowH / 2;
      daFftCtx.beginPath();
      daFftCtx.arc(x, y, 4 * dpr, 0, Math.PI * 2);
      daFftCtx.fillStyle = '#000';
      daFftCtx.fill();
      daFftCtx.fillStyle = '#888';
      daFftCtx.fillText('x[' + bitRev[i] + ']', x, y - 10 * dpr);
    }

    // Draw stage nodes and butterflies
    let flatIdx = 0;
    for (let s = 0; s < stageCount; s++) {
      const stageX = margin + (s + 1) * colW;

      // Nodes for this stage
      for (let i = 0; i < DA_N; i++) {
        const y = margin + i * rowH + rowH / 2;
        daFftCtx.beginPath();
        daFftCtx.arc(stageX, y, 4 * dpr, 0, Math.PI * 2);
        daFftCtx.fillStyle = '#ccc';
        daFftCtx.fill();
      }

      // Butterfly connections
      const stage = daFftStages[s];
      stage.pairs.forEach(pair => {
        const y1 = margin + pair[0] * rowH + rowH / 2;
        const y2 = margin + pair[1] * rowH + rowH / 2;
        const prevX = margin + s * colW;

        const isActive = flatIdx < daFftStep;
        const isCurrent = flatIdx === daFftStep - 1;
        flatIdx++;

        // Lines from prev stage to current
        daFftCtx.beginPath();
        daFftCtx.moveTo(prevX, y1);
        daFftCtx.lineTo(stageX, y1);
        daFftCtx.strokeStyle = isActive ? (isCurrent ? 'rgba(39,174,96,0.9)' : 'rgba(39,174,96,0.3)') : 'rgba(0,0,0,0.08)';
        daFftCtx.lineWidth = (isCurrent ? 3 : 1.5) * dpr;
        daFftCtx.stroke();

        daFftCtx.beginPath();
        daFftCtx.moveTo(prevX, y2);
        daFftCtx.lineTo(stageX, y1);
        daFftCtx.strokeStyle = isActive ? (isCurrent ? 'rgba(39,174,96,0.9)' : 'rgba(39,174,96,0.3)') : 'rgba(0,0,0,0.08)';
        daFftCtx.lineWidth = (isCurrent ? 3 : 1.5) * dpr;
        daFftCtx.stroke();

        daFftCtx.beginPath();
        daFftCtx.moveTo(prevX, y1);
        daFftCtx.lineTo(stageX, y2);
        daFftCtx.strokeStyle = isActive ? (isCurrent ? 'rgba(39,174,96,0.9)' : 'rgba(39,174,96,0.3)') : 'rgba(0,0,0,0.08)';
        daFftCtx.lineWidth = (isCurrent ? 3 : 1.5) * dpr;
        daFftCtx.stroke();

        daFftCtx.beginPath();
        daFftCtx.moveTo(prevX, y2);
        daFftCtx.lineTo(stageX, y2);
        daFftCtx.strokeStyle = isActive ? (isCurrent ? 'rgba(39,174,96,0.9)' : 'rgba(39,174,96,0.3)') : 'rgba(0,0,0,0.08)';
        daFftCtx.lineWidth = (isCurrent ? 3 : 1.5) * dpr;
        daFftCtx.stroke();

        // Active nodes
        if (isActive) {
          [y1, y2].forEach(y => {
            daFftCtx.beginPath();
            daFftCtx.arc(stageX, y, 4 * dpr, 0, Math.PI * 2);
            daFftCtx.fillStyle = isCurrent ? '#27ae60' : 'rgba(39,174,96,0.5)';
            daFftCtx.fill();
          });
        }
      });

      // Stage label
      daFftCtx.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display', serif`;
      daFftCtx.fillStyle = '#aaa';
      daFftCtx.textAlign = 'center';
      daFftCtx.fillText('Stage ' + (s + 1), stageX, fh - margin * 0.3);
    }

    // Output labels
    const outX = margin + stageCount * colW;
    daFftCtx.font = `${Math.round(10 * dpr)}px 'Playfair Display', serif`;
    daFftCtx.fillStyle = '#888';
    daFftCtx.textAlign = 'left';
    for (let i = 0; i < DA_N; i++) {
      const y = margin + i * rowH + rowH / 2;
      daFftCtx.fillText(' X[' + i + ']', outX + 8 * dpr, y + 4 * dpr);
    }
  }
}

setTimeout(() => { resizeSlide34(); drawSlide34(); }, 100);

// ─── Slide 35: Gibbs Phenomenon ───
const gbCanvas = document.getElementById('gbCanvas');
const gbCtx = gbCanvas.getContext('2d');
const gbNSlider = document.getElementById('gbNSlider');
const gbNVal = document.getElementById('gbNVal');

gbNSlider.addEventListener('input', () => { gbNVal.textContent = gbNSlider.value; drawGibbs(); });

function resizeSlide35() {
  const rect = gbCanvas.parentElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    gbCanvas.width = rect.width * devicePixelRatio;
    gbCanvas.height = rect.height * devicePixelRatio;
    gbCanvas.style.width = rect.width + 'px';
    gbCanvas.style.height = rect.height + 'px';
  }
  drawGibbs();
}
window.addEventListener('resize', () => { if (current === 34) resizeSlide35(); });

function drawGibbs() {
  const w = gbCanvas.width, h = gbCanvas.height;
  if (w === 0 || h === 0) return;
  const dpr = devicePixelRatio;
  const numH = parseInt(gbNSlider.value);

  gbCtx.clearRect(0, 0, w, h);

  const ml = w * 0.06, mr = w * 0.04, mt = h * 0.06, mb = h * 0.1;
  const pw = w - ml - mr, ph = h - mt - mb;
  const midY = mt + ph * 0.5;
  const amp = ph * 0.38;

  // Center line
  gbCtx.beginPath();
  gbCtx.moveTo(ml, midY);
  gbCtx.lineTo(ml + pw, midY);
  gbCtx.strokeStyle = '#eee';
  gbCtx.lineWidth = 1 * dpr;
  gbCtx.stroke();

  // Target: square wave (ghost)
  gbCtx.beginPath();
  const cycles = 3;
  for (let px = 0; px <= pw; px++) {
    const x = (px / pw) * cycles;
    const phase = x % 1;
    const val = phase < 0.5 ? 1 : -1;
    const py = midY - val * amp;
    if (px === 0) gbCtx.moveTo(ml + px, py);
    else gbCtx.lineTo(ml + px, py);
  }
  gbCtx.strokeStyle = 'rgba(0,0,0,0.1)';
  gbCtx.lineWidth = 2 * dpr;
  gbCtx.stroke();

  // Fourier approximation of square wave: sum of odd harmonics sin((2k-1)x) / (2k-1)
  gbCtx.beginPath();
  for (let px = 0; px <= pw; px++) {
    const x = (px / pw) * cycles * Math.PI * 2;
    let val = 0;
    for (let k = 1; k <= numH; k++) {
      const n = 2 * k - 1; // odd harmonics: 1, 3, 5, 7...
      val += Math.sin(n * x) / n;
    }
    val *= (4 / Math.PI); // normalize to ±1
    const py = midY - val * amp;
    if (px === 0) gbCtx.moveTo(ml + px, py);
    else gbCtx.lineTo(ml + px, py);
  }
  gbCtx.strokeStyle = '#000';
  gbCtx.lineWidth = 2.5 * dpr;
  gbCtx.stroke();

  // Highlight overshoot regions with subtle shading
  // Overshoot is ~9% above the target at discontinuities
  const overshoot = 1.089; // ~8.9% Gibbs constant
  const overshootY1 = midY - overshoot * amp;
  const overshootY2 = midY + overshoot * amp;
  const targetY1 = midY - amp;
  const targetY2 = midY + amp;

  // Top overshoot band
  gbCtx.fillStyle = 'rgba(200, 0, 0, 0.06)';
  gbCtx.fillRect(ml, overshootY1, pw, targetY1 - overshootY1);
  // Bottom overshoot band
  gbCtx.fillRect(ml, targetY2, pw, overshootY2 - targetY2);

  // Overshoot label
  gbCtx.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display', serif`;
  gbCtx.fillStyle = 'rgba(200,0,0,0.5)';
  gbCtx.textAlign = 'right';
  gbCtx.fillText('~9% overshoot', ml + pw - 8 * dpr, overshootY1 + 14 * dpr);

  // Amplitude reference lines
  gbCtx.setLineDash([4 * dpr, 4 * dpr]);
  gbCtx.strokeStyle = 'rgba(0,0,0,0.1)';
  gbCtx.lineWidth = 1 * dpr;
  gbCtx.beginPath();
  gbCtx.moveTo(ml, targetY1);
  gbCtx.lineTo(ml + pw, targetY1);
  gbCtx.moveTo(ml, targetY2);
  gbCtx.lineTo(ml + pw, targetY2);
  gbCtx.stroke();
  gbCtx.setLineDash([]);

  // Harmonics count label
  gbCtx.font = `bold ${Math.round(12 * dpr)}px 'Playfair Display', serif`;
  gbCtx.fillStyle = '#000';
  gbCtx.textAlign = 'left';
  gbCtx.fillText(numH + ' harmonics (odd only: 1, 3, 5...)', ml + 8 * dpr, mt + 16 * dpr);
}

setTimeout(() => { resizeSlide35(); }, 100);

// ─── Slide 36: Gibbs in Digital Audio ───
const daCanvas = document.getElementById('daCanvas');
const daCtx = daCanvas.getContext('2d');
const daCutoffSlider = document.getElementById('daCutoffSlider');
const daCutoffVal = document.getElementById('daCutoffVal');

daCutoffSlider.addEventListener('input', () => { daCutoffVal.textContent = Math.round(parseFloat(daCutoffSlider.value) * 55); drawSlide36(); });

function resizeSlide36() {
  const rect = daCanvas.parentElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    daCanvas.width = rect.width * devicePixelRatio;
    daCanvas.height = rect.height * devicePixelRatio;
    daCanvas.style.width = rect.width + 'px';
    daCanvas.style.height = rect.height + 'px';
  }
  drawSlide36();
}
window.addEventListener('resize', () => { if (current === 35) resizeSlide36(); });

function drawSlide36() {
  const w = daCanvas.width, h = daCanvas.height;
  if (w === 0 || h === 0) return;
  const dpr = devicePixelRatio;
  const fc = parseFloat(daCutoffSlider.value);

  daCtx.clearRect(0, 0, w, h);

  const ml = w * 0.06, mr = w * 0.04;
  const rowH = h / 3;
  const pw = w - ml - mr;

  // Signal frequencies: 2, 5, 9 Hz
  const sigFreqs = [2, 5, 9];
  const sigAmps = [1, 0.7, 0.5];

  // Row labels
  const labels = ['Original Signal', 'Brick-wall LPF Response', 'Filtered (with ringing)'];

  for (let row = 0; row < 3; row++) {
    const yt = row * rowH;
    const midY = yt + rowH * 0.55;
    const amp = rowH * 0.32;

    // Row separator
    if (row > 0) {
      daCtx.beginPath();
      daCtx.moveTo(ml, yt);
      daCtx.lineTo(ml + pw, yt);
      daCtx.strokeStyle = '#e0e0e0';
      daCtx.lineWidth = 1 * dpr;
      daCtx.stroke();
    }

    // Label
    daCtx.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display', serif`;
    daCtx.fillStyle = '#888';
    daCtx.textAlign = 'left';
    daCtx.fillText(labels[row], ml + 4 * dpr, yt + 16 * dpr);

    // Center line
    daCtx.beginPath();
    daCtx.moveTo(ml, midY);
    daCtx.lineTo(ml + pw, midY);
    daCtx.strokeStyle = '#f0f0f0';
    daCtx.lineWidth = 1 * dpr;
    daCtx.stroke();

    if (row === 0) {
      // Original signal: sum of 3 sines
      daCtx.beginPath();
      for (let px = 0; px <= pw; px++) {
        const t = (px / pw) * 2; // 2 seconds
        let val = 0;
        for (let i = 0; i < sigFreqs.length; i++) {
          val += sigAmps[i] * Math.sin(2 * Math.PI * sigFreqs[i] * t);
        }
        val /= 2.2; // normalize
        const py = midY - val * amp;
        if (px === 0) daCtx.moveTo(ml + px, py);
        else daCtx.lineTo(ml + px, py);
      }
      daCtx.strokeStyle = '#000';
      daCtx.lineWidth = 2 * dpr;
      daCtx.stroke();

    } else if (row === 1) {
      // Brick-wall frequency response
      const freqMax = 12;
      daCtx.beginPath();
      for (let px = 0; px <= pw; px++) {
        const f = (px / pw) * freqMax;
        let resp;
        if (f <= fc) resp = 1;
        else resp = 0;
        const py = midY - resp * amp;
        if (px === 0) daCtx.moveTo(ml + px, py);
        else daCtx.lineTo(ml + px, py);
      }
      daCtx.strokeStyle = '#000';
      daCtx.lineWidth = 2.5 * dpr;
      daCtx.stroke();

      // Cutoff line
      const cutoffX = ml + (fc / freqMax) * pw;
      daCtx.beginPath();
      daCtx.moveTo(cutoffX, midY - amp * 1.2);
      daCtx.lineTo(cutoffX, midY + amp * 0.3);
      daCtx.strokeStyle = 'rgba(192,57,43,0.5)';
      daCtx.lineWidth = 2 * dpr;
      daCtx.setLineDash([4 * dpr, 4 * dpr]);
      daCtx.stroke();
      daCtx.setLineDash([]);

      // Freq axis labels
      daCtx.font = `bold ${Math.round(9 * dpr)}px 'Playfair Display', serif`;
      daCtx.fillStyle = '#aaa';
      daCtx.textAlign = 'center';
      for (let f = 0; f <= freqMax; f += 2) {
        const fx = ml + (f / freqMax) * pw;
        daCtx.fillText(f + ' Hz', fx, midY + amp * 0.6);
      }
      daCtx.fillStyle = '#c0392b';
      daCtx.fillText('fc=' + fc + ' Hz', cutoffX, midY - amp * 1.3);

    } else if (row === 2) {
      // Filtered signal with Gibbs ringing (brick-wall via Fourier partial sums)
      // Use many harmonics with sharp cutoff to show ringing
      const numPartials = 200;
      daCtx.beginPath();
      for (let px = 0; px <= pw; px++) {
        const t = (px / pw) * 2;
        let val = 0;
        // For each original frequency, include it only if below cutoff
        // Then add Gibbs ringing using sinc-based reconstruction
        for (let i = 0; i < sigFreqs.length; i++) {
          if (sigFreqs[i] <= fc) {
            val += sigAmps[i] * Math.sin(2 * Math.PI * sigFreqs[i] * t);
          }
        }
        // Add Gibbs ringing artifact from the sharp cutoff
        // Model ringing as overshoot near where harmonics are cut
        // Using a sinc-based ripple centered around the signal transitions
        for (let i = 0; i < sigFreqs.length; i++) {
          if (sigFreqs[i] > fc) {
            // Ringing from excluded harmonic - sinc ripple
            const diff = sigFreqs[i] - fc;
            const ringFreq = fc * 2 * Math.PI;
            const ringAmp = sigAmps[i] * 0.15 / (1 + diff * 0.5);
            for (let k = 1; k <= 8; k++) {
              val += ringAmp * Math.sin(2 * Math.PI * fc * t * k) / k * Math.cos(2 * Math.PI * diff * t * 0.5);
            }
          }
        }
        val /= 2.2;
        const py = midY - val * amp;
        if (px === 0) daCtx.moveTo(ml + px, py);
        else daCtx.lineTo(ml + px, py);
      }
      daCtx.strokeStyle = '#000';
      daCtx.lineWidth = 2 * dpr;
      daCtx.stroke();

      // Highlight ringing with red regions
      // Draw ghost of original for comparison
      daCtx.beginPath();
      for (let px = 0; px <= pw; px++) {
        const t = (px / pw) * 2;
        let val = 0;
        for (let i = 0; i < sigFreqs.length; i++) {
          val += sigAmps[i] * Math.sin(2 * Math.PI * sigFreqs[i] * t);
        }
        val /= 2.2;
        const py = midY - val * amp;
        if (px === 0) daCtx.moveTo(ml + px, py);
        else daCtx.lineTo(ml + px, py);
      }
      daCtx.strokeStyle = 'rgba(0,0,0,0.12)';
      daCtx.lineWidth = 1.5 * dpr;
      daCtx.stroke();

      // Ringing label
      daCtx.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display', serif`;
      daCtx.fillStyle = '#c0392b';
      daCtx.textAlign = 'right';
      daCtx.fillText('ringing artifacts from sharp cutoff', ml + pw - 6 * dpr, yt + 16 * dpr);
    }
  }
}

function drawDaEq() {
  if (!daAnalyser || !daFreqData) return;
  daAnalyser.getByteFrequencyData(daFreqData);

  const w = daCanvas.width, h = daCanvas.height;
  if (w === 0 || h === 0) return;
  const dpr = devicePixelRatio;
  const ml = w * 0.06, mr = w * 0.04, mt = h * 0.04, mb = h * 0.06;
  const pw = w - ml - mr, ph = h - mt - mb;
  const nyquist = audioCtx.sampleRate / 2;

  // Draw EQ in the row 2 area (middle third)
  const rowH = ph / 3;
  const eqTop = mt + rowH;
  const eqH = rowH;
  const eqMid = eqTop + eqH * 0.5;

  daCtx.beginPath();
  daCtx.moveTo(ml, eqTop + eqH);
  for (let px = 0; px <= pw; px++) {
    const freq = (px / pw) * 600; // 0-600 Hz range
    const bin = Math.round(freq / nyquist * daFreqData.length);
    const val = bin < daFreqData.length ? daFreqData[bin] : 0;
    const barH = (val / 255) * eqH * 0.8;
    daCtx.lineTo(ml + px, eqTop + eqH - barH);
  }
  daCtx.lineTo(ml + pw, eqTop + eqH);
  daCtx.closePath();
  daCtx.fillStyle = 'rgba(0, 100, 255, 0.12)';
  daCtx.fill();
  daCtx.strokeStyle = 'rgba(0, 100, 255, 0.4)';
  daCtx.lineWidth = 1.5 * dpr;
  daCtx.stroke();
}

function animateSlide36() {
  requestAnimationFrame(animateSlide36);
  if (current !== 35) return;
  drawSlide36();
  drawDaEq();
}
animateSlide36();

// Slide 36 audio playback + EQ
let daOscNodes = [];
let daAnalyser = null;
let daFreqData = null;

function daGetAnalyser() {
  ensureAudioCtx();
  if (!daAnalyser) {
    daAnalyser = audioCtx.createAnalyser();
    daAnalyser.fftSize = 2048;
    daAnalyser.smoothingTimeConstant = 0.85;
    daAnalyser.connect(audioCtx.destination);
    daFreqData = new Uint8Array(daAnalyser.frequencyBinCount);
  }
  return daAnalyser;
}

function daStopAudio() {
  daOscNodes.forEach(n => { try { n.stop(); } catch(e){} });
  daOscNodes = [];
}

document.getElementById('daPlayOrigBtn').addEventListener('click', () => {
  ensureAudioCtx();
  daStopAudio();
  const analyser = daGetAnalyser();
  const now = audioCtx.currentTime;
  const sigFreqs = [2, 5, 9];
  const sigAmps = [0.15, 0.1, 0.08];
  const freqMult = 55;
  sigFreqs.forEach((f, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = f * freqMult;
    osc.type = 'sine';
    gain.gain.setValueAtTime(sigAmps[i], now);
    gain.gain.linearRampToValueAtTime(0, now + 2);
    osc.connect(gain);
    gain.connect(analyser);
    osc.start(now);
    osc.stop(now + 2);
    daOscNodes.push(osc);
  });
});

document.getElementById('daPlayFilterBtn').addEventListener('click', () => {
  ensureAudioCtx();
  daStopAudio();
  const analyser = daGetAnalyser();
  const now = audioCtx.currentTime;
  const fc = parseFloat(daCutoffSlider.value);
  const sigFreqs = [2, 5, 9];
  const sigAmps = [0.15, 0.1, 0.08];
  const freqMult = 55;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = fc * freqMult;
  filter.Q.value = 25;
  filter.connect(analyser);

  sigFreqs.forEach((f, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = f * freqMult;
    osc.type = 'sine';
    gain.gain.setValueAtTime(sigAmps[i], now);
    gain.gain.linearRampToValueAtTime(0, now + 2);
    osc.connect(gain);
    gain.connect(filter);
    osc.start(now);
    osc.stop(now + 2);
    daOscNodes.push(osc);
  });
});

// ─── Slide 37: The Solution: Windowed Filters ───
const wfBrickCanvas = document.getElementById('wfBrickCanvas');
const wfWindowCanvas = document.getElementById('wfWindowCanvas');
const wfBrickCtx = wfBrickCanvas.getContext('2d');
const wfWindowCtx = wfWindowCanvas.getContext('2d');
const wfCutoffSlider = document.getElementById('wfCutoffSlider');
const wfCutoffVal = document.getElementById('wfCutoffVal');

wfCutoffSlider.addEventListener('input', () => { wfCutoffVal.textContent = Math.round(parseFloat(wfCutoffSlider.value) * 55); drawSlide37(); });

function resizeSlide37() {
  [wfBrickCanvas, wfWindowCanvas].forEach(c => {
    const rect = c.parentElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      c.width = rect.width * devicePixelRatio;
      c.height = rect.height * devicePixelRatio;
      c.style.width = rect.width + 'px';
      c.style.height = rect.height + 'px';
    }
  });
  drawSlide37();
}
window.addEventListener('resize', () => { if (current === 36) resizeSlide37(); });

function drawWfPanel(ctx, canvas, fc, mode) {
  const w = canvas.width, h = canvas.height;
  if (w === 0 || h === 0) return;
  const dpr = devicePixelRatio;

  ctx.clearRect(0, 0, w, h);

  const ml = w * 0.08, mr = w * 0.06;
  const pw = w - ml - mr;
  const topH = h * 0.45;
  const botH = h * 0.45;
  const gap = h * 0.1;

  const freqMax = 12;

  // ── Top: Frequency Response ──
  const topMid = topH * 0.6;
  const topAmp = topH * 0.4;

  // Label
  ctx.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display', serif`;
  ctx.fillStyle = '#888';
  ctx.textAlign = 'left';
  ctx.fillText('Frequency Response', ml + 4 * dpr, 14 * dpr);

  // Center line
  ctx.beginPath();
  ctx.moveTo(ml, topMid);
  ctx.lineTo(ml + pw, topMid);
  ctx.strokeStyle = '#f0f0f0';
  ctx.lineWidth = 1 * dpr;
  ctx.stroke();

  // Draw frequency response
  ctx.beginPath();
  for (let px = 0; px <= pw; px++) {
    const f = (px / pw) * freqMax;
    let resp;
    if (mode === 'brick') {
      resp = f <= fc ? 1 : 0;
    } else {
      // Smooth Butterworth-like rolloff: 1 / (1 + (f/fc)^4)
      resp = 1 / (1 + Math.pow(f / fc, 4));
    }
    const py = topMid - resp * topAmp;
    if (px === 0) ctx.moveTo(ml + px, py);
    else ctx.lineTo(ml + px, py);
  }
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2.5 * dpr;
  ctx.stroke();

  // Cutoff line
  const cutoffX = ml + (fc / freqMax) * pw;
  ctx.beginPath();
  ctx.moveTo(cutoffX, topMid - topAmp * 1.15);
  ctx.lineTo(cutoffX, topMid + topAmp * 0.2);
  ctx.strokeStyle = 'rgba(192,57,43,0.4)';
  ctx.lineWidth = 1.5 * dpr;
  ctx.setLineDash([3 * dpr, 3 * dpr]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Freq labels
  ctx.font = `bold ${Math.round(8 * dpr)}px 'Playfair Display', serif`;
  ctx.fillStyle = '#bbb';
  ctx.textAlign = 'center';
  for (let f = 0; f <= freqMax; f += 2) {
    const fx = ml + (f / freqMax) * pw;
    ctx.fillText(f + '', fx, topMid + topAmp * 0.45);
  }

  // ── Bottom: Filtered Waveform ──
  const botTop = topH + gap;
  const botMid = botTop + botH * 0.5;
  const botAmp = botH * 0.35;

  ctx.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display', serif`;
  ctx.fillStyle = '#888';
  ctx.textAlign = 'left';
  ctx.fillText('Filtered Waveform', ml + 4 * dpr, botTop + 14 * dpr);

  // Center line
  ctx.beginPath();
  ctx.moveTo(ml, botMid);
  ctx.lineTo(ml + pw, botMid);
  ctx.strokeStyle = '#f0f0f0';
  ctx.lineWidth = 1 * dpr;
  ctx.stroke();

  // Signal: sum of harmonics 1-10 Hz with amplitudes 1/n
  const numHarmonics = 10;

  // Ghost original
  ctx.beginPath();
  for (let px = 0; px <= pw; px++) {
    const t = (px / pw) * 2;
    let val = 0;
    for (let n = 1; n <= numHarmonics; n++) {
      val += (1 / n) * Math.sin(2 * Math.PI * n * t);
    }
    val /= 2.5;
    const py = botMid - val * botAmp;
    if (px === 0) ctx.moveTo(ml + px, py);
    else ctx.lineTo(ml + px, py);
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1.5 * dpr;
  ctx.stroke();

  // Filtered waveform
  ctx.beginPath();
  for (let px = 0; px <= pw; px++) {
    const t = (px / pw) * 2;
    let val = 0;
    if (mode === 'brick') {
      // Brick-wall: include harmonics below cutoff, Gibbs ringing via partial sums
      for (let n = 1; n <= numHarmonics; n++) {
        if (n <= fc) {
          val += (1 / n) * Math.sin(2 * Math.PI * n * t);
        }
      }
      // Add Gibbs overshoot ripples from truncation
      const maxN = Math.floor(fc);
      if (maxN < numHarmonics && maxN > 0) {
        for (let px2 = 1; px2 <= 12; px2++) {
          val += 0.04 * Math.sin(2 * Math.PI * (maxN + px2 * 0.3) * t) / px2;
        }
      }
    } else {
      // Windowed: smooth rolloff 1/(1+(f/fc)^4)
      for (let n = 1; n <= numHarmonics; n++) {
        const resp = 1 / (1 + Math.pow(n / fc, 4));
        val += (1 / n) * resp * Math.sin(2 * Math.PI * n * t);
      }
    }
    val /= 2.5;
    const py = botMid - val * botAmp;
    if (px === 0) ctx.moveTo(ml + px, py);
    else ctx.lineTo(ml + px, py);
  }
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2 * dpr;
  ctx.stroke();

  // Highlight ringing for brick-wall
  if (mode === 'brick') {
    ctx.font = `bold ${Math.round(9 * dpr)}px 'Playfair Display', serif`;
    ctx.fillStyle = 'rgba(192,57,43,0.6)';
    ctx.textAlign = 'right';
    ctx.fillText('ringing', ml + pw - 4 * dpr, botTop + 14 * dpr);
  }
}

function drawSlide37() {
  const fc = parseFloat(wfCutoffSlider.value);
  drawWfPanel(wfBrickCtx, wfBrickCanvas, fc, 'brick');
  drawWfPanel(wfWindowCtx, wfWindowCanvas, fc, 'windowed');
}

// Slide 37 audio playback + EQ
let wfOscNodes = [];
let wfAnalyserBrick = null;
let wfAnalyserWin = null;
let wfFreqDataBrick = null;
let wfFreqDataWin = null;
let wfLastPlayed = null; // 'brick' or 'window'

function wfGetAnalyser(type) {
  ensureAudioCtx();
  if (type === 'brick') {
    if (!wfAnalyserBrick) {
      wfAnalyserBrick = audioCtx.createAnalyser();
      wfAnalyserBrick.fftSize = 2048;
      wfAnalyserBrick.smoothingTimeConstant = 0.85;
      wfAnalyserBrick.connect(audioCtx.destination);
      wfFreqDataBrick = new Uint8Array(wfAnalyserBrick.frequencyBinCount);
    }
    return wfAnalyserBrick;
  } else {
    if (!wfAnalyserWin) {
      wfAnalyserWin = audioCtx.createAnalyser();
      wfAnalyserWin.fftSize = 2048;
      wfAnalyserWin.smoothingTimeConstant = 0.85;
      wfAnalyserWin.connect(audioCtx.destination);
      wfFreqDataWin = new Uint8Array(wfAnalyserWin.frequencyBinCount);
    }
    return wfAnalyserWin;
  }
}

function wfStopAudio() {
  wfOscNodes.forEach(n => { try { n.stop(); } catch(e){} });
  wfOscNodes = [];
}

document.getElementById('wfPlayBrickBtn').addEventListener('click', () => {
  ensureAudioCtx();
  wfStopAudio();
  wfLastPlayed = 'brick';
  const analyser = wfGetAnalyser('brick');
  const now = audioCtx.currentTime;
  const fc = parseFloat(wfCutoffSlider.value);
  const freqMult = 440;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = fc * freqMult;
  filter.Q.value = 25;
  filter.connect(analyser);

  for (let n = 1; n <= 10; n++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = n * freqMult;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.08 / n, now);
    gain.gain.linearRampToValueAtTime(0, now + 2);
    osc.connect(gain);
    gain.connect(filter);
    osc.start(now);
    osc.stop(now + 2);
    wfOscNodes.push(osc);
  }
});

document.getElementById('wfPlayWindowBtn').addEventListener('click', () => {
  ensureAudioCtx();
  wfStopAudio();
  wfLastPlayed = 'window';
  const analyser = wfGetAnalyser('window');
  const now = audioCtx.currentTime;
  const fc = parseFloat(wfCutoffSlider.value);
  const freqMult = 440;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = fc * freqMult;
  filter.Q.value = 0.707;
  filter.connect(analyser);

  for (let n = 1; n <= 10; n++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = n * freqMult;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.08 / n, now);
    gain.gain.linearRampToValueAtTime(0, now + 2);
    osc.connect(gain);
    gain.connect(filter);
    osc.start(now);
    osc.stop(now + 2);
    wfOscNodes.push(osc);
  }
});

function drawWfEq(canvas, ctx, analyser, freqData) {
  if (!analyser || !freqData) return;
  analyser.getByteFrequencyData(freqData);

  const w = canvas.width, h = canvas.height;
  if (w === 0 || h === 0) return;
  const dpr = devicePixelRatio;
  const ml = w * 0.06, pw = w - ml - w * 0.04;
  const nyquist = audioCtx.sampleRate / 2;

  // Draw EQ in bottom half of canvas
  const eqTop = h * 0.5;
  const eqH = h * 0.45;

  ctx.beginPath();
  ctx.moveTo(ml, eqTop + eqH);
  for (let px = 0; px <= pw; px++) {
    const freq = (px / pw) * 600;
    const bin = Math.round(freq / nyquist * freqData.length);
    const val = bin < freqData.length ? freqData[bin] : 0;
    const barH = (val / 255) * eqH * 0.8;
    ctx.lineTo(ml + px, eqTop + eqH - barH);
  }
  ctx.lineTo(ml + pw, eqTop + eqH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0, 100, 255, 0.12)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 100, 255, 0.4)';
  ctx.lineWidth = 1.5 * dpr;
  ctx.stroke();
}

function animateSlide37() {
  requestAnimationFrame(animateSlide37);
  if (current !== 36) return;
  drawSlide37();
  if (wfLastPlayed === 'brick') {
    drawWfEq(wfBrickCanvas, wfBrickCtx, wfAnalyserBrick, wfFreqDataBrick);
  } else if (wfLastPlayed === 'window') {
    drawWfEq(wfWindowCanvas, wfWindowCtx, wfAnalyserWin, wfFreqDataWin);
  }
}
animateSlide37();

// ─── Slide 38: Oversampling ───
const os1xCanvas = document.getElementById('os1xCanvas');
const os1xCtx = os1xCanvas.getContext('2d');
const os4xCanvas = document.getElementById('os4xCanvas');
const os4xCtx = os4xCanvas.getContext('2d');
const osFreqSlider = document.getElementById('osFreqSlider');
const osFreqVal = document.getElementById('osFreqVal');

osFreqSlider.addEventListener('input', () => { osFreqVal.textContent = osFreqSlider.value; });

function resizeSlide38() {
  [os1xCanvas, os4xCanvas].forEach(c => {
    const rect = c.parentElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      c.width = rect.width * devicePixelRatio;
      c.height = rect.height * devicePixelRatio;
      c.style.width = rect.width + 'px';
      c.style.height = rect.height + 'px';
    }
  });
}
window.addEventListener('resize', () => { if (current === 37) resizeSlide38(); });

function drawOsPanel(ctx, w, h, sampleRate, nyquist, sigFreq, oversampling) {
  if (w === 0 || h === 0) return;
  const dpr = devicePixelRatio;
  ctx.clearRect(0, 0, w, h);

  const ml = w * 0.08, mr = w * 0.04;
  const pw = w - ml - mr;

  // ── Top: Time domain ──
  const tTop = h * 0.03, tH = h * 0.42;
  const tMid = tTop + tH * 0.5;
  const tAmp = tH * 0.38;

  ctx.beginPath();
  ctx.moveTo(ml, tMid);
  ctx.lineTo(ml + pw, tMid);
  ctx.strokeStyle = '#eee';
  ctx.lineWidth = 1 * dpr;
  ctx.stroke();

  // Continuous signal (ghost)
  const duration = 1 / (sigFreq * 1000) * 4;
  ctx.beginPath();
  for (let px = 0; px <= pw; px++) {
    const t = (px / pw) * duration;
    const val = Math.sin(t * Math.PI * 2 * sigFreq * 1000);
    const y = tMid - val * tAmp;
    if (px === 0) ctx.moveTo(ml + px, y); else ctx.lineTo(ml + px, y);
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1.5 * dpr;
  ctx.stroke();

  // Sample points
  const samplesPerCycle = sampleRate / (sigFreq * 1000);
  const totalSamples = Math.ceil(duration * sampleRate);
  const maxSamples = Math.min(totalSamples, 200);

  // Reconstructed (connect samples)
  ctx.beginPath();
  let first = true;
  for (let n = 0; n < maxSamples; n++) {
    const t = n / sampleRate;
    if (t > duration) break;
    const val = Math.sin(t * Math.PI * 2 * sigFreq * 1000);
    const px = (t / duration) * pw;
    const y = tMid - val * tAmp;
    if (first) { ctx.moveTo(ml + px, y); first = false; }
    else ctx.lineTo(ml + px, y);
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 1.5 * dpr;
  ctx.stroke();

  // Dots + stems
  for (let n = 0; n < maxSamples; n++) {
    const t = n / sampleRate;
    if (t > duration) break;
    const val = Math.sin(t * Math.PI * 2 * sigFreq * 1000);
    const px = (t / duration) * pw;
    const y = tMid - val * tAmp;
    ctx.beginPath();
    ctx.moveTo(ml + px, tMid);
    ctx.lineTo(ml + px, y);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ml + px, y, 2.5 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
  }

  // Samples/cycle label
  ctx.font = `${Math.round(10 * dpr)}px 'Playfair Display', serif`;
  ctx.fillStyle = '#888';
  ctx.textAlign = 'right';
  ctx.fillText(samplesPerCycle.toFixed(1) + ' samples/cycle', ml + pw, tTop + 12 * dpr);

  // ── Bottom: Frequency domain ──
  const fTop = h * 0.52, fH = h * 0.42;
  const fBot = fTop + fH;
  const fMaxDisplay = nyquist * 1.3;

  ctx.beginPath();
  ctx.moveTo(ml, fBot);
  ctx.lineTo(ml + pw, fBot);
  ctx.moveTo(ml, fTop);
  ctx.lineTo(ml, fBot);
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1 * dpr;
  ctx.stroke();

  // Audio band
  const audioBandX = (20 / fMaxDisplay) * pw;
  ctx.fillStyle = 'rgba(0, 150, 0, 0.04)';
  ctx.fillRect(ml, fTop, audioBandX, fH);
  ctx.font = `${Math.round(9 * dpr)}px 'Playfair Display', serif`;
  ctx.fillStyle = 'rgba(0,150,0,0.4)';
  ctx.textAlign = 'center';
  ctx.fillText('Audio band', ml + audioBandX * 0.5, fTop + 12 * dpr);

  // Nyquist line
  const nyqX = ml + (nyquist / fMaxDisplay) * pw;
  ctx.beginPath();
  ctx.moveTo(nyqX, fTop);
  ctx.lineTo(nyqX, fBot);
  ctx.strokeStyle = 'rgba(200,0,0,0.4)';
  ctx.lineWidth = 2 * dpr;
  ctx.setLineDash([4 * dpr, 4 * dpr]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display', serif`;
  ctx.fillStyle = 'rgba(200,0,0,0.5)';
  ctx.textAlign = 'center';
  ctx.fillText('Nyquist ' + nyquist.toFixed(1) + 'k', nyqX, fTop - 4 * dpr);

  // Filter shape
  const filterCutoff = 20;
  ctx.beginPath();
  for (let px = 0; px <= pw; px++) {
    const freq = (px / pw) * fMaxDisplay;
    let gain;
    if (oversampling === 1) {
      gain = 1 / (1 + Math.pow(freq / filterCutoff, 20));
    } else {
      gain = 1 / (1 + Math.pow(freq / filterCutoff, 4));
    }
    const y = fBot - gain * fH * 0.85;
    if (px === 0) ctx.moveTo(ml + px, y); else ctx.lineTo(ml + px, y);
  }
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2.5 * dpr;
  ctx.stroke();

  // Filter label
  ctx.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display', serif`;
  ctx.fillStyle = oversampling === 1 ? '#c0392b' : '#27ae60';
  ctx.textAlign = 'left';
  ctx.fillText(oversampling === 1 ? 'Sharp filter (Gibbs!)' : 'Gentle filter (clean)', ml + 6 * dpr, fBot - fH * 0.9 + 14 * dpr);

  // Signal marker
  const sigX = ml + (sigFreq / fMaxDisplay) * pw;
  if (sigFreq < fMaxDisplay) {
    ctx.beginPath();
    ctx.moveTo(sigX, fBot);
    ctx.lineTo(sigX, fBot - fH * 0.7);
    ctx.strokeStyle = 'rgba(0,100,255,0.5)';
    ctx.lineWidth = 2 * dpr;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(sigX, fBot - fH * 0.7, 4 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,100,255,0.7)';
    ctx.fill();
    ctx.font = `${Math.round(9 * dpr)}px 'Playfair Display', serif`;
    ctx.fillStyle = 'rgba(0,100,255,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText(sigFreq + 'k', sigX, fBot - fH * 0.7 - 8 * dpr);
  }

  // X ticks
  ctx.font = `${Math.round(9 * dpr)}px 'Playfair Display', serif`;
  ctx.fillStyle = '#aaa';
  ctx.textAlign = 'center';
  const tickStep = fMaxDisplay > 50 ? 20 : 5;
  for (let f = 0; f <= fMaxDisplay; f += tickStep) {
    const x = ml + (f / fMaxDisplay) * pw;
    ctx.fillText(f + 'k', x, fBot + 12 * dpr);
  }
}

function animateSlide38() {
  requestAnimationFrame(animateSlide38);
  if (current !== 37) return;

  const sigFreq = parseFloat(osFreqSlider.value);
  drawOsPanel(os1xCtx, os1xCanvas.width, os1xCanvas.height, 44100, 22.05, sigFreq, 1);
  drawOsPanel(os4xCtx, os4xCanvas.width, os4xCanvas.height, 176400, 88.2, sigFreq, 4);
}

setTimeout(() => { resizeSlide38(); }, 100);
animateSlide38();

// ─── Slide 39: Phase Effect on Waveform (Fig 4.7) ───
const phCanvases = {
  equal: document.getElementById('phEqualCanvas'),
  schroeder: document.getElementById('phSchroederCanvas'),
  random: document.getElementById('phRandomCanvas'),
};
const phCtxs = {
  equal: phCanvases.equal.getContext('2d'),
  schroeder: phCanvases.schroeder.getContext('2d'),
  random: phCanvases.random.getContext('2d'),
};

const PH_N = 16; // 16 harmonics
const PH_FUND = 110; // Hz fundamental for audio

// Phase arrays
const phPhases = {
  equal: [],
  schroeder: [],
  random: [],
};

// Initialize phases
function phInitPhases() {
  phPhases.equal = [];
  phPhases.schroeder = [];
  phPhases.random = [];
  for (let n = 1; n <= PH_N; n++) {
    phPhases.equal.push(0);
    // Schroeder: φ(n) = πn(n-1)/N
    phPhases.schroeder.push(Math.PI * n * (n - 1) / PH_N);
    phPhases.random.push(Math.random() * Math.PI * 2);
  }
}
phInitPhases();

function resizeSlide39() {
  Object.values(phCanvases).forEach(c => {
    const rect = c.parentElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      c.width = rect.width * devicePixelRatio;
      c.height = rect.height * devicePixelRatio;
      c.style.width = rect.width + 'px';
      c.style.height = rect.height + 'px';
    }
  });
}
window.addEventListener('resize', () => { if (current === 38) resizeSlide39(); });

function drawPhWaveform(ctx, w, h, phases) {
  if (w === 0 || h === 0) return;
  const dpr = devicePixelRatio;
  ctx.clearRect(0, 0, w, h);

  const ml = w * 0.02, mr = w * 0.02;
  const pw = w - ml - mr;
  const midY = h * 0.5;
  const amp = h * 0.4;

  // Center line
  ctx.beginPath();
  ctx.moveTo(ml, midY);
  ctx.lineTo(ml + pw, midY);
  ctx.strokeStyle = '#f0f0f0';
  ctx.lineWidth = 1 * dpr;
  ctx.stroke();

  // Compute waveform and find max for normalization
  const pts = 600;
  const vals = [];
  let maxVal = 0;
  for (let i = 0; i <= pts; i++) {
    const x = (i / pts) * 4; // 4 periods of fundamental
    let val = 0;
    for (let n = 0; n < PH_N; n++) {
      val += Math.sin(x * Math.PI * 2 * (n + 1) + phases[n]);
    }
    vals.push(val);
    if (Math.abs(val) > maxVal) maxVal = Math.abs(val);
  }
  if (maxVal === 0) maxVal = 1;

  // Draw
  ctx.beginPath();
  for (let i = 0; i <= pts; i++) {
    const px = ml + (i / pts) * pw;
    const py = midY - (vals[i] / maxVal) * amp;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2 * dpr;
  ctx.stroke();
}

function animateSlide39() {
  requestAnimationFrame(animateSlide39);
  if (current !== 38) return;

  drawPhWaveform(phCtxs.equal, phCanvases.equal.width, phCanvases.equal.height, phPhases.equal);
  drawPhWaveform(phCtxs.schroeder, phCanvases.schroeder.width, phCanvases.schroeder.height, phPhases.schroeder);
  drawPhWaveform(phCtxs.random, phCanvases.random.width, phCanvases.random.height, phPhases.random);
}

// Play buttons
function playPhSound(phases) {
  ensureAudioCtx();
  const now = audioCtx.currentTime;
  const dur = 2.0;

  for (let n = 0; n < PH_N; n++) {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = PH_FUND * (n + 1);
    // Set phase by starting at calculated offset
    // Web Audio doesn't have phase param, so use a delay trick or just accept slight inaccuracy
    // More accurate: use PeriodicWave
    const g = audioCtx.createGain();
    const amp = 0.12 / PH_N;
    g.gain.setValueAtTime(amp, now);
    g.gain.setValueAtTime(amp, now + dur - 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + dur);
  }
}

// Use PeriodicWave for accurate phase control
function playPhSoundAccurate(phases) {
  ensureAudioCtx();
  const now = audioCtx.currentTime;
  const dur = 2.0;

  // Build PeriodicWave: real[n] = cos(phase), imag[n] = sin(phase)
  const real = new Float32Array(PH_N + 1);
  const imag = new Float32Array(PH_N + 1);
  real[0] = 0; imag[0] = 0;
  for (let n = 0; n < PH_N; n++) {
    real[n + 1] = Math.cos(phases[n]);
    imag[n + 1] = Math.sin(phases[n]);
  }

  const wave = audioCtx.createPeriodicWave(real, imag, { disableNormalization: false });
  const osc = audioCtx.createOscillator();
  osc.setPeriodicWave(wave);
  osc.frequency.value = PH_FUND;

  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.3, now);
  g.gain.setValueAtTime(0.3, now + dur - 0.05);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + dur);
}

document.querySelectorAll('#slide39 .ph-play-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.phase;
    if (type === 'random') phInitPhases(); // re-randomize each click
    playPhSoundAccurate(phPhases[type]);
  });
});

setTimeout(() => { resizeSlide39(); }, 100);
animateSlide39();

// ─── Slide 40: Phase Breakdown ───
const pbEqualCanvas = document.getElementById('pbEqualCanvas');
const pbEqualCtx = pbEqualCanvas.getContext('2d');
const pbSchroederCanvas = document.getElementById('pbSchroederCanvas');
const pbSchroederCtx = pbSchroederCanvas.getContext('2d');
const pbNSlider = document.getElementById('pbNSlider');
const pbNVal = document.getElementById('pbNVal');

pbNSlider.addEventListener('input', () => { pbNVal.textContent = pbNSlider.value; });

const pbColors = ['#e74c3c','#3498db','#2ecc71','#9b59b6','#e67e22','#1abc9c','#e84393','#00b894','#fdcb6e','#6c5ce7','#d63031','#0984e3','#00cec9','#fd79a8','#636e72','#2d3436'];

function resizeSlide40() {
  [pbEqualCanvas, pbSchroederCanvas].forEach(c => {
    const rect = c.parentElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      c.width = rect.width * devicePixelRatio;
      c.height = rect.height * devicePixelRatio;
      c.style.width = rect.width + 'px';
      c.style.height = rect.height + 'px';
    }
  });
}
window.addEventListener('resize', () => { if (current === 39) resizeSlide40(); });

function drawPbPanel(ctx, w, h, numH, getPhase) {
  if (w === 0 || h === 0) return;
  const dpr = devicePixelRatio;
  ctx.clearRect(0, 0, w, h);

  const ml = w * 0.03, mr = w * 0.03;
  const mt = h * 0.02, mb = h * 0.08;
  const pw = w - ml - mr;
  const totalH = h - mt - mb;

  // Space: individual harmonics take 60%, combined takes 40%
  const indH = totalH * 0.6;
  const combH = totalH * 0.35;
  const gapH = totalH * 0.05;

  const pts = 500;
  const cycles = 4; // show 4 periods of fundamental

  // ── Individual harmonics ──
  const rowH = indH / numH;
  for (let n = 0; n < numH; n++) {
    const rowMid = mt + n * rowH + rowH * 0.5;
    const rowAmp = rowH * 0.38;
    const phase = getPhase(n + 1);

    // Center line
    ctx.beginPath();
    ctx.moveTo(ml, rowMid);
    ctx.lineTo(ml + pw, rowMid);
    ctx.strokeStyle = '#f5f5f5';
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();

    // Harmonic waveform
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const x = (i / pts) * cycles;
      const val = Math.sin(x * Math.PI * 2 * (n + 1) + phase);
      const px = ml + (i / pts) * pw;
      const py = rowMid - val * rowAmp;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = pbColors[n % pbColors.length];
    ctx.lineWidth = 1.5 * dpr;
    ctx.stroke();

    // Label
    ctx.font = `bold ${Math.round(Math.min(9, rowH / dpr * 0.3) * dpr)}px 'Playfair Display', serif`;
    ctx.fillStyle = pbColors[n % pbColors.length];
    ctx.textAlign = 'left';
    const phaseDeg = Math.round(phase * 180 / Math.PI);
    ctx.fillText((n + 1) + '× (' + phaseDeg + '°)', ml + 4 * dpr, rowMid - rowAmp + 2 * dpr);
  }

  // ── Combined waveform ──
  const combTop = mt + indH + gapH;
  const combMid = combTop + combH * 0.5;
  const combAmp = combH * 0.4;

  // Divider line
  ctx.beginPath();
  ctx.moveTo(ml, combTop - gapH * 0.5);
  ctx.lineTo(ml + pw, combTop - gapH * 0.5);
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1 * dpr;
  ctx.stroke();

  // Center line
  ctx.beginPath();
  ctx.moveTo(ml, combMid);
  ctx.lineTo(ml + pw, combMid);
  ctx.strokeStyle = '#f0f0f0';
  ctx.lineWidth = 1 * dpr;
  ctx.stroke();

  // Compute + normalize
  const vals = [];
  let maxV = 0;
  for (let i = 0; i <= pts; i++) {
    const x = (i / pts) * cycles;
    let val = 0;
    for (let n = 0; n < numH; n++) {
      val += Math.sin(x * Math.PI * 2 * (n + 1) + getPhase(n + 1));
    }
    vals.push(val);
    if (Math.abs(val) > maxV) maxV = Math.abs(val);
  }
  if (maxV === 0) maxV = 1;

  // Draw combined
  ctx.beginPath();
  for (let i = 0; i <= pts; i++) {
    const px = ml + (i / pts) * pw;
    const py = combMid - (vals[i] / maxV) * combAmp;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2.5 * dpr;
  ctx.stroke();

  // Label
  ctx.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display', serif`;
  ctx.fillStyle = '#000';
  ctx.textAlign = 'left';
  ctx.fillText('Combined (' + numH + ' harmonics)', ml + 4 * dpr, combTop + 12 * dpr);
}

function animateSlide40() {
  requestAnimationFrame(animateSlide40);
  if (current !== 39) return;

  const numH = parseInt(pbNSlider.value);

  drawPbPanel(pbEqualCtx, pbEqualCanvas.width, pbEqualCanvas.height, numH,
    (n) => 0 // all phases = 0
  );

  drawPbPanel(pbSchroederCtx, pbSchroederCanvas.width, pbSchroederCanvas.height, numH,
    (n) => Math.PI * n * (n - 1) / PH_N // Schroeder phases
  );
}

setTimeout(() => { resizeSlide40(); }, 100);
animateSlide40();

// ─── Slide 41: Brass Sound Synthesis (Risset-style) ───
document.getElementById('brassPlayBtn').addEventListener('click', () => {
  ensureAudioCtx();
  const now = audioCtx.currentTime;
  const fund = 220;
  const dur = 2.5;
  const numH = 12;

  for (let n = 1; n <= numH; n++) {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = fund * n;

    const g = audioCtx.createGain();
    const amp = 0.2 / n;

    const attackDelay = (n - 1) * 0.04;
    const attackTime = 0.05 + n * 0.02;
    const releaseStart = dur - 0.3;

    g.gain.setValueAtTime(0.001, now);
    g.gain.setValueAtTime(0.001, now + attackDelay);
    g.gain.linearRampToValueAtTime(amp, now + attackDelay + attackTime);
    g.gain.setValueAtTime(amp, now + releaseStart);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(g).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.01);
  }
});

// ─── Slide 42: Waterfall Spectrum ───
const wfallCanvas = document.getElementById('wfallCanvas');
const wfallCtx = wfallCanvas.getContext('2d');
const wfallRateSlider = document.getElementById('wfallRate');
const wfallDepthSlider = document.getElementById('wfallDepth');
const wfallCenterSlider = document.getElementById('wfallCenter');
const wfallRateVal = document.getElementById('wfallRateVal');
const wfallDepthVal = document.getElementById('wfallDepthVal');
const wfallCenterVal = document.getElementById('wfallCenterVal');

wfallRateSlider.addEventListener('input', () => { wfallRateVal.textContent = wfallRateSlider.value; });
wfallDepthSlider.addEventListener('input', () => { wfallDepthVal.textContent = wfallDepthSlider.value; });
wfallCenterSlider.addEventListener('input', () => { wfallCenterVal.textContent = wfallCenterSlider.value; });

// Waterfall: store history of spectra
const WFALL_HISTORY = 80;
let wfallAnalyser = null;
let wfallFreqData = null;
let wfallHistory = []; // array of Uint8Array snapshots
let wfallPlaying = false;
let wfallOsc = null;
let wfallLfo = null;

function wfallGetAnalyser() {
  ensureAudioCtx();
  if (!wfallAnalyser) {
    wfallAnalyser = audioCtx.createAnalyser();
    wfallAnalyser.fftSize = 2048;
    wfallAnalyser.smoothingTimeConstant = 0.7;
    wfallAnalyser.connect(audioCtx.destination);
    wfallFreqData = new Uint8Array(wfallAnalyser.frequencyBinCount);
  }
  return wfallAnalyser;
}

document.getElementById('wfallPlayBtn').addEventListener('click', () => {
  ensureAudioCtx();
  if (wfallPlaying) {
    // Stop
    if (wfallOsc) { try { wfallOsc.stop(); } catch(e){} wfallOsc = null; }
    if (wfallLfo) { try { wfallLfo.stop(); } catch(e){} wfallLfo = null; }
    wfallPlaying = false;
    document.getElementById('wfallPlayBtn').textContent = '▶ Play';
    return;
  }

  const analyser = wfallGetAnalyser();
  const center = parseFloat(wfallCenterSlider.value);
  const rate = parseFloat(wfallRateSlider.value);
  const depth = parseFloat(wfallDepthSlider.value);

  // Oscillator with vibrato (LFO modulating frequency)
  wfallOsc = audioCtx.createOscillator();
  wfallOsc.type = 'sine';
  wfallOsc.frequency.value = center;

  wfallLfo = audioCtx.createOscillator();
  wfallLfo.type = 'sine';
  wfallLfo.frequency.value = rate;

  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = depth;

  wfallLfo.connect(lfoGain);
  lfoGain.connect(wfallOsc.frequency);

  const g = audioCtx.createGain();
  g.gain.value = 0.3;

  wfallOsc.connect(g).connect(analyser);
  wfallOsc.start();
  wfallLfo.start();

  wfallPlaying = true;
  wfallHistory = [];
  document.getElementById('wfallPlayBtn').textContent = '■ Stop';

  // Update LFO params in real-time
  const updateLfo = setInterval(() => {
    if (!wfallPlaying) { clearInterval(updateLfo); return; }
    wfallLfo.frequency.value = parseFloat(wfallRateSlider.value);
    lfoGain.gain.value = parseFloat(wfallDepthSlider.value);
    wfallOsc.frequency.value = parseFloat(wfallCenterSlider.value);
  }, 100);
});

function resizeSlide42() {
  const rect = wfallCanvas.parentElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    wfallCanvas.width = rect.width * devicePixelRatio;
    wfallCanvas.height = rect.height * devicePixelRatio;
    wfallCanvas.style.width = rect.width + 'px';
    wfallCanvas.style.height = rect.height + 'px';
  }
}
window.addEventListener('resize', () => { if (current === 41) resizeSlide42(); });

let wfallLastCapture = 0;

function animateSlide42() {
  requestAnimationFrame(animateSlide42);
  if (current !== 41) return;

  const w = wfallCanvas.width, h = wfallCanvas.height;
  if (w === 0 || h === 0) return;
  const dpr = devicePixelRatio;

  // Capture spectrum at ~30fps
  const now = performance.now();
  if (wfallAnalyser && wfallFreqData && wfallPlaying && now - wfallLastCapture > 33) {
    wfallAnalyser.getByteFrequencyData(wfallFreqData);
    wfallHistory.push(new Uint8Array(wfallFreqData));
    if (wfallHistory.length > WFALL_HISTORY) wfallHistory.shift();
    wfallLastCapture = now;
  }

  wfallCtx.clearRect(0, 0, w, h);

  const ml = w * 0.08, mr = w * 0.04;
  const mt = h * 0.04, mb = h * 0.08;
  const pw = w - ml - mr, ph = h - mt - mb;

  // Frequency range to display: 0-2000 Hz
  const fMax = 2000;
  const nyquist = wfallAnalyser ? audioCtx.sampleRate / 2 : 22050;
  const binMax = Math.floor(fMax / nyquist * (wfallFreqData ? wfallFreqData.length : 1024));

  // Draw waterfall: each row is one spectrum snapshot
  // Newest at bottom, oldest at top (like fig 4.8 rotated)
  // Actually fig 4.8: time goes up (y-axis), frequency goes right (x-axis)
  // Each spectrum is a line plotted with slight y-offset

  if (wfallHistory.length > 1) {
    const rowH = ph / WFALL_HISTORY;
    const specAmp = rowH * 3;

    for (let i = 0; i < wfallHistory.length; i++) {
      const spec = wfallHistory[i];
      const baseY = mt + ph - (i + 1) * rowH;
      const alpha = 0.15 + (i / wfallHistory.length) * 0.6;

      // Fill underneath
      wfallCtx.beginPath();
      wfallCtx.moveTo(ml, baseY);
      for (let b = 0; b < binMax; b++) {
        const x = ml + (b / binMax) * pw;
        const val = spec[b] / 255;
        const y = baseY - val * specAmp;
        wfallCtx.lineTo(x, y);
      }
      wfallCtx.lineTo(ml + pw, baseY);
      wfallCtx.closePath();
      wfallCtx.fillStyle = `rgba(255,255,255,0.8)`;
      wfallCtx.fill();

      // Spectrum line
      wfallCtx.beginPath();
      for (let b = 0; b < binMax; b++) {
        const x = ml + (b / binMax) * pw;
        const val = spec[b] / 255;
        const y = baseY - val * specAmp;
        if (b === 0) wfallCtx.moveTo(x, y); else wfallCtx.lineTo(x, y);
      }
      wfallCtx.strokeStyle = `rgba(0,0,0,${alpha})`;
      wfallCtx.lineWidth = 1.2 * dpr;
      wfallCtx.stroke();
    }
  } else {
    // Empty state
    wfallCtx.font = `${Math.round(13 * dpr)}px 'Playfair Display', serif`;
    wfallCtx.fillStyle = '#ccc';
    wfallCtx.textAlign = 'center';
    wfallCtx.fillText('Press Play to see the waterfall spectrum', w * 0.5, h * 0.5);
  }

  // Axes
  wfallCtx.strokeStyle = '#ccc';
  wfallCtx.lineWidth = 1 * dpr;
  wfallCtx.beginPath();
  wfallCtx.moveTo(ml, mt);
  wfallCtx.lineTo(ml, mt + ph);
  wfallCtx.lineTo(ml + pw, mt + ph);
  wfallCtx.stroke();

  // X ticks (frequency)
  wfallCtx.font = `${Math.round(10 * dpr)}px 'Playfair Display', serif`;
  wfallCtx.fillStyle = '#aaa';
  wfallCtx.textAlign = 'center';
  for (let f = 0; f <= fMax; f += 500) {
    const x = ml + (f / fMax) * pw;
    wfallCtx.fillText(f, x, mt + ph + 14 * dpr);
  }
  wfallCtx.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display', serif`;
  wfallCtx.fillText('Frequency (Hz)', ml + pw * 0.5, mt + ph + 28 * dpr);

  // Y label
  wfallCtx.save();
  wfallCtx.translate(14 * dpr, mt + ph * 0.5);
  wfallCtx.rotate(-Math.PI / 2);
  wfallCtx.fillStyle = '#aaa';
  wfallCtx.textAlign = 'center';
  wfallCtx.fillText('Time (s)', 0, 0);
  wfallCtx.restore();
}

setTimeout(() => { resizeSlide42(); }, 100);
animateSlide42();

// ─── Slide 43: Spectrogram (Fig 4.9) ───
const sgCanvas = document.getElementById('sgCanvas');
const sgCtx = sgCanvas.getContext('2d');
const sgStatus = document.getElementById('sgStatus');

let sgAnalyser = null;
let sgFreqData = null;
let sgMicStream = null;
let sgMicSource = null;
let sgRunning = false;

// Spectrogram image data: scrolls left, newest column on right
let sgImageData = null;
let sgWidth = 0;
let sgHeight = 0;

function resizeSlide43() {
  const rect = sgCanvas.parentElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    sgCanvas.width = rect.width * devicePixelRatio;
    sgCanvas.height = rect.height * devicePixelRatio;
    sgCanvas.style.width = rect.width + 'px';
    sgCanvas.style.height = rect.height + 'px';
    sgWidth = sgCanvas.width;
    sgHeight = sgCanvas.height;
    sgImageData = sgCtx.createImageData(sgWidth, sgHeight);
    // Fill white
    for (let i = 0; i < sgImageData.data.length; i += 4) {
      sgImageData.data[i] = 255;
      sgImageData.data[i+1] = 255;
      sgImageData.data[i+2] = 255;
      sgImageData.data[i+3] = 255;
    }
  }
}
window.addEventListener('resize', () => { if (current === 42) resizeSlide43(); });

document.getElementById('sgMicBtn').addEventListener('click', async () => {
  if (sgRunning) {
    // Stop
    if (sgMicStream) { sgMicStream.getTracks().forEach(t => t.stop()); sgMicStream = null; }
    if (sgMicSource) { sgMicSource.disconnect(); sgMicSource = null; }
    sgRunning = false;
    sgStatus.textContent = '';
    document.getElementById('sgMicBtn').textContent = '🎤 Start Microphone';
    return;
  }

  try {
    ensureAudioCtx();
    sgMicStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    sgMicSource = audioCtx.createMediaStreamSource(sgMicStream);

    sgAnalyser = audioCtx.createAnalyser();
    sgAnalyser.fftSize = 2048;
    sgAnalyser.smoothingTimeConstant = 0.6;
    sgFreqData = new Uint8Array(sgAnalyser.frequencyBinCount);

    sgMicSource.connect(sgAnalyser);
    // Don't connect to destination (no feedback)

    sgRunning = true;
    sgStatus.textContent = 'Listening...';
    document.getElementById('sgMicBtn').textContent = '■ Stop';

    // Reset spectrogram
    if (sgImageData) {
      for (let i = 0; i < sgImageData.data.length; i += 4) {
        sgImageData.data[i] = 255;
        sgImageData.data[i+1] = 255;
        sgImageData.data[i+2] = 255;
        sgImageData.data[i+3] = 255;
      }
    }
  } catch(e) {
    sgStatus.textContent = 'Microphone access denied';
  }
});

let sgLastCol = 0;

function animateSlide43() {
  requestAnimationFrame(animateSlide43);
  if (current !== 42) return;

  const w = sgCanvas.width, h = sgCanvas.height;
  if (w === 0 || h === 0 || !sgImageData) return;
  const dpr = devicePixelRatio;

  if (sgRunning && sgAnalyser && sgFreqData) {
    sgAnalyser.getByteFrequencyData(sgFreqData);

    // Scroll image left by 1 pixel
    const data = sgImageData.data;
    const rowBytes = w * 4;
    for (let y = 0; y < h; y++) {
      const rowStart = y * rowBytes;
      // Shift left
      for (let x = 0; x < (w - 1); x++) {
        const dst = rowStart + x * 4;
        const src = rowStart + (x + 1) * 4;
        data[dst] = data[src];
        data[dst+1] = data[src+1];
        data[dst+2] = data[src+2];
      }
    }

    // Draw new column on right edge
    // Y axis: 0 (top) = high freq, h (bottom) = low freq → invert
    // Frequency range: 0 to 8000 Hz
    const nyquist = audioCtx.sampleRate / 2;
    const maxFreq = 8000;
    const maxBin = Math.floor(maxFreq / nyquist * sgFreqData.length);

    for (let y = 0; y < h; y++) {
      // Map y to frequency: bottom = 0Hz, top = maxFreq
      const freqRatio = 1 - (y / h);
      const bin = Math.floor(freqRatio * maxBin);
      const val = bin < sgFreqData.length ? sgFreqData[bin] : 0;

      // Darkness: 0 = white (silence), 255 = black (loud)
      const brightness = 255 - val;
      const idx = (y * w + (w - 1)) * 4;
      data[idx] = brightness;
      data[idx+1] = brightness;
      data[idx+2] = brightness;
      data[idx+3] = 255;
    }
  }

  // Draw image
  sgCtx.putImageData(sgImageData, 0, 0);

  // Overlay axes
  const ml = 0, pw = w;
  const dpr2 = dpr;

  // Y axis labels (frequency)
  sgCtx.font = `${Math.round(10 * dpr2)}px 'Playfair Display', serif`;
  sgCtx.fillStyle = 'rgba(100,100,100,0.7)';
  sgCtx.textAlign = 'left';
  const freqLabels = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];
  freqLabels.forEach(f => {
    const y = h * (1 - f / 8000);
    const label = f >= 1000 ? (f / 1000) + 'k' : f;
    sgCtx.fillText(label, 6 * dpr2, y + 4 * dpr2);
  });

  // Time label
  sgCtx.font = `bold ${Math.round(10 * dpr2)}px 'Playfair Display', serif`;
  sgCtx.fillStyle = 'rgba(100,100,100,0.5)';
  sgCtx.textAlign = 'right';
  sgCtx.fillText('Time →', w - 8 * dpr2, h - 6 * dpr2);
}

setTimeout(() => { resizeSlide43(); }, 100);
animateSlide43();

// ─── Slide 44: Windowing ───
const winCanvas = document.getElementById('winCanvas');
const winCtx = winCanvas.getContext('2d');
let winType = 'rect';
let winSize = 50; // percent
let winTime = 0;

function resizeSlide44() {
  const rect = winCanvas.parentElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    const dpr = devicePixelRatio;
    winCanvas.width = rect.width * dpr;
    winCanvas.height = rect.height * dpr;
    winCanvas.style.width = rect.width + 'px';
    winCanvas.style.height = rect.height + 'px';
    drawSlide44();
  }
}
window.addEventListener('resize', () => { if (current === 43) resizeSlide44(); });

function windowFunc(n, N, type) {
  if (type === 'rect') return 1;
  if (type === 'hann') return 0.5 * (1 - Math.cos(2 * Math.PI * n / N));
  if (type === 'hamming') return 0.54 - 0.46 * Math.cos(2 * Math.PI * n / N);
  return 1;
}

function drawSlide44() {
  const w = winCanvas.width;
  const h = winCanvas.height;
  const dpr = devicePixelRatio;
  const ctx = winCtx;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);

  const rowH = h / 3;
  const pad = 20 * dpr;
  const labelW = 120 * dpr;
  const plotX = labelW;
  const plotW = w - labelW - pad;

  const freq = 5; // 5 Hz signal
  const duration = 1.0; // 1 second displayed
  const samples = Math.floor(plotW);

  // Window region
  const winFrac = winSize / 100;
  const winStart = Math.floor((1 - winFrac) / 2 * samples);
  const winEnd = Math.floor((1 + winFrac) / 2 * samples);
  const winN = winEnd - winStart;

  // Row labels
  const labels = ['Signal', 'Window', 'Windowed Signal'];
  ctx.font = `bold ${Math.round(13 * dpr)}px 'Playfair Display', serif`;
  ctx.fillStyle = '#000';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let r = 0; r < 3; r++) {
    ctx.fillText(labels[r], labelW - 10 * dpr, rowH * r + rowH / 2);
  }

  // Dividing lines
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1 * dpr;
  for (let r = 1; r < 3; r++) {
    ctx.beginPath();
    ctx.moveTo(plotX, rowH * r);
    ctx.lineTo(w - pad, rowH * r);
    ctx.stroke();
  }

  // Highlight window region background
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  for (let r = 0; r < 3; r++) {
    ctx.fillRect(plotX + winStart, rowH * r, winN, rowH);
  }

  // Window boundary lines
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1 * dpr;
  ctx.setLineDash([4 * dpr, 4 * dpr]);
  for (let r = 0; r < 3; r++) {
    ctx.beginPath();
    ctx.moveTo(plotX + winStart, rowH * r);
    ctx.lineTo(plotX + winStart, rowH * (r + 1));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(plotX + winEnd, rowH * r);
    ctx.lineTo(plotX + winEnd, rowH * (r + 1));
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Row 1: Continuous sine wave
  const midY = rowH / 2;
  const amp = rowH * 0.35;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2 * dpr;
  ctx.beginPath();
  for (let i = 0; i < samples; i++) {
    const t = (i / samples) * duration + winTime;
    const y = rowH * 0 + midY - amp * Math.sin(2 * Math.PI * freq * t);
    if (i === 0) ctx.moveTo(plotX + i, y);
    else ctx.lineTo(plotX + i, y);
  }
  ctx.stroke();

  // Zero line for row 1
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1 * dpr;
  ctx.beginPath();
  ctx.moveTo(plotX, rowH * 0 + midY);
  ctx.lineTo(plotX + samples, rowH * 0 + midY);
  ctx.stroke();

  // Row 2: Window function
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1 * dpr;
  ctx.beginPath();
  ctx.moveTo(plotX, rowH * 1 + midY);
  ctx.lineTo(plotX + samples, rowH * 1 + midY);
  ctx.stroke();

  // Window function shape
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2.5 * dpr;
  ctx.beginPath();
  // Before window: zero
  ctx.moveTo(plotX, rowH * 1 + midY);
  ctx.lineTo(plotX + winStart, rowH * 1 + midY);
  // Window region
  for (let i = 0; i <= winN; i++) {
    const wVal = windowFunc(i, winN, winType);
    const y = rowH * 1 + midY - amp * wVal;
    ctx.lineTo(plotX + winStart + i, y);
  }
  // Drop vertically to zero at window end, then continue to right edge
  ctx.lineTo(plotX + winEnd, rowH * 1 + midY);
  ctx.lineTo(plotX + samples, rowH * 1 + midY);
  ctx.stroke();

  // Fill under window
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.beginPath();
  ctx.moveTo(plotX + winStart, rowH * 1 + midY);
  for (let i = 0; i <= winN; i++) {
    const wVal = windowFunc(i, winN, winType);
    const y = rowH * 1 + midY - amp * wVal;
    ctx.lineTo(plotX + winStart + i, y);
  }
  ctx.lineTo(plotX + winEnd, rowH * 1 + midY);
  ctx.closePath();
  ctx.fill();

  // Row 3: Windowed signal (signal * window)
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1 * dpr;
  ctx.beginPath();
  ctx.moveTo(plotX, rowH * 2 + midY);
  ctx.lineTo(plotX + samples, rowH * 2 + midY);
  ctx.stroke();

  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2 * dpr;
  ctx.beginPath();
  // Before window: zero
  ctx.moveTo(plotX, rowH * 2 + midY);
  ctx.lineTo(plotX + winStart, rowH * 2 + midY);
  // Windowed region
  for (let i = 0; i <= winN; i++) {
    const t = ((winStart + i) / samples) * duration + winTime;
    const sig = Math.sin(2 * Math.PI * freq * t);
    const wVal = windowFunc(i, winN, winType);
    const y = rowH * 2 + midY - amp * sig * wVal;
    ctx.lineTo(plotX + winStart + i, y);
  }
  // Drop vertically to zero at window end, then continue to right edge
  ctx.lineTo(plotX + winEnd, rowH * 2 + midY);
  ctx.lineTo(plotX + samples, rowH * 2 + midY);
  ctx.stroke();
}

// Animate slide 44 (flowing signal)
let winAnimId = null;
function animateSlide44() {
  winAnimId = requestAnimationFrame(animateSlide44);
  if (current !== 43) return;
  winTime += 0.008;
  drawSlide44();
}
animateSlide44();

// Window type buttons
document.querySelectorAll('#slide44 .win-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#slide44 .win-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    winType = btn.dataset.win;
    drawSlide44();
  });
});

// Window size slider
const winSizeSlider = document.getElementById('winSizeSlider');
const winSizeVal = document.getElementById('winSizeVal');
winSizeSlider.addEventListener('input', () => {
  winSize = parseFloat(winSizeSlider.value);
  winSizeVal.textContent = winSize + '%';
  drawSlide44();
});

setTimeout(() => { resizeSlide44(); }, 120);

// ─── Slide 45: Sampling & Aliasing ───
const saCanvas = document.getElementById('saCanvas');
const saCtx = saCanvas.getContext('2d');
let saFreq = 5;
const saSampleRate = 64;
const saNyquist = saSampleRate / 2;
const saDuration = 1.0; // seconds

function resizeSlide45() {
  const rect = saCanvas.parentElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    const dpr = devicePixelRatio;
    saCanvas.width = rect.width * dpr;
    saCanvas.height = rect.height * dpr;
    saCanvas.style.width = rect.width + 'px';
    saCanvas.style.height = rect.height + 'px';
    drawSlide45();
  }
}
window.addEventListener('resize', () => { if (current === 44) resizeSlide45(); });

function drawSlide45() {
  const w = saCanvas.width;
  const h = saCanvas.height;
  const dpr = devicePixelRatio;
  const ctx = saCtx;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);

  const pad = 40 * dpr;
  const plotX = pad * 1.5;
  const plotW = w - plotX - pad;
  const plotY = pad * 1.5;
  const plotH = h - plotY - pad * 2;
  const midY = plotY + plotH / 2;
  const amp = plotH * 0.4;

  // Axes
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.5 * dpr;
  // X axis
  ctx.beginPath();
  ctx.moveTo(plotX, midY);
  ctx.lineTo(plotX + plotW, midY);
  ctx.stroke();
  // Y axis
  ctx.beginPath();
  ctx.moveTo(plotX, plotY);
  ctx.lineTo(plotX, plotY + plotH);
  ctx.stroke();

  // Axis labels
  ctx.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display', serif`;
  ctx.fillStyle = '#888';
  ctx.textAlign = 'center';
  ctx.fillText('Time (s)', plotX + plotW / 2, plotY + plotH + pad * 1.2);
  ctx.textAlign = 'right';
  ctx.fillText('Amplitude', plotX - 8 * dpr, plotY - 6 * dpr);

  // Time ticks
  ctx.font = `${Math.round(10 * dpr)}px 'Playfair Display', serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#aaa';
  for (let t = 0; t <= saDuration; t += 0.1) {
    const x = plotX + (t / saDuration) * plotW;
    ctx.beginPath();
    ctx.moveTo(x, midY - 3 * dpr);
    ctx.lineTo(x, midY + 3 * dpr);
    ctx.stroke();
    ctx.fillText(t.toFixed(1), x, midY + 16 * dpr);
  }

  const freq = saFreq;
  const aliased = freq > saNyquist;
  // Compute alias frequency: fold back around Nyquist
  let aliasFreq = freq;
  if (aliased) {
    // Folding: |freq mod saSampleRate - nearest multiple|
    aliasFreq = Math.abs(((freq % saSampleRate) + saSampleRate) % saSampleRate);
    if (aliasFreq > saNyquist) aliasFreq = saSampleRate - aliasFreq;
  }

  // 1. Original continuous sine wave (ghost/transparent)
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 2 * dpr;
  ctx.beginPath();
  const steps = Math.floor(plotW);
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * saDuration;
    const y = midY - amp * Math.sin(2 * Math.PI * freq * t);
    if (i === 0) ctx.moveTo(plotX + i, y);
    else ctx.lineTo(plotX + i, y);
  }
  ctx.stroke();

  // 2. Sample points at 64 Hz
  const numSamples = Math.floor(saDuration * saSampleRate) + 1;
  const samplePoints = [];
  for (let n = 0; n < numSamples; n++) {
    const t = n / saSampleRate;
    if (t > saDuration) break;
    const x = plotX + (t / saDuration) * plotW;
    const val = Math.sin(2 * Math.PI * freq * t);
    const y = midY - amp * val;
    samplePoints.push({ x, y, t, val });
  }

  // Stems
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.5 * dpr;
  samplePoints.forEach(p => {
    ctx.beginPath();
    ctx.moveTo(p.x, midY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });

  // Dots
  ctx.fillStyle = '#000';
  samplePoints.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4 * dpr, 0, 2 * Math.PI);
    ctx.fill();
  });

  // 3. Reconstructed waveform (connecting dots with smooth interpolation)
  if (samplePoints.length > 1) {
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.moveTo(samplePoints[0].x, samplePoints[0].y);
    for (let i = 1; i < samplePoints.length; i++) {
      ctx.lineTo(samplePoints[i].x, samplePoints[i].y);
    }
    ctx.stroke();
  }

  // 4. If aliased, show the aliased sine wave as red dashed line
  if (aliased && aliasFreq > 0.1) {
    ctx.strokeStyle = 'rgba(200,0,0,0.7)';
    ctx.lineWidth = 2 * dpr;
    ctx.setLineDash([6 * dpr, 4 * dpr]);
    ctx.beginPath();
    // Phase-match: find phase so aliased sine passes through sample points
    // At t=0: sin(2*pi*freq*0) = 0, sin(2*pi*aliasFreq*0 + phi) = 0 => phi=0 works for t=0
    // Actually we need to match sample values. The aliased frequency with correct phase:
    // sin(2*pi*freq*t) at sample times = sin(2*pi*aliasFreq*t + phi)
    // For freq = k*sampleRate + aliasFreq or freq = k*sampleRate - aliasFreq
    // If freq > Nyquist: the samples of sin(2*pi*freq*t) at t=n/fs equal sin(2*pi*aliasFreq*n/fs) with possible sign flip
    const fMod = ((freq % saSampleRate) + saSampleRate) % saSampleRate;
    const phaseSign = fMod > saNyquist ? -1 : 1;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * saDuration;
      const y = midY - amp * phaseSign * Math.sin(2 * Math.PI * aliasFreq * t);
      if (i === 0) ctx.moveTo(plotX + i, y);
      else ctx.lineTo(plotX + i, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Label
    ctx.font = `bold ${Math.round(14 * dpr)}px 'Playfair Display', serif`;
    ctx.fillStyle = '#c00';
    ctx.textAlign = 'left';
    ctx.fillText('Aliased as ' + aliasFreq.toFixed(1) + ' Hz', plotX + 10 * dpr, plotY + 20 * dpr);
  }

  // Special case: freq exactly at Nyquist
  if (Math.abs(freq - saNyquist) < 0.5) {
    ctx.font = `bold ${Math.round(13 * dpr)}px 'Playfair Display', serif`;
    ctx.fillStyle = '#888';
    ctx.textAlign = 'left';
    ctx.fillText('At Nyquist — ambiguous sampling', plotX + 10 * dpr, plotY + 20 * dpr);
  }

  // Nyquist marker on the canvas (reference line info)
  ctx.font = `bold ${Math.round(12 * dpr)}px 'Playfair Display', serif`;
  ctx.fillStyle = '#888';
  ctx.textAlign = 'right';
  ctx.fillText('Nyquist = ' + saNyquist + ' Hz', plotX + plotW, plotY - 6 * dpr);

  // Legend
  ctx.font = `${Math.round(11 * dpr)}px 'Playfair Display', serif`;
  const legX = plotX + plotW - 180 * dpr;
  const legY = plotY + plotH + pad * 0.5;

  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 2 * dpr;
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(legX, legY); ctx.lineTo(legX + 20 * dpr, legY); ctx.stroke();
  ctx.fillStyle = '#888';
  ctx.textAlign = 'left';
  ctx.fillText('Original', legX + 24 * dpr, legY + 4 * dpr);

  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(legX + 10 * dpr, legY + 18 * dpr, 3 * dpr, 0, 2 * Math.PI); ctx.fill();
  ctx.fillStyle = '#888';
  ctx.fillText('Samples', legX + 24 * dpr, legY + 22 * dpr);

  if (aliased) {
    ctx.strokeStyle = 'rgba(200,0,0,0.7)';
    ctx.lineWidth = 2 * dpr;
    ctx.setLineDash([6 * dpr, 4 * dpr]);
    ctx.beginPath(); ctx.moveTo(legX, legY + 36 * dpr); ctx.lineTo(legX + 20 * dpr, legY + 36 * dpr); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#c00';
    ctx.fillText('Alias', legX + 24 * dpr, legY + 40 * dpr);
  }
}

// Frequency buttons with smooth transition
const saStatus = document.getElementById('saStatus');
const saControls = document.getElementById('saControls');
let saTargetFreq = 5;
let saCurrentFreq = 5;

const saFreqButtons = [
  { label: '5 Hz', freq: 5 },
  { label: '15 Hz', freq: 15 },
  { label: '28 Hz', freq: 28 },
  { label: '32 Hz (Nyquist)', freq: 32 },
  { label: '36 Hz', freq: 36, alias: true },
  { label: '50 Hz', freq: 50, alias: true },
  { label: '60 Hz', freq: 60, alias: true },
  { label: '64 Hz (=SR)', freq: 64, alias: true },
  { label: '96 Hz', freq: 96, alias: true },
  { label: '120 Hz', freq: 120, alias: true },
];

saFreqButtons.forEach((b, i) => {
  const btn = document.createElement('button');
  btn.className = 'sa-freq-btn' + (b.alias ? ' aliased-btn' : '');
  if (i === 0) btn.classList.add('active');
  btn.textContent = b.label;
  btn.addEventListener('click', () => {
    saControls.querySelectorAll('.sa-freq-btn').forEach(bb => bb.classList.remove('active'));
    btn.classList.add('active');
    saTargetFreq = b.freq;
  });
  saControls.insertBefore(btn, saStatus);
});

function updateSaStatus() {
  const freq = saFreq;
  if (freq > saNyquist + 0.5) {
    let af = Math.abs(((freq % saSampleRate) + saSampleRate) % saSampleRate);
    if (af > saNyquist) af = saSampleRate - af;
    saStatus.textContent = freq.toFixed(1) + ' Hz → Aliased as ' + af.toFixed(1) + ' Hz';
    saStatus.className = 'sa-status aliased';
  } else if (Math.abs(freq - saNyquist) < 0.5) {
    saStatus.textContent = freq.toFixed(1) + ' Hz — At Nyquist (ambiguous)';
    saStatus.className = 'sa-status';
  } else {
    saStatus.textContent = freq.toFixed(1) + ' Hz — OK';
    saStatus.className = 'sa-status';
  }
}

function animateSlide45() {
  requestAnimationFrame(animateSlide45);
  if (current !== 44) return;

  // Smooth lerp toward target
  const diff = saTargetFreq - saCurrentFreq;
  if (Math.abs(diff) > 0.05) {
    saCurrentFreq += diff * 0.04;
  } else {
    saCurrentFreq = saTargetFreq;
  }
  saFreq = saCurrentFreq;
  updateSaStatus();
  drawSlide45();
}

setTimeout(() => { resizeSlide45(); }, 140);
animateSlide45();

// ─── Slide 46: Filter Bank ───
const fbCanvas = document.getElementById('fbCanvas');
const fbCtx2 = fbCanvas.getContext('2d');
const fbBandsSlider = document.getElementById('fbBandsSlider');
const fbBandsVal = document.getElementById('fbBandsVal');

function resizeSlide46() {
  const r = fbCanvas.parentElement.getBoundingClientRect();
  if (r.width > 0 && r.height > 0) {
    fbCanvas.width = r.width * devicePixelRatio;
    fbCanvas.height = r.height * devicePixelRatio;
    fbCanvas.style.width = r.width + 'px';
    fbCanvas.style.height = r.height + 'px';
  }
  drawSlide46();
}

function drawSlide46() {
  const c = fbCtx2;
  const W = fbCanvas.width;
  const H = fbCanvas.height;
  const dpr = devicePixelRatio;
  c.clearRect(0, 0, W, H);

  const bands = parseInt(fbBandsSlider.value);
  fbBandsVal.textContent = bands;

  const pad = { left: 80 * dpr, right: 30 * dpr, top: 30 * dpr, bottom: 50 * dpr };
  const pw = W - pad.left - pad.right;
  const ph = H - pad.top - pad.bottom;

  // Axes
  c.strokeStyle = '#000';
  c.lineWidth = 2 * dpr;
  c.beginPath();
  c.moveTo(pad.left, pad.top);
  c.lineTo(pad.left, pad.top + ph);
  c.lineTo(pad.left + pw, pad.top + ph);
  c.stroke();

  // Labels
  c.fillStyle = '#000';
  c.font = `bold ${12 * dpr}px 'Playfair Display', serif`;
  c.textAlign = 'center';
  c.fillText('Frequency', pad.left + pw / 2, H - 8 * dpr);
  c.save();
  c.translate(18 * dpr, pad.top + ph / 2);
  c.rotate(-Math.PI / 2);
  c.fillText('Amplitude / Gain', 0, 0);
  c.restore();

  // Triangular filters
  const colors = [];
  for (let i = 0; i < bands; i++) {
    const hue = (i / bands) * 300;
    colors.push(`hsl(${hue}, 70%, 45%)`);
  }

  const step = pw / (bands + 1);
  for (let i = 0; i < bands; i++) {
    const cx = pad.left + step * (i + 1);
    const lx = cx - step;
    const rx = cx + step;

    c.beginPath();
    c.moveTo(lx, pad.top + ph);
    c.lineTo(cx, pad.top + 4 * dpr);
    c.lineTo(rx, pad.top + ph);
    c.closePath();
    c.fillStyle = colors[i] + '30';
    c.fill();
    c.strokeStyle = colors[i];
    c.lineWidth = 2 * dpr;
    c.stroke();
  }

  // Tick marks
  c.fillStyle = '#888';
  c.font = `bold ${10 * dpr}px 'Playfair Display', serif`;
  c.textAlign = 'center';
  for (let i = 0; i <= bands; i += Math.max(1, Math.floor(bands / 8))) {
    const x = pad.left + step * (i + 0.5);
    if (x > pad.left + pw) break;
    c.fillText(`f${i}`, x, pad.top + ph + 18 * dpr);
  }
}

fbBandsSlider.addEventListener('input', drawSlide46);
window.addEventListener('resize', () => { if (current === 45) resizeSlide46(); });

// ─── Slide 47: Phase Vocoder - Pitch Shifting ───
const pvOrigCanvas = document.getElementById('pvOrigCanvas');
const pvOrigCtx = pvOrigCanvas.getContext('2d');
const pvShiftCanvas = document.getElementById('pvShiftCanvas');
const pvShiftCtx = pvShiftCanvas.getContext('2d');
const pvShiftLabel = document.getElementById('pvShiftLabel');

let pvMultiplier = 2; // current frequency multiplier

document.getElementById('pvHalfBtn').addEventListener('click', () => {
  pvMultiplier = 0.5;
  pvShiftLabel.textContent = '0.5';
  document.querySelectorAll('#slide47 .pv-btn').forEach(b => { b.style.background='#fff'; b.style.color='#000'; });
  document.getElementById('pvHalfBtn').style.background = '#000';
  document.getElementById('pvHalfBtn').style.color = '#fff';
});
document.getElementById('pvOneBtn').addEventListener('click', () => {
  pvMultiplier = 1;
  pvShiftLabel.textContent = '1';
  document.querySelectorAll('#slide47 .pv-btn').forEach(b => { b.style.background='#fff'; b.style.color='#000'; });
  document.getElementById('pvOneBtn').style.background = '#000';
  document.getElementById('pvOneBtn').style.color = '#fff';
});
document.getElementById('pvTwoBtn').addEventListener('click', () => {
  pvMultiplier = 2;
  pvShiftLabel.textContent = '2';
  document.querySelectorAll('#slide47 .pv-btn').forEach(b => { b.style.background='#fff'; b.style.color='#000'; });
  document.getElementById('pvTwoBtn').style.background = '#000';
  document.getElementById('pvTwoBtn').style.color = '#fff';
});

function resizeSlide47() {
  [pvOrigCanvas, pvShiftCanvas].forEach(cv => {
    const r = cv.parentElement.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      cv.width = r.width * devicePixelRatio;
      cv.height = r.height * devicePixelRatio;
      cv.style.width = r.width + 'px';
      cv.style.height = r.height + 'px';
    }
  });
}

function drawPvFilterBank(ctx, w, h, multiplier) {
  if (w === 0 || h === 0) return;
  const dpr = devicePixelRatio;
  ctx.clearRect(0, 0, w, h);

  const ml = w * 0.08, mr = w * 0.04;
  const mt = h * 0.06, mb = h * 0.1;
  const pw = w - ml - mr, ph = h - mt - mb;
  const baseY = mt + ph;

  // X axis
  ctx.beginPath();
  ctx.moveTo(ml, baseY);
  ctx.lineTo(ml + pw, baseY);
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1 * dpr;
  ctx.stroke();

  const numBands = 8;
  const colors = ['#e74c3c','#3498db','#2ecc71','#9b59b6','#e67e22','#1abc9c','#e84393','#00b894'];
  const bandW = pw / numBands;

  // Draw triangular filters
  for (let i = 0; i < numBands; i++) {
    const cx = ml + (i + 0.5) * bandW * multiplier;
    const left = cx - bandW * multiplier * 0.6;
    const right = cx + bandW * multiplier * 0.6;
    const top = mt + ph * 0.05;

    if (cx > ml + pw + bandW) continue; // off screen

    ctx.beginPath();
    ctx.moveTo(Math.max(ml, left), baseY);
    ctx.lineTo(cx, top);
    ctx.lineTo(Math.min(ml + pw, right), baseY);
    ctx.closePath();
    ctx.fillStyle = colors[i] + '20';
    ctx.fill();
    ctx.strokeStyle = colors[i];
    ctx.lineWidth = 2 * dpr;
    ctx.stroke();

    // Frequency label
    const origFreq = (i + 1) * 100;
    const shiftedFreq = Math.round(origFreq * multiplier);
    if (cx > ml && cx < ml + pw) {
      ctx.font = `bold ${Math.round(9 * dpr)}px 'Playfair Display', serif`;
      ctx.fillStyle = colors[i];
      ctx.textAlign = 'center';
      ctx.fillText(shiftedFreq + ' Hz', cx, top - 6 * dpr);
    }
  }

  // X axis labels
  ctx.font = `${Math.round(9 * dpr)}px 'Playfair Display', serif`;
  ctx.fillStyle = '#aaa';
  ctx.textAlign = 'center';
  for (let f = 0; f <= 1600; f += 200) {
    const x = ml + (f / 1600) * pw;
    if (x <= ml + pw) ctx.fillText(f, x, baseY + 14 * dpr);
  }
  ctx.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display', serif`;
  ctx.fillText('Frequency (Hz)', ml + pw * 0.5, baseY + 28 * dpr);
}

function animateSlide47() {
  requestAnimationFrame(animateSlide47);
  if (current !== 46) return;
  drawPvFilterBank(pvOrigCtx, pvOrigCanvas.width, pvOrigCanvas.height, 1);
  drawPvFilterBank(pvShiftCtx, pvShiftCanvas.width, pvShiftCanvas.height, pvMultiplier);
}

window.addEventListener('resize', () => { if (current === 46) resizeSlide47(); });
setTimeout(() => { resizeSlide47(); }, 100);
animateSlide47();

// ─── Slide 48: Time Stretching ───
const tsCanvas = document.getElementById('tsCanvas');
const tsCtx = tsCanvas.getContext('2d');

function resizeSlide48() {
  const r = tsCanvas.parentElement.getBoundingClientRect();
  if (r.width > 0 && r.height > 0) {
    tsCanvas.width = r.width * devicePixelRatio;
    tsCanvas.height = r.height * devicePixelRatio;
    tsCanvas.style.width = r.width + 'px';
    tsCanvas.style.height = r.height + 'px';
  }
  drawSlide48();
}

function drawSlide48() {
  const c = tsCtx, W = tsCanvas.width, H = tsCanvas.height;
  if (W === 0 || H === 0) return;
  const dpr = devicePixelRatio;
  c.clearRect(0, 0, W, H);

  const pad = { l: W * 0.06, r: W * 0.04, t: H * 0.02, b: H * 0.02 };
  const pw = W - pad.l - pad.r;
  const rowH = (H - pad.t - pad.b) / 3;
  const freq = 3;
  const nFrames = 6;
  const frameW = pw * 0.12;
  const origHop = pw * 0.1;
  const stretchHop = origHop * 1.8;

  // ── Row 1: Original frames (overlapping) ──
  const y1 = pad.t;
  const cy1 = y1 + rowH * 0.55;
  c.font = `bold ${Math.round(12 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#000'; c.textAlign = 'left';
  c.fillText('1. Original: overlapping STFT frames', pad.l, y1 + 16 * dpr);

  // zero line
  c.beginPath(); c.moveTo(pad.l, cy1); c.lineTo(pad.l + pw, cy1);
  c.strokeStyle = '#e8e8e8'; c.lineWidth = 1 * dpr; c.stroke();

  // full waveform faded
  c.beginPath();
  for (let x = 0; x <= pw; x++) {
    const t = x / pw;
    const v = cy1 - Math.sin(t * freq * 6 * Math.PI) * rowH * 0.28;
    if (x === 0) c.moveTo(pad.l + x, v); else c.lineTo(pad.l + x, v);
  }
  c.strokeStyle = '#ccc'; c.lineWidth = 1.5 * dpr; c.stroke();

  const frameColors = ['#e74c3c','#3498db','#2ecc71','#9b59b6','#e67e22','#1abc9c'];
  for (let i = 0; i < nFrames; i++) {
    const fx = pad.l + i * origHop;
    // window envelope + colored waveform
    c.beginPath();
    for (let x = 0; x <= frameW; x++) {
      const env = 0.5 * (1 - Math.cos(2 * Math.PI * x / frameW)); // Hann
      const t = (fx - pad.l + x) / pw;
      const v = cy1 - Math.sin(t * freq * 6 * Math.PI) * env * rowH * 0.28;
      if (x === 0) c.moveTo(fx + x, v); else c.lineTo(fx + x, v);
    }
    c.strokeStyle = frameColors[i]; c.lineWidth = 2 * dpr; c.stroke();

    // frame bracket
    c.fillStyle = frameColors[i]; c.globalAlpha = 0.08;
    c.fillRect(fx, cy1 - rowH * 0.35, frameW, rowH * 0.7);
    c.globalAlpha = 1;

    // hop arrow
    if (i < nFrames - 1) {
      const ax = fx + origHop / 2;
      c.font = `${Math.round(8 * dpr)}px 'Playfair Display',serif`;
      c.fillStyle = '#888'; c.textAlign = 'center';
      c.fillText('hop', ax, cy1 + rowH * 0.38);
    }
  }

  // ── Row 2: Stretched without phase correction ──
  const y2 = pad.t + rowH;
  const cy2 = y2 + rowH * 0.55;
  c.font = `bold ${Math.round(12 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#c0392b'; c.textAlign = 'left';
  c.fillText('2. Naive stretch: frames spread apart → phase mismatch!', pad.l, y2 + 16 * dpr);

  c.beginPath(); c.moveTo(pad.l, cy2); c.lineTo(pad.l + pw, cy2);
  c.strokeStyle = '#e8e8e8'; c.lineWidth = 1 * dpr; c.stroke();

  for (let i = 0; i < nFrames; i++) {
    const fx = pad.l + i * stretchHop;
    if (fx + frameW > pad.l + pw + 10 * dpr) break;

    // Each frame keeps its ORIGINAL phase (not corrected)
    const origStart = i * origHop;
    c.beginPath();
    for (let x = 0; x <= frameW; x++) {
      const env = 0.5 * (1 - Math.cos(2 * Math.PI * x / frameW));
      const t = (origStart + x) / pw; // uses original time position
      const v = cy2 - Math.sin(t * freq * 6 * Math.PI) * env * rowH * 0.28;
      if (x === 0) c.moveTo(fx + x, v); else c.lineTo(fx + x, v);
    }
    c.strokeStyle = frameColors[i]; c.lineWidth = 2 * dpr; c.stroke();
    c.fillStyle = frameColors[i]; c.globalAlpha = 0.08;
    c.fillRect(fx, cy2 - rowH * 0.35, frameW, rowH * 0.7);
    c.globalAlpha = 1;

    // Show phase discontinuity
    if (i > 0) {
      const prevFx = pad.l + (i - 1) * stretchHop;
      const gapX = prevFx + frameW;
      const gapW = fx - gapX;
      if (gapW > 4 * dpr) {
        c.strokeStyle = '#c0392b'; c.lineWidth = 2 * dpr;
        c.setLineDash([3 * dpr, 3 * dpr]);
        c.beginPath(); c.moveTo(gapX, cy2 - rowH * 0.2); c.lineTo(gapX, cy2 + rowH * 0.2); c.stroke();
        c.beginPath(); c.moveTo(fx, cy2 - rowH * 0.2); c.lineTo(fx, cy2 + rowH * 0.2); c.stroke();
        c.setLineDash([]);
        // lightning bolt / mismatch indicator
        c.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display',serif`;
        c.fillStyle = '#c0392b'; c.textAlign = 'center';
        c.fillText('⚡', gapX + gapW / 2, cy2);
      }
    }

    if (i < nFrames - 1) {
      c.font = `${Math.round(8 * dpr)}px 'Playfair Display',serif`;
      c.fillStyle = '#888'; c.textAlign = 'center';
      c.fillText('1.8× hop', fx + stretchHop / 2, cy2 + rowH * 0.38);
    }
  }

  // ── Row 3: Stretched WITH phase correction ──
  const y3 = pad.t + rowH * 2;
  const cy3 = y3 + rowH * 0.55;
  c.font = `bold ${Math.round(12 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#27ae60'; c.textAlign = 'left';
  c.fillText('3. Phase correction: adjust phase for new hop → smooth!', pad.l, y3 + 16 * dpr);

  c.beginPath(); c.moveTo(pad.l, cy3); c.lineTo(pad.l + pw, cy3);
  c.strokeStyle = '#e8e8e8'; c.lineWidth = 1 * dpr; c.stroke();

  for (let i = 0; i < nFrames; i++) {
    const fx = pad.l + i * stretchHop;
    if (fx + frameW > pad.l + pw + 10 * dpr) break;

    // Phase-corrected: each frame's phase is adjusted to new position
    c.beginPath();
    for (let x = 0; x <= frameW; x++) {
      const env = 0.5 * (1 - Math.cos(2 * Math.PI * x / frameW));
      const t = (i * stretchHop + x) / pw; // uses NEW stretched position
      const v = cy3 - Math.sin(t * freq * 6 * Math.PI) * env * rowH * 0.28;
      if (x === 0) c.moveTo(fx + x, v); else c.lineTo(fx + x, v);
    }
    c.strokeStyle = frameColors[i]; c.lineWidth = 2 * dpr; c.stroke();
    c.fillStyle = frameColors[i]; c.globalAlpha = 0.08;
    c.fillRect(fx, cy3 - rowH * 0.35, frameW, rowH * 0.7);
    c.globalAlpha = 1;

    // Smooth connection indicator
    if (i > 0) {
      const prevFx = pad.l + (i - 1) * stretchHop;
      const gapX = prevFx + frameW;
      const gapW = fx - gapX;
      if (gapW > 4 * dpr) {
        c.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display',serif`;
        c.fillStyle = '#27ae60'; c.textAlign = 'center';
        c.fillText('✓', gapX + gapW / 2, cy3);
      }
    }
  }

  // Result waveform (reconstructed, smooth)
  c.beginPath();
  for (let x = 0; x <= pw; x++) {
    const t = x / pw;
    // Overlap-add result: smooth sine at same frequency but stretched
    let val = 0, totalEnv = 0;
    for (let i = 0; i < nFrames; i++) {
      const fxRel = i * stretchHop;
      const rel = x - fxRel;
      if (rel >= 0 && rel <= frameW) {
        const env = 0.5 * (1 - Math.cos(2 * Math.PI * rel / frameW));
        val += env * Math.sin((fxRel + rel) / pw * freq * 6 * Math.PI);
        totalEnv += env;
      }
    }
    if (totalEnv > 0) val /= totalEnv;
    const v = cy3 - val * rowH * 0.12;
    if (x === 0) c.moveTo(pad.l + x, v); else c.lineTo(pad.l + x, v);
  }
  c.strokeStyle = '#27ae60'; c.lineWidth = 1.5 * dpr;
  c.globalAlpha = 0.4; c.stroke(); c.globalAlpha = 1;

  // Bottom labels
  c.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display',serif`;
  c.textAlign = 'center';
  c.fillStyle = '#27ae60';
  c.fillText('Same frequency (pitch preserved), longer duration (time stretched)', pad.l + pw / 2, H - pad.b - 4 * dpr);
}

window.addEventListener('resize', () => { if (current === 47) resizeSlide48(); });

// ─── Slide 49: Wavelet vs Fourier ───
const wfFourierCanvas = document.getElementById('s49FourierCanvas');
const wfFCtx = wfFourierCanvas.getContext('2d');
const wfWaveletCanvas = document.getElementById('s49WaveletCanvas');
const wfWCtx = wfWaveletCanvas.getContext('2d');

function resizeSlide49() {
  [wfFourierCanvas, wfWaveletCanvas].forEach(cv => {
    const r = cv.parentElement.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      cv.width = r.width * devicePixelRatio;
      cv.height = r.height * devicePixelRatio;
      cv.style.width = r.width + 'px';
      cv.style.height = r.height + 'px';
    }
  });
  drawWfFourier();
  drawWfWavelet();
}

function drawWfFourier() {
  const c = wfFCtx;
  const W = wfFourierCanvas.width;
  const H = wfFourierCanvas.height;
  if (W === 0 || H === 0) return;
  const dpr = devicePixelRatio;
  c.clearRect(0, 0, W, H);

  const bands = 8;
  const ml = W * 0.06, mr = W * 0.04, mt = H * 0.06, mb = H * 0.1;
  const pw = W - ml - mr, ph = H - mt - mb;
  const baseY = mt + ph;
  const colors = ['#e74c3c','#3498db','#2ecc71','#9b59b6','#e67e22','#1abc9c','#e84393','#00b894'];

  // X axis
  c.beginPath();
  c.moveTo(ml, baseY);
  c.lineTo(ml + pw, baseY);
  c.strokeStyle = '#ccc';
  c.lineWidth = 1 * dpr;
  c.stroke();

  // Equal-width triangular filters
  const step = pw / (bands + 1);
  for (let i = 0; i < bands; i++) {
    const cx = ml + step * (i + 1);
    const left = cx - step * 0.7;
    const right = cx + step * 0.7;

    c.beginPath();
    c.moveTo(left, baseY);
    c.lineTo(cx, mt + ph * 0.05);
    c.lineTo(right, baseY);
    c.closePath();
    c.fillStyle = colors[i % 8] + '20';
    c.fill();
    c.strokeStyle = colors[i % 8];
    c.lineWidth = 2 * dpr;
    c.stroke();

    c.font = `bold ${Math.round(9 * dpr)}px 'Playfair Display', serif`;
    c.fillStyle = colors[i % 8];
    c.textAlign = 'center';
    c.fillText((i + 1) * 100 + '', cx, mt + ph * 0.05 - 6 * dpr);
  }

  c.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display', serif`;
  c.fillStyle = '#000';
  c.textAlign = 'center';
  c.fillText('Equal bandwidth', ml + pw * 0.5, baseY + 20 * dpr);
  c.fillStyle = '#888';
  c.fillText('Frequency (Hz) →', ml + pw * 0.5, baseY + 36 * dpr);
}

function drawWfWavelet() {
  const c = wfWCtx;
  const W = wfWaveletCanvas.width;
  const H = wfWaveletCanvas.height;
  if (W === 0 || H === 0) return;
  const dpr = devicePixelRatio;
  c.clearRect(0, 0, W, H);

  const bands = 6;
  const ml = W * 0.06, mr = W * 0.04, mt = H * 0.06, mb = H * 0.1;
  const pw = W - ml - mr, ph = H - mt - mb;
  const baseY = mt + ph;
  const colors = ['#e74c3c','#3498db','#2ecc71','#9b59b6','#e67e22','#1abc9c'];

  // X axis
  c.beginPath();
  c.moveTo(ml, baseY);
  c.lineTo(ml + pw, baseY);
  c.strokeStyle = '#ccc';
  c.lineWidth = 1 * dpr;
  c.stroke();

  // Doubling-bandwidth triangular filters
  let totalUnits = 0;
  for (let i = 0; i < bands; i++) totalUnits += Math.pow(2, i);

  let x = ml;
  for (let i = 0; i < bands; i++) {
    const bw = (Math.pow(2, i) / totalUnits) * pw;
    const cx = x + bw * 0.5;
    const left = x;
    const right = x + bw;

    c.beginPath();
    c.moveTo(left, baseY);
    c.lineTo(cx, mt + ph * 0.05);
    c.lineTo(right, baseY);
    c.closePath();
    c.fillStyle = colors[i % 6] + '20';
    c.fill();
    c.strokeStyle = colors[i % 6];
    c.lineWidth = 2 * dpr;
    c.stroke();

    if (bw > 30 * dpr) {
      c.font = `bold ${Math.round(9 * dpr)}px 'Playfair Display', serif`;
      c.fillStyle = colors[i % 6];
      c.textAlign = 'center';
      c.fillText('×' + Math.pow(2, i), cx, mt + ph * 0.05 - 6 * dpr);
    }

    x += bw;
  }

  c.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display', serif`;
  c.fillStyle = '#000';
  c.textAlign = 'center';
  c.fillText('Doubling bandwidth (octave bands)', ml + pw * 0.5, baseY + 20 * dpr);
  c.fillStyle = '#888';
  c.fillText('Frequency (Hz) →', ml + pw * 0.5, baseY + 36 * dpr);
}

window.addEventListener('resize', () => { if (current === 48) resizeSlide49(); });

// ═══════════════════════════════════════════════
// Section 5: Introduction to Pitch Perception
// ═══════════════════════════════════════════════

// ─── Slide 51: Demo Question ───
function playS51A() {
  ensureAudioCtx();
  const btn = document.getElementById('s51BtnA');
  btn.classList.add('playing');
  const now = audioCtx.currentTime, dur = 2;
  const osc = audioCtx.createOscillator();
  osc.type = 'sine'; osc.frequency.value = 440;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.25, now);
  g.gain.setValueAtTime(0.25, now + dur - 0.05);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(now); osc.stop(now + dur);
  setTimeout(() => btn.classList.remove('playing'), dur * 1000);
}
function playS51B() {
  ensureAudioCtx();
  const btn = document.getElementById('s51BtnB');
  btn.classList.add('playing');
  const now = audioCtx.currentTime, dur = 2;
  [2,3,4,5,6].forEach(n => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 440 * n;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.2 / n, now);
    g.gain.setValueAtTime(0.2 / n, now + dur - 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(now); osc.stop(now + dur);
  });
  setTimeout(() => btn.classList.remove('playing'), dur * 1000);
}
document.getElementById('s51BtnA').addEventListener('click', playS51A);
document.getElementById('s51BtnB').addEventListener('click', playS51B);

// ─── Slide 53: Pitch vs Brightness demo ───
function playBrightDark(bright, btnId) {
  ensureAudioCtx();
  const btn = document.getElementById(btnId);
  btn.classList.add('playing');
  const now = audioCtx.currentTime, dur = 2, f0 = 220;
  const nHarm = bright ? 20 : 3;
  for (let n = 1; n <= nHarm; n++) {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = f0 * n;
    const g = audioCtx.createGain();
    const amp = bright ? 0.15 / n : 0.25 / n;
    g.gain.setValueAtTime(amp, now);
    g.gain.setValueAtTime(amp, now + dur - 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(now); osc.stop(now + dur);
  }
  setTimeout(() => btn.classList.remove('playing'), dur * 1000);
}
document.getElementById('s53BtnBright').addEventListener('click', () => playBrightDark(true, 's53BtnBright'));
document.getElementById('s53BtnDark').addEventListener('click', () => playBrightDark(false, 's53BtnDark'));

// ─── Slide 54: Cycles → Fig 5.1 ───
const s54Canvas = document.getElementById('s54Canvas');
const s54Ctx = s54Canvas.getContext('2d');

function resizeSlide54() {
  const r = s54Canvas.parentElement.getBoundingClientRect();
  if (r.width > 0 && r.height > 0) {
    s54Canvas.width = r.width * devicePixelRatio;
    s54Canvas.height = r.height * devicePixelRatio;
    s54Canvas.style.width = r.width + 'px';
    s54Canvas.style.height = r.height + 'px';
  }
  drawSlide54();
}

function drawSlide54() {
  const c = s54Ctx, W = s54Canvas.width, H = s54Canvas.height;
  if (W === 0 || H === 0) return;
  const dpr = devicePixelRatio;
  c.clearRect(0, 0, W, H);
  const pad = { l: W * 0.06, r: W * 0.04, t: H * 0.06, b: H * 0.06 };
  const pw = W - pad.l - pad.r;
  const halfH = (H - pad.t - pad.b) / 2;

  // 4-cycle burst
  const cy1 = pad.t + halfH * 0.5;
  c.font = `bold ${Math.round(13 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#e74c3c'; c.textAlign = 'left';
  c.fillText('4-cycle tone burst', pad.l, pad.t + 16 * dpr);
  c.fillStyle = '#888'; c.font = `${Math.round(11 * dpr)}px 'Playfair Display',serif`;
  c.fillText('No pitch sensation — just a click', pad.l, pad.t + 34 * dpr);

  c.beginPath(); c.moveTo(pad.l, cy1); c.lineTo(pad.l + pw, cy1);
  c.strokeStyle = '#e0e0e0'; c.lineWidth = 1 * dpr; c.stroke();
  c.beginPath();
  const freq4 = 1000;
  for (let x = 0; x <= pw; x++) {
    const t = x / pw;
    const env = (t > 0.1 && t < 0.3) ? Math.pow(Math.sin((t - 0.1) / 0.2 * Math.PI), 2) : 0;
    const y = cy1 - Math.sin(t * 4 / 0.2 * 2 * Math.PI) * env * halfH * 0.35;
    if (x === 0) c.moveTo(pad.l + x, y); else c.lineTo(pad.l + x, y);
  }
  c.strokeStyle = '#e74c3c'; c.lineWidth = 2 * dpr; c.stroke();

  // 25-cycle burst
  const cy2 = pad.t + halfH + halfH * 0.5;
  c.font = `bold ${Math.round(13 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#2ecc71'; c.textAlign = 'left';
  c.fillText('25-cycle tone burst', pad.l, pad.t + halfH + 16 * dpr);
  c.fillStyle = '#888'; c.font = `${Math.round(11 * dpr)}px 'Playfair Display',serif`;
  c.fillText('Clear pitch sensation!', pad.l, pad.t + halfH + 34 * dpr);

  c.beginPath(); c.moveTo(pad.l, cy2); c.lineTo(pad.l + pw, cy2);
  c.strokeStyle = '#e0e0e0'; c.lineWidth = 1 * dpr; c.stroke();
  c.beginPath();
  for (let x = 0; x <= pw; x++) {
    const t = x / pw;
    const env = (t > 0.05 && t < 0.95) ? Math.pow(Math.sin((t - 0.05) / 0.9 * Math.PI), 2) : 0;
    const y = cy2 - Math.sin(t * 25 * 2 * Math.PI) * env * halfH * 0.35;
    if (x === 0) c.moveTo(pad.l + x, y); else c.lineTo(pad.l + x, y);
  }
  c.strokeStyle = '#2ecc71'; c.lineWidth = 2 * dpr; c.stroke();
}

function playToneBurst(cycles, btnId) {
  ensureAudioCtx();
  const btn = document.getElementById(btnId);
  btn.classList.add('playing');
  const freq = 1000;
  const dur = cycles / freq;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.type = 'sine'; osc.frequency.value = freq;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.3, now + dur * 0.1);
  g.gain.setValueAtTime(0.3, now + dur * 0.9);
  g.gain.linearRampToValueAtTime(0, now + dur);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(now); osc.stop(now + dur);
  setTimeout(() => btn.classList.remove('playing'), Math.max(dur, 0.3) * 1000);
}
document.getElementById('s54Btn4').addEventListener('click', () => playToneBurst(4, 's54Btn4'));
document.getElementById('s54Btn25').addEventListener('click', () => playToneBurst(25, 's54Btn25'));
window.addEventListener('resize', () => { if (current === 53) resizeSlide54(); });

// ─── Slide 55: Missing Fundamental ───
const s55Canvas = document.getElementById('s55Canvas');
const s55Ctx = s55Canvas.getContext('2d');
const mfF0 = 220;

function resizeSlide55() {
  const r = s55Canvas.parentElement.getBoundingClientRect();
  if (r.width > 0 && r.height > 0) {
    s55Canvas.width = r.width * devicePixelRatio;
    s55Canvas.height = r.height * devicePixelRatio;
    s55Canvas.style.width = r.width + 'px';
    s55Canvas.style.height = r.height + 'px';
  }
  drawSlide55();
}
let s55Mode = null;
function drawSlide55(mode) {
  s55Mode = mode || null;
  const c = s55Ctx, W = s55Canvas.width, H = s55Canvas.height;
  if (W === 0 || H === 0) return;
  const dpr = devicePixelRatio;
  c.clearRect(0, 0, W, H);
  const harmonics = [1,2,3,4,5];
  const colors = ['#e74c3c','#3498db','#2ecc71','#9b59b6','#e67e22'];
  const pad = { l: W * 0.08, r: W * 0.04, t: H * 0.04, b: H * 0.12 };
  const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
  const barArea = ph * 0.4;
  const barW = pw / (harmonics.length * 2.5);
  const gap = barW * 0.8;

  harmonics.forEach((n, i) => {
    const x = pad.l + gap + i * (barW + gap);
    const amp = 1 / n;
    const barH = amp * barArea * 0.9;
    const isMissing = mode === 'missing' && n === 1;
    const isOnly = mode === 'fund' && n !== 1;
    c.fillStyle = (isMissing || isOnly) ? '#ddd' : colors[i];
    c.fillRect(x, pad.t + barArea - barH, barW, barH);
    if (isMissing) {
      const cx = x + barW / 2, cy = pad.t + barArea - barH / 2;
      c.strokeStyle = '#c0392b'; c.lineWidth = 3 * dpr;
      const sz = barW * 0.3;
      c.beginPath(); c.moveTo(cx - sz, cy - sz); c.lineTo(cx + sz, cy + sz); c.stroke();
      c.beginPath(); c.moveTo(cx + sz, cy - sz); c.lineTo(cx - sz, cy + sz); c.stroke();
    }
    c.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display',serif`;
    c.fillStyle = (isMissing || isOnly) ? '#bbb' : colors[i];
    c.textAlign = 'center';
    c.fillText(n + 'f\u2080 ' + (mfF0 * n) + 'Hz', x + barW / 2, pad.t + barArea + 16 * dpr);
  });

  // Combined waveform
  const waveY = pad.t + barArea + 40 * dpr;
  const waveH = H - waveY - pad.b;
  const waveCy = waveY + waveH / 2;
  c.beginPath(); c.moveTo(pad.l, waveCy); c.lineTo(pad.l + pw, waveCy);
  c.strokeStyle = '#e0e0e0'; c.lineWidth = 1 * dpr; c.stroke();
  c.beginPath();
  for (let x = 0; x <= pw; x++) {
    const t = x / pw;
    let y = 0;
    harmonics.forEach(n => {
      if (mode === 'missing' && n === 1) return;
      if (mode === 'fund' && n !== 1) return;
      y += (1 / n) * Math.sin(t * n * 4 * 2 * Math.PI);
    });
    const py = waveCy - y * waveH * 0.3;
    if (x === 0) c.moveTo(pad.l + x, py); else c.lineTo(pad.l + x, py);
  }
  c.strokeStyle = mode === 'missing' ? '#c0392b' : '#000';
  c.lineWidth = 2 * dpr; c.stroke();

  c.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#888'; c.textAlign = 'left';
  c.fillText('Combined Waveform', pad.l, waveY - 6 * dpr);
  if (mode) {
    c.fillStyle = mode === 'missing' ? '#c0392b' : '#000';
    c.textAlign = 'right';
    c.fillText(mode === 'missing' ? 'Still perceived: 220 Hz!' : 'Perceived: 220 Hz', pad.l + pw, waveY - 6 * dpr);
  }
}
function playMfTone(hList, btnId, mode) {
  ensureAudioCtx();
  const btn = document.getElementById(btnId);
  btn.classList.add('playing');
  const now = audioCtx.currentTime, dur = 2;
  hList.forEach(n => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = mfF0 * n;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.22 / n, now);
    g.gain.setValueAtTime(0.22 / n, now + dur - 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(now); osc.stop(now + dur);
  });
  drawSlide55(mode);
  setTimeout(() => { btn.classList.remove('playing'); drawSlide55(); }, dur * 1000);
}
document.getElementById('s55BtnFull').addEventListener('click', () => playMfTone([1,2,3,4,5], 's55BtnFull', 'full'));
document.getElementById('s55BtnMissing').addEventListener('click', () => playMfTone([2,3,4,5], 's55BtnMissing', 'missing'));
document.getElementById('s55BtnFund').addEventListener('click', () => playMfTone([1], 's55BtnFund', 'fund'));
window.addEventListener('resize', () => { if (current === 54) resizeSlide55(); });

// ─── Slide 56: Why Missing Fundamental ───
const s56Canvas = document.getElementById('s56Canvas');
const s56Ctx = s56Canvas.getContext('2d');

function resizeSlide56() {
  const r = s56Canvas.parentElement.getBoundingClientRect();
  if (r.width > 0 && r.height > 0) {
    s56Canvas.width = r.width * devicePixelRatio;
    s56Canvas.height = r.height * devicePixelRatio;
    s56Canvas.style.width = r.width + 'px';
    s56Canvas.style.height = r.height + 'px';
  }
  drawSlide56();
}
function drawSlide56() {
  const c = s56Ctx, W = s56Canvas.width, H = s56Canvas.height;
  if (W === 0 || H === 0) return;
  const dpr = devicePixelRatio;
  c.clearRect(0, 0, W, H);
  const pad = { l: W * 0.08, r: W * 0.06, t: H * 0.06, b: H * 0.06 };
  const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;

  // Draw harmonic relationship diagram
  const colors = ['#e74c3c','#3498db','#2ecc71','#9b59b6','#e67e22','#1abc9c'];
  const f0 = 440;
  const harmonics = [1,2,3,4,5,6];
  const maxF = f0 * 7;
  const barH = ph * 0.08;

  // Frequency axis
  c.beginPath(); c.moveTo(pad.l, pad.t + ph * 0.7); c.lineTo(pad.l + pw, pad.t + ph * 0.7);
  c.strokeStyle = '#ccc'; c.lineWidth = 1 * dpr; c.stroke();
  c.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#888'; c.textAlign = 'center';
  c.fillText('Frequency (Hz) →', pad.l + pw / 2, pad.t + ph * 0.7 + 30 * dpr);

  // Draw harmonic bars
  harmonics.forEach((n, i) => {
    const x = pad.l + ((f0 * n) / maxF) * pw;
    const y = pad.t + ph * 0.3;
    const bh = barH * (1 / n) * 4;
    c.fillStyle = colors[i]; c.fillRect(x - 4 * dpr, y, 8 * dpr, bh);
    c.font = `bold ${Math.round(9 * dpr)}px 'Playfair Display',serif`;
    c.fillStyle = colors[i]; c.textAlign = 'center';
    c.fillText(n + 'f\u2080', x, y - 8 * dpr);
    c.fillStyle = '#888';
    c.fillText((f0 * n) + '', x, pad.t + ph * 0.7 + 14 * dpr);
  });

  // Highlight 2,3,4 as consecutive
  const x2 = pad.l + ((f0 * 2) / maxF) * pw;
  const x4 = pad.l + ((f0 * 4) / maxF) * pw;
  c.strokeStyle = '#c0392b'; c.lineWidth = 2 * dpr; c.setLineDash([6 * dpr, 4 * dpr]);
  c.strokeRect(x2 - 14 * dpr, pad.t + ph * 0.2, x4 - x2 + 28 * dpr, ph * 0.35);
  c.setLineDash([]);

  c.font = `bold ${Math.round(12 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#c0392b'; c.textAlign = 'center';
  c.fillText('3 consecutive harmonics → brain infers 440 Hz', pad.l + pw / 2, pad.t + ph * 0.12);

  // Arrow down to implied fundamental
  const xf0 = pad.l + (f0 / maxF) * pw;
  c.beginPath(); c.moveTo(x2 + (x4 - x2) / 2, pad.t + ph * 0.6);
  c.lineTo(xf0, pad.t + ph * 0.68);
  c.strokeStyle = '#c0392b'; c.lineWidth = 2 * dpr; c.stroke();
  c.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#c0392b';
  c.fillText('Implied f\u2080 = 440 Hz', xf0, pad.t + ph * 0.78);

  // Orchestra chime example
  c.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#000'; c.textAlign = 'left';
  c.fillText('Orchestra chime: 4th, 5th, 6th partials ≈ 2nd, 3rd, 4th harmonics → you hear the missing fundamental', pad.l, pad.t + ph * 0.92);
}
function playS56(freqs, btnId) {
  ensureAudioCtx();
  const btn = document.getElementById(btnId);
  btn.classList.add('playing');
  const now = audioCtx.currentTime, dur = 2;
  freqs.forEach((f, i) => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = f;
    const g = audioCtx.createGain();
    const amp = 0.2 / (i + 1);
    g.gain.setValueAtTime(amp, now);
    g.gain.setValueAtTime(amp, now + dur - 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(now); osc.stop(now + dur);
  });
  setTimeout(() => btn.classList.remove('playing'), dur * 1000);
}
document.getElementById('s56Btn234').addEventListener('click', () => playS56([880, 1320, 1760], 's56Btn234'));
document.getElementById('s56Btn440').addEventListener('click', () => playS56([440], 's56Btn440'));
window.addEventListener('resize', () => { if (current === 55) resizeSlide56(); });

// ─── Slide 57: Virtual Pitch (Terhardt) ───
const s57Canvas = document.getElementById('s57Canvas');
const s57Ctx = s57Canvas.getContext('2d');

function resizeSlide57() {
  const r = s57Canvas.parentElement.getBoundingClientRect();
  if (r.width > 0 && r.height > 0) {
    s57Canvas.width = r.width * devicePixelRatio;
    s57Canvas.height = r.height * devicePixelRatio;
    s57Canvas.style.width = r.width + 'px';
    s57Canvas.style.height = r.height + 'px';
  }
  drawSlide57();
}
function drawSlide57() {
  const c = s57Ctx, W = s57Canvas.width, H = s57Canvas.height;
  if (W === 0 || H === 0) return;
  const dpr = devicePixelRatio;
  c.clearRect(0, 0, W, H);
  const pad = { l: W * 0.06, r: W * 0.06, t: H * 0.06, b: H * 0.06 };
  const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;

  // Flowchart
  const boxes = [
    { label: 'Spectrum Analysis\n(Fourier Transform)', y: 0.05 },
    { label: 'Identify Prominent\nSinusoidal Components', y: 0.25 },
    { label: 'Find Common Subharmonics\n(Candidate Virtual Pitches)', y: 0.45 },
    { label: 'Select Most Likely Pitch\n(Highest Salience)', y: 0.65 },
  ];
  const boxW = pw * 0.4, boxH = ph * 0.13;
  const cx = pad.l + pw / 2;

  boxes.forEach((b, i) => {
    const y = pad.t + b.y * ph;
    c.fillStyle = i === 3 ? '#000' : '#f8f8f8';
    c.strokeStyle = '#000'; c.lineWidth = 2 * dpr;
    c.beginPath(); c.roundRect(cx - boxW / 2, y, boxW, boxH, 6 * dpr);
    c.fill(); c.stroke();
    c.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display',serif`;
    c.fillStyle = i === 3 ? '#fff' : '#000'; c.textAlign = 'center';
    const lines = b.label.split('\n');
    lines.forEach((line, li) => {
      c.fillText(line, cx, y + boxH / 2 + (li - (lines.length - 1) / 2) * 16 * dpr);
    });
    if (i < boxes.length - 1) {
      const ny = pad.t + boxes[i + 1].y * ph;
      c.beginPath(); c.moveTo(cx, y + boxH); c.lineTo(cx, ny);
      c.strokeStyle = '#000'; c.lineWidth = 2 * dpr; c.stroke();
      c.beginPath(); c.moveTo(cx - 6 * dpr, ny - 8 * dpr); c.lineTo(cx, ny);
      c.lineTo(cx + 6 * dpr, ny - 8 * dpr); c.fillStyle = '#000'; c.fill();
    }
  });

  // Side labels
  c.font = `bold ${Math.round(12 * dpr)}px 'Playfair Display',serif`;
  c.textAlign = 'left'; c.fillStyle = '#3498db';
  c.fillText('Spectral Pitch', pad.l + pw * 0.75, pad.t + ph * 0.3);
  c.fillText('= actual component', pad.l + pw * 0.75, pad.t + ph * 0.3 + 18 * dpr);

  c.fillStyle = '#c0392b';
  c.fillText('Virtual Pitch', pad.l + pw * 0.75, pad.t + ph * 0.55);
  c.fillText('= inferred from harmonics', pad.l + pw * 0.75, pad.t + ph * 0.55 + 18 * dpr);

  c.font = `bold ${Math.round(13 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#000'; c.textAlign = 'center';
  c.fillText('Most musical pitch = Virtual Pitch', cx, pad.t + ph * 0.88);
}
window.addEventListener('resize', () => { if (current === 56) resizeSlide57(); });

// ─── Slide 58: Dual Mechanism — Fig 5.2 ───
const s58Canvas = document.getElementById('s58Canvas');
const s58Ctx = s58Canvas.getContext('2d');

function resizeSlide58() {
  const r = s58Canvas.parentElement.getBoundingClientRect();
  if (r.width > 0 && r.height > 0) {
    s58Canvas.width = r.width * devicePixelRatio;
    s58Canvas.height = r.height * devicePixelRatio;
    s58Canvas.style.width = r.width + 'px';
    s58Canvas.style.height = r.height + 'px';
  }
  drawSlide58();
}
function drawSlide58() {
  const c = s58Ctx, W = s58Canvas.width, H = s58Canvas.height;
  if (W === 0 || H === 0) return;
  const dpr = devicePixelRatio;
  c.clearRect(0, 0, W, H);
  const pad = { l: W * 0.06, r: W * 0.04, t: H * 0.06, b: H * 0.14 };
  const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;

  // Waveform of 10 harmonics
  const f0 = 55;
  const nH = 10;
  const cy = pad.t + ph * 0.35;
  c.beginPath(); c.moveTo(pad.l, cy); c.lineTo(pad.l + pw, cy);
  c.strokeStyle = '#e0e0e0'; c.lineWidth = 1 * dpr; c.stroke();

  c.beginPath();
  for (let x = 0; x <= pw; x++) {
    const t = x / pw * 4;
    let y = 0;
    for (let n = 1; n <= nH; n++) y += Math.cos(t * n * 2 * Math.PI);
    const py = cy - y / nH * ph * 0.25;
    if (x === 0) c.moveTo(pad.l + x, py); else c.lineTo(pad.l + x, py);
  }
  c.strokeStyle = '#000'; c.lineWidth = 2 * dpr; c.stroke();

  c.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#e74c3c'; c.textAlign = 'left';
  c.fillText('← Large peaks = Low-freq mechanism counts peaks', pad.l, pad.t + 16 * dpr);
  c.fillStyle = '#3498db';
  c.fillText('← Wiggles between peaks = High-freq mechanism (basilar membrane position)', pad.l, pad.t + 34 * dpr);

  // Spectrum bars
  const specY = pad.t + ph * 0.65;
  const specH = ph * 0.3;
  c.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#888'; c.textAlign = 'center';
  c.fillText('Magnitude Spectrum', pad.l + pw / 2, specY - 6 * dpr);

  c.beginPath(); c.moveTo(pad.l, specY + specH); c.lineTo(pad.l + pw * 0.7, specY + specH);
  c.strokeStyle = '#ccc'; c.lineWidth = 1 * dpr; c.stroke();

  for (let n = 1; n <= nH; n++) {
    const x = pad.l + (n / (nH + 2)) * pw * 0.7;
    const bh = specH * 0.8;
    c.fillStyle = n <= 3 ? '#e74c3c' : '#3498db';
    c.fillRect(x - 3 * dpr, specY + specH - bh, 6 * dpr, bh);
    c.font = `${Math.round(8 * dpr)}px 'Playfair Display',serif`;
    c.fillStyle = '#888'; c.textAlign = 'center';
    c.fillText(n + '', x, specY + specH + 12 * dpr);
  }

  // Crossover info
  c.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#000'; c.textAlign = 'left';
  const infoX = pad.l + pw * 0.72;
  c.fillText('~300 Hz: Low-freq dominates', infoX, specY + 20 * dpr);
  c.fillText('~640 Hz: Both equal', infoX, specY + 38 * dpr);
  c.fillText('~1600 Hz: High-freq dominates', infoX, specY + 56 * dpr);
}
function playS58(f0, btnId) {
  ensureAudioCtx();
  const btn = document.getElementById(btnId);
  btn.classList.add('playing');
  const now = audioCtx.currentTime, dur = 2;
  for (let n = 1; n <= 10; n++) {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = f0 * n;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.15 / n, now);
    g.gain.setValueAtTime(0.15 / n, now + dur - 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(now); osc.stop(now + dur);
  }
  setTimeout(() => btn.classList.remove('playing'), dur * 1000);
}
window.addEventListener('resize', () => { if (current === 57) resizeSlide58(); });

// ─── Slide 59: Evidence Fig 5.3 + 5.4 ───
const s59Canvas = document.getElementById('s59Canvas');
const s59Ctx = s59Canvas.getContext('2d');

function resizeSlide59() {
  const r = s59Canvas.parentElement.getBoundingClientRect();
  if (r.width > 0 && r.height > 0) {
    s59Canvas.width = r.width * devicePixelRatio;
    s59Canvas.height = r.height * devicePixelRatio;
    s59Canvas.style.width = r.width + 'px';
    s59Canvas.style.height = r.height + 'px';
  }
  drawSlide59();
}
function drawSlide59() {
  const c = s59Ctx, W = s59Canvas.width, H = s59Canvas.height;
  if (W === 0 || H === 0) return;
  const dpr = devicePixelRatio;
  c.clearRect(0, 0, W, H);
  const pad = { l: W * 0.06, r: W * 0.04, t: H * 0.03, b: H * 0.03 };
  const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;

  // Layout: 3 rows for waveforms, then results section
  const waveH = ph * 0.2;
  const gapH = ph * 0.02;
  const waveW = pw * 0.55;

  const cfgs = [
    { label: '(a) 12 harmonics (1-12)', sub: 'Big peaks + small wiggles', color: '#e74c3c',
      gen: t => { let v=0; for(let n=1;n<=12;n++) v+=(1.2-n*0.08)*Math.cos(t*n*2*Math.PI); return v/8; } },
    { label: '(b) 6 harmonics (1-6)', sub: 'Big peaks + moderate wiggles', color: '#3498db',
      gen: t => { let v=0; for(let n=1;n<=6;n++) v+=(1.2-n*0.15)*Math.cos(t*n*2*Math.PI); return v/5; } },
    { label: '(c) Only harmonics 7-12', sub: 'No peaks — only wiggles (envelope is periodic)', color: '#2ecc71',
      gen: t => { const a=[0.4,0.8,1.2,1.2,0.8,0.4]; let v=0; for(let i=0;i<6;i++) v+=a[i]*Math.cos(t*(i+7)*2*Math.PI); return v/5; } },
  ];

  // Draw waveforms
  cfgs.forEach((cfg, ri) => {
    const yt = pad.t + ri * (waveH + gapH);
    const cy = yt + waveH / 2;

    // Label
    c.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display',serif`;
    c.fillStyle = cfg.color; c.textAlign = 'left';
    c.fillText(cfg.label, pad.l, yt + 13 * dpr);
    c.fillStyle = '#888';
    c.font = `${Math.round(9 * dpr)}px 'Playfair Display',serif`;
    c.fillText(cfg.sub, pad.l, yt + 26 * dpr);

    // Zero line
    c.beginPath(); c.moveTo(pad.l, cy); c.lineTo(pad.l + waveW, cy);
    c.strokeStyle = '#e8e8e8'; c.lineWidth = 1 * dpr; c.stroke();

    // Waveform
    c.beginPath();
    for (let x = 0; x <= waveW; x++) {
      const t = x / waveW * 4;
      const v = cy - cfg.gen(t) * waveH * 0.38;
      if (x === 0) c.moveTo(pad.l + x, v); else c.lineTo(pad.l + x, v);
    }
    c.strokeStyle = cfg.color; c.lineWidth = 1.8 * dpr; c.stroke();

    // Annotations for (a): mark peaks and wiggles
    if (ri === 0) {
      c.font = `${Math.round(8 * dpr)}px 'Playfair Display',serif`;
      c.fillStyle = '#e74c3c'; c.textAlign = 'center';
      // Mark a peak
      const peakX = waveW / 4;
      c.fillText('peak', pad.l + peakX, yt + 12 * dpr + waveH * 0.04);
    }
  });

  // Right side: Results comparison table
  const tableX = pad.l + waveW + pw * 0.06;
  const tableW = pw - waveW - pw * 0.06;
  const tableY = pad.t;

  c.font = `bold ${Math.round(12 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#000'; c.textAlign = 'center';
  c.fillText('What pitch do you hear?', tableX + tableW / 2, tableY + 16 * dpr);

  // Table headers
  const colW = tableW / 3;
  const headerY = tableY + 38 * dpr;
  c.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#888';
  c.fillText('', tableX + colW * 0.5, headerY);
  c.fillText('at 55 Hz', tableX + colW * 1.5, headerY);
  c.fillText('at 440 Hz', tableX + colW * 2.5, headerY);

  // separator
  c.beginPath();
  c.moveTo(tableX, headerY + 8 * dpr);
  c.lineTo(tableX + tableW, headerY + 8 * dpr);
  c.strokeStyle = '#ddd'; c.lineWidth = 1 * dpr; c.stroke();

  // Rows
  const rowData = [
    { label: '(a)', lowResult: 'f₀', highResult: 'f₀', color: '#e74c3c' },
    { label: '(b)', lowResult: 'f₀', highResult: 'f₀', color: '#3498db' },
    { label: '(c)', lowResult: 'f₀', highResult: '≠ f₀ !', color: '#2ecc71', highAlert: true },
  ];
  rowData.forEach((rd, i) => {
    const ry = headerY + 28 * dpr + i * 30 * dpr;
    c.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display',serif`;
    c.fillStyle = rd.color; c.textAlign = 'center';
    c.fillText(rd.label, tableX + colW * 0.5, ry);
    c.fillStyle = '#000';
    c.fillText(rd.lowResult, tableX + colW * 1.5, ry);
    c.fillStyle = rd.highAlert ? '#c0392b' : '#000';
    c.font = `bold ${Math.round(rd.highAlert ? 13 : 11) * dpr}px 'Playfair Display',serif`;
    c.fillText(rd.highResult, tableX + colW * 2.5, ry);
  });

  // Explanation box
  const explY = headerY + 130 * dpr;
  c.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display',serif`;
  c.textAlign = 'left';

  c.fillStyle = '#000';
  c.fillText('Why?', tableX, explY);

  c.font = `${Math.round(9.5 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#555';
  const lines = [
    'At 55 Hz (low): ear counts peaks',
    '→ (c) has same envelope period',
    '→ same pitch as (a)(b)',
    '',
    'At 440 Hz (high): ear uses',
    'basilar membrane position',
    '→ (c) has no energy near f₀',
    '→ different pitch!',
  ];
  lines.forEach((line, i) => {
    if (line.startsWith('→')) c.fillStyle = '#c0392b';
    else c.fillStyle = '#555';
    c.fillText(line, tableX, explY + (i + 1) * 15 * dpr);
  });

  // Bottom: crossover info
  const bottomY = pad.t + ph * 0.88;
  c.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#000'; c.textAlign = 'center';
  c.fillText('Transition: ~300 Hz (low dominates) → ~640 Hz (equal) → ~1600 Hz (high dominates)', pad.l + pw / 2, bottomY);
}
let s59Analyser = null;
let s59FreqData = null;
let s59AnimId = null;
let s59Playing = false;

function s59GetAnalyser() {
  ensureAudioCtx();
  if (!s59Analyser) {
    s59Analyser = audioCtx.createAnalyser();
    s59Analyser.fftSize = 4096;
    s59Analyser.smoothingTimeConstant = 0.8;
    s59Analyser.connect(audioCtx.destination);
    s59FreqData = new Uint8Array(s59Analyser.frequencyBinCount);
  }
  return s59Analyser;
}

function drawS59Eq() {
  if (!s59Playing || current !== 58) { s59AnimId = null; return; }
  s59AnimId = requestAnimationFrame(drawS59Eq);
  if (!s59Analyser) return;
  s59Analyser.getByteFrequencyData(s59FreqData);

  const c = s59Ctx, W = s59Canvas.width, H = s59Canvas.height;
  const dpr = devicePixelRatio;
  // Draw EQ in bottom-right area
  const eqX = W * 0.62, eqY = H * 0.62;
  const eqW = W * 0.34, eqH = H * 0.3;

  c.fillStyle = '#fff';
  c.fillRect(eqX, eqY, eqW, eqH);
  c.strokeStyle = '#ddd'; c.lineWidth = 1 * dpr;
  c.strokeRect(eqX, eqY, eqW, eqH);

  c.font = `bold ${Math.round(9 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#888'; c.textAlign = 'center';
  c.fillText('Spectrum (live)', eqX + eqW / 2, eqY + 12 * dpr);

  const sr = audioCtx.sampleRate;
  const binCount = s59Analyser.frequencyBinCount;
  const maxFreqShow = 5000;
  const maxBin = Math.min(binCount, Math.floor(maxFreqShow / (sr / s59Analyser.fftSize)));

  const barPad = 2 * dpr;
  const barAreaW = eqW - barPad * 2;
  const barAreaH = eqH - 20 * dpr;
  const barAreaY = eqY + 16 * dpr;

  // Draw as smooth line
  c.beginPath();
  for (let i = 0; i < maxBin; i++) {
    const x = eqX + barPad + (i / maxBin) * barAreaW;
    const val = s59FreqData[i] / 255;
    const y = barAreaY + barAreaH - val * barAreaH;
    if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
  }
  c.strokeStyle = '#000'; c.lineWidth = 1.5 * dpr; c.stroke();

  // Frequency labels
  c.font = `${Math.round(7 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#aaa'; c.textAlign = 'center';
  [100, 500, 1000, 2000, 4000].forEach(f => {
    const bin = Math.floor(f / (sr / s59Analyser.fftSize));
    const x = eqX + barPad + (bin / maxBin) * barAreaW;
    if (x < eqX + eqW - 10 * dpr) {
      c.fillText(f >= 1000 ? (f/1000)+'k' : f+'', x, barAreaY + barAreaH + 10 * dpr);
    }
  });
}

function playS59(f0, harmonicList, ampFunc, btnId) {
  ensureAudioCtx();
  const analyser = s59GetAnalyser();
  const btn = document.getElementById(btnId);
  btn.classList.add('playing');
  const now = audioCtx.currentTime, dur = 2.5;

  harmonicList.forEach((n, i) => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f0 * n;
    const g = audioCtx.createGain();
    const amp = ampFunc(i) * 0.08;
    g.gain.setValueAtTime(amp, now);
    g.gain.setValueAtTime(amp, now + dur - 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g).connect(analyser);
    osc.start(now);
    osc.stop(now + dur);
  });

  s59Playing = true;
  // Redraw base then start EQ overlay
  drawSlide59();
  if (!s59AnimId) drawS59Eq();

  setTimeout(() => {
    btn.classList.remove('playing');
    s59Playing = false;
    setTimeout(() => drawSlide59(), 100);
  }, dur * 1000);
}

// (a) 12 harmonics 1-12, linearly decreasing
const s59HarmsA = [1,2,3,4,5,6,7,8,9,10,11,12];
const s59AmpsA = i => 1.2 - i * 0.08;
// (b) 6 harmonics 1-6
const s59HarmsB = [1,2,3,4,5,6];
const s59AmpsB = i => 1.2 - i * 0.15;
// (c) harmonics 7-12
const s59HarmsC = [7,8,9,10,11,12];
const s59AmpsC = i => [0.4,0.8,1.2,1.2,0.8,0.4][i];

document.getElementById('s59BtnA55').addEventListener('click', () => playS59(55, s59HarmsA, s59AmpsA, 's59BtnA55'));
document.getElementById('s59BtnB55').addEventListener('click', () => playS59(55, s59HarmsB, s59AmpsB, 's59BtnB55'));
document.getElementById('s59BtnC55').addEventListener('click', () => playS59(55, s59HarmsC, s59AmpsC, 's59BtnC55'));
document.getElementById('s59BtnA440').addEventListener('click', () => playS59(440, s59HarmsA, s59AmpsA, 's59BtnA440'));
document.getElementById('s59BtnB440').addEventListener('click', () => playS59(440, s59HarmsB, s59AmpsB, 's59BtnB440'));
document.getElementById('s59BtnC440').addEventListener('click', () => playS59(440, s59HarmsC, s59AmpsC, 's59BtnC440'));

window.addEventListener('resize', () => { if (current === 58) resizeSlide59(); });

// ─── Slide 60: Odd Harmonics — Fig 5.5 ───
const s60Canvas = document.getElementById('s60Canvas');
const s60Ctx = s60Canvas.getContext('2d');

function resizeSlide60() {
  const r = s60Canvas.parentElement.getBoundingClientRect();
  if (r.width > 0 && r.height > 0) {
    s60Canvas.width = r.width * devicePixelRatio;
    s60Canvas.height = r.height * devicePixelRatio;
    s60Canvas.style.width = r.width + 'px';
    s60Canvas.style.height = r.height + 'px';
  }
  drawSlide60();
}
function drawSlide60() {
  const c = s60Ctx, W = s60Canvas.width, H = s60Canvas.height;
  if (W === 0 || H === 0) return;
  const dpr = devicePixelRatio;
  c.clearRect(0, 0, W, H);
  const pad = { l: W * 0.08, r: W * 0.04, t: H * 0.04, b: H * 0.04 };
  const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;

  // Two rows: all harmonics vs odd only
  const configs = [
    { label: '(a) All harmonics: f₀, 2f₀, 3f₀, 4f₀ …', harms: [1,2,3,4,5,6,7,8,9,10,11,12] },
    { label: '(b) Odd only: f₀, 3f₀, 5f₀, 7f₀ …', harms: [1,3,5,7,9,11] },
  ];
  const halfW = pw * 0.48;
  configs.forEach((cfg, ri) => {
    const cy = pad.t + ph * (ri === 0 ? 0.3 : 0.75);
    const oX = pad.l;
    c.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display',serif`;
    c.fillStyle = '#000'; c.textAlign = 'left';
    c.fillText(cfg.label, oX, cy - ph * 0.15);

    // Spectrum
    const specX = oX;
    const specW = halfW * 0.45;
    const specH = ph * 0.2;
    c.beginPath(); c.moveTo(specX, cy + specH / 2); c.lineTo(specX + specW, cy + specH / 2);
    c.strokeStyle = '#ccc'; c.lineWidth = 1 * dpr; c.stroke();
    cfg.harms.forEach(n => {
      const x = specX + (n / 14) * specW;
      const amp = 1 / Math.sqrt(n);
      const bh = amp * specH * 0.45;
      c.fillStyle = ri === 0 ? '#3498db' : '#e74c3c';
      c.fillRect(x - 2 * dpr, cy + specH / 2 - bh, 4 * dpr, bh);
    });
    c.font = `${Math.round(8 * dpr)}px 'Playfair Display',serif`;
    c.fillStyle = '#888'; c.textAlign = 'center';
    c.fillText('Spectrum', specX + specW / 2, cy + specH / 2 + 14 * dpr);

    // Waveform
    const waveX = oX + halfW * 0.55;
    const waveW = pw - halfW * 0.55;
    c.beginPath(); c.moveTo(waveX, cy); c.lineTo(waveX + waveW, cy);
    c.strokeStyle = '#e0e0e0'; c.lineWidth = 1 * dpr; c.stroke();
    c.beginPath();
    for (let x = 0; x <= waveW; x++) {
      const t = x / waveW * 4;
      let y = 0;
      cfg.harms.forEach(n => {
        const amp = 1 / Math.sqrt(n);
        y += amp * Math.cos(t * n * 2 * Math.PI);
      });
      const py = cy - y / cfg.harms.length * ph * 0.12;
      if (x === 0) c.moveTo(waveX + x, py); else c.lineTo(waveX + x, py);
    }
    c.strokeStyle = ri === 0 ? '#3498db' : '#e74c3c';
    c.lineWidth = 1.5 * dpr; c.stroke();
    c.font = `${Math.round(8 * dpr)}px 'Playfair Display',serif`;
    c.fillStyle = '#888'; c.textAlign = 'center';
    c.fillText('Time waveform', waveX + waveW / 2, cy + specH / 2 + 14 * dpr);
  });
}
function playOddHarm(f0, odd, btnId) {
  ensureAudioCtx();
  const btn = document.getElementById(btnId);
  btn.classList.add('playing');
  const now = audioCtx.currentTime, dur = 2;
  const harms = odd ? [1,3,5,7,9,11] : [1,2,3,4,5,6,7,8,9,10,11,12];
  harms.forEach(n => {
    if (f0 * n > 16000) return;
    const osc = audioCtx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = f0 * n;
    const g = audioCtx.createGain();
    const amp = 0.15 / Math.sqrt(n);
    g.gain.setValueAtTime(amp, now);
    g.gain.setValueAtTime(amp, now + dur - 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(now); osc.stop(now + dur);
  });
  setTimeout(() => btn.classList.remove('playing'), dur * 1000);
}
document.getElementById('s60BtnAll').addEventListener('click', () => playOddHarm(440, false, 's60BtnAll'));
document.getElementById('s60BtnOdd').addEventListener('click', () => playOddHarm(440, true, 's60BtnOdd'));
document.getElementById('s60BtnAllLow').addEventListener('click', () => playOddHarm(55, false, 's60BtnAllLow'));
document.getElementById('s60BtnOddLow').addEventListener('click', () => playOddHarm(55, true, 's60BtnOddLow'));
window.addEventListener('resize', () => { if (current === 59) resizeSlide60(); });

// ─── Slide 61: Chimes & Bells ───
const s61Canvas = document.getElementById('s61Canvas');
const s61Ctx = s61Canvas.getContext('2d');

function resizeSlide61() {
  const r = s61Canvas.parentElement.getBoundingClientRect();
  if (r.width > 0 && r.height > 0) {
    s61Canvas.width = r.width * devicePixelRatio;
    s61Canvas.height = r.height * devicePixelRatio;
    s61Canvas.style.width = r.width + 'px';
    s61Canvas.style.height = r.height + 'px';
  }
  drawSlide61();
}
function drawSlide61() {
  const c = s61Ctx, W = s61Canvas.width, H = s61Canvas.height;
  if (W === 0 || H === 0) return;
  const dpr = devicePixelRatio;
  c.clearRect(0, 0, W, H);
  const pad = { l: W * 0.04, r: W * 0.04, t: H * 0.04, b: H * 0.04 };
  const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
  const halfW = pw * 0.48;
  const gap = pw * 0.04;

  // ── Left: Orchestra Chime ──
  const chimeX = pad.l;
  const chimeData = [
    { name: 'Mode 4', ratio: 2.0, note: '\u2248 2f\u2080', highlight: true },
    { name: 'Mode 5', ratio: 3.0, note: '\u2248 3f\u2080', highlight: true },
    { name: 'Mode 6', ratio: 4.0, note: '\u2248 4f\u2080', highlight: true },
  ];

  c.font = `bold ${Math.round(13 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#000'; c.textAlign = 'center';
  c.fillText('Orchestra Chime', chimeX + halfW / 2, pad.t + 18 * dpr);

  c.font = `${Math.round(9 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#888';
  c.fillText('Metal tube, transverse vibration', chimeX + halfW / 2, pad.t + 34 * dpr);

  // Chime spectrum
  const csX = chimeX + halfW * 0.08;
  const csW = halfW * 0.84;
  const csH = ph * 0.38;
  const csY = pad.t + 50 * dpr;

  // Axis
  c.beginPath(); c.moveTo(csX, csY + csH); c.lineTo(csX + csW, csY + csH);
  c.strokeStyle = '#ccc'; c.lineWidth = 1 * dpr; c.stroke();

  // Draw harmonic grid lines (where integer harmonics would be)
  c.font = `${Math.round(7 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#ddd'; c.textAlign = 'center';
  for (let n = 1; n <= 5; n++) {
    const x = csX + (n / 5.5) * csW;
    c.beginPath(); c.moveTo(x, csY); c.lineTo(x, csY + csH);
    c.strokeStyle = '#f0f0f0'; c.lineWidth = 1 * dpr; c.stroke();
    c.fillStyle = '#ccc';
    c.fillText(n + 'f\u2080', x, csY + csH + 12 * dpr);
  }

  // Missing fundamental marker
  const mfX = csX + (1 / 5.5) * csW;
  c.beginPath(); c.moveTo(mfX, csY + csH * 0.3); c.lineTo(mfX, csY + csH);
  c.strokeStyle = '#e74c3c'; c.lineWidth = 1.5 * dpr; c.setLineDash([4 * dpr, 4 * dpr]); c.stroke();
  c.setLineDash([]);
  c.font = `bold ${Math.round(8 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#e74c3c'; c.textAlign = 'center';
  c.fillText('f\u2080 (missing!)', mfX, csY + csH * 0.22);

  // Chime partial bars
  const chimeFp = 440;
  const chimeColors = ['#3498db', '#2ecc71', '#9b59b6'];
  chimeData.forEach((d, i) => {
    const x = csX + (d.ratio / 5.5) * csW;
    const bh = csH * (0.7 - i * 0.1);
    c.fillStyle = chimeColors[i];
    c.fillRect(x - 3 * dpr, csY + csH - bh, 6 * dpr, bh);
    c.font = `bold ${Math.round(8 * dpr)}px 'Playfair Display',serif`;
    c.fillStyle = chimeColors[i]; c.textAlign = 'center';
    c.fillText(d.name, x, csY + csH - bh - 6 * dpr);
    // Hz below axis
    c.font = `${Math.round(7 * dpr)}px 'Playfair Display',serif`;
    c.fillStyle = '#aaa';
    c.fillText(Math.round(chimeFp * d.ratio) + ' Hz', x, csY + csH + 12 * dpr);
  });

  c.font = `${Math.round(8 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#888'; c.textAlign = 'center';
  c.fillText('Frequency', csX + csW / 2, csY + csH + 24 * dpr);

  // Chime explanation
  const ceY = csY + csH + 42 * dpr;
  c.font = `bold ${Math.round(9.5 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#000'; c.textAlign = 'left';
  c.fillText('How it works:', chimeX + halfW * 0.08, ceY);
  c.font = `${Math.round(9 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#555';
  const chimeLines = [
    'Tube flexural modes are inharmonic,',
    'but modes 4, 5, 6 \u2248 harmonics 2, 3, 4',
    'of a "missing" fundamental f\u2080.',
    '',
    'The ear finds the best-fit harmonic',
    'series \u2192 perceives virtual pitch at f\u2080.',
  ];
  chimeLines.forEach((line, i) => {
    if (line.includes('\u2192')) c.fillStyle = '#c0392b';
    else c.fillStyle = '#555';
    c.fillText(line, chimeX + halfW * 0.08, ceY + (i + 1) * 14 * dpr);
  });

  // ── Divider ──
  const divX = chimeX + halfW + gap / 2;
  c.beginPath(); c.moveTo(divX, pad.t + 10 * dpr); c.lineTo(divX, pad.t + ph - 10 * dpr);
  c.strokeStyle = '#e0e0e0'; c.lineWidth = 1 * dpr; c.stroke();

  // ── Right: Hemony Bell ──
  const bellX = chimeX + halfW + gap;
  const bellData = [
    { name: 'Hum', ratio: 0.5, note: '1 oct down' },
    { name: 'Prime', ratio: 1.0, note: 'fp' },
    { name: 'Third', ratio: 1.2, note: 'min 3rd' },
    { name: 'Fifth', ratio: 1.5, note: '5th' },
    { name: 'Octave', ratio: 2.0, note: 'octave' },
    { name: 'Upper 3rd', ratio: 2.5, note: '' },
    { name: 'Upper 5th', ratio: 3.0, note: '' },
  ];

  c.font = `bold ${Math.round(13 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#000'; c.textAlign = 'center';
  c.fillText('Hemony Bell (1644)', bellX + halfW / 2, pad.t + 18 * dpr);

  c.font = `${Math.round(9 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#888';
  c.fillText('Prime, Third, Fifth = minor triad', bellX + halfW / 2, pad.t + 34 * dpr);

  // Bell spectrum
  const bsX = bellX + halfW * 0.08;
  const bsW = halfW * 0.84;
  const bsH = ph * 0.38;
  const bsY = pad.t + 50 * dpr;

  // Axis
  c.beginPath(); c.moveTo(bsX, bsY + bsH); c.lineTo(bsX + bsW, bsY + bsH);
  c.strokeStyle = '#ccc'; c.lineWidth = 1 * dpr; c.stroke();

  // Bell partial bars + labels
  const bellFp = 440;
  const bellColors = ['#9b59b6','#c0392b','#e67e22','#2ecc71','#3498db','#1abc9c','#e74c3c'];
  bellData.forEach((d, i) => {
    const x = bsX + (d.ratio / 3.5) * bsW;
    const amp = [0.15, 0.25, 0.18, 0.15, 0.12, 0.08, 0.06][i];
    const bh = (amp / 0.25) * bsH * 0.75;
    c.fillStyle = bellColors[i];
    c.fillRect(x - 3 * dpr, bsY + bsH - bh, 6 * dpr, bh);
    // Label above bar
    c.font = `bold ${Math.round(7.5 * dpr)}px 'Playfair Display',serif`;
    c.fillStyle = bellColors[i]; c.textAlign = 'center';
    c.fillText(d.name, x, bsY + bsH - bh - 6 * dpr);
    // Hz below axis
    c.font = `${Math.round(7 * dpr)}px 'Playfair Display',serif`;
    c.fillStyle = '#aaa';
    c.fillText(Math.round(bellFp * d.ratio) + ' Hz', x, bsY + bsH + 12 * dpr);
  });

  c.font = `${Math.round(8 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#888'; c.textAlign = 'center';
  c.fillText('Frequency (fp = 440 Hz)', bsX + bsW / 2, bsY + bsH + 24 * dpr);

  // Bell table (compact)
  const btY = bsY + bsH + 42 * dpr;
  const btRowH = 13 * dpr;
  c.font = `bold ${Math.round(9 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#888'; c.textAlign = 'center';
  c.fillText('Partial', bellX + halfW * 0.18, btY);
  c.fillText('Ratio', bellX + halfW * 0.48, btY);
  c.fillText('Interval', bellX + halfW * 0.78, btY);

  bellData.forEach((d, i) => {
    const y = btY + (i + 1) * btRowH;
    c.font = `bold ${Math.round(8.5 * dpr)}px 'Playfair Display',serif`;
    c.fillStyle = d.name === 'Prime' ? '#c0392b' : '#000';
    c.textAlign = 'center';
    c.fillText(d.name, bellX + halfW * 0.18, y);
    c.fillText(d.ratio + ' fp', bellX + halfW * 0.48, y);
    c.fillStyle = '#888';
    c.font = `${Math.round(8 * dpr)}px 'Playfair Display',serif`;
    c.fillText(d.note, bellX + halfW * 0.78, y);
  });
}
function playBell(type, btnId) {
  ensureAudioCtx();
  const btn = document.getElementById(btnId);
  btn.classList.add('playing');
  const now = audioCtx.currentTime, dur = 3;
  const fp = 440;
  let partials;
  if (type === 'chime') {
    partials = [2, 3, 4].map(n => ({ f: fp * n, a: 0.2 }));
  } else {
    partials = [
      { f: fp * 0.5, a: 0.15 }, { f: fp, a: 0.25 }, { f: fp * 1.2, a: 0.18 },
      { f: fp * 1.5, a: 0.15 }, { f: fp * 2, a: 0.12 }, { f: fp * 2.5, a: 0.08 }, { f: fp * 3, a: 0.06 }
    ];
  }
  partials.forEach(p => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = p.f;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(p.a, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(now); osc.stop(now + dur);
  });
  setTimeout(() => btn.classList.remove('playing'), dur * 1000);
}
document.getElementById('s61BtnChime').addEventListener('click', () => playBell('chime', 's61BtnChime'));
document.getElementById('s61BtnBell').addEventListener('click', () => playBell('bell', 's61BtnBell'));
window.addEventListener('resize', () => { if (current === 60) resizeSlide61(); });

// ─── Slide 62: Shepard Tone — Fig 5.6 ───
const s62Canvas = document.getElementById('s62Canvas');
const s62Ctx = s62Canvas.getContext('2d');
let shepardOscs = [];
let shepardInterval = null;
let shepardSemitone = 0;
let shepardAnalyser = null;
let shepardTimeDomain = null;
let shepardAnimId = null;
let shepardPlaying = false;

function resizeSlide62() {
  const r = s62Canvas.parentElement.getBoundingClientRect();
  if (r.width > 0 && r.height > 0) {
    s62Canvas.width = r.width * devicePixelRatio;
    s62Canvas.height = r.height * devicePixelRatio;
    s62Canvas.style.width = r.width + 'px';
    s62Canvas.style.height = r.height + 'px';
  }
  drawSlide62();
}
function s62GetAnalyser() {
  ensureAudioCtx();
  if (!shepardAnalyser) {
    shepardAnalyser = audioCtx.createAnalyser();
    shepardAnalyser.fftSize = 2048;
    shepardAnalyser.smoothingTimeConstant = 0.85;
    shepardAnalyser.connect(audioCtx.destination);
    shepardTimeDomain = new Uint8Array(shepardAnalyser.fftSize);
  }
  return shepardAnalyser;
}
function drawSlide62() {
  const c = s62Ctx, W = s62Canvas.width, H = s62Canvas.height;
  if (W === 0 || H === 0) return;
  const dpr = devicePixelRatio;
  c.clearRect(0, 0, W, H);
  const pad = { l: W * 0.1, r: W * 0.06, t: H * 0.06, b: H * 0.04 };
  const pw = W - pad.l - pad.r, fullH = H - pad.t - pad.b;

  // Split: top 55% spectrum, bottom 40% waveform, 5% gap
  const specH = fullH * 0.52;
  const waveGap = fullH * 0.06;
  const waveH = fullH * 0.38;
  const waveY = pad.t + specH + waveGap;

  // ── Top: Spectrum ──
  const ph = specH;

  // Bell-shaped envelope
  c.beginPath();
  for (let x = 0; x <= pw; x++) {
    const logF = (x / pw) * 4 + 1;
    const center = 2.5, sigma = 0.8;
    const env = Math.exp(-0.5 * Math.pow((logF - center) / sigma, 2));
    const y = pad.t + ph - env * ph * 0.85;
    if (x === 0) c.moveTo(pad.l + x, y); else c.lineTo(pad.l + x, y);
  }
  c.strokeStyle = '#c0392b'; c.lineWidth = 2 * dpr; c.stroke();

  // Hearing threshold
  c.beginPath();
  for (let x = 0; x <= pw; x++) {
    const logF = (x / pw) * 4 + 1;
    const thr = 0.1 + 0.05 * Math.pow(logF - 2.5, 2);
    const y = pad.t + ph - thr * ph * 0.85;
    if (x === 0) c.moveTo(pad.l + x, y); else c.lineTo(pad.l + x, y);
  }
  c.strokeStyle = '#aaa'; c.lineWidth = 1 * dpr; c.setLineDash([6 * dpr, 4 * dpr]); c.stroke(); c.setLineDash([]);

  // Octave partials as vertical lines
  const baseF = 27.5 * Math.pow(2, shepardSemitone / 12);
  for (let oct = 0; oct < 9; oct++) {
    const f = baseF * Math.pow(2, oct);
    if (f < 20 || f > 16000) continue;
    const logF = Math.log10(f);
    const x = pad.l + ((logF - 1) / 4) * pw;
    const center = 2.5, sigma = 0.8;
    const env = Math.exp(-0.5 * Math.pow((logF - center) / sigma, 2));
    c.beginPath(); c.moveTo(x, pad.t + ph); c.lineTo(x, pad.t + ph - env * ph * 0.85);
    c.strokeStyle = '#3498db'; c.lineWidth = 2 * dpr; c.stroke();
  }

  // Spectrum axes
  c.font = `bold ${Math.round(9 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#888'; c.textAlign = 'center';
  [20, 100, 300, 1000, 3000, 10000].forEach(f => {
    const logF = Math.log10(f);
    const x = pad.l + ((logF - 1) / 4) * pw;
    c.fillText(f >= 1000 ? (f / 1000) + 'k' : f + '', x, pad.t + ph + 14 * dpr);
  });

  c.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#c0392b'; c.textAlign = 'right';
  c.fillText('Spectral envelope', pad.l + pw, pad.t + 14 * dpr);
  c.fillStyle = '#aaa';
  c.fillText('Hearing threshold', pad.l + pw, pad.t + 30 * dpr);

  // ── Bottom: Waveform ──
  // Box
  c.strokeStyle = '#e0e0e0'; c.lineWidth = 1 * dpr;
  c.strokeRect(pad.l, waveY, pw, waveH);

  // Zero line
  c.beginPath();
  c.moveTo(pad.l, waveY + waveH / 2);
  c.lineTo(pad.l + pw, waveY + waveH / 2);
  c.strokeStyle = '#f0f0f0'; c.lineWidth = 1 * dpr; c.stroke();

  c.font = `bold ${Math.round(9 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#888'; c.textAlign = 'left';
  c.fillText('Time-domain waveform (live)', pad.l + 8 * dpr, waveY + 14 * dpr);

  if (shepardPlaying && shepardAnalyser && shepardTimeDomain) {
    shepardAnalyser.getByteTimeDomainData(shepardTimeDomain);
    c.beginPath();
    const sliceW = pw / shepardTimeDomain.length;
    for (let i = 0; i < shepardTimeDomain.length; i++) {
      const v = shepardTimeDomain[i] / 128.0;
      const y = waveY + (1 - (v - 1)) * waveH / 2;
      if (i === 0) c.moveTo(pad.l, y); else c.lineTo(pad.l + i * sliceW, y);
    }
    c.strokeStyle = '#3498db'; c.lineWidth = 1.5 * dpr; c.stroke();
  } else {
    // Static: draw flat line
    c.beginPath();
    c.moveTo(pad.l, waveY + waveH / 2);
    c.lineTo(pad.l + pw, waveY + waveH / 2);
    c.strokeStyle = '#ccc'; c.lineWidth = 1 * dpr; c.stroke();
    c.font = `${Math.round(10 * dpr)}px 'Playfair Display',serif`;
    c.fillStyle = '#ccc'; c.textAlign = 'center';
    c.fillText('Press play to see waveform', pad.l + pw / 2, waveY + waveH / 2 - 10 * dpr);
  }
}
function drawS62Anim() {
  if (!shepardPlaying || current !== 61) { shepardAnimId = null; return; }
  shepardAnimId = requestAnimationFrame(drawS62Anim);
  drawSlide62();
}

function s62PlayTone(dur, dest) {
  const baseF = 27.5 * Math.pow(2, shepardSemitone / 12);
  const now = audioCtx.currentTime;
  for (let oct = 0; oct < 9; oct++) {
    const f = baseF * Math.pow(2, oct);
    if (f < 20 || f > 16000) continue;
    const logF = Math.log10(f);
    const center = 2.5, sigma = 0.8;
    const env = Math.exp(-0.5 * Math.pow((logF - center) / sigma, 2));
    if (env < 0.01) continue;
    const osc = audioCtx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = f;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.08 * env, now);
    g.gain.setValueAtTime(0.08 * env, now + dur * 0.8);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g).connect(dest);
    osc.start(now); osc.stop(now + dur);
  }
}
function s62StartAnim() {
  shepardPlaying = true;
  if (!shepardAnimId) drawS62Anim();
}
function playShepard(direction) {
  stopShepard();
  ensureAudioCtx();
  const analyser = s62GetAnalyser();
  const btnUp = document.getElementById('s62BtnUp');
  const btnDown = document.getElementById('s62BtnDown');
  if (direction > 0) btnUp.classList.add('active'); else btnDown.classList.add('active');

  function playStep() {
    s62PlayTone(0.3, analyser);
    shepardSemitone = (shepardSemitone + direction + 12) % 12;
    drawSlide62();
  }
  s62StartAnim();
  playStep();
  shepardInterval = setInterval(playStep, 350);
}
function stopShepard() {
  if (shepardInterval) { clearInterval(shepardInterval); shepardInterval = null; }
  shepardPlaying = false;
  document.getElementById('s62BtnUp').classList.remove('active');
  document.getElementById('s62BtnDown').classList.remove('active');
  document.getElementById('s62BtnTritone').classList.remove('active');
  drawSlide62();
}
function playTritone() {
  stopShepard();
  ensureAudioCtx();
  const analyser = s62GetAnalyser();
  const btn = document.getElementById('s62BtnTritone');
  btn.classList.add('active');
  s62StartAnim();

  shepardSemitone = 0;
  drawSlide62();
  s62PlayTone(0.6, analyser);
  setTimeout(() => {
    shepardSemitone = 6;
    drawSlide62();
    s62PlayTone(0.6, analyser);
    setTimeout(() => {
      btn.classList.remove('active');
      shepardPlaying = false;
      shepardSemitone = 0;
      drawSlide62();
    }, 700);
  }, 700);
}
document.getElementById('s62BtnUp').addEventListener('click', () => playShepard(1));
document.getElementById('s62BtnDown').addEventListener('click', () => playShepard(-1));
document.getElementById('s62BtnTritone').addEventListener('click', playTritone);
document.getElementById('s62BtnStop').addEventListener('click', stopShepard);
window.addEventListener('resize', () => { if (current === 61) resizeSlide62(); });

// ─── Slide 63: Risset Paradox ───
const s63Canvas = document.getElementById('s63Canvas');
const s63Ctx = s63Canvas.getContext('2d');
let rissetPhase = 0;

function resizeSlide63() {
  const r = s63Canvas.parentElement.getBoundingClientRect();
  if (r.width > 0 && r.height > 0) {
    s63Canvas.width = r.width * devicePixelRatio;
    s63Canvas.height = r.height * devicePixelRatio;
    s63Canvas.style.width = r.width + 'px';
    s63Canvas.style.height = r.height + 'px';
  }
  drawSlide63();
}
function drawSlide63() {
  const c = s63Ctx, W = s63Canvas.width, H = s63Canvas.height;
  if (W === 0 || H === 0) return;
  const dpr = devicePixelRatio;
  c.clearRect(0, 0, W, H);
  const pad = { l: W * 0.1, r: W * 0.06, t: H * 0.06, b: H * 0.06 };
  const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;

  const nPartials = 9;
  const ratio = 2.1;
  const baseF = 27.5;
  const center = 2.5, sigma = 0.8;
  const phase = typeof rissetPhase === 'number' ? rissetPhase : 0;
  const isPlaying = document.getElementById('s63BtnA').classList.contains('active') || document.getElementById('s63BtnB').classList.contains('active');

  // ── Top: Before/After comparison (static diagram) ──
  const topH = ph * 0.42;
  const specH = topH * 0.35;

  // Before
  c.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#000'; c.textAlign = 'left';
  c.fillText('Before: partials spaced by ratio 2.1 (> octave)', pad.l, pad.t + 14 * dpr);

  const specY1 = pad.t + 24 * dpr;
  c.beginPath(); c.moveTo(pad.l, specY1 + specH); c.lineTo(pad.l + pw, specY1 + specH);
  c.strokeStyle = '#e0e0e0'; c.lineWidth = 1 * dpr; c.stroke();

  // Gaussian envelope curve
  c.beginPath();
  for (let x = 0; x <= pw; x++) {
    const logF = (x / pw) * 4 + 1;
    const env = Math.exp(-0.5 * Math.pow((logF - center) / sigma, 2));
    const y = specY1 + specH - env * specH * 0.95;
    if (x === 0) c.moveTo(pad.l + x, y); else c.lineTo(pad.l + x, y);
  }
  c.strokeStyle = 'rgba(52,152,219,0.3)'; c.lineWidth = 1.5 * dpr; c.stroke();

  for (let i = 0; i < nPartials; i++) {
    const f = baseF * Math.pow(ratio, i);
    const logF = Math.log10(f);
    const x = pad.l + ((logF - 1) / 4) * pw;
    const env = Math.exp(-0.5 * Math.pow((logF - center) / sigma, 2));
    const bh = env * specH * 0.9;
    if (bh < 1) continue;
    c.fillStyle = '#3498db';
    c.fillRect(x - 2.5 * dpr, specY1 + specH - bh, 5 * dpr, bh);
    if (env > 0.08) {
      c.font = `${Math.round(6.5 * dpr)}px 'Playfair Display',serif`;
      c.fillStyle = '#888'; c.textAlign = 'center';
      c.fillText(Math.round(f) + '', x, specY1 + specH + 10 * dpr);
    }
  }

  // After doubling
  c.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#000'; c.textAlign = 'left';
  const afterLabelY = specY1 + specH + 22 * dpr;
  c.fillText('After ×2: each partial lands slightly below the next original', pad.l, afterLabelY);

  const specY2 = afterLabelY + 10 * dpr;
  c.beginPath(); c.moveTo(pad.l, specY2 + specH); c.lineTo(pad.l + pw, specY2 + specH);
  c.strokeStyle = '#e0e0e0'; c.lineWidth = 1 * dpr; c.stroke();

  // Envelope curve for after
  c.beginPath();
  for (let x = 0; x <= pw; x++) {
    const logF = (x / pw) * 4 + 1;
    const env = Math.exp(-0.5 * Math.pow((logF - center) / sigma, 2));
    const y = specY2 + specH - env * specH * 0.95;
    if (x === 0) c.moveTo(pad.l + x, y); else c.lineTo(pad.l + x, y);
  }
  c.strokeStyle = 'rgba(231,76,60,0.3)'; c.lineWidth = 1.5 * dpr; c.stroke();

  // Ghost: original positions in grey
  for (let i = 0; i < nPartials; i++) {
    const f = baseF * Math.pow(ratio, i);
    const logF = Math.log10(f);
    const x = pad.l + ((logF - 1) / 4) * pw;
    const env = Math.exp(-0.5 * Math.pow((logF - center) / sigma, 2));
    const bh = env * specH * 0.9;
    if (bh < 1) continue;
    c.fillStyle = 'rgba(52,152,219,0.15)';
    c.fillRect(x - 2.5 * dpr, specY2 + specH - bh, 5 * dpr, bh);
  }
  // Doubled positions in red
  for (let i = 0; i < nPartials; i++) {
    const f = baseF * Math.pow(ratio, i) * 2;
    const logF = Math.log10(f);
    const x = pad.l + ((logF - 1) / 4) * pw;
    const env = Math.exp(-0.5 * Math.pow((logF - center) / sigma, 2));
    const bh = env * specH * 0.9;
    if (bh < 1) continue;
    c.fillStyle = '#e74c3c';
    c.fillRect(x - 2.5 * dpr, specY2 + specH - bh, 5 * dpr, bh);
    if (env > 0.08) {
      c.font = `${Math.round(6.5 * dpr)}px 'Playfair Display',serif`;
      c.fillStyle = '#c0392b'; c.textAlign = 'center';
      c.fillText(Math.round(f) + '', x, specY2 + specH + 10 * dpr);
    }
    // Arrow from doubled to original neighbor
    const fOrig = baseF * Math.pow(ratio, i + 1);
    const logOrig = Math.log10(fOrig);
    const xOrig = pad.l + ((logOrig - 1) / 4) * pw;
    if (env > 0.08 && xOrig < pad.l + pw) {
      c.beginPath();
      c.moveTo(xOrig, specY2 + specH * 0.15);
      c.lineTo(x, specY2 + specH * 0.15);
      c.strokeStyle = '#c0392b'; c.lineWidth = 1 * dpr;
      c.stroke();
      // Arrowhead
      c.beginPath();
      c.moveTo(x, specY2 + specH * 0.15);
      c.lineTo(x + 6 * dpr, specY2 + specH * 0.15 - 3 * dpr);
      c.lineTo(x + 6 * dpr, specY2 + specH * 0.15 + 3 * dpr);
      c.closePath(); c.fillStyle = '#c0392b'; c.fill();
    }
  }

  c.font = `bold ${Math.round(10 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#c0392b'; c.textAlign = 'center';
  c.fillText('×2 lands below next original (2.0 < 2.1) → pitch DOWN', pad.l + pw / 2, specY2 + specH + 14 * dpr);

  // Frequency axis for both
  c.font = `${Math.round(8 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#aaa'; c.textAlign = 'center';
  [30, 100, 300, 1000, 3000, 10000].forEach(f => {
    const logF = Math.log10(f);
    const x = pad.l + ((logF - 1) / 4) * pw;
    if (x > pad.l && x < pad.l + pw) {
      c.fillText(f >= 1000 ? (f / 1000) + 'k' : f + '', x, specY2 + specH + 28 * dpr);
    }
  });

  // ── Bottom: Live sweeping spectrum ──
  const liveY = pad.t + topH + ph * 0.12;
  const liveH = ph * 0.4;

  const currentMult = rissetShowB ? 2 : 1;
  const currentLabel = rissetShowB ? 'Tone B (×2) — does it sound lower?' : 'Tone A (original)';
  const currentColor = rissetShowB ? '#e74c3c' : '#3498db';

  c.font = `bold ${Math.round(11 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = isPlaying ? currentColor : '#888'; c.textAlign = 'left';
  c.fillText(isPlaying ? currentLabel : 'Press a button to compare A vs B', pad.l, liveY - 6 * dpr);

  // Box
  c.strokeStyle = '#e0e0e0'; c.lineWidth = 1 * dpr;
  c.strokeRect(pad.l, liveY, pw, liveH);

  // Envelope curve background
  c.beginPath();
  for (let x = 0; x <= pw; x++) {
    const logF = (x / pw) * 4 + 1;
    const env = Math.exp(-0.5 * Math.pow((logF - center) / sigma, 2));
    const y = liveY + liveH - env * liveH * 0.9;
    if (x === 0) c.moveTo(pad.l + x, y); else c.lineTo(pad.l + x, y);
  }
  c.strokeStyle = 'rgba(0,0,0,0.08)'; c.lineWidth = 1.5 * dpr; c.stroke();

  // Show current tone partials
  for (let i = 0; i < nPartials; i++) {
    const f = baseF * Math.pow(ratio, i) * currentMult;
    if (f < 30 || f > 16000) continue;
    const logF = Math.log10(f);
    const x = pad.l + ((logF - 1) / 4) * pw;
    const env = Math.exp(-0.5 * Math.pow((logF - center) / sigma, 2));
    const bh = env * liveH * 0.85;
    if (bh < 1 || x < pad.l || x > pad.l + pw) continue;
    c.fillStyle = isPlaying ? currentColor : '#ccc';
    c.fillRect(x - 3 * dpr, liveY + liveH - bh, 6 * dpr, bh);
  }

  // If showing B, also show A as ghost for comparison
  if (rissetShowB) {
    for (let i = 0; i < nPartials; i++) {
      const f = baseF * Math.pow(ratio, i);
      const logF = Math.log10(f);
      const x = pad.l + ((logF - 1) / 4) * pw;
      const env = Math.exp(-0.5 * Math.pow((logF - center) / sigma, 2));
      const bh = env * liveH * 0.85;
      if (bh < 1 || x < pad.l || x > pad.l + pw) continue;
      c.fillStyle = 'rgba(52,152,219,0.2)';
      c.fillRect(x - 3 * dpr, liveY + liveH - bh, 6 * dpr, bh);
    }
  }

  // Frequency axis
  c.font = `${Math.round(8 * dpr)}px 'Playfair Display',serif`;
  c.fillStyle = '#aaa'; c.textAlign = 'center';
  [30, 100, 300, 1000, 3000, 10000].forEach(f => {
    const logF = Math.log10(f);
    const x = pad.l + ((logF - 1) / 4) * pw;
    if (x > pad.l && x < pad.l + pw) {
      c.fillText(f >= 1000 ? (f / 1000) + 'k' : f + '', x, liveY + liveH + 12 * dpr);
    }
  });
}

// Risset paradox: A/B comparison
// Tone A: partials at ratio 2.1, base=27.5 Hz
// Tone B: all frequencies doubled (×2)
// Since 2.0 < 2.1, doubled partials land below next original → pitch sounds LOWER
let rissetInterval = null;
const RISSET_RATIO = 2.1;
const RISSET_N = 9;
const RISSET_BASE = 27.5;
const RISSET_CENTER = 2.5;
const RISSET_SIGMA = 0.8;
let rissetShowB = false;

function rissetEnv(logF) {
  return Math.exp(-0.5 * Math.pow((logF - RISSET_CENTER) / RISSET_SIGMA, 2));
}

function playRissetTone(multiplier, dur, btnId) {
  ensureAudioCtx();
  const btn = document.getElementById(btnId);
  btn.classList.add('active');
  const now = audioCtx.currentTime;

  for (let i = 0; i < RISSET_N; i++) {
    const f = RISSET_BASE * Math.pow(RISSET_RATIO, i) * multiplier;
    if (f < 30 || f > 16000) continue;
    const logF = Math.log10(f);
    let env = rissetEnv(logF);
    if (env < 0.01) continue;
    if (f < 80) env *= (f - 30) / 50;

    const osc = audioCtx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = f;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.06 * env, now);
    g.gain.setValueAtTime(0.06 * env, now + dur - 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(now); osc.stop(now + dur);
  }
  setTimeout(() => btn.classList.remove('active'), dur * 1000);
}

function playRissetA() {
  rissetShowB = false;
  rissetPhase = 0;
  drawSlide63();
  playRissetTone(1, 1.5, 's63BtnA');
}

function playRissetB() {
  rissetShowB = true;
  rissetPhase = 0;
  drawSlide63();
  playRissetTone(2, 1.5, 's63BtnB');
}

function playRissetAB() {
  rissetShowB = false;
  rissetPhase = 0;
  drawSlide63();
  const btnAB = document.getElementById('s63BtnAB');
  const btnA = document.getElementById('s63BtnA');
  const btnB = document.getElementById('s63BtnB');
  btnAB.classList.add('active');

  // Play A
  btnA.classList.add('active');
  playRissetTone(1, 1.2, 's63BtnA');

  // After A finishes, play B
  setTimeout(() => {
    btnA.classList.remove('active');
    rissetShowB = true;
    drawSlide63();
    btnB.classList.add('active');
    playRissetTone(2, 1.2, 's63BtnB');
    setTimeout(() => {
      btnB.classList.remove('active');
      btnAB.classList.remove('active');
    }, 1200);
  }, 1400);
}

document.getElementById('s63BtnA').addEventListener('click', playRissetA);
document.getElementById('s63BtnB').addEventListener('click', playRissetB);
document.getElementById('s63BtnAB').addEventListener('click', playRissetAB);
window.addEventListener('resize', () => { if (current === 62) resizeSlide63(); });

