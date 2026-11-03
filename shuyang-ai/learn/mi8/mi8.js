/* 成长屋兴趣小问 · 八个方向，测更喜欢哪边。缓存 mi2。
   每题一张图，只说明这件事长什么样。四档选项不配图、不加权。
   计分：每题 1–4，每方向 5 题，方向分 5–20。兴趣，不是能力。 */
(function (root) {
  'use strict';

  var DISCLAIMER = '成长屋兴趣参考 · 非哈佛官方测验 · 非能力诊断 · 测的是更喜欢哪边';
  var STORAGE_KEY = 'xygo-mi8-results';
  var TIP = 'mi2';
  var HIGHLIGHT_MAX_DROP = 4;
  var CHILD = '伍澍暘';
  var ASSISTANT = '小宇';

  var SCALES = {
    kid: ['很不像我', '有点不像', '有点像', '很像我'],
    parent: ['很不像他', '有点不像', '有点像', '很像他']
  };

  var PLACES = {
    'level-editor': {
      id: 'level-editor',
      label: '做关卡',
      href: '../cocos/level-select.html?v=ls7',
      cta: '去选一关',
      scene: 'spatial-4'
    },
    'song-studio': {
      id: 'song-studio',
      label: '做歌',
      href: '../song-studio/?v=mse1',
      cta: '去小歌编辑器',
      scene: 'musical-4'
    },
    outdoor: { id: 'outdoor', label: '到户外', href: '', cta: '', scene: 'naturalist-1' },
    teach: { id: 'teach', label: '教别人', href: '', cta: '', scene: 'interpersonal-3' },
    reflect: { id: 'reflect', label: '想一想', href: '', cta: '', scene: 'intrapersonal-1' }
  };

  var DOMAINS = [
    {
      id: 'linguistic',
      name: '语言',
      blurb: '你喜欢把事情说出来、写下来。话可以变成关卡里的一句提示。',
      place: 'level-editor',
      tryText: '给一关起名字，再写一句给玩家的提示。也可以把今天的事讲成一个小故事。',
      items: [
        '喜欢把今天的事讲成一个小故事，能讲很久。',
        '喜欢给游戏关卡起名字，再写一句给玩家的提示。',
        '听到一个新词，会想找机会再用一次。',
        '听故事听到一半，会想问后来怎样了。',
        '心里有想法时，更想说出来或写下来，而不是一直闷着。'
      ],
      pictures: [
        '一个人把今天的事讲出来，气泡里有太阳和屋子',
        '一扇关卡门上贴着一张纸，旁边还有一张一样大的纸',
        '两张一样大的卡片都写着词，一张在上，一张在下',
        '一本翻开的故事书，书签夹在中间，旁边有一个问号',
        '三个一样大的格子：一个圆、一个小气泡、一张小纸'
      ],
      sceneItem: 2
    },
    {
      id: 'logical',
      name: '逻辑数学',
      blurb: '你喜欢找规律、想下一步。数清楚，再往前走。',
      place: 'level-editor',
      tryText: '摆关之前先数格子：少一格会怎样，多一格又会怎样。',
      items: [
        '过关之前，会想先数一数格子够不够跳。',
        '喜欢想：要是这样，下一步会变成什么样。',
        '看到一排东西，会想找哪里在重复、哪里是规律。',
        '一关打不开时，更想一步一步试，而不是乱按一通。',
        '收拾或排队时，喜欢先分成几类再开始。'
      ],
      pictures: [
        '四格一样大的跑道，每格一个数字',
        '左右两格一样大，一格写这一步，一格写下一步，方块一样大',
        '一排圆和方，大小都一样，间距也一样',
        '一个人、三块一样大的踏脚石、一扇关着的门',
        '三只一样大的筐，里面分别是圆、方、三角'
      ],
      sceneItem: 1
    },
    {
      id: 'spatial',
      name: '空间',
      blurb: '你喜欢在脑子里转图形、把路搭出来。',
      place: 'level-editor',
      tryText: '搭一条有高有低的路，看从这里能不能到那里。积木或跑道都可以。',
      items: [
        '搭积木时，会在脑子里先转一转，看怎样才卡得进。',
        '看地图、摆跑道、拼一块画面，比听很长的说明更带劲。',
        '喜欢指出一个东西在左边还是右边、高一点还是低一点。',
        '做关卡时，会在意空隙：从这里能不能跳到那里。',
        '涂色、拼图，或把画面排整齐，做完会觉得舒服。'
      ],
      pictures: [
        '一块方积木，气泡里是转过方向的同一块',
        '三张一样大的卡片：地图、跑道、拼图',
        '左边低处一个方块，右边高处一个圆，字一样大',
        '两块一样高的平台，中间空着',
        '一张涂了一半颜色的纸，旁边四块一样大的拼图'
      ],
      sceneItem: 4
    },
    {
      id: 'bodily',
      name: '身体动觉',
      blurb: '你喜欢动起来再学。手和脚会帮忙记住。',
      place: 'outdoor',
      tryText: '离开座位，到户外跑一圈或跳一跳。回来用身体走一遍这一关的节奏。',
      items: [
        '坐久了，身体会想站起来走一走、伸一伸。',
        '学一个新动作时，更想自己站起来试，而不是只看一遍。',
        '跑、跳、球或攀爬，动完会觉得今天真痛快。',
        '搭积木或做手工时，手要摸到材料才安心。',
        '用全身演一个角色，比只用嘴讲更像自己。'
      ],
      pictures: [
        '一把椅子，一个人举着手在伸懒腰',
        '一个人抬起一条腿',
        '三个一样大的格子，里面是球、小路和石头',
        '一个人把手放在积木和纸上',
        '一个人张开手臂，身上披着一块布'
      ],
      sceneItem: 3
    },
    {
      id: 'musical',
      name: '音乐',
      blurb: '你喜欢拍子和曲子。声音能让一个地方忽然不一样。',
      place: 'song-studio',
      tryText: '自己先哼四拍，再进小歌编辑器，把拍子摆进去。',
      items: [
        '听到曲子，会跟着哼，或用手指在桌上打拍子。',
        '给故事或关卡配一段音乐，会觉得那个地方忽然活了。',
        '喜欢分辨这段是快还是慢、是亮还是安静。',
        '想自己做出一小段歌，哪怕只有四拍。',
        '安静的时候，脑子里也会自己响起一首喜欢的曲子。'
      ],
      pictures: [
        '两个音符，一张桌子，一个人把手指点在桌上',
        '一扇关卡门旁边一个音符',
        '左右两格一样大，一格音符密、写着快，一格音符疏、写着慢',
        '四个一样大的圆点，写着数字',
        '一个人旁边的气泡里有三个音符'
      ],
      sceneItem: 4
    },
    {
      id: 'interpersonal',
      name: '人际',
      blurb: '你喜欢和人一起做。讲给别人听的时候，自己也会更明白。',
      place: 'teach',
      tryText: '把刚会的一步教给一个人，让对方跟着做一次。',
      items: [
        '喜欢和别人一起做关卡：一个人摆，一个人试。',
        '旁边的人不开心，会想先问一句怎么了。',
        '把刚学会的一步讲给别人听，自己也会更明白。',
        '一群人还没开始时，愿意先招呼大家从哪里做起。',
        '做完一个东西，会在意别人玩的时候开不开心。'
      ],
      pictures: [
        '两个人一样大，一个旁边有积木，一个脚边有格子',
        '两个人一样大，一个嘴巴是平的，中间有一个问号',
        '两个人一样大，中间有一块台阶',
        '三个人一样大，中间那个人旁边有一个小气泡',
        '三块一样大的积木叠着，旁边两个人一样大'
      ],
      sceneItem: 3
    },
    {
      id: 'intrapersonal',
      name: '内省',
      blurb: '你喜欢先问问自己的感觉。安静想一想，也是在认真。',
      place: 'reflect',
      tryText: '做完一件小事，安静说三句：最开心的是哪一下，哪里顺，哪里别扭。',
      items: [
        '喜欢自己先想一想：今天最开心的是哪一件。',
        '一个人安静搭一会儿、画一会儿，也不觉得闷。',
        '知道自己这一刻是想玩，还是想先歇一歇。',
        '做完一件事，会在心里分一分：哪里顺，哪里别扭。',
        '要选的时候，会问自己到底更想要哪一个。'
      ],
      pictures: [
        '气泡里三个一样大的格子，分别是球、书和叶子',
        '一个人、两块积木、一张画着圆的纸',
        '左右两格一样大，一格是球，一格是枕头',
        '两段一样长的路，一段平，一段上面有圆包',
        '两个一样大的格子，一个杯子、一本书'
      ],
      sceneItem: 1
    },
    {
      id: 'naturalist',
      name: '自然观察',
      blurb: '你喜欢看树、虫、云，还想知道它们为什么这样。',
      place: 'outdoor',
      tryText: '出门找三样东西，叶子、云、虫或石头，比一比哪里不同。',
      items: [
        '出门时会想停下来看树、虫、云或鸟。',
        '喜欢把两片叶子或两只小虫放在一起，比一比哪里不同。',
        '天气变了，或窗台有一盆植物，会想隔一会儿再看一眼。',
        '做关卡时，会想放上草地、水或石头。',
        '比起只记住名字，更想知道它为什么长成这样。'
      ],
      pictures: [
        '树、云、鸟和虫子，旁边站着一个人',
        '两张一样大的卡片，各有一片叶子',
        '一扇窗户、窗外的云、窗台上一盆植物',
        '三块一样大的格子，上面是草、水和石头',
        '一株带着根的植物，旁边站着一个人'
      ],
      sceneItem: 1
    }
  ];

  var ITEMS = [];
  DOMAINS.forEach(function (d) {
    d.items.forEach(function (text, i) {
      ITEMS.push({ id: d.id + '-' + (i + 1), domainId: d.id, text: text, picture: d.pictures[i] });
    });
  });

  var DOORS = [
    { place: 'level-editor', text: '做一关：起个名字，数一数格子，看跳不跳得过。' },
    { place: 'song-studio', text: '做一段歌：自己先哼四拍，再进小歌编辑器，把拍子摆进去。' },
    { place: 'outdoor', text: '到户外：走一圈，看三样自然的东西，叶子、云、虫或石头。' },
    { place: 'teach', text: '教别人：把刚会的一步讲给一个人听，让对方跟着做。' },
    { place: 'reflect', text: '想一想：做完一件小事，说三句今天最开心的、哪里顺、哪里别扭。' }
  ];

  function domainById(id) {
    for (var i = 0; i < DOMAINS.length; i++) if (DOMAINS[i].id === id) return DOMAINS[i];
    return null;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function warmth(score) {
    if (score >= 18) return '很想靠近';
    if (score >= 13) return '比较想';
    if (score >= 8) return '有一点';
    return '这周不太想';
  }

  function scoreAnswers(answers) {
    var scores = {};
    DOMAINS.forEach(function (d) { scores[d.id] = 0; });
    if (!answers || answers.length !== ITEMS.length) return { complete: false, scores: scores };
    for (var i = 0; i < ITEMS.length; i++) {
      var v = answers[i];
      if (v !== 1 && v !== 2 && v !== 3 && v !== 4) return { complete: false, scores: scores };
      scores[ITEMS[i].domainId] += v;
    }
    return { complete: true, scores: scores };
  }

  function rankScores(scores) {
    return DOMAINS.map(function (d, i) {
      return { id: d.id, score: scores[d.id], order: i };
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
      var would = ids.length + groups[g].ids.length;
      if (g > 0 && ids.length >= 2 && (drop > HIGHLIGHT_MAX_DROP || would > 3)) break;
      ids = ids.concat(groups[g].ids);
    }
    return { ids: ids, kind: ids.length > 3 ? 'close-tie' : 'top' };
  }

  function blurbFor(domain, mode) {
    if (mode === 'parent') return domain.blurb.replace(/^你/, CHILD);
    return domain.blurb;
  }

  function emptyStore() {
    return { version: 1, byMode: { kid: null, parent: null }, draft: null, latestMode: null };
  }

  function isMode(mode) { return mode === 'kid' || mode === 'parent'; }

  function validAnswers(list) {
    if (!list || list.length !== 40) return false;
    for (var i = 0; i < 40; i++) {
      if (list[i] !== 1 && list[i] !== 2 && list[i] !== 3 && list[i] !== 4) return false;
    }
    return true;
  }

  function validDraftAnswers(list) {
    if (!list || list.length !== 40) return false;
    for (var i = 0; i < 40; i++) {
      var n = list[i];
      if (n == null) continue;
      if (n !== 1 && n !== 2 && n !== 3 && n !== 4) return false;
    }
    return true;
  }

  function normalizeResult(raw, mode) {
    if (!raw || !isMode(mode) || !validAnswers(raw.answers)) return null;
    return {
      mode: mode,
      savedAt: typeof raw.savedAt === 'string' ? raw.savedAt : '',
      answers: raw.answers.slice()
    };
  }

  function normalizeDraft(raw) {
    if (!raw || !isMode(raw.mode) || !validDraftAnswers(raw.answers)) return null;
    var index = raw.index | 0;
    if (index < 0 || index > 39) index = 0;
    return { mode: raw.mode, index: index, answers: raw.answers.slice(), updatedAt: raw.updatedAt || '' };
  }

  function loadStore(storage) {
    var box = storage || null;
    if (!box) return emptyStore();
    try {
      var raw = box.getItem(STORAGE_KEY);
      if (!raw) return emptyStore();
      var data = JSON.parse(raw);
      if (!data || data.version !== 1) return emptyStore();
      var store = emptyStore();
      store.byMode.kid = normalizeResult(data.byMode && data.byMode.kid, 'kid');
      store.byMode.parent = normalizeResult(data.byMode && data.byMode.parent, 'parent');
      store.draft = normalizeDraft(data.draft);
      store.latestMode = store.byMode[data.latestMode] ? data.latestMode : (store.byMode.kid ? 'kid' : (store.byMode.parent ? 'parent' : null));
      return store;
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

  function blankAnswers() {
    var a = [];
    for (var i = 0; i < 40; i++) a.push(null);
    return a;
  }

  function draftProgress(draft) {
    if (!draft) return 0;
    var n = 0;
    for (var i = 0; i < draft.answers.length; i++) if (draft.answers[i] != null) n++;
    return n;
  }

  function modeLabel(mode) {
    return mode === 'parent' ? '爸爸可按观察代答' : (CHILD + '自己答');
  }

  function promptFor(mode) {
    if (mode === 'parent') return '爸爸可按观察代答：这句有多像' + CHILD + '？';
    return ASSISTANT + '问' + CHILD + '：这句有多像你？';
  }

  function cardBadge(score, ranked) {
    var top = ranked[0].score;
    var tiedTop = 0;
    ranked.forEach(function (r) { if (r.score === top) tiedTop++; });
    if (score === top && tiedTop === 1) return '最想靠近';
    if (score === top) return '一样想靠近';
    return '也想靠近';
  }

  function clusterCopy(ranked, ids) {
    var hi = -1;
    var lo = 99;
    ranked.forEach(function (r) {
      if (ids.indexOf(r.id) === -1) return;
      if (r.score > hi) hi = r.score;
      if (r.score < lo) lo = r.score;
    });
    if (hi <= 8 && hi - lo <= 1) return '这周这些都不太想靠近。可以先去玩已经在做的关卡。想试的话，点一件最小的。';
    if (hi - lo <= 1) return '这几边几乎一样近。不必排名，点一件本周最想做的。';
    return '前排有并列，没有拆开。看下面的分数，再点一件本周想做的。';
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

  function resultView(answers) {
    var scored = scoreAnswers(answers);
    var ranked = rankScores(scored.scores);
    var hi = highlightIds(ranked);
    return { scores: scored.scores, ranked: ranked, highlight: hi };
  }

  function radarSvg(scores, hiIds) {
    var cx = 200;
    var cy = 200;
    var rMax = 108;
    var n = DOMAINS.length;
    function pt(i, frac) {
      var a = -Math.PI / 2 + (i * 2 * Math.PI / n);
      return [cx + rMax * frac * Math.cos(a), cy + rMax * frac * Math.sin(a)];
    }
    var rings = [0.25, 0.5, 0.75, 1];
    var svg = '<svg viewBox="0 0 400 400" role="img" aria-label="八个方向的分数图形">';
    rings.forEach(function (frac) {
      var poly = [];
      for (var i = 0; i < n; i++) {
        var p = pt(i, frac);
        poly.push(p[0].toFixed(1) + ',' + p[1].toFixed(1));
      }
      svg += '<polygon points="' + poly.join(' ') + '" fill="none" stroke="rgba(255,224,122,.35)" stroke-width="1"/>';
    });
    for (var i = 0; i < n; i++) {
      var end = pt(i, 1);
      svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + end[0].toFixed(1) + '" y2="' + end[1].toFixed(1) + '" stroke="rgba(255,224,122,.28)" stroke-width="1"/>';
    }
    var shape = [];
    DOMAINS.forEach(function (d, i) {
      var frac = Math.max(0.08, (scores[d.id] || 0) / 20);
      var p = pt(i, frac);
      shape.push(p[0].toFixed(1) + ',' + p[1].toFixed(1));
    });
    svg += '<polygon points="' + shape.join(' ') + '" fill="rgba(62,207,106,.38)" stroke="#3ecf6a" stroke-width="2"/>';
    DOMAINS.forEach(function (d, i) {
      var lp = pt(i, 1.22);
      var hot = hiIds.indexOf(d.id) !== -1;
      var anchor = 'middle';
      if (lp[0] < cx - 20) anchor = 'end';
      else if (lp[0] > cx + 20) anchor = 'start';
      svg += '<text x="' + lp[0].toFixed(1) + '" y="' + lp[1].toFixed(1) + '" text-anchor="' + anchor + '" dominant-baseline="middle" font-size="13" font-weight="700" fill="' + (hot ? '#ffe07a' : '#a8a0c8') + '">' + esc(d.name) + '</text>';
    });
    svg += '</svg>';
    return svg;
  }

  function sceneSrc(id) {
    return 'assets/' + id + '.svg?v=' + TIP;
  }

  function sceneImg(id, cls, decorative) {
    var alt = '';
    if (!decorative) {
      for (var i = 0; i < ITEMS.length; i++) {
        if (ITEMS[i].id === id) alt = ITEMS[i].picture || '';
      }
    }
    var altAttr = decorative ? ' alt="" aria-hidden="true"' : ' alt="' + esc(alt) + '"';
    var classAttr = cls ? ' class="' + cls + '"' : '';
    return '<img' + classAttr + ' src="' + sceneSrc(id) + '"' + altAttr + ' width="160" height="120"/>';
  }

  function barsHtml(view) {
    var hi = view.highlight.ids;
    return view.ranked.map(function (row) {
      var d = domainById(row.id);
      var hot = hi.indexOf(row.id) !== -1 ? ' hot' : '';
      var width = Math.round((row.score / 20) * 100);
      return '<div class="bar-row' + hot + '">' + sceneImg(row.id + '-1', 'bar-art', true) + '<span class="bar-name">' + esc(d.name) + '</span><span class="bar-track"><span class="bar-fill" style="width:' + width + '%"></span></span><span class="bar-num">' + row.score + '/20 · ' + esc(warmth(row.score)) + '</span></div>';
    }).join('');
  }

  function linkHtml(placeId) {
    var place = PLACES[placeId];
    if (!place || !place.href) return '';
    return '<a class="primary" href="' + esc(place.href) + '">' + esc(place.cta) + '</a>';
  }

  function cardsHtml(view, mode) {
    var hi = view.highlight;
    if (hi.kind === 'close-tie' || hi.ids.length > 3) {
      var names = hi.ids.map(function (id) {
        var row = null;
        view.ranked.forEach(function (r) { if (r.id === id) row = r; });
        return esc(domainById(id).name) + ' ' + row.score + '/20';
      }).join(' · ');
      var doors = DOORS.map(function (door) {
        var place = PLACES[door.place];
        return '<article class="card">' + sceneImg(place.scene, 'card-art', false) + '<span class="place">' + esc(place.label) + '</span><p class="blurb">' + esc(door.text) + '</p>' + linkHtml(door.place) + '</article>';
      }).join('');
      return '<p class="lead">' + esc(clusterCopy(view.ranked, hi.ids)) + '</p><p class="fine">' + names + '</p><div class="cards">' + doors + '</div>';
    }
    return '<div class="cards">' + hi.ids.map(function (id) {
      var d = domainById(id);
      var row = null;
      view.ranked.forEach(function (r) { if (r.id === id) row = r; });
      var place = PLACES[d.place];
      var head = mode === 'parent' ? '本月可以陪他试' : '本月可以多试';
      return '<article class="card hot">' + sceneImg(d.id + '-' + d.sceneItem, 'card-art', false) + '<span class="badge">' + esc(cardBadge(row.score, view.ranked)) + '</span><h3>' + esc(d.name) + '</h3><p class="fine">' + row.score + '/20 · ' + esc(warmth(row.score)) + '</p><p class="blurb">' + esc(blurbFor(d, mode)) + '</p><span class="place">' + esc(place.label) + '</span><p class="try">' + esc(head) + '：' + esc(d.tryText) + '</p>' + linkHtml(d.place) + '</article>';
    }).join('') + '</div>';
  }

  function restHtml(view, mode) {
    var highlight = view.highlight;
    var lines = [];
    view.ranked.forEach(function (row) {
      var inCards = highlight.kind === 'top' && highlight.ids.length <= 3 && highlight.ids.indexOf(row.id) !== -1;
      if (inCards) return;
      var d = domainById(row.id);
      lines.push('<li><strong>' + esc(d.name) + '</strong> · ' + esc(blurbFor(d, mode)) + '</li>');
    });
    if (!lines.length) return '';
    return '<ul class="rest">' + lines.join('') + '</ul>';
  }

  var MI8 = {
    DISCLAIMER: DISCLAIMER,
    STORAGE_KEY: STORAGE_KEY,
    TIP: TIP,
    HIGHLIGHT_MAX_DROP: HIGHLIGHT_MAX_DROP,
    CHILD: CHILD,
    ASSISTANT: ASSISTANT,
    SCALES: SCALES,
    PLACES: PLACES,
    DOMAINS: DOMAINS,
    ITEMS: ITEMS,
    DOORS: DOORS,
    warmth: warmth,
    scoreAnswers: scoreAnswers,
    rankScores: rankScores,
    highlightIds: highlightIds,
    blurbFor: blurbFor,
    loadStore: loadStore,
    saveStore: saveStore,
    emptyStore: emptyStore,
    blankAnswers: blankAnswers,
    resultView: resultView,
    cardBadge: cardBadge,
    boot: boot
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = MI8;
  if (root) root.MI8Quiz = MI8;

  function boot() {
    var app = document.getElementById('app');
    if (!app) return;
    var storage = null;
    try { storage = window.localStorage; } catch (e) { storage = null; }
    var persistOk = true;
    var store = loadStore(storage);
    var state = {
      screen: 'intro',
      mode: 'kid',
      index: 0,
      answers: blankAnswers(),
      viewMode: store.latestMode || 'kid',
      dialog: null,
      timer: null,
      lock: false
    };

    function writeStore() {
      persistOk = saveStore(store, storage);
    }

    function saveDraft() {
      store.draft = {
        mode: state.mode,
        index: state.index,
        answers: state.answers.slice(),
        updatedAt: new Date().toISOString()
      };
      writeStore();
    }

    function clearTimer() {
      if (state.timer) clearTimeout(state.timer);
      state.timer = null;
      state.lock = false;
    }

    function render() {
      var disclaimerHtml = esc(DISCLAIMER).replace('测的是更喜欢哪边', '<span class="keep">测的是更喜欢哪边</span>');
      app.innerHTML = '<main class="shell"><p class="disclaimer"><span>' + disclaimerHtml + '</span><span class="build-tip">' + TIP + '</span></p>' + screenHtml() + '</main>';
      var q = document.getElementById('q-heading');
      if (q && state.screen === 'q') q.focus();
    }

    function screenHtml() {
      if (!persistOk) {
        /* banner injected by each screen via warn */
      }
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
        resume = '<button type="button" class="primary" data-action="resume">接着做 · 第 ' + (draft.index + 1) + ' / 40 题</button><p class="fine">未完成的是「' + esc(modeLabel(draft.mode)) + '」，已答 ' + done + ' 题。接着做会回到这一份。</p>';
      }
      var startLabel = draft && done > 0 ? '重新开始' : '开始';
      var savedBtn = store.latestMode ? '<button type="button" class="ghost" data-action="results">看上次结果</button>' : '';
      var dialog = '';
      if (state.dialog === 'restart') {
        dialog = '<div class="dialog"><p>还有一份没答完。重新开始会放下它。已经答完、保存在手机里的结果还在。</p><button type="button" class="primary" data-action="restart-yes">放下，重新开始</button><button type="button" class="ghost" data-action="dialog-close">留下</button></div>';
      }
      var speech = state.mode === 'parent'
        ? (ASSISTANT + '：题目还是这 40 句。请爸爸按平日看见的来选，看哪边更像' + CHILD + '。')
        : (ASSISTANT + '：' + CHILD + '，今天不考对错。我们只看你更喜欢哪边。');
      var strip = '<div class="scene-strip" aria-label="题目里会出现的事">' + DOMAINS.map(function (d) {
        return sceneImg(d.id + '-1', '', true);
      }).join('') + '</div>';
      return warnHtml() + '<div class="intro-grid"><div><p class="who">' + esc(ASSISTANT) + '</p><h1>更喜欢哪边</h1><p class="who">' + esc(CHILD) + '</p><p class="lead">' + esc(speech) + '</p><p class="fine">40 件小事。四格都算数，选最贴近的那一格。</p>' + strip + '<div class="avatars" aria-label="小宇和伍澍暘"><figure><img src="../../avatars/xiaoyu.jpg" alt="小宇"/><figcaption>小宇</figcaption></figure><figure><img src="../../avatars/pengpeng.jpg" alt="伍澍暘"/><figcaption>伍澍暘</figcaption></figure></div></div><div><div class="seg" role="group" aria-label="谁来答"><button type="button" data-action="mode" data-mode="kid" aria-pressed="' + (state.mode === 'kid' ? 'true' : 'false') + '">' + esc(CHILD) + '自己答</button><button type="button" data-action="mode" data-mode="parent" aria-pressed="' + (state.mode === 'parent' ? 'true' : 'false') + '">爸爸可按观察代答</button></div><div class="actions">' + resume + '<button type="button" class="' + (resume ? 'ghost' : 'primary') + '" data-action="start">' + startLabel + '</button>' + savedBtn + '<a class="ghost" href="../../../index.html">回小屋</a></div>' + dialog + '</div></div>';
    }

    function questionHtml() {
      var item = ITEMS[state.index];
      var domain = domainById(item.domainId);
      var within = 0;
      for (var i = 0; i <= state.index; i++) if (ITEMS[i].domainId === item.domainId) within++;
      var answered = state.answers[state.index];
      var pct = Math.round(((state.index + (answered ? 1 : 0)) / 40) * 100);
      var choices = SCALES[state.mode].map(function (label, i) {
        var value = i + 1;
        var pressed = answered === value ? 'true' : 'false';
        return '<button type="button" class="choice" data-action="choose" data-value="' + value + '" aria-pressed="' + pressed + '">' + esc(label) + '</button>';
      }).join('');
      var next = '';
      if (state.index === 39) {
        next = '<button type="button" class="primary" data-action="finish"' + (answered ? '' : ' disabled') + '>看我的喜欢</button>';
      }
      var fig = '<figure class="q-fig">' + sceneImg(item.id, '', false) + '</figure>';
      return warnHtml() + '<section class="q-screen" aria-labelledby="q-heading"><div class="q-top">' + fig + '<div class="q-copy"><div class="progress-label"><span>' + esc(domain.name) + ' · ' + within + ' / 5</span><span>第 ' + (state.index + 1) + ' / 40 题</span></div><div class="track" role="progressbar" aria-valuemin="1" aria-valuemax="40" aria-valuenow="' + (state.index + 1) + '"><span style="width:' + pct + '%"></span></div><p class="prompt">' + esc(promptFor(state.mode)) + '</p><h2 id="q-heading" class="q-text" tabindex="-1">' + esc(item.text) + '</h2><p class="hint">四格都对，选最贴近的。</p></div></div><div class="choices">' + choices + '</div><div class="q-nav"><button type="button" class="ghost" data-action="back">' + (state.index === 0 ? '先停一下' : '上一题') + '</button>' + next + '</div></section>';
    }

    function resultHtml() {
      var saved = store.byMode[state.viewMode];
      if (!saved) {
        state.screen = 'intro';
        return introHtml();
      }
      var view = resultView(saved.answers);
      var speech = state.viewMode === 'parent'
        ? (ASSISTANT + '：这是爸爸按观察选的。它可以和' + CHILD + '自己的答案不一样。')
        : (ASSISTANT + '：' + CHILD + '，亮着的是你这周更想靠近的。不是成绩。');
      var low = view.ranked[0].score < 13
        ? '<p class="fine">靠前只是这八边里相对高一点。不想做，可以先去做关卡。</p>'
        : '';
      var switcher = '';
      if (store.byMode.kid && store.byMode.parent) {
        switcher = '<div class="seg" role="group" aria-label="看哪一份"><button type="button" data-action="view" data-mode="kid" aria-pressed="' + (state.viewMode === 'kid' ? 'true' : 'false') + '">' + esc(CHILD) + '自己答</button><button type="button" data-action="view" data-mode="parent" aria-pressed="' + (state.viewMode === 'parent' ? 'true' : 'false') + '">爸爸代答</button></div>';
      } else {
        switcher = '<p class="fine">这一份是「' + esc(modeLabel(state.viewMode)) + '」。</p>';
      }
      var dialog = '';
      if (state.dialog === 'retake') {
        dialog = '<div class="dialog"><p>再答一遍 40 题。答完才换掉「' + esc(modeLabel(state.viewMode)) + '」这一份。另一种答法还留着。</p><button type="button" class="primary" data-action="retake-yes">开始重测</button><button type="button" class="ghost" data-action="dialog-close">留在结果</button></div>';
      }
      var when = formatWhen(saved.savedAt);
      return warnHtml() + '<p class="who">' + esc(ASSISTANT) + '</p><h1>' + esc(CHILD) + ' · 这周更想靠近的</h1><p class="lead">' + esc(speech) + '</p>' + low + switcher + cardsHtml(view, state.viewMode) + '<div class="chart-wrap"><div class="radar-box">' + radarSvg(view.scores, view.highlight.ids) + '</div><div class="bars">' + barsHtml(view) + '</div></div>' + restHtml(view, state.viewMode) + '<div class="foot-actions"><button type="button" class="primary" data-action="again">再测一次</button><button type="button" class="ghost" data-action="edit-last">改最后一题</button><a class="ghost" href="../../../index.html">回小屋</a></div>' + dialog + '<details class="parent-note"><summary>给爸爸的一句</summary><p>亮着的第一项做这次陪学的主活动，第二项收尾前短短试一下。第三项亮着也不另开一块课。先说他刚才做成的那一下，再说下次还想不想。</p><p>没亮的方向这周不必补。八边几乎一样近时，让' + esc(CHILD) + '自己点一件。爸爸代答先当观察，不拿来改掉他自己的选择。</p><p>做歌就进小歌编辑器。若用 Suno，只贴编辑器里的提示词，由爸爸代操作。</p></details><p class="saved-at">存在这台手机 · ' + esc(when) + ' · ' + TIP + '</p>';
    }

    function startNew(mode) {
      clearTimer();
      state.mode = mode;
      state.index = 0;
      state.answers = blankAnswers();
      state.screen = 'q';
      state.dialog = null;
      saveDraft();
      render();
      window.scrollTo(0, 0);
    }

    function choose(value) {
      if (state.screen !== 'q' || state.lock) return;
      if (value !== 1 && value !== 2 && value !== 3 && value !== 4) return;
      state.answers[state.index] = value;
      saveDraft();
      if (state.index >= 39) {
        render();
        return;
      }
      state.lock = true;
      var delay = 200;
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
      var result = {
        mode: state.mode,
        savedAt: new Date().toISOString(),
        answers: state.answers.slice()
      };
      store.byMode[state.mode] = result;
      store.latestMode = state.mode;
      store.draft = null;
      writeStore();
      state.viewMode = state.mode;
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
      if (action === 'mode') {
        var m = t.getAttribute('data-mode');
        if (isMode(m)) state.mode = m;
        render();
        return;
      }
      if (action === 'start') {
        var draft = store.draft;
        if (draft && draftProgress(draft) > 0) {
          state.dialog = 'restart';
          render();
          return;
        }
        startNew(state.mode);
        return;
      }
      if (action === 'restart-yes') {
        startNew(state.mode);
        return;
      }
      if (action === 'resume') {
        var d = store.draft;
        if (!d) return;
        clearTimer();
        state.mode = d.mode;
        state.index = d.index;
        state.answers = d.answers.slice();
        state.screen = 'q';
        state.dialog = null;
        render();
        window.scrollTo(0, 0);
        return;
      }
      if (action === 'results') {
        if (!store.latestMode) return;
        state.viewMode = store.latestMode;
        state.screen = 'result';
        state.dialog = null;
        render();
        window.scrollTo(0, 0);
        return;
      }
      if (action === 'choose') {
        choose(parseInt(t.getAttribute('data-value'), 10));
        return;
      }
      if (action === 'back') {
        back();
        return;
      }
      if (action === 'finish') {
        finish();
        return;
      }
      if (action === 'view') {
        var vm = t.getAttribute('data-mode');
        if (store.byMode[vm]) state.viewMode = vm;
        render();
        return;
      }
      if (action === 'again') {
        state.dialog = 'retake';
        render();
        return;
      }
      if (action === 'retake-yes') {
        startNew(state.viewMode);
        return;
      }
      if (action === 'dialog-close') {
        state.dialog = null;
        render();
        return;
      }
      if (action === 'edit-last') {
        var saved = store.byMode[state.viewMode];
        if (!saved) return;
        clearTimer();
        state.mode = saved.mode;
        state.answers = saved.answers.slice();
        state.index = 39;
        state.screen = 'q';
        state.dialog = null;
        saveDraft();
        render();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (state.screen !== 'q') return;
      if (e.key >= '1' && e.key <= '4') choose(parseInt(e.key, 10));
      else if (e.key === 'ArrowLeft') back();
    });

    render();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  }
})(typeof window !== 'undefined' ? window : globalThis);
