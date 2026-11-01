/**
 * 先听后选 · BGM / SFX for tonight workbench + custom-play.
 * Prefers cc.audioEngine; falls back to HTMLAudioElement.
 * Catalog ids must stay in sync with WBStore.blankAudio fallback.
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
    { id: 'hit', name: '击中', file: 'sfx/hit.wav' }
  ];

  var state = {
    bgmId: 'explore',
    sfx: {
      walk: true, jump: true, land: true, spike: true, fire: true,
      spring: true, coin: true, hurt: true, hit: true
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
        spring: true, coin: true, hurt: true, hit: true
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
    if (!preview && state.sfx[id] === false) return;
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

  root.WBAudio = {
    BGM: BGM,
    SFX: SFX,
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
    footstep: footstep
  };
})(typeof window !== 'undefined' ? window : this);
