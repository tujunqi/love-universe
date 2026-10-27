/**
 * 生成离线博物馆的 U 盘图标 museum.ico。
 * 用法：node tools/make-icon.js
 */
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { pathToFileURL } = require("url");

const ROOT = path.join(__dirname, "..");
const OFFLINE = path.join(ROOT, "offline");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9351;
const TMP = path.join(process.env.TEMP || ".", "museum-icon-" + Date.now());
const SIZES = [256, 64, 48, 32, 16];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const html = `<!doctype html>
<html lang="zh">
<meta charset="utf-8">
<style>
  html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #0b090d; }
  .frame { position: absolute; inset: 0; overflow: hidden; }
  .frame img {
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: 84% 50%;
    filter: saturate(.92) brightness(.76) contrast(1.08);
  }
  .veil {
    position: absolute; inset: 0;
    background:
      radial-gradient(72% 66% at 54% 44%, transparent 26%, rgba(6, 5, 8, .56) 100%),
      linear-gradient(180deg, rgba(6, 5, 8, .1), transparent 42%, rgba(6, 5, 8, .32));
  }
  .border {
    position: absolute; inset: 3.4%;
    border: 1px solid rgba(216, 188, 139, .94);
  }
  .border::after {
    content: ""; position: absolute; inset: 4%;
    border: 1px solid rgba(216, 188, 139, .34);
  }
</style>
<div class="frame">
  <img src="media/photos/cover-1.svg" alt="">
  <div class="veil"></div>
  <div class="border"></div>
</div>
</html>`;

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch (error) { reject(error); }
      });
    }).on("error", reject);
  });
}

class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !this.pending.has(message.id)) return;
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result);
    };
  }
  ready() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

async function main() {
  fs.mkdirSync(TMP, { recursive: true });
  const source = path.join(OFFLINE, "_icon-source.html");
  fs.writeFileSync(source, html, "utf-8");

  const profile = path.join(TMP, "profile");
  const edge = spawn(EDGE, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
    "--no-default-browser-check", `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`, "about:blank"
  ], { stdio: "ignore" });

  try {
    let wsUrl = "";
    for (let i = 0; i < 80 && !wsUrl; i++) {
      try {
        const list = await getJson(`http://127.0.0.1:${PORT}/json/list`);
        const page = list.find((item) => item.type === "page");
        if (page) wsUrl = page.webSocketDebuggerUrl;
      } catch (error) { /* not ready */ }
      if (!wsUrl) await sleep(250);
    }
    if (!wsUrl) throw new Error("Edge DevTools 端口未就绪");

    const cdp = new CDP(wsUrl);
    await cdp.ready();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Page.navigate", { url: pathToFileURL(source).href });
    await sleep(1200);
    await cdp.send("Runtime.evaluate", {
      expression: "Promise.all([...document.images].map((img) => img.decode().catch(() => {}))).then(() => true)",
      awaitPromise: true
    });
    await sleep(500);

    const pngs = [];
    for (const size of SIZES) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: size, height: size, deviceScaleFactor: 1, mobile: false
      });
      await sleep(180);
      const shot = await cdp.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: false,
        clip: { x: 0, y: 0, width: size, height: size, scale: 1 }
      });
      pngs.push({ size, data: Buffer.from(shot.data, "base64") });
    }

    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(pngs.length, 4);

    const entries = [];
    let offset = 6 + pngs.length * 16;
    for (const png of pngs) {
      const entry = Buffer.alloc(16);
      entry.writeUInt8(png.size >= 256 ? 0 : png.size, 0);
      entry.writeUInt8(png.size >= 256 ? 0 : png.size, 1);
      entry.writeUInt8(0, 2);
      entry.writeUInt8(0, 3);
      entry.writeUInt16LE(1, 4);
      entry.writeUInt16LE(32, 6);
      entry.writeUInt32LE(png.data.length, 8);
      entry.writeUInt32LE(offset, 12);
      offset += png.data.length;
      entries.push(entry);
      fs.writeFileSync(path.join(TMP, `icon-${png.size}.png`), png.data);
    }

    const ico = Buffer.concat([header, ...entries, ...pngs.map((item) => item.data)]);
    fs.writeFileSync(path.join(OFFLINE, "museum.ico"), ico);
    fs.cpSync(path.join(TMP, "icon-256.png"), path.join(__dirname, "icon-preview-256.png"));
    console.log(`museum.ico 已生成：${(ico.length / 1024).toFixed(1)} KB，包含 ${SIZES.join("/")} px`);
    cdp.ws.close();
  } finally {
    edge.kill();
    await sleep(400);
    fs.rmSync(source, { force: true });
    try {
      fs.rmSync(TMP, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
    } catch (error) {
      // Edge 偶尔还会占用临时 profile，留给系统清理即可
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
