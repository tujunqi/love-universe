/* ==========================================================================
   我们的恋爱纪念宇宙 · 全部交互逻辑
   --------------------------------------------------------------------------
   ★★★ 新手只需要改下面这一大段 CONFIG，其他代码不用动 ★★★
   · 文本里可以用 {me} 和 {partner} 两个占位符，会自动替换成你们的名字
   · 日期格式统一为 "YYYY-MM-DDTHH:mm:ss"，例如 "2023-05-20T20:13:00"
   · 照片建议放在 assets/photos/ 里，文件名用英文或数字，避免特殊符号
   · 改完保存，刷新浏览器就能看到效果
   ========================================================================== */

const CONFIG = {
  /* ---------- 1. 你们是谁、什么时候在一起 ---------- */
  names: {
    me: "阿星",          // 你的名字（会出现在封面、页脚、信末）
    partner: "小满"      // 对方的名字（会出现在封面、生日彩蛋）
  },

  // 在一起的准确时间：年月日 + T + 时:分:秒（24 小时制）
  // 例：2023 年 5 月 20 日晚上 8 点 13 分 → "2023-05-20T20:13:00"
  startDate: "2023-05-20T20:13:00",

  // 每年的纪念日：月份 / 日期。一般就是在一起的月份和日期
  anniversary: {
    month: 5,
    day: 20
  },

  // 对方生日：格式 "MM-DD"（月-日）。生日当天打开网站会自动弹出祝福
  // 不想启用就把 monthDay 改成空字符串 ""
  birthday: {
    monthDay: "10-16",
    title: "生日快乐，我最喜欢的人",
    message: "今天世界又多爱你了一年，而我也一样。愿新的一岁，仍然有热汤、好觉、明亮的天气，和一个永远站在你这边的人。"
  },

  // 页脚隐藏信的密码（只是制造惊喜，不是真正的加密，请注意）
  secretPassword: "0520",

  // 默认皮肤："rose" 温柔粉 / "night" 夜空蓝 / "retro" 复古棕
  defaultTheme: "rose",

  /* ---------- 2. 声音与隐藏视频 ---------- */
  // 背景音乐：换成你们的歌时，把 mp3 放进 assets/music/，再把这里改成文件名
  music: "assets/music/bgm.wav",

  // 隐藏视频：把视频放进 assets/video/，文件名一致即可；没有就保留这个路径
  secretVideo: "assets/video/secret.mp4",

  /* ---------- 3. 封面 ---------- */
  // 封面专属情话，建议写一句只有你们懂的话
  coverQuote: "日子是普通的，和你在一起的那部分，闪闪发光。",

  // 封面背景，会自动轮播；换成你们的合照（建议横图，宽度 1600px 以上）
  coverSlides: [
    { src: "assets/photos/cover-1.svg" },
    { src: "assets/photos/cover-2.svg" },
    { src: "assets/photos/cover-3.svg" }
  ],

  /* ---------- 4. 照片墙（预置 100 个瞬间，全部可以在页面「⚙ 设置」里改） ---------- */
  // src：照片路径；title：照片下方的小字；date：显示日期；alt：给读屏软件的描述
  // 最简单的替换方法：不用改代码！点开网站右上角 ⚙ 设置，或把照片直接拖到相框上。
  // 想用代码改：把你们的照片改名成 p01.jpg、p02.jpg……放进 assets/photos/，
  // 然后把下面每一行的 .svg 改成 .jpg（或 .png / .webp）
  photos: [
    { src: "assets/photos/p01.svg", title: "第一次一起看海", date: "2023.07.16", alt: "我们在海边的合照" },
    { src: "assets/photos/p02.svg", title: "你笑起来的样子", date: "2023.06.03", alt: "你笑起来的样子" },
    { src: "assets/photos/p03.svg", title: "深夜散步", date: "2023.08.22", alt: "夜晚一起散步" },
    { src: "assets/photos/p04.svg", title: "一起做的晚饭", date: "2023.09.10", alt: "一起做的晚饭" },
    { src: "assets/photos/p05.svg", title: "咖啡馆的下午", date: "2023.10.04", alt: "咖啡馆里的下午" },
    { src: "assets/photos/p06.svg", title: "秋天的第一张合照", date: "2023.11.02", alt: "秋天拍的合照" },
    { src: "assets/photos/p07.svg", title: "第一次旅行", date: "2024.01.13", alt: "第一次旅行的照片" },
    { src: "assets/photos/p08.svg", title: "雪落在你肩上", date: "2024.01.14", alt: "下雪时你肩上的雪" },
    { src: "assets/photos/p09.svg", title: "生日蛋糕上的光", date: "2024.05.20", alt: "生日蛋糕和烛光" },
    { src: "assets/photos/p10.svg", title: "你拍的我", date: "2024.06.08", alt: "你镜头里的我" },
    { src: "assets/photos/p11.svg", title: "楼下的猫", date: "2024.07.21", alt: "楼下偶遇的猫" },
    { src: "assets/photos/p12.svg", title: "一起看的那场电影", date: "2024.08.30", alt: "电影票和爆米花" },
    { src: "assets/photos/p13.svg", title: "海边落日", date: "2024.09.17", alt: "海边的落日" },
    { src: "assets/photos/p14.svg", title: "雨天的伞", date: "2024.10.06", alt: "雨里共撑一把伞" },
    { src: "assets/photos/p15.svg", title: "一顿很慢的早餐", date: "2024.11.23", alt: "周末慢慢吃的早餐" },
    { src: "assets/photos/p16.svg", title: "圣诞树下的我们", date: "2024.12.25", alt: "圣诞树下的合照" },
    { src: "assets/photos/p17.svg", title: "凌晨的便利店", date: "2025.01.01", alt: "跨年凌晨的便利店" },
    { src: "assets/photos/p18.svg", title: "花开了", date: "2025.03.22", alt: "春天开的花" },
    { src: "assets/photos/p19.svg", title: "一起走过的路", date: "2025.05.20", alt: "一起走过的路" },
    { src: "assets/photos/p20.svg", title: "下一个普通的日子", date: "2025.08.09", alt: "普通又珍贵的一天" },
    { src: "assets/photos/p21.svg", title: "三分糖的奶茶", date: "2023.05.27", alt: "一起喝的奶茶" },
    { src: "assets/photos/p22.svg", title: "你来接我下班", date: "2023.06.10", alt: "下班路上的重逢" },
    { src: "assets/photos/p23.svg", title: "菜市场的早晨", date: "2023.06.24", alt: "一起买菜的早晨" },
    { src: "assets/photos/p24.svg", title: "拼了一晚的拼图", date: "2023.07.08", alt: "摊了满桌的拼图" },
    { src: "assets/photos/p25.svg", title: "游乐场的摩天轮", date: "2023.07.29", alt: "摩天轮上的风景" },
    { src: "assets/photos/p26.svg", title: "你学吉他的第三天", date: "2023.08.05", alt: "抱着吉他的你" },
    { src: "assets/photos/p27.svg", title: "书店里并排坐", date: "2023.08.19", alt: "书店里一起看书" },
    { src: "assets/photos/p28.svg", title: "一根分两半的雪糕", date: "2023.08.26", alt: "分享同一根雪糕" },
    { src: "assets/photos/p29.svg", title: "第一次一起看日出", date: "2023.09.16", alt: "清晨的日出" },
    { src: "assets/photos/p30.svg", title: "公园长椅上的下午", date: "2023.09.23", alt: "公园长椅" },
    { src: "assets/photos/p31.svg", title: "市集上淘到的杯子", date: "2023.10.21", alt: "一起淘的杯子" },
    { src: "assets/photos/p32.svg", title: "冬天的第一顿火锅", date: "2023.11.11", alt: "冒着热气的火锅" },
    { src: "assets/photos/p33.svg", title: "一起挑的圣诞树", date: "2023.12.10", alt: "挑选圣诞树" },
    { src: "assets/photos/p34.svg", title: "跨年倒数那一刻", date: "2023.12.31", alt: "跨年倒数" },
    { src: "assets/photos/p35.svg", title: "新年第一张合照", date: "2024.01.01", alt: "新年合照" },
    { src: "assets/photos/p36.svg", title: "除夕一起包的饺子", date: "2024.02.09", alt: "一起包的饺子" },
    { src: "assets/photos/p37.svg", title: "情人节的小票根", date: "2024.02.14", alt: "情人节的票根" },
    { src: "assets/photos/p38.svg", title: "绿植发芽了", date: "2024.03.02", alt: "刚发芽的绿植" },
    { src: "assets/photos/p39.svg", title: "春天放的风筝", date: "2024.03.30", alt: "放风筝" },
    { src: "assets/photos/p40.svg", title: "第一次一起爬山", date: "2024.04.13", alt: "山顶的合照" },
    { src: "assets/photos/p41.svg", title: "看展的那个下午", date: "2024.04.27", alt: "美术馆看展" },
    { src: "assets/photos/p42.svg", title: "五月的风", date: "2024.05.01", alt: "五月的风" },
    { src: "assets/photos/p43.svg", title: "纪念日的晚餐", date: "2024.05.20", alt: "纪念日晚餐" },
    { src: "assets/photos/p44.svg", title: "你做糊了的蛋挞", date: "2024.06.15", alt: "烤糊的蛋挞" },
    { src: "assets/photos/p45.svg", title: "深夜的小龙虾", date: "2024.06.22", alt: "深夜小龙虾" },
    { src: "assets/photos/p46.svg", title: "抽中了隐藏款", date: "2024.07.06", alt: "拆盲盒抽中隐藏款" },
    { src: "assets/photos/p47.svg", title: "台风天宅在家", date: "2024.07.27", alt: "台风天在家" },
    { src: "assets/photos/p48.svg", title: "一起搭的积木", date: "2024.08.10", alt: "完成的积木" },
    { src: "assets/photos/p49.svg", title: "面馆里的第二碗", date: "2024.08.24", alt: "面馆吃饭" },
    { src: "assets/photos/p50.svg", title: "中秋的月亮", date: "2024.09.21", alt: "中秋的圆月" },
    { src: "assets/photos/p51.svg", title: "国庆的人海", date: "2024.10.03", alt: "国庆出游" },
    { src: "assets/photos/p52.svg", title: "你的生日蜡烛", date: "2024.10.16", alt: "生日蜡烛" },
    { src: "assets/photos/p53.svg", title: "一起逛的家居店", date: "2024.11.09", alt: "逛家居店" },
    { src: "assets/photos/p54.svg", title: "第一场雪", date: "2024.11.30", alt: "冬天的第一场雪" },
    { src: "assets/photos/p55.svg", title: "平安夜的苹果", date: "2024.12.24", alt: "平安夜的苹果" },
    { src: "assets/photos/p56.svg", title: "又一次跨年", date: "2024.12.31", alt: "又一次跨年" },
    { src: "assets/photos/p57.svg", title: "元旦的晨雾", date: "2025.01.02", alt: "元旦清晨" },
    { src: "assets/photos/p58.svg", title: "冬夜的热可可", date: "2025.01.18", alt: "冬夜热可可" },
    { src: "assets/photos/p59.svg", title: "新春的灯笼", date: "2025.01.29", alt: "新春灯笼" },
    { src: "assets/photos/p60.svg", title: "汤圆要分着吃", date: "2025.02.12", alt: "分着吃的汤圆" },
    { src: "assets/photos/p61.svg", title: "情人节的电影票", date: "2025.02.14", alt: "情人节电影票" },
    { src: "assets/photos/p62.svg", title: "早春的第一场雨", date: "2025.02.28", alt: "早春的雨" },
    { src: "assets/photos/p63.svg", title: "妇女节的花", date: "2025.03.08", alt: "送出的花" },
    { src: "assets/photos/p64.svg", title: "樱花树下", date: "2025.03.29", alt: "樱花树下的合照" },
    { src: "assets/photos/p65.svg", title: "清明的青团", date: "2025.04.04", alt: "青团" },
    { src: "assets/photos/p66.svg", title: "五一的小旅行", date: "2025.05.01", alt: "五一旅行" },
    { src: "assets/photos/p67.svg", title: "三周年的星空", date: "2025.05.20", alt: "三周年星空" },
    { src: "assets/photos/p68.svg", title: "六一的小孩子气", date: "2025.06.01", alt: "游乐园的小孩气" },
    { src: "assets/photos/p69.svg", title: "夏夜的西瓜", date: "2025.06.21", alt: "夏夜吃西瓜" },
    { src: "assets/photos/p70.svg", title: "暴雨躲进的屋檐", date: "2025.07.05", alt: "屋檐下躲雨" },
    { src: "assets/photos/p71.svg", title: "一起追的演唱会", date: "2025.07.19", alt: "演唱会现场" },
    { src: "assets/photos/p72.svg", title: "台风过后的彩虹", date: "2025.08.02", alt: "雨后彩虹" },
    { src: "assets/photos/p73.svg", title: "七夕的河边", date: "2025.08.29", alt: "七夕河边散步" },
    { src: "assets/photos/p74.svg", title: "开学季的书店", date: "2025.09.06", alt: "书店" },
    { src: "assets/photos/p75.svg", title: "中秋一起赏月", date: "2025.10.06", alt: "一起赏月" },
    { src: "assets/photos/p76.svg", title: "你的生日面", date: "2025.10.16", alt: "长寿面" },
    { src: "assets/photos/p77.svg", title: "秋天的落叶书签", date: "2025.11.01", alt: "落叶书签" },
    { src: "assets/photos/p78.svg", title: "双十一拆快递", date: "2025.11.11", alt: "拆快递" },
    { src: "assets/photos/p79.svg", title: "冬至的饺子", date: "2025.12.21", alt: "冬至饺子" },
    { src: "assets/photos/p80.svg", title: "圣诞袜里的礼物", date: "2025.12.25", alt: "圣诞礼物" },
    { src: "assets/photos/p81.svg", title: "跨年的一场电影", date: "2025.12.31", alt: "跨年电影" },
    { src: "assets/photos/p82.svg", title: "新年的第一缕光", date: "2026.01.01", alt: "新年日出" },
    { src: "assets/photos/p83.svg", title: "腊月的大扫除", date: "2026.01.20", alt: "一起大扫除" },
    { src: "assets/photos/p84.svg", title: "年夜饭", date: "2026.02.16", alt: "年夜饭" },
    { src: "assets/photos/p85.svg", title: "元宵的灯", date: "2026.03.03", alt: "元宵花灯" },
    { src: "assets/photos/p86.svg", title: "春天的野餐", date: "2026.03.21", alt: "春天野餐" },
    { src: "assets/photos/p87.svg", title: "四月的樱花", date: "2026.04.05", alt: "四月樱花" },
    { src: "assets/photos/p88.svg", title: "四周年的合照", date: "2026.05.20", alt: "四周年合照" },
    { src: "assets/photos/p89.svg", title: "夏至的晚风", date: "2026.06.21", alt: "夏至晚风" },
    { src: "assets/photos/p90.svg", title: "一起装好的书架", date: "2026.07.11", alt: "装好的书架" },
    { src: "assets/photos/p91.svg", title: "海边的贝壳", date: "2026.07.25", alt: "海边捡贝壳" },
    { src: "assets/photos/p92.svg", title: "立秋的第一杯奶茶", date: "2026.08.07", alt: "立秋奶茶" },
    { src: "assets/photos/p93.svg", title: "雨天的窗台", date: "2026.08.22", alt: "雨天窗台" },
    { src: "assets/photos/p94.svg", title: "周末的早市", date: "2026.09.05", alt: "周末早市" },
    { src: "assets/photos/p95.svg", title: "落日里的天台", date: "2026.09.23", alt: "天台看落日" },
    { src: "assets/photos/p96.svg", title: "桂花香里散步", date: "2026.10.03", alt: "桂花树下散步" },
    { src: "assets/photos/p97.svg", title: "你的生日愿望", date: "2026.10.16", alt: "生日许愿" },
    { src: "assets/photos/p98.svg", title: "枫叶红了", date: "2026.11.08", alt: "枫叶" },
    { src: "assets/photos/p99.svg", title: "初雪的告白", date: "2026.11.25", alt: "初雪" },
    { src: "assets/photos/p100.svg", title: "还没发生的惊喜", date: "2026.12.31", alt: "未来的惊喜" }
  ],

  /* ---------- 5. 恋爱时间线（可以任意增删） ---------- */
  // icon 是节点上的小图标，可以直接换成任何 emoji；photo 可选，不需要就删掉那行
  timeline: [
    {
      date: "2023.03.14",
      title: "第一次见面",
      text: "在朋友的生日聚会上，你坐在我对面。那天很吵，我却只记住了你笑起来时眼睛弯起来的样子。",
      icon: "✦"
    },
    {
      date: "2023.04.02",
      title: "第一次单独聊天",
      text: "从一杯咖啡开始，聊到店里的灯都关了。回去的路上才发现，我们谁都舍不得先说再见。",
      icon: "☕"
    },
    {
      date: "2023.05.20",
      title: "我们在一起了",
      text: "晚上八点十三分，你发来一句“那就在一起吧”。我盯着屏幕看了很久，才想起来要回一个好。",
      icon: "♡"
    },
    {
      date: "2023.06.18",
      title: "第一次正式约会",
      text: "提前一个小时到，反复检查衣服和头发。后来你说，其实你也紧张得一晚上没睡好。",
      icon: "🎬"
    },
    {
      date: "2023.08.12",
      title: "第一次旅行",
      text: "第一次一起坐高铁，第一次共用一副耳机，第一次在陌生的城市醒来，发现你就在旁边。",
      icon: "🚄"
    },
    {
      date: "2024.05.20",
      title: "一周年",
      text: "没有盛大的仪式，只有一顿认真做的饭和一张手写的卡片。原来平凡的日子，也可以被爱照亮。",
      icon: "🕯"
    },
    {
      date: "2025.05.20",
      title: "两周年 · 还在继续",
      text: "我们依然会为小事拌嘴，也依然会在对方难过时第一时间出现。愿以后每一个普通的日子，都有你在。",
      icon: "⌂"
    }
  ],

  /* ---------- 6. 心动抽卡：50 句情话 ---------- */
  // 想加句子直接在最下面加一行，注意每一句后面的英文逗号
  quotes: [
    "喜欢你，是我做过最顺手的事。",
    "世界很吵，你一来就安静了。",
    "今天的风很甜，可能因为你在我旁边。",
    "想和你把普通的日子，过成很长很长的故事。",
    "我不是一个很会等的人，可等你这件小事，我愿意慢慢来。",
    "你是我琐碎生活里，最值得的那一笔开销。",
    "想在每一个普通的黄昏，和你分一半晚霞。",
    "你不用完美，你只要是你，就已经很好。",
    "我攒了好多废话，只想说给你听。",
    "你一出现，我的心就自动切到柔软模式。",
    "想和你在冬天吃热的，在夏天吃凉的，在四季里吃很多顿饭。",
    "我的喜欢不喧哗，但很耐用。",
    "和你并肩走的时候，路总是短一点。",
    "你是我的“到家了吗”，也是我的“怎么才到家”。",
    "抱一下，今天所有的不开心就先到这里。",
    "我把“以后”两个字，偷偷写进了有你的句子里。",
    "想陪你看很多次月亮，直到我们变成别人口中的“老夫老妻”。",
    "世界上有那么多方向，我只想朝你走。",
    "你笑起来的时候，我觉得今年会是个好年。",
    "你是我认真生活的原因之一，认真且不费力。",
    "想把每一次见你，都当成第一次。",
    "我不要轰轰烈烈，我要每次回头你都在。",
    "我开始喜欢记录，因为生活里有了你。",
    "见到你之后，我的“随便”都有了答案。",
    "今天是普通的一天，但因为想你，变得具体。",
    "我的计划表里，永远有一行写着“见你”。",
    "你不用踮脚，我会弯腰。",
    "你说冷，我就想把整个冬天搬到你手里烤一烤。",
    "想和你把“晚安”说到很老很老。",
    "爱不是把你变成我喜欢的样子，是喜欢你的每个样子。",
    "我这个人不太会表达，但我记得你不吃香菜。",
    "你不在的时候，连晚风都像在加班。",
    "和你在一起，连沉默都很舒服。",
    "想把所有好脾气都留给你，剩下的用来对付周一。",
    "你是那种，一想到就会让我想好好吃饭的人。",
    "我想和你拥有同一盏灯，同一场雨，同一个明天。",
    "如果生活是一场长跑，我想和你走慢一点。",
    "我的手机相册里，一半是你，一半是想发给你看的风景。",
    "你是我在人间偷偷藏起来的甜。",
    "想把日子过得慢一点，把喜欢说得久一点。",
    "你不需要总是坚强，在我这里可以软下来。",
    "我喜欢的不是恋爱，是和你恋爱。",
    "天气好的时候想见你，天气不好的时候更想。",
    "你是我所有“下次”里，最确定的那个人。",
    "我们不必每天都精彩，能一起吃晚饭就很好。",
    "你只管做你自己，我负责喜欢你。",
    "想和你吵架也吵不散，冷战也冷不久。",
    "我把余生想了一遍，每一版都有你。",
    "遇见你之后，我才发现“来日方长”是个好词。",
    "谢谢你，让我觉得人间值得，而且不止一点点。"
  ],

  /* ---------- 7. 默契大考验（预置 10 道题，答案请在页面「⚙ 设置」里改成你们自己的） ---------- */
  // answer 是正确答案的序号，从 0 开始数：第一个选项 = 0，第二个 = 1……
  // 下面这些只是演示答案；分享给别人后，让对方在设置里填自己的题目和答案。
  // 设置里没有填答案的题会自动跳过，不会出现在游戏里。
  quiz: [
    {
      question: "我们第一次正式约会，是在哪里？",
      options: ["电影院", "咖啡馆", "公园", "夜市"],
      answer: -1
    },
    {
      question: "TA 最常点的一杯饮料是？",
      options: ["冰美式", "珍珠奶茶", "热可可", "气泡水"],
      answer: -1
    },
    {
      question: "我们第一次一起旅行，去的是？",
      options: ["山里", "海边", "古镇", "另一座城市"],
      answer: -1
    },
    {
      question: "当初，是谁先说出“喜欢”的？",
      options: ["我先说的", "TA 先说的", "几乎同时", "到现在也没说清"],
      answer: -1
    },
    {
      question: "我们在一起的日子是？",
      options: ["2 月 14 日", "5 月 20 日", "10 月 1 日", "6 月 1 日"],
      answer: -1
    },
    {
      question: "TA 的口头禅是哪一句？",
      options: ["“随便”", "“都行”", "“听你的”", "“再看一眼”"],
      answer: -1
    },
    {
      question: "一起吃过最难忘的一顿饭是？",
      options: ["第一顿火锅", "学校食堂", "深夜路边摊", "家里煮的面"],
      answer: -1
    },
    {
      question: "TA 最怕的东西是？",
      options: ["蟑螂", "打雷", "早起", "排队"],
      answer: -1
    },
    {
      question: "吵架之后，一般是谁先低头？",
      options: ["我先哄", "TA 先哄", "互相哄", "冷着冷着就和好了"],
      answer: -1
    },
    {
      question: "下一个最想去的地方是？",
      options: ["海边", "雪山", "沙漠", "TA 的家乡"],
      answer: -1
    }
  ],

  /* ---------- 8. 页脚隐藏信 ---------- */
  letter: {
    title: "写给正在读这封信的你",
    paragraphs: [
      "如果你读到了这里，说明我们之间又多了一个只有彼此知道的小秘密。",
      "我其实不太擅长把喜欢说得漂亮。更多的时候，它藏在一些很小的事情里：记得你不吃香菜，记得你加班会忘记喝水，路过你喜欢的店会下意识放慢脚步。",
      "谢谢你愿意和我一起，把普通的日子过得有滋有味。以后也会有很多不完美的时候，希望我们都能记得，今天为什么选择站在彼此身边。",
      "接下来的路，继续一起走吧。慢一点也没关系，只要是你。"
    ],
    sign: "—— {me}"
  },

  // 页脚小爱心快速点 7 下后出现的隐藏句子
  hiddenMessage: "今天也偷偷多爱你一点。这是只有点满七下的人才能看到的话。"
};

/* ==========================================================================
   以下为程序逻辑。没有代码基础的话，跳过即可，不需要修改。
   ========================================================================== */

/* ---------- 全局小工具 ---------- */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

// 数字补零：7 → "07"
const pad2 = (number) => String(number).padStart(2, "0");

// 判断用户是否在系统里开启了“减少动态效果”
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// 把 {me} / {partner} 换成真实名字，让配置区写起来更方便
function fillName(text) {
  return String(text)
    .replace(/\{me\}/g, D().names.me)
    .replace(/\{partner\}/g, D().names.partner);
}

// 创建一个带类名/文字的元素，避免拼接 HTML 带来的安全风险和排版问题
function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// 取名字的第一个字，作为顶部小圆标（英文自动大写）
function initialOf(name) {
  const chars = Array.from(String(name || "").trim());
  const first = chars[0] || "·";
  return /[a-z]/i.test(first) ? first.toUpperCase() : first;
}

/* ---------- 本地存储：所有“记住”的数据都放在这里 ---------- */
const STORAGE_PREFIX = "loveUniverse.v1.";

const storage = {
  // 读取并自动 JSON 解析；失败时返回默认值，保证页面不崩
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  },
  // 写入数据，返回是否成功（浏览器隐私模式可能禁止写入）
  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      /* 忽略：隐私模式下可能不允许删除 */
    }
  }
};

/* ---------- 素材仓库（IndexedDB）：上传的照片和视频保存在这台设备的浏览器里 ----------
   为什么不用 localStorage：照片和视频太大，localStorage 只有约 5MB，
   IndexedDB 能放几百 MB，而且断网、刷新、重启浏览器都还在。 */
const mediaStore = (() => {
  const DB_NAME = "loveUniverseMedia";
  const STORE = "items";
  let dbPromise = null;

  function openDb() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve) => {
        try {
          if (!("indexedDB" in window)) return resolve(null);
          const request = indexedDB.open(DB_NAME, 1);
          request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
          };
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve(null);
          request.onblocked = () => resolve(null);
        } catch (error) {
          resolve(null);
        }
      });
    }
    return dbPromise;
  }

  async function get(key) {
    const db = await openDb();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const request = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
        request.onsuccess = () => resolve(request.result ?? null);
        request.onerror = () => resolve(null);
      } catch (error) {
        resolve(null);
      }
    });
  }

  async function set(key, value) {
    const db = await openDb();
    if (!db) return false;
    return new Promise((resolve) => {
      try {
        const request = db.transaction(STORE, "readwrite").objectStore(STORE).put(value, key);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      } catch (error) {
        resolve(false);
      }
    });
  }

  async function remove(key) {
    const db = await openDb();
    if (!db) return;
    try {
      db.transaction(STORE, "readwrite").objectStore(STORE).delete(key);
    } catch (error) {
      /* 忽略：删不掉也不影响页面 */
    }
  }

  // 清空整个素材仓库（「恢复默认」时用）
  async function clear() {
    const db = await openDb();
    if (!db) return;
    try {
      db.transaction(STORE, "readwrite").objectStore(STORE).clear();
    } catch (error) {
      /* 忽略 */
    }
  }

  return { get, set, remove, clear };
})();

/* ---------- 自动快照仓库（独立 IndexedDB） ----------
   这个库专门保存“刚才那一版”，和素材仓库分开。
   就算用户点了「恢复出厂默认」把当前数据清掉，快照仍然能回滚。 */
const snapshotStore = (() => {
  const DB_NAME = "loveUniverseSnapshots";
  const STORE = "snapshots";
  let dbPromise = null;

  function openDb() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve) => {
        try {
          if (!("indexedDB" in window)) return resolve(null);
          const request = indexedDB.open(DB_NAME, 1);
          request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE)) {
              const store = db.createObjectStore(STORE, { keyPath: "id" });
              store.createIndex("createdAt", "createdAt");
            }
          };
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve(null);
          request.onblocked = () => resolve(null);
        } catch (error) {
          resolve(null);
        }
      });
    }
    return dbPromise;
  }

  async function add(snapshot) {
    const db = await openDb();
    if (!db) return false;
    return new Promise((resolve) => {
      try {
        const request = db.transaction(STORE, "readwrite").objectStore(STORE).put(snapshot);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      } catch (error) {
        resolve(false);
      }
    });
  }

  async function list() {
    const db = await openDb();
    if (!db) return [];
    return new Promise((resolve) => {
      try {
        const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
        request.onsuccess = () => resolve((request.result || []).sort((a, b) => b.createdAt - a.createdAt));
        request.onerror = () => resolve([]);
      } catch (error) {
        resolve([]);
      }
    });
  }

  async function get(id) {
    const db = await openDb();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const request = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      } catch (error) {
        resolve(null);
      }
    });
  }

  async function remove(id) {
    const db = await openDb();
    if (!db) return;
    try {
      db.transaction(STORE, "readwrite").objectStore(STORE).delete(id);
    } catch (error) {
      /* 忽略 */
    }
  }

  return { add, list, get, remove };
})();

/* ==========================================================================
   生效数据层：用户在「⚙ 设置」里改的内容，覆盖 CONFIG 里的默认值。
   CONFIG 只是"出厂默认"；真正渲染页面用的都是 effectiveData（简称 D()）。
   ========================================================================== */
const DATA_KEY = "data";

let effectiveData = null;

// 深拷贝小工具
function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

// 给 data URI 生成一个短哈希，单文件版没有文件名时也能保持 id 稳定
function shortHash(text) {
  let hash = 0x811c9dc5;
  const value = String(text || "");
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
}

// 从照片路径取一个稳定 id（p01.svg → p01），换照片/删照片都靠它对号入座
function photoIdFromSrc(src, index) {
  const value = String(src || "");
  if (value.startsWith("data:")) return `media-${shortHash(value)}`;
  const match = /([a-zA-Z0-9_-]+)\.[a-zA-Z0-9]+$/i.exec(value);
  return match ? match[1] : `photo${index + 1}`;
}

// 出厂默认数据（把 CONFIG 包上一层 id）
function buildDefaultData() {
  return {
    names: cloneData(CONFIG.names),
    startDate: CONFIG.startDate,
    anniversary: cloneData(CONFIG.anniversary),
    birthday: cloneData(CONFIG.birthday),
    secretPassword: CONFIG.secretPassword,
    unlockMode: "password",            // "password" 密码解锁 / "quiz" 答题解锁
    defaultTheme: CONFIG.defaultTheme,
    coverQuote: CONFIG.coverQuote,
    coverSlides: cloneData(CONFIG.coverSlides).map((slide, index) => ({
      ...slide,
      id: slide.id || `cover${index + 1}`
    })),
    photos: cloneData(CONFIG.photos).map((photo, index) => ({
      ...photo,
      id: photo.id || photoIdFromSrc(photo.src, index)
    })),
    timeline: cloneData(CONFIG.timeline),
    quiz: cloneData(CONFIG.quiz).map((item, index) => ({ ...item, id: item.id || `q${index + 1}` })),
    letter: cloneData(CONFIG.letter),
    hiddenMessage: CONFIG.hiddenMessage
  };
}

// 只接受普通对象，避免把数组、null 或浏览器内置对象当成配置合并
function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

// 这些键会直接改到对象原型上，导入别人的备份文件时必须拒绝
function isUnsafeKey(key) {
  return key === "__proto__" || key === "constructor" || key === "prototype";
}

// 把保存的用户数据合并进默认数据（用户没改的字段保留默认值）
function deepMergeInto(target, source, depth = 0) {
  if (!isPlainObject(source) || depth > 6) return target;

  Object.keys(source).forEach((key) => {
    const value = source[key];
    if (isUnsafeKey(key) || value === undefined) return;

    if (Array.isArray(value)) {
      target[key] = cloneData(value.slice(0, 500));
    } else if (isPlainObject(value)) {
      if (!isPlainObject(target[key])) target[key] = {};
      deepMergeInto(target[key], value, depth + 1);
    } else if (
      typeof value === "string" ||
      typeof value === "boolean" ||
      value === null ||
      (typeof value === "number" && Number.isFinite(value))
    ) {
      target[key] = value;
    }
  });
  return target;
}

function safeText(value, max = 120, fallback = "") {
  const text = String(value ?? "").trim();
  return text ? text.slice(0, max) : fallback;
}

function safeInt(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function hasSafePhotoId(id) {
  return /^[a-zA-Z0-9_.-]{1,80}$/.test(String(id || ""));
}

function safeSrc(value) {
  const src = String(value ?? "").trim();
  if (src.startsWith("data:")) return src.slice(0, 500000);
  return src.slice(0, 500);
}

// 无论数据来自 localStorage、备份文件还是设置草稿，最后都统一“消毒”一次
function normalizeEditableData(input) {
  const defaults = buildDefaultData();
  const data = deepMergeInto(defaults, isPlainObject(input) ? input : {});

  data.names = {
    me: safeText(data.names?.me, 12, "我"),
    partner: safeText(data.names?.partner, 12, "TA")
  };

  if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/.test(String(data.startDate || ""))) {
    data.startDate = defaults.startDate;
  }

  data.anniversary = {
    month: safeInt(data.anniversary?.month, 1, 12, defaults.anniversary.month),
    day: safeInt(data.anniversary?.day, 1, 31, defaults.anniversary.day)
  };

  const birthdayParts = String(data.birthday?.monthDay || "").split("-").filter(Boolean);
  const birthdayMonth = safeInt(birthdayParts[birthdayParts.length - 2], 1, 12, 0);
  const birthdayDay = safeInt(birthdayParts[birthdayParts.length - 1], 1, 31, 0);
  data.birthday = {
    ...(isPlainObject(data.birthday) ? data.birthday : {}),
    monthDay: birthdayParts.length >= 2 && birthdayMonth && birthdayDay ? `${birthdayMonth}-${birthdayDay}` : "",
    title: safeText(data.birthday?.title, 40, defaults.birthday.title),
    message: safeText(data.birthday?.message, 300, defaults.birthday.message)
  };

  data.secretPassword = safeText(data.secretPassword, 20, defaults.secretPassword);
  data.unlockMode = data.unlockMode === "quiz" ? "quiz" : "password";
  data.defaultTheme = ["rose", "night", "retro"].includes(data.defaultTheme)
    ? data.defaultTheme
    : defaults.defaultTheme;
  data.coverQuote = safeText(data.coverQuote, 160, defaults.coverQuote);
  data.hiddenMessage = safeText(data.hiddenMessage, 120, defaults.hiddenMessage);

  const defaultCoversById = new Map((defaults.coverSlides || []).map((slide) => [slide.id, slide]));
  data.coverSlides = (Array.isArray(data.coverSlides) ? data.coverSlides : defaults.coverSlides)
    .slice(0, 5)
    .map((slide, index) => {
      const id = safeText(slide?.id, 80, `cover${index + 1}`);
      const fallback = defaultCoversById.get(id) || (defaults.coverSlides || [])[index] || {};
      return {
        id,
        src: safeSrc(slide?.src || fallback.src)
      };
    })
    .filter((slide) => slide.src);

  const defaultPhotosById = new Map((defaults.photos || []).map((photo) => [photo.id, photo]));
  data.photos = (Array.isArray(data.photos) ? data.photos : defaults.photos)
    .slice(0, 120)
    .map((photo, index) => {
      const fallbackId = photoIdFromSrc(photo?.src, index);
      const id = safeText(photo?.id, 80, fallbackId);
      const safeId = hasSafePhotoId(id) ? id : fallbackId;
      const fallback = defaultPhotosById.get(safeId) || (defaults.photos || [])[index] || {};
      return {
        id: safeId,
        src: safeSrc(photo?.src || fallback.src),
        title: safeText(photo?.title, 24, `我们的瞬间 ${index + 1}`),
        date: safeText(photo?.date, 10, ""),
        alt: safeText(photo?.alt, 80, safeText(photo?.title, 24, "我们的照片")),
        category: safeText(photo?.category || fallback.category, 20, "")
      };
    });

  data.timeline = (Array.isArray(data.timeline) ? data.timeline : defaults.timeline)
    .slice(0, 30)
    .map((item) => ({
      date: safeText(item?.date, 10, ""),
      title: safeText(item?.title, 20, "我们的故事"),
      text: safeText(item?.text, 300, ""),
      icon: safeText(item?.icon, 4, "♡")
    }))
    .filter((item) => item.date || item.title || item.text);

  data.quiz = (Array.isArray(data.quiz) ? data.quiz : defaults.quiz)
    .slice(0, 20)
    .map((item, index) => {
      const options = (Array.isArray(item?.options) ? item.options : [])
        .slice(0, 4)
        .map((option) => safeText(option, 30, ""));
      const answer = Number(item?.answer);
      return {
        id: safeText(item?.id, 80, `q${index + 1}`),
        question: safeText(item?.question, 60, ""),
        options,
        answer: Number.isInteger(answer) && answer >= 0 && answer < options.length ? answer : -1
      };
    })
    .filter((item) => item.question && item.options.length >= 2);

  data.letter = {
    title: safeText(data.letter?.title, 30, defaults.letter.title),
    paragraphs: (Array.isArray(data.letter?.paragraphs) ? data.letter.paragraphs : [])
      .slice(0, 30)
      .map((paragraph) => safeText(paragraph, 500, ""))
      .filter(Boolean),
    sign: safeText(data.letter?.sign, 20, defaults.letter.sign)
  };

  if (!data.letter.paragraphs.length) data.letter.paragraphs = cloneData(defaults.letter.paragraphs);
  return data;
}

// 单文件版里的默认照片是巨大的 data URI，不能写进 localStorage；
// 页面运行时从 CONFIG 恢复，备份/本机保存只保留文字和短路径。
function toStorageData(data) {
  const saved = cloneData(data);
  saved.photos = (saved.photos || []).map((photo) => ({
    ...photo,
    src: String(photo.src || "").startsWith("data:") ? "" : photo.src
  }));
  saved.coverSlides = (saved.coverSlides || []).map((slide) => ({
    ...slide,
    src: String(slide.src || "").startsWith("data:") ? "" : slide.src
  }));
  return saved;
}

function loadData() {
  effectiveData = normalizeEditableData(storage.get(DATA_KEY, null));
}

function saveData(data) {
  return storage.set(DATA_KEY, toStorageData(normalizeEditableData(data || effectiveData)));
}

/* ---------- 自动快照：保存/导入/恢复默认前先留一份后路 ---------- */
const SNAPSHOT_LIMITS = {
  light: 20,
  full: 3
};

function estimateSnapshotSize(snapshot) {
  try {
    return JSON.stringify(snapshot).length;
  } catch (error) {
    return 0;
  }
}

async function collectCurrentMediaForSnapshot() {
  const media = {};
  let total = 0;
  const maxBytes = 80 * 1024 * 1024;

  const add = async (key) => {
    const value = await mediaStore.get(key);
    if (!value) return;
    const size = typeof value === "string" ? value.length : (value.size || 0);
    if (total + size > maxBytes) return;
    media[key] = value;
    total += size;
  };

  for (const photo of (D().photos || [])) await add(MEDIA_KEYS.photo(photo.id));
  for (const slide of (D().coverSlides || [])) await add(MEDIA_KEYS.cover(slide.id));
  await add(MEDIA_KEYS.video());
  return media;
}

async function pruneSnapshots() {
  const all = await snapshotStore.list();
  const light = all.filter((item) => !item.includeMedia);
  const full = all.filter((item) => item.includeMedia);

  const removeList = [...light.slice(SNAPSHOT_LIMITS.light), ...full.slice(SNAPSHOT_LIMITS.full)];
  for (const snapshot of removeList) {
    await snapshotStore.remove(snapshot.id);
  }
}

async function createSnapshot(label, options = {}) {
  if (!effectiveData) return null;
  const includeMedia = Boolean(options.includeMedia);
  const createdAt = Date.now();
  const snapshot = {
    id: `snap-${createdAt}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt,
    label: safeText(label, 30, "自动备份"),
    includeMedia,
    data: toStorageData(normalizeEditableData(effectiveData)),
    media: includeMedia ? await collectCurrentMediaForSnapshot() : {}
  };
  snapshot.size = estimateSnapshotSize(snapshot);

  const saved = await snapshotStore.add(snapshot);
  if (!saved) return null;
  await pruneSnapshots();
  return snapshot;
}

async function restoreSnapshot(id, options = {}) {
  const reloadAfter = options.reloadAfter !== false;
  const snapshot = await snapshotStore.get(id);
  if (!snapshot || !snapshot.data) {
    toast("这个快照读不出来了。");
    return false;
  }

  await createSnapshot("恢复快照前", { includeMedia: true });

  const nextData = normalizeEditableData(snapshot.data);
  if (!saveData(nextData)) {
    toast("浏览器不允许保存，无法恢复快照。");
    return false;
  }

  if (snapshot.includeMedia) {
    await mediaStore.clear();
    for (const [key, value] of Object.entries(snapshot.media || {})) {
      if (typeof value === "string" && value.startsWith("data:video/")) {
        try {
          await mediaStore.set(key, dataUrlToBlob(value));
        } catch (error) {
          /* 视频坏了就跳过 */
        }
      } else {
        await mediaStore.set(key, value);
      }
    }
  }

  if (reloadAfter) {
    toast("快照恢复好了，正在刷新页面……");
    setTimeout(() => location.reload(), 700);
  } else {
    effectiveData = nextData;
  }
  return true;
}

function formatSnapshotTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "未知时间";
  return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

async function renderSnapshotSection() {
  const target = $("#snapshotList");
  if (!target) return;
  const snapshots = await snapshotStore.list();
  const status = $("#snapshotStatus");
  if (status) {
    status.textContent = snapshots.length
      ? `本机已有 ${snapshots.length} 份自动快照。普通更新不会清掉它们。`
      : "还没有自动快照。保存设置、导入备份或恢复默认前，系统会自动留一份。";
  }

  if (!snapshots.length) {
    target.innerHTML = `<p class="set-hint">暂无快照。</p>`;
    return;
  }

  target.innerHTML = snapshots.map((snapshot) => `
    <div class="set-row snapshot-row" data-id="${escapeHtml(snapshot.id)}">
      <div class="set-col">
        <strong>${escapeHtml(snapshot.label)}</strong>
        <span class="set-row-hint">
          ${escapeHtml(formatSnapshotTime(snapshot.createdAt))} ·
          ${snapshot.includeMedia ? "含照片/视频" : "仅设置"} ·
          约 ${(snapshot.size / 1024).toFixed(0)} KB
        </span>
      </div>
      <button type="button" class="btn btn-ghost" data-act="restore-snapshot" data-id="${escapeHtml(snapshot.id)}">恢复</button>
      <button type="button" class="set-del" data-act="delete-snapshot" data-id="${escapeHtml(snapshot.id)}" aria-label="删除快照">✕</button>
    </div>
  `).join("");
}

// 全站统一从这里读"当前生效"的数据
function D() {
  return effectiveData;
}

/* ---------- 用户照片：先查"换过的"，没有再用配置里的原图 ---------- */
const photoOverrides = { photos: {}, covers: {} };

function effectivePhotoSrc(index) {
  const photo = (D().photos || [])[index];
  if (!photo) return "";
  return photoOverrides.photos[photo.id] || photo.src || "";
}

function effectivePhotoSrcById(id, fallbackSrc = "") {
  return photoOverrides.photos[id] || fallbackSrc || "";
}

function effectiveCoverSrc(index) {
  const slide = (D().coverSlides || [])[index];
  if (!slide) return "";
  return photoOverrides.covers[slide.id] || slide.src || "";
}

/* ---------- 默契题整理：只保留"题目、选项、答案都齐全"的题 ---------- */
function normalizeQuiz(list) {
  const out = [];
  (Array.isArray(list) ? list : []).forEach((item) => {
    const question = String(item.question || "").trim();
    const options = (Array.isArray(item.options) ? item.options : [])
      .map((option) => String(option ?? "").trim())
      .filter(Boolean);
    const answer = Number(item.answer);
    if (!question || options.length < 2) return;
    if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) return;
    out.push({ question, options, answer });
  });
  return out;
}

// 原地洗牌
function shuffleArray(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/* 把用户选的图片文件压成长边 1600px 的 JPEG，再转成 data URL。
   压缩既省存储空间，也保证手机打开不卡。 */
function fileToResizedDataUrl(file, maxSide = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) {
      reject(new Error("不是图片文件"));
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      try {
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片读不出来"));
    };
    image.src = url;
  });
}

/* ---------- 上传交互：拖进来 / 点一下就能换 ---------- */
// 媒体文件在 IndexedDB 里的键：用照片自己的 id（p01、slot-xxx…），
// 这样在设置里删除/新增照片后，存好的照片也不会错位
const MEDIA_KEYS = {
  photo: (id) => `photo.${id}`,
  cover: (id) => `cover.${id}`,
  video: () => "secretVideo"
};

// 按下标取当前照片/封面（统一入口，D() 里找不到就返回空对象）
function photoAt(index) {
  return (D().photos || [])[index] || null;
}

function coverSlideAt(index) {
  return (D().coverSlides || [])[index] || null;
}

let activeCoverIndex = 0;
let secretVideoBlob = null;
let secretVideoUrl = "";
let pendingPhotoUploadIndex = null;
let pendingCoverUploadSlideId = null;
let pendingVideoUpload = false;

// 让 label 也能用键盘激活：Enter / Space
function enableLabelKeyboard(label, activate) {
  if (!label) return;
  label.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activate();
    const inputId = label.getAttribute("for");
    const input = inputId ? document.getElementById(inputId) : null;
    if (input) input.click();
  });
}

function initUploadInputs() {
  const photoInput = $("#photoFileInput");
  if (photoInput) {
    photoInput.addEventListener("change", async () => {
      const file = photoInput.files && photoInput.files[0];
      const index = pendingPhotoUploadIndex;
      photoInput.value = "";
      pendingPhotoUploadIndex = null;
      if (index !== null && index !== undefined) await replacePhoto(index, file);
    });
  }

  const coverInput = $("#coverFileInput");
  if (coverInput) {
    coverInput.addEventListener("change", async () => {
      const file = coverInput.files && coverInput.files[0];
      const slideId = pendingCoverUploadSlideId;
      const index = (D().coverSlides || []).findIndex((slide) => slide.id === slideId);
      coverInput.value = "";
      pendingCoverUploadSlideId = null;
      if (index >= 0) {
        activeCoverIndex = index;
        await replaceCover(file);
      }
    });
  }

  const videoInput = $("#videoFileInput");
  if (videoInput) {
    videoInput.addEventListener("change", async () => {
      const file = videoInput.files && videoInput.files[0];
      const shouldHandle = pendingVideoUpload;
      videoInput.value = "";
      pendingVideoUpload = false;
      if (shouldHandle) await replaceSecretVideo(file);
    });
  }

  enableLabelKeyboard($("#lightboxReplace"), () => {
    pendingPhotoUploadIndex = lightboxIndex;
  });

  enableLabelKeyboard($("#coverEditBtn"), () => {
    const slide = coverSlideAt(activeCoverIndex);
    pendingCoverUploadSlideId = slide ? slide.id : null;
  });

  enableLabelKeyboard($("#uploadSecretVideo"), () => {
    pendingVideoUpload = true;
  });
}

// 判断这次拖拽里带的到底是不是文件（拖文字、拖链接不应该触发）
function isFileDrag(event) {
  return Boolean(
    event.dataTransfer &&
    Array.from(event.dataTransfer.types || []).includes("Files")
  );
}

// 给一个区域装上“拖文件进来就处理”的能力
function makeDropTarget(target, handler, className = "is-dragover") {
  if (!target) return;
  let depth = 0;

  target.addEventListener("dragenter", (event) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    depth += 1;
    target.classList.add(className);
  });

  target.addEventListener("dragover", (event) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  });

  target.addEventListener("dragleave", (event) => {
    if (!isFileDrag(event)) return;
    depth = Math.max(0, depth - 1);
    if (depth === 0) target.classList.remove(className);
  });

  target.addEventListener("drop", async (event) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    depth = 0;
    target.classList.remove(className);
    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    await handler(file);
  });
}

// 弹系统文件选择框；用户按取消也能正常收场
function pickFile(accept) {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.style.position = "fixed";
    input.style.left = "-99999px";
    input.setAttribute("aria-hidden", "true");

    let finished = false;
    let fallbackTimer = null;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(fallbackTimer);
      const file = input.files && input.files[0];
      input.remove();
      resolve(file || null);
    };

    input.addEventListener("change", () => setTimeout(finish, 0));
    input.addEventListener("cancel", () => setTimeout(finish, 120));

    // 老浏览器没有 cancel：窗口重新聚焦后，再给它 1.2 秒确认是否真的选了文件
    window.addEventListener("focus", () => {
      fallbackTimer = setTimeout(() => {
        if (!input.files || input.files.length === 0) finish();
      }, 1200);
    }, { once: true });

    document.body.appendChild(input);
    input.click();
  });
}

function syncPhotoCard(index) {
  const wall = $("#photoWall");
  const figure = wall && wall.children[index];
  if (!figure) return;

  const photo = photoAt(index);
  const image = $("img", figure);
  const missing = $(".photo-missing", figure);
  const custom = Boolean(photo && photoOverrides.photos[photo.id]);
  const src = effectivePhotoSrc(index);

  if (image) {
    image.src = src;
    image.hidden = false;
  }
  if (missing) missing.remove();
  figure.classList.remove("is-missing");
  figure.classList.toggle("has-custom", custom);

  let tag = $(".photo-custom", figure);
  if (custom && !tag) figure.appendChild(make("span", "photo-custom", "本机已换"));
  if (!custom && tag) tag.remove();

  const resetButton = $(".photo-reset", figure);
  if (resetButton) resetButton.hidden = !custom;
}

async function replacePhoto(index, file) {
  const photo = photoAt(index);
  if (!photo || !file) return;
  if (!/^image\//.test(file.type || "")) {
    toast("只能拖图片进来，再试一次。");
    return;
  }

  try {
    const dataUrl = await fileToResizedDataUrl(file);
    photoOverrides.photos[photo.id] = dataUrl;
    syncPhotoCard(index);

    const lightbox = $("#lightbox");
    if (lightbox && lightbox.classList.contains("is-open") && lightboxIndex === index) {
      renderLightbox();
    }

    const saved = await mediaStore.set(MEDIA_KEYS.photo(photo.id), dataUrl);
    toast(
      saved
        ? "换好了。这张照片只保存在这台设备的浏览器里。"
        : "页面里换好了，但这个浏览器暂时存不住；关掉后会恢复默认。",
      3600
    );
  } catch (error) {
    console.warn("照片处理失败", error);
    toast("这张图读不出来，换一张试试。");
  }
}

async function restorePhoto(index) {
  const photo = photoAt(index);
  if (!photo || !photoOverrides.photos[photo.id]) return;
  delete photoOverrides.photos[photo.id];
  await mediaStore.remove(MEDIA_KEYS.photo(photo.id));
  syncPhotoCard(index);

  const lightbox = $("#lightbox");
  if (lightbox && lightbox.classList.contains("is-open") && lightboxIndex === index) {
    renderLightbox();
  }
  toast("已还原成默认照片。");
}

function syncCoverSlide(index) {
  const image = $(`#coverSlides [data-slide-index="${index}"]`);
  if (!image) return;

  image.src = effectiveCoverSrc(index);
  image.style.display = "";
  refreshCoverTools();
}

function refreshCoverTools() {
  const slides = D().coverSlides || [];
  const editButton = $("#coverEditBtn");
  const resetButton = $("#coverResetBtn");
  const slide = coverSlideAt(activeCoverIndex);
  const hasSlides = slides.length > 0;
  const custom = Boolean(slide && photoOverrides.covers[slide.id]);

  if (editButton) editButton.hidden = !hasSlides;
  if (resetButton) resetButton.hidden = !(hasSlides && custom);
}

async function replaceCover(file) {
  const slide = coverSlideAt(activeCoverIndex);
  if (!slide || !file) return;
  if (!/^image\//.test(file.type || "")) {
    toast("封面只能换图片，视频请先放到文件夹里。");
    return;
  }

  try {
    const dataUrl = await fileToResizedDataUrl(file, 1800, 0.82);
    photoOverrides.covers[slide.id] = dataUrl;
    syncCoverSlide(activeCoverIndex);

    const saved = await mediaStore.set(MEDIA_KEYS.cover(slide.id), dataUrl);
    toast(
      saved
        ? "封面换好了，只保存在这台设备。"
        : "封面暂时换好了，但这个浏览器存不住；关掉后会恢复默认。",
      3600
    );
  } catch (error) {
    console.warn("封面处理失败", error);
    toast("这张图读不出来，换一张试试。");
  }
}

async function restoreCover() {
  const slide = coverSlideAt(activeCoverIndex);
  if (!slide || !photoOverrides.covers[slide.id]) return;
  delete photoOverrides.covers[slide.id];
  await mediaStore.remove(MEDIA_KEYS.cover(slide.id));
  syncCoverSlide(activeCoverIndex);
  toast("封面已还原。");
}

function updateLetterVideoArea() {
  const wrap = $("#letterVideoWrap");
  if (wrap) wrap.hidden = !D().secretVideo && !secretVideoBlob;

  const note = $("#videoSourceNote");
  if (note) {
    if (secretVideoBlob) {
      note.textContent = "当前用的是这台设备上传的视频，不会上传到任何地方。";
    } else if (D().secretVideo) {
      note.textContent = "默认读取 assets/video/secret.mp4；也可以直接拖一个视频进来。";
    } else {
      note.textContent = "还没有视频，点“上传视频”或把 mp4 拖到这里。";
    }
  }

  const restoreButton = $("#restoreSecretVideo");
  if (restoreButton) restoreButton.hidden = !secretVideoBlob;
}

function setSecretVideoSource(source) {
  if (secretVideoUrl) URL.revokeObjectURL(secretVideoUrl);
  secretVideoBlob = source || null;
  secretVideoUrl = source ? URL.createObjectURL(source) : "";

  const video = $("#secretVideo");
  if (video) {
    video.pause();
    video.removeAttribute("src");
    video.hidden = true;
    delete video.dataset.sourceKey;
    video.load();
  }

  const fallback = $("#videoFallback");
  if (fallback) fallback.hidden = true;

  const playButton = $("#playSecretVideo");
  if (playButton) playButton.hidden = false;

  updateLetterVideoArea();
}

async function replaceSecretVideo(file) {
  if (!file) return;
  if (!/^video\//.test(file.type || "")) {
    toast("这里收的是视频文件，图片请拖到照片墙上。");
    return;
  }
  if (file.size > 300 * 1024 * 1024) {
    toast("这个视频超过 300MB，先用剪辑软件压小一点。", 3800);
    return;
  }

  toast("正在收好这段视频…", 1600);
  setSecretVideoSource(file);
  const saved = await mediaStore.set(MEDIA_KEYS.video(), file);
  toast(
    saved
      ? "视频放好了，只保存在这台设备。"
      : "视频这次能播放，但浏览器存不住；关掉页面后会恢复默认。",
    3800
  );
}

async function restoreSecretVideo() {
  if (!secretVideoBlob) return;
  await mediaStore.remove(MEDIA_KEYS.video());
  setSecretVideoSource(null);
  toast("已切回默认视频文件。");
}

// 页面打开后，从 IndexedDB 里把用户换过的素材读回来
async function loadStoredMedia() {
  const photoTasks = (D().photos || []).map((photo) =>
    mediaStore.get(MEDIA_KEYS.photo(photo.id)).then((value) => {
      if (value) photoOverrides.photos[photo.id] = value;
    })
  );

  const coverTasks = (D().coverSlides || []).map((slide) =>
    mediaStore.get(MEDIA_KEYS.cover(slide.id)).then((value) => {
      if (value) photoOverrides.covers[slide.id] = value;
    })
  );

  await Promise.all(photoTasks.concat(coverTasks));

  (D().photos || []).forEach((_, index) => {
    if (photoOverrides.photos[photoAt(index).id]) syncPhotoCard(index);
  });
  (D().coverSlides || []).forEach((_, index) => {
    if (photoOverrides.covers[coverSlideAt(index).id]) syncCoverSlide(index);
  });

  const storedVideo = await mediaStore.get(MEDIA_KEYS.video());
  if (storedVideo) setSecretVideoSource(storedVideo);
  updateLetterVideoArea();
  refreshCoverTools();
}

/* ---------- 全局提示条 ---------- */
const toastEl = $("#toast");
let toastTimer = null;

function toast(message, duration = 2600) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("is-show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), duration);
}

/* ---------- 锁定/恢复页面滚动（弹层打开时使用） ---------- */
function syncBodyLock() {
  const hasOverlay = document.querySelector(".modal.is-open, .lightbox.is-open");
  document.body.classList.toggle("is-locked", Boolean(hasOverlay));
}

/* ==========================================================================
   1. 主题皮肤
   ========================================================================== */
const THEME_META = {
  rose: { color: "#fff8f6" },
  night: { color: "#080d1c" },
  retro: { color: "#f6eddf" }
};

let currentTheme = "rose";

function applyTheme(theme, save = true) {
  const nextTheme = THEME_META[theme] ? theme : "rose";
  currentTheme = nextTheme;
  document.documentElement.dataset.theme = nextTheme;

  // 更新手机浏览器地址栏颜色
  const meta = $("#themeColorMeta");
  if (meta) meta.setAttribute("content", THEME_META[nextTheme].color);

  // 更新三个主题按钮的选中状态
  $$("[data-theme-value]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.themeValue === nextTheme));
  });

  // 通知粒子系统切换图案
  FX.setMode(nextTheme);

  if (save) storage.set("theme", nextTheme);
}

function initTheme() {
  const params = new URLSearchParams(window.location.search);
  const themeFromUrl = params.get("theme");
  const savedTheme = storage.get("theme", null);
  const startTheme = THEME_META[themeFromUrl]
    ? themeFromUrl
    : (THEME_META[savedTheme] ? savedTheme : D().defaultTheme);

  applyTheme(startTheme, false);

  $$("[data-theme-value]").forEach((button) => {
    button.addEventListener("click", () => {
      applyTheme(button.dataset.themeValue);
      // 切换主题时给一点轻轻的粒子反馈
      const rect = button.getBoundingClientRect();
      FX.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
    });
  });
}

/* ==========================================================================
   2. 背景粒子：粉色飘心、蓝色星屑、复古微尘
   ========================================================================== */
const FX = (() => {
  const canvas = $("#fxCanvas");
  if (!canvas) {
    return { setMode() {}, burst() {}, start() {}, stop() {} };
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { setMode() {}, burst() {}, start() {}, stop() {} };
  }

  let width = 0;
  let height = 0;
  let dpr = 1;
  let mode = "rose";
  let ambient = [];
  let burstParticles = [];
  let rafId = null;
  let lastTime = 0;

  // 每套皮肤对应的颜色（RGB，最后一位透明度动态控制）与形状
  const palette = {
    rose: {
      colors: [[206, 124, 144], [234, 174, 186], [193, 150, 105]],
      shape: "hearts",
      count: 26
    },
    night: {
      colors: [[170, 190, 255], [231, 207, 161], [214, 225, 255]],
      shape: "stars",
      count: 34
    },
    retro: {
      colors: [[166, 116, 68], [199, 165, 118], [132, 102, 68]],
      shape: "dust",
      count: 22
    }
  };

  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2); // 最高 2 倍，兼顾清晰度和性能
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function pickKind(shape) {
    if (shape === "hearts") return Math.random() > 0.62 ? "petal" : "heart";
    if (shape === "stars") return Math.random() > 0.45 ? "star" : "dot";
    return Math.random() > 0.82 ? "heart" : "dust";
  }

  // 生成一颗环境粒子；initial 为 true 时随机铺满屏幕
  function createAmbient(initial = false) {
    const config = palette[mode];
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + 30,
      size: randomBetween(1.2, 4.4),
      speed: randomBetween(0.16, 0.5),
      sway: randomBetween(0.08, 0.32),
      phase: Math.random() * Math.PI * 2,
      alpha: randomBetween(0.18, 0.5),
      rotation: randomBetween(0, Math.PI * 2),
      spin: randomBetween(-0.004, 0.004),
      color,
      kind: pickKind(config.shape)
    };
  }

  function buildAmbient() {
    const count = width < 640
      ? Math.round(palette[mode].count * 0.55)
      : palette[mode].count;
    ambient = Array.from({ length: count }, () => createAmbient(true));
  }

  // 画一颗心
  function drawHeart(x, y, size, rotation, alpha, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(size / 20, size / 20);
    ctx.beginPath();
    ctx.moveTo(0, 7);
    ctx.bezierCurveTo(-16, -5, -12, -21, 0, -11);
    ctx.bezierCurveTo(12, -21, 16, -5, 0, 7);
    ctx.closePath();
    ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
    ctx.fill();
    ctx.restore();
  }

  // 画一片花瓣（比心更安静）
  function drawPetal(x, y, size, rotation, alpha, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.55, size * 0.22, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
    ctx.fill();
    ctx.restore();
  }

  // 画一颗星（带柔光）
  function drawStar(x, y, size, rotation, alpha, color) {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 3.2);
    glow.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},${alpha * 0.7})`);
    glow.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, size * 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    // 四角星：两条曲线交叉，比普通星星更柔和
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(size * 0.18, -size * 0.18, size, 0);
    ctx.quadraticCurveTo(size * 0.18, size * 0.18, 0, size);
    ctx.quadraticCurveTo(-size * 0.18, size * 0.18, -size, 0);
    ctx.quadraticCurveTo(-size * 0.18, -size * 0.18, 0, -size);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
    ctx.restore();
  }

  // 画出所有粒子
  function drawAmbient(particle) {
    if (particle.kind === "heart") {
      drawHeart(particle.x, particle.y, particle.size * 1.25, particle.rotation, particle.alpha, particle.color);
    } else if (particle.kind === "petal") {
      drawPetal(particle.x, particle.y, particle.size, particle.rotation, particle.alpha * 0.8, particle.color);
    } else if (particle.kind === "star") {
      drawStar(particle.x, particle.y, particle.size, particle.rotation, particle.alpha, particle.color);
    } else {
      // dust / dot：一个小圆点，外加极淡的光圈
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particle.color[0]},${particle.color[1]},${particle.color[2]},${particle.alpha * 0.65})`;
      ctx.fill();
    }
  }

  // 心跳/切换主题时从某个坐标炸开一小簇粒子
  function burst(x, y, count = 16) {
    if (reduceMotion) return;
    const config = palette[mode];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomBetween(0.6, 2.6);
      burstParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - randomBetween(0.4, 1.4),
        size: randomBetween(2, 5.5),
        life: 1,
        decay: randomBetween(0.014, 0.028),
        rotation: Math.random() * Math.PI * 2,
        spin: randomBetween(-0.08, 0.08),
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        kind: config.shape === "stars" ? "star" : "heart"
      });
    }
    start();
  }

  function renderFrame(now) {
    if (!lastTime) lastTime = now;
    const factor = Math.min(2.4, (now - lastTime) / 16.7); // 不同刷新率下速度一致
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    // 环境粒子：缓慢向上飘
    for (const particle of ambient) {
      particle.y -= particle.speed * factor;
      particle.phase += 0.008 * factor;
      particle.x += Math.sin(particle.phase) * particle.sway * factor;
      particle.rotation += particle.spin * factor;

      if (particle.y < -24) {
        particle.y = height + 24;
        particle.x = Math.random() * width;
      }
      if (particle.x < -30) particle.x = width + 30;
      if (particle.x > width + 30) particle.x = -30;

      drawAmbient(particle);
    }

    // 爆发粒子：受一点重力影响，逐渐消失
    burstParticles = burstParticles.filter((particle) => {
      particle.x += particle.vx * factor;
      particle.y += particle.vy * factor;
      particle.vy += 0.028 * factor;
      particle.vx *= 0.992;
      particle.life -= particle.decay * factor;
      particle.rotation += particle.spin * factor;

      if (particle.life <= 0) return false;

      const alpha = Math.max(0, particle.life) * 0.75;
      if (particle.kind === "star") {
        drawStar(particle.x, particle.y, particle.size, particle.rotation, alpha, particle.color);
      } else {
        drawHeart(particle.x, particle.y, particle.size * 1.4, particle.rotation, alpha, particle.color);
      }
      return true;
    });

    rafId = requestAnimationFrame(renderFrame);
  }

  function start() {
    if (reduceMotion || rafId !== null) return;
    lastTime = 0;
    rafId = requestAnimationFrame(renderFrame);
  }

  function stop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function setMode(nextMode) {
    if (!palette[nextMode]) return;
    mode = nextMode;
    buildAmbient();
    start();
  }

  // 窗口尺寸变化时重新计算画布
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      sizeCanvas();
      buildAmbient();
    }, 180);
  });

  // 切到后台时暂停，回来后继续，省电
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  sizeCanvas();
  buildAmbient();
  start();

  return { setMode, burst, start, stop };
})();

/* ==========================================================================
   3. 封面：名字、轮播、实时计时、心跳按钮
   ========================================================================== */
let cachedStartDate = null;

function initCover() {
  // 写入名字
  const setText = (selector, value) => {
    const node = $(selector);
    if (node) node.textContent = value;
  };

  setText("#coverMe", D().names.me);
  setText("#coverPartner", D().names.partner);
  setText("#brandMe", initialOf(D().names.me));
  setText("#brandPartner", initialOf(D().names.partner));
  setText("#footerNames", `${D().names.me} & ${D().names.partner}`);
  setText("#footerYear", String(new Date().getFullYear()));
  setText("#coverQuote", fillName(D().coverQuote));

  // 解析恋爱开始日期
  cachedStartDate = new Date(D().startDate);
  const startValid = !Number.isNaN(cachedStartDate.getTime());

  if (startValid) {
    setText("#sinceDate", formatDateDot(cachedStartDate));
  } else {
    setText("#sinceDate", "请检查日期");
    console.warn("startDate 格式不对，请使用 YYYY-MM-DDTHH:mm:ss，例如 2023-05-20T20:13:00");
  }

  buildCoverSlides();
  initCoverPhotoTools();
  initHeartButton();

  // 标题连点 5 下的小彩蛋：提示页脚有信
  let titleClicks = [];
  const coverTitle = $("#coverTitle");
  if (coverTitle) {
    coverTitle.addEventListener("click", () => {
      const now = Date.now();
      titleClicks = titleClicks.filter((time) => now - time < 4000);
      titleClicks.push(now);
      if (titleClicks.length >= 5) {
        titleClicks = [];
        toast("提示：页脚藏着一封需要密码的信。");
        FX.burst(window.innerWidth / 2, window.innerHeight * 0.42, 26);
      }
    });
  }

  // 每秒刷新一次计时
  updateLiveTime();
  setInterval(updateLiveTime, 1000);
}

// 封面轮播
function buildCoverSlides() {
  const wrap = $("#coverSlides");
  const indexEl = $("#coverIndex");
  if (!wrap) return;

  const slides = Array.isArray(D().coverSlides) ? D().coverSlides : [];
  wrap.replaceChildren();

  if (!slides.length) {
    // 一张都没有时，用温润的渐变兜底
    wrap.style.background = "linear-gradient(135deg, #d8b2a8, #a86b71)";
    if (indexEl) indexEl.hidden = true;
    activeCoverIndex = 0;
    refreshCoverTools();
    return;
  }

  slides.forEach((slide, index) => {
    const img = document.createElement("img");
    img.src = effectiveCoverSrc(index);
    img.alt = "";
    img.decoding = "async";
    img.loading = index === 0 ? "eager" : "lazy";
    img.draggable = false;
    img.dataset.slideIndex = String(index);
    if (index === 0) img.classList.add("is-active");
    img.addEventListener("error", () => {
      // 找不到封面图时不显示破图标，露出渐变底
      img.style.display = "none";
    });
    wrap.appendChild(img);
  });

  if (indexEl) {
    if (slides.length === 1) {
      indexEl.hidden = true;
    } else {
      indexEl.textContent = `01 / ${pad2(slides.length)}`;
    }
  }

  activeCoverIndex = 0;
  refreshCoverTools();

  if (slides.length <= 1 || reduceMotion) return;

  let activeIndex = 0;
  setInterval(() => {
    if (document.hidden) return;
    const images = $$("img", wrap);
    if (images.length < 2) return;
    images[activeIndex].classList.remove("is-active");
    activeIndex = (activeIndex + 1) % images.length;
    images[activeIndex].classList.add("is-active");
    activeCoverIndex = activeIndex;
    if (indexEl) indexEl.textContent = `${pad2(activeIndex + 1)} / ${pad2(images.length)}`;
    refreshCoverTools();
  }, 6800);
}

// 封面照片的“换 / 还原 / 拖拽”
function initCoverPhotoTools() {
  const editButton = $("#coverEditBtn");
  const resetButton = $("#coverResetBtn");
  const cover = $("#cover");

  if (editButton) {
    editButton.addEventListener("click", () => {
      const slide = coverSlideAt(activeCoverIndex);
      pendingCoverUploadSlideId = slide ? slide.id : null;
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", async () => {
      await restoreCover();
    });
  }

  if (cover) {
    makeDropTarget(cover, async (file) => {
      await replaceCover(file);
    });
  }
}

// 把日期变成 2023.05.20 这样的格式
function formatDateDot(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "—";
  return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`;
}

// 计算某个“每年重复”的日期下一次出现的时间
function nextAnniversaryDate(month, day, now) {
  const thisYear = new Date(now.getFullYear(), month - 1, day, 0, 0, 0, 0);
  if (thisYear.getTime() > now.getTime()) return thisYear;
  return new Date(now.getFullYear() + 1, month - 1, day, 0, 0, 0, 0);
}

// 每秒更新封面上的三块数字
function updateLiveTime() {
  const now = new Date();
  if (!cachedStartDate || Number.isNaN(cachedStartDate.getTime())) return;

  const diff = now.getTime() - cachedStartDate.getTime();
  const safeDiff = Math.max(0, diff);

  // 已经在一起的天数（不足一天算 0）
  const days = Math.floor(safeDiff / 86400000);
  const remainAfterDays = safeDiff % 86400000;
  const hours = Math.floor(remainAfterDays / 3600000);
  const minutes = Math.floor((remainAfterDays % 3600000) / 60000);
  const seconds = Math.floor((remainAfterDays % 60000) / 1000);

  const elapsedDaysEl = $("#elapsedDays");
  const elapsedClockEl = $("#elapsedClock");
  const dayNumberEl = $("#dayNumber");
  const footerDaysEl = $("#footerDays");

  if (elapsedDaysEl) elapsedDaysEl.textContent = String(days);
  if (elapsedClockEl) elapsedClockEl.textContent = `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  // “第 X 天”从在一起当天算第 1 天
  if (dayNumberEl) dayNumberEl.textContent = diff < 0 ? "0" : String(days + 1);
  if (footerDaysEl) footerDaysEl.textContent = `第 ${days + 1} 天`;

  // 纪念日倒计时
  const anniversary = D().anniversary || {};
  const month = Number(anniversary.month);
  const day = Number(anniversary.day);

  if (!month || !day) return;

  const target = nextAnniversaryDate(month, day, now);
  const until = Math.max(0, target.getTime() - now.getTime());
  const dDays = Math.floor(until / 86400000);
  const dHours = Math.floor((until % 86400000) / 3600000);
  const dMinutes = Math.floor((until % 3600000) / 60000);
  const dSeconds = Math.floor((until % 60000) / 1000);

  const startYear = cachedStartDate.getFullYear();
  const years = target.getFullYear() - startYear;
  const labelEl = $("#anniversaryLabel");
  if (labelEl) {
    labelEl.textContent = years >= 1
      ? `距离 ${years} 周年纪念日`
      : "距离我们的纪念日";
  }

  const anniversaryDaysEl = $("#anniversaryDays");
  const anniversaryClockEl = $("#anniversaryClock");
  if (anniversaryDaysEl) anniversaryDaysEl.textContent = String(dDays);
  if (anniversaryClockEl) anniversaryClockEl.textContent = `${pad2(dHours)}:${pad2(dMinutes)}:${pad2(dSeconds)}`;

  // 标签页标题里偶尔展示“第几天”，让收藏夹也有一点浪漫
  const newTitle = `${D().names.partner} & ${D().names.me} · 我们的第 ${days + 1} 天`;
  if (document.title !== newTitle) document.title = newTitle;
}

// 心跳按钮：计数 + 动画 + 粒子 + 声音 + 情话
function initHeartButton() {
  const button = $("#heartBtn");
  const countEl = $("#heartCount");
  if (!button || !countEl) return;

  let count = Number(storage.get("heartCount", 0)) || 0;
  countEl.textContent = String(count);

  const heartLines = [
    "咚。收到一次心动。",
    "今天也喜欢你。",
    "喜欢是藏不住的。",
    "再点一下，就再多一点。",
    "心跳已经替你回答了。"
  ];

  button.addEventListener("click", () => {
    count += 1;
    countEl.textContent = String(count);
    storage.set("heartCount", count);

    // 重新触发 CSS 动画
    button.classList.remove("is-beating");
    void button.offsetWidth;
    button.classList.add("is-beating");

    // 从心形按钮中心炸开一簇粒子
    const rect = button.getBoundingClientRect();
    FX.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 22);

    playChime();

    if (count === 520) {
      toast("第 520 次心动，还是你。");
    } else if (count === 1314) {
      toast("第 1314 次心动。往后的每一次，也都算你。");
    } else {
      toast(heartLines[Math.floor(Math.random() * heartLines.length)], 1900);
    }
  });
}

/* ---------- 轻巧的两声“叮”，不需要任何音频文件 ---------- */
let chimeContext = null;

function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!chimeContext) chimeContext = new AudioCtx();

    // 某些浏览器在后台会挂起 AudioContext，点击时恢复
    if (chimeContext.state === "suspended") chimeContext.resume();

    const now = chimeContext.currentTime;
    [523.25, 783.99].forEach((frequency, index) => {
      const oscillator = chimeContext.createOscillator();
      const gain = chimeContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.045, now + index * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.85);
      oscillator.connect(gain).connect(chimeContext.destination);
      oscillator.start(now + index * 0.08);
      oscillator.stop(now + index * 0.08 + 0.9);
    });
  } catch (error) {
    // 浏览器不支持或用户禁用了声音，安静跳过即可
  }
}

/* ==========================================================================
   4. 照片墙 + 大图查看器
   ========================================================================== */
let lightboxIndex = 0;
let lastFocusedBeforeLightbox = null;
let activePhotoCategory = "all";

const PHOTO_CATEGORIES = [
  { id: "all", label: "全部", keywords: [] },
  { id: "food", label: "吃喝", keywords: ["奶茶", "咖啡", "火锅", "早餐", "晚饭", "面", "雪糕", "西瓜", "蛋挞", "小龙虾", "苹果", "汤圆", "饺子", "蛋糕", "面包", "便利店", "关东煮", "热可可", "野餐", "年夜饭", "青团", "大餐", "外卖"] },
  { id: "daily", label: "日常", keywords: ["散步", "下班", "买菜", "拼图", "猫", "绿植", "家", "沙发", "阳台", "洗衣", "积木", "书", "书架", "大扫除", "快递", "窗", "屋檐", "早市", "日常"] },
  { id: "travel", label: "出行", keywords: ["旅行", "海", "山", "公园", "摩天轮", "高铁", "火车", "飞机", "日出", "落日", "星空", "彩虹", "樱花", "枫叶", "天台", "河边", "贝壳", "风景", "城市"] },
  { id: "festival", label: "节日", keywords: ["生日", "纪念日", "周年", "跨年", "元旦", "圣诞", "春节", "新春", "元宵", "中秋", "七夕", "情人节", "清明", "端午", "除夕", "冬至", "六一", "妇女节", "双十一"] },
  { id: "moment", label: "重要时刻", keywords: ["第一次", "告白", "求婚", "毕业", "领证", "搬家", "婚礼", "愿望", "惊喜"] },
  { id: "love", label: "小心动", keywords: ["笑", "牵手", "拥抱", "吵架", "和好", "晚安", "心动", "喜欢", "想你", "在一起", "合照"] }
];

function photoCategoryOf(photo) {
  if (photo?.category && PHOTO_CATEGORIES.some((item) => item.id === photo.category)) return photo.category;
  const text = `${photo?.title || ""} ${photo?.alt || ""}`;
  for (const category of PHOTO_CATEGORIES) {
    if (category.id === "all") continue;
    if (category.keywords.some((keyword) => text.includes(keyword))) return category.id;
  }
  return "daily";
}

function renderPhotoFilters() {
  const filters = $("#photoFilters");
  if (!filters) return;

  const photos = Array.isArray(D().photos) ? D().photos : [];
  const counts = { all: photos.length };
  photos.forEach((photo) => {
    const id = photoCategoryOf(photo);
    counts[id] = (counts[id] || 0) + 1;
  });

  filters.replaceChildren();
  PHOTO_CATEGORIES.forEach((category) => {
    if (category.id !== "all" && !counts[category.id]) return;
    const button = make("button", `photo-filter${activePhotoCategory === category.id ? " is-active" : ""}`);
    button.type = "button";
    button.dataset.category = category.id;
    button.setAttribute("aria-pressed", String(activePhotoCategory === category.id));
    button.appendChild(document.createTextNode(category.label));
    button.appendChild(make("span", "photo-filter-count", String(counts[category.id] || 0)));
    button.addEventListener("click", () => {
      activePhotoCategory = category.id;
      applyPhotoFilter();
      renderPhotoFilters();
    });
    filters.appendChild(button);
  });
}

function applyPhotoFilter() {
  const wall = $("#photoWall");
  if (!wall) return;
  const photos = Array.isArray(D().photos) ? D().photos : [];
  $$(".photo-item", wall).forEach((figure, index) => {
    const category = photoCategoryOf(photos[index]);
    figure.classList.toggle("is-filtered-out", activePhotoCategory !== "all" && category !== activePhotoCategory);
  });
}

function initPhotoWall() {
  const wall = $("#photoWall");
  if (!wall) return;

  const photos = Array.isArray(D().photos) ? D().photos : [];
  wall.replaceChildren();
  const fragment = document.createDocumentFragment();

  photos.forEach((photo, index) => {
    // figure 本身不再是按钮，避免“按钮里套按钮”；大图由独立的全覆盖按钮打开
    const figure = make("figure", "photo-item reveal");
    figure.style.setProperty("--delay", `${Math.min(index * 0.035, 0.4)}s`);

    const image = document.createElement("img");
    image.src = effectivePhotoSrc(index);
    image.alt = photo.alt || photo.title || `第 ${index + 1} 张照片`;
    image.loading = index < 4 ? "eager" : "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
      // 图片路径写错或文件被删掉时，给出温柔的提示而不是破图标
      figure.classList.add("is-missing");
      image.hidden = true;
      if (!figure.querySelector(".photo-missing")) {
        figure.appendChild(make("span", "photo-missing", "这张照片暂时没找到"));
      }
    });

    const caption = make("figcaption");
    caption.appendChild(make("span", "photo-title", photo.title || "我们的照片"));
    caption.appendChild(make("span", "photo-date", photo.date || ""));

    const openButton = make("button", "photo-open");
    openButton.type = "button";
    openButton.setAttribute("aria-label", `查看大图：${photo.title || `第 ${index + 1} 张`}`);

    const editButton = make("label", "photo-edit");
    editButton.htmlFor = "photoFileInput";
    editButton.tabIndex = 0;
    editButton.setAttribute("role", "button");
    editButton.setAttribute("aria-label", `换第 ${index + 1} 张照片`);
    editButton.appendChild(make("i", "photo-edit-icon", "↻"));
    editButton.appendChild(make("span", "photo-edit-text", "换这张"));

    const resetButton = make("button", "photo-reset", "还原");
    resetButton.type = "button";
    resetButton.hidden = true;
    resetButton.setAttribute("aria-label", `还原第 ${index + 1} 张照片`);

    openButton.addEventListener("click", (event) => {
      event.stopPropagation();
      openLightbox(index);
    });

    editButton.addEventListener("click", (event) => {
      event.stopPropagation();
      pendingPhotoUploadIndex = index;
    });

    enableLabelKeyboard(editButton, () => {
      pendingPhotoUploadIndex = index;
    });

    resetButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      await restorePhoto(index);
    });

    figure.append(image, caption, openButton, editButton, resetButton);

    makeDropTarget(figure, (file) => replacePhoto(index, file));

    fragment.appendChild(figure);
  });

  wall.appendChild(fragment);
  renderPhotoFilters();
  applyPhotoFilter();

  const countEl = $("#photoCount");
  if (countEl) countEl.textContent = String(photos.length);

  setupLightbox();
}

function setupLightbox() {
  const lightbox = $("#lightbox");
  if (!lightbox) return;

  const closeBtn = $("#lightboxClose");
  const prevBtn = $("#lightboxPrev");
  const nextBtn = $("#lightboxNext");
  const replaceBtn = $("#lightboxReplace");
  const restoreBtn = $("#lightboxRestore");

  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", () => moveLightbox(-1));
  nextBtn.addEventListener("click", () => moveLightbox(1));

  if (replaceBtn) {
    replaceBtn.addEventListener("click", () => {
      pendingPhotoUploadIndex = lightboxIndex;
    });
  }

  if (restoreBtn) {
    restoreBtn.addEventListener("click", async () => {
      await restorePhoto(lightboxIndex);
    });
  }

  // 点击大图外侧（黑色背景）关闭
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  // 手机左右滑动切换
  let touchStartX = null;
  const figure = $(".lightbox-figure", lightbox);
  if (figure) {
    figure.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    figure.addEventListener("touchend", (event) => {
      if (touchStartX === null) return;
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 45) {
        moveLightbox(delta > 0 ? -1 : 1);
      }
      touchStartX = null;
    }, { passive: true });
  }
}

function openLightbox(index) {
  const photos = D().photos || [];
  if (!photos.length) return;

  lightboxIndex = (index + photos.length) % photos.length;
  lastFocusedBeforeLightbox = document.activeElement;

  const lightbox = $("#lightbox");
  if (!lightbox) return;

  renderLightbox();
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  syncBodyLock();

  const closeBtn = $("#lightboxClose");
  if (closeBtn) setTimeout(() => closeBtn.focus({ preventScroll: true }), 120);
}

function renderLightbox() {
  const photos = D().photos || [];
  const photo = photos[lightboxIndex];
  if (!photo) return;

  const image = $("#lightboxImg");
  const caption = $("#lightboxCaption");
  const meta = $("#lightboxMeta");
  const count = $("#lightboxCount");
  const restoreBtn = $("#lightboxRestore");

  if (image) {
    image.src = effectivePhotoSrc(lightboxIndex);
    image.alt = photo.alt || photo.title || "照片大图";
  }
  if (caption) caption.textContent = photo.title || "";
  if (meta) meta.textContent = photo.date || "";
  if (count) count.textContent = `${pad2(lightboxIndex + 1)} / ${pad2(photos.length)}`;
  if (restoreBtn) restoreBtn.hidden = !photoOverrides.photos[photo.id];
}

function moveLightbox(direction) {
  const photos = D().photos || [];
  if (!photos.length) return;
  lightboxIndex = (lightboxIndex + direction + photos.length) % photos.length;
  renderLightbox();
}

function closeLightbox() {
  const lightbox = $("#lightbox");
  if (!lightbox) return;

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  syncBodyLock();

  if (lastFocusedBeforeLightbox && typeof lastFocusedBeforeLightbox.focus === "function") {
    lastFocusedBeforeLightbox.focus({ preventScroll: true });
  }
}

/* ==========================================================================
   5. 恋爱时间线
   ========================================================================== */
function initTimeline() {
  const container = $("#timelineList");
  if (!container) return;

  const items = Array.isArray(D().timeline) ? D().timeline : [];
  container.replaceChildren();

  items.forEach((item, index) => {
    const wrapper = make("article", "timeline-item reveal");
    wrapper.style.setProperty("--delay", `${(index % 2) * 0.08}s`);

    const card = make("div", "timeline-card");
    card.appendChild(make("span", "timeline-date", item.date || "某一天"));
    card.appendChild(make("h3", "", item.title || "我们的故事"));
    card.appendChild(make("p", "", item.text || ""));

    if (item.photo) {
      const photoWrap = make("div", "timeline-photo");
      const image = document.createElement("img");
      image.src = item.photo;
      image.alt = item.title || "时间线照片";
      image.loading = "lazy";
      photoWrap.appendChild(image);
      card.appendChild(photoWrap);
    }

    const icon = make("span", "timeline-icon", item.icon || "♡");
    icon.setAttribute("aria-hidden", "true");

    wrapper.append(card, icon);
    container.appendChild(wrapper);
  });
}

/* ==========================================================================
   6. 心动抽卡
   ========================================================================== */
function initDrawGame() {
  const card = $("#quoteCard");
  const quoteText = $("#quoteText");
  const quoteNo = $("#quoteNo");
  const drawCountEl = $("#drawCount");
  const againBtn = $("#drawAgain");

  if (!card || !quoteText || !quoteNo) return;

  const quotes = Array.isArray(CONFIG.quotes) && CONFIG.quotes.length
    ? CONFIG.quotes
    : ["喜欢你，是一件很自然的事。"];

  let recentIndexes = [];
  let drawCount = Number(storage.get("drawCount", 0)) || 0;
  let locked = false;

  if (drawCountEl) drawCountEl.textContent = `已经抽了 ${drawCount} 次`;

  // 随机抽一句，避开最近 5 次出现过的，减少重复感
  function pickQuote() {
    let index = Math.floor(Math.random() * quotes.length);
    let guard = 0;
    while (recentIndexes.includes(index) && guard < 40) {
      index = Math.floor(Math.random() * quotes.length);
      guard += 1;
    }
    recentIndexes.push(index);
    if (recentIndexes.length > 5) recentIndexes.shift();
    return index;
  }

  function draw() {
    if (locked) return;

    const index = pickQuote();
    const isFlipped = card.classList.contains("is-flipped");

    const reveal = () => {
      quoteText.textContent = quotes[index];
      quoteNo.textContent = `NO. ${pad2(index + 1)}`;
      quoteText.classList.remove("is-swapping");
      void quoteText.offsetWidth; // 强制浏览器重排，让动画重新播放
      quoteText.classList.add("is-swapping");
      card.classList.add("is-flipped");
      card.setAttribute("aria-label", `情话：${quotes[index]}。点击再抽一张。`);

      drawCount += 1;
      if (drawCountEl) drawCountEl.textContent = `已经抽了 ${drawCount} 次`;
      storage.set("drawCount", drawCount);

      const rect = card.getBoundingClientRect();
      FX.burst(rect.left + rect.width / 2, rect.top + rect.height * 0.45, 10);
      locked = false;
    };

    if (isFlipped) {
      // 已经翻开时，先合上再换内容，避免情话在正面突然跳变
      card.classList.remove("is-flipped");
      locked = true;
      setTimeout(reveal, reduceMotion ? 0 : 430);
    } else {
      locked = true;
      reveal();
    }
  }

  card.addEventListener("click", draw);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      draw();
    }
  });
  if (againBtn) againBtn.addEventListener("click", draw);
}

/* ==========================================================================
   7. 默契大考验
   --------------------------------------------------------------------------
   两种玩法：
   · 两人默契：两个人分别答同一套题，不看谁对，只看谁更像对方；
   · 标准答案：按设置里预先填好的答案打分，适合主人检查。
   ========================================================================== */
function normalizeQuestions(list) {
  const out = [];
  (Array.isArray(list) ? list : []).forEach((item) => {
    const question = String(item?.question || "").trim();
    const options = (Array.isArray(item?.options) ? item.options : [])
      .map((option) => String(option ?? "").trim())
      .filter(Boolean);
    if (!question || options.length < 2) return;
    const answer = Number(item?.answer);
    out.push({
      question,
      options,
      answer: Number.isInteger(answer) && answer >= 0 && answer < options.length ? answer : -1
    });
  });
  return out;
}

function commentFor(scoreValue, total) {
  const ratio = total ? scoreValue / total : 0;
  if (ratio >= 0.99) {
    return {
      title: "满分默契，心有灵犀",
      text: "你们几乎不用解释就能明白对方。请继续保持这种认真观察彼此的习惯，它比“天生一对”更可靠。"
    };
  }
  if (ratio >= 0.8) {
    return {
      title: "很懂彼此，只差一个小秘密",
      text: "大部分答案都对上了，说明平时真的有在认真记住对方。剩下那一题，今晚可以当作聊天的话题。"
    };
  }
  if (ratio >= 0.6) {
    return {
      title: "默契正在长出来",
      text: "一半是熟悉，一半是惊喜。关系里最有趣的部分，就是还有那么多可以慢慢知道的事。"
    };
  }
  if (ratio >= 0.4) {
    return {
      title: "还需要多一点小观察",
      text: "别急着气馁，喜欢本来就是一个不断了解的过程。答案不重要，愿意去懂对方才重要。"
    };
  }
  if (ratio >= 0.2) {
    return {
      title: "我们还在互相翻译",
      text: "看来彼此还有不少“使用说明”没被发现。下一次约会，试试问一个从没问过的小问题。"
    };
  }
  return {
    title: "重新认识一遍，也很好",
    text: "那就从今天开始重新认识吧。认真听、认真记住，比答对几道题更像爱。"
  };
}

function initQuiz() {
  const body = $("#quizBody");
  if (!body) return;

  const allQuestions = normalizeQuestions(D().quiz);
  const standardQuestions = allQuestions.filter((item) => item.answer >= 0);
  const fallbackQuestion = {
    question: "今天最想和 TA 做什么？",
    options: ["吃饭", "散步", "发呆", "都行"],
    answer: -1
  };
  const questions = allQuestions.length ? allQuestions : [fallbackQuestion];

  let mode = null;
  let current = 0;
  let advancing = false;
  let firstAnswers = [];
  let secondAnswers = [];
  let standardAnswers = [];
  let standardScore = 0;

  function renderDots(total, doneCount) {
    const dots = make("div", "quiz-dots");
    dots.setAttribute("aria-hidden", "true");
    for (let index = 0; index < total; index += 1) {
      const dot = make("i");
      if (index < doneCount) dot.classList.add("is-done");
      if (index === doneCount) dot.classList.add("is-current");
      dots.appendChild(dot);
    }
    return dots;
  }

  function renderMenu() {
    mode = null;
    body.replaceChildren();

    const menu = make("div", "quiz-menu");
    menu.appendChild(make("p", "quiz-menu-title", "选一种玩法"));
    menu.appendChild(make("p", "quiz-menu-copy", "答案不再由网站替你们决定。你们可以互相猜，也可以由主人提前设置标准答案。"));

    const pairButton = make("button", "quiz-mode-card");
    pairButton.type = "button";
    pairButton.appendChild(make("strong", "", "两人默契模式"));
    pairButton.appendChild(make("span", "", `${D().names.me} 先答，${D().names.partner} 再答，最后看你们像不像。`));
    pairButton.addEventListener("click", startPairMode);
    menu.appendChild(pairButton);

    const standardButton = make("button", "quiz-mode-card");
    standardButton.type = "button";
    standardButton.appendChild(make("strong", "", "标准答案模式"));
    standardButton.appendChild(make("span", "", standardQuestions.length ? `共 ${standardQuestions.length} 道已设置答案的题。` : "还没有设置标准答案，先去 ⚙ 设置 → 默契题。"));
    standardButton.disabled = standardQuestions.length === 0;
    standardButton.addEventListener("click", startStandardMode);
    menu.appendChild(standardButton);

    body.appendChild(menu);
  }

  function startPairMode() {
    mode = "pair";
    current = 0;
    firstAnswers = [];
    secondAnswers = [];
    renderPairQuestion("first");
  }

  function startStandardMode() {
    mode = "standard";
    current = 0;
    standardScore = 0;
    standardAnswers = [];
    renderStandardQuestion();
  }

  function renderPairQuestion(stage) {
    const question = questions[current];
    const isSecond = stage === "second";
    const savedAnswers = isSecond ? secondAnswers : firstAnswers;
    body.replaceChildren();

    const top = make("div", "quiz-top");
    top.appendChild(make("span", "quiz-step", `${isSecond ? D().names.partner : D().names.me} · 第 ${current + 1} 题 / 共 ${questions.length} 题`));
    top.appendChild(renderDots(questions.length, current));

    const title = make("h4", "quiz-question", question.question);
    title.setAttribute("aria-live", "polite");

    const options = make("div", "quiz-options");
    const letters = ["A", "B", "C", "D", "E"];
    question.options.forEach((option, index) => {
      const button = make("button", "quiz-option");
      button.type = "button";
      button.appendChild(make("span", "option-letter", letters[index] || String(index + 1)));
      button.appendChild(make("span", "", option));
      button.addEventListener("click", () => {
        if (advancing) return;
        advancing = true;
        savedAnswers.push(index);
        current += 1;
        setTimeout(() => {
          advancing = false;
          if (current < questions.length) renderPairQuestion(stage);
          else if (stage === "first") renderPairHandoff();
          else renderPairResult();
        }, reduceMotion ? 0 : 160);
      });
      options.appendChild(button);
    });

    const hint = make("p", "quiz-hint", isSecond ? "第二个人作答时，先不要偷看上一个答案。" : "第一个人先答，答完再换人。");
    body.append(top, title, options, hint);
  }

  function renderPairHandoff() {
    body.replaceChildren();
    const wrap = make("div", "quiz-result");
    wrap.appendChild(make("h4", "", `${D().names.me} 答完了`));
    wrap.appendChild(make("p", "quiz-comment", `现在把手机递给 ${D().names.partner}。下一轮不会显示刚才的答案。`));
    const button = make("button", "btn btn-primary", `换 ${D().names.partner} 作答`);
    button.type = "button";
    button.addEventListener("click", () => {
      current = 0;
      renderPairQuestion("second");
    });
    wrap.appendChild(button);
    body.appendChild(wrap);
  }

  function renderPairResult() {
    const matches = firstAnswers.filter((answer, index) => answer === secondAnswers[index]).length;
    const comment = commentFor(matches, questions.length);
    const bestKey = "quizBestPair";
    const bestBefore = Number(storage.get(bestKey, 0)) || 0;
    if (matches > bestBefore) storage.set(bestKey, matches);
    const best = Math.max(bestBefore, matches);

    body.replaceChildren();
    const result = make("div", "quiz-result");
    const ring = make("div", "score-ring");
    ring.style.setProperty("--score-angle", `${(matches / questions.length) * 360}deg`);
    const scoreValue = make("span", "score-value", String(matches));
    scoreValue.appendChild(make("small", "", ` / ${questions.length}`));
    ring.appendChild(scoreValue);

    result.append(
      ring,
      make("h4", "", comment.title),
      make("p", "quiz-comment", `你们有 ${matches} 道题选到了一起。${comment.text}`),
      make("p", "quiz-best", `本机最高默契纪录：${best} / ${questions.length}`)
    );

    const review = make("div", "quiz-review");
    questions.forEach((question, index) => {
      const a = question.options[firstAnswers[index]];
      const b = question.options[secondAnswers[index]];
      const same = firstAnswers[index] === secondAnswers[index];
      const row = make("div", `review-row ${same ? "is-right" : "is-wrong"}`);
      row.appendChild(make("span", "review-mark", same ? "✓" : "×"));
      const text = make("span", "review-text");
      text.appendChild(make("strong", "", question.question));
      text.appendChild(document.createElement("br"));
      text.appendChild(document.createTextNode(`${D().names.me}：${a || "未作答"} · ${D().names.partner}：${b || "未作答"}`));
      row.appendChild(text);
      review.appendChild(row);
    });

    result.appendChild(review);
    const again = make("button", "btn btn-primary", "再玩一次");
    again.type = "button";
    again.addEventListener("click", startPairMode);
    result.appendChild(again);
    body.appendChild(result);

    if (matches === questions.length) {
      const rect = body.getBoundingClientRect();
      FX.burst(rect.left + rect.width / 2, rect.top + 80, 34);
      setTimeout(() => FX.burst(rect.left + rect.width * 0.28, rect.top + 120, 18), 220);
      setTimeout(() => FX.burst(rect.left + rect.width * 0.72, rect.top + 120, 18), 420);
    }
  }

  function renderStandardQuestion() {
    const question = standardQuestions[current];
    body.replaceChildren();

    const top = make("div", "quiz-top");
    top.appendChild(make("span", "quiz-step", `第 ${current + 1} 题 / 共 ${standardQuestions.length} 题`));
    top.appendChild(renderDots(standardQuestions.length, current));

    const title = make("h4", "quiz-question", question.question);
    title.setAttribute("aria-live", "polite");

    const options = make("div", "quiz-options");
    const letters = ["A", "B", "C", "D", "E"];
    question.options.forEach((option, index) => {
      const button = make("button", "quiz-option");
      button.type = "button";
      button.appendChild(make("span", "option-letter", letters[index] || String(index + 1)));
      button.appendChild(make("span", "", option));
      button.addEventListener("click", () => {
        if (advancing) return;
        advancing = true;
        $$(".quiz-option", options).forEach((item, itemIndex) => {
          item.disabled = true;
          item.classList.add(itemIndex === index ? "is-selected" : "is-muted");
        });
        const isRight = index === question.answer;
        if (isRight) standardScore += 1;
        standardAnswers.push({
          question: question.question,
          chosen: question.options[index],
          correct: question.options[question.answer],
          isRight
        });
        setTimeout(() => {
          current += 1;
          advancing = false;
          if (current < standardQuestions.length) renderStandardQuestion();
          else renderStandardResult();
        }, reduceMotion ? 0 : 360);
      });
      options.appendChild(button);
    });

    const hint = make("p", "quiz-hint", "这是标准答案模式 · 答案由你们在设置里自己决定");
    body.append(top, title, options, hint);
  }

  function renderStandardResult() {
    const comment = commentFor(standardScore, standardQuestions.length);
    const bestKey = "quizBestStandard";
    const bestBefore = Number(storage.get(bestKey, 0)) || 0;
    if (standardScore > bestBefore) storage.set(bestKey, standardScore);
    const best = Math.max(bestBefore, standardScore);

    body.replaceChildren();
    const result = make("div", "quiz-result");
    const ring = make("div", "score-ring");
    ring.style.setProperty("--score-angle", `${(standardScore / standardQuestions.length) * 360}deg`);
    const scoreValue = make("span", "score-value", String(standardScore));
    scoreValue.appendChild(make("small", "", ` / ${standardQuestions.length}`));
    ring.appendChild(scoreValue);

    result.append(
      ring,
      make("h4", "", comment.title),
      make("p", "quiz-comment", comment.text),
      make("p", "quiz-best", `本机最高纪录：${best} / ${standardQuestions.length}`)
    );

    const review = make("div", "quiz-review");
    standardAnswers.forEach((answer) => {
      const row = make("div", `review-row ${answer.isRight ? "is-right" : "is-wrong"}`);
      row.appendChild(make("span", "review-mark", answer.isRight ? "✓" : "×"));
      const text = make("span", "review-text");
      text.appendChild(make("strong", "", answer.question));
      text.appendChild(document.createElement("br"));
      text.appendChild(document.createTextNode(
        answer.isRight ? `答对了：${answer.correct}` : `你选了「${answer.chosen}」，答案是「${answer.correct}」`
      ));
      row.appendChild(text);
      review.appendChild(row);
    });
    result.appendChild(review);

    const again = make("button", "btn btn-primary", "再答一次");
    again.type = "button";
    again.addEventListener("click", startStandardMode);
    const back = make("button", "btn btn-ghost", "换一种玩法");
    back.type = "button";
    back.addEventListener("click", renderMenu);
    result.append(again, back);
    body.appendChild(result);

    if (standardScore === standardQuestions.length) {
      const rect = body.getBoundingClientRect();
      FX.burst(rect.left + rect.width / 2, rect.top + 80, 34);
      setTimeout(() => FX.burst(rect.left + rect.width * 0.28, rect.top + 120, 18), 220);
      setTimeout(() => FX.burst(rect.left + rect.width * 0.72, rect.top + 120, 18), 420);
    }
  }

  renderMenu();
}

/* ==========================================================================
   7.5 恋爱清单：想一起完成的小事
   ========================================================================== */
const DEFAULT_BUCKET_LIST = [
  "一起喝一杯没试过的奶茶",
  "凌晨去便利店吃一次关东煮",
  "一起认真做一顿饭",
  "在下雨的午后看一部老电影",
  "去海边看一次日出",
  "一起逛一次菜市场",
  "给对方拍一组不修图的日常",
  "手写过一封信",
  "一起拼完一幅 1000 块拼图",
  "坐一趟不知道终点的公交",
  "一起养一盆很难养死的绿植",
  "在山顶看一次日落",
  "一起完成一次大扫除",
  "为对方做一桌黑暗料理",
  "在深夜散步时把心里话说出来",
  "一起看一场演唱会或 livehouse",
  "把第一次约会再走一遍",
  "一起挑一件家里的小东西",
  "吵架后当天把话说开",
  "给十年后的彼此写一封信"
];

function normalizeBucketList(input) {
  const list = Array.isArray(input) ? input : DEFAULT_BUCKET_LIST;
  return list.slice(0, 100).map((item, index) => {
    if (isPlainObject(item)) {
      return {
        id: safeText(item.id, 60, `bucket-${index}`),
        text: safeText(item.text, 36, "一件想一起完成的小事"),
        done: Boolean(item.done)
      };
    }
    return {
      id: `bucket-${index}`,
      text: safeText(item, 36, "一件想一起完成的小事"),
      done: false
    };
  }).filter((item) => item.text);
}

function initBucket() {
  const list = $("#bucketList");
  const form = $("#bucketForm");
  const input = $("#bucketInput");
  if (!list || !form || !input) return;

  let items = normalizeBucketList(storage.get("bucketList", null));

  function save() {
    storage.set("bucketList", items);
  }

  function render() {
    const done = items.filter((item) => item.done).length;
    $("#bucketDone") && ($("#bucketDone").textContent = String(done));
    $("#bucketTotal") && ($("#bucketTotal").textContent = String(items.length));
    const fill = $("#bucketProgressFill");
    if (fill) fill.style.width = `${items.length ? (done / items.length) * 100 : 0}%`;

    list.replaceChildren();
    if (!items.length) {
      const empty = make("li", "bucket-empty", "清单还是空的。先加一件很小很小的事。");
      list.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      const li = make("li", `bucket-item${item.done ? " is-done" : ""}`);

      const check = make("button", "bucket-check", item.done ? "✓" : "");
      check.type = "button";
      check.setAttribute("aria-label", item.done ? `取消完成：${item.text}` : `标记完成：${item.text}`);
      check.setAttribute("aria-pressed", String(item.done));
      check.addEventListener("click", () => {
        item.done = !item.done;
        save();
        render();
        if (item.done) {
          const rect = li.getBoundingClientRect();
          FX.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
          toast("又一起完成了一件小事。");
        }
      });

      const text = make("span", "bucket-text", item.text);
      const del = make("button", "bucket-delete", "×");
      del.type = "button";
      del.setAttribute("aria-label", `删除：${item.text}`);
      del.addEventListener("click", () => {
        if (!window.confirm(`删除「${item.text}」吗？`)) return;
        items = items.filter((entry) => entry.id !== item.id);
        save();
        render();
      });

      li.append(check, text, del);
      list.appendChild(li);
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim().slice(0, 36);
    if (!text) {
      toast("先写一件想一起做的事。");
      input.focus();
      return;
    }
    if (items.length >= 100) {
      toast("清单最多 100 件，先删掉几件吧。");
      return;
    }
    items.push({ id: `bucket-${Date.now().toString(36)}`, text, done: false });
    save();
    input.value = "";
    render();
    toast("加好了。");
  });

  render();
}

/* ==========================================================================
   8. 留言板（localStorage 本地保存）
   ========================================================================== */
function initMessages() {
  const form = $("#messageForm");
  const nameInput = $("#messageName");
  const textInput = $("#messageText");
  const countEl = $("#messageCount");
  const list = $("#messageList");
  if (!form || !nameInput || !textInput || !list) return;

  // 记住上次的署名，下次打开自动填上
  const savedName = storage.get("messageName", "");
  if (savedName) nameInput.value = savedName;

  function updateCount() {
    if (countEl) countEl.textContent = `${textInput.value.length} / 200`;
  }

  textInput.addEventListener("input", updateCount);
  updateCount();

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = textInput.value.trim();
    if (!text) {
      toast("还没写内容呢，先写一句吧。");
      textInput.focus();
      return;
    }

    const name = nameInput.value.trim().slice(0, 12) || "匿名";
    const message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      text,
      createdAt: Date.now()
    };

    const messages = readMessages();
    messages.unshift(message);
    const saved = writeMessages(messages.slice(0, 200));

    if (!saved) {
      toast("浏览器禁止了本地保存，请关闭无痕模式后再试。");
      return;
    }

    storage.set("messageName", name === "匿名" ? "" : name);
    form.reset();
    // reset 会清空署名；如果不是匿名，就帮对方重新填上，方便连续写
    if (name !== "匿名") nameInput.value = name;
    updateCount();
    renderMessages();
    toast("已经放进留言盒了。");

    // 新留言出现在列表顶部，自动滚过去
    list.scrollTop = 0;
    textInput.focus();
  });

  // 删除留言：用事件委托，一条监听搞定所有按钮
  list.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".message-delete");
    if (!deleteButton) return;

    const id = deleteButton.dataset.id;
    if (!id) return;
    if (!window.confirm("要删除这条留言吗？删除后无法恢复。")) return;

    const messages = readMessages().filter((message) => message.id !== id);
    writeMessages(messages);
    renderMessages();
    toast("这条留言已经收起来了。");
  });

  function readMessages() {
    const data = storage.get("messages", []);
    return Array.isArray(data) ? data : [];
  }

  function writeMessages(messages) {
    return storage.set("messages", messages);
  }

  function renderMessages() {
    const messages = readMessages().slice().sort((a, b) => b.createdAt - a.createdAt);
    list.replaceChildren();

    if (!messages.length) {
      const empty = make("div", "empty-messages");
      empty.appendChild(make("span", "", "♡"));
      empty.appendChild(document.createTextNode("还没有留言。第一句，就留给你吧。"));
      list.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    messages.forEach((message) => {
      const item = make("article", "message-item");
      item.dataset.id = message.id;

      const head = make("header", "message-head");
      head.appendChild(make("span", "message-name", message.name || "匿名"));
      head.appendChild(make("time", "message-time", formatMessageTime(message.createdAt)));

      const text = make("p", "message-text", message.text);

      const deleteButton = make("button", "message-delete", "×");
      deleteButton.type = "button";
      deleteButton.dataset.id = message.id;
      deleteButton.setAttribute("aria-label", `删除“${message.name || "匿名"}”的留言`);
      deleteButton.title = "删除这条留言";

      item.append(head, text, deleteButton);
      fragment.appendChild(item);
    });

    list.appendChild(fragment);
  }

  renderMessages();
}

function formatMessageTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/* ==========================================================================
   9. 彩蛋：密码信、隐藏视频、生日祝福、隐藏情话
   ========================================================================== */
const previewParams = new URLSearchParams(window.location.search);
const previewMode = previewParams.get("preview");
let letterBuilt = false;

function initSecrets() {
  // 把可配置文字写进弹层
  const letterTitle = $("#letterTitle");
  const letterSign = $("#letterSign");
  if (letterTitle) letterTitle.textContent = fillName(D().letter.title || "写给你的一封信");
  if (letterSign) letterSign.textContent = fillName(D().letter.sign || `—— ${D().names.me}`);

  const birthdayTitle = $("#birthdayTitle");
  const birthdayBody = $("#birthdayBody");
  if (birthdayTitle) birthdayTitle.textContent = fillName(D().birthday.title || "生日快乐");
  if (birthdayBody) birthdayBody.textContent = fillName(D().birthday.message || "今天也要开心。");

  const hiddenNote = $("#hiddenNote");
  if (hiddenNote) hiddenNote.textContent = fillName(D().hiddenMessage || "今天也偷偷多爱你一点。");

  // 打开所有带 data-close 的关闭按钮/遮罩
  $$("[data-close]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const modal = document.getElementById(trigger.dataset.close);
      if (modal) closeModal(modal);
    });
  });

  // 页脚的信
  const secretEntry = $("#secretEntry");
  if (secretEntry) {
    secretEntry.addEventListener("click", openLetter);
  }

  // 密码表单
  const unlockForm = $("#unlockForm");
  if (unlockForm) {
    unlockForm.addEventListener("submit", (event) => {
      event.preventDefault();
      tryUnlock();
    });
  }

  // 隐藏视频按钮：只有点击时才加载
  const playVideoBtn = $("#playSecretVideo");
  if (playVideoBtn) {
    playVideoBtn.addEventListener("click", playSecretVideo);
  }

  // 用户可以直接上传/拖拽视频，不用先改 CONFIG
  const uploadVideoBtn = $("#uploadSecretVideo");
  if (uploadVideoBtn) {
    uploadVideoBtn.addEventListener("click", () => {
      pendingVideoUpload = true;
    });
  }

  const restoreVideoBtn = $("#restoreSecretVideo");
  if (restoreVideoBtn) {
    restoreVideoBtn.addEventListener("click", async () => {
      await restoreSecretVideo();
    });
  }

  makeDropTarget($("#letterVideoWrap"), async (file) => {
    await replaceSecretVideo(file);
  });

  // 页脚小爱心：4 秒内点 7 下
  const hiddenHeart = $("#hiddenHeart");
  if (hiddenHeart) {
    let clicks = [];
    hiddenHeart.addEventListener("click", () => {
      const now = Date.now();
      clicks = clicks.filter((time) => now - time < 4000);
      clicks.push(now);

      // 每次点击给一点小反馈
      const rect = hiddenHeart.getBoundingClientRect();
      FX.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 5);

      if (clicks.length >= 7) {
        clicks = [];
        const note = $("#hiddenNote");
        if (note) note.hidden = false;
        toast("你发现了一个小小的秘密。");
        const noteRect = note ? note.getBoundingClientRect() : hiddenHeart.getBoundingClientRect();
        FX.burst(noteRect.left + noteRect.width / 2, noteRect.top, 24);
      }
    });
  }

  // 生日彩蛋：当天自动弹出，每天只弹一次
  maybeShowBirthday();

  // 预览参数：调试 / 截图时使用，正常送礼不会触发
  // ?preview=letter 可直接看信（会跳过密码），?preview=birthday 直接看生日弹层
  if (previewMode === "letter") {
    buildLetter();
    openModal($("#letterModal"));
    showLetter(true);
  } else if (previewMode === "birthday") {
    showBirthday(false);
  }
}

const modalRestoreFocus = new WeakMap();

function focusableWithin(container) {
  return $$("a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), video, [tabindex]:not([tabindex='-1'])", container)
    .filter((element) => element.offsetParent !== null);
}

function trapFocusInside(event, container) {
  if (!container || event.key !== "Tab") return;
  const focusable = focusableWithin(container);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  } else if (!container.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
  }
}

function openModal(modal) {
  if (!modal) return;

  modalRestoreFocus.set(modal, document.activeElement);
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  syncBodyLock();

  const panel = $(".modal-panel", modal);
  if (panel) panel.scrollTop = 0;

  // 稍等过渡开始后再聚焦，避免页面跳动
  setTimeout(() => {
    const focusTarget = modal.querySelector("input, button:not(.modal-close)");
    if (focusTarget) focusTarget.focus({ preventScroll: true });
  }, 180);
}

function closeModal(modal) {
  if (!modal) return;

  const restoreTarget = modalRestoreFocus.get(modal);
  modalRestoreFocus.delete(modal);
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  syncBodyLock();

  // 关闭时暂停视频，避免声音在后台继续播放
  const video = $("video", modal);
  if (video) video.pause();

  if (restoreTarget && typeof restoreTarget.focus === "function" && document.contains(restoreTarget)) {
    restoreTarget.focus({ preventScroll: true });
  }
}

function openLetter() {
  buildLetter();
  const modal = $("#letterModal");
  if (!modal) return;

  const unlocked = storage.get("letterUnlocked", false) === true || previewMode === "letter";
  if (unlocked) showLetter(false);
  else showLock();
  openModal(modal);
  FX.burst(window.innerWidth / 2, window.innerHeight / 2, 12);
}

function showLock() {
  const lockPanel = $("#lockPanel");
  const letterPanel = $("#letterPanel");
  if (lockPanel) lockPanel.hidden = false;
  if (letterPanel) letterPanel.hidden = true;

  const input = $("#secretInput");
  const error = $("#lockError");
  if (input) {
    input.value = "";
    input.classList.remove("is-wrong");
  }
  if (error) error.textContent = "";

  // 两种解锁方式：自定义密码，或答对几道默契题
  const useQuiz = D().unlockMode === "quiz" && normalizeQuiz(D().quiz).length >= 1;
  const passwordForm = $("#unlockForm");
  const quizLock = $("#quizLock");
  if (quizLock) quizLock.hidden = !useQuiz;
  if (passwordForm) passwordForm.hidden = useQuiz;
  if (useQuiz) startQuizLock();
}

/* ---------- 答题解锁：答对设置里挑出的默契题，信才会开 ---------- */
let quizLockState = null;

function startQuizLock() {
  const body = $("#quizLockBody");
  if (!body) return;
  const pool = shuffleArray(normalizeQuiz(D().quiz)).slice(0, 3);
  quizLockState = { questions: pool, current: 0 };
  renderQuizLockStep();
}

function renderQuizLockStep() {
  const body = $("#quizLockBody");
  const errorEl = $("#lockError");
  if (!body || !quizLockState) return;
  body.replaceChildren();
  if (errorEl) errorEl.textContent = "";

  const state = quizLockState;
  const question = state.questions[state.current];

  const step = make("div", "quiz-lock-step");
  step.appendChild(make("p", "quiz-lock-count", `第 ${state.current + 1} 题 · 共 ${state.questions.length} 题`));
  step.appendChild(make("h4", "quiz-lock-question", question.question));

  const options = make("div", "quiz-lock-options");
  question.options.forEach((option, index) => {
    const button = make("button", "quiz-option", option);
    button.type = "button";
    button.addEventListener("click", () => {
      if (index === question.answer) {
        $$("button", options).forEach((item) => {
          item.disabled = true;
        });
        button.classList.add("is-selected");
        state.current += 1;
        if (errorEl) errorEl.textContent = "";
        if (state.current >= state.questions.length) {
          setTimeout(unlockLetter, 320);
        } else {
          setTimeout(renderQuizLockStep, 380);
        }
      } else {
        button.classList.add("is-wrong");
        setTimeout(() => button.classList.remove("is-wrong"), 480);
        if (errorEl) errorEl.textContent = "再想想，这是我们之间才懂的小事。";
      }
    });
    options.appendChild(button);
  });

  step.appendChild(options);
  body.appendChild(step);
}

function unlockLetter() {
  storage.set("letterUnlocked", true);
  showLetter(false);
  toast("都答对了，这封信是你的。");
  FX.burst(window.innerWidth / 2, window.innerHeight / 2, 26);
}

function showLetter(fromPreview = false) {
  const lockPanel = $("#lockPanel");
  const letterPanel = $("#letterPanel");
  if (lockPanel) lockPanel.hidden = true;
  if (letterPanel) letterPanel.hidden = false;

  const videoWrap = $("#letterVideoWrap");
  if (videoWrap) {
    // 默认文件路径和用户上传的视频，两个来源任一存在就显示
    videoWrap.hidden = !D().secretVideo && !secretVideoBlob;
    updateLetterVideoArea();
  }

  if (!fromPreview) {
    // 解锁成功后滚动到信的顶部
    const panel = $(".letter-panel");
    if (panel) panel.scrollTop = 0;
  }
}

function tryUnlock() {
  const input = $("#secretInput");
  const error = $("#lockError");
  if (!input) return;

  const entered = input.value.trim();
  const expected = String(D().secretPassword || "").trim();

  if (!entered) {
    if (error) error.textContent = "先输入密码，再打开这封信。";
    input.focus();
    return;
  }

  if (entered === expected) {
    storage.set("letterUnlocked", true);
    if (error) error.textContent = "";
    input.classList.remove("is-wrong");
    showLetter(false);
    toast("信打开了。慢慢读。");
    FX.burst(window.innerWidth / 2, window.innerHeight / 2, 26);
  } else {
    if (error) error.textContent = "密码不对，再想想我们之间的那串数字。";
    input.classList.remove("is-wrong");
    void input.offsetWidth;
    input.classList.add("is-wrong");
    input.select();
  }
}

function buildLetter() {
  if (letterBuilt) return;
  letterBuilt = true;

  const body = $("#letterBody");
  if (!body) return;

  const paragraphs = Array.isArray(D().letter.paragraphs) ? D().letter.paragraphs : [];
  body.replaceChildren();
  paragraphs.forEach((paragraph) => {
    body.appendChild(make("p", "", fillName(paragraph)));
  });

  // 给末尾加一句日期落款，日期取今天
  const today = new Date();
  const dateLine = make("p", "letter-date", `${today.getFullYear()} 年 ${today.getMonth() + 1} 月 ${today.getDate()} 日`);
  dateLine.style.opacity = "0.6";
  dateLine.style.fontSize = "0.72rem";
  dateLine.style.letterSpacing = "0.08em";
  body.appendChild(dateLine);
}

function playSecretVideo() {
  const video = $("#secretVideo");
  const button = $("#playSecretVideo");
  const fallback = $("#videoFallback");
  if (!video) return;

  const source = secretVideoUrl || D().secretVideo;
  const sourceKey = secretVideoUrl ? "uploaded" : `file:${D().secretVideo || ""}`;

  if (!source) {
    if (fallback) {
      fallback.textContent = "还没有视频。点「上传视频」，或把视频命名为 secret.mp4 放进 assets/video/。";
      fallback.hidden = false;
    }
    return;
  }

  if (video.dataset.sourceKey !== sourceKey) {
    video.dataset.sourceKey = sourceKey;
    if (fallback) fallback.hidden = true;
    video.addEventListener("error", () => {
      // 文件不存在或格式浏览器不支持
      video.hidden = true;
      if (fallback) fallback.hidden = false;
      if (button) button.hidden = true;
    }, { once: true });
    video.src = source;
    video.load();
  }

  video.hidden = false;
  if (button) button.hidden = true;

  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      // 有些浏览器需要用户再点一次原生播放键，不弹错误也可以
    });
  }
}

function maybeShowBirthday() {
  const birthday = D().birthday || {};
  if (!birthday.monthDay) return;

  const parts = String(birthday.monthDay).trim().split("-");
  if (parts.length < 2) return;
  const month = Number(parts[parts.length - 2]);
  const day = Number(parts[parts.length - 1]);
  if (!month || !day) return;

  const now = new Date();
  const isToday = now.getMonth() + 1 === month && now.getDate() === day;
  if (!isToday) return;

  // 每天只弹一次，避免频繁打开页面被反复打扰
  const todayKey = `birthdayShown.${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  if (storage.get(todayKey, false) === true) return;

  setTimeout(() => showBirthday(true), 1500);
}

function showBirthday(remember = true) {
  const modal = $("#birthdayModal");
  if (!modal) return;

  const title = $("#birthdayTitle");
  const body = $("#birthdayBody");
  if (title) title.textContent = fillName(D().birthday.title || `生日快乐，${D().names.partner}`);
  if (body) body.textContent = fillName(D().birthday.message || "今天也要开心。");

  openModal(modal);
  toast(`今天是 ${D().names.partner} 的生日。`);

  if (remember) {
    const now = new Date();
    const key = `birthdayShown.${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
    storage.set(key, true);
  }

  // 三小簇彩纸般的心，在弹层后面炸开
  setTimeout(() => FX.burst(window.innerWidth * 0.5, window.innerHeight * 0.35, 30), 250);
  setTimeout(() => FX.burst(window.innerWidth * 0.3, window.innerHeight * 0.5, 18), 500);
  setTimeout(() => FX.burst(window.innerWidth * 0.7, window.innerHeight * 0.5, 18), 720);
}

/* ==========================================================================
   10. 背景音乐
   ========================================================================== */
function initMusic() {
  const button = $("#musicToggle");
  if (!button || !CONFIG.music) return;

  let audio = null;
  let fadeTimer = null;
  let wantsPlay = false;

  try {
    audio = new Audio(CONFIG.music);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
  } catch (error) {
    audio = null;
  }

  if (!audio) {
    button.addEventListener("click", () => toast("这个浏览器暂时不能播放背景音乐。"));
    return;
  }

  function setPlayingUI(isPlaying) {
    button.classList.toggle("is-playing", isPlaying);
    button.setAttribute("aria-pressed", String(isPlaying));
    button.setAttribute("aria-label", isPlaying ? "暂停背景音乐" : "播放背景音乐");
    button.title = isPlaying ? "暂停我们的歌" : "播放我们的歌";
  }

  function fadeTo(targetVolume, duration, onDone) {
    clearInterval(fadeTimer);
    const startVolume = audio.volume;
    const steps = Math.max(1, Math.round(duration / 40));
    let step = 0;

    fadeTimer = setInterval(() => {
      step += 1;
      const progress = step / steps;
      audio.volume = Math.min(1, Math.max(0, startVolume + (targetVolume - startVolume) * progress));
      if (step >= steps) {
        clearInterval(fadeTimer);
        fadeTimer = null;
        if (onDone) onDone();
      }
    }, 40);
  }

  audio.addEventListener("error", () => {
    setPlayingUI(false);
    if (wantsPlay) {
      toast("没找到背景音乐。把你们的歌命名为 bgm.mp3，放进 assets/music/ 再刷新。");
      wantsPlay = false;
    }
  });

  button.addEventListener("click", () => {
    if (audio.paused) {
      wantsPlay = true;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.then(() => {
          setPlayingUI(true);
          audio.volume = 0;
          fadeTo(0.32, 900);
          toast("音乐开始播放。");
        }).catch(() => {
          setPlayingUI(false);
          toast("音乐没能播放：请确认 assets/music/ 里的文件存在。");
        });
      }
    } else {
      wantsPlay = false;
      fadeTo(0, 450, () => {
        audio.pause();
        setPlayingUI(false);
      });
    }
  });

  // 页面隐藏时只把音量降下来，回来后恢复，避免在后台吓到人
  document.addEventListener("visibilitychange", () => {
    if (!audio || audio.paused) return;
    if (document.hidden) {
      audio.dataset.previousVolume = String(audio.volume);
      audio.volume = 0;
    } else {
      audio.volume = Number(audio.dataset.previousVolume || 0.32);
    }
  });
}

/* ==========================================================================
   11. 导航、滚动进度、返回顶部
   ========================================================================== */
function initNavigation() {
  const topbar = $("#topbar");
  const progress = $("#scrollProgress");
  const backToTop = $("#backToTop");
  const navLinks = $$(".main-nav a");
  const sections = navLinks
    .map((link) => document.getElementById(link.dataset.nav))
    .filter(Boolean);

  let ticking = false;

  function updateScrollUI() {
    ticking = false;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // 顶部导航离开封面后变磨砂玻璃
    if (topbar) {
      const shouldShrink = scrollTop > 30;
      topbar.classList.toggle("is-scrolled", shouldShrink);
      document.body.classList.toggle("is-scrolled", shouldShrink);
    }

    // 滚动进度条
    if (progress) {
      const percent = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      progress.style.width = `${percent}%`;
    }

    // 返回顶部按钮
    if (backToTop) backToTop.classList.toggle("is-visible", scrollTop > 620);

    // 当前所在板块的高亮
    const probe = scrollTop + window.innerHeight * 0.36;
    let activeId = "";
    sections.forEach((section) => {
      const top = section.getBoundingClientRect().top + scrollTop;
      if (top <= probe) activeId = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.nav === activeId);
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScrollUI);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  // 首次进入时也要算一次
  updateScrollUI();
}

/* ==========================================================================
   12. 滚动出现动画
   ========================================================================== */
function initReveal() {
  const items = $$(".reveal");

  // 浏览器太旧或用户关闭动画时，直接显示所有内容
  if (!("IntersectionObserver" in window) || reduceMotion) {
    items.forEach((item) => item.classList.add("in"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.08,
    rootMargin: "0px 0px -6% 0px"
  });

  items.forEach((item) => observer.observe(item));
}

/* ==========================================================================
   13. 键盘支持：Esc 关闭、方向键看照片、Tab 留在弹层内
   ========================================================================== */
function initKeyboard() {
  document.addEventListener("keydown", (event) => {
    const lightbox = $("#lightbox");
    const lightboxOpen = lightbox && lightbox.classList.contains("is-open");

    if (event.key === "Escape") {
      if (lightboxOpen) {
        closeLightbox();
        return;
      }
      const openModalEl = $$(".modal.is-open").pop();
      if (openModalEl) closeModal(openModalEl);
      return;
    }

    if (lightboxOpen) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveLightbox(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        moveLightbox(1);
      }
      return;
    }

    // Tab 键在弹层和大图里循环，避免焦点跑到背后的页面
    if (event.key === "Tab") {
      trapFocusInside(event, lightboxOpen ? lightbox : $(".modal.is-open"));
    }
  });
}

/* ==========================================================================
   14. ⚙ 设置面板：名字、照片、时间线、默契题、信、备份
   --------------------------------------------------------------------------
   全部修改先写进 settingsDraft（草稿），点「保存并应用」才生效并刷新页面。
   ========================================================================== */

// 设置面板里的输入值要转义，防止标题里的引号把页面弄乱
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Blob → dataURL（备份视频时用）
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("读取失败"));
    reader.readAsDataURL(blob);
  });
}

// 触发浏览器下载一个文件
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  return url;
}

let settingsDraft = null;
let settingsTab = "us";

// 输入框取值小工具
function fieldValue(selector, root = document) {
  const node = $(selector, root);
  return node ? String(node.value).trim() : "";
}

function clampInt(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function resetLetterLockIfChanged(oldData, newData) {
  if (!oldData || !newData) return;
  const changed = oldData.secretPassword !== newData.secretPassword ||
    oldData.unlockMode !== newData.unlockMode ||
    JSON.stringify(oldData.letter) !== JSON.stringify(newData.letter);
  if (changed) storage.remove("letterUnlocked");
}

async function clearAllLocalUserData() {
  const keys = [];
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) keys.push(key);
    }
  } catch (error) {
    /* 无痕模式下可能读不到，继续清 IndexedDB */
  }
  keys.forEach((key) => storage.remove(key.slice(STORAGE_PREFIX.length)));
  await mediaStore.clear();
}

function openSettings() {
  settingsDraft = cloneData(effectiveData);
  settingsTab = "us";
  renderSettings();
  openModal($("#settingsModal"));
}

function bindBackupDropZone() {
  const zone = $("#backupDropZone");
  if (!zone || zone.dataset.bound === "true") return;
  zone.dataset.bound = "true";

  zone.addEventListener("dragover", (event) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    zone.classList.add("is-dragover");
  });

  zone.addEventListener("dragleave", () => zone.classList.remove("is-dragover"));

  zone.addEventListener("drop", async (event) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    zone.classList.remove("is-dragover");
    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    if (!file) return;
    if (!/\.json$/i.test(file.name || "") && !/json/i.test(file.type || "")) {
      setImportStatus("请拖入本项目导出的 .json 备份文件。");
      toast("请拖入本项目导出的 .json 备份文件。", 3800);
      return;
    }
    await importBackup(file);
  });
}

function renderSettings() {
  const body = $("#settingsBody");
  if (!body) return;

  $$(".settings-tab").forEach((tab) => {
    const active = tab.dataset.tab === settingsTab;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  if (settingsTab === "us") body.innerHTML = renderTabUs();
  else if (settingsTab === "photos") body.innerHTML = renderTabPhotos();
  else if (settingsTab === "timeline") body.innerHTML = renderTabTimeline();
  else if (settingsTab === "quiz") body.innerHTML = renderTabQuiz();
  else if (settingsTab === "letter") body.innerHTML = renderTabLetter();
  else body.innerHTML = renderTabData();

  if (settingsTab === "data") {
    bindBackupDropZone();
    renderSnapshotSection();
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate) => {
        const usage = estimate && estimate.usage ? estimate.usage : 0;
        const target = $("#storageUsage");
        if (target) {
          target.textContent = `本机已保存 ${(usage / 1024 / 1024).toFixed(1)} MB（改过的文字、照片和视频都在这台设备里）`;
        }
      }).catch(() => {});
    }
  }
}

/* ---------- 标签页 1：我们 ---------- */
function renderTabUs() {
  const d = settingsDraft;
  const start = String(d.startDate || "");
  const startDate = /^\d{4}-\d{2}-\d{2}/.test(start) ? start.slice(0, 10) : "";
  const startTime = /T\d{2}:\d{2}/.test(start) ? start.slice(11, 16) : "";
  const birthday = String((d.birthday || {}).monthDay || "").split("-").filter(Boolean);
  const birthdayMonth = birthday[birthday.length - 2] || "";
  const birthdayDay = birthday[birthday.length - 1] || "";

  return `
    <p class="set-hint">这里改的是页面上真正显示的内容。改完点右下角「保存并应用」。</p>
    <div class="set-grid">
      <div class="set-field">
        <label for="s-me">你的名字</label>
        <input type="text" id="s-me" maxlength="12" value="${escapeHtml(d.names.me)}">
      </div>
      <div class="set-field">
        <label for="s-partner">TA 的名字</label>
        <input type="text" id="s-partner" maxlength="12" value="${escapeHtml(d.names.partner)}">
      </div>
    </div>
    <div class="set-grid">
      <div class="set-field">
        <label for="s-start-date">在一起的日期</label>
        <input type="date" id="s-start-date" value="${escapeHtml(startDate)}">
      </div>
      <div class="set-field">
        <label for="s-start-time">在一起的时间（24 小时制）</label>
        <input type="time" id="s-start-time" value="${escapeHtml(startTime)}">
      </div>
    </div>
    <div class="set-grid">
      <div class="set-field">
        <label for="s-month">每年纪念日 · 月</label>
        <input type="number" id="s-month" min="1" max="12" value="${escapeHtml(d.anniversary.month)}">
      </div>
      <div class="set-field">
        <label for="s-day">每年纪念日 · 日</label>
        <input type="number" id="s-day" min="1" max="31" value="${escapeHtml(d.anniversary.day)}">
      </div>
    </div>
    <div class="set-grid">
      <div class="set-field">
        <label for="s-bm">TA 的生日 · 月（留空就不弹生日祝福）</label>
        <input type="number" id="s-bm" min="1" max="12" value="${escapeHtml(birthdayMonth)}">
      </div>
      <div class="set-field">
        <label for="s-bd">TA 的生日 · 日</label>
        <input type="number" id="s-bd" min="1" max="31" value="${escapeHtml(birthdayDay)}">
      </div>
    </div>
    <div class="set-field">
      <label for="s-quote">封面情话（{me} 和 {partner} 会自动换成你们的名字）</label>
      <textarea id="s-quote" rows="2">${escapeHtml(d.coverQuote)}</textarea>
    </div>
    <div class="set-field">
      <label for="s-theme">默认皮肤</label>
      <select id="s-theme">
        <option value="rose" ${d.defaultTheme === "rose" ? "selected" : ""}>温柔粉</option>
        <option value="night" ${d.defaultTheme === "night" ? "selected" : ""}>夜空蓝</option>
        <option value="retro" ${d.defaultTheme === "retro" ? "selected" : ""}>复古棕</option>
      </select>
    </div>
  `;
}

/* ---------- 标签页 2：照片 ---------- */
function renderTabPhotos() {
  const rows = (settingsDraft.photos || []).map((photo, index) => {
    const thumb = photoOverrides.photos[photo.id] || photo.src || "";
    const thumbHtml = thumb
      ? `<img class="set-thumb" src="${escapeHtml(thumb)}" alt="">`
      : `<span class="set-thumb set-thumb-empty">空</span>`;
    return `
      <div class="set-row" data-id="${escapeHtml(photo.id)}">
        ${thumbHtml}
        <div class="set-col">
          <div class="set-inline">
            <input type="text" class="set-photo-title" maxlength="24" placeholder="这一瞬间的名字" value="${escapeHtml(photo.title)}">
            <input type="text" class="set-photo-date" maxlength="10" placeholder="2024.05.20" value="${escapeHtml(photo.date)}">
            <select class="set-photo-category" aria-label="照片分类">
              <option value="">自动分类</option>
              ${PHOTO_CATEGORIES.filter((category) => category.id !== "all").map((category) => `
                <option value="${category.id}" ${photo.category === category.id ? "selected" : ""}>${category.label}</option>
              `).join("")}
            </select>
          </div>
          <span class="set-row-hint">换图片：关掉设置，把照片直接拖到那个相框上</span>
        </div>
        <button type="button" class="set-del" data-act="del-photo" aria-label="删除这个瞬间">✕</button>
      </div>`;
  }).join("");

  return `
    <p class="set-hint">照片墙现在有 ${(settingsDraft.photos || []).length} 个位置（最多 120）。
    换照片最快的办法：回到页面，把图片拖到相框上，或点相框右上角的「↻ 换这张」。</p>
    <div class="set-photo-list">${rows}</div>
    <button type="button" class="set-add" data-act="add-photo">＋ 再加一个瞬间</button>
  `;
}

/* ---------- 标签页 3：时间线 ---------- */
function renderTabTimeline() {
  const rows = (settingsDraft.timeline || []).map((item, index) => `
    <div class="set-row" data-idx="${index}">
      <div class="set-col">
        <div class="set-inline">
          <input type="text" class="set-tl-icon" maxlength="4" title="节点小图标，可以放 emoji" value="${escapeHtml(item.icon || "♡")}">
          <input type="text" class="set-tl-date" maxlength="10" placeholder="2024.05.20" value="${escapeHtml(item.date || "")}">
          <input type="text" class="set-tl-title" maxlength="20" placeholder="节点标题" value="${escapeHtml(item.title || "")}">
        </div>
        <textarea class="set-tl-text" rows="2" placeholder="那天发生的事……">${escapeHtml(item.text || "")}</textarea>
      </div>
      <button type="button" class="set-del" data-act="del-timeline" aria-label="删除这个节点">✕</button>
    </div>`).join("");

  return `
    <p class="set-hint">「我们走过的每一个坐标」。图标可以直接填任何 emoji：☕ 🎬 🚄 🕯 ✈️ 🌊</p>
    <div class="set-photo-list">${rows}</div>
    <button type="button" class="set-add" data-act="add-timeline">＋ 加一个坐标</button>
  `;
}

/* ---------- 标签页 4：默契题 ---------- */
function renderTabQuiz() {
  const rows = (settingsDraft.quiz || []).map((item, index) => {
    const options = [0, 1, 2, 3].map((optionIndex) => {
      const value = (item.options || [])[optionIndex] || "";
      const checked = Number(item.answer) === optionIndex ? "checked" : "";
      return `
        <div class="set-quiz-line">
          <label class="answer-pick-item">
            <input type="radio" name="set-answer-${index}" value="${optionIndex}" ${checked}>
            <span>${"ABCD"[optionIndex]}</span>
          </label>
          <input type="text" class="set-quiz-option" maxlength="30" placeholder="选项 ${"ABCD"[optionIndex]}" value="${escapeHtml(value)}">
        </div>`;
    }).join("");

    return `
      <div class="set-row set-row-quiz" data-idx="${index}" data-id="${escapeHtml(item.id || "")}">
        <div class="set-col">
          <input type="text" class="set-quiz-question" maxlength="60" placeholder="第 ${index + 1} 道题的问题" value="${escapeHtml(item.question || "")}">
          ${options}
          <span class="set-row-hint">点字母选「正确答案」＝ TA 的真实答案。没填完的题不会出现在游戏里。</span>
        </div>
        <button type="button" class="set-del" data-act="del-quiz" aria-label="删除这道题">✕</button>
      </div>`;
  }).join("");

  return `
    <p class="set-hint">默契大考验的题库。答案不再是出厂预设——出题的人把正确答案设成 TA 的真实习惯，答题的人来猜。</p>
    <div class="set-photo-list">${rows}</div>
    <button type="button" class="set-add" data-act="add-quiz">＋ 加一道题</button>
  `;
}

/* ---------- 标签页 5：信 ---------- */
function renderTabLetter() {
  const d = settingsDraft;
  const mode = d.unlockMode === "quiz" ? "quiz" : "password";

  return `
    <p class="set-hint">页脚那封「只写给你的信」。可以密码解锁，也可以让对方答对几道默契题才打开。</p>
    <div class="set-field">
      <label>解锁方式</label>
      <div class="radio-row">
        <label><input type="radio" name="s-unlock" value="password" ${mode === "password" ? "checked" : ""}> 密码解锁</label>
        <label><input type="radio" name="s-unlock" value="quiz" ${mode === "quiz" ? "checked" : ""}> 答对 3 道默契题解锁</label>
      </div>
    </div>
    <div class="set-field">
      <label for="s-password">信的密码（比如你们的纪念日数字）</label>
      <input type="text" id="s-password" maxlength="20" value="${escapeHtml(d.secretPassword)}">
    </div>
    <div class="set-field">
      <label for="s-letter-title">信的标题</label>
      <input type="text" id="s-letter-title" maxlength="30" value="${escapeHtml(d.letter.title)}">
    </div>
    <div class="set-field">
      <label for="s-letter-body">信的正文（一行就是一段）</label>
      <textarea id="s-letter-body" rows="6">${escapeHtml((d.letter.paragraphs || []).join("\n"))}</textarea>
    </div>
    <div class="set-field">
      <label for="s-letter-sign">落款（{me} 会换成你的名字）</label>
      <input type="text" id="s-letter-sign" maxlength="20" value="${escapeHtml(d.letter.sign)}">
    </div>
    <div class="set-field">
      <label for="s-hidden">页脚小爱心连点 7 下出现的隐藏句</label>
      <input type="text" id="s-hidden" maxlength="60" value="${escapeHtml(d.hiddenMessage)}">
    </div>
  `;
}

/* ---------- 标签页 6：备份 ---------- */
function renderTabData() {
  return `
    <p class="set-hint">换设备、送人、给朋友当模板，都靠备份文件。备份里包含改过的所有文字和你上传过的照片
    （视频太大不会包含，请单独保存）。导入时用朋友发的文件，导入后互相不影响。</p>

    <div class="set-actions">
      <button type="button" class="btn btn-ghost" data-act="export">⬇ 导出备份</button>
      <label class="btn btn-ghost import-backup-label" for="importInput">⬆ 选择备份文件导入</label>
      <button type="button" class="btn btn-ghost set-danger" data-act="restore">恢复出厂默认</button>
    </div>

    <div class="backup-drop-zone" id="backupDropZone">
      <strong>也可以把备份 JSON 直接拖到这里</strong>
      <span>导入会覆盖当前设置，但不会删除对方设备上原来的数据。</span>
    </div>

    <p class="set-hint" id="importStatus">导入状态：等待选择文件。若手机浏览器没有弹出文件框，请改用系统浏览器打开网站。</p>
    <p class="set-hint" id="storageUsage">正在统计本机占用…</p>

    <div class="snapshot-box">
      <div class="snapshot-head">
        <div>
          <strong>自动本地快照</strong>
          <span id="snapshotStatus">正在读取快照…</span>
        </div>
        <button type="button" class="btn btn-ghost" data-act="snapshot-now">立即备份一次</button>
      </div>
      <p class="set-hint">每次保存设置、导入备份、恢复默认前，系统都会自动留一份快照。更新版本不会清掉这些快照。</p>
      <div id="snapshotList" class="snapshot-list"></div>
    </div>
  `;
}

/* ---------- 把当前标签页里的输入收进 settingsDraft ---------- */
function collectCurrentTab() {
  if (!settingsDraft) return;
  const body = $("#settingsBody");
  if (!body) return;

  if (settingsTab === "us") {
    const me = fieldValue("#s-me", body);
    const partner = fieldValue("#s-partner", body);
    if (me) settingsDraft.names.me = me;
    if (partner) settingsDraft.names.partner = partner;

    const startDate = fieldValue("#s-start-date", body);
    const startTime = fieldValue("#s-start-time", body);
    if (/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      settingsDraft.startDate = `${startDate}T${/^\d{2}:\d{2}$/.test(startTime) ? startTime : "00:00"}:00`;
    }

    const month = clampInt(fieldValue("#s-month", body), 1, 12);
    const day = clampInt(fieldValue("#s-day", body), 1, 31);
    if (month && day) settingsDraft.anniversary = { month, day };

    const bm = clampInt(fieldValue("#s-bm", body), 1, 12);
    const bd = clampInt(fieldValue("#s-bd", body), 1, 31);
    settingsDraft.birthday = {
      ...(settingsDraft.birthday || {}),
      monthDay: bm && bd ? `${bm}-${bd}` : ""
    };

    const quote = fieldValue("#s-quote", body);
    if (quote) settingsDraft.coverQuote = quote;
    const theme = fieldValue("#s-theme", body);
    if (theme) settingsDraft.defaultTheme = theme;
  } else if (settingsTab === "photos") {
    const byId = new Map((settingsDraft.photos || []).map((photo) => [photo.id, photo]));
    settingsDraft.photos = $$(".set-row", body).map((row, index) => {
      const old = byId.get(row.dataset.id) || {};
      const title = fieldValue(".set-photo-title", row) || `我们的瞬间 ${index + 1}`;
      return {
        id: row.dataset.id,
        src: old.src || "",
        title,
        date: fieldValue(".set-photo-date", row),
        alt: old.alt || title,
        category: fieldValue(".set-photo-category", row)
      };
    });
  } else if (settingsTab === "timeline") {
    settingsDraft.timeline = $$(".set-row", body).map((row) => ({
      icon: fieldValue(".set-tl-icon", row) || "♡",
      date: fieldValue(".set-tl-date", row),
      title: fieldValue(".set-tl-title", row) || "我们的故事",
      text: $(".set-tl-text", row) ? $(".set-tl-text", row).value.trim() : ""
    }));
  } else if (settingsTab === "quiz") {
    settingsDraft.quiz = $$(".set-row-quiz", body).map((row) => {
      const checked = row.querySelector("input[type=radio]:checked");
      const checkedIndex = checked ? Number(checked.value) : -1;
      const options = [];
      let answer = -1;

      $$(".set-quiz-option", row).forEach((input, originalIndex) => {
        const option = input.value.trim();
        if (!option) return;
        if (originalIndex === checkedIndex) answer = options.length;
        options.push(option);
      });

      return {
        id: row.dataset.id || `q${Math.random().toString(36).slice(2, 8)}`,
        question: fieldValue(".set-quiz-question", row),
        options,
        answer
      };
    });
  } else if (settingsTab === "letter") {
    const mode = body.querySelector("input[name='s-unlock']:checked");
    settingsDraft.unlockMode = mode ? mode.value : "password";
    settingsDraft.secretPassword = fieldValue("#s-password", body);
    settingsDraft.letter = {
      title: fieldValue("#s-letter-title", body) || settingsDraft.letter.title,
      paragraphs: ($("#s-letter-body", body) ? $("#s-letter-body", body).value : "")
        .split(/\n+/).map((line) => line.trim()).filter(Boolean),
      sign: fieldValue("#s-letter-sign", body) || settingsDraft.letter.sign
    };
    const hidden = fieldValue("#s-hidden", body);
    if (hidden) settingsDraft.hiddenMessage = hidden;
  }
}

/* ---------- 备份：导出 / 导入 / 恢复默认 ---------- */
async function exportBackup() {
  collectCurrentTab();
  if (!settingsDraft) {
    toast("设置已经保存，重新打开设置后再导出。");
    return;
  }

  const media = {};
  let mediaBytes = 0;
  const maxMediaBytes = 80 * 1024 * 1024;
  const addMedia = (key, value) => {
    const size = Math.ceil(String(value || "").length * 0.75);
    if (!value || mediaBytes + size > maxMediaBytes) return false;
    media[key] = value;
    mediaBytes += size;
    return true;
  };

  for (const photo of (settingsDraft.photos || [])) {
    const value = await mediaStore.get(MEDIA_KEYS.photo(photo.id));
    if (value && !addMedia(MEDIA_KEYS.photo(photo.id), value)) {
      throw new Error("上传照片太多，备份已超过 80MB。请删掉几格本机上传后再导出。");
    }
  }
  for (const slide of (settingsDraft.coverSlides || [])) {
    const value = await mediaStore.get(MEDIA_KEYS.cover(slide.id));
    if (value && !addMedia(MEDIA_KEYS.cover(slide.id), value)) {
      throw new Error("封面图片太多，备份已超过 80MB。请还原部分封面后再导出。");
    }
  }

  let extraNote = "";
  const video = await mediaStore.get(MEDIA_KEYS.video());
  if (video) {
    if (video.size <= 40 * 1024 * 1024) {
      const value = await blobToDataURL(video);
      if (!addMedia(MEDIA_KEYS.video(), value)) {
        extraNote = "（加上视频会超过 80MB，本次只备份了文字和照片）";
      }
    } else {
      extraNote = "（视频超过 40MB 没放进备份，请单独保存视频文件）";
    }
  }

  const now = new Date();
  const stamp = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`;
  const payload = {
    app: "love-universe",
    version: 1,
    exportedAt: now.toISOString(),
    data: toStorageData(normalizeEditableData(settingsDraft)),
    media
  };

  const filename = `恋爱纪念宇宙-备份-${stamp}.json`;
  const url = downloadBlob(new Blob([JSON.stringify(payload)], { type: "application/json" }), filename);
  setImportStatus(`备份已生成（约 ${(mediaBytes / 1024 / 1024).toFixed(1)} MB 素材）${extraNote}。如果浏览器没有自动下载，请点下面的手动下载链接。`);

  const status = $("#importStatus");
  if (status && url) {
    const link = make("a", "backup-manual-download", "点这里手动下载备份");
    link.href = url;
    link.download = filename;
    status.appendChild(make("br"));
    status.appendChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
  }
  toast(`备份导出好了${extraNote}`, 4000);
}

function setImportStatus(message) {
  const status = $("#importStatus");
  if (status) status.textContent = `导入状态：${message}`;
}

function isAllowedBackupKey(key) {
  return key === MEDIA_KEYS.video() || /^(photo\.|cover\.)[a-zA-Z0-9_.-]{1,80}$/.test(String(key || ""));
}

function dataUrlToBlob(dataUrl) {
  const comma = String(dataUrl).indexOf(",");
  if (comma < 0) throw new Error("data URL 不完整");
  const header = String(dataUrl).slice(0, comma);
  const mimeMatch = /data:([^;,]+)/.exec(header);
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
  const base64 = String(dataUrl).slice(comma + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function sanitizeBackupMedia(input) {
  const source = isPlainObject(input) ? input : {};
  const safe = {};
  let total = 0;
  const maxPhotoBytes = 2.5 * 1024 * 1024;
  const maxVideoBytes = 56 * 1024 * 1024;
  const maxTotalBytes = 80 * 1024 * 1024;

  for (const [key, value] of Object.entries(source)) {
    if (!isAllowedBackupKey(key) || typeof value !== "string") continue;
    if (!/^data:(image|video)\//.test(value)) continue;
    const limit = key === MEDIA_KEYS.video() ? maxVideoBytes : maxPhotoBytes;
    if (value.length > limit || total + value.length > maxTotalBytes) continue;
    safe[key] = value;
    total += value.length;
  }
  return safe;
}

function readFileText(file) {
  if (typeof file.text === "function") return file.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("文件读不出来"));
    reader.readAsText(file, "utf-8");
  });
}

async function importBackup(file, options = {}) {
  const reloadAfter = options.reloadAfter !== false;
  if (!file) return;
  setImportStatus(`正在读取 ${file.name || "备份文件"}…`);

  try {
    if (file.size > 100 * 1024 * 1024) {
      throw new Error("备份文件超过 100MB，可能不是普通备份。");
    }

    let payload;
    try {
      payload = JSON.parse(await readFileText(file));
    } catch (error) {
      throw new Error("文件不是有效的 JSON，可能导出时损坏了。");
    }

    if (!isPlainObject(payload) || payload.app !== "love-universe" || !isPlainObject(payload.data)) {
      throw new Error("这不是本项目的备份文件。");
    }

    const nextData = normalizeEditableData(payload.data);
    const safeMedia = sanitizeBackupMedia(payload.media);

    await createSnapshot("导入备份前", { includeMedia: true });
    if (!saveData(nextData)) {
      throw new Error("浏览器拒绝保存，可能开了无痕模式或本地空间不足。");
    }
    resetLetterLockIfChanged(effectiveData, nextData);
    effectiveData = nextData;

    let mediaFailed = 0;
    for (const [key, value] of Object.entries(safeMedia)) {
      let saved = false;
      try {
        if (key === MEDIA_KEYS.video()) {
          saved = await mediaStore.set(key, dataUrlToBlob(value));
        } else {
          saved = await mediaStore.set(key, value);
        }
      } catch (error) {
        saved = false;
      }
      if (!saved) mediaFailed += 1;
    }

    const finish = () => {
      if (reloadAfter) location.reload();
    };
    if (mediaFailed) {
      setImportStatus(`设置已导入，但有 ${mediaFailed} 个照片/视频没存进本机。${reloadAfter ? "0.8 秒后刷新。" : ""}`);
      toast("设置导入了，但部分照片空间不足。", 4200);
      if (reloadAfter) setTimeout(finish, 1800);
    } else {
      setImportStatus(reloadAfter ? "导入完成，正在刷新页面……" : "导入完成。");
      toast("导入完成，正在刷新页面……");
      if (reloadAfter) setTimeout(finish, 700);
    }
  } catch (error) {
    console.warn("导入备份失败", error);
    setImportStatus(error.message || "导入失败。");
    toast(error.message || "导入失败，请确认是本项目导出的 JSON。", 4600);
  }
}

/* ---------- 设置面板的事件绑定（只在启动时装一次） ---------- */
function initSettings() {
  const settingsBtn = $("#settingsBtn");
  if (settingsBtn) settingsBtn.addEventListener("click", openSettings);

  $$(".settings-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.dataset.tab === settingsTab) return;
      collectCurrentTab();     // 换页前先收起这一页的修改
      settingsTab = tab.dataset.tab;
      renderSettings();
    });
  });

  const saveButton = $("#settingsSave");
  if (saveButton) {
    saveButton.addEventListener("click", async () => {
      collectCurrentTab();
      const previousData = effectiveData;
      const nextData = normalizeEditableData(settingsDraft);
      await createSnapshot("保存设置前", { includeMedia: false });
      if (!saveData(nextData)) {
        toast("浏览器不允许保存，请关掉无痕模式再试。");
        return;
      }
      resetLetterLockIfChanged(previousData, nextData);
      effectiveData = nextData;
      settingsDraft = null;
      toast("保存好了，正在让页面焕然一新……", 1800);
      setTimeout(() => location.reload(), 650);
    });
  }

  const body = $("#settingsBody");
  if (body) {
    body.addEventListener("click", async (event) => {
      const trigger = event.target.closest("[data-act]");
      if (!trigger) return;
      const action = trigger.dataset.act;

      if (action === "del-photo") {
        collectCurrentTab();
        const row = trigger.closest(".set-row");
        const id = row ? row.dataset.id : "";
        if (id) await mediaStore.remove(MEDIA_KEYS.photo(id));
        settingsDraft.photos = settingsDraft.photos.filter((photo) => photo.id !== id);
        renderSettings();
      } else if (action === "add-photo") {
        collectCurrentTab();
        if (settingsDraft.photos.length >= 120) {
          toast("最多 120 个瞬间，已经满啦。");
          return;
        }
        settingsDraft.photos.push({
          id: `slot-${Date.now().toString(36)}`,
          src: "",
          title: "",
          date: "",
          alt: ""
        });
        renderSettings();
        const list = $(".set-photo-list", body);
        if (list) list.scrollTop = list.scrollHeight;
      } else if (action === "del-timeline" || action === "del-quiz") {
        collectCurrentTab();
        const row = trigger.closest(".set-row");
        const index = Number(row && row.dataset.idx);
        const list = action === "del-timeline" ? settingsDraft.timeline : settingsDraft.quiz;
        if (list && Number.isInteger(index)) list.splice(index, 1);
        renderSettings();
      } else if (action === "add-timeline" || action === "add-quiz") {
        collectCurrentTab();
        if (action === "add-timeline") {
          if (settingsDraft.timeline.length >= 30) { toast("时间线最多 30 个坐标。"); return; }
          settingsDraft.timeline.push({ date: "", title: "", text: "", icon: "♡" });
        } else {
          if (settingsDraft.quiz.length >= 20) { toast("默契题最多 20 道。"); return; }
          settingsDraft.quiz.push({ id: `q-${Date.now().toString(36)}`, question: "", options: ["", "", "", ""], answer: -1 });
        }
        renderSettings();
        const list = $(".set-photo-list", body);
        if (list) list.scrollTop = list.scrollHeight;
      } else if (action === "export") {
        await exportBackup();
      } else if (action === "snapshot-now") {
        const snapshot = await createSnapshot("手动备份", { includeMedia: true });
        toast(snapshot ? "本地快照已保存。" : "本地快照保存失败，可能空间不足。", 3600);
        renderSnapshotSection();
      } else if (action === "restore-snapshot") {
        const id = trigger.dataset.id;
        if (!id || !window.confirm("恢复这个快照吗？当前内容会先自动备份一份。")) return;
        await restoreSnapshot(id);
      } else if (action === "delete-snapshot") {
        const id = trigger.dataset.id;
        if (!id || !window.confirm("删除这个快照吗？")) return;
        await snapshotStore.remove(id);
        renderSnapshotSection();
      } else if (action === "import") {
        const input = $("#importInput");
        if (input) {
          input.value = "";
          input.click();
        }
      } else if (action === "restore") {
        if (!window.confirm("确定恢复出厂默认吗？改过的名字、题目、留言、主题、解锁状态和上传的照片都会清掉。恢复前会自动留一份快照。")) return;
        await createSnapshot("恢复默认前", { includeMedia: true });
        await clearAllLocalUserData();
        location.reload();
      }
    });
  }

  const importInput = $("#importInput");
  if (importInput) {
    importInput.addEventListener("click", () => {
      setImportStatus("正在等待选择文件……如果没弹框，请改用系统浏览器打开。");
    });

    importInput.addEventListener("change", () => {
      const file = importInput.files && importInput.files[0];
      importInput.value = "";
      if (!file) {
        setImportStatus("没有选择文件。");
        return;
      }
      importBackup(file);
    });
  }
}

/* ---------- 首次访问的小引导 ---------- */
function hideHintBanner(banner, remember = true) {
  if (!banner) return;
  banner.hidden = true;
  document.body.classList.remove("has-setup-guide");
  if (remember) storage.set("hintDismissed", true);
}

function initHintBanner() {
  const banner = $("#hintBanner");
  if (!banner) return;

  const customized = storage.get(DATA_KEY, null);
  if (customized || storage.get("hintDismissed", false)) {
    hideHintBanner(banner, false);
    return;
  }

  banner.hidden = false;
  document.body.classList.add("has-setup-guide");

  const open = $("#hintOpen");
  if (open) open.addEventListener("click", () => {
    hideHintBanner(banner, true);
    openSettings();
  });

  const close = $("#hintClose");
  if (close) close.addEventListener("click", () => hideHintBanner(banner, true));
}

/* ---------- PWA：安装成 App 的按钮（安卓浏览器触发安装；iOS 无此事件，走 Safari 手动添加） ---------- */
function initInstallPrompt() {
  const button = $("#installBtn");
  if (!button) return;

  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    button.hidden = false;
  });

  button.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === "accepted") toast("装好啦，桌面见。");
    } catch (error) { /* 用户取消就安静结束 */ }
    deferredPrompt = null;
    button.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    button.hidden = true;
    toast("已经安装到桌面，断网也能打开。");
  });
}

/* ==========================================================================
   15. 启动
   ========================================================================== */
function init() {
  loadData();         // 第一步：合并"用户改过的数据"，之后全站读 D()
  initTheme();        // 先定皮肤，后面的绘制颜色才正确
  initCover();
  initPhotoWall();
  initTimeline();
  initBucket();
  initDrawGame();
  initQuiz();
  initMessages();
  initMusic();
  initSecrets();
  initUploadInputs();
  initNavigation();
  initKeyboard();
  initSettings();     // ⚙ 设置面板（内部只绑一次事件）
  initHintBanner();   // 首次访问的小引导
  initInstallPrompt(); // 安装成 App 的按钮（不支持的环境安静隐藏）
  initReveal();       // 放在最后，确保动态生成的照片/时间线也能观察

  // 异步读回用户在这台设备上传过的照片、封面和视频
  loadStoredMedia();

  // 首次访问时给一个很轻的提示，不打扰
  if (!storage.get("visited", false)) {
    storage.set("visited", true);
    setTimeout(() => toast("欢迎来到只属于你们的纪念宇宙。", 3000), 1600);
  }
}

// 脚本放在 body 末尾，此时 DOM 已就绪
init();

/* ---------- PWA：注册离线缓存。只在网页环境（http/https）生效，
   双击打开的本地文件和手机单文件版不会注册，也不报错 ---------- */
if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
