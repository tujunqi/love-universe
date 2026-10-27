#!/usr/bin/env python3
"""
手机预览小工具（只用 Python 标准库）。

作用：
  在电脑上开一个临时网页服务，让同一 Wi-Fi 下的手机能打开这个项目。

用法：
  双击根目录的「手机预览-Windows.bat」
  或在本文件夹运行：python tools/phone_preview.py
  指定端口：python tools/phone_preview.py --port 8080

停止：
  在窗口里按 Ctrl+C，或直接关闭窗口。
"""

from __future__ import annotations

import argparse
import http.server
import socket
import sys
from functools import partial
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_PORT = 8765
PORT_TRIES = 20


def setup_console() -> None:
    """让中文在 Windows 的 cmd / PowerShell 里正常显示。"""
    if sys.platform == "win32":
        try:
            import ctypes

            ctypes.windll.kernel32.SetConsoleOutputCP(65001)
            ctypes.windll.kernel32.SetConsoleCP(65001)
        except Exception:
            pass

    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass


def find_lan_ip() -> str:
    """找到这台电脑在局域网里的地址，例如 192.168.1.23。"""
    # UDP connect 不会真的发数据，只是让系统选出“默认出口”的网卡。
    for target in (("8.8.8.8", 80), ("1.1.1.1", 80)):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
                sock.connect(target)
                ip = sock.getsockname()[0]
                if ip and not ip.startswith("127."):
                    return ip
        except OSError:
            pass

    # 上面的方法失败时，再按主机名找一次。
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            ip = info[4][0]
            if ip and not ip.startswith("127."):
                return ip
    except OSError:
        pass

    return "127.0.0.1"


class PreviewHandler(http.server.SimpleHTTPRequestHandler):
    """普通静态文件服务，只多两件事：不缓存、少打日志。"""

    def end_headers(self) -> None:
        # 改完内容刷新就能看到，不会被浏览器旧缓存挡住。
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()

    def log_message(self, fmt: str, *args) -> None:
        # 只显示访问了哪个文件，不刷一屏时间戳。
        try:
            message = fmt % args
        except Exception:
            message = fmt
        print(f"  · {message}")


def make_server(start_port: int):
    """端口被占用时，自动往后找一个空闲端口。"""
    handler = partial(PreviewHandler, directory=str(ROOT))
    last_error: OSError | None = None
    for port in range(start_port, start_port + PORT_TRIES):
        try:
            server = http.server.ThreadingHTTPServer(("0.0.0.0", port), handler)
            return server, port
        except OSError as exc:
            last_error = exc
            continue
    raise SystemExit(
        f"端口 {start_port} 到 {start_port + PORT_TRIES - 1} 都被占用了。\n"
        f"最后一次错误：{last_error}\n"
        "可以换一个端口，例如：python tools/phone_preview.py --port 9000"
    )


def main() -> int:
    setup_console()
    parser = argparse.ArgumentParser(description="在同一 Wi-Fi 下用手机预览这个项目")
    parser.add_argument(
        "--port",
        type=int,
        default=DEFAULT_PORT,
        help=f"起始端口，默认 {DEFAULT_PORT}；被占用会自动往后找",
    )
    args = parser.parse_args()

    if not (ROOT / "index.html").exists():
        print("找不到 index.html。请确认 tools/phone_preview.py 还在项目里。")
        return 1

    server, port = make_server(args.port)
    lan_ip = find_lan_ip()

    print()
    print("=" * 56)
    print("  手机预览已启动")
    print("=" * 56)
    print()
    print(f"  电脑本机打开：  http://127.0.0.1:{port}/")
    print(f"  手机浏览器打开：http://{lan_ip}:{port}/")
    print()
    print("  手机和电脑要连同一个 Wi-Fi。")
    print("  在手机浏览器地址栏里，手动输入下面这一行：")
    print()
    print(f"      {lan_ip}:{port}")
    print()
    print("  第一次启动时，Windows 可能会弹出防火墙提示。")
    print("  请选择「允许访问」，否则手机打不开。")
    print()
    print("  这个地址只在同一个 Wi-Fi 下有效，出门或关电脑就打不开。")
    print("  想让对方在外地也能看，请用「公网部署」，见 docs/02。")
    print()
    print("  停止：按 Ctrl+C，或直接关闭这个窗口。")
    print("=" * 56)
    print()

    if lan_ip == "127.0.0.1":
        print("⚠ 没有找到局域网地址。请确认电脑已连 Wi-Fi 或网线。")
        print()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止。")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
