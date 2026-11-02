/**
 * Tonight workbench save. v1.2 adds wallet (coins, weapons, equipped)
 * and still writes the v1.1 tiles / traps / mine fields.
 * Audio (bgmId + sfx toggles) lives beside wallet without breaking it.
 * Slice4: levelAudio {"1"…"9":{bgmId}} optional per-level BGM; missing → audio.bgmId.
 * Default runway: tonight-waves-v1 (safe start, four waves, all traps).
 * ldt31 / §8: placeable 电凹大箱; coin 5/15/30; practice 110; spring OK in SAFE0;
 *   setIntervalValue syncs mp.spike (per-level overrides global).
 * ldt34: version "1.3" still reads "1.2".
 *   cols may be 12 (legacy) or 24 (new runway).
 *   Scene arc is exactly 5 (easy→hard). editor.levelId 1–5.
 *   Each preset fills character, backdrop, one of 9 BGM slots, shared SFX,
 *   traps, numbers, placements, and monsters (小/大).
 *   Weapon shop unlocks at scene 4. Scene 5 is the net battle capstone.
 *
 * Sync (do not merge these keys):
 *   xygo-custom-level     current slot. Place/erase and 试玩 read/write this only.
 *   xygo-my-levels        roster for 「我的第 1 关」 only. Not the 5-scene arc.
 *   xygo-level-edits      scene 1–5 overrides {version:1, levels:{"1":{title,savedAt,doc}}}.
 *   xygo-scene5-progress  tried/completed for the 5-scene arc only.
 *   sycocos-level-progress  old Boss 1–8. This file never writes it.
 * Reopen (level 9 / 玩第9关 / ?open=my1) copies roster doc "my-1" back into the slot.
 * No Cocos calls, so a node check can load this file.
 */
(function (root) {
  var KEY = 'xygo-custom-level';
  var MY_KEY = 'xygo-my-levels';
  var EDIT_KEY = 'xygo-level-edits';
  var SCENE_KEY = 'xygo-scene5-progress';
  var SCENE_COUNT = 5;
  var MY_ID = 'my-1';
  var MY_TITLE = '我的第 1 关';
  var ROWS = 4;
  var COLS_LEGACY = 12;
  var COLS_DEFAULT = 24;
  var COLS_MAX = 36;
  var MC = COLS_DEFAULT;
  var SAFE0 = 2;
  var LEVEL_TITLES = ['', '林间晨跑', '苔岩小径', '萤火树冠', '尖刺走廊', '雷鸣对战'];
  /* 9 named cues. Playback uses fileId — only explore/tense/win/fail exist on disk. */
  var BGM_POOL = [
    { id: 'explore', name: '探险', fileId: 'explore' },
    { id: 'tense', name: '紧张', fileId: 'tense' },
    { id: 'win', name: '过关', fileId: 'win' },
    { id: 'fail', name: '失败', fileId: 'fail' },
    { id: 'dawn', name: '清晨', fileId: 'explore' },
    { id: 'march', name: '行进', fileId: 'explore' },
    { id: 'storm', name: '暴风雨', fileId: 'tense' },
    { id: 'night', name: '夜路', fileId: 'tense' },
    { id: 'cheer', name: '欢呼', fileId: 'win' }
  ];
  var MONSTERS = [
    { id: 'boar', name: '野猪' },
    { id: 'slime', name: '史莱姆' },
    { id: 'shadow', name: '影忍者' },
    { id: 'bug', name: '甲虫' },
    { id: 'thunder', name: '雷兽' }
  ];
  /* Photos already in xy-go/scenes. hall/thunder reuse a photo with a tint. */
  var BACKDROPS = [
    { id: 'forest', name: '林间白天', file: 'forest-day.jpg' },
    { id: 'moss', name: '苔岩黄昏', file: 'moss-dusk.jpg' },
    { id: 'canopy', name: '萤火夜', file: 'canopy-night.jpg' },
    { id: 'hall', name: '尖刺暖廊', file: 'forest-day.jpg', tint: [255, 186, 120] },
    { id: 'thunder', name: '雷鸣夜', file: 'canopy-night.jpg', tint: [150, 176, 255] }
  ];

  function blankMap(n) {
    n = n | 0;
    if (n < 8 || n > COLS_MAX) n = MC;
    var m = [];
    for (var i = 0; i < n; i++) m.push(null);
    return m;
  }

  function resizeMap(map, n) {
    var next = blankMap(n);
    var i;
    var src = map || [];
    for (i = 0; i < next.length && i < src.length; i++) next[i] = src[i] || null;
    return next;
  }

  function colsOf(state) {
    var n = state && (state.cols | 0);
    if (!n && state && state.map) n = state.map.length;
    if (n < 8 || n > COLS_MAX) n = MC;
    return n;
  }

  /** Easy → hard starters. Hazards never sit in the first SAFE0 cells. */
  function templatePairs(n) {
    var specs = {
      1: [[0, 'start'], [3, 'coin'], [5, 'coin'], [8, 'spike'], [11, 'coin'], [14, 'goal']],
      2: [[0, 'start'], [3, 'coin'], [6, 'spike'], [9, 'coin'], [11, 'spring'], [13, 'spike'], [16, 'goal']],
      3: [[0, 'start'], [3, 'coin'], [6, 'spike'], [8, 'coin'], [11, 'fire'], [13, 'coin'], [15, 'mist'], [18, 'goal']],
      4: [[0, 'start'], [3, 'coin'], [6, 'spike'], [8, 'coin'], [10, 'rock'], [12, 'fire'], [14, 'coinBig'], [16, 'spike'], [18, 'electric'], [21, 'goal']],
      5: [[0, 'start'], [3, 'coin'], [5, 'spike'], [7, 'fire'], [9, 'coin'], [11, 'electric'], [13, 'mist'], [15, 'rock'], [17, 'groove'], [19, 'spike'], [21, 'fire'], [23, 'goal']]
    };
    return specs[(n | 0)] || specs[1];
  }

  function templateMeta(n) {
    var metas = {
      1: { character: 'green', backdrop: 'forest', bgmId: 'dawn', monsters: [{ id: 'boar', size: 'small', x: 10 }], weaponUnlock: false, win: 'goal', net: false },
      2: { character: 'green', backdrop: 'moss', bgmId: 'explore', monsters: [{ id: 'slime', size: 'small', x: 8 }, { id: 'boar', size: 'small', x: 14 }], weaponUnlock: false, win: 'goal', net: false },
      3: { character: 'red', backdrop: 'canopy', bgmId: 'night', monsters: [{ id: 'shadow', size: 'small', x: 9 }, { id: 'bug', size: 'small', x: 16 }], weaponUnlock: false, win: 'goal', net: false },
      4: { character: 'blue', backdrop: 'hall', bgmId: 'storm', monsters: [{ id: 'bug', size: 'small', x: 8 }, { id: 'bug', size: 'big', x: 17 }], weaponUnlock: true, win: 'goal', net: false },
      5: { character: 'green', backdrop: 'thunder', bgmId: 'tense', monsters: [{ id: 'thunder', size: 'small', x: 7 }, { id: 'shadow', size: 'small', x: 12 }, { id: 'thunder', size: 'big', x: 18 }], weaponUnlock: true, win: 'goal', net: true }
    };
    var meta = metas[(n | 0)] || metas[1];
    return {
      character: meta.character,
      backdrop: meta.backdrop,
      bgmId: meta.bgmId,
      monsters: meta.monsters.map(function (m) { return { id: m.id, size: m.size, x: m.x }; }),
      weaponUnlock: !!meta.weaponUnlock,
      win: meta.win || 'goal',
      net: !!meta.net,
      sfxShared: true
    };
  }

  function bgmById(id) {
    var i;
    for (i = 0; i < BGM_POOL.length; i++) if (BGM_POOL[i].id === id) return BGM_POOL[i];
    return BGM_POOL[0];
  }

  function monsterName(id) {
    var i;
    for (i = 0; i < MONSTERS.length; i++) if (MONSTERS[i].id === id) return MONSTERS[i].name;
    return '怪物';
  }

  function backdropById(id) {
    var i;
    for (i = 0; i < BACKDROPS.length; i++) if (BACKDROPS[i].id === id) return BACKDROPS[i];
    if (id === 'swamp') return BACKDROPS[1];
    return BACKDROPS[0];
  }

  function cycleBackdrop(state) {
    var cur = state && state.backdrop;
    var idx = 0;
    var i;
    for (i = 0; i < BACKDROPS.length; i++) if (BACKDROPS[i].id === cur) idx = i;
    var next = BACKDROPS[(idx + 1) % BACKDROPS.length];
    if (state) state.backdrop = next.id;
    return next;
  }

  function cycleBgm(state) {
    var cur = state && state.bgmId;
    var idx = 0;
    var i;
    for (i = 0; i < BGM_POOL.length; i++) if (BGM_POOL[i].id === cur) idx = i;
    var next = BGM_POOL[(idx + 1) % BGM_POOL.length];
    if (state) {
      state.bgmId = next.id;
      if (!state.audio || typeof state.audio !== 'object') state.audio = blankAudio();
      state.audio.bgmId = next.fileId;
    }
    return next;
  }

  var CAST = [
    { id: 'green', name: '绿忍者' },
    { id: 'red', name: '红忍者' },
    { id: 'blue', name: '蓝忍者' }
  ];
  function cycleCharacter(state) {
    var cur = state && state.character;
    var idx = 0;
    var i;
    for (i = 0; i < CAST.length; i++) if (CAST[i].id === cur) idx = i;
    var next = CAST[(idx + 1) % CAST.length];
    if (state) state.character = next.id;
    return next;
  }

  function toggleSfx(state) {
    if (!state.audio || typeof state.audio !== 'object') state.audio = blankAudio();
    if (!state.audio.sfx) state.audio.sfx = blankAudio().sfx;
    var on = false;
    var k;
    for (k in state.audio.sfx) if (state.audio.sfx[k]) on = true;
    var next = !on;
    for (k in state.audio.sfx) state.audio.sfx[k] = next;
    return next;
  }

  function monsterAt(state, x) {
    var list = (state && state.monsters) || [];
    var i;
    for (i = 0; i < list.length; i++) if ((list[i].x | 0) === (x | 0)) return list[i];
    return null;
  }

  function cycleMonsterAt(state, x) {
    var hit = monsterAt(state, x);
    if (!hit) return null;
    var ids = [];
    var i;
    for (i = 0; i < MONSTERS.length; i++) ids.push(MONSTERS[i].id);
    var pos = ids.indexOf(hit.id);
    if (pos < 0) pos = 0;
    if (hit.size !== 'big') hit.size = 'big';
    else {
      hit.size = 'small';
      hit.id = ids[(pos + 1) % ids.length];
    }
    return hit;
  }

  function moveMonster(state, fromX, toX) {
    var hit = monsterAt(state, fromX);
    if (!hit) return { ok: false, flash: '' };
    if ((toX | 0) < SAFE0) return { ok: false, flash: '怪物别放在出生两格' };
    hit.x = toX | 0;
    return { ok: true, flash: '怪物搬过来了' };
  }

  function templateMap(n) {
    var m = blankMap(COLS_DEFAULT);
    templatePairs(n).forEach(function (pair) {
      var x = pair[0];
      var k = pair[1];
      if (x < 0 || x >= m.length) return;
      if (isStartHazard(k) && x < SAFE0) return;
      m[x] = k;
    });
    return m;
  }

  function levelTitle(n) {
    n = n | 0;
    return LEVEL_TITLES[n] || ('第' + n + '关');
  }


  function defaultMp() {
    return {
      spike: { interval: 3, up: 1, damage: 1 },
      fire: { dur: 3, damage: 1 }
    };
  }

  var WEAPONS = {
    dart: { id: 'dart', name: '飞镖', price: 15 },
    blade: { id: 'blade', name: '砍刀', price: 35 },
    gun: { id: 'gun', name: '枪', price: 60 }
  };

  /** Practice purse for tonight ④ shop: gun 60 + spare (LEVEL-STEPS §8 → 110). */
  var STARTER_COINS = 110;
  /** Wallet coin tiers: small / big / chest (backward compat: old `coin` = small). */
  var COIN_VALUES = { coin: 5, coinBig: 15, chest: 30 };

  function blankWallet() {
    return { coins: STARTER_COINS, weapons: [], equipped: null };
  }

  /**
   * Grant 练习金 once for empty starter wallets (coins===0 && never purchased).
   * Does not refill after a buy that spent down to 0, and never clears weapons.
   */
  function ensurePracticeWallet(state) {
    if (!state) return false;
    if (!state.wallet) state.wallet = blankWallet();
    var wal = state.wallet;
    if (!Array.isArray(wal.weapons)) wal.weapons = [];
    if ((wal.coins | 0) === 0 && wal.weapons.length === 0) {
      wal.coins = STARTER_COINS;
      wal.equipped = wal.equipped || null;
      return true;
    }
    return false;
  }

  function blankAudio() {
    if (root.WBAudio && root.WBAudio.blankAudio) return root.WBAudio.blankAudio();
    return {
      bgmId: 'explore',
      sfx: {
        walk: true, jump: true, land: true, spike: true, fire: true,
        spring: true, coin: true, hurt: true, hit: true, slash: true
      }
    };
  }

  function blankLevelAudio() {
    if (root.WBAudio && root.WBAudio.blankLevelAudio) return root.WBAudio.blankLevelAudio();
    return {};
  }

  function normalizeLevelAudio(raw) {
    if (root.WBAudio && root.WBAudio.normalizeLevelAudio) return root.WBAudio.normalizeLevelAudio(raw);
    return blankLevelAudio();
  }

  function normalizeAudio(raw) {
    if (root.WBAudio && root.WBAudio.normalize) return root.WBAudio.normalize(raw);
    var a = blankAudio();
    if (!raw || typeof raw !== 'object') return a;
    if (typeof raw.bgmId === 'string') a.bgmId = raw.bgmId;
    if (raw.sfx && typeof raw.sfx === 'object') {
      Object.keys(a.sfx).forEach(function (k) {
        if (typeof raw.sfx[k] === 'boolean') a.sfx[k] = raw.sfx[k];
      });
    }
    return a;
  }

  /**
   * Perfect default runway: safe start, four waves, all trap kinds,
   * monsters/boss stay at the play end (not on the 12 design cells).
   * 教 2–3 · 练 4–5 · 变 6–8 沼泽×2+石 · 考 10–11, with coin breaths.
   */
  function defaultMineMap() {
    return templateMap(1);
  }

  function defaultTraps() {
    return {
      spike: { interval: 3, up: 1, damage: 1 },
      fire: { damage: 1, dur: 3, burn: 3 },
      rock: { damage: 1, foreshadow: 0.7 },
      mist: { slow: 1.6 },
      spring: { power: 1300 },
      electric: { damage: 1, stun: 0.45 },
      groove: { slow: 0.55, fallIn: 1 }
    };
  }

  /** Full localStorage payload shared by workbench, custom-play, xy-go ?custom=1. */
  function buildDefaultSave(extra) {
    var map = defaultMineMap();
    var mp = defaultMp();
    var tiles = [];
    var x;
    for (x = 0; x < map.length; x++) tiles.push({ x: x, y: ROWS - 1, type: 'g' });
    /* one late gap in 考区前，不打断前三波铺垫 */
    tiles = tiles.filter(function (t) { return !(t.x === 9 && t.y === ROWS - 1); });
    map.forEach(function (k, i) { if (k) tiles.push({ x: i, y: ROWS - 2, type: k }); });
    var d = {
      version: '1.2',
      theme: 'swamp',
      cols: map.length,
      rows: ROWS,
      tiles: tiles,
      traps: defaultTraps(),
      mine: {
        map: map.slice(),
        mp: {
          spike: { interval: mp.spike.interval, up: mp.spike.up, damage: mp.spike.damage },
          fire: { dur: mp.fire.dur, damage: mp.fire.damage }
        }
      },
      wallet: blankWallet(),
      music: '',
      likes: 0,
      audio: blankAudio(),
      levelAudio: blankLevelAudio(),
      lastScore: 0,
      by: '',
      presetId: 'tonight-waves-v1'
    };
    if (extra && typeof extra === 'object') {
      Object.keys(extra).forEach(function (k) { d[k] = extra[k]; });
    }
    return d;
  }

  function createState() {
    var map = defaultMineMap();
    return {
      interval: 3,
      hook: '',
      expect: '',
      best_fun: '',
      hardest: '',
      add_one: '',
      who: '小宇',
      tool: 'spike',
      sel: 'spike',
      selX: 3,
      map: map,
      cols: map.length,
      levelId: 0,
      levelTitle: '',
      character: 'green',
      backdrop: 'swamp',
      win: 'goal',
      mp: defaultMp(),
      wallet: blankWallet(),
      music: '',
      likes: 0,
      audio: blankAudio(),
      levelAudio: blankLevelAudio(),
      lastScore: 0,
      myLevelId: '',
      myLevelTitle: ''
    };
  }

  function isTrap(k) {
    return k === 'spike' || k === 'fire' || k === 'rock' || k === 'mist' || k === 'spring'
      || k === 'electric' || k === 'groove';
  }
  /** True hazards banned in first SAFE0 cols — spring is NOT included (§8). */
  function isStartHazard(k) {
    return k === 'spike' || k === 'fire' || k === 'rock' || k === 'mist'
      || k === 'electric' || k === 'groove';
  }
  function isReward(k) { return k === 'coin' || k === 'coinBig' || k === 'chest' || k === 'shield'; }
  function isMarker(k) { return k === 'start' || k === 'goal'; }
  function isPlaceable(k) {
    return k === 'spike' || k === 'fire' || k === 'coin' || k === 'coinBig' || k === 'chest'
      || k === 'spring' || k === 'mist' || k === 'rock' || k === 'electric' || k === 'groove'
      || k === 'start' || k === 'goal';
  }
  function coinValue(k) { return COIN_VALUES[k] || 0; }

  function fCnt(I) { return Math.floor(12 / I); }
  function fHit(I) { return 5 - I; }

  function zone(x, cols) {
    cols = cols | 0;
    if (cols < 8) cols = MC;
    var a = Math.max(SAFE0 + 1, Math.round(cols * 0.22));
    var b = Math.round(cols * 0.5);
    var c = Math.round(cols * 0.72);
    if (x < a) return ['教', '#4ea85c'];
    if (x < b) return ['练', '#e6c200'];
    if (x < c) return ['变', '#e2793b'];
    return ['考', '#e23b3b'];
  }

  function mEst(map, mp) {
    var sh = 0;
    return map.map(function (k, x) {
      if (k === 'shield' || k === 'spring' || k === 'mist') { if (k === 'shield') sh++; return 0; }
      if (k === 'rock' || k === 'electric') return 1;
      if (k === 'groove') return 0;
      if (!isTrap(k)) return 0;
      var p = mp[k] || {};
      var n;
      if (k === 'fire') n = { 1: 0, 3: 1, 5: 2 }[p.dur];
      else if (k === 'spike') n = (Math.min(1, (p.up || 0) / (p.interval || 1)) >= 0.34 ? 1 : 0);
      else n = { 1: 2, 3: 1, 5: 0 }[p.interval];
      if (n == null) n = 0;
      var left = map[x - 1], right = map[x + 1];
      if (k !== 'spike' && (isTrap(left) || left === 'spring' || isTrap(right))) n++;
      var h = n * (p.damage || 1);
      if (h > 0 && sh) { sh--; h = Math.max(0, h - (p.damage || 1)); }
      return h;
    });
  }

  function checks(map) {
    var traps = [];
    map.forEach(function (k, i) { if (isTrap(k)) traps.push(i); });
    var types = {};
    traps.forEach(function (i) { types[map[i]] = 1; });
    var safeStart = !traps.some(function (i) { return i < SAFE0 && isStartHazard(map[i]); });
    var easyLimit = Math.max(4, Math.round((map.length || MC) * 0.34));
    var easy = traps.length ? traps[0] <= easyLimit : true;
    var breath = true;
    for (var i = 1; i < traps.length; i++) {
      if (traps[i] - traps[i - 1] <= 1) {
        var mid = map.slice(traps[i - 1], traps[i] + 1);
        if (!mid.some(isReward)) breath = false;
      }
    }
    return [
      ['开头空着', safeStart],
      ['先易后难', easy],
      ['有喘气', breath],
      ['花样不超过3', Object.keys(types).length <= 3]
    ];
  }

  function inferCols(raw) {
    if (raw && typeof raw.cols === 'number' && raw.cols >= 8 && raw.cols <= COLS_MAX) return raw.cols | 0;
    if (raw && raw.mine && Array.isArray(raw.mine.map) && raw.mine.map.length >= 8 && raw.mine.map.length <= COLS_MAX) {
      return raw.mine.map.length;
    }
    return MC;
  }

  function mapFromTiles(tiles, cols) {
    var m = blankMap(cols);
    (tiles || []).forEach(function (t) {
      if (!t || t.y !== ROWS - 2) return;
      if (t.x < 0 || t.x >= m.length || !t.type || t.type === 'g') return;
      m[t.x] = t.type;
    });
    return m;
  }

  function load(storage) {
    var s = createState();
    var raw = null;
    try { raw = JSON.parse(storage.getItem(KEY) || 'null'); } catch (e) { raw = null; }
    if (!raw || typeof raw !== 'object') return s;
    if (raw.hook_seen || raw.reflectHook) s.hook = raw.hook_seen || raw.reflectHook || '';
    if (raw.vs_expect || raw.reflectExpect) s.expect = raw.vs_expect || raw.reflectExpect || '';
    ['best_fun', 'hardest', 'add_one', 'who'].forEach(function (k) {
      if (raw[k]) s[k] = raw[k];
    });
    var cols = inferCols(raw);
    s.cols = cols;
    if (raw.mine && Array.isArray(raw.mine.map)) {
      s.map = resizeMap(raw.mine.map, cols);
    } else if (Array.isArray(raw.tiles)) {
      s.map = mapFromTiles(raw.tiles, cols);
    } else {
      s.map = blankMap(cols);
    }
    if (raw.editor && typeof raw.editor === 'object') {
      if (raw.editor.levelId) s.levelId = raw.editor.levelId | 0;
      if (typeof raw.editor.character === 'string') s.character = raw.editor.character;
      if (typeof raw.editor.backdrop === 'string') s.backdrop = raw.editor.backdrop;
      if (raw.editor.win === 'goal' || raw.editor.win === 'boss' || raw.editor.win === 'coins') s.win = raw.editor.win;
      if (typeof raw.editor.bgmId === 'string') s.bgmId = raw.editor.bgmId;
      if (typeof raw.editor.weaponUnlock === 'boolean') s.weaponUnlock = raw.editor.weaponUnlock;
      if (typeof raw.editor.net === 'boolean') s.net = raw.editor.net;
      if (Array.isArray(raw.editor.monsters)) s.monsters = raw.editor.monsters;
    }
    if (s.levelId >= 1 && s.levelId <= SCENE_COUNT) s.levelTitle = levelTitle(s.levelId);
    var mp = (raw.mine && raw.mine.mp) || {};
    var tr = raw.traps || {};
    if (mp.spike) copyFields(s.mp.spike, mp.spike);
    else if (tr.spike) copyFields(s.mp.spike, tr.spike);
    /* 单关刺频：存档 mp/traps 覆盖全局 interval 默认 */
    if (s.mp.spike && typeof s.mp.spike.interval === 'number') s.interval = s.mp.spike.interval;
    if (mp.fire) copyFields(s.mp.fire, mp.fire);
    else if (tr.fire) {
      if (tr.fire.damage) s.mp.fire.damage = tr.fire.damage;
      if (tr.fire.dur) s.mp.fire.dur = tr.fire.dur;
    }
    var wal = raw.wallet;
    if (wal && typeof wal === 'object') {
      if (typeof wal.coins === 'number' && wal.coins >= 0) s.wallet.coins = wal.coins | 0;
      if (Array.isArray(wal.weapons)) {
        s.wallet.weapons = [];
        wal.weapons.forEach(function (id) {
          if (WEAPONS[id] && s.wallet.weapons.indexOf(id) < 0) s.wallet.weapons.push(id);
        });
      }
      if (wal.equipped && WEAPONS[wal.equipped] && s.wallet.weapons.indexOf(wal.equipped) >= 0) {
        s.wallet.equipped = wal.equipped;
      }
    }
    if (typeof raw.music === 'string') s.music = raw.music;
    if (typeof raw.likes === 'number' && raw.likes >= 0) s.likes = raw.likes | 0;
    s.audio = normalizeAudio(raw.audio);
    s.levelAudio = normalizeLevelAudio(raw.levelAudio);
    if (typeof raw.lastScore === 'number' && raw.lastScore >= 0) s.lastScore = raw.lastScore | 0;
    s.myLevelId = (typeof raw.myLevelId === 'string') ? raw.myLevelId : '';
    s.myLevelTitle = (typeof raw.myLevelTitle === 'string') ? raw.myLevelTitle : '';
    normalizeMarkers(s.map);
    for (var i = 0; i < s.map.length; i++) {
      if (s.map[i] === 'spike' || s.map[i] === 'fire' || s.map[i] === 'spring' || s.map[i] === 'mist' || s.map[i] === 'rock') {
        s.sel = s.map[i];
        s.selX = i;
        s.tool = s.map[i];
        break;
      }
    }
    if (ensurePracticeWallet(s)) {
      try { save(storage, s); } catch (eSave) { /* ignore quota */ }
    }
    return s;
  }

  function copyFields(dst, src) {
    Object.keys(dst).forEach(function (k) {
      if (typeof src[k] === 'number') dst[k] = src[k];
    });
  }

  function save(storage, state) {
    var prev = {};
    try { prev = JSON.parse(storage.getItem(KEY) || '{}') || {}; } catch (e) { prev = {}; }
    if (!prev || typeof prev !== 'object') prev = {};
    normalizeMarkers(state.map);
    state.cols = state.map.length;
    var tiles = [];
    for (var x = 0; x < state.map.length; x++) tiles.push({ x: x, y: ROWS - 1, type: 'g' });
    state.map.forEach(function (k, i) { if (k) tiles.push({ x: i, y: ROWS - 2, type: k }); });
    var used = {};
    state.map.forEach(function (k) { if (k) used[k] = 1; });
    var tr = {};
    if (used.spike) {
      tr.spike = {
        interval: state.mp.spike.interval,
        up: state.mp.spike.up,
        damage: state.mp.spike.damage
      };
    }
    if (used.fire) {
      tr.fire = {
        damage: state.mp.fire.damage,
        dur: state.mp.fire.dur,
        burn: state.mp.fire.dur
      };
    }
    if (used.rock) tr.rock = { damage: 1, foreshadow: 0.7 };
    if (used.mist) tr.mist = { slow: 1.6 };
    if (used.spring) tr.spring = { power: 1300 };
    if (used.electric) tr.electric = { damage: 1, stun: 0.45 };
    if (used.groove) tr.groove = { slow: 0.55, fallIn: 1 };
    var d = {};
    Object.keys(prev).forEach(function (k) { d[k] = prev[k]; });
    d.version = '1.3';
    d.theme = state.backdrop || 'swamp';
    d.cols = state.map.length;
    d.rows = ROWS;
    d.tiles = tiles;
    d.traps = tr;
    d.mine = {
      map: state.map.slice(),
      mp: {
        spike: {
          interval: state.mp.spike.interval,
          up: state.mp.spike.up,
          damage: state.mp.spike.damage
        },
        fire: { dur: state.mp.fire.dur, damage: state.mp.fire.damage }
      }
    };
    d.reflectHook = state.hook || '';
    d.hook_seen = state.hook || '';
    d.reflectExpect = state.expect || '';
    d.vs_expect = state.expect || '';
    d.best_fun = state.best_fun || '';
    d.hardest = state.hardest || '';
    d.add_one = state.add_one || '';
    d.who = state.who || '小宇';
    d.wallet = {
      coins: state.wallet.coins | 0,
      weapons: state.wallet.weapons.slice(),
      equipped: state.wallet.equipped || null
    };
    d.music = state.music || '';
    d.likes = state.likes | 0;
    d.audio = normalizeAudio(state.audio || (prev && prev.audio));
    d.levelAudio = normalizeLevelAudio(
      state.levelAudio != null ? state.levelAudio : (prev && prev.levelAudio)
    );
    d.lastScore = (state.lastScore | 0);
    d.presetId = prev.presetId || 'tonight-waves-v1';
    d.savedAt = new Date().toISOString();
    d.by = prev.by || '伍澍暘';
    d.editor = editorFromState(state);
    d.myLevelId = state.myLevelId || '';
    d.myLevelTitle = state.myLevelTitle || '';
    /* 1.3 adds cols>12 and editor.levelId. 1.2 documents still load. Never touch official progress. */
    d.version = '1.3';
    storage.setItem(KEY, JSON.stringify(d));
    return d;
  }

  /** Keep the first start and the first goal; drop duplicates. */
  function normalizeMarkers(map) {
    if (!map) return;
    var seenStart = false;
    var seenGoal = false;
    var i;
    for (i = 0; i < map.length; i++) {
      if (map[i] === 'start') {
        if (seenStart) map[i] = null;
        else seenStart = true;
      } else if (map[i] === 'goal') {
        if (seenGoal) map[i] = null;
        else seenGoal = true;
      }
    }
  }

  function editorFromMap(map) {
    return editorFromState({ map: map });
  }

  function editorFromState(state) {
    var map = (state && state.map) || [];
    var startX = null;
    var goalX = null;
    var i;
    for (i = 0; i < map.length; i++) {
      if (map[i] === 'start' && startX == null) startX = i;
      else if (map[i] === 'goal' && goalX == null) goalX = i;
    }
    var levelId = state && (state.levelId | 0);
    if (levelId < 1 || levelId > SCENE_COUNT) levelId = null;
    var monsters = [];
    if (state && Array.isArray(state.monsters)) {
      state.monsters.forEach(function (m) {
        if (!m || !m.id) return;
        monsters.push({ id: m.id, size: m.size === 'big' ? 'big' : 'small', x: m.x | 0 });
      });
    }
    return {
      startX: startX,
      goalX: goalX,
      cols: map.length,
      levelId: levelId,
      character: (state && state.character) || 'green',
      backdrop: (state && state.backdrop) || 'forest',
      bgmId: (state && state.bgmId) || 'explore',
      win: (state && state.win) || 'goal',
      weaponUnlock: !!(state && state.weaponUnlock) || (levelId | 0) >= 4,
      net: !!(state && state.net) || levelId === 5,
      sfxShared: true,
      monsters: monsters
    };
  }

  function readRoster(storage) {
    var raw = null;
    try { raw = JSON.parse(storage.getItem(MY_KEY) || 'null'); } catch (e) { raw = null; }
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.levels)) {
      return { version: 1, levels: [] };
    }
    return {
      version: 1,
      levels: raw.levels.filter(function (lv) { return lv && typeof lv === 'object'; })
    };
  }

  function findMyFirst(roster) {
    var levels = (roster && roster.levels) || [];
    var i;
    for (i = 0; i < levels.length; i++) {
      if (levels[i] && levels[i].id === MY_ID && levels[i].doc && typeof levels[i].doc === 'object') {
        return levels[i];
      }
    }
    return null;
  }

  /**
   * Snapshot the current slot into roster id my-1 ("我的第 1 关").
   * Does not write sycocos-level-progress.
   */
  function saveMyFirst(storage, state) {
    state.myLevelId = MY_ID;
    state.myLevelTitle = MY_TITLE;
    var doc = save(storage, state);
    var snap;
    try { snap = JSON.parse(JSON.stringify(doc)); } catch (e) { return { ok: false }; }
    var roster = readRoster(storage);
    var entry = {
      id: MY_ID,
      title: MY_TITLE,
      savedAt: doc.savedAt || new Date().toISOString(),
      doc: snap
    };
    var i;
    var replaced = false;
    for (i = 0; i < roster.levels.length; i++) {
      if (roster.levels[i] && roster.levels[i].id === MY_ID) {
        roster.levels[i] = entry;
        replaced = true;
        break;
      }
    }
    if (!replaced) roster.levels.unshift(entry);
    storage.setItem(MY_KEY, JSON.stringify({ version: 1, levels: roster.levels }));
    return { ok: true, id: MY_ID, title: MY_TITLE, savedAt: entry.savedAt };
  }

  /** Copy roster "我的第 1 关" back into the current slot. No-op if missing. */
  function applyMyFirst(storage) {
    var hit = findMyFirst(readRoster(storage));
    if (!hit) return { ok: false };
    var doc;
    try { doc = JSON.parse(JSON.stringify(hit.doc)); } catch (e) { return { ok: false }; }
    if (!doc || typeof doc !== 'object') return { ok: false };
    if (!doc.version) doc.version = '1.2';
    storage.setItem(KEY, JSON.stringify(doc));
    return { ok: true, id: MY_ID, title: hit.title || MY_TITLE };
  }

  function setIntervalValue(state, n) {
    n = n | 0;
    if (n < 1) n = 1;
    if (n > 5) n = 5;
    state.interval = n;
    /* §8: 单关刺频覆盖全局 — ②滑条写入本关 mp.spike.interval，试玩/freq 读此字段 */
    if (!state.mp) state.mp = defaultMp();
    if (!state.mp.spike) state.mp.spike = { interval: n, up: 1, damage: 1 };
    state.mp.spike.interval = n;
    return n;
  }

  function place(state, x) {
    var n = state && state.map ? state.map.length : MC;
    if (x < 0 || x >= n) return { ok: false, flash: '' };
    var tool = state.tool;
    if (tool === 'del') {
      state.map[x] = null;
      if (state.selX === x) { state.selX = -1; state.sel = null; }
      return { ok: true, flash: '' };
    }
    /* Singular markers replace the cell (default runway is already full). */
    if (tool === 'start' || tool === 'goal') {
      var iMark;
      for (iMark = 0; iMark < state.map.length; iMark++) {
        if (state.map[iMark] === tool) state.map[iMark] = null;
      }
      state.map[x] = tool;
      state.sel = tool;
      state.selX = x;
      return { ok: true, flash: tool === 'start' ? '起点放好了' : '终点放好了' };
    }
    var cur = state.map[x];
    var occupied = cur && (isTrap(cur) || isReward(cur) || cur === 'start' || cur === 'goal');
    if (occupied && tool && tool !== cur && tool !== 'del' && isPlaceable(tool)) {
      if (isStartHazard(tool) && x < SAFE0) {
        return { ok: false, flash: '开头要空着（像马里奥出生点）' };
      }
      if (tool === 'start' || tool === 'goal') {
        var iSwap;
        for (iSwap = 0; iSwap < state.map.length; iSwap++) {
          if (state.map[iSwap] === tool) state.map[iSwap] = null;
        }
      }
      state.map[x] = tool;
      state.sel = tool;
      state.selX = x;
      state.tool = tool;
      state.moving = false;
      return { ok: true, flash: '换成这个了' };
    }
    if (occupied) {
      state.sel = cur;
      state.selX = x;
      state.tool = cur;
      state.moving = true;
      return { ok: true, flash: '选中了。点空格搬走，或点别的零件换种类', selected: true };
    }
    if (!cur && state.moving && state.selX >= 0 && state.selX < state.map.length && state.map[state.selX]) {
      var piece = state.map[state.selX];
      if (isStartHazard(piece) && x < SAFE0) {
        return { ok: false, flash: '开头要空着（像马里奥出生点）' };
      }
      state.map[state.selX] = null;
      state.map[x] = piece;
      state.sel = piece;
      state.selX = x;
      state.tool = piece;
      state.moving = false;
      return { ok: true, flash: '搬过来了' };
    }
    if (isStartHazard(tool) && x < SAFE0) {
      return { ok: false, flash: '开头要空着（像马里奥出生点）' };
    }
    if (!isPlaceable(tool)) {
      return { ok: false, flash: '' };
    }
    state.map[x] = tool;
    state.sel = tool;
    state.selX = x;
    return { ok: true, flash: '' };
  }

  function grantCoins(state, n) {
    n = n | 0;
    if (!state.wallet) state.wallet = blankWallet();
    state.wallet.coins = Math.max(0, (state.wallet.coins | 0) + n);
    return state.wallet.coins;
  }

  function buy(state, id) {
    var spec = WEAPONS[id];
    if (!spec) return { ok: false, flash: '' };
    if (!state.wallet) state.wallet = blankWallet();
    if (state.wallet.weapons.indexOf(id) >= 0) {
      state.wallet.equipped = id;
      return { ok: true, flash: '装备了' + spec.name, equipped: true };
    }
    if ((state.wallet.coins | 0) < spec.price) return { ok: false, flash: '金币不够' };
    state.wallet.coins -= spec.price;
    state.wallet.weapons.push(id);
    state.wallet.equipped = id;
    return { ok: true, flash: '买下' + spec.name };
  }

  function setNum(state, value) {
    if (value !== 1 && value !== 3 && value !== 5) return false;
    if (state.sel === 'spike') state.mp.spike.interval = value;
    else if (state.sel === 'fire') state.mp.fire.dur = value;
    else return false;
    return true;
  }


  function mapIsEmpty(map) {
    if (!map || !map.length) return true;
    for (var i = 0; i < map.length; i++) if (map[i]) return false;
    return true;
  }

  function ensureLongRunway(state, minCols) {
    if (!state) return state;
    minCols = minCols | 0 || COLS_DEFAULT;
    if (minCols < 8) minCols = COLS_DEFAULT;
    if (minCols > COLS_MAX) minCols = COLS_MAX;
    var n = state.map ? state.map.length : 0;
    if (n >= minCols) {
      state.cols = n;
      return state;
    }
    state.map = resizeMap(state.map, minCols);
    state.cols = minCols;
    return state;
  }

  /** @deprecated use defaultMineMap; kept for visual-workbench callers. */
  function defaultRhythmMap() {
    return defaultMineMap();
  }

  /** Seed tonight-waves-v1 when there is no saved map. */
  function ensureDefaultMap(state) {
    if (!state) return state;
    /* A saved「我的第 1 关」may be sparse; do not refill it with tonight-waves. */
    if (mapIsEmpty(state.map) && !state.myLevelId) {
      state.map = defaultMineMap();
      state.cols = state.map.length;
      state.interval = 3;
      state.mp.spike.interval = 3;
      state.tool = 'spike';
      state.sel = 'spike';
      state.selX = 3;
      if (state.lastScore == null) state.lastScore = 0;
      if (!state.audio) state.audio = blankAudio();
      if (!state.levelAudio) state.levelAudio = blankLevelAudio();
      if (state.music == null) state.music = '';
      if (state.likes == null) state.likes = 0;
    }
    if (!state.levelAudio) state.levelAudio = blankLevelAudio();
    if (state.map) state.cols = state.map.length;
    ensurePracticeWallet(state);
    return state;
  }

  function cloneDoc(doc) {
    return JSON.parse(JSON.stringify(doc));
  }

  function templateDoc(n) {
    n = n | 0;
    if (n < 1 || n > SCENE_COUNT) n = 1;
    var meta = templateMeta(n);
    var st = createState();
    st.map = templateMap(n);
    st.cols = st.map.length;
    st.levelId = n;
    st.levelTitle = levelTitle(n);
    st.myLevelId = '';
    st.myLevelTitle = st.levelTitle;
    st.character = meta.character;
    st.backdrop = meta.backdrop;
    st.bgmId = meta.bgmId;
    st.monsters = meta.monsters;
    st.weaponUnlock = meta.weaponUnlock;
    st.win = meta.win;
    st.net = meta.net;
    st.audio = blankAudio();
    st.audio.bgmId = bgmById(meta.bgmId).fileId;
    var mem = {
      getItem: function () { return null; },
      setItem: function () {}
    };
    return save(mem, st);
  }

  function readLevelEdits(storage) {
    var raw = null;
    try { raw = JSON.parse(storage.getItem(EDIT_KEY) || 'null'); } catch (e) { raw = null; }
    var levels = {};
    if (raw && raw.levels && typeof raw.levels === 'object') {
      Object.keys(raw.levels).forEach(function (k) {
        var lv = raw.levels[k];
        if (lv && lv.doc && typeof lv.doc === 'object') levels[String(k | 0)] = lv;
      });
    }
    return { version: 1, levels: levels };
  }

  /**
   * Play/editor doc for formal level n.
   * Unsaved draft wins when editor.levelId matches; else the override; else the template.
   * Does not write sycocos-level-progress or the my-1 roster.
   */
  function docForLevel(storage, n) {
    n = n | 0;
    if (n < 1 || n > SCENE_COUNT) return null;
    var draft = null;
    try { draft = JSON.parse(storage.getItem(KEY) || 'null'); } catch (e) { draft = null; }
    var draftId = draft && draft.editor && (draft.editor.levelId | 0);
    if (draft && draftId === n && (Array.isArray(draft.tiles) || (draft.mine && Array.isArray(draft.mine.map)))) {
      return cloneDoc(draft);
    }
    var hit = readLevelEdits(storage).levels[String(n)];
    if (hit && hit.doc) return cloneDoc(hit.doc);
    return templateDoc(n);
  }

  function applyLevel(storage, n) {
    n = n | 0;
    if (n < 1 || n > SCENE_COUNT) return { ok: false };
    var had = !!readLevelEdits(storage).levels[String(n)];
    var draft = null;
    try { draft = JSON.parse(storage.getItem(KEY) || 'null'); } catch (e) { draft = null; }
    var draftId = draft && draft.editor && (draft.editor.levelId | 0);
    var doc = docForLevel(storage, n);
    try { storage.setItem(KEY, JSON.stringify(doc)); } catch (e2) { return { ok: false }; }
    return { ok: true, levelId: n, title: levelTitle(n), seeded: !had && draftId !== n };
  }

  function saveLevelEdit(storage, state, n) {
    n = (n == null ? (state && state.levelId) : n) | 0;
    if (n < 1 || n > SCENE_COUNT || !state) return { ok: false };
    state.levelId = n;
    state.levelTitle = levelTitle(n);
    state.myLevelId = '';
    state.myLevelTitle = state.levelTitle;
    var doc = save(storage, state);
    var snap;
    try { snap = JSON.parse(JSON.stringify(doc)); } catch (e) { return { ok: false }; }
    var edits = readLevelEdits(storage);
    edits.levels[String(n)] = {
      title: state.levelTitle,
      savedAt: doc.savedAt || new Date().toISOString(),
      doc: snap
    };
    storage.setItem(EDIT_KEY, JSON.stringify({ version: 1, levels: edits.levels }));
    return { ok: true, levelId: n, title: state.levelTitle };
  }

  function weaponShopOpen(levelId) {
    levelId = levelId | 0;
    if (levelId >= 1 && levelId < 4) return false;
    return true;
  }

  /** 5-scene arc only. Never writes sycocos-level-progress. */
  function markSceneProgress(storage, n, kind) {
    n = n | 0;
    if (n < 1 || n > SCENE_COUNT) return { ok: false };
    var raw = { version: 1, tried: {}, completed: {} };
    try {
      var prev = JSON.parse(storage.getItem(SCENE_KEY) || 'null');
      if (prev && typeof prev === 'object') raw = prev;
    } catch (e) {}
    if (!raw.tried || typeof raw.tried !== 'object') raw.tried = {};
    if (!raw.completed || typeof raw.completed !== 'object') raw.completed = {};
    raw.version = 1;
    var k = String(n);
    var now = Date.now();
    raw.tried[k] = now;
    if (kind === 'completed') raw.completed[k] = now;
    storage.setItem(SCENE_KEY, JSON.stringify(raw));
    return { ok: true };
  }

  root.WBStore = {
    KEY: KEY,
    MY_KEY: MY_KEY,
    EDIT_KEY: EDIT_KEY,
    SCENE_KEY: SCENE_KEY,
    SCENE_COUNT: SCENE_COUNT,
    BGM_POOL: BGM_POOL,
    MONSTERS: MONSTERS,
    BACKDROPS: BACKDROPS,
    MY_ID: MY_ID,
    MY_TITLE: MY_TITLE,
    ROWS: ROWS,
    MC: MC,
    COLS_LEGACY: COLS_LEGACY,
    COLS_DEFAULT: COLS_DEFAULT,
    SAFE0: SAFE0,
    createState: createState,
    load: load,
    save: save,
    place: place,
    setNum: setNum,
    setIntervalValue: setIntervalValue,
    mEst: mEst,
    checks: checks,
    fCnt: fCnt,
    fHit: fHit,
    zone: zone,
    isTrap: isTrap,
    isStartHazard: isStartHazard,
    isReward: isReward,
    isMarker: isMarker,
    isPlaceable: isPlaceable,
    coinValue: coinValue,
    COIN_VALUES: COIN_VALUES,
    WEAPONS: WEAPONS,
    grantCoins: grantCoins,
    buy: buy,
    ensureDefaultMap: ensureDefaultMap,
    defaultRhythmMap: defaultRhythmMap,
    defaultMineMap: defaultMineMap,
    defaultTraps: defaultTraps,
    buildDefaultSave: buildDefaultSave,
    blankWallet: blankWallet,
    blankLevelAudio: blankLevelAudio,
    normalizeLevelAudio: normalizeLevelAudio,
    STARTER_COINS: STARTER_COINS,
    ensurePracticeWallet: ensurePracticeWallet,
    readRoster: readRoster,
    findMyFirst: findMyFirst,
    saveMyFirst: saveMyFirst,
    applyMyFirst: applyMyFirst,
    editorFromMap: editorFromMap,
    editorFromState: editorFromState,
    ensureLongRunway: ensureLongRunway,
    templateMap: templateMap,
    templateDoc: templateDoc,
    levelTitle: levelTitle,
    readLevelEdits: readLevelEdits,
    docForLevel: docForLevel,
    applyLevel: applyLevel,
    saveLevelEdit: saveLevelEdit,
    colsOf: colsOf,
    templateMeta: templateMeta,
    bgmById: bgmById,
    monsterName: monsterName,
    backdropById: backdropById,
    cycleBackdrop: cycleBackdrop,
    cycleBgm: cycleBgm,
    cycleCharacter: cycleCharacter,
    toggleSfx: toggleSfx,
    monsterAt: monsterAt,
    cycleMonsterAt: cycleMonsterAt,
    moveMonster: moveMonster,
    weaponShopOpen: weaponShopOpen,
    markSceneProgress: markSceneProgress
  };
})(typeof window !== 'undefined' ? window : this);
