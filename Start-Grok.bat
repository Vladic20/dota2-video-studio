@echo off
title Dota 2 Video Studio — Grok
cd /d "%~dp0"

where grok >nul 2>nul
if %errorlevel% neq 0 (
  echo.
  echo Grok Build not found.
  echo Install it first:
  echo   curl -fsSL https://x.ai/cli/install.sh ^| bash
  echo or on PowerShell:
  echo   irm https://x.ai/cli/install.ps1 ^| iex
  echo.
  echo Then run this shortcut again.
  pause
  exit /b 1
)

echo Starting Grok...
echo On first launch it will open the browser so you can log in.
echo.
grok
