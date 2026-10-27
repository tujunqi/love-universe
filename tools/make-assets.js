/**
 * 生成演示用占位素材（封面 3 张 + 照片墙 20 张 + 柔和背景音乐）
 * 用法：node tools/make-assets.js
 * 说明：这些只是“开箱即用”的占位图，换成你们自己的照片后可以删掉本脚本。
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const photoDir = path.join(root, "assets", "photos");
const musicDir = path.join(root, "assets", "music");
fs.mkdirSync(photoDir, { recursive: true });
fs.mkdirSync(musicDir, { recursive: true });

/* ---------- 通用滤镜：胶片颗粒 + 柔光 ---------- */
function defs(id, palette) {
  const [a, b, c, d] = palette;
  return `
  <defs>
    <linearGradient id="sky-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="55%" stop-color="${b}"/>
      <stop offset="100%" stop-color="${c}"/>
    </linearGradient>
    <radialGradient id="glow-${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff8ec" stop-opacity=".95"/>
      <stop offset="45%" stop-color="#ffe6cd" stop-opacity=".45"/>
      <stop offset="100%" stop-color="#ffe6cd" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="hill-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c}"/>
      <stop offset="100%" stop-color="${d}"/>
    </linearGradient>
    <filter id="grain-${id}">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope=".055"/></feComponentTransfer>
    </filter>
    <filter id="soft-${id}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="22"/>
    </filter>
  </defs>`;
}

/* ---------- 封面 1：日落山丘 ---------- */
function coverSunset() {
  const id = "c1";
  const p = ["#fbe9dd", "#f2bcae", "#cf8c8d", "#6f4654"];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  ${defs(id, p)}
  <rect width="1600" height="1000" fill="url(#sky-${id})"/>
  <circle cx="1180" cy="330" r="150" fill="url(#glow-${id})"/>
  <circle cx="1180" cy="330" r="72" fill="#fff3df" opacity=".9"/>
  <ellipse cx="380" cy="180" rx="240" ry="46" fill="#fff" opacity=".13" filter="url(#soft-${id})"/>
  <ellipse cx="880" cy="250" rx="300" ry="40" fill="#fff" opacity=".1" filter="url(#soft-${id})"/>
  <path d="M0 690 C 240 600 430 650 650 700 C 900 755 1120 640 1600 710 V1000 H0 Z" fill="${p[2]}" opacity=".72"/>
  <path d="M0 780 C 260 700 500 790 760 770 C 1040 748 1280 690 1600 790 V1000 H0 Z" fill="${p[3]}" opacity=".82"/>
  <path d="M0 870 C 320 810 580 880 860 860 C 1150 840 1370 800 1600 875 V1000 H0 Z" fill="#4c303d"/>
  <g opacity=".92" fill="#3a2531">
    <circle cx="1140" cy="742" r="17"/>
    <path d="M1124 762 q16 -18 32 0 l7 58 h-46 Z"/>
    <path d="M1132 820 l-9 62 h9 l14 -54 l14 54 h9 l-9 -62 Z"/>
    <circle cx="1181" cy="756" r="14"/>
    <path d="M1168 774 q13 -15 26 0 l5 50 h-36 Z"/>
    <path d="M1173 824 l-7 55 h8 l10 -47 l10 47 h8 l-7 -55 Z"/>
    <path d="M1160 786 q28 12 50 -2" stroke="#3a2531" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>
  <g fill="#fff" opacity=".5">
    <circle cx="260" cy="300" r="2"/><circle cx="420" cy="380" r="1.6"/>
    <circle cx="620" cy="230" r="1.8"/><circle cx="1420" cy="470" r="2"/>
  </g>
  <rect width="1600" height="1000" filter="url(#grain-${id})" opacity=".8"/>
</svg>`;
}

/* ---------- 封面 2：夜空海面 ---------- */
function coverNight() {
  const id = "c2";
  const p = ["#070d21", "#17264c", "#3e5680", "#0a1024"];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  ${defs(id, p)}
  <rect width="1600" height="1000" fill="url(#sky-${id})"/>
  <circle cx="1130" cy="270" r="190" fill="url(#glow-${id})" opacity=".75"/>
  <circle cx="1130" cy="270" r="62" fill="#f3ead6"/>
  <circle cx="1108" cy="252" r="12" fill="#e3d5ba" opacity=".6"/>
  <circle cx="1150" cy="292" r="8" fill="#e3d5ba" opacity=".5"/>
  <g fill="#fff">
    <circle cx="180" cy="150" r="2.4" opacity=".8"/><circle cx="300" cy="260" r="1.6" opacity=".55"/>
    <circle cx="460" cy="120" r="2" opacity=".7"/><circle cx="620" cy="310" r="1.4" opacity=".5"/>
    <circle cx="780" cy="170" r="2.2" opacity=".75"/><circle cx="940" cy="90" r="1.5" opacity=".6"/>
    <circle cx="1320" cy="140" r="2" opacity=".7"/><circle cx="1440" cy="330" r="1.6" opacity=".5"/>
    <circle cx="150" cy="420" r="1.5" opacity=".45"/><circle cx="520" cy="60" r="1.2" opacity=".55"/>
    <circle cx="1230" cy="460" r="1.8" opacity=".55"/><circle cx="1050" cy="520" r="1.2" opacity=".4"/>
  </g>
  <path d="M0 610 H1600 V1000 H0 Z" fill="#0c1730"/>
  <path d="M0 610 C 300 596 500 624 800 614 C 1100 604 1300 592 1600 618 V700 H0 Z" fill="#12203f"/>
  <g opacity=".3" stroke="#d9e2ff" stroke-linecap="round">
    <path d="M1010 660 h210" stroke-width="2"/><path d="M1060 692 h120" stroke-width="1.5"/>
    <path d="M980 724 h280" stroke-width="2"/><path d="M1080 756 h90" stroke-width="1.2"/>
    <path d="M1030 792 h170" stroke-width="1.6"/>
  </g>
  <path d="M0 880 C 250 830 380 900 640 905 C 940 910 1230 850 1600 900 V1000 H0 Z" fill="#070d20"/>
  <g fill="#060b19">
    <circle cx="1240" cy="770" r="16"/>
    <path d="M1224 790 q16 -18 32 0 l6 56 h-44 Z"/>
    <path d="M1232 846 l-8 66 h8 l13 -57 l13 57 h8 l-8 -66 Z"/>
    <circle cx="1280" cy="784" r="13"/>
    <path d="M1268 800 q12 -14 24 0 l5 46 h-34 Z"/>
    <path d="M1273 846 l-6 50 h7 l9 -43 l9 43 h7 l-6 -50 Z"/>
    <path d="M1256 806 q26 12 46 -2" stroke="#060b19" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>
  <circle cx="150" cy="840" r="2" fill="#fff" opacity=".8"/>
  <circle cx="210" cy="880" r="1.4" fill="#fff" opacity=".6"/>
  <rect width="1600" height="1000" filter="url(#grain-${id})" opacity=".8"/>
</svg>`;
}

/* ---------- 封面 3：午后窗景 ---------- */
function coverWindow() {
  const id = "c3";
  const p = ["#f7ecdc", "#ebd2b4", "#c39a75", "#7c5841"];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  ${defs(id, p)}
  <rect width="1600" height="1000" fill="#efe1cf"/>
  <rect x="150" y="90" width="1300" height="820" rx="650" fill="url(#sky-${id})"/>
  <path d="M150 700 C 420 660 600 720 800 700 C 1050 675 1240 640 1450 690 V910 H150 Z" fill="${p[2]}" opacity=".55"/>
  <path d="M150 790 C 400 750 620 820 900 790 C 1160 762 1330 770 1450 800 V910 H150 Z" fill="${p[3]}" opacity=".55"/>
  <path d="M800 90 V910" stroke="#f7ecdc" stroke-width="14" opacity=".75"/>
  <path d="M150 500 H1450" stroke="#f7ecdc" stroke-width="12" opacity=".65"/>
  <path d="M150 90 Q 300 260 240 500 Q 200 700 150 910" fill="#fff8ed" opacity=".32"/>
  <path d="M1450 90 Q 1300 300 1370 520 Q 1410 720 1450 910" fill="#fff8ed" opacity=".26"/>
  <g stroke="#5f4635" fill="none" opacity=".75" stroke-linecap="round">
    <path d="M1190 870 q10 -120 -30 -190" stroke-width="4"/>
    <path d="M1150 760 q-60 -40 -86 -8 q30 44 86 8Z" fill="#6e7a58" stroke="none"/>
    <path d="M1176 720 q44 -52 84 -26 q-22 48 -84 26Z" fill="#7c8a61" stroke="none"/>
    <path d="M1208 800 q54 -24 76 8 q-38 34 -76 -8Z" fill="#647351" stroke="none"/>
  </g>
  <g>
    <ellipse cx="360" cy="862" rx="76" ry="16" fill="#8b6549" opacity=".25"/>
    <rect x="300" y="700" width="54" height="66" rx="8" fill="#f9f2e6" stroke="#b7916d" stroke-width="3"/>
    <rect x="386" y="716" width="46" height="58" rx="8" fill="#f9f2e6" stroke="#b7916d" stroke-width="3"/>
    <path d="M354 700 q-16 -36 6 -58 M354 700 q4 -30 24 -44" stroke="#c9a37b" stroke-width="3" fill="none" opacity=".5"/>
  </g>
  <g fill="#6a4c3a" opacity=".75">
    <circle cx="690" cy="690" r="15"/>
    <path d="M675 708 q15 -16 30 0 l6 52 h-42 Z"/>
    <path d="M683 760 l-8 60 h8 l12 -52 l12 52 h8 l-8 -60 Z"/>
    <circle cx="742" cy="704" r="13"/>
    <path d="M730 720 q12 -14 24 0 l5 44 h-34 Z"/>
    <path d="M735 764 l-6 48 h7 l8 -41 l8 41 h7 l-6 -48 Z"/>
  </g>
  <rect width="1600" height="1000" filter="url(#grain-${id})" opacity=".8"/>
</svg>`;
}

fs.writeFileSync(path.join(photoDir, "cover-1.svg"), coverSunset());
fs.writeFileSync(path.join(photoDir, "cover-2.svg"), coverNight());
fs.writeFileSync(path.join(photoDir, "cover-3.svg"), coverWindow());

/* ---------- 照片墙占位图：5 种手绘感场景 ---------- */
const palettes = [
  ["#fbe3df", "#f3b9b4", "#c78282", "#7b4d55"],
  ["#e9eef9", "#b9c8e8", "#7c90bb", "#465272"],
  ["#f8edda", "#e8cfaa", "#bc946e", "#785740"],
  ["#f6e6e9", "#dfb9c4", "#a97889", "#66424f"],
  ["#e7f0e6", "#bdd2bd", "#7f9b82", "#4c614f"],
  ["#f3e8f0", "#dcc0d6", "#a87e9e", "#62475d"],
  ["#e9e6df", "#cbc2b2", "#938875", "#5c5446"]
];

function sceneSea(w, h, p, n) {
  return `
    <rect width="${w}" height="${h}" fill="url(#sky-v)"/>
    <circle cx="${w * 0.72}" cy="${h * 0.3}" r="${w * 0.13}" fill="url(#glow-v)"/>
    <circle cx="${w * 0.72}" cy="${h * 0.3}" r="${w * 0.055}" fill="#fff6e6" opacity=".9"/>
    <path d="M0 ${h * 0.62} H${w} V${h} H0 Z" fill="${p[2]}" opacity=".38"/>
    <path d="M0 ${h * 0.7} Q ${w * 0.28} ${h * 0.66} ${w * 0.55} ${h * 0.72} T ${w} ${h * 0.69} V${h} H0 Z" fill="${p[3]}" opacity=".5"/>
    <g stroke="#fff" opacity=".28" stroke-linecap="round">
      <path d="M${w * 0.62} ${h * 0.78} h${w * 0.2}" stroke-width="2"/>
      <path d="M${w * 0.68} ${h * 0.83} h${w * 0.12}" stroke-width="1.5"/>
    </g>
    <path d="M0 ${h * 0.93} C ${w * 0.3} ${h * 0.88} ${w * 0.6} ${h * 0.96} ${w} ${h * 0.9} V${h} H0 Z" fill="#3f2b33" opacity=".55"/>`;
}

function sceneWindow(w, h, p) {
  return `
    <rect width="${w}" height="${h}" fill="${p[0]}"/>
    <rect x="${w * 0.16}" y="${h * 0.12}" width="${w * 0.68}" height="${h * 0.72}" rx="${w * 0.35}" fill="url(#sky-v)"/>
    <path d="M${w * 0.16} ${h * 0.58} Q ${w * 0.4} ${h * 0.5} ${w * 0.5} ${h * 0.6} T ${w * 0.84} ${h * 0.56} V${h * 0.84} H${w * 0.16} Z" fill="${p[2]}" opacity=".45"/>
    <path d="M${w * 0.5} ${h * 0.12} V${h * 0.84}" stroke="${p[0]}" stroke-width="6" opacity=".8"/>
    <path d="M${w * 0.16} ${h * 0.46} H${w * 0.84}" stroke="${p[0]}" stroke-width="5" opacity=".7"/>
    <path d="M${w * 0.22} ${h * 0.84} q${w * 0.22} -${h * 0.25} ${w * 0.5} 0" fill="none" stroke="${p[3]}" stroke-width="3" opacity=".4"/>
    <g fill="${p[3]}" opacity=".55">
      <circle cx="${w * 0.66}" cy="${h * 0.75}" r="${w * 0.028}"/>
      <path d="M${w * 0.66 - w * 0.035} ${h * 0.78} q${w * 0.035} -${h * 0.035} ${w * 0.07} 0 l${w * 0.012} ${h * 0.1} h-${w * 0.094} Z"/>
    </g>`;
}

function sceneHill(w, h, p) {
  return `
    <rect width="${w}" height="${h}" fill="url(#sky-v)"/>
    <circle cx="${w * 0.28}" cy="${h * 0.26}" r="${w * 0.09}" fill="#fff4de" opacity=".85"/>
    <g fill="#fff" opacity=".55">
      <circle cx="${w * 0.68}" cy="${h * 0.18}" r="2"/><circle cx="${w * 0.8}" cy="${h * 0.3}" r="1.4"/>
      <circle cx="${w * 0.55}" cy="${h * 0.36}" r="1.6"/><circle cx="${w * 0.86}" cy="${h * 0.12}" r="1.2"/>
    </g>
    <path d="M0 ${h * 0.62} Q ${w * 0.3} ${h * 0.5} ${w * 0.55} ${h * 0.63} T ${w} ${h * 0.58} V${h} H0 Z" fill="${p[2]}" opacity=".55"/>
    <path d="M0 ${h * 0.76} Q ${w * 0.3} ${h * 0.64} ${w * 0.6} ${h * 0.77} T ${w} ${h * 0.72} V${h} H0 Z" fill="${p[3]}" opacity=".65"/>
    <g fill="${p[3]}">
      <circle cx="${w * 0.7}" cy="${h * 0.7}" r="${w * 0.018}"/>
      <path d="M${w * 0.7 - w * 0.024} ${h * 0.72} q${w * 0.024} -${h * 0.024} ${w * 0.048} 0 l${w * 0.008} ${h * 0.07} h-${w * 0.064} Z"/>
    </g>`;
}

function sceneFlowers(w, h, p) {
  let petals = "";
  for (let i = 0; i < 7; i++) {
    const cx = w * (0.25 + (i % 4) * 0.16);
    const cy = h * (0.35 + Math.floor(i / 4) * 0.22);
    petals += `<g transform="translate(${cx} ${cy})" opacity="${0.35 + (i % 3) * 0.14}">
      <circle r="${w * 0.055}" fill="${p[1]}"/><circle r="${w * 0.028}" fill="${p[0]}"/>
      <circle cx="${w * 0.045}" cy="${-h * 0.02}" r="${w * 0.04}" fill="${p[2]}" opacity=".5"/>
    </g>`;
  }
  return `
    <rect width="${w}" height="${h}" fill="url(#sky-v)"/>
    <circle cx="${w * 0.82}" cy="${h * 0.8}" r="${w * 0.26}" fill="${p[1]}" opacity=".35" filter="url(#blur-v)"/>
    ${petals}
    <path d="M${w * 0.1} ${h * 0.9} C ${w * 0.3} ${h * 0.6} ${w * 0.5} ${h * 0.95} ${w * 0.9} ${h * 0.62}" fill="none" stroke="${p[3]}" stroke-width="2" opacity=".3"/>`;
}

function sceneCity(w, h, p) {
  return `
    <rect width="${w}" height="${h}" fill="url(#sky-v)"/>
    <circle cx="${w * 0.5}" cy="${h * 0.3}" r="${w * 0.14}" fill="url(#glow-v)" opacity=".7"/>
    <g fill="${p[3]}" opacity=".35">
      <rect x="${w * 0.1}" y="${h * 0.55}" width="${w * 0.14}" height="${h * 0.3}"/>
      <rect x="${w * 0.27}" y="${h * 0.47}" width="${w * 0.1}" height="${h * 0.38}"/>
      <rect x="${w * 0.4}" y="${h * 0.6}" width="${w * 0.18}" height="${h * 0.25}"/>
      <rect x="${w * 0.61}" y="${h * 0.5}" width="${w * 0.12}" height="${h * 0.35}"/>
      <rect x="${w * 0.76}" y="${h * 0.58}" width="${w * 0.15}" height="${h * 0.27}"/>
    </g>
    <g fill="#ffe9bd" opacity=".6">
      <rect x="${w * 0.13}" y="${h * 0.6}" width="3" height="4"/><rect x="${w * 0.17}" y="${h * 0.65}" width="3" height="4"/>
      <rect x="${w * 0.3}" y="${h * 0.53}" width="3" height="4"/><rect x="${w * 0.33}" y="${h * 0.6}" width="3" height="4"/>
      <rect x="${w * 0.64}" y="${h * 0.56}" width="3" height="4"/><rect x="${w * 0.68}" y="${h * 0.64}" width="3" height="4"/>
      <rect x="${w * 0.8}" y="${h * 0.64}" width="3" height="4"/><rect x="${w * 0.84}" y="${h * 0.7}" width="3" height="4"/>
    </g>
    <path d="M0 ${h * 0.88} H${w} V${h} H0 Z" fill="${p[3]}" opacity=".6"/>
    <path d="M${w * 0.5} ${h} V${h * 0.88}" stroke="#f7ebd5" stroke-width="3" opacity=".4"/>`;
}

const scenes = [sceneSea, sceneWindow, sceneHill, sceneFlowers, sceneCity];

function photoSvg(n) {
  const pal = palettes[(n - 1) % palettes.length];
  const ratios = [
    [900, 1200], [1200, 900], [1000, 1000], [900, 1200], [1200, 800]
  ];
  const [w, h] = ratios[(n - 1) % ratios.length];
  const id = `v${n}`;
  const scene = scenes[(n - 1) % scenes.length](w, h, pal, n);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="sky-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${pal[0]}"/><stop offset="60%" stop-color="${pal[1]}"/><stop offset="100%" stop-color="${pal[2]}"/>
    </linearGradient>
    <radialGradient id="glow-${id}"><stop offset="0%" stop-color="#fff7e8" stop-opacity=".9"/><stop offset="100%" stop-color="#fff7e8" stop-opacity="0"/></radialGradient>
    <filter id="blur-${id}"><feGaussianBlur stdDeviation="20"/></filter>
    <filter id="grain-${id}">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/>
      <feComponentTransfer><feFuncA type="linear" slope=".05"/></feComponentTransfer>
    </filter>
    <!-- 场景里引用的是通用 id，这里用 CSS 变量式替换不方便，故简单重复定义 -->
    <linearGradient id="sky-${id}-scene" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${pal[0]}"/><stop offset="60%" stop-color="${pal[1]}"/><stop offset="100%" stop-color="${pal[2]}"/></linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${pal[0]}"/>
  <g>${scene.replaceAll('url(#sky-v)', `url(#sky-${id})`).replaceAll('url(#glow-v)', `url(#glow-${id})`).replaceAll('url(#blur-v)', `url(#blur-${id})`)}</g>
  <rect width="${w}" height="${h}" filter="url(#grain-${id})" opacity=".7"/>
  <g font-family="Georgia, 'Times New Roman', serif">
    <text x="${w * 0.07}" y="${h * 0.9}" font-size="${Math.max(14, w * 0.018)}" letter-spacing="6" fill="#fff" opacity=".55">OUR MOMENT · ${String(n).padStart(2, "0")}</text>
    <text x="${w * 0.07}" y="${h * 0.94}" font-size="${Math.max(10, w * 0.011)}" letter-spacing="2" fill="#fff" opacity=".38">替换成你们的照片</text>
  </g>
</svg>`;
}

for (let i = 1; i <= 20; i++) {
  fs.writeFileSync(path.join(photoDir, `p${String(i).padStart(2, "0")}.svg`), photoSvg(i));
}

/* ---------- 柔和音乐盒循环（24 秒，WAV，无版权） ---------- */
function makeMusic() {
  const sr = 22050;
  const seconds = 24;
  const total = sr * seconds;
  const data = new Float32Array(total);

  // 简单音符时值：以 0.75 秒为一拍，4/4 拍，8 小节循环
  const beat = 0.75;
  const step = beat / 2; // 八分音符
  const noteFreq = {
    C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.0, A4: 440.0,
    C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0,
    F4: 349.23, B4: 493.88, E3: 164.81, A3: 220.0, F3: 174.61, G3: 196.0, C3: 130.81
  };
  // 8 小节，每小节 8 个八分音符；和弦进行 C - Am - F - G - C - Am - Dm - G
  const melody = [
    ["E5", null, "G5", null, "A5", "G5", "E5", null],
    ["C5", null, "E5", null, "G5", null, "E5", null],
    ["A4", null, "C5", null, "F4", "A4", "C5", null],
    ["D5", null, "B4", null, "G4", null, "D5", null],
    ["E5", "G5", "C5", null, "E5", "D5", "C5", null],
    ["A5", null, "G5", null, "E5", null, "C5", null],
    ["F4", "A4", "C5", null, "D5", null, "A4", null],
    ["G4", "B4", "D5", null, "G5", null, "D5", null]
  ];
  const bass = ["C3", "A3", "F3", "G3", "C3", "A3", "F3", "G3"];

  const addTone = (freq, start, dur, vol) => {
    const s0 = Math.floor(start * sr);
    const n = Math.floor(dur * sr);
    for (let i = 0; i < n && s0 + i < total; i++) {
      const t = i / sr;
      const env = Math.min(1, t / 0.012) * Math.exp(-t * 2.6);
      const vibrato = 1 + 0.0018 * Math.sin(2 * Math.PI * 5 * t);
      const w = Math.sin(2 * Math.PI * freq * vibrato * t) * 0.7
        + Math.sin(2 * Math.PI * freq * 2 * t) * 0.18
        + Math.sin(2 * Math.PI * freq * 3 * t) * 0.06;
      data[s0 + i] += w * env * vol;
    }
  };

  for (let bar = 0; bar < 8; bar++) {
    const barStart = bar * 4 * beat;
    // 低音：每小节第一拍
    addTone(noteFreq[bass[bar]], barStart, 2.2, 0.055);
    addTone(noteFreq[bass[bar]], barStart + 2 * beat, 1.8, 0.035);
    // 旋律：八分音符
    melody[bar].forEach((name, idx) => {
      if (!name) return;
      addTone(noteFreq[name], barStart + idx * step, 1.35, 0.062);
    });
    // 一小簇和声，像音乐盒的泛音
    const octave = { C3: 523.25, A3: 440, F3: 349.23, G3: 392 };
    addTone(octave[bass[bar]], barStart + beat, 2.0, 0.018);
  }

  // 很轻的“房间感”混响（简易延迟叠加）
  const delay = Math.floor(sr * 0.19);
  for (let i = delay; i < total; i++) {
    data[i] += data[i - delay] * 0.16;
  }
  // 整体淡入淡出 0.4 秒，避免爆音
  const fade = Math.floor(sr * 0.4);
  for (let i = 0; i < fade; i++) {
    data[i] *= i / fade;
    data[total - 1 - i] *= i / fade;
  }

  const buffer = Buffer.alloc(44 + total * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + total * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sr, 24);
  buffer.writeUInt32LE(sr * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(total * 2, 40);
  for (let i = 0; i < total; i++) {
    const v = Math.max(-1, Math.min(1, data[i]));
    buffer.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path.join(musicDir, "bgm.wav"), buffer);
}

makeMusic();
console.log("素材生成完成：封面 3 张、照片 20 张、背景音乐 bgm.wav");
