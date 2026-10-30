@echo off
title Meeting Task Manager
echo ========================================================
echo   Starting Meeting Task Manager
echo   Frontend: Next.js + Tailwind CSS
echo   Backend & Auth: Supabase
echo   AI Engine: OpenRouter (openrouter/auto)
echo ========================================================
echo.
cd /d "C:\Users\dell\meeting-task-manager"
echo Opening browser at http://localhost:3000 ...
start http://localhost:3000
npm run dev
pause

