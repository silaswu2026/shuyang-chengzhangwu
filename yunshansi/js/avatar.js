import * as THREE from "three";

/**
 * Sansa-audit proportions (original meshes):
 * ~2–2.5 heads tall, bald peach sphere, stubby tubes, mitten hands,
 * white shoe-socks, matte vinyl, closed curved eyes.
 */

const SKIN = [0xf0c9a8, 0xe8be9a, 0xf2d0b0, 0xe0b090];

/** 小沙弥：淡蓝灰袍 + 浅黄袈裟板（gasa），pastel 变体 */
const SHAMI_BASE = [
  0xa8b4bc, // pale blue-grey
  0xb0bcc4,
  0xa0aeb8,
  0xb8c2c8,
];
const SHAMI_PANTS = [
  0x9aa6ae,
  0xa2aeb6,
  0x929ea8,
  0xaab4ba,
];
const GASA = [0xe8d98a, 0xf0e2a0, 0xe0d080, 0xf5e8b0];

/** 道童：同比例；米/青袍 */
const DAO_BASE = [
  0xf2ebe0, // cream
  0xe8e4d9,
  0x7a9a96, // soft teal
  0x8aa8a4,
];
const DAO_PANTS = [
  0xddd4c4,
  0xd0c8b8,
  0x6a8a86,
  0x7a9894,
];
const DAO_ACCENT = [0xc9a86a, 0xb89860, 0xe8d9a8, 0xa8c4c0];

/** Pelvis height — stubby 2.2-head body (feet at 0, crown ~0.78 before root scale) */
const HIPS_Y = 0.30;

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.9,
    metalness: opts.metalness ?? 0.0,
    flatShading: false,
    ...opts,
  });
}

function softSphere(r, color, segs = 16) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(r, segs, segs - 2),
    mat(color, { roughness: 0.88 })
  );
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function softCapsule(radius, length, color) {
  const m = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, Math.max(0.01, length), 4, 8),
    mat(color, { roughness: 0.9 })
  );
  m.castShadow = true;
  return m;
}

/** Thin curved closed-eye as a flat torus arc (smile eye). */
function makeClosedEye(side) {
  const eye = new THREE.Mesh(
    new THREE.TorusGeometry(0.038, 0.007, 6, 12, Math.PI * 0.85),
    mat(0x2a2218, { roughness: 0.55 })
  );
  eye.position.set(side * 0.07, 0.015, 0.175);
  eye.rotation.x = -0.15;
  eye.rotation.z = side > 0 ? -0.15 : 0.15;
  eye.rotation.y = side * 0.08;
  return eye;
}

/**
 * Cute SD / vinyl figurine (Sansa DNA, original geometry).
 * Total ≈ 0.78–0.85 wu before root.scale; head ≈ 40% of height.
 */
export function createAvatar(style = {}) {
  const avatarType = style.avatarType === "daotong" ? "daotong" : "shami";
  const robeVariant = (style.robeVariant | 0) % 4;
  const skinTone = (style.skinTone | 0) % 4;
  const accessory = (style.accessory | 0) % 4;
  const robeHue = typeof style.robeHue === "number" ? style.robeHue : 0.5;

  const skinC = SKIN[skinTone];
  const isDao = avatarType === "daotong";
  const baseHex = isDao ? DAO_BASE[robeVariant] : SHAMI_BASE[robeVariant];
  const pantsHex = isDao ? DAO_PANTS[robeVariant] : SHAMI_PANTS[robeVariant];
  const accentHex = isDao ? DAO_ACCENT[robeVariant] : GASA[robeVariant];

  const robeC = new THREE.Color(baseHex);
  const hsl = { h: 0, s: 0, l: 0 };
  robeC.getHSL(hsl);
  // keep pastel: tiny hue nudge only
  robeC.setHSL((hsl.h + (robeHue - 0.5) * 0.04 + 1) % 1, Math.min(0.22, hsl.s), hsl.l);
  const robeHex = robeC.getHex();

  const root = new THREE.Group();
  root.userData.avatarType = avatarType;
  // Figurine-small vs hall doors (~1/4)
  root.scale.setScalar(0.82);

  const hips = new THREE.Group();
  hips.position.y = HIPS_Y;
  root.add(hips);

  // —— Short stout torso (soft vinyl) ——
  const torso = softSphere(0.145, robeHex, 14);
  torso.scale.set(1.15, 1.05, 1.0);
  torso.position.y = 0.12;
  hips.add(torso);

  // Baggy pants / lower robe as soft squat sphere
  const pants = softSphere(0.17, pantsHex, 12);
  pants.scale.set(1.25, 0.85, 1.15);
  pants.position.y = -0.02;
  hips.add(pants);

  // Soft tunic cylinder layer
  const tunic = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.2, 0.28, 12, 1, true),
    mat(robeHex, { side: THREE.DoubleSide, roughness: 0.92 })
  );
  tunic.position.y = 0.08;
  hips.add(tunic);

  // Pale yellow gasa panel (front + back) — shami; dao gets soft sash strip
  if (!isDao) {
    const gasaMat = mat(accentHex, { roughness: 0.88 });
    const gasaF = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.02), gasaMat);
    gasaF.position.set(0.02, 0.1, 0.155);
    gasaF.rotation.z = -0.12;
    hips.add(gasaF);
    const gasaB = gasaF.clone();
    gasaB.position.z = -0.155;
    gasaB.rotation.z = 0.12;
    hips.add(gasaB);
  } else {
    const sash = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.04, 0.02),
      mat(accentHex, { roughness: 0.85 })
    );
    sash.position.set(0, 0.06, 0.16);
    hips.add(sash);
  }

  // Almost no neck — tiny disk only
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.05, 0.03, 8),
    mat(skinC, { roughness: 0.88 })
  );
  neck.position.y = 0.265;
  hips.add(neck);

  // —— BIG bald peach sphere (~40% of height) ——
  const head = new THREE.Group();
  head.position.y = 0.42; // sits on shoulders
  hips.add(head);

  const skull = softSphere(0.195, skinC, 18);
  skull.scale.set(1.02, 1.0, 0.98);
  head.add(skull);

  // Soft cheek volume (subtle squash)
  const cheekL = softSphere(0.055, skinC, 8);
  cheekL.scale.set(1.1, 0.85, 0.9);
  cheekL.position.set(-0.12, -0.04, 0.1);
  const cheekR = cheekL.clone();
  cheekR.position.x = 0.12;
  head.add(cheekL, cheekR);

  // Closed curved-line eyes (serene smile)
  head.add(makeClosedEye(-1), makeClosedEye(1));

  // Tiny nose nub
  const nose = softSphere(0.018, skinC, 6);
  nose.scale.set(0.7, 0.85, 1.1);
  nose.position.set(0, -0.02, 0.185);
  head.add(nose);

  // Thin smile
  const mouth = new THREE.Mesh(
    new THREE.TorusGeometry(0.022, 0.0045, 5, 10, Math.PI * 0.9),
    mat(0xc07068, { roughness: 0.65 })
  );
  mouth.position.set(0, -0.065, 0.175);
  mouth.rotation.x = Math.PI;
  mouth.rotation.z = Math.PI;
  head.add(mouth);

  // Soft orange–red cheek blush
  const blushMat = mat(0xf09878, { transparent: true, opacity: 0.5, roughness: 0.98 });
  const blushL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), blushMat);
  blushL.scale.set(1.3, 0.75, 0.45);
  blushL.position.set(-0.11, -0.035, 0.145);
  const blushR = blushL.clone();
  blushR.position.x = 0.11;
  head.add(blushL, blushR);

  // Shami: bald (no hair). Dao: tiny bun or soft hat — still soft-toy cute
  if (isDao) {
    if (accessory % 2 === 0) {
      const bun = softSphere(0.055, 0x2a2218, 10);
      bun.position.y = 0.18;
      head.add(bun);
      const pin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.08, 6),
        mat(0xc9a86a, { metalness: 0.2, roughness: 0.5 })
      );
      pin.rotation.z = Math.PI / 2;
      pin.position.set(0, 0.2, 0);
      head.add(pin);
    } else {
      const hat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.1, 0.07, 10),
        mat(robeHex, { roughness: 0.9 })
      );
      hat.position.y = 0.175;
      head.add(hat);
      const tip = softSphere(0.035, accentHex, 8);
      tip.position.y = 0.22;
      head.add(tip);
    }
  } else {
    // faint crown sheen on bald head (vinyl)
    const shine = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 6),
      mat(skinC, { roughness: 0.45, transparent: true, opacity: 0.28 })
    );
    shine.position.set(0, 0.12, 0.05);
    head.add(shine);

    // optional tiny beads necklace
    if (accessory === 1 || accessory === 3) {
      const beads = new THREE.Mesh(
        new THREE.TorusGeometry(0.08, 0.012, 5, 14),
        mat(0x6b4e3d, { roughness: 0.6 })
      );
      beads.position.set(0, 0.22, 0.12);
      beads.rotation.x = 0.6;
      hips.add(beads);
    }
  }

  // —— Stubby tubular arms + mitten / nub hands ——
  const armL = new THREE.Group();
  armL.position.set(-0.2, 0.18, 0);
  const sleeveL = softCapsule(0.048, 0.06, robeHex);
  sleeveL.position.y = -0.06;
  const handL = softSphere(0.048, skinC, 8); // mitten nub
  handL.position.y = -0.18;
  armL.add(sleeveL, handL);
  hips.add(armL);

  const armR = new THREE.Group();
  armR.position.set(0.2, 0.18, 0);
  const sleeveR = softCapsule(0.048, 0.06, robeHex);
  sleeveR.position.y = -0.06;
  const handR = softSphere(0.048, skinC, 8);
  handR.position.y = -0.18;
  armR.add(sleeveR, handR);
  hips.add(armR);

  // —— Short legs + white rounded shoe-socks ——
  const legL = new THREE.Group();
  legL.position.set(-0.07, 0, 0);
  const thighL = softCapsule(0.055, 0.06, pantsHex);
  thighL.position.y = -0.1;
  const shoeL = softSphere(0.055, 0xf5f2ea, 10);
  shoeL.scale.set(1.15, 0.65, 1.35);
  shoeL.position.set(0, -0.24, 0.015);
  shoeL.castShadow = true;
  legL.add(thighL, shoeL);
  hips.add(legL);

  const legR = new THREE.Group();
  legR.position.set(0.07, 0, 0);
  const thighR = softCapsule(0.055, 0.06, pantsHex);
  thighR.position.y = -0.1;
  const shoeR = shoeL.clone();
  legR.add(thighR, shoeR);
  hips.add(legR);

  // —— Cream translucent pill name label ——
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 72;
  const ctx = canvas.getContext("2d");
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const spriteMat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.position.y = 1.05;
  sprite.scale.set(1.05, 0.24, 1);
  root.add(sprite);

  let _isLocal = !!style.isLocal;

  function setNickname(name, opts = {}) {
    if (typeof opts === "boolean") _isLocal = opts;
    else if (opts && typeof opts.isLocal === "boolean") _isLocal = opts.isLocal;

    const label = String(name || "").slice(0, 12);
    ctx.clearRect(0, 0, 320, 72);

    // cream translucent pill
    ctx.fillStyle = "rgba(245, 240, 228, 0.88)";
    roundRect(ctx, 16, 14, 288, 44, 22);
    ctx.fill();
    ctx.strokeStyle = "rgba(180, 170, 150, 0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    let textX = 160;
    if (_isLocal) {
      // green 「我」 chip
      ctx.beginPath();
      ctx.arc(44, 36, 14, 0, Math.PI * 2);
      ctx.fillStyle = "#3d8f5a";
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("我", 44, 37);
      textX = 175;
    }

    ctx.fillStyle = "#3a342c";
    ctx.font = "20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, textX, 37);
    tex.needsUpdate = true;
  }
  setNickname(style.nickname || "", { isLocal: _isLocal });

  root.userData = {
    avatarType,
    hips,
    head,
    armL,
    armR,
    legL,
    legR,
    handL,
    handR,
    setNickname,
    anim: "idle",
    phase: Math.random() * Math.PI * 2,
    hipsBaseY: HIPS_Y,
  };

  return root;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Calm bouncey toy motion — keep sync field names. */
export function updateAvatarAnimation(avatar, anim, dt) {
  const u = avatar.userData;
  if (!u?.hips) return;
  u.phase = (u.phase || 0) + dt;
  const t = u.phase;
  const a = anim || "idle";
  const baseY = u.hipsBaseY ?? HIPS_Y;

  u.hips.rotation.x = 0;
  u.hips.rotation.z = 0;
  u.head.rotation.x = 0;
  u.head.rotation.z = 0;
  u.armL.rotation.set(0, 0, 0.28);
  u.armR.rotation.set(0, 0, -0.28);
  u.legL.rotation.x = 0;
  u.legR.rotation.x = 0;

  if (a === "walk") {
    const s = Math.sin(t * 8.5);
    u.legL.rotation.x = s * 0.4;
    u.legR.rotation.x = -s * 0.4;
    u.armL.rotation.x = -s * 0.28;
    u.armR.rotation.x = s * 0.28;
    u.hips.position.y = baseY + Math.abs(Math.sin(t * 8.5)) * 0.035;
    u.hips.rotation.z = s * 0.05;
    u.head.rotation.z = -s * 0.04;
  } else if (a === "hapjang") {
    u.armL.rotation.set(-1.0, 0.35, 0.9);
    u.armR.rotation.set(-1.0, -0.35, -0.9);
    u.head.rotation.x = 0.08;
    u.hips.position.y = baseY + Math.sin(t * 1.8) * 0.008;
  } else if (a === "bow") {
    const bow = 0.4 + Math.sin(t * 2.2) * 0.28;
    u.hips.rotation.x = bow;
    u.head.rotation.x = bow * 0.3;
    u.armL.rotation.set(-0.8, 0.2, 0.5);
    u.armR.rotation.set(-0.8, -0.2, -0.5);
    u.hips.position.y = baseY;
  } else if (a === "beads") {
    u.armR.rotation.set(-0.6, -0.4, -0.2);
    u.armL.rotation.set(-0.3, 0.3, 0.4);
    u.armR.rotation.z += Math.sin(t * 6.5) * 0.15;
    u.hips.position.y = baseY + Math.sin(t * 1.6) * 0.01;
    u.head.rotation.x = 0.05;
  } else if (a === "moktak") {
    u.armR.rotation.set(-0.8, -0.2, -0.12);
    u.armR.rotation.x += Math.sin(t * 16) * 0.25;
    u.armL.rotation.set(-0.4, 0.3, 0.4);
    u.hips.position.y = baseY + Math.abs(Math.sin(t * 16)) * 0.012;
  } else {
    // idle waddle breath
    u.hips.position.y = baseY + Math.sin(t * 1.5) * 0.014;
    u.armL.rotation.z = 0.28 + Math.sin(t * 1.1) * 0.035;
    u.armR.rotation.z = -0.28 - Math.sin(t * 1.1) * 0.035;
    u.head.rotation.z = Math.sin(t * 0.85) * 0.025;
  }

  if (a !== "walk" && a !== "idle" && a !== "beads" && a !== "moktak" && a !== "hapjang") {
    u.hips.position.y = baseY;
  }
}
