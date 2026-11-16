/* 成长屋英语学习 · 家庭陪伴短课。缓存 en4。
   只写 localStorage 键 xygo-english-en1，不碰方块小世界或其他课的存档。
   发音按美式英语 General American。孩子这条路只内嵌哔哩哔哩官方芝麻街播放器，并使用本页读音。不下载、不转载受版权保护的片子。 */
(function (root) {
  'use strict';

  var TIP = 'en4';
  var STORAGE_KEY = 'xygo-english-en1';
  var CHILD = '伍澍暘';
  var NICKNAME = '芃芃';
  var ASSISTANT = '小宇';
  var HOME_MISSION = '每次先记住一个字母在这些词里怎么读。以后再看见类似的词，就知道这个地方该怎么发音。';
  var DISCLAIMER = '这是成长屋家庭陪伴计划，不是芝麻街官方课程，也不是学习诊断。芝麻街教的是字母怎么读、怎么发音，不是学校那张国际音标表。';
  var PARENT_NOTE = '发音按美式英语（General American）。有些元音和中国课本里的英式 RP 音标不一样：比如 octopus、hot 在美式里是 /ɑ/。孩子这条路只在页面里播放哔哩哔哩官方芝麻街短片，再用本页美式读音。中国这边打不开 YouTube，YouTube 内嵌也同样不行，所以不再跳转到 YouTube。没有找到可在中国直接播放的 BBC 官方嵌入，也不使用粉丝搬运。';
  var EVENING_MINUTES = 10;
  var MORNING_MINUTES = 6;
  var SKIP_NEW_SOUND_REVIEW_MINUTES = 6;
  var REVIEW_MINUTES_PER_ITEM = 2;
  var MAX_SAME_SESSION_RETRIES = 2;
  var EVENING_QUIZ_CAP_WITH_NEW = 3;
  var EVENING_QUIZ_CAP_REVIEW = 5;
  var MORNING_QUIZ_CAP = 4;
  var TIMEZONE = 'Asia/Shanghai';
  var MAX_INTERVAL_DAYS = 7;
  var MAX_STAGE = 4;

  /* 成功回想后的间隔：明天早上 → 2 天 → 4 天 → 最多 7 天。页面上不出现 Anki / FSRS / SM-2。 */
  var SRS_INTERVALS = [
    { stage: 1, id: 'next-morning', label: '明天早上' },
    { stage: 2, id: '2-days', days: 2, label: '2 天后再见' },
    { stage: 3, id: '4-days', days: 4, label: '4 天后再见' },
    { stage: 4, id: '7-days', days: 7, label: '7 天后再见' }
  ];

  var OFFICIAL_MID = 1517070574;
  var OFFICIAL_NAME = '芝麻街SesameStreet';
  var OFFICIAL_BIO = '芝麻街唯一官方~';
  var OFFICIAL_SPACE = 'https://space.bilibili.com/1517070574';
  var OFFICIAL_SEASON_ID = 1123506;
  var OFFICIAL_CATALOG_BVID = 'BV1EG411D7u5';
  var OFFICIAL_STATUS = '哔哩哔哩官方账号（简介：芝麻街唯一官方~）';

  var OFFICIAL_GAPS = [
    'no official Bilibili 芝麻街 short for N or U in the Weekly Letter season',
    'no official Bilibili 芝麻街 shorts for /ɑ/ (O is Ocean /oʊ/), /ɪ/ (I is Ice cream /aɪ/), /ʌ/, /ʊ/, /ʃ/, /tʃ/, /θ/, /ð/, /eɪ/, /aʊ/',
    'no Magic e / silent e — Sesame does not teach Magic e or silent e; do not claim it does',
    'no official IPA symbol lessons',
    'no official BBC China-playable embed found',
    'no fan reuploads, including unofficial BBC官方音标 compilations'
  ];

  var DEFERRED_SOUNDS = ['z', 'ʒ', 'ŋ', 'ɔɪ'];

  var NO_OFFICIAL_CLIP = '这个声音在哔哩哔哩官方芝麻街号上暂时没有短片。我们用这一页的读音来听。';

  function biliVideoUrl(bvid) {
    return 'https://www.bilibili.com/video/' + bvid + '/';
  }

  function officialPlayerSrc(bvid, page) {
    page = page || 1;
    return 'https://player.bilibili.com/player.html?isOutside=true&bvid=' + bvid + '&page=' + page + '&high_quality=1&danmaku=0&autoplay=0';
  }

  function mediaEntry(spec) {
    var page = spec.page || 1;
    return {
      key: spec.key,
      title: spec.title,
      bvid: spec.bvid,
      page: page,
      mid: OFFICIAL_MID,
      official: true,
      source: OFFICIAL_NAME,
      kind: spec.kind || 'letter',
      seconds: spec.seconds || 0,
      durationHint: spec.durationHint,
      note: spec.note || '',
      url: biliVideoUrl(spec.bvid),
      playerSrc: officialPlayerSrc(spec.bvid, page)
    };
  }

  /* 合集 💛芝麻街每周字母💚，入口 BV1EG411D7u5，28 支独立短片，上传者 mid 1517070574。 */
  var MEDIA = {
    letterA: mediaEntry({ key: 'letterA', title: 'A is for Apple', bvid: 'BV1hv4y1b7dF', seconds: 74, durationHint: '大约 1 分钟', kind: 'letter' }),
    letterB: mediaEntry({ key: 'letterB', title: 'B is for Book', bvid: 'BV1g84y1V7r8', seconds: 122, durationHint: '大约 2 分钟', kind: 'letter' }),
    letterC: mediaEntry({ key: 'letterC', title: 'C is for Cookie', bvid: 'BV1Uv4y1x7S1', seconds: 91, durationHint: '大约 1 分半', kind: 'letter' }),
    letterD: mediaEntry({ key: 'letterD', title: 'D is for Dance', bvid: 'BV1Sy4y1Z7DN', seconds: 53, durationHint: '大约 1 分钟', kind: 'letter' }),
    letterE: mediaEntry({ key: 'letterE', title: '我爱字母E！', bvid: 'BV1iT411v7uX', seconds: 64, durationHint: '大约 1 分钟', kind: 'two-sounds', note: '官方短片：E 有两个声音（短 eh / 长 ee）' }),
    loveLetterE: mediaEntry({ key: 'loveLetterE', title: '我爱字母E！', bvid: 'BV1iT411v7uX', seconds: 64, durationHint: '大约 1 分钟', kind: 'two-sounds', note: '官方短片：E 有两个声音（短 eh / 长 ee）' }),
    letterF: mediaEntry({ key: 'letterF', title: 'F is for Food', bvid: 'BV1tM411x7dZ', seconds: 149, durationHint: '大约 2 分半', kind: 'letter' }),
    letterG: mediaEntry({ key: 'letterG', title: 'G is for Glee', bvid: 'BV1Nh4y1W7dw', seconds: 232, durationHint: '大约 4 分钟，看一会儿就好，不必全部看完', kind: 'letter' }),
    letterH: mediaEntry({ key: 'letterH', title: 'H is for Home', bvid: 'BV1n14y1Z7tg', seconds: 70, durationHint: '大约 1 分钟', kind: 'letter' }),
    letterI: mediaEntry({ key: 'letterI', title: 'I is for Ice cream', bvid: 'BV1Vm4y117fR', seconds: 143, durationHint: '大约 2 分钟', kind: 'letter' }),
    letterJ: mediaEntry({ key: 'letterJ', title: 'J is for Jam', bvid: 'BV1824y1M7sL', seconds: 113, durationHint: '大约 2 分钟', kind: 'letter' }),
    letterK: mediaEntry({ key: 'letterK', title: 'K is for Kaleidoscope', bvid: 'BV1Kz4y1b739', seconds: 85, durationHint: '大约 1 分半', kind: 'letter' }),
    letterL: mediaEntry({ key: 'letterL', title: 'L is for Lion', bvid: 'BV1Lz4y1B75Z', seconds: 36, durationHint: '大约半分钟', kind: 'letter' }),
    letterM: mediaEntry({ key: 'letterM', title: 'M is for Marshmallow', bvid: 'BV1VW4y1R7VD', seconds: 79, durationHint: '大约 1 分钟', kind: 'letter' }),
    letterO: mediaEntry({ key: 'letterO', title: 'O is for Ocean', bvid: 'BV1bc411g75L', seconds: 84, durationHint: '大约 1 分钟', kind: 'letter' }),
    letterP: mediaEntry({ key: 'letterP', title: 'P is for Pizza', bvid: 'BV1mX4y1q7wB', seconds: 85, durationHint: '大约 1 分钟', kind: 'letter' }),
    letterQ: mediaEntry({ key: 'letterQ', title: 'Q is for Quick', bvid: 'BV1GN411m73j', seconds: 100, durationHint: '大约 1 分半', kind: 'library' }),
    letterR: mediaEntry({ key: 'letterR', title: 'R is for Rainbow', bvid: 'BV1Gh4y1f7Mx', seconds: 69, durationHint: '大约 1 分钟', kind: 'letter' }),
    letterS: mediaEntry({ key: 'letterS', title: 'S is for Sandwich', bvid: 'BV1Vh4y1L7Wm', seconds: 52, durationHint: '大约 1 分钟', kind: 'letter' }),
    letterT: mediaEntry({ key: 'letterT', title: 'T is for Tea', bvid: 'BV1L14y167AN', seconds: 62, durationHint: '大约 1 分钟', kind: 'letter' }),
    letterV: mediaEntry({ key: 'letterV', title: 'V is for Vest', bvid: 'BV1Ph4y1T7r3', seconds: 124, durationHint: '大约 2 分钟', kind: 'letter' }),
    letterW: mediaEntry({ key: 'letterW', title: 'W is for Wheels', bvid: 'BV1jr4y1972F', seconds: 69, durationHint: '大约 1 分钟', kind: 'library' }),
    letterX: mediaEntry({ key: 'letterX', title: 'X is for multipleX', bvid: 'BV1C34y1P7KT', seconds: 66, durationHint: '大约 1 分钟', kind: 'library' }),
    letterY: mediaEntry({ key: 'letterY', title: 'Y is for Yawn', bvid: 'BV1J94y1V76u', seconds: 122, durationHint: '大约 2 分钟', kind: 'library' }),
    letterZ: mediaEntry({ key: 'letterZ', title: 'Z is for Zebra', bvid: 'BV1cz4y1P7FN', seconds: 67, durationHint: '大约 1 分钟', kind: 'library' }),
    letterHHair: mediaEntry({ key: 'letterHHair', title: 'H is for Hair', bvid: 'BV1XM411V7Gd', seconds: 204, durationHint: '大约 3 分半', kind: 'library' }),
    letterHHorse: mediaEntry({ key: 'letterHHorse', title: 'H is for Horse', bvid: 'BV1RX4y1W7zA', seconds: 219, durationHint: '大约 3 分半', kind: 'library' }),
    alphabetSong: mediaEntry({ key: 'alphabetSong', title: '字母歌 Alphabet Song', bvid: 'BV1JT411X7bZ', seconds: 121, durationHint: '大约 2 分钟', kind: 'library', note: '资料库，不当一晚作业' }),
    weeklyCatalog: mediaEntry({ key: 'weeklyCatalog', title: '芝麻街每周字母合集入口', bvid: OFFICIAL_CATALOG_BVID, seconds: 99, durationHint: '大约 1 分半的回顾，不当一晚作业', kind: 'library', note: '合集入口，不当一晚作业' })
  };

  var OFFICIAL_BVIDS = [];
  var ALLOWED_URLS = [OFFICIAL_SPACE];
  Object.keys(MEDIA).forEach(function (k) {
    var m = MEDIA[k];
    if (OFFICIAL_BVIDS.indexOf(m.bvid) === -1) OFFICIAL_BVIDS.push(m.bvid);
    if (ALLOWED_URLS.indexOf(m.url) === -1) ALLOWED_URLS.push(m.url);
    if (ALLOWED_URLS.indexOf(m.playerSrc) === -1) ALLOWED_URLS.push(m.playerSrc);
  });

  var ALPHABEATS = {
    A: { word: 'alligator', ipa: 'æ' },
    E: { word: 'egg', ipa: 'ɛ' },
    I: { word: 'inchworm', ipa: 'ɪ' },
    O: { word: 'octopus', ipa: 'ɑ', note: '美式 octopus / ɑ /，不是英式 /ɒ/' },
    U: { word: 'umbrella', ipa: 'ʌ' },
    C: { word: 'cake', ipa: 'k', note: '辅音常取常见词首音，C cake = /k/' },
    X: { word: 'box', ipa: 'ks', note: 'X in box = /ks/' }
  };

  var WEEK_PLAN = [
    { week: 1, title: '靠近普通话的辅音', newSounds: ['m', 'n', 'b', 'p', 't', 'd'], families: [['m'], ['n'], ['b', 'p'], ['t', 'd']], hasReviewOnlyEvening: true },
    { week: 2, title: '更多辅音和简单元音', newSounds: ['s', 'k', 'g', 'h', 'i', 'u', 'ɑ'], families: [['s'], ['k', 'g'], ['h'], ['i', 'u', 'ɑ']], hasReviewOnlyEvening: true },
    { week: 3, title: '短元音对比，开始组词', newSounds: ['ɪ', 'æ', 'ɛ'], families: [['ɪ', 'i'], ['æ'], ['ɛ']], contrasts: [['ɪ', 'i']], cvc: true, wordsStage: true, twoSoundsE: true, hasReviewOnlyEvening: true },
    { week: 4, title: '更多短元音和 CVC', newSounds: ['ʌ', 'ʊ'], families: [['ʌ'], ['ʊ', 'u']], contrasts: [['ʊ', 'u']], cvc: true, hasReviewOnlyEvening: true },
    { week: 5, title: '开始说句子', newSounds: ['f', 'v', 'ʃ', 'tʃ'], families: [['f', 'v'], ['ʃ', 'tʃ']], frames: ['I see a ___', 'This is a ___'], sentencesStart: true, hasReviewOnlyEvening: true },
    { week: 6, title: '更多辅音和句子', newSounds: ['dʒ', 'θ', 'ð'], families: [['dʒ'], ['θ', 'ð']], frames: ['I see a ___', 'This is a ___'], hasReviewOnlyEvening: true },
    { week: 7, title: '轻轻碰语法架子', newSounds: ['r', 'l', 'eɪ', 'aɪ'], families: [['r', 'l'], ['eɪ', 'aɪ']], grammar: ['a/an', 'simple plural', 'This is a ___'], lightGrammar: true, hasReviewOnlyEvening: true },
    { week: 8, title: '双元音和多回想', newSounds: ['oʊ', 'aʊ'], families: [['oʊ'], ['aʊ']], grammar: ['simple present', 'plurals in frames'], reviewHeavy: true, hasReviewOnlyEvening: true }
  ];

  function mediaList() {
    var keys = arguments;
    var out = [];
    var seen = {};
    for (var i = 0; i < keys.length; i++) {
      var entry = MEDIA[keys[i]];
      if (!entry || seen[entry.bvid]) continue;
      seen[entry.bvid] = true;
      out.push(entry);
    }
    return out;
  }

  var SOUNDS = [
    { id: 'm', ipa: 'm', title: '嘴唇音 m', week: 1, cue: '嘴唇先闭上，再张开。', speak: 'm', words: ['mom', 'map', 'me'], marks: ['m'], sesame: mediaList('letterM'), bbc: [], builder: { type: 'group', prompt: '把三个都有这个声音的词放在一起。', words: ['mom', 'map', 'me'], rule: '嘴唇闭上再张开，就是这个声音。' } },
    { id: 'n', ipa: 'n', title: '鼻子音 n', week: 1, cue: '舌尖抵住上牙龈，气从鼻子出来。', speak: 'n', words: ['no', 'net', 'nap'], marks: ['n'], sesame: [], bbc: [], sesameGap: NO_OFFICIAL_CLIP, builder: { type: 'group', prompt: '找出三个都有 n 声音的词。', words: ['no', 'net', 'nap'], rule: '舌尖抵住，气从鼻子走。' } },
    { id: 'b', ipa: 'b', title: '爆破音 b', week: 1, cue: '嘴唇闭上，再轻轻爆开，声带要振动。', speak: 'b', words: ['bed', 'bus', 'big'], marks: ['b'], sesame: mediaList('letterB'), bbc: [], builder: { type: 'sort', prompt: '把 b 和 p 分开。b 会振动，p 不振动。', words: ['bed', 'bus', 'pen'], rule: 'b 和 p 嘴巴动作很像，b 嗓子会响。' } },
    { id: 'p', ipa: 'p', title: '爆破音 p', week: 1, cue: '嘴唇闭上，再轻轻爆开，送一口气。', speak: 'p', words: ['pen', 'cup', 'map'], marks: ['p'], sesame: mediaList('letterP'), bbc: [], builder: { type: 'sort', prompt: '把带 p 的词放一起。', words: ['pen', 'cup', 'map'], rule: 'p 送一口气，嗓子不振动。' } },
    { id: 't', ipa: 't', title: '舌尖音 t', week: 1, cue: '舌尖轻轻弹一下上牙龈。', speak: 't', words: ['ten', 'cat', 'hat'], marks: ['t'], sesame: mediaList('letterT'), bbc: [], builder: { type: 'group', prompt: '三个词里都有 t，把它们放一起。', words: ['ten', 'cat', 'hat'], rule: '舌尖弹一下，就是 t。' } },
    { id: 'd', ipa: 'd', title: '舌尖音 d', week: 1, cue: '舌尖弹一下，嗓子要振动。', speak: 'd', words: ['dad', 'dog', 'bed'], marks: ['d'], sesame: mediaList('letterD'), bbc: [], builder: { type: 'sort', prompt: '把 t 和 d 分开。d 会振动。', words: ['dad', 'dog', 'ten'], rule: 'd 和 t 位置很像，d 嗓子会响。' } },
    { id: 's', ipa: 's', title: '气流音 s', week: 2, cue: '牙齿靠近，送出细细的气。', speak: 's', words: ['sun', 'sit', 'bus'], marks: ['s'], sesame: mediaList('letterS'), bbc: [], builder: { type: 'group', prompt: '把三个有 s 的词放一起。', words: ['sun', 'sit', 'bus'], rule: '细细的气流，就是 s。' } },
    { id: 'k', ipa: 'k', title: '后口音 k', week: 2, cue: '舌头后部抬起，再放开。C cake 也是这个音。', speak: 'k', words: ['cat', 'cake', 'cup'], marks: ['c', 'k'], sesame: mediaList('letterC'), bbc: [], builder: { type: 'rule', prompt: '用一句话说出这条摆关规则。', words: ['cat', 'cake', 'cup'], rule: '字母 C 在 cake 里读 /k/。' } },
    { id: 'g', ipa: 'g', title: '后口音 g', week: 2, cue: '和 k 位置相近，但嗓子要振动。', speak: 'g', words: ['go', 'big', 'gum'], marks: ['g'], sesame: mediaList('letterG'), bbc: [], builder: { type: 'sort', prompt: '把 k 和 g 分开。g 会振动。', words: ['go', 'big', 'cat'], rule: 'g 和 k 位置很像，g 嗓子会响。' } },
    { id: 'h', ipa: 'h', title: '呵气音 h', week: 2, cue: '轻轻呵一口气。', speak: 'h', words: ['hat', 'hot', 'house'], marks: ['h'], sesame: mediaList('letterH'), bbc: [], builder: { type: 'group', prompt: '三个词都有 h，放一起。', words: ['hat', 'hot', 'house'], rule: '轻轻呵气，就是 h。' } },
    { id: 'i', ipa: 'i', title: '长元音 ee', week: 2, cue: '嘴角拉开，声音拉长，像 see。', speak: 'ee', words: ['see', 'me', 'eat'], marks: ['ee', 'ea', 'e'], sesame: mediaList('loveLetterE'), bbc: [], builder: { type: 'group', prompt: '把 see、me、eat 放一起。', words: ['see', 'me', 'eat'], rule: '嘴角拉开、声音拉长，就是这个音。' } },
    { id: 'u', ipa: 'u', title: '长元音 oo', week: 2, cue: '嘴唇收圆，声音拉长，像 food。', speak: 'oo', words: ['food', 'too', 'moon'], marks: ['oo'], sesame: [], bbc: [], sesameGap: NO_OFFICIAL_CLIP, builder: { type: 'group', prompt: '三个拉长的 oo 放一起。', words: ['food', 'too', 'moon'], rule: '嘴唇收圆再拉长，像 food。' } },
    { id: 'ɑ', ipa: 'ɑ', title: '开口音 ah', week: 2, cue: '嘴巴张开，像美式 hot、octopus。', speak: 'ah', words: ['hot', 'octopus', 'box'], marks: ['o'], sesame: [], bbc: [], sesameGap: NO_OFFICIAL_CLIP, parentCue: '美式 octopus / hot 是 /ɑ/。官方每周字母的 O 是 Ocean，更接近 /oʊ/，所以这个音先用页面读音。', builder: { type: 'rule', prompt: '用一句话说出这条规则。', words: ['hot', 'octopus', 'box'], rule: '美式 hot、octopus 嘴巴张得比较开，是 /ɑ/。' } },
    { id: 'ɪ', ipa: 'ɪ', title: '短元音 ih', week: 3, cue: '比 see 更短、更松，像 sit。', speak: 'ih', words: ['sit', 'inchworm', 'big'], marks: ['i'], sesame: [], bbc: [], sesameGap: NO_OFFICIAL_CLIP, contrastWith: 'i', builder: { type: 'sort', prompt: '把 sit 和 see 分开：一个短，一个长。', words: ['sit', 'big', 'see'], rule: 'sit 短而松，see 长而亮。' } },
    { id: 'æ', ipa: 'æ', title: '扁口音 a', week: 3, cue: '嘴巴横着张开，像 cat、alligator。', speak: 'a', words: ['cat', 'alligator', 'map'], marks: ['a'], sesame: mediaList('letterA'), bbc: [], builder: { type: 'group', prompt: '把 cat、map、alligator 放一起。', words: ['cat', 'alligator', 'map'], rule: 'A 在 apple、alligator、cat 里常常是这个声音。' } },
    { id: 'ɛ', ipa: 'ɛ', title: '短元音 eh', week: 3, cue: '像 egg、bed。字母 E 还有一个长音 ee。', speak: 'eh', words: ['bed', 'egg', 'red'], marks: ['e'], sesame: mediaList('loveLetterE'), bbc: [], twoSoundsE: true, builder: { type: 'sort', prompt: 'E 有两个声音：egg 的 eh，和 see 的 ee。把它们分开。', words: ['egg', 'bed', 'see'], rule: '《我爱字母E！》说 E 有两个声音：短 eh 和长 ee。芝麻街没有教 Magic e / silent e。' } },
    { id: 'ʌ', ipa: 'ʌ', title: '短元音 uh', week: 4, cue: '嘴巴放松，像 cup、umbrella。', speak: 'uh', words: ['cup', 'umbrella', 'sun'], marks: ['u'], sesame: [], bbc: [], sesameGap: NO_OFFICIAL_CLIP, builder: { type: 'group', prompt: '三个短 uh 放一起。', words: ['cup', 'umbrella', 'sun'], rule: 'U 在 umbrella、cup 里常常是这个短声音。' } },
    { id: 'ʊ', ipa: 'ʊ', title: '短元音 oo', week: 4, cue: '比 food 更短、更松，像 book。', speak: 'oo', words: ['book', 'good', 'put'], marks: ['oo', 'u'], sesame: [], bbc: [], sesameGap: NO_OFFICIAL_CLIP, contrastWith: 'u', builder: { type: 'sort', prompt: '把 book 和 food 分开：一个短，一个长。', words: ['book', 'good', 'food'], rule: 'book 短而松，food 长而圆。' } },
    { id: 'f', ipa: 'f', title: '咬唇音 f', week: 5, cue: '上牙轻轻咬住下唇，送气。', speak: 'f', words: ['food', 'fan', 'if'], marks: ['f'], sesame: mediaList('letterF'), bbc: [], builder: { type: 'sort', prompt: '把 f 和 v 分开。v 会振动。', words: ['food', 'fan', 'van'], rule: 'f 和 v 嘴巴很像，f 只送气。' } },
    { id: 'v', ipa: 'v', title: '咬唇音 v', week: 5, cue: '上牙轻轻咬住下唇，嗓子振动。', speak: 'v', words: ['van', 'five', 'have'], marks: ['v'], sesame: mediaList('letterV'), bbc: [], builder: { type: 'sort', prompt: '把 f 和 v 分开。', words: ['van', 'five', 'fan'], rule: 'v 和 f 嘴巴很像，v 嗓子会响。' } },
    { id: 'ʃ', ipa: 'ʃ', title: 'shh 音', week: 5, cue: '嘴唇稍圆，送出 shh。', speak: 'sh', words: ['ship', 'fish', 'shoe'], marks: ['sh'], sesame: [], bbc: [], sesameGap: NO_OFFICIAL_CLIP, builder: { type: 'sort', prompt: '把 ship 和 chip 分开。', words: ['ship', 'fish', 'chip'], rule: 'ship 是 shh，chip 前面多一个轻轻的 t。' } },
    { id: 'tʃ', ipa: 'tʃ', title: 'ch 音', week: 5, cue: '先轻轻堵住，再放出 shh，像 chip。', speak: 'ch', words: ['chip', 'chin', 'lunch'], marks: ['ch'], sesame: [], bbc: [], sesameGap: NO_OFFICIAL_CLIP, builder: { type: 'group', prompt: '三个 ch 放一起。', words: ['chip', 'chin', 'lunch'], rule: '先轻轻堵住，再放出 shh。' } },
    { id: 'dʒ', ipa: 'dʒ', title: 'j 音', week: 6, cue: '和 ch 位置相近，但嗓子要振动，像 jump。', speak: 'j', words: ['jump', 'jam', 'juice'], marks: ['j'], sesame: mediaList('letterJ'), bbc: [], builder: { type: 'group', prompt: '三个 j 声音放一起。', words: ['jump', 'jam', 'juice'], rule: 'j 和 ch 位置很像，j 嗓子会响。' } },
    { id: 'θ', ipa: 'θ', title: '咬舌音 th（轻）', week: 6, cue: '舌尖轻轻伸到上下牙之间，只送气，像 thin。', speak: 'th', words: ['thin', 'three', 'bath'], marks: ['th'], sesame: [], bbc: [], sesameGap: NO_OFFICIAL_CLIP, builder: { type: 'sort', prompt: '把 thin 和 this 分开：一个只送气，一个会振动。', words: ['thin', 'three', 'this'], rule: 'thin 只送气，this 嗓子会响。' } },
    { id: 'ð', ipa: 'ð', title: '咬舌音 th（浊）', week: 6, cue: '舌头位置和 thin 一样，但嗓子要振动，像 this。', speak: 'th', words: ['this', 'that', 'the'], marks: ['th'], sesame: [], bbc: [], sesameGap: NO_OFFICIAL_CLIP, builder: { type: 'sort', prompt: '把 this 和 thin 分开。', words: ['this', 'that', 'thin'], rule: 'this、that 会振动，thin 只送气。' } },
    { id: 'r', ipa: 'r', title: '美式 r', week: 7, cue: '舌尖不要碰到牙，舌中微微抬起，像 red。', speak: 'r', words: ['red', 'run', 'car'], marks: ['r'], sesame: mediaList('letterR'), bbc: [], builder: { type: 'sort', prompt: '把 r 和 l 分开。', words: ['red', 'run', 'like'], rule: 'r 舌尖不碰牙，l 舌尖要抵住。' } },
    { id: 'l', ipa: 'l', title: '边音 l', week: 7, cue: '舌尖抵住上牙龈，气从两边走，像 like。', speak: 'l', words: ['like', 'lip', 'ball'], marks: ['l'], sesame: mediaList('letterL'), bbc: [], builder: { type: 'sort', prompt: '把 l 和 r 分开。', words: ['like', 'lip', 'red'], rule: 'l 舌尖抵住，r 舌尖不碰牙。' } },
    { id: 'eɪ', ipa: 'eɪ', title: '双元音 ay', week: 7, cue: '从 eh 滑向 ee，像 cake、day。', speak: 'ay', words: ['late', 'cake', 'day'], marks: ['ay', 'a'], sesame: [], bbc: [], sesameGap: NO_OFFICIAL_CLIP, builder: { type: 'group', prompt: '三个 ay 放一起。', words: ['late', 'cake', 'day'], rule: '先 eh 再滑向 ee。不是 Magic e 课，芝麻街没有教 silent e。' } },
    { id: 'aɪ', ipa: 'aɪ', title: '双元音 eye', week: 7, cue: '从 ah 滑向 ee，像 like。', speak: 'eye', words: ['like', 'my', 'kite'], marks: ['i', 'y'], sesame: mediaList('letterI'), bbc: [], builder: { type: 'group', prompt: '三个 eye 放一起。', words: ['like', 'my', 'kite'], rule: '从开口滑到 ee。' } },
    { id: 'oʊ', ipa: 'oʊ', title: '双元音 oh', week: 8, cue: '从 o 滑向 oo，像 go。', speak: 'oh', words: ['go', 'home', 'boat'], marks: ['oa', 'o'], sesame: mediaList('letterO'), bbc: [], builder: { type: 'group', prompt: '三个 oh 放一起。', words: ['go', 'home', 'boat'], rule: '从 o 滑向 oo，像 go。' } },
    { id: 'aʊ', ipa: 'aʊ', title: '双元音 ow', week: 8, cue: '从 ah 滑向 oo，像 house。', speak: 'ow', words: ['house', 'out', 'now'], marks: ['ou', 'ow'], sesame: [], bbc: [], sesameGap: NO_OFFICIAL_CLIP, builder: { type: 'group', prompt: '三个 ow 放一起。', words: ['house', 'out', 'now'], rule: '从 ah 滑向 oo，像 house。' } }
  ];

  var WORD_GLOSS = {
    mom: '妈妈', map: '地图', me: '我', no: '不', net: '网', nap: '小睡',
    bed: '床', bus: '公交车', big: '大的', pen: '笔', cup: '杯子',
    ten: '十', cat: '猫', hat: '帽子', dad: '爸爸', dog: '狗',
    sun: '太阳', sit: '坐', cake: '蛋糕', go: '走', gum: '口香糖',
    hot: '热的', house: '房子', see: '看见', eat: '吃', food: '食物',
    too: '也 / 太', moon: '月亮', octopus: '章鱼', box: '盒子',
    inchworm: '尺蠖', alligator: '短吻鳄', egg: '鸡蛋', red: '红色',
    umbrella: '雨伞', book: '书', good: '好的', put: '放',
    fan: '风扇', if: '如果', van: '货车', five: '五', have: '有',
    ship: '船', fish: '鱼', shoe: '鞋', chip: '薯片', chin: '下巴', lunch: '午饭',
    jump: '跳', jam: '果酱', juice: '果汁', thin: '薄的', three: '三', bath: '洗澡',
    this: '这个', that: '那个', the: '这个 / 那个', run: '跑', car: '车',
    like: '喜欢', lip: '嘴唇', ball: '球', late: '晚的', day: '天',
    my: '我的', kite: '风筝', home: '家', boat: '小船', out: '出去', now: '现在'
  };

  function soundById(id) {
    for (var i = 0; i < SOUNDS.length; i++) {
      if (SOUNDS[i].id === id) return SOUNDS[i];
    }
    return null;
  }

  function weekByNumber(n) {
    for (var i = 0; i < WEEK_PLAN.length; i++) {
      if (WEEK_PLAN[i].week === n) return WEEK_PLAN[i];
    }
    return null;
  }

  function week1RequiredIds() {
    return WEEK_PLAN[0].newSounds.slice();
  }

  function allDocumentedUrls() {
    return ALLOWED_URLS.slice();
  }

  function shanghaiParts(now) {
    now = now ? new Date(now) : new Date();
    var fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hour12: false,
      minute: '2-digit',
      weekday: 'short'
    });
    var parts = fmt.formatToParts(now);
    var map = {};
    parts.forEach(function (p) { map[p.type] = p.value; });
    var hour = parseInt(map.hour, 10);
    if (hour === 24) hour = 0;
    return {
      year: map.year,
      month: map.month,
      day: map.day,
      hour: hour,
      minute: parseInt(map.minute, 10),
      weekday: map.weekday
    };
  }

  function shanghaiYmd(now) {
    var p = shanghaiParts(now);
    return p.year + '-' + p.month + '-' + p.day;
  }

  function shanghaiHour(now) {
    return shanghaiParts(now).hour;
  }

  function shanghaiDateTime(ymd, hour, minute) {
    var hh = hour < 10 ? '0' + hour : String(hour);
    var mm = minute < 10 ? '0' + minute : String(minute);
    return new Date(ymd + 'T' + hh + ':' + mm + ':00+08:00');
  }

  function addDays(date, days) {
    return new Date(date.getTime() + days * 86400000);
  }

  function suggestMode(now) {
    var hour = shanghaiHour(now);
    if (hour >= 5 && hour < 12) return 'morning';
    return 'evening';
  }

  function emptyStore() {
    return {
      version: 2,
      tip: TIP,
      items: {},
      introducedSounds: [],
      activeWeek: 1,
      eveningDates: [],
      reviewOnlyEvenings: [],
      lastSession: null,
      draft: null
    };
  }

  function clampItemSchedule(item, now) {
    if (!item || typeof item !== 'object') return item;
    if (typeof item.stage === 'number' && item.stage > MAX_STAGE) item.stage = MAX_STAGE;
    if (!item.remembered || !item.dueAt) return item;
    var due = Date.parse(item.dueAt);
    if (isNaN(due)) return item;
    var origin = now ? new Date(now) : new Date();
    if (item.lastSuccessAt) {
      var ls = Date.parse(item.lastSuccessAt);
      if (!isNaN(ls)) origin = new Date(ls);
    }
    var cap = addDays(origin, MAX_INTERVAL_DAYS).getTime();
    if (due > cap) item.dueAt = new Date(cap).toISOString();
    return item;
  }

  function loadStore(storage) {
    var blank = emptyStore();
    if (!storage || typeof storage.getItem !== 'function') return blank;
    var raw = null;
    try { raw = storage.getItem(STORAGE_KEY); } catch (e) { return blank; }
    if (!raw) return blank;
    try {
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return blank;
      var out = emptyStore();
      if (parsed.items && typeof parsed.items === 'object') out.items = parsed.items;
      if (Array.isArray(parsed.introducedSounds)) out.introducedSounds = parsed.introducedSounds;
      if (typeof parsed.activeWeek === 'number') out.activeWeek = parsed.activeWeek;
      if (Array.isArray(parsed.eveningDates)) out.eveningDates = parsed.eveningDates;
      if (Array.isArray(parsed.reviewOnlyEvenings)) out.reviewOnlyEvenings = parsed.reviewOnlyEvenings;
      if (parsed.lastSession) out.lastSession = parsed.lastSession;
      if (parsed.draft) out.draft = parsed.draft;
      if (parsed.version) out.version = parsed.version;
      var now = new Date();
      Object.keys(out.items).forEach(function (id) {
        out.items[id] = clampItemSchedule(out.items[id], now);
      });
      return out;
    } catch (err) {
      return blank;
    }
  }

  function saveStore(store, storage) {
    if (!storage || typeof storage.setItem !== 'function') return false;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(store));
      return true;
    } catch (e) {
      return false;
    }
  }

  function itemId(kind, key) {
    return kind + ':' + key;
  }

  function listItems(store) {
    var ids = Object.keys(store.items || {});
    return ids.map(function (id) { return store.items[id]; });
  }

  function makeItem(kind, key, soundId, now) {
    return {
      id: itemId(kind, key),
      kind: kind,
      key: key,
      soundId: soundId,
      introduced: true,
      remembered: false,
      stage: 0,
      dueAt: new Date(now).toISOString(),
      retriesInSession: 0,
      introducedOn: shanghaiYmd(now)
    };
  }

  function introduceSound(store, soundId, now) {
    var sound = soundById(soundId);
    if (!sound) return store;
    if (store.introducedSounds.indexOf(soundId) === -1) {
      store.introducedSounds.push(soundId);
    }
    var sid = itemId('sound', soundId);
    if (!store.items[sid]) store.items[sid] = makeItem('sound', soundId, soundId, now);
    sound.words.forEach(function (w) {
      var wid = itemId('word', w);
      if (!store.items[wid]) store.items[wid] = makeItem('word', w, soundId, now);
    });
    var week = weekByNumber(sound.week);
    if (week && week.frames) {
      week.frames.forEach(function (frame) {
        var word = sound.words[0];
        var key = frame + '|' + word;
        var fid = itemId('frame', key);
        if (!store.items[fid]) {
          var it = makeItem('frame', key, soundId, now);
          it.frame = frame;
          it.word = word;
          store.items[fid] = it;
        }
      });
    }
    return store;
  }

  function isDueOrUnremembered(item, now) {
    if (!item) return false;
    if (!item.introduced) return false;
    if (!item.remembered) return true;
    if (!item.dueAt) return true;
    return Date.parse(item.dueAt) <= new Date(now).getTime();
  }

  function selectQuizItems(storeOrItems, now) {
    var items = Array.isArray(storeOrItems) ? storeOrItems : listItems(storeOrItems);
    return items.filter(function (it) { return isDueOrUnremembered(it, now); });
  }

  function dueSoundIds(storeOrItems, now) {
    var ids = [];
    selectQuizItems(storeOrItems, now).forEach(function (it) {
      if (it && it.soundId && ids.indexOf(it.soundId) === -1) ids.push(it.soundId);
    });
    return ids;
  }

  /* 按到期的声音家族估算，不把同一个声音下的几张词卡、句型卡各算 2 分钟。一个声音大约 2 分钟；三个声音大约 6 分钟，就先不学新的。 */
  function estimateReviewMinutes(storeOrItems, now) {
    return dueSoundIds(storeOrItems, now).length * REVIEW_MINUTES_PER_ITEM;
  }

  function officialClipSound(sound) {
    return !!(sound && sound.sesame && sound.sesame.length);
  }

  function pickWatchSound(store, now, incoming) {
    if (officialClipSound(incoming)) return incoming;
    var due = dueSoundIds(store, now);
    var i;
    for (i = 0; i < due.length; i++) {
      if (incoming && due[i] === incoming.id) continue;
      var s = soundById(due[i]);
      if (officialClipSound(s)) return s;
    }
    var intro = (store && store.introducedSounds) || [];
    for (i = intro.length - 1; i >= 0; i--) {
      if (incoming && intro[i] === incoming.id) continue;
      var s2 = soundById(intro[i]);
      if (officialClipSound(s2)) return s2;
    }
    return null;
  }

  function shouldSkipNewSound(storeOrItems, now) {
    return estimateReviewMinutes(storeOrItems, now) >= SKIP_NEW_SOUND_REVIEW_MINUTES;
  }

  function nextMorningAt(now) {
    var ymd = shanghaiYmd(now);
    var hour = shanghaiHour(now);
    var todayFive = shanghaiDateTime(ymd, 5, 0);
    if (hour < 5) return todayFive;
    return addDays(todayFive, 1);
  }

  function intervalDaysForStage(stage) {
    if (stage <= 1) return 1;
    var row = null;
    SRS_INTERVALS.forEach(function (r) { if (r.stage === stage) row = r; });
    var days = row && row.days ? row.days : MAX_INTERVAL_DAYS;
    if (days > MAX_INTERVAL_DAYS) days = MAX_INTERVAL_DAYS;
    return days;
  }

  function nextDueAt(stage, now) {
    now = now ? new Date(now) : new Date();
    if (stage <= 1) return nextMorningAt(now);
    return addDays(now, intervalDaysForStage(stage));
  }

  function dueAfterMiss(now, mode) {
    now = now ? new Date(now) : new Date();
    if (mode === 'morning') {
      var ymd = shanghaiYmd(now);
      return shanghaiDateTime(ymd, 18, 0);
    }
    return addDays(nextMorningAt(now), 0);
  }

  function applyRecall(item, remembered, now, mode) {
    var copy = {};
    Object.keys(item).forEach(function (k) { copy[k] = item[k]; });
    if (remembered) {
      var nextStage = (copy.stage || 0) + 1;
      if (nextStage > MAX_STAGE) nextStage = MAX_STAGE;
      copy.stage = nextStage;
      copy.remembered = true;
      copy.lastSuccessAt = new Date(now).toISOString();
      copy.dueAt = nextDueAt(nextStage, now).toISOString();
      copy.retriesInSession = 0;
      return { item: copy, requeue: false };
    }
    var retries = (copy.retriesInSession || 0) + 1;
    copy.retriesInSession = retries;
    if (retries <= MAX_SAME_SESSION_RETRIES) {
      return { item: copy, requeue: true };
    }
    copy.remembered = false;
    copy.stage = 0;
    copy.dueAt = dueAfterMiss(now, mode).toISOString();
    copy.retriesInSession = 0;
    return { item: copy, requeue: false, scheduled: mode === 'morning' ? 'tonight' : 'tomorrow' };
  }

  function shouldShowIpa(itemOrStage) {
    var stage = itemOrStage;
    if (itemOrStage && typeof itemOrStage === 'object') stage = itemOrStage.stage || 0;
    return stage >= 1;
  }

  function soundsIntroducedInWeek(store, week) {
    var plan = weekByNumber(week);
    if (!plan) return [];
    return plan.newSounds.filter(function (id) {
      return (store.introducedSounds || []).indexOf(id) !== -1;
    });
  }

  function currentWeek(store) {
    if (store && typeof store.activeWeek === 'number' && store.activeWeek >= 1) {
      return Math.min(store.activeWeek, 8);
    }
    var introduced = (store && store.introducedSounds) || [];
    for (var i = 0; i < WEEK_PLAN.length; i++) {
      var needed = WEEK_PLAN[i].newSounds;
      var allIn = needed.every(function (s) { return introduced.indexOf(s) !== -1; });
      if (!allIn) return WEEK_PLAN[i].week;
    }
    return 8;
  }

  function weekHasReviewLogged(store, week, now) {
    var dates = store.reviewOnlyEvenings || [];
    if (!dates.length) return false;
    var plan = weekByNumber(week);
    if (!plan) return false;
    return dates.some(function (entry) {
      if (typeof entry === 'object' && entry.week === week) return true;
      return false;
    });
  }

  function allWeekSoundsIntroduced(store, week) {
    var plan = weekByNumber(week);
    if (!plan) return false;
    return plan.newSounds.every(function (id) {
      return (store.introducedSounds || []).indexOf(id) !== -1;
    });
  }

  function isWeeklyReviewEvening(store, now) {
    var week = currentWeek(store);
    var plan = weekByNumber(week);
    if (!plan || !plan.hasReviewOnlyEvening) return false;
    if (!allWeekSoundsIntroduced(store, week)) return false;
    if (weekHasReviewLogged(store, week, now)) return false;
    return true;
  }

  function nextNewSound(store) {
    var week = currentWeek(store);
    var start = week;
    for (var w = start; w <= 8; w++) {
      var plan = weekByNumber(w);
      if (!plan) continue;
      for (var i = 0; i < plan.newSounds.length; i++) {
        var id = plan.newSounds[i];
        if ((store.introducedSounds || []).indexOf(id) === -1) return soundById(id);
      }
    }
    return null;
  }

  function mixOldWords(store, currentSoundId, limit) {
    limit = limit || 4;
    var out = [];
    listItems(store).forEach(function (it) {
      if (it.kind === 'word' && it.soundId !== currentSoundId) out.push(it);
    });
    return out.slice(0, limit);
  }

  function capQuizItems(items, mode, skipNew) {
    var cap = MORNING_QUIZ_CAP;
    if (mode === 'evening') cap = skipNew ? EVENING_QUIZ_CAP_REVIEW : EVENING_QUIZ_CAP_WITH_NEW;
    return (items || []).slice(0, cap);
  }

  function planSession(mode, store, now) {
    now = now ? new Date(now) : new Date();
    store = store || emptyStore();
    var quizAll = selectQuizItems(store, now);
    var reviewMinutes = estimateReviewMinutes(store, now);
    if (mode === 'morning') {
      return {
        mode: 'morning',
        minutes: MORNING_MINUTES,
        introduceSound: null,
        watchSound: null,
        skipNewSound: true,
        skipReason: '早上只回想，不学新声音。',
        reviewOnly: true,
        reviewMinutes: reviewMinutes,
        quizItems: capQuizItems(quizAll, 'morning', true),
        mixOldWords: mixOldWords(store, null, 4),
        steps: ['retrieval'],
        allowNewSound: false,
        week: currentWeek(store)
      };
    }
    var heavy = shouldSkipNewSound(store, now);
    var weekly = isWeeklyReviewEvening(store, now);
    var skip = heavy || weekly;
    var reason = '';
    if (heavy) {
      reason = '今晚要先回想已经学过的，大约要用 ' + reviewMinutes + ' 分钟，已经到了 ' + SKIP_NEW_SOUND_REVIEW_MINUTES + ' 分钟，所以先不学新声音。';
    } else if (weekly) {
      reason = '这周有一晚只回想，不学新声音。';
    }
    var incoming = skip ? null : nextNewSound(store);
    var watchSound = pickWatchSound(store, now, incoming);
    var steps = skip
      ? (watchSound ? ['listen', 'quiz'] : ['quiz'])
      : ['listen', 'say', 'quiz'];
    return {
      mode: 'evening',
      minutes: EVENING_MINUTES,
      introduceSound: incoming,
      watchSound: watchSound,
      skipNewSound: skip,
      skipReason: reason,
      reviewOnly: skip,
      reviewMinutes: reviewMinutes,
      weeklyReview: weekly,
      heavyReview: heavy,
      quizItems: capQuizItems(quizAll, 'evening', skip),
      mixOldWords: mixOldWords(store, incoming ? incoming.id : null, 4),
      steps: steps,
      allowNewSound: !skip,
      week: currentWeek(store)
    };
  }

  function markReviewOnlyEvening(store, now) {
    var week = currentWeek(store);
    store.reviewOnlyEvenings = store.reviewOnlyEvenings || [];
    store.reviewOnlyEvenings.push({ week: week, date: shanghaiYmd(now) });
    if (allWeekSoundsIntroduced(store, week) && week < 8) {
      store.activeWeek = week + 1;
    }
    return store;
  }

  function recordEveningDate(store, now) {
    store.eveningDates = store.eveningDates || [];
    store.eveningDates.push(shanghaiYmd(now));
    return store;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function embedHtml(entry) {
    if (!entry || !entry.bvid) return '';
    if (entry.mid && entry.mid !== OFFICIAL_MID) return '';
    if (OFFICIAL_BVIDS.indexOf(entry.bvid) === -1) return '';
    var src = officialPlayerSrc(entry.bvid, entry.page || 1);
    var title = entry.title || '芝麻街短片';
    var hint = entry.durationHint ? '<span class="src">' + esc(entry.durationHint) + '</span>' : '';
    return '<div class="player-wrap">' +
      '<p class="player-hint">点一下就能看，不用离开这一页。</p>' +
      '<div class="player-frame">' +
        '<iframe src="' + esc(src) + '" title="' + esc(title) + '" scrolling="no" frameborder="0" allowfullscreen="true" allow="fullscreen; encrypted-media; autoplay"></iframe>' +
      '</div>' +
      '<p class="player-caption">' + esc(title) + hint + '</p>' +
    '</div>';
  }

  function childWatchHtml(sound) {
    if (!sound) return '';
    var clips = sound.sesame || [];
    var html = '';
    if (sound.sesameGap) html += '<p class="fine">' + esc(sound.sesameGap) + '</p>';
    if (sound.parentCue) html += '<p class="parent-inline">' + esc(sound.parentCue) + '</p>';
    if (!clips.length && !sound.sesameGap) html += '<p class="fine">' + esc(NO_OFFICIAL_CLIP) + '</p>';
    clips.forEach(function (clip) { html += embedHtml(clip); });
    return html;
  }

  function formatWordList(sound) {
    return ((sound && sound.words) || []).slice(0, 3).join('、');
  }

  function letterPlaceLabel(sound) {
    var marks = (sound && sound.marks) || [];
    if (marks.length >= 2 && marks[0].length === 1 && marks[1].length === 1) {
      return marks[0] + ' 或 ' + marks[1];
    }
    return marks[0] || (sound && (sound.speak || sound.id)) || '';
  }

  /* 先匹配更长的字母组合，避免 day 只标 a、ship 只标 s。 */
  function highlightWordHtml(word, marks) {
    var text = String(word || '');
    var list = (marks || []).slice().sort(function (a, b) {
      return String(b).length - String(a).length;
    });
    var out = '';
    var i = 0;
    var lower = text.toLowerCase();
    while (i < text.length) {
      var hit = '';
      for (var m = 0; m < list.length; m++) {
        var mark = String(list[m] || '');
        if (!mark) continue;
        if (lower.indexOf(mark.toLowerCase(), i) === i) {
          hit = text.slice(i, i + mark.length);
          break;
        }
      }
      if (hit) {
        out += '<span class="letter-mark">' + esc(hit) + '</span>';
        i += hit.length;
      } else {
        out += esc(text.charAt(i));
        i += 1;
      }
    }
    return out;
  }

  function missionWordsHtml(sound) {
    if (!sound || !sound.words || !sound.words.length) return '';
    var marks = sound.marks || [];
    var items = sound.words.slice(0, 3).map(function (w) {
      var gloss = WORD_GLOSS[w] || '';
      return '<li class="mission-word"><span class="mission-spell">' + highlightWordHtml(w, marks) + '</span>' +
        (gloss ? '<span class="mission-gloss">' + esc(gloss) + '</span>' : '') +
        '</li>';
    }).join('');
    return '<ul class="mission-words">' + items + '</ul>';
  }

  function wordButtonHtml(word, sound, ipaHtml) {
    var gloss = WORD_GLOSS[word] || '';
    var marked = highlightWordHtml(word, (sound && sound.marks) || []);
    return '<button type="button" class="word" data-action="speak" data-say="' + esc(word) + '"><strong>' + marked + '</strong>' + (ipaHtml || '') + '<span>' + esc(gloss) + '</span></button>';
  }

  function listenLead(introduceSound, watchSound) {
    var target = introduceSound || watchSound;
    var words = formatWordList(target);
    var letter = letterPlaceLabel(target);
    var base = '片子是英文的，句子不用都听懂。';
    if (introduceSound) {
      var lead = NICKNAME + '，' + base + '只要注意这个字母反复出现的那个声音。';
      if (!officialClipSound(introduceSound) && watchSound && watchSound.id !== introduceSound.id) {
        lead += '这个新声音暂时没有官方短片，可以再听一口以前的短片，比较这两个声音。';
      }
      lead += '记住以后，再看到 ' + words + ' 这样的词，这个地方的 ' + letter + ' 常常就这样读。';
      return lead;
    }
    return NICKNAME + '，' + base + '再听那个反复出现的声音。再看到这样的词，这个地方还是这样读。';
  }

  function listenHtml(introduceSound, watchSound, extraAfterCue) {
    var sound = introduceSound || null;
    var watch = watchSound || sound;
    var heading = sound ? '今晚记住这一件事' : '再听一遍';
    var missionSound = sound || watch;
    var voice = sound || watch;
    var html = '<h1>' + esc(heading) + '</h1>' +
      '<p class="lead">' + esc(listenLead(sound, watch)) + '</p>';
    if (missionSound) html += missionWordsHtml(missionSound);
    if (voice && voice.cue) html += '<p class="cue">' + esc(voice.cue) + '</p>';
    if (extraAfterCue) html += extraAfterCue;
    if (voice) {
      html += '<div class="actions"><button type="button" class="primary" data-action="speak" data-say="' + esc(voice.speak) + '">听一听</button></div>';
    }
    if (sound) html += childWatchHtml(sound);
    if (watch && (!sound || watch.id !== sound.id)) html += childWatchHtml(watch);
    return html;
  }

  function sayHtml(sound, ipaForWord) {
    if (!sound) return '';
    var sayWords = (sound.words || []).map(function (w) {
      var ipa = typeof ipaForWord === 'function' ? (ipaForWord(w, sound) || '') : '';
      return wordButtonHtml(w, sound, ipa);
    }).join('');
    return '<h1>跟着说</h1>' +
      '<p class="lead">刚才反复出现的，就是这个声音。我们跟着读一遍。</p>' +
      '<p class="lead">以后再看见这样的词，试着在这个地方这样读。</p>' +
      '<p class="cue">' + esc(sound.cue) + '</p>' +
      '<div class="actions"><button type="button" class="primary" data-action="speak" data-say="' + esc(sound.speak) + '">再听一次</button></div>' +
      '<div class="words">' + sayWords + '</div>' +
      '<div class="actions"><button type="button" class="primary" data-action="next">我说了</button></div>';
  }

  function doneHtml() {
    return '<div class="shell">' +
      '<p class="disclaimer">' + esc(DISCLAIMER) + '<span class="build-tip">' + esc(TIP) + '</span></p>' +
      '<p class="who">' + esc(ASSISTANT) + '</p>' +
      '<h1>今天先到这里</h1>' +
      '<p class="lead">' + esc(NICKNAME) + '，你已经走完这一小段。记住的会在一周里再遇见。记住这个读法，以后再遇到带这个字母的词，就试试在这个地方这样读。</p>' +
      '<div class="actions"><button type="button" class="primary" data-action="home">看声音路线</button><a class="ghost" href="../../../index.html">回小屋</a></div>' +
    '</div>';
  }


  var English = {
    TIP: TIP,
    STORAGE_KEY: STORAGE_KEY,
    DISCLAIMER: DISCLAIMER,
    PARENT_NOTE: PARENT_NOTE,
    CHILD: CHILD,
    NICKNAME: NICKNAME,
    ASSISTANT: ASSISTANT,
    EVENING_MINUTES: EVENING_MINUTES,
    MORNING_MINUTES: MORNING_MINUTES,
    SKIP_NEW_SOUND_REVIEW_MINUTES: SKIP_NEW_SOUND_REVIEW_MINUTES,
    REVIEW_MINUTES_PER_ITEM: REVIEW_MINUTES_PER_ITEM,
    MAX_SAME_SESSION_RETRIES: MAX_SAME_SESSION_RETRIES,
    MAX_INTERVAL_DAYS: MAX_INTERVAL_DAYS,
    MAX_STAGE: MAX_STAGE,
    SRS_INTERVALS: SRS_INTERVALS,
    OFFICIAL_GAPS: OFFICIAL_GAPS,
    OFFICIAL_MID: OFFICIAL_MID,
    OFFICIAL_NAME: OFFICIAL_NAME,
    OFFICIAL_BIO: OFFICIAL_BIO,
    OFFICIAL_SPACE: OFFICIAL_SPACE,
    OFFICIAL_SEASON_ID: OFFICIAL_SEASON_ID,
    OFFICIAL_CATALOG_BVID: OFFICIAL_CATALOG_BVID,
    OFFICIAL_STATUS: OFFICIAL_STATUS,
    OFFICIAL_BVIDS: OFFICIAL_BVIDS,
    DEFERRED_SOUNDS: DEFERRED_SOUNDS,
    NO_OFFICIAL_CLIP: NO_OFFICIAL_CLIP,
    MEDIA: MEDIA,
    ALLOWED_URLS: ALLOWED_URLS,
    ALPHABEATS: ALPHABEATS,
    WEEK_PLAN: WEEK_PLAN,
    SOUNDS: SOUNDS,
    WORD_GLOSS: WORD_GLOSS,
    HOME_MISSION: HOME_MISSION,
    highlightWordHtml: highlightWordHtml,
    missionWordsHtml: missionWordsHtml,
    wordButtonHtml: wordButtonHtml,
    listenLead: listenLead,
    listenHtml: listenHtml,
    sayHtml: sayHtml,
    doneHtml: doneHtml,
    formatWordList: formatWordList,
    letterPlaceLabel: letterPlaceLabel,
    soundById: soundById,
    weekByNumber: weekByNumber,
    week1RequiredIds: week1RequiredIds,
    allDocumentedUrls: allDocumentedUrls,
    officialPlayerSrc: officialPlayerSrc,
    biliVideoUrl: biliVideoUrl,
    embedHtml: embedHtml,
    childWatchHtml: childWatchHtml,
    shanghaiParts: shanghaiParts,
    shanghaiYmd: shanghaiYmd,
    shanghaiHour: shanghaiHour,
    suggestMode: suggestMode,
    emptyStore: emptyStore,
    loadStore: loadStore,
    saveStore: saveStore,
    listItems: listItems,
    makeItem: makeItem,
    introduceSound: introduceSound,
    isDueOrUnremembered: isDueOrUnremembered,
    selectQuizItems: selectQuizItems,
    dueSoundIds: dueSoundIds,
    officialClipSound: officialClipSound,
    pickWatchSound: pickWatchSound,
    estimateReviewMinutes: estimateReviewMinutes,
    shouldSkipNewSound: shouldSkipNewSound,
    nextMorningAt: nextMorningAt,
    intervalDaysForStage: intervalDaysForStage,
    nextDueAt: nextDueAt,
    dueAfterMiss: dueAfterMiss,
    applyRecall: applyRecall,
    clampItemSchedule: clampItemSchedule,
    shouldShowIpa: shouldShowIpa,
    currentWeek: currentWeek,
    isWeeklyReviewEvening: isWeeklyReviewEvening,
    nextNewSound: nextNewSound,
    mixOldWords: mixOldWords,
    planSession: planSession,
    markReviewOnlyEvening: markReviewOnlyEvening,
    recordEveningDate: recordEveningDate,
    boot: boot
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = English;
  if (root) {
    root.EnglishEn1 = English;
    root.EnglishEn2 = English;
    root.EnglishEn3 = English;
    root.EnglishEn4 = English;
  }

  function boot() {
    var app = document.getElementById('app');
    if (!app) return;
    var storage = null;
    try { storage = window.localStorage; } catch (e) { storage = null; }
    var persistOk = true;
    var store = loadStore(storage);
    var suggested = suggestMode(new Date());
    var state = {
      screen: 'home',
      mode: suggested,
      plan: null,
      stepIndex: 0,
      sound: null,
      quiz: [],
      quizIndex: 0,
      pendingRequeue: [],
      message: '',
      speechOk: typeof window !== 'undefined' && !!window.speechSynthesis,
      revealedIpa: false
    };

    function writeStore() {
      persistOk = saveStore(store, storage);
    }

    function showFeedback(text) {
      var fb = document.getElementById('xy-feedback');
      if (!fb) return;
      if (!text) {
        fb.hidden = true;
        fb.textContent = '';
        return;
      }
      fb.hidden = false;
      fb.textContent = text;
    }

    function speakEn(text) {
      if (!window.speechSynthesis) {
        state.speechOk = false;
        showFeedback('这台手机暂时不能直接读出来。可以看上面的短片，或请身边的人读给你听。');
        return;
      }
      try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = 0.85;
        var voices = window.speechSynthesis.getVoices() || [];
        var us = null;
        voices.forEach(function (v) {
          if (/^en-US/i.test(v.lang) && !us) us = v;
        });
        if (us) u.voice = us;
        window.speechSynthesis.speak(u);
        showFeedback('嗯，就是这个声音。你也可以跟着轻轻说。');
      } catch (err) {
        state.speechOk = false;
        showFeedback('这台手机暂时不能直接读出来。可以看上面的短片，或请身边的人读给你听。');
      }
    }

    function startSession(mode) {
      state.mode = mode;
      state.plan = planSession(mode, store, new Date());
      state.stepIndex = 0;
      state.sound = state.plan.introduceSound;
      state.watchSound = state.plan.watchSound || state.sound;
      state.quiz = (state.plan.quizItems || []).slice();
      state.quizIndex = 0;
      state.pendingRequeue = [];
      state.revealedIpa = false;
      state.screen = 'session';
      state.message = '';
      if (mode === 'evening') recordEveningDate(store, new Date());
      if (state.sound) introduceSound(store, state.sound.id, new Date());
      store.lastSession = { mode: mode, at: new Date().toISOString(), skipNewSound: state.plan.skipNewSound };
      store.draft = { mode: mode, stepIndex: 0, soundId: state.sound ? state.sound.id : null };
      writeStore();
      render();
      window.scrollTo(0, 0);
    }

    function currentStep() {
      if (!state.plan) return null;
      return state.plan.steps[state.stepIndex] || null;
    }

    function goNext() {
      if (!state.plan) return;
      var step = currentStep();
      if (step === 'listen') state.message = '好听。我们跟着说一遍。';
      else if (step === 'say') state.message = '说得很认真。来做一个小小练习。';
      else state.message = '';
      if (state.stepIndex < state.plan.steps.length - 1) {
        state.stepIndex += 1;
        store.draft = { mode: state.mode, stepIndex: state.stepIndex, soundId: state.sound ? state.sound.id : null };
        writeStore();
        render();
        window.scrollTo(0, 0);
        return;
      }
      finishSession();
    }

    function finishSession() {
      if (state.plan && state.plan.weeklyReview) markReviewOnlyEvening(store, new Date());
      store.draft = null;
      store.lastSession = { mode: state.mode, at: new Date().toISOString(), done: true };
      writeStore();
      state.screen = 'done';
      render();
      window.scrollTo(0, 0);
    }

    function answerQuiz(remembered) {
      var item = state.quiz[state.quizIndex];
      if (!item) return;
      var result = applyRecall(item, remembered, new Date(), state.mode);
      store.items[item.id] = result.item;
      if (result.requeue) {
        state.pendingRequeue.push(result.item);
        state.message = '没关系，我们先放一放，过一会儿再试。你已经很认真了。';
      } else {
        state.message = remembered
          ? '太好了，这个先记住啦。'
          : (result.scheduled === 'tonight' ? '今晚我们再轻轻碰一次，不着急。' : '明天再碰一次就好，你已经很认真了。');
      }
      writeStore();
      state.quizIndex += 1;
      if (state.quizIndex >= state.quiz.length) {
        if (state.pendingRequeue.length) {
          state.quiz = state.pendingRequeue.slice();
          state.pendingRequeue = [];
          state.quizIndex = 0;
        } else {
          finishSession();
          return;
        }
      }
      render();
    }

    function soundStatus(id) {
      var it = store.items[itemId('sound', id)];
      if (!it) return '还没学';
      if (it.remembered && it.stage >= 3) return '会了';
      return '在路上';
    }

    function mapHtml() {
      return WEEK_PLAN.map(function (w) {
        var chips = w.newSounds.map(function (id) {
          var s = soundById(id);
          var st = soundStatus(id);
          var show = shouldShowIpa(store.items[itemId('sound', id)]) ? ' /' + s.ipa + '/' : '';
          return '<span class="chip status-' + (st === '会了' ? 'ok' : st === '在路上' ? 'mid' : 'new') + '">' + esc(s.title) + esc(show) + '<em>' + esc(st) + '</em></span>';
        }).join('');
        return '<section class="week"><h3>第 ' + w.week + ' 周 · ' + esc(w.title) + (w.hasReviewOnlyEvening ? ' · 有一晚只回想' : '') + '</h3><div class="chips">' + chips + '</div></section>';
      }).join('');
    }

    function speechNote() {
      if (state.speechOk) return '<p class="fine">先点「听一听」。有短片就在这一页点一下看，不会自动播放。</p>';
      return '<p class="fine warn">这台手机暂时不能直接读出来。有短片就在这一页看，或请身边的人读给你听。</p>';
    }

    function feedbackSlot() {
      if (state.message) return '<p class="banner" id="xy-feedback">' + esc(state.message) + '</p>';
      return '<p id="xy-feedback" hidden></p>';
    }

    function homeHtml() {
      var suggestLabel = suggested === 'morning' ? '现在更像早上回想的时间' : '现在更像今晚学的时间';
      var morningClass = state.mode === 'morning' ? 'primary' : 'ghost';
      var eveningClass = state.mode === 'evening' ? 'primary' : 'ghost';
      return '<div class="shell">' +
        '<p class="disclaimer">' + esc(DISCLAIMER) + '<span class="build-tip">' + esc(TIP) + '</span></p>' +
        '<p class="who">' + esc(ASSISTANT) + '</p>' +
        '<h1>' + esc(CHILD) + ' · 英语学习</h1>' +
        '<p class="mission-idea">' + esc(HOME_MISSION) + '</p>' +
        '<p class="lead">' + esc(ASSISTANT) + '对 ' + esc(CHILD) + ' / ' + esc(NICKNAME) + ' 说：我们一次只听一个声音，课很短。先听、再说、做一个小练习。做对了我会马上告诉你。熟悉了才看符号。</p>' +
        '<div class="avatars" aria-label="小宇和伍澍暘"><figure><img src="../../avatars/xiaoyu.jpg" alt="小宇"/><figcaption>小宇</figcaption></figure><figure><img src="../../avatars/pengpeng.jpg" alt="伍澍暘"/><figcaption>伍澍暘</figcaption></figure></div>' +
        '<p class="fine hint-mode">' + esc(suggestLabel) + '。想选另一边也可以。</p>' +
        '<div class="actions duo">' +
          '<button type="button" class="' + eveningClass + '" data-action="start" data-mode="evening">今晚学 · 大约 10 分钟</button>' +
          '<button type="button" class="' + morningClass + '" data-action="start" data-mode="morning">早上回想 · 大约 6 分钟</button>' +
        '</div>' +
        '<h2 class="map-title">声音路线</h2>' +
        '<div class="map">' + mapHtml() + '</div>' +
        '<details class="parent"><summary>给爸爸看一眼</summary><p>' + esc(PARENT_NOTE) + '</p><p>官方账号是哔哩哔哩「芝麻街SesameStreet」（mid 1517070574），简介常见「芝麻街唯一官方~」。短片在本页播放，不自动开始。没有官方短片的声音只用本页读音，不用粉丝搬运。</p></details>' +
        (!persistOk ? '<p class="fine warn">这台浏览器暂时不能保存进度，离开页面后要重新开始。</p>' : '') +
        '<div class="actions"><a class="ghost" href="../../../index.html">回小屋</a></div>' +
      '</div>';
    }

    function stepHtml() {
      var plan = state.plan;
      var step = currentStep();
      var sound = state.sound;
      var head = '<p class="disclaimer">' + esc(DISCLAIMER) + '<span class="build-tip">' + esc(TIP) + '</span></p>';
      var talk = '<p class="who">' + esc(ASSISTANT) + ' · ' + (plan.mode === 'morning' ? '早上回想' : '今晚学') + '</p>';
      if (plan.skipNewSound && (step === 'quiz' || step === 'retrieval' || step === 'listen') && plan.skipReason) {
        talk += '<p class="banner">' + esc(plan.skipReason) + '</p>';
      }
      talk += feedbackSlot();
      if (step === 'listen' && (sound || state.watchSound)) {
        var watch = state.watchSound || sound;
        return '<div class="shell">' + head + talk +
          listenHtml(sound, watch, speechNote()) +
          '<div class="actions"><button type="button" class="primary" data-action="next">我听到了</button><button type="button" class="ghost" data-action="home">先回路线</button></div>' +
        '</div>';
      }
      if (step === 'say' && sound) {
        return '<div class="shell">' + head + talk +
          sayHtml(sound, function (w, s) {
            return shouldShowIpa(store.items[itemId('sound', s.id)]) ? ' <span class="ipa">/' + esc(s.ipa) + '/</span>' : '';
          }) +
        '</div>';
      }
      if (step === 'quiz' || step === 'retrieval') {
        var item = state.quiz[state.quizIndex];
        if (!item) {
          return '<div class="shell">' + head + talk +
            '<h1>' + (plan.mode === 'morning' ? '早上先到这里' : '今晚先到这里') + '</h1>' +
            '<p class="lead">这一小段没有要回想的卡片，先休息一下也很好。</p>' +
            '<div class="actions"><button type="button" class="primary" data-action="next">好</button></div>' +
          '</div>';
        }
        var label = item.kind === 'sound' ? (soundById(item.key) ? soundById(item.key).title : item.key) : (item.kind === 'frame' ? (item.frame || '').replace('___', item.word || '') : item.key);
        var say = item.kind === 'sound' ? (soundById(item.key) ? soundById(item.key).speak : item.key) : (item.kind === 'frame' ? label : item.key);
        var sObj = soundById(item.soundId);
        var ipaLine = shouldShowIpa(item) && sObj ? '<p class="ipa-line">这个声音你已经熟了，符号是 <strong>/' + esc(sObj.ipa) + '/</strong>。</p>' : '<p class="fine">先想声音，不必先背符号。</p>';
        return '<div class="shell">' + head + talk +
          '<h1>回想一下</h1>' +
          '<p class="fine">' + (state.quizIndex + 1) + ' / ' + state.quiz.length + '</p>' +
          '<p class="lead">看到这个词，这个地方该怎么读？</p>' +
          '<div class="quiz-card"><strong>' + esc(label) + '</strong></div>' +
          ipaLine +
          '<div class="actions"><button type="button" class="ghost" data-action="speak" data-say="' + esc(say) + '">听一听</button></div>' +
          '<div class="actions duo">' +
            '<button type="button" class="primary" data-action="remember">我会了</button>' +
            '<button type="button" class="ghost" data-action="again">再练一遍</button>' +
          '</div>' +
        '</div>';
      }
      return '<div class="shell">' + head + '<button type="button" class="primary" data-action="home">回路线</button></div>';
    }

    function render() {
      if (state.screen === 'home') app.innerHTML = homeHtml();
      else if (state.screen === 'done') app.innerHTML = doneHtml();
      else app.innerHTML = stepHtml();
    }

    app.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== app && !t.getAttribute('data-action')) t = t.parentNode;
      if (!t || t === app) return;
      var action = t.getAttribute('data-action');
      if (action === 'start') {
        startSession(t.getAttribute('data-mode') || state.mode);
        return;
      }
      if (action === 'home') {
        state.screen = 'home';
        state.message = '';
        render();
        return;
      }
      if (action === 'next') {
        goNext();
        return;
      }
      if (action === 'speak') {
        speakEn(t.getAttribute('data-say') || '');
        return;
      }
      if (action === 'remember') {
        answerQuiz(true);
        return;
      }
      if (action === 'again') {
        answerQuiz(false);
        return;
      }
    });

    render();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  }
})(typeof window !== 'undefined' ? window : globalThis);
