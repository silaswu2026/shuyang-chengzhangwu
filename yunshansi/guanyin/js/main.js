import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const stage = document.getElementById("stage");
const loaderEl = document.getElementById("loader");
const hintEl = document.getElementById("hint");
const meritEl = document.getElementById("merit");
const foyinBtn = document.getElementById("foyin-toggle");

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070605);
scene.fog = new THREE.FogExp2(0x070605, 0.038);

const camera = new THREE.PerspectiveCamera(
  34,
  window.innerWidth / window.innerHeight,
  0.05,
  40
);
camera.position.set(2.05, 1.18, 2.25);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.15;
controls.enablePan = false;
controls.minDistance = 1.45;
controls.maxDistance = 5.4;
controls.minPolarAngle = 0.38;
controls.maxPolarAngle = Math.PI * 0.62;
controls.target.set(0, 0.86, 0);

const texLoader = new THREE.TextureLoader();
const _tmp = new THREE.Vector3();
const statueCenter = new THREE.Vector3(0, 0.9, 0);

function makeMandorlaTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1536;
  const g = c.getContext("2d");
  g.clearRect(0, 0, c.width, c.height);
  const cx = 512;
  const cy = 700;
  // soft oval body of light
  const layers = [
    [480, 700, "rgba(255, 236, 180, 0.18)"],
    [340, 520, "rgba(255, 214, 120, 0.28)"],
    [220, 340, "rgba(255, 196, 90, 0.38)"],
    [110, 170, "rgba(255, 240, 200, 0.55)"],
  ];
  for (const [rx, ry, col] of layers) {
    const grd = g.createRadialGradient(cx, cy, 8, cx, cy, rx);
    grd.addColorStop(0, col);
    grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd;
    g.beginPath();
    g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    g.fill();
  }
  // rays
  g.save();
  g.translate(cx, cy);
  g.globalCompositeOperation = "lighter";
  for (let i = 0; i < 28; i++) {
    const ang = (i / 28) * Math.PI * 2 + 0.07;
    const len = 420 + (i % 3) * 90;
    g.rotate(ang);
    const rg = g.createLinearGradient(0, 0, 0, -len);
    rg.addColorStop(0, "rgba(255, 230, 160, 0.28)");
    rg.addColorStop(0.5, "rgba(255, 200, 100, 0.08)");
    rg.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = rg;
    g.beginPath();
    g.moveTo(-3.5, 0);
    g.lineTo(3.5, 0);
    g.lineTo(14, -len);
    g.lineTo(-14, -len);
    g.closePath();
    g.fill();
    g.rotate(-ang);
  }
  // sparkles baked into the disc
  for (let i = 0; i < 90; i++) {
    const a = Math.random() * Math.PI * 2;
    const rr = Math.pow(Math.random(), 0.6);
    const x = cx + Math.cos(a) * rr * 300;
    const y = cy + Math.sin(a) * rr * 460;
    const s = 0.8 + Math.random() * 2.4;
    const grd = g.createRadialGradient(x, y, 0, x, y, s * 4);
    grd.addColorStop(0, "rgba(255,255,240,0.9)");
    grd.addColorStop(0.35, "rgba(255,220,130,0.45)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd;
    g.beginPath();
    g.arc(x, y, s * 4, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeHeadHaloTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d");
  const cx = 256, cy = 256;
  const grd = g.createRadialGradient(cx, cy, 20, cx, cy, 240);
  grd.addColorStop(0, "rgba(255, 248, 220, 0.85)");
  grd.addColorStop(0.22, "rgba(255, 220, 120, 0.45)");
  grd.addColorStop(0.55, "rgba(230, 170, 60, 0.16)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.beginPath();
  g.arc(cx, cy, 240, 0, Math.PI * 2);
  g.fill();
  // ring
  g.strokeStyle = "rgba(255, 230, 160, 0.45)";
  g.lineWidth = 6;
  g.beginPath();
  g.arc(cx, cy, 118, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = "rgba(255, 250, 220, 0.25)";
  g.lineWidth = 2;
  g.beginPath();
  g.arc(cx, cy, 150, 0, Math.PI * 2);
  g.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeSacredLight() {
  const group = new THREE.Group();

  const mandorla = new THREE.Mesh(
    new THREE.PlaneGeometry(2.55, 3.85),
    new THREE.MeshBasicMaterial({
      map: makeMandorlaTexture(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.92,
      fog: false,
    })
  );
  mandorla.position.set(0, 0.92, 0);
  mandorla.renderOrder = 0;
  group.add(mandorla);

  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, 1.15),
    new THREE.MeshBasicMaterial({
      map: makeHeadHaloTexture(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.95,
      fog: false,
    })
  );
  halo.position.set(0, 1.48, 0);
  halo.renderOrder = 0;
  group.add(halo);

  const n = 320;
  const pos = new Float32Array(n * 3);
  const phase = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const y = (Math.random() * 1.85) + 0.15;
    const rx = 0.35 + Math.random() * 0.85;
    const rz = 0.35 + Math.random() * 0.85;
    pos[i * 3] = Math.cos(a) * rx;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(a) * rz;
    phase[i] = Math.random() * Math.PI * 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const spark = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: 0xfff1c2,
      size: 0.028,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
  );
  spark.renderOrder = 2;
  group.add(spark);

  scene.add(group);
  return { group, mandorla, halo, spark, sparkPhase: phase, sparkBase: pos.slice() };
}

function makeFloor() {
  const geo = new THREE.CircleGeometry(3.2, 72);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x120e0a,
    transparent: true,
    opacity: 0.92,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -0.002;
  scene.add(mesh);

  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(1.35, 64),
    new THREE.MeshBasicMaterial({
      color: 0xd4a44a,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.001;
  scene.add(glow);
  return glow;
}

function makeParticles() {
  const n = 220;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 4.6;
    pos[i * 3 + 1] = Math.random() * 2.8;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 4.6;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xf0d9a0,
    size: 0.016,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return pts;
}

/* ---------------- audio ---------------- */
const audio = {
  ready: false,
  wanted: true,
  foyin: null,
  buffers: {},
  ctx: null,
};

function loadAudioEl(src, loop = false, volume = 0.42) {
  const el = new Audio(src);
  el.loop = loop;
  el.preload = "auto";
  el.volume = volume;
  el.setAttribute("playsinline", "");
  return el;
}

function setupAudio() {
  audio.foyin = loadAudioEl("./assets/audio/foyin-loop.ogg", true, 0.38);
  audio.buffers.muyu = "./assets/audio/muyu.ogg";
  audio.buffers.qing = "./assets/audio/qing.ogg";
  audio.buffers.bead = "./assets/audio/bead.ogg";
}

function playOneShot(url, volume = 0.7) {
  const el = new Audio(url);
  el.volume = volume;
  el.setAttribute("playsinline", "");
  const p = el.play();
  if (p && p.catch) p.catch(() => {});
}

async function startFoyin() {
  if (!audio.wanted || !audio.foyin) return;
  try {
    audio.foyin.volume = 0;
    await audio.foyin.play();
    audio.ready = true;
    // gentle fade in
    const start = performance.now();
    const fade = () => {
      const k = Math.min(1, (performance.now() - start) / 1600);
      audio.foyin.volume = 0.38 * k;
      if (k < 1 && audio.wanted) requestAnimationFrame(fade);
    };
    requestAnimationFrame(fade);
    foyinBtn.classList.add("is-on");
    foyinBtn.setAttribute("aria-pressed", "true");
  } catch (_) {
    audio.ready = false;
  }
}

function stopFoyin() {
  if (!audio.foyin) return;
  audio.foyin.pause();
  audio.foyin.currentTime = 0;
  foyinBtn.classList.remove("is-on");
  foyinBtn.setAttribute("aria-pressed", "false");
}

function unlockAndChant() {
  if (audio.wanted && (!audio.ready || audio.foyin.paused)) startFoyin();
}

setupAudio();

async function loadManifest() {
  const res = await fetch("./assets/manifest.json");
  if (!res.ok) throw new Error("manifest " + res.status);
  return res.json();
}

async function loadBin(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("bin " + res.status);
  return new DataView(await res.arrayBuffer());
}

function decodeView(dv, rec) {
  const le = true;
  let o = rec.offset;
  const flags = dv.getUint32(o, le); o += 4;
  const yaw = dv.getFloat32(o, le); o += 4;
  const nverts = dv.getUint32(o, le); o += 4;
  const nfaces = dv.getUint32(o, le); o += 4;
  const ox = dv.getFloat32(o, le); o += 4;
  const oy = dv.getFloat32(o, le); o += 4;
  const oz = dv.getFloat32(o, le); o += 4;
  const scale = dv.getFloat32(o, le); o += 4;

  const pos = new Float32Array(nverts * 3);
  for (let i = 0; i < nverts * 3; i++, o += 2) {
    pos[i] = (dv.getInt16(o, le) / 32767) * scale + (i % 3 === 0 ? ox : i % 3 === 1 ? oy : oz);
  }
  const nrm = new Float32Array(nverts * 3);
  for (let i = 0; i < nverts * 3; i++, o += 2) {
    nrm[i] = dv.getInt16(o, le) / 32767;
  }
  const uv = new Float32Array(nverts * 2);
  for (let i = 0; i < nverts * 2; i++, o += 2) {
    uv[i] = dv.getUint16(o, le) / 65535;
  }
  const idxWidth = rec.idxWidth || ((flags & 1) ? 2 : 4);
  const idx = new Uint32Array(nfaces * 3);
  if (idxWidth === 2) {
    for (let i = 0; i < nfaces * 3; i++, o += 2) idx[i] = dv.getUint16(o, le);
  } else {
    for (let i = 0; i < nfaces * 3; i++, o += 4) idx[i] = dv.getUint32(o, le);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  return { geo, yaw };
}

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    texLoader.load(
      url,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        t.minFilter = THREE.LinearMipmapLinearFilter;
        t.magFilter = THREE.LinearFilter;
        t.generateMipmaps = true;
        resolve(t);
      },
      undefined,
      reject
    );
  });
}

const statueViews = [];

function viewMaterial(map) {
  return new THREE.MeshBasicMaterial({
    map,
    transparent: true,
    opacity: 0,
    side: THREE.FrontSide,
    depthWrite: false,
    alphaTest: 0.22,
  });
}

function azimuthOf(pos) {
  return Math.atan2(pos.x, pos.z);
}

function angDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function updateViewBlend() {
  if (!statueViews.length) return;
  const az = azimuthOf(camera.position);
  let sum = 0;
  const weights = statueViews.map((v) => {
    const d = Math.abs(angDiff(az, v.yawRad));
    const w = Math.pow(Math.max(0, Math.cos(d)), 7);
    sum += w;
    return w;
  });
  if (sum < 1e-6) {
    let best = 0, bestD = 99;
    statueViews.forEach((v, i) => {
      const d = Math.abs(angDiff(az, v.yawRad));
      if (d < bestD) { bestD = d; best = i; }
    });
    statueViews.forEach((v, i) => {
      v.mat.opacity = i === best ? 1 : 0;
      v.mat.depthWrite = i === best;
      v.mesh.visible = i === best;
    });
    return;
  }
  let dominant = 0, domW = -1;
  statueViews.forEach((v, i) => {
    const w = weights[i] / sum;
    if (w > domW) { domW = w; dominant = i; }
    const visible = w > 0.03;
    v.mesh.visible = visible;
    v.mat.opacity = visible ? Math.min(1, w * 1.15) : 0;
    v.mat.depthWrite = false;
  });
  statueViews[dominant].mat.depthWrite = true;
}

/* ---------------- ritual actions ---------------- */
let meritTimer = 0;
function showMerit(text) {
  meritEl.textContent = text;
  meritEl.classList.add("show");
  clearTimeout(meritTimer);
  meritTimer = setTimeout(() => meritEl.classList.remove("show"), 1800);
}

function flashButton(btn) {
  btn.classList.add("is-hit");
  setTimeout(() => btn.classList.remove("is-hit"), 180);
}

let bowing = false;
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function bowToBuddha() {
  if (bowing) return;
  bowing = true;
  unlockAndChant();
  playOneShot(audio.buffers.qing, 0.62);
  controls.autoRotate = false;
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const dir = _tmp.copy(startTarget).sub(startPos);
  const dist = dir.length();
  dir.normalize();
  // devotee bows: step slightly closer and lower the gaze
  const endPos = startPos.clone().addScaledVector(dir, dist * 0.16);
  endPos.y = Math.max(0.42, startPos.y - 0.38);
  const endTarget = startTarget.clone();
  endTarget.y = Math.max(0.28, startTarget.y - 0.42);

  const dur = 2200;
  const t0 = performance.now();
  function step(now) {
    const p = Math.min(1, (now - t0) / dur);
    // go and return
    const trip = p < 0.5 ? p * 2 : 1 - (p - 0.5) * 2;
    const k = easeInOut(trip);
    camera.position.lerpVectors(startPos, endPos, k);
    controls.target.lerpVectors(startTarget, endTarget, k);
    if (p < 1) requestAnimationFrame(step);
    else {
      camera.position.copy(startPos);
      controls.target.copy(startTarget);
      bowing = false;
    }
  }
  requestAnimationFrame(step);
  showMerit("虔诚礼佛");
}

let muyuCount = 0;
function strikeFish() {
  unlockAndChant();
  playOneShot(audio.buffers.muyu, 0.78);
  muyuCount += 1;
  showMerit(muyuCount === 1 ? "木鱼一声" : `木鱼 ${muyuCount} 声`);
  floorGlow.material.opacity = 0.42;
}

let beadCount = 0;
function rollBead() {
  unlockAndChant();
  playOneShot(audio.buffers.bead, 0.7);
  beadCount = (beadCount % 108) + 1;
  if (beadCount === 108) {
    playOneShot(audio.buffers.qing, 0.5);
    showMerit("佛珠一百零八 · 圆满");
  } else {
    showMerit(`佛珠 ${beadCount} / 108`);
  }
}

const floorGlow = makeFloor();
const dust = makeParticles();
const sacred = makeSacredLight();

let hinted = false;
controls.addEventListener("start", () => {
  controls.autoRotate = false;
  unlockAndChant();
  if (!hinted) {
    hinted = true;
    hintEl.classList.add("fade");
  }
});

document.getElementById("btn-bai").addEventListener("click", (e) => {
  flashButton(e.currentTarget);
  bowToBuddha();
});
document.getElementById("btn-muyu").addEventListener("click", (e) => {
  flashButton(e.currentTarget);
  strikeFish();
});
document.getElementById("btn-beads").addEventListener("click", (e) => {
  flashButton(e.currentTarget);
  rollBead();
});

foyinBtn.addEventListener("click", () => {
  audio.wanted = !audio.wanted;
  if (audio.wanted) startFoyin();
  else stopFoyin();
});

// first gesture anywhere also starts chant (autoplay policy)
window.addEventListener("pointerdown", () => unlockAndChant(), { once: true });

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

(async function init() {
  try {
    const manifest = await loadManifest();
    const dv = await loadBin("./" + manifest.bin);
    for (const rec of manifest.views) {
      const { geo, yaw } = decodeView(dv, rec);
      const map = await loadTexture("./" + rec.texture);
      const mat = viewMaterial(map);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.renderOrder = 1;
      scene.add(mesh);
      statueViews.push({
        mesh,
        mat,
        yawRad: THREE.MathUtils.degToRad(rec.yaw ?? yaw),
      });
    }
    updateViewBlend();
    loaderEl.classList.add("hide");
    startFoyin();
  } catch (err) {
    console.error(err);
    loaderEl.querySelector("p").textContent = "法像未能迎请，请刷新再试";
  }
})();

const clock = new THREE.Clock();
function frame() {
  const t = clock.getElapsedTime();
  controls.update();
  updateViewBlend();

  const dir = _tmp.copy(camera.position).sub(statueCenter).normalize();
  sacred.mandorla.position.copy(statueCenter).addScaledVector(dir, -0.52);
  sacred.mandorla.position.y = 0.95;
  sacred.mandorla.lookAt(camera.position);
  sacred.mandorla.material.opacity = 0.82 + Math.sin(t * 0.7) * 0.14;

  sacred.halo.position.copy(statueCenter).addScaledVector(dir, -0.22);
  sacred.halo.position.y = 1.50;
  sacred.halo.lookAt(camera.position);
  sacred.halo.material.opacity = 0.88 + Math.sin(t * 1.15 + 0.6) * 0.12;

  const arr = sacred.spark.geometry.attributes.position.array;
  const base = sacred.sparkBase;
  const ph = sacred.sparkPhase;
  for (let i = 0; i < ph.length; i++) {
    const tw = 0.5 + 0.5 * Math.sin(t * (1.6 + (i % 7) * 0.17) + ph[i]);
    arr[i * 3] = base[i * 3];
    arr[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.35 + ph[i]) * 0.03;
    arr[i * 3 + 2] = base[i * 3 + 2];
    // store twinkle in y is enough; size is global, vary opacity on material
    ph[i] = ph[i]; // keep
  }
  sacred.spark.geometry.attributes.position.needsUpdate = true;
  sacred.spark.material.opacity = 0.55 + 0.4 * (0.5 + 0.5 * Math.sin(t * 2.1));
  sacred.spark.material.size = 0.022 + 0.012 * (0.5 + 0.5 * Math.sin(t * 1.7));
  sacred.spark.rotation.y = t * 0.04;

  if (dust) {
    dust.rotation.y = t * 0.018;
    dust.position.y = Math.sin(t * 0.15) * 0.04;
  }
  if (floorGlow) {
    const target = 0.20 + 0.05 * Math.sin(t * 0.6);
    floorGlow.material.opacity += (target - floorGlow.material.opacity) * 0.06;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
