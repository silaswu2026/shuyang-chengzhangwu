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

eq(MW.TIP, 'mw22', 'tip');
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
var inletHit = false;
var iz;
for (iz = 4; iz <= 14; iz++) {
  if (MW.at(16, MW.SEA - 1, iz) === MW.WATER) inletHit = true;
}
if (!inletHit) fail('shore inlet');
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
MW.state.inv.wood = 2;
if (!MW.craftMix(['wood', 'wood'])) fail('craft stick');
eq(MW.state.inv.wood, 0, 'wood spent');
eq(MW.state.inv.stick, 1, 'own stick');
eq(MW.state.equip.weapon, 'stick', 'auto equip');
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
MW.setClock(dusk + MW.DAY / 36);
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
eq(saved.tip, 'mw22', 'save tip');
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
if (html.indexOf('xy-tip" content="mw22"') < 0) fail('meta tip');
if (html.indexOf('my-world.css?v=mw22') < 0 || html.indexOf('my-world.js?v=mw22') < 0) fail('cache bust');
if (html.indexOf('vendor/peerjs/peerjs.min.js') < 0) fail('vendor peerjs');
if (html.indexOf('>mw22<') < 0) fail('hud tip');
if (html.indexOf('本局 7:00') < 0) fail('match clock');
if (html.indexOf('黑煤炭带金点') < 0) fail('coal hint');
if (html.indexOf('金色箱盖') < 0) fail('chest hint');
if (learn.indexOf(peace) < 0 || learn.indexOf('不是正版《我的世界》') < 0) fail('learn disclaimers');
if (learn.indexOf('?v=mw22') < 0) fail('learn url');
if (learn.indexOf('出生') < 0) fail('learn spawn');
if (learn.indexOf('台阶') < 0) fail('learn step');
if (learn.indexOf('看不见自己的手') < 0) fail('learn hand');
if (learn.indexOf('xygo-my-world') < 0) fail('learn key');
if (learn.indexOf('xygo-my-world-mw22') < 0) fail('learn channel');
if (learn.indexOf('0.0014') < 0) fail('learn mouse');
if (learn.indexOf('7:00') < 0) fail('learn duration');
if (hub.indexOf('shuyang-ai/learn/my-world/?v=mw22') < 0) fail('hub tip');
if (hub.indexOf('my-world/?v=mw21') >= 0 || hub.indexOf('my-world/?v=mw20') >= 0 || hub.indexOf('my-world/?v=mw16') >= 0 || hub.indexOf('my-world/?v=mw15') >= 0 || hub.indexOf('my-world/?v=mw14') >= 0 || hub.indexOf('my-world/?v=mw13') >= 0 || hub.indexOf('my-world/?v=mw12') >= 0 || hub.indexOf('my-world/?v=mw11') >= 0) fail('old hub tip');
if (learn.indexOf('野猪') < 0 || learn.indexOf('护甲') < 0) fail('learn mobs');
if (learn.indexOf('鸡') < 0 || learn.indexOf('雪') < 0 || learn.indexOf('铁剑') < 0 || learn.indexOf('表情') < 0) fail('learn mw12');

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
MW.state.inv.coal = 0;
if (MW.craftMix(['coal', 'wood'])) fail('torch needs both');
MW.state.inv.wood = 1;
if (MW.craftMix(['coal', 'wood'])) fail('torch needs coal');
MW.state.inv.coal = 1;
if (!MW.craftMix(['coal', 'wood'])) fail('torch crafts');
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
MW.state.pitch = 0;
var bootCoal = MW.ray(6.5, true);
if (!bootCoal || bootCoal.id !== MW.COAL_ORE || !(bootCoal.dist < 5.5)) fail('boot look missed coal ' + (bootCoal && bootCoal.dist));

if (!(MW.DAY <= 400 && MW.DAY < 720)) fail('day still 12 min ' + MW.DAY);
if (!(MW.W > 56 && MW.D > 56)) fail('world not bigger');
if (!(MW.CHICKEN_FLEE > MW.SHEEP_FLEE)) fail('chicken not faster than sheep');
if (!(MW.COW_HP >= 24)) fail('cow hp ' + MW.COW_HP);
if (!(MW.COW_SPEED < MW.BOAR_SPEED * 0.5)) fail('cow not slow');
if (!(MW.BOAR_AGGRO >= 5 && MW.BOAR_AGGRO <= 9)) fail('boar aggro ' + MW.BOAR_AGGRO);
function terrainSample() {
  var W = MW.W, D = MW.D, H = MW.H;
  var topY = new Int16Array(W * D);
  var topId = new Uint8Array(W * D);
  var x, z, y, id, solidY, solidId, k, dy;
  for (z = 0; z < D; z++) {
    for (x = 0; x < W; x++) {
      solidY = -1;
      solidId = 0;
      for (y = 0; y < H; y++) {
        id = MW.at(x, y, z);
        if (id && id !== MW.WATER && id !== MW.LEAF && id !== MW.FLOWER && id !== MW.TORCH && id !== MW.BED && id !== MW.LOG && id !== MW.CHEST) {
          solidY = y;
          solidId = id;
        }
      }
      k = z * W + x;
      topY[k] = solidY;
      topId[k] = solidId;
    }
  }
  var total = 0, snow = 0, snowOut = 0, snowLow = 0;
  var plain = 0, plainGrass = 0, plainSnow = 0;
  var spawnN = 0, spawnGrass = 0, spawnSnow = 0;
  var steep = 0, edges = 0;
  for (z = 0; z < D; z++) {
    for (x = 0; x < W; x++) {
      k = z * W + x;
      if (topY[k] < 0) continue;
      total++;
      id = topId[k];
      if (id === MW.SNOW) {
        snow++;
        if (x < 64 || z < 64) snowOut++;
        if (topY[k] < MW.SEA + 4) snowLow++;
      }
      if (x >= 22 && x <= 52 && z >= 24 && z <= 48) {
        plain++;
        if (id === MW.GRASS) plainGrass++;
        if (id === MW.SNOW) plainSnow++;
      }
      if (x >= 16 && x <= 30 && z >= 12 && z <= 24) {
        spawnN++;
        if (id === MW.GRASS) spawnGrass++;
        if (id === MW.SNOW) spawnSnow++;
      }
      if (x >= 18 && x <= 60 && z >= 16 && z <= 70 && x + 1 <= 60) {
        dy = Math.abs(topY[k] - topY[k + 1]);
        edges++;
        if (dy >= 2) steep++;
      }
      if (x >= 18 && x <= 60 && z >= 16 && z < 70) {
        dy = Math.abs(topY[k] - topY[k + W]);
        edges++;
        if (dy >= 2) steep++;
      }
    }
  }
  return {
    total: total, snow: snow, snowShare: total ? snow / total : 1,
    snowOut: snowOut, snowLow: snowLow,
    plain: plain, plainGrass: plainGrass, plainSnow: plainSnow,
    spawnN: spawnN, spawnGrass: spawnGrass, spawnSnow: spawnSnow,
    steep: steep, edges: edges
  };
}
for (seedN = 1; seedN <= 24; seedN++) {
  MW.grow(seedN);
  MW.state.pitch = 0;
  var eyeCoal = MW.ray(6.5, true);
  if (!eyeCoal || eyeCoal.id !== MW.COAL_ORE || !(eyeCoal.dist < 5.5)) fail('seed ' + seedN + ' level look missed spawn coal ' + (eyeCoal && eyeCoal.id + '@' + eyeCoal.dist));
  var ts = MW.treeStats();
  if (ts.n < 8) fail('seed ' + seedN + ' trees ' + ts.n);
  if (!(ts.nearest <= 18)) fail('seed ' + seedN + ' nearest tree ' + ts.nearest);
  var beds = 0, houseChests = 0, snowN = 0, ironN = 0;
  var vx = MW.villageAt();
  if (!vx || !vx.houses || vx.houses.length !== 3) fail('one village three houses seed ' + seedN);
  for (z = 0; z < MW.D; z++) {
    for (y = 0; y < MW.H; y++) {
      for (x = 0; x < MW.W; x++) {
        var id = MW.at(x, y, z);
        if (id === MW.BED) beds++;
        if (id === MW.SNOW) snowN++;
        if (id === MW.IRON_ORE) ironN++;
        if (id === MW.CHEST && vx && Math.hypot(x - vx.x, z - vx.z) < 12) houseChests++;
      }
    }
  }
  if (beds < 3) fail('beds ' + beds + ' seed ' + seedN);
  if (houseChests < 3) fail('house chests ' + houseChests + ' seed ' + seedN);
  if (ironN < 8) fail('iron ore ' + ironN + ' seed ' + seedN);
  var lay = terrainSample();
  if (!(lay.snowShare < 0.12)) fail('snow share ' + lay.snowShare.toFixed(3) + ' seed ' + seedN);
  if (lay.snow < 40) fail('snow cap ' + lay.snow + ' seed ' + seedN);
  if (lay.snowOut) fail('snow outside northeast mountain ' + lay.snowOut + ' seed ' + seedN);
  if (lay.snowLow) fail('snow below the high cap ' + lay.snowLow + ' seed ' + seedN);
  if (lay.plainSnow) fail('central grass has snow ' + lay.plainSnow + ' seed ' + seedN);
  if (lay.spawnSnow) fail('spawn meadow has snow seed ' + seedN);
  if (!(lay.plainGrass / lay.plain > 0.8)) fail('central grass ' + lay.plainGrass + '/' + lay.plain + ' seed ' + seedN);
  if (!(lay.spawnGrass / lay.spawnN > 0.75)) fail('spawn meadow grass ' + lay.spawnGrass + '/' + lay.spawnN + ' seed ' + seedN);
  if (lay.edges && lay.steep / lay.edges > 0.02) fail('jagged ground ' + lay.steep + '/' + lay.edges + ' seed ' + seedN);
  var lootN = MW.treasures();
  if (lootN.length !== 7) fail('treasures ' + lootN.length + ' seed ' + seedN);
  var idolN = null, li;
  for (li = 0; li < lootN.length; li++) if (lootN[li].id === 'idol') idolN = lootN[li];
  if (!idolN || !idolN.buried || !idolN.cover) fail('idol missing seed ' + seedN);
  if (MW.at(idolN.cover.x, idolN.cover.y, idolN.cover.z) !== MW.SNOW) fail('idol not in snow seed ' + seedN);
  if (idolN.cover.x < 64 || idolN.cover.z < 64) fail('idol left the mountain seed ' + seedN);
  if (seedN === 1) {
    console.log('terrain seed1 snow=' + lay.snow + '/' + lay.total + ' share=' + lay.snowShare.toFixed(4) + ' plainGrass=' + lay.plainGrass + '/' + lay.plain + ' spawnGrass=' + lay.spawnGrass + '/' + lay.spawnN + ' steep=' + lay.steep + '/' + lay.edges);
  }
}
MW.grow(4);
var treesBefore = MW.treeStats().n;
var logsBefore = MW.scan().counts[MW.LOG];
MW.save();
eq(MW.treeStats().n, treesBefore, 'save keeps trees');
eq(MW.scan().counts[MW.LOG], logsBefore, 'save keeps logs');
var trunk = MW.treeStats();
var cutX = -1, cutY = -1, cutZ = -1;
for (z = 0; z < MW.D && cutX < 0; z++) {
  for (x = 0; x < MW.W; x++) {
    var stack = 0, topLog = -1;
    for (y = 0; y < MW.H; y++) if (MW.at(x, y, z) === MW.LOG) { stack++; topLog = y; }
    if (stack >= 3) { cutX = x; cutY = topLog; cutZ = z; break; }
  }
}
if (cutX < 0) fail('no trunk to dig');
MW.breakBlock({ x: cutX, y: cutY, z: cutZ });
eq(MW.at(cutX, cutY, cutZ), MW.AIR, 'one log dug');
if (MW.at(cutX, cutY - 1, cutZ) !== MW.LOG) fail('dig cleared the trunk');

MW.state.inv.iron = 1;
MW.state.inv.wood = 1;
MW.state.equip.weapon = '';
if (!MW.craftMix(['iron', 'wood'])) fail('iron sword');
eq(MW.state.equip.weapon, 'swordIron', 'iron sword equipped');
eq(MW.meleeDmg(), 4, 'iron sword damage');
MW.state.equip.weapon = 'stick';
eq(MW.meleeDmg(), 2, 'stick damage');
MW.state.equip.weapon = '';
eq(MW.meleeDmg(), 1, 'fist');

function flatPad(cx, cz) {
  var yy, dx, dz;
  for (dx = -16; dx <= 16; dx++) {
    for (dz = -16; dz <= 16; dz++) {
      for (yy = 0; yy < MW.H; yy++) MW.put(cx + dx, yy, cz + dz, MW.AIR);
      MW.put(cx + dx, 4, cz + dz, MW.GRASS);
      if (4 > 0) MW.put(cx + dx, 3, cz + dz, MW.DIRT);
    }
  }
}
flatPad(30, 30);
MW.state.started = true;
MW.state.ride = -1;
MW.state.sitting = null;
MW.state.px = 30.5;
MW.state.py = 5;
MW.state.pz = 30.5;
MW.state.yaw = 0;
MW.state.pitch = 0;
var boar = MW.pigs[0];
boar.alive = true;
boar.hp = MW.PIG_HP;
boar.cool = 99;
boar.x = 30.5;
boar.y = 5;
boar.z = 30.5 - 4;
var farBoar = MW.pigs[1];
farBoar.alive = true;
farBoar.hp = MW.PIG_HP;
farBoar.cool = 99;
farBoar.x = 30.5;
farBoar.y = 5;
farBoar.z = 30.5 - 20;
var boarZ = boar.z;
var farZ = farBoar.z;
for (hop = 0; hop < 20; hop++) MW.sim(0.05);
if (!(boar.z > boarZ + 0.4)) fail('boar did not close ' + boarZ + ' -> ' + boar.z);
if (Math.abs(farBoar.z - farZ) > 1.2) fail('boar charged from outside aggro ' + farZ + ' -> ' + farBoar.z);

var shp2 = MW.sheep[0];
var chk = MW.chickens[0];
shp2.alive = true;
shp2.hp = MW.SHEEP_HP;
shp2.flee = 0;
shp2.x = 30.5;
shp2.y = 5;
shp2.z = 30.5 + 3;
chk.alive = true;
chk.hp = MW.CHICKEN_HP;
chk.flee = 0;
chk.x = 30.5;
chk.y = 5;
chk.z = 30.5 + 3;
for (mi2 = 0; mi2 < MW.pigs.length; mi2++) MW.pigs[mi2].alive = false;
for (mi2 = 0; mi2 < MW.cows.length; mi2++) MW.cows[mi2].alive = false;
var sheepTravel = 0, chickTravel = 0, sx0 = shp2.x, sz0 = shp2.z, cx0 = chk.x, cz0 = chk.z;
for (hop = 0; hop < 10; hop++) {
  MW.sim(0.05);
  sheepTravel = Math.hypot(shp2.x - sx0, shp2.z - sz0);
  chickTravel = Math.hypot(chk.x - cx0, chk.z - cz0);
}
if (!(chickTravel > sheepTravel + 0.12)) fail('chicken not faster ' + chickTravel + ' vs ' + sheepTravel);

var cowSlow = MW.cows[0];
cowSlow.alive = true;
cowSlow.hp = MW.COW_HP;
cowSlow.mad = true;
cowSlow.cool = 99;
cowSlow.x = 30.5;
cowSlow.y = 5;
cowSlow.z = 30.5 - 3;
MW.state.hold = 'hand';
MW.state.inv.wheat = 0;
var cow0 = cowSlow.z;
for (hop = 0; hop < 20; hop++) MW.sim(0.05);
if (Math.abs(cowSlow.z - cow0) > 1.25) fail('cow moved too fast ' + cow0 + ' -> ' + cowSlow.z);

MW.state.hp = 10;
MW.state.cold = 0;
MW.state.px = 8.5;
MW.state.py = 5;
MW.state.pz = 8.5;
MW.put(8, 4, 8, MW.GRASS);
for (hop = 0; hop < 40; hop++) MW.sim(0.05);
eq(MW.state.hp, 10, 'grass is not cold');
MW.put(8, 4, 8, MW.SNOW);
MW.state.py = 5;
MW.state.cold = 0;
MW.state.hp = 10;
for (hop = 0; hop < 80; hop++) MW.sim(0.05);
if (!(MW.state.hp < 10)) fail('snow did not drain hp ' + MW.state.hp);
if (MW.inSnowTerritory() !== true) fail('not in snow');

MW.setRole('host');
MW.remotes.pal2 = { name: '豆豆', x: 1, y: 1, z: 1, seen: Date.now() };
if (!MW.sendEmote('happy')) fail('send emote');
MW.applyNet({ mw: 3, t: 'emote', from: 'pal2', e: 'hi' });
if (MW.remotes.pal2.emote !== 'hi') fail('peer emote');
delete MW.remotes.pal2;

MW.grow(5);
var trunk = null, tx, tz, ty, tys, hi, isHouse;
var homeV = MW.villageAt();
for (tz = 2; tz < MW.D - 2 && !trunk; tz++) {
  for (tx = 2; tx < MW.W - 2 && !trunk; tx++) {
    tys = [];
    for (ty = 0; ty < MW.H; ty++) if (MW.at(tx, ty, tz) === MW.LOG) tys.push(ty);
    if (tys.length < 3 || tys[1] !== tys[0] + 1) continue;
    isHouse = false;
    if (homeV && homeV.houses) {
      for (hi = 0; hi < homeV.houses.length; hi++) {
        var hh = homeV.houses[hi];
        if (tx >= hh.x && tx < hh.x + 5 && tz >= hh.z && tz < hh.z + 5) isHouse = true;
      }
    }
    if (isHouse) continue;
    if (MW.at(tx + 1, tys[0] - 1, tz) !== MW.GRASS) continue;
    if (MW.at(tx + 1, tys[0], tz) !== MW.AIR) continue;
    if (MW.at(tx + 1, tys[0] + 1, tz) !== MW.AIR) continue;
    if (MW.at(tx, tys[0] + 1, tz) !== MW.LOG) continue;
    trunk = { x: tx, z: tz, y: tys[0] + 1, lows: tys };
  }
}
if (!trunk) fail('no bare trunk to chop');
else {
  var mi3;
  for (mi3 = 0; mi3 < MW.pigs.length; mi3++) MW.pigs[mi3].alive = false;
  for (mi3 = 0; mi3 < MW.cows.length; mi3++) MW.cows[mi3].alive = false;
  for (mi3 = 0; mi3 < MW.sheep.length; mi3++) MW.sheep[mi3].alive = false;
  for (mi3 = 0; mi3 < MW.chickens.length; mi3++) MW.chickens[mi3].alive = false;
  MW.state.started = true;
  MW.state.ride = -1;
  MW.state.sitting = null;
  MW.state.hold = 'hand';
  MW.state.equip.weapon = '';
  MW.state.equip.tool = '';
  MW.state.inv.wood = 0;
  MW.state.inv.torch = 0;
  MW.state.inv.leaf = 0;
  MW.state.px = trunk.x + 1.5;
  MW.state.py = trunk.y - 1;
  MW.state.pz = trunk.z + 0.5;
  MW.state.vy = 0;
  MW.state.onGround = true;
  MW.state.yaw = -Math.PI / 2;
  MW.state.pitch = 0;
  MW.setPunch(true);
  for (hop = 0; hop < 40; hop++) MW.sim(0.05);
  MW.setPunch(false);
  if (!(MW.state.inv.wood > 0)) fail('chopping the trunk gave no wood ' + MW.state.inv.wood);
  if (MW.at(trunk.x, trunk.y, trunk.z) === MW.LOG) fail('eye-level log still there');
  for (hi = 0; hi < trunk.lows.length; hi++) {
    if (MW.at(trunk.x, trunk.lows[hi], trunk.z) === MW.LOG) MW.breakBlock({ x: trunk.x, y: trunk.lows[hi], z: trunk.z });
  }
  if (MW.state.inv.wood < 3) fail('trunk did not drop 3 wood ' + MW.state.inv.wood);
  MW.state.inv.coal = 1;
  if (!MW.craftMix(['coal', 'wood'])) fail('torch after chopping wood');
  eq(MW.state.inv.torch, 1, 'torch from trunk wood');
}

var js = fs.readFileSync(path.join(__dirname, 'my-world.js'), 'utf8');
if (js.indexOf('function pushGlasses') < 0) fail('glasses');
if (!(MW.W >= 96 && MW.D >= 96)) fail('world not bigger ' + MW.W + 'x' + MW.D);
if (!(MW.W > 72 && MW.D > 72)) fail('not past mw13 size');
MW.state.nameTouched = false;
MW.state.name = '乐乐';
MW.applyHostName();
eq(MW.state.name, '杨杨', 'host default name');
MW.state.nameTouched = true;
MW.state.name = '豆豆';
MW.applyHostName();
eq(MW.state.name, '豆豆', 'renamed host stays');
MW.state.nameTouched = false;
if (MW.MIX.length !== 12) fail('mix count ' + MW.MIX.length);
var seenMix = {};
MW.MIX.forEach(function (r) {
  var key = r.mats.slice().sort().join('+');
  if (seenMix[key]) fail('dup mix ' + key);
  seenMix[key] = r.say;
});
eq(seenMix['stone+wood'], '石斧', 'stone axe');
eq(seenMix['iron+wood'], '铁剑', 'iron sword mix');
eq(seenMix['iron+stone'], '铁锤', 'hammer');
eq(seenMix['iron+stone+wood'], '暗夜剑', 'night');
eq(seenMix['coal+wood'], '火把', 'torch mix');
eq(seenMix['coal+stone'], '火山斧', 'volcano axe');
eq(seenMix['coal+iron'], '爆裂锤', 'blast');
eq(seenMix['wood+wood'], '木棍', 'stick mix');
eq(seenMix['stone+stone'], '石矛', 'spear');
eq(seenMix['iron+iron'], '铁棒', 'rod');
eq(seenMix['coal+stone+wood'], '星火镐', 'star pick');
eq(seenMix['coal+iron+wood'], '暖阳剑', 'sun sword');
MW.state.inv.wood = 1;
MW.state.inv.stone = 1;
MW.state.inv.iron = 1;
MW.state.inv.coal = 1;
if (MW.craftMix(['coal', 'coal'])) fail('unknown mix');
if (!MW.craftMix(['stone', 'iron', 'wood'])) fail('night sword mix');
eq(MW.state.equip.weapon, 'nightSword', 'night equipped');
MW.setClock(0.9 * MW.DAY);
if (MW.meleeDmg() < 6) fail('night sword at night ' + MW.meleeDmg());
MW.setClock(0);
if (MW.meleeDmg() !== 4) fail('night sword by day ' + MW.meleeDmg());
MW.grow(7);
MW.setMatch(0);
if ((MW.scan().counts[MW.LAVA] || 0) !== 0) fail('lava at start');
if ((MW.scan().counts[MW.MAGMA] || 0) !== 0) fail('magma at start');
if ((MW.scan().counts[MW.COAL_ORE] || 0) < 8) fail('coal ' + MW.scan().counts[MW.COAL_ORE]);
eq(MW.volcanoPhase(0).on, false, 'volcano off');
eq(MW.volcanoPhase(119).on, false, 'just before');
eq(MW.volcanoPhase(120).on, true, 'minute 2');
eq(MW.volcanoPhase(179.9).on, true, 'still erupting');
eq(MW.volcanoPhase(180).on, false, 'cleared');
eq(MW.volcanoPhase(269).on, false, 'gap');
eq(MW.volcanoPhase(270).on, false, 'still the gap');
eq(MW.volcanoPhase(300).on, true, 'second cycle');
eq(MW.volcanoPhase(359).on, true, 'second still going');
eq(MW.volcanoPhase(360).on, false, 'second cleared');
eq(MW.MATCH_SEC, 420, 'match length');
eq(MW.VOLCANO_FIRST, 120, 'volcano still at two minutes');
eq(MW.VOLCANO_DUR, 60, 'volcano duration');
eq(MW.VOLCANO_PERIOD, 180, 'volcano period');
eq(MW.MOUSE_LOOK, 0.0014, 'mouse look');
if (!(MW.CHEST_LID[0] > 0.9 && MW.CHEST_LID[1] > 0.7 && MW.CHEST_LID[2] < 0.35)) fail('chest lid ' + MW.CHEST_LID);
if (!(MW.COAL_MARK[0] > 0.9 && MW.COAL_MARK[1] > 0.7)) fail('coal mark ' + MW.COAL_MARK);
if (!(MW.COAL_CAP.lift >= 1 && MW.COAL_CAP.h >= 0.16 && MW.COAL_CAP.w >= 0.75 && MW.COAL_CAP.side >= 0.35)) fail('coal cap ' + JSON.stringify(MW.COAL_CAP));
eq(MW.matchLabel(), '本局 7:00', 'match hud');
MW.setMatch(61);
if (MW.matchLabel() !== '本局 5:59') fail('match label ' + MW.matchLabel());
MW.setMatch(120);
if ((MW.scan().counts[MW.LAVA] || 0) < 3) fail('lava rose ' + MW.scan().counts[MW.LAVA]);
MW.setMatch(180);
if ((MW.scan().counts[MW.LAVA] || 0) !== 0) fail('lava should clear');
if ((MW.scan().counts[MW.MAGMA] || 0) < 3) fail('residue ' + MW.scan().counts[MW.MAGMA]);
MW.setMatch(120.4);
var rocks = MW.activeRocks();
var leftR = 0, rightR = 0, ri;
for (ri = 0; ri < rocks.length; ri++) {
  if (rocks[ri].side === 0) leftR++;
  if (rocks[ri].side === 1) rightR++;
}
if (!leftR || !rightR) fail('rocks both sides ' + leftR + '/' + rightR);
MW.state.started = true;
MW.state.hp = 10;
MW.state.equip.armor = '';
MW.state.inv.armor = 0;
MW.state.px = rocks[0].x;
MW.state.py = rocks[0].y - 0.8;
MW.state.pz = rocks[0].z;
MW.state.rockHit = {};
MW.tickRocks();
if (!(MW.state.hp < 10)) fail('rock damage ' + MW.state.hp);
var vx = MW.volcanoInfo();
MW.setMatch(180);
MW.state.hp = 10;
MW.state.burn = 0;
MW.state.px = vx.pool[0].x + 0.5;
MW.state.pz = vx.pool[0].z + 0.5;
MW.state.py = vx.pool[0].y + 1;
if (MW.hotUnder() !== 'magma') fail('not on residue ' + MW.hotUnder());
for (hop = 0; hop < 24; hop++) MW.sim(0.05);
if (!(MW.state.hp < 10)) fail('residue did not burn ' + MW.state.hp);
var loot = MW.treasures();
if (loot.length !== 7) fail('treasure count ' + loot.length);
var scores = {}, buriedN = 0, ember = null, idol = null;
loot.forEach(function (t) {
  scores[t.id] = t.score;
  if (t.buried) buriedN++;
  if (t.id === 'ember') ember = t;
  if (t.id === 'idol') idol = t;
});
eq(scores.star, 12, 'star score');
eq(scores.shell, 18, 'shell score');
eq(scores.gem, 22, 'gem score');
eq(scores.crystal, 35, 'crystal score');
eq(scores.ember, 45, 'ember score');
eq(scores.idol, 55, 'idol score');
eq(scores.crown, 70, 'crown score');
if (buriedN < 2) fail('buried treasures ' + buriedN);
if (!idol || !idol.buried) fail('snow treasure not buried');
if (!ember || !vx) fail('ember');
if (Math.hypot(ember.x - (vx.cx + 0.5), ember.z - (vx.cz + 0.5)) > 3.2) fail('ember not in volcano');
MW.state.score = 0;
MW.state.scored = {};
MW.state.px = idol.x;
MW.state.py = idol.y;
MW.state.pz = idol.z;
MW.setRole(null);
if (MW.tryTake()) fail('took buried idol');
MW.put(idol.cover.x, idol.cover.y, idol.cover.z, MW.AIR);
if (!MW.tryTake()) fail('idol after dig');
eq(MW.state.score, 55, 'idol score');
MW.setRole('guest');
MW.setSelfForTest('me');
var star = null;
loot.forEach(function (t) { if (t.id === 'star') star = t; });
star.taken = '';
MW.state.px = star.x;
MW.state.py = star.y;
MW.state.pz = star.z;
MW.state.score = 55;
var before = MW.state.score;
MW.tryTake();
eq(MW.state.score, before, 'guest waits for host');
MW.applyNet({ mw: 3, t: 'loot', id: 'star', who: 'me', name: '杨杨', score: 12 });
eq(MW.state.score, before + 12, 'guest scored');
MW.setRole('host');
var shell = null;
loot.forEach(function (t) { if (t.id === 'shell') shell = t; });
shell.taken = '';
MW.applyNet({ mw: 3, t: 'lootAsk', from: 'pal', id: 'shell', name: '豆豆' });
if (shell.taken !== 'pal') fail('host did not award shell');
MW.setMatch(0);
MW.state.started = true;
MW.state.matchOver = false;
eq(MW.matchLabel(), '本局 7:00', 'reset label');

function parkMobs() {
  var mi;
  for (mi = 0; mi < MW.pigs.length; mi++) MW.pigs[mi].alive = false;
  for (mi = 0; mi < MW.cows.length; mi++) MW.cows[mi].alive = false;
  for (mi = 0; mi < MW.sheep.length; mi++) MW.sheep[mi].alive = false;
  for (mi = 0; mi < MW.chickens.length; mi++) MW.chickens[mi].alive = false;
}
function standMelee() {
  flatPad(30, 30);
  parkMobs();
  MW.setRole(null);
  MW.setMatch(0);
  MW.state.started = true;
  MW.state.matchOver = false;
  MW.state.ride = -1;
  MW.state.sitting = null;
  MW.state.hold = 'hand';
  MW.state.equip.weapon = '';
  MW.state.equip.tool = '';
  MW.state.equip.armor = '';
  MW.state.inv.armor = 0;
  MW.state.px = 30.5;
  MW.state.py = 5;
  MW.state.pz = 30.5;
  MW.state.yaw = 0;
  MW.state.pitch = 0;
  MW.state.vy = 0;
  MW.state.onGround = true;
  MW.state.knockX = 0;
  MW.state.knockZ = 0;
  MW.state.hp = 10;
  MW.setPunch(false);
  MW.sim(0.5);
}
function placeBoar(i, x, z, yaw) {
  var b = MW.pigs[i];
  b.alive = true;
  b.hp = MW.PIG_HP;
  b.cool = 99;
  b.x = x;
  b.y = 5;
  b.z = z;
  b.yaw = yaw;
  return b;
}
standMelee();
var held = placeBoar(0, 30.5, 30.5 + 2, 0);
MW.state.px = 30.5;
MW.state.py = 5;
MW.state.pz = 30.5;
MW.state.yaw = 0;
MW.state.pitch = 0;
MW.setPunch(true);
MW.sim(0.05);
eq(held.hp, MW.PIG_HP, 'punch behind boar should miss');
held.x = 30.5;
held.z = 30.5 - 1;
held.y = 5;
held.yaw = Math.PI;
held.cool = 99;
MW.state.px = 30.5;
MW.state.py = 5;
MW.state.pz = 30.5;
MW.state.yaw = 0;
MW.state.pitch = 0;
if (!(Math.hypot(held.x - MW.state.px, held.z - MW.state.pz) < MW.BOAR_HIT)) fail('boar not in hit range');
MW.sim(0.05);
if (held.hp !== MW.PIG_HP - 1) fail('held punch missed close level boar ' + held.hp);
var cooled = held.hp;
MW.sim(0.05);
eq(held.hp, cooled, 'swing damaged twice inside cooldown');

MW.setPunch(false);
MW.sim(0.5);
parkMobs();
var head = placeBoar(0, 30.5, 30.5 - 0.85, Math.PI);
var snoutZ = head.z + 0.72;
var aimDy = (head.y + 0.4) - (MW.state.py + 1.5);
var aimDz = snoutZ - MW.state.pz;
MW.state.px = 30.5;
MW.state.py = 5;
MW.state.pz = 30.5;
MW.state.yaw = 0;
MW.state.pitch = Math.atan2(aimDy, Math.abs(aimDz) || 0.001);
MW.state.equip.weapon = '';
MW.setPunch(true);
MW.sim(0.05);
if (head.hp !== MW.PIG_HP - 1) fail('looking at boar head missed ' + head.hp + ' pitch ' + MW.state.pitch);
MW.setPunch(false);
MW.sim(0.5);

parkMobs();
var fist = placeBoar(0, 30.5, 30.5 - 1, Math.PI);
MW.state.px = 30.5;
MW.state.py = 5;
MW.state.pz = 30.5;
MW.state.yaw = 0;
MW.state.pitch = 0;
MW.state.equip.weapon = '';
MW.state.inv.raw = 0;
MW.setPunch(true);
var fistHits = 0, fistPrev = fist.hp, fistN;
for (fistN = 0; fistN < 80 && fist.alive; fistN++) {
  MW.sim(0.05);
  if (fist.hp < fistPrev) fistHits++;
  fistPrev = fist.hp;
}
if (fist.alive) fail('four fists did not kill boar hp ' + fist.hp);
eq(fistHits, 4, 'four fist hits');
if ((MW.state.inv.raw | 0) < 1) fail('boar dropped no raw meat');
MW.setPunch(false);
MW.sim(0.5);

parkMobs();
var ironBoar = placeBoar(1, 30.5, 30.5 - 1, Math.PI);
MW.state.px = 30.5;
MW.state.py = 5;
MW.state.pz = 30.5;
MW.state.yaw = 0;
MW.state.pitch = 0;
MW.state.equip.weapon = 'swordIron';
MW.state.inv.swordIron = 1;
eq(MW.meleeDmg(), 4, 'iron sword still 4');
MW.setPunch(true);
MW.sim(0.05);
if (ironBoar.alive || ironBoar.hp > 0) fail('iron sword did not kill boar ' + ironBoar.hp);
MW.setPunch(false);
MW.sim(0.5);

parkMobs();
var gunBoar = placeBoar(2, 30.5, 30.5 - 2, Math.PI);
gunBoar.hp = 1;
MW.state.px = 30.5;
MW.state.py = 5;
MW.state.pz = 30.5;
MW.state.yaw = 0;
MW.state.pitch = 0;
MW.state.equip.weapon = 'gun';
MW.state.inv.gun = 1;
if (!MW.tryShoot() || gunBoar.alive) fail('gun one shot');
MW.state.equip.weapon = '';
eq(MW.meleeDmg(), 1, 'fist still 1');

MW.setRole(null);
MW.setSelfForTest('solo');
if (gunBoar.alive) fail('gun boar revived before pack');
MW.applyNet({ mw: 3, t: 'mobs', from: 'host', pigs: [[gunBoar.x, gunBoar.y, gunBoar.z, MW.PIG_HP, 1]] });
if (gunBoar.alive) fail('solo kill undone by mob pack');
MW.setRole('host');
MW.applyNet({ mw: 3, t: 'mob', from: 'solo', k: 'pig', i: 2, hp: MW.PIG_HP });
if (gunBoar.alive) fail('own mob packet revived the boar');
MW.setRole(null);

function capClear(sp, x, y, z) {
  var ex = sp.x, ey = sp.y + 1.5, ez = sp.z;
  var tx = x + 0.5, ty = y + MW.COAL_CAP.lift + MW.COAL_CAP.h * 0.5, tz = z + 0.5;
  var dx = tx - ex, dy = ty - ey, dz = tz - ez;
  var len = Math.hypot(dx, dy, dz) || 1;
  var steps = Math.ceil(len / 0.2), s, px, py, pz, bx, by, bz, id;
  for (s = 1; s < steps; s++) {
    px = ex + dx * (s / steps);
    py = ey + dy * (s / steps);
    pz = ez + dz * (s / steps);
    bx = Math.floor(px); by = Math.floor(py); bz = Math.floor(pz);
    if (bx === x && bz === z && by >= y) return true;
    id = MW.at(bx, by, bz);
    if (id && id !== MW.AIR && id !== MW.LEAF && id !== MW.FLOWER && id !== MW.TORCH && id !== MW.BED) return false;
  }
  return true;
}
function countCoal(seed) {
  MW.grow(seed);
  var sp = MW.scan().spawn;
  var vx = MW.volcanoInfo();
  var surface = 0, dig = 0, total = 0, skirt = 0;
  var meadow = 0, meadowAhead = 0, meadowSeen = 0, span = 0;
  var lookX = Math.sin(MW.state.yaw), lookZ = -Math.cos(MW.state.yaw);
  var spots = [];
  var x, y, z, id, top, dist, burial, i, j, d;
  for (z = 0; z < MW.D; z++) {
    for (x = 0; x < MW.W; x++) {
      top = -1;
      for (y = MW.H - 1; y >= 0; y--) {
        id = MW.at(x, y, z);
        if (id && id !== MW.AIR && id !== MW.WATER && id !== MW.LEAF && id !== MW.FLOWER && id !== MW.TORCH && id !== MW.BED) {
          top = y;
          break;
        }
      }
      dist = Math.hypot(x + 0.5 - sp.x, z + 0.5 - sp.z);
      for (y = 0; y < MW.H; y++) {
        if (MW.at(x, y, z) !== MW.COAL_ORE) continue;
        total++;
        burial = top - y;
        if (burial === 0 && dist >= 8 && dist <= 22) surface++;
        if (burial >= 1 && burial <= 4 && dist <= 30) dig++;
        if (vx && Math.hypot(x - vx.cx, z - vx.cz) <= 7 && MW.at(x, y + 1, z) === MW.AIR) skirt++;
        if (burial === 0 && MW.at(x, y + 1, z) === MW.AIR && dist >= 2.5 && dist <= 7.5) {
          meadow++;
          var aheadDx = x + 0.5 - sp.x, aheadDz = z + 0.5 - sp.z;
          var aheadLen = Math.hypot(aheadDx, aheadDz) || 1;
          if (aheadDx / aheadLen * lookX + aheadDz / aheadLen * lookZ > 0.65) meadowAhead++;
          var drop = (sp.y + 1.5) - (y + MW.COAL_CAP.lift + MW.COAL_CAP.h * 0.5);
          var lookDown = Math.atan2(drop, Math.max(0.2, dist));
          if (lookDown > -0.4 && lookDown < 35 * Math.PI / 180 && capClear(sp, x, y, z)) meadowSeen++;
          spots.push({ x: x, y: y, z: z, dist: dist });
        }
      }
    }
  }
  for (i = 0; i < spots.length; i++) {
    for (j = i + 1; j < spots.length; j++) {
      d = Math.hypot(spots[i].x - spots[j].x, spots[i].z - spots[j].z);
      if (d > span) span = d;
    }
  }
  return { surface: surface, dig: dig, total: total, skirt: skirt, meadow: meadow, meadowAhead: meadowAhead, meadowSeen: meadowSeen, span: span, spots: spots, spawn: sp };
}
var coalSeeds = [1, 2, 4, 7, 42, 2026], coalI, coalR;
for (coalI = 0; coalI < coalSeeds.length; coalI++) {
  coalR = countCoal(coalSeeds[coalI]);
  if (coalR.surface < 4) fail('seed ' + coalSeeds[coalI] + ' surface coal near spawn ' + coalR.surface);
  if (coalR.dig < 12) fail('seed ' + coalSeeds[coalI] + ' shallow coal ' + coalR.dig);
  if (coalR.total < 40) fail('seed ' + coalSeeds[coalI] + ' coal total ' + coalR.total);
  if (coalR.total > 8000) fail('seed ' + coalSeeds[coalI] + ' coal flood ' + coalR.total);
  if (coalR.skirt < 8) fail('seed ' + coalSeeds[coalI] + ' volcano skirt coal ' + coalR.skirt);
  if (coalR.meadow < 4) fail('seed ' + coalSeeds[coalI] + ' meadow coal ' + coalR.meadow);
  if (coalR.meadow > 8) fail('seed ' + coalSeeds[coalI] + ' meadow coal flood ' + coalR.meadow);
  if (coalR.meadowAhead < 3) fail('seed ' + coalSeeds[coalI] + ' meadow coal not in front of the player ' + coalR.meadowAhead);
  if (coalR.meadowSeen < 3) fail('seed ' + coalSeeds[coalI] + ' meadow coal hidden from spawn eye ' + coalR.meadowSeen);
  MW.state.pitch = 0;
  var eyeHit = MW.ray(6.5, true);
  if (!eyeHit || eyeHit.id !== MW.COAL_ORE || !(eyeHit.dist < 5.5)) fail('seed ' + coalSeeds[coalI] + ' eye-level ray missed coal');
  if (coalR.span < 4) fail('seed ' + coalSeeds[coalI] + ' meadow coal clumped ' + coalR.span.toFixed(1));
}
MW.grow(1);
var mineSp = MW.scan().spawn;
var mineX = -1, mineY = 0, mineZ = 0, mx, my, mz, mineDist;
for (mz = 0; mz < MW.D && mineX < 0; mz++) {
  for (mx = 0; mx < MW.W && mineX < 0; mx++) {
    mineDist = Math.hypot(mx + 0.5 - mineSp.x, mz + 0.5 - mineSp.z);
    if (mineDist < 2.5 || mineDist > 7.5) continue;
    for (my = 0; my < MW.H; my++) {
      if (MW.at(mx, my, mz) === MW.COAL_ORE && MW.at(mx, my + 1, mz) === MW.AIR) {
        mineX = mx; mineY = my; mineZ = mz; break;
      }
    }
  }
}
if (mineX < 0) fail('no meadow coal block to mine');
MW.state.equip.tool = '';
MW.state.inv.coal = 0;
if (!(MW.breakTime(MW.COAL_ORE) > 0 && MW.breakTime(MW.COAL_ORE) <= MW.breakTime(MW.STONE))) fail('coal mine time ' + MW.breakTime(MW.COAL_ORE));
MW.breakBlock({ x: mineX, y: mineY, z: mineZ });
eq(MW.at(mineX, mineY, mineZ), MW.AIR, 'coal mined away');
eq(MW.state.inv.coal, 1, 'mining coal yields coal');

MW.grow(1);
MW.state.pitch = 0;
MW.state.inv.coal = 0;
var stepX = Math.sin(MW.state.yaw), stepZ = -Math.cos(MW.state.yaw);
MW.state.px += stepX * 1.4;
MW.state.pz += stepZ * 1.4;
if (!MW.feetClear(MW.state.px, MW.state.py, MW.state.pz)) fail('walk toward coal buried the player');
var walked = MW.ray(4.5, true);
if (!walked || walked.id !== MW.COAL_ORE) fail('a few steps forward lost the coal');
MW.breakBlock(walked);
eq(MW.state.inv.coal, 1, 'mining the block in front yields coal');

function stripNearCoal() {
  var sp = MW.scan().spawn;
  var list = [], x, y, z, dist;
  for (z = 0; z < MW.D; z++) {
    for (x = 0; x < MW.W; x++) {
      dist = Math.hypot(x + 0.5 - sp.x, z + 0.5 - sp.z);
      if (dist > 9) continue;
      for (y = 0; y < MW.H; y++) {
        if (MW.at(x, y, z) === MW.COAL_ORE) list.push(x + ',' + y + ',' + z + ',0');
      }
    }
  }
  return list;
}
MW.grow(1);
var home = MW.scan().spawn;
var wiped = {
  v: 3, tip: 'mw20', seed: 1,
  px: home.x, py: home.y, pz: home.z, yaw: 0, pitch: 0,
  inv: { wood: 3 },
  edits: stripNearCoal()
};
if (!wiped.edits.length) fail('nothing to strip');
MW.loadRaw(wiped);
eq(MW.state.inv.wood, 3, 'old save keeps wood');
if (Math.abs(MW.state.px - home.x) > 0.2 || Math.abs(MW.state.pz - home.z) > 0.2) fail('old save left spawn');
var homeYaw = MW.state.yaw;
MW.state.pitch = 0;
var repaired = MW.ray(6.5, true);
if (!repaired || repaired.id !== MW.COAL_ORE || !(repaired.dist < 5.5)) fail('old save did not put coal in front');
var farSpot = null, fx, fz, fy, fid;
for (fz = 0; fz < MW.D && !farSpot; fz++) {
  for (fx = 0; fx < MW.W && !farSpot; fx++) {
    if (Math.hypot(fx + 0.5 - home.x, fz + 0.5 - home.z) < 18) continue;
    for (fy = MW.H - 2; fy >= 2; fy--) {
      fid = MW.at(fx, fy, fz);
      if (!fid || fid === MW.WATER || fid === MW.LEAF || fid === MW.FLOWER || fid === MW.TORCH || fid === MW.BED) continue;
      if (MW.feetClear(fx + 0.5, fy + 1, fz + 0.5)) farSpot = { x: fx + 0.5, y: fy + 1, z: fz + 0.5 };
      break;
    }
  }
}
if (!farSpot) fail('need a far standing spot');
MW.loadRaw({
  v: 3, tip: 'mw20', seed: 1,
  px: farSpot.x, py: farSpot.y, pz: farSpot.z, yaw: 0.35, pitch: -0.15,
  inv: { wood: 2 },
  edits: wiped.edits
});
if (Math.abs(MW.state.yaw - 0.35) > 0.05) fail('far player was turned ' + MW.state.yaw);
if (Math.abs(MW.state.px - farSpot.x) > 0.2) fail('far player was moved home');
MW.state.px = home.x; MW.state.py = home.y; MW.state.pz = home.z; MW.state.pitch = 0;
MW.state.yaw = homeYaw;
var stillThere = MW.ray(6.5, true);
if (!stillThere || stillThere.id !== MW.COAL_ORE) fail('far save lost spawn coal');

MW.grow(3);
var saveSp = MW.scan().spawn;
var sx2, sy2, sz2, sdist;
for (sz2 = 0; sz2 < MW.D; sz2++) {
  for (sx2 = 0; sx2 < MW.W; sx2++) {
    sdist = Math.hypot(sx2 + 0.5 - saveSp.x, sz2 + 0.5 - saveSp.z);
    if (sdist > 8) continue;
    for (sy2 = 0; sy2 < MW.H; sy2++) if (MW.at(sx2, sy2, sz2) === MW.COAL_ORE) MW.put(sx2, sy2, sz2, MW.AIR);
  }
}
MW.save();
MW.loadRaw(JSON.parse(localStorage.getItem('xygo-my-world')));
MW.state.pitch = 0;
var roundTrip = MW.ray(6.5, true);
if (!roundTrip || roundTrip.id !== MW.COAL_ORE || !(roundTrip.dist < 5.5)) fail('save round trip lost the coal in front');

function countChests(seed) {
  MW.grow(seed);
  var sp = MW.scan().spawn;
  var n = 0, open = 0, near = 0, x, y, z;
  for (z = 0; z < MW.D; z++) {
    for (x = 0; x < MW.W; x++) {
      for (y = 0; y < MW.H; y++) {
        if (MW.at(x, y, z) !== MW.CHEST) continue;
        n++;
        if (MW.at(x, y + 1, z) === MW.AIR) open++;
        if (Math.hypot(x + 0.5 - sp.x, z + 0.5 - sp.z) < 40) near++;
      }
    }
  }
  return { n: n, open: open, near: near };
}
var chestSeeds = [1, 3, 6], chestI, chestR;
for (chestI = 0; chestI < chestSeeds.length; chestI++) {
  chestR = countChests(chestSeeds[chestI]);
  if (chestR.n < 8) fail('seed ' + chestSeeds[chestI] + ' chests ' + chestR.n);
  if (chestR.n > 160) fail('seed ' + chestSeeds[chestI] + ' chest flood ' + chestR.n);
  if (chestR.open < chestR.n - 2) fail('seed ' + chestSeeds[chestI] + ' buried chests ' + chestR.open + '/' + chestR.n);
  if (chestR.near < 3) fail('seed ' + chestSeeds[chestI] + ' chests near play ' + chestR.near);
}
if (js.indexOf('movementX * MOUSE_LOOK') < 0) fail('mouse path');
if (js.indexOf('0.0022') >= 0) fail('old mouse sens');
if (js.indexOf('(e.clientX - lx) * 0.005') < 0) fail('touch look changed');
if (js.indexOf('xygo-my-world-\' + TIP') < 0) fail('room channel pattern');
eq(MW.PIG_HP, 4, 'boar hp stays 4');
eq(MW.STORE, 'xygo-my-world', 'save key stays');

if (failed) {
  console.error(failed + ' failed');
  process.exit(1);
}
console.log('my-world mw22 ok');
