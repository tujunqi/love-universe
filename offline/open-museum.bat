@echo off
setlocal
cd /d "%~dp0"
set "PAGE="
for %%F in ("*.html") do if not defined PAGE set "PAGE=%%~fF"
if not defined PAGE (
  echo.
  echo No HTML file found in this folder.
  echo Please keep all museum files together and try again.
  echo.
  pause
  exit /b 1
)
start "" "%PAGE%"
exit /b 0
