/**
 * node shuyang-ai/learn/mi8/mi8.test.js
 */
var fs = require('fs');
var path = require('path');
var MI8 = require('./mi8.js');

var failed = 0;
function fail(msg) {
  failed++;
  console.error('FAIL ' + msg);
}
function eq(actual, expected, msg) {
  var a = JSON.stringify(actual);
  var b = JSON.stringify(expected);
  if (a !== b) fail(msg + ' got ' + a + ' expected ' + b);
}

if (MI8.DISCLAIMER !== '成长屋兴趣参考 · 非哈佛官方测验 · 非能力诊断 · 测的是更喜欢哪边') {
  fail('disclaimer text');
}
if (MI8.STORAGE_KEY !== 'xygo-mi8-results') fail('storage key');
if (MI8.TIP !== 'mi2') fail('tip ' + MI8.TIP);
if (MI8.DOMAINS.length !== 8) fail('8 domains');
if (MI8.ITEMS.length !== 40) fail('40 items');

var seen = {};
MI8.DOMAINS.forEach(function (d) {
  if (d.items.length !== 5) fail(d.id + ' not 5');
  if (!d.pictures || d.pictures.length !== 5) fail(d.id + ' pictures');
  if (d.sceneItem < 1 || d.sceneItem > 5) fail(d.id + ' sceneItem');
  if (d.blurb.indexOf('你') !== 0) fail(d.id + ' blurb should speak to the child');
  if (!MI8.PLACES[d.place]) fail(d.id + ' missing place');
  d.items.forEach(function (text) {
    if (seen[text]) fail('duplicate item ' + text);
    seen[text] = true;
    ['哈佛', '潜能', '智商', '诊断', '官方'].forEach(function (word) {
      if (text.indexOf(word) !== -1) fail('item has ' + word + ': ' + text);
    });
  });
});

var order = ['linguistic', 'logical', 'spatial', 'bodily', 'musical', 'interpersonal', 'intrapersonal', 'naturalist'];
eq(MI8.DOMAINS.map(function (d) { return d.id; }), order, 'domain order');
var cursor = 0;
order.forEach(function (id) {
  for (var i = 0; i < 5; i++) {
    if (MI8.ITEMS[cursor].domainId !== id) fail('items not grouped at ' + cursor);
    cursor++;
  }
});

eq(MI8.SCALES.kid, ['很不像我', '有点不像', '有点像', '很像我'], 'kid scale');
eq(MI8.SCALES.parent, ['很不像他', '有点不像', '有点像', '很像他'], 'parent scale');

function fill(map) {
  var answers = [];
  MI8.DOMAINS.forEach(function (d) {
    var v = map[d.id];
    for (var i = 0; i < 5; i++) answers.push(v);
  });
  return answers;
}

var all4 = fill({ linguistic: 4, logical: 4, spatial: 4, bodily: 4, musical: 4, interpersonal: 4, intrapersonal: 4, naturalist: 4 });
var scored = MI8.scoreAnswers(all4);
if (!scored.complete) fail('all 4s incomplete');
MI8.DOMAINS.forEach(function (d) {
  if (scored.scores[d.id] !== 20) fail(d.id + ' should be 20');
});
var tie = MI8.highlightIds(MI8.rankScores(scored.scores));
if (tie.kind !== 'close-tie' || tie.ids.length !== 8) fail('eight-way tie ' + JSON.stringify(tie));

var all1 = fill({ linguistic: 1, logical: 1, spatial: 1, bodily: 1, musical: 1, interpersonal: 1, intrapersonal: 1, naturalist: 1 });
MI8.DOMAINS.forEach(function (d) {
  if (MI8.scoreAnswers(all1).scores[d.id] !== 5) fail(d.id + ' min');
});

function idsOf(map) {
  var view = MI8.resultView(fill(map));
  return { ids: view.highlight.ids, kind: view.highlight.kind, ranked: view.ranked.map(function (r) { return r.id + ':' + r.score; }) };
}

eq(idsOf({
  linguistic: 4, logical: 3, spatial: 2, bodily: 1, musical: 1, interpersonal: 1, intrapersonal: 1, naturalist: 1
}).ids, ['linguistic', 'logical'], 'drop stops before a far third');

eq(idsOf({
  linguistic: 4, logical: 4, spatial: 4, bodily: 1, musical: 1, interpersonal: 1, intrapersonal: 1, naturalist: 1
}).ids, ['linguistic', 'logical', 'spatial'], 'three-way first');

var four = idsOf({
  linguistic: 4, logical: 4, spatial: 4, bodily: 4, musical: 1, interpersonal: 1, intrapersonal: 1, naturalist: 1
});
if (four.kind !== 'close-tie' || four.ids.length !== 4) fail('four-way first ' + JSON.stringify(four));

eq(idsOf({
  linguistic: 4, logical: 3, spatial: 3, bodily: 1, musical: 1, interpersonal: 1, intrapersonal: 1, naturalist: 1
}).ids, ['linguistic', 'logical', 'spatial'], 'keep the tied second');

eq(idsOf({
  linguistic: 4, logical: 3, spatial: 2, bodily: 2, musical: 1, interpersonal: 1, intrapersonal: 1, naturalist: 1
}).ids, ['linguistic', 'logical'], 'do not split a third-place tie into the top 3');

var wide = idsOf({
  linguistic: 4, logical: 3, spatial: 3, bodily: 3, musical: 1, interpersonal: 1, intrapersonal: 1, naturalist: 1
});
if (wide.kind !== 'close-tie' || wide.ids.length !== 4) fail('do not split second-place tie ' + JSON.stringify(wide));

eq(MI8.warmth(20), '很想靠近', 'warmth 20');
eq(MI8.warmth(18), '很想靠近', 'warmth 18');
eq(MI8.warmth(17), '比较想', 'warmth 17');
eq(MI8.warmth(13), '比较想', 'warmth 13');
eq(MI8.warmth(12), '有一点', 'warmth 12');
eq(MI8.warmth(8), '有一点', 'warmth 8');
eq(MI8.warmth(7), '这周不太想', 'warmth 7');
eq(MI8.warmth(5), '这周不太想', 'warmth 5');

if (MI8.blurbFor(MI8.DOMAINS[0], 'parent').indexOf('伍澍暘') !== 0) fail('parent blurb name');
if (MI8.cardBadge(20, [{ id: 'a', score: 20 }, { id: 'b', score: 10 }]) !== '最想靠近') fail('badge unique');
if (MI8.cardBadge(20, [{ id: 'a', score: 20 }, { id: 'b', score: 20 }]) !== '一样想靠近') fail('badge tie');
if (MI8.cardBadge(16, [{ id: 'a', score: 20 }, { id: 'b', score: 16 }]) !== '也想靠近') fail('badge also');

var partial = all4.slice();
partial[3] = null;
if (MI8.scoreAnswers(partial).complete) fail('null is incomplete');
if (MI8.scoreAnswers([1, 2, 3]).complete) fail('short is incomplete');

function mem() {
  var m = {};
  return {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null; },
    setItem: function (k, v) { m[k] = String(v); },
    keys: function () { return Object.keys(m); }
  };
}
var box = mem();
var empty = MI8.loadStore(box);
if (empty.byMode.kid || empty.draft) fail('empty store');
var payload = MI8.emptyStore();
payload.byMode.kid = { mode: 'kid', savedAt: '2026-11-03T00:00:00.000Z', answers: all4 };
payload.byMode.parent = { mode: 'parent', savedAt: '2026-11-03T01:00:00.000Z', answers: all1 };
payload.latestMode = 'parent';
payload.draft = { mode: 'kid', index: 4, answers: partial, updatedAt: '2026-11-03T02:00:00.000Z' };
if (!MI8.saveStore(payload, box)) fail('save');
eq(box.keys(), ['xygo-mi8-results'], 'only the mi8 key');
var loaded = MI8.loadStore(box);
if (!loaded.byMode.kid || loaded.byMode.kid.answers[0] !== 4) fail('reload kid');
if (!loaded.byMode.parent || loaded.byMode.parent.mode !== 'parent') fail('reload parent');
if (loaded.latestMode !== 'parent') fail('latest mode');
if (!loaded.draft || loaded.draft.index !== 4 || loaded.draft.answers[3] !== null) fail('draft');
box.setItem('xygo-mi8-results', '{');
var broken = MI8.loadStore(box);
if (broken.byMode.kid || broken.draft) fail('corrupt store should not throw');
box.setItem('xygo-custom-level', '{"no":1}');
if (box.keys().indexOf('xygo-custom-level') === -1) fail('fixture');
MI8.saveStore(MI8.emptyStore(), box);
if (box.getItem('xygo-custom-level') !== '{"no":1}') fail('save must not touch other keys');

['mi8.js', 'mi8.css', 'index.html', 'docs/MI8-PLAN-2026-11-03.md', 'docs/MI8-LEARN-NOTES.md'].forEach(function (name) {
  var src = fs.readFileSync(path.join(__dirname, name), 'utf8');
  if (src.indexOf('潜能鉴定') !== -1) fail(name + ' says 潜能鉴定');
  var stripped = src.split('非哈佛官方测验').join('');
  if (stripped.indexOf('哈佛') !== -1) fail(name + ' says 哈佛 outside the disclaimer');
  if (stripped.indexOf('哈佛官方') !== -1) fail(name + ' official claim');
});
var js = fs.readFileSync(path.join(__dirname, 'mi8.js'), 'utf8');
if (js.indexOf('xygo-custom-level') !== -1) fail('quiz js mentions a game key');
if (js.indexOf("var TIP = 'mi2'") === -1) fail('tip mi2 missing in js');
if (js.indexOf('mi1') !== -1) fail('stale mi1 in js');
var html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
if (html.indexOf('mi8.css?v=mi2') === -1 || html.indexOf('mi8.js?v=mi2') === -1) fail('asset cache bust');
if (html.indexOf('content="mi2"') === -1) fail('meta tip');
if (html.indexOf('mi1') !== -1) fail('stale mi1 in html');
var css = fs.readFileSync(path.join(__dirname, 'mi8.css'), 'utf8');
if (css.indexOf('mi1') !== -1) fail('stale mi1 in css');
if (/choice\[data-value/.test(css)) fail('choice styled by value');
if (css.indexOf('.choice:nth') !== -1) fail('choice nth weight');
if (!/\.bars \.bar-art,\s*\.bar-row\.hot \.bar-art\s*\{[^}]*width:\s*36px/.test(css)) fail('bar art size lock');
if (!/\.card \.card-art,\s*\.card\.hot \.card-art\s*\{[^}]*width:\s*96px/.test(css)) fail('card art size lock');
var choiceAt = js.indexOf('class="choice"');
var choiceEnd = js.indexOf('</button>', choiceAt);
var choiceTpl = js.slice(choiceAt, choiceEnd);
if (choiceTpl.indexOf('<img') !== -1 || choiceTpl.indexOf('★') !== -1 || choiceTpl.indexOf('推荐') !== -1) {
  fail('choice template guides');
}
var qFn = js.slice(js.indexOf('function questionHtml'), js.indexOf('function resultHtml'));
var trackAt = qFn.indexOf('class="track"');
var trackEnd = qFn.indexOf('</div>', trackAt);
if (qFn.slice(trackAt, trackEnd).indexOf('<img') !== -1) fail('progress art');
['../../../index.html', '../../index.html'].forEach(function (rel) {
  var page = fs.readFileSync(path.join(__dirname, rel), 'utf8');
  if (page.indexOf('mi8/?v=mi2') === -1 && page.indexOf('learn/mi8/?v=mi2') === -1) fail(rel + ' entry tip');
  if (page.indexOf('mi8/?v=mi1') !== -1) fail(rel + ' stale entry');
});
var bannedArt = ['opacity', 'filter=', '<filter', 'animate', '★', '⭐', '👍', '推荐', '很酷', '你是', '该选', '天才', '✓', '✗'];
MI8.ITEMS.forEach(function (item) {
  if (!item.picture) fail(item.id + ' missing picture');
  var svgPath = path.join(__dirname, 'assets', item.id + '.svg');
  if (!fs.existsSync(svgPath)) fail('missing ' + item.id + '.svg');
  var svg = fs.readFileSync(svgPath, 'utf8');
  if (svg.indexOf('viewBox="0 0 160 120"') === -1) fail(item.id + ' viewBox');
  if (svg.indexOf('fill="#1a2148"') === -1) fail(item.id + ' frame');
  var desc = (svg.match(/<desc>([^<]*)<\/desc>/) || [])[1];
  if (desc !== item.picture) fail(item.id + ' alt drift');
  bannedArt.forEach(function (word) {
    if (svg.indexOf(word) !== -1) fail(item.id + ' has ' + word);
    if (item.picture.indexOf(word) !== -1) fail(item.id + ' caption has ' + word);
  });
});
['level-editor', 'song-studio', 'outdoor', 'teach', 'reflect'].forEach(function (id) {
  var scene = MI8.PLACES[id].scene;
  if (!scene || !fs.existsSync(path.join(__dirname, 'assets', scene + '.svg'))) fail(id + ' scene');
});
if (MI8.PLACES['song-studio'].href !== '../song-studio/?v=mse1') fail('song door ' + MI8.PLACES['song-studio'].href);
if (MI8.DOMAINS[4].tryText.indexOf('小歌编辑器') === -1) fail('music try text');
if (MI8.DOMAINS[4].tryText.indexOf('更多') !== -1) fail('music try still points at 更多');
if (MI8.PLACES['level-editor'].href.indexOf('level-select.html') === -1) fail('level door');

if (failed) {
  console.error(failed + ' failed');
  process.exit(1);
}
console.log('mi8 tests ok');
