@echo off
title Vitae Local Website Server
echo ========================================================
echo   Vitae Local Development Server
echo ========================================================
echo.
echo Opening website in your default browser...
echo Server running at: http://127.0.0.1:8080/
echo.
echo [Keep this window open while testing. Press Ctrl+C to stop.]
echo.
start http://127.0.0.1:8080/
node server.js
if %ERRORLEVEL% NEQ 0 (
    echo Node server failed. Trying Python...
    python -m http.server 8080 --bind 127.0.0.1
)
if %ERRORLEVEL% NEQ 0 (
    echo Server failed. Opening index.html directly...
    start index.html
)
pause
