export function createRituals({ onChange, audio }) {
  let mode = "idle"; // idle | hapjang | bow | beads | moktak
  let beadCount = 0;
  let moktakAuto = false;
  let moktakTimer = 0;

  const beadsOverlay = document.getElementById("beadsOverlay");
  const beadKnob = document.getElementById("beadKnob");
  const beadCountEl = document.getElementById("beadCount");
  const beadsTrack = document.getElementById("beadsTrack");

  function setMode(next) {
    if (mode === next && next !== "moktak") {
      // toggle off
      mode = "idle";
      moktakAuto = false;
      hideBeads();
      onChange?.({ anim: "idle", beadCount });
      syncButtons();
      return;
    }
    mode = next;
    if (next !== "beads") hideBeads();
    if (next === "beads") showBeads();
    if (next === "moktak") {
      audio?.playMoktak();
      onChange?.({ anim: "moktak", pulse: true });
      // brief then idle unless auto
    } else {
      onChange?.({ anim: next === "idle" ? "idle" : next, beadCount });
    }
    syncButtons();
  }

  function syncButtons() {
    for (const id of ["btnHapjang", "btnBow", "btnBeads", "btnMoktak"]) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.classList.toggle(
        "active",
        (id === "btnHapjang" && mode === "hapjang") ||
          (id === "btnBow" && mode === "bow") ||
          (id === "btnBeads" && mode === "beads") ||
          (id === "btnMoktak" && (mode === "moktak" || moktakAuto))
      );
    }
  }

  function showBeads() {
    beadsOverlay?.classList.add("on");
    beadCount = 0;
    if (beadCountEl) beadCountEl.textContent = `0 / 108`;
    if (beadKnob) beadKnob.style.left = "0px";
  }
  function hideBeads() {
    beadsOverlay?.classList.remove("on");
  }

  // drag beads
  let dragging = false;
  let lastX = 0;
  beadsTrack?.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    beadsTrack.setPointerCapture(e.pointerId);
  });
  beadsTrack?.addEventListener("pointermove", (e) => {
    if (!dragging || mode !== "beads") return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    if (Math.abs(dx) > 8) {
      beadCount = Math.min(108, beadCount + 1);
      audio?.playBead();
      if (beadCountEl) beadCountEl.textContent = `${beadCount} / 108`;
      const max = (beadsTrack.clientWidth || 320) - 48;
      if (beadKnob) beadKnob.style.left = `${(beadCount / 108) * max}px`;
      onChange?.({ anim: "beads", beadCount });
      if (beadCount >= 108) {
        // complete
      }
    }
  });
  beadsTrack?.addEventListener("pointerup", () => {
    dragging = false;
  });
  document.getElementById("closeBeads")?.addEventListener("click", () => setMode("idle"));

  document.getElementById("btnHapjang")?.addEventListener("click", () => setMode("hapjang"));
  document.getElementById("btnBow")?.addEventListener("click", () => setMode("bow"));
  document.getElementById("btnBeads")?.addEventListener("click", () => setMode("beads"));
  document.getElementById("btnMoktak")?.addEventListener("click", () => {
    if (moktakAuto) {
      moktakAuto = false;
      mode = "idle";
      onChange?.({ anim: "idle" });
      syncButtons();
      return;
    }
    // single tap; double-ish via holding auto: second click soon enables auto — use long: toggle auto on second press pattern
    setMode("moktak");
  });
  document.getElementById("btnMoktakAuto")?.addEventListener("click", () => {
    moktakAuto = !moktakAuto;
    mode = moktakAuto ? "moktak" : "idle";
    syncButtons();
    onChange?.({ anim: moktakAuto ? "moktak" : "idle" });
  });

  window.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    if (e.code === "Digit1" || e.code === "KeyE" || e.code === "Space") {
      e.preventDefault();
      setMode("bow");
    } else if (e.code === "Digit2") setMode("beads");
    else if (e.code === "Digit3") setMode("hapjang");
    else if (e.code === "Digit5") {
      if (e.shiftKey) {
        moktakAuto = !moktakAuto;
        mode = moktakAuto ? "moktak" : "idle";
        syncButtons();
        onChange?.({ anim: mode });
      } else setMode("moktak");
    } else if (e.code === "Escape") setMode("idle");
  });

  function update(dt) {
    if (moktakAuto) {
      moktakTimer += dt;
      if (moktakTimer > 0.55) {
        moktakTimer = 0;
        audio?.playMoktak();
        onChange?.({ anim: "moktak", pulse: true });
      }
    }
  }

  return {
    update,
    get mode() {
      return mode;
    },
    get beadCount() {
      return beadCount;
    },
    get locked() {
      return mode === "bow" || mode === "hapjang" || mode === "beads";
    },
    setMode,
  };
}
