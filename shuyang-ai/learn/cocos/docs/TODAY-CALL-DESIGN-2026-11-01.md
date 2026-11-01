# 今日通话设计总册 · 2026-11-01

- **状态**：**设计授权已开**；**全部待 Silas 确认后才实现**；**未改代码**
- 时区：Asia/Shanghai · 正式名锁：**伍澍暘** · 助手：**小宇**
- 仓库：`silaswu2026/shuyang-chengzhangwu` · 路径前缀 `shuyang-ai/learn/cocos/docs/`
- 权威合同仍见 [`../PRODUCT.md`](../PRODUCT.md) · [`../DESIGN.md`](../DESIGN.md)

---

## ⛔ 确认前禁止改代码

在 Silas **书面/口头明确确认**对应方案之前，禁止改动：

| 区域 | 禁改 |
| ---

## 产品官补签 · 总册 · 2026-11-01

- **结论：总册口径 PASS**（设计授权已开；**Silas 确认前禁改代码**）
- 「并 vs 不并」醒目标题与默认**不并**正确；五柱索引齐全；名锁 STT 注记正确。
- 子篇：觉察前置 / 试玩换壳 / MUSIC（含 §9b）均已补签 PASS；LOOK / 234 此前已 PASS。
- 实现仍须：Silas 拍板 → 产品官放行 → 小宇改代码。

---

 | --- |
| ①看图 | `LookScene` 及分镜相关实现 |
| ③摆关 | Build / 筹码 / 安全区逻辑 |
| ⑥听选 | 喇叭抽屉 / 四心情曲库播放逻辑 |
| L3 试玩 | `custom-play` 玩法核心、PeerJS 联网栈、`xy-go` 备路核心 |

本总册与子文档均为**设计稿**；实现刀另开，且须 Silas 拍板后由产品官放行。

---

## 待 Silas 确认：并 vs 不并

> **醒目标题 · 产品官口径（必须遵守）**

| 项 | 内容 |
| --- | --- |
| **现状合同 + 已补签 234** | **六步分立**：①看图 ②频率 ③摆关 ④装备 ⑤觉察 ⑥听选；**②③④不合并**；**④不吞回③** |
| **口述张力** | Silas 口述出现「二三四步合并」；产品官/PRODUCT **不把口述张力自动改合同** |
| **在明确「要合并」之前** | **实现与补签仍按不并** |

### 两种后果（并列，不替 Silas 选）

| 选项 | 顶栏 / 步数 | 验收表 / PLAYER | 摆关 UI |
| --- | --- | --- | --- |
| **不并**（现行默认） | 仍六步 chip ①–⑥ | P-L2-* / B7–B9/B16 等保持分立；④独立商店验收 | 「设计关卡」**一列两段**：摆放关卡 + 每个关卡的设置（不拆成两个顶栏入口） |
| **并**（仅当 Silas 明确说要） | 须改顶栏步数（例如把 ②③④ 收成更少步） | 须同步改 PRODUCT 验收句与 `PLAYER-TEST-CASES` | 信息架构可一章综合呈现，但步边界合同重写 |

**方案内容**可以在 [`LEVEL-STEPS-234-REDESIGN.md`](./LEVEL-STEPS-234-REDESIGN.md) **一章综合呈现**（调研+维度+口述）；**结构是否合并**单独列为待确认，不偷改六步合同。

---

## 目录（五根柱 + 流水账）

| # | Silas 口述柱 | 文档 | 一句话 |
| --- | --- | --- | --- |
| 1 | ①看图重做 | [`LOOK-STEP-SCRIPT.md`](./LOOK-STEP-SCRIPT.md) | 反面链条分镜：原理→方法→总结；第二图「钓鱼的人」；待拍板四问 |
| 2 | 觉察前置 | [`AWARENESS-GATE-BEFORE-DESIGN.md`](./AWARENESS-GATE-BEFORE-DESIGN.md) | 进关卡设计前问伍澍暘难/中/复杂三问，判对错后再摆关 |
| 3 | 关卡设计 ②③④ | [`LEVEL-STEPS-234-REDESIGN.md`](./LEVEL-STEPS-234-REDESIGN.md)（短链 [`LEVEL-DESIGN-234.md`](./LEVEL-DESIGN-234.md)） | 横版维度调研 + 道具/陷阱六类/奖励三档/角色武器；一列两段摆关；**产品官补签 PASS（不并）** |
| 4 | 音乐×九关 + 角色音效 | [`MUSIC-LEVEL-BIND-UI.md`](./MUSIC-LEVEL-BIND-UI.md) | 选 BGM 关联九关；补「砍人声 / 走路声」选角色细节 |
| 5 | 试玩最后一章换壳 | [`PLAYTEST-SHELL-PARITY.md`](./PLAYTEST-SHELL-PARITY.md) | 单机+联机机制不变；UI 对齐现 Cocos 2D 工坊壳；不跳陌生界面；只换壳 |
| — | 口述流水账 | [`LEVEL-DESIGN-DICTATION.md`](./LEVEL-DESIGN-DICTATION.md) | 批次 1–4 原文归档（含授权口径与名锁注记） |

---

## 各篇状态速查

| 文档 | 状态 | 代码 |
| --- | --- | --- |
| LOOK-STEP-SCRIPT | 方案待拍板 | 未改 LookScene |
| AWARENESS-GATE-BEFORE-DESIGN | 产品官补签 PASS · 待 Silas 拍板 | 未改 ⑤/③ |
| LEVEL-STEPS-234-REDESIGN | 产品官补签 PASS · 待 Silas 拍板 | 未改 ②③④ |
| MUSIC-LEVEL-BIND-UI | 产品官补签 PASS（含 §9b；待 Silas §10） | 未改 ⑥ / L3 |
| PLAYTEST-SHELL-PARITY | 产品官补签 PASS · 待 Silas 拍板 | 未改玩法核心 / PeerJS |
| LEVEL-DESIGN-DICTATION | 流水账；批次 4 已并 | n/a |

---

## 名锁附录（STT）

口述语音识别可能写成「吴树阳」等。文档与 UI **一律**写作正式名 **伍澍暘**；禁止「五树杨 / 伍树杨」当正式名。助手 **小宇**（非小雨）。详见口述流水账批次 4。

---

## 实现门槛（再强调）

1. Silas 确认本总册及子文档相关段落  
2. 「并 vs 不并」若未明示「要合并」→ **按不并** 开实现刀  
3. 产品官放行 → 小宇改代码并推 main → 玩家测 / Jobs QA  

*小宇整理 · 2026-11-01 · 请 @产品官 审阅总册口径*
