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

echo ""
echo "🎉 Project Hydrogen setup completed successfully!"
echo ""
echo "To run Project Hydrogen with Claude Code CLI:"
echo "  npx @anthropic-ai/claude-code --dangerously-skip-permissions --model hydrogen"
echo "Or use the custom CLI wrapper:"
echo "  npm start"
