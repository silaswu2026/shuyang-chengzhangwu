/**
 * 玩我的关 — Cocos2d-JS Lite ≈ xy-go ?custom=1 第9关·自制关
 * Same JSON / T=40 / PAD·EXP / canopy-night / 鳄王. Engine only.
 * c38: 匹配中不再闪「C 红」— 开房路径立刻乐观锁 Host→A绿；id 占用改 Guest→B蓝；跳过 netRole=null 的中间态（PeerJS open 前 ~3s）。
 * c37: 踩踏伤害 — 下落踩中小怪一脚秒杀(2)、鳄王每次1约三踩；成功踩踏不伤自己并小反弹；侧面贴身仍伤玩家。
 * c36: 着火持续掉血；走路不能灭火（仅踩水/烧完灭）；去掉左右晃灭火。
 * c35: 死亡自动复活（−50积分或免活3次/关；用尽才失败重玩）。was c34: 键盘武器仅 KeyL。
 * c33: 走路手脚自然摆动 — 程序化 opposite arm/leg（旧 walk_* PNG 近同姿态仅飘围巾）；WBNinjaWalk。
 * c31: 竖屏底栏完整可见（HTML 槽用 dvh/安全区/触控垫；fitStage 仍全视口）。横屏金框壳保留。
 * c30: 竖屏画布铺满 — fitStage 竖屏回 window 全视口；HTML 取消竖屏 16:9 槽。
 * c42: P2 HUD 去「沼泽」壳话（保留 c29 着火/锤提示口径）· c41 换壳；PeerJS/玩法不动。
 * c29: 小岩签 — 沼泽保底可踩火源+着火/灭火短提示；锤子近战/投掷明确扣血闪白。弓/飞镖不回退。
 * c41: 试玩换壳 — 海军径向+手机横屏金框；fitStage 按壳槽；PeerJS/玩法不动。
 * c40: levelAudio 第9关 BGM 回退全局；走路/砍击 SFX 钩子。
 * c28: 明天玩关三件可测 — ①武器弓/锤/飞镖（默飞镖可切换）②水面无陷阱 ③着火踩水灭火（保留左右晃）；结算屏三数。
 * c27: short - load cocos in body (not head): mobile _initSys needs document.body or appendChild null aborts engine before Layer.
 * c39: cold-open ninja ASAP — boot without window.load; defer castStrip JPGs; CSS bed solid (no canopy race); preload idle; critical idle(+dirt/grass); procedural placeholder if PNG late; night BG deferred; 1.2s hard cap.
 * c38also: net host/guest chip always matches visible cast once role known (applyRoleVisuals + updHUD → netLockedPalette).
 * c37dirt: shorten dirt bed (gy≈H*0.28, min 72) for phone landscape play space.
 * c36tint: do not gate runScene on tint cache; tint via data-URL; swamp canvas bed (fix c35 blank navy).
 *
 * RULE_BANK（本关不塞，只记库）:
 * - 藤蔓爬：可攀藤蔓上下，另关再开
 * - 红蛋/雷电差异化免伤：红免火、绿免刺等，另关再开
 * - 泥土尖刺超十秒死：踩泥刺计时>10s 即死，另关再开
 * - 全套追击奖励细化：连杀/追击加成分档，另关再开
 */
(function () {
  var KEY = 'xygo-custom-level';
  var SP = '../../../xy-go/sprites/green/';
  var SC = '../../../xy-go/scenes/';
  var BG = SC + 'canopy-night.jpg';
  /* c39: critical = grass bed + idle ninja; walks/knock/jump + night BG deferred. */
  var RES_CRITICAL = [
    SP + 'idle.png', SC + 'dirt-tile.png', SC + 'grass-cap.png'
  ];
  var RES_DEFERRED = [
    SP + 'walk_0.png', SP + 'walk_1.png', SP + 'walk_2.png', SP + 'walk_3.png',
    SP + 'knock_0.png', SP + 'jump_0.png'
  ];
  var RES = RES_CRITICAL.concat(RES_DEFERRED, [BG]);

  /* c39: start idle decode at parse time (before engine / load). */
  var earlyIdleImg = null;
  try {
    earlyIdleImg = new Image();
    earlyIdleImg.decoding = 'async';
    earlyIdleImg.src = SP + 'idle.png';
  } catch (eEarly) { earlyIdleImg = null; }

  function hydrateCastStrip() {
    try {
      var strip = document.getElementById('castStrip');
      if (!strip || strip.getAttribute('data-hydrated') === '1') return;
      strip.setAttribute('data-hydrated', '1');
      var imgs = strip.querySelectorAll('img[data-src]');
      for (var i = 0; i < imgs.length; i++) {
        var im = imgs[i];
        var ds = im.getAttribute('data-src');
        if (ds) im.setAttribute('src', ds);
      }
    } catch (eH) {}
  }

  function proceduralNinjaTex(palette) {
    try {
      var WNW = window.WBNinjaWalk;
      if (!WNW || !WNW.paintFrame || typeof cc === 'undefined' || !cc.Texture2D) return null;
      var cv = WNW.paintFrame(0, palette || 'green', 0, 0);
      if (!cv) return null;
      var tex = new cc.Texture2D();
      tex.initWithElement(cv);
      tex.handleLoadedTexture();
      return tex;
    } catch (eP) { return null; }
  }

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
    try {
      var t = null;
      if (typeof tex === 'string') {
        try { t = cc.textureCache.addImage(tex); } catch (eAdd) { t = null; }
      }
      if (t) {
        sp.setTexture(t);
        var r = t.getContentSize && t.getContentSize();
        if (r && r.height > 2) sp.setTextureRect(cc.rect(0, 0, r.width, r.height));
      } else {
        sp.setTexture(tex);
      }
    } catch (eF) {
      try { sp.setTexture(SP + name + '.png'); } catch (eF2) {}
    }
  }
  function applyWalkPose(sp, palette, phase, speed) {
    var WNW = window.WBNinjaWalk;
    if (!WNW || !sp) return false;
    return !!WNW.applyToSprite(sp, phase, palette, speed, null);
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
  var levelAudioMap = {};
  var PLAY_LEVEL_ID = 9; /* custom-play = 第9关「我的关卡」 */
  var resolvedBgmId = 'explore';
  function loadAudioCfg() {
    audioCfg = { bgmId: 'explore', sfx: {} };
    levelAudioMap = {};
    if (AUDIO) audioCfg = AUDIO.blankAudio();
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (raw && raw.audio) {
        if (AUDIO) audioCfg = AUDIO.normalize(raw.audio);
        else audioCfg = raw.audio;
      }
      if (raw && raw.levelAudio) {
        if (AUDIO && AUDIO.normalizeLevelAudio) levelAudioMap = AUDIO.normalizeLevelAudio(raw.levelAudio);
        else levelAudioMap = raw.levelAudio || {};
      }
    } catch (e) {}
    if (AUDIO) {
      AUDIO.apply(audioCfg);
      resolvedBgmId = AUDIO.bgmForLevel
        ? AUDIO.bgmForLevel(PLAY_LEVEL_ID, audioCfg, levelAudioMap)
        : ((levelAudioMap[String(PLAY_LEVEL_ID)] && levelAudioMap[String(PLAY_LEVEL_ID)].bgmId) || (audioCfg && audioCfg.bgmId) || 'explore');
    } else {
      resolvedBgmId = (levelAudioMap[String(PLAY_LEVEL_ID)] && levelAudioMap[String(PLAY_LEVEL_ID)].bgmId) || (audioCfg && audioCfg.bgmId) || 'explore';
    }
    return audioCfg;
  }
  function playSfx(id) {
    if (!AUDIO) return;
    AUDIO.playSfx(id, false);
  }
  function startBgm(mood) {
    if (!AUDIO) return;
    var id = mood || resolvedBgmId || (audioCfg && audioCfg.bgmId) || 'explore';
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
  var dartTex = null, gunTex = null, bladeTex = null, bowTex = null, hammerTex = null;
  var sessionDeaths = 0; /* 本页会话死亡次数，重来不清零 */
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

  /** c31/c41: always size to playSlot — portrait HTML is already full-bleed swamp (no 16:9 letterbox).
   *  c30 sized portrait to window; that made setFrameSize taller than overflow:hidden slot and clipped ◀▶/跳/投. */
  function fitStage() {
    updateOrientTip();
    var wrap = $('cvwrap');
    var shell = $('shell');
    if (!wrap || !shell) return;
    var slot = document.getElementById('playSlot') || shell;
    var aw = Math.max(2, slot.clientWidth || shell.clientWidth || window.innerWidth);
    var ah = Math.max(2, slot.clientHeight || shell.clientHeight || window.innerHeight);
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
        spring: { power: 1300 }
      },
      mine: null,
      wallet: { coins: 0, weapons: ['dart', 'bow', 'hammer'], equipped: 'dart' },
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
    var HAZARD = { spike: 1, fire: 1, rock: 1, mist: 1, spring: 1 };
    tiles.forEach(function (tt) {
      if (!tt || tt.type === 'g' || tt.type === 'p') return;
      if ((tt.y | 0) >= DR - 1) return;
      /* c28: 水面无陷阱 — 断坑/水格不刷刺火等（金币/旗仍可） */
      if (HAZARD[tt.type] && groundCols[tt.x | 0] === false) return;
      items.push({ type: tt.type, c: gx(tt.x | 0), designX: tt.x | 0 });
    });
    /* 断坑：若完全没有，在变/考交界补一个，不挡安全出生与前两波 */
    var holeN = groundCols.filter(function (g) { return !g; }).length;
    if (holeN === 0 && DC >= 8) {
      groundCols[Math.min(DC - 1, Math.max(6, Math.floor(DC * 0.75)))] = false;
    }
    /* 断坑后二次过滤：确保水面上无刺/火等 */
    items = items.filter(function (it) {
      if (!it || it.designX < 0) return true;
      if (!HAZARD[it.type]) return true;
      return groundCols[it.designX] !== false;
    });
    if (!traps.fire) traps.fire = { damage: 1, dur: 3, burn: 3 };
    if (!traps.spike) traps.spike = { interval: 3, up: 1, damage: 1 };
    if (!traps.rock) traps.rock = { damage: 1 };
    if (!traps.mist) traps.mist = { slow: 1.6 };
    if (!traps.spring) traps.spring = { power: 1300 };
    else if (+traps.spring.power === 820) traps.spring.power = 1300; /* legacy default → higher bounce */

    /* c29: 沼泽关保底可踩火源（设计台未摆火/被水面过滤光时补 2 处实地点火） */
    (function ensureSwampFires() {
      var fireN = 0;
      var i;
      for (i = 0; i < items.length; i++) {
        if (items[i] && items[i].type === 'fire') fireN++;
      }
      if (fireN >= 2) return;
      var want = 2 - fireN;
      var used = {};
      for (i = 0; i < items.length; i++) {
        if (items[i] && items[i].type === 'fire' && typeof items[i].designX === 'number') {
          used[items[i].designX] = 1;
        }
      }
      var prefs = [4, 3, 5, 2, 6, 8, 10, 7, 9, 11, 1];
      var pi, x;
      for (pi = 0; pi < prefs.length && want > 0; pi++) {
        x = prefs[pi];
        if (x < 0 || x >= DC) continue;
        if (groundCols[x] === false) continue;
        if (used[x]) continue;
        /* 避开出生附近 0–1 格，避免一开局就烧 */
        if (x <= 1) continue;
        items.push({ type: 'fire', c: gx(x), designX: x });
        used[x] = 1;
        want--;
      }
      /* 若仍不够：扫全部实地格 */
      for (x = 2; x < DC && want > 0; x++) {
        if (groundCols[x] === false || used[x]) continue;
        items.push({ type: 'fire', c: gx(x), designX: x });
        used[x] = 1;
        want--;
      }
    })();

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
  /* c28 玩关武器三选一：弓 / 锤子 / 飞镖（旧 blade→锤、gun→弓） */
  var WEAPON_NAMES = { dart: '飞镖', bow: '弓', hammer: '锤子' };
  var WEAPON_ORDER = ['dart', 'bow', 'hammer'];
  var WEAPON_ALIAS = { blade: 'hammer', gun: 'bow', dart: 'dart', bow: 'bow', hammer: 'hammer' };
  function normalizeWeaponId(id) {
    if (!id) return null;
    var n = WEAPON_ALIAS[id] || id;
    return WEAPON_NAMES[n] ? n : null;
  }
  function ensurePlayWeapons(w) {
    if (!w || typeof w !== 'object') w = { coins: 0, weapons: [], equipped: null };
    WEAPON_ORDER.forEach(function (id) {
      if (w.weapons.indexOf(id) < 0) w.weapons.push(id);
    });
    w.equipped = normalizeWeaponId(w.equipped) || 'dart';
    return w;
  }
  function cycleWeapon(scene) {
    if (!scene) return;
    var cur = normalizeWeaponId(scene.weapon) || 'dart';
    var ix = WEAPON_ORDER.indexOf(cur);
    var next = WEAPON_ORDER[(ix + 1) % WEAPON_ORDER.length];
    scene.weapon = next;
    if (!scene.wallet) scene.wallet = { coins: scene.coins | 0, weapons: WEAPON_ORDER.slice(), equipped: next };
    scene.wallet.equipped = next;
    scene.wallet.weapons = WEAPON_ORDER.slice();
    writeWallet(scene.wallet);
    updHUD(scene.hp, scene.coins);
    var tip = $('msg');
    if (tip) tip.textContent = '切换武器 → ' + WEAPON_NAMES[next] + '（点武器条或按 Q）';
  }
  function readWallet(raw) {
    var w = { coins: 0, weapons: [], equipped: null };
    if (!raw || typeof raw !== 'object') return ensurePlayWeapons(w);
    if (typeof raw.coins === 'number' && raw.coins >= 0) w.coins = raw.coins | 0;
    if (Array.isArray(raw.weapons)) {
      raw.weapons.forEach(function (id) {
        var n = normalizeWeaponId(id);
        if (n && w.weapons.indexOf(n) < 0) w.weapons.push(n);
      });
    }
    w.equipped = normalizeWeaponId(raw.equipped);
    if (w.equipped && w.weapons.indexOf(w.equipped) < 0) w.weapons.push(w.equipped);
    return ensurePlayWeapons(w);
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
  /** Auto-revive: score cost ≈ one slime; else 3 free chances per level run. */
  var REVIVE_COST = 50;
  var FREE_REVIVES_MAX = 3;
  var REVIVE_DELAY = 2.5;
  var REVIVE_INVULN = 1.5;

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
    if (sc && sceneRef) {
      var freeL = (sceneRef.freeRevivesLeft != null) ? (sceneRef.freeRevivesLeft | 0) : FREE_REVIVES_MAX;
      sc.textContent = '积分 ' + (sceneRef.score | 0) + ' · 免活' + freeL;
    }
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
  function showResult(win, hp, coins, failTitle) {
    var r = $('result'); if (!r) return;
    r.classList.add('show');
    r.classList.add(win ? 'win' : 'fail');
    $('resultBig').textContent = win ? '🎉 过关！' : (failTitle || '😵 再试一次');
    $('resultBig').style.color = win ? '#9ff0a8' : '#ffb4b4';
    var sc = (sceneRef && (sceneRef.score | 0)) || 0;
    var deaths = sessionDeaths | 0;
    var cleared = win ? '是' : '否';
    /* 结算一页三数：金币 / 死亡次数 / 是否通关 */
    $('resultSub').innerHTML =
      '<span class="stat-row">🪙 金币 <b style="color:#ffe7a0">' + (coins | 0) + '</b></span>' +
      '<span class="stat-row">💀 死亡 <b style="color:#ffb4b4">' + deaths + '</b></span>' +
      '<span class="stat-row">🏁 通关 <b style="color:' + (win ? '#9ff0a8' : '#ffb4b4') + '">' + cleared + '</b></span>' +
      '<span class="sub-hint">积分 ' + sc + (hp != null ? ' · 剩' + hp + '❤' : '') +
      (win ? '' : ' · 免活已用完') + '</span>';
    writeLastScore(sc);
  }
  function markDeath() {
    sessionDeaths = (sessionDeaths | 0) + 1;
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
      if (e.code === 'KeyL') { inp.throwPressed = true; e.preventDefault(); }
    });
    window.addEventListener('keyup', function (e) {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') inp.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') inp.right = false;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyK') inp.jump = false;
    });
    window.addEventListener('keydown', function (e) {
      if (e.code === 'KeyQ') { cycleWeapon(sceneRef); e.preventDefault(); }
    });
    var weBtn = $('weapon');
    if (weBtn && !weBtn._cycBound) {
      weBtn._cycBound = 1;
      weBtn.style.cursor = 'pointer';
      weBtn.title = '点击切换武器（弓/锤子/飞镖）';
      weBtn.addEventListener('click', function () { cycleWeapon(sceneRef); });
    }
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
      this.revivePending = false;
      this.reviveWait = 0;
      this.freeRevivesLeft = FREE_REVIVES_MAX;
      this.lastSafeX = 0;
      this.lastSafeY = 0;
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
    /* c39: night forest may arrive after first playable frame — attach without rebuild. */
    _refreshForestBg: function () {
      if (!forestImg || !forestImg.naturalWidth) return;
      if (this.bgNode) {
        this._layoutBg(this.camX || 0);
        return;
      }
      try {
        var tex = new cc.Texture2D();
        tex.initWithElement(forestImg);
        tex.handleLoadedTexture();
        var sp = new cc.Sprite(tex);
        sp.setAnchorPoint(0, 0);
        this.addChild(sp, -5);
        this.bgNode = sp;
        this.bgNode2 = null;
        this._layoutBg(this.camX || 0);
      } catch (eRF) {
        try {
          var sp2 = new cc.Sprite(BG);
          sp2.setAnchorPoint(0, 0);
          this.addChild(sp2, -5);
          this.bgNode = sp2;
          this._layoutBg(this.camX || 0);
        } catch (eRF2) {}
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
        /* c28 水面无陷阱兜底 */
        if (it.type === 'spike' || it.type === 'fire' || it.type === 'rock' || it.type === 'mist' || it.type === 'spring') {
          var dxTrap = (typeof it.designX === 'number' && it.designX >= 0)
            ? it.designX
            : Math.floor((it.c - PAD) / EXP);
          if (dxTrap >= 0 && dxTrap < level.DC && level.groundCols[dxTrap] === false) continue;
        }
        if (it.type === 'spike' || it.type === 'fire') {
          var base = mkColor(T * 0.85, 6, 58, 58, 66);
          base.setPosition(px - T * 0.42, this.gy - 4);
          this.world.addChild(base, 4);
          var sp = new cc.Sprite(it.type === 'fire' ? fireTex : spikeTex);
          sp.setAnchorPoint(0.5, 0);
          sp.setPosition(px, this.gy - 2);
          sp.setScale(it.type === 'fire' ? 2.35 : 1.15);
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

      this.wallet = ensurePlayWeapons(level.wallet || readWallet(null));
      this.walletCoins = this.wallet.coins | 0;
      this.weapon = this.wallet.equipped || 'dart';
      this.cool = 0;
      this.slowT = 0;
      this.burnT = 0;
      this.burnTick = 0;
      this.fog = new cc.LayerColor(cc.color(120, 70, 170, 255), 4000, 4000);
      this.fog.setPosition(-500, -500);
      this.fog.setOpacity(0);
      this.addChild(this.fog, 40);

      this.palette = netLockedPalette();
      this.ninja = new cc.Sprite(texFor(this.palette, 'idle'));
      this.ninja.setAnchorPoint(0.5, 0);
      var sz = this.ninja.getContentSize();
      /* c39: if idle PNG not in cache yet, procedural pose so first paint is not empty stage. */
      if (!sz || sz.height < 8) {
        var ph = proceduralNinjaTex(this.palette);
        if (ph) {
          try {
            this.ninja.setTexture(ph);
            var pr = ph.getContentSize && ph.getContentSize();
            if (pr && pr.height > 2) this.ninja.setTextureRect(cc.rect(0, 0, pr.width, pr.height));
            sz = this.ninja.getContentSize();
            idleTexH = (pr && pr.height) || idleTexH;
          } catch (ePh) {}
        }
      }
      var texH = idleTexH;
      if (sz && sz.height > 8) texH = sz.height;
      /* Critical: never ||100 — that made desktop ninja ~2.4× too tall when contentSize was 0. */
      this.nScale = DRAW_H / Math.max(texH, 1);
      this.ninja.setScale(this.nScale);
      this.world.addChild(this.ninja, 10);
      /* c29: 着火头顶火苗，停帧也能看见着火态 */
      this.burnFx = new cc.Sprite(fireTex);
      this.burnFx.setAnchorPoint(0.5, 0);
      this.burnFx.setScale(1.2);
      this.burnFx.setVisible(false);
      this.world.addChild(this.burnFx, 11);
      this.walkFrames = ['walk_0', 'walk_1', 'walk_2', 'walk_3'];
      this.locoT = 0;
      applyNinjaFrame(this.ninja, this.palette, 'idle');

      var lvEl = $('lvlChip');
      if (lvEl) lvEl.textContent = '第9关 我的关卡';
      var iv = (level.traps.spike && +level.traps.spike.interval) || 3;
      $('msg').textContent = (level.by ? level.by + ' · ' : '') + '自制关·踩火会着火·踩水/等时间灭火·锤可砸可投 · Q切武器';
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
      this.burnT = 0;
      this.burnTick = 0;
      if (this.fog) this.fog.setOpacity(0);
      this.invuln = 0;
      this.playing = true;
      this.won = false;
      this.dead = false;
      this.revivePending = false;
      this.reviveWait = 0;
      this.freeRevivesLeft = FREE_REVIVES_MAX;
      this.lastSafeX = this.px;
      this.lastSafeY = this.py;
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
      var tip = $('msg');
      /* 用精灵当前 X（鳄巡逻会偏），加宽松 Y，锤子近战/投掷都好打中 */
      if (this.boss && this.boss.alive && this.boss.hurtT <= 0) {
        var bpx = this.bossSp ? this.bossSp.getPositionX() : this.boss.x;
        if (Math.abs(x - bpx) < reach && Math.abs(y - (this.boss.y + 28)) < reach + 20) {
          this.boss.hp -= dmg;
          this.boss.hurtT = 0.45;
          if (this.bossSp) {
            this.bossSp.setColor(cc.color(255, 255, 255));
            this.bossSp.setOpacity(255);
          }
          playSfx('slash');
          if (tip) tip.textContent = '命中鳄王！血 ' + Math.max(0, this.boss.hp) + '/' + this.boss.max;
          /* 命中时强制亮血条，方便看见下降 */
          var bbOn = $('bossBar');
          if (bbOn && this.boss.alive) {
            bbOn.classList.add('on');
            bbOn.querySelector('.bn').textContent = this.boss.name;
            bbOn.querySelector('i').style.width = Math.round((Math.max(0, this.boss.hp) / this.boss.max) * 100) + '%';
          }
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
      }
      if (this.critters) {
        for (i = 0; i < this.critters.length; i++) {
          var cr = this.critters[i];
          if (!cr.alive || cr.hurtT > 0) continue;
          if (Math.abs(x - cr.x) < reach && Math.abs(y - (this.gy + 16)) < reach + 16) {
            cr.hp -= dmg;
            cr.hurtT = 0.35;
            if (cr.sp) {
              cr.sp.setColor(cc.color(255, 255, 255));
              cr.sp.setOpacity(255);
            }
            playSfx('slash');
            if (cr.hp <= 0) {
              cr.alive = false;
              cr.sp.setVisible(false);
              this._earn(1);
              this.score = (this.score | 0) + SCORE.slime;
              $('msg').textContent = '小怪 +1币 +' + SCORE.slime + '分';
            } else if (tip) {
              tip.textContent = '命中小怪！血 ' + cr.hp + '/' + cr.max;
            }
            updHUD(this.hp, this.coins);
            return true;
          }
        }
      }
      return false;
    },
    _stompBounce: function () {
      /* light hop; brief i-frames so rising bounce does not re-trigger side hurt */
      this.vy = 420;
      this.grounded = false;
      if (this.py < this.gy + 8) this.py = this.gy + 8;
      this.invuln = Math.max(this.invuln || 0, 0.35);
      applyNinjaFrame(this.ninja, this.palette, 'jump_0');
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
      var w = normalizeWeaponId(this.weapon) || 'dart';
      this.weapon = w;
      if (w === 'hammer') {
        /* c29: 近战砸 + 可投掷飞锤（均带伤）；弓/飞镖路径不动 */
        this.cool = 0.48;
        var hx = this.px + this.face * 52;
        var hy = this.py + 22;
        var smashed = this._hurtAt(hx, hy, 96, 2);
        if (smashed) {
          var tipH = $('msg');
          if (tipH && tipH.textContent.indexOf('命中') < 0 && tipH.textContent.indexOf('倒下') < 0 && tipH.textContent.indexOf('小怪') < 0) {
            tipH.textContent = '锤子砸中！';
          }
        }
        /* 投掷飞锤：有伤、有飞行，远端小怪/鳄也能打到 */
        this._spawnShot(2, 340, 0.95, -40, hammerTex || bladeTex);
        return;
      }
      if (w === 'bow') {
        this.cool = 0.55;
        this._spawnShot(2, 480, 1.25, 0, bowTex || gunTex);
        return;
      }
      /* dart 飞镖：三发散射，默认可打死小怪/鳄 */
      if (w === 'dart') {
        this.cool = 0.4;
        this._spawnShot(1, 340, 0.85, -70, dartTex);
        this._spawnShot(1, 360, 0.9, 0, dartTex);
        this._spawnShot(1, 340, 0.85, 70, dartTex);
        return;
      }
      if (this.throws.length < 3) this._spawnShot(1, 280, 1.2, 0, shurikenTex);
    },
    _clearBurnSilent: function () {
      this.burnT = 0;
      this.burnTick = 0;
      if (this.ninja) this.ninja.setColor(cc.color(255, 255, 255));
      if (this.burnFx) this.burnFx.setVisible(false);
    },
    /** Death → countdown auto-revive (score or free), else force level replay. */
    _killPlayer: function (why) {
      if (this.dead || this.revivePending || this.won) return;
      this.hp = 0;
      this.dead = true;
      this.playing = false;
      this.vx = 0;
      this.vy = 0;
      markDeath();
      this._clearBurnSilent();
      applyNinjaFrame(this.ninja, this.palette, 'knock_0');
      playSfx('hurt');
      updHUD(this.hp, this.coins);
      var sc = this.score | 0;
      var canScore = sc >= REVIVE_COST;
      var canFree = (this.freeRevivesLeft | 0) > 0;
      if (canScore || canFree) {
        this.revivePending = true;
        this.reviveWait = REVIVE_DELAY;
        hideResult();
        stopBgm();
        startBgm('fail');
        var tip = $('msg');
        var plan = canScore
          ? ('−' + REVIVE_COST + '积分')
          : ('免活剩' + (this.freeRevivesLeft | 0));
        if (tip) tip.textContent = (why || '倒下了') + ' · ' + Math.ceil(REVIVE_DELAY) + '秒后复活（' + plan + '）';
        return;
      }
      this.revivePending = false;
      stopBgm();
      startBgm('fail');
      showResult(false, 0, this.coins, '😵 免活用完 · 重玩本关');
      var tip2 = $('msg');
      if (tip2) tip2.textContent = '积分不足且免活用完 · 点重来本关';
    },
    _tickRevive: function (dt) {
      if (!this.revivePending) return;
      this.reviveWait = Math.max(0, (this.reviveWait || 0) - dt);
      var tip = $('msg');
      var sc = this.score | 0;
      var plan = sc >= REVIVE_COST
        ? ('−' + REVIVE_COST + '积分')
        : ('免活剩' + (this.freeRevivesLeft | 0));
      if (tip) {
        var sec = Math.max(1, Math.ceil(this.reviveWait));
        if (this.reviveWait <= 0) sec = 0;
        tip.textContent = sec > 0
          ? ('倒下了 · ' + sec + '秒后复活（' + plan + '）')
          : ('正在复活（' + plan + '）…');
      }
      if (this.reviveWait > 0) return;
      this._doRevive();
    },
    _doRevive: function () {
      this.revivePending = false;
      var sc = this.score | 0;
      var tip = $('msg');
      var note = '';
      if (sc >= REVIVE_COST) {
        this.score = sc - REVIVE_COST;
        note = '复活 −' + REVIVE_COST + '积分';
      } else if ((this.freeRevivesLeft | 0) > 0) {
        this.freeRevivesLeft = (this.freeRevivesLeft | 0) - 1;
        note = '免费复活 · 还剩' + (this.freeRevivesLeft | 0) + '次';
      } else {
        stopBgm();
        startBgm('fail');
        showResult(false, 0, this.coins, '😵 免活用完 · 重玩本关');
        if (tip) tip.textContent = '积分不足且免活用完 · 点重来本关';
        return;
      }
      var sx = (typeof this.lastSafeX === 'number' && this.lastSafeX > 0)
        ? this.lastSafeX
        : (level.spawnC * T + T * 0.5);
      var sy = (typeof this.lastSafeY === 'number' && this.lastSafeY > -100)
        ? this.lastSafeY
        : this.gy;
      /* Prefer solid under lastSafeX */
      if (this._groundYAt(sx) < -1000) {
        sx = level.spawnC * T + T * 0.5;
        sy = this.gy;
      } else {
        sy = this._groundYAt(sx);
      }
      this.px = sx;
      this.py = sy;
      this.vx = 0;
      this.vy = 0;
      this.grounded = true;
      this.hp = MAX_HP;
      this.dead = false;
      this.playing = true;
      this.invuln = REVIVE_INVULN;
      this._clearBurnSilent();
      this.ninja.setPosition(this.px, this.py);
      this.ninja.setOpacity(255);
      applyNinjaFrame(this.ninja, this.palette, 'idle');
      this.camX = Math.max(0, this.px - W * camBias());
      this.world.setPosition(-this.camX, 0);
      this._layoutBg(this.camX);
      hideResult();
      updHUD(this.hp, this.coins);
      stopBgm();
      startBgm(resolvedBgmId || 'explore');
      if (tip) tip.textContent = note + ' · 免活' + (this.freeRevivesLeft | 0);
      playSfx('coin');
    },
        _inWater: function () {
      var c = Math.floor(this.px / T);
      return !this._solidAt(c) && this.py < this.gy + 28;
    },
    _ignite: function () {
      if ((this.burnT || 0) > 0) return;
      var fire = (level && level.traps && level.traps.fire) || {};
      /* burn 秒数；默认 5；期间按 tick 持续掉血 */
      this.burnT = Math.max(2, +fire.burn || +fire.dur || 5);
      this.burnTick = 0;
      var tip = $('msg');
      if (tip) tip.textContent = '着火了 · 踩水灭火';
      playSfx('fire');
    },
    _extinguish: function (why) {
      if ((this.burnT || 0) <= 0) return;
      this.burnT = 0;
      this.burnTick = 0;
      if (this.ninja) this.ninja.setColor(cc.color(255, 255, 255));
      if (this.burnFx) this.burnFx.setVisible(false);
      var tip = $('msg');
      if (tip) tip.textContent = why || '灭火了';
      playSfx('coin');
    },
    _tickBurn: function (dt) {
      if ((this.burnT || 0) <= 0) {
        if (this.ninja) this.ninja.setColor(cc.color(255, 255, 255));
        if (this.burnFx) this.burnFx.setVisible(false);
        return;
      }
      /* 仅踩水灭火；左右走动不再灭火（c36） */
      if (this._inWater()) {
        this._extinguish('踩水灭火了');
        return;
      }
      this.burnT = Math.max(0, this.burnT - dt);
      if (this.ninja) {
        /* 橙闪：更醒目，验收停帧也能看出着火态 */
        var pulse = 90 + Math.floor((Math.sin(Date.now() / 70) * 0.5 + 0.5) * 120);
        this.ninja.setColor(cc.color(255, pulse, 40));
        this.ninja.setOpacity(255);
      }
      if (this.burnFx) {
        this.burnFx.setVisible(true);
        this.burnFx.setPosition(this.px, this.py + DRAW_H * 0.85);
        this.burnFx.setOpacity(180 + Math.floor((Math.sin(Date.now() / 60) * 0.5 + 0.5) * 75));
      }
      var fire = (level && level.traps && level.traps.fire) || {};
      var dmgF = Math.max(1, +fire.damage || 1);
      var tickIv = Math.max(0.5, +fire.tick || 0.85);
      this.burnTick = (this.burnTick || 0) + dt;
      /* 持续掉血：约每 0.85s 一跳；短无敌避免同帧连扣 */
      if (this.burnTick >= tickIv && (this.invuln || 0) <= 0 && this.playing && !this.dead) {
        this.burnTick = 0;
        this.hp -= dmgF;
        this.invuln = Math.max(this.invuln || 0, 0.55);
        applyNinjaFrame(this.ninja, this.palette, 'knock_0');
        playSfx('hurt');
        updHUD(this.hp, this.coins);
        var tipD = $('msg');
        if (tipD) tipD.textContent = '着火中 -' + dmgF + '血';
        if (this.hp <= 0) {
          this._killPlayer('火烧倒了');
          return;
        }
      }
      if (this.burnT > 0) return;
      /* 时间到：火停（期间已持续掉血，不再额外终刀） */
      this.burnTick = 0;
      if (this.ninja) this.ninja.setColor(cc.color(255, 255, 255));
      if (this.burnFx) this.burnFx.setVisible(false);
      var tipE = $('msg');
      if (tipE) tipE.textContent = '火自己灭了';
    },
    _groundYAt: function (px) {
      var c = Math.floor(px / T);
      if (!this._solidAt(c)) return -9999;
      return this.gy;
    },
    update: function (dt) {
      try {
        if (dt > 0.05) dt = 0.05;
        if (!this.playing) {
          if (this.revivePending) this._tickRevive(dt);
          return;
        }
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
        this._tickBurn(dt);
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
        var fallVy = this.vy; /* pre-snap; Mario-style stomp */
        if (this.py <= gY && this.vy <= 0 && gY > -1000) {
          this.py = gY;
          this.vy = 0;
          this.grounded = true;
          this.lastSafeX = this.px;
          this.lastSafeY = this.py;
          if (!wasGrounded) playSfx('land');
        } else if (gY < -1000 && this.py < this.gy - 80) {
          /* fell in pit / swamp water */
          if ((this.burnT || 0) > 0) this._extinguish('灭火了');
          if (this.invuln <= 0) {
            this.hp -= 1;
            this.invuln = 1.0;
            this.px = Math.max(T, this.px - T * 3);
            this.py = this.gy + 10;
            this.vy = 0;
            playSfx('hurt');
            updHUD(this.hp, this.coins);
            if (this.hp <= 0) this._killPlayer('掉进坑了');
          }
        } else {
          this.grounded = false;
        }

        this.ninja.setPosition(this.px, this.py);
        this.ninja.setScaleX(this.face * this.nScale);
        this.ninja.setScaleY(this.nScale);

        if (!this.grounded) applyNinjaFrame(this.ninja, this.palette, 'jump_0');
        else if (Math.abs(this.vx) > 20) {
          /* c33: phase-driven opposite limb swing (not stiff walk_* flipbook). */
          this.locoT = (this.locoT || 0) + Math.abs(this.vx) * dt * 0.085;
          if (!applyWalkPose(this.ninja, this.palette, this.locoT, Math.abs(this.vx))) {
            this.frameT += dt;
            if (this.frameT > 0.1) { this.frameT = 0; this.frame = (this.frame + 1) % 4; }
            applyNinjaFrame(this.ninja, this.palette, this.walkFrames[this.frame]);
          }
        } else {
          this.locoT = 0;
          applyNinjaFrame(this.ninja, this.palette, 'idle');
        }
        if (AUDIO) AUDIO.footstep(dt, Math.abs(this.vx) > 20, this.grounded);

        if (this.invuln > 0) {
          this.invuln -= dt;
          this.ninja.setOpacity((Math.floor(this.invuln * 20) % 2) ? 90 : 255);
        } else this.ninja.setOpacity(255);

        /* 落地后再次判水灭火（_tickBurn 在位移前） */
        if ((this.burnT || 0) > 0 && this._inWater()) this._extinguish('灭火了');

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
              var springCfg = (level.traps && level.traps.spring) || {};
              var springPower = +springCfg.power || 1300;
              if (springPower < 200) springPower = 200;
              if (springPower > 1600) springPower = 1600; /* keep inside level feel vs jump 680 */
              this.vy = springPower;
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
                if (this.hp <= 0) this._killPlayer('撞岩石了');
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
              if (kind === 'fire') {
                /* c36: 着火 → 持续掉血；仅踩水/烧完灭；走动不灭 */
                this._ignite();
                this.invuln = 0.35;
              } else {
                this.hp -= dmgS;
                this.invuln = 1.0;
                applyNinjaFrame(this.ninja, this.palette, 'knock_0');
                playSfx('spike');
                playSfx('hurt');
                updHUD(this.hp, this.coins);
                if (this.hp <= 0) this._killPlayer('踩到刺了');
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
            if (!cn.star) {
              this._earn(1);
              this.score = (this.score | 0) + SCORE.coin;
            }
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
          if (this.boss.hurtT > 0) {
            var bf = (Math.floor(this.boss.hurtT * 24) % 2);
            this.bossSp.setOpacity(255);
            this.bossSp.setColor(bf ? cc.color(255, 255, 255) : cc.color(255, 180, 180));
          } else {
            this.bossSp.setOpacity(255);
            this.bossSp.setColor(cc.color(255, 255, 255));
          }
          var bossTouch = Math.abs(this.px - bx) < T * 1.2 && this.py < this.gy + DRAW_H;
          /* c37: airborne fall onto boss = stomp (1 dmg); side/body still hurts player */
          var canStomp = !wasGrounded && fallVy < 0;
          if (bossTouch && canStomp && this.boss.hurtT <= 0) {
            if (this._hurtAt(bx, this.boss.y + 28, T * 1.5, 1)) {
              this._stompBounce();
              var tipB = $('msg');
              if (tipB && this.boss.alive) tipB.textContent = '踩中鳄王！血 ' + this.boss.hp + '/' + this.boss.max;
              else if (tipB && !this.boss.alive) tipB.textContent = '踩倒鳄王！';
            }
          } else if (bossTouch && !canStomp && this.invuln <= 0) {
            this.hp -= 1;
            this.invuln = 1.0;
            this.vx = (this.px < bx ? -1 : 1) * 120;
            applyNinjaFrame(this.ninja, this.palette, 'knock_0');
            playSfx('hurt');
            updHUD(this.hp, this.coins);
            if (this.hp <= 0) this._killPlayer('被鳄王撞倒');
          }
        }

        if (this.critters) {
          for (i = 0; i < this.critters.length; i++) {
            var cr = this.critters[i];
            if (!cr.alive) continue;
            cr.hurtT = Math.max(0, cr.hurtT - dt);
            cr.x += Math.sin(elapsed * 1.4 + i) * 18 * dt;
            cr.sp.setPosition(cr.x, this.gy);
            if (cr.hurtT > 0) {
              /* 受击闪白 */
              var flash = (Math.floor(cr.hurtT * 24) % 2) ? 255 : 180;
              cr.sp.setOpacity(255);
              cr.sp.setColor(cc.color(255, flash, flash));
            } else {
              cr.sp.setOpacity(255);
              cr.sp.setColor(cc.color(255, 255, 255));
            }
            var crTouch = Math.abs(this.px - cr.x) < T * 0.7 && this.py < this.gy + DRAW_H * 0.8;
            var canStompCr = !wasGrounded && fallVy < 0;
            if (crTouch && canStompCr && cr.hurtT <= 0) {
              /* slime max 2 → stomp dmg 2 one-shots; score/SFX via _hurtAt */
              if (this._hurtAt(cr.x, this.gy + 16, T, 2)) {
                this._stompBounce();
                var tipC = $('msg');
                if (tipC && !cr.alive) tipC.textContent = '踩扁小怪！+1币 +' + SCORE.slime + '分';
                else if (tipC) tipC.textContent = '踩中小怪！血 ' + cr.hp + '/' + cr.max;
              }
            } else if (crTouch && !canStompCr && this.invuln <= 0) {
              this.hp -= 1;
              this.invuln = 0.8;
              applyNinjaFrame(this.ninja, this.palette, 'knock_0');
              updHUD(this.hp, this.coins);
              if (this.hp <= 0) this._killPlayer('被小怪撞倒');
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
          th.sp.setRotation(th.sp.getRotation() + dt * (this.weapon === 'bow' || this.weapon === 'gun' ? 0 : 720));
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
    netLinked = false;
    /* c38: try-host path — lock Host/A绿 immediately. Do NOT null netRole (that flashed solo C红 ~3s while PeerJS open). */
    netRole = 'host';
    applyRoleVisuals();
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
      /* id taken → join as guest; flip chip to B蓝 as soon as role is known */
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

    function setBootMsg(t) {
      try { $('msg').textContent = t; } catch (eM) {}
    }

    function preloadImage(src, onOk, onBad) {
      var img = new Image();
      var done = false;
      function once(fn) {
        return function () {
          if (done) return;
          done = true;
          fn();
        };
      };
      img.onload = once(function () { if (onOk) onOk(img); });
      img.onerror = once(function () { if (onBad) onBad(img); });
      /* hung TCP must not block first frame forever */
      setTimeout(once(function () { if (onBad) onBad(img); }), 4000);
      img.src = src;
    }

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
          bowTex = buildShotTex('#e8c27a', 22, 5); /* 箭矢 */
          hammerTex = buildShotTex('#c5ced8', 30, 14); /* 锤子挥击 */

          var started = false;
          function goPlay() {
            if (started) return;
            started = true;
            fitStage();
            localPalette = readSkinParam();
            bindCastUI();
            syncCastUI();
            /* c36+c39: never gate on tint or night BG. */
            try {
              cc.director.runScene(new PlayScene());
            } catch (eRun) {
              bootErr('场景启动失败：' + (eRun && eRun.message || eRun));
              return;
            }
            setBootMsg('伍澍暘 · 第9关 · 绿/红/蓝 · ←→跳 · L投');
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
            RES_DEFERRED.forEach(function (src) {
              preloadImage(src, function () {
                try { cc.textureCache.addImage(src); } catch (eD) {}
              }, function () {});
            });
            /* portraits after first playable frame — do not contend with idle on cold open */
            setTimeout(hydrateCastStrip, 80);
          }

          /* c39 hard cap: phone landscape cold-open — don't sit on empty canvas under HUD */
          setTimeout(function () {
            if (!started) {
              setBootMsg('小宇：资源偏慢，先开玩…');
              goPlay();
            }
          }, 1200);

          var left = RES_CRITICAL.length;
          setBootMsg('小宇加载中…草地与忍者');
          if (!left) { goPlay(); return; }

          function onCriticalOk(src, img) {
            try { cc.textureCache.addImage(src); } catch (e1) {}
            if (src.indexOf('idle.png') >= 0 && img && img.naturalHeight) idleTexH = img.naturalHeight;
            left--;
            if (left <= 0) goPlay();
          }
          function onCriticalBad(src) {
            setBootMsg('小宇：有图偏慢，继续加载…');
            left--;
            if (left <= 0) goPlay();
          }

          RES_CRITICAL.forEach(function (src) {
            /* reuse parse-time idle if already decoded */
            if (src.indexOf('idle.png') >= 0 && earlyIdleImg && earlyIdleImg.complete && earlyIdleImg.naturalHeight) {
              onCriticalOk(src, earlyIdleImg);
              return;
            }
            preloadImage(src, function (img) {
              onCriticalOk(src, img);
            }, function () {
              onCriticalBad(src);
            });
          });

          /* night forest parallel — attach when ready */
          preloadImage(BG, function (img) {
            forestImg = img;
            try { if (cc.textureCache) cc.textureCache.addImage(BG); } catch (e0) {}
            if (sceneRef && sceneRef._refreshForestBg) {
              try { sceneRef._refreshForestBg(); } catch (eR) {}
            }
          }, function () {});
        } catch (e) { bootErr('启动失败：' + e); }
      };
      try { cc.game.run('gameCanvas'); } catch (e) { bootErr('启动失败：' + e); }
    }

    /* c39: start engine immediately (no window.load; no canopy gate). */
    setBootMsg('小宇打开关卡…');
    startEngine();
  }

  /* c39: never wait for window.load — castStrip JPGs + CSS assets used to delay
   * engine start 0.9–3s while HUD+stage bed already showed (empty transparent canvas). */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
