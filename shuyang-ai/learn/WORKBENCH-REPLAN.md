# 学习工作台技术重规划（第一步）

日期：2026-11-01（上海）  
依据的线上版本：`main` @ `722e5b2`（2026-10-31 23:47 +0800）  
这一步只写计划。不改课页、不改试玩、不改 `xy-go`。

范围是 `shuyang-ai/learn/` 这一套学习工作台：课件、关卡编辑、试玩。教室页（`shuyang-ai/classroom/`）和首页课程壳（`kid.js`）不在这一步里改。它们以后可以链到新的 Cocos 入口。

孩子昨天和另一账号的聊天记录不在仓库里。下面的目标来自这次明确交代的四点，加上仓库里已经提交的代码。对不上的地方写在文末，不在这里选边。

## 目标

1. 学习工作台的整页界面用 Cocos2d-H5 画。一页课件是一个 Cocos 场景，不是一节 HTML。
2. 关卡编辑器按横版跑酷来做，并且要够用：铺地、分层、摆物、调陷阱参数、放检查点和终点、指定这一关的 Boss、在编辑器里用同一套画面试跑。
3. 正式发布的关和 Boss 一一对应。人物、背景、头像、画风只许用仓库里已有的资源。编辑器不能临时造一个新角色或新怪。
4. 单机和联网已经在 `xy-go` 里。编辑器不重做这两套模式。正式关卡进 `xy-go` 已经在读的那份关卡表；孩子随手摆的关继续走「我的关卡」，不混进正式关。

## 现在实际是什么

`shuyang-ai/learn/level-design.html` 是普通 HTML。它加载 `ld-art.js`，预览用页面里的 `<canvas>` 和 `requestAnimationFrame` 画。它不加载 Cocos。

`?path=tonight` 把课件收成四步，对应四个区块：

| 步 | 区块 | 做什么 |
| --- | --- | --- |
| 看图 | `#s0` | 讲「上钩 / 自己决定停」 |
| 频率 | `#sF` | 一个旋钮：地刺每几秒冒一次 |
| 摆关 | `#sM` | 放刺、火，调数字，跑一次 |
| 觉察 | `#s3` | 玩完问一句 |

位置、难度、上节课回顾在 tonight 路径里被藏掉，代码还在同一文件里。

摆好的关写进浏览器 `localStorage` 键 `xygo-custom-level`，版本号 `1.1`。仓库里没有这份存档。

Cocos 只出现在试玩：

- `shuyang-ai/learn/cocos/custom-play.html` 加载 `vendor/cocos2d-html5/cocos2d-js-v3.13-lite.js`、`custom-play.js`，以及 PeerJS。
- `shuyang-ai/learn/cocos/freq-spike.html` 加载同一份引擎和 `freq-spike.js`。
- 课页上的「去玩这一关」是一条普通链接，指向 `cocos/custom-play.html`。

引擎说明写在 `vendor/cocos2d-html5/README.md`：这是 Cocos2d-JS Lite v3.13，用法是 `document.ccConfig` 加 `cc.game.run`。它不是 Cocos Creator。

已核对这份精简引擎里有 `cc.Layer`、`cc.Sprite`、`cc.LabelTTF`、`cc.Texture2D`。没有搜到 `ccui`、`cc.EditBox`、`cc.TMXTiledMap`。所以不能把 Cocos Creator 的可视化编辑器或 Tiled 的 TMX 直接当成现成功能。横版编辑器要在这套精简引擎上自己做场景。若以后必须用 TMX 或文本输入框，要单独加解析或控件，并在同一次提交里证明精简包带得动。

`xy-go/game.js` 仍是页面画布上的跑酷，单机和联网都在这里。`?custom=1` 会读同一份 `xygo-custom-level`。Cocos 试玩是另一份实现，注释写明设计列只作补充，开局镜头会把火、旗、鳄鱼钉死在固定位置（`custom-play.js` 的 `loadLevel` / `earlyShowcase`）。孩子摆的格子和试玩画面现在不是同一张图。

## 引擎与迁移

继续用已经入库的 `cocos2d-js-v3.13-lite.js`。这一步不升级引擎，也不换成 Cocos Creator。Creator 的编辑器不是这个运行时。

迁移方式：

1. 增加一个 Cocos 启动页，例如 `shuyang-ai/learn/cocos/workbench.html`。全站课件、编辑、试玩都从 `cc.game.run` 进场景，不再为每一课新写一套 HTML 控件。
2. 课件变成场景。tonight 的四步先迁：看图、频率、摆关、觉察。每一步一个 `cc.Scene`（或同一场景里的四个层，但对外仍是四页课件，用场景名区分）。翻页用场景切换，不用显示/隐藏 HTML `<section>`。
3. `level-design.html` 在新入口能完成同样四步之前保留。完成后它只保留跳转到 `workbench.html?lesson=tonight`，避免微信里的旧链接失效。`ld-art.js` 的画法迁进 Cocos 精灵之后再删。
4. 频率教学并进工作台场景，不再单独维持一套 `freq-spike.html` 的页面壳。刺的冒出规则仍是现在的数字：`interval`、`up`、`damage`。
5. 试玩场景和编辑场景共用同一个关卡读取函数。读取结果就是存档本身。去掉 `earlyShowcase` 那种把固定火、旗、鳄鱼盖在存档上面的做法。`xy-go/?custom=1` 要读同一份数据；两边对同一 JSON 的地面、陷阱、Boss 位置做一次对照测试，再算迁完。
6. 孩子随手存的关仍可放在 `localStorage`，方便当堂试。正式关卡必须是仓库里的文件，例如 `shuyang-ai/learn/cocos/data/levels/`。只存在浏览器里的关不算发布。

界面控件用 `cc.Node`、`cc.Sprite`、`cc.LabelTTF` 和触摸。精简包没有 `cc.EditBox`。数字用滑条和加减按钮，不依赖键盘文本框。若某一课必须打字，单独记一笔，不把整页退回 HTML。

## 课件怎么放

一个课件目录对应一个场景模块，例如：

- `scenes/lesson-tonight-look.js` 看图
- `scenes/lesson-tonight-freq.js` 频率
- `scenes/lesson-tonight-edit.js` 进入编辑器
- `scenes/lesson-tonight-reflect.js` 觉察

启动参数 `?lesson=tonight&step=0` 决定第一幕。头像只用已有文件：`shuyang-ai/avatars/xiaoyu.jpg`、`dad-wuxin.jpg`、`mom-chunyan.jpg`、`pengpeng.jpg`。不新画老师或孩子。

`kid.js` 里 2026-10-30 那课的链接，在工作台入口可用之后改到新地址。那是后续提交，不是这一步。

## 横版关卡编辑器

编辑器本身是一个 Cocos 场景，横版镜头，格子和 `xy-go` 一致，用现有的 `T = 40`。

层从后到前固定为：

1. 远景（已有场景图，按主题选一张，视差滚动）
2. 地面碰撞
3. 物件：出生点、金币、陷阱、检查点、终点、Boss
4. 编辑用的网格和选中框（试玩时关掉）

物件吸附到格子。陷阱参数沿用现在已经在存档里的字段（地刺的 `interval` / `up` / `damage`，火的 `damage` / `dur` / `burn`）。每种陷阱一份参数，和今天 `st.traps[type]` 一样，避免同一种刺在同一关里出现两套频率却没有地方存。

编辑器里的「跑一次」切换到试玩场景，读刚保存的那份数据，再回到编辑场景。不新开一个 HTML 标签作为主路径。旧的 `custom-play.html` 可以暂时留作对照，对照通过后改为跳进同一场景。

存档从 v1.1 增到 v2 时，一次提交里同时改：编辑器写出、Cocos 试玩读入、`xy-go` 的 `?custom=1` 读入。v2 至少包含：`version`、`theme`、`cols`、`rows`、`tiles`、`traps`、`spawn`、`goal`、`bossId`。`bossId` 必须出现在下面的名册里。缺 Boss 的正式关卡不能保存。

横版能力按这个顺序做，不做完前一项不开始下一项：铺地和断沟、放置已有陷阱、调频率和伤害、出生点与终点、Boss 点、检查点、试跑。视差和多层前景在地面和 Boss 规则稳定之后再加。

## 关卡和 Boss 一一对应，画风不另起

正式关卡的唯一名册要收成一份文件，建议 `shuyang-ai/learn/cocos/data/roster.json`。编辑器和 `xy-go` 都只读它。每一条是：关卡序号、关卡名、主题、Boss 的 id、显示名、用哪一套已有精灵。关卡条数等于 Boss 条数。多一个、少一个、或 Boss id 在精灵表里不存在，提交前的检查应失败。

这个名册现在还不能从代码里自动得到唯一答案。`xy-go/game.js` 里有两套名字，并不相同：

| 序号 | `LEVELS[].boss.name` | `LEVEL_CRITTERS` 的显示名 |
| --- | --- | --- |
| 1 林间晨跑 | 熊大王 | 熊大王 |
| 2 苔岩小径 | 野猪 | 野猪王 |
| 3 萤火树冠 | 影忍者 | 影狼 |
| 4 尖刺走廊 | 刺甲虫 | 刺蝎王 |
| 5 火焰栈道 | 炎猪 | 炎沙蛇 |
| 6 雷鸣谷口 | 雷影 | 雷狼 |
| 7 炸弹矿坑 | 矿霸 | 鳄霸（注释写成沼泽） |
| 8 终极融合 | 终焉影 | 终极机器人 |

另外，`THEME_CRITTERS` 还有沼泽「鳄鱼王」、海洋「鲨鱼王」、太空「机器人王」。Cocos 试玩在没有存档时会把主题写成沼泽，并自己放一只鳄鱼。这三处不能同时当真。在定下哪一张表是发布名册之前，编辑器不新增 Boss，也不把「鳄鱼王」写死成每一关的结局。

画风允许使用的只有仓库里已有的资源：绿/蓝/红忍者帧（`xy-go/sprites/green/` 与现有调色）、`LEVEL_CRITTERS` / `CRIT_COL` 里已出现的动物种类、`xy-go/scenes/` 里已有的背景。编辑器的调色板是这个允许列表。列表外的 `type` 不能放下，也不能在试玩里用色块临时顶上一个新怪物。

头像同样只引用 `shuyang-ai/avatars/` 里现有的图。

## 和已经做好的单机、联网

`xy-go` 的单机、同机双人、PeerJS 联网保持原样。正式八关仍由 `xy-go` 的 `LEVELS` 驱动；名册文件落地之后，`LEVELS` 改为读这份名册，而不是编辑器另写一套关卡逻辑。

孩子在课上保存的关继续标记为 custom。联网房间如果要一起玩「我的关卡」，沿用现有的 `?custom=1` 同步，不把这关插进八关列表。

## 建议的后续顺序

每一步单独提交并推到 `main`。

1. 定正式名册（先解开上面那张对照表）。
2. Cocos 启动页和 tonight 四步场景，先把现有课文搬进去，编辑可以仍写出 v1.1。
3. 编辑场景与试玩场景共用读取函数，去掉试玩对存档的覆盖。
4. v2 存档加上 `bossId`，并让 `xy-go/?custom=1` 读同一文件。
5. 正式八关改为读名册；对照测试：关卡数、Boss id、精灵键一致。
6. `level-design.html` 改为跳转。频率页并入工作台。

## 这一步没有替你做的决定

- 八关 Boss 以 `LEVELS[].boss.name` 为准，还是以 `LEVEL_CRITTERS` 为准，还是另有一张人口头定过的表。仓库里没有第三份文档。
- 「整页都用 Cocos」是否包含 `kid.html` 的课程日历，还是只包含学习工作台。本计划只覆盖 `shuyang-ai/learn/`。
- 精简引擎没有文本框，也没有 TMX。若必须用 Tiled 或打字，要另开一步，不能算进当前引擎已有能力。
