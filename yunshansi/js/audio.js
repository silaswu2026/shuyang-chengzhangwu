/** Split-track WebAudio: ambient / chant / sfx. Synthetic only. */
export function createAudio() {
  let ctx = null;
  const vols = { ambient: 0.35, chant: 0.4, sfx: 0.55 };
  let ambientNodes = [];
  let chantNodes = [];
  let serviceMode = "none";
  let personalChant = true;

  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function noiseBuffer(seconds = 2) {
    const c = ensure();
    const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.4;
    return buf;
  }

  function startAmbient() {
    const c = ensure();
    stopNodes(ambientNodes);
    ambientNodes = [];
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(3);
    src.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 600;
    const g = c.createGain();
    g.gain.value = vols.ambient * 0.15;
    src.connect(filter);
    filter.connect(g);
    g.connect(c.destination);
    src.start();
    ambientNodes.push(src, g);

    // soft tone beds
    [110, 165].forEach((freq, i) => {
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.value = freq;
      const gg = c.createGain();
      gg.gain.value = vols.ambient * (0.02 + i * 0.01);
      o.connect(gg);
      gg.connect(c.destination);
      o.start();
      ambientNodes.push(o, gg);
    });
  }

  function startChant() {
    const c = ensure();
    stopNodes(chantNodes);
    chantNodes = [];
    if (serviceMode !== "none") {
      // communal: stronger drones
      [196, 247, 294].forEach((f, i) => {
        const o = c.createOscillator();
        o.type = i === 0 ? "triangle" : "sine";
        o.frequency.value = f;
        const g = c.createGain();
        g.gain.value = vols.chant * 0.05;
        o.connect(g);
        g.connect(c.destination);
        o.start();
        chantNodes.push(o, g);
      });
      return;
    }
    if (!personalChant) return;
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = 220;
    const g = c.createGain();
    g.gain.value = vols.chant * 0.035;
    o.connect(g);
    g.connect(c.destination);
    o.start();
    const o2 = c.createOscillator();
    o2.type = "triangle";
    o2.frequency.value = 330;
    const g2 = c.createGain();
    g2.gain.value = vols.chant * 0.02;
    o2.connect(g2);
    g2.connect(c.destination);
    o2.start();
    chantNodes.push(o, g, o2, g2);
  }

  function stopNodes(arr) {
    for (const n of arr) {
      try {
        if (n.stop) n.stop();
        if (n.disconnect) n.disconnect();
      } catch (_) {}
    }
    arr.length = 0;
  }

  function playMoktak() {
    const c = ensure();
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(420, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(180, c.currentTime + 0.12);
    const g = c.createGain();
    g.gain.setValueAtTime(vols.sfx * 0.35, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.18);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.2);
  }

  function playBead() {
    const c = ensure();
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = 880;
    const g = c.createGain();
    g.gain.setValueAtTime(vols.sfx * 0.12, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.09);
  }

  return {
    unlock() {
      ensure();
      startAmbient();
      startChant();
    },
    setVolume(track, v) {
      vols[track] = Math.max(0, Math.min(1, v));
      if (track === "ambient") startAmbient();
      if (track === "chant") startChant();
    },
    setPersonalChant(on) {
      personalChant = !!on;
      startChant();
    },
    setServiceMode(mode) {
      serviceMode = mode || "none";
      // communal suppresses personal feel by restarting louder
      startChant();
    },
    playMoktak,
    playBead,
    get vols() {
      return { ...vols };
    },
  };
}
