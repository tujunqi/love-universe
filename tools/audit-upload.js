/**
 * 专项自检：照片墙 / 封面 / 隐藏视频的拖拽上传与还原。
 * 用法：先用任意方式起 8765 预览服务器，再运行：node tools/audit-upload.js
 * 产物：tools/audit/upload-report.json 与 upload-*.png
 */
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9334;
const BASE = "http://127.0.0.1:8765/";
const OUT = path.join(__dirname, "audit");
const profile = path.join(process.env.TEMP || ".", "edge-love-upload-" + Date.now());

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
      /* 浏览器还没启动完成 */
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
          this.errors.push(
            msg.params.exceptionDetails?.exception?.description ||
            JSON.stringify(msg.params.exceptionDetails)
          );
        }
        const arr = this.listeners?.get(msg.method) || [];
        arr.forEach((fn) => fn(msg.params));
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
        const arr = this.listeners.get(method) || [];
        this.listeners.set(method, arr.filter((fn) => fn !== handler));
        resolve(params);
      };
      const arr = this.listeners.get(method) || [];
      arr.push(handler);
      this.listeners.set(method, arr);
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
      await sleep(1100);
    }

    async function screenshot(name) {
      const shot = await cdp.send("Page.captureScreenshot", {
        format: "png", fromSurface: true, captureBeyondViewport: false
      });
      fs.writeFileSync(path.join(OUT, name), Buffer.from(shot.data, "base64"));
    }

    function check(name, value) {
      results.checks[name] = value;
      if (!value) results.pass = false;
    }

    await load(BASE);

    // 基础入口必须存在
    check("photoEditButtons", await evaluate("document.querySelectorAll('.photo-edit').length") >= 100);
    check("coverEditButton", await evaluate("Boolean(document.querySelector('#coverEditBtn'))"));
    check("lightboxReplaceButton", await evaluate("Boolean(document.querySelector('#lightboxReplace'))"));
    check("videoUploadButton", await evaluate("Boolean(document.querySelector('#uploadSecretVideo'))"));

    // 1. 用真实上传函数换第一张照片，并确认写入 IndexedDB
    const replaceResult = await evaluate(`(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 220;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ff9bb1';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = '28px sans-serif';
      ctx.fillText('UPLOAD', 70, 125);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
      const file = new File([blob], 'audit-upload.jpg', { type: 'image/jpeg' });
      await replacePhoto(0, file);
      const figure = document.querySelector('.photo-item');
      const image = figure.querySelector('img');
      return {
        override: Boolean(photoOverrides.photos[D().photos[0].id]),
        isDataUrl: String(image.src).startsWith('data:image/jpeg'),
        badge: Boolean(figure.querySelector('.photo-custom')),
        stored: Boolean(await mediaStore.get(MEDIA_KEYS.photo(D().photos[0].id)))
      };
    })()`);
    check("photoOverride", replaceResult.override);
    check("photoRendered", replaceResult.isDataUrl);
    check("photoBadge", replaceResult.badge);
    check("photoIndexedDb", replaceResult.stored);
    await screenshot("upload-photo-replaced.png");

    // 2. 重新加载，必须还在（IndexedDB 持久化）
    await load(BASE);
    check("photoAfterReload", await evaluate(`(async () => {
      await new Promise(r => setTimeout(r, 650));
      const image = document.querySelector('.photo-item img');
      return String(image.src).startsWith('data:image/jpeg');
    })()`));

    // 3. 拖拽悬停态和真实 drop
    await evaluate("window.scrollTo(0, document.querySelector('#gallery').offsetTop)");
    await sleep(300);
    const dragResult = await evaluate(`(async () => {
      const figure = document.querySelector('.photo-item');
      const canvas = document.createElement('canvas');
      canvas.width = 300; canvas.height = 200;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#8fb6ff';
      ctx.fillRect(0, 0, 300, 200);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
      const file = new File([blob], 'dragged.jpg', { type: 'image/jpeg' });
      const dt = new DataTransfer();
      dt.items.add(file);
      figure.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: dt }));
      const hovering = figure.classList.contains('is-dragover');
      figure.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
      figure.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
      await new Promise((resolve) => setTimeout(resolve, 900));
      return {
        hovering,
        notHoveringAfterDrop: !figure.classList.contains('is-dragover'),
        src: figure.querySelector('img').src
      };
    })()`);
    check("dragHoverClass", dragResult.hovering);
    check("dragHoverCleared", dragResult.notHoveringAfterDrop);
    check("dragDropReplaced", String(dragResult.src).startsWith("data:image/jpeg"));
    await screenshot("upload-photo-dragged.png");

    // 4. 还原默认
    const restored = await evaluate(`(async () => {
      await restorePhoto(0);
      await new Promise(r => setTimeout(r, 300));
      const image = document.querySelector('.photo-item img');
      return {
        src: image.src,
        badge: Boolean(document.querySelector('.photo-item .photo-custom')),
        stored: Boolean(await mediaStore.get(MEDIA_KEYS.photo(D().photos[0].id)))
      };
    })()`);
    check("photoRestored", restored.src.includes("assets/photos/p01") && !restored.src.startsWith("data:"));
    check("photoBadgeRemoved", !restored.badge);
    check("photoStorageCleared", !restored.stored);

    // 5. 封面：换图、持久化、还原
    const coverResult = await evaluate(`(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 900; canvas.height = 500;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f2a6bd';
      ctx.fillRect(0, 0, 900, 500);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
      const file = new File([blob], 'cover.jpg', { type: 'image/jpeg' });
      await replaceCover(file);
      const image = document.querySelector('#coverSlides [data-slide-index="0"]');
      return {
        rendered: String(image.src).startsWith('data:image/jpeg'),
        resetVisible: !document.querySelector('#coverResetBtn').hidden,
        stored: Boolean(await mediaStore.get(MEDIA_KEYS.cover(D().coverSlides[activeCoverIndex].id)))
      };
    })()`);
    check("coverRendered", coverResult.rendered);
    check("coverResetVisible", coverResult.resetVisible);
    check("coverIndexedDb", coverResult.stored);
    await evaluate("window.scrollTo(0, 0)");
    await sleep(350);
    await screenshot("upload-cover-replaced.png");

    await load(BASE);
    check("coverAfterReload", await evaluate(`(async () => {
      await new Promise(r => setTimeout(r, 650));
      const image = document.querySelector('#coverSlides [data-slide-index="0"]');
      return Boolean(image) && String(image.src).startsWith('data:image/jpeg');
    })()`));
    await evaluate(`(async () => {
      await restoreCover();
    })()`);
    check("coverRestored", await evaluate(`(async () => {
      await new Promise(r => setTimeout(r, 300));
      const image = document.querySelector('#coverSlides [data-slide-index="0"]');
      return !String(image.src).startsWith('data:image/jpeg');
    })()`));

    // 6. 隐藏视频：上传一个可被 IndexedDB 保存的视频 Blob
    const videoResult = await evaluate(`(async () => {
      const file = new File(
        [new Uint8Array([0, 0, 0, 32, 102, 116, 121, 112, 109, 112, 52, 50])],
        'audit.mp4',
        { type: 'video/mp4' }
      );
      document.querySelector('#secretEntry').click();
      await new Promise(r => setTimeout(r, 300));
      document.querySelector('#secretInput').value = CONFIG.secretPassword;
      document.querySelector('#unlockForm').requestSubmit();
      await new Promise(r => setTimeout(r, 450));
      await replaceSecretVideo(file);
      await new Promise(r => setTimeout(r, 300));
      return {
        blobStored: Boolean(await mediaStore.get(MEDIA_KEYS.video())),
        restoreVisible: !document.querySelector('#restoreSecretVideo').hidden,
        note: document.querySelector('#videoSourceNote').textContent
      };
    })()`);
    check("videoIndexedDb", videoResult.blobStored);
    check("videoRestoreVisible", videoResult.restoreVisible);
    check("videoNote", /这台设备/.test(videoResult.note));
    await screenshot("upload-letter-video.png");

    await evaluate(`(async () => {
      document.querySelector('[data-close=letterModal]').click();
    })()`);
    await sleep(400);

    await load(BASE + "?preview=letter");
    const videoAfterReload = await evaluate(`(async () => {
      await new Promise(r => setTimeout(r, 900));
      return {
        blobLoaded: Boolean(secretVideoBlob),
        restoreVisible: !document.querySelector('#restoreSecretVideo').hidden
      };
    })()`);
    check("videoAfterReload", videoAfterReload.blobLoaded && videoAfterReload.restoreVisible);

    await evaluate(`(async () => {
      await restoreSecretVideo();
    })()`);
    const videoRestored = await evaluate(`(async () => {
      await new Promise(r => setTimeout(r, 300));
      return {
        blob: Boolean(secretVideoBlob),
        stored: Boolean(await mediaStore.get('secret-video'))
      };
    })()`);
    check("videoRestored", !videoRestored.blob && !videoRestored.stored);

    // 7. 大图查看器按钮能切换
    await evaluate("window.scrollTo(0, document.querySelector('#gallery').offsetTop)");
    await sleep(300);
    await evaluate("document.querySelector('.photo-open').click()");
    await sleep(450);
    check("lightboxActionsVisible", await evaluate("Boolean(document.querySelector('#lightboxReplace').offsetParent)"));
    await evaluate("document.querySelector('#lightboxClose').click()");

    // 8. 手机端按钮不应藏在 hover 后面
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 390, height: 844, deviceScaleFactor: 1, mobile: true
    });
    await load(BASE + "?theme=rose");
    await evaluate("window.scrollTo(0, document.querySelector('#gallery').offsetTop)");
    await sleep(500);
    const mobileButtonOpacity = await evaluate(`(() => {
      const button = document.querySelector('.photo-edit');
      const style = getComputedStyle(button);
      const rect = button.getBoundingClientRect();
      return { opacity: Number(style.opacity), width: rect.width, height: rect.height };
    })()`);
    results.checks.mobileButtonMetrics = mobileButtonOpacity;
    check("mobileEditButtonTappable", mobileButtonOpacity.opacity > 0.8 && mobileButtonOpacity.width >= 40 && mobileButtonOpacity.height >= 30);
    check("mobileNoHorizontalOverflow", await evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"));
    await screenshot("upload-mobile-buttons.png");

    results.errors = cdp.errors.slice();
    if (cdp.errors.length) results.pass = false;
  } catch (error) {
    results.pass = false;
    results.fatal = error.message;
  } finally {
    if (cdp) cdp.close();
    edge.kill();
    await sleep(400);
    fs.writeFileSync(path.join(OUT, "upload-report.json"), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
    process.exitCode = results.pass ? 0 : 1;
  }
}

main();
