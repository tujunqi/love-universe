/**
 * 浪漫背景音乐合成器（纯 Node，无任何依赖）。
 * --------------------------------------------------------------------------
 * 作用：用代码“弹”一段温柔的钢琴曲，替换 assets/music/bgm.wav。
 *       曲式是最经典的浪漫走向：C 大调 C → G/B → Am → F，
 *       弦乐垫铺底 + 钢琴分解和弦 + 一条会“呼吸”的旋律。
 *
 * 为什么这样设计：
 *   · 无损 WAV，任何浏览器、任何年代都能播；
 *   · 结尾和开头做了交叉混合，循环播放时听不出接缝；
 *   · 想换歌：把你们的音乐改名 bgm.mp3 放进 assets/music/，
 *     再把 js/main.js 的 CONFIG.music 改成 "assets/music/bgm.mp3" 即可。
 *
 * 用法：node tools/make-music.js
 */
const fs = require("fs");
const path = require("path");

/* ==========================================================================
   一、基本参数
   ========================================================================== */
const SAMPLE_RATE = 22050;        // 采样率：人声音乐足够，文件小一半
const BPM = 72;                   // 每分钟 72 拍：慢下来，才有告白的感觉
const BEAT = 60 / BPM;            // 一拍的秒数（0.833s）
const BEATS_PER_CHORD = 8;        // 每个和弦占 8 拍（2 小节）
const TOTAL_BEATS = BEATS_PER_CHORD * 4;   // 四个和弦 = 32 拍
const LOOP_SECONDS = TOTAL_BEATS * BEAT;   // 循环体长度（约 26.7s）
const TAIL_SECONDS = 4;                    // 额外渲染的余音，用来回填到开头
const TOTAL_SECONDS = LOOP_SECONDS + TAIL_SECONDS;

const N = Math.round(TOTAL_SECONDS * SAMPLE_RATE);
const buffer = new Float64Array(N);        // 主音频缓冲
const rng = (min, max) => min + Math.random() * (max - min);

/* ==========================================================================
   二、音符工具
   ========================================================================== */
// MIDI 编号 → 频率（A4 = 69 = 440Hz）
function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/* ==========================================================================
   三、几种“乐器”
   ========================================================================== */

// 柔和钢琴：几个泛音叠加 + 指数衰减，落键带一点点力度随机
function playPiano(startSec, durationSec, midi, velocity) {
  const freq = midiToFreq(midi);
  const start = Math.round(startSec * SAMPLE_RATE);
  const len = Math.round(Math.min(durationSec + 1.5, 3.5) * SAMPLE_RATE);
  // 泛音表：基音最强，高次泛音依次减弱（高音区泛音少一点，避免发脆）
  const harmonics = midi > 72
    ? [[1, 1], [2, 0.32], [3, 0.12]]
    : [[1, 1], [2, 0.45], [3, 0.18], [4, 0.08]];
  const attack = 0.008;             // 8ms 起音，像轻轻按下琴键
  const decayTau = 1.15 + velocity; // 越用力衰减越慢一点

  for (let i = 0; i < len; i++) {
    const index = start + i;
    if (index >= N) break;
    const t = i / SAMPLE_RATE;
    // 包络：快起音 → 指数衰减 → 末尾轻收
    let env = Math.exp(-t / decayTau);
    if (t < attack) env *= t / attack;
    const sustain = Math.min(1, durationSec / t); // 音长内保持，松开后继续自然衰减
    if (t > durationSec) env *= Math.max(0.25, 1 - (t - durationSec) / 0.5);
    void sustain;

    let sample = 0;
    for (const [mult, amp] of harmonics) {
      // 每个泛音带一点频率漂移，模拟真实琴弦
      const drift = 1 + Math.sin(t * 2.1 + mult) * 0.0006;
      sample += amp * Math.sin(2 * Math.PI * freq * mult * drift * t);
    }
    buffer[index] += sample * env * velocity * 0.22;
  }
}

// 弦乐垫：三个声部轻微走调叠加，慢起慢收，铺出温暖的底色
function playPad(startSec, durationSec, midis, velocity) {
  const start = Math.round(startSec * SAMPLE_RATE);
  const attack = 1.4;               // 1.4 秒才完全进入，像弓子慢慢压上去
  const release = 1.8;
  const len = Math.round((durationSec + release) * SAMPLE_RATE);

  for (let i = 0; i < len; i++) {
    const index = start + i;
    if (index >= N) break;
    const t = i / SAMPLE_RATE;
    let env = 1;
    if (t < attack) env = t / attack;
    if (t > durationSec) env *= Math.max(0, 1 - (t - durationSec) / release);
    env = env * env * (3 - 2 * env); // smoothstep，让过渡更圆

    let sample = 0;
    midis.forEach((midi, voice) => {
      const freq = midiToFreq(midi);
      // 三个“演奏者”，各有 0.3% 的音准差 → 自然形成合唱般的宽度
      for (let detune = -1; detune <= 1; detune++) {
        const f = freq * (1 + detune * 0.003);
        // 三角波近似：正弦 + 1/9 强度的三次谐波
        sample += Math.sin(2 * Math.PI * f * t + voice + detune) * 0.34
                + Math.sin(2 * Math.PI * f * 3 * t + voice) * 0.038;
      }
    });
    // 缓慢的呼吸感音量起伏
    const breathe = 1 + Math.sin(2 * Math.PI * 0.12 * t + voice2(startSec)) * 0.08;
    buffer[index] += sample * env * velocity * breathe * 0.05;
  }
}
// 让每次和弦的呼吸相位不同，避免机械感
function voice2(seed) { return (seed * 7.3) % (Math.PI * 2); }

// 低音：干净的正弦，只负责“稳”
function playBass(startSec, durationSec, midi, velocity) {
  const freq = midiToFreq(midi);
  const start = Math.round(startSec * SAMPLE_RATE);
  const attack = 0.06;
  const release = 0.8;
  const len = Math.round((durationSec + release) * SAMPLE_RATE);
  for (let i = 0; i < len; i++) {
    const index = start + i;
    if (index >= N) break;
    const t = i / SAMPLE_RATE;
    let env = 1;
    if (t < attack) env = t / attack;
    if (t > durationSec) env *= Math.max(0, 1 - (t - durationSec) / release);
    const warm = Math.sin(2 * Math.PI * freq * t)
               + Math.sin(2 * Math.PI * freq * 2 * t) * 0.12; // 一点点二次谐波更暖
    buffer[index] += warm * env * velocity * 0.16;
  }
}

/* ==========================================================================
   四、写谱：C → G/B → Am → F，每个和弦 8 拍
   ========================================================================== */
const chords = [
  { pad: [60, 64, 67], bass: 36, arp: [60, 67, 72, 76] },  // C：  C4 G4 C5 E5
  { pad: [59, 62, 67], bass: 35, arp: [59, 62, 67, 71] },  // G/B：B3 D4 G4 B4
  { pad: [57, 60, 64], bass: 33, arp: [57, 64, 69, 72] },  // Am： A3 C4 E4 A4（低音 A1 太沉，用 A2 高八度减半音量）
  { pad: [53, 57, 60], bass: 29, arp: [53, 60, 65, 69] }   // F：  F3 C4 F4 A4
];

// 主旋律（拍位, 时值拍数, MIDI）——一条先升后落的弧线，结尾落在主音上，循环时情绪能接上
const melody = [
  // C 和弦：轻轻地往上问一句
  [0, 2, 76], [2, 1, 79], [3, 1, 81], [4, 2.5, 79], [7, 1, 76],
  // G/B：回答里带一点期待
  [8, 2, 74], [10, 1, 71], [11, 1, 74], [12, 3, 79], [15.5, 0.5, 81],
  // Am：稍稍沉下来，最柔的一句
  [16, 2, 84], [18, 2, 81], [20, 3, 79], [23, 1, 76],
  // F：落回 C，安稳收尾（下一个循环正好回到开头）
  [24, 2, 77], [26, 1, 76], [27, 1, 74], [28, 3.5, 72]
];

for (let c = 0; c < chords.length; c++) {
  const chordStart = c * BEATS_PER_CHORD * BEAT;
  const chordLen = BEATS_PER_CHORD * BEAT;

  // 弦乐垫铺满整个和弦
  playPad(chordStart, chordLen, chords[c].pad, 0.95);
  // 低音在正拍落一次，中段补一次五度
  playBass(chordStart, chordLen * 0.55, chords[c].bass, 0.9);
  playBass(chordStart + chordLen * 0.5, chordLen * 0.45, chords[c].bass + 7, 0.55);

  // 钢琴分解和弦：1 - 5 - 8 - 10 的摇曳pattern，八分音符
  const pattern = [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 2, 3, 2, 1];
  for (let step = 0; step < BEATS_PER_CHORD * 2; step++) {
    const tone = chords[c].arp[pattern[step] % chords[c].arp.length];
    // 奇数步轻一点，形成摇曳的律动；再加 ±6ms 的人性化抖动
    const velocity = (step % 2 === 0 ? 0.5 : 0.32) * rng(0.88, 1.08);
    const when = chordStart + step * (BEAT / 2) + rng(-0.006, 0.006);
    playPiano(when, BEAT * 0.9, tone + 12, velocity);
  }
}

// 主旋律：音符时值前面留 30ms“气口”，乐句才不会黏在一起
for (const [beatPos, beatLen, midi] of melody) {
  playPiano(beatPos * BEAT + 0.02, beatLen * BEAT * 0.92, midi, 0.62 * rng(0.9, 1.06));
}

/* ==========================================================================
   五、混响：把“房间”加进来（Schroeder 混响：4 个梳状 + 2 个全通）
   ========================================================================== */
function reverb(input) {
  const out = new Float64Array(input.length);
  const combs = [
    { delay: Math.round(0.0297 * SAMPLE_RATE), fb: 0.77 },
    { delay: Math.round(0.0371 * SAMPLE_RATE), fb: 0.75 },
    { delay: Math.round(0.0411 * SAMPLE_RATE), fb: 0.73 },
    { delay: Math.round(0.0437 * SAMPLE_RATE), fb: 0.71 }
  ];
  const wet = new Float64Array(input.length);

  for (const comb of combs) {
    const line = new Float64Array(comb.delay);
    for (let i = 0; i < input.length; i++) {
      const delayed = line[i % comb.delay];
      wet[i] += delayed * 0.25;
      line[i % comb.delay] = input[i] + delayed * comb.fb;
    }
  }

  // 两个全通滤波器，把“金属感”打散
  const allpass = (signal, delayMs, gain) => {
    const d = Math.round(delayMs * SAMPLE_RATE);
    const line = new Float64Array(d);
    for (let i = 0; i < signal.length; i++) {
      const bufOut = line[i % d];
      const x = signal[i] + bufOut * gain;
      line[i % d] = x;
      signal[i] = bufOut - x * gain;
    }
  };
  allpass(wet, 0.005, 0.7);
  allpass(wet, 0.0017, 0.7);

  // 干声为主，湿声轻轻托着
  for (let i = 0; i < input.length; i++) out[i] = input[i] * 0.82 + wet[i] * 0.5;
  return out;
}

const mixed = reverb(buffer);

/* ==========================================================================
   六、无缝循环处理：把结尾的余音交叉混回开头
   ========================================================================== */
const loopSamples = Math.round(LOOP_SECONDS * SAMPLE_RATE);
const tailSamples = N - loopSamples;
const fadeSamples = Math.min(tailSamples, Math.round(0.8 * SAMPLE_RATE));
for (let i = 0; i < tailSamples; i++) {
  if (i < fadeSamples) {
    // 余音的头部淡入后叠加到开头，其余部分直接叠加（都是衰减中的尾巴，听感安全）
    const fadeIn = i / fadeSamples;
    mixed[i % loopSamples] += mixed[loopSamples + i] * fadeIn;
  } else {
    mixed[i % loopSamples] += mixed[loopSamples + i];
  }
}

/* ==========================================================================
   七、响度归一 + 写 WAV
   ========================================================================== */
let peak = 0;
for (let i = 0; i < loopSamples; i++) peak = Math.max(peak, Math.abs(mixed[i]));
const gain = 0.72 / (peak || 1);   // 峰值压到 0.72，留足余量
// RMS 检查用
let sumSq = 0;
for (let i = 0; i < loopSamples; i++) { mixed[i] *= gain; sumSq += mixed[i] * mixed[i]; }
const rms = Math.sqrt(sumSq / loopSamples);

const bytesPerSample = 2;
const dataSize = loopSamples * bytesPerSample;
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + dataSize, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);          // PCM 块大小
header.writeUInt16LE(1, 20);           // PCM 格式
header.writeUInt16LE(1, 22);           // 单声道
header.writeUInt32LE(SAMPLE_RATE, 24);
header.writeUInt32LE(SAMPLE_RATE * bytesPerSample, 28); // 字节率
header.writeUInt16LE(bytesPerSample, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(dataSize, 40);

const data = Buffer.alloc(dataSize);
for (let i = 0; i < loopSamples; i++) {
  const clamped = Math.max(-1, Math.min(1, mixed[i]));
  data.writeInt16LE(Math.round(clamped * 32767), i * 2);
}

const OUT = path.join(__dirname, "..", "assets", "music", "bgm.wav");
fs.writeFileSync(OUT, Buffer.concat([header, data]));

console.log("✓ 浪漫背景音乐已生成");
console.log(`  输出：${path.relative(path.join(__dirname, ".."), OUT)}`);
console.log(`  时长：${LOOP_SECONDS.toFixed(1)} 秒（无缝循环）`);
console.log(`  大小：${(fs.statSync(OUT).size / 1024 / 1024).toFixed(2)} MB`);
console.log(`  峰值：0.72 | RMS：${rms.toFixed(3)} | 采样率：${SAMPLE_RATE}Hz 单声道`);
console.log("  想换成你们的歌：改名 bgm.mp3 放进 assets/music/，再把 CONFIG.music 改成 .mp3");
