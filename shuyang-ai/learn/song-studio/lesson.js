/* 图文课件 mse1 · 伍澍暘 / 小宇 · 翻页，不连网 */
(function () {
  'use strict';

  var EDITOR = 'index.html?v=mse1';
  var svgText = 'font-family:PingFang SC,Noto Sans SC,WenQuanYi Micro Hei,sans-serif';

  function box(x, y, w, h, fill, label, ink) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="12" fill="' + fill + '"/>' +
      '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 6) + '" text-anchor="middle" fill="' + (ink || '#f4f0ff') + '" font-size="16" font-weight="800" style="' + svgText + '">' + label + '</text>';
  }

  var STEPS = [
    {
      title: '今天做自己的歌',
      kid: '小宇：伍澍暘，今天做一首你喜欢的歌。先想一个原创主题，再用小歌编辑器把鼓点和旋律摆出来，马上听，存成自己的。不抄别人已经出版的歌。',
      take: '带走：今天做自己的歌。',
      picture: '<svg viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg">' +
        box(8, 36, 78, 88, '#161b3d', '定义', '#ffe07a') +
        box(98, 36, 78, 88, '#161b3d', '摆', '#ffe07a') +
        box(188, 36, 78, 88, '#3ecf6a', '听', '#062014') +
        box(278, 36, 74, 88, '#ffe07a', '存', '#1a1404') +
        '</svg>'
    },
    {
      title: '听歌时你喜欢什么',
      kid: '先别说商品歌的名字。用自己的话说感觉：想跑，想静，还是想笑？感觉是你的。歌名是别人的。',
      take: '带走：先说感觉，不报别人的歌名。',
      picture: '<svg viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="70" cy="80" r="46" fill="none" stroke="#ffe07a" stroke-width="6"/>' +
        '<circle cx="70" cy="80" r="16" fill="#3ecf6a"/>' +
        box(140, 22, 90, 36, '#161b3d', '想跑', '#ffe07a') +
        box(140, 64, 90, 36, '#161b3d', '想静', '#ffe07a') +
        box(140, 106, 90, 36, '#161b3d', '想笑', '#ffe07a') +
        '<text x="250" y="88" fill="#a8a0c8" font-size="14" font-weight="700" style="' + svgText + '">不说歌名</text></svg>'
    },
    {
      title: '选题和心情',
      kid: '风格选一颗：热血游戏、轻松流行、安静钢琴、电子跳动。心情再选一颗：开心、热血、安静、搞笑。再加一句自己的事，比如小忍者穿过竹林，去找会发光的石头。',
      take: '带走：风格一颗，心情一颗，加一句自己的事。',
      picture: '<svg viewBox="0 0 360 180" xmlns="http://www.w3.org/2000/svg">' +
        '<text x="12" y="22" fill="#ffe07a" font-size="13" font-weight="800" style="' + svgText + '">风格</text>' +
        box(12, 32, 80, 36, '#ffe07a', '热血游戏', '#1a1404') +
        box(98, 32, 80, 36, '#161b3d', '轻松流行', '#f4f0ff') +
        box(184, 32, 80, 36, '#161b3d', '安静钢琴', '#f4f0ff') +
        box(270, 32, 80, 36, '#161b3d', '电子跳动', '#f4f0ff') +
        '<text x="12" y="96" fill="#ffe07a" font-size="13" font-weight="800" style="' + svgText + '">心情</text>' +
        box(12, 106, 78, 36, '#3ecf6a', '开心', '#062014') +
        box(98, 106, 78, 36, '#161b3d', '热血', '#f4f0ff') +
        box(184, 106, 78, 36, '#161b3d', '安静', '#f4f0ff') +
        box(270, 106, 78, 36, '#161b3d', '搞笑', '#f4f0ff') +
        '</svg>'
    },
    {
      title: '歌的三段',
      kid: '前奏是还没开口的开头。主歌在讲事情。副歌是最想跟着哼的那一段。今天主歌和副歌都要留着。前奏可以关掉再打开。',
      take: '带走：主歌讲，副歌记。前奏可以先不要。',
      picture: '<svg viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg">' +
        box(12, 48, 90, 64, '#161b3d', '前奏', '#ffe07a') +
        box(116, 32, 110, 96, '#161b3d', '主歌', '#f4f0ff') +
        box(240, 16, 108, 128, '#3ecf6a', '副歌', '#062014') +
        '</svg>'
    },
    {
      title: '速度和音色',
      kid: 'BPM 是一分钟里有多少拍。80 像散步，110 像走路，140 像小跑。音色是旋律用什么声音：鼓、贝斯嗡音、钢琴、合成铅。数字要能读出来。',
      take: '带走：速度看数字，声音点名字。',
      picture: '<svg viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg">' +
        box(16, 36, 70, 70, '#161b3d', '80', '#ffe07a') +
        box(100, 24, 86, 94, '#ffe07a', '110', '#1a1404') +
        box(200, 16, 70, 110, '#3ecf6a', '140', '#062014') +
        '<text x="16" y="140" fill="#a8a0c8" font-size="13" font-weight="700" style="' + svgText + '">鼓 · 贝斯嗡音 · 钢琴 · 合成铅</text></svg>'
    },
    {
      title: '知识卡和提示词',
      kid: '点开每一张卡。提示词是写给爸爸的一段话，让爸爸贴进 Suno 的简单模式。你不到 13 岁，Suno 由爸爸来按。我们的页面不登录，也不去连那家网站。',
      take: '带走：提示词交给爸爸。原创可以，抄歌不可以。',
      cards: [
        ['BPM', '一分钟敲多少下。数字大，歌更赶。'],
        ['小节', '鼓点一行 16 下。4 下一组，四组是一个小节。'],
        ['主歌 / 副歌', '主歌讲事情。副歌最好记，常常再来一遍。'],
        ['音色', '钢琴软，合成铅亮，贝斯低，鼓是敲的。'],
        ['提示词', '把风格、心情、速度和你的句子写成一段话。'],
        ['原创 vs 抄歌', '原创是你的主题。抄歌是照着别人的歌去仿。今天只做原创。']
      ]
    },
    {
      title: '打开编辑器摆一摆',
      kid: '去小歌编辑器。歌名可以改。风格、心情、速度、音色都要点名字。鼓点一格格点亮。旋律点在哆来咪嗦啦上。主题写进格子，再点「生成 AI 提示词」。',
      take: '带走：我摆出了自己的一小段。',
      editor: true,
      editorLabel: '打开小歌编辑器',
      picture: '<svg viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="16" y="20" width="328" height="120" rx="16" fill="#12162e" stroke="#ffe07a"/>' +
        '<text x="180" y="58" text-anchor="middle" fill="#ffe07a" font-size="16" font-weight="800" style="' + svgText + '">小歌编辑器</text>' +
        '<text x="180" y="88" text-anchor="middle" fill="#f4f0ff" font-size="14" font-weight="700" style="' + svgText + '">点名字 · 点格子 · 马上听</text>' +
        '<text x="180" y="116" text-anchor="middle" fill="#3ecf6a" font-size="13" font-weight="800" style="' + svgText + '">mse1</text></svg>'
    },
    {
      title: '立刻听',
      kid: '点 ▶ 试听。改一个鼓点，或把 80 换成 140，或把心情从开心换成安静，再点一次试听。耳朵要能分出来。⏹ 停止随时可以按。',
      take: '带走：改完马上听。',
      editor: true,
      editorLabel: '回到编辑器试听',
      picture: '<svg viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="120" cy="80" r="48" fill="#3ecf6a"/>' +
        '<polygon points="108,58 108,102 148,80" fill="#062014"/>' +
        '<rect x="200" y="48" width="120" height="64" rx="32" fill="#161b3d" stroke="#ffe07a"/>' +
        '<text x="260" y="86" text-anchor="middle" fill="#ffe07a" font-size="16" font-weight="800" style="' + svgText + '">停止</text></svg>'
    },
    {
      title: '存得住',
      kid: '点保存「我的小歌」。刷新页面，名册里还在。点打开可以再听。覆盖是用现在的格子换掉那一首。删除要再点一次才真的删。这本子叫 xygo-my-songs，不是关卡那本。',
      take: '带走：关掉再打开，还是这首。',
      editor: true,
      editorLabel: '回到编辑器去存',
      picture: '<svg viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="70" y="28" width="150" height="104" rx="8" fill="#161b3d" stroke="#ffe07a"/>' +
        '<rect x="86" y="48" width="118" height="10" rx="3" fill="#ffe07a"/>' +
        '<rect x="86" y="68" width="90" height="8" rx="3" fill="#3ecf6a"/>' +
        '<rect x="86" y="84" width="100" height="8" rx="3" fill="#a8a0c8"/>' +
        '<text x="240" y="90" fill="#ffe07a" font-size="13" font-weight="800" style="' + svgText + '">打开 · 覆盖 · 删除</text></svg>'
    },
    {
      title: '爸爸可以去贴 Suno',
      kid: '这一步可以跳过。你点过「生成 AI 提示词」之后，爸爸复制，贴到 Suno 的简单模式。用爸爸的账号。你在旁边听，不自己登录。做出来的也要是新歌。',
      take: '带走：AI 是爸爸的工具。设计是我的。',
      picture: '<svg viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg">' +
        box(20, 40, 140, 80, '#161b3d', '孩子设计', '#ffe07a') +
        '<text x="184" y="88" fill="#ffe07a" font-size="22" font-weight="800">→</text>' +
        box(210, 40, 130, 80, '#3ecf6a', '爸爸贴', '#062014') +
        '</svg>'
    },
    {
      title: '今天学会了',
      kid: '伍澍暘说一句：今天我学会了什么。一起说口诀：先定义，再摆，立刻听，存得住。下次可以让主歌和副歌各有一套鼓。今天先把这一首存好。',
      take: '金句：先定义，再摆，立刻听，存得住。',
      editor: true,
      editorLabel: '去把歌做完',
      picture: '<svg viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg">' +
        '<text x="180" y="78" text-anchor="middle" fill="#ffe07a" font-size="22" font-weight="800" style="' + svgText + '">伍澍暘 · 小宇</text>' +
        '<text x="180" y="112" text-anchor="middle" fill="#3ecf6a" font-size="16" font-weight="800" style="' + svgText + '">自己的歌</text></svg>'
    }
  ];

  var index = 0;

  function readStep() {
    var n = Number(new URLSearchParams(location.search).get('step') || '1');
    if (!isFinite(n) || n < 1) n = 1;
    if (n > STEPS.length) n = STEPS.length;
    return n - 1;
  }

  function writeStep(n) {
    var url = new URL(location.href);
    url.searchParams.set('v', 'mse1');
    url.searchParams.set('step', String(n + 1));
    history.replaceState(null, '', url);
  }

  function render() {
    var step = STEPS[index];
    document.getElementById('title').textContent = step.title;
    document.getElementById('kid').textContent = step.kid;
    document.getElementById('take').textContent = step.take;
    document.getElementById('progress').textContent = '第 ' + (index + 1) + ' 步 / ' + STEPS.length;
    document.getElementById('bar').style.width = ((index + 1) / STEPS.length * 100) + '%';
    var picture = document.getElementById('picture');
    picture.innerHTML = '';
    if (step.cards) {
      var wrap = document.createElement('div');
      wrap.className = 'cards';
      step.cards.forEach(function (pair) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'card';
        btn.setAttribute('aria-expanded', 'false');
        var q = document.createElement('span');
        q.className = 'q';
        q.textContent = pair[0];
        var a = document.createElement('span');
        a.className = 'a';
        a.textContent = pair[1];
        btn.appendChild(q);
        btn.appendChild(a);
        btn.addEventListener('click', function () {
          var open = btn.getAttribute('aria-expanded') === 'true';
          btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        });
        wrap.appendChild(btn);
      });
      picture.appendChild(wrap);
    } else {
      picture.innerHTML = step.picture;
    }
    document.getElementById('prev').disabled = index === 0;
    var next = document.getElementById('next');
    var go = document.getElementById('goEditor');
    next.hidden = index === STEPS.length - 1;
    go.hidden = !step.editor;
    go.textContent = step.editorLabel || '打开小歌编辑器';
    go.href = EDITOR;
    writeStep(index);
  }

  document.getElementById('prev').addEventListener('click', function () {
    if (index > 0) {
      index -= 1;
      render();
    }
  });
  document.getElementById('next').addEventListener('click', function () {
    if (index < STEPS.length - 1) {
      index += 1;
      render();
    }
  });

  index = readStep();
  render();
})();
