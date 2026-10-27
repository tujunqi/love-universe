/**
 * 设置、引导横幅、备份导入与安全专项自检。
 * 用法：先起 8765 服务，再运行 node tools/audit-settings.js
 */
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9336;
const BASE = "http://127.0.0.1:8765/";
const OUT = path.join(__dirname, "audit-settings");
const profile = path.join(process.env.TEMP || ".", "edge-settings-audit-" + Date.now());
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
    } catch (error) { /* 还没启动 */ }
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
  ready() { return new Promise((resolve, reject) => { this.ws.onopen = resolve; this.ws.onerror = reject; }); }
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
  close() { this.ws.close(); }
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

    async function evaluate(expression, timeout = 15000) {
      return Promise.race([
        (async () => {
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
        })(),
        sleep(timeout).then(() => { throw new Error("evaluate timeout"); })
      ]);
    }

    async function load(url) {
      const loaded = cdp.once("Page.loadEventFired");
      await cdp.send("Page.navigate", { url });
      await Promise.race([loaded, sleep(20000).then(() => { throw new Error("page load timeout"); })]);
      await sleep(1200);
    }

    async function setViewport(width, height, mobile = false) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width, height, deviceScaleFactor: 1, mobile
      });
    }

    async function screenshot(name) {
      const shot = await cdp.send("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(path.join(OUT, name), Buffer.from(shot.data, "base64"));
    }

    function check(name, value) {
      results.checks[name] = value;
      if (!value) results.pass = false;
    }

    await setViewport(1440, 960);
    await load(BASE);

    const guideDesktop = await evaluate(`(() => {
      const el = document.querySelector('#hintBanner');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { visible: !el.hidden, width: r.width, height: r.height };
    })()`);
    check("guideDesktopVisible", Boolean(guideDesktop?.visible));
    check("guideDesktopRect", Boolean(guideDesktop && guideDesktop.width >= 420 && guideDesktop.height >= 60));
    await screenshot("guide-desktop.png");

    await setViewport(390, 844, true);
    await load(BASE);
    const guideMobile = await evaluate(`(() => {
      const el = document.querySelector('#hintBanner');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const buttons = [...el.querySelectorAll('button')].map((b) => {
        const br = b.getBoundingClientRect();
        return { width: br.width, height: br.height };
      });
      return {
        visible: !el.hidden,
        width: r.width,
        height: r.height,
        left: r.left,
        right: window.innerWidth - r.right,
        bottom: window.innerHeight - r.bottom,
        buttons
      };
    })()`);
    results.checks.guideMobileMetrics = guideMobile;
    check("guideMobileVisible", Boolean(guideMobile?.visible));
    check("guideMobileNotOval", Boolean(guideMobile && guideMobile.width >= 330 && guideMobile.height >= 68 && guideMobile.height <= 135));
    check("guideMobileSafe", Boolean(guideMobile && guideMobile.left >= 6 && guideMobile.right >= 6 && guideMobile.bottom >= 6));
    check("guideMobileButtonsTappable", Boolean(guideMobile?.buttons?.some((b) => b.width >= 36 && b.height >= 32)));
    await screenshot("guide-mobile.png");

    await setViewport(1440, 960);
    await load(BASE);

    check("photoFilters", await evaluate("document.querySelectorAll('.photo-filter').length >= 4"));
    check("photoCategoryWorks", await evaluate(`(() => {
      const before = document.querySelectorAll('.photo-item:not(.is-filtered-out)').length;
      document.querySelector('[data-category=food]').click();
      const after = document.querySelectorAll('.photo-item:not(.is-filtered-out)').length;
      return after > 0 && after < before;
    })()`));
    await evaluate("document.querySelector('[data-category=all]').click()");

    check("bucketSection", await evaluate("document.querySelectorAll('.bucket-item').length >= 10"));
    await evaluate(`(() => {
      document.querySelector('#bucketInput').value = '自检加一件小事';
      document.querySelector('#bucketForm').requestSubmit();
      return true;
    })()`);
    await sleep(250);
    check("bucketAddWorks", await evaluate("document.body.innerText.includes('自检加一件小事')"));
    await evaluate("document.querySelector('.bucket-check').click()");
    await sleep(250);
    check("bucketCheckWorks", await evaluate("Boolean(document.querySelector('.bucket-item.is-done'))"));

    await evaluate("document.querySelector('#settingsBtn').click()");
    await sleep(450);
    check("settingsOpen", await evaluate("document.querySelector('#settingsModal').classList.contains('is-open')"));
    await evaluate("document.querySelector('[data-tab=data]').click()");
    await sleep(350);
    check("importLabelExists", await evaluate("Boolean(document.querySelector('label[for=importInput]'))"));
    check("backupDropZone", await evaluate("Boolean(document.querySelector('#backupDropZone'))"));
    check("importStatus", await evaluate("Boolean(document.querySelector('#importStatus'))"));
    check("snapshotSection", await evaluate("Boolean(document.querySelector('#snapshotList'))"));

    const snapshotProbe = await evaluate(`(async () => {
      const beforeName = D().names.me;
      const snapshot = await createSnapshot("自检快照", { includeMedia: false });
      const changed = normalizeEditableData({ ...D(), names: { me: "快照后名字", partner: "小满" } });
      saveData(changed);
      effectiveData = changed;
      const changedName = D().names.me;
      await restoreSnapshot(snapshot.id, { reloadAfter: false });
      return {
        created: Boolean(snapshot),
        listed: (await snapshotStore.list()).some((item) => item.id === snapshot.id),
        beforeName,
        changedName,
        restoredName: D().names.me
      };
    })()`);
    results.checks.snapshotProbe = snapshotProbe;
    check("snapshotCreated", snapshotProbe.created === true);
    check("snapshotListed", snapshotProbe.listed === true);
    check("snapshotChanged", snapshotProbe.changedName === "快照后名字");
    check("snapshotRestored", snapshotProbe.restoredName === snapshotProbe.beforeName);
    await screenshot("settings-backup.png");

    const sanitize = await evaluate(`(() => {
      const base = {
        names: { me: "阿".repeat(100), partner: "小满" },
        photos: Array.from({ length: 500 }, (_, i) => ({
          id: "p" + i,
          title: "x".repeat(500),
          src: "x".repeat(1000)
        })),
        quiz: [{ question: "坏题", options: ["A"], answer: 99 }],
        letter: { paragraphs: ["x".repeat(5000)] }
      };
      const rawText = JSON.stringify(base).replace('{"names"', '{"__proto__":{"polluted":"yes"},"names"');
      const raw = JSON.parse(rawText);
      const data = normalizeEditableData(raw);
      return {
        polluted: ({}).polluted === "yes",
        nameLength: data.names.me.length,
        photoCount: data.photos.length,
        photoTitleLength: data.photos[0].title.length,
        photoSrcLength: data.photos[0].src.length,
        quizCount: data.quiz.length,
        letterLength: data.letter.paragraphs[0].length
      };
    })()`);
    results.checks.sanitize = sanitize;
    check("prototypeNotPolluted", sanitize.polluted === false);
    check("nameCapped", sanitize.nameLength <= 12);
    check("photosCapped", sanitize.photoCount <= 120);
    check("photoTitleCapped", sanitize.photoTitleLength <= 24);
    check("photoSrcCapped", sanitize.photoSrcLength <= 500);
    check("badQuizRejected", sanitize.quizCount === 0);
    check("letterCapped", sanitize.letterLength <= 500);

    const importProbe = await evaluate(`(async () => {
      let reloadCalls = 0;
      const realReload = location.reload.bind(location);
      location.reload = () => { reloadCalls += 1; };
      const payload = {
        app: 'love-universe',
        version: 1,
        data: {
          names: { me: '导入甲', partner: '导入乙' },
          startDate: '2024-01-01T08:00:00',
          secretPassword: '9999',
          unlockMode: 'password',
          photos: [{ id: 'p01', src: 'assets/photos/p01.svg', title: '导入的照片', date: '2024.01.01', alt: '导入测试' }],
          timeline: [{ date: '2024.01.01', title: '导入坐标', text: '来自备份', icon: '★' }],
          quiz: [{ id: 'q1', question: '导入题？', options: ['对', '错'], answer: 0 }],
          letter: { title: '导入的信', paragraphs: ['第一段'], sign: '—— 导入者' }
        },
        media: {
          'photo.p01': 'data:image/jpeg;base64,' + btoa(String.fromCharCode(...new Uint8Array(256).map((_, i) => i % 256)))
        }
      };
      const file = new File([JSON.stringify(payload)], 'import-test.json', { type: 'application/json' });
      await importBackup(file, { reloadAfter: false });
      await new Promise(r => setTimeout(r, 250));
      const saved = JSON.parse(localStorage.getItem('loveUniverse.v1.data') || '{}');
      return {
        reloadCalls,
        status: document.querySelector('#importStatus')?.textContent || '',
        savedName: saved.names?.me,
        savedPassword: saved.secretPassword,
        effectiveName: D().names.me
      };
    })()`);
    results.checks.importProbe = importProbe;
    check("importSavedName", importProbe.savedName === "导入甲");
    check("importEffectiveName", importProbe.effectiveName === "导入甲");
    check("importSavedPassword", importProbe.savedPassword === "9999");
    check("importStatusShown", /导入完成/.test(importProbe.status));

    const badImport = await evaluate(`(async () => {
      const before = D().names.me;
      const file = new File(['不是 JSON'], 'bad.json', { type: 'application/json' });
      await importBackup(file);
      await new Promise(r => setTimeout(r, 200));
      return {
        before,
        after: D().names.me,
        status: document.querySelector('#importStatus')?.textContent || ''
      };
    })()`);
    check("badImportKeepsData", badImport.before === badImport.after);
    check("badImportStatus", /JSON|失败|不是/.test(badImport.status));

    const quizProbe = await evaluate(`(async () => {
      window.scrollTo(0, document.querySelector('#play').offsetTop);
      await new Promise(r => setTimeout(r, 250));
      const standardDisabled = document.querySelectorAll('.quiz-mode-card')[1].disabled;
      document.querySelectorAll('.quiz-mode-card')[0].click();
      await new Promise(r => setTimeout(r, 250));
      const firstQuestion = Boolean(document.querySelector('.quiz-option'));
      let handoff = false;

      for (let i = 0; i < 100; i += 1) {
        if (document.querySelector('.score-ring')) break;
        const option = [...document.querySelectorAll('.quiz-option')].find((button) => !button.disabled);
        if (option) {
          option.click();
          await new Promise(r => setTimeout(r, 260));
          continue;
        }
        const handoffButton = document.querySelector('.quiz-result .btn-primary');
        if (handoffButton && document.body.innerText.includes('答完了')) {
          handoff = true;
          handoffButton.click();
          await new Promise(r => setTimeout(r, 260));
          continue;
        }
        await new Promise(r => setTimeout(r, 100));
      }

      await new Promise(r => setTimeout(r, 350));
      return { standardDisabled, firstQuestion, handoff, result: Boolean(document.querySelector('.score-ring')) };
    })()`);
    results.checks.quizProbe = quizProbe;
    check("standardModeDisabledWithoutAnswers", quizProbe.standardDisabled === true);
    check("pairModeStarts", quizProbe.firstQuestion === true);
    check("pairHandoffShown", quizProbe.handoff === true);
    check("pairResultShown", quizProbe.result === true);

    const restoreProbe = await evaluate(`(async () => {
      await clearAllLocalUserData();
      return {
        dataGone: localStorage.getItem('loveUniverse.v1.data') === null,
        bucketGone: localStorage.getItem('loveUniverse.v1.bucketList') === null,
        themeGone: localStorage.getItem('loveUniverse.v1.theme') === null
      };
    })()`);
    results.checks.restoreProbe = restoreProbe;
    check("restoreClearsData", restoreProbe.dataGone && restoreProbe.bucketGone && restoreProbe.themeGone);

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
