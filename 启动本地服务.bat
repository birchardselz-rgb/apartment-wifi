@echo off
chcp 65001 >nul
title 寓网数字空间 — 本地服务
echo ════════════════════════════════════
echo    寓网数字空间 — 本地服务启动中
echo ════════════════════════════════════
echo.
cd /d D:\apartment-wifi
node backend/server.js
pause
