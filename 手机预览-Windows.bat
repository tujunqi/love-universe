@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title 手机预览 - 恋爱纪念宇宙

rem ============================================================
rem  这个工具不需要安装任何软件（用的是 Windows 自带的 PowerShell）
rem  双击后按窗口里的提示，用手机浏览器打开显示的网址即可
rem ============================================================

powershell -NoProfile -ExecutionPolicy Bypass -File "tools\phone_preview.ps1" %*

if errorlevel 1 (
    echo.
    echo  预览已停止。如果上面有报错，请把报错内容截图。
    echo.
    echo  小提示：
    echo  - 如果提示找不到 PowerShell，可以安装 Python 后改用：
    echo      python tools\phone_preview.py
    echo  - 想让对方在外地也能看，请做公网部署，见 docs\02-公网部署教程.md
    echo.
    pause
)
exit /b 0
