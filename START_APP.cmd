@echo off
chcp 65001 >nul
cd /d "%~dp0"
set PORT=8765
set PY=
if exist "C:\ProgramData\MirsadBackup\Python\python.exe" set PY=C:\ProgramData\MirsadBackup\Python\python.exe
if not defined PY where python >nul 2>nul && set PY=python
if not defined PY where py >nul 2>nul && set PY=py
if not defined PY (
  echo Python wurde nicht gefunden.
  echo Du kannst index.html trotzdem direkt in Edge/Chrome oeffnen.
  pause
  exit /b 1
)
start "" "http://127.0.0.1:%PORT%/"
"%PY%" -m http.server %PORT%
