/* 成长屋自研兴趣/优势探索。缓存 se1。
   二十八对活动场景，二选一，两边一样大。计的是更想试哪一件，不是能力。
   只写 localStorage 键 xygo-strength-explore，不碰关卡、小歌或兴趣小问的存档。 */
(function (root) {
  'use strict';

  var DISCLAIMER = '成长屋自研兴趣/优势探索；参考 Project Spectrum（表现观察）与青少年优势探索思路；非哈佛官方、非 Gallup 官方、非 WISC、非能力诊断、不定终身职业。';
  var STORAGE_KEY = 'xygo-strength-explore';
  var TIP = 'se1';
  var HIGHLIGHT_MAX_DROP = 2;
  var CHILD = '伍澍暘';
  var ASSISTANT = '小宇';
  var LEVEL_HREF = '../cocos/visual-workbench.html?v=ldt38&step=2&scene=1';
  var SONG_HREF = '../song-studio/?v=mse1';
  var SONG_PAGE = '../song-studio/songs/wo-de-xiao-ge/';
  var PLAY_HREF = '../cocos/level-select.html?v=ls7';

  var DOMAINS = [
    {
      id: 'space',
      name: '空间摆弄',
      blurb: '你今晚更想把路和房子摆到合适的地方。',
      tonight: '打开摆关，从第1关搭一条有高有低的路。',
      href: LEVEL_HREF,
      cta: '今晚去摆一关',
      picture: '一条有高有低的路，中间空着'
    },
    {
      id: 'hands',
      name: '身体动手',
      blurb: '你今晚更想站起来，用手亲自试一试。',
      tonight: '先用手比划三下，再去摆关里放上你比过的路。',
      href: LEVEL_HREF,
      cta: '今晚去摆一关',
      picture: '地上三条线，一个人跳起来'
    },
    {
      id: 'story',
      name: '讲故事',
      blurb: '你今晚更想把事情讲成有开头有结尾的故事。',
      tonight: '在小歌编辑器里写两句今晚的小故事。',
      href: SONG_HREF,
      cta: '今晚去写两句',
      picture: '一本翻开的书，气泡里有太阳'
    },
    {
      id: 'pattern',
      name: '找规律',
      blurb: '你今晚更想先找规律，再看下一步。',
      tonight: '摆关之前先数格子：少一格会怎样。',
      href: LEVEL_HREF,
      cta: '今晚去数格子',
      picture: '一排一样大的圆和方'
    },
    {
      id: 'rhythm',
      name: '听节奏',
      blurb: '你今晚更想打拍子，哼出一小段。',
      tonight: '自己先哼四拍，再进小歌编辑器把拍子摆进去。',
      href: SONG_HREF,
      cta: '今晚去小歌编辑器',
      alsoHref: SONG_PAGE,
      alsoCta: '听《我的小歌》',
      picture: '两个音符，下面四个一样大的点'
    },
    {
      id: 'friend',
      name: '和朋友一起',
      blurb: '你今晚更想叫上一个人一起做。',
      tonight: '把选关打开，请一个人试玩你摆的一关。',
      href: PLAY_HREF,
      cta: '今晚请人试玩',
      picture: '两个人一样大，中间一块积木'
    },
    {
      id: 'nature',
      name: '看自然',
      blurb: '你今晚更想看叶子、云、虫或石头。',
      tonight: '到窗边或门口找三样：叶子、云、虫或石头，比一比哪里不同。',
      href: '',
      cta: '',
      picture: '云、叶子和石头分开放着'
    },
    {
      id: 'quiet',
      name: '安静想一想',
      blurb: '你今晚更想先安静一会儿，再开始。',
      tonight: '做完一件小事，安静说三句：最开心的、哪里顺、哪里别扭。',
      href: '',
      cta: '',
      picture: '一个人坐着，气泡里三格一样大'
    }
  ];

  var LINES = {
    space: [
      '用积木搭出一座带桥小岛',
      '纸上画一条能跳过去的路',
      '把积木转个方向再卡进去',
      '摆一条有高有低的小跑道',
      '看地图找出从这里到那里',
      '拼一块画面补上空的地方',
      '搭一个有门又有窗的房子'
    ],
    hands: [
      '站起来跳过地上的三条线',
      '用手把纸折成一只小纸船',
      '跑一小圈再跑回来接着做',
      '把积木亲手叠高再轻轻放',
      '跟着一个动作用身体试做',
      '用手指把珠子穿成一小串',
      '蹲下去捡三块石头再排开'
    ],
    story: [
      '把今天的事讲成一个故事',
      '给角色起名字再说他去哪',
      '听一半故事接着编后来呢',
      '给关卡起名字写一句提示',
      '用三句话讲一件好笑的事',
      '把积木小人编成一段冒险',
      '讲一件有开头有结尾的事'
    ],
    pattern: [
      '看一排图形找哪里在重复',
      '先数格子再决定往哪边跳',
      '把这些东西分成圆的方的',
      '想一想这样走下一步怎样',
      '找出哪一张和前面的不同',
      '按从少到多把珠子排成排',
      '发现少了一格就补上那块'
    ],
    rhythm: [
      '用手指在桌上打出四下拍',
      '哼一小段再让它变得快些',
      '听一段声音分辨快还是慢',
      '给一条路配上轻轻的拍子',
      '自己做出只有四拍的小曲',
      '跟着曲子点头再换成慢拍',
      '把喜欢的调子轻轻哼出来'
    ],
    friend: [
      '一个人摆关另一个人来试',
      '先问旁边的人想从哪开始',
      '把刚学会的一步教给别人',
      '两个人轮流加一块再看看',
      '请一个人试玩你做的东西',
      '大家还没动时先招呼一声',
      '做完问一问对方开不开心'
    ],
    nature: [
      '到窗边看云再比一比形状',
      '捡起两片叶子找哪里不同',
      '看一只小虫怎么爬过石子',
      '注意今天的风是大还是小',
      '去找叶子、云和一块石头',
      '看看窗台植物过会儿变没',
      '蹲下来看地上的草还有泥'
    ],
    quiet: [
      '一个人安静搭一会儿积木',
      '先问自己现在最想做哪件',
      '做完后想哪里顺哪里别扭',
      '坐下歇一歇再说最开心的',
      '先不说话在纸上画下心情',
      '自己先想好再决定开始做',
      '在心里把开心和别扭分开'
    ]
  };

  function domainIds() {
    return DOMAINS.map(function (d) { return d.id; });
  }

  function pairSchedule(ids) {
    var arr = ids.slice();
    var n = arr.length;
    var pairs = [];
    for (var r = 0; r < n - 1; r++) {
      for (var i = 0; i < n / 2; i++) pairs.push([arr[i], arr[n - 1 - i]]);
      var rest = arr.slice(1);
      rest.unshift(rest.pop());
      arr = [arr[0]].concat(rest);
    }
    return pairs;
  }

  function balanceSides(pairs, ids) {
    var items = pairs.map(function (p) { return { left: p[0], right: p[1] }; });
    var seen = {};
    var guard = 0;
    while (guard++ < 80) {
      var sig = items.map(function (it) { return it.left + '>' + it.right; }).join('|');
      if (seen[sig]) break;
      seen[sig] = true;
      var leftN = {};
      var rightN = {};
      ids.forEach(function (id) { leftN[id] = 0; rightN[id] = 0; });
      items.forEach(function (it) { leftN[it.left]++; rightN[it.right]++; });
      var worst = null;
      ids.forEach(function (id) {
        var diff = leftN[id] - rightN[id];
        if (Math.abs(diff) <= 1) return;
        if (!worst || Math.abs(diff) > Math.abs(worst.diff)) worst = { id: id, diff: diff };
      });
      if (!worst) break;
      var best = -1;
      var bestScore = -999;
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var score = null;
        if (worst.diff > 0 && it.left === worst.id) score = -(leftN[it.right] - rightN[it.right]);
        if (worst.diff < 0 && it.right === worst.id) score = leftN[it.left] - rightN[it.left];
        if (score == null) continue;
        if (score > bestScore) { bestScore = score; best = i; }
      }
      if (best < 0) break;
      var swap = items[best];
      var tmp = swap.left;
      swap.left = swap.right;
      swap.right = tmp;
    }
    return items;
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function buildItems() {
    var ids = domainIds();
    var items = balanceSides(pairSchedule(ids), ids);
    var seen = {};
    ids.forEach(function (id) { seen[id] = 0; });
    items.forEach(function (it, n) {
      it.id = 'se-' + pad2(n + 1);
      it.leftText = LINES[it.left][seen[it.left]++];
      it.rightText = LINES[it.right][seen[it.right]++];
    });
    return items;
  }

  var ITEMS = buildItems();

  function domainById(id) {
    for (var i = 0; i < DOMAINS.length; i++) if (DOMAINS[i].id === id) return DOMAINS[i];
    return null;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function choiceOk(item, value) {
    return !!item && (value === item.left || value === item.right);
  }

  function scoreAnswers(answers) {
    var scores = {};
    DOMAINS.forEach(function (d) { scores[d.id] = 0; });
    if (!answers || answers.length !== ITEMS.length) return { complete: false, scores: scores };
    for (var i = 0; i < ITEMS.length; i++) {
      if (!choiceOk(ITEMS[i], answers[i])) return { complete: false, scores: emptyScores() };
    }
    for (var j = 0; j < ITEMS.length; j++) scores[answers[j]] += 1;
    return { complete: true, scores: scores };
  }

  function emptyScores() {
    var scores = {};
    DOMAINS.forEach(function (d) { scores[d.id] = 0; });
    return scores;
  }

  function rankScores(scores) {
    return DOMAINS.map(function (d, i) {
      return { id: d.id, score: scores[d.id] || 0, order: i };
    }).sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.order - b.order;
    });
  }

  function groupScores(ranked) {
    var groups = [];
    ranked.forEach(function (row) {
      var last = groups[groups.length - 1];
      if (!last || last.score !== row.score) groups.push({ score: row.score, ids: [row.id] });
      else last.ids.push(row.id);
    });
    return groups;
  }

  function highlightIds(ranked) {
    var groups = groupScores(ranked);
    if (!groups.length) return { ids: [], kind: 'empty' };
    if (groups[0].ids.length >= 4) return { ids: groups[0].ids.slice(), kind: 'close-tie' };
    var ids = [];
    var topScore = groups[0].score;
    for (var g = 0; g < groups.length; g++) {
      if (ids.length >= 3) break;
      var drop = topScore - groups[g].score;
      if (g > 0 && drop > HIGHLIGHT_MAX_DROP) break;
      var would = ids.length + groups[g].ids.length;
      if (g > 0 && would > 3) {
        if (ids.length >= 2) break;
        return { ids: ids.concat(groups[g].ids), kind: 'close-tie' };
      }
      ids = ids.concat(groups[g].ids);
    }
    return { ids: ids, kind: ids.length > 3 ? 'close-tie' : 'top' };
  }

  function resultTitle(hi) {
    if (!hi || hi.kind === 'close-tie' || hi.ids.length > 3) return '今晚这几样都很想试';
    if (hi.ids.length === 1) return '今晚更想试的这一样';
    if (hi.ids.length === 2) return '今晚更想试的两样';
    return '今晚更想试的三样';
  }

  function emptyStore() {
    return { version: 1, result: null, draft: null };
  }

  function blankAnswers() {
    var a = [];
    for (var i = 0; i < ITEMS.length; i++) a.push(null);
    return a;
  }

  function validAnswers(list) {
    if (!list || list.length !== ITEMS.length) return false;
    for (var i = 0; i < ITEMS.length; i++) if (!choiceOk(ITEMS[i], list[i])) return false;
    return true;
  }

  function validDraftAnswers(list) {
    if (!list || list.length !== ITEMS.length) return false;
    for (var i = 0; i < ITEMS.length; i++) {
      if (list[i] == null) continue;
      if (!choiceOk(ITEMS[i], list[i])) return false;
    }
    return true;
  }

  function normalizeResult(raw) {
    if (!raw || !validAnswers(raw.answers)) return null;
    return { savedAt: typeof raw.savedAt === 'string' ? raw.savedAt : '', answers: raw.answers.slice() };
  }

  function normalizeDraft(raw) {
    if (!raw || !validDraftAnswers(raw.answers)) return null;
    var index = raw.index | 0;
    if (index < 0 || index > ITEMS.length - 1) index = 0;
    return { index: index, answers: raw.answers.slice(), updatedAt: raw.updatedAt || '' };
  }

  function loadStore(storage) {
    if (!storage) return emptyStore();
    try {
      var raw = storage.getItem(STORAGE_KEY);
      if (!raw) return emptyStore();
      var data = JSON.parse(raw);
      if (!data || data.version !== 1) return emptyStore();
      return { version: 1, result: normalizeResult(data.result), draft: normalizeDraft(data.draft) };
    } catch (e) {
      return emptyStore();
    }
  }

  function saveStore(data, storage) {
    if (!storage) return false;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  function draftProgress(draft) {
    if (!draft) return 0;
    var n = 0;
    for (var i = 0; i < draft.answers.length; i++) if (draft.answers[i] != null) n++;
    return n;
  }

  function resultView(answers) {
    var scored = scoreAnswers(answers);
    var ranked = rankScores(scored.scores);
    return { scores: scored.scores, ranked: ranked, highlight: highlightIds(ranked), complete: scored.complete };
  }

  function sceneSrc(id) {
    return 'assets/' + id + '.svg?v=' + TIP;
  }

  function sceneImg(id, cls) {
    var classAttr = cls ? ' class="' + cls + '"' : '';
    return '<img' + classAttr + ' src="' + sceneSrc(id) + '" alt="" aria-hidden="true" width="160" height="120"/>';
  }

  function linkHtml(domain) {
    if (!domain || !domain.href) return '';
    var html = '<a class="primary" href="' + esc(domain.href) + '">' + esc(domain.cta) + '</a>';
    if (domain.alsoHref) html += '<a class="ghost" href="' + esc(domain.alsoHref) + '">' + esc(domain.alsoCta) + '</a>';
    return html;
  }

  function rowById(ranked, id) {
    for (var i = 0; i < ranked.length; i++) if (ranked[i].id === id) return ranked[i];
    return null;
  }

  function tieNote(ranked, ids, kind) {
    var hi = -1;
    var lo = 99;
    ids.forEach(function (id) {
      var row = rowById(ranked, id);
      if (!row) return;
      if (row.score > hi) hi = row.score;
      if (row.score < lo) lo = row.score;
    });
    if (ids.length === 1) {
      if (hi <= 4) return '只是比旁边多选了一点点。今晚做最小的那一下就好。';
      return '今晚先做这一样，别的不必补。';
    }
    if (hi === lo) return '这几样今晚一样想试。不必排名，点一件最小的就开始。';
    if (kind === 'close-tie') return '前排有并列，没有拆开。点一件今晚就想做的。';
    if (hi <= 4) return '只是比旁边多选了一点点。今晚挑一件最小的就好。';
    return '';
  }

  function cardsHtml(view) {
    var hi = view.highlight;
    var noteText = tieNote(view.ranked, hi.ids, hi.kind);
    var note = noteText ? '<p class="lead">' + esc(noteText) + '</p>' : '';
    var cards = hi.ids.map(function (id) {
      var d = domainById(id);
      var row = rowById(view.ranked, id);
      return '<article class="card"><span class="badge">今晚可以试试</span>' + sceneImg(d.id, 'card-art') + '<h3>' + esc(d.name) + '</h3><p class="fine">选中 ' + row.score + ' 次</p><p class="blurb">' + esc(d.blurb) + '</p><p class="try">' + esc(d.tonight) + '</p>' + linkHtml(d) + '</article>';
    }).join('');
    return note + '<div class="cards">' + cards + '</div>';
  }

  function barsHtml(view) {
    var hi = view.highlight.ids;
    var max = 7;
    return view.ranked.map(function (row) {
      var d = domainById(row.id);
      var mark = hi.indexOf(row.id) !== -1 ? ' in-top' : '';
      var width = Math.round((row.score / max) * 100);
      return '<div class="bar-row' + mark + '">' + sceneImg(row.id, 'bar-art') + '<span class="bar-name">' + esc(d.name) + '</span><span class="bar-track"><span class="bar-fill" style="width:' + width + '%"></span></span><span class="bar-num">选中 ' + row.score + ' 次</span></div>';
    }).join('');
  }

  function formatWhen(iso) {
    if (!iso) return '';
    try {
      return new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }).format(new Date(iso));
    } catch (e) {
      return '';
    }
  }

  var SE = {
    DISCLAIMER: DISCLAIMER,
    STORAGE_KEY: STORAGE_KEY,
    TIP: TIP,
    HIGHLIGHT_MAX_DROP: HIGHLIGHT_MAX_DROP,
    CHILD: CHILD,
    ASSISTANT: ASSISTANT,
    DOMAINS: DOMAINS,
    LINES: LINES,
    ITEMS: ITEMS,
    LEVEL_HREF: LEVEL_HREF,
    SONG_HREF: SONG_HREF,
    SONG_PAGE: SONG_PAGE,
    PLAY_HREF: PLAY_HREF,
    scoreAnswers: scoreAnswers,
    rankScores: rankScores,
    highlightIds: highlightIds,
    resultTitle: resultTitle,
    loadStore: loadStore,
    saveStore: saveStore,
    emptyStore: emptyStore,
    blankAnswers: blankAnswers,
    resultView: resultView,
    pairSchedule: pairSchedule,
    balanceSides: balanceSides,
    boot: boot
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SE;
  if (root) root.StrengthExplore = SE;

  function boot() {
    var app = document.getElementById('app');
    if (!app) return;
    var storage = null;
    try { storage = window.localStorage; } catch (e) { storage = null; }
    var persistOk = true;
    var store = loadStore(storage);
    var state = {
      screen: 'intro',
      index: 0,
      answers: blankAnswers(),
      dialog: null,
      timer: null,
      lock: false
    };

    function writeStore() {
      persistOk = saveStore(store, storage);
    }

    function saveDraft() {
      store.draft = { index: state.index, answers: state.answers.slice(), updatedAt: new Date().toISOString() };
      writeStore();
    }

    function clearTimer() {
      if (state.timer) clearTimeout(state.timer);
      state.timer = null;
      state.lock = false;
    }

    function render() {
      app.innerHTML = '<main class="shell"><p class="disclaimer"><span>' + esc(DISCLAIMER) + '</span><span class="build-tip">' + TIP + '</span></p>' + screenHtml() + '</main>';
    }

    function screenHtml() {
      if (state.screen === 'result') return resultHtml();
      if (state.screen === 'q') return questionHtml();
      return introHtml();
    }

    function warnHtml() {
      if (persistOk) return '';
      return '<p class="warn">这台浏览器不让记住。这次可以做完，离开页面后结果会丢。</p>';
    }

    function introHtml() {
      var draft = store.draft;
      var done = draftProgress(draft);
      var resume = '';
      if (draft && done > 0) {
        resume = '<button type="button" class="primary" data-action="resume">接着做 · 第 ' + (draft.index + 1) + ' / ' + ITEMS.length + '</button><p class="fine">已经点了 ' + done + ' 下。接着做会回到这一份。</p>';
      }
      var startLabel = draft && done > 0 ? '重新开始' : '开始';
      var savedBtn = store.result ? '<button type="button" class="ghost" data-action="results">看上次结果</button>' : '';
      var dialog = '';
      if (state.dialog === 'restart') {
        dialog = '<div class="dialog"><p>还有一份没玩完。重新开始会放下它。已经玩完、留在手机里的结果还在。</p><button type="button" class="primary" data-action="restart-yes">放下，重新开始</button><button type="button" class="ghost" data-action="dialog-close">留下</button></div>';
      }
      var strip = '<div class="scene-strip" aria-hidden="true">' + DOMAINS.map(function (d) {
        return sceneImg(d.id, '');
      }).join('') + '</div>';
      var speech = ASSISTANT + '：' + CHILD + '，今晚不考试。两件小事，点你更想试试的那一件。玩完告诉你今晚可以做哪样。';
      return warnHtml() + '<div class="intro-grid"><div><p class="who">' + esc(ASSISTANT) + '</p><h1>你更想试试哪样</h1><p class="who">' + esc(CHILD) + '</p><p class="lead">' + esc(speech) + '</p><p class="fine">' + ITEMS.length + ' 下就好。两张卡片一样大。左边和右边都算数，没有更对的一边。</p>' + strip + '<div class="avatars" aria-label="小宇和伍澍暘"><figure><img src="../../avatars/xiaoyu.jpg" alt="小宇"/><figcaption>小宇</figcaption></figure><figure><img src="../../avatars/pengpeng.jpg" alt="伍澍暘"/><figcaption>伍澍暘</figcaption></figure></div></div><div><div class="actions">' + resume + '<button type="button" class="' + (resume ? 'ghost' : 'primary') + '" data-action="start">' + startLabel + '</button>' + savedBtn + '<a class="ghost" href="../../../index.html">回小屋</a><a class="ghost" href="../mi8/?v=mi2">另一张 · 更喜欢哪边</a></div>' + dialog + '</div></div>';
    }

    function questionHtml() {
      var item = ITEMS[state.index];
      var picked = state.answers[state.index];
      var pct = Math.round(((state.index + (picked ? 1 : 0)) / ITEMS.length) * 100);
      var leftOn = picked === item.left ? 'true' : 'false';
      var rightOn = picked === item.right ? 'true' : 'false';
      var finish = '';
      if (state.index === ITEMS.length - 1) {
        finish = '<button type="button" class="primary" data-action="finish"' + (picked ? '' : ' disabled') + '>看今晚方向</button>';
      }
      var backLabel = state.index === 0 ? '先停一下' : '上一题';
      return warnHtml() + '<section class="q-screen" aria-labelledby="q-heading"><div class="progress-label"><span>第 ' + (state.index + 1) + ' / ' + ITEMS.length + '</span><span>点一张就往下</span></div><div class="track" role="progressbar" aria-valuemin="1" aria-valuemax="' + ITEMS.length + '" aria-valuenow="' + (state.index + 1) + '"><span style="width:' + pct + '%"></span></div><p class="prompt">' + esc(ASSISTANT) + '问' + esc(CHILD) + '</p><h2 id="q-heading" tabindex="-1">你更想试试哪样？</h2><div class="pair" role="group" aria-label="你更想试试哪样"><button type="button" class="scene" data-action="pick" data-side="left" aria-pressed="' + leftOn + '">' + sceneImg(item.left, '') + '<span class="scene-text">' + esc(item.leftText) + '</span></button><p class="or" aria-hidden="true">或</p><button type="button" class="scene" data-action="pick" data-side="right" aria-pressed="' + rightOn + '">' + sceneImg(item.right, '') + '<span class="scene-text">' + esc(item.rightText) + '</span></button></div><p class="hint">两张一样大，点更想试的那张。</p><div class="q-nav"><button type="button" class="ghost" data-action="back">' + backLabel + '</button>' + finish + '</div></section>';
    }

    function resultHtml() {
      if (!store.result) {
        state.screen = 'intro';
        return introHtml();
      }
      var view = resultView(store.result.answers);
      var hi = view.highlight;
      var speech = ASSISTANT + '：' + CHILD + '，亮着的是你今晚更想试的。不是成绩，也不定以后做什么。';
      var dialog = '';
      if (state.dialog === 'retake') {
        dialog = '<div class="dialog"><p>再玩一遍。答完才换掉这次的结果。</p><button type="button" class="primary" data-action="retake-yes">开始重来</button><button type="button" class="ghost" data-action="dialog-close">留在结果</button></div>';
      }
      var when = formatWhen(store.result.savedAt);
      return warnHtml() + '<p class="who">' + esc(ASSISTANT) + '</p><h1>' + esc(resultTitle(hi)) + '</h1><p class="lead">' + esc(speech) + '</p>' + cardsHtml(view) + '<h2 class="subhead">二十八次里，每样被选中几次</h2><div class="bars">' + barsHtml(view) + '</div><div class="foot-actions"><button type="button" class="primary" data-action="again">再玩一次</button><button type="button" class="ghost" data-action="edit-last">改最后一题</button><a class="ghost" href="../mi8/?v=mi2">另一张 · 更喜欢哪边</a><a class="ghost" href="../../../index.html">回小屋</a></div>' + dialog + '<details class="parent-note"><summary>给爸爸的一句</summary><p>次数只表示今晚更想试哪一件。先做亮着的一件，别的方向不必补。几周后再玩，顺序变了也很正常。</p><p>摆关进关卡工坊，听节奏进小歌编辑器，和朋友一起是把选关递给另一个人。看自然和安静想一想离开屏幕就做。</p></details><p class="saved-at">存在这台手机 · ' + esc(when) + ' · ' + TIP + ' · ' + STORAGE_KEY + '</p>';
    }

    function startNew() {
      clearTimer();
      state.index = 0;
      state.answers = blankAnswers();
      state.screen = 'q';
      state.dialog = null;
      saveDraft();
      render();
      window.scrollTo(0, 0);
    }

    function pick(side) {
      if (state.screen !== 'q' || state.lock) return;
      if (side !== 'left' && side !== 'right') return;
      var item = ITEMS[state.index];
      state.answers[state.index] = side === 'left' ? item.left : item.right;
      saveDraft();
      render();
      if (state.index >= ITEMS.length - 1) return;
      state.lock = true;
      var delay = 180;
      try {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) delay = 0;
      } catch (e) {}
      state.timer = setTimeout(function () {
        state.lock = false;
        state.timer = null;
        state.index += 1;
        saveDraft();
        render();
      }, delay);
    }

    function back() {
      clearTimer();
      if (state.index === 0) {
        state.screen = 'intro';
        saveDraft();
        render();
        return;
      }
      state.index -= 1;
      saveDraft();
      render();
    }

    function finish() {
      if (!validAnswers(state.answers)) return;
      store.result = { savedAt: new Date().toISOString(), answers: state.answers.slice() };
      store.draft = null;
      writeStore();
      state.screen = 'result';
      state.dialog = null;
      clearTimer();
      render();
      window.scrollTo(0, 0);
    }

    app.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-action]') : null;
      if (!t || !app.contains(t)) return;
      var action = t.getAttribute('data-action');
      if (action === 'start') {
        var draft = store.draft;
        if (draft && draftProgress(draft) > 0) {
          state.dialog = 'restart';
          render();
          return;
        }
        startNew();
        return;
      }
      if (action === 'restart-yes') { startNew(); return; }
      if (action === 'resume') {
        var d = store.draft;
        if (!d) return;
        clearTimer();
        state.index = d.index;
        state.answers = d.answers.slice();
        state.screen = 'q';
        state.dialog = null;
        render();
        window.scrollTo(0, 0);
        return;
      }
      if (action === 'results') {
        if (!store.result) return;
        state.screen = 'result';
        state.dialog = null;
        render();
        window.scrollTo(0, 0);
        return;
      }
      if (action === 'pick') { pick(t.getAttribute('data-side')); return; }
      if (action === 'back') { back(); return; }
      if (action === 'finish') { finish(); return; }
      if (action === 'again') { state.dialog = 'retake'; render(); return; }
      if (action === 'retake-yes') { startNew(); return; }
      if (action === 'dialog-close') { state.dialog = null; render(); return; }
      if (action === 'edit-last') {
        if (!store.result) return;
        clearTimer();
        state.answers = store.result.answers.slice();
        state.index = ITEMS.length - 1;
        state.screen = 'q';
        state.dialog = null;
        saveDraft();
        render();
      }
    });

    render();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  }
})(typeof window !== 'undefined' ? window : globalThis);
