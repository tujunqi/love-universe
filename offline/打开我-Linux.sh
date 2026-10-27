#!/usr/bin/env bash
# 我们的私人博物馆 · Linux 一键打开
cd "$(dirname "$0")" || exit 1

PAGE="$(find . -maxdepth 1 -type f -name '*.html' -print -quit)"
if [ -z "$PAGE" ]; then
  echo "没有找到 HTML 文件。请确认博物馆文件都在这个文件夹里。"
  exit 1
fi

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$PAGE" >/dev/null 2>&1 &
elif command -v firefox >/dev/null 2>&1; then
  firefox "$PAGE" >/dev/null 2>&1 &
elif command -v chromium >/dev/null 2>&1; then
  chromium "$PAGE" >/dev/null 2>&1 &
elif command -v google-chrome >/dev/null 2>&1; then
  google-chrome "$PAGE" >/dev/null 2>&1 &
else
  echo "没有找到浏览器。请手动用浏览器打开：$PAGE"
  exit 1
fi
