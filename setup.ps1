Write-Host "🚀 Setting up Project Hydrogen..." -ForegroundColor Cyan

# Check Node.js
if (!(Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js (v18+ recommended) from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

$nodeVersion = node -v
Write-Host "✅ Found Node.js version: $nodeVersion" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing project dependencies..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "🎉 Project Hydrogen setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "To run Project Hydrogen on Windows:" -ForegroundColor Yellow
Write-Host "  $env:HEADLESS=`"true`"" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
