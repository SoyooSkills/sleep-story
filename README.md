# 🌙 Sleep Story Skill - 温暖治愈系心理学助眠故事

**基于科学研究的智能助眠故事创作技能**，融合心理学放松技术和催眠暗示，帮助用户快速进入深度睡眠。

---

## ✨ 核心特色

- 🧠 **科学支撑** - 基于 8 大类心理学技术，20+ 篇临床研究
- 🎯 **防重复系统** - 118 种放松语句变体，避免听觉疲劳
- 🎵 **音频生成** - Edge TTS（免费 Neural）+ macOS say（备用）
- 🎬 **视频生成** - 柔和背景 + 助眠音乐
- 🔄 **个性化适配** - 根据用户反馈自动调整故事风格
- 📚 **系列故事** - 连续剧式助眠，增强期待感

---

## 📖 快速开始

### 安装

```bash
# 克隆技能
git clone https://github.com/SoyooSkills/sleep-story.git
cd sleep-story

# 安装 Edge TTS（推荐）
npm install -g node-edge-tts

# 安装 ffmpeg（视频生成需要）
brew install ffmpeg  # macOS
sudo apt-get install ffmpeg  # Ubuntu
```

### 使用

**1. 创作故事**

```
"帮我写一个助眠故事"
"想听一个关于自然风景的故事"
"我睡不着，能给我讲个故事吗"
```

**2. 生成音频**

```bash
# 默认配置（Edge TTS，自动降级）
node scripts/generate-media.js story.txt

# 指定语音和语速
node scripts/generate-media.js story.txt --voice zh-CN-XiaoxiaoNeural --rate "-30%"

# 强制使用 macOS say
node scripts/generate-media.js story.txt --engine say
```

**3. 生成视频**

```bash
# 音频 + 视频
node scripts/generate-media.js story.txt --mode both

# 仅视频
node scripts/generate-media.js story.txt --mode video
```

---

## 🎯 预期效果

基于临床研究数据：

| 技术           | 预期改善                | 证据来源             |
| -------------- | ----------------------- | -------------------- |
| 渐进式肌肉放松 | 入睡缩短 15-20 分钟     | Conrad & Roth, 2007  |
| 4-7-8 呼吸法   | 入睡缩短 10-15 分钟     | Elliott et al., 2019 |
| 催眠暗示       | 入睡缩短 20-30 分钟     | Milling et al., 2018 |
| **综合干预**   | **入睡缩短 30-45 分钟** | Morin et al., 2006   |

---

## 📚 核心文档

### 技能文件

- [`SKILL.md`](SKILL.md) - 主技能文件，包含完整创作指南
- [`README.md`](README.md) - 本文件

### 参考文档

- [`references/relaxation-phrases.md`](references/relaxation-phrases.md) - 放松语句库（118 种变体）
- [`references/element-database.md`](references/element-database.md) - 故事元素数据库
- [`references/story-types.md`](references/story-types.md) - 故事类型库
- [`references/psychology-techniques.md`](references/psychology-techniques.md) - 心理学技术详解
- [`references/warm-words.md`](references/warm-words.md) - 温暖词汇库

### 示例故事

- [`examples/stories.md`](examples/stories.md) - 示例故事

---

## 🎵 多媒体生成

### 音频生成

**特点**:

- ✅ Edge TTS（微软 Neural，免费，最自然）
- ✅ macOS say（系统内置，备用）
- ✅ 自动降级策略
- ✅ 语速优化（-25% / 100 字/分钟）

**使用示例**:

```bash
# 生成音频
node scripts/generate-media.js story.txt --mode audio

# 指定语音
node scripts/generate-media.js story.txt --voice zh-CN-XiaoyiNeural

# 调整语速
node scripts/generate-media.js story.txt --rate "-30%"
```

### 视频生成

**特点**:

- ✅ 柔和背景（渐变/星空）
- ✅ 助眠 BGM（钢琴/自然/白噪音）
- ✅ 音量优化（BGM 15%）

**使用示例**:

```bash
# 生成视频
node scripts/generate-media.js story.txt --mode video

# 指定背景
node scripts/generate-media.js story.txt --background stars
```

---

## ⚙️ 配置

### 环境变量

```bash
# 输出目录
export SLEEP_STORY_OUTPUT_DIR=~/sleepStory

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

### 命令行参数

```bash
# 生成模式
--mode audio         # 仅音频（默认）
--mode video         # 仅视频
--mode both          # 音频 + 视频

# 语音选择
--voice zh-CN-XiaoxiaoNeural   # 晓晓（默认，女声）
--voice zh-CN-XiaoyiNeural     # 小艺（女声）
--voice Mei-Jia                # macOS say（女声）

# 语速调整
--rate "-30%"        # 更慢（Edge TTS）
--rate "100"         # 100 字/分钟（macOS say）
```

---

## 🔄 防重复系统

### 放松语句库

**118 种变体**，避免连续故事重复：

| 部位/类型 | 变体数量 |
| --------- | -------- |
| 肩膀放松  | 10 种    |
| 胸口放松  | 10 种    |
| 手臂放松  | 8 种     |
| 腿部放松  | 10 种    |
| 呼吸引导  | 24 种    |
| 睡意引导  | 26 种    |

### 冷却期规则

| 元素类型 | 冷却期 | 说明                    |
| -------- | ------ | ----------------------- |
| 主场景   | 3 篇   | 同一场景至少间隔 3 篇   |
| 角色     | 2 篇   | 同角色类型至少间隔 2 篇 |
| 放松语句 | 3 篇   | 同一表达至少间隔 3 篇   |
| 故事类型 | 1 篇   | 尽量轮换不同类型        |

### 多样性目标

```
总体多样性 > 0.8
场景重复率 < 40%
角色重复率 < 40%
语句重复率 < 20%
```

---

## 🎬 故事类型

### 6 大故事类型

| 类型          | 核心意象               | 适用场景             |
| ------------- | ---------------------- | -------------------- |
| 🌲 自然风景类 | 森林、海洋、星空、山川 | 压力大、需要开阔心境 |
| 🏠 温馨日常类 | 小屋、咖啡馆、图书馆   | 孤独、需要归属感     |
| 🐱 动物伙伴类 | 小猫、兔子、鲸鱼       | 需要陪伴感           |
| 🧸 童年回忆类 | 外婆家、老街道、学校   | 怀念过去、需要安全感 |
| ✨ 奇幻治愈类 | 星星、月亮、魔法       | 需要希望感           |
| 🍂 季节限定类 | 春樱、夏夜、秋月、冬雪 | 应景体验             |

---

## 🧠 心理学技术

### 8 大核心技术

1. **正念呼吸引导** - 4-7-8 呼吸法
2. **渐进式肌肉放松** - 从脚到头的放松扫描
3. **可视化想象疗法** - 安全之地、光之沐浴
4. **安全基地构建** - 内心庇护所
5. **感恩回忆触发** - 三件好事练习
6. **催眠暗示** - 直接/间接睡眠暗示
7. **呼吸绑定** - 呼吸与故事元素绑定
8. **意识模糊化** - 减少认知加工

---

## 📊 效果追踪

### 反馈收集

| 类型     | 时机       | 内容               | 频率 |
| -------- | ---------- | ------------------ | ---- |
| 即时反馈 | 故事结束后 | 评分、简单评价     | 每次 |
| 效果反馈 | 次日早晨   | 入睡时间、睡眠质量 | 每天 |
| 深度反馈 | 周末       | 偏好变化、建议     | 每周 |

### 核心指标

- **用户满意度 (CSAT)**：目标 > 80%
- **净推荐值 (NPS)**：目标 > 50
- **入睡改善率**：目标 > 30%
- **睡眠质量指数 (SQI)**：目标 > 3.0

---

## 🛠️ 贡献指南

欢迎贡献！请参考：

1. [CONTRIBUTING.md](CONTRIBUTING.md) - 贡献指南
2. [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - 行为准则
3. [ISSUE_TEMPLATE.md](ISSUE_TEMPLATE.md) - 问题模板

### 贡献类型

- 📝 新增故事模板
- 🎨 新增元素（场景/角色/旅程）
- 🔬 新增研究依据
- 🐛 修复问题
- 💡 功能建议

---

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)

---

## 🙏 致谢

### 研究支持

本技能的心理学技术基于以下研究：

- Jacobson, E. (1938). _Progressive Relaxation_
- Morin, C. M., et al. (2006). _Sleep_, 29(11), 1398-1414
- Milling, L. S., et al. (2018). _International Journal of Clinical and Experimental Hypnosis_, 66(4), 432-451
- Black, D. S., et al. (2015). _JAMA Internal Medicine_, 175(4), 494-501

### 特别感谢

- OpenClaw 社区
- 所有贡献者
- 测试用户

---

## 📞 联系方式

- **项目地址**: https://github.com/SoyooSkills/sleep-story
- **问题反馈**: https://github.com/SoyooSkills/sleep-story/issues
- **讨论区**: https://github.com/SoyooSkills/sleep-story/discussions

---

**祝你每晚都有好梦！** 🌙✨

> "在故事的陪伴下，安心睡去吧。这个世界是温柔的，而你，值得被温柔对待。"
