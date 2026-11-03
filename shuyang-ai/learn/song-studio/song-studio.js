/**
 * 小歌编辑器 mse1
 * 存档只写 localStorage xygo-my-songs。
 * 不请求网络，不含 Suno 或任何音乐 API。
 * 正式名：学员伍澍暘，助手小宇。
 */
(function (root) {
  'use strict';

  var STORE_KEY = 'xygo-my-songs';
  var STYLES = ['热血游戏', '轻松流行', '安静钢琴', '电子跳动'];
  var MOODS = ['开心', '热血', '安静', '搞笑'];
  var INSTRUMENTS = ['鼓', '贝斯嗡音', '钢琴', '合成铅'];
  var STYLE_EN = {
    '热血游戏': 'heroic original game music',
    '轻松流行': 'light original pop',
    '安静钢琴': 'quiet original piano',
    '电子跳动': 'bouncy original electronic'
  };
  var MOOD_EN = {
    '开心': 'happy',
    '热血': 'fired up',
    '安静': 'calm',
    '搞笑': 'playful and funny'
  };
  var INST_EN = {
    '鼓': 'drums and toms',
    '贝斯嗡音': 'soft bass',
    '钢琴': 'piano',
    '合成铅': 'synth lead'
  };
  var DEGREE_HZ = [440, 391.995, 329.628, 293.665, 261.626];
  var DEGREE_NAME = ['6 啦', '5 嗦', '3 咪', '2 来', '1 哆'];
  var DRUM_ROWS = [
    { key: 'kick', label: '底鼓' },
    { key: 'snare', label: '军鼓' },
    { key: 'hat', label: '踩镲' }
  ];

  function clampBpm(n) {
    n = Math.round(Number(n));
    if (!isFinite(n)) n = 110;
    if (n < 70) n = 70;
    if (n > 140) n = 140;
    return n;
  }

  function stepSeconds(bpm) {
    return (60 / clampBpm(bpm)) / 4;
  }

  function pattern(onSteps) {
    var row = [];
    var i;
    for (i = 0; i < 16; i++) row.push(onSteps.indexOf(i) >= 0 ? 1 : 0);
    return row;
  }

  function emptyDoc() {
    return {
      title: '我的小歌 1',
      style: '热血游戏',
      mood: '开心',
      bpm: 110,
      sections: { intro: true, verse: true, chorus: true },
      instrument: '钢琴',
      drums: {
        kick: pattern([0, 4, 8, 12]),
        snare: pattern([4, 12]),
        hat: pattern([0, 2, 4, 6, 8, 10, 12, 14])
      },
      melody: [4, null, 2, null, 1, null, 2, null, 0, null, 1, null, 2, null, 4, null],
      lyrics: ''
    };
  }

  function bits(arr, fallback) {
    var out = fallback.slice();
    var i;
    if (!Array.isArray(arr)) return out;
    for (i = 0; i < 16; i++) out[i] = arr[i] ? 1 : 0;
    return out;
  }

  function melodyBits(arr, fallback) {
    var out = fallback.slice();
    var i;
    var n;
    if (!Array.isArray(arr)) return out;
    for (i = 0; i < 16; i++) {
      if (arr[i] === null || arr[i] === undefined || arr[i] === '') out[i] = null;
      else {
        n = Number(arr[i]);
        out[i] = n >= 0 && n <= 4 ? n : null;
      }
    }
    return out;
  }

  function sanitize(raw) {
    var base = emptyDoc();
    var src = raw && typeof raw === 'object' ? raw : {};
    var drums = src.drums || {};
    base.title = String(src.title || base.title).trim().slice(0, 40) || '我的小歌 1';
    if (STYLES.indexOf(src.style) >= 0) base.style = src.style;
    if (MOODS.indexOf(src.mood) >= 0) base.mood = src.mood;
    if (INSTRUMENTS.indexOf(src.instrument) >= 0) base.instrument = src.instrument;
    base.bpm = clampBpm(src.bpm == null ? base.bpm : src.bpm);
    base.sections = {
      intro: !(src.sections && src.sections.intro === false),
      verse: true,
      chorus: true
    };
    base.drums = {
      kick: bits(drums.kick, base.drums.kick),
      snare: bits(drums.snare, base.drums.snare),
      hat: bits(drums.hat, base.drums.hat)
    };
    base.melody = melodyBits(src.melody, base.melody);
    base.lyrics = String(src.lyrics || '').slice(0, 400);
    return base;
  }

  function setSection(sections, key, on) {
    var next = {
      intro: !(sections && sections.intro === false),
      verse: true,
      chorus: true
    };
    if (key === 'intro') {
      next.intro = !!on;
      return { sections: next, refused: false };
    }
    if ((key === 'verse' || key === 'chorus') && !on) {
      return { sections: next, refused: true };
    }
    return { sections: next, refused: false };
  }

  function arrangement(doc) {
    var d = sanitize(doc);
    var plan = [];
    if (d.sections.intro) plan.push('intro');
    plan.push('verse', 'verse', 'chorus', 'chorus');
    return plan;
  }

  function playsMelody(section) {
    return section !== 'intro';
  }

  function voiceSpec(doc, section, row) {
    var hz;
    var inst;
    var spec;
    row = row | 0;
    if (row < 0) row = 0;
    if (row > 4) row = 4;
    hz = DEGREE_HZ[row];
    inst = doc.instrument;
    spec = {
      kind: 'tone',
      type: 'triangle',
      hz: hz,
      peak: 0.2,
      dur: 0.28,
      harm: 0,
      detune: 0,
      filter: 0,
      slide: 1
    };
    if (inst === '钢琴') {
      spec.type = 'triangle';
      spec.harm = 0.35;
      spec.dur = 0.34;
      spec.peak = 0.2;
      if (section === 'chorus') spec.hz = hz * 2;
    } else if (inst === '贝斯嗡音') {
      spec.type = 'sine';
      spec.hz = section === 'chorus' ? hz : hz / 2;
      spec.dur = 0.22;
      spec.peak = 0.4;
    } else if (inst === '合成铅') {
      spec.type = 'sawtooth';
      spec.peak = 0.1;
      spec.dur = 0.18;
      spec.filter = 1500;
      if (section === 'chorus') spec.hz = hz * 2;
    } else {
      spec.kind = 'tom';
      spec.type = 'sine';
      spec.hz = 210 - row * 22;
      spec.dur = 0.12;
      spec.peak = 0.45;
      if (section === 'chorus') spec.hz *= 1.12;
    }
    if (doc.style === '热血游戏') {
      spec.peak *= 1.12;
      spec.dur *= 0.92;
    } else if (doc.style === '轻松流行') {
      spec.peak *= 0.9;
      if (inst === '钢琴') spec.harm = Math.min(spec.harm, 0.18);
    } else if (doc.style === '安静钢琴') {
      spec.peak *= 0.7;
      spec.dur *= 1.2;
    } else if (doc.style === '电子跳动') {
      spec.dur *= 0.85;
      if (inst === '合成铅') {
        spec.filter = 2800;
        spec.slide = 0.9;
      }
    }
    if (doc.mood === '热血') {
      spec.peak *= 1.2;
      spec.dur *= 0.88;
    } else if (doc.mood === '安静') {
      spec.peak *= 0.62;
      spec.dur *= 1.35;
    } else if (doc.mood === '搞笑') {
      spec.dur *= 0.48;
      spec.detune = row % 2 === 0 ? 45 : -40;
    } else if (spec.kind === 'tone') {
      spec.harm += 0.08;
    }
    if (spec.peak > 0.55) spec.peak = 0.55;
    return spec;
  }

  function drumSpec(part, doc, section) {
    var spec;
    if (part === 'kick') spec = { peak: 0.55, dur: 0.2, bright: 180 };
    else if (part === 'snare') spec = { peak: 0.24, dur: 0.11, bright: 1800 };
    else spec = { peak: 0.07, dur: 0.05, bright: 5000 };
    if (doc.style === '热血游戏' && part === 'kick') spec.peak *= 1.25;
    else if (doc.style === '安静钢琴') spec.peak *= 0.55;
    else if (doc.style === '电子跳动' && part === 'hat') {
      spec.peak *= 2;
      spec.dur = 0.025;
      spec.bright = 7000;
    }
    if (doc.mood === '热血') spec.peak *= 1.2;
    else if (doc.mood === '安静') spec.peak *= 0.65;
    else if (doc.mood === '搞笑' && part === 'snare') {
      spec.peak *= 1.4;
      spec.dur = 0.05;
    }
    if (section === 'intro') spec.peak *= 0.72;
    if (section === 'chorus') spec.peak *= 1.12;
    if (spec.peak > 0.9) spec.peak = 0.9;
    return spec;
  }

  function sectionLabel(section) {
    if (section === 'intro') return '前奏';
    if (section === 'verse') return '主歌';
    if (section === 'chorus') return '副歌';
    return '';
  }

  function buildPrompt(doc) {
    var d = sanitize(doc);
    var zh = [];
    var en = [];
    var lyric = d.lyrics.trim();
    if (d.sections.intro) {
      zh.push('前奏');
      en.push('intro');
    }
    zh.push('主歌', '副歌');
    en.push('verse', 'chorus');
    if (!lyric) lyric = '一个原创主题，比如小忍者在竹林里冒险，去找会发光的石头。';
    return [
      '【给爸爸贴进 Suno 简单模式】',
      '13岁以下由爸爸代操作 Suno。孩子只在我们的编辑器里设计。',
      '这是原创主题，不要模仿、不要翻唱、不要抄任何已经出版或上架的歌曲。',
      '',
      '中文：',
      '请写一首给儿童的原创歌曲。',
      '歌名意向：' + d.title,
      '风格：' + d.style,
      '情绪：' + d.mood,
      '速度：' + d.bpm + ' BPM',
      '结构：' + zh.join('、'),
      '主音色：' + d.instrument,
      '主题句子：' + lyric,
      '要求：旋律好跟着哼，句子短，适合 9 岁。只做这首新歌。',
      '',
      'English:',
      'Write an original children\'s song. Do not copy, cover, or imitate any existing commercial track.',
      'Title idea: ' + d.title,
      'Style: ' + STYLE_EN[d.style],
      'Mood: ' + MOOD_EN[d.mood],
      'Tempo: ' + d.bpm + ' BPM',
      'Structure: ' + en.join(', '),
      'Lead voice: ' + INST_EN[d.instrument],
      'Theme lines: ' + lyric,
      'Keep it simple, singable, and short. Original theme only.'
    ].join('\n');
  }

  function blankStore() {
    return { version: 1, lastId: '', songs: [] };
  }

  function nextId(store) {
    var n = 1;
    var i;
    var m;
    for (i = 0; i < store.songs.length; i++) {
      m = /^song-(\d+)$/.exec(store.songs[i].id || '');
      if (m) n = Math.max(n, Number(m[1]) + 1);
    }
    return 'song-' + n;
  }

  function normalizeStore(raw) {
    var store = blankStore();
    var list;
    var i;
    var s;
    if (!raw || typeof raw !== 'object') return store;
    list = Array.isArray(raw.songs) ? raw.songs : [];
    for (i = 0; i < list.length; i++) {
      s = list[i];
      if (!s || typeof s.id !== 'string' || !s.id) continue;
      if (!s.doc || typeof s.doc !== 'object') continue;
      store.songs.push({
        id: s.id,
        title: String(s.title || s.doc.title || '我的小歌'),
        savedAt: String(s.savedAt || ''),
        doc: sanitize(s.doc)
      });
    }
    if (typeof raw.lastId === 'string') store.lastId = raw.lastId;
    store.version = 1;
    return store;
  }

  function writeSong(store, doc, id) {
    var now = new Date().toISOString();
    var found = -1;
    var i;
    var clean;
    store = normalizeStore(store);
    clean = sanitize(doc);
    if (id) {
      for (i = 0; i < store.songs.length; i++) {
        if (store.songs[i].id === id) found = i;
      }
    }
    if (found < 0) {
      id = id && found < 0 && !store.songs.some(function (s) { return s.id === id; })
        ? id
        : nextId(store);
      if (store.songs.some(function (s) { return s.id === id; })) id = nextId(store);
      store.songs.push({ id: id, title: clean.title, savedAt: now, doc: clean });
    } else {
      store.songs[found] = { id: id, title: clean.title, savedAt: now, doc: clean };
    }
    store.lastId = id;
    store.version = 1;
    return { store: store, id: id };
  }

  function deleteSong(store, id) {
    store = normalizeStore(store);
    store.songs = store.songs.filter(function (s) { return s.id !== id; });
    if (store.lastId === id) {
      store.lastId = store.songs.length ? store.songs[store.songs.length - 1].id : '';
    }
    store.version = 1;
    return store;
  }

  function songById(store, id) {
    var i;
    store = normalizeStore(store);
    for (i = 0; i < store.songs.length; i++) {
      if (store.songs[i].id === id) return store.songs[i];
    }
    return null;
  }

  var debug = { fired: 0, last: [] };

  function noteFired(info) {
    debug.fired += 1;
    debug.last.push(info);
    if (debug.last.length > 48) debug.last.shift();
  }

  function mount(docNode) {
    var doc = emptyDoc();
    var store = blankStore();
    var currentId = '';
    var ctx = null;
    var master = null;
    var noiseBuf = null;
    var playing = false;
    var timer = null;
    var token = 0;
    var nextTime = 0;
    var step = 0;
    var barIndex = 0;
    var plan = [];

    function $(id) { return docNode.getElementById(id); }

    function say(msg) {
      var el = $('status');
      if (el) el.textContent = msg;
    }

    function stamp() {
      var body = docNode.body;
      if (!body) return;
      body.setAttribute('data-mse', '1');
      body.setAttribute('data-song-bpm', String(doc.bpm));
      body.setAttribute('data-song-style', doc.style);
      body.setAttribute('data-song-mood', doc.mood);
      body.setAttribute('data-instrument', doc.instrument);
      body.setAttribute('data-current-id', currentId);
      body.setAttribute('data-playing', playing ? '1' : '0');
      body.setAttribute('data-intro', doc.sections.intro ? '1' : '0');
    }

    function loadStore() {
      try {
        return normalizeStore(JSON.parse(localStorage.getItem(STORE_KEY) || 'null'));
      } catch (e) {
        return blankStore();
      }
    }

    function persist(next) {
      store = next;
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(store));
        return true;
      } catch (e) {
        say('这台浏览器暂时存不下。');
        return false;
      }
    }

    function countOn() {
      var drums = 0;
      var notes = 0;
      var k;
      var i;
      for (k in doc.drums) {
        if (!Object.prototype.hasOwnProperty.call(doc.drums, k)) continue;
        for (i = 0; i < 16; i++) if (doc.drums[k][i]) drums += 1;
      }
      for (i = 0; i < 16; i++) if (doc.melody[i] !== null) notes += 1;
      var el = $('gridCount');
      if (el) el.textContent = '鼓点 ' + drums + ' 格 · 旋律 ' + notes + ' 个音';
    }

    function paintChips(group, value) {
      var host = $(group);
      if (!host) return;
      Array.prototype.forEach.call(host.querySelectorAll('button'), function (btn) {
        var on = btn.getAttribute('data-value') === value;
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    function paintSections() {
      ['intro', 'verse', 'chorus'].forEach(function (key) {
        var btn = docNode.querySelector('[data-section="' + key + '"]');
        if (!btn) return;
        var on = key === 'intro' ? !!doc.sections.intro : true;
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    function paintBpm() {
      var range = $('bpm');
      var num = $('bpmNum');
      if (range) range.value = String(doc.bpm);
      if (num) num.textContent = String(doc.bpm);
      Array.prototype.forEach.call(docNode.querySelectorAll('[data-bpm]'), function (btn) {
        btn.setAttribute('aria-pressed', Number(btn.getAttribute('data-bpm')) === doc.bpm ? 'true' : 'false');
      });
    }

    function renderDrums() {
      var host = $('drumGrid');
      var s;
      var r;
      var btn;
      var lab;
      var beat;
      if (!host) return;
      host.innerHTML = '';
      lab = docNode.createElement('div');
      lab.className = 'g-label';
      host.appendChild(lab);
      for (s = 0; s < 16; s++) {
        beat = docNode.createElement('div');
        beat.className = 'beat-no';
        beat.textContent = s % 4 === 0 ? String(s + 1) : '·';
        host.appendChild(beat);
      }
      DRUM_ROWS.forEach(function (row) {
        lab = docNode.createElement('div');
        lab.className = 'g-label';
        lab.textContent = row.label;
        host.appendChild(lab);
        for (s = 0; s < 16; s++) {
          btn = docNode.createElement('button');
          btn.type = 'button';
          btn.className = 'cell ' + row.key + (doc.drums[row.key][s] ? ' on' : '');
          btn.setAttribute('aria-pressed', doc.drums[row.key][s] ? 'true' : 'false');
          btn.setAttribute('aria-label', row.label + ' 第' + (s + 1) + '下');
          btn.setAttribute('data-drum', row.key);
          btn.setAttribute('data-step', String(s));
          host.appendChild(btn);
        }
      });
    }

    function renderMelody() {
      var host = $('melodyGrid');
      var s;
      var r;
      var btn;
      var lab;
      var beat;
      if (!host) return;
      host.innerHTML = '';
      lab = docNode.createElement('div');
      lab.className = 'g-label';
      host.appendChild(lab);
      for (s = 0; s < 16; s++) {
        beat = docNode.createElement('div');
        beat.className = 'beat-no';
        beat.textContent = s % 4 === 0 ? String(s + 1) : '·';
        host.appendChild(beat);
      }
      for (r = 0; r < 5; r++) {
        lab = docNode.createElement('div');
        lab.className = 'g-label';
        lab.textContent = DEGREE_NAME[r];
        host.appendChild(lab);
        for (s = 0; s < 16; s++) {
          btn = docNode.createElement('button');
          btn.type = 'button';
          btn.className = 'cell mel' + (doc.melody[s] === r ? ' on' : '');
          btn.setAttribute('aria-pressed', doc.melody[s] === r ? 'true' : 'false');
          btn.setAttribute('aria-label', DEGREE_NAME[r] + ' 第' + (s + 1) + '下');
          btn.setAttribute('data-degree', String(r));
          btn.setAttribute('data-step', String(s));
          host.appendChild(btn);
        }
      }
    }

    function renderRoster() {
      var host = $('roster');
      if (!host) return;
      host.innerHTML = '';
      if (!store.songs.length) {
        var empty = docNode.createElement('p');
        empty.className = 'empty';
        empty.textContent = '还没有保存的歌。';
        host.appendChild(empty);
        return;
      }
      store.songs.forEach(function (song) {
        var row = docNode.createElement('div');
        var name = docNode.createElement('span');
        var openBtn = docNode.createElement('button');
        var overBtn = docNode.createElement('button');
        var delBtn = docNode.createElement('button');
        row.className = 'song' + (song.id === currentId ? ' current' : '');
        name.className = 'song-name';
        name.textContent = song.title;
        openBtn.type = 'button';
        openBtn.textContent = '打开';
        openBtn.setAttribute('data-act', 'open');
        openBtn.setAttribute('data-id', song.id);
        overBtn.type = 'button';
        overBtn.textContent = '覆盖';
        overBtn.setAttribute('data-act', 'overwrite');
        overBtn.setAttribute('data-id', song.id);
        delBtn.type = 'button';
        delBtn.textContent = '删除';
        delBtn.setAttribute('data-act', 'delete');
        delBtn.setAttribute('data-id', song.id);
        row.appendChild(name);
        row.appendChild(openBtn);
        row.appendChild(overBtn);
        row.appendChild(delBtn);
        host.appendChild(row);
      });
    }

    function paintAll() {
      var title = $('title');
      var lyrics = $('lyrics');
      if (title && title.value !== doc.title) title.value = doc.title;
      if (lyrics && lyrics.value !== doc.lyrics) lyrics.value = doc.lyrics;
      paintChips('styleChips', doc.style);
      paintChips('moodChips', doc.mood);
      paintChips('instChips', doc.instrument);
      paintSections();
      paintBpm();
      renderDrums();
      renderMelody();
      renderRoster();
      countOn();
      stamp();
    }

    function paintPlayhead(index, section) {
      var hear = $('nowHear');
      Array.prototype.forEach.call(docNode.querySelectorAll('.cell.now'), function (el) {
        el.classList.remove('now');
      });
      if (index >= 0) {
        Array.prototype.forEach.call(docNode.querySelectorAll('[data-step="' + index + '"]'), function (el) {
          el.classList.add('now');
        });
      }
      if (hear) {
        hear.textContent = section ? '正在听：' + sectionLabel(section) : '停着';
      }
    }

    function ensureAudio() {
      var AC = root.AudioContext || root.webkitAudioContext;
      var data;
      var n;
      var i;
      if (!AC) {
        say('这台浏览器没有声音引擎。');
        return null;
      }
      if (!ctx) {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.75;
        master.connect(ctx.destination);
        n = Math.max(1, Math.floor(ctx.sampleRate));
        noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
        data = noiseBuf.getChannelData(0);
        for (i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended') {
        var resume = ctx.resume();
        if (resume && resume.catch) resume.catch(function () {});
      }
      return ctx;
    }

    function env(t, peak, attack, dur) {
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + attack + Math.max(0.02, dur));
      g.connect(master);
      return g;
    }

    function tone(t, hz, type, peak, dur, detune, filterHz, slide) {
      var osc = ctx.createOscillator();
      var g = env(t, peak, 0.012, dur);
      var end = t + dur + 0.04;
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(Math.max(40, hz), t);
      if (slide && slide !== 1) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, hz * slide), t + dur);
      }
      if (detune) osc.detune.setValueAtTime(detune, t);
      if (filterHz) {
        var filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterHz, t);
        osc.connect(filter);
        filter.connect(g);
      } else {
        osc.connect(g);
      }
      osc.start(t);
      osc.stop(end);
    }

    function noiseHit(t, peak, dur, hp) {
      var src;
      var filter;
      var g;
      if (!noiseBuf) return;
      src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(hp || 1500, t);
      g = env(t, peak, 0.004, dur);
      src.connect(filter);
      filter.connect(g);
      src.start(t);
      src.stop(t + Math.max(0.03, dur) + 0.02);
    }

    function playKick(t, spec) {
      var osc = ctx.createOscillator();
      var g = env(t, spec.peak, 0.004, spec.dur);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(48, t + spec.dur);
      osc.connect(g);
      osc.start(t);
      osc.stop(t + spec.dur + 0.05);
    }

    function playVoice(t, spec) {
      if (spec.kind === 'tom') {
        var osc = ctx.createOscillator();
        var g = env(t, spec.peak, 0.004, spec.dur);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(Math.max(60, spec.hz), t);
        osc.frequency.exponentialRampToValueAtTime(Math.max(45, spec.hz * 0.7), t + spec.dur);
        osc.connect(g);
        osc.start(t);
        osc.stop(t + spec.dur + 0.04);
        return;
      }
      tone(t, spec.hz, spec.type, spec.peak, spec.dur, spec.detune, spec.filter, spec.slide);
      if (spec.harm) {
        tone(t, spec.hz * 2, 'sine', spec.peak * spec.harm, spec.dur * 0.7, spec.detune, 0, 1);
      }
    }

    function fire(index, when, section) {
      var part;
      var row;
      var spec;
      if (!ctx) return;
      noteFired({ step: index, section: section, bpm: doc.bpm });
      DRUM_ROWS.forEach(function (rowDef) {
        if (!doc.drums[rowDef.key][index]) return;
        spec = drumSpec(rowDef.key, doc, section);
        if (rowDef.key === 'kick') playKick(when, spec);
        else if (rowDef.key === 'snare') {
          noiseHit(when, spec.peak, spec.dur, spec.bright);
          tone(when, doc.mood === '搞笑' ? 320 : 190, 'triangle', spec.peak * 0.45, spec.dur, 0, 0, 1);
        } else {
          noiseHit(when, spec.peak, spec.dur, spec.bright);
        }
      });
      if (!playsMelody(section)) return;
      row = doc.melody[index];
      if (row === null || row === undefined) return;
      spec = voiceSpec(doc, section, row);
      playVoice(when, spec);
      noteFired({ step: index, section: section, hz: Math.round(spec.hz), inst: doc.instrument, mood: doc.mood });
    }

    function tick() {
      var my = token;
      var horizon;
      var dur;
      var section;
      var guard = 0;
      if (!playing || !ctx) return;
      plan = arrangement(doc);
      if (!plan.length) return;
      if (barIndex >= plan.length) barIndex = 0;
      horizon = ctx.currentTime + 0.16;
      while (nextTime < horizon && guard < 8) {
        guard += 1;
        section = plan[barIndex] || 'verse';
        fire(step, nextTime, section);
        mark(step, nextTime, section, my);
        dur = stepSeconds(doc.bpm);
        nextTime += dur;
        step += 1;
        if (step >= 16) {
          step = 0;
          barIndex += 1;
          if (barIndex >= plan.length) barIndex = 0;
        }
      }
    }

    function mark(index, when, section, my) {
      var wait = Math.max(0, (when - ctx.currentTime) * 1000);
      root.setTimeout(function () {
        if (my !== token || !playing) return;
        paintPlayhead(index, section);
      }, wait);
    }

    function stopPlayback() {
      token += 1;
      playing = false;
      if (timer) root.clearInterval(timer);
      timer = null;
      paintPlayhead(-1, '');
      stamp();
    }

    function startPlayback() {
      if (!ensureAudio()) return;
      stopPlayback();
      playing = true;
      plan = arrangement(doc);
      barIndex = 0;
      step = 0;
      nextTime = ctx.currentTime + 0.05;
      token += 1;
      timer = root.setInterval(tick, 25);
      tick();
      say('在听 ' + doc.bpm + ' BPM · ' + doc.mood + ' · ' + doc.instrument);
      stamp();
    }

    function openSong(id) {
      var song = songById(store, id);
      if (!song) return;
      doc = sanitize(song.doc);
      currentId = song.id;
      store.lastId = song.id;
      persist(store);
      paintAll();
      say('打开了：' + song.title);
    }

    function saveCurrent(forceNew) {
      var id = forceNew ? '' : currentId;
      var written;
      written = writeSong(store, doc, id);
      if (!persist(written.store)) return;
      currentId = written.id;
      paintAll();
      say('已存：' + doc.title);
    }

    function overwrite(id) {
      var written = writeSong(store, doc, id);
      if (!persist(written.store)) return;
      currentId = written.id;
      paintAll();
      say('已覆盖：' + doc.title);
    }

    function removeSong(id) {
      var was = currentId === id;
      if (!persist(deleteSong(store, id))) return;
      if (was) currentId = '';
      renderRoster();
      stamp();
      say('已删除');
    }

    function bind() {
      $('title').addEventListener('input', function (e) {
        doc.title = String(e.target.value || '').slice(0, 40);
        stamp();
      });
      $('lyrics').addEventListener('input', function (e) {
        doc.lyrics = String(e.target.value || '').slice(0, 400);
      });
      $('styleChips').addEventListener('click', function (e) {
        var btn = e.target.closest('button');
        if (!btn) return;
        doc.style = btn.getAttribute('data-value');
        paintChips('styleChips', doc.style);
        stamp();
      });
      $('moodChips').addEventListener('click', function (e) {
        var btn = e.target.closest('button');
        if (!btn) return;
        doc.mood = btn.getAttribute('data-value');
        paintChips('moodChips', doc.mood);
        stamp();
      });
      $('instChips').addEventListener('click', function (e) {
        var btn = e.target.closest('button');
        if (!btn) return;
        doc.instrument = btn.getAttribute('data-value');
        paintChips('instChips', doc.instrument);
        stamp();
      });
      docNode.getElementById('sections').addEventListener('click', function (e) {
        var btn = e.target.closest('[data-section]');
        var key;
        var result;
        var hint;
        if (!btn) return;
        key = btn.getAttribute('data-section');
        result = setSection(doc.sections, key, key === 'intro' ? !doc.sections.intro : false);
        doc.sections = result.sections;
        hint = $('sectionHint');
        if (hint) {
          hint.hidden = !result.refused;
          hint.textContent = result.refused ? '主歌和副歌都要留下。前奏可以关。' : '';
        }
        paintSections();
        stamp();
      });
      $('bpm').addEventListener('input', function (e) {
        doc.bpm = clampBpm(e.target.value);
        paintBpm();
        stamp();
      });
      docNode.querySelector('.bpm-presets').addEventListener('click', function (e) {
        var btn = e.target.closest('[data-bpm]');
        if (!btn) return;
        doc.bpm = clampBpm(btn.getAttribute('data-bpm'));
        paintBpm();
        stamp();
      });
      $('drumGrid').addEventListener('click', function (e) {
        var btn = e.target.closest('[data-drum]');
        var key;
        var index;
        var on;
        if (!btn) return;
        key = btn.getAttribute('data-drum');
        index = Number(btn.getAttribute('data-step'));
        doc.drums[key][index] = doc.drums[key][index] ? 0 : 1;
        on = !!doc.drums[key][index];
        btn.classList.toggle('on', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        countOn();
      });
      $('melodyGrid').addEventListener('click', function (e) {
        var btn = e.target.closest('[data-degree]');
        var index;
        var degree;
        if (!btn) return;
        index = Number(btn.getAttribute('data-step'));
        degree = Number(btn.getAttribute('data-degree'));
        doc.melody[index] = doc.melody[index] === degree ? null : degree;
        renderMelody();
        countOn();
      });
      $('clearMelody').addEventListener('click', function () {
        var i;
        for (i = 0; i < 16; i++) doc.melody[i] = null;
        renderMelody();
        countOn();
        say('旋律已清空');
      });
      $('clearDrums').addEventListener('click', function () {
        var k;
        var i;
        for (k in doc.drums) {
          if (!Object.prototype.hasOwnProperty.call(doc.drums, k)) continue;
          for (i = 0; i < 16; i++) doc.drums[k][i] = 0;
        }
        renderDrums();
        countOn();
        say('鼓点已清空');
      });
      $('makePrompt').addEventListener('click', function () {
        var box = $('promptOut');
        box.value = buildPrompt(doc);
        say('提示词好了。13岁以下由爸爸代操作 Suno。');
      });
      $('copyPrompt').addEventListener('click', function () {
        var box = $('promptOut');
        var text = box.value || buildPrompt(doc);
        box.value = text;
        function selected() {
          box.focus();
          box.select();
          say('提示词已选中，爸爸可以长按复制');
        }
        if (root.navigator && root.navigator.clipboard && root.navigator.clipboard.writeText) {
          root.navigator.clipboard.writeText(text).then(function () {
            say('提示词已复制，交给爸爸');
          }, selected);
        } else selected();
      });
      $('play').addEventListener('click', startPlayback);
      $('stop').addEventListener('click', function () {
        stopPlayback();
        say('已停止');
      });
      $('save').addEventListener('click', function () { saveCurrent(false); });
      $('saveNew').addEventListener('click', function () { saveCurrent(true); });
      $('roster').addEventListener('click', function (e) {
        var btn = e.target.closest('button');
        var act;
        var id;
        if (!btn) return;
        act = btn.getAttribute('data-act');
        id = btn.getAttribute('data-id');
        if (act === 'open') openSong(id);
        else if (act === 'overwrite') overwrite(id);
        else if (act === 'delete') {
          if (btn.getAttribute('data-arm') === '1') removeSong(id);
          else {
            btn.setAttribute('data-arm', '1');
            btn.textContent = '确定删除';
            root.setTimeout(function () {
              if (btn.getAttribute('data-arm') === '1') {
                btn.removeAttribute('data-arm');
                btn.textContent = '删除';
              }
            }, 2500);
          }
        }
      });
    }

    store = loadStore();
    var last = songById(store, store.lastId);
    if (!last && store.songs.length) last = store.songs[store.songs.length - 1];
    if (last) {
      doc = sanitize(last.doc);
      currentId = last.id;
    }
    bind();
    paintAll();
    say(last ? '上次的歌还在：' + last.title : '点格子，再试听。往下还能写主题句子。');
  }

  var api = {
    STORE_KEY: STORE_KEY,
    STYLES: STYLES,
    MOODS: MOODS,
    INSTRUMENTS: INSTRUMENTS,
    emptyDoc: emptyDoc,
    sanitize: sanitize,
    clampBpm: clampBpm,
    stepSeconds: stepSeconds,
    setSection: setSection,
    arrangement: arrangement,
    playsMelody: playsMelody,
    voiceSpec: voiceSpec,
    drumSpec: drumSpec,
    buildPrompt: buildPrompt,
    blankStore: blankStore,
    normalizeStore: normalizeStore,
    writeSong: writeSong,
    deleteSong: deleteSong,
    songById: songById,
    debug: function () { return { fired: debug.fired, last: debug.last.slice() }; },
    resetDebug: function () { debug.fired = 0; debug.last = []; },
    mount: mount
  };

  root.SongStudio = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document !== 'undefined' && document.getElementById('songApp')) mount(document);
})(typeof window !== 'undefined' ? window : globalThis);
