# sleep-story 技能 - 最终优化总结

**版本**: 6.0.0  
**日期**: 2026-04-05  
**优化**: 清理冗余文件，保留核心内容

---

## 📁 项目结构（精简版）

```
sleep-story/
├── SKILL.md                      # 主技能文件（核心）
├── README.md                     # 使用说明
├── LICENSE                       # MIT 许可证
├── CONTRIBUTING.md               # 贡献指南
├── CODE_OF_CONDUCT.md            # 行为准则
├── ISSUE_TEMPLATE.md             # 问题模板
│
├── scripts/
│   ├── generate-audio.js         # 音频生成（Edge TTS + macOS say）
│   ├── generate-media.js         # 媒体生成器（音频 + 视频）
│   └── generate-video.js         # 视频生成（背景 + BGM）
│
├── references/
│   ├── relaxation-phrases.md     # 放松语句库（118 种变体）
│   ├── element-database.md       # 故事元素数据库
│   ├── story-types.md            # 故事类型库
│   ├── story-templates.md        # 故事模板
│   ├── psychology-techniques.md  # 心理学技术详解
│   ├── warm-words.md             # 温暖词汇库
│   ├── seasonal-stories.md       # 季节性故事
│   ├── series-story-framework.md # 系列故事框架
│   ├── feedback-loop-system.md   # 反馈循环系统
│   ├── personalization-system.md # 个性化系统
│   └── research-evidence.md      # 科学研究依据
│
├── memory/
│   ├── sleep-story-history.json  # 历史记录（防重复）
│   └── user-preferences.json     # 用户偏好
│
└── examples/
    └── stories.md                # 示例故事
```

---

## 🎯 核心功能

### 1. 故事创作（SKILL.md）
- 6 大故事类型（自然/日常/动物/回忆/奇幻/季节）
- 5 大心理学技术（呼吸/放松/可视化/安全基地/感恩）
- 防重复机制（118 种放松语句变体）
- 历史记录追踪（冷却期规则）

### 2. 音频生成（generate-audio.js）
- Edge TTS（微软 Neural，免费，最自然）
- macOS say（系统内置，备用）
- 自动降级策略
- 语速优化（-25% / 100 字/分钟）

### 3. 视频生成（generate-video.js）
- 柔和背景（渐变/星空）
- 助眠 BGM（钢琴/自然/白噪音）
- ffmpeg 合成

### 4. 媒体管理（generate-media.js）
- 一键生成音频 + 视频
- 统一配置管理
- 多样性检查

---

## 📊 清理的文件

### 过时的优化文档（已删除）
```
❌ OPTIMIZATION.md                    # 第 1 次优化
❌ OPTIMIZATION-COMPLETE.md           # 多媒体完成
❌ OPTIMIZATION-MULTIMEDIA.md         # 多媒体优化
❌ OPTIMIZATION-FFMPEG-CHECK.md       # ffmpeg 检查
❌ OPTIMIZATION-AUDIO-FIX.md          # 音频修复
❌ OPTIMIZATION-EDGE-TTS.md           # Edge TTS 集成
❌ OPTIMIZATION-ANTI-REPETITION.md    # 防重复方案
❌ OPTIMIZATION-SUMMARY.md            # 优化总结
❌ COMPLETE-SUMMARY.md                # 完整总结
❌ PROJECT-STRUCTURE.md               # 项目结构
❌ MULTIMEDIA-QUICKSTART.md           # 快速开始
```

### 冗余的脚本（已删除）
```
❌ scripts/generate-audio-edge.js     # 已合并到 generate-audio.js
```

### 过时的参考文档（已删除）
```
❌ references/multimedia-guide.md     # 内容已整合
❌ references/history-tracking.md     # 内容已整合到 SKILL.md
```

---

## ✅ 保留的核心文件

### 技能文件
- ✅ `SKILL.md` - 主技能文件（包含完整创作指南和防重复机制）
- ✅ `README.md` - 项目说明和使用方法

### 脚本文件
- ✅ `scripts/generate-audio.js` - 音频生成（支持 Edge TTS + macOS say，自动降级）
- ✅ `scripts/generate-media.js` - 媒体生成器（统一入口）
- ✅ `scripts/generate-video.js` - 视频生成（背景 + BGM）

### 参考文档
- ✅ `references/relaxation-phrases.md` - 118 种放松语句变体（防重复核心）
- ✅ `references/element-database.md` - 故事元素数据库（50+ 场景，40+ 角色）
- ✅ `references/story-types.md` - 6 大故事类型详解
- ✅ `references/story-templates.md` - 故事模板库
- ✅ `references/psychology-techniques.md` - 心理学技术详解
- ✅ `references/warm-words.md` - 温暖词汇库
- ✅ `references/seasonal-stories.md` - 季节性故事库
- ✅ `references/series-story-framework.md` - 系列故事框架
- ✅ `references/feedback-loop-system.md` - 反馈循环系统
- ✅ `references/personalization-system.md` - 个性化系统
- ✅ `references/research-evidence.md` - 科学研究依据

### 数据文件
- ✅ `memory/sleep-story-history.json` - 历史记录追踪（防重复）
- ✅ `memory/user-preferences.json` - 用户偏好配置

---

## 🎯 当前版本特性

### v6.0.0（最新版）

**核心优化**:
1. ✅ 防重复系统（118 种放松语句变体）
2. ✅ Edge TTS 集成（免费，最自然）
3. ✅ 自动降级策略（Edge TTS → macOS say）
4. ✅ 语速优化（-25% / 100 字/分钟，非常慢）
5. ✅ 历史记录追踪（冷却期规则）
6. ✅ 多样性评分系统（目标 > 0.8）

**默认配置**:
```json
{
  "tts": {
    "engine": "auto",
    "voice": "zh-CN-XiaoxiaoNeural",
    "rate": "-25%"
  },
  "say": {
    "voice": "Mei-Jia",
    "rate": "100"
  },
  "video": {
    "background": "gradient",
    "bgmType": "piano",
    "bgmVolume": "0.15"
  }
}
```

---

## 📖 快速开始

### 1. 创作故事
```bash
# 使用技能创作
"帮我写一个助眠故事"
```

### 2. 生成音频
```bash
# 默认配置（Edge TTS，自动降级）
node scripts/generate-media.js story.txt

# 指定语音和语速
node scripts/generate-media.js story.txt --voice zh-CN-XiaoxiaoNeural --rate "-30%"

# 强制使用 macOS say
node scripts/generate-media.js story.txt --engine say
```

### 3. 生成视频
```bash
# 音频 + 视频
node scripts/generate-media.js story.txt --mode both

# 仅视频
node scripts/generate-media.js story.txt --mode video
```

---

## 🔧 环境变量

```bash
# 输出目录
export SLEEP_STORY_OUTPUT_DIR=~/jnSleepStory

# TTS 配置
export SLEEP_STORY_TTS_ENGINE=auto        # auto|edge|say
export SLEEP_STORY_EDGE_VOICE=zh-CN-XiaoxiaoNeural
export SLEEP_STORY_EDGE_RATE=-25%
export SLEEP_STORY_SAY_VOICE=Mei-Jia
export SLEEP_STORY_SAY_RATE=100

# 视频配置
export SLEEP_STORY_BACKGROUND=gradient    # gradient|stars
export SLEEP_STORY_BGM_TYPE=piano         # piano|nature|white_noise
export SLEEP_STORY_BGM_VOLUME=0.15
```

---

## 📋 防重复检查清单

**每次创作前必须完成**:

```markdown
## 去重检查

### 1. 检查历史记录
- [ ] 读取 `memory/sleep-story-history.json`
- [ ] 查看最近 5 篇故事的场景
- [ ] 查看最近 5 篇故事的角色
- [ ] 查看已使用的放松语句变体编号

### 2. 选择新鲜元素
- [ ] 场景：选择未使用或冷却期已过的场景
- [ ] 角色：选择未使用或冷却期已过的角色
- [ ] 放松语句：从 118 种变体中选择未使用的
- [ ] 故事类型：轮换使用不同类型

### 3. 多样性检查
- [ ] 最近 5 篇场景重复率 < 40%
- [ ] 最近 5 篇角色重复率 < 40%
- [ ] 放松语句重复率 < 20%

### 4. 创作后更新
- [ ] 添加新故事到 `stories` 数组
- [ ] 更新 `usedRelaxationPhrases`
- [ ] 更新 `recentElements`
- [ ] 计算多样性评分
```

---

## 🎯 多样性目标

```
总体多样性 > 0.8
场景重复率 < 40%
角色重复率 < 40%
语句重复率 < 20%
```

---

## 📞 支持与反馈

- **问题反馈**: https://github.com/SoyooSkills/sleep-story/issues
- **讨论区**: https://github.com/SoyooSkills/sleep-story/discussions

---

**优化完成！项目已精简，只保留核心和最新内容！** 🎉
