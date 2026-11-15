/** Solo preview: no Colyseus server. Local fake room so 入寺 works statically. */
export async function connectTemple({ nickname, avatarType }) {
  const sessionId = "local";
  const player = {
    id: sessionId,
    nickname: String(nickname || "无名云客").slice(0, 16),
    avatarType: avatarType === "daotong" ? "daotong" : "shami",
    x: (Math.random() - 0.5) * 4,
    z: 6 + Math.random() * 2,
    rotY: Math.PI,
    anim: "idle",
    sceneId: "shanmen",
    beadCount: 0,
    robeVariant: Math.floor(Math.random() * 4),
    robeHue: Math.random(),
    skinTone: Math.floor(Math.random() * 4),
    hairTone: Math.floor(Math.random() * 4),
    accessory: Math.floor(Math.random() * 4),
    onChange() {},
  };

  const players = {
    get size() {
      return 1;
    },
    onAdd(cb) {
      queueMicrotask(() => cb(player, sessionId));
    },
    onRemove() {},
  };

  const room = {
    sessionId,
    state: {
      players,
      roomLabel: "云山一院 · 单机预览",
      maxClients: 1,
      serviceMode: "none",
      queueNarrative: "",
    },
    send() {},
    onMessage() {},
    onStateChange() {},
  };

  return { client: null, room };
}
