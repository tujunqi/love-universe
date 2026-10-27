/**
 * 把离线博物馆打包成一个独立 HTML。
 * 用法：
 *   node tools/build-single-file.js
 *   node tools/build-single-file.js --embed-video
 *
 * 默认内嵌：照片、封面、背景音乐、语音、馆藏文档。
 * 视频默认不内嵌（避免生成几百 MB 的文件）；加 --embed-video 才会内嵌。
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OFFLINE = path.join(ROOT, "offline");
const OUT_DIR = path.join(OFFLINE, "单文件版");
const OUT = path.join(OUT_DIR, "恋爱纪念博物馆-单文件版.html");
const EMBED_VIDEO = process.argv.includes("--embed-video");

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
  ".m4v": "video/x-m4v",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".ogg": "audio/ogg",
  ".pdf": "application/pdf",
  ".txt": "text/plain;charset=utf-8",
  ".md": "text/markdown;charset=utf-8",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
};

const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v"]);
const stats = { embedded: 0, bytes: 0, missing: [], skippedVideos: [] };

function fail(message) {
  console.error("✗ " + message);
  process.exit(1);
}

function embedFile(relPath) {
  const full = path.join(OFFLINE, relPath);
  const ext = path.extname(full).toLowerCase();
  const mime = MIME[ext] || "application/octet-stream";
  const data = fs.readFileSync(full);
  stats.embedded += 1;
  stats.bytes += data.length;
  return `data:${mime};base64,${data.toString("base64")}`;
}

function rewriteMedia(source, label) {
  return source.replace(/"media\/([^"]+)"|'media\/([^']+)'/g, (match, doubleQuoted, singleQuoted) => {
    const rel = doubleQuoted || singleQuoted;
    const full = path.join(OFFLINE, "media", rel);
    const ext = path.extname(full).toLowerCase();

    if (!fs.existsSync(full)) {
      // 没开启视频内嵌时，注释里的视频示例不用报警
      if (EMBED_VIDEO || !VIDEO_EXT.has(ext)) {
        stats.missing.push(`${label}: media/${rel}`);
      }
      return match;
    }
    if (VIDEO_EXT.has(ext) && !EMBED_VIDEO) {
      stats.skippedVideos.push(`media/${rel}`);
      return match;
    }
    return JSON.stringify(embedFile(`media/${rel}`));
  });
}

function main() {
  const htmlPath = path.join(OFFLINE, "离线博物馆.html");
  const cssPath = path.join(OFFLINE, "museum.css");
  const jsPath = path.join(OFFLINE, "museum.js");

  for (const file of [htmlPath, cssPath, jsPath]) {
    if (!fs.existsSync(file)) fail(`缺少文件：${file}`);
  }

  let html = fs.readFileSync(htmlPath, "utf-8");
  let css = fs.readFileSync(cssPath, "utf-8");
  let js = fs.readFileSync(jsPath, "utf-8");

  // 防止素材路径里出现闭合标签，破坏内联脚本
  js = js.replace(/<\/script/gi, "<\\/script");

  const originalHtmlBytes = fs.statSync(htmlPath).size;
  const originalCssBytes = fs.statSync(cssPath).size;
  const originalJsBytes = fs.statSync(jsPath).size;

  if (!html.includes('href="museum.css"')) fail("HTML 里找不到 museum.css 的引用，构建脚本需要更新。");
  if (!html.includes('src="museum.js"')) fail("HTML 里找不到 museum.js 的引用，构建脚本需要更新。");

  // 1. 内联样式和脚本
  // replacement 用函数返回，避免脚本里的 $$ 被 String.replace 当成转义吃掉一个 $
  html = html.replace(
    '<link rel="stylesheet" href="museum.css">',
    () => `<style>\n${css}\n  </style>`
  );
  html = html.replace(
    '<script src="museum.js"></script>',
    () => `<script>\n${js}\n  </script>`
  );

  // 2. 把 JS 配置里的素材路径换成 data URI
  html = rewriteMedia(html, "html");
  // 注意：此时 stylesheet 已内联，JS 里还保留原始路径，下面单独替换
  const inlineScriptStart = html.indexOf("<script>\n/* ==========================================================================");
  if (inlineScriptStart === -1) fail("找不到内联后的博物馆脚本。");
  const beforeScript = html.slice(0, inlineScriptStart);
  const scriptPart = html.slice(inlineScriptStart);
  html = beforeScript + rewriteMedia(scriptPart, "js");

  // 3. 单文件版的文案微调
  html = html
    .replace(
      "整个博物馆都在这个文件夹里，不需要网络，不需要登录，也不会把任何内容上传。",
      "整个博物馆都在这一个文件里，不需要网络，不需要登录，也不会把任何内容上传。"
    )
    .replace(
      "如果网页打不开，所有原始照片和视频仍在 <code>media/</code> 里。",
      "照片、语音和文字都已经内嵌进来；需要保留视频时，请使用文件夹版。"
    )
    .replace(
      "把 MP4 放进 <code>media/videos/</code>，再在 <code>museum.js</code> 的 <code>videos</code> 里写一行，就能在这里播放。",
      "单文件版默认不内嵌视频。想要视频，请使用文件夹版，或用 <code>--embed-video</code> 重新生成。"
    )
    .replace(
      "把微信语音导出成 MP3，放进 <code>media/voice/</code>，在 <code>museum.js</code> 里登记，就能在这里一条条听。",
      "把微信语音导出成 MP3 后，在文件夹版里登记；重新生成单文件版时会把它们一起内嵌。"
    )
    .replace(
      /<a class="ghost-btn" href="[^"]*单文件版[^"]*">打开单文件版<\/a>/,
      '<span class="ghost-btn" aria-disabled="true" style="opacity:.55;cursor:default">当前已是单文件版</span>'
    )
    .replace(
      "LOCAL ARCHIVE · NO NETWORK REQUIRED",
      "LOCAL ARCHIVE · SINGLE FILE EDITION"
    )
    .replace(
      "<title>我们的私人博物馆 · 离线纪念宇宙</title>",
      "<title>我们的私人博物馆 · 单文件版</title>"
    );

  const marker = `<!--
  单文件版 · 由 tools/build-single-file.js 自动生成
  生成时间：${new Date().toISOString()}
  所有照片、语音、文档已内嵌为 data URI。修改内容请编辑源文件后重新构建。
-->`;
  html = html.replace("<!DOCTYPE html>", `<!DOCTYPE html>\n${marker}`);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT, html, "utf-8");

  const outputBytes = fs.statSync(OUT).size;
  const ratio = (outputBytes / (originalHtmlBytes + originalCssBytes + originalJsBytes + stats.bytes)) * 100;

  console.log("✓ 单文件版已生成");
  console.log(`  输出：${path.relative(ROOT, OUT)}`);
  console.log(`  大小：${(outputBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  内嵌素材：${stats.embedded} 个，原始 ${(stats.bytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  视频内嵌：${EMBED_VIDEO ? "开启" : "关闭（默认）"}`);
  console.log(`  体积比：约 ${ratio.toFixed(1)}%（base64 会增大约 1/3）`);

  if (stats.skippedVideos.length) {
    console.log("\n⚠ 以下视频未内嵌，单文件版里会找不到：");
    [...new Set(stats.skippedVideos)].forEach((item) => console.log("  - " + item));
    console.log("  需要视频请加 --embed-video，或继续使用文件夹版。");
  }

  if (stats.missing.length) {
    console.log("\n⚠ 以下素材缺失，已保留原路径：");
    stats.missing.forEach((item) => console.log("  - " + item));
    process.exitCode = 2;
  }

  const note = `恋爱纪念博物馆 · 单文件版
========================================

这个文件夹里只有一个 HTML 文件，照片、语音、文档都已内嵌。
双击即可打开，不需要 media 文件夹，也不需要联网。

生成时间：${new Date().toLocaleString("zh-CN")}
生成命令：node tools/build-single-file.js${EMBED_VIDEO ? " --embed-video" : ""}
文件大小：${(outputBytes / 1024 / 1024).toFixed(2)} MB

修改内容后如何重新生成：
  1. 在项目根目录打开终端；
  2. 运行：node tools/build-single-file.js
  3. 如果新增了视频，运行：node tools/build-single-file.js --embed-video

注意：
  · 单文件版适合发给别人、放进网盘或 U 盘；
  · 日常修改请改 offline/museum.js，然后重新运行上面的命令；
  · 不要把单文件版和文件夹版里的内容改成两套，容易忘记同步。
`;
  fs.writeFileSync(path.join(OUT_DIR, "生成说明.txt"), note, "utf-8");
  console.log(`  说明：${path.relative(ROOT, path.join(OUT_DIR, "生成说明.txt"))}`);
}

main();
