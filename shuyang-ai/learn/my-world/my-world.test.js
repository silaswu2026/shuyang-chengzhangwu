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
  setItem: function (k, v) { mem[k] = String(v); },
  removeItem: function (k) { delete mem[k]; }
};

eq(MW.TIP, 'mw11', 'tip');
eq(MW.STORE, 'xygo-my-world', 'store');
if (MW.KID_NAMES.length < 8) fail('kid names');
MW.KID_NAMES.forEach(function (n) {
  if (!/^[\u4e00-\u9fff]{2,3}$/.test(n)) fail('name ' + n);
});
var ice = JSON.stringify(MW.NET_PEER_OPTS);
if (ice.indexOf('stun:stun.l.google.com:19302') < 0) fail('stun');
if (ice.indexOf('turn:staticauth.openrelay.metered.ca:443') < 0) fail('turn');
if (ice.indexOf('turn:openrelay.metered.ca:443') >= 0) fail('blackhole turn host');
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
if (!(MW.dayFactor() > 0.85)) fail('still bright at 36s ' + MW.dayFactor());
var dusk = 0.62 * MW.DAY;
MW.setClock(dusk);
var duskA = MW.dayFactor();
MW.setClock(dusk + 20);
var duskB = MW.dayFactor();
if (!(duskA > duskB + 0.08)) fail('sunset not moving ' + duskA + ' -> ' + duskB);
if (duskA - duskB > 0.5) fail('sunset too fast ' + (duskA - duskB));
if (duskA - duskB < 0.05) fail('dusk not moving enough ' + (duskA - duskB));
MW.setClock(0.76 * MW.DAY);
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
eq(saved.tip, 'mw11', 'save tip');
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
if (html.indexOf('xy-tip" content="mw11"') < 0) fail('meta tip');
if (html.indexOf('my-world.css?v=mw11') < 0 || html.indexOf('my-world.js?v=mw11') < 0) fail('cache bust');
if (html.indexOf('vendor/peerjs/peerjs.min.js') < 0) fail('vendor peerjs');
if (html.indexOf('>mw11<') < 0) fail('hud tip');
if (learn.indexOf(peace) < 0 || learn.indexOf('不是正版《我的世界》') < 0) fail('learn disclaimers');
if (learn.indexOf('?v=mw11') < 0) fail('learn url');
if (learn.indexOf('出生') < 0) fail('learn spawn');
if (learn.indexOf('台阶') < 0) fail('learn step');
if (learn.indexOf('看不见自己的手') < 0) fail('learn hand');
if (learn.indexOf('xygo-my-world') < 0) fail('learn key');
if (hub.indexOf('shuyang-ai/learn/my-world/?v=mw11') < 0) fail('hub tip');
if (hub.indexOf('my-world/?v=mw10') >= 0) fail('old hub tip');
if (learn.indexOf('小猪') < 0 || learn.indexOf('护甲') < 0) fail('learn mobs');

function standAt(spot) {
  MW.state.px = spot.x;
  MW.state.py = spot.y;
  MW.state.pz = spot.z;
  MW.state.yaw = 0;
  MW.state.pitch = 0;
  MW.state.vy = 0;
  MW.state.onGround = true;
  MW.state.started = true;
  MW.state.ride = -1;
}
function layLedge(spot, tall) {
  var x = Math.floor(spot.x);
  var z0 = Math.floor(spot.z) - 1;
  var fy = Math.floor(spot.y);
  var dz;
  for (dz = 0; dz < 5; dz++) {
    MW.put(x, fy, z0 - dz, MW.DIRT);
    MW.put(x, fy + 1, z0 - dz, tall ? MW.STONE : MW.AIR);
    MW.put(x, fy + 2, z0 - dz, MW.AIR);
    MW.put(x, fy + 3, z0 - dz, MW.AIR);
  }
  return { x: x, z0: z0, fy: fy };
}
MW.grow(2);
var ledge = MW.scan().spawn;
standAt(ledge);
var step = layLedge(ledge, false);
var yBefore = MW.state.py;
var hop;
for (hop = 0; hop < 36; hop++) {
  MW.press('KeyW', true);
  MW.press('Space', true);
  MW.sim(0.05);
}
MW.press('KeyW', false);
MW.press('Space', false);
if (!(MW.state.py >= yBefore + 0.9)) fail('jump step py ' + yBefore + ' -> ' + MW.state.py);
if (MW.state.pz > step.z0 + 1) fail('jump did not land on ledge z ' + MW.state.pz);

MW.grow(2);
ledge = MW.scan().spawn;
standAt(ledge);
step = layLedge(ledge, false);
yBefore = MW.state.py;
for (hop = 0; hop < 24; hop++) {
  MW.press('KeyW', true);
  MW.sim(0.05);
}
MW.press('KeyW', false);
if (MW.state.py >= yBefore + 0.45) fail('walk auto-stepped ' + yBefore + ' -> ' + MW.state.py);

MW.grow(2);
ledge = MW.scan().spawn;
standAt(ledge);
step = layLedge(ledge, true);
yBefore = MW.state.py;
for (hop = 0; hop < 30; hop++) {
  MW.press('KeyW', true);
  MW.press('Space', true);
  MW.sim(0.05);
}
MW.press('KeyW', false);
MW.press('Space', false);
if (MW.state.py > yBefore + 1.6) fail('climbed a 2 block wall ' + MW.state.py);

MW.grow(2);
ledge = MW.scan().spawn;
standAt(ledge);
var peak = ledge.y;
for (hop = 0; hop < 20; hop++) {
  MW.press('Space', true);
  MW.sim(0.05);
  if (MW.state.py > peak) peak = MW.state.py;
}
MW.press('Space', false);
if (peak - ledge.y < 1.15) fail('jump apex ' + (peak - ledge.y));
if (peak - ledge.y > 1.6) fail('jump too high ' + (peak - ledge.y));
MW.state.started = true;
MW.state.hold = 'hand';
MW.state.equip.weapon = '';
MW.state.equip.tool = '';
MW.state.equip.armor = '';
eq(MW.handKind(), 'hand', 'bare hand');
MW.state.equip.weapon = 'swordWood';
eq(MW.handKind(), 'swordWood', 'wood sword in hand');
MW.state.equip.weapon = 'swordStone';
eq(MW.handKind(), 'swordStone', 'stone sword in hand');
MW.state.equip.weapon = '';
MW.state.equip.tool = 'pick';
eq(MW.handKind(), 'pick', 'pick in hand');
MW.state.hold = 'torch';
eq(MW.handKind(), 'torch', 'torch in hand');
MW.state.hold = 'boat';
eq(MW.handKind(), 'boat', 'boat in hand');
MW.state.hold = 'hand';
MW.state.equip.armor = 'armor';
eq(MW.handKind(), 'pick', 'armor keeps the tool');
MW.state.inv.gun = 1;
MW.selectPack('gun');
eq(MW.handKind(), 'gun', 'pack selects gun');

if (!(MW.W >= 52 && MW.D >= 52)) fail('world size ' + MW.W + 'x' + MW.D);
MW.grow(4);
if (!MW.villagers || MW.villagers.length < 3) fail('villagers');
if (!MW.pigs || MW.pigs.length < 3) fail('pigs');
if (!MW.cows || MW.cows.length < 2) fail('cows');
var bottom = MW.at(4, 0, 4);
if (!bottom) fail('no bottom block');
MW.breakBlock({ x: 4, y: 0, z: 4 });
eq(MW.at(4, 0, 4), MW.AIR, 'bottom dug');
if (MW.solid(4, -1, 4)) fail('bedrock plane still solid');

MW.state.inv.wood = 0;
if (MW.craft('torch')) fail('torch locked');
MW.state.inv.wood = 1;
if (MW.craft('torch')) fail('torch costs 3');
MW.state.inv.wood = 3;
if (!MW.craft('torch')) fail('torch crafts');
eq(MW.state.inv.torch, 1, 'got torch');
MW.selectPack('torch');
eq(MW.handKind(), 'torch', 'pack selects torch');
MW.state.inv.wood = 9;
if (MW.craft('boat')) fail('boat costs 10');
MW.state.inv.wood = 10;
if (!MW.craft('boat')) fail('boat crafts');

MW.state.started = true;
MW.state.hold = 'hand';
MW.state.yaw = 0;
MW.state.pitch = 0;
var pig = MW.pigs[0];
pig.alive = true;
pig.hp = 1;
pig.x = MW.state.px;
pig.y = MW.state.py;
pig.z = MW.state.pz - 2;
MW.state.equip.weapon = 'gun';
MW.state.inv.gun = 1;
if (!MW.tryShoot()) fail('gun missed pig');
if (pig.alive) fail('pig should die in one shot');
var cow = MW.cows[0];
cow.alive = true;
cow.hp = 12;
cow.x = MW.state.px;
cow.y = MW.state.py;
cow.z = MW.state.pz - 2;
if (!MW.tryShoot() || cow.hp !== 8 || !cow.alive) fail('cow first shot');
MW.tryShoot();
if (cow.hp !== 4 || !cow.alive) fail('cow second shot');
MW.tryShoot();
if (cow.alive) fail('cow third shot');

MW.state.equip.armor = '';
MW.state.inv.armor = 0;
MW.state.hp = 10;
MW.state.px = cow.x + 1.2;
MW.state.pz = cow.z;
MW.state.py = cow.y;
MW.state.knockX = 0;
MW.state.knockZ = 0;
MW.state.vy = 0;
cow.alive = true;
cow.cool = 0;
MW.cowBump(cow);
if (Math.abs(MW.state.knockX) + Math.abs(MW.state.knockZ) < 1) fail('cow did not knock');
if (!(MW.state.vy > 2)) fail('cow did not launch');
MW.state.equip.armor = 'armor';
MW.state.inv.armor = 1;
MW.state.knockX = 0;
MW.state.knockZ = 0;
MW.state.vy = 0;
cow.cool = 0;
MW.cowBump(cow);
if (Math.abs(MW.state.knockX) + Math.abs(MW.state.knockZ) > 0.01) fail('armor still knocked');
if (MW.state.vy > 1) fail('armor still launched');

MW.remotes.pal = { name: '豆豆', x: MW.state.px + 3, y: MW.state.py, z: MW.state.pz + 1, seen: Date.now() };
var dots = MW.mapDots();
var selfDot = null, redDot = null, di;
for (di = 0; di < dots.dots.length; di++) {
  if (dots.dots[di].kind === 'self') selfDot = dots.dots[di];
  if (dots.dots[di].kind === 'other') redDot = dots.dots[di];
}
if (!selfDot || selfDot.color !== '#111') fail('self not black');
if (!redDot || redDot.color !== '#e23b3b') fail('friend not red');
var pigDot = null, cowDot = null;
for (di = 0; di < dots.dots.length; di++) {
  if (dots.dots[di].kind === 'pig') pigDot = dots.dots[di];
  if (dots.dots[di].kind === 'cow') cowDot = dots.dots[di];
}
if (!pigDot || pigDot.color !== '#ff4f93') fail('pig not on map');
if (!cowDot || cowDot.color !== '#e08a28') fail('cow not on map');
var home = MW.villageAt();
if (home) {
  var far = true, mi;
  for (mi = 0; mi < MW.pigs.length; mi++) {
    if (Math.hypot(MW.pigs[mi].x - home.x, MW.pigs[mi].z - home.z) < 8) far = false;
  }
  for (mi = 0; mi < MW.cows.length; mi++) {
    if (Math.hypot(MW.cows[mi].x - home.x, MW.cows[mi].z - home.z) < 8) far = false;
  }
  if (!far) fail('animals spawned inside the village');
}
var clk = MW.clockText();
if (clk.indexOf('太阳') < 0 && clk.indexOf('白天') < 0 && clk.indexOf('夜里') < 0) fail('clock label ' + clk);
if (!/\d\d:\d\d/.test(clk)) fail('clock time ' + clk);
if (dots.n < 30 || dots.cell > 3) fail('map cells');
delete MW.remotes.pal;

MW.grow(8);
var poolX = 8, poolZ = 20, shoreTop = 8, waterDepth = 4, yy;
for (yy = 0; yy < MW.H; yy++) {
  MW.put(poolX, yy, poolZ, MW.AIR);
  MW.put(poolX + 1, yy, poolZ, MW.AIR);
}
for (yy = 0; yy < shoreTop - waterDepth; yy++) MW.put(poolX, yy, poolZ, MW.STONE);
for (yy = shoreTop - waterDepth; yy < shoreTop; yy++) MW.put(poolX, yy, poolZ, MW.WATER);
for (yy = 0; yy <= shoreTop; yy++) MW.put(poolX + 1, yy, poolZ, MW.DIRT);
var waterCol = MW.columnSurface(poolX, poolZ);
if (!waterCol || waterCol.depth !== waterDepth) fail('water depth ' + (waterCol && waterCol.depth));
if (waterCol.surface === MW.SEA && shoreTop !== MW.SEA) fail('water still pinned to sea');
MW.state.started = true;
MW.state.ride = -1;
MW.state.sitting = null;
MW.state.pitch = 0;
MW.state.px = poolX + 0.5;
MW.state.pz = poolZ + 0.5;
MW.state.py = shoreTop - 1.15;
MW.state.vy = 0;
MW.state.yaw = Math.PI / 2;
MW.state.onGround = false;
for (hop = 0; hop < 36; hop++) {
  MW.press('KeyW', true);
  MW.press('Space', true);
  MW.sim(0.05);
}
MW.press('KeyW', false);
MW.press('Space', false);
if (MW.state.py < shoreTop + 0.9) fail('did not climb shore ' + MW.state.py);
if (MW.state.px < poolX + 1) fail('still in pool x ' + MW.state.px);
if (MW.overlaps(MW.state.px, MW.state.py, MW.state.pz)) fail('stuck in shore');
for (yy = 0; yy <= shoreTop + 1; yy++) MW.put(poolX + 1, yy, poolZ, MW.STONE);
MW.state.px = poolX + 0.5;
MW.state.pz = poolZ + 0.5;
MW.state.py = shoreTop - 1.15;
MW.state.vy = 0;
MW.state.onGround = false;
for (hop = 0; hop < 24; hop++) {
  MW.press('KeyW', true);
  MW.press('Space', true);
  MW.sim(0.05);
}
MW.press('KeyW', false);
MW.press('Space', false);
if (MW.state.py > shoreTop + 1.35) fail('climbed two-block bank ' + MW.state.py);

MW.state.hold = 'torch';
MW.state.inv.torch = 1;
var heldLit = false, lightI, lightList = MW.lightPoints();
for (lightI = 0; lightI < lightList.length; lightI++) if (lightList[lightI].held) heldLit = true;
if (!heldLit) fail('held torch does not light');
MW.setClock(0.93 * MW.DAY);
MW.put(poolX + 3, 4, poolZ, MW.TORCH);
if (MW.at(poolX + 3, 4, poolZ) !== MW.TORCH) fail('torch vanished at night');
MW.state.hold = 'hand';

var bedX = Math.floor(MW.state.px), bedZ = Math.floor(MW.state.pz), bedY = Math.floor(MW.state.py);
if (bedY < 1) bedY = 4;
MW.put(bedX, bedY - 1, bedZ, MW.DIRT);
MW.put(bedX, bedY, bedZ, MW.BED);
MW.put(bedX, bedY + 1, bedZ, MW.AIR);
MW.state.px = bedX + 0.5;
MW.state.pz = bedZ + 0.5;
MW.state.py = bedY;
MW.state.ride = -1;
MW.toggleSit();
if (!MW.state.sitting) fail('did not sit');
MW.setClock(0.8 * MW.DAY);
var nightClock = MW.state.clock;
if (!MW.sleepNow()) fail('sleep');
if (Math.abs(MW.state.clock - nightClock) > 1) fail('solo sleep skipped the day');
MW.remotes.friend = { name: '豆豆', x: 1, y: 1, z: 1, sl: 1, seen: Date.now() };
if (!MW.sleepNow()) fail('sleep together');
if (!(MW.dayFactor() > 0.85)) fail('did not wake at morning ' + MW.dayFactor());
delete MW.remotes.friend;

if (!MW.sheep || MW.sheep.length < 3) fail('sheep');
var shp = MW.sheep[0];
MW.state.yaw = 0;
MW.state.pitch = 0;
var mi2;
for (mi2 = 0; mi2 < MW.pigs.length; mi2++) MW.pigs[mi2].alive = false;
for (mi2 = 0; mi2 < MW.cows.length; mi2++) MW.cows[mi2].alive = false;
shp.alive = true;
shp.hp = MW.SHEEP_HP;
shp.flee = 0;
shp.x = MW.state.px;
shp.z = MW.state.pz - 2;
shp.y = MW.state.py;
MW.state.equip.weapon = 'gun';
MW.state.inv.gun = 1;
MW.state.hold = 'hand';
MW.state.inv.raw = 0;
if (!MW.tryShoot()) fail('gun missed sheep');
if (!(shp.hp === 2 && shp.flee > MW.state.clock)) fail('sheep did not flee ' + shp.hp);
var sx = shp.x;
for (hop = 0; hop < 20; hop++) MW.sim(0.05);
if (Math.abs(shp.x - sx) < 0.2 && Math.abs(shp.z - (MW.state.pz)) < 0.2) fail('sheep stood still');
MW.state.hp = 4;
MW.state.inv.raw = 1;
MW.eatFood('raw');
eq(MW.state.hp, 6, 'raw heal');
MW.state.inv.cooked = 1;
MW.eatFood('cooked');
eq(MW.state.hp, 10, 'cooked caps at 10');
MW.state.inv.raw = 1;
MW.state.cooking = 0;
MW.startCook();
for (hop = 0; hop < 90; hop++) MW.sim(0.05);
eq(MW.state.inv.cooked > 0 ? 1 : 0, 1, 'cooked meat');
MW.state.equip.tool = 'axe';
MW.state.inv.axe = 1;
MW.state.dur = { axe: 40, pick: 80, pickIron: 160 };
MW.put(6, 1, 6, MW.LOG);
var axe0 = MW.toolLeft('axe');
MW.breakBlock({ x: 6, y: 1, z: 6 });
if (!(MW.toolLeft('axe') < axe0)) fail('axe durability');
var handStone = (function () { MW.state.equip.tool = ''; return MW.breakTime(MW.STONE); })();
MW.state.equip.tool = 'pick';
if (!(MW.breakTime(MW.STONE) < handStone)) fail('stone pick faster');
MW.state.equip.tool = 'pickIron';
var ironT = MW.breakTime(MW.STONE);
MW.state.equip.tool = 'pick';
if (!(ironT < MW.breakTime(MW.STONE))) fail('iron pick faster');
MW.state.hp = 10;
MW.cows[0].alive = true;
MW.cows[0].cool = 0;
MW.state.equip.armor = 'armorIron';
MW.state.inv.armorIron = 1;
MW.state.armorLeft = 80;
MW.state.armorSoak = 0;
MW.cowBump(MW.cows[0]);
if (MW.state.hp > 9) fail('iron armor blocked all damage ' + MW.state.hp);
if (MW.state.hp < 8) fail('iron armor did not reduce ' + MW.state.hp);
if (!MW.villagers.length) fail('need villager');
MW.state.px = MW.villagers[0].x;
MW.state.pz = MW.villagers[0].z;
MW.state.inv.raw = 1;
var tor0 = MW.state.inv.torch | 0;
if (!MW.tryTrade()) fail('trade');
eq(MW.state.inv.torch, tor0 + 1, 'traded torch');
MW.state.inv.wood = 10;
MW.state.ach = {};
if (!MW.craft('boat')) fail('boat for sticker');
if (!MW.state.ach.boat) fail('boat sticker');

localStorage.setItem('xygo-my-world', JSON.stringify({ v: 3, tip: 'mw11', seed: 11, px: 1, py: 1, pz: 1, inv: { wood: 9, gold: 4 } }));
MW.load();
eq(MW.state.inv.wood, 0, 'fresh wood');
eq(MW.state.inv.gold, 0, 'fresh gold');
if (MW.scan().seed === 11) fail('resumed old seed');
if (!MW.feetClear(MW.state.px, MW.state.py, MW.state.pz)) fail('fresh spawn');
if (localStorage.getItem('xygo-my-world')) fail('old save kept');

if (failed) {
  console.error(failed + ' failed');
  process.exit(1);
}
console.log('my-world mw11 ok');
