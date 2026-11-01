/**
 * 先听后选 · BGM / SFX for tonight workbench + custom-play.
 * Prefers cc.audioEngine; falls back to HTMLAudioElement.
 * Catalog ids must stay in sync with WBStore.blankAudio fallback.
 * Slice4: levelAudio 1–9 bind + slash(=hit) character SFX.
 */
(function (root) {
  var BASE = 'audio/';
  var BGM = [
    { id: 'explore', name: '探险', file: 'bgm/explore.wav' },
    { id: 'tense', name: '紧张', file: 'bgm/tense.wav' },
    { id: 'win', name: '过关', file: 'bgm/win.wav' },
    { id: 'fail', name: '失败', file: 'bgm/fail.wav' }
  ];
  var SFX = [
    { id: 'walk', name: '走路', file: 'sfx/walk.wav' },
    { id: 'jump', name: '跳跃', file: 'sfx/jump.wav' },
    { id: 'land', name: '落地', file: 'sfx/land.wav' },
    { id: 'spike', name: '地刺', file: 'sfx/spike.wav' },
    { id: 'fire', name: '火焰', file: 'sfx/fire.wav' },
    { id: 'spring', name: '弹簧', file: 'sfx/spring.wav' },
    { id: 'coin', name: '金币', file: 'sfx/coin.wav' },
    { id: 'hurt', name: '受伤', file: 'sfx/hurt.wav' },
    { id: 'hit', name: '击中', file: 'sfx/hit.wav' },
    { id: 'slash', name: '砍击', file: 'sfx/hit.wav' } /* 角色近战砍击 = Kenney hit */
  ];

  var state = {
    bgmId: 'explore',
    sfx: {
      walk: true, jump: true, land: true, spike: true, fire: true,
      spring: true, coin: true, hurt: true, hit: true, slash: true
    }
  };
  var unlocked = false;
  var bgmEl = null;
  var bgmIdPlaying = null;
  var htmlCache = {};
  var footT = 0;

  function blankAudio() {
    return {
      bgmId: 'explore',
      sfx: {
        walk: true, jump: true, land: true, spike: true, fire: true,
        spring: true, coin: true, hurt: true, hit: true, slash: true
      }
    };
  }

  function normalize(raw) {
    var a = blankAudio();
    if (!raw || typeof raw !== 'object') return a;
    if (typeof raw.bgmId === 'string') a.bgmId = raw.bgmId;
    if (raw.sfx && typeof raw.sfx === 'object') {
      Object.keys(a.sfx).forEach(function (k) {
        if (typeof raw.sfx[k] === 'boolean') a.sfx[k] = raw.sfx[k];
      });
    }
    return a;
  }

  function apply(cfg) {
    state = normalize(cfg);
    return state;
  }

  function get() {
    return normalize(state);
  }

  function pathFor(rel) {
    return BASE + rel;
  }

  function findBgm(id) {
    var i;
    for (i = 0; i < BGM.length; i++) if (BGM[i].id === id) return BGM[i];
    return BGM[0];
  }

  function findSfx(id) {
    var i;
    for (i = 0; i < SFX.length; i++) if (SFX[i].id === id) return SFX[i];
    return null;
  }

  function engineOk() {
    return typeof cc !== 'undefined' && cc.audioEngine && typeof cc.audioEngine.playEffect === 'function';
  }

  function unlock() {
    unlocked = true;
    /* Touch a silent buffer so mobile browsers allow later play. */
    try {
      if (engineOk() && cc.audioEngine.playMusic) {
        /* no-op until real asset */
      }
    } catch (e) {}
  }

  function htmlPlay(rel, loop, vol) {
    var url = pathFor(rel);
    var a = htmlCache[url];
    if (!a) {
      a = new Audio(url);
      htmlCache[url] = a;
    }
    try {
      a.loop = !!loop;
      a.volume = vol == null ? 0.7 : vol;
      a.currentTime = 0;
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
    return a;
  }

  function stopBgm() {
    try {
      if (engineOk() && cc.audioEngine.stopMusic) cc.audioEngine.stopMusic();
    } catch (e) {}
    if (bgmEl) {
      try { bgmEl.pause(); } catch (e2) {}
      bgmEl = null;
    }
    bgmIdPlaying = null;
  }

  function playBgm(id, force) {
    var b = findBgm(id || state.bgmId);
    if (!force && bgmIdPlaying === b.id) return;
    stopBgm();
    state.bgmId = b.id;
    unlocked = true;
    if (engineOk() && cc.audioEngine.playMusic) {
      try {
        cc.audioEngine.playMusic(pathFor(b.file), true);
        bgmIdPlaying = b.id;
        return;
      } catch (e) {}
    }
    bgmEl = htmlPlay(b.file, true, 0.45);
    bgmIdPlaying = b.id;
  }

  function setBgm(id) {
    state.bgmId = id || 'explore';
    playBgm(state.bgmId, true);
  }

  function playSfx(id, preview) {
    var s = findSfx(id);
    if (!s) return;
    /* slash shares Kenney hit; honor either toggle off */
    if (!preview) {
      if (state.sfx[id] === false) return;
      if (id === 'slash' && state.sfx.hit === false) return;
      if (id === 'hit' && state.sfx.slash === false) return;
    }
    unlocked = true;
    if (engineOk() && cc.audioEngine.playEffect) {
      try {
        cc.audioEngine.playEffect(pathFor(s.file), false);
        return;
      } catch (e) {}
    }
    htmlPlay(s.file, false, 0.8);
  }

  function toggleSfx(id, on) {
    if (!(id in state.sfx)) return state;
    state.sfx[id] = !!on;
    return state;
  }

  function footstep(dt, moving, grounded) {
    if (!moving || !grounded) { footT = 0; return; }
    if (state.sfx.walk === false) return;
    footT += dt;
    if (footT >= 0.28) {
      footT = 0;
      playSfx('walk', false);
    }
  }


  var BGM_SHORT = { explore: '探', tense: '紧', win: '过', fail: '败' };

  function blankLevelAudio() { return {}; }

  function normalizeLevelAudio(raw) {
    var out = {};
    if (!raw || typeof raw !== 'object') return out;
    var i, k, e, id, j, known;
    for (i = 1; i <= 9; i++) {
      k = String(i);
      e = raw[k] != null ? raw[k] : raw[i];
      if (!e || typeof e !== 'object') continue;
      id = typeof e.bgmId === 'string' ? e.bgmId : '';
      if (!id) continue;
      known = false;
      for (j = 0; j < BGM.length; j++) if (BGM[j].id === id) { known = true; break; }
      if (!known) continue;
      out[k] = { bgmId: id, sfxPreset: e.sfxPreset == null ? null : e.sfxPreset };
    }
    return out;
  }

  function shortBgm(id) {
    return BGM_SHORT[id] || (id ? String(id).slice(0, 1) : '');
  }

  function bgmForLevel(levelId, audioCfg, levelAudioMap) {
    var k = String(levelId == null ? '' : levelId);
    var la = normalizeLevelAudio(levelAudioMap);
    if (k && la[k] && la[k].bgmId) return la[k].bgmId;
    if (audioCfg && typeof audioCfg.bgmId === 'string' && audioCfg.bgmId) return findBgm(audioCfg.bgmId).id;
    return 'explore';
  }

  function setLevelBgm(levelAudioMap, levelId, bgmId) {
    var map = normalizeLevelAudio(levelAudioMap);
    var k = String(levelId);
    if (!k || +k < 1 || +k > 9) return map;
    if (!bgmId) {
      delete map[k];
      return map;
    }
    var b = findBgm(bgmId);
    map[k] = { bgmId: b.id, sfxPreset: null };
    return map;
  }

  function clearAllLevelBgm() { return {}; }

  function bindTrackToLevels(levelAudioMap, bgmId, levelIds) {
    var map = normalizeLevelAudio(levelAudioMap);
    var b = findBgm(bgmId);
    (levelIds || []).forEach(function (n) {
      var k = String(n);
      if (+k < 1 || +k > 9) return;
      map[k] = { bgmId: b.id, sfxPreset: null };
    });
    return map;
  }

  function levelsForTrack(levelAudioMap, bgmId) {
    var map = normalizeLevelAudio(levelAudioMap);
    var out = [];
    var i, k;
    for (i = 1; i <= 9; i++) {
      k = String(i);
      if (map[k] && map[k].bgmId === bgmId) out.push(i);
    }
    return out;
  }

  var CREDITS = {
    short: 'Music: Kevin MacLeod (incompetech.com) · CC BY 3.0 · SFX: Kenney.nl · CC0',
    bgm: 'BGM: Kevin MacLeod (incompetech.com) · CC BY 3.0',
    sfx: 'SFX: Kenney.nl Impact / RPG Audio · CC0',
    lineZh: '音乐 Kevin MacLeod · CC BY 3.0｜音效 Kenney · CC0'
  };

  root.WBAudio = {
    BGM: BGM,
    SFX: SFX,
    CREDITS: CREDITS,
    blankAudio: blankAudio,
    normalize: normalize,
    apply: apply,
    get: get,
    unlock: unlock,
    playBgm: playBgm,
    stopBgm: stopBgm,
    setBgm: setBgm,
    playSfx: playSfx,
    toggleSfx: toggleSfx,
    footstep: footstep,
    blankLevelAudio: blankLevelAudio,
    normalizeLevelAudio: normalizeLevelAudio,
    shortBgm: shortBgm,
    bgmForLevel: bgmForLevel,
    setLevelBgm: setLevelBgm,
    clearAllLevelBgm: clearAllLevelBgm,
    bindTrackToLevels: bindTrackToLevels,
    levelsForTrack: levelsForTrack
  };
})(typeof window !== 'undefined' ? window : this);
