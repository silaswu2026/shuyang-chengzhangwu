# 小歌编辑器方案 · 2026-11-03

- 学员正式名：**伍澍暘** · 助手：**小宇**
- 状态：**MVP 随本课落地**（课件 + 编辑器 tip **mse1**）。名册键 `xygo-my-songs`。
- 配套课纲：[`COURSE-2026-11-03-AI-SONG.md`](./COURSE-2026-11-03-AI-SONG.md)
- 口述：[`TEACH-AI-SONG-EDITOR-2026-11-03.md`](./TEACH-AI-SONG-EDITOR-2026-11-03.md)
- 现网：纯前端 · `shuyang-ai/learn/song-studio/` · GitHub Pages · 无后端 · 无音乐 API 密钥 · 品牌海军 / 金 / 绿 · 手机横屏 ~844×390

---

## 调研一句

Suno 要求 ≥13 岁，本课只让爸爸演示、孩子不登录；Udio 约 16 岁且下载关闭；Google MusicFX 已停；Google Flow 约 ≥18。孩子的主路径是浏览器 Web Audio，不接商用音乐 API。

所以：编辑器自己发声。提示词只是一段可复制的中文+英文，给家长贴进 Suno 简单模式。页面不请求 Suno、Udio、MusicFX、Flow。

---

## 心跳

和关卡编辑器同一条：

**定义 → 摆 → 立刻听 → 存得住。**

| 效果 | 孩子能感到什么 | 本页 |
| --- | --- | --- |
| 看得见 | 点亮的格子就是将要响的声音 | 鼓 16×3、旋律 16×五声，试听时那一列亮 |
| 立刻听 | 改完马上响 | ▶ 试听 / ⏹ 停止，第一次点就解锁声音 |
| 存得住 | 刷新还在 | `xygo-my-songs`，打开 / 覆盖 / 删除 |

---

## MVP（本课）

- [x] 歌名，默认「我的小歌 1」
- [x] 风格四选一：热血游戏 / 轻松流行 / 安静钢琴 / 电子跳动
- [x] 心情四选一：开心 / 热血 / 安静 / 搞笑
- [x] BPM 预设 80 / 110 / 140，滑条 70–140，数字一直在
- [x] 结构：前奏可关；主歌 + 副歌保留
- [x] 鼓点 16 步：底鼓 / 军鼓 / 踩镲
- [x] 旋律 16×5 五声，一点一音，可清空
- [x] 音色：鼓 / 贝斯嗡音 / 钢琴 / 合成铅（振荡器 + 包络，无采样包）
- [x] 「生成 AI 提示词」：中文 + 英文，注明 13 岁以下由爸爸代操作 Suno
- [x] 保存、另存、打开、覆盖、删除
- [x] 图文课件翻页，最后和实操步链到编辑器 `?v=mse1`
- [x] 正式名伍澍暘 / 小宇；版权口吻是原创主题，不克隆商品曲

## 明确不做

- 不调用 Suno / Udio / MusicFX / Flow，不放 API key，不登录
- 不下载、不模仿任何商业歌曲；默认句子是原创的五声小拱，不是某首商品歌
- 不改 `visual-workbench`、`custom-play`、`wb-audio.js`
- 不把小歌写进 `xygo-custom-level`、`xygo-my-levels`、`sycocos-level-progress`

## Later

- 主歌和副歌各自一套鼓，而不只是同一小节重复
- 撤销
- 导出 wav
- 和关卡 BGM 接通（另课；今天不碰游戏音频）

---

## 存档

```text
xygo-my-songs = {
  version: 1,
  lastId: "song-1",
  songs: [{ id, title, savedAt, doc }]
}
```

`doc` 里有 title、style、mood、bpm、sections、instrument、drums、melody、lyrics。  
`lastId` 用来刷新后打开上次那首。没有这个字段时，打开名册里最后一首。

摆格子和试听不写名册。点保存或覆盖才写。

---

## 路径

| 用途 | 路径 |
| --- | --- |
| 课件 | `shuyang-ai/learn/song-studio/lesson.html?v=mse1` |
| 编辑器 | `shuyang-ai/learn/song-studio/?v=mse1` |
| 脚本 | `lesson.js?v=mse1` · `song-studio.js?v=mse1` |

*成长屋 · 小歌编辑器方案 · 正式名伍澍暘 / 小宇*
