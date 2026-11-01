# 总册实现计划 · 2026-11-01（可点）

- 状态：**Silas 已放行「可以做」** · 按本计划切片实现并推 `main`（Pages tip）
- 正式名：**伍澍暘** · 助手：**小宇**
- 总册定稿：[TODAY-CALL-DESIGN-2026-11-01.md](./TODAY-CALL-DESIGN-2026-11-01.md)
- 合同：[`PRODUCT.md`](../PRODUCT.md) §4 · [`PLAYER-TEST-CASES.md`](../PLAYER-TEST-CASES.md) `B-LD-*`
- 代码落点：`visual-workbench.*` / `workbench.*` / `custom-play.*` / `wb-audio.js`（**不换 PeerJS**）
- 节奏：每刀做完 → `git push origin main` → 硬刷 tip → 把 **commit + Pages 链接** 回给 Silas；产品官/玩家测按切片签收

---

## 总顺序（Silas 口述优先级）

| # | 切片 | 一句话 | 设计稿 | 验收锚点 |
| --- | --- | --- | --- | --- |
| **1** | ①看图三阶段 | 原理→方法→总结；画面 + 信息拆开 | [LOOK-STEP-SCRIPT.md](./LOOK-STEP-SCRIPT.md) | 顶栏可点进看图；三阶段可翻；文案不糊成一块 |
| **2** | 觉察前置闸 | 「什么样的关卡最难/最复杂」答对才进关卡设计 | [AWARENESS-GATE-BEFORE-DESIGN.md](./AWARENESS-GATE-BEFORE-DESIGN.md) | 错答挡下；对答解锁关卡设计 |
| **3** | 关卡设计合并 | 顶栏一步 + 二级 **摆关\|设置\|关联** | [LEVEL-STEPS-234-REDESIGN.md](./LEVEL-STEPS-234-REDESIGN.md) | `B-LD-1`…`B-LD-5`；设置含店；关联=BGM |
| **4** | 音乐×九关 + 角色 SFX | 选曲挂关；走路/砍击 | [MUSIC-LEVEL-BIND-UI.md](./MUSIC-LEVEL-BIND-UI.md) | 可挂可听；试玩走路/砍击有声 |
| **5** | 试玩换壳 | 新 Cocos 2D 风壳；单机/联机核心与联网机制不变 | [PLAYTEST-SHELL-PARITY.md](./PLAYTEST-SHELL-PARITY.md) | 不跳全新界面；PeerJS 不换栈；solo-first |

现网对照（实现前）：顶栏仍为六步实现；合同已是四芯片+二级——本计划把代码追上合同。

---

## 切片 1 · ①看图（原理 / 方法 / 总结）

**目标**  
按 LOOK 稿把看图步改成三阶段叙事：每阶段 **画面区 + 信息区** 拆开（不挤一坨字）。

**主要改**  
- `visual-workbench.js` / `visual-workbench.html`（及 workbench 同源若仍双壳）里 Look 场景文案与布局  
- 必要时补 `docs/LOOK-STEP-SCRIPT.md` 与 UI 对齐的一句注

**完成定义**  
- 三阶段可顺序点/滑；每阶段有独立画面提示 + 短信息  
- 横屏 844×390 可读；姓名锁不变  
- tip 升版；Pages 硬刷可验

**推送后给 Silas**  
`commit` + `https://silaswu2026.github.io/shuyang-chengzhangwu/shuyang-ai/learn/cocos/visual-workbench.html?v=<tip>`

---

## 切片 2 · 觉察前置问答闸门

**目标**  
进入「关卡设计」前强制觉察问答（什么样的关卡最难 / 最复杂）；**答对才进**。

**主要改**  
- 顶栏/步进逻辑：关卡设计入口挂闸（见 AWARENESS 稿）  
- 问答 UI + 对错反馈；失败可重答，不白屏

**完成定义**  
- 未过闸无法进摆关/设置/关联  
- 过闸后本会话（或存档策略按稿）可进关卡设计  
- tip + Pages 链接

---

## 切片 3 · 关卡设计（一级 + 二级三钮）

**目标**  
顶栏四芯片：`①看图 · 关卡设计 · ⑤觉察（若仍露出）· ⑥听选` 按合同；**关卡设计内**平铺 **摆关 | 设置 | 关联**。

| 二级 | 内容 |
| --- | --- |
| **摆关** | 原③：筹码摆放；前两格安全 |
| **设置** | 原②频率+跑一次 + **默认装备商店** |
| **关联** | BGM↔九关（可跳⑥） |

**主要改**  
- 顶栏 chip 从六步收成合同四步结构  
- Frequency / Build / Equip 场景收进二级切换，**不丢存档**（`B-LD-5`）  
- 装备不嵌回摆关网格

**完成定义**  
- `B-LD-1`…`B-LD-5`；`P-L2-1`…`P-L2-5` / `P-L2-9`…`11` 可测  
- tip + Pages；请 **玩家测** 跑 B-LD；**产品官** 签结构

---

## 切片 4 · 音乐绑九关 + 走路/砍击

**目标**  
听选/关联面：选 BGM 可挂到不同关；角色 **走路声、砍击声** 可闻（素材用现网 MacLeod/Kenney 或稿内清单，不引 Mixkit）。

**主要改**  
- `wb-audio.js` + 听选/关联 UI  
- `custom-play.js` 播放走路/砍击钩子  
- 未挂关时试玩回退全局曲（诚实）

**完成定义**  
- 九关可挂可清；试玩有走路/砍击  
- tip + Pages；署名仍可见

---

## 切片 5 · 试玩换新壳（机制不变）

**目标**  
试玩入口换 **新 Cocos 2D 风格壳**；**单机 + 联机都保留**；玩法核心与 **PeerJS 联网机制与旧版一致**，禁止跳到「全新另一套界面」。

**主要改**  
- `custom-play.html` / 壳层视觉对齐 workbench 一家风  
- 联机入口仍在壳上；solo-first（不堵单机）  
- **零换栈**

**完成定义**  
- PLAYTEST-SHELL-PARITY 清单过线；D7/F9 / 联网回归  
- tip + Pages；请玩家测全路径

---

## 全局禁区（每刀都守）

1. 正式名只许 **伍澍暘**；助手 **小宇**  
2. 不换 PeerJS / 不重写 `custom-play` 合同玩法  
3. 只绿/红/蓝忍者；海军蓝·金·绿一家风  
4. 手机横屏主验；每刀推 `main` 刷 tip  
5. 设计/用例/验收三项齐：改行为就同步 `DESIGN.md` / `PLAYER-TEST-CASES.md` / 本计划勾选

---

## 进度勾选

- [ ] 1 看图三阶段  
- [ ] 2 觉察前置闸  
- [ ] 3 关卡设计合并  
- [ ] 4 音乐×九关 + SFX  
- [ ] 5 试玩换壳  

*小宇 · 2026-11-01 · Asia/Shanghai*
