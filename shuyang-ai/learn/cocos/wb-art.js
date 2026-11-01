/**
 * 今晚四步的小图。按旧课件 ld-art.js / level-design 今晚画布的配色和零件来画，
 * 再交给 Cocos 精灵拼进场景。这里没有整页截图。
 */
(function () {
  var W = 960, H = 540;
  var SC = '../../../xy-go/scenes/';
  var SP = '../../../xy-go/sprites/green/';
  var tex = {};
  var avatars = {};
  var roundCache = {};
  var frameCache = {};

  function canvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }
  function texFromCanvas(c) {
    var t = new cc.Texture2D();
    t.initWithElement(c);
    t.handleLoadedTexture();
    return t;
  }
  function roundPath(g, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }
  function starPath(g, x, y, r) {
    g.beginPath();
    var i, R, a;
    for (i = 0; i < 10; i++) {
      R = i % 2 ? r * 0.45 : r;
      a = i / 10 * Math.PI * 2 - Math.PI / 2;
      g.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R);
    }
    g.closePath();
  }

  function buildSky() {
    var c = canvas(8, 256), g = c.getContext('2d');
    var gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#7eb6ef');
    gr.addColorStop(0.55, '#5a8ec8');
    gr.addColorStop(1, '#3d6a9a');
    g.fillStyle = gr;
    g.fillRect(0, 0, 8, 256);
    return texFromCanvas(c);
  }
  function buildNight() {
    var c = canvas(8, 256), g = c.getContext('2d');
    var gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#1a2448');
    gr.addColorStop(0.55, '#141c38');
    gr.addColorStop(1, '#0c1024');
    g.fillStyle = gr;
    g.fillRect(0, 0, 8, 256);
    return texFromCanvas(c);
  }
  function buildWater() {
    var c = canvas(8, 256), g = c.getContext('2d');
    var gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#0e1e34');
    gr.addColorStop(0.34, '#16375f');
    gr.addColorStop(0.48, '#1e5a96');
    gr.addColorStop(0.62, '#2f74b8');
    gr.addColorStop(1, '#17487a');
    g.fillStyle = gr;
    g.fillRect(0, 0, 8, 256);
    return texFromCanvas(c);
  }
  function buildHills() {
    var w = 480, h = 170;
    var c = canvas(w, h), g = c.getContext('2d');
    g.beginPath();
    g.moveTo(0, h);
    g.lineTo(0, 108);
    g.quadraticCurveTo(70, 28, 150, 86);
    g.quadraticCurveTo(210, 128, 270, 64);
    g.quadraticCurveTo(340, 8, 410, 70);
    g.quadraticCurveTo(450, 96, w, 58);
    g.lineTo(w, h);
    g.closePath();
    g.fillStyle = '#2d4a6e';
    g.fill();
    g.strokeStyle = '#7eb4e4';
    g.lineWidth = 5;
    g.stroke();
    g.beginPath();
    g.moveTo(0, h);
    g.lineTo(0, 132);
    g.quadraticCurveTo(120, 78, 240, 124);
    g.quadraticCurveTo(360, 156, w, 112);
    g.lineTo(w, h);
    g.closePath();
    g.fillStyle = '#3d6294';
    g.fill();
    return texFromCanvas(c);
  }
  function buildCloud() {
    var c = canvas(120, 64), g = c.getContext('2d');
    g.fillStyle = 'rgba(255,255,255,0.95)';
    g.beginPath();
    g.arc(36, 40, 16, 0, Math.PI * 2);
    g.arc(58, 30, 22, 0, Math.PI * 2);
    g.arc(84, 38, 16, 0, Math.PI * 2);
    g.fill();
    return texFromCanvas(c);
  }
  function buildSun() {
    var c = canvas(96, 96), g = c.getContext('2d');
    var gr = g.createRadialGradient(48, 48, 8, 48, 48, 46);
    gr.addColorStop(0, '#fff4c4');
    gr.addColorStop(0.45, '#ffe07a');
    gr.addColorStop(1, 'rgba(255,224,122,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 96, 96);
    return texFromCanvas(c);
  }
  function buildWave() {
    var c = canvas(150, 40), g = c.getContext('2d');
    g.fillStyle = 'rgba(90,170,230,0.55)';
    g.beginPath();
    g.ellipse(75, 22, 68, 12, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.beginPath();
    g.ellipse(62, 16, 28, 5, 0, 0, Math.PI * 2);
    g.fill();
    return texFromCanvas(c);
  }
  function buildBubble() {
    var c = canvas(28, 28), g = c.getContext('2d');
    g.strokeStyle = 'rgba(220,240,255,0.9)';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(14, 14, 9, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.85)';
    g.beginPath();
    g.arc(10, 10, 2.2, 0, Math.PI * 2);
    g.fill();
    return texFromCanvas(c);
  }
  function buildPixel() {
    var c = canvas(4, 4), g = c.getContext('2d');
    g.fillStyle = '#fff';
    g.fillRect(0, 0, 4, 4);
    return texFromCanvas(c);
  }
  function buildSpike() {
    var w = 72, h = 46;
    var c = canvas(w, h), g = c.getContext('2d');
    var n = 4, gap = w / n, k, sx;
    for (k = 0; k < n; k++) {
      sx = k * gap + 1;
      g.fillStyle = '#e7eef5';
      g.beginPath();
      g.moveTo(sx, h - 1);
      g.lineTo(sx + gap * 0.42, 3);
      g.lineTo(sx + gap * 0.9, h - 1);
      g.closePath();
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.75)';
      g.beginPath();
      g.moveTo(sx + gap * 0.28, h - 1);
      g.lineTo(sx + gap * 0.42, 6);
      g.lineTo(sx + gap * 0.5, h - 1);
      g.closePath();
      g.fill();
      g.strokeStyle = '#7a8794';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(sx, h - 1);
      g.lineTo(sx + gap * 0.42, 3);
      g.lineTo(sx + gap * 0.9, h - 1);
      g.stroke();
    }
    return texFromCanvas(c);
  }
  /* ld-art.js 的火、币、星、旗，64 方格，底边靠下 */
  function buildFire() {
    var c = canvas(64, 64), g = c.getContext('2d');
    g.save();
    g.translate(18, 62);
    g.scale(1.3, 1.3);
    g.fillStyle = '#3a3a42';
    g.fillRect(-14, -6, 28, 10);
    g.fillStyle = '#222228';
    g.fillRect(-10, -18, 20, 14);
    g.fillStyle = '#6a6a74';
    g.beginPath();
    g.arc(0, -20, 7, 0, Math.PI * 2);
    g.fill();
    g.translate(0, -20);
    g.fillStyle = '#4e4e58';
    g.fillRect(0, -4, 22, 8);
    g.fillStyle = '#8a8a96';
    g.fillRect(18, -5, 8, 10);
    g.fillStyle = 'rgba(255,239,138,0.8)';
    g.beginPath();
    g.moveTo(26, 0);
    g.lineTo(36, -6);
    g.lineTo(36, 6);
    g.closePath();
    g.fill();
    g.restore();
    g.fillStyle = '#ff3030';
    g.beginPath();
    g.arc(18, 16, 4, 0, Math.PI * 2);
    g.fill();
    return texFromCanvas(c);
  }
  function buildCoin() {
    var c = canvas(64, 64), g = c.getContext('2d');
    g.fillStyle = '#ffd166';
    g.beginPath();
    g.ellipse(32, 34, 16, 22, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#f0b43c';
    g.beginPath();
    g.ellipse(32, 34, 8, 13, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#fff3c4';
    g.beginPath();
    g.ellipse(27, 28, 3, 6, -0.4, 0, Math.PI * 2);
    g.fill();
    return texFromCanvas(c);
  }
  function buildStar() {
    var c = canvas(64, 64), g = c.getContext('2d');
    g.fillStyle = '#ffe14a';
    starPath(g, 32, 34, 22);
    g.fill();
    g.strokeStyle = '#c99a10';
    g.lineWidth = 2;
    g.stroke();
    return texFromCanvas(c);
  }
  function buildFlag() {
    var c = canvas(64, 64), g = c.getContext('2d');
    g.fillStyle = '#5a3b22';
    g.fillRect(10, 4, 6, 58);
    g.fillStyle = '#3ec0ea';
    g.beginPath();
    g.moveTo(16, 6);
    g.lineTo(58, 20);
    g.lineTo(16, 34);
    g.closePath();
    g.fill();
    g.fillStyle = '#e8f8ff';
    g.beginPath();
    g.moveTo(16, 12);
    g.lineTo(40, 20);
    g.lineTo(16, 24);
    g.closePath();
    g.fill();
    return texFromCanvas(c);
  }
  function buildFish() {
    var c = canvas(220, 130), g = c.getContext('2d');
    g.fillStyle = '#e07a28';
    g.beginPath();
    g.moveTo(48, 68);
    g.lineTo(10, 28);
    g.quadraticCurveTo(28, 68, 10, 108);
    g.closePath();
    g.fill();
    g.fillStyle = '#f6a23a';
    g.beginPath();
    g.ellipse(118, 70, 74, 40, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#ffe1a8';
    g.beginPath();
    g.ellipse(126, 84, 46, 20, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#d97820';
    g.beginPath();
    g.ellipse(102, 66, 7, 30, -0.35, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.ellipse(128, 64, 6, 26, -0.15, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#e07a28';
    g.beginPath();
    g.moveTo(92, 42);
    g.quadraticCurveTo(124, 6, 154, 38);
    g.quadraticCurveTo(124, 30, 92, 42);
    g.fill();
    g.beginPath();
    g.moveTo(108, 88);
    g.quadraticCurveTo(96, 118, 146, 98);
    g.quadraticCurveTo(124, 90, 108, 88);
    g.fill();
    g.fillStyle = '#fff';
    g.beginPath();
    g.arc(162, 58, 13, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#1b1b2a';
    g.beginPath();
    g.arc(166, 58, 6, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#fff';
    g.beginPath();
    g.arc(168, 56, 2, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#8a3e12';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(172, 74, 10, 0.15, 1.3);
    g.stroke();
    return texFromCanvas(c);
  }
  function buildWorm() {
    var c = canvas(84, 48), g = c.getContext('2d');
    g.strokeStyle = '#c45a7a';
    g.lineWidth = 10;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(10, 34);
    g.quadraticCurveTo(28, 6, 46, 28);
    g.quadraticCurveTo(62, 44, 74, 16);
    g.stroke();
    g.fillStyle = '#f0a0b4';
    g.beginPath();
    g.arc(74, 16, 8, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#1b1b2a';
    g.beginPath();
    g.arc(71, 14, 1.5, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.arc(77, 14, 1.5, 0, Math.PI * 2);
    g.fill();
    return texFromCanvas(c);
  }
  function buildHook() {
    var c = canvas(72, 110), g = c.getContext('2d');
    g.strokeStyle = '#d5dde6';
    g.lineWidth = 7;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(40, 4);
    g.lineTo(40, 58);
    g.arc(24, 64, 16, -0.15, Math.PI * 1.05, false);
    g.stroke();
    g.beginPath();
    g.moveTo(12, 52);
    g.lineTo(4, 40);
    g.stroke();
    g.fillStyle = '#9aa6b4';
    g.beginPath();
    g.arc(40, 8, 4, 0, Math.PI * 2);
    g.fill();
    return texFromCanvas(c);
  }
  function buildHeart() {
    var c = canvas(36, 36), g = c.getContext('2d');
    g.fillStyle = '#ff5a6a';
    g.beginPath();
    g.moveTo(18, 30);
    g.bezierCurveTo(18, 30, 2, 20, 6, 11);
    g.bezierCurveTo(9, 4, 18, 8, 18, 13);
    g.bezierCurveTo(18, 8, 27, 4, 30, 11);
    g.bezierCurveTo(34, 20, 18, 30, 18, 30);
    g.fill();
    return texFromCanvas(c);
  }
  function buildPad() {
    var c = canvas(120, 78), g = c.getContext('2d');
    g.fillStyle = '#2c3550';
    roundPath(g, 4, 8, 112, 62, 16);
    g.fill();
    g.fillStyle = '#1b2236';
    roundPath(g, 36, 16, 48, 26, 6);
    g.fill();
    g.fillStyle = '#9ff0a8';
    g.fillRect(42, 22, 28, 5);
    g.fillStyle = '#cfd6e6';
    g.fillRect(16, 40, 20, 6);
    g.fillRect(23, 33, 6, 20);
    g.fillStyle = '#e23b3b';
    g.beginPath();
    g.arc(96, 36, 7, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#ffe14a';
    g.beginPath();
    g.arc(82, 48, 6, 0, Math.PI * 2);
    g.fill();
    return texFromCanvas(c);
  }
  function buildShield() {
    var c = canvas(64, 72), g = c.getContext('2d');
    g.fillStyle = '#7ec8ff';
    g.beginPath();
    g.moveTo(32, 4);
    g.lineTo(58, 16);
    g.lineTo(58, 34);
    g.quadraticCurveTo(32, 68, 6, 34);
    g.lineTo(6, 16);
    g.closePath();
    g.fill();
    g.strokeStyle = '#e8f6ff';
    g.lineWidth = 3;
    g.stroke();
    g.strokeStyle = '#1b1b2a';
    g.lineWidth = 4;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(20, 34);
    g.lineTo(30, 46);
    g.lineTo(46, 24);
    g.stroke();
    return texFromCanvas(c);
  }
  function buildClock() {
    var c = canvas(64, 64), g = c.getContext('2d');
    g.fillStyle = '#ffe7a0';
    g.beginPath();
    g.arc(32, 34, 24, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#1b1b2a';
    g.beginPath();
    g.arc(32, 34, 18, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#ffe7a0';
    g.lineWidth = 3;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(32, 34);
    g.lineTo(32, 22);
    g.moveTo(32, 34);
    g.lineTo(42, 38);
    g.stroke();
    return texFromCanvas(c);
  }
  function buildLoop() {
    var c = canvas(64, 64), g = c.getContext('2d');
    g.strokeStyle = '#9fd0ff';
    g.lineWidth = 6;
    g.lineCap = 'round';
    g.beginPath();
    g.arc(32, 32, 18, 0.4, Math.PI * 1.7);
    g.stroke();
    g.fillStyle = '#9fd0ff';
    g.beginPath();
    g.moveTo(48, 16);
    g.lineTo(58, 22);
    g.lineTo(46, 28);
    g.closePath();
    g.fill();
    return texFromCanvas(c);
  }
  function buildHead() {
    var c = canvas(64, 64), g = c.getContext('2d');
    g.fillStyle = '#f0c9a0';
    g.beginPath();
    g.arc(32, 36, 18, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#3a2a22';
    g.beginPath();
    g.arc(32, 28, 18, Math.PI, Math.PI * 2);
    g.fill();
    g.fillStyle = '#1b1b2a';
    g.beginPath();
    g.arc(25, 36, 2, 0, Math.PI * 2);
    g.arc(39, 36, 2, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#c45a7a';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(32, 44, 6, 0.2, Math.PI - 0.2);
    g.stroke();
    return texFromCanvas(c);
  }

  function build() {
    tex.sky = buildSky();
    tex.night = buildNight();
    tex.water = buildWater();
    tex.hills = buildHills();
    tex.cloud = buildCloud();
    tex.sun = buildSun();
    tex.wave = buildWave();
    tex.bubble = buildBubble();
    tex.pixel = buildPixel();
    tex.spike = buildSpike();
    tex.fire = buildFire();
    tex.coin = buildCoin();
    tex.star = buildStar();
    tex.flag = buildFlag();
    tex.fish = buildFish();
    tex.worm = buildWorm();
    tex.hook = buildHook();
    tex.heart = buildHeart();
    tex.pad = buildPad();
    tex.shield = buildShield();
    tex.clock = buildClock();
    tex.loop = buildLoop();
    tex.head = buildHead();
  }

  function rememberAvatar(src, img) {
    try {
      var S = 72;
      var c = canvas(S, S), g = c.getContext('2d');
      var iw = img.naturalWidth || img.width;
      var ih = img.naturalHeight || img.height;
      if (!iw || !ih) return;
      g.save();
      g.beginPath();
      g.arc(S / 2, S / 2, S / 2 - 4, 0, Math.PI * 2);
      g.closePath();
      g.clip();
      var side = Math.min(iw, ih);
      var sx = (iw - side) / 2;
      var sy = Math.max(0, (ih - side) * 0.12);
      g.drawImage(img, sx, sy, side, side, 3, 3, S - 6, S - 6);
      g.restore();
      g.beginPath();
      g.arc(S / 2, S / 2, S / 2 - 3.5, 0, Math.PI * 2);
      g.strokeStyle = '#ffe7a0';
      g.lineWidth = 4;
      g.stroke();
      avatars[src] = texFromCanvas(c);
    } catch (e) {}
  }

  function roundTex(w, h, rad) {
    w = Math.max(2, Math.round(w));
    h = Math.max(2, Math.round(h));
    rad = Math.round(rad == null ? Math.min(16, h / 2) : rad);
    var key = w + 'x' + h + 'r' + rad;
    if (roundCache[key]) return roundCache[key];
    var c = canvas(w, h), g = c.getContext('2d');
    g.fillStyle = '#fff';
    roundPath(g, 0, 0, w, h, rad);
    g.fill();
    roundCache[key] = texFromCanvas(c);
    return roundCache[key];
  }
  function frameTex(w, h, rad) {
    w = Math.max(4, Math.round(w));
    h = Math.max(4, Math.round(h));
    rad = Math.round(rad == null ? 14 : rad);
    var key = w + 'x' + h + 'r' + rad;
    if (frameCache[key]) return frameCache[key];
    var c = canvas(w, h), g = c.getContext('2d');
    g.strokeStyle = '#fff';
    g.lineWidth = 3;
    roundPath(g, 2, 2, w - 4, h - 4, rad);
    g.stroke();
    frameCache[key] = texFromCanvas(c);
    return frameCache[key];
  }

  function place(parent, texture, x, y, opt) {
    opt = opt || {};
    var sp = new cc.Sprite(texture);
    var ap = opt.anchor || [0.5, 0.5];
    sp.setAnchorPoint(ap[0], ap[1]);
    sp.setPosition(x, y);
    if (opt.h) {
      var sz = sp.getContentSize();
      if (sz.height > 2) sp.setScale(opt.h / sz.height);
    }
    if (opt.color) sp.setColor(opt.color);
    if (opt.opacity != null) sp.setOpacity(opt.opacity);
    if (opt.rot) sp.setRotation(opt.rot);
    parent.addChild(sp, opt.z == null ? 5 : opt.z);
    return sp;
  }
  function panel(parent, cx, cy, w, h, color, opacity, z, rad) {
    var sp = new cc.Sprite(roundTex(w, h, rad == null ? Math.min(18, h / 2) : rad));
    sp.setPosition(cx, cy);
    if (color) sp.setColor(color);
    if (opacity != null) sp.setOpacity(opacity);
    parent.addChild(sp, z || 0);
    return sp;
  }
  function frame(parent, cx, cy, w, h, color, opacity, z, rad) {
    var sp = new cc.Sprite(frameTex(w, h, rad == null ? 16 : rad));
    sp.setPosition(cx, cy);
    if (color) sp.setColor(color);
    if (opacity != null) sp.setOpacity(opacity);
    parent.addChild(sp, z || 1);
    return sp;
  }
  function fill(layer, texture, z) {
    var sp = place(layer, texture, 0, 0, { anchor: [0, 0], z: z || 0 });
    var s = sp.getContentSize();
    if (s.width > 1 && s.height > 1) sp.setScale(W / s.width, H / s.height);
    return sp;
  }
  function dressSky(layer, gy) {
    fill(layer, tex.sky, 0);
    var hill = place(layer, tex.hills, 0, gy - 24, { anchor: [0, 0], z: 1 });
    var hs = hill.getContentSize();
    if (hs.width > 2) hill.setScaleX(W / hs.width);
    var sun = place(layer, tex.sun, 86, H - 86, { h: 70, z: 1 });
    var spots = [[210, H - 150, 34], [520, H - 124, 26], [780, H - 158, 30]];
    var clouds = [];
    var i, cld;
    for (i = 0; i < spots.length; i++) {
      cld = place(layer, tex.cloud, spots[i][0], spots[i][1], { h: spots[i][2], z: 1, opacity: 230 });
      cld._x0 = spots[i][0];
      cld._y0 = spots[i][1];
      clouds.push(cld);
    }
    return { clouds: clouds, sun: sun, hill: hill };
  }
  function dressWater(layer) {
    fill(layer, tex.water, 0);
    var waves = [];
    var i, w;
    for (i = 0; i < 8; i++) {
      w = place(layer, tex.wave, 20 + i * 130, 260, { h: 26, z: 2, opacity: 210 });
      w._x0 = 20 + i * 130;
      waves.push(w);
    }
    return { waves: waves };
  }
  function addGround(layer, x, y, width, z, rows) {
    var tw = 40;
    var dirtPath = SC + 'dirt-tile.png';
    var grassPath = SC + 'grass-cap.png';
    var probe = new cc.Sprite(dirtPath);
    if (probe.getContentSize().width < 2) {
      var bed = new cc.LayerColor(cc.color(107, 79, 47), Math.max(2, width), 32);
      bed.setPosition(x, y - 32);
      layer.addChild(bed, z || 2);
      var cap = new cc.LayerColor(cc.color(78, 168, 92), Math.max(2, width), 8);
      cap.setPosition(x, y - 2);
      layer.addChild(cap, (z || 2) + 1);
      return;
    }
    rows = rows == null ? 1 : rows;
    var col, r, dirt, dw, tile, grass;
    for (r = 0; r < rows; r++) {
      for (col = 0; col * tw < width; col++) {
        dw = Math.min(tw, width - col * tw);
        dirt = new cc.Sprite(dirtPath);
        dirt.setAnchorPoint(0, 1);
        dirt.setPosition(x + col * tw, y - r * tw);
        dirt.setScale(dw / 40, 1);
        layer.addChild(dirt, z || 2);
      }
    }
    for (col = 0; col * tw < width; col++) {
      dw = Math.min(tw, width - col * tw);
      grass = new cc.Sprite(grassPath);
      grass.setAnchorPoint(0, 0);
      grass.setPosition(x + col * tw, y - 2);
      grass.setScale(dw / 40, 14 / 18);
      layer.addChild(grass, (z || 2) + 1);
    }
  }

  window.WBArt = {
    W: W,
    H: H,
    SC: SC,
    SP: SP,
    tex: tex,
    avatars: avatars,
    build: build,
    rememberAvatar: rememberAvatar,
    place: place,
    panel: panel,
    frame: frame,
    fill: fill,
    dressSky: dressSky,
    dressWater: dressWater,
    addGround: addGround
  };
})();
