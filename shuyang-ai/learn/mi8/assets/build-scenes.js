/* 每题一张图。同一画框、同一套颜色、人一样大。
   不画星星、对勾、叉、奖杯、箭头，不用透明度分高低。
   node build-scenes.js
*/
var fs = require('fs');
var path = require('path');

var INK = '#2c241c';
var PAPER = '#f4efe2';
var SKIN = '#f6c9a3';
var HAIR = '#4a3428';
var SHIRT = '#7eace8';
var SHIRT_B = '#e0a36a';
var SHIRT_C = '#b7a6e0';
var PANTS = '#3d4d78';
var GOLD = '#e6c56a';
var BLUE = '#7eace8';
var CLAY = '#e07a6a';
var LEAF = '#6eae78';
var WOOD = '#c4a574';
var WATER = '#6eb0d4';
var ROCK = '#b7b1c4';
var LINE = '#d5d8ea';

function label(x, y, str, fill, size) {
  return '<text x="' + x + '" y="' + y + '" fill="' + (fill || INK) + '" font-size="' + (size || 12) + '" font-family="WenQuanYi Micro Hei, Droid Sans Fallback, sans-serif" font-weight="700" text-anchor="middle" dominant-baseline="middle">' + str + '</text>';
}

function person(x, footY, opt) {
  opt = opt || {};
  var shirt = opt.shirt || SHIRT;
  var headY = footY - 50;
  var shoulderY = headY + 18;
  var hipY = headY + 36;
  var lx = x - 12;
  var rx = x + 12;
  function arm(x1, y1, x2, y2) {
    return '<path d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '" stroke="' + SKIN + '" stroke-width="4" stroke-linecap="round"/>';
  }
  var arms = '';
  var kind = opt.arm || 'down';
  if (kind === 'down') arms = arm(lx, shoulderY, lx - 6, shoulderY + 16) + arm(rx, shoulderY, rx + 6, shoulderY + 16);
  else if (kind === 'up') arms = arm(lx, shoulderY, lx - 10, shoulderY - 16) + arm(rx, shoulderY, rx + 10, shoulderY - 16);
  else if (kind === 'out') arms = arm(lx, shoulderY, lx - 16, shoulderY + 2) + arm(rx, shoulderY, rx + 16, shoulderY + 2);
  else if (kind === 'talk') arms = arm(lx, shoulderY, lx - 14, shoulderY - 8) + arm(rx, shoulderY, rx + 6, shoulderY + 14);
  else if (kind === 'pointLeft') arms = arm(lx, shoulderY, lx - 18, shoulderY - 2) + arm(rx, shoulderY, rx + 6, shoulderY + 14);
  else if (kind === 'pointRight') arms = arm(lx, shoulderY, lx - 6, shoulderY + 14) + arm(rx, shoulderY, rx + 18, shoulderY - 2);
  else if (kind === 'tap') arms = arm(lx, shoulderY, lx - 14, shoulderY + 16) + arm(rx, shoulderY, rx + 6, shoulderY + 14);
  else if (kind === 'hold') arms = arm(lx, shoulderY, lx - 10, shoulderY + 16) + arm(rx, shoulderY, rx + 10, shoulderY + 16);
  var legs = '';
  var shoes = '';
  if (opt.leg === 'lift') {
    legs = '<path d="M' + (x - 6) + ' ' + hipY + ' L' + (x - 8) + ' ' + (footY - 4) + '" stroke="' + PANTS + '" stroke-width="4.5" stroke-linecap="round"/>'
      + '<path d="M' + (x + 5) + ' ' + hipY + ' L' + (x + 16) + ' ' + (hipY - 18) + ' L' + (x + 26) + ' ' + (hipY - 2) + '" fill="none" stroke="' + PANTS + '" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>';
    shoes = '<ellipse cx="' + (x - 8) + '" cy="' + (footY - 2) + '" rx="6" ry="2.6" fill="' + INK + '"/>'
      + '<ellipse cx="' + (x + 28) + '" cy="' + (hipY - 2) + '" rx="6" ry="2.6" fill="' + INK + '"/>';
  } else {
    legs = '<path d="M' + (x - 6) + ' ' + hipY + ' L' + (x - 8) + ' ' + (footY - 4) + '" stroke="' + PANTS + '" stroke-width="4.5" stroke-linecap="round"/>'
      + '<path d="M' + (x + 6) + ' ' + hipY + ' L' + (x + 8) + ' ' + (footY - 4) + '" stroke="' + PANTS + '" stroke-width="4.5" stroke-linecap="round"/>';
    shoes = '<ellipse cx="' + (x - 8) + '" cy="' + (footY - 2) + '" rx="6" ry="2.6" fill="' + INK + '"/>'
      + '<ellipse cx="' + (x + 8) + '" cy="' + (footY - 2) + '" rx="6" ry="2.6" fill="' + INK + '"/>';
  }
  var cape = opt.cape
    ? '<path d="M' + (x - 18) + ' ' + (headY + 18) + ' L' + (x - 20) + ' ' + (headY + 48) + ' L' + (x + 20) + ' ' + (headY + 48) + ' L' + (x + 18) + ' ' + (headY + 18) + ' Z" fill="' + SHIRT_B + '"/>'
    : '';
  var mouth = opt.mouth === 'flat'
    ? '<path d="M' + (x - 4) + ' ' + (headY + 8) + ' h8" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>'
    : '<path d="M' + (x - 4) + ' ' + (headY + 7) + ' Q' + x + ' ' + (headY + 11) + ' ' + (x + 4) + ' ' + (headY + 7) + '" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>';
  var head = '<circle cx="' + x + '" cy="' + headY + '" r="16" fill="' + SKIN + '"/>'
    + '<path d="M' + (x - 14) + ' ' + (headY - 1) + ' A 14 14 0 0 1 ' + (x + 14) + ' ' + (headY - 1) + ' Z" fill="' + HAIR + '"/>'
    + '<circle cx="' + (x - 5.5) + '" cy="' + (headY + 2) + '" r="1.7" fill="' + INK + '"/>'
    + '<circle cx="' + (x + 5.5) + '" cy="' + (headY + 2) + '" r="1.7" fill="' + INK + '"/>'
    + '<circle cx="' + (x - 10) + '" cy="' + (headY + 6) + '" r="2" fill="#f0b090"/>'
    + '<circle cx="' + (x + 10) + '" cy="' + (headY + 6) + '" r="2" fill="#f0b090"/>'
    + mouth;
  var body = '<path d="M' + (x - 14) + ' ' + (headY + 14) + ' h28 l-3 24 h-22 z" fill="' + shirt + '"/>';
  return legs + shoes + cape + body + arms + head;
}

function bubble(x, y, w, h) {
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="12" fill="' + PAPER + '"/>';
}

function tail(x, y) {
  return '<circle cx="' + x + '" cy="' + y + '" r="4" fill="' + PAPER + '"/>'
    + '<circle cx="' + (x + 8) + '" cy="' + (y + 7) + '" r="2.5" fill="' + PAPER + '"/>';
}

function panel(x, y, w, h) {
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="#12182f" stroke="#2c3a68" stroke-width="2"/>';
}

function note(x, y) {
  return '<ellipse cx="' + x + '" cy="' + y + '" rx="5.5" ry="4" fill="' + GOLD + '"/>'
    + '<rect x="' + (x + 4) + '" y="' + (y - 16) + '" width="2.2" height="16" rx="1" fill="' + GOLD + '"/>';
}

function paper(x, y, w, h) {
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" fill="' + PAPER + '"/>'
    + '<rect x="' + (x + 4) + '" y="' + (y + 6) + '" width="' + (w - 10) + '" height="2" fill="#d9d0c0"/>'
    + '<rect x="' + (x + 4) + '" y="' + (y + 11) + '" width="' + (Math.max(8, w - 16)) + '" height="2" fill="#d9d0c0"/>';
}

function gate(x, top) {
  return '<path d="M' + x + ' 90 V' + top + ' H' + (x + 40) + ' V90" fill="none" stroke="' + GOLD + '" stroke-width="4"/>'
    + '<path d="M' + x + ' ' + (top + 8) + ' Q' + (x + 20) + ' ' + (top - 14) + ' ' + (x + 40) + ' ' + (top + 8) + '" fill="none" stroke="' + GOLD + '" stroke-width="4"/>';
}

function wordCard(x, y) {
  return '<rect x="' + x + '" y="' + y + '" width="36" height="28" rx="6" fill="' + PAPER + '"/>' + label(x + 18, y + 14, '词', INK, 14);
}

function tileNum(x, y, n) {
  return '<rect x="' + x + '" y="' + y + '" width="22" height="18" rx="4" fill="' + BLUE + '"/>' + label(x + 11, y + 9, String(n), '#1a2148', 11);
}

function basket(x, y) {
  return '<path d="M' + x + ' ' + y + ' h30 l-4 16 h-22 z" fill="' + WOOD + '"/>'
    + '<path d="M' + (x - 2) + ' ' + y + ' h34" stroke="' + GOLD + '" stroke-width="3" stroke-linecap="round"/>';
}

function leaf(x, y, kind, scale) {
  var body = kind === 'slim'
    ? '<path d="M16 2 L30 20 L16 38 L2 20 Z" fill="' + LEAF + '"/><path d="M16 8 V32" stroke="#3e7d55" stroke-width="1.6"/>'
    : '<ellipse cx="16" cy="20" rx="14" ry="9" fill="#8fbe78"/><path d="M4 20 H28" stroke="#3e7d55" stroke-width="1.6"/>';
  return '<g transform="translate(' + x + ' ' + y + ') scale(' + (scale || 1) + ')">' + body + '</g>';
}

function tree(x) {
  return '<rect x="' + (x - 4) + '" y="58" width="8" height="32" rx="2" fill="' + WOOD + '"/>'
    + '<circle cx="' + x + '" cy="48" r="16" fill="' + LEAF + '"/>';
}

function cloud(x, y) {
  return '<g fill="' + LINE + '"><ellipse cx="' + x + '" cy="' + y + '" rx="14" ry="8"/>'
    + '<ellipse cx="' + (x - 10) + '" cy="' + (y + 2) + '" rx="8" ry="6"/>'
    + '<ellipse cx="' + (x + 10) + '" cy="' + (y + 2) + '" rx="9" ry="6"/></g>';
}

function bug(x, y) {
  return '<ellipse cx="' + x + '" cy="' + y + '" rx="7" ry="5" fill="#8d6b4a"/>'
    + '<circle cx="' + (x + 3) + '" cy="' + (y - 1) + '" r="1" fill="' + INK + '"/>'
    + '<path d="M' + (x - 3) + ' ' + (y - 4) + ' l-6 -5 M' + (x - 1) + ' ' + (y - 5) + ' l-2 -6" stroke="#8d6b4a" stroke-width="1.3" fill="none" stroke-linecap="round"/>';
}

function bird(x, y) {
  return '<path d="M' + x + ' ' + y + ' q6 -7 12 0 q6 -7 12 0" fill="none" stroke="' + LINE + '" stroke-width="2" stroke-linecap="round"/>';
}

function chair(x) {
  return '<rect x="' + x + '" y="42" width="7" height="48" rx="2" fill="' + WOOD + '"/>'
    + '<rect x="' + x + '" y="70" width="34" height="7" rx="2" fill="' + GOLD + '"/>'
    + '<rect x="' + (x + 27) + '" y="74" width="7" height="16" rx="2" fill="' + WOOD + '"/>';
}

function door(x, y) {
  return '<rect x="' + x + '" y="' + y + '" width="32" height="46" rx="4" fill="' + WOOD + '" stroke="' + GOLD + '" stroke-width="3"/>'
    + '<circle cx="' + (x + 24) + '" cy="' + (y + 24) + '" r="2.4" fill="' + GOLD + '"/>';
}

function hand(x, y) {
  return '<ellipse cx="' + x + '" cy="' + y + '" rx="8" ry="6" fill="' + SKIN + '"/>';
}

var DRAW = {
  'linguistic-1': function () {
    return bubble(8, 16, 84, 56)
      + '<circle cx="30" cy="40" r="10" fill="' + GOLD + '"/>'
      + '<path d="M50 46 l14 -12 l14 12 v18 h-28 z" fill="' + WOOD + '"/>'
      + '<rect x="60" y="52" width="8" height="12" fill="' + BLUE + '"/>'
      + tail(96, 62)
      + person(128, 92, { arm: 'talk' });
  },
  'linguistic-2': function () {
    return gate(12, 40)
      + paper(20, 52, 28, 20)
      + paper(62, 52, 28, 20)
      + person(128, 92, { arm: 'pointLeft' });
  },
  'linguistic-3': function () {
    return wordCard(24, 22) + wordCard(24, 62) + person(120, 92, { arm: 'down' });
  },
  'linguistic-4': function () {
    return '<path d="M12 36 h32 v46 h-32 z" fill="' + PAPER + '"/>'
      + '<path d="M44 32 h32 v46 h-32 z" fill="#efe4d0"/>'
      + '<path d="M44 32 v50" stroke="' + WOOD + '" stroke-width="2"/>'
      + '<rect x="40" y="28" width="8" height="18" rx="1" fill="' + CLAY + '"/>'
      + bubble(86, 28, 28, 28)
      + label(100, 42, '?', INK, 14)
      + person(132, 92, { arm: 'down' });
  },
  'linguistic-5': function () {
    return panel(8, 34, 30, 30) + '<circle cx="23" cy="49" r="7" fill="' + LINE + '"/>'
      + panel(42, 34, 30, 30)
      + '<rect x="48" y="42" width="16" height="12" rx="4" fill="' + PAPER + '"/>'
      + '<circle cx="52" cy="56" r="2.5" fill="' + PAPER + '"/>'
      + panel(76, 34, 30, 30)
      + paper(80, 38, 22, 20)
      + person(128, 92, { arm: 'down' });
  },
  'logical-1': function () {
    return tileNum(8, 66, 1) + tileNum(32, 66, 2) + tileNum(56, 66, 3) + tileNum(80, 66, 4)
      + person(128, 92, { arm: 'pointLeft' });
  },
  'logical-2': function () {
    return panel(8, 18, 68, 78) + panel(84, 18, 68, 78)
      + label(42, 36, '这一步', PAPER, 12) + label(118, 36, '下一步', PAPER, 12)
      + '<rect x="20" y="52" width="16" height="16" rx="3" fill="' + BLUE + '"/>'
      + '<rect x="124" y="52" width="16" height="16" rx="3" fill="' + BLUE + '"/>';
  },
  'logical-3': function () {
    var s = '';
    for (var i = 0; i < 6; i++) {
      var x = 14 + i * 16;
      s += (i % 2 === 0)
        ? '<circle cx="' + x + '" cy="52" r="7" fill="' + GOLD + '"/>'
        : '<rect x="' + (x - 7) + '" y="45" width="14" height="14" rx="2" fill="' + BLUE + '"/>';
    }
    return s + person(128, 92, { arm: 'down' });
  },
  'logical-4': function () {
    return person(28, 92, { arm: 'pointRight' })
      + '<ellipse cx="62" cy="84" rx="10" ry="6" fill="' + ROCK + '"/>'
      + '<ellipse cx="84" cy="84" rx="10" ry="6" fill="' + ROCK + '"/>'
      + '<ellipse cx="106" cy="84" rx="10" ry="6" fill="' + ROCK + '"/>'
      + door(122, 44);
  },
  'logical-5': function () {
    return basket(6, 64) + '<circle cx="21" cy="74" r="5" fill="' + BLUE + '"/>'
      + basket(40, 64) + '<rect x="50" y="68" width="10" height="10" rx="2" fill="' + GOLD + '"/>'
      + basket(74, 64) + '<path d="M84 78 l5 -10 l5 10 z" fill="' + CLAY + '"/>'
      + person(128, 92, { arm: 'down' });
  },
  'spatial-1': function () {
    return '<rect x="12" y="72" width="78" height="14" rx="3" fill="' + BLUE + '"/>'
      + '<rect x="40" y="72" width="20" height="14" fill="#1a2148"/>'
      + '<rect x="16" y="50" width="18" height="18" rx="3" fill="' + GOLD + '"/>'
      + bubble(52, 12, 52, 40)
      + '<g transform="translate(78 32) rotate(45)"><rect x="-9" y="-9" width="18" height="18" rx="3" fill="' + GOLD + '"/></g>'
      + person(132, 92, { arm: 'down' });
  },
  'spatial-2': function () {
    return '<rect x="8" y="28" width="30" height="44" rx="6" fill="' + PAPER + '"/>'
      + '<path d="M14 60 C20 40 28 58 34 36" fill="none" stroke="' + BLUE + '" stroke-width="2"/>'
      + '<rect x="42" y="28" width="30" height="44" rx="6" fill="' + PAPER + '"/>'
      + '<ellipse cx="57" cy="50" rx="10" ry="14" fill="none" stroke="' + CLAY + '" stroke-width="2"/>'
      + '<rect x="76" y="28" width="30" height="44" rx="6" fill="' + PAPER + '"/>'
      + '<rect x="80" y="34" width="9" height="9" fill="' + BLUE + '"/>'
      + '<rect x="91" y="34" width="9" height="9" fill="' + GOLD + '"/>'
      + '<rect x="80" y="45" width="9" height="9" fill="' + LEAF + '"/>'
      + '<rect x="91" y="45" width="9" height="9" fill="' + CLAY + '"/>'
      + person(128, 92, { arm: 'down' });
  },
  'spatial-3': function () {
    return '<rect x="16" y="64" width="22" height="22" rx="3" fill="' + BLUE + '"/>'
      + label(27, 58, '左', PAPER, 12)
      + '<circle cx="78" cy="40" r="11" fill="' + GOLD + '"/>'
      + label(78, 18, '右', PAPER, 12)
      + person(128, 92, { arm: 'down' });
  },
  'spatial-4': function () {
    return '<rect x="8" y="76" width="52" height="14" rx="3" fill="' + BLUE + '"/>'
      + '<rect x="78" y="76" width="52" height="14" rx="3" fill="' + BLUE + '"/>'
      + person(34, 78, { arm: 'down' });
  },
  'spatial-5': function () {
    return '<rect x="10" y="26" width="40" height="52" rx="4" fill="' + PAPER + '"/>'
      + '<rect x="10" y="26" width="20" height="52" fill="' + BLUE + '"/>'
      + '<rect x="62" y="28" width="16" height="16" rx="2" fill="' + BLUE + '"/>'
      + '<rect x="80" y="28" width="16" height="16" rx="2" fill="' + GOLD + '"/>'
      + '<rect x="62" y="46" width="16" height="16" rx="2" fill="' + LEAF + '"/>'
      + '<rect x="80" y="46" width="16" height="16" rx="2" fill="' + CLAY + '"/>'
      + person(128, 92, { arm: 'down' });
  },
  'bodily-1': function () {
    return chair(16) + person(100, 92, { arm: 'up' });
  },
  'bodily-2': function () {
    return person(80, 92, { arm: 'out', leg: 'lift' });
  },
  'bodily-3': function () {
    return panel(8, 36, 32, 32) + '<circle cx="24" cy="52" r="8" fill="' + CLAY + '"/>'
      + panel(44, 36, 32, 32) + '<rect x="49" y="48" width="22" height="10" rx="2" fill="' + WOOD + '"/>'
      + '<path d="M53 53 h14" stroke="' + PAPER + '" stroke-width="1.4" stroke-dasharray="2 2"/>'
      + panel(80, 36, 32, 32) + '<path d="M88 58 l6 -12 l12 3 l3 9 l-9 6 z" fill="' + ROCK + '"/>'
      + person(132, 92, { arm: 'down' });
  },
  'bodily-4': function () {
    return person(78, 92, { arm: 'hold' })
      + '<rect x="18" y="76" width="100" height="8" rx="2" fill="' + WOOD + '"/>'
      + '<rect x="28" y="62" width="18" height="14" rx="3" fill="' + GOLD + '"/>'
      + paper(52, 56, 28, 20)
      + hand(40, 70)
      + hand(66, 70);
  },
  'bodily-5': function () {
    return person(80, 92, { arm: 'out', cape: true });
  },
  'musical-1': function () {
    return note(22, 40) + note(46, 34)
      + '<rect x="12" y="74" width="78" height="8" rx="2" fill="' + WOOD + '"/>'
      + person(118, 92, { arm: 'tap' });
  },
  'musical-2': function () {
    return gate(16, 42) + note(78, 48) + person(128, 92, { arm: 'down' });
  },
  'musical-3': function () {
    return panel(8, 16, 68, 88) + panel(84, 16, 68, 88)
      + label(42, 32, '快', PAPER, 12) + label(118, 32, '慢', PAPER, 12)
      + note(18, 64) + note(28, 64) + note(38, 64) + note(48, 64)
      + note(98, 68) + note(114, 68) + note(130, 68) + note(146, 68);
  },
  'musical-4': function () {
    var s = '<path d="M12 70 H112" stroke="' + LINE + '" stroke-width="2"/>';
    for (var i = 0; i < 4; i++) {
      var x = 22 + i * 24;
      s += '<circle cx="' + x + '" cy="56" r="10" fill="' + GOLD + '"/>' + label(x, 56, String(i + 1), '#1a2148', 11);
    }
    return s + person(132, 92, { arm: 'down' });
  },
  'musical-5': function () {
    return person(46, 92, { arm: 'down' })
      + bubble(78, 14, 72, 40)
      + tail(86, 50)
      + note(96, 36) + note(114, 36) + note(132, 36);
  },
  'interpersonal-1': function () {
    return '<rect x="14" y="68" width="16" height="12" rx="2" fill="' + GOLD + '"/>'
      + '<rect x="24" y="56" width="16" height="12" rx="2" fill="' + BLUE + '"/>'
      + person(36, 92, { arm: 'hold' })
      + '<rect x="92" y="78" width="14" height="10" rx="2" fill="' + BLUE + '"/>'
      + '<rect x="108" y="78" width="14" height="10" rx="2" fill="' + BLUE + '"/>'
      + '<rect x="124" y="78" width="14" height="10" rx="2" fill="' + BLUE + '"/>'
      + person(116, 92, { shirt: SHIRT_B, arm: 'down' });
  },
  'interpersonal-2': function () {
    return person(48, 92, { shirt: SHIRT_B, mouth: 'flat' })
      + bubble(70, 16, 26, 26)
      + label(83, 29, '?', INK, 14)
      + person(112, 92, { arm: 'down' });
  },
  'interpersonal-3': function () {
    return person(36, 92, { arm: 'pointRight' })
      + '<rect x="68" y="74" width="28" height="12" rx="3" fill="' + BLUE + '"/>'
      + person(118, 92, { shirt: SHIRT_B, arm: 'down' });
  },
  'interpersonal-4': function () {
    return bubble(64, 8, 32, 18)
      + '<circle cx="74" cy="17" r="2" fill="' + INK + '"/><circle cx="80" cy="17" r="2" fill="' + INK + '"/><circle cx="86" cy="17" r="2" fill="' + INK + '"/>'
      + person(32, 92, { arm: 'down' })
      + person(80, 92, { shirt: SHIRT_B, arm: 'down' })
      + person(128, 92, { shirt: SHIRT_C, arm: 'down' });
  },
  'interpersonal-5': function () {
    return '<rect x="18" y="74" width="18" height="14" rx="2" fill="' + BLUE + '"/>'
      + '<rect x="18" y="58" width="18" height="14" rx="2" fill="' + GOLD + '"/>'
      + '<rect x="18" y="42" width="18" height="14" rx="2" fill="' + CLAY + '"/>'
      + person(72, 92, { arm: 'down' })
      + person(118, 92, { shirt: SHIRT_B, arm: 'down' });
  },
  'intrapersonal-1': function () {
    return person(36, 92, { arm: 'down' })
      + bubble(62, 16, 88, 52)
      + '<rect x="70" y="28" width="22" height="22" rx="4" fill="#efe6d4"/>'
      + '<circle cx="81" cy="39" r="7" fill="' + CLAY + '"/>'
      + '<rect x="96" y="28" width="22" height="22" rx="4" fill="#efe6d4"/>'
      + '<path d="M100 32 h14 v14 h-14 z" fill="' + PAPER + '" stroke="' + WOOD + '" stroke-width="1.4"/>'
      + '<rect x="122" y="28" width="22" height="22" rx="4" fill="#efe6d4"/>'
      + leaf(123, 29, 'round', 0.55);
  },
  'intrapersonal-2': function () {
    return person(40, 92, { arm: 'hold' })
      + '<rect x="70" y="70" width="16" height="12" rx="2" fill="' + GOLD + '"/>'
      + '<rect x="82" y="58" width="16" height="12" rx="2" fill="' + BLUE + '"/>'
      + '<rect x="104" y="48" width="28" height="32" rx="3" fill="' + PAPER + '"/>'
      + '<circle cx="118" cy="64" r="7" fill="none" stroke="' + BLUE + '" stroke-width="2"/>';
  },
  'intrapersonal-3': function () {
    return panel(10, 22, 64, 72) + panel(86, 22, 64, 72)
      + '<circle cx="42" cy="58" r="12" fill="' + CLAY + '"/>'
      + '<rect x="106" y="48" width="28" height="18" rx="8" fill="' + PAPER + '"/>';
  },
  'intrapersonal-4': function () {
    return '<rect x="12" y="52" width="60" height="14" rx="7" fill="' + BLUE + '"/>'
      + '<rect x="88" y="52" width="60" height="14" rx="7" fill="' + BLUE + '"/>'
      + '<circle cx="108" cy="52" r="6" fill="' + GOLD + '"/>'
      + '<circle cx="128" cy="52" r="6" fill="' + GOLD + '"/>';
  },
  'intrapersonal-5': function () {
    return panel(12, 28, 40, 40) + panel(58, 28, 40, 40)
      + '<path d="M24 40 h16 l-2 14 h-12 z" fill="' + BLUE + '"/>'
      + '<path d="M40 44 h6 v7 h-6" fill="none" stroke="' + BLUE + '" stroke-width="2"/>'
      + '<path d="M66 36 h12 v22 h-12 z" fill="' + PAPER + '"/>'
      + '<path d="M78 34 h12 v22 h-12 z" fill="#efe4d0"/>'
      + person(128, 92, { arm: 'down' });
  },
  'naturalist-1': function () {
    return tree(26) + cloud(72, 30) + bird(86, 22) + bug(64, 78) + person(124, 92, { arm: 'down' });
  },
  'naturalist-2': function () {
    return '<rect x="12" y="20" width="62" height="80" rx="8" fill="' + PAPER + '"/>'
      + '<rect x="86" y="20" width="62" height="80" rx="8" fill="' + PAPER + '"/>'
      + leaf(26, 42, 'round')
      + leaf(100, 38, 'slim');
  },
  'naturalist-3': function () {
    return '<rect x="12" y="16" width="64" height="58" rx="4" fill="' + WATER + '" stroke="' + PAPER + '" stroke-width="4"/>'
      + '<path d="M44 16 v58 M12 45 h64" stroke="' + PAPER + '" stroke-width="3"/>'
      + cloud(44, 34)
      + '<path d="M84 76 h26 l-4 12 h-18 z" fill="' + CLAY + '"/>'
      + '<rect x="82" y="72" width="30" height="6" rx="2" fill="#c45b4a"/>'
      + '<circle cx="97" cy="56" r="9" fill="' + LEAF + '"/>'
      + '<path d="M97 72 V60" stroke="#3e7d55" stroke-width="2"/>'
      + person(134, 92, { arm: 'down' });
  },
  'naturalist-4': function () {
    return '<rect x="8" y="58" width="28" height="24" rx="3" fill="#2f6a45"/>'
      + '<path d="M14 78 q2 -12 0 -16 M22 78 q1 -14 0 -18 M30 78 q-1 -12 2 -16" stroke="' + LEAF + '" stroke-width="2" fill="none" stroke-linecap="round"/>'
      + '<rect x="42" y="58" width="28" height="24" rx="3" fill="' + WATER + '"/>'
      + '<rect x="76" y="58" width="28" height="24" rx="3" fill="#3a4668"/>'
      + '<ellipse cx="90" cy="70" rx="8" ry="6" fill="' + ROCK + '"/>'
      + person(128, 92, { arm: 'down' });
  },
  'naturalist-5': function () {
    return '<rect x="16" y="70" width="72" height="12" rx="2" fill="#8d6b4a"/>'
      + '<path d="M52 70 C40 84 28 80 24 90 M52 70 C64 84 76 80 80 90" fill="none" stroke="' + WOOD + '" stroke-width="2" stroke-linecap="round"/>'
      + '<path d="M52 70 V40" stroke="#3e7d55" stroke-width="3"/>'
      + '<circle cx="52" cy="32" r="10" fill="' + CLAY + '"/>'
      + '<circle cx="40" cy="48" r="7" fill="' + LEAF + '"/>'
      + '<circle cx="64" cy="48" r="7" fill="' + LEAF + '"/>'
      + person(120, 92, { arm: 'down' });
  }
};

var DESC = {
  'linguistic-1': '一个人把今天的事讲出来，气泡里有太阳和屋子',
  'linguistic-2': '一扇关卡门上贴着一张纸，旁边还有一张一样大的纸',
  'linguistic-3': '两张一样大的卡片都写着词，一张在上，一张在下',
  'linguistic-4': '一本翻开的故事书，书签夹在中间，旁边有一个问号',
  'linguistic-5': '三个一样大的格子：一个圆、一个小气泡、一张小纸',
  'logical-1': '四格一样大的跑道，每格一个数字',
  'logical-2': '左右两格一样大，一格写这一步，一格写下一步，方块一样大',
  'logical-3': '一排圆和方，大小都一样，间距也一样',
  'logical-4': '一个人、三块一样大的踏脚石、一扇关着的门',
  'logical-5': '三只一样大的筐，里面分别是圆、方、三角',
  'spatial-1': '一块方积木，气泡里是转过方向的同一块',
  'spatial-2': '三张一样大的卡片：地图、跑道、拼图',
  'spatial-3': '左边低处一个方块，右边高处一个圆，字一样大',
  'spatial-4': '两块一样高的平台，中间空着',
  'spatial-5': '一张涂了一半颜色的纸，旁边四块一样大的拼图',
  'bodily-1': '一把椅子，一个人举着手在伸懒腰',
  'bodily-2': '一个人抬起一条腿',
  'bodily-3': '三个一样大的格子，里面是球、小路和石头',
  'bodily-4': '一个人把手放在积木和纸上',
  'bodily-5': '一个人张开手臂，身上披着一块布',
  'musical-1': '两个音符，一张桌子，一个人把手指点在桌上',
  'musical-2': '一扇关卡门旁边一个音符',
  'musical-3': '左右两格一样大，一格音符密、写着快，一格音符疏、写着慢',
  'musical-4': '四个一样大的圆点，写着数字',
  'musical-5': '一个人旁边的气泡里有三个音符',
  'interpersonal-1': '两个人一样大，一个旁边有积木，一个脚边有格子',
  'interpersonal-2': '两个人一样大，一个嘴巴是平的，中间有一个问号',
  'interpersonal-3': '两个人一样大，中间有一块台阶',
  'interpersonal-4': '三个人一样大，中间那个人旁边有一个小气泡',
  'interpersonal-5': '三块一样大的积木叠着，旁边两个人一样大',
  'intrapersonal-1': '气泡里三个一样大的格子，分别是球、书和叶子',
  'intrapersonal-2': '一个人、两块积木、一张画着圆的纸',
  'intrapersonal-3': '左右两格一样大，一格是球，一格是枕头',
  'intrapersonal-4': '两段一样长的路，一段平，一段上面有圆包',
  'intrapersonal-5': '两个一样大的格子，一个杯子、一本书',
  'naturalist-1': '树、云、鸟和虫子，旁边站着一个人',
  'naturalist-2': '两张一样大的卡片，各有一片叶子',
  'naturalist-3': '一扇窗户、窗外的云、窗台上一盆植物',
  'naturalist-4': '三块一样大的格子，上面是草、水和石头',
  'naturalist-5': '一株带着根的植物，旁边站着一个人'
};

function frame(desc, inner) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120" width="160" height="120">'
    + '<desc>' + desc + '</desc>'
    + '<defs><clipPath id="frame"><rect x="1" y="1" width="158" height="118" rx="16"/></clipPath></defs>'
    + '<g clip-path="url(#frame)">'
    + '<rect width="160" height="120" fill="#1a2148"/>'
    + '<rect y="90" width="160" height="30" fill="#243056"/>'
    + '<rect y="90" width="160" height="3" fill="#2e3b6e"/>'
    + inner
    + '</g>'
    + '<rect x="1" y="1" width="158" height="118" rx="16" fill="none" stroke="#2c3a68" stroke-width="2"/>'
    + '</svg>\n';
}

Object.keys(DESC).forEach(function (id) {
  if (!DRAW[id]) throw new Error('missing draw ' + id);
  var file = path.join(__dirname, id + '.svg');
  fs.writeFileSync(file, frame(DESC[id], DRAW[id]()));
});

console.log('wrote ' + Object.keys(DESC).length + ' scenes');
