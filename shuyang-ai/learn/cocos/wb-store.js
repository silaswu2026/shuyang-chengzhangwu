/**
 * Tonight workbench save. v1.2 adds wallet (coins, weapons, equipped)
 * and still writes the v1.1 tiles / traps / mine fields.
 * Audio (bgmId + sfx toggles) lives beside wallet without breaking it.
 * Default runway: tonight-waves-v1 (safe start, four waves, all traps).
 * No Cocos calls, so a node check can load this file.
 */
(function (root) {
  var KEY = 'xygo-custom-level';
  var ROWS = 4;
  var MC = 12;
  var SAFE0 = 2;

  function blankMap() {
    var m = [];
    for (var i = 0; i < MC; i++) m.push(null);
    return m;
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

  /** Practice purse for tonight ④ shop: enough to buy gun (60) with spare. */
  var STARTER_COINS = 100;

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
        spring: true, coin: true, hurt: true, hit: true
      }
    };
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
   * 教 2–3 · 练 4–5 · 变 7–8 · 考 10–11, with coin breaths.
   */
  function defaultMineMap() {
    var m = blankMap();
    m[2] = 'coin';
    m[3] = 'spike';
    m[4] = 'fire';
    m[5] = 'spring';
    m[6] = 'coin';
    m[7] = 'mist';
    m[8] = 'rock';
    m[9] = 'coin';
    m[10] = 'spike';
    m[11] = 'fire';
    return m;
  }

  function defaultTraps() {
    return {
      spike: { interval: 3, up: 1, damage: 1 },
      fire: { damage: 1, dur: 3, burn: 3 },
      rock: { damage: 1 },
      mist: { slow: 1.6 },
      spring: { power: 820 }
    };
  }

  /** Full localStorage payload shared by workbench, custom-play, xy-go ?custom=1. */
  function buildDefaultSave(extra) {
    var map = defaultMineMap();
    var mp = defaultMp();
    var tiles = [];
    var x;
    for (x = 0; x < MC; x++) tiles.push({ x: x, y: ROWS - 1, type: 'g' });
    /* one late gap in 考区前，不打断前三波铺垫 */
    tiles = tiles.filter(function (t) { return !(t.x === 9 && t.y === ROWS - 1); });
    map.forEach(function (k, i) { if (k) tiles.push({ x: i, y: ROWS - 2, type: k }); });
    var d = {
      version: '1.2',
      theme: 'swamp',
      cols: MC,
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
      mp: defaultMp(),
      wallet: blankWallet(),
      music: '',
      likes: 0,
      audio: blankAudio(),
      lastScore: 0
    };
  }

  function isTrap(k) { return k === 'spike' || k === 'fire' || k === 'rock' || k === 'mist' || k === 'spring'; }
  function isReward(k) { return k === 'coin' || k === 'shield'; }
  function isPlaceable(k) {
    return k === 'spike' || k === 'fire' || k === 'coin' || k === 'spring' || k === 'mist' || k === 'rock';
  }

  function fCnt(I) { return Math.floor(12 / I); }
  function fHit(I) { return 5 - I; }

  function zone(x) {
    if (x <= 2) return ['教', '#4ea85c'];
    if (x <= 6) return ['练', '#e6c200'];
    if (x <= 9) return ['变', '#e2793b'];
    return ['考', '#e23b3b'];
  }

  function mEst(map, mp) {
    var sh = 0;
    return map.map(function (k, x) {
      if (k === 'shield' || k === 'spring' || k === 'mist') { if (k === 'shield') sh++; return 0; }
      if (k === 'rock') return 1;
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
    var safeStart = !traps.some(function (i) { return i < SAFE0; });
    var easy = traps.length ? traps[0] <= 3 : true;
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

  function mapFromTiles(tiles) {
    var m = blankMap();
    (tiles || []).forEach(function (t) {
      if (!t || t.y !== ROWS - 2) return;
      if (t.x < 0 || t.x >= MC || !t.type || t.type === 'g') return;
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
    if (raw.mine && Array.isArray(raw.mine.map) && raw.mine.map.length === MC) {
      s.map = raw.mine.map.map(function (k) { return k || null; });
    } else if (Array.isArray(raw.tiles)) {
      s.map = mapFromTiles(raw.tiles);
    }
    var mp = (raw.mine && raw.mine.mp) || {};
    var tr = raw.traps || {};
    if (mp.spike) copyFields(s.mp.spike, mp.spike);
    else if (tr.spike) copyFields(s.mp.spike, tr.spike);
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
    if (typeof raw.lastScore === 'number' && raw.lastScore >= 0) s.lastScore = raw.lastScore | 0;
    for (var i = 0; i < MC; i++) {
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
    var tiles = [];
    for (var x = 0; x < MC; x++) tiles.push({ x: x, y: ROWS - 1, type: 'g' });
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
    if (used.rock) tr.rock = { damage: 1 };
    if (used.mist) tr.mist = { slow: 1.6 };
    if (used.spring) tr.spring = { power: 820 };
    var d = {};
    Object.keys(prev).forEach(function (k) { d[k] = prev[k]; });
    d.version = '1.2';
    d.theme = 'swamp';
    d.cols = MC;
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
    d.lastScore = (state.lastScore | 0);
    d.presetId = prev.presetId || 'tonight-waves-v1';
    d.savedAt = new Date().toISOString();
    d.by = prev.by || '伍澍暘';
    storage.setItem(KEY, JSON.stringify(d));
    return d;
  }

  function setIntervalValue(state, n) {
    n = n | 0;
    if (n < 1) n = 1;
    if (n > 5) n = 5;
    state.interval = n;
    return n;
  }

  function place(state, x) {
    if (x < 0 || x >= MC) return { ok: false, flash: '' };
    var tool = state.tool;
    if (tool === 'del') {
      state.map[x] = null;
      if (state.selX === x) { state.selX = -1; state.sel = null; }
      return { ok: true, flash: '' };
    }
    var cur = state.map[x];
    if (isTrap(cur) || isReward(cur)) {
      state.sel = cur;
      state.selX = x;
      if (isTrap(cur)) state.tool = cur;
      return { ok: true, flash: '', selected: true };
    }
    if (isTrap(tool) && x < SAFE0) {
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
    if (!map || map.length !== MC) return true;
    for (var i = 0; i < MC; i++) if (map[i]) return false;
    return true;
  }

  /** @deprecated use defaultMineMap; kept for visual-workbench callers. */
  function defaultRhythmMap() {
    return defaultMineMap();
  }

  /** Seed tonight-waves-v1 when there is no saved map. */
  function ensureDefaultMap(state) {
    if (!state) return state;
    if (mapIsEmpty(state.map)) {
      state.map = defaultMineMap();
      state.interval = 3;
      state.mp.spike.interval = 3;
      state.tool = 'spike';
      state.sel = 'spike';
      state.selX = 3;
      if (state.lastScore == null) state.lastScore = 0;
      if (!state.audio) state.audio = blankAudio();
      if (state.music == null) state.music = '';
      if (state.likes == null) state.likes = 0;
    }
    ensurePracticeWallet(state);
    return state;
  }

  root.WBStore = {
    KEY: KEY,
    ROWS: ROWS,
    MC: MC,
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
    isPlaceable: isPlaceable,
    WEAPONS: WEAPONS,
    grantCoins: grantCoins,
    buy: buy,
    ensureDefaultMap: ensureDefaultMap,
    defaultRhythmMap: defaultRhythmMap,
    defaultMineMap: defaultMineMap,
    defaultTraps: defaultTraps,
    buildDefaultSave: buildDefaultSave,
    blankWallet: blankWallet,
    STARTER_COINS: STARTER_COINS,
    ensurePracticeWallet: ensurePracticeWallet
  };
})(typeof window !== 'undefined' ? window : this);
