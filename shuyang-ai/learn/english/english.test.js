/**
 * node shuyang-ai/learn/english/english.test.js
 */
var fs = require('fs');
var path = require('path');
var EN = require('./english.js');

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
function has(src, needle, msg) {
  if (src.indexOf(needle) === -1) fail(msg || ('missing ' + needle));
}

if (EN.TIP !== 'en2') fail('TIP en2, got ' + EN.TIP);
if (EN.STORAGE_KEY !== 'xygo-english-en1') fail('STORAGE_KEY must stay xygo-english-en1, got ' + EN.STORAGE_KEY);
if (EN.DISCLAIMER !== '这是成长屋家庭陪伴计划，不是芝麻街官方课程，也不是学习诊断。芝麻街教的是字母怎么读、怎么发音，不是学校那张国际音标表。') {
  fail('disclaimer text');
}

var CHILD = '伍澍暘';
var NICK = '芃芃';
var WRONG_NICK = '苃';
if (EN.CHILD !== CHILD) fail('CHILD constant');
if (EN.NICKNAME !== NICK) fail('NICKNAME constant');
if (EN.ASSISTANT !== '小宇') fail('ASSISTANT');
if (CHILD.charCodeAt(0) !== 0x4F0D || CHILD.charCodeAt(1) !== 0x6F8D || CHILD.charCodeAt(2) !== 0x6698) {
  fail('伍澍暘 code points');
}
if (NICK.charCodeAt(0) !== 0x8283 || NICK.charCodeAt(1) !== 0x8283) fail('芃芃 code points');

var localFiles = ['english.js', 'english.css', 'index.html', 'LEARN.md', 'english.test.js'];
localFiles.forEach(function (name) {
  var src = fs.readFileSync(path.join(__dirname, name), 'utf8');
  if (name !== 'english.test.js' && src.indexOf(WRONG_NICK) !== -1) fail(name + ' has typo nickname 苃');
  if (src.indexOf(CHILD) === -1 && name !== 'english.css') fail(name + ' missing 伍澍暘');
  if ((name === 'english.js' || name === 'LEARN.md') && src.indexOf(NICK) === -1) fail(name + ' missing 芃芃');
  if (name !== 'english.test.js' && src.indexOf('小雨') !== -1) fail(name + ' has look-alike assistant name');
  var idx = src.indexOf(CHILD);
  if (idx !== -1) {
    if (src.charCodeAt(idx) !== 0x4F0D || src.charCodeAt(idx + 1) !== 0x6F8D || src.charCodeAt(idx + 2) !== 0x6698) {
      fail(name + ' 伍澍暘 look-alike');
    }
  }
  var nidx = src.indexOf(NICK);
  if (nidx !== -1) {
    if (src.charCodeAt(nidx) !== 0x8283 || src.charCodeAt(nidx + 1) !== 0x8283) fail(name + ' 芃芃 look-alike');
  }
});

var html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
has(html, 'content="en2"', 'meta tip');
has(html, 'english.css?v=en2', 'css cache bust');
has(html, 'english.js?v=en2', 'js cache bust');
has(html, '../../../brand-tokens.css', 'brand tokens');
has(html, '../../../favicon.png', 'favicon');
has(html, EN.DISCLAIMER, 'html disclaimer');
if (html.indexOf('<noscript>') === -1 || html.split(EN.DISCLAIMER).length < 3) fail('noscript disclaimer');

var js = fs.readFileSync(path.join(__dirname, 'english.js'), 'utf8');
if (/'Anki'|"Anki"|'FSRS'|"SM-2"/.test(js)) fail('scheduler jargon in strings');
has(js, '我会了', 'child remember button');
has(js, '再练一遍', 'child retry button');
has(js, 'speechSynthesis', 'web speech');
has(js, 'en-US', 'GA speech lang');
has(js, '太好了', 'warm feedback after success');
has(js, '没关系', 'warm feedback after miss');

/* official gaps and no silent-e claim */
var gapBlob = (EN.OFFICIAL_GAPS || []).join(' ') + js + fs.readFileSync(path.join(__dirname, 'LEARN.md'), 'utf8');
if (!/no Magic e|不教 Magic e|没有教 Magic e|不是 Magic e|官方空白/.test(gapBlob)) fail('official-gap Magic e / silent e not documented');
if (/芝麻街[^。]{0,40}教[^。]{0,20}(Magic e|silent e|默音 e)/.test(gapBlob) && !/没有教|不教|不要声称|不是 Magic e|does not teach/.test(gapBlob)) {
  fail('claims Sesame teaches Magic e / silent e');
}
if (!/sh\/th|sh \/ th|没有官方芝麻街短片|\/ʃ\/, \/tʃ\/, \/θ\/, \/ð\//.test(gapBlob)) fail('official gap sh/th missing');
if (EN.OFFICIAL_GAPS.join(' ').indexOf('silent e') === -1) fail('OFFICIAL_GAPS silent e');
if (EN.NO_OFFICIAL_CLIP.indexOf('官方芝麻街号上暂时没有短片') === -1) fail('plain official-gap message');

/* week ramp */
eq(EN.week1RequiredIds(), ['m', 'n', 'b', 'p', 't', 'd'], 'week 1 required new sounds');
var week1 = {};
EN.WEEK_PLAN[0].newSounds.forEach(function (id) { week1[id] = true; });
EN.DEFERRED_SOUNDS.forEach(function (id) {
  if (week1[id]) fail(id + ' should not be a week-1 required new sound');
});
['z', 'ʒ', 'ŋ', 'ɔɪ'].forEach(function (id) {
  if (EN.DEFERRED_SOUNDS.indexOf(id) === -1) fail('deferred missing ' + id);
});
var byWeek = {};
EN.SOUNDS.forEach(function (s) {
  byWeek[s.week] = byWeek[s.week] || [];
  byWeek[s.week].push(s.id);
});
eq(byWeek[1], ['m', 'n', 'b', 'p', 't', 'd'], 'week 1 phonemes');
['s', 'k', 'g', 'h', 'i', 'u', 'ɑ'].forEach(function (id) {
  if (byWeek[2].indexOf(id) === -1) fail('week 2 missing ' + id);
});
['ɪ', 'æ', 'ɛ'].forEach(function (id) {
  if (byWeek[3].indexOf(id) === -1) fail('week 3 missing ' + id);
});
['ʌ', 'ʊ'].forEach(function (id) {
  if (byWeek[4].indexOf(id) === -1) fail('week 4 missing ' + id);
});
['f', 'v', 'ʃ', 'tʃ'].forEach(function (id) {
  if (byWeek[5].indexOf(id) === -1) fail('week 5 missing ' + id);
});
['dʒ', 'θ', 'ð'].forEach(function (id) {
  if (byWeek[6].indexOf(id) === -1) fail('week 6 missing ' + id);
});
['r', 'l', 'eɪ', 'aɪ'].forEach(function (id) {
  if (byWeek[7].indexOf(id) === -1) fail('week 7 missing ' + id);
});
['oʊ', 'aʊ'].forEach(function (id) {
  if (byWeek[8].indexOf(id) === -1) fail('week 8 missing ' + id);
});
if (!EN.WEEK_PLAN[2].twoSoundsE) fail('week 3 should use E two-sounds lesson');
if (!EN.soundById('ɛ').twoSoundsE) fail('ɛ carries two-sounds E');
if (EN.MEDIA.loveLetterE.bvid !== 'BV1iT411v7uX') fail('I Love the Letter E / 我爱字母E official BV');
if (EN.ALPHABEATS.O.ipa !== 'ɑ') fail('octopus GA /ɑ/');
if (EN.ALPHABEATS.A.word !== 'alligator' || EN.ALPHABEATS.U.word !== 'umbrella') fail('alphabeats map');

EN.WEEK_PLAN.forEach(function (w) {
  if (!w.hasReviewOnlyEvening) fail('week ' + w.week + ' should expect a review-only evening');
});

/* official Bilibili only; no YouTube in the child watch path */
if (EN.OFFICIAL_MID !== 1517070574) fail('official mid');
if (EN.OFFICIAL_NAME !== '芝麻街SesameStreet') fail('official name');
if (EN.OFFICIAL_BIO.indexOf('芝麻街唯一官方') === -1) fail('official bio');
if (EN.OFFICIAL_CATALOG_BVID !== 'BV1EG411D7u5') fail('weekly letter catalog BV');
if (EN.OFFICIAL_BVIDS.indexOf('BV1VW4y1R7VD') === -1) fail('M is for Marshmallow must be official');
if (EN.OFFICIAL_BVIDS.indexOf('BV1hv4y1b7dF') === -1) fail('A is for Apple must be official');

var UNOFFICIAL_BVIDS = [
  'BV1xx411c7CD',
  'BV1fakeFanUpload',
  'BV1BBCFanPhonetics'
];
var FORBIDDEN_YOUTUBE = /https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//;
var childFiles = ['english.js', 'english.css', 'index.html', 'LEARN.md'];
var urlRe = /https?:\/\/[^\s"'<>)\\]+/g;
var bvRe = /BV[0-9A-Za-z]{10,}/g;
var allowed = {};
EN.ALLOWED_URLS.forEach(function (u) { allowed[u] = true; });

childFiles.forEach(function (name) {
  var src = fs.readFileSync(path.join(__dirname, name), 'utf8');
  if (FORBIDDEN_YOUTUBE.test(src)) fail(name + ' has YouTube URL in course files');
  if (name === 'LEARN.md' && src.indexOf('BBC官方音标') === -1) fail('LEARN.md should warn against unofficial BBC官方音标');
  var urls = src.match(urlRe) || [];
  urls.forEach(function (u) {
    u = u.replace(/[.,;]+$/, '');
    if (/\+$/.test(u) || /bvid=$/.test(u) || /\/video\/$/.test(u)) return;
    if (/github\.io|nodejs\.org|example\.com|sesamestreet\.org|sesameworkshop\.org|sesamestreetchina\.com|qq\.com/.test(u)) return;
    if (FORBIDDEN_YOUTUBE.test(u)) fail(name + ' YouTube child-path/link ' + u);
    if (/bilibili\.com/.test(u) && !allowed[u] && name !== 'LEARN.md') fail(name + ' unlisted bili url ' + u);
  });
  var bvs = src.match(bvRe) || [];
  bvs.forEach(function (bv) {
    if (UNOFFICIAL_BVIDS.indexOf(bv) !== -1) fail(name + ' unofficial BV ' + bv);
    if (EN.OFFICIAL_BVIDS.indexOf(bv) === -1) fail(name + ' BV not in official catalog ' + bv);
  });
});

/* LEARN.md may mention catalog / space; those must be official */
has(fs.readFileSync(path.join(__dirname, 'LEARN.md'), 'utf8'), '1517070574', 'LEARN mid');
has(fs.readFileSync(path.join(__dirname, 'LEARN.md'), 'utf8'), 'BV1EG411D7u5', 'LEARN catalog');

EN.SOUNDS.forEach(function (s) {
  (s.sesame || []).forEach(function (clip) {
    if (clip.mid !== 1517070574) fail(s.id + ' sesame mid');
    if (!clip.official) fail(s.id + ' sesame not marked official');
    if (EN.OFFICIAL_BVIDS.indexOf(clip.bvid) === -1) fail(s.id + ' unofficial sesame BV');
    if (!clip.playerSrc || clip.playerSrc.indexOf('player.bilibili.com/player.html') === -1) fail(s.id + ' missing official player');
    if (clip.playerSrc.indexOf('autoplay=0') === -1) fail(s.id + ' player must not autoplay');
    if (/youtube|youtu\.be/.test(JSON.stringify(clip))) fail(s.id + ' youtube in sesame clip');
  });
  if ((s.bbc || []).length) fail(s.id + ' child path must not include BBC links');
});

['ʃ', 'θ', 'ð', 'tʃ', 'n', 'u', 'ɑ', 'ɪ', 'ʌ', 'ʊ', 'eɪ', 'aʊ'].forEach(function (id) {
  if (EN.soundById(id).sesame.length) fail(id + ' should have no official Bilibili sesame clip');
  if (!EN.soundById(id).sesameGap) fail(id + ' should explain official gap');
});
if (!EN.soundById('m').sesame.length) fail('/m/ should embed official M clip');
if (EN.soundById('m').sesame[0].bvid !== 'BV1VW4y1R7VD') fail('/m/ BV');
if (EN.soundById('g').sesame[0].bvid !== 'BV1Nh4y1W7dw') fail('/g/ official G clip');
if (EN.soundById('t').sesame[0].bvid !== 'BV1L14y167AN') fail('/t/ official T clip');

var watchM = EN.childWatchHtml(EN.soundById('m'));
has(watchM, '<iframe', 'child watch embeds iframe');
has(watchM, 'player.bilibili.com/player.html', 'official player host');
has(watchM, 'bvid=BV1VW4y1R7VD', 'M bvid in player src');
has(watchM, 'autoplay=0', 'no autoplay');
has(watchM, 'danmaku=0', 'danmaku off');
has(watchM, 'high_quality=1', 'high quality');
has(watchM, 'allow="fullscreen; encrypted-media; autoplay"', 'iframe allow');
has(watchM, '点一下就能看', 'tap-to-play hint');
if (/youtube|youtu\.be|target="_blank"/.test(watchM)) fail('child watch must stay in-page, no YouTube jump');

var watchGap = EN.childWatchHtml(EN.soundById('ʃ'));
has(watchGap, '官方芝麻街号上暂时没有短片', 'sh official gap in child path');
if (watchGap.indexOf('<iframe') !== -1) fail('sh must not embed a stand-in clip');

var embedBad = EN.embedHtml({ bvid: 'BV1xx411c7CD', mid: 123, title: 'fan' });
if (embedBad) fail('must not embed unofficial BV');

/* no downloaded copyrighted media files in the course folder */
fs.readdirSync(__dirname).forEach(function (name) {
  if (/\.(mp4|mp3|webm|m4a|ogg|wav|mov|mkv)$/i.test(name)) fail('downloaded media file in course folder: ' + name);
});

/* shorter sessions */
if (EN.EVENING_MINUTES < 8 || EN.EVENING_MINUTES > 12) fail('evening minutes should be about 8–12, got ' + EN.EVENING_MINUTES);
if (EN.MORNING_MINUTES < 5 || EN.MORNING_MINUTES > 8) fail('morning minutes should be about 5–8, got ' + EN.MORNING_MINUTES);
if (EN.SKIP_NEW_SOUND_REVIEW_MINUTES >= EN.EVENING_MINUTES) fail('skip threshold should be less than evening length');
if (EN.SKIP_NEW_SOUND_REVIEW_MINUTES !== 6) fail('skip threshold scales down to 6 minutes');

/* SRS intervals stay within 7 days */
var evening = new Date('2026-11-16T20:00:00+08:00');
var morning = new Date('2026-11-16T07:30:00+08:00');
if (EN.suggestMode(evening) !== 'evening') fail('suggest evening at 20:00 Shanghai');
if (EN.suggestMode(morning) !== 'morning') fail('suggest morning at 07:30 Shanghai');
if (EN.suggestMode(new Date('2026-11-16T04:59:00+08:00')) !== 'evening') fail('before 5 is evening suggestion');
if (EN.suggestMode(new Date('2026-11-16T11:59:00+08:00')) !== 'morning') fail('11:59 morning');
if (EN.suggestMode(new Date('2026-11-16T12:00:00+08:00')) !== 'evening') fail('12:00 evening');
if (EN.shanghaiYmd(evening) !== '2026-11-16') fail('shanghai ymd');

if (EN.MAX_INTERVAL_DAYS !== 7) fail('MAX_INTERVAL_DAYS');
if (EN.MAX_STAGE !== 4) fail('MAX_STAGE');
EN.SRS_INTERVALS.forEach(function (row) {
  if (row.days && row.days > 7) fail('interval exceeds 7 days: ' + row.id);
});
eq(EN.SRS_INTERVALS.map(function (r) { return r.stage + ':' + (r.days || r.id); }), [
  '1:next-morning', '2:2', '3:4', '4:7'
], 'SRS interval table within 7 days');

var due1 = EN.nextDueAt(1, evening);
if (EN.shanghaiYmd(due1) !== '2026-11-17') fail('stage 1 due next morning date ' + due1.toISOString());
if (EN.shanghaiHour(due1) !== 5) fail('stage 1 due 05:00 Shanghai');
var dueMorning = EN.nextDueAt(1, morning);
if (EN.shanghaiYmd(dueMorning) !== '2026-11-17') fail('morning success still next morning, not later today');

var due2 = EN.nextDueAt(2, evening);
if (Math.round((due2.getTime() - evening.getTime()) / 86400000) !== 2) fail('stage 2 is 2 days');
var due3 = EN.nextDueAt(3, evening);
if (Math.round((due3.getTime() - evening.getTime()) / 86400000) !== 4) fail('stage 3 is 4 days');
var due4 = EN.nextDueAt(4, evening);
if (Math.round((due4.getTime() - evening.getTime()) / 86400000) !== 7) fail('stage 4 is 7 days');
var dueOld = EN.nextDueAt(5, evening);
if (Math.round((dueOld.getTime() - evening.getTime()) / 86400000) !== 7) fail('legacy stage 5 must cap at 7 days');
[1, 2, 3, 4, 5, 99].forEach(function (st) {
  var d = EN.nextDueAt(st, evening);
  var days = (d.getTime() - evening.getTime()) / 86400000;
  if (days > 7 + 0.5) fail('nextDueAt stage ' + st + ' exceeds 7 days: ' + days);
  if (EN.intervalDaysForStage(st) > 7) fail('intervalDaysForStage ' + st);
});

var fresh = EN.makeItem('word', 'cat', 'æ', evening);
if (EN.shouldShowIpa(fresh)) fail('do not show IPA first');
var ok1 = EN.applyRecall(fresh, true, evening, 'evening');
if (!ok1.item.remembered || ok1.item.stage !== 1) fail('first success stage');
if (!EN.shouldShowIpa(ok1.item)) fail('show IPA after familiar');
if (EN.shanghaiYmd(new Date(ok1.item.dueAt)) !== '2026-11-17') fail('first success due next morning');

var climbed = ok1.item;
[2, 3, 4].forEach(function (want) {
  var r = EN.applyRecall(climbed, true, evening, 'evening');
  climbed = r.item;
  if (climbed.stage !== want) fail('climb to stage ' + want);
});
var stay = EN.applyRecall(climbed, true, evening, 'evening');
if (stay.item.stage !== 4) fail('cap stage at 4');
if (Math.round((new Date(stay.item.dueAt).getTime() - evening.getTime()) / 86400000) !== 7) fail('max interval 7 days after cap');

var miss1 = EN.applyRecall(fresh, false, evening, 'evening');
if (!miss1.requeue || miss1.item.retriesInSession !== 1) fail('first miss requeues in session');
var miss2 = EN.applyRecall(miss1.item, false, evening, 'evening');
if (!miss2.requeue) fail('second miss still requeues (1-2 retries)');
var miss3 = EN.applyRecall(miss2.item, false, evening, 'evening');
if (miss3.requeue) fail('after 2 retries do not hammer');
if (miss3.item.remembered) fail('failed item not remembered');
if (miss3.scheduled !== 'tomorrow') fail('evening miss schedules tomorrow');
var missM = EN.applyRecall(miss2.item, false, morning, 'morning');
if (missM.scheduled !== 'tonight') fail('morning miss schedules tonight');

/* loadStore clamps old 10/21-day dues into 7 days */
function mem() {
  var m = {};
  return {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null; },
    setItem: function (k, v) { m[k] = String(v); },
    keys: function () { return Object.keys(m); }
  };
}
var clampBox = mem();
var legacy = EN.emptyStore();
var far = EN.makeItem('word', 'see', 'i', evening);
far.remembered = true;
far.stage = 5;
far.lastSuccessAt = evening.toISOString();
far.dueAt = new Date('2026-12-07T20:00:00+08:00').toISOString();
legacy.items[far.id] = far;
EN.saveStore(legacy, clampBox);
var reloaded = EN.loadStore(clampBox);
var clamped = reloaded.items['word:see'];
if (clamped.stage > 4) fail('loadStore should cap stage');
var span = (Date.parse(clamped.dueAt) - evening.getTime()) / 86400000;
if (span > 7 + 0.01) fail('loadStore should clamp due dates to 7 days, got ' + span);

/* quiz selects due / unremembered only */
var store = EN.emptyStore();
var now = evening;
EN.introduceSound(store, 'm', now);
var later = EN.makeItem('word', 'see', 'i', now);
later.remembered = true;
later.stage = 3;
later.dueAt = new Date('2026-11-20T00:00:00+08:00').toISOString();
store.items[later.id] = later;
var dueItem = EN.makeItem('word', 'bed', 'ɛ', now);
dueItem.remembered = true;
dueItem.stage = 2;
dueItem.dueAt = new Date('2026-11-16T08:00:00+08:00').toISOString();
store.items[dueItem.id] = dueItem;
var quiz = EN.selectQuizItems(store, now);
var qids = quiz.map(function (it) { return it.id; }).sort();
if (qids.indexOf('word:see') !== -1) fail('quiz must not pull not-due remembered item');
if (qids.indexOf('word:bed') === -1) fail('quiz must include due item');
if (qids.indexOf('word:mom') === -1) fail('quiz must include not-yet-remembered item');
if (quiz.length === Object.keys(store.items).length) fail('quiz must not be the whole bank');

/* skip new sound when review load is heavy; threshold scales with shorter evening */
var heavy = EN.emptyStore();
for (var i = 0; i < 6; i++) {
  var it = EN.makeItem('word', 'w' + i, 'm', now);
  heavy.items[it.id] = it;
}
if (EN.estimateReviewMinutes(heavy, now) !== 12) fail('6 due items = 12 minutes');
if (!EN.shouldSkipNewSound(heavy, now)) fail('12 minutes should skip new sound');
var mid = EN.emptyStore();
for (var j = 0; j < 3; j++) {
  var midItem = EN.makeItem('word', 'm' + j, 'm', now);
  mid.items[midItem.id] = midItem;
}
if (EN.estimateReviewMinutes(mid, now) !== 6) fail('3 due items = 6 minutes');
if (!EN.shouldSkipNewSound(mid, now)) fail('6 minutes is most of the short evening, skip new sound');
var light = EN.emptyStore();
light.items['word:mom'] = EN.makeItem('word', 'mom', 'm', now);
if (EN.shouldSkipNewSound(light, now)) fail('light review should allow new sound');

var heavyPlan = EN.planSession('evening', heavy, now);
if (!heavyPlan.skipNewSound || heavyPlan.introduceSound) fail('heavy evening must skip new sound');
if (!heavyPlan.heavyReview) fail('heavy flag');
if (heavyPlan.skipReason.indexOf('12') === -1) fail('plain skip reason');
if (heavyPlan.mode !== 'evening' || heavyPlan.minutes !== 10) fail('evening shape minutes');
if (heavyPlan.steps.indexOf('listen') !== -1) fail('skipped evening should not start listen');
if (heavyPlan.allowNewSound) fail('heavy evening allowNewSound');
if (heavyPlan.steps.join() !== 'quiz') fail('short review-only evening steps');

var morningPlan = EN.planSession('morning', light, morning);
if (morningPlan.mode !== 'morning' || morningPlan.minutes !== 6) fail('morning shape minutes');
if (morningPlan.introduceSound) fail('morning must not introduce a new sound');
if (!morningPlan.skipNewSound || morningPlan.allowNewSound) fail('morning retrieval only');
if (morningPlan.steps.join() !== 'retrieval') fail('morning steps ' + morningPlan.steps.join());
if (morningPlan.skipReason.indexOf('不学新声音') === -1) fail('morning reason');

var firstEvening = EN.planSession('evening', EN.emptyStore(), evening);
if (!firstEvening.introduceSound || firstEvening.introduceSound.id !== 'm') fail('first evening starts at /m/');
eq(firstEvening.steps, ['listen', 'say', 'quiz'], 'short evening pedagogy');
if (firstEvening.minutes !== 10) fail('first evening minutes');

/* weekly review-only evening after the week's sounds */
var weekDone = EN.emptyStore();
EN.WEEK_PLAN[0].newSounds.forEach(function (id) { EN.introduceSound(weekDone, id, evening); });
weekDone.activeWeek = 1;
if (!EN.isWeeklyReviewEvening(weekDone, evening)) fail('expected weekly review-only evening');
var weeklyPlan = EN.planSession('evening', weekDone, evening);
if (weeklyPlan.introduceSound || !weeklyPlan.skipNewSound) fail('weekly review must skip new sound');
if (!weeklyPlan.weeklyReview) fail('weeklyReview flag should stay on even if review is also heavy');
EN.markReviewOnlyEvening(weekDone, evening);
if (EN.isWeeklyReviewEvening(weekDone, evening)) fail('weekly review already logged');
if (weekDone.activeWeek !== 2) fail('advance week after review-only evening');

/* storage key isolation */
var box = mem();
var empty = EN.loadStore(box);
if ((empty.introducedSounds || []).length) fail('empty store');
var payload = EN.emptyStore();
EN.introduceSound(payload, 'm', evening);
if (!EN.saveStore(payload, box)) fail('save');
eq(box.keys(), ['xygo-english-en1'], 'only the english key');
var loaded = EN.loadStore(box);
if (loaded.introducedSounds.indexOf('m') === -1) fail('reload introduced');
box.setItem('xygo-english-en1', '{');
var broken = EN.loadStore(box);
if ((broken.introducedSounds || []).length) fail('corrupt store should not throw');
box.setItem('xygo-my-world', '{"no":1}');
box.setItem('xygo-mi8-results', '{"no":1}');
EN.saveStore(EN.emptyStore(), box);
if (box.getItem('xygo-my-world') !== '{"no":1}') fail('save must not touch xygo-my-world');
if (box.getItem('xygo-mi8-results') !== '{"no":1}') fail('save must not touch other course keys');
if (js.indexOf("var STORAGE_KEY = 'xygo-english-en1'") === -1) fail('js storage key');
if (/localStorage\.(get|set)Item\(\s*'xygo-(?!english-en1)/.test(js)) fail('js touches other keys');

/* homepage: course 6 live en2, 1-5 unchanged, 7-16 soon */
var home = fs.readFileSync(path.join(__dirname, '../../../index.html'), 'utf8');
function tile(src, n) {
  var re = new RegExp('<a class="course[^"]*"[^>]*>\\s*<span class="n">' + n + '<\\/span>[\\s\\S]*?<\\/a>');
  var m = src.match(re);
  return m ? m[0] : '';
}
var t6 = tile(home, '6');
if (!t6) fail('missing course 6 tile');
if (t6.indexOf('class="course soon"') !== -1) fail('course 6 should not be soon');
if (/\bsoon\b/.test(t6)) fail('course 6 still soon');
if (t6.indexOf('href="shuyang-ai/learn/english/?v=en2"') === -1) fail('course 6 href');
if (t6.indexOf('课程占位 6') !== -1) fail('course 6 still placeholder title');
if (t6.indexOf('今晚主课') !== -1 || /<span class="tag">今天<\/span>/.test(t6)) fail('course 6 must not steal 今晚主课 / 今天');
if (t6.indexOf('英语学习') === -1) fail('course 6 title should stay 英语学习');
if (t6.indexOf('英语') === -1) fail('course 6 title/tag should mention 英语');

function hrefOf(block) {
  var m = block.match(/href="([^"]*)"/);
  return m ? m[1] : '';
}
eq(hrefOf(tile(home, '1')), 'shuyang-ai/learn/frame-anim.html', 'course 1 href');
eq(hrefOf(tile(home, '2')), 'shuyang-ai/learn/skeleton.html', 'course 2 href');
eq(hrefOf(tile(home, '3')), 'shuyang-ai/learn/cocos/visual-workbench.html?v=ldt38&step=2&scene=1', 'course 3 href');
var select = home.match(/<a class="course[^"]*"[^>]*>\s*<span class="n">🗺<\/span>[\s\S]*?<\/a>/);
if (!select) fail('missing 选关 tile');
eq(hrefOf(select[0]), 'shuyang-ai/learn/cocos/level-select.html?v=ls7', '选关 href');
if (select[0].indexOf('五关 · 先编辑再玩') === -1) fail('选关 title');
eq(hrefOf(tile(home, '4')), 'hard/', 'course 4 href');
if (tile(home, '4').indexOf('螺丝拆拆乐') === -1 || tile(home, '4').indexOf('预告') === -1) fail('螺丝拆拆乐 tag/title');
eq(hrefOf(tile(home, '5')), 'shuyang-ai/learn/song-studio/lesson.html?v=mse1', 'course 5 href');
if (tile(home, '5').indexOf('小歌编辑器') === -1 || tile(home, '5').indexOf('今天') === -1) fail('course 5 tag/title');
if (tile(home, '3').indexOf('今晚主课') === -1) fail('course 3 keeps 今晚主课');

for (var n = 7; n <= 16; n++) {
  var t = tile(home, String(n));
  if (!t) fail('missing placeholder ' + n);
  if (t.indexOf('class="course soon"') === -1) fail('course ' + n + ' should stay soon');
  if (hrefOf(t) !== '#') fail('course ' + n + ' href should stay #');
  if (t.indexOf('课程占位 ' + n) === -1) fail('course ' + n + ' title');
}

if (home.indexOf('今天 · 小歌编辑器') === -1) fail('hero hint must stay 今天 · 小歌编辑器');
if (home.indexOf('href="shuyang-ai/learn/english/?v=en2">英语学习</a>') === -1) fail('.links 英语学习');
['小歌课件', '小歌编辑器', '选关 · 五关', '兴趣小问', '今晚探索', '方块小世界', 'mi2', 'se1', 'mw22'].forEach(function (keep) {
  if (home.indexOf(keep) === -1) fail('homepage missing link/text ' + keep);
});
if (/螺丝拆拆乐与 6–16 仍是预告/.test(home)) fail('desc still says 6–16 are previews');
if (!/7–16 仍是预告/.test(home) && !/7-16 仍是预告/.test(home)) fail('desc should say 7–16 remain placeholders');
if (home.indexOf('英语') === -1) fail('desc or links should mention English is live');

if (failed) {
  console.error(failed + ' failed');
  process.exit(1);
}
console.log('english en2 ok');
