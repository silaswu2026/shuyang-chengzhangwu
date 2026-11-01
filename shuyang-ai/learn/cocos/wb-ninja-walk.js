/**
 * Natural walk limb swing for green/blue/red ninjas (opposite arm/leg).
 * Port of xy-go drawHero run pose — painted walk_* PNGs are near-identical mid-stride
 * (scarf flutter only), so flipbooking them looks like a frozen idle slide.
 * c33 / walk1: used by custom-play + workbench preview.
 */
(function (root) {
  var PALETTE = {
    green: { scarf: '#1fa85a', sash: '#2fbe62', band: '#178a45', eye: '#7dff6a', plate: '#e6ebf0' },
    blue: { scarf: '#1f7de0', sash: '#3aa6ff', band: '#1868c4', eye: '#8fd4ff', plate: '#e6ebf0' },
    red: { scarf: '#e53935', sash: '#ff5252', band: '#c62828', eye: '#ff8a80', plate: '#e6ebf0' }
  };
  var SIZE = 256;
  var cv = null;
  var g = null;
  var tex = null;
  var lastKey = '';

  function ensureCanvas() {
    if (cv) return;
    cv = document.createElement('canvas');
    cv.width = SIZE;
    cv.height = SIZE;
    g = cv.getContext('2d');
  }

  function rr(x, y, w, h, r) {
    var rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    g.beginPath();
    g.moveTo(x + rad, y);
    g.arcTo(x + w, y, x + w, y + h, rad);
    g.arcTo(x + w, y + h, x, y + h, rad);
    g.arcTo(x, y + h, x, y, rad);
    g.arcTo(x, y, x + w, y, rad);
    g.closePath();
  }

  function limb(x, y, len, ang, w, color, tip) {
    g.save();
    g.translate(x, y);
    g.rotate(ang);
    g.fillStyle = color;
    rr(-w / 2, 0, w, len, w / 2);
    g.fill();
    if (tip === 'boot') {
      g.fillStyle = '#111';
      rr(-w / 2 - 2, len - 8, w + 8, 11, 4);
      g.fill();
    } else if (tip === 'glove') {
      g.fillStyle = '#1c1c1c';
      g.beginPath();
      g.arc(0, len, w * 0.62, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  }

  function poseRun(phase) {
    var s = Math.sin(phase);
    var leg = s * 1.05;
    var arm = -s * 0.72;
    return {
      legL: leg,
      legR: -leg,
      armL: arm,
      armR: -arm,
      body: 0.06 + Math.abs(s) * 0.05,
      bob: Math.abs(Math.sin(phase * 2)) * 3.0
    };
  }

  /** Draw one walk pose into ctx; origin at feet, y-up negative (ninja coords). */
  function drawHero(ctx, phase, palette, speed, sim) {
    var pal = PALETTE[palette] || PALETTE.green;
    var pose = poseRun(phase);
    var flap = Math.sin((sim || 0) * 14 + phase);
    var tail = 24 + Math.min(30, (speed || 160) * 0.06);
    ctx.save();
    ctx.translate(0, -pose.bob);
    ctx.rotate(pose.body);
    ctx.strokeStyle = pal.scarf;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-2, -58);
    ctx.quadraticCurveTo(-18, -48 + flap * 2, -tail, -40 + flap * 8);
    ctx.moveTo(0, -54);
    ctx.quadraticCurveTo(-14, -34 + flap, -(tail - 8), -22 + flap * 6);
    ctx.stroke();
    ctx.strokeStyle = pal.sash;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(6, -36);
    ctx.quadraticCurveTo(16, -28 + flap, tail * 0.45, -18 + flap * 4);
    ctx.stroke();
    /* temporarily bind limb helpers to this ctx */
    var oldG = g;
    g = ctx;
    limb(-4, -56, 22, pose.armL, 7, '#141414', 'glove');
    limb(-5, -32, 26, pose.legL, 8, '#141414', 'boot');
    ctx.fillStyle = '#161616';
    rr(-12, -64, 24, 34, 8);
    ctx.fill();
    ctx.fillStyle = pal.sash;
    rr(-13, -40, 26, 7, 3);
    ctx.fill();
    limb(5, -32, 26, pose.legR, 8, '#141414', 'boot');
    limb(6, -56, 22, pose.armR, 7, '#141414', 'glove');
    /* g stays on ctx through head/band rr() below */
    ctx.fillStyle = '#121212';
    ctx.beginPath();
    ctx.moveTo(-11, -80);
    ctx.lineTo(-16, -98);
    ctx.lineTo(-4, -84);
    ctx.lineTo(-1, -104);
    ctx.lineTo(3, -84);
    ctx.lineTo(8, -102);
    ctx.lineTo(12, -82);
    ctx.lineTo(16, -96);
    ctx.lineTo(12, -76);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.ellipse(0, -74, 12, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal.band;
    rr(-13, -84, 26, 8, 3);
    ctx.fill();
    ctx.fillStyle = pal.plate;
    rr(-5, -86, 11, 9, 2);
    ctx.fill();
    ctx.fillStyle = '#ffffffcc';
    ctx.fillRect(-3, -84, 2, 5);
    ctx.fillStyle = '#0c0c0c';
    rr(-11, -76, 22, 11, 4);
    ctx.fill();
    ctx.fillStyle = pal.eye;
    ctx.beginPath();
    ctx.ellipse(-4.6, -71, 3.3, 3.5, 0, 0, Math.PI * 2);
    ctx.ellipse(4.6, -71, 3.3, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#102010';
    ctx.beginPath();
    ctx.ellipse(-4.2, -71, 1.5, 1.8, 0, 0, Math.PI * 2);
    ctx.ellipse(5, -71, 1.5, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    g = oldG;
    ctx.restore();
  }

  function paintFrame(phase, palette, speed, sim) {
    ensureCanvas();
    g.clearRect(0, 0, SIZE, SIZE);
    g.save();
    g.translate(SIZE / 2, SIZE * 0.86);
    g.scale(2.15, 2.15);
    drawHero(g, phase, palette || 'green', speed || 180, sim || phase);
    g.restore();
    return cv;
  }

  /** Quantize phase so we don't rebuild texture every tiny dt. ~12 poses / cycle. */
  function phaseKey(phase, palette) {
    var slot = Math.floor(((phase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI / 6));
    return (palette || 'green') + ':' + slot;
  }

  function textureFor(phase, palette, speed) {
    ensureCanvas();
    var key = phaseKey(phase, palette);
    if (key === lastKey && tex) return tex;
    paintFrame(phase, palette, speed, phase);
    if (typeof cc === 'undefined' || !cc.Texture2D) return null;
    if (!tex) {
      tex = new cc.Texture2D();
    }
    tex.initWithElement(cv);
    tex.handleLoadedTexture();
    lastKey = key;
    return tex;
  }

  /**
   * Apply walk pose to a Cocos sprite. Returns true if applied.
   * drawH: on-screen height in px (same as idle scale base).
   */
  function applyToSprite(sp, phase, palette, speed, drawH) {
    if (!sp) return false;
    var t = textureFor(phase, palette, speed);
    if (!t) return false;
    try {
      sp.setTexture(t);
      var r = t.getContentSize ? t.getContentSize() : { width: SIZE, height: SIZE };
      if (r && r.height > 2) {
        sp.setTextureRect(cc.rect(0, 0, r.width, r.height));
        if (drawH) {
          var sc = drawH / r.height;
          var sx = sp.getScaleX ? sp.getScaleX() : sc;
          var face = sx < 0 ? -1 : 1;
          sp.setScaleX(face * sc);
          sp.setScaleY(sc);
        }
      }
      return true;
    } catch (e0) {
      return false;
    }
  }

  root.WBNinjaWalk = {
    SIZE: SIZE,
    paintFrame: paintFrame,
    textureFor: textureFor,
    applyToSprite: applyToSprite,
    phaseKey: phaseKey,
    PALETTE: PALETTE
  };
})(typeof window !== 'undefined' ? window : this);
