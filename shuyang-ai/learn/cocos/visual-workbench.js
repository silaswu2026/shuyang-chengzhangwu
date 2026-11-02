/** AI办学小屋 · 课程3 · 可视化关卡工坊 (deep editor). Same save key as tonight. */
/**
 * 可视化工坊 · 与今晚工作台共用 xygo-custom-level v1.2。
 * ldt31: §8 电/凹/大/箱真可摆 + 落石预兆/金币三档/练习金110/弹簧前两格可/中点切设置/宝箱动画 · was ldt30/ldt29。
 */
(function () {
  var W = 960, H = 540, FOOT = 64, CHROME = 52;
  var SP = '../../../xy-go/sprites/green/';
  var AV = ['../../avatars/xiaoyu.jpg', '../../avatars/dad-wuxin.jpg', '../../avatars/mom-chunyan.jpg'];
  /* PRODUCT §4 四芯片；内部场景仍 0..5：0看图 1设置(频率+店) 2摆关 3关联 4觉察 5听选 */
  var STEPS = ['①看图', '关卡设计', '⑤觉察', '⑥听选'];
  var STEPS_PHONE = ['①', '关卡', '⑤', '⑥'];
  var TIP6 = STEPS;
  var TIP6_PHONE = STEPS_PHONE;
  var LD_TABS = [
    { id: 'place', label: '摆关', step: 2 },
    { id: 'settings', label: '设置', step: 1 },
    { id: 'link', label: '关联', step: 3 }
  ];
  var STORE = window.WBStore;
  var ART = window.WBArt;
  var DUR = 12;
  var PAD = [2, 4, 6, 9];
  var NAVY = ccColor(59, 69, 144);
  var GREEN = ccColor(78, 168, 92);
  var GOLD = ccColor(255, 224, 122);
  var INK = ccColor(34, 34, 34);
  var WHITE = ccColor(255, 255, 255);
  var CREAM = ccColor(232, 244, 255);

  function isNarrowViewport() {
    try {
      var w = window.innerWidth || 0, h = window.innerHeight || 0;
      /* portrait phone / narrow: force 手机壳 even if localStorage says desktop */
      return w <= 520 || (w < 720 && h > w);
    } catch (e) { return false; }
  }
  function detectDevicePhone() {
    try {
      return isNarrowViewport() || window.innerWidth < 720 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || '');
    } catch (e) { return false; }
  }
  function readShellPref() {
    try {
      if (isNarrowViewport()) return 'phone';
      if (window.__wbShell === 'phone' || window.__wbShell === 'desktop') return window.__wbShell;
      var s0 = localStorage.getItem('vw-shell') || localStorage.getItem('wb-shell');
      if (s0 === 'phone' || s0 === 'desktop') return s0;
    } catch (e) {}
    return detectDevicePhone() ? 'phone' : 'desktop';
  }
  function isPhoneShell() { return readShellPref() === 'phone'; }

  var WB = window.WB = {
    ready: false,
    sceneName: '',
    data: null,
    shell: readShellPref(),
    ui: { step: 0, look: 0, running: false, runT0: 0, previewDone: false, flash: '', freqDone: false, ldStep: 2, gatePassed: false, gatePending: 2, gateQ: 0, gatePicks: null, gateFlash: '' },
    layout: {},
    setShell: function (mode) {
      if (mode !== 'phone' && mode !== 'desktop') return;
      var prev = WB.shell;
      WB.shell = mode;
      try { localStorage.setItem('vw-shell', mode); } catch (e) {}
      window.__wbShell = mode;
      if (WB.ready && prev !== mode) later(function () { show(WB.ui.step | 0); });
    }
  };

  var PLAY_V = 'c53';
  function goPlayLevel9(net) {
    try { STORE.save(localStorage, WB.data); } catch (eSv) {}
    if (WB.ui) WB.ui.heartPlay = true;
    var n = (WB.data && WB.data.levelId) | 0;
    var sceneMax = (STORE && STORE.SCENE_COUNT) || 5;
    var href = 'custom-play.html?v=' + PLAY_V;
    if (n >= 1 && n <= sceneMax) href += '&scene=' + n + (net ? '&net=1' : '');
    else href += '&level=9' + (net ? '&net=1' : '');
    location.href = href;
  }
  function saveMyFirstLevel() {
    var res = { ok: false };
    try { if (STORE.saveMyFirst) res = STORE.saveMyFirst(localStorage, WB.data) || res; } catch (eMy) { res = { ok: false }; }
    WB.ui.flash = res.ok ? '已存：我的第 1 关' : '没存上，再点一次';
    return res;
  }
  function reopenMyFirst() {
    var res = { ok: false };
    try { if (STORE.applyMyFirst) res = STORE.applyMyFirst(localStorage) || res; } catch (eOp) { res = { ok: false }; }
    if (res.ok) {
      WB.data = STORE.load(localStorage);
      if (STORE.ensureDefaultMap) STORE.ensureDefaultMap(WB.data);
      WB.ui.flash = '已打开：我的第 1 关';
    } else {
      WB.ui.flash = '名册里还没有我的第 1 关';
    }
    return res;
  }

  function ccColor(r, g, b, a) { return cc.color(r, g, b, a == null ? 255 : a); }
  function $(id) { return document.getElementById(id); }

  function bootMsg(m, err) {
    if (window.__wbClearBoot) {
      window.__wbClearBoot(m || '', !!err);
      if (!m && !err) return;
    }
    var b = $('boot');
    if (!b) return;
    b.textContent = m || '';
    b.className = err ? 'err' : (m ? 'show' : '');
  }

  function paintText(text, size, color) {
    var font = size + 'px "WenQuanYi Micro Hei","PingFang SC","Noto Sans SC","Microsoft YaHei",sans-serif';
    var probe = paintText._c || (paintText._c = document.createElement('canvas'));
    var pg = probe.getContext('2d');
    pg.font = font;
    var w = Math.max(8, Math.ceil(pg.measureText(text).width) + 10);
    var h = Math.ceil(size * 1.45);
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    var g = c.getContext('2d');
    g.font = font;
    g.fillStyle = color;
    g.textBaseline = 'middle';
    g.fillText(text, 4, h / 2 + 1);
    var t = new cc.Texture2D();
    t.initWithElement(c);
    t.handleLoadedTexture();
    return t;
  }

  function words(parent, text, x, y, size, color, z) {
    var sp = new cc.Sprite(paintText(text, size, color));
    sp.setPosition(x, y);
    parent.addChild(sp, z == null ? 8 : z);
    sp._wbSize = size;
    sp._wbColor = color;
    return sp;
  }

  function reword(sp, text) {
    if (!sp || sp._wbText === text) return;
    sp._wbText = text;
    var t = paintText(text, sp._wbSize, sp._wbColor);
    sp.setTexture(t);
    var r = t.getContentSize();
    sp.setTextureRect(cc.rect(0, 0, r.width, r.height));
  }

  function shown(node) {
    var n = node;
    while (n) {
      if (n.isVisible && !n.isVisible()) return false;
      n = n.getParent && n.getParent();
    }
    return true;
  }

  function plate(parent, x, y, w, h, color, z) {
    var n = new cc.LayerColor(color, w, h);
    n.setPosition(x, y);
    parent.addChild(n, z || 0);
    return n;
  }

  function shade(col) {
    return cc.color((col.r * 0.62) | 0, (col.g * 0.62) | 0, (col.b * 0.62) | 0);
  }

  function button(parent, text, cx, cy, w, h, bg, fg, onTap) {
    var n = new cc.Node();
    n.setAnchorPoint(0, 0);
    n.setContentSize(w, h);
    n.setPosition(cx - w / 2, cy - h / 2);
    var rad = Math.min(22, h / 2);
    ART.panel(n, w / 2, h / 2 - 3, w, h, shade(bg), 255, 0, rad);
    ART.panel(n, w / 2, h / 2, w, h, bg, 255, 1, rad);
    var hex = fg === INK ? '#222222' : '#ffffff';
    words(n, text, w / 2, h / 2, Math.max(14, Math.min(22, Math.floor(h * 0.42))), hex, 2);
    var listener = cc.EventListener.create({
      event: cc.EventListener.TOUCH_ONE_BY_ONE,
      swallowTouches: true,
      onTouchBegan: function (touch, event) {
        var t = event.getCurrentTarget();
        if (!shown(t)) return false;
        var loc = t.convertToNodeSpace(touch.getLocation());
        return cc.rectContainsPoint(cc.rect(0, 0, w, h), loc);
      },
      onTouchEnded: function (touch, event) {
        var t = event.getCurrentTarget();
        var loc = t.convertToNodeSpace(touch.getLocation());
        if (cc.rectContainsPoint(cc.rect(0, 0, w, h), loc)) onTap();
      }
    });
    parent.addChild(n, 30);
    cc.eventManager.addListener(listener, n);
    return n;
  }

  function later(fn) { setTimeout(fn, 0); }


  /* ---------- 觉察前置闸门（进 ②③④ 前） ---------- */
  var DESIGN_STEPS = { 1: 1, 2: 1, 3: 1 }; /* 关卡设计内：设置/摆关/关联；闸挂整块入口 */
  var GATE_QS = [
    {
      q: '什么样的关卡最难？',
      opts: [
        { id: 'a', t: '很多陷阱挤在一起，反应很短', ok: true },
        { id: 'b', t: '只有一个金币', ok: false },
        { id: 'c', t: '很长但不危险', ok: false }
      ],
      hint: '难＝压力大（密刺+短反应），不是地图长。'
    },
    {
      q: '什么样的玩法算中间？',
      opts: [
        { id: 'a', t: '全平地，没什么互动', ok: false },
        { id: 'b', t: '少量刺，间隔还能跑过去', ok: true },
        { id: 'c', t: '一碰到就秒杀的 Boss', ok: false }
      ],
      hint: '中间＝有一点要想，但还能过。'
    },
    {
      q: '什么样的关卡最复杂？',
      opts: [
        { id: 'a', t: '一种刺翻来覆去', ok: false },
        { id: 'b', t: '火+雾+弹跳+宝箱组合', ok: true },
        { id: 'c', t: '空关，什么都没有', ok: false }
      ],
      hint: '复杂＝元素种类多；复杂不一定最难。'
    }
  ];

  function isDesignStep(step) {
    return !!DESIGN_STEPS[step | 0];
  }

  function readSkipGate() {
    try {
      var q = new URL(location.href).searchParams;
      if (q.get('skipGate') === '1') return true;
    } catch (e0) {}
    try {
      if (/(?:^|[?&])skipGate=1(?:&|$)/.test(location.search || '')) return true;
    } catch (e1) {}
    return false;
  }

  function gateOk() {
    if (WB.ui && WB.ui.gatePassed) return true;
    if (readSkipGate()) {
      WB.ui.gatePassed = true;
      try { sessionStorage.setItem('wb-gate-passed', '1'); } catch (eS) {}
      return true;
    }
    try {
      if (sessionStorage.getItem('wb-gate-passed') === '1') {
        WB.ui.gatePassed = true;
        return true;
      }
    } catch (eR) {}
    return false;
  }

  function markGatePassed() {
    WB.ui.gatePassed = true;
    try { sessionStorage.setItem('wb-gate-passed', '1'); } catch (eM) {}
  }

  function runGateScene() {
    WB.ui.running = false;
    try { if (window.VW && VW.closeDrawers) VW.closeDrawers(); } catch (eC) {}
    if (typeof closeAudioDrawer === 'function') {
      try { closeAudioDrawer(); } catch (eA) {}
    }
    cc.director.runScene(new GateScene());
  }


  function syncStepUrl(step) {
    try {
      var u = new URL(location.href);
      u.searchParams.set('lesson', 'tonight');
      u.searchParams.set('step', String(step));
      history.replaceState(null, '', u.pathname + u.search + u.hash);
    } catch (eU) {}
  }

  function sceneQuery() {
    try {
      var n = parseInt(new URLSearchParams(location.search).get('scene') || '', 10);
      if (n >= 1 && n <= 5) return n;
    } catch (eQ) {}
    return 0;
  }
  function pureEditor() { return sceneQuery() > 0; }
  function pureTitle() {
    var n = sceneQuery();
    var name = (STORE && STORE.levelTitle) ? STORE.levelTitle(n) : '';
    return '第' + n + '关 · ' + name;
  }
  function goSelect() {
    location.href = 'level-select.html?v=ls5';
  }

  function show(step) {
    step = Math.max(0, Math.min(5, step | 0));
    if (pureEditor()) {
      step = 2;
      WB.ui.gatePassed = true;
    }
    if (isDesignStep(step) && !gateOk()) {
      WB.ui.gatePending = step;
      if (WB.ui.gateQ == null) WB.ui.gateQ = 0;
      WB.ui.running = false;
      try { if (window.VW && VW.closeDrawers) VW.closeDrawers(); } catch (eC) {}
      syncStepUrl(step);
      runGateScene();
      return;
    }
    WB.ui.step = step;
    WB.ui.running = false;
    if (isDesignStep(step)) WB.ui.ldStep = step;
    try { if (window.VW && VW.closeDrawers) VW.closeDrawers(); } catch (eC2) {}
    if (step >= 1) STORE.save(localStorage, WB.data);
    syncStepUrl(step);
    var scenes = [LookScene, FreqScene, EditScene, LinkScene, ReflectScene, AudioScene];
    cc.director.runScene(new scenes[step]());
    /* ⑥仍可开喇叭；设置页内嵌商店，不再自动弹抽屉 */
    if (step === 5) later(function () { try { if (window.VW && VW.openMusic) VW.openMusic(); } catch (eM) {} });
  }



  function addTrapChipStrip(parent, tools, y) {
    var phone = isPhoneShell();
    var chipW = phone ? 52 : 64;
    var chipH = phone ? 26 : 28;
    var gap = phone ? 58 : 72;
    var viewX = 12;
    var viewW = 700;
    var strip = new cc.Node();
    strip.setAnchorPoint(0, 0);
    strip.setContentSize(viewW, chipH + 20);
    strip.setPosition(viewX, y - chipH / 2 - 10);
    parent.addChild(strip, 31);
    if (phone) ART.panel(strip, viewW / 2, (chipH + 20) / 2, viewW, chipH + 12, ccColor(12, 16, 40), 170, 0, 10);
    var content = new cc.Node();
    content.setPosition(0, 0);
    strip.addChild(content, 2);
    var state = { ox: 0, max: Math.max(0, tools.length * gap + 16 - viewW) };
    var chipNodes = [];
    tools.forEach(function (t, i) {
      var soon = t[2] === 'soon';
      var on = !soon && WB.data.tool === t[0];
      var cx = 8 + i * gap + chipW / 2;
      var cy = (chipH + 20) / 2;
      var bg = soon ? cc.color(72, 76, 96) : (on ? GOLD : NAVY);
      var fg = soon ? '#aeb6c8' : (on ? '#222222' : '#ffffff');
      ART.panel(content, cx, cy - 2, chipW, chipH, soon ? cc.color(48, 52, 70) : shade(bg), soon ? 200 : 255, 0, Math.min(14, chipH / 2));
      ART.panel(content, cx, cy, chipW, chipH, bg, soon ? 210 : 255, 1, Math.min(14, chipH / 2));
      words(content, t[1], cx, cy, Math.max(13, Math.min(18, Math.floor(chipH * 0.5))), fg, 2);
      chipNodes.push({ id: t[0], x: cx, w: chipW, soon: soon });
    });
    function cullChips() {
      var kids = content.getChildren();
      var i, n, x;
      for (i = 0; i < kids.length; i++) {
        n = kids[i];
        x = n.getPositionX() + state.ox;
        n.setVisible(x > -8 && x < viewW + 8);
      }
    }
    cullChips();
    if (state.max > 0) words(parent, '←滑零件', viewX + viewW - 28, y + 18, 11, '#8f88b8', 32);
    var drag = { on: false, lastX: 0, moved: false };
    cc.eventManager.addListener(cc.EventListener.create({
      event: cc.EventListener.TOUCH_ONE_BY_ONE,
      swallowTouches: true,
      onTouchBegan: function (touch, event) {
        var loc = event.getCurrentTarget().convertToNodeSpace(touch.getLocation());
        if (!cc.rectContainsPoint(cc.rect(0, 0, viewW, chipH + 20), loc)) return false;
        drag.on = true; drag.moved = false; drag.lastX = touch.getLocation().x;
        return true;
      },
      onTouchMoved: function (touch) {
        if (!drag.on || state.max <= 0) return;
        var dx = touch.getLocation().x - drag.lastX;
        drag.lastX = touch.getLocation().x;
        if (Math.abs(dx) > 3) drag.moved = true;
        state.ox = Math.max(-state.max, Math.min(0, state.ox + dx));
        content.setPosition(state.ox, 0);
        cullChips();
      },
      onTouchEnded: function (touch, event) {
        if (!drag.on) return;
        drag.on = false;
        if (drag.moved) return;
        var loc = event.getCurrentTarget().convertToNodeSpace(touch.getLocation());
        var px = loc.x - state.ox, i, c;
        for (i = 0; i < chipNodes.length; i++) {
          c = chipNodes[i];
          if (Math.abs(px - c.x) <= c.w / 2 + 6) {
            if (c.soon) {
              WB.ui.flash = '即将开放';
              later(function () { show(2); });
              return;
            }
            WB.data.tool = c.id;
            if (c.id !== 'coin' && c.id !== 'del') WB.data.sel = c.id;
            WB.ui.heartDef = true;
            later(function () { show(2); });
            return;
          }
        }
      }
    }), strip);
    return strip;
  }

  function addFootTrio(parent, leftLabel, leftFn, midLabel, midFn, rightLabel, rightFn) {
    var phone = isPhoneShell();
    if (phone) {
      button(parent, leftLabel, 110, 30, 100, 40, NAVY, WHITE, leftFn);
      button(parent, midLabel, 480, 32, 210, 48, GREEN, WHITE, midFn);
      button(parent, rightLabel, 850, 30, 110, 40, NAVY, WHITE, rightFn);
      WB.layout.editRun = { x: 480, y: 32 };
    } else {
      button(parent, leftLabel, 120, 32, 150, 44, NAVY, WHITE, leftFn);
      button(parent, midLabel, 470, 32, 180, 46, GREEN, WHITE, midFn);
      button(parent, rightLabel, 830, 32, 160, 44, NAVY, WHITE, rightFn);
      WB.layout.editRun = { x: 470, y: 32 };
    }
  }

  function addChrome(layer, step, opts) {
    opts = opts || {};
    var forGate = !!opts.gate;
    ART.fill(layer, ART.tex.night, 0);
    if (pureEditor() && !forGate) {
      var barH = 46;
      plate(layer, 0, 0, W, FOOT, ccColor(15, 18, 48, 242), 18);
      plate(layer, 0, FOOT - 3, W, 3, ccColor(255, 224, 122, 180), 19);
      plate(layer, 0, H - barH, W, barH, ccColor(15, 18, 48, 242), 20);
      button(layer, '回选关', 78, H - barH / 2, 118, 32, NAVY, WHITE, function () { goSelect(); });
      words(layer, pureTitle(), 520, H - barH / 2, 20, '#ffe07a', 21);
      WB.layout.chrome = { plateBottom: H - barH, chipY: H - barH / 2 };
      return;
    }
    var phone = isPhoneShell();
    var land = false;
    try { land = window.innerWidth > window.innerHeight && window.innerHeight < 520; } catch (eL) {}
    var onDesign = isDesignStep(step);
    if (onDesign) WB.ui.ldStep = step | 0;
    var phaseName = '';
    if ((step | 0) === 0 && !forGate && typeof LOOK_PAGES !== 'undefined') {
      var li = lookClamp(WB.ui.look);
      phaseName = (LOOK_PAGES[li] && LOOK_PAGES[li].phase) || '';
    }
    var plan = window.WBChromeLayout.plan({
      step: step,
      gate: forGate,
      phone: phone,
      land: land,
      avatarXs: phone ? [24, 870, 930] : [28, 890, 940]
    });
    WB.layout.chrome = plan;
    plate(layer, 0, 0, W, FOOT, ccColor(15, 18, 48, 242), 18);
    plate(layer, 0, FOOT - 3, W, 3, ccColor(255, 224, 122, 180), 19);
    plate(layer, 0, plan.plateBottom, W, H - plan.plateBottom, ccColor(15, 18, 48, 242), 20);
    var chipY = plan.chipY;
    var slots = phone ? [24, 870, 930] : [28, 890, 940];
    AV.forEach(function (src, i) {
      var face = ART.avatars[src];
      var sp = face ? new cc.Sprite(face) : new cc.Sprite(src);
      sp.setPosition(slots[i], chipY);
      layer.addChild(sp, 22);
      if (face) {
        sp.setScale(36 / 72);
        return;
      }
      var fit = function () {
        var sz = sp.getContentSize();
        if (sz.width < 2 || sz.height < 2) return false;
        var side = Math.min(sz.width, sz.height);
        sp.setTextureRect(cc.rect((sz.width - side) / 2, (sz.height - side) / 2, side, side));
        sp.setScale(32 / side);
        return true;
      };
      if (!fit()) {
        var n = 0;
        var timer = setInterval(function () {
          if (fit() || ++n > 40) clearInterval(timer);
        }, 50);
      }
    });
    /* 四芯片各占一行宽，次行（原理或摆关|设置|关联）另起一行，互不叠 */
    var activeChip = step === 0 ? 0 : (onDesign ? 1 : (step === 4 ? 2 : (step === 5 ? 3 : 1)));
    plan.steps.forEach(function (s, i) {
      var on = i === activeChip;
      button(layer, s.label, s.x, s.y, s.w, s.h, on ? GREEN : NAVY, WHITE, function () {
        later(function () {
          if (i === 0) show(0);
          else if (i === 1) show((WB.ui.ldStep | 0) || 2);
          else if (i === 2) show(4);
          else show(5);
        });
      });
    });
    if ((step | 0) === 0 && !forGate) {
      plan.subs.forEach(function (s) {
        var on = s.label === phaseName;
        button(layer, s.label, s.x, s.y, s.w, s.h, on ? GOLD : NAVY, on ? INK : WHITE, function () {
          later(function () { WB.ui.look = LOOK_PHASE_FIRST[s.label]; show(0); });
        });
      });
      if (plan.title) words(layer, plan.title.text, plan.title.x, plan.title.y, 13, '#e8e4ff', 21);
    } else if (onDesign && !forGate) {
      plan.subs.forEach(function (s, ti) {
        var tab = LD_TABS[ti];
        var on = (step | 0) === tab.step;
        button(layer, s.label, s.x, s.y, s.w, s.h, on ? GOLD : NAVY, on ? INK : WHITE, function () {
          later(function () { show(tab.step); });
        });
      });
    }
  }

  function addNinja(parent, x, y, h, z) {
    var sp = new cc.Sprite(SP + 'idle.png');
    sp.setAnchorPoint(0.5, 0);
    var sz = sp.getContentSize();
    var den = sz.height > 2 ? sz.height : 256;
    sp.setScale(h / den);
    sp.setPosition(x, y);
    parent.addChild(sp, z == null ? 16 : z);
    sp._frame = 0;
    sp._frameT = 0;
    sp._locoT = 0;
    sp._h = h;
    return sp;
  }

  function stepNinja(sp, dt, hurt, idle) {
    sp._frameT += dt;
    if (hurt) {
      if (sp._frameT < 0.1) return;
      sp._frameT = 0;
      var pathH = SP + 'knock_0.png';
      var th = cc.textureCache.addImage(pathH);
      if (th) {
        sp.setTexture(th);
        var rh = th.getContentSize();
        if (rh.height > 2) {
          sp.setTextureRect(cc.rect(0, 0, rh.width, rh.height));
          sp.setScale(sp._h / rh.height);
        }
      }
      return;
    }
    if (idle) {
      if (sp._frameT < 0.12) return;
      sp._frameT = 0;
      var pathI = SP + 'idle.png';
      var ti = cc.textureCache.addImage(pathI);
      if (ti) {
        sp.setTexture(ti);
        var ri = ti.getContentSize();
        if (ri.height > 2) {
          sp.setTextureRect(cc.rect(0, 0, ri.width, ri.height));
          sp.setScale(sp._h / ri.height);
        }
      }
      sp._locoT = 0;
      return;
    }
    /* c33/ldt20: procedural opposite limb swing while preview runs */
    sp._locoT = (sp._locoT || 0) + dt * 10;
    var WNW = window.WBNinjaWalk;
    if (WNW && WNW.applyToSprite(sp, sp._locoT, 'green', 180, sp._h)) return;
    if (sp._frameT < 0.1) return;
    sp._frameT = 0;
    sp._frame = (sp._frame + 1) % 4;
    var path = SP + 'walk_' + sp._frame + '.png';
    var t = cc.textureCache.addImage(path);
    if (t) {
      sp.setTexture(t);
      var r = t.getContentSize();
      if (r.height > 2) {
        sp.setTextureRect(cc.rect(0, 0, r.width, r.height));
        sp.setScale(sp._h / r.height);
      }
    }
  }

  function driftClouds(sky, t) {
    if (!sky) return;
    var i, c;
    for (i = 0; i < sky.clouds.length; i++) {
      c = sky.clouds[i];
      c.setPosition(c._x0 + Math.sin(t * 0.35 + i) * 14, c._y0);
    }
  }

  /* ---------- 看图 · 三阶段（原理→方法→总结）vw47/wb78 ---------- */
  /* 每页：左【画面区】右【信息区】；分镜对照 docs/LOOK-STEP-SCRIPT.md */
  var LOOK_PAGES = [
    { phase: '原理', id: 'A0', kid: '有的游戏一开始就对你好。', xiaoyu: '先别急着玩。我们看它怎么请你进来。', kind: 'open', chips: ['观察', '新手礼'] },
    { phase: '原理', id: 'A1', kid: '它先用很容易的奖励让你开心。', xiaoyu: '门槛很低：动一点点，就开箱、加分。', kind: 'easy', chips: ['低门槛', '即时奖'] },
    { phase: '原理', id: 'A2', kid: '难一点之后，你会以为全是自己厉害。', xiaoyu: '再难一点。你以为：这是我自己的本事。', kind: 'pride', chips: ['我厉害？'] },
    { phase: '原理', id: 'A3', kid: '再往后，它要你多想一想才给奖。', xiaoyu: '要动脑、花心思，才拿到回馈。', kind: 'think', chips: ['动脑', '花心思'] },
    { phase: '原理', id: 'A4', kid: '奖励会越来越大、越来越新。', xiaoyu: '奖励一直升级：更新的、更大的、更想再来一局。', kind: 'upgrade', chips: ['升级奖', '再一局'] },
    { phase: '原理', id: 'A5', kid: '玩着玩着，就停不下来。', xiaoyu: '不知不觉，时间被它牵走了。', kind: 'addict', chips: ['再一局', '花时间'] },
    { phase: '原理', id: 'A6', kid: '最后它要你继续付时间，有时还要钱或看广告。', xiaoyu: '沉迷以后：花更多时间，有时还要花钱或看广告。', kind: 'cost', chips: ['花时间', '钱/广告', '学习受损'], exit: '看清楚了：这不是你笨，是钩子一步步变长。' },
    { phase: '方法', id: 'B1', kid: '先练：把奖励看成钩子。', xiaoyu: '方法一：看见钩子。宝箱、积分、再一局——都可能是钩。', kind: 'see', chips: ['低门槛', '升级奖', '再一局'] },
    { phase: '方法', id: 'B2', kid: '玩之前/玩之中，问自己这三句。', xiaoyu: '方法二：停三秒，问自己。想清楚再点「再一局」。', kind: 'ask', chips: ['练本事还是要奖？', '丢掉什么？', '谁说了算？'] },
    { phase: '方法', id: 'B3', kid: '开玩前先定：什么时候停。', xiaoyu: '方法三：先定停点，再开始玩。停点是你定的。', kind: 'rule', chips: ['玩到××停', '响铃就停'], exit: '钩子还在，但我可以不咬。' },
    { phase: '总结', id: 'C1', kid: '我的人生我来掌舵，动脑，不让别人牵着走。', xiaoyu: '总结：掌握自己的人生。自己动脑想，而不是被别人——或被游戏——牵着走。', kind: 'master', chips: ['掌握人生', '自己动脑', '不被牵着走'], exit: '给伍澍暘：看懂钩子，再去自己摆关。' }
  ];
  var LOOK_PHASE_FIRST = { '原理': 0, '方法': 7, '总结': 10 };

  function lookClamp(i) {
    var n = LOOK_PAGES.length;
    i = i | 0;
    if (i < 0) return 0;
    if (i >= n) return n - 1;
    return i;
  }

  var LookLayer = cc.Layer.extend({
    ctor: function () {
      this._super();
      WB.sceneName = 'look';
      WB.ui.look = lookClamp(WB.ui.look);
      addChrome(this, 0);
      var page = WB.ui.look;
      var spec = LOOK_PAGES[page];
      var phone = isPhoneShell();
      var land = false;
      try { land = window.innerWidth > window.innerHeight && window.innerHeight < 520; } catch (eL) {}

      /* 原理|方法|总结 已画在顶栏次行，避免和四步芯片叠在一起 */

      /* 左画面 / 右信息 */
      var pic = { x: 20, y: 92, w: phone && land ? 480 : 520, h: 300 };
      var infoX = pic.x + pic.w + 16;
      var infoW = W - infoX - 20;
      var info = { x: infoX, y: 92, w: infoW, h: 300 };
      this._pic = pic;
      ART.frame(this, pic.x + pic.w / 2, pic.y + pic.h / 2, pic.w + 6, pic.h + 6, cc.color(110, 200, 255), 200, 1, 14);
      ART.panel(this, info.x + info.w / 2, info.y + info.h / 2, info.w, info.h, ccColor(18, 26, 52), 235, 2, 14);
      ART.frame(this, info.x + info.w / 2, info.y + info.h / 2, info.w, info.h, cc.color(255, 224, 122), 140, 3, 14);

      words(this, '【画面】' + spec.id, pic.x + 70, pic.y + pic.h - 18, 13, '#9ff0a8', 8);
      words(this, '【信息】' + spec.phase, info.x + 70, info.y + info.h - 18, 13, '#ffe07a', 8);

      this._drawPic(spec, pic);
      this._drawInfo(spec, info);

      /* 底栏翻页 */
      var last = page >= LOOK_PAGES.length - 1;
      if (page > 0) {
        button(this, '上一张', phone ? 110 : 130, 32, phone ? 120 : 140, phone ? 42 : 44, NAVY, WHITE, function () {
          later(function () { WB.ui.look = lookClamp(page - 1); show(0); });
        });
      }
      button(this, last ? '我看懂钩子了' : '下一张', phone ? (last ? 720 : 780) : (last ? 760 : 800), 32, phone ? (last ? 220 : 160) : (last ? 240 : 180), phone ? 46 : 44, GREEN, WHITE, function () {
        later(function () {
          if (page >= LOOK_PAGES.length - 1) show(2);
          else { WB.ui.look = lookClamp(page + 1); show(0); }
        });
      });
      if (last) {
        button(this, '再看原理', phone ? 400 : 420, 32, phone ? 140 : 150, phone ? 40 : 42, NAVY, WHITE, function () {
          later(function () { WB.ui.look = 0; show(0); });
        });
      }
      var dots = '';
      var i;
      for (i = 0; i < LOOK_PAGES.length; i++) {
        dots += (i === page ? '●' : '○');
        if (i === 6 || i === 9) dots += ' ';
      }
      words(this, dots, W / 2, 58, 11, '#ffe7a0', 9);
      words(this, spec.phase + ' · ' + (page + 1) + '/' + LOOK_PAGES.length + ' · 小宇旁白', W / 2, 78, 12, '#c8c0e8', 9);

      this._t = 0;
      this.scheduleUpdate();
      return true;
    },
    _drawInfo: function (spec, info) {
      var cx = info.x + info.w / 2;
      var top = info.y + info.h - 48;
      /* 孩子句 */
      var kidLines = this._wrap(spec.kid, 13);
      var ky = top;
      kidLines.forEach(function (ln, i) {
        words(this, ln, cx, ky - i * 26, 18, '#ffe07a', 8);
      }, this);
      ky -= kidLines.length * 26 + 10;
      /* 小宇旁白 */
      ART.panel(this, cx, ky - 36, info.w - 24, 78, ccColor(8, 16, 32), 200, 6, 12);
      var yuLines = this._wrap('小宇：' + spec.xiaoyu, 14);
      yuLines.forEach(function (ln, i) {
        words(this, ln, cx, ky - 18 - i * 20, 13, '#c8ffd0', 8);
      }, this);
      ky -= 90;
      if (spec.exit) {
        var ex = this._wrap(spec.exit, 15);
        var eh = 18 + ex.length * 16;
        ART.panel(this, cx, info.y + 14 + eh / 2, info.w - 20, eh, ccColor(0, 0, 0), 160, 7, 10);
        ex.forEach(function (ln, i) {
          words(this, ln, cx, info.y + 22 + (ex.length - 1 - i) * 16, 12, '#9ff0a8', 8);
        }, this);
      } else {
        words(this, '点「下一张」继续', cx, info.y + 28, 12, '#a8a0c8', 8);
      }
    },
    _wrap: function (text, maxChars) {
      var out = [];
      var s = String(text || '');
      while (s.length > maxChars) {
        out.push(s.slice(0, maxChars));
        s = s.slice(maxChars);
      }
      if (s) out.push(s);
      if (!out.length) out.push('');
      return out.slice(0, 2);
    },
    _drawPic: function (spec, pic) {
      var cx = pic.x + pic.w / 2;
      var cy = pic.y + pic.h / 2;
      var kind = spec.kind;
      if (kind === 'open' || kind === 'easy' || kind === 'pride' || kind === 'think' || kind === 'upgrade') {
        this._sky = ART.dressSky(this, pic.y + 40, pic);
        ART.addGround(this, pic.x, pic.y + 36, pic.w - 8, 3, 1);
      } else if (kind === 'addict' || kind === 'cost' || kind === 'master' || kind === 'see' || kind === 'ask' || kind === 'rule') {
        ART.blit(this, ART.tex.night, pic.x + 2, pic.y + 2, pic.w - 4, pic.h - 4, 0);
      } else {
        ART.blit(this, ART.tex.night, pic.x + 2, pic.y + 2, pic.w - 4, pic.h - 4, 0);
      }

      if (kind === 'open') {
        this.hero = addNinja(this, pic.x + 120, pic.y + 40, 110, 12);
        ART.place(this, ART.tex.pad, pic.x + 280, pic.y + 120, { h: 70, z: 10 });
        ART.place(this, ART.tex.star, pic.x + 360, pic.y + 200, { h: 48, z: 11 });
        ART.place(this, ART.tex.coin, pic.x + 400, pic.y + 140, { h: 36, z: 11 });
        words(this, '新手礼', pic.x + 380, pic.y + 250, 16, '#ffe07a', 12);
        words(this, '？', cx, cy + 40, 36, '#ffffff', 12);
      } else if (kind === 'easy') {
        this.hero = addNinja(this, pic.x + 100, pic.y + 40, 100, 12);
        ART.place(this, ART.tex.coin, pic.x + 260, pic.y + 160, { h: 44, z: 11 });
        ART.place(this, ART.tex.star, pic.x + 340, pic.y + 190, { h: 40, z: 11 });
        ART.place(this, ART.tex.coin, pic.x + 400, pic.y + 150, { h: 32, z: 11 });
        words(this, '点一下 → 开箱', cx, pic.y + pic.h - 48, 16, '#ffffff', 12);
        ART.panel(this, pic.x + 160, pic.y + 70, 120, 16, GOLD, 200, 8, 6);
        words(this, '矮台阶', pic.x + 160, pic.y + 70, 12, '#222222', 9);
      } else if (kind === 'pride') {
        this.hero = addNinja(this, cx - 40, pic.y + 40, 120, 12);
        ART.place(this, ART.tex.flag, pic.x + 360, pic.y + 180, { h: 56, z: 11 });
        ART.place(this, ART.tex.hook, pic.x + 420, pic.y + 100, { h: 50, z: 9, opacity: 90 });
        words(this, '我过关了！', cx + 20, pic.y + 250, 18, '#9ff0a8', 12);
      } else if (kind === 'think') {
        this.hero = addNinja(this, pic.x + 140, pic.y + 40, 110, 12);
        ART.place(this, ART.tex.head, pic.x + 280, pic.y + 200, { h: 48, z: 11 });
        ART.place(this, ART.tex.star, pic.x + 340, pic.y + 230, { h: 28, z: 12 });
        ART.place(this, ART.tex.star, pic.x + 300, pic.y + 250, { h: 22, z: 12 });
        ART.place(this, ART.tex.coin, pic.x + 400, pic.y + 140, { h: 36, z: 11 });
        words(this, '动脑才给奖', cx + 40, pic.y + 100, 16, '#ffe07a', 12);
      } else if (kind === 'upgrade') {
        this.hero = addNinja(this, pic.x + 110, pic.y + 40, 100, 12);
        ART.place(this, ART.tex.coin, pic.x + 280, pic.y + 180, { h: 64, z: 11 });
        ART.place(this, ART.tex.flag, pic.x + 380, pic.y + 200, { h: 52, z: 11 });
        ART.place(this, ART.tex.hook, pic.x + 430, pic.y + 90, { h: 70, z: 10 });
        words(this, '更大 · 更新 · 再来', cx + 30, pic.y + pic.h - 48, 15, '#ffffff', 12);
      } else if (kind === 'addict') {
        ART.place(this, ART.tex.clock, pic.x + 120, pic.y + 200, { h: 56, z: 11 });
        ART.place(this, ART.tex.loop, pic.x + 260, pic.y + 180, { h: 48, z: 11 });
        this.hero = addNinja(this, pic.x + 380, pic.y + 40, 110, 12);
        ART.panel(this, pic.x + 260, pic.y + 90, 160, 36, GOLD, 230, 8, 10);
        words(this, '再一局', pic.x + 260, pic.y + 90, 16, '#222222', 9);
        words(this, '白天 → 夜里', cx, pic.y + pic.h - 40, 15, '#ffb4b4', 12);
      } else if (kind === 'cost') {
        ART.place(this, ART.tex.clock, pic.x + 120, cy + 20, { h: 52, z: 11 });
        words(this, '花时间', pic.x + 120, cy - 40, 14, '#ffb4b4', 12);
        ART.place(this, ART.tex.coin, pic.x + 280, cy + 20, { h: 48, z: 11 });
        words(this, '钱/广告', pic.x + 280, cy - 40, 14, '#ffb4b4', 12);
        ART.place(this, ART.tex.head, pic.x + 420, cy + 20, { h: 48, z: 11 });
        words(this, '不想学习', pic.x + 420, cy - 40, 14, '#ffb4b4', 12);
        this.hero = addNinja(this, cx, pic.y + 36, 90, 12);
      } else if (kind === 'see') {
        ART.place(this, ART.tex.pad, cx, cy + 30, { h: 80, z: 10 });
        [['低门槛', -120], ['升级奖', 0], ['再一局', 120]].forEach(function (it) {
          ART.place(this, ART.tex.hookMark, cx + it[1], cy - 40, { h: 32, z: 12 });
          words(this, it[0], cx + it[1], cy - 80, 13, '#ffe07a', 12);
        }, this);
        this.hero = addNinja(this, pic.x + 90, pic.y + 36, 100, 12);
        words(this, '看见钩子', cx, pic.y + pic.h - 40, 16, '#9ff0a8', 12);
      } else if (kind === 'ask') {
        var qs = ['①练本事还是要奖？', '②再玩丢掉什么？', '③谁说了算？'];
        qs.forEach(function (q, i) {
          var y = pic.y + pic.h - 70 - i * 70;
          ART.panel(this, cx, y, pic.w - 40, 54, ccColor(18, 26, 52), 230, 8, 12);
          ART.frame(this, cx, y, pic.w - 40, 54, cc.color(159, 240, 168), 180, 9, 12);
          words(this, q, cx, y, 15, '#c8ffd0', 10);
        }, this);
      } else if (kind === 'rule') {
        ART.panel(this, cx - 40, cy + 30, 220, 90, ccColor(90, 60, 30), 240, 8, 10);
        words(this, '玩到××就停', cx - 40, cy + 40, 16, '#ffe07a', 10);
        words(this, '响铃就停', cx - 40, cy + 10, 14, '#ffffff', 10);
        ART.place(this, ART.tex.shield, pic.x + 380, cy + 20, { h: 64, z: 11 });
        this.hero = addNinja(this, pic.x + 120, pic.y + 36, 110, 12);
        ART.place(this, ART.tex.loop, pic.x + 400, pic.y + 70, { h: 36, z: 9, opacity: 100 });
        words(this, '无木牌会被拖走', pic.x + 380, pic.y + 50, 12, '#ffb4b4', 12);
      } else if (kind === 'master') {
        ART.place(this, ART.tex.hook, pic.x + 80, cy, { h: 60, z: 8, opacity: 70 });
        this.hero = addNinja(this, cx, pic.y + 40, 130, 14);
        ART.place(this, ART.tex.shield, cx - 100, cy + 40, { h: 48, z: 12 });
        ART.place(this, ART.tex.star, cx + 110, cy + 50, { h: 40, z: 12 });
        ART.place(this, ART.tex.head, cx + 100, cy - 20, { h: 36, z: 12 });
        words(this, '掌握自己的人生', cx, pic.y + pic.h - 36, 17, '#ffe07a', 12);
        words(this, '自己动脑 · 不被牵着走', cx, pic.y + pic.h - 58, 13, '#c8ffd0', 12);
      }
      /* 信息点 chips 挂在画面区底，避免右栏叠字 */
      if (spec.chips && spec.chips.length && kind !== 'ask') {
        var n = Math.min(3, spec.chips.length);
        var gap = pic.w / (n + 1);
        for (var ci = 0; ci < n; ci++) {
          var zx = pic.x + gap * (ci + 1);
          ART.panel(this, zx, pic.y + 22, Math.min(140, gap - 8), 26, ccColor(0, 0, 0), 160, 14, 8);
          words(this, spec.chips[ci], zx, pic.y + 22, 11, '#ffe7a0', 15);
        }
      }
    },
    update: function (dt) {
      this._t += dt;
      if (this.hero) {
        var hx = this.hero.getPositionX();
        var hy0 = this.hero._baseY;
        if (hy0 == null) {
          this.hero._baseY = this.hero.getPositionY();
          hy0 = this.hero._baseY;
        }
        this.hero.setPosition(hx, hy0 + Math.sin(this._t * 2) * 3);
      }
      driftClouds(this._sky, this._t);
    }
  });

  /* ---------- 频率 ---------- */
  var FreqLayer = cc.Layer.extend({
    ctor: function () {
      this._super();
      WB.sceneName = 'settings';
      WB.ui.running = false;
      addChrome(this, 1);
      words(this, '设置 · 频率 + 装备商店', W / 2, isPhoneShell() ? 430 : 448, 18, '#ffe07a', 8);
      words(this, '滑条调节拍 · 跑一次 · 钱不够买不了', W / 2, 426, 13, '#e8e4ff', 8);
      var box = { x: 18, y: 156, w: 924, h: 250 };
      var gy = box.y + 28;
      this.gy = gy;
      ART.frame(this, box.x + box.w / 2, box.y + box.h / 2, box.w + 8, box.h + 8, cc.color(110, 200, 255), 200, 1, 16);
      this._sky = ART.dressSky(this, gy + 4, box);
      ART.addGround(this, box.x, gy, box.w - 150, 3, 1);
      var self = this;
      words(this, '每', 250, 430, 18, '#ffe7a0', 8);
      button(this, '－', 310, 430, 52, 36, NAVY, WHITE, function () {
        STORE.setIntervalValue(WB.data, WB.data.interval - 1); STORE.save(localStorage, WB.data);
      });
      button(this, '＋', 500, 430, 52, 36, NAVY, WHITE, function () {
        STORE.setIntervalValue(WB.data, WB.data.interval + 1); STORE.save(localStorage, WB.data);
      });
      this.num = words(this, String(WB.data.interval), 400, 432, 36, '#ffe07a', 8);
      words(this, '秒冒一次刺（本关）', 620, 430, 15, '#ffe7a0', 8);
      this.L = box.x + 8;
      this.cw = (box.w - 170) / 12;
      this.secs = [];
      var s;
      for (s = 1; s <= 12; s++) {
        var x = this.L + (s - 0.5) * this.cw;
        var box = ART.panel(this, x, gy + 150, Math.max(36, this.cw - 6), 42, NAVY, 210, 5, 8);
        var lab = words(this, s + '秒', x, gy + 140, 12, '#ffe7a0', 6);
        var sp = new cc.Sprite(ART.tex.spike);
        sp.setAnchorPoint(0.5, 0);
        sp.setPosition(x, gy + 136);
        sp.setScale(0.34);
        this.addChild(sp, 7);
        this.secs.push({ box: box, lab: lab, spike: sp });
      }
      this.spikes = [];
      this.marks = [];
      var i;
      for (i = 0; i < PAD.length; i++) {
        var px = this.L + PAD[i] * this.cw;
        var base = plate(this, px - 16, gy - 4, 32, 6, ccColor(58, 58, 66), 6);
        var spk = new cc.Sprite(ART.tex.spike);
        spk.setAnchorPoint(0.5, 0);
        spk.setPosition(px, gy);
        spk.setScale(0.62);
        this.addChild(spk, 8);
        this.spikes.push(spk);
        this.marks.push(words(this, '', px, gy + 64, 16, '#ffffff', 9));
        base._px = px;
      }
      this.ninja = addNinja(this, this.L, gy, isPhoneShell() ? 128 : 120);
      this.countLab = words(this, '', box.x + box.w - 70, gy + 150, 26, '#ffe07a', 8);
      this.hitLab = words(this, '', box.x + box.w - 70, gy + 70, 28, '#ff6b6b', 8);
      ART.place(this, ART.tex.heart, box.x + box.w - 70, gy + 36, { h: 22, z: 8 });
      words(this, '越常冒越疼', box.x + box.w - 70, gy + 14, 12, '#e8e4ff', 8);
      this.resultLab = words(this, '', W / 2, 132, 16, '#ffe7a0', 8);

      this.hookRow = new cc.Node();
      this.addChild(this.hookRow, 31);
      ART.panel(this.hookRow, W / 2, 88, W - 48, 40, CREAM, 245, 0, 12);
      this.hookAsk = words(this.hookRow, '你发现哪一点在钓你？', 200, 88, 13, '#1a2744', 2);
      var choices = ['节奏变快', '掉血变多', '还想再跑'];
      choices.forEach(function (name, idx) {
        var on = WB.data.hook === name;
        button(self.hookRow, name, 420 + idx * 150, 88, 130, 28, on ? GOLD : NAVY, on ? INK : WHITE, function () {
          WB.data.hook = name;
          STORE.save(localStorage, WB.data);
          later(function () { show(1); });
        });
      });
      this._applyHook();
      /* 装备商店挂设置（不嵌回摆关网格） */
      var wal = WB.data.wallet || { coins: 0, weapons: [], equipped: null };
      ART.panel(this, W / 2, 148, W - 40, 40, ccColor(18, 26, 58), 220, 30, 12);
      words(this, '💰店 ' + ((wal.coins) | 0), 90, 148, 13, '#ffe07a', 31);
      ['dart', 'blade', 'gun'].forEach(function (id, i) {
        var spec = STORE.WEAPONS[id];
        var owned = wal.weapons.indexOf(id) >= 0;
        var on = wal.equipped === id;
        var label = on ? (spec.name + '·用') : (owned ? (spec.name + '·装') : (spec.name + spec.price));
        button(self, label, 220 + i * 200, 148, 170, 32, on ? GOLD : NAVY, on ? INK : WHITE, function () {
          var res = STORE.buy(WB.data, id);
          WB.ui.flash = res.flash || '';
          if (res.ok) STORE.save(localStorage, WB.data);
          later(function () { show(1); });
        });
      });
      addFootTrio(this,
        '回看图', function () { later(function () { show(0); }); },
        '跑一次', function () {
          WB.ui.running = true;
          WB.ui.freqDone = false;
          WB.ui.runT0 = Date.now() / 1000;
          self._applyHook();
        },
        '打开商店', function () { try { if (window.VW && VW.openShop) VW.openShop(); } catch (e) {} }
      );
      WB.layout.freqPlus = { x: 500, y: 430 };
      WB.layout.freqMinus = { x: 310, y: 430 };
      WB.layout.freqRun = WB.layout.editRun || { x: 470, y: 32 };
      this._t = 0;
      this.scheduleUpdate();
      return true;
    },
    _applyHook: function () {
      var showHook = WB.ui.freqDone || !!WB.data.hook;
      this.hookRow.setVisible(showHook);
      if (!showHook) return;
      reword(this.hookAsk, WB.data.hook ? ('记下了：' + WB.data.hook) : '你发现哪一点在钓你？点一个就行');
    },
    update: function (dt) {
      this._t += dt;
      driftClouds(this._sky, this._t);
      var I = WB.data.interval;
      reword(this.num, String(I));
      var n = STORE.fCnt(I), lose = STORE.fHit(I);
      reword(this.countLab, n + ' 次');
      reword(this.hitLab, '-' + lose);
      if (this.resultLab) reword(this.resultLab, '每 ' + I + ' 秒 → ' + n + ' 次刺 → 掉 ' + lose + '❤');
      var now = Date.now() / 1000;
      var elapsed = WB.ui.running ? (now - WB.ui.runT0) : (now % (DUR + 1.5));
      var tt = Math.min(elapsed, DUR);
      var raised = tt >= I && (tt % I) < 1;
      var hurt = false;
      var s, d, sec;
      for (s = 1; s <= 12; s++) {
        d = s >= I && (s % I) === 0;
        sec = this.secs[s - 1];
        sec.box.setOpacity(tt >= s ? 255 : 150);
        sec.spike.setVisible(!!d);
      }
      var i;
      for (i = 0; i < PAD.length; i++) {
        var p = PAD[i];
        this.spikes[i].setVisible(true);
        this.spikes[i].setScale(0.62, raised ? 0.95 : 0.48);
        var hit = p >= I && (p % I) < 1;
        if (tt >= p && hit) {
          reword(this.marks[i], '-1❤');
          if (tt - p < 1) hurt = true;
        } else if (tt >= p + 0.3) reword(this.marks[i], '过');
        else reword(this.marks[i], '');
      }
      var nx = this.L + (tt / DUR) * 12 * this.cw;
      this.ninja.setPosition(Math.min(W - 230, nx), this.gy);
      stepNinja(this.ninja, dt, hurt, !WB.ui.running && tt >= DUR);
      if (WB.ui.running && elapsed >= DUR + 0.2 && !WB.ui.freqDone) {
        WB.ui.freqDone = true;
        WB.ui.running = false;
        this._applyHook();
      }
    }
  });

  function heartStageIndex() {
    var f = [!!WB.ui.heartDef, !!WB.ui.heartPlace, !!WB.ui.heartSave, !!WB.ui.heartPlay];
    var i = 0;
    while (i < 4 && f[i]) i++;
    return i;
  }
  function addHeartStrip(parent) {
    var plan = WB.layout.chrome || { plateBottom: 469 };
    var g = window.WBChromeLayout.heartGeom(plan.plateBottom, heartStageIndex());
    ART.panel(parent, g.bar.x + g.bar.w / 2, g.bar.y, g.bar.w, g.bar.h, ccColor(12, 16, 40), 235, 28, 12);
    words(parent, g.label.text, g.label.x, g.label.y, 13, '#ffe07a', 32);
    var now = null;
    g.items.forEach(function (it) {
      if (it.kind === 'arrow') {
        words(parent, '→', it.x, it.y, 14, '#ffe07a', 32);
        return;
      }
      var bg = it.mode === 'done' ? GREEN : (it.mode === 'now' ? GOLD : ccColor(48, 56, 110));
      var sp = ART.panel(parent, it.x, it.y, it.w, it.h - 4, bg, 255, 31, 10);
      words(parent, it.label, it.x, it.y, 12, it.mode === 'now' ? '#222222' : '#ffffff', 32);
      if (it.mode === 'now') now = sp;
    });
    words(parent, g.hint.text, g.hint.x, g.hint.y, 12, '#9ff0a8', 32);
    return now;
  }
  function undoPlace() {
    if (!WB.ui.undo) {
      WB.ui.flash = '没有可撤销的一步';
      later(function () { show(2); });
      return;
    }
    WB.data.map = WB.ui.undo.slice();
    WB.ui.undo = null;
    try { STORE.save(localStorage, WB.data); } catch (eU) {}
    WB.ui.flash = '已撤销一步';
    later(function () { show(2); });
  }
  function editorChecklist() {
    if (pureEditor()) {
      return [
        { id: 'char', t: '角色', later: true },
        { id: 'bg', t: '背景', later: true },
        { id: 'bgm', t: '音乐', later: false },
        { id: 'sfx', t: '音效', later: false },
        { id: 'mon', t: '怪物', later: false }
      ];
    }
    var n = (WB.data && WB.data.levelId) | 0;
    var who = (n >= 1 && n <= 5) ? ('第' + n + '关') : '我的关';
    var cast = { green: '绿忍者', red: '红忍者', blue: '蓝忍者' };
    var ch = cast[(WB.data && WB.data.character) || 'green'] || '绿忍者';
    return [
      { id: 'char', t: '角色', sub: ch, later: true },
      { id: 'bg', t: '背景', sub: (WB.data && WB.data.backdrop) || 'forest', later: true },
      { id: 'bgm', t: '音乐', later: false },
      { id: 'sfx', t: '音效', later: false },
      { id: 'items', t: '道具', later: false },
      { id: 'nums', t: '数值', later: false },
      { id: 'place', t: '摆放', later: false },
      { id: 'mon', t: '怪物', later: false },
      { id: 'ends', t: '起终', later: false },
      { id: 'len', t: '长度', later: false },
      { id: 'curve', t: '分区', later: false },
      { id: 'play', t: '试玩', later: false },
      { id: 'check', t: '校验', later: false },
      { id: 'undo', t: '撤销', later: false },
      { id: 'bind', t: who, later: false },
      { id: 'win', t: '到终点', later: false }
    ];
  }
  function onCheckTap(id) {
    var n = (WB.data && WB.data.levelId) | 0;
    var bgm = STORE.bgmById ? STORE.bgmById(WB.data && WB.data.bgmId) : { name: '探险' };
    var mons = (WB.data && WB.data.monsters) || [];
    var small = 0;
    var big = 0;
    mons.forEach(function (m) { if (m && m.size === 'big') big++; else small++; });
    if (id === 'char') WB.ui.flash = '本关预填角色。换装下节课可调';
    else if (id === 'bg') WB.ui.flash = '本关预填背景「' + ((WB.data && WB.data.backdrop) || '') + '」。换图下节课可调';
    else if (id === 'bgm') {
      WB.ui.flash = '9 首曲子 · 现在是「' + bgm.name + '」';
      try { if (window.VW && VW.openMusic) VW.openMusic(); } catch (eM) {}
    } else if (id === 'sfx') {
      WB.ui.flash = '音效全关共用一套';
      try { if (window.VW && VW.openMusic) VW.openMusic(); } catch (eS) {}
    } else if (id === 'items') WB.ui.flash = '零件架：起、刺、火、金币、终';
    else if (id === 'nums') WB.ui.flash = '金币 5/15/30 · 刺和火可调秒 · 血量下节课可调';
    else if (id === 'place') WB.ui.flash = '先点零件，再点格子。左右滑跑道';
    else if (id === 'mon') WB.ui.flash = mons.length ? ('已预填 ' + small + ' 小怪 ' + big + ' 大怪 · 拖动下节课可调') : '这关还没预填怪物';
    else if (id === 'ends') WB.ui.flash = '起点和终点都要有。胜利是跑到终点';
    else if (id === 'len') WB.ui.flash = '跑道 ' + ((WB.data && WB.data.map && WB.data.map.length) || 24) + ' 格，左右滑';
    else if (id === 'curve') WB.ui.flash = '教 → 练 → 变 → 考，后面更难';
    else if (id === 'play') WB.ui.flash = '点下面绿色「试玩」。玩完可以再回来调';
    else if (id === 'check') WB.ui.flash = '前两格不能放危险。要有起点和终点';
    else if (id === 'undo') { undoPlace(); return; }
    else if (id === 'bind') WB.ui.flash = n ? ('正在编第 ' + n + ' 关 ' + (STORE.levelTitle ? STORE.levelTitle(n) : '')) : '这是我的关，不是五关弧线';
    else if (id === 'win') WB.ui.flash = '胜利：跑到终点。杀 Boss、收齐币下节课可调';
    later(function () { show(2); });
  }
  function addCheckStrip(parent, y) {
    var items = editorChecklist();
    var phone = isPhoneShell();
    var chipW = 64;
    var chipH = 22;
    var gap = 70;
    var viewX = 12;
    var viewW = 760;
    var strip = new cc.Node();
    strip.setAnchorPoint(0, 0);
    strip.setContentSize(viewW, chipH + 16);
    strip.setPosition(viewX, y - chipH / 2 - 8);
    parent.addChild(strip, 31);
    ART.panel(strip, viewW / 2, (chipH + 16) / 2, viewW, chipH + 10, ccColor(12, 16, 40), 210, 0, 10);
    var content = new cc.Node();
    strip.addChild(content, 2);
    var state = { ox: 0, max: Math.max(0, items.length * gap + 16 - viewW) };
    var nodes = [];
    items.forEach(function (it, i) {
      var cx = 8 + i * gap + chipW / 2;
      var cy = (chipH + 16) / 2;
      var bg = it.later ? cc.color(55, 60, 90) : GREEN;
      ART.panel(content, cx, cy, chipW, chipH, bg, it.later ? 210 : 255, 1, 8);
      words(content, it.t, cx, cy, 11, it.later ? '#d5d0ea' : '#ffffff', 2);
      nodes.push({ id: it.id, x: cx, w: chipW });
    });
    function cullChecks() {
      var kids = content.getChildren();
      var i, n, x;
      for (i = 0; i < kids.length; i++) {
        n = kids[i];
        x = n.getPositionX() + state.ox;
        n.setVisible(x > -8 && x < viewW + 8);
      }
    }
    cullChecks();
    if (state.max > 0) words(parent, '清单←滑', viewX + viewW - 36, y + 16, 11, '#ffe07a', 32);
    var drag = { on: false, lastX: 0, moved: false };
    cc.eventManager.addListener(cc.EventListener.create({
      event: cc.EventListener.TOUCH_ONE_BY_ONE,
      swallowTouches: true,
      onTouchBegan: function (touch, event) {
        var loc = event.getCurrentTarget().convertToNodeSpace(touch.getLocation());
        if (!cc.rectContainsPoint(cc.rect(0, 0, viewW, chipH + 16), loc)) return false;
        drag.on = true; drag.moved = false; drag.lastX = touch.getLocation().x;
        return true;
      },
      onTouchMoved: function (touch) {
        if (!drag.on || state.max <= 0) return;
        var dx = touch.getLocation().x - drag.lastX;
        drag.lastX = touch.getLocation().x;
        if (Math.abs(dx) > 3) drag.moved = true;
        state.ox = Math.max(-state.max, Math.min(0, state.ox + dx));
        content.setPosition(state.ox, 0);
        cullChecks();
      },
      onTouchEnded: function (touch, event) {
        if (!drag.on) return;
        drag.on = false;
        if (drag.moved) return;
        var loc = event.getCurrentTarget().convertToNodeSpace(touch.getLocation());
        var px = loc.x - state.ox;
        var i;
        for (i = 0; i < nodes.length; i++) {
          if (Math.abs(px - nodes[i].x) <= nodes[i].w / 2 + 4) {
            onCheckTap(nodes[i].id);
            return;
          }
        }
      }
    }), strip);
  }

  /* ---------- 摆关 ---------- */
  var EDIT = { L: 12, cw: 46, gy: 150 };
  var EditLayer = cc.Layer.extend({
    ctor: function () {
      this._super();
      WB.sceneName = 'edit';
      addChrome(this, 2);
      var gy = EDIT.gy;
      var cols = (WB.data && WB.data.map && WB.data.map.length) || STORE.MC;
      var cw = EDIT.cw;
      var pure = pureEditor();
      var viewL = 12;
      var viewW = pure ? 936 : 760;
      this._cols = cols;
      this._cw = cw;
      this._viewL = viewL;
      this._viewW = viewW;
      this._panMax = Math.max(0, cols * cw - viewW);
      this._pan = 0;
      this._sky = ART.dressSky(this, gy + 6);
      this._heartNow = addHeartStrip(this);
      var plateB = (WB.layout.chrome && WB.layout.chrome.plateBottom) || 469;
      addCheckStrip(this, pure ? (plateB - 62) : 400);
      var self = this;
      var tools = [['start', '起'], ['spike', '刺'], ['fire', '火'], ['spring', '弹'], ['mist', '沼'], ['rock', '石'], ['electric', '电'], ['groove', '凹'], ['coin', '小'], ['coinBig', '大'], ['chest', '箱'], ['goal', '终'], ['del', '擦']];
      var trayY = pure ? (plateB - 108) : 358;
      addTrapChipStrip(self, tools, trayY);
      words(this, '💰' + ((WB.data.wallet && WB.data.wallet.coins) | 0), 760, trayY, 14, '#ffe07a', 8);
      if (this._panMax > 0) words(this, '←滑跑道→', 400, gy + 118, 12, '#1a2744', 8);
      this._shop = function () {};
      this.paramRow = new cc.Node();
      this.addChild(this.paramRow, 31);
      this._params();
      var track = new cc.Node();
      this.addChild(track, 6);
      this._track = track;
      this._setPan = function (p) {
        p = Math.max(0, Math.min(self._panMax, p || 0));
        self._pan = p;
        track.setPosition(viewL - p, 0);
      };
      ART.addGround(track, 0, gy, cols * cw, 4, 2);
      var aB = Math.max(STORE.SAFE0 + 1, Math.round(cols * 0.22));
      var bB = Math.round(cols * 0.5);
      var cB = Math.round(cols * 0.72);
      var bands = [
        [0, aB, ccColor(78, 168, 92, 70), '教'],
        [aB, bB, ccColor(230, 194, 0, 70), '练'],
        [bB, cB, ccColor(226, 121, 59, 70), '变'],
        [cB, cols, ccColor(226, 59, 59, 70), '考']
      ];
      bands.forEach(function (b) {
        if (b[1] <= b[0]) return;
        plate(track, b[0] * cw, gy + 8, (b[1] - b[0]) * cw, 86, b[2], 3);
        words(track, b[3], b[0] * cw + 14, gy + 78, 13, '#1a2744', 7);
      });
      plate(track, 0, gy + 8, STORE.SAFE0 * cw, 86, ccColor(159, 240, 168, 50), 4);
      words(track, '出生', 18, gy + 60, 12, '#145c28', 7);
      this.frames = [];
      this.marks = [];
      this.idxLabs = [];
      var x;
      for (x = 0; x < cols; x++) {
        var fr = ART.frame(track, (x + 0.5) * cw, gy + 48, cw - 4, 76, cc.color(255, 255, 255), 90, 6, 6);
        this.frames.push(fr);
        var mk = new cc.Node();
        mk.setPosition((x + 0.5) * cw, gy);
        track.addChild(mk, 9);
        this.marks.push(mk);
        this.idxLabs.push(words(track, String(x + 1), (x + 0.5) * cw, gy - 14, 11, '#ffe7a0', 7));
      }
      this._decoFlag = ART.place(track, ART.tex.flag, cols * cw - 36, gy + 6, { anchor: [0, 0], h: 64, z: 11 });
      var hit = new cc.Node();
      hit.setAnchorPoint(0, 0);
      hit.setContentSize(viewW, 120);
      hit.setPosition(viewL, gy - 8);
      this.addChild(hit, 12);
      var drag = { on: false, lastX: 0, moved: false, acc: 0 };
      cc.eventManager.addListener(cc.EventListener.create({
        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        swallowTouches: true,
        onTouchBegan: function (touch, event) {
          var loc = event.getCurrentTarget().convertToNodeSpace(touch.getLocation());
          if (!cc.rectContainsPoint(cc.rect(0, 0, viewW, 120), loc)) return false;
          drag.on = true; drag.moved = false; drag.acc = 0; drag.lastX = touch.getLocation().x;
          return true;
        },
        onTouchMoved: function (touch) {
          if (!drag.on) return;
          var dx = touch.getLocation().x - drag.lastX;
          drag.lastX = touch.getLocation().x;
          drag.acc += dx;
          if (Math.abs(drag.acc) > 8) drag.moved = true;
          if (drag.moved) self._setPan(self._pan - dx);
        },
        onTouchEnded: function (touch, event) {
          if (!drag.on) return;
          drag.on = false;
          if (drag.moved) return;
          var loc = event.getCurrentTarget().convertToNodeSpace(touch.getLocation());
          var col = Math.floor((loc.x + self._pan) / cw);
          var snap = WB.data.map.slice();
          var res = STORE.place(WB.data, col);
          WB.ui.flash = res.flash || '';
          if (res.ok) {
            var changed = false;
            var i;
            for (i = 0; i < snap.length; i++) if (snap[i] !== WB.data.map[i]) changed = true;
            if (changed) {
              WB.ui.undo = snap;
              WB.ui.heartDef = true;
              WB.ui.heartPlace = true;
            }
            STORE.save(localStorage, WB.data);
          }
          later(function () { show(2); });
        }
      }), hit);
      this.ninja = addNinja(track, 28, gy, isPhoneShell() ? 120 : 112);
      this._setPan(0);
      this.checkLabs = [];
      this.sumLab = words(this, '', -100, -100, 12, '#1b1b2a', 1);
      this.moodLab = words(this, '', -100, -100, 12, '#1b1b2a', 1);
      if (!pure) {
        this.card = ART.panel(this, 872, 250, 160, 300, cc.color(78, 201, 107), 255, 10, 16);
        var sceneN = (WB.data.levelId | 0);
        var sceneName = (sceneN >= 1 && STORE.levelTitle) ? ('第' + sceneN + '关 ' + STORE.levelTitle(sceneN)) : '我的关';
        words(this, sceneName, 872, 386, 12, '#1b1b2a', 11);
        words(this, '一共掉', 872, 360, 14, '#1b1b2a', 11);
        this.sumLab = words(this, '', 872, 336, 28, '#1b1b2a', 11);
        this.moodLab = words(this, '', 872, 300, 16, '#1b1b2a', 11);
        var rows0 = STORE.checks(WB.data.map);
        var ci;
        for (ci = 0; ci < rows0.length; ci++) {
          this.checkLabs.push(words(this, '', 872, 250 - ci * 28, 13, '#1b1b2a', 11));
        }
      }
      ART.panel(this, 386, 96, 460, 30, cc.color(255, 244, 214), 235, 10, 12);
      this.flashLab = words(this, WB.ui.flash || '点格子摆东西', 386, 96, 15, '#7a4e00', 11);
      if (!pure) {
        button(self, '跑一次', 700, 96, 100, 28, NAVY, WHITE, function () {
          WB.ui.running = true;
          WB.ui.runT0 = Date.now() / 1000;
          WB.ui.midSwitchArmed = false;
          WB.ui.midSwitchAt = 0;
        });
      }
      button(self, '撤销', pure ? 860 : 820, 96, 72, 28, NAVY, WHITE, function () { undoPlace(); });
      var sceneNow = (WB.data.levelId | 0);
      var saveLabel = pure ? '存本关' : ((sceneNow >= 1 && sceneNow <= 5) ? ('存第' + sceneNow + '关') : '存我的第1关');
      addFootTrio(this,
        '试玩', function () { goPlayLevel9(false); },
        saveLabel, function () {
          if (sceneNow >= 1 && sceneNow <= 5 && STORE.saveLevelEdit) {
            var r = STORE.saveLevelEdit(localStorage, WB.data, sceneNow);
            WB.ui.flash = r && r.ok ? ('已存第' + sceneNow + '关') : '没存上，再点一次';
          } else {
            saveMyFirstLevel();
          }
          WB.ui.heartDef = true;
          WB.ui.heartPlace = true;
          WB.ui.heartSave = true;
          later(function () { show(2); });
        },
        pure ? '回选关' : '再打开', function () {
          if (pure) { goSelect(); return; }
          if (sceneNow >= 1 && sceneNow <= 5 && STORE.applyLevel) {
            STORE.applyLevel(localStorage, sceneNow);
            WB.data = STORE.load(localStorage);
            if (STORE.ensureLongRunway) STORE.ensureLongRunway(WB.data, 24);
            WB.ui.flash = '已打开第' + sceneNow + '关';
          } else {
            reopenMyFirst();
          }
          later(function () { show(2); });
        }
      );
      WB.layout.editCell = function (i) {
        return { x: EDIT.L + (i + 0.5) * EDIT.cw, y: EDIT.gy + 50 };
      };
      this._t = 0;
      this._sig = '';
      this._syncMarks();
      this.scheduleUpdate();
      return true;
    },
    _shop: function () {
      var wal = WB.data.wallet;
      var self = this;
      words(this, '金币 ' + (wal.coins | 0), 70, 386, 15, '#7a4e00', 8);
      ['dart', 'blade', 'gun'].forEach(function (id, i) {
        var spec = STORE.WEAPONS[id];
        var owned = wal.weapons.indexOf(id) >= 0;
        var on = wal.equipped === id;
        var label = on ? (spec.name + ' 使用中') : (owned ? (spec.name + ' 装备') : (spec.name + ' ' + spec.price));
        button(self, label, 210 + i * 150, 386, 140, 30, on ? GOLD : NAVY, on ? INK : WHITE, function () {
          var res = STORE.buy(WB.data, id);
          WB.ui.flash = res.flash || '';
          if (res.ok) STORE.save(localStorage, WB.data);
          later(function () { show(2); });
        });
      });
    },
    _params: function () {
      var sel = WB.data.sel;
      var self = this;
      var hint = {
        start: '起点：忍者从这一格出发（前两格可摆）',
        goal: '终点：跑到这一格就过关',
        spring: '弹簧：踩上去会弹起来（前两格可摆）',
        mist: '沼泽：踩上去变慢，泥水芦苇',
        rock: '落石：先晃预兆再落下',
        electric: '电：碰到短暂麻痹掉血',
        groove: '凹槽：踩进变慢/下陷',
        coin: '小金币：+5 钱包币',
        coinBig: '大金币：+15 钱包币',
        chest: '宝箱：打开 +30 钱包币'
      };
      if (hint[sel]) {
        words(this.paramRow, hint[sel], 220, 300, 15, '#1a2744', 1);
        return;
      }
      if (sel !== 'spike' && sel !== 'fire') {
        words(this.paramRow, '点一个刺或火，再选 1、3、5 秒', 250, 300, 15, '#1a2744', 1);
        return;
      }
      var cur = sel === 'fire' ? WB.data.mp.fire.dur : WB.data.mp.spike.interval;
      words(this.paramRow, sel === 'fire' ? '火停多久' : '刺每几秒冒一次', 120, 300, 15, '#1a2744', 1);
      [1, 3, 5].forEach(function (v, i) {
        var on = cur === v;
        button(self.paramRow, v + '秒', 280 + i * 96, 300, 86, 32, on ? GOLD : NAVY, on ? INK : WHITE, function () {
          if (STORE.setNum(WB.data, v)) STORE.save(localStorage, WB.data);
          later(function () { show(2); });
        });
      });
    },
    _syncMarks: function () {
      var up = Math.floor(Date.now() / 1000 / (WB.data.mp.spike.interval || 3) * 2) % 2 === 0;
      var sig = WB.data.map.join(',') + '|' + WB.data.selX + '|' + up + '|' + WB.ui.flash + '|' +
        WB.data.mp.spike.interval + '|' + WB.data.mp.fire.dur + '|' + (WB.ui.previewDone ? 1 : 0) +
        '|' + (WB.ui.running ? 1 : 0);
      if (sig === this._sig) return;
      this._sig = sig;
      var x, k, sel, sp;
      var nCells = this._cols || (WB.data.map && WB.data.map.length) || STORE.MC;
      for (x = 0; x < nCells; x++) {
        k = WB.data.map[x];
        sel = WB.data.selX === x;
        this.frames[x].setColor(sel ? cc.color(255, 215, 80) : cc.color(255, 255, 255));
        this.frames[x].setOpacity(sel ? 255 : 80);
        var mk = this.marks[x];
        mk.removeAllChildren();
        if (k === 'spike') {
          plate(mk, -18, -2, 36, 6, ccColor(58, 58, 66), 0);
          sp = new cc.Sprite(ART.tex.spike);
          sp.setAnchorPoint(0.5, 0);
          sp.setScale(0.62, up ? 1.05 : 0.5);
          mk.addChild(sp, 1);
        } else if (k === 'fire') {
          sp = new cc.Sprite(ART.tex.fire);
          sp.setAnchorPoint(0.5, 0);
          sp.setScale(0.82);
          mk.addChild(sp, 1);
        } else if (k === 'start') {
          plate(mk, -16, 10, 32, 26, ccColor(62, 207, 106), 1);
          words(mk, '起', 0, 23, 14, '#083018', 2);
        } else if (k === 'goal') {
          sp = new cc.Sprite(ART.tex.flag);
          sp.setAnchorPoint(0.5, 0);
          sp.setScale(0.42);
          mk.addChild(sp, 1);
        } else if (k === 'coin' || k === 'coinBig' || k === 'chest' || k === 'spring' || k === 'mist' || k === 'rock' || k === 'electric' || k === 'groove') {
          var texKey = (k === 'coinBig') ? 'coinBig' : (k === 'chest' ? 'chest' : (k === 'electric' ? 'electric' : (k === 'groove' ? 'groove' : k)));
          var tex = ART.tex[texKey] || ART.tex.coin || ART.tex.rock;
          sp = new cc.Sprite(tex);
          sp.setAnchorPoint(0.5, 0);
          sp.setScale(k === 'mist' || k === 'groove' ? 0.7 : (k === 'coinBig' || k === 'chest' ? 0.72 : 0.62));
          sp.setPosition(0, (k === 'coin' || k === 'coinBig' || k === 'chest') ? 10 : 0);
          mk.addChild(sp, 1);
        }
      }
      var hearts = STORE.mEst(WB.data.map, WB.data.mp);
      var tot = hearts.reduce(function (a, b) { return a + b; }, 0);
      var col = tot <= 2 ? cc.color(78, 201, 107) : tot <= 5 ? cc.color(255, 210, 63) : cc.color(255, 90, 90);
      if (this.card) this.card.setColor(col);
      reword(this.sumLab, tot + '❤');
      reword(this.moodLab, tot <= 2 ? '简单' : tot <= 5 ? '刚刚好' : '超难');
      var rows = STORE.checks(WB.data.map);
      var i;
      for (i = 0; i < rows.length; i++) {
        reword(this.checkLabs[i], (rows[i][1] ? '✓ ' : '· ') + rows[i][0]);
      }
      if (this._decoFlag) {
        var goalPlaced = false;
        var gi;
        for (gi = 0; gi < (this._cols || STORE.MC); gi++) if (WB.data.map[gi] === 'goal') goalPlaced = true;
        this._decoFlag.setVisible(!goalPlaced);
      }
      var tip = WB.ui.flash || (WB.ui.running ? '正在跑' : (WB.ui.previewDone ? '跑完了，可以去觉察' : '前两格安全 · 摆起点、陷阱、金币、终点'));
      reword(this.flashLab, tip);
    },
    update: function (dt) {
      this._t += dt;
      if (this._heartNow) {
        this._heartNow.setOpacity(190 + Math.floor(65 * (0.5 + 0.5 * Math.sin(this._t * 5))));
      }
      driftClouds(this._sky, this._t);
      this._syncMarks();
      if (!WB.ui.running) {
        if (!WB.ui.previewDone) this.ninja.setPosition(28, EDIT.gy);
        stepNinja(this.ninja, dt, false, true);
        return;
      }
      var rt = Date.now() / 1000 - WB.ui.runT0;
      var P = 6;
      var span = Math.max(36, (this._cols || STORE.MC) * (this._cw || EDIT.cw) - 36);
      var x = 28 + Math.min(rt, P) / P * span;
      this.ninja.setPosition(x, EDIT.gy);
      if (this._setPan) this._setPan(x - (this._viewW || 400) * 0.35);
      stepNinja(this.ninja, dt, false, rt >= P);
      /* §8: 跑道中点自动切到「设置」段 + 短过渡 */
      if (rt >= P * 0.5 && !WB.ui.midSwitchArmed) {
        WB.ui.midSwitchArmed = true;
        WB.ui.midSwitchAt = Date.now() / 1000 + 0.45;
        WB.ui.flash = '中点切换 · 进入单关设置…';
      }
      if (WB.ui.midSwitchAt && Date.now() / 1000 >= WB.ui.midSwitchAt) {
        WB.ui.midSwitchAt = 0;
        WB.ui.running = false;
        WB.ui.previewDone = true;
        later(function () { show(1); });
        return;
      }
      if (rt >= P) {
        WB.ui.running = false;
        WB.ui.previewDone = true;
        WB.ui.flash = '跑完了';
      }
    }
  });

  /* ---------- 觉察 ---------- */
  var ReflectLayer = cc.Layer.extend({
    ctor: function () {
      this._super();
      WB.sceneName = 'reflect';
      addChrome(this, 4);
      ART.fill(this, ART.tex.night, 0);
      words(this, '玩完问一句', W / 2, 458, 26, '#ffe7a0', 8);
      ART.panel(this, 250, 270, 450, 330, ccColor(18, 26, 58), 235, 2, 18);
      ART.frame(this, 250, 270, 450, 330, cc.color(255, 255, 255), 70, 3, 18);
      ART.panel(this, 724, 270, 430, 330, ccColor(18, 26, 58), 235, 2, 18);
      ART.frame(this, 724, 270, 430, 330, cc.color(255, 255, 255), 70, 3, 18);

      words(this, '我摆的一小关', 250, 400, 20, '#ffe7a0', 6);
      var colsR = (WB.data.map && WB.data.map.length) || STORE.MC;
      var L = 46, cw = Math.max(14, Math.min(34, Math.floor(400 / colsR))), gy = 250;
      ART.panel(this, L + colsR * cw / 2, gy + 18, colsR * cw + 18, 108, ccColor(0, 0, 0), 55, 3, 10);
      var bands = [[0, 3, ccColor(78, 168, 92, 80)], [3, 7, ccColor(230, 194, 0, 80)], [7, 10, ccColor(226, 121, 59, 80)], [10, 12, ccColor(226, 59, 59, 80)]];
      bands.forEach(function (b) {
        plate(this, L + b[0] * cw, gy + 4, (b[1] - b[0]) * cw, 70, b[1] ? b[2] : b[2], 4);
      }, this);
      ART.addGround(this, L, gy, colsR * cw, 5, 1);
      var hearts = STORE.mEst(WB.data.map, WB.data.mp);
      var tot = hearts.reduce(function (a, b) { return a + b; }, 0);
      var placed = 0;
      var x, k, px, sp;
      for (x = 0; x < colsR; x++) {
        k = WB.data.map[x];
        px = L + (x + 0.5) * cw;
        if (k === 'spike') {
          sp = new cc.Sprite(ART.tex.spike);
          sp.setAnchorPoint(0.5, 0);
          sp.setScale(0.4);
          sp.setPosition(px, gy);
          this.addChild(sp, 8);
          placed++;
        } else if (k === 'fire') {
          sp = new cc.Sprite(ART.tex.fire);
          sp.setAnchorPoint(0.5, 0);
          sp.setScale(0.48);
          sp.setPosition(px, gy);
          this.addChild(sp, 8);
          placed++;
        } else if (k === 'start') {
          words(this, '起', px, gy + 28, 13, '#9ff0a8', 9);
          placed++;
        } else if (k === 'goal') {
          sp = new cc.Sprite(ART.tex.flag);
          sp.setAnchorPoint(0.5, 0);
          sp.setScale(0.35);
          sp.setPosition(px, gy);
          this.addChild(sp, 8);
          placed++;
        } else if (k === 'coin' || k === 'coinBig' || k === 'chest' || k === 'spring' || k === 'mist' || k === 'rock' || k === 'electric' || k === 'groove') {
          var texR = ART.tex[k === 'coinBig' ? 'coinBig' : k] || ART.tex.coin || ART.tex.rock;
          sp = new cc.Sprite(texR);
          sp.setAnchorPoint(0.5, 0);
          sp.setScale(0.42);
          sp.setPosition(px, gy + ((k === 'coin' || k === 'coinBig' || k === 'chest') ? 8 : 0));
          this.addChild(sp, 8);
          placed++;
        }
        if (k && STORE.isTrap(k)) {
          words(this, hearts[x] ? ('-' + hearts[x]) : '过', px, gy + 58, 12, hearts[x] ? '#ff8a8a' : '#9ff0a8', 9);
        }
      }
      this.mini = addNinja(this, L + cw * 0.7, gy, 52, 10);
      if (!placed) words(this, '还没摆东西', 250, 330, 16, '#ffffff', 9);
      ART.place(this, ART.tex.heart, 168, 168, { h: 26, z: 8 });
      words(this, '一共预计掉 ' + tot + '❤', 280, 168, 18, '#ffb4b4', 8);
      words(this, WB.ui.previewDone ? '已经跑过一次' : '可以先回去跑一次', 250, 136, 14, '#c9c3ef', 8);

      words(this, '和预计一样吗？', 724, 400, 20, '#ffe7a0', 6);
      ['一样', '更难', '更简单'].forEach(function (name, i) {
        var on = WB.data.expect === name;
        button(this, name, 560 + i * 140, 348, 126, 42, on ? GOLD : NAVY, on ? INK : WHITE, function () {
          WB.data.expect = name;
          STORE.save(localStorage, WB.data);
          later(function () { show(4); });
        });
      }, this);
      words(this, '再选一句（可选）', 724, 300, 15, '#c9c3ef', 6);
      var extras = [['best_fun', '摆刺最好玩'], ['hardest', '频率最难调'], ['add_one', '下次加金币']];
      extras.forEach(function (pair, i) {
        var on = WB.data[pair[0]] === pair[1];
        button(this, pair[1], 724, 252 - i * 48, 220, 40, on ? GOLD : NAVY, on ? INK : WHITE, function () {
          WB.data[pair[0]] = pair[1];
          STORE.save(localStorage, WB.data);
          later(function () { show(4); });
        });
      }, this);
      var note = WB.data.expect ? ('记下了：' + WB.data.expect) : '点一个就行';
      words(this, note, 724, 120, 16, '#9ff0a8', 8);

      button(this, '回关卡', isPhoneShell() ? 90 : 110, 30, isPhoneShell() ? 100 : 130, isPhoneShell() ? 40 : 44, NAVY, WHITE, function () { later(function () { show((WB.ui.ldStep | 0) || 2); }); });
      button(this, '联机游玩', isPhoneShell() ? 300 : 360, 32, isPhoneShell() ? 140 : 160, isPhoneShell() ? 48 : 48, GOLD, INK, function () {
        goPlayLevel9(true);
      });
      button(this, '去听选', isPhoneShell() ? 520 : 560, 32, isPhoneShell() ? 120 : 140, isPhoneShell() ? 48 : 46, NAVY, WHITE, function () {
        later(function () { show(5); });
      });
      button(this, '去玩这一关', isPhoneShell() ? 760 : 800, 32, isPhoneShell() ? 200 : 200, isPhoneShell() ? 50 : 48, GREEN, WHITE, function () {
        goPlayLevel9(false);
      });
      this._t = 0;
      this.scheduleUpdate();
      return true;
    },
    update: function (dt) {
      this._t += dt;
      if (this.mini) {
        var y = 250 + Math.sin(this._t * 2) * 3;
        this.mini.setPosition(this.mini.getPositionX(), y);
      }
    }
  });


  /* ---------- 关联 · BGM↔九关（切片4：可挂可清可听） ---------- */
  var LinkLayer = cc.Layer.extend({
    ctor: function () {
      this._super();
      WB.sceneName = 'link';
      addChrome(this, 3);
      ART.fill(this, ART.tex.night, 0);
      var AUDIO = window.WBAudio || null;
      if (!WB.data.levelAudio) WB.data.levelAudio = AUDIO && AUDIO.blankLevelAudio ? AUDIO.blankLevelAudio() : {};
      if (!WB.ui.linkTrack) {
        WB.ui.linkTrack = (WB.data.audio && WB.data.audio.bgmId) || WB.data.music || 'explore';
      }
      var track = WB.ui.linkTrack;
      var la = AUDIO && AUDIO.normalizeLevelAudio
        ? AUDIO.normalizeLevelAudio(WB.data.levelAudio)
        : (WB.data.levelAudio || {});
      WB.data.levelAudio = la;

      /* 标题在二级条（H-52≈488）下方留空，横屏不挤不叠 */
      var phoneL = isPhoneShell();
      var landL = false;
      try { landL = window.innerWidth > window.innerHeight && window.innerHeight < 520; } catch (eLL) {}
      var titleY = phoneL ? (landL ? 418 : 424) : 436;
      var subY = phoneL ? (landL ? 396 : 402) : 412;
      words(this, '关联 · BGM ↔ 九关', W / 2, titleY, phoneL && landL ? 16 : 18, '#ffe7a0', 8);
      words(this, phoneL && landL ? '点心情曲可听 · 再点关卡挂/清 · 未挂回退全局 · 禁 Mixkit' : '先点心情曲（可听），再点关卡挂上/清掉 · 未挂试玩回退全局曲 · 禁 Mixkit', W / 2, subY, phoneL && landL ? 11 : 12, '#c9c3ef', 8);
      var panelCy = phoneL && landL ? 238 : 248;
      var panelH = phoneL && landL ? 268 : 280;
      ART.panel(this, W / 2, panelCy, 900, panelH, ccColor(18, 26, 58), 235, 2, 18);
      ART.frame(this, W / 2, panelCy, 900, panelH, cc.color(255, 224, 122), 120, 3, 18);

      var tracks = AUDIO && AUDIO.BGM ? AUDIO.BGM : [
        { id: 'explore', name: '探险' }, { id: 'tense', name: '紧张' },
        { id: 'win', name: '过关' }, { id: 'fail', name: '失败' }
      ];
      var self = this;
      function shortOf(id) {
        return AUDIO && AUDIO.shortBgm ? AUDIO.shortBgm(id) : ({ explore: '探', tense: '紧', win: '过', fail: '败' }[id] || '');
      }
      function persist(msg) {
        STORE.save(localStorage, WB.data);
        if (msg) WB.ui.flash = msg;
        later(function () { show(3); });
      }
      var trackY = phoneL && landL ? 360 : 368;
      tracks.forEach(function (t, i) {
        var on = track === t.id;
        var cx = 130 + i * 200;
        button(self, (on ? '● ' : '') + t.name, cx, trackY, 170, phoneL && landL ? 32 : 36, on ? GOLD : NAVY, on ? INK : WHITE, function () {
          WB.ui.linkTrack = t.id;
          if (AUDIO) {
            try { AUDIO.unlock(); AUDIO.playBgm(t.id, true); } catch (eA) {}
          }
          WB.ui.flash = '试听/选中：' + t.name + ' · 再点下方关卡挂上';
          later(function () { show(3); });
        });
      });

      var globalCur = (WB.data.audio && WB.data.audio.bgmId) || WB.data.music || 'explore';
      words(this, '选中曲：' + track + '　全局回退：' + globalCur, W / 2, phoneL && landL ? 322 : 330, 13, '#9ff0a8', 8);

      var i;
      for (i = 1; i <= 9; i++) {
        (function (n) {
          var bound = la[String(n)] && la[String(n)].bgmId;
          var label = (n === 9 ? '第9·我的' : ('第' + n + '关'));
          if (bound) label += '·' + shortOf(bound);
          else label += '·未挂';
          var cx = 90 + ((n - 1) % 5) * 170;
          var cy = n <= 5 ? (phoneL && landL ? 276 : 282) : (phoneL && landL ? 222 : 226);
          var onSame = bound === track;
          button(self, label, cx, cy, 155, 40, onSame ? GREEN : (bound ? GOLD : NAVY), onSame || bound ? INK : WHITE, function () {
            if (!WB.data.levelAudio) WB.data.levelAudio = {};
            if (bound === track) {
              if (AUDIO && AUDIO.setLevelBgm) WB.data.levelAudio = AUDIO.setLevelBgm(WB.data.levelAudio, n, null);
              else delete WB.data.levelAudio[String(n)];
              persist('已清除第' + n + '关挂曲（试玩回退全局）');
            } else {
              if (AUDIO && AUDIO.setLevelBgm) WB.data.levelAudio = AUDIO.setLevelBgm(WB.data.levelAudio, n, track);
              else {
                WB.data.levelAudio[String(n)] = { bgmId: track, sfxPreset: null };
              }
              persist('第' + n + '关 → ' + track);
            }
          });
        })(i);
      }

      button(self, '全挂当前', 200, 175, 140, 34, NAVY, WHITE, function () {
        if (AUDIO && AUDIO.bindTrackToLevels) {
          WB.data.levelAudio = AUDIO.bindTrackToLevels({}, track, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
        } else {
          var m = {};
          for (var n = 1; n <= 9; n++) m[String(n)] = { bgmId: track, sfxPreset: null };
          WB.data.levelAudio = m;
        }
        persist('九关均挂：' + track);
      });
      button(self, '清空挂载', 360, 175, 140, 34, ccColor(120, 48, 48), WHITE, function () {
        WB.data.levelAudio = AUDIO && AUDIO.clearAllLevelBgm ? AUDIO.clearAllLevelBgm() : {};
        persist('已清空全部关卡挂曲');
      });
      button(self, '试听走路', 520, 175, 140, 34, NAVY, WHITE, function () {
        if (AUDIO) { try { AUDIO.unlock(); AUDIO.playSfx('walk', true); } catch (eW) {} }
        WB.ui.flash = '走路声（Kenney）';
        later(function () { show(3); });
      });
      button(self, '试听砍击', 680, 175, 140, 34, NAVY, WHITE, function () {
        if (AUDIO) { try { AUDIO.unlock(); AUDIO.playSfx('slash', true); } catch (eS) {} }
        WB.ui.flash = '砍击声（Kenney hit）';
        later(function () { show(3); });
      });

      words(this, WB.ui.flash || '点关卡：挂选中曲 / 再点同曲清除 · 署名 Kevin MacLeod / Kenney', W / 2, 135, 12, '#ffe7a0', 8);
      addFootTrio(this,
        '回摆关', function () { later(function () { show(2); }); },
        '去⑥听选', function () { later(function () { show(5); }); },
        '去玩第9关', function () {
          STORE.save(localStorage, WB.data);
          goPlayLevel9(false);
        }
      );
      return true;
    }
  });


  /* ---------- ⑥ 听选音频 ---------- */
  var AudioLayer = cc.Layer.extend({
    ctor: function () {
      this._super();
      WB.sceneName = 'audio';
      addChrome(this, 5);
      ART.fill(this, ART.tex.night, 0);
      words(this, '⑥ 听选音频 · 先听后选', W / 2, 470, 22, '#ffe7a0', 8);
      words(this, '点心情先听后选全局曲 · 挂九关请去「关联」· Kevin MacLeod / Kenney · 禁 Mixkit', W / 2, 438, 12, '#c9c3ef', 8);
      ART.panel(this, W / 2, 290, 860, 280, ccColor(18, 26, 58), 235, 2, 18);
      ART.frame(this, W / 2, 290, 860, 280, cc.color(255, 255, 255), 70, 3, 18);
      var AUDIO = window.WBAudio || null;
      var tracks = AUDIO && AUDIO.BGM ? AUDIO.BGM.map(function (b) {
        return { id: b.id, name: b.name };
      }) : [
        { id: 'explore', name: '探险' },
        { id: 'tense', name: '紧张' },
        { id: 'win', name: '过关' },
        { id: 'fail', name: '失败' }
      ];
      var cur = '';
      if (WB.data && WB.data.audio && WB.data.audio.bgmId) cur = WB.data.audio.bgmId;
      else if (WB.data && WB.data.music) cur = WB.data.music;
      var self = this;
      tracks.forEach(function (t, i) {
        var on = cur === t.id;
        var col = i % 2;
        var row = (i / 2) | 0;
        var cx = 280 + col * 400;
        var cy = 360 - row * 70;
        button(self, (on ? '✓ ' : '') + t.name, cx, cy, 280, 48, on ? GOLD : NAVY, on ? INK : WHITE, function () {
          WB.data.music = t.id;
          if (!WB.data.audio) WB.data.audio = AUDIO && AUDIO.blankAudio ? AUDIO.blankAudio() : { bgmId: t.id, sfx: {} };
          WB.data.audio.bgmId = t.id;
          STORE.save(localStorage, WB.data);
          if (AUDIO) {
            try { AUDIO.unlock(); AUDIO.setBgm(t.id); } catch (eA) {}
          }
          WB.ui.flash = '已选：' + t.name;
          later(function () { show(5); });
        });
      });
      if (!WB.data.levelAudio) WB.data.levelAudio = AUDIO && AUDIO.blankLevelAudio ? AUDIO.blankLevelAudio() : {};
      var la9 = WB.data.levelAudio['9'] && WB.data.levelAudio['9'].bgmId;
      button(self, la9 ? ('第9关·' + la9 + '·点清') : '挂到第9关', 220, 220, 200, 36, la9 ? GREEN : NAVY, WHITE, function () {
        if (!cur) { WB.ui.flash = '先选一首心情曲'; later(function () { show(5); }); return; }
        if (!WB.data.levelAudio) WB.data.levelAudio = {};
        if (la9 === cur) {
          if (AUDIO && AUDIO.setLevelBgm) WB.data.levelAudio = AUDIO.setLevelBgm(WB.data.levelAudio, 9, null);
          else delete WB.data.levelAudio['9'];
          WB.ui.flash = '已清第9关挂曲';
        } else {
          if (AUDIO && AUDIO.setLevelBgm) WB.data.levelAudio = AUDIO.setLevelBgm(WB.data.levelAudio, 9, cur);
          else WB.data.levelAudio['9'] = { bgmId: cur, sfxPreset: null };
          WB.ui.flash = '第9关 → ' + cur;
        }
        STORE.save(localStorage, WB.data);
        later(function () { show(5); });
      });
      button(self, '去关联九关', 440, 220, 160, 36, GOLD, INK, function () { later(function () { show(3); }); });
      button(self, '试听走路', 620, 220, 120, 36, NAVY, WHITE, function () {
        if (AUDIO) try { AUDIO.unlock(); AUDIO.playSfx('walk', true); } catch (eW) {}
      });
      button(self, '试听砍击', 760, 220, 120, 36, NAVY, WHITE, function () {
        if (AUDIO) try { AUDIO.unlock(); AUDIO.playSfx('slash', true); } catch (eS) {}
      });
      var pick = cur ? ('已选全局：' + cur) : '还没选曲';
      if (WB.ui.flash) pick = WB.ui.flash;
      words(this, pick, W / 2, 175, 15, '#9ff0a8', 8);
      words(this, '音乐 Kevin MacLeod · CC BY 3.0｜音效 Kenney · CC0｜详见 audio/SOURCES.md', W / 2, 148, 12, '#8f88b8', 8);
      addFootTrio(this,
        '回觉察', function () { later(function () { show(4); }); },
        '打开喇叭', function () { try { if (window.VW && VW.openMusic) VW.openMusic(); } catch (e) {} },
        '去玩这一关', function () {
          STORE.save(localStorage, WB.data);
          goPlayLevel9(false);
        }
      );
      return true;
    }
  });


  /* ---------- 觉察前置闸门场景 ---------- */
  var GateLayer = cc.Layer.extend({
    ctor: function () {
      this._super();
      WB.sceneName = 'gate';
      var pending = WB.ui.gatePending;
      if (pending == null || !isDesignStep(pending)) pending = 2;
      WB.ui.gatePending = pending;
      addChrome(this, pending, { gate: true });
      ART.fill(this, ART.tex.night, 0);

      var phone = isPhoneShell();
      var land = false;
      try { land = window.innerWidth > window.innerHeight && window.innerHeight < 520; } catch (eL) {}
      var qi = WB.ui.gateQ | 0;
      if (qi < 0) qi = 0;
      if (qi >= GATE_QS.length) qi = GATE_QS.length - 1;
      WB.ui.gateQ = qi;
      var spec = GATE_QS[qi];
      var picks = WB.ui.gatePicks || (WB.ui.gatePicks = [null, null, null]);

      /* 金句放在顶栏板下方，不与四芯片/二级条抢行 */
      words(this, '小宇：伍澍暘，先想清楚，再动手摆关', W / 2, phone && land ? 448 : 458, phone ? 15 : 18, '#ffe7a0', 8);
      words(this, '觉察前置 · 第 ' + (qi + 1) + ' / ' + GATE_QS.length + ' 问 · 答对才能进关卡设计', W / 2, phone && land ? 418 : 428, phone ? 12 : 14, '#c9c3ef', 8);

      ART.panel(this, W / 2, phone && land ? 250 : 268, phone ? 900 : 860, phone && land ? 230 : 260, ccColor(18, 26, 58), 235, 2, 18);
      ART.frame(this, W / 2, phone && land ? 250 : 268, phone ? 900 : 860, phone && land ? 230 : 260, cc.color(255, 224, 122), 120, 3, 18);

      words(this, spec.q, W / 2, phone && land ? 340 : 360, phone ? 17 : 20, '#ffffff', 8);

      var self = this;
      var baseY = phone && land ? 280 : 292;
      spec.opts.forEach(function (opt, i) {
        var on = picks[qi] === opt.id;
        var bg = NAVY;
        var fg = WHITE;
        if (on && opt.ok) { bg = GREEN; fg = WHITE; }
        else if (on && !opt.ok) { bg = ccColor(180, 72, 72); fg = WHITE; }
        button(self, opt.t, W / 2, baseY - i * (phone && land ? 48 : 56), phone ? 720 : 640, phone && land ? 42 : 48, bg, fg, function () {
          picks[qi] = opt.id;
          WB.ui.gatePicks = picks;
          if (opt.ok) {
            WB.ui.gateFlash = '小宇：对，就是这样。';
            if (qi >= GATE_QS.length - 1) {
              markGatePassed();
              WB.ui.gateFlash = '小宇：想清楚了，进关卡设计吧。';
              later(function () { show(WB.ui.gatePending | 0); });
              return;
            }
            later(function () {
              WB.ui.gateQ = qi + 1;
              WB.ui.gateFlash = '小宇：下一问。';
              runGateScene();
            });
          } else {
            WB.ui.gateFlash = '小宇：再看一眼——' + spec.hint;
            later(function () { runGateScene(); });
          }
        });
      });

      var flash = WB.ui.gateFlash || '点一张最合适的答案；错了可以再选。';
      words(this, flash, W / 2, phone && land ? 130 : 140, phone ? 13 : 15, '#9ff0a8', 8);

      button(this, '回看图', phone ? 110 : 130, 30, phone ? 120 : 140, phone ? 40 : 44, NAVY, WHITE, function () {
        later(function () { show(0); });
      });
      button(this, '再想想', phone ? 320 : 360, 30, phone ? 120 : 140, phone ? 40 : 44, NAVY, WHITE, function () {
        picks[qi] = null;
        WB.ui.gatePicks = picks;
        WB.ui.gateFlash = '小宇：不着急，慢慢想。';
        later(function () { runGateScene(); });
      });
      button(this, '去玩后觉察', phone ? 760 : 800, 30, phone ? 180 : 200, phone ? 40 : 44, NAVY, WHITE, function () {
        later(function () { show(4); });
      });
      return true;
    }
  });

  var GateScene = cc.Scene.extend({ onEnter: function () { this._super(); this.addChild(new GateLayer()); } });


  var LookScene = cc.Scene.extend({ onEnter: function () { this._super(); this.addChild(new LookLayer()); } });
  var FreqScene = cc.Scene.extend({ onEnter: function () { this._super(); this.addChild(new FreqLayer()); } });
  var EditScene = cc.Scene.extend({ onEnter: function () { this._super(); this.addChild(new EditLayer()); } });
  var LinkScene = cc.Scene.extend({ onEnter: function () { this._super(); this.addChild(new LinkLayer()); } });
  var ReflectScene = cc.Scene.extend({ onEnter: function () { this._super(); this.addChild(new ReflectLayer()); } });
  var AudioScene = cc.Scene.extend({ onEnter: function () { this._super(); this.addChild(new AudioLayer()); } });


  /* HTML drawer bridge (visual workbench) */
  window.VW = window.VW || {};
  VW.refreshShop = function () {
    var el = document.getElementById('shopList');
    var walEl = document.getElementById('shopWallet');
    if (!el || !WB.data) return;
    var wal = WB.data.wallet || { coins: 0, weapons: [], equipped: null };
    var shopOpen = !STORE.weaponShopOpen || STORE.weaponShopOpen(WB.data.levelId | 0);
    if (walEl) walEl.textContent = shopOpen ? ('金币 ' + (wal.coins | 0)) : '第4关才用积分买武器';
    el.innerHTML = '';
    if (!shopOpen) {
      var locked = document.createElement('p');
      locked.className = 'hint';
      locked.textContent = '武器在第4关解锁。这一关先摆零件、试玩。';
      el.appendChild(locked);
      return;
    }
    ['dart', 'blade', 'gun'].forEach(function (id) {
      var spec = STORE.WEAPONS[id];
      var owned = wal.weapons.indexOf(id) >= 0;
      var on = wal.equipped === id;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'item' + (on ? ' on' : '');
      b.innerHTML = spec.name + (on ? ' · 使用中' : owned ? ' · 点击装备' : '') +
        '<span class="price">' + (owned ? '已拥有' : ('价格 ' + spec.price)) + '</span>';
      b.onclick = function () {
        var res = STORE.buy(WB.data, id);
        WB.ui.flash = res.flash || '';
        if (res.ok) STORE.save(localStorage, WB.data);
        VW.refreshShop();
        if (WB.ui.step === 1) later(function () { show(1); });
        else if (isDesignStep(WB.ui.step)) later(function () { show(WB.ui.step | 0); });
      };
      el.appendChild(b);
    });
  };
  VW.refreshMusic = function () {
    var el = document.getElementById('musicList');
    var pick = document.getElementById('musicPick');
    var credit = document.getElementById('musicCredit');
    var levelsEl = document.getElementById('musicLevels');
    var sfxEl = document.getElementById('musicSfx');
    if (!el) return;
    var AUDIO = window.WBAudio || null;
    var tracks = (STORE.BGM_POOL && STORE.BGM_POOL.length) ? STORE.BGM_POOL.map(function (b) {
      return { id: b.id, name: b.name, fileId: b.fileId, stub: false };
    }) : (AUDIO && AUDIO.BGM ? AUDIO.BGM.map(function (b) {
      return { id: b.id, name: b.name, fileId: b.id, stub: false };
    }) : [
      { id: 'explore', name: '探险', stub: true },
      { id: 'tense', name: '紧张', stub: true },
      { id: 'win', name: '过关', stub: true },
      { id: 'fail', name: '失败', stub: true }
    ]);
    var cur = (WB.data && WB.data.bgmId) || '';
    if (!cur && WB.data && WB.data.audio && WB.data.audio.bgmId) cur = WB.data.audio.bgmId;
    else if (!cur && WB.data && WB.data.music) cur = WB.data.music;
    if (!WB.data.levelAudio) WB.data.levelAudio = AUDIO && AUDIO.blankLevelAudio ? AUDIO.blankLevelAudio() : {};
    var la = AUDIO && AUDIO.normalizeLevelAudio ? AUDIO.normalizeLevelAudio(WB.data.levelAudio) : (WB.data.levelAudio || {});
    WB.data.levelAudio = la;
    el.innerHTML = '';
    tracks.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'item' + (cur === t.id ? ' on' : '');
      var nHang = AUDIO && AUDIO.levelsForTrack ? AUDIO.levelsForTrack(la, t.id).length : 0;
      b.innerHTML = t.name + '<span class="price">' + (t.stub ? '占位' : ('试听/选用' + (nHang ? (' · 已挂' + nHang) : ''))) + '</span>';
      b.onclick = function () {
        var fileId = t.fileId || t.id;
        WB.data.bgmId = t.id;
        WB.data.music = fileId;
        if (!WB.data.audio) WB.data.audio = AUDIO && AUDIO.blankAudio ? AUDIO.blankAudio() : { bgmId: fileId, sfx: {} };
        WB.data.audio.bgmId = fileId;
        WB.ui.linkTrack = t.id;
        STORE.save(localStorage, WB.data);
        if (AUDIO) {
          try { AUDIO.unlock(); AUDIO.setBgm(t.id); } catch (e) {}
        }
        if (pick) pick.textContent = '已选：' + t.name + ' · 下方可挂九关';
        VW.refreshMusic();
      };
      el.appendChild(b);
    });
    if (levelsEl) {
      levelsEl.innerHTML = '';
      var hint = document.createElement('p');
      hint.className = 'hint';
      hint.textContent = '挂到哪几关（当前曲 ' + (cur || '未选') + '；未挂则试玩回退全局曲）';
      levelsEl.appendChild(hint);
      var row = document.createElement('div');
      row.className = 'row';
      var n;
      for (n = 1; n <= 9; n++) {
        (function (lv) {
          var bound = la[String(lv)] && la[String(lv)].bgmId;
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'item' + (bound === cur ? ' on' : '');
          btn.style.minWidth = '72px';
          btn.textContent = (lv === 9 ? '第9·我的' : ('第' + lv)) + (bound ? ('·' + (AUDIO && AUDIO.shortBgm ? AUDIO.shortBgm(bound) : bound)) : '·未挂');
          btn.onclick = function () {
            if (!cur) { if (pick) pick.textContent = '先选一首心情曲'; return; }
            if (bound === cur) {
              if (AUDIO && AUDIO.setLevelBgm) WB.data.levelAudio = AUDIO.setLevelBgm(WB.data.levelAudio, lv, null);
              else delete WB.data.levelAudio[String(lv)];
            } else {
              if (AUDIO && AUDIO.setLevelBgm) WB.data.levelAudio = AUDIO.setLevelBgm(WB.data.levelAudio, lv, cur);
              else WB.data.levelAudio[String(lv)] = { bgmId: cur, sfxPreset: null };
            }
            STORE.save(localStorage, WB.data);
            VW.refreshMusic();
          };
          row.appendChild(btn);
        })(n);
      }
      levelsEl.appendChild(row);
    }
    if (sfxEl) {
      sfxEl.innerHTML = '';
      [['walk', '试听走路'], ['slash', '试听砍击']].forEach(function (pair) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'item';
        b.textContent = pair[1];
        b.onclick = function () {
          if (AUDIO) try { AUDIO.unlock(); AUDIO.playSfx(pair[0], true); } catch (eS) {}
        };
        sfxEl.appendChild(b);
      });
    }
    if (pick) {
      var found = tracks.filter(function (tr) { return tr.id === cur; })[0];
      pick.textContent = found ? ('已选：' + found.name) : '还没选曲';
    }
    if (credit && AUDIO && AUDIO.CREDITS) {
      credit.innerHTML = AUDIO.CREDITS.lineZh + '<br>详见 audio/SOURCES.md · 不用 Mixkit';
    }
  };
  VW.openMusic = function () {
    if (VW._openMusicDrawer) VW._openMusicDrawer();
    else {
      var d = document.getElementById('drawerMusic');
      var m = document.getElementById('drawerMask');
      if (d && m) { m.classList.add('open'); d.classList.add('open'); VW.refreshMusic(); }
    }
  };
  VW.refreshBuddy = function () {
    var n = 0;
    try { n = +(localStorage.getItem('vw-likes') || '0') | 0; } catch (e) {}
    var el = document.getElementById('likeCount');
    if (el) el.textContent = String(n);
  };
  document.addEventListener('DOMContentLoaded', function () {
    var like = document.getElementById('btnLike');
    if (like) like.onclick = function () {
      var n = 0;
      try { n = +(localStorage.getItem('vw-likes') || '0') | 0; } catch (e) {}
      n++;
      try { localStorage.setItem('vw-likes', String(n)); } catch (e2) {}
      VW.refreshBuddy();
    };
  });

  function boot() {
    if (typeof cc === 'undefined' || !window.WBStore || !window.WBArt) {
      bootMsg('引擎没加载上，请刷新', true);
      return;
    }
    window.addEventListener('error', function (e) { bootMsg(e.message || String(e), true); });
    var q = new URLSearchParams(location.search);
    var sceneN = parseInt(q.get('scene') || '', 10);
    if (sceneN >= 1 && sceneN <= ((STORE && STORE.SCENE_COUNT) || 5) && STORE.applyLevel) {
      try { STORE.applyLevel(localStorage, sceneN); } catch (eScene) {}
    } else if (q.get('open') === 'my1' && STORE.applyMyFirst) {
      try { STORE.applyMyFirst(localStorage); } catch (eOpen) {}
    }
    WB.data = STORE.load(localStorage);
    if (STORE.ensureLongRunway) STORE.ensureLongRunway(WB.data, 24);
    if (STORE.ensureDefaultMap) STORE.ensureDefaultMap(WB.data);
    var lesson = q.get('lesson') || 'tonight';
    var step = q.get('step');
    if (step == null || step === '') step = (q.get('open') === 'my1' || (sceneN >= 1 && sceneN <= 5)) ? 2 : 0;
    else step = +step;
    if (lesson !== 'tonight') step = 0;
    if (isNaN(step)) step = 0;
    WB.ui.step = Math.max(0, Math.min(5, step));
    if (q.get('look') === '1') WB.ui.look = 1;
    cc.game.onStart = function () {
      try {

        function makeSlotPolicy() {
          try {
            return new cc.ResolutionPolicy(cc.ContainerStrategy.EQUAL_TO_FRAME, cc.ContentStrategy.SHOW_ALL);
          } catch (e) {
            return cc.ResolutionPolicy.SHOW_ALL;
          }
        }
        var slotPolicy = makeSlotPolicy();
        cc.view.enableRetina(false);
        cc.view.adjustViewPort(true);
        cc.view.setDesignResolutionSize(W, H, slotPolicy);
        cc.view.resizeWithBrowserSize(true);

        if (cc.director.setClearColor) cc.director.setClearColor(cc.color(15, 18, 48, 255));
        var fitCanvasInSlot = function (forcePolicy) {
          var c = document.getElementById('gameCanvas');
          var cont = document.getElementById('Cocos2dGameContainer');
          if (!c) return;
          var slot = null;
          if (cont && cont.parentNode) slot = cont.parentNode;
          else if (c.parentNode && c.parentNode.id === 'Cocos2dGameContainer') slot = c.parentNode.parentNode;
          else slot = c.parentNode;
          if (slot && slot.classList && slot.classList.contains('canvas-slot')) {
            try { cc.view._frame = slot; } catch (eF) {}
          }
          if (forcePolicy && cc.view && cc.view._originalDesignResolutionSize) {
            var od = cc.view._originalDesignResolutionSize;
            if (od.width > 0) {
              try {
                cc.view.setDesignResolutionSize(od.width, od.height, makeSlotPolicy());
              } catch (eP) {}
            }
          }
          /* Never viewport-fixed — stay inside .canvas-slot / phone bezel */
          c.style.position = 'absolute';
          c.style.left = '0px';
          c.style.top = '0px';
          c.style.right = 'auto';
          c.style.bottom = 'auto';
          c.style.margin = '0';
          if (cont) {
            cont.style.position = 'absolute';
            cont.style.left = '0px';
            cont.style.top = '0px';
            cont.style.right = 'auto';
            cont.style.bottom = 'auto';
            cont.style.margin = '0';
            cont.style.padding = '0';
            cont.style.transform = 'none';
            cont.style.webkitTransform = 'none';
            if (slot && slot.classList && slot.classList.contains('canvas-slot')) {
              var sw = slot.clientWidth | 0;
              var sh = slot.clientHeight | 0;
              if (sw > 40 && sh > 40) {
                cont.style.width = sw + 'px';
                cont.style.height = sh + 'px';
                c.style.width = sw + 'px';
                c.style.height = sh + 'px';
              }
            }
          }
        };
        window.__wbFitCanvas = fitCanvasInSlot;
        cc.view.setResizeCallback(function () {
          /* Cocos calls this BEFORE re-applying policy; pin after paint */
          setTimeout(function () { fitCanvasInSlot(false); }, 0);
        });
        setTimeout(function () { fitCanvasInSlot(true); }, 0);
        ART.build();
        var res = [
          SP + 'walk_0.png', SP + 'walk_1.png', SP + 'walk_2.png', SP + 'walk_3.png',
          SP + 'idle.png', SP + 'knock_0.png', SP + 'jump_0.png',
          ART.SC + 'dirt-tile.png', ART.SC + 'grass-cap.png'
        ].concat(AV);
        var left = res.length;
        var dirtImg = null, grassImg = null;
        var booted = false;
        function finishBoot() {
          if (booted) return;
          booted = true;
          try { ART.bakeGround(dirtImg, grassImg); } catch (eG) {}
          if (lesson !== 'tonight') {
            var layer = new cc.Layer();
            var scene = new cc.Scene();
            scene.addChild(layer);
            ART.fill(layer, ART.tex.night, 0);
            words(layer, '这一课还没迁进工作台', W / 2, H / 2 + 20, 28, '#ffe7a0', 2);
            words(layer, '今晚关卡工坊已经可以打开', W / 2, H / 2 - 30, 20, '#ffffff', 2);
            button(layer, '打开今晚工坊', W / 2, H / 2 - 90, 240, 52, GREEN, WHITE, function () {
              location.search = '?lesson=tonight&step=0';
            });
            cc.director.runScene(scene);
          } else {
            show(WB.ui.step);
          }
          WB.shell = readShellPref();
          WB.ready = true;
          WB.show = show;
          bootMsg('');
          try {
            if (window.__wbPlaceCanvas) window.__wbPlaceCanvas(window.__wbShell || readShellPref() || 'desktop');
          } catch (ePlace) {}
          setTimeout(function () { if (window.__wbFitCanvas) window.__wbFitCanvas(true); }, 0);
        }
        function tick() {
          left--;
          if (left > 0) return;
          finishBoot();
        }
        setTimeout(function () {
          if (!booted) {
            left = 0;
            finishBoot();
          }
        }, 7000);
        res.forEach(function (src) {
          var img = new Image();
          img.onload = function () {
            try { cc.textureCache.addImage(src); } catch (e1) {}
            if (AV.indexOf(src) >= 0) ART.rememberAvatar(src, img);
            if (src.indexOf('dirt-tile.png') >= 0) dirtImg = img;
            if (src.indexOf('grass-cap.png') >= 0) grassImg = img;
            tick();
          };
          img.onerror = function () { tick(); };
          img.src = src;
        });
      } catch (e) {
        bootMsg('启动失败：' + e, true);
      }
    };
    try { cc.game.run('gameCanvas'); }
    catch (e) { bootMsg('启动失败：' + e, true); }
  }

  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})();
