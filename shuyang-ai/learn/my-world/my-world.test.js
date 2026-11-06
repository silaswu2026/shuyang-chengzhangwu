/**
 * node shuyang-ai/learn/my-world/my-world.test.js
 */
var fs = require('fs');
var path = require('path');
var MW = require('./my-world.js');

var failed = 0;
function fail(msg) {
  failed++;
  console.error('FAIL ' + msg);
}
function eq(actual, expected, msg) {
  if (actual !== expected) fail(msg + ' got ' + actual + ' expected ' + expected);
}

var mem = {};
global.localStorage = {
  getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
  setItem: function (k, v) { mem[k] = String(v); }
};

eq(MW.TIP, 'mw4', 'tip');
eq(MW.STORE, 'xygo-my-world', 'store');
if (MW.KID_NAMES.length < 8) fail('kid names');
MW.KID_NAMES.forEach(function (n) {
  if (!/^[\u4e00-\u9fff]{2,3}$/.test(n)) fail('name ' + n);
});
var ice = JSON.stringify(MW.NET_PEER_OPTS);
if (ice.indexOf('stun:stun.l.google.com:19302') < 0) fail('stun');
if (ice.indexOf('turn:openrelay.metered.ca:443') < 0) fail('turn');
if (ice.indexOf('stun:stun.cloudflare.com:3478') < 0) fail('cf stun');

MW.grow(1);
var a = MW.scan();
MW.grow(1);
var b = MW.scan();
eq(JSON.stringify(a.counts), JSON.stringify(b.counts), 'seed stable');
if (!(a.counts[MW.WATER] > 200)) fail('ocean/river water ' + a.counts[MW.WATER]);
if (!(a.waterCols > 40)) fail('water columns ' + a.waterCols);
if (!(a.maxY >= MW.SEA + 5)) fail('mountains maxY ' + a.maxY);
if (!(a.mountains > 8)) fail('mountain cols ' + a.mountains);
if (!(a.counts[MW.LOG] > 0)) fail('trees');
if (!(a.counts[MW.FLOWER] > 0)) fail('flowers');
if (!(a.counts[MW.SAND] > 0)) fail('sand');
if (!(a.counts[MW.GOLD] >= 8)) fail('gold ' + a.counts[MW.GOLD]);
if (!(a.counts[MW.CHEST] >= 2)) fail('chests ' + a.counts[MW.CHEST]);
var seedN;
for (seedN = 1; seedN <= 40; seedN++) {
  MW.grow(seedN);
  var sp = MW.scan().spawn;
  if (!MW.feetClear(sp.x, sp.y, sp.z)) fail('spawn buried seed ' + seedN + ' ' + sp.x + ',' + sp.y + ',' + sp.z);
  if (MW.overlaps(sp.x, sp.y, sp.z)) fail('spawn overlap ' + seedN);
  var gx = Math.floor(sp.x), gz = Math.floor(sp.z), gy = Math.floor(sp.y) - 1;
  var ground = MW.at(gx, gy, gz);
  if (ground !== MW.GRASS && ground !== MW.SAND) fail('spawn ground ' + seedN + ' id ' + ground);
  if (sp.y < MW.SEA) fail('spawn under sea ' + seedN + ' y ' + sp.y);
  var guest = MW.pickSurface(sp.x, sp.z, 1.5);
  if (!MW.feetClear(guest.x, guest.y, guest.z)) fail('guest spawn ' + seedN);
  if (Math.hypot(guest.x - sp.x, guest.z - sp.z) < 1.4) fail('guest stacked ' + seedN);
}
MW.grow(3);
MW.loadRaw({ v: 3, tip: 'mw3', seed: 3, px: 22.5, py: 3, pz: 12.5, yaw: 0.2, pitch: -1, inv: { wood: 4 } });
if (!MW.feetClear(MW.state.px, MW.state.py, MW.state.pz)) fail('buried save not lifted');
eq(MW.state.inv.wood, 4, 'buried save keeps wood');
if (Math.abs(MW.state.pitch) > 0.01) fail('buried save should look out');
MW.grow(6);
var hill = MW.scan().spawn;
MW.loadRaw({ v: 3, tip: 'mw4', seed: 6, px: hill.x, py: hill.y, pz: hill.z, yaw: 1.2, pitch: -0.4, inv: {} });
if (Math.abs(MW.state.px - hill.x) > 0.01 || Math.abs(MW.state.py - hill.y) > 0.01) fail('clear save should stay');
MW.grow(1);
var rz = 18 + Math.sin(20 * 0.23 + (1 % 7)) * 4.5;
var riverHit = false;
var zi;
for (zi = -2; zi <= 2; zi++) {
  if (MW.at(20, MW.SEA - 1, Math.round(rz) + zi) === MW.WATER) riverHit = true;
}
if (!riverHit) fail('river water');
if (MW.at(2, MW.SEA - 1, 8) !== MW.WATER) fail('ocean water');

var gx = -1, gy = -1, gz = -1, x, y, z;
for (z = 0; z < MW.D && gx < 0; z++) {
  for (y = 0; y < MW.H && gx < 0; y++) {
    for (x = 0; x < MW.W; x++) {
      if (MW.at(x, y, z) === MW.GOLD) { gx = x; gy = y; gz = z; break; }
    }
  }
}
var gold0 = MW.state.inv.gold | 0;
MW.breakBlock({ x: gx, y: gy, z: gz });
eq(MW.at(gx, gy, gz), MW.AIR, 'gold mined');
eq(MW.state.inv.gold, gold0 + 2, 'gold coins');

MW.state.inv.wood = 0;
if (MW.craft('boat')) fail('boat without wood');
MW.state.inv.wood = 3;
if (!MW.craft('swordWood')) fail('craft sword');
eq(MW.state.inv.wood, 0, 'wood spent');
eq(MW.state.inv.swordWood, 1, 'own sword');
eq(MW.state.equip.weapon, 'swordWood', 'auto equip');
eq(MW.weaponCode(), 1, 'hand code');
var slow = MW.breakTime(MW.STONE);
MW.state.equip.tool = 'pick';
MW.state.inv.pick = 1;
if (!(MW.breakTime(MW.STONE) < slow)) fail('pick faster');

MW.state.inv.wood = 1;
var g1 = MW.state.inv.gold;
if (!MW.craft('sell')) fail('sell wood');
eq(MW.state.inv.gold, g1 + 1, 'sold coin');

MW.state.inv.torch = 1;
var px = MW.spawn ? 0 : 0;
var placed = false;
for (z = 0; z < MW.D && !placed; z++) {
  for (x = 0; x < MW.W && !placed; x++) {
    for (y = 1; y < MW.H - 1; y++) {
      if (MW.at(x, y, z) === MW.GRASS && MW.at(x, y + 1, z) === MW.AIR) {
        placed = MW.placeTorchAt(x, y + 1, z);
        if (placed) eq(MW.at(x, y + 1, z), MW.TORCH, 'torch block');
        break;
      }
    }
  }
}
if (!placed) fail('place torch');
eq(MW.state.inv.torch, 0, 'torch spent');

var boatOk = false;
for (z = 0; z < MW.D && !boatOk; z++) {
  for (x = 0; x < MW.W; x++) {
    if (MW.at(x, MW.SEA - 1, z) === MW.WATER) {
      boatOk = MW.addBoat(x + 0.5, z + 0.5, true, null);
      break;
    }
  }
}
if (!boatOk) fail('boat on water');
if (MW.addBoat(2.5, 2.5, true, null) && MW.at(2, MW.SEA - 1, 2) !== MW.WATER) fail('boat on land');

MW.state.started = true;
var wx = -1, wz = -1;
for (z = 0; z < MW.D && wx < 0; z++) {
  for (x = 0; x < MW.W; x++) {
    if (MW.at(x, MW.SEA - 1, z) === MW.WATER && MW.at(x, 3, z) !== MW.WATER && MW.at(x, 3, z) !== MW.AIR) {
      wx = x; wz = z; break;
    }
  }
}
if (wx < 0) fail('deep water');
MW.state.px = wx + 0.5;
MW.state.pz = wz + 0.5;
MW.state.py = MW.SEA - 1.8;
MW.state.vy = 0;
if (!MW.inWaterAt(MW.state.px, MW.state.py, MW.state.pz)) fail('expected to be in water');
var py0 = MW.state.py;
MW.sim(0.3);
if (!(MW.state.py > py0 + 0.4)) fail('swim up ' + py0 + ' -> ' + MW.state.py);

MW.setClock(0);
if (!(MW.dayFactor() > 0.85)) fail('day ' + MW.dayFactor());
var daySky = MW.skyRGB();
MW.setClock(36);
if (!(MW.dayFactor() < 0.12)) fail('night ' + MW.dayFactor());
var nightSky = MW.skyRGB();
if (!(nightSky[2] < daySky[2] - 0.4)) fail('night sky');

MW.loadRaw({ v: 2, tip: 'mw2', inv: { wood: 4, leaf: 2, dirt: 1, stone: 6 }, wood: 1, edits: ['0,0,0,0'], px: 1, py: 1, pz: 1 });
eq(MW.state.inv.wood, 4, 'v2 wood');
eq(MW.state.inv.leaf, 2, 'v2 leaf');
eq(MW.state.inv.stone, 6, 'v2 stone');
if (MW.at(0, 0, 0) === MW.AIR) fail('v2 edits must not apply on new map');

MW.loadRaw({ v: 1, wood: 7 });
eq(MW.state.inv.wood, 7, 'v1 wood');

MW.grow(11);
MW.state.inv.wood = 2;
MW.state.inv.gold = 0;
MW.pinHome();
MW.setSelfForTest('me');
MW.setRole('guest');
MW.applyNet({
  mw: 3, t: 'hi', from: 'host1', session: 'room-a', host: 1, seed: 4,
  edits: [], boats: [], clock: 36, name: '星星',
  px: 12, py: 9, pz: 14, yaw: 0.2, pitch: 0, w: 1
});
if (!MW.remotes.host1 || MW.remotes.host1.name !== '星星') fail('host avatar name');
if (!MW.feetClear(MW.state.px, MW.state.py, MW.state.pz)) fail('guest joined underground');
eq(MW.scan().seed, 4, 'guest uses host seed');
MW.applyNet({ mw: 3, t: 'pos', from: 'host1', name: '星星', x: 12.5, y: 9, z: 14.2, yaw: 1, pitch: 0, w: 2, host: 1, clock: 36 });
if (Math.abs(MW.remotes.host1.tx - 12.5) > 0.01) fail('pos sync');
MW.applyNet({ mw: 3, t: 'pos', from: 'me', name: '乐乐', x: 1, y: 1, z: 1 });
if (MW.remotes.me) fail('ignore self');
var solid = MW.at(0, 0, 0);
if (!solid) fail('need solid to sync break');
MW.applyNet({ mw: 3, t: 'set', from: 'host1', x: 0, y: 0, z: 0, id: 0 });
eq(MW.at(0, 0, 0), MW.AIR, 'host break sync');
MW.state.inv.gold = 9;
MW.save();
var saved = JSON.parse(localStorage.getItem('xygo-my-world'));
eq(saved.v, 3, 'save v');
eq(saved.tip, 'mw4', 'save tip');
eq(saved.seed, 11, 'guest keeps own map');
eq(saved.inv.gold, 9, 'guest keeps coins');
eq(saved.inv.wood, 2, 'guest keeps wood');

var root = path.join(__dirname, '..', '..', '..');
var html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
var learn = fs.readFileSync(path.join(__dirname, 'LEARN.md'), 'utf8');
var hub = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
var peace = '这游戏没有怪物。';
var made = '自研小游戏，不是正版《我的世界》。';
if (html.split(peace).length < 3) fail('peace twice in page');
if (html.split(made).length < 3) fail('disclaimer twice in page');
if (html.indexOf('xy-tip" content="mw4"') < 0) fail('meta tip');
if (html.indexOf('my-world.css?v=mw4') < 0 || html.indexOf('my-world.js?v=mw4') < 0) fail('cache bust');
if (html.indexOf('vendor/peerjs/peerjs.min.js') < 0) fail('vendor peerjs');
if (html.indexOf('>mw4<') < 0) fail('hud tip');
if (learn.indexOf(peace) < 0 || learn.indexOf('不是正版《我的世界》') < 0) fail('learn disclaimers');
if (learn.indexOf('?v=mw4') < 0) fail('learn url');
if (learn.indexOf('出生') < 0) fail('learn spawn');
if (learn.indexOf('xygo-my-world') < 0) fail('learn key');
if (hub.indexOf('shuyang-ai/learn/my-world/?v=mw4') < 0) fail('hub tip');
if (hub.indexOf('my-world/?v=mw3') >= 0) fail('old hub tip');

if (failed) {
  console.error(failed + ' failed');
  process.exit(1);
}
console.log('my-world mw4 ok');
