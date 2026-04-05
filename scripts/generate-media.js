#!/usr/bin/env node

/**
 * Sleep Story Media Generator
 * 助眠故事多媒体生成器
 * 
 * TTS 优先级：
 * 1. Edge TTS (微软 Neural，免费，最自然) - 首选
 * 2. macOS say (系统内置，备用) - 降级方案
 * 
 * 默认语音：zh-CN-XiaoxiaoNeural (晓晓，温柔女声)
 */

const fs = require('fs');
const path = require('path');
const { generateAudio, checkEdgeTTS, checkSay } = require('./generate-audio');
const { generateVideo, checkFfmpeg } = require('./generate-video');

// 配置
const CONFIG = {
  // 输出目录
  outputDir: process.env.SLEEP_STORY_OUTPUT_DIR || path.join(process.env.HOME, 'jnSleepStory'),
  
  // 生成模式：audio | video | both
  mode: process.env.SLEEP_STORY_MODE || 'audio', // 默认仅音频
  
  // TTS 配置
  tts: {
    engine: process.env.SLEEP_STORY_TTS_ENGINE || 'auto', // auto 自动选择
    // Edge TTS 默认语音（晓晓，温柔女声）
    edgeVoice: process.env.SLEEP_STORY_EDGE_VOICE || 'zh-CN-XiaoxiaoNeural',
    // Edge TTS 语速（更慢，助眠放松）
    edgeRate: process.env.SLEEP_STORY_EDGE_RATE || '-25%',
    // macOS say 备用语音
    sayVoice: process.env.SLEEP_STORY_SAY_VOICE || 'Mei-Jia',
    // macOS say 语速（更慢，助眠放松）
    sayRate: parseInt(process.env.SLEEP_STORY_SAY_RATE || '100'),
  },
  
  // 视频配置（可选）
  video: {
    background: process.env.SLEEP_STORY_BACKGROUND || 'gradient',
  },
};

/**
 * 检查 TTS 引擎状态
 */
function checkTTSEngine() {
  console.log('🔍 检查 TTS 引擎...');
  
  const hasEdge = checkEdgeTTS();
  const hasSay = checkSay();
  
  if (hasEdge) {
    console.log('✅ Edge TTS 可用 (微软 Neural，推荐)');
    console.log(`   语音：${CONFIG.tts.edgeVoice} (晓晓)`);
    console.log(`   语速：${CONFIG.tts.edgeRate} (非常慢，助眠放松)`);
  }
  
  if (hasSay) {
    console.log('✅ macOS say 可用 (备用方案)');
    console.log(`   语音：${CONFIG.tts.sayVoice}`);
  }
  
  if (!hasEdge && !hasSay) {
    console.error('❌ 错误：没有可用的 TTS 引擎');
    console.error('');
    console.error('请安装以下之一:');
    console.error('  1. Edge TTS: npm install -g node-edge-tts');
    console.error('  2. 或使用 macOS 系统 (内置 say 命令)');
    console.error('');
    return null;
  }
  
  console.log('');
  return hasEdge ? 'edge' : 'say';
}

/**
 * 检查 ffmpeg 状态
 */
function checkFfmpegStatus() {
  const hasFfmpeg = checkFfmpeg();
  
  if (hasFfmpeg) {
    try {
      const version = require('child_process').execSync('ffmpeg -version', { encoding: 'utf8', stdio: 'pipe' }).split('\n')[0];
      console.log(`✅ ffmpeg 已安装：${version}`);
    } catch (e) {
      console.log('✅ ffmpeg 已安装');
    }
  } else {
    console.log('⚠️  ffmpeg 未安装，视频生成功能不可用');
    console.log('   安装命令：brew install ffmpeg');
    console.log('   提示：仅生成音频不需要 ffmpeg');
  }
  console.log('');
  
  return hasFfmpeg;
}

/**
 * 生成媒体文件
 */
async function generateMedia(storyText, storyId, options = {}) {
  const results = {
    audio: null,
    video: null,
    success: false,
  };
  
  console.log('\n🌙 Sleep Story Media Generator');
  console.log('================================\n');
  console.log(`故事 ID: ${storyId}`);
  console.log(`文本长度：${storyText.length} 字符`);
  console.log(`生成模式：${CONFIG.mode}`);
  console.log(`输出目录：${CONFIG.outputDir}`);
  console.log('');
  
  // 确保输出目录存在
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log(`✅ 创建输出目录：${CONFIG.outputDir}\n`);
  }
  
  // Step 1: 生成音频（必须）
  console.log('📢 Step 1: 生成音频 (优先保证有声音)');
  console.log('-------------------------------------');
  
  // 检查 TTS 引擎
  const engine = checkTTSEngine();
  
  if (!engine) {
    console.error('❌ 无法生成音频：没有可用的 TTS 引擎\n');
    return results;
  }
  
  // 设置音频配置
  process.env.SLEEP_STORY_TTS_ENGINE = engine;
  process.env.SLEEP_STORY_EDGE_VOICE = CONFIG.tts.edgeVoice;
  process.env.SLEEP_STORY_EDGE_RATE = CONFIG.tts.edgeRate;
  process.env.SLEEP_STORY_SAY_VOICE = CONFIG.tts.sayVoice;
  process.env.SLEEP_STORY_SAY_RATE = CONFIG.tts.sayRate.toString();
  
  const audioFile = await generateAudio(storyText, storyId);
  
  if (audioFile) {
    results.audio = audioFile;
    console.log(`✅ 音频生成完成：${path.basename(audioFile)}\n`);
  } else {
    console.error('❌ 音频生成失败，无法继续\n');
    return results;
  }
  
  // Step 2: 生成视频（可选）
  if (CONFIG.mode === 'video' || CONFIG.mode === 'both') {
    console.log('🎬 Step 2: 生成视频 (可选)');
    console.log('-----------------------------------------');
    
    const hasFfmpeg = checkFfmpegStatus();
    
    if (!hasFfmpeg) {
      console.log('⚠️  ffmpeg 未安装，跳过视频生成');
      console.log('💡 提示：音频已生成，可正常使用\n');
    } else {
      // 设置视频配置
      process.env.SLEEP_STORY_BACKGROUND = CONFIG.video.background;
      
      const videoFile = generateVideo(audioFile, storyId, {
        background: CONFIG.video.background,
      });
      
      if (videoFile) {
        results.video = videoFile;
        console.log(`✅ 视频生成完成：${path.basename(videoFile)}\n`);
      } else {
        console.log('⚠️  视频生成失败，但音频可用\n');
      }
    }
  }
  
  // 总结
  results.success = !!(results.audio || results.video);
  
  if (results.success) {
    console.log('✨ 生成完成！');
    console.log('================\n');
    
    if (results.audio) {
      console.log(`📁 音频：${results.audio}`);
      console.log(`   - TTS 引擎：${engine === 'edge' ? 'Edge TTS (推荐)' : 'macOS say (备用)'}`);
      console.log(`   - 语音：${engine === 'edge' ? CONFIG.tts.edgeVoice : CONFIG.tts.sayVoice}`);
      console.log(`   - 语速：${engine === 'edge' ? CONFIG.tts.edgeRate : CONFIG.tts.sayRate + ' 字/分钟'}`);
    }
    if (results.video) {
      console.log(`\n🎬 视频：${results.video}`);
      console.log(`   - 背景：${CONFIG.video.background}`);
    }
    
    console.log('\n💡 播放建议:');
    console.log('   - 睡前 15-30 分钟开始播放');
    console.log('   - 音量调至舒适水平');
    console.log('   - 音频可闭眼聆听，视频可配合柔和背景');
    console.log('');
    
    // 配置提示
    console.log('⚙️  配置选项:');
    console.log('   更换语音：--voice zh-CN-XiaoyiNeural (小艺)');
    console.log('   调整语速：--rate "-20%" (更慢) 或 "--rate "+10%" (稍快)');
    console.log('   强制引擎：--engine edge (Edge TTS) 或 --engine say (macOS)');
    console.log('');
  }
  
  return results;
}

// CLI 使用
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Sleep Story Media Generator
===========================

生成温暖治愈的助眠故事音频/视频
首选 Edge TTS (微软 Neural)，备用 macOS say

用法:
  node generate-media.js <故事文本文件> [故事 ID] [选项]

示例:
  node generate-media.js story.txt sleep-story-2026-04-05
  node generate-media.js story.txt --mode audio
  node generate-media.js story.txt --voice zh-CN-XiaoyiNeural
  node generate-media.js story.txt --rate "-20%"

选项:
  --mode <模式>           生成模式
                          audio: 仅音频 (默认，推荐)
                          video: 仅视频
                          both: 音频 + 视频
                          默认：audio
  --voice <语音名>        TTS 语音
                          Edge TTS: zh-CN-XiaoxiaoNeural (晓晓，默认)
                                   zh-CN-XiaoyiNeural (小艺)
                                   zh-CN-YunxiNeural (云希 - 男声)
                          macOS say: Mei-Jia, Ting-Ting, Samantha
                          默认：zh-CN-XiaoxiaoNeural (Edge TTS)
  --rate <语速>           语速调整
                          Edge TTS: -50% 到 +100%，默认：-15% (慢速)
                          macOS say: 100-180 字/分钟，默认：120
  --engine <引擎>         TTS 引擎
                          auto: 自动选择 (默认，优先 Edge TTS)
                          edge: 强制使用 Edge TTS
                          say: 强制使用 macOS say
  --background <类型>     视频背景 (gradient|stars)
                          默认：gradient
  --output <目录>         输出目录，默认：~/jnSleepStory

环境变量:
  SLEEP_STORY_OUTPUT_DIR     输出目录
  SLEEP_STORY_MODE           生成模式 (audio|video|both)
  SLEEP_STORY_TTS_ENGINE     TTS 引擎 (auto|edge|say)，默认：auto
  SLEEP_STORY_EDGE_VOICE     Edge TTS 语音，默认：zh-CN-XiaoxiaoNeural
  SLEEP_STORY_EDGE_RATE      Edge TTS 语速，默认：-15%
  SLEEP_STORY_SAY_VOICE      macOS say 语音，默认：Mei-Jia
  SLEEP_STORY_SAY_RATE       macOS say 语速，默认：120
  SLEEP_STORY_BACKGROUND     视频背景类型

TTS 引擎自动降级:
  1. 优先使用 Edge TTS (微软 Neural，最自然)
  2. Edge TTS 不可用时，自动降级到 macOS say
  3. 确保始终有可用的 TTS 引擎

Edge TTS 可用语音:
  ┌────────────────────────┬────────┬────────────────────┐
  │ 语音                   │ 性别   │ 特点               │
  ├────────────────────────┼────────┼────────────────────┤
  │ zh-CN-XiaoxiaoNeural   │ 女     │ 温柔知性 (默认)    │
  │ zh-CN-XiaoyiNeural     │ 女     │ 温暖亲切           │
  │ zh-CN-LiaoniaNeural    │ 女     │ 柔和舒缓           │
  │ zh-CN-YunxiNeural      │ 男     │ 温暖男声           │
  │ zh-CN-YunyangNeural    │ 男     │ 专业男声           │
  └────────────────────────┴────────┴────────────────────┘

安装 Edge TTS:
  npm install -g node-edge-tts

`);
    process.exit(1);
  }
  
  // 解析参数
  const storyFile = args[0];
  let storyId = 'sleep-story';
  let i = 1;
  
  while (i < args.length) {
    const arg = args[i];
    if (arg === '--mode' && args[i + 1]) {
      CONFIG.mode = args[i + 1];
      i += 2;
    } else if (arg === '--voice' && args[i + 1]) {
      // 根据语音名称判断使用哪个引擎的配置
      if (args[i + 1].includes('Neural')) {
        CONFIG.tts.edgeVoice = args[i + 1];
      } else {
        CONFIG.tts.sayVoice = args[i + 1];
      }
      i += 2;
    } else if (arg === '--rate' && args[i + 1]) {
      // 根据引擎设置对应的语速
      if (CONFIG.tts.engine === 'say') {
        CONFIG.tts.sayRate = parseInt(args[i + 1]);
      } else {
        CONFIG.tts.edgeRate = args[i + 1];
      }
      i += 2;
    } else if (arg === '--engine' && args[i + 1]) {
      CONFIG.tts.engine = args[i + 1];
      i += 2;
    } else if (arg === '--background' && args[i + 1]) {
      CONFIG.video.background = args[i + 1];
      i += 2;
    } else if (arg === '--output' && args[i + 1]) {
      CONFIG.outputDir = args[i + 1];
      i += 2;
    } else if (!arg.startsWith('--')) {
      storyId = arg;
      i++;
    } else {
      i++;
    }
  }
  
  if (!fs.existsSync(storyFile)) {
    console.error(`错误：文件不存在：${storyFile}`);
    process.exit(1);
  }
  
  const storyText = fs.readFileSync(storyFile, 'utf8');
  
  generateMedia(storyText, storyId).then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { generateMedia, CONFIG };
