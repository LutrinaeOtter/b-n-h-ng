@echo off
cd /d "%~dp0"
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  start "" "http://127.0.0.1:4173"
  node server.js
) else (
  where python >nul 2>nul
  if %ERRORLEVEL% EQU 0 (
    start "" "http://127.0.0.1:4173"
    python -m http.server 4173 --bind 127.0.0.1
  ) else (
    echo Cai Node.js hoac Python 3 de chay website voi luu tru IndexedDB.
    start "" "index.html"
    pause
  )
)
