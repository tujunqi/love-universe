/**
 * 用无头 Edge + DevTools 协议做真实渲染自检与截图。
 * 用法：node tools/audit-ui.js
 * 产物：tools/audit/*.png 与 tools/audit/report.json
 */
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9333;
const OUT = path.join(__dirname, "audit");
const BASE = "http://127.0.0.1:8765/";
const profile = path.join(process.env.TEMP || ".", "edge-love-audit-" + Date.now());

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
        const listeners = this.events.get(msg.method) || [];
        listeners.forEach((fn) => fn(msg.params));
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
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--autoplay-policy=no-user-gesture-required",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "--window-size=1440,1000",
    "about:blank"
  ], { stdio: "ignore" });

  const results = { checks: {}, errors: [], screenshots: [] };

  try {
    const wsUrl = await waitForBrowser();
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
        expression,
        awaitPromise: true,
        returnByValue: true,
        userGesture: true
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
      await evaluate("document.fonts.ready.then(() => true)");
      await sleep(300);
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
      const height = Math.min(size.height, 16000);
      await screenshot(name, { x: 0, y: 0, width: size.width, height });
      return size;
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
        width: rect.vw, height: Math.min(2800, rect.height + 20)
      });
      return rect;
    }

    async function viewportShot(name) {
      const vp = await evaluate("({ w: window.innerWidth, h: window.innerHeight, y: window.scrollY })");
      await screenshot(name, { x: 0, y: vp.y, width: vp.w, height: vp.h });
    }

    await setViewport(1440, 960, false);
    await load(BASE);
    await sleep(600);

    results.checks.photoCount = await evaluate("document.querySelectorAll('.photo-item').length");
    results.checks.timelineCount = await evaluate("document.querySelectorAll('.timeline-item').length");
    results.checks.theme = await evaluate("document.documentElement.dataset.theme");
    results.checks.coverTitle = await evaluate("document.querySelector('#coverTitle').innerText.replace(/\\s+/g,' ').trim()");
    results.checks.jsErrorsAfterLoad = cdp.errors.slice();
    results.checks.bodyScrollHeight = await evaluate("document.body.scrollHeight");
    results.checks.coverImageLoaded = await evaluate("(() => { const img = document.querySelector('.cover-slides img'); return Boolean(img && img.complete && img.naturalWidth > 0); })()");

    // 背景音乐开关
    await evaluate("document.querySelector('#musicToggle').click()");
    await sleep(1300);
    results.checks.musicPlaying = await evaluate("document.querySelector('#musicToggle').classList.contains('is-playing')");
    await evaluate("document.querySelector('#musicToggle').click()");
    await sleep(700);
    results.checks.musicStopped = await evaluate("!document.querySelector('#musicToggle').classList.contains('is-playing')");

    await sleep(900);
    await viewportShot("01-cover-desktop.png");
    await fullPage("02-full-desktop.png");
    await sectionShot("#gallery", "03-gallery.png");
    await sectionShot("#timeline", "04-timeline.png");
    await sectionShot("#play", "05-play.png");
    await sectionShot("#messages", "06-messages.png");

    // 抽卡交互
    await evaluate("document.querySelector('#quoteCard').click()");
    await sleep(700);
    results.checks.quoteFlipped = await evaluate("document.querySelector('#quoteCard').classList.contains('is-flipped')");
    results.checks.quoteText = await evaluate("document.querySelector('#quoteText').textContent");
    await sectionShot("#play", "07-play-drawn.png");

    // 默契题：默认没有标准答案，测试两人默契模式
    await evaluate(`(() => {
      window.scrollTo(0, document.querySelector('#play').offsetTop);
      return true;
    })()`);
    await sleep(250);
    results.checks.quizMenuShown = await evaluate("document.querySelectorAll('.quiz-mode-card').length === 2");
    results.checks.standardDisabledWithoutAnswers = await evaluate("document.querySelectorAll('.quiz-mode-card')[1].disabled === true");
    await evaluate("document.querySelectorAll('.quiz-mode-card')[0].click()");
    await sleep(350);
    for (let i = 0; i < 80; i++) {
      const clicked = await evaluate(`(() => {
        if (document.querySelector('.score-ring')) return false;
        const option = [...document.querySelectorAll('.quiz-option')].find((button) => !button.disabled);
        if (option) { option.click(); return true; }
        const handoff = document.querySelector('.quiz-result .btn-primary');
        if (handoff && document.body.innerText.includes('答完了')) { handoff.click(); return true; }
        return false;
      })()`);
      if (!clicked) break;
      await sleep(300);
    }
    results.checks.quizResult = await evaluate("Boolean(document.querySelector('.score-ring'))");
    results.checks.quizScore = await evaluate("document.querySelector('.score-value')?.innerText || ''");
    await sectionShot("#play", "08-quiz-result.png");

    // 留言板写入
    await evaluate(`(() => {
      const name = document.querySelector('#messageName');
      const text = document.querySelector('#messageText');
      name.value = '自检';
      text.value = '这是一条来自自动测试的留言。';
      text.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('#messageForm').requestSubmit();
      return true;
    })()`);
    await sleep(400);
    results.checks.messageCount = await evaluate("document.querySelectorAll('.message-item').length");
    await sectionShot("#messages", "09-messages-filled.png");

    // 密码信
    await evaluate("document.querySelector('#secretEntry').click()");
    await sleep(300);
    results.checks.letterModalOpen = await evaluate("document.querySelector('#letterModal').classList.contains('is-open')");
    await evaluate(`(() => {
      const input = document.querySelector('#secretInput');
      input.value = '0520';
      document.querySelector('#unlockForm').requestSubmit();
      return true;
    })()`);
    await sleep(400);
    results.checks.letterUnlocked = await evaluate("!document.querySelector('#letterPanel').hidden");
    await evaluate("window.scrollTo(0, 0)");
    await sleep(250);
    await viewportShot("10-letter.png");

    // 隐藏视频：占位文件不存在时，应自动降级为提示文案
    await evaluate("document.querySelector('#playSecretVideo').click()");
    await sleep(1200);
    results.checks.videoFallbackShown = await evaluate("!document.querySelector('#videoFallback').hidden");
    results.checks.videoButtonHidden = await evaluate("document.querySelector('#playSecretVideo').hidden");

    // 先关掉信的弹窗，再切换夜空蓝，避免截图里还是弹窗
    await evaluate("document.querySelector('[data-close=letterModal]').click()");
    await sleep(500);

    // 切换夜空蓝，回到封面
    await evaluate("document.querySelector('[data-theme-value=night]').click()");
    await evaluate("window.scrollTo(0,0)");
    await sleep(1400);
    results.checks.nightTheme = await evaluate("document.documentElement.dataset.theme");
    results.checks.nightBodyBg = await evaluate("getComputedStyle(document.body).backgroundColor");
    results.checks.nightCoverTint = await evaluate("getComputedStyle(document.querySelector('.cover-veil')).backgroundImage.slice(0, 80)");
    results.checks.nightBgVar = await evaluate("getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()");
    results.checks.letterModalClosed = await evaluate("!document.querySelector('#letterModal').classList.contains('is-open')");
    await viewportShot("11-cover-night.png");

    // 复古棕 + 大图查看器
    await evaluate("document.querySelector('[data-theme-value=retro]').click()");
    await sleep(300);
    await evaluate("window.scrollTo(0, document.querySelector('#gallery').offsetTop)");
    await sleep(300);
    await evaluate("document.querySelector('.photo-open').click()");
    await sleep(500);
    results.checks.lightboxOpen = await evaluate("document.querySelector('#lightbox').classList.contains('is-open')");
    await viewportShot("12-lightbox-retro.png");
    await evaluate("document.querySelector('#lightboxClose').click()");

    // 移动端
    await setViewport(390, 844, true);
    await load(BASE + "?theme=rose");
    await sleep(400);
    await viewportShot("13-cover-mobile.png");
    await fullPage("14-full-mobile.png");
    await sectionShot("#gallery", "15-gallery-mobile.png");
    await sectionShot("#timeline", "16-timeline-mobile.png");
    await sectionShot("#play", "17-play-mobile.png");
    await sectionShot("#messages", "18-messages-mobile.png");
    results.checks.mobileOverflowX = await evaluate("document.documentElement.scrollWidth > window.innerWidth + 1");
    results.checks.mobileScrollWidth = await evaluate("document.documentElement.scrollWidth");
    results.checks.mobileViewport = await evaluate("window.innerWidth");
    results.checks.mobileTitleHeight = await evaluate("document.querySelector('#coverTitle').getBoundingClientRect().height");

    // 手机端完整答完默契题，结果展开后不应把抽卡卡片拉长
    await evaluate(`(() => {
      window.scrollTo(0, document.querySelector('#play').offsetTop);
      return true;
    })()`);
    await sleep(300);
    await evaluate("document.querySelectorAll('.quiz-mode-card')[0].click()");
    await sleep(350);
    for (let i = 0; i < 80; i++) {
      const clicked = await evaluate(`(() => {
        if (document.querySelector('.score-ring')) return false;
        const option = [...document.querySelectorAll('.quiz-option')].find((button) => !button.disabled);
        if (option) { option.click(); return true; }
        const handoff = document.querySelector('.quiz-result .btn-primary');
        if (handoff && document.body.innerText.includes('答完了')) { handoff.click(); return true; }
        return false;
      })()`);
      if (!clicked) break;
      await sleep(300);
    }
    results.checks.mobileQuizResult = await evaluate("Boolean(document.querySelector('.score-ring'))");
    await sectionShot("#play", "21-play-quiz-mobile.png");
    results.checks.mobileOverflowAfterQuiz = await evaluate("document.documentElement.scrollWidth > window.innerWidth + 1");

    // 360px 窄屏：标题必须保持单行
    await setViewport(360, 800, true);
    await load(BASE + "?theme=rose");
    await sleep(400);
    results.checks.narrowTitleHeight = await evaluate("document.querySelector('#coverTitle').getBoundingClientRect().height");
    results.checks.narrowOverflowX = await evaluate("document.documentElement.scrollWidth > window.innerWidth + 1");
    await viewportShot("22-cover-360.png");
    await setViewport(390, 844, true);
    await sleep(300);

    // 生日预览
    await load(BASE + "?preview=birthday");
    await sleep(600);
    results.checks.birthdayOpen = await evaluate("document.querySelector('#birthdayModal').classList.contains('is-open')");
    await viewportShot("19-birthday.png");

    // 密码信预览
    await load(BASE + "?preview=letter");
    await sleep(500);
    results.checks.letterPreview = await evaluate("!document.querySelector('#letterPanel').hidden");
    await viewportShot("20-letter-preview.png");

    // ⚙ 设置面板冒烟测试：能打开、六个页签都能渲染、能关闭
    await load(BASE);
    await sleep(500);
    results.checks.settingsOpens = await evaluate("(() => { document.querySelector('#settingsBtn').click(); return document.querySelector('#settingsModal').classList.contains('is-open'); })()");
    const settingTabs = ["photos", "timeline", "quiz", "letter", "data"];
    results.checks.settingsTabsRender = {};
    for (const tabName of settingTabs) {
      results.checks.settingsTabsRender[tabName] = await evaluate(`(() => {
        document.querySelector('.settings-tab[data-tab=${JSON.stringify(tabName)}]').click();
        return document.querySelector('#settingsBody').innerHTML.length > 100;
      })()`);
    }
    results.checks.settingsCloses = await evaluate("(() => { document.querySelector('#settingsModal .modal-close').click(); return !document.querySelector('#settingsModal').classList.contains('is-open'); })()");

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
