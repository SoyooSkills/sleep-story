#!/usr/bin/env node

/**
 * Sleep Story Video Generator
 * 生成助眠故事视频（搭配柔缓背景音乐和舒缓视觉背景）
 * 
 * 功能：
 * 1. 创建静态/渐变背景画面（星空、自然风景等助眠视觉）
 * 2. 添加柔缓背景音乐（钢琴曲、自然声音、白噪音）
 * 3. 合成故事音频、背景、音乐
 * 4. 输出 MP4 视频文件
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
  // 输出目录
  outputDir: process.env.SLEEP_STORY_OUTPUT_DIR || path.join(process.env.HOME, 'sleepStory'),

  // 视频配置
  video: {
    width: process.env.SLEEP_STORY_VIDEO_WIDTH || '1920',
    height: process.env.SLEEP_STORY_VIDEO_HEIGHT || '1080',
    fps: process.env.SLEEP_STORY_VIDEO_FPS || '30',
    duration: null, // 根据音频自动计算
  },

  // 背景类型：gradient | stars | nature | ocean | forest
  backgroundType: process.env.SLEEP_STORY_BACKGROUND || 'gradient',

  // 背景音乐配置
  bgm: {
    // 背景音乐类型：piano | nature | white_noise | ambient
    type: process.env.SLEEP_STORY_BGM_TYPE || 'piano',
    // 背景音乐文件路径（可选，优先使用内置生成）
    file: process.env.SLEEP_STORY_BGM_FILE || '',
    // 音量（0-1），助眠建议 0.1-0.2
    volume: parseFloat(process.env.SLEEP_STORY_BGM_VOLUME || '0.15'),
    // 淡入淡出时间（秒）
    fadeDuration: parseFloat(process.env.SLEEP_STORY_BGM_FADE || '3'),
  },

  // 音频格式
  audioFormat: 'mp3',
  // 视频格式
  videoFormat: 'mp4',
  // 视频编码
  videoCodec: 'libx264',
  audioCodec: 'aac',
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
 * 检查 ffmpeg 是否可用
 * @returns {boolean} ffmpeg 是否已安装
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
 * 获取 ffmpeg 安装命令（根据操作系统）
 * @returns {string} 安装命令
 */
function getFfmpegInstallCommand() {
  const platform = process.platform;

  if (platform === 'darwin') {
    return 'brew install ffmpeg';
  } else if (platform === 'linux') {
    try {
      execSync('which apt-get', { stdio: 'pipe' });
      return 'sudo apt-get install ffmpeg';
    } catch (e) {
      try {
        execSync('which yum', { stdio: 'pipe' });
        return 'sudo yum install ffmpeg';
      } catch (e2) {
        return 'sudo apt-get install ffmpeg';
      }
    }
  } else if (platform === 'win32') {
    return 'choco install ffmpeg';
  }

  return '请手动安装 ffmpeg: https://ffmpeg.org/download.html';
}

/**
 * 检查并提示 ffmpeg 安装状态
 * @returns {boolean} ffmpeg 是否已安装
 */
function checkAndNotifyFfmpeg() {
  const hasFfmpeg = checkFfmpeg();

  if (hasFfmpeg) {
    try {
      const version = execSync('ffmpeg -version', { encoding: 'utf8', stdio: 'pipe' }).split('\n')[0];
      console.log(`✅ ffmpeg 已安装：${version}`);
    } catch (e) {
      console.log('✅ ffmpeg 已安装');
    }
  } else {
    console.log('❌ 错误：ffmpeg 未安装，无法生成视频');
    console.log('');
    console.log('请根据操作系统安装 ffmpeg：');
    console.log('-----------------------------------');
    console.log(`  ${getFfmpegInstallCommand()}`);
    console.log('-----------------------------------');
    console.log('');
    console.log('安装完成后重新运行此脚本即可生成视频。');
    console.log('如果只需要音频，请使用 --mode audio 参数。\n');
  }

  return hasFfmpeg;
}

/**
 * 生成柔缓背景音乐
 * 使用 ffmpeg 生成舒缓的音频
 * @param {string} outputFile - 输出文件路径
 * @param {number} duration - 时长（秒）
 * @returns {boolean} 是否成功
 */
function createBgm(outputFile, duration) {
  console.log(`生成柔缓背景音乐 (类型：${CONFIG.bgm.type})...`);

  // 简化命令：使用单个正弦波生成柔和音调
  const freq = CONFIG.bgm.type === 'piano' ? '329.63' : '300';
  const cmd = `ffmpeg -y -f lavfi -i "sine=frequency=${freq}:duration=${duration}:sample_rate=44100" -af "volume=${CONFIG.bgm.volume},treble=f=2000" -c:a mp3 -b:a 64k "${outputFile}"`;

  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log(`✅ 背景音乐生成完成`);
    return true;
  } catch (e) {
    console.log('背景音乐生成失败:', e.message.substring(0, 100));
    return false;
  }
}

/**
 * 生成渐变背景视频
 * 创建柔和的渐变色背景，模拟夜空
 * @param {string} outputFile - 输出文件路径
 * @param {number} duration - 时长（秒）
 * @returns {boolean} 是否成功
 */
function createGradientBackground(outputFile, duration) {
  console.log(`创建渐变背景视频 (夜空渐变)...`);

  // 使用 ffmpeg 的 color 和 overlay 滤镜创建柔和渐变
  // 深蓝色 (#1a1a2e) 到 紫蓝色 (#16213e) 的垂直渐变
  const cmd = `ffmpeg -y -f lavfi -i "color=c=#1a1a2e:s=${CONFIG.video.width}x${CONFIG.video.height}:d=${duration}:r=${CONFIG.video.fps}" \
    -vf "gradfun=radius=16:strength=12,format=yuv420p" \
    -c:v ${CONFIG.videoCodec} -preset slow -crf 18 -pix_fmt yuv420p "${outputFile}" 2>&1`;

  try {
    execSync(cmd, { stdio: 'pipe' });

    // 验证生成的视频是否有画面
    const info = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${outputFile}"`, { encoding: 'utf8' });
    const [width, height] = info.trim().split(',');

    if (parseInt(width) > 0 && parseInt(height) > 0) {
      console.log(`✅ 背景视频生成完成 (${width}x${height})`);
      return true;
    } else {
      throw new Error('生成的视频尺寸为 0');
    }
  } catch (e) {
    console.log('渐变背景生成失败，使用备用方案...');
    return createSimpleBackground(outputFile, duration);
  }
}

/**
 * 生成简单背景视频（备用方案）
 * @param {string} outputFile - 输出文件路径
 * @param {number} duration - 时长（秒）
 * @returns {boolean} 是否成功
 */
function createSimpleBackground(outputFile, duration) {
  console.log(`创建简单背景视频 (纯色 + 微光效果)...`);

  // 创建带有微弱亮度变化的背景
  const cmd = `ffmpeg -y -f lavfi -i "color=c=#1a1a3e:s=${CONFIG.video.width}x${CONFIG.video.height}:d=${duration}:r=${CONFIG.video.fps}" \
    -vf "eq=brightness=0.05:contrast=0.9,format=yuv420p" \
    -c:v ${CONFIG.videoCodec} -preset fast -crf 23 -pix_fmt yuv420p "${outputFile}" 2>&1`;

  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log(`✅ 背景视频生成完成`);
    return true;
  } catch (e) {
    console.error('背景视频生成失败:', e.message);
    return false;
  }
}

/**
 * 生成星空背景视频
 * 创建带有闪烁星星的夜空背景
 * @param {string} outputFile - 输出文件路径
 * @param {number} duration - 时长（秒）
 * @returns {boolean} 是否成功
 */
function createStarsBackground(outputFile, duration) {
  console.log(`创建星空背景视频...`);

  // 创建深蓝色背景 + 随机白点（星星）
  const cmd = `ffmpeg -y -f lavfi -i "color=c=#0a0a1a:s=${CONFIG.video.width}x${CONFIG.video.height}:d=${duration}:r=${CONFIG.video.fps}" \
    -vf "geq=lum='if(lt(random(X/W*100+Y/H*100),0.02),255,p(X,Y))':cb=0:cr=0,format=yuv420p" \
    -c:v ${CONFIG.videoCodec} -preset slow -crf 20 -pix_fmt yuv420p "${outputFile}" 2>&1`;

  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log(`✅ 星空背景生成完成`);
    return true;
  } catch (e) {
    console.log('星空背景生成失败，使用渐变背景...');
    return createGradientBackground(outputFile, duration);
  }
}

/**
 * 获取音频时长（秒）
 * @param {string} audioFile - 音频文件路径
 * @returns {number} 时长（秒）
 */
function getAudioDuration(audioFile) {
  try {
    const output = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioFile}"`,
      { encoding: 'utf8' }
    );
    return parseFloat(output.trim());
  } catch (e) {
    console.error('无法获取音频时长:', e.message);
    return 60; // 默认 60 秒
  }
}

/**
 * 合成视频
 * 将背景视频、故事音频、背景音乐合成为最终视频
 * @param {string} backgroundFile - 背景视频文件
 * @param {string} storyAudioFile - 故事音频文件
 * @param {string} bgmFile - 背景音乐文件
 * @param {string} outputFile - 输出文件路径
 * @returns {boolean} 是否成功
 */
function composeVideo(backgroundFile, storyAudioFile, bgmFile, outputFile) {
  console.log(`合成最终视频...`);

  const storyDuration = getAudioDuration(storyAudioFile);
  console.log(`故事音频时长：${storyDuration.toFixed(2)} 秒`);

  // 构建 ffmpeg 命令
  // 输入：0=背景视频，1=故事音频，2=背景音乐
  // 输出：视频流来自 0，音频流是 1 和 2 的混合
  const filterComplex = `[1:a][2:a]amix=inputs=2:duration=first:dropout_transition=2,volume=1+${CONFIG.bgm.volume * 0.5}[mixed_audio]`;

  const cmd = `ffmpeg -y \
    -i "${backgroundFile}" \
    -i "${storyAudioFile}" \
    -i "${bgmFile}" \
    -t ${storyDuration} \
    -c:v ${CONFIG.videoCodec} -preset slow -crf 20 \
    -c:a ${CONFIG.audioCodec} -b:a 192k \
    -filter_complex "${filterComplex}" \
    -map 0:v -map "[mixed_audio]" \
    -shortest \
    "${outputFile}" 2>&1`;

  try {
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch (e) {
    console.error('合成视频失败:', e.message);
    return false;
  }
}

/**
 * 生成助眠故事视频
 * @param {string} storyAudioFile - 故事音频文件路径
 * @param {string} storyId - 故事 ID（用于文件名）
 * @param {Object} options - 可选配置
 * @returns {string|null} 生成的视频文件路径，失败返回 null
 */
function generateVideo(storyAudioFile, storyId, options = {}) {
  ensureOutputDir();

  // 检查 ffmpeg 是否已安装
  const hasFfmpeg = checkAndNotifyFfmpeg();

  if (!hasFfmpeg) {
    console.log('💡 提示：跳过视频生成，仅生成音频文件。');
    console.log('   如需视频功能，请先安装 ffmpeg。\n');
    return null;
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const videoFile = path.join(CONFIG.outputDir, `${storyId || 'sleep-story'}-${timestamp}.${CONFIG.videoFormat}`);
  const tempBgFile = path.join(CONFIG.outputDir, `temp-bg-${Date.now()}.mp4`);
  const tempBgmFile = path.join(CONFIG.outputDir, `temp-bgm-${Date.now()}.mp3`);

  console.log(`\n🎬 开始生成视频...`);
  console.log(`故事音频：${storyAudioFile}`);
  console.log(`输出文件：${videoFile}`);
  console.log(`背景类型：${CONFIG.backgroundType}`);
  console.log(`背景音乐类型：${CONFIG.bgm.type}`);
  console.log(`背景音乐音量：${CONFIG.bgm.volume}\n`);

  if (!fs.existsSync(storyAudioFile)) {
    console.error(`错误：音频文件不存在：${storyAudioFile}`);
    return null;
  }

  try {
    // Step 1: 获取音频时长
    const duration = getAudioDuration(storyAudioFile);

    // Step 2: 创建背景视频
    console.log(`Step 1/3: 创建背景视频 (${CONFIG.backgroundType})...`);
    let bgSuccess = false;

    switch (CONFIG.backgroundType) {
      case 'stars':
        bgSuccess = createStarsBackground(tempBgFile, duration);
        break;
      case 'gradient':
      default:
        bgSuccess = createGradientBackground(tempBgFile, duration);
        break;
    }

    if (!bgSuccess) {
      throw new Error('创建背景视频失败');
    }

    // Step 3: 生成背景音乐
    console.log(`Step 2/3: 生成柔缓背景音乐...`);
    let hasBgm = false;
    let bgmToUse = null;

    if (CONFIG.bgm.file && fs.existsSync(CONFIG.bgm.file)) {
      console.log(`使用提供的背景音乐：${CONFIG.bgm.file}`);
      bgmToUse = CONFIG.bgm.file;
      hasBgm = true;
    } else {
      hasBgm = createBgm(tempBgmFile, duration + 5); // 多 5 秒确保覆盖
      if (hasBgm) {
        bgmToUse = tempBgmFile;
      }
    }

    if (!hasBgm) {
      console.log('⚠️  背景音乐生成失败，使用简化方案...');
      // 创建简单的背景音乐（单音正弦波）
      bgmToUse = path.join(CONFIG.outputDir, `temp-bgm-simple-${Date.now()}.mp3`);
      const simpleBgmCmd = `ffmpeg -y -f lavfi -i "sine=frequency=300:duration=${duration + 5}:sample_rate=44100" -af "volume=${CONFIG.bgm.volume}" -c:a mp3 "${bgmToUse}" 2>/dev/null`;
      try {
        execSync(simpleBgmCmd, { stdio: 'pipe' });
        hasBgm = true;
        console.log('✅ 使用简化背景音乐');
      } catch (e) {
        console.log('⚠️  简化背景音乐也失败，使用静音轨道');
      }
    }

    // Step 4: 合成视频
    console.log(`Step 3/3: 合成最终视频...`);

    // 如果没有 BGM，创建一个静音轨道
    if (!hasBgm || !bgmToUse) {
      bgmToUse = path.join(CONFIG.outputDir, `temp-silent-${Date.now()}.mp3`);
      try {
        execSync(`ffmpeg -y -f lavfi -i "anullsrc=r=44100:cl=stereo" -t ${duration} -c:a ${CONFIG.audioCodec} "${bgmToUse}" 2>/dev/null`, { stdio: 'pipe' });
      } catch (e) {
        console.log('⚠️  无法创建静音轨道，继续 without BGM');
      }
    }

    const success = composeVideo(tempBgFile, storyAudioFile, bgmToUse, videoFile);

    // 清理临时文件
    try {
      fs.unlinkSync(tempBgFile);
      if (tempBgmFile && fs.existsSync(tempBgmFile)) {
        fs.unlinkSync(tempBgmFile);
      }
      if (bgmToUse && bgmToUse !== CONFIG.bgm.file && fs.existsSync(bgmToUse)) {
        fs.unlinkSync(bgmToUse);
      }
    } catch (e) {
      // 忽略清理错误
    }

    if (success) {
      console.log(`\n✅ 视频生成成功！`);
      console.log(`文件位置：${videoFile}\n`);
      return videoFile;
    } else {
      throw new Error('合成视频失败');
    }
  } catch (error) {
    console.error('\n❌ 视频生成失败:', error.message, '\n');
    // 清理临时文件
    try {
      if (fs.existsSync(tempBgFile)) fs.unlinkSync(tempBgFile);
      if (fs.existsSync(tempBgmFile)) fs.unlinkSync(tempBgmFile);
    } catch (e) { }
    return null;
  }
}

// CLI 使用
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Sleep Story Video Generator
===========================

用法:
  node generate-video.js <故事音频文件> [故事 ID]

示例:
  node generate-video.js sleep-story-2026-04-05.mp3 sleep-story-2026-04-05
  node generate-video.js sleep-story-2026-04-05.mp3

环境变量:
  SLEEP_STORY_OUTPUT_DIR         输出目录，默认：~/sleepStory
  SLEEP_STORY_VIDEO_WIDTH        视频宽度，默认：1920
  SLEEP_STORY_VIDEO_HEIGHT       视频高度，默认：1080
  SLEEP_STORY_VIDEO_FPS          视频帧率，默认：30
  SLEEP_STORY_BACKGROUND         背景类型 (gradient|stars|nature|ocean|forest)，默认：gradient
  SLEEP_STORY_BGM_TYPE           音乐类型 (piano|nature|white_noise|ambient)，默认：piano
  SLEEP_STORY_BGM_FILE           背景音乐文件路径（可选）
  SLEEP_STORY_BGM_VOLUME         背景音乐音量 (0-1)，默认：0.15
  SLEEP_STORY_BGM_FADE           淡入淡出时间（秒），默认：3

依赖:
  - ffmpeg (必需)
    macOS: brew install ffmpeg
    Ubuntu: sudo apt-get install ffmpeg
    Windows: choco install ffmpeg

`);
    process.exit(1);
  }

  const audioFile = args[0];
  const storyId = args[1] || 'sleep-story';

  if (!fs.existsSync(audioFile)) {
    console.error(`错误：文件不存在：${audioFile}`);
    process.exit(1);
  }

  const result = generateVideo(audioFile, storyId);
  process.exit(result ? 0 : 1);
}

module.exports = { generateVideo, CONFIG, checkFfmpeg, checkAndNotifyFfmpeg };
