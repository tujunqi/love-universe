/**
 * 把恋爱主页（index.html）打包成“发到手机就能打开”的单文件版。
 * --------------------------------------------------------------------------
 * 为什么需要它：
 *   主页平时由 3 个文件组成（index.html + css + js），还引用 assets/ 里的照片和音乐。
 *   如果只把 index.html 一个文件发到手机，样式、脚本、照片全都跟不过去，
 *   手机上打开就是一块“没穿衣服”的页面 —— 这就是“手机打不开”的最常见原因。
 *
 * 这个脚本会把 CSS、JS、照片、背景音乐全部内嵌进一个 HTML 文件里，
 * 之后无论把这个文件发微信、发 QQ、拷 U 盘还是塞网盘，打开都是完整的。
 *
 * 用法（在项目根目录）：
 *   node tools/build-phone-single.js
 *
 * 输出：
 *   手机版/恋爱主页-发手机打开这份.html   ← 发这一个文件就够
 *   手机版/怎么发到手机-必读.txt          ← 发送和打开的说明
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "手机版");
const OUT = path.join(OUT_DIR, "恋爱主页-发手机打开这份.html");

// 单文件版里不会附带 assets/video 文件夹，所以视频相关的提示要换成这个说法
const VIDEO_FALLBACK_NEW =
  "单文件版没有打包视频。想看隐藏视频，请使用电脑上的文件夹版，或重新打包。";

const MIME = {
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".ogg": "audio/ogg"
};

const stats = { embedded: 0, bytes: 0, missing: [], skippedVideos: [] };

function fail(message) {
  console.error("✗ " + message);
  process.exit(1);
}

// 把一个素材文件读出来，转成 data URI（base64 内嵌）
function embedFile(relPath) {
  const full = path.join(ROOT, relPath);
  const ext = path.extname(full).toLowerCase();
  const mime = MIME[ext] || "application/octet-stream";
  const data = fs.readFileSync(full);
  stats.embedded += 1;
  stats.bytes += data.length;
  return `data:${mime};base64,${data.toString("base64")}`;
}

// 把代码里所有 "assets/..." / 'assets/...' 路径替换成 data URI
function rewriteAssets(source, label) {
  return source.replace(/"assets\/([^"]+)"|'assets\/([^']+)'/g, (match, dq, sq) => {
    const rel = dq || sq;
    const ext = path.extname(rel).toLowerCase();

    // 视频默认不内嵌：一个视频动辄几百 MB，会把单文件版撑爆。
    // 页面里已经有“没找到视频”的温柔提示，保留原路径让它自然触发即可。
    if ([".mp4", ".webm", ".mov", ".m4v"].includes(ext)) {
      stats.skippedVideos.push(`assets/${rel}`);
      return match;
    }

    const full = path.join(ROOT, "assets", rel);
    if (!fs.existsSync(full)) {
      stats.missing.push(`${label}: assets/${rel}`);
      return match; // 缺文件就保留原路径，页面的 error 兜底会接住
    }
    return JSON.stringify(embedFile(`assets/${rel}`));
  });
}

function main() {
  const htmlPath = path.join(ROOT, "index.html");
  const cssPath = path.join(ROOT, "css", "style.css");
  const jsPath = path.join(ROOT, "js", "main.js");

  for (const file of [htmlPath, cssPath, jsPath]) {
    if (!fs.existsSync(file)) fail(`缺少文件：${file}`);
  }

  let html = fs.readFileSync(htmlPath, "utf-8");
  let css = fs.readFileSync(cssPath, "utf-8");
  let js = fs.readFileSync(jsPath, "utf-8");

  // 内联脚本前先转义 "</script"，防止 JS 里的字符串提前闭合标签
  js = js.replace(/<\/script/gi, "<\\/script");

  if (!html.includes('href="css/style.css"')) fail("HTML 里找不到 css/style.css 的引用，构建脚本需要更新。");
  if (!html.includes('src="js/main.js"')) fail("HTML 里找不到 js/main.js 的引用，构建脚本需要更新。");

  // 1. 用函数返回替换结果，避免 JS/CSS 里的 $ 符号被 replace 当成特殊转义
  html = html.replace(
    '<link rel="stylesheet" href="css/style.css">',
    () => `<style>\n${css}\n  </style>`
  );
  html = html.replace(
    '<script src="js/main.js"></script>',
    () => `<script>\n${js}\n  </script>`
  );

  // 2. 内联完成后统一替换素材路径（CSS 里没有文件引用，只需处理内联后的整份 HTML+JS）
  html = rewriteAssets(html, "inline");

  // 2.5 单文件版没有独立的 manifest 文件，删掉这条死链接（图标链接已被内嵌成 data URI，可保留）
  html = html.replace(/\s*<link rel="manifest" href="manifest\.webmanifest">/, "");

  // 3. 单文件版专属的文案调整：视频提示换成单文件版说得通的说法
  html = html
    .replace("没找到视频。把你们的视频命名为 <code>secret.mp4</code>，\n            放进 <code>assets/video/</code> 文件夹，再刷新页面就好。", VIDEO_FALLBACK_NEW)
    .replace(/没找到视频。把你们的视频命名为 <code>secret\.mp4<\/code>[\s\S]*?再刷新页面就好。/, VIDEO_FALLBACK_NEW)
    .replace("没找到背景音乐。把你们的歌命名为 bgm.mp3，放进 assets/music/ 再刷新。", "背景音乐应该是打包好的，出现了这个提示说明音乐文件损坏，请重新生成单文件版。");

  // 4. 顶部加生成标记，方便以后认出这份文件是哪个版本
  const marker = `<!--
  手机单文件版 · 由 tools/build-phone-single.js 自动生成
  生成时间：${new Date().toISOString()}
  样式、脚本、照片、音乐已全部内嵌，本文件可以单独发送和打开。
  修改内容请改 js/main.js 里的 CONFIG，然后重新运行构建命令。
-->`;
  html = html.replace("<!DOCTYPE html>", `<!DOCTYPE html>\n${marker}`);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT, html, "utf-8");

  const outputBytes = fs.statSync(OUT).size;
  console.log("✓ 手机单文件版已生成");
  console.log(`  输出：${path.relative(ROOT, OUT)}`);
  console.log(`  大小：${(outputBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  内嵌素材：${stats.embedded} 个，原始 ${(stats.bytes / 1024).toFixed(0)} KB`);
  console.log(`  发送方式：微信/QQ 直接发这个文件，或拷进 U 盘、传到手机`);
  console.log(`  改完 CONFIG 后重新生成：node tools/build-phone-single.js`);

  if (stats.skippedVideos.length) {
    console.log("\n⚠ 以下视频没有内嵌（单文件版放不下视频，属正常现象）：");
    [...new Set(stats.skippedVideos)].forEach((item) => console.log("  - " + item));
  }

  if (stats.missing.length) {
    console.log("\n⚠ 以下素材缺失，已保留原路径：");
    stats.missing.forEach((item) => console.log("  - " + item));
    process.exitCode = 2;
  }

  // 5. 附一份“怎么发到手机”的说明，发文件时顺手一起发
  const note = `怎么把这个文件发到手机？【必读】
========================================

你手里的「恋爱主页-发手机打开这份.html」是一个自带全部内容
（照片、样式、脚本、音乐）的单文件网页，谁拿到都能打开。
但它仍然是 HTML 网页，不是 App，打开方式有讲究：

【安卓手机 · 最简单】
  1. 微信/QQ 里点开这个文件 → 右上角「…」→ 用其他应用打开
  2. 选「浏览器」（Chrome、Edge、系统浏览器都可以）
  3. 看到粉色封面就成功了，往上滑就是全部内容

  如果微信里点开是乱码或空白：
  → 先「保存到手机」，再到「文件管理」里找到它，
    长按 → 用浏览器打开。

【iPhone · 请注意】
  iPhone 自带的「文件」App 点开会只显示静态画面、没有动画和照片
  （这是苹果预览器的限制，不是文件坏了）。
  推荐任选一种：
  A. 装一个免费 App「Documents」，把文件传进去点开，效果完整；
  B. 用下面的「同一 Wi-Fi 预览」或「公网链接」，Safari 直接看，
     体验和电脑上一模一样（更推荐，见下）。

【两种更稳的打开方式（安卓 iPhone 都完美）】
  1. 同一 Wi-Fi 预览（在家就能看，不用装任何东西）：
     电脑上双击项目根目录的「手机预览-Windows.bat」，
     然后手机浏览器输入窗口里显示的网址。
  2. 公网链接（对方在外地也能看）：
     按 docs/02-公网部署教程.md 部署一次，得到一个网址。

【为什么微信里不能直接聊天气泡预览？】
  微信本身不允许在聊天窗口里直接打开 HTML 文件，
  这不是文件的问题，换个浏览器打开就好。

【拖拽换照片后，这份文件会变吗？】
  不会。拖进去的照片只保存在当前手机/电脑的浏览器里，
  不会写回这个 HTML 文件，也不会自动同步到另一台设备。
  想让所有人都永久看到：把照片放进 assets/photos/，
  修改 js/main.js 里的 CONFIG，再重新生成这份单文件。

【改了内容怎么更新这份文件？】
  1. 在电脑上改 js/main.js 里的 CONFIG（名字、日期、照片、情话…）；
  2. 在项目根目录运行：node tools/build-phone-single.js
  3. 把「手机版」文件夹里新生成的文件重新发一遍即可。

生成时间：${new Date().toLocaleString("zh-CN")}
文件大小：${(outputBytes / 1024 / 1024).toFixed(2)} MB
`;
  fs.writeFileSync(path.join(OUT_DIR, "怎么发到手机-必读.txt"), note, "utf-8");
  console.log(`  说明：手机版/怎么发到手机-必读.txt`);
}

main();
