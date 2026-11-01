/**
 * 玩我的关 — Cocos2d-JS Lite ≈ xy-go ?custom=1 第9关·沼泽
 * Same JSON / T=40 / PAD·EXP / canopy-night / 鳄王. Engine only.
 * c21: layout/CSS chrome only (desktop denser keys, phone smaller pads); CHAR_FRAC/levels unchanged.
 * c27: short - load cocos in body (not head): mobile _initSys needs document.body or appendChild null aborts engine before Layer.
 * c26: canvas always visible (c25); renderMode 1=Canvas (lite has no rendererWebGL).
 * c38: net host/guest chip always matches visible cast (fix stale 「C 红」 on green host).
 * c37: shorten dirt bed (gy≈H*0.28, min 72) for phone landscape play space.
 * c36: do not gate runScene on tint cache; tint via data-URL; swamp canvas bed (fix c35 blank navy).
 */
(function () {
  var KEY = 'xygo-custom-level';
  var SP = '../../../xy-go/sprites/green/';
  var SC = '../../../xy-go/scenes/';
  var BG = SC + 'canopy-night.jpg';
  var RES = [
    SP + 'walk_0.png', SP + 'walk_1.png', SP + 'walk_2.png', SP + 'walk_3.png',
    SP + 'idle.png', SP + 'knock_0.png', SP + 'jump_0.png',
    BG, SC + 'dirt-tile.png', SC + 'grass-cap.png'
  ];

  /* PRODUCT §8: only green/red/blue controllable skins (tint from green sheet; no 4th hero). */
  var CAST = ['green', 'blue', 'red'];
  var CAST_LABEL = { green: 'A 绿', blue: 'B 蓝', red: 'C 红' };
  var SPRITE_TINT = { blue: '#2a6bff', red: '#ff2a2a' };
  var FRAME_NAMES = ['idle', 'walk_0', 'walk_1', 'walk_2', 'walk_3', 'jump_0', 'knock_0'];
  var TINT_CACHE = { green: {}, blue: {}, red: {} };
  var tintReady = false;
  var localPalette = 'green';

  function readSkinParam() {
    try {
      var m = /(?:\?|&)skin=(green|red|blue)/.exec(location.search || '');
      if (m && CAST.indexOf(m[1]) >= 0) return m[1];
    } catch (e0) {}
    try {
      var s = localStorage.getItem('sycocos-skin');
      if (s && CAST.indexOf(s) >= 0) return s;
    } catch (e1) {}
    return 'green';
  }
  function writeSkin(p) {
    if (CAST.indexOf(p) < 0) return;
    localPalette = p;
    try { localStorage.setItem('sycocos-skin', p); } catch (e2) {}
    syncCastUI();
  }
  function netLockedPalette() {
    if (typeof netRole !== 'undefined' && netRole === 'guest') return 'blue';
    if (typeof netRole !== 'undefined' && netRole === 'host') return 'green';
    return localPalette;
  }
  function p2Palette() { return 'blue'; }
  /* c36: tint as data-URL strings (not live Texture2D) + NEVER block runScene on tint. */
  function buildTintTex(img, tintHex) {
    var c = document.createElement('canvas');
    var w = img.naturalWidth || img.width || 1;
    var h = img.naturalHeight || img.height || 1;
    c.width = w; c.height = h;
    var o = c.getContext('2d');
    o.globalCompositeOperation = 'source-over';
    o.drawImage(img, 0, 0, w, h);
    o.globalCompositeOperation = 'color';
    o.fillStyle = tintHex;
    o.fillRect(0, 0, w, h);
    o.globalCompositeOperation = 'destination-in';
    o.drawImage(img, 0, 0, w, h);
    o.globalCompositeOperation = 'source-over';
    return c.toDataURL('image/png');
  }
  function ensureTintCache(done) {
    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      tintReady = true;
      if (done) done();
    }
    var left = FRAME_NAMES.length;
    if (left <= 0) { finish(); return; }
    /* Hard cap: never leave the stage waiting on red/blue recolor. */
    setTimeout(finish, 1800);
    FRAME_NAMES.forEach(function (name) {
      var src = SP + name + '.png';
      TINT_CACHE.green[name] = src;
      var im = new Image();
      im.onload = function () {
        try {
          TINT_CACHE.blue[name] = buildTintTex(im, SPRITE_TINT.blue);
          TINT_CACHE.red[name] = buildTintTex(im, SPRITE_TINT.red);
        } catch (eT) {
          TINT_CACHE.blue[name] = src;
          TINT_CACHE.red[name] = src;
        }
        left--;
        if (left <= 0) finish();
      };
      im.onerror = function () {
        TINT_CACHE.blue[name] = src;
        TINT_CACHE.red[name] = src;
        left--;
        if (left <= 0) finish();
      };
      im.src = src;
    });
  }
  function texFor(palette, name) {
    var p = (CAST.indexOf(palette) >= 0) ? palette : 'green';
    var fallback = SP + name + '.png';
    if (p === 'green') return fallback;
    if (!tintReady) return fallback;
    var t = TINT_CACHE[p] && TINT_CACHE[p][name];
    /* Only accept string paths / data-URLs — never hand raw Texture2D to setTexture. */
    return (typeof t === 'string' && t) ? t : fallback;
  }
  function applyNinjaFrame(sp, palette, name) {
    if (!sp) return;
    var tex = texFor(palette, name);
    try { sp.setTexture(tex); } catch (eF) {
      try { sp.setTexture(SP + name + '.png'); } catch (eF2) {}
    }
  }
  function syncCastUI() {
    var row = document.getElementById('castPick');
    if (!row) return;
    var locked = !!(typeof netRole !== 'undefined' && netRole);
    var cur = netLockedPalette();
    row.querySelectorAll('[data-skin]').forEach(function (btn) {
      var sk = btn.getAttribute('data-skin');
      btn.classList.toggle('on', sk === cur);
      btn.disabled = locked && sk !== cur;
      btn.setAttribute('aria-pressed', sk === cur ? 'true' : 'false');
    });
  }
  /** Keep sprite + HUD chip + cast row on the same palette (host=绿 / guest=蓝 / solo=local). */
  function applyRoleVisuals() {
    var pal = netLockedPalette();
    if (sceneRef) {
      sceneRef.palette = pal;
      if (sceneRef.ninja) applyNinjaFrame(sceneRef.ninja, pal, sceneRef.grounded === false ? 'jump_0' : 'idle');
      updHUD(sceneRef.hp, sceneRef.coins);
    }
    syncCastUI();
  }
  function bindCastUI() {
    var row = document.getElementById('castPick');
    if (!row || row._bound) return;
    row._bound = true;
    row.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || !t.getAttribute) return;
      var sk = t.getAttribute('data-skin');
      if (!sk || CAST.indexOf(sk) < 0) return;
      if (typeof netRole !== 'undefined' && netRole) return;
      writeSkin(sk);
      if (sceneRef) {
        sceneRef.palette = localPalette;
        applyNinjaFrame(sceneRef.ninja, sceneRef.palette, 'idle');
        updHUD(sceneRef.hp, sceneRef.coins);
      }
    });
    syncCastUI();
  }
  var T = 40;
  var CHAR_FRAC = 0.22; /* wb6: bigger ninja (~22% viewport) */
  var DRAW_H = 78; /* recomputed each fit/build from H * CHAR_FRAC */
  var idleTexH = 256; /* real idle.png height once loaded — NEVER fall back to 100 */
  var EXP = 6;
  var PAD = 6;
  var MAX_HP = 6;
  var AUDIO = window.WBAudio || null;
  var audioCfg = null;
  function loadAudioCfg() {
    audioCfg = { bgmId: 'explore', sfx: {} };
    if (AUDIO) audioCfg = AUDIO.blankAudio();
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (raw && raw.audio) {
        if (AUDIO) audioCfg = AUDIO.normalize(raw.audio);
        else audioCfg = raw.audio;
      }
    } catch (e) {}
    if (AUDIO) AUDIO.apply(audioCfg);
    return audioCfg;
  }
  function playSfx(id) {
    if (!AUDIO) return;
    AUDIO.playSfx(id, false);
  }
  function startBgm(mood) {
    if (!AUDIO) return;
    var id = mood || (audioCfg && audioCfg.bgmId) || 'explore';
    AUDIO.playBgm(id, true);
  }
  function stopBgm() {
    if (AUDIO && AUDIO.stopBgm) AUDIO.stopBgm();
  }
  /* Unified for H+V: ~13 tiles tall → character ≈ 15% screen (xy-go desktop feel). */
  var TILES_VIS = 13;
  var W = 520, H = TILES_VIS * T;

  var sceneRef = null, spikeTex = null, fireTex = null, coinTex = null, flagTex = null;
  var starTex = null, shurikenTex = null, crocTex = null;
  var slimeTex = null, springTex = null, mistTex = null, rockTex = null;
  var dartTex = null, gunTex = null, bladeTex = null;
  var forestImg = null;
  var level = null, lastFitKey = '', rebuilding = false;
  var inp = { left: false, right: false, jump: false, jumpPressed: false, throwPressed: false };

  function $(id) { return document.getElementById(id); }
  function bootErr(m) { var b = $('boot'); if (!b) return; b.textContent = m; b.className = 'err'; }
  function mkColor(w, h, r, g, b, a) { return new cc.LayerColor(cc.color(r, g, b, a == null ? 255 : a), w, h); }
  function texFromCanvas(cv) { var tex = new cc.Texture2D(); tex.initWithElement(cv); tex.handleLoadedTexture(); return tex; }

  function updateOrientTip() {
    var tip = $('orientTip');
    if (!tip) return;
    tip.classList.toggle('on', window.innerHeight > window.innerWidth);
  }
  function isPortrait() {
    return window.innerHeight > window.innerWidth;
  }
  /** Portrait: keep player leftish so fire×2+flag+whole-croc fit first glance. */
  function camBias() {
    return isPortrait() ? 0.12 : 0.4;
  }
  /** Croc scale; portrait caps width so the whole body fits the first glance. */
  function crocDrawScale() {
    var s = Math.max(1.85, DRAW_H * 1.5 / 64);
    if (isPortrait() && W < 420) {
      s = Math.min(s, (W * 0.30) / 48);
      s = Math.max(1.35, s);
    }
    return s;
  }

  /** Full-bleed like xy-go: shell = viewport; EXACT_FIT kills bottom letterbox black bar. */
  function fitStage() {
    updateOrientTip();
    var wrap = $('cvwrap');
    var shell = $('shell');
    if (!wrap || !shell) return;
    /* shell is position:fixed inset 0 — use window size (not shrunk by top bar) */
    var aw = Math.max(2, window.innerWidth || shell.clientWidth);
    var ah = Math.max(2, window.innerHeight || shell.clientHeight);
    var zoom = ah / (TILES_VIS * T);
    zoom = Math.max(0.85, Math.min(zoom, 2.0));
    var nextW = Math.max(240, Math.round(aw / zoom));
    var nextH = Math.max(240, Math.round(ah / zoom));
    /* keep design AR identical to frame AR to avoid even 1px letterbox */
    nextH = Math.max(240, Math.round(nextW * ah / aw));
    wrap.style.width = '100%';
    wrap.style.height = '100%';
    var cv = $('gameCanvas');
    if (cv) {
      cv.style.width = '100%';
      cv.style.height = '100%';
      cv.width = nextW;
      cv.height = nextH;
    }
    var fitKey = nextW + 'x' + nextH + '@' + zoom.toFixed(2);
    var changed = nextW !== W || nextH !== H;
    W = nextW;
    H = nextH;
    DRAW_H = Math.max(48, Math.round(H * CHAR_FRAC));
    try {
      var dbg = $('msg');
      if (dbg) dbg.setAttribute('data-fit', fitKey + ' shell=' + aw + 'x' + ah + ' char%=' + ((DRAW_H / H) * 100).toFixed(1));
    } catch (e0) {}
    if (typeof cc === 'undefined' || !cc.view) { lastFitKey = fitKey; return; }
    try {
      if (cc.view.setFrameSize) cc.view.setFrameSize(aw, ah);
      /* EXACT_FIT: stretch to fill — no black SHOW_ALL bars on widescreen */
      cc.view.setDesignResolutionSize(W, H, cc.ResolutionPolicy.EXACT_FIT);
      if (cc.director && cc.director.setClearColor) {
        /* swamp-dirt clear — pad matches first-frame bed; no navy empty flash on portrait */
        cc.director.setClearColor(cc.color(90, 58, 36, 255));
      }
      if (cc.view._resizeEvent) cc.view._resizeEvent();
    } catch (e) {}
    lastFitKey = fitKey;
    if (changed && sceneRef && !rebuilding && window.__playSceneCtor) {
      rebuilding = true;
      setTimeout(function () {
        try { cc.director.runScene(new window.__playSceneCtor()); } catch (e2) {}
        rebuilding = false;
      }, 0);
    }
  }

  /**
   * Shared default with WBStore.buildDefaultSave (tonight-waves-v1).
   * Safe 0–1 · 教 coin+spike · 练 fire+spring · 变 mist+rock · 考 denser spike+fire.
   * Monsters/boss are placed after the design runway in loadLevel — not in early view.
   */
  function swampPreset(DC, DR) {
    DC = DC || 12;
    DR = DR || 4;
    if (typeof WBStore !== 'undefined' && WBStore.buildDefaultSave) {
      var packed = WBStore.buildDefaultSave({});
      /* Allow alternate cols/rows only by scaling map positions when DC==12 */
      if ((packed.cols | 0) === DC && (packed.rows | 0) === DR) return packed;
    }
    var tiles = [];
    var x;
    for (x = 0; x < DC; x++) tiles.push({ x: x, y: DR - 1, type: 'g' });
    /* late gap before exam wave */
    var gapX = Math.min(DC - 1, Math.max(6, Math.floor(DC * 0.75)));
    tiles = tiles.filter(function (t) { return !(t.x === gapX && t.y === DR - 1); });
    function put(xi, type) {
      var x0 = Math.min(DC - 1, Math.max(0, xi));
      tiles.push({ x: x0, y: DR - 2, type: type });
    }
    /* Scale the 12-col wave layout across DC */
    var sx = DC / 12;
    put(Math.round(2 * sx), 'coin');
    put(Math.round(3 * sx), 'spike');
    put(Math.round(4 * sx), 'fire');
    put(Math.round(5 * sx), 'spring');
    put(Math.round(6 * sx), 'coin');
    put(Math.round(7 * sx), 'mist');
    put(Math.round(8 * sx), 'rock');
    put(Math.round(9 * sx), 'coin');
    put(Math.round(10 * sx), 'spike');
    put(Math.round(11 * sx), 'fire');
    return {
      version: '1.2', theme: 'swamp', cols: DC, rows: DR, tiles: tiles,
      traps: {
        spike: { interval: 3, up: 1, damage: 1 },
        fire: { damage: 1, dur: 3, burn: 3 },
        rock: { damage: 1 },
        mist: { slow: 1.6 },
        spring: { power: 820 }
      },
      mine: null,
      wallet: { coins: 0, weapons: [], equipped: null },
      lastScore: 0,
      by: '',
      presetId: 'tonight-waves-v1'
    };
  }

  /** Mirror xy-go buildCustomDef X mapping. Boss/critters after design runway. */
  function loadLevel() {
    var d;
    try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { d = null; }
    if (!d || typeof d !== 'object') d = swampPreset(12, 4);
    var tiles = Array.isArray(d.tiles) ? d.tiles.slice() : [];
    var traps = d.traps || {};
    var DC = Math.max(4, Math.min(40, d.cols | 0 || 12));
    var DR = Math.max(2, Math.min(8, d.rows | 0 || 4));
    if (!tiles.length && d.mine && Array.isArray(d.mine.map)) {
      for (var xi = 0; xi < DC; xi++) tiles.push({ x: xi, y: DR - 1, type: 'g' });
      d.mine.map.forEach(function (k, xi) {
        if (k) tiles.push({ x: xi, y: DR - 2, type: k });
      });
      if (d.mine.mp) {
        Object.keys(d.mine.mp).forEach(function (k) { traps[k] = traps[k] || d.mine.mp[k]; });
      }
    }
    if (!tiles.length) {
      var pre = swampPreset(DC, DR);
      tiles = pre.tiles;
      traps = pre.traps || traps;
      d.theme = 'swamp';
      d.version = pre.version || d.version;
      if (pre.wallet && !d.wallet) d.wallet = pre.wallet;
    }
    var cols = PAD + DC * EXP + PAD + 24;
    var gx = function (x) { return PAD + (x | 0) * EXP + 2; };
    var groundCols = [];
    var x;
    for (x = 0; x < DC; x++) {
      var hasG = tiles.some(function (tt) {
        return tt && tt.x === x && tt.y === DR - 1 && (tt.type === 'g' || tt.type === 'p');
      });
      groundCols.push(hasG);
    }
    var items = [];
    tiles.forEach(function (tt) {
      if (!tt || tt.type === 'g' || tt.type === 'p') return;
      if ((tt.y | 0) >= DR - 1) return;
      items.push({ type: tt.type, c: gx(tt.x | 0), designX: tt.x | 0 });
    });
    /* 断坑：若完全没有，在变/考交界补一个，不挡安全出生与前两波 */
    var holeN = groundCols.filter(function (g) { return !g; }).length;
    if (holeN === 0 && DC >= 8) {
      groundCols[Math.min(DC - 1, Math.max(6, Math.floor(DC * 0.75)))] = false;
    }
    if (!traps.fire) traps.fire = { damage: 1, dur: 3, burn: 3 };
    if (!traps.spike) traps.spike = { interval: 3, up: 1, damage: 1 };
    if (!traps.rock) traps.rock = { damage: 1 };
    if (!traps.mist) traps.mist = { slow: 1.6 };
    if (!traps.spring) traps.spring = { power: 820 };

    /*
     * Waves first, monsters last: boss sits after the expanded design columns.
     * Mid flag marks the approach to the boss arena (not an early showcase pin).
     */
    var designEnd = gx(DC - 1) + EXP;
    var bossC = Math.min(cols - 8, designEnd + 10);
    var goalC = Math.min(cols - 5, bossC + 12);
    var flagC = Math.max(designEnd + 2, bossC - 6);
    var hasFlag = items.some(function (it) { return it.type === 'flag'; });
    if (!hasFlag) items.push({ type: 'flag', c: flagC, designX: -1 });

    return {
      version: d.version || '1.2',
      theme: d.theme || 'swamp',
      DC: DC, DR: DR, cols: cols, groundCols: groundCols,
      items: items, traps: traps,
      by: d.by || '',
      hook_seen: d.hook_seen || d.reflectHook || '',
      vs_expect: d.vs_expect || d.reflectExpect || '',
      spawnC: 2,
      goalC: goalC,
      bossC: bossC,
      wallet: readWallet(d.wallet),
      lastScore: (typeof d.lastScore === 'number' && d.lastScore >= 0) ? (d.lastScore | 0) : 0,
      presetId: d.presetId || ''
    };
  }

  function buildSpikeTex() {
    var c = document.createElement('canvas'); c.width = 48; c.height = 28;
    var g = c.getContext('2d');
    for (var k = 0; k < 3; k++) {
      var sx = 2 + k * 15;
      g.fillStyle = '#e2e8f0'; g.beginPath(); g.moveTo(sx, 28); g.lineTo(sx + 7, 2); g.lineTo(sx + 14, 28); g.closePath(); g.fill();
      g.strokeStyle = '#64748b'; g.stroke();
    }
    return texFromCanvas(c);
  }
  function buildFireTex() {
    var c = document.createElement('canvas'); c.width = 28; c.height = 36;
    var g = c.getContext('2d');
    g.fillStyle = '#ff6b2d'; g.beginPath(); g.moveTo(14, 2); g.quadraticCurveTo(26, 18, 14, 34); g.quadraticCurveTo(2, 18, 14, 2); g.fill();
    g.fillStyle = '#ffe14a'; g.beginPath(); g.moveTo(14, 12); g.quadraticCurveTo(21, 22, 14, 32); g.quadraticCurveTo(7, 22, 14, 12); g.fill();
    return texFromCanvas(c);
  }
  function buildCoinTex() {
    var c = document.createElement('canvas'); c.width = 22; c.height = 22;
    var g = c.getContext('2d');
    g.fillStyle = '#f0c45a'; g.beginPath(); g.arc(11, 11, 10, 0, 7); g.fill();
    g.fillStyle = '#ffe7a0'; g.beginPath(); g.arc(11, 11, 5, 0, 7); g.fill();
    return texFromCanvas(c);
  }
  function buildStarTex() {
    var c = document.createElement('canvas'); c.width = 24; c.height = 24;
    var g = c.getContext('2d');
    g.fillStyle = '#ffe14a'; g.beginPath();
    for (var i = 0; i < 5; i++) {
      var a = -Math.PI / 2 + i * Math.PI * 2 / 5;
      var b = a + Math.PI / 5;
      g.lineTo(12 + Math.cos(a) * 11, 12 + Math.sin(a) * 11);
      g.lineTo(12 + Math.cos(b) * 5, 12 + Math.sin(b) * 5);
    }
    g.closePath(); g.fill();
    return texFromCanvas(c);
  }
  function buildFlagTex() {
    var c = document.createElement('canvas'); c.width = 28; c.height = 48;
    var g = c.getContext('2d');
    g.fillStyle = '#94a3b8'; g.fillRect(4, 2, 3, 44);
    g.fillStyle = '#4ea85c'; g.beginPath(); g.moveTo(7, 4); g.lineTo(26, 12); g.lineTo(7, 22); g.closePath(); g.fill();
    return texFromCanvas(c);
  }
  function buildShurikenTex() {
    var c = document.createElement('canvas'); c.width = 16; c.height = 16;
    var g = c.getContext('2d');
    g.fillStyle = '#cfd8e6';
    g.beginPath(); g.moveTo(8, 0); g.lineTo(10, 6); g.lineTo(16, 8); g.lineTo(10, 10); g.lineTo(8, 16); g.lineTo(6, 10); g.lineTo(0, 8); g.lineTo(6, 6); g.closePath(); g.fill();
    g.fillStyle = '#3b4590'; g.beginPath(); g.arc(8, 8, 2, 0, 7); g.fill();
    return texFromCanvas(c);
  }
  function buildCrocTex() {
    var c = document.createElement('canvas'); c.width = 96; c.height = 64;
    var g = c.getContext('2d');
    g.fillStyle = '#3f9a5c';
    g.beginPath(); g.ellipse(48, 40, 40, 18, 0, 0, 7); g.fill();
    g.fillStyle = '#2f7a46';
    g.beginPath(); g.ellipse(78, 36, 18, 10, 0, 0, 7); g.fill();
    g.fillStyle = '#bfe6a0';
    g.beginPath(); g.ellipse(40, 42, 16, 8, 0, 0, 7); g.fill();
    g.fillStyle = '#fff';
    for (var k = 0; k < 4; k++) {
      g.beginPath(); g.moveTo(68 + k * 5, 40); g.lineTo(70 + k * 5, 46); g.lineTo(72 + k * 5, 40); g.fill();
    }
    g.fillStyle = '#2f7a46';
    for (k = 0; k < 4; k++) { g.beginPath(); g.arc(28 + k * 12, 28, 3.2, 0, 7); g.fill(); }
    g.fillStyle = '#17301c';
    g.beginPath(); g.arc(82, 32, 3, 0, 7); g.fill();
    g.fillStyle = '#ffd34a';
    g.beginPath();
    g.moveTo(40, 8); g.lineTo(40, 2); g.lineTo(44, 6); g.lineTo(48, 0); g.lineTo(52, 6); g.lineTo(56, 2); g.lineTo(56, 8); g.fill();
    return texFromCanvas(c);
  }
  function buildShotTex(hex, w, h) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d');
    g.fillStyle = hex;
    g.beginPath();
    g.ellipse(w / 2, h / 2, w / 2 - 1, h / 2 - 1, 0, 0, 7);
    g.fill();
    return texFromCanvas(c);
  }
  function buildSlimeTex() {
    var c = document.createElement('canvas'); c.width = 48; c.height = 36;
    var g = c.getContext('2d');
    g.fillStyle = '#67d36a';
    g.beginPath(); g.ellipse(24, 22, 18, 12, 0, 0, 7); g.fill();
    g.fillStyle = '#fff';
    g.beginPath(); g.arc(18, 18, 3, 0, 7); g.arc(30, 18, 3, 0, 7); g.fill();
    g.fillStyle = '#17301c';
    g.beginPath(); g.arc(19, 18, 1.4, 0, 7); g.arc(31, 18, 1.4, 0, 7); g.fill();
    return texFromCanvas(c);
  }
  function buildPropTex(kind) {
    var c = document.createElement('canvas'); c.width = 48; c.height = 48;
    var g = c.getContext('2d');
    if (kind === 'spring') {
      g.strokeStyle = '#d5dde6'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(24, 44);
      for (var i = 1; i <= 7; i++) g.lineTo(24 + (i % 2 ? -8 : 8), 44 - i * 4);
      g.stroke();
      g.fillStyle = '#e23b3b'; g.fillRect(10, 8, 28, 8);
    } else if (kind === 'mist') {
      g.fillStyle = 'rgba(150,80,190,0.55)';
      g.beginPath(); g.ellipse(24, 28, 18, 12, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(220,180,255,0.7)';
      g.beginPath(); g.ellipse(16, 24, 7, 6, 0, 0, 7); g.ellipse(30, 30, 8, 6, 0, 0, 7); g.fill();
    } else {
      g.fillStyle = '#6d6358';
      g.beginPath(); g.moveTo(8, 40); g.lineTo(14, 18); g.lineTo(24, 10); g.lineTo(38, 20); g.lineTo(42, 40); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,220,160,0.4)';
      g.beginPath(); g.moveTo(16, 28); g.lineTo(24, 14); g.lineTo(28, 26); g.closePath(); g.fill();
    }
    return texFromCanvas(c);
  }
  var WEAPON_NAMES = { dart: '飞镖', blade: '砍刀', gun: '枪' };
  function readWallet(raw) {
    var w = { coins: 0, weapons: [], equipped: null };
    if (!raw || typeof raw !== 'object') return w;
    if (typeof raw.coins === 'number' && raw.coins >= 0) w.coins = raw.coins | 0;
    if (Array.isArray(raw.weapons)) {
      raw.weapons.forEach(function (id) {
        if (WEAPON_NAMES[id] && w.weapons.indexOf(id) < 0) w.weapons.push(id);
      });
    }
    if (raw.equipped && WEAPON_NAMES[raw.equipped] && w.weapons.indexOf(raw.equipped) >= 0) w.equipped = raw.equipped;
    return w;
  }
  function writeWallet(w) {
    try {
      var d = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
      if (!d || typeof d !== 'object') d = {};
      d.version = '1.2';
      d.wallet = { coins: w.coins | 0, weapons: (w.weapons || []).slice(), equipped: w.equipped || null };
      localStorage.setItem(KEY, JSON.stringify(d));
    } catch (eW) {}
  }
  function writeLastScore(score) {
    try {
      var d = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
      if (!d || typeof d !== 'object') d = {};
      d.version = '1.2';
      d.lastScore = score | 0;
      localStorage.setItem(KEY, JSON.stringify(d));
    } catch (eS) {}
  }
  /** Run score is separate from wallet coins. */
  var SCORE = { coin: 10, slime: 50, boss: 200, hp: 100, clear: 150 };

  function updHUD(hp, coins) {
    var left = Math.max(0, hp);
    var hpEl = $('hp');
    if (hpEl) {
      var pct = Math.round((left / MAX_HP) * 100);
      /* Chip must follow role lock, not a stale solo pick (e.g. red) after becoming host. */
      var pal = netLockedPalette();
      if (sceneRef && sceneRef.palette !== pal) sceneRef.palette = pal;
      var chip = CAST_LABEL[pal] || 'A 绿';
      var extra = (sceneRef && sceneRef.p2) ? ' · B 蓝' : '';
      hpEl.innerHTML = '<span class="hpchip">' + chip + extra + '</span><span class="hpbar"><i style="width:' + pct + '%"></i></span>';
    }
    var c = $('coins');
    if (c) c.textContent = '🪙 ' + coins;
    var sc = $('score');
    if (sc && sceneRef) sc.textContent = '积分 ' + (sceneRef.score | 0);
    var we = $('weapon');
    if (we && sceneRef) {
      var id = sceneRef.weapon;
      we.textContent = '武器 ' + (WEAPON_NAMES[id] || '无');
    }
    var bossBar = $('bossBar');
    if (bossBar && sceneRef && sceneRef.boss) {
      var b = sceneRef.boss;
      /* 血条仅在鳄精灵进入镜头时亮 —— 避免「只见血条不见鳄」 */
      var onScreen = false;
      if (b.alive && typeof sceneRef.camX === 'number') {
        var bx = b.x;
        onScreen = bx > sceneRef.camX - 40 && bx < sceneRef.camX + W + 40;
      }
      if (b.alive && onScreen) {
        bossBar.classList.add('on');
        bossBar.querySelector('.bn').textContent = b.name;
        bossBar.querySelector('i').style.width = Math.round((b.hp / b.max) * 100) + '%';
      } else bossBar.classList.remove('on');
    }
  }
  function hideResult() { var r = $('result'); if (r) r.classList.remove('show', 'win', 'fail'); }
  function showResult(win, hp, coins) {
    var r = $('result'); if (!r) return;
    r.classList.add('show');
    $('resultBig').textContent = win ? '🎉 过关！' : '😵 再试一次';
    $('resultBig').style.color = win ? '#9ff0a8' : '#ffb4b4';
    var sc = (sceneRef && (sceneRef.score | 0)) || 0;
    var hint = (level && level.vs_expect) ? ('你预计：' + level.vs_expect) : '回上一页答：和预计一样吗？';
    $('resultSub').innerHTML = '<span class="sub-hp">剩 <b>' + hp + '❤</b> · 金币 <b style="color:#ffe7a0">' + coins + '</b> · 积分 <b style="color:#9ff0a8">' + sc + '</b></span>' +
      '<span class="sub-hint">' + hint + '</span>';
    writeLastScore(sc);
  }

  function bindControls() {
    function hold(btn, key, isJump, isThrow) {
      if (!btn) return;
      var down = function (e) {
        e.preventDefault();
        btn.classList.add('on');
        if (isJump) { if (!inp.jump) inp.jumpPressed = true; inp.jump = true; }
        else if (isThrow) { inp.throwPressed = true; }
        else inp[key] = true;
      };
      var up = function (e) {
        e.preventDefault();
        btn.classList.remove('on');
        if (isJump) inp.jump = false;
        else if (!isThrow) inp[key] = false;
      };
      btn.addEventListener('touchstart', down, { passive: false });
      btn.addEventListener('touchend', up, { passive: false });
      btn.addEventListener('touchcancel', up, { passive: false });
      btn.addEventListener('mousedown', down);
      btn.addEventListener('mouseup', up);
      btn.addEventListener('mouseleave', up);
    }
    hold($('btnL'), 'left', false, false);
    hold($('btnR'), 'right', false, false);
    hold($('btnJ'), 'jump', true, false);
    hold($('btnT'), 'throw', false, true);
    window.addEventListener('keydown', function (e) {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') inp.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') inp.right = true;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyK') {
        if (!inp.jump) inp.jumpPressed = true;
        inp.jump = true;
        e.preventDefault();
      }
      if (e.code === 'KeyF' || e.code === 'KeyJ') { inp.throwPressed = true; e.preventDefault(); }
    });
    window.addEventListener('keyup', function (e) {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') inp.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') inp.right = false;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyK') inp.jump = false;
    });
  }

  if (typeof cc === 'undefined' || !cc.Layer || typeof cc.Layer.extend !== 'function') {
    bootErr('Cocos 引擎未就绪（Layer）');
    return;
  }
  var PlayLayer = cc.Layer.extend({
    ctor: function () {
      this._super();
      this.world = new cc.Node();
      this.addChild(this.world, 0);
      this.camX = 0;
      this.playing = false;
      this.won = false;
      this.dead = false;
      this.hp = MAX_HP;
      this.coins = 0;
      this.invuln = 0;
      this.frame = 0;
      this.frameT = 0;
      this.t0 = Date.now() / 1000;
      this.throws = [];
      this.fireflies = [];
      this._build();
      this.reset();
      this.scheduleUpdate();
      /* c27/c25: canvas CSS opacity:1 from boot - do NOT hide stagePad (safety bed under canvas) */
      try {
        var cvShow = $('gameCanvas');
        if (cvShow) cvShow.style.opacity = '1';
      } catch (eShow) {}
      return true;
    },
    _addNightBg: function () {
      var fallback = mkColor(W + 4, H + 4, 90, 58, 36);
      fallback.setPosition(-2, -2);
      this.addChild(fallback, -6);
      this.bgNode = null;
      this.bgNode2 = null;
      if (forestImg && forestImg.naturalWidth) {
        try {
          /* c21/c20: Texture from already-decoded Image — no async path flash */
          var tex = new cc.Texture2D();
          tex.initWithElement(forestImg);
          tex.handleLoadedTexture();
          var sp = new cc.Sprite(tex);
          sp.setAnchorPoint(0, 0);
          this.addChild(sp, -5);
          this.bgNode = sp;
          this._layoutBg(0);
        } catch (e) {
          try {
            var sp2 = new cc.Sprite(BG);
            sp2.setAnchorPoint(0, 0);
            this.addChild(sp2, -5);
            this.bgNode = sp2;
            this._layoutBg(0);
          } catch (e2) {}
        }
      }
      /* soft vignette */
      var vig = mkColor(W, H, 8, 16, 28, 40);
      vig.setPosition(0, 0);
      this.addChild(vig, -3);
      /* fireflies (screen space) */
      this.ffLayer = new cc.Node();
      this.addChild(this.ffLayer, -2);
      var i;
      for (i = 0; i < 14; i++) {
        var dot = mkColor(4, 4, 234, 255, 154, 200);
        dot.setPosition(Math.random() * W, Math.random() * H * 0.7);
        this.ffLayer.addChild(dot);
        this.fireflies.push({ n: dot, phase: Math.random() * 6, spd: 0.6 + Math.random() });
      }
    },
    _layoutBg: function (camX) {
      if (!this.bgNode || !forestImg) return;
      var iw = forestImg.naturalWidth || 1600;
      var ih = forestImg.naturalHeight || 900;
      var scale = Math.max(W / iw, H / ih) * 1.08;
      var dw = iw * scale, dh = ih * scale;
      this.bgNode.setScale(scale);
      var parallax = (camX || 0) * 0.12;
      var ox = -((parallax % dw) + dw) % dw;
      var oy = H - dh + 8;
      this.bgNode.setPosition(ox, oy);
      if (!this.bgNode2) {
        try {
          var spB;
          if (forestImg && forestImg.naturalWidth) {
            var texB = new cc.Texture2D();
            texB.initWithElement(forestImg);
            texB.handleLoadedTexture();
            spB = new cc.Sprite(texB);
          } else {
            spB = new cc.Sprite(BG);
          }
          spB.setAnchorPoint(0, 0);
          spB.setScale(scale);
          this.addChild(spB, -5);
          this.bgNode2 = spB;
        } catch (e2) { this.bgNode2 = null; }
      }
      if (this.bgNode2) {
        this.bgNode2.setScale(scale);
        this.bgNode2.setPosition(ox + dw - 1, oy);
        this.bgNode2.setVisible(ox + dw < W + 2);
      }
    },
    _solidAt: function (c) {
      if (c < 0 || c >= level.cols) return true;
      if (c < PAD || c >= PAD + level.DC * EXP) return true;
      var dx = Math.floor((c - PAD) / EXP);
      if (level.groundCols[dx]) return true;
      /* 断坑仅挖 EXP 块正中 3 格（120px）——可一跳过去，像老版 */
      var local = (c - PAD) - dx * EXP;
      return !(local >= 2 && local <= 4);
    },
    _buildGround: function () {
      var cols = level.cols;
      var gy = this.gy;
      var c, x0, row, nRows;
      /* 泥土铺满画布底→草皮：多行 dirt，颜色像老版土层（忌近黑） */
      nRows = Math.max(3, Math.ceil(gy / T) + 1);
      var bed = mkColor(this.worldW + 120, gy + T * 2, 90, 58, 36);
      bed.setPosition(-60, 0);
      this.world.addChild(bed, 0);
      for (c = 0; c < cols; c++) {
        x0 = c * T;
        if (!this._solidAt(c)) {
          /* 断坑：深绿沼泽水填到坑底，两侧可见土层剖面 */
          var pit = mkColor(T + 1, gy, 28, 110, 96, 230);
          pit.setPosition(x0, 0);
          this.world.addChild(pit, 1);
          var gloss = mkColor(T + 1, 10, 60, 180, 150, 120);
          gloss.setPosition(x0, gy - 14);
          this.world.addChild(gloss, 2);
          continue;
        }
        for (row = 0; row < nRows; row++) {
          try {
            var dirt = new cc.Sprite(SC + 'dirt-tile.png');
            dirt.setAnchorPoint(0, 1);
            dirt.setPosition(x0, gy - row * T);
            dirt.setScale(T / 40);
            this.world.addChild(dirt, 2);
          } catch (eD) {
            var blk = mkColor(T + 1, T + 1, 107, 79, 47);
            blk.setPosition(x0, gy - (row + 1) * T);
            this.world.addChild(blk, 2);
          }
        }
        try {
          var cap = new cc.Sprite(SC + 'grass-cap.png');
          cap.setAnchorPoint(0, 0);
          cap.setPosition(x0, gy - 2);
          cap.setScaleX((T + 0.6) / 40);
          cap.setScaleY(16 / 18);
          this.world.addChild(cap, 3);
        } catch (eC) {
          var grass = mkColor(T + 1, 12, 63, 143, 74);
          grass.setPosition(x0, gy - 2);
          this.world.addChild(grass, 3);
        }
      }
    },
    _build: function () {
      level = loadLevel();
      loadAudioCfg();
      startBgm();
      this.worldW = level.cols * T;
      /* c37: grass ~28% up — shorter dirt bed on phone landscape (~844×390); keep under touch pad, free sky/walk. */
      this.gy = Math.round(H * 0.28);
      this.gy = Math.max(72, Math.min(this.gy, H - 100));

      this._addNightBg();
      this._buildGround();

      this.traps = [];
      this.coinNodes = [];
      var items = level.items || [];
      var i, it, px;
      for (i = 0; i < items.length; i++) {
        it = items[i];
        px = it.c * T + T * 0.5;
        if (it.type === 'spike' || it.type === 'fire') {
          var base = mkColor(T * 0.85, 6, 58, 58, 66);
          base.setPosition(px - T * 0.42, this.gy - 4);
          this.world.addChild(base, 4);
          var sp = new cc.Sprite(it.type === 'fire' ? fireTex : spikeTex);
          sp.setAnchorPoint(0.5, 0);
          sp.setPosition(px, this.gy - 2);
          sp.setScale(it.type === 'fire' ? 1.85 : 1.15);
          sp.setVisible(it.type === 'fire');
          this.world.addChild(sp, 6);
          this.traps.push({ kind: it.type, x: px, sp: sp, w: T * 0.7 });
        } else if (it.type === 'spring' || it.type === 'mist' || it.type === 'rock') {
          var prop = new cc.Sprite(it.type === 'spring' ? springTex : it.type === 'mist' ? mistTex : rockTex);
          prop.setAnchorPoint(0.5, 0);
          prop.setPosition(px, this.gy - 2);
          prop.setScale(it.type === 'rock' ? 1.1 : 1.3);
          this.world.addChild(prop, 6);
          this.traps.push({ kind: it.type, x: px, sp: prop, w: T * 0.55 });
        } else if (it.type === 'coin') {
          var cn = new cc.Sprite(coinTex);
          cn.setPosition(px, this.gy + T * 0.9);
          this.world.addChild(cn, 5);
          this.coinNodes.push({ x: px, sp: cn, got: false });
        } else if (it.type === 'shield') {
          var st = new cc.Sprite(starTex);
          st.setPosition(px, this.gy + T * 0.95);
          this.world.addChild(st, 5);
          this.coinNodes.push({ x: px, sp: st, got: false, star: true });
        } else if (it.type === 'flag') {
          var midF = new cc.Sprite(flagTex);
          midF.setAnchorPoint(0.5, 0);
          var fy = this.gy;
          var fz = 5;
          if (it.showcase) {
            /* c21/c20: cloth above + in front of croc — not hidden in mouth */
            fy = this.gy + Math.round(crocDrawScale() * 38);
            fz = 9;
          }
          midF.setPosition(px, fy);
          midF.setScale(1.55);
          this.world.addChild(midF, fz);
        }
      }

      var flag = new cc.Sprite(flagTex);
      flag.setAnchorPoint(0.5, 0);
      this.goalX = level.goalC * T + T * 0.5;
      flag.setPosition(this.goalX, this.gy);
      flag.setScale(1.35);
      this.world.addChild(flag, 5);

      /* 鳄鱼王 */
      this.boss = {
        name: '鳄鱼王', max: 3, hp: 3, alive: true,
        x: level.bossC * T + T * 0.5, y: this.gy,
        dir: -1, hurtT: 0
      };
      this.bossSp = new cc.Sprite(crocTex);
      this.bossSp.setAnchorPoint(0.5, 0);
      this.bossSp.setPosition(this.boss.x, this.boss.y);
      this.bossSp.setScale(crocDrawScale());
      this.world.addChild(this.bossSp, 8);
      this.bossSp.setVisible(true);

      this.critters = [];
      var spots = [level.bossC - 8, level.bossC - 4];
      var ci;
      for (ci = 0; ci < spots.length; ci++) {
        var cx = Math.max(level.spawnC + 4, spots[ci]) * T + T * 0.5;
        var body = new cc.Sprite(slimeTex);
        body.setAnchorPoint(0.5, 0);
        body.setPosition(cx, this.gy);
        body.setScale(1.15);
        this.world.addChild(body, 7);
        this.critters.push({ x: cx, hp: 2, max: 2, alive: true, hurtT: 0, sp: body, home: cx });
      }

      this.wallet = level.wallet || readWallet(null);
      this.walletCoins = this.wallet.coins | 0;
      this.weapon = this.wallet.equipped;
      this.cool = 0;
      this.slowT = 0;
      this.fog = new cc.LayerColor(cc.color(120, 70, 170, 255), 4000, 4000);
      this.fog.setPosition(-500, -500);
      this.fog.setOpacity(0);
      this.addChild(this.fog, 40);

      this.palette = netLockedPalette();
      this.ninja = new cc.Sprite(texFor(this.palette, 'idle'));
      this.ninja.setAnchorPoint(0.5, 0);
      var sz = this.ninja.getContentSize();
      var texH = idleTexH;
      if (sz && sz.height > 8) texH = sz.height;
      /* Critical: never ||100 — that made desktop ninja ~2.4× too tall when contentSize was 0. */
      this.nScale = DRAW_H / Math.max(texH, 1);
      this.ninja.setScale(this.nScale);
      this.world.addChild(this.ninja, 10);
      this.walkFrames = ['walk_0', 'walk_1', 'walk_2', 'walk_3'];
      applyNinjaFrame(this.ninja, this.palette, 'idle');

      var lvEl = $('lvlChip');
      if (lvEl) lvEl.textContent = '第9关 我的关卡';
      var iv = (level.traps.spike && +level.traps.spike.interval) || 3;
      $('msg').textContent = (level.by ? level.by + ' · ' : '') + '四波沼泽·刺每' + iv + '秒 · 怪在最后 · 跳/投打鳄王';
    },
    reset: function () {
      this.px = level.spawnC * T + T * 0.5;
      this.py = this.gy;
      this.vx = 0;
      this.vy = 0;
      this.grounded = true;
      this.face = 1;
      this.hp = MAX_HP;
      this.coins = this.walletCoins || 0;
      this.score = 0;
      this.cool = 0;
      this.slowT = 0;
      if (this.fog) this.fog.setOpacity(0);
      this.invuln = 0;
      this.playing = true;
      this.won = false;
      this.dead = false;
      this.t0 = Date.now() / 1000;
      this.hitKeys = {};
      this.throws.forEach(function (t) { if (t.sp) t.sp.removeFromParent(); });
      this.throws = [];
      this.coinNodes.forEach(function (c) { c.got = false; c.sp.setVisible(true); c.sp.setOpacity(255); });
      if (this.boss) {
        this.boss.hp = this.boss.max;
        this.boss.alive = true;
        this.boss.hurtT = 0;
        this.bossSp.setVisible(true);
        this.bossSp.setOpacity(255);
        this.bossSp.setPosition(this.boss.x, this.boss.y);
      }
      if (this.critters) {
        this.critters.forEach(function (cr) {
          cr.alive = true;
          cr.hp = cr.max;
          cr.hurtT = 0;
          cr.x = cr.home;
          if (cr.sp) { cr.sp.setVisible(true); cr.sp.setOpacity(255); cr.sp.setPosition(cr.home, this.gy); }
        }, this);
      }
      this.palette = netLockedPalette();
      this.ninja.setPosition(this.px, this.py);
      applyNinjaFrame(this.ninja, this.palette, 'idle');
      this.ninja.setOpacity(255);
      this.camX = Math.max(0, this.px - W * camBias());
      this.world.setPosition(-this.camX, 0);
      this._layoutBg(this.camX);
      hideResult();
      updHUD(this.hp, this.coins);
      var we0 = $('weapon');
      if (we0) we0.textContent = '武器 ' + (WEAPON_NAMES[this.weapon] || '无');
      inp.jumpPressed = false;
      inp.throwPressed = false;
    },
    _earn: function (n) {
      this.coins += n;
      this.walletCoins = this.coins;
      this.wallet.coins = this.coins;
      writeWallet(this.wallet);
      updHUD(this.hp, this.coins);
    },
    _spawnShot: function (dmg, speed, life, vy, tex) {
      var sp = new cc.Sprite(tex || shurikenTex);
      var x = this.px + this.face * 20;
      var y = this.py + DRAW_H * 0.55;
      sp.setPosition(x, y);
      this.world.addChild(sp, 12);
      this.throws.push({ sp: sp, x: x, y: y, vx: this.face * speed, vy: vy || 0, life: life, dmg: dmg });
    },
    _hurtAt: function (x, y, reach, dmg) {
      var i;
      if (this.boss && this.boss.alive && this.boss.hurtT <= 0 && Math.abs(x - this.bossSp.getPositionX()) < reach && Math.abs(y - (this.boss.y + 28)) < reach) {
        this.boss.hp -= dmg;
        this.boss.hurtT = 0.35;
        playSfx('hit');
        if (this.boss.hp <= 0) {
          this.boss.alive = false;
          this.bossSp.setVisible(false);
          this._earn(8);
          this.score = (this.score | 0) + SCORE.boss;
          this._coinBurst(this.boss.x, this.boss.y + 40);
          $('msg').textContent = '鳄王倒下！+8币 +' + SCORE.boss + '分';
          var bb = $('bossBar'); if (bb) bb.classList.remove('on');
        }
        updHUD(this.hp, this.coins);
        return true;
      }
      if (this.critters) {
        for (i = 0; i < this.critters.length; i++) {
          var cr = this.critters[i];
          if (!cr.alive || cr.hurtT > 0) continue;
          if (Math.abs(x - cr.x) < reach && Math.abs(y - (this.gy + 16)) < reach) {
            cr.hp -= dmg;
            cr.hurtT = 0.25;
            playSfx('hit');
            if (cr.hp <= 0) {
              cr.alive = false;
              cr.sp.setVisible(false);
              this._earn(1);
              this.score = (this.score | 0) + SCORE.slime;
              $('msg').textContent = '小怪 +1币 +' + SCORE.slime + '分';
            }
            updHUD(this.hp, this.coins);
            return true;
          }
        }
      }
      return false;
    },
    _coinBurst: function (x, y) {
      var i;
      for (i = 0; i < 4; i++) {
        var sp = new cc.Sprite(coinTex);
        sp.setPosition(x + (i - 1.5) * 16, y);
        this.world.addChild(sp, 12);
        this.coinNodes.push({ x: x + (i - 1.5) * 18, sp: sp, got: true, pile: true, life: 0.9 });
      }
    },
    _attack: function () {
      if (this.cool > 0) return;
      var w = this.weapon;
      if (w === 'blade') {
        this.cool = 0.45;
        this._hurtAt(this.px + this.face * 36, this.py + 24, 56, 2);
        this._spawnShot(0, 30, 0.16, 0, bladeTex);
        return;
      }
      if (w === 'gun') {
        this.cool = 0.9;
        this._spawnShot(4, 520, 1.35, 0, gunTex);
        return;
      }
      if (w === 'dart') {
        this.cool = 0.4;
        this._spawnShot(1, 340, 0.85, -70, dartTex);
        this._spawnShot(1, 360, 0.9, 0, dartTex);
        this._spawnShot(1, 340, 0.85, 70, dartTex);
        return;
      }
      if (this.throws.length < 3) this._spawnShot(1, 280, 1.2, 0, shurikenTex);
    },
    _groundYAt: function (px) {
      var c = Math.floor(px / T);
      if (!this._solidAt(c)) return -9999;
      return this.gy;
    },
    update: function (dt) {
      try {
        if (!this.playing) return;
        if (dt > 0.05) dt = 0.05;
        var now = Date.now() / 1000;
        var elapsed = now - this.t0;
        var i;

        /* fireflies drift */
        for (i = 0; i < this.fireflies.length; i++) {
          var ff = this.fireflies[i];
          var ox = (i * 97 + elapsed * 14 * ff.spd) % (W + 30) - 10;
          var oy = H * 0.38 + Math.sin(elapsed * 2 + ff.phase) * 24 + (i % 5) * 16;
          ff.n.setPosition(ox, oy);
          ff.n.setOpacity(90 + Math.floor((Math.sin(elapsed * 5 + i) * 0.5 + 0.5) * 140));
        }

        var speed = this.slowT > 0 ? 90 : 200; /* ≈ xy-go MOVE */
        if (inp.left && !inp.right) { this.vx = -speed; this.face = -1; }
        else if (inp.right && !inp.left) { this.vx = speed; this.face = 1; }
        else this.vx *= Math.max(0, 1 - dt * 12);

        if (this.grounded && inp.jumpPressed) {
          this.vy = 680; /* ≈ xy-go JUMP_V — 3-tile pit jumpable */
          this.grounded = false;
          applyNinjaFrame(this.ninja, this.palette, 'jump_0');
          playSfx('jump');
        }
        inp.jumpPressed = false;

        if (this.cool > 0) this.cool -= dt;
        if (this.slowT > 0) {
          this.slowT -= dt;
          if (this.fog) this.fog.setOpacity(Math.max(0, Math.floor(this.slowT / 1.6 * 110)));
        } else if (this.fog) this.fog.setOpacity(0);
        if (inp.throwPressed) {
          inp.throwPressed = false;
          this._attack();
        }

        this.vy -= 1650 * dt; /* ≈ xy-go GRAV */
        if (this.vy < -980) this.vy = -980;
        this.px += this.vx * dt;
        this.py += this.vy * dt;
        if (this.px < T * 0.5) this.px = T * 0.5;
        if (this.px > this.worldW - T * 0.5) this.px = this.worldW - T * 0.5;

        var gY = this._groundYAt(this.px);
        var wasGrounded = this.grounded;
        if (this.py <= gY && this.vy <= 0 && gY > -1000) {
          this.py = gY;
          this.vy = 0;
          this.grounded = true;
          if (!wasGrounded) playSfx('land');
        } else if (gY < -1000 && this.py < this.gy - 80) {
          /* fell in pit */
          if (this.invuln <= 0) {
            this.hp -= 1;
            this.invuln = 1.0;
            this.px = Math.max(T, this.px - T * 3);
            this.py = this.gy + 10;
            this.vy = 0;
            playSfx('hurt');
            updHUD(this.hp, this.coins);
            if (this.hp <= 0) {
              this.hp = 0; this.dead = true; this.playing = false;
              stopBgm(); startBgm('fail');
              showResult(false, 0, this.coins);
            }
          }
        } else {
          this.grounded = false;
        }

        this.ninja.setPosition(this.px, this.py);
        this.ninja.setScaleX(this.face * this.nScale);
        this.ninja.setScaleY(this.nScale);

        if (!this.grounded) applyNinjaFrame(this.ninja, this.palette, 'jump_0');
        else if (Math.abs(this.vx) > 20) {
          this.frameT += dt;
          if (this.frameT > 0.1) { this.frameT = 0; this.frame = (this.frame + 1) % 4; }
          applyNinjaFrame(this.ninja, this.palette, this.walkFrames[this.frame]);
        } else applyNinjaFrame(this.ninja, this.palette, 'idle');
        if (AUDIO) AUDIO.footstep(dt, Math.abs(this.vx) > 20, this.grounded);

        if (this.invuln > 0) {
          this.invuln -= dt;
          this.ninja.setOpacity((Math.floor(this.invuln * 20) % 2) ? 90 : 255);
        } else this.ninja.setOpacity(255);

        /* traps */
        var spk = level.traps.spike || {};
        var I = Math.max(0.6, +spk.interval || 3);
        var upDur = Math.max(0.25, +spk.up || 1);
        var phase = elapsed % I;
        var spikeUp = phase < upDur;
        var fire = level.traps.fire || {};
        var dmgS = Math.max(1, +spk.damage || 1);
        var dmgF = Math.max(1, +fire.damage || 1);

        for (i = 0; i < this.traps.length; i++) {
          var tr = this.traps[i];
          var kind = tr.kind;
          if (kind === 'spring' || kind === 'mist' || kind === 'rock') {
            var touch = Math.abs(this.px - tr.x) < tr.w && this.py < this.gy + DRAW_H * 0.85;
            if (kind === 'spring' && touch && this.grounded) {
              this.vy = 860;
              this.grounded = false;
              applyNinjaFrame(this.ninja, this.palette, 'jump_0');
              playSfx('spring');
            } else if (kind === 'mist' && touch) {
              this.slowT = 1.6;
            } else if (kind === 'rock' && touch && this.py < this.gy + 28) {
              this.px = tr.x + (this.px < tr.x ? -1 : 1) * (tr.w + 6);
              if (this.invuln <= 0) {
                this.hp -= 1;
                this.invuln = 0.8;
                applyNinjaFrame(this.ninja, this.palette, 'knock_0');
                playSfx('hurt');
                updHUD(this.hp, this.coins);
                if (this.hp <= 0) {
                  this.hp = 0; this.dead = true; this.playing = false;
                  stopBgm(); startBgm('fail');
                  showResult(false, 0, this.coins);
                }
              }
            }
            continue;
          }
          var raised = kind === 'fire' ? true : spikeUp;
          tr.sp.setVisible(raised);
          if (raised && this.invuln <= 0) {
            var near = Math.abs(this.px - tr.x) < tr.w && this.py < this.gy + DRAW_H * 0.7;
            var key = kind + ':' + i + ':' + Math.floor(elapsed / I);
            if (near && !this.hitKeys[key]) {
              this.hitKeys[key] = 1;
              this.hp -= (kind === 'fire' ? dmgF : dmgS);
              this.invuln = 1.0;
              applyNinjaFrame(this.ninja, this.palette, 'knock_0');
              playSfx(kind === 'fire' ? 'fire' : 'spike');
              playSfx('hurt');
              updHUD(this.hp, this.coins);
              if (this.hp <= 0) {
                this.hp = 0; this.dead = true; this.playing = false;
                stopBgm(); startBgm('fail');
                showResult(false, 0, this.coins);
                $('msg').textContent = '掉光了 · 点重来';
              }
            }
          }
        }

        for (i = 0; i < this.coinNodes.length; i++) {
          var cn = this.coinNodes[i];
          if (cn.got) continue;
          cn.sp.setPosition(cn.x, this.gy + T * 0.85 + Math.sin(now * 5 + i) * 4);
          if (Math.abs(this.px - cn.x) < T * 0.7 && this.py < this.gy + DRAW_H) {
            cn.got = true; cn.sp.setVisible(false);
            this.coins += cn.star ? 0 : 1;
            if (!cn.star) this.score = (this.score | 0) + SCORE.coin;
            if (cn.star) this.invuln = Math.max(this.invuln, 3);
            playSfx('coin');
            updHUD(this.hp, this.coins);
          }
        }

        /* boss patrol + contact */
        if (this.boss && this.boss.alive) {
          this.boss.hurtT = Math.max(0, this.boss.hurtT - dt);
          var bx = this.boss.x + Math.sin(elapsed * 0.7) * 18;
          this.bossSp.setPosition(bx, this.boss.y);
          this.bossSp.setScaleX((this.px < bx ? -1 : 1) * crocDrawScale());
          if (this.boss.hurtT > 0) this.bossSp.setOpacity(120 + (Math.floor(this.boss.hurtT * 20) % 2) * 100);
          else this.bossSp.setOpacity(255);
          if (this.invuln <= 0 && Math.abs(this.px - bx) < T * 1.2 && this.py < this.gy + DRAW_H) {
            this.hp -= 1;
            this.invuln = 1.0;
            this.vx = (this.px < bx ? -1 : 1) * 120;
            applyNinjaFrame(this.ninja, this.palette, 'knock_0');
            playSfx('hurt');
            updHUD(this.hp, this.coins);
            if (this.hp <= 0) {
              this.hp = 0; this.dead = true; this.playing = false;
              stopBgm(); startBgm('fail');
              showResult(false, 0, this.coins);
            }
          }
        }

        if (this.critters) {
          for (i = 0; i < this.critters.length; i++) {
            var cr = this.critters[i];
            if (!cr.alive) continue;
            cr.hurtT = Math.max(0, cr.hurtT - dt);
            cr.x += Math.sin(elapsed * 1.4 + i) * 18 * dt;
            cr.sp.setPosition(cr.x, this.gy);
            cr.sp.setOpacity(cr.hurtT > 0 ? 140 : 255);
            if (this.invuln <= 0 && Math.abs(this.px - cr.x) < T * 0.7 && this.py < this.gy + DRAW_H * 0.8) {
              this.hp -= 1;
              this.invuln = 0.8;
              applyNinjaFrame(this.ninja, this.palette, 'knock_0');
              updHUD(this.hp, this.coins);
              if (this.hp <= 0) {
                this.hp = 0; this.dead = true; this.playing = false;
                showResult(false, 0, this.coins);
              }
            }
          }
        }
        for (i = this.coinNodes.length - 1; i >= 0; i--) {
          var pile = this.coinNodes[i];
          if (!pile.pile) continue;
          pile.life -= dt;
          pile.sp.setPosition(pile.x, this.gy + 50 + (0.9 - pile.life) * 30);
          if (pile.life <= 0) {
            pile.sp.removeFromParent();
            this.coinNodes.splice(i, 1);
          }
        }

        /* shots */
        for (i = this.throws.length - 1; i >= 0; i--) {
          var th = this.throws[i];
          th.life -= dt;
          th.x += th.vx * dt;
          th.y += (th.vy || 0) * dt;
          th.sp.setPosition(th.x, th.y);
          th.sp.setRotation(th.sp.getRotation() + dt * (this.weapon === 'gun' ? 0 : 720));
          if ((th.dmg || 0) > 0 && this._hurtAt(th.x, th.y, T * 1.1, th.dmg)) th.life = 0;
          if (th.life <= 0) {
            th.sp.removeFromParent();
            this.throws.splice(i, 1);
          }
        }

        if (!this.won && this.px >= this.goalX - T * 0.4 && (!this.boss || !this.boss.alive)) {
          this.won = true; this.playing = false;
          this.score = (this.score | 0) + SCORE.clear + SCORE.hp * Math.max(0, this.hp | 0);
          stopBgm(); startBgm('win');
          showResult(true, this.hp, this.coins);
          $('msg').textContent = '到旗了！积分 ' + (this.score | 0);
        } else if (!this.won && this.px >= this.goalX - T * 0.4 && this.boss && this.boss.alive) {
          $('msg').textContent = '先投中鳄王再冲旗！';
        }

        var target = this.px - W * camBias();
        if (target < 0) target = 0;
        if (target > this.worldW - W) target = Math.max(0, this.worldW - W);
        this.camX += (target - this.camX) * Math.min(1, dt * 8);
        this.world.setPosition(-this.camX, 0);
        this._layoutBg(this.camX);
      } catch (e) { bootErr(String(e && e.message || e)); }
    }
  });


  function spawnNetP2(layer) {
    if (!layer || layer.p2) return;
    try {
      var pal = p2Palette();
      var sp = new cc.Sprite(texFor(pal, 'idle'));
      sp.setAnchorPoint(0.5, 0);
      sp.setScale(layer.nScale);
      sp.setOpacity(220);
      layer.world.addChild(sp, 9);
      applyNinjaFrame(sp, pal, 'idle');
      layer.p2 = { sp: sp, palette: pal, x: layer.px - 40, y: layer.py, _nl: false, _nr: false, _nj: false, _nt: false };
      applyRoleVisuals();
    } catch (eP2) {}
  }

  /* —— PeerJS 联机 (同 xy-go：Peer + BroadcastChannel) —— */
  var NET_PREFIX = 'sycocos1';
  var NET_PEER_OPTS = {
    debug: 0, host: '0.peerjs.com', port: 443, path: '/', secure: true, key: 'peerjs',
    config: { iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
      { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' }
    ] }
  };
  var netRole = null, netPeer = null, netConn = null, netLinked = false, netCode = '';
  var netTransport = null, netBcSession = '', netBC = null, netP2 = null;
  try { netBC = new BroadcastChannel('sycocos-coop-v1'); } catch (eN) { netBC = null; }

  function netRoomId() {
    var slot = Math.floor(Date.now() / 60000) % 1000;
    return NET_PREFIX + '-c-' + slot;
  }
  function netBanner(t, ok) {
    var b = $('netBanner');
    if (!b) return;
    b.textContent = t || '';
    b.classList.toggle('on', !!t);
    b.style.color = ok ? '#9ff0a8' : '#ffe7a0';
  }
  var netSoft = false; /* soft invite: never gate solo play behind peer wait */
  function netPanel(on, wait) {
    var p = $('netPanel');
    if (!p) return;
    /* Soft mode: banner only — full-screen wait must not block movement */
    if (netSoft && on) {
      if (wait) netBanner(wait, false);
      p.classList.remove('on');
      p.style.display = 'none';
      p.style.pointerEvents = 'none';
      var st = $('netStart');
      if (st) st.style.display = 'none';
      return;
    }
    if (!on) {
      p.style.pointerEvents = 'none';
    } else {
      p.style.pointerEvents = 'auto';
    }
    if (on) {
      p.classList.add('on');
      p.style.display = 'flex';
    } else {
      p.classList.remove('on');
      p.style.display = 'none';
    }
    if (wait && $('netWait')) $('netWait').textContent = wait;
    var st = $('netStart');
    if (st) st.style.display = (netRole === 'host' && netLinked) ? 'inline-flex' : 'none';
  }
  function netSend(obj) {
    try {
      if (netTransport === 'bc' && netBC) netBC.postMessage(Object.assign({ session: netBcSession }, obj));
      else if (netConn && netConn.open) netConn.send(obj);
    } catch (e) {}
  }
  function netOnMsg(msg) {
    if (!msg || !msg.t) return;
    if (msg.t === 'hello' && netRole === 'guest') {
      netBanner('已连上队友', true);
      netPanel(true, '已准备！等房主点「开始游戏」');
    }
    if (msg.t === 'go') {
      netPanel(false);
      netBanner('联机中 · ' + (netRole === 'host' ? '房主' : '玩家B'), true);
      if (sceneRef) sceneRef.reset();
    }
    if (msg.t === 'inp' && netRole === 'host' && sceneRef && sceneRef.p2) {
      var p2 = sceneRef.p2;
      p2._nl = !!msg.left; p2._nr = !!msg.right; p2._nj = !!msg.jump; p2._nt = !!msg.throw;
    }
    if (msg.t === 'snap' && netRole === 'guest' && sceneRef) {
      if (msg.x != null) { sceneRef.px = msg.x; sceneRef.py = msg.y; }
      if (msg.p2x != null && sceneRef.p2) {
        sceneRef.p2.x = msg.p2x; sceneRef.p2.y = msg.p2y;
        if (sceneRef.p2.sp) sceneRef.p2.sp.setPosition(msg.p2x, msg.p2y);
      }
      if (msg.bhp != null && sceneRef.boss) {
        sceneRef.boss.hp = msg.bhp;
        sceneRef.boss.alive = !!msg.balive;
        if (sceneRef.bossSp) sceneRef.bossSp.setVisible(sceneRef.boss.alive);
        updHUD(sceneRef.hp, sceneRef.coins);
      }
    }
    if (msg.t === 'bc-offer' && !netLinked && netRole !== 'host') {
      netTransport = 'bc'; netBcSession = msg.session; netCode = msg.id || netCode;
      netRole = 'guest'; netLinked = true;
      applyRoleVisuals();
      netBanner('已连上·同机', true);
      netPanel(true, '已准备！等房主点「开始游戏」');
      netSend({ t: 'bc-ok', session: netBcSession });
    }
    if (msg.t === 'bc-ok' && netRole === 'host' && !netLinked) {
      netTransport = 'bc'; netBcSession = msg.session || netBcSession;
      netLinked = true;
      netBanner('玩家B已加入·同机', true);
      if (netSoft) {
        netPanel(false);
        netBanner('联机中 · 同机房主', true);
        netSend({ t: 'hello', role: 'host' });
        netSend({ t: 'go' });
      } else {
        netPanel(true, '队友已到！点「开始游戏」');
        netSend({ t: 'hello', role: 'host' });
      }
    }
  }
  function netWireConn(conn) {
    netConn = conn;
    conn.on('open', function () {
      netLinked = true; netTransport = 'peer';
      netBanner(netRole === 'host' ? '玩家B已加入' : '已连上房主', true);
      if (netSoft && netRole === 'host') {
        netPanel(false);
        netBanner('联机中 · 房主（单人未停）', true);
        netSend({ t: 'hello', role: 'host' });
        netSend({ t: 'go' });
        spawnNetP2(sceneRef);
        return;
      }
      netPanel(true, netRole === 'host' ? '队友已到！点「开始游戏」' : '已准备！等房主开始');
      if (netRole === 'host') netSend({ t: 'hello', role: 'host' });
    });
    conn.on('data', netOnMsg);
    conn.on('close', function () { netLinked = false; netBanner('连接断开', false); });
  }
  function netStartMatch() {
    if (typeof Peer === 'undefined') {
      netPanel(true, 'PeerJS 未加载，用同页 BroadcastChannel 试同机…');
      netRole = 'host'; netCode = netRoomId();
      netBcSession = 's' + Date.now();
      applyRoleVisuals();
      if (netBC) netBC.postMessage({ t: 'bc-offer', session: netBcSession, id: netCode });
      return;
    }
    netPanel(true, '正在匹配队友（PeerJS）…');
    netBanner('匹配中…', false);
    netCode = netRoomId();
    netRole = null; netLinked = false;
    try { if (netPeer) netPeer.destroy(); } catch (e) {}
    /* Try host first on this minute's room id */
    netPeer = new Peer(netCode, NET_PEER_OPTS);
    var hosted = false;
    netPeer.on('open', function (id) {
      hosted = true; netRole = 'host'; netCode = id;
      applyRoleVisuals();
      netPanel(true, netSoft ? '开房成功 · 单人可继续，队友稍后可加入' : '开房成功 · 等另一位也点「联机游玩」');
      netBanner('房主 · ' + id.slice(-6), false);
      netBcSession = 's' + Date.now();
      if (netBC) netBC.postMessage({ t: 'bc-offer', session: netBcSession, id: netCode });
    });
    netPeer.on('connection', function (conn) { netWireConn(conn); });
    netPeer.on('error', function (err) {
      if (hosted) return;
      /* id taken → join as guest */
      try { netPeer.destroy(); } catch (e2) {}
      netRole = 'guest';
      applyRoleVisuals();
      netPeer = new Peer(NET_PEER_OPTS);
      netPeer.on('open', function () {
        netPanel(true, '发现房间，正在连接…');
        var c = netPeer.connect(netCode, { reliable: true });
        netWireConn(c);
      });
      netPeer.on('error', function () {
        netPanel(true, '匹配失败，可重试或同机开两页');
      });
    });
  }
  function netBindUI() {
    var btn = $('btnNet');
    if (btn) {
      btn.onclick = function (ev) {
        if (ev) ev.preventDefault();
        /* Explicit 联机: show room card, but Cancel only closes UI — solo stays playable */
        netSoft = false;
        netPanel(true, '正在打开联机…');
        netStartMatch();
      };
    }
    var cancel = $('netCancel');
    if (cancel) cancel.onclick = function () {
      netPanel(false);
      /* Keep soft background invite instead of hard abort when coming from ?net=1 */
      if (netSoft || (location.search || '').indexOf('net=1') >= 0) {
        netSoft = true;
        netBanner('已关房间卡 · 单人可继续 · 后台仍可被加入', false);
        return;
      }
      netBanner('', false);
      try { if (netPeer) netPeer.destroy(); } catch (e) {}
      netRole = null; netLinked = false;
      applyRoleVisuals();
    };
    var start = $('netStart');
    if (start) start.onclick = function () {
      if (netRole !== 'host' || !netLinked) return;
      netSend({ t: 'go' });
      netPanel(false);
      netBanner('联机中 · 房主', true);
      if (sceneRef) {
        /* spawn p2 ghost */
        spawnNetP2(sceneRef);
        sceneRef.reset();
      }
    };
    if (netBC) {
      netBC.onmessage = function (ev) { netOnMsg(ev && ev.data); };
    }
  }
  /* host snaps + applies p2 input each frame (hooked from PlayLayer.update) */
  var _origUpdate = null;
  function netAttachUpdate(layer) {
    if (!layer || layer._netHooked) return;
    layer._netHooked = true;
    var prev = layer.update.bind(layer);
    layer.update = function (dt) {
      prev(dt);
      if (!netLinked || !this.playing) return;
      if (netRole === 'host') {
        if (this.p2) {
          var spd = 140;
          if (this.p2._nl && !this.p2._nr) this.p2.x -= spd * dt;
          if (this.p2._nr && !this.p2._nl) this.p2.x += spd * dt;
          if (this.p2._nj) { this.p2.y = this.gy + 40; this.p2._nj = false; }
          else this.p2.y = this.gy;
          if (this.p2.sp) this.p2.sp.setPosition(this.p2.x, this.p2.y);
          if (this.p2._nt) {
            this.p2._nt = false;
            /* guest throw → damage boss from host */
            if (this.boss && this.boss.alive && this.boss.hurtT <= 0 && Math.abs(this.p2.x - this.boss.x) < T * 4) {
              this.boss.hp -= 1; this.boss.hurtT = 0.4;
              if (this.boss.hp <= 0) { this.boss.alive = false; this.bossSp.setVisible(false); }
              updHUD(this.hp, this.coins);
            }
          }
        }
        netSend({
          t: 'snap', x: this.px, y: this.py,
          p2x: this.p2 ? this.p2.x : 0, p2y: this.p2 ? this.p2.y : 0,
          bhp: this.boss ? this.boss.hp : 0, balive: !!(this.boss && this.boss.alive)
        });
      } else if (netRole === 'guest') {
        netSend({ t: 'inp', left: inp.left, right: inp.right, jump: inp.jumpPressed || inp.jump, throw: false });
        /* guest throw edge */
        if (inp.throwPressed) netSend({ t: 'inp', left: inp.left, right: inp.right, jump: false, throw: true });
      }
    };
  }

  function boot() {
    if (typeof cc === 'undefined') { bootErr('Cocos 未加载'); return; }
    window.addEventListener('error', function (e) { bootErr(e.message || String(e)); });
    bindControls();
    netBindUI(); /* c16: was defined but never called — 联机按钮无 handler */
    try {
      var q = new URLSearchParams(location.search || '');
      if (q.get('net') === '1') {
        /* Solo-first: soft BEFORE any panel; play never waits on peer */
        netSoft = true;
        netBanner('联机邀请中（可继续单人）·点「联机游玩」看房间', false);
        setTimeout(function () {
          netSoft = true;
          netBanner('联机邀请中（可继续单人）·点「联机游玩」看房间', false);
          netStartMatch();
        }, 600);
      }
    } catch (eNet) {}
    updateOrientTip();
    fitStage();
    window.addEventListener('resize', fitStage);
    window.addEventListener('orientationchange', function () { setTimeout(fitStage, 120); });

    var PlayScene = cc.Scene.extend({
      onEnter: function () {
        this._super();
        sceneRef = new PlayLayer();
        this.addChild(sceneRef);
        netAttachUpdate(sceneRef);
      }
    });
    window.__playSceneCtor = PlayScene;

    $('retry').onclick = function () { if (sceneRef) sceneRef.reset(); };
    $('again').onclick = function () { if (sceneRef) sceneRef.reset(); };

    function startEngine() {
      cc.game.onStart = function () {
        try {
          cc.view.enableRetina(false);
          cc.view.adjustViewPort(true);
          fitStage();
          cc.view.setDesignResolutionSize(W, H, cc.ResolutionPolicy.EXACT_FIT);
          if (cc.director && cc.director.setClearColor) {
            cc.director.setClearColor(cc.color(90, 58, 36, 255));
          }
          spikeTex = buildSpikeTex();
          fireTex = buildFireTex();
          coinTex = buildCoinTex();
          starTex = buildStarTex();
          flagTex = buildFlagTex();
          shurikenTex = buildShurikenTex();
          crocTex = buildCrocTex();
          slimeTex = buildSlimeTex();
          springTex = buildPropTex('spring');
          mistTex = buildPropTex('mist');
          rockTex = buildPropTex('rock');
          dartTex = buildShotTex('#d5dde6', 14, 6);
          gunTex = buildShotTex('#ffd166', 10, 10);
          bladeTex = buildShotTex('#f4f7fb', 36, 14);
          var others = RES.filter(function (s) { return s.indexOf('canopy-night') < 0; });
          var left = others.length;
          function tick() {
            left--;
            if (left > 0) return;
            fitStage();
            localPalette = readSkinParam();
            bindCastUI();
            syncCastUI();
            /* c36: start play IMMEDIATELY (c33 behavior). Tint red/blue in background. */
            try {
              cc.director.runScene(new PlayScene());
            } catch (eRun) {
              bootErr('场景启动失败：' + (eRun && eRun.message || eRun));
            }
            try {
              $('msg').textContent = '伍澍暘 · 第9关 · 绿/红/蓝 · ←→跳 · F/J投';
            } catch (eMsg) {}
            setTimeout(fitStage, 50);
            ensureTintCache(function () {
              if (sceneRef && sceneRef.ninja) {
                try {
                  applyRoleVisuals();
                  if (sceneRef.p2 && sceneRef.p2.sp) applyNinjaFrame(sceneRef.p2.sp, sceneRef.p2.palette || 'blue', 'idle');
                } catch (eApply) {}
              } else {
                syncCastUI();
              }
            });
          }
          if (!others.length) { left = 1; tick(); return; }
          others.forEach(function (src) {
            var img = new Image();
            img.onload = function () {
              try { cc.textureCache.addImage(src); } catch (e1) {}
              if (src.indexOf('idle.png') >= 0 && img.naturalHeight) idleTexH = img.naturalHeight;
              tick();
            };
            img.onerror = function () { bootErr('图片失败 ' + src); tick(); };
            img.src = src;
          });
        } catch (e) { bootErr('启动失败：' + e); }
      };
      try { cc.game.run('gameCanvas'); } catch (e) { bootErr('启动失败：' + e); }
    }

    /* c27/c21: decode night forest BEFORE first clear; canvas visible; stagePad swamp bed stays */
    var pre = new Image();
    pre.onload = function () {
      forestImg = pre;
      try { if (typeof cc !== 'undefined' && cc.textureCache) cc.textureCache.addImage(BG); } catch (e0) {}
      startEngine();
    };
    pre.onerror = function () { bootErr('夜林背景失败'); startEngine(); };
    pre.src = BG;
  }

  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})();
