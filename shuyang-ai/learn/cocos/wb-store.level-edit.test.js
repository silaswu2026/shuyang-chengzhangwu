/**
 * 5-scene arc: longer runway, easy→hard, progress key stays off the Boss roster.
 * node shuyang-ai/learn/cocos/wb-store.level-edit.test.js
 */
var store = require('./wb-store.js').WBStore;
if (!store) throw new Error('WBStore missing');

function mem() {
  var bag = {};
  return {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(bag, k) ? bag[k] : null; },
    setItem: function (k, v) { bag[k] = String(v); },
    bag: bag
  };
}

function hazards(map) {
  var n = 0;
  var i;
  for (i = 0; i < map.length; i++) if (store.isStartHazard(map[i])) n++;
  return n;
}

function fail(msg) {
  console.error('FAIL ' + msg);
  process.exitCode = 1;
}

if (store.BACKDROPS.length !== 5) fail('backdrop count');
var b0 = store.backdropById('forest');
if (b0.file !== 'forest-day.jpg') fail('forest file');
var st = { backdrop: 'forest' };
var nxt = store.cycleBackdrop(st);
if (nxt.id !== 'moss' || st.backdrop !== 'moss') fail('cycle backdrop');
if (store.cycleBackdrop({ backdrop: 'thunder' }).id !== 'forest') fail('cycle wrap');
if (!store.BGM_POOL || store.BGM_POOL.length !== 9) fail('bgm pool');
if (!store.MONSTERS || store.MONSTERS.length !== 5) fail('monsters');

var n;
var prevH = -1;
var prevGoal = -1;
var kinds = {};
for (n = 1; n <= 5; n++) {
  var map = store.templateMap(n);
  if (map.length !== 24) fail('L' + n + ' cols ' + map.length);
  var i;
  for (i = 0; i < store.SAFE0; i++) {
    if (store.isStartHazard(map[i])) fail('L' + n + ' hazard in cell ' + i);
  }
  if (map[0] !== 'start') fail('L' + n + ' missing start');
  var goal = map.indexOf('goal');
  if (goal < 8) fail('L' + n + ' goal too close ' + goal);
  var h = hazards(map);
  if (n === 1 && h !== 1) fail('L1 hazard count ' + h);
  if (h < prevH) fail('L' + n + ' easier than previous');
  if (goal < prevGoal) fail('L' + n + ' goal moved backward');
  prevH = h;
  prevGoal = goal;
  var meta = store.templateMeta(n);
  if (meta.sfxShared !== true) fail('sfx not shared');
  if (!store.bgmById(meta.bgmId).fileId) fail('bgm file');
  if (!meta.monsters.length) fail('L' + n + ' monsters');
  meta.monsters.forEach(function (m) {
    kinds[m.id] = 1;
    if (m.size !== 'small' && m.size !== 'big') fail('size');
    if (m.x < store.SAFE0) fail('monster in front cells');
  });
  if ((n >= 4) !== meta.weaponUnlock) fail('weapon gate L' + n);
  if ((n === 5) !== meta.net) fail('net flag');
  var doc = store.templateDoc(n);
  if (doc.version !== '1.3') fail('version');
  if (!doc.editor || doc.editor.levelId !== n) fail('levelId');
  if (doc.editor.win !== 'goal') fail('win');
  if (doc.editor.sfxShared !== true) fail('sfx flag on doc');
  if (doc.audio.bgmId !== store.bgmById(meta.bgmId).fileId) fail('playable bgm');
  if (doc.myLevelId) fail('tagged my-1');
}
if (Object.keys(kinds).length !== 5) fail('not all 5 monster kinds used');
if (hazards(store.templateMap(5)) <= hazards(store.templateMap(1))) fail('L5 not harder');

var storage = mem();
storage.setItem('sycocos-level-progress', '{"tried":{"1":1},"completed":{}}');
var seeded = store.applyLevel(storage, 2);
if (!seeded.ok || !seeded.seeded) fail('apply seed');
var loaded = store.load(storage);
if (loaded.levelId !== 2 || loaded.monsters.length !== 2) fail('load preset monsters');
loaded.map[6] = 'fire';
if (!store.saveLevelEdit(storage, loaded, 2).ok) fail('save');
if (storage.bag['sycocos-level-progress'] !== '{"tried":{"1":1},"completed":{}}') fail('boss progress changed');
if (storage.bag['xygo-my-levels']) fail('roster written');
if (!store.markSceneProgress(storage, 2, 'tried').ok) fail('scene progress');
if (storage.bag['sycocos-level-progress'] !== '{"tried":{"1":1},"completed":{}}') fail('boss progress after scene mark');
var sceneRaw = JSON.parse(storage.bag['xygo-scene5-progress']);
if (!sceneRaw.tried['2']) fail('scene tried missing');

store.applyLevel(storage, 4);
var now = store.load(storage);
if (!now.weaponUnlock || now.character !== 'blue') fail('L4 preset');
if (store.weaponShopOpen(3)) fail('shop open too early');
if (!store.weaponShopOpen(4)) fail('shop closed at 4');
if (store.applyLevel(storage, 6).ok) fail('scene 6 should not exist');

var legacy = mem();
var oldMap = [];
for (var c = 0; c < 12; c++) oldMap.push(null);
oldMap[0] = 'start';
oldMap[4] = 'spike';
oldMap[11] = 'goal';
legacy.setItem('xygo-custom-level', JSON.stringify({
  version: '1.2', cols: 12, rows: 4,
  mine: { map: oldMap, mp: { spike: { interval: 3, up: 1, damage: 1 }, fire: { dur: 3, damage: 1 } } },
  tiles: []
}));
var old = store.load(legacy);
if (old.cols !== 12 || old.map[4] !== 'spike') fail('legacy 12');
store.ensureLongRunway(old, 24);
if (old.map.length !== 24 || old.map[4] !== 'spike') fail('pad');
old.tool = 'spike';
var blocked = store.place(old, 1);
if (blocked.ok) fail('front spike');
old.tool = 'coin';
if (!store.place(old, 1).ok) fail('front coin');
old.tool = 'fire';
var changed = store.place(old, 4);
if (!changed.ok || old.map[4] !== 'fire') fail('change kind');
var picked = store.place(old, 4);
if (!picked.selected || !old.moving) fail('select to move');
var moved = store.place(old, 8);
if (!moved.ok || old.map[8] !== 'fire' || old.map[4]) fail('move piece');
old.moving = true;
old.selX = 8;
old.map[8] = 'spike';
if (store.place(old, 0).ok) fail('move hazard into front');

if (process.exitCode) console.error('store tests failed');
else console.log('store scene5 tests ok');
