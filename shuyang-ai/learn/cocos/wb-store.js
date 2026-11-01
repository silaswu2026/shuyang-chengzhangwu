/**
 * Tonight workbench save shape. Same key and v1.1 fields as level-design.html
 * persistLevel + mSave. No Cocos calls, so a node check can load this file.
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

  function createState() {
    return {
      interval: 3,
      hook: '',
      expect: '',
      best_fun: '',
      hardest: '',
      add_one: '',
      who: '小雨',
      tool: 'spike',
      sel: null,
      selX: -1,
      map: blankMap(),
      mp: defaultMp()
    };
  }

  function isTrap(k) { return k === 'spike' || k === 'fire'; }
  function isReward(k) { return k === 'coin' || k === 'shield'; }

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
      if (k === 'shield') { sh++; return 0; }
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
    for (var i = 0; i < MC; i++) {
      if (s.map[i] === 'spike' || s.map[i] === 'fire') {
        s.sel = s.map[i];
        s.selX = i;
        s.tool = s.map[i];
        break;
      }
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
    if (used.rock && prev.traps && prev.traps.rock) tr.rock = prev.traps.rock;
    if (used.mist && prev.traps && prev.traps.mist) tr.mist = prev.traps.mist;
    var d = {};
    Object.keys(prev).forEach(function (k) { d[k] = prev[k]; });
    d.version = '1.1';
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
    d.who = state.who || '小雨';
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
    if (tool !== 'spike' && tool !== 'fire' && tool !== 'coin') {
      return { ok: false, flash: '' };
    }
    state.map[x] = tool;
    state.sel = tool;
    state.selX = x;
    return { ok: true, flash: '' };
  }

  function setNum(state, value) {
    if (value !== 1 && value !== 3 && value !== 5) return false;
    if (state.sel === 'spike') state.mp.spike.interval = value;
    else if (state.sel === 'fire') state.mp.fire.dur = value;
    else return false;
    return true;
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
    isTrap: isTrap
  };
})(typeof window !== 'undefined' ? window : this);
