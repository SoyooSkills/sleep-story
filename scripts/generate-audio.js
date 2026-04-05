#!/usr/bin/env node

/**
 * Sleep Story Audio Generator
 * 生成助眠故事的音频文件
 * 
 * TTS 优先级：
 * 1. Edge TTS (微软 Neural，免费，最自然) - 首选
 * 2. macOS say (系统内置，备用) - 降级方案
 * 
 * 默认语音：zh-CN-XiaoxiaoNeural (晓晓，温柔女声)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
  // 输出目录
  outputDir: process.env.SLEEP_STORY_OUTPUT_DIR || path.join(process.env.HOME, 'jnSleepStory'),
  
  // TTS 引擎选择：'edge' | 'say'
  // 优先使用 Edge TTS，如果不可用则降级到 say
  ttsEngine: process.env.SLEEP_STORY_TTS_ENGINE || 'auto', // auto 表示自动选择
  
  // Edge TTS 配置（首选）
  edgeTTS: {
    // 默认语音（温柔女声，助眠推荐）
    voice: process.env.SLEEP_STORY_EDGE_VOICE || 'zh-CN-XiaoxiaoNeural',
    // 语言
    lang: process.env.SLEEP_STORY_EDGE_LANG || 'zh-CN',
    // 语速调整（-50% 到 +100%），助眠推荐更慢
    // -25% = 非常慢，适合助眠放松
    rate: process.env.SLEEP_STORY_EDGE_RATE || '-25%',
    // 音调调整
    pitch: process.env.SLEEP_STORY_EDGE_PITCH || '0%',
    // 音量调整
    volume: process.env.SLEEP_STORY_EDGE_VOLUME || '0%',
  },
  
  // macOS say 配置（备用）
  say: {
    // 默认语音
    voice: process.env.SLEEP_STORY_SAY_VOICE || 'Mei-Jia',
    // 语速（字/分钟），助眠推荐更慢
    // 100 = 很慢，适合助眠放松
    rate: parseInt(process.env.SLEEP_STORY_SAY_RATE || '100'),
  },
  
  // 音频格式
  audioFormat: 'mp3',
  audioBitrate: '192k',
};

/**
 * 确保输出目录存在
 */
function ensureOutputDir() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log(`创建输出目录：${CONFIG.outputDir}`);
  }
}

/**
 * 检查 Edge TTS 是否可用
 */
function checkEdgeTTS() {
  try {
    execSync('npx node-edge-tts --version', { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 检查 macOS say 是否可用
 */
function checkSay() {
  try {
    execSync('which say', { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 检查 ffmpeg 是否可用
 */
function checkFfmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 预处理文本，优化 TTS 输出
 */
function preprocessText(text) {
  return text
    .replace(/。/g, '。 ')
    .replace(/，/g, '， ')
    .replace(/；/g, '； ')
    .replace(/\n\n+/g, '\n\n... ');
}

/**
 * 使用 Edge TTS 生成音频（首选）
 */
function generateWithEdgeTTS(text, outputFile) {
  const voice = CONFIG.edgeTTS.voice;
  const rate = CONFIG.edgeTTS.rate;
  const pitch = CONFIG.edgeTTS.pitch;
  const volume = CONFIG.edgeTTS.volume;
  
  console.log(`使用微软 Edge TTS 生成音频...`);
  console.log(`语音：${voice} (晓晓 - 温柔女声)`);
  console.log(`语速：${rate} (非常慢，助眠放松)`);
  console.log('💡 Neural 神经网络，最自然的声音');
  console.log('');
  
  const processedText = preprocessText(text);
  
  try {
    console.log('正在生成音频...');
    
    // 使用 node-edge-tts 生成音频（使用 -t 参数传入文本）
    // 转义引号避免命令注入
    const escapedText = processedText.replace(/"/g, '\\"').replace(/\n/g, ' ');
    const cmd = `npx node-edge-tts -t "${escapedText}" -o "${outputFile}" -v "${voice}" -r "${rate}" --pitch "${pitch}" --volume "${volume}" --timeout 60000`;
    
    execSync(cmd, {
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: '1' },
      timeout: 60000 // 60 秒超时
    });
    
    if (!fs.existsSync(outputFile) || fs.statSync(outputFile).size === 0) {
      throw new Error('生成的音频文件为空');
    }
    
    const stats = fs.statSync(outputFile);
    console.log('');
    console.log(`✅ Edge TTS 音频已生成：${outputFile}`);
    console.log(`✅ 文件大小：${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    return true;
    
  } catch (error) {
    console.error('');
    console.error('⚠️  Edge TTS 生成失败:', error.message);
    console.error('💡 将尝试降级到 macOS say...');
    console.error('');
    return false; // 返回 false，让主流程降级到 say
  }
}

/**
 * 使用 macOS say 生成音频（备用）
 */
function generateWithSay(text, outputFile) {
  const voice = CONFIG.say.voice;
  const rate = CONFIG.say.rate;
  
  console.log(`使用 macOS say 命令生成音频...`);
  console.log(`语音：${voice}`);
  console.log(`语速：${rate} 字/分钟 (非常慢，助眠放松)`);
  console.log('⚠️  备用方案：Edge TTS 不可用时使用');
  console.log('');
  
  const processedText = preprocessText(text);
  const tempFile = path.join(CONFIG.outputDir, 'temp_story.txt');
  fs.writeFileSync(tempFile, processedText, 'utf8');
  
  const aiffFile = path.join(CONFIG.outputDir, 'temp_audio.aiff');
  
  try {
    console.log('正在生成音频...');
    
    execSync(`say -v ${voice} -r ${rate} -o "${aiffFile}" -f "${tempFile}"`, {
      stdio: 'inherit'
    });
    
    if (!fs.existsSync(aiffFile) || fs.statSync(aiffFile).size === 0) {
      throw new Error('生成的音频文件为空');
    }
    
    // 转换为 MP3
    if (checkFfmpeg()) {
      console.log('正在转换为 MP3 格式...');
      try {
        execSync(`ffmpeg -y -i "${aiffFile}" -acodec libmp3lame -ab ${CONFIG.audioBitrate} -ar 44100 "${outputFile}" 2>/dev/null`, { stdio: 'pipe' });
        
        if (fs.existsSync(outputFile) && fs.statSync(outputFile).size > 0) {
          fs.unlinkSync(aiffFile);
          console.log(`✅ 音频已转换为 MP3: ${outputFile}`);
        } else {
          throw new Error('MP3 转换后文件为空');
        }
      } catch (e) {
        fs.renameSync(aiffFile, outputFile);
        console.log(`⚠️  MP3 转换失败，保留 AIFF 格式：${outputFile}`);
      }
    } else {
      fs.renameSync(aiffFile, outputFile);
      console.log(`⚠️  ffmpeg 未安装，保留 AIFF 格式：${outputFile}`);
    }
    
    const stats = fs.statSync(outputFile);
    console.log(`✅ 文件大小：${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    fs.unlinkSync(tempFile);
    return true;
    
  } catch (error) {
    console.error('❌ 生成音频失败:', error.message);
    try {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      if (fs.existsSync(aiffFile)) fs.unlinkSync(aiffFile);
    } catch (e) {}
    return false;
  }
}

/**
 * 自动选择最佳 TTS 引擎
 */
function selectTTSEngine() {
  if (CONFIG.ttsEngine === 'edge') {
    return 'edge';
  } else if (CONFIG.ttsEngine === 'say') {
    return 'say';
  } else {
    // auto: 自动选择
    if (checkEdgeTTS()) {
      console.log('✅ 检测到 Edge TTS 可用，将使用 Edge TTS (最自然)');
      return 'edge';
    } else if (checkSay()) {
      console.log('⚠️  Edge TTS 不可用，降级使用 macOS say');
      return 'say';
    } else {
      console.error('❌ 错误：没有可用的 TTS 引擎');
      console.error('');
      console.error('请安装以下之一:');
      console.error('  1. Edge TTS: npm install -g node-edge-tts');
      console.error('  2. 或使用 macOS 系统 (内置 say 命令)');
      console.error('');
      return null;
    }
  }
}

/**
 * 生成故事音频
 */
async function generateAudio(storyText, storyId, options = {}) {
  ensureOutputDir();
  
  const timestamp = new Date().toISOString().split('T')[0];
  const outputFile = path.join(CONFIG.outputDir, `${storyId || 'sleep-story'}-${timestamp}.${CONFIG.audioFormat}`);
  
  console.log('\n🎵 Sleep Story Audio Generator');
  console.log('================================\n');
  console.log(`故事 ID: ${storyId}`);
  console.log(`文本长度：${storyText.length} 字符`);
  console.log(`输出文件：${outputFile}`);
  console.log('');
  
  // 自动选择 TTS 引擎
  const engine = selectTTSEngine();
  
  if (!engine) {
    console.error('❌ 无法生成音频：没有可用的 TTS 引擎');
    return null;
  }
  
  console.log(`使用 TTS 引擎：${engine === 'edge' ? 'Edge TTS (推荐)' : 'macOS say (备用)'}\n`);
  
  let success = false;
  
  // 优先尝试 Edge TTS
  if (engine === 'edge') {
    console.log('正在尝试 Edge TTS...');
    success = generateWithEdgeTTS(storyText, outputFile);
    
    // Edge TTS 失败，降级到 say
    if (!success && checkSay()) {
      console.log('');
      console.log('⬇️  Edge TTS 失败，降级到 macOS say...');
      console.log('');
      success = generateWithSay(storyText, outputFile);
    }
  } else {
    // 直接使用 say
    success = generateWithSay(storyText, outputFile);
  }
  
  if (success) {
    console.log('\n✅ 音频生成成功！');
    console.log('');
    console.log('📁 文件位置:', outputFile);
    console.log('');
    console.log('💡 播放建议:');
    console.log('   - 睡前 15-30 分钟开始播放');
    console.log('   - 音量调至舒适水平');
    console.log('   - 可配合耳机获得更好体验');
    console.log('');
    
    if (engine === 'edge') {
      console.log('🎯 Edge TTS 配置:');
      console.log('   更换语音：--voice zh-CN-XiaoyiNeural (小艺)');
      console.log('   调整语速：--rate "-20%" (更慢) 或 "--rate "+10%" (稍快)');
      console.log('   可用语音：zh-CN-XiaoxiaoNeural (晓晓，默认)');
      console.log('              zh-CN-XiaoyiNeural (小艺)');
      console.log('              zh-CN-YunxiNeural (云希 - 男声)');
      console.log('');
    }
    
    return outputFile;
  } else {
    console.error('\n❌ 音频生成失败');
    console.error('');
    console.error('请检查:');
    console.error('   1. 网络连接是否正常（Edge TTS 需要联网）');
    console.error('   2. 输入文本文件是否存在');
    console.error('   3. TTS 引擎是否正确安装');
    console.error('');
    return null;
  }
}

// CLI 使用
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Sleep Story Audio Generator
===========================

生成温暖治愈的助眠故事音频
首选 Edge TTS (微软 Neural)，备用 macOS say

用法:
  node generate-audio.js <故事文本文件> [故事 ID] [选项]

示例:
  node generate-audio.js story.txt sleep-story-2026-04-05
  node generate-audio.js story.txt --voice zh-CN-XiaoyiNeural
  node generate-audio.js story.txt --rate "-20%"
  node generate-audio.js story.txt --engine say

选项:
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
  --output <目录>         输出目录，默认：~/jnSleepStory

环境变量:
  SLEEP_STORY_OUTPUT_DIR      输出目录
  SLEEP_STORY_TTS_ENGINE      TTS 引擎 (auto|edge|say)，默认：auto
  SLEEP_STORY_EDGE_VOICE      Edge TTS 语音，默认：zh-CN-XiaoxiaoNeural
  SLEEP_STORY_EDGE_RATE       Edge TTS 语速，默认：-15%
  SLEEP_STORY_SAY_VOICE       macOS say 语音，默认：Mei-Jia
  SLEEP_STORY_SAY_RATE        macOS say 语速，默认：120

TTS 引擎对比:
  ┌─────────────┬──────────┬──────────┬────────────┐
  │ 特性        │ Edge TTS │ macOS say│ ElevenLabs │
  ├─────────────┼──────────┼──────────┼────────────┤
  │ 自然度      │ ★★★★★   │ ★★★☆☆   │ ★★★★★     │
  │ 免费额度    │ 无限制    │ 无限制    │ 1 万字符/月  │
  │ API Key     │ 不需要    │ 不需要    │ 需要        │
  │ 中文语音    │ 10+ 种    │ 2-3 种     │ 多种        │
  │ 需要联网    │ 是        │ 否        │ 是          │
  │ 助眠推荐    │ ⭐⭐⭐⭐⭐   │ ⭐⭐⭐☆☆   │ ⭐⭐⭐⭐⭐     │
  └─────────────┴──────────┴──────────┴────────────┘

自动降级策略:
  1. 优先使用 Edge TTS (最自然，免费)
  2. Edge TTS 不可用时，降级到 macOS say
  3. 确保始终有可用的 TTS 引擎

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
    if (arg === '--voice' && args[i + 1]) {
      // 根据引擎设置对应的语音
      if (CONFIG.ttsEngine === 'say' || arg.includes('Mei-Jia') || arg.includes('Ting-Ting')) {
        CONFIG.say.voice = args[i + 1];
      } else {
        CONFIG.edgeTTS.voice = args[i + 1];
      }
      i += 2;
    } else if (arg === '--rate' && args[i + 1]) {
      // 根据引擎设置对应的语速
      if (CONFIG.ttsEngine === 'say') {
        CONFIG.say.rate = parseInt(args[i + 1]);
      } else {
        CONFIG.edgeTTS.rate = args[i + 1];
      }
      i += 2;
    } else if (arg === '--engine' && args[i + 1]) {
      CONFIG.ttsEngine = args[i + 1];
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
  
  // 设置环境变量
  process.env.SLEEP_STORY_EDGE_VOICE = CONFIG.edgeTTS.voice;
  process.env.SLEEP_STORY_EDGE_RATE = CONFIG.edgeTTS.rate;
  process.env.SLEEP_STORY_SAY_VOICE = CONFIG.say.voice;
  process.env.SLEEP_STORY_SAY_RATE = CONFIG.say.rate.toString();
  
  generateAudio(storyText, storyId).then(result => {
    process.exit(result ? 0 : 1);
  });
}

module.exports = { generateAudio, CONFIG, checkEdgeTTS, checkSay };
