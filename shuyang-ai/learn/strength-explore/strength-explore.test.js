/**
 * node shuyang-ai/learn/strength-explore/strength-explore.test.js
 */
var fs = require('fs');
var path = require('path');
var SE = require('./strength-explore.js');

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

var DISCLAIMER = '成长屋自研兴趣/优势探索；参考 Project Spectrum（表现观察）与青少年优势探索思路；非哈佛官方、非 Gallup 官方、非 WISC、非能力诊断、不定终身职业。';
if (SE.DISCLAIMER !== DISCLAIMER) fail('disclaimer text');
if (SE.STORAGE_KEY !== 'xygo-strength-explore') fail('storage key');
if (SE.TIP !== 'se1') fail('tip ' + SE.TIP);
if (SE.DOMAINS.length !== 8) fail('8 domains');
if (SE.ITEMS.length !== 28) fail('28 items');
if (SE.HIGHLIGHT_MAX_DROP !== 2) fail('drop');

var order = ['space', 'hands', 'story', 'pattern', 'rhythm', 'friend', 'nature', 'quiet'];
eq(SE.DOMAINS.map(function (d) { return d.id; }), order, 'domain order');

var seenLine = {};
var leftN = {};
var rightN = {};
var pairs = {};
order.forEach(function (id) { leftN[id] = 0; rightN[id] = 0; });
SE.ITEMS.forEach(function (item, i) {
  if (item.left === item.right) fail('self pair ' + item.id);
  if (!item.leftText || !item.rightText) fail('missing text ' + item.id);
  if (item.leftText.length !== 11 || item.rightText.length !== 11) fail('length ' + item.id);
  [item.leftText, item.rightText].forEach(function (text) {
    if (seenLine[text]) fail('duplicate line ' + text);
    seenLine[text] = true;
    ['哈佛', 'Gallup', 'WISC', '智商', '潜能', '诊断', '天才', '官方', '推荐', '正确'].forEach(function (word) {
      if (text.indexOf(word) !== -1) fail('line has ' + word);
    });
  });
  var key = [item.left, item.right].slice().sort().join('|');
  if (pairs[key]) fail('duplicate pair ' + key);
  pairs[key] = true;
  leftN[item.left]++;
  rightN[item.right]++;
  if (item.id !== 'se-' + (i < 9 ? '0' : '') + (i + 1)) fail('id ' + item.id);
});
if (Object.keys(pairs).length !== 28) fail('pair count');
order.forEach(function (id) {
  var n = leftN[id] + rightN[id];
  if (n !== 7) fail(id + ' appearances ' + n);
  if (Math.abs(leftN[id] - rightN[id]) > 1) fail(id + ' side bias ' + leftN[id] + '/' + rightN[id]);
  if (SE.LINES[id].length !== 7) fail(id + ' lines');
});
SE.DOMAINS.forEach(function (d) {
  if (d.blurb.indexOf('你') !== 0) fail(d.id + ' blurb');
  if (!d.picture) fail(d.id + ' picture');
  if (!d.tonight) fail(d.id + ' tonight');
});

function prefer(rank) {
  return SE.ITEMS.map(function (item) {
    var li = rank.indexOf(item.left);
    var ri = rank.indexOf(item.right);
    return li < ri ? item.left : item.right;
  });
}

var spaceOnly = SE.resultView(prefer(['space', 'hands', 'story', 'pattern', 'rhythm', 'friend', 'nature', 'quiet']));
eq(spaceOnly.scores, {
  space: 7, hands: 6, story: 5, pattern: 4, rhythm: 3, friend: 2, nature: 1, quiet: 0
}, 'preference cascade');
eq(spaceOnly.highlight.ids, ['space', 'hands', 'story'], 'top three within two counts');
eq(SE.resultTitle(spaceOnly.highlight), '今晚更想试的三样', 'title three');
var total = 0;
order.forEach(function (id) { total += spaceOnly.scores[id]; });
if (total !== 28) fail('scores sum ' + total);

var leader = SE.resultView(SE.ITEMS.map(function (item) {
  return item.left === 'space' || item.right === 'space' ? 'space' : item.left;
}));
eq(leader.highlight, { ids: ['space'], kind: 'top' }, 'far leader stays alone');
eq(SE.resultTitle(leader.highlight), '今晚更想试的这一样', 'title one');

function hi(map) {
  return SE.highlightIds(SE.rankScores(map));
}
var four = hi({ space: 6, hands: 6, story: 6, pattern: 6, rhythm: 1, friend: 1, nature: 1, quiet: 1 });
if (four.kind !== 'close-tie' || four.ids.length !== 4) fail('four-way ' + JSON.stringify(four));
eq(hi({ space: 6, hands: 6, story: 3, pattern: 2, rhythm: 2, friend: 2, nature: 2, quiet: 2 }).ids, ['space', 'hands'], 'two clear');
eq(hi({ space: 6, hands: 6, story: 5, pattern: 5, rhythm: 5, friend: 1, nature: 1, quiet: 1 }).ids, ['space', 'hands'], 'do not split a fat third');
var fat = hi({ space: 6, hands: 5, story: 5, pattern: 5, rhythm: 5, friend: 1, nature: 1, quiet: 0 });
if (fat.kind !== 'close-tie' || fat.ids.length !== 5) fail('keep tied second with a single leader ' + JSON.stringify(fat));

if (SE.scoreAnswers([null]).complete) fail('short');
var partial = prefer(order);
partial[3] = null;
if (SE.scoreAnswers(partial).complete) fail('null incomplete');
partial[3] = 'nope';
if (SE.scoreAnswers(partial).complete) fail('illegal incomplete');

function mem() {
  var m = {};
  return {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null; },
    setItem: function (k, v) { m[k] = String(v); },
    keys: function () { return Object.keys(m); }
  };
}
var box = mem();
var empty = SE.loadStore(box);
if (empty.result || empty.draft) fail('empty store');
var payload = SE.emptyStore();
payload.result = { savedAt: '2026-11-04T12:00:00.000Z', answers: prefer(order) };
payload.draft = { index: 4, answers: partial.map(function (v, i) { return i === 3 ? null : v; }), updatedAt: '2026-11-04T12:01:00.000Z' };
payload.draft.answers[3] = null;
if (!SE.saveStore(payload, box)) fail('save');
eq(box.keys(), ['xygo-strength-explore'], 'only the explore key');
var loaded = SE.loadStore(box);
if (!loaded.result || loaded.result.answers[0] !== prefer(order)[0]) fail('reload result');
if (!loaded.draft || loaded.draft.index !== 4 || loaded.draft.answers[3] !== null) fail('draft');
box.setItem('xygo-strength-explore', '{');
if (SE.loadStore(box).result) fail('corrupt');
box.setItem('xygo-strength-explore', JSON.stringify(payload));
box.setItem('xygo-mi8-results', '{"keep":1}');
box.setItem('xygo-custom-level', '{"no":1}');
box.setItem('xygo-my-songs', '{"no":1}');
SE.saveStore(SE.emptyStore(), box);
if (box.getItem('xygo-mi8-results') !== '{"keep":1}') fail('touched mi8');
if (box.getItem('xygo-custom-level') !== '{"no":1}') fail('touched level');
if (box.getItem('xygo-my-songs') !== '{"no":1}') fail('touched songs');

var js = fs.readFileSync(path.join(__dirname, 'strength-explore.js'), 'utf8');
['xygo-mi8-results', 'xygo-custom-level', 'xygo-my-songs', 'xygo-level-edits'].forEach(function (key) {
  if (js.indexOf(key) !== -1) fail('js mentions ' + key);
});
if (js.indexOf("var TIP = 'se1'") === -1) fail('tip missing');
if (js.indexOf('今晚可以试试') === -1) fail('tonight badge');
var qFn = js.slice(js.indexOf('function questionHtml'), js.indexOf('function resultHtml'));
var sceneBtns = qFn.match(/class="scene"/g) || [];
if (sceneBtns.length !== 2) fail('two equal scene buttons ' + sceneBtns.length);
if (qFn.indexOf('推荐') !== -1 || qFn.indexOf('★') !== -1 || qFn.indexOf('更酷') !== -1) fail('choice leads');
var trackAt = qFn.indexOf('class="track"');
var trackEnd = qFn.indexOf('</div>', trackAt);
if (qFn.slice(trackAt, trackEnd).indexOf('<img') !== -1) fail('progress art');

var html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
if (html.indexOf(DISCLAIMER) === -1) fail('html disclaimer');
if (html.indexOf('strength-explore.css?v=se1') === -1 || html.indexOf('strength-explore.js?v=se1') === -1) fail('cache');
if (html.indexOf('content="se1"') === -1) fail('meta tip');
var css = fs.readFileSync(path.join(__dirname, 'strength-explore.css'), 'utf8');
if (/scene\[data-side/.test(css) || /\.scene:first/.test(css) || /\.scene:nth/.test(css)) fail('scene styled by side');
if (!/\.card \.card-art\s*\{[^}]*width:\s*96px/.test(css)) fail('card art size');
if (!/\.bar-art\s*\{[^}]*width:\s*36px/.test(css)) fail('bar art size');
if (!/\.scene img\s*\{[^}]*width:\s*120px/.test(css)) fail('scene img size');

var banned = ['opacity', 'filter=', '<filter', 'animate', '★', '⭐', '👍', '推荐', '很酷', '你是', '该选', '天才', '✓', '✗'];
SE.DOMAINS.forEach(function (d) {
  var svgPath = path.join(__dirname, 'assets', d.id + '.svg');
  if (!fs.existsSync(svgPath)) fail('missing ' + d.id + '.svg');
  var svg = fs.readFileSync(svgPath, 'utf8');
  if (svg.indexOf('viewBox="0 0 160 120"') === -1) fail(d.id + ' viewBox');
  if (svg.indexOf('fill="#1a2148"') === -1) fail(d.id + ' frame');
  var desc = (svg.match(/<desc>([^<]*)<\/desc>/) || [])[1];
  if (desc !== d.picture) fail(d.id + ' alt drift');
  banned.forEach(function (word) {
    if (svg.indexOf(word) !== -1) fail(d.id + ' has ' + word);
  });
});

['strength-explore.js', 'strength-explore.css', 'index.html', 'docs/STRENGTH-EXPLORE.md'].forEach(function (name) {
  var src = fs.readFileSync(path.join(__dirname, name), 'utf8');
  var stripped = src.split(DISCLAIMER).join('');
  ['哈佛', 'Gallup', 'WISC', '智商', '潜能', '诊断', '天才', '韦氏', '盖洛普', 'StrengthsExplorer', 'StrengthsFinder'].forEach(function (word) {
    if (stripped.indexOf(word) !== -1) fail(name + ' has ' + word);
  });
});

if (SE.DOMAINS[0].href !== '../cocos/visual-workbench.html?v=ldt38&step=2&scene=1') fail('level href');
if (SE.DOMAINS[4].href !== '../song-studio/?v=mse1') fail('song href');
if (SE.DOMAINS[4].alsoHref !== '../song-studio/songs/wo-de-xiao-ge/') fail('song page');
if (SE.DOMAINS[5].href !== '../cocos/level-select.html?v=ls7') fail('play href');
['hands', 'pattern'].forEach(function (id) {
  var d = null;
  SE.DOMAINS.forEach(function (row) { if (row.id === id) d = row; });
  if (d.href.indexOf('v=ldt38') === -1) fail(id + ' editor');
});
['nature', 'quiet'].forEach(function (id) {
  var d = null;
  SE.DOMAINS.forEach(function (row) { if (row.id === id) d = row; });
  if (d.href) fail(id + ' should stay off-screen');
});

[
  ['../mi8/mi8.js', 'strength-explore/?v=se1'],
  ['../song-studio/index.html', 'strength-explore/?v=se1'],
  ['../../index.html', 'learn/strength-explore/?v=se1'],
  ['../../../index.html', 'shuyang-ai/learn/strength-explore/?v=se1']
].forEach(function (pair) {
  var page = fs.readFileSync(path.join(__dirname, pair[0]), 'utf8');
  if (page.indexOf(pair[1]) === -1) fail(pair[0] + ' missing link');
});

if (failed) {
  console.error(failed + ' failed');
  process.exit(1);
}
console.log('strength-explore tests ok');
