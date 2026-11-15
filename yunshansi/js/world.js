import * as THREE from "three";

/**
 * Courtyard world — Sansa-like scale/atmosphere, original assets.
 * South 山门 → left 佛家 (first) / right 道家 stub.
 * Architecture tall vs figurine avatars (~1/4 door height).
 */

export function createWorld(scene) {
  const root = new THREE.Group();
  scene.add(root);

  // Soft daylight (pastel, not harsh)
  scene.add(new THREE.AmbientLight(0xd8d0c4, 0.62));
  const sun = new THREE.DirectionalLight(0xffe8d0, 0.95);
  sun.position.set(14, 26, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 90;
  sun.shadow.camera.left = -45;
  sun.shadow.camera.right = 45;
  sun.shadow.camera.top = 45;
  sun.shadow.camera.bottom = -45;
  sun.shadow.bias = -0.0002;
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xc5d4e0, 0x6a5a48, 0.4));

  // Dirt / sand courtyard ground (Sansa warm earth, not dark grass)
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(38, 64),
    new THREE.MeshStandardMaterial({ color: 0x8a7358, roughness: 0.96 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  root.add(ground);

  // Soft grass tufts
  for (let i = 0; i < 80; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 4 + Math.random() * 28;
    addGrassTuft(root, Math.cos(a) * r, Math.sin(a) * r);
  }

  // Stone paths — gate north, then left佛 / right道
  addPath(root, 0, 8, 3.4, 18, 0x9a9488);
  addPath(root, -10, -2, 14, 2.8, 0x9a9488);
  addPath(root, 10, -2, 14, 2.8, 0x8a9298);

  // Central stone ring + low pagoda (courtyard focus, diorama scale)
  const ring = new THREE.Mesh(
    new THREE.CylinderGeometry(5.5, 5.8, 0.18, 48),
    stoneMat(0xb8b0a4)
  );
  ring.position.set(0, 0.09, 2);
  ring.receiveShadow = true;
  root.add(ring);
  const pagoda = buildPagoda();
  pagoda.position.set(0, 0, 2);
  root.add(pagoda);

  // Fog mountains (soft blue-grey pastel)
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const r = 31 + (i % 3) * 2.2;
    const h = 7 + (i % 5) * 1.6;
    const m = new THREE.Mesh(
      new THREE.ConeGeometry(3.2 + (i % 3) * 0.4, h, 6),
      new THREE.MeshStandardMaterial({
        color: i % 2 ? 0x6a7888 : 0x5a6a78,
        flatShading: true,
        roughness: 1,
      })
    );
    m.position.set(Math.cos(a) * r, h * 0.42, Math.sin(a) * r);
    root.add(m);
  }

  // Autumn maple clusters (soft stylized)
  for (const [x, z] of [
    [-8, 10], [8, 11], [-18, 4], [18, 5], [-22, -8], [20, -10], [-6, -18], [7, -16],
  ]) {
    root.add(buildMaple(x, z));
  }

  // —— 山门 (south, +Z) ——
  const gate = buildShanmen();
  gate.position.set(0, 0, 15);
  root.add(gate);
  root.add(makeSign(-3.4, 0.15, 11.2, "← 佛家", 0x6b4f2a));
  root.add(makeSign(3.4, 0.15, 11.2, "道家 →", 0x4a5d6a));

  // Floor lanterns along approach
  for (const [x, z] of [
    [-2.2, 12], [2.2, 12], [-2.2, 8], [2.2, 8],
    [-2.2, 4], [2.2, 4], [-6, 0], [6, 0],
  ]) {
    root.add(buildFloorLantern(x, z));
  }

  // —— LEFT: Buddhism courtyard (priority) ——
  const fo = new THREE.Group();
  fo.position.set(-12, 0, -2);
  root.add(fo);

  // Courtyard dirt patch
  const foYard = new THREE.Mesh(
    new THREE.CircleGeometry(9, 40),
    new THREE.MeshStandardMaterial({ color: 0x8f7860, roughness: 0.96 })
  );
  foYard.rotation.x = -Math.PI / 2;
  foYard.position.y = 0.03;
  foYard.receiveShadow = true;
  fo.add(foYard);

  const hall = buildFodian();
  hall.position.set(0, 0, -7);
  fo.add(hall);

  const pond = buildPond();
  pond.position.set(-5.5, 0.02, 2.5);
  fo.add(pond);

  const bell = buildZhonglou();
  bell.position.set(5.5, 0, 3);
  fo.add(bell);

  const bamboo = buildZhulin();
  bamboo.position.set(-7.5, 0, -1);
  fo.add(bamboo);

  for (const [x, z] of [
    [-4, 5], [4, 5], [-4, -1], [4, -1], [-2.5, -4], [2.5, -4],
  ]) {
    fo.add(buildFloorLantern(x, z));
  }

  // Buddha pedestal + figure inside porch (grand vs avatar)
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.4, 0.45, 16),
    stoneMat(0xa09888)
  );
  pedestal.position.set(0, 0.55, -5.0);
  pedestal.castShadow = true;
  fo.add(pedestal);
  const figure = buildSeatedFigure(0xd4af37);
  figure.position.set(0, 0.75, -5.0);
  fo.add(figure);

  // —— RIGHT: Daoism stub ——
  const dao = new THREE.Group();
  dao.position.set(12, 0, -2);
  root.add(dao);
  const daoYard = new THREE.Mesh(
    new THREE.CircleGeometry(7, 32),
    new THREE.MeshStandardMaterial({ color: 0x7a8588, roughness: 0.95 })
  );
  daoYard.rotation.x = -Math.PI / 2;
  daoYard.position.y = 0.03;
  dao.add(daoYard);
  const stub = buildDaoguanStub();
  stub.position.set(0, 0, -4);
  dao.add(stub);
  dao.add(makeSign(0, 0.1, 3.2, "道观营造中", 0x4a5d6a));
  dao.add(buildFloorLantern(-2.5, 2));
  dao.add(buildFloorLantern(2.5, 2));

  // Soft mist veil
  const mist = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 22),
    new THREE.MeshBasicMaterial({
      color: 0xd0d8e0,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  mist.position.set(0, 5, -22);
  root.add(mist);

  return {
    root,
    markers: {
      shanmen: new THREE.Vector3(0, 0, 12.5),
      fodian: new THREE.Vector3(-12, 0, -9),
      daoguan: new THREE.Vector3(12, 0, -6),
      zhulin: new THREE.Vector3(-19.5, 0, -3),
      chitang: new THREE.Vector3(-17.5, 0, 0.5),
      zhonglou: new THREE.Vector3(-6.5, 0, 1),
    },
  };
}

function stoneMat(c = 0xb0a898) {
  return new THREE.MeshStandardMaterial({ color: c, roughness: 0.92, metalness: 0.02 });
}
function woodMat(c = 0x5c4033) {
  return new THREE.MeshStandardMaterial({ color: c, roughness: 0.88 });
}
function tileMat(c = 0x3a4550) {
  return new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, flatShading: true });
}
function pastelMat(c, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color: c,
    roughness: opts.roughness ?? 0.9,
    metalness: 0,
    ...opts,
  });
}

function addPath(root, x, z, w, d, color) {
  const p = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.05, d),
    stoneMat(color)
  );
  p.position.set(x, 0.025, z);
  p.receiveShadow = true;
  root.add(p);
}

function addGrassTuft(root, x, z) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.22 + Math.random() * 0.12, 4),
      pastelMat(0x5a8a52)
    );
    blade.position.set((Math.random() - 0.5) * 0.12, 0.12, (Math.random() - 0.5) * 0.12);
    blade.rotation.z = (Math.random() - 0.5) * 0.4;
    g.add(blade);
  }
  g.position.set(x, 0, z);
  root.add(g);
}

function buildPagoda() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.8, 0.35, 8),
    stoneMat(0xc4bcb0)
  );
  base.position.y = 0.3;
  base.castShadow = true;
  g.add(base);
  for (let i = 0; i < 3; i++) {
    const tier = new THREE.Mesh(
      new THREE.BoxGeometry(1.4 - i * 0.25, 0.55, 1.4 - i * 0.25),
      stoneMat(0xb8b0a4)
    );
    tier.position.y = 0.75 + i * 0.7;
    tier.castShadow = true;
    g.add(tier);
    const eave = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1 - i * 0.2, 1.2 - i * 0.2, 0.08, 8),
      tileMat(0x4a5560)
    );
    eave.position.y = 1.05 + i * 0.7;
    g.add(eave);
  }
  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(0.25, 0.7, 8),
    new THREE.MeshStandardMaterial({ color: 0xc9a86a, metalness: 0.35, roughness: 0.45 })
  );
  tip.position.y = 3.1;
  g.add(tip);
  return g;
}

function buildMaple(x, z) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 2.4, 7),
    woodMat(0x5a4030)
  );
  trunk.position.set(x, 1.2, z);
  trunk.castShadow = true;
  g.add(trunk);
  const colors = [0xc45a3a, 0xd47840, 0xb84830, 0xe09050];
  for (let i = 0; i < 5; i++) {
    const canopy = new THREE.Mesh(
      new THREE.SphereGeometry(0.7 + Math.random() * 0.35, 8, 6),
      pastelMat(colors[i % colors.length], { roughness: 0.95, flatShading: true })
    );
    canopy.position.set(
      x + (Math.random() - 0.5) * 1.2,
      2.4 + Math.random() * 0.8,
      z + (Math.random() - 0.5) * 1.2
    );
    canopy.castShadow = true;
    g.add(canopy);
  }
  return g;
}

/** Tall gate so figurine avatars feel small walking through. */
function buildShanmen() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(9, 0.45, 2.4), stoneMat(0x9a9488));
  base.position.y = 0.22;
  base.receiveShadow = true;
  g.add(base);
  // Pillars ~4.8 tall → avatar (~0.7) ≈ 1/7 of pillar, gate opening grand
  for (const x of [-3.5, 3.5]) {
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.36, 4.8, 12),
      woodMat(0x4a3020)
    );
    col.position.set(x, 2.6, 0);
    col.castShadow = true;
    g.add(col);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 0.5), woodMat(0x3d2914));
  beam.position.y = 4.9;
  g.add(beam);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(5.8, 1.7, 4), tileMat(0x2c3540));
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 6.0;
  g.add(roof);
  g.add(makeSign(0, 5.2, 0.7, "云山寺", 0x6b4f2a));
  // Soft side screens hinting 佛 / 道
  const leftPanel = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 2.2, 0.12),
    pastelMat(0xd8cfc0)
  );
  leftPanel.position.set(-2.2, 1.5, -0.3);
  g.add(leftPanel);
  const rightPanel = leftPanel.clone();
  rightPanel.material = pastelMat(0xc8d4d0);
  rightPanel.position.x = 2.2;
  g.add(rightPanel);
  return g;
}

/**
 * 大雄宝殿 — tall porch + open door so avatar ≈ 1/4 door height.
 * Door opening ~2.8 high; avatar ~0.7 → ~1/4.
 */
function buildFodian() {
  const g = new THREE.Group();
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(12, 0.55, 9),
    stoneMat(0xa8a090)
  );
  platform.position.y = 0.28;
  platform.receiveShadow = true;
  g.add(platform);

  // Steps
  for (let i = 0; i < 3; i++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(4.5 - i * 0.3, 0.18, 0.7),
      stoneMat(0xb0a898)
    );
    step.position.set(0, 0.1 + i * 0.18, 4.6 - i * 0.35);
    g.add(step);
  }

  // Hall body (warm wood, pastel-soft)
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(10, 4.2, 7.2),
    woodMat(0x8b4a3a)
  );
  body.position.y = 2.6;
  body.castShadow = true;
  g.add(body);

  // Open door recess (dark void) — height 2.9 so avatar ~1/4
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 2.9, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 1 })
  );
  door.position.set(0, 2.0, 3.65);
  g.add(door);

  // Paper door panels flanking opening
  for (const x of [-2.6, 2.6]) {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 2.9, 0.08),
      pastelMat(0xf0ebe0)
    );
    panel.position.set(x, 2.0, 3.62);
    g.add(panel);
  }

  // Porch columns (tall vs figurine)
  for (const x of [-4.2, -1.5, 1.5, 4.2]) {
    const c = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.22, 4.0, 10),
      pastelMat(0xe0d4bc)
    );
    c.position.set(x, 2.55, 3.9);
    c.castShadow = true;
    g.add(c);
  }

  const roof1 = new THREE.Mesh(new THREE.ConeGeometry(8.2, 2.0, 4), tileMat(0x2a3340));
  roof1.rotation.y = Math.PI / 4;
  roof1.position.y = 5.5;
  g.add(roof1);
  const roof2 = new THREE.Mesh(new THREE.ConeGeometry(5.8, 1.3, 4), tileMat(0x232b36));
  roof2.rotation.y = Math.PI / 4;
  roof2.position.y = 6.8;
  g.add(roof2);

  g.add(makeSign(0, 4.4, 3.85, "大雄宝殿", 0x8b3a2a));
  return g;
}

function buildPond() {
  const g = new THREE.Group();
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(3.0, 32),
    new THREE.MeshStandardMaterial({
      color: 0x5a8a92,
      roughness: 0.2,
      metalness: 0.25,
    })
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.05;
  g.add(water);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(3.0, 0.14, 8, 40),
    stoneMat(0x9a9488)
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.08;
  g.add(rim);
  return g;
}

function buildZhonglou() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.35, 3.4), stoneMat(0x9a9488));
  base.position.y = 0.18;
  g.add(base);
  for (const [x, z] of [
    [-1.2, -1.2],
    [1.2, -1.2],
    [-1.2, 1.2],
    [1.2, 1.2],
  ]) {
    const c = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.15, 3.8, 8),
      woodMat(0x4a3020)
    );
    c.position.set(x, 2.1, z);
    g.add(c);
  }
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.4, 4), tileMat());
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 4.5;
  g.add(roof);
  const bell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.58, 0.85, 14),
    new THREE.MeshStandardMaterial({ color: 0xb8860b, metalness: 0.6, roughness: 0.35 })
  );
  bell.position.y = 2.8;
  g.add(bell);
  return g;
}

function buildZhulin() {
  const g = new THREE.Group();
  for (let i = 0; i < 32; i++) {
    const x = (Math.random() - 0.5) * 6.5;
    const z = (Math.random() - 0.5) * 6.5;
    const h = 2.6 + Math.random() * 2.8;
    const stalk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.055, h, 6),
      pastelMat(0x4a7a52)
    );
    stalk.position.set(x, h / 2, z);
    g.add(stalk);
    const leaf = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 0.75, 5),
      pastelMat(0x5a8a58, { flatShading: true })
    );
    leaf.position.set(x, h, z);
    g.add(leaf);
  }
  return g;
}

/** Square floor lanterns (Sansa courtyard vibe). */
function buildFloorLantern(x, z) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.12, 0.45),
    stoneMat(0x8a8478)
  );
  base.position.set(x, 0.06, z);
  g.add(base);
  const post = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.7, 0.28),
    woodMat(0x4a3828)
  );
  post.position.set(x, 0.45, z);
  g.add(post);
  const pane = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.48, 0.42),
    new THREE.MeshStandardMaterial({
      color: 0xffe8c8,
      emissive: 0xcc8844,
      emissiveIntensity: 0.55,
      roughness: 0.6,
      transparent: true,
      opacity: 0.92,
    })
  );
  pane.position.set(x, 1.05, z);
  g.add(pane);
  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.08, 0.5),
    woodMat(0x3a2a1a)
  );
  cap.position.set(x, 1.32, z);
  g.add(cap);
  const light = new THREE.PointLight(0xffc080, 0.35, 6, 2);
  light.position.set(x, 1.05, z);
  g.add(light);
  return g;
}

function buildSeatedFigure(color) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 16, 12),
    new THREE.MeshStandardMaterial({ color, metalness: 0.35, roughness: 0.4 })
  );
  body.scale.set(1, 1.2, 0.9);
  body.position.y = 0.85;
  body.castShadow = true;
  g.add(body);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 14, 12),
    new THREE.MeshStandardMaterial({ color, metalness: 0.35, roughness: 0.4 })
  );
  head.position.y = 1.75;
  g.add(head);
  return g;
}

function buildDaoguanStub() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.4, 6.5), stoneMat(0x7a8588));
  base.position.y = 0.2;
  g.add(base);
  for (const x of [-2.6, 2.6]) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.6, 0.22), woodMat(0x7a7468));
    c.position.set(x, 2.0, 2.2);
    g.add(c);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.22, 0.22), woodMat(0x7a7468));
  beam.position.set(0, 3.75, 2.2);
  g.add(beam);
  const ghost = new THREE.Mesh(
    new THREE.BoxGeometry(6.5, 2.8, 5.5),
    new THREE.MeshStandardMaterial({
      color: 0x8a9aaa,
      transparent: true,
      opacity: 0.22,
      wireframe: true,
    })
  );
  ghost.position.y = 2.2;
  g.add(ghost);
  return g;
}

function makeSign(x, y, z, text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = "#f3efe6";
  ctx.font = "bold 28px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 34);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const s = new THREE.Sprite(mat);
  s.position.set(x, y + 1.2, z);
  s.scale.set(2.2, 0.55, 1);
  return s;
}

export const SCENE_LIST = [
  { id: "shanmen", label: "山门", side: "center" },
  { id: "fodian", label: "佛殿", side: "buddha" },
  { id: "chitang", label: "池塘", side: "buddha" },
  { id: "zhonglou", label: "钟楼", side: "buddha" },
  { id: "zhulin", label: "竹林", side: "buddha" },
  { id: "daoguan", label: "道观(营造中)", side: "dao" },
];
