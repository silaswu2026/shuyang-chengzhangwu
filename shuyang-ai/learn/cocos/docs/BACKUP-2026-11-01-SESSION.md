# 成长屋会话备份 · 2026-11-01（Asia/Shanghai）

> **用途**：Grok Bot usage 将到期时的耐久快照。若 Cursor/Bot 不可用，只凭本仓 GitHub 即可恢复产品状态、明日课与教学体系。  
> **正式名**：伍澍暘（禁 五树杨 / 伍树杨）· **助手**：小宇  
> **铁律**：设计/代码/文档/照片/配置一律进 GitHub；禁止只留在 Cursor cloud。  
> **基线 SHA（本备份提交之前）**：`6fb20d7` — `docs(course): narrow 11-02 to level-editor-only + plan + teaching system`

---

## 0. 双轨总纲（Silas 语音 · 挂电话前）

1. **共学轨**：每天与伍澍暘一起学、一起总结。  
2. **产品轨**：把每天学与总结沉淀成**可给第三方用的课件系统**（见 `TEACHING-SYSTEM-FOR-THIRD-PARTIES.md`）。

---

## 1. 现网 tip / URL（Pages）

| 面 | tip | 真 URL（硬刷） | 备注 |
| --- | --- | --- | --- |
| 试玩 | **c51** | `…/shuyang-ai/learn/cocos/custom-play.html?v=c51` | 去槽圆角裁切 + `min(3,dpr)` 缓冲；叠 c50/c49/c48/c47… |
| 选关 | **ls2** | `…/shuyang-ai/learn/cocos/level-select.html?v=ls2` | 试完 1–4 后一点进 `c51&level=N`；5–8 闸前灰 |
| 工坊脚本 | **ldt32** | `visual-workbench.html?v=ldt32` · `wb-store.js?v=ldt32` | §8 电/凹/大/箱可摆等；meta `wb-build` 已与脚本对齐 **ldt32** |
| 工坊族史 | ldt31 → ldt32 | DESIGN.md 条目 | ldt31 = §8 八条；ldt32 = 链到 play tip（曾指 c49） |
| 联机 | PeerJS + BroadcastChannel | `custom-play.html?v=c51&net=1` | **不换栈**；同机两标签优先 BC |

**c51 根因（手机仍糊）**：横屏圆角 `overflow:hidden` 裁切 WebGL 合成发软；非仅 DPR。验证截图见本目录 assets。

**Live Pages 根**：https://silaswu2026.github.io/shuyang-chengzhangwu/

---

## 2. 关键提交 SHA（备份前已在 origin/main）

| SHA | 摘要 |
| --- | --- |
| `6fb20d7` | 收窄 11-02 仅编辑器 + 方案 + 第三方教学体系 |
| `2c295ed` | 11-02 关卡编辑器十步课纲（早期含回顾版，已被 6fb20d7 收窄） |
| `98fecbb` | **c51** 手机软糊：去槽圆角 + 一次写满 DPR 缓冲 |
| `997f687` | c50 文档：DPR≤3 retina |
| `38c6cb1` | **ls2** 选关：试 L1–4 后一点任意关 |

（更早：c47/ldt31 §8 八条、c46 同窗联机、PRODUCT §8 硬标准等已在 main。）

---

## 3. 明日课（2026-11-02）· 仅关卡编辑器

**状态：方案与课纲已上 GitHub；等 Silas 确认 `LEVEL-EDITOR-PLAN` 后再改玩法/工坊代码。**

| 文件 | 路径 |
| --- | --- |
| 十步课纲 | `shuyang-ai/learn/cocos/docs/COURSE-2026-11-02-LEVEL-EDITOR.md` |
| 完整方案（五问+MVP+整合） | `shuyang-ai/learn/cocos/docs/LEVEL-EDITOR-PLAN-2026-11-02.md` |
| 课堂 JSON | `shuyang-ai/classroom/course-today.json`（`waitForConfirm: true`） |
| DESIGN 抬头 | `shuyang-ai/learn/cocos/DESIGN.md`（明天范围锁） |

**收窄规则（Silas）**：不纳入旧四段回顾（角色背景 / 序列帧 / 道具陷阱奖励 / 入迷）；不讲课题 A 系列关卡、B 联网原理。主课 = 课题 C 关卡编辑器（伍澍暘已选）。

**十步（摘要）**：开场只做编辑器 → 玩vs造 → 看得见/立刻试/存得住 → 三面板 → 零件四类 → 怎么摆小故事 → **摆通·试玩·存「我的第1关」** → 再打开 → 钩子自检（惊喜+停点） → 收束预告。

**MVP 技术（确认后做，确认前不动代码）**：

- 复用 `visual-workbench` + `custom-play` + `localStorage` `xygo-custom-level` v1.2  
- 新建「我的关」名册，与正式 1–8 / `sycocos-level-progress` **隔离**  
- 不新开引擎；PeerJS **不进明天课**  
- 效果三连：看得见 · 立刻试 · 存得住  

---

## 4. 课题全景（教学链）

| 课题 | 状态 |
| --- | --- |
| 角色和背景设计 | 已教（旧知；明日不回顾） |
| 序列帧动画 | 已教 |
| 道具·陷阱·奖励 | 已教（工坊可摆） |
| 让玩家入迷 / 钩子与停点 | 已教（①看图） |
| A 一系列关卡 | 已提出 · **以后课** |
| B 联网怎么连 | 已提出 · **以后课**（现网 PeerJS 保留） |
| **C 关卡编辑器** | **明日主课** |

递进思想：**画面 → 机制 → 沉浸**；知识点递进；课题自选；边做边学。产品化说明：`docs/TEACHING-SYSTEM-FOR-THIRD-PARTIES.md`。

---

## 5. 铁规则 / PRODUCT 硬标准（恢复时勿丢）

1. 正式名 **伍澍暘** / 助手 **小宇**（UI、测试、文档一致）。  
2. 视觉：海军蓝·金·绿统一；联网局与 Cocos 课件同风。  
3. 角色：**仅绿 / 红 / 蓝三忍者**。  
4. 联网：**保留 PeerJS / xy-go**，不换栈。  
5. 手机验收：**必须横屏** ~844×390（或 896×414）；竖屏结果无效。  
6. 一切耐久物推 **GitHub main**（Pages）；切片做完即推。  
7. 自制关不与正式 1–8 Boss 名册混表。  
8. 无声空舞台禁止；诚实「即将开放」优于假接通。

权威：`PRODUCT.md` §0.1 / §8 · `PLAYER-TEST-CASES.md` · `DESIGN.md`。

---

## 6. 本备份附带资源

目录：`shuyang-ai/learn/cocos/docs/assets/backup-2026-11-01/`

| 文件 | 说明 |
| --- | --- |
| `blur-verify-c51-dpr3.png` | c51 缓冲 DPR=3 核对（桌面/仿真） |
| `blur-verify-c51-ninja-ground.png` | 忍者轮廓+草地边 1:1 清晰度核 |
| `c49-dpr3-cold-open.png` | c49 冷开对照 |
| `c49-dpr3-ground-zoom.png` | c49 地面放大对照 |

盒内另有大量 `/workspace/playtest-*`、`/home/box/screenshots/c4*.png` 过程截图：**未全部入库**（体积大、属过程 QA）。恢复玩法不依赖它们；关键结论已写进 DESIGN / PLAYER-TEST。

---

## 7. 待办（Bot 死后接手清单）

1. **等 Silas 口头/聊天确认** `LEVEL-EDITOR-PLAN-2026-11-02.md` → 再按 MVP 改工坊与「我的关」存档。  
2. 真机硬刷 c51：若仍糊，拆层（地砖/角色/天空）再修。  
3. 正式 1–8 独特跑道内容（现 ls2 暂复用 custom-play 帧）。  
4. 课题 A/B 排期。  
5. meta `wb-build` 曾滞留 ldt30（脚本已是 ldt32）— 本备份提交已对齐。  
6. 第三方教学体系可继续模块化（模板课纲 / 验收表 / 品牌换皮指南）— 见体系文。

---

## 8. 仓外 / 勿入库

| 项 | 处理 |
| --- | --- |
| Cursor store 大量 agent assets（png/webp/mp4） | 过程素材；**未整包推 GitHub** |
| `/workspace` 下过时 clone（`repo/`、`repos/shuyang-*`） | 指向旧 SHA；**勿 push** 以免回退 main |
| `ai-daoist-fulu` | 独立仓，已与 origin/main 同步干净；非本课主仓 |
| 凭证 / PeerJS key 若有私密配置 | **禁止**写入公开 GitHub；本备份不含 secrets |
| 通话录音原文 | 要点已写入课纲/方案/本文件 |

---

## 9. 快速自检命令（接手人）

```bash
cd shuyang-chengzhangwu
git fetch origin && git log origin/main -5 --oneline
rg -n 'play-build|wb-build|level-select-build' shuyang-ai/learn/cocos/*.html
test -f shuyang-ai/learn/cocos/docs/BACKUP-2026-11-01-SESSION.md && echo OK
```

Pages 硬刷：

- https://silaswu2026.github.io/shuyang-chengzhangwu/shuyang-ai/learn/cocos/custom-play.html?v=c51  
- https://silaswu2026.github.io/shuyang-chengzhangwu/shuyang-ai/learn/cocos/level-select.html?v=ls2  
- 课纲：`…/blob/main/shuyang-ai/learn/cocos/docs/COURSE-2026-11-02-LEVEL-EDITOR.md`  
- 方案：`…/blob/main/shuyang-ai/learn/cocos/docs/LEVEL-EDITOR-PLAN-2026-11-02.md`  
- 体系：`…/blob/main/shuyang-ai/learn/cocos/docs/TEACHING-SYSTEM-FOR-THIRD-PARTIES.md`

---

*备份撰写：2026-11-01 约 22:48 Asia/Shanghai · 小宇 / Grok Bot executor*
