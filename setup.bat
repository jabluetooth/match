@echo off
REM Match Frontend Setup Script for Windows
REM This script automates the setup process for the Match dashboard

echo ========================================
echo Match Frontend Setup for Windows
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js detected
node --version
echo.

REM Check if we're in the right directory
if not exist package.json (
    echo [ERROR] package.json not found. Please run this script from the frontend directory.
    pause
    exit /b 1
)

REM Step 1: Install dependencies
echo ========================================
echo Installing dependencies...
echo ========================================
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Step 2: Setup .env file
if not exist .env (
    echo ========================================
    echo Setting up environment variables...
    echo ========================================
    copy .env.example .env
    echo [OK] .env file created from .env.example
    echo.
    echo [IMPORTANT] Please edit the .env file with your actual values:
    echo   - DATABASE_URL (PostgreSQL connection string)
    echo   - N8N_BASE_URL (Your n8n instance URL)
    echo.
    echo Opening .env in notepad...
    start notepad .env
    echo.
    pause
) else (
    echo [OK] .env file already exists
)
echo.

REM Step 3: Prisma setup
echo ========================================
echo Setting up Prisma...
echo ========================================
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to generate Prisma client
    pause
    exit /b 1
)
echo [OK] Prisma client generated
echo.

REM Step 4: Ask about database setup
echo ========================================
set /p pushdb="Do you want to push the schema to your database now? (Y/N): "
if /i "%pushdb%"=="Y" (
    echo Pushing schema to database...
    call npx prisma db push
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Database push failed. You may need to configure DATABASE_URL in .env
    ) else (
        echo [OK] Database schema created
    )
) else (
    echo [SKIPPED] Database setup. Run 'npm run db:push' manually later.
)
echo.

REM Step 5: All done!
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Verify your .env configuration
echo 2. Make sure your PostgreSQL database is running
echo 3. Import the n8n workflow JSON file into your n8n instance
echo 4. Run 'npm run dev' to start the development server
echo.
echo Useful commands:
echo   npm run dev        - Start development server
echo   npm run build      - Build for production
echo   npm run db:studio  - Open Prisma Studio (database GUI)
echo   npm run db:push    - Push schema changes to database
echo.
echo Happy coding! 🚀
echo.
pause
