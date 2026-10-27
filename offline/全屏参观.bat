@echo off
setlocal
cd /d "%~dp0"

set "PAGE="
for %%F in ("*.html") do if not defined PAGE set "PAGE=%%~fF"
if not defined PAGE (
  echo.
  echo No HTML file found in this folder.
  echo.
  pause
  exit /b 1
)

set "BROWSER="
for %%B in (
  "%ProgramFiles%\Google\Chrome\Application\chrome.exe"
  "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
  "%LocalAppData%\Google\Chrome\Application\chrome.exe"
  "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
  "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
) do if not defined BROWSER if exist "%%~B" set "BROWSER=%%~B"

if not defined BROWSER (
  echo Chrome / Edge not found. Opening with the default browser instead.
  start "" "%PAGE%"
  exit /b 0
)

set "URL=file:///%PAGE:\=/%"
start "" "%BROWSER%" --kiosk --autoplay-policy=no-user-gesture-required "%URL%"
exit /b 0
