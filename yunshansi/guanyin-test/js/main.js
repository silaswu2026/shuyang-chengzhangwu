import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

const stage = document.getElementById("stage");
const loaderEl = document.getElementById("loader");
const loaderText = document.getElementById("loader-text");
const loaderBar = document.getElementById("loader-bar");
const hintEl = document.getElementById("hint");
const meritEl = document.getElementById("merit");
const modalEl = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");

const STORAGE_KEY = "yunshansi_webtest_prayers_v1";
const PRAYERS = [
  { id: "family", label: "家人平安", text: "愿家中长幼安康，出入平安，日日清吉，吉祥如意。" },
  { id: "wealth", label: "发财", text: "愿所求如法，衣食丰足，善财有道，广行布施。" },
  { id: "study", label: "小孩读书", text: "愿孩童智慧开显，学业精进，身心安稳，得遇良师。" },
];

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.38;
renderer.shadowMap.enabled = false;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0a08);
scene.fog = new THREE.FogExp2(0x1c1610, 0.016);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.08,
  64
);
scene.add(camera);

const clock = new THREE.Clock();
const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();

/* ---------- first-person look ---------- */
/* 殿内尺度（水月观音坐像）：站在殿中偏前，抬头瞻仰高台大像 */
const TEMPLE = {
  fov: 60,
  standY: 1.60,
  sitY: 1.10,
  homeZ: 2.15,
  sitZ: 0.40,
  pitch: 0.18,
  statueHeight: 2.85,
  platformTop: 1.10,
  statueZ: -5.45,
  platformZ: -5.35,
};
const player = {
  x: 0,
  z: TEMPLE.homeZ,
  y: TEMPLE.standY,
  standY: TEMPLE.standY,
  sitY: TEMPLE.sitY,
  homeX: 0,
  homeZ: TEMPLE.homeZ,
  sitZ: TEMPLE.sitZ,
  yaw: 0,
  pitch: TEMPLE.pitch,
  seated: false,
  busy: false,
};

function applyView() {
  const cy = Math.cos(player.pitch);
  const dirX = Math.sin(player.yaw) * cy;
  const dirY = Math.sin(player.pitch);
  const dirZ = -Math.cos(player.yaw) * cy;
  camera.position.set(player.x, player.y, player.z);
  camera.lookAt(player.x + dirX, player.y + dirY, player.z + dirZ);
}
applyView();

const CREDITS = {
  water_moon:
    "主尊占位：明尼阿波利斯美术馆《水月观音》32122（CC0，12世纪彩绘木雕坐像，不是白玉）· 香案/烛台：Poly Haven（CC0）· 香炉：Freer/SI F1947.15（公共领域）· 蒲团木鱼佛珠殿壳自制 · 不算验收通过",
  eleven:
    "主尊占位：克利夫兰美术馆《十一面观音》1981.53（CC0，北宋至金彩绘木雕立像，不是白玉）· 香案/烛台：Poly Haven（CC0）· 香炉：Freer/SI F1947.15（公共领域）· 蒲团木鱼佛珠殿壳自制 · 不算验收通过",
};

const HALL_VIEWS = {
  water_moon: {
    // 主尊含莲座仍约 5 米，不缩小。按简报第 24 节，默认站位比 112b3db 拉远约 0.7 米（半米到一米之间），视线仍对准上胸，面容宝冠留在上半幅，可多看见一些肩胸，不退回整尊中景。
    fov: 50,
    standY: 1.60,
    sitY: 1.10,
    homeZ: -1.45,
    sitZ: -1.80,
    pitch: 0.58,
    statueHeight: 5.0,
    platformTop: 1.10,
    statueZ: -5.45,
    lightTargetY: 4.95,
    lightY: 7.6,
  },
  eleven: {
    // 立像面容更高，单独略抬仰角；按第 24 节同样拉远约 0.7 米，避免又变成整尊中景或上半幅只剩梁柱黑顶。
    fov: 56,
    standY: 1.60,
    sitY: 1.10,
    homeZ: -1.55,
    sitZ: -1.85,
    pitch: 0.58,
    statueHeight: 5.0,
    platformTop: 1.10,
    statueZ: -5.45,
    lightTargetY: 5.25,
    lightY: 7.7,
  },
};

const statues = { water_moon: null, eleven: null };
let currentHall = null;
let inHall = false;
let hintTimer = 0;
let enterAt = 0;

/* ---------- textures ---------- */
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  t.needsUpdate = true;
  return t;
}

function woodTex(w, h, a, b, repeatX = 4, repeatY = 8) {
  const t = canvasTex(w, h, (g) => {
    g.fillStyle = a;
    g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x++) {
      const n = Math.sin(x * 0.09) * 6 + Math.sin(x * 0.31) * 3;
      g.strokeStyle = b;
      g.globalAlpha = 0.13 + ((x * 17) % 10) * 0.015;
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + n * 0.2, h);
      g.stroke();
    }
    const plank = Math.floor(w / 8);
    g.globalAlpha = 0.35;
    g.strokeStyle = "#1a120c";
    for (let i = 0; i <= 8; i++) {
      g.fillStyle = i % 2 ? "rgba(0,0,0,0.07)" : "rgba(255,220,160,0.03)";
      g.fillRect(i * plank, 0, plank, h);
      g.beginPath();
      g.moveTo(i * plank, 0);
      g.lineTo(i * plank, h);
      g.stroke();
    }
    g.globalAlpha = 1;
  });
  t.repeat.set(repeatX, repeatY);
  return t;
}

function plasterTex() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#2c241c";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1200; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      g.fillStyle = Math.random() > 0.5 ? "rgba(0,0,0,0.07)" : "rgba(255,230,190,0.05)";
      g.fillRect(x, y, 2, 2);
    }
  });
}

const matWood = new THREE.MeshStandardMaterial({
  map: woodTex(512, 512, "#4a3424", "#2a1c12", 6, 1),
  roughness: 0.72,
  metalness: 0.04,
  color: 0xffffff,
});
const matWoodDark = new THREE.MeshStandardMaterial({
  map: woodTex(512, 512, "#2b1d14", "#140e0a", 2, 6),
  roughness: 0.68,
  metalness: 0.05,
  color: 0xffffff,
});
const matPlaster = new THREE.MeshStandardMaterial({
  map: plasterTex(),
  roughness: 0.9,
  metalness: 0.0,
  color: 0xc4b49a,
});
const matStone = new THREE.MeshStandardMaterial({
  color: 0x4a4338,
  roughness: 0.86,
  metalness: 0.05,
});
const matCushion = new THREE.MeshStandardMaterial({
  color: 0x6a1f1a,
  roughness: 0.78,
  metalness: 0.02,
});
const matGold = new THREE.MeshStandardMaterial({
  color: 0xb08a4a,
  roughness: 0.35,
  metalness: 0.7,
});
const matMuyu = new THREE.MeshStandardMaterial({
  color: 0x5a2e18,
  roughness: 0.45,
  metalness: 0.08,
});

/* ---------- hall ---------- */
const hall = new THREE.Group();
scene.add(hall);

const HALL_W = 8.6;
const HALL_D = 12.2;
const HALL_H = 8.8;
const WALL_Z_BACK = -6.15;
const WALL_Z_FRONT = 6.05;

function box(w, h, d, mat, x, y, z, parent = hall) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

function makeHall() {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(HALL_W + 0.4, HALL_D + 0.4),
    new THREE.MeshStandardMaterial({
      map: woodTex(512, 512, "#3d2a1c", "#23160f", 8, 12),
      roughness: 0.82,
      metalness: 0.02,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  hall.add(floor);

  // walls
  box(HALL_W + 0.3, HALL_H, 0.28, matPlaster, 0, HALL_H / 2, WALL_Z_BACK);
  box(HALL_W + 0.3, HALL_H, 0.28, matPlaster, 0, HALL_H / 2, WALL_Z_FRONT);
  box(0.28, HALL_H, HALL_D + 0.3, matPlaster, -HALL_W / 2, HALL_H / 2, 0);
  box(0.28, HALL_H, HALL_D + 0.3, matPlaster, HALL_W / 2, HALL_H / 2, 0);

  // wainscot
  box(HALL_W, 1.15, 0.08, matWoodDark, 0, 0.57, WALL_Z_BACK + 0.18);
  box(0.08, 1.15, HALL_D, matWoodDark, -HALL_W / 2 + 0.18, 0.57, 0);
  box(0.08, 1.15, HALL_D, matWoodDark, HALL_W / 2 - 0.18, 0.57, 0);

  // ceiling boards
  const ceil = new THREE.Mesh(
    new THREE.PlaneGeometry(HALL_W, HALL_D),
    new THREE.MeshStandardMaterial({
      map: woodTex(512, 512, "#2a1c14", "#140e0a", 6, 10),
      roughness: 0.8,
      color: 0xffffff,
    })
  );
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = HALL_H - 0.04;
  hall.add(ceil);

  // beams
  for (let i = -3; i <= 3; i++) {
    box(HALL_W - 0.4, 0.16, 0.22, matWoodDark, 0, HALL_H - 0.22, i * 1.55);
  }
  box(0.22, 0.2, HALL_D - 0.6, matWoodDark, -1.6, HALL_H - 0.32, 0);
  box(0.22, 0.2, HALL_D - 0.6, matWoodDark, 1.6, HALL_H - 0.32, 0);

  // columns
  const colGeo = new THREE.CylinderGeometry(0.16, 0.18, HALL_H - 0.5, 16);
  const capGeo = new THREE.BoxGeometry(0.46, 0.14, 0.46);
  const baseGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.18, 16);
  const colPos = [
    [-2.55, -4.55],
    [2.55, -4.55],
    [-2.55, -1.6],
    [2.55, -1.6],
    [-2.55, 1.6],
    [2.55, 1.6],
  ];
  for (const [x, z] of colPos) {
    const col = new THREE.Mesh(colGeo, matWoodDark);
    col.position.set(x, (HALL_H - 0.5) / 2 + 0.18, z);
    hall.add(col);
    const cap = new THREE.Mesh(capGeo, matWoodDark);
    cap.position.set(x, HALL_H - 0.42, z);
    hall.add(cap);
    const base = new THREE.Mesh(baseGeo, matStone);
    base.position.set(x, 0.09, z);
    hall.add(base);
  }

  // platform / 佛台：加高加宽，让坐像明显高出视平线
  const plat = new THREE.Group();
  plat.position.set(0, 0, TEMPLE.platformZ);
  hall.add(plat);
  box(4.5, 1.04, 2.10, matStone, 0, 0.52, 0, plat);
  box(4.15, 0.34, 1.80, matWoodDark, 0, 1.21, 0.04, plat);
  box(4.3, 0.12, 0.28, matStone, 0, 1.10, 1.02, plat);
  box(3.9, 5.8, 0.10, matWoodDark, 0, 4.15, -0.95, plat);
  const nicheGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 5.2),
    new THREE.MeshBasicMaterial({
      color: 0xc9a56a,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    })
  );
  nicheGlow.position.set(0, 4.2, -0.88);
  plat.add(nicheGlow);

  // side window glow (architectural light, not a photo)
  const winMat = new THREE.MeshBasicMaterial({
    color: 0xe8c888,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  });
  for (const x of [-HALL_W / 2 + 0.16, HALL_W / 2 - 0.16]) {
    for (const z of [-3.2, 0.4]) {
      for (const y of [2.35, 5.35]) {
        const w = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 1.7), winMat);
        w.position.set(x, y, z);
        w.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
        hall.add(w);
      }
    }
  }
}

function makeCushion() {
  const g = new THREE.Group();
  g.position.set(0, 0, -1.18);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), matCushion);
  body.scale.set(1, 0.32, 1);
  body.position.y = 0.09;
  g.add(body);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.018, 8, 32), matGold);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.13;
  g.add(ring);
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.34, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  g.add(shadow);
  hall.add(g);
  return g;
}

function makeMuyu() {
  const g = new THREE.Group();
  g.position.set(0.55, 0, -1.05);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.06, 20), matCushion);
  stand.position.y = 0.04;
  g.add(stand);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 18), matMuyu);
  body.scale.set(1.05, 0.88, 0.95);
  body.position.y = 0.18;
  g.add(body);
  const slit = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.012, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x1a0c06, roughness: 0.7 })
  );
  slit.position.set(0, 0.22, 0.1);
  g.add(slit);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), matGold);
  eye.position.set(0.07, 0.23, 0.09);
  g.add(eye);
  const mallet = new THREE.Group();
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x3a2416, roughness: 0.6 })
  );
  handle.position.y = 0.1;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.028, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.5 })
  );
  head.position.y = 0.21;
  mallet.add(handle, head);
  mallet.position.set(0.16, 0.12, 0.02);
  mallet.rotation.z = -0.7;
  mallet.rotation.y = 0.3;
  g.add(mallet);
  hall.add(g);
  return { group: g, body, mallet };
}

/* ---------- ghost hands, beads, incense stick ---------- */
/* Quest 风格：饱满圆润、半透明，无方块硬边，无写实关节扫描 */
const handMat = new THREE.MeshStandardMaterial({
  color: 0xf2e8d8,
  roughness: 0.42,
  metalness: 0.0,
  transparent: true,
  opacity: 0.38,
  depthWrite: false,
  emissive: new THREE.Color(0x3a342c),
  emissiveIntensity: 0.05,
  side: THREE.DoubleSide,
});

function makeFinger(rad, l1, l2) {
  const root = new THREE.Group();
  const s1 = new THREE.Group();
  const m1 = new THREE.Mesh(new THREE.CapsuleGeometry(rad, l1, 6, 12), handMat);
  m1.position.y = l1 * 0.5 + rad * 0.05;
  s1.add(m1);
  const s2 = new THREE.Group();
  s2.position.y = l1 + rad * 0.15;
  const m2 = new THREE.Mesh(new THREE.CapsuleGeometry(rad * 0.9, l2, 6, 12), handMat);
  m2.position.y = l2 * 0.5 + rad * 0.05;
  s2.add(m2);
  s1.add(s2);
  root.add(s1);
  root.userData.segs = [s1, s2];
  return root;
}

function applyCurl(finger, curl) {
  const segs = finger.userData.segs;
  if (!segs) return;
  segs[0].rotation.x = curl * 0.48;
  segs[1].rotation.x = curl * 0.85;
}

function makeOneHand(side) {
  const g = new THREE.Group();
  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.04, 18, 14), handMat);
  palm.scale.set(1.22, 1.12, 0.68);
  palm.position.set(0, 0.008, 0);
  g.add(palm);
  const heel = new THREE.Mesh(new THREE.SphereGeometry(0.027, 14, 12), handMat);
  heel.scale.set(1.12, 0.9, 0.72);
  heel.position.set(0.002 * side, -0.029, 0.002);
  g.add(heel);
  const wrist = new THREE.Mesh(new THREE.CapsuleGeometry(0.019, 0.028, 6, 12), handMat);
  wrist.position.set(0, -0.058, 0);
  g.add(wrist);

  const defs = [
    { x: 0.027, y: 0.037, z: 0.003, l1: 0.024, l2: 0.019, r: 0.009, splay: -0.2 },
    { x: 0.010, y: 0.043, z: 0.006, l1: 0.029, l2: 0.022, r: 0.0098, splay: -0.05 },
    { x: -0.009, y: 0.043, z: 0.006, l1: 0.027, l2: 0.021, r: 0.0095, splay: 0.07 },
    { x: -0.026, y: 0.037, z: 0.002, l1: 0.021, l2: 0.017, r: 0.0084, splay: 0.22 },
  ];
  const fingers = [];
  for (const d of defs) {
    const f = makeFinger(d.r, d.l1, d.l2);
    f.position.set(d.x * side, d.y, d.z);
    f.rotation.z = d.splay * side;
    g.add(f);
    fingers.push(f);
  }
  const thumb = makeFinger(0.0104, 0.021, 0.017);
  thumb.position.set(-0.037 * side, -0.005, 0.013);
  thumb.rotation.z = 1.12 * side;
  thumb.rotation.x = -0.55;
  thumb.rotation.y = -0.28 * side;
  g.add(thumb);

  g.userData.side = side;
  g.userData.fingers = fingers;
  g.userData.thumb = thumb;
  g.userData.curl = 0.3;
  g.userData.thumbCurl = 0.2;
  g.userData.thumbRoll = 0;
  return g;
}

const hands = { root: new THREE.Group(), left: makeOneHand(-1), right: makeOneHand(1) };
hands.left.position.set(-0.32, -0.08, -0.42);
hands.right.position.set(0.32, -0.08, -0.42);
hands.left.rotation.set(0.42, 0.14, 0.16);
hands.right.rotation.set(0.42, -0.14, -0.16);
hands.root.add(hands.left, hands.right);
camera.add(hands.root);
const handFill = new THREE.PointLight(0xffe6cc, 0.06, 0.7, 2.0);
handFill.position.set(0, -0.04, -0.10);
camera.add(handFill);

function sizeHands() {
  const mobile = (window.innerWidth || 0) <= 720;
  hands.root.scale.setScalar(mobile ? 0.20 : 0.24);
}
sizeHands();

const POSITIONS = {
  rest: {
    L: { p: [-0.32, -0.08, -0.42], r: [0.42, 0.14, 0.16], curl: 0.22, thumb: 0.18 },
    R: { p: [0.32, -0.08, -0.42], r: [0.42, -0.14, -0.16], curl: 0.22, thumb: 0.18 },
  },
  anjali: {
    L: { p: [-0.028, -0.20, -0.44], r: [0.10, 1.48, 0.0], curl: 0.04, thumb: 0.2 },
    R: { p: [0.028, -0.20, -0.44], r: [0.10, -1.48, 0.0], curl: 0.04, thumb: 0.2 },
  },
  incense: {
    L: { p: [-0.22, -0.22, -0.42], r: [0.20, 0.16, 0.16], curl: 0.26, thumb: 0.2 },
    R: { p: [0.10, -0.14, -0.40], r: [-0.15, -0.08, 0.06], curl: 0.62, thumb: 0.45 },
  },
  beads: {
    L: { p: [-0.10, -0.20, -0.40], r: [0.55, 0.22, 0.12], curl: 0.42, thumb: 0.25 },
    R: { p: [0.10, -0.20, -0.40], r: [0.55, -0.22, -0.12], curl: 0.48, thumb: 0.38 },
  },
  bow: {
    L: { p: [-0.18, -0.28, -0.40], r: [0.85, 0.10, 0.10], curl: 0.55, thumb: 0.3 },
    R: { p: [0.18, -0.28, -0.40], r: [0.85, -0.10, -0.10], curl: 0.55, thumb: 0.3 },
  },
  muyu: {
    L: { p: [-0.23, -0.18, -0.36], r: [0.42, 0.14, 0.16], curl: 0.22, thumb: 0.18 },
    R: { p: [0.16, -0.16, -0.38], r: [0.15, -0.20, 0.45], curl: 0.4, thumb: 0.25 },
  },
};

let handPose = "rest";

function poseHands(dt, now = 0) {
  const pose = POSITIONS[handPose] || POSITIONS.rest;
  const k = 1 - Math.exp(-dt * 8);
  const breath = Math.sin(now * 1.35) * (handPose === "rest" || handPose === "anjali" ? 0.01 : 0.004);
  const apply = (hand, t) => {
    hand.position.x += (t.p[0] - hand.position.x) * k;
    hand.position.y += (t.p[1] + breath - hand.position.y) * k;
    hand.position.z += (t.p[2] - hand.position.z) * k;
    hand.rotation.x += (t.r[0] - hand.rotation.x) * k;
    hand.rotation.y += (t.r[1] - hand.rotation.y) * k;
    hand.rotation.z += (t.r[2] - hand.rotation.z) * k;
    hand.userData.curl += (t.curl - hand.userData.curl) * k;
    hand.userData.thumbCurl += (t.thumb - hand.userData.thumbCurl) * k;
    const fingers = hand.userData.fingers || [];
    fingers.forEach((f, i) => applyCurl(f, hand.userData.curl * (1 + i * 0.06)));
    const th = hand.userData.thumb;
    if (th) {
      applyCurl(th, hand.userData.thumbCurl + (hand.userData.thumbRoll || 0) * 0.7);
      const side = hand.userData.side || 1;
      th.rotation.y = -0.28 * side - (hand.userData.thumbRoll || 0) * 0.35 * side;
    }
  };
  apply(hands.left, pose.L);
  apply(hands.right, pose.R);
}

// incense stick in right hand
const stickHeld = new THREE.Group();
const stickBody = new THREE.Mesh(
  new THREE.CylinderGeometry(0.004, 0.0045, 0.22, 8),
  new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.8 })
);
const stickTip = new THREE.Mesh(
  new THREE.SphereGeometry(0.007, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0xff7a2a })
);
stickTip.position.y = 0.12;
stickBody.position.y = 0.02;
stickHeld.add(stickBody, stickTip);
stickHeld.position.set(0.0, 0.07, 0.012);
stickHeld.visible = false;
hands.right.add(stickHeld);

// planted sticks
const planted = new THREE.Group();
scene.add(planted);

// prayer beads: hanging loop with volume, wood grain, guru bead and tassel
const BEAD_COUNT = 24;
const BEAD_R = 0.0076;
function makeBeadTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(48, 44, 8, 64, 64, 72);
  grd.addColorStop(0, "#c08048");
  grd.addColorStop(0.45, "#8a4a28");
  grd.addColorStop(1, "#3a1c10");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 28; i++) {
    g.strokeStyle = `rgba(40,18,8,${0.08 + Math.random() * 0.12})`;
    g.beginPath();
    const y = 8 + i * 4 + Math.sin(i * 0.7) * 2;
    g.moveTo(0, y);
    g.quadraticCurveTo(64, y + 3, 128, y - 1);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}
const beadMap = makeBeadTexture();
const beadMat = new THREE.MeshStandardMaterial({
  map: beadMap,
  color: 0xffe0c0,
  roughness: 0.36,
  metalness: 0.06,
  emissive: 0x3a2414,
  emissiveIntensity: 0.16,
});
const beadMatMark = new THREE.MeshStandardMaterial({
  map: beadMap,
  color: 0xe8c898,
  roughness: 0.32,
  metalness: 0.16,
  emissive: 0x2a1c08,
  emissiveIntensity: 0.18,
});
const beadMatGuru = new THREE.MeshStandardMaterial({
  color: 0x5a2414,
  roughness: 0.28,
  metalness: 0.12,
  map: beadMap,
});
const beadGeo = new THREE.SphereGeometry(1, 16, 12);
const beadsGroup = new THREE.Group();
const beadMeshes = [];
for (let i = 0; i < BEAD_COUNT; i++) {
  const isGuru = i === Math.floor(BEAD_COUNT / 2);
  const isMark = !isGuru && i % 6 === 0;
  const b = new THREE.Mesh(
    beadGeo,
    isGuru ? beadMatGuru : isMark ? beadMatMark : beadMat
  );
  const r = isGuru ? BEAD_R * 1.42 : isMark ? BEAD_R * 1.12 : BEAD_R;
  b.scale.set(r, r * 0.9, r);
  b.userData.radius = r;
  b.userData.isGuru = isGuru;
  beadsGroup.add(b);
  beadMeshes.push(b);
  if (isGuru) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r * 0.72, r * 0.12, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xc4a056, roughness: 0.3, metalness: 0.7 })
    );
    ring.rotation.x = Math.PI / 2;
    b.add(ring);
  }
}
const tassel = new THREE.Group();
const tasselCord = new THREE.Mesh(
  new THREE.CylinderGeometry(0.0016, 0.0016, 0.046, 6),
  new THREE.MeshStandardMaterial({ color: 0x6a2a1a, roughness: 0.6 })
);
tasselCord.position.y = -0.028;
tassel.add(tasselCord);
for (let i = 0; i < 5; i++) {
  const strand = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.0022, 0.03, 3, 6),
    new THREE.MeshStandardMaterial({ color: 0x8a3020, roughness: 0.55 })
  );
  strand.position.set((i - 2) * 0.004, -0.055, 0);
  tassel.add(strand);
}
beadsGroup.add(tassel);

const cordPts = [];
for (let i = 0; i <= 64; i++) cordPts.push(new THREE.Vector3());
const cordCurve = new THREE.CatmullRomCurve3(cordPts, true, "catmullrom", 0.15);
const cordGeo = new THREE.TubeGeometry(cordCurve, 64, 0.0017, 5, true);
const cordMesh = new THREE.Mesh(
  cordGeo,
  new THREE.MeshStandardMaterial({ color: 0x3a2418, roughness: 0.72 })
);
beadsGroup.add(cordMesh);
beadsGroup.position.set(0, -0.118, -0.30);
beadsGroup.visible = false;
hands.root.add(beadsGroup);

function wrapPi(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}
function beadPath(angle, lift = 0) {
  const rx = 0.056;
  const ry = 0.05;
  const x = Math.sin(angle) * rx;
  const y = -0.016 + Math.cos(angle) * ry;
  const z = Math.cos(angle) * 0.01;
  return [x, y + lift, z];
}
function layoutBeads(scroll = 0, roll = 0) {
  const pinch = 0.22;
  for (let i = 0; i < BEAD_COUNT; i++) {
    const angle = ((i - scroll) / BEAD_COUNT) * Math.PI * 2;
    const d = Math.abs(wrapPi(angle - pinch));
    const near = Math.max(0, 1 - d / 0.55);
    const lift = Math.sin(roll * Math.PI) * 0.01 * near;
    const [x, y, z] = beadPath(angle, lift);
    const b = beadMeshes[i];
    b.position.set(x, y, z);
    b.rotation.z = angle + roll * near * 1.6;
    b.rotation.x = 0.35 + roll * near * 0.8;
    if (b.userData.isGuru) {
      tassel.position.set(x, y - b.userData.radius - 0.004, z);
      tassel.rotation.z = Math.sin(angle) * 0.15;
    }
  }
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const [x, y, z] = beadPath(a, 0);
    cordPts[i].set(x, y, z);
  }
  const newGeo = new THREE.TubeGeometry(cordCurve, 64, 0.0017, 5, true);
  cordMesh.geometry.dispose();
  cordMesh.geometry = newGeo;
}
layoutBeads(0, 0);

/* ---------- smoke ---------- */
const smokeCount = 60;
const smokeGeo = new THREE.BufferGeometry();
const smokePos = new Float32Array(smokeCount * 3);
const smokeAge = new Float32Array(smokeCount);
for (let i = 0; i < smokeCount; i++) {
  smokeAge[i] = Math.random();
  smokePos[i * 3] = 0;
  smokePos[i * 3 + 1] = 0;
  smokePos[i * 3 + 2] = 0;
}
smokeGeo.setAttribute("position", new THREE.BufferAttribute(smokePos, 3));
function softParticleTex() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 30);
  grd.addColorStop(0, "rgba(255,255,255,0.85)");
  grd.addColorStop(0.35, "rgba(255,255,255,0.4)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}
const particleMap = softParticleTex();
const smokeMat = new THREE.PointsMaterial({
  map: particleMap,
  color: 0xe8d8c4,
  size: 0.07,
  transparent: true,
  opacity: 0.0,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: true,
});
const smoke = new THREE.Points(smokeGeo, smokeMat);
smoke.position.set(0, 0.9, -3.85);
scene.add(smoke);
let smokeOn = false;

function seedSmoke() {
  smokeOn = true;
  smokeMat.opacity = 0.35;
}

/* ---------- lights ---------- */
scene.add(new THREE.AmbientLight(0x8a7860, 0.86));
const hemi = new THREE.HemisphereLight(0xe8d8b8, 0x4a3a28, 1.05);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xffefd6, 1.22);
key.position.set(1.8, 7.4, 3.0);
scene.add(key);
const fill = new THREE.DirectionalLight(0xfff3e4, 0.62);
fill.position.set(-0.6, 4.4, 4.8);
scene.add(fill);
const statueLight = new THREE.SpotLight(0xfff2dc, 6.4, 22, 0.62, 0.55, 1.05);
statueLight.position.set(0, 7.6, -1.15);
statueLight.target.position.set(0, 4.95, TEMPLE.statueZ);
scene.add(statueLight, statueLight.target);
const candleLights = [];
function addCandleLight(x, y, z) {
  const l = new THREE.PointLight(0xffc070, 1.8, 5.5, 1.8);
  l.position.set(x, y, z);
  scene.add(l);
  candleLights.push(l);
}

/* ---------- audio ---------- */
const audio = {
  foyin: null,
  wantedNian: false,
  ctx: null,
  buffers: {},
  decoded: {},
  urls: {
    muyu: "./assets/audio/muyu.ogg",
    qing: "./assets/audio/qing.ogg",
    bead: "./assets/audio/bead.ogg",
  },
};
function loadAudioEl(src, loop = false, volume = 0.42) {
  const el = new Audio(src);
  el.loop = loop;
  el.preload = "auto";
  el.volume = volume;
  el.setAttribute("playsinline", "");
  return el;
}
const MUSIC_TRACKS = [
  { id: "singing-bowls-meditation", title: "钵音禅修", src: "./assets/audio/music/singing-bowls-meditation.ogg", credit: "Ahjay Stelino · Mixkit" },
  { id: "smooth-meditation", title: "静心缓韵", src: "./assets/audio/music/smooth-meditation.ogg", credit: "Arulo · Mixkit" },
  { id: "organic-meditations-one", title: "安然一", src: "./assets/audio/music/organic-meditations-one.ogg", credit: "Kevin MacLeod (incompetech.com) · CC BY 3.0 · 已截取约 3 分钟" },
  { id: "organic-meditations-three", title: "安然三", src: "./assets/audio/music/organic-meditations-three.ogg", credit: "Kevin MacLeod (incompetech.com) · CC BY 3.0 · 已截取约 3 分钟" },
  { id: "contemplation", title: "澄观", src: "./assets/audio/music/contemplation.ogg", credit: "Joth · CC0" },
  { id: "bowl-strikes-bed", title: "钵声缓击", src: "./assets/audio/music/bowl-strikes-bed.ogg", credit: "原录音 BambooBeast（公有领域），本包编排为缓击床" },
];
const FOYIN_TRACKS = [
  { id: "foyin-singing-bowl-sustain", title: "持钵", src: "./assets/audio/foyin-singing-bowl-sustain.ogg", credit: "Valera N. Trubin · CC BY 4.0 · 已交叉淡化" },
  { id: "foyin-bowl-strike", title: "击钵", src: "./assets/audio/foyin-bowl-strike.ogg", credit: "JAMBATI eu · CC BY 4.0 · 已按间隔重放" },
  { id: "foyin-temple-bell", title: "梵钟", src: "./assets/audio/foyin-temple-bell.ogg", credit: "Jnn · CC BY 2.1 JP · 滋贺县长命寺梵钟，已去掉直流偏置" },
];
const DEFAULT_MUSIC_ID = "singing-bowls-meditation";
const DEFAULT_FOYIN_ID = "foyin-singing-bowl-sustain";
const AUDIO_CREDIT_SUMMARY = "佛乐与佛音：安然一 / 安然三，Kevin MacLeod (incompetech.com)，CC BY 3.0；持钵，Valera N. Trubin，CC BY 4.0；击钵，JAMBATI eu，CC BY 4.0；梵钟，Jnn，CC BY 2.1 JP。详情见选曲面板。";

function setupAudio() {
  audio.foyinId = DEFAULT_FOYIN_ID;
  const first = FOYIN_TRACKS.find((t) => t.id === DEFAULT_FOYIN_ID) || FOYIN_TRACKS[0];
  audio.foyin = loadAudioEl(first.src, true, 0.4);
  audio.buffers.muyu = audio.urls.muyu;
  audio.buffers.qing = audio.urls.qing;
  audio.buffers.bead = audio.urls.bead;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (AC) audio.ctx = new AC();
}
async function decodeSfx() {
  if (!audio.ctx) return;
  await Promise.all(
    Object.entries(audio.urls).map(async ([key, url]) => {
      const res = await fetch(url);
      const raw = await res.arrayBuffer();
      audio.decoded[key] = await audio.ctx.decodeAudioData(raw.slice(0));
    })
  );
}
function unlockAudio() {
  if (audio.ctx && audio.ctx.state === "suspended") {
    audio.ctx.resume().catch(() => {});
  }
}
function sfxKey(keyOrUrl) {
  if (keyOrUrl === "bead" || keyOrUrl === "muyu" || keyOrUrl === "qing") return keyOrUrl;
  if (keyOrUrl === audio.urls.bead || keyOrUrl === audio.buffers.bead) return "bead";
  if (keyOrUrl === audio.urls.muyu || keyOrUrl === audio.buffers.muyu) return "muyu";
  if (keyOrUrl === audio.urls.qing || keyOrUrl === audio.buffers.qing) return "qing";
  return null;
}
function playOneShot(keyOrUrl, volume = 0.7) {
  const key = sfxKey(keyOrUrl);
  const buf = key ? audio.decoded[key] : null;
  if (audio.ctx && buf) {
    if (audio.ctx.state === "suspended") audio.ctx.resume().catch(() => {});
    const src = audio.ctx.createBufferSource();
    src.buffer = buf;
    const gain = audio.ctx.createGain();
    const boost = key === "bead" ? 1.25 : 1;
    gain.gain.value = Math.min(1.0, volume * boost);
    src.connect(gain);
    gain.connect(audio.ctx.destination);
    try { src.start(0); } catch (_) {}
    return;
  }
  const url = (key && audio.urls[key]) || keyOrUrl;
  const el = new Audio(url);
  el.volume = key === "bead" ? Math.min(1, volume * 1.25) : volume;
  el.setAttribute("playsinline", "");
  const p = el.play();
  if (p && p.catch) p.catch(() => {});
}
function foyinTrack(id) {
  return FOYIN_TRACKS.find((item) => item.id === (id || audio.foyinId || DEFAULT_FOYIN_ID));
}

function loadFoyin(id) {
  const track = foyinTrack(id);
  if (!track) return null;
  if (audio.foyin) {
    audio.foyin.pause();
    audio.foyin.src = "";
  }
  audio.foyinId = track.id;
  audio.foyin = loadAudioEl(track.src, true, 0.4);
  return audio.foyin;
}

async function startNian(id) {
  audio.wantedNian = true;
  // 佛音只开声音，不合十挡像；双手保持在画面下角
  document.getElementById("btn-nian").classList.add("is-on");
  if (id && id !== audio.foyinId) loadFoyin(id);
  if (!audio.foyin) loadFoyin(audio.foyinId || DEFAULT_FOYIN_ID);
  try {
    audio.foyin.volume = 0;
    audio.foyin.currentTime = 0;
    await audio.foyin.play();
    const start = performance.now();
    const fade = () => {
      const k = Math.min(1, (performance.now() - start) / 900);
      if (audio.wantedNian) audio.foyin.volume = 0.18 * k;
      if (k < 1 && audio.wantedNian) requestAnimationFrame(fade);
    };
    requestAnimationFrame(fade);
  } catch (_) {}
}
function stopNian() {
  audio.wantedNian = false;
  if (handPose === "anjali") handPose = "rest";
  document.getElementById("btn-nian").classList.remove("is-on");
  if (audio.foyin) {
    audio.foyin.pause();
    audio.foyin.currentTime = 0;
  }
}

/* ---------- ui helpers ---------- */
let meritTimer = 0;
function showMerit(text, hold = 2000) {
  meritEl.textContent = text;
  meritEl.classList.add("show");
  clearTimeout(meritTimer);
  meritTimer = setTimeout(() => meritEl.classList.remove("show"), hold);
}
function showHint() {
  hintEl.classList.remove("fade");
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => hintEl.classList.add("fade"), 3800);
}
function hideHint() {
  hintEl.classList.add("fade");
  clearTimeout(hintTimer);
  lookCtl.hinted = true;
}

function flashButton(btn) {
  btn.classList.add("is-hit");
  setTimeout(() => btn.classList.remove("is-hit"), 180);
}
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function openModal(title, build) {
  modalTitle.textContent = title;
  modalBody.innerHTML = "";
  build(modalBody);
  modalEl.hidden = false;
}
function closeModal() {
  modalEl.hidden = true;
}
modalClose.addEventListener("click", closeModal);
modalEl.addEventListener("click", (e) => {
  if (e.target === modalEl) closeModal();
});

function loadPrayers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
function savePrayers(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/* ---------- fit loaded models ---------- */
function fitModel(root, { targetHeight, sitY = 0, yaw = 0, x = 0, z = 0 }) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(_v);
  const h = size.y || 1;
  const s = targetHeight / h;
  root.scale.multiplyScalar(s);
  root.rotation.y += yaw;
  root.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(root);
  const size2 = box2.getSize(_v);
  const center = box2.getCenter(_v2);
  root.position.x += x - center.x;
  root.position.z += z - center.z;
  root.position.y += sitY - box2.min.y;
  root.updateMatrixWorld(true);
  return size2;
}

const TABLE_Z = -3.85;
const TABLE_Y = 0;
let tableTopY = 0.66;
const burnerWorld = new THREE.Vector3(0, 0.9, TABLE_Z);

const MODEL_PATHS = {
  water_moon: "./assets/models/mia_32122_water_moon_guanyin.glb",
  eleven: "./assets/models/cma_1981.53_eleven_headed_guanyin.glb",
  table: "./assets/models/polyhaven_chinese_console_table_1k.glb",
  xianglu: "./assets/models/si_F1947.15_lidded_xianglu_150k_2048.glb",
  candles: "./assets/models/polyhaven_brass_candleholders_1k.glb",
};

const hallLoad = {
  roots: { table: null, xianglu: null, candles: null },
  stash: { table: null, xianglu: null, candles: null },
  propsReady: false,
  failed: new Set(),
  inflight: null,
  pendingEnter: null,
  done: 0,
  total: Object.keys(MODEL_PATHS).length,
  draco: null,
  currentLabel: "",
};

function hallReady(id) {
  return !!(hallLoad.propsReady && statues[id]);
}

function placeStatue(root, view) {
  scene.add(root);
  fitModel(root, {
    targetHeight: view.statueHeight,
    sitY: view.platformTop,
    x: 0,
    z: view.statueZ,
    yaw: 0,
  });
  root.visible = false;
  return root;
}

function placeHallProps(kind, root) {
  if (kind === "table") {
    scene.add(root);
    fitModel(root, { targetHeight: 0.66, sitY: 0, x: 0, z: TABLE_Z });
    root.updateMatrixWorld(true);
    const tbox = new THREE.Box3().setFromObject(root);
    tableTopY = tbox.max.y;
    hallLoad.roots.table = root;
    return;
  }
  if (!hallLoad.roots.table) return;
  if (kind === "xianglu") {
    root.rotation.x = -Math.PI / 2;
    scene.add(root);
    fitModel(root, { targetHeight: 0.185, sitY: tableTopY, x: 0, z: TABLE_Z });
    root.updateMatrixWorld(true);
    const xbox = new THREE.Box3().setFromObject(root);
    burnerWorld.set(0, xbox.max.y, TABLE_Z);
    smoke.position.copy(burnerWorld);
    hallLoad.roots.xianglu = root;
    return;
  }
  if (kind === "candles") {
    root.traverse((o) => {
      if (o.name && /candleholder_02/i.test(o.name)) o.visible = false;
    });
    scene.add(root);
    fitModel(root, { targetHeight: 0.36, sitY: tableTopY, x: 0, z: TABLE_Z });
    root.updateMatrixWorld(true);
    const cbox = new THREE.Box3().setFromObject(root);
    addCandleLight(-0.48, cbox.max.y - 0.02, TABLE_Z);
    addCandleLight(0.48, cbox.max.y - 0.02, TABLE_Z);
    hallLoad.roots.candles = root;
  }
}

function flushPendingProps() {
  if (!hallLoad.roots.table && hallLoad.stash.table) {
    placeHallProps("table", hallLoad.stash.table);
    hallLoad.stash.table = null;
  }
  if (hallLoad.roots.table && hallLoad.stash.xianglu) {
    placeHallProps("xianglu", hallLoad.stash.xianglu);
    hallLoad.stash.xianglu = null;
  }
  if (hallLoad.roots.table && hallLoad.stash.candles) {
    placeHallProps("candles", hallLoad.stash.candles);
    hallLoad.stash.candles = null;
  }
  hallLoad.propsReady = !!(hallLoad.roots.table && hallLoad.roots.xianglu && hallLoad.roots.candles);
}

function setEnterButtons() {
  document.querySelectorAll(".btn-enter").forEach((btn) => {
    const id = btn.dataset.hall;
    if (hallReady(id)) {
      btn.disabled = false;
      btn.textContent = "入殿礼敬";
      btn.classList.remove("is-wait", "is-fail");
      delete btn.dataset.retry;
      return;
    }
    if (hallLoad.failed.size && !hallLoad.inflight) {
      btn.disabled = false;
      btn.textContent = "连接中断，点此重试";
      btn.classList.add("is-fail");
      btn.classList.remove("is-wait");
      btn.dataset.retry = "1";
      return;
    }
    const n = hallLoad.total ? Math.round((hallLoad.done / hallLoad.total) * 100) : 0;
    const cur = hallLoad.currentLabel ? `正在下载${hallLoad.currentLabel}…` : "正在下载…";
    btn.disabled = false;
    btn.textContent = n ? `${cur} ${n}%` : cur;
    btn.classList.add("is-wait");
    btn.classList.remove("is-fail");
    delete btn.dataset.retry;
  });
}

function tryEnterPending() {
  const id = hallLoad.pendingEnter;
  if (id && hallReady(id)) {
    hallLoad.pendingEnter = null;
    enterHall(id);
  }
}

const MODEL_LABELS = {
  water_moon: "水月观音",
  eleven: "十一面观音",
  table: "香案",
  xianglu: "香炉",
  candles: "烛台",
};
const LOAD_ORDER = ["table", "candles", "xianglu", "eleven", "water_moon"];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function bustUrl(path, attempt) {
  return path + (path.includes("?") ? "&" : "?") + "r=" + attempt + "&t=" + Date.now();
}

async function fetchBuffer(path, timeoutMs, attempt) {
  const ctrl = new AbortController();
  let timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const bump = () => {
    clearTimeout(timer);
    timer = setTimeout(() => ctrl.abort(), timeoutMs);
  };
  try {
    const res = await fetch(attempt ? bustUrl(path, attempt) : path, {
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error("HTTP " + res.status + " " + path);
    if (!res.body) return await res.arrayBuffer();
    const reader = res.body.getReader();
    const chunks = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.byteLength;
      bump();
    }
    const out = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      out.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return out.buffer;
  } finally {
    clearTimeout(timer);
  }
}

function parseGltf(gltf, path, buffer) {
  const dir = path.slice(0, path.lastIndexOf("/") + 1);
  return new Promise((resolve, reject) => {
    gltf.parse(buffer, dir, (g) => resolve(g.scene), reject);
  });
}

async function loadGltfRetry(gltf, path, tries = 3, timeoutMs = 45000) {
  let last = null;
  for (let i = 0; i < tries; i++) {
    try {
      if (i) await sleep(700 * i);
      const buf = await fetchBuffer(path, timeoutMs, i);
      return await parseGltf(gltf, path, buf);
    } catch (err) {
      last = err;
      console.warn("load retry", path, i + 1, err);
    }
  }
  throw last;
}

async function runPool(items, limit, worker) {
  const queue = items.slice();
  const n = Math.min(limit, Math.max(1, queue.length));
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (queue.length) {
        const item = queue.shift();
        await worker(item);
      }
    })
  );
}

function hardenPreviewImages() {
  document.querySelectorAll(".select-preview img").forEach((img) => {
    let tries = 0;
    img.addEventListener("error", () => {
      if (tries >= 3) return;
      tries += 1;
      const base = (img.getAttribute("src") || "").split("?")[0];
      if (!base) return;
      setTimeout(() => {
        img.src = bustUrl(base, tries);
      }, 400 * tries);
    });
  });
}

async function loadModels() {
  if (hallLoad.inflight) return hallLoad.inflight;
  const manager = new THREE.LoadingManager();
  const draco = new DRACOLoader(manager);
  draco.setDecoderPath("./vendor/addons/libs/draco/gltf/");
  draco.preload();
  hallLoad.draco = draco;
  const gltf = new GLTFLoader(manager);
  gltf.setDRACOLoader(draco);

  const jobs = LOAD_ORDER.filter((key) => {
    if (key === "water_moon" || key === "eleven") return !statues[key];
    return !hallLoad.roots[key] && !hallLoad.stash[key];
  }).map((key) => [key, MODEL_PATHS[key]]);
  hallLoad.failed.clear();
  hallLoad.done = hallLoad.total - jobs.length;
  hallLoad.currentLabel = "";

  const work = runPool(jobs, 2, async ([key, path]) => {
    hallLoad.currentLabel = MODEL_LABELS[key] || "";
    setEnterButtons();
    try {
      const root = await loadGltfRetry(gltf, path);
      if (key === "water_moon" || key === "eleven") {
        statues[key] = placeStatue(root, HALL_VIEWS[key]);
      } else {
        hallLoad.stash[key] = root;
        flushPendingProps();
      }
      hallLoad.failed.delete(key);
      hallLoad.done = Math.min(hallLoad.total, hallLoad.done + 1);
      setEnterButtons();
      tryEnterPending();
    } catch (err) {
      console.error("load failed", key, err);
      hallLoad.failed.add(key);
      setEnterButtons();
    }
  }).then(() => {
    hallLoad.inflight = null;
    hallLoad.currentLabel = "";
    flushPendingProps();
    setEnterButtons();
    tryEnterPending();
    if (hallLoad.propsReady && statues.water_moon && statues.eleven && hallLoad.draco) {
      hallLoad.draco.dispose();
      hallLoad.draco = null;
    }
  });

  hallLoad.inflight = work;
  setEnterButtons();
  return work;
}

/* ---------- rituals ---------- */
function tween(duration, update, done) {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      update(easeInOut(p), p);
      if (p < 1) requestAnimationFrame(step);
      else {
        if (done) done();
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
}

async function setSeated(next) {
  if (player.busy) return;
  player.busy = true;
  const fromY = player.y;
  const fromZ = player.z;
  const toY = next ? player.sitY : player.standY;
  const toZ = next ? player.sitZ : player.homeZ;
  player.seated = next;
  const btn = document.getElementById("btn-sit");
  btn.textContent = next ? "起来" : "坐下";
  btn.classList.toggle("is-on", next);
  try {
    await tween(700, (k) => {
      player.y = lerp(fromY, toY, k);
      player.z = lerp(fromZ, toZ, k);
      applyView();
    });
  } finally {
    player.busy = false;
  }
  showMerit(next ? "已坐下" : "已起来", 1200);
}

async function bowToBuddha() {
  if (player.busy) return;
  player.busy = true;
  handPose = "bow";
  playOneShot(audio.buffers.qing, 0.62);
  const from = { y: player.y, pitch: player.pitch, z: player.z };
  const downY = player.seated ? Math.max(0.42, from.y - 0.38) : 0.28;
  const downPitch = -0.95;
  const fwdZ = from.z - 0.22;
  try {
    await tween(2600, (k, p) => {
      const trip = p < 0.45 ? p / 0.45 : p < 0.58 ? 1 : 1 - (p - 0.58) / 0.42;
      const e = easeInOut(Math.min(1, Math.max(0, trip)));
      player.y = lerp(from.y, downY, e);
      player.pitch = lerp(from.pitch, downPitch, e);
      player.z = lerp(from.z, fwdZ, e);
    });
    player.y = from.y;
    player.pitch = from.pitch;
    player.z = from.z;
  } finally {
    handPose = "rest";
    player.busy = false;
  }
  showMerit("虔诚礼拜");
}

function plantStick() {
  const s = new THREE.Mesh(
    new THREE.CylinderGeometry(0.004, 0.0045, 0.2, 6),
    new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 0.8 })
  );
  const tip = new THREE.Mesh(
    new THREE.SphereGeometry(0.006, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff8a3a })
  );
  tip.position.y = 0.11;
  s.add(tip);
  const n = planted.children.length;
  const ang = (n % 5) * 0.22 - 0.44;
  s.position.set(Math.sin(ang) * 0.03, burnerWorld.y + 0.02, burnerWorld.z + Math.cos(ang) * 0.01 - 0.0);
  s.rotation.z = ang * 0.15;
  planted.add(s);
  if (planted.children.length > 6) planted.remove(planted.children[0]);
  seedSmoke();
}

async function offerIncense() {
  if (player.busy) return;
  player.busy = true;
  const wasSeated = player.seated;
  const start = { x: player.x, y: player.y, z: player.z, pitch: player.pitch, yaw: player.yaw };
  const mid = { x: 0, y: player.standY, z: -2.75, pitch: -0.22, yaw: 0 };
  stickHeld.visible = true;
  handPose = "incense";
  showMerit("上前上香");
  try {
    await tween(1400, (k) => {
      player.x = lerp(start.x, mid.x, k);
      player.y = lerp(start.y, mid.y, k);
      player.z = lerp(start.z, mid.z, k);
      player.pitch = lerp(start.pitch, mid.pitch, k);
      player.yaw = lerp(start.yaw, mid.yaw, k);
    });
    await tween(600, (k) => {
      stickHeld.position.y = lerp(0.08, 0.14, k);
    });
    plantStick();
    playOneShot(audio.buffers.qing, 0.45);
    stickHeld.visible = false;
    showMerit("已上一炷香");
    await tween(400, () => {});
    const backY = wasSeated ? player.sitY : player.standY;
    const backZ = wasSeated ? player.sitZ : player.homeZ;
    await tween(1300, (k) => {
      player.x = lerp(mid.x, start.x, k);
      player.y = lerp(mid.y, backY, k);
      player.z = lerp(mid.z, backZ, k);
      player.pitch = lerp(mid.pitch, start.pitch, k);
      player.yaw = lerp(mid.yaw, start.yaw, k);
    });
    player.seated = wasSeated;
  } finally {
    stickHeld.visible = false;
    stickHeld.position.y = 0.08;
    handPose = "rest";
    player.busy = false;
  }
}

function openPray() {
  openModal("祈福", (body) => {
    const box = document.createElement("div");
    box.className = "choices";
    for (const p of PRAYERS) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "choice";
      b.textContent = p.label;
      b.addEventListener("click", () => {
        const list = loadPrayers();
        list.push({
          id: `${p.id}-${Date.now()}`,
          type: p.id,
          label: p.label,
          text: p.text,
          time: Date.now(),
          fulfilled: false,
        });
        savePrayers(list);
        playOneShot(audio.buffers.qing, 0.5);
        body.innerHTML = "";
        const t = document.createElement("p");
        t.textContent = p.text;
        body.appendChild(t);
        showMerit(`已祈：${p.label}`, 2600);
      });
      box.appendChild(b);
    }
    body.appendChild(box);
  });
}

function openVow() {
  const list = loadPrayers();
  const open = list.filter((p) => !p.fulfilled);
  openModal("还愿", (body) => {
    if (!open.length) {
      const t = document.createElement("p");
      t.textContent = "你还未祈福";
      body.appendChild(t);
      return;
    }
    for (const p of open) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "vow-item choice";
      const when = new Date(p.time);
      const hh = when.toLocaleString("zh-CN", { hour12: false });
      b.innerHTML = `${p.label}<small>${p.text}<br/>${hh} · 点此还愿</small>`;
      b.addEventListener("click", () => {
        const all = loadPrayers().map((x) =>
          x.id === p.id ? { ...x, fulfilled: true, fulfilledAt: Date.now() } : x
        );
        savePrayers(all);
        playOneShot(audio.buffers.qing, 0.5);
        body.innerHTML = "";
        const t = document.createElement("p");
        t.textContent = `已还愿：${p.label}。愿心圆满。`;
        body.appendChild(t);
        showMerit(`已还愿：${p.label}`, 2400);
      });
      body.appendChild(b);
    }
  });
}

/* beads / muyu loops */
const ritual = {
  beads: { running: false, count: 0, timer: 0, target: 100, anim: 0, rolling: false },
  muyu: { running: false, count: 0, timer: 0, target: 50, strike: 0 },
};

function stopBeads() {
  ritual.beads.running = false;
  ritual.beads.rolling = false;
  ritual.beads.anim = 0;
  beadsGroup.visible = false;
  hands.right.userData.thumbRoll = 0;
  hands.left.userData.thumbRoll = 0;
  if (handPose === "beads") handPose = "rest";
  const btn = document.getElementById("btn-beads");
  btn.textContent = "佛珠";
  btn.classList.remove("is-on");
}
function zhCount(n) {
  const map = { 21: "二十一", 50: "五十", 100: "一百", 108: "一百零八" };
  return map[n] || String(n);
}
function startBeads(target = 100) {
  if (player.busy) return;
  ritual.beads.running = true;
  ritual.beads.count = 0;
  ritual.beads.target = target;
  ritual.beads.timer = 0.2;
  ritual.beads.anim = 0;
  ritual.beads.rolling = false;
  beadsGroup.visible = true;
  layoutBeads(0, 0);
  handPose = "beads";
  if (audio.wantedNian) stopNian();
  if (ritual.muyu.running) stopMuyu();
  const btn = document.getElementById("btn-beads");
  btn.textContent = "停止";
  btn.classList.add("is-on");
  showMerit(`佛珠 0 / ${target}`);
}
function beginBeadRoll() {
  if (ritual.beads.rolling) return;
  ritual.beads.rolling = true;
  ritual.beads.anim = 0;
  ritual.beads.count += 1;
  playOneShot("bead", 0.9);
  if (ritual.beads.count >= ritual.beads.target) {
    showMerit(`佛珠${zhCount(ritual.beads.target)} · 圆满`, 2600);
  } else {
    showMerit(`佛珠 ${ritual.beads.count} / ${ritual.beads.target}`);
  }
}
function updateBeads(dt) {
  const b = ritual.beads;
  if (!b.running) return;
  if (!b.rolling) {
    b.timer += dt;
    if (b.timer >= 0.16) {
      b.timer = 0;
      if (b.count < b.target) beginBeadRoll();
    }
  }
  if (b.rolling) {
    b.anim = Math.min(1, b.anim + dt / 0.4);
    const p = easeInOut(b.anim);
    layoutBeads(b.count - 1 + p, p);
    const roll = Math.sin(p * Math.PI);
    hands.right.userData.thumbRoll = roll;
    hands.left.userData.thumbRoll = roll * 0.35;
    if (b.anim >= 1) {
      b.rolling = false;
      b.anim = 0;
      layoutBeads(b.count, 0);
      hands.right.userData.thumbRoll = 0;
      hands.left.userData.thumbRoll = 0;
      if (b.count >= b.target) {
        playOneShot(audio.buffers.qing, 0.5);
        stopBeads();
      }
    }
  }
}

const muyuSet = makeMuyu();

function stopMuyu() {
  ritual.muyu.running = false;
  if (handPose === "muyu") handPose = "rest";
  const btn = document.getElementById("btn-muyu");
  btn.textContent = "木鱼";
  btn.classList.remove("is-on");
}
function startMuyu(target = 50) {
  if (player.busy) return;
  ritual.muyu.running = true;
  ritual.muyu.count = 0;
  ritual.muyu.target = target;
  ritual.muyu.timer = 0;
  ritual.muyu.strike = 0;
  handPose = "muyu";
  if (ritual.beads.running) stopBeads();
  const btn = document.getElementById("btn-muyu");
  btn.textContent = "停止";
  btn.classList.add("is-on");
  showMerit(`木鱼 0 / ${target}`);
}
function tickMuyu() {
  ritual.muyu.count += 1;
  ritual.muyu.strike = 1;
  playOneShot("muyu", 0.8);
  if (ritual.muyu.count >= ritual.muyu.target) {
    playOneShot("qing", 0.45);
    showMerit(`木鱼${zhCount(ritual.muyu.target)}声 · 圆满`, 2600);
    stopMuyu();
  } else {
    showMerit(`木鱼 ${ritual.muyu.count} / ${ritual.muyu.target}`);
  }
}

function openCountPicker(kind) {
  unlockAudio();
  const isBeads = kind === "beads";
  const options = isBeads
    ? [
        { n: 21, label: "二十一" },
        { n: 100, label: "一百" },
        { n: 108, label: "一百零八" },
      ]
    : [
        { n: 21, label: "二十一" },
        { n: 50, label: "五十" },
        { n: 108, label: "一百零八" },
      ];
  const def = isBeads ? 100 : 50;
  openModal(isBeads ? "佛珠" : "木鱼", (body) => {
    const lead = document.createElement("p");
    lead.textContent = isBeads ? "请选择诵珠遍数" : "请选择敲木鱼声数";
    body.appendChild(lead);
    const box = document.createElement("div");
    box.className = "choices";
    for (const opt of options) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "choice" + (opt.n === def ? " is-default" : "");
      b.textContent = opt.label;
      b.addEventListener("click", () => {
        closeModal();
        unlockAudio();
        if (isBeads) startBeads(opt.n);
        else startMuyu(opt.n);
      });
      box.appendChild(b);
    }
    body.appendChild(box);
  });
}

const music = { el: null, id: null };

function stopMusic() {
  if (music.el) {
    music.el.pause();
    music.el.src = "";
    music.el = null;
  }
  music.id = null;
  const btn = document.getElementById("btn-music");
  if (btn) btn.classList.remove("is-on");
}

function playMusic(id) {
  const track = MUSIC_TRACKS.find((item) => item.id === id);
  if (!track) return;
  const prev = music.el;
  music.el = null;
  if (prev) {
    prev.pause();
    prev.src = "";
  }
  unlockAudio();
  const el = loadAudioEl(track.src, true, 0.22);
  music.el = el;
  music.id = id;
  const p = el.play();
  if (p && p.catch) p.catch(() => {});
  document.getElementById("btn-music").classList.add("is-on");
}

function addTrackButtons(box, tracks, currentId, onPick) {
  for (const track of tracks) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "choice" + (currentId === track.id ? " is-default" : "");
    b.append(track.title);
    if (track.credit) {
      const sm = document.createElement("small");
      sm.textContent = track.credit;
      b.appendChild(sm);
    }
    b.addEventListener("click", () => onPick(track));
    box.appendChild(b);
  }
}

function openMusicPicker() {
  unlockAudio();
  openModal("选曲", (body) => {
    const lead = document.createElement("p");
    lead.textContent = "佛乐与佛音分开选择。这批佛音是钵声和梵钟氛围，不是唱诵。";
    body.appendChild(lead);

    const hMusic = document.createElement("h3");
    hMusic.className = "modal-section";
    hMusic.textContent = "佛乐";
    body.appendChild(hMusic);
    const box = document.createElement("div");
    box.className = "choices";
    addTrackButtons(box, MUSIC_TRACKS, music.id, (track) => {
      playMusic(track.id);
      closeModal();
    });
    const off = document.createElement("button");
    off.type = "button";
    off.className = "choice";
    off.textContent = "关闭佛乐";
    off.addEventListener("click", () => {
      stopMusic();
      closeModal();
    });
    box.appendChild(off);
    body.appendChild(box);

    const hFoyin = document.createElement("h3");
    hFoyin.className = "modal-section";
    hFoyin.textContent = "佛音";
    body.appendChild(hFoyin);
    const box2 = document.createElement("div");
    box2.className = "choices";
    addTrackButtons(box2, FOYIN_TRACKS, audio.wantedNian ? audio.foyinId : null, (track) => {
      startNian(track.id);
      closeModal();
    });
    const offF = document.createElement("button");
    offF.type = "button";
    offF.className = "choice";
    offF.textContent = "关闭佛音";
    offF.addEventListener("click", () => {
      stopNian();
      closeModal();
    });
    box2.appendChild(offF);
    body.appendChild(box2);

    const cred = document.createElement("p");
    cred.className = "audio-credit";
    cred.textContent = AUDIO_CREDIT_SUMMARY;
    body.appendChild(cred);
  });
}

/* ---------- look controls ---------- */
const lookCtl = { down: false, id: null, lx: 0, ly: 0, hinted: false };
function onDown(e) {
  if (!inHall) return;
  if (performance.now() - enterAt < 600) return;
  if (e.target !== renderer.domElement) return;
  if (!modalEl.hidden) return;
  lookCtl.down = true;
  lookCtl.id = e.pointerId;
  lookCtl.lx = e.clientX;
  lookCtl.ly = e.clientY;
  try { renderer.domElement.setPointerCapture(e.pointerId); } catch (_) {}
  hideHint();
}
function onMove(e) {
  if (!lookCtl.down || e.pointerId !== lookCtl.id) return;
  if (player.busy) return;
  const dx = e.clientX - lookCtl.lx;
  const dy = e.clientY - lookCtl.ly;
  lookCtl.lx = e.clientX;
  lookCtl.ly = e.clientY;
  player.yaw -= dx * 0.0045;
  player.pitch -= dy * 0.0038;
  const limY = 1.15;
  const limP = 0.95;
  player.yaw = Math.max(-limY, Math.min(limY, player.yaw));
  player.pitch = Math.max(-0.7, Math.min(limP, player.pitch));
}
function onUp(e) {
  if (e.pointerId === lookCtl.id) lookCtl.down = false;
}
renderer.domElement.addEventListener("pointerdown", onDown);
renderer.domElement.addEventListener("pointermove", onMove);
window.addEventListener("pointerup", onUp);
window.addEventListener("pointercancel", onUp);

/* ---------- buttons ---------- */
document.getElementById("btn-sit").addEventListener("click", (e) => {
  flashButton(e.currentTarget);
  setSeated(!player.seated);
});
document.getElementById("btn-bai").addEventListener("click", (e) => {
  flashButton(e.currentTarget);
  bowToBuddha();
});
document.getElementById("btn-incense").addEventListener("click", (e) => {
  flashButton(e.currentTarget);
  offerIncense();
});
document.getElementById("btn-pray").addEventListener("click", (e) => {
  flashButton(e.currentTarget);
  openPray();
});
document.getElementById("btn-vow").addEventListener("click", (e) => {
  flashButton(e.currentTarget);
  openVow();
});
document.getElementById("btn-nian").addEventListener("click", (e) => {
  flashButton(e.currentTarget);
  if (audio.wantedNian) stopNian();
  else {
    if (ritual.beads.running) stopBeads();
    startNian();
    showMerit("念佛");
  }
});
document.getElementById("btn-beads").addEventListener("click", (e) => {
  flashButton(e.currentTarget);
  if (ritual.beads.running) stopBeads();
  else openCountPicker("beads");
});
document.getElementById("btn-muyu").addEventListener("click", (e) => {
  flashButton(e.currentTarget);
  if (ritual.muyu.running) stopMuyu();
  else openCountPicker("muyu");
});

function setHallUi(visible) {
  document.querySelectorAll(".hall-ui").forEach((el) => {
    el.hidden = !visible;
  });
}
function applyHallCamera(view) {
  player.standY = view.standY;
  player.sitY = view.sitY;
  player.homeZ = view.homeZ;
  player.sitZ = view.sitZ;
  player.homeX = 0;
  player.x = 0;
  player.z = view.homeZ;
  player.y = view.standY;
  player.yaw = 0;
  player.pitch = view.pitch;
  player.seated = false;
  player.busy = false;
  camera.fov = view.fov;
  camera.updateProjectionMatrix();
  resizeRenderer();
  const btn = document.getElementById("btn-sit");
  btn.textContent = "坐下";
  btn.classList.remove("is-on");
  if (statueLight) {
    statueLight.position.set(0, view.lightY || 7.6, -1.15);
    statueLight.target.position.set(0, view.lightTargetY, view.statueZ);
  }
  applyView();
}
function resetRituals() {
  if (ritual.beads.running) stopBeads();
  if (ritual.muyu.running) stopMuyu();
  if (audio.wantedNian) stopNian();
  stopMusic();
  closeModal();
  meritEl.classList.remove("show");
  meritEl.textContent = "";
}
function showSelectHall() {
  inHall = false;
  currentHall = null;
  document.body.classList.add("is-select");
  document.body.classList.remove("is-hall");
  setHallUi(false);
  const selectEl = document.getElementById("select-hall");
  selectEl.hidden = false;
  selectEl.scrollTop = 0;
}
function enterHall(id) {
  const view = HALL_VIEWS[id];
  if (!view || !hallReady(id)) return;
  unlockAudio();
  currentHall = id;
  inHall = true;
  for (const [key, root] of Object.entries(statues)) {
    if (root) root.visible = key === id;
  }
  applyHallCamera(view);
  document.getElementById("credit").textContent = CREDITS[id] + " · 佛乐与佛音署名见右上角选曲";
  document.getElementById("select-hall").hidden = true;
  document.body.classList.remove("is-select");
  document.body.classList.add("is-hall");
  setHallUi(true);
  lookCtl.hinted = false;
  lookCtl.down = false;
  enterAt = performance.now();
  setTimeout(showHint, 80);
  startNian(DEFAULT_FOYIN_ID);
  playMusic(DEFAULT_MUSIC_ID);
}
function returnToSelect() {
  resetRituals();
  player.busy = false;
  player.seated = false;
  while (planted.children.length) planted.remove(planted.children[0]);
  smokeOn = false;
  smokeMat.opacity = 0;
  for (const root of Object.values(statues)) {
    if (root) root.visible = false;
  }
  lookCtl.down = false;
  showSelectHall();
}

document.getElementById("btn-back").addEventListener("click", (e) => {
  flashButton(e.currentTarget);
  returnToSelect();
});
document.getElementById("btn-music").addEventListener("click", (e) => {
  flashButton(e.currentTarget);
  openMusicPicker();
});
document.querySelectorAll(".btn-enter").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.hall;
    if (hallReady(id)) {
      enterHall(id);
      return;
    }
    hallLoad.pendingEnter = id;
    if (!hallLoad.inflight) loadModels().catch((err) => console.error(err));
    setEnterButtons();
  });
});

function resizeRenderer() {
  const stage = document.getElementById("stage");
  const w = Math.max(1, Math.round(stage?.clientWidth || window.innerWidth));
  const h = Math.max(1, Math.round(stage?.clientHeight || window.innerHeight));
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  sizeHands();
}
window.addEventListener("resize", resizeRenderer);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", resizeRenderer);
}

/* ---------- dust ---------- */
const dustCount = 80;
const dustGeo = new THREE.BufferGeometry();
const dustPos = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i++) {
  dustPos[i * 3] = (Math.random() - 0.5) * 6;
  dustPos[i * 3 + 1] = 0.4 + Math.random() * 3.5;
  dustPos[i * 3 + 2] = (Math.random() - 0.5) * 9;
}
dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
const dust = new THREE.Points(
  dustGeo,
  new THREE.PointsMaterial({
    map: particleMap,
    color: 0xe8d4a8,
    size: 0.028,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
);
scene.add(dust);

/* ---------- frame ---------- */
function frame() {
  const dt = Math.min(0.05, clock.getDelta());
  const t = clock.elapsedTime;

  if (!player.busy && !lookCtl.down) {
    // slight settle only
  }
  applyView();
  poseHands(dt, t);

  if (smokeOn) {
    const arr = smoke.geometry.attributes.position.array;
    for (let i = 0; i < smokeCount; i++) {
      smokeAge[i] += dt * (0.12 + (i % 5) * 0.02);
      if (smokeAge[i] > 1) smokeAge[i] -= 1;
      const a = smokeAge[i];
      arr[i * 3] = Math.sin(t * 0.7 + i) * 0.05 * a;
      arr[i * 3 + 1] = a * 0.55;
      arr[i * 3 + 2] = Math.cos(t * 0.5 + i * 0.4) * 0.04 * a;
    }
    smoke.geometry.attributes.position.needsUpdate = true;
    smokeMat.opacity = 0.28 + Math.sin(t * 0.8) * 0.06;
    smokeMat.size = 0.04 + Math.sin(t * 1.1) * 0.008;
  }

  for (let i = 0; i < candleLights.length; i++) {
    candleLights[i].intensity = 1.05 + Math.sin(t * 3.2 + i * 1.7) * 0.18 + Math.sin(t * 7.1 + i) * 0.06;
  }
  if (statueLight) {
    statueLight.intensity = 6.2 + Math.sin(t * 0.6) * 0.18;
  }
  dust.rotation.y = t * 0.02;

  updateBeads(dt);
  if (ritual.muyu.running) {
    ritual.muyu.timer += dt;
    if (ritual.muyu.timer >= 0.4) {
      ritual.muyu.timer = 0;
      tickMuyu();
    }
  }
  if (ritual.muyu.strike > 0) {
    ritual.muyu.strike = Math.max(0, ritual.muyu.strike - dt * 4);
    const k = ritual.muyu.strike;
    muyuSet.mallet.rotation.z = -0.7 - k * 0.7;
    muyuSet.body.scale.set(1.05 + k * 0.04, 0.88 + k * 0.03, 0.95);
  } else {
    muyuSet.mallet.rotation.z += (-0.7 - muyuSet.mallet.rotation.z) * 0.2;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

/* ---------- boot ---------- */
makeHall();
makeCushion();
setupAudio();
requestAnimationFrame(frame);

(async function init() {
  hardenPreviewImages();
  setEnterButtons();
  showSelectHall();
  resizeRenderer();
  loaderEl.classList.add("hide");
  decodeSfx().catch((err) => console.error(err));
  try {
    await loadModels();
  } catch (err) {
    console.error(err);
    setEnterButtons();
  }
})();
