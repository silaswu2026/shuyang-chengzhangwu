/* 方块小世界 mw14 · 更大的地图、煤炭盲盒 12 种武器、火山和 5 分钟夺宝。 */
(function () {
  'use strict';

  var TIP = 'mw14';
  var STORE = 'xygo-my-world';
  var HOST_NAME = '杨杨';
  var W = 96, H = 24, D = 96, SEA = 8, DAY = 360;
  var MATCH_SEC = 300;
  var VOLCANO_FIRST = 120, VOLCANO_DUR = 60, VOLCANO_PERIOD = 150;
  var ROCK_GAP = 1.8, ROCK_LIFE = 1.35;
  var HP_MAX = 10;
  var WALK = 3.0;
  var GUN_DMG = 4;
  var PIG_HP = 4, PIG_DMG = 1, BOAR_SPEED = WALK * 1.15;
  var BOAR_AGGRO = 6.5, BOAR_AGGRO_NIGHT = 11, BOAR_HIT = 1.25;
  var COW_HP = 28, COW_DMG = 2, COW_SPEED = WALK * 0.32;
  var SHEEP_HP = 6, SHEEP_FEAR = 6, SHEEP_FLEE = WALK * 1.05;
  var CHICKEN_HP = 3, CHICKEN_FEAR = 5.2, CHICKEN_FLEE = WALK * 1.55;
  var COLD_EVERY = 3.2;
  var MAP_N = 41;
  var MAP_CELL = 2;
  var AIR = 0, GRASS = 1, DIRT = 2, LOG = 3, LEAF = 4, STONE = 5;
  var WATER = 6, SAND = 7, FLOWER = 8, GOLD = 9, TORCH = 10, CHEST = 11, BED = 12, IRON_ORE = 13, SNOW = 14;
  var LAVA = 15, MAGMA = 16, COAL_ORE = 17;
  var COL = {
    1: [0.28, 0.82, 0.22],
    2: [0.72, 0.40, 0.16],
    3: [0.62, 0.34, 0.12],
    4: [0.16, 0.74, 0.22],
    5: [0.62, 0.66, 0.78],
    6: [0.12, 0.52, 0.98],
    7: [0.96, 0.78, 0.28],
    8: [0.98, 0.28, 0.55],
    9: [1, 0.82, 0.12],
    10: [1, 0.62, 0.12],
    11: [0.86, 0.42, 0.12],
    12: [0.95, 0.22, 0.38],
    13: [0.58, 0.62, 0.70],
    14: [0.93, 0.96, 1],
    15: [0.95, 0.28, 0.06],
    16: [0.42, 0.12, 0.08],
    17: [0.16, 0.16, 0.18]
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
  var INV_KEYS = ['wood', 'leaf', 'dirt', 'stone', 'sand', 'torch', 'boat', 'bed', 'swordWood', 'swordStone', 'swordIron', 'armor', 'armorWood', 'armorIron', 'pick', 'pickIron', 'axe', 'shears', 'gun', 'gold', 'iron', 'wool', 'wheat', 'raw', 'cooked', 'coal', 'stick', 'axeStone', 'hammer', 'nightSword', 'axeVolcano', 'hammerBlast', 'spear', 'rod', 'pickStar', 'swordSun'];
  var BAG_SHOW = [['wood', '木头'], ['leaf', '树叶'], ['dirt', '泥土'], ['stone', '石头'], ['sand', '沙子'], ['coal', '煤炭'], ['torch', '火把'], ['boat', '小船'], ['bed', '床'], ['swordIron', '铁剑'], ['armor', '叶衣'], ['stick', '木棍'], ['spear', '石矛']];
  var NAMES = { wood: '木头', leaf: '树叶', dirt: '泥土', stone: '石头', sand: '沙子', torch: '火把', boat: '小船', bed: '床', swordWood: '木剑', swordStone: '石剑', swordIron: '铁剑', armor: '叶衣', armorWood: '木甲', armorIron: '铁甲', pick: '石镐', pickIron: '铁镐', axe: '木斧', shears: '剪刀', gun: '枪', gold: '金币', iron: '铁矿', wool: '羊毛', wheat: '小麦', raw: '生肉', cooked: '熟肉', coal: '煤炭', stick: '木棍', axeStone: '石斧', hammer: '铁锤', nightSword: '暗夜剑', axeVolcano: '火山斧', hammerBlast: '爆裂锤', spear: '石矛', rod: '铁棒', pickStar: '星火镐', swordSun: '暖阳剑' };
  var ARMOR_CUT = { armor: 0.2, armorWood: 0.35, armorIron: 0.55 };
  var ARMOR_MAX = { armor: 20, armorWood: 40, armorIron: 80 };
  var TOOL_MAX = { axe: 40, pick: 80, pickIron: 160 };
  var RECIPES = {
    boat: { cost: { wood: 10 }, give: 'boat', n: 1, say: '小船', woodGate: 1 },
    armor: { cost: { leaf: 8 }, give: 'armor', n: 1, say: '叶衣', slot: 'armor' },
    bed: { cost: { wood: 3, wool: 2 }, give: 'bed', n: 1, say: '床' },
    armorWood: { cost: { wood: 6 }, give: 'armorWood', n: 1, say: '木甲', slot: 'armor' },
    armorIron: { cost: { iron: 6 }, give: 'armorIron', n: 1, say: '铁甲', slot: 'armor' },
    shears: { cost: { iron: 2 }, give: 'shears', n: 1, say: '剪刀' },
    wheat: { cost: { leaf: 2 }, give: 'wheat', n: 1, say: '小麦' },
    sell: { cost: { wood: 1 }, give: 'gold', n: 1, say: '金币' }
  };
  var GEAR = {
    axeStone: { name: '石斧', slot: 'weapon', dmg: 3, chop: 1.25, dur: 48, code: 5 },
    swordIron: { name: '铁剑', slot: 'weapon', dmg: 4, code: 4 },
    hammer: { name: '铁锤', slot: 'weapon', dmg: 5, code: 6 },
    nightSword: { name: '暗夜剑', slot: 'weapon', dmg: 4, night: 6, code: 7 },
    axeVolcano: { name: '火山斧', slot: 'weapon', dmg: 4, chop: 1.5, dur: 64, code: 8 },
    hammerBlast: { name: '爆裂锤', slot: 'weapon', dmg: 6, knock: 1, code: 9 },
    stick: { name: '木棍', slot: 'weapon', dmg: 2, code: 1 },
    spear: { name: '石矛', slot: 'weapon', dmg: 3, reach: 3.3, code: 2 },
    rod: { name: '铁棒', slot: 'weapon', dmg: 3, code: 10 },
    pickStar: { name: '星火镐', slot: 'tool', dmg: 2, mine: 1.85, dur: 120, code: 12 },
    swordSun: { name: '暖阳剑', slot: 'weapon', dmg: 3, warm: 1, code: 11 }
  };
  var MIX = [
    { mats: ['stone', 'wood'], give: 'axeStone', say: '石斧', slot: 'weapon' },
    { mats: ['iron', 'wood'], give: 'swordIron', say: '铁剑', slot: 'weapon' },
    { mats: ['stone', 'iron'], give: 'hammer', say: '铁锤', slot: 'weapon' },
    { mats: ['iron', 'stone', 'wood'], give: 'nightSword', say: '暗夜剑', slot: 'weapon' },
    { mats: ['coal', 'wood'], give: 'torch', say: '火把', n: 1 },
    { mats: ['coal', 'stone'], give: 'axeVolcano', say: '火山斧', slot: 'weapon' },
    { mats: ['coal', 'iron'], give: 'hammerBlast', say: '爆裂锤', slot: 'weapon' },
    { mats: ['wood', 'wood'], give: 'stick', say: '木棍', slot: 'weapon' },
    { mats: ['stone', 'stone'], give: 'spear', say: '石矛', slot: 'weapon' },
    { mats: ['iron', 'iron'], give: 'rod', say: '铁棒', slot: 'weapon' },
    { mats: ['coal', 'wood', 'stone'], give: 'pickStar', say: '星火镐', slot: 'tool' },
    { mats: ['coal', 'wood', 'iron'], give: 'swordSun', say: '暖阳剑', slot: 'weapon' }
  ];
  var SLOT_WORD = {
    weapon: { '': '武器 空', swordWood: '武器 木剑', swordStone: '武器 石剑', swordIron: '武器 铁剑', gun: '武器 枪', stick: '武器 木棍', spear: '武器 石矛', axeStone: '武器 石斧', hammer: '武器 铁锤', nightSword: '武器 暗夜剑', axeVolcano: '武器 火山斧', hammerBlast: '武器 爆裂锤', rod: '武器 铁棒', swordSun: '武器 暖阳剑', pickStar: '武器 星火镐' },
    armor: { '': '护甲 空', armor: '护甲 叶衣', armorWood: '护甲 木甲', armorIron: '护甲 铁甲' },
    tool: { '': '工具 空', pick: '工具 石稿', axe: '工具 木斧', pickIron: '工具 铁镐', axeStone: '工具 石斧', axeVolcano: '工具 火山斧', pickStar: '工具 星火镐' }
  };
  var EMOTES = [
    { id: 'hi', face: '👋' },
    { id: 'happy', face: '😄' },
    { id: 'wow', face: '😮' },
    { id: 'love', face: '❤️' },
    { id: 'sad', face: '😢' }
  ];
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
        { urls: 'turn:staticauth.openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turns:staticauth.openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' }
      ]
    }
  };

  var blocks = new Uint8Array(W * H * D);
  var worldSeed = 1;
  var spawn = { x: 20.5, y: 10, z: 20.5 };
  var boats = [];
  var torchCells = [];
  var volcano = null;
  var treasures = [];
  var pigs = [];
  var cows = [];
  var sheep = [];
  var chickens = [];
  var villagers = [];
  var village = null;
  var armorDrop = null;
  var fallPeak = null;
  var shotLock = false;
  var mapOpen = true;
  var suppressMobs = false;
  var state = {
    px: 20.5, py: 10, pz: 20.5, yaw: 0.4, pitch: 0, vy: 0,
    onGround: false, started: false, ride: -1, sitting: null, hold: 'hand', clock: 0,
    hp: HP_MAX, knockX: 0, knockZ: 0, gotHost: false,
    name: KID_NAMES[(Math.random() * KID_NAMES.length) | 0],
    nameTouched: false,
    score: 0, match: 0, matchOver: false, mix: [],
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
      netBC = new BroadcastChannel('xygo-my-world-' + TIP);
      netBC.onmessage = function (ev) { onNet(ev && ev.data, 'bc', null); };
    } catch (eBc) { netBC = null; }
  }

  function blankInv() {
    return { wood: 0, leaf: 0, dirt: 0, stone: 0, sand: 0, torch: 0, boat: 0, bed: 0, swordWood: 0, swordStone: 0, swordIron: 0, armor: 0, armorWood: 0, armorIron: 0, pick: 0, pickIron: 0, axe: 0, shears: 0, gun: 0, gold: 0, iron: 0, wool: 0, wheat: 0, raw: 0, cooked: 0, coal: 0, stick: 0, axeStone: 0, hammer: 0, nightSword: 0, axeVolcano: 0, hammerBlast: 0, spear: 0, rod: 0, pickStar: 0, swordSun: 0 };
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
    dirty = true;
  }
  function solid(x, y, z) {
    x |= 0; y |= 0; z |= 0;
    if (x < 0 || z < 0 || x >= W || z >= D) return true;
    if (y < 0 || y >= H) return false;
    var id = at(x, y, z);
    return id !== AIR && id !== LEAF && id !== FLOWER && id !== WATER && id !== TORCH && id !== BED;
  }
  function countId(id) {
    var n = 0, i;
    for (i = 0; i < blocks.length; i++) if (blocks[i] === id) n++;
    return n;
  }
  function placeTree(x, z, h) {
    x |= 0; z |= 0; h |= 0;
    if (x < 1 || z < 1 || x >= W - 1 || z >= D - 1) return false;
    var tall = hash2(x, z, 19) < 0.4 ? 1 : 0;
    var top = h + 3 + tall;
    if (top + 1 >= H) return false;
    if (at(x, h, z) !== GRASS) return false;
    if (at(x, h + 1, z) !== AIR || at(x, h + 2, z) !== AIR || at(x, top, z) !== AIR) return false;
    var y, dx, dz, leafY;
    for (y = h + 1; y <= top; y++) put(x, y, z, LOG);
    // Leaves stay on the crown. The trunk below the top log is bare, so an
    // eye-level punch hits LOG and drops wood instead of a leaf in front.
    for (leafY = top; leafY <= top + 1; leafY++) {
      for (dx = -1; dx <= 1; dx++) {
        for (dz = -1; dz <= 1; dz++) {
          if (dx === 0 && dz === 0 && leafY === top) continue;
          if (leafY === top + 1 && Math.abs(dx) + Math.abs(dz) > 1) continue;
          if (at(x + dx, leafY, z + dz) === AIR) put(x + dx, leafY, z + dz, LEAF);
        }
      }
    }
    return true;
  }
  function forestCenters() {
    return [
      { x: 11 + (worldSeed % 8), z: 28 + ((worldSeed >> 3) % 12), r: 11 },
      { x: 36 + ((worldSeed >> 5) % 16), z: 16 + ((worldSeed >> 8) % 10), r: 8.5 },
      { x: 48 + ((worldSeed >> 2) % 10), z: 62 + ((worldSeed >> 4) % 14), r: 9 }
    ];
  }
  function inForest(x, z, centers) {
    var i, c;
    for (i = 0; i < centers.length; i++) {
      c = centers[i];
      if (Math.hypot(x - c.x, z - c.z) < c.r) return true;
    }
    return false;
  }
  function houseAt(x, z) {
    var houses = village && village.houses, i, h;
    if (!houses) return false;
    for (i = 0; i < houses.length; i++) {
      h = houses[i];
      if (x >= h.x && x < h.x + 5 && z >= h.z && z < h.z + 5) return true;
    }
    return false;
  }
  function listTrees() {
    var out = [], x, z, y, n;
    for (z = 0; z < D; z++) {
      for (x = 0; x < W; x++) {
        if (houseAt(x, z)) continue;
        n = 0;
        for (y = 0; y < H; y++) if (at(x, y, z) === LOG) n++;
        if (n >= 3) out.push({ x: x, z: z });
      }
    }
    return out;
  }
  function treeStats() {
    var trees = listTrees(), i, d, best = 999, near = 0;
    for (i = 0; i < trees.length; i++) {
      d = Math.hypot(trees[i].x + 0.5 - spawn.x, trees[i].z + 0.5 - spawn.z);
      if (d < best) best = d;
      if (d <= 18) near++;
    }
    return { n: trees.length, near: near, nearest: best };
  }
  function ensureGrove() {
    var trees = listTrees(), i, d, best = 999, near = 0, guard = 0, n = 0, ang, rad, x, z, top;
    for (i = 0; i < trees.length; i++) {
      d = Math.hypot(trees[i].x + 0.5 - 18.5, trees[i].z + 0.5 - 12.5);
      if (d < best) best = d;
      if (d <= 16) near++;
    }
    if (trees.length >= 12 && best <= 15 && near >= 4) return;
    while (n < 8 && guard < 140) {
      guard++;
      ang = guard * 2.399963;
      rad = 9 + (guard % 5);
      x = Math.round(18 + Math.cos(ang) * rad);
      z = Math.round(12 + Math.sin(ang) * rad);
      if (x < 2 || z < 2 || x >= W - 2 || z >= D - 2) continue;
      top = highestSolid(x, z);
      if (top < 2 || at(x, top, z) !== GRASS) continue;
      if (Math.abs(z - riverZ(x)) < 3.4) continue;
      if (Math.hypot(x - 18, z - 12) < 8) continue;
      if (placeTree(x, z, top)) n++;
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
  function highestSolid(x, z) {
    var y;
    for (y = H - 1; y >= 0; y--) if (solid(x, y, z)) return y;
    return -1;
  }
  function standColumn(x, z) {
    x |= 0; z |= 0;
    if (x < 1 || z < 1 || x >= W - 1 || z >= D - 1) return null;
    var top = highestSolid(x, z);
    if (top < 1 || top + 2 >= H) return null;
    var feet = top + 1;
    var y;
    for (y = feet; y < H; y++) {
      if (solid(x, y, z) || at(x, y, z) === WATER) return null;
    }
    if (overlaps(x + 0.5, feet, z + 0.5)) return null;
    return { x: x + 0.5, y: feet, z: z + 0.5, ground: at(x, top, z), top: top };
  }
  function cliffCost(x, z, top) {
    var n = 0, dx, dz, h;
    for (dx = -1; dx <= 1; dx++) {
      for (dz = -1; dz <= 1; dz++) {
        if (!dx && !dz) continue;
        h = highestSolid(x + dx, z + dz);
        if (h > top + 1) n += h - top;
      }
    }
    return n;
  }
  function pickSurface(preferX, preferZ, minDist) {
    var relaxed, best, bestScore, x, z, spot, dist, score;
    minDist = minDist || 0;
    for (relaxed = 0; relaxed < 2; relaxed++) {
      best = null;
      bestScore = 1e9;
      for (x = 1; x < W - 1; x++) {
        for (z = 1; z < D - 1; z++) {
          spot = standColumn(x, z);
          if (!spot) continue;
          if (!relaxed && spot.ground !== GRASS && spot.ground !== SAND) continue;
          dist = Math.hypot(spot.x - preferX, spot.z - preferZ);
          if (dist < minDist) continue;
          score = (spot.x - 18) * (spot.x - 18) + (spot.z - 12) * (spot.z - 12);
          score += dist * dist * 0.2;
          if (spot.ground === SAND) score += 36;
          if (spot.ground !== GRASS && spot.ground !== SAND) score += 90;
          score += cliffCost(x, z, spot.top) * 7;
          if (Math.abs(z - riverZ(x)) < 3.2) score += 28;
          if (score < bestScore) { bestScore = score; best = spot; }
        }
      }
      if (best) return best;
    }
    return standColumn(18, 12) || { x: 18.5, y: SEA + 2, z: 12.5, ground: GRASS, top: SEA + 1 };
  }
  function findSpawn() {
    spawn = pickSurface(18, 12, 0);
    return spawn;
  }
  function openYaw(px, eyeY, pz) {
    var best = 0, bestD = -1, i, a, d, t, x, y, z, dx, dz;
    for (i = 0; i < 8; i++) {
      a = i * Math.PI / 4;
      dx = Math.sin(a);
      dz = -Math.cos(a);
      d = 24;
      for (t = 0.8; t < 24; t += 0.8) {
        x = Math.floor(px + dx * t);
        y = Math.floor(eyeY);
        z = Math.floor(pz + dz * t);
        if (solid(x, y, z)) { d = t; break; }
      }
      if (d > bestD) { bestD = d; best = a; }
    }
    return best;
  }
  function feetClear(px, py, pz) {
    if (!isFinite(px) || !isFinite(py) || !isFinite(pz)) return false;
    if (overlaps(px, py, pz)) return false;
    var x0 = Math.floor(px - 0.2), x1 = Math.floor(px + 0.2);
    var z0 = Math.floor(pz - 0.2), z1 = Math.floor(pz + 0.2);
    var feet = Math.floor(py + 0.02);
    var head = Math.floor(py + 1.5);
    var x, z, y, supported = false;
    if (feet < 1 || head >= H) return false;
    for (x = x0; x <= x1; x++) {
      for (z = z0; z <= z1; z++) {
        if (x < 0 || z < 0 || x >= W || z >= D) return false;
        for (y = feet; y <= head; y++) {
          if (solid(x, y, z) || at(x, y, z) === WATER) return false;
        }
        for (y = head + 1; y < H; y++) if (solid(x, y, z)) return false;
        if (solid(x, feet - 1, z)) supported = true;
      }
    }
    return supported;
  }
  function putOnGround(spot) {
    state.px = spot.x;
    state.py = spot.y;
    state.pz = spot.z;
    state.vy = 0;
    state.ride = -1;
    state.knockX = 0;
    state.knockZ = 0;
    fallPeak = null;
    state.pitch = 0;
    state.yaw = openYaw(spot.x, spot.y + 1.5, spot.z);
  }
  function wearingArmor() {
    var id = state.equip.armor;
    return !!(id && ARMOR_CUT[id] && (state.inv[id] | 0) > 0);
  }
  function mitigate(n) {
    var id = state.equip.armor;
    var cut = (id && (state.inv[id] | 0) > 0) ? (ARMOR_CUT[id] || 0) : 0;
    var dealt = cut ? Math.max(0, Math.round(n * (1 - cut))) : n;
    if (cut) {
      if (!state.armorLeft) state.armorLeft = ARMOR_MAX[id] || 20;
      state.armorSoak = (state.armorSoak || 0) + n;
      while (state.armorSoak >= 4) {
        state.armorSoak -= 4;
        state.armorLeft -= 1;
        if (state.armorLeft <= 0) {
          state.inv[id] = Math.max(0, (state.inv[id] | 0) - 1);
          state.equip.armor = '';
          state.armorLeft = 0;
          toast('护甲坏了');
          break;
        }
      }
    }
    return dealt;
  }
  function renderHp() {
    var text = $('hpText'), fill = $('hpFill');
    if (text) text.textContent = '血 ' + state.hp + (wearingArmor() ? ' · 护甲' : '');
    if (fill) fill.style.width = Math.max(0, Math.round(state.hp / HP_MAX * 100)) + '%';
  }
  function hurt(n, why) {
    n = mitigate(n);
    state.hp -= n;
    if (state.hp < 0) state.hp = 0;
    var flash = $('hurt');
    if (flash) {
      flash.classList.remove('on');
      void flash.offsetWidth;
      flash.classList.add('on');
    }
    renderHp();
    if (why) toast(why);
    if (state.hp <= 0) {
      state.hp = HP_MAX;
      findSpawn();
      putOnGround(spawn);
      renderHp();
      toast('血没了，回到地面');
    }
  }
  function groundFeet(x, z) {
    var top = highestSolid(x | 0, z | 0);
    if (top < 0) return null;
    if (at(x | 0, top + 1, z | 0) === WATER) return null;
    return top + 1;
  }
  function carveHouse(x, z, floorY) {
    var dx, dz, y;
    for (dx = 0; dx <= 4; dx++) {
      for (dz = 0; dz <= 4; dz++) {
        for (y = floorY + 1; y <= floorY + 4; y++) put(x + dx, y, z + dz, AIR);
        put(x + dx, floorY, z + dz, STONE);
      }
    }
    for (y = floorY + 1; y <= floorY + 3; y++) {
      for (dx = 0; dx <= 4; dx++) {
        put(x + dx, y, z, LOG);
        put(x + dx, y, z + 4, LOG);
      }
      for (dz = 1; dz <= 3; dz++) {
        put(x, y, z + dz, LOG);
        put(x + 4, y, z + dz, LOG);
      }
    }
    put(x + 2, floorY + 1, z, AIR);
    put(x + 2, floorY + 2, z, AIR);
    for (dx = 0; dx <= 4; dx++) {
      for (dz = 0; dz <= 4; dz++) put(x + dx, floorY + 4, z + dz, LEAF);
    }
    put(x + 1, floorY + 1, z + 2, BED);
    put(x + 3, floorY + 1, z + 2, CHEST);
  }
  function buildVillage() {
    var best = null, bestScore = 1e9, x, z, spot, sc, pass;
    for (pass = 0; pass < 2 && !best; pass++) {
      for (x = 14; x < W - 14; x += 2) {
        for (z = 26; z < D - 10; z += 2) {
          spot = standColumn(x, z);
          if (!spot || spot.ground !== GRASS) continue;
          if (Math.abs(z - riverZ(x)) < 6) continue;
          if (pass === 0 && (spot.top > SEA + 4 || spot.top < SEA - 1)) continue;
          sc = (x - 24) * (x - 24) + (z - 36) * (z - 36) + (spot.top - (SEA + 1)) * (spot.top - (SEA + 1)) * 6;
          if (sc < bestScore) { bestScore = sc; best = spot; }
        }
      }
      bestScore = 1e9;
    }
    if (!best) {
      var fx, fz, top;
      for (fx = 18; fx <= 34 && !best; fx += 2) {
        for (fz = 28; fz <= 46; fz += 2) {
          top = highestSolid(fx, fz);
          if (top >= 2 && top < SEA + 8 && at(fx, top, fz) !== WATER) {
            best = { x: fx + 0.5, z: fz + 0.5, top: top, ground: GRASS };
            break;
          }
        }
      }
    }
    if (!best) best = { x: 24.5, z: 36.5, top: 8, ground: GRASS };
    var cx = best.x | 0, cz = best.z | 0, gy = best.top;
    var houses = [{ x: cx, z: cz }, { x: cx + 6, z: cz + 1 }, { x: cx + 1, z: cz + 6 }];
    var dx, dz, y, hi;
    for (dx = -4; dx <= 12; dx++) {
      for (dz = -4; dz <= 12; dz++) {
        x = cx + dx; z = cz + dz;
        if (x < 1 || z < 1 || x >= W - 1 || z >= D - 1) continue;
        for (y = gy + 1; y < H; y++) if (at(x, y, z)) put(x, y, z, AIR);
        if (at(x, gy, z) !== GRASS && at(x, gy, z) !== SAND) {
          put(x, gy, z, GRASS);
          if (gy > 0 && at(x, gy - 1, z) === STONE) put(x, gy - 1, z, DIRT);
        }
      }
    }
    for (hi = 0; hi < houses.length; hi++) {
      if (houses[hi].x < 1 || houses[hi].z < 1 || houses[hi].x + 4 >= W || houses[hi].z + 4 >= D) continue;
      carveHouse(houses[hi].x, houses[hi].z, gy);
    }
    village = { x: cx + 5.5, z: cz + 5.5, y: gy + 1, houses: houses };
    armorDrop = { x: cx - 1.5, y: gy + 1, z: cz + 2.5, taken: false };
  }
  function canopy(x, z) {
    var n = 0, dx, dz, y, id;
    for (dx = -2; dx <= 2; dx++) {
      for (dz = -2; dz <= 2; dz++) {
        for (y = SEA; y < H; y++) {
          id = at(x + dx, y, z + dz);
          if (id === LOG || id === LEAF) n++;
        }
      }
    }
    return n;
  }
  function openPads(n) {
    var out = [], pass, x, z, spot, i, ok;
    for (pass = 0; pass < 2 && out.length < n; pass++) {
      for (z = 4; z < D - 4 && out.length < n; z += 3) {
        for (x = 6; x < W - 6 && out.length < n; x += 3) {
          spot = standColumn(x, z);
          if (!spot || spot.ground !== GRASS) continue;
          if (pass === 0 && (spot.top < SEA || spot.top > SEA + 3)) continue;
          if (pass === 0 && canopy(x, z) > 2) continue;
          if (Math.abs(z - riverZ(x)) < 5) continue;
          if (village && Math.hypot(spot.x - village.x, spot.z - village.z) < 9) continue;
          if (Math.hypot(spot.x - spawn.x, spot.z - spawn.z) < 7) continue;
          ok = true;
          for (i = 0; i < out.length; i++) {
            if (Math.hypot(out[i].x - spot.x, out[i].z - spot.z) < 5) ok = false;
          }
          if (ok) out.push(spot);
        }
      }
    }
    while (out.length < n) out.push({ x: 12 + out.length * 2.5, z: 22, y: SEA + 1, top: SEA });
    return out;
  }
  function spawnMobs() {
    pigs.splice(0, pigs.length);
    cows.splice(0, cows.length);
    sheep.splice(0, sheep.length);
    chickens.splice(0, chickens.length);
    villagers.splice(0, villagers.length);
    if (!village) return;
    var i, feet, pads = openPads(17);
    for (i = 0; i < 4; i++) {
      villagers.push({
        x: village.x + (i - 1.5) * 1.6,
        z: village.z + 1.2,
        y: village.y,
        yaw: 0.4 * i,
        alive: true
      });
    }
    for (i = 0; i < 5; i++) {
      feet = groundFeet(pads[i].x, pads[i].z);
      pigs.push({
        x: pads[i].x, z: pads[i].z,
        y: feet == null ? pads[i].top + 1 : feet,
        yaw: i, alive: true, hp: PIG_HP, cool: 0
      });
    }
    for (i = 0; i < 4; i++) {
      feet = groundFeet(pads[5 + i].x, pads[5 + i].z);
      cows.push({
        x: pads[5 + i].x, z: pads[5 + i].z,
        y: feet == null ? pads[5 + i].top + 1 : feet,
        yaw: 1.2, alive: true, hp: COW_HP, mad: false, cool: 0, tame: 0
      });
    }
    for (i = 0; i < 4; i++) {
      feet = groundFeet(pads[9 + i].x, pads[9 + i].z);
      sheep.push({
        x: pads[9 + i].x, z: pads[9 + i].z,
        y: feet == null ? pads[9 + i].top + 1 : feet,
        yaw: 0.4, alive: true, hp: SHEEP_HP, cool: 0, flee: 0, wool: 1
      });
    }
    for (i = 0; i < 4; i++) {
      feet = groundFeet(pads[13 + i].x, pads[13 + i].z);
      chickens.push({
        x: pads[13 + i].x, z: pads[13 + i].z,
        y: feet == null ? pads[13 + i].top + 1 : feet,
        yaw: 0.8, alive: true, hp: CHICKEN_HP, flee: 0
      });
    }
  }
  function buildVolcano() {
    var cx = 80, cz = 52;
    if (cx > W - 8) cx = W - 8;
    if (cz > D - 8) cz = D - 8;
    var base = SEA + 2;
    var x, z, y, dx, dz, dist, top, h;
    for (dx = -7; dx <= 7; dx++) {
      for (dz = -7; dz <= 7; dz++) {
        x = cx + dx; z = cz + dz;
        if (x < 1 || z < 1 || x >= W - 1 || z >= D - 1) continue;
        dist = Math.hypot(dx, dz);
        if (dist > 6.4) continue;
        h = Math.round((1 - dist / 6.4) * 6);
        top = base + h;
        for (y = 0; y < H; y++) {
          if (y < base - 1) {
            if (at(x, y, z) === AIR || at(x, y, z) === WATER) put(x, y, z, STONE);
          } else if (y < top) put(x, y, z, STONE);
          else put(x, y, z, AIR);
        }
        if (h >= 4 && dist > 4.1 && hash2(x, z, 44) < 0.55) put(x, top - 1, z, COAL_ORE);
      }
    }
    var pool = [];
    var floor = base + 3;
    for (dx = -2; dx <= 2; dx++) {
      for (dz = -2; dz <= 2; dz++) {
        if (dx * dx + dz * dz > 4) continue;
        x = cx + dx; z = cz + dz;
        for (y = floor; y < H; y++) put(x, y, z, AIR);
        put(x, floor - 1, z, STONE);
        if (dx * dx + dz * dz <= 2) pool.push({ x: x, y: floor, z: z });
      }
    }
    put(cx - 3, floor, cz, AIR);
    put(cx - 3, floor + 1, cz, AIR);
    put(cx - 4, floor, cz, AIR);
    put(cx - 4, floor + 1, cz, AIR);
    volcano = { cx: cx, cz: cz, base: base, floor: floor, lip: floor + 4, pool: pool, r: 6 };
  }
  function seedCoalNear() {
    var n = 0, g = 0, x, z, y;
    while (n < 5 && g < 70) {
      g++;
      x = 20 + ((g * 5 + (worldSeed % 5)) % 16);
      z = 14 + ((g * 7) % 14);
      for (y = 2; y <= 5; y++) {
        if (at(x, y, z) === STONE) { put(x, y, z, COAL_ORE); n++; break; }
      }
    }
  }
  function volcanoPhase(clock) {
    var c = clock == null ? (state.match || 0) : clock;
    if (c < VOLCANO_FIRST) return { on: false, t: 0, index: -1 };
    var since = c - VOLCANO_FIRST;
    var index = Math.floor(since / VOLCANO_PERIOD);
    var t = since - index * VOLCANO_PERIOD;
    return { on: t >= 0 && t < VOLCANO_DUR, t: t, index: index };
  }
  function syncVolcano() {
    if (!volcano || !volcano.pool) return;
    var phase = volcanoPhase();
    var mode = phase.on ? 'lava' : (phase.index >= 0 ? 'magma' : 'air');
    var id = mode === 'lava' ? LAVA : (mode === 'magma' ? MAGMA : AIR);
    var i, c, changed = false;
    for (i = 0; i < volcano.pool.length; i++) {
      c = volcano.pool[i];
      if (at(c.x, c.y, c.z) !== id) { put(c.x, c.y, c.z, id); changed = true; }
    }
    var tok = mode + ':' + phase.index;
    var prev = state._volcanoTok || '';
    if (changed && tok !== prev) {
      if (mode === 'lava' && prev.indexOf('lava:') !== 0) toast('火山喷发了，两边在掉石头');
      if (mode === 'magma' && prev.indexOf('magma:') !== 0) toast('岩浆退了，地上留下烫烫的残渣');
    }
    state._volcanoTok = tok;
  }
  function rockAt(index, slot, side, age) {
    if (!volcano) return null;
    var dir = side ? 1 : -1;
    return {
      x: volcano.cx + 0.5 + dir * (2.5 + age * 3.6),
      y: volcano.floor + 7 - age * age * 5.4,
      z: volcano.cz + 0.5 + dir * 0.2,
      side: side,
      id: index + ':' + slot + ':' + side
    };
  }
  function activeRocks() {
    if (!volcano) return [];
    var phase = volcanoPhase();
    if (!phase.on) return [];
    var out = [], slot, side, age, maxSlot = Math.floor(phase.t / ROCK_GAP);
    if (maxSlot > 40) maxSlot = 40;
    for (slot = 0; slot <= maxSlot; slot++) {
      age = phase.t - slot * ROCK_GAP;
      if (age < 0 || age > ROCK_LIFE) continue;
      for (side = 0; side < 2; side++) out.push(rockAt(phase.index, slot, side, age));
    }
    return out;
  }
  function tickRocks() {
    var rocks = activeRocks(), i, r, dx, dy, dz;
    if (!state.rockHit) state.rockHit = {};
    for (i = 0; i < rocks.length; i++) {
      r = rocks[i];
      if (!r || state.rockHit[r.id]) continue;
      dx = r.x - state.px;
      dy = r.y - (state.py + 0.8);
      dz = r.z - state.pz;
      if (dx * dx + dy * dy + dz * dz < 0.75) {
        state.rockHit[r.id] = 1;
        hurt(2, '石头砸到了');
      }
    }
  }
  function coverClear(t) {
    if (!t || !t.buried) return true;
    if (!t.cover) return true;
    return at(t.cover.x, t.cover.y, t.cover.z) === AIR;
  }
  function treasureById(id) {
    var i;
    for (i = 0; i < treasures.length; i++) if (treasures[i].id === id) return treasures[i];
    return null;
  }
  function placeTreasures() {
    var kept = {}, i;
    for (i = 0; i < treasures.length; i++) {
      if (treasures[i].taken) kept[treasures[i].id] = { taken: treasures[i].taken, taker: treasures[i].taker };
    }
    treasures = [];
    var used = [];
    var sp = spawn || { x: 18.5, z: 12.5 };
    function far(x, z) {
      var k;
      for (k = 0; k < used.length; k++) if (Math.hypot(used[k].x - x, used[k].z - z) < 7) return false;
      if (Math.hypot(x + 0.5 - sp.x, z + 0.5 - sp.z) < 6) return false;
      return true;
    }
    function takeSpot(pred) {
      var guard, x, z, top, id;
      for (guard = 0; guard < 500; guard++) {
        x = 2 + ((guard * 17 + (worldSeed % 97)) % (W - 4));
        z = 2 + ((guard * 29 + ((worldSeed * 3) % 89)) % (D - 4));
        top = highestSolid(x, z);
        if (top < 1) continue;
        id = at(x, top, z);
        if (houseAt(x, z)) continue;
        if (!far(x, z)) continue;
        if (!pred(x, z, top, id)) continue;
        used.push({ x: x, z: z });
        return { x: x, z: z, top: top, id: id };
      }
      return null;
    }
    function add(def, spot, buried) {
      if (!spot) spot = { x: 8 + treasures.length * 3, z: 8, top: SEA, id: GRASS };
      var prev = kept[def.id];
      treasures.push({
        id: def.id, name: def.name, score: def.score, shape: def.shape,
        x: spot.x + 0.5, y: buried ? spot.top : spot.top + 1, z: spot.z + 0.5,
        buried: buried ? 1 : 0,
        cover: buried ? { x: spot.x, y: spot.top, z: spot.z } : null,
        taken: prev ? prev.taken : '',
        taker: prev ? prev.taker : ''
      });
    }
    add({ id: 'star', name: '小星星', score: 12, shape: 'star' }, takeSpot(function (x, z, top, id) {
      var d = Math.hypot(x + 0.5 - sp.x, z + 0.5 - sp.z);
      return id === GRASS && d >= 8 && d <= 20;
    }), false);
    add({ id: 'shell', name: '海贝', score: 18, shape: 'shell' }, takeSpot(function (x, z, top, id) {
      return id === SAND && x < 24;
    }), false);
    add({ id: 'gem', name: '绿宝石', score: 22, shape: 'gem' }, takeSpot(function (x, z, top, id) {
      return id === GRASS && Math.hypot(x - sp.x, z - sp.z) > 24;
    }), false);
    add({ id: 'crystal', name: '蓝水晶', score: 35, shape: 'crystal' }, takeSpot(function (x, z, top, id) {
      return id === GRASS && inForest(x, z, forestCenters());
    }), false);
    add({ id: 'idol', name: '雪人宝', score: 55, shape: 'idol' }, takeSpot(function (x, z, top, id) {
      return id === SNOW;
    }), true);
    var emberSpot = null;
    if (volcano && volcano.pool && volcano.pool.length) {
      var p0 = volcano.pool[0];
      emberSpot = { x: p0.x, z: p0.z, top: p0.y, id: AIR };
      used.push({ x: p0.x, z: p0.z });
    }
    add({ id: 'ember', name: '火晶', score: 45, shape: 'ember' }, emberSpot, false);
    if (emberSpot) {
      var em = treasures[treasures.length - 1];
      em.x = emberSpot.x + 0.5;
      em.y = emberSpot.top;
      em.z = emberSpot.z + 0.5;
      em.buried = 0;
      em.cover = null;
    }
    add({ id: 'crown', name: '小王冠', score: 70, shape: 'crown' }, takeSpot(function (x, z, top, id) {
      return x > W * 0.7 && z > D * 0.5 && (id === GRASS || id === DIRT || id === SNOW || id === STONE || id === COAL_ORE);
    }), true);
  }
  function grantScore(tr) {
    if (!tr) return;
    if (!state.scored) state.scored = {};
    if (state.scored[tr.id]) return;
    state.scored[tr.id] = 1;
    state.score = (state.score | 0) + tr.score;
    toast(tr.name + ' +' + tr.score);
    renderHud();
    if (state.matchOver) showMatchEnd();
  }
  function announceLoot(tr) {
    emit({ t: 'loot', id: tr.id, who: tr.taken, name: tr.taker, score: tr.score });
  }
  function tryTake() {
    var best = null, bestD = 1.35, i, t, d;
    for (i = 0; i < treasures.length; i++) {
      t = treasures[i];
      if (!t || t.taken) continue;
      if (t.buried && !coverClear(t)) continue;
      d = Math.hypot(t.x - state.px, t.z - state.pz);
      if (Math.abs((t.y || 0) - state.py) > 2.2) continue;
      if (d < bestD) { bestD = d; best = t; }
    }
    if (!best) return false;
    if (netRole === 'guest') {
      if (best.askAt && state.match - best.askAt < 0.8) return false;
      best.askAt = state.match || 0;
      emit({ t: 'lootAsk', id: best.id, name: state.name });
      return true;
    }
    best.taken = selfId;
    best.taker = state.name;
    grantScore(best);
    announceLoot(best);
    return true;
  }
  function grow(seed, keepPos) {
    worldSeed = (seed >>> 0) || 1;
    blocks = new Uint8Array(W * H * D);
    village = null;
    armorDrop = null;
    var x, z, y, h, id, topId, woods, centers = forestCenters();
    for (z = 0; z < D; z++) {
      for (x = 0; x < W; x++) {
        h = heightAt(x, z);
        topId = GRASS;
        if (h >= SEA + 5) topId = SNOW;
        else if (h <= SEA) topId = SAND;
        if (topId === SNOW && hash2(x, z, 15) < 0.07) topId = IRON_ORE;
        for (y = 0; y <= h; y++) {
          id = STONE;
          if (topId === GRASS) {
            if (y === h) id = GRASS;
            else if (y >= h - 2) id = DIRT;
          } else if (topId === SAND) {
            if (y >= h - 1) id = SAND;
          } else if (topId === SNOW) {
            if (y === h) id = SNOW;
            else if (y >= h - 1) id = DIRT;
          } else if (topId === IRON_ORE) {
            if (y === h) id = IRON_ORE;
            else if (y >= h - 1) id = DIRT;
          }
          if (id === STONE && y > 0 && y <= 5 && y < h && hash2(x + y * 17, z + y * 3, 4) < 0.04) id = GOLD;
          else if (id === STONE && y > 1 && y <= 8 && y < h && hash2(x + y * 9, z + 4, 6) < 0.05) id = IRON_ORE;
          else if (id === STONE && y > 1 && y <= 7 && y < h && hash2(x + y * 13, z + 9, 31) < 0.055) id = COAL_ORE;
          put(x, y, z, id);
        }
        if (h < SEA) {
          for (y = h + 1; y < SEA; y++) put(x, y, z, WATER);
        }
      }
    }
    for (z = 1; z < D - 1; z++) {
      for (x = 1; x < W - 1; x++) {
        h = highestSolid(x, z);
        if (h < 2 || at(x, h, z) !== GRASS) continue;
        if (Math.abs(z - riverZ(x)) < 3.6) continue;
        if (Math.hypot(x - 18, z - 12) < 7.5) continue;
        woods = inForest(x, z, centers);
        if (woods && hash2(x, z, 9) < 0.55) placeTree(x, z, h);
        else if (!woods && hash2(x, z, 9) < 0.02) placeTree(x, z, h);
        else if (hash2(x, z, 31) < 0.02 && h >= SEA && h <= SEA + 3 && Math.hypot(x - 18, z - 12) > 10) put(x, h, z, COAL_ORE);
        else if (hash2(x, z, 10) < 0.08 && at(x, h + 1, z) === AIR) put(x, h + 1, z, FLOWER);
        else if (hash2(x, z, 11) < 0.01 && at(x, h + 1, z) === AIR) put(x, h + 1, z, CHEST);
      }
    }
    buildVillage();
    ensureGrove();
    buildVolcano();
    seedCoalNear();
    findSpawn();
    ensureChests();
    if (!keepPos) {
      treasures = [];
      state.score = 0;
      state.scored = {};
      state.match = 0;
      state.matchOver = false;
      state.rockHit = {};
      state.burn = 0;
      var endEl = $('matchEnd');
      if (endEl) { endEl.hidden = true; endEl.innerHTML = ''; }
    }
    placeTreasures();
    if (!feetClear(spawn.x, spawn.y, spawn.z)) findSpawn();
    if (!keepPos) {
      boats.splice(0, boats.length);
      putOnGround(spawn);
      state.hp = HP_MAX;
      state.knockX = 0;
      state.knockZ = 0;
      fallPeak = null;
    }
    if (!suppressMobs) spawnMobs();
    syncVolcano();
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
      if (id < 0 || id > COAL_ORE) return;
      put(+p[0], +p[1], +p[2], id);
    });
    dirty = true;
  }
  function collectEdits() {
    var keep = blocks;
    var saved = { px: state.px, py: state.py, pz: state.pz, ride: state.ride };
    suppressMobs = true;
    grow(worldSeed, true);
    suppressMobs = false;
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
    findSpawn();
    boats.splice(0, boats.length);
    (raw.boats || []).forEach(function (b) {
      if (b && b.length >= 2 && isFinite(+b[0]) && isFinite(+b[1])) boats.push({ x: +b[0], z: +b[1] });
    });
    state.inv = blankInv();
    INV_KEYS.forEach(function (k) { if (carried[k] > 0) state.inv[k] = carried[k]; });
    state.equip.weapon = raw.equip && SLOT_WORD.weapon[raw.equip.weapon] ? raw.equip.weapon : '';
    state.equip.armor = raw.equip && SLOT_WORD.armor[raw.equip.armor] ? raw.equip.armor : '';
    state.equip.tool = raw.equip && SLOT_WORD.tool[raw.equip.tool] ? raw.equip.tool : '';
    if (state.equip.weapon && !state.inv[state.equip.weapon]) state.equip.weapon = '';
    if (state.equip.armor && !(state.inv[state.equip.armor] > 0)) state.equip.armor = '';
    if (state.equip.tool && !(state.inv[state.equip.tool] > 0)) state.equip.tool = '';
    if (raw.hold === 'torch' || raw.hold === 'boat' || raw.hold === 'hand') state.hold = raw.hold;
    if (raw.name) state.name = cleanName(raw.name);
    if (isFinite(raw.clock) && raw.clock >= 0) state.clock = raw.clock % (DAY * 20);
    if (isFinite(raw.match) && raw.match >= 0) state.match = raw.match;
    syncVolcano();
    if (isFinite(raw.yaw)) state.yaw = raw.yaw;
    if (isFinite(raw.pitch)) state.pitch = Math.max(-1.2, Math.min(1.2, raw.pitch));
    if (isFinite(raw.px) && feetClear(raw.px, raw.py, raw.pz)) {
      state.px = raw.px; state.py = raw.py; state.pz = raw.pz;
    } else {
      putOnGround(spawn);
    }
  }
  function freshGame() {
    lockHome = false;
    home = null;
    state.inv = blankInv();
    state.equip.weapon = '';
    state.equip.armor = '';
    state.equip.tool = '';
    state.hold = 'hand';
    state.clock = 0;
    state.ride = -1;
    state.sitting = null;
    state.hp = HP_MAX;
    state.knockX = 0;
    state.knockZ = 0;
    state.gotHost = false;
    state.armorSoak = 0;
    state.armorLeft = 0;
    state.dur = { axe: 40, pick: 80, pickIron: 160 };
    state.ach = {};
    state.cold = 0;
    state.coldTold = 0;
    state.burn = 0;
    state.burnTold = 0;
    state.score = 0;
    state.scored = {};
    state.match = 0;
    state.matchOver = false;
    state.mix = [];
    state.rockHit = {};
    state._volcanoTok = '';
    state.emote = '';
    state.emoteUntil = 0;
    fallPeak = null;
    grow(newSeed(), false);
    try { localStorage.removeItem(STORE); } catch (e) {}
  }
  function load() {
    freshGame();
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
    var ox = state.px, oy = state.py, oz = state.pz;
    var xHit = false, zHit = false;
    if (dx) {
      state.px += dx;
      if (overlaps(state.px, state.py, state.pz)) { state.px = ox; xHit = true; }
    }
    if (dz) {
      state.pz += dz;
      if (overlaps(state.px, state.py, state.pz)) { state.pz = oz; zHit = true; }
    }
    if ((xHit || zHit) && (dx || dz) && inWaterAt(ox, oy, oz)) {
      if (!tryShore(ox, oy, oz, dx, dz)) { /* stay blocked */ }
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
  function toolLeft(id) {
    if (!state.dur) state.dur = { axe: 40, pick: 80, pickIron: 160 };
    if (state.dur[id] == null && GEAR[id] && GEAR[id].dur) state.dur[id] = GEAR[id].dur;
    return state.dur[id] | 0;
  }
  function wearTool(id) {
    if (!id || !TOOL_MAX[id]) return;
    state.dur[id] = toolLeft(id) - 1;
    if (state.dur[id] <= 0) {
      state.inv[id] = Math.max(0, (state.inv[id] | 0) - 1);
      if (state.equip.tool === id) state.equip.tool = '';
      toast((NAMES[id] || '工具') + '用坏了');
    }
  }
  function breakTime(id) {
    var base = 0.4;
    if (id === LEAF || id === FLOWER || id === TORCH) base = 0.16;
    else if (id === LOG) base = 0.55;
    else if (id === SNOW) base = 0.22;
    else if (id === STONE || id === GOLD || id === IRON_ORE) base = 0.75;
    else if (id === CHEST) base = 0.4;
    var eff = 0.55;
    var tool = state.equip.tool;
    var gear = GEAR[tool];
    if (id === LOG && tool === 'axe' && toolLeft('axe') > 0) eff = 1.0;
    if (id === LOG && gear && gear.chop && toolLeft(tool) > 0 && gear.chop > eff) eff = gear.chop;
    if ((id === STONE || id === GOLD || id === IRON_ORE || id === COAL_ORE) && tool === 'pick' && toolLeft('pick') > 0) eff = 1.5;
    if ((id === STONE || id === GOLD || id === IRON_ORE || id === COAL_ORE) && tool === 'pickIron' && toolLeft('pickIron') > 0) eff = 2.0;
    if ((id === STONE || id === GOLD || id === IRON_ORE || id === COAL_ORE) && gear && gear.mine && toolLeft(tool) > 0 && gear.mine > eff) eff = gear.mine;
    return base / eff;
  }
  function dropOf(id) {
    if (id === LOG) return 'wood';
    if (id === LEAF) return 'leaf';
    if (id === GRASS || id === DIRT) return 'dirt';
    if (id === STONE) return 'stone';
    if (id === SAND) return 'sand';
    if (id === TORCH) return 'torch';
    if (id === BED) return 'bed';
    if (id === IRON_ORE) return 'iron';
    if (id === COAL_ORE) return 'coal';
    return null;
  }
  function meleeDmg() {
    var g = GEAR[state.equip.weapon];
    if (g) {
      if (g.night && dayFactor() < 0.2) return g.night;
      return g.dmg;
    }
    if (state.equip.weapon === 'swordIron') return 4;
    if (state.equip.weapon === 'swordStone') return 3;
    if (state.equip.weapon === 'swordWood') return 2;
    return 1;
  }
  function meleeReach() {
    var g = GEAR[state.equip.weapon];
    return (g && g.reach) || 2.4;
  }
  function inSnowTerritory() {
    var x = state.px | 0, z = state.pz | 0, top = highestSolid(x, z), feet;
    if (at(x, top, z) === SNOW) return true;
    feet = (state.py + 0.15) | 0;
    return at(x, feet, z) === SNOW || at(x, feet - 1, z) === SNOW;
  }
  function tickCold(dt) {
    if (state.equip.weapon === 'swordSun' && (state.inv.swordSun | 0) > 0) {
      state.cold = 0;
      state.coldTold = 0;
      return;
    }
    if (!inSnowTerritory()) { state.cold = 0; state.coldTold = 0; return; }
    state.cold = (state.cold || 0) + dt;
    if (!state.coldTold) { state.coldTold = 1; toast('小宇：山上冷，待久了会掉血'); }
    if (state.cold < COLD_EVERY) return;
    state.cold = 0;
    state.hp -= 1;
    if (state.hp < 0) state.hp = 0;
    var flash = $('hurt');
    if (flash) {
      flash.classList.remove('on');
      void flash.offsetWidth;
      flash.classList.add('on');
    }
    renderHp();
    if (state.hp <= 0) {
      state.hp = HP_MAX;
      state.cold = 0;
      findSpawn();
      putOnGround(spawn);
      renderHp();
      toast('冻着了，回到地面');
    }
  }
  function hotUnder() {
    var x = state.px | 0, z = state.pz | 0;
    var feet = (state.py + 0.2) | 0;
    var here = at(x, feet, z);
    var under = at(x, feet - 1, z);
    if (here === LAVA || under === LAVA) return 'lava';
    if (here === MAGMA || under === MAGMA) return 'magma';
    return '';
  }
  function tickBurn(dt) {
    var kind = hotUnder();
    if (!kind) { state.burn = 0; return; }
    state.burn = (state.burn || 0) + dt;
    if (!state.burnTold) {
      state.burnTold = 1;
      toast(kind === 'lava' ? '岩浆好烫' : '残渣烫脚');
    }
    var every = kind === 'lava' ? 0.55 : 1;
    if (state.burn < every) return;
    state.burn = 0;
    hurt(kind === 'lava' ? 2 : 1, kind === 'lava' ? '被岩浆灼伤' : '被残渣灼伤');
  }
  function cleanName(s) {
    s = String(s || '').replace(/\s+/g, '').slice(0, 8);
    return s || '朋友';
  }
  function markAch(key, label) {
    if (!state.ach) state.ach = {};
    if (state.ach[key]) return;
    state.ach[key] = 1;
    toast('贴纸：' + label);
    var box = $('stickers');
    if (box) {
      var s = document.createElement('i');
      s.textContent = label;
      box.appendChild(s);
    }
  }
  function startCook() {
    if ((state.inv.raw | 0) < 1) { toast('没有生肉'); return false; }
    state.cooking = 4;
    toast('开始烤，大约 4 秒');
    return true;
  }
  function eatFood(id) {
    if ((state.inv[id] | 0) < 1) return false;
    state.inv[id]--;
    var add = id === 'cooked' ? 5 : 2;
    state.hp = Math.min(HP_MAX, state.hp + add);
    toast((id === 'cooked' ? '熟肉 +5' : '生肉 +2') + '，血 ' + state.hp);
    renderHp();
    save();
    renderHud();
    return true;
  }
  function tryTrade() {
    var near = false, i;
    for (i = 0; i < villagers.length; i++) {
      if (Math.hypot(villagers[i].x - state.px, villagers[i].z - state.pz) < 2.4) near = true;
    }
    if (!near) { toast('走近村民再换'); return false; }
    if ((state.inv.raw | 0) < 1) { toast('要用一块生肉'); return false; }
    state.inv.raw--;
    state.inv.torch = (state.inv.torch | 0) + 1;
    toast('用肉换到 1 个火把');
    save();
    renderHud();
    return true;
  }
  function toast(text) {
    var el = $('toast');
    if (!el) return;
    el.textContent = text;
    toastUntil = Date.now() + 1400;
  }
  function renderHud() {
    var coins = $('coins');
    if (coins) coins.textContent = '金币 ' + (state.inv.gold | 0);
    var scoreLine = $('scoreLine');
    if (scoreLine) scoreLine.textContent = '宝物 ' + (state.score | 0);
    renderPack();
    renderMix();
    renderRecipeBook();
    var i;
    var nameLabel = $('nameLabel');
    if (nameLabel && !state.started) nameLabel.textContent = state.name;
    var gate = $('woodGate');
    if (gate) gate.textContent = '木头、石头、铁矿、煤炭放进格子，合成 12 种。小船仍要 10 个木头。';
    if (typeof document !== 'undefined') {
      var gates = document.querySelectorAll('#craft button[data-wood-gate]');
      for (i = 0; i < gates.length; i++) gates[i].disabled = (state.inv.wood | 0) < 1;
    }
    renderHp();
    paintClock();
    setNetStatus();
  }
  var PACK = [
    { id: 'wood', name: '木头', bg: '#b56a2a', core: 1 },
    { id: 'stone', name: '石头', bg: '#7f8cae', core: 1 },
    { id: 'iron', name: '铁矿', bg: '#b0b6c4', core: 1 },
    { id: 'coal', name: '煤炭', bg: '#2a2a2e', core: 1 },
    { id: 'torch', name: '火把', bg: '#f08a12', core: 1 },
    { id: 'boat', name: '船', bg: '#c47a28', core: 1 },
    { id: 'bed', name: '床', bg: '#e23b55', core: 1 },
    { id: 'stick', name: '木棍', bg: '#c47a28' },
    { id: 'axeStone', name: '石斧', bg: '#8d97ad' },
    { id: 'spear', name: '石矛', bg: '#8ea0c8' },
    { id: 'swordIron', name: '铁剑', bg: '#d5dbe6' },
    { id: 'hammer', name: '铁锤', bg: '#9aa3b5' },
    { id: 'rod', name: '铁棒', bg: '#c5ccd8' },
    { id: 'nightSword', name: '暗夜剑', bg: '#3c3f6b' },
    { id: 'axeVolcano', name: '火山斧', bg: '#e25822' },
    { id: 'hammerBlast', name: '爆裂锤', bg: '#c43a22' },
    { id: 'pickStar', name: '星火镐', bg: '#f0c040' },
    { id: 'swordSun', name: '暖阳剑', bg: '#f6a23a' },
    { id: 'armor', name: '叶衣', bg: '#1fa84a' },
    { id: 'leaf', name: '树叶', bg: '#2fbf4a', core: 1 },
    { id: 'dirt', name: '泥土', bg: '#a15a28', core: 1 },
    { id: 'sand', name: '沙子', bg: '#e6c04a', core: 1 },
    { id: 'gold', name: '金币', bg: '#f0c020' },
    { id: 'swordWood', name: '木剑', bg: '#d06a22' },
    { id: 'swordStone', name: '石剑', bg: '#8ea0c8' },
    { id: 'gun', name: '枪', bg: '#3a4258' },
    { id: 'pick', name: '石稿', bg: '#6d7488' },
    { id: 'axe', name: '木斧', bg: '#c47a28' },
    { id: 'pickIron', name: '铁镐', bg: '#9aa4b8' },
    { id: 'armorWood', name: '木甲', bg: '#b56a2a' },
    { id: 'armorIron', name: '铁甲', bg: '#8e96a8' },
    { id: 'shears', name: '剪刀', bg: '#d0d4de' },
    { id: 'wheat', name: '小麦', bg: '#e6c04a' },
    { id: 'wool', name: '羊毛', bg: '#f4f4f4' },
    { id: 'raw', name: '生肉', bg: '#e07070' },
    { id: 'cooked', name: '熟肉', bg: '#c45a28' }
  ];
  function packOn(cell) {
    if (cell.id === 'torch' || cell.id === 'boat' || cell.id === 'bed') return state.hold === cell.id;
    if (ARMOR_CUT[cell.id]) return state.equip.armor === cell.id;
    var g = GEAR[cell.id];
    if (g && g.slot === 'tool') return (state.equip.tool === cell.id || state.equip.weapon === cell.id) && state.hold === 'hand';
    if (g) return state.equip.weapon === cell.id && state.hold === 'hand';
    if (cell.id === 'pick' || cell.id === 'axe' || cell.id === 'pickIron') return state.equip.tool === cell.id && state.hold === 'hand';
    if (cell.id === 'swordWood' || cell.id === 'swordStone' || cell.id === 'swordIron' || cell.id === 'gun') return state.equip.weapon === cell.id && state.hold === 'hand';
    return false;
  }
  function selectPack(id) {
    var n = state.inv[id] | 0;
    if (n < 1 && id !== 'gold') { toast('小宇：背包里还没有'); return false; }
    var g = GEAR[id];
    if (g) {
      if (g.slot === 'tool') {
        var onTool = state.equip.tool === id;
        state.equip.tool = onTool ? '' : id;
        state.equip.weapon = onTool ? '' : id;
      } else {
        var onW = state.equip.weapon === id;
        state.equip.weapon = onW ? '' : id;
        if (!onW && (g.chop || g.mine)) state.equip.tool = id;
        else if (state.equip.tool === id) state.equip.tool = '';
      }
      state.hold = 'hand';
      if (g.dur && (state.equip.tool === id || state.equip.weapon === id) && state.dur && state.dur[id] == null) state.dur[id] = g.dur;
    } else if (id === 'swordWood' || id === 'swordStone' || id === 'swordIron' || id === 'gun') {
      state.equip.weapon = state.equip.weapon === id ? '' : id;
      state.hold = 'hand';
    } else if (id === 'armor' || id === 'armorWood' || id === 'armorIron') {
      if (n < 1) return false;
      state.equip.armor = state.equip.armor === id ? '' : id;
      state.armorLeft = ARMOR_MAX[id] || 20;
      state.hold = 'hand';
    } else if (id === 'pick' || id === 'axe' || id === 'pickIron') {
      state.equip.tool = state.equip.tool === id ? '' : id;
      if (state.equip.tool) state.equip.weapon = '';
      state.hold = 'hand';
    } else if (id === 'torch' || id === 'boat' || id === 'bed' || id === 'wheat' || id === 'shears' || id === 'raw' || id === 'cooked') {
      if ((id === 'raw' || id === 'cooked') && state.hold === id) { eatFood(id); return true; }
      state.hold = state.hold === id ? 'hand' : id;
    } else {
      state.hold = 'hand';
      toast(NAMES[id] ? (NAMES[id] + '在背包格子里') : '在背包里');
    }
    save();
    renderHud();
    return true;
  }
  function renderPack() {
    var box = $('pack');
    if (!box) return;
    var html = '', i, cell, n, on;
    for (i = 0; i < PACK.length; i++) {
      cell = PACK[i];
      n = state.inv[cell.id] | 0;
      if (!cell.core && n < 1 && !packOn(cell)) continue;
      on = packOn(cell);
      html += '<button type="button" data-pack="' + cell.id + '" class="' + (on ? 'on' : '') + (n ? '' : ' empty') + '" style="background:' + cell.bg + '"><b>' + cell.name + '</b><i>' + n + '</i></button>';
    }
    if (box._html !== html) { box.innerHTML = html; box._html = html; }
  }
  function mixKey(list) {
    return list.slice().sort().join('+');
  }
  function findMix(list) {
    var key = mixKey(list), i, row;
    for (i = 0; i < MIX.length; i++) {
      row = MIX[i];
      if (mixKey(row.mats) === key) return row;
    }
    return null;
  }
  function renderMix() {
    var el = $('mixSlots');
    if (!el) return;
    var slots = state.mix || [];
    var text = [0, 1, 2].map(function (i) { return slots[i] ? (NAMES[slots[i]] || slots[i]) : '空'; }).join(' + ');
    if (el.textContent !== text) el.textContent = text;
  }
  function renderRecipeBook() {
    var ul = $('recipeBook');
    if (!ul || ul._done) return;
    ul.innerHTML = MIX.map(function (r) {
      var bits = r.mats.map(function (m) { return NAMES[m] || m; }).join(' + ');
      return '<li><b>' + r.say + '</b> · ' + bits + '</li>';
    }).join('');
    ul._done = 1;
  }
  function addMix(mat) {
    if (!state.mix) state.mix = [];
    if (state.mix.length >= 3) { toast('格子满了'); return false; }
    var have = state.inv[mat] | 0;
    var used = 0, i;
    for (i = 0; i < state.mix.length; i++) if (state.mix[i] === mat) used++;
    if (have < used + 1) { toast('材料不够'); return false; }
    state.mix.push(mat);
    renderMix();
    return true;
  }
  function clearMix() {
    state.mix = [];
    renderMix();
  }
  function equipMade(id, slot) {
    var g = GEAR[id];
    if (slot === 'tool' || (g && g.slot === 'tool')) {
      state.equip.tool = id;
      state.equip.weapon = id;
    } else if (slot) {
      state.equip[slot] = id;
      if (g && (g.chop || g.mine)) state.equip.tool = id;
    }
    if (g && g.dur) {
      if (!state.dur) state.dur = {};
      state.dur[id] = g.dur;
    }
    if (id === 'armor' || id === 'armorWood' || id === 'armorIron') state.armorLeft = ARMOR_MAX[id];
    if (id !== 'torch') state.hold = 'hand';
  }
  function craftMix(mats) {
    var list = (mats && mats.length) ? mats.slice() : (state.mix || []).slice();
    if (list.length < 2) { toast('至少放两样'); return false; }
    var r = findMix(list);
    if (!r) { toast('这几样合不成东西'); return false; }
    var need = {}, i, k;
    for (i = 0; i < list.length; i++) need[list[i]] = (need[list[i]] || 0) + 1;
    for (k in need) if ((state.inv[k] | 0) < need[k]) { toast('小宇：材料不够'); return false; }
    for (k in need) state.inv[k] -= need[k];
    if (!mats) state.mix = [];
    state.inv[r.give] = (state.inv[r.give] | 0) + (r.n || 1);
    equipMade(r.give, r.slot);
    save();
    renderHud();
    toast('盲盒开出了' + r.say);
    return true;
  }
  function craft(name) {
    var r = RECIPES[name];
    if (!r) return false;
    if (r.woodGate && (state.inv.wood | 0) < r.woodGate) {
      toast('小宇：先敲到 1 个木头，才能做火把和小船');
      return false;
    }
    var k;
    for (k in r.cost) if ((state.inv[k] | 0) < r.cost[k]) { toast('小宇：材料不够'); return false; }
    for (k in r.cost) state.inv[k] -= r.cost[k];
    state.inv[r.give] = (state.inv[r.give] | 0) + r.n;
    if (r.slot && !state.equip[r.slot]) state.equip[r.slot] = r.give;
    if (r.give === 'axe' || r.give === 'pick' || r.give === 'pickIron') {
      if (!state.dur) state.dur = {};
      state.dur[r.give] = TOOL_MAX[r.give];
    }
    if (r.give === 'armor' || r.give === 'armorWood' || r.give === 'armorIron') state.armorLeft = ARMOR_MAX[r.give];
    if (r.give === 'boat') markAch('boat', '第一艘船');
    if (r.give === 'gun') markAch('gun', '第一把枪');
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
      if (state.inv.swordIron) opts.push('swordIron');
      if (state.inv.gun) opts.push('gun');
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
    if (!id || id === WATER || id === LAVA || id === MAGMA) return;
    var tool = state.equip.tool;
    var gear = GEAR[tool];
    if (tool === 'axe' && id === LOG) wearTool('axe');
    if (tool === 'pick' && (id === STONE || id === GOLD || id === IRON_ORE || id === COAL_ORE)) wearTool('pick');
    if (tool === 'pickIron' && (id === STONE || id === GOLD || id === IRON_ORE || id === COAL_ORE)) wearTool('pickIron');
    if (gear && gear.chop && id === LOG) wearTool(tool);
    if (gear && gear.mine && (id === STONE || id === GOLD || id === IRON_ORE || id === COAL_ORE)) wearTool(tool);
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
    if ((state.inv.torch | 0) < 1) { toast('小宇：做火把要 3 个木头'); return false; }
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
    if ((state.inv.boat | 0) < 1) { toast('小宇：做一条小船要 10 个木头'); return false; }
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
  function placeBedAt(x, y, z) {
    x |= 0; y |= 0; z |= 0;
    if ((state.inv.bed | 0) < 1) return false;
    if (at(x, y, z) !== AIR) return false;
    if (countId(BED) >= 16) return false;
    if (!solid(x, y - 1, z)) return false;
    state.inv.bed--;
    localSet(x, y, z, BED);
    save();
    renderHud();
    return true;
  }
  function placeBed() {
    if ((state.inv.bed | 0) < 1) { toast('小宇：床要 3 个木头和 2 份羊毛'); return false; }
    var hit = ray(4.5, true);
    if (!hit) { toast('小宇：对准要放床的方块'); return false; }
    var x = hit.px, y = hit.py, z = hit.pz;
    if (!placeBedAt(x, y, z)) { toast('小宇：这里放不下床'); return false; }
    toast('床放下了。站上去可以坐下、睡觉。');
    return true;
  }
  function tryPlace() {
    if (state.hold === 'raw') return startCook();
    if (state.hold === 'cooked') return eatFood('cooked');
    if (state.hold === 'torch') return placeTorch();
    if (state.hold === 'boat') return placeBoatAimed();
    if (state.hold === 'bed') return placeBed();
    toast('小宇：先点右边的火把、船或床');
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
  function nearestBed(dist) {
    var best = null, bestD = dist || 1.35;
    var x0 = (state.px | 0) - 2, z0 = (state.pz | 0) - 2;
    var x, y, z, d, y1 = (state.py | 0) - 1, y2 = (state.py | 0) + 2;
    for (x = x0; x <= x0 + 4; x++) {
      for (z = z0; z <= z0 + 4; z++) {
        for (y = y1; y <= y2; y++) {
          if (at(x, y, z) !== BED) continue;
          d = Math.hypot(x + 0.5 - state.px, z + 0.5 - state.pz);
          if (d < bestD) { bestD = d; best = { x: x, y: y, z: z }; }
        }
      }
    }
    return best;
  }
  function toggleSit() {
    if (state.sitting) {
      state.sitting = null;
      toast('起来了');
      return;
    }
    if (state.ride >= 0) { toast('小宇：先下船'); return; }
    var b = nearestBed(1.35);
    if (!b) { toast('小宇：身边没有床'); return; }
    state.sitting = b;
    state.px = b.x + 0.5;
    state.pz = b.z + 0.5;
    state.py = b.y;
    state.vy = 0;
    state.onGround = true;
    toast('坐下了。可以睡觉。');
  }
  function dayPhase() {
    var p = (state.clock % DAY) / DAY;
    if (p < 0) p += 1;
    return p;
  }
  function sleepNow() {
    if (!state.sitting) { toast('小宇：先坐到床上'); return false; }
    var p = dayPhase();
    var id, pal, together = false;
    for (id in remotes) {
      pal = remotes[id];
      if (pal && pal.sl) together = true;
    }
    if (together && p > 0.04) state.clock += (1 - p) * DAY;
    else if (!together) toast('两个人一起躺下，才能跳到白天');
    var veil = $('sleep');
    if (veil) {
      veil.hidden = false;
      veil.classList.remove('on');
      void veil.offsetWidth;
      veil.classList.add('on');
    }
    if (together) toast('早上好');
    emit({ t: 'clock', clock: state.clock });
    return true;
  }
  function toggleRide() {
    if (state.ride >= 0) {
      var ox = state.px, oy = state.py, oz = state.pz;
      state.ride = -1;
      state.sitting = null;
      var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.8, 0.8], [-0.8, 0.8], [0.8, -0.8], [-0.8, -0.8]];
      var i, landed = false;
      for (i = 0; i < dirs.length; i++) {
        state.px = ox; state.py = oy; state.pz = oz;
        if (tryShore(ox, oy, oz, dirs[i][0], dirs[i][1])) { landed = true; break; }
      }
      if (!landed) { state.px = ox; state.py = oy + 0.15; state.pz = oz; toast('下船了'); }
      else toast('上岸了');
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
    return at(px, py + 0.2, pz) === WATER || at(px, py + 0.9, pz) === WATER || at(px, py + 1.35, pz) === WATER;
  }
  function submergedAt(px, py, pz) {
    return at(px, py + 0.85, pz) === WATER;
  }
  function columnSurface(x, z) {
    x |= 0; z |= 0;
    var y, bottom = -1, top = -1;
    if (x < 0 || z < 0 || x >= W || z >= D) return null;
    for (y = 0; y < H; y++) {
      if (at(x, y, z) === WATER) {
        if (bottom < 0) bottom = y;
        top = y;
      }
    }
    if (top < 0) return null;
    return { bottom: bottom, top: top, surface: top + 1, depth: top - bottom + 1 };
  }
  function tryShore(ox, oy, oz, dx, dz) {
    var sx = dx > 0.001 ? 1 : dx < -0.001 ? -1 : 0;
    var sz = dz > 0.001 ? 1 : dz < -0.001 ? -1 : 0;
    if (!sx && !sz) return false;
    var keepX = state.px, keepY = state.py, keepZ = state.pz;
    var cells = [[Math.floor(ox) + sx, Math.floor(oz) + sz]];
    if (sx && sz) {
      cells.push([Math.floor(ox) + sx, Math.floor(oz)]);
      cells.push([Math.floor(ox), Math.floor(oz) + sz]);
    }
    var col = columnSurface(ox, oz);
    var base = col ? col.surface - 0.02 : oy;
    if (oy < base - 1.35 && state.vy < 0.8) return false;
    var i, cx, cz, y, floor, feet;
    for (i = 0; i < cells.length; i++) {
      cx = cells[i][0]; cz = cells[i][1];
      floor = -1;
      for (y = Math.min(H - 1, Math.floor(base + 2.2)); y >= 0; y--) {
        if (solid(cx, y, cz)) { floor = y; break; }
      }
      if (floor < 0) continue;
      feet = floor + 1;
      if (feet - base > 1.08) continue;
      if (feet < oy - 0.35) continue;
      if (feet > oy + 0.34 && !(jumping || keys.Space)) continue;
      if (solid(cx, feet, cz) || solid(cx, feet + 1, cz)) continue;
      if (at(cx, feet, cz) === WATER) continue;
      state.px = cx + 0.5;
      state.pz = cz + 0.5;
      state.py = feet;
      if (overlaps(state.px, state.py, state.pz)) continue;
      state.vy = 0;
      state.onGround = true;
      state.sitting = null;
      return true;
    }
    state.px = keepX; state.py = keepY; state.pz = keepZ;
    return false;
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
  function animalInSight() {
    var dir = look();
    var best = null, bestD = 9, list, i, e, dx, dy, dz, dist, dot;
    function scan(arr, kind) {
      for (i = 0; i < arr.length; i++) {
        e = arr[i];
        if (!e.alive) continue;
        dx = e.x - state.px;
        dy = (e.y + 0.6) - (state.py + 1.5);
        dz = e.z - state.pz;
        dist = Math.hypot(dx, dy, dz);
        if (dist < 0.4 || dist > bestD) continue;
        dot = (dx * dir[0] + dy * dir[1] + dz * dir[2]) / dist;
        if (dot > 0.82) { best = { e: e, kind: kind, i: i }; bestD = dist; }
      }
    }
    scan(chickens, 'chicken');
    scan(sheep, 'sheep');
    scan(pigs, 'pig');
    scan(cows, 'cow');
    return best;
  }
  function grantMeat(kind) {
    var n = kind === 'cow' ? 2 : 1;
    state.inv.raw = (state.inv.raw | 0) + n;
    toast('得到 ' + n + ' 块生肉');
    renderHud();
  }
  function strikeAnimal(hit, dmg) {
    var e = hit.e;
    e.hp = (e.hp | 0) - dmg;
    if (hit.kind === 'cow') e.mad = true;
    if (hit.kind === 'sheep' || hit.kind === 'chicken') e.flee = state.clock + 3;
    var resist = hit.kind === 'cow' ? 0.3 : 0;
    var dx = e.x - state.px, dz = e.z - state.pz;
    var len = Math.hypot(dx, dz) || 1;
    var gear = GEAR[state.equip.weapon];
    var shove = 0.7 * (gear && gear.knock ? 1.9 : 1);
    e.x += dx / len * shove * (1 - resist);
    e.z += dz / len * shove * (1 - resist);
    if (e.hp <= 0) {
      e.alive = false;
      grantMeat(hit.kind);
    } else toast((hit.kind === 'pig' ? '野猪' : hit.kind === 'cow' ? '牛' : hit.kind === 'chicken' ? '鸡' : '羊') + '还剩 ' + e.hp);
    emit({ t: 'mob', k: hit.kind, i: hit.i, hp: e.hp });
  }
  function tryShoot() {
    if (state.equip.weapon !== 'gun' || (state.inv.gun | 0) < 1) return false;
    var hit = animalInSight();
    if (!hit) return false;
    strikeAnimal(hit, GUN_DMG);
    return true;
  }
  function pokeFriend() {
    var dir = look(), id, r, dx, dy, dz, dist, dot;
    for (id in remotes) {
      r = remotes[id];
      dx = r.x - state.px; dy = (r.y + 1) - (state.py + 1.5); dz = r.z - state.pz;
      dist = Math.hypot(dx, dy, dz);
      if (dist > 2.6) continue;
      dot = (dx * dir[0] + dy * dir[1] + dz * dir[2]) / (dist || 1);
      if (dot > 0.45) {
        emit({ t: 'hit', to: id, n: 2 });
        toast('砍到 ' + (r.name || '朋友'));
        return;
      }
    }
  }
  function doPunch(dt) {
    if (punching && !shotLock && state.hold === 'shears') {
      shotLock = true;
      var woolHit = animalInSight();
      if (woolHit && woolHit.kind === 'sheep' && woolHit.e.wool) {
        woolHit.e.wool = 0;
        state.inv.wool = (state.inv.wool | 0) + 2;
        toast('剪到羊毛，可以做床');
        renderHud();
        return;
      }
    }
    if (punching && !shotLock && state.equip.weapon === 'gun') {
      shotLock = true;
      if (tryShoot()) { breakAcc = 0; setBar(false, 0); return; }
    }
    if (punching && !shotLock && state.equip.weapon !== 'gun') {
      shotLock = true;
      var bite = animalInSight();
      if (bite && Math.hypot(bite.e.x - state.px, bite.e.z - state.pz) < meleeReach()) strikeAnimal(bite, meleeDmg());
      else pokeFriend();
    }
    if (!punching) shotLock = false;
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
    state.match = (state.match || 0) + dt;
    syncVolcano();
    tickCold(dt);
    tickBurn(dt);
    if (state.started) tickRocks();
    if ((state.match || 0) < MATCH_SEC) tryTake();
    if ((state.match || 0) >= MATCH_SEC) {
      if (!state.matchOver) {
        state.matchOver = true;
        showMatchEnd();
      }
    }
    var frozen = !!state.matchOver;
    if (state.cooking > 0) {
      state.cooking -= dt;
      setBar(true, (1 - state.cooking / 4) * 100);
      if (state.cooking <= 0) {
        state.cooking = 0;
        setBar(false, 0);
        if ((state.inv.raw | 0) > 0) {
          state.inv.raw--;
          state.inv.cooked = (state.inv.cooked | 0) + 1;
          toast('熟肉好了');
          renderHud();
        }
      }
    }
    var rainBucket = Math.floor(state.clock / 45);
    if (rainBucket !== state._rainBucket) {
      state._rainBucket = rainBucket;
      if (hash2(rainBucket, 1, 8) < 0.34) state.rainUntil = state.clock + 16;
    }
    state.raining = state.clock < (state.rainUntil || 0);
    var rainEl = $('rain');
    if (rainEl) rainEl.classList.toggle('on', !!state.raining);
    var stick = frozen ? { forward: 0, strafe: 0 } : stickInput();
    var mx = Math.sin(state.yaw), mz = -Math.cos(state.yaw);
    var rx = Math.cos(state.yaw), rz = Math.sin(state.yaw);
    var jump = !frozen && (jumping || !!keys.Space);
    if (state.sitting) {
      var bed = state.sitting;
      if (at(bed.x, bed.y, bed.z) !== BED) state.sitting = null;
      else if (jump) { state.sitting = null; toast('起来了'); }
      else {
        state.px = bed.x + 0.5;
        state.pz = bed.z + 0.5;
        state.py = bed.y;
        state.vy = 0;
        state.onGround = true;
        doPunch(dt);
        afterSim(dt);
        return;
      }
    }
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
    var wet = submergedAt(state.px, state.py, state.pz);
    if (wet && !toldWater) { toldWater = true; toast('小宇：按住跳往上游。低头往前，会沉下去。'); }
    if (state.knockX || state.knockZ) {
      moveAxis(state.knockX * dt, 0, state.knockZ * dt);
      var damp = Math.max(0, 1 - dt * 1.6);
      state.knockX *= damp;
      state.knockZ *= damp;
      if (Math.abs(state.knockX) < 0.15) state.knockX = 0;
      if (Math.abs(state.knockZ) < 0.15) state.knockZ = 0;
    }
    var speed = ((wet || inWaterAt(state.px, state.py, state.pz)) ? 1.8 : WALK) * dt;
    moveAxis((mx * stick.forward + rx * stick.strafe) * speed, 0, (mz * stick.forward + rz * stick.strafe) * speed);
    wet = submergedAt(state.px, state.py, state.pz);
    if (wet) {
      var unstick = 0;
      while (overlaps(state.px, state.py, state.pz) && unstick++ < 8) state.py += 0.12;
      var col = columnSurface(state.px, state.pz);
      var surface = col ? col.surface : (Math.floor(state.py) + 1);
      var diving = state.pitch < -0.35 && stick.forward > 0.15 && !jump;
      if (jump) state.vy = 5.4;
      else if (diving) state.vy = -2.6;
      else if (state.py < surface - 1.45) state.vy = 3.4;
      else if (state.py > surface - 0.85) state.vy = -0.6;
      else state.vy = 2.2;
      moveAxis(0, state.vy * dt, 0);
    } else {
      if (jump && state.onGround) { state.vy = 9; state.onGround = false; }
      state.vy -= 26 * dt;
      if (state.vy < -20) state.vy = -20;
      moveAxis(0, state.vy * dt, 0);
    }
    if (!wet && state.ride < 0) {
      if (!state.onGround) {
        if (fallPeak == null || state.py > fallPeak) fallPeak = state.py;
      } else if (fallPeak != null) {
        var drop = fallPeak - state.py;
        fallPeak = null;
        if (drop > 3.2) {
          var dmg = Math.max(1, Math.round(drop - 2.2));
          if (wearingArmor()) dmg = Math.max(0, dmg - 2);
          if (dmg > 0) hurt(dmg, '摔疼了');
        }
      }
    } else fallPeak = null;
    if (state.py < -2) {
      var deep = fallPeak == null ? 6 : Math.max(4, Math.round(fallPeak - state.py));
      fallPeak = null;
      hurt(wearingArmor() ? Math.max(1, deep - 3) : deep, '');
      findSpawn();
      putOnGround(spawn);
      toast('掉下去了，回到地面');
    }
    if (armorDrop && !armorDrop.taken && Math.hypot(state.px - armorDrop.x, state.pz - armorDrop.z) < 1.3 && Math.abs(state.py - armorDrop.y) < 2) {
      armorDrop.taken = true;
      state.inv.armor = (state.inv.armor | 0) + 1;
      state.equip.armor = 'armor';
      toast('穿上叶衣了。牛顶不动你。');
      save();
      renderHud();
    }
    if (state.ride < 0 && !state.sitting) nudgeFree();
    simMobs(dt);
    doPunch(dt);
    afterSim(dt);
  }
  function nudgeFree() {
    if (!overlaps(state.px, state.py, state.pz)) return;
    var ox = state.px, oy = state.py, oz = state.pz;
    var steps = [0.1, -0.1, 0.22, -0.22, 0.4, -0.4];
    var i, j;
    for (i = 0; i < steps.length; i++) {
      for (j = 0; j < steps.length; j++) {
        state.px = ox + steps[i];
        state.pz = oz + steps[j];
        state.py = oy;
        if (!overlaps(state.px, state.py, state.pz)) return;
      }
    }
    state.py = oy + 0.4;
    if (!overlaps(state.px, state.py, state.pz)) return;
    state.px = ox; state.py = oy; state.pz = oz;
  }
  function nearestBody(x, z) {
    var bestX = state.px, bestZ = state.pz, best = Math.hypot(state.px - x, state.pz - z);
    var id, r, d;
    for (id in remotes) {
      r = remotes[id];
      d = Math.hypot((r.x || 0) - x, (r.z || 0) - z);
      if (d < best) { best = d; bestX = r.x; bestZ = r.z; }
    }
    return { x: bestX, z: bestZ, d: best };
  }
  function pigNip(e) {
    if (!e || !e.alive || e.cool > 0) return;
    e.cool = 1.1;
    if (wearingArmor()) {
      toast('护甲挡住了野猪');
      return;
    }
    var dx = state.px - e.x, dz = state.pz - e.z;
    var len = Math.hypot(dx, dz) || 1;
    state.knockX = dx / len * 3.2;
    state.knockZ = dz / len * 3.2;
    hurt(1, '野猪撞过来了');
  }
  function cowBump(e) {
    if (!e || !e.alive) return;
    if (e.cool > 0) return;
    e.cool = 1.5;
    state.sitting = null;
    if (wearingArmor()) {
      hurt(COW_DMG, '护甲挡住了，牛没把你顶下去');
      return;
    }
    var dx = state.px - e.x, dz = state.pz - e.z;
    var len = Math.hypot(dx, dz) || 1;
    state.knockX = dx / len * 1.9;
    state.knockZ = dz / len * 1.9;
    state.vy = 3.4;
    state.onGround = false;
    fallPeak = Math.max(state.py, fallPeak || 0);
    hurt(COW_DMG, '牛把你顶下去了');
  }
  function simMobs(dt) {
    var i, e, dx, dz, dist, feet, nx, nz, len, ang;
    for (i = 0; i < villagers.length; i++) {
      e = villagers[i];
      ang = state.clock * 0.35 + i * 1.7;
      nx = village.x + Math.sin(ang) * 2.2;
      nz = village.z + Math.cos(ang * 0.8) * 2.2;
      dx = nx - e.x; dz = nz - e.z;
      len = Math.hypot(dx, dz) || 1;
      feet = groundFeet(e.x + dx / len * dt * 0.8, e.z + dz / len * dt * 0.8);
      if (feet != null && Math.abs(feet - e.y) <= 1.1) {
        e.x += dx / len * dt * 0.8;
        e.z += dz / len * dt * 0.8;
        e.y = feet;
        e.yaw = Math.atan2(dx, -dz);
      }
    }
    var guestView = netRole === 'guest' && state.gotHost;
    for (i = 0; i < pigs.length; i++) {
      e = pigs[i];
      if (!e.alive) continue;
      if (e.cool > 0) e.cool -= dt;
      dx = state.px - e.x; dz = state.pz - e.z;
      dist = Math.hypot(dx, dz);
      if (guestView) {
        if (state.started && dist < BOAR_HIT) pigNip(e);
        continue;
      }
      var who = nearestBody(e.x, e.z);
      var chaseR = dayFactor() < 0.2 ? BOAR_AGGRO_NIGHT : BOAR_AGGRO;
      var chase = state.started && (netRole === 'host' ? who.d < chaseR : dist < chaseR);
      var aim = chase ? (netRole === 'host' ? who : { x: state.px, z: state.pz }) : null;
      if (aim) {
        dx = aim.x - e.x; dz = aim.z - e.z;
        len = Math.hypot(dx, dz) || 1;
        if (len > 0.2) {
          var bspd = BOAR_SPEED * (dayFactor() < 0.2 ? 1.12 : 1);
          nx = e.x + dx / len * dt * bspd;
          nz = e.z + dz / len * dt * bspd;
          feet = groundFeet(nx, nz);
          if (feet != null && Math.abs(feet - e.y) <= 1.15) {
            e.x = nx; e.z = nz; e.y = feet; e.yaw = Math.atan2(dx, -dz);
          }
        }
        if (Math.hypot(state.px - e.x, state.pz - e.z) < BOAR_HIT) pigNip(e);
      } else {
        ang = state.clock * 0.45 + i * 2.3;
        nx = e.x + Math.sin(ang) * dt * 0.55;
        nz = e.z + Math.cos(ang * 1.3) * dt * 0.55;
        feet = groundFeet(nx, nz);
        if (feet != null && Math.abs(feet - e.y) <= 1.05) { e.x = nx; e.z = nz; e.y = feet; e.yaw = ang; }
      }
    }
    for (i = 0; i < cows.length; i++) {
      e = cows[i];
      if (!e.alive) continue;
      if (e.cool > 0) e.cool -= dt;
      dx = state.px - e.x; dz = state.pz - e.z;
      dist = Math.hypot(dx, dz);
      if (guestView) {
        if (state.started && dist < 1.25) cowBump(e);
        continue;
      }
      var nearCow = nearestBody(e.x, e.z);
      var cowAim = null;
      var cowR = dayFactor() < 0.2 ? 14 : 9;
      var holdWheat = state.hold === 'wheat' && (state.inv.wheat | 0) > 0;
      if (holdWheat && dist < 6) e.tame = state.clock + 8;
      if (state.started && !holdWheat && (e.tame || 0) < state.clock && (e.mad || (netRole === 'host' ? nearCow.d < cowR : dist < cowR))) {
        cowAim = netRole === 'host' ? nearCow : { x: state.px, z: state.pz, d: dist };
      }
      if (cowAim && cowAim.d > 0.15) {
        dx = cowAim.x - e.x; dz = cowAim.z - e.z;
        dist = Math.hypot(dx, dz);
        len = dist || 1;
        nx = e.x + dx / len * dt * COW_SPEED;
        nz = e.z + dz / len * dt * COW_SPEED;
        feet = groundFeet(nx, nz);
        if (feet != null && Math.abs(feet - e.y) <= 1.2) {
          e.x = nx; e.z = nz; e.y = feet; e.yaw = Math.atan2(dx, -dz);
        }
        if (Math.hypot(state.px - e.x, state.pz - e.z) < 1.25) cowBump(e);
      } else {
        ang = state.clock * 0.3 + i;
        nx = e.x + Math.sin(ang) * dt * 0.22;
        nz = e.z + Math.cos(ang) * dt * 0.22;
        feet = groundFeet(nx, nz);
        if (feet != null && Math.abs(feet - e.y) <= 1.05) { e.x = nx; e.z = nz; e.y = feet; }
      }
    }
    for (i = 0; i < sheep.length; i++) {
      e = sheep[i];
      if (!e.alive) continue;
      if (guestView) continue;
      var target = nearestBody(e.x, e.z);
      var away = (e.flee && state.clock < e.flee) || (state.started && target.d < SHEEP_FEAR);
      if (away) {
        dx = e.x - target.x; dz = e.z - target.z;
        len = Math.hypot(dx, dz) || 1;
        nx = e.x + dx / len * dt * SHEEP_FLEE;
        nz = e.z + dz / len * dt * SHEEP_FLEE;
        feet = groundFeet(nx, nz);
        if (feet != null && Math.abs(feet - e.y) <= 1.2) {
          e.x = nx; e.z = nz; e.y = feet; e.yaw = Math.atan2(dx, -dz);
        }
      } else {
        ang = state.clock * 0.25 + i;
        nx = e.x + Math.sin(ang) * dt * 0.35;
        nz = e.z + Math.cos(ang) * dt * 0.35;
        feet = groundFeet(nx, nz);
        if (feet != null && Math.abs(feet - e.y) <= 1.05) { e.x = nx; e.z = nz; e.y = feet; e.yaw = ang; }
      }
    }
    for (i = 0; i < chickens.length; i++) {
      e = chickens[i];
      if (!e.alive) continue;
      if (guestView) continue;
      target = nearestBody(e.x, e.z);
      away = (e.flee && state.clock < e.flee) || (state.started && target.d < CHICKEN_FEAR);
      if (away) {
        dx = e.x - target.x; dz = e.z - target.z;
        len = Math.hypot(dx, dz) || 1;
        nx = e.x + dx / len * dt * CHICKEN_FLEE;
        nz = e.z + dz / len * dt * CHICKEN_FLEE;
        feet = groundFeet(nx, nz);
        if (feet != null && Math.abs(feet - e.y) <= 1.2) {
          e.x = nx; e.z = nz; e.y = feet; e.yaw = Math.atan2(dx, -dz);
        }
      } else {
        ang = state.clock * 0.7 + i;
        nx = e.x + Math.sin(ang) * dt * 0.85;
        nz = e.z + Math.cos(ang) * dt * 0.85;
        feet = groundFeet(nx, nz);
        if (feet != null && Math.abs(feet - e.y) <= 1.05) { e.x = nx; e.z = nz; e.y = feet; e.yaw = ang; }
      }
    }
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
    var sitBtn = $('sit'), sleepBtn = $('sleepBtn');
    if (sitBtn) {
      sitBtn.hidden = !(state.sitting || nearestBed(1.35));
      sitBtn.textContent = state.sitting ? '起来' : '坐下';
    }
    if (sleepBtn) sleepBtn.hidden = !state.sitting;
    var tradeBtn = $('trade');
    if (tradeBtn) {
      var nearV = false, vi;
      for (vi = 0; vi < villagers.length; vi++) {
        if (Math.hypot(villagers[vi].x - state.px, villagers[vi].z - state.pz) < 2.4) nearV = true;
      }
      tradeBtn.hidden = !nearV;
    }
    if (toastUntil && Date.now() > toastUntil) {
      var t = $('toast');
      if (t) t.textContent = '';
      toastUntil = 0;
    }
    var id, r, now = Date.now();
    for (id in remotes) {
      r = remotes[id];
      if (now - r.seen > 8000) { delete remotes[id]; continue; }
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
          w: weaponCode(), hd: holdCode(), host: netRole === 'host' ? 1 : 0,
          clock: state.clock, match: Math.round((state.match || 0) * 100) / 100,
          sc: state.score | 0,
          vy: Math.round(state.vy * 10) / 10, sl: state.sitting ? 1 : 0
        });
      }
      if (netRole === 'host' && netHot()) {
        var mobAcc = state._mobAcc || 0;
        mobAcc += dt;
        if (mobAcc >= 0.4) {
          state._mobAcc = 0;
          emit({ t: 'mobs', pigs: packMobs(pigs), cows: packMobs(cows, true), sheep: packMobs(sheep), chickens: packMobs(chickens) });
        } else state._mobAcc = mobAcc;
      }
    }
  }
  function weaponCode() {
    var g = GEAR[state.equip.weapon];
    if (g && g.code) return g.code;
    if (state.equip.weapon === 'swordIron') return 4;
    if (state.equip.weapon === 'gun') return 3;
    if (state.equip.weapon === 'swordStone') return 2;
    if (state.equip.weapon === 'swordWood') return 1;
    if (state.equip.tool && GEAR[state.equip.tool]) return GEAR[state.equip.tool].code || 0;
    return 0;
  }
  function holdCode() {
    if (state.hold === 'torch') return 1;
    if (state.hold === 'boat') return 2;
    return 0;
  }
  function handKind() {
    if (state.hold === 'torch') return 'torch';
    if (state.hold === 'boat') return 'boat';
    if (state.hold === 'bed') return 'bed';
    if (state.equip.weapon === 'gun') return 'gun';
    if (state.equip.weapon && (GEAR[state.equip.weapon] || state.equip.weapon.indexOf('sword') === 0)) return state.equip.weapon;
    if (state.equip.tool) return state.equip.tool;
    return 'hand';
  }
  function matchLabel() {
    var left = MATCH_SEC - (state.match || 0);
    if (left <= 0 || state.matchOver) return '时间到';
    var s = Math.ceil(left);
    if (s > MATCH_SEC) s = MATCH_SEC;
    var m = (s / 60) | 0;
    var r = s % 60;
    return '本局 ' + m + ':' + (r < 10 ? '0' : '') + r;
  }
  function showMatchEnd() {
    var el = $('matchEnd');
    paintClock();
    if (!el) return;
    var rows = [{ name: state.name, score: state.score | 0 }];
    var id, r;
    for (id in remotes) {
      r = remotes[id];
      rows.push({ name: r.name || '朋友', score: r.score | 0 });
    }
    rows.sort(function (a, b) { return b.score - a.score; });
    var html = '<p class="who">时间到</p>';
    var i;
    for (i = 0; i < rows.length; i++) html += '<p>' + (i + 1) + '. ' + esc(rows[i].name) + ' · ' + rows[i].score + ' 分</p>';
    el.innerHTML = html;
    el.hidden = false;
  }
  function smooth01(u) {
    if (u < 0) return 0;
    if (u > 1) return 1;
    return u * u * (3 - 2 * u);
  }
  function sunElev() {
    var p = dayPhase();
    if (p < 7 / 12) return 0.35 + 0.6 * Math.sin((p / (7 / 12)) * Math.PI);
    if (p < 8 / 12) {
      var u = smooth01((p - 7 / 12) / (1 / 12));
      return 0.25 * (1 - u) - 0.6 * u;
    }
    if (p < 11.5 / 12) return -0.6;
    return -0.6 + 0.95 * smooth01((p - 11.5 / 12) / (0.5 / 12));
  }
  function dayFactor() {
    var p = dayPhase();
    if (p < 7 / 12) return 1;
    if (p < 8 / 12) return 1 - smooth01((p - 7 / 12) / (1 / 12));
    if (p < 11.5 / 12) return 0;
    return smooth01((p - 11.5 / 12) / (0.5 / 12));
  }
  function clockText() {
    var p = dayPhase();
    var mins = (6 * 60 + Math.floor(p * 24 * 60)) % (24 * 60);
    var hh = (mins / 60) | 0;
    var mm = mins % 60;
    var two = function (n) { return (n < 10 ? '0' : '') + n; };
    var sun = '白天';
    if (p < 0.04 || p >= 11.5 / 12) sun = '太阳升起';
    else if (p >= 7 / 12 && p < 8 / 12) sun = '太阳落下';
    else if (p >= 8 / 12 && p < 11.5 / 12) sun = '夜里';
    return sun + ' · ' + two(hh) + ':' + two(mm);
  }
  function paintClock() {
    var el = $('sunClock');
    if (el) el.textContent = clockText();
    var matchEl = $('matchClock');
    if (matchEl) {
      var label = matchLabel();
      if (matchEl.textContent !== label) matchEl.textContent = label;
    }
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
          if (id === BED) {
            pushCube(data, x + 0.06, y, z + 0.08, 0.88, 0.28, 0.84, [0.82, 0.22, 0.28]);
            pushCube(data, x + 0.08, y + 0.28, z + 0.1, 0.28, 0.16, 0.28, [0.95, 0.95, 0.98]);
            continue;
          }
          if (id === FLOWER) {
            rgb = [[0.93, 0.45, 0.58], [0.95, 0.82, 0.28], [0.95, 0.95, 0.98], [0.72, 0.45, 0.86]][(hash2(x, z, 21) * 4) | 0];
            pushCube(data, x + 0.35, y, z + 0.35, 0.3, 0.55, 0.3, rgb);
            continue;
          }
          rgb = (COL[id] || [1, 1, 1]).slice();
          if (id === LEAF) {
            var leafJ = (hash2(x, y + z, 23) - 0.5) * 0.2;
            rgb[1] = Math.max(0, Math.min(1, rgb[1] + leafJ));
          }
          if (id === GRASS || id === DIRT || id === STONE || id === SAND || id === SNOW) {
            var jit = (hash2(x, z, id + 3) - 0.5) * 0.16;
            rgb[0] = Math.max(0, Math.min(1, rgb[0] + jit));
            rgb[1] = Math.max(0, Math.min(1, rgb[1] + jit * 0.35));
            rgb[2] = Math.max(0, Math.min(1, rgb[2] - jit * 0.25));
          }
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
            if (id === IRON_ORE) {
              if (ny > 0) pushCube(data, x + 0.28, y + 0.62, z + 0.28, 0.44, 0.38, 0.44, [0.95, 0.52, 0.14]);
              else if (nx > 0) pushCube(data, x + 0.62, y + 0.28, z + 0.28, 0.38, 0.44, 0.44, [0.95, 0.52, 0.14]);
              else if (nx < 0) pushCube(data, x, y + 0.28, z + 0.28, 0.38, 0.44, 0.44, [0.95, 0.52, 0.14]);
              else if (nz > 0) pushCube(data, x + 0.28, y + 0.28, z + 0.62, 0.44, 0.44, 0.38, [0.95, 0.52, 0.14]);
              else if (nz < 0) pushCube(data, x + 0.28, y + 0.28, z, 0.44, 0.44, 0.38, [0.95, 0.52, 0.14]);
            }
            if (id === COAL_ORE && ny > 0) pushCube(data, x + 0.3, y + 0.7, z + 0.3, 0.4, 0.28, 0.4, [0.05, 0.05, 0.06]);
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
  function lightPoints() {
    var list = [], i, id, fwd;
    for (i = 0; i < torchCells.length; i++) list.push(torchCells[i]);
    if (state.started && handKind() === 'torch') {
      fwd = look();
      list.push({ x: state.px + fwd[0] * 0.45, y: state.py + 1.05, z: state.pz + fwd[2] * 0.45, held: 1 });
    }
    for (id in remotes) {
      if ((remotes[id].hd | 0) === 1) list.push({ x: remotes[id].x, y: (remotes[id].y || 0) + 1.0, z: remotes[id].z, held: 1 });
    }
    return list;
  }
  function fillTorches() {
    var i, lights = lightPoints();
    for (i = 0; i < 8; i++) { torchU[i * 3] = 0; torchU[i * 3 + 1] = -40; torchU[i * 3 + 2] = 0; }
    if (!lights.length) return;
    var ranked = lights.map(function (t) {
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
  function pushLocal(data, ox, oy, oz, yaw, lx, ly, lz, sx, sy, sz, rgb) {
    var c = Math.cos(yaw), s = Math.sin(yaw);
    var f, v, face, sh, px, py, pz, wx, wz;
    for (f = 0; f < 6; f++) {
      face = FACES[f];
      sh = SHADE[f];
      for (v = 0; v < 18; v += 3) {
        px = lx + face[v] * sx;
        py = ly + face[v + 1] * sy;
        pz = lz + face[v + 2] * sz;
        wx = px * c - pz * s;
        wz = px * s + pz * c;
        data.push(ox + wx, oy + py, oz + wz, rgb[0] * sh, rgb[1] * sh, rgb[2] * sh);
      }
    }
  }
  function pushPerson(data, p, withHead) {
    var yaw = p.yaw || 0;
    var cloth = p.cloth || colorOfName(p.name || '朋友');
    var skin = [0.96, 0.8, 0.66];
    var hair = [0.32, 0.18, 0.1];
    var pants = [0.16, 0.2, 0.36];
    var shoe = [0.12, 0.12, 0.14];
    function box(lx, ly, lz, sx, sy, sz, rgb) {
      pushLocal(data, p.x, p.y, p.z, yaw, lx, ly, lz, sx, sy, sz, rgb);
    }
    box(-0.18, 0, -0.08, 0.14, 0.14, 0.18, shoe);
    box(0.04, 0, -0.08, 0.14, 0.14, 0.18, shoe);
    box(-0.17, 0.14, -0.07, 0.13, 0.3, 0.16, pants);
    box(0.04, 0.14, -0.07, 0.13, 0.3, 0.16, pants);
    box(-0.2, 0.42, -0.13, 0.4, 0.4, 0.26, cloth);
    box(-0.3, 0.48, -0.1, 0.1, 0.3, 0.14, cloth);
    box(0.2, 0.48, -0.1, 0.1, 0.3, 0.14, skin);
    if (withHead) {
      box(-0.16, 0.84, -0.16, 0.32, 0.3, 0.32, skin);
      box(-0.18, 1.08, -0.18, 0.36, 0.1, 0.34, hair);
      box(-0.12, 0.98, -0.2, 0.07, 0.06, 0.04, [0.1, 0.08, 0.08]);
      box(0.05, 0.98, -0.2, 0.07, 0.06, 0.04, [0.1, 0.08, 0.08]);
      box(-0.04, 0.9, -0.22, 0.08, 0.07, 0.08, [0.9, 0.62, 0.52]);
      pushGlasses(box);
    }
    pushHeld(box, p.w | 0, p.hd | 0);
  }
  function pushGlasses(box) {
    var frame = [0.12, 0.12, 0.16];
    var lens = [0.55, 0.78, 0.95];
    box(-0.15, 0.955, -0.2, 0.3, 0.028, 0.03, frame);
    box(-0.15, 0.885, -0.21, 0.11, 0.09, 0.03, lens);
    box(0.04, 0.885, -0.21, 0.11, 0.09, 0.03, lens);
    box(-0.04, 0.92, -0.208, 0.08, 0.028, 0.025, frame);
    box(-0.17, 0.92, -0.14, 0.03, 0.028, 0.1, frame);
    box(0.14, 0.92, -0.14, 0.03, 0.028, 0.1, frame);
  }
  function pushHeld(box, w, hd) {
    if (hd === 1) {
      box(0.22, 0.42, -0.46, 0.06, 0.42, 0.06, [0.45, 0.28, 0.12]);
      box(0.18, 0.8, -0.5, 0.14, 0.14, 0.14, [1, 0.82, 0.28]);
      return;
    }
    if (hd === 2) {
      box(0.12, 0.46, -0.55, 0.28, 0.1, 0.16, [0.5, 0.3, 0.12]);
      return;
    }
    if (w === 3) {
      box(0.2, 0.5, -0.55, 0.06, 0.06, 0.32, [0.16, 0.16, 0.18]);
      return;
    }
    if (w === 6 || w === 9) {
      box(0.2, 0.34, -0.55, 0.06, 0.36, 0.06, [0.42, 0.28, 0.14]);
      box(0.1, 0.66, -0.62, 0.26, 0.16, 0.16, w === 9 ? [0.85, 0.28, 0.12] : [0.72, 0.76, 0.82]);
      return;
    }
    if (w === 5 || w === 8) {
      box(0.2, 0.34, -0.55, 0.05, 0.4, 0.05, [0.45, 0.28, 0.12]);
      box(0.08, 0.68, -0.6, 0.22, 0.14, 0.08, w === 8 ? [0.9, 0.35, 0.1] : [0.68, 0.72, 0.78]);
      return;
    }
    if (w === 12) {
      box(0.2, 0.34, -0.55, 0.05, 0.4, 0.05, [0.42, 0.28, 0.14]);
      box(0.06, 0.7, -0.58, 0.26, 0.08, 0.08, [0.95, 0.78, 0.28]);
      return;
    }
    if (w === 2) {
      box(0.2, 0.28, -0.7, 0.05, 0.62, 0.05, [0.62, 0.66, 0.74]);
      box(0.14, 0.86, -0.74, 0.16, 0.16, 0.1, [0.78, 0.8, 0.86]);
      return;
    }
    if (w) {
      var blade = (w === 4 || w === 10) ? [0.82, 0.86, 0.92] : (w === 7 ? [0.25, 0.22, 0.45] : (w === 11 ? [0.95, 0.72, 0.28] : [0.62, 0.4, 0.16]));
      var tall = (w === 4 || w === 7 || w === 11) ? 0.52 : 0.46;
      box(0.2, 0.34, -0.62, 0.06, tall, 0.06, blade);
      if (w !== 1 && w !== 10) box(0.14, 0.32, -0.4, 0.18, 0.05, 0.08, [0.42, 0.26, 0.12]);
    }
  }
  function pushAvatar(data, p) {
    p.cloth = colorOfName(p.name || '朋友');
    pushPerson(data, p, true);
  }
  function treasureVisible(t) {
    if (!t || t.taken) return false;
    if (t.buried && !coverClear(t)) return false;
    return true;
  }
  function pushTreasure(data, t) {
    function box(lx, ly, lz, sx, sy, sz, rgb) {
      pushCube(data, t.x + lx, t.y + ly, t.z + lz, sx, sy, sz, rgb);
    }
    var s = t.shape;
    if (s === 'star') {
      box(-0.06, 0.15, -0.06, 0.12, 0.28, 0.12, [1, 0.86, 0.2]);
      box(-0.2, 0.24, -0.05, 0.4, 0.1, 0.1, [1, 0.9, 0.35]);
      box(-0.05, 0.24, -0.2, 0.1, 0.1, 0.4, [1, 0.9, 0.35]);
    } else if (s === 'shell') {
      box(-0.22, 0.02, -0.14, 0.44, 0.12, 0.28, [0.98, 0.62, 0.7]);
      box(-0.12, 0.12, -0.08, 0.24, 0.1, 0.16, [1, 0.82, 0.86]);
    } else if (s === 'gem') {
      box(-0.1, 0.02, -0.1, 0.2, 0.16, 0.2, [0.2, 0.85, 0.45]);
      box(-0.06, 0.16, -0.06, 0.12, 0.14, 0.12, [0.45, 1, 0.62]);
    } else if (s === 'crystal') {
      box(-0.07, 0, -0.07, 0.14, 0.55, 0.14, [0.35, 0.75, 1]);
      box(-0.04, 0.52, -0.04, 0.08, 0.16, 0.08, [0.7, 0.9, 1]);
    } else if (s === 'idol') {
      box(-0.12, 0, -0.12, 0.24, 0.16, 0.24, [0.95, 0.97, 1]);
      box(-0.09, 0.16, -0.09, 0.18, 0.16, 0.18, [0.95, 0.97, 1]);
      box(-0.07, 0.32, -0.07, 0.14, 0.14, 0.14, [0.95, 0.97, 1]);
    } else if (s === 'ember') {
      box(-0.1, 0.02, -0.1, 0.2, 0.22, 0.2, [0.95, 0.35, 0.08]);
      box(-0.06, 0.22, -0.06, 0.12, 0.16, 0.12, [1, 0.72, 0.2]);
    } else {
      box(-0.16, 0.08, -0.1, 0.32, 0.08, 0.2, [0.95, 0.78, 0.2]);
      box(-0.16, 0.16, -0.08, 0.08, 0.12, 0.08, [0.95, 0.78, 0.2]);
      box(-0.04, 0.16, -0.08, 0.08, 0.14, 0.08, [1, 0.88, 0.35]);
      box(0.08, 0.16, -0.08, 0.08, 0.12, 0.08, [0.95, 0.78, 0.2]);
    }
  }
  function pushViewBox(data, origin, right, up, fwd, lx, ly, lz, sx, sy, sz, rgb) {
    var f, v, face, s, px, py, pz;
    for (f = 0; f < 6; f++) {
      face = FACES[f];
      s = SHADE[f];
      for (v = 0; v < 18; v += 3) {
        px = lx + face[v] * sx;
        py = ly + face[v + 1] * sy;
        pz = lz + face[v + 2] * sz;
        data.push(
          origin[0] + right[0] * px + up[0] * py + fwd[0] * pz,
          origin[1] + right[1] * px + up[1] * py + fwd[1] * pz,
          origin[2] + right[2] * px + up[2] * py + fwd[2] * pz,
          rgb[0] * s, rgb[1] * s, rgb[2] * s
        );
      }
    }
  }
  function pushViewHand(data, origin, right, up, fwd) {
    var S = 0.68;
    function box(lx, ly, lz, sx, sy, sz, rgb) {
      pushViewBox(data, origin, right, up, fwd, lx * S, ly * S, lz * S, sx * S, sy * S, sz * S, rgb);
    }
    var sleeve = state.equip.armor === 'armor' ? [0.28, 0.72, 0.38] : (state.equip.armor === 'armorIron' ? [0.7, 0.74, 0.82] : (state.equip.armor === 'armorWood' ? [0.62, 0.4, 0.18] : [0.2, 0.32, 0.62]));
    var skin = [0.96, 0.78, 0.62];
    box(0.1, -0.46, 0.06, 0.12, 0.16, 0.2, sleeve);
    box(0.08, -0.36, 0.22, 0.14, 0.14, 0.22, sleeve);
    if (wearingArmor()) box(0.04, -0.32, 0.24, 0.18, 0.1, 0.14, [0.22, 0.78, 0.4]);
    box(0.05, -0.26, 0.4, 0.16, 0.12, 0.14, skin);
    box(0.04, -0.22, 0.52, 0.04, 0.05, 0.08, skin);
    box(0.1, -0.22, 0.52, 0.04, 0.05, 0.08, skin);
    box(0.16, -0.22, 0.5, 0.04, 0.05, 0.07, skin);
    var kind = handKind();
    if (kind === 'swordWood' || kind === 'swordStone' || kind === 'swordIron' || kind === 'nightSword' || kind === 'swordSun' || kind === 'stick' || kind === 'rod' || kind === 'spear') {
      var blade = (kind === 'swordIron' || kind === 'rod') ? [0.86, 0.9, 0.96] : (kind === 'swordStone' || kind === 'spear' ? [0.78, 0.82, 0.88] : (kind === 'nightSword' ? [0.28, 0.24, 0.5] : (kind === 'swordSun' ? [0.95, 0.72, 0.28] : [0.66, 0.42, 0.18])));
      var tall = kind === 'spear' ? 0.7 : (kind === 'stick' || kind === 'rod' ? 0.48 : 0.52);
      box(0.09, -0.16, 0.5, 0.05, tall, 0.06, blade);
      if (kind !== 'stick' && kind !== 'rod') box(0.02, -0.18, 0.48, 0.22, 0.05, 0.09, [0.42, 0.26, 0.12]);
      if (kind === 'spear') box(0.05, 0.42, 0.48, 0.14, 0.14, 0.08, [0.8, 0.82, 0.88]);
    } else if (kind === 'axe' || kind === 'axeStone' || kind === 'axeVolcano') {
      box(0.1, -0.2, 0.5, 0.05, 0.42, 0.05, [0.42, 0.28, 0.14]);
      box(0.02, 0.12, 0.46, 0.2, 0.12, 0.06, kind === 'axeVolcano' ? [0.92, 0.36, 0.1] : [0.72, 0.74, 0.78]);
    } else if (kind === 'pick' || kind === 'pickIron' || kind === 'pickStar') {
      var head = kind === 'pickIron' ? [0.82, 0.86, 0.92] : (kind === 'pickStar' ? [0.95, 0.78, 0.28] : [0.62, 0.64, 0.68]);
      box(0.1, -0.2, 0.5, 0.05, 0.42, 0.05, [0.42, 0.28, 0.14]);
      box(0.02, 0.16, 0.46, 0.22, 0.08, 0.08, head);
    } else if (kind === 'hammer' || kind === 'hammerBlast') {
      box(0.1, -0.2, 0.5, 0.05, 0.36, 0.05, [0.42, 0.28, 0.14]);
      box(0.0, 0.12, 0.44, 0.24, 0.14, 0.14, kind === 'hammerBlast' ? [0.9, 0.28, 0.12] : [0.75, 0.78, 0.84]);
    } else if (kind === 'torch') {
      box(0.1, -0.18, 0.48, 0.05, 0.4, 0.05, [0.45, 0.28, 0.12]);
      box(0.05, 0.16, 0.44, 0.14, 0.14, 0.14, [1, 0.78, 0.25]);
    } else if (kind === 'boat') {
      box(0.0, -0.24, 0.46, 0.28, 0.1, 0.18, [0.52, 0.32, 0.14]);
      box(0.1, -0.16, 0.5, 0.04, 0.16, 0.04, [0.62, 0.4, 0.18]);
    } else if (kind === 'bed') {
      box(0.02, -0.22, 0.48, 0.28, 0.08, 0.16, [0.82, 0.22, 0.28]);
      box(0.02, -0.16, 0.42, 0.1, 0.06, 0.08, [0.95, 0.95, 0.98]);
    } else if (kind === 'gun') {
      box(0.1, -0.2, 0.5, 0.06, 0.06, 0.36, [0.18, 0.18, 0.2]);
      box(0.08, -0.16, 0.46, 0.1, 0.1, 0.08, [0.35, 0.28, 0.16]);
    }
  }
  function pushPig(data, e) {
    var hide = [0.52, 0.3, 0.16], dark = [0.26, 0.13, 0.08], snout = [0.7, 0.4, 0.26];
    function box(lx, ly, lz, sx, sy, sz, rgb) {
      pushLocal(data, e.x, e.y, e.z, e.yaw || 0, lx, ly, lz, sx, sy, sz, rgb);
    }
    box(-0.22, 0, -0.28, 0.12, 0.22, 0.12, dark);
    box(0.1, 0, -0.28, 0.12, 0.22, 0.12, dark);
    box(-0.22, 0, 0.1, 0.12, 0.22, 0.12, dark);
    box(0.1, 0, 0.1, 0.12, 0.22, 0.12, dark);
    box(-0.28, 0.2, -0.34, 0.56, 0.32, 0.68, hide);
    box(-0.18, 0.28, -0.6, 0.36, 0.28, 0.28, hide);
    box(-0.1, 0.3, -0.74, 0.2, 0.14, 0.16, snout);
    box(-0.12, 0.22, -0.72, 0.06, 0.1, 0.06, [0.95, 0.92, 0.82]);
    box(0.06, 0.22, -0.72, 0.06, 0.1, 0.06, [0.95, 0.92, 0.82]);
    box(-0.2, 0.52, -0.5, 0.1, 0.1, 0.08, dark);
    box(0.1, 0.52, -0.5, 0.1, 0.1, 0.08, dark);
    box(-0.14, 0.4, -0.62, 0.06, 0.06, 0.04, [0.08, 0.06, 0.06]);
    box(0.08, 0.4, -0.62, 0.06, 0.06, 0.04, [0.08, 0.06, 0.06]);
    box(-0.04, 0.38, 0.32, 0.08, 0.08, 0.1, dark);
  }
  function pushSheep(data, e) {
    var wool = e.wool ? [0.97, 0.97, 0.98] : [0.84, 0.68, 0.62];
    var face = [0.32, 0.24, 0.2], leg = [0.28, 0.22, 0.18];
    function box(lx, ly, lz, sx, sy, sz, rgb) {
      pushLocal(data, e.x, e.y, e.z, e.yaw || 0, lx, ly, lz, sx, sy, sz, rgb);
    }
    box(-0.16, 0, -0.16, 0.1, 0.18, 0.1, leg);
    box(0.06, 0, -0.16, 0.1, 0.18, 0.1, leg);
    box(-0.16, 0, 0.08, 0.1, 0.18, 0.1, leg);
    box(0.06, 0, 0.08, 0.1, 0.18, 0.1, leg);
    box(-0.24, 0.16, -0.26, 0.48, 0.32, 0.52, wool);
    if (e.wool) box(-0.16, 0.42, -0.16, 0.32, 0.12, 0.36, wool);
    box(-0.12, 0.28, -0.46, 0.24, 0.2, 0.22, face);
    box(-0.14, 0.44, -0.4, 0.08, 0.1, 0.06, wool);
    box(0.06, 0.44, -0.4, 0.08, 0.1, 0.06, wool);
    box(-0.08, 0.36, -0.48, 0.05, 0.05, 0.04, [0.08, 0.08, 0.08]);
    box(0.03, 0.36, -0.48, 0.05, 0.05, 0.04, [0.08, 0.08, 0.08]);
  }
  function pushCow(data, e) {
    var brown = [0.58, 0.3, 0.12], dark = [0.22, 0.1, 0.05], white = [0.96, 0.96, 0.94];
    function box(lx, ly, lz, sx, sy, sz, rgb) {
      pushLocal(data, e.x, e.y, e.z, e.yaw || 0, lx, ly, lz, sx, sy, sz, rgb);
    }
    box(-0.28, 0, -0.32, 0.14, 0.28, 0.14, dark);
    box(0.14, 0, -0.32, 0.14, 0.28, 0.14, dark);
    box(-0.28, 0, 0.16, 0.14, 0.28, 0.14, dark);
    box(0.14, 0, 0.16, 0.14, 0.28, 0.14, dark);
    box(-0.34, 0.26, -0.42, 0.68, 0.42, 0.86, brown);
    box(-0.12, 0.52, -0.1, 0.24, 0.12, 0.28, white);
    box(-0.1, 0.22, -0.02, 0.2, 0.1, 0.16, [0.95, 0.75, 0.78]);
    box(-0.22, 0.32, -0.78, 0.44, 0.36, 0.38, brown);
    box(-0.16, 0.38, -0.86, 0.32, 0.16, 0.12, white);
    box(-0.2, 0.66, -0.7, 0.08, 0.14, 0.08, [0.86, 0.82, 0.7]);
    box(0.12, 0.66, -0.7, 0.08, 0.14, 0.08, [0.86, 0.82, 0.7]);
    box(-0.16, 0.46, -0.8, 0.06, 0.06, 0.04, [0.08, 0.06, 0.06]);
    box(0.1, 0.46, -0.8, 0.06, 0.06, 0.04, [0.08, 0.06, 0.06]);
    box(-0.04, 0.4, 0.42, 0.08, 0.16, 0.08, dark);
  }
  function pushChicken(data, e) {
    var white = [0.97, 0.97, 0.95], red = [0.86, 0.16, 0.14], yellow = [0.95, 0.78, 0.18], orange = [0.9, 0.46, 0.12];
    function box(lx, ly, lz, sx, sy, sz, rgb) {
      pushLocal(data, e.x, e.y, e.z, e.yaw || 0, lx, ly, lz, sx, sy, sz, rgb);
    }
    box(-0.08, 0, -0.02, 0.05, 0.12, 0.05, orange);
    box(0.03, 0, -0.02, 0.05, 0.12, 0.05, orange);
    box(-0.12, 0.12, -0.14, 0.24, 0.18, 0.28, white);
    box(-0.14, 0.16, -0.06, 0.04, 0.1, 0.14, [0.9, 0.9, 0.86]);
    box(0.1, 0.16, -0.06, 0.04, 0.1, 0.14, [0.9, 0.9, 0.86]);
    box(-0.07, 0.26, -0.26, 0.14, 0.14, 0.14, white);
    box(-0.03, 0.28, -0.34, 0.06, 0.05, 0.08, yellow);
    box(-0.025, 0.38, -0.24, 0.05, 0.08, 0.06, red);
    box(-0.03, 0.32, -0.28, 0.03, 0.03, 0.03, [0.08, 0.08, 0.08]);
    box(-0.04, 0.22, 0.12, 0.08, 0.1, 0.1, white);
  }
  function pushVillager(data, e) {
    var robe = [0.56, 0.36, 0.18], skin = [0.9, 0.74, 0.56], shoe = [0.3, 0.18, 0.1];
    function box(lx, ly, lz, sx, sy, sz, rgb) {
      pushLocal(data, e.x, e.y, e.z, e.yaw || 0, lx, ly, lz, sx, sy, sz, rgb);
    }
    box(-0.12, 0, -0.08, 0.1, 0.1, 0.16, shoe);
    box(0.02, 0, -0.08, 0.1, 0.1, 0.16, shoe);
    box(-0.16, 0.1, -0.12, 0.32, 0.46, 0.24, robe);
    box(-0.24, 0.28, -0.08, 0.08, 0.24, 0.12, robe);
    box(0.16, 0.28, -0.08, 0.08, 0.24, 0.12, skin);
    box(-0.14, 0.56, -0.14, 0.28, 0.26, 0.28, skin);
    box(-0.15, 0.78, -0.15, 0.3, 0.06, 0.3, [0.4, 0.24, 0.12]);
    box(-0.05, 0.64, -0.26, 0.1, 0.1, 0.12, [0.78, 0.52, 0.36]);
    box(-0.1, 0.74, -0.18, 0.2, 0.04, 0.04, [0.32, 0.18, 0.1]);
    box(-0.08, 0.68, -0.18, 0.05, 0.04, 0.03, [0.1, 0.08, 0.08]);
    box(0.03, 0.68, -0.18, 0.05, 0.04, 0.03, [0.1, 0.08, 0.08]);
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
      var face = (p.emote && p.emoteUntil > Date.now()) ? emoteFace(p.emote) : '';
      html += '<span style="left:' + s.x.toFixed(1) + 'px;top:' + s.y.toFixed(1) + 'px">' + (face ? face + ' ' : '') + esc(p.name) + ' · ' + (p.score | 0) + '</span>';
    }
    var mine = $('myEmote');
    if (mine) {
      var mineFace = (state.emote && state.emoteUntil > Date.now()) ? emoteFace(state.emote) : '';
      if (mine.textContent !== mineFace) mine.textContent = mineFace;
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
    var eyeY = state.py + (state.sitting ? 1.02 : 1.5);
    var proj = perspective(86 * Math.PI / 180, canvas.width / Math.max(1, canvas.height), 0.08, 120);
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
    var elev = sunElev(), az = Math.cos(dayPhase() * Math.PI * 2);
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
    if (loc.dim) gl.uniform1f(loc.dim, state.raining ? 1 : 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(loc.col, 3, gl.FLOAT, false, 24, 12);
    gl.drawArrays(gl.TRIANGLES, 0, vbo);
    var actors = [], bright = [], id, t, ti;
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
    for (id = 0; id < pigs.length; id++) if (pigs[id].alive) pushPig(actors, pigs[id]);
    for (id = 0; id < sheep.length; id++) if (sheep[id].alive) pushSheep(actors, sheep[id]);
    for (id = 0; id < cows.length; id++) if (cows[id].alive) pushCow(actors, cows[id]);
    for (id = 0; id < chickens.length; id++) if (chickens[id].alive) pushChicken(actors, chickens[id]);
    for (id = 0; id < villagers.length; id++) pushVillager(actors, villagers[id]);
    if (state.started && state.ride < 0) {
      pushPerson(actors, {
        x: state.px, y: state.py, z: state.pz, yaw: state.yaw, name: state.name,
        hd: holdCode(), w: weaponCode()
      }, state.pitch < -0.45);
    }
    if (armorDrop && !armorDrop.taken) {
      pushCube(actors, armorDrop.x - 0.18, armorDrop.y, armorDrop.z - 0.12, 0.36, 0.42, 0.24, [0.25, 0.75, 0.4]);
    }
    var ti;
    for (ti = 0; ti < treasures.length; ti++) if (treasureVisible(treasures[ti])) pushTreasure(actors, treasures[ti]);
    var rocks = activeRocks();
    for (ti = 0; ti < rocks.length; ti++) {
      pushCube(actors, rocks[ti].x - 0.16, rocks[ti].y, rocks[ti].z - 0.16, 0.32, 0.32, 0.32, [0.45, 0.42, 0.4]);
    }
    for (id in remotes) pushAvatar(actors, remotes[id]);
    drawDyn(bright, 1.3, 1 - day, 1);
    drawDyn(actors, 0.72, 1 - day, 0.18 + 0.82 * day);
    if (state.started) {
      var hand = [];
      var fwd = dir;
      pushViewHand(hand, [state.px, eyeY, state.pz], basis.right, basis.up, fwd);
      gl.disable(gl.DEPTH_TEST);
      drawDyn(hand, 1.2, 0, 1);
      gl.enable(gl.DEPTH_TEST);
    }
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
    drawMap();
    paintClock();
    setNetStatus();
  }
  function mapDots() {
    var dots = [{ kind: 'self', x: state.px, z: state.pz, yaw: state.yaw, color: '#111' }];
    var id, r, i, e;
    for (id in remotes) {
      r = remotes[id];
      dots.push({ kind: 'other', x: r.x, z: r.z, color: '#e23b3b' });
    }
    if (village) dots.push({ kind: 'village', x: village.x, z: village.z, color: '#ffe07a' });
    if (volcano) dots.push({ kind: 'volcano', x: volcano.cx + 0.5, z: volcano.cz + 0.5, color: '#ff5a1f' });
    for (i = 0; i < treasures.length; i++) {
      e = treasures[i];
      if (treasureVisible(e)) dots.push({ kind: 'treasure', x: e.x, z: e.z, color: '#7cf0ff' });
    }
    for (i = 0; i < villagers.length; i++) {
      e = villagers[i];
      dots.push({ kind: 'villager', x: e.x, z: e.z, color: '#7dff6a' });
    }
    for (i = 0; i < pigs.length; i++) {
      e = pigs[i];
      if (e.alive) dots.push({ kind: 'pig', x: e.x, z: e.z, color: '#ff4f93' });
    }
    for (i = 0; i < cows.length; i++) {
      e = cows[i];
      if (e.alive) dots.push({ kind: 'cow', x: e.x, z: e.z, color: '#e08a28' });
    }
    for (i = 0; i < sheep.length; i++) {
      e = sheep[i];
      if (e.alive) dots.push({ kind: 'sheep', x: e.x, z: e.z, color: '#f4f4f8' });
    }
    for (i = 0; i < chickens.length; i++) {
      e = chickens[i];
      if (e.alive) dots.push({ kind: 'chicken', x: e.x, z: e.z, color: '#ffe14a' });
    }
    dots.push({ kind: 'spawn', x: spawn.x, z: spawn.z, color: '#fff4b0' });
    return { n: MAP_N, cell: MAP_CELL, dots: dots };
  }
  function drawMap() {
    var canvas = $('map');
    var wrap = $('mapWrap');
    if (wrap) wrap.hidden = !state.started;
    if (!canvas || !state.started || !mapOpen) {
      if (canvas) canvas.hidden = true;
      return;
    }
    canvas.hidden = false;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var n = MAP_N, cell = MAP_CELL, px = state.px, pz = state.pz;
    var x0 = px - (n - 1) / 2, z0 = pz - (n - 1) / 2;
    var ix, iz, wx, wz, top, id, col, sx, sy;
    ctx.fillStyle = '#14182e';
    ctx.fillRect(0, 0, n * cell, n * cell);
    for (iz = 0; iz < n; iz++) {
      for (ix = 0; ix < n; ix++) {
        wx = Math.floor(x0 + ix + 0.5);
        wz = Math.floor(z0 + iz + 0.5);
        if (wx < 0 || wz < 0 || wx >= W || wz >= D) continue;
        top = highestSolid(wx, wz);
        id = top >= 0 ? at(wx, top, wz) : AIR;
        if (top >= 0 && top < SEA - 1 && at(wx, SEA - 1, wz) === WATER) id = WATER;
        col = COL[id] || [0.2, 0.22, 0.3];
        ctx.fillStyle = 'rgb(' + (col[0] * 255 | 0) + ',' + (col[1] * 255 | 0) + ',' + (col[2] * 255 | 0) + ')';
        ctx.fillRect(ix * cell, iz * cell, cell, cell);
      }
    }
    function toScreen(wx, wz, clamp) {
      var x = (wx - x0) * cell, y = (wz - z0) * cell;
      var max = n * cell - 2, outside = x < 2 || y < 2 || x > max || y > max;
      if (clamp) {
        if (x < 2) x = 2;
        if (y < 2) y = 2;
        if (x > max) x = max;
        if (y > max) y = max;
      }
      return { x: x, y: y, outside: outside };
    }
    function dot(wx, wz, color, rad, clamp) {
      var p = toScreen(wx, wz, clamp);
      if (!clamp && p.outside) return;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    if (village) dot(village.x, village.z, '#ffe07a', 2.2, false);
    if (volcano) dot(volcano.cx + 0.5, volcano.cz + 0.5, '#ff5a1f', 2.4, false);
    for (ix = 0; ix < treasures.length; ix++) if (treasureVisible(treasures[ix])) dot(treasures[ix].x, treasures[ix].z, '#7cf0ff', 2, false);
    for (ix = 0; ix < villagers.length; ix++) dot(villagers[ix].x, villagers[ix].z, '#7dff6a', 1.6, false);
    for (ix = 0; ix < pigs.length; ix++) if (pigs[ix].alive) dot(pigs[ix].x, pigs[ix].z, '#ff4f93', 2, false);
    for (ix = 0; ix < cows.length; ix++) if (cows[ix].alive) dot(cows[ix].x, cows[ix].z, '#e08a28', 2.2, false);
    for (ix = 0; ix < sheep.length; ix++) if (sheep[ix].alive) dot(sheep[ix].x, sheep[ix].z, '#f4f4f8', 1.8, false);
    for (ix = 0; ix < chickens.length; ix++) if (chickens[ix].alive) dot(chickens[ix].x, chickens[ix].z, '#ffe14a', 1.6, false);
    dot(spawn.x, spawn.z, '#fff4b0', 1.8, false);
    for (id in remotes) dot(remotes[id].x, remotes[id].z, '#e23b3b', 2.4, true);
    sx = (px - x0) * cell;
    sy = (pz - z0) * cell;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(state.yaw);
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.moveTo(0, -4.5);
    ctx.lineTo(3.2, 3.4);
    ctx.lineTo(-3.2, 3.4);
    ctx.fill();
    ctx.restore();
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
    var fsLit = 'precision mediump float;varying vec3 vCol;varying vec3 vWorld;uniform float uAmb;uniform float uMin;uniform vec3 uEye;uniform vec3 uSky;uniform float uFog;uniform float uDim;uniform vec3 uTorch[8];void main(){float light=uAmb;float torchK=0.85*(1.0-0.62*uDim);for(int i=0;i<8;i++){vec3 d=vWorld-uTorch[i];float dist=sqrt(d.x*d.x+d.y*d.y+d.z*d.z);light+=clamp(1.0-dist/6.0,0.0,1.0)*torchK;}light=min(max(light,uMin),1.35);vec3 col=vCol*light;float distC=distance(vWorld,uEye);float fogStart=mix(28.0,8.0,uFog);float fogEnd=mix(84.0,24.0,uFog);float f=clamp((distC-fogStart)/(fogEnd-fogStart),0.0,1.0);gl_FragColor=vec4(mix(col,uSky,f),1.0);}';
    var fsSimple = 'precision mediump float;varying vec3 vCol;varying vec3 vWorld;uniform float uAmb;uniform float uMin;uniform vec3 uEye;uniform vec3 uSky;uniform float uFog;void main(){float light=min(max(uAmb,uMin),1.35);vec3 col=vCol*light;float distC=distance(vWorld,uEye);float fogStart=mix(28.0,8.0,uFog);float fogEnd=mix(84.0,24.0,uFog);float f=clamp((distC-fogStart)/(fogEnd-fogStart),0.0,1.0);gl_FragColor=vec4(mix(col,uSky,f),1.0);}';
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
      dim: gl.getUniformLocation(prog, 'uDim'),
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
    if (name !== 'hand' && name !== 'torch' && name !== 'boat' && name !== 'bed') return;
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
    setWait('');
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
  var lastHostId = '';
  var lastHeard = 0;
  var roomLockAt = 0;
  var netWatch = null;
  var reconnecting = false;
  function netWindowKey(offset) { return Math.floor(Date.now() / 600000) + (offset || 0); }
  function markHeard() { lastHeard = Date.now(); }
  function netPairIds() {
    var ids = [], w, i, key;
    for (w = 0; w >= -1; w--) {
      key = netWindowKey(w);
      for (i = 0; i < NET_SLOTS; i++) ids.push(NET_PREFIX + '-' + key + '-' + i);
    }
    return ids;
  }
  var roomPin = '';
  var forceRelay = typeof location !== 'undefined' && /(?:\?|&)relay=1/.test(location.search || '');
  function peerConfig() {
    var ice = NET_PEER_OPTS.config.iceServers.slice();
    try {
      var extra = JSON.parse(localStorage.getItem('xygo-turn') || 'null');
      if (extra && extra.urls) ice.unshift(extra);
    } catch (eIce) {}
    var cfg = { iceServers: ice };
    if (forceRelay) cfg.iceTransportPolicy = 'relay';
    return { debug: 0, config: cfg };
  }
  function netNewPeer(id) {
    var opt = peerConfig();
    return id ? new Peer(id, opt) : new Peer(opt);
  }
  function showRoom(pin) {
    var el = $('roomCode');
    if (!el) return;
    el.hidden = false;
    el.textContent = '房间码 ' + pin;
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
  function packMobs(list, cow) {
    var i, e, row, out = [];
    for (i = 0; i < list.length; i++) {
      e = list[i];
      row = [Math.round(e.x * 10) / 10, Math.round(e.y * 10) / 10, Math.round(e.z * 10) / 10, e.hp | 0, e.alive ? 1 : 0];
      if (cow) row.push(e.mad ? 1 : 0);
      out.push(row);
    }
    return out;
  }
  function applyMobPack(msg) {
    var i, e, row;
    var pigsIn = msg.pigs || [], cowsIn = msg.cows || [];
    for (i = 0; i < pigsIn.length && i < pigs.length; i++) {
      row = pigsIn[i]; e = pigs[i];
      e.x = +row[0]; e.y = +row[1]; e.z = +row[2]; e.hp = row[3] | 0; e.alive = !!row[4];
    }
    for (i = 0; i < cowsIn.length && i < cows.length; i++) {
      row = cowsIn[i]; e = cows[i];
      e.x = +row[0]; e.y = +row[1]; e.z = +row[2]; e.hp = row[3] | 0; e.alive = !!row[4];
      if (row.length > 5) e.mad = !!row[5];
    }
    var sheepIn = msg.sheep || [];
    for (i = 0; i < sheepIn.length && i < sheep.length; i++) {
      row = sheepIn[i]; e = sheep[i];
      e.x = +row[0]; e.y = +row[1]; e.z = +row[2]; e.hp = row[3] | 0; e.alive = !!row[4];
      if ((e.hp | 0) < SHEEP_HP) e.flee = state.clock + 3;
    }
    var chicks = msg.chickens || [];
    for (i = 0; i < chicks.length && i < chickens.length; i++) {
      row = chicks[i]; e = chickens[i];
      e.x = +row[0]; e.y = +row[1]; e.z = +row[2]; e.hp = row[3] | 0; e.alive = !!row[4];
      if ((e.hp | 0) < CHICKEN_HP) e.flee = state.clock + 3;
    }
  }
  function emoteFace(id) {
    var i;
    for (i = 0; i < EMOTES.length; i++) if (EMOTES[i].id === id) return EMOTES[i].face;
    return '';
  }
  function sendEmote(id) {
    if (!emoteFace(id)) return false;
    state.emote = id;
    state.emoteUntil = Date.now() + 2800;
    emit({ t: 'emote', e: id });
    var mine = $('myEmote');
    if (mine) mine.textContent = emoteFace(id);
    return true;
  }
  function worldPacket() {
    return {
      t: 'hi', host: 1, seed: worldSeed, edits: collectEdits(),
      boats: boats.map(function (b) { return [Math.round(b.x * 10) / 10, Math.round(b.z * 10) / 10]; }),
      clock: state.clock, match: Math.round((state.match || 0) * 100) / 100,
      score: state.score | 0,
      loot: packLoot(),
      name: state.name,
      px: state.px, py: state.py, pz: state.pz, yaw: state.yaw, pitch: state.pitch, w: weaponCode()
    };
  }
  function packLoot() {
    var out = [], i, t;
    for (i = 0; i < treasures.length; i++) {
      t = treasures[i];
      if (t.taken) out.push([t.id, t.taken, t.taker || '']);
    }
    return out;
  }
  function applyLoot(rows, grantSelf) {
    var i, row, t;
    for (i = 0; i < (rows || []).length; i++) {
      row = rows[i];
      if (!row) continue;
      t = treasureById(row[0]);
      if (!t) continue;
      t.taken = String(row[1] || 'x');
      t.taker = cleanName(row[2] || '');
      if (grantSelf && t.taken === selfId) grantScore(t);
    }
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
    r.hd = msg.hd | 0;
    r.vy = isFinite(+msg.vy) ? +msg.vy : 0;
    r.hop = r.vy > 2 ? 1 : 0;
    r.sl = msg.sl ? 1 : 0;
    if (isFinite(+msg.sc)) r.score = msg.sc | 0;
    if (state.matchOver) showMatchEnd();
    r.seen = Date.now();
    if (netRole) markAch('meet', '碰到朋友');
    if (msg.host && netRole === 'guest' && isFinite(+msg.clock) && +msg.clock + 0.4 >= state.clock) state.clock = +msg.clock;
    if (msg.host && netRole === 'guest' && isFinite(+msg.match)) {
      state.match = +msg.match;
      syncVolcano();
    }
    markHeard();
    setNetStatus();
  }
  function applyHostWorld(msg) {
    var first = !state.gotHost;
    var px = state.px, py = state.py, pz = state.pz, ride = state.ride;
    if (!first) suppressMobs = true;
    grow(msg.seed | 0, true);
    if (!first) suppressMobs = false;
    applyEdits(msg.edits || []);
    findSpawn();
    boats.splice(0, boats.length);
    (msg.boats || []).forEach(function (b) {
      if (b && b.length >= 2) boats.push({ x: +b[0], z: +b[1] });
    });
    if (isFinite(+msg.clock)) state.clock = +msg.clock;
    if (isFinite(+msg.match)) state.match = +msg.match;
    applyLoot(msg.loot, true);
    syncVolcano();
    if (first) {
      putOnGround(pickSurface(spawn.x, spawn.z, 1.5));
    } else if (!feetClear(px, py, pz)) {
      putOnGround(spawn);
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
    if (id !== AIR && id !== TORCH && id !== LAVA && id !== MAGMA) return;
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
      if (msg.code) lastHostId = String(msg.code);
      if (!linkedSession) {
        netSession = msg.session;
        bcLinked = true;
        roomLockAt = Date.now();
        if (msg.code) lastHostId = String(msg.code);
        bcSend(stamp({ t: 'join', session: msg.session, name: state.name, from: selfId }));
        setWait('小宇：看见房主了，正在进同一张地图…');
      }
      return;
    }
    if (msg.t === 'hb') {
      markHeard();
      if (msg.host && netRole === 'guest' && isFinite(+msg.clock) && +msg.clock + 0.4 >= state.clock) state.clock = +msg.clock;
      if (msg.host && netRole === 'guest' && isFinite(+msg.match)) {
        state.match = +msg.match;
        syncVolcano();
      }
      if (msg.loot) applyLoot(msg.loot, true);
      if (via === 'peer' && netRole === 'host') relay(msg, fromConn);
      return;
    }
    if (msg.t === 'clock' && isFinite(+msg.clock)) {
      if (+msg.clock + 0.4 >= state.clock) state.clock = +msg.clock;
      if (netRole === 'host') relay({ t: 'clock', clock: state.clock, from: msg.from || selfId }, fromConn);
      markHeard();
      return;
    }
    if (msg.t === 'snap' && netRole === 'host') {
      sendHiBc();
      if (fromConn) sendHiConn(fromConn);
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
    if (msg.t === 'mob') {
      var list = msg.k === 'cow' ? cows : msg.k === 'sheep' ? sheep : msg.k === 'chicken' ? chickens : pigs;
      if (list[msg.i | 0]) {
        list[msg.i | 0].hp = msg.hp | 0;
        list[msg.i | 0].alive = (msg.hp | 0) > 0;
        if (msg.k === 'cow' && list[msg.i | 0].alive) list[msg.i | 0].mad = true;
      }
      if (netRole === 'host') relay({ t: 'mob', k: msg.k, i: msg.i | 0, hp: msg.hp | 0, from: msg.from || selfId }, fromConn);
    }
    if (msg.t === 'mobs' && netRole === 'guest') applyMobPack(msg);
    if (msg.t === 'hit' && msg.to === selfId) hurt(2, (msg.name || '朋友') + '砍了你');
    if (msg.t === 'emote') {
      var eid = String(msg.from || '');
      if (eid && remotes[eid]) {
        remotes[eid].emote = String(msg.e || '');
        remotes[eid].emoteUntil = Date.now() + 2800;
      }
      if (netRole === 'host') relay({ t: 'emote', e: msg.e, from: msg.from || selfId }, fromConn);
    }
    if (msg.t === 'lootAsk' && netRole === 'host') {
      var asked = treasureById(msg.id);
      if (asked && !asked.taken) {
        if (!(asked.buried && !coverClear(asked))) {
          asked.taken = String(msg.from || '');
          asked.taker = cleanName(msg.name || '');
          emit({ t: 'loot', id: asked.id, who: asked.taken, name: asked.taker, score: asked.score });
        }
      }
    }
    if (msg.t === 'loot') {
      var got = treasureById(msg.id);
      if (got && !got.taken) {
        got.taken = String(msg.who || '');
        got.taker = cleanName(msg.name || '');
        if (got.taken === selfId) grantScore(got);
      } else if (got && got.taken === selfId) grantScore(got);
    }
  }
  function stopBcPulse() {
    if (bcPulse) { clearInterval(bcPulse); bcPulse = null; }
  }
  function startBcPulse() {
    stopBcPulse();
    bcSend(stamp({ t: 'room', session: netSession, name: state.name, from: selfId, code: netCode || '' }));
    bcPulse = setInterval(function () {
      if (netAbort || netRole !== 'host') { stopBcPulse(); return; }
      bcSend(stamp({ t: 'room', session: netSession, name: state.name, from: selfId, code: netCode || '' }));
      bcSend(stamp({ t: 'hb', host: 1, clock: state.clock, match: state.match || 0, score: state.score | 0, loot: packLoot(), name: state.name, from: selfId }));
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
    if (!roomPin) roomPin = String(1000 + ((Math.random() * 9000) | 0));
    var id = 'xygo-' + TIP + '-' + roomPin;
    netCode = roomPin;
    showRoom(roomPin);
    netClaim(id, function (peer, claimed) {
        if (netAbort || netRole !== 'host') { try { peer.destroy(); } catch (e) {} return; }
        netPeer = peer;
        netCode = roomPin;
        peer.on('connection', onHostConn);
        peer.on('disconnected', function () {
          setTimeout(function () {
            if (netAbort || netRole !== 'host' || netPeer !== peer) return;
            try { peer.reconnect(); } catch (e) {}
          }, 400);
        });
        peer.on('close', function () {
          if (netAbort || netRole !== 'host' || netPeer !== peer) return;
          netPeer = null;
          netLinked = peerConns.length > 0;
          claimHost();
        });
        peer.on('error', function (err) { if (err && err.type === 'peer-unavailable') return; });
      }, function () {
        if (state._pinRetry) {
          toast('房间码暂时占用。同一台电脑的窗口仍可以加入。');
          return;
        }
        state._pinRetry = 1;
        roomPin = String(1000 + ((Math.random() * 9000) | 0));
        claimHost();
      });
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
      if (netConn !== conn) return;
      netLinked = false;
      if (netAbort || netRole !== 'guest') return;
      toast('小宇：信号断了，正在重连');
      setTimeout(reconnectGuest, 700);
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
            lastHostId = won.id;
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
  function reconnectGuest() {
    if (netAbort || netRole !== 'guest' || reconnecting) return;
    if (bcLinked && Date.now() - lastHeard < 6000) return;
    reconnecting = true;
    var id = lastHostId;
    function giveUp() {
      if (!reconnecting) return;
      reconnecting = false;
      if (netAbort || netRole !== 'guest' || (state.gotHost && bcLinked)) return;
      probeGuestNow();
    }
    setTimeout(function () { if (reconnecting) giveUp(); }, 5000);
    if (!id || typeof Peer === 'undefined') { giveUp(); return; }
    var peer = netPeer;
    if (!peer || peer.destroyed) {
      try { peer = netNewPeer(); netPeer = peer; }
      catch (e) { giveUp(); return; }
      peer.on('open', function () { connectKnown(); });
      peer.on('error', function () {});
      return;
    }
    function connectKnown() {
      var conn, timer;
      try { conn = peer.connect(id, { reliable: true }); }
      catch (e2) { giveUp(); return; }
      timer = setTimeout(function () {
        try { conn.close(); } catch (e3) {}
        giveUp();
      }, 4000);
      conn.on('open', function () {
        clearTimeout(timer);
        reconnecting = false;
        wireGuest(conn);
        try { conn.send(stamp({ t: 'snap', from: selfId, session: netSession || '' })); } catch (e4) {}
        toast('小宇：重新连上了');
      });
      conn.on('error', function () {});
    }
    if (peer.open) connectKnown();
    else peer.on('open', function () { if (reconnecting) connectKnown(); });
  }
  function startNetWatch() {
    if (netWatch) clearInterval(netWatch);
    lastHeard = Date.now();
    roomLockAt = Date.now();
    netWatch = setInterval(function () {
      if (netAbort || !netRole) return;
      if (netRole === 'guest' && !state.gotHost && linkedSession && roomLockAt && Date.now() - roomLockAt > 5000) {
        linkedSession = '';
        netSession = '';
        bcLinked = false;
        roomLockAt = 0;
      }
      if (netRole === 'guest' && state.gotHost && Date.now() - lastHeard > 6000) reconnectGuest();
    }, 1000);
  }
  function stopNetWatch() {
    if (netWatch) { clearInterval(netWatch); netWatch = null; }
  }
  function connectGuestCode(pin) {
    var id = 'xygo-' + TIP + '-' + pin;
    lastHostId = id;
    var peer;
    try { peer = netNewPeer(); } catch (e) { setWait('连不上房间'); return; }
    netPeer = peer;
    peer.on('open', function () {
      var conn, timer;
      try { conn = peer.connect(id, { reliable: true }); }
      catch (e2) { setWait('房间码连不上'); return; }
      timer = setTimeout(function () {
        if (!netLinked) setWait('房间 ' + pin + ' 还没通。对一下 4 位数字。跨网若强制走中继，要等更久。');
      }, 12000);
      conn.on('open', function () { clearTimeout(timer); wireGuest(conn); setWait(''); });
      conn.on('error', function () {});
    });
    peer.on('error', function () {
      if (!state.gotHost && !bcLinked) setWait('信令不通。同一台电脑的两个窗口仍可以直接加入。');
    });
  }
  function beginHost() {
    openBC();
    netAbort = false;
    netRole = 'host';
    applyHostName();
    if (!roomPin) roomPin = String(1000 + ((Math.random() * 9000) | 0));
    netCode = roomPin;
    showRoom(roomPin);
    netSession = 'mw' + ((Date.now() / 1000) | 0).toString(36) + Math.random().toString(36).slice(2, 6);
    enterGame(false);
    startBcPulse();
    startNetWatch();
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
  function beginJoin(code) {
    openBC();
    if (state.started && netRole === 'host') return;
    if (!state.gotHost) snapshotHome();
    netAbort = false;
    netRole = 'guest';
    state.gotHost = false;
    linkedSession = '';
    netSession = '';
    var pin = String(code || '').replace(/\D/g, '').slice(0, 4);
    if (pin.length === 4) {
      roomPin = pin;
      lastHostId = 'xygo-' + TIP + '-' + pin;
      setWait('正在连房间 ' + pin);
    } else {
      setWait('同一台电脑可以直接加入。跨网络请输入房主的 4 位房间码。');
    }
    startNetWatch();
    var cancel = $('netCancel');
    if (cancel) cancel.hidden = false;
    ensurePeer(function (ok) {
      if (netAbort || netRole !== 'guest') return;
      if (pin.length === 4) {
        if (!ok) { setWait('联网组件没载入'); return; }
        connectGuestCode(pin);
        return;
      }
      if (!ok) setWait('联网组件没载入。同一台电脑请再开一个窗口点加入。');
    });
  }
  function netShutdown() {
    var wasGuest = netRole === 'guest';
    var wasHost = netRole === 'host';
    var playing = state.started;
    netAbort = true;
    stopBcPulse();
    stopNetWatch();
    reconnecting = false;
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
    var rk;
    for (rk in remotes) delete remotes[rk];
    state.gotHost = false;
    var cancel = $('netCancel');
    if (cancel) cancel.hidden = true;
    setNetStatus();
    if (wasGuest && playing) toast('小宇：已经分开。再打开页面是新的一局。');
    else if (wasHost && playing) toast('小宇：已经单独玩');
    else if (wasGuest) setWait('已取消');
  }
  function applyHostName() {
    if (!state.nameTouched) {
      state.name = HOST_NAME;
      renderHud();
      var label = $('nameLabel');
      if (label) label.textContent = state.name;
    }
  }
  function rollName() {
    var n = KID_NAMES[(Math.random() * KID_NAMES.length) | 0];
    if (n === state.name) n = KID_NAMES[(KID_NAMES.indexOf(n) + 1) % KID_NAMES.length];
    state.name = n;
    state.nameTouched = true;
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
    if (join) join.addEventListener('click', function () {
      var input = $('roomIn');
      beginJoin(input ? input.value : '');
    });
    var tradeBtn = $('trade');
    if (tradeBtn) tradeBtn.addEventListener('click', function (e) { e.preventDefault(); tryTrade(); });
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
      if (e.code === 'Digit4') { setHold('bed'); return; }
      if (e.code === 'KeyB') { toggleSit(); return; }
      if (e.code === 'KeyN') { sleepNow(); return; }
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
    var sitBtn = $('sit');
    if (sitBtn) sitBtn.addEventListener('click', function (e) { e.preventDefault(); toggleSit(); });
    var sleepBtn = $('sleepBtn');
    if (sleepBtn) sleepBtn.addEventListener('click', function (e) { e.preventDefault(); sleepNow(); });
    var emoteBtn = $('emote');
    var emoteBar = $('emotes');
    if (emoteBtn && emoteBar) {
      emoteBtn.addEventListener('click', function (e) {
        e.preventDefault();
        emoteBar.hidden = !emoteBar.hidden;
      });
    }
    var emoteBtns = typeof document !== 'undefined' ? document.querySelectorAll('#emotes button') : [];
    var ei;
    for (ei = 0; ei < emoteBtns.length; ei++) {
      emoteBtns[ei].addEventListener('click', function (e) {
        e.preventDefault();
        sendEmote(e.currentTarget.getAttribute('data-emote'));
        if (emoteBar) emoteBar.hidden = true;
      });
    }
    var mapBtn = $('mapBtn');
    if (mapBtn) mapBtn.addEventListener('click', function () {
      mapOpen = !mapOpen;
      mapBtn.classList.toggle('on', mapOpen);
      var canvas = $('map');
      if (canvas) canvas.hidden = !mapOpen;
    });
    var closeCraft = $('craftClose');
    if (closeCraft) closeCraft.addEventListener('click', function () { var c = $('craft'); if (c) c.hidden = true; });
    var matBtns = typeof document !== 'undefined' ? document.querySelectorAll('#mixMats button[data-mat]') : [];
    var mi;
    for (mi = 0; mi < matBtns.length; mi++) {
      matBtns[mi].addEventListener('click', function (e) {
        addMix(e.currentTarget.getAttribute('data-mat'));
      });
    }
    var mixGo = $('mixGo');
    if (mixGo) mixGo.addEventListener('click', function () { craftMix(); });
    var mixClear = $('mixClear');
    if (mixClear) mixClear.addEventListener('click', clearMix);
    var craftBtns = typeof document !== 'undefined' ? document.querySelectorAll('#craft button[data-craft]') : [];
    var ci;
    for (ci = 0; ci < craftBtns.length; ci++) {
      craftBtns[ci].addEventListener('click', function (e) {
        craft(e.currentTarget.getAttribute('data-craft'));
      });
    }
    var packBox = $('pack');
    if (packBox) packBox.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('button') : null;
      if (!btn) return;
      e.preventDefault();
      selectPack(btn.getAttribute('data-pack'));
    });
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
    WATER: WATER, SAND: SAND, FLOWER: FLOWER, GOLD: GOLD, TORCH: TORCH, CHEST: CHEST, BED: BED, IRON_ORE: IRON_ORE, SNOW: SNOW,
    NET_PEER_OPTS: NET_PEER_OPTS, KID_NAMES: KID_NAMES,
    state: state, boats: boats, remotes: remotes,
    at: at, put: put, grow: grow, loadRaw: loadRaw, save: save, scan: scan,
    craft: craft, breakBlock: breakBlock, breakTime: breakTime, placeTorchAt: placeTorchAt,
    addBoat: addBoat, snapshotHome: snapshotHome, pinHome: function () { snapshotHome(); lockHome = true; },
    applyNet: onNet, applyPos: applyPos, dayFactor: dayFactor, skyRGB: skyRGB,
    setClock: function (s) { state.clock = s; },
    weaponCode: weaponCode, handKind: handKind, inWaterAt: inWaterAt, sim: sim, overlaps: overlaps, tryPlace: tryPlace,
    feetClear: feetClear, pickSurface: pickSurface, putOnGround: putOnGround,
    solid: solid, pigs: pigs, cows: cows, sheep: sheep, chickens: chickens, villagers: villagers,
    cowBump: cowBump, tryShoot: tryShoot, mapDots: mapDots, wearingArmor: wearingArmor,
    columnSurface: columnSurface, tryShore: tryShore, toggleRide: toggleRide, toggleSit: toggleSit,
    sleepNow: sleepNow, lightPoints: lightPoints, load: load, dayPhase: dayPhase,
    eatFood: eatFood, startCook: startCook, tryTrade: tryTrade, GUN_DMG: GUN_DMG,
    peerUp: function () { return !!netLinked; },
    roomPin: function () { return roomPin; },
    PIG_HP: PIG_HP, COW_HP: COW_HP, SHEEP_HP: SHEEP_HP, CHICKEN_HP: CHICKEN_HP, toolLeft: toolLeft,
    BOAR_AGGRO: BOAR_AGGRO, BOAR_HIT: BOAR_HIT, BOAR_SPEED: BOAR_SPEED,
    COW_SPEED: COW_SPEED, SHEEP_FLEE: SHEEP_FLEE, CHICKEN_FLEE: CHICKEN_FLEE,
    treeStats: treeStats, meleeDmg: meleeDmg, sendEmote: sendEmote, inSnowTerritory: inSnowTerritory,
    clockText: clockText, selectPack: selectPack, villageAt: function () { return village; },
    press: function (code, on) { keys[code] = !!on; },
    setPunch: function (on) { punching = !!on; pointerPunch = !!on; },
    selfId: function () { return selfId; },
    setSelfForTest: function (id) { selfId = id; },
    setRole: function (role) { netRole = role; },
    HOST_NAME: HOST_NAME, MATCH_SEC: MATCH_SEC,
    VOLCANO_FIRST: VOLCANO_FIRST, VOLCANO_DUR: VOLCANO_DUR, VOLCANO_PERIOD: VOLCANO_PERIOD,
    LAVA: LAVA, MAGMA: MAGMA, COAL_ORE: COAL_ORE,
    MIX: MIX, GEAR: GEAR,
    craftMix: craftMix, addMix: addMix,
    volcanoPhase: volcanoPhase, syncVolcano: syncVolcano,
    setMatch: function (s) { state.match = s; if (s < MATCH_SEC) state.matchOver = false; syncVolcano(); },
    matchLabel: matchLabel, activeRocks: activeRocks, tickRocks: tickRocks,
    treasures: function () { return treasures; },
    volcanoInfo: function () { return volcano; },
    tryTake: tryTake, applyHostName: applyHostName,
    hotUnder: hotUnder, coverClear: coverClear
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
