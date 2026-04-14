# Match Frontend Setup Script (Windows)
# This script automates the setup process for the Match dashboard

Write-Host "🚀 Match Frontend Setup" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found. Please run this script from the frontend directory." -ForegroundColor Red
    exit 1
}

# Step 1: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Setup .env file
if (-not (Test-Path ".env")) {
    Write-Host "⚙️  Setting up environment variables..." -ForegroundColor Cyan
    Copy-Item .env.example .env
    Write-Host "✅ .env file created from .env.example" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Edit .env file with your actual values:" -ForegroundColor Yellow
    Write-Host "   - DATABASE_URL (PostgreSQL connection string)" -ForegroundColor Yellow
    Write-Host "   - N8N_BASE_URL (Your n8n instance URL)" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Press Enter to continue after editing .env"
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}
Write-Host ""

# Step 3: Prisma setup
Write-Host "🗄️  Setting up Prisma..." -ForegroundColor Cyan
npx prisma generate
Write-Host "✅ Prisma client generated" -ForegroundColor Green
Write-Host ""

# Ask if user wants to push schema to database
$pushDb = Read-Host "Do you want to push the schema to your database now? (y/n)"
if ($pushDb -eq 'y' -or $pushDb -eq 'Y') {
    Write-Host "📊 Pushing schema to database..." -ForegroundColor Cyan
    npx prisma db push
    Write-Host "✅ Database schema created" -ForegroundColor Green
} else {
    Write-Host "⚠️  Skipping database setup. Run 'npm run db:push' manually later." -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Check if n8n is accessible
Write-Host "🔗 Checking n8n connection..." -ForegroundColor Cyan
$envContent = Get-Content .env -Raw
if ($envContent -match 'N8N_BASE_URL=["'']?([^"''`r`n]+)') {
    $n8nUrl = $matches[1]
    Write-Host "   Testing connection to: $n8nUrl" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $n8nUrl -Method Head -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ n8n instance is reachable" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not reach n8n instance. Please verify N8N_BASE_URL" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  N8N_BASE_URL not set in .env" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: All done!
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify your .env configuration"
Write-Host "2. Make sure your PostgreSQL database is running"
Write-Host "3. Import the n8n workflow JSON file into your n8n instance"
Write-Host "4. Run 'npm run dev' to start the development server"
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  npm run dev        - Start development server"
Write-Host "  npm run build      - Build for production"
Write-Host "  npm run db:studio  - Open Prisma Studio (database GUI)"
Write-Host "  npm run db:push    - Push schema changes to database"
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
