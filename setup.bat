@echo off
REM WebSiteMonitoringMo! Setup Script for Windows
REM This script sets up the project for development

echo.
echo 🚀 WebSiteMonitoringMo! Setup
echo ================================

REM Check if Node.js is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%

REM Check if npm is installed
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm version: %NPM_VERSION%

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Generate Prisma client
echo.
echo 🗄️ Generating Prisma client...
call npm run db:generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo.
    echo 📝 Creating .env.local file...
    copy .env.local.example .env.local
    echo ⚠️  Please update .env.local with your database credentials
)

echo.
echo ✅ Setup complete!
echo.
echo 🎉 To start developing:
echo    1. Start PostgreSQL: docker-compose up -d
echo    2. Run migrations: npm run db:migrate
echo    3. Seed database: npm run db:seed
echo    4. Start dev server: npm run dev
echo    5. Open http://localhost:3000 in your browser
echo.
echo 📚 Default admin credentials:
echo    Email: admin@websitemonitoring.com
echo    Password: admin123
echo.
pause
