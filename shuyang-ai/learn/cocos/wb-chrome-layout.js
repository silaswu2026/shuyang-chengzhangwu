/**
 * Course chrome geometry for the 960×540 Cocos stage.
 * Step chips and the second row (看图 原理|方法|总结, or 关卡设计 摆关|设置|关联)
 * occupy separate bands so labels never stack. Pure math — no Cocos.
 *
 * ldt34: phone landscape ~844×390 and the desktop shell share this plan.
 * The old look-step row sat at H-52 under chips at H-26 and overlapped.
 */
(function (root) {
  var W = 960;
  var H = 540;
  var STEP_LABELS = ['①看图', '关卡设计', '⑤觉察', '⑥听选'];
  var PHASE_LABELS = ['原理', '方法', '总结'];
  var TAB_LABELS = ['摆关', '设置', '关联'];
  var HEART_LABELS = ['1 定义种类', '2 摆到格', '3 存数据', '4 立刻试玩'];
  var HEART_HINTS = ['先点零件', '再点格子', '点保存', '点试玩', '四步走完'];
  /* Highest y a scene title may reach (freq title top ≈ 461). Plate stays above it. */
  var CONTENT_CEILING = 464;
  var TOOL_Y = 376;
  var TOOL_H = 28;
  var STRIP_PAD = 10;

  function isDesign(step) {
    return step === 1 || step === 2 || step === 3;
  }

  function plan(opts) {
    opts = opts || {};
    var step = opts.step | 0;
    var gate = !!opts.gate;
    var phone = !!opts.phone;
    var onLook = step === 0 && !gate;
    var onDesign = isDesign(step) && !gate;
    var hasSub = onLook || onDesign;
    var chipH = 26;
    var subH = hasSub ? 26 : 0;
    var topPad = 4;
    var shadow = 2;
    var rowGap = 8;
    var botPad = 3;
    var chipY = H - topPad - chipH / 2;
    var subY = 0;
    var plateBottom;
    if (hasSub) {
      subY = chipY - chipH / 2 - shadow - rowGap - subH / 2;
      plateBottom = subY - subH / 2 - shadow - botPad;
    } else {
      plateBottom = chipY - chipH / 2 - shadow - botPad;
    }

    var avatarXs = opts.avatarXs || (phone ? [24, 870, 930] : [28, 890, 940]);
    var avatarR = 20;
    var left = avatarXs[0] + avatarR + 8;
    var avatarLimit = avatarXs[1] - avatarR - 8;
    var rightLimit = opts.rightReserve != null ? Math.min(opts.rightReserve, avatarLimit) : avatarLimit;

    var minW = [100, 124, 100, 100];
    var gap = 14;
    var sumMin = minW[0] + minW[1] + minW[2] + minW[3];
    var avail = rightLimit - left;
    var widths = minW.slice();
    var extra = avail - sumMin - gap * 3;
    if (extra > 0) {
      var add = Math.min(extra, 48);
      widths[0] += Math.floor(add * 0.22);
      widths[1] += Math.floor(add * 0.34);
      widths[2] += Math.floor(add * 0.22);
      widths[3] += add - Math.floor(add * 0.22) - Math.floor(add * 0.34) - Math.floor(add * 0.22);
    } else if (extra < 0) {
      var scale = (avail - gap * 3) / sumMin;
      var i;
      for (i = 0; i < 4; i++) widths[i] = Math.max(78, Math.floor(minW[i] * scale));
    }
    var steps = [];
    var x = left;
    var s;
    for (s = 0; s < 4; s++) {
      steps.push({
        label: STEP_LABELS[s],
        x: x + widths[s] / 2,
        y: chipY,
        w: widths[s],
        h: chipH
      });
      x += widths[s] + gap;
    }

    var subs = [];
    var title = null;
    if (onLook) {
      var pw = 88;
      var pg = 10;
      var px = left;
      var p;
      for (p = 0; p < 3; p++) {
        subs.push({
          label: PHASE_LABELS[p],
          x: px + pw / 2,
          y: subY,
          w: pw,
          h: subH
        });
        px += pw + pg;
      }
      var titleW = 132;
      var titleX = px + 6 + titleW / 2;
      var maxTitle = rightLimit - titleW / 2;
      if (titleX > maxTitle) titleX = maxTitle;
      title = { text: '伍澍暘 · 看图', x: titleX, y: subY, w: titleW, h: 18 };
    } else if (onDesign) {
      var tw = 108;
      var tg = 12;
      var total = tw * 3 + tg * 2;
      var start = Math.max(left, (W - total) / 2);
      if (start + total > rightLimit) start = Math.max(left, rightLimit - total);
      var t;
      for (t = 0; t < 3; t++) {
        subs.push({
          label: TAB_LABELS[t],
          x: start + tw / 2,
          y: subY,
          w: tw,
          h: subH
        });
        start += tw + tg;
      }
    }

    return {
      W: W,
      H: H,
      step: step,
      hasSub: hasSub,
      onLook: onLook,
      onDesign: onDesign,
      chipH: chipH,
      subH: subH,
      chipY: chipY,
      subY: subY,
      plateBottom: plateBottom,
      chromeH: H - plateBottom,
      shadow: shadow,
      left: left,
      rightLimit: rightLimit,
      steps: steps,
      subs: subs,
      title: title
    };
  }

  function heartGeom(plateBottom, stage) {
    stage = stage | 0;
    if (stage < 0) stage = 0;
    if (stage > 4) stage = 4;
    var h = 26;
    var y = plateBottom - 8 - h / 2;
    var x0 = 12;
    var maxRight = 760;
    var labelW = 72;
    var widths = [108, 96, 96, 112];
    var arrowW = 16;
    var hintW = 84;
    var cursor = x0 + labelW + 4;
    var items = [];
    var i;
    for (i = 0; i < 4; i++) {
      var mode = stage >= 4 || i < stage ? 'done' : (i === stage ? 'now' : 'later');
      items.push({
        kind: 'pill',
        label: HEART_LABELS[i],
        x: cursor + widths[i] / 2,
        y: y,
        w: widths[i],
        h: h,
        mode: mode
      });
      cursor += widths[i];
      if (i < 3) {
        items.push({ kind: 'arrow', x: cursor + arrowW / 2, y: y, w: arrowW, h: 16 });
        cursor += arrowW;
      }
    }
    var hintX = cursor + 8 + hintW / 2;
    var barRight = hintX + hintW / 2 + 8;
    if (barRight > maxRight) {
      var overflow = barRight - maxRight;
      hintW = Math.max(64, hintW - overflow);
      hintX = cursor + 8 + hintW / 2;
      barRight = Math.min(maxRight, hintX + hintW / 2 + 8);
    }
    return {
      y: y,
      h: h,
      bar: { x: x0, y: y, w: barRight - x0, h: h + 6 },
      label: { text: '四步心跳', x: x0 + labelW / 2, y: y, w: labelW, h: 16 },
      items: items,
      hint: { text: HEART_HINTS[stage], x: hintX, y: y, w: hintW, h: 16 },
      toolY: TOOL_Y,
      toolH: TOOL_H,
      stripTop: TOOL_Y + TOOL_H / 2 + STRIP_PAD
    };
  }

  function rectOf(r) {
    return {
      l: r.x - r.w / 2,
      r: r.x + r.w / 2,
      b: r.y - r.h / 2,
      t: r.y + r.h / 2
    };
  }

  function hit(a, b, pad) {
    pad = pad || 0;
    var A = rectOf(a);
    var B = rectOf(b);
    return A.l - pad < B.r && A.r + pad > B.l && A.b - pad < B.t && A.t + pad > B.b;
  }

  function problems(p) {
    var out = [];
    var i, j, a, b;
    if (p.plateBottom < CONTENT_CEILING) {
      out.push('plate ' + p.plateBottom + ' covers content ceiling ' + CONTENT_CEILING);
    }
    for (i = 0; i < p.steps.length; i++) {
      a = p.steps[i];
      if (a.label !== STEP_LABELS[i]) out.push('step label ' + a.label);
      if (a.x - a.w / 2 < p.left - 0.5) out.push('step ' + a.label + ' past left');
      if (a.x + a.w / 2 > p.rightLimit + 0.5) out.push('step ' + a.label + ' past right');
      if (a.y + a.h / 2 > H - 1) out.push('step ' + a.label + ' off top');
      if (a.y - a.h / 2 - p.shadow < p.plateBottom) out.push('step ' + a.label + ' out of plate');
      for (j = i + 1; j < p.steps.length; j++) {
        if (hit(a, p.steps[j], 4)) out.push('steps overlap ' + a.label + ' / ' + p.steps[j].label);
      }
    }
    for (i = 0; i < p.subs.length; i++) {
      a = p.subs[i];
      if (a.x - a.w / 2 < p.left - 0.5) out.push('sub ' + a.label + ' past left');
      if (a.x + a.w / 2 > p.rightLimit + 0.5) out.push('sub ' + a.label + ' past right');
      if (a.y - a.h / 2 - p.shadow < p.plateBottom) out.push('sub ' + a.label + ' out of plate');
      for (j = i + 1; j < p.subs.length; j++) {
        if (hit(a, p.subs[j], 4)) out.push('subs overlap ' + a.label + ' / ' + p.subs[j].label);
      }
      for (j = 0; j < p.steps.length; j++) {
        b = {
          x: p.steps[j].x,
          y: p.steps[j].y - p.shadow / 2,
          w: p.steps[j].w,
          h: p.steps[j].h + p.shadow
        };
        var subBox = { x: a.x, y: a.y - p.shadow / 2, w: a.w, h: a.h + p.shadow };
        if (hit(b, subBox, 2)) out.push('row overlap ' + p.steps[j].label + ' / ' + a.label);
      }
    }
    if (p.title) {
      var last = p.subs[p.subs.length - 1];
      if (last && hit(p.title, last, 4)) out.push('title overlaps ' + last.label);
      if (p.title.x + p.title.w / 2 > p.rightLimit + 0.5) out.push('title past right');
      for (j = 0; j < p.steps.length; j++) {
        b = {
          x: p.steps[j].x,
          y: p.steps[j].y - p.shadow / 2,
          w: p.steps[j].w,
          h: p.steps[j].h + p.shadow
        };
        if (hit(p.title, b, 2)) out.push('title overlaps ' + p.steps[j].label);
      }
    }
    return out;
  }

  function heartProblems(plateBottom) {
    var out = [];
    var g = heartGeom(plateBottom, 0);
    var strip = { x: 260, y: TOOL_Y, w: 480, h: TOOL_H + STRIP_PAD * 2 };
    if (hit(g.bar, strip, 2)) out.push('heart overlaps tool strip');
    if (g.bar.y + g.bar.h / 2 > plateBottom - 4) out.push('heart overlaps chrome plate');
    if (g.bar.x + g.bar.w > 772) out.push('heart runs into score card');
    var pills = [];
    var i;
    for (i = 0; i < g.items.length; i++) {
      if (g.items[i].kind === 'pill') pills.push(g.items[i]);
    }
    if (pills.length !== 4) out.push('heart pills ' + pills.length);
    for (i = 0; i < pills.length; i++) {
      if (pills[i].label !== HEART_LABELS[i]) out.push('heart label ' + pills[i].label);
      if (i > 0 && hit(pills[i], pills[i - 1], 2)) out.push('heart pills overlap');
      if (hit(pills[i], g.label, 2)) out.push('heart pill overlaps title');
      if (hit(pills[i], g.hint, 2)) out.push('heart pill overlaps hint');
    }
    if (g.hint.x + g.hint.w / 2 > g.bar.x + g.bar.w - 4) out.push('hint outside bar');
    return out;
  }

  var api = {
    W: W,
    H: H,
    STEP_LABELS: STEP_LABELS,
    HEART_LABELS: HEART_LABELS,
    CONTENT_CEILING: CONTENT_CEILING,
    TOOL_Y: TOOL_Y,
    plan: plan,
    heartGeom: heartGeom,
    problems: problems,
    heartProblems: heartProblems
  };
  root.WBChromeLayout = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
