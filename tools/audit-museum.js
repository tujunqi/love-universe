/**
 * 离线博物馆的真实渲染自检。
 * 用法：node tools/audit-museum.js
 */
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9334;
const OUT = path.join(__dirname, "audit-museum");
const PAGE = "http://127.0.0.1:8765/offline/%E7%A6%BB%E7%BA%BF%E5%8D%9A%E7%89%A9%E9%A6%86.html";
const profile = path.join(process.env.TEMP || ".", "edge-museum-audit-" + Date.now());

fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

async function waitForBrowser() {
  for (let i = 0; i < 80; i++) {
    try {
      const list = await getJson(`http://127.0.0.1:${PORT}/json/list`);
      const page = list.find((item) => item.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch (e) { /* not ready */ }
    await sleep(250);
  }
  throw new Error("Edge DevTools 端口未就绪");
}

class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
    this.errors = [];
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method) {
        if (msg.method === "Runtime.exceptionThrown") {
          this.errors.push(msg.params.exceptionDetails?.exception?.description || JSON.stringify(msg.params.exceptionDetails));
        }
        (this.events.get(msg.method) || []).forEach((fn) => fn(msg.params));
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
  close() { this.ws.close(); }
}

async function main() {
  const edge = spawn(EDGE, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
    "--no-default-browser-check", "--autoplay-policy=no-user-gesture-required",
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    "--window-size=1440,1000", "about:blank"
  ], { stdio: "ignore" });

  const results = { checks: {}, errors: [], screenshots: [] };

  try {
    const wsUrl = await waitForBrowser();
    const cdp = new CDP(wsUrl);
    await cdp.ready();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    async function setViewport(width, height, mobile) {
      await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
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
      await sleep(1500);
      await evaluate("document.fonts.ready.then(() => true)");
      await sleep(400);
    }

    async function screenshot(name, clip) {
      const params = { format: "png", fromSurface: true, captureBeyondViewport: true };
      if (clip) params.clip = { ...clip, scale: 1 };
      const shot = await cdp.send("Page.captureScreenshot", params);
      fs.writeFileSync(path.join(OUT, name), Buffer.from(shot.data, "base64"));
      results.screenshots.push(name);
    }

    async function fullPage(name) {
      const metrics = await cdp.send("Page.getLayoutMetrics");
      const size = metrics.cssContentSize;
      await screenshot(name, { x: 0, y: 0, width: size.width, height: Math.min(size.height, 18000) });
    }

    async function sectionShot(selector, name) {
      const rect = await evaluate(`(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left + window.scrollX, y: r.top + window.scrollY, width: r.width, height: r.height, vw: window.innerWidth };
      })()`);
      if (!rect) return null;
      await screenshot(name, {
        x: 0, y: Math.max(0, rect.y - 10),
        width: rect.vw, height: Math.min(3000, rect.height + 20)
      });
      return rect;
    }

    async function viewportShot(name) {
      const vp = await evaluate("({ w: window.innerWidth, h: window.innerHeight, y: window.scrollY })");
      await screenshot(name, { x: 0, y: vp.y, width: vp.w, height: vp.h });
    }

    // 懒加载图片必须在视口里滚动一遍才会真正请求，否则整页截图里是空框
    async function warmLazyImages() {
      await evaluate(`(async () => {
        const step = Math.round(window.innerHeight * 0.75);
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 110));
        }
        window.scrollTo(0, 0);
        await new Promise((resolve) => setTimeout(resolve, 200));
        return true;
      })()`);
      await evaluate(`Promise.all([...document.images].map((img) => (
        img.complete ? true : new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        })
      ))).then(() => true)`);
      await sleep(350);
    }

    await setViewport(1440, 960, false);
    await load(PAGE);
    results.checks.bootVisible = await evaluate("!document.querySelector('#boot').classList.contains('is-leaving')");
    results.checks.bootTitle = await evaluate("document.querySelector('#bootTitle').textContent");
    await viewportShot("01-boot.png");

    await evaluate("document.querySelector('#enterMuseum').click()");
    await sleep(2200);
    results.checks.museumOpen = await evaluate("document.querySelector('#museum').classList.contains('is-open')");
    results.checks.galleryCount = await evaluate("document.querySelectorAll('.gallery-item').length");
    results.checks.memoirCount = await evaluate("document.querySelectorAll('.toc-item').length");
    results.checks.voiceCount = await evaluate("document.querySelectorAll('.voice-item').length");
    results.checks.videoEmptyShown = await evaluate("!document.querySelector('#videoEmpty').hidden");
    results.checks.capsuleLocked = await evaluate("document.querySelector('#capsuleForm').hidden === false");
    results.checks.statsDays = await evaluate("document.querySelector('#statDays').textContent");
    results.checks.statPhotos = await evaluate("document.querySelector('#statPhotos').textContent");
    results.checks.musicPlaying = await evaluate("document.querySelector('#musicToggle').classList.contains('is-playing')");
    results.checks.jsErrorsAfterEnter = cdp.errors.slice();
    await warmLazyImages();

    await viewportShot("02-hall.png");
    await fullPage("03-full.png");
    await sectionShot("#gallery", "04-gallery.png");

    // 筛选 + 大图
    await evaluate("[...document.querySelectorAll('.filter-btn')].find(b => b.textContent === '旅行').click()");
    await sleep(500);
    results.checks.filteredCount = await evaluate("document.querySelectorAll('.gallery-item').length");
    await evaluate("document.querySelector('.gallery-item').click()");
    await sleep(500);
    results.checks.lightboxOpen = await evaluate("document.querySelector('#lightbox').classList.contains('is-open')");
    await viewportShot("05-lightbox.png");
    await evaluate("document.querySelector('#lightboxNext').click()");
    await sleep(300);
    results.checks.lightboxCount = await evaluate("document.querySelector('#lightboxCount').textContent");
    await evaluate("document.querySelector('#lightboxClose').click()");

    // 影音
    await sectionShot("#screen", "06-screen.png");
    await evaluate("document.querySelector('.voice-play').click()");
    await sleep(900);
    results.checks.voicePlaying = await evaluate("document.querySelector('.voice-item').classList.contains('is-playing')");
    results.checks.voiceDuration = await evaluate("document.querySelector('.voice-duration').textContent");

    // 回忆录
    await sectionShot("#memoirs", "07-memoirs.png");
    await evaluate("document.querySelector('#nextChapter').click()");
    await sleep(300);
    results.checks.chapterTitle = await evaluate("document.querySelector('#chapterTitle').textContent");

    // 时间胶囊：错误密码 + 正确密码
    await sectionShot("#capsule", "08-capsule.png");
    await evaluate(`(() => {
      const input = document.querySelector('#capsulePassword');
      input.value = '0000';
      document.querySelector('#capsuleForm').requestSubmit();
      return true;
    })()`);
    await sleep(300);
    results.checks.capsuleError = await evaluate("document.querySelector('#capsuleError').textContent");
    await evaluate(`(() => {
      const input = document.querySelector('#capsulePassword');
      input.value = '0520';
      document.querySelector('#capsuleForm').requestSubmit();
      return true;
    })()`);
    await sleep(900);
    results.checks.capsuleUnlocked = await evaluate("document.querySelector('#capsuleLetter').hidden === false");
    await sectionShot("#capsule", "09-capsule-open.png");

    await sectionShot("#guide", "10-guide.png");

    // 手机
    await setViewport(390, 844, true);
    await load(PAGE + "?view=hall");
    await sleep(500);
    await warmLazyImages();
    await viewportShot("11-hall-mobile.png");
    await fullPage("12-full-mobile.png");
    await sectionShot("#gallery", "13-gallery-mobile.png");
    await sectionShot("#screen", "14-screen-mobile.png");
    await sectionShot("#memoirs", "15-memoirs-mobile.png");
    await sectionShot("#capsule", "16-capsule-mobile.png");
    results.checks.mobileOverflow = await evaluate("document.documentElement.scrollWidth > window.innerWidth + 1");
    results.checks.mobileWidth = await evaluate("window.innerWidth");

    // 直接预览胶囊打开态
    await setViewport(1440, 960, false);
    await load(PAGE + "?view=capsule&preview=capsule");
    await sleep(700);
    results.checks.capsulePreview = await evaluate("document.querySelector('#capsuleLetter').hidden === false");
    await sectionShot("#capsule", "17-capsule-preview.png");

    results.errors = cdp.errors;
    cdp.close();
  } catch (error) {
    results.fatal = error.message;
  } finally {
    edge.kill();
    await sleep(400);
    fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
  }
}

main();
