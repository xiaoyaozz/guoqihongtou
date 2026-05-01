@echo off
echo ==========================================
echo State-Owned Enterprise Meeting Minutes Generator
echo Cloudflare Deployment
echo ==========================================
echo.

echo Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found, please install Node.js 20+
    pause
    exit /b 1
)
node --version

echo.
echo Checking wrangler CLI...
where wrangler >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo wrangler not found, installing...
    npm install -g wrangler
)
wrangler --version

echo.
echo Please follow these steps to deploy:
echo.
echo Step 1: Login to Cloudflare
echo   wrangler login
echo.
echo Step 2: Create D1 database
echo   wrangler d1 create guoqi-meeting-db
echo.
echo Step 3: Get database ID and update config files
echo   wrangler d1 list
echo   Edit wrangler.toml and cloudflare.toml
echo.
echo Step 4: Run database migration
echo   wrangler d1 execute guoqi-meeting-db --file=./migrations/0001_init.sql --remote
echo.
echo Step 5: Build the project
echo   npm run build
echo.
echo Step 6: Deploy to Cloudflare Pages
echo   Option A: Use Git auto-deploy (Recommended)
echo   Option B: npm run pages:deploy
echo.
echo ==========================================
echo.
pause
