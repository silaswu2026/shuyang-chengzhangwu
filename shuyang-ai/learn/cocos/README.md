# Cocos2d-JS Lite · 课程试玩

- `workbench.html?lesson=tonight` — 今晚六步（①看图 ②频率 ③摆关 ④装备 ⑤觉察 ⑥听选）都是 Cocos 场景。画面用节点拼旧课件插画。摆关可放弹簧、迷雾、岩石，并用金币买飞镖、砍刀、枪。存档是 `xygo-custom-level` JSON v1.2（仍带 v1.1 的 tiles / traps / mine；没有 wallet 时按 0 金币读）
- `freq-spike.html` — 频率刺教学（de-shelled，工作台已有同一步）
- `custom-play.html` — 读 `localStorage.xygo-custom-level`（v1.2，也能读 v1.1）跑孩子摆的关，并用装备的武器打小怪和鳄王
  - 标签：**同玩法 · 引擎下一刀**
  - 备用：`xy-go/?custom=1`

引擎：`vendor/cocos2d-html5/cocos2d-js-v3.13-lite.js` · renderMode 1
