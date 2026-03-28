@echo off
echo ========================================
echo Aerospace Mission Control Installation
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo Node.js detected: 
node -v
echo.

echo Installing dependencies...
call npm install

if %errorlevel% equ 0 (
    echo.
    echo Installation complete!
    echo.
    echo ========================================
    echo Next Steps:
    echo ========================================
    echo.
    echo 1. Test locally:
    echo    npm run dev
    echo    Open http://localhost:3000
    echo.
    echo 2. Deploy to Vercel:
    echo    npx vercel --prod
    echo.
    echo ========================================
) else (
    echo.
    echo ERROR: Installation failed
    echo Please check the error messages above
    pause
    exit /b 1
)

pause
