# Cloudflare Deployment Script for Windows PowerShell

Write-Host "🚀 Nutrition Tracker - Cloudflare Deployment" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if wrangler is installed
Write-Host "Checking for Wrangler CLI..." -ForegroundColor Yellow
if (!(Get-Command wrangler -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Wrangler CLI not found. Installing..." -ForegroundColor Red
    npm install -g wrangler
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Wrangler. Please install manually: npm install -g wrangler" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Wrangler CLI found" -ForegroundColor Green
Write-Host ""

# Check if logged in
Write-Host "Checking Cloudflare authentication..." -ForegroundColor Yellow
wrangler whoami 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Not logged in to Cloudflare. Opening browser for authentication..." -ForegroundColor Yellow
    wrangler login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to authenticate. Please run 'wrangler login' manually." -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Authenticated with Cloudflare" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Check if database exists
Write-Host "Checking D1 database..." -ForegroundColor Yellow
$dbList = wrangler d1 list 2>&1 | Out-String
if ($dbList -notmatch "nutrition-tracker-db") {
    Write-Host "⚠️  Database not found. Creating..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Creating D1 database 'nutrition-tracker-db'..." -ForegroundColor Cyan
    $dbOutput = wrangler d1 create nutrition-tracker-db 2>&1 | Out-String
    Write-Host $dbOutput
    
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Copy the database_id from above and update wrangler.toml" -ForegroundColor Yellow
    Write-Host "Press Enter after you've updated wrangler.toml with the database_id..." -ForegroundColor Yellow
    Read-Host
}
Write-Host "✅ Database exists" -ForegroundColor Green
Write-Host ""

# Initialize database schema
Write-Host "Initializing database schema..." -ForegroundColor Yellow
wrangler d1 execute nutrition-tracker-db --file=./schema.sql
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to initialize database schema" -ForegroundColor Red
    Write-Host "Make sure you've updated the database_id in wrangler.toml" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Database schema initialized" -ForegroundColor Green
Write-Host ""

# Check for JWT secret
Write-Host "Checking for JWT_SECRET..." -ForegroundColor Yellow
$secretList = wrangler secret list 2>&1 | Out-String
if ($secretList -notmatch "JWT_SECRET") {
    Write-Host "⚠️  JWT_SECRET not found. Setting it now..." -ForegroundColor Yellow
    Write-Host "Enter a strong JWT secret (or press Enter to generate one):" -ForegroundColor Cyan
    $jwtSecret = Read-Host
    if ([string]::IsNullOrWhiteSpace($jwtSecret)) {
        # Generate random secret
        $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
        Write-Host "Generated secret: $jwtSecret" -ForegroundColor Green
    }
    $jwtSecret | wrangler secret put JWT_SECRET
}
Write-Host "✅ JWT_SECRET configured" -ForegroundColor Green
Write-Host ""

# Deploy
Write-Host "🚀 Deploying to Cloudflare Workers..." -ForegroundColor Cyan
npm run deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Your API is now live at:" -ForegroundColor Cyan
Write-Host "https://nutrition-tracker-api.<your-subdomain>.workers.dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy your API URL from the deployment output above" -ForegroundColor White
Write-Host "2. Update your frontend .env file with: VITE_API_URL=<your-api-url>" -ForegroundColor White
Write-Host "3. Redeploy your Netlify frontend" -ForegroundColor White
Write-Host ""
Write-Host "Test your API:" -ForegroundColor Cyan
Write-Host "curl https://nutrition-tracker-api.<your-subdomain>.workers.dev/health" -ForegroundColor White
Write-Host ""
