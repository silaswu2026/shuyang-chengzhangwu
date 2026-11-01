/** AI办学小屋 · 课程3 · 可视化关卡工坊 (deep editor). Same save key as tonight. */
/**
 * 可视化工坊 · 与今晚工作台共用 xygo-custom-level v1.2。
 * vw44: 正式六步 ①→⑥（④装备/⑥听选升格为场景）· vw43 叠字/窄屏壳保留。
 */
(function () {
  var W = 960, H = 540, FOOT = 64, CHROME = 52;
  var SP = '../../../xy-go/sprites/green/';
  var AV = ['../../avatars/xiaoyu.jpg', '../../avatars/dad-wuxin.jpg', '../../avatars/mom-chunyan.jpg'];
  /* Formal L2 six steps (PRODUCT §4): 0看图 1频率 2摆关 3装备 4觉察 5听选. */
  var STEPS = ['①看图', '②频率', '③摆关', '④装备', '⑤觉察', '⑥听选'];
  var STEPS_PHONE = ['①', '②', '③', '④', '⑤', '⑥'];
  var TIP6 = STEPS;
  var TIP6_PHONE = STEPS_PHONE;
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
    ui: { step: 0, look: 0, running: false, runT0: 0, previewDone: false, flash: '', freqDone: false },
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

  function syncStepUrl(step) {
    try {
      var u = new URL(location.href);
      u.searchParams.set('lesson', 'tonight');
      u.searchParams.set('step', String(step));
      history.replaceState(null, '', u.pathname + u.search + u.hash);
    } catch (eU) {}
  }

  function show(step) {
    step = Math.max(0, Math.min(5, step | 0));
    WB.ui.step = step;
    WB.ui.running = false;
    try { if (window.VW && VW.closeDrawers) VW.closeDrawers(); } catch (eC) {}
    if (step >= 2) STORE.save(localStorage, WB.data);
    syncStepUrl(step);
    var scenes = [LookScene, FreqScene, EditScene, EquipScene, ReflectScene, AudioScene];
    cc.director.runScene(new scenes[step]());
    /* Keep shop/audio drawers available inside ④/⑥ without blocking the scene. */
    if (step === 3) later(function () { try { if (window.VW && VW.openShop) VW.openShop(); } catch (eS) {} });
    if (step === 5) later(function () { try { if (window.VW && VW.openMusic) VW.openMusic(); } catch (eM) {} });
  }


  function addTrapChipStrip(parent, tools, y) {
    var phone = isPhoneShell();
    var chipW = phone ? 52 : 64;
    var chipH = phone ? 26 : 28;
    var gap = phone ? 58 : 72;
    var viewX = phone ? 16 : 40;
    var viewW = phone ? 500 : 520;
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
      var on = WB.data.tool === t[0];
      var cx = 8 + i * gap + chipW / 2;
      var cy = (chipH + 20) / 2;
      var bg = on ? GOLD : NAVY;
      var fg = on ? '#222222' : '#ffffff';
      ART.panel(content, cx, cy - 2, chipW, chipH, shade(bg), 255, 0, Math.min(14, chipH / 2));
      ART.panel(content, cx, cy, chipW, chipH, bg, 255, 1, Math.min(14, chipH / 2));
      words(content, t[1], cx, cy, Math.max(13, Math.min(18, Math.floor(chipH * 0.5))), fg, 2);
      chipNodes.push({ id: t[0], x: cx, w: chipW });
    });
    if (phone) words(parent, '←滑→', viewX + viewW - 24, y + 20, 11, '#8f88b8', 32);
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
            WB.data.tool = c.id;
            if (c.id !== 'coin' && c.id !== 'del') WB.data.sel = c.id;
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

  function addChrome(layer, step) {
    ART.fill(layer, ART.tex.night, 0);
    plate(layer, 0, 0, W, FOOT, ccColor(15, 18, 48, 242), 18);
    plate(layer, 0, FOOT - 3, W, 3, ccColor(255, 224, 122, 180), 19);
    plate(layer, 0, H - CHROME, W, CHROME, ccColor(15, 18, 48, 242), 20);
    var slots = isPhoneShell() ? [24, 870, 930] : [28, 890, 940];
    AV.forEach(function (src, i) {
      var face = ART.avatars[src];
      var sp = face ? new cc.Sprite(face) : new cc.Sprite(src);
      sp.setPosition(slots[i], H - 26);
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
    var phone = isPhoneShell();
    var land = false;
    try { land = window.innerWidth > window.innerHeight && window.innerHeight < 520; } catch (eL) {}
    /* Formal six-step nav: chip i ↔ scene i; current = green */
    var labels = phone ? STEPS_PHONE : STEPS;
    var centers = phone
      ? (land ? [78, 168, 258, 348, 438, 528] : [90, 190, 290, 390, 490, 590])
      : [95, 230, 365, 500, 640, 780];
    labels.forEach(function (name, i) {
      var on = i === step;
      var wBtn = phone ? (land ? 72 : 78) : (i === 2 || i === 4 ? 118 : 108);
      button(layer, name, centers[i], H - 26, wBtn, phone ? (land ? 36 : 40) : 34, on ? GREEN : NAVY, WHITE, function () {
        later(function () { show(i); });
      });
    });
    words(layer, land ? '课程3 · 六步' : '课程3 · 可视化工坊 · 六步', W / 2, H - 52, 12, '#a8a0c8', 21);
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
    sp._h = h;
    return sp;
  }

  function stepNinja(sp, dt, hurt, idle) {
    sp._frameT += dt;
    if (sp._frameT < 0.1) return;
    sp._frameT = 0;
    sp._frame = (sp._frame + 1) % 4;
    var path = hurt ? SP + 'knock_0.png' : (idle ? SP + 'idle.png' : SP + 'walk_' + sp._frame + '.png');
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

  /* ---------- 看图 ---------- */
  var LookLayer = cc.Layer.extend({
    ctor: function () {
      this._super();
      WB.sceneName = 'look';
      addChrome(this, 0);
      var page = WB.ui.look;
      if (page === 0) this._hook();
      else this._stop();
      if (page === 1) {
        button(this, '上一句', 150, 32, 160, 44, NAVY, WHITE, function () {
          later(function () { WB.ui.look = 0; show(0); });
        });
      }
      button(this, page === 0 ? '下一句' : '去调频率', 790, 32, 220, 44, GREEN, WHITE, function () {
        later(function () {
          if (WB.ui.look === 0) { WB.ui.look = 1; show(0); }
          else show(1);
        });
      });
      words(this, page === 0 ? '● ○' : '○ ●', 470, 32, 16, '#ffe7a0', 31);
      /* P1: caption band below nav, above icon cards — was y=78 z=31 over 「忘了事/花时间」 */
      words(this, '一句：上钩 → 自己决定停', W / 2, 62, 14, '#e8e4ff', 9);
      this._t = 0;
      this.scheduleUpdate();
      return true;
    },
    _hook: function () {
      var box = { x: 24, y: 108, w: 912, h: 328 };
      this._box = box;
      ART.frame(this, box.x + box.w / 2, box.y + box.h / 2, box.w + 8, box.h + 8, cc.color(110, 200, 255), 220, 1, 16);
      this._water = ART.dressWater(this, box);
      words(this, '上钩＝鱼被钓上钩', W / 2, 458, 26, '#ffe07a', 8);
      words(this, '饵在钩上。鱼咬住，就被拉上去。', W / 2, box.y + box.h - 22, 16, '#ffffff', 8);
      this.line = ART.place(this, ART.tex.pixel, 710, 402, {
        anchor: [0.5, 1], z: 13, color: cc.color(236, 244, 255)
      });
      this.hookSp = ART.place(this, ART.tex.hook, 710, 340, { anchor: [0.5, 1], h: 78, z: 14 });
      this.worm = ART.place(this, ART.tex.worm, 692, 250, { h: 34, z: 15 });
      this.fishShade = ART.place(this, ART.tex.blob, 200, 200, { h: 16, z: 11, opacity: 120 });
      this.fish = ART.place(this, ART.tex.fish, 160, 210, { h: 124, z: 12 });
      this.bubbles = [];
      var i, b;
      for (i = 0; i < 6; i++) {
        b = ART.place(this, ART.tex.bubble, 70 + i * 140, 120, { h: 14 + (i % 3) * 6, z: 3, opacity: 180 });
        b._x = 70 + i * 140;
        b._base = 90 + (i % 3) * 24;
        this.bubbles.push(b);
      }
      this.meta = new cc.Node();
      this.addChild(this.meta, 13);
      ART.panel(this.meta, 250, 332, 430, 108, ccColor(8, 16, 32), 200, 0, 16);
      ART.frame(this.meta, 250, 332, 430, 108, cc.color(255, 224, 122), 160, 1, 16);
      ART.place(this.meta, ART.tex.pad, 78, 332, { h: 64, z: 2 });
      addNinja(this.meta, 160, 286, 84, 3);
      words(this.meta, '进游戏＝被钓上钩', 330, 332, 22, '#9ff0a8', 4);
      this.meta.setVisible(false);
      this._hooked = false;
      var icons = [
        [ART.tex.loop, '一直玩'],
        [ART.tex.head, '忘了事'],
        [ART.tex.clock, '花时间'],
        [ART.tex.coin, '以后还想玩']
      ];
      icons.forEach(function (it, idx) {
        var x = 120 + idx * 200;
        /* raise card row so labels clear the caption band at y≈62 */
        ART.panel(this, x, 132, 150, 72, ccColor(255, 255, 255), 28, 6, 14);
        ART.place(this, it[0], x, 144, { h: 36, z: 7 });
        words(this, it[1], x, 108, 14, '#ffe7a0', 8);
      }, this);
    },
    _stop: function () {
      words(this, '我自己决定停', W / 2, 458, 26, '#ffe07a', 8);
      var box = { x: 24, y: 108, w: 912, h: 328 };
      ART.frame(this, box.x + box.w / 2, box.y + box.h / 2, box.w + 8, box.h + 8, cc.color(110, 200, 255), 160, 1, 16);
      ART.blit(this, ART.tex.night, box.x, box.y, box.w, box.h, 0);
      ART.panel(this, 236, 282, 420, 300, ccColor(0, 0, 0), 80, 1, 18);
      ART.panel(this, 236, 286, 420, 300, ccColor(18, 26, 52), 235, 2, 18);
      ART.panel(this, 236, 390, 380, 70, ccColor(255, 255, 255), 22, 3, 16);
      ART.frame(this, 236, 286, 420, 300, cc.color(255, 150, 150), 210, 4, 18);
      ART.panel(this, 724, 282, 420, 300, ccColor(0, 0, 0), 80, 1, 18);
      ART.panel(this, 724, 286, 420, 300, ccColor(18, 26, 52), 235, 2, 18);
      ART.panel(this, 724, 390, 380, 70, ccColor(255, 255, 255), 22, 3, 16);
      ART.frame(this, 724, 286, 420, 300, cc.color(159, 240, 168), 210, 4, 18);
      ART.place(this, ART.tex.fish, 108, 368, { h: 56, z: 5 });
      ART.place(this, ART.tex.hookMark, 176, 392, { h: 36, z: 6 });
      words(this, '被钓住了', 300, 400, 26, '#ff8a8a', 6);
      var left = ['一直玩不停', '忘了别的事', '花时间、还想再开一局'];
      left.forEach(function (line, i) {
        ART.place(this, ART.tex.hookMark, 86, 332 - i * 52, { h: 26, z: 5 });
        words(this, line, 220, 332 - i * 52, 20, '#ffb4b4', 6);
      }, this);
      ART.place(this, ART.tex.shield, 620, 392, { h: 64, z: 5 });
      words(this, '看懂上钩', 760, 400, 26, '#9ff0a8', 6);
      var right = ['我看见钩子了', '玩够了就停', '我自己决定'];
      right.forEach(function (line, i) {
        ART.place(this, ART.tex.shield, 560, 348 - i * 52, { h: 32, z: 5 });
        words(this, line, 740, 332 - i * 52, 20, '#c8ffd0', 6);
      }, this);
      ART.place(this, ART.tex.blob, 480, 162, { h: 18, z: 16, opacity: 140 });
      this.hero = addNinja(this, 480, 168, 150, 17);
      ART.panel(this, W / 2, 100, 520, 40, ccColor(0, 0, 0), 140, 7, 14);
      words(this, '什么时候停，我自己决定', W / 2, 100, 22, '#ffe07a', 8);
    },
    update: function (dt) {
      this._t += dt;
      if (this.hero) this.hero.setPosition(480, 168 + Math.sin(this._t * 2) * 4);
      if (!this.fish) return;
      var t = this._t % 8;
      var ph = t < 2.2 ? 0 : (t < 3.4 ? 1 : 2);
      if (ph === 2) this._hooked = true;
      var mouthX = 710;
      var mouthY = ph < 2 ? 236 : 300 + Math.sin(this._t * 8) * 3;
      var fishX, fishY;
      if (ph === 0) {
        fishX = 150 + (t / 2.2) * 480;
        fishY = 214 + Math.sin(this._t * 3) * 6;
      } else {
        fishX = mouthX - 84;
        fishY = mouthY + 14;
      }
      this.fish.setPosition(fishX, fishY);
      this.fish.setRotation(ph === 2 ? Math.sin(this._t * 10) * 4 : 0);
      if (this.fishShade) this.fishShade.setPosition(fishX + 10, fishY - 36);
      var hookTop = mouthY + 58;
      this.hookSp.setPosition(mouthX, hookTop);
      this.line.setPosition(mouthX, 402);
      this.line.setScale(1.15, Math.max(12, 402 - hookTop) / 4);
      this.worm.setVisible(ph === 0);
      this.worm.setPosition(mouthX - 16, mouthY + 6);
      if (this.meta) this.meta.setVisible(!!this._hooked);
      var i;
      if (this._water) {
        for (i = 0; i < this._water.waves.length; i++) {
          var wv = this._water.waves[i];
          wv.setPosition(wv._x0 + Math.sin(this._t * 0.8 + i) * 10, wv._y0 + Math.sin(this._t * 1.6 + i) * 3);
        }
        if (this._water.glints) {
          for (i = 0; i < this._water.glints.length; i++) {
            var gl = this._water.glints[i];
            gl.setPosition(gl._x0 + Math.sin(this._t * 1.4 + i) * 18, gl._y0 + Math.sin(this._t * 2 + i) * 2);
            gl.setOpacity(90 + Math.floor(70 + Math.sin(this._t * 3 + i) * 70));
          }
        }
      }
      for (i = 0; i < this.bubbles.length; i++) {
        var bb = this.bubbles[i];
        var by = bb._base + ((this._t * 26 + i * 36) % 150);
        bb.setPosition(bb._x + Math.sin(this._t + i) * 8, by);
      }
    }
  });

  /* ---------- 频率 ---------- */
  var FreqLayer = cc.Layer.extend({
    ctor: function () {
      this._super();
      WB.sceneName = 'freq';
      WB.ui.running = false;
      addChrome(this, 1);
      words(this, '⏱️ 调频率：拖滑条 · 点按钮跑', W / 2, 466, 18, '#ffe07a', 8);
      words(this, '一个旋钮：每几秒冒刺', W / 2, 444, 14, '#e8e4ff', 8);
      var box = { x: 18, y: 156, w: 924, h: 250 };
      var gy = box.y + 28;
      this.gy = gy;
      ART.frame(this, box.x + box.w / 2, box.y + box.h / 2, box.w + 8, box.h + 8, cc.color(110, 200, 255), 200, 1, 16);
      this._sky = ART.dressSky(this, gy + 4, box);
      ART.addGround(this, box.x, gy, box.w - 150, 3, 1);
      var self = this;
      words(this, '每', 250, 430, 18, '#ffe7a0', 8);
      button(this, '－', 310, 430, 52, 36, NAVY, WHITE, function () {
        STORE.setIntervalValue(WB.data, WB.data.interval - 1);
      });
      button(this, '＋', 500, 430, 52, 36, NAVY, WHITE, function () {
        STORE.setIntervalValue(WB.data, WB.data.interval + 1);
      });
      this.num = words(this, String(WB.data.interval), 400, 432, 36, '#ffe07a', 8);
      words(this, '秒冒一次刺', 600, 430, 16, '#ffe7a0', 8);
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
      ART.panel(this.hookRow, W / 2, 96, W - 48, 52, CREAM, 245, 0, 16);
      this.hookAsk = words(this.hookRow, '你发现哪一点在钓你？', 220, 96, 14, '#1a2744', 2);
      var choices = ['节奏变快', '掉血变多', '还想再跑'];
      choices.forEach(function (name, idx) {
        var on = WB.data.hook === name;
        button(self.hookRow, name, 430 + idx * 150, 96, 136, 32, on ? GOLD : NAVY, on ? INK : WHITE, function () {
          WB.data.hook = name;
          STORE.save(localStorage, WB.data);
          later(function () { show(1); });
        });
      });
      this._applyHook();
      addFootTrio(this,
        '回看图', function () { later(function () { show(0); }); },
        '跑一次', function () {
          WB.ui.running = true;
          WB.ui.freqDone = false;
          WB.ui.runT0 = Date.now() / 1000;
          self._applyHook();
        },
        '去摆关', function () { later(function () { show(2); }); }
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

  /* ---------- 摆关 ---------- */
  var EDIT = { L: 14, cw: 62, gy: 156 };
  var EditLayer = cc.Layer.extend({
    ctor: function () {
      this._super();
      WB.sceneName = 'edit';
      addChrome(this, 2);
      var gy = EDIT.gy;
      this._sky = ART.dressSky(this, gy + 6);
      ART.addGround(this, EDIT.L, gy, STORE.MC * EDIT.cw, 4, 2);
      words(this, '摆一小关 · 放陷阱 · 调频率 · 跑一次', 360, 470, 16, '#1a2744', 8);
      var self = this;
      var tools = [['spike', '刺'], ['fire', '火'], ['spring', '弹'], ['mist', '雾'], ['rock', '石'], ['coin', '币'], ['del', '擦']];
      addTrapChipStrip(self, tools, isPhoneShell() ? 424 : 428);
      var trayY = isPhoneShell() ? 424 : 428;
      button(self, '④装备', 560, trayY, 84, isPhoneShell() ? 26 : 36, GREEN, WHITE, function () {
        later(function () { show(3); });
      });
      button(self, '⑥听选', 660, trayY, 84, isPhoneShell() ? 26 : 36, NAVY, WHITE, function () {
        later(function () { show(5); });
      });
      /* shop lives in HTML drawer; keep a tiny wallet chip on canvas */
      words(this, '💰' + ((WB.data.wallet && WB.data.wallet.coins) | 0), 720, trayY, 15, '#ffe07a', 8);
      this._shop = function () {}; /* drawer owns shop */
      this.paramRow = new cc.Node();
      this.addChild(this.paramRow, 31);
      this._params();
      var bands = [[0, 3, ccColor(78, 168, 92, 70), '教'], [3, 7, ccColor(230, 194, 0, 70), '练'], [7, 10, ccColor(226, 121, 59, 70), '变'], [10, 12, ccColor(226, 59, 59, 70), '考']];
      bands.forEach(function (b) {
        plate(self, EDIT.L + b[0] * EDIT.cw, gy + 8, (b[1] - b[0]) * EDIT.cw, 92, b[2], 3);
        words(self, b[3], EDIT.L + b[0] * EDIT.cw + 16, gy + 86, 14, '#1a2744', 7);
      });
      plate(this, EDIT.L, gy + 8, STORE.SAFE0 * EDIT.cw, 92, ccColor(159, 240, 168, 50), 4);
      words(this, '出生', EDIT.L + 28, gy + 64, 13, '#145c28', 7);
      this.frames = [];
      this.marks = [];
      this.idxLabs = [];
      var x;
      for (x = 0; x < STORE.MC; x++) {
        var fr = ART.frame(this, EDIT.L + (x + 0.5) * EDIT.cw, gy + 52, EDIT.cw - 4, 84, cc.color(255, 255, 255), 90, 6, 6);
        this.frames.push(fr);
        var mk = new cc.Node();
        mk.setPosition(EDIT.L + (x + 0.5) * EDIT.cw, gy);
        this.addChild(mk, 9);
        this.marks.push(mk);
        this.idxLabs.push(words(this, String(x + 1), EDIT.L + (x + 0.5) * EDIT.cw, gy - 16, 12, '#ffe7a0', 7));
      }
      ART.place(this, ART.tex.flag, EDIT.L + STORE.MC * EDIT.cw - 46, gy + 6, { anchor: [0, 0], h: 70, z: 11 });
      var grid = new cc.Node();
      grid.setAnchorPoint(0, 0);
      grid.setContentSize(STORE.MC * EDIT.cw, 130);
      grid.setPosition(EDIT.L, gy - 6);
      this.addChild(grid, 12);
      cc.eventManager.addListener(cc.EventListener.create({
        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        swallowTouches: true,
        onTouchBegan: function (touch, event) {
          var loc = event.getCurrentTarget().convertToNodeSpace(touch.getLocation());
          var box = cc.rect(0, 0, STORE.MC * EDIT.cw, 130);
          if (!cc.rectContainsPoint(box, loc)) return false;
          var col = Math.floor(loc.x / EDIT.cw);
          var res = STORE.place(WB.data, col);
          WB.ui.flash = res.flash || '';
          if (res.ok) STORE.save(localStorage, WB.data);
          later(function () { show(2); });
          return true;
        }
      }), grid);
      this.ninja = addNinja(this, EDIT.L + 28, gy, isPhoneShell() ? 140 : 132);
      this.card = ART.panel(this, 872, 250, 160, 300, cc.color(78, 201, 107), 255, 10, 16);
      words(this, '一共掉', 872, 372, 16, '#1b1b2a', 11);
      this.sumLab = words(this, '', 872, 336, 28, '#1b1b2a', 11);
      this.moodLab = words(this, '', 872, 300, 16, '#1b1b2a', 11);
      this.checkLabs = [];
      var rows0 = STORE.checks(WB.data.map);
      var ci;
      for (ci = 0; ci < rows0.length; ci++) {
        this.checkLabs.push(words(this, '', 872, 250 - ci * 28, 13, '#1b1b2a', 11));
      }
      ART.panel(this, 386, 96, 460, 30, cc.color(255, 244, 214), 235, 10, 12);
      this.flashLab = words(this, WB.ui.flash || '点格子摆东西', 386, 96, 15, '#7a4e00', 11);
      addFootTrio(this,
        '回频率', function () { later(function () { show(1); }); },
        '跑一次', function () { WB.ui.running = true; WB.ui.runT0 = Date.now() / 1000; },
        '去装备', function () { later(function () { show(3); }); }
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
        spring: '弹簧：踩上去会弹起来',
        mist: '迷雾：走进去会变慢',
        rock: '岩石：撞上去会轻伤'
      };
      if (hint[sel]) {
        words(this.paramRow, hint[sel], 220, 348, 15, '#1a2744', 1);
        return;
      }
      if (sel !== 'spike' && sel !== 'fire') {
        words(this.paramRow, '点一个刺或火，再选 1、3、5 秒', 250, 348, 15, '#1a2744', 1);
        return;
      }
      var cur = sel === 'fire' ? WB.data.mp.fire.dur : WB.data.mp.spike.interval;
      words(this.paramRow, sel === 'fire' ? '火停多久' : '刺每几秒冒一次', 120, 348, 15, '#1a2744', 1);
      [1, 3, 5].forEach(function (v, i) {
        var on = cur === v;
        button(self.paramRow, v + '秒', 280 + i * 96, 348, 86, 32, on ? GOLD : NAVY, on ? INK : WHITE, function () {
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
      for (x = 0; x < STORE.MC; x++) {
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
        } else if (k === 'coin' || k === 'spring' || k === 'mist' || k === 'rock') {
          sp = new cc.Sprite(ART.tex[k]);
          sp.setAnchorPoint(0.5, 0);
          sp.setScale(k === 'mist' ? 0.7 : 0.62);
          sp.setPosition(0, k === 'coin' ? 10 : 0);
          mk.addChild(sp, 1);
        }
      }
      var hearts = STORE.mEst(WB.data.map, WB.data.mp);
      var tot = hearts.reduce(function (a, b) { return a + b; }, 0);
      var col = tot <= 2 ? cc.color(78, 201, 107) : tot <= 5 ? cc.color(255, 210, 63) : cc.color(255, 90, 90);
      this.card.setColor(col);
      reword(this.sumLab, tot + '❤');
      reword(this.moodLab, tot <= 2 ? '简单' : tot <= 5 ? '刚刚好' : '超难');
      var rows = STORE.checks(WB.data.map);
      var i;
      for (i = 0; i < rows.length; i++) {
        reword(this.checkLabs[i], (rows[i][1] ? '✓ ' : '· ') + rows[i][0]);
      }
      var tip = WB.ui.flash || (WB.ui.running ? '正在跑' : (WB.ui.previewDone ? '跑完了，可以去觉察' : '点格子摆东西'));
      reword(this.flashLab, tip);
    },
    update: function (dt) {
      this._t += dt;
      driftClouds(this._sky, this._t);
      this._syncMarks();
      if (!WB.ui.running) {
        if (!WB.ui.previewDone) this.ninja.setPosition(EDIT.L + 28, EDIT.gy);
        stepNinja(this.ninja, dt, false, true);
        return;
      }
      var rt = Date.now() / 1000 - WB.ui.runT0;
      var P = 6;
      var x = EDIT.L + 28 + Math.min(rt, P) / P * (STORE.MC * EDIT.cw - 36);
      this.ninja.setPosition(x, EDIT.gy);
      stepNinja(this.ninja, dt, false, rt >= P);
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
      var L = 46, cw = 34, gy = 250;
      ART.panel(this, L + STORE.MC * cw / 2, gy + 18, STORE.MC * cw + 18, 108, ccColor(0, 0, 0), 55, 3, 10);
      var bands = [[0, 3, ccColor(78, 168, 92, 80)], [3, 7, ccColor(230, 194, 0, 80)], [7, 10, ccColor(226, 121, 59, 80)], [10, 12, ccColor(226, 59, 59, 80)]];
      bands.forEach(function (b) {
        plate(this, L + b[0] * cw, gy + 4, (b[1] - b[0]) * cw, 70, b[1] ? b[2] : b[2], 4);
      }, this);
      ART.addGround(this, L, gy, STORE.MC * cw, 5, 1);
      var hearts = STORE.mEst(WB.data.map, WB.data.mp);
      var tot = hearts.reduce(function (a, b) { return a + b; }, 0);
      var placed = 0;
      var x, k, px, sp;
      for (x = 0; x < STORE.MC; x++) {
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
        } else if (k === 'coin' || k === 'spring' || k === 'mist' || k === 'rock') {
          sp = new cc.Sprite(ART.tex[k]);
          sp.setAnchorPoint(0.5, 0);
          sp.setScale(0.42);
          sp.setPosition(px, gy + (k === 'coin' ? 8 : 0));
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

      button(this, '回摆关', isPhoneShell() ? 100 : 120, 30, isPhoneShell() ? 100 : 140, isPhoneShell() ? 40 : 44, NAVY, WHITE, function () { later(function () { show(2); }); });
      button(this, '联机游玩', isPhoneShell() ? 360 : 420, 32, isPhoneShell() ? 160 : 180, isPhoneShell() ? 48 : 48, GOLD, INK, function () {
        STORE.save(localStorage, WB.data);
        location.href = 'custom-play.html?v=c37&net=1';
      });
      button(this, '去玩这一关', isPhoneShell() ? 720 : 760, 32, isPhoneShell() ? 240 : 220, isPhoneShell() ? 50 : 48, GREEN, WHITE, function () {
        STORE.save(localStorage, WB.data);
        location.href = 'custom-play.html?v=c37';
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


  /* ---------- ④ 装备 ---------- */
  var EquipLayer = cc.Layer.extend({
    ctor: function () {
      this._super();
      WB.sceneName = 'equip';
      addChrome(this, 3);
      ART.fill(this, ART.tex.night, 0);
      words(this, '④ 装备 · 用钱包买武器', W / 2, 470, 24, '#ffe7a0', 8);
      words(this, '钱不够买不了 · 已买再点是装备 · 没装备仍是手里剑', W / 2, 436, 14, '#c9c3ef', 8);
      var wal = WB.data.wallet || { coins: 0, weapons: [], equipped: null };
      ART.panel(this, W / 2, 300, 820, 260, ccColor(18, 26, 58), 235, 2, 18);
      ART.frame(this, W / 2, 300, 820, 260, cc.color(255, 255, 255), 70, 3, 18);
      words(this, '💰 金币 ' + ((wal.coins) | 0), W / 2, 390, 22, '#ffe07a', 8);
      var self = this;
      var ids = ['dart', 'blade', 'gun'];
      ids.forEach(function (id, i) {
        var spec = STORE.WEAPONS[id];
        var owned = wal.weapons.indexOf(id) >= 0;
        var on = wal.equipped === id;
        var label = on ? (spec.name + ' · 使用中') : (owned ? (spec.name + ' · 点击装备') : (spec.name + ' · ' + spec.price + '币'));
        var cx = 220 + i * 260;
        button(self, label, cx, 300, 220, 56, on ? GOLD : NAVY, on ? INK : WHITE, function () {
          var res = STORE.buy(WB.data, id);
          WB.ui.flash = res.flash || '';
          if (res.ok) STORE.save(localStorage, WB.data);
          later(function () { show(3); });
        });
        words(self, owned ? '已拥有' : ('价格 ' + spec.price), cx, 250, 14, '#a8a0c8', 8);
      });
      var flash = WB.ui.flash || '点一张卡购买或装备';
      words(this, flash, W / 2, 200, 16, '#9ff0a8', 8);
      words(this, '右侧抽屉也可买 · 规则与存档钱包 v1.2 相同', W / 2, 168, 13, '#8f88b8', 8);
      addFootTrio(this,
        '回摆关', function () { later(function () { show(2); }); },
        '打开商店', function () { try { if (window.VW && VW.openShop) VW.openShop(); } catch (e) {} },
        '去觉察', function () { later(function () { show(4); }); }
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
      words(this, '⑥ 听选音频 · 先听后选', W / 2, 470, 24, '#ffe7a0', 8);
      words(this, '点心情试听，再点选用 · 署名 Kevin MacLeod / Kenney · 不用 Mixkit', W / 2, 436, 13, '#c9c3ef', 8);
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
      var pick = cur ? ('已选：' + cur) : '还没选曲';
      if (WB.ui.flash) pick = WB.ui.flash;
      words(this, pick, W / 2, 200, 16, '#9ff0a8', 8);
      words(this, '音乐 Kevin MacLeod · CC BY 3.0｜音效 Kenney · CC0｜详见 audio/SOURCES.md', W / 2, 168, 12, '#8f88b8', 8);
      addFootTrio(this,
        '回觉察', function () { later(function () { show(4); }); },
        '打开喇叭', function () { try { if (window.VW && VW.openMusic) VW.openMusic(); } catch (e) {} },
        '去玩这一关', function () {
          STORE.save(localStorage, WB.data);
          location.href = 'custom-play.html?v=c36';
        }
      );
      return true;
    }
  });

  var LookScene = cc.Scene.extend({ onEnter: function () { this._super(); this.addChild(new LookLayer()); } });
  var FreqScene = cc.Scene.extend({ onEnter: function () { this._super(); this.addChild(new FreqLayer()); } });
  var EditScene = cc.Scene.extend({ onEnter: function () { this._super(); this.addChild(new EditLayer()); } });
  var EquipScene = cc.Scene.extend({ onEnter: function () { this._super(); this.addChild(new EquipLayer()); } });
  var ReflectScene = cc.Scene.extend({ onEnter: function () { this._super(); this.addChild(new ReflectLayer()); } });
  var AudioScene = cc.Scene.extend({ onEnter: function () { this._super(); this.addChild(new AudioLayer()); } });


  /* HTML drawer bridge (visual workbench) */
  window.VW = window.VW || {};
  VW.refreshShop = function () {
    var el = document.getElementById('shopList');
    var walEl = document.getElementById('shopWallet');
    if (!el || !WB.data) return;
    var wal = WB.data.wallet || { coins: 0, weapons: [], equipped: null };
    if (walEl) walEl.textContent = '金币 ' + (wal.coins | 0);
    el.innerHTML = '';
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
        if (WB.ui.step === 3) later(function () { show(3); });
        else if (WB.ui.step === 2) later(function () { show(2); });
      };
      el.appendChild(b);
    });
  };
  VW.refreshMusic = function () {
    var el = document.getElementById('musicList');
    var pick = document.getElementById('musicPick');
    var credit = document.getElementById('musicCredit');
    if (!el) return;
    var AUDIO = window.WBAudio || null;
    var tracks = AUDIO && AUDIO.BGM ? AUDIO.BGM.map(function (b) {
      return { id: b.id, name: b.name, stub: false };
    }) : [
      { id: 'explore', name: '探险', stub: true },
      { id: 'tense', name: '紧张', stub: true },
      { id: 'win', name: '过关', stub: true },
      { id: 'fail', name: '失败', stub: true }
    ];
    var cur = '';
    if (WB.data && WB.data.audio && WB.data.audio.bgmId) cur = WB.data.audio.bgmId;
    else if (WB.data && WB.data.music) cur = WB.data.music;
    el.innerHTML = '';
    tracks.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'item' + (cur === t.id ? ' on' : '');
      b.innerHTML = t.name + '<span class="price">' + (t.stub ? '占位' : '试听 / 选用') + '</span>';
      b.onclick = function () {
        WB.data.music = t.id;
        if (!WB.data.audio) WB.data.audio = AUDIO && AUDIO.blankAudio ? AUDIO.blankAudio() : { bgmId: t.id, sfx: {} };
        WB.data.audio.bgmId = t.id;
        STORE.save(localStorage, WB.data);
        if (AUDIO) {
          try { AUDIO.unlock(); AUDIO.setBgm(t.id); } catch (e) {}
        }
        if (pick) pick.textContent = '已选：' + t.name;
        VW.refreshMusic();
      };
      el.appendChild(b);
    });
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
    WB.data = STORE.load(localStorage);
    if (STORE.ensureDefaultMap) STORE.ensureDefaultMap(WB.data);
    var q = new URLSearchParams(location.search);
    var lesson = q.get('lesson') || 'tonight';
    var step = +(q.get('step') || '0');
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
            words(layer, '今晚六步已经可以打开', W / 2, H / 2 - 30, 20, '#ffffff', 2);
            button(layer, '打开今晚六步', W / 2, H / 2 - 90, 240, 52, GREEN, WHITE, function () {
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
