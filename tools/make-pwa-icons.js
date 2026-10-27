/**
 * 生成 PWA 应用图标（纯 Node，无任何依赖）。
 * 用法：node tools/make-pwa-icons.js
 * 输出：assets/icons/ 下的 4 张 PNG（192 / 512 / 遮罩安全版 512 / 苹果 180）
 *
 * 原理：不用图片库——
 *   1. 按爱心数学曲线逐像素算颜色（(x²+y²-1)³ - x²y³ ≤ 0 就是标准爱心）；
 *   2. 用 Node 自带的 zlib 压缩 + 手写 PNG 格式头，直接写出合法 PNG。
 * 想换成你们的合照当图标：用任意工具做一个 512x512 的 png，
 * 覆盖 assets/icons/ 里的同名文件即可（manifest 会自动用上）。
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const OUT_DIR = path.join(path.resolve(__dirname, ".."), "assets", "icons");
fs.mkdirSync(OUT_DIR, { recursive: true });

/* ---------- PNG 编码：签名 + IHDR + IDAT + IEND，带 CRC32 ---------- */
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i++) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;    // 位深
  ihdr[9] = 6;    // 颜色类型：RGBA
  // 每行行首加一个过滤字节 0（None）
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy
      ? rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
      : null;
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}

/* ---------- 画一颗心：数学曲线 + 渐变 + 柔光 ---------- */
const clamp255 = (value) => Math.max(0, Math.min(255, Math.round(value)));

function renderHeartIcon(size, { scale = 0.76 } = {}) {
  const buffer = Buffer.alloc(size * size * 4);
  // 心形曲线 y 范围约 ±1.25，scale 是“心占图标边长的比例”
  const view = 1.25 / scale;
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const x = ((px + 0.5) / size - 0.5) * 2 * view;
      const y = (0.5 - (py + 0.5) / size) * 2 * view + 0.08; // 心形几何中心比圆心略低，往回挪一点

      // 爱心隐式方程的值：<0 在心内，越接近 0 越靠边缘
      const heart = Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y;
      // 按当地梯度换算成真实像素距离，无论尖角还是圆弧都是干净的 1px 抗锯齿
      const a = x * x + y * y - 1;
      const dfdx = 6 * x * a * a - 2 * x * y * y * y;
      const dfdy = 6 * y * a * a - 3 * x * x * y * y;
      const gradient = Math.max(1e-6, Math.hypot(dfdx, dfdy));
      const pixel = (2 * view) / size;
      const edge = Math.max(0, Math.min(1, heart / (gradient * pixel)));

      // 背景：从左上淡粉到右下稍深的粉
      const gx = (px + 0.5) / size, gy = (py + 0.5) / size;
      let br = 255 - 22 * gx - 6 * gy;
      let bg = 233 - 34 * gx - 14 * gy;
      let bb = 240 - 30 * gx - 16 * gy;
      // 心外的一点柔光晕：越靠近心越亮
      const glow = Math.max(0, 1 - (Math.abs(heart) / gradient) / (0.22 * view));
      br += glow * 14; bg += glow * 5; bb += glow * 6;

      // 心体：从上到下由亮玫红渐变到深玫红
      const shade = Math.max(0, Math.min(1, (y + 1.0) / 2.2));
      const hr = 236 - 46 * shade;
      const hgc = 98 - 32 * shade;
      const hb = 126 - 36 * shade;

      const i = (py * size + px) * 4;
      buffer[i]     = clamp255(edge * br + (1 - edge) * hr);
      buffer[i + 1] = clamp255(edge * bg + (1 - edge) * hgc);
      buffer[i + 2] = clamp255(edge * bb + (1 - edge) * hb);
      buffer[i + 3] = 255;
    }
  }

  // 高光：在左上叶上叠一小块半透明白，让心看起来有光泽
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const x = ((px + 0.5) / size - 0.5) * 2 * view;
      const y = (0.5 - (py + 0.5) / size) * 2 * view + 0.08;
      const dx = (x + 0.42) / 0.5, dy = (y - 0.55) / 0.62;
      const d = dx * dx + dy * dy;
      if (d < 1) {
        const heart = Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y;
        if (heart < 0) {
          const i = (py * size + px) * 4;
          const strength = (1 - d) * 0.32;
          buffer[i]     = clamp255(buffer[i] * (1 - strength) + 255 * strength);
          buffer[i + 1] = clamp255(buffer[i + 1] * (1 - strength) + 255 * strength);
          buffer[i + 2] = clamp255(buffer[i + 2] * (1 - strength) + 255 * strength);
        }
      }
    }
  }
  return encodePNG(size, size, buffer);
}

/* ---------- 输出四种尺寸 ---------- */
const targets = [
  { file: "icon-192.png", size: 192, scale: 0.76 },
  { file: "icon-512.png", size: 512, scale: 0.76 },
  // maskable 版：内容缩小到安全区，安卓圆形裁切不切到心
  { file: "icon-maskable-512.png", size: 512, scale: 0.6 },
  // 苹果桌面图标
  { file: "apple-touch-icon.png", size: 180, scale: 0.78 }
];

let total = 0;
for (const target of targets) {
  const png = renderHeartIcon(target.size, { padding: target.padding });
  fs.writeFileSync(path.join(OUT_DIR, target.file), png);
  total += png.length;
  console.log(`  ✓ ${target.file}（${target.size}×${target.size}，${(png.length / 1024).toFixed(1)} KB）`);
}
console.log(`✓ PWA 图标已生成，共 ${(total / 1024).toFixed(0)} KB → assets/icons/`);
