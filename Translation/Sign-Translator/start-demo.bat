@echo off
rem Double-click to start the CogniSign demo in your default browser (use Chrome).
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies, first run only...
  call npm install
)
echo Starting CogniSign at http://localhost:9966 - close this window to stop.
call npm run demo
