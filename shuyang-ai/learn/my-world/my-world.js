/* 方块小世界 mw2 · 任何方块都能敲，敲下来的进背包。制作/昼夜/矿/船/商店以后再加。 */
(function () {
  'use strict';

  var W = 28, H = 10, D = 28;
  var AIR = 0, GRASS = 1, DIRT = 2, LOG = 3, LEAF = 4, STONE = 5;
  var COL = {
    1: [0.36, 0.72, 0.32],
    2: [0.55, 0.36, 0.22],
    3: [0.52, 0.32, 0.14],
    4: [0.22, 0.62, 0.28],
    5: [0.55, 0.55, 0.58]
  };
  var SHADE = [1, 0.55, 0.82, 0.68, 0.9, 0.64];
  var FACES = [
    [0,1,0, 1,1,0, 1,1,1, 0,1,0, 1,1,1, 0,1,1],
    [0,0,1, 1,0,1, 1,0,0, 0,0,1, 1,0,0, 0,0,0],
    [1,0,0, 1,1,0, 1,1,1, 1,0,0, 1,1,1, 1,0,1],
    [0,0,1, 0,1,1, 0,1,0, 0,0,1, 0,1,0, 0,0,0],
    [0,0,1, 1,0,1, 1,1,1, 0,0,1, 1,1,1, 0,1,1],
    [1,0,0, 0,0,0, 0,1,0, 1,0,0, 0,1,0, 1,1,0]
  ];
  var STORE = 'xygo-my-world';
  var blocks = new Uint8Array(W * H * D);
  var NAMES = { wood: '木头', leaf: '树叶', dirt: '泥土', stone: '石头' };
  var ORDER = ['wood', 'leaf', 'dirt', 'stone'];
  var state = {
    px: 10.5, py: 4, pz: 10.5, yaw: Math.PI / 2, pitch: 0, vy: 0,
    onGround: false, started: false,
    inv: { wood: 0, leaf: 0, dirt: 0, stone: 0 }
  };
  var keys = {};
  var joyX = 0, joyY = 0, punching = false, jumping = false;
  var breakAcc = 0, breakKey = '';
  var dirty = true;
  var toastUntil = 0;
  var gl, prog, buf, vbo, loc, lineBuf, lineN = 0;

  function at(x, y, z) {
    x |= 0; y |= 0; z |= 0;
    if (x < 0 || y < 0 || z < 0 || x >= W || y >= H || z >= D) return AIR;
    return blocks[(y * D + z) * W + x];
  }
  function put(x, y, z, id) {
    if (x < 0 || y < 0 || z < 0 || x >= W || y >= H || z >= D) return;
    blocks[(y * D + z) * W + x] = id;
  }
  function solid(x, y, z) {
    x |= 0; y |= 0; z |= 0;
    if (x < 0 || y < 0 || z < 0 || x >= W || y >= H || z >= D) return true;
    var id = at(x, y, z);
    return id !== AIR && id !== LEAF;
  }

  function grow() {
    var x, z, y;
    for (z = 0; z < D; z++) {
      for (x = 0; x < W; x++) {
        put(x, 0, z, STONE);
        put(x, 1, z, STONE);
        put(x, 2, z, DIRT);
        put(x, 3, z, GRASS);
      }
    }
    [[16, 10], [16, 16], [20, 8], [20, 14], [22, 18], [24, 12], [18, 20]].forEach(function (p) {
      x = p[0]; z = p[1];
      put(x, 4, z, LOG);
      put(x, 5, z, LOG);
      put(x, 6, z, LOG);
      for (y = 6; y <= 7; y++) {
        for (var dx = -1; dx <= 1; dx++) {
          for (var dz = -1; dz <= 1; dz++) {
            if (dx === 0 && dz === 0 && y === 6) continue;
            if (Math.abs(dx) + Math.abs(dz) > 2) continue;
            if (at(x + dx, y, z + dz) === AIR) put(x + dx, y, z + dz, LEAF);
          }
        }
      }
    });
  }

  function save() {
    var edits = [];
    var fresh = new Uint8Array(blocks.length);
    var keep = blocks;
    blocks = fresh;
    grow();
    for (var i = 0; i < keep.length; i++) {
      if (keep[i] !== blocks[i]) {
        var y = (i / (W * D)) | 0;
        var rem = i - y * W * D;
        var z = (rem / W) | 0;
        var x = rem - z * W;
        edits.push(x + ',' + y + ',' + z + ',' + keep[i]);
      }
    }
    blocks = keep;
    try {
      localStorage.setItem(STORE, JSON.stringify({
        v: 2, tip: 'mw2',
        inv: state.inv,
        wood: state.inv.wood || 0,
        px: state.px, py: state.py, pz: state.pz,
        yaw: state.yaw, pitch: state.pitch, edits: edits
      }));
    } catch (e) {}
  }

  function load() {
    grow();
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { raw = null; }
    if (!raw || (raw.v !== 1 && raw.v !== 2)) return;
    if (raw.inv) {
      ORDER.forEach(function (k) {
        if (isFinite(raw.inv[k]) && raw.inv[k] > 0) state.inv[k] = raw.inv[k] | 0;
      });
    }
    if (!(state.inv.wood > 0) && isFinite(raw.wood) && raw.wood > 0) state.inv.wood = raw.wood | 0;
    ['px', 'py', 'pz', 'yaw', 'pitch'].forEach(function (k) {
      if (isFinite(raw[k])) state[k] = raw[k];
    });
    (raw.edits || []).forEach(function (row) {
      var p = String(row).split(',');
      if (p.length >= 4) put(+p[0], +p[1], +p[2], +p[3]);
    });
    var guard = 0;
    while (overlaps(state.px, state.py, state.pz) && guard++ < 8) state.py += 0.5;
  }

  function overlaps(px, py, pz) {
    var x0 = Math.floor(px - 0.28), x1 = Math.floor(px + 0.28 - 1e-4);
    var y0 = Math.floor(py + 0.001), y1 = Math.floor(py + 1.6 - 0.001);
    var z0 = Math.floor(pz - 0.28), z1 = Math.floor(pz + 0.28 - 1e-4);
    for (var y = y0; y <= y1; y++) {
      for (var z = z0; z <= z1; z++) {
        for (var x = x0; x <= x1; x++) if (solid(x, y, z)) return true;
      }
    }
    return false;
  }

  function moveAxis(dx, dy, dz) {
    if (dx) {
      state.px += dx;
      if (overlaps(state.px, state.py, state.pz)) state.px -= dx;
    }
    if (dz) {
      state.pz += dz;
      if (overlaps(state.px, state.py, state.pz)) state.pz -= dz;
    }
    if (dy) {
      var steps = Math.max(1, Math.ceil(Math.abs(dy) / 0.15));
      var step = dy / steps;
      var hit = false;
      for (var i = 0; i < steps; i++) {
        state.py += step;
        if (overlaps(state.px, state.py, state.pz)) {
          state.py -= step;
          hit = true;
          break;
        }
      }
      if (hit) {
        state.onGround = dy < 0;
        state.vy = 0;
      } else {
        state.onGround = dy < 0 && overlaps(state.px, state.py - 0.06, state.pz);
        if (state.onGround) state.vy = 0;
      }
    }
  }

  function look() {
    var cp = Math.cos(state.pitch);
    return [Math.sin(state.yaw) * cp, Math.sin(state.pitch), -Math.cos(state.yaw) * cp];
  }

  function ray(maxDist) {
    var oY = state.py + 1.5;
    var d = look();
    var dx = d[0], dy = d[1], dz = d[2];
    var len = Math.hypot(dx, dy, dz) || 1;
    dx /= len; dy /= len; dz /= len;
    var x = Math.floor(state.px), y = Math.floor(oY), z = Math.floor(state.pz);
    var stepX = dx < 0 ? -1 : 1, stepY = dy < 0 ? -1 : 1, stepZ = dz < 0 ? -1 : 1;
    var tdx = dx === 0 ? 1e9 : Math.abs(1 / dx);
    var tdy = dy === 0 ? 1e9 : Math.abs(1 / dy);
    var tdz = dz === 0 ? 1e9 : Math.abs(1 / dz);
    var tmaxX = dx === 0 ? 1e9 : (dx > 0 ? (x + 1 - state.px) : (state.px - x)) * tdx;
    var tmaxY = dy === 0 ? 1e9 : (dy > 0 ? (y + 1 - oY) : (oY - y)) * tdy;
    var tmaxZ = dz === 0 ? 1e9 : (dz > 0 ? (z + 1 - state.pz) : (state.pz - z)) * tdz;
    var dist = 0;
    for (var i = 0; i < 48; i++) {
      var id = at(x, y, z);
      if (id !== AIR) return { x: x, y: y, z: z, id: id, dist: dist };
      if (tmaxX < tmaxY && tmaxX < tmaxZ) {
        if (tmaxX > maxDist) return null;
        x += stepX; dist = tmaxX; tmaxX += tdx;
      } else if (tmaxY < tmaxZ) {
        if (tmaxY > maxDist) return null;
        y += stepY; dist = tmaxY; tmaxY += tdy;
      } else {
        if (tmaxZ > maxDist) return null;
        z += stepZ; dist = tmaxZ; tmaxZ += tdz;
      }
    }
    return null;
  }

  function breakTime(id) {
    if (id === LEAF) return 0.2;
    if (id === STONE) return 0.55;
    return 0.35;
  }

  function dropOf(id) {
    if (id === LOG) return 'wood';
    if (id === LEAF) return 'leaf';
    if (id === GRASS || id === DIRT) return 'dirt';
    if (id === STONE) return 'stone';
    return null;
  }

  function renderBag() {
    var el = document.getElementById('bag');
    if (!el) return;
    el.innerHTML = ORDER.map(function (k) {
      return '<span>' + NAMES[k] + ' ' + (state.inv[k] || 0) + '</span>';
    }).join('');
  }

  function breakBlock(hit) {
    var id = at(hit.x, hit.y, hit.z);
    if (!id) return;
    put(hit.x, hit.y, hit.z, AIR);
    var drop = dropOf(id);
    if (drop) {
      state.inv[drop] = (state.inv[drop] || 0) + 1;
      toast('得到' + NAMES[drop]);
    }
    dirty = true;
    save();
    renderBag();
  }

  function toast(text) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = text;
    toastUntil = performance.now() + 1200;
  }

  function sim(dt) {
    if (!state.started) return;
    var forward = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) + joyY;
    var strafe = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + joyX;
    if (forward > 1) forward = 1;
    if (forward < -1) forward = -1;
    if (strafe > 1) strafe = 1;
    if (strafe < -1) strafe = -1;
    var mx = Math.sin(state.yaw), mz = -Math.cos(state.yaw);
    var rx = Math.cos(state.yaw), rz = Math.sin(state.yaw);
    var speed = 4.4 * dt;
    moveAxis((mx * forward + rx * strafe) * speed, 0, (mz * forward + rz * strafe) * speed);
    var jump = jumping || keys.Space;
    if (jump && state.onGround) {
      state.vy = 7.2;
      state.onGround = false;
    }
    state.vy -= 26 * dt;
    if (state.vy < -20) state.vy = -20;
    moveAxis(0, state.vy * dt, 0);
    if (state.py < -2) {
      state.px = 10.5; state.py = 4; state.pz = 10.5; state.vy = 0;
    }
    var hit = punching ? ray(4.5) : null;
    var key = hit ? hit.x + ',' + hit.y + ',' + hit.z : '';
    var bar = document.getElementById('bar');
    var fill = document.getElementById('barFill');
    if (hit) {
      if (key !== breakKey) { breakKey = key; breakAcc = 0; }
      breakAcc += dt;
      var need = breakTime(hit.id);
      if (bar && fill) {
        bar.className = 'on';
        fill.style.width = Math.min(100, breakAcc / need * 100) + '%';
      }
      if (breakAcc >= need) {
        breakAcc = 0;
        breakBlock(hit);
      }
    } else {
      breakAcc = 0;
      breakKey = '';
      if (bar) bar.className = '';
    }
    if (toastUntil && performance.now() > toastUntil) {
      var t = document.getElementById('toast');
      if (t) t.textContent = '';
      toastUntil = 0;
    }
  }

  function buildMesh() {
    var data = [];
    for (var y = 0; y < H; y++) {
      for (var z = 0; z < D; z++) {
        for (var x = 0; x < W; x++) {
          var id = at(x, y, z);
          if (!id) continue;
          var rgb = COL[id];
          for (var f = 0; f < 6; f++) {
            var nx = f === 2 ? 1 : f === 3 ? -1 : 0;
            var ny = f === 0 ? 1 : f === 1 ? -1 : 0;
            var nz = f === 4 ? 1 : f === 5 ? -1 : 0;
            var nid = at(x + nx, y + ny, z + nz);
            if (nid && nid !== LEAF) continue;
            if (id !== LEAF && nid === LEAF) continue;
            var face = FACES[f];
            var s = SHADE[f];
            for (var v = 0; v < 18; v += 3) {
              data.push(x + face[v], y + face[v + 1], z + face[v + 2], rgb[0] * s, rgb[1] * s, rgb[2] * s);
            }
          }
        }
      }
    }
    var arr = new Float32Array(data);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    vbo = arr.length / 6;
  }

  function outline(hit) {
    if (!hit) { lineN = 0; return; }
    var x = hit.x, y = hit.y, z = hit.z, e = 0.01;
    var c = [
      [x - e, y - e, z - e], [x + 1 + e, y - e, z - e], [x + 1 + e, y + 1 + e, z - e], [x - e, y + 1 + e, z - e],
      [x - e, y - e, z + 1 + e], [x + 1 + e, y - e, z + 1 + e], [x + 1 + e, y + 1 + e, z + 1 + e], [x - e, y + 1 + e, z + 1 + e]
    ];
    var ejs = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    var data = [];
    ejs.forEach(function (p) {
      data.push(c[p[0]][0], c[p[0]][1], c[p[0]][2], 1, 0.88, 0.45);
      data.push(c[p[1]][0], c[p[1]][1], c[p[1]][2], 1, 0.88, 0.45);
    });
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
    lineN = 24;
  }

  function perspective(fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2);
    var nf = 1 / (near - far);
    var o = new Float32Array(16);
    o[0] = f / aspect; o[5] = f;
    o[10] = (far + near) * nf; o[11] = -1;
    o[14] = 2 * far * near * nf;
    return o;
  }

  function lookAt(ex, ey, ez, cx, cy, cz) {
    var zx = ex - cx, zy = ey - cy, zz = ez - cz;
    var len = Math.hypot(zx, zy, zz) || 1;
    zx /= len; zy /= len; zz /= len;
    var xx = zz, xy = 0, xz = -zx;
    len = Math.hypot(xx, xy, xz) || 1;
    xx /= len; xy /= len; xz /= len;
    var yx = zy * xz - zz * xy;
    var yy = zz * xx - zx * xz;
    var yz = zx * xy - zy * xx;
    var o = new Float32Array(16);
    o[0] = xx; o[1] = yx; o[2] = zx;
    o[4] = xy; o[5] = yy; o[6] = zy;
    o[8] = xz; o[9] = yz; o[10] = zz;
    o[12] = -(xx * ex + xy * ey + xz * ez);
    o[13] = -(yx * ex + yy * ey + yz * ez);
    o[14] = -(zx * ex + zy * ey + zz * ez);
    o[15] = 1;
    return o;
  }

  function mul(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) {
      for (var r = 0; r < 4; r++) {
        o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
      }
    }
    return o;
  }

  function draw() {
    var canvas = gl.canvas;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var bw = Math.max(1, (canvas.clientWidth * dpr) | 0);
    var bh = Math.max(1, (canvas.clientHeight * dpr) | 0);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.53, 0.74, 0.92, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (dirty) { buildMesh(); dirty = false; }
    var dir = look();
    var eyeY = state.py + 1.5;
    var proj = perspective(70 * Math.PI / 180, canvas.width / canvas.height, 0.08, 80);
    var view = lookAt(state.px, eyeY, state.pz, state.px + dir[0], eyeY + dir[1], state.pz + dir[2]);
    var mvp = mul(proj, view);
    gl.useProgram(prog);
    gl.uniformMatrix4fv(loc.mvp, false, mvp);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(loc.pos);
    gl.enableVertexAttribArray(loc.col);
    gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(loc.col, 3, gl.FLOAT, false, 24, 12);
    gl.drawArrays(gl.TRIANGLES, 0, vbo);
    var hit = state.started ? ray(4.5) : null;
    outline(hit);
    if (lineN) {
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
      gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, 24, 0);
      gl.vertexAttribPointer(loc.col, 3, gl.FLOAT, false, 24, 12);
      gl.drawArrays(gl.LINES, 0, lineN);
    }
  }

  function bootGL() {
    var canvas = document.getElementById('view');
    gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) {
      document.getElementById('hint').textContent = '小宇：这台浏览器开不了画面。请换 Safari 或 Chrome。';
      return false;
    }
    var vs = 'attribute vec3 aPos;attribute vec3 aCol;uniform mat4 uMvp;varying vec3 vCol;void main(){vCol=aCol;gl_Position=uMvp*vec4(aPos,1.0);}';
    var fs = 'precision mediump float;varying vec3 vCol;void main(){gl_FragColor=vec4(vCol,1.0);}';
    function sh(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    loc = { pos: gl.getAttribLocation(prog, 'aPos'), col: gl.getAttribLocation(prog, 'aCol'), mvp: gl.getUniformLocation(prog, 'uMvp') };
    buf = gl.createBuffer();
    lineBuf = gl.createBuffer();
    gl.enable(gl.DEPTH_TEST);
    return true;
  }

  function bind() {
    var canvas = document.getElementById('view');
    document.getElementById('go').addEventListener('click', function () {
      document.getElementById('start').hidden = true;
      state.started = true;
      if (window.matchMedia('(pointer:fine)').matches && canvas.requestPointerLock) canvas.requestPointerLock();
    });
    canvas.addEventListener('click', function () {
      if (!state.started) return;
      if (window.matchMedia('(pointer:fine)').matches && canvas.requestPointerLock) canvas.requestPointerLock();
    });
    document.addEventListener('mousemove', function (e) {
      if (document.pointerLockElement !== canvas) return;
      state.yaw += e.movementX * 0.0022;
      state.pitch -= e.movementY * 0.0022;
      if (state.pitch > 1.2) state.pitch = 1.2;
      if (state.pitch < -1.2) state.pitch = -1.2;
    });
    canvas.addEventListener('mousedown', function (e) {
      if (!state.started) return;
      if (e.button === 0 && document.pointerLockElement === canvas) punching = true;
    });
    window.addEventListener('mouseup', function () { if (!pointerPunch) punching = false; });
    document.addEventListener('keydown', function (e) {
      keys[e.code] = true;
      if (e.code === 'Space') e.preventDefault();
    });
    document.addEventListener('keyup', function (e) { keys[e.code] = false; });
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    var lookId = null, lx = 0, ly = 0;
    canvas.addEventListener('pointerdown', function (e) {
      if (!state.started || e.pointerType === 'mouse') return;
      lookId = e.pointerId; lx = e.clientX; ly = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', function (e) {
      if (e.pointerId !== lookId) return;
      var dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      state.yaw += dx * 0.005;
      state.pitch -= dy * 0.005;
      if (state.pitch > 1.2) state.pitch = 1.2;
      if (state.pitch < -1.2) state.pitch = -1.2;
    });
    canvas.addEventListener('pointerup', function (e) { if (e.pointerId === lookId) lookId = null; });

    var joy = document.getElementById('joy');
    var knob = document.getElementById('knob');
    var joyId = null;
    function setJoy(cx, cy) {
      var r = joy.getBoundingClientRect();
      var ox = r.left + r.width / 2, oy = r.top + r.height / 2;
      var dx = cx - ox, dy = cy - oy;
      var max = r.width * 0.36;
      var len = Math.hypot(dx, dy) || 1;
      if (len > max) { dx = dx / len * max; dy = dy / len * max; }
      joyX = dx / max;
      joyY = -dy / max;
      knob.style.left = (r.width / 2 - 20 + dx) + 'px';
      knob.style.top = (r.height / 2 - 20 + dy) + 'px';
    }
    joy.addEventListener('pointerdown', function (e) {
      joyId = e.pointerId;
      joy.setPointerCapture(e.pointerId);
      setJoy(e.clientX, e.clientY);
    });
    joy.addEventListener('pointermove', function (e) { if (e.pointerId === joyId) setJoy(e.clientX, e.clientY); });
    function endJoy(e) {
      if (e.pointerId !== joyId) return;
      joyId = null; joyX = 0; joyY = 0;
      knob.style.left = ''; knob.style.top = '';
    }
    joy.addEventListener('pointerup', endJoy);
    joy.addEventListener('pointercancel', endJoy);

    var pointerPunch = false;
    var punchBtn = document.getElementById('punch');
    punchBtn.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      pointerPunch = true;
      punching = true;
      punchBtn.setPointerCapture(e.pointerId);
    });
    function endPunch() { pointerPunch = false; punching = false; }
    punchBtn.addEventListener('pointerup', endPunch);
    punchBtn.addEventListener('pointercancel', endPunch);
    var jumpBtn = document.getElementById('jump');
    jumpBtn.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      jumping = true;
      jumpBtn.setPointerCapture(e.pointerId);
    });
    jumpBtn.addEventListener('pointerup', function () { jumping = false; });
    jumpBtn.addEventListener('pointercancel', function () { jumping = false; });

    document.addEventListener('visibilitychange', function () { if (document.hidden) save(); });
    window.addEventListener('pagehide', save);
  }

  function loop(now) {
    if (!loop.last) loop.last = now;
    var dt = Math.min(0.05, (now - loop.last) / 1000);
    loop.last = now;
    sim(dt);
    if (gl) draw();
    requestAnimationFrame(loop);
  }

  load();
  renderBag();
  bind();
  if (bootGL()) requestAnimationFrame(loop);
  window.__xy = {
    state: state,
    at: at,
    ray: ray,
    breakBlock: breakBlock,
    STORE: STORE
  };
})();
