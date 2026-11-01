/**
 * 今晚六步的小图。按旧课件 ld-art.js / level-design 今晚画布的配色和零件来画，
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

  function shadeRect(g, w, h, stops) {
    var gr = g.createLinearGradient(0, 0, 0, h);
    var i;
    for (i = 0; i < stops.length; i++) gr.addColorStop(stops[i][0], stops[i][1]);
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  }
  function buildSky() {
    var w = 480, h = 256;
    var c = canvas(w, h), g = c.getContext('2d');
    /* Match old tonight canvas #6ec8ff mid, with soft depth */
    shadeRect(g, w, h, [
      [0, '#b7e4ff'],
      [0.22, '#6ec8ff'],
      [0.55, '#5bb6f0'],
      [0.78, '#4a9ad4'],
      [1, '#7eb8d8']
    ]);
    g.fillStyle = 'rgba(255,255,255,0.14)';
    g.beginPath();
    g.ellipse(120, 70, 90, 18, -0.2, 0, Math.PI * 2);
    g.ellipse(300, 110, 120, 16, 0.15, 0, Math.PI * 2);
    g.fill();
    var haze = g.createLinearGradient(0, 170, 0, 256);
    haze.addColorStop(0, 'rgba(255,244,220,0)');
    haze.addColorStop(1, 'rgba(255,236,200,0.28)');
    g.fillStyle = haze;
    g.fillRect(0, 170, w, 86);
    return texFromCanvas(c);
  }
  function buildNight() {
    var c = canvas(32, 256), g = c.getContext('2d');
    shadeRect(g, 32, 256, [
      [0, '#243056'],
      [0.42, '#161e3c'],
      [1, '#0c1024']
    ]);
    g.fillStyle = 'rgba(180,200,255,0.05)';
    g.fillRect(0, 0, 32, 80);
    return texFromCanvas(c);
  }
  function buildWater() {
    var w = 480, h = 320;
    var c = canvas(w, h), g = c.getContext('2d');
    shadeRect(g, w, h, [
      [0, '#0c1830'],
      [0.28, '#143056'],
      [0.42, '#1d4f86'],
      [0.48, '#7ec8ea'],
      [0.54, '#2f78b4'],
      [0.78, '#1a568c'],
      [1, '#0e3a62']
    ]);
    g.save();
    g.globalAlpha = 0.09;
    g.fillStyle = '#eaf8ff';
    var i, a;
    for (i = 0; i < 6; i++) {
      g.beginPath();
      g.moveTo(60 + i * 78, 152);
      g.lineTo(46 + i * 78, 310);
      g.lineTo(86 + i * 78, 310);
      g.closePath();
      g.fill();
    }
    g.restore();
    g.fillStyle = 'rgba(255,255,255,0.16)';
    for (i = 0; i < 14; i++) {
      a = 0.25 + (i % 3) * 0.12;
      g.globalAlpha = a;
      g.beginPath();
      g.ellipse(30 + (i * 67) % 450, 175 + (i % 5) * 22, 16 + (i % 4) * 6, 5, (i % 2 ? 0.4 : -0.3), 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
    var band = g.createLinearGradient(0, 142, 0, 168);
    band.addColorStop(0, 'rgba(255,255,255,0)');
    band.addColorStop(0.5, 'rgba(255,255,255,0.55)');
    band.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = band;
    g.fillRect(0, 142, w, 26);
    return texFromCanvas(c);
  }
  function crest(g, w, h, y0) {
    g.beginPath();
    g.moveTo(0, h);
    g.lineTo(0, y0);
    g.quadraticCurveTo(w * 0.16, y0 - 70, w * 0.34, y0 - 18);
    g.quadraticCurveTo(w * 0.48, y0 + 16, w * 0.62, y0 - 42);
    g.quadraticCurveTo(w * 0.78, y0 - 88, w * 0.92, y0 - 24);
    g.quadraticCurveTo(w * 0.98, y0 - 8, w, y0 - 36);
    g.lineTo(w, h);
    g.closePath();
  }
  function buildHills() {
    var w = 640, h = 180;
    var c = canvas(w, h), g = c.getContext('2d');
    crest(g, w, h, 118);
    g.save();
    g.clip();
    var gr = g.createLinearGradient(0, 20, 0, h);
    gr.addColorStop(0, '#8eb8dc');
    gr.addColorStop(0.28, '#4f7eae');
    gr.addColorStop(1, '#243e5c');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(214,236,255,0.7)';
    g.lineWidth = 3;
    crest(g, w, h, 118);
    g.stroke();
    g.restore();
    return texFromCanvas(c);
  }
  function buildHillsFar() {
    var w = 640, h = 120;
    var c = canvas(w, h), g = c.getContext('2d');
    g.beginPath();
    g.moveTo(0, h);
    g.lineTo(0, 78);
    g.quadraticCurveTo(140, 18, 280, 70);
    g.quadraticCurveTo(420, 108, 520, 46);
    g.quadraticCurveTo(600, 20, w, 62);
    g.lineTo(w, h);
    g.closePath();
    g.fillStyle = 'rgba(176,206,230,0.55)';
    g.fill();
    return texFromCanvas(c);
  }
  function buildCloud() {
    var c = canvas(140, 72), g = c.getContext('2d');
    g.fillStyle = 'rgba(90,120,150,0.28)';
    g.beginPath();
    g.ellipse(72, 52, 48, 12, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(42, 40, 16, 0, Math.PI * 2);
    g.arc(66, 30, 22, 0, Math.PI * 2);
    g.arc(94, 38, 16, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.85)';
    g.beginPath();
    g.ellipse(58, 26, 16, 8, 0, 0, Math.PI * 2);
    g.fill();
    return texFromCanvas(c);
  }
  function buildSun() {
    var c = canvas(160, 160), g = c.getContext('2d');
    var gr = g.createRadialGradient(80, 80, 6, 80, 80, 78);
    gr.addColorStop(0, '#fffceb');
    gr.addColorStop(0.18, '#ffe7a0');
    gr.addColorStop(0.42, 'rgba(255,214,120,0.55)');
    gr.addColorStop(1, 'rgba(255,214,120,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 160, 160);
    return texFromCanvas(c);
  }
  function buildWave() {
    var c = canvas(160, 28), g = c.getContext('2d');
    g.strokeStyle = 'rgba(220,244,255,0.85)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(4, 16);
    g.quadraticCurveTo(28, 4, 52, 16);
    g.quadraticCurveTo(78, 28, 104, 14);
    g.quadraticCurveTo(128, 4, 156, 16);
    g.stroke();
    g.strokeStyle = 'rgba(120,190,230,0.45)';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(8, 20);
    g.quadraticCurveTo(40, 10, 80, 20);
    g.quadraticCurveTo(120, 30, 152, 18);
    g.stroke();
    return texFromCanvas(c);
  }
  function buildGlint() {
    var c = canvas(90, 10), g = c.getContext('2d');
    var gr = g.createLinearGradient(0, 0, 90, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)');
    gr.addColorStop(0.5, 'rgba(255,255,255,0.9)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 3, 90, 3);
    return texFromCanvas(c);
  }
  function buildBlob() {
    var c = canvas(80, 28), g = c.getContext('2d');
    var gr = g.createRadialGradient(40, 14, 2, 40, 14, 36);
    gr.addColorStop(0, 'rgba(0,0,0,0.55)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 80, 28);
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
    var w = 84, h = 56;
    var c = canvas(w, h), g = c.getContext('2d');
    g.fillStyle = 'rgba(20,16,16,0.28)';
    g.beginPath();
    g.ellipse(w / 2, h - 4, 30, 4, 0, 0, Math.PI * 2);
    g.fill();
    var n = 4, gap = (w - 8) / n, k, sx, grd;
    for (k = 0; k < n; k++) {
      sx = 4 + k * gap;
      g.beginPath();
      g.moveTo(sx, h - 6);
      g.lineTo(sx + gap * 0.46, 4);
      g.lineTo(sx + gap * 0.92, h - 6);
      g.closePath();
      grd = g.createLinearGradient(sx, h, sx + gap, 0);
      grd.addColorStop(0, '#6d7b8a');
      grd.addColorStop(0.45, '#d5dee8');
      grd.addColorStop(1, '#f7fbff');
      g.fillStyle = grd;
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.8)';
      g.beginPath();
      g.moveTo(sx + gap * 0.34, h - 8);
      g.lineTo(sx + gap * 0.46, 8);
      g.lineTo(sx + gap * 0.54, h - 8);
      g.closePath();
      g.fill();
      g.strokeStyle = 'rgba(70,82,96,0.7)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(sx, h - 6);
      g.lineTo(sx + gap * 0.46, 4);
      g.lineTo(sx + gap * 0.92, h - 6);
      g.stroke();
    }
    return texFromCanvas(c);
  }
  /* ld-art.js 的火、币、星、旗，64 方格，底边靠下 */
  function buildFire() {
    var c = canvas(96, 64), g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,0.25)';
    g.beginPath();
    g.ellipse(34, 58, 22, 4, 0, 0, Math.PI * 2);
    g.fill();
    var body = g.createLinearGradient(8, 20, 8, 58);
    body.addColorStop(0, '#6a6e78');
    body.addColorStop(0.45, '#2c3038');
    body.addColorStop(1, '#12141a');
    g.fillStyle = body;
    roundPath(g, 10, 28, 36, 26, 6);
    g.fill();
    g.fillStyle = '#8d929c';
    g.fillRect(14, 32, 28, 4);
    var nozzle = g.createLinearGradient(40, 24, 70, 40);
    nozzle.addColorStop(0, '#9aa0aa');
    nozzle.addColorStop(1, '#3a3e46');
    g.fillStyle = nozzle;
    g.beginPath();
    g.moveTo(40, 30);
    g.lineTo(68, 24);
    g.lineTo(68, 46);
    g.lineTo(40, 40);
    g.closePath();
    g.fill();
    var flame = g.createLinearGradient(66, 34, 94, 34);
    flame.addColorStop(0, 'rgba(255,244,200,0.95)');
    flame.addColorStop(0.45, 'rgba(255,170,60,0.9)');
    flame.addColorStop(1, 'rgba(255,80,20,0)');
    g.fillStyle = flame;
    g.beginPath();
    g.moveTo(64, 30);
    g.quadraticCurveTo(92, 22, 94, 34);
    g.quadraticCurveTo(92, 46, 64, 40);
    g.closePath();
    g.fill();
    var lamp = g.createRadialGradient(22, 18, 1, 22, 18, 8);
    lamp.addColorStop(0, '#fff');
    lamp.addColorStop(0.4, '#ff4040');
    lamp.addColorStop(1, 'rgba(255,40,40,0)');
    g.fillStyle = lamp;
    g.beginPath();
    g.arc(22, 18, 8, 0, Math.PI * 2);
    g.fill();
    return texFromCanvas(c);
  }
  function buildCoin() {
    var c = canvas(64, 64), g = c.getContext('2d');
    g.fillStyle = 'rgba(90,50,0,0.28)';
    g.beginPath();
    g.ellipse(34, 40, 16, 18, 0, 0, Math.PI * 2);
    g.fill();
    var rim = g.createRadialGradient(28, 28, 4, 32, 34, 22);
    rim.addColorStop(0, '#fff6c8');
    rim.addColorStop(0.45, '#ffd166');
    rim.addColorStop(0.78, '#e09a22');
    rim.addColorStop(1, '#a86a10');
    g.fillStyle = rim;
    g.beginPath();
    g.ellipse(32, 32, 16, 22, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#c98416';
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(32, 32, 9, 13, 0, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.75)';
    g.beginPath();
    g.ellipse(26, 24, 3, 7, -0.5, 0, Math.PI * 2);
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
    var c = canvas(280, 160), g = c.getContext('2d');
    g.fillStyle = 'rgba(20,40,70,0.0)';
    var tail = g.createLinearGradient(8, 40, 70, 90);
    tail.addColorStop(0, '#c45a18');
    tail.addColorStop(1, '#f0a04a');
    g.fillStyle = tail;
    g.beginPath();
    g.moveTo(62, 82);
    g.quadraticCurveTo(18, 36, 8, 28);
    g.quadraticCurveTo(28, 78, 8, 132);
    g.quadraticCurveTo(22, 118, 62, 86);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(255,220,160,0.35)';
    g.beginPath();
    g.moveTo(48, 80);
    g.lineTo(16, 40);
    g.lineTo(22, 80);
    g.lineTo(14, 120);
    g.closePath();
    g.fill();
    var body = g.createRadialGradient(150, 70, 10, 150, 86, 90);
    body.addColorStop(0, '#ffe0a4');
    body.addColorStop(0.35, '#f6a23a');
    body.addColorStop(0.8, '#e07a28');
    body.addColorStop(1, '#b85a16');
    g.fillStyle = body;
    g.beginPath();
    g.ellipse(156, 86, 92, 46, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#ffe7c2';
    g.beginPath();
    g.ellipse(162, 102, 52, 22, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = 'rgba(160,70,20,0.35)';
    g.lineWidth = 1.2;
    var i;
    for (i = 0; i < 7; i++) {
      g.beginPath();
      g.arc(108 + i * 14, 78, 10, 0.4, 2.4);
      g.stroke();
    }
    var fin = g.createLinearGradient(110, 20, 160, 50);
    fin.addColorStop(0, '#ffb15a');
    fin.addColorStop(1, '#d26520');
    g.fillStyle = fin;
    g.beginPath();
    g.moveTo(118, 52);
    g.quadraticCurveTo(150, 8, 196, 46);
    g.quadraticCurveTo(156, 40, 118, 52);
    g.fill();
    g.strokeStyle = 'rgba(120,50,10,0.35)';
    g.beginPath();
    g.moveTo(130, 48);
    g.quadraticCurveTo(156, 28, 184, 46);
    g.stroke();
    g.fillStyle = '#e07a28';
    g.beginPath();
    g.moveTo(140, 108);
    g.quadraticCurveTo(128, 142, 188, 118);
    g.quadraticCurveTo(160, 112, 140, 108);
    g.fill();
    g.fillStyle = '#fff';
    g.beginPath();
    g.arc(214, 72, 15, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#1b2430';
    g.beginPath();
    g.arc(218, 73, 7, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#fff';
    g.beginPath();
    g.arc(221, 70, 2.4, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#8a3e12';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(226, 92, 10, 0.2, 1.15);
    g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.45)';
    g.beginPath();
    g.ellipse(168, 70, 28, 8, -0.3, 0, Math.PI * 2);
    g.fill();
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
  function strokeHook(g, w, h) {
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.strokeStyle = '#8b97a6';
    g.lineWidth = Math.max(4, h * 0.07);
    g.beginPath();
    g.moveTo(w * 0.62, h * 0.04);
    g.lineTo(w * 0.62, h * 0.52);
    g.arc(w * 0.40, h * 0.58, h * 0.16, -0.2, Math.PI * 1.08, false);
    g.stroke();
    g.strokeStyle = '#f4f7fb';
    g.lineWidth = Math.max(1.5, h * 0.025);
    g.beginPath();
    g.moveTo(w * 0.58, h * 0.08);
    g.lineTo(w * 0.58, h * 0.5);
    g.stroke();
    g.strokeStyle = '#c5ced8';
    g.lineWidth = Math.max(2, h * 0.04);
    g.beginPath();
    g.moveTo(w * 0.22, h * 0.5);
    g.lineTo(w * 0.08, h * 0.36);
    g.stroke();
    var eye = g.createRadialGradient(w * 0.62, h * 0.08, 1, w * 0.62, h * 0.08, h * 0.05);
    eye.addColorStop(0, '#fff');
    eye.addColorStop(1, '#9aa6b4');
    g.fillStyle = eye;
    g.beginPath();
    g.arc(w * 0.62, h * 0.08, h * 0.045, 0, Math.PI * 2);
    g.fill();
  }
  function buildHook() {
    var c = canvas(80, 120), g = c.getContext('2d');
    strokeHook(g, 80, 120);
    return texFromCanvas(c);
  }
  function buildHookMark() {
    var c = canvas(48, 48), g = c.getContext('2d');
    strokeHook(g, 48, 48);
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

  function buildSpring() {
    var c = canvas(64, 64), g = c.getContext('2d');
    g.strokeStyle = '#c5d0dc';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(32, 58);
    var i;
    for (i = 1; i <= 8; i++) g.lineTo(32 + (i % 2 ? -10 : 10), 58 - i * 5);
    g.stroke();
    g.fillStyle = '#b9c4d0';
    g.strokeStyle = '#8a97a6';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(32, 58);
    for (i = 1; i <= 8; i++) g.lineTo(32 + (i % 2 ? -7 : 7), 58 - i * 5);
    g.stroke();
    g.fillStyle = '#e23b3b';
    roundPath(g, 16, 8, 32, 12, 4);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.45)';
    g.fillRect(20, 10, 10, 3);
    return texFromCanvas(c);
  }
  function buildMist() {
    var c = canvas(64, 64), g = c.getContext('2d');
    var gr = g.createLinearGradient(0, 8, 0, 60);
    gr.addColorStop(0, 'rgba(170,110,210,0.15)');
    gr.addColorStop(0.5, 'rgba(130,60,180,0.55)');
    gr.addColorStop(1, 'rgba(80,30,120,0.25)');
    g.fillStyle = gr;
    g.beginPath();
    g.ellipse(32, 40, 26, 18, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(220,180,255,0.55)';
    [[18, 34, 8], [32, 28, 10], [46, 38, 7], [28, 46, 9]].forEach(function (p) {
      g.beginPath();
      g.ellipse(p[0], p[1], p[2], p[2] * 0.7, 0, 0, Math.PI * 2);
      g.fill();
    });
    return texFromCanvas(c);
  }
  function buildRock() {
    var c = canvas(64, 64), g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,0.25)';
    g.beginPath();
    g.ellipse(32, 56, 18, 5, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#6d6358';
    g.beginPath();
    g.moveTo(12, 52);
    g.lineTo(18, 28);
    g.lineTo(32, 18);
    g.lineTo(48, 30);
    g.lineTo(52, 52);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(255,220,160,0.35)';
    g.beginPath();
    g.moveTo(22, 40);
    g.lineTo(30, 22);
    g.lineTo(36, 36);
    g.closePath();
    g.fill();
    g.strokeStyle = '#3e3830';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(12, 52);
    g.lineTo(18, 28);
    g.lineTo(32, 18);
    g.lineTo(48, 30);
    g.lineTo(52, 52);
    g.stroke();
    return texFromCanvas(c);
  }
  function buildDartIcon() {
    var c = canvas(64, 64), g = c.getContext('2d');
    var i;
    for (i = 0; i < 3; i++) {
      g.save();
      g.translate(18 + i * 12, 46 - i * 6);
      g.rotate(-0.7);
      g.fillStyle = '#d5dde6';
      g.fillRect(0, 0, 28, 4);
      g.fillStyle = '#e23b3b';
      g.beginPath();
      g.moveTo(28, -3);
      g.lineTo(38, 2);
      g.lineTo(28, 7);
      g.fill();
      g.restore();
    }
    return texFromCanvas(c);
  }
  function buildBladeIcon() {
    var c = canvas(64, 64), g = c.getContext('2d');
    g.fillStyle = '#8a5a32';
    g.fillRect(10, 40, 16, 8);
    var gr = g.createLinearGradient(16, 44, 52, 12);
    gr.addColorStop(0, '#f4f7fb');
    gr.addColorStop(1, '#9aa8b8');
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(22, 42);
    g.quadraticCurveTo(48, 36, 52, 10);
    g.quadraticCurveTo(36, 28, 18, 36);
    g.closePath();
    g.fill();
    g.strokeStyle = '#5c6a7a';
    g.stroke();
    return texFromCanvas(c);
  }
  function buildGunIcon() {
    var c = canvas(64, 64), g = c.getContext('2d');
    g.fillStyle = '#3a4250';
    roundPath(g, 8, 26, 40, 12, 3);
    g.fill();
    g.fillStyle = '#5c6778';
    g.fillRect(14, 22, 22, 6);
    g.fillStyle = '#2a303a';
    g.fillRect(18, 38, 8, 12);
    g.fillStyle = '#ffd166';
    g.beginPath();
    g.arc(46, 30, 3, 0, Math.PI * 2);
    g.fill();
    return texFromCanvas(c);
  }

  function build() {
    tex.sky = buildSky();
    tex.night = buildNight();
    tex.water = buildWater();
    tex.hills = buildHills();
    tex.hillsFar = buildHillsFar();
    tex.cloud = buildCloud();
    tex.sun = buildSun();
    tex.wave = buildWave();
    tex.glint = buildGlint();
    tex.blob = buildBlob();
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
    tex.hookMark = buildHookMark();
    tex.spring = buildSpring();
    tex.mist = buildMist();
    tex.rock = buildRock();
    tex.dart = buildDartIcon();
    tex.blade = buildBladeIcon();
    tex.gun = buildGunIcon();
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
    return blit(layer, texture, 0, 0, W, H, z || 0);
  }
  function blit(layer, texture, x, y, w, h, z) {
    var sp = place(layer, texture, x, y, { anchor: [0, 0], z: z || 0 });
    var s = sp.getContentSize();
    if (s.width > 1 && s.height > 1) sp.setScale(w / s.width, h / s.height);
    return sp;
  }
  function bakeGround(dirtImg, grassImg) {
    var c = canvas(80, 80), g = c.getContext('2d');
    if (dirtImg && dirtImg.width) g.drawImage(dirtImg, 0, 0, 80, 80);
    else {
      g.fillStyle = '#6b4f2f';
      g.fillRect(0, 0, 80, 80);
    }
    var i, x, y, peb;
    for (i = 0; i < 22; i++) {
      x = 4 + (i * 29) % 72;
      y = 6 + (i * 17) % 68;
      g.fillStyle = i % 2 ? 'rgba(48,28,14,0.38)' : 'rgba(196,154,98,0.32)';
      g.beginPath();
      g.ellipse(x, y, 2 + (i % 3), 1.4 + (i % 2), 0.5, 0, Math.PI * 2);
      g.fill();
    }
    var shade = g.createLinearGradient(0, 0, 0, 80);
    shade.addColorStop(0, 'rgba(255,226,170,0.22)');
    shade.addColorStop(0.22, 'rgba(255,226,170,0)');
    shade.addColorStop(0.72, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(30,12,0,0.32)');
    g.fillStyle = shade;
    g.fillRect(0, 0, 80, 80);
    tex.groundDirt = texFromCanvas(c);

    var cg = canvas(80, 40), gg = cg.getContext('2d');
    gg.fillStyle = '#6a4328';
    gg.fillRect(0, 22, 80, 18);
    if (grassImg && grassImg.width) gg.drawImage(grassImg, 0, 16, 80, 18);
    else {
      gg.fillStyle = '#3f9a48';
      gg.fillRect(0, 18, 80, 10);
    }
    for (i = 0; i < 26; i++) {
      x = (i * 3.2) % 80;
      peb = 8 + (i * 5) % 14;
      gg.strokeStyle = i % 3 === 0 ? '#2f7a34' : (i % 3 === 1 ? '#8ed56a' : '#4ea85c');
      gg.lineWidth = 1.5;
      gg.beginPath();
      gg.moveTo(x, 24);
      gg.quadraticCurveTo(x + (i % 2 ? 2 : -2), 14, x + (i % 2 ? 1 : -1), 24 - peb);
      gg.stroke();
    }
    gg.fillStyle = 'rgba(220,255,180,0.35)';
    gg.fillRect(0, 12, 80, 2);
    tex.groundGrass = texFromCanvas(cg);
  }
  function dressSky(layer, gy, box) {
    box = box || { x: 0, y: 0, w: W, h: H };
    blit(layer, tex.sky, box.x, box.y, box.w, box.h, 0);
    var far = place(layer, tex.hillsFar, box.x, gy + 4, { anchor: [0, 0], z: 1 });
    var fs = far.getContentSize();
    if (fs.width > 2) far.setScaleX(box.w / fs.width);
    var hill = place(layer, tex.hills, box.x, gy - 22, { anchor: [0, 0], z: 1 });
    var hs = hill.getContentSize();
    if (hs.width > 2) hill.setScaleX(box.w / hs.width);
    var room = box.y + box.h - gy - 6;
    if (hs.height > 8 && room > 8 && hs.height > room) hill.setScale(box.w / hs.width, room / hs.height);
    var sun = place(layer, tex.sun, box.x + 48, box.y + box.h - 28, { h: 64, z: 1 });
    var spots = [
      [box.x + box.w * 0.3, box.y + box.h - 36, 26],
      [box.x + box.w * 0.58, box.y + box.h - 22, 20],
      [box.x + box.w * 0.8, box.y + box.h - 40, 24]
    ];
    var clouds = [];
    var i, cld;
    for (i = 0; i < spots.length; i++) {
      cld = place(layer, tex.cloud, spots[i][0], spots[i][1], { h: spots[i][2], z: 1, opacity: 230 });
      cld._x0 = spots[i][0];
      cld._y0 = spots[i][1];
      clouds.push(cld);
    }
    return { clouds: clouds, sun: sun, hill: hill, box: box };
  }
  function dressWater(layer, box) {
    box = box || { x: 0, y: 0, w: W, h: H };
    blit(layer, tex.water, box.x, box.y, box.w, box.h, 0);
    var surface = box.y + Math.round(box.h * 0.42);
    var waves = [];
    var glints = [];
    var i, w, s, n = Math.ceil(box.w / 96) + 1;
    for (i = 0; i < n; i++) {
      w = place(layer, tex.wave, box.x - 16 + i * 96, surface + (i % 2 ? 8 : -4), { h: i % 2 ? 14 : 10, z: 2, opacity: i % 2 ? 200 : 140 });
      w._x0 = box.x - 16 + i * 96;
      w._y0 = surface + (i % 2 ? 8 : -4);
      waves.push(w);
    }
    for (i = 0; i < Math.ceil(box.w / 120); i++) {
      s = place(layer, tex.glint, box.x + 16 + i * 120, surface + 2, { h: 4, z: 3, opacity: 170 });
      s._x0 = box.x + 16 + i * 120;
      s._y0 = surface + 2;
      glints.push(s);
    }
    return { waves: waves, glints: glints, box: box, surface: surface };
  }
  function addGround(layer, x, y, width, z, rows) {
    var tw = 40;
    var dirtTex = tex.groundDirt;
    var grassTex = tex.groundGrass;
    var dirtPath = SC + 'dirt-tile.png';
    var grassPath = SC + 'grass-cap.png';
    var probe = dirtTex ? new cc.Sprite(dirtTex) : new cc.Sprite(dirtPath);
    if (probe.getContentSize().width < 2) {
      var bed = new cc.LayerColor(cc.color(107, 79, 47), Math.max(2, width), 32);
      bed.setPosition(x, y - 32);
      layer.addChild(bed, z || 2);
      var cap0 = new cc.LayerColor(cc.color(78, 168, 92), Math.max(2, width), 8);
      cap0.setPosition(x, y - 2);
      layer.addChild(cap0, (z || 2) + 1);
      return;
    }
    var dw0 = probe.getContentSize().width;
    var gh = grassTex ? grassTex.getContentSize().height : 18;
    var gw = grassTex ? grassTex.getContentSize().width : 40;
    rows = rows == null ? 1 : rows;
    var col, r, dirt, dw, grass;
    for (r = 0; r < rows; r++) {
      for (col = 0; col * tw < width; col++) {
        dw = Math.min(tw, width - col * tw);
        dirt = dirtTex ? new cc.Sprite(dirtTex) : new cc.Sprite(dirtPath);
        dirt.setAnchorPoint(0, 1);
        dirt.setPosition(x + col * tw, y - r * tw);
        dirt.setScale(dw / dw0, tw / (dirt.getContentSize().height || tw));
        layer.addChild(dirt, z || 2);
      }
    }
    for (col = 0; col * tw < width; col++) {
      dw = Math.min(tw, width - col * tw);
      grass = grassTex ? new cc.Sprite(grassTex) : new cc.Sprite(grassPath);
      grass.setAnchorPoint(0, 0);
      grass.setPosition(x + col * tw, y - 4);
      grass.setScale(dw / gw, grassTex ? (24 / gh) : 14 / 18);
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
    bakeGround: bakeGround,
    rememberAvatar: rememberAvatar,
    place: place,
    panel: panel,
    frame: frame,
    fill: fill,
    blit: blit,
    dressSky: dressSky,
    dressWater: dressWater,
    addGround: addGround
  };
})();
