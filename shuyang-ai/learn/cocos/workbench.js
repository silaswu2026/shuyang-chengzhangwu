/**
 * 学习工作台 · 今晚四步（看图、频率、摆关、觉察）。
 * 整页是 Cocos 场景。存档仍是 localStorage xygo-custom-level v1.1。
 * 试玩仍走 custom-play.html；这一步不改 earlyShowcase。
 */
(function () {
  var W = 960, H = 540;
  var SP = '../../../xy-go/sprites/green/';
  var AV = ['../../avatars/xiaoyu.jpg', '../../avatars/dad-wuxin.jpg', '../../avatars/mom-chunyan.jpg'];
  var STEPS = ['看图', '频率', '摆关', '觉察'];
  var STORE = window.WBStore;
  var DUR = 12;
  var PAD = [2, 4, 6, 9];
  var NAVY = ccColor(59, 69, 144);
  var GREEN = ccColor(78, 168, 92);
  var GOLD = ccColor(255, 224, 122);
  var INK = ccColor(34, 34, 34);
  var WHITE = ccColor(255, 255, 255);

  var tex = { spike: null, fire: null, coin: null };
  var WB = window.WB = {
    ready: false,
    sceneName: '',
    data: null,
    ui: { step: 0, look: 0, running: false, runT0: 0, previewDone: false, flash: '', freqDone: false },
    layout: {}
  };

  function ccColor(r, g, b, a) { return cc.color(r, g, b, a == null ? 255 : a); }
  function $(id) { return document.getElementById(id); }

  function bootMsg(m, err) {
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
    var h = Math.ceil(size * 1.5);
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
    parent.addChild(sp, z == null ? 6 : z);
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

  function button(parent, text, cx, cy, w, h, bg, fg, onTap) {
    var n = new cc.Node();
    n.setAnchorPoint(0, 0);
    n.setContentSize(w, h);
    n.setPosition(cx - w / 2, cy - h / 2);
    var p = new cc.LayerColor(bg, w, h);
    n.addChild(p, 0);
    var hex = fg === INK ? '#222222' : '#ffffff';
    var lab = words(n, text, w / 2, h / 2, Math.max(15, Math.min(22, Math.floor(h * 0.42))), hex, 1);
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
    return { node: n, label: lab, plate: p };
  }

  function later(fn) { setTimeout(fn, 0); }

  function show(step) {
    step = Math.max(0, Math.min(3, step | 0));
    WB.ui.step = step;
    WB.ui.running = false;
    if (step === 2 || step === 3) STORE.save(localStorage, WB.data);
    var scenes = [LookScene, FreqScene, EditScene, ReflectScene];
    cc.director.runScene(new scenes[step]());
  }

  function addChrome(layer, step) {
    plate(layer, 0, H - 52, W, 52, ccColor(16, 24, 48, 230), 20);
    AV.forEach(function (src, i) {
      var sp = new cc.Sprite(src);
      sp.setAnchorPoint(0.5, 0.5);
      sp.setPosition(24 + i * 44, H - 26);
      layer.addChild(sp, 22);
      var fit = function () {
        var sz = sp.getContentSize();
        if (sz.width < 2 || sz.height < 2) return false;
        var side = Math.min(sz.width, sz.height);
        sp.setTextureRect(cc.rect((sz.width - side) / 2, (sz.height - side) / 2, side, side));
        sp.setScale(30 / side);
        return true;
      };
      if (!fit()) {
        var n = 0;
        var timer = setInterval(function () {
          if (fit() || ++n > 40) clearInterval(timer);
        }, 50);
      }
    });
    STEPS.forEach(function (name, i) {
      var on = i === step;
      button(layer, (i + 1) + ' ' + name, 250 + i * 150, H - 26, 136, 36, on ? GOLD : NAVY, on ? INK : WHITE, function () {
        later(function () { show(i); });
      });
    });
  }

  function addNinja(parent, x, y, h) {
    var sp = new cc.Sprite(SP + 'idle.png');
    sp.setAnchorPoint(0.5, 0);
    var sz = sp.getContentSize();
    if (sz.height > 2) sp.setScale(h / sz.height);
    sp.setPosition(x, y);
    parent.addChild(sp, 16);
    sp._frame = 0;
    sp._frameT = 0;
    return sp;
  }

  function stepNinja(sp, dt, hurt, idle) {
    sp._frameT += dt;
    if (sp._frameT < 0.1) return;
    sp._frameT = 0;
    sp._frame = (sp._frame + 1) % 4;
    var path = hurt ? SP + 'knock_0.png' : (idle ? SP + 'idle.png' : SP + 'walk_' + sp._frame + '.png');
    var t = cc.textureCache.addImage(path);
    if (t) sp.setTexture(t);
  }

  /* ---------- 看图 ---------- */
  var LookLayer = cc.Layer.extend({
    ctor: function () {
      this._super();
      WB.sceneName = 'look';
      addChrome(this, 0);
      var page = WB.ui.look;
      plate(this, 0, 0, W, H - 52, page === 0 ? ccColor(14, 48, 84) : ccColor(20, 28, 56), 0);
      if (page === 0) this._hook();
      else this._stop();
      if (page === 1) {
        button(this, '上一句', 150, 36, 160, 48, NAVY, WHITE, function () {
          later(function () { WB.ui.look = 0; show(0); });
        });
      }
      button(this, page === 0 ? '下一句' : '去调频率', 760, 36, 220, 48, GREEN, WHITE, function () {
        later(function () {
          if (WB.ui.look === 0) { WB.ui.look = 1; show(0); }
          else show(1);
        });
      });
      words(this, page === 0 ? '第 1 句' : '第 2 句', 470, 36, 18, '#ffe7a0', 31);
      this._t = 0;
      this.scheduleUpdate();
      return true;
    },
    _hook: function () {
      plate(this, 0, 78, W, 150, ccColor(30, 90, 150), 1);
      plate(this, 868, 250, 5, 200, ccColor(230, 230, 230), 2);
      plate(this, 828, 246, 48, 10, ccColor(197, 208, 220), 2);
      words(this, '上钩＝鱼被钓上钩', 430, 456, 34, '#ffe07a', 8);
      words(this, '饵在钩上。鱼咬住，就被拉上去。', 430, 400, 22, '#ffffff', 8);
      words(this, '进游戏＝被钓上钩', 430, 330, 30, '#9ff0a8', 8);
      words(this, '一直玩 · 忘了事 · 花时间 · 以后还想玩', 430, 276, 18, '#ffe7a0', 8);
      addNinja(this, 150, 86, 110);
      words(this, '饵', 850, 360, 20, '#ffe07a', 8);
      words(this, '鱼', 800, 170, 26, '#ffffff', 8);
    },
    _stop: function () {
      words(this, '我自己决定停', W / 2, 470, 36, '#ffe07a', 8);
      plate(this, 36, 100, 430, 320, ccColor(255, 255, 255, 18), 1);
      plate(this, 494, 100, 430, 320, ccColor(255, 255, 255, 18), 1);
      words(this, '被钓住了', 250, 380, 28, '#ff8a8a', 8);
      words(this, '一直玩不停', 250, 310, 22, '#ffb4b4', 8);
      words(this, '忘了别的事', 250, 260, 22, '#ffb4b4', 8);
      words(this, '花时间、还想再开一局', 250, 210, 22, '#ffb4b4', 8);
      words(this, '看懂上钩', 710, 380, 28, '#9ff0a8', 8);
      words(this, '我看见钩子了', 710, 310, 22, '#c8ffd0', 8);
      words(this, '玩够了就停', 710, 260, 22, '#c8ffd0', 8);
      words(this, '什么时候停，我自己决定', 710, 210, 20, '#c8ffd0', 8);
    },
    update: function (dt) { this._t += dt; }
  });

  /* ---------- 频率 ---------- */
  var FreqLayer = cc.Layer.extend({
    ctor: function () {
      this._super();
      WB.sceneName = 'freq';
      WB.ui.running = false;
      addChrome(this, 1);
      plate(this, 0, 0, W, H - 52, ccColor(92, 158, 210), 0);
      plate(this, 0, 150, W, 120, ccColor(45, 74, 110), 1);
      plate(this, 0, 168, W, 28, ccColor(107, 79, 47), 3);
      plate(this, 0, 192, W, 8, ccColor(78, 168, 92), 4);
      words(this, '一个旋钮：每几秒冒一次刺', W / 2, 470, 26, '#1a2744', 8);
      var self = this;
      button(this, '－', 300, 418, 72, 52, NAVY, WHITE, function () {
        STORE.setIntervalValue(WB.data, WB.data.interval - 1);
      });
      button(this, '＋', 620, 418, 72, 52, NAVY, WHITE, function () {
        STORE.setIntervalValue(WB.data, WB.data.interval + 1);
      });
      this.num = words(this, String(WB.data.interval), 460, 422, 42, '#7a4e00', 8);
      words(this, '秒', 520, 418, 22, '#1a2744', 8);
      this.countLab = words(this, '', 760, 360, 22, '#ffe7a0', 8);
      this.hitLab = words(this, '', 760, 324, 22, '#ffb4b4', 8);
      this.spikes = [];
      this.marks = [];
      var L = 36, cw = (W - 220) / 12;
      this.L = L;
      this.cw = cw;
      this.gy = 196;
      for (var i = 0; i < PAD.length; i++) {
        var px = L + PAD[i] * cw;
        var sp = new cc.Sprite(tex.spike);
        sp.setAnchorPoint(0.5, 0);
        sp.setPosition(px, this.gy);
        sp.setScale(0.7);
        this.addChild(sp, 8);
        this.spikes.push(sp);
        this.marks.push(words(this, '', px, this.gy + 78, 18, '#ffffff', 9));
      }
      this.ninja = addNinja(this, 48, this.gy, 96);
      this.hookRow = new cc.Node();
      this.addChild(this.hookRow, 31);
      plate(this.hookRow, 0, 64, W, 92, ccColor(232, 244, 255, 230), 0);
      this.hookAsk = words(this.hookRow, '你发现哪一点在钓你？', W / 2, 132, 18, '#1a2744', 1);
      var choices = ['节奏变快', '掉血变多', '还想再跑'];
      var selfHook = this.hookRow;
      choices.forEach(function (name, i) {
        var on = WB.data.hook === name;
        button(selfHook, name, 250 + i * 200, 92, 180, 40, on ? GOLD : NAVY, on ? INK : WHITE, function () {
          WB.data.hook = name;
          STORE.save(localStorage, WB.data);
          later(function () { show(1); });
        });
      });
      this._applyHook();
      button(this, '回看图', 120, 36, 150, 44, NAVY, WHITE, function () { later(function () { show(0); }); });
      button(this, '跑一次', 470, 36, 180, 48, GREEN, WHITE, function () {
        WB.ui.running = true;
        WB.ui.freqDone = false;
        WB.ui.runT0 = Date.now() / 1000;
        self._applyHook();
      });
      button(this, '去摆关', 820, 36, 160, 44, NAVY, WHITE, function () { later(function () { show(2); }); });
      WB.layout.freqPlus = { x: 620, y: 418 };
      WB.layout.freqMinus = { x: 300, y: 418 };
      WB.layout.freqRun = { x: 470, y: 36 };
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
      var I = WB.data.interval;
      reword(this.num, String(I));
      var n = STORE.fCnt(I), lose = STORE.fHit(I);
      reword(this.countLab, '刺 ' + n + ' 次');
      reword(this.hitLab, '掉 ' + lose + '❤');
      var now = Date.now() / 1000;
      var elapsed = WB.ui.running ? (now - WB.ui.runT0) : (now % (DUR + 1.5));
      var tt = Math.min(elapsed, DUR);
      var raised = tt >= I && (tt % I) < 1;
      var hurt = false;
      for (var i = 0; i < PAD.length; i++) {
        var p = PAD[i];
        this.spikes[i].setVisible(raised);
        var hit = p >= I && (p % I) < 1;
        if (tt >= p && hit) {
          reword(this.marks[i], '-1');
          if (tt - p < 1) hurt = true;
        } else if (tt >= p + 0.3) reword(this.marks[i], '过');
        else reword(this.marks[i], '');
      }
      var nx = this.L + (tt / DUR) * 12 * this.cw;
      this.ninja.setPosition(Math.min(W - 200, nx), this.gy);
      stepNinja(this.ninja, dt, hurt, !WB.ui.running && tt >= DUR);
      if (WB.ui.running && elapsed >= DUR + 0.2 && !WB.ui.freqDone) {
        WB.ui.freqDone = true;
        WB.ui.running = false;
        this._applyHook();
      }
    }
  });

  /* ---------- 摆关 ---------- */
  var EDIT = { L: 16, cw: 64, gy: 188 };
  var EditLayer = cc.Layer.extend({
    ctor: function () {
      this._super();
      WB.sceneName = 'edit';
      addChrome(this, 2);
      plate(this, 0, 0, W, H - 52, ccColor(92, 158, 210), 0);
      plate(this, 0, EDIT.gy - 8, W, 36, ccColor(107, 79, 47), 3);
      plate(this, 0, EDIT.gy + 22, W, 8, ccColor(78, 168, 92), 4);
      words(this, '摆一小关 · 放刺或火 · 调每几秒 · 跑一次', W / 2, 472, 22, '#1a2744', 8);
      var self = this;
      var tools = [['spike', '地刺'], ['fire', '火'], ['coin', '金币'], ['del', '擦掉']];
      tools.forEach(function (t, i) {
        var on = WB.data.tool === t[0];
        button(self, t[1], 160 + i * 150, 424, 132, 40, on ? GOLD : NAVY, on ? INK : WHITE, function () {
          WB.data.tool = t[0];
          if (t[0] === 'spike' || t[0] === 'fire') WB.data.sel = t[0];
          later(function () { show(2); });
        });
      });
      this.paramRow = new cc.Node();
      this.addChild(this.paramRow, 31);
      this._params();
      this.cells = [];
      this.marks = [];
      for (var x = 0; x < STORE.MC; x++) {
        var band = STORE.zone(x);
        var bg = plate(this, EDIT.L + x * EDIT.cw + 2, EDIT.gy + 28, EDIT.cw - 4, 86, ccColor(255, 255, 255, 28), 5);
        this.cells.push(bg);
        var mk = new cc.Node();
        mk.setPosition(EDIT.L + (x + 0.5) * EDIT.cw, EDIT.gy + 36);
        this.addChild(mk, 9);
        this.marks.push(mk);
        if (x === 0 || x === 3 || x === 7 || x === 10) {
          words(this, band[0], EDIT.L + (x + 0.4) * EDIT.cw, EDIT.gy + 118, 14, '#1a2744', 7);
        }
      }
      plate(this, EDIT.L, EDIT.gy + 28, STORE.SAFE0 * EDIT.cw, 86, ccColor(159, 240, 168, 40), 6);
      words(this, '出生', EDIT.L + 28, EDIT.gy + 96, 14, '#145c28', 7);
      var grid = new cc.Node();
      grid.setAnchorPoint(0, 0);
      grid.setContentSize(STORE.MC * EDIT.cw, 130);
      grid.setPosition(EDIT.L, EDIT.gy + 10);
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
      this.ninja = addNinja(this, EDIT.L, EDIT.gy, 78);
      this.ninja.setVisible(false);
      this.flashLab = words(this, WB.ui.flash || '点格子摆东西', 400, 148, 16, '#7a4e00', 8);
      this.sumLab = words(this, '', 820, 148, 16, '#7a1a1a', 8);
      this.checkLabs = [];
      STORE.checks(WB.data.map).forEach(function (row, i) {
        self.checkLabs.push(words(self, '', 150 + i * 190, 332, 15, '#1a2744', 8));
      });
      button(this, '回频率', 110, 36, 140, 44, NAVY, WHITE, function () { later(function () { show(1); }); });
      button(this, '跑一次', 470, 36, 170, 48, GREEN, WHITE, function () {
        WB.ui.running = true;
        WB.ui.runT0 = Date.now() / 1000;
        self.ninja.setVisible(true);
      });
      button(this, '去觉察', 830, 36, 150, 44, NAVY, WHITE, function () { later(function () { show(3); }); });
      WB.layout.editCell = function (i) {
        return { x: EDIT.L + (i + 0.5) * EDIT.cw, y: EDIT.gy + 70 };
      };
      WB.layout.editRun = { x: 470, y: 36 };
      this._syncMarks();
      this.scheduleUpdate();
      return true;
    },
    _params: function () {
      var sel = WB.data.sel;
      var self = this;
      if (sel !== 'spike' && sel !== 'fire') {
        words(this.paramRow, '点一个刺或火，再选 1、3、5 秒', W / 2, 378, 16, '#1a2744', 1);
        return;
      }
      var cur = sel === 'fire' ? WB.data.mp.fire.dur : WB.data.mp.spike.interval;
      words(this.paramRow, sel === 'fire' ? '火停多久' : '刺每几秒冒一次', 160, 378, 16, '#1a2744', 1);
      [1, 3, 5].forEach(function (v, i) {
        var on = cur === v;
        button(self.paramRow, v + '秒', 340 + i * 110, 378, 96, 36, on ? GOLD : NAVY, on ? INK : WHITE, function () {
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
      for (var x = 0; x < STORE.MC; x++) {
        var mk = this.marks[x];
        mk.removeAllChildren();
        var k = WB.data.map[x];
        var sel = WB.data.selX === x;
        this.cells[x].setColor(sel ? ccColor(255, 215, 80) : ccColor(255, 255, 255));
        this.cells[x].setOpacity(sel ? 90 : 28);
        if (k === 'spike') {
          var sp = new cc.Sprite(tex.spike);
          sp.setAnchorPoint(0.5, 0);
          sp.setScale(0.55, up ? 0.85 : 0.42);
          mk.addChild(sp);
        } else if (k === 'fire') {
          var f = new cc.Sprite(tex.fire);
          f.setAnchorPoint(0.5, 0);
          f.setScale(0.7);
          mk.addChild(f);
        } else if (k === 'coin') {
          var c = new cc.Sprite(tex.coin);
          c.setAnchorPoint(0.5, 0);
          c.setScale(0.7);
          mk.addChild(c);
        }
      }
      var hearts = STORE.mEst(WB.data.map, WB.data.mp);
      var tot = hearts.reduce(function (a, b) { return a + b; }, 0);
      reword(this.sumLab, '预计掉 ' + tot + '❤');
      var rows = STORE.checks(WB.data.map);
      for (var i = 0; i < rows.length; i++) {
        reword(this.checkLabs[i], rows[i][0] + (rows[i][1] ? ' 好' : ' 还没有'));
      }
      var tip = WB.ui.flash || (WB.ui.running ? '正在跑' : (WB.ui.previewDone ? '跑完了，可以去觉察' : '点格子摆东西'));
      reword(this.flashLab, tip);
    },
    update: function (dt) {
      this._syncMarks();
      if (!WB.ui.running) return;
      var rt = Date.now() / 1000 - WB.ui.runT0;
      var P = 6;
      var x = EDIT.L + Math.min(rt, P) / P * STORE.MC * EDIT.cw;
      this.ninja.setVisible(true);
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
      addChrome(this, 3);
      plate(this, 0, 0, W, H - 52, ccColor(26, 36, 72), 0);
      words(this, '玩完问一句', W / 2, 470, 32, '#ffe7a0', 8);
      var hearts = STORE.mEst(WB.data.map, WB.data.mp);
      var tot = hearts.reduce(function (a, b) { return a + b; }, 0);
      var bits = [];
      WB.data.map.forEach(function (k, x) {
        if (!k) return;
        var name = k === 'spike' ? '刺' : k === 'fire' ? '火' : k === 'coin' ? '币' : k;
        bits.push('第' + (x + 1) + '格' + name);
      });
      words(this, bits.length ? bits.join('  ') : '还没摆东西', W / 2, 420, 18, '#ffffff', 8);
      words(this, '一共预计掉 ' + tot + '❤' + (WB.ui.previewDone ? '' : '  ·  可以先回去跑一次'), W / 2, 384, 20, '#ffb4b4', 8);
      words(this, '和预计一样吗？', W / 2, 330, 22, '#ffe7a0', 8);
      ['一样', '更难', '更简单'].forEach(function (name, i) {
        var on = WB.data.expect === name;
        button(this, name, 280 + i * 200, 276, 170, 48, on ? GOLD : NAVY, on ? INK : WHITE, function () {
          WB.data.expect = name;
          STORE.save(localStorage, WB.data);
          later(function () { show(3); });
        }.bind(this));
      }, this);
      words(this, '再选一句（可选）', W / 2, 220, 18, '#c9c3ef', 8);
      var extras = [['best_fun', '摆刺最好玩'], ['hardest', '频率最难调'], ['add_one', '下次加金币']];
      extras.forEach(function (pair, i) {
        var on = WB.data[pair[0]] === pair[1];
        button(this, pair[1], 230 + i * 250, 168, 220, 44, on ? GOLD : NAVY, on ? INK : WHITE, function () {
          WB.data[pair[0]] = pair[1];
          STORE.save(localStorage, WB.data);
          later(function () { show(3); });
        });
      }, this);
      var note = WB.data.expect ? ('记下了：' + WB.data.expect) : '点一个就行';
      words(this, note, W / 2, 112, 18, '#9ff0a8', 8);
      button(this, '回摆关', 160, 40, 160, 48, NAVY, WHITE, function () { later(function () { show(2); }); });
      button(this, '去玩这一关', 700, 40, 240, 52, GREEN, WHITE, function () {
        STORE.save(localStorage, WB.data);
        location.href = 'custom-play.html?v=c27';
      });
      return true;
    }
  });

  var LookScene = cc.Scene.extend({ onEnter: function () { this._super(); this.addChild(new LookLayer()); } });
  var FreqScene = cc.Scene.extend({ onEnter: function () { this._super(); this.addChild(new FreqLayer()); } });
  var EditScene = cc.Scene.extend({ onEnter: function () { this._super(); this.addChild(new EditLayer()); } });
  var ReflectScene = cc.Scene.extend({ onEnter: function () { this._super(); this.addChild(new ReflectLayer()); } });

  function texFromCanvas(c) {
    var t = new cc.Texture2D();
    t.initWithElement(c);
    t.handleLoadedTexture();
    return t;
  }
  function buildSpike() {
    var c = document.createElement('canvas');
    c.width = 72; c.height = 40;
    var g = c.getContext('2d');
    for (var k = 0; k < 4; k++) {
      var sx = 4 + k * 16;
      g.fillStyle = '#c5d0dc';
      g.beginPath();
      g.moveTo(sx, 38);
      g.lineTo(sx + 8, 4);
      g.lineTo(sx + 16, 38);
      g.closePath();
      g.fill();
      g.strokeStyle = '#7a8794';
      g.stroke();
    }
    g.fillStyle = '#3a3a42';
    g.fillRect(2, 34, 68, 5);
    return texFromCanvas(c);
  }
  function buildFire() {
    var c = document.createElement('canvas');
    c.width = 48; c.height = 48;
    var g = c.getContext('2d');
    g.fillStyle = '#e25822';
    g.beginPath();
    g.moveTo(24, 4);
    g.quadraticCurveTo(44, 28, 24, 46);
    g.quadraticCurveTo(4, 28, 24, 4);
    g.fill();
    g.fillStyle = '#ffd166';
    g.beginPath();
    g.moveTo(24, 18);
    g.quadraticCurveTo(34, 32, 24, 42);
    g.quadraticCurveTo(14, 32, 24, 18);
    g.fill();
    return texFromCanvas(c);
  }
  function buildCoin() {
    var c = document.createElement('canvas');
    c.width = 40; c.height = 40;
    var g = c.getContext('2d');
    g.fillStyle = '#ffd166';
    g.beginPath();
    g.arc(20, 20, 16, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#b88920';
    g.lineWidth = 3;
    g.stroke();
    return texFromCanvas(c);
  }

  function boot() {
    if (typeof cc === 'undefined' || !window.WBStore) {
      bootMsg('引擎没加载上，请刷新', true);
      return;
    }
    window.addEventListener('error', function (e) { bootMsg(e.message || String(e), true); });
    WB.data = STORE.load(localStorage);
    var q = new URLSearchParams(location.search);
    var lesson = q.get('lesson') || 'tonight';
    var step = +(q.get('step') || '0');
    if (lesson !== 'tonight') step = 0;
    if (isNaN(step)) step = 0;
    WB.ui.step = Math.max(0, Math.min(3, step));
    if (q.get('look') === '1') WB.ui.look = 1;
    cc.game.onStart = function () {
      try {
        cc.view.enableRetina(false);
        cc.view.adjustViewPort(true);
        cc.view.setDesignResolutionSize(W, H, cc.ResolutionPolicy.SHOW_ALL);
        cc.view.resizeWithBrowserSize(true);
        var centerCanvas = function () {
          var c = document.getElementById('gameCanvas');
          if (!c) return;
          var cw = parseFloat(c.style.width) || c.offsetWidth;
          var ch = parseFloat(c.style.height) || c.offsetHeight;
          c.style.position = 'fixed';
          c.style.margin = '0';
          c.style.left = Math.max(0, Math.round((window.innerWidth - cw) / 2)) + 'px';
          c.style.top = Math.max(0, Math.round((window.innerHeight - ch) / 2)) + 'px';
        };
        cc.view.setResizeCallback(centerCanvas);
        setTimeout(centerCanvas, 0);
        tex.spike = buildSpike();
        tex.fire = buildFire();
        tex.coin = buildCoin();
        var res = [SP + 'walk_0.png', SP + 'walk_1.png', SP + 'walk_2.png', SP + 'walk_3.png', SP + 'idle.png', SP + 'knock_0.png'].concat(AV);
        var left = res.length;
        function tick() {
          left--;
          if (left > 0) return;
          if (lesson !== 'tonight') {
            var layer = new cc.Layer();
            var scene = new cc.Scene();
            scene.addChild(layer);
            plate(layer, 0, 0, W, H, ccColor(20, 28, 56), 0);
            words(layer, '这一课还没迁进工作台', W / 2, H / 2 + 20, 28, '#ffe7a0', 2);
            words(layer, '今晚四步已经可以打开', W / 2, H / 2 - 30, 20, '#ffffff', 2);
            button(layer, '打开今晚四步', W / 2, H / 2 - 90, 240, 52, GREEN, WHITE, function () {
              location.search = '?lesson=tonight&step=0';
            });
            cc.director.runScene(scene);
          } else {
            show(WB.ui.step);
          }
          WB.ready = true;
          WB.show = show;
          bootMsg('');
        }
        res.forEach(function (src) {
          var img = new Image();
          img.onload = function () { try { cc.textureCache.addImage(src); } catch (e1) {} tick(); };
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
