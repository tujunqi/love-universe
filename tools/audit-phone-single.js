/**
 * 手机版单文件主页自检：直接从 file:// 打开。
 * 用法：node tools/audit-phone-single.js
 * 产物：tools/audit-phone/report.json
 */
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { pathToFileURL } = require("url");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9335;
const OUT = path.join(__dirname, "audit-phone");
const PAGE = pathToFileURL(path.join(__dirname, "..", "手机版", "恋爱主页-发手机打开这份.html")).href;
const profile = path.join(process.env.TEMP || ".", "edge-phone-audit-" + Date.now());

fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

async function waitForBrowser() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const list = await getJson(`http://127.0.0.1:${PORT}/json/list`);
      const page = list.find((item) => item.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch (error) {
      /* 还没启动 */
    }
    await sleep(250);
  }
  throw new Error("Edge DevTools 端口未就绪");
}

class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Map();
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
        (this.listeners.get(msg.method) || []).forEach((fn) => fn(msg.params));
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
      const handler = (params) => {
        this.listeners.set(method, (this.listeners.get(method) || []).filter((fn) => fn !== handler));
        resolve(params);
      };
      this.listeners.set(method, [...(this.listeners.get(method) || []), handler]);
    });
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  const edge = spawn(EDGE, [
    "--headless=new",
    "--disable-gpu",
    "--allow-file-access-from-files",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "--window-size=1440,960",
    "about:blank"
  ], { stdio: "ignore" });

  const results = { pass: true, checks: {}, errors: [] };
  let cdp;

  try {
    cdp = new CDP(await waitForBrowser());
    await cdp.ready();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440, height: 960, deviceScaleFactor: 1, mobile: false
    });

    async function evaluate(expression) {
      const response = await cdp.send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
        userGesture: true
      });
      if (response.exceptionDetails) {
        throw new Error(response.exceptionDetails.exception?.description || "页面脚本执行失败");
      }
      return response.result.value;
    }

    async function load(url) {
      const loaded = cdp.once("Page.loadEventFired");
      await cdp.send("Page.navigate", { url });
      await loaded;
      await sleep(1200);
    }

    function check(name, value) {
      results.checks[name] = value;
      if (!value) results.pass = false;
    }

    await load(PAGE);
    check("fileProtocol", await evaluate("location.protocol") === "file:");
    check("photoCount", await evaluate("document.querySelectorAll('.photo-item').length") >= 100);
    check("coverTools", await evaluate("Boolean(document.querySelector('#coverEditBtn'))"));
    check("uploadButtons", await evaluate("document.querySelectorAll('.photo-edit').length") >= 100);
    check("noExternalScripts", await evaluate("document.querySelectorAll('script[src]').length") === 0);
    check("noExternalStyles", await evaluate("document.querySelectorAll('link[rel=stylesheet]').length") === 0);
    check("musicEmbedded", await evaluate("String(CONFIG.music).startsWith('data:')"));
    check("photoEmbedded", await evaluate("String(document.querySelector('.photo-item img').src).startsWith('data:')"));

    const uploadResult = await evaluate(`(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 160;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f0a';
      ctx.fillRect(0, 0, 240, 160);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      const file = new File([blob], 'phone-upload.jpg', { type: 'image/jpeg' });
      await replacePhoto(0, file);
      await new Promise(r => setTimeout(r, 350));
      const image = document.querySelector('.photo-item img');
      const replaced = String(image.src).startsWith('data:image/jpeg') && Boolean(photoOverrides.photos[D().photos[0].id]);
      await restorePhoto(0);
      await new Promise(r => setTimeout(r, 250));
      return { replaced, restored: String(document.querySelector('.photo-item img').src).startsWith('data:') };
    })()`);
    check("uploadWorks", Boolean(uploadResult.replaced));
    check("restoreWorks", Boolean(uploadResult.restored));

    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 390, height: 844, deviceScaleFactor: 1, mobile: true
    });
    await load(PAGE);
    check("mobileNoOverflow", await evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"));
    check("mobileButtonsVisible", await evaluate(`(() => {
      const button = document.querySelector('.photo-edit');
      return Number(getComputedStyle(button).opacity) > 0.8;
    })()`));

    results.errors = cdp.errors.slice();
    if (cdp.errors.length) results.pass = false;
  } catch (error) {
    results.pass = false;
    results.fatal = error.message;
  } finally {
    if (cdp) cdp.close();
    edge.kill();
    await sleep(400);
    fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
    process.exitCode = results.pass ? 0 : 1;
  }
}

main();
