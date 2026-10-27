@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
set PYTHONUTF8=1
title Love Assistant

python --version >nul 2>nul
if not errorlevel 1 goto run_python

py -3 --version >nul 2>nul
if not errorlevel 1 goto run_py

goto no_python

:run_python
cls
python love_assistant.py
goto finished

:run_py
cls
py -3 love_assistant.py
goto finished

:no_python
cls
echo.
echo  [ERROR] Python was not found on this computer.
echo.
echo  Please install Python 3.9 or newer from:
echo    https://www.python.org/downloads/
echo.
echo  Important: tick "Add python.exe to PATH" during installation.
echo  After installing, close this window and double-click this file again.
echo.
pause
exit /b 1

:finished
if errorlevel 1 (
    echo.
    echo  [ERROR] The assistant stopped with an error.
    echo  Please read the message above, or open 使用说明.md.
    echo.
    pause
)
exit /b 0
