import * as THREE from "three";
import { createWorld, SCENE_LIST } from "./world.js";
import { createAvatar, updateAvatarAnimation } from "./avatar.js";
import { createControls } from "./controls.js";
import { createAudio } from "./audio.js";
import { createRituals } from "./rituals.js";
import { connectTemple } from "./net.js";
import { poeticName } from "./names.js";

const canvas = document.getElementById("view");
const gate = document.getElementById("gate");
const nickInput = document.getElementById("nickname");
const enterBtn = document.getElementById("enterBtn");
const hud = document.getElementById("hud");
const roomInfo = document.getElementById("roomInfo");
const queueEl = document.getElementById("queue");
const serviceEl = document.getElementById("serviceInfo");

nickInput.value = poeticName();
document.getElementById("rerollName")?.addEventListener("click", () => {
  nickInput.value = poeticName();
});

let avatarType = "shami";
document.querySelectorAll("[data-avatar]").forEach((btn) => {
  btn.addEventListener("click", () => {
    avatarType = btn.getAttribute("data-avatar");
    document.querySelectorAll("[data-avatar]").forEach((b) => b.classList.toggle("active", b === btn));
  });
});
document.querySelector('[data-avatar="shami"]')?.classList.add("active");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb8c4cc);
scene.fog = new THREE.Fog(0xb8c4cc, 18, 52);

const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 120);
camera.position.set(0, 5.2, 16);

const world = createWorld(scene);
const audio = createAudio();

const remoteAvatars = new Map(); // sessionId -> { mesh, target }
let localAvatar = null;
let room = null;
let myId = null;
let sendAcc = 0;
let currentAnim = "idle";

const controls = createControls(camera, canvas, () => localAvatar);

const rituals = createRituals({
  audio,
  onChange: ({ anim, beadCount, pulse }) => {
    currentAnim = anim || "idle";
    if (!room) return;
    if (pulse && anim === "moktak") {
      room.send("moktak", {});
    } else {
      room.send("ritual", { anim: currentAnim, beadCount: beadCount ?? 0 });
    }
  },
});

// scene buttons
const sceneBar = document.getElementById("sceneBar");
for (const s of SCENE_LIST) {
  const b = document.createElement("button");
  b.textContent = s.label;
  b.dataset.scene = s.id;
  b.addEventListener("click", () => {
    if (!room || !localAvatar) return;
    room.send("scene", { sceneId: s.id });
    const m = world.markers[s.id];
    if (m) {
      localAvatar.position.set(m.x + (Math.random() - 0.5), 0, m.z + (Math.random() - 0.5));
    }
    document.querySelectorAll("#sceneBar button").forEach((x) => x.classList.toggle("active", x === b));
  });
  sceneBar.appendChild(b);
}

// audio sliders
["ambient", "chant", "sfx"].forEach((track) => {
  const el = document.getElementById(`vol-${track}`);
  el?.addEventListener("input", () => audio.setVolume(track, Number(el.value)));
});

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

function styleFromPlayer(p, opts = {}) {
  return {
    nickname: p.nickname,
    avatarType: p.avatarType,
    robeVariant: p.robeVariant,
    robeHue: p.robeHue,
    skinTone: p.skinTone,
    hairTone: p.hairTone,
    accessory: p.accessory,
    isLocal: !!opts.isLocal,
  };
}

function ensureRemote(id, p) {
  if (remoteAvatars.has(id)) return remoteAvatars.get(id);
  const mesh = createAvatar(styleFromPlayer(p));
  mesh.userData.setNickname(p.nickname);
  scene.add(mesh);
  const rec = {
    mesh,
    tx: p.x,
    tz: p.z,
    trot: p.rotY,
    anim: p.anim,
  };
  remoteAvatars.set(id, rec);
  return rec;
}

function removeRemote(id) {
  const rec = remoteAvatars.get(id);
  if (!rec) return;
  scene.remove(rec.mesh);
  remoteAvatars.delete(id);
}

function bindRoom(r) {
  room = r;
  myId = r.sessionId;

  r.state.players.onAdd((p, id) => {
    if (id === myId) {
      if (!localAvatar) {
        localAvatar = createAvatar(styleFromPlayer(p, { isLocal: true }));
        localAvatar.userData.setNickname(p.nickname, { isLocal: true });
        localAvatar.position.set(p.x, 0, p.z);
        localAvatar.rotation.y = p.rotY;
        scene.add(localAvatar);
      } else {
        localAvatar.userData.setNickname(p.nickname, { isLocal: true });
      }
    } else {
      const rec = ensureRemote(id, p);
      rec.mesh.position.set(p.x, 0, p.z);
      rec.mesh.rotation.y = p.rotY;
    }
    p.onChange(() => {
      if (id === myId) return;
      const rec = ensureRemote(id, p);
      // Only show remotes roughly in same area — always show for MVP
      rec.tx = p.x;
      rec.tz = p.z;
      rec.trot = p.rotY;
      rec.anim = p.anim;
      rec.mesh.userData.setNickname(p.nickname);
    });
  });

  r.state.players.onRemove((_p, id) => {
    if (id !== myId) removeRemote(id);
  });

  r.onMessage("sfx", (msg) => {
    if (msg?.type === "moktak") audio.playMoktak();
  });
  r.onMessage("service", (msg) => {
    audio.setServiceMode(msg?.mode || "none");
    updateServiceUI(msg?.mode || "none");
  });

  const syncMeta = () => {
    if (roomInfo) {
      const n = r.state.players.size;
      roomInfo.textContent = `${r.state.roomLabel || "云山一院"} · 在场 ${n}/${r.state.maxClients || 40}`;
    }
    if (queueEl) {
      const q = r.state.queueNarrative || "";
      queueEl.textContent = q;
      queueEl.classList.toggle("show", !!q);
    }
    updateServiceUI(r.state.serviceMode || "none");
    audio.setServiceMode(r.state.serviceMode || "none");
  };
  syncMeta();
  r.onStateChange(syncMeta);
}

function updateServiceUI(mode) {
  if (!serviceEl) return;
  if (mode === "morning") serviceEl.textContent = "早课共听中（北京时间）";
  else if (mode === "evening") serviceEl.textContent = "晚课共听中（北京时间）";
  else serviceEl.textContent = "个人静心 · 早课05:00 / 晚课18:00（北京）";
}

enterBtn.addEventListener("click", async () => {
  enterBtn.disabled = true;
  enterBtn.textContent = "入寺中…";
  try {
    audio.unlock();
    const nickname = (nickInput.value || poeticName()).trim().slice(0, 16);
    const { room: r } = await connectTemple({ nickname, avatarType });
    bindRoom(r);
    gate.classList.add("hidden");
    hud.classList.add("on");
  } catch (err) {
    console.error(err);
    enterBtn.disabled = false;
    enterBtn.textContent = "入寺";
    alert("入寺失败：\n" + (err?.message || err));
  }
});

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  rituals.update(dt);

  if (localAvatar) {
    const ritualLocked = rituals.locked;
    const mov = controls.update(dt, ritualLocked);
    let anim = currentAnim;
    if (!ritualLocked) {
      anim = mov.moved ? "walk" : "idle";
      currentAnim = anim;
    }
    updateAvatarAnimation(localAvatar, anim, dt);

    sendAcc += dt;
    if (room && sendAcc > 0.08) {
      sendAcc = 0;
      room.send("move", {
        x: mov.x,
        z: mov.z,
        rotY: mov.rotY,
        anim: ritualLocked ? currentAnim : anim,
        force: !ritualLocked,
      });
      if (ritualLocked) {
        room.send("ritual", { anim: currentAnim, beadCount: rituals.beadCount });
      }
    }
  }

  for (const [, rec] of remoteAvatars) {
    rec.mesh.position.x += (rec.tx - rec.mesh.position.x) * Math.min(1, dt * 10);
    rec.mesh.position.z += (rec.tz - rec.mesh.position.z) * Math.min(1, dt * 10);
    // rot lerp
    let dy = rec.trot - rec.mesh.rotation.y;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    rec.mesh.rotation.y += dy * Math.min(1, dt * 10);
    updateAvatarAnimation(rec.mesh, rec.anim, dt);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
