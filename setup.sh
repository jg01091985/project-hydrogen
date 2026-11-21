#!/usr/bin/env bash
set -e

echo "🚀 Setting up Project Hydrogen..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v18+ recommended) before running this script."
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Found Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Optional Linux/WSL2 browser dependencies check/install
if [[ "$OSTYPE" == "linux-gnu"* ]] || grep -qEi "(microsoft|wsl)" /proc/version &> /dev/null; then
    echo "🐧 Linux/WSL2 environment detected. Ensuring headless browser dependencies..."
    sudo apt-get update && sudo apt-get install -y chromium-browser libgbm-dev libnss3 libatk-bridge2.0-0 libcups2 libxcomposite1 libxdamage1 libxrandr2 libxi6 libxtst6 libasound2 || echo "⚠️ Non-root or non-apt environment detected; skipping apt install."
fi

echo ""
echo "🎉 Project Hydrogen setup completed successfully!"
echo ""
echo "To run Project Hydrogen with Claude Code CLI:"
echo "  export HEADLESS=true"
echo "  npx @anthropic-ai/claude-code --dangerously-skip-permissions --model hydrogen"
echo "Or start the proxy server:"
echo "  npm start"
