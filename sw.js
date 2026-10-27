/* ==========================================================================
   恋爱纪念宇宙 · 离线缓存（Service Worker）
   --------------------------------------------------------------------------
   作用：手机「安装成 App」或第二次访问后，断网也能打开整个纪念宇宙。

   缓存策略（为什么这么设计）：
   · HTML / CSS / JS / 清单：网络优先，失败才用缓存——保证你改了内容、
     重新部署后，别人刷新一次就能看到新版本；
   · 照片 / 音乐 / 图标：先用缓存秒开，后台悄悄更新——下次刷新就是新的；
   · ⚙ 设置里改的文字、上传的照片存在 localStorage / IndexedDB，
     和这里的缓存互不影响，永远不会被清掉。

   版本号：改了任何被缓存的文件后，把 VERSION 加一位（如 v3），
   旧缓存会在下次访问时自动清除。
   ========================================================================== */
const VERSION = "love-universe-v3";
const CORE_CACHE = `${VERSION}-core`;
const ASSET_CACHE = `${VERSION}-assets`;

/* 核心文件：打开页面必需。照片较多，走运行时缓存，不在这里全量预载 */
const CORE_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./js/main.js",
  "./assets/music/bgm.wav",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png",
  "./assets/icons/apple-touch-icon.png"
];

/* 安装：逐个缓存，一个文件缺失也不会让整份 PWA 安装失败 */
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE_CACHE);
    const results = await Promise.allSettled(CORE_FILES.map(async (file) => {
      const request = new Request(file, { cache: "reload" });
      const response = await fetch(request);
      if (response && response.ok) await cache.put(request, response);
    }));

    const failed = results.filter((item) => item.status === "rejected").length;
    if (failed < CORE_FILES.length) await self.skipWaiting();
  })());
});

/* 激活：清掉旧版本的缓存，立刻接管页面 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => !key.startsWith(VERSION))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/* 页面地址的 ?theme=... / ?preview=... 不应产生多份缓存 */
function normalizeRequest(request) {
  const url = new URL(request.url);
  if (request.mode === "navigate" || /\.(css|js|webmanifest|json|html)$/i.test(url.pathname) || url.pathname.endsWith("/")) {
    url.search = "";
    return new Request(url.href, { method: request.method, headers: request.headers });
  }
  return request;
}

/* 网络优先：成功了顺手把最新版存进缓存 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const key = normalizeRequest(request);
  try {
    const response = await fetch(request);
    if (response && response.ok) await cache.put(key, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(key);
    if (cached) return cached;
    throw error;
  }
}

/* 先缓存后更新：照片/音乐秒开，后台刷新，下次访问就是新版 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const key = normalizeRequest(request);
  const cached = await cache.match(key);
  const network = fetch(request)
    .then(async (response) => {
      if (response && response.ok) await cache.put(key, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // 只管自己网站的文件
  if (url.pathname.endsWith("/sw.js")) return;

  // 页面跳转 / 文档：网络优先
  if (request.mode === "navigate" || (request.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(networkFirst(request, CORE_CACHE));
    return;
  }

  // 样式、脚本、清单：网络优先，保证更新能到达
  if (/\.(css|js|webmanifest|json)$/i.test(url.pathname) || url.pathname.endsWith("/")) {
    event.respondWith(networkFirst(request, CORE_CACHE));
    return;
  }

  // 图片、音频、字体：先缓存后更新
  if (/\.(png|jpg|jpeg|webp|gif|svg|ico|wav|mp3|m4a|ogg|woff2?)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
  }
});
