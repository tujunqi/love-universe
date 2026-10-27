/**
 * 单文件版自检：直接从 file:// 打开，不经过本地服务器。
 * 用法：node tools/audit-single.js
 */
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { pathToFileURL } = require("url");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9355;
const OUT = path.join(__dirname, "audit-single");
const PAGE = pathToFileURL(path.join(__dirname, "..", "offline", "单文件版", "恋爱纪念博物馆-单文件版.html")).href;
const profile = path.join(process.env.TEMP || ".", "edge-single-audit-" + Date.now());
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

fs.mkdirSync(OUT, { recursive: true });

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
    this.errors = [];
    this.events = new Map();
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(JSON.stringify(message.error)));
        else resolve(message.result);
      } else if (message.method === "Runtime.exceptionThrown") {
        this.errors.push(message.params.exceptionDetails?.exception?.description || "unknown exception");
      } else if (message.method) {
        (this.events.get(message.method) || []).forEach((fn) => fn(message.params));
      }
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
  once(method) {
    return new Promise((resolve) => {
      const fn = (params) => {
        const arr = this.events.get(method) || [];
        this.events.set(method, arr.filter((item) => item !== fn));
        resolve(params);
      };
      const arr = this.events.get(method) || [];
      arr.push(fn);
      this.events.set(method, arr);
    });
  }
}

async function main() {
  const edge = spawn(EDGE, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
    "--no-default-browser-check", "--allow-file-access-from-files",
    "--autoplay-policy=no-user-gesture-required",
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    "--window-size=1440,1000", "about:blank"
  ], { stdio: "ignore" });

  const results = { checks: {}, errors: [], screenshots: [] };

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

    async function setViewport(width, height, mobile) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width, height, deviceScaleFactor: 1, mobile
      });
      await cdp.send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: "reduce" }]
      });
    }

    async function evaluate(expression) {
      const res = await cdp.send("Runtime.evaluate", {
        expression, awaitPromise: true, returnByValue: true, userGesture: true
      });
      if (res.exceptionDetails) {
        throw new Error(res.exceptionDetails.exception?.description || "evaluate failed");
      }
      return res.result.value;
    }

    async function load(url) {
      const loaded = cdp.once("Page.loadEventFired");
      await cdp.send("Page.navigate", { url });
      await loaded;
      await sleep(1400);
    }

    async function shot(name) {
      const png = await cdp.send("Page.captureScreenshot", { format: "png", fromSurface: true });
      fs.writeFileSync(path.join(OUT, name), Buffer.from(png.data, "base64"));
      results.screenshots.push(name);
    }

    await setViewport(1440, 960, false);
    await load(PAGE);
    results.checks.bootVisible = await evaluate("!!document.querySelector('#boot')");
    results.checks.bootTitle = await evaluate("document.querySelector('#bootTitle').textContent");
    results.checks.fileProtocol = await evaluate("location.protocol");
    results.checks.hasInlineStyle = await evaluate("!!document.querySelector('style')");
    results.checks.externalScripts = await evaluate("document.querySelectorAll('script[src]').length");
    results.checks.externalLinks = await evaluate("document.querySelectorAll('link[rel=stylesheet]').length");
    await shot("01-boot.png");

    await evaluate("document.querySelector('#enterMuseum').click()");
    await sleep(2000);
    results.checks.museumOpen = await evaluate("document.querySelector('#museum').classList.contains('is-open')");
    results.checks.galleryCount = await evaluate("document.querySelectorAll('.gallery-item').length");
    await evaluate(`(async () => {
      const step = Math.round(window.innerHeight * 0.75);
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      window.scrollTo(0, 0);
      await new Promise((resolve) => setTimeout(resolve, 250));
      return true;
    })()`);
    await evaluate("Promise.all([...document.images].map((img) => img.complete ? true : new Promise((resolve) => { img.addEventListener('load', resolve, { once: true }); img.addEventListener('error', resolve, { once: true }); }))).then(() => true)");
    await sleep(300);
    results.checks.photosLoaded = await evaluate("[...document.querySelectorAll('.gallery-item img')].every((img) => img.complete && img.naturalWidth > 0)");
    results.checks.coverDataUri = await evaluate("getComputedStyle(document.querySelector('#bootPhoto')).backgroundImage.startsWith('url(\"data:image/svg+xml;base64,')");
    results.checks.musicPlaying = await evaluate("document.querySelector('#musicToggle').classList.contains('is-playing')");
    results.checks.musicSrc = await evaluate("typeof music !== 'undefined' && music ? music.src.slice(0, 30) : 'none'");

    // 语音时长
    await evaluate("document.querySelectorAll('.voice-play')[0]?.click()");
    await sleep(900);
    results.checks.voiceDuration = await evaluate("document.querySelector('.voice-duration')?.textContent");
    results.checks.voicePlaying = await evaluate("document.querySelector('.voice-item')?.classList.contains('is-playing')");

    // 馆藏文档是否内嵌 + 可下载
    results.checks.documentDataUri = await evaluate("(document.querySelector('.document-item')?.href || '').startsWith('data:text/plain')");
    results.checks.documentDownload = await evaluate("document.querySelector('.document-item')?.getAttribute('download')");

    // 胶囊
    await evaluate(`(() => {
      const input = document.querySelector('#capsulePassword');
      input.value = '0520';
      document.querySelector('#capsuleForm').requestSubmit();
      return true;
    })()`);
    await sleep(700);
    results.checks.capsuleUnlocked = await evaluate("document.querySelector('#capsuleLetter').hidden === false");

    results.checks.jsErrors = cdp.errors.slice();

    // 手机
    await setViewport(390, 844, true);
    await load(PAGE + "?view=hall");
    await sleep(500);
    results.checks.mobileOverflow = await evaluate("document.documentElement.scrollWidth > window.innerWidth + 1");
    await shot("02-mobile.png");

    await setViewport(1440, 960, false);
    await load(PAGE + "?view=gallery");
    await sleep(700);
    await shot("03-gallery.png");

    fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(results, null, 2), "utf-8");
    console.log(JSON.stringify(results, null, 2));
  } finally {
    edge.kill();
    await sleep(300);
    try {
      fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
    } catch (error) { /* profile still locked; OS will clean it */ }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
