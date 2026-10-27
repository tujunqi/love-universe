#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
恋爱小助手 · 本地版
===================

这是一个完全离线的命令行小工具，只依赖 Python 自带的库，不需要安装任何第三方包。

它能做四件事：
  1. 记住你们的纪念日、生日、重要事项、喜好和零散回忆，并能用大白话提问。
  2. 按场景生成早安、晚安、道歉、安慰的话（模板可以自己改）。
  3. 根据预算和时间，给出 3 个能直接执行的约会方案和时间线。
  4. 备份、导出、恢复全部数据，数据只保存在本机的 data/memory.json 里。

第一次使用：
  - Windows：双击「启动小助手.bat」
  - 或者在本文件夹打开终端，运行：python love_assistant.py

不想进入菜单，也可以直接用命令：
  python love_assistant.py --today
  python love_assistant.py --ask "小满喜欢什么"
  python love_assistant.py --scene night --note "今天她加班到十点"
  python love_assistant.py --plan --budget 200 --hours 4 --indoor --start 14:00
  python love_assistant.py --upcoming 60

隐私提醒：
  - 所有内容都保存在你自己的电脑里，不会上传到任何服务器。
  - data/memory.json 是明文，不要把它发给陌生人，也不要在公共电脑上使用。
  - 想给数据加一道锁，可以用压缩软件加密，或把整个文件夹放进加密盘（详见 docs/09）。
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# 0. 导入与全局配置
# ---------------------------------------------------------------------------

import argparse          # 解析命令行参数，让工具既能进菜单，也能一行命令直接出结果
import copy              # 深拷贝默认数据，避免多次运行时互相污染
import json              # 读写本地 JSON 数据文件
import os                # 原子替换文件、判断操作系统
import random            # 随机挑选情话、给约会方案加一点变化
import re                # 从用户输入里提取日期、数字、时间
import shutil            # 备份与导出文件
import sys               # 判断是否在终端里运行、设置编码
import textwrap          # 长文本换行，避免一行挤在屏幕外面
from datetime import date, datetime, time, timedelta  # 日期与时间计算
from pathlib import Path                              # 跨平台路径处理


APP_NAME = "恋爱小助手"                    # 程序名字，显示在标题里
SCHEMA_VERSION = 1                         # 数据格式版本，以后升级时用来判断兼容性
MAX_BACKUPS = 30                           # 最多保留 30 个自动备份，防止文件夹无限膨胀

# 所有路径都相对于本文件，整个 assistant 文件夹可以随意搬动。
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MEMORY_FILE = DATA_DIR / "memory.json"
BACKUP_DIR = DATA_DIR / "backups"
EXPORT_DIR = DATA_DIR / "exports"
OUT_DIR = BASE_DIR / "out"

# 星期显示。Python 的 weekday() 从 0=星期一开始。
WEEKDAYS = ("星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日")

# 四种情话场景的中文名，菜单和命令行共用。
SCENE_LABELS = {
    "morning": "早安",
    "night": "晚安",
    "apology": "道歉",
    "comfort": "安慰",
}

# 每个场景的一句使用提醒。不是模板，只在生成结果末尾出现。
SCENE_TIPS = {
    "morning": "如果她今天有重要的事，把「加油」换成那件事的名字，会比空泛的祝福更有用。",
    "night": "晚安不必每天都发。隔几天发一次，反而更像真的在想她。",
    "apology": "道歉先别解释原因。把「但是」删掉，句子会诚实地多。",
    "comfort": "安慰的时候少给建议。先说「我在」，再说别的。",
}

# ---------------------------------------------------------------------------
# 1. 默认数据
# ---------------------------------------------------------------------------
# 说明：
#   - 下面这份数据是示例，和主页、离线博物馆、第二大脑里的阿星/小满保持一致。
#   - 第一次运行如果 data/memory.json 不存在，会自动用它生成一份。
#   - 以后你只需要改 data/memory.json，不需要改这段代码。
#   - 如果 JSON 里缺少某个字段，程序会用这里的默认值补齐，不会直接崩溃。
# ---------------------------------------------------------------------------

def default_memory() -> dict:
    """返回一份全新的示例数据。每次都深拷贝，避免修改到全局常量。"""
    now = datetime.now().isoformat(timespec="seconds")
    return {
        "meta": {
            "version": SCHEMA_VERSION,
            "created_at": now,
            "updated_at": now,
            "note": "这是本地数据文件。改坏之前，程序会自动备份到 data/backups/。",
        },
        "couple": {
            "me": "阿星",
            "partner": "小满",
            "start": "2023-05-20T20:13:00",
            "partner_birthday": "10-16",
            "my_birthday": "",
            "city": "我们住的城市",
        },
        # 每年都会重复出现的日子。date 只写「月-日」，yearly 固定为 True。
        # count_from 可选：填了以后会显示「第 N 个纪念日」。
        "anniversaries": [
            {
                "title": "在一起纪念日",
                "date": "05-20",
                "count_from": "2023-05-20",
                "note": "20:13，那句「那就在一起吧」。",
            },
            {
                "title": "小满生日",
                "date": "10-16",
                "note": "不一定需要惊喜，一碗面也可以。",
            },
            {
                "title": "第一次看海",
                "date": "07-16",
                "note": "海边那家没吃上的海鲜面，后来也没补上。",
            },
        ],
        # 只发生一次的事。date 写完整的「年-月-日」，过去的会自动从提醒里隐藏。
        "important": [
            {
                "title": "小满体检复查",
                "date": "2026-11-03",
                "note": "上午，记得空腹；提前一天把资料装好。",
            },
            {
                "title": "小满项目上线",
                "date": "2026-11-20",
                "note": "那天别安排别的，晚上给她留一顿热饭。",
            },
            {
                "title": "一起去看灯会",
                "date": "2026-12-24",
                "note": "人多，提前买票；她怕冷，带暖宝宝。",
            },
        ],
        # 喜好按「人 -> 类别 -> 列表」组织。类别可以自己加，问答会自动搜。
        "preferences": {
            "小满": {
                "喜欢": [
                    "海鲜面",
                    "番茄面",
                    "草莓蛋糕",
                    "热咖啡（不加糖）",
                    "烤得焦一点的面包边",
                    "便利店关东煮",
                    "海边",
                    "咖啡馆二楼靠窗的位置",
                    "慢慢吃早餐",
                    "手写信",
                ],
                "不喜欢": [
                    "太吵的餐厅",
                    "被安排得太满的周末",
                    "累的时候突然的大惊喜",
                    "太甜的饮料",
                    "临时改计划",
                ],
                "送礼": [
                    "手写信",
                    "一本贴满照片的相册",
                    "实用的小家电（比如台灯）",
                    "一束不张扬的花",
                ],
                "在意": [
                    "累的时候先问「要不要帮忙」，不要先讲道理",
                    "吵架后不要冷战过夜",
                    "出门记得带伞",
                    "生日不一定需要惊喜，先问她今天累不累",
                ],
            },
            "阿星": {
                "喜欢": [
                    "番茄面",
                    "海边",
                    "便利店",
                    "拍照记录",
                    "把小事写下来",
                ],
                "不喜欢": [
                    "迟到",
                    "说话说一半",
                    "冷战",
                ],
                "送礼": [
                    "一本空白本子",
                    "一支好写的笔",
                    "一张一起拍的照片",
                ],
                "在意": [
                    "说话算数",
                    "吵架当天把话说开",
                    "拍照前先问一句",
                ],
            },
        },
        # 一条回忆 = 一个可以在问答里被搜到的片段。
        # detail 不用写很长，能让你想起那个画面就够了。
        "memories": [
            {
                "date": "2023-05-20",
                "title": "在一起的第一晚",
                "detail": "20:13，她发来「那就在一起吧」。我盯着屏幕看了很久，久到手机自动暗下去，又亮起来。",
                "tags": ["开始", "告白", "重要节点"],
            },
            {
                "date": "2023-07-16",
                "title": "第一次看海",
                "detail": "照片几乎全糊了，回程大巴上我靠在她肩上睡着，醒来假装没醒。海边那家海鲜面没排上。",
                "tags": ["旅行", "海边"],
            },
            {
                "date": "2023-10-04",
                "title": "咖啡馆的下午",
                "detail": "城西咖啡馆二楼靠窗，下午四点多下雨。她在玻璃上画了一个圈，圈里正好有一辆红色的车经过。",
                "tags": ["日常", "咖啡馆", "下雨"],
            },
            {
                "date": "2024-01-14",
                "title": "雪落在你肩上",
                "detail": "她穿得很薄，说不冷。我把围巾给她，后来围巾一直在她那儿。",
                "tags": ["冬天", "雪"],
            },
            {
                "date": "2024-03-09",
                "title": "一场没有赢家的吵架",
                "detail": "因为垃圾袋吵起来。后来我煮了番茄面，盐放多了，煎蛋一个老一个还行。没有正式道歉，但一起把厨房收拾了。",
                "tags": ["争吵", "修复"],
            },
            {
                "date": "2024-05-20",
                "title": "在一起一周年",
                "detail": "订好的餐厅没去成，在家吃了排骨和青菜。礼物是一本十二张照片的相册。",
                "tags": ["纪念日", "相册"],
            },
            {
                "date": "2024-09-17",
                "title": "第二次看海",
                "detail": "同一片海，同一家店。她说「不要紧」，这句话在回程又说了一次，意思不太一样。",
                "tags": ["旅行", "海边"],
            },
            {
                "date": "2025-01-01",
                "title": "跨年凌晨的便利店",
                "detail": "00:47 的小票，两串关东煮。没有烟花，也没有倒计时。",
                "tags": ["跨年", "日常", "便利店"],
            },
            {
                "date": "2025-10-16",
                "title": "小满的生日",
                "detail": "她进门说今天很累，能不能不要搞惊喜。我说没有惊喜，只有面。礼物是一盏台灯和一封手写信。",
                "tags": ["生日", "家"],
            },
        ],
    }


# ---------------------------------------------------------------------------
# 2. 情话模板
# ---------------------------------------------------------------------------
# 想改情话，直接改下面引号里的中文即可，不需要懂编程。
#   - {partner} 会自动替换成「小满」，{me} 会替换成「阿星」。
#   - 带 {note} 的模板只会在你输入了「今天的小事」时出现。
#   - 每个场景至少保留 2 条不带 {note} 的模板，否则不输入小事时没有内容可用。
# ---------------------------------------------------------------------------

SCENE_TEMPLATES = {
    "morning": [
        "早上好，{partner}。今天不用急着成为很厉害的人，先好好吃顿早饭。",
        "醒了吗？窗外的光还不错。想到你今天要忙，先替你把「加油」说一遍。",
        "今天的第一个念头是你。第二个念头是，别忘了喝水。",
        "{partner}，如果今天有点难，就把难的部分留一点给我。",
        "早上好。昨晚睡得好吗？没睡好也没关系，中午找机会补一会儿。",
        "今天也要出门的话，外套穿厚一点。不是唠叨，是我想不出别的办法参与你的早上。",
        "醒来先别急着看消息。等你忙完这一阵，我再跟你讲一件很小的事。",
        "今天不祝你顺利，祝你遇到麻烦的时候，刚好有人帮你。",
        "今天的小事：{note}。我记着呢，早上先提醒你一句，别忘。",
        "想到今天要面对的事：{note}。慢慢来，来得及。",
    ],
    "night": [
        "今天辛苦了。不用总结，也不用复盘，先睡。",
        "晚安。今天没做完的事，明天还在；你今天已经很可以了。",
        "如果还醒着，就把手机放下五分钟。我在另一个地方，也准备睡了。",
        "今天有没有哪一刻，是你想讲但没讲的？明天讲给我听。",
        "晚安，{partner}。今天你皱了几次眉，我都记着，明天想办法让你少皱一次。",
        "不用回。看到这条就去睡。",
        "今天的好和不好都到此为止。明天早上见。",
        "今天的小事：{note}。睡前又想起来，晚安，明天再说。",
        "今晚的风很像我们第一次看海那天。晚安。",
        "愿你今晚不做梦，一觉到天亮。",
    ],
    "apology": [
        "刚才那句话我说重了。不是要你马上原谅，是想让你知道，我后来想明白了。",
        "我不想赢。我只想我们别带着这件事睡觉。",
        "对不起。你可以还在生气，我不催你。等你想说的时候，我在。",
        "我刚才只顾着证明自己没错，忘了你在难过。这是我的问题。",
        "我把「{note}」这件事想了一遍。确实是我没做好。",
        "不解释那么多。是我不好。你愿意的话，我们晚一点再聊。",
        "我知道一句对不起不能把话收回去。但我还是想说，对不起。",
        "你不用马上回我。我只是不想让你一个人消化。",
        "我们先不讨论谁对谁错，先告诉我你现在好一点没有。",
        "我把面煮上了。你要是愿意，回来吃一口；不愿意，我留着。",
    ],
    "comfort": [
        "不用急着振作。难受就先难受一会儿，我陪你。",
        "这件事不是你的错。你已经做了你能做的。",
        "你可以什么都不说。我在这儿，不是来要一个答案的。",
        "如果今天不想见人，就不见。我给你带吃的，放门口。",
        "你不需要表现得很坚强。至少在我这里不用。",
        "想哭就哭，纸巾我带了。",
        "我们先不谈怎么解决。先吃点东西，睡一觉，明天再说。",
        "今天这件事：{note}。我听到了，先不评价，先抱一下。",
        "你不是麻烦。你只是今天很累。",
        "我可能帮不上什么大忙，但我可以一直在。",
    ],
}


# ---------------------------------------------------------------------------
# 3. 约会方案库
# ---------------------------------------------------------------------------
# 每个方案包含：
#   cost      两个人一共的大致花费（元），不是精确报价。
#   minutes   建议时长（分钟）。
#   place     「室内」「室外」「都行」，用来按天气/心情筛选。
#   category  用来保证推荐的三个方案不重样。
#   flow      时间线，括号里是「从开始算起的第几分钟」。
#   prep      出发前要准备的东西。
#   surprise  一个不花钱但加分的小动作。
#
# 想加自己的方案：复制一整段 { ... }, 改改文字和数字，注意逗号别丢。
# ---------------------------------------------------------------------------

DATE_PLANS = [
    {
        "id": "zero-photos",
        "title": "零元约会：翻旧照片，写一封短信",
        "cost": 0,
        "minutes": 120,
        "place": "室内",
        "category": "宅家",
        "tags": ["零预算", "在家", "慢"],
        "summary": "不花钱，但需要真的把手机放下。",
        "flow": [
            (0, "把手机调成静音，泡两杯热的东西"),
            (15, "翻出一叠旧照片或旧聊天记录，一人挑三张"),
            (45, "一张一张讲：当时为什么拍、后来发生了什么"),
            (90, "各写一封很短的信，不超过三百字"),
            (115, "交换，约定下一次打开的时间"),
        ],
        "prep": ["找出旧照片或旧聊天记录", "两张纸和两支能写的笔"],
        "surprise": "把信塞进她第二天一定会打开的包里。",
    },
    {
        "id": "zero-walk",
        "title": "楼下走一圈，只聊一件小事",
        "cost": 0,
        "minutes": 30,
        "place": "都行",
        "category": "城市",
        "tags": ["零预算", "散步", "短"],
        "summary": "时间很短也能成行，重点是不带目的地。",
        "flow": [
            (0, "下楼走一圈，只聊一件今天发生的小事"),
            (15, "在楼下站一会儿，看看天"),
            (28, "回去，各做各的事"),
        ],
        "prep": ["穿一双好走的鞋", "不带垃圾下楼也行，回来再说"],
        "surprise": "回来的时候，在楼下买一瓶她常喝的水。",
    },
    {
        "id": "icecream",
        "title": "下楼买两支冰淇淋",
        "cost": 20,
        "minutes": 45,
        "place": "都行",
        "category": "城市",
        "tags": ["低预算", "散步", "短"],
        "summary": "把一次普通的下楼，变成一个小小的出门。",
        "flow": [
            (0, "下楼买两支冰淇淋"),
            (15, "坐在路边吃完，不着急回去"),
            (40, "顺便走一小圈"),
        ],
        "prep": ["带纸巾", "确认她今天想不想吃凉的"],
        "surprise": "让她先挑，你拿剩下那支。",
    },
    {
        "id": "walk-store",
        "title": "楼下散步 + 便利店关东煮",
        "cost": 30,
        "minutes": 90,
        "place": "都行",
        "category": "城市",
        "tags": ["低预算", "散步", "日常"],
        "summary": "不用计划，走到哪儿算哪儿。",
        "flow": [
            (0, "下楼，不设目的地，先走十分钟"),
            (20, "聊一件这周发生的小事，不聊工作"),
            (45, "进便利店，关东煮各挑三样"),
            (65, "坐在窗边吃完，观察外面的人"),
            (85, "慢慢走回去"),
        ],
        "prep": ["穿一双好走的鞋", "带纸巾"],
        "surprise": "在便利店让她随便拿一样，不问价格。",
    },
    {
        "id": "noodle-home",
        "title": "在家煮一锅番茄面",
        "cost": 50,
        "minutes": 150,
        "place": "室内",
        "category": "宅家",
        "tags": ["在家", "做饭", "低预算"],
        "summary": "买菜、煮面、把手机放到一边。",
        "flow": [
            (0, "一起去楼下买菜，顺便走一圈"),
            (30, "回家洗菜，放一首你们都喜欢的歌"),
            (55, "一个人掌勺，一个人递调料"),
            (95, "吃饭，不刷手机，只聊这周的小事"),
            (130, "一起洗碗，把厨房恢复原样"),
        ],
        "prep": ["提前问一句：今天想不想出门", "家里有没有鸡蛋和番茄"],
        "surprise": "在碗底压一张便签，写一句只有你们懂的话。",
    },
    {
        "id": "old-movie",
        "title": "把客厅变成电影院",
        "cost": 60,
        "minutes": 180,
        "place": "室内",
        "category": "宅家",
        "tags": ["在家", "电影", "慢"],
        "summary": "选一部都没看过的旧电影，认真看完。",
        "flow": [
            (0, "选一部你们都没看过的旧电影"),
            (15, "关大灯，留一盏小灯，做爆米花"),
            (30, "看电影，允许中途暂停吐槽"),
            (120, "片尾曲放完再开灯"),
            (140, "聊十分钟：如果是我们，会怎么选"),
        ],
        "prep": ["提前选好电影，别在现场纠结半小时", "确认家里有能当零食的东西"],
        "surprise": "把电影票根或一张手写票根夹进相册。",
    },
    {
        "id": "cafe-window",
        "title": "咖啡馆靠窗，各看各的书",
        "cost": 80,
        "minutes": 180,
        "place": "室内",
        "category": "城市",
        "tags": ["咖啡馆", "安静", "日常"],
        "summary": "不一定要一直说话，坐在一起也算约会。",
        "flow": [
            (0, "找一家二楼靠窗的咖啡馆"),
            (20, "各点一杯，先不说话，坐十分钟"),
            (40, "各看各的书或写东西"),
            (100, "交换一句刚才看到的话"),
            (140, "看窗外，猜路过的人在去哪里"),
            (170, "收东西，慢慢走回去"),
        ],
        "prep": ["各带一本想看的书", "确认店几点关门"],
        "surprise": "先到的话，替她点好她常喝的那杯。",
    },
    {
        "id": "market-cook",
        "title": "去菜市场，做三菜一汤",
        "cost": 120,
        "minutes": 210,
        "place": "室内",
        "category": "宅家",
        "tags": ["做饭", "菜市场", "慢"],
        "summary": "把买菜本身当成前半场约会。",
        "flow": [
            (0, "去菜市场，给对方 30 元自由采购"),
            (40, "回家分工：一个洗切，一个掌勺"),
            (100, "做三菜一汤，允许有一道失败"),
            (150, "吃饭，给每道菜打分"),
            (190, "一起收拾，剩下的一道留给明天"),
        ],
        "prep": ["想好冰箱里已有什么", "带一个能装菜的袋子"],
        "surprise": "让她点一道你从来没做过的菜。",
    },
    {
        "id": "city-photo",
        "title": "带相机在城市里乱走",
        "cost": 60,
        "minutes": 240,
        "place": "室外",
        "category": "城市",
        "tags": ["拍照", "散步", "城市"],
        "summary": "定一个很小的主题，比如「红色」。",
        "flow": [
            (0, "带一台相机或手机，定一个主题：红色"),
            (30, "沿一条没走过的路走，拍满 20 张"),
            (100, "找家小店喝东西，互相看对方拍的"),
            (150, "选出最喜欢的三张，说为什么"),
            (200, "把其中一张设成聊天背景"),
        ],
        "prep": ["相机或手机充满电", "带一块备用电池或充电宝"],
        "surprise": "偷偷拍一张她没看镜头的照片，最后才给她看。",
    },
    {
        "id": "seaside-bus",
        "title": "坐公交去海边",
        "cost": 120,
        "minutes": 360,
        "place": "室外",
        "category": "自然",
        "tags": ["海边", "公交", "一日"],
        "summary": "不赶时间，路上也算约会的一部分。",
        "flow": [
            (0, "坐公交去海边，路上不赶时间"),
            (80, "到海边，先走一段没有人的路"),
            (140, "坐下，带的水和吃的拿出来"),
            (220, "拍一张不看镜头的合照"),
            (300, "回程前吃一碗面，赶不上就换一家"),
        ],
        "prep": ["查好回程末班车", "带水和一件防风的外套"],
        "surprise": "把这次的车票留下来，写上日期。",
    },
    {
        "id": "movie-night",
        "title": "看一场电影 + 夜宵",
        "cost": 200,
        "minutes": 240,
        "place": "室内",
        "category": "城市",
        "tags": ["电影", "夜宵", "城市"],
        "summary": "电影只是前菜，散场后走的那段路才是重点。",
        "flow": [
            (0, "提前买好电影票，别选太晚的场"),
            (30, "进场前买一杯喝的，不买大桶爆米花"),
            (60, "看电影，不讨论剧情"),
            (150, "散场后走一段，聊最打动的一场戏"),
            (190, "找一家还开着的夜宵店"),
        ],
        "prep": ["提前看排片", "确认她今天想不想看这个题材"],
        "surprise": "散场后不要急着回家，绕一条远一点的路。",
    },
    {
        "id": "aquarium",
        "title": "海洋馆或美术馆",
        "cost": 300,
        "minutes": 240,
        "place": "室内",
        "category": "体验",
        "tags": ["展览", "安静", "室内"],
        "summary": "找一个能慢慢走、慢慢看的地方。",
        "flow": [
            (0, "提前查好闭馆时间，避开人流高峰"),
            (30, "从最安静的水母馆或最里面的展厅开始"),
            (90, "挑一个展区坐十分钟，不说话"),
            (150, "在纪念品店各给对方挑一件 30 元以内的小东西"),
            (210, "出门后找个地方吃饭"),
        ],
        "prep": ["提前买票", "确认当天有没有闭馆维护"],
        "surprise": "在纪念品店买一件她看了两次但没拿的东西。",
    },
    {
        "id": "picnic-bike",
        "title": "骑车 + 野餐",
        "cost": 120,
        "minutes": 300,
        "place": "室外",
        "category": "自然",
        "tags": ["骑行", "野餐", "白天"],
        "summary": "天气好的时候，把一天交给户外。",
        "flow": [
            (0, "检查车胎，带一块野餐垫"),
            (20, "骑到最近的公园或河边"),
            (70, "铺开垫子，把带来的东西摆好"),
            (130, "吃完躺着看天，不刷手机"),
            (200, "收垃圾，慢慢骑回去"),
            (260, "路过便利店买两支冰淇淋"),
        ],
        "prep": ["看天气和风力", "带垃圾袋、湿巾、防晒"],
        "surprise": "带一个她上次说想吃的零食。",
    },
    {
        "id": "pottery",
        "title": "一起做一次手作",
        "cost": 280,
        "minutes": 180,
        "place": "室内",
        "category": "体验",
        "tags": ["手作", "体验", "纪念品"],
        "summary": "陶艺、烘焙、银饰都行，重点是留下一个东西。",
        "flow": [
            (0, "提前预约，选一个两小时的手作课"),
            (20, "听老师讲，先别急着上手"),
            (50, "各做一个，允许做得丑"),
            (120, "互相在底部刻一个字"),
            (160, "约定取成品那天再来一次"),
        ],
        "prep": ["提前预约", "穿不怕弄脏的衣服"],
        "surprise": "在作品底部刻上你们第一次见面的日期。",
    },
    {
        "id": "hotspring",
        "title": "汤泉泡一下午",
        "cost": 400,
        "minutes": 300,
        "place": "室内",
        "category": "体验",
        "tags": ["放松", "冬天", "室内"],
        "summary": "什么都不做，把一整个下午泡掉。",
        "flow": [
            (0, "带好换洗衣物和补水的东西"),
            (30, "先冲淋，再进池子"),
            (100, "泡十五分钟，出来休息十分钟"),
            (180, "去休息区躺着，吃点东西"),
            (250, "再泡最后一次，准备回程"),
        ],
        "prep": ["确认她是否喜欢泡汤", "带补水饮料和换洗衣物"],
        "surprise": "出来后给她一杯温水，不要递冰的。",
    },
    {
        "id": "small-town",
        "title": "周边小镇一日",
        "cost": 350,
        "minutes": 480,
        "place": "室外",
        "category": "自然",
        "tags": ["一日", "小镇", "慢"],
        "summary": "不查攻略，到了再决定去哪儿。",
        "flow": [
            (0, "坐最早一班车去周边小镇"),
            (90, "到了先不查攻略，沿主街走"),
            (180, "找一家本地人多的店吃午饭"),
            (260, "去一个不需要门票的地方坐着"),
            (360, "买一点带得走的小东西"),
            (430, "赶末班车回去"),
        ],
        "prep": ["查好往返车次", "带充电宝和现金"],
        "surprise": "在镇上给她寄一张明信片，地址写你们家。",
    },
    {
        "id": "skyline-dinner",
        "title": "高处看夜景 + 好好吃一顿",
        "cost": 500,
        "minutes": 240,
        "place": "室内",
        "category": "大餐",
        "tags": ["夜景", "晚餐", "仪式感"],
        "summary": "把预算集中用在一个晚上。",
        "flow": [
            (0, "提前订好靠窗的位置"),
            (30, "先到高处看一会儿夜景"),
            (70, "入座，慢慢点菜，不赶时间"),
            (150, "吃完饭再坐一会儿，不急着走"),
            (200, "散步到能看见灯的地方"),
        ],
        "prep": ["提前订位", "确认着装要求"],
        "surprise": "提前跟店员说好，最后上一份写着她名字的小甜点。",
    },
    {
        "id": "theme-park",
        "title": "主题乐园或演出",
        "cost": 700,
        "minutes": 420,
        "place": "室外",
        "category": "体验",
        "tags": ["一日", "演出", "热闹"],
        "summary": "把体力用在同一天，回来会很好睡。",
        "flow": [
            (0, "开园前到，先玩最想玩的一个"),
            (60, "趁人少拍几张照"),
            (150, "吃午饭，避开最挤的时段"),
            (240, "看一场演出或巡游"),
            (330, "玩一个上次没敢玩的"),
            (400, "离园前买一个小的纪念品"),
        ],
        "prep": ["提前买票、看天气", "穿好走的鞋，带充电宝"],
        "surprise": "提前查好当天最后一场演出的时间，把它留到结尾。",
    },
]


# ---------------------------------------------------------------------------
# 4. 控制台与输入输出
# ---------------------------------------------------------------------------

class UserExit(Exception):
    """用户按了 Ctrl+C 或输入流结束。用它统一退出，避免打印一大堆报错。"""


def setup_console() -> None:
    """
    Windows 的控制台默认不一定是 UTF-8，直接打印中文可能乱码。
    这里先把控制台代码页切到 65001，再把输入/输出都设成 UTF-8；
    任何一步失败都不影响程序继续跑。
    """
    if os.name == "nt":
        try:
            import ctypes

            ctypes.windll.kernel32.SetConsoleOutputCP(65001)
            ctypes.windll.kernel32.SetConsoleCP(65001)
        except (AttributeError, OSError):
            pass

    for stream in (sys.stdin, sys.stdout, sys.stderr):
        if stream is None:
            continue
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, OSError):
            pass


def read_input(prompt: str) -> str:
    """
    包装 input()，统一处理两种退出：
      - Ctrl+C：用户主动中断
      - EOF：输入流结束（比如被脚本管道调用）
    """
    try:
        return input(prompt)
    except (EOFError, KeyboardInterrupt):
        print()
        raise UserExit


def pause() -> None:
    """
    在主菜单的一个功能结束后停一下，等用户看完再返回。
    如果输入不是终端（例如用管道自动测试），就自动跳过，避免卡住。
    """
    if not sys.stdin.isatty():
        return
    try:
        input("\n按回车返回主菜单…")
    except (EOFError, KeyboardInterrupt):
        print()
        raise UserExit


def hr(char: str = "─", width: int = 54) -> str:
    """返回一条分隔线。"""
    return char * width


def clip(text: str, limit: int = 90) -> str:
    """把过长的文字截断，避免提醒列表被一条备注撑爆。"""
    text = re.sub(r"\s+", " ", str(text)).strip()
    if len(text) <= limit:
        return text
    return text[: limit - 1] + "…"


def wrap_line(text: str, width: int = 78, indent: str = "  ") -> str:
    """
    中文没有空格，textwrap 按字符数换行虽然不是完美的显示宽度，
    但比一整行冲出屏幕好。主要用于长备注。
    """
    wrapped = textwrap.wrap(text, width=width, break_long_words=True, break_on_hyphens=False)
    return ("\n" + indent).join(wrapped)


# ---------------------------------------------------------------------------
# 5. 数据读写、备份与恢复
# ---------------------------------------------------------------------------

def _write_json(data: dict) -> None:
    """
    原子写入：先写一个临时文件，再整体替换 memory.json。
    这样即使写到一半断电，也不会留下一个半截的 JSON。
    """
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    temp_file = MEMORY_FILE.with_name(MEMORY_FILE.name + ".tmp")
    with temp_file.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    os.replace(temp_file, MEMORY_FILE)


def prune_backups() -> None:
    """只保留最近的 MAX_BACKUPS 个备份，按文件名里的时间排序。"""
    if not BACKUP_DIR.exists():
        return
    backups = sorted(BACKUP_DIR.glob("memory-*.json"), reverse=True)
    for old in backups[MAX_BACKUPS:]:
        try:
            old.unlink()
        except OSError:
            pass


def make_backup(tag: str = "auto") -> Path | None:
    """
    把当前的 memory.json 复制到 backups 文件夹。
    返回备份路径；如果没有原文件（第一次运行），返回 None。
    """
    if not MEMORY_FILE.exists():
        return None
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    target = BACKUP_DIR / f"memory-{stamp}-{tag}.json"
    shutil.copy2(MEMORY_FILE, target)
    prune_backups()
    return target


def save_memory(data: dict, backup: bool = True) -> None:
    """保存数据。默认先在 backups 里留一份旧版本，再覆盖。"""
    data.setdefault("meta", {})
    data["meta"]["version"] = SCHEMA_VERSION
    data["meta"]["updated_at"] = datetime.now().isoformat(timespec="seconds")
    if backup:
        make_backup("auto")
    _write_json(data)


def normalize_memory(raw: dict) -> dict:
    """
    把读进来的数据补齐到当前格式。
    原则：
      - 用户已经有的内容绝不覆盖。
      - 只补缺失的键，并把明显错误的结构修正成可用的类型。
    """
    data = copy.deepcopy(raw)

    defaults = default_memory()
    for key in ("meta", "couple", "anniversaries", "important", "preferences", "memories"):
        if key not in data or data[key] is None:
            data[key] = defaults[key]

    if not isinstance(data["meta"], dict):
        data["meta"] = defaults["meta"]
    if not isinstance(data["couple"], dict):
        data["couple"] = defaults["couple"]
    for key, value in defaults["couple"].items():
        data["couple"].setdefault(key, value)

    for key in ("anniversaries", "important"):
        if not isinstance(data[key], list):
            data[key] = defaults[key]
        data[key] = [item for item in data[key] if isinstance(item, dict)]

    if not isinstance(data["memories"], list):
        data["memories"] = defaults["memories"]
    data["memories"] = [item for item in data["memories"] if isinstance(item, dict)]

    if not isinstance(data["preferences"], dict):
        data["preferences"] = defaults["preferences"]
    cleaned_preferences = {}
    for person, categories in data["preferences"].items():
        if not isinstance(categories, dict):
            continue
        cleaned_categories = {}
        for category, items in categories.items():
            if isinstance(items, list):
                cleaned_categories[str(category)] = [str(item) for item in items if str(item).strip()]
        cleaned_preferences[str(person)] = cleaned_categories
    data["preferences"] = cleaned_preferences

    return data


def load_memory() -> dict:
    """
    读取 memory.json：
      1. 不存在：用示例数据创建一份。
      2. 存在但 JSON 坏了：先把坏文件改名留证，再创建一份新的。
      3. 正常：补齐缺失字段后返回。
    """
    if not MEMORY_FILE.exists():
        data = default_memory()
        save_memory(data, backup=False)
        print(f"[提示] 第一次运行，已在 {MEMORY_FILE} 创建示例数据。")
        print("       想改成你们自己的故事，请从主菜单 6 开始，或直接编辑这个文件。\n")
        return data

    try:
        raw = json.loads(MEMORY_FILE.read_text(encoding="utf-8-sig"))
        if not isinstance(raw, dict):
            raise ValueError("最外层必须是一个 JSON 对象")
    except (json.JSONDecodeError, OSError, ValueError) as exc:
        stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        broken = MEMORY_FILE.with_name(f"memory.broken-{stamp}.json")
        try:
            shutil.copy2(MEMORY_FILE, broken)
        except OSError:
            broken = None
        data = default_memory()
        save_memory(data, backup=False)
        print(f"[警告] 读取 memory.json 失败：{exc}")
        if broken:
            print(f"       原来的文件已复制到：{broken}")
        print("       已用示例数据重新生成，请检查后继续。\n")
        return data

    return normalize_memory(raw)


def list_backups() -> list[Path]:
    """按时间从新到旧列出备份文件。"""
    if not BACKUP_DIR.exists():
        return []
    return sorted(BACKUP_DIR.glob("memory-*.json"), reverse=True)


def restore_backup(path: Path) -> dict:
    """从指定备份恢复。恢复前会先备份当前数据，万一选错还能再回来。"""
    raw = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(raw, dict):
        raise ValueError("备份文件格式不正确")
    data = normalize_memory(raw)
    if MEMORY_FILE.exists():
        make_backup("before-restore")
    _write_json(data)
    return data


# ---------------------------------------------------------------------------
# 6. 日期与文本工具
# ---------------------------------------------------------------------------

def today_date() -> date:
    """单独包一层，测试时如果想固定日期，只需要改这里。"""
    return date.today()


def now_iso() -> str:
    """当前时间的标准字符串，用于元数据。"""
    return datetime.now().isoformat(timespec="seconds")


def safe_date(year: int, month: int, day: int) -> date:
    """
    构造日期。唯一特殊的是 2 月 29 日：
    在非闰年自动落到 2 月 28 日，避免生日/纪念日直接报错消失。
    """
    try:
        return date(year, month, day)
    except ValueError:
        if month == 2 and day == 29:
            return date(year, 2, 28)
        raise


def parse_month_day(text: str) -> tuple[int, int] | None:
    """
    解析「5-20」「05/20」「5月20日」「2023-05-20」这类输入，返回 (月, 日)。
    解析不出来返回 None，由调用方决定是重问还是跳过。
    """
    if not text:
        return None
    value = str(text).strip()
    full = re.fullmatch(r"(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})日?", value)
    if full:
        month, day = int(full.group(2)), int(full.group(3))
    else:
        short = re.fullmatch(r"(\d{1,2})[-/.月](\d{1,2})日?", value)
        if not short:
            return None
        month, day = int(short.group(1)), int(short.group(2))
    try:
        date(2000, month, day)  # 2000 是闰年，可以顺带验证 2/29
    except ValueError:
        return None
    return month, day


def parse_date_flexible(text: str, default_year: int | None = None) -> date | None:
    """
    解析完整日期：
      - 带年份：2026-11-03、2026/11/03、2026年11月3日
      - 不带年份：11-03，使用 default_year（默认今年）
    """
    if not text:
        return None
    value = str(text).strip()
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%Y.%m.%d", "%Y年%m月%d日", "%Y%m%d"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    md = parse_month_day(value)
    if md:
        year = default_year or today_date().year
        return safe_date(year, md[0], md[1])
    return None


def parse_start_datetime(text: str) -> datetime | None:
    """
    解析「在一起的起点」。支持带时间和不带时间两种写法。
    不带时间时按 00:00 处理。
    """
    if not text:
        return None
    value = str(text).strip()
    for fmt in (
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y/%m/%d %H:%M",
        "%Y-%m-%d",
        "%Y/%m/%d",
        "%Y年%m月%d日 %H:%M",
        "%Y年%m月%d日",
    ):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    parsed_date = parse_date_flexible(value)
    if parsed_date:
        return datetime.combine(parsed_date, time.min)
    return None


def _parse_cn_number(text: str) -> int | None:
    """把「八」「十二」「二十三」这类中文数字转成整数。"""
    if not text:
        return None
    if text.isdigit():
        return int(text)

    digits = {"零": 0, "一": 1, "二": 2, "两": 2, "三": 3, "四": 4,
              "五": 5, "六": 6, "七": 7, "八": 8, "九": 9}
    if text == "十":
        return 10
    if "十" in text:
        left, _, right = text.partition("十")
        tens = digits.get(left, 1) if left else 1
        ones = digits.get(right, 0) if right else 0
        return tens * 10 + ones
    if len(text) == 1 and text in digits:
        return digits[text]
    return None


def parse_clock(text: str) -> tuple[int, int] | None:
    """
    解析「14:00」「下午2点」「晚上八点半」这类时间，返回 (时, 分)。
    只用于约会时间线的起点，解析失败就退回「第 N 分钟」。
    """
    if not text:
        return None
    value = str(text).strip()
    hour = minute = None

    match = re.search(r"(\d{1,2})\s*[:：]\s*(\d{1,2})", value)
    if match:
        hour, minute = int(match.group(1)), int(match.group(2))
    else:
        match = re.search(
            r"([0-9一二三四五六七八九十两]{1,3})\s*[点時时]\s*(半|[0-9一二三四五六七八九十]{1,3})?",
            value,
        )
        if match:
            hour = _parse_cn_number(match.group(1))
            tail = match.group(2)
            if tail == "半":
                minute = 30
            elif tail:
                minute = _parse_cn_number(tail)
            else:
                minute = 0

    if hour is None or minute is None:
        return None

    # 「下午两点」「晚上八点」这种说法，需要把 12 小时制换成 24 小时制。
    if any(word in value for word in ("下午", "晚上", "傍晚")) and hour < 12:
        hour += 12
    elif "中午" in value and hour < 11:
        hour += 12

    if not (0 <= hour <= 23 and 0 <= minute <= 59):
        return None
    return hour, minute


def format_date_cn(value: date) -> str:
    """2026年10月25日 星期日"""
    return f"{value.year}年{value.month}月{value.day}日 {WEEKDAYS[value.weekday()]}"


def format_md(value: date) -> str:
    """10月25日"""
    return f"{value.month}月{value.day}日"


def format_date_short(value: date) -> str:
    """2026-10-25，用于数据展示和备份说明。"""
    return value.isoformat()


def next_yearly(month: int, day: int, on: date, since: date | None = None) -> date:
    """
    找出「下一个」每年重复的日期。
    如果今年的已经过了，就返回明年的；如果就是今天，返回今天。
    如果 count_from 是未来时间，从那个年份开始找。
    """
    start_year = max(on.year, since.year if since else on.year)
    for year in range(start_year, start_year + 5):
        candidate = safe_date(year, month, day)
        if candidate >= on:
            return candidate
    return safe_date(start_year, month, day)


def days_until(target: date, on: date | None = None) -> int:
    """目标日期还有几天。今天返回 0，已经过去返回负数。"""
    base = on or today_date()
    return (target - base).days


def human_days(days: int) -> str:
    """把天数差变成中文。"""
    if days == 0:
        return "就是今天"
    if days == 1:
        return "明天"
    if days == 2:
        return "后天"
    if days > 0:
        return f"还有 {days} 天"
    return f"已经过去 {abs(days)} 天"


def human_duration(start: date, end: date) -> str:
    """
    计算两个日期之间「几年几个月几天」。
    先按年月日逐项相减，不够就向前借一位，够用且容易讲清楚。
    """
    if end < start:
        return "还没开始"
    years = end.year - start.year
    months = end.month - start.month
    days = end.day - start.day

    if days < 0:
        months -= 1
        # 借上一个月的天数：先找到 end 所在月的第一天，再往前一天。
        previous_month_end = date(end.year, end.month, 1) - timedelta(days=1)
        days += previous_month_end.day
    if months < 0:
        years -= 1
        months += 12

    parts = []
    if years:
        parts.append(f"{years} 年")
    if months:
        parts.append(f"{months} 个月")
    if days or not parts:
        parts.append(f"{days} 天")
    return " ".join(parts)


def couple_start(data: dict) -> datetime | None:
    """从数据里取出在一起的起点；格式坏了返回 None。"""
    return parse_start_datetime(str(data.get("couple", {}).get("start", "")))


def days_together(data: dict, on: date | None = None) -> int | None:
    """
    在一起第几天（把开始那天算作第 1 天）。
    起点在未来或者格式错误时返回 None。
    """
    start = couple_start(data)
    if not start:
        return None
    base = on or today_date()
    difference = (base - start.date()).days
    if difference < 0:
        return None
    return difference + 1


# ---------------------------------------------------------------------------
# 7. 纪念日与重要事项
# ---------------------------------------------------------------------------

def build_events(data: dict, on: date | None = None) -> list[dict]:
    """
    把「每年重复的纪念日」和「只发生一次的重要事项」合并成一个列表。
    每个事件都包含下一次发生的日期、还有几天、来源类型和备注。
    已经过去的一次性事项不会出现在未来的提醒里。
    """
    base = on or today_date()
    events = []

    for item in data.get("anniversaries", []):
        if not isinstance(item, dict):
            continue
        title = str(item.get("title", "")).strip() or "未命名纪念日"
        month_day = parse_month_day(str(item.get("date", "")))
        if not month_day:
            continue
        since = parse_date_flexible(str(item.get("count_from", "")), default_year=base.year)
        next_date = next_yearly(month_day[0], month_day[1], base, since)
        events.append(
            {
                "title": title,
                "date": next_date,
                "days_left": (next_date - base).days,
                "kind": "纪念日",
                "note": str(item.get("note", "")).strip(),
                "since": since,
                "count_from": since,
            }
        )

    for item in data.get("important", []):
        if not isinstance(item, dict):
            continue
        title = str(item.get("title", "")).strip() or "未命名事项"
        target = parse_date_flexible(str(item.get("date", "")))
        if not target:
            continue
        if target < base:
            continue  # 一次性事项过去了就不提醒，但数据仍保留
        events.append(
            {
                "title": title,
                "date": target,
                "days_left": (target - base).days,
                "kind": "重要事项",
                "note": str(item.get("note", "")).strip(),
                "since": None,
                "count_from": None,
            }
        )

    events.sort(key=lambda event: (event["days_left"], event["title"]))
    return events


def event_title(event: dict) -> str:
    """事件标题，如果是第 N 个纪念日，就把年数补上。"""
    title = event["title"]
    since = event.get("count_from")
    if since and event["kind"] == "纪念日":
        years = event["date"].year - since.year
        if years >= 1:
            return f"{title}（第 {years} 个）"
    return title


def format_event(event: dict, with_year: bool = False) -> str:
    """把事件格式化成一行，用于提醒列表。"""
    when = format_date_cn(event["date"]) if with_year else format_md(event["date"])
    return f"{when} · {event_title(event)} · {human_days(event['days_left'])}"


# ---------------------------------------------------------------------------
# 8. 今日概览、提醒与问答
# ---------------------------------------------------------------------------

def render_today(data: dict) -> str:
    """生成「今日概览」的完整文本。"""
    base = today_date()
    couple = data.get("couple", {})
    partner = str(couple.get("partner", "对方")).strip() or "对方"
    start = couple_start(data)

    lines = [hr(), "今日概览", hr()]
    lines.append(f"今天：{format_date_cn(base)}")

    day_number = days_together(data, base)
    if start and day_number:
        lines.append(
            f"我们在一起：第 {day_number} 天"
            f"（从 {start.year}年{start.month}月{start.day}日 "
            f"{start.hour:02d}:{start.minute:02d} 开始）"
        )
        if start.date() <= base:
            lines.append(f"换算一下：{human_duration(start.date(), base)}。")
    else:
        lines.append("我们在一起：起点日期还没设置好，可在菜单 6 → 5 修改。")

    events = build_events(data, base)
    todays = [event for event in events if event["days_left"] == 0]
    if todays:
        lines.append("")
        lines.append("今天就是：")
        for event in todays:
            note = f"｜{clip(event['note'], 48)}" if event["note"] else ""
            lines.append(f"  · {event_title(event)}（{event['kind']}）{note}")

    upcoming = [event for event in events if 0 < event["days_left"] <= 30]
    lines.append("")
    if upcoming:
        lines.append("未来 30 天：")
        for event in upcoming[:4]:
            lines.append(f"  · {format_event(event)}")
            if event["note"]:
                lines.append(f"    {wrap_line(clip(event['note'], 70), indent='    ')}")
    else:
        lines.append("未来 30 天没有特别记录的日子。")
        future = [event for event in events if event["days_left"] > 0]
        if future:
            nxt = future[0]
            lines.append(f"下一个日子：{format_event(nxt, with_year=True)}")

    if partner:
        lines.append("")
        lines.append(f"今天想为 {partner} 做点什么的话，可以试试菜单 3 或 4。")
    return "\n".join(lines)


def render_upcoming(data: dict, days: int = 60) -> str:
    """列出未来 N 天的纪念日与重要事项。"""
    base = today_date()
    events = [event for event in build_events(data, base) if event["days_left"] <= days]
    lines = [hr(), f"未来 {days} 天的重要日子", hr()]

    if not events:
        lines.append("这段时间没有记录在案的日子。")
        future = [event for event in build_events(data, base) if event["days_left"] > 0]
        if future:
            lines.append("")
            lines.append("再往后的三个日子：")
            for event in future[:3]:
                lines.append(f"  · {format_event(event, with_year=True)}")
        lines.append("")
        lines.append("想添加纪念日或重要事项：主菜单 6。")
        return "\n".join(lines)

    lines.append(f"从 {format_date_cn(base)} 算起，共 {len(events)} 件：")
    for event in events:
        lines.append("")
        lines.append(f"· {format_event(event, with_year=True)}")
        lines.append(f"  类型：{event['kind']}")
        if event["note"]:
            lines.append(f"  备注：{wrap_line(event['note'], indent='        ')}")
        if event["days_left"] == 0:
            lines.append("  今天就是这一天。")
        elif event["days_left"] <= 7:
            lines.append(f"  只剩 {event['days_left']} 天，可以开始准备了。")
    return "\n".join(lines)


def _query_tokens(query: str) -> list[str]:
    """
    把一句中文拆成可用于搜索的片段：
      - 英文/数字按整词
      - 中文按两字组合（因为中文没有空格，bigram 是最简单的办法）
      - 去掉「什么」「怎么」这类没有信息量的词
    """
    stopwords = {
        "我们", "你们", "他们", "什么", "怎么", "这个", "那个", "一下", "可以",
        "有没有", "还记", "记得", "告诉", "帮我", "请问", "多少", "哪些",
        "喜欢", "讨厌", "知道", "关于", "事情", "东西", "时候", "现在",
    }
    value = str(query).strip().lower()
    value = re.sub(r"[^\w\u4e00-\u9fff]+", "", value)

    tokens = []
    for word in re.findall(r"[a-z0-9]{2,}", value):
        tokens.append(word)

    for segment in re.findall(r"[\u4e00-\u9fff]+", value):
        if len(segment) <= 4:
            tokens.append(segment)
        for index in range(len(segment) - 1):
            tokens.append(segment[index : index + 2])

    # 去重但保持顺序，过滤掉停用词和过短片段
    result = []
    for token in tokens:
        if token in stopwords or len(token) < 2:
            continue
        if token not in result:
            result.append(token)
    return result[:24]


def _search_entries(data: dict, query: str) -> list[dict]:
    """
    在纪念日、重要事项、喜好、回忆里做一次简单的关键词搜索。
    不联网、不调用大模型，靠的是「关键词命中 + 标题加权」。
    """
    tokens = _query_tokens(query)
    if not tokens:
        return []

    entries = []

    for item in data.get("anniversaries", []):
        if not isinstance(item, dict):
            continue
        title = str(item.get("title", ""))
        note = str(item.get("note", ""))
        text = f"{title} {note} 纪念日 {item.get('date', '')}"
        entries.append(
            {
                "title": title or "纪念日",
                "meta": f"每年 {item.get('date', '')} · 纪念日",
                "body": note,
                "text": text,
            }
        )

    for item in data.get("important", []):
        if not isinstance(item, dict):
            continue
        title = str(item.get("title", ""))
        note = str(item.get("note", ""))
        text = f"{title} {note} 重要事项 {item.get('date', '')}"
        entries.append(
            {
                "title": title or "重要事项",
                "meta": f"{item.get('date', '')} · 重要事项",
                "body": note,
                "text": text,
            }
        )

    for person, categories in data.get("preferences", {}).items():
        if not isinstance(categories, dict):
            continue
        for category, items in categories.items():
            for item in items:
                entries.append(
                    {
                        "title": f"{person} · {category}",
                        "meta": "喜好清单",
                        "body": str(item),
                        "text": f"{person} {category} {item}",
                    }
                )

    for item in data.get("memories", []):
        if not isinstance(item, dict):
            continue
        title = str(item.get("title", ""))
        detail = str(item.get("detail", ""))
        tags = " ".join(str(tag) for tag in item.get("tags", []) if tag)
        text = f"{title} {detail} {tags} {item.get('date', '')}"
        entries.append(
            {
                "title": title or "一条回忆",
                "meta": f"{item.get('date', '')} · 回忆",
                "body": detail,
                "text": text,
            }
        )

    scored = []
    for entry in entries:
        score = 0
        text = entry["text"].lower()
        for token in tokens:
            if token in text:
                score += 2
        # 标题里命中，权重更高
        title_lower = entry["title"].lower()
        for token in tokens:
            if token in title_lower:
                score += 3
        # 整句查询直接出现在文本里，基本就是用户要的
        compact_query = re.sub(r"[^\w\u4e00-\u9fff]+", "", str(query).lower())
        if compact_query and compact_query in text:
            score += 8
        if score >= 4:
            scored.append((score, entry))

    scored.sort(key=lambda pair: pair[0], reverse=True)
    return [entry for _, entry in scored[:3]]


def _relationship_answer(data: dict) -> str:
    """回答「我们在一起多久」。"""
    start = couple_start(data)
    base = today_date()
    if not start:
        return "我还没有读到你们的开始日期。可以在菜单 6 → 5 修改基本资料。"
    if start.date() > base:
        return f"你填的开始日期是 {format_date_cn(start.date())}，还在未来呢。可以到菜单 6 → 5 改一下。"

    total_days = (base - start.date()).days + 1
    lines = [
        f"从 {format_date_cn(start.date())} {start.hour:02d}:{start.minute:02d} 开始，",
        f"到今天 {format_date_cn(base)}，是第 {total_days} 天。",
        f"按年月日算，是 {human_duration(start.date(), base)}。",
    ]

    events = build_events(data, base)
    anniversary = next(
        (event for event in events if "在一起" in event["title"] and event["kind"] == "纪念日"),
        None,
    )
    if anniversary:
        lines.append(
            f"下一次「{anniversary['title']}」在 {format_date_cn(anniversary['date'])}，"
            f"{human_days(anniversary['days_left'])}。"
        )
    return "\n".join(lines)


def _birthday_answer(data: dict) -> str:
    """回答和生日有关的问题。"""
    couple = data.get("couple", {})
    partner = str(couple.get("partner", "对方"))
    base = today_date()
    lines = []

    for label, raw in (
        (f"{partner}的生日", couple.get("partner_birthday", "")),
        ("你的生日", couple.get("my_birthday", "")),
    ):
        month_day = parse_month_day(str(raw))
        if not month_day:
            if label == "你的生日":
                lines.append("你自己的生日还没有记录，可以在菜单 6 → 5 补上。")
            continue
        next_date = next_yearly(month_day[0], month_day[1], base)
        lines.append(
            f"{label}：{month_day[0]}月{month_day[1]}日，"
            f"下一次是 {format_date_cn(next_date)}，{human_days((next_date - base).days)}。"
        )

    partner_birthday = parse_month_day(str(couple.get("partner_birthday", "")))
    extra = []
    for item in data.get("anniversaries", []):
        if not isinstance(item, dict) or "生日" not in str(item.get("title", "")):
            continue
        # 如果这条只是把 partner_birthday 重复写了一遍，就不再重复回答。
        if partner_birthday and (month_day := parse_month_day(str(item.get("date", "")))):
            if month_day == partner_birthday:
                continue
        extra.append(item)

    for item in extra:
        month_day = parse_month_day(str(item.get("date", "")))
        if month_day:
            next_date = next_yearly(month_day[0], month_day[1], base)
            lines.append(
                f"另外还记着「{item.get('title')}」：{month_day[0]}月{month_day[1]}日，"
                f"{human_days((next_date - base).days)}。"
            )

    if not lines:
        return "我还没有记住生日。可以在菜单 6 → 5 里填写对方的生日（格式 10-16）。"
    if "生日" in " ".join(str(item.get("note", "")) for item in extra):
        lines.append("提醒：生日不一定要大惊喜，先问她今天累不累。")
    return "\n".join(lines)


def _anniversary_answer(data: dict) -> str:
    """回答「纪念日」相关的问题。"""
    base = today_date()
    annual = [
        event for event in build_events(data, base)
        if event["kind"] == "纪念日"
    ]
    if not annual:
        return "我还没有记录纪念日。可以在菜单 6 → 1 添加，日期格式写 05-20。"
    lines = ["我记住的纪念日："]
    for event in annual:
        lines.append(f"  · {format_event(event, with_year=True)}")
        if event["note"]:
            lines.append(f"    {clip(event['note'], 60)}")
    lines.append("")
    lines.append("想要更完整的提醒，用菜单 5 看未来 60 天。")
    return "\n".join(lines)


def _important_answer(data: dict) -> str:
    """回答「最近有什么重要的事」。"""
    base = today_date()
    events = [event for event in build_events(data, base) if event["kind"] == "重要事项"]
    if not events:
        return "未来没有记录在案的重要事项。可以在菜单 6 → 2 添加。"
    lines = ["我记着这些重要事项："]
    for event in events[:8]:
        lines.append(f"  · {format_event(event, with_year=True)}")
        if event["note"]:
            lines.append(f"    {clip(event['note'], 60)}")
    return "\n".join(lines)


def _preference_answer(data: dict, query: str) -> str | None:
    """
    回答喜好类问题。
    先判断问的是谁，再判断问的是哪一类（喜欢/不喜欢/送礼/在意），
    最后如果提到了具体东西（比如「咖啡」），就只返回相关的那几条。
    """
    compact = re.sub(r"\s+", "", query)
    partner = str(data.get("couple", {}).get("partner", "小满"))
    me = str(data.get("couple", {}).get("me", "阿星"))

    if me and me in compact:
        person = me
    elif partner and partner in compact:
        person = partner
    elif any(word in compact for word in ("她", "他", "对方", "女朋友", "男朋友")):
        person = partner
    else:
        person = partner  # 没点名时，默认问的是对方

    categories = data.get("preferences", {}).get(person, {})
    if not isinstance(categories, dict) or not categories:
        return None

    if any(word in compact for word in ("不喜欢", "讨厌", "不爱", "不吃", "过敏", "雷区")):
        category = "不喜欢"
    elif any(word in compact for word in ("礼物", "送什么", "送她", "送他", "送礼")):
        category = "送礼"
    elif any(word in compact for word in ("在意", "注意", "禁忌", "不能")):
        category = "在意"
    else:
        category = "喜欢"

    # 数据里没有这一类时，明确说没有，不要把「喜欢」当成「不喜欢」返回。
    if category not in categories:
        return f"关于「{person} · {category}」，我还没有记录。可以在菜单 6 → 3 添加。"

    items = [str(item) for item in categories.get(category, []) if str(item).strip()]
    if not items:
        return f"关于「{person} · {category}」，我还没有记录。"

    # 尝试从问题里找出具体对象，例如「小满喜欢喝咖啡吗」
    tokens = _query_tokens(query)
    specific = [
        item for item in items
        if any(token in item for token in tokens)
    ]
    shown = specific if specific else items

    lines = [f"关于「{person} · {category}」，我记住这些："]
    for index, item in enumerate(shown, start=1):
        lines.append(f"  {index}. {item}")
    if specific and len(specific) < len(items):
        lines.append(f"（另外还有 {len(items) - len(specific)} 条，问得更笼统一点我就全列出来。）")
    lines.append("")
    lines.append(f"这些是示例数据，可以在菜单 6 → 3 里增删。")
    return "\n".join(lines)


def answer_question(data: dict, query: str) -> str:
    """
    问答入口。先处理明确的意图，再退回关键词搜索。
    这是规则匹配，不是大模型，所以回答范围只限你记录过的内容。
    """
    raw = str(query).strip()
    if not raw:
        return "你想问什么？比如「我们在一起多久」「小满喜欢什么」「第一次看海」。"
    compact = re.sub(r"\s+", "", raw)

    if any(word in compact for word in ("你是谁", "你能做什么", "帮助", "怎么用")):
        return (
            "我是只存在这台电脑里的恋爱小助手。\n"
            "我能查纪念日、记喜好、搜回忆、生成情话、按预算和时间安排约会。\n"
            "你可以问：「我们在一起多久」「小满喜欢什么」「第一次看海」。"
        )

    if any(word in compact for word in ("名字", "叫什么")) and not any(
        word in compact for word in ("生日", "纪念日")
    ):
        couple = data.get("couple", {})
        return (
            f"你叫 {couple.get('me', '（未填写）')}，对方叫 {couple.get('partner', '（未填写）')}。"
            f"数据里记录的常驻地是「{couple.get('city', '（未填写）')}」。"
        )

    if "生日" in compact:
        return _birthday_answer(data)

    # 「多久/几天/第几天/几年」+「在一起/我们」→ 关系天数
    relationship_words = ("多久", "几天", "第几天", "多少天", "几年")
    relationship_subjects = ("在一起", "我们", "恋爱", "认识")
    if (
        any(word in compact for word in relationship_words)
        and any(word in compact for word in relationship_subjects)
    ) or compact in ("第几天", "几天了", "在一起多久了"):
        return _relationship_answer(data)

    if "纪念日" in compact:
        return _anniversary_answer(data)

    if any(word in compact for word in ("重要", "事项", "最近有", "最近要", "别忘", "提醒")):
        return _important_answer(data)

    # 只有单独问「今天」时才走今日概览，避免把普通句子里带「今天」的搜索截走
    if compact in ("今天", "今天几号", "今天是什么日子", "今天有什么"):
        return render_today(data)

    # 只有句子里真的出现「喜好类」的词，才进入喜好回答；
    # 否则「第一次看海」这种查询会被误判成「小满喜欢什么」。
    preference_words = (
        "喜欢", "讨厌", "不爱", "不吃", "过敏", "礼物", "送什么", "送礼",
        "在意", "注意", "禁忌", "雷区",
    )
    if any(word in compact for word in preference_words):
        preference = _preference_answer(data, raw)
        if preference:
            return preference

    hits = _search_entries(data, raw)
    if hits:
        lines = ["我记得这些："]
        for index, entry in enumerate(hits, start=1):
            lines.append("")
            lines.append(f"{index}. {entry['title']}")
            lines.append(f"   {entry['meta']}")
            if entry["body"]:
                lines.append(f"   {clip(entry['body'], 96)}")
        lines.append("")
        lines.append("完整内容在 data/memory.json。要补充，用菜单 6 → 4。")
        return "\n".join(lines)

    return (
        "我还没记住这件事。\n"
        "你可以：\n"
        "  · 换一种说法，比如「第一次看海」「小满喜欢什么」「我们在一起多久」\n"
        "  · 用菜单 6 → 4 添加一条回忆\n"
        "  · 直接编辑 data/memory.json"
    )


# ---------------------------------------------------------------------------
# 9. 情话生成
# ---------------------------------------------------------------------------

def _fill_template(template: str, partner: str, me: str, note: str) -> str:
    """替换模板里的占位符。不用 format()，避免备注里的大括号引发错误。"""
    return (
        template.replace("{partner}", partner)
        .replace("{me}", me)
        .replace("{note}", note)
    )


def generate_lines(
    data: dict,
    scene: str,
    note: str = "",
    count: int = 3,
    seed: int | None = None,
) -> list[str]:
    """
    从指定场景里随机挑几条。
    输入了「今天的小事」时，会优先混入一条带 {note} 的模板，
    这样句子和当天的事有关，不像群发。
    """
    if scene not in SCENE_TEMPLATES:
        raise ValueError(f"不认识的场景：{scene}")

    partner = str(data.get("couple", {}).get("partner", "你"))
    me = str(data.get("couple", {}).get("me", "我"))
    note = str(note).strip()
    count = max(1, min(int(count), 6))
    rng = random.Random(seed)

    templates = SCENE_TEMPLATES[scene]
    with_note = [template for template in templates if "{note}" in template]
    without_note = [template for template in templates if "{note}" not in template]

    if note:
        # 至少一条和今天的小事有关，其余用普通模板，避免每条都在提同一件事。
        chosen = []
        if with_note:
            chosen.append(rng.choice(with_note))
        remaining = count - len(chosen)
        if remaining > 0:
            chosen.extend(rng.sample(without_note, min(remaining, len(without_note))))
        if len(chosen) < count and len(with_note) > 1:
            extra = [item for item in with_note if item not in chosen]
            chosen.extend(rng.sample(extra, min(count - len(chosen), len(extra))))
    else:
        chosen = rng.sample(without_note, min(count, len(without_note)))

    rng.shuffle(chosen)
    return [_fill_template(template, partner, me, note) for template in chosen[:count]]


def render_scene(
    data: dict,
    scene: str,
    note: str = "",
    count: int = 3,
    seed: int | None = None,
) -> str:
    """生成情话的完整可打印文本。"""
    label = SCENE_LABELS.get(scene, scene)
    count = max(1, min(int(count), 6))
    lines = [hr(), f"{label}情话 · {count} 条", hr()]
    if note:
        lines.append(f"今天的小事：{note}")
        lines.append("")
    for index, sentence in enumerate(generate_lines(data, scene, note, count, seed), start=1):
        lines.append(f"{index}. {sentence}")
        lines.append("")
    lines.append(SCENE_TIPS.get(scene, ""))
    return "\n".join(lines).rstrip()


# ---------------------------------------------------------------------------
# 10. 约会安排
# ---------------------------------------------------------------------------

def _plan_matches(plan: dict, budget: float, max_minutes: int, place: str) -> bool:
    """判断方案是否满足预算、时间和室内外要求。"""
    if plan["cost"] > budget:
        return False
    if plan["minutes"] > max_minutes:
        return False
    if place == "室内" and plan["place"] == "室外":
        return False
    if place == "室外" and plan["place"] == "室内":
        return False
    return True


def _plan_score(plan: dict, budget: float, max_minutes: int, rng: random.Random) -> float:
    """
    给方案打分：
      - 花掉预算的 50%~80% 最舒服，太少像没安排，太多会心疼。
      - 时间用掉 60%~90% 最舒服，留一点余量。
      - 再加一点随机，保证每次推荐不完全一样。
    """
    if budget > 0:
        budget_ratio = plan["cost"] / budget
    else:
        budget_ratio = 1.0 if plan["cost"] == 0 else 0.0
    time_ratio = plan["minutes"] / max_minutes if max_minutes else 0

    budget_score = 1 - min(abs(budget_ratio - 0.65), 1)
    time_score = 1 - min(abs(time_ratio - 0.75), 1)
    return budget_score * 0.55 + time_score * 0.30 + rng.random() * 0.15


def choose_plans(
    budget: float,
    hours: float,
    place: str = "都行",
    limit: int = 3,
    seed: int | None = None,
) -> list[dict]:
    """
    按条件挑方案。优先选择不同 category，避免三个都是「在家煮面」。
    如果完全没有符合条件的，返回空列表，由调用方给出放宽建议。
    """
    max_minutes = max(1, int(round(hours * 60)))
    rng = random.Random(seed)

    candidates = [
        plan for plan in DATE_PLANS
        if _plan_matches(plan, budget, max_minutes, place)
    ]
    if not candidates:
        return []

    scored = sorted(
        candidates,
        key=lambda plan: _plan_score(plan, budget, max_minutes, rng),
        reverse=True,
    )

    selected = []
    used_categories = set()
    for plan in scored:
        if plan["category"] in used_categories:
            continue
        selected.append(plan)
        used_categories.add(plan["category"])
        if len(selected) >= limit:
            break

    # 如果不同类别的方案不够，用剩下的补满，但不要重复。
    if len(selected) < limit:
        for plan in scored:
            if plan in selected:
                continue
            selected.append(plan)
            if len(selected) >= limit:
                break

    return selected


def _clock_text(start_clock: tuple[int, int] | None, offset: int) -> str:
    """把「开始时间 + 第几分钟」变成 14:35 这样的时刻；没有起点就显示第几分钟。"""
    if not start_clock:
        return f"第 {offset:>3} 分钟"
    base = datetime.combine(today_date(), time(start_clock[0], start_clock[1]))
    moment = base + timedelta(minutes=offset)
    return moment.strftime("%H:%M")


def _plan_reason(plan: dict, budget: float, max_minutes: int) -> str:
    """根据预算和时间，给出一句「为什么推荐它」。"""
    if budget <= 0:
        cost_reason = "零预算也能成行"
    elif plan["cost"] <= budget * 0.35:
        cost_reason = "花得少，几乎没有负担"
    elif plan["cost"] <= budget * 0.75:
        cost_reason = "预算用得刚好，不会心疼"
    else:
        cost_reason = "把这次预算认真用掉"

    time_ratio = plan["minutes"] / max_minutes if max_minutes else 0
    if time_ratio >= 0.8:
        time_reason = "时间填得比较满"
    elif time_ratio <= 0.5:
        time_reason = "留了余量，不会太累"
    else:
        time_reason = "时长刚刚好"

    place_reason = ""
    if plan["place"] == "室内":
        place_reason = "，下雨或不想出门也能去"
    elif plan["place"] == "室外":
        place_reason = "，适合今天想出去走走"

    return f"{cost_reason}；{time_reason}{place_reason}。"


def render_plan(
    budget: float,
    hours: float,
    place: str = "都行",
    start_clock: tuple[int, int] | None = None,
    seed: int | None = None,
) -> str:
    """生成约会方案文本。"""
    budget = max(0.0, float(budget))
    hours = max(0.25, min(float(hours), 24.0))
    max_minutes = int(round(hours * 60))

    lines = [hr(), "约会安排", hr()]
    lines.append(
        f"条件：预算 ¥{budget:g} · 时间 {hours:g} 小时 · "
        f"{'不限室内外' if place == '都行' else place + '为主'}"
    )
    if start_clock:
        lines.append(f"开始时间：{start_clock[0]:02d}:{start_clock[1]:02d}")
    lines.append("")

    plans = choose_plans(budget, hours, place, limit=3, seed=seed)
    if not plans:
        # 没有任何方案满足条件时，给出最接近的一个，并明确说明超在哪里。
        closest = min(
            DATE_PLANS,
            key=lambda plan: (
                max(0, plan["cost"] - budget) / max(budget, 1),
                max(0, plan["minutes"] - max_minutes) / max(max_minutes, 1),
            ),
        )
        lines.append("以你给的条件，我没有找到完全合适的方案。")
        lines.append(
            f"最接近的是「{closest['title']}」：约 ¥{closest['cost']}，"
            f"{closest['minutes']} 分钟。"
        )
        if closest["cost"] > budget:
            lines.append(f"它超出预算约 ¥{closest['cost'] - budget:g}。")
        if closest["minutes"] > max_minutes:
            over = closest["minutes"] - max_minutes
            lines.append(f"它超出时间约 {over} 分钟。")
        lines.append("")
        lines.append("可以放宽预算/时间，或者把方案的前半段单独拿出来做。")
        return "\n".join(lines)

    for index, plan in enumerate(plans, start=1):
        lines.append(f"方案 {index}｜{plan['title']}")
        lines.append(
            f"  预算：约 ¥{plan['cost']}（你的预算 ¥{budget:g}，"
            f"{'还剩约 ¥' + format(budget - plan['cost'], '.0f') if plan['cost'] <= budget else '略超'}）"
        )
        cost_text = f"{plan['minutes'] // 60} 小时" if plan["minutes"] >= 60 else ""
        rest = plan["minutes"] % 60
        if rest:
            cost_text += f" {rest} 分钟"
        lines.append(f"  时长：约 {cost_text.strip()}")
        lines.append(f"  适合：{plan['place']} · {' · '.join(plan['tags'][:2])}")
        lines.append(f"  为什么是它：{_plan_reason(plan, budget, max_minutes)}")
        lines.append(f"  一句话：{plan['summary']}")
        lines.append("  时间线：")
        for offset, action in plan["flow"]:
            lines.append(f"    {_clock_text(start_clock, offset)}  {action}")
        lines.append("  出发前准备：")
        for prep in plan["prep"]:
            lines.append(f"    · {prep}")
        lines.append(f"  不花钱的惊喜：{plan['surprise']}")
        lines.append("")

    lines.append("怎么选：")
    lines.append("  · 想省力，选排在最前面的那个；")
    lines.append("  · 想有点仪式感，选预算用得最多的那个；")
    lines.append("  · 拿不准就先问一句：「你今天想出门，还是想在家？」")
    return "\n".join(lines).rstrip()


# ---------------------------------------------------------------------------
# 11. 保存生成结果
# ---------------------------------------------------------------------------

def save_output(text: str, prefix: str) -> Path:
    """把生成内容保存到 out 文件夹，方便复制或做定时任务。"""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    path = OUT_DIR / f"{prefix}-{stamp}.txt"
    path.write_text(text + "\n", encoding="utf-8")
    return path


# ---------------------------------------------------------------------------
# 12. 菜单：管理记忆
# ---------------------------------------------------------------------------

def ask_text(prompt: str, default: str = "", required: bool = False) -> str:
    """读取一段文字；required=True 时不允许空输入。"""
    while True:
        raw = read_input(f"{prompt}" + (f"（回车保持：{default}）" if default else "") + "：").strip()
        if raw:
            return raw
        if default:
            return default
        if not required:
            return ""
        print("  这一项不能为空，请再输入一次。")


def ask_number(prompt: str, default: float, minimum: float = 0, maximum: float | None = None) -> float:
    """读取一个数字，允许输入「200 元」「4 小时」这种带单位的写法。"""
    while True:
        raw = read_input(f"{prompt}（直接回车 = {default:g}）：").strip()
        if not raw:
            return default
        match = re.search(r"\d+(?:\.\d+)?", raw)
        if not match:
            print("  没有找到数字，请重新输入。")
            continue
        value = float(match.group(0))
        if value < minimum:
            print(f"  不能小于 {minimum:g}，请重新输入。")
            continue
        if maximum is not None and value > maximum:
            print(f"  不能大于 {maximum:g}，请重新输入。")
            continue
        return value


def ask_yes_no(prompt: str, default: bool = False) -> bool:
    """读取 y/n。直接回车使用默认值。"""
    hint = "Y/n" if default else "y/N"
    while True:
        raw = read_input(f"{prompt}（{hint}）：").strip().lower()
        if not raw:
            return default
        if raw in ("y", "yes", "是", "好", "确认", "确定"):
            return True
        if raw in ("n", "no", "否", "不", "取消"):
            return False
        print("  请输入 y 或 n。")


def show_summary(data: dict) -> None:
    """用一张简单的清单展示数据规模，方便确认自己改对了没有。"""
    print(hr())
    print("当前数据")
    print(hr())
    couple = data.get("couple", {})
    print(f"称呼：{couple.get('me')} & {couple.get('partner')}")
    print(f"起点：{couple.get('start')}")
    print(f"纪念日：{len(data.get('anniversaries', []))} 条")
    print(f"重要事项：{len(data.get('important', []))} 条")
    print(f"回忆：{len(data.get('memories', []))} 条")
    total_preferences = sum(
        len(items)
        for categories in data.get("preferences", {}).values()
        if isinstance(categories, dict)
        for items in categories.values()
    )
    print(f"喜好条目：{total_preferences} 条")
    print(f"数据文件：{MEMORY_FILE}")
    print(f"最近备份：{BACKUP_DIR}")
    print()
    print("提示：直接编辑 data/memory.json 也可以，保存前程序会自动备份。")


def add_anniversary(data: dict) -> None:
    """添加一个每年重复的纪念日。"""
    print("\n添加纪念日（每年重复）")
    title = ask_text("名称（例如：第一次见面）", required=True)
    while True:
        raw = ask_text("日期（月-日，例如 05-20）", required=True)
        month_day = parse_month_day(raw)
        if month_day:
            break
        print("  日期格式不对，请写成 05-20 或 5月20日。")
    since_raw = ask_text("从哪一年开始（可空，例如 2023-05-20）")
    since = parse_date_flexible(since_raw) if since_raw else None
    note = ask_text("备注（可空）")
    item = {
        "title": title,
        "date": f"{month_day[0]:02d}-{month_day[1]:02d}",
        "note": note,
    }
    if since:
        item["count_from"] = since.isoformat()
    data.setdefault("anniversaries", []).append(item)
    save_memory(data)
    print(f"已添加「{title}」，保存到 {MEMORY_FILE}。")


def add_important(data: dict) -> None:
    """添加一个只发生一次的重要事项。"""
    print("\n添加重要事项（只提醒一次）")
    title = ask_text("名称（例如：体检复查）", required=True)
    while True:
        raw = ask_text("日期（年-月-日，可省略年份，例如 2026-11-03）", required=True)
        target = parse_date_flexible(raw)
        if target:
            break
        print("  日期格式不对，请写成 2026-11-03。")
    if target < today_date():
        print(f"  注意：{format_date_cn(target)} 已经过去了，它只会在数据里保留，不会再提醒。")
        if not ask_yes_no("仍然保存吗？", default=False):
            print("已取消。")
            return
    note = ask_text("备注（可空，例如：上午空腹）")
    data.setdefault("important", []).append(
        {"title": title, "date": target.isoformat(), "note": note}
    )
    save_memory(data)
    print(f"已添加「{title}」，保存到 {MEMORY_FILE}。")


def add_preference(data: dict) -> None:
    """给某个人添加一条喜好/雷区/送礼参考。"""
    print("\n添加喜好或雷区")
    partner = str(data.get("couple", {}).get("partner", "小满"))
    me = str(data.get("couple", {}).get("me", "阿星"))
    print(f"  1. {partner}")
    print(f"  2. {me}")
    print("  3. 手动输入称呼")
    choice = read_input("选择是谁（回车 = 1）：").strip() or "1"
    if choice == "2":
        person = me
    elif choice == "3":
        person = ask_text("称呼", required=True)
    else:
        person = partner

    print("  1. 喜欢  2. 不喜欢  3. 送礼参考  4. 在意的事")
    category_choice = read_input("选择类别（回车 = 1）：").strip() or "1"
    category = {"1": "喜欢", "2": "不喜欢", "3": "送礼", "4": "在意"}.get(
        category_choice, "喜欢"
    )

    item = ask_text("具体内容（例如：热咖啡，不加糖）", required=True)
    preferences = data.setdefault("preferences", {})
    person_data = preferences.setdefault(person, {})
    items = person_data.setdefault(category, [])
    if item in items:
        print("这条已经记过了，没有重复添加。")
        return
    items.append(item)
    save_memory(data)
    print(f"已添加到「{person} · {category}」。")


def add_memory(data: dict) -> None:
    """添加一条可以在问答里搜到的回忆。"""
    print("\n添加一条回忆")
    raw_date = ask_text(
        "日期（年-月-日，直接回车 = 今天）",
        default=today_date().isoformat(),
    )
    memory_date = parse_date_flexible(raw_date)
    if not memory_date:
        print("日期格式不对，已取消。")
        return
    title = ask_text("一句话标题（例如：第一次看海）", required=True)
    detail = ask_text("细节（一行就够，可空）")
    tags_raw = ask_text("标签（用逗号分隔，可空，例如：旅行,海边）")
    tags = [tag.strip() for tag in re.split(r"[,，、\s]+", tags_raw) if tag.strip()]
    data.setdefault("memories", []).append(
        {
            "date": memory_date.isoformat(),
            "title": title,
            "detail": detail,
            "tags": tags,
        }
    )
    save_memory(data)
    print(f"已添加「{title}」。以后可以直接问：「{title}」。")


def edit_couple(data: dict) -> None:
    """修改称呼、开始日期和生日。直接回车表示保持原值。"""
    print("\n修改基本资料（直接回车 = 保持原值）")
    couple = data.setdefault("couple", {})
    me = ask_text("你的称呼", default=str(couple.get("me", "")))
    partner = ask_text("对方的称呼", default=str(couple.get("partner", "")))

    while True:
        raw_start = ask_text(
            "在一起的起点（例如 2023-05-20 20:13）",
            default=str(couple.get("start", "")),
        )
        start = parse_start_datetime(raw_start)
        if start:
            break
        print("  时间格式不对，请写成 2023-05-20 20:13。")

    while True:
        raw_birthday = ask_text(
            "对方生日（月-日，例如 10-16）",
            default=str(couple.get("partner_birthday", "")),
        )
        if not raw_birthday:
            partner_birthday = ""
            break
        month_day = parse_month_day(raw_birthday)
        if month_day:
            partner_birthday = f"{month_day[0]:02d}-{month_day[1]:02d}"
            break
        print("  生日格式不对，请写成 10-16。")

    raw_my_birthday = ask_text(
        "你的生日（月-日，可空）",
        default=str(couple.get("my_birthday", "")),
    )
    month_day = parse_month_day(raw_my_birthday) if raw_my_birthday else None
    my_birthday = f"{month_day[0]:02d}-{month_day[1]:02d}" if month_day else ""

    couple.update(
        {
            "me": me,
            "partner": partner,
            "start": start.isoformat(timespec="seconds"),
            "partner_birthday": partner_birthday,
            "my_birthday": my_birthday,
        }
    )
    save_memory(data)
    print("基本资料已保存。")


def delete_item(data: dict) -> None:
    """删除纪念日、重要事项、回忆或某一条喜好。删除前必须确认。"""
    print("\n删除条目")
    print("  1. 纪念日")
    print("  2. 重要事项")
    print("  3. 回忆")
    print("  4. 某一条喜好/雷区")
    print("  0. 返回")
    kind = read_input("选择类型：").strip()
    if kind in ("", "0"):
        return

    if kind in ("1", "2", "3"):
        key = {"1": "anniversaries", "2": "important", "3": "memories"}[kind]
        items = data.get(key, [])
        if not items:
            print("这一类现在没有内容。")
            return
        print()
        for index, item in enumerate(items, start=1):
            if not isinstance(item, dict):
                continue
            title = item.get("title", "未命名")
            when = item.get("date", "")
            print(f"  {index}. {title}（{when}）")
        raw_index = read_input("要删除第几条？（0 = 取消）：").strip()
        if not raw_index.isdigit():
            print("已取消。")
            return
        index = int(raw_index)
        if index == 0 or not (1 <= index <= len(items)):
            print("已取消。")
            return
        target = items[index - 1]
        print(f"\n将要删除：{target.get('title', '未命名')}（{target.get('date', '')}）")
        if not ask_yes_no("确定删除吗？此操作不可撤销，但会自动备份", default=False):
            print("已取消。")
            return
        del items[index - 1]
        save_memory(data)
        print("已删除。需要的话可以从 data/backups 恢复。")
        return

    if kind == "4":
        preferences = data.get("preferences", {})
        people = list(preferences.keys())
        if not people:
            print("还没有喜好数据。")
            return
        for index, person in enumerate(people, start=1):
            print(f"  {index}. {person}")
        raw_person = read_input("选择是谁：").strip()
        if not raw_person.isdigit() or not (1 <= int(raw_person) <= len(people)):
            print("已取消。")
            return
        person = people[int(raw_person) - 1]
        categories = preferences.get(person, {})
        category_names = list(categories.keys())
        if not category_names:
            print("这个人还没有喜好数据。")
            return
        for index, category in enumerate(category_names, start=1):
            print(f"  {index}. {category}")
        raw_category = read_input("选择类别：").strip()
        if not raw_category.isdigit() or not (1 <= int(raw_category) <= len(category_names)):
            print("已取消。")
            return
        category = category_names[int(raw_category) - 1]
        items = categories.get(category, [])
        if not items:
            print("这一类别是空的。")
            return
        for index, item in enumerate(items, start=1):
            print(f"  {index}. {item}")
        raw_index = read_input("要删除第几条？（0 = 取消）：").strip()
        if not raw_index.isdigit():
            print("已取消。")
            return
        index = int(raw_index)
        if index == 0 or not (1 <= index <= len(items)):
            print("已取消。")
            return
        print(f"\n将要删除：{person} · {category} · {items[index - 1]}")
        if not ask_yes_no("确定删除吗？", default=False):
            print("已取消。")
            return
        del items[index - 1]
        save_memory(data)
        print("已删除。")
        return

    print("没有这个选项。")


def manage_memory(data: dict) -> None:
    """管理记忆的子菜单。所有修改都会立即写入 memory.json。"""
    while True:
        print()
        print(hr())
        print("管理记忆")
        print(hr())
        print("  1. 添加纪念日")
        print("  2. 添加重要事项")
        print("  3. 添加喜好 / 雷区")
        print("  4. 添加一条回忆")
        print("  5. 修改基本资料（称呼、开始日期、生日）")
        print("  6. 删除条目")
        print("  7. 查看数据摘要")
        print("  0. 返回主菜单")
        choice = read_input("请选择：").strip()

        if choice in ("", "0"):
            return
        if choice == "1":
            add_anniversary(data)
        elif choice == "2":
            add_important(data)
        elif choice == "3":
            add_preference(data)
        elif choice == "4":
            add_memory(data)
        elif choice == "5":
            edit_couple(data)
        elif choice == "6":
            delete_item(data)
        elif choice == "7":
            show_summary(data)
        else:
            print("没有这个选项，请重新输入。")

        # 子菜单每次操作后停一下；在管道/脚本环境里自动跳过。
        if sys.stdin.isatty():
            pause()


# ---------------------------------------------------------------------------
# 13. 菜单：备份与导出
# ---------------------------------------------------------------------------

def data_tools(data: dict) -> dict:
    """
    备份与导出子菜单。
    返回值可能是恢复后的新数据，主循环要用它替换原来的 data。
    """
    while True:
        print()
        print(hr())
        print("备份与导出")
        print(hr())
        print("  1. 立即备份")
        print("  2. 导出一份 JSON 到 data/exports")
        print("  3. 查看备份")
        print("  4. 从备份恢复")
        print("  0. 返回主菜单")
        choice = read_input("请选择：").strip()

        if choice in ("", "0"):
            return data
        if choice == "1":
            path = make_backup("manual")
            print(f"已备份到：{path}" if path else "还没有可备份的数据文件。")
        elif choice == "2":
            if not MEMORY_FILE.exists():
                print("还没有可导出的数据文件。")
            else:
                EXPORT_DIR.mkdir(parents=True, exist_ok=True)
                stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
                target = EXPORT_DIR / f"恋爱小助手-导出-{stamp}.json"
                shutil.copy2(MEMORY_FILE, target)
                print(f"已导出到：{target}")
                print("这个文件是明文，发给别人前请先确认内容。")
        elif choice == "3":
            backups = list_backups()
            if not backups:
                print("还没有备份。每次保存数据时都会自动备份一份。")
            else:
                print(f"共有 {len(backups)} 个备份（最新的在前）：")
                for index, path in enumerate(backups[:10], start=1):
                    size_kb = path.stat().st_size / 1024
                    print(f"  {index}. {path.name}（{size_kb:.1f} KB）")
                if len(backups) > 10:
                    print(f"  …另外还有 {len(backups) - 10} 个，见 {BACKUP_DIR}")
        elif choice == "4":
            backups = list_backups()
            if not backups:
                print("还没有备份可以恢复。")
            else:
                print("最新的 10 个备份：")
                for index, path in enumerate(backups[:10], start=1):
                    print(f"  {index}. {path.name}")
                raw_index = read_input("要恢复第几个？（0 = 取消）：").strip()
                if not raw_index.isdigit():
                    print("已取消。")
                    continue
                index = int(raw_index)
                if index == 0 or not (1 <= index <= min(10, len(backups))):
                    print("已取消。")
                    continue
                target = backups[index - 1]
                if not ask_yes_no(f"用 {target.name} 覆盖当前数据吗？", default=False):
                    print("已取消。")
                    continue
                try:
                    data = restore_backup(target)
                    print("恢复完成。当前数据已替换，旧数据也自动备份了一份。")
                except (OSError, json.JSONDecodeError, ValueError) as exc:
                    print(f"恢复失败：{exc}")
        else:
            print("没有这个选项，请重新输入。")

        if sys.stdin.isatty():
            pause()


# ---------------------------------------------------------------------------
# 14. 主菜单与交互
# ---------------------------------------------------------------------------

def print_banner(data: dict) -> None:
    """进入程序时的欢迎信息，顺手把最重要的提醒放在这里。"""
    base = today_date()
    couple = data.get("couple", {})
    partner = str(couple.get("partner", "对方"))
    print()
    print(hr("=", 54))
    print(f"  {APP_NAME}")
    print("  只存在你电脑里的纪念日与心事")
    print(hr("=", 54))
    print(f"  今天：{format_date_cn(base)}")

    day_number = days_together(data, base)
    if day_number:
        print(f"  {couple.get('me', '我')} & {partner}：在一起第 {day_number} 天")
    else:
        print("  在一起的起点还没有设置好（菜单 6 → 5）。")

    events = build_events(data, base)
    upcoming = [event for event in events if event["days_left"] >= 0]
    if upcoming:
        nearest = upcoming[0]
        print(f"  最近的日子：{format_event(nearest, with_year=True)}")
        if nearest["days_left"] <= 7:
            print(f"  {partner} 的这件事快到了，记得提前准备。")
    else:
        print("  最近没有记录在案的日子。")
    print(hr("=", 54))


def print_main_menu() -> None:
    """主菜单。"""
    print()
    print("  1. 今日概览")
    print("  2. 问问小助手（记忆问答）")
    print("  3. 生成情话（早安 / 晚安 / 道歉 / 安慰）")
    print("  4. 安排一次约会（预算 + 时间）")
    print("  5. 查看最近的重要日子")
    print("  6. 管理记忆（添加 / 删除 / 改资料）")
    print("  7. 备份与导出")
    print("  8. 使用帮助")
    print("  0. 退出")
    print()


def qa_loop(data: dict) -> None:
    """问答循环：一直问到用户输入空行或 0。"""
    print("\n进入问答。直接回车返回主菜单。")
    print("可以问：「我们在一起多久」「小满喜欢什么」「第一次看海」「最近有什么重要的事」。")
    while True:
        print()
        question = read_input("你：").strip()
        if not question or question in ("0", "q", "quit", "exit", "返回", "退出"):
            return
        print()
        print(answer_question(data, question))


def scene_menu(data: dict) -> None:
    """生成情话的交互流程，支持换一批和保存。"""
    print("\n选择场景：")
    print("  1. 早安")
    print("  2. 晚安")
    print("  3. 道歉")
    print("  4. 安慰")
    print("  0. 返回")
    choice = read_input("请选择（回车 = 1）：").strip() or "1"
    mapping = {"1": "morning", "2": "night", "3": "apology", "4": "comfort"}
    if choice in ("", "0"):
        return
    scene = mapping.get(choice)
    if not scene:
        print("没有这个选项。")
        return

    note = ask_text("今天的小事（可空，会织进句子里，例如：她加班到十点）")
    while True:
        text = render_scene(data, scene, note=note, count=3)
        print()
        print(text)
        print()
        action = read_input("回车返回 / r 换一批 / s 保存：").strip().lower()
        if action == "s":
            path = save_output(text, f"{SCENE_LABELS[scene]}情话")
            print(f"已保存到：{path}")
        elif action == "r":
            continue
        else:
            return


def plan_menu(data: dict) -> None:
    """约会安排的交互流程。"""
    print("\n安排一次约会")
    budget = ask_number("两个人一共的预算（元）", default=200, minimum=0, maximum=100000)
    hours = ask_number("大概有多少时间（小时）", default=4, minimum=0.25, maximum=24)
    print("  1. 室内  2. 室外  3. 都行")
    place_choice = read_input("选一个（回车 = 3）：").strip() or "3"
    place = {"1": "室内", "2": "室外", "3": "都行"}.get(place_choice, "都行")

    start_clock = None
    while True:
        raw_start = read_input("大概几点开始？（例如 14:00，回车跳过）：").strip()
        if not raw_start:
            break
        start_clock = parse_clock(raw_start)
        if start_clock:
            break
        print("  时间格式不对，请写成 14:00 或 下午2点。")

    while True:
        text = render_plan(budget, hours, place, start_clock)
        print()
        print(text)
        print()
        action = read_input("回车返回 / r 换一批 / s 保存：").strip().lower()
        if action == "s":
            path = save_output(text, "约会方案")
            print(f"已保存到：{path}")
        elif action == "r":
            continue
        else:
            return


def upcoming_menu(data: dict) -> None:
    """查看未来 N 天的重要日子。"""
    days = int(ask_number("想看未来多少天", default=60, minimum=1, maximum=3650))
    print()
    print(render_upcoming(data, days))


def help_menu(data: dict) -> None:
    """帮助信息，尽量把路径写全，方便零基础用户找到文件。"""
    print()
    print(hr())
    print("使用帮助")
    print(hr())
    print("【数据在哪】")
    print(f"  {MEMORY_FILE}")
    print("  用记事本或 VS Code 打开就能改。改之前程序会自动备份。")
    print()
    print("【怎么问】")
    print("  我们在一起多久 / 小满喜欢什么 / 小满生日 / 第一次看海 / 最近有什么重要的事")
    print()
    print("【不想进菜单】")
    print("  python love_assistant.py --today")
    print("  python love_assistant.py --ask \"小满喜欢什么\"")
    print("  python love_assistant.py --scene morning")
    print("  python love_assistant.py --plan --budget 200 --hours 4 --indoor --start 14:00")
    print("  python love_assistant.py --upcoming 60")
    print()
    print("【安全】")
    print("  所有数据只在本机。不要把这个文件夹发给陌生人。")
    print("  公共电脑上使用后，记得删除 data 文件夹或整个项目。")
    print()
    print("更完整的教程：docs/09-Python小助手运行教程.md（在项目根目录）")
    print("本文件夹的快速说明：使用说明.md")


def interactive(data: dict, show_banner: bool = True) -> None:
    """主循环。所有菜单最终都会回到这里。"""
    if show_banner:
        print_banner(data)
    while True:
        print_main_menu()
        choice = read_input("请选择（0-8）：").strip()

        if choice in ("0", "q", "quit", "exit", "退出"):
            print("\n下次见。")
            return
        if choice == "1":
            print()
            print(render_today(data))
        elif choice == "2":
            qa_loop(data)
        elif choice == "3":
            scene_menu(data)
        elif choice == "4":
            plan_menu(data)
        elif choice == "5":
            upcoming_menu(data)
        elif choice == "6":
            manage_memory(data)
        elif choice == "7":
            data = data_tools(data)
        elif choice == "8":
            help_menu(data)
        else:
            print("没有这个选项，请输入 0 到 8。")

        pause()


# ---------------------------------------------------------------------------
# 15. 命令行入口
# ---------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    """定义命令行参数。不传参数时进入交互菜单。"""
    parser = argparse.ArgumentParser(
        prog="love_assistant.py",
        description="本地恋爱小助手：纪念日、喜好、回忆、情话和约会安排。",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "例子：\n"
            "  python love_assistant.py --today\n"
            "  python love_assistant.py --ask \"小满喜欢什么\"\n"
            "  python love_assistant.py --scene night --note \"她今天加班\"\n"
            "  python love_assistant.py --plan --budget 200 --hours 4 --indoor --start 14:00\n"
        ),
    )
    parser.add_argument("--today", action="store_true", help="显示今日概览")
    parser.add_argument("--ask", metavar="问题", help="直接问一个问题")
    parser.add_argument("--scene", choices=sorted(SCENE_LABELS), help="生成哪个场景的情话")
    parser.add_argument("--note", default="", help="今天的小事，会织进情话里")
    parser.add_argument("--count", type=int, default=3, help="生成几条情话（默认 3）")
    parser.add_argument("--plan", action="store_true", help="安排约会")
    parser.add_argument("--budget", type=float, default=200, help="约会总预算，默认 200 元")
    parser.add_argument("--hours", type=float, default=4, help="可用时间（小时），默认 4")
    place_group = parser.add_mutually_exclusive_group()
    place_group.add_argument("--indoor", action="store_true", help="只看室内方案")
    place_group.add_argument("--outdoor", action="store_true", help="只看室外方案")
    parser.add_argument("--start", default="", help="约会开始时间，例如 14:00")
    parser.add_argument(
        "--upcoming",
        type=int,
        nargs="?",
        const=60,
        metavar="天数",
        help="查看未来多少天的重要日子，默认 60",
    )
    parser.add_argument("--seed", type=int, help="随机种子，用于复现同一批情话/方案")
    parser.add_argument("--save", action="store_true", help="把本次输出保存到 out 文件夹")
    parser.add_argument("--backup", action="store_true", help="立即备份数据")
    parser.add_argument("--export", action="store_true", help="导出数据到 data/exports")
    parser.add_argument("--where", action="store_true", help="显示数据文件所在位置")
    parser.add_argument("--no-banner", action="store_true", help="进入菜单时不显示欢迎信息")
    return parser


def main(argv: list[str] | None = None) -> int:
    """程序总入口。返回 0 表示正常退出，1 表示遇到文件错误。"""
    setup_console()
    parser = build_parser()
    args = parser.parse_args(argv)

    try:
        if args.where:
            print(f"数据文件：{MEMORY_FILE}")
            print(f"备份目录：{BACKUP_DIR}")
            print(f"导出目录：{EXPORT_DIR}")
            print(f"输出目录：{OUT_DIR}")
            return 0

        data = load_memory()

        if args.backup:
            path = make_backup("cli")
            print(f"已备份到：{path}" if path else "还没有可备份的数据文件。")
            return 0

        if args.export:
            if not MEMORY_FILE.exists():
                print("还没有可导出的数据文件。")
                return 0
            EXPORT_DIR.mkdir(parents=True, exist_ok=True)
            stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            target = EXPORT_DIR / f"恋爱小助手-导出-{stamp}.json"
            shutil.copy2(MEMORY_FILE, target)
            print(f"已导出到：{target}")
            return 0

        if args.today:
            text = render_today(data)
        elif args.ask is not None:
            text = answer_question(data, args.ask)
        elif args.scene:
            text = render_scene(data, args.scene, note=args.note, count=args.count, seed=args.seed)
        elif args.plan:
            if args.indoor:
                place = "室内"
            elif args.outdoor:
                place = "室外"
            else:
                place = "都行"
            start_clock = parse_clock(args.start)
            if args.start and not start_clock:
                print(f"[提示] 开始时间「{args.start}」没看懂，已改为按分钟显示时间线。")
            text = render_plan(
                args.budget,
                args.hours,
                place,
                start_clock=start_clock,
                seed=args.seed,
            )
        elif args.upcoming is not None:
            text = render_upcoming(data, args.upcoming)
        else:
            interactive(data, show_banner=not args.no_banner)
            return 0

        print(text)
        if args.save:
            prefix = {
                "today": "今日概览",
                "ask": "问答",
                "scene": f"{SCENE_LABELS.get(args.scene, '情话')}情话",
                "plan": "约会方案",
                "upcoming": "重要日子",
            }.get(
                "today" if args.today else
                "ask" if args.ask is not None else
                "scene" if args.scene else
                "plan" if args.plan else
                "upcoming",
                "输出",
            )
            path = save_output(text, prefix)
            print(f"\n已保存到：{path}")
        return 0

    except UserExit:
        print("\n下次见。")
        return 0
    except OSError as exc:
        print(f"\n[文件错误] {exc}")
        print("请检查 data 文件夹是否被占用、是否只读，然后重试。")
        return 1
    except BrokenPipeError:
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
