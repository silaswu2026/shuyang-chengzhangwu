/**
 * node shuyang-ai/learn/song-studio/song-studio.test.js
 */
var studio = require('./song-studio.js');

function fail(msg) {
  console.error('FAIL ' + msg);
  process.exitCode = 1;
}

function assert(cond, msg) {
  if (!cond) fail(msg);
}

var doc = studio.emptyDoc();
assert(doc.title === '我的小歌 1', 'default title');
assert(doc.bpm === 110, 'default bpm');
assert(doc.sections.verse && doc.sections.chorus && doc.sections.intro, 'sections on');
assert(doc.melody.length === 16 && doc.drums.kick.length === 16, '16 steps');
assert(studio.STORE_KEY === 'xygo-my-songs', 'storage key');

assert(studio.stepSeconds(80) > studio.stepSeconds(110), '80 slower than 110');
assert(studio.stepSeconds(110) > studio.stepSeconds(140), '110 slower than 140');
assert(studio.stepSeconds(20) === studio.stepSeconds(70), 'bpm floor');
assert(studio.stepSeconds(400) === studio.stepSeconds(140), 'bpm ceil');

var piano = studio.voiceSpec(doc, 'verse', 0);
var pianoHi = studio.voiceSpec(doc, 'chorus', 0);
var bass = studio.voiceSpec(Object.assign({}, doc, { instrument: '贝斯嗡音' }), 'verse', 0);
var lead = studio.voiceSpec(Object.assign({}, doc, { instrument: '合成铅' }), 'verse', 0);
var tom = studio.voiceSpec(Object.assign({}, doc, { instrument: '鼓' }), 'verse', 0);
assert(piano.type === 'triangle' && piano.harm > 0, 'piano harm');
assert(pianoHi.hz > piano.hz, 'chorus higher');
assert(bass.hz < piano.hz, 'bass lower');
assert(lead.type === 'sawtooth', 'lead saw');
assert(tom.kind === 'tom', 'drum tom');

var calm = studio.voiceSpec(Object.assign({}, doc, { mood: '安静' }), 'verse', 0);
var hot = studio.voiceSpec(Object.assign({}, doc, { mood: '热血' }), 'verse', 0);
assert(calm.peak < piano.peak, 'calm quieter');
assert(hot.peak > piano.peak, 'hot louder');
var funny = studio.voiceSpec(Object.assign({}, doc, { mood: '搞笑' }), 'verse', 0);
assert(funny.dur < piano.dur && funny.detune !== 0, 'funny short detune');

var kickHot = studio.drumSpec('kick', Object.assign({}, doc, { mood: '热血' }), 'verse');
var kickCalm = studio.drumSpec('kick', Object.assign({}, doc, { style: '安静钢琴' }), 'verse');
assert(kickHot.peak > kickCalm.peak, 'kick mood');
var hatBounce = studio.drumSpec('hat', Object.assign({}, doc, { style: '电子跳动' }), 'verse');
var hatCalm = studio.drumSpec('hat', Object.assign({}, doc, { style: '安静钢琴' }), 'verse');
assert(hatBounce.peak > hatCalm.peak, 'hat style');
assert(!studio.playsMelody('intro') && studio.playsMelody('verse'), 'intro drums only');
assert(studio.arrangement(doc).length === 5, 'intro+verse+chorus');
assert(studio.arrangement(Object.assign({}, doc, { sections: { intro: false } })).length === 4, 'no intro');

var locked = studio.setSection(doc.sections, 'verse', false);
assert(locked.refused && locked.sections.verse && locked.sections.chorus, 'verse stays');
var introOff = studio.setSection(doc.sections, 'intro', false);
assert(!introOff.refused && introOff.sections.intro === false, 'intro toggles');

var prompt = studio.buildPrompt(Object.assign({}, doc, { lyrics: '小忍者穿过竹林' }));
assert(prompt.indexOf('13岁以下由爸爸代操作 Suno') >= 0, 'age line');
assert(prompt.indexOf('中文：') >= 0 && prompt.indexOf('English:') >= 0, 'both languages');
assert(prompt.indexOf('110 BPM') >= 0 && prompt.indexOf('热血游戏') >= 0, 'facts');
assert(prompt.indexOf('不要模仿') >= 0 && prompt.indexOf('Do not copy') >= 0, 'original');
assert(prompt.indexOf('小忍者穿过竹林') >= 0, 'lyrics');
assert(prompt.indexOf('heroic original game music') >= 0, 'style en');

var dirty = studio.sanitize({
  title: '  竹林  ',
  bpm: 999,
  style: '没有这种',
  sections: { intro: false, verse: false, chorus: false },
  melody: [9, 1],
  drums: { kick: [1, 0] }
});
assert(dirty.title === '竹林', 'title trim');
assert(dirty.bpm === 140, 'bpm clamp');
assert(dirty.style === '热血游戏', 'style fallback');
assert(dirty.sections.verse && dirty.sections.chorus && !dirty.sections.intro, 'section floor');
assert(dirty.melody[0] === null && dirty.melody[1] === 1 && dirty.melody.length === 16, 'melody');
assert(dirty.drums.kick[0] === 1 && dirty.drums.kick.length === 16, 'kick bits');

var saved = studio.writeSong(studio.blankStore(), doc, '');
assert(saved.store.version === 1, 'version');
assert(saved.id === 'song-1', 'first id');
assert(saved.store.songs.length === 1, 'one song');
assert(saved.store.songs[0].title === '我的小歌 1', 'song title');
assert(saved.store.songs[0].doc && saved.store.songs[0].savedAt, 'doc and time');
assert(saved.store.lastId === 'song-1', 'last id');

var second = studio.writeSong(saved.store, Object.assign({}, doc, { title: '竹林小歌', bpm: 80 }), '');
assert(second.id === 'song-2' && second.store.songs.length === 2, 'second song');
var over = studio.writeSong(second.store, Object.assign({}, doc, { title: '竹林小歌', bpm: 140 }), 'song-2');
assert(over.store.songs.length === 2, 'overwrite keeps count');
assert(studio.songById(over.store, 'song-2').doc.bpm === 140, 'overwrite bpm');
var gone = studio.deleteSong(over.store, 'song-2');
assert(!studio.songById(gone, 'song-2') && gone.songs.length === 1, 'delete');
assert(gone.lastId === 'song-1', 'last falls back');

var round = studio.normalizeStore(JSON.parse(JSON.stringify(saved.store)));
assert(round.songs[0].id === 'song-1' && round.version === 1, 'normalize');

if (process.exitCode) console.error('song-studio tests failed');
else console.log('song-studio tests ok');
