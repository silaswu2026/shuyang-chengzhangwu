/**
 * Geometry lock for ldt34 course chips + 四步心跳.
 * node shuyang-ai/learn/cocos/wb-chrome-layout.test.js
 */
var layout = require('./wb-chrome-layout.js');

var cases = [
  { name: 'look desktop', step: 0, phone: false },
  { name: 'look phone land', step: 0, phone: true, land: true },
  { name: 'look phone portrait', step: 0, phone: true, land: false },
  { name: 'design desktop', step: 2, phone: false },
  { name: 'design phone land', step: 2, phone: true, land: true },
  { name: 'settings desktop', step: 1, phone: false },
  { name: 'link phone', step: 3, phone: true, land: true },
  { name: 'reflect', step: 4, phone: false },
  { name: 'audio phone', step: 5, phone: true, land: true },
  { name: 'gate', step: 2, gate: true, phone: true, land: true },
  { name: 'look workbench phone speaker', step: 0, phone: true, land: true, avatarXs: [28, 860, 920], rightReserve: 664 },
  { name: 'look workbench desktop speaker', step: 0, phone: false, avatarXs: [36, 880, 930], rightReserve: 783 },
  { name: 'design workbench phone speaker', step: 2, phone: true, land: true, avatarXs: [28, 860, 920], rightReserve: 664 }
];

var failed = 0;
cases.forEach(function (c) {
  var p = layout.plan(c);
  var probs = layout.problems(p);
  if (c.step === 2 && !c.gate) {
    probs = probs.concat(layout.heartProblems(p.plateBottom));
  }
  if (probs.length) {
    failed++;
    console.error('FAIL ' + c.name + ' plate=' + p.plateBottom);
    probs.forEach(function (m) { console.error('  - ' + m); });
  } else {
    console.log('ok ' + c.name + ' plate=' + p.plateBottom + ' steps=' + p.steps.map(function (s) {
      return s.label + '@' + Math.round(s.x);
    }).join(' '));
  }
});

if (layout.STEP_LABELS.join('|') !== '①看图|关卡设计|⑤觉察|⑥听选') {
  failed++;
  console.error('FAIL step labels');
}
if (layout.HEART_LABELS.join('|') !== '1 定义种类|2 摆到格|3 存数据|4 立刻试玩') {
  failed++;
  console.error('FAIL heart labels');
}

if (failed) {
  console.error(failed + ' case(s) failed');
  process.exit(1);
}
console.log('all chrome cases clear');
