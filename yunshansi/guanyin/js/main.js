import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const stage = document.getElementById("stage");
const loaderEl = document.getElementById("loader");
const hintEl = document.getElementById("hint");

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0908);
scene.fog = new THREE.FogExp2(0x0a0908, 0.045);

const camera = new THREE.PerspectiveCamera(
  32,
  window.innerWidth / window.innerHeight,
  0.05,
  40
);
camera.position.set(0.55, 1.05, 3.55);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.55;
controls.enablePan = false;
controls.minDistance = 1.7;
controls.maxDistance = 6.5;
controls.minPolarAngle = 0.55;
controls.maxPolarAngle = Math.PI * 0.58;
controls.target.set(0, 0.86, 0);

const texLoader = new THREE.TextureLoader();

function makeFloor() {
  const geo = new THREE.CircleGeometry(3.2, 72);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x161310,
    transparent: true,
    opacity: 0.9,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -0.002;
  scene.add(mesh);

  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(1.15, 64),
    new THREE.MeshBasicMaterial({
      color: 0x3a2a14,
      transparent: true,
      opacity: 0.28,
    })
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.001;
  scene.add(glow);
}

function makeParticles() {
  const n = 160;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 4.2;
    pos[i * 3 + 1] = Math.random() * 2.6;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 4.2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xe8d2a0,
    size: 0.012,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return pts;
}

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
  // weights from angular proximity, sharp so the current photo stays crisp
  let sum = 0;
  const weights = statueViews.map((v) => {
    const d = Math.abs(angDiff(az, v.yawRad));
    const w = Math.pow(Math.max(0, Math.cos(d)), 7);
    sum += w;
    return w;
  });
  if (sum < 1e-6) {
    // fallback: nearest one
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

makeFloor();
const dust = makeParticles();

let hinted = false;
controls.addEventListener("start", () => {
  controls.autoRotate = false;
  if (!hinted) {
    hinted = true;
    hintEl.classList.add("fade");
  }
});

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
  if (dust) {
    dust.rotation.y = t * 0.012;
    dust.position.y = Math.sin(t * 0.15) * 0.04;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
