/**
 * Phone canvas backing store for the workshop (设置 and the rest of the shell).
 * Cocos lite caps retina at min(2, devicePixelRatio). Phones often report 3,
 * so a 2× buffer is still scaled up and the 设置 screen looks soft / mosaic.
 * Desktop dpr ≤ 2 is unchanged. Cap stays at 3 so a 4× screen does not allocate
 * a huge buffer.
 */
(function (root) {
  function cap(dpr) {
    dpr = +dpr;
    if (!(dpr > 0)) dpr = 1;
    return Math.min(3, dpr);
  }

  function patch(cc) {
    if (!cc || cc.__wbDpr3Patched) return false;
    var proto = cc.ContainerStrategy && cc.ContainerStrategy.prototype;
    if (!proto || typeof proto._setupContainer !== 'function') return false;
    proto._setupContainer = function (view, w, h) {
      var locCanvas = cc.game && cc.game.canvas;
      var locContainer = cc.game && cc.game.container;
      if (!locCanvas || !locContainer) return;
      var cssW = Math.max(1, Math.round(w));
      var cssH = Math.max(1, Math.round(h));
      locContainer.style.width = locCanvas.style.width = cssW + 'px';
      locContainer.style.height = locCanvas.style.height = cssH + 'px';
      var devicePixelRatio = 1;
      if (view && view.isRetinaEnabled && view.isRetinaEnabled()) {
        devicePixelRatio = cap(root.devicePixelRatio);
      }
      if (view) view._devicePixelRatio = devicePixelRatio;
      locCanvas.width = Math.round(cssW * devicePixelRatio);
      locCanvas.height = Math.round(cssH * devicePixelRatio);
      try {
        if (cc._renderContext && cc._renderContext.resetCache) cc._renderContext.resetCache();
      } catch (eRc) {}
      try {
        locCanvas.setAttribute('data-wb-dpr', String(devicePixelRatio));
        locCanvas.setAttribute('data-wb-buf', locCanvas.width + 'x' + locCanvas.height);
      } catch (eAttr) {}
    };
    cc.__wbDpr3Patched = true;
    return true;
  }

  var api = { cap: cap, patch: patch };
  root.WBDpr = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
