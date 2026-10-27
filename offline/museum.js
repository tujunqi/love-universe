/* ==========================================================================
   我们的私人博物馆 · 离线版
   --------------------------------------------------------------------------
   ★★★ 新手只需要改下面 MUSEUM 这一大段，其他代码不用动 ★★★
   · 文本里可以用 {me} 和 {partner}，会自动替换成你们的名字
   · 日期格式："2023-05-20T20:13:00"
   · 照片放 media/photos/，视频放 media/videos/，语音放 media/voice/
   · 改完保存，双击「离线博物馆.html」或刷新浏览器即可
   ========================================================================== */

const MUSEUM = {
  /* ---------- 1. 基本信息 ---------- */
  names: {
    me: "阿星",
    partner: "小满"
  },

  // 在一起的准确时间
  startDate: "2023-05-20T20:13:00",

  // 每年纪念日
  anniversary: { month: 5, day: 20 },

  version: "离线版 · 2026.10 · 第 1 版",

  // 进入开馆封面时，是否自动播放背景音乐
  // 浏览器要求必须先有一次点击，所以是点击“推门进入”之后才响
  autoplayOnEnter: true,

  /* ---------- 2. 开馆封面 ---------- */
  cover: {
    image: "media/photos/cover-1.svg",
    kicker: "OUR PRIVATE MUSEUM",
    title: "我们的私人博物馆",
    subtitle: "仅接待两位观众",
    note: "请轻推门 · 馆内禁止赶时间",
    enter: "推门进入"
  },

  /* ---------- 3. 序厅 ---------- */
  hallIntro: "这里没有名画，也没有文物。只有一些被认真保存下来的普通日子：一顿饭、一次旅行、一场雨、一句没说完的话。它们不值钱，但对我们很重要。",

  // 镇馆之宝：选一张最有意义的照片
  feature: {
    photo: "media/photos/p13.svg",
    caption: "镇馆之宝 · 001 · 海边的落日",
    quote: "那天我们什么都没做，只是坐着，看太阳一点一点掉进海里。后来我才知道，那样的下午，一生也不会有很多次。",
    cite: "—— 馆长手记，2024.09.17"
  },

  /* ---------- 4. 照片长廊 ---------- */
  // src：图片路径；title：标题；date：日期；tag：筛选标签；alt：图片描述
  photos: [
    { src: "media/photos/p01.svg", title: "第一次一起看海", date: "2023.07.16", tag: "旅行", alt: "我们在海边的合照" },
    { src: "media/photos/p02.svg", title: "你笑起来的样子", date: "2023.06.03", tag: "日常", alt: "你笑起来的样子" },
    { src: "media/photos/p03.svg", title: "深夜散步", date: "2023.08.22", tag: "日常", alt: "夜晚一起散步" },
    { src: "media/photos/p04.svg", title: "一起做的晚饭", date: "2023.09.10", tag: "日常", alt: "一起做的晚饭" },
    { src: "media/photos/p05.svg", title: "咖啡馆的下午", date: "2023.10.04", tag: "日常", alt: "咖啡馆里的下午" },
    { src: "media/photos/p06.svg", title: "秋天的第一张合照", date: "2023.11.02", tag: "日常", alt: "秋天拍的合照" },
    { src: "media/photos/p07.svg", title: "第一次旅行", date: "2024.01.13", tag: "旅行", alt: "第一次旅行的照片" },
    { src: "media/photos/p08.svg", title: "雪落在你肩上", date: "2024.01.14", tag: "旅行", alt: "下雪时你肩上的雪" },
    { src: "media/photos/p09.svg", title: "生日蛋糕上的光", date: "2024.05.20", tag: "纪念日", alt: "生日蛋糕和烛光" },
    { src: "media/photos/p10.svg", title: "你拍的我", date: "2024.06.08", tag: "日常", alt: "你镜头里的我" },
    { src: "media/photos/p11.svg", title: "楼下的猫", date: "2024.07.21", tag: "日常", alt: "楼下偶遇的猫" },
    { src: "media/photos/p12.svg", title: "一起看的那场电影", date: "2024.08.30", tag: "日常", alt: "电影票和爆米花" },
    { src: "media/photos/p13.svg", title: "海边落日", date: "2024.09.17", tag: "风景", alt: "海边的落日" },
    { src: "media/photos/p14.svg", title: "雨天的伞", date: "2024.10.06", tag: "日常", alt: "雨里共撑一把伞" },
    { src: "media/photos/p15.svg", title: "一顿很慢的早餐", date: "2024.11.23", tag: "日常", alt: "周末慢慢吃的早餐" },
    { src: "media/photos/p16.svg", title: "圣诞树下的我们", date: "2024.12.25", tag: "纪念日", alt: "圣诞树下的合照" },
    { src: "media/photos/p17.svg", title: "凌晨的便利店", date: "2025.01.01", tag: "纪念日", alt: "跨年凌晨的便利店" },
    { src: "media/photos/p18.svg", title: "花开了", date: "2025.03.22", tag: "风景", alt: "春天开的花" },
    { src: "media/photos/p19.svg", title: "一起走过的路", date: "2025.05.20", tag: "纪念日", alt: "一起走过的路" },
    { src: "media/photos/p20.svg", title: "下一个普通的日子", date: "2025.08.09", tag: "日常", alt: "普通又珍贵的一天" }
  ],

  /* ---------- 5. 影音室 ---------- */
  // 视频：把 MP4 放进 media/videos/，然后照下面的格式登记
  // 没有视频就保持空数组 []，页面会显示“布展中”
  videos: [
    // {
    //   src: "media/videos/first-trip.mp4",
    //   poster: "media/photos/p07.svg",
    //   title: "第一次旅行",
    //   date: "2024.01.13",
    //   note: "在陌生城市醒来的第一个早上"
    // }
  ],

  // 语音：已放入两条示例语音，换成你们自己的录音即可
  voices: [
    {
      src: "media/voice/sample-01.wav",
      title: "示例语音 · 路过那家咖啡店",
      date: "2026.10",
      note: "把这条换成你们自己的语音"
    },
    {
      src: "media/voice/sample-02.wav",
      title: "示例语音 · 写给很多年以后",
      date: "2026.10",
      note: "支持 MP3 / WAV / M4A"
    }
  ],

  music: "media/audio/bgm.wav",

  /* ---------- 6. 回忆录 ---------- */
  // paragraphs 里：
  //   普通字符串 = 一段正文
  //   以 "> " 开头 = 引用
  //   "---" = 分隔线
  memoirs: [
    {
      title: "第一章 · 我们是怎么开始的",
      date: "2023.05.20",
      minutes: 3,
      paragraphs: [
        "那天晚上八点十三分，你发来一句：“那就在一起吧。”我盯着屏幕看了很久，久到手机自动暗下去，又亮起来。",
        "其实在那之前，我已经偷偷练习过很多次“如果她答应，我要怎么回”。可真的等到那一刻，我只回了一个“好”。",
        "后来你问我，为什么不多说两句。我说，怕说多了显得不够认真。你笑了很久，说：“你这个人，连高兴都很克制。”",
        "> 后来我才明白，喜欢一个人，不是把话说得多漂亮，而是从那天开始，所有关于未来的句子，都自动带上了“我们”。",
        "那天没有烟花，没有仪式，只有一盏没关的台灯，和两个在屏幕前傻笑的人。",
        "但就是从那一天起，普通的日子开始有了编号。"
      ]
    },
    {
      title: "第二章 · 第一次一起看海",
      date: "2023.07.16",
      minutes: 4,
      paragraphs: [
        "我们坐了很久的车。你在车上睡着了，头一点一点地往我肩上靠。我怕吵醒你，一动也不敢动，连呼吸都放轻。",
        "到海边的时候已经是下午。风很大，你的头发一直往脸上飞。你一边骂风，一边笑，说：“来都来了，拍一张。”",
        "那张照片其实拍得不好。光太亮，我的眼睛没睁开，你的头发也乱了。可我一直没舍得删。",
        "> 因为那是我第一次觉得，“以后”不是一个很远的词，而是可以和你一起坐车、一起吹风、一起把一张照片拍坏的具体事情。",
        "回程的路上，你说下次想去看雪。我说好。那时候我们还不知道，很多“下次”真的会来。"
      ]
    },
    {
      title: "第三章 · 一场没有赢家的吵架",
      date: "2024.03.09",
      minutes: 4,
      paragraphs: [
        "那次吵架的原因，现在已经想不起来了。大概是一件很小的事，小到如果发生在别人身上，我们都会劝一句“至于吗”。",
        "但我们就是都很委屈。你觉得我不说，我觉得你不懂。两个人在客厅里坐着，谁也不肯先开口。",
        "后来是你先去洗了碗。水声很大，我坐在沙发上，忽然觉得这个家安静得有点可怕。",
        "我走过去，站在你旁边，说了一句很笨的话：“要不，我们先不吵了，吃点东西吧。”",
        "你背对着我，过了一会儿才说：“我要加一个蛋。”",
        "> 那天我们谁也没有正式道歉。但从那以后，我记住了：比起赢，我更怕失去你。",
        "---",
        "如果以后还会吵，希望我们都能记得，先吃饭，再讲道理。"
      ]
    },
    {
      title: "第四章 · 一屋两人，三餐四季",
      date: "2024.11.23",
      minutes: 3,
      paragraphs: [
        "周末的早上，你总是比我起得晚。我先把水烧上，再去拉开一点窗帘，让光刚好落在你脚边。",
        "你迷迷糊糊地问我几点了。我说还早。你翻个身，又睡过去。",
        "那顿早餐吃了很久。煎蛋有点焦，面包烤过头了，咖啡也凉了。我们坐在桌边，聊一些没有结论的事。",
        "> 以前我以为浪漫是惊喜，是远方，是很大的场面。后来才知道，浪漫也可以是有人愿意陪你，把一顿早餐吃得毫无效率。",
        "吃完以后，你去洗碗，我去擦桌子。窗外有人在遛狗，楼下有小孩在笑。",
        "那是一个普通到不值得发朋友圈的上午。但我把它记了下来。"
      ]
    },
    {
      title: "第五章 · 第二次看海",
      date: "2024.09.17",
      minutes: 3,
      paragraphs: [
        "第二次去海边，我们都有了经验。带了外套，带了水，也带了可以坐很久的垫子。",
        "太阳落下去的时候，你靠在我肩上，说：“以后我们每年都来一次吧。”",
        "我说好。你又补了一句：“如果有一年没来，也不要紧。”",
        "我问为什么。你说：“因为重要的不是海，是我们还愿意一起计划明年。”",
        "> 那天的落日很慢。慢到我有足够的时间，把这句话记了很多年。",
        "后来我做了这个博物馆。镇馆之宝，就是那天拍的那张照片。"
      ]
    },
    {
      title: "第六章 · 写给还没到来的以后",
      date: "2026.10",
      minutes: 3,
      paragraphs: [
        "写这一章的时候，我们还不知道以后会怎样。会搬家吗？会换工作吗？会有新的家庭成员吗？",
        "我们只知道，今天的饭要吃什么，周末要不要去看那部电影，阳台上的那盆花是不是该浇水了。",
        "> 也许未来不会像我们想象的那样顺利。但如果可以，我希望我们还能像现在这样，遇到事情先坐下来，好好说。",
        "如果很多年以后，你打开了这座博物馆，希望你还记得：我们曾经很认真地对待过一些很小的事情。",
        "那些事情没有让我们变得了不起，只是让我们成为了“我们”。",
        "---",
        "下一章，留给你来写。"
      ]
    }
  ],

  /* ---------- 7. 馆藏文档 ---------- */
  // 把 PDF / DOCX / TXT 放进 media/memoirs/，再照格式登记
  documents: [
    {
      src: "media/memoirs/给未来读者.txt",
      title: "给未来读者",
      note: "如果网页打不开，先读这一页",
      type: "TXT",
      filename: "给未来读者.txt"
    }
  ],

  /* ---------- 8. 时间胶囊 ---------- */
  capsule: {
    openDate: "2035-05-20T20:13:00",
    password: "0520",
    kicker: "SEALED UNTIL 2035",
    title: "十年后，再一起打开",
    intro: "这封信写在 2026 年的秋天。我们约定，等到 2035 年 5 月 20 日，再一起读。在那之前，只许看倒计时。",
    letterTitle: "写给 2035 年的我们",
    paragraphs: [
      "展信好。",
      "写这封信的时候，我们在一起三年多。住在一个不算大的房子里，阳台上养了一盆总是忘记浇水的花。",
      "我不知道十年后的你们过得怎么样。也许已经结婚，也许有了孩子，也许搬去了另一座城市，也许正在经历一段很难的日子。",
      "如果是后者，我想先说一句：没关系。你们已经一起走过很远的路了。",
      "希望你们还记得，2026 年的这个秋天，我们曾经认真地做过一座小小的博物馆。里面没有值钱的东西，只有一些被好好保存的普通日子。",
      "希望你们还愿意一起吃饭，一起散步，一起为一件很小的事情笑很久。",
      "如果有一天，你们觉得生活变得很重，就回来看看这些照片。看看我们是怎么从一句“那就在一起吧”，走到今天的。",
      "最后，替现在的我们抱一抱未来的你们。",
      "下一个十年，也请多多关照。"
    ],
    sign: "—— 2026 年的 {me} 和 {partner}"
  }
};

/* ==========================================================================
   以下为程序逻辑。没有代码基础的话，可以跳过。
   ========================================================================== */

/* ---------- 小工具 ---------- */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const pad2 = (value) => String(value).padStart(2, "0");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function fillName(text) {
  return String(text)
    .replaceAll("{me}", MUSEUM.names.me)
    .replaceAll("{partner}", MUSEUM.names.partner);
}

function formatDate(date) {
  return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`;
}

function formatClock(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "--:--";
  const total = Math.floor(seconds);
  return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
}

let toastTimer = null;
function toast(message, duration = 2600) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), duration);
}

/* ---------- 本地存储：只存“是否听过歌”“胶囊是否打开” ---------- */
const store = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(`museum.v1.${key}`);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`museum.v1.${key}`, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }
};

const DAY_MS = 86400000;

function daysTogether() {
  const start = new Date(MUSEUM.startDate);
  if (Number.isNaN(start.getTime())) return 1;
  const diff = Date.now() - start.getTime();
  return Math.max(1, Math.floor(diff / DAY_MS) + 1);
}

/* ==========================================================================
   1. 开馆封面
   ========================================================================== */
function initBoot() {
  const boot = $("#boot");
  const title = $("#bootTitle");
  const subtitle = $("#bootSubtitle");
  const note = $("#bootNote");
  const enterText = $("#bootEnterText");
  const photo = $("#bootPhoto");
  const kicker = $("#bootKicker");
  const est = $("#bootEst");
  const bootDate = $("#bootDate");

  if (title) title.textContent = MUSEUM.cover.title;
  if (subtitle) subtitle.textContent = MUSEUM.cover.subtitle;
  if (note) note.textContent = MUSEUM.cover.note;
  if (enterText) enterText.textContent = MUSEUM.cover.enter;
  if (kicker) kicker.textContent = MUSEUM.cover.kicker;
  if (photo) photo.style.backgroundImage = `url("${MUSEUM.cover.image}")`;

  const start = new Date(MUSEUM.startDate);
  if (est && !Number.isNaN(start.getTime())) {
    est.textContent = `EST. ${start.getFullYear()}.${pad2(start.getMonth() + 1)}.${pad2(start.getDate())}`;
  }
  if (bootDate) bootDate.textContent = formatDate(new Date());

  // 让封面照片慢慢推近，像走进展厅
  setTimeout(() => boot?.classList.add("is-ready"), 120);

  const enter = () => {
    if (!boot || boot.classList.contains("is-leaving")) return;
    boot.classList.add("is-leaving");
    document.body.classList.remove("is-booting");
    $("#museum")?.classList.add("is-open");
    $("#museum")?.setAttribute("aria-hidden", "false");
    if (MUSEUM.autoplayOnEnter) playMusic(true);
    window.setTimeout(() => {
      boot.style.display = "none";
    }, 1200);
    // 进入后把焦点交给序厅标题，方便键盘用户
    const hallTitle = $(".hall-title");
    if (hallTitle) {
      hallTitle.setAttribute("tabindex", "-1");
      hallTitle.focus({ preventScroll: true });
    }
  };

  $("#enterMuseum")?.addEventListener("click", enter);

  // 调试用：?view=hall 可以直接跳过封面；?view=gallery / capsule 进入后跳到对应展厅
  const params = new URLSearchParams(location.search);
  const view = params.get("view");
  if (params.get("skipboot") === "1" || view) {
    boot?.classList.add("is-leaving");
    document.body.classList.remove("is-booting");
    $("#museum")?.classList.add("is-open");
    $("#museum")?.setAttribute("aria-hidden", "false");
    if (boot) boot.style.display = "none";
    if (view && view !== "hall") {
      setTimeout(() => {
        document.getElementById(view)?.scrollIntoView({ behavior: "auto", block: "start" });
      }, 250);
    }
  }
}

/* ==========================================================================
   2. 背景音乐
   ========================================================================== */
let music = null;
let musicWanted = false;

function initMusic() {
  const buttons = [$("#musicToggle"), $("#musicCardBtn")].filter(Boolean);
  if (!MUSEUM.music) {
    buttons.forEach((button) => button.setAttribute("disabled", "disabled"));
    return;
  }

  try {
    music = new Audio(MUSEUM.music);
    music.loop = true;
    music.preload = "auto";
    music.volume = 0.24;
  } catch (error) {
    music = null;
  }

  if (!music) {
    buttons.forEach((button) => {
      button.addEventListener("click", () => toast("这个浏览器暂时不能播放背景音乐。"));
    });
    return;
  }

  const status = $("#musicStatus");
  const fill = $("#musicFill");

  function setUI(playing) {
    buttons.forEach((button) => {
      button.classList.toggle("is-playing", playing);
      button.setAttribute("aria-pressed", String(playing));
      button.setAttribute("aria-label", playing ? "暂停背景音乐" : "播放背景音乐");
      button.title = playing ? "暂停背景音乐" : "播放背景音乐";
    });
    if (status) {
      status.textContent = playing
        ? "正在播放 · 音量已调低"
        : (musicWanted ? "已暂停 · 点击继续" : "点击播放 · 音量已调低");
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (music.paused) {
        playMusic(false);
      } else {
        musicWanted = false;
        music.pause();
        setUI(false);
      }
    });
  });

  music.addEventListener("timeupdate", () => {
    if (!fill || !music.duration) return;
    fill.style.width = `${(music.currentTime / music.duration) * 100}%`;
  });

  music.addEventListener("play", () => setUI(true));
  music.addEventListener("pause", () => setUI(false));
  music.addEventListener("error", () => {
    setUI(false);
    if (musicWanted) {
      toast("没有找到背景音乐。把 bgm.mp3 放进 media/audio/，并检查 museum.js 里的路径。", 4200);
    }
  });

  // 页面切到后台时把音量降下来，回来再恢复
  document.addEventListener("visibilitychange", () => {
    if (!music || music.paused) return;
    music.volume = document.hidden ? 0.06 : 0.24;
  });
}

function playMusic(fromBoot = false) {
  if (!music) return;
  musicWanted = true;
  const promise = music.play();
  if (promise && typeof promise.catch === "function") {
    promise.catch(() => {
      musicWanted = false;
      if (!fromBoot) {
        toast("音乐没能播放：请确认 media/audio/ 里的文件存在，或再点一次按钮。", 4200);
      }
    });
  }
}

/* ==========================================================================
   3. 序厅数据
   ========================================================================== */
function initHall() {
  const days = daysTogether();
  const years = (days / 365.2425).toFixed(1);

  if ($("#statDays")) $("#statDays").textContent = days.toLocaleString("zh-CN");
  if ($("#statPhotos")) $("#statPhotos").textContent = String(MUSEUM.photos.length);
  if ($("#statChapters")) $("#statChapters").textContent = String(MUSEUM.memoirs.length);
  if ($("#statYears")) $("#statYears").textContent = years;
  if ($("#hallIntro")) $("#hallIntro").textContent = MUSEUM.hallIntro;

  const feature = MUSEUM.feature || {};
  const image = $("#featurePhoto");
  if (image && feature.photo) {
    image.src = feature.photo;
    image.alt = feature.caption || "镇馆之宝";
    image.addEventListener("error", () => {
      image.hidden = true;
      const parent = image.parentElement;
      if (parent) {
        const missing = document.createElement("div");
        missing.className = "gallery-missing";
        missing.textContent = "镇馆之宝暂时缺席。把照片放进 media/photos/ 并检查 museum.js 的路径。";
        parent.appendChild(missing);
      }
    }, { once: true });
  }
  if ($("#featureCaption")) $("#featureCaption").textContent = feature.caption || "";
  if ($("#featureQuote")) $("#featureQuote").textContent = fillName(feature.quote || "");
  if ($("#featureCite")) $("#featureCite").textContent = feature.cite || "";
}

/* ==========================================================================
   4. 照片长廊 + 大图查看器
   ========================================================================== */
let visiblePhotos = [];
let lightboxIndex = 0;
let lastFocused = null;

function initGallery() {
  const grid = $("#galleryGrid");
  const filterBar = $("#galleryFilters");
  if (!grid) return;

  const tags = ["全部", ...new Set(MUSEUM.photos.map((photo) => photo.tag).filter(Boolean))];
  let activeTag = "全部";

  if (filterBar) {
    tags.forEach((tag) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-btn" + (tag === "全部" ? " is-active" : "");
      button.textContent = tag;
      button.addEventListener("click", () => {
        activeTag = tag;
        $$(".filter-btn", filterBar).forEach((item) => item.classList.toggle("is-active", item === button));
        renderPhotos();
      });
      filterBar.appendChild(button);
    });
  }

  function renderPhotos() {
    visiblePhotos = activeTag === "全部"
      ? MUSEUM.photos.slice()
      : MUSEUM.photos.filter((photo) => photo.tag === activeTag);

    grid.replaceChildren();
    if ($("#galleryCount")) {
      $("#galleryCount").textContent = `${pad2(visiblePhotos.length)} 件藏品`;
    }

    visiblePhotos.forEach((photo, index) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "gallery-item" + (index % 5 < 2 ? " is-wide" : "");
      item.style.animationDelay = `${Math.min(index * 28, 260)}ms`;
      item.setAttribute("aria-label", `打开照片：${photo.title}`);

      const frame = document.createElement("span");
      frame.className = "gallery-frame";

      const img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.alt || photo.title;
      img.loading = "lazy";
      img.decoding = "async";

      img.addEventListener("error", () => {
        frame.replaceChildren();
        const missing = document.createElement("span");
        missing.className = "gallery-missing";
        missing.textContent = "照片未找到\n请检查 media/photos/ 里的文件名";
        frame.appendChild(missing);
      }, { once: true });

      const hover = document.createElement("span");
      hover.className = "gallery-hover";
      hover.innerHTML = `<span>VIEW · ${pad2(index + 1)}</span>`;

      frame.append(img, hover);

      const caption = document.createElement("span");
      caption.className = "gallery-caption";
      const title = document.createElement("b");
      title.textContent = photo.title;
      const date = document.createElement("span");
      date.textContent = photo.date || "";
      caption.append(title, date);

      item.append(frame, caption);
      item.addEventListener("click", () => openLightbox(index));
      grid.appendChild(item);
    });

    if (!visiblePhotos.length) {
      const empty = document.createElement("p");
      empty.className = "empty-hall";
      empty.textContent = "这个标签下还没有照片。";
      grid.appendChild(empty);
    }
  }

  renderPhotos();

  // 大图查看器
  const lightbox = $("#lightbox");
  const image = $("#lightboxImage");
  const title = $("#lightboxTitle");
  const meta = $("#lightboxMeta");
  const count = $("#lightboxCount");

  function renderLightbox() {
    const photo = visiblePhotos[lightboxIndex];
    if (!photo) return;
    image.src = photo.src;
    image.alt = photo.alt || photo.title;
    title.textContent = photo.title;
    meta.textContent = photo.date || "";
    count.textContent = `${pad2(lightboxIndex + 1)} / ${pad2(visiblePhotos.length)}`;
  }

  function openLightbox(index) {
    lightboxIndex = index;
    lastFocused = document.activeElement;
    renderLightbox();
    lightbox?.classList.add("is-open");
    lightbox?.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    $("#lightboxClose")?.focus({ preventScroll: true });
  }

  function closeLightbox() {
    lightbox?.classList.remove("is-open");
    lightbox?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus({ preventScroll: true });
    }
  }

  function stepLightbox(delta) {
    if (!visiblePhotos.length) return;
    lightboxIndex = (lightboxIndex + delta + visiblePhotos.length) % visiblePhotos.length;
    renderLightbox();
  }

  $("#lightboxClose")?.addEventListener("click", closeLightbox);
  $("#lightboxPrev")?.addEventListener("click", () => stepLightbox(-1));
  $("#lightboxNext")?.addEventListener("click", () => stepLightbox(1));
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox?.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") stepLightbox(-1);
    if (event.key === "ArrowRight") stepLightbox(1);
  });

  // 手机滑动
  let touchStartX = null;
  lightbox?.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0]?.clientX ?? null;
  }, { passive: true });
  lightbox?.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;
    if (Math.abs(delta) > 50) stepLightbox(delta > 0 ? -1 : 1);
    touchStartX = null;
  }, { passive: true });
}

/* ==========================================================================
   5. 影音室
   ========================================================================== */
function initScreen() {
  const videoList = $("#videoList");
  const videoEmpty = $("#videoEmpty");
  if ($("#videoCount")) {
    $("#videoCount").textContent = `${pad2(MUSEUM.videos.length)} 段`;
  }

  if (!MUSEUM.videos.length) {
    if (videoEmpty) videoEmpty.hidden = false;
  } else if (videoList) {
    MUSEUM.videos.forEach((video) => {
      const card = document.createElement("article");
      card.className = "video-card";

      const poster = document.createElement("div");
      poster.className = "video-poster";

      if (video.poster) {
        const img = document.createElement("img");
        img.src = video.poster;
        img.alt = video.title;
        img.loading = "lazy";
        poster.appendChild(img);
      }

      const play = document.createElement("button");
      play.type = "button";
      play.setAttribute("aria-label", `播放视频：${video.title}`);
      play.innerHTML = "<span>▶</span>";
      poster.appendChild(play);

      const info = document.createElement("div");
      info.className = "video-info";
      const h = document.createElement("h4");
      h.textContent = video.title;
      const note = document.createElement("p");
      note.textContent = video.note || "";
      const time = document.createElement("time");
      time.textContent = video.date || "";
      info.append(h, note, time);

      card.append(poster, info);
      videoList.appendChild(card);

      play.addEventListener("click", () => {
        // 同一个时间只保留一个播放器
        $$(".video-player-wrap", videoList).forEach((el) => el.remove());
        const wrap = document.createElement("div");
        wrap.className = "video-player-wrap";
        const player = document.createElement("video");
        player.controls = true;
        player.autoplay = true;
        player.playsInline = true;
        player.preload = "metadata";
        player.poster = video.poster || "";
        player.src = video.src;
        player.addEventListener("error", () => {
          wrap.remove();
          toast("这段视频没有找到或格式不支持。请检查 media/videos/ 里的文件。", 4200);
        }, { once: true });
        wrap.appendChild(player);
        card.after(wrap);
      });
    });
  }

  // 语音
  const voiceList = $("#voiceList");
  const voiceEmpty = $("#voiceEmpty");
  if ($("#voiceCount")) {
    $("#voiceCount").textContent = `${pad2(MUSEUM.voices.length)} 条`;
  }

  if (!MUSEUM.voices.length) {
    if (voiceEmpty) voiceEmpty.hidden = false;
    return;
  }

  let currentAudio = null;
  let currentItem = null;

  MUSEUM.voices.forEach((voice) => {
    const item = document.createElement("div");
    item.className = "voice-item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "voice-play";
    button.setAttribute("aria-label", `播放语音：${voice.title}`);
    button.textContent = "▶";

    const copy = document.createElement("div");
    copy.className = "voice-copy";
    const title = document.createElement("b");
    title.textContent = voice.title;
    const note = document.createElement("span");
    note.textContent = [voice.date, voice.note].filter(Boolean).join(" · ");
    copy.append(title, note);

    const duration = document.createElement("span");
    duration.className = "voice-duration";
    duration.textContent = "--:--";

    item.append(button, copy, duration);
    voiceList?.appendChild(item);

    const audio = new Audio();
    audio.preload = "metadata";
    audio.src = voice.src;

    audio.addEventListener("loadedmetadata", () => {
      duration.textContent = formatClock(audio.duration);
    });

    audio.addEventListener("ended", () => {
      button.textContent = "▶";
      item.classList.remove("is-playing");
      button.setAttribute("aria-label", `播放语音：${voice.title}`);
    });

    audio.addEventListener("error", () => {
      duration.textContent = "--:--";
      toast("这条语音没有找到。请检查 media/voice/ 里的文件。", 4200);
    });

    button.addEventListener("click", () => {
      if (currentAudio && currentAudio !== audio) {
        currentAudio.pause();
        if (currentItem) {
          currentItem.classList.remove("is-playing");
          const oldButton = $(".voice-play", currentItem);
          if (oldButton) oldButton.textContent = "▶";
        }
      }

      if (audio.paused) {
        audio.play().then(() => {
          button.textContent = "❚❚";
          item.classList.add("is-playing");
          button.setAttribute("aria-label", `暂停语音：${voice.title}`);
        }).catch(() => {
          toast("这条语音没能播放。请确认文件和格式。", 3600);
        });
        currentAudio = audio;
        currentItem = item;
      } else {
        audio.pause();
        button.textContent = "▶";
        item.classList.remove("is-playing");
        button.setAttribute("aria-label", `播放语音：${voice.title}`);
      }
    });
  });
}

/* ==========================================================================
   6. 回忆录
   ========================================================================== */
let chapterIndex = 0;

function initMemoirs() {
  const toc = $("#memoirToc");
  const body = $("#chapterBody");
  if (!toc || !body) return;

  if ($("#memoirCount")) {
    $("#memoirCount").textContent = `${pad2(MUSEUM.memoirs.length)} 章`;
  }

  const buttons = MUSEUM.memoirs.map((chapter, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "toc-item";
    const number = document.createElement("span");
    number.textContent = `CHAPTER ${pad2(index + 1)}`;
    const title = document.createElement("b");
    title.textContent = chapter.title;
    button.append(number, title);
    button.addEventListener("click", () => renderChapter(index));
    toc.appendChild(button);
    return button;
  });

  function renderChapter(index) {
    chapterIndex = Math.max(0, Math.min(MUSEUM.memoirs.length - 1, index));
    const chapter = MUSEUM.memoirs[chapterIndex];
    if (!chapter) return;

    buttons.forEach((button, i) => button.classList.toggle("is-active", i === chapterIndex));

    if ($("#chapterKicker")) $("#chapterKicker").textContent = `CHAPTER ${pad2(chapterIndex + 1)} / ${pad2(MUSEUM.memoirs.length)}`;
    if ($("#chapterTitle")) $("#chapterTitle").textContent = chapter.title;
    if ($("#chapterMeta")) {
      $("#chapterMeta").textContent = [chapter.date, chapter.minutes ? `约 ${chapter.minutes} 分钟` : ""].filter(Boolean).join(" · ");
    }

    body.replaceChildren();
    (chapter.paragraphs || []).forEach((paragraph) => {
      const text = fillName(paragraph);
      if (text.startsWith("> ")) {
        const quote = document.createElement("p");
        quote.className = "chapter-quote";
        quote.textContent = text.slice(2);
        body.appendChild(quote);
      } else if (text.trim() === "---") {
        const hr = document.createElement("hr");
        hr.className = "chapter-gap";
        body.appendChild(hr);
      } else {
        const p = document.createElement("p");
        p.textContent = text;
        body.appendChild(p);
      }
    });

    const prev = $("#prevChapter");
    const next = $("#nextChapter");
    if (prev) prev.disabled = chapterIndex === 0;
    if (next) next.disabled = chapterIndex === MUSEUM.memoirs.length - 1;
  }

  renderChapter(0);

  $("#prevChapter")?.addEventListener("click", () => renderChapter(chapterIndex - 1));
  $("#nextChapter")?.addEventListener("click", () => renderChapter(chapterIndex + 1));

  // 馆藏文档
  const docList = $("#documentList");
  if ($("#documentCount")) {
    $("#documentCount").textContent = `${pad2(MUSEUM.documents.length)} 份`;
  }
  if (docList) {
    if (!MUSEUM.documents.length) {
      const empty = document.createElement("p");
      empty.className = "doc-note";
      empty.textContent = "暂无登记文档。把 PDF 放进 media/memoirs/，再在 museum.js 里登记。";
      docList.appendChild(empty);
    } else {
      MUSEUM.documents.forEach((doc) => {
        const link = document.createElement("a");
        link.className = "document-item";
        link.href = doc.src;
        link.target = "_blank";
        link.rel = "noopener";
        // PDF / TXT 浏览器能直接展示；DOCX 和内嵌成 data: 的文件让浏览器下载
        const docType = (doc.type || "").toLowerCase();
        const isEmbedded = /^data:/i.test(doc.src || "");
        if (isEmbedded || !["pdf", "txt"].includes(docType)) {
          link.setAttribute("download", doc.filename || "");
        }

        const icon = document.createElement("span");
        icon.className = "doc-icon";
        icon.textContent = doc.type || "FILE";

        const copy = document.createElement("span");
        copy.className = "doc-copy";
        const title = document.createElement("b");
        title.textContent = doc.title;
        const note = document.createElement("span");
        note.textContent = doc.note || "";
        copy.append(title, note);

        link.append(icon, copy);
        docList.appendChild(link);
      });
    }
  }
}

/* ==========================================================================
   7. 时间胶囊
   ========================================================================== */
let capsuleTimer = null;

function initCapsule() {
  const config = MUSEUM.capsule;
  if (!config) return;

  if ($("#capsuleTitle")) $("#capsuleTitle").textContent = config.title;
  if ($("#capsuleIntro")) $("#capsuleIntro").textContent = config.intro;
  if ($("#capsuleSign")) $("#capsuleSign").textContent = fillName(config.sign || "");
  if ($("#capsuleLetterTitle")) $("#capsuleLetterTitle").textContent = config.letterTitle;

  const letterBody = $("#capsuleLetterBody");
  if (letterBody) {
    config.paragraphs.forEach((paragraph) => {
      const p = document.createElement("p");
      p.textContent = fillName(paragraph);
      letterBody.appendChild(p);
    });
  }

  const target = new Date(config.openDate);
  const form = $("#capsuleForm");
  const error = $("#capsuleError");
  const countdown = $("#capsuleCountdown");
  const letter = $("#capsuleLetter");
  const params = new URLSearchParams(location.search);
  const preview = params.get("preview") === "capsule";

  function unlock(persist = true) {
    if (persist) store.set("capsuleOpen", true);
    if (countdown) countdown.hidden = true;
    if (form) form.hidden = true;
    if (letter) letter.hidden = false;
    if (capsuleTimer) clearInterval(capsuleTimer);
  }

  function updateCountdown() {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) {
      unlock(false);
      toast("时间到了。胶囊自己打开了。", 4200);
      return;
    }
    const days = Math.floor(diff / DAY_MS);
    const hours = Math.floor((diff % DAY_MS) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    if ($("#capDays")) $("#capDays").textContent = String(days).padStart(4, "0");
    if ($("#capHours")) $("#capHours").textContent = pad2(hours);
    if ($("#capMins")) $("#capMins").textContent = pad2(mins);
    if ($("#capSecs")) $("#capSecs").textContent = pad2(secs);
  }

  if (preview || store.get("capsuleOpen", false) || (!Number.isNaN(target.getTime()) && Date.now() >= target.getTime())) {
    unlock(false);
  } else {
    updateCountdown();
    capsuleTimer = setInterval(updateCountdown, 1000);
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#capsulePassword");
    const value = (input?.value || "").trim();
    if (value === String(config.password)) {
      unlock(true);
      toast("胶囊打开了。慢慢读。", 3200);
    } else {
      if (error) error.textContent = "密码不对。再想想那个日子。";
      if (input) {
        input.value = "";
        input.focus();
      }
    }
  });
}

/* ==========================================================================
   8. 导航、滚动进度、入场动画
   ========================================================================== */
function initNavigation() {
  const topbar = $("#topbar");
  const progress = $("#scrollProgress");
  const links = $$(".nav-link");
  const sections = ["hall", "gallery", "screen", "memoirs", "capsule", "guide"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function onScroll() {
    const y = window.scrollY;
    topbar?.classList.toggle("is-scrolled", y > 20);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${max > 0 ? Math.min(100, (y / max) * 100) : 0}%`;

    let activeId = "hall";
    sections.forEach((section) => {
      if (y + window.innerHeight * 0.32 >= section.offsetTop) activeId = section.id;
    });
    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const menuButton = $("#menuButton");
  menuButton?.addEventListener("click", () => {
    const open = topbar?.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(Boolean(open)));
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      topbar?.classList.remove("is-open");
      menuButton?.setAttribute("aria-expanded", "false");
    });
  });

  $("#guideButton")?.addEventListener("click", () => {
    document.getElementById("guide")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });

  $("#backToTop")?.addEventListener("click", () => {
    document.getElementById("hall")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });
}

function initReveal() {
  const items = $$(".reveal");
  if (!items.length) return;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  items.forEach((item) => observer.observe(item));
}

/* ==========================================================================
   9. 背景微尘
   ========================================================================== */
function initDust() {
  const canvas = $("#dustCanvas");
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let particles = [];
  let raf = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(70, Math.floor(width / 26));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.3 + 0.3,
      vx: (Math.random() - 0.5) * 0.08,
      vy: -Math.random() * 0.12 - 0.02,
      a: Math.random() * 0.35 + 0.08
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(214, 186, 133, ${p.a})`;
      ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  }

  resize();
  draw();

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      cancelAnimationFrame(raf);
      draw();
    }
  });
}

/* ==========================================================================
   10. 姓名、页脚、版本
   ========================================================================== */
function initIdentity() {
  const map = {
    brandMe: MUSEUM.names.me.charAt(0),
    brandPartner: MUSEUM.names.partner.charAt(0),
    brandTitle: MUSEUM.cover.title,
    guideMe: MUSEUM.names.me,
    guidePartner: MUSEUM.names.partner,
    footerMe: MUSEUM.names.me,
    footerPartner: MUSEUM.names.partner,
    guideVersion: MUSEUM.version
  };

  Object.entries(map).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
}

/* ==========================================================================
   11. 启动
   ========================================================================== */
function init() {
  initIdentity();
  initBoot();
  initMusic();
  initHall();
  initGallery();
  initScreen();
  initMemoirs();
  initCapsule();
  initNavigation();
  initReveal();
  initDust();
}

document.addEventListener("DOMContentLoaded", init);
