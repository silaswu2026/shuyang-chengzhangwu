/* 方块小世界 mw3 · 昼夜、海河山、小船、火把、木剑石剑、金币、PeerJS 一起看见对方。没有怪物。 */
(function () {
  'use strict';

  var TIP = 'mw3';
  var STORE = 'xygo-my-world';
  var W = 40, H = 22, D = 40, SEA = 8, DAY = 72;
  var AIR = 0, GRASS = 1, DIRT = 2, LOG = 3, LEAF = 4, STONE = 5;
  var WATER = 6, SAND = 7, FLOWER = 8, GOLD = 9, TORCH = 10, CHEST = 11;
  var COL = {
    1: [0.36, 0.72, 0.32],
    2: [0.55, 0.36, 0.22],
    3: [0.52, 0.32, 0.14],
    4: [0.22, 0.62, 0.28],
    5: [0.55, 0.55, 0.58],
    6: [0.15, 0.42, 0.82],
    7: [0.84, 0.76, 0.46],
    8: [0.93, 0.45, 0.58],
    9: [0.86, 0.68, 0.18],
    10: [1, 0.86, 0.35],
    11: [0.72, 0.46, 0.16]
  };
  var SHADE = [1, 0.55, 0.82, 0.68, 0.9, 0.64];
  var FACES = [
    [0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
    [0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1],
    [0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0]
  ];
  var KID_NAMES = ['乐乐', '豆豆', '果果', '星星', '月月', '安安', '米米', '桃桃', '橙橙', '森森', '洋洋', '贝贝', '糖糖', '泡泡', '朵朵', '球球', '木木', '小河', '小船', '小金', '小山', '小树', '阳光', '棉花', '南瓜', '葡萄', '荔枝', '樱桃', '云朵', '海星', '贝壳', '松果'];
  var INV_KEYS = ['wood', 'leaf', 'dirt', 'stone', 'sand', 'torch', 'boat', 'swordWood', 'swordStone', 'armor', 'pick', 'gold'];
  var BAG_SHOW = [['wood', '木头'], ['leaf', '树叶'], ['dirt', '泥土'], ['stone', '石头'], ['sand', '沙子'], ['torch', '火把'], ['boat', '小船'], ['swordWood', '木剑'], ['swordStone', '石剑'], ['armor', '叶衣'], ['pick', '石稿']];
  var NAMES = { wood: '木头', leaf: '树叶', dirt: '泥土', stone: '石头', sand: '沙子', torch: '火把', boat: '小船', swordWood: '木剑', swordStone: '石剑', armor: '叶衣', pick: '石稿', gold: '金币' };
  var RECIPES = {
    torch: { cost: { wood: 1 }, give: 'torch', n: 1, say: '火把' },
    boat: { cost: { wood: 5 }, give: 'boat', n: 1, say: '小船' },
    swordWood: { cost: { wood: 3 }, give: 'swordWood', n: 1, say: '木剑', slot: 'weapon' },
    swordStone: { cost: { stone: 2, wood: 1 }, give: 'swordStone', n: 1, say: '石剑', slot: 'weapon' },
    armor: { cost: { leaf: 8 }, give: 'armor', n: 1, say: '叶衣', slot: 'armor' },
    pick: { cost: { stone: 3, wood: 1 }, give: 'pick', n: 1, say: '石稿', slot: 'tool' },
    sell: { cost: { wood: 1 }, give: 'gold', n: 1, say: '金币' }
  };
  var SLOT_WORD = {
    weapon: { '': '武器 空', swordWood: '武器 木剑', swordStone: '武器 石剑' },
    armor: { '': '护甲 空', armor: '护甲 叶衣' },
    tool: { '': '工具 空', pick: '工具 石稿' }
  };
  var NET_PREFIX = 'xygo-mw';
  var NET_SLOTS = 8;
  var NET_PROBE_MS = 1500;
  var NET_FIND_MS = 75000;
  var NET_PEER_OPTS = {
    debug: 0,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' },
        { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' }
      ]
    }
  };

  var blocks = new Uint8Array(W * H * D);
  var worldSeed = 1;
  var spawn = { x: 20.5, y: 10, z: 20.5 };
  var boats = [];
  var torchCells = [];
  var state = {
    px: 20.5, py: 10, pz: 20.5, yaw: 0.4, pitch: 0, vy: 0,
    onGround: false, started: false, ride: -1, hold: 'hand', clock: 0,
    gotHost: false,
    name: KID_NAMES[(Math.random() * KID_NAMES.length) | 0],
    inv: blankInv(),
    equip: { weapon: '', armor: '', tool: '' }
  };
  var keys = {};
  var joyX = 0, joyY = 0, punching = false, jumping = false, pointerPunch = false;
  var breakAcc = 0, breakKey = '';
  var dirty = true;
  var toastUntil = 0;
  var saveAcc = 0;
  var toldWater = false;
  var home = null;
  var lockHome = false;
  var gl, prog, buf, vbo, loc, lineBuf, lineN = 0, dynBuf, litTorch = false;
  var torchU = new Float32Array(24);

  var selfId = 'p' + Math.random().toString(36).slice(2, 8);
  var netRole = null;
  var netPeer = null;
  var netConn = null;
  var peerConns = [];
  var netLinked = false;
  var bcLinked = false;
  var netAbort = false;
  var netSession = '';
  var linkedSession = '';
  var netCode = '';
  var netAcc = 0;
  var bcPulse = null;
  var remotes = {};
  var netBC = null;
  function openBC() {
    if (netBC || typeof document === 'undefined' || typeof BroadcastChannel === 'undefined') return;
    try {
      netBC = new BroadcastChannel('xygo-my-world-mw3');
      netBC.onmessage = function (ev) { onNet(ev && ev.data, 'bc', null); };
    } catch (eBc) { netBC = null; }
  }

  function blankInv() {
    return { wood: 0, leaf: 0, dirt: 0, stone: 0, sand: 0, torch: 0, boat: 0, swordWood: 0, swordStone: 0, armor: 0, pick: 0, gold: 0 };
  }
  function $(id) {
    return (typeof document !== 'undefined') ? document.getElementById(id) : null;
  }
  function hash2(x, z, salt) {
    var n = Math.imul(x | 0, 374761393) ^ Math.imul(z | 0, 668265263) ^ Math.imul(salt | 0, 1442695041) ^ Math.imul(worldSeed | 0, 1274126177);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  function smoothstep(t) {
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    return t * t * (3 - 2 * t);
  }
  function vnoise(x, z, salt) {
    var x0 = Math.floor(x), z0 = Math.floor(z);
    var fx = smoothstep(x - x0), fz = smoothstep(z - z0);
    var v00 = hash2(x0, z0, salt);
    var v10 = hash2(x0 + 1, z0, salt);
    var v01 = hash2(x0, z0 + 1, salt);
    var v11 = hash2(x0 + 1, z0 + 1, salt);
    return v00 * (1 - fx) * (1 - fz) + v10 * fx * (1 - fz) + v01 * (1 - fx) * fz + v11 * fx * fz;
  }
  function riverZ(x) {
    return 18 + Math.sin(x * 0.23 + (worldSeed % 7)) * 4.5;
  }
  function heightAt(x, z) {
    var n1 = vnoise(x * 0.08, z * 0.08, 1);
    var n2 = vnoise(x * 0.18 + 3.2, z * 0.18, 2);
    var n = n1 * 0.72 + n2 * 0.28;
    var shore = smoothstep((x - 3) / 11);
    var h = (3 + n1 * 1.5) * (1 - shore) + (7 + n * 12) * shore;
    if (x >= 30) {
      var ridge = 11 + (x - 30) * 0.55 + n * 4;
      if (h < ridge) h = ridge;
    }
    var dist = Math.abs(z - riverZ(x));
    if (x > 8 && dist < 3.4) h = h * (1 - smoothstep((3.4 - dist) / 3.4)) + 4.1 * smoothstep((3.4 - dist) / 3.4);
    h = Math.round(h);
    if (h < 2) h = 2;
    if (h > H - 6) h = H - 6;
    return h;
  }
  function at(x, y, z) {
    x |= 0; y |= 0; z |= 0;
    if (x < 0 || y < 0 || z < 0 || x >= W || y >= H || z >= D) return AIR;
    return blocks[(y * D + z) * W + x];
  }
  function put(x, y, z, id) {
    x |= 0; y |= 0; z |= 0;
    if (x < 0 || y < 0 || z < 0 || x >= W || y >= H || z >= D) return;
    blocks[(y * D + z) * W + x] = id;
  }
  function solid(x, y, z) {
    x |= 0; y |= 0; z |= 0;
    if (x < 0 || y < 0 || z < 0 || x >= W || y >= H || z >= D) return true;
    var id = at(x, y, z);
    return id !== AIR && id !== LEAF && id !== FLOWER && id !== WATER && id !== TORCH;
  }
  function countId(id) {
    var n = 0, i;
    for (i = 0; i < blocks.length; i++) if (blocks[i] === id) n++;
    return n;
  }
  function placeTree(x, z, h) {
    put(x, h + 1, z, LOG);
    put(x, h + 2, z, LOG);
    put(x, h + 3, z, LOG);
    var y, dx, dz;
    for (y = h + 3; y <= h + 4; y++) {
      for (dx = -1; dx <= 1; dx++) {
        for (dz = -1; dz <= 1; dz++) {
          if (dx === 0 && dz === 0 && y === h + 3) continue;
          if (Math.abs(dx) + Math.abs(dz) > 2) continue;
          if (at(x + dx, y, z + dz) === AIR) put(x + dx, y, z + dz, LEAF);
        }
      }
    }
  }
  function ensureChests() {
    var n = countId(CHEST);
    if (n >= 2) return;
    var sx = spawn.x | 0, sz = spawn.z | 0, dx, dz, y, x, z;
    for (dz = -4; dz <= 4 && n < 2; dz++) {
      for (dx = -4; dx <= 4 && n < 2; dx++) {
        if (!dx && !dz) continue;
        x = sx + dx; z = sz + dz;
        for (y = SEA + 1; y <= SEA + 3; y++) {
          if (at(x, y, z) === GRASS && at(x, y + 1, z) === AIR) {
            put(x, y + 1, z, CHEST);
            n++;
            break;
          }
        }
      }
    }
  }
  function findSpawn() {
    var x, z, y;
    for (x = 14; x < 30; x++) {
      for (z = 6; z < 34; z++) {
        if (Math.abs(z - riverZ(x)) < 5) continue;
        for (y = SEA + 1; y <= SEA + 3; y++) {
          if (at(x, y, z) === GRASS && at(x, y + 1, z) === AIR && at(x, y + 2, z) === AIR) {
            return { x: x + 0.5, y: y + 1, z: z + 0.5 };
          }
        }
      }
    }
    return { x: 22.5, y: SEA + 3, z: 12.5 };
  }
  function grow(seed, keepPos) {
    worldSeed = (seed >>> 0) || 1;
    blocks = new Uint8Array(W * H * D);
    var x, z, y, h, id, topId;
    for (z = 0; z < D; z++) {
      for (x = 0; x < W; x++) {
        h = heightAt(x, z);
        topId = GRASS;
        if (h >= SEA + 6) topId = STONE;
        else if (h <= SEA) topId = SAND;
        for (y = 0; y <= h; y++) {
          id = STONE;
          if (topId === GRASS) {
            if (y === h) id = GRASS;
            else if (y >= h - 2) id = DIRT;
          } else if (topId === SAND) {
            if (y >= h - 1) id = SAND;
          }
          if (id === STONE && y > 0 && y <= 5 && y < h && hash2(x + y * 17, z + y * 3, 4) < 0.04) id = GOLD;
          put(x, y, z, id);
        }
        if (h < SEA) {
          for (y = h + 1; y < SEA; y++) put(x, y, z, WATER);
        }
        if (topId === GRASS && h < SEA + 5 && h + 4 < H && Math.abs(z - riverZ(x)) > 4.5 && hash2(x, z, 9) < 0.04) {
          placeTree(x, z, h);
        } else if (topId === GRASS && hash2(x, z, 10) < 0.1 && at(x, h + 1, z) === AIR) {
          put(x, h + 1, z, FLOWER);
        } else if (topId === GRASS && hash2(x, z, 11) < 0.02 && at(x, h + 1, z) === AIR) {
          put(x, h + 1, z, CHEST);
        }
      }
    }
    spawn = findSpawn();
    ensureChests();
    if (!keepPos) {
      boats.splice(0, boats.length);
      state.px = spawn.x;
      state.py = spawn.y;
      state.pz = spawn.z;
      state.vy = 0;
      state.ride = -1;
    }
    dirty = true;
  }
  function newSeed() {
    return ((Math.random() * 0x7fffffff) ^ (Date.now() & 0xffff)) >>> 0 || 1;
  }
  function applyEdits(edits) {
    (edits || []).forEach(function (row) {
      var p = String(row).split(',');
      if (p.length < 4) return;
      var id = +p[3];
      if (id < 0 || id > CHEST) return;
      put(+p[0], +p[1], +p[2], id);
    });
    dirty = true;
  }
  function collectEdits() {
    var keep = blocks;
    var saved = { px: state.px, py: state.py, pz: state.pz, ride: state.ride };
    grow(worldSeed, true);
    var fresh = blocks;
    blocks = keep;
    state.px = saved.px;
    state.py = saved.py;
    state.pz = saved.pz;
    state.ride = saved.ride;
    var edits = [];
    var i, y, rem, z, x;
    for (i = 0; i < keep.length; i++) {
      if (keep[i] !== fresh[i]) {
        y = (i / (W * D)) | 0;
        rem = i - y * W * D;
        z = (rem / W) | 0;
        x = rem - z * W;
        edits.push(x + ',' + y + ',' + z + ',' + keep[i]);
      }
    }
    dirty = true;
    return edits;
  }
  function copyNum(src, key, into) {
    if (src && isFinite(src[key]) && src[key] > 0) into[key] = src[key] | 0;
  }
  function loadRaw(raw) {
    var carried = blankInv();
    var fresh = !raw || raw.v !== 3 || !raw.seed;
    if (raw && raw.inv) INV_KEYS.forEach(function (k) { copyNum(raw.inv, k, carried); });
    if (!(carried.wood > 0) && raw && isFinite(raw.wood) && raw.wood > 0) carried.wood = raw.wood | 0;
    if (fresh) {
      grow(newSeed(), false);
      ['wood', 'leaf', 'dirt', 'stone'].forEach(function (k) { if (carried[k] > 0) state.inv[k] = carried[k]; });
      return;
    }
    grow(raw.seed, true);
    applyEdits(raw.edits);
    boats.splice(0, boats.length);
    (raw.boats || []).forEach(function (b) {
      if (b && b.length >= 2 && isFinite(+b[0]) && isFinite(+b[1])) boats.push({ x: +b[0], z: +b[1] });
    });
    state.inv = blankInv();
    INV_KEYS.forEach(function (k) { if (carried[k] > 0) state.inv[k] = carried[k]; });
    state.equip.weapon = raw.equip && SLOT_WORD.weapon[raw.equip.weapon] ? raw.equip.weapon : '';
    state.equip.armor = raw.equip && raw.equip.armor === 'armor' ? 'armor' : '';
    state.equip.tool = raw.equip && raw.equip.tool === 'pick' ? 'pick' : '';
    if (state.equip.weapon && !state.inv[state.equip.weapon]) state.equip.weapon = '';
    if (state.equip.armor && !state.inv.armor) state.equip.armor = '';
    if (state.equip.tool && !state.inv.pick) state.equip.tool = '';
    if (raw.hold === 'torch' || raw.hold === 'boat' || raw.hold === 'hand') state.hold = raw.hold;
    if (raw.name) state.name = cleanName(raw.name);
    if (isFinite(raw.clock) && raw.clock >= 0) state.clock = raw.clock % (DAY * 20);
    if (isFinite(raw.yaw)) state.yaw = raw.yaw;
    if (isFinite(raw.pitch)) state.pitch = Math.max(-1.2, Math.min(1.2, raw.pitch));
    if (isFinite(raw.px) && isFinite(raw.py) && isFinite(raw.pz)) {
      state.px = raw.px; state.py = raw.py; state.pz = raw.pz;
    } else {
      state.px = spawn.x; state.py = spawn.y; state.pz = spawn.z;
    }
    var guard = 0;
    while (overlaps(state.px, state.py, state.pz) && guard++ < 8) state.py += 0.5;
  }
  function load() {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { raw = null; }
    loadRaw(raw);
  }
  function snapshotHome() {
    home = {
      seed: worldSeed,
      edits: collectEdits(),
      boats: boats.map(function (b) { return { x: b.x, z: b.z }; }),
      px: state.px, py: state.py, pz: state.pz,
      yaw: state.yaw, pitch: state.pitch, clock: state.clock
    };
  }
  function save() {
    if (typeof localStorage === 'undefined') return;
    var body = {
      v: 3, tip: TIP,
      inv: {},
      equip: { weapon: state.equip.weapon, armor: state.equip.armor, tool: state.equip.tool },
      hold: state.hold, name: state.name, yaw: state.yaw, pitch: state.pitch
    };
    INV_KEYS.forEach(function (k) { body.inv[k] = state.inv[k] | 0; });
    if (lockHome && home) {
      body.seed = home.seed;
      body.edits = home.edits;
      body.boats = home.boats.map(function (b) { return [Math.round(b.x * 10) / 10, Math.round(b.z * 10) / 10]; });
      body.px = home.px; body.py = home.py; body.pz = home.pz;
      body.clock = home.clock; body.yaw = home.yaw; body.pitch = home.pitch;
    } else {
      body.seed = worldSeed;
      body.edits = collectEdits();
      body.boats = boats.map(function (b) { return [Math.round(b.x * 10) / 10, Math.round(b.z * 10) / 10]; });
      body.px = state.px; body.py = state.py; body.pz = state.pz;
      body.clock = state.clock;
    }
    try { localStorage.setItem(STORE, JSON.stringify(body)); } catch (e) {}
  }

  function overlaps(px, py, pz) {
    var x0 = Math.floor(px - 0.28), x1 = Math.floor(px + 0.28 - 1e-4);
    var y0 = Math.floor(py + 0.001), y1 = Math.floor(py + 1.6 - 0.001);
    var z0 = Math.floor(pz - 0.28), z1 = Math.floor(pz + 0.28 - 1e-4);
    var x, y, z;
    for (y = y0; y <= y1; y++) {
      for (z = z0; z <= z1; z++) {
        for (x = x0; x <= x1; x++) if (solid(x, y, z)) return true;
      }
    }
    return false;
  }
  function moveAxis(dx, dy, dz) {
    if (dx) {
      state.px += dx;
      if (overlaps(state.px, state.py, state.pz)) state.px -= dx;
    }
    if (dz) {
      state.pz += dz;
      if (overlaps(state.px, state.py, state.pz)) state.pz -= dz;
    }
    if (dy) {
      var steps = Math.max(1, Math.ceil(Math.abs(dy) / 0.15));
      var step = dy / steps;
      var hit = false;
      var i;
      for (i = 0; i < steps; i++) {
        state.py += step;
        if (overlaps(state.px, state.py, state.pz)) {
          state.py -= step;
          hit = true;
          break;
        }
      }
      if (hit) {
        state.onGround = dy < 0;
        state.vy = 0;
      } else {
        state.onGround = dy < 0 && overlaps(state.px, state.py - 0.06, state.pz);
        if (state.onGround) state.vy = 0;
      }
    }
  }
  function look() {
    var cp = Math.cos(state.pitch);
    return [Math.sin(state.yaw) * cp, Math.sin(state.pitch), -Math.cos(state.yaw) * cp];
  }
  function ray(maxDist, skipWater) {
    var oY = state.py + 1.5;
    var d = look();
    var dx = d[0], dy = d[1], dz = d[2];
    var len = Math.hypot(dx, dy, dz) || 1;
    dx /= len; dy /= len; dz /= len;
    var x = Math.floor(state.px), y = Math.floor(oY), z = Math.floor(state.pz);
    var prevX = x, prevY = y, prevZ = z;
    var stepX = dx < 0 ? -1 : 1, stepY = dy < 0 ? -1 : 1, stepZ = dz < 0 ? -1 : 1;
    var tdx = dx === 0 ? 1e9 : Math.abs(1 / dx);
    var tdy = dy === 0 ? 1e9 : Math.abs(1 / dy);
    var tdz = dz === 0 ? 1e9 : Math.abs(1 / dz);
    var tmaxX = dx === 0 ? 1e9 : (dx > 0 ? (x + 1 - state.px) : (state.px - x)) * tdx;
    var tmaxY = dy === 0 ? 1e9 : (dy > 0 ? (y + 1 - oY) : (oY - y)) * tdy;
    var tmaxZ = dz === 0 ? 1e9 : (dz > 0 ? (z + 1 - state.pz) : (state.pz - z)) * tdz;
    var dist = 0;
    var i, id;
    for (i = 0; i < 64; i++) {
      id = at(x, y, z);
      if (id !== AIR && !(skipWater && id === WATER)) {
        return { x: x, y: y, z: z, id: id, dist: dist, px: prevX, py: prevY, pz: prevZ };
      }
      prevX = x; prevY = y; prevZ = z;
      if (tmaxX < tmaxY && tmaxX < tmaxZ) {
        if (tmaxX > maxDist) return null;
        x += stepX; dist = tmaxX; tmaxX += tdx;
      } else if (tmaxY < tmaxZ) {
        if (tmaxY > maxDist) return null;
        y += stepY; dist = tmaxY; tmaxY += tdy;
      } else {
        if (tmaxZ > maxDist) return null;
        z += stepZ; dist = tmaxZ; tmaxZ += tdz;
      }
    }
    return null;
  }
  function firstWater(maxDist) {
    var oY = state.py + 1.5;
    var d = look();
    var len = Math.hypot(d[0], d[1], d[2]) || 1;
    var dx = d[0] / len, dy = d[1] / len, dz = d[2] / len;
    var t, x, y, z;
    for (t = 0.15; t <= maxDist; t += 0.25) {
      x = Math.floor(state.px + dx * t);
      y = Math.floor(oY + dy * t);
      z = Math.floor(state.pz + dz * t);
      if (at(x, y, z) === WATER) return { x: x, y: y, z: z };
    }
    return null;
  }
  function breakTime(id) {
    var t = 0.35;
    if (id === LEAF || id === FLOWER || id === TORCH) t = 0.16;
    else if (id === STONE || id === GOLD) t = 0.62;
    else if (id === CHEST) t = 0.4;
    if ((id === STONE || id === GOLD) && state.equip.tool === 'pick') t = 0.28;
    return t;
  }
  function dropOf(id) {
    if (id === LOG) return 'wood';
    if (id === LEAF) return 'leaf';
    if (id === GRASS || id === DIRT) return 'dirt';
    if (id === STONE) return 'stone';
    if (id === SAND) return 'sand';
    if (id === TORCH) return 'torch';
    return null;
  }
  function cleanName(s) {
    s = String(s || '').replace(/\s+/g, '').slice(0, 8);
    return s || '朋友';
  }
  function toast(text) {
    var el = $('toast');
    if (!el) return;
    el.textContent = text;
    toastUntil = Date.now() + 1400;
  }
  function renderHud() {
    var el = $('bag');
    if (el) {
      var bits = [];
      BAG_SHOW.forEach(function (pair, idx) {
        var n = state.inv[pair[0]] | 0;
        if (idx < 4 || n > 0) bits.push('<span>' + pair[1] + ' ' + n + '</span>');
      });
      el.innerHTML = bits.join('');
    }
    var coins = $('coins');
    if (coins) coins.textContent = '金币 ' + (state.inv.gold | 0);
    var w = $('slotWeapon'), a = $('slotArmor'), t = $('slotTool');
    if (w) w.textContent = SLOT_WORD.weapon[state.equip.weapon] || '武器 空';
    if (a) a.textContent = SLOT_WORD.armor[state.equip.armor] || '护甲 空';
    if (t) t.textContent = SLOT_WORD.tool[state.equip.tool] || '工具 空';
    var holdBtns = typeof document !== 'undefined' ? document.querySelectorAll('#hold button') : [];
    var i;
    for (i = 0; i < holdBtns.length; i++) holdBtns[i].classList.toggle('on', holdBtns[i].getAttribute('data-hold') === state.hold);
    var nameLabel = $('nameLabel');
    if (nameLabel && !state.started) nameLabel.textContent = state.name;
    setNetStatus();
  }
  function craft(name) {
    var r = RECIPES[name];
    if (!r) return false;
    var k;
    for (k in r.cost) if ((state.inv[k] | 0) < r.cost[k]) { toast('小宇：材料不够'); return false; }
    for (k in r.cost) state.inv[k] -= r.cost[k];
    state.inv[r.give] = (state.inv[r.give] | 0) + r.n;
    if (r.slot && !state.equip[r.slot]) state.equip[r.slot] = r.give;
    save();
    renderHud();
    toast(name === 'sell' ? '卖掉了，得到金币' : ('做成了' + r.say));
    return true;
  }
  function cycleSlot(slot) {
    var opts = [''];
    if (slot === 'weapon') {
      if (state.inv.swordWood) opts.push('swordWood');
      if (state.inv.swordStone) opts.push('swordStone');
    } else if (slot === 'armor') {
      if (state.inv.armor) opts.push('armor');
    } else if (slot === 'tool') {
      if (state.inv.pick) opts.push('pick');
    }
    if (opts.length === 1) {
      toast(slot === 'weapon' ? '小宇：用 3 个木头做木剑' : slot === 'armor' ? '小宇：用 8 片树叶做叶衣' : '小宇：用石头和木头做石稿');
      return;
    }
    var cur = state.equip[slot] || '';
    var i = opts.indexOf(cur);
    state.equip[slot] = opts[(i + 1) % opts.length];
    save();
    renderHud();
  }
  function localSet(x, y, z, id) {
    put(x, y, z, id);
    dirty = true;
    emit({ t: 'set', x: x | 0, y: y | 0, z: z | 0, id: id | 0 });
  }
  function breakBlock(hit) {
    if (!hit) return;
    var id = at(hit.x, hit.y, hit.z);
    if (!id || id === WATER) return;
    localSet(hit.x, hit.y, hit.z, AIR);
    if (id === GOLD) { state.inv.gold = (state.inv.gold | 0) + 2; toast('得到 2 枚金币'); }
    else if (id === CHEST) { state.inv.gold = (state.inv.gold | 0) + 5; toast('箱子里有 5 枚金币'); }
    else if (id === FLOWER) toast('一朵小花');
    else {
      var drop = dropOf(id);
      if (drop) {
        state.inv[drop] = (state.inv[drop] | 0) + 1;
        toast('得到' + (NAMES[drop] || ''));
      }
    }
    save();
    renderHud();
  }
  function placeTorchAt(x, y, z) {
    x |= 0; y |= 0; z |= 0;
    if ((state.inv.torch | 0) < 1) return false;
    if (at(x, y, z) !== AIR) return false;
    if (countId(TORCH) >= 32) return false;
    state.inv.torch--;
    localSet(x, y, z, TORCH);
    save();
    renderHud();
    return true;
  }
  function placeTorch() {
    if ((state.inv.torch | 0) < 1) { toast('小宇：做火把要 1 个木头'); return false; }
    if (countId(TORCH) >= 32) { toast('小宇：火把够多了'); return false; }
    var hit = ray(4.5, true);
    if (!hit) { toast('小宇：对准要插的方块'); return false; }
    var x = hit.px, y = hit.py, z = hit.pz;
    if (at(x, y, z) !== AIR) { toast('小宇：这里放不下'); return false; }
    if (Math.abs(x + 0.5 - state.px) < 0.55 && Math.abs(z + 0.5 - state.pz) < 0.55 && y >= state.py - 0.1 && y <= state.py + 1.7) {
      toast('小宇：离你太近啦');
      return false;
    }
    if (!placeTorchAt(x, y, z)) return false;
    toast('火把亮了');
    return true;
  }
  function addBoat(x, z, fromNet, fromConn) {
    x = Math.floor(x) + 0.5;
    z = Math.floor(z) + 0.5;
    var ix = Math.floor(x), iz = Math.floor(z);
    if (at(ix, SEA - 1, iz) !== WATER) return false;
    var i;
    for (i = 0; i < boats.length; i++) {
      if (Math.abs(boats[i].x - x) < 0.8 && Math.abs(boats[i].z - z) < 0.8) return false;
    }
    if (boats.length >= 8) return false;
    boats.push({ x: x, z: z });
    var msg = { t: 'boat', x: x, z: z, from: (fromNet && fromConn && fromConn._xyFrom) || selfId };
    if (!fromNet) emit({ t: 'boat', x: x, z: z });
    else if (netRole === 'host') relay(msg, fromConn);
    return true;
  }
  function placeBoatAimed() {
    if ((state.inv.boat | 0) < 1) { toast('小宇：做一条小船要 5 个木头'); return false; }
    var cell = firstWater(6);
    if (!cell && state.pitch < -0.35 && at(state.px | 0, SEA - 1, state.pz | 0) === WATER) {
      cell = { x: state.px | 0, y: SEA - 1, z: state.pz | 0 };
    }
    if (!cell) { toast('小宇：把准星对准水'); return false; }
    if (!addBoat(cell.x + 0.5, cell.z + 0.5, false, null)) { toast('小宇：这里停不了船'); return false; }
    state.inv.boat--;
    save();
    renderHud();
    toast('小船放下了');
    return true;
  }
  function tryPlace() {
    if (state.hold === 'torch') return placeTorch();
    if (state.hold === 'boat') return placeBoatAimed();
    toast('小宇：先点右边的火把或船');
    return false;
  }
  function nearestBoat(dist) {
    var best = -1, bestD = dist || 1.6, i, d;
    for (i = 0; i < boats.length; i++) {
      d = Math.hypot(boats[i].x - state.px, boats[i].z - state.pz);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }
  function toggleRide() {
    if (state.ride >= 0) {
      state.ride = -1;
      state.py += 0.2;
      toast('下船了');
      return;
    }
    var i = nearestBoat(1.7);
    if (i < 0) { toast('小宇：身边没有小船'); return; }
    state.ride = i;
    state.px = boats[i].x;
    state.pz = boats[i].z;
    state.py = SEA - 0.15;
    state.vy = 0;
    toast('上船了。小船开在水上。');
  }
  function inWaterAt(px, py, pz) {
    return at(px, py + 0.35, pz) === WATER || at(px, py + 1.05, pz) === WATER;
  }
  function craftOpen() {
    var el = $('craft');
    return !!(el && !el.hidden);
  }
  function setBar(on, pct) {
    var bar = $('bar'), fill = $('barFill');
    if (!bar || !fill) return;
    bar.className = on ? 'on' : '';
    if (on) fill.style.width = Math.min(100, pct) + '%';
  }
  function doPunch(dt) {
    var hit = punching ? ray(4.5, true) : null;
    var key = hit ? hit.x + ',' + hit.y + ',' + hit.z : '';
    if (hit && hit.id !== WATER) {
      if (key !== breakKey) { breakKey = key; breakAcc = 0; }
      breakAcc += dt;
      var need = breakTime(hit.id);
      setBar(true, breakAcc / need * 100);
      if (breakAcc >= need) { breakAcc = 0; breakBlock(hit); }
    } else {
      breakAcc = 0;
      breakKey = '';
      setBar(false, 0);
    }
  }
  function stickInput() {
    var forward = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) + joyY;
    var strafe = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + joyX;
    if (forward > 1) forward = 1;
    if (forward < -1) forward = -1;
    if (strafe > 1) strafe = 1;
    if (strafe < -1) strafe = -1;
    return { forward: forward, strafe: strafe };
  }
  function trySlideBoat(b, dx, dz) {
    function ok(nx, nz) {
      var x = Math.floor(nx), z = Math.floor(nz);
      if (at(x, SEA - 1, z) !== WATER) return false;
      if (overlaps(nx, SEA + 0.08, nz)) return false;
      return true;
    }
    if (ok(b.x + dx, b.z + dz)) { b.x += dx; b.z += dz; return; }
    if (ok(b.x + dx, b.z)) { b.x += dx; return; }
    if (ok(b.x, b.z + dz)) b.z += dz;
  }
  function sim(dt) {
    if (!state.started || craftOpen()) {
      if (toastUntil && Date.now() > toastUntil) { var t0 = $('toast'); if (t0) t0.textContent = ''; toastUntil = 0; }
      return;
    }
    state.clock += dt;
    var stick = stickInput();
    var mx = Math.sin(state.yaw), mz = -Math.cos(state.yaw);
    var rx = Math.cos(state.yaw), rz = Math.sin(state.yaw);
    var jump = jumping || !!keys.Space;
    if (state.ride >= 0) {
      var b = boats[state.ride];
      if (!b) state.ride = -1;
      else {
        var spd = 6.4 * dt;
        trySlideBoat(b, (mx * stick.forward + rx * stick.strafe) * spd, (mz * stick.forward + rz * stick.strafe) * spd);
        state.px = b.x; state.pz = b.z; state.py = SEA + 0.08; state.vy = 0; state.onGround = true;
        doPunch(dt);
        afterSim(dt);
        return;
      }
    }
    var wet = inWaterAt(state.px, state.py, state.pz);
    if (wet && !toldWater) { toldWater = true; toast('小宇：按住跳，可以在水里往上游'); }
    var speed = (wet ? 2.5 : 4.4) * dt;
    moveAxis((mx * stick.forward + rx * stick.strafe) * speed, 0, (mz * stick.forward + rz * stick.strafe) * speed);
    if (wet) {
      var unstick = 0;
      while (overlaps(state.px, state.py, state.pz) && unstick++ < 12) state.py += 0.2;
      var target = SEA - 1.15;
      if (jump) state.vy = 4.6;
      else if (state.py < target - 0.05) state.vy = 3.8;
      else if (state.py > target + 0.45) {
        state.vy -= 16 * dt;
        if (state.vy < -8) state.vy = -8;
      } else state.vy = 0;
      moveAxis(0, state.vy * dt, 0);
    } else {
      if (jump && state.onGround) { state.vy = 7.2; state.onGround = false; }
      state.vy -= 26 * dt;
      if (state.vy < -20) state.vy = -20;
      moveAxis(0, state.vy * dt, 0);
    }
    if (state.py < -2) {
      state.px = spawn.x; state.py = spawn.y; state.pz = spawn.z; state.vy = 0; state.ride = -1;
    }
    doPunch(dt);
    afterSim(dt);
  }
  function afterSim(dt) {
    var btn = $('ride');
    if (btn) {
      if (state.ride >= 0) { btn.hidden = false; btn.textContent = '下船'; }
      else {
        var near = nearestBoat(1.7);
        btn.hidden = near < 0;
        btn.textContent = '上船';
      }
    }
    if (toastUntil && Date.now() > toastUntil) {
      var t = $('toast');
      if (t) t.textContent = '';
      toastUntil = 0;
    }
    var id, r, now = Date.now();
    for (id in remotes) {
      r = remotes[id];
      if (now - r.seen > 4000) { delete remotes[id]; continue; }
      r.x += (r.tx - r.x) * 0.4;
      r.y += (r.ty - r.y) * 0.4;
      r.z += (r.tz - r.z) * 0.4;
    }
    saveAcc += dt;
    if (saveAcc > 4) { saveAcc = 0; save(); }
    netAcc += dt;
    if (netAcc >= 0.1) {
      netAcc = 0;
      if (netRole && (netRole === 'host' || state.gotHost) && netHot()) {
        emit({
          t: 'pos', name: state.name,
          x: Math.round(state.px * 100) / 100,
          y: Math.round(state.py * 100) / 100,
          z: Math.round(state.pz * 100) / 100,
          yaw: Math.round(state.yaw * 1000) / 1000,
          pitch: Math.round(state.pitch * 1000) / 1000,
          w: weaponCode(), host: netRole === 'host' ? 1 : 0, clock: state.clock
        });
      }
    }
  }
  function weaponCode() {
    if (state.equip.weapon === 'swordStone') return 2;
    if (state.equip.weapon === 'swordWood') return 1;
    return 0;
  }
  function sunElev() {
    return Math.sin((state.clock % DAY) / DAY * Math.PI * 2 + 0.9);
  }
  function dayFactor() {
    var d = sunElev() * 1.2 + 0.08;
    if (d < 0) d = 0;
    if (d > 1) d = 1;
    return d;
  }
  function skyRGB() {
    var d = dayFactor();
    return [0.04 + 0.49 * d, 0.07 + 0.67 * d, 0.16 + 0.76 * d];
  }

  function blocksFace(id, nid) {
    if (!nid) return false;
    if (id !== LEAF && nid === LEAF) return true;
    if (nid === FLOWER || nid === TORCH) return false;
    if (nid === WATER) return id === WATER;
    if (nid === LEAF) return id === LEAF;
    return true;
  }
  function pushCube(data, x, y, z, sx, sy, sz, rgb) {
    var f, v, face, s;
    for (f = 0; f < 6; f++) {
      face = FACES[f];
      s = SHADE[f];
      for (v = 0; v < 18; v += 3) {
        data.push(x + face[v] * sx, y + face[v + 1] * sy, z + face[v + 2] * sz, rgb[0] * s, rgb[1] * s, rgb[2] * s);
      }
    }
  }
  function buildMesh() {
    var data = [];
    torchCells = [];
    var x, y, z, id, rgb, f, face, s, v, nx, ny, nz, nid;
    for (y = 0; y < H; y++) {
      for (z = 0; z < D; z++) {
        for (x = 0; x < W; x++) {
          id = at(x, y, z);
          if (!id) continue;
          if (id === TORCH) {
            torchCells.push({ x: x + 0.5, y: y + 0.45, z: z + 0.5 });
            continue;
          }
          if (id === FLOWER) {
            rgb = [[0.93, 0.45, 0.58], [0.95, 0.82, 0.28], [0.95, 0.95, 0.98], [0.72, 0.45, 0.86]][(hash2(x, z, 21) * 4) | 0];
            pushCube(data, x + 0.35, y, z + 0.35, 0.3, 0.55, 0.3, rgb);
            continue;
          }
          rgb = COL[id] || [1, 1, 1];
          for (f = 0; f < 6; f++) {
            nx = f === 2 ? 1 : f === 3 ? -1 : 0;
            ny = f === 0 ? 1 : f === 1 ? -1 : 0;
            nz = f === 4 ? 1 : f === 5 ? -1 : 0;
            nid = at(x + nx, y + ny, z + nz);
            if (blocksFace(id, nid)) continue;
            face = FACES[f];
            s = SHADE[f];
            for (v = 0; v < 18; v += 3) {
              data.push(x + face[v], y + face[v + 1], z + face[v + 2], rgb[0] * s, rgb[1] * s, rgb[2] * s);
            }
          }
        }
      }
    }
    var arr = new Float32Array(data);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    vbo = arr.length / 6;
  }
  function outline(hit) {
    if (!hit || hit.id === WATER) { lineN = 0; return; }
    var x = hit.x, y = hit.y, z = hit.z, e = 0.01;
    var c = [
      [x - e, y - e, z - e], [x + 1 + e, y - e, z - e], [x + 1 + e, y + 1 + e, z - e], [x - e, y + 1 + e, z - e],
      [x - e, y - e, z + 1 + e], [x + 1 + e, y - e, z + 1 + e], [x + 1 + e, y + 1 + e, z + 1 + e], [x - e, y + 1 + e, z + 1 + e]
    ];
    var ejs = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    var data = [];
    ejs.forEach(function (p) {
      data.push(c[p[0]][0], c[p[0]][1], c[p[0]][2], 1, 0.88, 0.45);
      data.push(c[p[1]][0], c[p[1]][1], c[p[1]][2], 1, 0.88, 0.45);
    });
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
    lineN = 24;
  }
  function perspective(fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2);
    var nf = 1 / (near - far);
    var o = new Float32Array(16);
    o[0] = f / aspect; o[5] = f;
    o[10] = (far + near) * nf; o[11] = -1;
    o[14] = 2 * far * near * nf;
    return o;
  }
  function lookAt(ex, ey, ez, cx, cy, cz) {
    var zx = ex - cx, zy = ey - cy, zz = ez - cz;
    var len = Math.hypot(zx, zy, zz) || 1;
    zx /= len; zy /= len; zz /= len;
    var xx = zz, xy = 0, xz = -zx;
    len = Math.hypot(xx, xy, xz) || 1;
    xx /= len; xy /= len; xz /= len;
    var yx = zy * xz - zz * xy;
    var yy = zz * xx - zx * xz;
    var yz = zx * xy - zy * xx;
    var o = new Float32Array(16);
    o[0] = xx; o[1] = yx; o[2] = zx;
    o[4] = xy; o[5] = yy; o[6] = zy;
    o[8] = xz; o[9] = yz; o[10] = zz;
    o[12] = -(xx * ex + xy * ey + xz * ez);
    o[13] = -(yx * ex + yy * ey + yz * ez);
    o[14] = -(zx * ex + zy * ey + zz * ez);
    o[15] = 1;
    return o;
  }
  function mul(a, b) {
    var o = new Float32Array(16);
    var c, r;
    for (c = 0; c < 4; c++) {
      for (r = 0; r < 4; r++) {
        o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
      }
    }
    return o;
  }
  function cameraBasis() {
    var f = look();
    var rx = -f[2], ry = 0, rz = f[0];
    var rl = Math.hypot(rx, rz) || 1;
    rx /= rl; rz /= rl;
    var ux = -rz * f[1];
    var uy = rz * f[0] - rx * f[2];
    var uz = rx * f[1];
    return { right: [rx, ry, rz], up: [ux, uy, uz] };
  }
  function pushBoard(data, cx, cy, cz, size, rgb, right, up) {
    function corner(ix, iy) {
      return [
        cx + right[0] * size * ix + up[0] * size * iy,
        cy + right[1] * size * ix + up[1] * size * iy,
        cz + right[2] * size * ix + up[2] * size * iy
      ];
    }
    var a = corner(-1, -1), b = corner(1, -1), c = corner(1, 1), d = corner(-1, 1);
    [a, b, c, a, c, d].forEach(function (p) { data.push(p[0], p[1], p[2], rgb[0], rgb[1], rgb[2]); });
  }
  function fillTorches() {
    var i;
    for (i = 0; i < 8; i++) { torchU[i * 3] = 0; torchU[i * 3 + 1] = -40; torchU[i * 3 + 2] = 0; }
    if (!torchCells.length) return;
    var ranked = torchCells.map(function (t) {
      var dx = t.x - state.px, dy = t.y - (state.py + 1.2), dz = t.z - state.pz;
      return { t: t, d: dx * dx + dy * dy + dz * dz };
    });
    ranked.sort(function (a, b) { return a.d - b.d; });
    var n = ranked.length < 8 ? ranked.length : 8;
    for (i = 0; i < n; i++) {
      torchU[i * 3] = ranked[i].t.x;
      torchU[i * 3 + 1] = ranked[i].t.y;
      torchU[i * 3 + 2] = ranked[i].t.z;
    }
  }
  function colorOfName(name) {
    var cloth = [[0.18, 0.42, 0.78], [0.22, 0.62, 0.32], [0.78, 0.58, 0.16]];
    var h = 0, i;
    for (i = 0; i < name.length; i++) h = (h * 33 + name.charCodeAt(i)) >>> 0;
    return cloth[h % 3];
  }
  function pushAvatar(data, p) {
    var cloth = colorOfName(p.name || '朋友');
    var yaw = p.yaw || 0;
    var fx = Math.sin(yaw), fz = -Math.cos(yaw);
    pushCube(data, p.x - 0.22, p.y, p.z - 0.14, 0.44, 0.42, 0.28, [0.12, 0.16, 0.32]);
    pushCube(data, p.x - 0.26, p.y + 0.42, p.z - 0.16, 0.52, 0.48, 0.32, cloth);
    pushCube(data, p.x - 0.2, p.y + 0.92, p.z - 0.2, 0.4, 0.4, 0.4, [0.96, 0.84, 0.7]);
    pushCube(data, p.x - 0.2, p.y + 1.22, p.z - 0.2, 0.4, 0.12, 0.4, [0.28, 0.18, 0.1]);
    pushCube(data, p.x + fx * 0.24 - 0.05, p.y + 1.05, p.z + fz * 0.24 - 0.05, 0.1, 0.1, 0.1, [0.45, 0.24, 0.2]);
    if (p.w) {
      var rgb = p.w === 2 ? [0.75, 0.78, 0.84] : [0.62, 0.4, 0.16];
      pushCube(data, p.x + fx * 0.38 - 0.04, p.y + 0.45, p.z + fz * 0.38 - 0.04, 0.08, 0.72, 0.08, rgb);
    }
  }
  function drawDyn(data, uMin, uFog, uAmb) {
    if (!data.length || !gl) return;
    gl.uniform1f(loc.amb, uAmb);
    gl.uniform1f(loc.min, uMin);
    gl.uniform1f(loc.fog, uFog);
    gl.bindBuffer(gl.ARRAY_BUFFER, dynBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(loc.col, 3, gl.FLOAT, false, 24, 12);
    gl.drawArrays(gl.TRIANGLES, 0, data.length / 6);
  }
  function project(x, y, z, mvp, w, h) {
    var cx = mvp[0] * x + mvp[4] * y + mvp[8] * z + mvp[12];
    var cy = mvp[1] * x + mvp[5] * y + mvp[9] * z + mvp[13];
    var cw = mvp[3] * x + mvp[7] * y + mvp[11] * z + mvp[15];
    if (cw <= 0.08) return null;
    var nx = cx / cw, ny = cy / cw;
    if (nx < -1.2 || nx > 1.2 || ny < -1.2 || ny > 1.2) return null;
    return { x: (nx * 0.5 + 0.5) * w, y: (1 - (ny * 0.5 + 0.5)) * h };
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (ch) {
      if (ch === '&') return '&amp;';
      if (ch === '<') return '&lt;';
      if (ch === '>') return '&gt;';
      return '&quot;';
    });
  }
  function drawNames(mvp) {
    var box = $('names');
    if (!box) return;
    var w = gl.canvas.clientWidth, h = gl.canvas.clientHeight;
    var html = '', id, p, s;
    for (id in remotes) {
      p = remotes[id];
      s = project(p.x, p.y + 1.7, p.z, mvp, w, h);
      if (!s) continue;
      html += '<span style="left:' + s.x.toFixed(1) + 'px;top:' + s.y.toFixed(1) + 'px">' + esc(p.name) + '</span>';
    }
    if (box._html !== html) { box.innerHTML = html; box._html = html; }
  }
  function draw() {
    var canvas = gl.canvas;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var bw = Math.max(1, (canvas.clientWidth * dpr) | 0);
    var bh = Math.max(1, (canvas.clientHeight * dpr) | 0);
    if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
    gl.viewport(0, 0, canvas.width, canvas.height);
    var sky = skyRGB();
    var day = dayFactor();
    gl.clearColor(sky[0], sky[1], sky[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (dirty) { buildMesh(); dirty = false; }
    var dir = look();
    var eyeY = state.py + 1.5;
    var proj = perspective(70 * Math.PI / 180, canvas.width / Math.max(1, canvas.height), 0.08, 90);
    var view = lookAt(state.px, eyeY, state.pz, state.px + dir[0], eyeY + dir[1], state.pz + dir[2]);
    var mvp = mul(proj, view);
    gl.useProgram(prog);
    gl.uniformMatrix4fv(loc.mvp, false, mvp);
    gl.uniform3f(loc.eye, state.px, eyeY, state.pz);
    gl.uniform3f(loc.sky, sky[0], sky[1], sky[2]);
    if (litTorch && loc.torch) {
      fillTorches();
      gl.uniform3fv(loc.torch, torchU);
    }
    gl.enableVertexAttribArray(loc.pos);
    gl.enableVertexAttribArray(loc.col);
    var basis = cameraBasis();
    var ang = (state.clock % DAY) / DAY * Math.PI * 2 + 0.9;
    var elev = Math.sin(ang), az = Math.cos(ang);
    var skyData = [];
    var dist = 22;
    if (elev > -0.02) {
      pushBoard(skyData, state.px + az * dist, 7 + elev * 16, state.pz + az * 0.2, 2.3, [1, 0.84, 0.32], basis.right, basis.up);
    }
    if (elev < 0.35) {
      var me = -elev > 0.2 ? -elev : 0.2;
      pushBoard(skyData, state.px - az * dist, 7 + me * 16, state.pz - 2, 1.35, [0.9, 0.93, 1], basis.right, basis.up);
    }
    if (day < 0.55) {
      var si;
      for (si = 0; si < 12; si++) {
        var a = hash2(si * 5, 2, 99) * Math.PI * 2;
        var e = 0.25 + hash2(si, 7, 99) * 0.7;
        pushBoard(skyData, state.px + Math.cos(a) * dist, 9 + e * 11, state.pz + Math.sin(a) * dist, 0.16, [1, 1, 0.92], basis.right, basis.up);
      }
    }
    gl.depthMask(false);
    gl.disable(gl.DEPTH_TEST);
    drawDyn(skyData, 1.25, 0, 1);
    gl.depthMask(true);
    gl.enable(gl.DEPTH_TEST);
    gl.uniform1f(loc.amb, 0.18 + 0.82 * day);
    gl.uniform1f(loc.min, 0);
    gl.uniform1f(loc.fog, 1 - day);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(loc.col, 3, gl.FLOAT, false, 24, 12);
    gl.drawArrays(gl.TRIANGLES, 0, vbo);
    var actors = [], bright = [], id, t;
    for (t = 0; t < torchCells.length; t++) {
      var tc = torchCells[t];
      pushCube(bright, tc.x - 0.07, tc.y - 0.28, tc.z - 0.07, 0.14, 0.4, 0.14, [0.45, 0.28, 0.12]);
      pushCube(bright, tc.x - 0.12, tc.y + 0.08, tc.z - 0.12, 0.24, 0.24, 0.24, [1, 0.78, 0.25]);
    }
    var bi;
    for (bi = 0; bi < boats.length; bi++) {
      var b = boats[bi];
      var by = SEA + 0.04;
      pushCube(actors, b.x - 0.5, by, b.z - 0.8, 1.0, 0.26, 1.6, [0.5, 0.3, 0.12]);
      pushCube(actors, b.x - 0.06, by + 0.26, b.z - 0.06, 0.12, 0.7, 0.12, [0.55, 0.36, 0.16]);
      pushCube(actors, b.x - 0.02, by + 0.52, b.z - 0.28, 0.05, 0.4, 0.5, [0.94, 0.9, 0.78]);
    }
    for (id in remotes) pushAvatar(actors, remotes[id]);
    if (state.started && weaponCode()) {
      var handRgb = weaponCode() === 2 ? [0.78, 0.8, 0.86] : [0.64, 0.4, 0.16];
      var hx = state.px + dir[0] * 0.95 + basis.right[0] * 0.42;
      var hy = eyeY + dir[1] * 0.95 - 0.48;
      var hz = state.pz + dir[2] * 0.95 + basis.right[2] * 0.42;
      pushCube(actors, hx - 0.03, hy, hz - 0.03, 0.06, 0.34, 0.06, handRgb);
      pushCube(actors, hx - 0.07, hy - 0.05, hz - 0.045, 0.14, 0.05, 0.09, [0.42, 0.26, 0.12]);
    }
    drawDyn(bright, 1.3, 1 - day, 1);
    drawDyn(actors, 0.72, 1 - day, 0.18 + 0.82 * day);
    var hit = state.started ? ray(4.5, true) : null;
    outline(hit);
    if (lineN) {
      gl.uniform1f(loc.amb, 1);
      gl.uniform1f(loc.min, 1);
      gl.uniform1f(loc.fog, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
      gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, 24, 0);
      gl.vertexAttribPointer(loc.col, 3, gl.FLOAT, false, 24, 12);
      gl.drawArrays(gl.LINES, 0, lineN);
    }
    drawNames(mvp);
    setNetStatus();
  }

  function bootGL() {
    var canvas = $('view');
    if (!canvas) return false;
    gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: true });
    if (!gl) {
      var hint = $('hint');
      if (hint) hint.textContent = '小宇：这台浏览器开不了画面。请换 Safari 或 Chrome。';
      return false;
    }
    var vs = 'attribute vec3 aPos;attribute vec3 aCol;uniform mat4 uMvp;varying vec3 vCol;varying vec3 vWorld;void main(){vCol=aCol;vWorld=aPos;gl_Position=uMvp*vec4(aPos,1.0);}';
    var fsLit = 'precision mediump float;varying vec3 vCol;varying vec3 vWorld;uniform float uAmb;uniform float uMin;uniform vec3 uEye;uniform vec3 uSky;uniform float uFog;uniform vec3 uTorch[8];void main(){float light=uAmb;for(int i=0;i<8;i++){vec3 d=vWorld-uTorch[i];float dist=sqrt(d.x*d.x+d.y*d.y+d.z*d.z);light+=clamp(1.0-dist/6.5,0.0,1.0)*0.85;}light=min(max(light,uMin),1.35);vec3 col=vCol*light;float distC=distance(vWorld,uEye);float fogStart=mix(24.0,7.0,uFog);float fogEnd=mix(62.0,20.0,uFog);float f=clamp((distC-fogStart)/(fogEnd-fogStart),0.0,1.0);gl_FragColor=vec4(mix(col,uSky,f),1.0);}';
    var fsSimple = 'precision mediump float;varying vec3 vCol;varying vec3 vWorld;uniform float uAmb;uniform float uMin;uniform vec3 uEye;uniform vec3 uSky;uniform float uFog;void main(){float light=min(max(uAmb,uMin),1.35);vec3 col=vCol*light;float distC=distance(vWorld,uEye);float fogStart=mix(24.0,7.0,uFog);float fogEnd=mix(62.0,20.0,uFog);float f=clamp((distC-fogStart)/(fogEnd-fogStart),0.0,1.0);gl_FragColor=vec4(mix(col,uSky,f),1.0);}';
    function sh(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }
    function link(fsSrc) {
      var p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fsSrc));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
      return p;
    }
    prog = link(fsLit);
    litTorch = !!prog;
    if (!prog) prog = link(fsSimple);
    if (!prog) {
      var hint2 = $('hint');
      if (hint2) hint2.textContent = '小宇：画面着色没编过，请换 Safari 或 Chrome。';
      return false;
    }
    loc = {
      pos: gl.getAttribLocation(prog, 'aPos'),
      col: gl.getAttribLocation(prog, 'aCol'),
      mvp: gl.getUniformLocation(prog, 'uMvp'),
      amb: gl.getUniformLocation(prog, 'uAmb'),
      min: gl.getUniformLocation(prog, 'uMin'),
      eye: gl.getUniformLocation(prog, 'uEye'),
      sky: gl.getUniformLocation(prog, 'uSky'),
      fog: gl.getUniformLocation(prog, 'uFog'),
      torch: null
    };
    if (litTorch) {
      loc.torch = gl.getUniformLocation(prog, 'uTorch[0]') || gl.getUniformLocation(prog, 'uTorch');
      if (!loc.torch) {
        prog = link(fsSimple);
        litTorch = false;
        if (!prog) return false;
        loc.mvp = gl.getUniformLocation(prog, 'uMvp');
        loc.amb = gl.getUniformLocation(prog, 'uAmb');
        loc.min = gl.getUniformLocation(prog, 'uMin');
        loc.eye = gl.getUniformLocation(prog, 'uEye');
        loc.sky = gl.getUniformLocation(prog, 'uSky');
        loc.fog = gl.getUniformLocation(prog, 'uFog');
        loc.pos = gl.getAttribLocation(prog, 'aPos');
        loc.col = gl.getAttribLocation(prog, 'aCol');
      }
    }
    buf = gl.createBuffer();
    lineBuf = gl.createBuffer();
    dynBuf = gl.createBuffer();
    gl.enable(gl.DEPTH_TEST);
    return true;
  }

  function setHold(name) {
    if (name !== 'hand' && name !== 'torch' && name !== 'boat') return;
    state.hold = name;
    renderHud();
  }
  function toggleCraft() {
    var el = $('craft');
    if (!el) return;
    el.hidden = !el.hidden;
  }
  function enterGame(lock) {
    var start = $('start');
    if (start) start.hidden = true;
    state.started = true;
    var cancel = $('netCancel');
    if (cancel) cancel.hidden = true;
    if (typeof document !== 'undefined' && document.activeElement && document.activeElement.blur) document.activeElement.blur();
    renderHud();
    if (lock) wantLock();
  }
  function wantLock() {
    var canvas = $('view');
    if (!canvas) return;
    try {
      if (window.matchMedia('(pointer:fine)').matches && canvas.requestPointerLock) canvas.requestPointerLock();
    } catch (e) {}
  }
  function setWait(text) {
    var el = $('roomWait');
    if (el) el.textContent = text || '';
  }
  function setNetStatus() {
    var el = $('netText');
    var leave = $('leave');
    if (leave) leave.hidden = !netRole;
    if (!el) return;
    var names = [];
    var id;
    for (id in remotes) names.push(remotes[id].name);
    var s = '你是' + state.name;
    if (netRole === 'host') s += names.length ? (' · 看见' + names.join('、')) : ' · 等朋友加入';
    else if (netRole === 'guest') s += names.length ? (' · 看见' + names.join('、')) : ' · 在朋友的世界里';
    el.textContent = s;
  }
  function netHot() {
    if (netRole === 'host') return bcLinked || peerConns.length > 0 || netLinked;
    return !!(bcLinked || netLinked);
  }
  function netWindowKey(offset) { return Math.floor(Date.now() / 60000) + (offset || 0); }
  function netPairIds() {
    var ids = [], w, i, key;
    for (w = 0; w >= -1; w--) {
      key = netWindowKey(w);
      for (i = 0; i < NET_SLOTS; i++) ids.push(NET_PREFIX + '-' + key + '-' + i);
    }
    return ids;
  }
  function netNewPeer(id) {
    return id ? new Peer(id, NET_PEER_OPTS) : new Peer(NET_PEER_OPTS);
  }
  function ensurePeer(cb) {
    if (typeof Peer !== 'undefined') { cb(true); return; }
    if (typeof document === 'undefined') { cb(false); return; }
    var s = document.createElement('script');
    s.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
    s.onload = function () { cb(typeof Peer !== 'undefined'); };
    s.onerror = function () { cb(false); };
    document.head.appendChild(s);
  }
  function stamp(obj) {
    obj.mw = 3;
    if (!obj.from) obj.from = selfId;
    if (!obj.session) obj.session = netSession;
    return obj;
  }
  function bcSend(obj) {
    if (!netBC) return;
    try { netBC.postMessage(obj); } catch (e) {}
  }
  function peerSend(obj, except) {
    var i;
    if (netRole === 'host') {
      for (i = 0; i < peerConns.length; i++) {
        if (peerConns[i].conn === except) continue;
        try { if (peerConns[i].conn.open) peerConns[i].conn.send(obj); } catch (e) {}
      }
    } else if (netConn && netConn !== except) {
      try { if (netConn.open) netConn.send(obj); } catch (e) {}
    }
  }
  function emit(obj) {
    if (!netRole) return;
    obj.from = selfId;
    obj.session = netSession;
    stamp(obj);
    if (netRole === 'host' || bcLinked) bcSend(obj);
    peerSend(obj, null);
  }
  function relay(obj, fromConn) {
    if (netRole !== 'host') return;
    stamp(obj);
    bcSend(obj);
    peerSend(obj, fromConn);
  }
  function worldPacket() {
    return {
      t: 'hi', host: 1, seed: worldSeed, edits: collectEdits(),
      boats: boats.map(function (b) { return [Math.round(b.x * 10) / 10, Math.round(b.z * 10) / 10]; }),
      clock: state.clock, name: state.name,
      px: state.px, py: state.py, pz: state.pz, yaw: state.yaw, pitch: state.pitch, w: weaponCode()
    };
  }
  function sendHiBc() {
    var msg = worldPacket();
    msg.from = selfId;
    msg.session = netSession;
    stamp(msg);
    bcSend(msg);
  }
  function sendHiConn(conn) {
    var msg = worldPacket();
    msg.from = selfId;
    msg.session = netSession;
    stamp(msg);
    try { conn.send(msg); } catch (e) {}
  }
  function applyPos(msg) {
    if (!msg || msg.from === selfId) return;
    if (!isFinite(+msg.x) || !isFinite(+msg.y) || !isFinite(+msg.z)) return;
    var id = String(msg.from || '');
    if (!id) return;
    var r = remotes[id];
    if (!r) {
      r = { x: +msg.x, y: +msg.y, z: +msg.z };
      remotes[id] = r;
    }
    r.name = cleanName(msg.name);
    r.tx = +msg.x; r.ty = +msg.y; r.tz = +msg.z;
    r.yaw = isFinite(+msg.yaw) ? +msg.yaw : 0;
    r.pitch = isFinite(+msg.pitch) ? +msg.pitch : 0;
    r.w = msg.w | 0;
    r.seen = Date.now();
    if (msg.host && netRole === 'guest' && isFinite(+msg.clock)) state.clock = +msg.clock;
  }
  function applyHostWorld(msg) {
    var first = !state.gotHost;
    var px = state.px, py = state.py, pz = state.pz, ride = state.ride;
    grow(msg.seed | 0, true);
    applyEdits(msg.edits || []);
    boats.splice(0, boats.length);
    (msg.boats || []).forEach(function (b) {
      if (b && b.length >= 2) boats.push({ x: +b[0], z: +b[1] });
    });
    if (isFinite(+msg.clock)) state.clock = +msg.clock;
    if (first) {
      state.px = spawn.x + 1.8;
      state.py = spawn.y;
      state.pz = spawn.z + 0.4;
      state.ride = -1;
      var guard = 0;
      while (overlaps(state.px, state.py, state.pz) && guard++ < 8) state.py += 0.5;
    } else {
      state.px = px; state.py = py; state.pz = pz; state.ride = ride;
    }
    state.gotHost = true;
    lockHome = true;
    dirty = true;
  }
  function applyRemoteSet(msg, fromConn) {
    var x = msg.x | 0, y = msg.y | 0, z = msg.z | 0, id = msg.id | 0;
    if (x < 0 || y < 0 || z < 0 || x >= W || y >= H || z >= D) return;
    if (id !== AIR && id !== TORCH) return;
    var cur = at(x, y, z);
    if (id === AIR && cur === AIR) return;
    if (id === TORCH && cur !== AIR && cur !== TORCH) return;
    put(x, y, z, id);
    dirty = true;
    if (netRole === 'host') relay({ t: 'set', x: x, y: y, z: z, id: id, from: msg.from || selfId }, fromConn);
    if (!lockHome) save();
  }
  function onNet(msg, via, fromConn) {
    if (!msg || typeof msg !== 'object') return;
    if (msg.mw && msg.mw !== 3) return;
    if (msg.from && msg.from === selfId) return;
    if (msg.session && netSession && msg.session !== netSession && msg.t !== 'room' && msg.t !== 'hi' && msg.t !== 'join') return;
    if (msg.t === 'room' && netRole === 'guest' && !state.gotHost) {
      if (!linkedSession) {
        netSession = msg.session;
        bcLinked = true;
        bcSend(stamp({ t: 'join', session: msg.session, name: state.name, from: selfId }));
        setWait('小宇：看见房主了，正在进同一张地图…');
      }
      return;
    }
    if (msg.t === 'join' && netRole === 'host' && via === 'bc' && msg.session === netSession) {
      bcLinked = true;
      sendHiBc();
      return;
    }
    if (msg.t === 'hi' && netRole === 'guest') {
      if (linkedSession && msg.session && msg.session !== linkedSession) return;
      if (msg.session) { linkedSession = msg.session; netSession = msg.session; }
      if (via === 'bc') bcLinked = true;
      if (via === 'peer') netLinked = true;
      var first = !state.gotHost;
      applyHostWorld(msg);
      applyPos(msg.px != null ? { from: msg.from, name: msg.name, x: msg.px, y: msg.py, z: msg.pz, yaw: msg.yaw, pitch: msg.pitch, host: 1, clock: msg.clock, w: msg.w } : null);
      if (first) {
        enterGame(false);
        toast('小宇：连上了，抬头就能看见对方的名字');
      }
      return;
    }
    if (msg.t === 'pos') {
      applyPos(msg);
      if (via === 'peer' && netRole === 'host') relay(msg, fromConn);
      return;
    }
    if (msg.t === 'set') {
      applyRemoteSet(msg, fromConn);
      return;
    }
    if (msg.t === 'boat') addBoat(+msg.x, +msg.z, true, fromConn);
  }
  function stopBcPulse() {
    if (bcPulse) { clearInterval(bcPulse); bcPulse = null; }
  }
  function startBcPulse() {
    stopBcPulse();
    bcSend(stamp({ t: 'room', session: netSession, name: state.name, from: selfId }));
    bcPulse = setInterval(function () {
      if (netAbort || netRole !== 'host') { stopBcPulse(); return; }
      bcSend(stamp({ t: 'room', session: netSession, name: state.name, from: selfId }));
    }, 1000);
  }
  function onHostConn(conn) {
    if (peerConns.length >= 4) { try { conn.close(); } catch (e) {} return; }
    peerConns.push({ conn: conn });
    conn._xyFrom = '';
    function opened() {
      netLinked = true;
      sendHiConn(conn);
    }
    conn.on('open', opened);
    conn.on('data', function (msg) {
      if (msg && msg.from) conn._xyFrom = msg.from;
      onNet(msg, 'peer', conn);
    });
    conn.on('close', function () {
      peerConns = peerConns.filter(function (c) { return c.conn !== conn; });
      if (conn._xyFrom && remotes[conn._xyFrom]) delete remotes[conn._xyFrom];
      toast('小宇：有朋友离开了');
    });
    conn.on('error', function () {});
    if (conn.open) opened();
  }
  function netClaim(id, onOk, onBusy) {
    var peer;
    try { peer = netNewPeer(id); } catch (e) { onBusy(); return; }
    var settled = false;
    function fail() {
      if (settled) return;
      settled = true;
      try { peer.destroy(); } catch (e) {}
      onBusy();
    }
    peer.on('open', function () {
      if (settled || netAbort) return;
      settled = true;
      onOk(peer, id);
    });
    peer.on('error', fail);
    setTimeout(function () { if (!settled) fail(); }, 5000);
  }
  function claimHost() {
    var ids = netPairIds().slice(0, NET_SLOTS);
    var startAt = (Math.random() * ids.length) | 0;
    var order = ids.slice(startAt).concat(ids.slice(0, startAt));
    var i = 0;
    function tryNext() {
      if (netAbort || netRole !== 'host') return;
      if (i >= order.length) {
        toast('小宇：座位忙。同一台电脑的另一个窗口仍可以加入。');
        return;
      }
      netClaim(order[i++], function (peer, claimed) {
        if (netAbort || netRole !== 'host') { try { peer.destroy(); } catch (e) {} return; }
        netPeer = peer;
        netCode = claimed;
        peer.on('connection', onHostConn);
        peer.on('disconnected', function () { try { peer.reconnect(); } catch (e) {} });
        peer.on('error', function (err) { if (err && err.type === 'peer-unavailable') return; });
      }, tryNext);
    }
    tryNext();
  }
  function netProbeId(peer, id) {
    return new Promise(function (resolve) {
      if (netAbort || state.gotHost) { resolve(null); return; }
      var done = false, conn, timer;
      function finish(ok) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (!ok) { try { if (conn) conn.close(); } catch (e) {} }
        resolve(ok ? { id: id, conn: conn } : null);
      }
      try { conn = peer.connect(id, { reliable: true }); }
      catch (e) { resolve(null); return; }
      conn.on('open', function () { finish(true); });
      conn.on('error', function () { finish(false); });
      timer = setTimeout(function () { finish(false); }, NET_PROBE_MS);
    });
  }
  function probeBatches(peer, ids, index, done) {
    if (netAbort || state.gotHost || index >= ids.length) { done(null); return; }
    var batch = ids.slice(index, index + 4);
    Promise.all(batch.map(function (id) { return netProbeId(peer, id); })).then(function (results) {
      var won = null, i;
      for (i = 0; i < results.length; i++) {
        if (results[i] && !won) won = results[i];
        else if (results[i]) { try { results[i].conn.close(); } catch (e) {} }
      }
      if (won) done(won);
      else probeBatches(peer, ids, index + 4, done);
    });
  }
  function wireGuest(conn) {
    netConn = conn;
    function opened() {
      netLinked = true;
      try { conn.send(stamp({ t: 'join', name: state.name, from: selfId, session: netSession || '' })); } catch (e) {}
    }
    conn.on('open', opened);
    conn.on('data', function (msg) { onNet(msg, 'peer', conn); });
    conn.on('close', function () {
      if (netConn === conn) { netLinked = false; toast('小宇：和朋友断开了'); }
    });
    conn.on('error', function () {});
    if (conn.open) opened();
  }
  function probeGuest() {
    setTimeout(function () {
      if (netAbort || netRole !== 'guest' || state.gotHost) return;
      probeGuestNow();
    }, 1400);
  }
  function probeGuestNow() {
    var peer;
    try { peer = netNewPeer(); } catch (e) { return; }
    netPeer = peer;
    peer.on('open', function () {
      var started = Date.now();
      var round = 0;
      function loop() {
        if (netAbort || netRole !== 'guest' || state.gotHost) return;
        if (Date.now() - started > NET_FIND_MS) {
          setWait('没找到房主。请对方先点当房主，再试一次。同一台电脑开两个窗口就能看见彼此。');
          return;
        }
        round += 1;
        setWait('正在找房主…第' + round + '轮');
        probeBatches(peer, netPairIds(), 0, function (won) {
          if (netAbort || state.gotHost) {
            if (won) { try { won.conn.close(); } catch (e) {} }
            return;
          }
          if (won) {
            netCode = won.id;
            wireGuest(won.conn);
            setWait('找到了，正在连上…');
            return;
          }
          setTimeout(loop, 280);
        });
      }
      loop();
    });
    peer.on('error', function (err) {
      if (err && err.type === 'peer-unavailable') return;
      if (!state.gotHost && netRole === 'guest') setWait('联网信号不稳。同一台电脑的两个窗口也可以一起玩。');
    });
  }
  function beginHost() {
    openBC();
    netAbort = false;
    netRole = 'host';
    netSession = 'mw' + ((Date.now() / 1000) | 0).toString(36) + Math.random().toString(36).slice(2, 6);
    enterGame(false);
    startBcPulse();
    toast('小宇：你是房主。另一台点「加入朋友」。');
    setTimeout(function () {
      ensurePeer(function (ok) {
        if (!ok || netAbort || netRole !== 'host') {
          if (!netBC) toast('小宇：这台浏览器暂时联不了网，可以先一个人玩');
          return;
        }
        claimHost();
      });
    }, 50);
  }
  function beginJoin() {
    openBC();
    if (state.started && netRole === 'host') return;
    if (!state.gotHost) snapshotHome();
    netAbort = false;
    netRole = 'guest';
    state.gotHost = false;
    linkedSession = '';
    netSession = '';
    setWait('小宇：正在找房主。请让另一台先点「当房主」。');
    var cancel = $('netCancel');
    if (cancel) cancel.hidden = false;
    ensurePeer(function (ok) {
      if (netAbort || netRole !== 'guest') return;
      if (!ok) {
        setWait('联网组件没载入。同一台电脑请再开一个窗口点加入。');
        return;
      }
      probeGuest();
    });
  }
  function netShutdown() {
    var wasGuest = netRole === 'guest';
    var wasHost = netRole === 'host';
    var playing = state.started;
    netAbort = true;
    stopBcPulse();
    try { if (netConn) netConn.close(); } catch (e) {}
    try { if (netPeer) netPeer.destroy(); } catch (e2) {}
    netPeer = null;
    netConn = null;
    peerConns = [];
    netLinked = false;
    bcLinked = false;
    netRole = null;
    linkedSession = '';
    netSession = '';
    remotes = {};
    state.gotHost = false;
    var cancel = $('netCancel');
    if (cancel) cancel.hidden = true;
    setNetStatus();
    if (wasGuest && playing) toast('小宇：已经分开。刷新后回到你自己的地图，背包会留下。');
    else if (wasHost && playing) toast('小宇：已经单独玩');
    else if (wasGuest) setWait('已取消');
  }
  function rollName() {
    var n = KID_NAMES[(Math.random() * KID_NAMES.length) | 0];
    if (n === state.name) n = KID_NAMES[(KID_NAMES.indexOf(n) + 1) % KID_NAMES.length];
    state.name = n;
    renderHud();
    var label = $('nameLabel');
    if (label) label.textContent = state.name;
  }

  function bind() {
    var canvas = $('view');
    var go = $('go');
    if (go) go.addEventListener('click', function () { enterGame(true); });
    var rename = $('rename');
    if (rename) rename.addEventListener('click', rollName);
    var host = $('host');
    if (host) host.addEventListener('click', beginHost);
    var join = $('join');
    if (join) join.addEventListener('click', beginJoin);
    var cancel = $('netCancel');
    if (cancel) cancel.addEventListener('click', netShutdown);
    var leave = $('leave');
    if (leave) leave.addEventListener('click', netShutdown);
    if (canvas) {
      canvas.addEventListener('click', function () { if (state.started) wantLock(); });
      canvas.addEventListener('mousedown', function (e) {
        if (!state.started || craftOpen()) return;
        if (e.button === 2) { tryPlace(); return; }
        if (e.button === 0 && document.pointerLockElement === canvas) punching = true;
      });
    }
    window.addEventListener('mouseup', function () { if (!pointerPunch) punching = false; });
    document.addEventListener('mousemove', function (e) {
      if (!canvas || document.pointerLockElement !== canvas) return;
      state.yaw += e.movementX * 0.0022;
      state.pitch -= e.movementY * 0.0022;
      if (state.pitch > 1.2) state.pitch = 1.2;
      if (state.pitch < -1.2) state.pitch = -1.2;
    });
    document.addEventListener('keydown', function (e) {
      if (!state.started) return;
      if (e.code === 'Space') e.preventDefault();
      if (e.code === 'Escape') { var c = $('craft'); if (c) c.hidden = true; return; }
      if (e.code === 'KeyC') { toggleCraft(); return; }
      if (e.code === 'KeyF' || e.code === 'KeyE') { tryPlace(); return; }
      if (e.code === 'KeyR') { toggleRide(); return; }
      if (e.code === 'Digit1') { setHold('hand'); return; }
      if (e.code === 'Digit2') { setHold('torch'); return; }
      if (e.code === 'Digit3') { setHold('boat'); return; }
      keys[e.code] = true;
    });
    document.addEventListener('keyup', function (e) { keys[e.code] = false; });
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    if (canvas) {
      var lookId = null, lx = 0, ly = 0;
      canvas.addEventListener('pointerdown', function (e) {
        if (!state.started || e.pointerType === 'mouse') return;
        lookId = e.pointerId; lx = e.clientX; ly = e.clientY;
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      });
      canvas.addEventListener('pointermove', function (e) {
        if (e.pointerId !== lookId) return;
        state.yaw += (e.clientX - lx) * 0.005;
        state.pitch -= (e.clientY - ly) * 0.005;
        lx = e.clientX; ly = e.clientY;
        if (state.pitch > 1.2) state.pitch = 1.2;
        if (state.pitch < -1.2) state.pitch = -1.2;
      });
      canvas.addEventListener('pointerup', function (e) { if (e.pointerId === lookId) lookId = null; });
      canvas.addEventListener('pointercancel', function (e) { if (e.pointerId === lookId) lookId = null; });
    }
    var joy = $('joy'), knob = $('knob'), joyId = null;
    function setJoy(cx, cy) {
      var r = joy.getBoundingClientRect();
      var dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
      var max = r.width * 0.36;
      var len = Math.hypot(dx, dy) || 1;
      if (len > max) { dx = dx / len * max; dy = dy / len * max; }
      joyX = dx / max;
      joyY = -dy / max;
      knob.style.left = (r.width / 2 - 20 + dx) + 'px';
      knob.style.top = (r.height / 2 - 20 + dy) + 'px';
    }
    if (joy && knob) {
      joy.addEventListener('pointerdown', function (e) {
        joyId = e.pointerId;
        try { joy.setPointerCapture(e.pointerId); } catch (err) {}
        setJoy(e.clientX, e.clientY);
      });
      joy.addEventListener('pointermove', function (e) { if (e.pointerId === joyId) setJoy(e.clientX, e.clientY); });
      function endJoy(e) {
        if (e.pointerId !== joyId) return;
        joyId = null; joyX = 0; joyY = 0;
        knob.style.left = ''; knob.style.top = '';
      }
      joy.addEventListener('pointerup', endJoy);
      joy.addEventListener('pointercancel', endJoy);
    }
    var punchBtn = $('punch');
    if (punchBtn) {
      punchBtn.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        pointerPunch = true;
        punching = true;
        try { punchBtn.setPointerCapture(e.pointerId); } catch (err) {}
      });
      function endPunch() { pointerPunch = false; punching = false; }
      punchBtn.addEventListener('pointerup', endPunch);
      punchBtn.addEventListener('pointercancel', endPunch);
    }
    var jumpBtn = $('jump');
    if (jumpBtn) {
      jumpBtn.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        jumping = true;
        try { jumpBtn.setPointerCapture(e.pointerId); } catch (err) {}
      });
      jumpBtn.addEventListener('pointerup', function () { jumping = false; });
      jumpBtn.addEventListener('pointercancel', function () { jumping = false; });
    }
    var placeBtn = $('place');
    if (placeBtn) placeBtn.addEventListener('click', function (e) { e.preventDefault(); tryPlace(); });
    var makeBtn = $('make');
    if (makeBtn) makeBtn.addEventListener('click', function (e) { e.preventDefault(); toggleCraft(); });
    var rideBtn = $('ride');
    if (rideBtn) rideBtn.addEventListener('click', function (e) { e.preventDefault(); toggleRide(); });
    var closeCraft = $('craftClose');
    if (closeCraft) closeCraft.addEventListener('click', function () { var c = $('craft'); if (c) c.hidden = true; });
    var craftBtns = typeof document !== 'undefined' ? document.querySelectorAll('#craft button[data-craft]') : [];
    var ci;
    for (ci = 0; ci < craftBtns.length; ci++) {
      craftBtns[ci].addEventListener('click', function (e) {
        craft(e.currentTarget.getAttribute('data-craft'));
      });
    }
    var slotBtns = typeof document !== 'undefined' ? document.querySelectorAll('#equip button[data-slot]') : [];
    for (ci = 0; ci < slotBtns.length; ci++) {
      slotBtns[ci].addEventListener('click', function (e) { cycleSlot(e.currentTarget.getAttribute('data-slot')); });
    }
    var holdBtns = typeof document !== 'undefined' ? document.querySelectorAll('#hold button') : [];
    for (ci = 0; ci < holdBtns.length; ci++) {
      holdBtns[ci].addEventListener('click', function (e) { setHold(e.currentTarget.getAttribute('data-hold')); });
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) save(); });
    window.addEventListener('pagehide', save);
  }

  function loop(now) {
    if (!loop.last) loop.last = now;
    var dt = Math.min(0.05, (now - loop.last) / 1000);
    loop.last = now;
    sim(dt);
    if (gl) draw();
    requestAnimationFrame(loop);
  }
  function scan() {
    var counts = {}, maxY = 0, waterCols = 0, mountains = 0;
    var i, x, y, z, id, top, saw;
    for (i = 0; i < blocks.length; i++) counts[blocks[i]] = (counts[blocks[i]] || 0) + 1;
    for (z = 0; z < D; z++) {
      for (x = 0; x < W; x++) {
        top = -1; saw = false;
        for (y = 0; y < H; y++) {
          id = at(x, y, z);
          if (id === WATER) saw = true;
          if (id && id !== WATER && id !== LEAF && id !== FLOWER && id !== TORCH) top = y;
        }
        if (saw) waterCols++;
        if (top > maxY) maxY = top;
        if (top >= SEA + 5) mountains++;
      }
    }
    return { counts: counts, maxY: maxY, waterCols: waterCols, mountains: mountains, spawn: spawn, seed: worldSeed };
  }

  var api = {
    TIP: TIP, STORE: STORE, W: W, H: H, D: D, SEA: SEA, DAY: DAY,
    AIR: AIR, GRASS: GRASS, DIRT: DIRT, LOG: LOG, LEAF: LEAF, STONE: STONE,
    WATER: WATER, SAND: SAND, FLOWER: FLOWER, GOLD: GOLD, TORCH: TORCH, CHEST: CHEST,
    NET_PEER_OPTS: NET_PEER_OPTS, KID_NAMES: KID_NAMES,
    state: state, boats: boats, remotes: remotes,
    at: at, put: put, grow: grow, loadRaw: loadRaw, save: save, scan: scan,
    craft: craft, breakBlock: breakBlock, breakTime: breakTime, placeTorchAt: placeTorchAt,
    addBoat: addBoat, snapshotHome: snapshotHome, pinHome: function () { snapshotHome(); lockHome = true; },
    applyNet: onNet, applyPos: applyPos, dayFactor: dayFactor, skyRGB: skyRGB,
    setClock: function (s) { state.clock = s; },
    weaponCode: weaponCode, inWaterAt: inWaterAt, sim: sim, overlaps: overlaps, tryPlace: tryPlace,
    selfId: function () { return selfId; },
    setSelfForTest: function (id) { selfId = id; },
    setRole: function (role) { netRole = role; }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.__xy = api;

  function boot() {
    openBC();
    load();
    renderHud();
    var label = $('nameLabel');
    if (label) label.textContent = state.name;
    bind();
    if (bootGL()) requestAnimationFrame(loop);
  }
  if (typeof document !== 'undefined' && document.getElementById && document.getElementById('view')) boot();
})();
