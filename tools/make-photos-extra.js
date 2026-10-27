/**
 * 生成照片墙第 21~100 张占位图（p21.svg ~ p100.svg）。
 * 用法：node tools/make-photos-extra.js
 * 说明：10 种小场景 × 8 套柔色，和 make-assets.js 生成的 20 张风格一致。
 *       全部是占位图，被你们的真实照片替换后可以删掉这些文件。
 */
const fs = require("fs");
const path = require("path");

const photoDir = path.join(path.resolve(__dirname, ".."), "assets", "photos");
fs.mkdirSync(photoDir, { recursive: true });

/* ---------- 8 套柔色：[天空上, 天空下, 地面亮, 地面暗, 点缀] ---------- */
const PALETTES = [
  ["#fdeef0", "#f6c9cf", "#e3a4ae", "#8d5f6d", "#fff3df"], // 樱粉
  ["#e8f1fb", "#bcd7f2", "#8fb3dd", "#4a5f8a", "#fff8e6"], // 晴蓝
  ["#f1ecfa", "#cdbfe8", "#a98fd0", "#5d4a80", "#fff2df"], // 薰衣草
  ["#e9f6ef", "#bfe3cd", "#93c8a8", "#4c7261", "#fff6e3"], // 抹茶
  ["#fdf3e3", "#f4d9ae", "#e2b87e", "#8a6440", "#fffdf5"], // 奶油金
  ["#f3e9f5", "#d9b9d8", "#b58cb5", "#6d4a6e", "#fff1e0"], // 藕紫
  ["#e6f3f5", "#b3dde4", "#83bcc7", "#41626e", "#fff7e8"], // 海盐
  ["#f7ece2", "#e5c3ab", "#c99a7e", "#6e4c3c", "#fff4e2"]  // 奶咖
];

/* ---------- 每张图共用的头部：渐变天空 + 柔光 + 颗粒 ---------- */
function frame(id, p) {
  return {
    open: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="s${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p[0]}"/><stop offset="100%" stop-color="${p[1]}"/>
    </linearGradient>
    <linearGradient id="g${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p[2]}"/><stop offset="100%" stop-color="${p[3]}"/>
    </linearGradient>
    <radialGradient id="o${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${p[4]}" stop-opacity=".9"/>
      <stop offset="100%" stop-color="${p[4]}" stop-opacity="0"/>
    </radialGradient>
    <filter id="n${id}"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".05"/></feComponentTransfer></filter>
    <filter id="b${id}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <rect width="800" height="600" fill="url(#s${id})"/>`,
    close: `  <rect width="800" height="600" filter="url(#n${id})"/>
</svg>`
  };
}

const INK = "rgba(60,34,42,.55)";

/* ---------- 10 种小场景（p[4] 是点缀色，INK 是剪影色） ---------- */
const SCENES = [
  // 0 月亮与海
  (id, p) => `<circle cx="560" cy="170" r="110" fill="url(#o${id})"/><circle cx="560" cy="170" r="58" fill="${p[4]}" opacity=".92"/>
  <path d="M0 430 C 180 400 320 430 480 425 C 620 420 720 435 800 428 V600 H0 Z" fill="url(#g${id})"/>
  <g stroke="${p[4]}" stroke-width="4" stroke-linecap="round" opacity=".55">
    <path d="M140 470h90M300 500h120M520 480h100M220 540h130"/></g>`,
  // 1 山丘与落日
  (id, p) => `<circle cx="400" cy="240" r="130" fill="url(#o${id})"/><circle cx="400" cy="240" r="64" fill="${p[4]}" opacity=".9"/>
  <path d="M0 440 C 160 350 300 420 440 430 C 590 440 690 370 800 410 V600 H0 Z" fill="${p[2]}" opacity=".85"/>
  <path d="M0 500 C 200 440 420 510 620 480 C 700 468 760 478 800 486 V600 H0 Z" fill="${p[3]}"/>
  <g fill="${p[3]}"><circle cx="120" cy="430" r="26"/><circle cx="700" cy="415" r="30"/></g>`,
  // 2 窗与雨
  (id, p) => `<rect x="220" y="120" width="360" height="320" rx="16" fill="${p[4]}" opacity=".28"/>
  <rect x="220" y="120" width="360" height="320" rx="16" fill="none" stroke="${p[3]}" stroke-width="10"/>
  <path d="M400 120v320M220 280h360" stroke="${p[3]}" stroke-width="8"/>
  <g stroke="${p[4]}" stroke-width="5" stroke-linecap="round" opacity=".8">
    <path d="M120 90l-14 44M190 130l-14 44M640 100l-14 44M700 160l-14 44M90 300l-14 44M690 330l-14 44"/></g>
  <path d="M120 500c60-40 120 20 180-10s120 30 180 0 120 20 200-6" stroke="${p[3]}" stroke-width="8" fill="none" stroke-linecap="round"/>`,
  // 3 两杯奶茶
  (id, p) => `<ellipse cx="400" cy="500" rx="230" ry="26" fill="${p[3]}" opacity=".35"/>
  <g><path d="M280 250h120l-12 220a24 24 0 0 1-24 22h-48a24 24 0 0 1-24-22Z" fill="${p[4]}" opacity=".85"/>
  <path d="M284 330h112l-8 140a24 24 0 0 1-24 22h-48a24 24 0 0 1-24-22Z" fill="#8a5a3b" opacity=".55"/>
  <path d="M356 210l30-44" stroke="${INK}" stroke-width="8" stroke-linecap="round"/></g>
  <g><path d="M420 270h110l-11 200a22 22 0 0 1-22 20h-44a22 22 0 0 1-22-20Z" fill="${p[2]}" opacity=".8"/>
  <path d="M486 236l26-38" stroke="${INK}" stroke-width="8" stroke-linecap="round"/></g>
  <g fill="${p[3]}"><circle cx="316" cy="470" r="7"/><circle cx="342" cy="452" r="6"/><circle cx="330" cy="484" r="5"/>
  <circle cx="466" cy="470" r="6"/><circle cx="488" cy="450" r="5"/></g>`,
  // 4 便利店之夜
  (id, p) => `<rect x="180" y="150" width="440" height="330" rx="10" fill="${p[4]}" opacity=".24"/>
  <rect x="180" y="150" width="440" height="330" rx="10" fill="none" stroke="${p[3]}" stroke-width="9"/>
  <rect x="210" y="190" width="170" height="130" rx="6" fill="${p[2]}" opacity=".5"/>
  <rect x="420" y="190" width="170" height="130" rx="6" fill="${p[1]}" opacity=".7"/>
  <g fill="${p[4]}"><rect x="228" y="212" width="34" height="26" rx="4"/><rect x="276" y="212" width="34" height="26" rx="4"/>
  <rect x="228" y="258" width="34" height="26" rx="4"/><rect x="276" y="258" width="34" height="26" rx="4"/>
  <rect x="440" y="212" width="34" height="26" rx="4"/><rect x="488" y="212" width="34" height="26" rx="4"/></g>
  <rect x="330" y="380" width="140" height="100" rx="8" fill="${p[3]}" opacity=".6"/>
  <circle cx="400" cy="430" r="20" fill="${p[4]}" opacity=".9"/>`,
  // 5 伞下的两个人
  (id, p) => `<path d="M400 200c-110 0-170 84-174 132h348C570 284 510 200 400 200Z" fill="${p[2]}"/>
  <path d="M400 196v-30" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
  <g fill="${p[3]}"><circle cx="368" cy="392" r="26"/><circle cx="432" cy="392" r="26"/>
  <path d="M334 470c0-30 16-52 34-52s34 22 34 52Z"/><path d="M398 470c0-30 16-52 34-52s34 22 34 52Z"/></g>
  <g stroke="${p[4]}" stroke-width="5" stroke-linecap="round" opacity=".75">
    <path d="M130 120l-12 38M210 90l-12 38M600 110l-12 38M680 150l-12 38M100 280l-12 38M710 300l-12 38"/></g>
  <ellipse cx="400" cy="508" rx="220" ry="20" fill="${p[3]}" opacity=".3"/>`,
  // 6 山间的星
  (id, p) => `<g fill="${p[4]}"><circle cx="150" cy="110" r="4"/><circle cx="260" cy="70" r="3"/><circle cx="380" cy="130" r="4"/>
  <circle cx="520" cy="80" r="3"/><circle cx="650" cy="120" r="4"/><circle cx="720" cy="200" r="3"/><circle cx="90" cy="210" r="3"/></g>
  <circle cx="620" cy="150" r="40" fill="${p[4]}" opacity=".9"/>
  <path d="M0 430 L170 300 L300 400 L430 280 L580 420 L700 340 L800 410 V600 H0 Z" fill="${p[2]}" opacity=".9"/>
  <path d="M0 500 L140 420 L320 500 L520 430 L680 510 L800 460 V600 H0 Z" fill="${p[3]}"/>`,
  // 7 楼下的猫
  (id, p) => `<ellipse cx="400" cy="480" rx="240" ry="24" fill="${p[3]}" opacity=".3"/>
  <g fill="${p[3]}">
    <path d="M300 470c-6-60 24-100 74-100s80 40 74 100c-2 22-18 34-38 34h-72c-20 0-36-12-38-34Z"/>
    <path d="M330 380l-16-40 36 16ZM446 380l16-40-36 16Z"/>
    <circle cx="356" cy="416" r="7" fill="${p[4]}"/><circle cx="416" cy="416" r="7" fill="${p[4]}"/>
    <path d="M378 438c8 8 16 8 22 0" stroke="${p[4]}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M452 440c26-8 44-4 56 10" stroke="${p[3]}" stroke-width="12" fill="none" stroke-linecap="round"/></g>
  <circle cx="400" cy="180" r="90" fill="url(#o${id})"/><circle cx="400" cy="180" r="46" fill="${p[4]}" opacity=".85"/>`,
  // 8 长椅与树
  (id, p) => `<circle cx="220" cy="200" r="110" fill="url(#o${id})"/>
  <g fill="${p[2]}" opacity=".9"><circle cx="220" cy="180" r="70"/><circle cx="160" cy="220" r="52"/><circle cx="282" cy="222" r="50"/></g>
  <path d="M220 250v150" stroke="${p[3]}" stroke-width="14" stroke-linecap="round"/>
  <g fill="${p[3]}"><rect x="420" y="360" width="220" height="18" rx="9"/>
  <rect x="436" y="380" width="12" height="90" rx="6"/><rect x="612" y="380" width="12" height="90" rx="6"/>
  <rect x="420" y="322" width="220" height="14" rx="7" opacity=".8"/></g>
  <path d="M0 520c120-30 260 16 400 0s280-26 400-4V600H0Z" fill="${p[3]}" opacity=".85"/>`,
  // 9 蛋糕与蜡烛
  (id, p) => `<ellipse cx="400" cy="500" rx="220" ry="24" fill="${p[3]}" opacity=".35"/>
  <g><rect x="280" y="330" width="240" height="120" rx="18" fill="${p[2]}"/>
  <rect x="308" y="270" width="184" height="90" rx="16" fill="${p[1]}" opacity=".9"/>
  <path d="M280 372c30 22 60-16 90 6s60-16 90 6 50-14 60-4v44a18 18 0 0 1-18 18H298a18 18 0 0 1-18-18Z" fill="${p[4]}" opacity=".65"/>
  <g stroke="${p[3]}" stroke-width="7" stroke-linecap="round"><path d="M340 262v-46M400 254v-58M460 262v-46"/></g>
  <g fill="${p[4]}"><ellipse cx="340" cy="206" rx="9" ry="16"/><ellipse cx="400" cy="188" rx="9" ry="16"/><ellipse cx="460" cy="206" rx="9" ry="16"/></g></g>
  <g fill="${p[4]}" opacity=".8"><circle cx="200" cy="180" r="4"/><circle cx="620" cy="150" r="4"/><circle cx="580" cy="240" r="3"/></g>`
];

/* ---------- 生成 80 张：场景循环 × 配色轮换 ---------- */
const made = [];
for (let i = 21; i <= 100; i++) {
  const sceneIdx = (i - 21) % SCENES.length;
  const palIdx = Math.floor((i - 21) / SCENES.length) % PALETTES.length;
  const id = String(i);
  const p = PALETTES[palIdx];
  const f = frame(id, p);
  const svg = `${f.open}
  ${SCENES[sceneIdx](id, p)}
${f.close}`;
  const file = path.join(photoDir, `p${i}.svg`);
  fs.writeFileSync(file, svg, "utf-8");
  made.push(`p${i}.svg`);
}

console.log(`✓ 已生成 ${made.length} 张占位图（p21 ~ p100）`);
console.log(`  目录：assets/photos/`);
console.log(`  场景：月与海 / 山丘落日 / 窗与雨 / 两杯奶茶 / 便利店 / 伞下 / 星空山野 / 猫 / 长椅 / 蛋糕`);
console.log(`  大小：${(made.reduce((s, n) => s + fs.statSync(path.join(photoDir, n)).size, 0) / 1024).toFixed(0)} KB 总计`);
