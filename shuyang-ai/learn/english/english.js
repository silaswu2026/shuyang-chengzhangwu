/* 成长屋英语学习 · 家庭陪伴短课。缓存 en1。
   只写 localStorage 键 xygo-english-en1，不碰方块小世界或其他课的存档。
   发音按美式英语 General American。芝麻街/BBC 只给新标签页观看链接，不转载、不下载体、不热链。 */
(function (root) {
  'use strict';

  var TIP = 'en1';
  var STORAGE_KEY = 'xygo-english-en1';
  var CHILD = '伍澍暘';
  var NICKNAME = '芃芃';
  var ASSISTANT = '小宇';
  var DISCLAIMER = '这是成长屋家庭陪伴计划，不是芝麻街官方课程，也不是学习诊断。芝麻街教的是字母怎么读、怎么发音，不是学校那张国际音标表。';
  var PARENT_NOTE = '发音按美式英语（General American）。有些元音和中国课本里的英式 RP 音标不一样：比如 octopus、hot 在美式里是 /ɑ/，BBC 片段里 lot 用 /ɒ/；美式有 /ɝ/ /ɚ/，英式 RP 是 /ɜː/ /ə/。';
  var EVENING_MINUTES = 20;
  var MORNING_MINUTES = 10;
  var SKIP_NEW_SOUND_REVIEW_MINUTES = 12;
  var REVIEW_MINUTES_PER_ITEM = 2;
  var MAX_SAME_SESSION_RETRIES = 2;
  var TIMEZONE = 'Asia/Shanghai';

  /* 成功回想后的间隔：明天早上 → 2 天 → 5 天 → 10 天 → 21 天。页面上不出现 Anki / FSRS / SM-2。 */
  var SRS_INTERVALS = [
    { stage: 1, id: 'next-morning', label: '明天早上' },
    { stage: 2, id: '2-days', days: 2, label: '2 天后再见' },
    { stage: 3, id: '5-days', days: 5, label: '5 天后再见' },
    { stage: 4, id: '10-days', days: 10, label: '10 天后再见' },
    { stage: 5, id: '21-days', days: 21, label: '21 天后再见' }
  ];

  var OFFICIAL_GAPS = [
    'no main-channel sh/th shorts',
    'no Magic e / silent e — Sesame does not teach Magic e or silent e; do not claim it does',
    'no official IPA symbol lessons',
    'no current official Chinese 音标 series',
    'no usable standalone main-channel Letter T/U of the Day'
  ];

  var DEFERRED_SOUNDS = ['z', 'ʒ', 'ŋ', 'ɔɪ'];

  var MEDIA = {
    alphabeats: { title: 'Alphabeats', url: 'https://www.youtube.com/watch?v=R6xGXPUN-tw', source: 'Sesame Street', kind: 'spine', note: '~2:23，字母发音主线' },
    abcRap: { title: 'Do the ABC Rap!', url: 'https://www.youtube.com/watch?v=X4PuMMbJkHs', source: 'Sesame Street', kind: 'spine', note: '~36s' },
    letterA: { title: 'Letter of the Day · A', url: 'https://www.youtube.com/watch?v=GEQfcjWAsvI', source: 'Sesame Street', kind: 'letter' },
    letterB: { title: 'Letter of the Day · B', url: 'https://www.youtube.com/watch?v=3lfL0ZTtnD4', source: 'Sesame Street', kind: 'letter' },
    letterC: { title: 'Letter of the Day · C', url: 'https://www.youtube.com/watch?v=toSm_flWhyE', source: 'Sesame Street', kind: 'letter' },
    letterD: { title: 'Letter of the Day · D', url: 'https://www.youtube.com/watch?v=dkIwwj41yZE', source: 'Sesame Street', kind: 'letter' },
    letterE: { title: 'Letter of the Day · E', url: 'https://www.youtube.com/watch?v=BZETT0t62Kg', source: 'Sesame Street', kind: 'letter' },
    letterF: { title: 'Letter of the Day · F', url: 'https://www.youtube.com/watch?v=2QRc8Ht07kk', source: 'Sesame Street', kind: 'letter' },
    letterH: { title: 'Letter of the Day · H', url: 'https://www.youtube.com/watch?v=-Wlv_Ow9UaM', source: 'Sesame Street', kind: 'letter' },
    letterI: { title: 'Letter of the Day · I', url: 'https://www.youtube.com/watch?v=6uAbZ8Brtqk', source: 'Sesame Street', kind: 'letter' },
    letterJ: { title: 'Letter of the Day · J', url: 'https://www.youtube.com/watch?v=sMzG8vCBKp4', source: 'Sesame Street', kind: 'letter' },
    letterM: { title: 'Letter of the Day · M', url: 'https://www.youtube.com/watch?v=SKoJUU_6fII', source: 'Sesame Street', kind: 'letter' },
    letterO: { title: 'Letter O Song', url: 'https://www.youtube.com/watch?v=JABFGF8Uy4c', source: 'Sesame Street', kind: 'letter' },
    letterP: { title: 'Letter of the Day · P', url: 'https://www.youtube.com/watch?v=BTEMHdvRaFI', source: 'Sesame Street', kind: 'letter' },
    letterS: { title: 'Letter S Song', url: 'https://www.youtube.com/watch?v=5dRnXZDVhO0', source: 'Sesame Street', kind: 'letter' },
    elmoAtoZ: { title: "Elmo's Letter of the Day A to Z", url: 'https://www.youtube.com/watch?v=SG0cFj-6LZg', source: 'Sesame Street', kind: 'compilation', note: '~21:31，合集，不当一晚作业' },
    elmoLetterNumber: { title: "Elmo's Letter & Number of the Day", url: 'https://www.youtube.com/watch?v=Mhpt4FUheT0', source: 'Sesame Street', kind: 'compilation', note: '~40 分钟；Letter T 约 30:10，Letter U 约 33:50。合集，不当一晚作业' },
    loveLetterE: { title: 'I Love the Letter E', url: 'https://www.youtube.com/watch?v=A2jY4ot71zc', source: 'Sesame Street', kind: 'two-sounds', note: '官方短片：E 有两个声音（短 eh / 长 ee）' },
    applesBananas: { title: 'Apples & Bananas', url: 'https://www.youtube.com/watch?v=h6tnEqnlVQs', source: 'Sesame Street', kind: 'library' },
    cInClouds: { title: 'C in the Clouds', url: 'https://www.youtube.com/watch?v=22ofSuWOyDc', source: 'Sesame Street', kind: 'letter' },
    tIsTurtle: { title: 'T is for Turtle', url: 'https://www.youtube.com/watch?v=nrf4kIl5nHs', source: 'Sesame Street', kind: 'letter', note: '认字母 T；主频道没有单独的 Letter T of the Day' },
    hiddenLetterU: { title: 'Find the Hidden Letter U', url: 'https://www.youtube.com/watch?v=pqAzXCOOD3Q', source: 'Sesame Street', kind: 'letter', note: '认字母 U，不是系统的 /ʌ/ 或 /u/ 课' },
    alphabetSong: { title: 'Sing the Alphabet Song', url: 'https://www.youtube.com/watch?v=783EsrHchXA', source: 'Sesame Street', kind: 'library', note: '资料库，不当一晚作业' },
    aToZSongs: { title: 'A to Z Songs compilation', url: 'https://www.youtube.com/watch?v=IMWC6ngKMCU', source: 'Sesame Street', kind: 'library', note: '资料库，不当一晚作业' },
    abcPlaylist: { title: 'ABC Songs playlist', url: 'https://www.youtube.com/playlist?list=PL8TioFHubWFuCvIbOxUvtarPispHKYgu5', source: 'Sesame Street', kind: 'library', note: '播放列表，不当一晚作业' },
    lettersPlaylist: { title: 'Learn the Letters playlist', url: 'https://www.youtube.com/playlist?list=PL8TioFHubWFtBJVeUK4Al9LOpmGzhQbEo', source: 'Sesame Street', kind: 'library', note: '播放列表，不当一晚作业' },
    sesameChannel: { title: 'Sesame Street 频道', url: 'https://www.youtube.com/@sesamestreet', source: 'Sesame Street', kind: 'library' },
    sesameSite: { title: 'sesamestreet.org', url: 'https://www.sesamestreet.org', source: 'Sesame Street', kind: 'site' },
    sesameGames: { title: 'Sesame Street Games', url: 'https://www.sesamestreet.org/games', source: 'Sesame Street', kind: 'site', note: 'Letter Dance Party 是认字母，不是音标课；不深链未核对的游戏编号' },
    sesameWorkshop: { title: 'Sesame Workshop', url: 'https://sesameworkshop.org/', source: 'Sesame Workshop', kind: 'site' },
    pbsParents: { title: 'PBS Parents · Sesame Street', url: 'https://www.pbs.org/parents/shows/sesame-street', source: 'PBS', kind: 'site' },
    charliesCh: { title: "Charlie's Ch Sounds", url: 'https://www.youtube.com/watch?v=Ky81MwcLrXE', source: 'Sesame Street Classics', kind: 'classics', note: '芝麻街经典频道，不是主频道' },
    bbcHub: { title: 'BBC Learning English 发音合集入口', url: 'https://www.bbc.com/learningenglish/features/box-sets/ep1-20124', source: 'BBC Learning English', kind: 'bbc-hub', label: '补充，不是芝麻街' },
    bbcLong: { title: 'BBC 发音长合集', url: 'https://www.youtube.com/watch?v=QxQUapA-2w4', source: 'BBC Learning English', kind: 'library', label: '补充，不是芝麻街', note: '约 75 分钟，不当一晚作业' },
    bbcAe: { title: '/æ/', url: 'https://www.youtube.com/watch?v=qVhaIHk88a8', source: 'BBC Learning English', kind: 'bbc', label: '补充，不是芝麻街' },
    bbcE: { title: '/ɛ/（片名叫 /e/）', url: 'https://www.youtube.com/watch?v=hLN1cdSTDo8', source: 'BBC Learning English', kind: 'bbc', label: '补充，不是芝麻街' },
    bbcI: { title: '/ɪ/', url: 'https://www.youtube.com/watch?v=TNFKG0yvDx4', source: 'BBC Learning English', kind: 'bbc', label: '补充，不是芝麻街' },
    bbcStrut: { title: '/ʌ/', url: 'https://www.youtube.com/watch?v=PZwKFFp7V50', source: 'BBC Learning English', kind: 'bbc', label: '补充，不是芝麻街' },
    bbcLot: { title: '/ɒ/（英式 lot；美式 octopus 更接近 /ɑ/）', url: 'https://www.youtube.com/watch?v=MAk-XtHsyzM', source: 'BBC Learning English', kind: 'bbc', label: '补充，不是芝麻街' },
    bbcIi: { title: '/i/', url: 'https://www.youtube.com/watch?v=RZmGzSb-6OM', source: 'BBC Learning English', kind: 'bbc', label: '补充，不是芝麻街' },
    bbcP: { title: '/p/', url: 'https://www.youtube.com/watch?v=AZRREr7DqqM', source: 'BBC Learning English', kind: 'bbc', label: '补充，不是芝麻街' },
    bbcB: { title: '/b/', url: 'https://www.youtube.com/watch?v=yP7aCKO6bTE', source: 'BBC Learning English', kind: 'bbc', label: '补充，不是芝麻街' },
    bbcM: { title: '/m/', url: 'https://www.youtube.com/watch?v=0Te4Us8Tsv8', source: 'BBC Learning English', kind: 'bbc', label: '补充，不是芝麻街' },
    bbcT: { title: '/t/', url: 'https://www.youtube.com/watch?v=0T1QYByMxrs', source: 'BBC Learning English', kind: 'bbc', label: '补充，不是芝麻街' },
    bbcF: { title: '/f/', url: 'https://www.youtube.com/watch?v=vE12RFyH-hY', source: 'BBC Learning English', kind: 'bbc', label: '补充，不是芝麻街' },
    bbcS: { title: '/s/', url: 'https://www.youtube.com/watch?v=QtH3vRXmvvo', source: 'BBC Learning English', kind: 'bbc', label: '补充，不是芝麻街' },
    bbcH: { title: '/h/', url: 'https://www.youtube.com/watch?v=DM_gN6imoC8', source: 'BBC Learning English', kind: 'bbc', label: '补充，不是芝麻街' },
    bbcTsh: { title: '/tʃ/', url: 'https://www.youtube.com/watch?v=PykxZ5kkrjs', source: 'BBC Learning English', kind: 'bbc', label: '补充，不是芝麻街' },
    bbcSh: { title: '/ʃ/', url: 'https://www.youtube.com/watch?v=NF92RdZC6wE', source: 'BBC Learning English', kind: 'bbc', label: '补充，不是芝麻街' },
    bbcThvl: { title: '/θ/', url: 'https://www.youtube.com/watch?v=b4Aj3k65HSo', source: 'BBC Learning English', kind: 'bbc', label: '补充，不是芝麻街' },
    bbcThvd: { title: '/ð/', url: 'https://www.youtube.com/watch?v=tu1t3Fn5Lw8', source: 'BBC Learning English', kind: 'bbc', label: '补充，不是芝麻街' }
  };

  var ALLOWED_URLS = [];
  Object.keys(MEDIA).forEach(function (k) {
    ALLOWED_URLS.push(MEDIA[k].url);
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
    for (var i = 0; i < keys.length; i++) {
      if (MEDIA[keys[i]]) out.push(MEDIA[keys[i]]);
    }
    return out;
  }

  var SOUNDS = [
    { id: 'm', ipa: 'm', title: '嘴唇音 m', week: 1, cue: '嘴唇先闭上，再张开。', speak: 'm', words: ['mom', 'map', 'me'], sesame: mediaList('letterM', 'alphabeats'), bbc: mediaList('bbcM'), builder: { type: 'group', prompt: '把三个都有这个声音的词放在一起。', words: ['mom', 'map', 'me'], rule: '嘴唇闭上再张开，就是这个声音。' } },
    { id: 'n', ipa: 'n', title: '鼻子音 n', week: 1, cue: '舌尖抵住上牙龈，气从鼻子出来。', speak: 'n', words: ['no', 'net', 'nap'], sesame: mediaList('alphabeats'), bbc: [], sesameGap: '芝麻街主频道暂时没有单独的 Letter N 短片，今晚先听，再用页面上的读音。', builder: { type: 'group', prompt: '找出三个都有 n 声音的词。', words: ['no', 'net', 'nap'], rule: '舌尖抵住，气从鼻子走。' } },
    { id: 'b', ipa: 'b', title: '爆破音 b', week: 1, cue: '嘴唇闭上，再轻轻爆开，声带要振动。', speak: 'b', words: ['bed', 'bus', 'big'], sesame: mediaList('letterB'), bbc: mediaList('bbcB'), builder: { type: 'sort', prompt: '把 b 和 p 分开。b 会振动，p 不振动。', words: ['bed', 'bus', 'pen'], rule: 'b 和 p 嘴巴动作很像，b 嗓子会响。' } },
    { id: 'p', ipa: 'p', title: '爆破音 p', week: 1, cue: '嘴唇闭上，再轻轻爆开，送一口气。', speak: 'p', words: ['pen', 'cup', 'map'], sesame: mediaList('letterP'), bbc: mediaList('bbcP'), builder: { type: 'sort', prompt: '把带 p 的词放一起。', words: ['pen', 'cup', 'map'], rule: 'p 送一口气，嗓子不振动。' } },
    { id: 't', ipa: 't', title: '舌尖音 t', week: 1, cue: '舌尖轻轻弹一下上牙龈。', speak: 't', words: ['ten', 'cat', 'hat'], sesame: mediaList('tIsTurtle', 'elmoLetterNumber'), bbc: mediaList('bbcT'), sesameGap: '主频道没有单独的 Letter T of the Day，可用《T is for Turtle》，或在合集里大约 30:10 看 Letter T。', builder: { type: 'group', prompt: '三个词里都有 t，把它们放一起。', words: ['ten', 'cat', 'hat'], rule: '舌尖弹一下，就是 t。' } },
    { id: 'd', ipa: 'd', title: '舌尖音 d', week: 1, cue: '舌尖弹一下，嗓子要振动。', speak: 'd', words: ['dad', 'dog', 'bed'], sesame: mediaList('letterD'), bbc: [], sesameGap: '没有单独的 BBC /d/ 短片在许可名单里，今晚用页面读音和芝麻街 Letter D。', builder: { type: 'sort', prompt: '把 t 和 d 分开。d 会振动。', words: ['dad', 'dog', 'ten'], rule: 'd 和 t 位置很像，d 嗓子会响。' } },
    { id: 's', ipa: 's', title: '气流音 s', week: 2, cue: '牙齿靠近，送出细细的气。', speak: 's', words: ['sun', 'sit', 'bus'], sesame: mediaList('letterS'), bbc: mediaList('bbcS'), builder: { type: 'group', prompt: '把三个有 s 的词放一起。', words: ['sun', 'sit', 'bus'], rule: '细细的气流，就是 s。' } },
    { id: 'k', ipa: 'k', title: '后口音 k', week: 2, cue: '舌头后部抬起，再放开。C cake 也是这个音。', speak: 'k', words: ['cat', 'cake', 'cup'], sesame: mediaList('letterC', 'cInClouds'), bbc: [], builder: { type: 'rule', prompt: '用一句话说出这条摆关规则。', words: ['cat', 'cake', 'cup'], rule: '字母 C 在 cake 里读 /k/。' } },
    { id: 'g', ipa: 'g', title: '后口音 g', week: 2, cue: '和 k 位置相近，但嗓子要振动。', speak: 'g', words: ['go', 'big', 'gum'], sesame: mediaList('alphabeats'), bbc: [], sesameGap: '芝麻街主频道暂时没有单独的 Letter G 短片，今晚先听页面读音。', builder: { type: 'sort', prompt: '把 k 和 g 分开。g 会振动。', words: ['go', 'big', 'cat'], rule: 'g 和 k 位置很像，g 嗓子会响。' } },
    { id: 'h', ipa: 'h', title: '呵气音 h', week: 2, cue: '轻轻呵一口气。', speak: 'h', words: ['hat', 'hot', 'house'], sesame: mediaList('letterH'), bbc: mediaList('bbcH'), builder: { type: 'group', prompt: '三个词都有 h，放一起。', words: ['hat', 'hot', 'house'], rule: '轻轻呵气，就是 h。' } },
    { id: 'i', ipa: 'i', title: '长元音 ee', week: 2, cue: '嘴角拉开，声音拉长，像 see。', speak: 'ee', words: ['see', 'me', 'eat'], sesame: mediaList('alphabeats', 'loveLetterE'), bbc: mediaList('bbcIi'), builder: { type: 'group', prompt: '把 see、me、eat 放一起。', words: ['see', 'me', 'eat'], rule: '嘴角拉开、声音拉长，就是这个音。' } },
    { id: 'u', ipa: 'u', title: '长元音 oo', week: 2, cue: '嘴唇收圆，声音拉长，像 food。', speak: 'oo', words: ['food', 'too', 'moon'], sesame: mediaList('alphabeats'), bbc: [], sesameGap: '《Find the Hidden Letter U》是认字母 U，不是系统的 /u/ 课。今晚先听页面读音。', builder: { type: 'group', prompt: '三个拉长的 oo 放一起。', words: ['food', 'too', 'moon'], rule: '嘴唇收圆再拉长，像 food。' } },
    { id: 'ɑ', ipa: 'ɑ', title: '开口音 ah', week: 2, cue: '嘴巴张开，像美式 hot、octopus。', speak: 'ah', words: ['hot', 'octopus', 'box'], sesame: mediaList('letterO'), bbc: mediaList('bbcLot'), parentCue: '美式 octopus / hot 是 /ɑ/。BBC 这条讲的是英式 lot /ɒ/，只作对照补充。', builder: { type: 'rule', prompt: '用一句话说出这条规则。', words: ['hot', 'octopus', 'box'], rule: '美式 hot、octopus 嘴巴张得比较开，是 /ɑ/。' } },
    { id: 'ɪ', ipa: 'ɪ', title: '短元音 ih', week: 3, cue: '比 see 更短、更松，像 sit。', speak: 'ih', words: ['sit', 'inchworm', 'big'], sesame: mediaList('letterI', 'alphabeats'), bbc: mediaList('bbcI'), contrastWith: 'i', builder: { type: 'sort', prompt: '把 sit 和 see 分开：一个短，一个长。', words: ['sit', 'big', 'see'], rule: 'sit 短而松，see 长而亮。' } },
    { id: 'æ', ipa: 'æ', title: '扁口音 a', week: 3, cue: '嘴巴横着张开，像 cat、alligator。', speak: 'a', words: ['cat', 'alligator', 'map'], sesame: mediaList('letterA', 'alphabeats'), bbc: mediaList('bbcAe'), builder: { type: 'group', prompt: '把 cat、map、alligator 放一起。', words: ['cat', 'alligator', 'map'], rule: 'Alphabeats 里 A 是 alligator 的 /æ/。' } },
    { id: 'ɛ', ipa: 'ɛ', title: '短元音 eh', week: 3, cue: '像 egg、bed。字母 E 还有一个长音 ee。', speak: 'eh', words: ['bed', 'egg', 'red'], sesame: mediaList('letterE', 'loveLetterE', 'alphabeats'), bbc: mediaList('bbcE'), twoSoundsE: true, builder: { type: 'sort', prompt: 'E 有两个声音：egg 的 eh，和 see 的 ee。把它们分开。', words: ['egg', 'bed', 'see'], rule: '《I Love the Letter E》说 E 有两个声音：短 eh 和长 ee。芝麻街没有教 Magic e / silent e。' } },
    { id: 'ʌ', ipa: 'ʌ', title: '短元音 uh', week: 4, cue: '嘴巴放松，像 cup、umbrella。', speak: 'uh', words: ['cup', 'umbrella', 'sun'], sesame: mediaList('alphabeats', 'hiddenLetterU'), bbc: mediaList('bbcStrut'), sesameGap: '《Find the Hidden Letter U》是认字母，不是系统的 /ʌ/ 课。', builder: { type: 'group', prompt: '三个短 uh 放一起。', words: ['cup', 'umbrella', 'sun'], rule: 'Alphabeats 里 U 是 umbrella 的 /ʌ/。' } },
    { id: 'ʊ', ipa: 'ʊ', title: '短元音 oo', week: 4, cue: '比 food 更短、更松，像 book。', speak: 'oo', words: ['book', 'good', 'put'], sesame: [], bbc: [], sesameGap: '许可名单里没有单独的芝麻街 /ʊ/ 短片，今晚先听页面读音，再和 food 的长 oo 比一比。', contrastWith: 'u', builder: { type: 'sort', prompt: '把 book 和 food 分开：一个短，一个长。', words: ['book', 'good', 'food'], rule: 'book 短而松，food 长而圆。' } },
    { id: 'f', ipa: 'f', title: '咬唇音 f', week: 5, cue: '上牙轻轻咬住下唇，送气。', speak: 'f', words: ['food', 'fan', 'if'], sesame: mediaList('letterF'), bbc: mediaList('bbcF'), builder: { type: 'sort', prompt: '把 f 和 v 分开。v 会振动。', words: ['food', 'fan', 'van'], rule: 'f 和 v 嘴巴很像，f 只送气。' } },
    { id: 'v', ipa: 'v', title: '咬唇音 v', week: 5, cue: '上牙轻轻咬住下唇，嗓子振动。', speak: 'v', words: ['van', 'five', 'have'], sesame: mediaList('alphabeats'), bbc: [], sesameGap: '芝麻街主频道暂时没有单独的 Letter V 短片，今晚先听页面读音。', builder: { type: 'sort', prompt: '把 f 和 v 分开。', words: ['van', 'five', 'fan'], rule: 'v 和 f 嘴巴很像，v 嗓子会响。' } },
    { id: 'ʃ', ipa: 'ʃ', title: 'shh 音', week: 5, cue: '嘴唇稍圆，送出 shh。', speak: 'sh', words: ['ship', 'fish', 'shoe'], sesame: [], bbc: mediaList('bbcSh'), sesameGap: '芝麻街主频道没有单独的 sh 短片，今晚用标注过的 BBC 补充，不是芝麻街。', builder: { type: 'sort', prompt: '把 ship 和 chip 分开。', words: ['ship', 'fish', 'chip'], rule: 'ship 是 shh，chip 前面多一个轻轻的 t。' } },
    { id: 'tʃ', ipa: 'tʃ', title: 'ch 音', week: 5, cue: '先轻轻堵住，再放出 shh，像 chip。', speak: 'ch', words: ['chip', 'chin', 'lunch'], sesame: mediaList('charliesCh'), bbc: mediaList('bbcTsh'), builder: { type: 'group', prompt: '三个 ch 放一起。', words: ['chip', 'chin', 'lunch'], rule: 'Charlie\'s Ch Sounds 来自芝麻街经典频道，不是主频道。' } },
    { id: 'dʒ', ipa: 'dʒ', title: 'j 音', week: 6, cue: '和 ch 位置相近，但嗓子要振动，像 jump。', speak: 'j', words: ['jump', 'jam', 'juice'], sesame: mediaList('letterJ'), bbc: [], builder: { type: 'group', prompt: '三个 j 声音放一起。', words: ['jump', 'jam', 'juice'], rule: 'j 和 ch 位置很像，j 嗓子会响。' } },
    { id: 'θ', ipa: 'θ', title: '咬舌音 th（轻）', week: 6, cue: '舌尖轻轻伸到上下牙之间，只送气，像 thin。', speak: 'th', words: ['thin', 'three', 'bath'], sesame: [], bbc: mediaList('bbcThvl'), sesameGap: '芝麻街主频道没有单独的 th 短片，今晚用标注过的 BBC 补充，不是芝麻街。', builder: { type: 'sort', prompt: '把 thin 和 this 分开：一个只送气，一个会振动。', words: ['thin', 'three', 'this'], rule: 'thin 只送气，this 嗓子会响。' } },
    { id: 'ð', ipa: 'ð', title: '咬舌音 th（浊）', week: 6, cue: '舌头位置和 thin 一样，但嗓子要振动，像 this。', speak: 'th', words: ['this', 'that', 'the'], sesame: [], bbc: mediaList('bbcThvd'), sesameGap: '芝麻街主频道没有单独的 th 短片，今晚用标注过的 BBC 补充，不是芝麻街。', builder: { type: 'sort', prompt: '把 this 和 thin 分开。', words: ['this', 'that', 'thin'], rule: 'this、that 会振动，thin 只送气。' } },
    { id: 'r', ipa: 'r', title: '美式 r', week: 7, cue: '舌尖不要碰到牙，舌中微微抬起，像 red。', speak: 'r', words: ['red', 'run', 'car'], sesame: mediaList('alphabeats'), bbc: [], sesameGap: '许可名单里没有单独的 Letter R 短片，今晚先听页面读音。', builder: { type: 'sort', prompt: '把 r 和 l 分开。', words: ['red', 'run', 'like'], rule: 'r 舌尖不碰牙，l 舌尖要抵住。' } },
    { id: 'l', ipa: 'l', title: '边音 l', week: 7, cue: '舌尖抵住上牙龈，气从两边走，像 like。', speak: 'l', words: ['like', 'lip', 'ball'], sesame: mediaList('alphabeats'), bbc: [], sesameGap: '许可名单里没有单独的 Letter L 短片，今晚先听页面读音。', builder: { type: 'sort', prompt: '把 l 和 r 分开。', words: ['like', 'lip', 'red'], rule: 'l 舌尖抵住，r 舌尖不碰牙。' } },
    { id: 'eɪ', ipa: 'eɪ', title: '双元音 ay', week: 7, cue: '从 eh 滑向 ee，像 cake、day。', speak: 'ay', words: ['late', 'cake', 'day'], sesame: mediaList('letterA', 'applesBananas'), bbc: [], builder: { type: 'group', prompt: '三个 ay 放一起。', words: ['late', 'cake', 'day'], rule: '先 eh 再滑向 ee。不是 Magic e 课，芝麻街没有教 silent e。' } },
    { id: 'aɪ', ipa: 'aɪ', title: '双元音 eye', week: 7, cue: '从 ah 滑向 ee，像 like。', speak: 'eye', words: ['like', 'my', 'kite'], sesame: mediaList('letterI', 'applesBananas'), bbc: [], builder: { type: 'group', prompt: '三个 eye 放一起。', words: ['like', 'my', 'kite'], rule: '从开口滑到 ee。' } },
    { id: 'oʊ', ipa: 'oʊ', title: '双元音 oh', week: 8, cue: '从 o 滑向 oo，像 go。', speak: 'oh', words: ['go', 'home', 'boat'], sesame: mediaList('letterO', 'applesBananas'), bbc: [], builder: { type: 'group', prompt: '三个 oh 放一起。', words: ['go', 'home', 'boat'], rule: '从 o 滑向 oo，像 go。' } },
    { id: 'aʊ', ipa: 'aʊ', title: '双元音 ow', week: 8, cue: '从 ah 滑向 oo，像 house。', speak: 'ow', words: ['house', 'out', 'now'], sesame: mediaList('applesBananas'), bbc: [], builder: { type: 'group', prompt: '三个 ow 放一起。', words: ['house', 'out', 'now'], rule: '从 ah 滑向 oo，像 house。' } }
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

  /* —— 上海时间 —— */
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

  /* —— 存档 —— */
  function emptyStore() {
    return {
      version: 1,
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

  function estimateReviewMinutes(storeOrItems, now) {
    return selectQuizItems(storeOrItems, now).length * REVIEW_MINUTES_PER_ITEM;
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

  function nextDueAt(stage, now) {
    now = now ? new Date(now) : new Date();
    if (stage <= 1) return nextMorningAt(now);
    var row = null;
    SRS_INTERVALS.forEach(function (r) { if (r.stage === stage) row = r; });
    var days = row && row.days ? row.days : 21;
    return addDays(now, days);
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
      if (nextStage > 5) nextStage = 5;
      copy.stage = nextStage;
      copy.remembered = true;
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

  function planSession(mode, store, now) {
    now = now ? new Date(now) : new Date();
    store = store || emptyStore();
    var quiz = selectQuizItems(store, now);
    var reviewMinutes = quiz.length * REVIEW_MINUTES_PER_ITEM;
    if (mode === 'morning') {
      return {
        mode: 'morning',
        minutes: MORNING_MINUTES,
        introduceSound: null,
        skipNewSound: true,
        skipReason: '早上只回想，不学新声音。',
        reviewOnly: true,
        reviewMinutes: reviewMinutes,
        quizItems: quiz,
        mixOldWords: mixOldWords(store, null, 6),
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
    var steps = skip
      ? ['mix', 'quiz']
      : ['listen', 'say', 'practice', 'words', 'builder', 'mix', 'quiz'];
    return {
      mode: 'evening',
      minutes: EVENING_MINUTES,
      introduceSound: incoming,
      skipNewSound: skip,
      skipReason: reason,
      reviewOnly: skip,
      reviewMinutes: reviewMinutes,
      weeklyReview: weekly,
      heavyReview: heavy,
      quizItems: quiz,
      mixOldWords: mixOldWords(store, incoming ? incoming.id : null, 6),
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

  /* —— 页面 —— */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function linkHtml(entry) {
    if (!entry || !entry.url) return '';
    var label = entry.label ? entry.label : (entry.source || '观看');
    var title = entry.title || entry.url;
    var extra = '';
    if (entry.source === 'Sesame Street Classics') extra = ' · 芝麻街经典频道，不是主频道';
    if (entry.label === '补充，不是芝麻街') extra = ' · 补充，不是芝麻街';
    return '<a class="watch" href="' + esc(entry.url) + '" target="_blank" rel="noopener noreferrer">去看：' + esc(title) + '<span class="src">' + esc(label + extra) + '</span></a>';
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
    SRS_INTERVALS: SRS_INTERVALS,
    OFFICIAL_GAPS: OFFICIAL_GAPS,
    DEFERRED_SOUNDS: DEFERRED_SOUNDS,
    MEDIA: MEDIA,
    ALLOWED_URLS: ALLOWED_URLS,
    ALPHABEATS: ALPHABEATS,
    WEEK_PLAN: WEEK_PLAN,
    SOUNDS: SOUNDS,
    WORD_GLOSS: WORD_GLOSS,
    soundById: soundById,
    weekByNumber: weekByNumber,
    week1RequiredIds: week1RequiredIds,
    allDocumentedUrls: allDocumentedUrls,
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
    estimateReviewMinutes: estimateReviewMinutes,
    shouldSkipNewSound: shouldSkipNewSound,
    nextMorningAt: nextMorningAt,
    nextDueAt: nextDueAt,
    dueAfterMiss: dueAfterMiss,
    applyRecall: applyRecall,
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
  if (root) root.EnglishEn1 = English;

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

    function speakEn(text) {
      if (!window.speechSynthesis) {
        state.speechOk = false;
        render();
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
      } catch (err) {
        state.speechOk = false;
        render();
      }
    }

    function startSession(mode) {
      state.mode = mode;
      state.plan = planSession(mode, store, new Date());
      state.stepIndex = 0;
      state.sound = state.plan.introduceSound;
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
        state.message = '先放一放，过一会儿再试一次。不要连着敲同一道。';
      } else {
        state.message = remembered ? '好，先记在路上。' : (result.scheduled === 'tonight' ? '今晚再碰一次。' : '明天再碰一次。');
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
      if (state.speechOk) return '<p class="fine">点「听一听」，用美式英语读出来。芝麻街或 BBC 片子要在新标签页打开，和爸爸一起看。</p>';
      return '<p class="fine warn">这台手机暂时不能直接读出来。可以点旁边的观看链接，和爸爸一起听。</p>';
    }

    function watchList(sound) {
      if (!sound) return '';
      var links = [];
      (sound.sesame || []).forEach(function (m) { links.push(linkHtml(m)); });
      (sound.bbc || []).forEach(function (m) { links.push(linkHtml(m)); });
      var gap = sound.sesameGap ? '<p class="fine">' + esc(sound.sesameGap) + '</p>' : '';
      var parent = sound.parentCue ? '<p class="parent-inline">' + esc(sound.parentCue) + '</p>' : '';
      if (!links.length) return gap + parent;
      return gap + parent + '<div class="watches">' + links.join('') + '</div>';
    }

    function wordCard(word, sound) {
      var gloss = WORD_GLOSS[word] || '';
      var ipa = sound && shouldShowIpa(store.items[itemId('sound', sound.id)]) ? ' <span class="ipa">/' + esc(sound.ipa) + '/</span>' : '';
      return '<button type="button" class="word" data-action="speak" data-say="' + esc(word) + '"><strong>' + esc(word) + '</strong>' + ipa + '<span>' + esc(gloss) + '</span></button>';
    }

    function homeHtml() {
      var suggestLabel = suggested === 'morning' ? '现在更像早上回想的时间' : '现在更像今晚学的时间';
      var morningClass = state.mode === 'morning' ? 'primary' : 'ghost';
      var eveningClass = state.mode === 'evening' ? 'primary' : 'ghost';
      return '<div class="shell">' +
        '<p class="disclaimer">' + esc(DISCLAIMER) + '<span class="build-tip">' + esc(TIP) + '</span></p>' +
        '<p class="who">' + esc(ASSISTANT) + '</p>' +
        '<h1>' + esc(CHILD) + ' · 英语学习</h1>' +
        '<p class="lead">' + esc(ASSISTANT) + '对 ' + esc(CHILD) + ' / ' + esc(NICKNAME) + ' 说：我们一次只听一个声音。先听、再说、再练，熟悉了才看符号。你喜欢摆关，就把词分一分组。</p>' +
        '<div class="avatars" aria-label="小宇和伍澍暘"><figure><img src="../../avatars/xiaoyu.jpg" alt="小宇"/><figcaption>小宇</figcaption></figure><figure><img src="../../avatars/pengpeng.jpg" alt="伍澍暘"/><figcaption>伍澍暘</figcaption></figure></div>' +
        '<p class="fine hint-mode">' + esc(suggestLabel) + '。想选另一边也可以。</p>' +
        '<div class="actions duo">' +
          '<button type="button" class="' + eveningClass + '" data-action="start" data-mode="evening">今晚学 · 大约 20 分钟</button>' +
          '<button type="button" class="' + morningClass + '" data-action="start" data-mode="morning">早上回想 · 大约 10 分钟</button>' +
        '</div>' +
        '<h2 class="map-title">声音路线</h2>' +
        '<div class="map">' + mapHtml() + '</div>' +
        '<details class="parent"><summary>给爸爸看一眼</summary><p>' + esc(PARENT_NOTE) + '</p><p>官方观看页只在新标签打开，不转载。Alphabeats 是字母发音主线。Letter of the Day 多半是认字母。sh / th 没有主频道短片，会标明 BBC 补充。</p></details>' +
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
      if (plan.skipNewSound && (step === 'mix' || step === 'quiz' || step === 'retrieval') && plan.skipReason) {
        talk += '<p class="banner">' + esc(plan.skipReason) + '</p>';
      }
      if (step === 'listen' && sound) {
        return '<div class="shell">' + head + talk +
          '<h1>先听这个声音</h1>' +
          '<p class="lead">' + esc(NICKNAME) + '，先别看符号。听 ' + esc(ASSISTANT) + ' 读，也可以打开片子和爸爸一起听。</p>' +
          '<p class="cue">' + esc(sound.cue) + '</p>' +
          speechNote() +
          '<div class="actions"><button type="button" class="primary" data-action="speak" data-say="' + esc(sound.speak) + '">听一听</button></div>' +
          watchList(sound) +
          '<div class="actions"><button type="button" class="primary" data-action="next">我听到了</button><button type="button" class="ghost" data-action="home">先回路线</button></div>' +
        '</div>';
      }
      if (step === 'say' && sound) {
        return '<div class="shell">' + head + talk +
          '<h1>跟着说</h1>' +
          '<p class="lead">' + esc(CHILD) + '，听完以后，你也说一遍。说得慢一点也没关系。</p>' +
          '<p class="cue">' + esc(sound.cue) + '</p>' +
          '<div class="actions"><button type="button" class="primary" data-action="speak" data-say="' + esc(sound.speak) + '">再听一次</button><button type="button" class="primary" data-action="next">我说了</button></div>' +
        '</div>';
      }
      if (step === 'practice' && sound) {
        return '<div class="shell">' + head + talk +
          '<h1>再练一练</h1>' +
          '<p class="lead">同样的声音，再听两遍、再说两遍。不要连着敲太多次。</p>' +
          '<div class="actions"><button type="button" class="primary" data-action="speak" data-say="' + esc(sound.speak) + '">听一听</button><button type="button" class="primary" data-action="next">练完了</button></div>' +
        '</div>';
      }
      if (step === 'words' && sound) {
        var cards = sound.words.map(function (w) { return wordCard(w, sound); }).join('');
        var frame = '';
        var week = weekByNumber(sound.week);
        if (week && week.frames && week.frames.length) {
          frame = '<div class="frames"><p class="fine">把词放进句子架子里说：</p>' + week.frames.map(function (f) {
            return '<button type="button" class="word" data-action="speak" data-say="' + esc(f.replace('___', sound.words[0])) + '">' + esc(f.replace('___', sound.words[0])) + '</button>';
          }).join('') + '</div>';
        }
        if (week && week.lightGrammar) {
          frame += '<p class="fine">轻轻记：a cat，an egg；一只 cat，两只 cats。还是这句架子：This is a ' + esc(sound.words[0]) + '.</p>';
        }
        if (week && week.reviewHeavy) {
          frame += '<p class="fine">这周多回想。I like ' + esc(sound.words[0]) + 's. This is a ' + esc(sound.words[0]) + '.</p>';
        }
        return '<div class="shell">' + head + talk +
          '<h1>配上简单的词</h1>' +
          '<p class="lead">点词就能听。先熟悉声音，符号先藏着。</p>' +
          '<div class="words">' + cards + '</div>' + frame +
          '<div class="actions"><button type="button" class="primary" data-action="next">下一关</button></div>' +
        '</div>';
      }
      if (step === 'builder' && sound) {
        var b = sound.builder;
        var group = (b.words || []).map(function (w) { return wordCard(w, sound); }).join('');
        return '<div class="shell">' + head + talk +
          '<h1>摆一摆</h1>' +
          '<p class="lead">' + esc(b.prompt) + '</p>' +
          '<div class="words">' + group + '</div>' +
          '<p class="rule">' + esc(b.rule) + '</p>' +
          '<div class="actions"><button type="button" class="primary" data-action="next">规则我说完了</button></div>' +
        '</div>';
      }
      if (step === 'mix') {
        var mixed = (plan.mixOldWords || []).map(function (it) {
          var s = soundById(it.soundId);
          return wordCard(it.key, s);
        }).join('');
        if (!mixed) mixed = '<p class="fine">以前的词还不多，先走下一步回想。</p>';
        return '<div class="shell">' + head + talk +
          '<h1>混进以前的词</h1>' +
          '<p class="lead">新声音听过以后，把以前会的词再拿出来走一遍。</p>' +
          '<div class="words">' + mixed + '</div>' +
          '<div class="actions"><button type="button" class="primary" data-action="next">去回想</button></div>' +
        '</div>';
      }
      if (step === 'quiz' || step === 'retrieval') {
        if (!state.quiz.length) {
          return '<div class="shell">' + head + talk +
            '<h1>今天没有要回想的卡片</h1>' +
            '<p class="lead">还没有到期的，也没有刚学还没记住的。可以先回路线，晚上再来。</p>' +
            '<div class="actions"><button type="button" class="primary" data-action="home">回路线</button></div>' +
          '</div>';
        }
        var item = state.quiz[state.quizIndex];
        var label = item.kind === 'sound' ? (soundById(item.key) ? soundById(item.key).title : item.key) : (item.kind === 'frame' ? (item.frame || '').replace('___', item.word || '') : item.key);
        var say = item.kind === 'sound' ? (soundById(item.key) ? soundById(item.key).speak : item.key) : (item.kind === 'frame' ? label : item.key);
        var sObj = soundById(item.soundId);
        var ipaLine = shouldShowIpa(item) && sObj ? '<p class="ipa-line">这个声音你已经熟了，符号是 <strong>/' + esc(sObj.ipa) + '/</strong>。</p>' : '<p class="fine">先想声音，不必先背符号。</p>';
        return '<div class="shell">' + head + talk +
          '<h1>回想一下</h1>' +
          '<p class="fine">' + (state.quizIndex + 1) + ' / ' + state.quiz.length + '</p>' +
          (state.message ? '<p class="banner">' + esc(state.message) + '</p>' : '') +
          '<p class="lead">看到它，你能读出来吗？</p>' +
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

    function doneHtml() {
      return '<div class="shell">' +
        '<p class="disclaimer">' + esc(DISCLAIMER) + '<span class="build-tip">' + esc(TIP) + '</span></p>' +
        '<p class="who">' + esc(ASSISTANT) + '</p>' +
        '<h1>今天先到这里</h1>' +
        '<p class="lead">' + esc(NICKNAME) + '，你已经走完这一小段。记住的会在以后的路线上再遇见。</p>' +
        '<div class="actions"><button type="button" class="primary" data-action="home">看声音路线</button><a class="ghost" href="../../../index.html">回小屋</a></div>' +
      '</div>';
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
