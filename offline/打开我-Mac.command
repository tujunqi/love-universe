#!/bin/bash
# 我们的私人博物馆 · macOS 一键打开
cd "$(dirname "$0")" || exit 1

PAGE="$(ls -1 *.html 2>/dev/null | head -n 1)"
if [ -z "$PAGE" ]; then
  echo
  echo "没有找到 HTML 文件。请确认博物馆文件都在这个文件夹里。"
  echo
  read -r -p "按回车键关闭..."
  exit 1
fi

open "$PAGE"

if [ $? -ne 0 ]; then
  echo
  echo "自动打开失败。请右键「$PAGE」→ 打开方式 → Safari / Chrome。"
  read -r -p "按回车键关闭..."
fi
