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
Write-Host "To run Project Hydrogen with Claude Code CLI:" -ForegroundColor Yellow
Write-Host "  npx @anthropic-ai/claude-code --dangerously-skip-permissions --model hydrogen" -ForegroundColor White
Write-Host "Or use the custom CLI wrapper:" -ForegroundColor Yellow
Write-Host "  npm start" -ForegroundColor White
